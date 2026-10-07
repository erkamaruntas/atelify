(function () {
  let previewDialog = null;
  let previewDesigns = [];
  let previewIndex = -1;
  let previousPreviewFocus = null;
  let sourceThumbnailReader = null;

  // Toplu seçim / indirme durumu (yalnızca Tasarımlarım ızgarası).
  let selectionMode = false;
  let isBulkDownloading = false;
  const selectedKeys = new Set();
  let selectionControls = null;
  let lastRender = { designs: [], targets: null };

  class SavedDesignsPage {
    constructor(elements = {}) {
      this.elements = elements;
      if (typeof elements.sourceThumbnailReader === "function") {
        sourceThumbnailReader = elements.sourceThumbnailReader;
      }
      setupSelectionControls(elements.savedDesignsPanel);
    }

    render(designs) {
      renderSavedDesigns(designs, {
        grid: this.elements.savedDesignsGrid,
        savedDesignsEmpty: this.elements.savedDesignsEmpty,
        savedDesignsPanel: this.elements.savedDesignsPanel,
      });
    }
  }

  function renderSavedDesigns(designs, { grid, savedDesignsEmpty, savedDesignsPanel }) {
    const designList = Array.isArray(designs) ? designs : [];
    const hasDesigns = designList.length > 0;

    if (savedDesignsEmpty) savedDesignsEmpty.hidden = hasDesigns;
    if (savedDesignsPanel) savedDesignsPanel.hidden = !hasDesigns;
    if (!grid) return;

    previewDesigns = designList.filter((design) => !isSavedDesignLoading(design) && design.imageUrl);
    lastRender = { designs: designList, targets: { grid, savedDesignsEmpty, savedDesignsPanel } };
    pruneSelection();
    releaseImagesIn(grid);
    grid.classList.toggle("is-selecting", selectionMode);
    grid.replaceChildren(...designList.map(createSavedDesignCard));
    updateSelectionControls();
  }

  function createSavedDesignCard(design) {
    const isLoading = isSavedDesignLoading(design);
    const titleText = isLoading ? design.title || "Tasarım" : projectLabel(design);
    const card = document.createElement("article");
    card.className = isLoading ? "design-card is-loading" : "design-card";
    if (!isLoading) card.dataset.designKey = designKey(design);

    if (isLoading) {
      card.setAttribute("role", "status");
      card.setAttribute("aria-busy", "true");
      card.setAttribute("aria-label", `${titleText} oluşturuluyor`);
    } else if (selectionMode) {
      const key = designKey(design);
      const selected = selectedKeys.has(key);
      card.classList.add("is-selectable");
      card.classList.toggle("is-selected", selected);
      card.setAttribute("role", "checkbox");
      card.setAttribute("aria-checked", String(selected));
      card.tabIndex = 0;
      card.setAttribute("aria-label", `${titleText} seç`);
      const toggle = () => toggleDesignSelection(key);
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggle();
      });
    } else {
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.setAttribute("aria-label", `${titleText} detayını aç`);
      card.addEventListener("click", () => openSavedDesignPreview(design));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openSavedDesignPreview(design);
      });
    }

    const visual = document.createElement("div");
    visual.className = isLoading ? "design-visual is-loading" : "design-visual has-image";

    if (isLoading) {
      visual.append(createSavedDesignLoadingVisual());
    } else {
      const image = document.createElement("img");
      image.className = "saved-design-image";
      image.src = design.imageUrl;
      image.alt = titleText || "Kaydedilen tasarım";
      image.decoding = "async";
      image.loading = "lazy";
      visual.append(image);
      if (selectionMode) {
        const check = document.createElement("span");
        check.className = "design-select-check";
        check.setAttribute("aria-hidden", "true");
        visual.append(check);
      }
    }

    const body = document.createElement("div");
    body.className = "design-body";

    const title = document.createElement("h3");
    title.className = "design-title";
    title.textContent = titleText;

    const meta = document.createElement("div");
    meta.className = "design-meta";

    const stage = document.createElement("span");
    stage.textContent = isLoading ? "Görsel hazırlanıyor" : design.stage || "Tasarım Görseli";

    const productShape = document.createElement("span");
    productShape.textContent = productShapeLabel(design);
    productShape.hidden = !productShape.textContent;

    meta.append(stage, productShape);
    body.append(title, meta);
    card.append(visual, body);

    return card;
  }

  function designKey(design) {
    return String(design?.id || design?.imageUrl || "");
  }

  function selectableDesigns() {
    return lastRender.designs.filter((design) => !isSavedDesignLoading(design) && design.imageUrl);
  }

  function selectedDesigns() {
    return selectableDesigns().filter((design) => selectedKeys.has(designKey(design)));
  }

  // Ekranda artık olmayan (silinen / senkronla değişen) tasarımları seçimden düşür.
  function pruneSelection() {
    if (!selectedKeys.size) return;
    const available = new Set(selectableDesigns().map(designKey));
    Array.from(selectedKeys).forEach((key) => {
      if (!available.has(key)) selectedKeys.delete(key);
    });
  }

  function rerenderLast() {
    if (!lastRender.targets) return;
    renderSavedDesigns(lastRender.designs, lastRender.targets);
  }

  function setSelectionMode(enabled) {
    if (isBulkDownloading) return;
    selectionMode = Boolean(enabled);
    if (!selectionMode) selectedKeys.clear();
    setBulkStatus("");
    rerenderLast();
  }

  function toggleDesignSelection(key) {
    if (!key || isBulkDownloading) return;
    if (selectedKeys.has(key)) selectedKeys.delete(key);
    else selectedKeys.add(key);

    const grid = lastRender.targets?.grid;
    const card = grid
      ? Array.from(grid.children).find((child) => child.dataset.designKey === key)
      : null;
    if (card) {
      const selected = selectedKeys.has(key);
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-checked", String(selected));
      updateSelectionControls();
    } else {
      rerenderLast();
    }
  }

  function toggleSelectAll() {
    if (isBulkDownloading) return;
    const all = selectableDesigns().map(designKey);
    const allSelected = all.length > 0 && all.every((key) => selectedKeys.has(key));
    selectedKeys.clear();
    if (!allSelected) all.forEach((key) => selectedKeys.add(key));
    rerenderLast();
  }

  function setupSelectionControls(panel) {
    if (!panel || selectionControls) return;
    const query = (name) => panel.querySelector(`[data-saved-designs-${name}]`);
    selectionControls = {
      toggle: query("select-toggle"),
      bar: query("selection-bar"),
      count: query("selection-count"),
      selectAll: query("select-all"),
      download: query("download"),
      cancel: query("select-cancel"),
      status: query("download-status"),
    };

    selectionControls.toggle?.addEventListener("click", () => setSelectionMode(!selectionMode));
    selectionControls.cancel?.addEventListener("click", () => setSelectionMode(false));
    selectionControls.selectAll?.addEventListener("click", toggleSelectAll);
    selectionControls.download?.addEventListener("click", downloadSelectedDesigns);
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && selectionMode) setSelectionMode(false);
    });
  }

  function updateSelectionControls() {
    if (!selectionControls) return;
    const { toggle, bar, count, selectAll, download, cancel } = selectionControls;
    const total = selectableDesigns().length;
    const selected = selectedDesigns().length;

    if (toggle) {
      toggle.hidden = selectionMode || total === 0;
    }
    if (bar) bar.hidden = !selectionMode;
    if (count) count.textContent = selected ? `${selected} tasarım seçili` : "Tasarımlara dokunarak seç";
    if (selectAll) {
      selectAll.textContent = total > 0 && selected === total ? "Seçimi kaldır" : "Tümünü seç";
      selectAll.disabled = isBulkDownloading || total === 0;
    }
    if (download) {
      download.disabled = isBulkDownloading || selected === 0;
      if (!isBulkDownloading) download.textContent = selected > 1 ? `İndir (${selected}) · ZIP` : "İndir";
    }
    if (cancel) cancel.disabled = isBulkDownloading;
  }

  function setBulkStatus(message, tone = "") {
    const status = selectionControls?.status;
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
    status.hidden = !message;
  }

  async function fetchDesignBytes(design) {
    const response = await fetch(design.imageUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  }

  function uniqueZipNames(designs) {
    const width = String(designs.length).length;
    return designs.map((design, index) => {
      const base = fileNameFromDesign(design).replace(/^atelify-/, "");
      return `${String(index + 1).padStart(width, "0")}-${base}`;
    });
  }

  function todayStamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  async function downloadSelectedDesigns() {
    const designs = selectedDesigns();
    if (!designs.length || isBulkDownloading) return;
    const button = selectionControls?.download;

    if (designs.length === 1) {
      if (button) {
        button.dataset.downloadUrl = designs[0].imageUrl;
        button.dataset.downloadFileName = fileNameFromDesign(designs[0]);
        await downloadPreviewImage(button);
      }
      return;
    }

    const zipWriter = window.FFZipWriter;
    if (!zipWriter) {
      setBulkStatus("Toplu indirme şu an kullanılamıyor.", "error");
      return;
    }

    isBulkDownloading = true;
    updateSelectionControls();
    const names = uniqueZipNames(designs);
    const files = [];
    let failed = 0;
    let done = 0;
    const report = () => {
      if (button) button.textContent = `İndiriliyor ${done}/${designs.length}`;
    };
    report();

    // Aynı anda en fazla 4 istek: hızlı ama tarayıcıyı ve depolamayı boğmadan.
    let cursor = 0;
    const worker = async () => {
      while (cursor < designs.length) {
        const index = cursor;
        cursor += 1;
        try {
          const data = await fetchDesignBytes(designs[index]);
          files[index] = { name: names[index], data, date: new Date(designs[index].createdAt || Date.now()) };
        } catch {
          failed += 1;
        }
        done += 1;
        report();
      }
    };

    try {
      await Promise.all(Array.from({ length: Math.min(4, designs.length) }, worker));
      const ready = files.filter(Boolean);
      if (!ready.length) {
        setBulkStatus("Görseller indirilemedi. Bağlantını kontrol edip tekrar dene.", "error");
        return;
      }
      const blob = new Blob([zipWriter.createZipBytes(ready)], { type: "application/zip" });
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, `atelify-tasarimlar-${todayStamp()}.zip`);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
      // Tam başarıda yazı yok (indirme tarayıcıda görünür); yalnızca eksik varsa uyar.
      setBulkStatus(failed ? `${ready.length} tasarım indirildi, ${failed} tasarım indirilemedi.` : "", "warning");
    } finally {
      isBulkDownloading = false;
      updateSelectionControls();
    }
  }

  function createSavedDesignLoadingVisual() {
    const wrap = document.createElement("span");
    wrap.className = "design-loading-indicator";
    wrap.setAttribute("aria-hidden", "true");

    const spinner = document.createElement("span");
    spinner.className = "result-spinner";
    wrap.append(spinner);
    return wrap;
  }

  function openSavedDesignPreview(design, index = findPreviewIndex(design)) {
    if (!design?.imageUrl || isSavedDesignLoading(design)) return;

    const dialog = ensureSavedDesignPreviewDialog();
    const wasHidden = dialog.hidden;

    if (wasHidden) {
      previousPreviewFocus = document.activeElement && typeof document.activeElement.focus === "function"
        ? document.activeElement
        : null;
    }

    previewIndex = Number.isInteger(index) && index >= 0 ? index : findPreviewIndex(design);
    renderSavedDesignPreview(dialog, design);

    dialog.hidden = false;
    document.body.classList.add("is-design-preview-open");
    if (wasHidden) {
      window.setTimeout(() => dialog.querySelector("[data-design-preview-close]")?.focus(), 0);
    }
  }

  function renderSavedDesignPreview(dialog, design) {
    setPreviewText(dialog, "eyebrow", "Kaydedilen tasarım");
    setPreviewText(dialog, "title", design.title || "Tasarım");
    setPreviewText(dialog, "created", formatSavedDesignDateTime(design.createdAt));
    setPreviewText(dialog, "stage", design.stage || "Tasarım Görseli");
    setPreviewText(dialog, "source", sourceLabel(design));
    setPreviewText(dialog, "saveType", design.autoSaved ? "Otomatik kayıt" : "Elle kayıt");
    setPreviewText(dialog, "project", projectLabel(design));
    setPreviewText(dialog, "productShape", productShapeLabel(design));
    setPreviewText(dialog, "generatedBy", generatedByLabel(design.generatedBy));

    const image = dialog.querySelector("[data-design-preview-image]");
    if (image) {
      if ((image.getAttribute("src") || "") !== design.imageUrl) {
        image.removeAttribute("src");
      }
      image.src = design.imageUrl;
      image.alt = design.title || "Kaydedilen tasarım";
    }

    const download = dialog.querySelector("[data-design-preview-download]");
    if (download) {
      download.dataset.downloadUrl = design.imageUrl;
      download.dataset.downloadFileName = fileNameFromDesign(design);
    }

    renderSourcePreview(dialog, design);
  }

  function closeSavedDesignPreview() {
    if (!previewDialog || previewDialog.hidden) return;

    previewDialog.hidden = true;
    document.body.classList.remove("is-design-preview-open");

    const image = previewDialog.querySelector("[data-design-preview-image]");
    if (image) {
      image.removeAttribute("src");
      image.alt = "";
    }
    const sourceImage = previewDialog.querySelector("[data-design-preview-source-image]");
    if (sourceImage) {
      sourceImage.removeAttribute("src");
      sourceImage.alt = "Önceki görsel";
      sourceImage.hidden = true;
    }

    previousPreviewFocus?.focus();
    previousPreviewFocus = null;
    previewIndex = -1;
  }

  function findPreviewIndex(design) {
    if (!design) return -1;
    const id = design.id || "";
    const imageUrl = design.imageUrl || "";
    return previewDesigns.findIndex((candidate) => (
      (id && candidate.id === id) || (imageUrl && candidate.imageUrl === imageUrl)
    ));
  }

  function navigateSavedDesignPreview(direction) {
    if (!previewDialog || previewDialog.hidden || previewDesigns.length < 2) return;

    const currentIndex = previewIndex >= 0 ? previewIndex : findPreviewIndex({
      imageUrl: previewDialog.querySelector("[data-design-preview-image]")?.src || "",
    });
    const nextIndex = currentIndex >= 0
      ? (currentIndex + direction + previewDesigns.length) % previewDesigns.length
      : direction > 0 ? 0 : previewDesigns.length - 1;
    const nextDesign = previewDesigns[nextIndex];

    if (!nextDesign) return;
    previewIndex = nextIndex;
    renderSavedDesignPreview(previewDialog, nextDesign);
  }

  function ensureSavedDesignPreviewDialog() {
    if (previewDialog) return previewDialog;

    const dialog = document.createElement("div");
    dialog.className = "studio-modal design-preview-modal";
    dialog.dataset.designPreviewDialog = "";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "designPreviewTitle");
    dialog.hidden = true;

    const backdrop = document.createElement("button");
    backdrop.className = "studio-modal-backdrop";
    backdrop.type = "button";
    backdrop.dataset.designPreviewClose = "";
    backdrop.setAttribute("aria-label", "Kapat");

    const panel = document.createElement("div");
    panel.className = "studio-modal-panel design-preview-panel";

    const media = document.createElement("section");
    media.className = "design-preview-media";
    media.setAttribute("aria-label", "Tasarım görseli");

    const image = document.createElement("img");
    image.className = "design-preview-image";
    image.dataset.designPreviewImage = "";
    image.decoding = "async";
    media.append(image);

    const info = document.createElement("aside");
    info.className = "design-preview-info";
    info.setAttribute("aria-label", "Tasarım bilgileri");

    const head = document.createElement("div");
    head.className = "design-preview-head";

    const copy = document.createElement("div");
    copy.className = "design-preview-copy";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.dataset.designPreviewEyebrow = "";

    const title = document.createElement("h2");
    title.className = "studio-modal-title design-preview-title";
    title.id = "designPreviewTitle";
    title.dataset.designPreviewTitle = "";

    const close = document.createElement("button");
    close.className = "button button-secondary design-preview-close";
    close.type = "button";
    close.dataset.designPreviewClose = "";
    close.textContent = "Kapat";

    copy.append(eyebrow, title);
    head.append(copy, close);

    const details = document.createElement("dl");
    details.className = "design-preview-details";
    [
      ["Kayıt", "created"],
      ["Aşama", "stage"],
      ["Kaynak", "source"],
      ["Kayıt tipi", "saveType"],
      ["Proje", "project"],
      ["Ürün / Şekil", "productShape"],
      ["Üreten", "generatedBy"],
    ].forEach(([label, key]) => details.append(createPreviewDetail(label, key)));

    const actions = document.createElement("div");
    actions.className = "design-preview-actions";

    const download = document.createElement("button");
    download.className = "button button-primary";
    download.type = "button";
    download.dataset.designPreviewDownload = "";
    download.textContent = "İndir";

    const source = document.createElement("section");
    source.className = "design-preview-source";
    source.dataset.designPreviewSource = "";

    const sourceHeading = document.createElement("p");
    sourceHeading.className = "eyebrow";
    sourceHeading.textContent = "Önceki hali";

    const sourceFrame = document.createElement("div");
    sourceFrame.className = "design-preview-source-frame";

    const sourceImage = document.createElement("img");
    sourceImage.className = "design-preview-source-image";
    sourceImage.dataset.designPreviewSourceImage = "";
    sourceImage.alt = "Önceki görsel";
    sourceImage.decoding = "async";
    sourceImage.hidden = true;

    const sourcePlaceholder = document.createElement("span");
    sourcePlaceholder.className = "design-preview-source-placeholder";
    sourcePlaceholder.dataset.designPreviewSourcePlaceholder = "";
    sourcePlaceholder.textContent = "Kaynak görsel kaydı yok";

    sourceFrame.append(sourceImage, sourcePlaceholder);

    const sourceCaption = document.createElement("strong");
    sourceCaption.className = "design-preview-source-caption";
    sourceCaption.dataset.designPreviewSourceCaption = "";

    source.append(sourceHeading, sourceFrame, sourceCaption);

    actions.append(download);
    info.append(head, details, source, actions);
    panel.append(media, info);
    dialog.append(backdrop, panel);

    dialog.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;

      const downloadButton = event.target.closest("[data-design-preview-download]");
      if (downloadButton) {
        downloadPreviewImage(downloadButton);
        return;
      }

      if (event.target.closest("[data-design-preview-close]")) {
        closeSavedDesignPreview();
      }
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSavedDesignPreview();
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        navigateSavedDesignPreview(1);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        navigateSavedDesignPreview(-1);
      }
    });

    document.body.append(dialog);
    previewDialog = dialog;
    return previewDialog;
  }

  function createPreviewDetail(label, key) {
    const row = document.createElement("div");
    row.className = "design-preview-detail";

    const term = document.createElement("dt");
    term.textContent = label;

    const value = document.createElement("dd");
    value.dataset.designPreviewValue = key;

    row.append(term, value);
    return row;
  }

  function setPreviewText(dialog, key, value) {
    const valueSlot = dialog.querySelector(`[data-design-preview-value="${key}"]`);
    if (valueSlot) valueSlot.textContent = value || "-";

    const directSlot = dialog.querySelector(`[data-design-preview-${key}]`);
    if (directSlot) directSlot.textContent = value || "-";
  }

  function renderSourcePreview(dialog, design) {
    const source = dialog.querySelector("[data-design-preview-source]");
    if (!source) return;

    const sourceImageUrl = sourceImageUrlForDesign(design);
    const label = sourceLabel(design);
    const caption = sourceImageUrl
      ? label || "Önceki kaynak görsel"
      : "Kaynak fotoğraf bu eski kayıtta yok";

    source.hidden = !sourceImageUrl;
    source.classList.toggle("has-image", Boolean(sourceImageUrl));
    source.classList.toggle("is-empty", !sourceImageUrl);

    const image = source.querySelector("[data-design-preview-source-image]");
    const placeholder = source.querySelector("[data-design-preview-source-placeholder]");
    const captionSlot = source.querySelector("[data-design-preview-source-caption]");

    if (image) {
      image.hidden = !sourceImageUrl;
      if (sourceImageUrl) {
        if ((image.getAttribute("src") || "") !== sourceImageUrl) {
          image.removeAttribute("src");
        }
        image.src = sourceImageUrl;
        image.alt = caption;
      } else {
        image.removeAttribute("src");
        image.alt = "Önceki görsel";
      }
    }

    if (placeholder) {
      placeholder.hidden = Boolean(sourceImageUrl);
      placeholder.textContent = "Kaynak fotoğraf kaydedilmedi";
    }

    if (captionSlot) captionSlot.textContent = caption;
  }

  function sourceImageUrlForDesign(design) {
    const explicitUrl = String(design?.sourceImageUrl || design?.previousImageUrl || "").trim();
    if (explicitUrl && explicitUrl !== design.imageUrl) return explicitUrl;

    const sourceName = String(design?.sourceTitle || design?.sourceFileName || "").trim();
    if (!sourceName) return "";

    const currentReferenceUrl = currentReferenceSourceUrl(sourceName);
    if (currentReferenceUrl) return currentReferenceUrl;

    const storedUrl = storedSourceThumbnailUrl(sourceName);
    if (storedUrl) return storedUrl;

    const normalizedSourceName = normalizeLookupText(sourceName);
    const match = previewDesigns.find((candidate) => {
      if (!candidate || candidate === design || candidate.imageUrl === design.imageUrl) return false;
      return normalizeLookupText(candidate.title) === normalizedSourceName;
    });

    return match?.imageUrl || "";
  }

  function currentReferenceSourceUrl(sourceName) {
    const input = document.querySelector("[data-reference-upload]");
    const fileName = input?.files?.[0]?.name || "";
    if (!fileName || normalizeLookupText(fileName) !== normalizeLookupText(sourceName)) return "";

    const preview = document.querySelector("[data-reference-preview]");
    const previewUrl = preview?.hidden ? "" : preview?.getAttribute("src") || "";
    if (previewUrl && previewUrl !== "about:blank") return previewUrl;

    const file = input.files?.[0];
    return "";
  }

  function storedSourceThumbnailUrl(sourceName) {
    const normalizedSourceName = normalizeLookupText(sourceName);
    if (sourceThumbnailReader) {
      return sourceThumbnailReader(normalizedSourceName) || "";
    }
    return "";
  }

  function normalizeLookupText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/ı/g, "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function releaseImagesIn(root) {
    if (!root || typeof root.querySelectorAll !== "function") return;
    root.querySelectorAll("img").forEach((image) => {
      image.removeAttribute("src");
    });
  }

  async function downloadPreviewImage(button) {
    const imageUrl = button.dataset.downloadUrl;
    const fileName = button.dataset.downloadFileName || "atelify-tasarim.png";
    if (!imageUrl) return;

    const idleLabel = button.textContent;
    button.disabled = true;
    button.textContent = "İndiriliyor...";

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, fileName);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
    } catch {
      triggerDownload(imageUrl, fileName, true);
    } finally {
      button.disabled = false;
      button.textContent = idleLabel || "İndir";
    }
  }

  function triggerDownload(url, fileName, openInNewTab = false) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    if (openInNewTab) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function formatSavedDesignDateTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "Bugün";
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function sourceLabel(design) {
    if (design.sourceFileName) return design.sourceFileName;
    if (design.sourceStage === "sketch") return "Ürün / Tasarım";
    if (design.sourceStage === "finish") return "Görsel Üretimi";
    if (design.sourceStage === "mockup") return "Mockup / Manken";
    return "Atelify üretimi";
  }

  function projectLabel(design) {
    const title = String(design?.projectTitle || "").trim();
    if (title) return title;
    return design?.projectId ? "İsimsiz proje" : "Genel arşiv";
  }

  function productShapeLabel(design) {
    return [
      design?.productLabel || "",
      design?.productShapeLabel || design?.shapeLabel || "",
    ].filter(Boolean).join(" / ");
  }

  function generatedByLabel(value) {
    if (!value) return "Atelify";
    if (value === "ai") return "AI";
    return value;
  }

  function fileNameFromDesign(design) {
    const title = slugify(design.title || "tasarim");
    const stage = slugify(design.stage || "studio");
    return `atelify-${title}-${stage}.${imageExtensionFromUrl(design.imageUrl)}`;
  }

  function imageExtensionFromUrl(imageUrl) {
    const dataMatch = String(imageUrl || "").match(/^data:image\/([a-z0-9.+-]+);/i);
    if (dataMatch) return normalizeImageExtension(dataMatch[1]);

    try {
      const path = new URL(imageUrl, window.location.href).pathname;
      const extension = path.match(/\.([a-z0-9]+)$/i)?.[1];
      return normalizeImageExtension(extension);
    } catch {
      return "png";
    }
  }

  function normalizeImageExtension(value) {
    const extension = String(value || "").toLowerCase();
    if (extension === "jpeg") return "jpg";
    if (["png", "jpg", "webp", "avif", "gif"].includes(extension)) return extension;
    return "png";
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/ı/g, "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 42) || "tasarim";
  }

  function mergeSavedDesigns(localDesigns = [], cloudDesigns = [], limit = 80) {
    const byKey = new Map();
    const sourceDesigns = [...cloudDesigns, ...localDesigns].map(sanitizeSavedDesign).filter(Boolean);
    const completedJobIds = new Set(
      sourceDesigns
        .filter((design) => !isSavedDesignLoading(design))
        .map((design) => String(design.generationJobId || "").trim())
        .filter(Boolean)
    );

    sourceDesigns.forEach((design) => {
      if (!design?.imageUrl && !isSavedDesignLoading(design)) return;
      if (isSavedDesignLoading(design) && completedJobIds.has(String(design.pendingJobId || design.generationJobId || "").trim())) {
        return;
      }
      const key = design.imageUrl || pendingDesignKey(design) || design.id;
      const current = byKey.get(key);
      if (!current || dateValue(design.createdAt) >= dateValue(current.createdAt)) {
        byKey.set(key, design);
      }
    });

    return sanitizeSavedDesignList(Array.from(byKey.values()), limit);
  }

  function sanitizeSavedDesignList(designs, limit = 80) {
    return (Array.isArray(designs) ? designs : [])
      .map(sanitizeSavedDesign)
      .filter(Boolean)
      .slice()
      .sort((first, second) => dateValue(second.createdAt) - dateValue(first.createdAt))
      .slice(0, limit);
  }

  function sanitizeSavedDesign(design) {
    if (!design || typeof design !== "object") return null;

    const imageUrl = typeof design.imageUrl === "string" ? design.imageUrl.trim() : "";
    const loading = isSavedDesignLoading(design);
    if (imageUrl.startsWith("blob:")) return null;
    if (!imageUrl && !loading) return null;
    if (loading && isStaleLoadingDesign(design)) return null;

    return {
      ...design,
      imageUrl,
      isLoading: loading,
      status: loading ? "loading" : "ready",
    };
  }

  function isSavedDesignLoading(design) {
    const imageUrl = typeof design?.imageUrl === "string" ? design.imageUrl.trim() : "";
    return !imageUrl && (design?.isLoading === true || design?.status === "loading");
  }

  function isStaleLoadingDesign(design) {
    const createdAt = dateValue(design.createdAt);
    if (!createdAt) return false;
    return Date.now() - createdAt > 35 * 60 * 1000;
  }

  function pendingDesignKey(design) {
    const jobId = String(design?.pendingJobId || "").trim();
    if (!jobId) return "";
    return `${jobId}:${Number.parseInt(design.pendingIndex || "0", 10) || 0}`;
  }

  function dateValue(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
  }

  window.FFStudioSavedDesigns = Object.freeze({
    SavedDesignsPage,
    isSavedDesignLoading,
    mergeSavedDesigns,
    renderSavedDesigns,
    sanitizeSavedDesignList,
  });
})();
