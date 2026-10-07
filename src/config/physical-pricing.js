// Fiziksel ürün fiyatlandırması — "sabit baz + opsiyon ekleri" modeli.
// Tek malzeme: gümüş (925). "altın"/"rose" gerçek metal değil, KAPLAMA/renk varyantı,
// bu yüzden sadece küçük bir kaplama eki ekler (altın oynaklığı yok → sabit tablo doğru).
//
// Tahmini değerler (2026-06) — gerçek maliyet (gümüş gram + işçilik + kaplama) netleşince
// güncellenir. SERVER-OTORİTER: sipariş fiyatı DAİMA buradan hesaplanır; istemciye güvenilmez.
//
// Tablo (gümüş baz): S 650 · M 800 · L 1.000 · XL 1.250 ; altın/rose = +150 (kaplama).
export const PHYSICAL_PRICING = {
  currency: "TRY",
  base: 650, // S boy · gümüş (baz fiyat)
  // Ölçü eki (S/M/L/XL): baz fiyatın üstüne eklenir.
  sizeSurcharge: { s: 0, m: 150, l: 350, xl: 600 },
  // Kolye ucu ölçü eki (mm): yüzük S/M/L/XL progresyonunun devamı.
  // Gümüş: 15mm 650 · 20mm 800 · 25mm 1.000 · 30mm 1.250 · 35mm 1.500 · 40mm 1.750.
  pendantSizeSurcharge: { 15: 0, 20: 150, 25: 350, 30: 600, 35: 850, 40: 1100 },
  // Renk/kaplama eki: gümüş baz, altın/rose kaplama +150. YALNIZ yüzükte —
  // kolyede kaplama eki alınmaz (2026-07 kararı), bkz. colorSurchargeProducts.
  colorSurcharge: { gumus: 0, altin: 150, rose: 150 },
  colorSurchargeProducts: ["yuzuk"],
  // Ürün eki: şimdilik yüzük=kolye; ileride ayrışırsa buradan.
  productSurcharge: { yuzuk: 0, kolye: 0 },
  // Zincir AYRI SATILAN ek üründür (kolyede opsiyonel). Tür: forse; kalınlığa göre cm başına
  // fiyat — uzunluk serbest girildiği için gümüş gramıyla doğru orantılı.
  // 45cm: ince 360 · orta 540 · kalın 810 ₺.
  chainPricePerCm: { ince: 8, orta: 12, kalin: 18 },
};

const SIZE_TIERS = ["s", "m", "l", "xl"];

// Kolye ucu için seçilebilen ölçüler (mm). Yuvarlak/kare → çap/kenar, oval/dikdörtgen → YÜKSEKLİK.
export const PENDANT_SIZES_MM = [15, 20, 25, 30, 35, 40];

// Zincir: tümü forse. Uzunluk kullanıcı tarafından elle girilir (cm veya inç).
export const CHAIN_TYPES = ["ince", "orta", "kalin"];
export const CHAIN_MIN_CM = 30;
export const CHAIN_MAX_CM = 80;
export const CM_PER_INCH = 2.54;
// cm sınırlarının inç karşılığı — tam inç adımlarına yuvarlanır (30cm≈11,8" → 12", 80cm≈31,5" → 31").
export const CHAIN_MIN_INCH = Math.ceil(CHAIN_MIN_CM / CM_PER_INCH);
export const CHAIN_MAX_INCH = Math.floor(CHAIN_MAX_CM / CM_PER_INCH);

// Girilen inç değerini kanonik cm'e çevirir (üretim ölçüsü daima cm'dir).
export function chainInchToCm(inch) {
  return Math.round(Number(inch) * CM_PER_INCH);
}

// Zincir fiyatı: kalınlık × uzunluk. Zincir yoksa 0.
export function computeChainPrice({ enabled, type, lengthCm } = {}) {
  if (!enabled) return 0;
  const rate = PHYSICAL_PRICING.chainPricePerCm[String(type || "").toLowerCase()];
  if (!rate) return 0;
  const cm = Number(lengthCm);
  if (!Number.isFinite(cm) || cm < CHAIN_MIN_CM || cm > CHAIN_MAX_CM) return 0;
  return Math.round(rate * cm);
}

// "oval-xl" / "kare-s" / "yuvarlak-m" → "xl"/"s"/"m". Bilinmeyende "m" (orta) varsayılır.
export function sizeTierFromKey(sizeKey) {
  const parts = String(sizeKey || "").trim().toLowerCase().split("-");
  const tier = parts[parts.length - 1];
  return SIZE_TIERS.includes(tier) ? tier : "m";
}

// "kolye-oval-25" → 25. Kolye ölçü anahtarı değilse null.
export function pendantSizeMmFromKey(sizeKey) {
  const parts = String(sizeKey || "").trim().toLowerCase().split("-");
  if (parts[0] !== "kolye") return null;
  const mm = Number.parseInt(parts[parts.length - 1], 10);
  return PENDANT_SIZES_MM.includes(mm) ? mm : null;
}

// Sipariş opsiyonlarından birim ve toplam fiyatı (₺) hesaplar.
export function computePhysicalPrice({ product, sizeKey, metal, quantity = 1, chain } = {}) {
  const productKey = String(product || "").toLowerCase();
  const qtyOf = (value) => Math.max(1, Number.parseInt(value, 10) || 1);

  // Tek başına satılan zincir: kolye ucu yok, dolayısıyla baz/ölçü/kaplama ekleri de yok.
  if (productKey === "zincir") {
    const chainOnly = computeChainPrice(chain);
    const chainQty = qtyOf(quantity);
    return {
      currency: PHYSICAL_PRICING.currency,
      unitPrice: chainOnly,
      quantity: chainQty,
      total: chainOnly * chainQty,
      breakdown: { base: 0, size: 0, color: 0, product: 0, chain: chainOnly, tier: "zincir" },
    };
  }

  const tier = sizeTierFromKey(sizeKey);
  // Kolyede ölçü mm cinsinden seçilir; ölçüsüz eski siparişler S/M/L/XL tablosuna düşer.
  const pendantMm = productKey === "kolye" ? pendantSizeMmFromKey(sizeKey) : null;
  const base = PHYSICAL_PRICING.base;
  const size = pendantMm
    ? PHYSICAL_PRICING.pendantSizeSurcharge[pendantMm] ?? 0
    : PHYSICAL_PRICING.sizeSurcharge[tier] ?? 0;
  const color = PHYSICAL_PRICING.colorSurchargeProducts.includes(productKey)
    ? PHYSICAL_PRICING.colorSurcharge[String(metal || "").toLowerCase()] ?? 0
    : 0;
  const prod = PHYSICAL_PRICING.productSurcharge[productKey] ?? 0;
  // Zincir ayrı üründür ama her kolyeye bir tane gittiği için birim fiyata girer.
  const chainPrice = productKey === "kolye" ? computeChainPrice(chain) : 0;
  const unitPrice = base + size + color + prod + chainPrice;
  const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
  return {
    currency: PHYSICAL_PRICING.currency,
    unitPrice,
    quantity: qty,
    total: unitPrice * qty,
    breakdown: {
      base,
      size,
      color,
      product: prod,
      chain: chainPrice,
      tier: pendantMm ? `${pendantMm}mm` : tier,
    },
  };
}
