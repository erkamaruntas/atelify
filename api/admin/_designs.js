import { verifyAdminUser } from "../../src/services/auth.service.js";
import { listRecentDesigns } from "../../src/repositories/designs.repo.js";
import { setNoStoreHeaders } from "../../src/lib/http.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

const DEFAULT_SINCE_DAYS = 30;
const MAX_SINCE_DAYS = 365;

// Admin: bir kullanıcının (userId) ürettiği görselleri listeler. İade/şikayet
// doğrulaması için ticket panelinden çağrılır. Saklama 30 gün olduğundan daha
// eski üretimler arşivde bulunmaz.
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

  let admin;
  try {
    admin = await verifyAdminUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Admin doğrulaması başarısız." });
  }

  if (!admin.isApiKey && (await applyVercelRateLimit(response, admin.id, ["general"]))) return;

  const userId = readQueryParam(request, "userId").trim();
  if (!userId) {
    return response.status(400).json({ error: "userId gerekli." });
  }

  const requestedDays = Number.parseInt(readQueryParam(request, "sinceDays"), 10);
  const sinceDays = Number.isFinite(requestedDays)
    ? Math.min(Math.max(1, requestedDays), MAX_SINCE_DAYS)
    : DEFAULT_SINCE_DAYS;

  const rows = await listRecentDesigns({ userId, sinceDays, limit: 2000 });
  const designs = rows.map(toAdminDesign).filter(Boolean);
  return response.status(200).json({ designs, sinceDays });
}

// Ham satırı (snake_case + assets[]) galeride kullanılacak sade şekle çevirir.
function toAdminDesign(row = {}) {
  const assets = Array.isArray(row.assets) ? row.assets : [];
  const images = assets
    .slice()
    .sort((left, right) => (Number(left.position) || 0) - (Number(right.position) || 0))
    .filter((asset) => asset?.public_url)
    .map((asset) => ({
      url: asset.public_url,
      width: Number.isFinite(Number(asset.width)) ? Number(asset.width) : null,
      height: Number.isFinite(Number(asset.height)) ? Number(asset.height) : null,
    }));
  if (!images.length) return null;
  return {
    id: row.id,
    stage: row.stage || "",
    product: row.product || "",
    productShape: row.product_shape || "",
    title: row.title || "",
    createdAt: row.created_at || null,
    images,
  };
}

function readQueryParam(request, key) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default withApiErrorBoundary(handler, { scope: "admin-designs" });
