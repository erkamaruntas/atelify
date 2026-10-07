import { verifyAuthUser } from "../../src/services/auth.service.js";
import { initTopupCheckout } from "../../src/services/topup-checkout.service.js";
import { setNoStoreHeaders } from "../../src/lib/http.js";
import { readJsonRequestBody } from "../../src/lib/request-body.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

function clientIpFrom(request) {
  const fwd = request.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return request.socket?.remoteAddress || "";
}

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Oturum doğrulanamadı." });
  }

  if (await applyVercelRateLimit(response, user.id, ["general"])) return;

  let body;
  try {
    body = await readJsonRequestBody(request, 8 * 1024);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  const result = await initTopupCheckout({
    user,
    packKey: typeof body?.packKey === "string" ? body.packKey : "",
    clientIp: clientIpFrom(request),
  });
  return response.status(result.status).json(result.payload);
}

export default withApiErrorBoundary(handler, { scope: "iyzico-topup-checkout" });
