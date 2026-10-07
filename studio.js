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

function readProjects() {
  return studioStore.readProjects();
}

function writeProjects(projects) {
  return studioStore.writeProjects(compactPersistedProjects(projects));
}

function createEmptyProjectState() {
  return studioStore.createEmptyProjectState();
}

function openNewProjectDialog() {
  openProjectDialog("create", { id: "", title: "" });
}

function allowedProjectShapeValues(productValue) {
  const productKey = normalizeDesignOptionKey(DESIGN_PRODUCT_OPTIONS, productValue, "");
  return PROJECT_SHAPES_BY_PRODUCT[productKey] || [];
}

function normalizeProjectDetails(productDetails = {}) {
  const productValue = normalizeDesignOptionKey(DESIGN_PRODUCT_OPTIONS, productDetails.productValue, "");
  const shapeValue = normalizeDesignOptionKey(DESIGN_SHAPE_OPTIONS, productDetails.shapeValue, "");
  const metalValue = normalizeProjectMetalValue(productDetails.metalValue);
  if (!productValue || !shapeValue || !metalValue || !allowedProjectShapeValues(productValue).includes(shapeValue)) {
    return null;
  }
  return { productValue, shapeValue, metalValue };
}

function projectDetailChips(productDetails = {}) {
  const normalizedDetails = normalizeProjectDetails(productDetails);
  if (!normalizedDetails) return {};

  const product = DESIGN_PRODUCT_OPTIONS[normalizedDetails.productValue];
  const shape = DESIGN_SHAPE_OPTIONS[normalizedDetails.shapeValue];
  const metal = PROJECT_METAL_OPTIONS[normalizedDetails.metalValue];
  return {
    "product-shape": { label: shape.label, value: normalizedDetails.shapeValue },
    "product-type": { label: product.label, value: normalizedDetails.productValue },
    metal: { label: metal.label, value: normalizedDetails.metalValue },
  };
}

function createNewProject(projectTitle, projectDetails = {}) {
  const projects = readProjects();
  const now = new Date().toISOString();
  const title = String(projectTitle || "").trim();
  const normalizedDetails = normalizeProjectDetails(projectDetails);
  if (!title) {
    setProjectDialogError("Proje adı boş olamaz.");
    projectNameInput?.focus();
    return;
  }
  if (!normalizedDetails) {
    setProjectDialogError("Ürün ve ürün şeklini seç.");
    focusFirstMissingProjectDetail();
    return;
  }

  const initialState = createEmptyProjectState();
  initialState.chips = {
    ...(initialState.chips || {}),
    ...projectDetailChips(normalizedDetails),
  };

  const project = {
    ...currentStudioOwnerFields(),
    createdAt: now,
    id: `ff-project-${Date.now()}`,
    stage: "sketch",
    state: initialState,
    title,
    updatedAt: now,
  };

  if (!writeProjects([project, ...projects])) {
    setProjectDialogError("Proje oluşturulamadı. Tarayıcı depolama alanını kontrol et.");
    return;
  }

  closeProjectDialog();
  openProject(project.id);
}

function openProject(projectId, options = {}) {
  const project = readProjects().find((item) => item.id === projectId);
  if (!project) return;

  if (projectSelectionMode) exitProjectSelectionMode();
  flushProjectSave();

  activeProjectId = project.id;
  studioStore.writeActiveProjectId(project.id);

  switchTab("projeler", {
    skipProjectSave: true,
    scroll: options.scroll,
    showProjectLibrary: false,
    updateHash: options.updateHash,
  });
  showProjectWorkspace();
  renderProjects();
  restoreProjectState(project);
  syncVisiblePendingGenerations({ resume: true });
  updateActiveProjectHeader(project);
}

function renameProject(projectId) {
  const projects = readProjects();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  openProjectDialog("rename", project);
}

function deleteProject(projectId) {
  const projects = readProjects();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  openProjectDialog("delete", project);
}

// --- Toplu proje seçimi / silme ---

function updateSelectProjectsToggleVisibility() {
  if (!selectProjectsToggle) return;
  const hasProjects = readProjects().length > 0;
  selectProjectsToggle.hidden = projectSelectionMode || !hasProjects;
}

function toggleProjectSelection(projectId) {
  const id = String(projectId || "").trim();
  if (!id) return false;
  if (selectedProjectIds.has(id)) {
    selectedProjectIds.delete(id);
  } else {
    selectedProjectIds.add(id);
  }
  updateProjectSelectionToolbar();
  return selectedProjectIds.has(id);
}

function updateProjectSelectionToolbar() {
  const count = selectedProjectIds.size;
  const total = readProjects().length;
  if (projectSelectCount) projectSelectCount.textContent = `${count} proje seçildi`;
  if (projectSelectDeleteButton) {
    projectSelectDeleteButton.disabled = count === 0;
    projectSelectDeleteButton.textContent = count > 0 ? `Seçilenleri sil (${count})` : "Seçilenleri sil";
  }
  if (projectSelectAllButton) {
    projectSelectAllButton.textContent = total > 0 && count >= total ? "Seçimi temizle" : "Tümünü seç";
  }
}

function enterProjectSelectionMode() {
  if (projectSelectionMode || !readProjects().length) return;
  projectSelectionMode = true;
  selectedProjectIds.clear();
  if (projectSelectBar) projectSelectBar.hidden = false;
  if (selectProjectsToggle) selectProjectsToggle.hidden = true;
  projectsPage.setSelection({ active: true, selectedIds: selectedProjectIds, onToggleSelect: toggleProjectSelection });
  renderProjects();
  updateProjectSelectionToolbar();
}

function exitProjectSelectionMode() {
  if (!projectSelectionMode) {
    updateSelectProjectsToggleVisibility();
    return;
  }
  projectSelectionMode = false;
  selectedProjectIds.clear();
  if (projectSelectBar) projectSelectBar.hidden = true;
  projectsPage.setSelection({ active: false, selectedIds: selectedProjectIds, onToggleSelect: null });
  renderProjects();
  updateSelectProjectsToggleVisibility();
}

function toggleAllProjectSelection() {
  const projects = readProjects();
  const allSelected = projects.length > 0 && selectedProjectIds.size >= projects.length;
  selectedProjectIds.clear();
  if (!allSelected) projects.forEach((project) => selectedProjectIds.add(project.id));
  renderProjects();
  updateProjectSelectionToolbar();
}

function requestBulkProjectDelete() {
  if (!selectedProjectIds.size) return;
  openProjectDialog("bulk-delete", { id: "", title: "" });
}

function submitBulkProjectDelete() {
  const ids = new Set(selectedProjectIds);
  if (!ids.size) {
    closeProjectDialog();
    return;
  }

  const projects = readProjects();
  const deletedProjects = projects.filter((project) => ids.has(project.id));
  const nextProjects = projects.filter((project) => !ids.has(project.id));

  preserveDeletedProjectOrderDesigns(deletedProjects);

  if (!writeProjects(nextProjects)) {
    setProjectDialogError("Projeler silinemedi. Tarayıcı depolama alanını kontrol et.");
    return;
  }

  ids.forEach((id) => {
    recordProjectDeletion(id);
    studioStore.clearActiveProjectId(id);
  });
  const deletedActiveProject = activeProjectId && ids.has(activeProjectId);
  if (deletedActiveProject) activeProjectId = "";

  closeProjectDialog();
  exitProjectSelectionMode();
  if (deletedActiveProject) showProjectLibrary({ skipSave: true });
}

function selectedProjectDetailProductValue() {
  return Array.from(projectDetailProductButtons).find((button) => button.classList.contains("is-selected"))?.dataset.projectProduct || "";
}

function selectedProjectDetailShapeValue() {
  return Array.from(projectDetailShapeButtons)
    .find((button) => button.classList.contains("is-selected") && !button.hidden && !button.disabled)
    ?.dataset.projectShape || "";
}

function selectedProjectDetailMetalValue() {
  return Array.from(projectDetailMetalButtons)
    .find((button) => button.classList.contains("is-selected"))
    ?.dataset.projectMetal || "";
}

function setProjectDetailButtonSelection(buttons, selectedValue, datasetKey) {
  buttons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset[datasetKey] === selectedValue);
    button.setAttribute("aria-checked", String(button.dataset[datasetKey] === selectedValue));
  });
}

function clearProjectDetailShapeSelection() {
  setProjectDetailButtonSelection(projectDetailShapeButtons, "", "projectShape");
}

function clearProjectDetailMetalSelection() {
  setProjectDetailButtonSelection(projectDetailMetalButtons, "", "projectMetal");
}

function updateProjectDetailMetalOptions(productValue) {
  const hasProduct = allowedProjectShapeValues(productValue).length > 0;
  if (projectDetailMetalField) projectDetailMetalField.hidden = !hasProduct;
}

function updateProjectDetailShapeOptions(productValue) {
  const allowedShapes = allowedProjectShapeValues(productValue);
  const hasProduct = allowedShapes.length > 0;

  if (projectDetailShapeField) projectDetailShapeField.hidden = !hasProduct;
  projectDetailShapeButtons.forEach((button) => {
    const isAllowed = allowedShapes.includes(button.dataset.projectShape || "");
    button.hidden = !isAllowed;
    button.disabled = !isAllowed;
    if (!isAllowed) button.classList.remove("is-selected");
  });
}

function resetProjectDetailFields() {
  setProjectDetailButtonSelection(projectDetailProductButtons, "", "projectProduct");
  clearProjectDetailShapeSelection();
  clearProjectDetailMetalSelection();
  if (projectDetailShapeField) projectDetailShapeField.hidden = true;
  if (projectDetailMetalField) projectDetailMetalField.hidden = true;
  projectDetailShapeButtons.forEach((button) => {
    button.hidden = false;
    button.disabled = false;
  });
  updateProjectDialogCreateState();
}

function updateProjectDialogCreateState() {
  if (projectDialogMode !== "create") return;

  const productValue = selectedProjectDetailProductValue();
  const hasProjectName = Boolean((projectNameInput?.value || "").trim());

  updateProjectDetailShapeOptions(productValue);
  updateProjectDetailMetalOptions(productValue);
  const shapeValue = selectedProjectDetailShapeValue();
  const metalValue = selectedProjectDetailMetalValue();
  const hasValidDetails = Boolean(normalizeProjectDetails({ productValue, shapeValue, metalValue }));
  if (projectDialogConfirm) {
    projectDialogConfirm.hidden = !hasValidDetails;
    projectDialogConfirm.disabled = !hasValidDetails || !hasProjectName;
    projectDialogConfirm.classList.toggle("is-disabled", projectDialogConfirm.disabled);
  }
}

function focusFirstMissingProjectDetail() {
  if (!selectedProjectDetailProductValue()) {
    projectDetailProductButtons[0]?.focus();
    return;
  }
  if (!selectedProjectDetailShapeValue()) {
    Array.from(projectDetailShapeButtons).find((button) => !button.hidden && !button.disabled)?.focus();
    return;
  }
  if (!selectedProjectDetailMetalValue()) {
    Array.from(projectDetailMetalButtons).find((button) => !button.hidden && !button.disabled)?.focus();
  }
}

function openProjectDialog(mode, project) {
  if (!projectDialog || !projectDialogTitle || !projectDialogDescription || !projectDialogConfirm) {
    return;
  }

  projectDialogMode = mode;
  projectDialogProjectId = project.id;
  projectDialogPreviousFocus = document.activeElement;
  setProjectDialogError("");

  const projectTitle = project.title || "İsimsiz proje";
  if (mode === "create") {
    if (projectDialogEyebrow) projectDialogEyebrow.textContent = "Yeni proje";
    projectDialogTitle.textContent = "Yeni proje";
    projectDialogDescription.textContent = "Proje başlamadan önce ürün ve şekil bilgisini belirle.";
    if (projectNameField) projectNameField.hidden = false;
    if (projectDetailFields) projectDetailFields.hidden = false;
    if (projectNameInput) {
      projectNameInput.required = true;
      projectNameInput.value = "";
      projectNameInput.placeholder = "Örn. İlk yüzük koleksiyonu";
    }
    projectDialogConfirm.textContent = "Projeyi başlat";
    projectDialogConfirm.hidden = true;
    projectDialogConfirm.disabled = true;
    projectDialogConfirm.classList.remove("is-danger");
    projectDialogConfirm.classList.add("is-disabled");
    resetProjectDetailFields();
  } else if (mode === "delete") {
    if (projectDialogEyebrow) projectDialogEyebrow.textContent = "Proje";
    projectDialogTitle.textContent = "Projeyi sil";
    projectDialogDescription.textContent = `"${projectTitle}" projesi silinecek. Bu işlem geri alınamaz.`;
    if (projectNameField) projectNameField.hidden = true;
    if (projectDetailFields) projectDetailFields.hidden = true;
    if (projectNameInput) {
      projectNameInput.required = false;
      projectNameInput.value = "";
    }
    projectDialogConfirm.textContent = "Projeyi sil";
    projectDialogConfirm.hidden = false;
    projectDialogConfirm.disabled = false;
    projectDialogConfirm.classList.add("is-danger");
    projectDialogConfirm.classList.remove("is-disabled");
  } else if (mode === "bulk-delete") {
    const count = selectedProjectIds.size;
    if (projectDialogEyebrow) projectDialogEyebrow.textContent = "Projeler";
    projectDialogTitle.textContent = "Seçili projeleri sil";
    projectDialogDescription.textContent = `${count} proje silinecek. Bu işlem geri alınamaz.`;
    if (projectNameField) projectNameField.hidden = true;
    if (projectDetailFields) projectDetailFields.hidden = true;
    if (projectNameInput) {
      projectNameInput.required = false;
      projectNameInput.value = "";
    }
    projectDialogConfirm.textContent = "Seçilenleri sil";
    projectDialogConfirm.hidden = false;
    projectDialogConfirm.disabled = false;
    projectDialogConfirm.classList.add("is-danger");
    projectDialogConfirm.classList.remove("is-disabled");
  } else {
    if (projectDialogEyebrow) projectDialogEyebrow.textContent = "Proje";
    projectDialogTitle.textContent = "Projeyi yeniden adlandır";
    projectDialogDescription.textContent = "Proje listesinde görünecek adı güncelle.";
    if (projectNameField) projectNameField.hidden = false;
    if (projectDetailFields) projectDetailFields.hidden = true;
    if (projectNameInput) {
      projectNameInput.required = true;
      projectNameInput.value = projectTitle;
      projectNameInput.placeholder = "";
    }
    projectDialogConfirm.textContent = "Kaydet";
    projectDialogConfirm.hidden = false;
    projectDialogConfirm.disabled = false;
    projectDialogConfirm.classList.remove("is-danger");
    projectDialogConfirm.classList.remove("is-disabled");
  }

  projectDialog.hidden = false;
  document.body.classList.add("is-project-dialog-open");

  window.requestAnimationFrame(() => {
    if ((mode === "create" || mode === "rename") && projectNameInput) {
      projectNameInput.focus();
      if (mode === "rename") projectNameInput.select();
    } else {
      projectDialogConfirm.focus();
    }
  });
}

function closeProjectDialog() {
  if (!projectDialog) return;

  projectDialog.hidden = true;
  document.body.classList.remove("is-project-dialog-open");
  projectDialogMode = "";
  projectDialogProjectId = "";
  setProjectDialogError("");

  if (projectNameInput) {
    projectNameInput.value = "";
    projectNameInput.required = false;
    projectNameInput.placeholder = "";
  }
  if (projectDetailFields) projectDetailFields.hidden = true;
  if (projectDetailShapeField) projectDetailShapeField.hidden = true;
  if (projectDetailMetalField) projectDetailMetalField.hidden = true;
  setProjectDetailButtonSelection(projectDetailProductButtons, "", "projectProduct");
  clearProjectDetailShapeSelection();
  clearProjectDetailMetalSelection();
  if (projectDialogConfirm) {
    projectDialogConfirm.hidden = false;
    projectDialogConfirm.disabled = false;
    projectDialogConfirm.classList.remove("is-disabled");
  }

  if (projectDialogPreviousFocus instanceof HTMLElement) {
    projectDialogPreviousFocus.focus();
  }
  projectDialogPreviousFocus = null;
}

function setProjectDialogError(message) {
  if (!projectDialogError) return;

  projectDialogError.textContent = message;
  projectDialogError.hidden = !message;
}

function submitProjectRename() {
  const projects = readProjects();
  const projectIndex = projects.findIndex((project) => project.id === projectDialogProjectId);
  if (projectIndex === -1) {
    closeProjectDialog();
    return;
  }

  const currentTitle = projects[projectIndex].title || "İsimsiz proje";
  const trimmedTitle = (projectNameInput?.value || "").trim();
  if (!trimmedTitle) {
    setProjectDialogError("Proje adı boş olamaz.");
    projectNameInput?.focus();
    return;
  }

  if (trimmedTitle === currentTitle) {
    closeProjectDialog();
    return;
  }

  const now = new Date().toISOString();
  projects[projectIndex] = {
    ...projects[projectIndex],
    title: trimmedTitle,
    updatedAt: now,
  };

  if (!writeProjects(projects)) {
    setProjectDialogError("Proje yeniden adlandırılamadı. Tarayıcı depolama alanını kontrol et.");
    return;
  }

  renderProjects(projects);
  if (activeProjectId === projectDialogProjectId) {
    updateActiveProjectHeader(projects[projectIndex]);
  }
  closeProjectDialog();
}

function submitProjectCreate() {
  const trimmedTitle = (projectNameInput?.value || "").trim();
  const productValue = selectedProjectDetailProductValue();
  const shapeValue = selectedProjectDetailShapeValue();
  const metalValue = selectedProjectDetailMetalValue();
  if (!trimmedTitle) {
    setProjectDialogError("Proje adı boş olamaz.");
    projectNameInput?.focus();
    return;
  }
  if (!normalizeProjectDetails({ productValue, shapeValue, metalValue })) {
    setProjectDialogError("Ürün, şekil ve metal rengini seç.");
    focusFirstMissingProjectDetail();
    return;
  }

  createNewProject(trimmedTitle, { productValue, shapeValue, metalValue });
}

function submitProjectDelete() {
  const projectId = projectDialogProjectId;
  if (!projectId) {
    closeProjectDialog();
    return;
  }

  const projects = readProjects();
  if (!projects.some((item) => item.id === projectId)) {
    closeProjectDialog();
    return;
  }

  const deletedProject = projects.find((item) => item.id === projectId);
  const nextProjects = projects.filter((item) => item.id !== projectId);

  preserveDeletedProjectOrderDesigns(deletedProject);

  if (!writeProjects(nextProjects)) {
    setProjectDialogError("Proje silinemedi. Tarayıcı depolama alanını kontrol et.");
    return;
  }
  recordProjectDeletion(projectId);

  closeProjectDialog();
  if (activeProjectId === projectId) {
    activeProjectId = "";
    showProjectLibrary({ skipSave: true });
  } else {
    renderProjects(nextProjects);
  }

  studioStore.clearActiveProjectId(projectId);
}

function handleProjectDialogSubmit(event) {
  event.preventDefault();
  if (projectDialogMode === "create") {
    submitProjectCreate();
    return;
  }

  if (projectDialogMode === "delete") {
    submitProjectDelete();
    return;
  }

  if (projectDialogMode === "bulk-delete") {
    submitBulkProjectDelete();
    return;
  }

  submitProjectRename();
}

function readStoredActiveProjectId() {
  return studioStore.readActiveProjectId();
}

function showProjectLibrary(options = {}) {
  if (!projectLibrary || !projectWorkspace) return;

  if (!options.skipSave) {
    saveCurrentProjectState();
  }

  activeProjectId = "";
  studioStore.clearActiveProjectId();

  projectsPage.setActiveProjectId("");
  projectsPage.showLibrary();
  renderProjects();
  scheduleManagedImageVisibilityRefresh();
}

function showProjectWorkspace() {
  projectsPage.showWorkspace();
  scheduleManagedImageVisibilityRefresh();
}

function updateActiveProjectHeader(project) {
  projectsPage.updateActiveHeader(project);
}

function renderProjects(projects = readProjects()) {
  const displayProjects = withProjectGenerationActivity(projects);
  projectsPage.setActiveProjectId(activeProjectId);
  projectsPage.render(displayProjects);
  updateSelectProjectsToggleVisibility();
}

function updateProjectStats(projects = readProjects()) {
  projectsPage.updateStats(withProjectGenerationActivity(projects));
}

function formatProjectDate(value) {
  return StudioProjects.formatProjectDate(value);
}

function withProjectGenerationActivity(projects = []) {
  const generationActivityByProject = projectGenerationActivityFromSavedDesigns();
  return (Array.isArray(projects) ? projects : []).map((project) => {
    const projectId = String(project?.id || "").trim();
    const savedDesignGeneratedAt = generationActivityByProject.get(projectId) || "";
    const lastGeneratedAt = latestIsoDate(project?.lastGeneratedAt || project?.generatedAt, savedDesignGeneratedAt);
    return lastGeneratedAt ? { ...project, lastGeneratedAt } : project;
  });
}

function projectGenerationActivityFromSavedDesigns(designs = readSavedDesigns()) {
  return (Array.isArray(designs) ? designs : []).reduce((activity, design) => {
    const projectId = String(design?.projectId || "").trim();
    if (!projectId || !design?.imageUrl || design?.isLoading === true || design?.status === "loading") return activity;
    const generatedAt = savedDesignGenerationDate(design);
    if (!generatedAt) return activity;
    activity.set(projectId, latestIsoDate(activity.get(projectId), generatedAt));
    return activity;
  }, new Map());
}

function savedDesignGenerationDate(design = {}) {
  const candidates = [design.generatedAt, design.createdAt, design.savedAt, design.updatedAt];
  return candidates.find(validIsoDate) || "";
}

function latestIsoDate(left, right) {
  const leftDate = validIsoDate(left);
  const rightDate = validIsoDate(right);
  if (!leftDate) return rightDate;
  if (!rightDate) return leftDate;
  return new Date(rightDate).getTime() > new Date(leftDate).getTime() ? rightDate : leftDate;
}

function saveCurrentProjectState() {
  if (isRestoringProject || !activeProjectId) return false;

  const projects = readProjects();
  const projectIndex = projects.findIndex((project) => project.id === activeProjectId);
  if (projectIndex === -1) return false;

  const now = new Date().toISOString();
  const state = collectProjectState(projects[projectIndex].state);
  projects[projectIndex] = {
    ...projects[projectIndex],
    stage: state.stage,
    state,
    updatedAt: now,
  };

  const saved = writeProjects(projects);
  if (saved) {
    updateActiveProjectHeader(projects[projectIndex]);
    renderProjects(projects);
  }
  return saved;
}

function flushProjectSave() {
  window.clearTimeout(projectSaveTimer);
  return saveCurrentProjectState();
}

function queueActiveProjectSave() {
  if (isRestoringProject || !activeProjectId) return false;
  window.clearTimeout(projectSaveTimer);
  return saveCurrentProjectState();
}

function projectTitleById(projectId) {
  return readProjects().find((project) => project.id === projectId)?.title || "";
}

function ensureProjectRecord(projectId, options = {}) {
  const safeProjectId = String(projectId || "").trim();
  if (!safeProjectId) return false;

  const projects = readProjects();
  if (projects.some((project) => project.id === safeProjectId)) return true;

  const now = new Date().toISOString();
  const project = {
    createdAt: validIsoDate(options.createdAt) || now,
    id: safeProjectId,
    stage: "sketch",
    state: createEmptyProjectState(),
    title: String(options.title || "Kurtarılan proje").trim(),
    updatedAt: now,
  };

  return writeProjects([...projects, project]);
}

function patchProjectState(projectId, updater, options = {}) {
  const safeProjectId = String(projectId || "").trim();
  if (!safeProjectId || typeof updater !== "function") return false;

  ensureProjectRecord(safeProjectId, options);
  const projects = readProjects();
  const projectIndex = projects.findIndex((project) => project.id === safeProjectId);
  if (projectIndex === -1) return false;

  const previousProject = projects[projectIndex];
  const previousState = previousProject.state && typeof previousProject.state === "object"
    ? previousProject.state
    : createEmptyProjectState();
  const nextState = updater(previousState, previousProject) || previousState;
  const now = new Date().toISOString();
  projects[projectIndex] = {
    ...previousProject,
    stage: nextState.stage || previousProject.stage || "sketch",
    state: nextState,
    updatedAt: now,
  };

  const saved = writeProjects(projects);
  if (saved) {
    renderProjects(projects);
    if (activeProjectId === safeProjectId) updateActiveProjectHeader(projects[projectIndex]);
  }
  return saved;
}

function generationProjectId(job = {}) {
  return String(job.projectId || job.metadata?.projectId || "").trim();
}

function generationProjectTitle(job = {}) {
  return String(job.projectTitle || job.metadata?.projectTitle || "").trim();
}

function generationJobContext(job = {}) {
  return {
    creditCost: normalizeCreditNumber(job.creditCost),
    label: String(job.label || "").trim(),
    metadata: sanitizeGenerationMetadataForServer(compactPersistedValue(job.metadata || {})),
    projectId: generationProjectId(job),
    projectTitle: generationProjectTitle(job),
  };
}

function sanitizeGenerationMetadataForServer(value) {
  try {
    return JSON.parse(JSON.stringify(value || {}, (_key, nestedValue) => {
      if (typeof nestedValue !== "string") return nestedValue;
      if (!nestedValue.startsWith("data:image/")) return nestedValue;
      return nestedValue.length <= MAX_SAVED_SOURCE_IMAGE_URL_LENGTH ? nestedValue : "";
    }));
  } catch {
    return {};
  }
}

function maxProjectStage(currentStage, nextStage) {
  const order = { sketch: 1, form: 2, finish: 2, mockup: 3, manken: 4 };
  return (order[nextStage] || 1) >= (order[currentStage] || 1) ? nextStage : currentStage || nextStage;
}

function currentDesignStage() {
  if (newDesignStudio?.classList.contains("is-manken-stage")) return "manken";
  if (newDesignStudio?.classList.contains("is-mockup-stage")) return "mockup";
  if (newDesignStudio?.classList.contains("is-finish-stage")) return "finish";
  return "sketch";
}

// Proje kimliği: ürün tipi, şekli ve metal. Bu üç chip grubu proje oluşturulurken
// belirlenir, studio'da gizli tutulur ve sonradan değişmez.
const PROJECT_IDENTITY_CHIP_GROUPS = ["product-type", "product-shape", "metal"];

// Otomatik kayıt, DOM'dan yeniden okunan chip değerleriyle proje kimliğini ASLA
// ezmemeli. Yeni bir site sürümünde geri yükleme (restoreSelectedChips) gizli
// chip'i eşleştiremezse default'a düşebilir; o yanlış değer kaydedilirse yuvarlak
// yüzük oval görünür. Kimlik chip'lerini her zaman kayıtlı state'ten taşıyoruz —
// proje boş olsa bile detaylar sayfa yenilenince değişmez.
function preserveProjectIdentityChips(collectedChips, previousChips) {
  const result = { ...(collectedChips || {}) };
  const previous = previousChips || {};
  PROJECT_IDENTITY_CHIP_GROUPS.forEach((group) => {
    const stored = previous[group];
    if (stored && typeof stored === "object" && stored.value) {
      result[group] = stored;
    }
  });
  return result;
}

// Üretilen içeriği koru: geri yükleme (yeni sürüm / sayfa yenileme) sonuçları DOM'a
// tam basamazsa, otomatik kayıt boş DOM'u toplayıp kayıtlı sonuçları kalıcı silmemeli.
// DOM'da görselli içerik yoksa ama önceki kayıtta varsa, önceki kayıtlı liste korunur —
// "üretilmişler üretildiği yerde dursun".
function preserveProducedList(collected, previous) {
  const collectedItems = Array.isArray(collected) ? collected : [];
  if (collectedItems.some(hasRestorableStageImage)) return collected;
  const previousItems = Array.isArray(previous) ? previous : [];
  return previousItems.some(hasRestorableStageImage) ? previous : collected;
}

function preserveProducedObject(collected, previous) {
  if (collected && hasRestorableStageImage(collected)) return collected;
  return previous && hasRestorableStageImage(previous) ? previous : collected;
}

function collectProjectState(previousState = createEmptyProjectState()) {
  const previous = previousState && typeof previousState === "object" ? previousState : createEmptyProjectState();

  const collected = {
    directForm: collectDirectFormState(),
    directMockup: collectDirectMockupState(),
    finishResults: collectFinishResultState(),
    mockupResults: collectMockupResultState(),
    sketches: collectSketchState(),
  };

  const preserved = {
    directForm: preserveProducedObject(collected.directForm, previous.directForm),
    directMockup: preserveProducedObject(collected.directMockup, previous.directMockup),
    finishResults: preserveProducedList(collected.finishResults, previous.finishResults),
    mockupResults: preserveProducedList(collected.mockupResults, previous.mockupResults),
    sketches: preserveProducedList(collected.sketches, previous.sketches),
  };

  // Herhangi bir üretilen alan DOM'dan toplanamayıp kayıttan korunduysa, geri yükleme
  // eksik kalmış demektir; aşamayı da eski state'ten koru ki sonuçlar bulundukları
  // aşamada görünmeye devam etsin.
  const producedContentDropped =
    preserved.directForm !== collected.directForm ||
    preserved.directMockup !== collected.directMockup ||
    preserved.finishResults !== collected.finishResults ||
    preserved.mockupResults !== collected.mockupResults ||
    preserved.sketches !== collected.sketches;

  return {
    ...previous,
    ...preserved,
    chips: preserveProjectIdentityChips(collectSelectedChips(), previous.chips),
    reference: collectReferenceState(previous.reference),
    stage: producedContentDropped ? previous.stage || currentDesignStage() : currentDesignStage(),
    stage1Locked: false,
    stage2EnteredDirectly: false,
  };
}

function collectDirectFormState() {
  if (!directFinishForm) return null;
  const formImageUrl = safePersistedImageUrl(directFinishForm.formImageUrl || "", "formImageUrl");
  const sourceFormUrl = safePersistedImageUrl(directFinishForm.sourceFormUrl || "", "sourceFormUrl");
  const sketchUrl = safePersistedImageUrl(directFinishForm.sketchUrl || formImageUrl || "", "sketchUrl");
  if (!formImageUrl && !sourceFormUrl && !sketchUrl) return null;
  return {
    ...designProfileFieldsFromSource(directFinishForm),
    ...sketchMetadataFieldsFromSource(directFinishForm),
    formImageUrl,
    moldTitle: directFinishForm.moldTitle || "Yüklenen tasarım",
    renderMode: directFinishForm.renderMode || "generated",
    sketchUrl,
    sourceFormUrl,
    subtitle: directFinishForm.subtitle || "",
    title: directFinishForm.title || "Yüklenen tasarım",
  };
}

function collectDirectMockupState() {
  if (!directMockupFinish) return null;
  const finishImageUrl = safePersistedImageUrl(directMockupFinish.finishImageUrl || "", "finishImageUrl");
  const sourceFormUrl = safePersistedImageUrl(directMockupFinish.sourceFormUrl || "", "sourceFormUrl");
  const sketchUrl = safePersistedImageUrl(directMockupFinish.sketchUrl || finishImageUrl || "", "sketchUrl");
  if (!finishImageUrl && !sourceFormUrl && !sketchUrl) return null;
  return {
    ...designProfileFieldsFromSource(directMockupFinish),
    backgroundLabel: directMockupFinish.backgroundLabel || "Yüklenen",
    backgroundValue: directMockupFinish.backgroundValue || "temiz",
    finishImageUrl,
    metalLabel: directMockupFinish.metalLabel || "Yüklenen render",
    metalValue: directMockupFinish.metalValue || "altin",
    moldTitle: directMockupFinish.moldTitle || "Yüklenen ürün",
    renderMode: directMockupFinish.renderMode || "generated",
    sketchUrl,
    sourceFormUrl,
    stoneLabel: directMockupFinish.stoneLabel || "Yok",
    stoneValue: directMockupFinish.stoneValue || "yok",
    surfaceLabel: directMockupFinish.surfaceLabel || "Hazır render",
    surfaceValue: directMockupFinish.surfaceValue || "parlak",
    subtitle: directMockupFinish.subtitle || "",
    title: directMockupFinish.title || "Yüklenen ürün",
  };
}

function collectSelectedChips() {
  const chips = {};
  document.querySelectorAll("[data-chip-group]").forEach((group) => {
    const selected = group.querySelector(".option-chip.is-selected");
    if (!selected) return;
    const groupName = group.dataset.chipGroup;
    const dataKey = CHIP_DATA_KEY_BY_GROUP[groupName] || "";
    chips[groupName] = {
      label: selected.textContent.trim(),
      value: dataKey ? selected.dataset[dataKey] || "" : "",
    };
  });
  return chips;
}

function collectReferenceState(previousReference = {}) {
  const preview = document.querySelector("[data-reference-preview]");
  const hint = document.querySelector("[data-upload-hint]");
  const defaultLabel = uploadLabel?.dataset.defaultText || "Tasarım görseli yükle";
  const visibleLabel = uploadLabel?.textContent || "";
  const fileName = uploadInput?.files?.[0]?.name || (visibleLabel !== defaultLabel ? visibleLabel : "") || previousReference.fileName || "";
  const visiblePreviewUrl = preview?.hidden ? "" : preview?.getAttribute("src") || "";
  const restorableVisiblePreviewUrl = visiblePreviewUrl.startsWith("blob:") ? "" : visiblePreviewUrl;
  const thumbnailUrl =
    safePersistedImageUrl(
      preview?.dataset.referenceThumbnailUrl ||
      previousReference.thumbnailUrl ||
      readSourceThumbnail(fileName),
      "thumbnailUrl"
    );
  const imageDataUrl =
    safePersistedImageUrl(
      preview?.dataset.referenceDataUrl ||
      previousReference.imageDataUrl ||
      (restorableVisiblePreviewUrl.startsWith("data:image/") ? restorableVisiblePreviewUrl : ""),
      "imageDataUrl"
    );
  const previousPreviewUrl = String(previousReference.previewUrl || "");
  const previewUrl = imageDataUrl || thumbnailUrl || safePersistedImageUrl(restorableVisiblePreviewUrl || (previousPreviewUrl.startsWith("blob:") ? "" : previousPreviewUrl), "previewUrl");
  return {
    fileName,
    hint: hint?.textContent || previousReference.hint || "",
    imageDataUrl,
    previewUrl,
    thumbnailUrl,
  };
}

function collectSketchState() {
  const sketches = Array.from(document.querySelectorAll("[data-sketch-card]")).map((card, index) => ({
    ...readDesignProfileDataset(card),
    ...readSketchMetadataDataset(card),
    ...readStorageDataset(card),
    hidden: card.classList.contains("is-hidden"),
    index,
    label: card.dataset.imageLabel || card.querySelector(".sketch-body strong")?.textContent || `Tasarım ${index + 1}`,
    selected: card.classList.contains("is-selected"),
    subtitle: card.querySelector(".sketch-body span")?.textContent || "",
    stageSourceUrl: safePersistedImageUrl(card.dataset.stageSourceUrl || card.dataset.imageUrl || "", "stageSourceUrl"),
    url: safePersistedImageUrl(card.dataset.imageUrl || card.querySelector("[data-sketch-image]")?.getAttribute("src") || "", "url"),
  }));
  return sketches.some((sketch) => sketch.url || sketch.selected) ? sketches : [];
}

function designProfileFromResultCard(card) {
  if (!card) return selectedDesignProfile();
  return designProfileFromFields({
    designModeLabel: card.dataset.designModeLabel || "",
    designModeValue: card.dataset.designModeValue || "",
    moldAspect: card.dataset.moldAspect || "",
    moldKey: card.dataset.moldKey || "",
    moldMeasure: card.dataset.moldMeasure || "",
    moldShape: card.dataset.moldShape || "",
    moldSizeLabel: card.dataset.moldSizeLabel || "",
    moldTitle: card.dataset.moldTitle || "",
    productLabel: card.dataset.productLabel || "",
    productShapeLabel: card.dataset.productShapeLabel || card.dataset.shapeLabel || "",
    productShapeValue: card.dataset.productShapeValue || card.dataset.shapeValue || card.dataset.moldShape || "",
    productValue: card.dataset.productValue || "",
    shapeLabel: card.dataset.shapeLabel || card.dataset.productShapeLabel || "",
    shapeValue: card.dataset.shapeValue || card.dataset.productShapeValue || card.dataset.moldShape || "",
  });
}

function collectFinishResultState() {
  return Array.from(document.querySelectorAll("[data-finish-result-card]")).map((card, index) => {
    const profile = designProfileFromResultCard(card);
    return {
      ...readStorageDataset(card),
      backgroundLabel: card.dataset.backgroundLabel || "Dekupe",
      backgroundValue: card.dataset.backgroundValue || "dekupe",
      designModeLabel: card.dataset.designModeLabel || profile.designModeLabel,
      designModeValue: card.dataset.designModeValue || profile.designModeValue,
      finishImageUrl: safePersistedImageUrl(card.dataset.finishImageUrl || "", "finishImageUrl"),
      id: card.dataset.finishResultId || `finish-saved-${index}`,
      index: index + 1,
      metalLabel: card.dataset.metalLabel || "Altın",
      metalValue: card.dataset.metalValue || "altin",
      moldAspect: card.dataset.moldAspect || profile.moldAspect,
      moldHeightCm: card.dataset.moldHeightCm || "",
      moldKey: card.dataset.moldKey || "",
      moldMeasure: card.dataset.moldMeasure || "",
      moldShape: card.dataset.moldShape || card.dataset.shapeValue || profile.shapeValue,
      moldSizeLabel: card.dataset.moldSizeLabel || card.dataset.moldMeasure || "",
      moldTitle: card.dataset.moldTitle || profile.moldTitle || "Tasarım",
      moldWidthCm: card.dataset.moldWidthCm || "",
      productLabel: card.dataset.productLabel || profile.productLabel,
      productShapeLabel: card.dataset.productShapeLabel || card.dataset.shapeLabel || profile.productShapeLabel,
      productShapeValue: card.dataset.productShapeValue || card.dataset.shapeValue || profile.productShapeValue,
      productValue: card.dataset.productValue || profile.productValue,
      renderMode: card.dataset.renderMode || "composite",
      selected: card.classList.contains("is-selected"),
      shapeValue: card.dataset.shapeValue || card.dataset.productShapeValue || profile.shapeValue,
      sidePrint: card.dataset.sidePrint === "1",
      sidePrintLeft: card.dataset.sidePrintLeft || "",
      sidePrintRight: card.dataset.sidePrintRight || "",
      sketchUrl: safePersistedImageUrl(card.dataset.sketchUrl || "", "sketchUrl"),
      sourceFormUrl: safePersistedImageUrl(card.dataset.sourceFormUrl || "", "sourceFormUrl"),
      stoneLabel: card.dataset.stoneLabel || "Yok",
      stoneValue: card.dataset.stoneValue || "yok",
      subtitle: card.querySelector(".sketch-body span")?.textContent || "",
      surfaceLabel: card.dataset.surfaceLabel || "Parlak",
      surfaceValue: card.dataset.surfaceValue || "parlak",
      title: card.dataset.resultTitle || card.querySelector(".sketch-body strong")?.textContent || "Ürün renderı",
    };
  });
}

function collectMockupResultState() {
  return Array.from(document.querySelectorAll("[data-mockup-result-card]")).map((card, index) => ({
    ...readStorageDataset(card),
    channelLabel: card.dataset.channelLabel || "Etsy",
    channelValue: card.dataset.channelValue || "etsy",
    finishInfo: collectFinishInfoFromMockupCard(card),
    id: card.dataset.mockupResultId || `mockup-saved-${index}`,
    index: index + 1,
    mockupImageUrl: safePersistedImageUrl(card.dataset.mockupImageUrl || "", "mockupImageUrl"),
    ratioLabel: card.dataset.ratioLabel || "1:1",
    ratioValue: card.dataset.ratioValue || "square",
    resolutionLabel: card.dataset.resolutionLabel || "1K",
    resolutionValue: card.dataset.resolutionValue || "1k",
    sceneLabel: card.dataset.sceneLabel || "Mockup",
    sceneValue: card.dataset.sceneValue || "mockup",
    selected: card.classList.contains("is-selected"),
    subtitle: card.querySelector(".sketch-body span")?.textContent || "",
    title: card.dataset.resultTitle || card.querySelector(".sketch-body strong")?.textContent || "Mockup",
    visualStyleLabel: card.dataset.visualStyleLabel || "Minimal",
    visualStyleValue: card.dataset.visualStyleValue || "minimal",
  }));
}

function collectFinishInfoFromMockupCard(card) {
  const profile = designProfileFromResultCard(card);
  return {
    backgroundLabel: card.dataset.backgroundLabel || "Dekupe",
    backgroundValue: card.dataset.backgroundValue || "dekupe",
    designModeLabel: card.dataset.designModeLabel || profile.designModeLabel,
    designModeValue: card.dataset.designModeValue || profile.designModeValue,
    finishImageUrl: safePersistedImageUrl(card.dataset.finishImageUrl || "", "finishImageUrl"),
    metalLabel: card.dataset.metalLabel || "Altın",
    metalValue: card.dataset.metalValue || "altin",
    moldAspect: card.dataset.moldAspect || profile.moldAspect,
    moldHeightCm: card.dataset.moldHeightCm || "",
    moldKey: card.dataset.moldKey || "",
    moldMeasure: card.dataset.moldMeasure || "",
    moldShape: card.dataset.moldShape || card.dataset.shapeValue || profile.shapeValue,
    moldSizeLabel: card.dataset.moldSizeLabel || card.dataset.moldMeasure || "",
    moldTitle: card.dataset.moldTitle || profile.moldTitle || "Tasarım",
    moldWidthCm: card.dataset.moldWidthCm || "",
    productLabel: card.dataset.productLabel || profile.productLabel,
    productShapeLabel: card.dataset.productShapeLabel || card.dataset.shapeLabel || profile.productShapeLabel,
    productShapeValue: card.dataset.productShapeValue || card.dataset.shapeValue || profile.productShapeValue,
    productValue: card.dataset.productValue || profile.productValue,
    renderMode: card.dataset.renderMode || "composite",
    shapeValue: card.dataset.shapeValue || card.dataset.productShapeValue || profile.shapeValue,
    sidePrint: card.dataset.sidePrint === "1",
    sidePrintLeft: card.dataset.sidePrintLeft || "",
    sidePrintRight: card.dataset.sidePrintRight || "",
    sketchUrl: safePersistedImageUrl(card.dataset.sketchUrl || "", "sketchUrl"),
    sourceFormUrl: safePersistedImageUrl(card.dataset.sourceFormUrl || "", "sourceFormUrl"),
    stoneLabel: card.dataset.stoneLabel || "Yok",
    stoneValue: card.dataset.stoneValue || "yok",
    surfaceLabel: card.dataset.surfaceLabel || "Parlak",
    surfaceValue: card.dataset.surfaceValue || "parlak",
    title: card.dataset.finishTitle || "Ürün renderı",
  };
}

function selectedStateItem(items) {
  return (Array.isArray(items) ? items : []).find((item) => item?.selected) || null;
}

function mockupResultStage(result = {}) {
  return normalizeMockupScene(result.scene || { label: result.sceneLabel, value: result.sceneValue }).value;
}

function inferredVisualizationStageFromResults(results = []) {
  const resultList = Array.isArray(results) ? results : [];
  const selectedResult = selectedStateItem(resultList);
  if (selectedResult) return mockupResultStage(selectedResult);
  if (resultList.some((result) => mockupResultStage(result) === "manken" && hasRestorableStageImage(result))) return "manken";
  return resultList.some(hasRestorableStageImage) ? "mockup" : "";
}

function firstRestorableStateItem(items, predicate = () => true) {
  return (Array.isArray(items) ? items : []).find((item) => item && predicate(item)) || null;
}

function markOnlyStateItemSelected(items, selectedItem) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    selected: Boolean(selectedItem && item === selectedItem),
  }));
}

function finishInfoFromMockupState(result = {}) {
  const finishInfo = result.finishInfo && typeof result.finishInfo === "object" ? result.finishInfo : {};
  if (!Object.keys(finishInfo).length) return null;
  const finishImageUrl = safePersistedImageUrl(
    finishInfo.finishImageUrl || result.finishImageUrl || finishInfo.sketchUrl || "",
    "finishImageUrl"
  );
  const sketchUrl = safePersistedImageUrl(finishInfo.sketchUrl || finishImageUrl || "", "sketchUrl");
  const sourceFormUrl = safePersistedImageUrl(finishInfo.sourceFormUrl || "", "sourceFormUrl");
  if (!finishImageUrl && !sketchUrl && !sourceFormUrl) return null;
  return {
    ...finishInfo,
    ...storageFieldsFromSource(finishInfo),
    finishImageUrl,
    sketchUrl,
    sourceFormUrl,
  };
}

function finishStateFromFinishInfo(finishInfo = {}, index = 0) {
  const finishImageUrl = safePersistedImageUrl(finishInfo.finishImageUrl || finishInfo.sketchUrl || "", "finishImageUrl");
  const sketchUrl = safePersistedImageUrl(finishInfo.sketchUrl || finishImageUrl || "", "sketchUrl");
  const sourceFormUrl = safePersistedImageUrl(finishInfo.sourceFormUrl || "", "sourceFormUrl");
  const profile = designProfileFromFields(finishInfo);
  return {
    ...storageFieldsFromSource(finishInfo),
    backgroundLabel: finishInfo.backgroundLabel || "Dekupe",
    backgroundValue: finishInfo.backgroundValue || "dekupe",
    designModeLabel: finishInfo.designModeLabel || profile.designModeLabel,
    designModeValue: finishInfo.designModeValue || profile.designModeValue,
    finishImageUrl,
    id: finishInfo.id || `finish-restored-source-${index}`,
    index: index + 1,
    metalLabel: finishInfo.metalLabel || "Altın",
    metalValue: finishInfo.metalValue || "altin",
    moldAspect: finishInfo.moldAspect || profile.moldAspect,
    moldHeightCm: finishInfo.moldHeightCm || "",
    moldKey: finishInfo.moldKey || "",
    moldMeasure: finishInfo.moldMeasure || "",
    moldShape: finishInfo.moldShape || finishInfo.shapeValue || finishInfo.productShapeValue || profile.shapeValue,
    moldSizeLabel: finishInfo.moldSizeLabel || finishInfo.moldMeasure || "",
    moldTitle: finishInfo.moldTitle || finishInfo.title || "Ürün renderı",
    moldWidthCm: finishInfo.moldWidthCm || "",
    productLabel: finishInfo.productLabel || profile.productLabel,
    productShapeLabel: finishInfo.productShapeLabel || finishInfo.shapeLabel || profile.productShapeLabel,
    productShapeValue: finishInfo.productShapeValue || finishInfo.shapeValue || profile.productShapeValue,
    productValue: finishInfo.productValue || profile.productValue,
    renderMode: finishInfo.renderMode || (finishImageUrl ? "generated" : "composite"),
    selected: true,
    shapeValue: finishInfo.shapeValue || finishInfo.productShapeValue || profile.shapeValue,
    sidePrint: finishInfo.sidePrint === true || finishInfo.sidePrint === "1",
    sidePrintLeft: finishInfo.sidePrintLeft || "",
    sidePrintRight: finishInfo.sidePrintRight || "",
    sketchUrl,
    sourceFormUrl,
    stoneLabel: finishInfo.stoneLabel || "Yok",
    stoneValue: finishInfo.stoneValue || "yok",
    subtitle: finishInfo.subtitle || "",
    surfaceLabel: finishInfo.surfaceLabel || "Parlak",
    surfaceValue: finishInfo.surfaceValue || "parlak",
    title: finishInfo.title || "Ürün renderı",
  };
}

function finishStateMatchesFinishInfo(result = {}, finishInfo = {}) {
  const resultUrls = [
    result.finishImageUrl,
    result.sketchUrl,
    result.sourceFormUrl,
  ].filter(Boolean);
  const finishInfoUrls = [
    finishInfo.finishImageUrl,
    finishInfo.sketchUrl,
    finishInfo.sourceFormUrl,
  ].filter(Boolean);
  if (resultUrls.some((url) => finishInfoUrls.includes(url))) return true;
  return Boolean(result.title && finishInfo.title && result.title === finishInfo.title);
}

function hasRestorableStageImage(item = {}) {
  return [item.url, item.formImageUrl, item.finishImageUrl, item.sketchUrl, item.sourceFormUrl, item.mockupImageUrl]
    .some((url) => safePersistedImageUrl(url || "", "imageUrl"));
}

function prepareProjectStateForRestore(rawState = {}) {
  const state = {
    ...createEmptyProjectState(),
    ...(rawState && typeof rawState === "object" ? rawState : {}),
  };
  const visualizationStage = inferredVisualizationStageFromResults(state.mockupResults);
  const stage =
    normalizeRestoredProjectStage(state.stage) ||
    visualizationStage ||
    (Array.isArray(state.finishResults) && state.finishResults.length ? "finish" : "") ||
    "sketch";

  let sketches = Array.isArray(state.sketches) ? state.sketches.map((item) => ({ ...item })) : [];
  let finishResults = Array.isArray(state.finishResults) ? state.finishResults.map((item) => ({ ...item })) : [];
  const mockupResults = Array.isArray(state.mockupResults) ? state.mockupResults.map((item) => ({ ...item })) : [];
  const directForm = hasRestorableStageImage(state.directForm || {}) ? state.directForm : null;
  const directMockup = hasRestorableStageImage(state.directMockup || {}) ? state.directMockup : null;

  const needsSketchSource = stage === "finish" || isVisualizationStage(stage);
  if (needsSketchSource && !directForm && !selectedStateItem(sketches)) {
    const fallbackSketch = firstRestorableStateItem(sketches, (item) => !item.hidden && hasRestorableStageImage(item));
    if (fallbackSketch) sketches = markOnlyStateItemSelected(sketches, fallbackSketch);
  }

  if (isVisualizationStage(stage) && !directMockup && !selectedStateItem(finishResults)) {
    const mockupSource = selectedStateItem(mockupResults) || firstRestorableStateItem(mockupResults, hasRestorableStageImage);
    const mockupFinishInfo = finishInfoFromMockupState(mockupSource || {});
    const fallbackFinish =
      (mockupFinishInfo && firstRestorableStateItem(finishResults, (result) => finishStateMatchesFinishInfo(result, mockupFinishInfo))) ||
      firstRestorableStateItem(finishResults, hasRestorableStageImage);

    if (fallbackFinish) {
      finishResults = markOnlyStateItemSelected(finishResults, fallbackFinish);
    } else if (mockupFinishInfo) {
      finishResults = [finishStateFromFinishInfo(mockupFinishInfo)];
    }
  }

  return {
    ...state,
    directForm,
    directMockup,
    finishResults,
    mockupResults,
    sketches,
    stage,
  };
}

function restoreProjectState(project) {
  isRestoringProject = true;
  try {
    resetDesignWorkspace();

    const state = prepareProjectStateForRestore(project.state || createEmptyProjectState());
    isSketchGenerating = false;
    stage2EnteredDirectly = false;

    restoreSelectedChips(state.chips || {});
    restoreReferenceState(state.reference || {});
    restoreSketchState(state.sketches || []);
    restoreDirectFormState(state.directForm);
    restoreFinishResultState(state.finishResults || []);
    restoreDirectMockupState(state.directMockup);

    // Önce aşama sınıfını kur, sonra sonuçları çiz: mockup/manken artık ayrı sonuç
    // panelleri taşıdığından, restoreMockupResultState aktif panele yazmalı.
    if (state.stage === "manken") enterMankenStage({ allowMissing: true });
    else if (state.stage === "mockup") enterMockupStage({ allowMissing: true });
    else if (state.stage === "finish") enterFinishStage({ allowMissing: true });
    else if (state.stage === "form") enterFinishStage({ allowMissing: true });
    else openSketchStage();

    restoreMockupResultState(state.mockupResults || []);

    backfillProjectImagesToSavedDesigns(project);
  } catch (error) {
    // Tek bir bozuk proje state'i tüm workspace'i boş/kilitli bırakmamalı.
    // Hata olsa bile en azından 1. aşamayı aç ve kullanıcının devam etmesine izin ver.
    console.error("Proje geri yüklenirken hata oluştu", error);
    try {
      openSketchStage();
    } catch (fallbackError) {
      console.error("1. aşamaya geri dönülürken hata oluştu", fallbackError);
    }
  } finally {
    isRestoringProject = false;
    applyStageRestrictions();
  }
}

function backfillProjectImagesToSavedDesigns(project) {
  const state = project?.state;
  if (!state) return;

  const savedImageUrls = new Set(readSavedDesigns().map((d) => d.imageUrl).filter(Boolean));
  const entries = [];

  (state.sketches || []).forEach((sketch, index) => {
    if (!sketch?.url || savedImageUrls.has(sketch.url)) return;
    entries.push({
      ...designProfileFieldsFromSource(sketch),
      ...sketchMetadataFieldsFromSource(sketch),
      autoSaved: true,
      generatedBy: "ai",
      imageUrl: sketch.url,
      projectId: project.id,
      projectTitle: project.title || "",
      sourceImageUrl: sketch.sourceImageUrl || state.reference?.previewUrl || "",
      sourceStage: "sketch",
      stageSourceUrl: sketch.stageSourceUrl || sketch.url,
      stage: "AI Tasarım Görseli",
      title: sketch.label || `Tasarım ${String(index + 1).padStart(2, "0")}`,
    });
  });

  (state.finishResults || []).forEach((result, index) => {
    const url = result.finishImageUrl;
    if (!url || savedImageUrls.has(url)) return;
    entries.push({
      ...designProfileFieldsFromSource(result),
      autoSaved: true,
      generatedBy: "ai",
      imageUrl: url,
      projectId: project.id,
      projectTitle: project.title || "",
      sourceImageUrl: result.sourceFormUrl || result.sketchUrl || "",
      sourceStage: "finish",
      sourceTitle: result.moldTitle || result.title || "",
      stage: "Ürün Görseli",
      metalLabel: result.metalLabel || "",
      metalValue: result.metalValue || "",
      title: result.title || `${result.metalLabel || "Altın"} ${result.moldTitle || "Yüzük"} ${String(index + 1).padStart(2, "0")}`,
    });
  });

  (state.mockupResults || []).forEach((result, index) => {
    const url = result.mockupImageUrl;
    if (!url || savedImageUrls.has(url)) return;
    entries.push({
      ...designProfileFieldsFromSource(result.finishInfo || result),
      autoSaved: true,
      generatedBy: "ai",
      imageUrl: url,
      projectId: project.id,
      projectTitle: project.title || "",
      sourceImageUrl: result.finishInfo?.finishImageUrl || result.finishInfo?.sketchUrl || "",
      sourceStage: "mockup",
      sourceTitle: result.finishInfo?.title || result.title || "",
      stage: "Mockup / Manken Foto",
      title: result.title || `${normalizeMockupScene({ label: result.sceneLabel, value: result.sceneValue }).label} ${String(index + 1).padStart(2, "0")}`,
    });
  });

  if (!entries.length) return;
  addSavedDesigns(entries);
}

function resetDesignWorkspace() {
  releaseDirectFinishForm();
  releaseDirectMockupFinish();
  isSketchGenerating = false;
  stage2EnteredDirectly = false;

  resetGenerationUiState();
  if (uploadInput) uploadInput.value = "";
  restoreDefaultUploadState();
  restoreDefaultChipState();
  syncRingMoldSizeOptions();
  updateDesignSelectionSummary();
  clearSketchResults();
  openSketchStage();
  updateDraftCost();
  updateFinishCost();
  updateMockupCost();
  setSketchStatus("");
  setFinishStatusMessage("");
  setMockupStatusMessage("");
}

function resetGenerationUiState() {
  removeResultLoading("sketch");
  removeResultLoading("finish");
  removeResultLoading("mockup", { stage: "mockup" });
  removeResultLoading("mockup", { stage: "manken" });
  setGeneratingState(false);
  setFinishGeneratingState(false);
  setMockupGeneratingState(false);
}

function restoreDefaultUploadState() {
  const referencePreview = document.querySelector("[data-reference-preview]");
  const referencePreviewShell = document.querySelector("[data-reference-preview-shell]");
  const uploadDropzone = document.querySelector("[data-upload-dropzone]");
  const uploadHint = document.querySelector("[data-upload-hint]");

  if (uploadLabel) uploadLabel.textContent = uploadLabel.dataset.defaultText || "Tasarım görseli yükle";
  if (uploadHint) uploadHint.textContent = currentUploadHintText();
  if (referencePreview) {
    releaseImageElement(referencePreview);
    releaseReferencePreviewObjectUrl();
    referencePreview.removeAttribute("src");
    delete referencePreview.dataset.referenceDataUrl;
    delete referencePreview.dataset.referenceFileName;
    delete referencePreview.dataset.referenceThumbnailUrl;
    referencePreview.hidden = true;
  }
  referencePreviewShell?.setAttribute("hidden", "");
  uploadDropzone?.classList.remove("has-preview");
  ["direct-form", "direct-finish"].forEach((prefix) => {
    updateStageUploadPreview(prefix, "", "");
  });
}

function restoreDefaultChipState() {
  document.querySelectorAll("[data-chip-group]").forEach((group) => {
    group.querySelectorAll(".option-chip").forEach((chip) => {
      chip.classList.toggle("is-selected", chip.dataset.defaultSelected === "1");
    });
  });
  enforceProductShapeSelection();
  applyProductMetalUI();
}

function restoreSelectedChips(chips) {
  Object.entries(chips || {}).forEach(([groupName, savedChip]) => {
    const group = document.querySelector(`[data-chip-group="${groupName}"]`);
    if (!group || !savedChip) return;
    const dataKey = CHIP_DATA_KEY_BY_GROUP[groupName] || "";
    const candidates = Array.from(group.querySelectorAll(".option-chip"));
    const match =
      (dataKey && candidates.find((chip) => chip.dataset[dataKey] === savedChip.value)) ||
      candidates.find((chip) => chip.textContent.trim() === savedChip.label);
    if (!match) return;
    candidates.forEach((chip) => chip.classList.toggle("is-selected", chip === match));
  });

  enforceProductShapeSelection();
  applyProductMetalUI();
  syncRingMoldSizeOptions();
  updateDraftCost();
  updateFinishCost();
  updateMockupCost();
  updateVisibleSketchCards();
  updateDesignSelectionSummary();
}

function enforceProductShapeSelection() {
  const shapeGroup = document.querySelector('[data-chip-group="product-shape"]');
  if (!shapeGroup) return;

  const allowedShapes = allowedProjectShapeValues(readSelectedChip("product-type").value);
  if (!allowedShapes.length) return;

  const selectedShape = shapeGroup.querySelector(".option-chip.is-selected");
  if (selectedShape && allowedShapes.includes(selectedShape.dataset.productShape || "")) return;

  const fallbackShape = shapeGroup.querySelector(`[data-product-shape="${allowedShapes[0]}"]`);
  if (!fallbackShape) return;

  shapeGroup.querySelectorAll(".option-chip").forEach((chip) => {
    chip.classList.toggle("is-selected", chip === fallbackShape);
  });
}

function currentUploadHintText() {
  const productValue = readSelectedChip("product-type").value || "yuzuk";
  const hint = document.querySelector("[data-upload-hint]");
  if (hint) {
    const productHint = productValue === "kolye" ? hint.dataset.hintKolye : hint.dataset.hintYuzuk;
    if (productHint) return productHint;
    if (hint.dataset.defaultText) return hint.dataset.defaultText;
  }
  return productValue === "kolye"
    ? "Logo/arma görseli ya da kolye fotoğrafı ekle; ürün fotoğrafında yalnız kolye üzerindeki motif alınır."
    : "Logo/arma görseli ya da yüzük fotoğrafı ekle; ürün fotoğrafında yalnız yüzük üstündeki motif alınır.";
}

function applyProductMetalUI() {
  const productValue = readSelectedChip("product-type").value || "yuzuk";
  const isKolye = productValue === "kolye";

  // Label: Yüzük rengi / Kolye rengi
  document.querySelectorAll("[data-metal-label]").forEach((label) => {
    label.textContent = isKolye ? "Kolye rengi" : "Yüzük rengi";
  });

  // Upload hint: ürüne göre değiş
  document.querySelectorAll("[data-upload-hint]").forEach((hint) => {
    const productHint = isKolye ? hint.dataset.hintKolye : hint.dataset.hintYuzuk;
    if (productHint) {
      hint.textContent = productHint;
      hint.dataset.defaultText = productHint;
    }
  });

  // Kolye için iki metal de seçilebilir kalsın — chipler her zaman görünür
  const metalGroup = document.querySelector('[data-chip-group="metal"]');
  if (!metalGroup) return;
  const altinChip = metalGroup.querySelector('[data-metal="altin"]');
  const gumusChip = metalGroup.querySelector('[data-metal="gumus"]');
  const roseChip = metalGroup.querySelector('[data-metal="rose"]');
  if (altinChip) altinChip.style.display = "";
  if (gumusChip) gumusChip.style.display = "";
  if (roseChip) roseChip.style.display = "";

  updateSideEmblemDefaultThumbs();
  updateSidePrintPreviews();
}

function restoreReferenceState(reference) {
  const preview = document.querySelector("[data-reference-preview]");
  const previewShell = document.querySelector("[data-reference-preview-shell]");
  const dropzone = document.querySelector("[data-upload-dropzone]");
  const hint = document.querySelector("[data-upload-hint]");

  if (uploadLabel) uploadLabel.textContent = reference.fileName || uploadLabel.dataset.defaultText || "Tasarım görseli yükle";
  if (hint) hint.textContent = reference.fileName ? "Tasarım hazır. Görsel oluşturmayı başlatabilirsin." : hint.dataset.defaultText || "Seçtiğin ürün, şekil ve yüzey işlemine uygulanacak görseli ekle.";

  const storedDataUrl = safePersistedImageUrl(reference.imageDataUrl || "", "imageDataUrl");
  const storedThumbnailUrl =
    safePersistedImageUrl(reference.thumbnailUrl || "", "thumbnailUrl") ||
    readSourceThumbnail(reference.fileName);
  const restoredImageUrl =
    storedThumbnailUrl ||
    safePersistedImageUrl(String(reference.previewUrl || "").startsWith("blob:") ? "" : reference.previewUrl, "previewUrl") ||
    storedDataUrl;
  if (preview && restoredImageUrl) {
    preview.src = restoredImageUrl;
    if (storedDataUrl) {
      preview.dataset.referenceDataUrl = storedDataUrl;
    } else {
      delete preview.dataset.referenceDataUrl;
    }
    preview.dataset.referenceFileName = reference.fileName || "";
    preview.dataset.referenceThumbnailUrl = storedThumbnailUrl || restoredImageUrl;
    preview.hidden = false;
    previewShell?.removeAttribute("hidden");
    dropzone?.classList.add("has-preview");
  } else {
    dropzone?.classList.remove("has-preview");
  }
}

function restoreDirectFormState(source) {
  if (!source || typeof source !== "object") return;

  const imageUrl = safePersistedImageUrl(
    source.formImageUrl || source.sourceFormUrl || source.sketchUrl || "",
    "formImageUrl"
  );
  if (!imageUrl) return;

  clearSketchCardSelection();
  directFinishForm = {
    ...designProfileFieldsFromSource(source),
    ...sketchMetadataFieldsFromSource(source),
    formImageUrl: imageUrl,
    moldTitle: source.moldTitle || "Yüklenen tasarım",
    renderMode: source.renderMode || "generated",
    sketchUrl: safePersistedImageUrl(source.sketchUrl || imageUrl, "sketchUrl") || imageUrl,
    sourceFormUrl: safePersistedImageUrl(source.sourceFormUrl || "", "sourceFormUrl"),
    subtitle: source.subtitle || "",
    title: source.title || "Yüklenen tasarım",
  };
  updateStageUploadPreview("direct-form", "", "");
}

function restoreSketchState(sketches) {
  if (!Array.isArray(sketches) || sketches.length === 0) return;

  newDesignStudio?.classList.add("has-results");
  ensureSketchCardCount(sketches.length);
  document.querySelectorAll("[data-sketch-card]").forEach((card, index) => {
    const saved = sketches[index];

    if (!saved) {
      resetSketchCard(card, index);
      card.classList.add("is-hidden");
      return;
    }

    card.classList.toggle("is-hidden", Boolean(saved?.hidden));
    card.classList.toggle("is-selected", Boolean(saved?.selected));
    if (saved?.url) {
      setSketchCardImage(
        card,
        {
          ...saved,
          label: saved.label || `Tasarım ${String(index + 1).padStart(2, "0")}`,
          url: saved.url,
        },
        index
      );
    }
  });
  setFormStepReady(Boolean(getSelectedSketchInfo()));
}

function restoreFinishResultState(results) {
  if (!Array.isArray(results) || results.length === 0) return;
  const normalizedResults = results.map(normalizeSavedFinishResult);
  showFinishResults(normalizedResults);
  restoreSelectedResult("[data-finish-result-card]", "finishResultId", normalizedResults);
  setMockupStepReady(Boolean(getSelectedFinishInfo()));
}

function normalizeSavedFinishResult(result, index) {
  const finishImageUrl = result.finishImageUrl || (result.renderMode === "generated" ? result.sketchUrl : "");
  const sourceFormUrl = result.sourceFormUrl || (finishImageUrl ? "" : result.sketchUrl || "");
  const profile = designProfileFromFields(result);

  return {
    background: { label: result.backgroundLabel || "Dekupe", value: result.backgroundValue || "dekupe" },
    formInfo: {
      designModeLabel: result.designModeLabel || profile.designModeLabel,
      designModeValue: result.designModeValue || profile.designModeValue,
      formImageUrl: sourceFormUrl,
      moldAspect: result.moldAspect || profile.moldAspect,
      moldHeightCm: result.moldHeightCm || "",
      moldKey: result.moldKey || "",
      moldMeasure: result.moldMeasure || "",
      moldShape: result.moldShape || result.shapeValue || result.productShapeValue || profile.shapeValue,
      moldSizeLabel: result.moldSizeLabel || result.moldMeasure || "",
      moldTitle: result.moldTitle || profile.moldTitle || "Tasarım",
      moldWidthCm: result.moldWidthCm || "",
      productLabel: result.productLabel || profile.productLabel,
      productShapeLabel: result.productShapeLabel || result.shapeLabel || profile.productShapeLabel,
      productShapeValue: result.productShapeValue || result.shapeValue || profile.productShapeValue,
      productValue: result.productValue || profile.productValue,
      renderMode: sourceFormUrl ? "generated" : "composite",
      shapeValue: result.shapeValue || result.productShapeValue || profile.shapeValue,
      sketchUrl: sourceFormUrl || DEV_SKETCH_DATA_URL,
      title: result.moldTitle || profile.moldTitle || "Tasarım",
    },
    generatedAt: result.generatedAt || "",
    id: result.id || `finish-restored-${index}`,
    imageUrl: finishImageUrl,
    index: result.index || index + 1,
    metal: { label: result.metalLabel || "Altın", value: result.metalValue || "altin" },
    renderMode: result.renderMode || (finishImageUrl ? "generated" : "composite"),
    selected: Boolean(result.selected),
    // Yan baskı bilgisi reload sonrası korunmalı; 3./4. aşama aynı bitmiş ürünü kullanır.
    sidePrint: result.sidePrint === true || result.sidePrint === "1",
    sidePrintLeft: result.sidePrintLeft || "",
    sidePrintRight: result.sidePrintRight || "",
    stone: { label: result.stoneLabel || "Yok", value: result.stoneValue || "yok" },
    surface: { label: result.surfaceLabel || "Parlak", value: result.surfaceValue || "parlak" },
  };
}

function restoreMockupResultState(results) {
  if (!Array.isArray(results) || results.length === 0) return;
  const normalizedResults = results.map(normalizeSavedMockupResult);
  const groupedResults = normalizedResults.reduce(
    (groups, result) => {
      groups[mockupResultStage(result)].push(result);
      return groups;
    },
    { manken: [], mockup: [] }
  );

  showMockupResults(groupedResults.mockup, { stage: "mockup" });
  showMockupResults(groupedResults.manken, { stage: "manken" });
  restoreSelectedResult("[data-mockup-result-card]", "mockupResultId", normalizedResults);
  syncMockupResultUi();
}

function normalizeSavedMockupResult(result, index) {
  const finishProfile = designProfileFromFields(result.finishInfo || result);
  return {
    channel: { label: result.channelLabel || "Etsy", value: result.channelValue || "etsy" },
    finishInfo: {
      backgroundLabel: result.finishInfo?.backgroundLabel || "Dekupe",
      backgroundValue: result.finishInfo?.backgroundValue || "dekupe",
      designModeLabel: result.finishInfo?.designModeLabel || finishProfile.designModeLabel,
      designModeValue: result.finishInfo?.designModeValue || finishProfile.designModeValue,
      finishImageUrl: result.finishInfo?.finishImageUrl || "",
      metalLabel: result.finishInfo?.metalLabel || "Altın",
      metalValue: result.finishInfo?.metalValue || "altin",
      moldAspect: result.finishInfo?.moldAspect || finishProfile.moldAspect,
      moldHeightCm: result.finishInfo?.moldHeightCm || "",
      moldKey: result.finishInfo?.moldKey || "",
      moldMeasure: result.finishInfo?.moldMeasure || "",
      moldShape: result.finishInfo?.moldShape || result.finishInfo?.shapeValue || result.finishInfo?.productShapeValue || finishProfile.shapeValue,
      moldSizeLabel: result.finishInfo?.moldSizeLabel || result.finishInfo?.moldMeasure || "",
      moldTitle: result.finishInfo?.moldTitle || finishProfile.moldTitle || "Tasarım",
      moldWidthCm: result.finishInfo?.moldWidthCm || "",
      productLabel: result.finishInfo?.productLabel || finishProfile.productLabel,
      productShapeLabel: result.finishInfo?.productShapeLabel || result.finishInfo?.shapeLabel || finishProfile.productShapeLabel,
      productShapeValue: result.finishInfo?.productShapeValue || result.finishInfo?.shapeValue || finishProfile.productShapeValue,
      productValue: result.finishInfo?.productValue || finishProfile.productValue,
      renderMode: result.finishInfo?.renderMode || "composite",
      shapeValue: result.finishInfo?.shapeValue || result.finishInfo?.productShapeValue || finishProfile.shapeValue,
      sidePrint: result.finishInfo?.sidePrint === true || result.finishInfo?.sidePrint === "1",
      sidePrintLeft: result.finishInfo?.sidePrintLeft || "",
      sidePrintRight: result.finishInfo?.sidePrintRight || "",
      sketchUrl: result.finishInfo?.sketchUrl || DEV_SKETCH_DATA_URL,
      sourceFormUrl: result.finishInfo?.sourceFormUrl || "",
      stoneLabel: result.finishInfo?.stoneLabel || "Yok",
      stoneValue: result.finishInfo?.stoneValue || "yok",
      surfaceLabel: result.finishInfo?.surfaceLabel || "Parlak",
      surfaceValue: result.finishInfo?.surfaceValue || "parlak",
      title: result.finishInfo?.title || "Ürün renderı",
    },
    generatedAt: result.generatedAt || "",
    id: result.id || `mockup-restored-${index}`,
    imageUrl: result.mockupImageUrl || result.imageUrl || "",
    index: result.index || index + 1,
    ratio: { label: result.ratioLabel || "1:1", value: result.ratioValue || "square" },
    resolution: { label: result.resolutionLabel || "1K", value: result.resolutionValue || "1k" },
    scene: normalizeMockupScene({ label: result.sceneLabel, value: result.sceneValue }),
    selected: Boolean(result.selected),
    visualStyle: { label: result.visualStyleLabel || "Minimal", value: result.visualStyleValue || "minimal" },
  };
}

function restoreDirectMockupState(source) {
  if (!source || typeof source !== "object") return;

  const imageUrl = safePersistedImageUrl(
    source.finishImageUrl || source.sourceFormUrl || source.sketchUrl || "",
    "finishImageUrl"
  );
  if (!imageUrl) return;

  document.querySelectorAll("[data-finish-result-card]").forEach((card) => card.classList.remove("is-selected"));
  directMockupFinish = {
    ...designProfileFieldsFromSource(source),
    backgroundLabel: source.backgroundLabel || "Yüklenen",
    backgroundValue: source.backgroundValue || "temiz",
    finishImageUrl: imageUrl,
    metalLabel: source.metalLabel || "Yüklenen render",
    metalValue: source.metalValue || "altin",
    moldTitle: source.moldTitle || "Yüklenen ürün",
    renderMode: source.renderMode || "generated",
    sketchUrl: safePersistedImageUrl(source.sketchUrl || imageUrl, "sketchUrl") || imageUrl,
    sourceFormUrl: safePersistedImageUrl(source.sourceFormUrl || "", "sourceFormUrl"),
    stoneLabel: source.stoneLabel || "Yok",
    stoneValue: source.stoneValue || "yok",
    surfaceLabel: source.surfaceLabel || "Hazır render",
    surfaceValue: source.surfaceValue || "parlak",
    subtitle: source.subtitle || "",
    title: source.title || "Yüklenen ürün",
  };
  updateStageUploadPreview("direct-finish", "", "");
}

function restoreSelectedResult(selector, dataKey, results) {
  const selected = results.find((result) => result.selected);
  if (!selected) return;
  document.querySelectorAll(selector).forEach((card) => {
    card.classList.toggle("is-selected", card.dataset[dataKey] === selected.id);
  });
}

function showStudio(session, options = {}) {
  const email = session?.user?.email || "";
  overviewPage.renderUserIdentity(email);
  renderProfilePanel(session);
  syncProfileFromServer();

  updateProjectStats();
  renderCurrentPackage(undefined, { renderCredit: options.renderCredit !== false });
}

function profileStorageKey(baseKey) {
  return `${baseKey}:${currentUserId || "local"}`;
}

function sanitizeProfile(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const legacyName = String(source.displayName || "").trim();
  const legacyParts = legacyName.split(/\s+/).filter(Boolean);
  const fallbackFirstName = legacyParts[0] || "";
  const fallbackLastName = legacyParts.slice(1).join(" ");
  return {
    addressLine: String(source.addressLine || "").trim(),
    city: String(source.city || "").trim(),
    country: String(source.country || "Türkiye").trim(),
    district: String(source.district || "").trim(),
    firstName: String(source.firstName || fallbackFirstName).trim(),
    lastName: String(source.lastName || fallbackLastName).trim(),
    phone: String(source.phone || "").trim(),
    postalCode: String(source.postalCode || "").trim(),
  };
}

function defaultProfilePreferences() {
  return {
    announcements: false,
    credits: true,
    production: true,
  };
}

function sanitizeProfilePreferences(value = {}) {
  const defaults = defaultProfilePreferences();
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, typeof source[key] === "boolean" ? source[key] : defaults[key]])
  );
}

function readStoredProfile() {
  return sanitizeProfile(StudioStorage.readJson(profileStorageKey(PROFILE_STORAGE_KEY), {}));
}

function writeStoredProfile(profile) {
  return StudioStorage.writeJson(profileStorageKey(PROFILE_STORAGE_KEY), sanitizeProfile(profile));
}

function profileFromServer(value = {}) {
  const profile = value?.profile && typeof value.profile === "object" ? value.profile : value;
  return sanitizeProfile({
    addressLine: profile.addressLine,
    city: profile.city,
    country: profile.country,
    district: profile.district,
    displayName: profile.displayName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    postalCode: profile.postalCode,
  });
}

function mergeProfileForDisplay(localProfile, serverProfile) {
  const local = sanitizeProfile(localProfile);
  const remote = sanitizeProfile(serverProfile);
  const merged = { ...local };
  Object.entries(remote).forEach(([key, value]) => {
    if (key === "country" || String(value || "").trim()) merged[key] = value;
  });
  return sanitizeProfile(merged);
}

function canSyncProfileWithServer() {
  const email = currentProfileEmail();
  return Boolean(
    currentUserId &&
    studioSupabase &&
    email &&
    email !== "—" &&
    !email.endsWith("@ff.local") &&
    studioApi?.readProfile &&
    studioApi?.updateProfile
  );
}

async function syncProfileFromServer() {
  if (!canSyncProfileWithServer()) return;
  try {
    const { payload, response } = await studioApi.readProfile();
    if (!response.ok) return;
    const profile = mergeProfileForDisplay(readStoredProfile(), profileFromServer(payload));
    writeStoredProfile(profile);
    renderProfileForm();
    renderOrderCart();
  } catch (error) {
    console.warn("[profile] remote profile could not be read.", error);
  }
}

function readStoredProfilePreferences() {
  return sanitizeProfilePreferences(
    StudioStorage.readJson(profileStorageKey(PROFILE_PREFERENCES_STORAGE_KEY), {})
  );
}

function writeStoredProfilePreferences(preferences) {
  return StudioStorage.writeJson(
    profileStorageKey(PROFILE_PREFERENCES_STORAGE_KEY),
    sanitizeProfilePreferences(preferences)
  );
}

function renderProfilePanel(session = {}) {
  const email = session?.user?.email || "";
  if (profileEmail) profileEmail.textContent = email || "—";
  if (profileUserId) profileUserId.textContent = currentUserId || "Yerel test modu";
  renderProfileForm();
  renderProfilePreferences();
}

function renderProfileForm() {
  if (!profileForms.length) return;
  const profile = readStoredProfile();
  Object.entries(profile).forEach(([key, value]) => {
    profileForms.forEach((form) => {
      if (form.elements[key]) form.elements[key].value = value;
    });
  });
}

function renderProfilePreferences() {
  const preferences = readStoredProfilePreferences();
  profilePreferenceInputs.forEach((input) => {
    input.checked = preferences[input.dataset.profilePref] !== false;
  });
}

function setProfilePanelStatus(element, message = "", tone = "") {
  if (!element) return;
  if (!message || !isVisibleStatusTone(tone)) {
    element.hidden = true;
    element.textContent = "";
    element.removeAttribute("data-tone");
    return;
  }
  element.hidden = false;
  element.textContent = message;
  element.dataset.tone = tone === "notice" ? "success" : tone;
}

function profileFormData() {
  if (!profileForms.length) return {};
  const merged = new FormData();
  profileForms.forEach((form) => {
    new FormData(form).forEach((value, key) => merged.set(key, value));
  });
  return sanitizeProfile({
    addressLine: merged.get("addressLine"),
    city: merged.get("city"),
    country: merged.get("country"),
    district: merged.get("district"),
    firstName: merged.get("firstName"),
    lastName: merged.get("lastName"),
    phone: merged.get("phone"),
    postalCode: merged.get("postalCode"),
  });
}

async function saveProfileForm(event) {
  event.preventDefault();
  const statusTarget = event.currentTarget?.dataset.profileSection === "address" ? profileAddressStatus : profileStatus;
  const profile = profileFormData();
  if (!writeStoredProfile(profile)) {
    setProfilePanelStatus(statusTarget, "Profil kaydedilemedi. Tarayıcı depolaması kapalı olabilir.", "error");
    return;
  }
  setProfilePanelStatus(statusTarget, "Profil kaydediliyor...", "");

  if (canSyncProfileWithServer()) {
    try {
      const { payload, response } = await studioApi.updateProfile(profile);
      if (!response.ok) {
        throw new Error(payload?.error || "Profil kaydedilemedi.");
      }
      writeStoredProfile(profileFromServer(payload));
      renderProfileForm();
    } catch (error) {
      setProfilePanelStatus(
        statusTarget,
        `${error.message || "Profil kaydedilemedi."} Bilgiler bu tarayıcıda saklandı.`,
        "error"
      );
      renderOrderCart();
      return;
    }
  }

  setProfilePanelStatus(statusTarget, "Profil kaydedildi.", "success");
  renderOrderCart();
}

function saveProfilePreferences() {
  const preferences = readStoredProfilePreferences();
  profilePreferenceInputs.forEach((input) => {
    preferences[input.dataset.profilePref] = input.checked;
  });
  writeStoredProfilePreferences(preferences);
}

function currentProfileEmail() {
  const email = profileEmail?.textContent || "";
  return String(email || "").trim();
}

function buildStudioAuthRedirectUrl() {
  const baseUrl = studioPublicConfig?.siteUrl || window.location.href;
  try {
    return new URL("./login", baseUrl).toString();
  } catch {
    return new URL("./login", window.location.href).toString();
  }
}

async function sendProfilePasswordReset() {
  const email = currentProfileEmail();
  if (!email || email === "—" || email.endsWith("@ff.local")) {
    setProfilePanelStatus(profileSecurityStatus, "Şifre sıfırlama için aktif bir e-posta oturumu gerekli.", "error");
    return;
  }
  if (!studioSupabase) {
    setProfilePanelStatus(profileSecurityStatus, "Oturum bağlantısı hazır değil. Sayfayı yenileyip tekrar dene.", "error");
    return;
  }

  const defaultLabel = profilePasswordResetButton?.textContent?.trim() || "Şifre sıfırlama maili gönder";
  if (profilePasswordResetButton) {
    profilePasswordResetButton.disabled = true;
    profilePasswordResetButton.textContent = "Gönderiliyor...";
  }
  setProfilePanelStatus(profileSecurityStatus, "");

  try {
    const { error } = await withTimeout(
      studioSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: buildStudioAuthRedirectUrl(),
      }),
      STUDIO_AUTH_TIMEOUT_MS,
      "Şifre sıfırlama isteği zaman aşımına uğradı."
    );
    if (error) throw error;
    setProfilePanelStatus(profileSecurityStatus, `${email} adresine sıfırlama maili gönderildi.`, "notice");
  } catch (error) {
    setProfilePanelStatus(profileSecurityStatus, error.message || "Şifre sıfırlama maili gönderilemedi.", "error");
  } finally {
    if (profilePasswordResetButton) {
      profilePasswordResetButton.disabled = false;
      profilePasswordResetButton.textContent = defaultLabel;
    }
  }
}

function switchProfileSection(sectionKey = "contact") {
  const key = String(sectionKey || "contact");
  document.querySelectorAll("[data-profile-nav]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.profileNav === key);
  });
  document.querySelectorAll("[data-profile-section]").forEach((section) => {
    section.hidden = section.dataset.profileSection !== key;
  });
}

function bindProfileControls() {
  document.querySelectorAll("[data-profile-nav]").forEach((button) => {
    button.addEventListener("click", () => switchProfileSection(button.dataset.profileNav));
  });
  profileForms.forEach((form) => {
    form.addEventListener("submit", saveProfileForm);
    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        renderProfileForm();
        setProfilePanelStatus(profileStatus, "");
        setProfilePanelStatus(profileAddressStatus, "");
      }, 0);
    });
  });
  profilePreferenceInputs.forEach((input) => {
    input.addEventListener("change", saveProfilePreferences);
  });
  profilePasswordResetButton?.addEventListener("click", () => {
    sendProfilePasswordReset();
  });
}

function switchOrderSection(sectionKey = "create") {
  const key = String(sectionKey || "create");
  document.querySelectorAll("[data-order-nav]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.orderNav === key);
  });
  document.querySelectorAll("[data-order-section]").forEach((section) => {
    section.hidden = section.dataset.orderSection !== key;
  });
}

function bindOrderSectionControls() {
  document.querySelectorAll("[data-order-nav]").forEach((button) => {
    button.addEventListener("click", () => switchOrderSection(button.dataset.orderNav));
  });
  bindChainShopControls();
}

function revealStudioShell() {
  authLoading.classList.add("is-done");
  studioShell.classList.add("is-visible");
}

function handleStudioPageExit() {
  flushStudioStateForLifecycle();
}

function handleStudioPageShow(event) {
  if (studioShell && currentUserId) studioShell.classList.add("is-visible");
  if (authLoading && currentUserId) authLoading.classList.add("is-done");

  if (event?.persisted) {
    restoreStoredActiveProjectWorkspace({ scroll: false, updateHash: false });
    syncVisiblePendingGenerations({ resume: true });
  }
}

function flushStudioStateForLifecycle() {
  flushProjectSave();
  if (!canSyncCloudStudioState()) return;

  scheduleCloudStudioStateSync(0);
  flushCloudStudioStateSync().catch((error) => {
    console.warn("[sync] Lifecycle cloud sync flush failed.", error);
  });
}

function switchTab(tabKey, options = {}) {
  const requestedTabKey = String(tabKey || "");
  let nextTab = tabController.normalize(requestedTabKey);
  const requestedProfileSection = options.profileSection || profileSectionFromRouteKey(requestedTabKey);
  if (!isTabAllowedForRole(nextTab)) {
    nextTab = defaultTabForRole();
  }
  if (!ROUTABLE_TABS.has(nextTab)) return;

  if (options.skipProjectSave !== true) {
    flushProjectSave();
  }
  tabController.switchTo(nextTab);
  if (nextTab === "profil" && requestedProfileSection) {
    switchProfileSection(requestedProfileSection);
  }

  if (nextTab === "projeler" && options.showProjectLibrary !== false) {
    const hasActiveJobsForProject = activePendingGenerations().some(
      (job) => generationProjectId(job) === activeProjectId
    );
    if (!hasActiveJobsForProject) {
      showProjectLibrary();
    }
  }

  revealActiveTabContent(nextTab);
  if (nextTab === "projeler") {
    syncVisiblePendingGenerations({ resume: true });
  }
  if (nextTab === "uretim") {
    if (options.orderSection) switchOrderSection(options.orderSection);
    renderOrderDesignGallery();
    loadAndRenderProductionRequests();
  }
  // Ticket dışındaki tablara geçerken polling'i durdur.
  stopTicketPolling();
  if (nextTab === "ticket") {
    loadAndRenderTickets();
    startTicketPolling();
  }
  // Admin destek paneli için de aynı canlı güncelleme.
  stopAdminTicketPolling();
  if (nextTab === "yonetim") {
    loadAndRenderAdminTickets();
    startAdminTicketPolling();
  }

  if (options.updateHash !== false) {
    updateTabHash(nextTab);
  }

  if (options.scroll !== false) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  scheduleManagedImageVisibilityRefresh();
}

function revealActiveTabContent(tabKey) {
  const activePanel = Array.from(TAB_PANELS).find((panel) => (
    tabController.normalize(panel.dataset.panel) === tabKey
  ));

  activePanel?.querySelectorAll(".reveal").forEach((item) => {
    item.classList.add("is-visible");
  });
}

function bindTabNav() {
  tabController.bind(switchTab);
}

function bindTabHashRoute() {
  window.addEventListener("hashchange", () => {
    const routeKey = routeKeyFromLocationHash();
    switchTab(tabFromRouteKey(routeKey) || "genel", {
      profileSection: profileSectionFromRouteKey(routeKey),
      updateHash: false,
    });
  });
}

function bindPendingGenerationPersistence() {
  window.addEventListener("storage", (event) => {
    if (
      ![studioStore.pendingGenerationsKey, studioStore.projectsKey, studioStore.savedDesignsKey].includes(event.key)
    ) {
      return;
    }

    syncVisiblePendingGenerations({ resume: event.key === studioStore.pendingGenerationsKey });
  });

  window.addEventListener("focus", () => {
    syncVisiblePendingGenerations({ resume: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncVisiblePendingGenerations({ resume: true });
    } else {
      flushStudioStateForLifecycle();
    }
  });
}

function openInitialStudioTab(shouldOpenPackagePanel) {
  if (shouldOpenPackagePanel) {
    switchTab("profil", { profileSection: "billing", scroll: false });
    return;
  }

  const initialRouteKey = routeKeyFromLocationHash();
  const initialTab = tabFromRouteKey(initialRouteKey);
  if ((!initialTab || initialTab === "projeler") && restoreStoredActiveProjectWorkspace({ scroll: false, updateHash: false })) {
    return;
  }

  if (initialTab) {
    switchTab(initialTab, {
      profileSection: profileSectionFromRouteKey(initialRouteKey),
      scroll: false,
    });
  }
}

function restoreStoredActiveProjectWorkspace(options = {}) {
  const storedProjectId = readStoredActiveProjectId();
  if (!storedProjectId) return false;

  const projectExists = readProjects().some((project) => project.id === storedProjectId);
  if (!projectExists) {
    studioStore.clearActiveProjectId(storedProjectId);
    return false;
  }

  openProject(storedProjectId, {
    scroll: options.scroll,
    updateHash: options.updateHash,
  });
  return true;
}

function tabFromLocationHash() {
  return tabFromRouteKey(routeKeyFromLocationHash());
}

function routeKeyFromLocationHash() {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#/, "")).trim();
  } catch {
    return "";
  }
}

function tabFromRouteKey(routeKey) {
  const tabKey = tabController.normalize(routeKey);
  return ROUTABLE_TABS.has(tabKey) ? tabKey : "";
}

function profileSectionFromRouteKey(routeKey) {
  return PROFILE_SECTION_ALIASES[String(routeKey || "").trim()] || "";
}

function updateTabHash(tabKey) {
  if (!ROUTABLE_TABS.has(tabKey)) return;

  const nextHash = `#${encodeURIComponent(tabKey)}`;
  if (window.location.hash === nextHash) return;

  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
}

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

function bindProjectControls() {
  newProjectButtons.forEach((button) => {
    button.addEventListener("click", openNewProjectDialog);
  });

  selectProjectsToggle?.addEventListener("click", enterProjectSelectionMode);
  projectSelectCancelButton?.addEventListener("click", exitProjectSelectionMode);
  projectSelectAllButton?.addEventListener("click", toggleAllProjectSelection);
  projectSelectDeleteButton?.addEventListener("click", requestBulkProjectDelete);

  window.addEventListener("beforeunload", () => {
    flushProjectSave();
  });
}

function bindProjectDialogControls() {
  projectDialogForm?.addEventListener("submit", handleProjectDialogSubmit);
  projectDialogCancelButtons.forEach((button) => {
    button.addEventListener("click", closeProjectDialog);
  });
  projectNameInput?.addEventListener("input", () => {
    setProjectDialogError("");
    updateProjectDialogCreateState();
  });
  projectDetailProductButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setProjectDialogError("");
      setProjectDetailButtonSelection(projectDetailProductButtons, button.dataset.projectProduct || "", "projectProduct");
      clearProjectDetailShapeSelection();
      updateProjectDialogCreateState();
    });
  });
  projectDetailShapeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled || button.hidden) return;
      setProjectDialogError("");
      setProjectDetailButtonSelection(projectDetailShapeButtons, button.dataset.projectShape || "", "projectShape");
      updateProjectDialogCreateState();
    });
  });
  projectDetailMetalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled || button.hidden) return;
      setProjectDialogError("");
      setProjectDetailButtonSelection(projectDetailMetalButtons, button.dataset.projectMetal || "", "projectMetal");
      updateProjectDialogCreateState();
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectDialog && !projectDialog.hidden) {
      closeProjectDialog();
    }
  });
}

function bindNewDesignControls() {
  document.querySelectorAll("[data-chip-group] .option-chip").forEach((chip) => {
    chip.dataset.defaultSelected = chip.classList.contains("is-selected") ? "1" : "0";
  });
  if (uploadLabel && !uploadLabel.dataset.defaultText) {
    uploadLabel.dataset.defaultText = uploadLabel.textContent;
  }
  const uploadHint = document.querySelector("[data-upload-hint]");
  if (uploadHint && !uploadHint.dataset.defaultText) {
    uploadHint.dataset.defaultText = uploadHint.textContent;
  }

  document.querySelectorAll("[data-chip-group]").forEach((group) => {
    group.querySelectorAll(".option-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (isSketchGenerating && ["product-type", "product-shape", "design-mode"].includes(group.dataset.chipGroup)) return;
        group.querySelectorAll(".option-chip").forEach((item) => {
          item.classList.toggle("is-selected", item === chip);
        });

        if (group.dataset.chipGroup === "count") {
          updateDraftCost();
          if (newDesignStudio?.classList.contains("has-results")) {
            clearSketchResults();
            setSketchStatus("Görsel sayısı değişti. Yeni ayarla tekrar oluşturabilirsin.");
          }
        }

        if (group.dataset.chipGroup === "finish-count") {
          updateFinishCost();
        }

        if (group.dataset.chipGroup === "metal") {
          updateDesignSelectionSummary();
          updateSideEmblemDefaultThumbs();
          updateSidePrintPreviews();
        }

        if (["product-type", "product-shape", "design-mode"].includes(group.dataset.chipGroup)) {
          if (group.dataset.chipGroup === "product-type") {
            enforceProductShapeSelection();
            applyProductMetalUI();
          }
          updateDesignSelectionSummary();
          renderFinishPreview(getSelectedFormInfo());
          renderMockupPreview(getSelectedFinishInfo());
          // Yüzey işlemi (detaylı/minimalist) değişince önceki çıktılar ekranda
          // kalsın; sadece ürün tipi/şekli değişince eski sonuçları temizle.
          const clearsSketchResults =
            group.dataset.chipGroup === "product-type" ||
            group.dataset.chipGroup === "product-shape";
          if (newDesignStudio?.classList.contains("has-results")) {
            if (clearsSketchResults) {
              clearSketchResults();
              setSketchStatus("Ürün veya şekil değişti. Yeni prompt ile tekrar görsel oluştur.");
            } else {
              setSketchStatus("Yüzey işlemi değişti. Mevcut görseller durur; yeni üretim seçilen ayarla yapılır.");
            }
          }
        }

        if (group.dataset.chipGroup === "ring-shape") {
          syncRingMoldSizeOptions();
          renderFinishPreview(getSelectedFormInfo());
        }

        if (group.dataset.chipGroup === "ring-mold") {
          renderFinishPreview(getSelectedFormInfo());
        }

        if (["mockup-count", "mockup-resolution"].includes(group.dataset.chipGroup)) {
          updateMockupCost();
        }

        if (["metal", "ring-shape", "ring-mold", "surface", "stone", "background", "finish-count"].includes(group.dataset.chipGroup)) {
          if (newDesignStudio?.classList.contains("has-finish-result")) {
            setFinishStatusMessage("Ürün görseli seçenekleri güncellendi. Mevcut sonuçlar durur; yeni üretim yanına eklenir.");
          }
        }

        if (["scene", "ratio", "mockup-count", "mockup-resolution"].includes(group.dataset.chipGroup)) {
          const activePanelHasResults = Boolean(
            (activeVisualizationPanel() || document).querySelector("[data-mockup-result-card]")
          );
          if (activePanelHasResults) {
            setMockupStatusMessage("Seçenekler güncellendi. Mevcut görseller durur; yeni üretim seçilen ayarla yapılır.");
          }
        }

        queueActiveProjectSave();
      });
    });
  });

  updateDraftCost();
  updateFinishCost();
  updateMockupCost();
  updateDesignSelectionSummary();
  setWorkflowForSketchStage();

  document.querySelectorAll("[data-stage-target]").forEach((step) => {
    step.addEventListener("click", () => openDesignStage(step.dataset.stageTarget));
    step.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDesignStage(step.dataset.stageTarget);
      }
    });
  });

  uploadInput?.addEventListener("change", () => {
    if (isSketchGenerating) return;
    const file = uploadInput.files?.[0];
    const fileName = file?.name;
    if (uploadLabel) uploadLabel.textContent = uploadLabel.dataset.defaultText || "Tasarım görseli yükle";

    const previewImg = document.querySelector("[data-reference-preview]");
    const previewShell = document.querySelector("[data-reference-preview-shell]");
    const dropzone = document.querySelector("[data-upload-dropzone]");
    const hintSpan = document.querySelector("[data-upload-hint]");

    if (previewImg) {
      if (file && file.type.startsWith("image/")) {
        releaseReferencePreviewObjectUrl();
        const objectUrl = createStudioObjectUrl(file);
        referencePreviewObjectUrl = objectUrl;
        previewImg.src = objectUrl;
        previewImg.dataset.referenceFileName = file.name;
        delete previewImg.dataset.referenceDataUrl;
        delete previewImg.dataset.referenceThumbnailUrl;
        previewImg.hidden = false;
        previewShell?.removeAttribute("hidden");
        dropzone?.classList.add("has-preview");
        storeReferenceDataForFile(file, previewImg);
        if (hintSpan) hintSpan.textContent = currentUploadHintText();
      } else {
        releaseReferencePreviewObjectUrl();
        releaseImageElement(previewImg);
        delete previewImg.dataset.referenceDataUrl;
        delete previewImg.dataset.referenceFileName;
        delete previewImg.dataset.referenceThumbnailUrl;
        previewImg.hidden = true;
        previewShell?.setAttribute("hidden", "");
        dropzone?.classList.remove("has-preview");
        if (hintSpan) hintSpan.textContent = currentUploadHintText();
      }
    }

    setSketchStatus(
      fileName
        ? "Tasarım hazır. Önceki sonuçlar projede tutuldu; yeni görsel oluşturunca listeye eklenir."
        : "",
      "success"
    );
    queueActiveProjectSave();
  });

  const referenceDropzone = document.querySelector("[data-upload-dropzone]");
  if (referenceDropzone && uploadInput) {
    let dragDepth = 0;
    const clearDragState = () => {
      dragDepth = 0;
      referenceDropzone.classList.remove("is-dragover");
    };
    referenceDropzone.addEventListener("dragenter", (event) => {
      if (isSketchGenerating) return;
      event.preventDefault();
      dragDepth += 1;
      referenceDropzone.classList.add("is-dragover");
    });
    referenceDropzone.addEventListener("dragover", (event) => {
      if (isSketchGenerating) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });
    referenceDropzone.addEventListener("dragleave", () => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) referenceDropzone.classList.remove("is-dragover");
    });
    referenceDropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      clearDragState();
      if (isSketchGenerating) return;
      const file = event.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const transfer = new DataTransfer();
      transfer.items.add(file);
      uploadInput.files = transfer.files;
      uploadInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  document.querySelectorAll("[data-generate-sketches]").forEach((button) => {
    button.addEventListener("click", () => {
      generateSketches(button);
    });
  });

  document.querySelectorAll("[data-sketch-card]").forEach(bindSketchCard);

  saveDesignButton?.addEventListener("click", saveSelectedDesign);
  document.querySelector("[data-save-finish-design]")?.addEventListener("click", () => {
    if (saveCurrentProjectState()) {
      setFinishStatusMessage("Ürün görseli bu projeye kaydedildi.", "success");
    }
  });
  document.querySelectorAll("[data-save-mockup-design]").forEach((button) => {
    button.addEventListener("click", () => {
      if (saveCurrentProjectState()) {
        setMockupStatusMessage("Mockup bu projeye kaydedildi.", "success");
      }
    });
  });

  continueFormButton?.addEventListener("click", () => {
    if (continueFormButton.disabled) return;
    enterFinishStage();
  });

  document.querySelectorAll("[data-back-to-form]").forEach((button) => {
    button.addEventListener("click", exitFinishStage);
  });

  document.querySelectorAll("[data-generate-finish]").forEach((button) => {
    button.addEventListener("click", () => {
      selectStageGenerationCount(button, "finish-count");
      generateFinishResults();
    });
  });

  document.querySelectorAll("[data-continue-mockup]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      enterMockupStage();
    });
  });

  document.querySelectorAll("[data-back-to-finish]").forEach((button) => {
    button.addEventListener("click", exitMockupStage);
  });

  document.querySelectorAll("[data-generate-mockup]").forEach((button) => {
    button.addEventListener("click", () => {
      selectStageGenerationCount(button, "mockup-count");
      generateMockupResults();
    });
  });

  document.querySelector("[data-direct-form-upload]")?.addEventListener("change", handleDirectFormUpload);
  document.querySelector("[data-direct-finish-upload]")?.addEventListener("change", handleDirectFinishUpload);
  document.querySelectorAll("[data-design-source-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleDesignSourcePanel(button.dataset.designSourceToggle));
  });
  setupStageSourceSquares();
  document.querySelector("[data-ring-mold-info]")?.addEventListener("click", toggleRingMoldReference);
  syncRingMoldSizeOptions();
}

const STAGE_SOURCE_KEYS = ["finish", "mockup", "manken"];

function stageSquareParts(stageKey) {
  const panel = document.querySelector(`[data-design-source-panel="${stageKey}"]`);
  const square = panel?.closest(".handoff-preview-square");
  return {
    panel,
    square,
    slot: square?.querySelector(".handoff-preview-slot"),
    changeBtn: square?.querySelector("[data-handoff-change]"),
  };
}

// When nothing is selected the square shows the picker grid directly; once a
// design is chosen it shows the preview plus a "Değiştir" chip that re-opens
// the picker. Keeps selection in one compact square (no extra scrolling).
function syncStageSourceSquare(stageKey, { keepPickerOpen = false } = {}) {
  const { panel, slot, changeBtn } = stageSquareParts(stageKey);
  if (!panel || !slot) return;
  const hasSelection = slot.children.length > 0;
  if (changeBtn) changeBtn.hidden = !hasSelection;
  if (keepPickerOpen) return;
  if (hasSelection) {
    panel.hidden = true;
  } else {
    renderDesignSourcePanel(stageKey);
    panel.hidden = false;
  }
}

function setupStageSourceSquares() {
  STAGE_SOURCE_KEYS.forEach((stageKey) => {
    const { slot } = stageSquareParts(stageKey);
    if (!slot) return;
    // Secondary affordance: clicking the filled preview also opens the picker.
    slot.addEventListener("click", () => {
      if (slot.children.length > 0) toggleDesignSourcePanel(stageKey);
    });
    // Auto-react to selection/clearing of the preview slot.
    new MutationObserver(() => syncStageSourceSquare(stageKey)).observe(slot, {
      childList: true,
    });
  });
}

function openDesignStage(stageKey) {
  switchTab("projeler", { showProjectLibrary: false });
  showProjectWorkspace();

  if (stageKey === "sketch") {
    openSketchStage();
    return;
  }

  if (stageKey === "finish") {
    enterFinishStage({ allowMissing: true });
    syncStageSourceSquare("finish");
    return;
  }

  if (stageKey === "mockup") {
    enterMockupStage({ allowMissing: true });
    syncStageSourceSquare("mockup");
    return;
  }

  if (stageKey === "manken") {
    enterMankenStage({ allowMissing: true });
    syncStageSourceSquare("manken");
  }
}

function openSketchStage() {
  const sketchPanel = document.querySelector('[data-stage-panel="sketch"]');
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  const mockupPanel = document.querySelector('[data-stage-panel="mockup"]');
  const mankenPanel = document.querySelector('[data-stage-panel="manken"]');

  newDesignStudio?.classList.remove("is-form-stage", "is-finish-stage", "is-mockup-stage", "is-manken-stage");
  sketchPanel?.removeAttribute("hidden");
  finishPanel?.setAttribute("hidden", "");
  mockupPanel?.setAttribute("hidden", "");
  mankenPanel?.setAttribute("hidden", "");
  setWorkflowForSketchStage();
  applyStageRestrictions();
  scheduleManagedImageVisibilityRefresh();
  queueActiveProjectSave();
}

function showSketchResults() {
  if (!newDesignStudio) return;

  newDesignStudio.classList.add("has-results");
  if (newDesignStudio.classList.contains("is-finish-stage")) setWorkflowForFinishStage();
  else setWorkflowForSketchStage();
  applyStageRestrictions();
  updateVisibleSketchCards();
  document.querySelectorAll("[data-sketch-card]").forEach((card) => {
    card.classList.remove("is-selected");
  });
  setFormStepReady(false);
  queueActiveProjectSave();
}

const RESULT_LOADING_CONFIG = {
  finish: {
    gridSelector: "[data-finish-result-grid]",
    loadingText: "Ürün görseli hazırlanıyor",
    resultClass: "has-finish-result",
    resultSelector: "[data-finish-result-card]",
    stageLabel: "Görsel Üretimi",
  },
  mockup: {
    gridSelector: "[data-mockup-result-grid]",
    loadingText: "Vitrin görseli hazırlanıyor",
    resultClass: "has-mockup-result",
    resultSelector: "[data-mockup-result-card]",
    stageLabel: "Mockup / Manken",
  },
  sketch: {
    gridSelector: "[data-sketch-grid]",
    loadingText: "Tasarım görseli hazırlanıyor",
    resultClass: "has-results",
    resultSelector: "[data-sketch-card]",
    stageLabel: "Ürün / Tasarım",
  },
};

// mockup/manken aynı grid hook'unu (data-mockup-result-grid) iki ayrı panelde taşır;
// yükleme kartlarını üretimin ait olduğu aşama paneline yerleştir.
function resultLoadingGrid(config, stageKey, options = {}) {
  const scope = stageKey === "mockup"
    ? visualizationPanelForStage(options.stage) || activeVisualizationPanel() || document
    : document;
  return config ? scope.querySelector(config.gridSelector) : null;
}

function showResultLoading(stageKey, count = 1, options = {}) {
  const config = RESULT_LOADING_CONFIG[stageKey];
  const grid = resultLoadingGrid(config, stageKey, options);
  if (!config || !grid || !newDesignStudio) return;

  removeResultLoading(stageKey, options);

  if (stageKey === "sketch") {
    hideEmptySketchCards();
  }

  const safeCount = Math.max(1, Number.parseInt(count, 10) || 1);
  const loadingCards = Array.from({ length: safeCount }, (_, index) => createResultLoadingCard(stageKey, config, index));
  grid.prepend(...loadingCards);
  grid.hidden = false;
  syncResultStageVisibility(stageKey, options);
}

function createResultLoadingCard(stageKey, config, index) {
  const card = document.createElement("article");
  card.className = `sketch-card result-loading-card result-loading-card--${stageKey}`;
  card.dataset.resultLoading = stageKey;
  card.setAttribute("aria-busy", "true");
  card.tabIndex = -1;

  const visual = document.createElement("div");
  visual.className = "result-loading-visual";
  visual.setAttribute("aria-hidden", "true");

  const spinner = document.createElement("span");
  spinner.className = "result-spinner";

  const status = document.createElement("span");
  status.className = "result-loading-status";
  status.textContent = "Görsel üretiliyor";

  visual.append(spinner, status);

  const body = document.createElement("div");
  body.className = "sketch-body";

  const title = document.createElement("strong");
  title.textContent = `${config.loadingText} ${String(index + 1).padStart(2, "0")}`;

  const subtitle = document.createElement("span");
  subtitle.textContent = `${config.stageLabel} · Görsel birazdan burada belirecek`;

  body.append(title, subtitle);
  card.append(visual, body);
  return card;
}

function removeResultLoading(stageKey, options = {}) {
  const config = RESULT_LOADING_CONFIG[stageKey];
  const grid = resultLoadingGrid(config, stageKey, options);
  if (!config || !grid) return;

  grid.querySelectorAll(`[data-result-loading="${stageKey}"]`).forEach((card) => card.remove());
  syncResultStageVisibility(stageKey, options);
}

function hideEmptySketchCards() {
  document.querySelectorAll("[data-sketch-card]").forEach((card) => {
    card.classList.toggle("is-hidden", !sketchCardHasImage(card));
  });
}

function syncResultStageVisibility(stageKey, options = {}) {
  const config = RESULT_LOADING_CONFIG[stageKey];
  const grid = resultLoadingGrid(config, stageKey, options);
  if (!config || !grid || !newDesignStudio) return;

  const hasLoading = Boolean(grid.querySelector(`[data-result-loading="${stageKey}"]`));
  const hasResult =
    stageKey === "sketch"
      ? Array.from(document.querySelectorAll("[data-sketch-card]")).some(sketchCardHasImage)
      : Boolean(grid.querySelector(config.resultSelector));

  if (stageKey !== "sketch") {
    grid.hidden = !(hasLoading || hasResult);
  }

  if (stageKey === "mockup") {
    syncMockupResultUi();
    return;
  }

  newDesignStudio.classList.toggle(config.resultClass, hasLoading || hasResult);
}

async function generateSketches(triggerButton) {
  if (isSketchGenerating) return;
  const { creditCost, draftCount, resolution } = selectedDraftConfig(triggerButton);
  const generationLabel = `${draftCount} tasarım görseli oluşturma`;
  if (sketchCostSummary) sketchCostSummary.textContent = `${creditCost} kredi`;
  if (!ensureCreditsForGeneration({ amount: creditCost, label: generationLabel, stage: "sketch" })) return;

  let referenceSource;
  try {
    referenceSource = await resolveSketchReferenceSource();
  } catch (error) {
    setSketchStatus(error.message || "Önce bir tasarım görseli yüklemelisin.", "error");
    return;
  }

  const { fileName, imageDataUrl, sourceImageUrl } = referenceSource;
  const designProfile = selectedDesignProfile();
  const job = createGenerationJob({
    count: draftCount,
    creditCost,
    label: generationLabel,
    metadata: {
      designMode: designProfile.designModeValue,
      designModeLabel: designProfile.designModeLabel,
      fileName,
      product: designProfile.productValue,
      productLabel: designProfile.productLabel,
      productShape: designProfile.productShapeValue,
      productShapeLabel: designProfile.productShapeLabel,
      sourceImageUrl: sourceImageUrl || safeSavedSourceImageUrl(imageDataUrl),
    },
    stage: "sketch",
  });

  queueActiveProjectSave();
  setGeneratingState(true);
  setFormStepReady(false);
  showResultLoading("sketch", draftCount);
  publishPendingSavedDesigns(job, buildPendingSavedDesignEntries(job));
  setSketchStatus(
    isDevMode()
      ? "Test modu aktif. API çağrısı yapmadan örnek tasarım görselleri hazırlanıyor..."
      : "Tasarım görseli oluşturuluyor. Bu biraz sürebilir..."
  );

  // Dev mode bypass — return mock sketches without hitting fal.ai
  if (isDevMode()) {
    try {
      await new Promise((r) => setTimeout(r, 600));
      const profileFields = designProfileFormFields(designProfile);
      const sketchMetadata = sketchMetadataFieldsFromJob(job);
      const mockImages = Array.from({ length: draftCount }, (_, i) => ({
        ...profileFields,
        ...sketchMetadata,
        url: buildDevSketchMock(i + 1),
        label: `Test Tasarım ${String(i + 1).padStart(2, "0")}`,
      }));
      renderSketchImages(mockImages);
      const devSaveEntries = mockImages.map((image, index) => ({
        ...profileFields,
        ...sketchMetadata,
        imageUrl: image.url,
        projectId: generationProjectId(job),
        projectTitle: generationProjectTitle(job),
        sourceImageUrl: job.metadata?.sourceImageUrl || "",
        sourceFileName: job.metadata?.fileName || "",
        sourceStage: "sketch",
        stageSourceUrl: sketchStageSourceUrlFromImage(image),
        stage: "AI Tasarım Görseli",
        title: normalizeSketchLabel(image.label, index),
      }));
      autoSaveGeneratedDesigns(devSaveEntries, { job });
      addSavedDesigns(devSaveEntries.map((entry, index) => ({
        ...entry,
        autoSaved: true,
        generatedBy: "ai",
        pendingIndex: index,
      })));
      revealActiveTabContent("tasarimlarim");
      spendCredits({ amount: creditCost, label: generationLabel, stage: "sketch" });
      setSketchStatus(
        `Test modu — örnek tasarım görselleri gösteriliyor. ${creditCost} kredi harcandı.`,
        "success"
      );
    } catch (error) {
      removePendingSavedDesigns(job.id);
      removeResultLoading("sketch");
      setFormStepReady(Boolean(getSelectedSketchInfo()));
      setSketchStatus(error.message || "Tasarım görseli oluşturulamadı.", "error");
    } finally {
      setGeneratingState(false);
    }
    return;
  }

  try {
    const result = await submitGenerationJob({
      apiUrl: sketchApiUrl(),
      job,
      requestPayload: {
        designMode: designProfile.designModeValue,
        draftCount,
        imageDataUrl,
        product: designProfile.productValue,
        productShape: designProfile.productShapeValue,
        resolution,
      },
    });
    await completeSketchGeneration(result.job, result.payload);
  } catch (error) {
    if (job?.id) removePendingSavedDesigns(job.id);
    removeResultLoading("sketch");
    setFormStepReady(Boolean(getSelectedSketchInfo()));
    queueActiveProjectSave();
    setSketchStatus(error.message || "Tasarım görseli oluşturulamadı.", "error");
  } finally {
    setGeneratingState(false);
  }
}

async function completeSketchGeneration(job, payload, options = {}) {
  const images = payload.images || [];
  if (!images.length) throw new Error("Tasarım görseli oluşturuldu ancak görsel döndürülmedi.");
  const generatedAt = generationResultTimestamp(job, payload);
  const profileFields = designProfileFieldsFromGenerationMetadata(job.metadata || {});
  const sketchMetadata = sketchMetadataFieldsFromJob(job);
  const profiledImages = images.map((image) => ({
    ...profileFields,
    ...image,
    generatedAt: validIsoDate(image.generatedAt || image.createdAt || image.savedAt || "") || generatedAt,
    ...sketchMetadata,
    profileFields,
  }));

  const shouldRenderToWorkspace = isGenerationForActiveProject(job);
  const existingSketchCount = shouldRenderToWorkspace
    ? sketchResultCount()
    : projectSketchResultCount(generationProjectId(job));
  if (shouldRenderToWorkspace) {
    renderSketchImages(profiledImages);
  }
  persistSketchImagesToProject(job, profiledImages);
  const saveEntries = profiledImages.map((image, index) => ({
    ...profileFields,
    ...sketchMetadataFieldsFromSource(image),
    ...storageFieldsFromSource(image),
    imageUrl: image.url,
    projectId: generationProjectId(job),
    projectTitle: generationProjectTitle(job),
    sourceImageUrl: job.metadata?.sourceImageUrl || "",
    sourceFileName: job.metadata?.fileName || "",
    sourceStage: "sketch",
    stageSourceUrl: sketchStageSourceUrlFromImage(image),
    stage: "AI Tasarım Görseli",
    title: normalizeSketchLabel(image.label, existingSketchCount + index),
  }));
  autoSaveGeneratedDesigns(saveEntries, { job });
  addSavedDesigns(saveEntries.map((entry, index) => ({
    ...entry,
    autoSaved: true,
    generatedBy: "ai",
    pendingIndex: index,
  })));
  revealActiveTabContent("tasarimlarim");
  const sketchProjectId = generationProjectId(job);
  if (sketchProjectId) {
    const sketchProject = readProjects().find((p) => p.id === sketchProjectId);
    if (sketchProject) backfillProjectImagesToSavedDesigns(sketchProject);
  }
  spendCredits({ amount: job.creditCost, jobId: job.id, label: job.label, stage: "sketch" });
  await finalizeGenerationDelivery(job);
  if (shouldRenderToWorkspace) {
    setSketchStatus(
      `Tasarım görselleri hazır. ${job.creditCost} kredi harcandı.${options.recovered ? " Sayfa yenilendikten sonra sonuç geri alındı." : ""} Beğendiğin sonucu seçip devam edebilirsin.${formatStorageWarningStatusSuffix(payload)}`,
      "success"
    );
  }
  setGeneratingState(false);
}

async function resolveSketchReferenceSource() {
  const file = uploadInput?.files?.[0];

  if (file) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Lütfen JPEG, PNG veya WebP türünde bir görsel yükle.");
    }

    const imageDataUrl = await readFileAsDataUrl(file);
    const generationImageDataUrl = await createGenerationReferenceDataUrl(imageDataUrl) || imageDataUrl;
    const storedImageDataUrl = await createStoredReferenceDataUrl(imageDataUrl) || "";
    const sourceImageUrl = await savedSourceImageUrlFromImageUrl(storedImageDataUrl || generationImageDataUrl);
    const preview = document.querySelector("[data-reference-preview]");
    if (preview) {
      preview.dataset.referenceDataUrl = storedImageDataUrl;
      preview.dataset.referenceFileName = file.name;
      preview.dataset.referenceThumbnailUrl = sourceImageUrl;
    }
    writeSourceThumbnail(file.name, sourceImageUrl);
    queueActiveProjectSave();
    return {
      fileName: file.name,
      imageDataUrl: generationImageDataUrl,
      sourceImageUrl,
    };
  }

  const reference = collectReferenceState();
  const imageDataUrl = reference.imageDataUrl || (reference.previewUrl?.startsWith("data:image/") ? reference.previewUrl : "");

  if (imageDataUrl) {
    const sourceImageUrl = await savedSourceImageUrlFromImageUrl(imageDataUrl);
    return {
      fileName: reference.fileName || "Kaydedilen tasarım",
      imageDataUrl,
      sourceImageUrl,
    };
  }

  const preview = document.querySelector("[data-reference-preview]");
  const previewUrl = preview?.hidden ? "" : preview?.getAttribute("src") || "";
  if (previewUrl?.startsWith("blob:")) {
    const blobDataUrl = await imageUrlToDataUrl(previewUrl);
    const storedBlobDataUrl = await createStoredReferenceDataUrl(blobDataUrl) || blobDataUrl;
    return {
      fileName: reference.fileName || "Kaydedilen tasarım",
      imageDataUrl: storedBlobDataUrl,
      sourceImageUrl: await savedSourceImageUrlFromImageUrl(blobDataUrl),
    };
  }

  throw new Error("Önce bir tasarım görseli yüklemelisin.");
}

function buildDevSketchMock(index) {
  const variants = [
    `<path d='M100 190 Q160 80 220 190' fill='none' stroke='#1a1a1a' stroke-width='2.6' stroke-linecap='round'/>
     <circle cx='160' cy='150' r='6' fill='#1a1a1a'/>`,
    `<path d='M110 130 L160 90 L210 130 L210 200 L110 200 Z' fill='none' stroke='#1a1a1a' stroke-width='2.6' stroke-linejoin='round'/>
     <circle cx='160' cy='170' r='8' fill='none' stroke='#1a1a1a' stroke-width='2.4'/>`,
    `<path d='M110 160 Q160 100 210 160 Q160 220 110 160 Z' fill='none' stroke='#1a1a1a' stroke-width='2.6' stroke-linejoin='round'/>
     <path d='M140 160 L180 160' stroke='#1a1a1a' stroke-width='2'/>`,
    `<path d='M120 200 Q160 100 200 200' fill='none' stroke='#1a1a1a' stroke-width='2.6' stroke-linecap='round'/>
     <path d='M140 180 Q160 140 180 180' fill='none' stroke='#1a1a1a' stroke-width='2.2' stroke-linecap='round'/>
     <circle cx='160' cy='130' r='5' fill='#1a1a1a'/>`,
  ];
  const inner = variants[(index - 1) % variants.length];
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'>
        <rect width='320' height='320' fill='#fff'/>
        ${inner}
        <text x='160' y='300' font-family='serif' font-size='12' fill='#7a5a3b' text-anchor='middle'>TEST · Tasarım ${index}</text>
      </svg>`
    )
  );
}

function bindSketchCard(card) {
  if (!card || card.dataset.sketchBound === "1") return;

  card.dataset.sketchBound = "1";
  card.addEventListener("click", () => selectSketch(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectSketch(card);
    }
  });
}

function ensureSketchCardCount(targetCount) {
  const grid = document.querySelector("[data-sketch-grid]");
  const template = document.querySelector("[data-sketch-card]");
  if (!grid || !template) return;

  while (grid.querySelectorAll("[data-sketch-card]").length < targetCount) {
    const index = grid.querySelectorAll("[data-sketch-card]").length;
    const card = template.cloneNode(true);
    delete card.dataset.sketchBound;
    card.dataset.draftExtra = "1";
    resetSketchCard(card, index);
    bindSketchCard(card);
    grid.append(card);
  }
}

function resetSketchCard(card, index) {
  const thumb = card.querySelector(".sketch-thumb");
  const imageEl = card.querySelector("[data-sketch-image]");

  card.classList.remove("is-selected", "is-hidden");
  delete card.dataset.displayUrl;
  delete card.dataset.imageUrl;
  delete card.dataset.imageLabel;
  delete card.dataset.stageSourceUrl;
  clearDesignProfileDataset(card);
  clearSketchMetadataDataset(card);
  clearStorageDataset(card);
  setSketchCardSlotLabel(card, index);
  if (imageEl) {
    releaseImageElement(imageEl);
    imageEl.hidden = true;
  }
  thumb?.classList.remove("has-image");
}

function setSketchCardSlotLabel(card, index) {
  const title = card.querySelector(".sketch-body strong");
  const slotLabel = `Tasarım ${String(index + 1).padStart(2, "0")}`;
  if (title && !card.dataset.imageLabel) {
    title.textContent = slotLabel;
  }
  if (!card.dataset.imageLabel) card.removeAttribute("aria-label");
}

function setSketchCardImage(card, image, index) {
  const imageEl = card.querySelector("[data-sketch-image]");
  const thumb = card.querySelector(".sketch-thumb");
  const title = card.querySelector(".sketch-body strong");
  const subtitle = card.querySelector(".sketch-body span");
  const label = normalizeSketchLabel(image.label, index);
  const displayUrl = safePersistedImageUrl(image.url || image.displayUrl || "", "imageUrl");
  const stageSourceUrl = sketchStageSourceUrlFromImage(image) || displayUrl;

  card.dataset.imageUrl = displayUrl;
  card.dataset.stageSourceUrl = stageSourceUrl;
  card.dataset.imageLabel = label;
  writeDesignProfileDataset(card, image);
  writeSketchMetadataDataset(card, image);
  writeStorageDataset(card, image);
  if (title) title.textContent = label;
  const subtitleText = `Kazıma şablonu · ${image.designModeLabel || "Yüzeysel kazıma"}`;
  if (subtitle) subtitle.textContent = subtitleText;
  card.setAttribute("aria-label", `${label}. ${subtitleText}`);
  if (imageEl) {
    if ((imageEl.getAttribute("data-managed-src") || imageEl.getAttribute("src") || "") !== displayUrl) releaseImageElement(imageEl);
    setManagedImageSrc(imageEl, displayUrl);
    imageEl.hidden = false;
  }
  thumb?.classList.add("has-image");
}

function sketchStageSourceUrlFromImage(image = {}) {
  return safePersistedImageUrl(
    image.stageSourceUrl || image.sourceSketchUrl || image.sourceUrl || image.url || "",
    "stageSourceUrl"
  );
}

function persistSketchImagesToProject(job, images) {
  const projectId = generationProjectId(job);
  if (!projectId) return false;
  if (activeProjectId === projectId) return flushProjectSave();

  const incomingImages = Array.isArray(images)
    ? images.filter((image) => image?.url)
    : [];
  if (!incomingImages.length) return false;

  return patchProjectState(
    projectId,
    (state) => {
      const sketches = Array.isArray(state.sketches) ? [...state.sketches] : [];
      const seenUrls = new Set(sketches.map((sketch) => sketch.url).filter(Boolean));

      incomingImages.forEach((image) => {
        if (seenUrls.has(image.url)) return;
        const index = sketches.length;
        seenUrls.add(image.url);
        sketches.push({
          ...designProfileFieldsFromSource(image),
          ...sketchMetadataFieldsFromSource(image),
          ...storageFieldsFromSource(image),
          hidden: false,
          index,
          label: normalizeSketchLabel(image.label, index),
          selected: false,
          subtitle: "",
          stageSourceUrl: sketchStageSourceUrlFromImage(image),
          url: image.url,
        });
      });

      return {
        ...state,
        sketches,
        stage: maxProjectStage(state.stage, "sketch"),
      };
    },
    {
      createdAt: job.createdAt,
      title: generationProjectTitle(job),
    }
  );
}

function sketchCardHasImage(card) {
  return Boolean(card?.dataset.imageUrl || card?.querySelector("[data-sketch-image]")?.getAttribute("src"));
}

function sketchResultCount() {
  return Array.from(document.querySelectorAll("[data-sketch-card]")).filter(sketchCardHasImage).length;
}

function projectSketchResultCount(projectId) {
  const state = readProjects().find((project) => project.id === projectId)?.state;
  return Array.isArray(state?.sketches) ? state.sketches.filter((sketch) => sketch.url).length : 0;
}

function selectSketch(selectedCard) {
  if (!newDesignStudio) return;

  const previousCard = document.querySelector("[data-sketch-card].is-selected:not(.is-hidden)");
  releaseDirectFinishForm();
  clearStageUploadInput("direct-form");
  updateStageUploadPreview("direct-form", "", "");
  if (previousCard && previousCard !== selectedCard) {
    clearFinishResults();
  }
  newDesignStudio.classList.add("has-results");
  document.querySelectorAll("[data-sketch-card]").forEach((card) => {
    card.classList.toggle("is-selected", card === selectedCard);
  });
  setFormStepReady(true);
  flushProjectSave();
}

function setWorkflowStepState(stepKey, state) {
  const step = document.querySelector(`[data-workflow-step="${stepKey}"]`);
  if (!step) return;

  step.classList.toggle("is-active", state === "active");
  step.classList.toggle("is-unlocked", state === "unlocked");
  step.classList.toggle("is-locked", state === "locked");
}

function setWorkflowForSketchStage() {
  setWorkflowStepState("sketch", "active");
  setWorkflowStepState("product", "unlocked");
  setWorkflowStepState("mockup", "unlocked");
  setWorkflowStepState("manken", "unlocked");
}

function setWorkflowForFinishStage() {
  setWorkflowStepState("sketch", "unlocked");
  setWorkflowStepState("product", "active");
  setWorkflowStepState("mockup", "unlocked");
  setWorkflowStepState("manken", "unlocked");
}

function setWorkflowForMockupStage() {
  setWorkflowStepState("sketch", "unlocked");
  setWorkflowStepState("product", "unlocked");
  setWorkflowStepState("mockup", "active");
  setWorkflowStepState("manken", "unlocked");
}

function setWorkflowForMankenStage() {
  setWorkflowStepState("sketch", "unlocked");
  setWorkflowStepState("product", "unlocked");
  setWorkflowStepState("mockup", "unlocked");
  setWorkflowStepState("manken", "active");
}

// Görsel panelini paylaşan kaynak-seçim akışlarında, aktif aşamaya göre doğru adımı
// vurgular (mockup mu manken mi).
function setWorkflowForVisualizationStage() {
  if (newDesignStudio?.classList.contains("is-manken-stage")) setWorkflowForMankenStage();
  else setWorkflowForMockupStage();
}

function applyStageRestrictions() {
  const sketchPanel = document.querySelector('[data-stage-panel="sketch"]');
  sketchPanel?.classList.toggle("is-stage-locked", isSketchGenerating);

  const directFormDropzone = document.querySelector("[data-direct-form-dropzone]");
  if (directFormDropzone) directFormDropzone.hidden = false;

  const directFinishDropzone = document.querySelector("[data-direct-finish-dropzone]");
  if (directFinishDropzone) directFinishDropzone.hidden = false;
}

function setFormStepReady(isReady) {
  if (continueFormButton) {
    continueFormButton.disabled = !isReady;
    continueFormButton.classList.toggle("is-disabled", !isReady);
  }

  if (saveDesignButton) {
    saveDesignButton.disabled = !isReady;
  }
}

function renderSketchImages(images) {
  if (!newDesignStudio) return;

  const incomingImages = Array.isArray(images)
    ? images.filter((image) => image && typeof image.url === "string" && image.url.trim())
    : [];
  if (!incomingImages.length) return;

  removeResultLoading("sketch");
  newDesignStudio.classList.add("has-results");
  const existingImageCount = sketchResultCount();
  ensureSketchCardCount(existingImageCount + incomingImages.length);

  document.querySelectorAll("[data-sketch-card]").forEach((card, index) => {
    setSketchCardSlotLabel(card, index);
    card.classList.toggle("is-hidden", !sketchCardHasImage(card));
  });

  const cards = Array.from(document.querySelectorAll("[data-sketch-card]"));
  const emptyCards = cards.filter((card) => !sketchCardHasImage(card));
  const filledCards = [];
  incomingImages.forEach((image, offset) => {
    const slotIndex = existingImageCount + offset;
    const card = emptyCards[offset];
    if (!card) return;
    setSketchCardImage(card, image, slotIndex);
    card.classList.remove("is-hidden");
    filledCards.push(card);
  });

  // Yeni üretilen görseller her zaman en üstte kalsın.
  const sketchGrid = document.querySelector("[data-sketch-grid]");
  if (sketchGrid && filledCards.length) {
    sketchGrid.prepend(...filledCards);
  }

  setFormStepReady(Boolean(getSelectedSketchInfo()));
  flushProjectSave();
}

function clearSketchResults() {
  removeResultLoading("sketch");
  newDesignStudio?.classList.remove("has-results");
  clearFinishResults();
  document.querySelectorAll("[data-sketch-card]").forEach((card, index) => {
    if (index >= INITIAL_SKETCH_CARD_COUNT) {
      removeNodeReleasing(card);
      return;
    }

    resetSketchCard(card, index);
  });
  setFormStepReady(false);
  queueActiveProjectSave();
}

function setGeneratingState(isGenerating) {
  isSketchGenerating = Boolean(isGenerating);
  document.querySelectorAll("[data-generate-sketches]").forEach((button) => {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent;
    }

    button.disabled = isGenerating;
    button.classList.toggle("is-disabled", isGenerating);
    button.textContent = isGenerating ? "Tasarım görseli oluşturuluyor..." : button.dataset.originalLabel;
  });
  applyStageRestrictions();
}

// Arayüzde gereksiz yazı kalabalığı olmasın: durum satırları yalnızca hata, uyarı ve
// "notice" tonunu gösterir. Bilgi/başarı mesajları (yükleniyor, hazır, kaydedildi...)
// gösterilmez; ilerleme zaten yükleme kartları ve butonlarla anlaşılır. "notice",
// kullanıcının başka bir yerde işlem yapması gereken önemli sonuçlar içindir.
function isVisibleStatusTone(tone) {
  return tone === "error" || tone === "warning" || tone === "notice";
}

function setSketchStatus(message, tone = "") {
  if (!sketchStatus) return;

  const visible = isVisibleStatusTone(tone);
  sketchStatus.textContent = visible ? message || "" : "";
  sketchStatus.classList.toggle("is-error", visible && tone === "error");
  sketchStatus.classList.toggle("is-success", visible && tone === "notice");
  sketchStatus.classList.toggle("is-warning", visible && tone === "warning");
}

function safeSavedSourceImageUrl(value) {
  return safePersistedImageUrl(value, "sourceImageUrl");
}

async function savedSourceImageUrlFromImageUrl(value) {
  const imageUrl = String(value || "").trim();
  if (!imageUrl) return "";

  const safeUrl = safeSavedSourceImageUrl(imageUrl);
  if (safeUrl) return safeUrl;

  if (imageUrl.startsWith("data:image/") || imageUrl.startsWith("blob:")) {
    return createSavedSourceThumbnail(imageUrl);
  }

  return "";
}

function createSavedSourceThumbnail(imageUrl) {
  return createResizedImageDataUrl(imageUrl, MAX_SOURCE_THUMBNAIL_SIDE, 0.76);
}

function createStoredReferenceDataUrl(imageUrl) {
  return createResizedImageDataUrl(imageUrl, MAX_STORED_REFERENCE_IMAGE_SIDE, 0.78);
}

async function persistedStageUploadImageUrl(file) {
  if (!file) return "";

  try {
    const imageDataUrl = await readFileAsDataUrl(file);
    const storedDataUrl = await createStoredReferenceDataUrl(imageDataUrl);
    return safePersistedImageUrl(storedDataUrl || "", "imageUrl");
  } catch {
    return "";
  }
}

function createGenerationReferenceDataUrl(imageUrl) {
  return createResizedImageDataUrl(imageUrl, MAX_GENERATION_REFERENCE_IMAGE_SIDE, 0.86);
}

function createResizedImageDataUrl(imageUrl, maxSide, quality) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || maxSide, image.naturalHeight || maxSide));
      const width = Math.max(1, Math.round((image.naturalWidth || maxSide) * scale));
      const height = Math.max(1, Math.round((image.naturalHeight || maxSide) * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve("");
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      releaseCanvas(canvas);
      image.removeAttribute("src");
      resolve(dataUrl);
    });
    image.addEventListener("error", () => resolve(""));
    image.src = imageUrl;
  });
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Kaydedilen tasarım görseli okunamadı.");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Kaydedilen tasarım görseli okunamadı.")));
    reader.readAsDataURL(blob);
  });
}

async function savedSourceImageUrlFromFormInfo(formInfo = {}) {
  return savedSourceImageUrlFromImageUrl(formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "");
}

async function savedSourceImageUrlFromFinishInfo(finishInfo = {}) {
  return savedSourceImageUrlFromImageUrl(finishInfo.finishImageUrl || finishInfo.sketchUrl || finishInfo.sourceFormUrl || "");
}

function addSavedDesigns(entries) {
  const savedDesigns = readSavedDesigns();
  const seenImageUrls = new Set(savedDesigns.map((design) => design.imageUrl));
  const seenJobSlots = new Set(savedDesigns.map(savedDesignJobSlotKey).filter(Boolean));
  const now = Date.now();
  let duplicateCount = 0;

  const newDesigns = entries.reduce((accumulator, entry, index) => {
    const imageUrl = normalizedSavedDesignImageUrl(entry);
    const jobSlotKey = savedDesignJobSlotKey(entry);

    if (!imageUrl) {
      return accumulator;
    }

    if (seenImageUrls.has(imageUrl) || (jobSlotKey && seenJobSlots.has(jobSlotKey))) {
      duplicateCount += 1;
      return accumulator;
    }

    seenImageUrls.add(imageUrl);
    if (jobSlotKey) seenJobSlots.add(jobSlotKey);
    accumulator.push(createSavedDesignFromEntry(entry, index, now));

    return accumulator;
  }, []);

  if (!newDesigns.length) {
    return { added: 0, duplicateCount, ok: true };
  }

  const nextDesigns = [...newDesigns, ...savedDesigns].slice(0, SAVED_DESIGN_LIMIT);

  if (!writeSavedDesigns(nextDesigns)) {
    return { added: 0, duplicateCount, ok: false };
  }

  renderSavedDesigns(nextDesigns);
  return { added: newDesigns.length, duplicateCount, ok: true };
}

function createSavedDesignFromEntry(entry, index, now = Date.now()) {
  const projectId = entry.projectId || activeProjectId || "";
  return {
    ...currentStudioOwnerFields(),
    ...designProfileFieldsFromSource(entry),
    ...storageFieldsFromSource(entry),
    autoSaved: Boolean(entry.autoSaved),
    createdAt: entry.createdAt || entry.generatedAt || new Date(now + index).toISOString(),
    generationJobId: entry.generationJobId || entry.pendingJobId || "",
    generatedAt: entry.generatedAt || entry.createdAt || "",
    generatedBy: entry.generatedBy || "",
    id: entry.id || `ff-design-${now}-${index}`,
    imageUrl: normalizedSavedDesignImageUrl(entry),
    isLoading: false,
    metalLabel: entry.metalLabel || "",
    metalValue: entry.metalValue || "",
    pendingIndex: Number.isFinite(Number(entry.pendingIndex)) ? Number(entry.pendingIndex) : null,
    pendingJobId: "",
    projectId,
    projectTitle: entry.projectTitle || projectTitleById(projectId) || "",
    sourceFileName: entry.sourceFileName || uploadInput?.files?.[0]?.name || "",
    sourceImageUrl: safeSavedSourceImageUrl(entry.sourceImageUrl || entry.previousImageUrl || ""),
    sourceStage: entry.sourceStage || "",
    sourceTitle: entry.sourceTitle || entry.sourceFileName || "",
    stage: entry.stage || "AI Tasarım",
    stageSourceUrl: safePersistedImageUrl(entry.stageSourceUrl || entry.sourceSketchUrl || entry.imageUrl || entry.url || "", "stageSourceUrl"),
    status: "ready",
    surfaceLabel:
      entry.surfaceLabel ||
      DESIGN_MODE_OPTIONS[entry.designModeValue]?.surfaceLabel ||
      entry.designModeLabel ||
      "",
    surfaceValue: entry.surfaceValue || entry.designModeValue || "",
    title: entry.title || `Tasarım ${String(index + 1).padStart(2, "0")}`,
  };
}

function normalizedSavedDesignImageUrl(entry) {
  return safePersistedImageUrl(entry?.imageUrl || entry?.url || "", "imageUrl");
}

function autoSaveGeneratedDesigns(entries, options = {}) {
  const jobId = String(options.job?.id || options.job?.clientJobId || "").trim();
  const autoSavedEntries = entries.map((entry, index) => ({
    ...entry,
    autoSaved: true,
    generationJobId: entry.generationJobId || jobId,
    generatedBy: "ai",
    pendingIndex: Number.isFinite(Number(entry.pendingIndex)) ? Number(entry.pendingIndex) : index,
  }));

  if (options.job?.id) {
    return resolvePendingSavedDesigns(options.job, autoSavedEntries);
  }

  return addSavedDesigns(autoSavedEntries);
}

function publishPendingSavedDesigns(job, entries = []) {
  const result = addPendingSavedDesigns(job, entries);
  revealActiveTabContent("tasarimlarim");
  return result;
}

function addPendingSavedDesigns(job, entries = []) {
  const pendingJob = sanitizePendingGeneration(job);
  if (!pendingJob?.id) return { added: 0, duplicateCount: 0, ok: true };

  const safeEntries = Array.isArray(entries) && entries.length
    ? entries
    : buildPendingSavedDesignEntries(pendingJob);
  const now = Date.now();
  const savedDesigns = readSavedDesigns().filter((design) => design.pendingJobId !== pendingJob.id);
  const pendingDesigns = safeEntries.slice(0, Math.max(1, pendingJob.count)).map((entry, index) => ({
    ...currentStudioOwnerFields(),
    ...designProfileFieldsFromSource(entry),
    autoSaved: true,
    createdAt: entry.createdAt || new Date(now + index).toISOString(),
    generatedBy: "ai",
    generationJobId: pendingJob.id,
    id: entry.id || pendingSavedDesignId(pendingJob.id, index),
    imageUrl: "",
    isLoading: true,
    pendingIndex: index,
    pendingJobId: pendingJob.id,
    pendingStage: pendingJob.stage,
    projectId: entry.projectId || generationProjectId(pendingJob),
    projectTitle: entry.projectTitle || generationProjectTitle(pendingJob),
    sourceFileName: entry.sourceFileName || "",
    sourceImageUrl: safeSavedSourceImageUrl(entry.sourceImageUrl || ""),
    sourceStage: entry.sourceStage || pendingJob.stage,
    sourceTitle: entry.sourceTitle || entry.sourceFileName || "",
    stage: entry.stage || savedDesignStageLabel(pendingJob.stage),
    status: "loading",
    surfaceLabel: entry.surfaceLabel || "",
    surfaceValue: entry.surfaceValue || "",
    title: entry.title || pendingSavedDesignTitle(pendingJob, index),
  }));

  const nextDesigns = [...pendingDesigns, ...savedDesigns].slice(0, SAVED_DESIGN_LIMIT);
  if (!writeSavedDesigns(nextDesigns)) {
    return { added: 0, duplicateCount: 0, ok: false };
  }

  renderSavedDesigns(nextDesigns);
  return { added: pendingDesigns.length, duplicateCount: 0, ok: true };
}

function ensurePendingSavedDesignsForJob(job) {
  const pendingJob = sanitizePendingGeneration(job);
  if (!pendingJob?.id) return;

  const hasPendingDesign = readSavedDesigns().some((design) => (
    design.pendingJobId === pendingJob.id && isSavedDesignLoading(design)
  ));
  if (!hasPendingDesign) {
    publishPendingSavedDesigns(pendingJob);
  }
}

function resolvePendingSavedDesigns(job, entries = []) {
  const pendingJob = sanitizePendingGeneration(job);
  if (!pendingJob?.id) return addSavedDesigns(entries);

  const finalEntries = (Array.isArray(entries) ? entries : []).map((entry, index) => ({
    ...entry,
    generationJobId: entry.generationJobId || pendingJob.id,
    pendingIndex: Number.isFinite(Number(entry.pendingIndex)) ? Number(entry.pendingIndex) : index,
  }));
  const savedDesigns = readSavedDesigns();
  const pendingDesigns = savedDesigns.filter((design) => isPendingSavedDesignForJob(design, pendingJob.id));
  const pendingByIndex = new Map(
    pendingDesigns.map((design) => [normalizePendingIndex(design.pendingIndex), design])
  );

  const seenImageUrls = new Set(
    savedDesigns
      .filter((design) => !isPendingSavedDesignForJob(design, pendingJob.id))
      .map((design) => design.imageUrl)
      .filter(Boolean)
  );
  const seenJobSlots = new Set(
    savedDesigns
      .filter((design) => !isPendingSavedDesignForJob(design, pendingJob.id))
      .map(savedDesignJobSlotKey)
      .filter(Boolean)
  );
  const completedByPendingId = new Map();
  const newDesigns = [];
  const now = Date.now();
  let added = 0;
  let duplicateCount = 0;

  finalEntries.forEach((entry, entryIndex) => {
    const pendingIndex = normalizePendingIndex(entry.pendingIndex, entryIndex);
    const pendingDesign = pendingByIndex.get(pendingIndex) || null;
    const imageUrl = normalizedSavedDesignImageUrl(entry);
    const jobSlotKey = savedDesignJobSlotKey({ ...entry, generationJobId: pendingJob.id, pendingIndex });
    if (!imageUrl) return;

    if (seenImageUrls.has(imageUrl) || (jobSlotKey && seenJobSlots.has(jobSlotKey))) {
      duplicateCount += 1;
      if (pendingDesign) completedByPendingId.set(pendingDesign.id, null);
      return;
    }

    seenImageUrls.add(imageUrl);
    if (jobSlotKey) seenJobSlots.add(jobSlotKey);

    const completedDesign = createSavedDesignFromEntry(
      {
        ...(pendingDesign || {}),
        ...entry,
        autoSaved: entry.autoSaved ?? pendingDesign?.autoSaved,
        createdAt: pendingDesign?.createdAt || entry.createdAt,
        generatedBy: entry.generatedBy || pendingDesign?.generatedBy || "ai",
        generationJobId: pendingJob.id,
        id: pendingDesign?.id || entry.id,
        imageUrl,
        pendingIndex,
        projectId: entry.projectId || pendingDesign?.projectId || generationProjectId(pendingJob),
        projectTitle: entry.projectTitle || pendingDesign?.projectTitle || generationProjectTitle(pendingJob),
        sourceFileName: entry.sourceFileName || pendingDesign?.sourceFileName,
        sourceImageUrl: entry.sourceImageUrl || pendingDesign?.sourceImageUrl,
        sourceStage: entry.sourceStage || pendingDesign?.sourceStage,
        sourceTitle: entry.sourceTitle || pendingDesign?.sourceTitle,
        stage: entry.stage || pendingDesign?.stage,
        surfaceLabel: entry.surfaceLabel || pendingDesign?.surfaceLabel,
        surfaceValue: entry.surfaceValue || pendingDesign?.surfaceValue,
        title: entry.title || pendingDesign?.title,
      },
      pendingIndex,
      now
    );

    if (pendingDesign) {
      completedByPendingId.set(pendingDesign.id, completedDesign);
    } else {
      newDesigns.push(completedDesign);
    }
    added += 1;
  });

  const nextDesigns = [
    ...newDesigns,
    ...savedDesigns.reduce((accumulator, design) => {
      if (isPendingSavedDesignForJob(design, pendingJob.id)) {
        const completedDesign = completedByPendingId.get(design.id);
        if (completedDesign) accumulator.push(completedDesign);
        return accumulator;
      }
      accumulator.push(design);
      return accumulator;
    }, []),
  ].slice(0, SAVED_DESIGN_LIMIT);

  if (!writeSavedDesigns(nextDesigns)) {
    return { added: 0, duplicateCount, ok: false };
  }

  renderSavedDesigns(nextDesigns);
  return { added, duplicateCount, ok: true };
}

function removePendingSavedDesigns(jobId) {
  const safeJobId = String(jobId || "").trim();
  if (!safeJobId) return false;

  const savedDesigns = readSavedDesigns();
  const nextDesigns = savedDesigns.filter((design) => design.pendingJobId !== safeJobId);
  if (nextDesigns.length === savedDesigns.length) return false;

  if (!writeSavedDesigns(nextDesigns)) return false;
  renderSavedDesigns(nextDesigns);
  return true;
}

function isSavedDesignLoading(design) {
  const imageUrl = typeof design?.imageUrl === "string" ? design.imageUrl.trim() : "";
  return !imageUrl && (design?.isLoading === true || design?.status === "loading");
}

function isPendingSavedDesignForJob(design, jobId) {
  const safeJobId = String(jobId || "").trim();
  if (!safeJobId || !design) return false;
  return (
    String(design.pendingJobId || "").trim() === safeJobId ||
    (isSavedDesignLoading(design) && String(design.generationJobId || "").trim() === safeJobId)
  );
}

function savedDesignJobSlotKey(design) {
  const jobId = String(design?.generationJobId || design?.pendingJobId || "").trim();
  if (!jobId) return "";
  return `${jobId}:${normalizePendingIndex(design?.pendingIndex)}`;
}

function pendingSavedDesignId(jobId, index) {
  return `ff-design-loading-${jobId}-${index}`;
}

function savedDesignStageLabel(stage) {
  if (stage === "finish") return "Ürün Görseli";
  if (stage === "manken") return "Manken Foto";
  if (stage === "mockup") return "Mockup Foto";
  return "AI Tasarım Görseli";
}

function pendingSavedDesignTitle(job, index = 0) {
  const number = String(index + 1).padStart(2, "0");
  if (job.stage === "finish") return `Ürün görseli hazırlanıyor ${number}`;
  if (job.stage === "manken") return `Manken hazırlanıyor ${number}`;
  if (job.stage === "mockup") return `Mockup hazırlanıyor ${number}`;
  return `Tasarım görseli hazırlanıyor ${number}`;
}

function buildPendingSavedDesignEntries(job) {
  const metadata = job.metadata || {};
  const count = Math.max(1, normalizeCreditNumber(job.count, 1));
  return Array.from({ length: count }, (_, index) => {
    if (job.stage === "finish") {
      const formInfo = metadata.formInfo || {};
      return {
        ...designProfileFieldsFromSource(formInfo),
        sourceFileName: formInfo.title || "",
        sourceStage: "finish",
        sourceTitle: formInfo.title || "",
        stage: savedDesignStageLabel(job.stage),
        title: pendingSavedDesignTitle(job, index),
      };
    }

    if (isVisualizationStage(job.stage)) {
      const finishInfo = metadata.finishInfo || {};
      return {
        ...designProfileFieldsFromSource(finishInfo),
        sourceFileName: finishInfo.title || "",
        sourceStage: job.stage,
        sourceTitle: finishInfo.title || "",
        stage: savedDesignStageLabel(job.stage),
        title: pendingSavedDesignTitle(job, index),
      };
    }

    return {
      ...designProfileFieldsFromGenerationMetadata(metadata),
      ...sketchMetadataFieldsFromJob(job),
      sourceFileName: metadata.fileName || "",
      sourceImageUrl: metadata.sourceImageUrl || "",
      sourceStage: "sketch",
      sourceTitle: metadata.fileName || "",
      stage: savedDesignStageLabel(job.stage),
      title: pendingSavedDesignTitle(job, index),
    };
  });
}

function formatAutoSaveStatusSuffix(result) {
  if (!result) return "";
  if (!result.ok) return " Tasarımlarım'a otomatik kayıt yapılamadı.";
  if (result.added > 0) return ` ${result.added} sonuç Tasarımlarım'a kaydedildi.`;
  if (result.duplicateCount > 0) return " Sonuçlar zaten Tasarımlarım'da.";
  return "";
}

function formatStorageWarningStatusSuffix(payload) {
  return payload?.storageWarning ? ` ${payload.storageWarning}` : "";
}

async function saveSelectedDesign() {
  const selectedCard = document.querySelector("[data-sketch-card].is-selected:not(.is-hidden)");
  const selectedImage = selectedCard?.querySelector("[data-sketch-image]");
  const imageUrl = selectedCard?.dataset.imageUrl || managedImageUrl(selectedImage) || "";

  if (!selectedCard || !imageUrl) {
    setSketchStatus("Kaydetmek için önce üretilen bir tasarım görseli seç.", "error");
    return;
  }

  const profileFields = readDesignProfileDataset(selectedCard);
  const metadataFields = readSketchMetadataDataset(selectedCard);
  const sourceImageUrl = metadataFields.sourceImageUrl || await savedSourceImageUrlFromCurrentReference();
  const sourceFileName = metadataFields.sourceFileName || uploadInput?.files?.[0]?.name || collectReferenceState().fileName || "";
  const stageSourceUrl = safePersistedImageUrl(selectedCard.dataset.stageSourceUrl || imageUrl, "stageSourceUrl") || imageUrl;
  const result = addSavedDesigns([{
    ...profileFields,
    ...metadataFields,
    imageUrl,
    projectId: metadataFields.projectId || activeProjectId || "",
    projectTitle: metadataFields.projectTitle || projectTitleById(metadataFields.projectId || activeProjectId) || "",
    sourceFileName,
    sourceImageUrl,
    sourceStage: metadataFields.sourceStage || "sketch",
    sourceTitle: metadataFields.sourceTitle || sourceFileName,
    stageSourceUrl,
    stage: "Tasarım Görseli",
    title: selectedCard.dataset.imageLabel || selectedCard.querySelector(".sketch-body strong")?.textContent || "Tasarım",
  }]);

  if (!result.ok) {
    setSketchStatus("Tasarım kaydedilemedi. Tarayıcı depolama alanını kontrol et.", "error");
    return;
  }

  setSketchStatus(
    result.added > 0
      ? "Tasarım kaydedildi. Tasarımlarım sekmesinde görünecek."
      : "Bu tasarım zaten kaydedilmiş.",
    "success"
  );
  queueActiveProjectSave();
}

async function savedSourceImageUrlFromCurrentReference() {
  const file = uploadInput?.files?.[0];
  if (file?.type?.startsWith("image/")) {
    const dataUrl = await readFileAsDataUrl(file);
    const storedDataUrl = await createStoredReferenceDataUrl(dataUrl);
    const thumbnailUrl = await savedSourceImageUrlFromImageUrl(storedDataUrl || dataUrl);
    writeSourceThumbnail(file.name, thumbnailUrl);
    return thumbnailUrl;
  }
  const reference = collectReferenceState();
  return savedSourceImageUrlFromImageUrl(reference.imageDataUrl || reference.previewUrl || reference.thumbnailUrl);
}

async function storeReferenceDataForFile(file, preview) {
  if (!file?.name || !file.type?.startsWith("image/")) return;
  const token = Date.now() + Math.random();
  referencePersistenceToken = token;

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const storedDataUrl = await createStoredReferenceDataUrl(dataUrl) || dataUrl;
    const thumbnailUrl = await savedSourceImageUrlFromImageUrl(storedDataUrl);
    if (referencePersistenceToken !== token) return;
    if (preview) {
      if (thumbnailUrl) {
        preview.src = thumbnailUrl;
        releaseReferencePreviewObjectUrl();
      }
      preview.dataset.referenceDataUrl = storedDataUrl;
      preview.dataset.referenceFileName = file.name;
      preview.dataset.referenceThumbnailUrl = thumbnailUrl;
    }
    writeSourceThumbnail(file.name, thumbnailUrl);
    queueActiveProjectSave();
  } catch {
    // Reference persistence is a convenience for reloads; the live file can still be used in this session.
  }
}

function writeSourceThumbnail(fileName, thumbnailUrl) {
  const key = normalizeSourceThumbnailKey(fileName);
  const safeThumbnailUrl = safePersistedImageUrl(thumbnailUrl, "thumbnailUrl");
  if (!key || !safeThumbnailUrl) return;

  const thumbnails = studioStore.readSourceThumbnails();
  thumbnails[key] = safeThumbnailUrl;
  studioStore.writeSourceThumbnails(limitSourceThumbnailEntries(thumbnails));
}

function readSourceThumbnail(fileName) {
  const key = normalizeSourceThumbnailKey(fileName);
  if (!key) return "";
  return safePersistedImageUrl(studioStore.readSourceThumbnails()[key] || "", "thumbnailUrl");
}

function compactSourceThumbnailStorage() {
  studioStore.writeSourceThumbnails(limitSourceThumbnailEntries(studioStore.readSourceThumbnails()));
}

function limitSourceThumbnailEntries(thumbnails = {}) {
  return Object.fromEntries(
    Object.entries(thumbnails)
      .filter(([, value]) => safePersistedImageUrl(value, "thumbnailUrl"))
      .slice(-SOURCE_THUMBNAIL_LIMIT)
  );
}

function readSavedDesigns() {
  return studioStore.readSavedDesigns();
}

function writeSavedDesigns(designs) {
  return studioStore.writeSavedDesigns(compactPersistedSavedDesigns(prunedPendingSavedDesigns(designs)));
}

// Çözülmemiş "yükleniyor" placeholder'ları, arkasındaki üretim job'u tamamen
// kaybolduğunda (başka bir oturumda temizlenmiş, hiç tamamlanmamış vb.)
// Tasarımlarım'da sonsuza kadar dönen kart olarak kalabiliyor; üstelik bunlar
// buluta da senkronlandığı için cihazlar arası geri geliyor. Üretimin azami
// yaşından (PENDING_GENERATION_MAX_AGE_MS) eski loading placeholder'larını
// orphan kabul edip ele. Devam eden taze üretimlerin placeholder'ı korunur.
function prunedPendingSavedDesigns(designs = []) {
  const now = Date.now();
  return (Array.isArray(designs) ? designs : []).filter((design) => {
    if (!isSavedDesignLoading(design)) return true;
    const createdAt = new Date(design?.createdAt || "").getTime();
    if (!Number.isFinite(createdAt)) return false;
    return now - createdAt <= PENDING_GENERATION_MAX_AGE_MS;
  });
}

function compactPersistedProjects(projects = []) {
  return (Array.isArray(projects) ? projects : [])
    .map((project) => ({ ...project, ...currentStudioOwnerFields() }))
    .map((project) => compactPersistedValue(project));
}

function compactPersistedSavedDesigns(designs = []) {
  return (Array.isArray(designs) ? designs : [])
    .map((design) => ({ ...design, ...currentStudioOwnerFields() }))
    .map((design) => compactPersistedValue(design));
}

function compactPersistedValue(value, key = "") {
  if (Array.isArray(value)) {
    return value.map((item) => compactPersistedValue(item, key));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((accumulator, [entryKey, entryValue]) => {
      accumulator[entryKey] = compactPersistedValue(entryValue, entryKey);
      return accumulator;
    }, {});
  }

  if (typeof value === "string" && isPersistedImageUrlKey(key)) {
    return safePersistedImageUrl(value, key);
  }

  return value;
}

function isPersistedImageUrlKey(key) {
  const normalizedKey = String(key || "").toLowerCase();
  return (
    normalizedKey === "url" ||
    normalizedKey.endsWith("imageurl") ||
    normalizedKey.endsWith("previewurl") ||
    normalizedKey.endsWith("thumbnailurl") ||
    normalizedKey.endsWith("displayurl") ||
    normalizedKey.endsWith("rawurl") ||
    normalizedKey.endsWith("sketchurl") ||
    normalizedKey.endsWith("formurl") ||
    normalizedKey.endsWith("sourceurl") ||
    normalizedKey.endsWith("storageurl") ||
    normalizedKey.endsWith("mockupurl") ||
    normalizedKey === "imagedataurl"
  );
}

function safePersistedImageUrl(value, key = "") {
  const imageUrl = String(value || "").trim();
  if (!imageUrl || imageUrl.startsWith("blob:")) return "";
  if (!imageUrl.startsWith("data:image/")) return imageUrl;

  const normalizedKey = String(key || "").toLowerCase();
  const maxLength =
    normalizedKey === "imagedataurl" ||
    normalizedKey.endsWith("thumbnailurl") ||
    normalizedKey.endsWith("sourceimageurl") ||
    normalizedKey.endsWith("previewurl")
      ? MAX_SAVED_SOURCE_IMAGE_URL_LENGTH
      : MAX_PERSISTED_DATA_URL_LENGTH;
  return imageUrl.length <= maxLength ? imageUrl : "";
}

function compactPersistedStudioStorage() {
  writeProjects(readProjects());
  writeSavedDesigns(readSavedDesigns());
  compactSourceThumbnailStorage();
}

function createStudioObjectUrl(blob) {
  const objectUrl = URL.createObjectURL(blob);
  studioObjectUrls.add(objectUrl);
  return objectUrl;
}

function revokeStudioObjectUrl(objectUrl) {
  const url = String(objectUrl || "");
  if (!url.startsWith("blob:")) return;

  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore invalid or already-revoked object URLs.
  }
  studioObjectUrls.delete(url);
}

const offscreenImageObserver =
  typeof IntersectionObserver === "function"
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const image = entry.target;
            if (!shouldManageImageVisibility(image)) {
              offscreenImageObserver?.unobserve(image);
              return;
            }
            const managedUrl = image.getAttribute("data-managed-src") || "";
            if (!managedUrl) return;
            if (entry.isIntersecting) {
              if (image.getAttribute("src") !== managedUrl) image.setAttribute("src", managedUrl);
            } else if (image.getAttribute("src")) {
              // Görünür alandan çıkan görselin decode edilmiş bitmap'ini serbest bırak;
              // uzak/data URL data-managed-src içinde kaldığı için geri girince tekrar yüklenir.
              image.removeAttribute("src");
            }
          });
        },
        { rootMargin: "400px" }
      )
    : null;

function shouldManageImageVisibility(image) {
  return !image?.classList?.contains("side-emblem-thumb");
}

function setManagedImageSrc(image, url) {
  if (!image) return;
  const value = String(url || "");
  image.decoding = "async";
  image.loading = "lazy";
  if (!offscreenImageObserver || value.startsWith("blob:")) {
    image.src = value;
    return;
  }
  image.setAttribute("data-managed-src", value);
  image.setAttribute("src", value);
  offscreenImageObserver.observe(image);
}

function managedImageUrl(image) {
  if (!image) return "";
  return image.getAttribute("data-managed-src") || image.getAttribute("src") || "";
}

// Gizli panellerdeki (sekme/aşama/proje geçişiyle display:none olan) yönetilen
// görsellerin decode edilmiş bitmap'ini serbest bırakır. IntersectionObserver
// Safari'de display:none geçişlerinde güvenilir tetiklenmediği için bu görseller
// aksi halde tam çözünürlükte (≈4 MB) bellekte kalıp birikiyordu. data-managed-src
// korunduğu için görsel tekrar görünür olunca yeniden yüklenir.
function refreshManagedImageVisibility() {
  document.querySelectorAll("img").forEach((image) => {
    if (!shouldManageImageVisibility(image)) return;
    const src = image.getAttribute("src") || "";
    const managed = image.getAttribute("data-managed-src") || "";
    // blob: yönetilemez (revoke sonrası geri yüklenemez); ikisi de boşsa atla.
    if (src.startsWith("blob:") || managed.startsWith("blob:")) return;
    if (!src && !managed) return;
    const isHidden = image.offsetParent === null && image.getClientRects().length === 0;
    if (isHidden) {
      if (src) {
        // Görünmez panel: URL'yi sakla, decode edilmiş bitmap'i serbest bırak.
        if (!managed) image.setAttribute("data-managed-src", src);
        offscreenImageObserver?.observe(image);
        image.removeAttribute("src");
      }
    } else if (!src && managed) {
      // Tekrar görünür. Görünür alana yakın olanı hemen geri yükle (observer
      // zamanlamasına bağlı kalmadan boş görsel riskini önle); uzaktakiler
      // observer ile gerektiğinde yüklensin.
      const rect = image.getBoundingClientRect();
      const margin = 400;
      const nearViewport =
        rect.bottom > -margin &&
        rect.top < (window.innerHeight || 0) + margin &&
        rect.right > -margin &&
        rect.left < (window.innerWidth || 0) + margin;
      if (nearViewport || !offscreenImageObserver) {
        image.setAttribute("src", managed);
      }
      if (offscreenImageObserver) {
        offscreenImageObserver.unobserve(image);
        offscreenImageObserver.observe(image);
      }
    }
  });
}

let managedImageVisibilityFrame = null;
function scheduleManagedImageVisibilityRefresh() {
  if (managedImageVisibilityFrame) return;
  managedImageVisibilityFrame = window.requestAnimationFrame(() => {
    managedImageVisibilityFrame = null;
    refreshManagedImageVisibility();
  });
}

function releaseImageElement(image) {
  if (!image) return;
  offscreenImageObserver?.unobserve(image);
  image.removeAttribute("data-managed-src");
  revokeStudioObjectUrl(image.getAttribute("src") || image.src || "");
  image.removeAttribute("src");
}

function releaseImagesIn(root) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  root.querySelectorAll("img").forEach(releaseImageElement);
}

function replaceChildrenReleasing(parent, ...children) {
  if (!parent) return;
  releaseImagesIn(parent);
  parent.replaceChildren(...children);
}

function removeNodeReleasing(node) {
  if (!node) return;
  if (node.matches?.("img")) releaseImageElement(node);
  releaseImagesIn(node);
  node.remove();
}

function releaseCanvas(canvas) {
  if (!canvas) return;
  canvas.width = 1;
  canvas.height = 1;
}

function releaseReferencePreviewObjectUrl() {
  if (!referencePreviewObjectUrl) return;
  revokeStudioObjectUrl(referencePreviewObjectUrl);
  referencePreviewObjectUrl = "";
}

function releaseDirectFinishForm() {
  [directFinishForm?.formImageUrl, directFinishForm?.sourceFormUrl, directFinishForm?.sketchUrl].forEach(revokeStudioObjectUrl);
  directFinishForm = null;
  directFinishFormFile = null;
}

function releaseDirectMockupFinish() {
  [directMockupFinish?.finishImageUrl, directMockupFinish?.sourceFormUrl, directMockupFinish?.sketchUrl].forEach(revokeStudioObjectUrl);
  directMockupFinish = null;
  directMockupFinishFile = null;
}

function canSyncCloudStudioState() {
  return Boolean(
    cloudStateSyncEnabled &&
    cloudStateHydrated &&
    !isApplyingCloudState &&
    studioSupabase &&
    currentUserId
  );
}

function scheduleCloudStudioStateSync(delay = CLOUD_STATE_SYNC_DELAY) {
  if (!canSyncCloudStudioState()) return;

  window.clearTimeout(cloudStateSyncTimer);
  cloudStateSyncTimer = window.setTimeout(flushCloudStudioStateSync, Math.max(0, delay));
}

async function flushCloudStudioStateSync() {
  if (!canSyncCloudStudioState()) return;
  if (cloudStateSyncInFlight) {
    cloudStateSyncQueued = true;
    return;
  }

  window.clearTimeout(cloudStateSyncRetryTimer);
  cloudStateSyncInFlight = true;
  cloudStateSyncQueued = false;

  try {
    await withTimeout(
      pushCloudStudioState(),
      STUDIO_SYNC_TIMEOUT_MS,
      "Bulut proje kaydı zaman aşımına uğradı."
    );
    hideCloudSyncWarning();
  } catch (error) {
    handleCloudStudioStateError(error);
  } finally {
    cloudStateSyncInFlight = false;
    if (cloudStateSyncQueued) {
      scheduleCloudStudioStateSync();
    }
  }
}

function scheduleCloudStudioStateRetry() {
  if (!canSyncCloudStudioState()) return;

  window.clearTimeout(cloudStateSyncRetryTimer);
  cloudStateSyncRetryTimer = window.setTimeout(flushCloudStudioStateSync, CLOUD_STATE_SYNC_RETRY_DELAY);
}

function scheduleCloudStudioStateReadRetry(supabase, session) {
  if (!supabase || !currentUserId) return;

  window.clearTimeout(cloudStateSyncRetryTimer);
  cloudStateSyncRetryTimer = window.setTimeout(() => {
    initializeCloudStudioStateSync(supabase, session).catch((error) => {
      showCloudSyncWarning(
        `Bulut verisi hâlâ okunamadı; boş yerel veri buluta yazılmadı.`
      );
      console.warn("[sync] Supabase studio state read retry failed.", error);
      scheduleCloudStudioStateReadRetry(supabase, session);
    });
  }, CLOUD_STATE_SYNC_RETRY_DELAY);
}

async function initializeCloudStudioStateSync(supabase, session) {
  studioSupabase = supabase;
  cloudStateSyncEnabled = false;
  cloudStateHydrated = false;
  window.clearTimeout(cloudStateSyncTimer);
  let verifiedSession = session;

  try {
    const {
      data: { user },
      error,
    } = await withTimeout(
      supabase.auth.getUser(),
      STUDIO_AUTH_TIMEOUT_MS,
      "Oturum doğrulaması zaman aşımına uğradı."
    );

    if (error || !user?.id) {
      currentUserId = session?.user?.id || "";
      currentUserCreatedAtMs = sessionUserCreatedAtValue(session);
    } else {
      currentUserId = user.id;
      currentUserCreatedAtMs = sessionUserCreatedAtValue({ user });
      verifiedSession = { user };
    }
  } catch {
    currentUserId = session?.user?.id || "";
    currentUserCreatedAtMs = sessionUserCreatedAtValue(session);
  }

  if (!currentUserId) {
    showCloudSyncWarning("Bulut senkronu için oturum doğrulanamadı. Projeler bu tarayıcıda kalabilir.");
    return;
  }

  configureStudioStorageForUser(currentUserId);
  cleanScopedStudioStorageForSession(verifiedSession);
  recoverLegacyStudioStorageForCurrentUser(verifiedSession);

  try {
    const cloudState = await withTimeout(
      readCloudStudioState(),
      STUDIO_SYNC_TIMEOUT_MS,
      "Bulut proje verisi zaman aşımına uğradı."
    );
    const filteredCloudState = filterCloudStudioStateForCurrentUser(cloudState);
    const mergedProjectDeletions = mergeProjectDeletions(
      readProjectDeletions(),
      filterProjectDeletionsFromProjects(filteredCloudState.projects)
    );
    writeProjectDeletions(mergedProjectDeletions);

    const cloudProjects = filterDeletedProjects(filteredCloudState.projects, mergedProjectDeletions);
    const localProjects = filterDeletedProjects(readProjects(), mergedProjectDeletions);
    const compactCloudState = compactCloudStudioState({
      projects: cloudProjects,
      projectDeletions: mergedProjectDeletions,
      savedDesigns: filteredCloudState.savedDesigns,
    });
    const mergedProjects = filterDeletedProjects(
      mergeProjects(localProjects, filterActiveProjects(compactCloudState.projects)),
      mergedProjectDeletions
    );
    const mergedSavedDesigns = mergeSavedDesigns(readSavedDesigns(), compactCloudState.savedDesigns);

    isApplyingCloudState = true;
    writeProjects(mergedProjects);
    writeSavedDesigns(mergedSavedDesigns);
    isApplyingCloudState = false;

    renderProjects(mergedProjects);
    renderSavedDesigns(mergedSavedDesigns);
    if (activeProjectId) {
      const activeProject = mergedProjects.find((project) => project.id === activeProjectId);
      if (activeProject) {
        restoreProjectState(activeProject);
        updateActiveProjectHeader(activeProject);
      } else {
        studioStore.clearActiveProjectId(activeProjectId);
        activeProjectId = "";
      }
    }
    hideCloudSyncWarning();
    cloudStateHydrated = true;
    cloudStateSyncEnabled = true;
    scheduleCloudStudioStateSync(0);
  } catch (error) {
    isApplyingCloudState = false;
    cloudStateHydrated = false;
    cloudStateSyncEnabled = false;
    showCloudSyncWarning(
      `Bulut verisi gecikti. Boş yerel veri buluta yazılmadı; okuma arka planda tekrar denenecek.`
    );
    console.warn("[sync] Supabase studio state read failed; background sync will retry.", error);
    scheduleCloudStudioStateReadRetry(supabase, verifiedSession);
  }
}

async function readCloudStudioState() {
  if (!studioSupabase || !currentUserId) return { creditWallet: null, projects: [], savedDesigns: [] };

  const { data, error } = await studioSupabase
    .from(REMOTE_STUDIO_STATE_TABLE)
    .select("projects,saved_designs")
    .eq("user_id", currentUserId)
    .limit(1);

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : null;
  return {
    creditWallet: null,
    projects: Array.isArray(row?.projects) ? row.projects : [],
    savedDesigns: Array.isArray(row?.saved_designs) ? row.saved_designs : [],
  };
}

async function pushCloudStudioState(state = {}) {
  if (!studioSupabase || !currentUserId) return;

  const localProjectDeletions = mergeProjectDeletions(readProjectDeletions(), state.projectDeletions || []);
  let localProjects = filterDeletedProjects(state.projects || readProjects(), localProjectDeletions);
  const localSavedDesigns = state.savedDesigns || readSavedDesigns();

  // Çok cihazlı ezmeyi önle: tüm projects dizisini körlemesine üzerine yazmak,
  // başka bir cihazın bu cihazın son okumasından sonra eklediği projeleri siler.
  // Yazmadan önce buluttaki güncel hali tekrar okuyup silme-farkında birleştir.
  let remoteProjects = [];
  let remoteProjectDeletions = [];
  let remoteSavedDesigns = [];
  try {
    const remoteState = filterCloudStudioStateForCurrentUser(await readCloudStudioState());
    remoteProjectDeletions = filterProjectDeletionsFromProjects(remoteState.projects);
    remoteProjects = filterActiveProjects(remoteState.projects);
    remoteSavedDesigns = remoteState.savedDesigns;
  } catch (error) {
    console.warn("[sync] pre-push cloud read failed; cloud write postponed.", error);
    throw error;
  }

  const mergedProjectDeletions = mergeProjectDeletions(localProjectDeletions, remoteProjectDeletions);
  writeProjectDeletions(mergedProjectDeletions);
  localProjects = filterDeletedProjects(localProjects, mergedProjectDeletions);
  remoteProjects = filterDeletedProjects(remoteProjects, mergedProjectDeletions);

  // Tombstone filtresinden geçen her uzak proje korunur; yerelde olmaması silme
  // anlamına gelmez, başka cihazda eklenmiş ya da localStorage'dan düşmüş olabilir.
  const localProjectIds = new Set(localProjects.map((project) => project?.id).filter(Boolean));
  const reconcilableRemoteProjects = remoteProjects.filter((project) => {
    const id = project?.id;
    if (!id) return false;
    if (localProjectIds.has(id)) return true;
    return true;
  });
  const mergedProjects = filterDeletedProjects(
    mergeProjects(localProjects, reconcilableRemoteProjects),
    mergedProjectDeletions
  );

  const cloudState = compactCloudStudioState({
    projects: mergedProjects,
    projectDeletions: mergedProjectDeletions,
    savedDesigns: mergeSavedDesigns(localSavedDesigns, remoteSavedDesigns),
  });
  const payload = {
    projects: cloudState.projects,
    saved_designs: cloudState.savedDesigns,
    updated_at: new Date().toISOString(),
    user_id: currentUserId,
  };

  const { error } = await studioSupabase
    .from(REMOTE_STUDIO_STATE_TABLE)
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}

function compactCloudStudioState(state = {}) {
  const projectDeletions = mergeProjectDeletions(
    state.projectDeletions || [],
    filterProjectDeletionsFromProjects(state.projects)
  );
  const deletedProjectIds = projectDeletionIds(projectDeletions);
  const projects = sanitizeProjectList(filterActiveProjects(state.projects || []))
    .filter((project) => !deletedProjectIds.has(project.id))
    .map((project) => ({ ...project, ...currentStudioOwnerFields() }))
    .map((project) => compactCloudValue(project))
    .filter(Boolean);
  const savedDesigns = sanitizeSavedDesignList(state.savedDesigns || [])
    .map((design) => ({ ...design, ...currentStudioOwnerFields() }))
    .map((design) => compactCloudValue(design))
    .filter((design) => design && (isSavedDesignLoading(design) || cloudSafeImageUrl(design.imageUrl)));

  return { projects: [...projects, ...projectDeletions], savedDesigns };
}

function filterCloudStudioStateForCurrentUser(state = {}) {
  return {
    projects: filterOwnedCloudItems(state.projects),
    savedDesigns: filterOwnedCloudItems(state.savedDesigns),
  };
}

function filterOwnedCloudItems(items) {
  if (!currentUserId) return [];
  return (Array.isArray(items) ? items : []).filter((item) => {
    const ownerUserId = String(item?.ownerUserId || item?.userId || "").trim();
    return ownerUserId && ownerUserId === currentUserId && !isItemFromBeforeCurrentUser(item);
  });
}

async function hydrateArchivedDesigns() {
  if (!studioSupabase || !currentUserId) return;

  const { payload, response } = await studioApi.listDesigns({ sinceDays: 365 });
  if (!response.ok) {
    throw new Error(payload.error || "Kalıcı tasarım arşivi okunamadı.");
  }

  const archivedDesigns = mapArchivedDesignRows(payload.designs);
  if (!archivedDesigns.length) return;

  const mergedSavedDesigns = mergeSavedDesigns(readSavedDesigns(), archivedDesigns);
  writeSavedDesigns(mergedSavedDesigns);
  renderSavedDesigns(mergedSavedDesigns);
}

function mapArchivedDesignRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map(mapArchivedDesignRow)
    .filter(Boolean);
}

function mapArchivedDesignRow(row = {}) {
  const assets = Array.isArray(row.assets) ? row.assets : [];
  const asset = assets
    .slice()
    .sort((left, right) => normalizeCreditNumber(left.position) - normalizeCreditNumber(right.position))
    .find((candidate) => candidate?.public_url || candidate?.storage_path);
  const imageUrl = safePersistedImageUrl(asset?.public_url || "", "imageUrl");
  if (!imageUrl) return null;

  const stage = String(row.stage || "sketch").trim();
  const designMode = String(row.design_mode || "").trim();
  const productValue = String(row.product || "").trim();
  const productShapeValue = String(row.product_shape || "").trim();
  // project_id sütunu UUID kısıtı yüzünden boş kalabilir; üretildiği projeyi
  // metadata içinden geri al (recordGeneratedDesigns kimlik+adı oraya yazıyor).
  const rowMetadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  const projectId = String(row.project_id || "").trim() || String(rowMetadata.projectId || "").trim();
  const metaProjectTitle = String(rowMetadata.projectTitle || "").trim();
  // Ürün/şekil profilini satırdan taşı; aksi halde 2. ve 3. aşamadaki
  // "tasarımlarımdan seç" listesi profil eşleşmesi bulamayıp tasarımı eler.
  const profileFields = designProfileFieldsFromSource({
    designModeValue: designMode,
    productShapeValue,
    productValue,
    shapeValue: productShapeValue,
  });
  return {
    ...currentStudioOwnerFields(),
    ...profileFields,
    archiveDesignId: String(row.id || "").trim(),
    autoSaved: true,
    createdAt: validIsoDate(row.created_at) || new Date().toISOString(),
    generatedBy: "ai",
    generationJobId: String(row.client_job_id || "").trim(),
    id: `archive-${row.id || imageUrl}`,
    imageUrl,
    isLoading: false,
    pendingIndex: Number.isFinite(Number(asset?.position)) ? Number(asset.position) : null,
    pendingJobId: "",
    projectId,
    projectTitle: metaProjectTitle || projectTitleById(projectId) || "",
    sourceFileName: "",
    sourceImageUrl: "",
    sourceStage: stage,
    sourceTitle: "",
    stage: savedDesignStageLabel(stage),
    status: "ready",
    surfaceLabel: DESIGN_MODE_OPTIONS[designMode]?.surfaceLabel || "",
    surfaceValue: designMode,
    title: String(row.title || "").trim() || savedDesignStageLabel(stage),
  };
}

function compactCloudValue(value, key = "") {
  if (Array.isArray(value)) {
    return value
      .map((item) => compactCloudValue(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((accumulator, [entryKey, entryValue]) => {
      const compactValue = compactCloudValue(entryValue, entryKey);
      if (compactValue !== undefined) accumulator[entryKey] = compactValue;
      return accumulator;
    }, {});
  }

  if (typeof value === "string" && isCloudImageUrlKey(key)) {
    return cloudSafeImageUrl(value);
  }

  return value;
}

function isCloudImageUrlKey(key) {
  const normalizedKey = String(key || "").toLowerCase();
  return (
    normalizedKey === "url" ||
    normalizedKey.endsWith("imageurl") ||
    normalizedKey.endsWith("previewurl") ||
    normalizedKey.endsWith("thumbnailurl") ||
    normalizedKey.endsWith("sketchurl") ||
    normalizedKey.endsWith("formurl") ||
    normalizedKey.endsWith("sourceurl") ||
    normalizedKey.endsWith("storageurl") ||
    normalizedKey.endsWith("mockupurl") ||
    normalizedKey === "imagedataurl"
  );
}

function cloudSafeImageUrl(value) {
  const imageUrl = String(value || "").trim();
  if (!imageUrl || imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) return "";
  return imageUrl.length <= 12000 ? imageUrl : "";
}

async function finalizeGenerationDelivery(job = {}) {
  const clientJobId = String(job.id || job.clientJobId || "").trim();
  if (!clientJobId || !studioSupabase || !currentUserId) return false;

  try {
    await markGenerationDelivered(clientJobId);
    scheduleCloudStudioStateSync();
    return true;
  } catch (error) {
    showCloudSyncWarning(
      `Üretilen görsel bu tarayıcıda kaydedildi ama bulut teslim işareti tamamlanamadı.`
    );
    console.warn("[generation-recovery] delivery finalize failed.", error);
    scheduleCloudStudioStateSync();
    return false;
  }
}

async function markGenerationDelivered(clientJobId) {
  const headers = await authHeaders();
  if (!headers.Authorization) return false;

  const { payload, response } = await studioApi.markGenerationDelivered(clientJobId);
  if (!response.ok) {
    throw new Error(payload.error || "Üretim teslim işareti kaydedilemedi.");
  }
  return true;
}

function handleCloudStudioStateError(error) {
  showCloudSyncWarning(
    `Bulut senkronu gecikti. Son değişiklikler bu cihazda duruyor; arka planda tekrar denenecek.`
  );
  console.warn("[sync] Supabase studio state sync failed.", error);
  scheduleCloudStudioStateRetry();
}

function showCloudSyncWarning(message) {
  const main = document.querySelector("main");
  if (!main) return;

  let warning = document.querySelector("[data-cloud-sync-warning]");
  if (!warning) {
    warning = document.createElement("div");
    warning.dataset.cloudSyncWarning = "1";
    warning.setAttribute("role", "status");
    warning.style.cssText =
      "padding:12px 16px;border:1px solid rgba(185,131,70,.28);border-radius:18px;" +
      "background:rgba(255,248,235,.92);color:#5b3b20;font-size:.9rem;font-weight:650;" +
      "line-height:1.45;box-shadow:0 12px 28px rgba(101,77,53,.08);";
    main.prepend(warning);
  }

  warning.textContent = message;
}

function hideCloudSyncWarning() {
  document.querySelector("[data-cloud-sync-warning]")?.remove();
}

function mergeProjects(localProjects = [], cloudProjects = []) {
  return studioStore.mergeProjects(localProjects, cloudProjects);
}

function mergeSavedDesigns(localDesigns = [], cloudDesigns = []) {
  return studioStore.mergeSavedDesigns(localDesigns, cloudDesigns);
}

function sanitizeProjectList(projects) {
  return studioStore.sanitizeProjects(projects);
}

function sanitizeSavedDesignList(designs) {
  return studioStore.sanitizeSavedDesigns(designs);
}

function renderSavedDesigns(designs = readSavedDesigns()) {
  const sourceDesigns = prunedPendingSavedDesigns(Array.isArray(designs) ? designs : []).map(enrichSavedDesignDisplayMetadata);
  const realDesigns = sourceDesigns.filter((d) => !isSavedDesignLoading(d)).slice(0, SAVED_DESIGN_LIMIT);
  const gridDesigns = sourceDesigns.slice(0, SAVED_DESIGN_LIMIT);
  savedDesignsPage.render(gridDesigns);
  overviewPage.renderRecentDesigns(realDesigns);
  renderOrderDesignGallery();
}

function enrichSavedDesignDisplayMetadata(design = {}) {
  if (!design || typeof design !== "object") return design;
  const projectId = String(design.projectId || "").trim();
  return {
    ...design,
    projectId,
    projectTitle: design.projectTitle || projectTitleById(projectId) || "",
  };
}

function sketchApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/sketch" : "/api/sketch";
}

function designsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/designs" : "/api/designs";
}

function finishApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/finish" : "/api/finish";
}

function mockupApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/mockup" : "/api/mockup";
}

function generationStatusApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/generation-status" : "/api/generation-status";
}

function recoverGenerationsApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/recover-generations" : "/api/recover-generations";
}

function generationDeliveredApiUrl() {
  return window.location.protocol === "file:" ? "http://127.0.0.1:3000/api/generation-delivered" : "/api/generation-delivered";
}

function createGenerationJob({ count, creditCost, label, metadata = {}, stage }) {
  flushProjectSave();
  const projectId = activeProjectId || "";
  const projectTitle = projectTitleById(projectId);

  return {
    count: normalizeCreditNumber(count, 1),
    createdAt: new Date().toISOString(),
    creditCost: normalizeCreditNumber(creditCost),
    id: `ff-generation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    metadata: {
      ...metadata,
      projectId,
      projectTitle,
    },
    projectId,
    projectTitle,
    requestId: "",
    stage,
    status: "submitting",
  };
}

function generationResultTimestamp(job = {}, payload = {}) {
  return (
    validIsoDate(payload.generatedAt || payload.completedAt || payload.createdAt || "") ||
    validIsoDate(job.completedAt || job.updatedAt || "") ||
    new Date().toISOString()
  );
}

function readPendingGenerations() {
  const jobs = studioStore.readPendingGenerations();
  return jobs.map(sanitizePendingGeneration).filter(Boolean).filter((job) => !isPendingGenerationStale(job));
}

function writePendingGenerations(jobs) {
  return studioStore.writePendingGenerations(jobs.map(sanitizePendingGeneration).filter(Boolean));
}

function sanitizePendingGeneration(job) {
  if (!job || typeof job !== "object") return null;
  const stage = ["sketch", "finish", "mockup", "manken"].includes(job.stage) ? job.stage : "";
  const id = String(job.id || "").trim();
  if (!stage || !id) return null;
  return {
    count: normalizeCreditNumber(job.count, 1),
    createdAt: validIsoDate(job.createdAt) || new Date().toISOString(),
    creditCost: normalizeCreditNumber(job.creditCost),
    id,
    label: String(job.label || "Görsel oluşturma").trim(),
    metadata: compactPersistedValue(job.metadata && typeof job.metadata === "object" ? job.metadata : {}),
    projectId: String(job.projectId || "").trim(),
    projectTitle: String(job.projectTitle || job.metadata?.projectTitle || "").trim(),
    requestId: String(job.requestId || "").trim(),
    stage,
    status: String(job.status || "submitting").trim(),
  };
}

function upsertPendingGeneration(job) {
  const sanitizedJob = sanitizePendingGeneration(job);
  if (!sanitizedJob) return null;
  const jobs = readPendingGenerations().filter((item) => item.id !== sanitizedJob.id);
  writePendingGenerations([sanitizedJob, ...jobs]);
  return sanitizedJob;
}

function removePendingGeneration(jobId) {
  writePendingGenerations(readPendingGenerations().filter((job) => job.id !== jobId));
}

function pendingGenerationByStage(stage) {
  return readPendingGenerations().find((job) => (
    job.stage === stage && isPendingGenerationActive(job)
  )) || null;
}

function isPendingGenerationActive(job) {
  return Boolean(job?.requestId) || ["submitting", "queued", "running"].includes(job?.status);
}

function isPendingGenerationStale(job) {
  const createdAt = new Date(job?.createdAt || "").getTime();
  if (!Number.isFinite(createdAt)) return true;

  const age = Date.now() - createdAt;
  if (!job.requestId && job.status === "submitting") {
    return age > PENDING_SUBMITTING_MAX_AGE_MS;
  }
  return age > PENDING_GENERATION_MAX_AGE_MS;
}

function prunePendingGenerations() {
  const storedJobs = studioStore.readPendingGenerations()
    .map(sanitizePendingGeneration)
    .filter(Boolean);
  const freshJobs = storedJobs.filter((job) => !isPendingGenerationStale(job));
  const staleJobIds = storedJobs
    .filter((job) => isPendingGenerationStale(job))
    .map((job) => job.id);
  if (freshJobs.length !== storedJobs.length) {
    writePendingGenerations(freshJobs);
    staleJobIds.forEach(removePendingSavedDesigns);
  }
  return freshJobs;
}

async function submitGenerationJob({ apiUrl, job, requestPayload }) {
  ensurePendingSavedDesignsForJob(job);
  upsertPendingGeneration(job);
  const { payload, response } = await studioApi.submitGeneration({
    apiUrl,
    job,
    jobContext: generationJobContext(job),
    requestPayload,
  });
  applyCreditBalanceSnapshot(payload);

  if (!response.ok) {
    removePendingGeneration(job.id);
    throw new Error(payload.error || "Görsel oluşturma başlatılamadı.");
  }

  refreshCreditWallet({ silent: true }).catch((error) => {
    console.warn("[credits] refresh after generation submit failed.", error);
  });

  const requestId = payload.requestId || payload.request_id || "";
  if (!requestId && !Array.isArray(payload.images) && payload.pending !== true) {
    removePendingGeneration(job.id);
    throw new Error("Görsel oluşturma request id döndürmedi.");
  }

  if (requestId || payload.pending === true) {
    job = {
      ...job,
      requestId,
      status: requestId ? "queued" : "submitting",
    };
    upsertPendingGeneration(job);
    activeGenerationPolls.add(job.id);
    try {
      return {
        job,
        payload: await pollGenerationJob(job),
      };
    } finally {
      activeGenerationPolls.delete(job.id);
    }
  }

  removePendingGeneration(job.id);
  return { job, payload };
}

async function pollGenerationJob(job) {
  let sanitizedJob = sanitizePendingGeneration(job);
  if (!sanitizedJob?.id) throw new Error("Takip edilecek üretim job id bulunamadı.");
  const startedAt = Date.now();

  while (Date.now() - startedAt < GENERATION_POLL_TIMEOUT_MS) {
    if (isPendingGenerationStale(sanitizedJob)) {
      removePendingGeneration(sanitizedJob.id);
      throw new Error("Yarım kalan görsel oluşturma isteği zaman aşımına uğradı. Yeni bir deneme başlatabilirsin.");
    }

    const { payload, response } = await studioApi.readGenerationStatus({
      clientJobId: sanitizedJob.id,
      count: sanitizedJob.count,
      requestId: sanitizedJob.requestId,
      stage: sanitizedJob.stage,
    });
    applyCreditBalanceSnapshot(payload);

    if (!response.ok) {
      if (payload.status === "failed" || payload.status === "cancelled") {
        removePendingGeneration(sanitizedJob.id);
        refreshCreditWallet({ silent: true }).catch((error) => {
          console.warn("[credits] refresh after failed generation failed.", error);
        });
        throw new Error(payload.error || "Görsel oluşturma tamamlanamadı.");
      }
      // 404: üretim kaydı sunucuda artık yok (teslim edilmiş/temizlenmiş). Bunu
      // tekrar denemek 10 dk timeout'a kadar spinner'ı sonsuza kadar döndürüyordu;
      // kaydı temizleyip akışı bitir.
      if (response.status === 404) {
        removePendingGeneration(sanitizedJob.id);
        throw new Error(payload.error || "Üretim kaydı bulunamadı.");
      }
      await delay(GENERATION_POLL_INTERVAL_MS);
      continue;
    }

    if (payload.requestId && payload.requestId !== sanitizedJob.requestId) {
      sanitizedJob = {
        ...sanitizedJob,
        requestId: payload.requestId,
        status: payload.status || sanitizedJob.status,
      };
      upsertPendingGeneration(sanitizedJob);
    }

    if (payload.status === "completed") {
      removePendingGeneration(sanitizedJob.id);
      return payload;
    }

    if (payload.status === "failed" || payload.status === "cancelled") {
      removePendingGeneration(sanitizedJob.id);
      refreshCreditWallet({ silent: true }).catch((error) => {
        console.warn("[credits] refresh after failed generation failed.", error);
      });
      throw new Error(payload.error || "Görsel oluşturma tamamlanamadı.");
    }

    await delay(GENERATION_POLL_INTERVAL_MS);
  }

  throw new Error("Görsel oluşturma beklenenden uzun sürdü. Sayfayı yenilersen işlem sonucu tekrar kontrol edilir.");
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function restorePendingGenerations(earlyFetch = null) {
  recoverServerGenerations(earlyFetch).catch((error) => {
    console.warn("[generation-recovery] server recovery failed.", error);
  });

  syncVisiblePendingGenerations({ resume: true });
}

function prefetchRecoveryGenerations() {
  return authHeaders().then((headers) => {
    if (!headers.Authorization) return null;
    return fetch(recoverGenerationsApiUrl(), { cache: "no-store", headers, method: "GET" });
  }).catch(() => null);
}

async function recoverServerGenerations(earlyFetch = null) {
  let response;
  let payload;
  if (earlyFetch) {
    response = await earlyFetch;
    if (!response) return;
  } else {
    const headers = await authHeaders();
    if (!headers.Authorization) return;
    const recovered = await studioApi.recoverGenerations();
    response = recovered.response;
    if (response.ok) {
      const recoveries = Array.isArray(recovered.payload.jobs) ? recovered.payload.jobs : [];
      for (const recovery of recoveries) {
        await handleRecoveredGeneration(recovery);
      }
      return;
    }
    payload = recovered.payload;
  }

  payload ||= await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Yarım kalan görsel üretimleri kontrol edilemedi.");
  }

  const recoveries = Array.isArray(payload.jobs) ? payload.jobs : [];
  for (const recovery of recoveries) {
    await handleRecoveredGeneration(recovery);
  }
}

async function handleRecoveredGeneration(recovery) {
  const pendingJob = pendingJobFromRecoveredGeneration(recovery);
  if (!pendingJob?.id || activeGenerationPolls.has(pendingJob.id)) return;

  if (pendingJob.projectId) {
    ensureProjectRecord(pendingJob.projectId, {
      createdAt: pendingJob.createdAt,
      title: generationProjectTitle(pendingJob),
    });
  }

  const projectExists =
    pendingJob.projectId && readProjects().some((project) => project.id === pendingJob.projectId);

  if (recovery?.status === "completed" && Array.isArray(recovery.payload?.images) && recovery.payload.images.length) {
    if (recoveredImagesAlreadySaved(recovery.payload.images)) {
      // Görseller zaten arşive kaydedilmiş; yeniden kaydetmeden yalnızca teslim
      // işaretini tamamlıyoruz. Ancak bekleyen kayıt ile aşamanın yükleniyor
      // kartı temizlenmezse, sonuç hazır olduğu halde spinner dönmeye devam
      // ediyordu. Kayıtları temizleyip aktif projeyse sonucu workspace'e bas.
      removePendingSavedDesigns(pendingJob.id);
      removePendingGeneration(pendingJob.id);
      if (isGenerationForActiveProject(pendingJob)) {
        removeResultLoading(resultLoadingStageKey(pendingJob.stage), { stage: pendingJob.stage });
        stopGenerationState(pendingJob.stage);
      }
      await finalizeGenerationDelivery(pendingJob);
      return;
    }

    activeGenerationPolls.add(pendingJob.id);
    try {
      if (projectExists && pendingJob.projectId !== activeProjectId) {
        openProject(pendingJob.projectId, { scroll: false, updateHash: false });
      }

      removePendingGeneration(pendingJob.id);
      await completeGenerationJob(pendingJob, recovery.payload, { recovered: true });
    } finally {
      activeGenerationPolls.delete(pendingJob.id);
    }
    return;
  }

  if (recovery?.status === "failed" || recovery?.status === "cancelled") {
    removePendingGeneration(pendingJob.id);
    removePendingSavedDesigns(pendingJob.id);
    applyCreditBalanceSnapshot(recovery);
    applyCreditBalanceSnapshot(recovery.payload);
    refreshCreditWallet({ silent: true }).catch((error) => {
      console.warn("[credits] refresh after recovered failed generation failed.", error);
    });
    if (isGenerationForActiveProject(pendingJob)) {
      removeResultLoading(resultLoadingStageKey(pendingJob.stage), { stage: pendingJob.stage });
      stopGenerationState(pendingJob.stage);
      creditStageStatusSetter(pendingJob.stage)(
        recovery.error || "Yarım kalan görsel oluşturma tamamlanamadı.",
        "error"
      );
    }
    return;
  }

  if (recovery?.pending || ["submitting", "queued", "running"].includes(pendingJob.status)) {
    upsertPendingGeneration(pendingJob);
    activeGenerationPolls.add(pendingJob.id);
    if (projectExists && pendingJob.projectId !== activeProjectId) {
      openProject(pendingJob.projectId, { scroll: false, updateHash: false });
    }
    resumePendingGeneration(pendingJob).finally(() => activeGenerationPolls.delete(pendingJob.id));
  }
}

function recoveredImagesAlreadySaved(images) {
  const imageUrls = (Array.isArray(images) ? images : [])
    .map((image) => String(image?.url || "").trim())
    .filter(Boolean);
  if (!imageUrls.length) return false;

  const savedImageUrls = new Set(readSavedDesigns().map((design) => design.imageUrl).filter(Boolean));
  return imageUrls.every((imageUrl) => savedImageUrls.has(imageUrl));
}

function pendingJobFromRecoveredGeneration(recovery) {
  const sourceJob = recovery?.job && typeof recovery.job === "object" ? recovery.job : recovery;
  if (!sourceJob || typeof sourceJob !== "object") return null;

  const stage = ["sketch", "finish", "mockup", "manken"].includes(sourceJob.stage) ? sourceJob.stage : "";
  const count = normalizeCreditNumber(sourceJob.count, 1);
  return sanitizePendingGeneration({
    count,
    createdAt: sourceJob.createdAt,
    creditCost: normalizeCreditNumber(sourceJob.creditCost),
    id: sourceJob.clientJobId || sourceJob.id || "",
    label: sourceJob.label || defaultGenerationLabel(stage, count),
    metadata: sourceJob.metadata || {},
    projectId: sourceJob.projectId || sourceJob.metadata?.projectId || "",
    projectTitle: sourceJob.projectTitle || sourceJob.metadata?.projectTitle || "",
    requestId: sourceJob.requestId || recovery?.payload?.requestId || "",
    stage,
    status: recovery?.status || sourceJob.status || "queued",
  });
}

function defaultGenerationLabel(stage, count = 1) {
  const safeCount = normalizeCreditNumber(count, 1);
  if (stage === "finish") return `${safeCount} ürün görseli oluşturma`;
  if (stage === "manken") return `${safeCount} manken oluşturma`;
  if (stage === "mockup") return `${safeCount} mockup oluşturma`;
  return `${safeCount} tasarım görseli oluşturma`;
}

function activePendingGenerations() {
  return prunePendingGenerations()
    .filter(isPendingGenerationActive);
}

function visiblePendingGenerations(jobs = activePendingGenerations()) {
  return jobs.filter(shouldShowPendingGenerationState);
}

function syncVisiblePendingGenerations(options = {}) {
  const jobs = activePendingGenerations();
  visiblePendingGenerations(jobs).forEach(showPendingGenerationState);

  if (options.resume === false) return jobs;

  jobs.forEach((job) => {
    if (activeGenerationPolls.has(job.id)) {
      if (shouldShowPendingGenerationState(job)) showPendingGenerationState(job);
      return;
    }
    activeGenerationPolls.add(job.id);
    resumePendingGeneration(job).finally(() => activeGenerationPolls.delete(job.id));
  });

  return jobs;
}

async function resumePendingGeneration(job) {
  const pendingJob = sanitizePendingGeneration(job);
  if (!pendingJob?.id) return;

  if (pendingJob.projectId) {
    ensureProjectRecord(pendingJob.projectId, {
      createdAt: pendingJob.createdAt,
      title: generationProjectTitle(pendingJob),
    });
  }

  if (
    pendingJob.projectId &&
    pendingJob.projectId !== activeProjectId &&
    readProjects().some((project) => project.id === pendingJob.projectId)
  ) {
    openProject(pendingJob.projectId, { scroll: false, updateHash: false });
  }

  showPendingGenerationState(pendingJob);

  try {
    const payload = await pollGenerationJob(pendingJob);
    await completeGenerationJob(pendingJob, payload, { recovered: true });
  } catch (error) {
    removePendingSavedDesigns(pendingJob.id);
    if (isGenerationForActiveProject(pendingJob)) {
      removeResultLoading(resultLoadingStageKey(pendingJob.stage), { stage: pendingJob.stage });
      stopGenerationState(pendingJob.stage);
      creditStageStatusSetter(pendingJob.stage)(error.message || "Yarım kalan görsel oluşturma tamamlanamadı.", "error");
    }
  }
}

function shouldShowPendingGenerationState(job) {
  const projectId = generationProjectId(job);
  if (!projectId) return true;
  return activeProjectId === projectId || readStoredActiveProjectId() === projectId;
}

function isGenerationForActiveProject(job) {
  const projectId = generationProjectId(job);
  return !projectId || activeProjectId === projectId;
}

function stopGenerationState(stage) {
  if (stage === "sketch") setGeneratingState(false);
  else if (stage === "finish") setFinishGeneratingState(false);
  else if (isVisualizationStage(stage)) setMockupGeneratingState(false);
}

function showPendingGenerationState(job) {
  ensurePendingSavedDesignsForJob(job);

  if (job.stage === "sketch") {
    setGeneratingState(true);
    showResultLoading("sketch", job.count);
    setSketchStatus("Yarım kalan tasarım görseli oluşturma işlemi takip ediliyor...");
    return;
  }

  if (job.stage === "finish") {
    enterFinishStage({ allowMissing: true });
    setFinishGeneratingState(true);
    showResultLoading("finish", job.count);
    setFinishStatusMessage("Yarım kalan ürün görseli işlemi takip ediliyor...");
    return;
  }

  if (isVisualizationStage(job.stage)) {
    if (job.stage === "manken") enterMankenStage({ allowMissing: true });
    else enterMockupStage({ allowMissing: true });
    setMockupGeneratingState(true);
    showResultLoading("mockup", job.count, { stage: job.stage });
    setMockupStatusMessage(
      `Yarım kalan ${job.stage === "manken" ? "manken" : "mockup"} işlemi takip ediliyor...`
    );
  }
}

async function completeGenerationJob(job, payload, options = {}) {
  try {
    if (job.stage === "sketch") return await completeSketchGeneration(job, payload, options);
    if (job.stage === "finish") return await completeFinishGeneration(job, payload, options);
    if (isVisualizationStage(job.stage)) return await completeMockupGeneration(job, payload, options);
  } finally {
    // Üretim akışı tamamlandığında (sonuç workspace'e render edilsin ya da
    // edilmesin) ilgili aşamanın "yükleniyor" kartını her zaman kaldır. Aksi
    // halde sonuç hazır olduğu halde spinner sonsuza kadar dönebiliyordu.
    removeResultLoading(resultLoadingStageKey(job.stage), { stage: job.stage });
  }
}

// RESULT_LOADING_CONFIG yalnızca sketch/finish/mockup anahtarlarını tanır;
// manken aşaması da mockup grid'ini paylaşır.
function resultLoadingStageKey(stage) {
  return isVisualizationStage(stage) ? "mockup" : stage;
}

function shouldUseRealFinishApi() {
  return !isDevMode();
}

function shouldUseLocalFinishComposite() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("serverFinish") === "1") return false;
    if (params.get("localFinish") === "1") return true;
    return isDevMode() || creditWalletSource !== "server";
  } catch {
    return isLocalTestHost() || creditWalletSource !== "server";
  }
}

function shouldUseRealMockupApi() {
  return !isDevMode();
}

function isDevMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("real") === "1") return false;
    // Local'de test modu otomatik açıktır.
    if (isLocalTestHost()) return true;
    // Sorgu parametreli test modu (?dev / ?test / ?mock) YALNIZCA local ve Vercel
    // preview deploy'larında açılır. Canlı (production) alan adında müşteriler
    // adres çubuğundan test moduna geçemez; orada her zaman gerçek mod çalışır.
    if (isDevModeQueryAllowedHost()) {
      return (
        params.get("dev") === "1" ||
        params.get("test") === "1" ||
        params.get("mock") === "1"
      );
    }
    return false;
  } catch {
    return isLocalTestHost();
  }
}

function isLocalTestHost() {
  return (
    window.location.protocol === "file:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

// ?dev/?test/?mock parametrelerinin geçerli olduğu host'lar: local + Vercel
// preview. Canlı alan adı (ff-studio.vercel.app ya da özel domain) hariç tutulur.
function isDevModeQueryAllowedHost() {
  if (isLocalTestHost()) return true;
  const host = window.location.hostname;
  // Preview deploy'ları "ff-studio-<git-dal/hash>-<scope>.vercel.app" biçimindedir;
  // canlı alias tam olarak "ff-studio.vercel.app"tır.
  return /\.vercel\.app$/.test(host) && host !== "ff-studio.vercel.app" && host.startsWith("ff-studio-");
}

const DEV_SKETCH_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'>
      <rect width='240' height='240' fill='#fff'/>
      <path d='M70 150 Q120 60 170 150' fill='none' stroke='#1a1a1a' stroke-width='3' stroke-linecap='round'/>
      <path d='M95 130 Q120 105 145 130' fill='none' stroke='#1a1a1a' stroke-width='2.5' stroke-linecap='round'/>
      <circle cx='120' cy='118' r='6' fill='#1a1a1a'/>
      <text x='120' y='200' font-family='serif' font-size='14' fill='#1a1a1a' text-anchor='middle'>TEST · Atelify</text>
    </svg>`
  );

function maybeEnableDevMode() {
  if (!isDevMode()) return;

  // Banner
  if (newDesignStudio && !document.querySelector("[data-dev-banner]")) {
    const banner = document.createElement("div");
    banner.dataset.devBanner = "1";
    banner.style.cssText =
      "padding:10px 16px;border-radius:14px;background:linear-gradient(135deg,#fde68a,#fbbf24);" +
      "color:#3a2807;font-weight:700;font-size:.86rem;display:flex;align-items:center;gap:10px;";
    banner.innerHTML =
      "Test modu aktif - gerçek üretim çağrısı yapılmaz, başarılı denemede kredi düşer. " +
      '<button type="button" data-dev-jump style="margin-left:auto;border:0;border-radius:999px;' +
      'padding:6px 12px;background:#3a2807;color:#fde68a;cursor:pointer;font:inherit;font-weight:700">' +
      "Görsel üretimine atla</button>";
    newDesignStudio.prepend(banner);
    banner.querySelector("[data-dev-jump]")?.addEventListener("click", devJumpToFinishStage);
  }

  // Open the project workspace automatically when a URL hash did not choose another tab.
  if (!tabFromLocationHash()) {
    switchTab("projeler", { updateHash: false });
  }

  // Relabel generation buttons to indicate test mode.
  document.querySelectorAll("[data-generate-sketches]").forEach((btn) => {
    const draftCount = btn.dataset.draftCount || "1";
    const testLabel = draftCount === "4" ? "Test 4 adet oluştur" : "Test 1 görsel oluştur";
    btn.dataset.originalLabel = testLabel;
    btn.textContent = testLabel;
  });
}

function devJumpToFinishStage() {
  const firstCard = document.querySelector("[data-sketch-card]");
  if (!firstCard) return;

  // Place a dummy "selected" sketch
  firstCard.dataset.imageUrl = DEV_SKETCH_DATA_URL;
  firstCard.dataset.imageLabel = "Test Tasarım";
  firstCard.dataset.stageSourceUrl = DEV_SKETCH_DATA_URL;
  writeDesignProfileDataset(firstCard, designProfileFormFields());
  writeSketchMetadataDataset(firstCard, {
    projectId: activeProjectId || "",
    projectTitle: projectTitleById(activeProjectId),
    sourceStage: "sketch",
    sourceTitle: "Test Tasarım",
  });
  const img = firstCard.querySelector("[data-sketch-image]");
  if (img) {
    img.src = DEV_SKETCH_DATA_URL;
    img.hidden = false;
  }
  firstCard.querySelector(".sketch-thumb")?.classList.add("has-image");
  firstCard.classList.add("is-selected");
  firstCard.classList.remove("is-hidden");

  // Hide the other cards (so only one looks "selected")
  document.querySelectorAll("[data-sketch-card]").forEach((card, i) => {
    if (i > 0) card.classList.add("is-hidden");
  });

  newDesignStudio?.classList.add("has-results");
  setFormStepReady(true);
  enterFinishStage();
}

function getSelectedSketchInfo() {
  const card = document.querySelector("[data-sketch-card].is-selected:not(.is-hidden)");
  if (!card) return null;
  const url = card.dataset.imageUrl || managedImageUrl(card.querySelector("[data-sketch-image]")) || "";
  const stageSourceUrl = safePersistedImageUrl(card.dataset.stageSourceUrl || url, "stageSourceUrl") || url;
  const label = card.dataset.imageLabel || card.querySelector(".sketch-body strong")?.textContent || "Tasarım";
  return url
    ? { ...readDesignProfileDataset(card), ...readSketchMetadataDataset(card), ...readStorageDataset(card), label, stageSourceUrl, url }
    : null;
}

function readSelectedChip(group) {
  // Görselleştirme chip'leri (scene/ratio/mockup-*) mockup ve manken panellerinde
  // aynı adla tekrarlandığından, aktif panele scope'la; diğer gruplar globaldir.
  const scope = VISUALIZATION_CHIP_GROUPS.has(group)
    ? activeVisualizationPanel() || document
    : document;
  const chip = scope.querySelector(`[data-chip-group="${group}"] .option-chip.is-selected`);
  if (!chip) return DEFAULT_CHIP_SELECTIONS[group] || { value: "", label: "" };
  const dataKey = CHIP_DATA_KEY_BY_GROUP[group] || "";
  return {
    value: dataKey ? chip.dataset[dataKey] || "" : "",
    label: chip.textContent.trim(),
  };
}

// Mockup (3. aşama) ve manken (4. aşama) aynı görsel panelini ve aynı üretim
// pipeline'ını paylaşır; yalnızca kredi maliyeti, job stage'i ve etiketleri farklıdır.
// Bu yardımcı, panel/yükleme/recovery yönlendirmesinde ikisini birlikte ele alır.
function isVisualizationStage(stage) {
  return stage === "mockup" || stage === "manken";
}

// Mockup (3. aşama) ve manken (4. aşama) artık ayrı DOM panelleri kullanır, ancak
// aynı üretim pipeline'ını paylaşırlar. Bu paneller aynı hook adlarını (data-mockup-*,
// data-chip-group="ratio" vb.) taşıdığından, panel'e özgü okumalar/yazmalar aktif
// aşamanın paneline scope'lanır. activeVisualizationPanel() o anki aktif paneli döndürür.
const VISUALIZATION_CHIP_GROUPS = new Set(["scene", "ratio", "mockup-count", "mockup-resolution"]);
function currentVisualizationStage() {
  return newDesignStudio?.classList.contains("is-manken-stage") ? "manken" : "mockup";
}

function visualizationPanelForStage(stage) {
  if (!isVisualizationStage(stage)) return null;
  const selector = stage === "manken"
    ? '[data-stage-panel="manken"]'
    : '[data-stage-panel="mockup"]';
  return document.querySelector(selector);
}

function activeVisualizationPanel() {
  return visualizationPanelForStage(currentVisualizationStage());
}

function syncMockupResultUi() {
  const activePanel = activeVisualizationPanel() || document;
  const hasActiveResultState = Boolean(
    activePanel.querySelector('[data-result-loading="mockup"], [data-mockup-result-card]')
  );
  newDesignStudio?.classList.toggle("has-mockup-result", hasActiveResultState);
  setFinalDesignReady(hasActiveMockupSelection());
}

// scene chip'i DOM'da gizli tutulur; çıktı tipi aktif aşamaya (mockup/manken) göre
// programatik olarak belirlenir. readSelectedChip("scene") bu seçimi okumaya devam eder.
function setSceneSelection(value) {
  const normalized = value === "manken" ? "manken" : "mockup";
  const scope = activeVisualizationPanel() || document;
  scope.querySelectorAll('[data-chip-group="scene"] .option-chip').forEach((chip) => {
    chip.classList.toggle("is-selected", chip.dataset.scene === normalized);
  });
}

function mockupResolutionConfig(value) {
  return MOCKUP_RESOLUTION_OPTIONS[normalizeMockupResolutionValue(value)] || MOCKUP_RESOLUTION_OPTIONS["1k"];
}

function draftCreditCostFor(count) {
  const normalizedCount = normalizeGenerationCountValue(count);
  return STUDIO_CREDIT_COSTS.sketch["1k"][normalizedCount] || STUDIO_CREDIT_COSTS.sketch["1k"][1];
}

function finishCreditCostFor(count) {
  const normalizedCount = normalizeGenerationCountValue(count);
  return STUDIO_CREDIT_COSTS.finish[normalizedCount] || STUDIO_CREDIT_COSTS.finish[1];
}

function mockupCreditCostFor(count, resolution, scene) {
  const normalizedCount = normalizeGenerationCountValue(count);
  const normalizedResolution = normalizeMockupResolutionValue(resolution);
  const sceneKey = normalizeMockupScene({ value: scene }).value === "manken" ? "manken" : "mockup";
  const table = STUDIO_CREDIT_COSTS[sceneKey] || STUDIO_CREDIT_COSTS.mockup;
  return table[normalizedResolution]?.[normalizedCount] || table["1k"][1];
}

function buildDesignProfile({ designModeValue = "engrave", productValue = "yuzuk", shapeValue = "yuvarlak" } = {}, overrides = {}) {
  const normalizedProduct = normalizeDesignOptionKey(DESIGN_PRODUCT_OPTIONS, productValue, "yuzuk");
  const normalizedShape = normalizeDesignOptionKey(DESIGN_SHAPE_OPTIONS, shapeValue, "yuvarlak");
  const normalizedMode = normalizeDesignOptionKey(DESIGN_MODE_OPTIONS, designModeValue, "engrave");
  const product = DESIGN_PRODUCT_OPTIONS[normalizedProduct];
  const shape = DESIGN_SHAPE_OPTIONS[normalizedShape];
  const mode = DESIGN_MODE_OPTIONS[normalizedMode];

  return {
    designModeLabel: overrides.designModeLabel || mode.label,
    designModePrompt: overrides.designModePrompt || mode.prompt,
    designModeValue: normalizedMode,
    moldAspect: overrides.moldAspect || shape.aspect,
    moldKey: overrides.moldKey || shape.ringMold,
    moldMeasure: overrides.moldMeasure || "",
    moldShape: overrides.moldShape || normalizedShape,
    moldSizeLabel: overrides.moldSizeLabel || "",
    moldTitle: overrides.moldTitle || `${shape.label} ${product.label}`,
    productLabel: overrides.productLabel || product.label,
    productPrompt: overrides.productPrompt || product.prompt,
    productShapeLabel: overrides.productShapeLabel || overrides.shapeLabel || shape.label,
    productShapePrompt: overrides.productShapePrompt || overrides.shapePrompt || shape.prompt,
    productShapeValue: normalizedShape,
    productValue: normalizedProduct,
    shapeLabel: overrides.shapeLabel || overrides.productShapeLabel || shape.label,
    shapePrompt: overrides.shapePrompt || overrides.productShapePrompt || shape.prompt,
    shapeValue: normalizedShape,
  };
}

function selectedDesignProfile() {
  const productChip = readSelectedChip("product-type");
  const shapeChip = readSelectedChip("product-shape");
  const modeChip = readSelectedChip("design-mode");

  return buildDesignProfile({
    designModeValue: modeChip.value,
    productValue: productChip.value,
    shapeValue: shapeChip.value,
  });
}

function designProfileFromFields(fields = {}) {
  const fallback = selectedDesignProfile();
  return buildDesignProfile(
    {
      designModeValue: fields.designModeValue || fallback.designModeValue,
      productValue: fields.productValue || fallback.productValue,
      shapeValue: fields.productShapeValue || fields.shapeValue || fields.moldShape || fallback.shapeValue,
    },
    fields
  );
}

function updateDesignSelectionSummary() {
  const profile = selectedDesignProfile();
  document.querySelectorAll("[data-design-product-summary]").forEach((item) => {
    item.textContent = profile.productLabel;
  });
  document.querySelectorAll("[data-design-shape-summary]").forEach((item) => {
    item.textContent = profile.productShapeLabel;
  });
  document.querySelectorAll("[data-design-mode-summary]").forEach((item) => {
    item.textContent = profile.designModeLabel;
  });
  const metalChip = readSelectedChip("metal");
  document.querySelectorAll("[data-design-metal-summary]").forEach((item) => {
    item.textContent = metalChip.label || PROJECT_METAL_OPTIONS.gumus.label;
  });
  document.querySelectorAll("[data-next-product-chip]").forEach((item) => {
    item.textContent = profile.productLabel;
  });
  document.querySelectorAll("[data-next-shape-chip]").forEach((item) => {
    item.textContent = profile.productShapeLabel;
  });
  document.querySelectorAll("[data-next-mode-chip]").forEach((item) => {
    item.textContent = profile.designModeLabel;
  });
}

function selectedRingShapeValue() {
  return selectedDesignProfile().shapeValue || FIXED_FINISH_RING_SHAPE;
}

function finishRingMoldKeyFor(shapeValue, metalValue, productValue) {
  const shapeKey = normalizeDesignOptionKey(DESIGN_SHAPE_OPTIONS, shapeValue, "yuvarlak");
  const metalKey = normalizeFinishMetalValue(metalValue);
  if (productValue === "kolye") {
    return (
      FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL[shapeKey]?.[metalKey] ||
      FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL[shapeKey]?.altin ||
      FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL[shapeKey]?.gumus ||
      FINISH_KOLYE_MOLD_BY_SHAPE_AND_METAL.yuvarlak.altin
    );
  }
  return (
    FINISH_RING_MOLD_BY_SHAPE_AND_METAL[shapeKey]?.[metalKey] ||
    DESIGN_SHAPE_OPTIONS[shapeKey]?.ringMold ||
    FIXED_FINISH_RING_MOLD
  );
}

function ringMoldConfigFromKey(key, profile = selectedDesignProfile()) {
  const mold = RING_MOLD_OPTIONS[key];

  if (mold) {
    return {
      key,
      ...mold,
      aspect: mold.aspect || profile.moldAspect || "1 / 1",
      label: mold.label || profile.moldTitle || profile.shapeLabel || "Ürün formu",
      shape: mold.shape || profile.shapeValue || FIXED_FINISH_RING_SHAPE,
    };
  }

  return {
    aspect: profile.moldAspect || "1 / 1",
    heightCm: "",
    key,
    label: profile.moldTitle || profile.shapeLabel || "Ürün formu",
    shape: profile.shapeValue || FIXED_FINISH_RING_SHAPE,
    widthCm: "",
  };
}

function shouldUseRingMoldTemplate(profile = selectedDesignProfile()) {
  return profile.productValue === "yuzuk" && profile.shapeValue !== "dikdortgen";
}

function dynamicProductMoldConfig(profile = selectedDesignProfile()) {
  const shape = DESIGN_SHAPE_OPTIONS[profile.shapeValue] || DESIGN_SHAPE_OPTIONS.yuvarlak;
  return {
    aspect: profile.moldAspect || shape.aspect || "1 / 1",
    heightCm: "",
    key: `${profile.productValue || "urun"}-${profile.shapeValue || "yuvarlak"}`,
    label: profile.moldTitle || `${profile.productShapeLabel || shape.label} ${profile.productLabel || "Ürün"}`,
    shape: profile.shapeValue || "yuvarlak",
    widthCm: "",
  };
}

function syncRingMoldSizeOptions() {
  const moldChips = Array.from(document.querySelectorAll('[data-chip-group="ring-mold"] .option-chip'));
  let firstVisibleChip = null;
  let hasSelectedVisibleChip = false;

  moldChips.forEach((chip) => {
    const isVisible = chip.dataset.ringMold === FIXED_FINISH_RING_MOLD;
    chip.hidden = !isVisible;
    if (!isVisible) {
      chip.classList.remove("is-selected");
      return;
    }

    firstVisibleChip ||= chip;
    if (chip.classList.contains("is-selected")) {
      hasSelectedVisibleChip = true;
    }
  });

  if (!hasSelectedVisibleChip && firstVisibleChip) {
    firstVisibleChip.classList.add("is-selected");
  }
}

function toggleRingMoldReference(event) {
  const button = event.currentTarget;
  const reference = document.querySelector("[data-ring-mold-reference]");
  if (!button || !reference) return;

  const shouldShow = reference.hidden;
  reference.hidden = !shouldShow;
  button.setAttribute("aria-expanded", String(shouldShow));
}

function selectedRingMoldConfig() {
  const profile = selectedDesignProfile();
  const key = profile.moldKey || FIXED_FINISH_RING_MOLD;
  return shouldUseRingMoldTemplate(profile)
    ? ringMoldConfigFromKey(key, profile)
    : dynamicProductMoldConfig(profile);
}

function applyRingMoldToFormInfo(formInfo, mold = null) {
  if (!formInfo) return null;

  const profile = designProfileFromFields(formInfo);
  const useRingTemplate = shouldUseRingMoldTemplate(profile);
  const resolvedMold = useRingTemplate
    ? mold || ringMoldConfigFromKey(profile.moldKey || FIXED_FINISH_RING_MOLD, profile)
    : dynamicProductMoldConfig(profile);
  const hasMeasure = Boolean(resolvedMold.widthCm && resolvedMold.heightCm);
  const sizeLabel = hasMeasure ? `${resolvedMold.widthCm} x ${resolvedMold.heightCm} cm` : "";
  return {
    ...formInfo,
    designModeLabel: profile.designModeLabel,
    designModePrompt: profile.designModePrompt,
    designModeValue: profile.designModeValue,
    moldAspect: resolvedMold.aspect || profile.moldAspect,
    moldHeightCm: resolvedMold.heightCm || "",
    moldKey: resolvedMold.key,
    moldMeasure: sizeLabel,
    moldShape: profile.shapeValue,
    moldSizeLabel: sizeLabel,
    moldTitle: resolvedMold.label || profile.moldTitle,
    moldWidthCm: resolvedMold.widthCm || "",
    productLabel: profile.productLabel,
    productPrompt: profile.productPrompt,
    productShapeLabel: profile.productShapeLabel,
    productShapePrompt: profile.productShapePrompt,
    productShapeValue: profile.productShapeValue,
    productValue: profile.productValue,
    shapeLabel: profile.productShapeLabel,
    shapePrompt: profile.productShapePrompt,
    shapeValue: profile.shapeValue,
  };
}

function resolveFinishFormInfoForMetal(formInfo, metal = readSelectedChip("metal")) {
  if (!formInfo) return null;

  const profile = designProfileFromFields(formInfo);
  if (!shouldUseRingMoldTemplate(profile)) {
    return applyRingMoldToFormInfo(formInfo, dynamicProductMoldConfig(profile));
  }

  const moldKey = finishRingMoldKeyFor(profile.shapeValue, metal?.value, profile.productValue);
  return applyRingMoldToFormInfo(
    {
      ...formInfo,
      ...profile,
      moldKey,
    },
    ringMoldConfigFromKey(moldKey, profile)
  );
}

function designProfileFormFields(profile = selectedDesignProfile()) {
  return {
    designModeLabel: profile.designModeLabel,
    designModePrompt: profile.designModePrompt,
    designModeValue: profile.designModeValue,
    moldAspect: profile.moldAspect,
    moldKey: profile.moldKey,
    moldMeasure: profile.moldMeasure,
    moldShape: profile.shapeValue,
    moldSizeLabel: profile.moldSizeLabel,
    moldTitle: profile.moldTitle,
    productLabel: profile.productLabel,
    productPrompt: profile.productPrompt,
    productShapeLabel: profile.productShapeLabel,
    productShapePrompt: profile.productShapePrompt,
    productShapeValue: profile.productShapeValue,
    productValue: profile.productValue,
    shapeLabel: profile.productShapeLabel,
    shapePrompt: profile.productShapePrompt,
    shapeValue: profile.shapeValue,
  };
}

const DESIGN_PROFILE_DATA_KEYS = [
  "designModeLabel",
  "designModePrompt",
  "designModeValue",
  "moldAspect",
  "moldKey",
  "moldMeasure",
  "moldShape",
  "moldSizeLabel",
  "moldTitle",
  "productLabel",
  "productPrompt",
  "productShapeLabel",
  "productShapePrompt",
  "productShapeValue",
  "productValue",
  "shapeLabel",
  "shapePrompt",
  "shapeValue",
];

const SKETCH_METADATA_DATA_KEYS = [
  "generationJobId",
  "projectId",
  "projectTitle",
  "sourceFileName",
  "sourceImageUrl",
  "sourceStage",
  "sourceTitle",
  "surfaceLabel",
  "surfaceValue",
];

const STORAGE_DATA_KEYS = [
  "generatedAt",
  "storageBucket",
  "storagePath",
  "storageProvider",
  "storageUrl",
];

function designProfileFieldsFromSource(source = {}) {
  const profileFields = source.profileFields && typeof source.profileFields === "object"
    ? source.profileFields
    : source;
  return designProfileFormFields(designProfileFromFields(profileFields));
}

function explicitDesignProfileKeyFromSource(source = {}) {
  const profileFields = source.profileFields && typeof source.profileFields === "object"
    ? source.profileFields
    : source;
  return {
    productValue: normalizeDesignOptionKey(
      DESIGN_PRODUCT_OPTIONS,
      profileFields.productValue || profileFields.product || "",
      ""
    ),
    shapeValue: normalizeDesignOptionKey(
      DESIGN_SHAPE_OPTIONS,
      profileFields.productShapeValue || profileFields.shapeValue || profileFields.moldShape || profileFields.productShape || "",
      ""
    ),
  };
}

function sourceMatchesActiveDesignProfile(source = {}) {
  const currentProfile = selectedDesignProfile();
  const sourceProfile = explicitDesignProfileKeyFromSource(source);
  return Boolean(
    sourceProfile.productValue &&
    sourceProfile.shapeValue &&
    sourceProfile.productValue === currentProfile.productValue &&
    sourceProfile.shapeValue === currentProfile.productShapeValue
  );
}

function savedDesignProductShapeText(source = {}) {
  const sourceProfile = explicitDesignProfileKeyFromSource(source);
  const productLabel = source.productLabel || DESIGN_PRODUCT_OPTIONS[sourceProfile.productValue]?.label || "";
  const shapeLabel =
    source.productShapeLabel ||
    source.shapeLabel ||
    DESIGN_SHAPE_OPTIONS[sourceProfile.shapeValue]?.label ||
    "";
  return [productLabel, shapeLabel].filter(Boolean).join(" / ");
}

function savedDesignSourceSubtitle(design = {}) {
  return [
    design.stage || "Tasarımlarım",
    design.projectTitle || (design.projectId ? "İsimsiz proje" : "Genel arşiv"),
    savedDesignProductShapeText(design),
  ].filter(Boolean).join(" · ");
}

function designProfileFieldsFromGenerationMetadata(metadata = {}) {
  return designProfileFormFields(designProfileFromFields({
    designModeLabel: metadata.designModeLabel,
    designModeValue: metadata.designMode,
    productLabel: metadata.productLabel,
    productShapeLabel: metadata.productShapeLabel,
    productShapeValue: metadata.productShape,
    productValue: metadata.product,
    shapeLabel: metadata.productShapeLabel,
    shapeValue: metadata.productShape,
  }));
}

function writeDesignProfileDataset(element, fields = {}) {
  if (!element) return;
  const profileFields = designProfileFieldsFromSource(fields);
  DESIGN_PROFILE_DATA_KEYS.forEach((key) => {
    element.dataset[key] = profileFields[key] || "";
  });
}

function readDesignProfileDataset(element) {
  if (!element) return designProfileFormFields();
  const fields = {};
  DESIGN_PROFILE_DATA_KEYS.forEach((key) => {
    fields[key] = element.dataset[key] || "";
  });
  return designProfileFormFields(designProfileFromFields(fields));
}

function sketchMetadataFieldsFromSource(source = {}) {
  const metadata = source.metadata && typeof source.metadata === "object"
    ? source.metadata
    : source;
  const designModeValue = metadata.designModeValue || metadata.designMode || metadata.surfaceValue || "";
  const surfaceLabel =
    metadata.surfaceLabel ||
    DESIGN_MODE_OPTIONS[designModeValue]?.surfaceLabel ||
    metadata.designModeLabel ||
    "";
  const sourceFileName = String(metadata.sourceFileName || metadata.fileName || "").trim();

  return {
    generationJobId: String(metadata.generationJobId || metadata.jobId || metadata.pendingJobId || "").trim(),
    projectId: String(metadata.projectId || "").trim(),
    projectTitle: String(metadata.projectTitle || "").trim(),
    sourceFileName,
    sourceImageUrl: safeSavedSourceImageUrl(metadata.sourceImageUrl || ""),
    sourceStage: String(metadata.sourceStage || "sketch").trim(),
    sourceTitle: String(metadata.sourceTitle || sourceFileName || "").trim(),
    surfaceLabel,
    surfaceValue: String(metadata.surfaceValue || designModeValue || "").trim(),
  };
}

function sketchMetadataFieldsFromJob(job = {}) {
  const metadata = job.metadata || {};
  return sketchMetadataFieldsFromSource({
    generationJobId: job.id || job.clientJobId || "",
    projectId: generationProjectId(job),
    projectTitle: generationProjectTitle(job),
    sourceFileName: metadata.fileName || "",
    sourceImageUrl: metadata.sourceImageUrl || "",
    sourceStage: "sketch",
    sourceTitle: metadata.fileName || "",
    surfaceLabel: DESIGN_MODE_OPTIONS[metadata.designMode]?.surfaceLabel || metadata.designModeLabel || "",
    surfaceValue: metadata.designMode || "",
  });
}

function writeSketchMetadataDataset(element, fields = {}) {
  if (!element) return;
  const metadataFields = sketchMetadataFieldsFromSource(fields);
  SKETCH_METADATA_DATA_KEYS.forEach((key) => {
    element.dataset[key] = metadataFields[key] || "";
  });
}

function readSketchMetadataDataset(element) {
  if (!element) return sketchMetadataFieldsFromSource();
  const fields = {};
  SKETCH_METADATA_DATA_KEYS.forEach((key) => {
    fields[key] = element.dataset[key] || "";
  });
  return sketchMetadataFieldsFromSource(fields);
}

function storageFieldsFromSource(source = {}) {
  const storage = source.storage && typeof source.storage === "object" ? source.storage : {};
  const storageUrl = String(source.storageUrl || storage.publicUrl || storage.url || source.url || "").trim();
  return {
    generatedAt: validIsoDate(source.generatedAt || source.createdAt || source.savedAt || ""),
    storageBucket: String(source.storageBucket || storage.bucket || "").trim(),
    storagePath: String(source.storagePath || storage.path || "").trim(),
    storageProvider: String(source.storageProvider || storage.provider || "").trim(),
    storageUrl: safePersistedImageUrl(storageUrl, "storageUrl"),
  };
}

function writeStorageDataset(element, fields = {}) {
  if (!element) return;
  const storageFields = storageFieldsFromSource(fields);
  STORAGE_DATA_KEYS.forEach((key) => {
    element.dataset[key] = storageFields[key] || "";
  });
}

function readStorageDataset(element) {
  if (!element) return storageFieldsFromSource();
  const fields = {};
  STORAGE_DATA_KEYS.forEach((key) => {
    fields[key] = element.dataset[key] || "";
  });
  return storageFieldsFromSource(fields);
}

function clearStorageDataset(element) {
  if (!element) return;
  STORAGE_DATA_KEYS.forEach((key) => {
    delete element.dataset[key];
  });
}

function clearSketchMetadataDataset(element) {
  if (!element) return;
  SKETCH_METADATA_DATA_KEYS.forEach((key) => {
    delete element.dataset[key];
  });
}

function clearDesignProfileDataset(element) {
  if (!element) return;
  DESIGN_PROFILE_DATA_KEYS.forEach((key) => {
    delete element.dataset[key];
  });
}

async function handleDirectFormUpload(event) {
  if (newDesignStudio?.classList.contains("has-results")) {
    setFinishStatusMessage("1. aşamada görsel üretildi. Yalnızca o görsel kullanılabilir.", "error");
    return;
  }
  const file = event.currentTarget.files?.[0];
  if (!file) return;

  releaseDirectFinishForm();
  const result = await inspectStageImage(file, { sketchOnly: true });
  directFinishFormFile = file;
  updateStageUploadPreview("direct-form", "", "");

  if (!result.ok) {
    directFinishForm = null;
    directFinishFormFile = null;
    renderFinishPreview(null);
    setFinishStatusMessage(`${result.message} Yeni bir tasarım seç veya temiz siyah-beyaz tasarım yükle.`, "error");
    setWorkflowForFinishStage();
    queueActiveProjectSave();
    return;
  }

  clearSketchCardSelection();
  const profileFields = designProfileFormFields();
  const persistedUrl = await persistedStageUploadImageUrl(file);
  const sourceUrl = persistedUrl || result.url;
  if (persistedUrl) {
    revokeStudioObjectUrl(result.url);
    directFinishFormFile = null;
  }
  directFinishForm = {
    ...profileFields,
    formImageUrl: sourceUrl,
    renderMode: "generated",
    sketchUrl: sourceUrl,
    subtitle: file.name,
    title: `Yüklenen tasarım · ${file.name}`,
  };
  renderFinishPreview(directFinishForm);
  updateStageUploadPreview("direct-form", "", "");
  setFinishStatusMessage(
    result.warning || "Tasarım hazır. Ürün görseli oluştur ile seçilen ürün formuna uygula.",
    result.warning ? "warning" : "success"
  );
  setWorkflowForFinishStage();
  queueActiveProjectSave();
}

async function handleDirectFinishUpload(event) {
  if (newDesignStudio?.classList.contains("has-finish-result")) {
    setMockupStatusMessage("2. aşamada görsel üretildi. Yalnızca o görsel kullanılabilir.", "error");
    return;
  }
  const file = event.currentTarget.files?.[0];
  if (!file) return;

  releaseDirectMockupFinish();
  const result = await inspectStageImage(file);
  directMockupFinishFile = file;
  updateStageUploadPreview("direct-finish", "", "");

  if (!result.ok) {
    directMockupFinish = null;
    directMockupFinishFile = null;
    renderMockupPreview(null);
    setMockupStatusMessage(`${result.message} Görsel Üretimi aşamasından yeni bir render seç veya daha temiz görsel yükle.`, "error");
    setWorkflowForVisualizationStage();
    queueActiveProjectSave();
    return;
  }

  document.querySelectorAll("[data-finish-result-card]").forEach((card) => card.classList.remove("is-selected"));
  const profileFields = designProfileFormFields();
  const persistedUrl = await persistedStageUploadImageUrl(file);
  const sourceUrl = persistedUrl || result.url;
  if (persistedUrl) {
    revokeStudioObjectUrl(result.url);
    directMockupFinishFile = null;
  }
  directMockupFinish = {
    ...profileFields,
    backgroundLabel: "Yüklenen",
    backgroundValue: "temiz",
    finishImageUrl: sourceUrl,
    metalLabel: "Yüklenen render",
    metalValue: "altin",
    renderMode: "generated",
    sketchUrl: sourceUrl,
    stoneLabel: "Yok",
    stoneValue: "yok",
    surfaceLabel: "Hazır render",
    surfaceValue: "parlak",
    subtitle: file.name,
    title: `Yüklenen ürün · ${file.name}`,
  };
  clearMockupResults();
  renderMockupPreview(directMockupFinish);
  updateStageUploadPreview("direct-finish", "", "");
  setMockupStatusMessage(
    result.warning || "Ürün fotoğrafı hazır. Fotoğraf oranını seçip Görsel oluştur.",
    result.warning ? "warning" : "success"
  );
  setWorkflowForVisualizationStage();
  queueActiveProjectSave();
}

function toggleDesignSourcePanel(stageKey) {
  const panel = document.querySelector(`[data-design-source-panel="${stageKey}"]`);
  if (!panel) return;

  const shouldOpen = panel.hidden;
  closeDesignSourcePanels(stageKey);

  if (!shouldOpen) {
    panel.hidden = true;
    return;
  }

  renderDesignSourcePanel(stageKey);
  panel.hidden = false;
}

function closeDesignSourcePanels(exceptStageKey = "") {
  document.querySelectorAll("[data-design-source-panel]").forEach((panel) => {
    if (panel.dataset.designSourcePanel !== exceptStageKey) {
      panel.hidden = true;
    }
  });
}

function renderDesignSourcePanel(stageKey) {
  const grid = document.querySelector(`[data-design-source-grid="${stageKey}"]`);
  const empty = document.querySelector(`[data-design-source-empty="${stageKey}"]`);
  if (!grid) return;

  const options = collectDesignSourceOptions(stageKey);
  replaceChildrenReleasing(grid, ...options.map((option) => createDesignSourceCard(option, stageKey)));
  grid.hidden = options.length === 0;
  if (empty) empty.hidden = options.length > 0;
}

function collectDesignSourceOptions(stageKey) {
  const options = [];
  const seenImageUrls = new Set();

  const pushOption = (option) => {
    const imageUrl = String(option.imageUrl || "").trim();
    if (!imageUrl || seenImageUrls.has(imageUrl)) return;
    seenImageUrls.add(imageUrl);
    options.push({ ...option, imageUrl });
  };

  if (stageKey === "finish") {
    // Eskiz artık şekilden bağımsız (1:1) üretiliyor; bu yüzden tüm 1. aşama
    // sonuçları, projenin şeklinden bağımsız olarak 2. aşamaya kaynak olabilir.
    // Şekil/çerçeve, projenin baştan seçili şekline göre uygulanır.
    const stageCards = currentSketchSourceCards();
    selectedStageSourceCards(stageCards, "[data-sketch-card].is-selected:not(.is-hidden)").forEach((card, index) => {
      const imageUrl = card.dataset.imageUrl || managedImageUrl(card.querySelector("[data-sketch-image]")) || "";
      pushOption({
        imageUrl,
        select: () => applyFormSourceFromCard(card),
        subtitle: card.querySelector(".sketch-body span")?.textContent || "1. aşama",
        title: card.dataset.imageLabel || card.querySelector(".sketch-body strong")?.textContent || `Tasarım ${index + 1}`,
      });
    });
  }

  // Mockup/manken (3.–4. aşama) kaynağı YALNIZCA 2. aşama (finish) çıktısıdır.
  // 1. aşama tasarımları bu aşamalarda kaynak olarak gösterilmez; yan baskılar da
  // yalnız 2. aşama çıktısında bulunur. Bu yüzden sadece finish kartları listelenir.
  if (stageKey === "mockup" || stageKey === "manken") {
    Array.from(document.querySelectorAll("[data-finish-result-card]"))
      .filter((card) => card.dataset.finishImageUrl && sourceMatchesActiveDesignProfile(card.dataset || {}))
      .forEach((card, index) => {
        pushOption({
          imageUrl: card.dataset.finishImageUrl,
          select: () => applyFinishSourceForMockup(card),
          subtitle: card.dataset.sidePrint === "1" ? "2. aşama · yan baskılı" : "2. aşama çıktısı",
          title: card.dataset.resultTitle || card.dataset.finishTitle || `Ürün görseli ${index + 1}`,
        });
      });
    return options;
  }

  collectSavedDesignSourceOptions(stageKey, seenImageUrls).forEach(pushOption);
  return options;
}

function currentSketchSourceCards() {
  return Array.from(document.querySelectorAll("[data-sketch-card]:not(.is-hidden)")).filter(sketchCardHasImage);
}

function selectedStageSourceCards(stageCards, selectedSelector) {
  const selectedCard = document.querySelector(selectedSelector);
  if (selectedCard && stageCards.includes(selectedCard)) return [selectedCard];
  return stageCards;
}

function collectSavedDesignSourceOptions(stageKey, seenImageUrls) {
  const matchSketchSource = (design) => design.sourceStage === "sketch" || /eskiz|taslak|tasarım|tasarim/i.test(design.stage || "");
  const stageMatchers = {
    finish: matchSketchSource,
    mockup: matchSketchSource,
    manken: matchSketchSource,
  };
  const matcher = stageMatchers[stageKey];
  if (!matcher) return [];

  // Eskiz şekilden bağımsız (1:1) üretildiğinden, arşivdeki tüm 1. aşama tasarımları
  // projenin şeklinden bağımsız olarak kaynak gösterilir; çerçeve 2. aşamada projenin
  // şekline göre uygulanır (bkz. applySavedDesignSource).
  return readSavedDesigns()
    .filter((design) => (
      design.imageUrl &&
      !isSavedDesignLoading(design) &&
      matcher(design) &&
      !seenImageUrls.has(design.imageUrl)
    ))
    .map((design) => ({
      imageUrl: design.imageUrl,
      select: () => applySavedDesignSource(stageKey, design),
      subtitle: savedDesignSourceSubtitle(design),
      title: design.title || "Kaydedilen tasarım",
    }));
}

function createDesignSourceCard(option, stageKey) {
  const button = document.createElement("button");
  button.className = "source-design-card";
  button.type = "button";
  button.dataset.sourceStage = stageKey;

  const visual = document.createElement("div");
  visual.className = "source-design-visual";

  if (option.visualNode) {
    visual.append(option.visualNode);
  } else {
    const image = document.createElement("img");
    image.alt = option.title || "Tasarımdan seç";
    setManagedImageSrc(image, option.imageUrl);
    visual.append(image);
  }

  const title = document.createElement("span");
  title.className = "source-design-title";
  title.textContent = option.title || "Tasarım";

  const subtitle = document.createElement("span");
  subtitle.className = "source-design-subtitle";
  subtitle.textContent = option.subtitle || "Önceki aşama";

  button.append(visual, title, subtitle);
  button.addEventListener("click", () => {
    option.select();
    closeDesignSourcePanels();
  });

  return button;
}

function clearStageUploadInput(prefix) {
  const input = document.querySelector(`[data-${prefix}-upload]`);
  if (input) input.value = "";
}

function clearSketchCardSelection() {
  document.querySelectorAll("[data-sketch-card]").forEach((card) => card.classList.remove("is-selected"));
}

function applyFormSourceFromCard(card) {
  releaseDirectFinishForm();
  clearStageUploadInput("direct-form");
  selectSketch(card);

  const formInfo = getSelectedFormInfo();
  updateStageUploadPreview("direct-form", "", "");
  renderFinishPreview(formInfo);
  setFinishStatusMessage("Tasarımlardan seçilen görsel hazır. Ürün görseli oluştur ile seçilen forma uygula.", "success");
  setWorkflowForFinishStage();
  queueActiveProjectSave();
}

function applySketchSourceForMockup(card) {
  releaseDirectMockupFinish();
  clearStageUploadInput("direct-finish");
  document.querySelectorAll("[data-finish-result-card]").forEach((finishCard) => finishCard.classList.remove("is-selected"));

  const profileFields = readDesignProfileDataset(card);
  const metalChip = readSelectedChip("metal");
  const imageUrl = card.dataset.imageUrl || managedImageUrl(card.querySelector("[data-sketch-image]")) || "";
  const sourceUrl = safePersistedImageUrl(card.dataset.stageSourceUrl || imageUrl, "stageSourceUrl") || imageUrl;
  const title = card.dataset.imageLabel || card.querySelector(".sketch-body strong")?.textContent || "Tasarım";
  directMockupFinish = {
    ...profileFields,
    backgroundLabel: "Tasarım",
    backgroundValue: "temiz",
    finishImageUrl: "",
    metalLabel: metalChip.label || PROJECT_METAL_OPTIONS.gumus.label,
    metalValue: metalChip.value || "gumus",
    moldTitle: title,
    renderMode: "sketch",
    sketchUrl: sourceUrl,
    stoneLabel: "Yok",
    stoneValue: "yok",
    surfaceLabel: "Parlak",
    surfaceValue: "parlak",
    subtitle: card.querySelector(".sketch-body span")?.textContent || "1. aşama tasarımı",
    title,
  };
  clearMockupResults();
  updateStageUploadPreview("direct-finish", "", "");
  renderMockupPreview(directMockupFinish);
  setMockupStatusMessage("1. aşama tasarımı seçildi. Fotoğraf oranını seçip Görsel oluştur.", "success");
  setWorkflowForVisualizationStage();
  queueActiveProjectSave();
}

// 3./4. aşamada kaynak seçicisinden bir 2. aşama (finish) çıktısı seçilince çağrılır.
// directMockupFinish'i temizleyip ilgili finish kartını "seçili" yapar; böylece
// getSelectedFinishInfo() o kartı (yan baskı bilgisiyle birlikte) okur ve önizleme güncellenir.
function applyFinishSourceForMockup(card) {
  releaseDirectMockupFinish();
  clearStageUploadInput("direct-finish");
  clearSketchCardSelection();
  document.querySelectorAll("[data-finish-result-card]").forEach((finishCard) => {
    finishCard.classList.toggle("is-selected", finishCard === card);
  });
  clearMockupResults();
  updateStageUploadPreview("direct-finish", "", "");
  const finishInfo = getSelectedFinishInfo();
  renderMockupPreview(finishInfo);
  setMockupStatusMessage("2. aşama çıktısı seçildi. Fotoğraf oranını seçip Görsel oluştur.", "success");
  setWorkflowForVisualizationStage();
  queueActiveProjectSave();
}

function applySavedDesignSource(stageKey, design) {
  if (stageKey === "finish") {
    document.querySelectorAll("[data-sketch-card]").forEach((card) => card.classList.remove("is-selected"));
    releaseDirectFinishForm();
    // Eskiz şekilden bağımsız olduğundan ürün+şekil aktif projeden (baştan sabit)
    // alınır; yüzey modu (detaylı/minimalist) eskizden korunur çünkü görselin piksel
    // doğasını o belirler. Böylece arşivdeki herhangi bir eskiz, projenin şeklinde
    // ürün görseline dönüştürülebilir.
    const activeProfile = selectedDesignProfile();
    const profileFields = {
      ...designProfileFieldsFromSource(design),
      moldShape: activeProfile.productShapeValue,
      productLabel: activeProfile.productLabel,
      productPrompt: activeProfile.productPrompt,
      productShapeLabel: activeProfile.productShapeLabel,
      productShapePrompt: activeProfile.productShapePrompt,
      productShapeValue: activeProfile.productShapeValue,
      productValue: activeProfile.productValue,
      shapeLabel: activeProfile.productShapeLabel,
      shapePrompt: activeProfile.productShapePrompt,
      shapeValue: activeProfile.productShapeValue,
    };
    const metadataFields = sketchMetadataFieldsFromSource(design);
    const sourceUrl = safePersistedImageUrl(
      design.stageSourceUrl || design.sourceSketchUrl || design.imageUrl || "",
      "stageSourceUrl"
    ) || design.imageUrl;
    directFinishForm = {
      ...profileFields,
      ...metadataFields,
      formImageUrl: sourceUrl,
      moldTitle: "Tasarımlardan seçilen tasarım",
      renderMode: "generated",
      sketchUrl: sourceUrl,
      subtitle: design.stage || "Tasarımlarım",
      title: design.title || "Kaydedilen tasarım",
    };
    clearStageUploadInput("direct-form");
    updateStageUploadPreview("direct-form", "", "");
    renderFinishPreview(directFinishForm);
    setFinishStatusMessage("Tasarımlardan seçilen görsel hazır. Ürün görseli oluştur ile seçilen forma uygula.", "success");
    setWorkflowForFinishStage();
    queueActiveProjectSave();
    return;
  }

  if (stageKey === "mockup" || stageKey === "manken") {
    document.querySelectorAll("[data-finish-result-card]").forEach((card) => card.classList.remove("is-selected"));
    releaseDirectMockupFinish();
    const profileFields = designProfileFieldsFromSource(design);
    const metalChip = readSelectedChip("metal");
    const sourceUrl = safePersistedImageUrl(
      design.stageSourceUrl || design.sourceSketchUrl || design.imageUrl || "",
      "stageSourceUrl"
    ) || design.imageUrl;
    directMockupFinish = {
      ...profileFields,
      backgroundLabel: "Tasarımlarım",
      backgroundValue: "temiz",
      finishImageUrl: "",
      metalLabel: metalChip.label || PROJECT_METAL_OPTIONS.gumus.label,
      metalValue: metalChip.value || "gumus",
      moldTitle: "Tasarımlardan seçilen tasarım",
      renderMode: "sketch",
      sketchUrl: sourceUrl,
      stoneLabel: "Yok",
      stoneValue: "yok",
      surfaceLabel: "Parlak",
      surfaceValue: "parlak",
      subtitle: design.stage || "Tasarımlarım",
      title: design.title || "Kaydedilen tasarım",
    };
    clearMockupResults();
    clearStageUploadInput("direct-finish");
    updateStageUploadPreview("direct-finish", "", "");
    renderMockupPreview(directMockupFinish);
    setMockupStatusMessage("Tasarımlardan seçilen ürün hazır. Fotoğraf oranını seçip Görsel oluştur.", "success");
    setWorkflowForVisualizationStage();
    queueActiveProjectSave();
  }
}

function updateStageUploadPreview(prefix, imageUrl, fileName, acceptedMessage = "Görsel temel kontrolden geçirildi.") {
  const dropzone = document.querySelector(`[data-${prefix}-dropzone]`);
  const preview = document.querySelector(`[data-${prefix}-preview]`);
  const label = document.querySelector(`[data-${prefix}-label]`);
  const hint = document.querySelector(`[data-${prefix}-hint]`);

  if (label && !label.dataset.defaultText) label.dataset.defaultText = label.textContent;
  if (hint && !hint.dataset.defaultText) hint.dataset.defaultText = hint.textContent;

  if (preview && imageUrl) {
    if ((preview.getAttribute("src") || "") !== imageUrl) releaseImageElement(preview);
    preview.src = imageUrl;
    preview.hidden = false;
  } else if (preview) {
    releaseImageElement(preview);
    preview.hidden = true;
  }
  dropzone?.classList.toggle("has-preview", Boolean(imageUrl));
  if (label) label.textContent = imageUrl && fileName ? fileName : label.dataset.defaultText || label.textContent;
  if (hint) hint.textContent = imageUrl && fileName ? acceptedMessage : hint.dataset.defaultText || hint.textContent;
}

async function inspectStageImage(file, options = {}) {
  if (!STAGE_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "Lütfen JPEG, PNG veya WebP türünde bir görsel yükle.", url: "" };
  }

  const meta = await readImageMeta(file);
  const minSide = Math.min(meta.width, meta.height);
  const ratio = meta.width / meta.height;

  if (!meta.width || !meta.height) {
    revokeStudioObjectUrl(meta.url);
    return {
      ...meta,
      ok: false,
      message: meta.message || "Görsel okunamadı.",
    };
  }

  if (minSide < 420) {
    revokeStudioObjectUrl(meta.url);
    return {
      ...meta,
      ok: false,
      message: "Bu görsel bu aşama için çok düşük çözünürlüklü görünüyor.",
    };
  }

  if (ratio > 4 || ratio < 0.25) {
    revokeStudioObjectUrl(meta.url);
    return {
      ...meta,
      ok: false,
      message: "Bu görselin oranı takı yüzeyine yerleşim için fazla uç görünüyor.",
    };
  }

  if (options.sketchOnly) {
    const sketchResult = inspectSketchOnlyImage(meta.sketchStats);
    if (!sketchResult.ok) {
      revokeStudioObjectUrl(meta.url);
      return {
        ...meta,
        ok: false,
        message: sketchResult.message,
      };
    }
  }

  return {
    ...meta,
    ok: true,
    warning:
      minSide < 800
        ? "Görsel kabul edildi; daha net sonuç için yüksek çözünürlüklü ve temiz motif tercih et."
        : "",
  };
}

function inspectSketchOnlyImage(stats) {
  if (!stats?.visiblePixelCount) {
    return { ok: false, message: "Tasarım kontrolü için görsel okunamadı." };
  }

  if (stats.coloredRatio > 0.06 || stats.averageSaturation > 0.12) {
    return { ok: false, message: FINISH_SKETCH_ONLY_MESSAGE };
  }

  if (stats.lightRatio < 0.38) {
    return { ok: false, message: FINISH_SKETCH_ONLY_MESSAGE };
  }

  if (stats.darkRatio < 0.003) {
    return { ok: false, message: "Tasarım çizgisi algılanamadı. Siyah-beyaz çizgi tasarım yükle." };
  }

  if (stats.midToneRatio > 0.5 && stats.nearBlackWhiteRatio < 0.48) {
    return { ok: false, message: FINISH_SKETCH_ONLY_MESSAGE };
  }

  return { ok: true };
}

function readImageMeta(file) {
  return new Promise((resolve) => {
    const url = createStudioObjectUrl(file);
    const image = new Image();
    image.addEventListener("load", () => {
      let sketchStats = null;
      try {
        sketchStats = readSketchImageStats(image);
      } catch {
        sketchStats = null;
      }

      resolve({
        height: image.naturalHeight || 0,
        sketchStats,
        url,
        width: image.naturalWidth || 0,
      });
      image.removeAttribute("src");
    });
    image.addEventListener("error", () => {
      resolve({ height: 0, ok: false, message: "Görsel okunamadı.", url, width: 0 });
      image.removeAttribute("src");
    });
    image.src = url;
  });
}

function readSketchImageStats(image) {
  const sourceWidth = image.naturalWidth || 0;
  const sourceHeight = image.naturalHeight || 0;
  if (!sourceWidth || !sourceHeight) return null;

  const maxSide = 80;
  const scale = Math.min(maxSide / sourceWidth, maxSide / sourceHeight, 1);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  let colored = 0;
  let dark = 0;
  let light = 0;
  let midTone = 0;
  let nearBlackWhite = 0;
  let saturationTotal = 0;
  let visiblePixelCount = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3];
    if (alpha < 24) continue;

    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const saturation = max > 0 ? (max - min) / max : 0;
    const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

    visiblePixelCount += 1;
    saturationTotal += saturation;
    if (saturation > 0.18 && max - min > 24) colored += 1;
    if (luma < 95) dark += 1;
    else if (luma > 225) light += 1;
    else midTone += 1;
    if (luma < 75 || luma > 235) nearBlackWhite += 1;
  }

  if (!visiblePixelCount) {
    releaseCanvas(canvas);
    return null;
  }

  const stats = {
    averageSaturation: saturationTotal / visiblePixelCount,
    coloredRatio: colored / visiblePixelCount,
    darkRatio: dark / visiblePixelCount,
    lightRatio: light / visiblePixelCount,
    midToneRatio: midTone / visiblePixelCount,
    nearBlackWhiteRatio: nearBlackWhite / visiblePixelCount,
    visiblePixelCount,
  };
  releaseCanvas(canvas);
  return stats;
}

function getSelectedFormInfo() {
  if (directFinishForm) return applyRingMoldToFormInfo(directFinishForm);

  const sketch = getSelectedSketchInfo();
  if (!sketch) return null;
  const sourceUrl = sketch.stageSourceUrl || sketch.url;

  return applyRingMoldToFormInfo({
    ...sketch,
    formImageUrl: sourceUrl,
    moldTitle: "Tasarım",
    renderMode: "generated",
    sketchUrl: sourceUrl,
    sourceSketchUrl: sourceUrl,
    subtitle: "Ürün / Tasarım",
    title: sketch.label || "Seçili tasarım",
  });
}

function setFinishStatusMessage(message, tone) {
  const el = document.querySelector("[data-finish-status-msg]");
  if (!el) return;
  const visible = isVisibleStatusTone(tone);
  el.textContent = visible ? message || "" : "";
  el.classList.toggle("is-error", visible && tone === "error");
  el.classList.toggle("is-success", visible && tone === "notice");
  el.classList.toggle("is-warning", visible && tone === "warning");
}

function enterFinishStage(options = {}) {
  const allowMissing = options.allowMissing === true;
  const formInfo = getSelectedFormInfo();
  if (!formInfo && !allowMissing) {
    setFinishStatusMessage("Görsel Üretimi aşaması için önce bir tasarım seç.", "error");
    return;
  }

  const sketchPanel = document.querySelector('[data-stage-panel="sketch"]');
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  const mockupPanel = document.querySelector('[data-stage-panel="mockup"]');
  const mankenPanel = document.querySelector('[data-stage-panel="manken"]');

  if (formInfo && finishPanel) {
    finishPanel.dataset.sourceId = formInfo.title;
  } else if (!formInfo && finishPanel) {
    delete finishPanel.dataset.sourceId;
  }

  newDesignStudio?.classList.remove("is-form-stage", "is-mockup-stage", "is-manken-stage");
  newDesignStudio?.classList.add("is-finish-stage");
  sketchPanel?.setAttribute("hidden", "");
  finishPanel?.removeAttribute("hidden");
  mockupPanel?.setAttribute("hidden", "");
  mankenPanel?.setAttribute("hidden", "");
  renderFinishPreview(formInfo);
  setWorkflowForFinishStage();
  setMockupStepReady(Boolean(getSelectedFinishInfo()));
  if (!formInfo) {
    setFinishStatusMessage(
      "Görsel Üretimi için 1. aşama sonuçlarından birini seç veya temiz siyah-beyaz tasarım yükle.",
      "warning"
    );
  } else {
    setFinishStatusMessage("");
  }
  applyStageRestrictions();
  scheduleManagedImageVisibilityRefresh();
  queueActiveProjectSave();
}

function exitFinishStage() {
  const sketchPanel = document.querySelector('[data-stage-panel="sketch"]');
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  const mockupPanel = document.querySelector('[data-stage-panel="mockup"]');
  const mankenPanel = document.querySelector('[data-stage-panel="manken"]');

  newDesignStudio?.classList.remove("is-form-stage", "is-finish-stage", "is-mockup-stage", "is-manken-stage");
  sketchPanel?.removeAttribute("hidden");
  finishPanel?.setAttribute("hidden", "");
  mockupPanel?.setAttribute("hidden", "");
  mankenPanel?.setAttribute("hidden", "");
  setWorkflowForSketchStage();
  applyStageRestrictions();
  setFormStepReady(Boolean(getSelectedSketchInfo()));
  scheduleManagedImageVisibilityRefresh();
  queueActiveProjectSave();
}

function renderFinishPreview(formInfo) {
  const slot = document.querySelector("[data-finish-form-preview]");
  updateFinishHandoffSummary(formInfo);
  if (!slot) return;
  if (!formInfo) {
    replaceChildrenReleasing(slot);
    return;
  }
  replaceChildrenReleasing(slot, createFormVisual(formInfo));
}

function updateFinishHandoffSummary(formInfo) {
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  if (!finishPanel) return;

  const profile = formInfo ? designProfileFromFields(formInfo) : selectedDesignProfile();
  const summaryValues = {
    "[data-design-product-summary]": profile.productLabel,
    "[data-design-shape-summary]": profile.productShapeLabel,
    "[data-design-mode-summary]": profile.designModeLabel,
  };

  Object.entries(summaryValues).forEach(([selector, value]) => {
    finishPanel.querySelectorAll(selector).forEach((item) => {
      item.textContent = value || "";
    });
  });

  // Yan baskı seçeneği yalnızca yüzükte anlamlı; diğer ürünlerde gizle.
  const sidePrintGroup = finishPanel.querySelector("[data-side-print-group]");
  if (sidePrintGroup) {
    const isRing = profile.productValue === "yuzuk";
    sidePrintGroup.hidden = !isRing;
    sidePrintGroup.setAttribute("aria-hidden", isRing ? "false" : "true");
  }
}

async function generateFinishResults() {
  if (isFinishGenerating) return;

  const formInfo = getSelectedFormInfo();
  if (!formInfo) {
    setFinishStatusMessage("Ürün görseli oluşturmak için seçili veya yüklenen bir tasarım görseli gerekli.", "error");
    return;
  }

  const metal = readSelectedChip("metal");
  const surface = readSelectedChip("surface");
  const stone = readSelectedChip("stone");
  const background = readSelectedChip("background");
  const sidePrint = readSelectedChip("side-print");
  const { creditCost, finishCount } = selectedFinishConfig();
  const generationLabel = `${finishCount} ürün görseli oluşturma`;
  if (!ensureCreditsForGeneration({ amount: creditCost, label: generationLabel, stage: "finish" })) return;
  const useLocalComposite = shouldUseLocalFinishComposite();
  const useRealApi = !useLocalComposite && shouldUseRealFinishApi();
  const finishFormInfo = resolveFinishFormInfoForMetal(formInfo, metal);

  setFinishGeneratingState(true);
  showResultLoading("finish", finishCount);
  setFinishStatusMessage(
    useLocalComposite
      ? "AI kullanmadan, tarayıcı içinde tasarım seçilen ürün formuna yerleştiriliyor..."
      : useRealApi
        ? "Tasarım seçilen ürün formuna uygulanıyor. Tasarım çizgileri hazırlanıyor..."
        : "Test modu aktif. API çağrısı yapmadan örnek ürün görseli kartları hazırlanıyor..."
  );
  try {
    const results = useLocalComposite
      ? await generateLocalFinishResults({ background, finishCount, formInfo: finishFormInfo, metal, stone, surface })
      : useRealApi
        ? await generateRealFinishResults({
            background,
            creditCost,
            finishCount,
            formInfo: finishFormInfo,
            generationLabel,
            metal,
            sidePrint,
            stone,
            surface,
          })
        : await generateDummyFinishResults({ background, finishCount, formInfo: finishFormInfo, metal, stone, surface });
    if (useLocalComposite || !useRealApi) {
      showFinishResults(results, { append: true });
      const autoSaveResult = await autoSaveFinishResultsToArchive(results);
      spendCredits({ amount: creditCost, label: generationLabel, stage: "finish" });
      setFinishStatusMessage(
        `${results.length} ürün görseli hazır. ${creditCost} kredi harcandı. Beğendiğin ürünü seçince Mockup / Manken aşaması açılır.${formatAutoSaveStatusSuffix(autoSaveResult)}`,
        "success"
      );
    }
  } catch (error) {
    removeResultLoading("finish");
    setFinishStatusMessage(error?.message || "Ürün görseli hazırlanamadı.", "error");
  } finally {
    setFinishGeneratingState(false);
  }
}

async function generateDummyFinishResults(options) {
  await new Promise((resolve) => setTimeout(resolve, 360));
  const { background, finishCount, formInfo, metal, stone, surface } = options;

  return Array.from({ length: finishCount }, (_, index) => ({
    background,
    formInfo,
    id: `finish-${Date.now()}-${index}`,
    index: index + 1,
    metal,
    renderMode: "composite",
    stone,
    surface,
  }));
}

async function generateLocalFinishResults(options) {
  await delay(120);
  const { background, finishCount, formInfo, metal, stone, surface } = options;
  const manifest = await loadRingTemplateManifest();
  const sourceUrl = await localFinishSourceUrl(formInfo);

  return Promise.all(Array.from({ length: finishCount }, async (_, index) => ({
    background,
    formInfo,
    id: `finish-local-${Date.now()}-${index}`,
    imageUrl: await renderLocalFinishComposite({
      background,
      formInfo,
      index,
      manifest,
      metal,
      sourceUrl,
      surface,
    }),
    index: index + 1,
    metal,
    renderMode: "generated",
    stone,
    surface,
  })));
}

async function localFinishSourceUrl(formInfo = {}) {
  const sourceUrl = formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "";
  if (sourceUrl.startsWith("data:image/") || sourceUrl.startsWith("blob:") || /^https?:\/\//i.test(sourceUrl)) {
    return sourceUrl;
  }

  if (
    directFinishFormFile &&
    directFinishForm &&
    [directFinishForm.formImageUrl, directFinishForm.sourceFormUrl, directFinishForm.sketchUrl].includes(sourceUrl)
  ) {
    return readFileAsDataUrl(directFinishFormFile);
  }

  throw new Error("Tasarım görseli tarayıcı içinde okunamadı. Görseli yeniden yükleyip tekrar dene.");
}

async function loadRingTemplateManifest() {
  if (!ringTemplateManifestPromise) {
    ringTemplateManifestPromise = fetch(RING_TEMPLATE_MANIFEST_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Ürün template manifest dosyası yüklenemedi.");
        return response.json();
      });
  }

  return ringTemplateManifestPromise;
}

// Yan baskı: "Evet" seçilince sol ve sağ omuz için ayrı emblem seçicileri açılır.
// Seçenekler manifest'teki sidePrint.yuzuk.options listesinden gelir; her emblem
// hem solda hem sağda listelenir. Kullanıcının seçtikleri payload'a eklenir ve
// 2. aşamada sol seçtiği sola, sağ seçtiği sağa basılır.
let sidePrintEmblemPickersReady = false;
async function initSidePrintEmblemPickers() {
  const leftBox = document.querySelector('[data-chip-group="side-emblem-left"]');
  const rightBox = document.querySelector('[data-chip-group="side-emblem-right"]');
  if (!leftBox || !rightBox) return;
  bindSidePrintToggle();
  if (sidePrintEmblemPickersReady) return;
  let manifest;
  try {
    manifest = await loadRingTemplateManifest();
  } catch (error) {
    console.warn("[side-print] manifest yüklenemedi, emblem seçiciler boş kaldı.", error);
    return;
  }
  const config = manifest?.sidePrint?.yuzuk;
  const options = Array.isArray(config?.options) ? config.options : [];
  if (!options.length) return;
  sidePrintConfigCache = config;
  const defaultKey = String(config?.defaultKey || "yuzuk");
  const pattern = typeof config?.assetPattern === "string"
    ? config.assetPattern
    : "side/shoulder-{key}-{side}.png";
  await Promise.all([
    buildSideEmblemChips(leftBox, "left", options, defaultKey, pattern, config.assetLeft, config),
    buildSideEmblemChips(rightBox, "right", options, defaultKey, pattern, config.assetRight, config),
  ]);
  sidePrintEmblemPickersReady = true;
  updateSideEmblemDefaultThumbs();
  updateSidePrintOptionsVisibility();
  updateSidePrintPreviews();
}

async function buildSideEmblemChips(container, side, options, defaultKey, pattern, fallbackAsset, config) {
  container.textContent = "";
  const chips = await Promise.all(options.map(async (opt) => {
    const key = String(opt?.key || "").trim();
    if (!key) return null;
    const labelText = String(opt?.label || key);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "option-chip side-emblem-chip" + (key === defaultKey ? " is-selected" : "");
    chip.dataset.emblemKey = key;
    chip.setAttribute("aria-label", labelText);
    chip.title = labelText;

    const img = document.createElement("img");
    img.className = "side-emblem-thumb";
    img.alt = labelText;
    img.decoding = "async";
    img.src = await resolveSideEmblemThumbSrc(pattern, key, fallbackAsset, { config, defaultKey });
    img.addEventListener("error", () => {
      if (img.dataset.finalFallbackTried) return;
      img.dataset.finalFallbackTried = "1";
      img.src = ringTemplateAssetUrl(fallbackAsset);
    });

    chip.append(img);
    chip.addEventListener("click", () => {
      container.querySelectorAll(".side-emblem-chip").forEach((item) => {
        item.classList.toggle("is-selected", item === chip);
      });
      drawSidePreview(side);
    });
    return chip;
  }));
  container.append(...chips.filter(Boolean));
}

async function resolveSideEmblemThumbSrc(pattern, key, fallbackAsset, options = {}) {
  // Kanonik sıra: her zaman önce -left, sonra -right. Böylece sol ve sağ picker
  // aynı emblem için AYNI görseli gösterir ve bu görsel önizleme/çıktıyla birebir
  // eşleşir (backend ve drawSidePreview de aynı kanonik sırayı kullanır).
  const isDefaultKey = key === String(options.defaultKey || "");
  const candidates = [
    isDefaultKey ? selectedSidePrintMoldAsset(options.config, "left") : "",
    pattern.replace("{key}", key).replace("{side}", "left"),
    pattern.replace("{key}", key).replace("{side}", "right"),
    fallbackAsset,
  ]
    .filter(Boolean)
    .map(ringTemplateAssetUrl);
  for (const src of [...new Set(candidates)]) {
    try {
      await loadPreviewImage(src);
      return src;
    } catch {
      // Birçok emblem tek taraflı dosyalanıyor; sonraki adaya düş.
    }
  }
  return ringTemplateAssetUrl(fallbackAsset);
}

function selectedSidePrintMoldAsset(config, side = "left") {
  if (!config) return "";
  const metal = normalizeFinishMetalValue(readSelectedChip("metal")?.value || "gumus");
  const mold = config.molds?.[metal] || {};
  return side === "right"
    ? mold.assetRight || config.assetRight || config.assetLeft || ""
    : mold.assetLeft || config.assetLeft || config.assetRight || "";
}

function updateSideEmblemDefaultThumbs() {
  const cfg = sidePrintConfigCache;
  if (!cfg) return;
  const defaultKey = String(cfg.defaultKey || "yuzuk");
  const thumbAsset = selectedSidePrintMoldAsset(cfg, "left");
  if (!thumbAsset) return;
  const thumbSrc = ringTemplateAssetUrl(thumbAsset);
  document
    .querySelectorAll(`.side-emblem-chip[data-emblem-key="${defaultKey}"] .side-emblem-thumb`)
    .forEach((img) => {
      delete img.dataset.finalFallbackTried;
      if (img.getAttribute("src") !== thumbSrc) img.src = thumbSrc;
    });
}

// Canlı önizleme: seçilen emblemi yan yüzük kalıbının üstünde (multiply) çizer;
// backend'deki emblemPlacement ile aynı oranları kullanır.
let sidePrintConfigCache = null;
const sidePrintImageCache = new Map();
function loadPreviewImage(src) {
  if (sidePrintImageCache.has(src)) return sidePrintImageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = src;
  });
  sidePrintImageCache.set(src, promise);
  return promise;
}

async function drawSidePreview(side) {
  const cfg = sidePrintConfigCache;
  const canvas = document.querySelector(`[data-side-preview="${side}"]`);
  if (!cfg || !canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const S = canvas.width;
  ctx.clearRect(0, 0, S, S);
  const moldRel = selectedSidePrintMoldAsset(cfg, side);
  try {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(await loadPreviewImage(ringTemplateAssetUrl(moldRel)), 0, 0, S, S);
  } catch {
    return;
  }
  const key = readSidePrintEmblems()[side];
  const defaultKey = String(cfg.defaultKey || "yuzuk");
  if (!key || key === defaultKey) return;
  const pattern = typeof cfg.assetPattern === "string" ? cfg.assetPattern : "side/shoulder-{key}-{side}.png";
  let emblem = null;
  for (const s of ["left", "right"]) {
    try {
      emblem = await loadPreviewImage(ringTemplateAssetUrl(pattern.replace("{key}", key).replace("{side}", s)));
      break;
    } catch {
      // diğer tarafı dene
    }
  }
  if (!emblem) return;
  const p = cfg.emblemPlacement || {};
  const box = (Number(p.box) || 0.35) * S;
  const cx = (Number(p.centerX) || 0.5) * S;
  const cy = (Number(p.centerY) || 0.37) * S;
  const ratio = Math.min(box / emblem.naturalWidth, box / emblem.naturalHeight);
  const w = emblem.naturalWidth * ratio;
  const h = emblem.naturalHeight * ratio;
  // Backend ile aynı: saf siyah yerine yumuşatılmış multiply → emblem, kalıbın
  // metal tonunun daha koyu/mat hali (kazıma görünümü) olur. multiply + globalAlpha
  // siyahı dest*(1-opacity)'ye indirir, beyaz zemini etkilemez.
  const opacity = Math.min(1, Math.max(0.1, Number(cfg.emblemOpacity ?? 0.6)));
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = opacity;
  ctx.drawImage(emblem, cx - w / 2, cy - h / 2, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function updateSidePrintPreviews() {
  drawSidePreview("left");
  drawSidePreview("right");
}

function bindSidePrintToggle() {
  document.querySelectorAll('[data-chip-group="side-print"] .option-chip').forEach((chip) => {
    if (chip.dataset.sideToggleBound) return;
    chip.dataset.sideToggleBound = "1";
    chip.addEventListener("click", () => {
      setSidePrintOptionsVisible(chip.dataset.sidePrint === "evet");
    });
  });
}

function updateSidePrintOptionsVisibility() {
  setSidePrintOptionsVisible(readSelectedChip("side-print")?.value === "evet");
}

function setSidePrintOptionsVisible(visible) {
  const box = document.querySelector("[data-side-print-options]");
  if (!box) return;
  box.hidden = !visible;
  box.setAttribute("aria-hidden", visible ? "false" : "true");
  if (visible) updateSidePrintPreviews();
}

// Sol ve sağ omuz için seçili emblem anahtarlarını okur (seçim yoksa düz omuz).
function readSidePrintEmblems() {
  const read = (side) => {
    const chip = document.querySelector(
      `[data-chip-group="side-emblem-${side}"] .side-emblem-chip.is-selected`
    );
    return chip?.dataset.emblemKey || "yuzuk";
  };
  return { left: read("left"), right: read("right") };
}

async function renderLocalFinishComposite({ formInfo, index, manifest, metal, sourceUrl, surface }) {
  const template = localProductTemplate(manifest, formInfo, metal);
  const canvasSize = manifest.defaults?.canvas || { width: 1024, height: 1024 };
  const canvas = document.createElement("canvas");
  canvas.width = Number(canvasSize.width) || 1024;
  canvas.height = Number(canvasSize.height) || 1024;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas oluşturulamadı.");

  const [templateImage, sourceImage] = await Promise.all([
    loadImageElement(localTemplateImageUrl(template, canvasSize)),
    loadImageElement(sourceUrl),
  ]);

  drawLocalTemplateImage(context, templateImage, canvas.width, canvas.height, template);

  const engraving = applyLocalDesignMode(
    mergeLocalEngravingConfig(manifest.defaults?.engraving, template.engraving),
    formInfo.designModeValue,
    metal
  );
  const layer = createLocalEngravingLayer({
    designMode: formInfo.designModeValue,
    engraving,
    index,
    metal,
    placement: template.placement,
    sourceImage,
    surface,
    template,
  });

  drawLocalEngravingLayer(context, layer, template.placement, template.shape, engraving);
  releaseCanvas(layer);
  templateImage.removeAttribute("src");
  sourceImage.removeAttribute("src");

  try {
    const outputUrl = canvas.toDataURL("image/png");
    releaseCanvas(canvas);
    return outputUrl;
  } catch {
    releaseCanvas(canvas);
    throw new Error("Bu tasarım tarayıcı güvenlik kısıtı nedeniyle işlenemedi. Görseli indirip yeniden yükleyerek deneyebilirsin.");
  }
}

function localProductTemplate(manifest, formInfo = {}, metal = {}) {
  const productValue = formInfo.productValue || "yuzuk";
  const shapeValue = formInfo.productShapeValue || formInfo.shapeValue || "yuvarlak";
  const isYuzukPhoto = productValue === "yuzuk" && shapeValue !== "dikdortgen";
  const isKolyePhoto = productValue === "kolye";
  const usePhotoTemplate = isYuzukPhoto || isKolyePhoto;
  const key = usePhotoTemplate
    ? finishRingMoldKeyFor(shapeValue, metal?.value, productValue)
    : formInfo.moldKey || DESIGN_SHAPE_OPTIONS[shapeValue]?.ringMold || selectedRingMoldConfig().key;
  const rawTemplate = usePhotoTemplate
    ? manifest?.templates?.[key]
    : null;
  if (!rawTemplate) return localFallbackProductTemplate(formInfo);
  const rawPlacement = rawTemplate.placement || {};
  const basePlacement = {
    centerX: Number(rawPlacement.centerX) || 512,
    centerY: Number(rawPlacement.centerY) || 454,
    height: Math.max(1, Number(rawPlacement.height) || 334),
    width: Math.max(1, Number(rawPlacement.width) || 334),
  };
  const { placement, templateCrop } = centerLocalPendantTemplatePlacement(
    basePlacement,
    productValue,
    manifest?.defaults?.canvas
  );

  return {
    engraving: rawTemplate.engraving || {},
    file: rawTemplate.file || "",
    key,
    product: productValue,
    shape: rawTemplate.shape || "yuvarlak",
    placement,
    templateCrop,
  };
}

function centerLocalPendantTemplatePlacement(placement, productValue, canvasSize = {}) {
  if (productValue !== "kolye") return { placement, templateCrop: null };

  const canvasWidth = Math.max(1, Number(canvasSize?.width) || 1024);
  const sideWidth = canvasWidth / 2;
  const sourceLeft = placement.centerX > sideWidth ? canvasWidth - sideWidth : 0;
  const targetLeft = (canvasWidth - sideWidth) / 2;

  return {
    placement: {
      ...placement,
      centerX: placement.centerX - sourceLeft + targetLeft,
    },
    templateCrop: {
      sourceLeftRatio: sourceLeft / canvasWidth,
      sourceWidthRatio: sideWidth / canvasWidth,
      targetLeftRatio: targetLeft / canvasWidth,
      targetWidthRatio: sideWidth / canvasWidth,
    },
  };
}

function localFallbackProductTemplate(formInfo = {}) {
  const productValue = formInfo.productValue || "yuzuk";
  const shapeValue = formInfo.productShapeValue || formInfo.shapeValue || "yuvarlak";
  const isPendant = productValue === "kolye";
  const placementByShape = {
    dikdortgen: { centerX: 512, centerY: isPendant ? 538 : 396, height: isPendant ? 292 : 284, width: isPendant ? 452 : 440 },
    kare: { centerX: 512, centerY: isPendant ? 538 : 396, height: isPendant ? 336 : 332, width: isPendant ? 336 : 332 },
    oval: { centerX: 512, centerY: isPendant ? 548 : 402, height: isPendant ? 420 : 386, width: isPendant ? 292 : 280 },
    yuvarlak: { centerX: 512, centerY: isPendant ? 538 : 400, height: isPendant ? 356 : 350, width: isPendant ? 356 : 350 },
  };
  return {
    engraving: {
      blend: "over",
      mask: {
        backgroundCutoff: ENGRAVING_BACKGROUND_CUTOFF,
        blur: 0.18,
        gain: 2.15,
        gamma: 1,
        minDarkness: ENGRAVING_MIN_DARKNESS,
        threshold: 224,
      },
      opacity: formInfo.designModeValue === "emboss" ? 0.44 : 0.58,
      scale: isPendant ? 0.82 : 0.86,
      shadow: { blur: 0.8, offsetX: 1, offsetY: 1, opacity: 0.12 },
      highlight: { blur: 0.35, offsetX: -1, offsetY: -1, opacity: 0.12 },
    },
    file: "",
    key: `${productValue}-${shapeValue}`,
    product: productValue,
    shape: shapeValue,
    placement: placementByShape[shapeValue] || placementByShape.yuvarlak,
  };
}

function localTemplateImageUrl(template, canvasSize) {
  if (template.file) return ringTemplateAssetUrl(template.file);
  const width = Number(canvasSize?.width) || 1024;
  const height = Number(canvasSize?.height) || 1024;
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/></svg>`)}`;
}

function mergeLocalEngravingConfig(defaults = {}, overrides = {}) {
  return {
    ...defaults,
    ...overrides,
    highlight: {
      ...(defaults.highlight || {}),
      ...(overrides.highlight || {}),
    },
    mask: {
      ...(defaults.mask || {}),
      ...(overrides.mask || {}),
    },
    shadow: {
      ...(defaults.shadow || {}),
      ...(overrides.shadow || {}),
    },
  };
}

function applyLocalDesignMode(engraving = {}, designMode = "engrave", metal = {}) {
  if (designMode !== "emboss") {
    return {
      ...engraving,
      highlight: { ...(engraving.highlight || {}), opacity: 0 },
      shadow: { ...(engraving.shadow || {}), opacity: 0 },
    };
  }

  return {
    ...engraving,
    blend: "over",
    lineColor: localEmbossLineColor(metal),
    opacity: clampNumber(Number(engraving.opacity ?? STAGE_TWO_FULL_OPACITY), STAGE_TWO_MIN_OPACITY, STAGE_TWO_FULL_OPACITY),
    shadow: {
      ...(engraving.shadow || {}),
      blur: 1,
      offsetX: 2,
      offsetY: 2,
      opacity: Math.max(0.14, Number(engraving.shadow?.opacity) || 0.14),
    },
    highlight: {
      ...(engraving.highlight || {}),
      blur: 0.45,
      offsetX: -2,
      offsetY: -2,
      opacity: Math.max(0.2, Number(engraving.highlight?.opacity) || 0.2),
    },
    mask: {
      ...(engraving.mask || {}),
      gain: Math.max(2, Number(engraving.mask?.gain) || 2),
      threshold: Math.min(235, Number(engraving.mask?.threshold) || 224),
    },
  };
}

function ringTemplateAssetUrl(file) {
  const safeFile = String(file || "").split("/").map(encodeURIComponent).join("/");
  return `./assets/ring-templates/${safeFile}`;
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//i.test(src)) image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Görsel yüklenemedi.")));
    image.src = src;
  });
}

function drawImageCover(context, image, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
}

function drawLocalTemplateImage(context, image, targetWidth, targetHeight, template = {}) {
  const crop = template.templateCrop;
  if (!crop) {
    drawImageCover(context, image, targetWidth, targetHeight);
    smoothLocalTemplateSurface(context, targetWidth, targetHeight, template);
    return;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(
    image,
    image.naturalWidth * crop.sourceLeftRatio,
    0,
    image.naturalWidth * crop.sourceWidthRatio,
    image.naturalHeight,
    targetWidth * crop.targetLeftRatio,
    0,
    targetWidth * crop.targetWidthRatio,
    targetHeight
  );
  smoothLocalTemplateSurface(context, targetWidth, targetHeight, template);
}

function smoothLocalTemplateSurface(context, targetWidth, targetHeight, template = {}) {
  if (!template.file || !template.placement) return;

  const placement = scaledPlacement(template.placement, targetWidth, targetHeight);
  const surfacePlacement = {
    ...placement,
    height: placement.height * TEMPLATE_SURFACE_SMOOTH_SCALE,
    width: placement.width * TEMPLATE_SURFACE_SMOOTH_SCALE,
  };
  const surfaceWidth = Math.max(1, Math.round(surfacePlacement.width));
  const surfaceHeight = Math.max(1, Math.round(surfacePlacement.height));
  const left = Math.max(0, Math.min(targetWidth - surfaceWidth, Math.round(surfacePlacement.centerX - surfaceWidth / 2)));
  const top = Math.max(0, Math.min(targetHeight - surfaceHeight, Math.round(surfacePlacement.centerY - surfaceHeight / 2)));
  const patch = document.createElement("canvas");
  patch.width = surfaceWidth;
  patch.height = surfaceHeight;
  const patchContext = patch.getContext("2d");
  if (!patchContext) return;

  patchContext.drawImage(context.canvas, left, top, surfaceWidth, surfaceHeight, 0, 0, surfaceWidth, surfaceHeight);
  context.save();
  clipEngravingShape(context, surfacePlacement, template.shape);
  context.filter = `blur(${TEMPLATE_SURFACE_SMOOTH_BLUR}px)`;
  context.drawImage(patch, left, top, surfaceWidth, surfaceHeight);
  context.restore();
  releaseCanvas(patch);
}

function scaledPlacement(placement, targetWidth, targetHeight) {
  const scaleX = targetWidth / 1024;
  const scaleY = targetHeight / 1024;
  return {
    centerX: placement.centerX * scaleX,
    centerY: placement.centerY * scaleY,
    height: placement.height * scaleY,
    width: placement.width * scaleX,
  };
}


function invertLocalCanvas(sourceCanvas) {
  const inv = document.createElement("canvas");
  inv.width = sourceCanvas.width;
  inv.height = sourceCanvas.height;
  const ctx = inv.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, inv.width, inv.height);
  ctx.drawImage(sourceCanvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, inv.width, inv.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return inv;
}

function createLocalEngravingLayer({ designMode, engraving, index, metal, placement, sourceImage, surface, template }) {
  const layerPlacement = designMode === "emboss"
    ? detailedLocalOverlayPlacement(placement, template)
    : placement;
  const width = Math.max(1, Math.round(layerPlacement.width));
  const height = Math.max(1, Math.round(layerPlacement.height));
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceImage.naturalWidth || sourceImage.width;
  sourceCanvas.height = sourceImage.naturalHeight || sourceImage.height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  sourceContext.drawImage(sourceImage, 0, 0);

  const bounds = findDarkPixelBounds(sourceContext, sourceCanvas.width, sourceCanvas.height, engraving.mask || {});
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const layerContext = layer.getContext("2d", { willReadFrequently: true });
  const isFaceArtwork = shouldPreserveLocalFaceArtwork(sourceContext, sourceCanvas.width, sourceCanvas.height, template);
  const isEmbossMode = designMode === "emboss";
  if (isEmbossMode) {
    layer.dataset.detailedFaceArtwork = "1";
    layer.dataset.preserveFaceArtwork = "1";
    const drawCanvas = isFaceArtwork ? sourceCanvas : invertLocalCanvas(sourceCanvas);
    if (isSquareTemplateShape(template)) {
      const drawContext = drawCanvas.getContext("2d", { willReadFrequently: true });
      const frameBounds = findBrightSquareFrameBounds(drawContext, drawCanvas.width, drawCanvas.height);
      drawCanvasContain(layerContext, drawCanvas, width, height, frameBounds);
    } else {
      const drawContext = drawCanvas.getContext("2d", { willReadFrequently: true });
      const brightBounds = findBrightPixelBounds(drawContext, drawCanvas.width, drawCanvas.height);
      layerContext.drawImage(
        drawCanvas,
        brightBounds.left, brightBounds.top, brightBounds.width, brightBounds.height,
        0, 0, width, height
      );
    }
    knockoutBrightLocalArtworkPixels(layerContext, width, height);
    if (drawCanvas !== sourceCanvas) releaseCanvas(drawCanvas);
    releaseCanvas(sourceCanvas);
    return layer;
  }
  if (isFaceArtwork) {
    layer.dataset.preserveFaceArtwork = "1";
    drawLocalFaceArtworkLayer(layerContext, sourceCanvas, sourceContext, width, height);
    knockoutBrightLocalArtworkPixels(layerContext, width, height);
    releaseCanvas(sourceCanvas);
    return layer;
  }

  const isPhotoTemplate = String(template.key || "").startsWith("yuvarlak-foto") ||
    String(template.key || "").startsWith("oval-foto") ||
    String(template.key || "").startsWith("kolye-");
  const hasFitFrame = !isEmbossMode && isPhotoTemplate
    ? sourceHasLocalMinimalistFitFrame(sourceContext, sourceCanvas.width, sourceCanvas.height, template.shape)
    : false;
  const scaleByIndex = [0.86, 0.82, 0.9, 0.78][index % 4];
  const configuredScale = Number(engraving.scale);
  const baseScale = Number.isFinite(configuredScale)
    ? configuredScale
    : scaleByIndex;
  const templateScale = localEngravingSurfaceScale({
    baseScale,
    designMode,
    hasFitFrame,
    isPhotoTemplate,
    product: template.product,
  });
  const surfaceScale = surface?.value === "vintage" ? Math.min(templateScale, 0.92) : templateScale;
  const safeScale = isPhotoTemplate ? Math.min(surfaceScale, PHOTO_TEMPLATE_EDGE_SCALE_MAX) : surfaceScale;
  const scale = Math.min((width * safeScale) / bounds.width, (height * safeScale) / bounds.height);
  const shouldFillSurface = template.product === "kolye" && isPhotoTemplate;
  const drawWidth = shouldFillSurface ? width * safeScale : bounds.width * scale;
  const drawHeight = shouldFillSurface ? height * safeScale : bounds.height * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2 + (isPhotoTemplate && !hasFitFrame ? -height * 0.012 : 0);

  layerContext.drawImage(
    sourceCanvas,
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  applyEngravingAlpha(layerContext, width, height, engraving, metal, index);
  if (hasFitFrame) {
    clearLocalFitFrameEdges(layerContext, width, height, template.shape);
  }
  releaseCanvas(sourceCanvas);
  return layer;
}

function isSquareTemplateShape(templateOrShape = {}) {
  const shape = typeof templateOrShape === "string"
    ? templateOrShape
    : templateOrShape.shape;
  const normalized = String(shape || "").trim().toLowerCase();
  return normalized === "kare" || normalized === "square";
}

function detailedLocalOverlayPlacement(placement, templateOrShape = {}) {
  const rawWidth = Math.max(1, placement.width);
  const rawHeight = Math.max(1, placement.height);
  const width = rawWidth * DETAILED_FACE_OVERLAY_SCALE;
  const height = rawHeight * DETAILED_FACE_OVERLAY_SCALE;
  const centerY = placement.centerY + placement.height * DETAILED_FACE_CENTER_Y_OFFSET;
  if (isSquareTemplateShape(templateOrShape)) {
    const side = Math.min(rawWidth, rawHeight) * DETAILED_SQUARE_FACE_OVERLAY_SCALE;
    return { ...placement, centerY, height: side, width: side };
  }
  return { ...placement, centerY, height, width };
}

function drawCanvasContain(context, sourceCanvas, width, height, sourceBounds = null) {
  const cropLeft = Math.max(0, Math.round(sourceBounds?.left ?? 0));
  const cropTop = Math.max(0, Math.round(sourceBounds?.top ?? 0));
  const sourceWidth = Math.max(1, Math.round(sourceBounds?.width ?? sourceCanvas.width));
  const sourceHeight = Math.max(1, Math.round(sourceBounds?.height ?? sourceCanvas.height));
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    sourceCanvas,
    cropLeft,
    cropTop,
    sourceWidth,
    sourceHeight,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

function drawCanvasCover(context, sourceCanvas, width, height) {
  const sourceWidth = Math.max(1, sourceCanvas.width);
  const sourceHeight = Math.max(1, sourceCanvas.height);
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    sourceCanvas,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

function localEngravingSurfaceScale({ baseScale = 1, designMode = "engrave", hasFitFrame = false, isPhotoTemplate = false, product = "" } = {}) {
  const safeBaseScale = Number.isFinite(baseScale) ? baseScale : 1;
  if (!isPhotoTemplate) return safeBaseScale;
  if (designMode !== "emboss") {
    if (hasFitFrame) return Math.max(safeBaseScale, PHOTO_TEMPLATE_MINIMALIST_FIT_FRAME_SCALE);
    const maxScale = product === "kolye" ? PHOTO_TEMPLATE_MINIMALIST_PENDANT_SCALE : PHOTO_TEMPLATE_MINIMALIST_RING_SCALE;
    return Math.min(safeBaseScale, maxScale);
  }
  return Math.max(safeBaseScale, PHOTO_TEMPLATE_EDGE_SCALE);
}

function sourceHasLocalMinimalistFitFrame(context, width, height, shape) {
  const imageData = context.getImageData(0, 0, width, height);
  const bounds = localDarkPixelBounds(imageData.data, width, height);
  if (!bounds || bounds.width < width * 0.34 || bounds.height < height * 0.34) return false;
  return localShapeHasFitFrame(imageData.data, width, height, bounds, shape);
}

function localDarkPixelBounds(data, width, height) {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma > 168) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return {
    bottom,
    height: Math.max(1, bottom - top + 1),
    left,
    right,
    top,
    width: Math.max(1, right - left + 1),
  };
}

function localShapeHasFitFrame(data, width, height, bounds, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  if (["yuvarlak", "round", "oval", "vertical oval"].includes(normalizedShape)) {
    return localRoundedShapeHasFitFrame(data, width, bounds);
  }
  return localRectangularShapeHasFitFrame(data, width, bounds);
}

function localRoundedShapeHasFitFrame(data, imageWidth, bounds) {
  const binCount = 48;
  const bins = new Uint16Array(binCount);
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const radiusX = Math.max(1, bounds.width / 2);
  const radiusY = Math.max(1, bounds.height / 2);

  for (let y = bounds.top; y <= bounds.bottom; y += 1) {
    for (let x = bounds.left; x <= bounds.right; x += 1) {
      const pixelIndex = (y * imageWidth + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma > 168) continue;
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      const ellipseDistance = normalizedX * normalizedX + normalizedY * normalizedY;
      if (ellipseDistance < 0.68 || ellipseDistance > 1.14) continue;
      const angle = Math.atan2(normalizedY, normalizedX);
      const bin = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * binCount) % binCount;
      bins[bin] += 1;
    }
  }

  const minBinPixels = Math.max(2, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const coveredBins = Array.from(bins).filter((count) => count >= minBinPixels).length;
  return coveredBins / binCount >= 0.58;
}

function localRectangularShapeHasFitFrame(data, imageWidth, bounds) {
  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.09));
  const topSpan = localEdgeDarkSpan(data, imageWidth, bounds.left, bounds.top, bounds.width, band, "x");
  const bottomSpan = localEdgeDarkSpan(data, imageWidth, bounds.left, bounds.bottom - band + 1, bounds.width, band, "x");
  const leftSpan = localEdgeDarkSpan(data, imageWidth, bounds.left, bounds.top, band, bounds.height, "y");
  const rightSpan = localEdgeDarkSpan(data, imageWidth, bounds.right - band + 1, bounds.top, band, bounds.height, "y");
  return (
    topSpan / bounds.width >= 0.54 &&
    bottomSpan / bounds.width >= 0.54 &&
    leftSpan / bounds.height >= 0.54 &&
    rightSpan / bounds.height >= 0.54
  );
}

function localEdgeDarkSpan(data, imageWidth, startX, startY, width, height, axis) {
  let min = Infinity;
  let max = -Infinity;
  for (let y = startY; y < startY + height; y += 1) {
    for (let x = startX; x < startX + width; x += 1) {
      const pixelIndex = (y * imageWidth + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma > 168) continue;
      const coordinate = axis === "x" ? x : y;
      min = Math.min(min, coordinate);
      max = Math.max(max, coordinate);
    }
  }
  return Number.isFinite(min) && max >= min ? max - min + 1 : 0;
}

function shouldPreserveLocalFaceArtwork(context, width, height, template) {
  // Şekil gating yok — piksel analizinin kendisi karar verir (her şekil için face artwork algılaması)
  const data = context.getImageData(0, 0, width, height).data;
  const step = Math.max(4, Math.floor(Math.sqrt((width * height) / 9000)));
  let darkCount = 0;
  let brightCount = 0;
  let lumaTotal = 0;
  let sampleCount = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      lumaTotal += luma;
      sampleCount += 1;
      if (luma < 60) darkCount += 1;
      if (luma > 185) brightCount += 1;
    }
  }

  if (!sampleCount) return false;
  const darkRatio = darkCount / sampleCount;
  const brightRatio = brightCount / sampleCount;
  const meanLuma = lumaTotal / sampleCount;
  return darkRatio > 0.48 && brightRatio > 0.015 && meanLuma < 115;
}

function drawLocalFaceArtworkLayer(layerContext, sourceCanvas, sourceContext, width, height) {
  layerContext.fillStyle = "#000000";
  layerContext.fillRect(0, 0, width, height);

  const bounds = findBrightPixelBounds(sourceContext, sourceCanvas.width, sourceCanvas.height);
  const pad = Math.round(Math.min(bounds.width, bounds.height) * 0.035);
  const cropLeft = Math.max(0, bounds.left - pad);
  const cropTop = Math.max(0, bounds.top - pad);
  const cropRight = Math.min(sourceCanvas.width, bounds.right + pad);
  const cropBottom = Math.min(sourceCanvas.height, bounds.bottom + pad);
  const cropWidth = Math.max(1, cropRight - cropLeft);
  const cropHeight = Math.max(1, cropBottom - cropTop);
  const scale = Math.min(width / cropWidth, height / cropHeight);
  const drawWidth = cropWidth * scale;
  const drawHeight = cropHeight * scale;

  layerContext.drawImage(
    sourceCanvas,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

function findBrightPixelBounds(context, width, height) {
  const data = context.getImageData(0, 0, width, height).data;
  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma < 150) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (left > right || top > bottom) {
    return { bottom: height, height, left: 0, right: width, top: 0, width };
  }

  return {
    bottom,
    height: Math.max(1, bottom - top),
    left,
    right,
    top,
    width: Math.max(1, right - left),
  };
}

function findBrightSquareFrameBounds(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const frameBounds = localSquareFrameLineBounds(imageData.data, width, height);
  if (frameBounds) return localSquareCropAroundBounds(frameBounds, width, height, 0);

  const bounds = findBrightPixelBoundsFromData(imageData.data, width, height, DETAILED_SQUARE_FRAME_LUMA_THRESHOLD);
  if (!bounds) return null;
  const sideRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
  if (bounds.width < width * 0.52 || bounds.height < height * 0.52 || sideRatio < 0.82) {
    return null;
  }
  if (!looksLikeLocalSquareFrame(imageData.data, width, height, bounds)) {
    return null;
  }

  const padding = Math.max(0, Math.round(Math.min(bounds.width, bounds.height) * DETAILED_SQUARE_FRAME_PADDING_RATIO));
  return localSquareCropAroundBounds(bounds, width, height, padding);
}

function localSquareFrameLineBounds(data, width, height) {
  for (const threshold of DETAILED_SQUARE_FRAME_SCAN_THRESHOLDS) {
    const bounds = localSquareFrameLineBoundsAtThreshold(data, width, height, threshold);
    if (bounds) return bounds;
  }
  return null;
}

function localSquareFrameLineBoundsAtThreshold(data, width, height, threshold) {
  if (width < 1 || height < 1) return null;

  const rowCoverage = new Float32Array(height);
  const colCoverage = new Float32Array(width);
  for (let y = 0; y < height; y += 1) {
    let bright = 0;
    for (let x = 0; x < width; x += 1) {
      if (localPixelAboveThreshold(data, width, x, y, threshold)) bright += 1;
    }
    rowCoverage[y] = bright / width;
  }
  for (let x = 0; x < width; x += 1) {
    let bright = 0;
    for (let y = 0; y < height; y += 1) {
      if (localPixelAboveThreshold(data, width, x, y, threshold)) bright += 1;
    }
    colCoverage[x] = bright / height;
  }

  const rows = localCoverageClusters(rowCoverage, DETAILED_SQUARE_FRAME_MIN_LINE_RATIO);
  const cols = localCoverageClusters(colCoverage, DETAILED_SQUARE_FRAME_MIN_LINE_RATIO);
  let best = null;

  for (const top of rows.filter((cluster) => cluster.center < height * 0.45)) {
    for (const bottom of rows.filter((cluster) => cluster.center > height * 0.55)) {
      for (const left of cols.filter((cluster) => cluster.center < width * 0.45)) {
        for (const right of cols.filter((cluster) => cluster.center > width * 0.55)) {
          const candidate = {
            bottom: bottom.end,
            left: left.start,
            right: right.end,
            top: top.start,
          };
          candidate.width = candidate.right - candidate.left + 1;
          candidate.height = candidate.bottom - candidate.top + 1;
          if (!localSquareFrameCandidateLooksValid(data, width, height, candidate, threshold)) continue;
          const area = candidate.width * candidate.height;
          if (!best || area > best.area) best = { ...candidate, area };
        }
      }
    }
  }

  return best ? localImageBoundsToSize(best) : null;
}

function localCoverageClusters(coverage, minRatio) {
  const clusters = [];
  let start = -1;
  let peak = 0;

  for (let index = 0; index <= coverage.length; index += 1) {
    const value = index < coverage.length ? coverage[index] : 0;
    if (value >= minRatio) {
      if (start < 0) {
        start = index;
        peak = value;
      } else {
        peak = Math.max(peak, value);
      }
      continue;
    }

    if (start >= 0) {
      const end = index - 1;
      clusters.push({
        center: (start + end) / 2,
        end,
        peak,
        start,
      });
      start = -1;
      peak = 0;
    }
  }

  return clusters;
}

function localSquareFrameCandidateLooksValid(data, imageWidth, imageHeight, bounds, threshold) {
  const sideRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
  if (
    bounds.width < imageWidth * DETAILED_SQUARE_FRAME_MIN_SIDE_RATIO ||
    bounds.height < imageHeight * DETAILED_SQUARE_FRAME_MIN_SIDE_RATIO ||
    sideRatio < 0.82
  ) {
    return false;
  }

  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const minEdgeCoverage = 0.5;
  const edgesCovered =
    localMaxHorizontalLineCoverage(data, imageWidth, imageHeight, bounds.left, bounds.top, bounds.width, band, threshold) >= minEdgeCoverage &&
    localMaxHorizontalLineCoverage(data, imageWidth, imageHeight, bounds.left, bounds.bottom - band + 1, bounds.width, band, threshold) >= minEdgeCoverage &&
    localMaxVerticalLineCoverage(data, imageWidth, imageHeight, bounds.left, bounds.top, band, bounds.height, threshold) >= minEdgeCoverage &&
    localMaxVerticalLineCoverage(data, imageWidth, imageHeight, bounds.right - band + 1, bounds.top, band, bounds.height, threshold) >= minEdgeCoverage;
  if (!edgesCovered) return false;

  const cornerSize = Math.max(5, Math.round(band * 1.6));
  return (
    localCornerHasFrameInk(data, imageWidth, imageHeight, bounds.left, bounds.top, cornerSize, threshold) &&
    localCornerHasFrameInk(data, imageWidth, imageHeight, bounds.right, bounds.top, cornerSize, threshold) &&
    localCornerHasFrameInk(data, imageWidth, imageHeight, bounds.left, bounds.bottom, cornerSize, threshold) &&
    localCornerHasFrameInk(data, imageWidth, imageHeight, bounds.right, bounds.bottom, cornerSize, threshold)
  );
}

function localMaxHorizontalLineCoverage(data, imageWidth, imageHeight, left, top, width, height, threshold) {
  const startX = clampNumber(Math.round(left), 0, imageWidth);
  const endX = clampNumber(Math.round(left + width), 0, imageWidth);
  const startY = clampNumber(Math.round(top), 0, imageHeight);
  const endY = clampNumber(Math.round(top + height), 0, imageHeight);
  let maxCoverage = 0;

  for (let y = startY; y < endY; y += 1) {
    let bright = 0;
    for (let x = startX; x < endX; x += 1) {
      if (localPixelAboveThreshold(data, imageWidth, x, y, threshold)) bright += 1;
    }
    maxCoverage = Math.max(maxCoverage, bright / Math.max(1, endX - startX));
  }

  return maxCoverage;
}

function localMaxVerticalLineCoverage(data, imageWidth, imageHeight, left, top, width, height, threshold) {
  const startX = clampNumber(Math.round(left), 0, imageWidth);
  const endX = clampNumber(Math.round(left + width), 0, imageWidth);
  const startY = clampNumber(Math.round(top), 0, imageHeight);
  const endY = clampNumber(Math.round(top + height), 0, imageHeight);
  let maxCoverage = 0;

  for (let x = startX; x < endX; x += 1) {
    let bright = 0;
    for (let y = startY; y < endY; y += 1) {
      if (localPixelAboveThreshold(data, imageWidth, x, y, threshold)) bright += 1;
    }
    maxCoverage = Math.max(maxCoverage, bright / Math.max(1, endY - startY));
  }

  return maxCoverage;
}

function localCornerHasFrameInk(data, imageWidth, imageHeight, x, y, size, threshold) {
  const half = Math.max(2, Math.round(size / 2));
  const startX = clampNumber(Math.round(x) - half, 0, imageWidth);
  const endX = clampNumber(Math.round(x) + half + 1, 0, imageWidth);
  const startY = clampNumber(Math.round(y) - half, 0, imageHeight);
  const endY = clampNumber(Math.round(y) + half + 1, 0, imageHeight);
  let bright = 0;

  for (let yy = startY; yy < endY; yy += 1) {
    for (let xx = startX; xx < endX; xx += 1) {
      if (localPixelAboveThreshold(data, imageWidth, xx, yy, threshold)) bright += 1;
    }
  }

  return bright >= Math.max(2, Math.round(size * 0.4));
}

function localPixelAboveThreshold(data, width, x, y, threshold) {
  const pixelIndex = (y * width + x) * 4;
  const alpha = data[pixelIndex + 3];
  if (alpha < 24) return false;
  const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
  return luma >= threshold;
}

function localImageBoundsToSize(bounds) {
  return {
    bottom: bounds.bottom,
    height: bounds.bottom - bounds.top + 1,
    left: bounds.left,
    right: bounds.right,
    top: bounds.top,
    width: bounds.right - bounds.left + 1,
  };
}

function findBrightPixelBoundsFromData(data, width, height, threshold) {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma < threshold) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return { bottom, height: bottom - top + 1, left, right, top, width: right - left + 1 };
}

function looksLikeLocalSquareFrame(data, width, height, bounds) {
  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const requiredRatio = 0.18;
  return (
    localBrightBandRatio(data, width, height, bounds.left, bounds.top, bounds.width, band) > requiredRatio &&
    localBrightBandRatio(data, width, height, bounds.left, bounds.bottom - band + 1, bounds.width, band) > requiredRatio &&
    localBrightBandRatio(data, width, height, bounds.left, bounds.top, band, bounds.height) > requiredRatio &&
    localBrightBandRatio(data, width, height, bounds.right - band + 1, bounds.top, band, bounds.height) > requiredRatio
  );
}

function localBrightBandRatio(data, imageWidth, imageHeight, left, top, width, height) {
  const startX = clampNumber(Math.round(left), 0, imageWidth);
  const startY = clampNumber(Math.round(top), 0, imageHeight);
  const endX = clampNumber(Math.round(left + width), 0, imageWidth);
  const endY = clampNumber(Math.round(top + height), 0, imageHeight);
  let bright = 0;
  let total = 0;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const pixelIndex = (y * imageWidth + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma >= DETAILED_SQUARE_FRAME_LUMA_THRESHOLD) bright += 1;
      total += 1;
    }
  }

  return total > 0 ? bright / total : 0;
}

function localSquareCropAroundBounds(bounds, imageWidth, imageHeight, padding) {
  const targetSide = Math.min(
    Math.max(bounds.width, bounds.height) + padding * 2,
    imageWidth,
    imageHeight
  );
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const left = clampNumber(Math.round(centerX - targetSide / 2), 0, imageWidth - targetSide);
  const top = clampNumber(Math.round(centerY - targetSide / 2), 0, imageHeight - targetSide);
  return {
    height: Math.round(targetSide),
    left,
    top,
    width: Math.round(targetSide),
  };
}

function findDarkPixelBounds(context, width, height, mask = {}) {
  const data = context.getImageData(0, 0, width, height).data;
  const backgroundCutoff = engravingBackgroundCutoff(mask);
  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma >= backgroundCutoff) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (left > right || top > bottom) {
    return { bottom: height, height, left: 0, right: width, top: 0, width };
  }

  const pad = Math.round(Math.min(width, height) * 0.018);
  left = Math.max(0, left - pad);
  right = Math.min(width, right + pad);
  top = Math.max(0, top - pad);
  bottom = Math.min(height, bottom + pad);

  return {
    bottom,
    height: Math.max(1, bottom - top),
    left,
    right,
    top,
    width: Math.max(1, right - left),
  };
}

function applyEngravingAlpha(context, width, height, engraving, metal, index) {
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const mask = engraving.mask || {};
  const threshold = clampNumber(Number(mask.threshold) || 232, 80, 255);
  const gain = clampNumber(Number(mask.gain) || 1.7, 0.2, 4);
  const gamma = clampNumber(Number(mask.gamma) || 1, 0.2, 4);
  const backgroundCutoff = engravingBackgroundCutoff(mask);
  const minDarkness = engravingMinDarkness(mask);
  const baseOpacity = clampNumber(Number(engraving.opacity ?? STAGE_TWO_FULL_OPACITY), STAGE_TWO_MIN_OPACITY, STAGE_TWO_FULL_OPACITY);
  const color = parseHexColor(engraving.lineColor || localEngravingLineColor(metal), { blue: 32, green: 35, red: 38 });

  for (let i = 0; i < pixels.length; i += 4) {
    const sourceAlpha = pixels[i + 3] / 255;
    if (sourceAlpha <= 0) {
      pixels[i + 3] = 0;
      continue;
    }

    const luma = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    if (luma >= backgroundCutoff) {
      pixels[i + 3] = 0;
      continue;
    }

    const darkness = Math.pow(clampNumber(((threshold - luma) / threshold) * gain, 0, 1), gamma);
    if (darkness <= minDarkness) {
      pixels[i + 3] = 0;
      continue;
    }

    pixels[i] = color.red;
    pixels[i + 1] = color.green;
    pixels[i + 2] = color.blue;
    pixels[i + 3] = Math.round(255 * sourceAlpha * darkness * baseOpacity);
  }

  context.putImageData(imageData, 0, 0);
}

function clearLocalFitFrameEdges(context, width, height, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  if (!["kare", "square", "dikdortgen", "rectangular"].includes(normalizedShape)) return;

  const band = Math.max(4, Math.round(Math.min(width, height) * PHOTO_TEMPLATE_FIT_FRAME_CLEAR_EDGE_RATIO));
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x >= band && x < width - band && y >= band && y < height - band) continue;
      pixels[(y * width + x) * 4 + 3] = 0;
    }
  }
  context.putImageData(imageData, 0, 0);
}

function engravingBackgroundCutoff(mask = {}) {
  return clampNumber(Number(mask.backgroundCutoff) || ENGRAVING_BACKGROUND_CUTOFF, 120, 245);
}

function engravingMinDarkness(mask = {}) {
  return clampNumber(Number(mask.minDarkness) || ENGRAVING_MIN_DARKNESS, 0, 0.5);
}

function knockoutBrightLocalArtworkPixels(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const fadeStart = 170;
  const fadeEnd = 232;
  const fadeRange = fadeEnd - fadeStart;

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha <= 0) continue;

    const luma = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    if (luma <= fadeStart) continue;

    const alphaScale = clampNumber((fadeEnd - luma) / fadeRange, 0, 1);
    pixels[i + 3] = alphaScale <= 0.015 ? 0 : Math.round(alpha * alphaScale);
  }

  context.putImageData(imageData, 0, 0);
}

function localEngravingLineColor(metal) {
  if (metal?.value === "gumus") return "#1f2326";
  if (metal?.value === "rose") return "#2d1715";
  return "#24180c";
}

function localEmbossLineColor(metal) {
  if (metal?.value === "gumus") return "#f8fbff";
  if (metal?.value === "rose") return "#ffd8ca";
  return "#ffe6a6";
}

function drawLocalEngravingLayer(context, layer, placement, shape, engraving) {
  const preserveFaceArtwork = layer.dataset.preserveFaceArtwork === "1";
  const effectivePlacement = layer.dataset.detailedFaceArtwork === "1"
    ? detailedLocalOverlayPlacement(placement, shape)
    : placement;
  const width = Math.round(effectivePlacement.width);
  const height = Math.round(effectivePlacement.height);
  const rotation = ((Number(engraving.rotation) || 0) * Math.PI) / 180;
  const shadow = engraving.shadow || {};
  const highlight = engraving.highlight || {};

  context.save();
  clipEngravingShape(context, effectivePlacement, shape);
  context.translate(effectivePlacement.centerX, effectivePlacement.centerY);
  context.rotate(rotation);

  const shadowOpacity = preserveFaceArtwork ? 0 : clampNumber(Number(shadow.opacity) || 0, 0, 0.4);
  if (shadowOpacity > 0) {
    context.save();
    context.globalAlpha = shadowOpacity;
    context.filter = `blur(${clampNumber(Number(shadow.blur) || 0.7, 0, 4)}px)`;
    context.globalCompositeOperation = "multiply";
    context.drawImage(
      layer,
      -width / 2 + Math.round(Number(shadow.offsetX) || 1),
      -height / 2 + Math.round(Number(shadow.offsetY) || 1),
      width,
      height
    );
    context.restore();
  }

  context.globalCompositeOperation = preserveFaceArtwork || engraving.blend !== "multiply" ? "source-over" : "multiply";
  context.drawImage(layer, -width / 2, -height / 2, width, height);

  const highlightOpacity = preserveFaceArtwork ? 0 : clampNumber(Number(highlight.opacity) || 0, 0, 0.25);
  if (highlightOpacity > 0) {
    context.save();
    context.globalAlpha = highlightOpacity;
    context.filter = `blur(${clampNumber(Number(highlight.blur) || 0.3, 0, 2)}px)`;
    context.globalCompositeOperation = "screen";
    drawTintedEngravingLayer(
      context,
      layer,
      "#f7fbff",
      -width / 2 + Math.round(Number(highlight.offsetX) || -1),
      -height / 2 + Math.round(Number(highlight.offsetY) || -1),
      width,
      height
    );
    context.restore();
  }

  context.restore();
}

function drawTintedEngravingLayer(context, layer, color, x, y, width, height) {
  const tinted = document.createElement("canvas");
  tinted.width = layer.width;
  tinted.height = layer.height;
  const tintedContext = tinted.getContext("2d");
  if (!tintedContext) {
    context.drawImage(layer, x, y, width, height);
    return;
  }

  tintedContext.drawImage(layer, 0, 0);
  tintedContext.globalCompositeOperation = "source-in";
  tintedContext.fillStyle = color;
  tintedContext.fillRect(0, 0, tinted.width, tinted.height);
  context.drawImage(tinted, x, y, width, height);
}

function clipEngravingShape(context, placement, shape) {
  const width = Math.round(placement.width);
  const height = Math.round(placement.height);
  const left = Math.round(placement.centerX - width / 2);
  const top = Math.round(placement.centerY - height / 2);
  context.beginPath();
  if (shape === "yuvarlak") {
    context.arc(placement.centerX, placement.centerY, Math.min(width, height) / 2, 0, Math.PI * 2);
  } else if (shape === "oval") {
    context.ellipse(placement.centerX, placement.centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else {
    const radius = localOverlayCornerRadius(width, height, shape);
    roundedRectPath(context, left, top, width, height, radius);
  }
  context.clip();
}

function localOverlayCornerRadius(width, height, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  const maxRadius = normalizedShape === "dikdortgen" || normalizedShape === "rectangular"
    ? RECTANGULAR_OVERLAY_CORNER_RADIUS
    : SQUARE_OVERLAY_CORNER_RADIUS;
  return Math.min(maxRadius, width * 0.035, height * 0.035);
}

async function generateRealFinishResults({ background, creditCost, finishCount, formInfo, generationLabel, metal, sidePrint, stone, surface }) {
  let job = null;
  try {
    job = createGenerationJob({
      count: finishCount,
      creditCost,
      label: generationLabel,
      metadata: { background, formInfo, metal, stone, surface },
      stage: "finish",
    });
    publishPendingSavedDesigns(job, buildPendingSavedDesignEntries(job));
    const requestPayload = await buildFinishRequestPayload({ background, finishCount, formInfo, metal, sidePrint, stone, surface });
    const { job: submittedJob, payload } = await submitGenerationJob({
      apiUrl: finishApiUrl(),
      job,
      requestPayload,
    });
    await completeFinishGeneration(submittedJob, payload, { serverCharged: true });
  } catch (error) {
    if (job?.id) removePendingSavedDesigns(job.id);
    throw error;
  }
  return [];
}

async function autoSaveFinishResultsToArchive(results, options = {}) {
  const safeResults = Array.isArray(results) ? results.filter((result) => result?.imageUrl) : [];
  if (!safeResults.length) return null;

  const formInfo = safeResults.find((result) => result?.formInfo)?.formInfo || options.formInfo || {};
  const sourceImageUrl = await savedSourceImageUrlFromFormInfo(formInfo);
  const job = options.job || null;
  const projectId = job ? generationProjectId(job) : activeProjectId;
  const projectTitle = job ? generationProjectTitle(job) : projectTitleById(projectId);

  return autoSaveGeneratedDesigns(
    safeResults.map((result) => ({
      ...designProfileFieldsFromSource(result.formInfo || formInfo),
      ...storageFieldsFromSource(result),
      imageUrl: result.imageUrl,
      projectId,
      projectTitle,
      sourceImageUrl,
      sourceFileName: (result.formInfo || formInfo)?.title || "",
      sourceStage: "finish",
      sourceTitle: (result.formInfo || formInfo)?.title || "",
      stage: "Ürün Görseli",
      metalLabel: result.metal?.label || "",
      metalValue: result.metal?.value || "",
      title: finishResultTitle(result),
    })),
    job ? { job } : {}
  );
}

async function completeFinishGeneration(job, payload, options = {}) {
  const { background, formInfo, metal, stone, surface } = job.metadata || {};
  const images = Array.isArray(payload.images) ? payload.images : [];
  if (!images.length) {
    throw new Error("Ürün görseli üretildi ancak görsel döndürülmedi.");
  }

  const generatedAt = generationResultTimestamp(job, payload);
  // Yan baskı bilgisi server'ın döndürdüğü finish opsiyonlarından gelir; proje
  // snapshot'ında korunur ve 3./4. aşamada bitmiş ürün referansıyla birlikte taşınır.
  const finishMeta = payload.finish && typeof payload.finish === "object" ? payload.finish : {};
  const results = images.map((image, index) => ({
    ...storageFieldsFromSource(image),
    background,
    formInfo,
    generatedAt: validIsoDate(image.generatedAt || image.createdAt || image.savedAt || "") || generatedAt,
    id: `finish-${payload.requestId || Date.now()}-${index}`,
    imageUrl: image.url,
    index: index + 1,
    metal,
    renderMode: "generated",
    sidePrint: finishMeta.sidePrint === true,
    sidePrintLeft: finishMeta.sidePrint ? (finishMeta.sidePrintLeft || "") : "",
    sidePrintRight: finishMeta.sidePrint ? (finishMeta.sidePrintRight || "") : "",
    stone,
    surface,
  }));
  const shouldRenderToWorkspace = isGenerationForActiveProject(job);
  if (shouldRenderToWorkspace) {
    showFinishResults(results, { append: true });
  }
  persistFinishResultsToProject(job, results);
  const autoSaveResult = await autoSaveFinishResultsToArchive(results, { formInfo, job });
  if (!options.serverCharged) {
    spendCredits({ amount: job.creditCost, jobId: job.id, label: job.label, stage: "finish" });
  }
  await finalizeGenerationDelivery(job);
  if (shouldRenderToWorkspace) {
    setFinishStatusMessage(
      `${results.length} ürün görseli hazır. ${job.creditCost} kredi harcandı.${options.recovered ? " Sayfa yenilendikten sonra sonuç geri alındı." : ""} Beğendiğin ürünü seçince Mockup / Manken aşaması açılır.${formatAutoSaveStatusSuffix(autoSaveResult)}${formatStorageWarningStatusSuffix(payload)}`,
      "success"
    );
  }
  setFinishGeneratingState(false);
  return results;
}

async function buildFinishRequestPayload({ background, finishCount, formInfo, metal, sidePrint, stone, surface }) {
  // Şekil baştaki proje seçiminden gelir; 2. aşamada tekrar seçilmez. Eskiz şekilden
  // bağımsız (1:1) üretilse de, çerçeve burada projenin şekline göre uygulanır.
  const productShape = formInfo.productShapeValue || formInfo.shapeValue || selectedDesignProfile().productShapeValue;
  const productValue = formInfo.productValue || "yuzuk";
  const payload = {
    background: background.value || "dekupe",
    designMode: formInfo.designModeValue || selectedDesignProfile().designModeValue,
    finishCount,
    metal: metal.value || "gumus",
    product: productValue,
    productShape,
    sidePrint: productValue === "yuzuk" && sidePrint?.value === "evet",
    ringMold: (productValue === "yuzuk" && productShape !== "dikdortgen") || productValue === "kolye"
      ? finishRingMoldKeyFor(productShape, metal.value || "gumus", productValue)
      : "",
    sourceKind: "sketch",
    sourceTitle: formInfo.title || "",
    stone: "yok",
    surface: surface.value || "parlak",
  };
  // Yan baskı açıksa kullanıcının sol/sağ omuz için seçtiği emblemleri ekle.
  if (payload.sidePrint) {
    const emblems = readSidePrintEmblems();
    payload.sidePrintLeft = emblems.left;
    payload.sidePrintRight = emblems.right;
  }
  const moldReferenceDataUrl = await loadRingMoldReferenceDataUrl();
  if (moldReferenceDataUrl) {
    payload.moldReferenceDataUrl = moldReferenceDataUrl;
  }
  const sourceUrl = formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "";

  if (/^https?:\/\//i.test(sourceUrl)) {
    payload.sourceUrl = sourceUrl;
    return payload;
  }

  if (sourceUrl.startsWith("data:image/")) {
    payload.imageDataUrl = sourceUrl;
    return payload;
  }

  if (
    directFinishFormFile &&
    directFinishForm &&
    [directFinishForm.formImageUrl, directFinishForm.sourceFormUrl, directFinishForm.sketchUrl].includes(sourceUrl)
  ) {
    payload.imageDataUrl = await readFileAsDataUrl(directFinishFormFile);
    return payload;
  }

  throw new Error("Bu görsel doğrudan API'ye gönderilemiyor. Görseli yeniden yükleyip tekrar dene.");
}

async function loadRingMoldReferenceDataUrl() {
  if (!ringMoldReferenceDataUrlPromise) {
    ringMoldReferenceDataUrlPromise = fetch(RING_MOLD_REFERENCE_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Ürün kalıp referansı yüklenemedi.");
        return response.blob();
      })
      .then((blob) => readFileAsDataUrl(blob))
      .catch(() => "");
  }

  return ringMoldReferenceDataUrlPromise;
}

function setFinishGeneratingState(isGenerating) {
  isFinishGenerating = Boolean(isGenerating);
  document.querySelectorAll("[data-generate-finish]").forEach((button) => {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent;
    }

    button.disabled = isGenerating;
    button.classList.toggle("is-disabled", isGenerating);
    button.textContent = isGenerating ? "Ürün görseli hazırlanıyor..." : button.dataset.originalLabel;
  });
}

function showFinishResults(results, options = {}) {
  const resultGrid = document.querySelector("[data-finish-result-grid]");
  if (!resultGrid) return;

  const safeResults = Array.isArray(results) ? results : [];
  const cards = safeResults.map(createFinishResultCard);
  removeResultLoading("finish");
  if (options.append) {
    resultGrid.prepend(...cards);
  } else {
    replaceChildrenReleasing(resultGrid, ...cards);
  }
  const hasResults = Boolean(resultGrid.querySelector("[data-finish-result-card]"));
  resultGrid.hidden = !hasResults;
  newDesignStudio?.classList.toggle("has-finish-result", hasResults);
  if (newDesignStudio?.classList.contains("is-finish-stage")) setWorkflowForFinishStage();
  applyStageRestrictions();
  setMockupStepReady(Boolean(getSelectedFinishInfo()));
  if (!isRestoringProject) flushProjectSave();
  else queueActiveProjectSave();
}

function finishResultTitle(result, index = result.index || 1) {
  const metalLabel = result.metal?.label || result.metalLabel || "Ürün";
  const formLabel = result.formInfo?.moldTitle || result.formInfo?.productLabel || "render";
  return `${metalLabel} ${formLabel} ${String(index).padStart(2, "0")}`;
}

function persistFinishResultsToProject(job, results) {
  const projectId = generationProjectId(job);
  if (!projectId) return false;
  if (activeProjectId === projectId) return flushProjectSave();

  const incomingResults = Array.isArray(results)
    ? results.filter((result) => result?.imageUrl || result?.id)
    : [];
  if (!incomingResults.length) return false;

  return patchProjectState(
    projectId,
    (state) => {
      const finishResults = Array.isArray(state.finishResults) ? [...state.finishResults] : [];
      const seenKeys = new Set(
        finishResults
          .map((result) => result.finishImageUrl || result.id)
          .filter(Boolean)
      );

      incomingResults.forEach((result) => {
        const key = result.imageUrl || result.id;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);
        finishResults.push(finishResultProjectState(result, finishResults.length));
      });

      return {
        ...state,
        finishResults,
        stage: maxProjectStage(state.stage, "finish"),
      };
    },
    {
      createdAt: job.createdAt,
      title: generationProjectTitle(job),
    }
  );
}

function finishResultProjectState(result, index) {
  const formInfo = result.formInfo || {};
  const profile = designProfileFromFields(formInfo);
  const background = result.background || {};
  const metal = result.metal || {};
  const stone = result.stone || {};
  const surface = result.surface || {};
  const resultIndex = index + 1;
  const metalLabel = metal.label || "Altın";
  const moldTitle = formInfo.moldTitle || formInfo.productLabel || "Ürün";

  return {
    ...storageFieldsFromSource(result),
    backgroundLabel: background.label || "Dekupe",
    backgroundValue: background.value || "dekupe",
    designModeLabel: formInfo.designModeLabel || profile.designModeLabel,
    designModeValue: formInfo.designModeValue || profile.designModeValue,
    finishImageUrl: safePersistedImageUrl(result.imageUrl || "", "finishImageUrl"),
    id: result.id || `finish-saved-${Date.now()}-${index}`,
    index: resultIndex,
    metalLabel,
    metalValue: metal.value || "altin",
    moldAspect: formInfo.moldAspect || profile.moldAspect,
    moldHeightCm: formInfo.moldHeightCm || "",
    moldKey: formInfo.moldKey || "",
    moldMeasure: formInfo.moldMeasure || "",
    moldShape: formInfo.moldShape || formInfo.shapeValue || profile.shapeValue,
    moldSizeLabel: formInfo.moldSizeLabel || formInfo.moldMeasure || "",
    moldTitle,
    moldWidthCm: formInfo.moldWidthCm || "",
    productLabel: formInfo.productLabel || profile.productLabel,
    productShapeLabel: formInfo.productShapeLabel || formInfo.shapeLabel || profile.productShapeLabel,
    productShapeValue: formInfo.productShapeValue || formInfo.shapeValue || profile.productShapeValue,
    productValue: formInfo.productValue || profile.productValue,
    renderMode: result.renderMode || (result.imageUrl ? "generated" : "composite"),
    selected: false,
    shapeValue: formInfo.shapeValue || formInfo.productShapeValue || profile.shapeValue,
    sketchUrl: safePersistedImageUrl(result.imageUrl || formInfo.sketchUrl || "", "sketchUrl"),
    sourceFormUrl: safePersistedImageUrl(formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "", "sourceFormUrl"),
    stoneLabel: stone.label || "Yok",
    stoneValue: stone.value || "yok",
    subtitle: `${moldTitle}${formInfo.moldMeasure ? ` · ${formInfo.moldMeasure}` : ""} · ${surface.label || "Parlak"} · ${background.label || "Dekupe"}`,
    surfaceLabel: surface.label || "Parlak",
    surfaceValue: surface.value || "parlak",
    title: `${metalLabel} ${moldTitle} ${String(resultIndex).padStart(2, "0")}`,
  };
}

function createFinishResultCard(result) {
  const background = result.background || {};
  const formInfo = result.formInfo || {};
  const profile = designProfileFromFields(formInfo);
  const metal = result.metal || {};
  const stone = result.stone || {};
  const surface = result.surface || {};
  const card = document.createElement("article");
  card.className = "sketch-card finish-result-card";
  card.dataset.finishResultCard = "1";
  card.dataset.finishResultId = result.id;
  card.dataset.resultTitle = result.title || finishResultTitle(result);
  writeStorageDataset(card, result);
  card.dataset.backgroundLabel = background.label || "Dekupe";
  card.dataset.backgroundValue = background.value || "dekupe";
  card.dataset.designModeLabel = formInfo.designModeLabel || profile.designModeLabel;
  card.dataset.designModeValue = formInfo.designModeValue || profile.designModeValue;
  card.dataset.finishImageUrl = result.imageUrl || "";
  card.dataset.metalLabel = metal.label || "Altın";
  card.dataset.metalValue = metal.value || "altin";
  card.dataset.moldAspect = formInfo.moldAspect || profile.moldAspect;
  card.dataset.moldHeightCm = formInfo.moldHeightCm || "";
  card.dataset.moldKey = formInfo.moldKey || "";
  card.dataset.moldMeasure = formInfo.moldMeasure || "";
  card.dataset.moldShape = formInfo.moldShape || formInfo.shapeValue || profile.shapeValue;
  card.dataset.moldSizeLabel = formInfo.moldSizeLabel || formInfo.moldMeasure || "";
  card.dataset.moldTitle = formInfo.moldTitle || "Tasarım";
  card.dataset.moldWidthCm = formInfo.moldWidthCm || "";
  card.dataset.productLabel = formInfo.productLabel || profile.productLabel;
  card.dataset.productShapeLabel = formInfo.productShapeLabel || formInfo.shapeLabel || profile.productShapeLabel;
  card.dataset.productShapeValue = formInfo.productShapeValue || formInfo.shapeValue || profile.productShapeValue;
  card.dataset.productValue = formInfo.productValue || profile.productValue;
  card.dataset.renderMode = result.renderMode || (result.imageUrl ? "generated" : "composite");
  card.dataset.shapeValue = formInfo.shapeValue || formInfo.productShapeValue || profile.shapeValue;
  card.dataset.sidePrint = result.sidePrint ? "1" : "";
  card.dataset.sidePrintLeft = result.sidePrintLeft || "";
  card.dataset.sidePrintRight = result.sidePrintRight || "";
  card.dataset.sketchUrl = result.imageUrl || formInfo.sketchUrl || "";
  card.dataset.sourceFormUrl = formInfo.formImageUrl || formInfo.sourceFormUrl || formInfo.sketchUrl || "";
  card.dataset.stoneLabel = stone.label || "Yok";
  card.dataset.stoneValue = stone.value || "yok";
  card.dataset.surfaceLabel = surface.label || "Parlak";
  card.dataset.surfaceValue = surface.value || "parlak";
  card.tabIndex = 0;

  const badge = document.createElement("span");
  badge.className = "selected-badge";
  badge.textContent = "Seçili";

  const visual = createFinishVisual(result);
  const body = document.createElement("div");
  body.className = "sketch-body";

  const subtitle = document.createElement("span");
  subtitle.textContent = `${formInfo.moldTitle || "Tasarım"}${formInfo.moldMeasure ? ` · ${formInfo.moldMeasure}` : ""} · ${formInfo.designModeLabel || "Yüzeysel kazıma"} · ${background.label || "Dekupe"}`;

  card.setAttribute("aria-label", `${card.dataset.resultTitle}. ${subtitle.textContent}`);

  body.append(subtitle);
  card.append(badge, visual, body);
  card.addEventListener("click", () => selectFinishResult(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectFinishResult(card);
    }
  });

  return card;
}

function selectFinishResult(selectedCard) {
  const previousCard = document.querySelector("[data-finish-result-card].is-selected");
  document.querySelectorAll("[data-finish-result-card]").forEach((card) => {
    card.classList.toggle("is-selected", card === selectedCard);
  });
  if (previousCard && previousCard !== selectedCard) {
    clearMockupResults();
  }
  setMockupStepReady(true);
  queueActiveProjectSave();
}

function getSelectedFinishInfo() {
  const card = document.querySelector("[data-finish-result-card].is-selected");
  if (!card) return directMockupFinish;

  return {
    ...readStorageDataset(card),
    backgroundLabel: card.dataset.backgroundLabel || "Dekupe",
    backgroundValue: card.dataset.backgroundValue || "dekupe",
    designModeLabel: card.dataset.designModeLabel || "Yüzeysel kazıma",
    designModeValue: card.dataset.designModeValue || "engrave",
    finishImageUrl: card.dataset.finishImageUrl || "",
    metalLabel: card.dataset.metalLabel || "Altın",
    metalValue: card.dataset.metalValue || "altin",
    moldAspect: card.dataset.moldAspect || "1 / 1",
    moldHeightCm: card.dataset.moldHeightCm || "",
    moldKey: card.dataset.moldKey || "",
    moldMeasure: card.dataset.moldMeasure || "",
    moldShape: card.dataset.moldShape || card.dataset.shapeValue || "yuvarlak",
    moldSizeLabel: card.dataset.moldSizeLabel || card.dataset.moldMeasure || "",
    moldTitle: card.dataset.moldTitle || "Tasarım",
    moldWidthCm: card.dataset.moldWidthCm || "",
    productLabel: card.dataset.productLabel || "Yüzük",
    productShapeLabel: card.dataset.productShapeLabel || card.dataset.shapeLabel || "Yuvarlak",
    productShapeValue: card.dataset.productShapeValue || card.dataset.shapeValue || "yuvarlak",
    productValue: card.dataset.productValue || "yuzuk",
    renderMode: card.dataset.renderMode || "composite",
    shapeValue: card.dataset.shapeValue || card.dataset.productShapeValue || "yuvarlak",
    sidePrint: card.dataset.sidePrint === "1",
    sidePrintLeft: card.dataset.sidePrintLeft || "",
    sidePrintRight: card.dataset.sidePrintRight || "",
    sketchUrl: card.dataset.sketchUrl || "",
    sourceFormUrl: card.dataset.sourceFormUrl || "",
    stoneLabel: card.dataset.stoneLabel || "Yok",
    stoneValue: card.dataset.stoneValue || "yok",
    surfaceLabel: card.dataset.surfaceLabel || "Parlak",
    surfaceValue: card.dataset.surfaceValue || "parlak",
    subtitle: card.querySelector(".sketch-body span")?.textContent || "",
    title: card.dataset.resultTitle || card.querySelector(".sketch-body strong")?.textContent || "Ürün renderı",
  };
}

function setMockupStepReady(isReady) {
  const continueMockupBtn = document.querySelector("[data-continue-mockup]");
  const saveFinishBtn = document.querySelector("[data-save-finish-design]");

  if (newDesignStudio?.classList.contains("is-finish-stage")) {
    setWorkflowStepState("mockup", "unlocked");
  }

  if (continueMockupBtn) {
    continueMockupBtn.disabled = !isReady;
    continueMockupBtn.classList.toggle("is-disabled", !isReady);
  }
  if (saveFinishBtn) saveFinishBtn.disabled = !isReady;
}

function clearFinishResults() {
  const resultGrid = document.querySelector("[data-finish-result-grid]");
  if (resultGrid) {
    replaceChildrenReleasing(resultGrid);
    resultGrid.hidden = true;
  }
  clearMockupResults();
  newDesignStudio?.classList.remove("has-finish-result");
  setMockupStepReady(false);
  queueActiveProjectSave();
}

function createFormVisual(formInfo) {
  const visual = document.createElement("div");
  visual.className = `form-result-visual product-${formInfo.productValue || "yuzuk"}`;

  const measureLabel = document.createElement("span");
  measureLabel.className = "form-measure-label";
  measureLabel.textContent = formInfo.moldMeasure || "";

  if (formInfo.renderMode === "generated" || formInfo.formImageUrl) {
    visual.classList.add("has-generated-image");
    const image = document.createElement("img");
    image.className = "generated-form-image";
    image.src = formInfo.formImageUrl || formInfo.sketchUrl || DEV_SKETCH_DATA_URL;
    image.alt = "";
    image.decoding = "async";
    image.loading = "lazy";
    visual.append(measureLabel, image);
    return visual;
  }

  const frame = document.createElement("div");
  frame.className = `form-frame form-frame--${formInfo.shapeValue || "yuvarlak"}`;
  frame.style.setProperty("--mold-aspect", formInfo.moldAspect || "1 / 1");
  frame.style.setProperty("--mold-frame-width", "70%");

  const image = document.createElement("img");
  image.src = formInfo.sketchUrl || DEV_SKETCH_DATA_URL;
  image.alt = "";
  image.decoding = "async";
  image.loading = "lazy";
  frame.append(image);
  visual.append(measureLabel, frame);

  return visual;
}

function createFinishVisual(resultOrInfo) {
  const formInfo = resultOrInfo.formInfo || resultOrInfo;
  const metalValue = resultOrInfo.metal?.value || resultOrInfo.metalValue || "altin";
  const surfaceValue = resultOrInfo.surface?.value || resultOrInfo.surfaceValue || "parlak";
  const stoneValue = "yok";
  const backgroundValue = resultOrInfo.background?.value || resultOrInfo.backgroundValue || "dekupe";
  const generatedImageUrl = resultOrInfo.imageUrl || resultOrInfo.finishImageUrl || formInfo.finishImageUrl || "";
  const renderMode = resultOrInfo.renderMode || formInfo.renderMode || (generatedImageUrl ? "generated" : "composite");

  const visual = document.createElement("div");
  visual.className = `finish-result-visual bg-${backgroundValue}`;

  const label = document.createElement("span");
  label.className = "form-measure-label";
  label.textContent = resultOrInfo.metal?.label || resultOrInfo.metalLabel || "Altın";

  if (generatedImageUrl && renderMode === "generated") {
    visual.classList.add("has-generated-image");
    const image = document.createElement("img");
    image.className = "generated-finish-image";
    image.alt = "";
    setManagedImageSrc(image, generatedImageUrl);
    visual.append(label, image);
    return visual;
  }

  const shell = document.createElement("div");
  shell.className = `finish-shell metal-${metalValue} surface-${surfaceValue} stone-${stoneValue}`;

  const frame = document.createElement("div");
  frame.className = `form-frame form-frame--${formInfo.shapeValue || "yuvarlak"}`;
  frame.style.setProperty("--mold-aspect", formInfo.moldAspect || "1 / 1");
  frame.style.setProperty("--mold-frame-width", "72%");

  const image = document.createElement("img");
  image.src = formInfo.sketchUrl || DEV_SKETCH_DATA_URL;
  image.alt = "";
  image.decoding = "async";
  image.loading = "lazy";

  const stone = document.createElement("span");
  stone.className = "finish-stone";

  frame.append(image);
  shell.append(frame, stone);
  visual.append(label, shell);

  return visual;
}

function setMockupStatusMessage(message, tone, options = {}) {
  const el = (visualizationPanelForStage(options.stage) || activeVisualizationPanel() || document)
    .querySelector("[data-mockup-status-msg]");
  if (!el) return;
  const visible = isVisibleStatusTone(tone);
  el.textContent = visible ? message || "" : "";
  el.classList.toggle("is-error", visible && tone === "error");
  el.classList.toggle("is-success", visible && tone === "notice");
  el.classList.toggle("is-warning", visible && tone === "warning");
}

// Mockup (3. aşama) ve manken (4. aşama) artık ayrı paneller kullanır; ortak olan
// yalnızca üretim pipeline'ıdır. Bu fonksiyon doğru paneli gösterip diğerini gizler.
function enterVisualizationStage(stage, options = {}) {
  const isManken = stage === "manken";
  const allowMissing = options.allowMissing === true;
  const finishInfo = getSelectedFinishInfo();
  if (!finishInfo && !allowMissing) {
    setFinishStatusMessage(
      `${isManken ? "Manken" : "Mockup"} aşaması için önce bir ürün fotoğrafı seç.`,
      "error"
    );
    return;
  }

  const finishPanel = document.querySelector('[data-stage-panel="finish"]');
  const activePanel = document.querySelector(isManken ? '[data-stage-panel="manken"]' : '[data-stage-panel="mockup"]');
  const inactivePanel = document.querySelector(isManken ? '[data-stage-panel="mockup"]' : '[data-stage-panel="manken"]');

  const activePanelFinishId = activePanel?.dataset.finishId || "";
  if (finishInfo && activePanelFinishId && activePanelFinishId !== finishInfo.title && !isRestoringProject) {
    clearMockupResults();
    if (activePanel) activePanel.dataset.finishId = finishInfo.title;
  } else if (finishInfo && activePanel) {
    activePanel.dataset.finishId = finishInfo.title;
  } else if (!finishInfo && activePanel) {
    delete activePanel.dataset.finishId;
  }

  newDesignStudio?.classList.remove("is-finish-stage", "is-form-stage", "is-mockup-stage", "is-manken-stage");
  newDesignStudio?.classList.add(isManken ? "is-manken-stage" : "is-mockup-stage");
  setSceneSelection(isManken ? "manken" : "mockup");
  updateMockupCost();
  finishPanel?.setAttribute("hidden", "");
  inactivePanel?.setAttribute("hidden", "");
  activePanel?.removeAttribute("hidden");
  syncResultStageVisibility("mockup");
  renderMockupPreview(finishInfo);
  if (isManken) setWorkflowForMankenStage();
  else setWorkflowForMockupStage();
  applyStageRestrictions();
  if (!finishInfo) {
    setMockupStatusMessage(
      `${isManken ? "Manken" : "Mockup"} için ürün fotoğrafı yükle veya Görsel Üretimi aşamasından seçim yap.`,
      "warning"
    );
  } else {
    setMockupStatusMessage("");
  }
  scheduleManagedImageVisibilityRefresh();
  queueActiveProjectSave();
}

function enterMockupStage(options = {}) {
  enterVisualizationStage("mockup", options);
}

function enterMankenStage(options = {}) {
  enterVisualizationStage("manken", options);
}

function exitMockupStage() {
  const finishPanel = document.querySelector('[data-stage-panel="finish"]');

  newDesignStudio?.classList.remove("is-mockup-stage", "is-manken-stage");
  newDesignStudio?.classList.add("is-finish-stage");
  clearMockupResults();
  document
    .querySelectorAll('[data-stage-panel="mockup"], [data-stage-panel="manken"]')
    .forEach((panel) => panel.setAttribute("hidden", ""));
  finishPanel?.removeAttribute("hidden");
  setWorkflowForFinishStage();
  setMockupStepReady(Boolean(getSelectedFinishInfo()));
  queueActiveProjectSave();
}

function renderMockupPreview(finishInfo) {
  const slot = (activeVisualizationPanel() || document).querySelector("[data-mockup-product-preview]");
  if (!slot) return;
  if (!finishInfo) {
    replaceChildrenReleasing(slot);
    return;
  }
  // Stage-1 ham tasarım seçiminde elde kompozit yok. createFinishVisual bu durumda
  // kare tasarımı CSS yüzük şablonunun içine yapıştırıp bozuk gösteriyordu; bunun
  // yerine seçilen tasarımı temiz göster. Gerçek ürün kompoziti üretimde server'da
  // oluşturuluyor.
  const generatedImageUrl = finishInfo.finishImageUrl || finishInfo.imageUrl || "";
  const renderMode = finishInfo.renderMode || (generatedImageUrl ? "generated" : "composite");
  if (renderMode !== "generated" || !generatedImageUrl) {
    replaceChildrenReleasing(slot, createMockupDesignPreview(finishInfo));
    return;
  }
  replaceChildrenReleasing(slot, createFinishVisual(finishInfo));
}

function createMockupDesignPreview(finishInfo) {
  const visual = document.createElement("div");
  visual.className = "finish-result-visual bg-temiz has-generated-image";

  const label = document.createElement("span");
  label.className = "form-measure-label";
  label.textContent = finishInfo.metalLabel || finishInfo.metal?.label || "Gümüş";

  const designUrl = finishInfo.sketchUrl || finishInfo.sourceFormUrl || finishInfo.finishImageUrl || "";
  const image = document.createElement("img");
  image.className = "generated-finish-image";
  image.alt = "";
  setManagedImageSrc(image, designUrl || DEV_SKETCH_DATA_URL);

  visual.append(label, image);
  return visual;
}

async function generateMockupResults() {
  const finishInfo = getSelectedFinishInfo();
  if (!finishInfo) {
    setMockupStatusMessage("Görsel oluşturmak için seçili bir ürün fotoğrafı gerekli.", "error");
    return;
  }

  const scene = readSelectedChip("scene");
  const channel = readSelectedChip("channel");
  const visualStyle = readSelectedChip("visual-style");
  const ratio = readSelectedChip("ratio");
  const { creditCost, mockupCount, resolution, resolutionLabel } = selectedMockupConfig();
  const resolutionConfig = { label: resolutionLabel, value: resolution };
  const normalizedScene = normalizeMockupScene(scene);
  const stage = normalizedScene.value === "manken" ? "manken" : "mockup";
  const generationLabel = `${mockupCount} ${normalizedScene.value === "manken" ? "manken" : "mockup"} görseli oluşturma (${resolutionConfig.label})`;
  const stageLabel = stage === "manken" ? "4. aşama manken" : "3. aşama mockup";
  if (!ensureCreditsForGeneration({ amount: creditCost, label: generationLabel, stage })) return;
  const useRealApi = shouldUseRealMockupApi();

  setMockupGeneratingState(true);
  showResultLoading("mockup", mockupCount, { stage });
  setMockupStatusMessage(
    useRealApi
      ? `${stageLabel} görseli hazırlanıyor. Bu biraz sürebilir...`
      : "Test modu aktif. API çağrısı yapmadan örnek vitrin kartları hazırlanıyor...",
    undefined,
    { stage }
  );
  try {
    const results = useRealApi
      ? await generateRealMockupResults({
          channel,
          creditCost,
          finishInfo,
          generationLabel,
          mockupCount,
          ratio,
          resolution: resolutionConfig,
          scene: normalizedScene,
          stage,
          visualStyle,
        })
      : await generateDummyMockupResults({ channel, finishInfo, mockupCount, ratio, resolution: resolutionConfig, scene: normalizedScene, visualStyle });
    if (!useRealApi) {
      showMockupResults(results, { append: true, stage });
      const autoSaveResult = await autoSaveMockupResultsToArchive(results);
      spendCredits({ amount: creditCost, label: generationLabel, stage });
      setMockupStatusMessage(
        `${results.length} vitrin görseli hazır. ${creditCost} kredi harcandı. Beğendiğin sonucu seçebilirsin.${formatAutoSaveStatusSuffix(autoSaveResult)}`,
        "success",
        { stage }
      );
    }
  } catch (error) {
    removeResultLoading("mockup", { stage });
    setMockupStatusMessage(error?.message || `${stageLabel} görseli hazırlanamadı.`, "error", { stage });
  } finally {
    setMockupGeneratingState(false);
  }
}

async function generateDummyMockupResults(options) {
  await new Promise((resolve) => setTimeout(resolve, 360));
  return buildDummyMockupResults(options);
}

function buildDummyMockupResults({ channel, finishInfo, mockupCount, ratio, resolution, scene, visualStyle }) {
  return Array.from({ length: mockupCount }, (_, index) => ({
    channel,
    finishInfo,
    id: `mockup-${Date.now()}-${index}`,
    index: index + 1,
    ratio,
    resolution,
    scene,
    visualStyle,
  }));
}

async function generateRealMockupResults({ channel, creditCost, finishInfo, generationLabel, mockupCount, ratio, resolution, scene, stage = "mockup", visualStyle }) {
  let job = null;
  try {
    job = createGenerationJob({
      count: mockupCount,
      creditCost,
      label: generationLabel,
      metadata: { channel, finishInfo, ratio, resolution, scene, visualStyle },
      stage,
    });
    publishPendingSavedDesigns(job, buildPendingSavedDesignEntries(job));
    const requestPayload = await buildMockupRequestPayload({
      channel,
      finishInfo,
      mockupCount,
      ratio,
      resolution,
      scene,
      visualStyle,
    });
    const { job: submittedJob, payload } = await submitGenerationJob({
      apiUrl: mockupApiUrl(),
      job,
      requestPayload,
    });
    await completeMockupGeneration(submittedJob, payload);
  } catch (error) {
    if (job?.id) removePendingSavedDesigns(job.id);
    throw error;
  }
  return [];
}

async function autoSaveMockupResultsToArchive(results, options = {}) {
  const safeResults = Array.isArray(results) ? results.filter((result) => result?.imageUrl) : [];
  if (!safeResults.length) return null;

  const finishInfo = safeResults.find((result) => result?.finishInfo)?.finishInfo || options.finishInfo || {};
  const sourceImageUrl = await savedSourceImageUrlFromFinishInfo(finishInfo);
  const job = options.job || null;
  const projectId = job ? generationProjectId(job) : activeProjectId;
  const projectTitle = job ? generationProjectTitle(job) : projectTitleById(projectId);

  return autoSaveGeneratedDesigns(
    safeResults.map((result) => ({
      ...designProfileFieldsFromSource(result.finishInfo || finishInfo),
      ...storageFieldsFromSource(result),
      imageUrl: result.imageUrl,
      projectId,
      projectTitle,
      sourceImageUrl,
      sourceFileName: (result.finishInfo || finishInfo)?.title || "",
      sourceStage: "mockup",
      sourceTitle: (result.finishInfo || finishInfo)?.title || "",
      stage: "Mockup / Manken Foto",
      title: mockupResultTitle(result),
    })),
    job ? { job } : {}
  );
}

async function completeMockupGeneration(job, payload, options = {}) {
  const { channel, finishInfo, ratio, resolution, scene, visualStyle } = job.metadata || {};
  const images = Array.isArray(payload.images) ? payload.images : [];
  if (!images.length) {
    throw new Error("Mockup fotoğrafı üretildi ancak görsel döndürülmedi.");
  }

  const generatedAt = generationResultTimestamp(job, payload);
  const results = images.map((image, index) => ({
    ...storageFieldsFromSource(image),
    channel,
    finishInfo,
    generatedAt: validIsoDate(image.generatedAt || image.createdAt || image.savedAt || "") || generatedAt,
    id: `mockup-${payload.requestId || Date.now()}-${index}`,
    imageUrl: image.url,
    index: index + 1,
    ratio,
    resolution,
    scene,
    visualStyle,
  }));
  const shouldRenderToWorkspace = isGenerationForActiveProject(job);
  if (shouldRenderToWorkspace) {
    showMockupResults(results, { append: true, stage: job.stage });
  }
  persistMockupResultsToProject(job, results);
  const autoSaveResult = await autoSaveMockupResultsToArchive(results, { finishInfo, job });
  spendCredits({ amount: job.creditCost, jobId: job.id, label: job.label, stage: isVisualizationStage(job.stage) ? job.stage : "mockup" });
  await finalizeGenerationDelivery(job);
  if (shouldRenderToWorkspace) {
    setMockupStatusMessage(
      `${results.length} vitrin görseli hazır. ${job.creditCost} kredi harcandı.${options.recovered ? " Sayfa yenilendikten sonra sonuç geri alındı." : ""} Beğendiğin sonucu seçebilirsin.${formatAutoSaveStatusSuffix(autoSaveResult)}${formatStorageWarningStatusSuffix(payload)}`,
      "success",
      { stage: job.stage }
    );
  }
  setMockupGeneratingState(false);
  return results;
}

async function buildMockupRequestPayload({ channel, finishInfo, mockupCount, ratio, resolution, scene, visualStyle }) {
  const normalizedScene = normalizeMockupScene(scene);
  const normalizedResolution = mockupResolutionConfig(resolution?.value);
  const normalizedMockupCount = normalizeMockupCountValue(mockupCount);
  const productValue = finishInfo.productValue || "yuzuk";
  const productShape = finishInfo.productShapeValue || finishInfo.shapeValue || "yuvarlak";
  const metalValue = finishInfo.metalValue || "altin";
  const payload = {
    channel: channel.value || "etsy",
    designMode: finishInfo.designModeValue || "engrave",
    metal: metalValue,
    mockupCount: normalizedMockupCount,
    product: productValue,
    productShape,
    ratio: ratio.value || "square",
    resolution: normalizedResolution.value,
    scene: normalizedScene.value,
    sourceTitle: finishInfo.title || "",
    surface: finishInfo.surfaceValue || "parlak",
    visualStyle: visualStyle.value || "minimal",
    // 3. aşama her zaman 2. aşama kompozitini referans alır. Kullanıcı yalnızca
    // 1. aşama tasarımı seçtiyse kompozit yoktur; bu finish opsiyonlarıyla sunucu
    // tasarımı ürün yüzeyine oturtup (buildFinishImages) öyle gönderir.
    background: finishInfo.backgroundValue || "dekupe",
    ringMold:
      (productValue === "yuzuk" && productShape !== "dikdortgen") || productValue === "kolye"
        ? finishRingMoldKeyFor(productShape, metalValue, productValue)
        : "",
  };
  if (productValue === "yuzuk" && finishInfo.sidePrint) {
    payload.sidePrint = true;
  }

  const directFileMatches = (url) =>
    directMockupFinishFile &&
    directMockupFinish &&
    [directMockupFinish.finishImageUrl, directMockupFinish.sketchUrl, directMockupFinish.sourceFormUrl].includes(url);

  // renderMode "sketch": elde sadece 1. aşama (düz) tasarımı var → sunucu kompozitlesin.
  if ((finishInfo.renderMode || "") === "sketch") {
    const designSource = finishInfo.sketchUrl || finishInfo.sourceFormUrl || "";
    payload.compositeFromDesign = true;
    if (/^https?:\/\//i.test(designSource)) {
      payload.designUrl = designSource;
      return payload;
    }
    if (designSource.startsWith("data:image/")) {
      payload.designDataUrl = designSource;
      return payload;
    }
    if (directFileMatches(designSource)) {
      payload.designDataUrl = await readFileAsDataUrl(directMockupFinishFile);
      return payload;
    }
    throw new Error("Bu tasarım doğrudan API'ye gönderilemiyor. Görseli yeniden yükleyip tekrar dene.");
  }

  // Zaten bitmiş ürün/kompozit (2. aşama sonucu ya da yüklenen ürün görseli).
  const productSource = finishInfo.finishImageUrl || finishInfo.sketchUrl || finishInfo.sourceFormUrl || "";
  if (/^https?:\/\//i.test(productSource)) {
    payload.productUrl = productSource;
    return payload;
  }
  if (productSource.startsWith("data:image/")) {
    payload.imageDataUrl = productSource;
    return payload;
  }
  if (directFileMatches(productSource)) {
    payload.imageDataUrl = await readFileAsDataUrl(directMockupFinishFile);
    return payload;
  }

  throw new Error("Bu ürün fotoğrafı doğrudan API'ye gönderilemiyor. Görseli yeniden yükleyip tekrar dene.");
}

function setMockupGeneratingState(isGenerating) {
  document.querySelectorAll("[data-generate-mockup]").forEach((button) => {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent;
    }

    button.disabled = isGenerating;
    button.classList.toggle("is-disabled", isGenerating);
    button.textContent = isGenerating ? "Görsel hazırlanıyor..." : button.dataset.originalLabel;
  });
}

function showMockupResults(results, options = {}) {
  const stage = isVisualizationStage(options.stage) ? options.stage : currentVisualizationStage();
  const resultGrid = (visualizationPanelForStage(stage) || activeVisualizationPanel() || document)
    .querySelector("[data-mockup-result-grid]");
  if (!resultGrid) return;

  const safeResults = Array.isArray(results) ? results : [];
  const cards = safeResults.map(createMockupResultCard);
  removeResultLoading("mockup", { stage });
  if (options.append) {
    resultGrid.prepend(...cards);
  } else {
    replaceChildrenReleasing(resultGrid, ...cards);
  }
  const hasResults = Boolean(resultGrid.querySelector("[data-mockup-result-card]"));
  resultGrid.hidden = !hasResults;
  syncMockupResultUi();
  if (!isRestoringProject) flushProjectSave();
  else queueActiveProjectSave();
}

function mockupResultTitle(result, index = result.index || 1) {
  const scene = normalizeMockupScene(result.scene || { label: result.sceneLabel, value: result.sceneValue });
  return `${scene.label} ${String(index).padStart(2, "0")}`;
}

function persistMockupResultsToProject(job, results) {
  const projectId = generationProjectId(job);
  if (!projectId) return false;
  if (activeProjectId === projectId) return flushProjectSave();

  const incomingResults = Array.isArray(results)
    ? results.filter((result) => result?.imageUrl || result?.id)
    : [];
  if (!incomingResults.length) return false;

  return patchProjectState(
    projectId,
    (state) => {
      const mockupResults = Array.isArray(state.mockupResults) ? [...state.mockupResults] : [];
      const seenKeys = new Set(
        mockupResults
          .map((result) => result.mockupImageUrl || result.id)
          .filter(Boolean)
      );

      incomingResults.forEach((result) => {
        const key = result.imageUrl || result.id;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);
        mockupResults.push(mockupResultProjectState(result, mockupResults.length));
      });

      return {
        ...state,
        mockupResults,
        stage: maxProjectStage(state.stage, isVisualizationStage(job.stage) ? job.stage : "mockup"),
      };
    },
    {
      createdAt: job.createdAt,
      title: generationProjectTitle(job),
    }
  );
}

function mockupResultProjectState(result, index) {
  const finishInfo = result.finishInfo || {};
  const channel = result.channel || {};
  const ratio = result.ratio || {};
  const resolution = result.resolution || {};
  const scene = result.scene || {};
  const visualStyle = result.visualStyle || {};
  const resultIndex = index + 1;
  const normalizedScene = normalizeMockupScene(scene);
  const sceneLabel = normalizedScene.label;

  return {
    ...storageFieldsFromSource(result),
    channelLabel: channel.label || "Etsy",
    channelValue: channel.value || "etsy",
    finishInfo,
    finishImageUrl: safePersistedImageUrl(finishInfo.finishImageUrl || "", "finishImageUrl"),
    id: result.id || `mockup-saved-${Date.now()}-${index}`,
    index: resultIndex,
    mockupImageUrl: safePersistedImageUrl(result.imageUrl || "", "mockupImageUrl"),
    ratioLabel: ratio.label || "1:1",
    ratioValue: ratio.value || "square",
    resolutionLabel: resolution.label || String(resolution.value || "1k").toUpperCase(),
    resolutionValue: resolution.value || "1k",
    sceneLabel,
    sceneValue: normalizedScene.value,
    selected: false,
    subtitle: `${sceneLabel} · ${channel.label || "Etsy"} · ${ratio.label || "1:1"} · ${resolution.label || String(resolution.value || "1k").toUpperCase()} · ${finishInfo.title || "Ürün renderı"}`,
    title: `${sceneLabel} ${String(resultIndex).padStart(2, "0")}`,
    visualStyleLabel: visualStyle.label || "Minimal",
    visualStyleValue: visualStyle.value || "minimal",
  };
}

function createMockupResultCard(result) {
  const channel = result.channel || {};
  const finishInfo = result.finishInfo || {};
  const finishProfile = designProfileFromFields(finishInfo);
  const ratio = result.ratio || {};
  const resolution = result.resolution || {};
  const scene = result.scene || {};
  const normalizedScene = normalizeMockupScene(scene);
  const visualStyle = result.visualStyle || {};
  const card = document.createElement("article");
  card.className = "sketch-card mockup-result-card";
  if (result.selected) card.classList.add("is-selected");
  card.dataset.mockupResultCard = "1";
  card.dataset.mockupResultId = result.id;
  card.dataset.resultTitle = result.title || mockupResultTitle(result);
  writeStorageDataset(card, result);
  card.dataset.channelLabel = channel.label || "Etsy";
  card.dataset.channelValue = channel.value || "etsy";
  card.dataset.ratioLabel = ratio.label || "1:1";
  card.dataset.ratioValue = ratio.value || "square";
  card.dataset.resolutionLabel = resolution.label || String(resolution.value || "1k").toUpperCase();
  card.dataset.resolutionValue = resolution.value || "1k";
  card.dataset.sceneLabel = normalizedScene.label;
  card.dataset.sceneValue = normalizedScene.value;
  card.dataset.visualStyleLabel = visualStyle.label || "Minimal";
  card.dataset.visualStyleValue = visualStyle.value || "minimal";
  card.dataset.backgroundLabel = finishInfo.backgroundLabel || "Dekupe";
  card.dataset.backgroundValue = finishInfo.backgroundValue || "dekupe";
  card.dataset.designModeLabel = finishInfo.designModeLabel || finishProfile.designModeLabel;
  card.dataset.designModeValue = finishInfo.designModeValue || finishProfile.designModeValue;
  card.dataset.finishImageUrl = finishInfo.finishImageUrl || "";
  card.dataset.finishTitle = finishInfo.title || "Ürün renderı";
  card.dataset.metalLabel = finishInfo.metalLabel || "Altın";
  card.dataset.metalValue = finishInfo.metalValue || "altin";
  card.dataset.moldAspect = finishInfo.moldAspect || finishProfile.moldAspect;
  card.dataset.moldMeasure = finishInfo.moldMeasure || "";
  card.dataset.moldTitle = finishInfo.moldTitle || "Tasarım";
  card.dataset.productLabel = finishInfo.productLabel || finishProfile.productLabel;
  card.dataset.productShapeLabel = finishInfo.productShapeLabel || finishInfo.shapeLabel || finishProfile.productShapeLabel;
  card.dataset.productShapeValue = finishInfo.productShapeValue || finishInfo.shapeValue || finishProfile.productShapeValue;
  card.dataset.productValue = finishInfo.productValue || finishProfile.productValue;
  card.dataset.renderMode = finishInfo.renderMode || "composite";
  card.dataset.shapeValue = finishInfo.shapeValue || finishInfo.productShapeValue || finishProfile.shapeValue;
  card.dataset.sidePrint = finishInfo.sidePrint ? "1" : "";
  card.dataset.sidePrintLeft = finishInfo.sidePrintLeft || "";
  card.dataset.sidePrintRight = finishInfo.sidePrintRight || "";
  card.dataset.sketchUrl = finishInfo.sketchUrl || "";
  card.dataset.sourceFormUrl = finishInfo.sourceFormUrl || "";
  card.dataset.stoneLabel = finishInfo.stoneLabel || "Yok";
  card.dataset.stoneValue = finishInfo.stoneValue || "yok";
  card.dataset.surfaceLabel = finishInfo.surfaceLabel || "Parlak";
  card.dataset.surfaceValue = finishInfo.surfaceValue || "parlak";
  card.dataset.mockupImageUrl = result.imageUrl || "";
  card.tabIndex = 0;

  const badge = document.createElement("span");
  badge.className = "selected-badge";
  badge.textContent = "Seçili";

  const visual = document.createElement("div");
  visual.className = `mockup-result-visual scene-${normalizedScene.value} ratio-${ratio.value || "square"}`;

  if (result.imageUrl) {
    visual.classList.add("has-generated-image");
    const image = document.createElement("img");
    image.className = "generated-mockup-image";
    image.alt = "";
    setManagedImageSrc(image, result.imageUrl);
    visual.append(image);
  } else {
    const scene = document.createElement("span");
    scene.className = "mockup-scene";

    const channel = document.createElement("span");
    channel.className = "mockup-channel-label";
    channel.textContent = `${card.dataset.channelLabel} · ${card.dataset.visualStyleLabel}`;

    const product = document.createElement("div");
    product.className = "mockup-product";
    const finishVisual = createFinishVisual(finishInfo);
    const generatedImage = finishVisual.querySelector(".generated-finish-image");
    const finishShell = finishVisual.querySelector(".finish-shell");
    if (generatedImage) {
      const image = generatedImage.cloneNode();
      image.className = "mockup-product-image";
      image.decoding = "async";
      image.loading = "lazy";
      product.append(image);
    } else if (finishShell) {
      product.append(finishShell);
    }

    visual.append(scene, product, channel);
  }

  const body = document.createElement("div");
  body.className = "sketch-body";

  const subtitle = document.createElement("span");
  subtitle.textContent = `${card.dataset.sceneLabel} · ${card.dataset.channelLabel} · ${card.dataset.ratioLabel} · ${card.dataset.resolutionLabel} · ${finishInfo.title || "Ürün renderı"}`;

  card.setAttribute("aria-label", `${card.dataset.resultTitle}. ${subtitle.textContent}`);

  body.append(subtitle);
  card.append(badge, visual, body);
  card.addEventListener("click", () => selectMockupResult(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectMockupResult(card);
    }
  });

  return card;
}

function selectMockupResult(selectedCard) {
  document.querySelectorAll("[data-mockup-result-card]").forEach((card) => {
    card.classList.toggle("is-selected", card === selectedCard);
  });
  setFinalDesignReady(true);
  queueActiveProjectSave();
}

function hasActiveMockupSelection() {
  return Boolean((activeVisualizationPanel() || document).querySelector("[data-mockup-result-card].is-selected"));
}

function setFinalDesignReady(isReady) {
  // Hem mockup hem manken panelindeki kaydet/sipariş butonlarını birlikte güncelle.
  document.querySelectorAll("[data-save-mockup-design], [data-production-request]").forEach((button) => {
    button.disabled = !isReady;
    button.classList.toggle("is-disabled", !isReady);
  });
}

// ─── Üretim talebi (production request) ─────────────────────────────────────
const PRODUCTION_METAL_LABELS = { altin: "Altın", gumus: "Gümüş", rose: "Rose" };
const PRODUCTION_STATUS_LABELS = {
  pending: "Ödeme bekliyor",
  confirmed: "Ödendi · Onaylandı",
  in_production: "Üretimde",
  shipped: "Kargoda",
  completed: "Tamamlandı",
  cancelled: "İptal",
};
const RING_SIZE_OPTIONS_BY_SHAPE = {
  kare: [
    { key: "kare-s", label: "Kare - S", dimensions: "1,3 x 1,3 cm" },
    { key: "kare-m", label: "Kare - M", dimensions: "1,5 x 1,5 cm" },
    { key: "kare-l", label: "Kare - L", dimensions: "1,7 x 1,7 cm" },
    { key: "kare-xl", label: "Kare - XL", dimensions: "1,9 x 1,9 cm" },
  ],
  oval: [
    { key: "oval-s", label: "Oval - S", dimensions: "1 x 1,2 cm" },
    { key: "oval-m", label: "Oval - M", dimensions: "1,1 x 1,5 cm" },
    { key: "oval-l", label: "Oval - L", dimensions: "1,2 x 1,8 cm" },
    { key: "oval-xl", label: "Oval - XL", dimensions: "1,3 x 2,1 cm" },
  ],
  yuvarlak: [
    { key: "yuvarlak-s", label: "Yuvarlak - S", dimensions: "1,2 cm" },
    { key: "yuvarlak-m", label: "Yuvarlak - M", dimensions: "1,4 cm" },
    { key: "yuvarlak-l", label: "Yuvarlak - L", dimensions: "1,6 cm" },
    { key: "yuvarlak-xl", label: "Yuvarlak - XL", dimensions: "1,8 cm" },
  ],
};
// Kolye ucu ölçüleri (mm). Yuvarlak/kare → çap/kenar; oval/dikdörtgen → YÜKSEKLİK ve
// genişlik 4:5 oranından türer (genişlik = yükseklik × 4/5).
// Server src/services/production-requests.service.js ile SENKRON tutulmalı.
const PENDANT_SIZES_MM = [15, 20, 25, 30, 35, 40];
const PENDANT_ASPECT_SHAPES = ["oval", "dikdortgen"];

function pendantSizeDimensionsText(mm, shape) {
  if (PENDANT_ASPECT_SHAPES.includes(shape)) return `${(mm * 4) / 5} x ${mm} mm (G x Y)`;
  if (shape === "yuvarlak") return `${mm} mm çap`;
  return `${mm} x ${mm} mm`;
}

function pendantSizeOptionsForShape(shape) {
  return PENDANT_SIZES_MM.map((mm) => ({
    key: `kolye-${shape}-${mm}`,
    label: `${mm} mm`,
    dimensions: pendantSizeDimensionsText(mm, shape),
  }));
}

function pendantSizeOption(shape, value) {
  return pendantSizeOptionsForShape(shape).find((option) => option.key === String(value || "").toLowerCase()) || null;
}
// TR ölçü aralığı (varsayılan sistem)
const RING_MEASURE_MIN = 7;
const RING_MEASURE_MAX = 35;
// US ölçü aralığı
const RING_MEASURE_US_MIN = 1;
const RING_MEASURE_US_MAX = 15;
const RING_MEASURE_DEFAULT_SYSTEM = "tr";
let productionRequestsCache = null;

function showStudioToast(message, tone = "info", duration = 4200) {
  const host = document.querySelector("[data-toast-host]");
  if (!host || !message) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.dataset.tone = tone;
  toast.textContent = message;
  host.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function showSiteConfirm({
  eyebrow = "Sepet",
  title = "Ürün sepete eklendi",
  message = "Sepete gitmek ister misin?",
  okText = "Sepete git",
  cancelText = "Vazgeç",
} = {}) {
  const dialog = document.querySelector("[data-site-confirm]");
  if (!dialog) return Promise.resolve(false);

  const titleEl = dialog.querySelector("[data-site-confirm-title]");
  const eyebrowEl = dialog.querySelector("[data-site-confirm-eyebrow]");
  const messageEl = dialog.querySelector("[data-site-confirm-message]");
  const okButton = dialog.querySelector("[data-site-confirm-ok]");
  const cancelButtons = dialog.querySelectorAll("[data-site-confirm-cancel]");

  if (eyebrowEl) eyebrowEl.textContent = eyebrow;
  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;
  if (okButton) okButton.textContent = okText;
  cancelButtons.forEach((button) => {
    button.textContent = button.classList.contains("site-confirm-backdrop") ? "" : cancelText;
  });

  dialog.hidden = false;
  document.body.classList.add("is-production-dialog-open");
  okButton?.focus?.();

  return new Promise((resolve) => {
    const cleanup = (value) => {
      dialog.hidden = true;
      const productionDialog = document.querySelector("[data-production-dialog]");
      const cartDrawer = document.querySelector("[data-cart-drawer]");
      if (!productionDialog?.open && cartDrawer?.hidden !== false) {
        document.body.classList.remove("is-production-dialog-open");
      }
      okButton?.removeEventListener("click", onOk);
      cancelButtons.forEach((button) => button.removeEventListener("click", onCancel));
      window.removeEventListener("keydown", onKeydown);
      resolve(value);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onKeydown = (event) => {
      if (event.key === "Escape") cleanup(false);
    };
    okButton?.addEventListener("click", onOk);
    cancelButtons.forEach((button) => button.addEventListener("click", onCancel));
    window.addEventListener("keydown", onKeydown);
  });
}

function readSelectedMockupSnapshot() {
  const selected = (activeVisualizationPanel() || document).querySelector("[data-mockup-result-card].is-selected");
  if (!selected) return null;
  const dataset = selected.dataset || {};
  const imageUrl = safePersistedImageUrl(dataset.mockupImageUrl || "", "mockupImageUrl");
  if (!imageUrl) return null;

  const productValue = (dataset.productValue || dataset.product || "yuzuk").toLowerCase();
  const shapeValue = (dataset.productShapeValue || dataset.productShape || "yuvarlak").toLowerCase();
  return {
    designRef: dataset.savedDesignId || dataset.mockupResultId || "",
    product: productValue === "kolye" ? "kolye" : "yuzuk",
    productShape: ["dikdortgen", "kare", "oval", "yuvarlak"].includes(shapeValue) ? shapeValue : "yuvarlak",
    designSnapshot: {
      imageUrl,
      sourceImageUrl: safePersistedImageUrl(dataset.sourceImageUrl || "", "sourceImageUrl"),
      finishImageUrl: safePersistedImageUrl(dataset.finishImageUrl || "", "finishImageUrl"),
      title: dataset.resultTitle || selected.querySelector(".sketch-body strong")?.textContent || dataset.title || "Tasarım",
      stage: dataset.stage || "mockup",
      designMode: dataset.designModeValue || "engrave",
      designModeLabel: dataset.designModeLabel || "",
      productLabel: dataset.productLabel || (productValue === "kolye" ? "Kolye" : "Yüzük"),
      shapeLabel: dataset.productShapeLabel || dataset.shapeLabel || "",
      moldKey: dataset.moldKey || "",
      storagePath: dataset.storagePath || "",
      storageBucket: dataset.storageBucket || "",
    },
  };
}


function applyProfileDefaultsToProductionForm(form) {
  if (!form) return;
  const profile = readStoredProfile();
  const email = currentProfileEmail();
  if (form.elements.contactEmail && email && email !== "—" && !email.endsWith("@ff.local")) {
    form.elements.contactEmail.value = email;
  }
  if (form.elements.contactPhone && profile.phone) {
    form.elements.contactPhone.value = profile.phone;
  }
}

function currentCheckoutProfile() {
  const profile = readStoredProfile();
  const email = currentProfileEmail();
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  return {
    name,
    phone: profile.phone || "",
    email: email && email !== "—" && !email.endsWith("@ff.local") ? email : "",
  };
}

function readRequiredOrderProfile() {
  const contactInfo = currentCheckoutProfile();
  const profile = readStoredProfile();
  if (!profile.firstName) return { contactInfo, error: "Sipariş oluşturmak için Profilim ekranında ad bilgisini tamamla." };
  if (!profile.lastName) return { contactInfo, error: "Sipariş oluşturmak için Profilim ekranında soyad bilgisini tamamla." };
  if (!contactInfo.phone) return { contactInfo, error: "Sipariş oluşturmak için Profilim ekranında telefon bilgisini tamamla." };
  if (!contactInfo.email) return { contactInfo, error: "Sipariş oluşturmak için e-posta oturumun gerekli." };
  return { contactInfo, error: "" };
}

function hasRequiredOrderProfile() {
  return !readRequiredOrderProfile().error;
}

// Zincir AYRI SATILAN opsiyon: müşteri istemeyebilir. Tür daima forse; kalınlık ince/orta/kalın.
// Uzunluk elle girilir (cm veya inç) — kanonik değer DAİMA cm.
// Server src/config/physical-pricing.js + production-requests.service.js ile SENKRON tutulmalı.
const CHAIN_TYPE_LABELS = { ince: "İnce forse zincir", orta: "Orta forse zincir", kalin: "Kalın forse zincir" };
const CHAIN_MIN_CM = 30;
const CHAIN_MAX_CM = 80;
const CM_PER_INCH = 2.54;
const CHAIN_MIN_INCH = Math.ceil(CHAIN_MIN_CM / CM_PER_INCH); // 12
const CHAIN_MAX_INCH = Math.floor(CHAIN_MAX_CM / CM_PER_INCH); // 31

function chainLengthBounds(unit) {
  return unit === "inch"
    ? { min: CHAIN_MIN_INCH, max: CHAIN_MAX_INCH }
    : { min: CHAIN_MIN_CM, max: CHAIN_MAX_CM };
}

// Form değerlerinden zincir seçimini çözer; geçersiz uzunlukta lengthCm 0 kalır (fiyat gösterilmez).
function chainSelectionFromForm(formData, isKolye) {
  const enabled = isKolye && Boolean(formData.get("chainIncluded"));
  if (!enabled) {
    return { enabled: false, type: "", lengthCm: 0, lengthUnit: "", lengthValue: 0, label: "" };
  }
  const type = ["ince", "orta", "kalin"].includes(String(formData.get("chainType") || ""))
    ? String(formData.get("chainType"))
    : "orta";
  const unit = String(formData.get("chainLengthUnit") || "cm") === "inch" ? "inch" : "cm";
  const raw = Number(formData.get("chainLengthValue"));
  const bounds = chainLengthBounds(unit);
  const valid = Number.isFinite(raw) && raw >= bounds.min && raw <= bounds.max;
  if (!valid) return { enabled: true, type, lengthCm: 0, lengthUnit: unit, lengthValue: 0, label: "" };

  const lengthCm = unit === "inch" ? Math.round(raw * CM_PER_INCH) : Math.round(raw);
  const lengthValue = unit === "inch" ? Math.round(raw * 2) / 2 : lengthCm;
  const lengthText = unit === "inch" ? `${lengthValue} inç (${lengthCm} cm)` : `${lengthCm} cm`;
  return {
    enabled: true,
    type,
    lengthCm,
    lengthUnit: unit,
    lengthValue,
    label: `${CHAIN_TYPE_LABELS[type]}, ${lengthText}`,
  };
}
const ORDER_CART_STORAGE_KEY = "ff-studio-order-cart-v1";
let orderCartItems = readOrderCartItems();
let orderCartCloseTimer = null;

function ringSizeOption(shape, value) {
  const options = RING_SIZE_OPTIONS_BY_SHAPE[shape] || [];
  const key = normalizeRingSize(shape, value);
  return options.find((option) => option.key === key) || null;
}

function renderOrderRingSizeOptions(form, product, selectedShape, selectedSize) {
  const field = form.querySelector("[data-production-ring-size]");
  const row = form.querySelector("[data-production-ring-size-row]");
  if (!field || !row) return;

  const shape = normalizeOrderShape(selectedShape, product);
  const options = product === "yuzuk" ? RING_SIZE_OPTIONS_BY_SHAPE[shape] || [] : [];
  field.hidden = !options.length;
  row.replaceChildren();
  if (!options.length) return;

  const active = normalizeRingSize(shape, selectedSize);
  row.replaceChildren(
    ...options.map((option) => {
      const label = document.createElement("label");
      label.className = "production-chip production-size-chip";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "ringSize";
      input.value = option.key;
      input.required = true;
      if (option.key === active) input.checked = true;
      const text = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = option.label;
      const dimensions = document.createElement("small");
      dimensions.textContent = option.dimensions;
      text.append(title, dimensions);
      label.append(input, text);
      return label;
    })
  );
}

// Kolye ucu ölçüsü seçimi (mm). Varsayılan seçili gelmez; kullanıcı seçmeden sepete eklenemez.
function renderOrderPendantSizeOptions(form, product, selectedShape, selectedSize) {
  const field = form.querySelector("[data-production-pendant-size]");
  const row = form.querySelector("[data-production-pendant-size-row]");
  if (!field || !row) return;

  const shape = normalizeOrderShape(selectedShape, product);
  const options = product === "kolye" ? pendantSizeOptionsForShape(shape) : [];
  field.hidden = !options.length;
  row.replaceChildren();
  if (!options.length) return;

  const hint = field.querySelector("[data-production-pendant-size-hint]");
  if (hint) {
    hint.textContent = PENDANT_ASPECT_SHAPES.includes(shape)
      ? "Seçtiğin ölçü yüksekliktir; genişlik 4:5 oranıyla belirlenir."
      : shape === "yuvarlak"
        ? "Seçtiğin ölçü kolye ucunun çapıdır."
        : "Seçtiğin ölçü kolye ucunun kenar uzunluğudur.";
  }

  const active = pendantSizeOption(shape, selectedSize)?.key || "";
  row.replaceChildren(
    ...options.map((option) => {
      const label = document.createElement("label");
      label.className = "production-chip production-size-chip";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "pendantSize";
      input.value = option.key;
      input.required = true;
      if (option.key === active) input.checked = true;
      const text = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = option.label;
      const dimensions = document.createElement("small");
      dimensions.textContent = option.dimensions;
      text.append(title, dimensions);
      label.append(input, text);
      return label;
    })
  );
}

function renderOrderRingMeasureOptions(form, product, selectedMeasure, selectedSystem) {
  const field = form.querySelector("[data-production-ring-measure]");
  const select = form.querySelector("[data-production-ring-measure-select]");
  const systemSelect = form.querySelector("[data-production-ring-measure-system]");
  if (!field || !select) return;

  const isRing = product === "yuzuk";
  field.hidden = !isRing;
  select.required = isRing;
  if (systemSelect) systemSelect.required = isRing;
  if (!isRing) {
    select.replaceChildren();
    return;
  }

  const system = normalizeRingMeasureSystem(selectedSystem || systemSelect?.value);
  if (systemSelect) systemSelect.value = system;
  const bounds = ringMeasureBounds(system);
  const active = normalizeRingMeasure(selectedMeasure || select.value, system);
  select.replaceChildren(
    ...Array.from({ length: bounds.max - bounds.min + 1 }, (_, index) => {
      const measure = bounds.min + index;
      const option = document.createElement("option");
      option.value = String(measure);
      option.textContent = String(measure);
      if (measure === active) option.selected = true;
      return option;
    })
  );

  if (systemSelect && !systemSelect.dataset.measureListenerAttached) {
    systemSelect.addEventListener("change", () => {
      renderOrderRingMeasureOptions(form, "yuzuk", "", systemSelect.value);
    });
    systemSelect.dataset.measureListenerAttached = "1";
  }
}

function updateOrderChainVisibility(form, product) {
  const chain = form.querySelector("[data-production-chain]");
  if (chain) chain.hidden = product !== "kolye";
  updateOrderChainFields(form);
}

// Zincir opsiyonel: kutu işaretli değilken kalınlık/uzunluk alanları gizli ve zorunlu değil.
// Birim değişince min/max ve placeholder cm↔inç aralığına göre yeniden yazılır.
function updateOrderChainFields(form) {
  const details = form.querySelector("[data-production-chain-details]");
  const included = form.querySelector("[data-production-chain-included]");
  const unitSelect = form.querySelector("[data-production-chain-unit]");
  const lengthInput = form.querySelector("[data-production-chain-length]");
  const hint = form.querySelector("[data-production-chain-hint]");
  if (!details || !included || !unitSelect || !lengthInput) return;

  const chainVisible = form.querySelector("[data-production-chain]")?.hidden === false;
  const wants = chainVisible && included.checked;
  details.hidden = !wants;

  const isInch = unitSelect.value === "inch";
  const unit = isInch ? "inch" : "cm";
  const bounds = chainLengthBounds(unit);

  // Birim değişince girilen değer yeni birime çevrilir; aksi halde "45" inç alanında
  // geçersiz kalırdı. Sınır dışına taşarsa aralığa kırpılır.
  const previousUnit = lengthInput.dataset.chainUnit;
  if (previousUnit && previousUnit !== unit && lengthInput.value !== "") {
    const current = Number(lengthInput.value);
    if (Number.isFinite(current)) {
      const converted = isInch ? current / CM_PER_INCH : current * CM_PER_INCH;
      const rounded = isInch ? Math.round(converted * 2) / 2 : Math.round(converted);
      lengthInput.value = String(Math.min(bounds.max, Math.max(bounds.min, rounded)));
    }
  }
  lengthInput.dataset.chainUnit = unit;

  lengthInput.min = String(bounds.min);
  lengthInput.max = String(bounds.max);
  lengthInput.step = isInch ? "0.5" : "1";
  lengthInput.placeholder = `${bounds.min}-${bounds.max}`;
  lengthInput.required = wants;
  if (unitSelect) unitSelect.required = wants;

  if (hint) {
    hint.textContent = wants
      ? `Tüm zincirlerimiz forse zincirdir. Uzunluk ${bounds.min}-${bounds.max} ${isInch ? "inç" : "cm"} arasında olmalı.`
      : "Tüm zincirlerimiz forse zincirdir.";
  }
}

// ─── Tek başına zincir satışı (Sipariş > Zincir) ────────────────────────────
// Kolyeye eklenen zincirle aynı tarife (cm × kalınlık) kullanılır; fark, baz ürün
// bedelinin olmaması ve adet seçilebilmesidir.
function chainShopBodyFromForm(form) {
  const formData = new FormData(form);
  const type = ["ince", "orta", "kalin"].includes(String(formData.get("chainType") || ""))
    ? String(formData.get("chainType"))
    : "orta";
  const unit = String(formData.get("chainLengthUnit") || "cm") === "inch" ? "inch" : "cm";
  const raw = Number(formData.get("chainLengthValue"));
  const bounds = chainLengthBounds(unit);
  const valid = Number.isFinite(raw) && raw >= bounds.min && raw <= bounds.max;
  const lengthCm = valid ? (unit === "inch" ? Math.round(raw * CM_PER_INCH) : Math.round(raw)) : 0;
  const lengthValue = valid ? (unit === "inch" ? Math.round(raw * 2) / 2 : lengthCm) : 0;
  const lengthText = unit === "inch" ? `${lengthValue} inç (${lengthCm} cm)` : `${lengthCm} cm`;
  const quantity = Math.min(10, Math.max(1, Number.parseInt(formData.get("quantity"), 10) || 1));

  return {
    product: "zincir",
    productShape: "",
    metal: normalizeOrderMetal(formData.get("metal")),
    sizeKey: "",
    sizeLabel: "",
    quantity,
    chain: {
      enabled: valid,
      type,
      lengthCm,
      lengthUnit: unit,
      lengthValue,
      label: valid ? `${CHAIN_TYPE_LABELS[type]}, ${lengthText}` : "",
    },
    customerNote: "",
    contactInfo: { email: "", phone: "", name: "" },
    designRef: "",
    designSnapshot: {},
    metadata: {},
  };
}

// Birim değişince girilen uzunluğu çevirir, sınırları ve canlı tutarı tazeler.
function updateChainShopForm(form) {
  if (!form) return;
  const unitSelect = form.querySelector("[data-chain-shop-unit]");
  const lengthInput = form.querySelector("[data-chain-shop-length]");
  const hint = form.querySelector("[data-chain-shop-hint]");
  const priceEl = form.querySelector("[data-chain-shop-price]");
  const priceValue = form.querySelector("[data-chain-shop-price-value]");
  if (!unitSelect || !lengthInput) return;

  const unit = unitSelect.value === "inch" ? "inch" : "cm";
  const bounds = chainLengthBounds(unit);
  const previousUnit = lengthInput.dataset.chainUnit;
  if (previousUnit && previousUnit !== unit && lengthInput.value !== "") {
    const current = Number(lengthInput.value);
    if (Number.isFinite(current)) {
      const converted = unit === "inch" ? current / CM_PER_INCH : current * CM_PER_INCH;
      const rounded = unit === "inch" ? Math.round(converted * 2) / 2 : Math.round(converted);
      lengthInput.value = String(Math.min(bounds.max, Math.max(bounds.min, rounded)));
    }
  }
  lengthInput.dataset.chainUnit = unit;
  lengthInput.min = String(bounds.min);
  lengthInput.max = String(bounds.max);
  lengthInput.step = unit === "inch" ? "0.5" : "1";
  lengthInput.placeholder = `${bounds.min}-${bounds.max}`;

  if (hint) {
    hint.textContent = `Tüm zincirlerimiz 925 gümüş forse zincirdir. Uzunluk ${bounds.min}-${bounds.max} ${unit === "inch" ? "inç" : "cm"} arasında olmalı.`;
  }

  const body = chainShopBodyFromForm(form);
  if (priceEl && priceValue) {
    if (body.chain.enabled) {
      priceValue.textContent = formatTryPrice(computeOrderPrice(body).total);
      priceEl.hidden = false;
    } else {
      priceEl.hidden = true;
    }
  }
}

function bindChainShopControls() {
  const form = document.querySelector("[data-chain-shop-form]");
  if (!form || form.dataset.chainShopBound) return;
  form.dataset.chainShopBound = "1";

  const onChange = () => updateChainShopForm(form);
  form.addEventListener("input", onChange);
  form.addEventListener("change", onChange);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const errorBox = form.querySelector("[data-chain-shop-error]");
    const body = chainShopBodyFromForm(form);
    if (!body.chain.enabled) {
      if (errorBox) {
        errorBox.textContent = "Geçerli bir zincir uzunluğu gir.";
        errorBox.hidden = false;
      }
      return;
    }
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }
    addOrderToCart(body);
    openOrderCartDrawer();
  });

  updateChainShopForm(form);
}

function createOrderCartId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readOrderCartItems() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ORDER_CART_STORAGE_KEY) || "[]");
    // Tek başına zincirin tasarım görseli yoktur; diğer ürünlerde görselsiz satır bozuk sayılır.
    return Array.isArray(parsed)
      ? parsed.filter((item) => item?.body?.product === "zincir" || item?.body?.designSnapshot?.imageUrl)
      : [];
  } catch {
    return [];
  }
}

function writeOrderCartItems() {
  try {
    localStorage.setItem(ORDER_CART_STORAGE_KEY, JSON.stringify(orderCartItems));
  } catch {
    // Cart still works in-memory when storage is unavailable.
  }
}

// Fiziksel fiyat — server src/config/physical-pricing.js ile SENKRON tutulmalı (bu yalnız
// gösterim için; otorite server'da). Sabit baz + ölçü/renk ekleri.
const PHYSICAL_PRICE_CONFIG = {
  base: 650,
  sizeSurcharge: { s: 0, m: 150, l: 350, xl: 600 },
  pendantSizeSurcharge: { 15: 0, 20: 150, 25: 350, 30: 600, 35: 850, 40: 1100 },
  // Kaplama eki YALNIZ yüzükte alınır; kolyede kaplama eki yok.
  colorSurcharge: { gumus: 0, altin: 150, rose: 150 },
  colorSurchargeProducts: ["yuzuk"],
  productSurcharge: { yuzuk: 0, kolye: 0 },
  // Zincir ayrı satılır: kalınlığa göre cm başına fiyat.
  chainPricePerCm: { ince: 8, orta: 12, kalin: 18 },
};

function physicalSizeTier(sizeKey) {
  const parts = String(sizeKey || "").trim().toLowerCase().split("-");
  const tier = parts[parts.length - 1];
  return ["s", "m", "l", "xl"].includes(tier) ? tier : "m";
}

// "kolye-oval-25" → 25; kolye ölçü anahtarı değilse 0.
function physicalPendantSizeMm(sizeKey) {
  const parts = String(sizeKey || "").trim().toLowerCase().split("-");
  if (parts[0] !== "kolye") return 0;
  const mm = Number.parseInt(parts[parts.length - 1], 10);
  return PENDANT_SIZES_MM.includes(mm) ? mm : 0;
}

// Zincir fiyatı: kalınlık × uzunluk (cm). Zincir alınmadıysa 0.
function computeChainPrice(chain) {
  if (!chain?.enabled) return 0;
  const rate = PHYSICAL_PRICE_CONFIG.chainPricePerCm[String(chain.type || "").toLowerCase()];
  const cm = Number(chain.lengthCm);
  if (!rate || !Number.isFinite(cm) || cm < CHAIN_MIN_CM || cm > CHAIN_MAX_CM) return 0;
  return Math.round(rate * cm);
}

function computeOrderPrice({ product, sizeKey, metal, quantity = 1, chain } = {}) {
  const productKey = String(product || "").toLowerCase();
  const qty0 = Math.max(1, Number.parseInt(quantity, 10) || 1);
  // Tek başına zincirde baz/ölçü/kaplama eki yok — yalnız zincir bedeli.
  if (productKey === "zincir") {
    const chainOnly = computeChainPrice(chain);
    return { unitPrice: chainOnly, quantity: qty0, total: chainOnly * qty0 };
  }
  const tier = physicalSizeTier(sizeKey);
  // Kolyede ölçü mm; ölçüsüz (eski) kayıtlar S/M/L/XL tablosuna düşer.
  const pendantMm = productKey === "kolye" ? physicalPendantSizeMm(sizeKey) : 0;
  const unit =
    PHYSICAL_PRICE_CONFIG.base +
    (pendantMm
      ? PHYSICAL_PRICE_CONFIG.pendantSizeSurcharge[pendantMm] ?? 0
      : PHYSICAL_PRICE_CONFIG.sizeSurcharge[tier] ?? 0) +
    (PHYSICAL_PRICE_CONFIG.colorSurchargeProducts.includes(productKey)
      ? PHYSICAL_PRICE_CONFIG.colorSurcharge[String(metal || "").toLowerCase()] ?? 0
      : 0) +
    (PHYSICAL_PRICE_CONFIG.productSurcharge[productKey] ?? 0) +
    (productKey === "kolye" ? computeChainPrice(chain) : 0);
  const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
  return { unitPrice: unit, quantity: qty, total: unit * qty };
}

function formatTryPrice(value) {
  return `${new Intl.NumberFormat("tr-TR").format(Math.round(value))}₺`;
}

// Sipariş dialog'unda seçili opsiyonlara göre tahmini fiyatı canlı günceller.
function updateProductionPriceDisplay(form) {
  if (!form) return;
  const priceEl = form.querySelector("[data-production-price]");
  const valueEl = form.querySelector("[data-production-price-value]");
  if (!priceEl || !valueEl) return;
  const body = orderBodyFromProductionForm(form);
  // Fiyat ancak zorunlu seçimler tamamsa gösterilir (yüzükte ölçü, kolyede mm seçimi gerekli;
  // zincir istendiyse geçerli bir uzunluk girilmiş olmalı).
  const chainReady = !body.chain?.enabled || Boolean(body.chain?.lengthCm);
  const ready = body.product && body.metal && body.sizeKey && chainReady;
  if (!ready) {
    priceEl.hidden = true;
    return;
  }
  valueEl.textContent = formatTryPrice(computeOrderPrice(body).total);
  priceEl.hidden = false;
}

function orderBodyFromProductionForm(form, snapshot = {}) {
  const resolvedSnapshot = resolveProductionFormSnapshot(form, snapshot);
  const formData = new FormData(form);
  const product = normalizeOrderProduct(formData.get("product") || resolvedSnapshot.product);
  const productShape = normalizeOrderShape(formData.get("productShape") || resolvedSnapshot.productShape, product);
  const metal = normalizeOrderMetal(formData.get("metal") || resolvedSnapshot.metal);
  const isKolye = product === "kolye";
  const ringSize = product === "yuzuk" ? ringSizeOption(productShape, formData.get("ringSize")) : null;
  const pendantSize = isKolye ? pendantSizeOption(productShape, formData.get("pendantSize")) : null;
  const ringMeasureSystem = product === "yuzuk" ? normalizeRingMeasureSystem(formData.get("ringMeasureSystem")) : "";
  const ringMeasure = product === "yuzuk" ? normalizeRingMeasure(formData.get("ringMeasure"), ringMeasureSystem) : "";
  const chain = chainSelectionFromForm(formData, isKolye);
  const metadata = isKolye
    ? {
        chain,
        // Eski alanlar geriye dönük uyum için; zincir alınmadıysa boş kalır.
        chainType: chain.enabled ? chain.type : "",
        chainTypeLabel: chain.enabled ? CHAIN_TYPE_LABELS[chain.type] || chain.type : "",
        chainLength: chain.enabled && chain.lengthCm ? String(chain.lengthCm) : "",
        ...(pendantSize
          ? {
              pendantSizeMm: Number.parseInt(pendantSize.key.split("-").pop(), 10),
              pendantSizeLabel: `${pendantSize.label} · ${pendantSize.dimensions}`,
            }
          : {}),
      }
    : ringSize
      ? {
          ringSizeKey: ringSize.key,
          ringSizeLabel: ringSize.label,
          ringSizeDimensions: ringSize.dimensions,
          ringMeasure,
          ringMeasureSystem,
          ringMeasureLabel: ringMeasureLabelText(ringMeasureSystem, ringMeasure),
        }
      : {};
  return {
    product,
    productShape,
    metal,
    sizeKey: (isKolye ? pendantSize?.key : ringSize?.key) || "",
    sizeLabel: isKolye
      ? pendantSize
        ? `${pendantSize.label} · ${pendantSize.dimensions}`
        : ""
      : ringSize
        ? `${ringSize.label} · ${ringSize.dimensions}`
        : "",
    quantity: 1,
    chain,
    customerNote: String(formData.get("customerNote") || "").trim(),
    contactInfo: {
      email: formData.get("contactEmail") || "",
      phone: formData.get("contactPhone") || "",
      name: "",
    },
    designRef: resolvedSnapshot.designRef || "",
    designSnapshot: resolvedSnapshot.designSnapshot || {},
    metadata,
  };
}

function resolveProductionFormSnapshot(form, snapshot = {}) {
  if (snapshot?.designSnapshot?.imageUrl) return snapshot;
  try {
    const parsed = JSON.parse(form?.dataset?.snapshot || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function orderCartItemFromBody(body) {
  // Tek başına zincir: tasarım/şekil/ölçü yok, başlık ve satır zincir tarifinden kurulur.
  if (body.product === "zincir") {
    const metalLabel = { altin: "Altın", gumus: "Gümüş", rose: "Rose" }[body.metal] || body.metal || "";
    const price = computeOrderPrice(body);
    return {
      id: createOrderCartId(),
      body,
      title: body.chain?.label || "Forse zincir",
      imageUrl: "",
      meta: [metalLabel, price.quantity > 1 ? `${price.quantity} adet` : ""].filter(Boolean).join(" · "),
      price,
      priceLabel: formatTryPrice(price.total),
    };
  }
  const productLabel = DESIGN_PRODUCT_OPTIONS[body.product]?.label || body.product;
  const shapeLabel = DESIGN_SHAPE_OPTIONS[body.productShape]?.label || body.productShape;
  const metalLabels = { altin: "Altın", gumus: "Gümüş", rose: "Rose" };
  const metalLabel = metalLabels[body.metal] || body.metal || "Metal seçilmedi";
  const price = computeOrderPrice(body);
  const chainLabel = body.product !== "kolye"
    ? ""
    : body.chain?.enabled && body.chain?.label
      ? ` · ${body.chain.label}`
      : " · Zincirsiz";
  const sizeLabel = body.sizeLabel || body.metadata?.ringSizeLabel || body.metadata?.pendantSizeLabel
    ? ` · ${body.sizeLabel || body.metadata.ringSizeLabel || body.metadata.pendantSizeLabel}`
    : "";
  const measureLabel = body.product === "yuzuk" && body.metadata?.ringMeasureLabel
    ? ` · ${body.metadata.ringMeasureLabel}`
    : "";
  return {
    id: createOrderCartId(),
    body,
    title: body.designSnapshot?.title || "Tasarım",
    imageUrl: body.designSnapshot?.imageUrl || "",
    meta: `${productLabel} · ${shapeLabel} · ${metalLabel}${sizeLabel}${measureLabel}${chainLabel}`,
    price,
    priceLabel: formatTryPrice(price.total),
  };
}

function replaceOrderCartItem(cartItemId, body) {
  const nextItem = orderCartItemFromBody(body);
  nextItem.id = cartItemId;
  orderCartItems = orderCartItems.map((item) => (item.id === cartItemId ? nextItem : item));
  writeOrderCartItems();
  renderOrderCart();
}

function renderOrderCart() {
  const count = document.querySelector("[data-cart-count]");
  const list = document.querySelector("[data-cart-list]");
  const submitButton = document.querySelector("[data-cart-submit]");
  const status = document.querySelector("[data-cart-status]");
  const profileWarning = document.querySelector("[data-cart-profile-warning]");
  const summary = document.querySelector("[data-cart-summary]");
  const total = document.querySelector("[data-cart-total]");
  const profileReady = hasRequiredOrderProfile();
  const cartTotal = orderCartItems.reduce((sum, item) => {
    const price = item.price || computeOrderPrice(item.body || {});
    return sum + (Number(price.total) || 0);
  }, 0);
  if (count) count.textContent = String(orderCartItems.length);
  if (submitButton) submitButton.disabled = orderCartItems.length === 0;
  if (profileWarning) profileWarning.hidden = profileReady || orderCartItems.length === 0;
  if (summary) summary.hidden = orderCartItems.length === 0;
  if (total) total.textContent = formatTryPrice(cartTotal);
  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  if (!list) return;
  list.innerHTML = "";
  if (!orderCartItems.length) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Sepette henüz ürün yok.";
    list.append(empty);
    return;
  }
  orderCartItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "cart-item";

    // Tek başına zincirin tasarım görseli yoktur; yerine ikon konur.
    const isChainOnly = item.body?.product === "zincir";
    const image = isChainOnly
      ? Object.assign(document.createElement("div"), { className: "cart-item-icon", textContent: "⛓" })
      : Object.assign(document.createElement("img"), { alt: item.title || "Sepet ürünü", src: item.imageUrl });

    const body = document.createElement("div");
    body.className = "cart-item-body";

    const title = document.createElement("div");
    title.className = "cart-item-title";
    title.textContent = item.title || "Tasarım";

    const meta = document.createElement("div");
    meta.className = "cart-item-meta";
    meta.textContent = item.meta || "";

    const price = document.createElement("div");
    price.className = "cart-item-price";
    price.textContent = item.priceLabel || formatTryPrice(computeOrderPrice(item.body || {}).total);

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const remove = document.createElement("button");
    remove.className = "cart-item-remove";
    remove.type = "button";
    remove.dataset.cartRemove = item.id;
    remove.textContent = "Kaldır";

    // Zincir tasarım dialog'undan düzenlenemez (tasarımı yok); kaldırıp yeniden eklenir.
    if (isChainOnly) {
      actions.append(remove);
    } else {
      const edit = document.createElement("button");
      edit.className = "cart-item-edit";
      edit.type = "button";
      edit.dataset.cartEdit = item.id;
      edit.textContent = "Düzenle";
      actions.append(edit, remove);
    }
    body.append(title, meta, price, actions);
    card.append(image, body);
    list.append(card);
  });
}

function openOrderCartDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (!drawer) return;
  renderOrderCart();
  if (orderCartCloseTimer) {
    window.clearTimeout(orderCartCloseTimer);
    orderCartCloseTimer = null;
  }
  drawer.classList.remove("is-closing");
  drawer.hidden = false;
  document.body.classList.add("is-production-dialog-open");
}

function closeOrderCartDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  if (drawer && !drawer.hidden) {
    drawer.classList.add("is-closing");
    orderCartCloseTimer = window.setTimeout(() => {
      drawer.hidden = true;
      drawer.classList.remove("is-closing");
      orderCartCloseTimer = null;
      const productionDialog = document.querySelector("[data-production-dialog]");
      if (!productionDialog?.open) document.body.classList.remove("is-production-dialog-open");
    }, 210);
  }
}

function addOrderToCart(body) {
  orderCartItems = [orderCartItemFromBody(body), ...orderCartItems];
  writeOrderCartItems();
  renderOrderCart();
}

function orderSnapshotFromCartItem(item = {}) {
  const body = item.body || {};
  return {
    designRef: body.designRef || "",
    product: normalizeOrderProduct(body.product),
    productShape: normalizeOrderShape(body.productShape, normalizeOrderProduct(body.product)),
    metal: normalizeOrderMetal(body.metal),
    designSnapshot: body.designSnapshot || {},
  };
}

function orderSnapshotFromFinishDesign(design = {}) {
  const imageUrl = safePersistedImageUrl(design.imageUrl || "", "imageUrl");
  if (!imageUrl) return null;
  const product = normalizeOrderProduct(design.productValue || design.product);
  const shape = normalizeOrderShape(design.productShapeValue || design.shapeValue || design.productShape, product);
  const stageLabel = "2. aşama ürün görseli";
  return {
    designRef: String(design.archiveDesignId || design.id || "").trim(),
    product,
    productShape: shape,
    metal: normalizeOrderMetal(design.metalValue || design.metal),
    designSnapshot: {
      imageUrl,
      sketchImageUrl: imageUrl,
      sourceImageUrl: safePersistedImageUrl(design.sourceImageUrl || "", "sourceImageUrl"),
      title: design.title || stageLabel,
      stage: "finish",
      designMode: design.surfaceValue || design.designModeValue || "engrave",
      designModeLabel: design.surfaceLabel || design.designModeLabel || "",
      productLabel: design.productLabel || DESIGN_PRODUCT_OPTIONS[product]?.label || "",
      shapeLabel: design.productShapeLabel || design.shapeLabel || DESIGN_SHAPE_OPTIONS[shape]?.label || "",
      metalLabel: design.metalLabel || "",
      storagePath: design.storagePath || "",
      storageBucket: design.storageBucket || "",
    },
  };
}

function openOrderDialog(snapshot, options = {}) {
  const dialog = document.querySelector("[data-production-dialog]");
  const form = document.querySelector("[data-production-form]");
  if (!dialog || !form || typeof dialog.showModal !== "function") {
    showStudioToast("Tarayıcın bu özelliği desteklemiyor.", "error");
    return;
  }
  if (!snapshot || !snapshot.designSnapshot?.imageUrl) {
    showStudioToast("Önce bir tasarım seç.", "error");
    return;
  }

  const product = normalizeOrderProduct(snapshot.product);
  const shape = normalizeOrderShape(snapshot.productShape, product);

  form.reset();
  applyProfileDefaultsToProductionForm(form);
  form.dataset.snapshot = JSON.stringify(snapshot);
  form.dataset.editCartItemId = options.cartItemId || "";

  const previewImg = form.querySelector("[data-production-preview-img]");
  if (previewImg) previewImg.src = snapshot.designSnapshot.imageUrl;
  const previewTitle = form.querySelector("[data-production-preview-title]");
  if (previewTitle) previewTitle.textContent = snapshot.designSnapshot.title || "Tasarım";
  const previewSub = form.querySelector("[data-production-preview-subtitle]");
  if (previewSub) {
    previewSub.textContent = [
      snapshot.designSnapshot.productLabel || DESIGN_PRODUCT_OPTIONS[product]?.label || "",
      snapshot.designSnapshot.shapeLabel || DESIGN_SHAPE_OPTIONS[shape]?.label || "",
      snapshot.designSnapshot.metalLabel || PRODUCTION_METAL_LABELS[snapshot.metal] || "",
    ].filter(Boolean).join(" · ");
  }

  renderOrderRingSizeOptions(form, product, shape, options.body?.sizeKey || options.body?.metadata?.ringSizeKey || "");
  renderOrderPendantSizeOptions(form, product, shape, options.body?.sizeKey || "");
  renderOrderRingMeasureOptions(form, product, options.body?.metadata?.ringMeasure || "", options.body?.metadata?.ringMeasureSystem || "");
  updateOrderChainVisibility(form, product);

  if (form.elements.customerNote) form.elements.customerNote.value = options.body?.customerNote || "";
  // Sepetten düzenlemede zincir seçimi geri yüklenir (kullanıcının girdiği birimle birlikte).
  const savedChain = options.body?.chain || options.body?.metadata?.chain;
  if (form.elements.chainIncluded) form.elements.chainIncluded.checked = Boolean(savedChain?.enabled);
  if (savedChain?.enabled) {
    if (form.elements.chainType && savedChain.type) form.elements.chainType.value = savedChain.type;
    if (form.elements.chainLengthUnit && savedChain.lengthUnit) form.elements.chainLengthUnit.value = savedChain.lengthUnit;
    if (form.elements.chainLengthValue && savedChain.lengthValue) form.elements.chainLengthValue.value = savedChain.lengthValue;
  }
  updateOrderChainFields(form);

  const submitButton = form.querySelector("[data-production-submit]");
  if (submitButton) submitButton.textContent = options.cartItemId ? "Sepeti güncelle" : "Sepete ekle";

  const errorBox = form.querySelector("[data-production-error]");
  if (errorBox) {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  if (!form.dataset.priceListenerAttached) {
    // Zincir kutusu/birimi değişince alanların görünürlüğü ve min-max sınırları da tazelenir.
    const onChange = () => {
      updateOrderChainFields(form);
      updateProductionPriceDisplay(form);
    };
    form.addEventListener("input", onChange);
    form.addEventListener("change", onChange);
    form.dataset.priceListenerAttached = "1";
  }
  updateProductionPriceDisplay(form);

  document.body.classList.add("is-production-dialog-open");
  dialog.showModal();
}

function closeProductionDialog() {
  const dialog = document.querySelector("[data-production-dialog]");
  const form = document.querySelector("[data-production-form]");
  if (form) form.dataset.editCartItemId = "";
  if (dialog?.open) dialog.close();
  document.body.classList.remove("is-production-dialog-open");
}

async function submitProductionRequestFromForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = form.querySelector("[data-production-error]");
  const submitButton = form.querySelector("[data-production-submit]");
  errorBox.hidden = true;
  errorBox.textContent = "";

  let snapshot;
  try {
    snapshot = JSON.parse(form.dataset.snapshot || "{}");
  } catch {
    snapshot = {};
  }

  const body = orderBodyFromProductionForm(form, snapshot);
  if (!body.designSnapshot?.imageUrl) {
    errorBox.textContent = "Sepete eklemek için geçerli bir tasarım seçmelisin.";
    errorBox.hidden = false;
    return;
  }

  submitButton.disabled = true;
  const editCartItemId = form.dataset.editCartItemId || "";
  submitButton.textContent = editCartItemId ? "Güncelleniyor…" : "Ekleniyor…";
  try {
    if (editCartItemId) {
      replaceOrderCartItem(editCartItemId, body);
    } else {
      addOrderToCart(body);
    }
    closeProductionDialog();
    if (editCartItemId) {
      openOrderCartDrawer();
    } else if (await showSiteConfirm()) {
      openOrderCartDrawer();
    }
  } catch (error) {
    errorBox.textContent = error?.message || "Sepete eklenemedi.";
    errorBox.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = form.dataset.editCartItemId ? "Sepeti güncelle" : "Sepete ekle";
  }
}

async function submitOrderCart() {
  const submitButton = document.querySelector("[data-cart-submit]");
  const status = document.querySelector("[data-cart-status]");
  if (!orderCartItems.length) {
    if (status) {
      status.textContent = "Sepette ürün yok.";
      status.hidden = false;
    }
    return;
  }

  const profile = readRequiredOrderProfile();
  if (profile.error) {
    renderOrderCart();
    if (status) {
      status.textContent = profile.error;
      status.hidden = false;
    }
    return;
  }

  if (status) {
    status.hidden = true;
    status.textContent = "";
  }
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sipariş oluşturuluyor…";
  }

  try {
    const requestBody = {
      items: orderCartItems.map((item) => ({
        ...item.body,
        contactInfo: profile.contactInfo,
      })),
    };
    const { payload, response } = await studioApi.submitProductionRequest(requestBody);
    if (!response.ok) {
      const details = [payload?.error, payload?.detail, payload?.code]
        .map((part) => String(part || "").trim())
        .filter(Boolean);
      throw new Error(details.join("\n") || "Sipariş oluşturulamadı.");
    }
    // Online ödeme yok: sepet ürünleri "Ödeme bekliyor" siparişlere dönüştü, sepet boşalır.
    // Ödeme alınınca sipariş admin panelinden "Ödendi" olarak işaretlenir.
    orderCartItems = [];
    writeOrderCartItems();
    renderOrderCart();
    closeOrderCartDrawer();
    showStudioToast("Siparişin alındı. Ödeme için seninle iletişime geçeceğiz.", "success");
    productionRequestsCache = null;
    loadAndRenderProductionRequests({ force: true });
  } catch (error) {
    if (status) {
      status.textContent = error?.message || "Sipariş oluşturulamadı.";
      status.hidden = false;
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = orderCartItems.length === 0;
      submitButton.textContent = "Siparişi oluştur";
    }
  }
}

function renderProductionRequests(requests) {
  const list = document.querySelector("[data-production-list]");
  const empty = document.querySelector("[data-production-empty]");
  if (!list || !empty) return;

  if (!requests || !requests.length) {
    list.hidden = true;
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  list.hidden = false;
  list.innerHTML = "";
  requests.forEach((request) => {
    const card = document.createElement("article");
    card.className = "production-card";
    const snapshot = request.designSnapshot || {};
    const metalLabel = PRODUCTION_METAL_LABELS[request.metal] || request.metal || "—";
    const shapeLabel = DESIGN_SHAPE_OPTIONS[request.productShape]?.label || request.productShape || "";
    const productLabel = DESIGN_PRODUCT_OPTIONS[request.product]?.label || snapshot.productLabel || "";
    const meta = request.metadata || {};
    const isChainOnly = request.product === "zincir";
    const chainText = isChainOnly
      ? meta.chain?.label || ""
      : request.product !== "kolye"
        ? ""
        : meta.chain?.enabled || meta.chainType
          ? meta.chain?.label || `${meta.chainTypeLabel || CHAIN_TYPE_LABELS[meta.chainType] || meta.chainType} ${meta.chainLength || ""}cm`.trim()
          : "Zincirsiz";
    const sizeText = request.sizeLabel || meta.ringSizeLabel || meta.pendantSizeLabel || "";
    const measureText = request.product === "yuzuk" ? meta.ringMeasureLabel || "" : "";
    const statusLabel = PRODUCTION_STATUS_LABELS[request.status] || request.status;
    const created = request.createdAt ? new Date(request.createdAt).toLocaleString("tr-TR") : "";
    const quantityText = request.quantity > 1 ? `${request.quantity} adet` : "";
    const metaLine = [
      isChainOnly ? "Zincir" : productLabel,
      shapeLabel,
      metalLabel,
      sizeText,
      measureText,
      chainText,
      quantityText,
    ].filter(Boolean).join(" · ");
    // Zincirin tasarım görseli yok; kart görsel yerine ikonla çizilir.
    const mediaHtml = isChainOnly
      ? `<div class="production-card-icon" aria-hidden="true">⛓</div>`
      : `<img alt="" src="${snapshot.imageUrl || ""}" loading="lazy" />`;
    card.innerHTML = `
      ${mediaHtml}
      <div class="production-card-body">
        <strong>${(isChainOnly ? meta.chain?.label || "Forse zincir" : snapshot.title || "Tasarım").replace(/</g, "&lt;")}</strong>
        <span class="production-card-meta">${metaLine.replace(/</g, "&lt;")}</span>
        <span class="production-card-meta">${created}</span>
      </div>
      <span class="production-card-status" data-status="${request.status}">${statusLabel}</span>
    `;
    list.appendChild(card);
  });
}

function orderDesignsFromArchive() {
  const seen = new Set();
  const sources = [
    ...orderFinishDesignsFromProjects(),
    ...(Array.isArray(readSavedDesigns()) ? readSavedDesigns() : []),
  ];

  return sources
    .map(enrichSavedDesignDisplayMetadata)
    .filter((design) => {
      if (!design || isSavedDesignLoading(design)) return false;
      const imageUrl = safePersistedImageUrl(design.imageUrl || "", "imageUrl");
      if (!imageUrl) return false;
      if (!isOrderableFinishDesign(design)) return false;
      if (seen.has(imageUrl)) return false;
      seen.add(imageUrl);
      return true;
    });
}

function orderFinishDesignsFromProjects(projects = readProjects()) {
  return (Array.isArray(projects) ? projects : []).flatMap((project) => {
    const state = project?.state && typeof project.state === "object" ? project.state : {};
    const finishResults = Array.isArray(state.finishResults) ? state.finishResults : [];
    return finishResults.map((result, index) => {
      const imageUrl = safePersistedImageUrl(result?.finishImageUrl || result?.imageUrl || "", "finishImageUrl");
      if (!imageUrl) return null;
      return {
        ...designProfileFieldsFromSource(result),
        ...storageFieldsFromSource(result),
        archiveDesignId: String(result.id || "").trim(),
        generatedAt: result.generatedAt || "",
        id: `order-finish-${project.id || "project"}-${result.id || index}`,
        imageUrl,
        metalLabel: result.metalLabel || "",
        metalValue: result.metalValue || "",
        projectId: project.id || "",
        projectTitle: project.title || "",
        sourceImageUrl: result.sourceFormUrl || result.sketchUrl || "",
        sourceStage: "finish",
        sourceTitle: result.moldTitle || result.title || "",
        stage: "Ürün Görseli",
        surfaceLabel: result.surfaceLabel || result.designModeLabel || "",
        surfaceValue: result.surfaceValue || result.designModeValue || "",
        title: result.title || `${result.metalLabel || "Ürün"} ${result.moldTitle || "Görsel"} ${String(index + 1).padStart(2, "0")}`,
      };
    }).filter(Boolean);
  });
}

// Bir proje silinmeden önce, içinde üretilmiş sipariş edilebilir ürün görsellerini
// Tasarımlarım arşivine taşı; böylece proje silinse de "Sipariş Ver" listesinden düşmezler.
function preserveDeletedProjectOrderDesigns(deletedProjects = []) {
  const list = (Array.isArray(deletedProjects) ? deletedProjects : [deletedProjects]).filter(Boolean);
  if (!list.length) return;

  const harvested = orderFinishDesignsFromProjects(list).filter(isOrderableFinishDesign);
  if (!harvested.length) return;

  const existing = readSavedDesigns();
  const seen = new Set(
    existing.map((design) => safePersistedImageUrl(design?.imageUrl || "", "imageUrl")).filter(Boolean)
  );

  const additions = harvested.filter((design) => {
    const imageUrl = safePersistedImageUrl(design?.imageUrl || "", "imageUrl");
    if (!imageUrl || seen.has(imageUrl)) return false;
    seen.add(imageUrl);
    return true;
  });
  if (!additions.length) return;

  writeSavedDesigns([...additions, ...existing].slice(0, SAVED_DESIGN_LIMIT));
}

function isOrderableFinishDesign(design = {}) {
  const sourceStage = String(design.sourceStage || "").trim().toLowerCase();
  const stageLabel = String(design.stage || "");
  return (
    sourceStage === "finish" ||
    /ürün görseli|urun gorseli|görsel üretimi|gorsel uretimi/i.test(stageLabel)
  );
}

function normalizeOrderMetal(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(PRODUCTION_METAL_LABELS, normalized) ? normalized : "";
}

function renderOrderDesignGallery() {
  const grid = document.querySelector("[data-order-design-grid]");
  const empty = document.querySelector("[data-order-design-empty]");
  if (!grid) return;

  const designs = orderDesignsFromArchive();
  if (empty) empty.hidden = designs.length > 0;
  grid.hidden = designs.length === 0;

  grid.replaceChildren(
    ...designs.map((design) => {
      const snapshot = orderSnapshotFromFinishDesign(design);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "order-design-card";
      const img = document.createElement("img");
      img.alt = design.title || snapshot?.designSnapshot?.title || "Sipariş tasarımı";
      img.loading = "lazy";
      setManagedImageSrc(img, snapshot?.designSnapshot?.imageUrl || "");
      const stage = document.createElement("span");
      stage.className = "order-design-card-stage";
      stage.textContent = "2. aşama";
      const title = document.createElement("span");
      title.className = "order-design-card-title";
      title.textContent = design.title || snapshot?.designSnapshot?.title || "Sipariş tasarımı";
      const sub = document.createElement("span");
      sub.className = "order-design-card-sub";
      sub.textContent = "Ürün görselinden sipariş ver";
      card.append(img, stage, title, sub);
      card.addEventListener("click", () => {
        if (snapshot) openOrderDialog(snapshot);
      });
      return card;
    })
  );
}

// Ödemesi onaylanan (confirmed ve sonrası) üretim talepleri sepetten otomatik düşer.
// Ödeme bekleyen (pending) ya da iptal olanlar sepette KALIR — kullanıcı geri dönüp
// tekrar ödeyebilsin veya elle silsin.
const PAID_PRODUCTION_STATES = new Set(["confirmed", "in_production", "shipped", "completed"]);
function reconcileCartWithPaidRequests(requests) {
  if (!Array.isArray(requests) || !orderCartItems.length) return;
  const paidIds = new Set(
    requests
      .filter((request) => PAID_PRODUCTION_STATES.has(request?.status))
      .map((request) => request.id)
  );
  if (!paidIds.size) return;
  const remaining = orderCartItems.filter(
    (item) => !(item.productionRequestId && paidIds.has(item.productionRequestId))
  );
  if (remaining.length !== orderCartItems.length) {
    orderCartItems = remaining;
    writeOrderCartItems();
    renderOrderCart();
  }
}

async function loadAndRenderProductionRequests(options = {}) {
  if (productionRequestsCache && !options.force) {
    reconcileCartWithPaidRequests(productionRequestsCache);
    renderProductionRequests(productionRequestsCache);
    return;
  }
  try {
    const { payload, response } = await studioApi.listProductionRequests();
    if (!response.ok) {
      renderProductionRequests([]);
      return;
    }
    productionRequestsCache = Array.isArray(payload?.requests) ? payload.requests : [];
    reconcileCartWithPaidRequests(productionRequestsCache);
    renderProductionRequests(productionRequestsCache);
  } catch (error) {
    console.warn("[production-requests] list failed", error);
    renderProductionRequests([]);
  }
}

function initProductionRequestUi() {
  bindOrderSectionControls();
  const button = document.querySelector("[data-production-request]");
  const dialog = document.querySelector("[data-production-dialog]");
  const form = document.querySelector("[data-production-form]");
  const cancelButton = document.querySelector("[data-production-cancel]");
  const cartOpenButton = document.querySelector("[data-cart-open]");
  const cartDrawer = document.querySelector("[data-cart-drawer]");
  const cartSubmitButton = document.querySelector("[data-cart-submit]");
  const cartProfileLink = document.querySelector("[data-cart-profile-link]");

  if (button) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (button.disabled) return;
      openOrderDialog(readSelectedMockupSnapshot());
    });
  }
  if (cancelButton) {
    cancelButton.addEventListener("click", (event) => {
      event.preventDefault();
      closeProductionDialog();
    });
  }
  if (form) {
    form.addEventListener("submit", submitProductionRequestFromForm);
  }
  if (dialog) {
    dialog.addEventListener("close", () => {
      document.body.classList.remove("is-production-dialog-open");
      const errorBox = dialog.querySelector("[data-production-error]");
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = "";
      }
    });
  }
  if (cartOpenButton) {
    cartOpenButton.addEventListener("click", openOrderCartDrawer);
  }
  document.querySelectorAll("[data-cart-close]").forEach((closeButton) => {
    closeButton.addEventListener("click", closeOrderCartDrawer);
  });
  if (cartDrawer) {
    cartDrawer.addEventListener("click", (event) => {
      const editButton = event.target?.closest?.("[data-cart-edit]");
      if (editButton) {
        const item = orderCartItems.find((cartItem) => cartItem.id === editButton.dataset.cartEdit);
        if (!item) return;
        closeOrderCartDrawer();
        openOrderDialog(orderSnapshotFromCartItem(item), { body: item.body, cartItemId: item.id });
        return;
      }
      const removeButton = event.target?.closest?.("[data-cart-remove]");
      if (!removeButton) return;
      orderCartItems = orderCartItems.filter((item) => item.id !== removeButton.dataset.cartRemove);
      writeOrderCartItems();
      renderOrderCart();
    });
  }
  if (cartSubmitButton) {
    cartSubmitButton.addEventListener("click", submitOrderCart);
  }
  if (cartProfileLink) {
    cartProfileLink.addEventListener("click", () => {
      closeOrderCartDrawer();
      tabController.switchTo("profil");
    });
  }
  renderOrderCart();

  document.querySelectorAll('[data-tab-trigger="uretim"], .studio-tab[data-tab="uretim"]').forEach((el) => {
    el.addEventListener("click", () => {
      switchOrderSection("create");
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductionRequestUi);
} else {
  initProductionRequestUi();
}

// ─── Destek (ticket) ─────────────────────────────────────────────────────────

const TICKET_STATUS_LABELS = {
  open: "Açık",
  answered: "Yanıtlandı",
  closed: "Kapatıldı",
};

let ticketsCache = [];
let ticketsLoaded = false;
let ticketsLastSignature = "";
let ticketPollTimer = null;
const TICKET_POLL_INTERVAL = 8000;

// Talep listesinin "değişti mi" imzası: yeni mesaj/durum değişimini ucuzca yakalar.
function computeTicketsSignature(tickets) {
  if (!Array.isArray(tickets)) return "";
  return tickets
    .map((ticket) => {
      const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
      const last = messages[messages.length - 1];
      const lastKey = last ? last.createdAt || last.id || last.body || "" : "";
      return `${ticket.id}:${ticket.status || ""}:${messages.length}:${lastKey}`;
    })
    .join("|");
}

function startTicketPolling() {
  stopTicketPolling();
  ticketPollTimer = window.setInterval(() => {
    if (document.hidden) return;
    loadAndRenderTickets({ force: true, silent: true });
  }, TICKET_POLL_INTERVAL);
}

function stopTicketPolling() {
  if (ticketPollTimer) {
    window.clearInterval(ticketPollTimer);
    ticketPollTimer = null;
  }
}

function formatTicketDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("tr-TR");
  } catch (error) {
    return "";
  }
}

function ticketMessageHtml(message) {
  const sender = message.sender === "admin" ? "admin" : "user";
  const label = sender === "admin" ? "Destek" : "Sen";
  return `
    <div class="ticket-message" data-sender="${sender}">
      ${escapeHtml(message.body || "")}
      <small>${escapeHtml(label)} · ${escapeHtml(formatTicketDate(message.createdAt))}</small>
    </div>
  `;
}

function ticketCardHtml(ticket) {
  const status = ticket.status || "open";
  const statusLabel = TICKET_STATUS_LABELS[status] || status;
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
  const thread = messages.map(ticketMessageHtml).join("");
  const reply = status === "closed"
    ? `<p class="ticket-closed-note">Bu talep kapatıldı.</p>`
    : `
      <form class="ticket-reply" data-ticket-reply-form data-ticket-id="${escapeHtml(ticket.id)}">
        <textarea name="message" rows="2" maxlength="4000" placeholder="Yanıt yaz…" required></textarea>
        <div class="cta-row">
          <button class="button button-primary" type="submit">Gönder</button>
        </div>
      </form>
    `;
  return `
    <div class="ticket-card" data-ticket-id="${escapeHtml(ticket.id)}">
      <button class="ticket-card-head" type="button" data-ticket-toggle aria-expanded="false">
        <span class="ticket-card-title">
          <strong>${escapeHtml(ticket.subject || "Destek talebi")}</strong>
          <small>${escapeHtml(formatTicketDate(ticket.updatedAt))} · ${messages.length} mesaj</small>
        </span>
        <span class="ticket-status" data-status="${escapeHtml(status)}">${escapeHtml(statusLabel)}</span>
      </button>
      <div class="ticket-card-body" hidden>
        <div class="ticket-thread">${thread}</div>
        ${reply}
      </div>
    </div>
  `;
}

function renderTickets(tickets) {
  const list = document.querySelector("[data-ticket-list]");
  const empty = document.querySelector("[data-ticket-empty]");
  if (!list || !empty) return;

  // Yeniden render sırasında açık kartları, yazılan taslakları ve odağı koru.
  const openIds = new Set();
  const drafts = new Map();
  list.querySelectorAll(".ticket-card").forEach((card) => {
    const id = card.dataset.ticketId;
    if (!id) return;
    const body = card.querySelector(".ticket-card-body");
    if (body && !body.hidden) openIds.add(id);
    const draft = card.querySelector('[data-ticket-reply-form] textarea[name="message"]');
    if (draft && draft.value) drafts.set(id, draft.value);
  });
  const focusedTicketId =
    document.activeElement?.closest?.(".ticket-card")?.dataset.ticketId || null;

  if (!tickets || !tickets.length) {
    list.innerHTML = "";
    list.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  list.hidden = false;
  list.innerHTML = tickets.map(ticketCardHtml).join("");

  // Önceki açık/taslak durumunu geri yükle.
  openIds.forEach((id) => {
    const card = list.querySelector(`.ticket-card[data-ticket-id="${CSS.escape(id)}"]`);
    if (!card) return;
    card.querySelector("[data-ticket-toggle]")?.setAttribute("aria-expanded", "true");
    const body = card.querySelector(".ticket-card-body");
    if (body) body.hidden = false;
  });
  drafts.forEach((value, id) => {
    const textarea = list.querySelector(
      `.ticket-card[data-ticket-id="${CSS.escape(id)}"] textarea[name="message"]`
    );
    if (textarea) textarea.value = value;
  });
  // Açık kartların mesaj akışını en alta kaydır (chat hissi).
  list.querySelectorAll(".ticket-card-body:not([hidden]) .ticket-thread").forEach((thread) => {
    thread.scrollTop = thread.scrollHeight;
  });
  // Kullanıcı yanıt yazıyorsa odağı geri ver (imleci sona al).
  if (focusedTicketId) {
    const textarea = list.querySelector(
      `.ticket-card[data-ticket-id="${CSS.escape(focusedTicketId)}"] textarea[name="message"]`
    );
    if (textarea) {
      const end = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(end, end);
    }
  }
}

async function loadAndRenderTickets({ force = false, silent = false } = {}) {
  if (ticketsLoaded && !force) {
    renderTickets(ticketsCache);
    return;
  }
  try {
    const { payload, response } = await studioApi.listTickets();
    if (!response.ok) {
      // Polling sırasında sessiz geçici hatalarda ekranı bozma.
      if (silent) return;
      if (response.status !== 401) {
        showStudioToast(payload?.error || "Destek talepleri okunamadı.", "error");
      }
      renderTickets([]);
      return;
    }
    const tickets = Array.isArray(payload?.tickets) ? payload.tickets : [];
    const signature = computeTicketsSignature(tickets);
    ticketsCache = tickets;
    ticketsLoaded = true;
    // Polling'de veri değişmediyse DOM'a hiç dokunma (yazıyı/odak/scroll'u koru).
    if (silent && signature === ticketsLastSignature) return;
    ticketsLastSignature = signature;
    renderTickets(ticketsCache);
  } catch (error) {
    console.warn("[tickets] fetch failed", error);
    if (!silent) renderTickets([]);
  }
}

function toggleTicketForm(show) {
  const form = document.querySelector("[data-ticket-form]");
  const newButton = document.querySelector("[data-ticket-new]");
  if (!form) return;
  form.hidden = !show;
  if (newButton) newButton.hidden = show;
  if (show) {
    const errorBox = form.querySelector("[data-ticket-form-error]");
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }
    form.querySelector('input[name="subject"]')?.focus();
  }
}

async function submitNewTicket(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = form.querySelector("[data-ticket-form-error]");
  const submitButton = form.querySelector("[data-ticket-submit]");
  const formData = new FormData(form);
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (errorBox) {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }
  if (!subject || !message) {
    if (errorBox) {
      errorBox.textContent = "Konu ve mesaj gerekli.";
      errorBox.hidden = false;
    }
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Gönderiliyor…";
  try {
    const { payload, response } = await studioApi.submitTicket({ subject, message });
    if (!response.ok) {
      if (errorBox) {
        errorBox.textContent = payload?.error || "Gönderilemedi.";
        errorBox.hidden = false;
      }
      return;
    }
    form.reset();
    toggleTicketForm(false);
    await loadAndRenderTickets({ force: true });
  } catch (error) {
    if (errorBox) {
      errorBox.textContent = error?.message || "Beklenmeyen bir hata oluştu.";
      errorBox.hidden = false;
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Gönder";
  }
}

async function submitTicketReply(form) {
  const ticketId = form.dataset.ticketId;
  const textarea = form.querySelector('textarea[name="message"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const message = String(textarea?.value || "").trim();
  if (!ticketId || !message) return;

  submitButton.disabled = true;
  submitButton.textContent = "Gönderiliyor…";
  try {
    const { payload, response } = await studioApi.submitTicket({ ticketId, message });
    if (!response.ok) {
      showStudioToast(payload?.error || "Mesaj gönderilemedi.", "error");
      return;
    }
    // Gönderilen metnin taslak olarak geri dolmaması için textarea'yı temizle.
    if (textarea) textarea.value = "";
    await loadAndRenderTickets({ force: true });
    // Yeniden render sonrası ilgili kartı açık tut.
    const card = document.querySelector(`.ticket-card[data-ticket-id="${CSS.escape(ticketId)}"]`);
    if (card) {
      card.querySelector("[data-ticket-toggle]")?.setAttribute("aria-expanded", "true");
      const body = card.querySelector(".ticket-card-body");
      if (body) body.hidden = false;
    }
  } catch (error) {
    showStudioToast(error?.message || "Beklenmeyen bir hata oluştu.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Gönder";
  }
}

function initTicketUi() {
  document.querySelector("[data-ticket-new]")?.addEventListener("click", () => toggleTicketForm(true));
  document.querySelector("[data-ticket-cancel]")?.addEventListener("click", () => {
    document.querySelector("[data-ticket-form]")?.reset();
    toggleTicketForm(false);
  });
  document.querySelector("[data-ticket-form]")?.addEventListener("submit", submitNewTicket);

  // Sekme yeniden görünür olunca (örn. başka tab'dan dönünce) anında tazele.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && ticketPollTimer) {
      loadAndRenderTickets({ force: true, silent: true });
    }
  });

  const list = document.querySelector("[data-ticket-list]");
  if (list) {
    list.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-ticket-toggle]");
      if (!toggle) return;
      const body = toggle.parentElement?.querySelector(".ticket-card-body");
      if (!body) return;
      const open = body.hidden;
      body.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    list.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-ticket-reply-form]");
      if (!form) return;
      event.preventDefault();
      submitTicketReply(form);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTicketUi);
} else {
  initTicketUi();
}

// ─── Admin: üretim talepleri yönetimi ───────────────────────────────────────
let adminRequestsCache = null;

function renderAdminRequestsTable(requests) {
  const tbody = document.querySelector("[data-admin-request-tbody]");
  const empty = document.querySelector("[data-admin-request-empty]");
  const wrap = document.querySelector("[data-admin-request-table-wrap]");
  if (!tbody || !empty || !wrap) return;

  if (!requests || !requests.length) {
    tbody.innerHTML = "";
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  wrap.hidden = false;
  tbody.innerHTML = "";
  requests.forEach((request) => {
    const snapshot = request.designSnapshot || {};
    const contact = request.contactInfo || {};
    const meta = request.metadata || {};
    const metalLabel = PRODUCTION_METAL_LABELS[request.metal] || request.metal || "—";
    const statusLabel = PRODUCTION_STATUS_LABELS[request.status] || request.status;
    const created = request.createdAt ? new Date(request.createdAt).toLocaleString("tr-TR") : "";
    const sizeDetails = [request.sizeLabel || request.sizeKey || "—", meta.ringMeasureLabel || ""].filter(Boolean).join(" · ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img alt="" src="${escapeHtml(snapshot.imageUrl || "")}" loading="lazy" /></td>
      <td>
        <strong>${escapeHtml(snapshot.title || "Tasarım")}</strong>
        <div class="request-meta">${escapeHtml(snapshot.productLabel || request.product)} · ${escapeHtml(snapshot.shapeLabel || request.productShape)}</div>
        <div class="request-meta">${escapeHtml(created)}</div>
      </td>
      <td class="request-contact">
        <div><code>${escapeHtml(request.userId.slice(0, 8))}…</code></div>
        ${contact.email ? `<div>${escapeHtml(contact.email)}</div>` : ""}
        ${contact.phone ? `<div>${escapeHtml(contact.phone)}</div>` : ""}
      </td>
      <td class="request-meta">
        ${escapeHtml(metalLabel)}<br/>
        ${escapeHtml(sizeDetails)}<br/>
        ${request.quantity} adet
        ${request.customerNote ? `<div style="margin-top:4px;font-style:italic;">"${escapeHtml(request.customerNote.slice(0, 120))}${request.customerNote.length > 120 ? "…" : ""}"</div>` : ""}
      </td>
      <td><span class="production-card-status" data-status="${escapeHtml(request.status)}">${escapeHtml(statusLabel)}</span></td>
      <td>
        ${request.status === "pending" ? `<button class="button button-primary" type="button" data-admin-mark-paid="${escapeHtml(request.id)}">Ödendi işaretle</button>` : ""}
        <button class="button button-secondary" type="button" data-admin-edit-request="${escapeHtml(request.id)}">Güncelle</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadAndRenderAdminRequests() {
  const statusFilter = document.querySelector("[data-admin-request-status-filter]")?.value || "";
  const userFilter = document.querySelector("[data-admin-request-user-filter]")?.value || "";
  try {
    const { payload, response } = await studioApi.adminListProductionRequests({
      status: statusFilter,
      userId: userFilter.trim(),
    });
    if (!response.ok) {
      showStudioToast(payload?.error || "Üretim talepleri okunamadı.", "error");
      renderAdminRequestsTable([]);
      return;
    }
    adminRequestsCache = Array.isArray(payload?.requests) ? payload.requests : [];
    renderAdminRequestsTable(adminRequestsCache);
  } catch (error) {
    console.warn("[admin] requests fetch failed", error);
    renderAdminRequestsTable([]);
  }
}

function openAdminProductionDialog(request) {
  const dialog = document.querySelector("[data-admin-production-dialog]");
  const form = document.querySelector("[data-admin-production-form]");
  if (!dialog || !form || typeof dialog.showModal !== "function") return;

  form.dataset.requestId = request.id;
  document.querySelector("[data-admin-production-summary]").textContent =
    `${request.designSnapshot?.title || "Tasarım"} · ${PRODUCTION_METAL_LABELS[request.metal] || request.metal} · ${request.quantity} adet`;
  form.querySelector("[data-admin-production-status]").value = request.status || "pending";
  form.querySelector('textarea[name="internalNote"]').value = request.internalNote || "";
  const errorBox = form.querySelector("[data-admin-production-error]");
  errorBox.hidden = true;
  errorBox.textContent = "";
  dialog.showModal();
}

async function submitAdminProductionUpdate(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const dialog = document.querySelector("[data-admin-production-dialog]");
  const errorBox = form.querySelector("[data-admin-production-error]");
  const submitButton = form.querySelector("[data-admin-production-submit]");
  errorBox.hidden = true;
  errorBox.textContent = "";

  const id = form.dataset.requestId;
  if (!id) return;

  const formData = new FormData(form);
  submitButton.disabled = true;
  submitButton.textContent = "Kaydediliyor…";
  try {
    const { payload, response } = await studioApi.adminUpdateProductionRequest({
      id,
      status: formData.get("status") || "",
      internalNote: formData.get("internalNote") || "",
    });
    if (!response.ok) {
      errorBox.textContent = payload?.error || "Güncellenemedi.";
      errorBox.hidden = false;
      return;
    }
    dialog?.close();
    await loadAndRenderAdminRequests();
  } catch (error) {
    errorBox.textContent = error?.message || "Beklenmeyen bir hata oluştu.";
    errorBox.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Kaydet";
  }
}

// Online ödeme sağlayıcısı bağlı olmadığı için ödeme elle onaylanır: pending bir
// siparişi tek tıkla "ödendi" (confirmed) yapar.
async function markOrderPaid(id, button) {
  const safeId = String(id || "").trim();
  if (!safeId) return;
  if (button) {
    button.disabled = true;
    button.textContent = "İşaretleniyor…";
  }
  try {
    const { payload, response } = await studioApi.adminUpdateProductionRequest({
      id: safeId,
      status: "confirmed",
    });
    if (!response.ok) {
      showStudioToast(payload?.error || "Sipariş güncellenemedi.", "error");
      if (button) {
        button.disabled = false;
        button.textContent = "Ödendi işaretle";
      }
      return;
    }
    await loadAndRenderAdminRequests();
  } catch (error) {
    showStudioToast(error?.message || "Beklenmeyen bir hata oluştu.", "error");
    if (button) {
      button.disabled = false;
      button.textContent = "Ödendi işaretle";
    }
  }
}

function initAdminPanelUi() {
  const tabButton = document.querySelector('.studio-tab[data-tab="yonetim"]');
  if (tabButton) {
    tabButton.addEventListener("click", () => {
      loadAndRenderAdminRequests();
      // Ticket'lar switchTab içinde yüklenir + canlı polling başlatılır.
    });
  }

  document.querySelector("[data-admin-refresh-requests]")?.addEventListener("click", () => {
    loadAndRenderAdminRequests();
  });
  document.querySelector("[data-admin-request-status-filter]")?.addEventListener("change", () => {
    loadAndRenderAdminRequests();
  });
  document.querySelector("[data-admin-request-user-filter]")?.addEventListener("change", () => {
    loadAndRenderAdminRequests();
  });

  document.querySelector("[data-admin-request-tbody]")?.addEventListener("click", (event) => {
    const paidButton = event.target.closest("[data-admin-mark-paid]");
    if (paidButton) {
      markOrderPaid(paidButton.dataset.adminMarkPaid, paidButton);
      return;
    }
    const button = event.target.closest("[data-admin-edit-request]");
    if (!button) return;
    const id = button.dataset.adminEditRequest;
    const request = (adminRequestsCache || []).find((row) => row.id === id);
    if (request) openAdminProductionDialog(request);
  });

  document.querySelector("[data-admin-production-form]")?.addEventListener("submit", submitAdminProductionUpdate);
  document.querySelector("[data-admin-production-cancel]")?.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("[data-admin-production-dialog]")?.close();
  });

  initAdminTicketUi();
}

// ─── Admin: destek (ticket) yönetimi ─────────────────────────────────────────

let adminTicketsCache = [];
let adminTicketsLastSignature = "";
let adminTicketPollTimer = null;

function startAdminTicketPolling() {
  stopAdminTicketPolling();
  adminTicketPollTimer = window.setInterval(() => {
    if (document.hidden) return;
    loadAndRenderAdminTickets({ silent: true });
  }, TICKET_POLL_INTERVAL);
}

function stopAdminTicketPolling() {
  if (adminTicketPollTimer) {
    window.clearInterval(adminTicketPollTimer);
    adminTicketPollTimer = null;
  }
}

function adminTicketCardHtml(ticket) {
  const status = ticket.status || "open";
  const statusLabel = TICKET_STATUS_LABELS[status] || status;
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
  const thread = messages.map(ticketMessageHtml).join("");
  const statusOptions = ["open", "answered", "closed"]
    .map((value) => `<option value="${value}"${value === status ? " selected" : ""}>${escapeHtml(TICKET_STATUS_LABELS[value])}</option>`)
    .join("");
  // Sahip kimliği: varsa isim + e-posta; yoksa kısaltılmış id'ye düş.
  const userName = String(ticket.userName || "").trim();
  const userEmail = String(ticket.userEmail || "").trim();
  let userLabel;
  if (userEmail) {
    userLabel = `${userName ? `${escapeHtml(userName)} · ` : ""}<code>${escapeHtml(userEmail)}</code>`;
  } else if (userName) {
    userLabel = escapeHtml(userName);
  } else {
    userLabel = `<code>${escapeHtml(String(ticket.userId || "").slice(0, 8))}…</code>`;
  }
  return `
    <div class="ticket-card" data-admin-ticket-id="${escapeHtml(ticket.id)}">
      <button class="ticket-card-head" type="button" data-ticket-toggle aria-expanded="false">
        <span class="ticket-card-title">
          <strong>${escapeHtml(ticket.subject || "Destek talebi")}</strong>
          <small>${userLabel} · ${escapeHtml(formatTicketDate(ticket.updatedAt))} · ${messages.length} mesaj</small>
        </span>
        <span class="ticket-status" data-status="${escapeHtml(status)}">${escapeHtml(statusLabel)}</span>
      </button>
      <div class="ticket-card-body" hidden>
        <div class="cta-row" style="margin-bottom:10px;">
          <button type="button" class="button" data-admin-view-designs data-user-id="${escapeHtml(ticket.userId || "")}">🖼️ Kullanıcının görsellerini gör</button>
        </div>
        <div class="ticket-thread">${thread}</div>
        <form class="ticket-reply" data-admin-ticket-form data-ticket-id="${escapeHtml(ticket.id)}">
          <textarea name="message" rows="2" maxlength="4000" placeholder="Yanıt yaz… (boş bırakıp sadece durumu da güncelleyebilirsin)"></textarea>
          <div class="cta-row" style="align-items:center;gap:10px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;">
              Durum
              <select name="status" data-admin-ticket-status>${statusOptions}</select>
            </label>
            <button class="button button-primary" type="submit">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAdminTickets(tickets) {
  const list = document.querySelector("[data-admin-ticket-list]");
  const empty = document.querySelector("[data-admin-ticket-empty]");
  if (!list || !empty) return;

  // Yeniden render sırasında açık kartları, taslak metni, durum seçimini ve odağı koru.
  const openIds = new Set();
  const drafts = new Map();
  const statuses = new Map();
  list.querySelectorAll(".ticket-card").forEach((card) => {
    const id = card.dataset.adminTicketId;
    if (!id) return;
    const body = card.querySelector(".ticket-card-body");
    if (body && !body.hidden) openIds.add(id);
    const draft = card.querySelector('[data-admin-ticket-form] textarea[name="message"]');
    if (draft && draft.value) drafts.set(id, draft.value);
    const statusSel = card.querySelector("[data-admin-ticket-status]");
    if (statusSel) statuses.set(id, statusSel.value);
  });
  const focusedId =
    document.activeElement?.closest?.(".ticket-card")?.dataset.adminTicketId || null;

  if (!tickets || !tickets.length) {
    list.innerHTML = "";
    list.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  list.hidden = false;
  list.innerHTML = tickets.map(adminTicketCardHtml).join("");

  openIds.forEach((id) => {
    const card = list.querySelector(`.ticket-card[data-admin-ticket-id="${CSS.escape(id)}"]`);
    if (!card) return;
    card.querySelector("[data-ticket-toggle]")?.setAttribute("aria-expanded", "true");
    const body = card.querySelector(".ticket-card-body");
    if (body) body.hidden = false;
  });
  drafts.forEach((value, id) => {
    const textarea = list.querySelector(
      `.ticket-card[data-admin-ticket-id="${CSS.escape(id)}"] textarea[name="message"]`
    );
    if (textarea) textarea.value = value;
  });
  statuses.forEach((value, id) => {
    const statusSel = list.querySelector(
      `.ticket-card[data-admin-ticket-id="${CSS.escape(id)}"] [data-admin-ticket-status]`
    );
    if (statusSel) statusSel.value = value;
  });
  list.querySelectorAll(".ticket-card-body:not([hidden]) .ticket-thread").forEach((thread) => {
    thread.scrollTop = thread.scrollHeight;
  });
  if (focusedId) {
    const textarea = list.querySelector(
      `.ticket-card[data-admin-ticket-id="${CSS.escape(focusedId)}"] textarea[name="message"]`
    );
    if (textarea) {
      const end = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(end, end);
    }
  }
}

async function loadAndRenderAdminTickets({ silent = false } = {}) {
  const statusFilter = document.querySelector("[data-admin-ticket-status-filter]")?.value || "";
  const userFilter = document.querySelector("[data-admin-ticket-user-filter]")?.value || "";
  try {
    const { payload, response } = await studioApi.adminListTickets({
      status: statusFilter,
      userId: userFilter.trim(),
    });
    if (!response.ok) {
      if (silent) return;
      showStudioToast(payload?.error || "Destek talepleri okunamadı.", "error");
      renderAdminTickets([]);
      return;
    }
    const tickets = Array.isArray(payload?.tickets) ? payload.tickets : [];
    // İmzaya filtreleri de kat ki filtre değişince mutlaka yeniden çizilsin.
    const signature = `${statusFilter}|${userFilter.trim()}#${computeTicketsSignature(tickets)}`;
    adminTicketsCache = tickets;
    if (silent && signature === adminTicketsLastSignature) return;
    adminTicketsLastSignature = signature;
    renderAdminTickets(adminTicketsCache);
  } catch (error) {
    console.warn("[admin] tickets fetch failed", error);
    if (!silent) renderAdminTickets([]);
  }
}

async function submitAdminTicketReply(form) {
  const id = form.dataset.ticketId;
  const message = String(form.querySelector('textarea[name="message"]')?.value || "").trim();
  const status = form.querySelector("[data-admin-ticket-status]")?.value || "";
  const submitButton = form.querySelector('button[type="submit"]');
  if (!id) return;
  if (!message && !status) {
    showStudioToast("Cevap veya durum gerekli.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Kaydediliyor…";
  try {
    const { payload, response } = await studioApi.adminReplyTicket({ id, message, status });
    if (!response.ok) {
      showStudioToast(payload?.error || "Güncellenemedi.", "error");
      return;
    }
    // Gönderilen metnin taslak olarak geri dolmaması için textarea'yı temizle.
    const sentTextarea = form.querySelector('textarea[name="message"]');
    if (sentTextarea) sentTextarea.value = "";
    await loadAndRenderAdminTickets();
    const card = document.querySelector(`.ticket-card[data-admin-ticket-id="${CSS.escape(id)}"]`);
    if (card) {
      card.querySelector("[data-ticket-toggle]")?.setAttribute("aria-expanded", "true");
      const body = card.querySelector(".ticket-card-body");
      if (body) body.hidden = false;
    }
  } catch (error) {
    showStudioToast(error?.message || "Beklenmeyen bir hata oluştu.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Kaydet";
  }
}

// ─── Admin: kullanıcının ürettiği görseller (iade/şikayet doğrulaması) ────────
const TICKET_STAGE_LABELS = {
  sketch: "Eskiz",
  finish: "Finish",
  mockup: "Mockup",
  manken: "Manken",
};

function ensureAdminDesignsDialog() {
  let dialog = document.querySelector("[data-admin-designs-dialog]");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.setAttribute("data-admin-designs-dialog", "");
  dialog.style.cssText =
    "border:none;border-radius:16px;max-width:960px;width:92vw;max-height:88vh;padding:0;background:#15151c;color:#f4f4f7;";
  dialog.innerHTML = `
    <div style="display:flex;flex-direction:column;max-height:88vh;">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);">
        <strong style="font-size:1rem;">Kullanıcının ürettiği görseller</strong>
        <button type="button" class="button" data-admin-designs-close style="padding:4px 14px;">Kapat</button>
      </header>
      <p data-admin-designs-meta style="margin:0;padding:12px 20px 4px;font-size:0.85rem;opacity:0.75;"></p>
      <div data-admin-designs-body style="overflow:auto;padding:10px 20px 22px;"></div>
    </div>
  `;
  document.body.appendChild(dialog);
  dialog.addEventListener("click", (event) => {
    // Backdrop (dialog elemanının kendisi) tıklanınca kapat.
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelector("[data-admin-designs-close]")?.addEventListener("click", () => dialog.close());
  return dialog;
}

function adminDesignGroupHtml(design) {
  const images = Array.isArray(design.images) ? design.images : [];
  const stage = TICKET_STAGE_LABELS[design.stage] || design.stage || "";
  const head = [stage, design.product, design.productShape]
    .filter(Boolean)
    .map((part) => escapeHtml(String(part)))
    .join(" · ");
  const when = escapeHtml(formatTicketDate(design.createdAt));
  const cells = images
    .map((image) => {
      const url = escapeHtml(String(image.url || ""));
      if (!url) return "";
      return `<a href="${url}" target="_blank" rel="noopener" style="display:block;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:#0c0c11;">
        <img src="${url}" loading="lazy" alt="" style="width:100%;height:160px;object-fit:cover;display:block;" />
      </a>`;
    })
    .join("");
  return `
    <section style="margin-bottom:20px;">
      <div style="font-size:0.8rem;opacity:0.7;margin-bottom:8px;">${head}${head && when ? " · " : ""}${when}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;">${cells}</div>
    </section>
  `;
}

async function openAdminUserDesigns(userId) {
  const id = String(userId || "").trim();
  if (!id) {
    showStudioToast("Kullanıcı kimliği bulunamadı.", "error");
    return;
  }
  const dialog = ensureAdminDesignsDialog();
  const meta = dialog.querySelector("[data-admin-designs-meta]");
  const body = dialog.querySelector("[data-admin-designs-body]");
  if (meta) meta.textContent = "Yükleniyor…";
  if (body) body.innerHTML = "";
  if (!dialog.open) dialog.showModal();

  try {
    const { payload, response } = await studioApi.adminListUserDesigns({ userId: id, sinceDays: 30 });
    if (!response.ok) {
      if (meta) meta.textContent = payload?.error || "Görseller okunamadı.";
      return;
    }
    const designs = Array.isArray(payload?.designs) ? payload.designs : [];
    const days = payload?.sinceDays || 30;
    const totalImages = designs.reduce(
      (sum, design) => sum + (Array.isArray(design.images) ? design.images.length : 0),
      0
    );
    if (meta) {
      meta.textContent = totalImages
        ? `Son ${days} gün · ${totalImages} görsel · ${designs.length} üretim`
        : `Son ${days} günde kayıtlı görsel yok. (30 günden eski üretimler arşivden silinir.)`;
    }
    if (body) body.innerHTML = designs.map(adminDesignGroupHtml).join("");
  } catch (error) {
    if (meta) meta.textContent = error?.message || "Beklenmeyen bir hata oluştu.";
  }
}

function initAdminTicketUi() {
  document.querySelector("[data-admin-refresh-tickets]")?.addEventListener("click", () => {
    loadAndRenderAdminTickets();
  });
  document.querySelector("[data-admin-ticket-status-filter]")?.addEventListener("change", () => {
    loadAndRenderAdminTickets();
  });
  document.querySelector("[data-admin-ticket-user-filter]")?.addEventListener("change", () => {
    loadAndRenderAdminTickets();
  });

  // Sekme yeniden görünür olunca admin paneli anında tazele.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && adminTicketPollTimer) {
      loadAndRenderAdminTickets({ silent: true });
    }
  });

  const list = document.querySelector("[data-admin-ticket-list]");
  if (list) {
    list.addEventListener("click", (event) => {
      const viewDesigns = event.target.closest("[data-admin-view-designs]");
      if (viewDesigns) {
        openAdminUserDesigns(viewDesigns.dataset.userId || "");
        return;
      }
      const toggle = event.target.closest("[data-ticket-toggle]");
      if (!toggle) return;
      const body = toggle.parentElement?.querySelector(".ticket-card-body");
      if (!body) return;
      const open = body.hidden;
      body.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    list.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-admin-ticket-form]");
      if (!form) return;
      event.preventDefault();
      submitAdminTicketReply(form);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminPanelUi);
} else {
  initAdminPanelUi();
}

function clearMockupResults() {
  // Mockup ve manken panelleri ayrı sonuç grid'leri taşır; ikisini birlikte temizle.
  document.querySelectorAll("[data-mockup-result-grid]").forEach((resultGrid) => {
    replaceChildrenReleasing(resultGrid);
    resultGrid.hidden = true;
  });
  newDesignStudio?.classList.remove("has-mockup-result");
  setFinalDesignReady(false);
  queueActiveProjectSave();
}

// "1 görsel oluştur" / "4 adet oluştur" butonları, ilgili aşamadaki gizli sayım
// chip'ini seçer (chip click handler'ı maliyet/temizlik yan etkilerini yönetir);
// ardından mevcut üretim fonksiyonu seçili chip'i okuyarak çalışır.
function selectStageGenerationCount(button, chipGroup) {
  const count = button?.dataset.genCount;
  if (!count) return;
  const scope = button.closest("[data-stage-panel]") || document;
  const chip = scope.querySelector(
    `[data-chip-group="${chipGroup}"] .option-chip[data-${chipGroup}="${count}"]`
  );
  if (chip && !chip.classList.contains("is-selected")) chip.click();
}

function selectedDraftConfig(source) {
  const selectedCountChip = document.querySelector('[data-chip-group="count"] .option-chip.is-selected');
  const selectedGenerator = source?.dataset?.draftCount ? source : document.querySelector("[data-generate-sketches][data-draft-count]");
  const selectedSource = selectedGenerator || selectedCountChip;
  const draftCount = normalizeGenerationCountValue(selectedSource?.dataset.draftCount);

  return {
    creditCost: draftCreditCostFor(draftCount),
    draftCount,
    resolution: "1k",
  };
}

function selectedFinishConfig() {
  const selectedCountChip = document.querySelector('[data-chip-group="finish-count"] .option-chip.is-selected');
  const finishCount = normalizeGenerationCountValue(selectedCountChip?.dataset.finishCount);

  return {
    creditCost: finishCreditCostFor(finishCount),
    finishCount,
  };
}

function selectedMockupConfig() {
  const scope = activeVisualizationPanel() || document;
  const selectedCountChip = scope.querySelector('[data-chip-group="mockup-count"] .option-chip.is-selected');
  const selectedResolutionChip = scope.querySelector('[data-chip-group="mockup-resolution"] .option-chip.is-selected');
  const mockupCount = normalizeMockupCountValue(selectedCountChip?.dataset.mockupCount);
  const resolutionConfig = mockupResolutionConfig(selectedResolutionChip?.dataset.mockupResolution);
  const scene = readSelectedChip("scene").value;
  const creditCost = mockupCreditCostFor(mockupCount, resolutionConfig.value, scene);

  return {
    creditCost,
    mockupCount,
    resolution: resolutionConfig.value,
    resolutionLabel: resolutionConfig.label,
    scene,
  };
}

function updateDraftCost() {
  const { creditCost } = selectedDraftConfig();
  const costText = `${creditCost} kredi`;

  if (sketchCostSummary) sketchCostSummary.textContent = costText;
}

function updateFinishCost() {
  const { creditCost } = selectedFinishConfig();
  const costText = creditCost > 0 ? `${creditCost} kredi` : "Ücretsiz";

  if (finishCostSummary) finishCostSummary.textContent = costText;
}

function updateMockupCost() {
  const { creditCost } = selectedMockupConfig();
  const costText = `${creditCost} kredi`;

  const summary = activeVisualizationPanel()?.querySelector("[data-mockup-cost-summary]") || mockupCostSummary;
  if (summary) summary.textContent = costText;
}

function updateVisibleSketchCards() {
  const { draftCount } = selectedDraftConfig();

  document.querySelectorAll("[data-sketch-card]").forEach((card, index) => {
    card.classList.toggle("is-hidden", index >= draftCount);
  });
}

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

initStudio().catch(() => {
  window.location.href = "./login.html";
});
