const revealItems = document.querySelectorAll(".reveal");

const localAppOrigin = "http://localhost:3000";

if (window.location.protocol === "file:") {
  const localPageLinks = document.querySelectorAll(
    'a[href$=".html"], a[href*=".html#"], a[href*=".html?"], a[href="./studio"], a[href^="./studio?"]'
  );

  localPageLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("http://") || href.startsWith("https://")) {
      return;
    }

    const normalizedHref = href.replace(/^\.\//, "");
    link.setAttribute("href", `${localAppOrigin}/${normalizedHref}`);
  });
}

const inPageLinks = document.querySelectorAll('a[href*="#"]');

inPageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const url = new URL(href, window.location.href);
    const isSamePage =
      url.origin === window.location.origin && url.pathname === window.location.pathname;

    if (!isSamePage || !url.hash) return;

    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    window.history.pushState(null, "", url.hash);
  });
});

const packageStorageKey = "ff-selected-package";
const packagePanelFlagKey = "ff-open-package-panel";
const packagePlans = {
  free: {
    name: "Ücretsiz",
    summary: "Ücretsiz seçildi. Tek seferlik 10 krediyle ilk tasarımını Atelify'da deneyebilirsin.",
  },
  go: {
    name: "Go",
    summary: "Go seçildi. Aylık abonelik: her ay yenilenen 15 krediyle bir ürünü baştan sona çıkarabilirsin.",
  },
  pro: {
    name: "Pro",
    summary: "Pro seçildi. Aylık abonelik: her ay yenilenen 45 krediyle düzenli koleksiyon ve üretim akışı.",
  },
  max: {
    name: "Max",
    summary: "Max seçildi. Aylık abonelik: her ay yenilenen 250 krediyle marka ve ekip ölçeğinde üretim.",
  },
};

const packageCards = document.querySelectorAll("[data-package-card]");
const packageSelectLinks = document.querySelectorAll("[data-package-select]");
const packageSelectedName = document.querySelector("[data-package-selected-name]");
const packageSelectedSummary = document.querySelector("[data-package-selected-summary]");
const packageContinueLink = document.querySelector("[data-package-continue]");

function normalizePackageKey(value) {
  if (!value) return "";
  const key = String(value).trim().toLowerCase();
  return packagePlans[key] ? key : "";
}

function readStoredPackage() {
  try {
    return normalizePackageKey(window.localStorage.getItem(packageStorageKey));
  } catch {
    return "";
  }
}

function storePackage(planKey) {
  if (!planKey) return;

  try {
    window.localStorage.setItem(packageStorageKey, planKey);
    window.localStorage.setItem(packagePanelFlagKey, "1");
  } catch {
    // Selection still works through the query string when storage is unavailable.
  }
}

function packageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return normalizePackageKey(params.get("paket") || params.get("plan"));
}

function packageStudioHref(planKey) {
  const path = planKey ? `studio?paket=${planKey}` : "studio";
  return window.location.protocol === "file:" ? `${localAppOrigin}/${path}` : `./${path}`;
}

// Paket seçildiğinde nereye gidilir: Ücretsiz ödeme gerektirmez, doğrudan
// Studio'ya gider (Studio gerekirse girişe yönlendirir). Go/Pro/Max ücretli
// aboneliktir; ödeme ekranına (odeme.html) gider, o ekran oturumu kontrol edip
// gerekirse login'e (?next= ile) yönlendirir.
function packageCheckoutHref(planKey) {
  if (planKey === "free") return packageStudioHref("free");
  const path = `odeme.html?paket=${planKey}`;
  return window.location.protocol === "file:" ? `${localAppOrigin}/${path}` : `./${path}`;
}

function renderPackageSelection(planKey) {
  const normalizedPlanKey = normalizePackageKey(planKey);
  const plan = packagePlans[normalizedPlanKey];

  packageCards.forEach((card) => {
    const isSelected = card.dataset.packageCard === normalizedPlanKey;
    card.classList.toggle("is-selected", isSelected);
  });

  packageSelectLinks.forEach((link) => {
    const isSelected = link.dataset.packageSelect === normalizedPlanKey;
    link.setAttribute("aria-pressed", String(isSelected));
    link.textContent = isSelected ? "Seçildi" : link.dataset.defaultLabel || link.textContent;
  });

  if (packageSelectedName) {
    packageSelectedName.textContent = plan ? `${plan.name} paketi` : "Henüz paket seçilmedi";
  }

  if (packageSelectedSummary) {
    packageSelectedSummary.textContent = plan
      ? plan.summary
      : "Bir paket seçtiğinde Atelify'a bu paketle devam edebilirsin.";
  }

  if (packageContinueLink) {
    packageContinueLink.setAttribute("href", packageStudioHref(plan ? normalizedPlanKey : ""));
  }
}

function bindPackageSelection() {
  if (!packageCards.length && !packageSelectLinks.length) return;

  packageSelectLinks.forEach((link) => {
    link.dataset.defaultLabel = link.textContent.trim();

    // Tek adım: paketi seç → doğrudan ilerle (Ücretsiz → Studio, ücretli → ödeme).
    // Eski "seç, sonra yukarıdaki panelden tekrar devam et" iki adımı kaldırıldı.
    link.addEventListener("click", (event) => {
      const planKey = normalizePackageKey(link.dataset.packageSelect);
      if (!planKey) return;

      event.preventDefault();
      storePackage(planKey);
      window.location.href = packageCheckoutHref(planKey);
    });
  });

  const urlPlan = packageFromUrl();
  const initialPlan = urlPlan || readStoredPackage();
  if (urlPlan) {
    storePackage(urlPlan);
  }
  renderPackageSelection(initialPlan);
}

bindPackageSelection();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const stage = document.querySelector("[data-tilt]");

if (stage) {
  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 8;
    const rotateX = (0.5 - y) * 8;

    stage.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  stage.addEventListener("pointerleave", () => {
    stage.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  });
}

/* ---------------------------------------------------------------------------
   Yeni sürüm bildirimi
   Açık sayfalar yayındaki deployment değiştiğinde yenileme çağrısı gösterir.
--------------------------------------------------------------------------- */
(function initVersionUpdateNotice() {
  if (!["http:", "https:"].includes(window.location.protocol)) return;

  const checkIntervalMs = 60 * 1000;
  let activeVersion = "";
  let isChecking = false;
  let noticeShown = false;

  function normalizeVersion(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function endpointUrl() {
    const url = new URL("/api/version", window.location.origin);
    url.searchParams.set("t", String(Date.now()));
    return url.toString();
  }

  async function readVersion() {
    const response = await window.fetch(endpointUrl(), {
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Version check failed");
    }

    const payload = await response.json();
    return normalizeVersion(payload?.version);
  }

  function showUpdateNotice() {
    if (noticeShown || document.querySelector("[data-version-notice]")) return;
    noticeShown = true;

    const notice = document.createElement("aside");
    notice.className = "version-notice";
    notice.dataset.versionNotice = "true";
    notice.setAttribute("role", "alert");
    notice.setAttribute("aria-live", "assertive");
    notice.innerHTML = `
      <p>
        <strong>Yeni bir sürüm yayında.</strong>
        <span>Son değişiklikleri görmek için sayfayı yenile.</span>
      </p>
      <button class="button button-primary" type="button" data-version-reload>
        Yenile
      </button>
    `;

    notice.querySelector("[data-version-reload]")?.addEventListener("click", () => {
      window.location.reload();
    });

    document.body.appendChild(notice);
    window.requestAnimationFrame(() => notice.classList.add("is-visible"));
  }

  async function checkVersion() {
    if (isChecking || noticeShown) return;
    isChecking = true;

    try {
      const latestVersion = await readVersion();
      if (!latestVersion) return;

      if (!activeVersion) {
        activeVersion = latestVersion;
        return;
      }

      if (latestVersion !== activeVersion) {
        showUpdateNotice();
      }
    } catch {
      // Bağlantı kesintilerinde sessizce bekleyip sonraki kontrolde tekrar dener.
    } finally {
      isChecking = false;
    }
  }

  window.setTimeout(checkVersion, 1500);
  window.setInterval(checkVersion, checkIntervalMs);
  window.addEventListener("focus", checkVersion);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkVersion();
    }
  });
})();

/* ---------------------------------------------------------------------------
   Çerez onay bandı
   Tercih localStorage'da "ff-cookie-consent" altında tutulur (accepted/rejected).
   Banner her sayfaya dinamik enjekte edilir; ayrı HTML gerekmez.
--------------------------------------------------------------------------- */
(function initCookieConsent() {
  const consentKey = "ff-cookie-consent";

  function readConsent() {
    try {
      return window.localStorage.getItem(consentKey);
    } catch {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch {
      // Tercih saklanamasa bile banner bu oturumda kapanır.
    }
  }

  function policyHref() {
    const path = "cerez-politikasi.html";
    return window.location.protocol === "file:"
      ? `${localAppOrigin}/${path}`
      : `./${path}`;
  }

  if (readConsent()) return;

  const banner = document.createElement("aside");
  banner.className = "cookie-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-live", "polite");
  banner.setAttribute("aria-label", "Çerez tercihi");
  banner.innerHTML = `
    <p>
      Atelify; oturumu sürdürmek ve siteyi geliştirmek için zorunlu ve isteğe bağlı
      çerezler kullanır. Detaylar için
      <a href="${policyHref()}">Çerez Politikası</a> sayfasını inceleyebilirsin.
    </p>
    <div class="cookie-actions">
      <button type="button" class="button button-secondary" data-cookie="reject">
        Yalnızca zorunlu
      </button>
      <button type="button" class="button button-primary" data-cookie="accept">
        Kabul et
      </button>
    </div>
  `;

  function close(choice) {
    storeConsent(choice);
    banner.classList.remove("is-visible");
    window.setTimeout(() => banner.remove(), 320);
  }

  banner.addEventListener("click", (event) => {
    const target = event.target.closest("[data-cookie]");
    if (!target) return;
    close(target.dataset.cookie === "accept" ? "accepted" : "rejected");
  });

  document.body.appendChild(banner);
  window.requestAnimationFrame(() => banner.classList.add("is-visible"));
})();
