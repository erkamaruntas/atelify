// Atelify stüdyo — stage-costs
// Aşama başına üretim adedi ve kredi maliyeti gösterimi.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function clearMockupResults() {
  // Mockup ve manken panelleri ayrı sonuç grid'leri taşır; ikisini birlikte temizle.
  document.querySelectorAll("[data-mockup-result-grid]").forEach((resultGrid) => {
    replaceChildrenReleasing(resultGrid);
    resultGrid.hidden = true;
  });
  newDesignStudio?.classList.remove("has-mockup-result");
  setFinalDesignReady(false);
  queueActiveProjectSave();
}

// "1 görsel oluştur" / "4 adet oluştur" butonları, ilgili aşamadaki gizli sayım
// chip'ini seçer (chip click handler'ı maliyet/temizlik yan etkilerini yönetir);
// ardından mevcut üretim fonksiyonu seçili chip'i okuyarak çalışır.
function selectStageGenerationCount(button, chipGroup) {
  const count = button?.dataset.genCount;
  if (!count) return;
  const scope = button.closest("[data-stage-panel]") || document;
  const chip = scope.querySelector(
    `[data-chip-group="${chipGroup}"] .option-chip[data-${chipGroup}="${count}"]`
  );
  if (chip && !chip.classList.contains("is-selected")) chip.click();
}

function selectedDraftConfig(source) {
  const selectedCountChip = document.querySelector('[data-chip-group="count"] .option-chip.is-selected');
  const selectedGenerator = source?.dataset?.draftCount ? source : document.querySelector("[data-generate-sketches][data-draft-count]");
  const selectedSource = selectedGenerator || selectedCountChip;
  const draftCount = normalizeGenerationCountValue(selectedSource?.dataset.draftCount);

  return {
    creditCost: draftCreditCostFor(draftCount),
    draftCount,
    resolution: "1k",
  };
}

function selectedFinishConfig() {
  const selectedCountChip = document.querySelector('[data-chip-group="finish-count"] .option-chip.is-selected');
  const finishCount = normalizeGenerationCountValue(selectedCountChip?.dataset.finishCount);

  return {
    creditCost: finishCreditCostFor(finishCount),
    finishCount,
  };
}

function selectedMockupConfig() {
  const scope = activeVisualizationPanel() || document;
  const selectedCountChip = scope.querySelector('[data-chip-group="mockup-count"] .option-chip.is-selected');
  const selectedResolutionChip = scope.querySelector('[data-chip-group="mockup-resolution"] .option-chip.is-selected');
  const mockupCount = normalizeMockupCountValue(selectedCountChip?.dataset.mockupCount);
  const resolutionConfig = mockupResolutionConfig(selectedResolutionChip?.dataset.mockupResolution);
  const scene = readSelectedChip("scene").value;
  const creditCost = mockupCreditCostFor(mockupCount, resolutionConfig.value, scene);

  return {
    creditCost,
    mockupCount,
    resolution: resolutionConfig.value,
    resolutionLabel: resolutionConfig.label,
    scene,
  };
}

function updateDraftCost() {
  const { creditCost } = selectedDraftConfig();
  const costText = `${creditCost} kredi`;

  if (sketchCostSummary) sketchCostSummary.textContent = costText;
}

function updateFinishCost() {
  const { creditCost } = selectedFinishConfig();
  const costText = creditCost > 0 ? `${creditCost} kredi` : "Ücretsiz";

  if (finishCostSummary) finishCostSummary.textContent = costText;
}

function updateMockupCost() {
  const { creditCost } = selectedMockupConfig();
  const costText = `${creditCost} kredi`;

  const summary = activeVisualizationPanel()?.querySelector("[data-mockup-cost-summary]") || mockupCostSummary;
  if (summary) summary.textContent = costText;
}

function updateVisibleSketchCards() {
  const { draftCount } = selectedDraftConfig();

  document.querySelectorAll("[data-sketch-card]").forEach((card, index) => {
    card.classList.toggle("is-hidden", index >= draftCount);
  });
}
