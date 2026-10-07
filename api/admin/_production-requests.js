import { verifyAdminUser } from "../../src/services/auth.service.js";
import {
  adminListAllProductionRequests,
  adminUpdateProductionRequest,
} from "../../src/services/production-requests.service.js";
import { setNoStoreHeaders } from "../../src/lib/http.js";
import { readJsonRequestBody } from "../../src/lib/request-body.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, x-admin-key");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "GET" && request.method !== "PATCH") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let admin;
  try {
    admin = await verifyAdminUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Admin doğrulaması başarısız." });
  }

  if (!admin.isApiKey && (await applyVercelRateLimit(response, admin.id, ["general"]))) return;

  if (request.method === "GET") {
    const filters = {
      limit: readQueryParam(request, "limit"),
      status: readQueryParam(request, "status"),
      userId: readQueryParam(request, "userId"),
    };
    const result = await adminListAllProductionRequests({ filters });
    return response.status(result.status).json(result.payload);
  }

  let body;
  try {
    body = await readJsonRequestBody(request);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  const id = String(body?.id || "").trim();
  if (!id) {
    return response.status(400).json({ error: "Talep id eksik." });
  }

  const result = await adminUpdateProductionRequest({
    id,
    patch: {
      status: typeof body.status === "string" ? body.status : "",
      internalNote: typeof body.internalNote === "string" ? body.internalNote : undefined,
    },
  });
  return response.status(result.status).json(result.payload);
}

function readQueryParam(request, key) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default withApiErrorBoundary(handler, { scope: "admin-production-requests" });
