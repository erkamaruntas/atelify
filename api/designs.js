import { verifyAuthUser } from "../src/services/auth.service.js";
import { listRecentDesigns, deleteDesignsOlderThan } from "../src/repositories/designs.repo.js";
import { setNoStoreHeaders } from "../src/lib/http.js";
import { applyVercelRateLimit } from "../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../src/lib/error-boundary.js";

const DEFAULT_SINCE_DAYS = 30;
const MAX_SINCE_DAYS = 365;
const RETENTION_DAYS = 30;

// Vercel Cron, "Authorization: Bearer <CRON_SECRET>" başlığıyla çağırır.
function isCronAuthorized(request) {
  const secret = process.env.CRON_SECRET || "";
  if (!secret) return false;
  return String(request.headers?.authorization || "") === `Bearer ${secret}`;
}

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  // Zamanlanmış temizlik (Hobby plan function sınırı için ayrı cron dosyası yerine
  // burada): 30 günden eski tasarımları ve Storage görsellerini siler.
  if (readQueryParam(request, "task") === "cleanup") {
    if (!isCronAuthorized(request)) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const result = await deleteDesignsOlderThan({ days: RETENTION_DAYS });
    return response.status(200).json({ ok: true, retentionDays: RETENTION_DAYS, ...result });
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

  const requestedDays = Number.parseInt(readQueryParam(request, "sinceDays") || readQueryParam(request, "days"), 10);
  const sinceDays = Number.isFinite(requestedDays)
    ? Math.min(Math.max(1, requestedDays), MAX_SINCE_DAYS)
    : DEFAULT_SINCE_DAYS;

  const designs = await listRecentDesigns({ userId: user.id, sinceDays });
  return response.status(200).json({ designs, sinceDays });
}

function readQueryParam(request, key) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default withApiErrorBoundary(handler, { scope: "designs" });
