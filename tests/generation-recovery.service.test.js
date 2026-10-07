import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/generation-jobs.repo.js", () => ({
  listRecoverableGenerationJobs: vi.fn(),
  patchGenerationJob: vi.fn(),
}));

vi.mock("../src/repositories/credits.repo.js", () => ({
  refundUserCredits: vi.fn(),
}));

vi.mock("../src/services/storage.service.js", () => ({
  persistGeneratedImages: vi.fn(),
}));

vi.mock("../src/services/design-archive.service.js", () => ({
  archiveGenerationJobImages: vi.fn(),
}));

vi.mock("../src/providers/fal/client.js", () => ({
  configureFal: vi.fn(),
}));

vi.mock("../src/providers/fal/image.js", () => ({
  fetchImageStatus: vi.fn(),
  fetchImageResult: vi.fn(),
  normalizeFalImages: vi.fn(),
}));

import {
  listRecoverableGenerationJobs,
  patchGenerationJob,
} from "../src/repositories/generation-jobs.repo.js";
import { refundUserCredits } from "../src/repositories/credits.repo.js";
import { persistGeneratedImages } from "../src/services/storage.service.js";
import { archiveGenerationJobImages } from "../src/services/design-archive.service.js";
import { configureFal } from "../src/providers/fal/client.js";
import {
  fetchImageResult,
  fetchImageStatus,
  normalizeFalImages,
} from "../src/providers/fal/image.js";
import { recoverUserGenerationJobs } from "../src/services/generation-recovery.service.js";

afterEach(() => {
  vi.clearAllMocks();
});

function makeJob(overrides = {}) {
  return {
    clientJobId: "job-1",
    count: 1,
    createdAt: "2026-01-01T00:00:00Z",
    creditCost: 5,
    error: "",
    metadata: {},
    requestId: "req-1",
    stage: "sketch",
    status: "queued",
    updatedAt: "2026-01-01T00:00:00Z",
    userId: "user-1",
    ...overrides,
  };
}

describe("recoverUserGenerationJobs", () => {
  it("hiç job yoksa boş dizi döner ama fal yine de konfigüre edilir", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([]);

    const result = await recoverUserGenerationJobs({
      falKey: "fal-key",
      userId: "user-1",
    });

    expect(result).toEqual([]);
    expect(configureFal).toHaveBeenCalledWith("fal-key");
    expect(listRecoverableGenerationJobs).toHaveBeenCalledWith("user-1", { limit: 20 });
  });

  it("zaten tamamlanmış job için fal'a istek atmadan completed payload döner", async () => {
    const completedJob = makeJob({
      status: "completed",
      result: { images: [{ url: "https://example.com/a.jpg" }], prompt: "p" },
    });
    listRecoverableGenerationJobs.mockResolvedValue([completedJob]);

    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(recovered.status).toBe("completed");
    expect(recovered.pending).toBe(false);
    expect(recovered.payload.images).toHaveLength(1);
    expect(fetchImageStatus).not.toHaveBeenCalled();
  });

  it("requestId yoksa submitting durumunda pending döner", async () => {
    const job = makeJob({ requestId: "" });
    listRecoverableGenerationJobs.mockResolvedValue([job]);

    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(recovered.pending).toBe(true);
    expect(recovered.status).toBe("submitting");
    expect(fetchImageStatus).not.toHaveBeenCalled();
  });

  it("fal status='failed' ise iade yapar ve failed payload döner", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([makeJob()]);
    fetchImageStatus.mockResolvedValue("failed");
    refundUserCredits.mockResolvedValue({ balance: 7, isUnlimited: false });
    patchGenerationJob.mockResolvedValue(null);

    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(refundUserCredits).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 5, userId: "user-1", jobId: "job-1" })
    );
    expect(recovered.status).toBe("failed");
    expect(recovered.pending).toBe(false);
    expect(recovered.creditBalance).toBe(7);
  });

  it("fal status='cancelled' ise cancelled status'uyla iade yapar", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([makeJob()]);
    fetchImageStatus.mockResolvedValue("cancelled");
    refundUserCredits.mockResolvedValue({ balance: 3, isUnlimited: false });
    patchGenerationJob.mockResolvedValue(null);

    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(recovered.status).toBe("cancelled");
    expect(refundUserCredits).toHaveBeenCalledWith(
      expect.objectContaining({ label: "İptal edilen üretim iadesi" })
    );
  });

  it("fal status='running' gibi ara durumlarda iade yapmaz, sadece status patch'ler", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([makeJob()]);
    fetchImageStatus.mockResolvedValue("running");
    patchGenerationJob.mockResolvedValue({ ...makeJob(), status: "running" });

    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(recovered.pending).toBe(true);
    expect(recovered.status).toBe("running");
    expect(refundUserCredits).not.toHaveBeenCalled();
    expect(persistGeneratedImages).not.toHaveBeenCalled();
  });

  it("fal completed döner ama görsel yoksa iade + failed", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([makeJob()]);
    fetchImageStatus.mockResolvedValue("completed");
    fetchImageResult.mockResolvedValue({ data: { prompt: "p" } });
    normalizeFalImages.mockReturnValue([]);
    refundUserCredits.mockResolvedValue({ balance: 0, isUnlimited: false });
    patchGenerationJob.mockResolvedValue(null);

    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(recovered.status).toBe("failed");
    expect(refundUserCredits).toHaveBeenCalled();
    expect(persistGeneratedImages).not.toHaveBeenCalled();
  });

  it("happy path: completed + görsel + storage başarılı → completed payload + patch", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([makeJob()]);
    fetchImageStatus.mockResolvedValue("completed");
    fetchImageResult.mockResolvedValue({ data: { prompt: "altın yüzük" } });
    normalizeFalImages.mockReturnValue([{ url: "https://fal/x.jpg" }]);
    persistGeneratedImages.mockResolvedValue([{ url: "https://storage/x.jpg" }]);
    patchGenerationJob.mockResolvedValue({ ...makeJob(), status: "completed" });

    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(persistGeneratedImages).toHaveBeenCalledWith(
      [{ url: "https://fal/x.jpg" }],
      expect.objectContaining({ clientJobId: "job-1", stage: "sketch", userId: "user-1" })
    );
    expect(recovered.status).toBe("completed");
    expect(recovered.pending).toBe(false);
    expect(recovered.payload.images[0].url).toBe("https://storage/x.jpg");
    expect(recovered.payload.prompt).toBe("altın yüzük");
    expect(refundUserCredits).not.toHaveBeenCalled();
    // Sayfa yenilendikten sonra teslim edilen sonuç da Tasarımlarım'a yazılır.
    expect(archiveGenerationJobImages).toHaveBeenCalledWith({
      userId: "user-1",
      stage: "sketch",
      clientJobId: "job-1",
      metadata: {},
      images: [expect.objectContaining({ url: "https://storage/x.jpg" })],
    });
  });

  it("manken işi kurtarılınca arşive manken aşamasıyla yazılır", async () => {
    const mankenJob = makeJob({ stage: "manken", metadata: { product: "kolye" } });
    listRecoverableGenerationJobs.mockResolvedValue([mankenJob]);
    fetchImageStatus.mockResolvedValue("completed");
    fetchImageResult.mockResolvedValue({ data: { prompt: "" } });
    normalizeFalImages.mockReturnValue([{ url: "https://fal/m.jpg" }]);
    persistGeneratedImages.mockResolvedValue([{ url: "https://storage/m.jpg" }]);
    patchGenerationJob.mockResolvedValue({ ...mankenJob, status: "completed" });

    await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(archiveGenerationJobImages).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "manken", metadata: { product: "kolye" } })
    );
  });

  it("storage patlarsa geçici fal görseliyle completed döner", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([makeJob()]);
    fetchImageStatus.mockResolvedValue("completed");
    fetchImageResult.mockResolvedValue({ data: { prompt: "" } });
    normalizeFalImages.mockReturnValue([{ url: "https://fal/x.jpg" }]);
    persistGeneratedImages.mockRejectedValue(new Error("bucket-down"));
    patchGenerationJob.mockResolvedValue({ ...makeJob(), status: "completed" });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });
    warnSpy.mockRestore();

    expect(recovered.status).toBe("completed");
    expect(recovered.pending).toBe(false);
    expect(recovered.payload.images[0]).toEqual({
      storagePersisted: false,
      url: "https://fal/x.jpg",
    });
    expect(recovered.payload.storagePersisted).toBe(false);
    expect(recovered.payload.storageWarning).toContain("Kalıcı arşive kaydedilemedi");
    expect(refundUserCredits).not.toHaveBeenCalled();
    // Kalıcı depoya yazılamayan geçici görseller arşive eklenmez.
    expect(archiveGenerationJobImages).not.toHaveBeenCalled();
    expect(patchGenerationJob).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({
        error: "",
        status: "completed",
      })
    );
  });

  it("fetchImageStatus fırlatırsa generic pending hata payload'u döner", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([makeJob()]);
    fetchImageStatus.mockRejectedValue(new Error("network"));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const [recovered] = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });
    warnSpy.mockRestore();

    expect(recovered.pending).toBe(true);
    expect(recovered.status).toBe("queued");
    expect(recovered.error).toMatch(/şu an kontrol edilemedi/);
    expect(refundUserCredits).not.toHaveBeenCalled();
  });

  it("birden fazla job sırayla işlenir ve hepsi sonuç dizisinde yer alır", async () => {
    listRecoverableGenerationJobs.mockResolvedValue([
      makeJob({ clientJobId: "job-a", requestId: "" }),
      makeJob({
        clientJobId: "job-b",
        status: "completed",
        result: { images: [{ url: "u" }], prompt: "" },
      }),
    ]);

    const results = await recoverUserGenerationJobs({ falKey: "k", userId: "user-1" });

    expect(results).toHaveLength(2);
    expect(results[0].status).toBe("submitting");
    expect(results[1].status).toBe("completed");
  });
});
