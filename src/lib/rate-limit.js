import { getSupabaseAdminClient } from "../repositories/credits.repo.js";

const TABLE = "ff_rate_limit_events";

const SCOPE_LIMITS = Object.freeze({
  sketch: { limit: 30, windowMs: 60 * 60 * 1000 },
  finish: { limit: 15, windowMs: 60 * 60 * 1000 },
  mockup: { limit: 10, windowMs: 60 * 60 * 1000 },
  general: { limit: 120, windowMs: 60 * 1000 },
});

const SCOPE_LABELS = Object.freeze({
  sketch: "eskiz üretimi",
  finish: "ürün/finish üretimi",
  mockup: "mockup üretimi",
  general: "API",
});

export function getRateLimitConfig(scope) {
  return SCOPE_LIMITS[scope] || null;
}

async function countRecent(admin, userId, scope, since) {
  const { count, error } = await admin
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("scope", scope)
    .gte("created_at", since);
  if (error) throw error;
  return count || 0;
}

async function oldestRecent(admin, userId, scope, since) {
  const { data, error } = await admin
    .from(TABLE)
    .select("created_at")
    .eq("user_id", userId)
    .eq("scope", scope)
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw error;
  return data && data[0] ? data[0].created_at : null;
}

async function checkScope(admin, userId, scope) {
  const config = SCOPE_LIMITS[scope];
  if (!config) {
    throw new Error(`Bilinmeyen rate limit scope: ${scope}`);
  }

  const now = Date.now();
  const since = new Date(now - config.windowMs).toISOString();
  const count = await countRecent(admin, userId, scope, since);

  if (count >= config.limit) {
    const oldestIso = await oldestRecent(admin, userId, scope, since);
    const oldestTime = oldestIso ? new Date(oldestIso).getTime() : now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldestTime + config.windowMs - now) / 1000)
    );
    return {
      allowed: false,
      scope,
      limit: config.limit,
      windowMs: config.windowMs,
      retryAfterSec,
    };
  }

  return {
    allowed: true,
    scope,
    limit: config.limit,
    windowMs: config.windowMs,
    remaining: Math.max(0, config.limit - count - 1),
  };
}

async function recordScope(admin, userId, scope) {
  const { error } = await admin.from(TABLE).insert({ user_id: userId, scope });
  if (error) {
    console.error("[rate-limit] insert failed", error);
  }
}

/**
 * Verilen scope'ları sırayla kontrol eder. Hepsi geçerse her biri için bir
 * olay kaydı yazar ve { allowed: true } döner. Biri başarısız olursa hiçbir
 * kayıt yazılmaz ve { allowed: false, ... } döner.
 */
export async function enforceRateLimits(userId, scopes) {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) {
    const error = new Error("Rate limit için kullanıcı kimliği eksik.");
    error.statusCode = 401;
    throw error;
  }
  const normalizedScopes = Array.isArray(scopes) ? scopes.filter(Boolean) : [];
  if (!normalizedScopes.length) return { allowed: true };

  let admin;
  try {
    admin = getSupabaseAdminClient();
  } catch (error) {
    // Yapılandırma yoksa rate-limit zorlanamaz; hatayı yukarı taşı ki
    // çağıran 500 dönsün, sessizce by-pass etmesin.
    throw error;
  }

  for (const scope of normalizedScopes) {
    const check = await checkScope(admin, safeUserId, scope);
    if (!check.allowed) return check;
  }

  for (const scope of normalizedScopes) {
    await recordScope(admin, safeUserId, scope);
  }

  return { allowed: true };
}

/**
 * Vercel-stil response için yardımcı: rate-limit aşılırsa response'a yazıp
 * `true` döner (handler erken çıkmalı). Aksi halde `false`.
 */
export async function applyVercelRateLimit(response, userId, scopes) {
  try {
    const check = await enforceRateLimits(userId, scopes);
    if (check.allowed) return false;
    const limited = rateLimitedResponse(check);
    response.setHeader("Retry-After", limited.headers["Retry-After"]);
    response.status(limited.statusCode).json(limited.payload);
    return true;
  } catch (error) {
    console.error("[rate-limit] vercel enforcement failed", error);
    response.status(500).json({ error: "Rate limit kontrolü başarısız oldu." });
    return true;
  }
}

export function rateLimitedResponse(check) {
  const label = SCOPE_LABELS[check.scope] || check.scope || "API";
  return {
    statusCode: 429,
    headers: { "Retry-After": String(check.retryAfterSec) },
    payload: {
      error: `${label} için kısa süreli limit aşıldı. Lütfen ${check.retryAfterSec} saniye sonra tekrar deneyin.`,
      retryAfter: check.retryAfterSec,
      scope: check.scope,
      limit: check.limit,
    },
  };
}
