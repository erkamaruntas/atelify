// Atelify stüdyo — cloud-sync
// Stüdyo durumunun Supabase ile senkronu ve arşivlenmiş tasarımlar.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function canSyncCloudStudioState() {
  return Boolean(
    cloudStateSyncEnabled &&
    cloudStateHydrated &&
    !isApplyingCloudState &&
    studioSupabase &&
    currentUserId
  );
}

function scheduleCloudStudioStateSync(delay = CLOUD_STATE_SYNC_DELAY) {
  if (!canSyncCloudStudioState()) return;

  window.clearTimeout(cloudStateSyncTimer);
  cloudStateSyncTimer = window.setTimeout(flushCloudStudioStateSync, Math.max(0, delay));
}

async function flushCloudStudioStateSync() {
  if (!canSyncCloudStudioState()) return;
  if (cloudStateSyncInFlight) {
    cloudStateSyncQueued = true;
    return;
  }

  window.clearTimeout(cloudStateSyncRetryTimer);
  cloudStateSyncInFlight = true;
  cloudStateSyncQueued = false;

  try {
    await withTimeout(
      pushCloudStudioState(),
      STUDIO_SYNC_TIMEOUT_MS,
      "Bulut proje kaydı zaman aşımına uğradı."
    );
    hideCloudSyncWarning();
  } catch (error) {
    handleCloudStudioStateError(error);
  } finally {
    cloudStateSyncInFlight = false;
    if (cloudStateSyncQueued) {
      scheduleCloudStudioStateSync();
    }
  }
}

function scheduleCloudStudioStateRetry() {
  if (!canSyncCloudStudioState()) return;

  window.clearTimeout(cloudStateSyncRetryTimer);
  cloudStateSyncRetryTimer = window.setTimeout(flushCloudStudioStateSync, CLOUD_STATE_SYNC_RETRY_DELAY);
}

function scheduleCloudStudioStateReadRetry(supabase, session) {
  if (!supabase || !currentUserId) return;

  window.clearTimeout(cloudStateSyncRetryTimer);
  cloudStateSyncRetryTimer = window.setTimeout(() => {
    initializeCloudStudioStateSync(supabase, session).catch((error) => {
      showCloudSyncWarning(
        `Bulut verisi hâlâ okunamadı; boş yerel veri buluta yazılmadı.`
      );
      console.warn("[sync] Supabase studio state read retry failed.", error);
      scheduleCloudStudioStateReadRetry(supabase, session);
    });
  }, CLOUD_STATE_SYNC_RETRY_DELAY);
}

async function initializeCloudStudioStateSync(supabase, session) {
  studioSupabase = supabase;
  cloudStateSyncEnabled = false;
  cloudStateHydrated = false;
  window.clearTimeout(cloudStateSyncTimer);
  let verifiedSession = session;

  try {
    const {
      data: { user },
      error,
    } = await withTimeout(
      supabase.auth.getUser(),
      STUDIO_AUTH_TIMEOUT_MS,
      "Oturum doğrulaması zaman aşımına uğradı."
    );

    if (error || !user?.id) {
      currentUserId = session?.user?.id || "";
      currentUserCreatedAtMs = sessionUserCreatedAtValue(session);
    } else {
      currentUserId = user.id;
      currentUserCreatedAtMs = sessionUserCreatedAtValue({ user });
      verifiedSession = { user };
    }
  } catch {
    currentUserId = session?.user?.id || "";
    currentUserCreatedAtMs = sessionUserCreatedAtValue(session);
  }

  if (!currentUserId) {
    showCloudSyncWarning("Bulut senkronu için oturum doğrulanamadı. Projeler bu tarayıcıda kalabilir.");
    return;
  }

  configureStudioStorageForUser(currentUserId);
  cleanScopedStudioStorageForSession(verifiedSession);
  recoverLegacyStudioStorageForCurrentUser(verifiedSession);

  try {
    const cloudState = await withTimeout(
      readCloudStudioState(),
      STUDIO_SYNC_TIMEOUT_MS,
      "Bulut proje verisi zaman aşımına uğradı."
    );
    const filteredCloudState = filterCloudStudioStateForCurrentUser(cloudState);
    const mergedProjectDeletions = mergeProjectDeletions(
      readProjectDeletions(),
      filterProjectDeletionsFromProjects(filteredCloudState.projects)
    );
    writeProjectDeletions(mergedProjectDeletions);

    const cloudProjects = filterDeletedProjects(filteredCloudState.projects, mergedProjectDeletions);
    const localProjects = filterDeletedProjects(readProjects(), mergedProjectDeletions);
    const compactCloudState = compactCloudStudioState({
      projects: cloudProjects,
      projectDeletions: mergedProjectDeletions,
      savedDesigns: filteredCloudState.savedDesigns,
    });
    const mergedProjects = filterDeletedProjects(
      mergeProjects(localProjects, filterActiveProjects(compactCloudState.projects)),
      mergedProjectDeletions
    );
    const mergedSavedDesigns = mergeSavedDesigns(readSavedDesigns(), compactCloudState.savedDesigns);

    isApplyingCloudState = true;
    writeProjects(mergedProjects);
    writeSavedDesigns(mergedSavedDesigns);
    isApplyingCloudState = false;

    renderProjects(mergedProjects);
    renderSavedDesigns(mergedSavedDesigns);
    if (activeProjectId) {
      const activeProject = mergedProjects.find((project) => project.id === activeProjectId);
      if (activeProject) {
        restoreProjectState(activeProject);
        updateActiveProjectHeader(activeProject);
      } else {
        studioStore.clearActiveProjectId(activeProjectId);
        activeProjectId = "";
      }
    }
    hideCloudSyncWarning();
    cloudStateHydrated = true;
    cloudStateSyncEnabled = true;
    scheduleCloudStudioStateSync(0);
  } catch (error) {
    isApplyingCloudState = false;
    cloudStateHydrated = false;
    cloudStateSyncEnabled = false;
    showCloudSyncWarning(
      `Bulut verisi gecikti. Boş yerel veri buluta yazılmadı; okuma arka planda tekrar denenecek.`
    );
    console.warn("[sync] Supabase studio state read failed; background sync will retry.", error);
    scheduleCloudStudioStateReadRetry(supabase, verifiedSession);
  }
}

async function readCloudStudioState() {
  if (!studioSupabase || !currentUserId) return { creditWallet: null, projects: [], savedDesigns: [] };

  const { data, error } = await studioSupabase
    .from(REMOTE_STUDIO_STATE_TABLE)
    .select("projects,saved_designs")
    .eq("user_id", currentUserId)
    .limit(1);

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : null;
  return {
    creditWallet: null,
    projects: Array.isArray(row?.projects) ? row.projects : [],
    savedDesigns: Array.isArray(row?.saved_designs) ? row.saved_designs : [],
  };
}

async function pushCloudStudioState(state = {}) {
  if (!studioSupabase || !currentUserId) return;

  const localProjectDeletions = mergeProjectDeletions(readProjectDeletions(), state.projectDeletions || []);
  let localProjects = filterDeletedProjects(state.projects || readProjects(), localProjectDeletions);
  const localSavedDesigns = state.savedDesigns || readSavedDesigns();

  // Çok cihazlı ezmeyi önle: tüm projects dizisini körlemesine üzerine yazmak,
  // başka bir cihazın bu cihazın son okumasından sonra eklediği projeleri siler.
  // Yazmadan önce buluttaki güncel hali tekrar okuyup silme-farkında birleştir.
  let remoteProjects = [];
  let remoteProjectDeletions = [];
  let remoteSavedDesigns = [];
  try {
    const remoteState = filterCloudStudioStateForCurrentUser(await readCloudStudioState());
    remoteProjectDeletions = filterProjectDeletionsFromProjects(remoteState.projects);
    remoteProjects = filterActiveProjects(remoteState.projects);
    remoteSavedDesigns = remoteState.savedDesigns;
  } catch (error) {
    console.warn("[sync] pre-push cloud read failed; cloud write postponed.", error);
    throw error;
  }

  const mergedProjectDeletions = mergeProjectDeletions(localProjectDeletions, remoteProjectDeletions);
  writeProjectDeletions(mergedProjectDeletions);
  localProjects = filterDeletedProjects(localProjects, mergedProjectDeletions);
  remoteProjects = filterDeletedProjects(remoteProjects, mergedProjectDeletions);

  // Tombstone filtresinden geçen her uzak proje korunur; yerelde olmaması silme
  // anlamına gelmez, başka cihazda eklenmiş ya da localStorage'dan düşmüş olabilir.
  const localProjectIds = new Set(localProjects.map((project) => project?.id).filter(Boolean));
  const reconcilableRemoteProjects = remoteProjects.filter((project) => {
    const id = project?.id;
    if (!id) return false;
    if (localProjectIds.has(id)) return true;
    return true;
  });
  const mergedProjects = filterDeletedProjects(
    mergeProjects(localProjects, reconcilableRemoteProjects),
    mergedProjectDeletions
  );

  const cloudState = compactCloudStudioState({
    projects: mergedProjects,
    projectDeletions: mergedProjectDeletions,
    savedDesigns: mergeSavedDesigns(localSavedDesigns, remoteSavedDesigns),
  });
  const payload = {
    projects: cloudState.projects,
    saved_designs: cloudState.savedDesigns,
    updated_at: new Date().toISOString(),
    user_id: currentUserId,
  };

  const { error } = await studioSupabase
    .from(REMOTE_STUDIO_STATE_TABLE)
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}

function compactCloudStudioState(state = {}) {
  const projectDeletions = mergeProjectDeletions(
    state.projectDeletions || [],
    filterProjectDeletionsFromProjects(state.projects)
  );
  const deletedProjectIds = projectDeletionIds(projectDeletions);
  const projects = sanitizeProjectList(filterActiveProjects(state.projects || []))
    .filter((project) => !deletedProjectIds.has(project.id))
    .map((project) => ({ ...project, ...currentStudioOwnerFields() }))
    .map((project) => compactCloudValue(project))
    .filter(Boolean);
  const savedDesigns = sanitizeSavedDesignList(state.savedDesigns || [])
    .map((design) => ({ ...design, ...currentStudioOwnerFields() }))
    .map((design) => compactCloudValue(design))
    .filter((design) => design && (isSavedDesignLoading(design) || cloudSafeImageUrl(design.imageUrl)));

  return { projects: [...projects, ...projectDeletions], savedDesigns };
}

function filterCloudStudioStateForCurrentUser(state = {}) {
  return {
    projects: filterOwnedCloudItems(state.projects),
    savedDesigns: filterOwnedCloudItems(state.savedDesigns),
  };
}

function filterOwnedCloudItems(items) {
  if (!currentUserId) return [];
  return (Array.isArray(items) ? items : []).filter((item) => {
    const ownerUserId = String(item?.ownerUserId || item?.userId || "").trim();
    return ownerUserId && ownerUserId === currentUserId && !isItemFromBeforeCurrentUser(item);
  });
}

async function hydrateArchivedDesigns() {
  if (!studioSupabase || !currentUserId) return;

  const { payload, response } = await studioApi.listDesigns({ sinceDays: 365 });
  if (!response.ok) {
    throw new Error(payload.error || "Kalıcı tasarım arşivi okunamadı.");
  }

  const archivedDesigns = mapArchivedDesignRows(payload.designs);
  if (!archivedDesigns.length) return;

  const mergedSavedDesigns = mergeSavedDesigns(readSavedDesigns(), archivedDesigns);
  writeSavedDesigns(mergedSavedDesigns);
  renderSavedDesigns(mergedSavedDesigns);
}

function mapArchivedDesignRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map(mapArchivedDesignRow)
    .filter(Boolean);
}

function mapArchivedDesignRow(row = {}) {
  const assets = Array.isArray(row.assets) ? row.assets : [];
  const asset = assets
    .slice()
    .sort((left, right) => normalizeCreditNumber(left.position) - normalizeCreditNumber(right.position))
    .find((candidate) => candidate?.public_url || candidate?.storage_path);
  const imageUrl = safePersistedImageUrl(asset?.public_url || "", "imageUrl");
  if (!imageUrl) return null;

  const stage = String(row.stage || "sketch").trim();
  const designMode = String(row.design_mode || "").trim();
  const productValue = String(row.product || "").trim();
  const productShapeValue = String(row.product_shape || "").trim();
  // project_id sütunu UUID kısıtı yüzünden boş kalabilir; üretildiği projeyi
  // metadata içinden geri al (recordGeneratedDesigns kimlik+adı oraya yazıyor).
  const rowMetadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  const projectId = String(row.project_id || "").trim() || String(rowMetadata.projectId || "").trim();
  const metaProjectTitle = String(rowMetadata.projectTitle || "").trim();
  // Ürün/şekil profilini satırdan taşı; aksi halde 2. ve 3. aşamadaki
  // "tasarımlarımdan seç" listesi profil eşleşmesi bulamayıp tasarımı eler.
  const profileFields = designProfileFieldsFromSource({
    designModeValue: designMode,
    productShapeValue,
    productValue,
    shapeValue: productShapeValue,
  });
  return {
    ...currentStudioOwnerFields(),
    ...profileFields,
    archiveDesignId: String(row.id || "").trim(),
    autoSaved: true,
    createdAt: validIsoDate(row.created_at) || new Date().toISOString(),
    generatedBy: "ai",
    generationJobId: String(row.client_job_id || "").trim(),
    id: `archive-${row.id || imageUrl}`,
    imageUrl,
    isLoading: false,
    pendingIndex: Number.isFinite(Number(asset?.position)) ? Number(asset.position) : null,
    pendingJobId: "",
    projectId,
    projectTitle: metaProjectTitle || projectTitleById(projectId) || "",
    sourceFileName: "",
    sourceImageUrl: "",
    sourceStage: stage,
    sourceTitle: "",
    stage: savedDesignStageLabel(stage),
    status: "ready",
    surfaceLabel: DESIGN_MODE_OPTIONS[designMode]?.surfaceLabel || "",
    surfaceValue: designMode,
    title: String(row.title || "").trim() || savedDesignStageLabel(stage),
  };
}

function compactCloudValue(value, key = "") {
  if (Array.isArray(value)) {
    return value
      .map((item) => compactCloudValue(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((accumulator, [entryKey, entryValue]) => {
      const compactValue = compactCloudValue(entryValue, entryKey);
      if (compactValue !== undefined) accumulator[entryKey] = compactValue;
      return accumulator;
    }, {});
  }

  if (typeof value === "string" && isCloudImageUrlKey(key)) {
    return cloudSafeImageUrl(value);
  }

  return value;
}

function isCloudImageUrlKey(key) {
  const normalizedKey = String(key || "").toLowerCase();
  return (
    normalizedKey === "url" ||
    normalizedKey.endsWith("imageurl") ||
    normalizedKey.endsWith("previewurl") ||
    normalizedKey.endsWith("thumbnailurl") ||
    normalizedKey.endsWith("sketchurl") ||
    normalizedKey.endsWith("formurl") ||
    normalizedKey.endsWith("sourceurl") ||
    normalizedKey.endsWith("storageurl") ||
    normalizedKey.endsWith("mockupurl") ||
    normalizedKey === "imagedataurl"
  );
}

function cloudSafeImageUrl(value) {
  const imageUrl = String(value || "").trim();
  if (!imageUrl || imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) return "";
  return imageUrl.length <= 12000 ? imageUrl : "";
}

async function finalizeGenerationDelivery(job = {}) {
  const clientJobId = String(job.id || job.clientJobId || "").trim();
  if (!clientJobId || !studioSupabase || !currentUserId) return false;

  try {
    await markGenerationDelivered(clientJobId);
    scheduleCloudStudioStateSync();
    return true;
  } catch (error) {
    showCloudSyncWarning(
      `Üretilen görsel bu tarayıcıda kaydedildi ama bulut teslim işareti tamamlanamadı.`
    );
    console.warn("[generation-recovery] delivery finalize failed.", error);
    scheduleCloudStudioStateSync();
    return false;
  }
}

async function markGenerationDelivered(clientJobId) {
  const headers = await authHeaders();
  if (!headers.Authorization) return false;

  const { payload, response } = await studioApi.markGenerationDelivered(clientJobId);
  if (!response.ok) {
    throw new Error(payload.error || "Üretim teslim işareti kaydedilemedi.");
  }
  return true;
}

function handleCloudStudioStateError(error) {
  showCloudSyncWarning(
    `Bulut senkronu gecikti. Son değişiklikler bu cihazda duruyor; arka planda tekrar denenecek.`
  );
  console.warn("[sync] Supabase studio state sync failed.", error);
  scheduleCloudStudioStateRetry();
}

function showCloudSyncWarning(message) {
  const main = document.querySelector("main");
  if (!main) return;

  let warning = document.querySelector("[data-cloud-sync-warning]");
  if (!warning) {
    warning = document.createElement("div");
    warning.dataset.cloudSyncWarning = "1";
    warning.setAttribute("role", "status");
    warning.className = "studio-notice"; // stil: studio-theme.css
    main.prepend(warning);
  }

  warning.textContent = message;
}

function hideCloudSyncWarning() {
  document.querySelector("[data-cloud-sync-warning]")?.remove();
}

function mergeProjects(localProjects = [], cloudProjects = []) {
  return studioStore.mergeProjects(localProjects, cloudProjects);
}

function mergeSavedDesigns(localDesigns = [], cloudDesigns = []) {
  return studioStore.mergeSavedDesigns(localDesigns, cloudDesigns);
}

function sanitizeProjectList(projects) {
  return studioStore.sanitizeProjects(projects);
}

function sanitizeSavedDesignList(designs) {
  return studioStore.sanitizeSavedDesigns(designs);
}

function renderSavedDesigns(designs = readSavedDesigns()) {
  const sourceDesigns = prunedPendingSavedDesigns(Array.isArray(designs) ? designs : []).map(enrichSavedDesignDisplayMetadata);
  const realDesigns = sourceDesigns.filter((d) => !isSavedDesignLoading(d)).slice(0, SAVED_DESIGN_LIMIT);
  const gridDesigns = sourceDesigns.slice(0, SAVED_DESIGN_LIMIT);
  savedDesignsPage.render(gridDesigns);
  overviewPage.renderRecentDesigns(realDesigns);
  renderOrderDesignGallery();
}

function enrichSavedDesignDisplayMetadata(design = {}) {
  if (!design || typeof design !== "object") return design;
  const projectId = String(design.projectId || "").trim();
  return {
    ...design,
    projectId,
    projectTitle: design.projectTitle || projectTitleById(projectId) || "",
  };
}
