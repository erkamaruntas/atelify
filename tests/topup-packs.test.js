import { describe, expect, it } from "vitest";

import {
  TOPUP_PACKS,
  TOPUP_PACK_ORDER,
  TOPUP_LIST_PRICE_TRY,
  getTopupPack,
} from "../src/config/topup-packs.js";
import { SUBSCRIPTION_PLANS } from "../src/config/plans.js";

const perCredit = (pack) => pack.priceTry / pack.credits;

describe("top-up packs (server-authoritative)", () => {
  it("5 paket beklenen kredi/fiyatla tanımlı", () => {
    expect(TOPUP_PACKS["10"]).toMatchObject({ credits: 10, priceTry: 300 });
    expect(TOPUP_PACKS["25"]).toMatchObject({ credits: 25, priceTry: 725 });
    expect(TOPUP_PACKS["50"]).toMatchObject({ credits: 50, priceTry: 1400 });
    expect(TOPUP_PACKS["100"]).toMatchObject({ credits: 100, priceTry: 2650 });
    expect(TOPUP_PACKS["250"]).toMatchObject({ credits: 250, priceTry: 6250 });
  });

  it("hiçbir top-up ₺/kredi, en pahalı abonelik planından (Go 25₺) ucuz değil", () => {
    const cheapestPlanRate = Math.max(
      ...Object.values(SUBSCRIPTION_PLANS)
        .filter((p) => p.billing === "monthly")
        .map((p) => p.priceTry / p.creditAmount)
    );
    expect(cheapestPlanRate).toBe(25); // Go = en pahalı plan birimi
    for (const key of TOPUP_PACK_ORDER) {
      expect(perCredit(TOPUP_PACKS[key])).toBeGreaterThanOrEqual(25);
    }
  });

  it("₺/kredi hacimle azalır (monotonik indirim), tavan 30₺", () => {
    const rates = TOPUP_PACK_ORDER.map((key) => perCredit(TOPUP_PACKS[key]));
    expect(Math.max(...rates)).toBeLessThanOrEqual(30);
    for (let i = 1; i < rates.length; i += 1) {
      expect(rates[i]).toBeLessThanOrEqual(rates[i - 1]);
    }
  });

  it("liste fiyatı gerçek fiyatların üstünde (indirim optiği pozitif)", () => {
    for (const key of TOPUP_PACK_ORDER) {
      expect(perCredit(TOPUP_PACKS[key])).toBeLessThan(TOPUP_LIST_PRICE_TRY);
    }
  });

  it("getTopupPack toleranslı; bilinmeyende null", () => {
    expect(getTopupPack(" 100 ")?.credits).toBe(100);
    expect(getTopupPack("999")).toBeNull();
    expect(getTopupPack("")).toBeNull();
  });
});
