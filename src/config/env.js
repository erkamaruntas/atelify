import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("../../", import.meta.url));
const DEFAULT_PORT = 3000;
const DEFAULT_STORAGE_BUCKET = "ff-design-assets";

let cachedConfig = null;
let dotenvLoaded = false;

function parseEnvFile(source) {
  return source.split(/\r?\n/).reduce((accumulator, line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) return accumulator;

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) return accumulator;

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    accumulator[key] = value;
    return accumulator;
  }, {});
}

function loadDotenvOnce() {
  if (dotenvLoaded) return;
  dotenvLoaded = true;

  const filePath = join(rootDir, ".env");
  if (!existsSync(filePath)) return;

  const parsed = parseEnvFile(readFileSync(filePath, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function readString(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return "";
}

function readList(...names) {
  const seen = new Set();
  const out = [];
  for (const name of names) {
    const raw = process.env[name];
    if (typeof raw !== "string" || !raw) continue;
    for (const part of raw.split(/[\s,;]+/)) {
      const trimmed = part.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        out.push(trimmed);
      }
    }
  }
  return out;
}

function normalizeSiteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    url.search = "";
    url.hash = "";

    const segments = url.pathname.split("/");
    const lastSegment = segments[segments.length - 1] || "";
    if (lastSegment.includes(".")) {
      segments.pop();
      url.pathname = segments.join("/") || "/";
    }

    if (!url.pathname.endsWith("/")) {
      url.pathname = `${url.pathname}/`;
    }

    return url.toString();
  } catch {
    return "";
  }
}

function buildConfig() {
  loadDotenvOnce();

  const supabaseUrl = readString("SUPABASE_URL");
  const supabasePublishableKey = readString("SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = readString("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY");
  const siteUrl = normalizeSiteUrl(
    readString(
      "FF_PUBLIC_SITE_URL",
      "PUBLIC_SITE_URL",
      "SITE_URL",
      "APP_URL",
      "VERCEL_PROJECT_PRODUCTION_URL",
      "VERCEL_URL"
    )
  );
  const storageBucket =
    readString("FF_STORAGE_BUCKET", "SUPABASE_STORAGE_BUCKET") || DEFAULT_STORAGE_BUCKET;
  const falKey = readString("FAL_KEY");

  const missing = [];
  if (!supabaseUrl) missing.push("SUPABASE_URL");
  if (!supabasePublishableKey) missing.push("SUPABASE_PUBLISHABLE_KEY");
  if (!supabaseServiceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!storageBucket) missing.push("FF_STORAGE_BUCKET");
  if (!falKey) missing.push("FAL_KEY");

  if (missing.length) {
    throw new Error(
      `[config] Eksik environment değişkenleri: ${missing.join(", ")}. ` +
        `.env dosyasını veya hosting env ayarlarını kontrol et.`
    );
  }

  const portRaw = readString("PORT");
  const port = portRaw ? Number.parseInt(portRaw, 10) : DEFAULT_PORT;
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error(`[config] Geçersiz PORT değeri: ${portRaw}`);
  }

  return Object.freeze({
    supabaseUrl,
    supabasePublishableKey,
    supabaseServiceRoleKey,
    siteUrl,
    storageBucket,
    falKey,
    port,
    adminUserIds: Object.freeze(readList("FF_ADMIN_USER_IDS", "ADMIN_USER_IDS")),
    adminEmails: Object.freeze(
      readList("FF_ADMIN_EMAILS", "ADMIN_EMAILS", "OWNER_EMAILS").map((value) =>
        value.toLowerCase()
      )
    ),
    adminApiKey: readString("ADMIN_API_KEY"),
    // iyzico abonelik ödemesi (opsiyonel — bağlanana kadar boş; eksikse startup patlamaz).
    iyzicoApiKey: readString("IYZICO_API_KEY"),
    iyzicoSecretKey: readString("IYZICO_SECRET_KEY"),
    iyzicoBaseUrl: readString("IYZICO_BASE_URL") || "https://sandbox-api.iyzipay.com",
    // Plan anahtarı -> iyzico pricingPlanReferenceCode (setup script çıktısından doldurulur).
    iyzicoPlanRefs: Object.freeze({
      go: readString("IYZICO_PLAN_GO_REF"),
      pro: readString("IYZICO_PLAN_PRO_REF"),
      max: readString("IYZICO_PLAN_MAX_REF"),
    }),
  });
}

export function loadConfig() {
  if (cachedConfig) return cachedConfig;
  cachedConfig = buildConfig();
  return cachedConfig;
}

export function getPublicConfig() {
  const config = loadConfig();
  return {
    supabaseUrl: config.supabaseUrl,
    supabasePublishableKey: config.supabasePublishableKey,
    siteUrl: config.siteUrl,
  };
}

export function resetConfigCacheForTests() {
  cachedConfig = null;
  dotenvLoaded = false;
}
