// Atelify stüdyo — auth
// Supabase oturumu ve initStudio (stüdyoyu başlatan ana fonksiyon).
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function withTimeout(promise, timeoutMs, message) {
  let timeoutId = 0;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      const error = new Error(message || "İşlem zaman aşımına uğradı.");
      error.name = "TimeoutError";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dynamic-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`${src} yüklenemedi.`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.dynamicSrc = src;
    script.src = src;
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`${src} yüklenemedi.`)), { once: true });
    document.head.appendChild(script);
  });
}

async function loadSupabaseModule() {
  if (window.supabase?.createClient) return window.supabase;

  try {
    await withTimeout(
      loadScript(SUPABASE_LOCAL_SCRIPT_URL),
      STUDIO_AUTH_TIMEOUT_MS,
      "Oturum altyapısı yüklenirken zaman aşımı oldu."
    );
    if (window.supabase?.createClient) return window.supabase;
  } catch (error) {
    console.warn("[auth] Local Supabase client could not be loaded.", error);
  }

  return withTimeout(
    import(SUPABASE_MODULE_URL),
    STUDIO_AUTH_TIMEOUT_MS,
    "Oturum altyapısı yüklenirken zaman aşımı oldu."
  );
}

function removeSupabaseSessionKeys(storage) {
  if (!storage) return;
  Object.keys(storage)
    .filter((key) => (
      (key.startsWith("sb-") && key.includes("-auth-token")) ||
      key.startsWith("supabase.auth.token")
    ))
    .forEach((key) => storage.removeItem(key));
}

function clearStoredSupabaseSession() {
  try {
    removeSupabaseSessionKeys(window.localStorage);
    removeSupabaseSessionKeys(window.sessionStorage);
    window.sessionStorage?.removeItem(AUTH_HANDOFF_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }
}

function readAuthHandoff() {
  try {
    const raw = window.sessionStorage.getItem(AUTH_HANDOFF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const isFresh = Date.now() - Number(parsed.createdAt || 0) < 120000;
    if (!isFresh || !parsed.access_token || !parsed.refresh_token) {
      window.sessionStorage.removeItem(AUTH_HANDOFF_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function consumeStudioAuthHandoff(supabase) {
  const handoff = readAuthHandoff();
  if (!handoff) return null;

  try {
    const { data, error } = await withTimeout(
      supabase.auth.setSession({
        access_token: handoff.access_token,
        refresh_token: handoff.refresh_token,
      }),
      STUDIO_AUTH_TIMEOUT_MS,
      "Oturum aktarımı zaman aşımına uğradı."
    );
    if (error) throw error;
    return data?.session || null;
  } catch (error) {
    console.warn("[auth] Studio auth handoff could not be consumed.", error);
    return null;
  } finally {
    try {
      window.sessionStorage.removeItem(AUTH_HANDOFF_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Görsel okunamadı.")));
    reader.readAsDataURL(file);
  });
}

async function createSupabaseClient() {
  const res = await withTimeout(
    fetch("/api/config", { cache: "no-store" }),
    STUDIO_AUTH_TIMEOUT_MS,
    "Yapılandırma yükleme zaman aşımına uğradı."
  );
  if (!res.ok) throw new Error("Yapılandırma yüklenemedi.");
  studioPublicConfig = await res.json();
  const { supabaseUrl, supabasePublishableKey } = studioPublicConfig;
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Oturum sistemi şu an kullanılamıyor.");
  }

  const { createClient } = await loadSupabaseModule();
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      persistSession: true,
    },
  });
}

async function verifyStudioSessionOrClear(supabase, session) {
  if (!session?.access_token) return null;

  try {
    const { data, error } = await withTimeout(
      supabase.auth.getUser(),
      STUDIO_AUTH_TIMEOUT_MS,
      "Oturum doğrulama zaman aşımına uğradı."
    );
    if (error || !data?.user?.id) throw error || new Error("Oturum doğrulanamadı.");
    return { ...session, user: data.user };
  } catch (error) {
    console.warn("[auth] Stored Studio session is invalid.", error);
    clearStoredSupabaseSession();
    try {
      await supabase.auth.signOut();
    } catch {
      // Local storage has already been cleared; remote sign-out is best effort.
    }
    return null;
  }
}

async function initStudio() {
  bindTabNav();
  bindTabHashRoute();
  bindPendingGenerationPersistence();
  bindPackageControls();
  bindAdminCreditControls();
  bindProfileControls();
  bindProjectControls();
  bindProjectDialogControls();
  bindNewDesignControls();
  initSidePrintEmblemPickers();
  maybeEnableDevMode();
  const shouldOpenPackagePanel = Boolean(packageFromInitialUrl) || consumePackagePanelFlag();

  let supabase;
  try {
    supabase = await createSupabaseClient();
  } catch (error) {
    if (shouldUseLocalStudioFallback()) {
      console.warn("[sync] Supabase config unavailable; Studio is running with local-only dev state.", error);
      currentUserId = "";
      currentUserCreatedAtMs = 0;
      configureStudioStorageForUser("");
      applyAccountRoleUi("user");
      compactPersistedStudioStorage();
      renderProjects();
      renderSavedDesigns();
      showStudio({ user: { email: "test@ff.local" } });
      showCloudSyncWarning("Test modunda sunucu bağlantısı yok. Bu projeler sadece bu tarayıcıda saklanır.");
      openInitialStudioTab(shouldOpenPackagePanel);
      restorePendingGenerations();
      revealStudioShell();
      return;
    }

    window.location.href = "./login.html";
    return;
  }

  let session;
  let hadStoredSession = false;
  try {
    const {
      data: { session: activeSession },
    } = await withTimeout(
      supabase.auth.getSession(),
      STUDIO_AUTH_TIMEOUT_MS,
      "Oturum bilgisi zaman aşımına uğradı."
    );
    const recoveredSession = activeSession || await consumeStudioAuthHandoff(supabase);
    hadStoredSession = Boolean(recoveredSession);
    session = await verifyStudioSessionOrClear(supabase, recoveredSession);
  } catch (error) {
    console.warn("[auth] Stored Studio session could not be restored.", error);
    clearStoredSupabaseSession();

    if (shouldUseLocalStudioFallback()) {
      currentUserId = "";
      currentUserCreatedAtMs = 0;
      configureStudioStorageForUser("");
      applyAccountRoleUi("user");
      compactPersistedStudioStorage();
      renderProjects();
      renderSavedDesigns();
      showStudio({ user: { email: "test@ff.local" } });
      showCloudSyncWarning("Test modunda oturum okunamadı. Yerel oturum açıldı.");
      openInitialStudioTab(shouldOpenPackagePanel);
      restorePendingGenerations();
      revealStudioShell();
      return;
    }

    window.location.href = "./login.html?session=expired";
    return;
  }

  if (!session) {
    if (shouldUseLocalStudioFallback()) {
      console.warn("[sync] No Supabase session; Studio is running with local-only dev state.");
      currentUserId = "";
      currentUserCreatedAtMs = 0;
      configureStudioStorageForUser("");
      applyAccountRoleUi("user");
      compactPersistedStudioStorage();
      renderProjects();
      renderSavedDesigns();
      showStudio({ user: { email: "test@ff.local" } });
      showCloudSyncWarning("Test modunda oturum yok. Bu projeler sadece bu tarayıcıda saklanır.");
      openInitialStudioTab(shouldOpenPackagePanel);
      restorePendingGenerations();
      revealStudioShell();
      return;
    }

    window.location.href = hadStoredSession ? "./login.html?session=expired" : "./login.html";
    return;
  }

  studioSupabase = supabase;
  currentUserId = session.user?.id || "";
  currentUserCreatedAtMs = sessionUserCreatedAtValue(session);
  configureStudioStorageForUser(currentUserId);
  cleanScopedStudioStorageForSession(session);
  recoverLegacyStudioStorageForCurrentUser(session);
  compactPersistedStudioStorage();
  renderProjects();
  renderSavedDesigns();
  isCreditWalletHydrating = true;
  showStudio(session, { renderCredit: false });
  renderCreditPending();
  const earlyRecoveryFetch = prefetchRecoveryGenerations();
  await initializeAccountRoleUi();
  openInitialStudioTab(shouldOpenPackagePanel);
  revealStudioShell();
  handleTopupReturn();
  restorePendingGenerations(earlyRecoveryFetch);

  hydrateArchivedDesigns().catch((error) => {
    showCloudSyncWarning(`Kalıcı tasarım arşivi şu an okunamadı.`);
    console.warn("[designs] archived designs hydration failed.", error);
  });

  refreshCreditWallet({ silent: true }).catch((error) => {
    isCreditWalletHydrating = false;
    showCloudSyncWarning(`Kredi bilgisi sunucudan alınamadı.`);
    console.warn("[credits] initial wallet load failed.", error);
  });

  initializeCloudStudioStateSync(supabase, session).catch((error) => {
    cloudStateSyncEnabled = false;
    cloudStateHydrated = false;
    showCloudSyncWarning(
      `Bulut verisi başlatılamadı. Boş yerel veri buluta yazılmadı; okuma arka planda tekrar denenecek.`
    );
    console.warn("[sync] Supabase studio state sync could not start.", error);
    scheduleCloudStudioStateReadRetry(supabase, session);
  });

  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      studioSupabase = null;
      currentUserId = "";
      currentUserCreatedAtMs = 0;
      cloudStateSyncEnabled = false;
      cloudStateHydrated = false;
      window.clearTimeout(cloudStateSyncTimer);
      window.clearTimeout(cloudStateSyncRetryTimer);
      cloudStateSyncInFlight = false;
      cloudStateSyncQueued = false;
      // Oturum süresi dolması nedeniyle çıkış yapıldıysa, yönlendirmeyi
      // handleSessionExpired üstlenir (login.html?session=expired). Burada
      // tekrar yönlendirip o adresi ezme.
      if (sessionExpiryHandled) return;
      window.location.href = "./login.html";
    }
  });

  studioSignOut?.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });
}

function shouldUseLocalStudioFallback() {
  return window.location.protocol === "file:" || (isDevMode() && isLocalTestHost());
}

// Bir API isteği 401 dönerse (oturum süresi doldu / token yenilenemedi) burada
// merkezi olarak ele alınır: oturum temizlenir ve kullanıcı, neden geri
// gönderildiğini anlayacağı şekilde login.html?session=expired adresine taşınır.
// Birden fazla 401'in arka arkaya gelmesi durumunda yalnızca bir kez çalışır.
function handleSessionExpired() {
  if (sessionExpiryHandled) return;

  // Yerel test/geliştirme modunda gerçek oturum yoktur; yönlendirme yapma.
  if (shouldUseLocalStudioFallback()) return;

  sessionExpiryHandled = true;
  cloudStateSyncEnabled = false;
  cloudStateHydrated = false;
  window.clearTimeout(cloudStateSyncTimer);
  window.clearTimeout(cloudStateSyncRetryTimer);

  const redirect = () => {
    window.location.replace("./login.html?session=expired");
  };

  // En iyi çaba: Supabase oturumunu kapat, sonra her durumda yönlendir.
  try {
    const signOut = studioSupabase?.auth?.signOut?.();
    if (signOut && typeof signOut.finally === "function") {
      signOut.finally(redirect);
      return;
    }
  } catch (error) {
    console.warn("[auth] sign out during session expiry failed.", error);
  }
  redirect();
}
