import { describe, expect, it } from "vitest";

import {
  CHAIN_MAX_INCH,
  CHAIN_MIN_INCH,
  chainInchToCm,
  computeChainPrice,
  computePhysicalPrice,
} from "../src/config/physical-pricing.js";
import { normalizeChain, normalizePendantSizeKey } from "../src/services/production-requests.service.js";

const pendant = (extra = {}) => ({ product: "kolye", sizeKey: "kolye-oval-25", metal: "gumus", ...extra });

describe("kolye ucu ölçüsü", () => {
  it("mm kademesine göre fiyatlanır", () => {
    const price = (mm) => computePhysicalPrice(pendant({ sizeKey: `kolye-oval-${mm}` })).unitPrice;
    expect([15, 20, 25, 30, 35, 40].map(price)).toEqual([650, 800, 1000, 1250, 1500, 1750]);
  });

  it("ölçüsüz eski kolye siparişleri eski orta kademeden fiyatlanır", () => {
    expect(computePhysicalPrice(pendant({ sizeKey: "" })).unitPrice).toBe(800);
  });

  it("kolyede kaplama eki alınmaz, yüzükte alınır", () => {
    expect(computePhysicalPrice(pendant({ metal: "altin" })).unitPrice).toBe(1000);
    expect(computePhysicalPrice({ product: "yuzuk", sizeKey: "oval-l", metal: "altin" }).unitPrice).toBe(1150);
  });

  it("anahtar şekille uyuşmazsa reddedilir", () => {
    expect(normalizePendantSizeKey("kolye-oval-25", "oval")).toBe("kolye-oval-25");
    expect(normalizePendantSizeKey("kolye-oval-25", "kare")).toBe("");
    expect(normalizePendantSizeKey("kolye-oval-22", "oval")).toBe("");
  });
});

describe("zincir", () => {
  it("kalınlık × uzunluk üzerinden fiyatlanır", () => {
    expect(computeChainPrice({ enabled: true, type: "ince", lengthCm: 45 })).toBe(360);
    expect(computeChainPrice({ enabled: true, type: "orta", lengthCm: 45 })).toBe(540);
    expect(computeChainPrice({ enabled: true, type: "kalin", lengthCm: 45 })).toBe(810);
  });

  it("alınmadığında veya sınır dışında ücret eklenmez", () => {
    expect(computeChainPrice({ enabled: false, type: "orta", lengthCm: 45 })).toBe(0);
    expect(computeChainPrice({ enabled: true, type: "orta", lengthCm: 29 })).toBe(0);
    expect(computeChainPrice({ enabled: true, type: "orta", lengthCm: 81 })).toBe(0);
  });

  it("kolye fiyatına birim başına eklenir", () => {
    const chain = { enabled: true, type: "orta", lengthCm: 45 };
    expect(computePhysicalPrice(pendant({ chain })).unitPrice).toBe(1540);
    expect(computePhysicalPrice(pendant({ chain, quantity: 2 })).total).toBe(3080);
  });

  it("inç girişi kanonik cm'e çevrilir", () => {
    expect(chainInchToCm(CHAIN_MIN_INCH)).toBe(30);
    expect(chainInchToCm(CHAIN_MAX_INCH)).toBe(79);
    expect(normalizeChain({ enabled: true, type: "orta", lengthUnit: "inch", lengthValue: 18 }, "kolye")).toMatchObject({
      lengthCm: 46,
      lengthUnit: "inch",
      lengthValue: 18,
      label: "Orta forse zincir, 18 inç (46 cm)",
    });
  });

  it("sınır dışı uzunluk ve geçersiz kalınlık hata döner", () => {
    expect(normalizeChain({ enabled: true, type: "orta", lengthUnit: "cm", lengthValue: 120 }, "kolye").error).toMatch(/30-80 cm/);
    expect(normalizeChain({ enabled: true, type: "orta", lengthUnit: "inch", lengthValue: 40 }, "kolye").error).toMatch(/12-31 inç/);
    expect(normalizeChain({ enabled: true, type: "altin-kaplama", lengthValue: 45 }, "kolye").error).toBeTruthy();
  });

  it("zincir istenmediğinde ve yüzükte devre dışıdır", () => {
    expect(normalizeChain({ enabled: false }, "kolye").enabled).toBe(false);
    expect(normalizeChain({ enabled: true, type: "orta", lengthValue: 45 }, "yuzuk").enabled).toBe(false);
  });
});

describe("tek başına satılan zincir", () => {
  const chainOnly = (chain, extra = {}) => computePhysicalPrice({ product: "zincir", metal: "gumus", chain, ...extra });

  it("baz ürün bedeli eklenmez, yalnız zincir tutarı alınır", () => {
    const price = chainOnly({ enabled: true, type: "orta", lengthCm: 45 });
    expect(price.unitPrice).toBe(540);
    expect(price.breakdown).toMatchObject({ base: 0, size: 0, color: 0, chain: 540 });
  });

  it("adet birim fiyatla çarpılır", () => {
    expect(chainOnly({ enabled: true, type: "kalin", lengthCm: 60 }, { quantity: 3 }).total).toBe(3240);
  });

  it("kaplama farkı yansımaz", () => {
    const silver = chainOnly({ enabled: true, type: "orta", lengthCm: 45 }).unitPrice;
    const gold = computePhysicalPrice({ product: "zincir", metal: "altin", chain: { enabled: true, type: "orta", lengthCm: 45 } }).unitPrice;
    expect(gold).toBe(silver);
  });

  it("geçersiz uzunlukta ücretsize düşmez, sipariş doğrulamada elenir", () => {
    expect(chainOnly({ enabled: true, type: "orta", lengthCm: 200 }).unitPrice).toBe(0);
    expect(normalizeChain({ enabled: true, type: "orta", lengthUnit: "cm", lengthValue: 200 }, "zincir").error).toBeTruthy();
  });

  it("ürünün kendisi zincirse enabled bayrağı aranmaz", () => {
    expect(normalizeChain({ type: "ince", lengthUnit: "cm", lengthValue: 40 }, "zincir")).toMatchObject({
      enabled: true,
      lengthCm: 40,
      label: "İnce forse zincir, 40 cm",
    });
  });
});
