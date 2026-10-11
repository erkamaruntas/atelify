// Atelify stüdyo — billing
// Plan değişikliği, abonelik iptali ve kredi yükleme (top-up).
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


// Hesap içinden değiştirilebilen (ödemeli) planlar. Ücretsiz plan checkout başlatmaz,
// bu yüzden paket değiştirme seçeneklerinde gösterilmez.
const PLAN_CHANGE_ORDER = ["go", "pro", "max"];

// subscriptionSummary üstte (state bölümünde) tanımlı — modül üst seviyesindeki
// renderCreditWallet→renderTopupSection çağrısı TDZ'ye düşmesin diye.

function setPlanChangeStatus(message, tone = "info") {
  if (!planChangeStatus) return;
  if (!message || !isVisibleStatusTone(tone)) {
    planChangeStatus.hidden = true;
    planChangeStatus.textContent = "";
    return;
  }
  planChangeStatus.hidden = false;
  planChangeStatus.dataset.tone = tone === "notice" ? "success" : tone;
  planChangeStatus.textContent = message;
}

function formatSubscriptionDate(iso) {
  if (!iso) return "";
  const time = Date.parse(iso);
  if (!time) return "";
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(time));
  } catch {
    return new Date(time).toLocaleDateString();
  }
}

// Gösterime esas mevcut planı belirler: server abonelik özeti otoriterdir (aktif ya da
// dönem sonuna kadar geçerli iptal). Özet yoksa yerel seçime düşülür.
function currentEffectivePlanKey() {
  if (subscriptionSummary?.active) {
    const fromServer = normalizePackageKey(subscriptionSummary.planKey);
    if (fromServer) return fromServer;
  }
  return normalizePackageKey(resolveSelectedPackage()) || DEFAULT_PACKAGE_KEY;
}

async function fetchSubscriptionSummary() {
  const headers = await authHeaders();
  if (!headers.Authorization) {
    subscriptionSummary = null;
    return null;
  }
  try {
    const response = await withTimeout(
      fetch(subscriptionApiUrl(), { headers, cache: "no-store" }),
      STUDIO_AUTH_TIMEOUT_MS,
      "Abonelik bilgisi alınamadı."
    );
    if (!response.ok) {
      subscriptionSummary = null;
      return null;
    }
    subscriptionSummary = await response.json().catch(() => null);
    return subscriptionSummary;
  } catch (error) {
    console.warn("[subscription] summary fetch failed.", error);
    subscriptionSummary = null;
    return null;
  }
}

function renderPlanChangeOptions() {
  if (!planChangeOptions) return;

  const currentPlanKey = currentEffectivePlanKey();
  const cards = PLAN_CHANGE_ORDER.map((planKey) => {
    const plan = PACKAGE_PLANS[planKey];
    if (!plan) return null;

    const isCurrent = planKey === currentPlanKey;
    const card = document.createElement("div");
    card.className = "plan-change-option";
    if (isCurrent) card.classList.add("is-current");

    const title = document.createElement("strong");
    title.textContent = plan.name;

    const summary = document.createElement("p");
    summary.textContent = plan.summary;

    const action = document.createElement("button");
    action.type = "button";
    action.className = isCurrent ? "button button-secondary" : "button button-primary";
    action.dataset.planChangeSelect = planKey;
    action.disabled = isCurrent;
    action.textContent = isCurrent ? "Mevcut paketin" : "Bu pakete geç";

    card.append(title, summary, action);
    return card;
  }).filter(Boolean);

  planChangeOptions.replaceChildren(...cards);
  renderPlanChangeCancel();
}

// İptal bölümünü abonelik durumuna göre gösterir: aktif ücretli abonelikte "iptal et"
// butonu; zaten iptal edilmişse dönem sonu bilgisiyle not; ücretsiz/aboneliksizde gizli.
function renderPlanChangeCancel() {
  if (!planChangeCancel) return;

  const summary = subscriptionSummary;
  const planKey = normalizePackageKey(summary?.planKey);
  const isPaid = Boolean(planKey) && planKey !== DEFAULT_PACKAGE_KEY;
  const periodLabel = formatSubscriptionDate(summary?.currentPeriodEnd);

  // Aboneliksiz veya ücretsiz plan: iptal edilecek bir şey yok.
  if (!summary || !isPaid || summary.status === "none") {
    planChangeCancel.hidden = true;
    return;
  }

  planChangeCancel.hidden = false;

  if (summary.status === "canceled") {
    if (planChangeCancelNote) {
      planChangeCancelNote.textContent = periodLabel
        ? `Aboneliğin iptal edildi. Kalan kredilerin ${periodLabel} tarihine kadar geçerli; sonrasında ücretsiz plana döneceksin.`
        : "Aboneliğin iptal edildi. Kalan kredilerin dönem sonuna kadar geçerli; sonrasında ücretsiz plana döneceksin.";
    }
    if (cancelSubscriptionButton) cancelSubscriptionButton.hidden = true;
    return;
  }

  // Aktif ücretli abonelik: iptal edilebilir.
  if (planChangeCancelNote) {
    planChangeCancelNote.textContent =
      "Aboneliğini istediğin zaman iptal edebilirsin. Kalan kredilerin dönem sonuna kadar geçerli kalır; otomatik yenileme durur.";
  }
  if (cancelSubscriptionButton) {
    cancelSubscriptionButton.hidden = false;
    cancelSubscriptionButton.disabled = false;
  }
}

async function cancelSubscriptionFlow(button) {
  const headers = await authHeaders({ "Content-Type": "application/json" });
  if (!headers.Authorization) {
    setPlanChangeStatus("İptal için oturum açman gerekiyor.", "error");
    return;
  }

  button.disabled = true;
  setPlanChangeStatus("Abonelik iptal ediliyor…", "info");
  try {
    const response = await withTimeout(
      fetch(subscriptionApiUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "cancel" }),
      }),
      STUDIO_AUTH_TIMEOUT_MS,
      "Abonelik iptal edilemedi."
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.canceled) {
      throw new Error(data.error || "Abonelik iptal edilemedi.");
    }

    subscriptionSummary = {
      planKey: normalizePackageKey(data.planKey) || subscriptionSummary?.planKey || DEFAULT_PACKAGE_KEY,
      status: "canceled",
      currentPeriodEnd: data.currentPeriodEnd || subscriptionSummary?.currentPeriodEnd || null,
      active: true,
    };
    renderPlanChangeCancel();

    const periodLabel = formatSubscriptionDate(subscriptionSummary.currentPeriodEnd);
    setPlanChangeStatus(
      periodLabel
        ? `Aboneliğin iptal edildi. Kredilerin ${periodLabel} tarihine kadar geçerli.`
        : "Aboneliğin iptal edildi. Kredilerin dönem sonuna kadar geçerli.",
      "notice"
    );
  } catch (error) {
    button.disabled = false;
    setPlanChangeStatus(error?.message || "Abonelik iptal edilemedi.", "error");
  }
}

async function startPlanChangeCheckout(planKey, button) {
  const normalizedPlanKey = normalizePackageKey(planKey);
  if (!normalizedPlanKey || normalizedPlanKey === DEFAULT_PACKAGE_KEY) return;

  const headers = await authHeaders({ "Content-Type": "application/json" });
  if (!headers.Authorization) {
    setPlanChangeStatus("Paket değiştirmek için oturum açman gerekiyor.", "error");
    return;
  }

  button.disabled = true;
  setPlanChangeStatus("Ödeme başlatılıyor…", "info");
  try {
    const response = await withTimeout(
      fetch(iyzicoCheckoutApiUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify({ planKey: normalizedPlanKey }),
      }),
      STUDIO_AUTH_TIMEOUT_MS,
      "Ödeme başlatılamadı."
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.paymentPageUrl) {
      throw new Error(data.error || "Ödeme başlatılamadı.");
    }
    // iyzico'nun barındırılan ödeme sayfası; başarı/başarısızlıkta callback bizi
    // odeme.html?sonuc=... adresine geri getirir.
    window.location.href = data.paymentPageUrl;
  } catch (error) {
    button.disabled = false;
    setPlanChangeStatus(error?.message || "Ödeme başlatılamadı.", "error");
  }
}

function formatTry(value) {
  try {
    return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value);
  } catch {
    return String(value);
  }
}

function setTopupStatus(message, tone = "info") {
  if (!topupStatus) return;
  if (!message || !isVisibleStatusTone(tone)) {
    topupStatus.hidden = true;
    topupStatus.textContent = "";
    return;
  }
  topupStatus.hidden = false;
  topupStatus.dataset.tone = tone === "notice" ? "success" : tone;
  topupStatus.textContent = message;
}

// Top-up bölümü yalnızca aktif ücretli abonelere görünür. Sunucu da ayrıca
// hasActiveSubscription ile kesin kontrol eder; bu sadece UX kapısı.
function renderTopupSection() {
  if (!topupSection || !topupOptions) return;

  if (currentEffectivePlanKey() === DEFAULT_PACKAGE_KEY) {
    topupSection.hidden = true;
    return;
  }
  topupSection.hidden = false;

  const wallet = resolveCreditWallet();
  const topupBalance = normalizeCreditNumber(wallet?.topupBalance);
  if (topupCurrent) {
    if (topupBalance > 0) {
      const expiry = formatSubscriptionDate(wallet?.topupNextExpiry);
      topupCurrent.hidden = false;
      topupCurrent.textContent = expiry
        ? `Mevcut ek kredin: ${topupBalance} · en yakın ${expiry} tarihinde sona erer`
        : `Mevcut ek kredin: ${topupBalance}`;
    } else {
      topupCurrent.hidden = true;
      topupCurrent.textContent = "";
    }
  }

  const cards = TOPUP_PACKS_DISPLAY.map((pack) => {
    const card = document.createElement("div");
    card.className = "topup-option";

    const title = document.createElement("strong");
    title.textContent = `${pack.credits} kredi`;

    const listTotal = TOPUP_LIST_PRICE_TRY * pack.credits;
    const discount = Math.round((1 - pack.priceTry / listTotal) * 100);
    const perCredit = Math.round((pack.priceTry / pack.credits) * 10) / 10;

    const price = document.createElement("div");
    price.className = "topup-price";
    const listEl = document.createElement("s");
    listEl.textContent = `${formatTry(listTotal)}₺`;
    const nowEl = document.createElement("span");
    nowEl.className = "topup-price-now";
    nowEl.textContent = `${formatTry(pack.priceTry)}₺`;
    const off = document.createElement("span");
    off.className = "topup-badge";
    off.textContent = `−%${discount}`;
    price.append(listEl, nowEl, off);

    const meta = document.createElement("p");
    meta.className = "topup-meta";
    meta.textContent = `${formatTry(perCredit)}₺/kredi · 90 gün geçerli`;

    const action = document.createElement("button");
    action.type = "button";
    action.className = "button button-primary";
    action.dataset.topupSelect = pack.key;
    action.textContent = "Satın al";

    card.append(title, price, meta, action);
    return card;
  });

  topupOptions.replaceChildren(...cards);
}

async function startTopupCheckout(packKey, button) {
  const headers = await authHeaders({ "Content-Type": "application/json" });
  if (!headers.Authorization) {
    setTopupStatus("Ek kredi almak için oturum açman gerekiyor.", "error");
    return;
  }

  button.disabled = true;
  setTopupStatus("Ödeme başlatılıyor…", "info");
  try {
    const response = await withTimeout(
      fetch(topupCheckoutApiUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify({ packKey }),
      }),
      STUDIO_AUTH_TIMEOUT_MS,
      "Ödeme başlatılamadı."
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.paymentPageUrl) {
      throw new Error(data.error || "Ödeme başlatılamadı.");
    }
    window.location.href = data.paymentPageUrl;
  } catch (error) {
    button.disabled = false;
    setTopupStatus(error?.message || "Ödeme başlatılamadı.", "error");
  }
}

// iyzico top-up dönüşü: /studio?kredi=basarili|hata. Bildirim göster + URL'yi temizle;
// kredi bakiyesi zaten init'te server'dan tazeleniyor.
function handleTopupReturn() {
  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }
  const kredi = params.get("kredi");
  if (!kredi) return;

  if (kredi === "basarili") {
    showCloudSyncWarning("Ek kredin yüklendi. Bakiyen güncellendi.");
  } else if (kredi === "hata") {
    showCloudSyncWarning("Ek kredi ödemesi tamamlanamadı. Tekrar deneyebilirsin.");
  }

  params.delete("kredi");
  params.delete("paket");
  params.delete("neden");
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

function togglePlanChangePanel(forceOpen) {
  if (!planChangePanel || !openPlanChangeButton) return;

  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : planChangePanel.hidden;
  if (shouldOpen) {
    renderPlanChangeOptions();
    setPlanChangeStatus("");
    // Abonelik durumunu (aktif/iptal + dönem sonu) server'dan tazeleyip yeniden çiz.
    fetchSubscriptionSummary()
      .then(() => {
        renderPlanChangeOptions();
        renderTopupSection();
      })
      .catch((error) => console.warn("[subscription] summary refresh failed.", error));
  }
  planChangePanel.hidden = !shouldOpen;
  openPlanChangeButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function bindPackageControls() {
  refreshCreditsButton?.addEventListener("click", () => {
    refreshCreditWallet().catch((error) => {
      showCloudSyncWarning(error.message || "Kredi bilgisi yenilenemedi.");
    });
  });

  openPlanChangeButton?.addEventListener("click", () => togglePlanChangePanel());

  planChangeOptions?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-plan-change-select]");
    if (!trigger || trigger.disabled) return;
    startPlanChangeCheckout(trigger.dataset.planChangeSelect, trigger).catch((error) => {
      trigger.disabled = false;
      setPlanChangeStatus(error?.message || "Paket değiştirilemedi.", "error");
    });
  });

  cancelSubscriptionButton?.addEventListener("click", () => {
    cancelSubscriptionFlow(cancelSubscriptionButton).catch((error) => {
      cancelSubscriptionButton.disabled = false;
      setPlanChangeStatus(error?.message || "Abonelik iptal edilemedi.", "error");
    });
  });

  topupOptions?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-topup-select]");
    if (!trigger || trigger.disabled) return;
    startTopupCheckout(trigger.dataset.topupSelect, trigger).catch((error) => {
      trigger.disabled = false;
      setTopupStatus(error?.message || "Ödeme başlatılamadı.", "error");
    });
  });
}

function bindAdminCreditControls() {
  adminCreditLookupForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    loadAdminCreditWallet().catch((error) => setAdminCreditStatus(error.message, "error"));
  });

  adminCreditForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitAdminCreditAdjustment().catch((error) => setAdminCreditStatus(error.message, "error"));
  });

  adminRoleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitAdminRoleChange().catch((error) => setAdminRoleStatus(error.message, "error"));
  });

  adminSpendingRefreshButton?.addEventListener("click", () => {
    loadAdminSpendingReport({ force: true }).catch((error) => {
      setAdminSpendingStatus(error.message || "Harcama raporu okunamadı.", "error");
    });
  });
}
