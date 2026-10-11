// Atelify stüdyo — saved-designs
// Kayıtlı tasarımlar, kaynak küçük resimleri ve tarayıcı depolamasının sıkıştırılması.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function safeSavedSourceImageUrl(value) {
  return safePersistedImageUrl(value, "sourceImageUrl");
}

async function savedSourceImageUrlFromImageUrl(value) {
  const imageUrl = String(value || "").trim();
  if (!imageUrl) return "";

  const safeUrl = safeSavedSourceImageUrl(imageUrl);
  if (safeUrl) return safeUrl;

  if (imageUrl.startsWith("data:image/") || imageUrl.startsWith("blob:")) {
    return createSavedSourceThumbnail(imageUrl);
  }

  return "";
}

function createSavedSourceThumbnail(imageUrl) {
  return createResizedImageDataUrl(imageUrl, MAX_SOURCE_THUMBNAIL_SIDE, 0.76);
}

function createStoredReferenceDataUrl(imageUrl) {
  return createResizedImageDataUrl(imageUrl, MAX_STORED_REFERENCE_IMAGE_SIDE, 0.78);
}

async function persistedStageUploadImageUrl(file) {
  if (!file) return "";

  try {
    const imageDataUrl = await readFileAsDataUrl(file);
    const storedDataUrl = await createStoredReferenceDataUrl(imageDataUrl);
    return safePersistedImageUrl(storedDataUrl || "", "imageUrl");
  } catch {
    return "";
  }
}

function createGenerationReferenceDataUrl(imageUrl) {
  return createResizedImageDataUrl(imageUrl, MAX_GENERATION_REFERENCE_IMAGE_SIDE, 0.86);
}

function createResizedImageDataUrl(imageUrl, maxSide, quality) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || maxSide, image.naturalHeight || maxSide));
      const width = Math.max(1, Math.round((image.naturalWidth || maxSide) * scale));
      const height = Math.max(1, Math.round((image.naturalHeight || maxSide) * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve("");
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      releaseCanvas(canvas);
      image.removeAttribute("src");
      resolve(dataUrl);
    });
    image.addEventListener("error", () => resolve(""));
    image.src = imageUrl;
  });
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Kaydedilen tasarım görseli okunamadı.");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Kaydedilen tasarım görseli okunamadı.")));
    reader.readAsDataURL(blob);
  });
}

async function savedSourceImageUrlFromFormInfo(formInfo = {}) {
  return savedSourceImageUrlFromImageUrl(formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "");
}

async function savedSourceImageUrlFromFinishInfo(finishInfo = {}) {
  return savedSourceImageUrlFromImageUrl(finishInfo.finishImageUrl || finishInfo.sketchUrl || finishInfo.sourceFormUrl || "");
}

function addSavedDesigns(entries) {
  const savedDesigns = readSavedDesigns();
  const seenImageUrls = new Set(savedDesigns.map((design) => design.imageUrl));
  const seenJobSlots = new Set(savedDesigns.map(savedDesignJobSlotKey).filter(Boolean));
  const now = Date.now();
  let duplicateCount = 0;

  const newDesigns = entries.reduce((accumulator, entry, index) => {
    const imageUrl = normalizedSavedDesignImageUrl(entry);
    const jobSlotKey = savedDesignJobSlotKey(entry);

    if (!imageUrl) {
      return accumulator;
    }

    if (seenImageUrls.has(imageUrl) || (jobSlotKey && seenJobSlots.has(jobSlotKey))) {
      duplicateCount += 1;
      return accumulator;
    }

    seenImageUrls.add(imageUrl);
    if (jobSlotKey) seenJobSlots.add(jobSlotKey);
    accumulator.push(createSavedDesignFromEntry(entry, index, now));

    return accumulator;
  }, []);

  if (!newDesigns.length) {
    return { added: 0, duplicateCount, ok: true };
  }

  const nextDesigns = [...newDesigns, ...savedDesigns].slice(0, SAVED_DESIGN_LIMIT);

  if (!writeSavedDesigns(nextDesigns)) {
    return { added: 0, duplicateCount, ok: false };
  }

  renderSavedDesigns(nextDesigns);
  return { added: newDesigns.length, duplicateCount, ok: true };
}

function createSavedDesignFromEntry(entry, index, now = Date.now()) {
  const projectId = entry.projectId || activeProjectId || "";
  return {
    ...currentStudioOwnerFields(),
    ...designProfileFieldsFromSource(entry),
    ...storageFieldsFromSource(entry),
    autoSaved: Boolean(entry.autoSaved),
    createdAt: entry.createdAt || entry.generatedAt || new Date(now + index).toISOString(),
    generationJobId: entry.generationJobId || entry.pendingJobId || "",
    generatedAt: entry.generatedAt || entry.createdAt || "",
    generatedBy: entry.generatedBy || "",
    id: entry.id || `ff-design-${now}-${index}`,
    imageUrl: normalizedSavedDesignImageUrl(entry),
    isLoading: false,
    metalLabel: entry.metalLabel || "",
    metalValue: entry.metalValue || "",
    pendingIndex: Number.isFinite(Number(entry.pendingIndex)) ? Number(entry.pendingIndex) : null,
    pendingJobId: "",
    projectId,
    projectTitle: entry.projectTitle || projectTitleById(projectId) || "",
    sourceFileName: entry.sourceFileName || uploadInput?.files?.[0]?.name || "",
    sourceImageUrl: safeSavedSourceImageUrl(entry.sourceImageUrl || entry.previousImageUrl || ""),
    sourceStage: entry.sourceStage || "",
    sourceTitle: entry.sourceTitle || entry.sourceFileName || "",
    stage: entry.stage || "AI Tasarım",
    stageSourceUrl: safePersistedImageUrl(entry.stageSourceUrl || entry.sourceSketchUrl || entry.imageUrl || entry.url || "", "stageSourceUrl"),
    status: "ready",
    surfaceLabel:
      entry.surfaceLabel ||
      DESIGN_MODE_OPTIONS[entry.designModeValue]?.surfaceLabel ||
      entry.designModeLabel ||
      "",
    surfaceValue: entry.surfaceValue || entry.designModeValue || "",
    title: entry.title || `Tasarım ${String(index + 1).padStart(2, "0")}`,
  };
}

function normalizedSavedDesignImageUrl(entry) {
  return safePersistedImageUrl(entry?.imageUrl || entry?.url || "", "imageUrl");
}

function autoSaveGeneratedDesigns(entries, options = {}) {
  const jobId = String(options.job?.id || options.job?.clientJobId || "").trim();
  const autoSavedEntries = entries.map((entry, index) => ({
    ...entry,
    autoSaved: true,
    generationJobId: entry.generationJobId || jobId,
    generatedBy: "ai",
    pendingIndex: Number.isFinite(Number(entry.pendingIndex)) ? Number(entry.pendingIndex) : index,
  }));

  if (options.job?.id) {
    return resolvePendingSavedDesigns(options.job, autoSavedEntries);
  }

  return addSavedDesigns(autoSavedEntries);
}

function publishPendingSavedDesigns(job, entries = []) {
  const result = addPendingSavedDesigns(job, entries);
  revealActiveTabContent("tasarimlarim");
  return result;
}

function addPendingSavedDesigns(job, entries = []) {
  const pendingJob = sanitizePendingGeneration(job);
  if (!pendingJob?.id) return { added: 0, duplicateCount: 0, ok: true };

  const safeEntries = Array.isArray(entries) && entries.length
    ? entries
    : buildPendingSavedDesignEntries(pendingJob);
  const now = Date.now();
  const savedDesigns = readSavedDesigns().filter((design) => design.pendingJobId !== pendingJob.id);
  const pendingDesigns = safeEntries.slice(0, Math.max(1, pendingJob.count)).map((entry, index) => ({
    ...currentStudioOwnerFields(),
    ...designProfileFieldsFromSource(entry),
    autoSaved: true,
    createdAt: entry.createdAt || new Date(now + index).toISOString(),
    generatedBy: "ai",
    generationJobId: pendingJob.id,
    id: entry.id || pendingSavedDesignId(pendingJob.id, index),
    imageUrl: "",
    isLoading: true,
    pendingIndex: index,
    pendingJobId: pendingJob.id,
    pendingStage: pendingJob.stage,
    projectId: entry.projectId || generationProjectId(pendingJob),
    projectTitle: entry.projectTitle || generationProjectTitle(pendingJob),
    sourceFileName: entry.sourceFileName || "",
    sourceImageUrl: safeSavedSourceImageUrl(entry.sourceImageUrl || ""),
    sourceStage: entry.sourceStage || pendingJob.stage,
    sourceTitle: entry.sourceTitle || entry.sourceFileName || "",
    stage: entry.stage || savedDesignStageLabel(pendingJob.stage),
    status: "loading",
    surfaceLabel: entry.surfaceLabel || "",
    surfaceValue: entry.surfaceValue || "",
    title: entry.title || pendingSavedDesignTitle(pendingJob, index),
  }));

  const nextDesigns = [...pendingDesigns, ...savedDesigns].slice(0, SAVED_DESIGN_LIMIT);
  if (!writeSavedDesigns(nextDesigns)) {
    return { added: 0, duplicateCount: 0, ok: false };
  }

  renderSavedDesigns(nextDesigns);
  return { added: pendingDesigns.length, duplicateCount: 0, ok: true };
}

function ensurePendingSavedDesignsForJob(job) {
  const pendingJob = sanitizePendingGeneration(job);
  if (!pendingJob?.id) return;

  const hasPendingDesign = readSavedDesigns().some((design) => (
    design.pendingJobId === pendingJob.id && isSavedDesignLoading(design)
  ));
  if (!hasPendingDesign) {
    publishPendingSavedDesigns(pendingJob);
  }
}

function resolvePendingSavedDesigns(job, entries = []) {
  const pendingJob = sanitizePendingGeneration(job);
  if (!pendingJob?.id) return addSavedDesigns(entries);

  const finalEntries = (Array.isArray(entries) ? entries : []).map((entry, index) => ({
    ...entry,
    generationJobId: entry.generationJobId || pendingJob.id,
    pendingIndex: Number.isFinite(Number(entry.pendingIndex)) ? Number(entry.pendingIndex) : index,
  }));
  const savedDesigns = readSavedDesigns();
  const pendingDesigns = savedDesigns.filter((design) => isPendingSavedDesignForJob(design, pendingJob.id));
  const pendingByIndex = new Map(
    pendingDesigns.map((design) => [normalizePendingIndex(design.pendingIndex), design])
  );

  const seenImageUrls = new Set(
    savedDesigns
      .filter((design) => !isPendingSavedDesignForJob(design, pendingJob.id))
      .map((design) => design.imageUrl)
      .filter(Boolean)
  );
  const seenJobSlots = new Set(
    savedDesigns
      .filter((design) => !isPendingSavedDesignForJob(design, pendingJob.id))
      .map(savedDesignJobSlotKey)
      .filter(Boolean)
  );
  const completedByPendingId = new Map();
  const newDesigns = [];
  const now = Date.now();
  let added = 0;
  let duplicateCount = 0;

  finalEntries.forEach((entry, entryIndex) => {
    const pendingIndex = normalizePendingIndex(entry.pendingIndex, entryIndex);
    const pendingDesign = pendingByIndex.get(pendingIndex) || null;
    const imageUrl = normalizedSavedDesignImageUrl(entry);
    const jobSlotKey = savedDesignJobSlotKey({ ...entry, generationJobId: pendingJob.id, pendingIndex });
    if (!imageUrl) return;

    if (seenImageUrls.has(imageUrl) || (jobSlotKey && seenJobSlots.has(jobSlotKey))) {
      duplicateCount += 1;
      if (pendingDesign) completedByPendingId.set(pendingDesign.id, null);
      return;
    }

    seenImageUrls.add(imageUrl);
    if (jobSlotKey) seenJobSlots.add(jobSlotKey);

    const completedDesign = createSavedDesignFromEntry(
      {
        ...(pendingDesign || {}),
        ...entry,
        autoSaved: entry.autoSaved ?? pendingDesign?.autoSaved,
        createdAt: pendingDesign?.createdAt || entry.createdAt,
        generatedBy: entry.generatedBy || pendingDesign?.generatedBy || "ai",
        generationJobId: pendingJob.id,
        id: pendingDesign?.id || entry.id,
        imageUrl,
        pendingIndex,
        projectId: entry.projectId || pendingDesign?.projectId || generationProjectId(pendingJob),
        projectTitle: entry.projectTitle || pendingDesign?.projectTitle || generationProjectTitle(pendingJob),
        sourceFileName: entry.sourceFileName || pendingDesign?.sourceFileName,
        sourceImageUrl: entry.sourceImageUrl || pendingDesign?.sourceImageUrl,
        sourceStage: entry.sourceStage || pendingDesign?.sourceStage,
        sourceTitle: entry.sourceTitle || pendingDesign?.sourceTitle,
        stage: entry.stage || pendingDesign?.stage,
        surfaceLabel: entry.surfaceLabel || pendingDesign?.surfaceLabel,
        surfaceValue: entry.surfaceValue || pendingDesign?.surfaceValue,
        title: entry.title || pendingDesign?.title,
      },
      pendingIndex,
      now
    );

    if (pendingDesign) {
      completedByPendingId.set(pendingDesign.id, completedDesign);
    } else {
      newDesigns.push(completedDesign);
    }
    added += 1;
  });

  const nextDesigns = [
    ...newDesigns,
    ...savedDesigns.reduce((accumulator, design) => {
      if (isPendingSavedDesignForJob(design, pendingJob.id)) {
        const completedDesign = completedByPendingId.get(design.id);
        if (completedDesign) accumulator.push(completedDesign);
        return accumulator;
      }
      accumulator.push(design);
      return accumulator;
    }, []),
  ].slice(0, SAVED_DESIGN_LIMIT);

  if (!writeSavedDesigns(nextDesigns)) {
    return { added: 0, duplicateCount, ok: false };
  }

  renderSavedDesigns(nextDesigns);
  return { added, duplicateCount, ok: true };
}

function removePendingSavedDesigns(jobId) {
  const safeJobId = String(jobId || "").trim();
  if (!safeJobId) return false;

  const savedDesigns = readSavedDesigns();
  const nextDesigns = savedDesigns.filter((design) => design.pendingJobId !== safeJobId);
  if (nextDesigns.length === savedDesigns.length) return false;

  if (!writeSavedDesigns(nextDesigns)) return false;
  renderSavedDesigns(nextDesigns);
  return true;
}

function isSavedDesignLoading(design) {
  const imageUrl = typeof design?.imageUrl === "string" ? design.imageUrl.trim() : "";
  return !imageUrl && (design?.isLoading === true || design?.status === "loading");
}

function isPendingSavedDesignForJob(design, jobId) {
  const safeJobId = String(jobId || "").trim();
  if (!safeJobId || !design) return false;
  return (
    String(design.pendingJobId || "").trim() === safeJobId ||
    (isSavedDesignLoading(design) && String(design.generationJobId || "").trim() === safeJobId)
  );
}

function savedDesignJobSlotKey(design) {
  const jobId = String(design?.generationJobId || design?.pendingJobId || "").trim();
  if (!jobId) return "";
  return `${jobId}:${normalizePendingIndex(design?.pendingIndex)}`;
}

function pendingSavedDesignId(jobId, index) {
  return `ff-design-loading-${jobId}-${index}`;
}

function savedDesignStageLabel(stage) {
  if (stage === "finish") return "Ürün Görseli";
  if (stage === "manken") return "Manken Foto";
  if (stage === "mockup") return "Mockup Foto";
  return "AI Tasarım Görseli";
}

function pendingSavedDesignTitle(job, index = 0) {
  const number = String(index + 1).padStart(2, "0");
  if (job.stage === "finish") return `Ürün görseli hazırlanıyor ${number}`;
  if (job.stage === "manken") return `Manken hazırlanıyor ${number}`;
  if (job.stage === "mockup") return `Mockup hazırlanıyor ${number}`;
  return `Tasarım görseli hazırlanıyor ${number}`;
}

function buildPendingSavedDesignEntries(job) {
  const metadata = job.metadata || {};
  const count = Math.max(1, normalizeCreditNumber(job.count, 1));
  return Array.from({ length: count }, (_, index) => {
    if (job.stage === "finish") {
      const formInfo = metadata.formInfo || {};
      return {
        ...designProfileFieldsFromSource(formInfo),
        sourceFileName: formInfo.title || "",
        sourceStage: "finish",
        sourceTitle: formInfo.title || "",
        stage: savedDesignStageLabel(job.stage),
        title: pendingSavedDesignTitle(job, index),
      };
    }

    if (isVisualizationStage(job.stage)) {
      const finishInfo = metadata.finishInfo || {};
      return {
        ...designProfileFieldsFromSource(finishInfo),
        sourceFileName: finishInfo.title || "",
        sourceStage: job.stage,
        sourceTitle: finishInfo.title || "",
        stage: savedDesignStageLabel(job.stage),
        title: pendingSavedDesignTitle(job, index),
      };
    }

    return {
      ...designProfileFieldsFromGenerationMetadata(metadata),
      ...sketchMetadataFieldsFromJob(job),
      sourceFileName: metadata.fileName || "",
      sourceImageUrl: metadata.sourceImageUrl || "",
      sourceStage: "sketch",
      sourceTitle: metadata.fileName || "",
      stage: savedDesignStageLabel(job.stage),
      title: pendingSavedDesignTitle(job, index),
    };
  });
}

function formatAutoSaveStatusSuffix(result) {
  if (!result) return "";
  if (!result.ok) return " Tasarımlarım'a otomatik kayıt yapılamadı.";
  if (result.added > 0) return ` ${result.added} sonuç Tasarımlarım'a kaydedildi.`;
  if (result.duplicateCount > 0) return " Sonuçlar zaten Tasarımlarım'da.";
  return "";
}

function formatStorageWarningStatusSuffix(payload) {
  return payload?.storageWarning ? ` ${payload.storageWarning}` : "";
}

async function saveSelectedDesign() {
  const selectedCard = document.querySelector("[data-sketch-card].is-selected:not(.is-hidden)");
  const selectedImage = selectedCard?.querySelector("[data-sketch-image]");
  const imageUrl = selectedCard?.dataset.imageUrl || managedImageUrl(selectedImage) || "";

  if (!selectedCard || !imageUrl) {
    setSketchStatus("Kaydetmek için önce üretilen bir tasarım görseli seç.", "error");
    return;
  }

  const profileFields = readDesignProfileDataset(selectedCard);
  const metadataFields = readSketchMetadataDataset(selectedCard);
  const sourceImageUrl = metadataFields.sourceImageUrl || await savedSourceImageUrlFromCurrentReference();
  const sourceFileName = metadataFields.sourceFileName || uploadInput?.files?.[0]?.name || collectReferenceState().fileName || "";
  const stageSourceUrl = safePersistedImageUrl(selectedCard.dataset.stageSourceUrl || imageUrl, "stageSourceUrl") || imageUrl;
  const result = addSavedDesigns([{
    ...profileFields,
    ...metadataFields,
    imageUrl,
    projectId: metadataFields.projectId || activeProjectId || "",
    projectTitle: metadataFields.projectTitle || projectTitleById(metadataFields.projectId || activeProjectId) || "",
    sourceFileName,
    sourceImageUrl,
    sourceStage: metadataFields.sourceStage || "sketch",
    sourceTitle: metadataFields.sourceTitle || sourceFileName,
    stageSourceUrl,
    stage: "Tasarım Görseli",
    title: selectedCard.dataset.imageLabel || selectedCard.querySelector(".sketch-body strong")?.textContent || "Tasarım",
  }]);

  if (!result.ok) {
    setSketchStatus("Tasarım kaydedilemedi. Tarayıcı depolama alanını kontrol et.", "error");
    return;
  }

  setSketchStatus(
    result.added > 0
      ? "Tasarım kaydedildi. Tasarımlarım sekmesinde görünecek."
      : "Bu tasarım zaten kaydedilmiş.",
    "success"
  );
  queueActiveProjectSave();
}

async function savedSourceImageUrlFromCurrentReference() {
  const file = uploadInput?.files?.[0];
  if (file?.type?.startsWith("image/")) {
    const dataUrl = await readFileAsDataUrl(file);
    const storedDataUrl = await createStoredReferenceDataUrl(dataUrl);
    const thumbnailUrl = await savedSourceImageUrlFromImageUrl(storedDataUrl || dataUrl);
    writeSourceThumbnail(file.name, thumbnailUrl);
    return thumbnailUrl;
  }
  const reference = collectReferenceState();
  return savedSourceImageUrlFromImageUrl(reference.imageDataUrl || reference.previewUrl || reference.thumbnailUrl);
}

async function storeReferenceDataForFile(file, preview) {
  if (!file?.name || !file.type?.startsWith("image/")) return;
  const token = Date.now() + Math.random();
  referencePersistenceToken = token;

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const storedDataUrl = await createStoredReferenceDataUrl(dataUrl) || dataUrl;
    const thumbnailUrl = await savedSourceImageUrlFromImageUrl(storedDataUrl);
    if (referencePersistenceToken !== token) return;
    if (preview) {
      if (thumbnailUrl) {
        preview.src = thumbnailUrl;
        releaseReferencePreviewObjectUrl();
      }
      preview.dataset.referenceDataUrl = storedDataUrl;
      preview.dataset.referenceFileName = file.name;
      preview.dataset.referenceThumbnailUrl = thumbnailUrl;
    }
    writeSourceThumbnail(file.name, thumbnailUrl);
    queueActiveProjectSave();
  } catch {
    // Reference persistence is a convenience for reloads; the live file can still be used in this session.
  }
}

function writeSourceThumbnail(fileName, thumbnailUrl) {
  const key = normalizeSourceThumbnailKey(fileName);
  const safeThumbnailUrl = safePersistedImageUrl(thumbnailUrl, "thumbnailUrl");
  if (!key || !safeThumbnailUrl) return;

  const thumbnails = studioStore.readSourceThumbnails();
  thumbnails[key] = safeThumbnailUrl;
  studioStore.writeSourceThumbnails(limitSourceThumbnailEntries(thumbnails));
}

function readSourceThumbnail(fileName) {
  const key = normalizeSourceThumbnailKey(fileName);
  if (!key) return "";
  return safePersistedImageUrl(studioStore.readSourceThumbnails()[key] || "", "thumbnailUrl");
}

function compactSourceThumbnailStorage() {
  studioStore.writeSourceThumbnails(limitSourceThumbnailEntries(studioStore.readSourceThumbnails()));
}

function limitSourceThumbnailEntries(thumbnails = {}) {
  return Object.fromEntries(
    Object.entries(thumbnails)
      .filter(([, value]) => safePersistedImageUrl(value, "thumbnailUrl"))
      .slice(-SOURCE_THUMBNAIL_LIMIT)
  );
}

function readSavedDesigns() {
  return studioStore.readSavedDesigns();
}

function writeSavedDesigns(designs) {
  return studioStore.writeSavedDesigns(compactPersistedSavedDesigns(prunedPendingSavedDesigns(designs)));
}

// Çözülmemiş "yükleniyor" placeholder'ları, arkasındaki üretim job'u tamamen
// kaybolduğunda (başka bir oturumda temizlenmiş, hiç tamamlanmamış vb.)
// Tasarımlarım'da sonsuza kadar dönen kart olarak kalabiliyor; üstelik bunlar
// buluta da senkronlandığı için cihazlar arası geri geliyor. Üretimin azami
// yaşından (PENDING_GENERATION_MAX_AGE_MS) eski loading placeholder'larını
// orphan kabul edip ele. Devam eden taze üretimlerin placeholder'ı korunur.
function prunedPendingSavedDesigns(designs = []) {
  const now = Date.now();
  return (Array.isArray(designs) ? designs : []).filter((design) => {
    if (!isSavedDesignLoading(design)) return true;
    const createdAt = new Date(design?.createdAt || "").getTime();
    if (!Number.isFinite(createdAt)) return false;
    return now - createdAt <= PENDING_GENERATION_MAX_AGE_MS;
  });
}

function compactPersistedProjects(projects = []) {
  return (Array.isArray(projects) ? projects : [])
    .map((project) => ({ ...project, ...currentStudioOwnerFields() }))
    .map((project) => compactPersistedValue(project));
}

function compactPersistedSavedDesigns(designs = []) {
  return (Array.isArray(designs) ? designs : [])
    .map((design) => ({ ...design, ...currentStudioOwnerFields() }))
    .map((design) => compactPersistedValue(design));
}

function compactPersistedValue(value, key = "") {
  if (Array.isArray(value)) {
    return value.map((item) => compactPersistedValue(item, key));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((accumulator, [entryKey, entryValue]) => {
      accumulator[entryKey] = compactPersistedValue(entryValue, entryKey);
      return accumulator;
    }, {});
  }

  if (typeof value === "string" && isPersistedImageUrlKey(key)) {
    return safePersistedImageUrl(value, key);
  }

  return value;
}

function isPersistedImageUrlKey(key) {
  const normalizedKey = String(key || "").toLowerCase();
  return (
    normalizedKey === "url" ||
    normalizedKey.endsWith("imageurl") ||
    normalizedKey.endsWith("previewurl") ||
    normalizedKey.endsWith("thumbnailurl") ||
    normalizedKey.endsWith("displayurl") ||
    normalizedKey.endsWith("rawurl") ||
    normalizedKey.endsWith("sketchurl") ||
    normalizedKey.endsWith("formurl") ||
    normalizedKey.endsWith("sourceurl") ||
    normalizedKey.endsWith("storageurl") ||
    normalizedKey.endsWith("mockupurl") ||
    normalizedKey === "imagedataurl"
  );
}

function safePersistedImageUrl(value, key = "") {
  const imageUrl = String(value || "").trim();
  if (!imageUrl || imageUrl.startsWith("blob:")) return "";
  if (!imageUrl.startsWith("data:image/")) return imageUrl;

  const normalizedKey = String(key || "").toLowerCase();
  const maxLength =
    normalizedKey === "imagedataurl" ||
    normalizedKey.endsWith("thumbnailurl") ||
    normalizedKey.endsWith("sourceimageurl") ||
    normalizedKey.endsWith("previewurl")
      ? MAX_SAVED_SOURCE_IMAGE_URL_LENGTH
      : MAX_PERSISTED_DATA_URL_LENGTH;
  return imageUrl.length <= maxLength ? imageUrl : "";
}

function compactPersistedStudioStorage() {
  writeProjects(readProjects());
  writeSavedDesigns(readSavedDesigns());
  compactSourceThumbnailStorage();
}

function createStudioObjectUrl(blob) {
  const objectUrl = URL.createObjectURL(blob);
  studioObjectUrls.add(objectUrl);
  return objectUrl;
}

function revokeStudioObjectUrl(objectUrl) {
  const url = String(objectUrl || "");
  if (!url.startsWith("blob:")) return;

  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore invalid or already-revoked object URLs.
  }
  studioObjectUrls.delete(url);
}

const offscreenImageObserver =
  typeof IntersectionObserver === "function"
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const image = entry.target;
            if (!shouldManageImageVisibility(image)) {
              offscreenImageObserver?.unobserve(image);
              return;
            }
            const managedUrl = image.getAttribute("data-managed-src") || "";
            if (!managedUrl) return;
            if (entry.isIntersecting) {
              if (image.getAttribute("src") !== managedUrl) image.setAttribute("src", managedUrl);
            } else if (image.getAttribute("src")) {
              // Görünür alandan çıkan görselin decode edilmiş bitmap'ini serbest bırak;
              // uzak/data URL data-managed-src içinde kaldığı için geri girince tekrar yüklenir.
              image.removeAttribute("src");
            }
          });
        },
        { rootMargin: "400px" }
      )
    : null;

function shouldManageImageVisibility(image) {
  return !image?.classList?.contains("side-emblem-thumb");
}

function setManagedImageSrc(image, url) {
  if (!image) return;
  const value = String(url || "");
  image.decoding = "async";
  image.loading = "lazy";
  if (!offscreenImageObserver || value.startsWith("blob:")) {
    image.src = value;
    return;
  }
  image.setAttribute("data-managed-src", value);
  image.setAttribute("src", value);
  offscreenImageObserver.observe(image);
}

function managedImageUrl(image) {
  if (!image) return "";
  return image.getAttribute("data-managed-src") || image.getAttribute("src") || "";
}

// Gizli panellerdeki (sekme/aşama/proje geçişiyle display:none olan) yönetilen
// görsellerin decode edilmiş bitmap'ini serbest bırakır. IntersectionObserver
// Safari'de display:none geçişlerinde güvenilir tetiklenmediği için bu görseller
// aksi halde tam çözünürlükte (≈4 MB) bellekte kalıp birikiyordu. data-managed-src
// korunduğu için görsel tekrar görünür olunca yeniden yüklenir.
function refreshManagedImageVisibility() {
  document.querySelectorAll("img").forEach((image) => {
    if (!shouldManageImageVisibility(image)) return;
    const src = image.getAttribute("src") || "";
    const managed = image.getAttribute("data-managed-src") || "";
    // blob: yönetilemez (revoke sonrası geri yüklenemez); ikisi de boşsa atla.
    if (src.startsWith("blob:") || managed.startsWith("blob:")) return;
    if (!src && !managed) return;
    const isHidden = image.offsetParent === null && image.getClientRects().length === 0;
    if (isHidden) {
      if (src) {
        // Görünmez panel: URL'yi sakla, decode edilmiş bitmap'i serbest bırak.
        if (!managed) image.setAttribute("data-managed-src", src);
        offscreenImageObserver?.observe(image);
        image.removeAttribute("src");
      }
    } else if (!src && managed) {
      // Tekrar görünür. Görünür alana yakın olanı hemen geri yükle (observer
      // zamanlamasına bağlı kalmadan boş görsel riskini önle); uzaktakiler
      // observer ile gerektiğinde yüklensin.
      const rect = image.getBoundingClientRect();
      const margin = 400;
      const nearViewport =
        rect.bottom > -margin &&
        rect.top < (window.innerHeight || 0) + margin &&
        rect.right > -margin &&
        rect.left < (window.innerWidth || 0) + margin;
      if (nearViewport || !offscreenImageObserver) {
        image.setAttribute("src", managed);
      }
      if (offscreenImageObserver) {
        offscreenImageObserver.unobserve(image);
        offscreenImageObserver.observe(image);
      }
    }
  });
}

let managedImageVisibilityFrame = null;
function scheduleManagedImageVisibilityRefresh() {
  if (managedImageVisibilityFrame) return;
  managedImageVisibilityFrame = window.requestAnimationFrame(() => {
    managedImageVisibilityFrame = null;
    refreshManagedImageVisibility();
  });
}

function releaseImageElement(image) {
  if (!image) return;
  offscreenImageObserver?.unobserve(image);
  image.removeAttribute("data-managed-src");
  revokeStudioObjectUrl(image.getAttribute("src") || image.src || "");
  image.removeAttribute("src");
}

function releaseImagesIn(root) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  root.querySelectorAll("img").forEach(releaseImageElement);
}

function replaceChildrenReleasing(parent, ...children) {
  if (!parent) return;
  releaseImagesIn(parent);
  parent.replaceChildren(...children);
}

function removeNodeReleasing(node) {
  if (!node) return;
  if (node.matches?.("img")) releaseImageElement(node);
  releaseImagesIn(node);
  node.remove();
}

function releaseCanvas(canvas) {
  if (!canvas) return;
  canvas.width = 1;
  canvas.height = 1;
}

function releaseReferencePreviewObjectUrl() {
  if (!referencePreviewObjectUrl) return;
  revokeStudioObjectUrl(referencePreviewObjectUrl);
  referencePreviewObjectUrl = "";
}

function releaseDirectFinishForm() {
  [directFinishForm?.formImageUrl, directFinishForm?.sourceFormUrl, directFinishForm?.sketchUrl].forEach(revokeStudioObjectUrl);
  directFinishForm = null;
  directFinishFormFile = null;
}

function releaseDirectMockupFinish() {
  [directMockupFinish?.finishImageUrl, directMockupFinish?.sourceFormUrl, directMockupFinish?.sketchUrl].forEach(revokeStudioObjectUrl);
  directMockupFinish = null;
  directMockupFinishFile = null;
}
