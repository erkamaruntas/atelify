// Atelify stüdyo — orders
// Sipariş: ölçüler, zincir, fiyat hesabı, sepet ve üretim talepleri.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


// ─── Üretim talebi (production request) ─────────────────────────────────────
const PRODUCTION_METAL_LABELS = { altin: "Altın", gumus: "Gümüş", rose: "Rose" };
const PRODUCTION_STATUS_LABELS = {
  pending: "Ödeme bekliyor",
  confirmed: "Ödendi · Onaylandı",
  in_production: "Üretimde",
  shipped: "Kargoda",
  completed: "Tamamlandı",
  cancelled: "İptal",
};
const RING_SIZE_OPTIONS_BY_SHAPE = {
  kare: [
    { key: "kare-s", label: "Kare - S", dimensions: "1,3 x 1,3 cm" },
    { key: "kare-m", label: "Kare - M", dimensions: "1,5 x 1,5 cm" },
    { key: "kare-l", label: "Kare - L", dimensions: "1,7 x 1,7 cm" },
    { key: "kare-xl", label: "Kare - XL", dimensions: "1,9 x 1,9 cm" },
  ],
  oval: [
    { key: "oval-s", label: "Oval - S", dimensions: "1 x 1,2 cm" },
    { key: "oval-m", label: "Oval - M", dimensions: "1,1 x 1,5 cm" },
    { key: "oval-l", label: "Oval - L", dimensions: "1,2 x 1,8 cm" },
    { key: "oval-xl", label: "Oval - XL", dimensions: "1,3 x 2,1 cm" },
  ],
  yuvarlak: [
    { key: "yuvarlak-s", label: "Yuvarlak - S", dimensions: "1,2 cm" },
    { key: "yuvarlak-m", label: "Yuvarlak - M", dimensions: "1,4 cm" },
    { key: "yuvarlak-l", label: "Yuvarlak - L", dimensions: "1,6 cm" },
    { key: "yuvarlak-xl", label: "Yuvarlak - XL", dimensions: "1,8 cm" },
  ],
};
// Kolye ucu ölçüleri (mm). Yuvarlak/kare → çap/kenar; oval/dikdörtgen → YÜKSEKLİK ve
// genişlik 4:5 oranından türer (genişlik = yükseklik × 4/5).
// Server src/services/production-requests.service.js ile SENKRON tutulmalı.
const PENDANT_SIZES_MM = [15, 20, 25, 30, 35, 40];
const PENDANT_ASPECT_SHAPES = ["oval", "dikdortgen"];

function pendantSizeDimensionsText(mm, shape) {
  if (PENDANT_ASPECT_SHAPES.includes(shape)) return `${(mm * 4) / 5} x ${mm} mm (G x Y)`;
  if (shape === "yuvarlak") return `${mm} mm çap`;
  return `${mm} x ${mm} mm`;
}

function pendantSizeOptionsForShape(shape) {
  return PENDANT_SIZES_MM.map((mm) => ({
    key: `kolye-${shape}-${mm}`,
    label: `${mm} mm`,
    dimensions: pendantSizeDimensionsText(mm, shape),
  }));
}

function pendantSizeOption(shape, value) {
  return pendantSizeOptionsForShape(shape).find((option) => option.key === String(value || "").toLowerCase()) || null;
}
// TR ölçü aralığı (varsayılan sistem)
const RING_MEASURE_MIN = 7;
const RING_MEASURE_MAX = 35;
// US ölçü aralığı
const RING_MEASURE_US_MIN = 1;
const RING_MEASURE_US_MAX = 15;
const RING_MEASURE_DEFAULT_SYSTEM = "tr";
let productionRequestsCache = null;

function showStudioToast(message, tone = "info", duration = 4200) {
  const host = document.querySelector("[data-toast-host]");
  if (!host || !message) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.dataset.tone = tone;
  toast.textContent = message;
  host.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function showSiteConfirm({
  eyebrow = "Sepet",
  title = "Ürün sepete eklendi",
  message = "Sepete gitmek ister misin?",
  okText = "Sepete git",
  cancelText = "Vazgeç",
} = {}) {
  const dialog = document.querySelector("[data-site-confirm]");
  if (!dialog) return Promise.resolve(false);

  const titleEl = dialog.querySelector("[data-site-confirm-title]");
  const eyebrowEl = dialog.querySelector("[data-site-confirm-eyebrow]");
  const messageEl = dialog.querySelector("[data-site-confirm-message]");
  const okButton = dialog.querySelector("[data-site-confirm-ok]");
  const cancelButtons = dialog.querySelectorAll("[data-site-confirm-cancel]");

  if (eyebrowEl) eyebrowEl.textContent = eyebrow;
  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;
  if (okButton) okButton.textContent = okText;
  cancelButtons.forEach((button) => {
    button.textContent = button.classList.contains("site-confirm-backdrop") ? "" : cancelText;
  });

  dialog.hidden = false;
  document.body.classList.add("is-production-dialog-open");
  okButton?.focus?.();

  return new Promise((resolve) => {
    const cleanup = (value) => {
      dialog.hidden = true;
      const productionDialog = document.querySelector("[data-production-dialog]");
      const cartDrawer = document.querySelector("[data-cart-drawer]");
      if (!productionDialog?.open && cartDrawer?.hidden !== false) {
        document.body.classList.remove("is-production-dialog-open");
      }
      okButton?.removeEventListener("click", onOk);
      cancelButtons.forEach((button) => button.removeEventListener("click", onCancel));
      window.removeEventListener("keydown", onKeydown);
      resolve(value);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onKeydown = (event) => {
      if (event.key === "Escape") cleanup(false);
    };
    okButton?.addEventListener("click", onOk);
    cancelButtons.forEach((button) => button.addEventListener("click", onCancel));
    window.addEventListener("keydown", onKeydown);
  });
}

function readSelectedMockupSnapshot() {
  const selected = (activeVisualizationPanel() || document).querySelector("[data-mockup-result-card].is-selected");
  if (!selected) return null;
  const dataset = selected.dataset || {};
  const imageUrl = safePersistedImageUrl(dataset.mockupImageUrl || "", "mockupImageUrl");
  if (!imageUrl) return null;

  const productValue = (dataset.productValue || dataset.product || "yuzuk").toLowerCase();
  const shapeValue = (dataset.productShapeValue || dataset.productShape || "yuvarlak").toLowerCase();
  return {
    designRef: dataset.savedDesignId || dataset.mockupResultId || "",
    product: productValue === "kolye" ? "kolye" : "yuzuk",
    productShape: ["dikdortgen", "kare", "oval", "yuvarlak"].includes(shapeValue) ? shapeValue : "yuvarlak",
    designSnapshot: {
      imageUrl,
      sourceImageUrl: safePersistedImageUrl(dataset.sourceImageUrl || "", "sourceImageUrl"),
      finishImageUrl: safePersistedImageUrl(dataset.finishImageUrl || "", "finishImageUrl"),
      title: dataset.resultTitle || selected.querySelector(".sketch-body strong")?.textContent || dataset.title || "Tasarım",
      stage: dataset.stage || "mockup",
      designMode: dataset.designModeValue || "engrave",
      designModeLabel: dataset.designModeLabel || "",
      productLabel: dataset.productLabel || (productValue === "kolye" ? "Kolye" : "Yüzük"),
      shapeLabel: dataset.productShapeLabel || dataset.shapeLabel || "",
      moldKey: dataset.moldKey || "",
      storagePath: dataset.storagePath || "",
      storageBucket: dataset.storageBucket || "",
    },
  };
}


function applyProfileDefaultsToProductionForm(form) {
  if (!form) return;
  const profile = readStoredProfile();
  const email = currentProfileEmail();
  if (form.elements.contactEmail && email && email !== "—" && !email.endsWith("@ff.local")) {
    form.elements.contactEmail.value = email;
  }
  if (form.elements.contactPhone && profile.phone) {
    form.elements.contactPhone.value = profile.phone;
  }
}

function currentCheckoutProfile() {
  const profile = readStoredProfile();
  const email = currentProfileEmail();
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  return {
    name,
    phone: profile.phone || "",
    email: email && email !== "—" && !email.endsWith("@ff.local") ? email : "",
  };
}

function readRequiredOrderProfile() {
  const contactInfo = currentCheckoutProfile();
  const profile = readStoredProfile();
  if (!profile.firstName) return { contactInfo, error: "Sipariş oluşturmak için Profilim ekranında ad bilgisini tamamla." };
  if (!profile.lastName) return { contactInfo, error: "Sipariş oluşturmak için Profilim ekranında soyad bilgisini tamamla." };
  if (!contactInfo.phone) return { contactInfo, error: "Sipariş oluşturmak için Profilim ekranında telefon bilgisini tamamla." };
  if (!contactInfo.email) return { contactInfo, error: "Sipariş oluşturmak için e-posta oturumun gerekli." };
  return { contactInfo, error: "" };
}

function hasRequiredOrderProfile() {
  return !readRequiredOrderProfile().error;
}

// Zincir AYRI SATILAN opsiyon: müşteri istemeyebilir. Tür daima forse; kalınlık ince/orta/kalın.
// Uzunluk elle girilir (cm veya inç) — kanonik değer DAİMA cm.
// Server src/config/physical-pricing.js + production-requests.service.js ile SENKRON tutulmalı.
const CHAIN_TYPE_LABELS = { ince: "İnce forse zincir", orta: "Orta forse zincir", kalin: "Kalın forse zincir" };
const CHAIN_MIN_CM = 30;
const CHAIN_MAX_CM = 80;
const CM_PER_INCH = 2.54;
const CHAIN_MIN_INCH = Math.ceil(CHAIN_MIN_CM / CM_PER_INCH); // 12
const CHAIN_MAX_INCH = Math.floor(CHAIN_MAX_CM / CM_PER_INCH); // 31

function chainLengthBounds(unit) {
  return unit === "inch"
    ? { min: CHAIN_MIN_INCH, max: CHAIN_MAX_INCH }
    : { min: CHAIN_MIN_CM, max: CHAIN_MAX_CM };
}

// Form değerlerinden zincir seçimini çözer; geçersiz uzunlukta lengthCm 0 kalır (fiyat gösterilmez).
function chainSelectionFromForm(formData, isKolye) {
  const enabled = isKolye && Boolean(formData.get("chainIncluded"));
  if (!enabled) {
    return { enabled: false, type: "", lengthCm: 0, lengthUnit: "", lengthValue: 0, label: "" };
  }
  const type = ["ince", "orta", "kalin"].includes(String(formData.get("chainType") || ""))
    ? String(formData.get("chainType"))
    : "orta";
  const unit = String(formData.get("chainLengthUnit") || "cm") === "inch" ? "inch" : "cm";
  const raw = Number(formData.get("chainLengthValue"));
  const bounds = chainLengthBounds(unit);
  const valid = Number.isFinite(raw) && raw >= bounds.min && raw <= bounds.max;
  if (!valid) return { enabled: true, type, lengthCm: 0, lengthUnit: unit, lengthValue: 0, label: "" };

  const lengthCm = unit === "inch" ? Math.round(raw * CM_PER_INCH) : Math.round(raw);
  const lengthValue = unit === "inch" ? Math.round(raw * 2) / 2 : lengthCm;
  const lengthText = unit === "inch" ? `${lengthValue} inç (${lengthCm} cm)` : `${lengthCm} cm`;
  return {
    enabled: true,
    type,
    lengthCm,
    lengthUnit: unit,
    lengthValue,
    label: `${CHAIN_TYPE_LABELS[type]}, ${lengthText}`,
  };
}
const ORDER_CART_STORAGE_KEY = "ff-studio-order-cart-v1";
let orderCartItems = readOrderCartItems();
let orderCartCloseTimer = null;

function ringSizeOption(shape, value) {
  const options = RING_SIZE_OPTIONS_BY_SHAPE[shape] || [];
  const key = normalizeRingSize(shape, value);
  return options.find((option) => option.key === key) || null;
}

function renderOrderRingSizeOptions(form, product, selectedShape, selectedSize) {
  const field = form.querySelector("[data-production-ring-size]");
  const row = form.querySelector("[data-production-ring-size-row]");
  if (!field || !row) return;

  const shape = normalizeOrderShape(selectedShape, product);
  const options = product === "yuzuk" ? RING_SIZE_OPTIONS_BY_SHAPE[shape] || [] : [];
  field.hidden = !options.length;
  row.replaceChildren();
  if (!options.length) return;

  const active = normalizeRingSize(shape, selectedSize);
  row.replaceChildren(
    ...options.map((option) => {
      const label = document.createElement("label");
      label.className = "production-chip production-size-chip";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "ringSize";
      input.value = option.key;
      input.required = true;
      if (option.key === active) input.checked = true;
      const text = document.createElement("span");
      const title = document.createElement("strong");
      // Şekil adı pencere başlığında zaten yazıyor; çipte yalnızca beden (S, M, L, XL).
      title.textContent = option.label.split(" - ").pop();
      input.setAttribute("aria-label", `${option.label}, ${option.dimensions}`);
      const dimensions = document.createElement("small");
      dimensions.textContent = option.dimensions;
      text.append(title, dimensions);
      label.append(input, text);
      return label;
    })
  );
}

// Kolye ucu ölçüsü seçimi (mm). Varsayılan seçili gelmez; kullanıcı seçmeden sepete eklenemez.
function renderOrderPendantSizeOptions(form, product, selectedShape, selectedSize) {
  const field = form.querySelector("[data-production-pendant-size]");
  const row = form.querySelector("[data-production-pendant-size-row]");
  if (!field || !row) return;

  const shape = normalizeOrderShape(selectedShape, product);
  const options = product === "kolye" ? pendantSizeOptionsForShape(shape) : [];
  field.hidden = !options.length;
  row.replaceChildren();
  if (!options.length) return;

  const hint = field.querySelector("[data-production-pendant-size-hint]");
  if (hint) {
    hint.textContent = PENDANT_ASPECT_SHAPES.includes(shape)
      ? "Seçtiğin ölçü yüksekliktir; genişlik 4:5 oranıyla belirlenir."
      : shape === "yuvarlak"
        ? "Seçtiğin ölçü kolye ucunun çapıdır."
        : "Seçtiğin ölçü kolye ucunun kenar uzunluğudur.";
  }

  const active = pendantSizeOption(shape, selectedSize)?.key || "";
  row.replaceChildren(
    ...options.map((option) => {
      const label = document.createElement("label");
      label.className = "production-chip production-size-chip";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "pendantSize";
      input.value = option.key;
      input.required = true;
      if (option.key === active) input.checked = true;
      const text = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = option.label;
      const dimensions = document.createElement("small");
      dimensions.textContent = option.dimensions;
      text.append(title, dimensions);
      label.append(input, text);
      return label;
    })
  );
}

// Sipariş penceresindeki "TR / US" düğmesi ve "− 13 +" sayacı. Asıl değerler gizli
// <select>'lerde durur (fiyat ve sepet kodu onları okur); bu kontrol yalnızca onları
// günceller ve "change" olayını tetikler, böylece fiyat kendiliğinden yeniden hesaplanır.
function bindRingMeasureControl(form) {
  const control = form.querySelector("[data-measure-control]");
  const select = form.querySelector("[data-production-ring-measure-select]");
  const systemSelect = form.querySelector("[data-production-ring-measure-system]");
  if (!control || !select || !systemSelect || control.dataset.bound) return;
  control.dataset.bound = "1";

  const output = control.querySelector("[data-measure-value]");
  const stepButtons = [...control.querySelectorAll("[data-measure-step]")];
  const systemButtons = [...control.querySelectorAll("[data-measure-system]")];

  const sync = () => {
    if (output) output.textContent = select.value || "—";
    const index = select.selectedIndex;
    stepButtons.forEach((button) => {
      const step = Number(button.dataset.measureStep);
      button.disabled = step < 0 ? index <= 0 : index >= select.options.length - 1;
    });
    systemButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.measureSystem === systemSelect.value));
    });
  };

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = select.selectedIndex + Number(button.dataset.measureStep);
      if (next < 0 || next >= select.options.length) return;
      select.selectedIndex = next;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
    });
  });

  systemButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (systemSelect.value === button.dataset.measureSystem) return;
      systemSelect.value = button.dataset.measureSystem;
      systemSelect.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
    });
  });

  // Liste yeniden doldurulunca (pencere açılışı, ölçü sistemi değişimi) görüntüyü tazele.
  new MutationObserver(sync).observe(select, { childList: true });
  select.addEventListener("change", sync);
  sync();
}

function renderOrderRingMeasureOptions(form, product, selectedMeasure, selectedSystem) {
  const field = form.querySelector("[data-production-ring-measure]");
  const select = form.querySelector("[data-production-ring-measure-select]");
  const systemSelect = form.querySelector("[data-production-ring-measure-system]");
  if (!field || !select) return;

  const isRing = product === "yuzuk";
  field.hidden = !isRing;
  select.required = isRing;
  if (systemSelect) systemSelect.required = isRing;
  if (!isRing) {
    select.replaceChildren();
    return;
  }

  const system = normalizeRingMeasureSystem(selectedSystem || systemSelect?.value);
  if (systemSelect) systemSelect.value = system;
  const bounds = ringMeasureBounds(system);
  const active = normalizeRingMeasure(selectedMeasure || select.value, system);
  select.replaceChildren(
    ...Array.from({ length: bounds.max - bounds.min + 1 }, (_, index) => {
      const measure = bounds.min + index;
      const option = document.createElement("option");
      option.value = String(measure);
      option.textContent = String(measure);
      if (measure === active) option.selected = true;
      return option;
    })
  );

  if (systemSelect && !systemSelect.dataset.measureListenerAttached) {
    systemSelect.addEventListener("change", () => {
      renderOrderRingMeasureOptions(form, "yuzuk", "", systemSelect.value);
    });
    systemSelect.dataset.measureListenerAttached = "1";
  }
}

function updateOrderChainVisibility(form, product) {
  const chain = form.querySelector("[data-production-chain]");
  if (chain) chain.hidden = product !== "kolye";
  updateOrderChainFields(form);
}

// Zincir opsiyonel: kutu işaretli değilken kalınlık/uzunluk alanları gizli ve zorunlu değil.
// Birim değişince min/max ve placeholder cm↔inç aralığına göre yeniden yazılır.
function updateOrderChainFields(form) {
  const details = form.querySelector("[data-production-chain-details]");
  const included = form.querySelector("[data-production-chain-included]");
  const unitSelect = form.querySelector("[data-production-chain-unit]");
  const lengthInput = form.querySelector("[data-production-chain-length]");
  const hint = form.querySelector("[data-production-chain-hint]");
  if (!details || !included || !unitSelect || !lengthInput) return;

  const chainVisible = form.querySelector("[data-production-chain]")?.hidden === false;
  const wants = chainVisible && included.checked;
  details.hidden = !wants;

  const isInch = unitSelect.value === "inch";
  const unit = isInch ? "inch" : "cm";
  const bounds = chainLengthBounds(unit);

  // Birim değişince girilen değer yeni birime çevrilir; aksi halde "45" inç alanında
  // geçersiz kalırdı. Sınır dışına taşarsa aralığa kırpılır.
  const previousUnit = lengthInput.dataset.chainUnit;
  if (previousUnit && previousUnit !== unit && lengthInput.value !== "") {
    const current = Number(lengthInput.value);
    if (Number.isFinite(current)) {
      const converted = isInch ? current / CM_PER_INCH : current * CM_PER_INCH;
      const rounded = isInch ? Math.round(converted * 2) / 2 : Math.round(converted);
      lengthInput.value = String(Math.min(bounds.max, Math.max(bounds.min, rounded)));
    }
  }
  lengthInput.dataset.chainUnit = unit;

  lengthInput.min = String(bounds.min);
  lengthInput.max = String(bounds.max);
  lengthInput.step = isInch ? "0.5" : "1";
  lengthInput.placeholder = `${bounds.min}-${bounds.max}`;
  lengthInput.required = wants;
  if (unitSelect) unitSelect.required = wants;

  if (hint) {
    hint.textContent = wants
      ? `Tüm zincirlerimiz forse zincirdir. Uzunluk ${bounds.min}-${bounds.max} ${isInch ? "inç" : "cm"} arasında olmalı.`
      : "Tüm zincirlerimiz forse zincirdir.";
  }
}

// ─── Tek başına zincir satışı (Sipariş > Zincir) ────────────────────────────
// Kolyeye eklenen zincirle aynı tarife (cm × kalınlık) kullanılır; fark, baz ürün
// bedelinin olmaması ve adet seçilebilmesidir.
function chainShopBodyFromForm(form) {
  const formData = new FormData(form);
  const type = ["ince", "orta", "kalin"].includes(String(formData.get("chainType") || ""))
    ? String(formData.get("chainType"))
    : "orta";
  const unit = String(formData.get("chainLengthUnit") || "cm") === "inch" ? "inch" : "cm";
  const raw = Number(formData.get("chainLengthValue"));
  const bounds = chainLengthBounds(unit);
  const valid = Number.isFinite(raw) && raw >= bounds.min && raw <= bounds.max;
  const lengthCm = valid ? (unit === "inch" ? Math.round(raw * CM_PER_INCH) : Math.round(raw)) : 0;
  const lengthValue = valid ? (unit === "inch" ? Math.round(raw * 2) / 2 : lengthCm) : 0;
  const lengthText = unit === "inch" ? `${lengthValue} inç (${lengthCm} cm)` : `${lengthCm} cm`;
  const quantity = Math.min(10, Math.max(1, Number.parseInt(formData.get("quantity"), 10) || 1));

  return {
    product: "zincir",
    productShape: "",
    metal: normalizeOrderMetal(formData.get("metal")),
    sizeKey: "",
    sizeLabel: "",
    quantity,
    chain: {
      enabled: valid,
      type,
      lengthCm,
      lengthUnit: unit,
      lengthValue,
      label: valid ? `${CHAIN_TYPE_LABELS[type]}, ${lengthText}` : "",
    },
    customerNote: "",
    contactInfo: { email: "", phone: "", name: "" },
    designRef: "",
    designSnapshot: {},
    metadata: {},
  };
}

// Birim değişince girilen uzunluğu çevirir, sınırları ve canlı tutarı tazeler.
function updateChainShopForm(form) {
  if (!form) return;
  const unitSelect = form.querySelector("[data-chain-shop-unit]");
  const lengthInput = form.querySelector("[data-chain-shop-length]");
  const hint = form.querySelector("[data-chain-shop-hint]");
  const priceEl = form.querySelector("[data-chain-shop-price]");
  const priceValue = form.querySelector("[data-chain-shop-price-value]");
  if (!unitSelect || !lengthInput) return;

  const unit = unitSelect.value === "inch" ? "inch" : "cm";
  const bounds = chainLengthBounds(unit);
  const previousUnit = lengthInput.dataset.chainUnit;
  if (previousUnit && previousUnit !== unit && lengthInput.value !== "") {
    const current = Number(lengthInput.value);
    if (Number.isFinite(current)) {
      const converted = unit === "inch" ? current / CM_PER_INCH : current * CM_PER_INCH;
      const rounded = unit === "inch" ? Math.round(converted * 2) / 2 : Math.round(converted);
      lengthInput.value = String(Math.min(bounds.max, Math.max(bounds.min, rounded)));
    }
  }
  lengthInput.dataset.chainUnit = unit;
  lengthInput.min = String(bounds.min);
  lengthInput.max = String(bounds.max);
  lengthInput.step = unit === "inch" ? "0.5" : "1";
  lengthInput.placeholder = `${bounds.min}-${bounds.max}`;

  if (hint) {
    hint.textContent = `Tüm zincirlerimiz 925 gümüş forse zincirdir. Uzunluk ${bounds.min}-${bounds.max} ${unit === "inch" ? "inç" : "cm"} arasında olmalı.`;
  }

  const body = chainShopBodyFromForm(form);
  if (priceEl && priceValue) {
    if (body.chain.enabled) {
      priceValue.textContent = formatTryPrice(computeOrderPrice(body).total);
      priceEl.hidden = false;
    } else {
      priceEl.hidden = true;
    }
  }
}

function bindChainShopControls() {
  const form = document.querySelector("[data-chain-shop-form]");
  if (!form || form.dataset.chainShopBound) return;
  form.dataset.chainShopBound = "1";

  const onChange = () => updateChainShopForm(form);
  form.addEventListener("input", onChange);
  form.addEventListener("change", onChange);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const errorBox = form.querySelector("[data-chain-shop-error]");
    const body = chainShopBodyFromForm(form);
    if (!body.chain.enabled) {
      if (errorBox) {
        errorBox.textContent = "Geçerli bir zincir uzunluğu gir.";
        errorBox.hidden = false;
      }
      return;
    }
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }
    addOrderToCart(body);
    openOrderCartDrawer();
  });

  updateChainShopForm(form);
}

function createOrderCartId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readOrderCartItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ORDER_CART_STORAGE_KEY) || "[]");
    // Tek başına zincirin tasarım görseli yoktur; diğer ürünlerde görselsiz satır bozuk sayılır.
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.body?.product === "zincir" || item?.body?.designSnapshot?.imageUrl)
      : [];
  } catch {
    return [];
  }
}

function writeOrderCartItems() {
  try {
    localStorage.setItem(ORDER_CART_STORAGE_KEY, JSON.stringify(orderCartItems));
  } catch {
    // Cart still works in-memory when storage is unavailable.
  }
}

// Fiziksel fiyat — server src/config/physical-pricing.js ile SENKRON tutulmalı (bu yalnız
// gösterim için; otorite server'da). Sabit baz + ölçü/renk ekleri.
const PHYSICAL_PRICE_CONFIG = {
  base: 650,
  sizeSurcharge: { s: 0, m: 150, l: 350, xl: 600 },
  pendantSizeSurcharge: { 15: 0, 20: 150, 25: 350, 30: 600, 35: 850, 40: 1100 },
  // Kaplama eki YALNIZ yüzükte alınır; kolyede kaplama eki yok.
  colorSurcharge: { gumus: 0, altin: 150, rose: 150 },
  colorSurchargeProducts: ["yuzuk"],
  productSurcharge: { yuzuk: 0, kolye: 0 },
  // Zincir ayrı satılır: kalınlığa göre cm başına fiyat.
  chainPricePerCm: { ince: 8, orta: 12, kalin: 18 },
};

function physicalSizeTier(sizeKey) {
  const parts = String(sizeKey || "").trim().toLowerCase().split("-");
  const tier = parts[parts.length - 1];
  return ["s", "m", "l", "xl"].includes(tier) ? tier : "m";
}

// "kolye-oval-25" → 25; kolye ölçü anahtarı değilse 0.
function physicalPendantSizeMm(sizeKey) {
  const parts = String(sizeKey || "").trim().toLowerCase().split("-");
  if (parts[0] !== "kolye") return 0;
  const mm = Number.parseInt(parts[parts.length - 1], 10);
  return PENDANT_SIZES_MM.includes(mm) ? mm : 0;
}

// Zincir fiyatı: kalınlık × uzunluk (cm). Zincir alınmadıysa 0.
function computeChainPrice(chain) {
  if (!chain?.enabled) return 0;
  const rate = PHYSICAL_PRICE_CONFIG.chainPricePerCm[String(chain.type || "").toLowerCase()];
  const cm = Number(chain.lengthCm);
  if (!rate || !Number.isFinite(cm) || cm < CHAIN_MIN_CM || cm > CHAIN_MAX_CM) return 0;
  return Math.round(rate * cm);
}

function computeOrderPrice({ product, sizeKey, metal, quantity = 1, chain } = {}) {
  const productKey = String(product || "").toLowerCase();
  const qty0 = Math.max(1, Number.parseInt(quantity, 10) || 1);
  // Tek başına zincirde baz/ölçü/kaplama eki yok — yalnız zincir bedeli.
  if (productKey === "zincir") {
    const chainOnly = computeChainPrice(chain);
    return { unitPrice: chainOnly, quantity: qty0, total: chainOnly * qty0 };
  }
  const tier = physicalSizeTier(sizeKey);
  // Kolyede ölçü mm; ölçüsüz (eski) kayıtlar S/M/L/XL tablosuna düşer.
  const pendantMm = productKey === "kolye" ? physicalPendantSizeMm(sizeKey) : 0;
  const unit =
    PHYSICAL_PRICE_CONFIG.base +
    (pendantMm
      ? PHYSICAL_PRICE_CONFIG.pendantSizeSurcharge[pendantMm] ?? 0
      : PHYSICAL_PRICE_CONFIG.sizeSurcharge[tier] ?? 0) +
    (PHYSICAL_PRICE_CONFIG.colorSurchargeProducts.includes(productKey)
      ? PHYSICAL_PRICE_CONFIG.colorSurcharge[String(metal || "").toLowerCase()] ?? 0
      : 0) +
    (PHYSICAL_PRICE_CONFIG.productSurcharge[productKey] ?? 0) +
    (productKey === "kolye" ? computeChainPrice(chain) : 0);
  const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
  return { unitPrice: unit, quantity: qty, total: unit * qty };
}

function formatTryPrice(value) {
  return `${new Intl.NumberFormat("tr-TR").format(Math.round(value))}₺`;
}

// Sipariş dialog'unda seçili opsiyonlara göre tahmini fiyatı canlı günceller.
function updateProductionPriceDisplay(form) {
  if (!form) return;
  const priceEl = form.querySelector("[data-production-price]");
  const valueEl = form.querySelector("[data-production-price-value]");
  if (!priceEl || !valueEl) return;
  const body = orderBodyFromProductionForm(form);
  // Fiyat ancak zorunlu seçimler tamamsa gösterilir (yüzükte ölçü, kolyede mm seçimi gerekli;
  // zincir istendiyse geçerli bir uzunluk girilmiş olmalı).
  const chainReady = !body.chain?.enabled || Boolean(body.chain?.lengthCm);
  const ready = body.product && body.metal && body.sizeKey && chainReady;
  if (!ready) {
    priceEl.hidden = true;
    return;
  }
  valueEl.textContent = formatTryPrice(computeOrderPrice(body).total);
  priceEl.hidden = false;
}

function orderBodyFromProductionForm(form, snapshot = {}) {
  const resolvedSnapshot = resolveProductionFormSnapshot(form, snapshot);
  const formData = new FormData(form);
  const product = normalizeOrderProduct(formData.get("product") || resolvedSnapshot.product);
  const productShape = normalizeOrderShape(formData.get("productShape") || resolvedSnapshot.productShape, product);
  const metal = normalizeOrderMetal(formData.get("metal") || resolvedSnapshot.metal);
  const isKolye = product === "kolye";
  const ringSize = product === "yuzuk" ? ringSizeOption(productShape, formData.get("ringSize")) : null;
  const pendantSize = isKolye ? pendantSizeOption(productShape, formData.get("pendantSize")) : null;
  const ringMeasureSystem = product === "yuzuk" ? normalizeRingMeasureSystem(formData.get("ringMeasureSystem")) : "";
  const ringMeasure = product === "yuzuk" ? normalizeRingMeasure(formData.get("ringMeasure"), ringMeasureSystem) : "";
  const chain = chainSelectionFromForm(formData, isKolye);
  const metadata = isKolye
    ? {
        chain,
        // Eski alanlar geriye dönük uyum için; zincir alınmadıysa boş kalır.
        chainType: chain.enabled ? chain.type : "",
        chainTypeLabel: chain.enabled ? CHAIN_TYPE_LABELS[chain.type] || chain.type : "",
        chainLength: chain.enabled && chain.lengthCm ? String(chain.lengthCm) : "",
        ...(pendantSize
          ? {
              pendantSizeMm: Number.parseInt(pendantSize.key.split("-").pop(), 10),
              pendantSizeLabel: `${pendantSize.label} · ${pendantSize.dimensions}`,
            }
          : {}),
      }
    : ringSize
      ? {
          ringSizeKey: ringSize.key,
          ringSizeLabel: ringSize.label,
          ringSizeDimensions: ringSize.dimensions,
          ringMeasure,
          ringMeasureSystem,
          ringMeasureLabel: ringMeasureLabelText(ringMeasureSystem, ringMeasure),
        }
      : {};
  return {
    product,
    productShape,
    metal,
    sizeKey: (isKolye ? pendantSize?.key : ringSize?.key) || "",
    sizeLabel: isKolye
      ? pendantSize
        ? `${pendantSize.label} · ${pendantSize.dimensions}`
        : ""
      : ringSize
        ? `${ringSize.label} · ${ringSize.dimensions}`
        : "",
    quantity: 1,
    chain,
    customerNote: String(formData.get("customerNote") || "").trim(),
    contactInfo: {
      email: formData.get("contactEmail") || "",
      phone: formData.get("contactPhone") || "",
      name: "",
    },
    designRef: resolvedSnapshot.designRef || "",
    designSnapshot: resolvedSnapshot.designSnapshot || {},
    metadata,
  };
}

function resolveProductionFormSnapshot(form, snapshot = {}) {
  if (snapshot?.designSnapshot?.imageUrl) return snapshot;
  try {
    const parsed = JSON.parse(form?.dataset?.snapshot || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function orderCartItemFromBody(body) {
  // Tek başına zincir: tasarım/şekil/ölçü yok, başlık ve satır zincir tarifinden kurulur.
  if (body.product === "zincir") {
    const metalLabel = { altin: "Altın", gumus: "Gümüş", rose: "Rose" }[body.metal] || body.metal || "";
    const price = computeOrderPrice(body);
    return {
      id: createOrderCartId(),
      body,
      title: body.chain?.label || "Forse zincir",
      imageUrl: "",
      meta: [metalLabel, price.quantity > 1 ? `${price.quantity} adet` : ""].filter(Boolean).join(" · "),
      price,
      priceLabel: formatTryPrice(price.total),
    };
  }
  const productLabel = DESIGN_PRODUCT_OPTIONS[body.product]?.label || body.product;
  const shapeLabel = DESIGN_SHAPE_OPTIONS[body.productShape]?.label || body.productShape;
  const metalLabels = { altin: "Altın", gumus: "Gümüş", rose: "Rose" };
  const metalLabel = metalLabels[body.metal] || body.metal || "Metal seçilmedi";
  const price = computeOrderPrice(body);
  const chainLabel = body.product !== "kolye"
    ? ""
    : body.chain?.enabled && body.chain?.label
      ? ` · ${body.chain.label}`
      : " · Zincirsiz";
  const sizeLabel = body.sizeLabel || body.metadata?.ringSizeLabel || body.metadata?.pendantSizeLabel
    ? ` · ${body.sizeLabel || body.metadata.ringSizeLabel || body.metadata.pendantSizeLabel}`
    : "";
  const measureLabel = body.product === "yuzuk" && body.metadata?.ringMeasureLabel
    ? ` · ${body.metadata.ringMeasureLabel}`
    : "";
  return {
    id: createOrderCartId(),
    body,
    title: body.designSnapshot?.title || "Tasarım",
    imageUrl: body.designSnapshot?.imageUrl || "",
    meta: `${productLabel} · ${shapeLabel} · ${metalLabel}${sizeLabel}${measureLabel}${chainLabel}`,
    price,
    priceLabel: formatTryPrice(price.total),
  };
}

function replaceOrderCartItem(cartItemId, body) {
  const nextItem = orderCartItemFromBody(body);
  nextItem.id = cartItemId;
  orderCartItems = orderCartItems.map((item) => (item.id === cartItemId ? nextItem : item));
  writeOrderCartItems();
  renderOrderCart();
}

function renderOrderCart() {
  const count = document.querySelector("[data-cart-count]");
  const list = document.querySelector("[data-cart-list]");
  const submitButton = document.querySelector("[data-cart-submit]");
  const status = document.querySelector("[data-cart-status]");
  const profileWarning = document.querySelector("[data-cart-profile-warning]");
  const summary = document.querySelector("[data-cart-summary]");
  const total = document.querySelector("[data-cart-total]");
  const profileReady = hasRequiredOrderProfile();
  const cartTotal = orderCartItems.reduce((sum, item) => {
    const price = item.price || computeOrderPrice(item.body || {});
    return sum + (Number(price.total) || 0);
  }, 0);
  if (count) count.textContent = String(orderCartItems.length);
  if (submitButton) submitButton.disabled = orderCartItems.length === 0;
  if (profileWarning) profileWarning.hidden = profileReady || orderCartItems.length === 0;
  if (summary) summary.hidden = orderCartItems.length === 0;
  if (total) total.textContent = formatTryPrice(cartTotal);
  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  if (!list) return;
  list.innerHTML = "";
  if (!orderCartItems.length) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Sepette henüz ürün yok.";
    list.append(empty);
    return;
  }
  orderCartItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "cart-item";

    // Tek başına zincirin tasarım görseli yoktur; yerine ikon konur.
    const isChainOnly = item.body?.product === "zincir";
    const image = isChainOnly
      ? Object.assign(document.createElement("div"), { className: "cart-item-icon", textContent: "⛓" })
      : Object.assign(document.createElement("img"), { alt: item.title || "Sepet ürünü", src: item.imageUrl });

    const body = document.createElement("div");
    body.className = "cart-item-body";

    const title = document.createElement("div");
    title.className = "cart-item-title";
    title.textContent = item.title || "Tasarım";

    const meta = document.createElement("div");
    meta.className = "cart-item-meta";
    meta.textContent = item.meta || "";

    const price = document.createElement("div");
    price.className = "cart-item-price";
    price.textContent = item.priceLabel || formatTryPrice(computeOrderPrice(item.body || {}).total);

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const remove = document.createElement("button");
    remove.className = "cart-item-remove";
    remove.type = "button";
    remove.dataset.cartRemove = item.id;
    remove.textContent = "Kaldır";

    // Zincir tasarım dialog'undan düzenlenemez (tasarımı yok); kaldırıp yeniden eklenir.
    if (isChainOnly) {
      actions.append(remove);
    } else {
      const edit = document.createElement("button");
      edit.className = "cart-item-edit";
      edit.type = "button";
      edit.dataset.cartEdit = item.id;
      edit.textContent = "Düzenle";
      actions.append(edit, remove);
    }
    body.append(title, meta, price, actions);
    card.append(image, body);
    list.append(card);
  });
}

function openOrderCartDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (!drawer) return;
  renderOrderCart();
  if (orderCartCloseTimer) {
    window.clearTimeout(orderCartCloseTimer);
    orderCartCloseTimer = null;
  }
  drawer.classList.remove("is-closing");
  drawer.hidden = false;
  document.body.classList.add("is-production-dialog-open");
}

function closeOrderCartDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (drawer && !drawer.hidden) {
    drawer.classList.add("is-closing");
    orderCartCloseTimer = window.setTimeout(() => {
      drawer.hidden = true;
      drawer.classList.remove("is-closing");
      orderCartCloseTimer = null;
      const productionDialog = document.querySelector("[data-production-dialog]");
      if (!productionDialog?.open) document.body.classList.remove("is-production-dialog-open");
    }, 210);
  }
}

function addOrderToCart(body) {
  orderCartItems = [orderCartItemFromBody(body), ...orderCartItems];
  writeOrderCartItems();
  renderOrderCart();
}

function orderSnapshotFromCartItem(item = {}) {
  const body = item.body || {};
  return {
    designRef: body.designRef || "",
    product: normalizeOrderProduct(body.product),
    productShape: normalizeOrderShape(body.productShape, normalizeOrderProduct(body.product)),
    metal: normalizeOrderMetal(body.metal),
    designSnapshot: body.designSnapshot || {},
  };
}

function orderSnapshotFromFinishDesign(design = {}) {
  const imageUrl = safePersistedImageUrl(design.imageUrl || "", "imageUrl");
  if (!imageUrl) return null;
  const product = normalizeOrderProduct(design.productValue || design.product);
  const shape = normalizeOrderShape(design.productShapeValue || design.shapeValue || design.productShape, product);
  const stageLabel = "2. aşama ürün görseli";
  return {
    designRef: String(design.archiveDesignId || design.id || "").trim(),
    product,
    productShape: shape,
    metal: normalizeOrderMetal(design.metalValue || design.metal),
    designSnapshot: {
      imageUrl,
      sketchImageUrl: imageUrl,
      sourceImageUrl: safePersistedImageUrl(design.sourceImageUrl || "", "sourceImageUrl"),
      title: design.title || stageLabel,
      stage: "finish",
      designMode: design.surfaceValue || design.designModeValue || "engrave",
      designModeLabel: design.surfaceLabel || design.designModeLabel || "",
      productLabel: design.productLabel || DESIGN_PRODUCT_OPTIONS[product]?.label || "",
      shapeLabel: design.productShapeLabel || design.shapeLabel || DESIGN_SHAPE_OPTIONS[shape]?.label || "",
      metalLabel: design.metalLabel || "",
      storagePath: design.storagePath || "",
      storageBucket: design.storageBucket || "",
    },
  };
}

function openOrderDialog(snapshot, options = {}) {
  const dialog = document.querySelector("[data-production-dialog]");
  const form = document.querySelector("[data-production-form]");
  if (!dialog || !form || typeof dialog.showModal !== "function") {
    showStudioToast("Tarayıcın bu özelliği desteklemiyor.", "error");
    return;
  }
  if (!snapshot || !snapshot.designSnapshot?.imageUrl) {
    showStudioToast("Önce bir tasarım seç.", "error");
    return;
  }

  const product = normalizeOrderProduct(snapshot.product);
  const shape = normalizeOrderShape(snapshot.productShape, product);

  form.reset();
  applyProfileDefaultsToProductionForm(form);
  form.dataset.snapshot = JSON.stringify(snapshot);
  form.dataset.editCartItemId = options.cartItemId || "";

  const previewImg = form.querySelector("[data-production-preview-img]");
  if (previewImg) previewImg.src = snapshot.designSnapshot.imageUrl;
  const previewTitle = form.querySelector("[data-production-preview-title]");
  if (previewTitle) previewTitle.textContent = snapshot.designSnapshot.title || "Tasarım";
  const previewSub = form.querySelector("[data-production-preview-subtitle]");
  if (previewSub) {
    previewSub.textContent = [
      snapshot.designSnapshot.productLabel || DESIGN_PRODUCT_OPTIONS[product]?.label || "",
      snapshot.designSnapshot.shapeLabel || DESIGN_SHAPE_OPTIONS[shape]?.label || "",
      snapshot.designSnapshot.metalLabel || PRODUCTION_METAL_LABELS[snapshot.metal] || "",
    ].filter(Boolean).join(" · ");
  }

  renderOrderRingSizeOptions(form, product, shape, options.body?.sizeKey || options.body?.metadata?.ringSizeKey || "");
  renderOrderPendantSizeOptions(form, product, shape, options.body?.sizeKey || "");
  renderOrderRingMeasureOptions(form, product, options.body?.metadata?.ringMeasure || "", options.body?.metadata?.ringMeasureSystem || "");
  bindRingMeasureControl(form);
  updateOrderChainVisibility(form, product);

  if (form.elements.customerNote) form.elements.customerNote.value = options.body?.customerNote || "";
  // Sepetten düzenlemede zincir seçimi geri yüklenir (kullanıcının girdiği birimle birlikte).
  const savedChain = options.body?.chain || options.body?.metadata?.chain;
  if (form.elements.chainIncluded) form.elements.chainIncluded.checked = Boolean(savedChain?.enabled);
  if (savedChain?.enabled) {
    if (form.elements.chainType && savedChain.type) form.elements.chainType.value = savedChain.type;
    if (form.elements.chainLengthUnit && savedChain.lengthUnit) form.elements.chainLengthUnit.value = savedChain.lengthUnit;
    if (form.elements.chainLengthValue && savedChain.lengthValue) form.elements.chainLengthValue.value = savedChain.lengthValue;
  }
  updateOrderChainFields(form);

  const submitButton = form.querySelector("[data-production-submit]");
  if (submitButton) submitButton.textContent = options.cartItemId ? "Sepeti güncelle" : "Sepete ekle";

  const errorBox = form.querySelector("[data-production-error]");
  if (errorBox) {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  if (!form.dataset.priceListenerAttached) {
    // Zincir kutusu/birimi değişince alanların görünürlüğü ve min-max sınırları da tazelenir.
    const onChange = () => {
      updateOrderChainFields(form);
      updateProductionPriceDisplay(form);
    };
    form.addEventListener("input", onChange);
    form.addEventListener("change", onChange);
    form.dataset.priceListenerAttached = "1";
  }
  updateProductionPriceDisplay(form);

  document.body.classList.add("is-production-dialog-open");
  dialog.showModal();
}

function closeProductionDialog() {
  const dialog = document.querySelector("[data-production-dialog]");
  const form = document.querySelector("[data-production-form]");
  if (form) form.dataset.editCartItemId = "";
  if (dialog?.open) dialog.close();
  document.body.classList.remove("is-production-dialog-open");
}

async function submitProductionRequestFromForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = form.querySelector("[data-production-error]");
  const submitButton = form.querySelector("[data-production-submit]");
  errorBox.hidden = true;
  errorBox.textContent = "";

  let snapshot;
  try {
    snapshot = JSON.parse(form.dataset.snapshot || "{}");
  } catch {
    snapshot = {};
  }

  const body = orderBodyFromProductionForm(form, snapshot);
  if (!body.designSnapshot?.imageUrl) {
    errorBox.textContent = "Sepete eklemek için geçerli bir tasarım seçmelisin.";
    errorBox.hidden = false;
    return;
  }

  submitButton.disabled = true;
  const editCartItemId = form.dataset.editCartItemId || "";
  submitButton.textContent = editCartItemId ? "Güncelleniyor…" : "Ekleniyor…";
  try {
    if (editCartItemId) {
      replaceOrderCartItem(editCartItemId, body);
    } else {
      addOrderToCart(body);
    }
    closeProductionDialog();
    if (editCartItemId) {
      openOrderCartDrawer();
    } else if (await showSiteConfirm()) {
      openOrderCartDrawer();
    }
  } catch (error) {
    errorBox.textContent = error?.message || "Sepete eklenemedi.";
    errorBox.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = form.dataset.editCartItemId ? "Sepeti güncelle" : "Sepete ekle";
  }
}

async function submitOrderCart() {
  const submitButton = document.querySelector("[data-cart-submit]");
  const status = document.querySelector("[data-cart-status]");
  if (!orderCartItems.length) {
    if (status) {
      status.textContent = "Sepette ürün yok.";
      status.hidden = false;
    }
    return;
  }

  const profile = readRequiredOrderProfile();
  if (profile.error) {
    renderOrderCart();
    if (status) {
      status.textContent = profile.error;
      status.hidden = false;
    }
    return;
  }

  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sipariş oluşturuluyor…";
  }

  try {
    const requestBody = {
      items: orderCartItems.map((item) => ({
        ...item.body,
        contactInfo: profile.contactInfo,
      })),
    };
    const { payload, response } = await studioApi.submitProductionRequest(requestBody);
    if (!response.ok) {
      const details = [payload?.error, payload?.detail, payload?.code]
        .map((part) => String(part || "").trim())
        .filter(Boolean);
      throw new Error(details.join("\n") || "Sipariş oluşturulamadı.");
    }
    // Online ödeme yok: sepet ürünleri "Ödeme bekliyor" siparişlere dönüştü, sepet boşalır.
    // Ödeme alınınca sipariş admin panelinden "Ödendi" olarak işaretlenir.
    orderCartItems = [];
    writeOrderCartItems();
    renderOrderCart();
    closeOrderCartDrawer();
    showStudioToast("Siparişin alındı. Ödeme için seninle iletişime geçeceğiz.", "success");
    productionRequestsCache = null;
    loadAndRenderProductionRequests({ force: true });
  } catch (error) {
    if (status) {
      status.textContent = error?.message || "Sipariş oluşturulamadı.";
      status.hidden = false;
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = orderCartItems.length === 0;
      submitButton.textContent = "Siparişi oluştur";
    }
  }
}

function renderProductionRequests(requests) {
  const list = document.querySelector("[data-production-list]");
  const empty = document.querySelector("[data-production-empty]");
  if (!list || !empty) return;

  if (!requests || !requests.length) {
    list.hidden = true;
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  list.hidden = false;
  list.innerHTML = "";
  requests.forEach((request) => {
    const card = document.createElement("article");
    card.className = "production-card";
    const snapshot = request.designSnapshot || {};
    const metalLabel = PRODUCTION_METAL_LABELS[request.metal] || request.metal || "—";
    const shapeLabel = DESIGN_SHAPE_OPTIONS[request.productShape]?.label || request.productShape || "";
    const productLabel = DESIGN_PRODUCT_OPTIONS[request.product]?.label || snapshot.productLabel || "";
    const meta = request.metadata || {};
    const isChainOnly = request.product === "zincir";
    const chainText = isChainOnly
      ? meta.chain?.label || ""
      : request.product !== "kolye"
        ? ""
        : meta.chain?.enabled || meta.chainType
          ? meta.chain?.label || `${meta.chainTypeLabel || CHAIN_TYPE_LABELS[meta.chainType] || meta.chainType} ${meta.chainLength || ""}cm`.trim()
          : "Zincirsiz";
    const sizeText = request.sizeLabel || meta.ringSizeLabel || meta.pendantSizeLabel || "";
    const measureText = request.product === "yuzuk" ? meta.ringMeasureLabel || "" : "";
    const statusLabel = PRODUCTION_STATUS_LABELS[request.status] || request.status;
    const created = request.createdAt ? new Date(request.createdAt).toLocaleString("tr-TR") : "";
    const quantityText = request.quantity > 1 ? `${request.quantity} adet` : "";
    const metaLine = [
      isChainOnly ? "Zincir" : productLabel,
      shapeLabel,
      metalLabel,
      sizeText,
      measureText,
      chainText,
      quantityText,
    ].filter(Boolean).join(" · ");
    // Zincirin tasarım görseli yok; kart görsel yerine ikonla çizilir.
    const mediaHtml = isChainOnly
      ? `<div class="production-card-icon" aria-hidden="true">⛓</div>`
      : `<img alt="" src="${snapshot.imageUrl || ""}" loading="lazy" />`;
    card.innerHTML = `
      ${mediaHtml}
      <div class="production-card-body">
        <strong>${(isChainOnly ? meta.chain?.label || "Forse zincir" : snapshot.title || "Tasarım").replace(/</g, "&lt;")}</strong>
        <span class="production-card-meta">${metaLine.replace(/</g, "&lt;")}</span>
        <span class="production-card-meta">${created}</span>
      </div>
      <span class="production-card-status" data-status="${request.status}">${statusLabel}</span>
    `;
    list.appendChild(card);
  });
}

function orderDesignsFromArchive() {
  const seen = new Set();
  const sources = [
    ...orderFinishDesignsFromProjects(),
    ...(Array.isArray(readSavedDesigns()) ? readSavedDesigns() : []),
  ];

  return sources
    .map(enrichSavedDesignDisplayMetadata)
    .filter((design) => {
      if (!design || isSavedDesignLoading(design)) return false;
      const imageUrl = safePersistedImageUrl(design.imageUrl || "", "imageUrl");
      if (!imageUrl) return false;
      if (!isOrderableFinishDesign(design)) return false;
      if (seen.has(imageUrl)) return false;
      seen.add(imageUrl);
      return true;
    });
}

function orderFinishDesignsFromProjects(projects = readProjects()) {
  return (Array.isArray(projects) ? projects : []).flatMap((project) => {
    const state = project?.state && typeof project.state === "object" ? project.state : {};
    const finishResults = Array.isArray(state.finishResults) ? state.finishResults : [];
    return finishResults.map((result, index) => {
      const imageUrl = safePersistedImageUrl(result?.finishImageUrl || result?.imageUrl || "", "finishImageUrl");
      if (!imageUrl) return null;
      return {
        ...designProfileFieldsFromSource(result),
        ...storageFieldsFromSource(result),
        archiveDesignId: String(result.id || "").trim(),
        generatedAt: result.generatedAt || "",
        id: `order-finish-${project.id || "project"}-${result.id || index}`,
        imageUrl,
        metalLabel: result.metalLabel || "",
        metalValue: result.metalValue || "",
        projectId: project.id || "",
        projectTitle: project.title || "",
        sourceImageUrl: result.sourceFormUrl || result.sketchUrl || "",
        sourceStage: "finish",
        sourceTitle: result.moldTitle || result.title || "",
        stage: "Ürün Görseli",
        surfaceLabel: result.surfaceLabel || result.designModeLabel || "",
        surfaceValue: result.surfaceValue || result.designModeValue || "",
        title: result.title || `${result.metalLabel || "Ürün"} ${result.moldTitle || "Görsel"} ${String(index + 1).padStart(2, "0")}`,
      };
    }).filter(Boolean);
  });
}

// Bir proje silinmeden önce, içinde üretilmiş sipariş edilebilir ürün görsellerini
// Tasarımlarım arşivine taşı; böylece proje silinse de "Sipariş Ver" listesinden düşmezler.
function preserveDeletedProjectOrderDesigns(deletedProjects = []) {
  const list = (Array.isArray(deletedProjects) ? deletedProjects : [deletedProjects]).filter(Boolean);
  if (!list.length) return;

  const harvested = orderFinishDesignsFromProjects(list).filter(isOrderableFinishDesign);
  if (!harvested.length) return;

  const existing = readSavedDesigns();
  const seen = new Set(
    existing.map((design) => safePersistedImageUrl(design?.imageUrl || "", "imageUrl")).filter(Boolean)
  );

  const additions = harvested.filter((design) => {
    const imageUrl = safePersistedImageUrl(design?.imageUrl || "", "imageUrl");
    if (!imageUrl || seen.has(imageUrl)) return false;
    seen.add(imageUrl);
    return true;
  });
  if (!additions.length) return;

  writeSavedDesigns([...additions, ...existing].slice(0, SAVED_DESIGN_LIMIT));
}

function isOrderableFinishDesign(design = {}) {
  const sourceStage = String(design.sourceStage || "").trim().toLowerCase();
  const stageLabel = String(design.stage || "");
  return (
    sourceStage === "finish" ||
    /ürün görseli|urun gorseli|görsel üretimi|gorsel uretimi/i.test(stageLabel)
  );
}

function normalizeOrderMetal(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(PRODUCTION_METAL_LABELS, normalized) ? normalized : "";
}

function renderOrderDesignGallery() {
  const grid = document.querySelector("[data-order-design-grid]");
  const empty = document.querySelector("[data-order-design-empty]");
  if (!grid) return;

  const designs = orderDesignsFromArchive();
  if (empty) empty.hidden = designs.length > 0;
  grid.hidden = designs.length === 0;

  grid.replaceChildren(
    ...designs.map((design) => {
      const snapshot = orderSnapshotFromFinishDesign(design);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "order-design-card";
      const img = document.createElement("img");
      img.alt = design.title || snapshot?.designSnapshot?.title || "Sipariş tasarımı";
      img.loading = "lazy";
      setManagedImageSrc(img, snapshot?.designSnapshot?.imageUrl || "");
      const stage = document.createElement("span");
      stage.className = "order-design-card-stage";
      stage.textContent = "2. aşama";
      const title = document.createElement("span");
      title.className = "order-design-card-title";
      title.textContent = design.title || snapshot?.designSnapshot?.title || "Sipariş tasarımı";
      const sub = document.createElement("span");
      sub.className = "order-design-card-sub";
      sub.textContent = "Ürün görselinden sipariş ver";
      card.append(img, stage, title, sub);
      card.addEventListener("click", () => {
        if (snapshot) openOrderDialog(snapshot);
      });
      return card;
    })
  );
}

// Ödemesi onaylanan (confirmed ve sonrası) üretim talepleri sepetten otomatik düşer.
// Ödeme bekleyen (pending) ya da iptal olanlar sepette KALIR — kullanıcı geri dönüp
// tekrar ödeyebilsin veya elle silsin.
const PAID_PRODUCTION_STATES = new Set(["confirmed", "in_production", "shipped", "completed"]);
function reconcileCartWithPaidRequests(requests) {
  if (!Array.isArray(requests) || !orderCartItems.length) return;
  const paidIds = new Set(
    requests
      .filter((request) => PAID_PRODUCTION_STATES.has(request?.status))
      .map((request) => request.id)
  );
  if (!paidIds.size) return;
  const remaining = orderCartItems.filter(
    (item) => !(item.productionRequestId && paidIds.has(item.productionRequestId))
  );
  if (remaining.length !== orderCartItems.length) {
    orderCartItems = remaining;
    writeOrderCartItems();
    renderOrderCart();
  }
}

async function loadAndRenderProductionRequests(options = {}) {
  if (productionRequestsCache && !options.force) {
    reconcileCartWithPaidRequests(productionRequestsCache);
    renderProductionRequests(productionRequestsCache);
    return;
  }
  try {
    const { payload, response } = await studioApi.listProductionRequests();
    if (!response.ok) {
      renderProductionRequests([]);
      return;
    }
    productionRequestsCache = Array.isArray(payload?.requests) ? payload.requests : [];
    reconcileCartWithPaidRequests(productionRequestsCache);
    renderProductionRequests(productionRequestsCache);
  } catch (error) {
    console.warn("[production-requests] list failed", error);
    renderProductionRequests([]);
  }
}

function initProductionRequestUi() {
  bindOrderSectionControls();
  const button = document.querySelector("[data-production-request]");
  const dialog = document.querySelector("[data-production-dialog]");
  const form = document.querySelector("[data-production-form]");
  const cancelButton = document.querySelector("[data-production-cancel]");
  const cartOpenButton = document.querySelector("[data-cart-open]");
  const cartDrawer = document.querySelector("[data-cart-drawer]");
  const cartSubmitButton = document.querySelector("[data-cart-submit]");
  const cartProfileLink = document.querySelector("[data-cart-profile-link]");

  if (button) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (button.disabled) return;
      openOrderDialog(readSelectedMockupSnapshot());
    });
  }
  if (cancelButton) {
    cancelButton.addEventListener("click", (event) => {
      event.preventDefault();
      closeProductionDialog();
    });
  }
  if (form) {
    form.addEventListener("submit", submitProductionRequestFromForm);
  }
  if (dialog) {
    dialog.addEventListener("close", () => {
      document.body.classList.remove("is-production-dialog-open");
      const errorBox = dialog.querySelector("[data-production-error]");
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = "";
      }
    });
  }
  if (cartOpenButton) {
    cartOpenButton.addEventListener("click", openOrderCartDrawer);
  }
  document.querySelectorAll("[data-cart-close]").forEach((closeButton) => {
    closeButton.addEventListener("click", closeOrderCartDrawer);
  });
  if (cartDrawer) {
    cartDrawer.addEventListener("click", (event) => {
      const editButton = event.target?.closest?.("[data-cart-edit]");
      if (editButton) {
        const item = orderCartItems.find((cartItem) => cartItem.id === editButton.dataset.cartEdit);
        if (!item) return;
        closeOrderCartDrawer();
        openOrderDialog(orderSnapshotFromCartItem(item), { body: item.body, cartItemId: item.id });
        return;
      }
      const removeButton = event.target?.closest?.("[data-cart-remove]");
      if (!removeButton) return;
      orderCartItems = orderCartItems.filter((item) => item.id !== removeButton.dataset.cartRemove);
      writeOrderCartItems();
      renderOrderCart();
    });
  }
  if (cartSubmitButton) {
    cartSubmitButton.addEventListener("click", submitOrderCart);
  }
  if (cartProfileLink) {
    cartProfileLink.addEventListener("click", () => {
      closeOrderCartDrawer();
      tabController.switchTo("profil");
    });
  }
  renderOrderCart();

  document.querySelectorAll('[data-tab-trigger="uretim"], .studio-tab[data-tab="uretim"]').forEach((el) => {
    el.addEventListener("click", () => {
      switchOrderSection("create");
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductionRequestUi);
} else {
  initProductionRequestUi();
}
