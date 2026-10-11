// Atelify stüdyo — finish-stage
// Aşama 2: ürün görseli ekranı ve yan baskı (amblem) seçimi.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function getSelectedFormInfo() {
  if (directFinishForm) return applyRingMoldToFormInfo(directFinishForm);

  const sketch = getSelectedSketchInfo();
  if (!sketch) return null;
  const sourceUrl = sketch.stageSourceUrl || sketch.url;

  return applyRingMoldToFormInfo({
    ...sketch,
    formImageUrl: sourceUrl,
    moldTitle: "Tasarım",
    renderMode: "generated",
    sketchUrl: sourceUrl,
    sourceSketchUrl: sourceUrl,
    subtitle: "Taslak",
    title: sketch.label || "Seçili tasarım",
  });
}

function setFinishStatusMessage(message, tone) {
  const el = document.querySelector("[data-finish-status-msg]");
  if (!el) return;
  const visible = isVisibleStatusTone(tone);
  el.textContent = visible ? message || "" : "";
  el.classList.toggle("is-error", visible && tone === "error");
  el.classList.toggle("is-success", visible && tone === "notice");
  el.classList.toggle("is-warning", visible && tone === "warning");
}

function enterFinishStage(options = {}) {
  const allowMissing = options.allowMissing === true;
  const formInfo = getSelectedFormInfo();
  if (!formInfo && !allowMissing) {
    setFinishStatusMessage("Ürün görseli aşaması için önce bir tasarım seç.", "error");
    return;
  }

  const sketchPanel = document.querySelector('[data-stage-panel="sketch"]');
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  const mockupPanel = document.querySelector('[data-stage-panel="mockup"]');
  const mankenPanel = document.querySelector('[data-stage-panel="manken"]');

  if (formInfo && finishPanel) {
    finishPanel.dataset.sourceId = formInfo.title;
  } else if (!formInfo && finishPanel) {
    delete finishPanel.dataset.sourceId;
  }

  newDesignStudio?.classList.remove("is-form-stage", "is-mockup-stage", "is-manken-stage");
  newDesignStudio?.classList.add("is-finish-stage");
  sketchPanel?.setAttribute("hidden", "");
  finishPanel?.removeAttribute("hidden");
  mockupPanel?.setAttribute("hidden", "");
  mankenPanel?.setAttribute("hidden", "");
  renderFinishPreview(formInfo);
  setWorkflowForFinishStage();
  setMockupStepReady(Boolean(getSelectedFinishInfo()));
  if (!formInfo) {
    setFinishStatusMessage(
      "Ürün görseli için 1. aşama sonuçlarından birini seç veya temiz siyah-beyaz tasarım yükle.",
      "warning"
    );
  } else {
    setFinishStatusMessage("");
  }
  applyStageRestrictions();
  scheduleManagedImageVisibilityRefresh();
  queueActiveProjectSave();
}

function exitFinishStage() {
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
  setFormStepReady(Boolean(getSelectedSketchInfo()));
  scheduleManagedImageVisibilityRefresh();
  queueActiveProjectSave();
}

function renderFinishPreview(formInfo) {
  const slot = document.querySelector("[data-finish-form-preview]");
  updateFinishHandoffSummary(formInfo);
  if (!slot) return;
  if (!formInfo) {
    replaceChildrenReleasing(slot);
    return;
  }
  replaceChildrenReleasing(slot, createFormVisual(formInfo));
}

function updateFinishHandoffSummary(formInfo) {
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  if (!finishPanel) return;

  const profile = formInfo ? designProfileFromFields(formInfo) : selectedDesignProfile();
  const summaryValues = {
    "[data-design-product-summary]": profile.productLabel,
    "[data-design-shape-summary]": profile.productShapeLabel,
    "[data-design-mode-summary]": profile.designModeLabel,
  };

  Object.entries(summaryValues).forEach(([selector, value]) => {
    finishPanel.querySelectorAll(selector).forEach((item) => {
      item.textContent = value || "";
    });
  });

  // Yan baskı seçeneği yalnızca yüzükte anlamlı; diğer ürünlerde gizle.
  const sidePrintGroup = finishPanel.querySelector("[data-side-print-group]");
  if (sidePrintGroup) {
    const isRing = profile.productValue === "yuzuk";
    sidePrintGroup.hidden = !isRing;
    sidePrintGroup.setAttribute("aria-hidden", isRing ? "false" : "true");
  }
}

async function generateFinishResults() {
  if (isFinishGenerating) return;

  const formInfo = getSelectedFormInfo();
  if (!formInfo) {
    setFinishStatusMessage("Ürün görseli oluşturmak için seçili veya yüklenen bir tasarım görseli gerekli.", "error");
    return;
  }

  const metal = readSelectedChip("metal");
  const surface = readSelectedChip("surface");
  const stone = readSelectedChip("stone");
  const background = readSelectedChip("background");
  const sidePrint = readSelectedChip("side-print");
  const { creditCost, finishCount } = selectedFinishConfig();
  const generationLabel = `${finishCount} ürün görseli oluşturma`;
  if (!ensureCreditsForGeneration({ amount: creditCost, label: generationLabel, stage: "finish" })) return;
  const useLocalComposite = shouldUseLocalFinishComposite();
  const useRealApi = !useLocalComposite && shouldUseRealFinishApi();
  const finishFormInfo = resolveFinishFormInfoForMetal(formInfo, metal);

  setFinishGeneratingState(true);
  showResultLoading("finish", finishCount);
  setFinishStatusMessage(
    useLocalComposite
      ? "AI kullanmadan, tarayıcı içinde tasarım seçilen ürün formuna yerleştiriliyor..."
      : useRealApi
        ? "Tasarım seçilen ürün formuna uygulanıyor. Tasarım çizgileri hazırlanıyor..."
        : "Test modu aktif. API çağrısı yapmadan örnek ürün görseli kartları hazırlanıyor..."
  );
  try {
    const results = useLocalComposite
      ? await generateLocalFinishResults({ background, finishCount, formInfo: finishFormInfo, metal, stone, surface })
      : useRealApi
        ? await generateRealFinishResults({
            background,
            creditCost,
            finishCount,
            formInfo: finishFormInfo,
            generationLabel,
            metal,
            sidePrint,
            stone,
            surface,
          })
        : await generateDummyFinishResults({ background, finishCount, formInfo: finishFormInfo, metal, stone, surface });
    if (useLocalComposite || !useRealApi) {
      showFinishResults(results, { append: true });
      const autoSaveResult = await autoSaveFinishResultsToArchive(results);
      spendCredits({ amount: creditCost, label: generationLabel, stage: "finish" });
      setFinishStatusMessage(
        `${results.length} ürün görseli hazır. ${creditCost} kredi harcandı. Beğendiğin ürünü seçince Mockup / Manken aşaması açılır.${formatAutoSaveStatusSuffix(autoSaveResult)}`,
        "success"
      );
    }
  } catch (error) {
    removeResultLoading("finish");
    setFinishStatusMessage(error?.message || "Ürün görseli hazırlanamadı.", "error");
  } finally {
    setFinishGeneratingState(false);
  }
}

async function generateDummyFinishResults(options) {
  await new Promise((resolve) => setTimeout(resolve, 360));
  const { background, finishCount, formInfo, metal, stone, surface } = options;

  return Array.from({ length: finishCount }, (_, index) => ({
    background,
    formInfo,
    id: `finish-${Date.now()}-${index}`,
    index: index + 1,
    metal,
    renderMode: "composite",
    stone,
    surface,
  }));
}

async function generateLocalFinishResults(options) {
  await delay(120);
  const { background, finishCount, formInfo, metal, stone, surface } = options;
  const manifest = await loadRingTemplateManifest();
  const sourceUrl = await localFinishSourceUrl(formInfo);

  return Promise.all(Array.from({ length: finishCount }, async (_, index) => ({
    background,
    formInfo,
    id: `finish-local-${Date.now()}-${index}`,
    imageUrl: await renderLocalFinishComposite({
      background,
      formInfo,
      index,
      manifest,
      metal,
      sourceUrl,
      surface,
    }),
    index: index + 1,
    metal,
    renderMode: "generated",
    stone,
    surface,
  })));
}

async function localFinishSourceUrl(formInfo = {}) {
  const sourceUrl = formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "";
  if (sourceUrl.startsWith("data:image/") || sourceUrl.startsWith("blob:") || /^https?:\/\//i.test(sourceUrl)) {
    return sourceUrl;
  }

  if (
    directFinishFormFile &&
    directFinishForm &&
    [directFinishForm.formImageUrl, directFinishForm.sourceFormUrl, directFinishForm.sketchUrl].includes(sourceUrl)
  ) {
    return readFileAsDataUrl(directFinishFormFile);
  }

  throw new Error("Tasarım görseli tarayıcı içinde okunamadı. Görseli yeniden yükleyip tekrar dene.");
}

async function loadRingTemplateManifest() {
  if (!ringTemplateManifestPromise) {
    ringTemplateManifestPromise = fetch(RING_TEMPLATE_MANIFEST_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Ürün template manifest dosyası yüklenemedi.");
        return response.json();
      });
  }

  return ringTemplateManifestPromise;
}

// Yan baskı: "Evet" seçilince sol ve sağ omuz için ayrı emblem seçicileri açılır.
// Seçenekler manifest'teki sidePrint.yuzuk.options listesinden gelir; her emblem
// hem solda hem sağda listelenir. Kullanıcının seçtikleri payload'a eklenir ve
// 2. aşamada sol seçtiği sola, sağ seçtiği sağa basılır.
let sidePrintEmblemPickersReady = false;
async function initSidePrintEmblemPickers() {
  const leftBox = document.querySelector('[data-chip-group="side-emblem-left"]');
  const rightBox = document.querySelector('[data-chip-group="side-emblem-right"]');
  if (!leftBox || !rightBox) return;
  bindSidePrintToggle();
  if (sidePrintEmblemPickersReady) return;
  let manifest;
  try {
    manifest = await loadRingTemplateManifest();
  } catch (error) {
    console.warn("[side-print] manifest yüklenemedi, emblem seçiciler boş kaldı.", error);
    return;
  }
  const config = manifest?.sidePrint?.yuzuk;
  const options = Array.isArray(config?.options) ? config.options : [];
  if (!options.length) return;
  sidePrintConfigCache = config;
  const defaultKey = String(config?.defaultKey || "yuzuk");
  const pattern = typeof config?.assetPattern === "string"
    ? config.assetPattern
    : "side/shoulder-{key}-{side}.png";
  await Promise.all([
    buildSideEmblemChips(leftBox, "left", options, defaultKey, pattern, config.assetLeft, config),
    buildSideEmblemChips(rightBox, "right", options, defaultKey, pattern, config.assetRight, config),
  ]);
  sidePrintEmblemPickersReady = true;
  updateSideEmblemDefaultThumbs();
  updateSidePrintOptionsVisibility();
  updateSidePrintPreviews();
}

async function buildSideEmblemChips(container, side, options, defaultKey, pattern, fallbackAsset, config) {
  container.textContent = "";
  const chips = await Promise.all(options.map(async (opt) => {
    const key = String(opt?.key || "").trim();
    if (!key) return null;
    const labelText = String(opt?.label || key);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "option-chip side-emblem-chip" + (key === defaultKey ? " is-selected" : "");
    chip.dataset.emblemKey = key;
    chip.setAttribute("aria-label", labelText);
    chip.title = labelText;

    const img = document.createElement("img");
    img.className = "side-emblem-thumb";
    img.alt = labelText;
    img.decoding = "async";
    img.src = await resolveSideEmblemThumbSrc(pattern, key, fallbackAsset, { config, defaultKey });
    img.addEventListener("error", () => {
      if (img.dataset.finalFallbackTried) return;
      img.dataset.finalFallbackTried = "1";
      img.src = ringTemplateAssetUrl(fallbackAsset);
    });

    chip.append(img);
    chip.addEventListener("click", () => {
      container.querySelectorAll(".side-emblem-chip").forEach((item) => {
        item.classList.toggle("is-selected", item === chip);
      });
      drawSidePreview(side);
    });
    return chip;
  }));
  container.append(...chips.filter(Boolean));
}

async function resolveSideEmblemThumbSrc(pattern, key, fallbackAsset, options = {}) {
  // Kanonik sıra: her zaman önce -left, sonra -right. Böylece sol ve sağ picker
  // aynı emblem için AYNI görseli gösterir ve bu görsel önizleme/çıktıyla birebir
  // eşleşir (backend ve drawSidePreview de aynı kanonik sırayı kullanır).
  const isDefaultKey = key === String(options.defaultKey || "");
  const candidates = [
    isDefaultKey ? selectedSidePrintMoldAsset(options.config, "left") : "",
    pattern.replace("{key}", key).replace("{side}", "left"),
    pattern.replace("{key}", key).replace("{side}", "right"),
    fallbackAsset,
  ]
    .filter(Boolean)
    .map(ringTemplateAssetUrl);
  for (const src of [...new Set(candidates)]) {
    try {
      await loadPreviewImage(src);
      return src;
    } catch {
      // Birçok emblem tek taraflı dosyalanıyor; sonraki adaya düş.
    }
  }
  return ringTemplateAssetUrl(fallbackAsset);
}

function selectedSidePrintMoldAsset(config, side = "left") {
  if (!config) return "";
  const metal = normalizeFinishMetalValue(readSelectedChip("metal")?.value || "gumus");
  const mold = config.molds?.[metal] || {};
  return side === "right"
    ? mold.assetRight || config.assetRight || config.assetLeft || ""
    : mold.assetLeft || config.assetLeft || config.assetRight || "";
}

function updateSideEmblemDefaultThumbs() {
  const cfg = sidePrintConfigCache;
  if (!cfg) return;
  const defaultKey = String(cfg.defaultKey || "yuzuk");
  const thumbAsset = selectedSidePrintMoldAsset(cfg, "left");
  if (!thumbAsset) return;
  const thumbSrc = ringTemplateAssetUrl(thumbAsset);
  document
    .querySelectorAll(`.side-emblem-chip[data-emblem-key="${defaultKey}"] .side-emblem-thumb`)
    .forEach((img) => {
      delete img.dataset.finalFallbackTried;
      if (img.getAttribute("src") !== thumbSrc) img.src = thumbSrc;
    });
}

// Canlı önizleme: seçilen emblemi yan yüzük kalıbının üstünde (multiply) çizer;
// backend'deki emblemPlacement ile aynı oranları kullanır.
let sidePrintConfigCache = null;
const sidePrintImageCache = new Map();
function loadPreviewImage(src) {
  if (sidePrintImageCache.has(src)) return sidePrintImageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = src;
  });
  sidePrintImageCache.set(src, promise);
  return promise;
}

async function drawSidePreview(side) {
  const cfg = sidePrintConfigCache;
  const canvas = document.querySelector(`[data-side-preview="${side}"]`);
  if (!cfg || !canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const S = canvas.width;
  ctx.clearRect(0, 0, S, S);
  const moldRel = selectedSidePrintMoldAsset(cfg, side);
  try {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(await loadPreviewImage(ringTemplateAssetUrl(moldRel)), 0, 0, S, S);
  } catch {
    return;
  }
  const key = readSidePrintEmblems()[side];
  const defaultKey = String(cfg.defaultKey || "yuzuk");
  if (!key || key === defaultKey) return;
  const pattern = typeof cfg.assetPattern === "string" ? cfg.assetPattern : "side/shoulder-{key}-{side}.png";
  let emblem = null;
  for (const s of ["left", "right"]) {
    try {
      emblem = await loadPreviewImage(ringTemplateAssetUrl(pattern.replace("{key}", key).replace("{side}", s)));
      break;
    } catch {
      // diğer tarafı dene
    }
  }
  if (!emblem) return;
  const p = cfg.emblemPlacement || {};
  const box = (Number(p.box) || 0.35) * S;
  const cx = (Number(p.centerX) || 0.5) * S;
  const cy = (Number(p.centerY) || 0.37) * S;
  const ratio = Math.min(box / emblem.naturalWidth, box / emblem.naturalHeight);
  const w = emblem.naturalWidth * ratio;
  const h = emblem.naturalHeight * ratio;
  // Backend ile aynı: saf siyah yerine yumuşatılmış multiply → emblem, kalıbın
  // metal tonunun daha koyu/mat hali (kazıma görünümü) olur. multiply + globalAlpha
  // siyahı dest*(1-opacity)'ye indirir, beyaz zemini etkilemez.
  const opacity = Math.min(1, Math.max(0.1, Number(cfg.emblemOpacity ?? 0.6)));
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = opacity;
  ctx.drawImage(emblem, cx - w / 2, cy - h / 2, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function updateSidePrintPreviews() {
  drawSidePreview("left");
  drawSidePreview("right");
}

function bindSidePrintToggle() {
  document.querySelectorAll('[data-chip-group="side-print"] .option-chip').forEach((chip) => {
    if (chip.dataset.sideToggleBound) return;
    chip.dataset.sideToggleBound = "1";
    chip.addEventListener("click", () => {
      setSidePrintOptionsVisible(chip.dataset.sidePrint === "evet");
    });
  });
}

function updateSidePrintOptionsVisibility() {
  setSidePrintOptionsVisible(readSelectedChip("side-print")?.value === "evet");
}

function setSidePrintOptionsVisible(visible) {
  const box = document.querySelector("[data-side-print-options]");
  if (!box) return;
  box.hidden = !visible;
  box.setAttribute("aria-hidden", visible ? "false" : "true");
  if (visible) updateSidePrintPreviews();
}

// Sol ve sağ omuz için seçili emblem anahtarlarını okur (seçim yoksa düz omuz).
function readSidePrintEmblems() {
  const read = (side) => {
    const chip = document.querySelector(
      `[data-chip-group="side-emblem-${side}"] .side-emblem-chip.is-selected`
    );
    return chip?.dataset.emblemKey || "yuzuk";
  };
  return { left: read("left"), right: read("right") };
}
