import { timingSafeEqual } from "node:crypto";
import { getSupabaseAuthClient } from "../repositories/credits.repo.js";
import { loadConfig } from "../config/env.js";
import { userHasAdminRole } from "./profiles.service.js";

function readHeader(request, name) {
  const headers = request?.headers || {};
  const normalizedName = String(name || "").toLowerCase();
  if (typeof headers.get === "function") {
    return headers.get(name) || headers.get(normalizedName) || "";
  }
  return headers[normalizedName] || headers[name] || "";
}

function safeEqual(left, right) {
  const leftValue = String(left || "");
  const rightValue = String(right || "");
  if (!leftValue || !rightValue) return false;
  const leftBuffer = Buffer.from(leftValue);
  const rightBuffer = Buffer.from(rightValue);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function extractBearerToken(request) {
  const header = readHeader(request, "authorization");
  const match = /^Bearer\s+(.+)$/i.exec(String(header).trim());
  return match ? match[1].trim() : "";
}

export async function verifyAuthUser(request) {
  const token = extractBearerToken(request);
  if (!token) {
    const error = new Error("Oturum belirteci bulunamadı.");
    error.statusCode = 401;
    throw error;
  }

  const auth = getSupabaseAuthClient();
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data?.user?.id) {
    const wrapped = new Error("Oturum doğrulanamadı.");
    wrapped.statusCode = 401;
    throw wrapped;
  }

  return { id: data.user.id, email: data.user.email || "" };
}

export function isAdminUser(user) {
  const userId = String(user?.id || "").trim();
  const email = String(user?.email || "").trim().toLowerCase();
  const { adminUserIds, adminEmails } = loadConfig();
  const adminUserIdSet = new Set(adminUserIds);
  const adminEmailSet = new Set(adminEmails);

  return Boolean(
    (userId && adminUserIdSet.has(userId)) || (email && adminEmailSet.has(email))
  );
}

export async function verifyAdminUser(request) {
  const { adminApiKey } = loadConfig();
  const providedAdminKey = String(readHeader(request, "x-admin-key") || "").trim();
  if (adminApiKey && providedAdminKey && safeEqual(providedAdminKey, adminApiKey)) {
    return { email: "", id: "admin-api-key", isApiKey: true, isOwner: true };
  }

  const user = await verifyAuthUser(request);
  const isOwner = isAdminUser(user);
  let hasAdminProfile = false;
  try {
    hasAdminProfile = await userHasAdminRole(user.id);
  } catch (error) {
    console.warn("[auth] profile admin role check failed.", error);
  }

  if (isOwner || hasAdminProfile) {
    return { ...user, isApiKey: false, isOwner };
  }

  const error = new Error("Bu işlem için yönetici yetkisi gerekli.");
  error.statusCode = 403;
  throw error;
}

// Yalnızca proje sahibine açık işlemler (örn. kredi yükleme) için. Sahiplik
// env allowlist (FF_ADMIN_EMAILS / FF_ADMIN_USER_IDS) veya ADMIN_API_KEY ile
// belirlenir; profilinde admin rolü olan diğer yöneticiler sahip sayılmaz.
export async function verifyOwnerUser(request) {
  const admin = await verifyAdminUser(request);
  if (admin.isOwner) return admin;

  const error = new Error("Bu işlem için proje sahibi yetkisi gerekli.");
  error.statusCode = 403;
  throw error;
}

export function isCreditConfigError(error) {
  if (!error) return false;
  const message = String(error?.message || "");
  return /SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_PUBLISHABLE_KEY/.test(message);
}
