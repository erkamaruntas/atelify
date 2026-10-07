// odeme.js — Paket seçildikten sonraki ödeme (checkout) ekranı.
// Akış: paketler.html'de paket seçilir → buraya gelinir → oturum kontrol edilir →
// girişsizse login'e (?next=odeme.html?paket=X) yönlendirilir, girişliyse seçilen
// paketin özeti + ödeme placeholder'ı gösterilir.
//
// NOT: Bu sayfa script.js'i de yüklediği için tüm tanımlar bir IIFE içinde tutulur;
// aksi halde top-level const'lar (ör. packageStorageKey) script.js ile çakışır.

(() => {
  const AUTH_TIMEOUT_MS = 12000;
  const packageStorageKey = "ff-selected-package";

  // paketler/Studio ile aynı kredi/fiyat bilgisi (bu sayfa bağımsız çalıştığı için
  // burada da tutulur; kaynak doğruluğu için PACKAGE_PLANS ile senkron kalmalı).
  const CHECKOUT_PLANS = {
    go: {
      name: "Go",
      price: "375₺",
      period: "/ay",
      sub: "15 kredi/ay · her ay yenilenir",
      desc: "Aylık 15 kredi ile bir ürünü baştan sona (taslak, mockup, manken) çıkar.",
    },
    pro: {
      name: "Pro",
      price: "1.000₺",
      period: "/ay",
      sub: "45 kredi/ay · her ay yenilenir",
      desc: "Aylık 45 kredi ile düzenli koleksiyon, revize ve üretim akışı.",
    },
    max: {
      name: "Max",
      price: "5.000₺",
      period: "/ay",
      sub: "250 kredi/ay · her ay yenilenir",
      desc: "Aylık 250 kredi ile marka ve ekip ölçeğinde yüksek hacimli üretim.",
    },
  };

  const pick = (selector) => document.querySelector(selector);

  function withTimeout(promise, ms, message) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  function normalizePlanKey(value) {
    const key = String(value || "").trim().toLowerCase();
    return CHECKOUT_PLANS[key] ? key : "";
  }

  function selectedPlanKey() {
    let fromUrl = "";
    try {
      const params = new URLSearchParams(window.location.search);
      fromUrl = params.get("paket") || params.get("plan") || "";
    } catch {
      fromUrl = "";
    }
    const normalizedUrl = normalizePlanKey(fromUrl);
    if (normalizedUrl) return normalizedUrl;

    try {
      return normalizePlanKey(window.localStorage.getItem(packageStorageKey));
    } catch {
      return "";
    }
  }

  function showFatal(message) {
    const loading = pick("[data-checkout-loading]");
    if (loading) {
      loading.innerHTML = "";
      const note = document.createElement("p");
      note.className = "auth-message";
      note.dataset.tone = "error";
      note.textContent = message;
      loading.appendChild(note);
    }
    const heading = pick("[data-checkout-heading]");
    if (heading) heading.textContent = "Bir sorun oluştu";
  }

  async function fetchPublicConfig() {
    if (window.location.protocol === "file:") {
      throw new Error("Ödeme ekranı şu an açılamıyor.");
    }
    const response = await withTimeout(
      fetch("/api/config", { cache: "no-store" }),
      AUTH_TIMEOUT_MS,
      "Yapılandırma yüklenemedi."
    );
    if (!response.ok) throw new Error("Ödeme ekranı şu an açılamıyor.");
    const config = await response.json();
    if (!config.supabaseUrl || !config.supabasePublishableKey) {
      throw new Error("Oturum sistemi şu an kullanılamıyor.");
    }
    return config;
  }

  async function createSupabaseClient() {
    const config = await fetchPublicConfig();
    const supabaseModule = await withTimeout(
      import("https://esm.sh/@supabase/supabase-js@2"),
      AUTH_TIMEOUT_MS,
      "Oturum altyapısı yüklenemedi."
    );
    return supabaseModule.createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
      },
    });
  }

  function redirectToLogin(planKey) {
    const next = encodeURIComponent(`odeme.html?paket=${planKey}`);
    window.location.replace(`./login.html?next=${next}`);
  }

  async function startPayment(planKey, accessToken, payBtn, statusEl) {
    const idleLabel = payBtn.textContent;
    payBtn.disabled = true;
    payBtn.textContent = "Yönlendiriliyor…";
    statusEl.hidden = true;
    try {
      const response = await withTimeout(
        fetch("/api/iyzico/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ planKey }),
        }),
        AUTH_TIMEOUT_MS,
        "Ödeme başlatılamadı."
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.paymentPageUrl) {
        throw new Error(data.error || "Ödeme başlatılamadı.");
      }
      // iyzico'nun barındırılan ödeme sayfası; başarı/başarısızlıkta /api/iyzico/callback
      // bizi odeme.html?sonuc=... adresine geri yönlendirir.
      window.location.href = data.paymentPageUrl;
    } catch (error) {
      payBtn.disabled = false;
      payBtn.textContent = idleLabel;
      statusEl.hidden = false;
      statusEl.dataset.tone = "error";
      statusEl.textContent = error?.message || "Ödeme başlatılamadı.";
    }
  }

  function renderCheckout(planKey, session) {
    const plan = CHECKOUT_PLANS[planKey];
    const email = session?.user?.email || "";

    const heading = pick("[data-checkout-heading]");
    if (heading) heading.textContent = "Ödemeyi onayla.";

    const setText = (selector, text) => {
      const el = pick(selector);
      if (el) el.textContent = text;
    };

    setText("[data-plan-name]", plan.name);
    setText("[data-plan-sub]", plan.sub);
    setText("[data-plan-desc]", plan.desc);

    const priceEl = pick("[data-plan-price]");
    if (priceEl) {
      priceEl.textContent = plan.price;
      const period = document.createElement("small");
      period.className = "plan-price-period";
      period.textContent = plan.period;
      priceEl.appendChild(period);
    }

    const account = pick("[data-checkout-account]");
    if (account) {
      account.textContent = email ? `Hesap: ${email}` : "";
      account.hidden = !email;
    }

    const loading = pick("[data-checkout-loading]");
    if (loading) loading.hidden = true;
    const content = pick("[data-checkout-content]");
    if (content) content.hidden = false;

    const payBtn = pick("[data-checkout-pay]");
    const statusEl = pick("[data-checkout-status]");
    const studioBtn = pick("[data-checkout-studio]");

    let sonuc = "";
    try {
      sonuc = new URLSearchParams(window.location.search).get("sonuc") || "";
    } catch {
      sonuc = "";
    }

    // Ödeme dönüşü: callback bizi ?sonuc=basarili|hata ile geri getirir.
    if (sonuc === "basarili") {
      if (payBtn) payBtn.hidden = true;
      if (studioBtn) studioBtn.hidden = false;
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.dataset.tone = "success";
        statusEl.textContent = "Ödemen alındı ve kredilerin yüklendi.";
      }
      return;
    }
    if (sonuc === "hata" && statusEl) {
      statusEl.hidden = false;
      statusEl.dataset.tone = "error";
      statusEl.textContent = "Ödeme tamamlanamadı. Tekrar deneyebilirsin.";
    }

    if (payBtn && statusEl) {
      payBtn.addEventListener("click", () => {
        startPayment(planKey, session?.access_token || "", payBtn, statusEl);
      });
    }
  }

  (async function initCheckout() {
    const planKey = selectedPlanKey();

    // Ücretsiz veya geçersiz plan ödeme ekranına gelmez.
    if (!planKey) {
      window.location.replace("./paketler.html");
      return;
    }

    let supabase;
    try {
      supabase = await createSupabaseClient();
    } catch (error) {
      showFatal(error?.message || "Oturum servisi yüklenemedi.");
      return;
    }

    let session = null;
    try {
      const result = await withTimeout(
        supabase.auth.getSession(),
        AUTH_TIMEOUT_MS,
        "Kayıtlı oturum okunamadı."
      );
      session = result?.data?.session || null;
    } catch (error) {
      showFatal(error?.message || "Oturum okunamadı.");
      return;
    }

    if (!session) {
      redirectToLogin(planKey);
      return;
    }

    renderCheckout(planKey, session);
  })();
})();
