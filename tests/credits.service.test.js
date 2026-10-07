import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/credits.repo.js", () => ({
  findUserIdById: vi.fn(),
  findUserIdByEmail: vi.fn(),
  refundUserCredits: vi.fn(),
  spendUserCredits: vi.fn(),
}));

import { findUserIdByEmail, findUserIdById } from "../src/repositories/credits.repo.js";
import { creditCostFor, resolveCreditTarget } from "../src/services/credits.service.js";

afterEach(() => {
  vi.clearAllMocks();
});

describe("creditCostFor", () => {
  it("sketch fiyatları değişmedi (1K)", () => {
    expect(creditCostFor("sketch", 1, { resolution: "1k" })).toBe(1);
    expect(creditCostFor("sketch", 4, { resolution: "1k" })).toBe(3);
  });

  it("finish ücretsiz kalır", () => {
    expect(creditCostFor("finish", 1)).toBe(0);
    expect(creditCostFor("finish", 4)).toBe(0);
  });

  // Güncel tablo (2026-06-22): mockup tabanı 5 kredi; 2K ×1.5, 4K ×2.5 (yuvarlanmış);
  // 4'lü üretim = tek × 3. studio.js'teki STUDIO_CREDIT_COSTS ile aynı kalmalı.
  it("mockup fiyatları güncel tabloyla aynı", () => {
    expect(creditCostFor("mockup", 1, { resolution: "1k" })).toBe(5);
    expect(creditCostFor("mockup", 4, { resolution: "1k" })).toBe(15);
    expect(creditCostFor("mockup", 1, { resolution: "2k" })).toBe(8);
    expect(creditCostFor("mockup", 4, { resolution: "2k" })).toBe(24);
    expect(creditCostFor("mockup", 1, { resolution: "4k" })).toBe(13);
    expect(creditCostFor("mockup", 4, { resolution: "4k" })).toBe(39);
  });

  it("manken ≈ mockup × 1.25 (4. aşama)", () => {
    expect(creditCostFor("manken", 1, { resolution: "1k" })).toBe(6);
    expect(creditCostFor("manken", 4, { resolution: "1k" })).toBe(18);
    expect(creditCostFor("manken", 1, { resolution: "2k" })).toBe(10);
    expect(creditCostFor("manken", 4, { resolution: "2k" })).toBe(30);
    expect(creditCostFor("manken", 1, { resolution: "4k" })).toBe(16);
    expect(creditCostFor("manken", 4, { resolution: "4k" })).toBe(48);
  });

  it("4'lü üretim tek üretimin 3 katıdır (görsel başına %25 indirim)", () => {
    for (const stage of ["sketch", "mockup", "manken"]) {
      for (const resolution of ["1k", "2k", "4k"]) {
        const single = creditCostFor(stage, 1, { resolution });
        expect(creditCostFor(stage, 4, { resolution })).toBe(single * 3);
      }
    }
  });

  it("bilinmeyen çözünürlük 1K'ya düşer", () => {
    expect(creditCostFor("manken", 1, { resolution: "8k" })).toBe(6);
    expect(creditCostFor("mockup", 4, { resolution: "" })).toBe(15);
  });

  it("bilinmeyen aşama 0 döner", () => {
    expect(creditCostFor("bilinmeyen", 1)).toBe(0);
  });
});

describe("resolveCreditTarget", () => {
  it("userId verildiğinde findUserIdById sonucunu döner ve email aramaz", async () => {
    findUserIdById.mockResolvedValue("user-1");

    const result = await resolveCreditTarget({ userId: "user-1", email: "x@y.z" });

    expect(result).toBe("user-1");
    expect(findUserIdById).toHaveBeenCalledWith("user-1");
    expect(findUserIdByEmail).not.toHaveBeenCalled();
  });

  it("userId boşsa email ile arar", async () => {
    findUserIdByEmail.mockResolvedValue("user-2");

    const result = await resolveCreditTarget({ userId: "", email: "a@b.c" });

    expect(result).toBe("user-2");
    expect(findUserIdById).not.toHaveBeenCalled();
    expect(findUserIdByEmail).toHaveBeenCalledWith("a@b.c");
  });

  it("userId etrafındaki boşlukları temizler", async () => {
    findUserIdById.mockResolvedValue("user-3");

    await resolveCreditTarget({ userId: "  user-3  " });

    expect(findUserIdById).toHaveBeenCalledWith("user-3");
  });

  it("email etrafındaki boşlukları temizler", async () => {
    findUserIdByEmail.mockResolvedValue("user-4");

    await resolveCreditTarget({ email: "  user@example.com  " });

    expect(findUserIdByEmail).toHaveBeenCalledWith("user@example.com");
  });

  it("ne userId ne email varsa boş string döner ve repo'ya gitmez", async () => {
    const result = await resolveCreditTarget({});

    expect(result).toBe("");
    expect(findUserIdById).not.toHaveBeenCalled();
    expect(findUserIdByEmail).not.toHaveBeenCalled();
  });

  it("userId string değilse email akışına düşer", async () => {
    findUserIdByEmail.mockResolvedValue("user-5");

    const result = await resolveCreditTarget({ userId: 12345, email: "x@y.z" });

    expect(result).toBe("user-5");
    expect(findUserIdByEmail).toHaveBeenCalledWith("x@y.z");
  });

  it("repo hatası fırlatırsa hata yukarı çıkar", async () => {
    findUserIdById.mockRejectedValue(new Error("supabase down"));

    await expect(resolveCreditTarget({ userId: "user-x" })).rejects.toThrow("supabase down");
  });
});
