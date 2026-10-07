import { describe, expect, it } from "vitest";

import { pickPrimarySubscription, summaryFromRow } from "../src/services/subscriptions.service.js";

const FUTURE = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
const PAST = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();

describe("pickPrimarySubscription", () => {
  it("aktif satırı canceled satıra tercih eder", () => {
    const rows = [
      { plan_key: "go", status: "canceled", current_period_end: FUTURE, updated_at: PAST },
      { plan_key: "pro", status: "active", current_period_end: FUTURE, updated_at: PAST },
    ];
    expect(pickPrimarySubscription(rows)?.plan_key).toBe("pro");
  });

  it("pending/expired satırları yok sayar", () => {
    const rows = [
      { plan_key: "go", status: "pending", current_period_end: FUTURE, updated_at: FUTURE },
      { plan_key: "max", status: "expired", current_period_end: FUTURE, updated_at: FUTURE },
      { plan_key: "pro", status: "canceled", current_period_end: FUTURE, updated_at: PAST },
    ];
    expect(pickPrimarySubscription(rows)?.plan_key).toBe("pro");
  });

  it("aktif satırlar arasında en geç dönem sonunu seçer", () => {
    const rows = [
      { plan_key: "go", status: "active", current_period_end: PAST, updated_at: PAST },
      { plan_key: "pro", status: "active", current_period_end: FUTURE, updated_at: PAST },
    ];
    expect(pickPrimarySubscription(rows)?.plan_key).toBe("pro");
  });

  it("ilgili satır yoksa null döner", () => {
    expect(pickPrimarySubscription([{ plan_key: "go", status: "pending" }])).toBeNull();
    expect(pickPrimarySubscription([])).toBeNull();
  });
});

describe("summaryFromRow", () => {
  it("satır yoksa free/none/pasif özet", () => {
    expect(summaryFromRow(null)).toEqual({
      planKey: "free",
      status: "none",
      currentPeriodEnd: null,
      active: false,
    });
  });

  it("aktif abonelik: plan etkin", () => {
    const summary = summaryFromRow({ plan_key: "pro", status: "active", current_period_end: FUTURE });
    expect(summary).toMatchObject({ planKey: "pro", status: "active", active: true });
  });

  it("dönem sonu gelmemiş iptal: plan hâlâ etkin (krediler geçerli)", () => {
    const summary = summaryFromRow({ plan_key: "go", status: "canceled", current_period_end: FUTURE });
    expect(summary).toMatchObject({ planKey: "go", status: "canceled", active: true });
  });

  it("dönem sonu geçmiş iptal: plan artık etkin değil", () => {
    const summary = summaryFromRow({ plan_key: "go", status: "canceled", current_period_end: PAST });
    expect(summary).toMatchObject({ planKey: "go", status: "canceled", active: false });
  });

  it("bilinmeyen plan_key: free'ye düşer", () => {
    const summary = summaryFromRow({ plan_key: "yok", status: "active", current_period_end: FUTURE });
    expect(summary.planKey).toBe("free");
    expect(summary.active).toBe(false);
  });
});
