import {
  adminGrantCredits,
  isCreditConfigError,
  readUserCredits,
  resolveCreditTarget,
  verifyOwnerUser,
} from "../_credits.js";
import { setNoStoreHeaders } from "../_http.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

const maxJsonBodySize = 64 * 1024;

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, x-admin-key");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let admin;
  try {
    admin = await verifyOwnerUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Yetki doğrulaması başarısız." });
  }

  if (!admin.isApiKey && (await applyVercelRateLimit(response, admin.id, ["general"]))) return;

  if (request.method === "GET") {
    return handleRead(request, response);
  }

  return handleWrite(request, response);
}

async function handleRead(request, response) {
  const target = await targetUserIdFromRequest(request, response);
  if (target === null) return;

  if (!target) {
    return response.status(200).json({ isAdmin: true, isOwner: true });
  }

  try {
    const wallet = await readUserCredits(target);
    return response.status(200).json({ isAdmin: true, isOwner: true, userId: target, wallet });
  } catch (error) {
    console.error("[credits] admin read failed", error);
    return response.status(500).json({ error: creditErrorMessage(error, "Kredi bilgisi okunamadı.") });
  }
}

async function handleWrite(request, response) {
  let body;
  try {
    body = await readRequestBody(request, maxJsonBodySize);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  const amount = Math.trunc(Number(body.amount));
  if (!Number.isFinite(amount) || amount < 0) {
    return response.status(400).json({ error: "Kredi miktarı 0 veya daha büyük bir sayı olmalı." });
  }

  const targetUserId = await resolveCreditTarget({
    email: typeof body.email === "string" ? body.email : "",
    userId: typeof body.userId === "string" ? body.userId : "",
  });

  if (!targetUserId) {
    return response.status(404).json({ error: "Kullanıcı bulunamadı." });
  }

  try {
    await adminGrantCredits({
      userId: targetUserId,
      amount,
      label: typeof body.label === "string" && body.label.trim() ? body.label.trim() : undefined,
      mode: body.mode,
      planKey: typeof body.planKey === "string" && body.planKey.trim() ? body.planKey.trim() : null,
      isUnlimited: typeof body.isUnlimited === "boolean" ? body.isUnlimited : null,
    });
    const wallet = await readUserCredits(targetUserId);
    return response.status(200).json({ isAdmin: true, ok: true, userId: targetUserId, wallet });
  } catch (error) {
    console.error("[credits] admin grant failed", error);
    return response.status(500).json({ error: creditErrorMessage(error, "Kredi yüklenirken hata oluştu.") });
  }
}

async function targetUserIdFromRequest(request, response) {
  const email = readQueryParam(request, "email");
  const userId = readQueryParam(request, "userId");
  if (!email && !userId) return "";

  try {
    const target = await resolveCreditTarget({ email, userId });
    if (!target) {
      response.status(404).json({ error: "Kullanıcı bulunamadı." });
      return null;
    }
    return target;
  } catch (error) {
    console.error("[credits] admin target lookup failed", error);
    response.status(500).json({ error: "Kullanıcı aranırken hata oluştu." });
    return null;
  }
}

function readQueryParam(request, key) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function creditErrorMessage(error, fallback) {
  return isCreditConfigError(error)
    ? "Kredi sistemi şu an kullanılamıyor."
    : fallback;
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

  return readJsonStream(request, maxBytes);
}

function readJsonStream(request, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("İstek gövdesi çok büyük."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        resolve(parseJsonSource(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function parseJsonSource(source) {
  try {
    return JSON.parse(source || "{}");
  } catch {
    throw new Error("JSON gövdesi okunamadı.");
  }
}

export default withApiErrorBoundary(handler, { scope: "admin-credits" });
