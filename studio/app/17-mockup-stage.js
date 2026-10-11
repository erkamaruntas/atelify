// Atelify stüdyo — mockup-stage
// Aşama 3–4: mockup ve manken görselleri.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function setMockupStepReady(isReady) {
  const continueMockupBtn = document.querySelector("[data-continue-mockup]");
  const saveFinishBtn = document.querySelector("[data-save-finish-design]");

  if (newDesignStudio?.classList.contains("is-finish-stage")) {
    setWorkflowStepState("mockup", "unlocked");
  }

  if (continueMockupBtn) {
    continueMockupBtn.disabled = !isReady;
    continueMockupBtn.classList.toggle("is-disabled", !isReady);
  }
  if (saveFinishBtn) saveFinishBtn.disabled = !isReady;
}

function clearFinishResults() {
  const resultGrid = document.querySelector("[data-finish-result-grid]");
  if (resultGrid) {
    replaceChildrenReleasing(resultGrid);
    resultGrid.hidden = true;
  }
  clearMockupResults();
  newDesignStudio?.classList.remove("has-finish-result");
  setMockupStepReady(false);
  queueActiveProjectSave();
}

function createFormVisual(formInfo) {
  const visual = document.createElement("div");
  visual.className = `form-result-visual product-${formInfo.productValue || "yuzuk"}`;

  const measureLabel = document.createElement("span");
  measureLabel.className = "form-measure-label";
  measureLabel.textContent = formInfo.moldMeasure || "";

  if (formInfo.renderMode === "generated" || formInfo.formImageUrl) {
    visual.classList.add("has-generated-image");
    const image = document.createElement("img");
    image.className = "generated-form-image";
    image.src = formInfo.formImageUrl || formInfo.sketchUrl || DEV_SKETCH_DATA_URL;
    image.alt = "";
    image.decoding = "async";
    image.loading = "lazy";
    visual.append(measureLabel, image);
    return visual;
  }

  const frame = document.createElement("div");
  frame.className = `form-frame form-frame--${formInfo.shapeValue || "yuvarlak"}`;
  frame.style.setProperty("--mold-aspect", formInfo.moldAspect || "1 / 1");
  frame.style.setProperty("--mold-frame-width", "70%");

  const image = document.createElement("img");
  image.src = formInfo.sketchUrl || DEV_SKETCH_DATA_URL;
  image.alt = "";
  image.decoding = "async";
  image.loading = "lazy";
  frame.append(image);
  visual.append(measureLabel, frame);

  return visual;
}

function createFinishVisual(resultOrInfo) {
  const formInfo = resultOrInfo.formInfo || resultOrInfo;
  const metalValue = resultOrInfo.metal?.value || resultOrInfo.metalValue || "altin";
  const surfaceValue = resultOrInfo.surface?.value || resultOrInfo.surfaceValue || "parlak";
  const stoneValue = "yok";
  const backgroundValue = resultOrInfo.background?.value || resultOrInfo.backgroundValue || "dekupe";
  const generatedImageUrl = resultOrInfo.imageUrl || resultOrInfo.finishImageUrl || formInfo.finishImageUrl || "";
  const renderMode = resultOrInfo.renderMode || formInfo.renderMode || (generatedImageUrl ? "generated" : "composite");

  const visual = document.createElement("div");
  visual.className = `finish-result-visual bg-${backgroundValue}`;

  const label = document.createElement("span");
  label.className = "form-measure-label";
  label.textContent = resultOrInfo.metal?.label || resultOrInfo.metalLabel || "Altın";

  if (generatedImageUrl && renderMode === "generated") {
    visual.classList.add("has-generated-image");
    const image = document.createElement("img");
    image.className = "generated-finish-image";
    image.alt = "";
    setManagedImageSrc(image, generatedImageUrl);
    visual.append(label, image);
    return visual;
  }

  const shell = document.createElement("div");
  shell.className = `finish-shell metal-${metalValue} surface-${surfaceValue} stone-${stoneValue}`;

  const frame = document.createElement("div");
  frame.className = `form-frame form-frame--${formInfo.shapeValue || "yuvarlak"}`;
  frame.style.setProperty("--mold-aspect", formInfo.moldAspect || "1 / 1");
  frame.style.setProperty("--mold-frame-width", "72%");

  const image = document.createElement("img");
  image.src = formInfo.sketchUrl || DEV_SKETCH_DATA_URL;
  image.alt = "";
  image.decoding = "async";
  image.loading = "lazy";

  const stone = document.createElement("span");
  stone.className = "finish-stone";

  frame.append(image);
  shell.append(frame, stone);
  visual.append(label, shell);

  return visual;
}

function setMockupStatusMessage(message, tone, options = {}) {
  const el = (visualizationPanelForStage(options.stage) || activeVisualizationPanel() || document)
    .querySelector("[data-mockup-status-msg]");
  if (!el) return;
  const visible = isVisibleStatusTone(tone);
  el.textContent = visible ? message || "" : "";
  el.classList.toggle("is-error", visible && tone === "error");
  el.classList.toggle("is-success", visible && tone === "notice");
  el.classList.toggle("is-warning", visible && tone === "warning");
}

// Mockup (3. aşama) ve manken (4. aşama) artık ayrı paneller kullanır; ortak olan
// yalnızca üretim pipeline'ıdır. Bu fonksiyon doğru paneli gösterip diğerini gizler.
function enterVisualizationStage(stage, options = {}) {
  const isManken = stage === "manken";
  const allowMissing = options.allowMissing === true;
  const finishInfo = getSelectedFinishInfo();
  if (!finishInfo && !allowMissing) {
    setFinishStatusMessage(
      `${isManken ? "Manken" : "Mockup"} aşaması için önce bir ürün fotoğrafı seç.`,
      "error"
    );
    return;
  }

  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  const activePanel = document.querySelector(isManken ? '[data-stage-panel="manken"]' : '[data-stage-panel="mockup"]');
  const inactivePanel = document.querySelector(isManken ? '[data-stage-panel="mockup"]' : '[data-stage-panel="manken"]');

  const activePanelFinishId = activePanel?.dataset.finishId || "";
  if (finishInfo && activePanelFinishId && activePanelFinishId !== finishInfo.title && !isRestoringProject) {
    clearMockupResults();
    if (activePanel) activePanel.dataset.finishId = finishInfo.title;
  } else if (finishInfo && activePanel) {
    activePanel.dataset.finishId = finishInfo.title;
  } else if (!finishInfo && activePanel) {
    delete activePanel.dataset.finishId;
  }

  newDesignStudio?.classList.remove("is-finish-stage", "is-form-stage", "is-mockup-stage", "is-manken-stage");
  newDesignStudio?.classList.add(isManken ? "is-manken-stage" : "is-mockup-stage");
  setSceneSelection(isManken ? "manken" : "mockup");
  updateMockupCost();
  finishPanel?.setAttribute("hidden", "");
  inactivePanel?.setAttribute("hidden", "");
  activePanel?.removeAttribute("hidden");
  syncResultStageVisibility("mockup");
  renderMockupPreview(finishInfo);
  if (isManken) setWorkflowForMankenStage();
  else setWorkflowForMockupStage();
  applyStageRestrictions();
  if (!finishInfo) {
    setMockupStatusMessage(
      `${isManken ? "Manken" : "Mockup"} için ürün fotoğrafı yükle veya Ürün görseli aşamasından seçim yap.`,
      "warning"
    );
  } else {
    setMockupStatusMessage("");
  }
  scheduleManagedImageVisibilityRefresh();
  queueActiveProjectSave();
}

function enterMockupStage(options = {}) {
  enterVisualizationStage("mockup", options);
}

function enterMankenStage(options = {}) {
  enterVisualizationStage("manken", options);
}

function exitMockupStage() {
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');

  newDesignStudio?.classList.remove("is-mockup-stage", "is-manken-stage");
  newDesignStudio?.classList.add("is-finish-stage");
  clearMockupResults();
  document
    .querySelectorAll('[data-stage-panel="mockup"], [data-stage-panel="manken"]')
    .forEach((panel) => panel.setAttribute("hidden", ""));
  finishPanel?.removeAttribute("hidden");
  setWorkflowForFinishStage();
  setMockupStepReady(Boolean(getSelectedFinishInfo()));
  queueActiveProjectSave();
}

function renderMockupPreview(finishInfo) {
  const slot = (activeVisualizationPanel() || document).querySelector("[data-mockup-product-preview]");
  if (!slot) return;
  if (!finishInfo) {
    replaceChildrenReleasing(slot);
    return;
  }
  // Stage-1 ham tasarım seçiminde elde kompozit yok. createFinishVisual bu durumda
  // kare tasarımı CSS yüzük şablonunun içine yapıştırıp bozuk gösteriyordu; bunun
  // yerine seçilen tasarımı temiz göster. Gerçek ürün kompoziti üretimde server'da
  // oluşturuluyor.
  const generatedImageUrl = finishInfo.finishImageUrl || finishInfo.imageUrl || "";
  const renderMode = finishInfo.renderMode || (generatedImageUrl ? "generated" : "composite");
  if (renderMode !== "generated" || !generatedImageUrl) {
    replaceChildrenReleasing(slot, createMockupDesignPreview(finishInfo));
    return;
  }
  replaceChildrenReleasing(slot, createFinishVisual(finishInfo));
}

function createMockupDesignPreview(finishInfo) {
  const visual = document.createElement("div");
  visual.className = "finish-result-visual bg-temiz has-generated-image";

  const label = document.createElement("span");
  label.className = "form-measure-label";
  label.textContent = finishInfo.metalLabel || finishInfo.metal?.label || "Gümüş";

  const designUrl = finishInfo.sketchUrl || finishInfo.sourceFormUrl || finishInfo.finishImageUrl || "";
  const image = document.createElement("img");
  image.className = "generated-finish-image";
  image.alt = "";
  setManagedImageSrc(image, designUrl || DEV_SKETCH_DATA_URL);

  visual.append(label, image);
  return visual;
}

async function generateMockupResults() {
  const finishInfo = getSelectedFinishInfo();
  if (!finishInfo) {
    setMockupStatusMessage("Görsel oluşturmak için seçili bir ürün fotoğrafı gerekli.", "error");
    return;
  }

  const scene = readSelectedChip("scene");
  const channel = readSelectedChip("channel");
  const visualStyle = readSelectedChip("visual-style");
  const ratio = readSelectedChip("ratio");
  const { creditCost, mockupCount, resolution, resolutionLabel } = selectedMockupConfig();
  const resolutionConfig = { label: resolutionLabel, value: resolution };
  const normalizedScene = normalizeMockupScene(scene);
  const stage = normalizedScene.value === "manken" ? "manken" : "mockup";
  const generationLabel = `${mockupCount} ${normalizedScene.value === "manken" ? "manken" : "mockup"} görseli oluşturma (${resolutionConfig.label})`;
  const stageLabel = stage === "manken" ? "4. aşama manken" : "3. aşama mockup";
  if (!ensureCreditsForGeneration({ amount: creditCost, label: generationLabel, stage })) return;
  const useRealApi = shouldUseRealMockupApi();

  setMockupGeneratingState(true);
  showResultLoading("mockup", mockupCount, { stage });
  setMockupStatusMessage(
    useRealApi
      ? `${stageLabel} görseli hazırlanıyor. Bu biraz sürebilir...`
      : "Test modu aktif. API çağrısı yapmadan örnek vitrin kartları hazırlanıyor...",
    undefined,
    { stage }
  );
  try {
    const results = useRealApi
      ? await generateRealMockupResults({
          channel,
          creditCost,
          finishInfo,
          generationLabel,
          mockupCount,
          ratio,
          resolution: resolutionConfig,
          scene: normalizedScene,
          stage,
          visualStyle,
        })
      : await generateDummyMockupResults({ channel, finishInfo, mockupCount, ratio, resolution: resolutionConfig, scene: normalizedScene, visualStyle });
    if (!useRealApi) {
      showMockupResults(results, { append: true, stage });
      const autoSaveResult = await autoSaveMockupResultsToArchive(results);
      spendCredits({ amount: creditCost, label: generationLabel, stage });
      setMockupStatusMessage(
        `${results.length} vitrin görseli hazır. ${creditCost} kredi harcandı. Beğendiğin sonucu seçebilirsin.${formatAutoSaveStatusSuffix(autoSaveResult)}`,
        "success",
        { stage }
      );
    }
  } catch (error) {
    removeResultLoading("mockup", { stage });
    setMockupStatusMessage(error?.message || `${stageLabel} görseli hazırlanamadı.`, "error", { stage });
  } finally {
    setMockupGeneratingState(false);
  }
}

async function generateDummyMockupResults(options) {
  await new Promise((resolve) => setTimeout(resolve, 360));
  return buildDummyMockupResults(options);
}

function buildDummyMockupResults({ channel, finishInfo, mockupCount, ratio, resolution, scene, visualStyle }) {
  return Array.from({ length: mockupCount }, (_, index) => ({
    channel,
    finishInfo,
    id: `mockup-${Date.now()}-${index}`,
    index: index + 1,
    ratio,
    resolution,
    scene,
    visualStyle,
  }));
}

async function generateRealMockupResults({ channel, creditCost, finishInfo, generationLabel, mockupCount, ratio, resolution, scene, stage = "mockup", visualStyle }) {
  let job = null;
  try {
    job = createGenerationJob({
      count: mockupCount,
      creditCost,
      label: generationLabel,
      metadata: { channel, finishInfo, ratio, resolution, scene, visualStyle },
      stage,
    });
    publishPendingSavedDesigns(job, buildPendingSavedDesignEntries(job));
    const requestPayload = await buildMockupRequestPayload({
      channel,
      finishInfo,
      mockupCount,
      ratio,
      resolution,
      scene,
      visualStyle,
    });
    const { job: submittedJob, payload } = await submitGenerationJob({
      apiUrl: mockupApiUrl(),
      job,
      requestPayload,
    });
    await completeMockupGeneration(submittedJob, payload);
  } catch (error) {
    if (job?.id) removePendingSavedDesigns(job.id);
    throw error;
  }
  return [];
}

async function autoSaveMockupResultsToArchive(results, options = {}) {
  const safeResults = Array.isArray(results) ? results.filter((result) => result?.imageUrl) : [];
  if (!safeResults.length) return null;

  const finishInfo = safeResults.find((result) => result?.finishInfo)?.finishInfo || options.finishInfo || {};
  const sourceImageUrl = await savedSourceImageUrlFromFinishInfo(finishInfo);
  const job = options.job || null;
  const projectId = job ? generationProjectId(job) : activeProjectId;
  const projectTitle = job ? generationProjectTitle(job) : projectTitleById(projectId);

  return autoSaveGeneratedDesigns(
    safeResults.map((result) => ({
      ...designProfileFieldsFromSource(result.finishInfo || finishInfo),
      ...storageFieldsFromSource(result),
      imageUrl: result.imageUrl,
      projectId,
      projectTitle,
      sourceImageUrl,
      sourceFileName: (result.finishInfo || finishInfo)?.title || "",
      sourceStage: "mockup",
      sourceTitle: (result.finishInfo || finishInfo)?.title || "",
      stage: "Mockup / Manken Foto",
      title: mockupResultTitle(result),
    })),
    job ? { job } : {}
  );
}

async function completeMockupGeneration(job, payload, options = {}) {
  const { channel, finishInfo, ratio, resolution, scene, visualStyle } = job.metadata || {};
  const images = Array.isArray(payload.images) ? payload.images : [];
  if (!images.length) {
    throw new Error("Mockup fotoğrafı üretildi ancak görsel döndürülmedi.");
  }

  const generatedAt = generationResultTimestamp(job, payload);
  const results = images.map((image, index) => ({
    ...storageFieldsFromSource(image),
    channel,
    finishInfo,
    generatedAt: validIsoDate(image.generatedAt || image.createdAt || image.savedAt || "") || generatedAt,
    id: `mockup-${payload.requestId || Date.now()}-${index}`,
    imageUrl: image.url,
    index: index + 1,
    ratio,
    resolution,
    scene,
    visualStyle,
  }));
  const shouldRenderToWorkspace = isGenerationForActiveProject(job);
  if (shouldRenderToWorkspace) {
    showMockupResults(results, { append: true, stage: job.stage });
  }
  persistMockupResultsToProject(job, results);
  const autoSaveResult = await autoSaveMockupResultsToArchive(results, { finishInfo, job });
  spendCredits({ amount: job.creditCost, jobId: job.id, label: job.label, stage: isVisualizationStage(job.stage) ? job.stage : "mockup" });
  await finalizeGenerationDelivery(job);
  if (shouldRenderToWorkspace) {
    setMockupStatusMessage(
      `${results.length} vitrin görseli hazır. ${job.creditCost} kredi harcandı.${options.recovered ? " Sayfa yenilendikten sonra sonuç geri alındı." : ""} Beğendiğin sonucu seçebilirsin.${formatAutoSaveStatusSuffix(autoSaveResult)}${formatStorageWarningStatusSuffix(payload)}`,
      "success",
      { stage: job.stage }
    );
  }
  setMockupGeneratingState(false);
  return results;
}

async function buildMockupRequestPayload({ channel, finishInfo, mockupCount, ratio, resolution, scene, visualStyle }) {
  const normalizedScene = normalizeMockupScene(scene);
  const normalizedResolution = mockupResolutionConfig(resolution?.value);
  const normalizedMockupCount = normalizeMockupCountValue(mockupCount);
  const productValue = finishInfo.productValue || "yuzuk";
  const productShape = finishInfo.productShapeValue || finishInfo.shapeValue || "yuvarlak";
  const metalValue = finishInfo.metalValue || "altin";
  const payload = {
    channel: channel.value || "etsy",
    designMode: finishInfo.designModeValue || "engrave",
    metal: metalValue,
    mockupCount: normalizedMockupCount,
    product: productValue,
    productShape,
    ratio: ratio.value || "square",
    resolution: normalizedResolution.value,
    scene: normalizedScene.value,
    sourceTitle: finishInfo.title || "",
    surface: finishInfo.surfaceValue || "parlak",
    visualStyle: visualStyle.value || "minimal",
    // 3. aşama her zaman 2. aşama kompozitini referans alır. Kullanıcı yalnızca
    // 1. aşama tasarımı seçtiyse kompozit yoktur; bu finish opsiyonlarıyla sunucu
    // tasarımı ürün yüzeyine oturtup (buildFinishImages) öyle gönderir.
    background: finishInfo.backgroundValue || "dekupe",
    ringMold:
      (productValue === "yuzuk" && productShape !== "dikdortgen") || productValue === "kolye"
        ? finishRingMoldKeyFor(productShape, metalValue, productValue)
        : "",
  };
  if (productValue === "yuzuk" && finishInfo.sidePrint) {
    payload.sidePrint = true;
  }

  const directFileMatches = (url) =>
    directMockupFinishFile &&
    directMockupFinish &&
    [directMockupFinish.finishImageUrl, directMockupFinish.sketchUrl, directMockupFinish.sourceFormUrl].includes(url);

  // renderMode "sketch": elde sadece 1. aşama (düz) tasarımı var → sunucu kompozitlesin.
  if ((finishInfo.renderMode || "") === "sketch") {
    const designSource = finishInfo.sketchUrl || finishInfo.sourceFormUrl || "";
    payload.compositeFromDesign = true;
    if (/^https?:\/\//i.test(designSource)) {
      payload.designUrl = designSource;
      return payload;
    }
    if (designSource.startsWith("data:image/")) {
      payload.designDataUrl = designSource;
      return payload;
    }
    if (directFileMatches(designSource)) {
      payload.designDataUrl = await readFileAsDataUrl(directMockupFinishFile);
      return payload;
    }
    throw new Error("Bu tasarım doğrudan API'ye gönderilemiyor. Görseli yeniden yükleyip tekrar dene.");
  }

  // Zaten bitmiş ürün/kompozit (2. aşama sonucu ya da yüklenen ürün görseli).
  const productSource = finishInfo.finishImageUrl || finishInfo.sketchUrl || finishInfo.sourceFormUrl || "";
  if (/^https?:\/\//i.test(productSource)) {
    payload.productUrl = productSource;
    return payload;
  }
  if (productSource.startsWith("data:image/")) {
    payload.imageDataUrl = productSource;
    return payload;
  }
  if (directFileMatches(productSource)) {
    payload.imageDataUrl = await readFileAsDataUrl(directMockupFinishFile);
    return payload;
  }

  throw new Error("Bu ürün fotoğrafı doğrudan API'ye gönderilemiyor. Görseli yeniden yükleyip tekrar dene.");
}

function setMockupGeneratingState(isGenerating) {
  document.querySelectorAll("[data-generate-mockup]").forEach((button) => {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent;
    }

    button.disabled = isGenerating;
    button.classList.toggle("is-disabled", isGenerating);
    button.textContent = isGenerating ? "Görsel hazırlanıyor..." : button.dataset.originalLabel;
  });
}

function showMockupResults(results, options = {}) {
  const stage = isVisualizationStage(options.stage) ? options.stage : currentVisualizationStage();
  const resultGrid = (visualizationPanelForStage(stage) || activeVisualizationPanel() || document)
    .querySelector("[data-mockup-result-grid]");
  if (!resultGrid) return;

  const safeResults = Array.isArray(results) ? results : [];
  const cards = safeResults.map(createMockupResultCard);
  removeResultLoading("mockup", { stage });
  if (options.append) {
    resultGrid.prepend(...cards);
  } else {
    replaceChildrenReleasing(resultGrid, ...cards);
  }
  const hasResults = Boolean(resultGrid.querySelector("[data-mockup-result-card]"));
  resultGrid.hidden = !hasResults;
  syncMockupResultUi();
  if (!isRestoringProject) flushProjectSave();
  else queueActiveProjectSave();
}

function mockupResultTitle(result, index = result.index || 1) {
  const scene = normalizeMockupScene(result.scene || { label: result.sceneLabel, value: result.sceneValue });
  return `${scene.label} ${String(index).padStart(2, "0")}`;
}

function persistMockupResultsToProject(job, results) {
  const projectId = generationProjectId(job);
  if (!projectId) return false;
  if (activeProjectId === projectId) return flushProjectSave();

  const incomingResults = Array.isArray(results)
    ? results.filter((result) => result?.imageUrl || result?.id)
    : [];
  if (!incomingResults.length) return false;

  return patchProjectState(
    projectId,
    (state) => {
      const mockupResults = Array.isArray(state.mockupResults) ? [...state.mockupResults] : [];
      const seenKeys = new Set(
        mockupResults
          .map((result) => result.mockupImageUrl || result.id)
          .filter(Boolean)
      );

      incomingResults.forEach((result) => {
        const key = result.imageUrl || result.id;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);
        mockupResults.push(mockupResultProjectState(result, mockupResults.length));
      });

      return {
        ...state,
        mockupResults,
        stage: maxProjectStage(state.stage, isVisualizationStage(job.stage) ? job.stage : "mockup"),
      };
    },
    {
      createdAt: job.createdAt,
      title: generationProjectTitle(job),
    }
  );
}

function mockupResultProjectState(result, index) {
  const finishInfo = result.finishInfo || {};
  const channel = result.channel || {};
  const ratio = result.ratio || {};
  const resolution = result.resolution || {};
  const scene = result.scene || {};
  const visualStyle = result.visualStyle || {};
  const resultIndex = index + 1;
  const normalizedScene = normalizeMockupScene(scene);
  const sceneLabel = normalizedScene.label;

  return {
    ...storageFieldsFromSource(result),
    channelLabel: channel.label || "Etsy",
    channelValue: channel.value || "etsy",
    finishInfo,
    finishImageUrl: safePersistedImageUrl(finishInfo.finishImageUrl || "", "finishImageUrl"),
    id: result.id || `mockup-saved-${Date.now()}-${index}`,
    index: resultIndex,
    mockupImageUrl: safePersistedImageUrl(result.imageUrl || "", "mockupImageUrl"),
    ratioLabel: ratio.label || "1:1",
    ratioValue: ratio.value || "square",
    resolutionLabel: resolution.label || String(resolution.value || "1k").toUpperCase(),
    resolutionValue: resolution.value || "1k",
    sceneLabel,
    sceneValue: normalizedScene.value,
    selected: false,
    subtitle: `${sceneLabel} · ${channel.label || "Etsy"} · ${ratio.label || "1:1"} · ${resolution.label || String(resolution.value || "1k").toUpperCase()} · ${finishInfo.title || "Ürün renderı"}`,
    title: `${sceneLabel} ${String(resultIndex).padStart(2, "0")}`,
    visualStyleLabel: visualStyle.label || "Minimal",
    visualStyleValue: visualStyle.value || "minimal",
  };
}

function createMockupResultCard(result) {
  const channel = result.channel || {};
  const finishInfo = result.finishInfo || {};
  const finishProfile = designProfileFromFields(finishInfo);
  const ratio = result.ratio || {};
  const resolution = result.resolution || {};
  const scene = result.scene || {};
  const normalizedScene = normalizeMockupScene(scene);
  const visualStyle = result.visualStyle || {};
  const card = document.createElement("article");
  card.className = "sketch-card mockup-result-card";
  if (result.selected) card.classList.add("is-selected");
  card.dataset.mockupResultCard = "1";
  card.dataset.mockupResultId = result.id;
  card.dataset.resultTitle = result.title || mockupResultTitle(result);
  writeStorageDataset(card, result);
  card.dataset.channelLabel = channel.label || "Etsy";
  card.dataset.channelValue = channel.value || "etsy";
  card.dataset.ratioLabel = ratio.label || "1:1";
  card.dataset.ratioValue = ratio.value || "square";
  card.dataset.resolutionLabel = resolution.label || String(resolution.value || "1k").toUpperCase();
  card.dataset.resolutionValue = resolution.value || "1k";
  card.dataset.sceneLabel = normalizedScene.label;
  card.dataset.sceneValue = normalizedScene.value;
  card.dataset.visualStyleLabel = visualStyle.label || "Minimal";
  card.dataset.visualStyleValue = visualStyle.value || "minimal";
  card.dataset.backgroundLabel = finishInfo.backgroundLabel || "Dekupe";
  card.dataset.backgroundValue = finishInfo.backgroundValue || "dekupe";
  card.dataset.designModeLabel = finishInfo.designModeLabel || finishProfile.designModeLabel;
  card.dataset.designModeValue = finishInfo.designModeValue || finishProfile.designModeValue;
  card.dataset.finishImageUrl = finishInfo.finishImageUrl || "";
  card.dataset.finishTitle = finishInfo.title || "Ürün renderı";
  card.dataset.metalLabel = finishInfo.metalLabel || "Altın";
  card.dataset.metalValue = finishInfo.metalValue || "altin";
  card.dataset.moldAspect = finishInfo.moldAspect || finishProfile.moldAspect;
  card.dataset.moldMeasure = finishInfo.moldMeasure || "";
  card.dataset.moldTitle = finishInfo.moldTitle || "Tasarım";
  card.dataset.productLabel = finishInfo.productLabel || finishProfile.productLabel;
  card.dataset.productShapeLabel = finishInfo.productShapeLabel || finishInfo.shapeLabel || finishProfile.productShapeLabel;
  card.dataset.productShapeValue = finishInfo.productShapeValue || finishInfo.shapeValue || finishProfile.productShapeValue;
  card.dataset.productValue = finishInfo.productValue || finishProfile.productValue;
  card.dataset.renderMode = finishInfo.renderMode || "composite";
  card.dataset.shapeValue = finishInfo.shapeValue || finishInfo.productShapeValue || finishProfile.shapeValue;
  card.dataset.sidePrint = finishInfo.sidePrint ? "1" : "";
  card.dataset.sidePrintLeft = finishInfo.sidePrintLeft || "";
  card.dataset.sidePrintRight = finishInfo.sidePrintRight || "";
  card.dataset.sketchUrl = finishInfo.sketchUrl || "";
  card.dataset.sourceFormUrl = finishInfo.sourceFormUrl || "";
  card.dataset.stoneLabel = finishInfo.stoneLabel || "Yok";
  card.dataset.stoneValue = finishInfo.stoneValue || "yok";
  card.dataset.surfaceLabel = finishInfo.surfaceLabel || "Parlak";
  card.dataset.surfaceValue = finishInfo.surfaceValue || "parlak";
  card.dataset.mockupImageUrl = result.imageUrl || "";
  card.tabIndex = 0;

  const badge = document.createElement("span");
  badge.className = "selected-badge";
  badge.textContent = "Seçili";

  const visual = document.createElement("div");
  visual.className = `mockup-result-visual scene-${normalizedScene.value} ratio-${ratio.value || "square"}`;

  if (result.imageUrl) {
    visual.classList.add("has-generated-image");
    const image = document.createElement("img");
    image.className = "generated-mockup-image";
    image.alt = "";
    setManagedImageSrc(image, result.imageUrl);
    visual.append(image);
  } else {
    const scene = document.createElement("span");
    scene.className = "mockup-scene";

    const channel = document.createElement("span");
    channel.className = "mockup-channel-label";
    channel.textContent = `${card.dataset.channelLabel} · ${card.dataset.visualStyleLabel}`;

    const product = document.createElement("div");
    product.className = "mockup-product";
    const finishVisual = createFinishVisual(finishInfo);
    const generatedImage = finishVisual.querySelector(".generated-finish-image");
    const finishShell = finishVisual.querySelector(".finish-shell");
    if (generatedImage) {
      const image = generatedImage.cloneNode();
      image.className = "mockup-product-image";
      image.decoding = "async";
      image.loading = "lazy";
      product.append(image);
    } else if (finishShell) {
      product.append(finishShell);
    }

    visual.append(scene, product, channel);
  }

  const body = document.createElement("div");
  body.className = "sketch-body";

  const subtitle = document.createElement("span");
  subtitle.textContent = `${card.dataset.sceneLabel} · ${card.dataset.channelLabel} · ${card.dataset.ratioLabel} · ${card.dataset.resolutionLabel} · ${finishInfo.title || "Ürün renderı"}`;

  card.setAttribute("aria-label", `${card.dataset.resultTitle}. ${subtitle.textContent}`);

  body.append(subtitle);
  card.append(badge, visual, body);
  card.addEventListener("click", () => selectMockupResult(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectMockupResult(card);
    }
  });

  return card;
}

function selectMockupResult(selectedCard) {
  document.querySelectorAll("[data-mockup-result-card]").forEach((card) => {
    card.classList.toggle("is-selected", card === selectedCard);
  });
  setFinalDesignReady(true);
  queueActiveProjectSave();
}

function hasActiveMockupSelection() {
  return Boolean((activeVisualizationPanel() || document).querySelector("[data-mockup-result-card].is-selected"));
}

function setFinalDesignReady(isReady) {
  // Hem mockup hem manken panelindeki kaydet/sipariş butonlarını birlikte güncelle.
  document.querySelectorAll("[data-save-mockup-design], [data-production-request]").forEach((button) => {
    button.disabled = !isReady;
    button.classList.toggle("is-disabled", !isReady);
  });
}
