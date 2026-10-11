// Atelify stüdyo — sketch-stage
// Aşama 1: gravür (sketch) üretimi, sonuç kartları ve aşama göstergesi.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


const STAGE_SOURCE_KEYS = ["finish", "mockup", "manken"];

function stageSquareParts(stageKey) {
  const panel = document.querySelector(`[data-design-source-panel="${stageKey}"]`);
  const square = panel?.closest(".handoff-preview-square");
  return {
    panel,
    square,
    slot: square?.querySelector(".handoff-preview-slot"),
    changeBtn: square?.querySelector("[data-handoff-change]"),
  };
}

// When nothing is selected the square shows the picker grid directly; once a
// design is chosen it shows the preview plus a "Değiştir" chip that re-opens
// the picker. Keeps selection in one compact square (no extra scrolling).
function syncStageSourceSquare(stageKey, { keepPickerOpen = false } = {}) {
  const { panel, slot, changeBtn } = stageSquareParts(stageKey);
  if (!panel || !slot) return;
  const hasSelection = slot.children.length > 0;
  if (changeBtn) changeBtn.hidden = !hasSelection;
  if (keepPickerOpen) return;
  if (hasSelection) {
    panel.hidden = true;
  } else {
    renderDesignSourcePanel(stageKey);
    panel.hidden = false;
  }
}

function setupStageSourceSquares() {
  STAGE_SOURCE_KEYS.forEach((stageKey) => {
    const { slot } = stageSquareParts(stageKey);
    if (!slot) return;
    // Secondary affordance: clicking the filled preview also opens the picker.
    slot.addEventListener("click", () => {
      if (slot.children.length > 0) toggleDesignSourcePanel(stageKey);
    });
    // Auto-react to selection/clearing of the preview slot.
    new MutationObserver(() => syncStageSourceSquare(stageKey)).observe(slot, {
      childList: true,
    });
  });
}

function openDesignStage(stageKey) {
  switchTab("projeler", { showProjectLibrary: false });
  showProjectWorkspace();

  if (stageKey === "sketch") {
    openSketchStage();
    return;
  }

  if (stageKey === "finish") {
    enterFinishStage({ allowMissing: true });
    syncStageSourceSquare("finish");
    return;
  }

  if (stageKey === "mockup") {
    enterMockupStage({ allowMissing: true });
    syncStageSourceSquare("mockup");
    return;
  }

  if (stageKey === "manken") {
    enterMankenStage({ allowMissing: true });
    syncStageSourceSquare("manken");
  }
}

function openSketchStage() {
  const sketchPanel = document.querySelector('[data-stage-panel="sketch"]');
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  const mockupPanel = document.querySelector('[data-stage-panel="mockup"]');
  const mankenPanel = document.querySelector('[data-stage-panel="manken"]');

  newDesignStudio?.classList.remove("is-form-stage", "is-finish-stage", "is-mockup-stage", "is-manken-stage");
  sketchPanel?.removeAttribute("hidden");
  finishPanel?.setAttribute("hidden", "");
  mockupPanel?.setAttribute("hidden", "");
  mankenPanel?.setAttribute("hidden", "");
  setWorkflowForSketchStage();
  applyStageRestrictions();
  scheduleManagedImageVisibilityRefresh();
  queueActiveProjectSave();
}

function showSketchResults() {
  if (!newDesignStudio) return;

  newDesignStudio.classList.add("has-results");
  if (newDesignStudio.classList.contains("is-finish-stage")) setWorkflowForFinishStage();
  else setWorkflowForSketchStage();
  applyStageRestrictions();
  updateVisibleSketchCards();
  document.querySelectorAll("[data-sketch-card]").forEach((card) => {
    card.classList.remove("is-selected");
  });
  setFormStepReady(false);
  queueActiveProjectSave();
}

const RESULT_LOADING_CONFIG = {
  finish: {
    gridSelector: "[data-finish-result-grid]",
    loadingText: "Ürün görseli hazırlanıyor",
    resultClass: "has-finish-result",
    resultSelector: "[data-finish-result-card]",
    stageLabel: "Görsel Üretimi",
  },
  mockup: {
    gridSelector: "[data-mockup-result-grid]",
    loadingText: "Vitrin görseli hazırlanıyor",
    resultClass: "has-mockup-result",
    resultSelector: "[data-mockup-result-card]",
    stageLabel: "Mockup / Manken",
  },
  sketch: {
    gridSelector: "[data-sketch-grid]",
    loadingText: "Tasarım görseli hazırlanıyor",
    resultClass: "has-results",
    resultSelector: "[data-sketch-card]",
    stageLabel: "Ürün / Tasarım",
  },
};

// mockup/manken aynı grid hook'unu (data-mockup-result-grid) iki ayrı panelde taşır;
// yükleme kartlarını üretimin ait olduğu aşama paneline yerleştir.
function resultLoadingGrid(config, stageKey, options = {}) {
  const scope = stageKey === "mockup"
    ? visualizationPanelForStage(options.stage) || activeVisualizationPanel() || document
    : document;
  return config ? scope.querySelector(config.gridSelector) : null;
}

function showResultLoading(stageKey, count = 1, options = {}) {
  const config = RESULT_LOADING_CONFIG[stageKey];
  const grid = resultLoadingGrid(config, stageKey, options);
  if (!config || !grid || !newDesignStudio) return;

  removeResultLoading(stageKey, options);

  if (stageKey === "sketch") {
    hideEmptySketchCards();
  }

  const safeCount = Math.max(1, Number.parseInt(count, 10) || 1);
  const loadingCards = Array.from({ length: safeCount }, (_, index) => createResultLoadingCard(stageKey, config, index));
  grid.prepend(...loadingCards);
  grid.hidden = false;
  syncResultStageVisibility(stageKey, options);
}

function createResultLoadingCard(stageKey, config, index) {
  const card = document.createElement("article");
  card.className = `sketch-card result-loading-card result-loading-card--${stageKey}`;
  card.dataset.resultLoading = stageKey;
  card.setAttribute("aria-busy", "true");
  card.tabIndex = -1;

  const visual = document.createElement("div");
  visual.className = "result-loading-visual";
  visual.setAttribute("aria-hidden", "true");

  const spinner = document.createElement("span");
  spinner.className = "result-spinner";

  const status = document.createElement("span");
  status.className = "result-loading-status";
  status.textContent = "Görsel üretiliyor";

  visual.append(spinner, status);

  const body = document.createElement("div");
  body.className = "sketch-body";

  const title = document.createElement("strong");
  title.textContent = `${config.loadingText} ${String(index + 1).padStart(2, "0")}`;

  const subtitle = document.createElement("span");
  subtitle.textContent = `${config.stageLabel} · Görsel birazdan burada belirecek`;

  body.append(title, subtitle);
  card.append(visual, body);
  return card;
}

function removeResultLoading(stageKey, options = {}) {
  const config = RESULT_LOADING_CONFIG[stageKey];
  const grid = resultLoadingGrid(config, stageKey, options);
  if (!config || !grid) return;

  grid.querySelectorAll(`[data-result-loading="${stageKey}"]`).forEach((card) => card.remove());
  syncResultStageVisibility(stageKey, options);
}

function hideEmptySketchCards() {
  document.querySelectorAll("[data-sketch-card]").forEach((card) => {
    card.classList.toggle("is-hidden", !sketchCardHasImage(card));
  });
}

function syncResultStageVisibility(stageKey, options = {}) {
  const config = RESULT_LOADING_CONFIG[stageKey];
  const grid = resultLoadingGrid(config, stageKey, options);
  if (!config || !grid || !newDesignStudio) return;

  const hasLoading = Boolean(grid.querySelector(`[data-result-loading="${stageKey}"]`));
  const hasResult =
    stageKey === "sketch"
      ? Array.from(document.querySelectorAll("[data-sketch-card]")).some(sketchCardHasImage)
      : Boolean(grid.querySelector(config.resultSelector));

  if (stageKey !== "sketch") {
    grid.hidden = !(hasLoading || hasResult);
  }

  if (stageKey === "mockup") {
    syncMockupResultUi();
    return;
  }

  newDesignStudio.classList.toggle(config.resultClass, hasLoading || hasResult);
}

async function generateSketches(triggerButton) {
  if (isSketchGenerating) return;
  const { creditCost, draftCount, resolution } = selectedDraftConfig(triggerButton);
  const generationLabel = `${draftCount} tasarım görseli oluşturma`;
  if (sketchCostSummary) sketchCostSummary.textContent = `${creditCost} kredi`;
  if (!ensureCreditsForGeneration({ amount: creditCost, label: generationLabel, stage: "sketch" })) return;

  let referenceSource;
  try {
    referenceSource = await resolveSketchReferenceSource();
  } catch (error) {
    setSketchStatus(error.message || "Önce bir tasarım görseli yüklemelisin.", "error");
    return;
  }

  const { fileName, imageDataUrl, sourceImageUrl } = referenceSource;
  const designProfile = selectedDesignProfile();
  const job = createGenerationJob({
    count: draftCount,
    creditCost,
    label: generationLabel,
    metadata: {
      designMode: designProfile.designModeValue,
      designModeLabel: designProfile.designModeLabel,
      fileName,
      product: designProfile.productValue,
      productLabel: designProfile.productLabel,
      productShape: designProfile.productShapeValue,
      productShapeLabel: designProfile.productShapeLabel,
      sourceImageUrl: sourceImageUrl || safeSavedSourceImageUrl(imageDataUrl),
    },
    stage: "sketch",
  });

  queueActiveProjectSave();
  setGeneratingState(true);
  setFormStepReady(false);
  showResultLoading("sketch", draftCount);
  publishPendingSavedDesigns(job, buildPendingSavedDesignEntries(job));
  setSketchStatus(
    isDevMode()
      ? "Test modu aktif. API çağrısı yapmadan örnek tasarım görselleri hazırlanıyor..."
      : "Tasarım görseli oluşturuluyor. Bu biraz sürebilir..."
  );

  // Dev mode bypass — return mock sketches without hitting fal.ai
  if (isDevMode()) {
    try {
      await new Promise((r) => setTimeout(r, 600));
      const profileFields = designProfileFormFields(designProfile);
      const sketchMetadata = sketchMetadataFieldsFromJob(job);
      const mockImages = Array.from({ length: draftCount }, (_, i) => ({
        ...profileFields,
        ...sketchMetadata,
        url: buildDevSketchMock(i + 1),
        label: `Test Tasarım ${String(i + 1).padStart(2, "0")}`,
      }));
      renderSketchImages(mockImages);
      const devSaveEntries = mockImages.map((image, index) => ({
        ...profileFields,
        ...sketchMetadata,
        imageUrl: image.url,
        projectId: generationProjectId(job),
        projectTitle: generationProjectTitle(job),
        sourceImageUrl: job.metadata?.sourceImageUrl || "",
        sourceFileName: job.metadata?.fileName || "",
        sourceStage: "sketch",
        stageSourceUrl: sketchStageSourceUrlFromImage(image),
        stage: "AI Tasarım Görseli",
        title: normalizeSketchLabel(image.label, index),
      }));
      autoSaveGeneratedDesigns(devSaveEntries, { job });
      addSavedDesigns(devSaveEntries.map((entry, index) => ({
        ...entry,
        autoSaved: true,
        generatedBy: "ai",
        pendingIndex: index,
      })));
      revealActiveTabContent("tasarimlarim");
      spendCredits({ amount: creditCost, label: generationLabel, stage: "sketch" });
      setSketchStatus(
        `Test modu — örnek tasarım görselleri gösteriliyor. ${creditCost} kredi harcandı.`,
        "success"
      );
    } catch (error) {
      removePendingSavedDesigns(job.id);
      removeResultLoading("sketch");
      setFormStepReady(Boolean(getSelectedSketchInfo()));
      setSketchStatus(error.message || "Tasarım görseli oluşturulamadı.", "error");
    } finally {
      setGeneratingState(false);
    }
    return;
  }

  try {
    const result = await submitGenerationJob({
      apiUrl: sketchApiUrl(),
      job,
      requestPayload: {
        designMode: designProfile.designModeValue,
        draftCount,
        imageDataUrl,
        product: designProfile.productValue,
        productShape: designProfile.productShapeValue,
        resolution,
      },
    });
    await completeSketchGeneration(result.job, result.payload);
  } catch (error) {
    if (job?.id) removePendingSavedDesigns(job.id);
    removeResultLoading("sketch");
    setFormStepReady(Boolean(getSelectedSketchInfo()));
    queueActiveProjectSave();
    setSketchStatus(error.message || "Tasarım görseli oluşturulamadı.", "error");
  } finally {
    setGeneratingState(false);
  }
}

async function completeSketchGeneration(job, payload, options = {}) {
  const images = payload.images || [];
  if (!images.length) throw new Error("Tasarım görseli oluşturuldu ancak görsel döndürülmedi.");
  const generatedAt = generationResultTimestamp(job, payload);
  const profileFields = designProfileFieldsFromGenerationMetadata(job.metadata || {});
  const sketchMetadata = sketchMetadataFieldsFromJob(job);
  const profiledImages = images.map((image) => ({
    ...profileFields,
    ...image,
    generatedAt: validIsoDate(image.generatedAt || image.createdAt || image.savedAt || "") || generatedAt,
    ...sketchMetadata,
    profileFields,
  }));

  const shouldRenderToWorkspace = isGenerationForActiveProject(job);
  const existingSketchCount = shouldRenderToWorkspace
    ? sketchResultCount()
    : projectSketchResultCount(generationProjectId(job));
  if (shouldRenderToWorkspace) {
    renderSketchImages(profiledImages);
  }
  persistSketchImagesToProject(job, profiledImages);
  const saveEntries = profiledImages.map((image, index) => ({
    ...profileFields,
    ...sketchMetadataFieldsFromSource(image),
    ...storageFieldsFromSource(image),
    imageUrl: image.url,
    projectId: generationProjectId(job),
    projectTitle: generationProjectTitle(job),
    sourceImageUrl: job.metadata?.sourceImageUrl || "",
    sourceFileName: job.metadata?.fileName || "",
    sourceStage: "sketch",
    stageSourceUrl: sketchStageSourceUrlFromImage(image),
    stage: "AI Tasarım Görseli",
    title: normalizeSketchLabel(image.label, existingSketchCount + index),
  }));
  autoSaveGeneratedDesigns(saveEntries, { job });
  addSavedDesigns(saveEntries.map((entry, index) => ({
    ...entry,
    autoSaved: true,
    generatedBy: "ai",
    pendingIndex: index,
  })));
  revealActiveTabContent("tasarimlarim");
  const sketchProjectId = generationProjectId(job);
  if (sketchProjectId) {
    const sketchProject = readProjects().find((p) => p.id === sketchProjectId);
    if (sketchProject) backfillProjectImagesToSavedDesigns(sketchProject);
  }
  spendCredits({ amount: job.creditCost, jobId: job.id, label: job.label, stage: "sketch" });
  await finalizeGenerationDelivery(job);
  if (shouldRenderToWorkspace) {
    setSketchStatus(
      `Tasarım görselleri hazır. ${job.creditCost} kredi harcandı.${options.recovered ? " Sayfa yenilendikten sonra sonuç geri alındı." : ""} Beğendiğin sonucu seçip devam edebilirsin.${formatStorageWarningStatusSuffix(payload)}`,
      "success"
    );
  }
  setGeneratingState(false);
}

async function resolveSketchReferenceSource() {
  const file = uploadInput?.files?.[0];

  if (file) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Lütfen JPEG, PNG veya WebP türünde bir görsel yükle.");
    }

    const imageDataUrl = await readFileAsDataUrl(file);
    const generationImageDataUrl = await createGenerationReferenceDataUrl(imageDataUrl) || imageDataUrl;
    const storedImageDataUrl = await createStoredReferenceDataUrl(imageDataUrl) || "";
    const sourceImageUrl = await savedSourceImageUrlFromImageUrl(storedImageDataUrl || generationImageDataUrl);
    const preview = document.querySelector("[data-reference-preview]");
    if (preview) {
      preview.dataset.referenceDataUrl = storedImageDataUrl;
      preview.dataset.referenceFileName = file.name;
      preview.dataset.referenceThumbnailUrl = sourceImageUrl;
    }
    writeSourceThumbnail(file.name, sourceImageUrl);
    queueActiveProjectSave();
    return {
      fileName: file.name,
      imageDataUrl: generationImageDataUrl,
      sourceImageUrl,
    };
  }

  const reference = collectReferenceState();
  const imageDataUrl = reference.imageDataUrl || (reference.previewUrl?.startsWith("data:image/") ? reference.previewUrl : "");

  if (imageDataUrl) {
    const sourceImageUrl = await savedSourceImageUrlFromImageUrl(imageDataUrl);
    return {
      fileName: reference.fileName || "Kaydedilen tasarım",
      imageDataUrl,
      sourceImageUrl,
    };
  }

  const preview = document.querySelector("[data-reference-preview]");
  const previewUrl = preview?.hidden ? "" : preview?.getAttribute("src") || "";
  if (previewUrl?.startsWith("blob:")) {
    const blobDataUrl = await imageUrlToDataUrl(previewUrl);
    const storedBlobDataUrl = await createStoredReferenceDataUrl(blobDataUrl) || blobDataUrl;
    return {
      fileName: reference.fileName || "Kaydedilen tasarım",
      imageDataUrl: storedBlobDataUrl,
      sourceImageUrl: await savedSourceImageUrlFromImageUrl(blobDataUrl),
    };
  }

  throw new Error("Önce bir tasarım görseli yüklemelisin.");
}

function buildDevSketchMock(index) {
  const variants = [
    `<path d='M100 190 Q160 80 220 190' fill='none' stroke='#1a1a1a' stroke-width='2.6' stroke-linecap='round'/>
     <circle cx='160' cy='150' r='6' fill='#1a1a1a'/>`,
    `<path d='M110 130 L160 90 L210 130 L210 200 L110 200 Z' fill='none' stroke='#1a1a1a' stroke-width='2.6' stroke-linejoin='round'/>
     <circle cx='160' cy='170' r='8' fill='none' stroke='#1a1a1a' stroke-width='2.4'/>`,
    `<path d='M110 160 Q160 100 210 160 Q160 220 110 160 Z' fill='none' stroke='#1a1a1a' stroke-width='2.6' stroke-linejoin='round'/>
     <path d='M140 160 L180 160' stroke='#1a1a1a' stroke-width='2'/>`,
    `<path d='M120 200 Q160 100 200 200' fill='none' stroke='#1a1a1a' stroke-width='2.6' stroke-linecap='round'/>
     <path d='M140 180 Q160 140 180 180' fill='none' stroke='#1a1a1a' stroke-width='2.2' stroke-linecap='round'/>
     <circle cx='160' cy='130' r='5' fill='#1a1a1a'/>`,
  ];
  const inner = variants[(index - 1) % variants.length];
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'>
        <rect width='320' height='320' fill='#fff'/>
        ${inner}
        <text x='160' y='300' font-family='serif' font-size='12' fill='#7a5a3b' text-anchor='middle'>TEST · Tasarım ${index}</text>
      </svg>`
    )
  );
}

function bindSketchCard(card) {
  if (!card || card.dataset.sketchBound === "1") return;

  card.dataset.sketchBound = "1";
  card.addEventListener("click", () => selectSketch(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectSketch(card);
    }
  });
}

function ensureSketchCardCount(targetCount) {
  const grid = document.querySelector("[data-sketch-grid]");
  const template = document.querySelector("[data-sketch-card]");
  if (!grid || !template) return;

  while (grid.querySelectorAll("[data-sketch-card]").length < targetCount) {
    const index = grid.querySelectorAll("[data-sketch-card]").length;
    const card = template.cloneNode(true);
    delete card.dataset.sketchBound;
    card.dataset.draftExtra = "1";
    resetSketchCard(card, index);
    bindSketchCard(card);
    grid.append(card);
  }
}

function resetSketchCard(card, index) {
  const thumb = card.querySelector(".sketch-thumb");
  const imageEl = card.querySelector("[data-sketch-image]");

  card.classList.remove("is-selected", "is-hidden");
  delete card.dataset.displayUrl;
  delete card.dataset.imageUrl;
  delete card.dataset.imageLabel;
  delete card.dataset.stageSourceUrl;
  clearDesignProfileDataset(card);
  clearSketchMetadataDataset(card);
  clearStorageDataset(card);
  setSketchCardSlotLabel(card, index);
  if (imageEl) {
    releaseImageElement(imageEl);
    imageEl.hidden = true;
  }
  thumb?.classList.remove("has-image");
}

function setSketchCardSlotLabel(card, index) {
  const title = card.querySelector(".sketch-body strong");
  const slotLabel = `Tasarım ${String(index + 1).padStart(2, "0")}`;
  if (title && !card.dataset.imageLabel) {
    title.textContent = slotLabel;
  }
  if (!card.dataset.imageLabel) card.removeAttribute("aria-label");
}

function setSketchCardImage(card, image, index) {
  const imageEl = card.querySelector("[data-sketch-image]");
  const thumb = card.querySelector(".sketch-thumb");
  const title = card.querySelector(".sketch-body strong");
  const subtitle = card.querySelector(".sketch-body span");
  const label = normalizeSketchLabel(image.label, index);
  const displayUrl = safePersistedImageUrl(image.url || image.displayUrl || "", "imageUrl");
  const stageSourceUrl = sketchStageSourceUrlFromImage(image) || displayUrl;

  card.dataset.imageUrl = displayUrl;
  card.dataset.stageSourceUrl = stageSourceUrl;
  card.dataset.imageLabel = label;
  writeDesignProfileDataset(card, image);
  writeSketchMetadataDataset(card, image);
  writeStorageDataset(card, image);
  if (title) title.textContent = label;
  const subtitleText = `Kazıma şablonu · ${image.designModeLabel || "Yüzeysel kazıma"}`;
  if (subtitle) subtitle.textContent = subtitleText;
  card.setAttribute("aria-label", `${label}. ${subtitleText}`);
  if (imageEl) {
    if ((imageEl.getAttribute("data-managed-src") || imageEl.getAttribute("src") || "") !== displayUrl) releaseImageElement(imageEl);
    setManagedImageSrc(imageEl, displayUrl);
    imageEl.hidden = false;
  }
  thumb?.classList.add("has-image");
}

function sketchStageSourceUrlFromImage(image = {}) {
  return safePersistedImageUrl(
    image.stageSourceUrl || image.sourceSketchUrl || image.sourceUrl || image.url || "",
    "stageSourceUrl"
  );
}

function persistSketchImagesToProject(job, images) {
  const projectId = generationProjectId(job);
  if (!projectId) return false;
  if (activeProjectId === projectId) return flushProjectSave();

  const incomingImages = Array.isArray(images)
    ? images.filter((image) => image?.url)
    : [];
  if (!incomingImages.length) return false;

  return patchProjectState(
    projectId,
    (state) => {
      const sketches = Array.isArray(state.sketches) ? [...state.sketches] : [];
      const seenUrls = new Set(sketches.map((sketch) => sketch.url).filter(Boolean));

      incomingImages.forEach((image) => {
        if (seenUrls.has(image.url)) return;
        const index = sketches.length;
        seenUrls.add(image.url);
        sketches.push({
          ...designProfileFieldsFromSource(image),
          ...sketchMetadataFieldsFromSource(image),
          ...storageFieldsFromSource(image),
          hidden: false,
          index,
          label: normalizeSketchLabel(image.label, index),
          selected: false,
          subtitle: "",
          stageSourceUrl: sketchStageSourceUrlFromImage(image),
          url: image.url,
        });
      });

      return {
        ...state,
        sketches,
        stage: maxProjectStage(state.stage, "sketch"),
      };
    },
    {
      createdAt: job.createdAt,
      title: generationProjectTitle(job),
    }
  );
}

function sketchCardHasImage(card) {
  return Boolean(card?.dataset.imageUrl || card?.querySelector("[data-sketch-image]")?.getAttribute("src"));
}

function sketchResultCount() {
  return Array.from(document.querySelectorAll("[data-sketch-card]")).filter(sketchCardHasImage).length;
}

function projectSketchResultCount(projectId) {
  const state = readProjects().find((project) => project.id === projectId)?.state;
  return Array.isArray(state?.sketches) ? state.sketches.filter((sketch) => sketch.url).length : 0;
}

function selectSketch(selectedCard) {
  if (!newDesignStudio) return;

  const previousCard = document.querySelector("[data-sketch-card].is-selected:not(.is-hidden)");
  releaseDirectFinishForm();
  clearStageUploadInput("direct-form");
  updateStageUploadPreview("direct-form", "", "");
  if (previousCard && previousCard !== selectedCard) {
    clearFinishResults();
  }
  newDesignStudio.classList.add("has-results");
  document.querySelectorAll("[data-sketch-card]").forEach((card) => {
    card.classList.toggle("is-selected", card === selectedCard);
  });
  setFormStepReady(true);
  flushProjectSave();
}

function setWorkflowStepState(stepKey, state) {
  const step = document.querySelector(`[data-workflow-step="${stepKey}"]`);
  if (!step) return;

  step.classList.toggle("is-active", state === "active");
  step.classList.toggle("is-unlocked", state === "unlocked");
  step.classList.toggle("is-locked", state === "locked");
}

function setWorkflowForSketchStage() {
  setWorkflowStepState("sketch", "active");
  setWorkflowStepState("product", "unlocked");
  setWorkflowStepState("mockup", "unlocked");
  setWorkflowStepState("manken", "unlocked");
}

function setWorkflowForFinishStage() {
  setWorkflowStepState("sketch", "unlocked");
  setWorkflowStepState("product", "active");
  setWorkflowStepState("mockup", "unlocked");
  setWorkflowStepState("manken", "unlocked");
}

function setWorkflowForMockupStage() {
  setWorkflowStepState("sketch", "unlocked");
  setWorkflowStepState("product", "unlocked");
  setWorkflowStepState("mockup", "active");
  setWorkflowStepState("manken", "unlocked");
}

function setWorkflowForMankenStage() {
  setWorkflowStepState("sketch", "unlocked");
  setWorkflowStepState("product", "unlocked");
  setWorkflowStepState("mockup", "unlocked");
  setWorkflowStepState("manken", "active");
}

// Görsel panelini paylaşan kaynak-seçim akışlarında, aktif aşamaya göre doğru adımı
// vurgular (mockup mu manken mi).
function setWorkflowForVisualizationStage() {
  if (newDesignStudio?.classList.contains("is-manken-stage")) setWorkflowForMankenStage();
  else setWorkflowForMockupStage();
}

function applyStageRestrictions() {
  const sketchPanel = document.querySelector('[data-stage-panel="sketch"]');
  sketchPanel?.classList.toggle("is-stage-locked", isSketchGenerating);

  const directFormDropzone = document.querySelector("[data-direct-form-dropzone]");
  if (directFormDropzone) directFormDropzone.hidden = false;

  const directFinishDropzone = document.querySelector("[data-direct-finish-dropzone]");
  if (directFinishDropzone) directFinishDropzone.hidden = false;
}

function setFormStepReady(isReady) {
  if (continueFormButton) {
    continueFormButton.disabled = !isReady;
    continueFormButton.classList.toggle("is-disabled", !isReady);
  }

  if (saveDesignButton) {
    saveDesignButton.disabled = !isReady;
  }
}

function renderSketchImages(images) {
  if (!newDesignStudio) return;

  const incomingImages = Array.isArray(images)
    ? images.filter((image) => image && typeof image.url === "string" && image.url.trim())
    : [];
  if (!incomingImages.length) return;

  removeResultLoading("sketch");
  newDesignStudio.classList.add("has-results");
  const existingImageCount = sketchResultCount();
  ensureSketchCardCount(existingImageCount + incomingImages.length);

  document.querySelectorAll("[data-sketch-card]").forEach((card, index) => {
    setSketchCardSlotLabel(card, index);
    card.classList.toggle("is-hidden", !sketchCardHasImage(card));
  });

  const cards = Array.from(document.querySelectorAll("[data-sketch-card]"));
  const emptyCards = cards.filter((card) => !sketchCardHasImage(card));
  const filledCards = [];
  incomingImages.forEach((image, offset) => {
    const slotIndex = existingImageCount + offset;
    const card = emptyCards[offset];
    if (!card) return;
    setSketchCardImage(card, image, slotIndex);
    card.classList.remove("is-hidden");
    filledCards.push(card);
  });

  // Yeni üretilen görseller her zaman en üstte kalsın.
  const sketchGrid = document.querySelector("[data-sketch-grid]");
  if (sketchGrid && filledCards.length) {
    sketchGrid.prepend(...filledCards);
  }

  setFormStepReady(Boolean(getSelectedSketchInfo()));
  flushProjectSave();
}

function clearSketchResults() {
  removeResultLoading("sketch");
  newDesignStudio?.classList.remove("has-results");
  clearFinishResults();
  document.querySelectorAll("[data-sketch-card]").forEach((card, index) => {
    if (index >= INITIAL_SKETCH_CARD_COUNT) {
      removeNodeReleasing(card);
      return;
    }

    resetSketchCard(card, index);
  });
  setFormStepReady(false);
  queueActiveProjectSave();
}

function setGeneratingState(isGenerating) {
  isSketchGenerating = Boolean(isGenerating);
  document.querySelectorAll("[data-generate-sketches]").forEach((button) => {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent;
    }

    button.disabled = isGenerating;
    button.classList.toggle("is-disabled", isGenerating);
    button.textContent = isGenerating ? "Tasarım görseli oluşturuluyor..." : button.dataset.originalLabel;
  });
  applyStageRestrictions();
}

// Arayüzde gereksiz yazı kalabalığı olmasın: durum satırları yalnızca hata, uyarı ve
// "notice" tonunu gösterir. Bilgi/başarı mesajları (yükleniyor, hazır, kaydedildi...)
// gösterilmez; ilerleme zaten yükleme kartları ve butonlarla anlaşılır. "notice",
// kullanıcının başka bir yerde işlem yapması gereken önemli sonuçlar içindir.
function isVisibleStatusTone(tone) {
  return tone === "error" || tone === "warning" || tone === "notice";
}

function setSketchStatus(message, tone = "") {
  if (!sketchStatus) return;

  const visible = isVisibleStatusTone(tone);
  sketchStatus.textContent = visible ? message || "" : "";
  sketchStatus.classList.toggle("is-error", visible && tone === "error");
  sketchStatus.classList.toggle("is-success", visible && tone === "notice");
  sketchStatus.classList.toggle("is-warning", visible && tone === "warning");
}
