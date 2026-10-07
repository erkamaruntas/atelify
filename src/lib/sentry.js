/**
 * Bağımlılıksız, opsiyonel Sentry iletici.
 *
 * Amaç: Henüz Sentry DSN'i yokken hiçbir şey yapmamak; DSN ortam değişkeni
 * (`SENTRY_DSN`) tanımlandığında ise hataları Sentry'nin "envelope" HTTP API'sine
 * `fetch` ile göndermek. Böylece teslim öncesi kod değişikliğine gerek kalmadan,
 * DSN eklenince otomatik devreye girer.
 *
 * Tasarım ilkeleri:
 *  - ASLA hata fırlatma. Gözlemlenebilirlik katmanı uygulamayı kıramaz.
 *  - Fire-and-forget: ağ çağrısı isteği bloklamaz, hatası yutulur.
 *  - Harici paket yok; yalnızca global `fetch` (Node 18+ / Vercel runtime) kullanır.
 */

let cachedTransport = null;
let initialized = false;

/**
 * DSN biçimi: https://<publicKey>@<host>[:port]/<projectId>
 * Bu DSN'den envelope ingest uç noktası ve auth başlığı türetilir.
 */
function parseDsn(rawDsn) {
  try {
    const url = new URL(String(rawDsn || "").trim());
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean).pop();
    if (!publicKey || !projectId) return null;

    const host = url.host; // host[:port]
    const protocol = url.protocol || "https:";
    const ingestUrl = `${protocol}//${host}/api/${projectId}/envelope/`;
    return { publicKey, projectId, ingestUrl };
  } catch {
    return null;
  }
}

function getTransport() {
  if (initialized) return cachedTransport;
  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    cachedTransport = null;
    return null;
  }

  const parsed = parseDsn(dsn);
  if (!parsed) {
    // DSN tanımlı ama bozuksa bir kez uyar; yine de sessiz kal.
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[sentry] SENTRY_DSN ayrıştırılamadı; hata iletimi devre dışı.");
    }
    cachedTransport = null;
    return null;
  }

  cachedTransport = {
    ...parsed,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV || "production",
    release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || undefined,
  };
  return cachedTransport;
}

/** Sentry yapılandırılmış mı? (DSN var ve geçerli) */
export function isSentryEnabled() {
  return Boolean(getTransport());
}

function buildEventPayload(error, context = {}) {
  const isError = error instanceof Error;
  const value = isError ? error.message : String(error);
  const type = isError ? error.name || "Error" : "Error";
  const stack = isError && typeof error.stack === "string" ? error.stack : "";

  // Çok kaba bir stack-trace ayrıştırması; Sentry stack olmadan da kabul eder.
  const frames = stack
    .split("\n")
    .slice(1)
    .map((line) => ({ function: line.trim() }))
    .filter((frame) => frame.function)
    .reverse();

  return {
    event_id: cryptoRandomId(),
    timestamp: Date.now() / 1000,
    platform: "node",
    level: context.level || "error",
    logger: context.scope || "app",
    server_name: process.env.VERCEL_REGION || undefined,
    tags: context.tags || undefined,
    extra: context.extra || undefined,
    exception: {
      values: [
        {
          type,
          value,
          stacktrace: frames.length ? { frames } : undefined,
        },
      ],
    },
  };
}

function cryptoRandomId() {
  // 32 karakterlik hex; Sentry event_id formatına uygun.
  try {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID().replace(/-/g, "");
    }
  } catch {
    /* yoksay */
  }
  let out = "";
  for (let i = 0; i < 32; i += 1) out += Math.floor(Math.random() * 16).toString(16);
  return out;
}

/**
 * Bir hatayı (ya da hata benzeri değeri) Sentry'ye iletir. DSN yoksa hiçbir şey
 * yapmaz. Ağ çağrısı await edilmez; hatası yutulur.
 *
 * @param {unknown} error
 * @param {{ scope?: string, level?: string, tags?: object, extra?: object, environment?: string }} [context]
 */
export function captureException(error, context = {}) {
  const transport = getTransport();
  if (!transport) return;

  try {
    const event = buildEventPayload(error, context);
    event.environment = context.environment || transport.environment;
    if (transport.release) event.release = transport.release;

    const header = {
      event_id: event.event_id,
      sent_at: new Date().toISOString(),
      dsn: undefined,
    };
    const itemHeader = { type: "event", content_type: "application/json" };
    const envelope =
      `${JSON.stringify(header)}\n${JSON.stringify(itemHeader)}\n${JSON.stringify(event)}`;

    const authHeader =
      `Sentry sentry_version=7, sentry_client=ff-atelier/1.0, sentry_key=${transport.publicKey}`;

    // Fire-and-forget. Promise'i tut ama await etme.
    const result = globalThis.fetch(transport.ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": authHeader,
      },
      body: envelope,
    });
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        /* ağ hatasını yut */
      });
    }
  } catch {
    /* gözlemlenebilirlik asla uygulamayı kıramaz */
  }
}

/** Test izolasyonu için iç durumu sıfırlar. */
export function resetSentryForTests() {
  cachedTransport = null;
  initialized = false;
}

export const __testing = { parseDsn };
