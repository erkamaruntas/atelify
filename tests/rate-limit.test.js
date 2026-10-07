import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/credits.repo.js", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

import { getSupabaseAdminClient } from "../src/repositories/credits.repo.js";
import {
  enforceRateLimits,
  getRateLimitConfig,
  rateLimitedResponse,
} from "../src/lib/rate-limit.js";

afterEach(() => {
  vi.clearAllMocks();
});

function buildAdminClient({ countByScope = {}, oldestByScope = {}, insertError = null }) {
  const inserts = [];
  const client = {
    inserts,
    from() {
      let currentScope = null;
      let isCountQuery = false;
      const builder = {
        select(_columns, options) {
          isCountQuery = !!options?.head;
          return builder;
        },
        eq(field, value) {
          if (field === "scope") currentScope = value;
          return builder;
        },
        gte() {
          if (isCountQuery) {
            return Promise.resolve({
              count: countByScope[currentScope] ?? 0,
              error: null,
            });
          }
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          const oldest = oldestByScope[currentScope];
          return Promise.resolve({
            data: oldest ? [{ created_at: oldest }] : [],
            error: null,
          });
        },
        insert(record) {
          inserts.push(record);
          return Promise.resolve({ error: insertError });
        },
      };
      return builder;
    },
  };
  return client;
}

describe("getRateLimitConfig", () => {
  it("bilinen scope'lar için limit ve windowMs döner", () => {
    expect(getRateLimitConfig("sketch")).toEqual({ limit: 30, windowMs: 60 * 60 * 1000 });
    expect(getRateLimitConfig("finish")).toEqual({ limit: 15, windowMs: 60 * 60 * 1000 });
    expect(getRateLimitConfig("mockup")).toEqual({ limit: 10, windowMs: 60 * 60 * 1000 });
    expect(getRateLimitConfig("general")).toEqual({ limit: 120, windowMs: 60 * 1000 });
  });

  it("bilinmeyen scope için null döner", () => {
    expect(getRateLimitConfig("unknown")).toBeNull();
  });
});

describe("enforceRateLimits", () => {
  it("userId boşsa 401 fırlatır", async () => {
    await expect(enforceRateLimits("", ["general"])).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("scopes boşsa allowed döner, repo'ya gitmez", async () => {
    const result = await enforceRateLimits("user-1", []);
    expect(result).toEqual({ allowed: true });
    expect(getSupabaseAdminClient).not.toHaveBeenCalled();
  });

  it("limit altındaysa kayıt yazar ve allowed döner", async () => {
    const client = buildAdminClient({ countByScope: { general: 5 } });
    getSupabaseAdminClient.mockReturnValue(client);

    const result = await enforceRateLimits("user-1", ["general"]);

    expect(result.allowed).toBe(true);
    expect(client.inserts).toEqual([{ user_id: "user-1", scope: "general" }]);
  });

  it("limit doluysa kayıt yazmadan 429 bilgisini döner", async () => {
    const oldestIso = new Date(Date.now() - 30 * 1000).toISOString();
    const client = buildAdminClient({
      countByScope: { general: 120 },
      oldestByScope: { general: oldestIso },
    });
    getSupabaseAdminClient.mockReturnValue(client);

    const result = await enforceRateLimits("user-1", ["general"]);

    expect(result.allowed).toBe(false);
    expect(result.scope).toBe("general");
    expect(result.limit).toBe(120);
    expect(result.retryAfterSec).toBeGreaterThan(0);
    expect(result.retryAfterSec).toBeLessThanOrEqual(60);
    expect(client.inserts).toEqual([]);
  });

  it("çoklu scope hepsi geçerse her biri için kayıt yazar", async () => {
    const client = buildAdminClient({ countByScope: { sketch: 0, general: 0 } });
    getSupabaseAdminClient.mockReturnValue(client);

    const result = await enforceRateLimits("user-1", ["sketch", "general"]);

    expect(result.allowed).toBe(true);
    expect(client.inserts).toEqual([
      { user_id: "user-1", scope: "sketch" },
      { user_id: "user-1", scope: "general" },
    ]);
  });

  it("ilk scope geçer ama ikinci doluysa hiçbir kayıt yazılmaz ve ikinci scope döner", async () => {
    const oldestIso = new Date(Date.now() - 10 * 1000).toISOString();
    const client = buildAdminClient({
      countByScope: { sketch: 0, general: 120 },
      oldestByScope: { general: oldestIso },
    });
    getSupabaseAdminClient.mockReturnValue(client);

    const result = await enforceRateLimits("user-1", ["sketch", "general"]);

    expect(result.allowed).toBe(false);
    expect(result.scope).toBe("general");
    expect(client.inserts).toEqual([]);
  });

  it("bilinmeyen scope verilirse hata fırlatır", async () => {
    getSupabaseAdminClient.mockReturnValue(buildAdminClient({}));

    await expect(enforceRateLimits("user-1", ["bogus"])).rejects.toThrow(/Bilinmeyen rate limit scope/);
  });

  it("retryAfterSec en az 1 saniyedir", async () => {
    const oldestIso = new Date(Date.now() - 59 * 60 * 1000 - 59 * 1000).toISOString();
    const client = buildAdminClient({
      countByScope: { sketch: 30 },
      oldestByScope: { sketch: oldestIso },
    });
    getSupabaseAdminClient.mockReturnValue(client);

    const result = await enforceRateLimits("user-1", ["sketch"]);

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSec).toBeGreaterThanOrEqual(1);
  });

  it("getSupabaseAdminClient fırlatırsa hata yukarı çıkar", async () => {
    getSupabaseAdminClient.mockImplementation(() => {
      throw new Error("config eksik");
    });

    await expect(enforceRateLimits("user-1", ["general"])).rejects.toThrow("config eksik");
  });
});

describe("rateLimitedResponse", () => {
  it("scope bilgisini, retryAfter'ı ve Retry-After header'ını içerir", () => {
    const limited = rateLimitedResponse({
      allowed: false,
      scope: "sketch",
      limit: 30,
      retryAfterSec: 42,
    });

    expect(limited.statusCode).toBe(429);
    expect(limited.headers["Retry-After"]).toBe("42");
    expect(limited.payload.retryAfter).toBe(42);
    expect(limited.payload.scope).toBe("sketch");
    expect(limited.payload.limit).toBe(30);
    expect(limited.payload.error).toMatch(/limit aşıldı/);
  });
});
