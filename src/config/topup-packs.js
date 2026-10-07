// Server-otoriter TOP-UP (ek kredi) paket haritası. İstemcideki gösterim (studio.js)
// yalnızca vitrin içindir; ödeme tutarı DAİMA buradan alınır — istemciden gelen fiyata
// güvenilmez.
//
// Kural (2026-07-02): top-up ₺/kredi HİÇBİR abonelik planından ucuz olamaz (Go 25₺ taban).
// Band 25→30₺. Üstü çizili "liste" = 38₺ (optik; gerçek fiyatın üstünde). 90 gün geçerli.
// Yalnızca aktif aboneler satın alabilir.

export const TOPUP_LIST_PRICE_TRY = 38; // optik: üstü çizili liste ₺/kredi
export const TOPUP_VALID_DAYS = 90;

export const TOPUP_PACKS = {
  "10": { key: "10", credits: 10, priceTry: 300 }, // 30₺/kr
  "25": { key: "25", credits: 25, priceTry: 725 }, // 29₺/kr
  "50": { key: "50", credits: 50, priceTry: 1400 }, // 28₺/kr
  "100": { key: "100", credits: 100, priceTry: 2650 }, // 26,5₺/kr
  "250": { key: "250", credits: 250, priceTry: 6250 }, // 25₺/kr
};

export const TOPUP_PACK_ORDER = ["10", "25", "50", "100", "250"];

export function getTopupPack(key) {
  const normalized = String(key || "").trim();
  return TOPUP_PACKS[normalized] || null;
}
