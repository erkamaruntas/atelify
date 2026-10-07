import { setNoStoreHeaders } from "./_http.js";
import { getPublicConfig } from "../src/config/env.js";
import { readJsonRequestBody } from "../src/lib/request-body.js";
import { applyVercelRateLimit } from "../src/lib/rate-limit.js";
import { verifyAuthUser } from "../src/services/auth.service.js";
import { getHealthReport } from "../src/services/health.service.js";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../src/services/profiles.service.js";
import { getDeploymentVersion } from "../src/services/version.service.js";
import { withApiErrorBoundary } from "../src/lib/error-boundary.js";
import creditsHandler from "./_credits-route.js";
import subscriptionHandler from "./_subscription.js";

// Hobby planında deployment başına en fazla 12 serverless function olabildiği için
// health-check ayrı bir fonksiyon yerine bu hafif public uç noktanın içine katlandı.
// `/api/health` yolu vercel.json'daki rewrite ile buraya `?diag=health` ile gelir.
function wantsHealth(request) {
  const url = request.url || "";
  if (url.includes("/api/health")) return true;
  if (/[?&]diag=health(?:&|$)/.test(url)) return true;
  return request.query && request.query.diag === "health";
}

function wantsVersion(request) {
  const url = request.url || "";
  if (url.includes("/api/version")) return true;
  if (/[?&]diag=version(?:&|$)/.test(url)) return true;
  return request.query && request.query.diag === "version";
}

function wantsProfile(request) {
  const url = request.url || "";
  if (url.includes("/api/profile")) return true;
  if (/[?&]resource=profile(?:&|$)/.test(url)) return true;
  return request.query && request.query.resource === "profile";
}

// /api/credits ve /api/subscription da aynı sebeple (12 fonksiyon sınırı) buraya
// katlandı; vercel.json rewrite'ları `?resource=credits|subscription` ile getirir.
function requestedResource(request) {
  const value = request.query?.resource;
  const fromQuery = Array.isArray(value) ? value[0] || "" : value || "";
  if (fromQuery) return fromQuery;
  const url = request.url || "";
  if (url.includes("/api/credits")) return "credits";
  if (url.includes("/api/subscription")) return "subscription";
  return "";
}

async function handleProfileRequest(request, response) {
  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }
  if (request.method !== "GET" && request.method !== "PATCH" && request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({
      error: error?.message || "Oturum doğrulanamadı.",
    });
  }

  if (await applyVercelRateLimit(response, user.id, ["general"])) return undefined;

  if (request.method === "GET") {
    const result = await getCurrentUserProfile({ user });
    return response.status(result.status).json(result.payload);
  }

  let body;
  try {
    body = await readJsonRequestBody(request, 16 * 1024);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  const result = await updateCurrentUserProfile({ user, body });
  return response.status(result.status).json(result.payload);
}

async function handler(request, response) {
  const resource = requestedResource(request);
  if (resource === "credits") return creditsHandler(request, response);
  if (resource === "subscription") return subscriptionHandler(request, response);

  if (request.method !== "GET" && request.method !== "HEAD" && !wantsProfile(request)) {
    return response.status(405).json({ error: "Method not allowed" });
  }

  setNoStoreHeaders(response);

  if (wantsProfile(request)) {
    return handleProfileRequest(request, response);
  }

  if (wantsHealth(request)) {
    const report = getHealthReport();
    const statusCode = report.status === "ok" ? 200 : 503;
    if (request.method === "HEAD") return response.status(statusCode).end();
    return response.status(statusCode).json(report);
  }

  if (wantsVersion(request)) {
    if (request.method === "HEAD") return response.status(200).end();
    return response.status(200).json(getDeploymentVersion());
  }

  return response.status(200).json(getPublicConfig());
}

export default withApiErrorBoundary(handler, { scope: "config" });
