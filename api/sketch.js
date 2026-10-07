import {
  sanitizeClientJobId,
  sanitizeGenerationJobContext,
} from "../src/repositories/generation-jobs.repo.js";
import { verifyAuthUser } from "../src/services/auth.service.js";
import { runSketchGeneration } from "../src/services/generation.service.js";
import { setNoStoreHeaders } from "../src/lib/http.js";
import { readJsonRequestBody } from "../src/lib/request-body.js";
import { loadConfig } from "../src/config/env.js";
import { applyVercelRateLimit } from "../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../src/lib/error-boundary.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb",
    },
  },
};

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Oturum doğrulanamadı." });
  }

  if (await applyVercelRateLimit(response, user.id, ["sketch", "general"])) return;

  let body;
  try {
    body = await readJsonRequestBody(request);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  const result = await runSketchGeneration({
    user,
    body,
    falKey: loadConfig().falKey,
    clientJobId: sanitizeClientJobId(body.clientJobId || body.client_job_id),
    jobContext: sanitizeGenerationJobContext(body.jobContext),
  });
  return response.status(result.status).json(result.payload);
}

export default withApiErrorBoundary(handler, { scope: "sketch" });
