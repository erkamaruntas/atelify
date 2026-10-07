import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/generation-jobs.repo.js", () => ({
  patchGenerationJob: vi.fn(),
}));

vi.mock("../src/repositories/credits.repo.js", () => ({
  refundUserCredits: vi.fn(),
}));

import { patchGenerationJob } from "../src/repositories/generation-jobs.repo.js";
import { refundUserCredits } from "../src/repositories/credits.repo.js";
import {
  creditRefundPayload,
  refundFailedGenerationCredits,
} from "../src/services/credit-refunds.service.js";

afterEach(() => {
  vi.clearAllMocks();
});

function makeJob(overrides = {}) {
  return {
    clientJobId: "job-abc",
    creditCost: 5,
    error: "",
    metadata: {},
    stage: "sketch",
    status: "processing",
    userId: "user-1",
    ...overrides,
  };
}

describe("refundFailedGenerationCredits", () => {
  it("job objesi değilse boş döner ve repo'ya gitmez", async () => {
    const result = await refundFailedGenerationCredits(null);

    expect(result).toEqual({ job: null, refund: null });
    expect(refundUserCredits).not.toHaveBeenCalled();
    expect(patchGenerationJob).not.toHaveBeenCalled();
  });

  it("clientJobId eksikse iade yapmadan job'u geri döner", async () => {
    const job = makeJob({ clientJobId: "" });

    const result = await refundFailedGenerationCredits(job);

    expect(result).toEqual({ job, refund: null });
    expect(refundUserCredits).not.toHaveBeenCalled();
    expect(patchGenerationJob).not.toHaveBeenCalled();
  });

  it("creditCost sıfırsa iade yapmaz", async () => {
    const job = makeJob({ creditCost: 0 });

    const result = await refundFailedGenerationCredits(job);

    expect(result.refund).toBeNull();
    expect(refundUserCredits).not.toHaveBeenCalled();
  });

  it("creditCost negatifse iade yapmaz", async () => {
    const job = makeJob({ creditCost: -3 });

    const result = await refundFailedGenerationCredits(job);

    expect(result.refund).toBeNull();
    expect(refundUserCredits).not.toHaveBeenCalled();
  });

  it("zaten iade edilmiş job (metadata.creditRefunded=true) ikinci kez iade yapmaz", async () => {
    const job = makeJob({ metadata: { creditRefunded: true } });

    const result = await refundFailedGenerationCredits(job);

    expect(result).toEqual({ job, refund: null });
    expect(refundUserCredits).not.toHaveBeenCalled();
    expect(patchGenerationJob).not.toHaveBeenCalled();
  });

  it("happy path: iade çağrısı yapar, job'u 'failed' olarak patch'ler, metadata işaretler", async () => {
    refundUserCredits.mockResolvedValue({ balance: 42, isUnlimited: false });
    patchGenerationJob.mockResolvedValue({
      clientJobId: "job-abc",
      status: "failed",
      stage: "sketch",
    });

    const job = makeJob();
    const result = await refundFailedGenerationCredits(job, { error: "fal hatası" });

    expect(refundUserCredits).toHaveBeenCalledWith({
      amount: 5,
      jobId: "job-abc",
      label: "Başarısız üretim iadesi",
      stage: "sketch",
      userId: "user-1",
    });

    expect(patchGenerationJob).toHaveBeenCalledTimes(1);
    const patchArg = patchGenerationJob.mock.calls[0];
    expect(patchArg[0]).toBe("job-abc");
    expect(patchArg[1].error).toBe("fal hatası");
    expect(patchArg[1].status).toBe("failed");
    expect(patchArg[1].metadata.creditRefunded).toBe(true);
    expect(patchArg[1].metadata.creditRefundReason).toBe("fal hatası");
    expect(typeof patchArg[1].metadata.creditRefundedAt).toBe("string");

    expect(result.refund).toEqual({ balance: 42, isUnlimited: false });
    expect(result.job.status).toBe("failed");
  });

  it("status='cancelled' iptal label'ı kullanır ve status'u cancelled'a çevirir", async () => {
    refundUserCredits.mockResolvedValue({ balance: 10, isUnlimited: false });
    patchGenerationJob.mockResolvedValue(null);

    const job = makeJob();
    await refundFailedGenerationCredits(job, { status: "cancelled", error: "iptal" });

    expect(refundUserCredits).toHaveBeenCalledWith(
      expect.objectContaining({ label: "İptal edilen üretim iadesi" })
    );
    expect(patchGenerationJob).toHaveBeenCalledWith(
      "job-abc",
      expect.objectContaining({ status: "cancelled" })
    );
  });

  it("patchGenerationJob null dönerse synthetic job objesi üretir", async () => {
    refundUserCredits.mockResolvedValue({ balance: 1, isUnlimited: false });
    patchGenerationJob.mockResolvedValue(null);

    const job = makeJob();
    const result = await refundFailedGenerationCredits(job, { error: "bozuk" });

    expect(result.job.status).toBe("failed");
    expect(result.job.error).toBe("bozuk");
    expect(result.job.metadata.creditRefunded).toBe(true);
  });
});

describe("creditRefundPayload", () => {
  it("null/undefined verilirse boş obje döner", () => {
    expect(creditRefundPayload(null)).toEqual({});
    expect(creditRefundPayload(undefined)).toEqual({});
  });

  it("refund objesini creditBalance ve isUnlimited olarak yansıtır", () => {
    expect(creditRefundPayload({ balance: 100, isUnlimited: true })).toEqual({
      creditBalance: 100,
      isUnlimited: true,
    });
  });
});
