// Atelify stüdyo — design-profile
// Seçili tasarım profili, yüzük kalıpları ve kartlardaki veri alanları.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function getSelectedSketchInfo() {
  const card = document.querySelector("[data-sketch-card].is-selected:not(.is-hidden)");
  if (!card) return null;
  const url = card.dataset.imageUrl || managedImageUrl(card.querySelector("[data-sketch-image]")) || "";
  const stageSourceUrl = safePersistedImageUrl(card.dataset.stageSourceUrl || url, "stageSourceUrl") || url;
  const label = card.dataset.imageLabel || card.querySelector(".sketch-body strong")?.textContent || "Tasarım";
  return url
    ? { ...readDesignProfileDataset(card), ...readSketchMetadataDataset(card), ...readStorageDataset(card), label, stageSourceUrl, url }
    : null;
}

function readSelectedChip(group) {
  // Görselleştirme chip'leri (scene/ratio/mockup-*) mockup ve manken panellerinde
  // aynı adla tekrarlandığından, aktif panele scope'la; diğer gruplar globaldir.
  const scope = VISUALIZATION_CHIP_GROUPS.has(group)
    ? activeVisualizationPanel() || document
    : document;
  const chip = scope.querySelector(`[data-chip-group="${group}"] .option-chip.is-selected`);
  if (!chip) return DEFAULT_CHIP_SELECTIONS[group] || { value: "", label: "" };
  const dataKey = CHIP_DATA_KEY_BY_GROUP[group] || "";
  return {
    value: dataKey ? chip.dataset[dataKey] || "" : "",
    label: chip.textContent.trim(),
  };
}

// Mockup (3. aşama) ve manken (4. aşama) aynı görsel panelini ve aynı üretim
// pipeline'ını paylaşır; yalnızca kredi maliyeti, job stage'i ve etiketleri farklıdır.
// Bu yardımcı, panel/yükleme/recovery yönlendirmesinde ikisini birlikte ele alır.
function isVisualizationStage(stage) {
  return stage === "mockup" || stage === "manken";
}

// Mockup (3. aşama) ve manken (4. aşama) artık ayrı DOM panelleri kullanır, ancak
// aynı üretim pipeline'ını paylaşırlar. Bu paneller aynı hook adlarını (data-mockup-*,
// data-chip-group="ratio" vb.) taşıdığından, panel'e özgü okumalar/yazmalar aktif
// aşamanın paneline scope'lanır. activeVisualizationPanel() o anki aktif paneli döndürür.
const VISUALIZATION_CHIP_GROUPS = new Set(["scene", "ratio", "mockup-count", "mockup-resolution"]);
function currentVisualizationStage() {
  return newDesignStudio?.classList.contains("is-manken-stage") ? "manken" : "mockup";
}

function visualizationPanelForStage(stage) {
  if (!isVisualizationStage(stage)) return null;
  const selector = stage === "manken"
    ? '[data-stage-panel="manken"]'
    : '[data-stage-panel="mockup"]';
  return document.querySelector(selector);
}

function activeVisualizationPanel() {
  return visualizationPanelForStage(currentVisualizationStage());
}

function syncMockupResultUi() {
  const activePanel = activeVisualizationPanel() || document;
  const hasActiveResultState = Boolean(
    activePanel.querySelector('[data-result-loading="mockup"], [data-mockup-result-card]')
  );
  newDesignStudio?.classList.toggle("has-mockup-result", hasActiveResultState);
  setFinalDesignReady(hasActiveMockupSelection());
}

// scene chip'i DOM'da gizli tutulur; çıktı tipi aktif aşamaya (mockup/manken) göre
// programatik olarak belirlenir. readSelectedChip("scene") bu seçimi okumaya devam eder.
function setSceneSelection(value) {
  const normalized = value === "manken" ? "manken" : "mockup";
  const scope = activeVisualizationPanel() || document;
  scope.querySelectorAll('[data-chip-group="scene"] .option-chip').forEach((chip) => {
    chip.classList.toggle("is-selected", chip.dataset.scene === normalized);
  });
}

function mockupResolutionConfig(value) {
  return MOCKUP_RESOLUTION_OPTIONS[normalizeMockupResolutionValue(value)] || MOCKUP_RESOLUTION_OPTIONS["1k"];
}

function draftCreditCostFor(count) {
  const normalizedCount = normalizeGenerationCountValue(count);
  return STUDIO_CREDIT_COSTS.sketch["1k"][normalizedCount] || STUDIO_CREDIT_COSTS.sketch["1k"][1];
}

function finishCreditCostFor(count) {
  const normalizedCount = normalizeGenerationCountValue(count);
  return STUDIO_CREDIT_COSTS.finish[normalizedCount] || STUDIO_CREDIT_COSTS.finish[1];
}

function mockupCreditCostFor(count, resolution, scene) {
  const normalizedCount = normalizeGenerationCountValue(count);
  const normalizedResolution = normalizeMockupResolutionValue(resolution);
  const sceneKey = normalizeMockupScene({ value: scene }).value === "manken" ? "manken" : "mockup";
  const table = STUDIO_CREDIT_COSTS[sceneKey] || STUDIO_CREDIT_COSTS.mockup;
  return table[normalizedResolution]?.[normalizedCount] || table["1k"][1];
}

function buildDesignProfile({ designModeValue = "engrave", productValue = "yuzuk", shapeValue = "yuvarlak" } = {}, overrides = {}) {
  const normalizedProduct = normalizeDesignOptionKey(DESIGN_PRODUCT_OPTIONS, productValue, "yuzuk");
  const normalizedShape = normalizeDesignOptionKey(DESIGN_SHAPE_OPTIONS, shapeValue, "yuvarlak");
  const normalizedMode = normalizeDesignOptionKey(DESIGN_MODE_OPTIONS, designModeValue, "engrave");
  const product = DESIGN_PRODUCT_OPTIONS[normalizedProduct];
  const shape = DESIGN_SHAPE_OPTIONS[normalizedShape];
  const mode = DESIGN_MODE_OPTIONS[normalizedMode];

  return {
    designModeLabel: overrides.designModeLabel || mode.label,
    designModePrompt: overrides.designModePrompt || mode.prompt,
    designModeValue: normalizedMode,
    moldAspect: overrides.moldAspect || shape.aspect,
    moldKey: overrides.moldKey || shape.ringMold,
    moldMeasure: overrides.moldMeasure || "",
    moldShape: overrides.moldShape || normalizedShape,
    moldSizeLabel: overrides.moldSizeLabel || "",
    moldTitle: overrides.moldTitle || `${shape.label} ${product.label}`,
    productLabel: overrides.productLabel || product.label,
    productPrompt: overrides.productPrompt || product.prompt,
    productShapeLabel: overrides.productShapeLabel || overrides.shapeLabel || shape.label,
    productShapePrompt: overrides.productShapePrompt || overrides.shapePrompt || shape.prompt,
    productShapeValue: normalizedShape,
    productValue: normalizedProduct,
    shapeLabel: overrides.shapeLabel || overrides.productShapeLabel || shape.label,
    shapePrompt: overrides.shapePrompt || overrides.productShapePrompt || shape.prompt,
    shapeValue: normalizedShape,
  };
}

function selectedDesignProfile() {
  const productChip = readSelectedChip("product-type");
  const shapeChip = readSelectedChip("product-shape");
  const modeChip = readSelectedChip("design-mode");

  return buildDesignProfile({
    designModeValue: modeChip.value,
    productValue: productChip.value,
    shapeValue: shapeChip.value,
  });
}

function designProfileFromFields(fields = {}) {
  const fallback = selectedDesignProfile();
  return buildDesignProfile(
    {
      designModeValue: fields.designModeValue || fallback.designModeValue,
      productValue: fields.productValue || fallback.productValue,
      shapeValue: fields.productShapeValue || fields.shapeValue || fields.moldShape || fallback.shapeValue,
    },
    fields
  );
}

function updateDesignSelectionSummary() {
  const profile = selectedDesignProfile();
  document.querySelectorAll("[data-design-product-summary]").forEach((item) => {
    item.textContent = profile.productLabel;
  });
  document.querySelectorAll("[data-design-shape-summary]").forEach((item) => {
    item.textContent = profile.productShapeLabel;
  });
  document.querySelectorAll("[data-design-mode-summary]").forEach((item) => {
    item.textContent = profile.designModeLabel;
  });
  const metalChip = readSelectedChip("metal");
  document.querySelectorAll("[data-design-metal-summary]").forEach((item) => {
    item.textContent = metalChip.label || PROJECT_METAL_OPTIONS.gumus.label;
  });
  document.querySelectorAll("[data-next-product-chip]").forEach((item) => {
    item.textContent = profile.productLabel;
  });
  document.querySelectorAll("[data-next-shape-chip]").forEach((item) => {
    item.textContent = profile.productShapeLabel;
  });
  document.querySelectorAll("[data-next-mode-chip]").forEach((item) => {
    item.textContent = profile.designModeLabel;
  });
}

function selectedRingShapeValue() {
  return selectedDesignProfile().shapeValue || FIXED_FINISH_RING_SHAPE;
}

function finishRingMoldKeyFor(shapeValue, metalValue, productValue) {
  const shapeKey = normalizeDesignOptionKey(DESIGN_SHAPE_OPTIONS, shapeValue, "yuvarlak");
  const metalKey = normalizeFinishMetalValue(metalValue);
  if (productValue === "kolye") {
    return (
      FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL[shapeKey]?.[metalKey] ||
      FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL[shapeKey]?.altin ||
      FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL[shapeKey]?.gumus ||
      FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL.yuvarlak.altin
    );
  }
  return (
    FINISH_RING_MOLD_BY_SHAPE_AND_METAL[shapeKey]?.[metalKey] ||
    DESIGN_SHAPE_OPTIONS[shapeKey]?.ringMold ||
    FIXED_FINISH_RING_MOLD
  );
}

function ringMoldConfigFromKey(key, profile = selectedDesignProfile()) {
  const mold = RING_MOLD_OPTIONS[key];

  if (mold) {
    return {
      key,
      ...mold,
      aspect: mold.aspect || profile.moldAspect || "1 / 1",
      label: mold.label || profile.moldTitle || profile.shapeLabel || "Ürün formu",
      shape: mold.shape || profile.shapeValue || FIXED_FINISH_RING_SHAPE,
    };
  }

  return {
    aspect: profile.moldAspect || "1 / 1",
    heightCm: "",
    key,
    label: profile.moldTitle || profile.shapeLabel || "Ürün formu",
    shape: profile.shapeValue || FIXED_FINISH_RING_SHAPE,
    widthCm: "",
  };
}

function shouldUseRingMoldTemplate(profile = selectedDesignProfile()) {
  return profile.productValue === "yuzuk" && profile.shapeValue !== "dikdortgen";
}

function dynamicProductMoldConfig(profile = selectedDesignProfile()) {
  const shape = DESIGN_SHAPE_OPTIONS[profile.shapeValue] || DESIGN_SHAPE_OPTIONS.yuvarlak;
  return {
    aspect: profile.moldAspect || shape.aspect || "1 / 1",
    heightCm: "",
    key: `${profile.productValue || "urun"}-${profile.shapeValue || "yuvarlak"}`,
    label: profile.moldTitle || `${profile.productShapeLabel || shape.label} ${profile.productLabel || "Ürün"}`,
    shape: profile.shapeValue || "yuvarlak",
    widthCm: "",
  };
}

function syncRingMoldSizeOptions() {
  const moldChips = Array.from(document.querySelectorAll('[data-chip-group="ring-mold"] .option-chip'));
  let firstVisibleChip = null;
  let hasSelectedVisibleChip = false;

  moldChips.forEach((chip) => {
    const isVisible = chip.dataset.ringMold === FIXED_FINISH_RING_MOLD;
    chip.hidden = !isVisible;
    if (!isVisible) {
      chip.classList.remove("is-selected");
      return;
    }

    firstVisibleChip ||= chip;
    if (chip.classList.contains("is-selected")) {
      hasSelectedVisibleChip = true;
    }
  });

  if (!hasSelectedVisibleChip && firstVisibleChip) {
    firstVisibleChip.classList.add("is-selected");
  }
}

function toggleRingMoldReference(event) {
  const button = event.currentTarget;
  const reference = document.querySelector("[data-ring-mold-reference]");
  if (!button || !reference) return;

  const shouldShow = reference.hidden;
  reference.hidden = !shouldShow;
  button.setAttribute("aria-expanded", String(shouldShow));
}

function selectedRingMoldConfig() {
  const profile = selectedDesignProfile();
  const key = profile.moldKey || FIXED_FINISH_RING_MOLD;
  return shouldUseRingMoldTemplate(profile)
    ? ringMoldConfigFromKey(key, profile)
    : dynamicProductMoldConfig(profile);
}

function applyRingMoldToFormInfo(formInfo, mold = null) {
  if (!formInfo) return null;

  const profile = designProfileFromFields(formInfo);
  const useRingTemplate = shouldUseRingMoldTemplate(profile);
  const resolvedMold = useRingTemplate
    ? mold || ringMoldConfigFromKey(profile.moldKey || FIXED_FINISH_RING_MOLD, profile)
    : dynamicProductMoldConfig(profile);
  const hasMeasure = Boolean(resolvedMold.widthCm && resolvedMold.heightCm);
  const sizeLabel = hasMeasure ? `${resolvedMold.widthCm} x ${resolvedMold.heightCm} cm` : "";
  return {
    ...formInfo,
    designModeLabel: profile.designModeLabel,
    designModePrompt: profile.designModePrompt,
    designModeValue: profile.designModeValue,
    moldAspect: resolvedMold.aspect || profile.moldAspect,
    moldHeightCm: resolvedMold.heightCm || "",
    moldKey: resolvedMold.key,
    moldMeasure: sizeLabel,
    moldShape: profile.shapeValue,
    moldSizeLabel: sizeLabel,
    moldTitle: resolvedMold.label || profile.moldTitle,
    moldWidthCm: resolvedMold.widthCm || "",
    productLabel: profile.productLabel,
    productPrompt: profile.productPrompt,
    productShapeLabel: profile.productShapeLabel,
    productShapePrompt: profile.productShapePrompt,
    productShapeValue: profile.productShapeValue,
    productValue: profile.productValue,
    shapeLabel: profile.productShapeLabel,
    shapePrompt: profile.productShapePrompt,
    shapeValue: profile.shapeValue,
  };
}

function resolveFinishFormInfoForMetal(formInfo, metal = readSelectedChip("metal")) {
  if (!formInfo) return null;

  const profile = designProfileFromFields(formInfo);
  if (!shouldUseRingMoldTemplate(profile)) {
    return applyRingMoldToFormInfo(formInfo, dynamicProductMoldConfig(profile));
  }

  const moldKey = finishRingMoldKeyFor(profile.shapeValue, metal?.value, profile.productValue);
  return applyRingMoldToFormInfo(
    {
      ...formInfo,
      ...profile,
      moldKey,
    },
    ringMoldConfigFromKey(moldKey, profile)
  );
}

function designProfileFormFields(profile = selectedDesignProfile()) {
  return {
    designModeLabel: profile.designModeLabel,
    designModePrompt: profile.designModePrompt,
    designModeValue: profile.designModeValue,
    moldAspect: profile.moldAspect,
    moldKey: profile.moldKey,
    moldMeasure: profile.moldMeasure,
    moldShape: profile.shapeValue,
    moldSizeLabel: profile.moldSizeLabel,
    moldTitle: profile.moldTitle,
    productLabel: profile.productLabel,
    productPrompt: profile.productPrompt,
    productShapeLabel: profile.productShapeLabel,
    productShapePrompt: profile.productShapePrompt,
    productShapeValue: profile.productShapeValue,
    productValue: profile.productValue,
    shapeLabel: profile.productShapeLabel,
    shapePrompt: profile.productShapePrompt,
    shapeValue: profile.shapeValue,
  };
}

const DESIGN_PROFILE_DATA_KEYS = [
  "designModeLabel",
  "designModePrompt",
  "designModeValue",
  "moldAspect",
  "moldKey",
  "moldMeasure",
  "moldShape",
  "moldSizeLabel",
  "moldTitle",
  "productLabel",
  "productPrompt",
  "productShapeLabel",
  "productShapePrompt",
  "productShapeValue",
  "productValue",
  "shapeLabel",
  "shapePrompt",
  "shapeValue",
];

const SKETCH_METADATA_DATA_KEYS = [
  "generationJobId",
  "projectId",
  "projectTitle",
  "sourceFileName",
  "sourceImageUrl",
  "sourceStage",
  "sourceTitle",
  "surfaceLabel",
  "surfaceValue",
];

const STORAGE_DATA_KEYS = [
  "generatedAt",
  "storageBucket",
  "storagePath",
  "storageProvider",
  "storageUrl",
];

function designProfileFieldsFromSource(source = {}) {
  const profileFields = source.profileFields && typeof source.profileFields === "object"
    ? source.profileFields
    : source;
  return designProfileFormFields(designProfileFromFields(profileFields));
}

function explicitDesignProfileKeyFromSource(source = {}) {
  const profileFields = source.profileFields && typeof source.profileFields === "object"
    ? source.profileFields
    : source;
  return {
    productValue: normalizeDesignOptionKey(
      DESIGN_PRODUCT_OPTIONS,
      profileFields.productValue || profileFields.product || "",
      ""
    ),
    shapeValue: normalizeDesignOptionKey(
      DESIGN_SHAPE_OPTIONS,
      profileFields.productShapeValue || profileFields.shapeValue || profileFields.moldShape || profileFields.productShape || "",
      ""
    ),
  };
}

function sourceMatchesActiveDesignProfile(source = {}) {
  const currentProfile = selectedDesignProfile();
  const sourceProfile = explicitDesignProfileKeyFromSource(source);
  return Boolean(
    sourceProfile.productValue &&
    sourceProfile.shapeValue &&
    sourceProfile.productValue === currentProfile.productValue &&
    sourceProfile.shapeValue === currentProfile.productShapeValue
  );
}

function savedDesignProductShapeText(source = {}) {
  const sourceProfile = explicitDesignProfileKeyFromSource(source);
  const productLabel = source.productLabel || DESIGN_PRODUCT_OPTIONS[sourceProfile.productValue]?.label || "";
  const shapeLabel =
    source.productShapeLabel ||
    source.shapeLabel ||
    DESIGN_SHAPE_OPTIONS[sourceProfile.shapeValue]?.label ||
    "";
  return [productLabel, shapeLabel].filter(Boolean).join(" / ");
}

function savedDesignSourceSubtitle(design = {}) {
  return [
    design.stage || "Tasarımlarım",
    design.projectTitle || (design.projectId ? "İsimsiz proje" : "Genel arşiv"),
    savedDesignProductShapeText(design),
  ].filter(Boolean).join(" · ");
}

function designProfileFieldsFromGenerationMetadata(metadata = {}) {
  return designProfileFormFields(designProfileFromFields({
    designModeLabel: metadata.designModeLabel,
    designModeValue: metadata.designMode,
    productLabel: metadata.productLabel,
    productShapeLabel: metadata.productShapeLabel,
    productShapeValue: metadata.productShape,
    productValue: metadata.product,
    shapeLabel: metadata.productShapeLabel,
    shapeValue: metadata.productShape,
  }));
}

function writeDesignProfileDataset(element, fields = {}) {
  if (!element) return;
  const profileFields = designProfileFieldsFromSource(fields);
  DESIGN_PROFILE_DATA_KEYS.forEach((key) => {
    element.dataset[key] = profileFields[key] || "";
  });
}

function readDesignProfileDataset(element) {
  if (!element) return designProfileFormFields();
  const fields = {};
  DESIGN_PROFILE_DATA_KEYS.forEach((key) => {
    fields[key] = element.dataset[key] || "";
  });
  return designProfileFormFields(designProfileFromFields(fields));
}

function sketchMetadataFieldsFromSource(source = {}) {
  const metadata = source.metadata && typeof source.metadata === "object"
    ? source.metadata
    : source;
  const designModeValue = metadata.designModeValue || metadata.designMode || metadata.surfaceValue || "";
  const surfaceLabel =
    metadata.surfaceLabel ||
    DESIGN_MODE_OPTIONS[designModeValue]?.surfaceLabel ||
    metadata.designModeLabel ||
    "";
  const sourceFileName = String(metadata.sourceFileName || metadata.fileName || "").trim();

  return {
    generationJobId: String(metadata.generationJobId || metadata.jobId || metadata.pendingJobId || "").trim(),
    projectId: String(metadata.projectId || "").trim(),
    projectTitle: String(metadata.projectTitle || "").trim(),
    sourceFileName,
    sourceImageUrl: safeSavedSourceImageUrl(metadata.sourceImageUrl || ""),
    sourceStage: String(metadata.sourceStage || "sketch").trim(),
    sourceTitle: String(metadata.sourceTitle || sourceFileName || "").trim(),
    surfaceLabel,
    surfaceValue: String(metadata.surfaceValue || designModeValue || "").trim(),
  };
}

function sketchMetadataFieldsFromJob(job = {}) {
  const metadata = job.metadata || {};
  return sketchMetadataFieldsFromSource({
    generationJobId: job.id || job.clientJobId || "",
    projectId: generationProjectId(job),
    projectTitle: generationProjectTitle(job),
    sourceFileName: metadata.fileName || "",
    sourceImageUrl: metadata.sourceImageUrl || "",
    sourceStage: "sketch",
    sourceTitle: metadata.fileName || "",
    surfaceLabel: DESIGN_MODE_OPTIONS[metadata.designMode]?.surfaceLabel || metadata.designModeLabel || "",
    surfaceValue: metadata.designMode || "",
  });
}

function writeSketchMetadataDataset(element, fields = {}) {
  if (!element) return;
  const metadataFields = sketchMetadataFieldsFromSource(fields);
  SKETCH_METADATA_DATA_KEYS.forEach((key) => {
    element.dataset[key] = metadataFields[key] || "";
  });
}

function readSketchMetadataDataset(element) {
  if (!element) return sketchMetadataFieldsFromSource();
  const fields = {};
  SKETCH_METADATA_DATA_KEYS.forEach((key) => {
    fields[key] = element.dataset[key] || "";
  });
  return sketchMetadataFieldsFromSource(fields);
}

function storageFieldsFromSource(source = {}) {
  const storage = source.storage && typeof source.storage === "object" ? source.storage : {};
  const storageUrl = String(source.storageUrl || storage.publicUrl || storage.url || source.url || "").trim();
  return {
    generatedAt: validIsoDate(source.generatedAt || source.createdAt || source.savedAt || ""),
    storageBucket: String(source.storageBucket || storage.bucket || "").trim(),
    storagePath: String(source.storagePath || storage.path || "").trim(),
    storageProvider: String(source.storageProvider || storage.provider || "").trim(),
    storageUrl: safePersistedImageUrl(storageUrl, "storageUrl"),
  };
}

function writeStorageDataset(element, fields = {}) {
  if (!element) return;
  const storageFields = storageFieldsFromSource(fields);
  STORAGE_DATA_KEYS.forEach((key) => {
    element.dataset[key] = storageFields[key] || "";
  });
}

function readStorageDataset(element) {
  if (!element) return storageFieldsFromSource();
  const fields = {};
  STORAGE_DATA_KEYS.forEach((key) => {
    fields[key] = element.dataset[key] || "";
  });
  return storageFieldsFromSource(fields);
}

function clearStorageDataset(element) {
  if (!element) return;
  STORAGE_DATA_KEYS.forEach((key) => {
    delete element.dataset[key];
  });
}

function clearSketchMetadataDataset(element) {
  if (!element) return;
  SKETCH_METADATA_DATA_KEYS.forEach((key) => {
    delete element.dataset[key];
  });
}

function clearDesignProfileDataset(element) {
  if (!element) return;
  DESIGN_PROFILE_DATA_KEYS.forEach((key) => {
    delete element.dataset[key];
  });
}
