// studio/utils/credit-helpers.js
// Kredi HESAPLAMA/OKUMA yardımcıları (yan etkisiz; durum yazmaz, DOM'a dokunmaz).
// Klasik <script> olarak studio.js'ten ÖNCE yüklenir; tanımlar global kalır.
//
// Çağrı anında studio.js global'lerine erişir: PACKAGE_PLANS, DEFAULT_PACKAGE_KEY,
// studioStore, activeCreditWallet, resolveSelectedPackage(); pure-helpers.js'ten
// normalizePackageKey/normalizeCreditNumber/sanitizeCreditWallet.
// Durum YAZAN fonksiyonlar (writeCreditWallet, spendCredits, renderCreditWallet)
// bilerek studio.js'te bırakıldı.

function planCreditAmount(planKey = resolveSelectedPackage()) {
  const normalizedPlanKey = normalizePackageKey(planKey) || DEFAULT_PACKAGE_KEY;
  const amount = PACKAGE_PLANS[normalizedPlanKey]?.creditAmount;
  return Number.isFinite(amount) ? amount : null;
}

function createCreditTransaction({ amount, balanceAfter, jobId = "", label, stage, type }) {
  return {
    amount: normalizeCreditNumber(amount),
    balanceAfter: balanceAfter === null ? null : normalizeCreditNumber(balanceAfter),
    createdAt: new Date().toISOString(),
    id: `ff-credit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    jobId: String(jobId || "").trim(),
    label: String(label || "Kredi işlemi").trim(),
    stage: String(stage || "studio").trim(),
    type: String(type || "spend").trim(),
  };
}

function createPackageCreditWallet(planKey = resolveSelectedPackage()) {
  const normalizedPlanKey = normalizePackageKey(planKey) || DEFAULT_PACKAGE_KEY;
  const amount = planCreditAmount(normalizedPlanKey);
  const now = new Date().toISOString();
  const isUnlimited = amount === null;
  return {
    balance: isUnlimited ? null : amount,
    currency: "FFK",
    isUnlimited,
    planKey: normalizedPlanKey,
    spent: 0,
    totalGranted: isUnlimited ? null : amount,
    transactions: isUnlimited
      ? []
      : [
          createCreditTransaction({
            amount,
            balanceAfter: amount,
            label: `${PACKAGE_PLANS[normalizedPlanKey]?.name || "Paket"} kredisi yüklendi`,
            stage: "package",
            type: "grant",
          }),
        ],
    updatedAt: now,
  };
}

function readCreditWallet() {
  return sanitizeCreditWallet(studioStore.readCreditWallet());
}

function resolveCreditWallet(planKey = resolveSelectedPackage()) {
  if (activeCreditWallet) return activeCreditWallet;

  const normalizedPlanKey = normalizePackageKey(planKey) || DEFAULT_PACKAGE_KEY;
  const storedWallet = readCreditWallet();
  if (!storedWallet || storedWallet.planKey !== normalizedPlanKey) {
    return createPackageCreditWallet(normalizedPlanKey);
  }
  return storedWallet;
}

function availableCreditAmount(wallet = resolveCreditWallet()) {
  return wallet?.isUnlimited ? Infinity : Math.max(0, normalizeCreditNumber(wallet?.balance));
}

function canSpendCredits(cost, wallet = resolveCreditWallet()) {
  return wallet?.isUnlimited || availableCreditAmount(wallet) >= normalizeCreditNumber(cost);
}
