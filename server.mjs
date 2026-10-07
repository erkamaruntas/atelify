import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicConfig, loadConfig } from "./src/config/env.js";
import { configureFal } from "./src/providers/fal/client.js";
import {
  fetchImageResult,
  fetchImageStatus,
  normalizeFalImages,
} from "./src/providers/fal/image.js";
import {
  patchGenerationJob,
  readGenerationJob,
  sanitizeClientJobId,
  sanitizeGenerationJobContext,
} from "./src/repositories/generation-jobs.repo.js";
import {
  adminGrantCredits,
  listUserSpendingSummaries,
  readUserCredits,
} from "./src/repositories/credits.repo.js";
import {
  isCreditConfigError,
  verifyAdminUser,
  verifyAuthUser,
  verifyOwnerUser,
} from "./src/services/auth.service.js";
import { resolveCreditTarget } from "./src/services/credits.service.js";
import {
  adminListProfiles,
  adminSetUserRole,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  readUserProfile,
} from "./src/services/profiles.service.js";
import {
  creditRefundPayload,
  refundFailedGenerationCredits,
} from "./src/services/credit-refunds.service.js";
import { recoverUserGenerationJobs } from "./src/services/generation-recovery.service.js";
import { runFinishCompositeRequest } from "./src/services/finish.service.js";
import {
  runMockupGeneration,
  runSketchGeneration,
} from "./src/services/generation.service.js";
import { isUploadValidationError } from "./src/lib/upload-validation.js";
import { enforceRateLimits, rateLimitedResponse } from "./src/lib/rate-limit.js";
import {
  adminListAllProductionRequests,
  adminUpdateProductionRequest,
  createProductionCheckout,
  createProductionRequest,
  listProductionRequests,
} from "./src/services/production-requests.service.js";
import {
  adminListAllTickets,
  adminReplyToTicket,
  createTicket,
  listTickets,
  replyToTicket,
} from "./src/services/tickets.service.js";
import {
  handlePlanCheckoutCallback,
  initPlanCheckout,
} from "./src/services/iyzico-checkout.service.js";
import {
  cancelSubscription,
  getSubscriptionSummary,
} from "./src/services/subscriptions.service.js";
import {
  handleTopupCheckoutCallback,
  initTopupCheckout,
} from "./src/services/topup-checkout.service.js";
import {
  createSignedUploadUrl,
  persistGeneratedImages,
} from "./src/services/storage.service.js";
import { getHealthReport } from "./src/services/health.service.js";
import { listRecentDesigns } from "./src/repositories/designs.repo.js";
import { getDeploymentVersion } from "./src/services/version.service.js";
import { createLogger } from "./src/lib/logger.js";
import { generateRequestId } from "./src/lib/error-boundary.js";

const serverLog = createLogger("server");

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const config = loadConfig();
const { port, falKey } = config;
const maxJsonBodySize = 15 * 1024 * 1024;
const publicConfig = getPublicConfig();

configureFal(falKey);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};
const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "Expires": "0",
  "Pragma": "no-cache",
  "Surrogate-Control": "no-store",
};
// Production'daki vercel.json header bloğuyla eşleşir; local geliştirmede de
// aynı CSP/clickjacking davranışını görmek için statik yanıtlara uygulanır.
// (HSTS yalnızca HTTPS'te etkilidir, localhost http üzerinde tarayıcı yok sayar.)
const securityHeaders = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
};

const server = createServer(async (request, response) => {
  const requestId = generateRequestId();
  try {
    response.setHeader("X-Request-Id", requestId);
  } catch {
    /* başlık yazılamıyorsa yoksay */
  }
  try {
    await dispatchRequest(request, response);
  } catch (error) {
    serverLog.error("Unhandled request error.", {
      error,
      requestId,
      method: request.method,
      url: request.url,
    });
    if (!response.headersSent && !response.writableEnded) {
      sendJson(response, 500, {
        error: "Beklenmeyen bir sunucu hatası oluştu. Sorun sürerse bu kodu paylaşın.",
        requestId,
      });
    }
  }
});

async function dispatchRequest(request, response) {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (url.pathname === "/api/health") {
    const report = getHealthReport();
    return sendJson(response, report.status === "ok" ? 200 : 503, report);
  }

  if (url.pathname === "/api/version") {
    return sendJson(response, 200, getDeploymentVersion());
  }

  if (url.pathname === "/api/config") {
    return sendJson(response, 200, publicConfig);
  }

  if (url.pathname === "/api/designs") {
    return handleDesignsRequest(request, response, url);
  }

  if (url.pathname === "/api/sketch") {
    return handleSketchRequest(request, response);
  }

  if (url.pathname === "/api/finish") {
    return handleFinishRequest(request, response);
  }

  if (url.pathname === "/api/mockup") {
    return handleMockupRequest(request, response);
  }

  if (url.pathname === "/api/assets/upload-url") {
    return handleAssetsUploadUrlRequest(request, response);
  }

  if (url.pathname === "/api/generation-status") {
    return handleGenerationStatusRequest(request, response);
  }

  if (url.pathname === "/api/recover-generations") {
    return handleRecoverGenerationsRequest(request, response);
  }

  if (url.pathname === "/api/generation-delivered") {
    return handleGenerationDeliveredRequest(request, response);
  }

  if (url.pathname === "/api/credits") {
    return handleCreditsRequest(request, response);
  }

  if (url.pathname === "/api/profile") {
    return handleProfileRequest(request, response);
  }

  if (url.pathname === "/api/production-requests") {
    return handleProductionRequestsRequest(request, response);
  }

  if (url.pathname === "/api/admin/credits") {
    return handleAdminCreditsRequest(request, response);
  }

  if (url.pathname === "/api/admin/production-requests") {
    return handleAdminProductionRequestsRequest(request, response);
  }

  if (url.pathname === "/api/admin/roles") {
    return handleAdminRolesRequest(request, response);
  }

  if (url.pathname === "/api/admin/spending") {
    return handleAdminSpendingRequest(request, response);
  }

  if (url.pathname === "/api/tickets") {
    return handleTicketsRequest(request, response);
  }

  if (url.pathname === "/api/admin/tickets") {
    return handleAdminTicketsRequest(request, response);
  }

  if (url.pathname === "/api/subscription") {
    return handleSubscriptionRequest(request, response);
  }

  if (url.pathname === "/api/iyzico/checkout") {
    return handleIyzicoCheckoutRequest(request, response);
  }

  if (url.pathname === "/api/iyzico/callback") {
    return handleIyzicoCallbackRequest(request, response, url);
  }

  if (url.pathname === "/api/topup/checkout") {
    return handleTopupCheckoutRequest(request, response);
  }

  if (url.pathname === "/api/iyzico/topup-callback") {
    return handleTopupCallbackRequest(request, response, url);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const filePath = resolveFilePath(url.pathname);

  if (!filePath) {
    return sendText(response, 403, "Forbidden");
  }

  if (!existsSync(filePath)) {
    return sendNotFound(response);
  }

  try {
    const body = await readFile(filePath);
    const extension = extname(filePath);
    const contentType = contentTypes[extension] || "application/octet-stream";

    response.writeHead(200, {
      ...noStoreHeaders,
      ...securityHeaders,
      "Content-Type": contentType,
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    response.end(body);
  } catch (error) {
    serverLog.error("Static file serve failed.", { error, path: filePath });
    sendText(response, 500, "Internal server error");
  }
}

server.listen(port, "127.0.0.1", () => {
  console.log(`[auth] ff Studio local server running at http://localhost:${port}`);
});

function resolveFilePath(pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const normalizedPath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = join(rootDir, normalizedPath);

  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }

  if (extname(absolutePath)) {
    return absolutePath;
  }

  const htmlPath = `${absolutePath}.html`;
  return existsSync(htmlPath) ? htmlPath : absolutePath;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    ...noStoreHeaders,
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, {
    ...noStoreHeaders,
    ...securityHeaders,
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(body);
}

async function sendNotFound(response) {
  // Markalı 404 sayfasını 404 statüsüyle sun; dosya bir şekilde yoksa düz metne düş.
  try {
    const body = await readFile(join(rootDir, "404.html"));
    response.writeHead(404, {
      ...noStoreHeaders,
      ...securityHeaders,
      "Content-Type": "text/html; charset=utf-8",
    });
    response.end(body);
  } catch {
    sendText(response, 404, "Not found");
  }
}

async function enforceRequestRateLimit(response, userId, scopes) {
  try {
    const check = await enforceRateLimits(userId, scopes);
    if (check.allowed) return true;
    const limited = rateLimitedResponse(check);
    response.setHeader("Retry-After", limited.headers["Retry-After"]);
    sendJson(response, limited.statusCode, limited.payload);
    return false;
  } catch (error) {
    console.error("[rate-limit] enforcement failed", error);
    sendJson(response, 500, { error: "Rate limit kontrolü başarısız oldu." });
    return false;
  }
}

function sendCorsPreflight(response, allowMethods) {
  response.writeHead(204, {
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": allowMethods,
    "Access-Control-Allow-Origin": "*",
    ...noStoreHeaders,
  });
  response.end();
}

async function handleSketchRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "POST, OPTIONS");
  }
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["sketch", "general"]))) return;

  let body;
  try {
    body = await readJsonBody(request, maxJsonBodySize);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const result = await runSketchGeneration({
    user,
    body,
    falKey,
    clientJobId: sanitizeClientJobId(body.clientJobId || body.client_job_id),
    jobContext: sanitizeGenerationJobContext(body.jobContext),
  });
  return sendJson(response, result.status, result.payload);
}

async function handleDesignsRequest(request, response, url) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "GET, OPTIONS");
  }
  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  const requestedDays = Number.parseInt(url.searchParams.get("sinceDays") || url.searchParams.get("days"), 10);
  const sinceDays = Number.isFinite(requestedDays)
    ? Math.min(Math.max(1, requestedDays), 365)
    : 30;
  const designs = await listRecentDesigns({ userId: user.id, sinceDays });
  return sendJson(response, 200, { designs, sinceDays });
}

async function handleFinishRequest(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      ...noStoreHeaders,
    });
    response.end();
    return;
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["finish", "general"]))) return;

  let body;
  try {
    body = await readJsonBody(request, maxJsonBodySize);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const result = await runFinishCompositeRequest(request, body);
  return sendJson(response, result.status, result.payload);
}

async function handleMockupRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "POST, OPTIONS");
  }
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["mockup", "general"]))) return;

  let body;
  try {
    body = await readJsonBody(request, maxJsonBodySize);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const result = await runMockupGeneration({
    user,
    body,
    falKey,
    clientJobId: sanitizeClientJobId(body.clientJobId || body.client_job_id),
    jobContext: sanitizeGenerationJobContext(body.jobContext),
  });
  return sendJson(response, result.status, result.payload);
}

async function handleAssetsUploadUrlRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "POST, OPTIONS");
  }
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  let body;
  try {
    body = await readJsonBody(request, maxJsonBodySize);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  try {
    const upload = await createSignedUploadUrl(user.id, body);
    return sendJson(response, 200, { upload });
  } catch (error) {
    if (isUploadValidationError(error)) {
      return sendJson(response, error.statusCode || 400, {
        code: error.code,
        error: error.message,
      });
    }
    console.error("[assets-upload-url] create failed", error);
    return sendJson(response, error?.statusCode || 500, {
      error: error?.message || "Upload URL oluşturulamadı.",
    });
  }
}

async function handleGenerationStatusRequest(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      ...noStoreHeaders,
    });
    response.end();
    return;
  }

  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  if (!falKey) {
    return sendJson(response, 500, { error: "FAL_KEY yapılandırması eksik." });
  }

  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const clientJobId = sanitizeClientJobId(url.searchParams.get("clientJobId") || url.searchParams.get("jobId"));
  if (!clientJobId) {
    return sendJson(response, 400, { error: "Üretim job id eksik." });
  }

  const storedJob = clientJobId ? await readGenerationJob(clientJobId) : null;
  if (!storedJob || storedJob.userId !== user.id) {
    return sendJson(response, 404, { error: "Üretim kaydı bulunamadı." });
  }

  const requestId = storedJob.requestId || url.searchParams.get("requestId") || "";
  const stage = storedJob.stage || normalizeGenerationStage(url.searchParams.get("stage"));
  const count = normalizeGenerationCount(stage, storedJob.count || url.searchParams.get("count"));

  if ((!requestId && !clientJobId) || !stage) {
    return sendJson(response, 400, { error: "Üretim request id veya aşama bilgisi eksik." });
  }

  if (storedJob?.status === "completed" && Array.isArray(storedJob.result?.images) && storedJob.result.images.length) {
    return sendJson(response, 200, {
      ...storedJob.result,
      clientJobId,
      pending: false,
      status: "completed",
    });
  }

  if (!requestId) {
    if (storedJob?.status === "failed" || storedJob?.status === "cancelled") {
      return sendJson(response, 200, {
        clientJobId,
        error: storedJob.error || "Görsel oluşturma tamamlanamadı.",
        pending: false,
        status: storedJob.status,
      });
    }

    return sendJson(response, 200, {
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
            error: "fal.ai üretimi tamamlanamadı.",
            status: normalizedStatus,
          });
          refund = refundResult.refund;
          jobForPatch = refundResult.job || storedJob;
        }
        await patchGenerationJob(clientJobId, {
          count,
          error: normalizedStatus === "failed" || normalizedStatus === "cancelled"
            ? "fal.ai üretimi tamamlanamadı."
            : "",
          metadata: jobForPatch?.metadata || storedJob?.metadata || {},
          requestId,
          stage,
          status: normalizedStatus,
        });
      }

      return sendJson(response, 200, {
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
          error: "fal.ai görsel döndürmedi.",
          status: "failed",
        });
        refund = refundResult.refund;
        await patchGenerationJob(clientJobId, {
          error: "fal.ai görsel döndürmedi.",
          metadata: refundResult.job?.metadata || storedJob?.metadata || {},
          requestId,
          stage,
          status: "failed",
        });
      }

      return sendJson(response, 502, {
        ...creditRefundPayload(refund),
        error: "fal.ai görsel döndürmedi.",
        status: "failed",
      });
    }

    let images;
    try {
      images = await persistGeneratedImages(generatedImages, {
        clientJobId,
        stage,
        userId: storedJob.userId,
      });
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
      return sendJson(response, 200, {
        ...completedPayload,
        clientJobId,
        pending: false,
        status: "completed",
      });
    }

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

    return sendJson(response, 200, {
      clientJobId,
      images,
      pending: false,
      prompt: result?.data?.prompt || "",
      requestId,
      status: "completed",
    });
  } catch (error) {
    console.error("[fal] generation status failed", error);
    return sendJson(response, 502, {
      clientJobId,
      detail: error?.message || "",
      error: "Görsel oluşturma durumu geçici olarak okunamadı.",
      pending: true,
      requestId,
      status: "queued",
    });
  }
}

async function handleRecoverGenerationsRequest(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      ...noStoreHeaders,
    });
    response.end();
    return;
  }

  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  if (!falKey) {
    return sendJson(response, 500, { error: "FAL_KEY yapılandırması eksik." });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  try {
    const jobs = await recoverUserGenerationJobs({
      falKey,
      limit: 20,
      userId: user.id,
    });
    return sendJson(response, 200, { jobs });
  } catch (error) {
    console.error("[generation-recovery] recover endpoint failed", error);
    return sendJson(response, 500, {
      detail: error?.message || "",
      error: "Yarım kalan görsel üretimleri kontrol edilemedi.",
    });
  }
}

async function handleGenerationDeliveredRequest(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      ...noStoreHeaders,
    });
    response.end();
    return;
  }

  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  let body;
  try {
    body = await readJsonBody(request, 32 * 1024);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const clientJobId = sanitizeClientJobId(body.clientJobId || body.client_job_id || body.jobId);
  if (!clientJobId) {
    return sendJson(response, 400, { error: "Teslim edilecek üretim job id eksik." });
  }

  try {
    const job = await readGenerationJob(clientJobId);
    if (!job || job.userId !== user.id) {
      return sendJson(response, 404, { error: "Üretim kaydı bulunamadı." });
    }

    const deliveredAt = job.deliveredAt || new Date().toISOString();
    await patchGenerationJob(clientJobId, { deliveredAt });
    return sendJson(response, 200, { clientJobId, deliveredAt, ok: true });
  } catch (error) {
    console.error("[generation-recovery] delivered mark failed", error);
    return sendJson(response, 500, {
      detail: error?.message || "",
      error: "Üretim teslim edildi olarak işaretlenemedi.",
    });
  }
}

async function handleCreditsRequest(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      ...noStoreHeaders,
    });
    response.end();
    return;
  }

  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  try {
    const wallet = await readUserCredits(user.id);
    return sendJson(response, 200, wallet);
  } catch (error) {
    console.error("[credits] read failed", error);
    return sendJson(response, 500, { error: creditErrorMessage(error, "Kredi bilgisi okunamadı.") });
  }
}

async function handleProfileRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "GET, PATCH, POST, OPTIONS");
  }
  if (request.method !== "GET" && request.method !== "PATCH" && request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  if (request.method === "GET") {
    const result = await getCurrentUserProfile({ user });
    return sendJson(response, result.status, result.payload);
  }

  let body;
  try {
    body = await readJsonBody(request, 16 * 1024);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const result = await updateCurrentUserProfile({ user, body });
  return sendJson(response, result.status, result.payload);
}

async function handleProductionRequestsRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "GET, POST, OPTIONS");
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  if (request.method === "GET") {
    const result = await listProductionRequests({ user });
    return sendJson(response, result.status, result.payload);
  }

  let body;
  try {
    body = await readJsonBody(request, maxJsonBodySize);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const result = Array.isArray(body?.items)
    ? await createProductionCheckout({ user, body })
    : await createProductionRequest({ user, body });
  return sendJson(response, result.status, result.payload);
}

async function handleTicketsRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "GET, POST, OPTIONS");
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  if (request.method === "GET") {
    const result = await listTickets({ user });
    return sendJson(response, result.status, result.payload);
  }

  let body;
  try {
    body = await readJsonBody(request, maxJsonBodySize);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const result = body && body.ticketId
    ? await replyToTicket({ user, body })
    : await createTicket({ user, body });
  return sendJson(response, result.status, result.payload);
}

async function handleAdminTicketsRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "GET, PATCH, OPTIONS");
  }
  if (request.method !== "GET" && request.method !== "PATCH") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let admin;
  try {
    admin = await verifyAdminUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Admin doğrulaması başarısız." });
  }

  if (!admin.isApiKey && !(await enforceRequestRateLimit(response, admin.id, ["general"]))) return;

  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET") {
    const filters = {
      limit: url.searchParams.get("limit") || "",
      status: url.searchParams.get("status") || "",
      userId: url.searchParams.get("userId") || "",
    };
    const result = await adminListAllTickets({ filters });
    return sendJson(response, result.status, result.payload);
  }

  let body;
  try {
    body = await readJsonBody(request, maxJsonBodySize);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const id = String(body?.id || "").trim();
  if (!id) {
    return sendJson(response, 400, { error: "Talep id eksik." });
  }

  const result = await adminReplyToTicket({
    admin,
    id,
    patch: {
      message: typeof body.message === "string" ? body.message : "",
      status: typeof body.status === "string" ? body.status : "",
    },
  });
  return sendJson(response, result.status, result.payload);
}

function readRawText(request, limit = 16 * 1024) {
  return new Promise((resolve) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > limit) data = data.slice(0, limit);
    });
    request.on("end", () => resolve(data));
    request.on("error", () => resolve(""));
  });
}

async function handleIyzicoCheckoutRequest(request, response) {
  if (request.method === "OPTIONS") return sendCorsPreflight(response, "POST, OPTIONS");
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  let body;
  try {
    body = await readJsonBody(request, 8 * 1024);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const clientIp = String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();
  const result = await initPlanCheckout({
    user,
    planKey: typeof body?.planKey === "string" ? body.planKey : "",
    clientIp,
  });
  return sendJson(response, result.status, result.payload);
}

async function handleSubscriptionRequest(request, response) {
  if (request.method === "OPTIONS") return sendCorsPreflight(response, "GET, POST, OPTIONS");
  if (request.method !== "GET" && request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  if (request.method === "GET") {
    try {
      const summary = await getSubscriptionSummary({ userId: user.id });
      return sendJson(response, 200, summary);
    } catch (error) {
      console.error("[subscription] summary read failed", error);
      return sendJson(response, 500, { error: "Abonelik bilgisi okunamadı." });
    }
  }

  let body;
  try {
    body = await readJsonBody(request, 8 * 1024);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const action = typeof body?.action === "string" ? body.action.trim() : "";
  if (action !== "cancel") {
    return sendJson(response, 400, { error: "Geçersiz işlem." });
  }

  try {
    const result = await cancelSubscription({ userId: user.id });
    if (!result.canceled) {
      return sendJson(response, 409, { error: "İptal edilecek aktif abonelik bulunamadı.", ...result });
    }
    return sendJson(response, 200, result);
  } catch (error) {
    console.error("[subscription] cancel failed", error);
    return sendJson(response, 500, { error: "Abonelik iptal edilemedi. Lütfen tekrar dene." });
  }
}

async function handleIyzicoCallbackRequest(request, response, url) {
  let token = url.searchParams.get("token") || "";
  if (!token && request.method === "POST") {
    const raw = await readRawText(request);
    try {
      token = new URLSearchParams(raw).get("token") || "";
    } catch {
      token = "";
    }
  }
  const result = await handlePlanCheckoutCallback({ token });
  const location = result.ok
    ? `/odeme.html?sonuc=basarili&paket=${encodeURIComponent(result.planKey || "")}`
    : `/odeme.html?sonuc=hata&neden=${encodeURIComponent(result.reason || "bilinmeyen")}`;
  response.statusCode = 302;
  response.setHeader("Location", location);
  response.setHeader("Cache-Control", "no-store");
  return response.end();
}

async function handleTopupCheckoutRequest(request, response) {
  if (request.method === "OPTIONS") return sendCorsPreflight(response, "POST, OPTIONS");
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Oturum doğrulanamadı." });
  }

  if (!(await enforceRequestRateLimit(response, user.id, ["general"]))) return;

  let body;
  try {
    body = await readJsonBody(request, 8 * 1024);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const clientIp = String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();
  const result = await initTopupCheckout({
    user,
    packKey: typeof body?.packKey === "string" ? body.packKey : "",
    clientIp,
  });
  return sendJson(response, result.status, result.payload);
}

async function handleTopupCallbackRequest(request, response, url) {
  let token = url.searchParams.get("token") || "";
  if (!token && request.method === "POST") {
    const raw = await readRawText(request);
    try {
      token = new URLSearchParams(raw).get("token") || "";
    } catch {
      token = "";
    }
  }
  const result = await handleTopupCheckoutCallback({ token });
  const location = result.ok
    ? `/studio?kredi=basarili&paket=${encodeURIComponent(result.packKey || "")}`
    : `/studio?kredi=hata&neden=${encodeURIComponent(result.reason || "bilinmeyen")}`;
  response.statusCode = 302;
  response.setHeader("Location", location);
  response.setHeader("Cache-Control", "no-store");
  return response.end();
}

async function handleAdminProductionRequestsRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "GET, PATCH, OPTIONS");
  }
  if (request.method !== "GET" && request.method !== "PATCH") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let admin;
  try {
    admin = await verifyAdminUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Admin doğrulaması başarısız." });
  }

  if (!admin.isApiKey && !(await enforceRequestRateLimit(response, admin.id, ["general"]))) return;

  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET") {
    const filters = {
      limit: url.searchParams.get("limit") || "",
      status: url.searchParams.get("status") || "",
      userId: url.searchParams.get("userId") || "",
    };
    const result = await adminListAllProductionRequests({ filters });
    return sendJson(response, result.status, result.payload);
  }

  let body;
  try {
    body = await readJsonBody(request, maxJsonBodySize);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const id = String(body?.id || "").trim();
  if (!id) {
    return sendJson(response, 400, { error: "Talep id eksik." });
  }

  const result = await adminUpdateProductionRequest({
    id,
    patch: {
      status: typeof body.status === "string" ? body.status : "",
      internalNote: typeof body.internalNote === "string" ? body.internalNote : undefined,
    },
  });
  return sendJson(response, result.status, result.payload);
}

async function handleAdminCreditsRequest(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "Authorization, Content-Type, x-admin-key",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      ...noStoreHeaders,
    });
    response.end();
    return;
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let admin;
  try {
    admin = await verifyOwnerUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Yetki doğrulaması başarısız." });
  }

  if (!admin.isApiKey && !(await enforceRequestRateLimit(response, admin.id, ["general"]))) return;

  if (request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const userId = url.searchParams.get("userId") || "";
    const email = url.searchParams.get("email") || "";

    if (!userId && !email) {
      return sendJson(response, 200, { isAdmin: true, isOwner: true });
    }

    let targetUserId;
    try {
      targetUserId = await resolveCreditTarget({ email, userId });
    } catch (error) {
      console.error("[credits] admin target lookup failed", error);
      return sendJson(response, 500, { error: "Kullanıcı aranırken hata oluştu." });
    }

    if (!targetUserId) {
      return sendJson(response, 404, { error: "Kullanıcı bulunamadı." });
    }

    try {
      const wallet = await readUserCredits(targetUserId);
      return sendJson(response, 200, { isAdmin: true, userId: targetUserId, wallet });
    } catch (error) {
      console.error("[credits] admin read failed", error);
      return sendJson(response, 500, { error: creditErrorMessage(error, "Kredi bilgisi okunamadı.") });
    }
  }

  let body;
  try {
    body = await readJsonBody(request, 64 * 1024);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const amount = Math.trunc(Number(body.amount));
  if (!Number.isFinite(amount) || amount < 0) {
    return sendJson(response, 400, { error: "Kredi miktarı 0 veya daha büyük bir sayı olmalı." });
  }

  let userId;
  try {
    userId = await resolveCreditTarget({
      email: typeof body.email === "string" ? body.email : "",
      userId: typeof body.userId === "string" ? body.userId : "",
    });
  } catch (error) {
    console.error("[credits] admin target lookup failed", error);
    return sendJson(response, 500, { error: "Kullanıcı aranırken hata oluştu." });
  }

  if (!userId) {
    return sendJson(response, 404, { error: "Kullanıcı bulunamadı." });
  }

  try {
    const updated = await adminGrantCredits({
      userId,
      amount,
      label: typeof body.label === "string" && body.label.trim() ? body.label.trim() : undefined,
      mode: body.mode,
      planKey: typeof body.planKey === "string" && body.planKey.trim() ? body.planKey.trim() : null,
      isUnlimited: typeof body.isUnlimited === "boolean" ? body.isUnlimited : null,
    });
    const wallet = await readUserCredits(userId);
    return sendJson(response, 200, { isAdmin: true, ok: true, userId, wallet, rawWallet: updated });
  } catch (error) {
    console.error("[credits] admin grant failed", error);
    return sendJson(response, 500, { error: creditErrorMessage(error, "Kredi yüklenirken hata oluştu.") });
  }
}

async function handleAdminSpendingRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "GET, OPTIONS");
  }

  if (request.method !== "GET") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let owner;
  try {
    owner = await verifyOwnerUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Yetki doğrulaması başarısız." });
  }

  if (!owner.isApiKey && !(await enforceRequestRateLimit(response, owner.id, ["general"]))) return;

  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  try {
    const report = await listUserSpendingSummaries({ limit: url.searchParams.get("limit") || "" });
    return sendJson(response, 200, { isOwner: true, ...report });
  } catch (error) {
    console.error("[spending] owner report failed", error);
    return sendJson(response, 500, {
      error: creditErrorMessage(error, "Harcama raporu okunamadı."),
    });
  }
}

// Kullanıcılara admin rolü verme/alma. Yalnızca proje sahibine açık
// (verifyOwnerUser); profil rolü admin olan diğer hesaplar buraya erişemez.
async function handleAdminRolesRequest(request, response) {
  if (request.method === "OPTIONS") {
    return sendCorsPreflight(response, "GET, POST, OPTIONS");
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  let owner;
  try {
    owner = await verifyOwnerUser(request);
  } catch (error) {
    return sendJson(response, error?.statusCode || 401, { error: error?.message || "Yetki doğrulaması başarısız." });
  }

  if (!owner.isApiKey && !(await enforceRequestRateLimit(response, owner.id, ["general"]))) return;

  if (request.method === "GET") {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const userId = url.searchParams.get("userId") || "";
    const email = url.searchParams.get("email") || "";

    // Parametre yoksa mevcut admin listesini döndür.
    if (!userId && !email) {
      const result = await adminListProfiles({ role: "admin" });
      return sendJson(response, result.status, { isOwner: true, ...result.payload });
    }

    let targetUserId;
    try {
      targetUserId = await resolveCreditTarget({ email, userId });
    } catch (error) {
      console.error("[roles] target lookup failed", error);
      return sendJson(response, 500, { error: "Kullanıcı aranırken hata oluştu." });
    }
    if (!targetUserId) {
      return sendJson(response, 404, { error: "Kullanıcı bulunamadı." });
    }

    try {
      const profile = await readUserProfile(targetUserId);
      return sendJson(response, 200, { isOwner: true, userId: targetUserId, profile });
    } catch (error) {
      console.error("[roles] profile read failed", error);
      return sendJson(response, 500, { error: "Profil okunamadı." });
    }
  }

  let body;
  try {
    body = await readJsonBody(request, 64 * 1024);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "Geçersiz istek." });
  }

  const role = String(body?.role || "").trim().toLowerCase();
  if (role !== "admin" && role !== "user") {
    return sendJson(response, 400, { error: "Rol 'admin' veya 'user' olmalı." });
  }

  const email = typeof body.email === "string" ? body.email : "";
  let userId;
  try {
    userId = await resolveCreditTarget({ email, userId: typeof body.userId === "string" ? body.userId : "" });
  } catch (error) {
    console.error("[roles] target lookup failed", error);
    return sendJson(response, 500, { error: "Kullanıcı aranırken hata oluştu." });
  }
  if (!userId) {
    return sendJson(response, 404, { error: "Kullanıcı bulunamadı." });
  }

  const result = await adminSetUserRole({ userId, email, role });
  return sendJson(response, result.status, { isOwner: true, ...result.payload });
}

function creditErrorMessage(error, fallback) {
  return isCreditConfigError(error)
    ? "Kredi sistemi için Supabase service role yapılandırması eksik."
    : fallback;
}


function readJsonBody(request, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Görsel isteği çok büyük."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        const source = Buffer.concat(chunks).toString("utf8");
        resolve(source ? JSON.parse(source) : {});
      } catch {
        reject(new Error("JSON gövdesi okunamadı."));
      }
    });

    request.on("error", () => {
      reject(new Error("İstek okunamadı."));
    });
  });
}
