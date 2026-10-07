import {
  patchGenerationJob,
  readGenerationJob,
  sanitizeClientJobId,
} from "../_generation-jobs.js";
import { verifyAuthUser } from "../_credits.js";
import { setNoStoreHeaders } from "../_http.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

const maxJsonBodySize = 32 * 1024;

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

  if (await applyVercelRateLimit(response, user.id, ["general"])) return;

  let body;
  try {
    body = await readRequestBody(request, maxJsonBodySize);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  const clientJobId = sanitizeClientJobId(body.clientJobId || body.client_job_id || body.jobId);
  if (!clientJobId) {
    return response.status(400).json({ error: "Teslim edilecek üretim job id eksik." });
  }

  try {
    const job = await readGenerationJob(clientJobId);
    if (!job || job.userId !== user.id) {
      return response.status(404).json({ error: "Üretim kaydı bulunamadı." });
    }

    const deliveredAt = job.deliveredAt || new Date().toISOString();
    await patchGenerationJob(clientJobId, { deliveredAt });
    return response.status(200).json({ clientJobId, deliveredAt, ok: true });
  } catch (error) {
    console.error("[generation-recovery] delivered mark failed", error);
    return response.status(500).json({
      detail: error?.message || "",
      error: "Üretim teslim edildi olarak işaretlenemedi.",
    });
  }
}

async function readRequestBody(request, maxBytes) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === "string") {
    return parseJsonSource(request.body);
  }

  if (Buffer.isBuffer(request.body)) {
    return parseJsonSource(request.body.toString("utf8"));
  }

  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxBytes) {
      throw new Error("İstek gövdesi çok büyük.");
    }
    chunks.push(buffer);
  }

  return parseJsonSource(Buffer.concat(chunks).toString("utf8"));
}

function parseJsonSource(source) {
  try {
    return JSON.parse(source || "{}");
  } catch {
    throw new Error("JSON gövdesi geçersiz.");
  }
}

export default withApiErrorBoundary(handler, { scope: "generation-delivered" });
