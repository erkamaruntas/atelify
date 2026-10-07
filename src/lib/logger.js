/**
 * Hafif, bağımlılıksız yapısal logger.
 *
 * Amaç: Dağınık `console.error("[scope] ...", err)` çağrılarını tek bir yapısal
 * formatta toplamak. Her kayıt JSON satırı olarak stdout/stderr'e yazılır; Vercel
 * (ve çoğu hosting) bu çıktıyı otomatik toplar ve `level`, `scope`, `requestId`
 * gibi alanlarla aranabilir hale gelir.
 *
 * `error` seviyesindeki kayıtlar, varsa Sentry'ye de iletilir (opsiyonel, DSN'e
 * bağlı). Logger asla hata fırlatmaz.
 */

import { captureException } from "./sentry.js";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function activeThreshold() {
  const raw = String(process.env.FF_LOG_LEVEL || "").toLowerCase();
  if (raw && LEVELS[raw]) return LEVELS[raw];
  // Üretimde gürültüyü azalt: varsayılan "info". Geliştirmede "debug".
  const env = process.env.NODE_ENV || process.env.VERCEL_ENV;
  return env === "production" ? LEVELS.info : LEVELS.debug;
}

function serializeError(error) {
  if (!(error instanceof Error)) {
    return error === undefined ? undefined : { value: String(error) };
  }
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code || undefined,
    statusCode: error.statusCode || undefined,
  };
}

function write(level, scope, message, meta) {
  if (LEVELS[level] < activeThreshold()) return;

  const record = {
    level,
    scope: scope || "app",
    msg: message,
    time: new Date().toISOString(),
  };

  let errorObject;
  if (meta && typeof meta === "object") {
    const { error, err, ...rest } = meta;
    errorObject = error || err;
    if (errorObject) record.error = serializeError(errorObject);
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) record[key] = value;
    }
  }

  let line;
  try {
    line = JSON.stringify(record);
  } catch {
    // Döngüsel referans vb. durumlarda güvenli geri dönüş.
    line = JSON.stringify({ level, scope: record.scope, msg: String(message), time: record.time });
  }

  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  try {
    sink(line);
  } catch {
    /* yoksay */
  }

  if (level === "error") {
    captureException(errorObject || new Error(message), {
      scope: record.scope,
      level: "error",
      extra: meta && typeof meta === "object" ? sanitizeExtra(meta) : undefined,
    });
  }
}

function sanitizeExtra(meta) {
  const { error, err, ...rest } = meta;
  return Object.keys(rest).length ? rest : undefined;
}

/**
 * Belirli bir kapsam (scope) için logger üretir.
 * @param {string} scope Örn. "generation", "credits", "http".
 */
export function createLogger(scope) {
  return {
    debug: (message, meta) => write("debug", scope, message, meta),
    info: (message, meta) => write("info", scope, message, meta),
    warn: (message, meta) => write("warn", scope, message, meta),
    error: (message, meta) => write("error", scope, message, meta),
    child: (childScope) => createLogger(childScope ? `${scope}:${childScope}` : scope),
  };
}

export const logger = createLogger("app");
