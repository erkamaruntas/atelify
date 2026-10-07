import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __testing, captureException, isSentryEnabled, resetSentryForTests } from "../src/lib/sentry.js";
import { createLogger } from "../src/lib/logger.js";
import { generateRequestId, withApiErrorBoundary } from "../src/lib/error-boundary.js";
import { getHealthReport } from "../src/services/health.service.js";

const { parseDsn } = __testing;

describe("sentry DSN ayrıştırma", () => {
  it("geçerli DSN'den ingest uç noktası ve public key çıkarır", () => {
    const parsed = parseDsn("https://abc123@o12345.ingest.sentry.io/678");
    expect(parsed).not.toBeNull();
    expect(parsed.publicKey).toBe("abc123");
    expect(parsed.projectId).toBe("678");
    expect(parsed.ingestUrl).toBe("https://o12345.ingest.sentry.io/api/678/envelope/");
  });

  it("geçersiz/boş DSN için null döner", () => {
    expect(parseDsn("")).toBeNull();
    expect(parseDsn("not-a-url")).toBeNull();
    expect(parseDsn("https://sentry.io/678")).toBeNull(); // public key yok
  });
});

describe("captureException / isSentryEnabled", () => {
  const originalDsn = process.env.SENTRY_DSN;
  let fetchSpy;

  beforeEach(() => {
    resetSentryForTests();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    if (originalDsn === undefined) delete process.env.SENTRY_DSN;
    else process.env.SENTRY_DSN = originalDsn;
    resetSentryForTests();
  });

  it("DSN yokken sessiz kalır, fetch çağırmaz", () => {
    delete process.env.SENTRY_DSN;
    resetSentryForTests();
    expect(isSentryEnabled()).toBe(false);
    captureException(new Error("boom"));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("DSN varken envelope'ı ingest uç noktasına gönderir", () => {
    process.env.SENTRY_DSN = "https://key@o1.ingest.sentry.io/42";
    resetSentryForTests();
    expect(isSentryEnabled()).toBe(true);
    captureException(new Error("boom"), { scope: "test" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://o1.ingest.sentry.io/api/42/envelope/");
    expect(options.method).toBe("POST");
    expect(options.headers["X-Sentry-Auth"]).toContain("sentry_key=key");
    expect(options.body).toContain("boom");
  });

  it("fetch reddedilse bile hata fırlatmaz", async () => {
    process.env.SENTRY_DSN = "https://key@o1.ingest.sentry.io/42";
    resetSentryForTests();
    fetchSpy.mockRejectedValueOnce(new Error("network down"));
    expect(() => captureException(new Error("boom"))).not.toThrow();
  });
});

describe("logger", () => {
  it("FF_LOG_LEVEL eşiğinin altındaki kayıtları bastırır", () => {
    const prev = process.env.FF_LOG_LEVEL;
    process.env.FF_LOG_LEVEL = "warn";
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const log = createLogger("test");
      log.info("bilgi mesajı");
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
      if (prev === undefined) delete process.env.FF_LOG_LEVEL;
      else process.env.FF_LOG_LEVEL = prev;
    }
  });

  it("yapısal JSON satırı yazar", () => {
    const prev = process.env.FF_LOG_LEVEL;
    process.env.FF_LOG_LEVEL = "debug";
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const log = createLogger("billing");
      log.warn("dikkat", { userId: "u1" });
      expect(spy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(spy.mock.calls[0][0]);
      expect(parsed.level).toBe("warn");
      expect(parsed.scope).toBe("billing");
      expect(parsed.msg).toBe("dikkat");
      expect(parsed.userId).toBe("u1");
      expect(typeof parsed.time).toBe("string");
    } finally {
      spy.mockRestore();
      if (prev === undefined) delete process.env.FF_LOG_LEVEL;
      else process.env.FF_LOG_LEVEL = prev;
    }
  });
});

describe("withApiErrorBoundary", () => {
  function makeMockResponse() {
    return {
      headersSent: false,
      writableEnded: false,
      _status: null,
      _json: null,
      _headers: {},
      setHeader(key, value) {
        this._headers[key] = value;
      },
      getHeader(key) {
        return this._headers[key];
      },
      status(code) {
        this._status = code;
        return this;
      },
      json(payload) {
        this._json = payload;
        this.writableEnded = true;
        return this;
      },
    };
  }

  it("normal handler sonucunu bozmadan geçirir", async () => {
    const handler = vi.fn(async (req, res) => res.status(200).json({ ok: true }));
    const guarded = withApiErrorBoundary(handler, { scope: "test" });
    const res = makeMockResponse();
    await guarded({ method: "GET", url: "/x" }, res);
    expect(res._status).toBe(200);
    expect(res._json).toEqual({ ok: true });
    expect(res._headers["X-Request-Id"]).toBeTruthy();
  });

  it("throw eden handler'ı 500 + requestId ile yakalar", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const handler = vi.fn(async () => {
        throw new Error("kaboom");
      });
      const guarded = withApiErrorBoundary(handler, { scope: "test" });
      const res = makeMockResponse();
      await guarded({ method: "POST", url: "/y" }, res);
      expect(res._status).toBe(500);
      expect(res._json.requestId).toBeTruthy();
      expect(res._json.error).toContain("Beklenmeyen");
    } finally {
      errSpy.mockRestore();
    }
  });

  it("generateRequestId benzersiz değer üretir", () => {
    expect(generateRequestId()).not.toBe(generateRequestId());
  });
});

describe("getHealthReport", () => {
  it("config alanlarını ve durum/uptime alanlarını raporlar", () => {
    const report = getHealthReport();
    expect(["ok", "degraded"]).toContain(report.status);
    expect(report.checks).toHaveProperty("supabaseUrl");
    expect(report.checks).toHaveProperty("falKey");
    expect(typeof report.uptimeSeconds).toBe("number");
    expect(["enabled", "disabled"]).toContain(report.sentry);
  });
});
