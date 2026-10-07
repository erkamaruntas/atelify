// studio/utils/storage-helpers.js
// Depolama & proje-silme SORGU/DÖNÜŞÜM yardımcıları (yan etkisiz, sadece okur).
// Klasik <script> olarak studio.js'ten ÖNCE yüklenir; tanımlar global kalır.
//
// Çağrı anında studio.js'teki global'lere erişir:
//   - StudioStorage (window.FFStudioStorage sarmalı)
//   - projectDeletionsStorageKey(), storageItemDateValue() (studio.js'te durur)
//   - normalizeProjectDeletionMarker() (pure-helpers.js'te)
// Durum YAZAN orkestrasyon fonksiyonları (configureStudioStorageForUser,
// recordProjectDeletion, cleanScopedStudioStorageForSession,
// recoverLegacyStudioStorageForCurrentUser) bilerek studio.js'te bırakıldı.

function isProjectDeletionMarker(item = {}) {
  return Boolean(item?.id && item?.isDeleted === true);
}

function mergeProjectDeletions(...lists) {
  const byId = new Map();
  lists.flat().forEach((item) => {
    const marker = normalizeProjectDeletionMarker(item);
    if (!marker) return;

    const current = byId.get(marker.id);
    if (!current || storageItemDateValue(marker) >= storageItemDateValue(current)) {
      byId.set(marker.id, marker);
    }
  });

  return Array.from(byId.values())
    .sort((first, second) => storageItemDateValue(second) - storageItemDateValue(first))
    .slice(0, 200);
}

function readProjectDeletions() {
  return mergeProjectDeletions(StudioStorage.readArray(projectDeletionsStorageKey()));
}

function writeProjectDeletions(markers = []) {
  return StudioStorage.writeJson(projectDeletionsStorageKey(), mergeProjectDeletions(markers));
}

function projectDeletionIds(markers = []) {
  return new Set(mergeProjectDeletions(markers).map((marker) => marker.id));
}

function filterProjectDeletionsFromProjects(projects = []) {
  return mergeProjectDeletions((Array.isArray(projects) ? projects : []).filter(isProjectDeletionMarker));
}

function filterActiveProjects(projects = []) {
  return (Array.isArray(projects) ? projects : []).filter((project) => !isProjectDeletionMarker(project));
}

function filterDeletedProjects(projects = [], deletions = []) {
  const deletedIds = projectDeletionIds(deletions);
  return filterActiveProjects(projects).filter((project) => !deletedIds.has(project?.id));
}

// --- Kullanıcıya göre anahtar üretimi (currentUserId + *_STORAGE_KEY sabitleri) ---
function userScopedStorageKey(baseKey, userId = currentUserId) {
  const scope = sanitizeStorageScopeUserId(userId) || "local";
  return `${baseKey}:${scope}`;
}

function studioStorageKeysForUser(userId = currentUserId) {
  return {
    activeProjectKey: userScopedStorageKey(ACTIVE_PROJECT_STORAGE_KEY, userId),
    creditWalletKey: userScopedStorageKey(CREDIT_WALLET_STORAGE_KEY, userId),
    pendingGenerationsKey: userScopedStorageKey(PENDING_GENERATIONS_STORAGE_KEY, userId),
    projectsKey: userScopedStorageKey(PROJECTS_STORAGE_KEY, userId),
    savedDesignsKey: userScopedStorageKey(SAVED_DESIGNS_STORAGE_KEY, userId),
    sourceThumbnailsKey: userScopedStorageKey(SOURCE_THUMBNAILS_STORAGE_KEY, userId),
  };
}

function projectDeletionsStorageKey(userId = currentUserId) {
  return userScopedStorageKey(PROJECT_DELETIONS_STORAGE_KEY, userId);
}

// --- Eski (scope'suz) veri & tarih sorgu yardımcıları ---
function readLegacyStudioState() {
  return {
    activeProjectId: readRawLocalStorageValue(ACTIVE_PROJECT_STORAGE_KEY),
    projects: StudioStorage.readArray(PROJECTS_STORAGE_KEY),
    savedDesigns: StudioStorage.readArray(SAVED_DESIGNS_STORAGE_KEY),
    sourceThumbnails: StudioStorage.readJson(SOURCE_THUMBNAILS_STORAGE_KEY, {}),
  };
}

function readRawLocalStorageValue(key) {
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function legacyItemOwnerId(item = {}) {
  return String(item?.ownerUserId || item?.userId || "").trim();
}

function isLegacyItemOwnedByCurrentUser(item = {}) {
  return Boolean(currentUserId && legacyItemOwnerId(item) === currentUserId);
}

function storageItemDateValue(item = {}) {
  const candidates = [item.deletedAt, item.updatedAt, item.createdAt, item.savedAt, item.generatedAt].filter(Boolean);
  for (const value of candidates) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.getTime();
  }
  return 0;
}

function sessionUserCreatedAtValue(session) {
  const value = session?.user?.created_at || session?.user?.createdAt || "";
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function isItemFromBeforeSessionUser(item, session) {
  const userCreatedAt = sessionUserCreatedAtValue(session);
  if (!userCreatedAt) return false;

  const itemCreatedAt = storageItemDateValue(item);
  if (!itemCreatedAt) return false;

  return itemCreatedAt < userCreatedAt - 5 * 60 * 1000;
}

function isItemFromBeforeCurrentUser(item) {
  if (!currentUserCreatedAtMs) return false;

  const itemCreatedAt = storageItemDateValue(item);
  if (!itemCreatedAt) return false;

  return itemCreatedAt < currentUserCreatedAtMs - 5 * 60 * 1000;
}

function isMisclaimedScopedItem(item = {}, session) {
  const ownerUserId = legacyItemOwnerId(item);
  if (ownerUserId && ownerUserId !== currentUserId) return true;
  return isItemFromBeforeSessionUser(item, session);
}
