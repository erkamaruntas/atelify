import {
  listRecoverableGenerationJobs,
  patchGenerationJob,
} from "../repositories/generation-jobs.repo.js";
import {
  creditRefundPayload,
  refundFailedGenerationCredits,
} from "./credit-refunds.service.js";
import { persistGeneratedImages } from "./storage.service.js";
import { archiveGenerationJobImages } from "./design-archive.service.js";
import { configureFal } from "../providers/fal/client.js";
import {
  fetchImageResult,
  fetchImageStatus,
  normalizeFalImages,
} from "../providers/fal/image.js";
import { buildStageOneSketchDeliveryImages } from "./sketch-engraving.service.js";

export async function recoverUserGenerationJobs({ falKey, limit = 20, userId }) {
  configureFal(falKey);

  const jobs = await listRecoverableGenerationJobs(userId, { limit });
  const recoveredJobs = [];

  for (const job of jobs) {
    recoveredJobs.push(await recoverGenerationJob(job));
  }

  return recoveredJobs;
}

async function recoverGenerationJob(job) {
  if (job.status === "completed" && Array.isArray(job.result?.images) && job.result.images.length) {
    return completedRecoveryPayload(job, job.result);
  }

  if (!job.requestId) {
    return pendingRecoveryPayload(job, "submitting");
  }

  try {
    const normalizedStatus = await fetchImageStatus(job.requestId);

    if (normalizedStatus === "failed" || normalizedStatus === "cancelled") {
      const refundResult = await refundFailedGenerationCredits(job, {
        error: "Görsel üretimi tamamlanamadı.",
        status: normalizedStatus,
      });
      const patchedJob = await patchGenerationJob(job.clientJobId, {
        error: "Görsel üretimi tamamlanamadı.",
        metadata: refundResult.job?.metadata || job.metadata || {},
        status: normalizedStatus,
      });
      return failedRecoveryPayload(refundResult.job || patchedJob || job, normalizedStatus, refundResult.refund);
    }

    if (normalizedStatus !== "completed") {
      const patchedJob = await patchGenerationJob(job.clientJobId, {
        status: normalizedStatus,
      });
      return pendingRecoveryPayload(patchedJob || job, normalizedStatus);
    }

    const result = await fetchImageResult(job.requestId);
    const generatedImages = normalizeFalImages(result, job.stage, job.count);

    if (!generatedImages.length) {
      const refundResult = await refundFailedGenerationCredits(job, {
        error: "Üretimden görsel dönmedi.",
        status: "failed",
      });
      const patchedJob = await patchGenerationJob(job.clientJobId, {
        error: "Üretimden görsel dönmedi.",
        metadata: refundResult.job?.metadata || job.metadata || {},
        status: "failed",
      });
      return failedRecoveryPayload(refundResult.job || patchedJob || job, "failed", refundResult.refund);
    }

    const sketchDelivery =
      job.stage === "sketch"
        ? await buildStageOneSketchDeliveryImages(generatedImages, job.metadata)
        : null;
    const deliverImages = sketchDelivery
      ? sketchDelivery.map((entry) => entry.displayImage)
      : generatedImages;

    let images;
    try {
      images = await persistGeneratedImages(deliverImages, {
        clientJobId: job.clientJobId,
        stage: job.stage,
        userId: job.userId,
      });
      if (sketchDelivery) {
        images = await attachSketchStageSourceUrls(images, sketchDelivery, {
          clientJobId: job.clientJobId,
          userId: job.userId,
        });
      }
    } catch (storageError) {
      images = generatedImages.map((image) => ({
        ...image,
        storagePersisted: false,
      }));
      const completedPayload = {
        detail: storageError?.message || "",
        images,
        prompt: result?.data?.prompt || "",
        requestId: job.requestId,
        storagePersisted: false,
        storageWarning: "Kalıcı arşive kaydedilemedi; görsel bu oturumda gösteriliyor.",
      };
      const patchedJob = await patchGenerationJob(job.clientJobId, {
        error: "",
        result: completedPayload,
        status: "completed",
      });
      console.warn("[generation-recovery] storage persistence failed", storageError);
      return completedRecoveryPayload(patchedJob || job, completedPayload);
    }

    // Sayfa yenilendikten sonra teslim edilen sonuçlar da Tasarımlarım'a düşsün.
    await archiveGenerationJobImages({
      userId: job.userId,
      stage: job.stage,
      clientJobId: job.clientJobId,
      metadata: job.metadata,
      images,
    });

    const completedPayload = {
      images,
      prompt: result?.data?.prompt || "",
      requestId: job.requestId,
    };
    const patchedJob = await patchGenerationJob(job.clientJobId, {
      result: completedPayload,
      status: "completed",
    });

    return completedRecoveryPayload(patchedJob || job, completedPayload);
  } catch (error) {
    console.warn("[generation-recovery] recover check failed", error);
    return {
      error: "Görsel oluşturma durumu şu an kontrol edilemedi.",
      job: serializeGenerationJob(job),
      pending: true,
      status: job.status || "queued",
    };
  }
}

function completedRecoveryPayload(job, payload) {
  return {
    job: serializeGenerationJob(job),
    payload: {
      ...payload,
      clientJobId: job.clientJobId,
      pending: false,
      status: "completed",
    },
    pending: false,
    status: "completed",
  };
}

async function attachSketchStageSourceUrls(images, sketchDelivery, context) {
  const sourceImages = [];
  const sourceIndexByImageIndex = new Map();

  sketchDelivery.forEach((entry, imageIndex) => {
    if (!entry?.stageSourceImage?.buffer) return;
    sourceIndexByImageIndex.set(imageIndex, sourceImages.length);
    sourceImages.push(entry.stageSourceImage);
  });

  if (!sourceImages.length) {
    return images.map((image) => stripTransientImageFields({
      ...image,
      stageSourceUrl: image.url || "",
    }));
  }

  let persistedSources;
  try {
    persistedSources = await persistGeneratedImages(sourceImages, {
      clientJobId: context.clientJobId,
      stage: "sketch-source",
      userId: context.userId,
    });
  } catch (error) {
    console.warn("[generation-recovery] sketch stage source persistence failed; using visible stage-1 image", error);
    return images.map((image) => stripTransientImageFields({
      ...image,
      stageSourceUrl: image.url || "",
    }));
  }

  return images.map((image, imageIndex) => {
    const sourceIndex = sourceIndexByImageIndex.get(imageIndex);
    const stageSourceUrl = Number.isInteger(sourceIndex)
      ? persistedSources[sourceIndex]?.url || image.url || ""
      : image.url || "";
    return stripTransientImageFields({
      ...image,
      stageSourceUrl,
    });
  });
}

function stripTransientImageFields(image = {}) {
  const { buffer, data, stageSourceImage, ...rest } = image;
  return rest;
}

function pendingRecoveryPayload(job, status) {
  return {
    job: serializeGenerationJob({
      ...job,
      status,
    }),
    pending: true,
    status,
  };
}

function failedRecoveryPayload(job, status, refund = null) {
  return {
    ...creditRefundPayload(refund),
    error: job.error || "Görsel oluşturma tamamlanamadı.",
    job: serializeGenerationJob({
      ...job,
      status,
    }),
    pending: false,
    status,
  };
}

function serializeGenerationJob(job) {
  return {
    clientJobId: job.clientJobId,
    count: job.count,
    createdAt: job.createdAt,
    creditCost: job.creditCost,
    deliveredAt: job.deliveredAt || "",
    error: job.error || "",
    label: job.label || "",
    metadata: job.metadata || {},
    projectId: job.projectId || "",
    projectTitle: job.projectTitle || "",
    requestId: job.requestId || "",
    stage: job.stage,
    status: job.status,
    updatedAt: job.updatedAt,
  };
}
