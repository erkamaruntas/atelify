import {
  patchGenerationJob,
  readGenerationJob,
  sanitizeClientJobId,
} from "../_generation-jobs.js";
import {
  creditRefundPayload,
  refundFailedGenerationCredits,
} from "../_generation-credit-refunds.js";
import { verifyAuthUser } from "../_credits.js";
import { setNoStoreHeaders } from "../_http.js";
import { persistGeneratedImages } from "../_storage.js";
import { archiveGenerationJobImages } from "../../src/services/design-archive.service.js";
import { configureFal } from "../../src/providers/fal/client.js";
import { loadConfig } from "../../src/config/env.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import {
  fetchImageResult,
  fetchImageStatus,
  normalizeFalImages,
} from "../../src/providers/fal/image.js";
import { buildStageOneSketchDeliveryImages } from "../../src/services/sketch-engraving.service.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Oturum doğrulanamadı." });
  }

  if (await applyVercelRateLimit(response, user.id, ["general"])) return;

  const { falKey } = loadConfig();
  configureFal(falKey);

  const clientJobId = sanitizeClientJobId(readQueryParam(request, "clientJobId") || readQueryParam(request, "jobId"));
  if (!clientJobId) {
    return response.status(400).json({ error: "Üretim job id eksik." });
  }

  const storedJob = clientJobId ? await readGenerationJob(clientJobId) : null;
  if (!storedJob || storedJob.userId !== user.id) {
    return response.status(404).json({ error: "Üretim kaydı bulunamadı." });
  }

  const requestId = storedJob.requestId || readQueryParam(request, "requestId") || "";
  const stage = storedJob.stage || normalizeGenerationStage(readQueryParam(request, "stage"));
  const count = normalizeGenerationCount(stage, storedJob.count || readQueryParam(request, "count"));

  if ((!requestId && !clientJobId) || !stage) {
    return response.status(400).json({ error: "Üretim request id veya aşama bilgisi eksik." });
  }

  if (storedJob?.status === "completed" && Array.isArray(storedJob.result?.images) && storedJob.result.images.length) {
    return response.status(200).json({
      ...storedJob.result,
      clientJobId,
      pending: false,
      status: "completed",
    });
  }

  if (!requestId) {
    if (storedJob?.status === "failed" || storedJob?.status === "cancelled") {
      return response.status(200).json({
        clientJobId,
        error: storedJob.error || "Görsel oluşturma tamamlanamadı.",
        pending: false,
        status: storedJob.status,
      });
    }

    return response.status(200).json({
      clientJobId,
      pending: true,
      status: "submitting",
    });
  }

  try {
    const normalizedStatus = await fetchImageStatus(requestId);

    if (normalizedStatus !== "completed") {
      let refund = null;
      if (clientJobId) {
        let jobForPatch = storedJob;
        if (normalizedStatus === "failed" || normalizedStatus === "cancelled") {
          const refundResult = await refundFailedGenerationCredits(storedJob, {
            error: "Görsel üretimi tamamlanamadı.",
            status: normalizedStatus,
          });
          refund = refundResult.refund;
          jobForPatch = refundResult.job || storedJob;
        }
        await patchGenerationJob(clientJobId, {
          count,
          error: normalizedStatus === "failed" || normalizedStatus === "cancelled"
            ? "Görsel üretimi tamamlanamadı."
            : "",
          metadata: jobForPatch?.metadata || storedJob?.metadata || {},
          requestId,
          stage,
          status: normalizedStatus,
        });
      }

      return response.status(200).json({
        clientJobId,
        ...creditRefundPayload(refund),
        error: normalizedStatus === "failed" || normalizedStatus === "cancelled"
          ? "Görsel oluşturma tamamlanamadı."
          : undefined,
        pending: normalizedStatus === "queued" || normalizedStatus === "running",
        requestId,
        status: normalizedStatus,
      });
    }

    const result = await fetchImageResult(requestId);
    const generatedImages = normalizeFalImages(result, stage, count);

    if (!generatedImages.length) {
      let refund = null;
      if (clientJobId) {
        const refundResult = await refundFailedGenerationCredits(storedJob, {
          error: "Üretimden görsel dönmedi.",
          status: "failed",
        });
        refund = refundResult.refund;
        await patchGenerationJob(clientJobId, {
          error: "Üretimden görsel dönmedi.",
          metadata: refundResult.job?.metadata || storedJob?.metadata || {},
          requestId,
          stage,
          status: "failed",
        });
      }

      return response.status(502).json({
        ...creditRefundPayload(refund),
        error: "Üretimden görsel dönmedi.",
        status: "failed",
      });
    }

    // Stage-1 stores the visible design separately from the internal source
    // used by stage 2. The visible output follows the round-ring framing style
    // (square, borderless, breathing room) for every shape.
    const sketchDelivery =
      stage === "sketch"
        ? await buildStageOneSketchDeliveryImages(generatedImages, storedJob.metadata)
        : null;
    const deliverImages = sketchDelivery
      ? sketchDelivery.map((entry) => entry.displayImage)
      : generatedImages;

    let images;
    try {
      images = await persistGeneratedImages(deliverImages, {
        clientJobId,
        stage,
        userId: storedJob.userId,
      });
      if (sketchDelivery) {
        images = await attachSketchStageSourceUrls(images, sketchDelivery, {
          clientJobId,
          userId: storedJob.userId,
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
        requestId,
        storagePersisted: false,
        storageWarning: "Kalıcı arşive kaydedilemedi; görsel bu oturumda gösteriliyor.",
      };
      await patchGenerationJob(clientJobId, {
        count,
        error: "",
        requestId,
        result: completedPayload,
        stage,
        status: "completed",
      });

      console.error("[storage] generated image persistence failed", storageError);
      return response.status(200).json({
        ...completedPayload,
        clientJobId,
        pending: false,
        status: "completed",
      });
    }

    // Kalıcı tasarım arşivine yaz (best-effort; persist edilemeyen görseller atlanır).
    await archiveGenerationJobImages({
      userId: storedJob.userId,
      stage,
      clientJobId,
      metadata: storedJob.metadata,
      images,
    });

    const completedPayload = {
      images,
      prompt: result?.data?.prompt || "",
      requestId,
    };
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        count,
        requestId,
        result: completedPayload,
        stage,
        status: "completed",
      });
    }

    return response.status(200).json({
      clientJobId,
      images,
      pending: false,
      prompt: result?.data?.prompt || "",
      requestId,
      status: "completed",
    });
  } catch (error) {
    console.error("[fal] generation status failed", error);
    return response.status(502).json({
      clientJobId,
      detail: error?.message || "",
      error: "Görsel oluşturma durumu geçici olarak okunamadı.",
      pending: true,
      requestId,
      status: "queued",
    });
  }
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
    console.warn("[sketch] stage source persistence failed; using visible stage-1 image", error);
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

function readQueryParam(request, key) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function normalizeGenerationStage(value) {
  const stage = String(value || "").trim().toLowerCase();
  return ["sketch", "finish", "mockup", "manken"].includes(stage) ? stage : "";
}

function normalizeGenerationCount(stage, value) {
  if (stage === "finish") return Number.parseInt(value, 10) === 4 ? 4 : 1;
  if (stage === "mockup" || stage === "manken") return Number.parseInt(value, 10) === 4 ? 4 : 1;
  return Number.parseInt(value, 10) === 4 ? 4 : 1;
}


export default withApiErrorBoundary(handler, { scope: "generation-status" });
