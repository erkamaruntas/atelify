// Server-otoriter plan haritası. İstemcideki PACKAGE_PLANS (studio.js/script.js) yalnızca
// gösterim içindir; kredi yükleme/yenileme kararları DAİMA buradan verilir — webhook'lara
// gelen plan/tutar bilgisine güvenilmez.
//
// Go/Pro/Max = aylık abonelik (billing: "monthly"); her başarılı tahsilatta cüzdan
// creditAmount'a resetlenir. Free = tek seferlik (billing: "once"), abonelik değil.
export const SUBSCRIPTION_PLANS = {
  free: { key: "free", creditAmount: 10, billing: "once", priceTry: 0 },
  go: { key: "go", creditAmount: 15, billing: "monthly", priceTry: 375 },
  pro: { key: "pro", creditAmount: 45, billing: "monthly", priceTry: 1000 },
  max: { key: "max", creditAmount: 250, billing: "monthly", priceTry: 5000 },
};

export function getPlan(key) {
  const normalized = String(key || "").trim().toLowerCase();
  return SUBSCRIPTION_PLANS[normalized] || null;
}

export function isRecurringPlan(key) {
  const plan = getPlan(key);
  return Boolean(plan) && plan.billing === "monthly";
}
