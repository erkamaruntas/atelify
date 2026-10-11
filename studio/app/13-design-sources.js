// Atelify stüdyo — design-sources
// Aşamalar arası tasarım kaynağı seçimi ve yüklenen görselin incelenmesi.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


async function handleDirectFormUpload(event) {
  if (newDesignStudio?.classList.contains("has-results")) {
    setFinishStatusMessage("1. aşamada görsel üretildi. Yalnızca o görsel kullanılabilir.", "error");
    return;
  }
  const file = event.currentTarget.files?.[0];
  if (!file) return;

  releaseDirectFinishForm();
  const result = await inspectStageImage(file, { sketchOnly: true });
  directFinishFormFile = file;
  updateStageUploadPreview("direct-form", "", "");

  if (!result.ok) {
    directFinishForm = null;
    directFinishFormFile = null;
    renderFinishPreview(null);
    setFinishStatusMessage(`${result.message} Yeni bir tasarım seç veya temiz siyah-beyaz tasarım yükle.`, "error");
    setWorkflowForFinishStage();
    queueActiveProjectSave();
    return;
  }

  clearSketchCardSelection();
  const profileFields = designProfileFormFields();
  const persistedUrl = await persistedStageUploadImageUrl(file);
  const sourceUrl = persistedUrl || result.url;
  if (persistedUrl) {
    revokeStudioObjectUrl(result.url);
    directFinishFormFile = null;
  }
  directFinishForm = {
    ...profileFields,
    formImageUrl: sourceUrl,
    renderMode: "generated",
    sketchUrl: sourceUrl,
    subtitle: file.name,
    title: `Yüklenen tasarım · ${file.name}`,
  };
  renderFinishPreview(directFinishForm);
  updateStageUploadPreview("direct-form", "", "");
  setFinishStatusMessage(
    result.warning || "Tasarım hazır. Ürün görseli oluştur ile seçilen ürün formuna uygula.",
    result.warning ? "warning" : "success"
  );
  setWorkflowForFinishStage();
  queueActiveProjectSave();
}

async function handleDirectFinishUpload(event) {
  if (newDesignStudio?.classList.contains("has-finish-result")) {
    setMockupStatusMessage("2. aşamada görsel üretildi. Yalnızca o görsel kullanılabilir.", "error");
    return;
  }
  const file = event.currentTarget.files?.[0];
  if (!file) return;

  releaseDirectMockupFinish();
  const result = await inspectStageImage(file);
  directMockupFinishFile = file;
  updateStageUploadPreview("direct-finish", "", "");

  if (!result.ok) {
    directMockupFinish = null;
    directMockupFinishFile = null;
    renderMockupPreview(null);
    setMockupStatusMessage(`${result.message} Ürün görseli aşamasından yeni bir render seç veya daha temiz görsel yükle.`, "error");
    setWorkflowForVisualizationStage();
    queueActiveProjectSave();
    return;
  }

  document.querySelectorAll("[data-finish-result-card]").forEach((card) => card.classList.remove("is-selected"));
  const profileFields = designProfileFormFields();
  const persistedUrl = await persistedStageUploadImageUrl(file);
  const sourceUrl = persistedUrl || result.url;
  if (persistedUrl) {
    revokeStudioObjectUrl(result.url);
    directMockupFinishFile = null;
  }
  directMockupFinish = {
    ...profileFields,
    backgroundLabel: "Yüklenen",
    backgroundValue: "temiz",
    finishImageUrl: sourceUrl,
    metalLabel: "Yüklenen render",
    metalValue: "altin",
    renderMode: "generated",
    sketchUrl: sourceUrl,
    stoneLabel: "Yok",
    stoneValue: "yok",
    surfaceLabel: "Hazır render",
    surfaceValue: "parlak",
    subtitle: file.name,
    title: `Yüklenen ürün · ${file.name}`,
  };
  clearMockupResults();
  renderMockupPreview(directMockupFinish);
  updateStageUploadPreview("direct-finish", "", "");
  setMockupStatusMessage(
    result.warning || "Ürün fotoğrafı hazır. Fotoğraf oranını seçip Görsel oluştur.",
    result.warning ? "warning" : "success"
  );
  setWorkflowForVisualizationStage();
  queueActiveProjectSave();
}

function toggleDesignSourcePanel(stageKey) {
  const panel = document.querySelector(`[data-design-source-panel="${stageKey}"]`);
  if (!panel) return;

  const shouldOpen = panel.hidden;
  closeDesignSourcePanels(stageKey);

  if (!shouldOpen) {
    panel.hidden = true;
    return;
  }

  renderDesignSourcePanel(stageKey);
  panel.hidden = false;
}

function closeDesignSourcePanels(exceptStageKey = "") {
  document.querySelectorAll("[data-design-source-panel]").forEach((panel) => {
    if (panel.dataset.designSourcePanel !== exceptStageKey) {
      panel.hidden = true;
    }
  });
}

function renderDesignSourcePanel(stageKey) {
  const grid = document.querySelector(`[data-design-source-grid="${stageKey}"]`);
  const empty = document.querySelector(`[data-design-source-empty="${stageKey}"]`);
  if (!grid) return;

  const options = collectDesignSourceOptions(stageKey);
  replaceChildrenReleasing(grid, ...options.map((option) => createDesignSourceCard(option, stageKey)));
  grid.hidden = options.length === 0;
  if (empty) empty.hidden = options.length > 0;
}

function collectDesignSourceOptions(stageKey) {
  const options = [];
  const seenImageUrls = new Set();

  const pushOption = (option) => {
    const imageUrl = String(option.imageUrl || "").trim();
    if (!imageUrl || seenImageUrls.has(imageUrl)) return;
    seenImageUrls.add(imageUrl);
    options.push({ ...option, imageUrl });
  };

  if (stageKey === "finish") {
    // Eskiz artık şekilden bağımsız (1:1) üretiliyor; bu yüzden tüm 1. aşama
    // sonuçları, projenin şeklinden bağımsız olarak 2. aşamaya kaynak olabilir.
    // Şekil/çerçeve, projenin baştan seçili şekline göre uygulanır.
    const stageCards = currentSketchSourceCards();
    selectedStageSourceCards(stageCards, "[data-sketch-card].is-selected:not(.is-hidden)").forEach((card, index) => {
      const imageUrl = card.dataset.imageUrl || managedImageUrl(card.querySelector("[data-sketch-image]")) || "";
      pushOption({
        imageUrl,
        select: () => applyFormSourceFromCard(card),
        subtitle: card.querySelector(".sketch-body span")?.textContent || "1. aşama",
        title: card.dataset.imageLabel || card.querySelector(".sketch-body strong")?.textContent || `Tasarım ${index + 1}`,
      });
    });
  }

  // Mockup/manken (3.–4. aşama) kaynağı YALNIZCA 2. aşama (finish) çıktısıdır.
  // 1. aşama tasarımları bu aşamalarda kaynak olarak gösterilmez; yan baskılar da
  // yalnız 2. aşama çıktısında bulunur. Bu yüzden sadece finish kartları listelenir.
  if (stageKey === "mockup" || stageKey === "manken") {
    Array.from(document.querySelectorAll("[data-finish-result-card]"))
      .filter((card) => card.dataset.finishImageUrl && sourceMatchesActiveDesignProfile(card.dataset || {}))
      .forEach((card, index) => {
        pushOption({
          imageUrl: card.dataset.finishImageUrl,
          select: () => applyFinishSourceForMockup(card),
          subtitle: card.dataset.sidePrint === "1" ? "2. aşama · yan baskılı" : "2. aşama çıktısı",
          title: card.dataset.resultTitle || card.dataset.finishTitle || `Ürün görseli ${index + 1}`,
        });
      });
    return options;
  }

  collectSavedDesignSourceOptions(stageKey, seenImageUrls).forEach(pushOption);
  return options;
}

function currentSketchSourceCards() {
  return Array.from(document.querySelectorAll("[data-sketch-card]:not(.is-hidden)")).filter(sketchCardHasImage);
}

function selectedStageSourceCards(stageCards, selectedSelector) {
  const selectedCard = document.querySelector(selectedSelector);
  if (selectedCard && stageCards.includes(selectedCard)) return [selectedCard];
  return stageCards;
}

function collectSavedDesignSourceOptions(stageKey, seenImageUrls) {
  const matchSketchSource = (design) => design.sourceStage === "sketch" || /eskiz|taslak|tasarım|tasarim/i.test(design.stage || "");
  const stageMatchers = {
    finish: matchSketchSource,
    mockup: matchSketchSource,
    manken: matchSketchSource,
  };
  const matcher = stageMatchers[stageKey];
  if (!matcher) return [];

  // Eskiz şekilden bağımsız (1:1) üretildiğinden, arşivdeki tüm 1. aşama tasarımları
  // projenin şeklinden bağımsız olarak kaynak gösterilir; çerçeve 2. aşamada projenin
  // şekline göre uygulanır (bkz. applySavedDesignSource).
  return readSavedDesigns()
    .filter((design) => (
      design.imageUrl &&
      !isSavedDesignLoading(design) &&
      matcher(design) &&
      !seenImageUrls.has(design.imageUrl)
    ))
    .map((design) => ({
      imageUrl: design.imageUrl,
      select: () => applySavedDesignSource(stageKey, design),
      subtitle: savedDesignSourceSubtitle(design),
      title: design.title || "Kaydedilen tasarım",
    }));
}

function createDesignSourceCard(option, stageKey) {
  const button = document.createElement("button");
  button.className = "source-design-card";
  button.type = "button";
  button.dataset.sourceStage = stageKey;

  const visual = document.createElement("div");
  visual.className = "source-design-visual";

  if (option.visualNode) {
    visual.append(option.visualNode);
  } else {
    const image = document.createElement("img");
    image.alt = option.title || "Tasarımdan seç";
    setManagedImageSrc(image, option.imageUrl);
    visual.append(image);
  }

  const title = document.createElement("span");
  title.className = "source-design-title";
  title.textContent = option.title || "Tasarım";

  const subtitle = document.createElement("span");
  subtitle.className = "source-design-subtitle";
  subtitle.textContent = option.subtitle || "Önceki aşama";

  button.append(visual, title, subtitle);
  button.addEventListener("click", () => {
    option.select();
    closeDesignSourcePanels();
  });

  return button;
}

function clearStageUploadInput(prefix) {
  const input = document.querySelector(`[data-${prefix}-upload]`);
  if (input) input.value = "";
}

function clearSketchCardSelection() {
  document.querySelectorAll("[data-sketch-card]").forEach((card) => card.classList.remove("is-selected"));
}

function applyFormSourceFromCard(card) {
  releaseDirectFinishForm();
  clearStageUploadInput("direct-form");
  selectSketch(card);

  const formInfo = getSelectedFormInfo();
  updateStageUploadPreview("direct-form", "", "");
  renderFinishPreview(formInfo);
  setFinishStatusMessage("Tasarımlardan seçilen görsel hazır. Ürün görseli oluştur ile seçilen forma uygula.", "success");
  setWorkflowForFinishStage();
  queueActiveProjectSave();
}

function applySketchSourceForMockup(card) {
  releaseDirectMockupFinish();
  clearStageUploadInput("direct-finish");
  document.querySelectorAll("[data-finish-result-card]").forEach((finishCard) => finishCard.classList.remove("is-selected"));

  const profileFields = readDesignProfileDataset(card);
  const metalChip = readSelectedChip("metal");
  const imageUrl = card.dataset.imageUrl || managedImageUrl(card.querySelector("[data-sketch-image]")) || "";
  const sourceUrl = safePersistedImageUrl(card.dataset.stageSourceUrl || imageUrl, "stageSourceUrl") || imageUrl;
  const title = card.dataset.imageLabel || card.querySelector(".sketch-body strong")?.textContent || "Tasarım";
  directMockupFinish = {
    ...profileFields,
    backgroundLabel: "Tasarım",
    backgroundValue: "temiz",
    finishImageUrl: "",
    metalLabel: metalChip.label || PROJECT_METAL_OPTIONS.gumus.label,
    metalValue: metalChip.value || "gumus",
    moldTitle: title,
    renderMode: "sketch",
    sketchUrl: sourceUrl,
    stoneLabel: "Yok",
    stoneValue: "yok",
    surfaceLabel: "Parlak",
    surfaceValue: "parlak",
    subtitle: card.querySelector(".sketch-body span")?.textContent || "1. aşama tasarımı",
    title,
  };
  clearMockupResults();
  updateStageUploadPreview("direct-finish", "", "");
  renderMockupPreview(directMockupFinish);
  setMockupStatusMessage("1. aşama tasarımı seçildi. Fotoğraf oranını seçip Görsel oluştur.", "success");
  setWorkflowForVisualizationStage();
  queueActiveProjectSave();
}

// 3./4. aşamada kaynak seçicisinden bir 2. aşama (finish) çıktısı seçilince çağrılır.
// directMockupFinish'i temizleyip ilgili finish kartını "seçili" yapar; böylece
// getSelectedFinishInfo() o kartı (yan baskı bilgisiyle birlikte) okur ve önizleme güncellenir.
function applyFinishSourceForMockup(card) {
  releaseDirectMockupFinish();
  clearStageUploadInput("direct-finish");
  clearSketchCardSelection();
  document.querySelectorAll("[data-finish-result-card]").forEach((finishCard) => {
    finishCard.classList.toggle("is-selected", finishCard === card);
  });
  clearMockupResults();
  updateStageUploadPreview("direct-finish", "", "");
  const finishInfo = getSelectedFinishInfo();
  renderMockupPreview(finishInfo);
  setMockupStatusMessage("2. aşama çıktısı seçildi. Fotoğraf oranını seçip Görsel oluştur.", "success");
  setWorkflowForVisualizationStage();
  queueActiveProjectSave();
}

function applySavedDesignSource(stageKey, design) {
  if (stageKey === "finish") {
    document.querySelectorAll("[data-sketch-card]").forEach((card) => card.classList.remove("is-selected"));
    releaseDirectFinishForm();
    // Eskiz şekilden bağımsız olduğundan ürün+şekil aktif projeden (baştan sabit)
    // alınır; yüzey modu (detaylı/minimalist) eskizden korunur çünkü görselin piksel
    // doğasını o belirler. Böylece arşivdeki herhangi bir eskiz, projenin şeklinde
    // ürün görseline dönüştürülebilir.
    const activeProfile = selectedDesignProfile();
    const profileFields = {
      ...designProfileFieldsFromSource(design),
      moldShape: activeProfile.productShapeValue,
      productLabel: activeProfile.productLabel,
      productPrompt: activeProfile.productPrompt,
      productShapeLabel: activeProfile.productShapeLabel,
      productShapePrompt: activeProfile.productShapePrompt,
      productShapeValue: activeProfile.productShapeValue,
      productValue: activeProfile.productValue,
      shapeLabel: activeProfile.productShapeLabel,
      shapePrompt: activeProfile.productShapePrompt,
      shapeValue: activeProfile.productShapeValue,
    };
    const metadataFields = sketchMetadataFieldsFromSource(design);
    const sourceUrl = safePersistedImageUrl(
      design.stageSourceUrl || design.sourceSketchUrl || design.imageUrl || "",
      "stageSourceUrl"
    ) || design.imageUrl;
    directFinishForm = {
      ...profileFields,
      ...metadataFields,
      formImageUrl: sourceUrl,
      moldTitle: "Tasarımlardan seçilen tasarım",
      renderMode: "generated",
      sketchUrl: sourceUrl,
      subtitle: design.stage || "Tasarımlarım",
      title: design.title || "Kaydedilen tasarım",
    };
    clearStageUploadInput("direct-form");
    updateStageUploadPreview("direct-form", "", "");
    renderFinishPreview(directFinishForm);
    setFinishStatusMessage("Tasarımlardan seçilen görsel hazır. Ürün görseli oluştur ile seçilen forma uygula.", "success");
    setWorkflowForFinishStage();
    queueActiveProjectSave();
    return;
  }

  if (stageKey === "mockup" || stageKey === "manken") {
    document.querySelectorAll("[data-finish-result-card]").forEach((card) => card.classList.remove("is-selected"));
    releaseDirectMockupFinish();
    const profileFields = designProfileFieldsFromSource(design);
    const metalChip = readSelectedChip("metal");
    const sourceUrl = safePersistedImageUrl(
      design.stageSourceUrl || design.sourceSketchUrl || design.imageUrl || "",
      "stageSourceUrl"
    ) || design.imageUrl;
    directMockupFinish = {
      ...profileFields,
      backgroundLabel: "Tasarımlarım",
      backgroundValue: "temiz",
      finishImageUrl: "",
      metalLabel: metalChip.label || PROJECT_METAL_OPTIONS.gumus.label,
      metalValue: metalChip.value || "gumus",
      moldTitle: "Tasarımlardan seçilen tasarım",
      renderMode: "sketch",
      sketchUrl: sourceUrl,
      stoneLabel: "Yok",
      stoneValue: "yok",
      surfaceLabel: "Parlak",
      surfaceValue: "parlak",
      subtitle: design.stage || "Tasarımlarım",
      title: design.title || "Kaydedilen tasarım",
    };
    clearMockupResults();
    clearStageUploadInput("direct-finish");
    updateStageUploadPreview("direct-finish", "", "");
    renderMockupPreview(directMockupFinish);
    setMockupStatusMessage("Tasarımlardan seçilen ürün hazır. Fotoğraf oranını seçip Görsel oluştur.", "success");
    setWorkflowForVisualizationStage();
    queueActiveProjectSave();
  }
}

function updateStageUploadPreview(prefix, imageUrl, fileName, acceptedMessage = "Görsel temel kontrolden geçirildi.") {
  const dropzone = document.querySelector(`[data-${prefix}-dropzone]`);
  const preview = document.querySelector(`[data-${prefix}-preview]`);
  const label = document.querySelector(`[data-${prefix}-label]`);
  const hint = document.querySelector(`[data-${prefix}-hint]`);

  if (label && !label.dataset.defaultText) label.dataset.defaultText = label.textContent;
  if (hint && !hint.dataset.defaultText) hint.dataset.defaultText = hint.textContent;

  if (preview && imageUrl) {
    if ((preview.getAttribute("src") || "") !== imageUrl) releaseImageElement(preview);
    preview.src = imageUrl;
    preview.hidden = false;
  } else if (preview) {
    releaseImageElement(preview);
    preview.hidden = true;
  }
  dropzone?.classList.toggle("has-preview", Boolean(imageUrl));
  if (label) label.textContent = imageUrl && fileName ? fileName : label.dataset.defaultText || label.textContent;
  if (hint) hint.textContent = imageUrl && fileName ? acceptedMessage : hint.dataset.defaultText || hint.textContent;
}

async function inspectStageImage(file, options = {}) {
  if (!STAGE_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "Lütfen JPEG, PNG veya WebP türünde bir görsel yükle.", url: "" };
  }

  const meta = await readImageMeta(file);
  const minSide = Math.min(meta.width, meta.height);
  const ratio = meta.width / meta.height;

  if (!meta.width || !meta.height) {
    revokeStudioObjectUrl(meta.url);
    return {
      ...meta,
      ok: false,
      message: meta.message || "Görsel okunamadı.",
    };
  }

  if (minSide < 420) {
    revokeStudioObjectUrl(meta.url);
    return {
      ...meta,
      ok: false,
      message: "Bu görsel bu aşama için çok düşük çözünürlüklü görünüyor.",
    };
  }

  if (ratio > 4 || ratio < 0.25) {
    revokeStudioObjectUrl(meta.url);
    return {
      ...meta,
      ok: false,
      message: "Bu görselin oranı takı yüzeyine yerleşim için fazla uç görünüyor.",
    };
  }

  if (options.sketchOnly) {
    const sketchResult = inspectSketchOnlyImage(meta.sketchStats);
    if (!sketchResult.ok) {
      revokeStudioObjectUrl(meta.url);
      return {
        ...meta,
        ok: false,
        message: sketchResult.message,
      };
    }
  }

  return {
    ...meta,
    ok: true,
    warning:
      minSide < 800
        ? "Görsel kabul edildi; daha net sonuç için yüksek çözünürlüklü ve temiz motif tercih et."
        : "",
  };
}

function inspectSketchOnlyImage(stats) {
  if (!stats?.visiblePixelCount) {
    return { ok: false, message: "Tasarım kontrolü için görsel okunamadı." };
  }

  if (stats.coloredRatio > 0.06 || stats.averageSaturation > 0.12) {
    return { ok: false, message: FINISH_SKETCH_ONLY_MESSAGE };
  }

  if (stats.lightRatio < 0.38) {
    return { ok: false, message: FINISH_SKETCH_ONLY_MESSAGE };
  }

  if (stats.darkRatio < 0.003) {
    return { ok: false, message: "Tasarım çizgisi algılanamadı. Siyah-beyaz çizgi tasarım yükle." };
  }

  if (stats.midToneRatio > 0.5 && stats.nearBlackWhiteRatio < 0.48) {
    return { ok: false, message: FINISH_SKETCH_ONLY_MESSAGE };
  }

  return { ok: true };
}

function readImageMeta(file) {
  return new Promise((resolve) => {
    const url = createStudioObjectUrl(file);
    const image = new Image();
    image.addEventListener("load", () => {
      let sketchStats = null;
      try {
        sketchStats = readSketchImageStats(image);
      } catch {
        sketchStats = null;
      }

      resolve({
        height: image.naturalHeight || 0,
        sketchStats,
        url,
        width: image.naturalWidth || 0,
      });
      image.removeAttribute("src");
    });
    image.addEventListener("error", () => {
      resolve({ height: 0, ok: false, message: "Görsel okunamadı.", url, width: 0 });
      image.removeAttribute("src");
    });
    image.src = url;
  });
}

function readSketchImageStats(image) {
  const sourceWidth = image.naturalWidth || 0;
  const sourceHeight = image.naturalHeight || 0;
  if (!sourceWidth || !sourceHeight) return null;

  const maxSide = 80;
  const scale = Math.min(maxSide / sourceWidth, maxSide / sourceHeight, 1);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  let colored = 0;
  let dark = 0;
  let light = 0;
  let midTone = 0;
  let nearBlackWhite = 0;
  let saturationTotal = 0;
  let visiblePixelCount = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3];
    if (alpha < 24) continue;

    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const saturation = max > 0 ? (max - min) / max : 0;
    const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

    visiblePixelCount += 1;
    saturationTotal += saturation;
    if (saturation > 0.18 && max - min > 24) colored += 1;
    if (luma < 95) dark += 1;
    else if (luma > 225) light += 1;
    else midTone += 1;
    if (luma < 75 || luma > 235) nearBlackWhite += 1;
  }

  if (!visiblePixelCount) {
    releaseCanvas(canvas);
    return null;
  }

  const stats = {
    averageSaturation: saturationTotal / visiblePixelCount,
    coloredRatio: colored / visiblePixelCount,
    darkRatio: dark / visiblePixelCount,
    lightRatio: light / visiblePixelCount,
    midToneRatio: midTone / visiblePixelCount,
    nearBlackWhiteRatio: nearBlackWhite / visiblePixelCount,
    visiblePixelCount,
  };
  releaseCanvas(canvas);
  return stats;
}
