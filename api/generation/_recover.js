import { recoverUserGenerationJobs } from "../_generation-recovery.js";
import { verifyAuthUser } from "../_credits.js";
import { setNoStoreHeaders } from "../_http.js";
import { loadConfig } from "../../src/config/env.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

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

  const { falKey } = loadConfig();

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Oturum doğrulanamadı." });
  }

  if (await applyVercelRateLimit(response, user.id, ["general"])) return;

  try {
    const jobs = await recoverUserGenerationJobs({
      falKey,
      limit: 20,
      userId: user.id,
    });
    return response.status(200).json({ jobs });
  } catch (error) {
    console.error("[generation-recovery] recover endpoint failed", error);
    return response.status(500).json({
      detail: error?.message || "",
      error: "Yarım kalan görsel üretimleri kontrol edilemedi.",
    });
  }
}

export default withApiErrorBoundary(handler, { scope: "recover-generations" });
