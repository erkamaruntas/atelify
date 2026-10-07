import { handlePlanCheckoutCallback } from "../../src/services/iyzico-checkout.service.js";
import { loadConfig } from "../../src/config/env.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

// iyzico callback'i x-www-form-urlencoded ile `token` postlar; ham gövdeyi kendimiz
// okuyup parse ediyoruz (bodyParser kapalı).
function readRawBody(request) {
  return new Promise((resolve) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 16 * 1024) data = data.slice(0, 16 * 1024);
    });
    request.on("end", () => resolve(data));
    request.on("error", () => resolve(""));
  });
}

async function extractToken(request) {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const queryToken = url.searchParams.get("token");
  if (queryToken) return queryToken;
  const raw = await readRawBody(request);
  try {
    return new URLSearchParams(raw).get("token") || "";
  } catch {
    return "";
  }
}

function redirect(response, location) {
  response.statusCode = 302;
  response.setHeader("Location", location);
  response.setHeader("Cache-Control", "no-store");
  return response.end();
}

async function handler(request, response) {
  const config = loadConfig();
  const base = config.siteUrl || "";

  if (request.method !== "POST" && request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const token = await extractToken(request);
  const result = await handlePlanCheckoutCallback({ token });

  if (result.ok) {
    return redirect(response, `${base}/odeme.html?sonuc=basarili&paket=${encodeURIComponent(result.planKey || "")}`);
  }
  return redirect(response, `${base}/odeme.html?sonuc=hata&neden=${encodeURIComponent(result.reason || "bilinmeyen")}`);
}

export default withApiErrorBoundary(handler, { scope: "iyzico-callback" });
