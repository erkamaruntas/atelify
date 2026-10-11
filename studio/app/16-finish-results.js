// Atelify stüdyo — finish-results
// Aşama 2 sonuçları: sunucu çağrısı, sonuç kartları ve seçim.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


async function generateRealFinishResults({ background, creditCost, finishCount, formInfo, generationLabel, metal, sidePrint, stone, surface }) {
  let job = null;
  try {
    job = createGenerationJob({
      count: finishCount,
      creditCost,
      label: generationLabel,
      metadata: { background, formInfo, metal, stone, surface },
      stage: "finish",
    });
    publishPendingSavedDesigns(job, buildPendingSavedDesignEntries(job));
    const requestPayload = await buildFinishRequestPayload({ background, finishCount, formInfo, metal, sidePrint, stone, surface });
    const { job: submittedJob, payload } = await submitGenerationJob({
      apiUrl: finishApiUrl(),
      job,
      requestPayload,
    });
    await completeFinishGeneration(submittedJob, payload, { serverCharged: true });
  } catch (error) {
    if (job?.id) removePendingSavedDesigns(job.id);
    throw error;
  }
  return [];
}

async function autoSaveFinishResultsToArchive(results, options = {}) {
  const safeResults = Array.isArray(results) ? results.filter((result) => result?.imageUrl) : [];
  if (!safeResults.length) return null;

  const formInfo = safeResults.find((result) => result?.formInfo)?.formInfo || options.formInfo || {};
  const sourceImageUrl = await savedSourceImageUrlFromFormInfo(formInfo);
  const job = options.job || null;
  const projectId = job ? generationProjectId(job) : activeProjectId;
  const projectTitle = job ? generationProjectTitle(job) : projectTitleById(projectId);

  return autoSaveGeneratedDesigns(
    safeResults.map((result) => ({
      ...designProfileFieldsFromSource(result.formInfo || formInfo),
      ...storageFieldsFromSource(result),
      imageUrl: result.imageUrl,
      projectId,
      projectTitle,
      sourceImageUrl,
      sourceFileName: (result.formInfo || formInfo)?.title || "",
      sourceStage: "finish",
      sourceTitle: (result.formInfo || formInfo)?.title || "",
      stage: "Ürün Görseli",
      metalLabel: result.metal?.label || "",
      metalValue: result.metal?.value || "",
      title: finishResultTitle(result),
    })),
    job ? { job } : {}
  );
}

async function completeFinishGeneration(job, payload, options = {}) {
  const { background, formInfo, metal, stone, surface } = job.metadata || {};
  const images = Array.isArray(payload.images) ? payload.images : [];
  if (!images.length) {
    throw new Error("Ürün görseli üretildi ancak görsel döndürülmedi.");
  }

  const generatedAt = generationResultTimestamp(job, payload);
  // Yan baskı bilgisi server'ın döndürdüğü finish opsiyonlarından gelir; proje
  // snapshot'ında korunur ve 3./4. aşamada bitmiş ürün referansıyla birlikte taşınır.
  const finishMeta = payload.finish && typeof payload.finish === "object" ? payload.finish : {};
  const results = images.map((image, index) => ({
    ...storageFieldsFromSource(image),
    background,
    formInfo,
    generatedAt: validIsoDate(image.generatedAt || image.createdAt || image.savedAt || "") || generatedAt,
    id: `finish-${payload.requestId || Date.now()}-${index}`,
    imageUrl: image.url,
    index: index + 1,
    metal,
    renderMode: "generated",
    sidePrint: finishMeta.sidePrint === true,
    sidePrintLeft: finishMeta.sidePrint ? (finishMeta.sidePrintLeft || "") : "",
    sidePrintRight: finishMeta.sidePrint ? (finishMeta.sidePrintRight || "") : "",
    stone,
    surface,
  }));
  const shouldRenderToWorkspace = isGenerationForActiveProject(job);
  if (shouldRenderToWorkspace) {
    showFinishResults(results, { append: true });
  }
  persistFinishResultsToProject(job, results);
  const autoSaveResult = await autoSaveFinishResultsToArchive(results, { formInfo, job });
  if (!options.serverCharged) {
    spendCredits({ amount: job.creditCost, jobId: job.id, label: job.label, stage: "finish" });
  }
  await finalizeGenerationDelivery(job);
  if (shouldRenderToWorkspace) {
    setFinishStatusMessage(
      `${results.length} ürün görseli hazır. ${job.creditCost} kredi harcandı.${options.recovered ? " Sayfa yenilendikten sonra sonuç geri alındı." : ""} Beğendiğin ürünü seçince Mockup / Manken aşaması açılır.${formatAutoSaveStatusSuffix(autoSaveResult)}${formatStorageWarningStatusSuffix(payload)}`,
      "success"
    );
  }
  setFinishGeneratingState(false);
  return results;
}

async function buildFinishRequestPayload({ background, finishCount, formInfo, metal, sidePrint, stone, surface }) {
  // Şekil baştaki proje seçiminden gelir; 2. aşamada tekrar seçilmez. Eskiz şekilden
  // bağımsız (1:1) üretilse de, çerçeve burada projenin şekline göre uygulanır.
  const productShape = formInfo.productShapeValue || formInfo.shapeValue || selectedDesignProfile().productShapeValue;
  const productValue = formInfo.productValue || "yuzuk";
  const payload = {
    background: background.value || "dekupe",
    designMode: formInfo.designModeValue || selectedDesignProfile().designModeValue,
    finishCount,
    metal: metal.value || "gumus",
    product: productValue,
    productShape,
    sidePrint: productValue === "yuzuk" && sidePrint?.value === "evet",
    ringMold: (productValue === "yuzuk" && productShape !== "dikdortgen") || productValue === "kolye"
      ? finishRingMoldKeyFor(productShape, metal.value || "gumus", productValue)
      : "",
    sourceKind: "sketch",
    sourceTitle: formInfo.title || "",
    stone: "yok",
    surface: surface.value || "parlak",
  };
  // Yan baskı açıksa kullanıcının sol/sağ omuz için seçtiği emblemleri ekle.
  if (payload.sidePrint) {
    const emblems = readSidePrintEmblems();
    payload.sidePrintLeft = emblems.left;
    payload.sidePrintRight = emblems.right;
  }
  const moldReferenceDataUrl = await loadRingMoldReferenceDataUrl();
  if (moldReferenceDataUrl) {
    payload.moldReferenceDataUrl = moldReferenceDataUrl;
  }
  const sourceUrl = formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "";

  if (/^https?:\/\//i.test(sourceUrl)) {
    payload.sourceUrl = sourceUrl;
    return payload;
  }

  if (sourceUrl.startsWith("data:image/")) {
    payload.imageDataUrl = sourceUrl;
    return payload;
  }

  if (
    directFinishFormFile &&
    directFinishForm &&
    [directFinishForm.formImageUrl, directFinishForm.sourceFormUrl, directFinishForm.sketchUrl].includes(sourceUrl)
  ) {
    payload.imageDataUrl = await readFileAsDataUrl(directFinishFormFile);
    return payload;
  }

  throw new Error("Bu görsel doğrudan API'ye gönderilemiyor. Görseli yeniden yükleyip tekrar dene.");
}

async function loadRingMoldReferenceDataUrl() {
  if (!ringMoldReferenceDataUrlPromise) {
    ringMoldReferenceDataUrlPromise = fetch(RING_MOLD_REFERENCE_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Ürün kalıp referansı yüklenemedi.");
        return response.blob();
      })
      .then((blob) => readFileAsDataUrl(blob))
      .catch(() => "");
  }

  return ringMoldReferenceDataUrlPromise;
}

function setFinishGeneratingState(isGenerating) {
  isFinishGenerating = Boolean(isGenerating);
  document.querySelectorAll("[data-generate-finish]").forEach((button) => {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent;
    }

    button.disabled = isGenerating;
    button.classList.toggle("is-disabled", isGenerating);
    button.textContent = isGenerating ? "Ürün görseli hazırlanıyor..." : button.dataset.originalLabel;
  });
}

function showFinishResults(results, options = {}) {
  const resultGrid = document.querySelector("[data-finish-result-grid]");
  if (!resultGrid) return;

  const safeResults = Array.isArray(results) ? results : [];
  const cards = safeResults.map(createFinishResultCard);
  removeResultLoading("finish");
  if (options.append) {
    resultGrid.prepend(...cards);
  } else {
    replaceChildrenReleasing(resultGrid, ...cards);
  }
  const hasResults = Boolean(resultGrid.querySelector("[data-finish-result-card]"));
  resultGrid.hidden = !hasResults;
  newDesignStudio?.classList.toggle("has-finish-result", hasResults);
  if (newDesignStudio?.classList.contains("is-finish-stage")) setWorkflowForFinishStage();
  applyStageRestrictions();
  setMockupStepReady(Boolean(getSelectedFinishInfo()));
  if (!isRestoringProject) flushProjectSave();
  else queueActiveProjectSave();
}

function finishResultTitle(result, index = result.index || 1) {
  const metalLabel = result.metal?.label || result.metalLabel || "Ürün";
  const formLabel = result.formInfo?.moldTitle || result.formInfo?.productLabel || "render";
  return `${metalLabel} ${formLabel} ${String(index).padStart(2, "0")}`;
}

function persistFinishResultsToProject(job, results) {
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
      const finishResults = Array.isArray(state.finishResults) ? [...state.finishResults] : [];
      const seenKeys = new Set(
        finishResults
          .map((result) => result.finishImageUrl || result.id)
          .filter(Boolean)
      );

      incomingResults.forEach((result) => {
        const key = result.imageUrl || result.id;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);
        finishResults.push(finishResultProjectState(result, finishResults.length));
      });

      return {
        ...state,
        finishResults,
        stage: maxProjectStage(state.stage, "finish"),
      };
    },
    {
      createdAt: job.createdAt,
      title: generationProjectTitle(job),
    }
  );
}

function finishResultProjectState(result, index) {
  const formInfo = result.formInfo || {};
  const profile = designProfileFromFields(formInfo);
  const background = result.background || {};
  const metal = result.metal || {};
  const stone = result.stone || {};
  const surface = result.surface || {};
  const resultIndex = index + 1;
  const metalLabel = metal.label || "Altın";
  const moldTitle = formInfo.moldTitle || formInfo.productLabel || "Ürün";

  return {
    ...storageFieldsFromSource(result),
    backgroundLabel: background.label || "Dekupe",
    backgroundValue: background.value || "dekupe",
    designModeLabel: formInfo.designModeLabel || profile.designModeLabel,
    designModeValue: formInfo.designModeValue || profile.designModeValue,
    finishImageUrl: safePersistedImageUrl(result.imageUrl || "", "finishImageUrl"),
    id: result.id || `finish-saved-${Date.now()}-${index}`,
    index: resultIndex,
    metalLabel,
    metalValue: metal.value || "altin",
    moldAspect: formInfo.moldAspect || profile.moldAspect,
    moldHeightCm: formInfo.moldHeightCm || "",
    moldKey: formInfo.moldKey || "",
    moldMeasure: formInfo.moldMeasure || "",
    moldShape: formInfo.moldShape || formInfo.shapeValue || profile.shapeValue,
    moldSizeLabel: formInfo.moldSizeLabel || formInfo.moldMeasure || "",
    moldTitle,
    moldWidthCm: formInfo.moldWidthCm || "",
    productLabel: formInfo.productLabel || profile.productLabel,
    productShapeLabel: formInfo.productShapeLabel || formInfo.shapeLabel || profile.productShapeLabel,
    productShapeValue: formInfo.productShapeValue || formInfo.shapeValue || profile.productShapeValue,
    productValue: formInfo.productValue || profile.productValue,
    renderMode: result.renderMode || (result.imageUrl ? "generated" : "composite"),
    selected: false,
    shapeValue: formInfo.shapeValue || formInfo.productShapeValue || profile.shapeValue,
    sketchUrl: safePersistedImageUrl(result.imageUrl || formInfo.sketchUrl || "", "sketchUrl"),
    sourceFormUrl: safePersistedImageUrl(formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "", "sourceFormUrl"),
    stoneLabel: stone.label || "Yok",
    stoneValue: stone.value || "yok",
    subtitle: `${moldTitle}${formInfo.moldMeasure ? ` · ${formInfo.moldMeasure}` : ""} · ${surface.label || "Parlak"} · ${background.label || "Dekupe"}`,
    surfaceLabel: surface.label || "Parlak",
    surfaceValue: surface.value || "parlak",
    title: `${metalLabel} ${moldTitle} ${String(resultIndex).padStart(2, "0")}`,
  };
}

function createFinishResultCard(result) {
  const background = result.background || {};
  const formInfo = result.formInfo || {};
  const profile = designProfileFromFields(formInfo);
  const metal = result.metal || {};
  const stone = result.stone || {};
  const surface = result.surface || {};
  const card = document.createElement("article");
  card.className = "sketch-card finish-result-card";
  card.dataset.finishResultCard = "1";
  card.dataset.finishResultId = result.id;
  card.dataset.resultTitle = result.title || finishResultTitle(result);
  writeStorageDataset(card, result);
  card.dataset.backgroundLabel = background.label || "Dekupe";
  card.dataset.backgroundValue = background.value || "dekupe";
  card.dataset.designModeLabel = formInfo.designModeLabel || profile.designModeLabel;
  card.dataset.designModeValue = formInfo.designModeValue || profile.designModeValue;
  card.dataset.finishImageUrl = result.imageUrl || "";
  card.dataset.metalLabel = metal.label || "Altın";
  card.dataset.metalValue = metal.value || "altin";
  card.dataset.moldAspect = formInfo.moldAspect || profile.moldAspect;
  card.dataset.moldHeightCm = formInfo.moldHeightCm || "";
  card.dataset.moldKey = formInfo.moldKey || "";
  card.dataset.moldMeasure = formInfo.moldMeasure || "";
  card.dataset.moldShape = formInfo.moldShape || formInfo.shapeValue || profile.shapeValue;
  card.dataset.moldSizeLabel = formInfo.moldSizeLabel || formInfo.moldMeasure || "";
  card.dataset.moldTitle = formInfo.moldTitle || "Tasarım";
  card.dataset.moldWidthCm = formInfo.moldWidthCm || "";
  card.dataset.productLabel = formInfo.productLabel || profile.productLabel;
  card.dataset.productShapeLabel = formInfo.productShapeLabel || formInfo.shapeLabel || profile.productShapeLabel;
  card.dataset.productShapeValue = formInfo.productShapeValue || formInfo.shapeValue || profile.productShapeValue;
  card.dataset.productValue = formInfo.productValue || profile.productValue;
  card.dataset.renderMode = result.renderMode || (result.imageUrl ? "generated" : "composite");
  card.dataset.shapeValue = formInfo.shapeValue || formInfo.productShapeValue || profile.shapeValue;
  card.dataset.sidePrint = result.sidePrint ? "1" : "";
  card.dataset.sidePrintLeft = result.sidePrintLeft || "";
  card.dataset.sidePrintRight = result.sidePrintRight || "";
  card.dataset.sketchUrl = result.imageUrl || formInfo.sketchUrl || "";
  card.dataset.sourceFormUrl = formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "";
  card.dataset.stoneLabel = stone.label || "Yok";
  card.dataset.stoneValue = stone.value || "yok";
  card.dataset.surfaceLabel = surface.label || "Parlak";
  card.dataset.surfaceValue = surface.value || "parlak";
  card.tabIndex = 0;

  const badge = document.createElement("span");
  badge.className = "selected-badge";
  badge.textContent = "Seçili";

  const visual = createFinishVisual(result);
  const body = document.createElement("div");
  body.className = "sketch-body";

  const subtitle = document.createElement("span");
  subtitle.textContent = `${formInfo.moldTitle || "Tasarım"}${formInfo.moldMeasure ? ` · ${formInfo.moldMeasure}` : ""} · ${formInfo.designModeLabel || "Yüzeysel kazıma"} · ${background.label || "Dekupe"}`;

  card.setAttribute("aria-label", `${card.dataset.resultTitle}. ${subtitle.textContent}`);

  body.append(subtitle);
  card.append(badge, visual, body);
  card.addEventListener("click", () => selectFinishResult(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectFinishResult(card);
    }
  });

  return card;
}

function selectFinishResult(selectedCard) {
  const previousCard = document.querySelector("[data-finish-result-card].is-selected");
  document.querySelectorAll("[data-finish-result-card]").forEach((card) => {
    card.classList.toggle("is-selected", card === selectedCard);
  });
  if (previousCard && previousCard !== selectedCard) {
    clearMockupResults();
  }
  setMockupStepReady(true);
  queueActiveProjectSave();
}

function getSelectedFinishInfo() {
  const card = document.querySelector("[data-finish-result-card].is-selected");
  if (!card) return directMockupFinish;

  return {
    ...readStorageDataset(card),
    backgroundLabel: card.dataset.backgroundLabel || "Dekupe",
    backgroundValue: card.dataset.backgroundValue || "dekupe",
    designModeLabel: card.dataset.designModeLabel || "Yüzeysel kazıma",
    designModeValue: card.dataset.designModeValue || "engrave",
    finishImageUrl: card.dataset.finishImageUrl || "",
    metalLabel: card.dataset.metalLabel || "Altın",
    metalValue: card.dataset.metalValue || "altin",
    moldAspect: card.dataset.moldAspect || "1 / 1",
    moldHeightCm: card.dataset.moldHeightCm || "",
    moldKey: card.dataset.moldKey || "",
    moldMeasure: card.dataset.moldMeasure || "",
    moldShape: card.dataset.moldShape || card.dataset.shapeValue || "yuvarlak",
    moldSizeLabel: card.dataset.moldSizeLabel || card.dataset.moldMeasure || "",
    moldTitle: card.dataset.moldTitle || "Tasarım",
    moldWidthCm: card.dataset.moldWidthCm || "",
    productLabel: card.dataset.productLabel || "Yüzük",
    productShapeLabel: card.dataset.productShapeLabel || card.dataset.shapeLabel || "Yuvarlak",
    productShapeValue: card.dataset.productShapeValue || card.dataset.shapeValue || "yuvarlak",
    productValue: card.dataset.productValue || "yuzuk",
    renderMode: card.dataset.renderMode || "composite",
    shapeValue: card.dataset.shapeValue || card.dataset.productShapeValue || "yuvarlak",
    sidePrint: card.dataset.sidePrint === "1",
    sidePrintLeft: card.dataset.sidePrintLeft || "",
    sidePrintRight: card.dataset.sidePrintRight || "",
    sketchUrl: card.dataset.sketchUrl || "",
    sourceFormUrl: card.dataset.sourceFormUrl || "",
    stoneLabel: card.dataset.stoneLabel || "Yok",
    stoneValue: card.dataset.stoneValue || "yok",
    surfaceLabel: card.dataset.surfaceLabel || "Parlak",
    surfaceValue: card.dataset.surfaceValue || "parlak",
    subtitle: card.querySelector(".sketch-body span")?.textContent || "",
    title: card.dataset.resultTitle || card.querySelector(".sketch-body strong")?.textContent || "Ürün renderı",
  };
}
