import {
  PROFILE_ROLES,
  ensureProfileForUser,
  listProfiles,
  normalizeProfileRole,
  readProfileByUserId,
  updateProfileByUserId,
} from "../repositories/profiles.repo.js";

const MAX_DISPLAY_NAME = 180;
const MAX_BRAND_NAME = 180;
const MAX_FIRST_NAME = 80;
const MAX_LAST_NAME = 80;
const MAX_PHONE = 40;
const MAX_ADDRESS_LINE = 260;
const MAX_ADDRESS_PART = 120;
const MAX_POSTAL_CODE = 32;

function cleanString(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function authErrorPayload() {
  return { status: 401, payload: { error: "Oturum doğrulanamadı." } };
}

export async function getCurrentUserProfile({ user }) {
  if (!user?.id) return authErrorPayload();

  try {
    const profile = await ensureProfileForUser({
      id: user.id,
      email: user.email || "",
    });
    return { status: 200, payload: { profile } };
  } catch (error) {
    console.error("[profiles] read failed", error);
    return {
      status: 500,
      payload: { error: "Profil okunamadı.", detail: error?.message || "" },
    };
  }
}

export async function updateCurrentUserProfile({ user, body }) {
  if (!user?.id) return authErrorPayload();

  const safeBody = body && typeof body === "object" ? body : {};
  const patch = { email: user.email || "" };
  if (Object.prototype.hasOwnProperty.call(safeBody, "displayName")) {
    patch.displayName = cleanString(safeBody.displayName, MAX_DISPLAY_NAME);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "brandName")) {
    patch.brandName = cleanString(safeBody.brandName, MAX_BRAND_NAME);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "firstName")) {
    patch.firstName = cleanString(safeBody.firstName, MAX_FIRST_NAME);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "lastName")) {
    patch.lastName = cleanString(safeBody.lastName, MAX_LAST_NAME);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "phone")) {
    patch.phone = cleanString(safeBody.phone, MAX_PHONE);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "addressLine")) {
    patch.addressLine = cleanString(safeBody.addressLine, MAX_ADDRESS_LINE);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "district")) {
    patch.district = cleanString(safeBody.district, MAX_ADDRESS_PART);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "city")) {
    patch.city = cleanString(safeBody.city, MAX_ADDRESS_PART);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "postalCode")) {
    patch.postalCode = cleanString(safeBody.postalCode, MAX_POSTAL_CODE);
  }
  if (Object.prototype.hasOwnProperty.call(safeBody, "country")) {
    patch.country = cleanString(safeBody.country || "Türkiye", MAX_ADDRESS_PART) || "Türkiye";
  }

  const displayName = [patch.firstName, patch.lastName].filter(Boolean).join(" ").trim();
  if (displayName) patch.displayName = displayName;

  try {
    await ensureProfileForUser({ id: user.id, email: user.email || "" });
    const profile = await updateProfileByUserId(user.id, patch);
    return { status: 200, payload: { profile } };
  } catch (error) {
    console.error("[profiles] update failed", error);
    return {
      status: 500,
      payload: { error: "Profil güncellenemedi.", detail: error?.message || "" },
    };
  }
}

export async function readUserProfile(userId) {
  return readProfileByUserId(userId);
}

export async function userHasAdminRole(userId) {
  const profile = await readProfileByUserId(userId);
  return profile?.role === PROFILE_ROLES.ADMIN;
}

// Yalnızca proje sahibi tarafından çağrılır (owner-only endpoint üzerinden).
// Hedef kullanıcının profil rolünü admin/user olarak ayarlar. Profil satırı
// yoksa (kullanıcı hiç giriş yapmadıysa) önce oluşturulur.
export async function adminSetUserRole({ userId, email = "", role }) {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) {
    return { status: 404, payload: { error: "Kullanıcı bulunamadı." } };
  }

  const normalizedRole = normalizeProfileRole(role);
  try {
    await ensureProfileForUser({ id: safeUserId, email: email || "" });
    const profile = await updateProfileByUserId(safeUserId, { role: normalizedRole });
    return { status: 200, payload: { profile } };
  } catch (error) {
    console.error("[profiles] role update failed", error);
    return {
      status: 500,
      payload: { error: "Rol güncellenemedi.", detail: error?.message || "" },
    };
  }
}

export async function adminListProfiles({ limit = 100, role = "" } = {}) {
  try {
    const profiles = await listProfiles({ limit, role });
    return { status: 200, payload: { profiles } };
  } catch (error) {
    console.error("[profiles] admin list failed", error);
    return {
      status: 500,
      payload: { error: "Profiller okunamadı.", detail: error?.message || "" },
    };
  }
}
