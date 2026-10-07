// studio/utils/pure-helpers.js
// Saf yardımcı fonksiyonlar — DOM'a veya global duruma dokunmaz, sadece
// girdi alıp çıktı verirler. studio.js'ten güvenle ayrıştırıldı.
// Klasik <script> olarak studio.js'ten ÖNCE yüklenir; tanımlar global kalır.

function normalizeCreditNumber(value, fallback = 0) {
  const numberValue = Number.parseInt(value, 10);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function roundedRectPath(context, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
}

function parseHexColor(value, fallback) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(value || "").trim());
  if (!match) return fallback;
  const intValue = Number.parseInt(match[1], 16);
  return {
    blue: intValue & 255,
    green: (intValue >> 8) & 255,
    red: (intValue >> 16) & 255,
  };
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function validIsoDate(value) {
  const source = typeof value === "string" ? value : "";
  if (!source) return "";
  const date = new Date(source);
  return Number.isNaN(date.getTime()) ? "" : source;
}

function normalizeGenerationCountValue(value) {
  return Number.parseInt(value, 10) === 4 ? 4 : 1;
}

function normalizeMockupCountValue(value) {
  return normalizeGenerationCountValue(value);
}

function normalizeFinishMetalValue(value) {
  const key = String(value || "").trim().toLowerCase();
  return key === "altin" || key === "rose" ? key : "gumus";
}

// Aşağıdaki normalize fonksiyonları studio.js'teki üst seviye sabitlere
// (PACKAGE_PLANS, MOCKUP_RESOLUTION_OPTIONS, PROJECT_METAL_OPTIONS,
// RING_MEASURE_MIN/MAX, RING_SIZE_OPTIONS_BY_SHAPE) çağrı anında erişir.
// Bu sabitler klasik script global kapsamında paylaşıldığı için sorun olmaz.
function normalizePackageKey(value) {
  if (!value) return "";
  const key = String(value).trim().toLowerCase();
  return PACKAGE_PLANS[key] ? key : "";
}

function normalizeProjectMetalValue(value) {
  const key = String(value || "").trim().toLowerCase();
  return PROJECT_METAL_OPTIONS[key] ? key : "";
}

function normalizeMockupResolutionValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return MOCKUP_RESOLUTION_OPTIONS[normalized] ? normalized : "1k";
}

function normalizeRingMeasureSystem(value) {
  return String(value || "").trim().toLowerCase() === "us" ? "us" : "tr";
}

function ringMeasureBounds(system) {
  return normalizeRingMeasureSystem(system) === "us"
    ? { min: RING_MEASURE_US_MIN, max: RING_MEASURE_US_MAX, fallback: RING_MEASURE_US_MIN }
    : { min: RING_MEASURE_MIN, max: RING_MEASURE_MAX, fallback: 14 };
}

function ringMeasureLabelText(system, measure) {
  return normalizeRingMeasureSystem(system) === "us"
    ? `US ${measure}`
    : `TR ${measure} ölçü`;
}

function normalizeRingMeasure(value, system) {
  const bounds = ringMeasureBounds(system);
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return bounds.fallback;
  return Math.min(bounds.max, Math.max(bounds.min, parsed));
}

function normalizeRingSize(shape, value) {
  const options = RING_SIZE_OPTIONS_BY_SHAPE[shape] || [];
  const normalized = String(value || "").toLowerCase();
  return options.some((option) => option.key === normalized)
    ? normalized
    : options[0]?.key || "";
}

function sanitizeStorageScopeUserId(userId) {
  return String(userId || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 160);
}

function normalizeRestoredProjectStage(value) {
  const stage = String(value || "").trim().toLowerCase();
  if (stage === "form") return "finish";
  if (["sketch", "finish", "mockup", "manken"].includes(stage)) return stage;
  return "";
}

function normalizeSketchLabel(label, index) {
  const fallback = `Tasarım ${String(index + 1).padStart(2, "0")}`;
  const trimmedLabel = typeof label === "string" ? label.trim() : "";
  if (!trimmedLabel) return fallback;

  const genericMatch = trimmedLabel.match(/^(test\s+)?(taslak|tasarım|tasarim)\s*\d+$/i);
  if (!genericMatch) return trimmedLabel;

  return `${genericMatch[1] ? "Test Tasarım" : "Tasarım"} ${String(index + 1).padStart(2, "0")}`;
}

function normalizePendingIndex(value, fallback = 0) {
  const numberValue = Number.parseInt(value, 10);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : fallback;
}

function normalizeSourceThumbnailKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDesignOptionKey(options, value, fallback) {
  const key = String(value || "").trim().toLowerCase();
  return options[key] ? key : fallback;
}

function normalizeMockupScene(scene = {}) {
  const value = String(scene.value || scene.sceneValue || scene.label || scene.sceneLabel || "").trim().toLowerCase();
  if (value.includes("manken") || value.includes("elde") || value.includes("boyun")) {
    return { label: "Manken", value: "manken" };
  }
  return { label: "Mockup", value: "mockup" };
}

function normalizeOrderProduct(value) {
  return String(value || "").toLowerCase() === "kolye" ? "kolye" : "yuzuk";
}

// PROJECT_SHAPES_BY_PRODUCT studio.js'te üst seviye sabit; çağrı anında çözülür.
function normalizeOrderShape(value, product) {
  const allowed = PROJECT_SHAPES_BY_PRODUCT[product] || PROJECT_SHAPES_BY_PRODUCT.yuzuk;
  const normalized = String(value || "").toLowerCase();
  return allowed.includes(normalized) ? normalized : allowed[0];
}

// Kredi cüzdanı sanitizasyonu: normalizeCreditNumber/normalizePackageKey/validIsoDate
// (bu dosyada) + DEFAULT_PACKAGE_KEY/CREDIT_HISTORY_LIMIT (studio.js sabitleri) kullanır.
function sanitizeCreditTransaction(transaction) {
  if (!transaction || typeof transaction !== "object") return null;
  const amount = normalizeCreditNumber(transaction.amount);
  const type = String(transaction.type || "spend").trim();
  const label = String(transaction.label || "Kredi işlemi").trim();
  if (!amount && type !== "note") return null;

  return {
    amount,
    balanceAfter: transaction.balanceAfter === null ? null : normalizeCreditNumber(transaction.balanceAfter),
    createdAt: validIsoDate(transaction.createdAt) || new Date().toISOString(),
    id: String(transaction.id || `ff-credit-${Date.now()}`).trim(),
    jobId: String(transaction.jobId || "").trim(),
    label,
    stage: String(transaction.stage || "studio").trim(),
    type,
  };
}

function sanitizeCreditWallet(wallet) {
  if (!wallet || typeof wallet !== "object") return null;
  if (!("planKey" in wallet) && !("balance" in wallet) && !("transactions" in wallet) && !("totalGranted" in wallet)) {
    return null;
  }

  const planKey = normalizePackageKey(wallet.planKey) || DEFAULT_PACKAGE_KEY;
  const isUnlimited = wallet.isUnlimited === true;
  const totalGranted = isUnlimited ? null : Math.max(0, normalizeCreditNumber(wallet.totalGranted));
  const balance = isUnlimited
    ? null
    : Math.max(0, normalizeCreditNumber(wallet.balance, totalGranted));
  const spent = isUnlimited ? 0 : Math.max(0, normalizeCreditNumber(wallet.spent, totalGranted - balance));
  const transactions = Array.isArray(wallet.transactions)
    ? wallet.transactions.map(sanitizeCreditTransaction).filter(Boolean).slice(0, CREDIT_HISTORY_LIMIT)
    : [];
  // Top-up (ek kredi) kırılımı: balance zaten toplam (abonelik + geçerli top-up).
  const topupBalance = isUnlimited ? 0 : Math.max(0, normalizeCreditNumber(wallet.topupBalance));
  const subscriptionBalance = isUnlimited
    ? null
    : Math.max(0, normalizeCreditNumber(wallet.subscriptionBalance, balance - topupBalance));

  return {
    balance,
    currency: "FFK",
    isUnlimited,
    planKey,
    spent,
    subscriptionBalance,
    topupBalance,
    topupNextExpiry: validIsoDate(wallet.topupNextExpiry) || null,
    totalGranted,
    transactions,
    updatedAt: validIsoDate(wallet.updatedAt) || new Date().toISOString(),
  };
}

// compactCloudValue ve currentUserId studio.js'te tanımlı; çağrı anında global
// kapsamdan erişilir.
function normalizeProjectDeletionMarker(item = {}) {
  const id = String(item?.id || "").trim();
  if (!id) return null;

  const deletedAt = validIsoDate(item.deletedAt || item.updatedAt || item.createdAt) || new Date().toISOString();
  return compactCloudValue({
    id,
    deletedAt,
    isDeleted: true,
    ownerUserId: currentUserId || String(item.ownerUserId || item.userId || "").trim(),
  });
}
