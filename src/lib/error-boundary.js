/**
 * Serverless / HTTP handler'lar için global hata koruması.
 *
 * Amaç: Bir handler beklenmedik şekilde throw ederse (kod hatası, ağ patlaması,
 * vb.) istemciye ham 500/stacktrace sızdırmamak; bunun yerine hatayı bir
 * korelasyon kimliğiyle yapısal olarak loglamak ve istemciye yalnızca o kimliği
 * döndürmek. Böylece kullanıcı "şu kod ile destek isteyin" diyebilir ve loglarda
 * tek istek izlenebilir.
 */

import { createLogger } from "./logger.js";

const log = createLogger("http");

export function generateRequestId() {
  try {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    /* yoksay */
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function alreadySent(response) {
  return Boolean(
    response &&
      (response.headersSent || response.writableEnded || response.finished)
  );
}

function send500(response, requestId) {
  if (alreadySent(response)) return;
  const payload = JSON.stringify({
    error: "Beklenmeyen bir sunucu hatası oluştu. Sorun sürerse bu kodu paylaşın.",
    requestId,
  });
  try {
    // Vercel handler'ı (res.status().json()) ve düz Node http response uyumu.
    if (typeof response.status === "function" && typeof response.json === "function") {
      response.status(500).json({
        error: "Beklenmeyen bir sunucu hatası oluştu. Sorun sürerse bu kodu paylaşın.",
        requestId,
      });
      return;
    }
    response.writeHead(500, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    });
    response.end(payload);
  } catch {
    try {
      response.end?.();
    } catch {
      /* yoksay */
    }
  }
}

/**
 * Bir (request, response) handler'ını hata koruması ile sarmalar.
 * @param {Function} handler Asıl handler.
 * @param {{ scope?: string }} [options]
 */
export function withApiErrorBoundary(handler, options = {}) {
  const scope = options.scope || "api";
  return async function guardedHandler(request, response) {
    const requestId = generateRequestId();
    try {
      // Hata yanıtı için kimliği handler'lara da görünür kıl.
      if (response && !response.getHeader?.("X-Request-Id")) {
        try {
          response.setHeader?.("X-Request-Id", requestId);
        } catch {
          /* başlık yazılamıyorsa yoksay */
        }
      }
      return await handler(request, response);
    } catch (error) {
      log.error("Unhandled handler error.", {
        error,
        scope,
        requestId,
        method: request?.method,
        url: request?.url,
      });
      send500(response, requestId);
      return undefined;
    }
  };
}
