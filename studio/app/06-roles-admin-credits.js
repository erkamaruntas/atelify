// Atelify stüdyo — roles-admin-credits
// Rol tabanlı arayüz, yönetici kredi düzeltme, harcama raporu ve rol yönetimi.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function isAdminAccount(role = currentAccountRole) {
  return role === "admin";
}

// Proje sahibi: yalnızca env allowlist'teki hesap. Sahip Paneli gibi
// sahibe özel araçlar bununla açılır. Diğer admin hesapları sahip sayılmaz.
function isOwnerAccount() {
  return currentAccountIsOwner === true;
}

function defaultTabForRole(role = currentAccountRole) {
  return "genel";
}

function isTabAllowedForRole(tabKey, role = currentAccountRole, { isOwner = currentAccountIsOwner } = {}) {
  const normalizedTab = tabController.normalize(tabKey);
  if (!ROUTABLE_TABS.has(normalizedTab)) return false;
  if (OWNER_ONLY_TABS.has(normalizedTab)) return isAdminAccount(role) && isOwner === true;
  if (isAdminAccount(role)) return true;
  return !USER_BLOCKED_TABS.has(normalizedTab);
}

function applyAccountRoleUi(role = "user", { isOwner = false } = {}) {
  currentAccountRole = isAdminAccount(role) ? "admin" : "user";
  // Sahiplik yalnızca admin hesaplar için anlamlı; normal kullanıcıda her zaman false.
  currentAccountIsOwner = currentAccountRole === "admin" && isOwner === true;
  document.body.dataset.accountRole = currentAccountRole;
  document.body.dataset.accountOwner = currentAccountIsOwner ? "true" : "false";

  NAV_ITEMS.forEach((button) => {
    const tabKey = tabController.normalize(button.dataset.tab);
    button.hidden = !isTabAllowedForRole(tabKey, currentAccountRole);
  });

  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.hidden = !isAdminAccount();
  });

  document.querySelectorAll("[data-owner-only]").forEach((el) => {
    el.hidden = !isOwnerAccount();
  });

  document.querySelectorAll("[data-tab-trigger]").forEach((trigger) => {
    const tabKey = tabController.normalize(trigger.dataset.tabTrigger);
    if (ROUTABLE_TABS.has(tabKey)) {
      trigger.hidden = !isTabAllowedForRole(tabKey, currentAccountRole);
    }
  });

  document.querySelectorAll("[data-production-request]").forEach((button) => {
    button.hidden = false;
  });

  if (adminCreditPanel) {
    // Kredi yükleme yalnızca proje sahibine açık.
    adminCreditPanel.hidden = !isOwnerAccount();
  }

  if (adminSpendingPanel) {
    // Kullanıcı harcama raporu da yalnızca proje sahibine açık.
    adminSpendingPanel.hidden = !isOwnerAccount();
    if (isOwnerAccount()) {
      loadAdminSpendingReport().catch((error) => {
        setAdminSpendingStatus(error.message || "Harcama raporu okunamadı.", "error");
      });
    } else {
      adminSpendingCache = null;
      renderAdminSpendingReport({ users: [], totals: {} });
      setAdminSpendingStatus("");
    }
  }

  if (adminRolePanel) {
    // Admin yapma/alma da yalnızca proje sahibine açık.
    adminRolePanel.hidden = !isOwnerAccount();
    if (isOwnerAccount()) {
      loadAdminRoleList().catch((error) => console.warn("[roles] admin list failed.", error));
    }
  }

  const roleChip = document.querySelector("[data-profile-role-label]");
  if (roleChip) {
    roleChip.textContent = isOwnerAccount()
      ? "Müşteri + sahip hesabı"
      : isAdminAccount()
        ? "Müşteri + yönetim hesabı"
        : "Müşteri hesabı";
  }
}

async function initializeAccountRoleUi() {
  applyAccountRoleUi("user");

  // Önce sahiplik kontrolü: /api/admin/credits artık yalnızca proje sahibine
  // açık. Başarılıysa hem sahip hem admin yetkisi var demektir.
  try {
    const { response } = await withTimeout(
      studioApi.readAdminCredits(),
      STUDIO_AUTH_TIMEOUT_MS,
      "Rol bilgisi zaman aşımına uğradı."
    );
    if (response.ok) {
      applyAccountRoleUi("admin", { isOwner: true });
      return currentAccountRole;
    }
  } catch (error) {
    console.warn("[credits] owner panel check failed.", error);
  }

  // Sahip değil; profil rolü admin olan hesaplar sipariş yönetimini görebilir.
  try {
    const { response } = await withTimeout(
      studioApi.adminListProductionRequests(),
      STUDIO_AUTH_TIMEOUT_MS,
      "Rol bilgisi zaman aşımına uğradı."
    );
    if (response.ok) {
      applyAccountRoleUi("admin", { isOwner: false });
    }
  } catch (error) {
    console.warn("[production-requests] admin role check failed.", error);
  }

  return currentAccountRole;
}

async function loadAdminCreditWallet() {
  const { email, userId } = adminCreditTarget();
  if (!email && !userId) {
    throw new Error("Kullanıcı e-postası veya user id gir.");
  }

  setAdminCreditStatus("Kullanıcı kredisi okunuyor...");
  const { payload, response } = await studioApi.readAdminCredits({ email, userId });
  if (!response.ok) {
    throw new Error(payload.error || "Kullanıcı kredisi okunamadı.");
  }

  renderAdminCreditResult(payload);
  setAdminCreditStatus("Kredi bilgisi hazır.", "success");
}

async function submitAdminCreditAdjustment() {
  const { email, userId } = adminCreditTarget();
  if (!email && !userId) {
    throw new Error("Kredi yüklenecek kullanıcıyı e-posta veya user id ile seç.");
  }

  const amount = normalizeCreditNumber(adminCreditAmountInput?.value, NaN);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Kredi miktarı 0 veya daha büyük bir sayı olmalı.");
  }

  setAdminCreditStatus("Kredi işlemi uygulanıyor...");
  const { payload, response } = await studioApi.grantAdminCredits({
    amount,
    email,
    isUnlimited: adminCreditUnlimitedInput?.checked === true ? true : null,
    label: adminCreditLabelInput?.value || "",
    mode: adminCreditModeSelect?.value || "add",
    userId,
  });
  if (!response.ok) {
    throw new Error(payload.error || "Kredi yüklenemedi.");
  }

  renderAdminCreditResult(payload);
  if (payload.userId && payload.userId === currentUserId && payload.wallet) {
    creditWalletSource = "server";
    writeCreditWallet(payload.wallet);
  }
  setAdminCreditStatus("Kredi işlemi tamamlandı.", "success");
}

function adminCreditTarget() {
  return {
    email: String(adminCreditEmailInput?.value || "").trim(),
    userId: String(adminCreditUserIdInput?.value || "").trim(),
  };
}

function setAdminCreditStatus(message, type = "") {
  if (!adminCreditStatus) return;
  const visible = Boolean(message) && isVisibleStatusTone(type);
  adminCreditStatus.hidden = !visible;
  adminCreditStatus.textContent = visible ? message : "";
  adminCreditStatus.dataset.status = type;
}

function renderAdminCreditResult(payload) {
  if (!adminCreditResult) return;

  const wallet = sanitizeCreditWallet(payload?.wallet);
  adminCreditResult.hidden = !wallet;
  if (!wallet) {
    adminCreditResult.replaceChildren();
    return;
  }

  const balance = wallet.isUnlimited ? "Özel limit" : `${wallet.balance} kredi`;
  const spent = wallet.isUnlimited ? "Özel limit" : `${wallet.spent} harcandı`;
  adminCreditResult.replaceChildren(
    createAdminCreditMetric("Kullanıcı", payload.userId || "-"),
    createAdminCreditMetric("Bakiye", balance),
    createAdminCreditMetric("Toplam yüklenen", wallet.isUnlimited ? "Özel limit" : `${wallet.totalGranted} kredi`),
    createAdminCreditMetric("Harcanan", spent)
  );
}

function createAdminCreditMetric(label, value) {
  const item = document.createElement("div");
  const title = document.createElement("span");
  const copy = document.createElement("strong");
  title.textContent = label;
  copy.textContent = value;
  item.append(title, copy);
  return item;
}

function setAdminSpendingStatus(message, type = "") {
  if (!adminSpendingStatus) return;
  adminSpendingStatus.hidden = !message;
  adminSpendingStatus.textContent = message || "";
  adminSpendingStatus.dataset.status = type;
}

async function loadAdminSpendingReport(options = {}) {
  if (!isOwnerAccount()) return;
  if (adminSpendingCache && !options.force) {
    renderAdminSpendingReport(adminSpendingCache);
    return;
  }

  const defaultLabel = adminSpendingRefreshButton?.textContent || "Harcama raporunu yenile";
  if (adminSpendingRefreshButton) {
    adminSpendingRefreshButton.disabled = true;
    adminSpendingRefreshButton.textContent = "Yükleniyor...";
  }
  setAdminSpendingStatus("Harcama raporu okunuyor...");

  try {
    const { payload, response } = await withTimeout(
      studioApi.listAdminSpending({ limit: 200 }),
      STUDIO_AUTH_TIMEOUT_MS,
      "Harcama raporu zaman aşımına uğradı."
    );
    if (!response.ok) {
      throw new Error(payload.error || "Harcama raporu okunamadı.");
    }

    adminSpendingCache = payload || {};
    renderAdminSpendingReport(adminSpendingCache);
    const generatedAt = formatAdminSpendingDate(adminSpendingCache.generatedAt);
    setAdminSpendingStatus(
      generatedAt === "Yok" ? "Harcama raporu hazır." : `Güncellendi: ${generatedAt}`,
      "success"
    );
  } finally {
    if (adminSpendingRefreshButton) {
      adminSpendingRefreshButton.disabled = false;
      adminSpendingRefreshButton.textContent = defaultLabel;
    }
  }
}

function renderAdminSpendingReport(report = {}) {
  const totals = report?.totals && typeof report.totals === "object" ? report.totals : {};
  const users = Array.isArray(report?.users) ? report.users : [];
  const spendingUsers = users.filter((user) => (
    normalizeCreditNumber(user?.spent) > 0 ||
    normalizeCreditNumber(user?.grossSpent) > 0 ||
    normalizeCreditNumber(user?.refunds) > 0
  ));
  renderAdminSpendingSummary(totals);

  if (adminSpendingList) {
    adminSpendingList.replaceChildren(...spendingUsers.map(createAdminSpendingRow));
  }
  if (adminSpendingEmpty) {
    adminSpendingEmpty.hidden = spendingUsers.length > 0;
  }
}

function renderAdminSpendingSummary(totals = {}) {
  if (!adminSpendingSummary) return;
  adminSpendingSummary.replaceChildren(
    createAdminCreditMetric("Kullanıcı", String(normalizeCreditNumber(totals.users))),
    createAdminCreditMetric("Net harcama", formatAdminSpendingCredit(totals.spent)),
    createAdminCreditMetric("Brüt harcama", formatAdminSpendingCredit(totals.grossSpent)),
    createAdminCreditMetric("İade", formatAdminSpendingCredit(totals.refunds))
  );
}

function createAdminSpendingRow(row = {}) {
  const item = document.createElement("article");
  item.className = "admin-spending-row";

  const user = document.createElement("div");
  user.className = "admin-spending-user";
  const email = document.createElement("strong");
  email.textContent = row.email || row.userId || "Kullanıcı";

  const meta = document.createElement("div");
  meta.className = "admin-spending-meta";
  meta.append(
    createAdminSpendingMeta("Bakiye", row.isUnlimited ? "Özel limit" : formatAdminSpendingCredit(row.balance)),
    createAdminSpendingMeta("İşlem", String(normalizeCreditNumber(row.spendCount))),
    createAdminSpendingMeta("Son harcama", formatAdminSpendingDate(row.lastSpendAt)),
    createAdminSpendingMeta("Plan", row.planKey || "free")
  );
  user.append(email, meta);

  const total = document.createElement("div");
  total.className = "admin-spending-total";
  const totalLabel = document.createElement("small");
  totalLabel.textContent = "Net harcama";
  const totalValue = document.createElement("span");
  totalValue.textContent = formatAdminSpendingCredit(row.spent);
  const totalSub = document.createElement("em");
  totalSub.textContent = `Brüt ${formatAdminSpendingCredit(row.grossSpent)} · İade ${formatAdminSpendingCredit(row.refunds)}`;
  total.append(totalLabel, totalValue, totalSub);

  const stages = document.createElement("p");
  stages.className = "admin-spending-stages";
  stages.textContent = adminSpendingStageText(row.stageBreakdown);

  item.append(user, total);
  if (stages.textContent) item.append(stages);
  return item;
}

function createAdminSpendingMeta(label, value) {
  const item = document.createElement("span");
  item.textContent = `${label}: ${value}`;
  return item;
}

function formatAdminSpendingCredit(value) {
  return `${normalizeCreditNumber(value)} kredi`;
}

function formatAdminSpendingDate(value) {
  const source = validIsoDate(value);
  if (!source) return "Yok";
  return new Date(source).toLocaleString("tr-TR");
}

function adminSpendingStageText(stageBreakdown = {}) {
  if (!stageBreakdown || typeof stageBreakdown !== "object") return "";

  return Object.entries(stageBreakdown)
    .map(([stage, amount]) => [stage, normalizeCreditNumber(amount)])
    .filter(([, amount]) => amount > 0)
    .sort((left, right) => right[1] - left[1])
    .map(([stage, amount]) => `${ADMIN_SPENDING_STAGE_LABELS[stage] || stage}: ${amount} kredi`)
    .join(" · ");
}

function setAdminRoleStatus(message, type = "") {
  if (!adminRoleStatus) return;
  const visible = Boolean(message) && isVisibleStatusTone(type);
  adminRoleStatus.hidden = !visible;
  adminRoleStatus.textContent = visible ? message : "";
  adminRoleStatus.dataset.status = type;
}

async function submitAdminRoleChange() {
  const email = String(adminRoleEmailInput?.value || "").trim();
  const userId = String(adminRoleUserIdInput?.value || "").trim();
  if (!email && !userId) {
    throw new Error("Rolü değiştirilecek kullanıcıyı e-posta veya user id ile gir.");
  }

  const role = adminRoleSelect?.value === "admin" ? "admin" : "user";
  setAdminRoleStatus(role === "admin" ? "Kullanıcı admin yapılıyor..." : "Adminlik kaldırılıyor...");
  const { payload, response } = await studioApi.setAdminRole({ email, role, userId });
  if (!response.ok) {
    throw new Error(payload.error || "Rol güncellenemedi.");
  }

  const updatedRole = payload?.profile?.role === "admin" ? "admin" : "user";
  setAdminRoleStatus(
    updatedRole === "admin" ? "Kullanıcı artık admin." : "Adminlik kaldırıldı.",
    "success"
  );
  if (adminRoleEmailInput) adminRoleEmailInput.value = "";
  if (adminRoleUserIdInput) adminRoleUserIdInput.value = "";
  await loadAdminRoleList().catch((error) => console.warn("[roles] admin list refresh failed.", error));
}

async function loadAdminRoleList() {
  if (!adminRoleList) return;

  const { payload, response } = await studioApi.listAdminRoles();
  if (!response.ok) {
    throw new Error(payload.error || "Admin listesi okunamadı.");
  }

  renderAdminRoleList(Array.isArray(payload.profiles) ? payload.profiles : []);
}

function renderAdminRoleList(profiles) {
  if (!adminRoleList) return;

  adminRoleList.replaceChildren();
  const admins = profiles.filter((profile) => profile?.role === "admin");

  if (adminRoleListEmpty) adminRoleListEmpty.hidden = admins.length > 0;
  if (!admins.length) return;

  admins.forEach((profile) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = profile.email || profile.userId || "-";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "text-link";
    removeButton.textContent = "Adminliği kaldır";
    removeButton.addEventListener("click", () => {
      removeAdminRole(profile).catch((error) => setAdminRoleStatus(error.message, "error"));
    });
    item.append(label, removeButton);
    adminRoleList.append(item);
  });
}

async function removeAdminRole(profile) {
  const userId = String(profile?.userId || "").trim();
  const email = String(profile?.email || "").trim();
  if (!userId && !email) return;

  setAdminRoleStatus("Adminlik kaldırılıyor...");
  const { payload, response } = await studioApi.setAdminRole({ email, role: "user", userId });
  if (!response.ok) {
    throw new Error(payload.error || "Rol güncellenemedi.");
  }

  setAdminRoleStatus("Adminlik kaldırıldı.", "success");
  await loadAdminRoleList().catch((error) => console.warn("[roles] admin list refresh failed.", error));
}
