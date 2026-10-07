import { describe, expect, it } from "vitest";

import { SUBSCRIPTION_PLANS, getPlan, isRecurringPlan } from "../src/config/plans.js";

describe("subscription plans (server-authoritative)", () => {
  it("4 plan kesinleşmiş kredi/fiyat değerleriyle tanımlı", () => {
    expect(SUBSCRIPTION_PLANS.free).toMatchObject({ creditAmount: 10, billing: "once", priceTry: 0 });
    expect(SUBSCRIPTION_PLANS.go).toMatchObject({ creditAmount: 15, billing: "monthly", priceTry: 375 });
    expect(SUBSCRIPTION_PLANS.pro).toMatchObject({ creditAmount: 45, billing: "monthly", priceTry: 1000 });
    expect(SUBSCRIPTION_PLANS.max).toMatchObject({ creditAmount: 250, billing: "monthly", priceTry: 5000 });
  });

  it("getPlan büyük/küçük harf ve boşluğa toleranslı, bilinmeyende null", () => {
    expect(getPlan(" GO ")?.key).toBe("go");
    expect(getPlan("Pro")?.key).toBe("pro");
    expect(getPlan("yok")).toBeNull();
    expect(getPlan("")).toBeNull();
  });

  it("sadece Go/Pro/Max tekrarlayan; free tek seferlik", () => {
    expect(isRecurringPlan("go")).toBe(true);
    expect(isRecurringPlan("pro")).toBe(true);
    expect(isRecurringPlan("max")).toBe(true);
    expect(isRecurringPlan("free")).toBe(false);
    expect(isRecurringPlan("yok")).toBe(false);
  });
});
