import {
  isCreditConfigError,
  readUserCredits,
  verifyAuthUser,
} from "./_credits.js";
import { setNoStoreHeaders } from "./_http.js";
import { applyVercelRateLimit } from "../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../src/lib/error-boundary.js";

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

  try {
    const wallet = await readUserCredits(user.id);
    return response.status(200).json(wallet);
  } catch (error) {
    console.error("[credits] read failed", error);
    const message = isCreditConfigError(error)
      ? "Kredi sistemi şu an kullanılamıyor."
      : "Kredi bilgisi okunamadı.";
    return response.status(500).json({ error: message });
  }
}

export default withApiErrorBoundary(handler, { scope: "credits" });
