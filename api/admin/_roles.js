import { resolveCreditTarget, verifyOwnerUser } from "../_credits.js";
import { setNoStoreHeaders } from "../_http.js";
import { applyVercelRateLimit } from "../../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";
import {
  adminListProfiles,
  adminSetUserRole,
  readUserProfile,
} from "../../src/services/profiles.service.js";

const maxJsonBodySize = 64 * 1024;

// Kullanıcılara admin rolü verme/alma. Yalnızca proje sahibine açık
// (verifyOwnerUser); profil rolü admin olan diğer hesaplar erişemez.
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

  let owner;
  try {
    owner = await verifyOwnerUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Yetki doğrulaması başarısız." });
  }

  if (!owner.isApiKey && (await applyVercelRateLimit(response, owner.id, ["general"]))) return;

  if (request.method === "GET") {
    return handleRead(request, response);
  }

  return handleWrite(request, response);
}

async function handleRead(request, response) {
  const email = readQueryParam(request, "email");
  const userId = readQueryParam(request, "userId");

  // Parametre yoksa mevcut admin listesini döndür.
  if (!email && !userId) {
    const result = await adminListProfiles({ role: "admin" });
    return response.status(result.status).json({ isOwner: true, ...result.payload });
  }

  let targetUserId;
  try {
    targetUserId = await resolveCreditTarget({ email, userId });
  } catch (error) {
    console.error("[roles] target lookup failed", error);
    return response.status(500).json({ error: "Kullanıcı aranırken hata oluştu." });
  }
  if (!targetUserId) {
    return response.status(404).json({ error: "Kullanıcı bulunamadı." });
  }

  try {
    const profile = await readUserProfile(targetUserId);
    return response.status(200).json({ isOwner: true, userId: targetUserId, profile });
  } catch (error) {
    console.error("[roles] profile read failed", error);
    return response.status(500).json({ error: "Profil okunamadı." });
  }
}

async function handleWrite(request, response) {
  let body;
  try {
    body = await readRequestBody(request, maxJsonBodySize);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  const role = String(body?.role || "").trim().toLowerCase();
  if (role !== "admin" && role !== "user") {
    return response.status(400).json({ error: "Rol 'admin' veya 'user' olmalı." });
  }

  const email = typeof body.email === "string" ? body.email : "";
  let userId;
  try {
    userId = await resolveCreditTarget({ email, userId: typeof body.userId === "string" ? body.userId : "" });
  } catch (error) {
    console.error("[roles] target lookup failed", error);
    return response.status(500).json({ error: "Kullanıcı aranırken hata oluştu." });
  }
  if (!userId) {
    return response.status(404).json({ error: "Kullanıcı bulunamadı." });
  }

  const result = await adminSetUserRole({ userId, email, role });
  return response.status(result.status).json({ isOwner: true, ...result.payload });
}

function readQueryParam(request, key) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] || "" : value || "";
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

export default withApiErrorBoundary(handler, { scope: "admin-roles" });
