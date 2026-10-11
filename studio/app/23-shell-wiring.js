// Atelify stüdyo — shell-wiring
// Yükleme anında çalışan bağlantılar: başlık/sonuç yüksekliği senkronu, ekran nesneleri, sayfa çıkışı. Diğer tüm dosyalardaki fonksiyonları kullandığı için sondan bir önce yüklenir.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function syncStudioHeaderHeight() {
  if (!studioHeader) return;

  const height = Math.ceil(studioHeader.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--studio-header-height", `${height}px`);
}

syncStudioHeaderHeight();
window.addEventListener("load", syncStudioHeaderHeight);
window.addEventListener("resize", syncStudioHeaderHeight);

if ("ResizeObserver" in window && studioHeader) {
  const studioHeaderObserver = new ResizeObserver(syncStudioHeaderHeight);
  studioHeaderObserver.observe(studioHeader);
}

// Sağ (sonuç) panelinin alt kenarını sol panelin alt kenarıyla aynı hizaya getir.
// Sonuç kutusunu öyle sınırla ki: kutu + boşluk + aksiyon butonları sol panelin
// altında bitsin. Böylece sağdaki aksiyon butonu sol paneldeki son butonla aynı
// hizaya gelir, sol altta boş alan kalmaz ve kutunun altı CTA seviyesine denk düşer.
// Tüm aşamalar için geçerli.
const RESULTS_PANEL_ROW_GAP = 12; // .design-panel grid gap (head / stage / actions arası)
function syncResultsStageHeights() {
  document.querySelectorAll(".design-workspace").forEach((workspace) => {
    const stage = workspace.querySelector(".results-stage");
    if (!stage) return;

    const leftPanel = workspace.querySelector(".design-panel:not(.results-panel)");
    const actions = workspace.querySelector(".results-panel .result-actions");

    // Yalnızca ekranda görünen (ölçülebilir) aşamayı hesapla.
    if (workspace.hidden || !leftPanel || stage.offsetParent === null) {
      stage.style.maxHeight = "";
      return;
    }

    const leftBottom = leftPanel.getBoundingClientRect().bottom;
    const stageTop = stage.getBoundingClientRect().top;
    const actionsHeight = actions ? actions.getBoundingClientRect().height : 0;
    const target = Math.round(leftBottom - stageTop - actionsHeight - RESULTS_PANEL_ROW_GAP);
    stage.style.maxHeight = target > 356 ? `${target}px` : "";
  });
}

let resultsStageSyncFrame = null;
function scheduleResultsStageSync() {
  if (resultsStageSyncFrame) return;
  resultsStageSyncFrame = window.requestAnimationFrame(() => {
    resultsStageSyncFrame = null;
    syncResultsStageHeights();
  });
}

scheduleResultsStageSync();
window.addEventListener("load", scheduleResultsStageSync);
window.addEventListener("resize", scheduleResultsStageSync);

if ("ResizeObserver" in window) {
  // Sol paneli izle: yüksekliği değiştiğinde (aşama geçişi, önizleme görseli
  // yüklenmesi, kaynak seçicinin açılması vb.) kutuyu yeniden hizala. Sol panelin
  // yüksekliği bizim ayarladığımız max-height'tan bağımsız olduğu için döngü olmaz.
  const resultsStageObserver = new ResizeObserver(scheduleResultsStageSync);
  document
    .querySelectorAll(".design-workspace > .design-panel:not(.results-panel)")
    .forEach((panel) => resultsStageObserver.observe(panel));
}

// Aşama geçişlerinde (hidden attribute) kutuyu yeniden hizala.
if ("MutationObserver" in window) {
  const stageVisibilityObserver = new MutationObserver(scheduleResultsStageSync);
  document.querySelectorAll(".design-workspace").forEach((workspace) => {
    stageVisibilityObserver.observe(workspace, { attributes: true, attributeFilter: ["hidden"] });
  });
}

const StudioStorage = window.FFStudioStorage;
const StudioTabs = window.FFStudioTabs;
const StudioOverview = window.FFStudioOverview;
const StudioProjects = window.FFStudioProjects;
const StudioSavedDesigns = window.FFStudioSavedDesigns;
const StudioStoreModule = window.FFStudioStore;
const StudioApiServiceModule = window.FFStudioApiService;
const studioStore = new StudioStoreModule.StudioStore({
  ...studioStorageKeysForUser(""),
  limits: {
    pendingGenerations: 8,
    projects: PROJECT_LIMIT,
    savedDesigns: SAVED_DESIGN_LIMIT,
  },
  onWrite: () => scheduleCloudStudioStateSync(),
  packageKey: PACKAGE_STORAGE_KEY,
  packageNormalizer: normalizePackageKey,
  projectsDomain: StudioProjects,
  savedDesignsDomain: StudioSavedDesigns,
  storage: StudioStorage,
});
const studioApi = new StudioApiServiceModule.StudioApiService({
  authHeaders,
  endpoints: {
    adminCredits: adminCreditsApiUrl,
    adminProductionRequests: adminProductionRequestsApiUrl,
    adminRoles: adminRolesApiUrl,
    adminSpending: adminSpendingApiUrl,
    credits: creditsApiUrl,
    designs: designsApiUrl,
    generationDelivered: generationDeliveredApiUrl,
    generationStatus: generationStatusApiUrl,
    adminTickets: adminTicketsApiUrl,
    adminUserDesigns: adminUserDesignsApiUrl,
    profile: profileApiUrl,
    productionRequests: productionRequestsApiUrl,
    recoverGenerations: recoverGenerationsApiUrl,
    tickets: ticketsApiUrl,
  },
  onUnauthorized: handleSessionExpired,
});
const overviewPage = new StudioOverview.OverviewPage({
  creditDisplay,
  currentPackageCredit,
  currentPackageName,
  currentPackageScope,
  currentPackageSpent,
  currentPackageSummary,
  currentPackageSupport,
  finishCredit,
  mockupCredit,
  newDesignCredit,
  overviewRecentEmpty,
  overviewRecentGrid,
  statCredit,
  userFirst,
});
const projectsPage = new StudioProjects.ProjectsPage({
  elements: {
    activeProjectMeta,
    activeProjectName,
    projectEmpty,
    projectGrid,
    projectLibrary,
    projectWorkspace,
    projectWorkspacePlaceholder,
    statMonth,
    statTotal,
  },
  handlers: {
    onDeleteProject: deleteProject,
    onOpenProject: openProject,
    onRenameProject: renameProject,
  },
});
const savedDesignsPage = new StudioSavedDesigns.SavedDesignsPage({
  savedDesignsEmpty,
  savedDesignsGrid,
  savedDesignsPanel,
  sourceThumbnailReader: (key) => studioStore.readSourceThumbnails()[key] || "",
});
const TAB_ALIASES = { ayarlar: "profil", billing: "profil", fatura: "profil", kredi: "profil", yeni: "projeler" };
const PROFILE_SECTION_ALIASES = { billing: "billing", fatura: "billing", kredi: "billing" };
const tabController = StudioTabs.createTabController({
  aliases: TAB_ALIASES,
  navItems: NAV_ITEMS,
  panels: TAB_PANELS,
});
window.addEventListener("pagehide", handleStudioPageExit);
window.addEventListener("beforeunload", handleStudioPageExit);
window.addEventListener("pageshow", handleStudioPageShow);
const ROUTABLE_TABS = new Set(
  Array.from(TAB_PANELS, (panel) => tabController.normalize(panel.dataset.panel))
);
const USER_BLOCKED_TABS = new Set(["yonetim", "sahip-paneli"]);
const OWNER_ONLY_TABS = new Set(["sahip-paneli"]);

const packageFromInitialUrl = packageFromUrl();
if (packageFromInitialUrl) {
  storeSelectedPackage(packageFromInitialUrl, true);
}
