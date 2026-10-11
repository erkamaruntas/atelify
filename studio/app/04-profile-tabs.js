// Atelify stüdyo — profile-tabs
// Profil ekranı, sekmeler, adres çubuğu (hash) yönlendirmesi ve sayfa yaşam döngüsü.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function profileStorageKey(baseKey) {
  return `${baseKey}:${currentUserId || "local"}`;
}

function sanitizeProfile(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const legacyName = String(source.displayName || "").trim();
  const legacyParts = legacyName.split(/\s+/).filter(Boolean);
  const fallbackFirstName = legacyParts[0] || "";
  const fallbackLastName = legacyParts.slice(1).join(" ");
  return {
    addressLine: String(source.addressLine || "").trim(),
    city: String(source.city || "").trim(),
    country: String(source.country || "Türkiye").trim(),
    district: String(source.district || "").trim(),
    firstName: String(source.firstName || fallbackFirstName).trim(),
    lastName: String(source.lastName || fallbackLastName).trim(),
    phone: String(source.phone || "").trim(),
    postalCode: String(source.postalCode || "").trim(),
  };
}

function defaultProfilePreferences() {
  return {
    announcements: false,
    credits: true,
    production: true,
  };
}

function sanitizeProfilePreferences(value = {}) {
  const defaults = defaultProfilePreferences();
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, typeof source[key] === "boolean" ? source[key] : defaults[key]])
  );
}

function readStoredProfile() {
  return sanitizeProfile(StudioStorage.readJson(profileStorageKey(PROFILE_STORAGE_KEY), {}));
}

function writeStoredProfile(profile) {
  return StudioStorage.writeJson(profileStorageKey(PROFILE_STORAGE_KEY), sanitizeProfile(profile));
}

function profileFromServer(value = {}) {
  const profile = value?.profile && typeof value.profile === "object" ? value.profile : value;
  return sanitizeProfile({
    addressLine: profile.addressLine,
    city: profile.city,
    country: profile.country,
    district: profile.district,
    displayName: profile.displayName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    postalCode: profile.postalCode,
  });
}

function mergeProfileForDisplay(localProfile, serverProfile) {
  const local = sanitizeProfile(localProfile);
  const remote = sanitizeProfile(serverProfile);
  const merged = { ...local };
  Object.entries(remote).forEach(([key, value]) => {
    if (key === "country" || String(value || "").trim()) merged[key] = value;
  });
  return sanitizeProfile(merged);
}

function canSyncProfileWithServer() {
  const email = currentProfileEmail();
  return Boolean(
    currentUserId &&
    studioSupabase &&
    email &&
    email !== "—" &&
    !email.endsWith("@ff.local") &&
    studioApi?.readProfile &&
    studioApi?.updateProfile
  );
}

async function syncProfileFromServer() {
  if (!canSyncProfileWithServer()) return;
  try {
    const { payload, response } = await studioApi.readProfile();
    if (!response.ok) return;
    const profile = mergeProfileForDisplay(readStoredProfile(), profileFromServer(payload));
    writeStoredProfile(profile);
    renderProfileForm();
    renderOrderCart();
  } catch (error) {
    console.warn("[profile] remote profile could not be read.", error);
  }
}

function readStoredProfilePreferences() {
  return sanitizeProfilePreferences(
    StudioStorage.readJson(profileStorageKey(PROFILE_PREFERENCES_STORAGE_KEY), {})
  );
}

function writeStoredProfilePreferences(preferences) {
  return StudioStorage.writeJson(
    profileStorageKey(PROFILE_PREFERENCES_STORAGE_KEY),
    sanitizeProfilePreferences(preferences)
  );
}

function renderProfilePanel(session = {}) {
  const email = session?.user?.email || "";
  if (profileEmail) profileEmail.textContent = email || "—";
  if (profileUserId) profileUserId.textContent = currentUserId || "Yerel test modu";
  renderProfileForm();
  renderProfilePreferences();
}

function renderProfileForm() {
  if (!profileForms.length) return;
  const profile = readStoredProfile();
  Object.entries(profile).forEach(([key, value]) => {
    profileForms.forEach((form) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
  });
}

function renderProfilePreferences() {
  const preferences = readStoredProfilePreferences();
  profilePreferenceInputs.forEach((input) => {
    input.checked = preferences[input.dataset.profilePref] !== false;
  });
}

function setProfilePanelStatus(element, message = "", tone = "") {
  if (!element) return;
  if (!message || !isVisibleStatusTone(tone)) {
    element.hidden = true;
    element.textContent = "";
    element.removeAttribute("data-tone");
    return;
  }
  element.hidden = false;
  element.textContent = message;
  element.dataset.tone = tone === "notice" ? "success" : tone;
}

function profileFormData() {
  if (!profileForms.length) return {};
  const merged = new FormData();
  profileForms.forEach((form) => {
    new FormData(form).forEach((value, key) => merged.set(key, value));
  });
  return sanitizeProfile({
    addressLine: merged.get("addressLine"),
    city: merged.get("city"),
    country: merged.get("country"),
    district: merged.get("district"),
    firstName: merged.get("firstName"),
    lastName: merged.get("lastName"),
    phone: merged.get("phone"),
    postalCode: merged.get("postalCode"),
  });
}

async function saveProfileForm(event) {
  event.preventDefault();
  const statusTarget = event.currentTarget?.dataset.profileSection === "address" ? profileAddressStatus : profileStatus;
  const profile = profileFormData();
  if (!writeStoredProfile(profile)) {
    setProfilePanelStatus(statusTarget, "Profil kaydedilemedi. Tarayıcı depolaması kapalı olabilir.", "error");
    return;
  }
  setProfilePanelStatus(statusTarget, "Profil kaydediliyor...", "");

  if (canSyncProfileWithServer()) {
    try {
      const { payload, response } = await studioApi.updateProfile(profile);
      if (!response.ok) {
        throw new Error(payload?.error || "Profil kaydedilemedi.");
      }
      writeStoredProfile(profileFromServer(payload));
      renderProfileForm();
    } catch (error) {
      setProfilePanelStatus(
        statusTarget,
        `${error.message || "Profil kaydedilemedi."} Bilgiler bu tarayıcıda saklandı.`,
        "error"
      );
      renderOrderCart();
      return;
    }
  }

  setProfilePanelStatus(statusTarget, "Profil kaydedildi.", "success");
  renderOrderCart();
}

function saveProfilePreferences() {
  const preferences = readStoredProfilePreferences();
  profilePreferenceInputs.forEach((input) => {
    preferences[input.dataset.profilePref] = input.checked;
  });
  writeStoredProfilePreferences(preferences);
}

function currentProfileEmail() {
  const email = profileEmail?.textContent || "";
  return String(email || "").trim();
}

function buildStudioAuthRedirectUrl() {
  const baseUrl = studioPublicConfig?.siteUrl || window.location.href;
  try {
    return new URL("./login", baseUrl).toString();
  } catch {
    return new URL("./login", window.location.href).toString();
  }
}

async function sendProfilePasswordReset() {
  const email = currentProfileEmail();
  if (!email || email === "—" || email.endsWith("@ff.local")) {
    setProfilePanelStatus(profileSecurityStatus, "Şifre sıfırlama için aktif bir e-posta oturumu gerekli.", "error");
    return;
  }
  if (!studioSupabase) {
    setProfilePanelStatus(profileSecurityStatus, "Oturum bağlantısı hazır değil. Sayfayı yenileyip tekrar dene.", "error");
    return;
  }

  const defaultLabel = profilePasswordResetButton?.textContent?.trim() || "Şifre sıfırlama maili gönder";
  if (profilePasswordResetButton) {
    profilePasswordResetButton.disabled = true;
    profilePasswordResetButton.textContent = "Gönderiliyor...";
  }
  setProfilePanelStatus(profileSecurityStatus, "");

  try {
    const { error } = await withTimeout(
      studioSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildStudioAuthRedirectUrl(),
      }),
      STUDIO_AUTH_TIMEOUT_MS,
      "Şifre sıfırlama isteği zaman aşımına uğradı."
    );
    if (error) throw error;
    setProfilePanelStatus(profileSecurityStatus, `${email} adresine sıfırlama maili gönderildi.`, "notice");
  } catch (error) {
    setProfilePanelStatus(profileSecurityStatus, error.message || "Şifre sıfırlama maili gönderilemedi.", "error");
  } finally {
    if (profilePasswordResetButton) {
      profilePasswordResetButton.disabled = false;
      profilePasswordResetButton.textContent = defaultLabel;
    }
  }
}

function switchProfileSection(sectionKey = "contact") {
  const key = String(sectionKey || "contact");
  document.querySelectorAll("[data-profile-nav]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.profileNav === key);
  });
  document.querySelectorAll("[data-profile-section]").forEach((section) => {
    section.hidden = section.dataset.profileSection !== key;
  });
}

function bindProfileControls() {
  document.querySelectorAll("[data-profile-nav]").forEach((button) => {
    button.addEventListener("click", () => switchProfileSection(button.dataset.profileNav));
  });
  profileForms.forEach((form) => {
    form.addEventListener("submit", saveProfileForm);
    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        renderProfileForm();
        setProfilePanelStatus(profileStatus, "");
        setProfilePanelStatus(profileAddressStatus, "");
      }, 0);
    });
  });
  profilePreferenceInputs.forEach((input) => {
    input.addEventListener("change", saveProfilePreferences);
  });
  profilePasswordResetButton?.addEventListener("click", () => {
    sendProfilePasswordReset();
  });
}

function switchOrderSection(sectionKey = "create") {
  const key = String(sectionKey || "create");
  document.querySelectorAll("[data-order-nav]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.orderNav === key);
  });
  document.querySelectorAll("[data-order-section]").forEach((section) => {
    section.hidden = section.dataset.orderSection !== key;
  });
}

function bindOrderSectionControls() {
  document.querySelectorAll("[data-order-nav]").forEach((button) => {
    button.addEventListener("click", () => switchOrderSection(button.dataset.orderNav));
  });
  bindChainShopControls();
}

function revealStudioShell() {
  authLoading.classList.add("is-done");
  studioShell.classList.add("is-visible");
}

function handleStudioPageExit() {
  flushStudioStateForLifecycle();
}

function handleStudioPageShow(event) {
  if (studioShell && currentUserId) studioShell.classList.add("is-visible");
  if (authLoading && currentUserId) authLoading.classList.add("is-done");

  if (event?.persisted) {
    restoreStoredActiveProjectWorkspace({ scroll: false, updateHash: false });
    syncVisiblePendingGenerations({ resume: true });
  }
}

function flushStudioStateForLifecycle() {
  flushProjectSave();
  if (!canSyncCloudStudioState()) return;

  scheduleCloudStudioStateSync(0);
  flushCloudStudioStateSync().catch((error) => {
    console.warn("[sync] Lifecycle cloud sync flush failed.", error);
  });
}

function switchTab(tabKey, options = {}) {
  const requestedTabKey = String(tabKey || "");
  let nextTab = tabController.normalize(requestedTabKey);
  const requestedProfileSection = options.profileSection || profileSectionFromRouteKey(requestedTabKey);
  if (!isTabAllowedForRole(nextTab)) {
    nextTab = defaultTabForRole();
  }
  if (!ROUTABLE_TABS.has(nextTab)) return;

  if (options.skipProjectSave !== true) {
    flushProjectSave();
  }
  tabController.switchTo(nextTab);
  if (nextTab === "profil" && requestedProfileSection) {
    switchProfileSection(requestedProfileSection);
  }

  if (nextTab === "projeler" && options.showProjectLibrary !== false) {
    const hasActiveJobsForProject = activePendingGenerations().some(
      (job) => generationProjectId(job) === activeProjectId
    );
    if (!hasActiveJobsForProject) {
      showProjectLibrary();
    }
  }

  revealActiveTabContent(nextTab);
  if (nextTab === "projeler") {
    syncVisiblePendingGenerations({ resume: true });
  }
  if (nextTab === "uretim") {
    if (options.orderSection) switchOrderSection(options.orderSection);
    renderOrderDesignGallery();
    loadAndRenderProductionRequests();
  }
  // Ticket dışındaki tablara geçerken polling'i durdur.
  stopTicketPolling();
  if (nextTab === "ticket") {
    loadAndRenderTickets();
    startTicketPolling();
  }
  // Admin destek paneli için de aynı canlı güncelleme.
  stopAdminTicketPolling();
  if (nextTab === "yonetim") {
    loadAndRenderAdminTickets();
    startAdminTicketPolling();
  }

  if (options.updateHash !== false) {
    updateTabHash(nextTab);
  }

  if (options.scroll !== false) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  scheduleManagedImageVisibilityRefresh();
}

function revealActiveTabContent(tabKey) {
  const activePanel = Array.from(TAB_PANELS).find((panel) => (
    tabController.normalize(panel.dataset.panel) === tabKey
  ));

  activePanel?.querySelectorAll(".reveal").forEach((item) => {
    item.classList.add("is-visible");
  });
}

function bindTabNav() {
  tabController.bind(switchTab);
}

function bindTabHashRoute() {
  window.addEventListener("hashchange", () => {
    const routeKey = routeKeyFromLocationHash();
    switchTab(tabFromRouteKey(routeKey) || "genel", {
      profileSection: profileSectionFromRouteKey(routeKey),
      updateHash: false,
    });
  });
}

function bindPendingGenerationPersistence() {
  window.addEventListener("storage", (event) => {
    if (
      ![studioStore.pendingGenerationsKey, studioStore.projectsKey, studioStore.savedDesignsKey].includes(event.key)
    ) {
      return;
    }

    syncVisiblePendingGenerations({ resume: event.key === studioStore.pendingGenerationsKey });
  });

  window.addEventListener("focus", () => {
    syncVisiblePendingGenerations({ resume: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncVisiblePendingGenerations({ resume: true });
    } else {
      flushStudioStateForLifecycle();
    }
  });
}

function openInitialStudioTab(shouldOpenPackagePanel) {
  if (shouldOpenPackagePanel) {
    switchTab("profil", { profileSection: "billing", scroll: false });
    return;
  }

  const initialRouteKey = routeKeyFromLocationHash();
  const initialTab = tabFromRouteKey(initialRouteKey);
  if ((!initialTab || initialTab === "projeler") && restoreStoredActiveProjectWorkspace({ scroll: false, updateHash: false })) {
    return;
  }

  if (initialTab) {
    switchTab(initialTab, {
      profileSection: profileSectionFromRouteKey(initialRouteKey),
      scroll: false,
    });
  }
}

function restoreStoredActiveProjectWorkspace(options = {}) {
  const storedProjectId = readStoredActiveProjectId();
  if (!storedProjectId) return false;

  const projectExists = readProjects().some((project) => project.id === storedProjectId);
  if (!projectExists) {
    studioStore.clearActiveProjectId(storedProjectId);
    return false;
  }

  openProject(storedProjectId, {
    scroll: options.scroll,
    updateHash: options.updateHash,
  });
  return true;
}

function tabFromLocationHash() {
  return tabFromRouteKey(routeKeyFromLocationHash());
}

function routeKeyFromLocationHash() {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#/, "")).trim();
  } catch {
    return "";
  }
}

function tabFromRouteKey(routeKey) {
  const tabKey = tabController.normalize(routeKey);
  return ROUTABLE_TABS.has(tabKey) ? tabKey : "";
}

function profileSectionFromRouteKey(routeKey) {
  return PROFILE_SECTION_ALIASES[String(routeKey || "").trim()] || "";
}

function updateTabHash(tabKey) {
  if (!ROUTABLE_TABS.has(tabKey)) return;

  const nextHash = `#${encodeURIComponent(tabKey)}`;
  if (window.location.hash === nextHash) return;

  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
}
