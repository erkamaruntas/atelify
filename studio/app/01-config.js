// Atelify stüdyo — config
// DOM referansları, sabitler, seçenek listeleri ve kredi maliyetleri.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.

const authLoading = document.getElementById("authLoading");
const studioShell = document.getElementById("studioShell");
const studioHeader = document.querySelector(".studio-header");
const studioSignOut = document.getElementById("studioSignOut");
const userFirst = document.querySelector("[data-user-first]");
const creditDisplay = document.querySelector("[data-credit-display]");
const statTotal = document.querySelector("[data-stat-total]");
const statCredit = document.querySelector("[data-stat-credit]");
const statMonth = document.querySelector("[data-stat-month]");
const overviewRecentEmpty = document.querySelector("[data-overview-recent-empty]");
const overviewRecentGrid = document.querySelector("[data-overview-recent-grid]");
const currentPackageName = document.querySelector("[data-current-package-name]");
const currentPackageSummary = document.querySelector("[data-current-package-summary]");
const currentPackageCredit = document.querySelector("[data-current-package-credit]");
const currentPackageScope = document.querySelector("[data-current-package-scope]");
const currentPackageSupport = document.querySelector("[data-current-package-support]");
const currentPackageSpent = document.querySelector("[data-current-package-spent]");
const creditLedgerEmpty = document.querySelector("[data-credit-ledger-empty]");
const creditLedgerList = document.querySelector("[data-credit-ledger-list]");
const refreshCreditsButton = document.querySelector("[data-refresh-credits]");
const openPlanChangeButton = document.querySelector("[data-open-plan-change]");
const planChangePanel = document.querySelector("[data-plan-change-panel]");
const planChangeOptions = document.querySelector("[data-plan-change-options]");
const planChangeStatus = document.querySelector("[data-plan-change-status]");
const planChangeCancel = document.querySelector("[data-plan-change-cancel]");
const planChangeCancelNote = document.querySelector("[data-plan-change-cancel-note]");
const cancelSubscriptionButton = document.querySelector("[data-cancel-subscription]");
const topupSection = document.querySelector("[data-topup-section]");
const topupOptions = document.querySelector("[data-topup-options]");
const topupCurrent = document.querySelector("[data-topup-current]");
const topupStatus = document.querySelector("[data-topup-status]");
const adminCreditPanel = document.querySelector("[data-admin-credit-panel]");
const adminCreditForm = document.querySelector("[data-admin-credit-form]");
const adminCreditLookupForm = document.querySelector("[data-admin-credit-lookup-form]");
const adminCreditEmailInput = document.querySelector("[data-admin-credit-email]");
const adminCreditUserIdInput = document.querySelector("[data-admin-credit-user-id]");
const adminCreditAmountInput = document.querySelector("[data-admin-credit-amount]");
const adminCreditModeSelect = document.querySelector("[data-admin-credit-mode]");
const adminCreditUnlimitedInput = document.querySelector("[data-admin-credit-unlimited]");
const adminCreditLabelInput = document.querySelector("[data-admin-credit-label]");
const adminCreditStatus = document.querySelector("[data-admin-credit-status]");
const adminCreditResult = document.querySelector("[data-admin-credit-result]");
const adminSpendingPanel = document.querySelector("[data-admin-spending-panel]");
const adminSpendingRefreshButton = document.querySelector("[data-admin-spending-refresh]");
const adminSpendingStatus = document.querySelector("[data-admin-spending-status]");
const adminSpendingSummary = document.querySelector("[data-admin-spending-summary]");
const adminSpendingList = document.querySelector("[data-admin-spending-list]");
const adminSpendingEmpty = document.querySelector("[data-admin-spending-empty]");
const adminRolePanel = document.querySelector("[data-admin-role-panel]");
const adminRoleForm = document.querySelector("[data-admin-role-form]");
const adminRoleEmailInput = document.querySelector("[data-admin-role-email]");
const adminRoleUserIdInput = document.querySelector("[data-admin-role-user-id]");
const adminRoleSelect = document.querySelector("[data-admin-role-select]");
const adminRoleStatus = document.querySelector("[data-admin-role-status]");
const adminRoleList = document.querySelector("[data-admin-role-list]");
const adminRoleListEmpty = document.querySelector("[data-admin-role-list-empty]");
const profileForms = document.querySelectorAll("[data-profile-form]");
const profileStatus = document.querySelector("[data-profile-status]");
const profileAddressStatus = document.querySelector("[data-profile-address-status]");
const profileEmail = document.querySelector("[data-profile-email]");
const profileUserId = document.querySelector("[data-profile-user-id]");
const profilePasswordResetButton = document.querySelector("[data-profile-password-reset]");
const profileSecurityStatus = document.querySelector("[data-profile-security-status]");
const profilePreferenceInputs = document.querySelectorAll("[data-profile-pref]");
const projectLibrary = document.querySelector("[data-project-library]");
const projectsLayout = document.querySelector(".projects-layout");
const projectLibraryCollapse = document.querySelector("[data-project-library-collapse]");
const projectLibraryRail = document.querySelector("[data-project-library-rail]");
const projectLibraryReopen = document.querySelector("[data-project-library-reopen]");

if (projectsLayout && projectLibraryCollapse && projectLibraryReopen) {
  const setLibraryCollapsed = (collapsed) => {
    projectsLayout.classList.toggle("library-collapsed", collapsed);
    projectLibraryCollapse.setAttribute("aria-expanded", String(!collapsed));
    projectLibraryReopen.setAttribute("aria-expanded", String(!collapsed));
    if (projectLibrary) {
      projectLibrary.toggleAttribute("inert", collapsed);
      projectLibrary.setAttribute("aria-hidden", String(collapsed));
    }
    if (projectLibraryRail) {
      projectLibraryRail.setAttribute("aria-hidden", String(!collapsed));
    }
  };
  setLibraryCollapsed(projectsLayout.classList.contains("library-collapsed"));
  projectLibraryCollapse.addEventListener("click", () => setLibraryCollapsed(true));
  projectLibraryReopen.addEventListener("click", () => setLibraryCollapsed(false));
}
const projectEmpty = document.querySelector("[data-project-empty]");
const projectGrid = document.querySelector("[data-project-grid]");
const projectWorkspace = document.querySelector("[data-project-workspace]");
const projectWorkspacePlaceholder = document.querySelector("[data-project-workspace-placeholder]");
const newProjectButtons = document.querySelectorAll("[data-new-project]");
const selectProjectsToggle = document.querySelector("[data-select-projects-toggle]");
const projectSelectBar = document.querySelector("[data-project-select-bar]");
const projectSelectCount = document.querySelector("[data-project-select-count]");
const projectSelectAllButton = document.querySelector("[data-project-select-all]");
const projectSelectCancelButton = document.querySelector("[data-project-select-cancel]");
const projectSelectDeleteButton = document.querySelector("[data-project-select-delete]");
const activeProjectName = document.querySelector("[data-active-project-name]");
const activeProjectMeta = document.querySelector("[data-active-project-meta]");
const projectDialog = document.querySelector("[data-project-dialog]");
const projectDialogForm = document.querySelector("[data-project-dialog-form]");
const projectDialogEyebrow = document.querySelector("[data-project-dialog-eyebrow]");
const projectDialogTitle = document.querySelector("[data-project-dialog-title]");
const projectDialogDescription = document.querySelector("[data-project-dialog-description]");
const projectDialogError = document.querySelector("[data-project-dialog-error]");
const projectDialogConfirm = document.querySelector("[data-project-dialog-confirm]");
const projectDialogCancelButtons = document.querySelectorAll("[data-project-dialog-cancel]");
const projectNameField = document.querySelector("[data-project-name-field]");
const projectNameInput = document.querySelector("[data-project-name-input]");
const projectDetailFields = document.querySelector("[data-project-detail-fields]");
const projectDetailProductButtons = document.querySelectorAll("[data-project-product]");
const projectDetailShapeField = document.querySelector("[data-project-shape-field]");
const projectDetailShapeButtons = document.querySelectorAll("[data-project-shape]");
const projectDetailMetalField = document.querySelector("[data-project-metal-field]");
const projectDetailMetalButtons = document.querySelectorAll("[data-project-metal]");
const newDesignCredit = document.querySelector("[data-new-design-credit]");
const newDesignStudio = document.querySelector("[data-new-design-studio]");
const continueFormButton = document.querySelector("[data-continue-form]");
const uploadInput = document.querySelector("[data-reference-upload]");
const uploadLabel = document.querySelector("[data-upload-label]");
const saveDesignButton = document.querySelector("[data-save-design]");
const savedDesignsEmpty = document.querySelector("[data-saved-designs-empty]");
const savedDesignsPanel = document.querySelector("[data-saved-designs-panel]");
const savedDesignsGrid = document.querySelector("[data-saved-designs-grid]");
const sketchCostSummary = document.querySelector("[data-sketch-cost-summary]");
const sketchStatus = document.querySelector("[data-sketch-status]");
const finishCostSummary = document.querySelector("[data-finish-cost-summary]");
const finishCredit = document.querySelector("[data-finish-credit]");
const mockupCostSummary = document.querySelector("[data-mockup-cost-summary]");
const mockupCredit = document.querySelector("[data-mockup-credit]");
const INITIAL_SKETCH_CARD_COUNT = document.querySelectorAll("[data-sketch-card]").length;

const NAV_ITEMS = document.querySelectorAll(".studio-tab[data-tab]");
const TAB_PANELS = document.querySelectorAll(".tab-panel[data-panel]");
const PACKAGE_STORAGE_KEY = "ff-selected-package";
const PACKAGE_PANEL_FLAG_KEY = "ff-open-package-panel";
const CREDIT_WALLET_STORAGE_KEY = "ff-credit-wallet";
const PENDING_GENERATIONS_STORAGE_KEY = "ff-pending-generations";
const SAVED_DESIGNS_STORAGE_KEY = "ff-saved-designs";
const SOURCE_THUMBNAILS_STORAGE_KEY = "ff-source-thumbnails";
const PROJECTS_STORAGE_KEY = "ff-design-projects";
const ACTIVE_PROJECT_STORAGE_KEY = "ff-active-project";
const PROJECT_DELETIONS_STORAGE_KEY = "ff-project-deletions";
const PROFILE_STORAGE_KEY = "ff-user-profile";
const PROFILE_PREFERENCES_STORAGE_KEY = "ff-user-preferences";
const REMOTE_STUDIO_STATE_TABLE = "ff_user_studio_state";
const DEFAULT_PACKAGE_KEY = "free";
const STAGE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const FINISH_SKETCH_ONLY_MESSAGE =
  "2. aşamada ürün yüzeyine uygulanacak temiz siyah-beyaz tasarım görseli yükleyebilirsin.";
const RING_MOLD_REFERENCE_URL = "./assets/ring-molds.jpg";
const RING_TEMPLATE_MANIFEST_URL = "./assets/ring-templates/manifest.json";
const ENGRAVING_BACKGROUND_CUTOFF = 136;
const ENGRAVING_MIN_DARKNESS = 0.92;
const STAGE_TWO_MIN_OPACITY = 0.94;
const STAGE_TWO_FULL_OPACITY = 1;
const PHOTO_TEMPLATE_EDGE_SCALE = 1.04;
const PHOTO_TEMPLATE_EDGE_SCALE_MAX = 1.12;
const PHOTO_TEMPLATE_FIT_FRAME_CLEAR_EDGE_RATIO = 0.045;
const PHOTO_TEMPLATE_MINIMALIST_FIT_FRAME_SCALE = 1;
const PHOTO_TEMPLATE_MINIMALIST_PENDANT_SCALE = 0.96;
const PHOTO_TEMPLATE_MINIMALIST_RING_SCALE = 0.86;
const DETAILED_FACE_OVERLAY_SCALE = 0.98;
const DETAILED_SQUARE_FACE_OVERLAY_SCALE = 1;
const DETAILED_FACE_CENTER_Y_OFFSET = 0;
const DETAILED_SQUARE_FRAME_LUMA_THRESHOLD = 150;
const DETAILED_SQUARE_FRAME_PADDING_RATIO = 0;
const DETAILED_SQUARE_FRAME_SCAN_THRESHOLDS = [150, 120, 96, 72];
const DETAILED_SQUARE_FRAME_MIN_LINE_RATIO = 0.38;
const DETAILED_SQUARE_FRAME_MIN_SIDE_RATIO = 0.52;
const SQUARE_OVERLAY_CORNER_RADIUS = 10;
const RECTANGULAR_OVERLAY_CORNER_RADIUS = 14;
const TEMPLATE_SURFACE_SMOOTH_BLUR = 24;
const TEMPLATE_SURFACE_SMOOTH_SCALE = 0.96;
const DESIGN_PRODUCT_OPTIONS = {
  kolye: { label: "Kolye", prompt: "pendant necklace" },
  yuzuk: { label: "Yüzük", prompt: "ring" },
};
const DESIGN_SHAPE_OPTIONS = {
  dikdortgen: { aspect: "1.55 / 1", label: "Dikdörtgen", prompt: "wide rectangular flat engraving artwork boundary", ringMold: "kare-foto-gumus-xl" },
  kare: { aspect: "1 / 1", label: "Kare", prompt: "square flat engraving artwork boundary with equal width and height, not circular", ringMold: "kare-foto-gumus-xl" },
  oval: { aspect: "1 / 1.22", label: "Oval", prompt: "vertical oval flat engraving artwork boundary at one fixed proportion that is clearly taller than wide, not round or circular", ringMold: "oval-foto-gumus-xl" },
  yuvarlak: { aspect: "1 / 1", label: "Yuvarlak", prompt: "round circular flat engraving artwork boundary", ringMold: "yuvarlak-foto-xl" },
};
const PROJECT_SHAPES_BY_PRODUCT = {
  kolye: ["yuvarlak", "kare", "dikdortgen", "oval"],
  yuzuk: ["yuvarlak", "kare", "oval"],
};
const PROJECT_METAL_OPTIONS = {
  altin: { label: "Altın", value: "altin" },
  gumus: { label: "Gümüş", value: "gumus" },
  rose: { label: "Rose", value: "rose" },
};
const DESIGN_MODE_OPTIONS = {
  emboss: {
    label: "Derin kazıma",
    prompt: "negative detailed white or silver engraving artwork on a solid black canvas",
    surfaceLabel: "Kabartma",
  },
  engrave: {
    label: "Yüzeysel kazıma",
    prompt: "minimal black line artwork for direct engraving",
    surfaceLabel: "Kazıma",
  },
};
const RING_MOLD_OPTIONS = {
  "kare-s": { aspect: "1.3 / 1.3", heightCm: "1,3", label: "Kare - S", shape: "kare", widthCm: "1,3" },
  "kare-m": { aspect: "1.5 / 1.5", heightCm: "1,5", label: "Kare - M", shape: "kare", widthCm: "1,5" },
  "kare-l": { aspect: "1.7 / 1.7", heightCm: "1,7", label: "Kare - L", shape: "kare", widthCm: "1,7" },
  "kare-xl": { aspect: "1.9 / 1.9", heightCm: "1,9", label: "Kare - XL", shape: "kare", widthCm: "1,9" },
  "oval-s": { aspect: "1 / 1.2", heightCm: "1,2", label: "Oval - S", shape: "oval", widthCm: "1" },
  "oval-m": { aspect: "1.1 / 1.5", heightCm: "1,5", label: "Oval - M", shape: "oval", widthCm: "1,1" },
  "oval-l": { aspect: "1.2 / 1.8", heightCm: "1,8", label: "Oval - L", shape: "oval", widthCm: "1,2" },
  "oval-xl": { aspect: "1.3 / 2.1", heightCm: "2,1", label: "Oval - XL", shape: "oval", widthCm: "1,3" },
  "yuvarlak-s": { aspect: "1.2 / 1.2", heightCm: "1,2", label: "Yuvarlak - S", shape: "yuvarlak", widthCm: "1,2" },
  "yuvarlak-m": { aspect: "1.4 / 1.4", heightCm: "1,4", label: "Yuvarlak - M", shape: "yuvarlak", widthCm: "1,4" },
  "yuvarlak-l": { aspect: "1.6 / 1.6", heightCm: "1,6", label: "Yuvarlak - L", shape: "yuvarlak", widthCm: "1,6" },
  "yuvarlak-xl": { aspect: "1.8 / 1.8", heightCm: "1,8", label: "Yuvarlak - XL", shape: "yuvarlak", widthCm: "1,8" },
  "kare-foto-gumus-xl": { aspect: "1.9 / 1.9", heightCm: "1,9", label: "Fotoğraf Kare - Gümüş", shape: "kare", widthCm: "1,9" },
  "kare-foto-altin-xl": { aspect: "1.9 / 1.9", heightCm: "1,9", label: "Fotoğraf Kare - Altın", shape: "kare", widthCm: "1,9" },
  "kare-foto-rose-xl": { aspect: "1.9 / 1.9", heightCm: "1,9", label: "Fotoğraf Kare - Rose", shape: "kare", widthCm: "1,9" },
  "oval-foto-gumus-xl": { aspect: "1.3 / 2.1", heightCm: "2,1", label: "Fotoğraf Oval - Gümüş", shape: "oval", widthCm: "1,3" },
  "oval-foto-altin-xl": { aspect: "1.3 / 2.1", heightCm: "2,1", label: "Fotoğraf Oval - Altın", shape: "oval", widthCm: "1,3" },
  "oval-foto-rose-xl": { aspect: "1.3 / 2.1", heightCm: "2,1", label: "Fotoğraf Oval - Rose", shape: "oval", widthCm: "1,3" },
  "yuvarlak-foto-xl": { aspect: "1.8 / 1.8", heightCm: "1,8", label: "Fotoğraf Yuvarlak - Gümüş", shape: "yuvarlak", widthCm: "1,8" },
  "yuvarlak-foto-altin-xl": { aspect: "1.8 / 1.8", heightCm: "1,8", label: "Fotoğraf Yuvarlak - Altın", shape: "yuvarlak", widthCm: "1,8" },
  "yuvarlak-foto-rose-xl": { aspect: "1.8 / 1.8", heightCm: "1,8", label: "Fotoğraf Yuvarlak - Rose", shape: "yuvarlak", widthCm: "1,8" },
  "kolye-yuvarlak-foto-altin-xl": { aspect: "1 / 1", heightCm: "2", label: "Kolye Fotoğraf Yuvarlak - Altın", shape: "yuvarlak", widthCm: "2" },
  "kolye-kare-foto-altin-xl": { aspect: "1 / 1", heightCm: "2", label: "Kolye Fotoğraf Kare - Altın", shape: "kare", widthCm: "2" },
  "kolye-dikdortgen-foto-altin-xl": { aspect: "2 / 2.8", heightCm: "2,8", label: "Kolye Fotoğraf Dikdörtgen - Altın", shape: "dikdortgen", widthCm: "2" },
  "kolye-oval-foto-altin-xl": { aspect: "1.7 / 2.3", heightCm: "2,3", label: "Kolye Fotoğraf Oval - Altın", shape: "oval", widthCm: "1,7" },
  "kolye-yuvarlak-foto-gumus-xl": { aspect: "1 / 1", heightCm: "2", label: "Kolye Fotoğraf Yuvarlak - Gümüş", shape: "yuvarlak", widthCm: "2" },
  "kolye-kare-foto-gumus-xl": { aspect: "1 / 1", heightCm: "2", label: "Kolye Fotoğraf Kare - Gümüş", shape: "kare", widthCm: "2" },
  "kolye-dikdortgen-foto-gumus-xl": { aspect: "2 / 2.8", heightCm: "2,8", label: "Kolye Fotoğraf Dikdörtgen - Gümüş", shape: "dikdortgen", widthCm: "2" },
  "kolye-oval-foto-gumus-xl": { aspect: "1.7 / 2.3", heightCm: "2,3", label: "Kolye Fotoğraf Oval - Gümüş", shape: "oval", widthCm: "1,7" },
  "kolye-yuvarlak-foto-rose-xl": { aspect: "1 / 1", heightCm: "2", label: "Kolye Fotoğraf Yuvarlak - Rose", shape: "yuvarlak", widthCm: "2" },
  "kolye-kare-foto-rose-xl": { aspect: "1 / 1", heightCm: "2", label: "Kolye Fotoğraf Kare - Rose", shape: "kare", widthCm: "2" },
  "kolye-dikdortgen-foto-rose-xl": { aspect: "2 / 2.8", heightCm: "2,8", label: "Kolye Fotoğraf Dikdörtgen - Rose", shape: "dikdortgen", widthCm: "2" },
  "kolye-oval-foto-rose-xl": { aspect: "1.7 / 2.3", heightCm: "2,3", label: "Kolye Fotoğraf Oval - Rose", shape: "oval", widthCm: "1,7" },
};
const FIXED_FINISH_RING_MOLD = "yuvarlak-foto-xl";
const FIXED_FINISH_RING_SHAPE = "yuvarlak";
const FINISH_RING_MOLD_BY_SHAPE_AND_METAL = {
  kare: { altin: "kare-foto-altin-xl", gumus: "kare-foto-gumus-xl", rose: "kare-foto-rose-xl" },
  oval: { altin: "oval-foto-altin-xl", gumus: "oval-foto-gumus-xl", rose: "oval-foto-rose-xl" },
  yuvarlak: { altin: "yuvarlak-foto-altin-xl", gumus: "yuvarlak-foto-xl", rose: "yuvarlak-foto-rose-xl" },
};
const FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL = {
  dikdortgen: { altin: "kolye-dikdortgen-foto-altin-xl", gumus: "kolye-dikdortgen-foto-gumus-xl", rose: "kolye-dikdortgen-foto-rose-xl" },
  kare: { altin: "kolye-kare-foto-altin-xl", gumus: "kolye-kare-foto-gumus-xl", rose: "kolye-kare-foto-rose-xl" },
  oval: { altin: "kolye-oval-foto-altin-xl", gumus: "kolye-oval-foto-gumus-xl", rose: "kolye-oval-foto-rose-xl" },
  yuvarlak: { altin: "kolye-yuvarlak-foto-altin-xl", gumus: "kolye-yuvarlak-foto-gumus-xl", rose: "kolye-yuvarlak-foto-rose-xl" },
};
const PROJECT_LIMIT = 40;
const SAVED_DESIGN_LIMIT = 80;
const MAX_SAVED_SOURCE_IMAGE_URL_LENGTH = 420000;
const MAX_GENERATION_REFERENCE_IMAGE_SIDE = 1280;
const MAX_STORED_REFERENCE_IMAGE_SIDE = 720;
const MAX_SOURCE_THUMBNAIL_SIDE = 360;
const MAX_PERSISTED_DATA_URL_LENGTH = 900000;
const SOURCE_THUMBNAIL_LIMIT = 16;
const CLOUD_STATE_SYNC_DELAY = 700;
const CLOUD_STATE_SYNC_RETRY_DELAY = 8000;
const STUDIO_AUTH_TIMEOUT_MS = 20000;
const AUTH_HANDOFF_STORAGE_KEY = "ff-auth-handoff-v1";
const SUPABASE_LOCAL_SCRIPT_URL = "./assets/vendor/supabase.js?v=2.105.3";
const SUPABASE_MODULE_URL = "https://esm.sh/@supabase/supabase-js@2.105.3";
const STUDIO_SYNC_TIMEOUT_MS = 15000;
const CREDIT_HISTORY_LIMIT = 20;
const GENERATION_POLL_INTERVAL_MS = 2400;
const GENERATION_POLL_TIMEOUT_MS = 10 * 60 * 1000;
const PENDING_GENERATION_MAX_AGE_MS = 30 * 60 * 1000;
const PENDING_SUBMITTING_MAX_AGE_MS = 2 * 60 * 1000;
const MOCKUP_RESOLUTION_OPTIONS = {
  "1k": { label: "1K", value: "1k" },
  "2k": { label: "2K", value: "2k" },
  "4k": { label: "4K", value: "4k" },
};
const STUDIO_CREDIT_COSTS = {
  sketch: {
    "1k": { 1: 1, 4: 3 },
  },
  finish: { 1: 0, 4: 0 },
  mockup: {
    "1k": { 1: 5, 4: 15 },
    "2k": { 1: 8, 4: 24 },
    "4k": { 1: 13, 4: 39 },
  },
  manken: {
    "1k": { 1: 6, 4: 18 },
    "2k": { 1: 10, 4: 30 },
    "4k": { 1: 16, 4: 48 },
  },
};
const ADMIN_SPENDING_STAGE_LABELS = {
  direct: "Direkt",
  finish: "Ürün",
  mockup: "Mockup",
  manken: "Manken",
  other: "Diğer",
  sketch: "Konsept",
  studio: "Atelify",
};
const CHIP_DATA_KEY_BY_GROUP = {
  background: "background",
  channel: "channel",
  count: "draftCount",
  "design-mode": "designMode",
  "finish-count": "finishCount",
  "mockup-count": "mockupCount",
  "mockup-resolution": "mockupResolution",
  metal: "metal",
  "product-shape": "productShape",
  "product-type": "productType",
  ratio: "ratio",
  "ring-mold": "ringMold",
  "ring-shape": "ringShape",
  scene: "scene",
  "side-print": "sidePrint",
  stone: "stone",
  surface: "surface",
  "visual-style": "visualStyle",
};
const DEFAULT_CHIP_SELECTIONS = {
  background: { label: "Dekupe", value: "dekupe" },
  channel: { label: "Etsy", value: "etsy" },
  "design-mode": { label: "Yüzeysel kazıma", value: "engrave" },
  "finish-count": { label: "1 ürün", value: "1" },
  metal: { label: "Gümüş", value: "gumus" },
  "mockup-count": { label: "1 mockup", value: "1" },
  "mockup-resolution": { label: "1K", value: "1k" },
  "product-shape": { label: "Yuvarlak", value: "yuvarlak" },
  "product-type": { label: "Yüzük", value: "yuzuk" },
  ratio: { label: "1:1", value: "square" },
  "ring-mold": { label: "Fotoğraf Yuvarlak - XL", value: FIXED_FINISH_RING_MOLD },
  "ring-shape": { label: "Yuvarlak", value: FIXED_FINISH_RING_SHAPE },
  scene: { label: "Mockup", value: "mockup" },
  "side-print": { label: "Hayır", value: "hayir" },
  stone: { label: "Düz kazıma", value: "yok" },
  surface: { label: "Parlak", value: "parlak" },
  "visual-style": { label: "Minimal", value: "minimal" },
};
let directFinishForm = null;
let directFinishFormFile = null;
let directMockupFinish = null;
let directMockupFinishFile = null;
let ringTemplateManifestPromise = null;
let ringMoldReferenceDataUrlPromise = null;
let referencePreviewObjectUrl = "";
let referencePersistenceToken = 0;
const studioObjectUrls = new Set();
let activeProjectId = "";
let projectDialogMode = "";
let projectDialogProjectId = "";
let projectSelectionMode = false;
const selectedProjectIds = new Set();
let projectDialogPreviousFocus = null;
let studioSupabase = null;
let studioPublicConfig = null;
let currentUserId = "";
let currentUserCreatedAtMs = 0;
let studioStorageScope = "";
let currentAccountRole = "user";
let currentAccountIsOwner = false;
let sessionExpiryHandled = false;
let activeCreditWallet = null;
let creditWalletSource = "local";
let adminSpendingCache = null;
let isCreditWalletHydrating = false;
// Server abonelik özeti (getSubscriptionSummary). renderCreditWallet → renderTopupSection
// modül üst seviyesinde de çağrıldığı için TDZ'den kaçınmak adına burada erken tanımlanır.
let subscriptionSummary = null;
let cloudStateSyncEnabled = false;
let cloudStateHydrated = false;
let cloudStateSyncTimer = 0;
let cloudStateSyncRetryTimer = 0;
let cloudStateSyncInFlight = false;
let cloudStateSyncQueued = false;
let projectSaveTimer = 0;
let isRestoringProject = false;
let isApplyingCloudState = false;
let isSketchGenerating = false;
let isFinishGenerating = false;
let stage2EnteredDirectly = false;
const activeGenerationPolls = new Set();
const PACKAGE_PLANS = {
  free: {
    creditAmount: 10,
    name: "Ücretsiz paketi",
    credit: "10",
    price: 0,
    billing: "once",
    scope: "Tek seferlik deneme",
    support: "Standart",
    summary: "Tek seferlik 10 ücretsiz krediyle ilk tasarımını Atelify'da deneyebilirsin.",
  },
  go: {
    creditAmount: 15,
    name: "Go paketi",
    credit: "15",
    price: 375,
    billing: "monthly",
    scope: "Bir ürün döngüsü",
    support: "Standart",
    summary: "375₺/ay · her ay yenilenen 15 krediyle bir ürünü baştan sona çıkarabilirsin.",
  },
  pro: {
    creditAmount: 45,
    name: "Pro paketi",
    credit: "45",
    price: 1000,
    billing: "monthly",
    scope: "Koleksiyon",
    support: "Öncelikli",
    summary: "1.000₺/ay · her ay yenilenen 45 krediyle düzenli koleksiyon ve üretim akışı.",
  },
  max: {
    creditAmount: 250,
    name: "Max paketi",
    credit: "250",
    price: 5000,
    billing: "monthly",
    scope: "Marka ve ekip",
    support: "Özel hesap",
    summary: "5.000₺/ay · her ay yenilenen 250 krediyle marka ve ekip ölçeğinde üretim.",
  },
};

// TOP-UP (ek kredi) vitrin verisi. Ödeme tutarı SERVER'dan (src/config/topup-packs.js)
// alınır; burası yalnızca gösterim (ikisi senkron tutulmalı). renderTopupSection modül
// üst seviyesindeki renderCreditWallet'tan da çağrıldığı için PACKAGE_PLANS gibi erken tanımlı.
const TOPUP_LIST_PRICE_TRY = 38; // üstü çizili "liste" ₺/kredi (optik)
const TOPUP_PACKS_DISPLAY = [
  { key: "10", credits: 10, priceTry: 300 },
  { key: "25", credits: 25, priceTry: 725 },
  { key: "50", credits: 50, priceTry: 1400 },
  { key: "100", credits: 100, priceTry: 2650 },
  { key: "250", credits: 250, priceTry: 6250 },
];
