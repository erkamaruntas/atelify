// Atelify stüdyo — package-credits
// Paket seçimi, kullanıcıya özel depolama, kredi cüzdanı ve API adresleri.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function packageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return normalizePackageKey(params.get("paket") || params.get("plan"));
}

function readSelectedPackage() {
  return studioStore.readSelectedPackage();
}

function configureStudioStorageForUser(userId = currentUserId) {
  const nextScope = sanitizeStorageScopeUserId(userId) || "local";
  if (studioStorageScope === nextScope) return;

  studioStorageScope = nextScope;
  studioStore.setStorageKeys(studioStorageKeysForUser(userId));
  activeProjectId = readStoredActiveProjectId();
  activeCreditWallet = null;
}

function recordProjectDeletion(projectId) {
  const id = String(projectId || "").trim();
  if (!id) return false;

  const markers = mergeProjectDeletions(readProjectDeletions(), {
    id,
    deletedAt: new Date().toISOString(),
    isDeleted: true,
    ownerUserId: currentUserId,
  });
  const ok = writeProjectDeletions(markers);
  if (ok) scheduleCloudStudioStateSync(0);
  return ok;
}

function cleanScopedStudioStorageForSession(session) {
  if (!currentUserId) return;

  const projects = readProjects();
  const savedDesigns = readSavedDesigns();
  const cleanProjects = projects.filter((project) => !isMisclaimedScopedItem(project, session));
  const cleanSavedDesigns = savedDesigns.filter((design) => !isMisclaimedScopedItem(design, session));

  if (cleanProjects.length !== projects.length) {
    writeProjects(cleanProjects);
    if (activeProjectId && !cleanProjects.some((project) => project.id === activeProjectId)) {
      studioStore.clearActiveProjectId(activeProjectId);
      activeProjectId = "";
    }
  }
  if (cleanSavedDesigns.length !== savedDesigns.length) {
    writeSavedDesigns(cleanSavedDesigns);
  }
}

function recoverLegacyStudioStorageForCurrentUser(session) {
  if (!currentUserId) return;

  const legacyState = readLegacyStudioState();
  const ownedProjects = legacyState.projects.filter(isLegacyItemOwnedByCurrentUser);
  const ownedSavedDesigns = legacyState.savedDesigns.filter(isLegacyItemOwnedByCurrentUser);
  const recoveredProjects = ownedProjects.filter((project) => !isItemFromBeforeSessionUser(project, session));
  const recoveredSavedDesigns = ownedSavedDesigns.filter((design) => !isItemFromBeforeSessionUser(design, session));

  if (!recoveredProjects.length && !recoveredSavedDesigns.length) return;

  const mergedProjects = mergeProjects(readProjects(), recoveredProjects);
  const mergedSavedDesigns = mergeSavedDesigns(readSavedDesigns(), recoveredSavedDesigns);
  writeProjects(mergedProjects);
  writeSavedDesigns(mergedSavedDesigns);

  const thumbnails =
    legacyState.sourceThumbnails &&
    typeof legacyState.sourceThumbnails === "object" &&
    !Array.isArray(legacyState.sourceThumbnails)
      ? legacyState.sourceThumbnails
      : {};
  if (Object.keys(thumbnails).length) {
    studioStore.writeSourceThumbnails(
      limitSourceThumbnailEntries({
        ...thumbnails,
        ...studioStore.readSourceThumbnails(),
      })
    );
  }

  if (!activeProjectId && legacyState.activeProjectId) {
    const projectIds = new Set(mergedProjects.map((project) => project.id));
    if (projectIds.has(legacyState.activeProjectId)) {
      studioStore.writeActiveProjectId(legacyState.activeProjectId);
      activeProjectId = legacyState.activeProjectId;
    }
  }

  console.info("[studio] legacy storage recovered for current user.", {
    projects: recoveredProjects.length,
    savedDesigns: recoveredSavedDesigns.length,
  });
}

function currentStudioOwnerFields() {
  return currentUserId ? { ownerUserId: currentUserId } : {};
}

function storeSelectedPackage(planKey, shouldOpenPanel = false, options = {}) {
  const normalizedPlanKey = normalizePackageKey(planKey);
  if (!normalizedPlanKey) return;

  studioStore.writeSelectedPackage(normalizedPlanKey);
  if (shouldOpenPanel) {
    try {
      window.localStorage.setItem(PACKAGE_PANEL_FLAG_KEY, "1");
    } catch {
      // The query string still carries the selected package when storage is blocked.
    }
  }
  renderCurrentPackage(normalizedPlanKey);
}

function consumePackagePanelFlag() {
  try {
    const shouldOpen = window.localStorage.getItem(PACKAGE_PANEL_FLAG_KEY) === "1";
    if (shouldOpen) {
      window.localStorage.removeItem(PACKAGE_PANEL_FLAG_KEY);
    }
    return shouldOpen;
  } catch {
    return false;
  }
}

function resolveSelectedPackage() {
  return packageFromInitialUrl || readSelectedPackage() || DEFAULT_PACKAGE_KEY;
}

function renderCurrentPackage(planKey = resolveSelectedPackage(), options = {}) {
  const normalizedPlanKey = normalizePackageKey(planKey) || DEFAULT_PACKAGE_KEY;
  const plan = PACKAGE_PLANS[normalizedPlanKey];
  const shouldRenderCredit = options.renderCredit !== false;

  overviewPage.renderCurrentPackage(plan);
  if (shouldRenderCredit) {
    renderCreditWallet(resolveCreditWallet(normalizedPlanKey));
  }
}

function writeCreditWallet(wallet) {
  const sanitizedWallet = sanitizeCreditWallet(wallet);
  if (!sanitizedWallet) return false;

  activeCreditWallet = sanitizedWallet;
  if (creditWalletSource === "server") {
    renderCreditWallet(sanitizedWallet);
    return true;
  }

  if (studioStore.writeCreditWallet(sanitizedWallet)) {
    renderCreditWallet(sanitizedWallet);
    return true;
  }
  return false;
}

function spendCredits({ amount, jobId = "", label, stage }) {
  const cost = normalizeCreditNumber(amount);
  if (cost <= 0) return true;

  if (creditWalletSource === "server") {
    refreshCreditWallet({ silent: true }).catch((error) => {
      console.warn("[credits] refresh after spend failed.", error);
    });
    return true;
  }

  const wallet = resolveCreditWallet();
  if (wallet.isUnlimited) {
    renderCreditWallet(wallet);
    return true;
  }

  if (!canSpendCredits(cost, wallet)) return false;
  if (jobId && wallet.transactions.some((transaction) => transaction.type === "spend" && transaction.jobId === jobId)) {
    renderCreditWallet(wallet);
    return true;
  }

  const balanceAfter = wallet.balance - cost;
  const nextWallet = {
    ...wallet,
    balance: balanceAfter,
    spent: wallet.spent + cost,
    transactions: [
      createCreditTransaction({
        amount: cost,
        balanceAfter,
        jobId,
        label,
        stage,
        type: "spend",
      }),
      ...wallet.transactions,
    ].slice(0, CREDIT_HISTORY_LIMIT),
    updatedAt: new Date().toISOString(),
  };

  return writeCreditWallet(nextWallet);
}

function renderCreditWallet(wallet = resolveCreditWallet()) {
  const normalizedWallet = sanitizeCreditWallet(wallet) || createPackageCreditWallet();
  const balanceLabel = normalizedWallet.isUnlimited ? "Özel limit" : String(normalizedWallet.balance);
  const spentLabel = normalizedWallet.isUnlimited ? "Özel limit" : `${normalizedWallet.spent} harcandı`;

  [
    creditDisplay,
    statCredit,
    newDesignCredit,
    finishCredit,
    ...document.querySelectorAll("[data-mockup-credit]"),
  ].forEach((element) => {
    if (element) element.textContent = balanceLabel;
  });

  if (currentPackageCredit) currentPackageCredit.textContent = balanceLabel;
  if (currentPackageSpent) currentPackageSpent.textContent = spentLabel;
  renderCreditLedger(normalizedWallet);
  renderTopupSection();
}

function renderCreditPending() {
  [
    creditDisplay,
    statCredit,
    newDesignCredit,
    finishCredit,
    currentPackageCredit,
    ...document.querySelectorAll("[data-mockup-credit]"),
  ].forEach((element) => {
    if (element) element.textContent = "—";
  });

  if (currentPackageSpent) currentPackageSpent.textContent = "Güncelleniyor";
  if (creditLedgerList) {
    creditLedgerList.replaceChildren();
    creditLedgerList.hidden = true;
  }
  if (creditLedgerEmpty) creditLedgerEmpty.hidden = false;
}

function renderCreditLedger(wallet) {
  if (!creditLedgerList) return;

  const transactions = Array.isArray(wallet?.transactions) ? wallet.transactions.slice(0, 6) : [];
  creditLedgerList.replaceChildren(...transactions.map(createCreditLedgerItem));
  creditLedgerList.hidden = transactions.length === 0;
  if (creditLedgerEmpty) creditLedgerEmpty.hidden = transactions.length > 0;
}

function createCreditLedgerItem(transaction) {
  const item = document.createElement("div");
  item.className = `credit-ledger-item is-${transaction.type}`;

  const copy = document.createElement("span");
  copy.textContent = transaction.label;

  const amount = document.createElement("strong");
  const numericAmount = normalizeCreditNumber(transaction.amount);
  const sign = numericAmount < 0 ? "" : transaction.type === "spend" ? "-" : "+";
  amount.textContent = `${sign}${numericAmount} kredi`;

  item.append(copy, amount);
  return item;
}

function creditStageStatusSetter(stage) {
  if (stage === "finish") return setFinishStatusMessage;
  if (isVisualizationStage(stage)) return setMockupStatusMessage;
  return setSketchStatus;
}

function ensureCreditsForGeneration({ amount, label, stage }) {
  const cost = normalizeCreditNumber(amount);
  if (isCreditWalletHydrating) {
    const setter = creditStageStatusSetter(stage);
    setter("Kredi bilgisi yükleniyor. Birkaç saniye içinde tekrar dene.", "warning");
    return false;
  }

  const wallet = resolveCreditWallet();
  if (canSpendCredits(cost, wallet)) return true;

  const setter = creditStageStatusSetter(stage);
  setter(
    `${label} için ${cost} kredi gerekiyor. Kalan kredin ${wallet.balance}. Profilim > Kredi & Fatura bölümünden paketini yükseltip tekrar deneyebilirsin.`,
    "error"
  );
  return false;
}

function creditsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/credits" : "/api/credits";
}

function iyzicoCheckoutApiUrl() {
  return window.location.protocol === "file:"
    ? "http://127.0.0.1:3000/api/iyzico/checkout"
    : "/api/iyzico/checkout";
}

function subscriptionApiUrl() {
  return window.location.protocol === "file:"
    ? "http://127.0.0.1:3000/api/subscription"
    : "/api/subscription";
}

function topupCheckoutApiUrl() {
  return window.location.protocol === "file:"
    ? "http://127.0.0.1:3000/api/topup/checkout"
    : "/api/topup/checkout";
}

function adminCreditsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/admin/credits" : "/api/admin/credits";
}

function productionRequestsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/production-requests" : "/api/production-requests";
}

function profileApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/profile" : "/api/profile";
}

function adminProductionRequestsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/admin/production-requests" : "/api/admin/production-requests";
}

function adminRolesApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/admin/roles" : "/api/admin/roles";
}

function adminSpendingApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/admin/spending" : "/api/admin/spending";
}

function ticketsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/tickets" : "/api/tickets";
}

function adminTicketsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/admin/tickets" : "/api/admin/tickets";
}

function adminUserDesignsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/admin/designs" : "/api/admin/designs";
}

async function getStudioAccessToken() {
  if (!studioSupabase) return "";

  try {
    const {
      data: { session },
    } = await withTimeout(
      studioSupabase.auth.getSession(),
      STUDIO_AUTH_TIMEOUT_MS,
      "Oturum bilgisi zaman aşımına uğradı."
    );
    return session?.access_token || "";
  } catch (error) {
    console.warn("[auth] Studio access token could not be read.", error);
    return "";
  }
}

async function authHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = await getStudioAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function refreshCreditWallet(options = {}) {
  const { silent = false } = options;
  const headers = await authHeaders();

  if (!headers.Authorization) {
    creditWalletSource = "local";
    isCreditWalletHydrating = false;
    activeCreditWallet = resolveCreditWallet();
    renderCreditWallet(activeCreditWallet);
    return activeCreditWallet;
  }

  const { payload, response } = await studioApi.readCredits();

  if (!response.ok) {
    if (!silent) {
      showCloudSyncWarning(payload.error || "Kredi bilgisi alınamadı.");
    }
    throw new Error(payload.error || "Kredi bilgisi alınamadı.");
  }

  const wallet = sanitizeCreditWallet(payload);
  if (!wallet) {
    throw new Error("Kredi cüzdanı okunamadı.");
  }

  creditWalletSource = "server";
  isCreditWalletHydrating = false;
  writeCreditWallet(wallet);
  return wallet;
}

function applyCreditBalanceSnapshot(payload) {
  if (!payload || (!("creditBalance" in payload) && typeof payload.isUnlimited !== "boolean")) return;

  const currentWallet = resolveCreditWallet();
  const isUnlimited = payload.isUnlimited === true;
  const balance = isUnlimited
    ? null
    : normalizeCreditNumber(payload.creditBalance, normalizeCreditNumber(currentWallet?.balance));
  writeCreditWallet({
    ...currentWallet,
    balance,
    isUnlimited,
    updatedAt: new Date().toISOString(),
  });
}
