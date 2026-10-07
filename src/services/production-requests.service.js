import {
  insertProductionRequest,
  listAllProductionRequests,
  listProductionRequestsByUser,
  readProductionRequest,
  updateProductionRequest,
} from "../repositories/production-requests.repo.js";
import {
  assertAllContentAllowed,
  isContentModerationError,
} from "../lib/content-moderation.js";
import {
  CHAIN_MAX_CM,
  CHAIN_MAX_INCH,
  CHAIN_MIN_CM,
  CHAIN_MIN_INCH,
  CHAIN_TYPES,
  PENDANT_SIZES_MM,
  chainInchToCm,
  computePhysicalPrice,
} from "../config/physical-pricing.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("production-requests");

const ALLOWED_METALS = ["altin", "gumus", "rose"];
// "zincir" = tek başına satılan zincir; tasarım görseli ve ölçü anahtarı olmayan tek üründür.
const ALLOWED_PRODUCTS = ["yuzuk", "kolye", "zincir"];
const CHAIN_CAPABLE_PRODUCTS = ["kolye", "zincir"];
const ALLOWED_SHAPES = ["dikdortgen", "kare", "oval", "yuvarlak"];
const MAX_CUSTOMER_NOTE = 2000;
const MAX_QUANTITY = 50;
const MIN_RING_MEASURE = 7; // TR
const MAX_RING_MEASURE = 35; // TR
const MIN_RING_MEASURE_US = 1;
const MAX_RING_MEASURE_US = 15;

function trimString(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function normalizeQuantity(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, parsed));
}

function normalizeEnum(value, allowed, fallback) {
  const normalized = String(value || "").trim().toLowerCase();
  return allowed.includes(normalized) ? normalized : fallback;
}

function normalizeContactInfo(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return {
    email: trimString(value.email, 200),
    phone: trimString(value.phone, 60),
    name: trimString(value.name, 160),
  };
}

function normalizeRingMeasureSystem(value) {
  return String(value || "").trim().toLowerCase() === "us" ? "us" : "tr";
}

function normalizeRingMeasure(value, system) {
  const isUs = normalizeRingMeasureSystem(system) === "us";
  const min = isUs ? MIN_RING_MEASURE_US : MIN_RING_MEASURE;
  const max = isUs ? MAX_RING_MEASURE_US : MAX_RING_MEASURE;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return "";
  if (parsed < min || parsed > max) return "";
  return parsed;
}

// Kolye ucu ölçüsü: kullanıcı mm seçer. Yuvarlak/kare → çap/kenar; oval/dikdörtgen → YÜKSEKLİK,
// genişlik 4:5 oranından türer (genişlik = yükseklik × 4/5). Anahtar: "kolye-<şekil>-<mm>".
const PENDANT_ASPECT_SHAPES = new Set(["oval", "dikdortgen"]);

function pendantSizeMm(sizeKey) {
  const parts = String(sizeKey || "").trim().toLowerCase().split("-");
  if (parts[0] !== "kolye") return 0;
  const mm = Number.parseInt(parts[parts.length - 1], 10);
  return PENDANT_SIZES_MM.includes(mm) ? mm : 0;
}

// Anahtarı şekle göre doğrular; uyumsuzsa "" döner (istemciye güvenilmez).
export function normalizePendantSizeKey(sizeKey, shape) {
  const mm = pendantSizeMm(sizeKey);
  if (!mm || !shape) return "";
  return String(sizeKey).trim().toLowerCase() === `kolye-${shape}-${mm}` ? `kolye-${shape}-${mm}` : "";
}

function pendantSizeLabelText(sizeKey, shape) {
  const mm = pendantSizeMm(sizeKey);
  if (!mm) return "";
  if (PENDANT_ASPECT_SHAPES.has(shape)) return `${mm} mm · ${(mm * 4) / 5} x ${mm} mm (G x Y)`;
  if (shape === "yuvarlak") return `${mm} mm · ${mm} mm çap`;
  return `${mm} mm · ${mm} x ${mm} mm`;
}

// Zincir AYRI SATILAN opsiyondur: müşteri istemeyebilir. Tür daima forse; kalınlık ince/orta/kalın.
// Uzunluk elle girilir — cm veya inç; kanonik değer DAİMA cm'dir (üretim cm ile çalışır).
const CHAIN_TYPE_LABELS = { ince: "İnce forse zincir", orta: "Orta forse zincir", kalin: "Kalın forse zincir" };

export function normalizeChain(rawChain, product) {
  const empty = { enabled: false, type: "", lengthCm: 0, lengthUnit: "", lengthValue: 0, label: "", error: "" };
  if (!CHAIN_CAPABLE_PRODUCTS.includes(product)) return empty;
  const chain = rawChain && typeof rawChain === "object" && !Array.isArray(rawChain) ? rawChain : {};
  // Ürünün kendisi zincirse seçim opsiyonel değildir; kolyede kutu işaretlenmemişse zincirsizdir.
  if (product === "zincir") {
    if (!chain || typeof chain !== "object") return { ...empty, enabled: true, error: "Zincir bilgisi eksik." };
  } else if (!chain.enabled) {
    return empty;
  }

  const type = normalizeEnum(chain.type, CHAIN_TYPES, "");
  if (!type) return { ...empty, enabled: true, error: "Zincir kalınlığı geçersiz." };

  const unit = String(chain.lengthUnit || "cm").trim().toLowerCase() === "inch" ? "inch" : "cm";
  const value = Number(chain.lengthValue);
  if (!Number.isFinite(value)) {
    return { ...empty, enabled: true, type, error: "Zincir uzunluğu gerekli." };
  }

  const min = unit === "inch" ? CHAIN_MIN_INCH : CHAIN_MIN_CM;
  const max = unit === "inch" ? CHAIN_MAX_INCH : CHAIN_MAX_CM;
  if (value < min || value > max) {
    return {
      ...empty,
      enabled: true,
      type,
      error: `Zincir uzunluğu ${min}-${max} ${unit === "inch" ? "inç" : "cm"} arasında olmalı.`,
    };
  }

  const lengthCm = unit === "inch" ? chainInchToCm(value) : Math.round(value);
  const lengthValue = unit === "inch" ? Math.round(value * 2) / 2 : lengthCm;
  const lengthText = unit === "inch" ? `${lengthValue} inç (${lengthCm} cm)` : `${lengthCm} cm`;
  return {
    enabled: true,
    type,
    lengthCm,
    lengthUnit: unit,
    lengthValue,
    label: `${CHAIN_TYPE_LABELS[type]}, ${lengthText}`,
    error: "",
  };
}

function ringMeasureLabelText(system, measure) {
  return normalizeRingMeasureSystem(system) === "us"
    ? `US ${measure}`
    : `TR ${measure} ölçü`;
}

function normalizeSnapshot(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const imageUrl = trimString(value.imageUrl || value.mockupImageUrl || value.url, 1200);
  return {
    imageUrl,
    sourceImageUrl: trimString(value.sourceImageUrl || "", 1200),
    finishImageUrl: trimString(value.finishImageUrl || "", 1200),
    sketchImageUrl: trimString(value.sketchImageUrl || "", 1200),
    title: trimString(value.title || "", 200),
    stage: trimString(value.stage || "", 80),
    designMode: trimString(value.designMode || value.designModeValue || "", 40),
    designModeLabel: trimString(value.designModeLabel || "", 80),
    productLabel: trimString(value.productLabel || "", 80),
    shapeLabel: trimString(value.shapeLabel || "", 80),
    moldKey: trimString(value.moldKey || "", 120),
    storagePath: trimString(value.storagePath || "", 400),
    storageBucket: trimString(value.storageBucket || "", 120),
  };
}

function validateInput(input) {
  const errors = [];
  const isChainOnly = input.product === "zincir";
  if (!input.metal) errors.push("Metal seçimi gerekli.");
  // Tek başına zincirde tasarım görseli yoktur — kişiye özel üretim değil, stok üründür.
  if (!isChainOnly && !input.designSnapshot.imageUrl) errors.push("Üretime gönderilecek tasarım görseli bulunamadı.");
  if (!input.product) errors.push("Ürün tipi bilgisi eksik.");
  if (input.product === "yuzuk" && !input.sizeKey) errors.push("Yüzük boyutu gerekli.");
  if (input.product === "kolye" && !input.sizeKey) errors.push("Kolye ucu ölçüsü gerekli.");
  if (isChainOnly && !input.metadata?.chain?.enabled) errors.push("Zincir kalınlığı ve uzunluğu gerekli.");
  if (input.product === "yuzuk" && !normalizeRingMeasure(input.metadata?.ringMeasure, input.metadata?.ringMeasureSystem)) errors.push("Yüzük ölçüsü gerekli.");
  if (input.chainError) errors.push(input.chainError);
  if (!input.contactInfo.name) errors.push("Ad soyad gerekli.");
  if (!input.contactInfo.phone) errors.push("Telefon gerekli.");
  if (!input.contactInfo.email) errors.push("E-posta gerekli.");
  return errors;
}

function buildProductionRequestInput({ user, body }) {
  const safeBody = body && typeof body === "object" ? body : {};
  const product = normalizeEnum(safeBody.product, ALLOWED_PRODUCTS, "");
  const productShape = normalizeEnum(safeBody.productShape, ALLOWED_SHAPES, "");
  const metal = normalizeEnum(safeBody.metal, ALLOWED_METALS, "");
  const designRef = trimString(safeBody.designRef, 180);
  const designSnapshot = normalizeSnapshot(safeBody.designSnapshot);
  // Kolyede ölçü anahtarı/etiketi server'da yeniden türetilir; yüzükte istemci değeri korunur.
  // Tek başına zincirde ölçü anahtarı yoktur (uzunluk zincir metadata'sında tutulur).
  const rawSizeKey = trimString(safeBody.sizeKey, 120);
  const sizeKey = product === "zincir" ? "" : product === "kolye" ? normalizePendantSizeKey(rawSizeKey, productShape) : rawSizeKey;
  const sizeLabel = product === "zincir"
    ? ""
    : product === "kolye"
      ? pendantSizeLabelText(sizeKey, productShape)
      : trimString(safeBody.sizeLabel, 200);
  const customerNote = trimString(safeBody.customerNote, MAX_CUSTOMER_NOTE);
  const quantity = normalizeQuantity(safeBody.quantity);
  const contactInfo = normalizeContactInfo(safeBody.contactInfo);
  const metadata = safeBody.metadata && typeof safeBody.metadata === "object" && !Array.isArray(safeBody.metadata)
    ? { ...safeBody.metadata }
    : {};
  const ringMeasureSystem = normalizeRingMeasureSystem(metadata.ringMeasureSystem || safeBody.ringMeasureSystem);
  const ringMeasure = normalizeRingMeasure(metadata.ringMeasure || safeBody.ringMeasure, ringMeasureSystem);
  if (product === "yuzuk" && ringMeasure) {
    metadata.ringMeasure = ringMeasure;
    metadata.ringMeasureSystem = ringMeasureSystem;
    metadata.ringMeasureLabel = ringMeasureLabelText(ringMeasureSystem, ringMeasure);
  }

  // Kolye ucu ölçüsü: atölyenin mm ve türetilmiş genişliği doğrudan görmesi için metadata'ya yazılır.
  const pendantMm = product === "kolye" ? pendantSizeMm(sizeKey) : 0;
  if (pendantMm) {
    metadata.pendantSizeMm = pendantMm;
    metadata.pendantWidthMm = PENDANT_ASPECT_SHAPES.has(productShape) ? (pendantMm * 4) / 5 : pendantMm;
    metadata.pendantHeightMm = pendantMm;
    metadata.pendantSizeLabel = sizeLabel;
  }

  // Zincir: istemciden gelen tür/uzunluk server'da doğrulanır, metadata yeniden yazılır.
  const chain = normalizeChain(safeBody.chain ?? metadata.chain, product);
  metadata.chain = {
    enabled: chain.enabled && !chain.error,
    type: chain.type,
    typeLabel: chain.type ? CHAIN_TYPE_LABELS[chain.type] : "",
    lengthCm: chain.lengthCm,
    lengthUnit: chain.lengthUnit,
    lengthValue: chain.lengthValue,
    label: chain.label,
  };
  // Eski alanlar (chainType/chainLength) artık zincir alındıysa doldurulur.
  metadata.chainType = metadata.chain.enabled ? chain.type : "";
  metadata.chainTypeLabel = metadata.chain.typeLabel;
  metadata.chainLength = metadata.chain.enabled ? String(chain.lengthCm) : "";

  // Fiyat SERVER'da hesaplanır (istemciye güvenilmez) ve siparişe yazılır.
  metadata.pricing = computePhysicalPrice({ product, sizeKey, metal, quantity, chain: metadata.chain });

  const input = {
    // Yalnız doğrulama için; repo yalnızca bilinen sütunları yazdığından kayda geçmez.
    chainError: chain.error,
    userId: user.id,
    designId: null,
    designRef,
    designSnapshot,
    product,
    productShape,
    metal,
    sizeKey,
    sizeLabel,
    quantity,
    customerNote,
    contactInfo,
    metadata,
  };

  return { errors: validateInput(input), input };
}

function assertProductionInputAllowed(input) {
  assertAllContentAllowed([
    { value: input.customerNote, field: "customerNote" },
    { value: input.contactInfo.name, field: "contactInfo.name" },
  ]);
}

async function insertProductionInput(input) {
  return insertProductionRequest(input);
}

export async function createProductionRequest({ user, body }) {
  if (!user?.id) {
    return { status: 401, payload: { error: "Oturum doğrulanamadı." } };
  }

  const { errors, input } = buildProductionRequestInput({ user, body });
  if (errors.length) {
    return { status: 400, payload: { error: errors[0], errors } };
  }

  try {
    assertProductionInputAllowed(input);
  } catch (error) {
    if (isContentModerationError(error)) {
      return { status: error.statusCode || 422, payload: { code: error.code, error: error.message } };
    }
    throw error;
  }

  try {
    const created = await insertProductionInput(input);
    return { status: 201, payload: { request: created } };
  } catch (error) {
    log.error("create failed", { error, op: "create" });
    return {
      status: 500,
      payload: { error: "Üretim talebi kaydedilemedi.", detail: error?.message || "" },
    };
  }
}

export async function createProductionCheckout({ user, body }) {
  if (!user?.id) {
    return { status: 401, payload: { error: "Oturum doğrulanamadı." } };
  }

  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) {
    return { status: 400, payload: { error: "Sepette ürün yok." } };
  }

  const normalized = items.map((item) => buildProductionRequestInput({ user, body: item }));
  const invalid = normalized.find((entry) => entry.errors.length);
  if (invalid) {
    return { status: 400, payload: { error: invalid.errors[0], errors: invalid.errors } };
  }

  try {
    normalized.forEach(({ input }) => assertProductionInputAllowed(input));
  } catch (error) {
    if (isContentModerationError(error)) {
      return { status: error.statusCode || 422, payload: { code: error.code, error: error.message } };
    }
    throw error;
  }

  // Online ödeme sağlayıcısı bağlı değil: siparişler "pending" (ödeme bekliyor) olarak
  // kaydedilir, ödeme alındığında admin panelinden "Ödendi işaretle" ile onaylanır.
  const requests = [];
  try {
    for (const { input } of normalized) {
      requests.push(await insertProductionInput(input));
    }
  } catch (error) {
    log.error("checkout request create failed", { error, op: "checkout_create_requests" });
    return {
      status: 500,
      payload: { error: "Üretim talepleri kaydedilemedi.", detail: error?.message || "" },
    };
  }

  return { status: 201, payload: { requests } };
}

export async function listProductionRequests({ user, limit = 50 }) {
  if (!user?.id) {
    return { status: 401, payload: { error: "Oturum doğrulanamadı." } };
  }

  try {
    const requests = await listProductionRequestsByUser(user.id, { limit });
    return { status: 200, payload: { requests } };
  } catch (error) {
    log.error("list failed", { error, op: "list" });
    return {
      status: 500,
      payload: { error: "Üretim talepleri okunamadı.", detail: error?.message || "" },
    };
  }
}

const ADMIN_ALLOWED_STATUSES = ["pending", "confirmed", "in_production", "shipped", "completed", "cancelled"];

export async function adminListAllProductionRequests({ filters = {} } = {}) {
  const normalized = {
    limit: filters.limit,
    status: ADMIN_ALLOWED_STATUSES.includes(filters.status) ? filters.status : "",
    userId: typeof filters.userId === "string" ? filters.userId.trim() : "",
  };
  try {
    const requests = await listAllProductionRequests(normalized);
    return { status: 200, payload: { requests } };
  } catch (error) {
    log.error("admin list failed", { error, op: "admin_list" });
    return {
      status: 500,
      payload: { error: "Üretim talepleri okunamadı.", detail: error?.message || "" },
    };
  }
}

export async function adminUpdateProductionRequest({ id, patch }) {
  const safeId = String(id || "").trim();
  if (!safeId) {
    return { status: 400, payload: { error: "Talep id eksik." } };
  }
  const updates = {};
  if (patch?.status) {
    if (!ADMIN_ALLOWED_STATUSES.includes(patch.status)) {
      return { status: 400, payload: { error: "Geçersiz durum." } };
    }
    updates.status = patch.status;
  }
  if (typeof patch?.internalNote === "string") {
    updates.internalNote = patch.internalNote.slice(0, 4000);
  }

  try {
    const existing = await readProductionRequest({ id: safeId });
    if (!existing) {
      return { status: 404, payload: { error: "Talep bulunamadı." } };
    }
    const updated = await updateProductionRequest(safeId, updates);
    return { status: 200, payload: { request: updated } };
  } catch (error) {
    log.error("admin update failed", { error, op: "admin_update" });
    return {
      status: 500,
      payload: { error: "Talep güncellenemedi.", detail: error?.message || "" },
    };
  }
}
