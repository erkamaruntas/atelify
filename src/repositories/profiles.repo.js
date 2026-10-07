import { getSupabaseAdminClient } from "./credits.repo.js";

const TABLE = "profiles";
const MAX_LIMIT = 200;

export const PROFILE_ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

function cleanString(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanLimit(value, fallback = 50) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(MAX_LIMIT, Math.max(1, parsed));
}

export function normalizeProfileRole(value) {
  return String(value || "").trim().toLowerCase() === PROFILE_ROLES.ADMIN
    ? PROFILE_ROLES.ADMIN
    : PROFILE_ROLES.USER;
}

function isProfileRole(value) {
  return [PROFILE_ROLES.ADMIN, PROFILE_ROLES.USER].includes(String(value || "").trim().toLowerCase());
}

export function rowToProfile(row) {
  if (!row) return null;
  return {
    userId: row.user_id,
    email: row.email || "",
    displayName: row.display_name || "",
    brandName: row.brand_name || "",
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    phone: row.phone || "",
    addressLine: row.address_line || "",
    district: row.district || "",
    city: row.city || "",
    postalCode: row.postal_code || "",
    country: row.country || "Türkiye",
    role: normalizeProfileRole(row.role),
    createdAt: row.created_at || null,
  };
}

function profileInsertPayload(user) {
  const userId = cleanString(user?.id, 160);
  if (!userId) return null;

  return {
    user_id: userId,
    email: cleanString(user?.email, 320),
    display_name: cleanString(user?.displayName || user?.display_name, 180),
    brand_name: cleanString(user?.brandName || user?.brand_name, 180),
    first_name: cleanString(user?.firstName || user?.first_name, 80),
    last_name: cleanString(user?.lastName || user?.last_name, 80),
    phone: cleanString(user?.phone, 40),
    address_line: cleanString(user?.addressLine || user?.address_line, 260),
    district: cleanString(user?.district, 120),
    city: cleanString(user?.city, 120),
    postal_code: cleanString(user?.postalCode || user?.postal_code, 32),
    country: cleanString(user?.country || "Türkiye", 120),
    role: PROFILE_ROLES.USER,
  };
}

function profilePatchPayload(patch) {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(patch, "email")) {
    updates.email = cleanString(patch.email, 320);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "displayName")) {
    updates.display_name = cleanString(patch.displayName, 180);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "display_name")) {
    updates.display_name = cleanString(patch.display_name, 180);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "brandName")) {
    updates.brand_name = cleanString(patch.brandName, 180);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "brand_name")) {
    updates.brand_name = cleanString(patch.brand_name, 180);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "firstName")) {
    updates.first_name = cleanString(patch.firstName, 80);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "first_name")) {
    updates.first_name = cleanString(patch.first_name, 80);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "lastName")) {
    updates.last_name = cleanString(patch.lastName, 80);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "last_name")) {
    updates.last_name = cleanString(patch.last_name, 80);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "phone")) {
    updates.phone = cleanString(patch.phone, 40);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "addressLine")) {
    updates.address_line = cleanString(patch.addressLine, 260);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "address_line")) {
    updates.address_line = cleanString(patch.address_line, 260);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "district")) {
    updates.district = cleanString(patch.district, 120);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "city")) {
    updates.city = cleanString(patch.city, 120);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "postalCode")) {
    updates.postal_code = cleanString(patch.postalCode, 32);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "postal_code")) {
    updates.postal_code = cleanString(patch.postal_code, 32);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "country")) {
    updates.country = cleanString(patch.country || "Türkiye", 120);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "role")) {
    updates.role = normalizeProfileRole(patch.role);
  }

  return updates;
}

export async function ensureProfileForUser(user) {
  const payload = profileInsertPayload(user);
  if (!payload) return null;

  const admin = getSupabaseAdminClient();
  const existing = await readProfileByUserId(payload.user_id);
  if (existing) {
    if (payload.email && payload.email !== existing.email) {
      return updateProfileByUserId(payload.user_id, { email: payload.email });
    }
    return existing;
  }

  const { data, error } = await admin.from(TABLE).insert(payload).select("*").single();

  if (error) {
    if (error.code === "23505") return readProfileByUserId(payload.user_id);
    throw error;
  }
  return rowToProfile(data);
}

export async function readProfileByUserId(userId) {
  const safeUserId = cleanString(userId, 160);
  if (!safeUserId) return null;

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from(TABLE)
    .select("*")
    .eq("user_id", safeUserId)
    .maybeSingle();

  if (error) throw error;
  return rowToProfile(data);
}

export async function updateProfileByUserId(userId, patch) {
  const safeUserId = cleanString(userId, 160);
  if (!safeUserId) return null;

  const updates = profilePatchPayload(patch || {});
  if (!Object.keys(updates).length) return readProfileByUserId(safeUserId);

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from(TABLE)
    .update(updates)
    .eq("user_id", safeUserId)
    .select("*")
    .single();

  if (error) throw error;
  return rowToProfile(data);
}

export async function listProfiles(options = {}) {
  const admin = getSupabaseAdminClient();
  const limit = cleanLimit(options.limit);

  let query = admin.from(TABLE).select("*").order("created_at", { ascending: false }).limit(limit);

  if (isProfileRole(options.role)) query = query.eq("role", normalizeProfileRole(options.role));

  const { data, error } = await query;
  if (error) throw error;

  return (Array.isArray(data) ? data : []).map(rowToProfile).filter(Boolean);
}

// Birden çok user_id için profilleri tek sorguda getirir (admin listelerini
// e-posta/isim ile zenginleştirmek için).
export async function listProfilesByUserIds(userIds = []) {
  const ids = Array.from(
    new Set((Array.isArray(userIds) ? userIds : []).map((id) => cleanString(id, 160)).filter(Boolean))
  );
  if (!ids.length) return [];

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from(TABLE).select("*").in("user_id", ids);
  if (error) throw error;

  return (Array.isArray(data) ? data : []).map(rowToProfile).filter(Boolean);
}
