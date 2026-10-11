// Atelify stüdyo — generation-jobs
// Sunucu üretim işleri: gönderme, sorgulama (poll), kurtarma ve geliştirici modu.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function sketchApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/sketch" : "/api/sketch";
}

function designsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/designs" : "/api/designs";
}

function finishApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/finish" : "/api/finish";
}

function mockupApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/mockup" : "/api/mockup";
}

function generationStatusApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/generation-status" : "/api/generation-status";
}

function recoverGenerationsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/recover-generations" : "/api/recover-generations";
}

function generationDeliveredApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/generation-delivered" : "/api/generation-delivered";
}

function createGenerationJob({ count, creditCost, label, metadata = {}, stage }) {
  flushProjectSave();
  const projectId = activeProjectId || "";
  const projectTitle = projectTitleById(projectId);

  return {
    count: normalizeCreditNumber(count, 1),
    createdAt: new Date().toISOString(),
    creditCost: normalizeCreditNumber(creditCost),
    id: `ff-generation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    metadata: {
      ...metadata,
      projectId,
      projectTitle,
    },
    projectId,
    projectTitle,
    requestId: "",
    stage,
    status: "submitting",
  };
}

function generationResultTimestamp(job = {}, payload = {}) {
  return (
    validIsoDate(payload.generatedAt || payload.completedAt || payload.createdAt || "") ||
    validIsoDate(job.completedAt || job.updatedAt || "") ||
    new Date().toISOString()
  );
}

function readPendingGenerations() {
  const jobs = studioStore.readPendingGenerations();
  return jobs.map(sanitizePendingGeneration).filter(Boolean).filter((job) => !isPendingGenerationStale(job));
}

function writePendingGenerations(jobs) {
  return studioStore.writePendingGenerations(jobs.map(sanitizePendingGeneration).filter(Boolean));
}

function sanitizePendingGeneration(job) {
  if (!job || typeof job !== "object") return null;
  const stage = ["sketch", "finish", "mockup", "manken"].includes(job.stage) ? job.stage : "";
  const id = String(job.id || "").trim();
  if (!stage || !id) return null;
  return {
    count: normalizeCreditNumber(job.count, 1),
    createdAt: validIsoDate(job.createdAt) || new Date().toISOString(),
    creditCost: normalizeCreditNumber(job.creditCost),
    id,
    label: String(job.label || "Görsel oluşturma").trim(),
    metadata: compactPersistedValue(job.metadata && typeof job.metadata === "object" ? job.metadata : {}),
    projectId: String(job.projectId || "").trim(),
    projectTitle: String(job.projectTitle || job.metadata?.projectTitle || "").trim(),
    requestId: String(job.requestId || "").trim(),
    stage,
    status: String(job.status || "submitting").trim(),
  };
}

function upsertPendingGeneration(job) {
  const sanitizedJob = sanitizePendingGeneration(job);
  if (!sanitizedJob) return null;
  const jobs = readPendingGenerations().filter((item) => item.id !== sanitizedJob.id);
  writePendingGenerations([sanitizedJob, ...jobs]);
  return sanitizedJob;
}

function removePendingGeneration(jobId) {
  writePendingGenerations(readPendingGenerations().filter((job) => job.id !== jobId));
}

function pendingGenerationByStage(stage) {
  return readPendingGenerations().find((job) => (
    job.stage === stage && isPendingGenerationActive(job)
  )) || null;
}

function isPendingGenerationActive(job) {
  return Boolean(job?.requestId) || ["submitting", "queued", "running"].includes(job?.status);
}

function isPendingGenerationStale(job) {
  const createdAt = new Date(job?.createdAt || "").getTime();
  if (!Number.isFinite(createdAt)) return true;

  const age = Date.now() - createdAt;
  if (!job.requestId && job.status === "submitting") {
    return age > PENDING_SUBMITTING_MAX_AGE_MS;
  }
  return age > PENDING_GENERATION_MAX_AGE_MS;
}

function prunePendingGenerations() {
  const storedJobs = studioStore.readPendingGenerations()
    .map(sanitizePendingGeneration)
    .filter(Boolean);
  const freshJobs = storedJobs.filter((job) => !isPendingGenerationStale(job));
  const staleJobIds = storedJobs
    .filter((job) => isPendingGenerationStale(job))
    .map((job) => job.id);
  if (freshJobs.length !== storedJobs.length) {
    writePendingGenerations(freshJobs);
    staleJobIds.forEach(removePendingSavedDesigns);
  }
  return freshJobs;
}

async function submitGenerationJob({ apiUrl, job, requestPayload }) {
  ensurePendingSavedDesignsForJob(job);
  upsertPendingGeneration(job);
  const { payload, response } = await studioApi.submitGeneration({
    apiUrl,
    job,
    jobContext: generationJobContext(job),
    requestPayload,
  });
  applyCreditBalanceSnapshot(payload);

  if (!response.ok) {
    removePendingGeneration(job.id);
    throw new Error(payload.error || "Görsel oluşturma başlatılamadı.");
  }

  refreshCreditWallet({ silent: true }).catch((error) => {
    console.warn("[credits] refresh after generation submit failed.", error);
  });

  const requestId = payload.requestId || payload.request_id || "";
  if (!requestId && !Array.isArray(payload.images) && payload.pending !== true) {
    removePendingGeneration(job.id);
    throw new Error("Görsel oluşturma request id döndürmedi.");
  }

  if (requestId || payload.pending === true) {
    job = {
      ...job,
      requestId,
      status: requestId ? "queued" : "submitting",
    };
    upsertPendingGeneration(job);
    activeGenerationPolls.add(job.id);
    try {
      return {
        job,
        payload: await pollGenerationJob(job),
      };
    } finally {
      activeGenerationPolls.delete(job.id);
    }
  }

  removePendingGeneration(job.id);
  return { job, payload };
}

async function pollGenerationJob(job) {
  let sanitizedJob = sanitizePendingGeneration(job);
  if (!sanitizedJob?.id) throw new Error("Takip edilecek üretim job id bulunamadı.");
  const startedAt = Date.now();

  while (Date.now() - startedAt < GENERATION_POLL_TIMEOUT_MS) {
    if (isPendingGenerationStale(sanitizedJob)) {
      removePendingGeneration(sanitizedJob.id);
      throw new Error("Yarım kalan görsel oluşturma isteği zaman aşımına uğradı. Yeni bir deneme başlatabilirsin.");
    }

    const { payload, response } = await studioApi.readGenerationStatus({
      clientJobId: sanitizedJob.id,
      count: sanitizedJob.count,
      requestId: sanitizedJob.requestId,
      stage: sanitizedJob.stage,
    });
    applyCreditBalanceSnapshot(payload);

    if (!response.ok) {
      if (payload.status === "failed" || payload.status === "cancelled") {
        removePendingGeneration(sanitizedJob.id);
        refreshCreditWallet({ silent: true }).catch((error) => {
          console.warn("[credits] refresh after failed generation failed.", error);
        });
        throw new Error(payload.error || "Görsel oluşturma tamamlanamadı.");
      }
      // 404: üretim kaydı sunucuda artık yok (teslim edilmiş/temizlenmiş). Bunu
      // tekrar denemek 10 dk timeout'a kadar spinner'ı sonsuza kadar döndürüyordu;
      // kaydı temizleyip akışı bitir.
      if (response.status === 404) {
        removePendingGeneration(sanitizedJob.id);
        throw new Error(payload.error || "Üretim kaydı bulunamadı.");
      }
      await delay(GENERATION_POLL_INTERVAL_MS);
      continue;
    }

    if (payload.requestId && payload.requestId !== sanitizedJob.requestId) {
      sanitizedJob = {
        ...sanitizedJob,
        requestId: payload.requestId,
        status: payload.status || sanitizedJob.status,
      };
      upsertPendingGeneration(sanitizedJob);
    }

    if (payload.status === "completed") {
      removePendingGeneration(sanitizedJob.id);
      return payload;
    }

    if (payload.status === "failed" || payload.status === "cancelled") {
      removePendingGeneration(sanitizedJob.id);
      refreshCreditWallet({ silent: true }).catch((error) => {
        console.warn("[credits] refresh after failed generation failed.", error);
      });
      throw new Error(payload.error || "Görsel oluşturma tamamlanamadı.");
    }

    await delay(GENERATION_POLL_INTERVAL_MS);
  }

  throw new Error("Görsel oluşturma beklenenden uzun sürdü. Sayfayı yenilersen işlem sonucu tekrar kontrol edilir.");
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function restorePendingGenerations(earlyFetch = null) {
  recoverServerGenerations(earlyFetch).catch((error) => {
    console.warn("[generation-recovery] server recovery failed.", error);
  });

  syncVisiblePendingGenerations({ resume: true });
}

function prefetchRecoveryGenerations() {
  return authHeaders().then((headers) => {
    if (!headers.Authorization) return null;
    return fetch(recoverGenerationsApiUrl(), { cache: "no-store", headers, method: "GET" });
  }).catch(() => null);
}

async function recoverServerGenerations(earlyFetch = null) {
  let response;
  let payload;
  if (earlyFetch) {
    response = await earlyFetch;
    if (!response) return;
  } else {
    const headers = await authHeaders();
    if (!headers.Authorization) return;
    const recovered = await studioApi.recoverGenerations();
    response = recovered.response;
    if (response.ok) {
      const recoveries = Array.isArray(recovered.payload.jobs) ? recovered.payload.jobs : [];
      for (const recovery of recoveries) {
        await handleRecoveredGeneration(recovery);
      }
      return;
    }
    payload = recovered.payload;
  }

  payload ||= await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Yarım kalan görsel üretimleri kontrol edilemedi.");
  }

  const recoveries = Array.isArray(payload.jobs) ? payload.jobs : [];
  for (const recovery of recoveries) {
    await handleRecoveredGeneration(recovery);
  }
}

async function handleRecoveredGeneration(recovery) {
  const pendingJob = pendingJobFromRecoveredGeneration(recovery);
  if (!pendingJob?.id || activeGenerationPolls.has(pendingJob.id)) return;

  if (pendingJob.projectId) {
    ensureProjectRecord(pendingJob.projectId, {
      createdAt: pendingJob.createdAt,
      title: generationProjectTitle(pendingJob),
    });
  }

  const projectExists =
    pendingJob.projectId && readProjects().some((project) => project.id === pendingJob.projectId);

  if (recovery?.status === "completed" && Array.isArray(recovery.payload?.images) && recovery.payload.images.length) {
    if (recoveredImagesAlreadySaved(recovery.payload.images)) {
      // Görseller zaten arşive kaydedilmiş; yeniden kaydetmeden yalnızca teslim
      // işaretini tamamlıyoruz. Ancak bekleyen kayıt ile aşamanın yükleniyor
      // kartı temizlenmezse, sonuç hazır olduğu halde spinner dönmeye devam
      // ediyordu. Kayıtları temizleyip aktif projeyse sonucu workspace'e bas.
      removePendingSavedDesigns(pendingJob.id);
      removePendingGeneration(pendingJob.id);
      if (isGenerationForActiveProject(pendingJob)) {
        removeResultLoading(resultLoadingStageKey(pendingJob.stage), { stage: pendingJob.stage });
        stopGenerationState(pendingJob.stage);
      }
      await finalizeGenerationDelivery(pendingJob);
      return;
    }

    activeGenerationPolls.add(pendingJob.id);
    try {
      if (projectExists && pendingJob.projectId !== activeProjectId) {
        openProject(pendingJob.projectId, { scroll: false, updateHash: false });
      }

      removePendingGeneration(pendingJob.id);
      await completeGenerationJob(pendingJob, recovery.payload, { recovered: true });
    } finally {
      activeGenerationPolls.delete(pendingJob.id);
    }
    return;
  }

  if (recovery?.status === "failed" || recovery?.status === "cancelled") {
    removePendingGeneration(pendingJob.id);
    removePendingSavedDesigns(pendingJob.id);
    applyCreditBalanceSnapshot(recovery);
    applyCreditBalanceSnapshot(recovery.payload);
    refreshCreditWallet({ silent: true }).catch((error) => {
      console.warn("[credits] refresh after recovered failed generation failed.", error);
    });
    if (isGenerationForActiveProject(pendingJob)) {
      removeResultLoading(resultLoadingStageKey(pendingJob.stage), { stage: pendingJob.stage });
      stopGenerationState(pendingJob.stage);
      creditStageStatusSetter(pendingJob.stage)(
        recovery.error || "Yarım kalan görsel oluşturma tamamlanamadı.",
        "error"
      );
    }
    return;
  }

  if (recovery?.pending || ["submitting", "queued", "running"].includes(pendingJob.status)) {
    upsertPendingGeneration(pendingJob);
    activeGenerationPolls.add(pendingJob.id);
    if (projectExists && pendingJob.projectId !== activeProjectId) {
      openProject(pendingJob.projectId, { scroll: false, updateHash: false });
    }
    resumePendingGeneration(pendingJob).finally(() => activeGenerationPolls.delete(pendingJob.id));
  }
}

function recoveredImagesAlreadySaved(images) {
  const imageUrls = (Array.isArray(images) ? images : [])
    .map((image) => String(image?.url || "").trim())
    .filter(Boolean);
  if (!imageUrls.length) return false;

  const savedImageUrls = new Set(readSavedDesigns().map((design) => design.imageUrl).filter(Boolean));
  return imageUrls.every((imageUrl) => savedImageUrls.has(imageUrl));
}

function pendingJobFromRecoveredGeneration(recovery) {
  const sourceJob = recovery?.job && typeof recovery.job === "object" ? recovery.job : recovery;
  if (!sourceJob || typeof sourceJob !== "object") return null;

  const stage = ["sketch", "finish", "mockup", "manken"].includes(sourceJob.stage) ? sourceJob.stage : "";
  const count = normalizeCreditNumber(sourceJob.count, 1);
  return sanitizePendingGeneration({
    count,
    createdAt: sourceJob.createdAt,
    creditCost: normalizeCreditNumber(sourceJob.creditCost),
    id: sourceJob.clientJobId || sourceJob.id || "",
    label: sourceJob.label || defaultGenerationLabel(stage, count),
    metadata: sourceJob.metadata || {},
    projectId: sourceJob.projectId || sourceJob.metadata?.projectId || "",
    projectTitle: sourceJob.projectTitle || sourceJob.metadata?.projectTitle || "",
    requestId: sourceJob.requestId || recovery?.payload?.requestId || "",
    stage,
    status: recovery?.status || sourceJob.status || "queued",
  });
}

function defaultGenerationLabel(stage, count = 1) {
  const safeCount = normalizeCreditNumber(count, 1);
  if (stage === "finish") return `${safeCount} ürün görseli oluşturma`;
  if (stage === "manken") return `${safeCount} manken oluşturma`;
  if (stage === "mockup") return `${safeCount} mockup oluşturma`;
  return `${safeCount} tasarım görseli oluşturma`;
}

function activePendingGenerations() {
  return prunePendingGenerations()
    .filter(isPendingGenerationActive);
}

function visiblePendingGenerations(jobs = activePendingGenerations()) {
  return jobs.filter(shouldShowPendingGenerationState);
}

function syncVisiblePendingGenerations(options = {}) {
  const jobs = activePendingGenerations();
  visiblePendingGenerations(jobs).forEach(showPendingGenerationState);

  if (options.resume === false) return jobs;

  jobs.forEach((job) => {
    if (activeGenerationPolls.has(job.id)) {
      if (shouldShowPendingGenerationState(job)) showPendingGenerationState(job);
      return;
    }
    activeGenerationPolls.add(job.id);
    resumePendingGeneration(job).finally(() => activeGenerationPolls.delete(job.id));
  });

  return jobs;
}

async function resumePendingGeneration(job) {
  const pendingJob = sanitizePendingGeneration(job);
  if (!pendingJob?.id) return;

  if (pendingJob.projectId) {
    ensureProjectRecord(pendingJob.projectId, {
      createdAt: pendingJob.createdAt,
      title: generationProjectTitle(pendingJob),
    });
  }

  if (
    pendingJob.projectId &&
    pendingJob.projectId !== activeProjectId &&
    readProjects().some((project) => project.id === pendingJob.projectId)
  ) {
    openProject(pendingJob.projectId, { scroll: false, updateHash: false });
  }

  showPendingGenerationState(pendingJob);

  try {
    const payload = await pollGenerationJob(pendingJob);
    await completeGenerationJob(pendingJob, payload, { recovered: true });
  } catch (error) {
    removePendingSavedDesigns(pendingJob.id);
    if (isGenerationForActiveProject(pendingJob)) {
      removeResultLoading(resultLoadingStageKey(pendingJob.stage), { stage: pendingJob.stage });
      stopGenerationState(pendingJob.stage);
      creditStageStatusSetter(pendingJob.stage)(error.message || "Yarım kalan görsel oluşturma tamamlanamadı.", "error");
    }
  }
}

function shouldShowPendingGenerationState(job) {
  const projectId = generationProjectId(job);
  if (!projectId) return true;
  return activeProjectId === projectId || readStoredActiveProjectId() === projectId;
}

function isGenerationForActiveProject(job) {
  const projectId = generationProjectId(job);
  return !projectId || activeProjectId === projectId;
}

function stopGenerationState(stage) {
  if (stage === "sketch") setGeneratingState(false);
  else if (stage === "finish") setFinishGeneratingState(false);
  else if (isVisualizationStage(stage)) setMockupGeneratingState(false);
}

function showPendingGenerationState(job) {
  ensurePendingSavedDesignsForJob(job);

  if (job.stage === "sketch") {
    setGeneratingState(true);
    showResultLoading("sketch", job.count);
    setSketchStatus("Yarım kalan tasarım görseli oluşturma işlemi takip ediliyor...");
    return;
  }

  if (job.stage === "finish") {
    enterFinishStage({ allowMissing: true });
    setFinishGeneratingState(true);
    showResultLoading("finish", job.count);
    setFinishStatusMessage("Yarım kalan ürün görseli işlemi takip ediliyor...");
    return;
  }

  if (isVisualizationStage(job.stage)) {
    if (job.stage === "manken") enterMankenStage({ allowMissing: true });
    else enterMockupStage({ allowMissing: true });
    setMockupGeneratingState(true);
    showResultLoading("mockup", job.count, { stage: job.stage });
    setMockupStatusMessage(
      `Yarım kalan ${job.stage === "manken" ? "manken" : "mockup"} işlemi takip ediliyor...`
    );
  }
}

async function completeGenerationJob(job, payload, options = {}) {
  try {
    if (job.stage === "sketch") return await completeSketchGeneration(job, payload, options);
    if (job.stage === "finish") return await completeFinishGeneration(job, payload, options);
    if (isVisualizationStage(job.stage)) return await completeMockupGeneration(job, payload, options);
  } finally {
    // Üretim akışı tamamlandığında (sonuç workspace'e render edilsin ya da
    // edilmesin) ilgili aşamanın "yükleniyor" kartını her zaman kaldır. Aksi
    // halde sonuç hazır olduğu halde spinner sonsuza kadar dönebiliyordu.
    removeResultLoading(resultLoadingStageKey(job.stage), { stage: job.stage });
  }
}

// RESULT_LOADING_CONFIG yalnızca sketch/finish/mockup anahtarlarını tanır;
// manken aşaması da mockup grid'ini paylaşır.
function resultLoadingStageKey(stage) {
  return isVisualizationStage(stage) ? "mockup" : stage;
}

function shouldUseRealFinishApi() {
  return !isDevMode();
}

function shouldUseLocalFinishComposite() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("serverFinish") === "1") return false;
    if (params.get("localFinish") === "1") return true;
    return isDevMode() || creditWalletSource !== "server";
  } catch {
    return isLocalTestHost() || creditWalletSource !== "server";
  }
}

function shouldUseRealMockupApi() {
  return !isDevMode();
}

function isDevMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("real") === "1") return false;
    // Local'de test modu otomatik açıktır.
    if (isLocalTestHost()) return true;
    // Sorgu parametreli test modu (?dev / ?test / ?mock) YALNIZCA local ve Vercel
    // preview deploy'larında açılır. Canlı (production) alan adında müşteriler
    // adres çubuğundan test moduna geçemez; orada her zaman gerçek mod çalışır.
    if (isDevModeQueryAllowedHost()) {
      return (
        params.get("dev") === "1" ||
        params.get("test") === "1" ||
        params.get("mock") === "1"
      );
    }
    return false;
  } catch {
    return isLocalTestHost();
  }
}

function isLocalTestHost() {
  return (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

// ?dev/?test/?mock parametrelerinin geçerli olduğu host'lar: local + Vercel
// preview. Canlı alan adı (ff-studio.vercel.app ya da özel domain) hariç tutulur.
function isDevModeQueryAllowedHost() {
  if (isLocalTestHost()) return true;
  const host = window.location.hostname;
  // Preview deploy'ları "ff-studio-<git-dal/hash>-<scope>.vercel.app" biçimindedir;
  // canlı alias tam olarak "ff-studio.vercel.app"tır.
  return /\.vercel\.app$/.test(host) && host !== "ff-studio.vercel.app" && host.startsWith("ff-studio-");
}

const DEV_SKETCH_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'>
      <rect width='240' height='240' fill='#fff'/>
      <path d='M70 150 Q120 60 170 150' fill='none' stroke='#1a1a1a' stroke-width='3' stroke-linecap='round'/>
      <path d='M95 130 Q120 105 145 130' fill='none' stroke='#1a1a1a' stroke-width='2.5' stroke-linecap='round'/>
      <circle cx='120' cy='118' r='6' fill='#1a1a1a'/>
      <text x='120' y='200' font-family='serif' font-size='14' fill='#1a1a1a' text-anchor='middle'>TEST · Atelify</text>
    </svg>`
  );

function maybeEnableDevMode() {
  if (!isDevMode()) return;

  // Banner
  if (newDesignStudio && !document.querySelector("[data-dev-banner]")) {
    const banner = document.createElement("div");
    banner.dataset.devBanner = "1";
    banner.className = "studio-notice studio-notice--dev"; // stil: studio-theme.css
    banner.innerHTML =
      "<span>Test modu aktif — gerçek üretim çağrısı yapılmaz, başarılı denemede kredi düşer.</span>" +
      '<button type="button" class="button button-primary button-sm" data-dev-jump>' +
      "Ürün görseline atla</button>";
    newDesignStudio.prepend(banner);
    banner.querySelector("[data-dev-jump]")?.addEventListener("click", devJumpToFinishStage);
  }

  // Open the project workspace automatically when a URL hash did not choose another tab.
  if (!tabFromLocationHash()) {
    switchTab("projeler", { updateHash: false });
  }

  // Relabel generation buttons to indicate test mode.
  document.querySelectorAll("[data-generate-sketches]").forEach((btn) => {
    const draftCount = btn.dataset.draftCount || "1";
    const testLabel = draftCount === "4" ? "Test 4 adet oluştur" : "Test 1 görsel oluştur";
    btn.dataset.originalLabel = testLabel;
    btn.textContent = testLabel;
  });
}

function devJumpToFinishStage() {
  const firstCard = document.querySelector("[data-sketch-card]");
  if (!firstCard) return;

  // Place a dummy "selected" sketch
  firstCard.dataset.imageUrl = DEV_SKETCH_DATA_URL;
  firstCard.dataset.imageLabel = "Test Tasarım";
  firstCard.dataset.stageSourceUrl = DEV_SKETCH_DATA_URL;
  writeDesignProfileDataset(firstCard, designProfileFormFields());
  writeSketchMetadataDataset(firstCard, {
    projectId: activeProjectId || "",
    projectTitle: projectTitleById(activeProjectId),
    sourceStage: "sketch",
    sourceTitle: "Test Tasarım",
  });
  const img = firstCard.querySelector("[data-sketch-image]");
  if (img) {
    img.src = DEV_SKETCH_DATA_URL;
    img.hidden = false;
  }
  firstCard.querySelector(".sketch-thumb")?.classList.add("has-image");
  firstCard.classList.add("is-selected");
  firstCard.classList.remove("is-hidden");

  // Hide the other cards (so only one looks "selected")
  document.querySelectorAll("[data-sketch-card]").forEach((card, i) => {
    if (i > 0) card.classList.add("is-hidden");
  });

  newDesignStudio?.classList.add("has-results");
  setFormStepReady(true);
  enterFinishStage();
}
