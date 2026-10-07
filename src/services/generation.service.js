import {
  claimGenerationJob,
  patchGenerationJob,
} from "../repositories/generation-jobs.repo.js";
import {
  refundUserCredits,
  spendUserCredits,
} from "../repositories/credits.repo.js";
import { creditCostFor } from "./credits.service.js";
import { configureFal, isFalUnavailableError } from "../providers/fal/client.js";
import {
  submitImageGeneration,
  uploadDataUrlToFal,
} from "../providers/fal/image.js";
import {
  buildSketchPrompt,
  normalizeDesignOptions,
} from "../providers/fal/prompts/sketch.js";
import {
  classifySketchInput,
  parseImageDataUrlToBuffer,
  renderDeterministicEngraving,
} from "./sketch-engraving.service.js";
import {
  buildFinishImages,
  buildSideShoulderImages,
  normalizeFinishOptions,
} from "./finish.service.js";
import { persistGeneratedImages } from "./storage.service.js";
import {
  RATIO_OPTIONS,
  buildMockupPrompt,
} from "../providers/fal/prompts/mockup.js";
import {
  isUploadValidationError,
  validateImageDataUrl,
} from "../lib/upload-validation.js";
import {
  assertAllContentAllowed,
  isContentModerationError,
} from "../lib/content-moderation.js";
import { createGenerationIdempotency } from "../utils/idempotency.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("generation");

const GENERATION_UNAVAILABLE_MESSAGE =
  "Canlı görsel üretimi şu an geçici olarak kapalı. Kredin düşülmedi; daha sonra tekrar deneyebilirsin.";

// fal.ai bakiyesi/anahtarı yüzünden üretim yapılamıyorsa kullanıcıya teknik hata yerine
// sade bir mesaj döner. Kredi iadesi çağıran tarafta zaten yapılmış olmalı.
function generationUnavailableResponse(extra = {}) {
  return {
    status: 503,
    payload: { ...extra, code: "GENERATION_UNAVAILABLE", error: GENERATION_UNAVAILABLE_MESSAGE },
  };
}

function normalizeCount(value) {
  return Number.parseInt(value, 10) === 4 ? 4 : 1;
}

function normalizeResolution(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "2k") return "2k";
  if (normalized === "4k") return "4k";
  return "1k";
}

function normalizeMockupScene(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["manken", "elde", "boyunda"].includes(normalized)) return "manken";
  return "mockup";
}

export function normalizeMockupOptions(body) {
  const requestedChannel = typeof body.channel === "string" ? body.channel : "";
  const requestedDesignMode = typeof body.designMode === "string" ? body.designMode : "";
  const requestedMetal = typeof body.metal === "string" ? body.metal : "";
  const requestedSurface = typeof body.surface === "string" ? body.surface : "";
  const requestedProduct = typeof body.product === "string" ? body.product : "";
  const requestedProductShape = typeof body.productShape === "string" ? body.productShape : "";
  const requestedRatio = typeof body.ratio === "string" ? body.ratio : "";
  const requestedResolution = typeof body.resolution === "string" ? body.resolution : "";
  const requestedScene = typeof body.scene === "string" ? body.scene : "";
  const requestedVisualStyle = typeof body.visualStyle === "string" ? body.visualStyle : "";
  const ratio = RATIO_OPTIONS[requestedRatio] ? requestedRatio : "square";

  return {
    aspectRatio: RATIO_OPTIONS[ratio].aspectRatio,
    channel: ["etsy", "instagram", "katalog", "shopify"].includes(requestedChannel) ? requestedChannel : "etsy",
    designMode: ["emboss", "engrave"].includes(requestedDesignMode) ? requestedDesignMode : "engrave",
    metal: ["altin", "gumus", "rose"].includes(requestedMetal) ? requestedMetal : "altin",
    surface: ["fircalanmis", "mat", "parlak", "vintage"].includes(requestedSurface) ? requestedSurface : "parlak",
    mockupCount: normalizeCount(body.mockupCount),
    product: ["kolye", "yuzuk"].includes(requestedProduct) ? requestedProduct : "yuzuk",
    productShape: ["dikdortgen", "kare", "oval", "yuvarlak"].includes(requestedProductShape)
      ? requestedProductShape
      : "yuvarlak",
    ratio,
    ratioLabel: RATIO_OPTIONS[ratio].label,
    resolution: normalizeResolution(requestedResolution),
    scene: normalizeMockupScene(requestedScene),
    sidePrint: body.sidePrint === true && requestedProduct === "yuzuk",
    sourceTitle: typeof body.sourceTitle === "string" ? body.sourceTitle.trim().slice(0, 120) : "",
    visualStyle: ["dogal", "editorial", "luks", "minimal"].includes(requestedVisualStyle)
      ? requestedVisualStyle
      : "minimal",
  };
}

async function tryRefund({ amount, userId, stage, jobId }, refState) {
  if (refState.refunded) return null;
  refState.refunded = true;
  try {
    return await refundUserCredits({
      amount,
      jobId: jobId || "",
      label: "Başarısız üretim iadesi",
      stage,
      userId,
    });
  } catch (error) {
    log.error(`${stage} refund failed`, { error, stage, kind: "credit_refund" });
    return null;
  }
}

function uploadValidationResponse(error, fallbackMessage) {
  return {
    status: error?.statusCode || 400,
    payload: {
      code: error?.code || "invalid_upload",
      error: error?.message || fallbackMessage,
    },
  };
}

function moderationResponse(error) {
  return {
    status: error?.statusCode || 422,
    payload: {
      code: error?.code || "content_blocked",
      error:
        error?.message ||
        "Girdiğiniz içerik topluluk kurallarımıza aykırı olduğu için işleme alınamadı.",
    },
  };
}

async function handleIdempotentClaim({ stage, claimStatus, clientJobId, claimInput, user, pendingPayloadExtras = {} }) {
  const { claimed, job: existingJob } = await claimGenerationJob({
    ...claimInput,
    clientJobId,
    stage,
    status: claimStatus,
    userId: user.id,
  });

  if (claimed || !existingJob) return { proceed: true };

  if (existingJob.userId && existingJob.userId !== user.id) {
    return { proceed: false, response: { status: 403, payload: { error: "Bu üretim başka bir kullanıcıya ait." } } };
  }
  if (existingJob.status === "completed" && existingJob.result) {
    return { proceed: false, response: { status: 200, payload: { ...existingJob.result, idempotent: true } } };
  }
  if (["submitting", "queued", "running"].includes(existingJob.status)) {
    return {
      proceed: false,
      response: {
        status: 202,
        payload: {
          clientJobId,
          idempotent: true,
          pending: true,
          requestId: existingJob.requestId || "",
          stage: existingJob.stage,
          ...pendingPayloadExtras,
        },
      },
    };
  }
  // failed / cancelled → reclaim
  await patchGenerationJob(clientJobId, {
    ...claimInput,
    error: "",
    stage,
    status: claimStatus,
    userId: user.id,
  });
  return { proceed: true };
}

// Attempt the deterministic (non-generative) stage-1 engraving render.
// Returns a 200 result payload on success, or null to signal the caller should
// fall back to the fal.ai API path (uncertain input or processing failure).
async function tryDeterministicSketch({
  clientJobId,
  designOptions,
  imageDataUrl,
  sketchJobMetadata,
  stage,
  user,
}) {
  try {
    const inputBuffer = parseImageDataUrlToBuffer(imageDataUrl);
    if (!inputBuffer) return null;

    const classification = await classifySketchInput(inputBuffer, designOptions.productShape);
    if (!classification.deterministic) return null;

    const rendered = await renderDeterministicEngraving(inputBuffer, {
      shape: designOptions.productShape,
    });

    const persisted = await persistGeneratedImages(
      [
        {
          buffer: rendered.buffer,
          contentType: rendered.contentType,
          height: rendered.height,
          label: "Tasarım 01",
          width: rendered.width,
        },
      ],
      { clientJobId, stage, userId: user.id }
    );

    if (!persisted.length) return null;

    const completedPayload = {
      images: persisted,
      prompt: "",
    };

    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        count: 1,
        error: "",
        metadata: {
          ...sketchJobMetadata,
          engravingMode: rendered.engraving?.mode || "",
          source: "deterministic",
        },
        result: completedPayload,
        stage,
        status: "completed",
      });
    }

    return {
      status: 200,
      payload: {
        ...completedPayload,
        clientJobId,
        pending: false,
        source: "deterministic",
        stage,
        status: "completed",
      },
    };
  } catch (error) {
    log.warn("deterministic sketch render failed; falling back to fal.ai", {
      error,
      kind: "deterministic",
      stage: "sketch",
    });
    return null;
  }
}

export async function runSketchGeneration({ user, body, falKey, clientJobId, jobContext }) {
  if (!falKey) {
    log.error("FAL_KEY missing", { kind: "fal_config" });
    return generationUnavailableResponse();
  }

  const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : "";
  try {
    await validateImageDataUrl(imageDataUrl, { source: "Referans görsel" });
  } catch (error) {
    return uploadValidationResponse(error, "Referans görsel eksik veya geçersiz.");
  }

  try {
    assertAllContentAllowed([
      { value: body.sourceTitle, field: "sourceTitle" },
      { value: jobContext?.label, field: "label" },
      { value: jobContext?.projectTitle, field: "projectTitle" },
    ]);
  } catch (error) {
    if (isContentModerationError(error)) return moderationResponse(error);
    throw error;
  }

  configureFal(falKey);

  const draftCount = normalizeCount(body.draftCount);
  const resolution = "1k";
  const designOptions = normalizeDesignOptions(body);
  const sketchJobMetadata = {
    ...(jobContext.metadata || {}),
    designMode: designOptions.designMode,
    designModeLabel: designOptions.designModeLabel,
    product: designOptions.product,
    productLabel: designOptions.productLabel,
    productShape: designOptions.productShape,
    productShapeLabel: designOptions.shapeLabel,
  };
  const creditCost = creditCostFor("sketch", draftCount, { resolution });
  const stage = "sketch";
  const idempotency = await createGenerationIdempotency({
    clientJobId,
    stage,
    userId: user.id,
  });
  if (!idempotency.proceed) return idempotency.response;
  const finalizeResponse = (result) => idempotency.finalize(result);

  if (clientJobId) {
    const claimOutcome = await handleIdempotentClaim({
      stage,
      claimStatus: "submitting",
      clientJobId,
      claimInput: {
        count: draftCount,
        creditCost,
        label: jobContext.label,
        metadata: sketchJobMetadata,
        projectId: jobContext.projectId,
        projectTitle: jobContext.projectTitle,
      },
      user,
    });
    if (!claimOutcome.proceed) return finalizeResponse(claimOutcome.response);
  }

  // Stage-1 always uses the fal.ai API. The deterministic (no-model) render is
  // disabled on purpose because its output quality is poor; every shape and
  // mode goes through the API, then oval results are reframed to the exact ring
  // oval in the delivery step. (tryDeterministicSketch is kept for reference.)

  let spendResult;
  try {
    spendResult = await spendUserCredits({
      userId: user.id,
      amount: creditCost,
      stage,
      label: `${draftCount === 4 ? "4" : "1"} tasarım görseli (${resolution.toUpperCase()})`,
      jobId: clientJobId,
    });
  } catch (error) {
    log.error("sketch spend failed", { error, stage: "sketch", kind: "credit_spend" });
    if (clientJobId) {
      await patchGenerationJob(clientJobId, { error: "Kredi düşümü yapılamadı.", stage, status: "failed" });
    }
    return finalizeResponse({ status: 500, payload: { error: "Kredi düşümü yapılamadı." } });
  }

  if (!spendResult.success) {
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        error: spendResult.message || "Yetersiz kredi.",
        stage,
        status: "failed",
      });
    }
    return finalizeResponse({
      status: 402,
      payload: {
        error: spendResult.message || "Yetersiz kredi.",
        creditBalance: spendResult.balance,
        isUnlimited: spendResult.isUnlimited,
      },
    });
  }

  const refState = { refunded: false };

  try {
    const inputImageUrl = await uploadDataUrlToFal(imageDataUrl);
    const requestId = await submitImageGeneration({
      aspect_ratio: designOptions.canvasAspectRatio,
      enable_web_search: false,
      image_urls: [inputImageUrl],
      limit_generations: false,
      num_images: draftCount,
      output_format: "png",
      prompt: buildSketchPrompt(designOptions),
      resolution: resolution.toUpperCase(),
      safety_tolerance: "2",
      sync_mode: false,
    });

    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        count: draftCount,
        requestId,
        stage,
        status: "queued",
      });
    }

    return finalizeResponse({
      status: 202,
      payload: {
        clientJobId,
        creditBalance: spendResult.balance,
        isUnlimited: spendResult.isUnlimited,
        pending: true,
        requestId,
        stage,
      },
    });
  } catch (error) {
    const refund = await tryRefund(
      { amount: creditCost, userId: user.id, stage, jobId: clientJobId },
      refState
    );
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        error: isFalUnavailableError(error)
          ? GENERATION_UNAVAILABLE_MESSAGE
          : error?.message || "Görsel üretim isteği başarısız oldu.",
        stage,
        status: "failed",
      });
    }

    log.error("sketch generation failed", { error, stage: "sketch", kind: "fal" });
    if (isFalUnavailableError(error)) {
      return finalizeResponse(generationUnavailableResponse({
        creditBalance: refund?.balance ?? spendResult.balance,
        isUnlimited: refund?.isUnlimited ?? spendResult.isUnlimited,
      }));
    }
    return finalizeResponse({
      status: 502,
      payload: {
        creditBalance: refund?.balance ?? spendResult.balance,
        isUnlimited: refund?.isUnlimited ?? spendResult.isUnlimited,
        detail: error?.message || "",
        error: "Tasarım görseli oluşturulamadı. Lütfen tekrar dene.",
      },
    });
  }
}

async function resolveMockupInputImageUrls(body) {
  const front = await resolveMockupInputImageUrl(body);
  const sideUrls = await resolveMockupSideShoulderUrls(body);
  return [front, ...sideUrls];
}

// Yan baskılı yüzüklerde sol/sağ omuz kabartmalarını AYRI referans görseli olarak
// ekler: image_urls = [ön yüz, sol omuz, sağ omuz]. Böylece model omuzları boş
// bırakmak yerine ilgili referanstan kabartmayı işler. Asset eksik/hata olursa
// sessizce boş döner; ön yüz üretimi yine de devam eder.
async function resolveMockupSideShoulderUrls(body) {
  const product = typeof body.product === "string" ? body.product : "";
  const sidePrintOn = body.sidePrint === true || body.sidePrint === "1";
  if (product !== "yuzuk" || !sidePrintOn) return [];
  try {
    const finishOptions = normalizeFinishOptions({
      designMode: body.designMode,
      finishCount: 1,
      metal: body.metal,
      product: body.product,
      productShape: body.productShape,
      ringMold: body.ringMold,
      sidePrint: body.sidePrint,
      sidePrintLeft: body.sidePrintLeft,
      sidePrintRight: body.sidePrintRight,
      sourceKind: "sketch",
      sourceTitle: body.sourceTitle,
      surface: body.surface,
    });
    const sides = await buildSideShoulderImages(finishOptions);
    if (!sides) return [];
    const [left, right] = await Promise.all([
      uploadDataUrlToFal(sides.left, "ff-mockup-shoulder-left"),
      uploadDataUrlToFal(sides.right, "ff-mockup-shoulder-right"),
    ]);
    return [left, right];
  } catch (error) {
    log.warn("mockup side shoulder reference build failed", { error, stage: "mockup" });
    return [];
  }
}

async function resolveMockupInputImageUrl(body) {
  // 3. aşama her zaman bitmiş ürün kompozitini referans alır. İstemci yalnızca
  // 1. aşama (düz) tasarımı seçtiyse kompozit henüz yoktur; bu durumda tasarımı
  // 2. aşama mantığıyla (buildFinishImages) ürün yüzeyine oturtup öyle gönderiyoruz.
  if (body.compositeFromDesign) {
    return compositeDesignForMockup(body);
  }

  const productUrl = typeof body.productUrl === "string" ? body.productUrl.trim() : "";
  const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : "";

  if (/^https?:\/\//i.test(productUrl)) {
    return productUrl;
  }
  if (imageDataUrl.startsWith("data:image/")) {
    await validateImageDataUrl(imageDataUrl, { source: "Ürün fotoğrafı" });
    return uploadDataUrlToFal(imageDataUrl, "ff-mockup-reference");
  }
  if (productUrl.startsWith("data:image/")) {
    await validateImageDataUrl(productUrl, { source: "Ürün fotoğrafı" });
    return uploadDataUrlToFal(productUrl, "ff-mockup-reference");
  }
  throw new Error("Ürün fotoğrafı eksik ya da geçersiz.");
}

async function compositeDesignForMockup(body) {
  const designBuffer = await resolveMockupDesignBuffer(body);
  const finishOptions = normalizeFinishOptions({
    background: body.background,
    designMode: body.designMode,
    finishCount: 1,
    metal: body.metal,
    product: body.product,
    productShape: body.productShape,
    ringMold: body.ringMold,
    sourceKind: "sketch",
    sourceTitle: body.sourceTitle,
    surface: body.surface,
  });
  const images = await buildFinishImages(designBuffer, finishOptions);
  const composite = Array.isArray(images) ? images[0] : null;
  if (!composite?.url) {
    throw new Error("Mockup için ürün kompoziti üretilemedi.");
  }
  return uploadDataUrlToFal(composite.url, "ff-mockup-composite");
}

async function resolveMockupDesignBuffer(body) {
  const designDataUrl = typeof body.designDataUrl === "string" ? body.designDataUrl : "";
  const designUrl = typeof body.designUrl === "string" ? body.designUrl.trim() : "";

  if (designDataUrl.startsWith("data:image/")) {
    await validateImageDataUrl(designDataUrl, { source: "Tasarım görseli" });
    return parseImageDataUrlToBuffer(designDataUrl);
  }
  if (/^https?:\/\//i.test(designUrl)) {
    const response = await fetch(designUrl);
    if (!response.ok) throw new Error("Mockup için tasarım görseli indirilemedi.");
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  throw new Error("Mockup için tasarım görseli eksik ya da geçersiz.");
}

export async function runMockupGeneration({ user, body, falKey, clientJobId, jobContext }) {
  if (!falKey) {
    log.error("FAL_KEY missing", { kind: "fal_config" });
    return generationUnavailableResponse();
  }

  configureFal(falKey);

  let mockupOptions;
  try {
    mockupOptions = normalizeMockupOptions(body);
  } catch (error) {
    return { status: 400, payload: { error: error.message || "Ürün fotoğrafı geçersiz." } };
  }

  try {
    assertAllContentAllowed([
      { value: mockupOptions.sourceTitle, field: "sourceTitle" },
      { value: jobContext?.label, field: "label" },
      { value: jobContext?.projectTitle, field: "projectTitle" },
    ]);
  } catch (error) {
    if (isContentModerationError(error)) return moderationResponse(error);
    throw error;
  }

  const stage = mockupOptions.scene === "manken" ? "manken" : "mockup";
  const creditCost = creditCostFor(stage, mockupOptions.mockupCount, { resolution: mockupOptions.resolution });
  const creditLabel = `${mockupOptions.mockupCount} ${stage === "manken" ? "manken" : "mockup"} görseli (${mockupOptions.resolution.toUpperCase()})`;
  const idempotency = await createGenerationIdempotency({
    clientJobId,
    pendingPayload: { mockup: mockupOptions },
    stage,
    userId: user.id,
  });
  if (!idempotency.proceed) return idempotency.response;
  const finalizeResponse = (result) => idempotency.finalize(result);

  if (clientJobId) {
    const claimOutcome = await handleIdempotentClaim({
      stage,
      claimStatus: "submitting",
      clientJobId,
      claimInput: {
        count: mockupOptions.mockupCount,
        creditCost,
        label: jobContext.label,
        metadata: jobContext.metadata,
        projectId: jobContext.projectId,
        projectTitle: jobContext.projectTitle,
      },
      user,
      pendingPayloadExtras: { mockup: mockupOptions },
    });
    if (!claimOutcome.proceed) return finalizeResponse(claimOutcome.response);
  }

  let inputImageUrls;
  try {
    inputImageUrls = await resolveMockupInputImageUrls(body);
  } catch (error) {
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        error: isFalUnavailableError(error)
          ? GENERATION_UNAVAILABLE_MESSAGE
          : error?.message || "Ürün fotoğrafı geçersiz.",
        stage,
        status: "failed",
      });
    }
    if (isUploadValidationError(error)) {
      return finalizeResponse(uploadValidationResponse(error, "Ürün fotoğrafı geçersiz."));
    }
    if (isFalUnavailableError(error)) {
      log.error("mockup input upload failed", { error, stage: "mockup", kind: "fal" });
      return finalizeResponse(generationUnavailableResponse());
    }
    return finalizeResponse({ status: 400, payload: { error: error.message || "Ürün fotoğrafı geçersiz." } });
  }

  let spendResult;
  try {
    spendResult = await spendUserCredits({
      userId: user.id,
      amount: creditCost,
      stage,
      label: creditLabel,
      jobId: clientJobId,
    });
  } catch (error) {
    log.error("mockup spend failed", { error, stage: "mockup", kind: "credit_spend" });
    if (clientJobId) {
      await patchGenerationJob(clientJobId, { error: "Kredi düşümü yapılamadı.", stage, status: "failed" });
    }
    return finalizeResponse({ status: 500, payload: { error: "Kredi düşümü yapılamadı." } });
  }

  if (!spendResult.success) {
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        error: spendResult.message || "Yetersiz kredi.",
        stage,
        status: "failed",
      });
    }
    return finalizeResponse({
      status: 402,
      payload: {
        error: spendResult.message || "Yetersiz kredi.",
        creditBalance: spendResult.balance,
        isUnlimited: spendResult.isUnlimited,
      },
    });
  }

  const refState = { refunded: false };

  try {
    const requestId = await submitImageGeneration({
      aspect_ratio: mockupOptions.aspectRatio,
      enable_web_search: false,
      image_urls: inputImageUrls,
      limit_generations: false,
      num_images: mockupOptions.mockupCount,
      output_format: "png",
      prompt: buildMockupPrompt(mockupOptions),
      resolution: mockupOptions.resolution.toUpperCase(),
      safety_tolerance: "2",
      sync_mode: false,
    });

    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        count: mockupOptions.mockupCount,
        requestId,
        stage,
        status: "queued",
      });
    }

    return finalizeResponse({
      status: 202,
      payload: {
        clientJobId,
        creditBalance: spendResult.balance,
        isUnlimited: spendResult.isUnlimited,
        mockup: mockupOptions,
        pending: true,
        requestId,
        stage,
      },
    });
  } catch (error) {
    const refund = await tryRefund(
      { amount: creditCost, userId: user.id, stage, jobId: clientJobId },
      refState
    );
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        error: isFalUnavailableError(error)
          ? GENERATION_UNAVAILABLE_MESSAGE
          : error?.message || "Görsel üretim isteği başarısız oldu.",
        stage,
        status: "failed",
      });
    }

    log.error("mockup generation failed", { error, stage: "mockup", kind: "fal" });
    if (isFalUnavailableError(error)) {
      return finalizeResponse(generationUnavailableResponse({
        creditBalance: refund?.balance ?? spendResult.balance,
        isUnlimited: refund?.isUnlimited ?? spendResult.isUnlimited,
      }));
    }
    return finalizeResponse({
      status: 502,
      payload: {
        creditBalance: refund?.balance ?? spendResult.balance,
        isUnlimited: refund?.isUnlimited ?? spendResult.isUnlimited,
        error: "Mockup fotoğrafı üretilemedi. Lütfen tekrar dene.",
        detail: error?.message || "",
      },
    });
  }
}
