import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  claimGenerationJob,
  patchGenerationJob,
  sanitizeClientJobId,
  sanitizeGenerationJobContext,
} from "../repositories/generation-jobs.repo.js";
import {
  refundUserCredits,
  spendUserCredits,
} from "../repositories/credits.repo.js";
import { creditCostFor } from "./credits.service.js";
import { verifyAuthUser } from "./auth.service.js";
import { persistGeneratedImages } from "./storage.service.js";
import { recordGeneratedDesigns } from "../repositories/designs.repo.js";
import {
  isUploadValidationError,
  validateImageDataUrl,
  validateImageUpload,
  validateImageUploadMetadata,
} from "../lib/upload-validation.js";
import { createGenerationIdempotency } from "../utils/idempotency.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("finish");

const moduleDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(moduleDir, "..", "..");
const templateDir = join(rootDir, "assets", "ring-templates");
const manifestPath = join(templateDir, "manifest.json");
const ENGRAVING_SOURCE_TRIM_THRESHOLD = 48;
const ENGRAVING_BACKGROUND_CUTOFF = 136;
const ENGRAVING_MIN_DARKNESS = 0.92;
const ENGRAVING_ALPHA_FLOOR = 24;
const ENGRAVING_SOURCE_PADDING = 8;
const STAGE_TWO_MIN_OPACITY = 0.94;
const STAGE_TWO_FULL_OPACITY = 1;
const PHOTO_TEMPLATE_EDGE_SCALE = 1.04;
const PHOTO_TEMPLATE_EDGE_SCALE_MAX = 1.12;
const PHOTO_TEMPLATE_FIT_FRAME_CLEAR_EDGE_RATIO = 0.045;
const PHOTO_TEMPLATE_MINIMALIST_FIT_FRAME_SCALE = 1;
const PHOTO_TEMPLATE_MINIMALIST_PENDANT_SCALE = 0.96;
const PHOTO_TEMPLATE_MINIMALIST_SQUARE_PENDANT_SCALE = 1;
const PHOTO_TEMPLATE_MINIMALIST_RING_SCALE = 0.86;
const MINIMALIST_OVAL_PENDANT_FRAMED_ARTWORK_SCALE = 1.18;
const MINIMALIST_RECTANGULAR_PENDANT_FRAMED_ARTWORK_SCALE = 1.2;
const FACE_ARTWORK_CONTRAST = 1.16;
const FACE_ARTWORK_OFFSET = -10;
const FACE_DISC_BRIGHTEN = 1.1;
const FACE_DISC_MASK_FEATHER = 10;
const SQUARE_FACE_ARTWORK_SCALE = 0.95;
const DETAILED_FACE_OVERLAY_SCALE = 0.98;
const DETAILED_PENDANT_FACE_OVERLAY_SCALE = 1.01;
const DETAILED_OVAL_PENDANT_CENTER_Y_OFFSET = -0.012;
const DETAILED_OVAL_PENDANT_SOURCE_PADDING_RATIO = 0;
const DETAILED_OVAL_RING_FACE_OVERLAY_HEIGHT_SCALE = 1.04;
const DETAILED_OVAL_RING_FACE_OVERLAY_WIDTH_SCALE = 1.02;
const DETAILED_SQUARE_FACE_OVERLAY_SCALE = 1;
const DETAILED_SQUARE_PENDANT_FACE_OVERLAY_SCALE = 0.95;
const DETAILED_SQUARE_PENDANT_CENTER_Y_OFFSET = -0.01;
const DETAILED_SQUARE_RING_FACE_OVERLAY_SCALE = 0.98;
const MINIMALIST_RING_FACE_OVERLAY_SCALE = 1.05;
const MINIMALIST_PENDANT_FRAMED_ARTWORK_SCALE = 1.14;
const DETAILED_FACE_CENTER_Y_OFFSET = 0;
const DETAILED_SQUARE_FRAME_LUMA_THRESHOLD = 150;
const DETAILED_SQUARE_ARTWORK_ALIGN_THRESHOLD = 48;
const DETAILED_SQUARE_FRAME_PADDING_RATIO = 0;
const DETAILED_SQUARE_FRAME_SCAN_THRESHOLDS = [150, 120, 96, 72];
const DETAILED_SQUARE_FRAME_MIN_LINE_RATIO = 0.38;
const DETAILED_SQUARE_FRAME_MIN_SIDE_RATIO = 0.52;
const SQUARE_OVERLAY_CORNER_RADIUS = 8;
const RECTANGULAR_OVERLAY_CORNER_RADIUS = 14;
const TEMPLATE_SURFACE_SMOOTH_BLUR = 24;
const TEMPLATE_SURFACE_SMOOTH_SCALE = 0.96;

const RING_MOLD_OPTIONS = {
  "kare-s": { heightCm: "1,3", label: "Kare - S", shape: "square", widthCm: "1,3" },
  "kare-m": { heightCm: "1,5", label: "Kare - M", shape: "square", widthCm: "1,5" },
  "kare-l": { heightCm: "1,7", label: "Kare - L", shape: "square", widthCm: "1,7" },
  "kare-xl": { heightCm: "1,9", label: "Kare - XL", shape: "square", widthCm: "1,9" },
  "oval-s": { heightCm: "1,2", label: "Oval - S", shape: "vertical oval", widthCm: "1" },
  "oval-m": { heightCm: "1,5", label: "Oval - M", shape: "vertical oval", widthCm: "1,1" },
  "oval-l": { heightCm: "1,8", label: "Oval - L", shape: "vertical oval", widthCm: "1,2" },
  "oval-xl": { heightCm: "2,1", label: "Oval - XL", shape: "vertical oval", widthCm: "1,3" },
  "yuvarlak-s": { heightCm: "1,2", label: "Yuvarlak - S", shape: "round", widthCm: "1,2" },
  "yuvarlak-m": { heightCm: "1,4", label: "Yuvarlak - M", shape: "round", widthCm: "1,4" },
  "yuvarlak-l": { heightCm: "1,6", label: "Yuvarlak - L", shape: "round", widthCm: "1,6" },
  "yuvarlak-xl": { heightCm: "1,8", label: "Yuvarlak - XL", shape: "round", widthCm: "1,8" },
  "kare-foto-gumus-xl": { heightCm: "1,9", label: "Fotoğraf Kare - Gümüş", shape: "square", widthCm: "1,9" },
  "kare-foto-altin-xl": { heightCm: "1,9", label: "Fotoğraf Kare - Altın", shape: "square", widthCm: "1,9" },
  "oval-foto-gumus-xl": { heightCm: "2,1", label: "Fotoğraf Oval - Gümüş", shape: "vertical oval", widthCm: "1,3" },
  "oval-foto-altin-xl": { heightCm: "2,1", label: "Fotoğraf Oval - Altın", shape: "vertical oval", widthCm: "1,3" },
  "yuvarlak-foto-xl": { heightCm: "1,8", label: "Fotoğraf Yuvarlak - Gümüş", shape: "round", widthCm: "1,8" },
  "yuvarlak-foto-altin-xl": { heightCm: "1,8", label: "Fotoğraf Yuvarlak - Altın", shape: "round", widthCm: "1,8" },
  "kolye-yuvarlak-foto-altin-xl": { heightCm: "2", label: "Kolye Fotoğraf Yuvarlak - Altın", shape: "round", widthCm: "2" },
  "kolye-kare-foto-altin-xl": { heightCm: "2", label: "Kolye Fotoğraf Kare - Altın", shape: "square", widthCm: "2" },
  "kolye-dikdortgen-foto-altin-xl": { heightCm: "2,8", label: "Kolye Fotoğraf Dikdörtgen - Altın", shape: "rectangular", widthCm: "2" },
  "kolye-oval-foto-altin-xl": { heightCm: "2,3", label: "Kolye Fotoğraf Oval - Altın", shape: "vertical oval", widthCm: "1,7" },
  "kolye-yuvarlak-foto-gumus-xl": { heightCm: "2", label: "Kolye Fotoğraf Yuvarlak - Gümüş", shape: "round", widthCm: "2" },
  "kolye-kare-foto-gumus-xl": { heightCm: "2", label: "Kolye Fotoğraf Kare - Gümüş", shape: "square", widthCm: "2" },
  "kolye-dikdortgen-foto-gumus-xl": { heightCm: "2,8", label: "Kolye Fotoğraf Dikdörtgen - Gümüş", shape: "rectangular", widthCm: "2" },
  "kolye-oval-foto-gumus-xl": { heightCm: "2,3", label: "Kolye Fotoğraf Oval - Gümüş", shape: "vertical oval", widthCm: "1,7" },
  "kare-foto-rose-xl": { heightCm: "1,9", label: "Fotoğraf Kare - Rose", shape: "square", widthCm: "1,9" },
  "oval-foto-rose-xl": { heightCm: "2,1", label: "Fotoğraf Oval - Rose", shape: "vertical oval", widthCm: "1,3" },
  "yuvarlak-foto-rose-xl": { heightCm: "1,8", label: "Fotoğraf Yuvarlak - Rose", shape: "round", widthCm: "1,8" },
  "kolye-yuvarlak-foto-rose-xl": { heightCm: "2", label: "Kolye Fotoğraf Yuvarlak - Rose", shape: "round", widthCm: "2" },
  "kolye-kare-foto-rose-xl": { heightCm: "2", label: "Kolye Fotoğraf Kare - Rose", shape: "square", widthCm: "2" },
  "kolye-dikdortgen-foto-rose-xl": { heightCm: "2,8", label: "Kolye Fotoğraf Dikdörtgen - Rose", shape: "rectangular", widthCm: "2" },
  "kolye-oval-foto-rose-xl": { heightCm: "2,3", label: "Kolye Fotoğraf Oval - Rose", shape: "vertical oval", widthCm: "1,7" },
};
const DEFAULT_RING_MOLD_BY_SHAPE = {
  dikdortgen: "kare-foto-gumus-xl",
  kare: "kare-foto-gumus-xl",
  oval: "oval-foto-gumus-xl",
  yuvarlak: "yuvarlak-foto-xl",
};
const RING_MOLD_BY_SHAPE_AND_METAL = {
  kare: { altin: "kare-foto-altin-xl", gumus: "kare-foto-gumus-xl", rose: "kare-foto-rose-xl" },
  oval: { altin: "oval-foto-altin-xl", gumus: "oval-foto-gumus-xl", rose: "oval-foto-rose-xl" },
  yuvarlak: { altin: "yuvarlak-foto-altin-xl", gumus: "yuvarlak-foto-xl", rose: "yuvarlak-foto-rose-xl" },
};
const KOLYE_MOLD_BY_SHAPE_AND_METAL = {
  dikdortgen: { altin: "kolye-dikdortgen-foto-altin-xl", gumus: "kolye-dikdortgen-foto-gumus-xl", rose: "kolye-dikdortgen-foto-rose-xl" },
  kare: { altin: "kolye-kare-foto-altin-xl", gumus: "kolye-kare-foto-gumus-xl", rose: "kolye-kare-foto-rose-xl" },
  oval: { altin: "kolye-oval-foto-altin-xl", gumus: "kolye-oval-foto-gumus-xl", rose: "kolye-oval-foto-rose-xl" },
  yuvarlak: { altin: "kolye-yuvarlak-foto-altin-xl", gumus: "kolye-yuvarlak-foto-gumus-xl", rose: "kolye-yuvarlak-foto-rose-xl" },
};
const PRODUCT_OPTIONS = {
  kolye: { label: "Kolye", prompt: "pendant necklace" },
  yuzuk: { label: "Yüzük", prompt: "ring" },
};
const SHAPE_OPTIONS = {
  dikdortgen: { aspect: 0.71, label: "Dikdörtgen", prompt: "vertical rectangular" },
  kare: { aspect: 1, label: "Kare", prompt: "square" },
  oval: { aspect: 0.72, label: "Oval", prompt: "oval" },
  yuvarlak: { aspect: 1, label: "Yuvarlak", prompt: "round" },
};
const DESIGN_MODE_OPTIONS = {
  emboss: { label: "Detaylı" },
  engrave: { label: "Minimalist" },
};

let templateManifestPromise = null;

export async function runFinishCompositeRequest(request, body) {
  if (request.method !== "POST") {
    return { payload: { error: "Method not allowed" }, status: 405 };
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return {
      payload: { error: error?.message || "Oturum doğrulanamadı." },
      status: error?.statusCode || 401,
    };
  }

  const clientJobId = sanitizeClientJobId(body.clientJobId || body.client_job_id);
  const jobContext = sanitizeGenerationJobContext(body.jobContext);
  let finishOptions;
  let sourceImageBuffer;
  try {
    finishOptions = normalizeFinishOptions(body);
    sourceImageBuffer = await resolveFinishSourceImageBuffer(body);
  } catch (error) {
    return {
      payload: {
        code: isUploadValidationError(error) ? error.code : "invalid_upload",
        error: error.message || "Kaynak görsel geçersiz.",
      },
      status: error?.statusCode || 400,
    };
  }

  const creditCost = creditCostFor("finish", finishOptions.finishCount);
  const idempotency = await createGenerationIdempotency({
    clientJobId,
    pendingPayload: { finish: finishOptions },
    stage: "finish",
    userId: user.id,
  });
  if (!idempotency.proceed) return idempotency.response;
  const finalizeResponse = (result) => idempotency.finalize(result);

  if (clientJobId) {
    const { claimed, job: existingJob } = await claimGenerationJob({
      clientJobId,
      count: finishOptions.finishCount,
      creditCost,
      label: jobContext.label,
      metadata: jobContext.metadata,
      projectId: jobContext.projectId,
      projectTitle: jobContext.projectTitle,
      stage: "finish",
      status: "running",
      userId: user.id,
    });

    if (!claimed && existingJob) {
      if (existingJob.userId && existingJob.userId !== user.id) {
        return finalizeResponse({ payload: { error: "Bu üretim başka bir kullanıcıya ait." }, status: 403 });
      }
      if (existingJob.status === "completed" && existingJob.result) {
        return finalizeResponse({ payload: { ...existingJob.result, idempotent: true }, status: 200 });
      }
      if (["submitting", "queued", "running"].includes(existingJob.status)) {
        return finalizeResponse({
          payload: {
            clientJobId,
            finish: finishOptions,
            idempotent: true,
            pending: true,
            stage: existingJob.stage,
          },
          status: 202,
        });
      }
      await patchGenerationJob(clientJobId, {
        count: finishOptions.finishCount,
        creditCost,
        error: "",
        stage: "finish",
        status: "running",
        userId: user.id,
      });
    }
  }

  let spendResult;
  try {
    spendResult = await spendUserCredits({
      userId: user.id,
      amount: creditCost,
      stage: "finish",
      label: finishOptions.finishCount === 4 ? "4 ürün görseli" : "1 ürün görseli",
      jobId: clientJobId,
    });
  } catch (error) {
    log.error("finish spend failed", { error, stage: "finish", kind: "credit_spend" });
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        error: "Kredi düşümü yapılamadı.",
        stage: "finish",
        status: "failed",
      });
    }
    return finalizeResponse({ payload: { error: "Kredi düşümü yapılamadı." }, status: 500 });
  }

  if (!spendResult.success) {
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        error: spendResult.message || "Yetersiz kredi.",
        stage: "finish",
        status: "failed",
      });
    }
    return finalizeResponse({
      payload: {
        error: spendResult.message || "Yetersiz kredi.",
        creditBalance: spendResult.balance,
        isUnlimited: spendResult.isUnlimited,
      },
      status: 402,
    });
  }

  let creditsRefunded = false;
  const refundOnFailure = async () => {
    if (creditsRefunded) return null;
    creditsRefunded = true;
    try {
      return await refundUserCredits({
        userId: user.id,
        amount: creditCost,
        stage: "finish",
        label: "Başarısız üretim iadesi",
        jobId: clientJobId,
      });
    } catch (error) {
      log.error("finish refund failed", { error, stage: "finish", kind: "credit_refund" });
      return null;
    }
  };

  try {
    const generatedImages = await buildFinishImages(sourceImageBuffer, finishOptions);
    const images = await persistGeneratedImages(generatedImages, {
      clientJobId,
      stage: "finish",
      userId: user.id,
    });
    // Kalıcı tasarım arşivine yaz (best-effort; hata fırlatmaz, üretimi bozmaz).
    await recordGeneratedDesigns({
      userId: user.id,
      stage: "finish",
      projectId: jobContext.projectId,
      projectTitle: jobContext.projectTitle,
      title: finishOptions.sourceTitle || jobContext.projectTitle || "",
      product: finishOptions.product,
      productShape: finishOptions.productShape,
      designMode: finishOptions.designMode,
      clientJobId,
      options: {
        metal: finishOptions.metal,
        surface: finishOptions.surface,
        background: finishOptions.background,
        ringMold: finishOptions.ringMoldKey,
        sidePrint: finishOptions.sidePrint,
        sidePrintLeft: finishOptions.sidePrint ? finishOptions.sidePrintLeft : "",
        sidePrintRight: finishOptions.sidePrint ? finishOptions.sidePrintRight : "",
      },
      metadata: jobContext.metadata,
      images,
    });
    const payload = {
      clientJobId,
      creditBalance: spendResult.balance,
      finish: finishOptions,
      images,
      isUnlimited: spendResult.isUnlimited,
      pending: false,
      stage: "finish",
    };

    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        count: finishOptions.finishCount,
        result: payload,
        stage: "finish",
        status: "completed",
      });
    }

    return finalizeResponse({ payload, status: 200 });
  } catch (error) {
    const refund = await refundOnFailure();
    if (clientJobId) {
      await patchGenerationJob(clientJobId, {
        error: error?.message || "Finish composite başarısız oldu.",
        stage: "finish",
        status: "failed",
      });
    }

    log.error("finish-composite generation failed", { error, stage: "finish", kind: "fal" });
    return finalizeResponse({
      payload: {
        creditBalance: refund?.balance ?? spendResult.balance,
        detail: error?.message || "",
        error: "Ürün görseli hazırlanamadı.",
        isUnlimited: refund?.isUnlimited ?? spendResult.isUnlimited,
      },
      status: 502,
    });
  }
}

export function normalizeFinishCount(value) {
  return Number.parseInt(value, 10) === 4 ? 4 : 1;
}

export function normalizeFinishOptions(body) {
  const requestedMetal = typeof body.metal === "string" ? body.metal : "";
  const requestedSurface = typeof body.surface === "string" ? body.surface : "";
  const requestedBackground = typeof body.background === "string" ? body.background : "";
  const requestedDesignMode = normalizeEnum(body.designMode, Object.keys(DESIGN_MODE_OPTIONS), "engrave");
  const requestedProduct = normalizeEnum(body.product, Object.keys(PRODUCT_OPTIONS), "yuzuk");
  const requestedProductShape = normalizeEnum(body.productShape, Object.keys(SHAPE_OPTIONS), "yuvarlak");
  const requestedRingMold = typeof body.ringMold === "string" ? body.ringMold.trim().toLowerCase() : "";
  const requestedSourceKind = typeof body.sourceKind === "string" ? body.sourceKind.trim().toLowerCase() : "";

  if (requestedSourceKind && requestedSourceKind !== "sketch") {
    throw new Error("2. aşama ürün yüzeyine uygulanacak tasarım görseli kabul eder.");
  }

  const metal = ["altin", "gumus", "rose"].includes(requestedMetal) ? requestedMetal : "gumus";
  const useRingPhotoTemplate = requestedProduct === "yuzuk" && requestedProductShape !== "dikdortgen";
  const useKolyePhotoTemplate = requestedProduct === "kolye";
  const usePhotoTemplate = useRingPhotoTemplate || useKolyePhotoTemplate;
  let metalTemplateKey = "";
  let fallbackRingMoldKey = "";
  if (useKolyePhotoTemplate) {
    metalTemplateKey = KOLYE_MOLD_BY_SHAPE_AND_METAL[requestedProductShape]?.[metal] ||
      KOLYE_MOLD_BY_SHAPE_AND_METAL[requestedProductShape]?.altin ||
      KOLYE_MOLD_BY_SHAPE_AND_METAL[requestedProductShape]?.gumus || "";
    fallbackRingMoldKey = metalTemplateKey || KOLYE_MOLD_BY_SHAPE_AND_METAL.yuvarlak.altin;
  } else if (useRingPhotoTemplate) {
    metalTemplateKey = RING_MOLD_BY_SHAPE_AND_METAL[requestedProductShape]?.[metal] || "";
    fallbackRingMoldKey = metalTemplateKey || DEFAULT_RING_MOLD_BY_SHAPE[requestedProductShape] || "yuvarlak-foto-xl";
  }
  const ringMoldKey = usePhotoTemplate && RING_MOLD_OPTIONS[requestedRingMold]
    ? requestedRingMold
    : fallbackRingMoldKey;

  return {
    background: ["dekupe", "temiz", "golge"].includes(requestedBackground) ? requestedBackground : "dekupe",
    designMode: requestedDesignMode,
    designModeLabel: DESIGN_MODE_OPTIONS[requestedDesignMode].label,
    finishCount: normalizeFinishCount(body.finishCount),
    metal,
    product: requestedProduct,
    productLabel: PRODUCT_OPTIONS[requestedProduct].label,
    productShape: requestedProductShape,
    productShapeLabel: SHAPE_OPTIONS[requestedProductShape].label,
    ringMold: ringMoldKey ? RING_MOLD_OPTIONS[ringMoldKey] || null : null,
    ringMoldKey,
    // Yan baskı: kullanıcı 2. aşamada yüzüğün omuzlarına baskı isterse açılır.
    // Şimdilik yalnız yüzükte geçerli; layout asset'i yoksa sessizce devre dışı kalır.
    sidePrint: body.sidePrint === true && requestedProduct === "yuzuk",
    // Sol ve sağ omuza basılacak emblem anahtarları (kullanıcı ayrı ayrı seçer).
    // Yoksa düz omuz ("yuzuk") kullanılır.
    sidePrintLeft: sanitizeSideEmblemKey(body.sidePrintLeft),
    sidePrintRight: sanitizeSideEmblemKey(body.sidePrintRight),
    sourceKind: "sketch",
    sourceTitle: typeof body.sourceTitle === "string" ? body.sourceTitle.trim().slice(0, 120) : "",
    stone: "yok",
    surface: ["parlak", "mat", "fircalanmis", "vintage"].includes(requestedSurface) ? requestedSurface : "parlak",
  };
}

function normalizeEnum(value, allowed, fallback) {
  const normalized = String(value || "").trim().toLowerCase().replace("dikdörtgen", "dikdortgen");
  return allowed.includes(normalized) ? normalized : fallback;
}

// Yan baskı emblem anahtarını güvenli hale getirir: yalnız [a-z0-9-] kalır, böylece
// dosya yolu enjeksiyonu (../ vb.) engellenir. Boşsa "yuzuk" (düz omuz) döner.
function sanitizeSideEmblemKey(value) {
  const key = String(value || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  return key || "yuzuk";
}

export async function buildFinishImages(sourceImageBuffer, finishOptions) {
  const count = finishOptions.finishCount;
  const images = [];
  const sidePrintConfig = finishOptions.sidePrint ? await readSidePrintConfig(finishOptions) : null;
  for (let index = 0; index < count; index += 1) {
    let buffer = await compositeSketchOnTemplate(sourceImageBuffer, finishOptions, index);
    if (sidePrintConfig) {
      buffer = await applySidePrintLayout(buffer, sidePrintConfig);
    }
    const outputBuffer = await sharp(buffer)
      .webp({ effort: 5, lossless: true, quality: 100 })
      .toBuffer();
    images.push({
      contentType: "image/webp",
      url: `data:image/webp;base64,${outputBuffer.toString("base64")}`,
    });
  }
  return images;
}

// Yan baskı (sidePrint): 2. aşama kompozitinin sol ve sağına yan yüzük kalıbının
// (omuz) üstüne kullanıcının seçtiği emblem basılı şekilde yerleştirir; sol tarafa
// sol seçtiği, sağ tarafa sağ seçtiği emblem oturur. Taban her zaman shoulder-yuzuk
// kalıbıdır; emblem kalıbın yüzeyine multiply ile bindirilir (beyaz zemin metalde
// kaybolur, emblem dik/okunur kalır). Seçim "düz omuz" ise emblem eklenmez.
async function readSidePrintConfig(finishOptions) {
  const manifest = await readTemplateManifest();
  const config = manifest.sidePrint?.[finishOptions.product];
  if (!config || !config.assetLeft || !config.assetRight) {
    console.warn(`[finish-composite] side-print config missing for product=${finishOptions.product}; skipping side print.`);
    return null;
  }
  const defaultKey = sanitizeSideEmblemKey(config.defaultKey);
  // Metale göre yan yüzük kalıbı: altın için altın kalıp, yoksa varsayılan (gümüş).
  const mold = config.molds?.[finishOptions.metal] || {};
  const assetLeft = mold.assetLeft || config.assetLeft;
  const assetRight = mold.assetRight || config.assetRight;
  let baseLeftBuffer;
  let baseRightBuffer;
  try {
    [baseLeftBuffer, baseRightBuffer] = await Promise.all([
      readFile(join(templateDir, assetLeft)),
      readFile(join(templateDir, assetRight)),
    ]);
  } catch (error) {
    console.warn("[finish-composite] side-print mold asset missing; skipping side print.", error?.message || error);
    return null;
  }
  const [leftEmblemBuffer, rightEmblemBuffer] = await Promise.all([
    resolveEmblemBuffer(config, finishOptions.sidePrintLeft, defaultKey),
    resolveEmblemBuffer(config, finishOptions.sidePrintRight, defaultKey),
  ]);
  return { ...config, baseLeftBuffer, baseRightBuffer, leftEmblemBuffer, rightEmblemBuffer };
}

// Seçilen emblem anahtarı için dosya buffer'ını döner (kalıbın üstüne dik basılacak).
// "düz omuz" (defaultKey) veya boş seçimde emblem yoktur. Anahtarın -left ya da
// -right dosyası (hangisi varsa) kullanılır; ayna alınmaz, böylece metin ters dönmez.
async function resolveEmblemBuffer(config, rawKey, defaultKey) {
  const key = sanitizeSideEmblemKey(rawKey);
  if (!key || key === defaultKey) return null;
  const pattern = typeof config.assetPattern === "string" && config.assetPattern.includes("{key}")
    ? config.assetPattern
    : "side/shoulder-{key}-{side}.png";
  for (const side of ["left", "right"]) {
    try {
      return await readFile(join(templateDir, pattern.replace("{key}", key).replace("{side}", side)));
    } catch {
      // diğer tarafı dene
    }
  }
  return null;
}

// Emblemi yan yüzük kalıbının yüzeyine bindirir. Emblem beyaz kenarından kırpılır,
// manifest'teki emblemPlacement bölgesine (kalıp boyutuna oranlı) sığdırılır ve
// multiply ile basılır. Emblem yoksa kalıp olduğu gibi döner.
async function compositeEmblemOnShoulder(baseBuffer, emblemBuffer, config) {
  if (!emblemBuffer) return baseBuffer;
  const base = sharp(baseBuffer);
  const meta = await base.metadata();
  const bw = meta.width || 1024;
  const bh = meta.height || 1024;
  const p = config.emblemPlacement || {};
  const cx = clamp(Number(p.centerX) || 0.5, 0, 1) * bw;
  const cy = clamp(Number(p.centerY) || 0.37, 0, 1) * bh;
  const box = clamp(Number(p.box) || 0.35, 0.05, 1) * Math.min(bw, bh);
  let trimmed;
  try {
    trimmed = await sharp(emblemBuffer).trim().toBuffer({ resolveWithObject: true });
  } catch {
    trimmed = await sharp(emblemBuffer).toBuffer({ resolveWithObject: true });
  }
  const ew = trimmed.info.width || 1;
  const eh = trimmed.info.height || 1;
  const ratio = Math.min(box / ew, box / eh);
  const w = Math.max(1, Math.round(ew * ratio));
  const h = Math.max(1, Math.round(eh * ratio));
  const resized = await sharp(trimmed.data).resize(w, h).flatten({ background: "#ffffff" }).toBuffer();
  // Emblemi SAF SİYAH basmak yerine, siyahını GRİYE yumuşatıp multiply ile basıyoruz.
  // multiply'da beyaz zemin hiç etki etmez (emblem etrafında hale/dikdörtgen kalmaz),
  // emblemin koyu alanları ise AYNI metalin daha koyu/mat tonuna döner (altın→koyu
  // altın, gümüş→gri) — yani saf siyah boya değil, "metale kazınmış" görünüm. Böylece
  // AI siyahı kazıma olarak işler ("eskizdeki siyah yerler kazıma olur").
  const opacity = clamp(Number(config.emblemOpacity ?? 0.6), 0.1, 1);
  // result = pixel*opacity + 255*(1-opacity): siyah(0)→açık gri, beyaz(255)→255.
  const softened = await sharp(resized)
    .linear(opacity, Math.round(255 * (1 - opacity)))
    .toBuffer();
  return base
    .composite([{
      input: softened,
      left: Math.round(cx - w / 2),
      top: Math.round(cy - h / 2),
      blend: "multiply",
    }])
    .png()
    .toBuffer();
}

async function applySidePrintLayout(centerBuffer, config) {
  const center = await sharp(centerBuffer).metadata();
  const centerW = center.width || 1024;
  const centerH = center.height || 1024;

  const shoulderScale = clamp(Number(config.shoulderScale) || 1, 0.3, 1.2);
  const targetShoulderH = Math.round(centerH * shoulderScale);

  // Önce seçilen emblemi yan yüzük kalıbının üstüne bas, sonra omuzu ortanın
  // yüksekliğine ölçekle; varsa boş kenar boşluklarını kırp ki ortaya temiz otursun.
  const [leftBaseShoulder, rightBaseShoulder] = await Promise.all([
    compositeEmblemOnShoulder(config.baseLeftBuffer, config.leftEmblemBuffer, config),
    compositeEmblemOnShoulder(config.baseRightBuffer, config.rightEmblemBuffer, config),
  ]);
  const prepareShoulder = async (buffer) => {
    let pipe = sharp(buffer, { failOn: "none" }).rotate();
    if (config.trim !== false) pipe = pipe.trim();
    const out = await pipe
      .resize({ height: targetShoulderH, fit: "inside", withoutEnlargement: false })
      .png()
      .toBuffer();
    const meta = await sharp(out).metadata();
    return { buffer: out, width: meta.width || targetShoulderH, height: meta.height || targetShoulderH };
  };
  const [leftShoulder, rightShoulder] = await Promise.all([
    prepareShoulder(leftBaseShoulder),
    prepareShoulder(rightBaseShoulder),
  ]);

  const overlap = Math.round(centerW * (Number(config.overlap) || 0));
  // Dış kenarlara nefes payı: omuzların band uçları görsel sınırına yapışıp
  // kesik görünmesin diye sol ve sağ dışta boşluk bırakılır.
  const outerMargin = Math.round(centerW * (Number(config.outerMargin) || 0));
  const leftStep = Math.max(0, leftShoulder.width - overlap);
  const rightStep = Math.max(0, rightShoulder.width - overlap);
  const totalW = outerMargin + leftStep + centerW + rightStep + outerMargin;
  const totalH = Math.max(centerH, leftShoulder.height, rightShoulder.height);

  const centerTop = Math.round((totalH - centerH) / 2);
  const valign = clamp(Number(config.verticalAlign ?? 0.5), 0, 1);

  return sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: config.background || "#ffffff",
    },
  })
    .composite([
      { input: leftShoulder.buffer, left: outerMargin, top: Math.round((totalH - leftShoulder.height) * valign) },
      { input: centerBuffer, left: outerMargin + leftStep, top: centerTop },
      { input: rightShoulder.buffer, left: outerMargin + leftStep + centerW, top: Math.round((totalH - rightShoulder.height) * valign) },
    ])
    .png()
    .toBuffer();
}

// Mockup 3-referans modu: yan omuz kabartmalarını tek panele birleştirmeden
// sol ve sağ'ı AYRI görsel (data URL) olarak üretir. applySidePrintLayout ile aynı
// emblem-basma mantığını kullanır ama panelleri yan yana eklemez. Her iki taraf da
// düz omuz (emblem seçilmemiş) ise null döner — ayrı referansa gerek yoktur.
export async function buildSideShoulderImages(finishOptions) {
  if (!finishOptions?.sidePrint) return null;
  const config = await readSidePrintConfig(finishOptions);
  if (!config) return null;
  if (!config.leftEmblemBuffer && !config.rightEmblemBuffer) return null;
  const [leftBase, rightBase] = await Promise.all([
    compositeEmblemOnShoulder(config.baseLeftBuffer, config.leftEmblemBuffer, config),
    compositeEmblemOnShoulder(config.baseRightBuffer, config.rightEmblemBuffer, config),
  ]);
  const toDataUrl = async (buffer) => {
    let pipe = sharp(buffer, { failOn: "none" }).rotate();
    if (config.trim !== false) pipe = pipe.trim();
    const out = await pipe
      .resize({ height: 1024, fit: "inside", withoutEnlargement: false })
      .png()
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  };
  const [left, right] = await Promise.all([toDataUrl(leftBase), toDataUrl(rightBase)]);
  return { left, right };
}

async function compositeSketchOnTemplate(sourceImageBuffer, finishOptions, index = 0) {
  const manifest = await readTemplateManifest();
  const usePhotoTemplate =
    (finishOptions.product === "yuzuk" && finishOptions.productShape !== "dikdortgen") ||
    finishOptions.product === "kolye";
  const rawTemplate = usePhotoTemplate
    ? manifest.templates[finishOptions.ringMoldKey]
    : null;
  let template = rawTemplate
    ? normalizeTemplateConfig(rawTemplate, finishOptions.ringMoldKey, finishOptions)
    : buildDynamicTemplateConfig(finishOptions);
  if (!template) throw new Error("Ürün template kaydı eksik.");

  const canvas = manifest.defaults?.canvas || { width: 1024, height: 1024 };
  const engraving = applyDesignModeToEngraving(
    mergeEngravingConfig(manifest.defaults?.engraving, template.engraving),
    finishOptions
  );
  let templateBuffer = await readTemplateAsset(template, canvas);
  ({ templateBuffer, template } = await centerPendantTemplateIfNeeded(templateBuffer, template, canvas));
  templateBuffer = await smoothTemplateSurfaceIfNeeded(templateBuffer, template, canvas);
  const naturallyFaceArtwork = await shouldPreserveSourceAsFaceArtwork(sourceImageBuffer, template);
  const isEmbossMode = finishOptions.designMode === "emboss";
  const preserveFaceArtwork = naturallyFaceArtwork;
  // Yuvarlak fotoğraf yüzüğü (gümüş/altın/rose): 1. aşama çıktısı OLDUĞU GİBİ diske
  // yapıştırılır — siyah kenar boşluğu trim'lenmez, büyütme/aşağı kaydırma yapılmaz.
  // Böylece çember tam karenin EN DIŞ kenarından alınır (içeri kırpılıp yakınlaşmaz).
  // "Derin kazıma" (emboss) ve "Yüzeysel kazıma" (engrave) FARK ETMEZ: her iki modda
  // da yuvarlak/oval foto yüzükte 1. aşama görseli olduğu gibi yüzeye yapıştırılır
  // (trim yok, büyütme/kaydırma yok); çember/oval en dış kenardan alınır, siyah
  // boşluklar 1. aşamadaki gibi korunur.
  const isPhotoRingFace =
    finishOptions.product === "yuzuk" &&
    isPhotoTemplateConfig(template) &&
    ["yuvarlak", "round", "oval", "vertical oval"].includes(
      String(template.shape || "").trim().toLowerCase()
    );
  const pasteFaceArtworkAsIs = preserveFaceArtwork && isPhotoRingFace;
  const hasMinimalistFitFrame = !preserveFaceArtwork && !isEmbossMode
    ? await sourceHasMinimalistFitFrame(sourceImageBuffer, template.shape)
    : false;

  // Emboss modda beyaz-zemin gelirse invertle → siyah zemin + beyaz çizgi
  let effectiveSourceBuffer = sourceImageBuffer;
  if (isEmbossMode && !naturallyFaceArtwork) {
    effectiveSourceBuffer = await sharp(sourceImageBuffer, { failOn: "none" })
      .flatten({ background: "#ffffff" })
      .negate()
      .png()
      .toBuffer();
  }

  // Kare yüzlerde detaylı artwork, kabartma çerçevenin içindeki düz yüzeye birebir
  // oturmalı; yuvarlak/oval için kullanılan overscale + aşağı kaydırma uygulanmaz.
  const isSquareFaceArtwork = preserveFaceArtwork && isSquareTemplateShape(template);
  const isMinimalistRectangularPendant =
    !isEmbossMode &&
    !preserveFaceArtwork &&
    isRectangularPendantPhotoTemplate(template);
  const isMinimalistOvalPendant =
    !isEmbossMode &&
    !preserveFaceArtwork &&
    isOvalPendantPhotoTemplate(template);
  const effectiveHasMinimalistFitFrame =
    hasMinimalistFitFrame ||
    isMinimalistRectangularPendant ||
    isMinimalistOvalPendant;
  const useDetailedRingSizingForMinimalist =
    !isEmbossMode &&
    !preserveFaceArtwork &&
    finishOptions.product === "yuzuk" &&
    isPhotoTemplateConfig(template);
  const overlayScale = preserveFaceArtwork
    ? (pasteFaceArtworkAsIs ? 1 : clamp(Number(engraving.faceScale) || 1.1, 0.2, 1.2))
    : engravingSurfaceScale(engraving, template, finishOptions, { hasFitFrame: effectiveHasMinimalistFitFrame });
  const overlayPlacement = pasteFaceArtworkAsIs
    // 1:1 disk: büyütme yok, kaydırma yok — karenin tamamı diske oturur, çember en dış
    // kenardan alınır, üst/alt/sol/sağ siyah boşluklar 1. aşamadaki gibi korunur.
    ? { ...template.placement }
    : isEmbossMode
    ? detailedFaceOverlayPlacement(template.placement, template)
    : isSquareFaceArtwork
      ? {
          ...template.placement,
          // Tasarım, kare yüzeyin iç çerçeve çizgisinin dışına taşmasın diye
          // çok hafif içeri al.
          height: template.placement.height * SQUARE_FACE_ARTWORK_SCALE,
          width: template.placement.width * SQUARE_FACE_ARTWORK_SCALE,
        }
      : useDetailedRingSizingForMinimalist
        ? minimalistRingOverlayPlacement(template.placement, template)
      : {
          ...template.placement,
          centerY: (preserveFaceArtwork && !pasteFaceArtworkAsIs)
            ? template.placement.centerY + template.placement.height * 0.047
            : template.placement.centerY,
          height: template.placement.height * overlayScale,
          width: template.placement.width * overlayScale,
        };
  const overlayWidth = Math.round(overlayPlacement.width);
  const overlayHeight = Math.round(overlayPlacement.height);

  let overlayPng;
  if (isEmbossMode) {
    if (isSquareTemplateShape(template)) {
      overlayPng = await createDetailedFaceArtworkOverlay(effectiveSourceBuffer, overlayWidth, overlayHeight);
    } else {
      // Siyah kenar boşluklarını otomatik trim et → geriye beyaz çerçeve içeriği kalır,
      // sonra yüzeyden taşmayacak güvenli placement boyutuna stretch edilir.
      // pasteFaceArtworkAsIs (yuvarlak foto yüzük): trim YOK — kaynak olduğu gibi (siyah
      // boşluklarıyla) diske sığar; çember en dış kenardan alınır.
      const detailedSource = pasteFaceArtworkAsIs
        ? await sharp(effectiveSourceBuffer, { failOn: "none" })
            .rotate()
            .flatten({ background: "#000000" })
            .png()
            .toBuffer()
        : await prepareDetailedPendantOverlaySource(effectiveSourceBuffer, template);
      // Oranı koru (contain): kare-olmayan yüzde fit:"fill" tasarımı yüzün en-boyuna
      // gerdiriyordu (uzun-oval tasarım → yuvarlak yüz = yatay gerilme). contain ile
      // tasarım gerdirilmeden sığar; siyah dolgu emboss'ta kazınmış zemin olarak kalır
      // ve sonradan şekle (clipOverlayToTemplateShape) kırpılır.
      overlayPng = await sharp(detailedSource, { failOn: "none" })
        .rotate()
        .resize({ fit: "contain", background: "#000000", height: overlayHeight, width: overlayWidth })
        .png()
        .toBuffer();
    }
  } else if (preserveFaceArtwork) {
    overlayPng = await createFaceArtworkOverlay(sourceImageBuffer, overlayWidth, overlayHeight, pasteFaceArtworkAsIs);
  } else {
    const overlayEngraving = {
      ...engraving,
      ...(isMinimalistRectangularPendant
        ? {
            lineColor: "#101418",
            mask: {
              ...(engraving.mask || {}),
              alphaFloor: 4,
              backgroundCutoff: 232,
              blur: 0,
              gain: 2.8,
              gamma: 0.9,
              minDarkness: 0.08,
              threshold: 244,
            },
            opacity: 0.82,
          }
        : isMinimalistOvalPendant
          ? {
              lineColor: "#15191d",
              mask: {
                ...(engraving.mask || {}),
                alphaFloor: 5,
                backgroundCutoff: 230,
                blur: 0,
                gain: 2.55,
                gamma: 0.9,
                minDarkness: 0.08,
                threshold: 244,
              },
              opacity: 0.76,
            }
          : {}),
      clearFitFrameEdges: finishOptions.product === "yuzuk" || shouldAddPendantFinishFrame(template),
      artworkFit: shouldFillEngravingSurface(template) ? "fill" : "contain",
      fitFrame: effectiveHasMinimalistFitFrame,
      fitFrameShape: template.shape,
    };
    overlayPng = await createEngravingOverlay(sourceImageBuffer, overlayPlacement, overlayEngraving, index)
      .then((sourceOverlay) => sharp(sourceOverlay.buffer)
        .rotate(Number(engraving.rotation) || 0, {
          background: { alpha: 0, b: 0, g: 0, r: 0 },
        })
        .resize({
          background: { alpha: 0, b: 0, g: 0, r: 0 },
          fit: "contain",
          height: overlayHeight,
          width: overlayWidth,
        })
        .png()
        .toBuffer());
  }
  if (
    !isEmbossMode &&
    !preserveFaceArtwork &&
    effectiveHasMinimalistFitFrame &&
    shouldAddPendantFinishFrame(template)
  ) {
    overlayPng = await scaleOverlayContent(
      overlayPng,
      overlayWidth,
      overlayHeight,
      isMinimalistRectangularPendant
        ? MINIMALIST_RECTANGULAR_PENDANT_FRAMED_ARTWORK_SCALE
        : isMinimalistOvalPendant
          ? MINIMALIST_OVAL_PENDANT_FRAMED_ARTWORK_SCALE
        : MINIMALIST_PENDANT_FRAMED_ARTWORK_SCALE
    );
  }
  if (preserveFaceArtwork || isEmbossMode) {
    overlayPng = await knockoutBrightArtworkPixels(overlayPng);
  }
  // Detaylı (emboss) yüzde knockout sonrası geriye kalan ZEMİN (recess), eskizdeki
  // gibi SİYAH kalır — bilerek metal tonuna boyamıyoruz. Kullanıcı soldaki (eskiz)
  // siyahlığın sağdaki (ürün) görselde de birebir korunmasını istiyor; bu yüzden
  // eski "altın/mat metal zemine boyama" adımı kaldırıldı. Parlak tasarım pikselleri
  // knockout ile saydamdır (altta disk görünür), siyah zemin ise olduğu gibi kalır.

  const clippedOverlayPng = await clipOverlayToTemplateShape(overlayPng, overlayWidth, overlayHeight, template.shape);

  // Yüz-artwork yolunda tasarımın "beyaz" çizgileri = altta görünen metal disk.
  // Disk gümüş-gri (~213) olduğundan beyazlar kaynaktaki saf beyazdan daha koyu
  // okunuyordu. Sadece bu durumda diski hafifçe aydınlatıp beyazları yukarı
  // çekiyoruz; siyahlar üstteki opak overlay olduğundan etkilenmez.
  let finalTemplateBuffer = templateBuffer;
  if (preserveFaceArtwork && !isEmbossMode) {
    finalTemplateBuffer = await brightenFaceDiscSurface(templateBuffer, template, canvas);
  }

  const left = Math.round(overlayPlacement.centerX - overlayPlacement.width / 2);
  const top = Math.round(overlayPlacement.centerY - overlayPlacement.height / 2);
  const compositeLayers = [
    {
      blend: (preserveFaceArtwork || isEmbossMode || isMinimalistRectangularPendant || isMinimalistOvalPendant)
        ? "over"
        : engraving.blend || "multiply",
      input: clippedOverlayPng,
      left,
      top,
    },
  ];
  return sharp(finalTemplateBuffer)
    .resize(canvas.width, canvas.height, { fit: "cover" })
    .composite(compositeLayers)
    .png()
    .toBuffer();
}

async function shouldPreserveSourceAsFaceArtwork(sourceImageBuffer, template) {
  // Şekil gating yok — piksel analizinin kendisi karar verir
  const sample = await sharp(sourceImageBuffer, { failOn: "none" })
    .rotate()
    .flatten({ background: "#000000" })
    .resize({ fit: "inside", height: 96, width: 96 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = sample.info?.channels || 3;
  const pixelCount = Math.max(1, sample.data.length / channels);
  let darkCount = 0;
  let brightCount = 0;
  let lumaTotal = 0;

  for (let index = 0; index < sample.data.length; index += channels) {
    const luma =
      0.2126 * sample.data[index] +
      0.7152 * sample.data[index + 1] +
      0.0722 * sample.data[index + 2];
    lumaTotal += luma;
    if (luma < 60) darkCount += 1;
    if (luma > 185) brightCount += 1;
  }

  const darkRatio = darkCount / pixelCount;
  const brightRatio = brightCount / pixelCount;
  const meanLuma = lumaTotal / pixelCount;
  return darkRatio > 0.48 && brightRatio > 0.015 && meanLuma < 115;
}

async function sourceHasMinimalistFitFrame(sourceImageBuffer, shape) {
  const image = await sharp(sourceImageBuffer, { failOn: "none" })
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize({ fit: "inside", height: 512, width: 512 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = image.info?.channels || 3;
  const width = image.info?.width || 0;
  const height = image.info?.height || 0;
  if (!width || !height) return false;

  const bounds = darkPixelBounds(image.data, width, height, channels);
  if (!bounds || bounds.width < width * 0.34 || bounds.height < height * 0.34) return false;
  return shapeHasFitFrame(image.data, width, height, channels, bounds, shape);
}

function darkPixelBounds(data, width, height, channels) {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const luma =
        0.2126 * data[index] +
        0.7152 * data[index + 1] +
        0.0722 * data[index + 2];
      if (luma > 168) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return {
    bottom,
    height: Math.max(1, bottom - top + 1),
    left,
    right,
    top,
    width: Math.max(1, right - left + 1),
  };
}

function shapeHasFitFrame(data, width, height, channels, bounds, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  if (normalizedShape === "yuvarlak" || normalizedShape === "round" || normalizedShape === "oval" || normalizedShape === "vertical oval") {
    return roundedShapeHasFitFrame(data, width, height, channels, bounds);
  }
  return rectangularShapeHasFitFrame(data, width, height, channels, bounds);
}

function roundedShapeHasFitFrame(data, width, height, channels, bounds) {
  const binCount = 48;
  const bins = new Uint16Array(binCount);
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const radiusX = Math.max(1, bounds.width / 2);
  const radiusY = Math.max(1, bounds.height / 2);

  for (let y = bounds.top; y <= bounds.bottom; y += 1) {
    for (let x = bounds.left; x <= bounds.right; x += 1) {
      const index = (y * width + x) * channels;
      const luma =
        0.2126 * data[index] +
        0.7152 * data[index + 1] +
        0.0722 * data[index + 2];
      if (luma > 168) continue;
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      const ellipseDistance = normalizedX * normalizedX + normalizedY * normalizedY;
      if (ellipseDistance < 0.68 || ellipseDistance > 1.14) continue;
      const angle = Math.atan2(normalizedY, normalizedX);
      const bin = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * binCount) % binCount;
      bins[bin] += 1;
    }
  }

  const minBinPixels = Math.max(2, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const coveredBins = Array.from(bins).filter((count) => count >= minBinPixels).length;
  return coveredBins / binCount >= 0.58;
}

function rectangularShapeHasFitFrame(data, width, height, channels, bounds) {
  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.09));
  const topSpan = edgeDarkSpan(data, width, channels, bounds.left, bounds.top, bounds.width, band, "x");
  const bottomSpan = edgeDarkSpan(data, width, channels, bounds.left, bounds.bottom - band + 1, bounds.width, band, "x");
  const leftSpan = edgeDarkSpan(data, width, channels, bounds.left, bounds.top, band, bounds.height, "y");
  const rightSpan = edgeDarkSpan(data, width, channels, bounds.right - band + 1, bounds.top, band, bounds.height, "y");
  return (
    topSpan / bounds.width >= 0.54 &&
    bottomSpan / bounds.width >= 0.54 &&
    leftSpan / bounds.height >= 0.54 &&
    rightSpan / bounds.height >= 0.54
  );
}

function edgeDarkSpan(data, imageWidth, channels, startX, startY, width, height, axis) {
  let min = Infinity;
  let max = -Infinity;
  for (let y = startY; y < startY + height; y += 1) {
    for (let x = startX; x < startX + width; x += 1) {
      const index = (y * imageWidth + x) * channels;
      const luma =
        0.2126 * data[index] +
        0.7152 * data[index + 1] +
        0.0722 * data[index + 2];
      if (luma > 168) continue;
      const coordinate = axis === "x" ? x : y;
      min = Math.min(min, coordinate);
      max = Math.max(max, coordinate);
    }
  }
  return Number.isFinite(min) && max >= min ? max - min + 1 : 0;
}

async function createDetailedFaceArtworkOverlay(sourceImageBuffer, width, height) {
  const preparedArtwork = await sharp(sourceImageBuffer, { failOn: "none" })
    .rotate()
    .flatten({ background: "#000000" })
    .png()
    .toBuffer();
  const frameCrop = await detectDetailedSquareFrameCrop(preparedArtwork);
  let image = sharp(preparedArtwork, { failOn: "none" });
  if (frameCrop) {
    image = image.extract(frameCrop);
  }

  const resized = await image
    .resize({
      background: "#000000",
      fit: "contain",
      height,
      position: "center",
      width,
    })
    .png()
    .toBuffer();
  const resizedRaw = await sharp(resized, { failOn: "none" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bounds = brightPixelBounds(
    resizedRaw.data,
    resizedRaw.info,
    DETAILED_SQUARE_ARTWORK_ALIGN_THRESHOLD
  );
  const shiftY = bounds
    ? clamp(height - 1 - bounds.bottom, 0, Math.round(height * 0.16))
    : 0;
  if (shiftY <= 0) return resized;

  return sharp({
    create: {
      background: { alpha: 1, b: 0, g: 0, r: 0 },
      channels: 4,
      height,
      width,
    },
  })
    .composite([{ input: resized, left: 0, top: shiftY }])
    .png()
    .toBuffer();
}

async function prepareDetailedPendantOverlaySource(sourceImageBuffer, template = {}) {
  const trimmed = await sharp(sourceImageBuffer, { failOn: "none" })
    .rotate()
    .trim({ background: "#000000", threshold: 30 })
    .png()
    .toBuffer({ resolveWithObject: true });

  if (!isOvalPendantPhotoTemplate(template)) return trimmed.data;

  if (DETAILED_OVAL_PENDANT_SOURCE_PADDING_RATIO <= 0) return trimmed.data;

  const padX = Math.round((trimmed.info?.width || 1) * DETAILED_OVAL_PENDANT_SOURCE_PADDING_RATIO);
  const padY = Math.round((trimmed.info?.height || 1) * DETAILED_OVAL_PENDANT_SOURCE_PADDING_RATIO);
  return sharp(trimmed.data, { failOn: "none" })
    .extend({
      background: "#000000",
      bottom: padY,
      left: padX,
      right: padX,
      top: padY,
    })
    .png()
    .toBuffer();
}

async function detectDetailedSquareFrameCrop(sourceImageBuffer) {
  const image = await sharp(sourceImageBuffer, { failOn: "none" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const frameBounds = squareFrameLineBounds(image.data, image.info);
  if (frameBounds) {
    return squareCropAroundBounds(frameBounds, image.info.width || 1, image.info.height || 1, 0);
  }

  const bounds = brightPixelBounds(image.data, image.info, DETAILED_SQUARE_FRAME_LUMA_THRESHOLD);
  if (!bounds) return null;

  const width = image.info.width || 1;
  const height = image.info.height || 1;
  const sideRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
  if (bounds.width < width * 0.52 || bounds.height < height * 0.52 || sideRatio < 0.82) {
    return null;
  }
  if (!looksLikeSquareFrame(image.data, image.info, bounds)) {
    return null;
  }

  const padding = Math.max(0, Math.round(Math.min(bounds.width, bounds.height) * DETAILED_SQUARE_FRAME_PADDING_RATIO));
  return squareCropAroundBounds(bounds, width, height, padding);
}

function squareFrameLineBounds(data, info) {
  for (const threshold of DETAILED_SQUARE_FRAME_SCAN_THRESHOLDS) {
    const bounds = squareFrameLineBoundsAtThreshold(data, info, threshold);
    if (bounds) return bounds;
  }
  return null;
}

function squareFrameLineBoundsAtThreshold(data, info, threshold) {
  const width = info.width || 0;
  const height = info.height || 0;
  const channels = info.channels || 4;
  if (width < 1 || height < 1) return null;

  const rowCoverage = new Float32Array(height);
  const colCoverage = new Float32Array(width);
  for (let y = 0; y < height; y += 1) {
    let bright = 0;
    for (let x = 0; x < width; x += 1) {
      if (pixelAboveThreshold(data, width, channels, x, y, threshold)) bright += 1;
    }
    rowCoverage[y] = bright / width;
  }
  for (let x = 0; x < width; x += 1) {
    let bright = 0;
    for (let y = 0; y < height; y += 1) {
      if (pixelAboveThreshold(data, width, channels, x, y, threshold)) bright += 1;
    }
    colCoverage[x] = bright / height;
  }

  const rows = coverageClusters(rowCoverage, DETAILED_SQUARE_FRAME_MIN_LINE_RATIO);
  const cols = coverageClusters(colCoverage, DETAILED_SQUARE_FRAME_MIN_LINE_RATIO);
  let best = null;

  for (const top of rows.filter((cluster) => cluster.center < height * 0.45)) {
    for (const bottom of rows.filter((cluster) => cluster.center > height * 0.55)) {
      for (const left of cols.filter((cluster) => cluster.center < width * 0.45)) {
        for (const right of cols.filter((cluster) => cluster.center > width * 0.55)) {
          const candidate = {
            bottom: bottom.end,
            left: left.start,
            right: right.end,
            top: top.start,
          };
          candidate.width = candidate.right - candidate.left + 1;
          candidate.height = candidate.bottom - candidate.top + 1;
          if (!squareFrameCandidateLooksValid(data, info, candidate, threshold)) continue;
          const area = candidate.width * candidate.height;
          if (!best || area > best.area) best = { ...candidate, area };
        }
      }
    }
  }

  return best ? imageBoundsToSize(best) : null;
}

function coverageClusters(coverage, minRatio) {
  const clusters = [];
  let start = -1;
  let peak = 0;

  for (let index = 0; index <= coverage.length; index += 1) {
    const value = index < coverage.length ? coverage[index] : 0;
    if (value >= minRatio) {
      if (start < 0) {
        start = index;
        peak = value;
      } else {
        peak = Math.max(peak, value);
      }
      continue;
    }

    if (start >= 0) {
      const end = index - 1;
      clusters.push({
        center: (start + end) / 2,
        end,
        peak,
        start,
      });
      start = -1;
      peak = 0;
    }
  }

  return clusters;
}

function squareFrameCandidateLooksValid(data, info, bounds, threshold) {
  const width = info.width || 0;
  const height = info.height || 0;
  const sideRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
  if (
    bounds.width < width * DETAILED_SQUARE_FRAME_MIN_SIDE_RATIO ||
    bounds.height < height * DETAILED_SQUARE_FRAME_MIN_SIDE_RATIO ||
    sideRatio < 0.82
  ) {
    return false;
  }

  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const minEdgeCoverage = 0.5;
  const edgesCovered =
    maxHorizontalLineCoverage(data, info, bounds.left, bounds.top, bounds.width, band, threshold) >= minEdgeCoverage &&
    maxHorizontalLineCoverage(data, info, bounds.left, bounds.bottom - band + 1, bounds.width, band, threshold) >= minEdgeCoverage &&
    maxVerticalLineCoverage(data, info, bounds.left, bounds.top, band, bounds.height, threshold) >= minEdgeCoverage &&
    maxVerticalLineCoverage(data, info, bounds.right - band + 1, bounds.top, band, bounds.height, threshold) >= minEdgeCoverage;
  if (!edgesCovered) return false;

  const cornerSize = Math.max(5, Math.round(band * 1.6));
  return (
    cornerHasFrameInk(data, info, bounds.left, bounds.top, cornerSize, threshold) &&
    cornerHasFrameInk(data, info, bounds.right, bounds.top, cornerSize, threshold) &&
    cornerHasFrameInk(data, info, bounds.left, bounds.bottom, cornerSize, threshold) &&
    cornerHasFrameInk(data, info, bounds.right, bounds.bottom, cornerSize, threshold)
  );
}

function maxHorizontalLineCoverage(data, info, left, top, width, height, threshold) {
  const imageWidth = info.width || 0;
  const imageHeight = info.height || 0;
  const channels = info.channels || 4;
  const startX = clamp(Math.round(left), 0, imageWidth);
  const endX = clamp(Math.round(left + width), 0, imageWidth);
  const startY = clamp(Math.round(top), 0, imageHeight);
  const endY = clamp(Math.round(top + height), 0, imageHeight);
  let maxCoverage = 0;

  for (let y = startY; y < endY; y += 1) {
    let bright = 0;
    for (let x = startX; x < endX; x += 1) {
      if (pixelAboveThreshold(data, imageWidth, channels, x, y, threshold)) bright += 1;
    }
    maxCoverage = Math.max(maxCoverage, bright / Math.max(1, endX - startX));
  }

  return maxCoverage;
}

function maxVerticalLineCoverage(data, info, left, top, width, height, threshold) {
  const imageWidth = info.width || 0;
  const imageHeight = info.height || 0;
  const channels = info.channels || 4;
  const startX = clamp(Math.round(left), 0, imageWidth);
  const endX = clamp(Math.round(left + width), 0, imageWidth);
  const startY = clamp(Math.round(top), 0, imageHeight);
  const endY = clamp(Math.round(top + height), 0, imageHeight);
  let maxCoverage = 0;

  for (let x = startX; x < endX; x += 1) {
    let bright = 0;
    for (let y = startY; y < endY; y += 1) {
      if (pixelAboveThreshold(data, imageWidth, channels, x, y, threshold)) bright += 1;
    }
    maxCoverage = Math.max(maxCoverage, bright / Math.max(1, endY - startY));
  }

  return maxCoverage;
}

function cornerHasFrameInk(data, info, x, y, size, threshold) {
  const imageWidth = info.width || 0;
  const imageHeight = info.height || 0;
  const channels = info.channels || 4;
  const half = Math.max(2, Math.round(size / 2));
  const startX = clamp(Math.round(x) - half, 0, imageWidth);
  const endX = clamp(Math.round(x) + half + 1, 0, imageWidth);
  const startY = clamp(Math.round(y) - half, 0, imageHeight);
  const endY = clamp(Math.round(y) + half + 1, 0, imageHeight);
  let bright = 0;

  for (let yy = startY; yy < endY; yy += 1) {
    for (let xx = startX; xx < endX; xx += 1) {
      if (pixelAboveThreshold(data, imageWidth, channels, xx, yy, threshold)) bright += 1;
    }
  }

  return bright >= Math.max(2, Math.round(size * 0.4));
}

function pixelAboveThreshold(data, imageWidth, channels, x, y, threshold) {
  const index = (y * imageWidth + x) * channels;
  const alpha = channels > 3 ? data[index + 3] : 255;
  if (alpha < 24) return false;
  const luma =
    0.2126 * data[index] +
    0.7152 * data[index + 1] +
    0.0722 * data[index + 2];
  return luma >= threshold;
}

function imageBoundsToSize(bounds) {
  return {
    bottom: bounds.bottom,
    height: bounds.bottom - bounds.top + 1,
    left: bounds.left,
    right: bounds.right,
    top: bounds.top,
    width: bounds.right - bounds.left + 1,
  };
}

function brightPixelBounds(data, info, threshold) {
  const width = info.width || 0;
  const height = info.height || 0;
  const channels = info.channels || 4;
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const alpha = channels > 3 ? data[index + 3] : 255;
      if (alpha < 24) continue;
      const luma =
        0.2126 * data[index] +
        0.7152 * data[index + 1] +
        0.0722 * data[index + 2];
      if (luma < threshold) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return {
    bottom,
    height: bottom - top + 1,
    left,
    right,
    top,
    width: right - left + 1,
  };
}

function looksLikeSquareFrame(data, info, bounds) {
  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const requiredRatio = 0.18;
  return (
    brightBandRatio(data, info, bounds.left, bounds.top, bounds.width, band) > requiredRatio &&
    brightBandRatio(data, info, bounds.left, bounds.bottom - band + 1, bounds.width, band) > requiredRatio &&
    brightBandRatio(data, info, bounds.left, bounds.top, band, bounds.height) > requiredRatio &&
    brightBandRatio(data, info, bounds.right - band + 1, bounds.top, band, bounds.height) > requiredRatio
  );
}

function brightBandRatio(data, info, left, top, width, height) {
  const imageWidth = info.width || 0;
  const imageHeight = info.height || 0;
  const channels = info.channels || 4;
  const startX = clamp(Math.round(left), 0, imageWidth);
  const startY = clamp(Math.round(top), 0, imageHeight);
  const endX = clamp(Math.round(left + width), 0, imageWidth);
  const endY = clamp(Math.round(top + height), 0, imageHeight);
  let bright = 0;
  let total = 0;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * imageWidth + x) * channels;
      const alpha = channels > 3 ? data[index + 3] : 255;
      if (alpha < 24) continue;
      const luma =
        0.2126 * data[index] +
        0.7152 * data[index + 1] +
        0.0722 * data[index + 2];
      if (luma >= DETAILED_SQUARE_FRAME_LUMA_THRESHOLD) bright += 1;
      total += 1;
    }
  }

  return total > 0 ? bright / total : 0;
}

function squareCropAroundBounds(bounds, imageWidth, imageHeight, padding) {
  const targetSide = Math.min(
    Math.max(bounds.width, bounds.height) + padding * 2,
    imageWidth,
    imageHeight
  );
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const left = clamp(Math.round(centerX - targetSide / 2), 0, imageWidth - targetSide);
  const top = clamp(Math.round(centerY - targetSide / 2), 0, imageHeight - targetSide);
  return {
    height: Math.round(targetSide),
    left,
    top,
    width: Math.round(targetSide),
  };
}

async function createFaceArtworkOverlay(sourceImageBuffer, width, height, pasteAsIs = false) {
  // pasteAsIs (yuvarlak foto yüzük): kaynağı OLDUĞU GİBİ bırak — trim/extend yok, böylece
  // 1. aşamadaki kadraj korunur ve çember karenin en dış kenarından alınır. Aksi halde
  // siyah kenarları trim edip yeniden sığdırmak içeriği ortadan yakınlaştırılmış gösterir.
  let pipe = sharp(sourceImageBuffer, { failOn: "none" })
    .rotate()
    .flatten({ background: "#000000" });
  if (!pasteAsIs) {
    pipe = pipe
      .trim({ background: "#000000", threshold: 12 })
      .extend({ background: "#000000", bottom: 18, left: 18, right: 18, top: 18 });
  }
  const croppedArtwork = await pipe.png().toBuffer();
  const prepared = await sharp(croppedArtwork, { failOn: "none" })
    .resize({
      background: "#000000",
      fit: "contain",
      height,
      width,
    })
    // Tasarımın açık tonlarını yukarı çek: yüzeydeki "beyaz" çizgiler ring'in
    // metal diskinden okunur (knockout-reveal). linear ile highlight'ları 232+
    // bandına itip siyahları koruyoruz; aksi halde orta-açık tonlar kısmi
    // saydam kalıp grileşiyor (2. aşamada görsel kararıyordu).
    .linear(FACE_ARTWORK_CONTRAST, FACE_ARTWORK_OFFSET)
    .png()
    .toBuffer();

  return sharp({
    create: {
      background: { alpha: 1, b: 0, g: 0, r: 0 },
      channels: 4,
      height,
      width,
    },
  })
    .composite([{ input: prepared, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function knockoutBrightArtworkPixels(imageBuffer) {
  const fadeStart = 170;
  const fadeEnd = 232;
  const fadeRange = fadeEnd - fadeStart;
  const image = await sharp(imageBuffer, { failOn: "none" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(image.data);
  const channels = image.info?.channels || 4;

  for (let index = 0; index < pixels.length; index += channels) {
    const alphaIndex = index + 3;
    const alpha = pixels[alphaIndex];
    if (alpha <= 0) continue;

    const luma =
      0.2126 * pixels[index] +
      0.7152 * pixels[index + 1] +
      0.0722 * pixels[index + 2];
    if (luma <= fadeStart) continue;

    const alphaScale = clamp((fadeEnd - luma) / fadeRange, 0, 1);
    pixels[alphaIndex] = alphaScale <= 0.015 ? 0 : Math.round(alpha * alphaScale);
  }

  return sharp(pixels, {
    raw: {
      channels,
      height: image.info.height,
      width: image.info.width,
    },
  })
    .png()
    .toBuffer();
}

async function clipOverlayToTemplateShape(overlayBuffer, width, height, shape) {
  const shapeMask = overlayShapeMaskSvg(width, height, shape);
  if (!shapeMask) return overlayBuffer;

  return sharp(overlayBuffer)
    .ensureAlpha()
    .composite([{ blend: "dest-in", input: Buffer.from(shapeMask) }])
    .png()
    .toBuffer();
}

function overlayShapeMaskSvg(width, height, shape) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const normalizedShape = String(shape || "").trim().toLowerCase();
  let shapeNode = "";

  if (normalizedShape === "yuvarlak" || normalizedShape === "round") {
    const radius = Math.min(safeWidth, safeHeight) / 2;
    shapeNode = `<circle cx="${safeWidth / 2}" cy="${safeHeight / 2}" r="${radius}" fill="#fff"/>`;
  } else if (normalizedShape === "oval" || normalizedShape === "vertical oval") {
    shapeNode = `<ellipse cx="${safeWidth / 2}" cy="${safeHeight / 2}" rx="${safeWidth / 2}" ry="${safeHeight / 2}" fill="#fff"/>`;
  } else if (normalizedShape === "kare" || normalizedShape === "square" || normalizedShape === "dikdortgen") {
    const radius = overlayCornerRadius(safeWidth, safeHeight, normalizedShape);
    shapeNode = `<rect x="0" y="0" width="${safeWidth}" height="${safeHeight}" rx="${radius}" ry="${radius}" fill="#fff"/>`;
  }

  if (!shapeNode) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">${shapeNode}</svg>`;
}

function overlayCornerRadius(width, height, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  const maxRadius = normalizedShape === "dikdortgen" || normalizedShape === "rectangular"
    ? RECTANGULAR_OVERLAY_CORNER_RADIUS
    : SQUARE_OVERLAY_CORNER_RADIUS;
  return Math.min(maxRadius, width * 0.035, height * 0.035);
}

function shouldAddPendantFinishFrame(template = {}) {
  if (template.product !== "kolye") return false;
  return !isSquareTemplateShape(template);
}

async function scaleOverlayContent(buffer, width, height, scale) {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const safeScale = clamp(Number(scale) || 1, 1, 1.4);
  if (safeScale <= 1) return buffer;

  const scaledWidth = Math.max(safeWidth, Math.round(safeWidth * safeScale));
  const scaledHeight = Math.max(safeHeight, Math.round(safeHeight * safeScale));
  const left = Math.max(0, Math.round((scaledWidth - safeWidth) / 2));
  const top = Math.max(0, Math.round((scaledHeight - safeHeight) / 2));

  return sharp(buffer, { failOn: "none" })
    .ensureAlpha()
    .resize({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: "fill",
      height: scaledHeight,
      width: scaledWidth,
    })
    .extract({ height: safeHeight, left, top, width: safeWidth })
    .png()
    .toBuffer();
}

async function createEngravingOverlay(sourceImageBuffer, placement, engraving, index) {
  const opacity = clamp(Number(engraving.opacity ?? STAGE_TWO_FULL_OPACITY), STAGE_TWO_MIN_OPACITY, STAGE_TWO_FULL_OPACITY);
  const width = Math.max(1, Math.round(placement.width));
  const height = Math.max(1, Math.round(placement.height));
  const maskOptions = engraving.mask || {};
  const sourcePadding = engraving.fitFrame ? 0 : ENGRAVING_SOURCE_PADDING;
  const preparedSource = await sharp(sourceImageBuffer, { failOn: "none" })
    .rotate()
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: ENGRAVING_SOURCE_TRIM_THRESHOLD })
    .extend({
      background: "#ffffff",
      bottom: sourcePadding,
      left: sourcePadding,
      right: sourcePadding,
      top: sourcePadding,
    })
    .png()
    .toBuffer();

  const input = sharp(preparedSource, { failOn: "none" })
    .resize({
      background: "#ffffff",
      fit: engraving.artworkFit === "fill" ? "fill" : "contain",
      height,
      width,
    })
    .grayscale();

  const gray = await input
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rawGrayBuffer = gray.data;
  const grayChannels = gray.info?.channels || 1;
  const threshold = clamp(Number(maskOptions.threshold) || 238, 80, 255);
  const gain = clamp(Number(maskOptions.gain) || 1.85, 0.2, 4);
  const gamma = clamp(Number(maskOptions.gamma) || 1, 0.2, 4);
  const backgroundCutoff = clamp(
    Number(maskOptions.backgroundCutoff) || ENGRAVING_BACKGROUND_CUTOFF,
    120,
    245
  );
  const minDarkness = clamp(
    Number(maskOptions.minDarkness) || ENGRAVING_MIN_DARKNESS,
    0,
    0.5
  );
  const baseMaskBuffer = Buffer.alloc(width * height);
  for (let pixelIndex = 0; pixelIndex < baseMaskBuffer.length; pixelIndex += 1) {
    const value = rawGrayBuffer[pixelIndex * grayChannels] || 0;
    const darkness = Math.pow(clamp(((threshold - value) / threshold) * gain, 0, 1), gamma);
    baseMaskBuffer[pixelIndex] = value >= backgroundCutoff || darkness <= minDarkness
      ? 0
      : Math.round(255 * darkness);
  }
  const blurredMask = await applyOptionalBlur(
    sharp(baseMaskBuffer, { raw: { channels: 1, height, width } }),
    normalizeBlurSigma(maskOptions.blur, 0.3)
  )
    .raw()
    .toBuffer({ resolveWithObject: true });
  const blurredMaskChannels = blurredMask.info?.channels || 1;
  const alphaFloor = clamp(Number(maskOptions.alphaFloor) || ENGRAVING_ALPHA_FLOOR, 0, 64);
  const rawMaskBuffer = Buffer.alloc(width * height);
  for (let pixelIndex = 0; pixelIndex < rawMaskBuffer.length; pixelIndex += 1) {
    const value = blurredMask.data[pixelIndex * blurredMaskChannels] || 0;
    rawMaskBuffer[pixelIndex] = value <= alphaFloor ? 0 : value;
  }
  if (engraving.fitFrame && engraving.clearFitFrameEdges) {
    clearFitFrameMaskEdges(rawMaskBuffer, width, height, engraving.fitFrameShape);
  }
  const maskBuffer = Buffer.alloc(rawMaskBuffer.length);
  for (let pixelIndex = 0; pixelIndex < rawMaskBuffer.length; pixelIndex += 1) {
    maskBuffer[pixelIndex] = Math.round(rawMaskBuffer[pixelIndex] * opacity);
  }
  const mask = { data: maskBuffer, raw: { channels: 1, height, width } };

  const lineColor = parseHexColor(engraving.lineColor, { b: 12, g: 24, r: 35 });
  const lineLayer = await solidRgbaLayer({ ...lineColor, alpha: 1 }, width, height)
    .joinChannel(mask.data, { raw: mask.raw })
    .png()
    .toBuffer();

  const layers = [];
  const shadow = engraving.shadow || {};
  const shadowOpacity = clamp(Number(shadow.opacity) || 0, 0, 0.55);
  if (shadowOpacity > 0) {
    layers.push({
      input: await makeAlphaEffectLayer({
        alphaScale: shadowOpacity,
        blur: clamp(Number(shadow.blur) || 0.8, 0, 4),
        color: { b: 6, g: 10, r: 14 },
        height,
        mask,
        width,
      }),
      left: Math.max(0, Math.round(Number(shadow.offsetX) || 1)),
      top: Math.max(0, Math.round(Number(shadow.offsetY) || 1)),
    });
  }
  layers.push({ input: lineLayer, left: 0, top: 0 });

  const highlight = engraving.highlight || {};
  const highlightOpacity = clamp(Number(highlight.opacity) || 0, 0, 0.35);
  if (highlightOpacity > 0) {
    layers.push({
      input: await makeAlphaEffectLayer({
        alphaScale: highlightOpacity,
        blur: clamp(Number(highlight.blur) || 0.3, 0, 2),
        color: { b: 205, g: 238, r: 255 },
        height,
        mask,
        width,
      }),
      left: 0,
      top: 0,
    });
  }

  const buffer = await transparentCanvas(width, height)
    .composite(layers)
    .png()
    .toBuffer();

  return { buffer };
}

function clearFitFrameMaskEdges(maskBuffer, width, height, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  if (["yuvarlak", "round", "oval", "vertical oval"].includes(normalizedShape)) {
    clearRoundedFitFrameMaskEdge(maskBuffer, width, height);
    return;
  }
  if (!["kare", "square", "dikdortgen", "rectangular"].includes(normalizedShape)) return;

  const band = Math.max(4, Math.round(Math.min(width, height) * PHOTO_TEMPLATE_FIT_FRAME_CLEAR_EDGE_RATIO));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x >= band && x < width - band && y >= band && y < height - band) continue;
      maskBuffer[y * width + x] = 0;
    }
  }
}

function clearRoundedFitFrameMaskEdge(maskBuffer, width, height) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const radiusX = safeWidth / 2;
  const radiusY = safeHeight / 2;
  const centerX = (safeWidth - 1) / 2;
  const centerY = (safeHeight - 1) / 2;
  const band = Math.max(4, Math.min(safeWidth, safeHeight) * PHOTO_TEMPLATE_FIT_FRAME_CLEAR_EDGE_RATIO);
  const innerRadius = Math.max(0, 1 - band / Math.max(1, Math.min(radiusX, radiusY)));
  const innerDistance = innerRadius * innerRadius;

  for (let y = 0; y < safeHeight; y += 1) {
    for (let x = 0; x < safeWidth; x += 1) {
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      if (normalizedX * normalizedX + normalizedY * normalizedY < innerDistance) continue;
      maskBuffer[y * safeWidth + x] = 0;
    }
  }
}

function normalizeTemplateConfig(template, key, finishOptions = {}) {
  if (!template || typeof template !== "object") return null;
  const placement = template.placement && typeof template.placement === "object"
    ? template.placement
    : template;

  return {
    engraving: template.engraving && typeof template.engraving === "object" ? template.engraving : {},
    file: typeof template.file === "string" ? template.file : "",
    key,
    label: String(template.label || key || "Ürün kalıbı"),
    measure: String(template.measure || ""),
    product: finishOptions.product || "yuzuk",
    shape: String(template.shape || key?.split("-")[0] || "kare"),
    size: String(template.size || key?.split("-")[1] || "S").toUpperCase(),
    placement: {
      centerX: Number(placement.centerX) || 512,
      centerY: Number(placement.centerY) || 384,
      height: Math.max(1, Number(placement.height) || 320),
      width: Math.max(1, Number(placement.width) || 320),
    },
  };
}

async function centerPendantTemplateIfNeeded(templateBuffer, template, canvas) {
  if (template.product !== "kolye" || !template.file) {
    return { templateBuffer, template };
  }

  const width = Math.max(1, Math.round(Number(canvas.width) || 1024));
  const height = Math.max(1, Math.round(Number(canvas.height) || 1024));
  const sideWidth = Math.round(width / 2);
  const placement = template.placement || {};
  const sourceLeft = placement.centerX > sideWidth ? width - sideWidth : 0;
  const targetLeft = Math.round((width - sideWidth) / 2);

  const normalizedTemplateBuffer = await sharp(templateBuffer, { failOn: "none" })
    .resize(width, height, { fit: "cover" })
    .png()
    .toBuffer();
  const selectedPendantBuffer = await sharp(normalizedTemplateBuffer, { failOn: "none" })
    .extract({ height, left: sourceLeft, top: 0, width: sideWidth })
    .png()
    .toBuffer();
  const centeredTemplateBuffer = await sharp({
    create: {
      background: "#ffffff",
      channels: 3,
      height,
      width,
    },
  })
    .composite([{ input: selectedPendantBuffer, left: targetLeft, top: 0 }])
    .png()
    .toBuffer();

  return {
    templateBuffer: centeredTemplateBuffer,
    template: {
      ...template,
      placement: {
        ...placement,
        centerX: placement.centerX - sourceLeft + targetLeft,
      },
    },
  };
}

async function smoothTemplateSurfaceIfNeeded(templateBuffer, template, canvas) {
  if (!template.file || !template.placement) return templateBuffer;

  const width = Math.max(1, Math.round(Number(canvas.width) || 1024));
  const height = Math.max(1, Math.round(Number(canvas.height) || 1024));
  const placement = template.placement;
  const surfaceWidth = Math.max(1, Math.round(placement.width * TEMPLATE_SURFACE_SMOOTH_SCALE));
  const surfaceHeight = Math.max(1, Math.round(placement.height * TEMPLATE_SURFACE_SMOOTH_SCALE));
  const left = Math.max(0, Math.min(width - surfaceWidth, Math.round(placement.centerX - surfaceWidth / 2)));
  const top = Math.max(0, Math.min(height - surfaceHeight, Math.round(placement.centerY - surfaceHeight / 2)));
  const normalizedTemplate = await sharp(templateBuffer, { failOn: "none" })
    .resize(width, height, { fit: "cover" })
    .png()
    .toBuffer();
  const smoothedSurface = await sharp(normalizedTemplate, { failOn: "none" })
    .extract({ height: surfaceHeight, left, top, width: surfaceWidth })
    .blur(TEMPLATE_SURFACE_SMOOTH_BLUR)
    .png()
    .toBuffer();
  const surfaceMask = overlayShapeMaskSvg(surfaceWidth, surfaceHeight, template.shape);
  if (!surfaceMask) return normalizedTemplate;

  const clippedSurface = await sharp(smoothedSurface, { failOn: "none" })
    .ensureAlpha()
    .composite([{ blend: "dest-in", input: Buffer.from(surfaceMask) }])
    .png()
    .toBuffer();

  return sharp(normalizedTemplate, { failOn: "none" })
    .composite([{ input: clippedSurface, left, top }])
    .png()
    .toBuffer();
}

async function brightenFaceDiscSurface(templateBuffer, template, canvas) {
  if (!template.placement) return templateBuffer;

  const width = Math.max(1, Math.round(Number(canvas.width) || 1024));
  const height = Math.max(1, Math.round(Number(canvas.height) || 1024));
  const placement = template.placement;
  const discWidth = Math.max(1, Math.round(placement.width));
  const discHeight = Math.max(1, Math.round(placement.height));
  const left = Math.max(0, Math.min(width - discWidth, Math.round(placement.centerX - discWidth / 2)));
  const top = Math.max(0, Math.min(height - discHeight, Math.round(placement.centerY - discHeight / 2)));

  const normalizedTemplate = await sharp(templateBuffer, { failOn: "none" })
    .resize(width, height, { fit: "cover" })
    .png()
    .toBuffer();
  const discMaskSvg = overlayShapeMaskSvg(discWidth, discHeight, template.shape);
  if (!discMaskSvg) return normalizedTemplate;

  // Sert daire kenarı oluşmasın diye maskeyi hafifçe yumuşat (feather).
  const featheredMask = await sharp(Buffer.from(discMaskSvg))
    .blur(FACE_DISC_MASK_FEATHER)
    .toColourspace("b-w")
    .png()
    .toBuffer();
  const brightenedDisc = await sharp(normalizedTemplate, { failOn: "none" })
    .extract({ height: discHeight, left, top, width: discWidth })
    .modulate({ brightness: FACE_DISC_BRIGHTEN })
    .ensureAlpha()
    .composite([{ blend: "dest-in", input: featheredMask }])
    .png()
    .toBuffer();

  return sharp(normalizedTemplate, { failOn: "none" })
    .composite([{ input: brightenedDisc, left, top }])
    .png()
    .toBuffer();
}

function buildDynamicTemplateConfig(finishOptions = {}) {
  const product = finishOptions.product || "yuzuk";
  const shape = finishOptions.productShape || "yuvarlak";
  const isPendant = product === "kolye";
  const placementByShape = {
    dikdortgen: { centerX: 512, centerY: isPendant ? 538 : 396, height: isPendant ? 452 : 440, width: isPendant ? 332 : 324 },
    kare: { centerX: 512, centerY: isPendant ? 538 : 396, height: isPendant ? 336 : 332, width: isPendant ? 336 : 332 },
    oval: { centerX: 512, centerY: isPendant ? 548 : 402, height: isPendant ? 420 : 386, width: isPendant ? 292 : 280 },
    yuvarlak: { centerX: 512, centerY: isPendant ? 538 : 400, height: isPendant ? 356 : 350, width: isPendant ? 356 : 350 },
  };

  return {
    engraving: {
      blend: "over",
      mask: {
        alphaFloor: ENGRAVING_ALPHA_FLOOR,
        backgroundCutoff: ENGRAVING_BACKGROUND_CUTOFF,
        blur: 0.18,
        gain: 2.15,
        gamma: 1,
        minDarkness: ENGRAVING_MIN_DARKNESS,
        threshold: 224,
      },
      opacity: finishOptions.designMode === "emboss" ? 0.44 : 0.58,
      scale: isPendant ? 0.82 : 0.86,
      shadow: { blur: 0.8, offsetX: 1, offsetY: 1, opacity: 0.12 },
      highlight: { blur: 0.35, offsetX: -1, offsetY: -1, opacity: 0.12 },
    },
    file: "",
    key: `${product}-${shape}`,
    label: `${SHAPE_OPTIONS[shape]?.label || "Yuvarlak"} ${PRODUCT_OPTIONS[product]?.label || "Ürün"}`,
    measure: "",
    product,
    shape,
    size: "",
    placement: placementByShape[shape] || placementByShape.yuvarlak,
  };
}

function mergeEngravingConfig(defaults = {}, overrides = {}) {
  return {
    ...defaults,
    ...overrides,
    highlight: {
      ...(defaults.highlight || {}),
      ...(overrides.highlight || {}),
    },
    mask: {
      ...(defaults.mask || {}),
      ...(overrides.mask || {}),
    },
    shadow: {
      ...(defaults.shadow || {}),
      ...(overrides.shadow || {}),
    },
  };
}

function engravingSurfaceScale(engraving = {}, template = {}, finishOptions = {}, options = {}) {
  const requestedScale = Number(engraving.scale);
  const isPhotoTemplate = isPhotoTemplateConfig(template);
  const baseScale = Number.isFinite(requestedScale)
    ? requestedScale
    : 1;
  if (isPhotoTemplate && finishOptions.designMode !== "emboss") {
    if (options.hasFitFrame) {
      return clamp(Math.max(baseScale, PHOTO_TEMPLATE_MINIMALIST_FIT_FRAME_SCALE), 0.2, PHOTO_TEMPLATE_MINIMALIST_FIT_FRAME_SCALE);
    }
    const maxScale = template.product === "kolye"
      ? isSquareTemplateShape(template)
        ? PHOTO_TEMPLATE_MINIMALIST_SQUARE_PENDANT_SCALE
        : PHOTO_TEMPLATE_MINIMALIST_PENDANT_SCALE
      : PHOTO_TEMPLATE_MINIMALIST_RING_SCALE;
    return clamp(Math.min(baseScale, maxScale), 0.2, maxScale);
  }
  const edgeScale = isPhotoTemplate
    ? Math.max(baseScale, PHOTO_TEMPLATE_EDGE_SCALE)
    : baseScale;
  const maxScale = isPhotoTemplate ? PHOTO_TEMPLATE_EDGE_SCALE_MAX : 1;
  return clamp(edgeScale, 0.2, maxScale);
}

function isPhotoTemplateConfig(template = {}) {
  return Boolean(template.file) && (
    String(template.key || "").includes("-foto-") ||
    String(template.key || "").startsWith("kolye-")
  );
}

function isSquareTemplateShape(template = {}) {
  const shape = String(template.shape || "").trim().toLowerCase();
  return shape === "kare" || shape === "square";
}

function isRectangularPendantPhotoTemplate(template = {}) {
  const shape = String(template.shape || "").trim().toLowerCase();
  return template.product === "kolye" &&
    isPhotoTemplateConfig(template) &&
    (shape === "dikdortgen" || shape === "rectangular");
}

function isOvalTemplateShape(template = {}) {
  const shape = String(template.shape || "").trim().toLowerCase();
  return shape === "oval" || shape === "vertical oval";
}

function isOvalPendantPhotoTemplate(template = {}) {
  return template.product === "kolye" &&
    isPhotoTemplateConfig(template) &&
    isOvalTemplateShape(template);
}

function minimalistRingOverlayPlacement(placement = {}, template = {}) {
  const detailedPlacement = detailedFaceOverlayPlacement(placement, template);
  return {
    ...detailedPlacement,
    height: detailedPlacement.height * MINIMALIST_RING_FACE_OVERLAY_SCALE,
    width: detailedPlacement.width * MINIMALIST_RING_FACE_OVERLAY_SCALE,
  };
}

function detailedFaceOverlayPlacement(placement = {}, template = {}) {
  const rawWidth = Math.max(1, Number(placement.width) || 1);
  const rawHeight = Math.max(1, Number(placement.height) || 1);
  const isOvalRingPhotoTemplate =
    template.product === "yuzuk" && isPhotoTemplateConfig(template) && isOvalTemplateShape(template);
  const isPendantPhotoTemplate =
    template.product === "kolye" && isPhotoTemplateConfig(template);
  const width = rawWidth * (isOvalRingPhotoTemplate
    ? DETAILED_OVAL_RING_FACE_OVERLAY_WIDTH_SCALE
    : isPendantPhotoTemplate
      ? DETAILED_PENDANT_FACE_OVERLAY_SCALE
      : DETAILED_FACE_OVERLAY_SCALE);
  const height = rawHeight * (isOvalRingPhotoTemplate
    ? DETAILED_OVAL_RING_FACE_OVERLAY_HEIGHT_SCALE
    : isPendantPhotoTemplate
      ? DETAILED_PENDANT_FACE_OVERLAY_SCALE
      : DETAILED_FACE_OVERLAY_SCALE);
  const centerY = (Number(placement.centerY) || 0) + (Number(placement.height) || 0) * DETAILED_FACE_CENTER_Y_OFFSET;
  const adjustedCenterY = isOvalPendantPhotoTemplate(template)
    ? centerY + rawHeight * DETAILED_OVAL_PENDANT_CENTER_Y_OFFSET
    : centerY;
  if (isSquareTemplateShape(template)) {
    const isSquarePendantPhotoTemplate = template.product === "kolye" && isPhotoTemplateConfig(template);
    const scale = template.product === "yuzuk" && isPhotoTemplateConfig(template)
      ? DETAILED_SQUARE_RING_FACE_OVERLAY_SCALE
      : isSquarePendantPhotoTemplate
        ? DETAILED_SQUARE_PENDANT_FACE_OVERLAY_SCALE
      : DETAILED_SQUARE_FACE_OVERLAY_SCALE;
    const squareCenterY = isSquarePendantPhotoTemplate
      ? centerY + rawHeight * DETAILED_SQUARE_PENDANT_CENTER_Y_OFFSET
      : centerY;
    const side = Math.min(rawWidth, rawHeight) * scale;
    return { ...placement, centerY: squareCenterY, height: side, width: side };
  }
  return { ...placement, centerY: adjustedCenterY, height, width };
}

function shouldFillEngravingSurface(template = {}) {
  return template.product === "kolye" && isPhotoTemplateConfig(template) && !isSquareTemplateShape(template);
}

function applyDesignModeToEngraving(engraving = {}, finishOptions = {}) {
  if (finishOptions.designMode !== "emboss") {
    return {
      ...engraving,
      highlight: { ...(engraving.highlight || {}), opacity: 0 },
      shadow: { ...(engraving.shadow || {}), opacity: 0 },
    };
  }

  return {
    ...engraving,
    blend: "over",
    lineColor: embossLineColor(finishOptions.metal),
    opacity: clamp(Number(engraving.opacity ?? STAGE_TWO_FULL_OPACITY), STAGE_TWO_MIN_OPACITY, STAGE_TWO_FULL_OPACITY),
    shadow: {
      ...(engraving.shadow || {}),
      blur: 1,
      offsetX: 2,
      offsetY: 2,
      opacity: Math.max(0.14, Number(engraving.shadow?.opacity) || 0.14),
    },
    highlight: {
      ...(engraving.highlight || {}),
      blur: 0.45,
      offsetX: -2,
      offsetY: -2,
      opacity: Math.max(0.2, Number(engraving.highlight?.opacity) || 0.2),
    },
    mask: {
      ...(engraving.mask || {}),
      gain: Math.max(2, Number(engraving.mask?.gain) || 2),
      threshold: Math.min(235, Number(engraving.mask?.threshold) || 224),
    },
  };
}

function embossLineColor(metal) {
  if (metal === "gumus") return "#f8fbff";
  if (metal === "rose") return "#ffd8ca";
  return "#ffe6a6";
}

async function readTemplateAsset(template, canvas) {
  if (template.file) {
    try {
      return await readFile(join(templateDir, template.file));
    } catch (error) {
      console.warn(`[finish-composite] template asset missing for ${template.key}; using fallback.`, error?.message || error);
    }
  }

  return buildFallbackTemplate(template, canvas);
}

function buildFallbackTemplate(template, canvas) {
  const width = Number(canvas.width) || 1024;
  const height = Number(canvas.height) || 1024;
  const p = template.placement;
  const x = p.centerX - p.width / 2;
  const y = p.centerY - p.height / 2;
  const shapeNode = template.shape === "oval"
    ? `<ellipse cx="${p.centerX}" cy="${p.centerY}" rx="${p.width / 2}" ry="${p.height / 2}" fill="url(#top)" stroke="#b98a35" stroke-width="10"/>`
    : template.shape === "yuvarlak"
      ? `<circle cx="${p.centerX}" cy="${p.centerY}" r="${Math.min(p.width, p.height) / 2}" fill="url(#top)" stroke="#b98a35" stroke-width="10"/>`
      : `<rect x="${x}" y="${y}" width="${p.width}" height="${p.height}" rx="${template.shape === "dikdortgen" ? 44 : 52}" fill="url(#top)" stroke="#b98a35" stroke-width="10"/>`;
  const productNode = template.product === "kolye"
    ? `<path d="M306 186 C342 356 424 442 512 442 C600 442 682 356 718 186" fill="none" stroke="url(#chain)" stroke-width="16" stroke-linecap="round"/>
       <circle cx="512" cy="444" r="26" fill="#f8e6ad" stroke="#b98a35" stroke-width="8"/>`
    : `<path d="M258 470 C168 542 167 727 318 810 C432 872 592 872 706 810 C857 727 856 542 766 470 L704 540 C762 626 748 724 663 769 C573 817 451 817 361 769 C276 724 262 626 320 540 Z" fill="url(#band)" stroke="#906719" stroke-width="9"/>`;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f6f2ea"/>
        </linearGradient>
        <radialGradient id="top" cx="42%" cy="24%" r="78%">
          <stop offset="0" stop-color="#fff1b8"/><stop offset=".48" stop-color="#d8a84a"/><stop offset="1" stop-color="#8a621c"/>
        </radialGradient>
        <linearGradient id="band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#765217"/><stop offset=".44" stop-color="#edc15b"/><stop offset="1" stop-color="#5f4213"/>
        </linearGradient>
        <linearGradient id="chain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#73521b"/><stop offset=".5" stop-color="#f1c95b"/><stop offset="1" stop-color="#73521b"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <ellipse cx="512" cy="${template.product === "kolye" ? 804 : 744}" rx="${template.product === "kolye" ? 220 : 310}" ry="${template.product === "kolye" ? 72 : 82}" fill="#4b3617" opacity=".13" filter="url(#blur)"/>
      ${productNode}
      ${shapeNode}
    </svg>`
  );
}

function transparentCanvas(width, height) {
  return sharp({
    create: {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      channels: 4,
      height,
      width,
    },
  });
}

function solidRgbaLayer(color, width, height) {
  return sharp({
    create: {
      background: color,
      channels: 3,
      height,
      width,
    },
  });
}

async function makeAlphaEffectLayer({ alphaScale, blur, color, height, mask, width }) {
  const rawEffectMask = await applyOptionalBlur(sharp(mask.data, { raw: mask.raw }), blur)
    .raw()
    .toBuffer();
  const effectMask = Buffer.alloc(rawEffectMask.length);
  for (let index = 0; index < rawEffectMask.length; index += 1) {
    effectMask[index] = Math.round(rawEffectMask[index] * alphaScale);
  }

  return solidRgbaLayer({ ...color, alpha: 1 }, width, height)
    .joinChannel(effectMask, { raw: mask.raw })
    .png()
    .toBuffer();
}

function parseHexColor(value, fallback) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(value || "").trim());
  if (!match) return fallback;
  const intValue = Number.parseInt(match[1], 16);
  return {
    b: intValue & 255,
    g: (intValue >> 8) & 255,
    r: (intValue >> 16) & 255,
  };
}

function normalizeBlurSigma(value, fallback = 0) {
  const sigma = Number(value);
  if (!Number.isFinite(sigma) || sigma <= 0) return fallback;
  return clamp(sigma, 0.3, 1000);
}

function applyOptionalBlur(image, sigma) {
  const normalized = normalizeBlurSigma(sigma, 0);
  return normalized > 0 ? image.blur(normalized) : image;
}

async function resolveFinishSourceImageBuffer(body) {
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : "";
  let buffer = null;

  if (imageDataUrl.startsWith("data:image/")) buffer = await dataUrlToBuffer(imageDataUrl);
  else if (sourceUrl.startsWith("data:image/")) buffer = await dataUrlToBuffer(sourceUrl);
  else if (/^https?:\/\//i.test(sourceUrl)) buffer = await fetchRemoteImageBuffer(sourceUrl);
  else throw new Error("Kaynak görsel eksik ya da geçersiz.");

  return buffer;
}

async function dataUrlToBuffer(dataUrl) {
  const validated = await validateImageDataUrl(dataUrl, { source: "Kaynak tasarım görseli" });
  return validated.buffer;
}

async function fetchRemoteImageBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Kaynak görsel indirilemedi.");
  const contentType = response.headers.get("content-type") || "";
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 0) {
    validateImageUploadMetadata({ contentType, size: contentLength });
  }

  const arrayBuffer = await response.arrayBuffer();
  const validated = await validateImageUpload({
    buffer: Buffer.from(arrayBuffer),
    contentType,
    size: contentLength || arrayBuffer.byteLength,
    source: "Kaynak tasarım görseli",
  });
  return validated.buffer;
}

async function readTemplateManifest() {
  if (!templateManifestPromise) {
    templateManifestPromise = readFile(manifestPath, "utf8").then((source) => JSON.parse(source));
  }
  return templateManifestPromise;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
