const loginForm = document.querySelector("[data-login-form]");
const signUpForm = document.querySelector("[data-sign-up-form]");
const recoveryForm = document.querySelector("[data-recovery-form]");
const authMessage = document.querySelector("[data-auth-message]");
const sessionCard = document.querySelector("[data-session-card]");
const sessionEmail = document.querySelector("[data-session-email]");
const submitButton = document.querySelector("[data-submit-button]");
const signUpButton = document.querySelector("[data-sign-up-button]");
const resetPasswordButton = document.querySelector("[data-reset-password]");
const authResetButton = document.querySelector("[data-auth-reset]");
const signOutButton = document.querySelector("[data-sign-out]");
const authHeading = document.querySelector("[data-auth-heading]");
const authBody = document.querySelector("[data-auth-body]");
const authModeSwitch = document.querySelector("[data-auth-mode-switch]");
const authModeButtons = [...document.querySelectorAll("[data-auth-mode-trigger]")];
const resendVerificationBlock = document.querySelector("[data-resend-verification]");
const resendVerificationButton = document.querySelector("[data-resend-button]");

let pendingVerificationEmail = "";
let authPublicConfig = null;

const defaultSubmitLabel = submitButton?.textContent?.trim() || "Atelify'a Gir";
const defaultSignUpLabel = signUpButton?.textContent?.trim() || "Üye ol";
const AUTH_TIMEOUT_MS = 20000;
const AUTH_HANDOFF_STORAGE_KEY = "ff-auth-handoff-v1";
const SUPABASE_LOCAL_SCRIPT_URL = "./assets/vendor/supabase.js?v=2.105.3";
const SUPABASE_MODULE_URL = "https://esm.sh/@supabase/supabase-js@2.105.3";

const authCopy = {
  "sign-in": {
    heading: "Tekrar hoş geldin.",
    body: "",
  },
  "sign-up": {
    heading: "Yeni hesabını oluştur.",
    body: "Ücretsiz 10 krediyle başla.",
  },
};

let currentMode = "sign-in";
let supabasePromise = null;
let isClearingInvalidSession = false;
let isCredentialSignInInFlight = false;

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
      existing.addEventListener("error", () => reject(new Error(`${src} yuklenemedi.`)), { once: true });
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
    script.addEventListener("error", () => reject(new Error(`${src} yuklenemedi.`)), { once: true });
    document.head.appendChild(script);
  });
}

async function loadSupabaseModule() {
  if (window.supabase?.createClient) return window.supabase;

  try {
    await withTimeout(
      loadScript(SUPABASE_LOCAL_SCRIPT_URL),
      AUTH_TIMEOUT_MS,
      "Oturum altyapısı yüklenemedi."
    );
    if (window.supabase?.createClient) return window.supabase;
  } catch (error) {
    console.warn("[auth] Local Supabase client could not be loaded.", error);
  }

  return withTimeout(
    import(SUPABASE_MODULE_URL),
    AUTH_TIMEOUT_MS,
    "Oturum altyapısı yüklenemedi."
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

function writeAuthHandoff(session) {
  if (!session?.access_token || !session?.refresh_token) return;
  try {
    window.sessionStorage.setItem(
      AUTH_HANDOFF_STORAGE_KEY,
      JSON.stringify({
        access_token: session.access_token,
        createdAt: Date.now(),
        expires_at: session.expires_at || 0,
        refresh_token: session.refresh_token,
      })
    );
  } catch {
    // If sessionStorage is unavailable, Supabase's normal persistent storage is still attempted.
  }
}

function authTimeoutMessage(action) {
  return `${action} zaman aşımına uğradı. Oturum verisi temizlendi, tekrar deneyebilirsin.`;
}

// Giriş servisinden gelen İngilizce hata metinlerini kullanıcıya Türkçe göster.
const AUTH_ERROR_TRANSLATIONS = [
  [/invalid login credentials/i, "E-posta veya şifre hatalı."],
  [/email not confirmed/i, "E-posta adresin henüz doğrulanmadı. Gelen kutunu kontrol et."],
  [/user already registered/i, "Bu e-posta ile zaten bir üyelik var."],
  [/password should be at least/i, "Şifre en az 6 karakter olmalı."],
  [/(rate limit|too many requests|you can only request this after)/i, "Çok sık deneme yapıldı. Biraz bekleyip tekrar dene."],
  [/(invalid format|unable to validate email)/i, "Geçerli bir e-posta adresi gir."],
  [/new password should be different/i, "Yeni şifre eskisinden farklı olmalı."],
  [/(failed to fetch|network ?error|load failed)/i, "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene."],
];

function translateAuthError(message) {
  const text = String(message || "");
  const match = AUTH_ERROR_TRANSLATIONS.find(([pattern]) => pattern.test(text));
  return match ? match[1] : text;
}

function setMessage(tone, message) {
  if (!authMessage) return;
  if (tone === "error" || tone === "warning") message = translateAuthError(message);

  if (!message) {
    authMessage.hidden = true;
    authMessage.removeAttribute("data-tone");
    authMessage.textContent = "";
    return;
  }

  authMessage.hidden = false;
  authMessage.dataset.tone = tone;
  authMessage.textContent = message;
}

function showVerificationResend(email) {
  pendingVerificationEmail = email || "";
  if (resendVerificationBlock) resendVerificationBlock.hidden = !pendingVerificationEmail;
}

function hideVerificationResend() {
  pendingVerificationEmail = "";
  if (resendVerificationBlock) resendVerificationBlock.hidden = true;
}

// Studio veya başka bir sayfa, oturum süresi dolduğunda buraya
// ?session=expired ile yönlendirir. Kullanıcıya nedenini gösterip URL'yi
// temizleriz ki yenilemede mesaj takılı kalmasın.
function showUrlNotices() {
  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }

  if (params.get("session") === "expired") {
    setMessage("info", "Oturumunun süresi doldu. Devam etmek için lütfen tekrar giriş yap.");
    params.delete("session");
    const cleaned = params.toString();
    const nextUrl = `${window.location.pathname}${cleaned ? `?${cleaned}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }
}

function consumeAuthResetUrlFlag() {
  try {
    const url = new URL(window.location.href);
    const shouldReset = url.searchParams.get("resetAuth") === "1";
    if (!shouldReset) return false;
    url.searchParams.delete("resetAuth");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    return true;
  } catch {
    return false;
  }
}

function setButtonState(button, isBusy, busyLabel) {
  if (!button) return;

  const defaultLabel = button === signUpButton ? defaultSignUpLabel : defaultSubmitLabel;
  button.disabled = isBusy;
  button.textContent = isBusy ? busyLabel : defaultLabel;
}

function setAuthCopy(mode) {
  const copy = authCopy[mode];

  if (!copy) return;
  if (authHeading) authHeading.textContent = copy.heading;
  if (authBody) {
    authBody.textContent = copy.body;
    authBody.hidden = !copy.body;
  }
}

function syncVisibleViews(options = {}) {
  const isSignedIn = Boolean(options.isSignedIn);
  const showRecoveryForm = Boolean(options.showRecoveryForm);

  if (authModeSwitch) authModeSwitch.hidden = isSignedIn || showRecoveryForm;
  if (loginForm) loginForm.hidden = isSignedIn || showRecoveryForm || currentMode !== "sign-in";
  if (signUpForm) signUpForm.hidden = isSignedIn || showRecoveryForm || currentMode !== "sign-up";
  if (recoveryForm) recoveryForm.hidden = !showRecoveryForm;
  if (sessionCard) sessionCard.hidden = !isSignedIn;
}

function setMode(mode, options = {}) {
  currentMode = mode;
  setAuthCopy(mode);

  // Mod değişiminde bekleyen doğrulama tekrar-gönder bloğunu gizle.
  if (!options.keepResend) hideVerificationResend();

  authModeButtons.forEach((button) => {
    const isActive = button.dataset.authModeTrigger === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  syncVisibleViews(options);
}

function renderSession(session, showRecoveryForm = false) {
  const isSignedIn = Boolean(session?.user);

  if (sessionEmail) {
    sessionEmail.textContent = session?.user?.email || "Aktif oturum";
  }

  syncVisibleViews({
    isSignedIn,
    showRecoveryForm,
  });
}

function getFieldValue(form, name) {
  const value = form?.elements?.[name]?.value;
  return typeof value === "string" ? value.trim() : "";
}

function primeSignInEmail(email) {
  if (!loginForm?.elements?.email || !email) return;

  loginForm.elements.email.value = email;
  loginForm.elements.password.value = "";
}

function showExistingAccountMessage(email) {
  setMode("sign-in");
  primeSignInEmail(email);
  setMessage("error", `${email} ile zaten bir üyelik var. Giriş yap sekmesinden devam edebilirsin.`);
}

function looksLikeExistingUserResponse(data) {
  return Boolean(
    data?.user &&
      !data?.session &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
  );
}

function buildAuthRedirectUrl() {
  const baseUrl = authPublicConfig?.siteUrl || window.location.href;
  try {
    return new URL("./login", baseUrl).toString();
  } catch {
    return new URL("./login", window.location.href).toString();
  }
}

function readAuthCallbackParams() {
  try {
    const url = new URL(window.location.href);
    const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
    return {
      hashParams: new URLSearchParams(hash),
      searchParams: url.searchParams,
    };
  } catch {
    return {
      hashParams: new URLSearchParams(),
      searchParams: new URLSearchParams(),
    };
  }
}

function isPasswordRecoveryCallbackUrl() {
  const { hashParams, searchParams } = readAuthCallbackParams();
  return (
    searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery" ||
    searchParams.has("code")
  );
}

function cleanAuthCallbackUrl() {
  try {
    window.history.replaceState(null, "", new URL("./login", window.location.href).toString());
  } catch {
    // URL temizliği desteklenmezse akış yine çalışır; sadece callback parametresi kalır.
  }
}

// Giriş sonrası nereye dönüleceği: varsayılan ./studio, ama login'e ?next= ile
// gelinmişse (örn. paket seçip ödeme ekranına gidilecekse) oraya döndürürüz.
// Güvenlik: sadece bilinen iç hedeflere izin ver; protokol/host/.. kabul etme.
function postLoginTarget() {
  let raw = "";
  try {
    raw = new URLSearchParams(window.location.search).get("next") || "";
  } catch {
    raw = "";
  }
  raw = String(raw).trim();
  if (!raw) return "./studio";

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  if (/^(?:\.\/)?(odeme\.html|studio)(?:\?[A-Za-z0-9=&%._-]*)?$/.test(decoded)) {
    return decoded.startsWith("./") ? decoded : `./${decoded}`;
  }
  return "./studio";
}

function showPasswordRecovery(session) {
  renderSession(session, true);
  setMessage("", "");
  cleanAuthCallbackUrl();
}

async function fetchPublicConfig() {
  if (window.location.protocol === "file:") {
    throw new Error("Bu ekrani dogrudan dosya olarak degil, http://localhost:3000/login.html uzerinden ac.");
  }

  const response = await withTimeout(
    fetch("/api/config", { cache: "no-store" }),
    AUTH_TIMEOUT_MS,
    "Giriş sistemi şu an kullanılamıyor."
  );

  if (!response.ok) {
    throw new Error("Giriş sistemi şu an kullanılamıyor.");
  }

  const config = await response.json();

  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error("Giriş sistemi şu an kullanılamıyor. Lütfen daha sonra tekrar dene.");
  }

  authPublicConfig = config;
  return config;
}

async function createSupabaseClient() {
  const config = await fetchPublicConfig();
  const supabaseModule = await loadSupabaseModule();
  const supabase = supabaseModule.createClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
      },
    }
  );

  const isRecoveryUrl = isPasswordRecoveryCallbackUrl();

  supabase.auth.onAuthStateChange((event, nextSession) => {
    if (event === "PASSWORD_RECOVERY") {
      showPasswordRecovery(nextSession);
      return;
    }

    if (event === "SIGNED_IN") {
      if (isRecoveryUrl) {
        showPasswordRecovery(nextSession);
      } else if (isCredentialSignInInFlight) {
        writeAuthHandoff(nextSession);
      } else {
        writeAuthHandoff(nextSession);
        redirectAfterVerifiedSession(supabase, nextSession);
      }
      return;
    }

    if (event === "SIGNED_OUT") {
      setMode("sign-in");
      renderSession(null, false);
      if (!isClearingInvalidSession) {
        setMessage("", "");
      }
    }
  });

  const {
    data: { session },
  } = await withTimeout(
    supabase.auth.getSession(),
    AUTH_TIMEOUT_MS,
    "Kayıtlı oturum okunamadı."
  );

  const verifiedSession = session ? await verifySessionOrClear(supabase, session) : null;

  if (verifiedSession && isRecoveryUrl) {
    showPasswordRecovery(verifiedSession);
    return supabase;
  }

  if (verifiedSession && !isRecoveryUrl) {
    window.location.href = postLoginTarget();
    return supabase;
  }

  return supabase;
}

async function verifySessionOrClear(supabase, session) {
  if (!session?.access_token) return null;
  try {
    const { data, error } = await withTimeout(
      supabase.auth.getUser(),
      AUTH_TIMEOUT_MS,
      "Kayıtlı oturum doğrulanamadı."
    );
    if (error || !data?.user?.id) throw error || new Error("Kayıtlı oturum doğrulanamadı.");
    return { ...session, user: data.user };
  } catch (error) {
    clearStoredSupabaseSession();
    isClearingInvalidSession = true;
    try {
      await supabase.auth.signOut();
    } catch {
      // Local storage has already been cleared; remote sign-out is best effort.
    } finally {
      isClearingInvalidSession = false;
    }
    setMessage("", "");
    return null;
  }
}

async function redirectAfterVerifiedSession(supabase, session) {
  const verifiedSession = await verifySessionOrClear(supabase, session);
  if (!verifiedSession) return;
  writeAuthHandoff(verifiedSession);
  window.location.replace(postLoginTarget());
}

async function readActiveSession(supabase) {
  const {
    data: { session },
  } = await withTimeout(
    supabase.auth.getSession(),
    AUTH_TIMEOUT_MS,
    "Güncel oturum okunamadı."
  );
  return session;
}

async function getSupabase() {
  if (!supabasePromise) {
    supabasePromise = createSupabaseClient().catch((error) => {
      supabasePromise = null;
      throw error;
    });
  }

  return supabasePromise;
}

async function requireSupabase() {
  try {
    return await getSupabase();
  } catch (error) {
    setMessage("error", error.message || "Bağlantı kurulurken bir hata oluştu.");
    throw error;
  }
}

async function resetLocalAuthState() {
  clearStoredSupabaseSession();
  const existingPromise = supabasePromise;
  supabasePromise = null;

  try {
    const supabase = existingPromise ? await existingPromise : null;
    await supabase?.auth?.signOut?.();
  } catch {
    // Local session cleanup is the important part; remote sign-out is best effort.
  }

  setMode("sign-in");
  renderSession(null, false);
  setMessage("", "");
}

async function handleSignIn() {
  const email = getFieldValue(loginForm, "email");
  const password = getFieldValue(loginForm, "password");

  if (!email || !password) {
    setMessage("error", "Giriş için e-posta ve şifre gerekli.");
    return;
  }

  setButtonState(submitButton, true, "Giriş yapılıyor...");
  setMessage("", "");

  try {
    const supabase = await requireSupabase();
    isCredentialSignInInFlight = true;
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email,
        password,
      }),
      AUTH_TIMEOUT_MS,
      "Giriş isteği tamamlanamadı."
    );

    if (error) {
      setMessage("error", error.message);
      return;
    }

    const session = data?.session || await readActiveSession(supabase);
    const verifiedSession = await verifySessionOrClear(supabase, session);
    if (!verifiedSession) {
      setMessage("error", "Giriş yapıldı ama oturum doğrulanamadı. Lütfen tekrar dene.");
      return;
    }

    writeAuthHandoff(verifiedSession);
    loginForm.reset();
    window.location.replace(postLoginTarget());
  } catch (error) {
    if (error?.name === "TimeoutError") {
      clearStoredSupabaseSession();
      supabasePromise = null;
      setMessage("error", authTimeoutMessage("Giriş isteği"));
      return;
    }

    setMessage("error", error?.message || "Giriş yapılırken hata oluştu.");
  } finally {
    isCredentialSignInInFlight = false;
    setButtonState(submitButton, false, "Giriş yapılıyor...");
  }
}

async function handleSignUp() {
  const email = getFieldValue(signUpForm, "email");
  const password = getFieldValue(signUpForm, "password");
  const confirmPassword = getFieldValue(signUpForm, "confirmPassword");

  if (!email || !password || !confirmPassword) {
    setMessage("error", "Üye olmak için e-posta ve şifre alanlarını doldur.");
    return;
  }

  if (password.length < 6) {
    setMessage("error", "Şifre en az 6 karakter olmalı.");
    return;
  }

  if (password !== confirmPassword) {
    setMessage("error", "Şifreler birbiriyle aynı olmalı.");
    return;
  }

  setButtonState(signUpButton, true, "Üye olunuyor...");
  setMessage("", "");

  try {
    const supabase = await requireSupabase();
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildAuthRedirectUrl(),
        },
      }),
      AUTH_TIMEOUT_MS,
      "Üyelik isteği tamamlanamadı."
    );

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        showExistingAccountMessage(email);
        return;
      }

      setMessage("error", error.message);
      return;
    }

    if (looksLikeExistingUserResponse(data)) {
      showExistingAccountMessage(email);
      return;
    }

    if (data.session) {
      writeAuthHandoff(data.session);
      signUpForm.reset();
      window.location.replace("./studio");
      return;
    }

    signUpForm.reset();
    setMode("sign-in");
    primeSignInEmail(email);
    setMessage(
      "success",
      `${data.user?.email || email} için üyelik oluşturuldu. Doğrulama e-postanı kontrol edip giriş yapabilirsin.`
    );
    showVerificationResend(email);
  } catch (error) {
    if (error?.name === "TimeoutError") {
      clearStoredSupabaseSession();
      supabasePromise = null;
      setMessage("error", authTimeoutMessage("Üyelik isteği"));
      return;
    }

    setMessage("error", error?.message || "Üyelik oluşturulurken hata oluştu.");
  } finally {
    setButtonState(signUpButton, false, "Üye olunuyor...");
  }
}

async function handleResetPassword() {
  const email = getFieldValue(loginForm, "email");

  if (!email) {
    setMessage("error", "Şifre sıfırlama için önce e-posta adresini yaz.");
    return;
  }

  setMessage("", "");

  let error;
  try {
    const supabase = await requireSupabase();
    ({ error } = await withTimeout(
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildAuthRedirectUrl(),
      }),
      AUTH_TIMEOUT_MS,
      "Şifre sıfırlama isteği tamamlanamadı."
    ));
  } catch (requestError) {
    setMessage("error", requestError?.message || "Şifre sıfırlama isteği gönderilemedi.");
    return;
  }

  if (error) {
    setMessage("error", error.message);
    return;
  }

  setMessage("success", "Şifre sıfırlama bağlantısı e-postana gönderildi.");
}

function setResendButtonBusy(isBusy) {
  if (!resendVerificationButton) return;
  resendVerificationButton.disabled = isBusy;
  resendVerificationButton.textContent = isBusy
    ? "Gönderiliyor..."
    : "Doğrulama e-postasını tekrar gönder";
}

async function handleResendVerification() {
  const email = pendingVerificationEmail || getFieldValue(loginForm, "email");

  if (!email) {
    setMessage("error", "Önce üye olduğun e-posta adresini gir.");
    return;
  }

  setResendButtonBusy(true);
  setMessage("", "");

  let error;
  try {
    const supabase = await requireSupabase();
    ({ error } = await withTimeout(
      supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: buildAuthRedirectUrl() },
      }),
      AUTH_TIMEOUT_MS,
      "Doğrulama e-postası isteği tamamlanamadı."
    ));
  } catch (requestError) {
    setResendButtonBusy(false);
    setMessage("error", requestError?.message || "Doğrulama e-postası gönderilemedi.");
    return;
  }

  setResendButtonBusy(false);

  if (error) {
    setMessage("error", error.message);
    return;
  }

  setMessage("success", `${email} adresine doğrulama e-postası tekrar gönderildi.`);
}

async function handleRecoverySubmit() {
  const newPassword = getFieldValue(recoveryForm, "newPassword");
  const confirmPassword = getFieldValue(recoveryForm, "confirmPassword");

  if (!newPassword || newPassword.length < 6) {
    setMessage("error", "Yeni şifre en az 6 karakter olmalı.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setMessage("error", "Yeni şifreler birbiriyle aynı olmalı.");
    return;
  }

  setMessage("", "");

  let supabase;
  let error;
  try {
    supabase = await requireSupabase();
    ({ error } = await withTimeout(
      supabase.auth.updateUser({
        password: newPassword,
      }),
      AUTH_TIMEOUT_MS,
      "Şifre güncelleme isteği tamamlanamadı."
    ));
  } catch (requestError) {
    setMessage("error", requestError?.message || "Şifre güncellenemedi.");
    return;
  }

  if (error) {
    setMessage("error", error.message);
    return;
  }

  recoveryForm.reset();
  setMode("sign-in");

  let session;
  try {
    const {
      data: { session: activeSession },
    } = await withTimeout(
      supabase.auth.getSession(),
      AUTH_TIMEOUT_MS,
      "Güncel oturum okunamadı."
    );
    session = activeSession;
  } catch (requestError) {
    setMessage("warning", requestError?.message || "Şifre güncellendi ama oturum yenilenemedi.");
    return;
  }

  renderSession(session, false);
  setMessage("success", "Şifre güncellendi. Yeni şifrenle giriş yapabilirsin.");
}

async function handleSignOut() {
  let error;
  try {
    const supabase = await requireSupabase();
    ({ error } = await withTimeout(
      supabase.auth.signOut(),
      AUTH_TIMEOUT_MS,
      "Çıkış isteği tamamlanamadı."
    ));
  } catch (requestError) {
    setMessage("error", requestError?.message || "Çıkış yapılamadı.");
    return;
  }

  if (error) {
    setMessage("error", error.message);
  }
}

function bindUi() {
  setMode("sign-in");

  authModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.authModeTrigger || "sign-in");
      setMessage("", "");
    });
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleSignIn();
  });

  signUpForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleSignUp();
  });

  resetPasswordButton?.addEventListener("click", async () => {
    await handleResetPassword();
  });

  authResetButton?.addEventListener("click", async () => {
    await resetLocalAuthState();
  });

  recoveryForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleRecoverySubmit();
  });

  signOutButton?.addEventListener("click", async () => {
    await handleSignOut();
  });

  resendVerificationButton?.addEventListener("click", async () => {
    await handleResendVerification();
  });
}

async function initLogin() {
  if (!loginForm || !signUpForm) return;

  bindUi();
  const shouldResetAuth = consumeAuthResetUrlFlag();
  if (shouldResetAuth) {
    await resetLocalAuthState();
  }
  showUrlNotices();

  if (window.location.protocol === "file:") {
    setMessage("info", "Giriş ve üyelik için sayfayı yerel sunucu üzerinden aç.");
    return;
  }

  try {
    await getSupabase();
  } catch (error) {
    setMessage("error", error.message || "Bağlantı kurulurken bir hata oluştu.");
  }
}

initLogin().catch((error) => {
  console.error(error);
  setMessage("error", error.message || "Giriş ekranı başlatılamadı.");
});
