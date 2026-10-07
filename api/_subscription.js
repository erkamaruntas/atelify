import { verifyAuthUser } from "../src/services/auth.service.js";
import {
  cancelSubscription,
  getSubscriptionSummary,
} from "../src/services/subscriptions.service.js";
import { setNoStoreHeaders } from "../src/lib/http.js";
import { readJsonRequestBody } from "../src/lib/request-body.js";
import { applyVercelRateLimit } from "../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../src/lib/error-boundary.js";

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "GET" && request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Oturum doğrulanamadı." });
  }

  if (await applyVercelRateLimit(response, user.id, ["general"])) return;

  // GET: abonelik özeti (gösterim için).
  if (request.method === "GET") {
    try {
      const summary = await getSubscriptionSummary({ userId: user.id });
      return response.status(200).json(summary);
    } catch (error) {
      console.error("[subscription] summary read failed", error);
      return response.status(500).json({ error: "Abonelik bilgisi okunamadı." });
    }
  }

  // POST: yalnızca { action: "cancel" } desteklenir (dönem sonunda iptal).
  let body;
  try {
    body = await readJsonRequestBody(request, 8 * 1024);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  const action = typeof body?.action === "string" ? body.action.trim() : "";
  if (action !== "cancel") {
    return response.status(400).json({ error: "Geçersiz işlem." });
  }

  try {
    const result = await cancelSubscription({ userId: user.id });
    if (!result.canceled) {
      return response.status(409).json({ error: "İptal edilecek aktif abonelik bulunamadı.", ...result });
    }
    return response.status(200).json(result);
  } catch (error) {
    console.error("[subscription] cancel failed", error);
    return response.status(500).json({ error: "Abonelik iptal edilemedi. Lütfen tekrar dene." });
  }
}

export default withApiErrorBoundary(handler, { scope: "subscription" });
