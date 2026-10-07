// header-auth.js — Girişli kullanıcıya header'da "Çıkış" bağlantısı gösterir.
// Marketing/checkout sayfalarında (index, paketler, nasil-calisir, odeme, login)
// yüklenir. Oturum yoksa hiçbir şey yapmaz; header olduğu gibi kalır. Studio dışında
// da çıkış yapılabilsin diye eklendi.
//
// Kendi IIFE'sinde çalışır; script.js / odeme.js ile global çakışması olmaz.
(() => {
  const TIMEOUT_MS = 20000;
  const SUPABASE_LOCAL_SCRIPT_URL = "./assets/vendor/supabase.js?v=2.105.3";
  const SUPABASE_MODULE_URL = "https://esm.sh/@supabase/supabase-js@2.105.3";

  function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("timeout")), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
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
      await withTimeout(loadScript(SUPABASE_LOCAL_SCRIPT_URL), TIMEOUT_MS);
      if (window.supabase?.createClient) return window.supabase;
    } catch (error) {
      console.warn("[auth] Local Supabase client could not be loaded.", error);
    }

    return withTimeout(import(SUPABASE_MODULE_URL), TIMEOUT_MS);
  }

  async function createSupabaseClient() {
    if (window.location.protocol === "file:") return null;
    const response = await withTimeout(fetch("/api/config", { cache: "no-store" }), TIMEOUT_MS);
    if (!response.ok) return null;
    const config = await response.json();
    if (!config.supabaseUrl || !config.supabasePublishableKey) return null;
    const supabaseModule = await loadSupabaseModule();
    return supabaseModule.createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
      },
    });
  }

  function injectLogout(actions, onLogout) {
    if (actions.querySelector("[data-header-logout]")) return;
    const link = document.createElement("a");
    link.className = "ghost-link";
    link.href = "#";
    link.setAttribute("role", "button");
    link.dataset.headerLogout = "1";
    link.textContent = "Çıkış";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onLogout();
    });
    // "Çıkış"ı en başa koy ki "Studio'yu Aç" birincil aksiyon olarak sağda kalsın.
    actions.insertBefore(link, actions.firstChild);
  }

  async function init() {
    const actions = document.querySelector(".header-actions");
    if (!actions) return;

    let supabase;
    try {
      supabase = await createSupabaseClient();
    } catch {
      supabase = null;
    }
    if (!supabase) return;

    let session = null;
    try {
      const result = await withTimeout(supabase.auth.getSession(), TIMEOUT_MS);
      session = result?.data?.session || null;
    } catch {
      session = null;
    }
    if (!session) return;

    injectLogout(actions, async () => {
      try {
        await supabase.auth.signOut();
      } catch {
        // sessizce yut; yine de logged-out görünüme dönmek için yönlendir
      }
      // Aynı sayfayı sorgu parametresiz yeniden yükle → header logged-out hâline döner.
      window.location.assign(window.location.pathname);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
