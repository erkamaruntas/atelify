import {
  isCreditConfigError,
  listUserSpendingSummaries,
  verifyOwnerUser,
} from "../_credits.js";
import { setNoStoreHeaders } from "../_http.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, x-admin-key");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let owner;
  try {
    owner = await verifyOwnerUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Yetki doğrulaması başarısız." });
  }

  if (!owner.isApiKey && (await applyVercelRateLimit(response, owner.id, ["general"]))) return;

  const limit = readQueryParam(request, "limit");
  try {
    const report = await listUserSpendingSummaries({ limit });
    return response.status(200).json({ isOwner: true, ...report });
  } catch (error) {
    console.error("[spending] owner report failed", error);
    return response.status(500).json({
      error: isCreditConfigError(error)
        ? "Kredi sistemi şu an kullanılamıyor."
        : "Harcama raporu okunamadı.",
    });
  }
}

function readQueryParam(request, key) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default withApiErrorBoundary(handler, { scope: "admin-spending" });
