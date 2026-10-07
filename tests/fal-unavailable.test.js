import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/credits.repo.js", () => ({
  getSupabaseAdminClient: vi.fn(),
  refundUserCredits: vi.fn(),
  spendUserCredits: vi.fn(),
}));
vi.mock("../src/repositories/generation-jobs.repo.js", () => ({
  claimGenerationJob: vi.fn(),
  patchGenerationJob: vi.fn(),
}));
vi.mock("../src/utils/idempotency.js", () => ({
  createGenerationIdempotency: vi.fn(async () => ({ proceed: true, finalize: (result) => result })),
}));
vi.mock("../src/providers/fal/image.js", () => ({
  submitImageGeneration: vi.fn(),
  uploadDataUrlToFal: vi.fn(),
}));

import { isFalUnavailableError } from "../src/providers/fal/client.js";
import { refundUserCredits, spendUserCredits } from "../src/repositories/credits.repo.js";
import { submitImageGeneration, uploadDataUrlToFal } from "../src/providers/fal/image.js";
import { runSketchGeneration } from "../src/services/generation.service.js";

// 1x1 şeffaf PNG.
const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function falApiError(status, detail) {
  const error = new Error(detail);
  error.name = "ApiError";
  error.status = status;
  error.body = { detail };
  return error;
}

describe("isFalUnavailableError", () => {
  it("bakiye bitti / kilitli hesap hatalarını tanır", () => {
    expect(isFalUnavailableError(falApiError(403, "User is locked. Reason: Exhausted balance."))).toBe(true);
    expect(isFalUnavailableError(falApiError(401, "Unauthorized"))).toBe(true);
    expect(isFalUnavailableError(new Error("Exhausted balance. Top up your balance at fal.ai/dashboard/billing."))).toBe(true);
  });

  it("geçici / içerik hatalarını üretim kapalı saymaz", () => {
    expect(isFalUnavailableError(falApiError(500, "Internal server error"))).toBe(false);
    expect(isFalUnavailableError(falApiError(422, "Invalid image"))).toBe(false);
    expect(isFalUnavailableError(null)).toBe(false);
  });
});

describe("runSketchGeneration — fal.ai kullanılamıyor", () => {
  const user = { id: "user-1" };
  const body = { imageDataUrl: PNG_DATA_URL, product: "yuzuk" };

  beforeEach(() => {
    vi.clearAllMocks();
    spendUserCredits.mockResolvedValue({ success: true, balance: 7, isUnlimited: false });
    refundUserCredits.mockResolvedValue({ balance: 10, isUnlimited: false });
    uploadDataUrlToFal.mockResolvedValue("https://fal.media/input.png");
  });

  it("bakiye bitince 503 + sade mesaj döner ve krediyi iade eder", async () => {
    submitImageGeneration.mockRejectedValue(falApiError(403, "User is locked. Reason: Exhausted balance."));

    const result = await runSketchGeneration({ user, body, falKey: "key", jobContext: {} });

    expect(result.status).toBe(503);
    expect(result.payload.code).toBe("GENERATION_UNAVAILABLE");
    expect(result.payload.error).not.toMatch(/fal/i);
    expect(result.payload.creditBalance).toBe(10);
    expect(refundUserCredits).toHaveBeenCalledOnce();
  });

  it("FAL_KEY yoksa kredi düşmeden aynı mesajı döner", async () => {
    const result = await runSketchGeneration({ user, body, falKey: "", jobContext: {} });

    expect(result.status).toBe(503);
    expect(result.payload.code).toBe("GENERATION_UNAVAILABLE");
    expect(spendUserCredits).not.toHaveBeenCalled();
  });

  it("diğer fal hataları eski 502 davranışını korur", async () => {
    submitImageGeneration.mockRejectedValue(falApiError(500, "Internal server error"));

    const result = await runSketchGeneration({ user, body, falKey: "key", jobContext: {} });

    expect(result.status).toBe(502);
    expect(refundUserCredits).toHaveBeenCalledOnce();
  });
});
