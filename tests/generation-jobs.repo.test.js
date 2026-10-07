import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  claimGenerationJob,
  sanitizeGenerationStage,
} from "../src/repositories/generation-jobs.repo.js";
import { resetConfigCacheForTests } from "../src/config/env.js";

const ENV_KEYS = [
  "NODE_ENV",
  "VERCEL",
  "VERCEL_ENV",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "FF_STORAGE_BUCKET",
  "FAL_KEY",
  "FF_ALLOW_GENERATION_MEMORY_FALLBACK",
  "FF_DISABLE_GENERATION_MEMORY_FALLBACK",
];

let originalEnv = {};

function setBaseEnv() {
  process.env.SUPABASE_URL = "https://project-ref.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_test";
  process.env.FF_STORAGE_BUCKET = "ff-design-assets";
  process.env.FAL_KEY = "fal_test";
}

function makeJob(id = "job-12345") {
  return {
    clientJobId: id,
    count: 1,
    creditCost: 10,
    stage: "manken",
    status: "submitting",
    userId: "11111111-1111-4111-8111-111111111111",
  };
}

function mockFailedSupabaseFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: false,
      text: async () => "new row violates check constraint",
    }))
  );
}

describe("generation jobs repository", () => {
  beforeEach(() => {
    originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
    for (const key of ENV_KEYS) delete process.env[key];
    setBaseEnv();
    resetConfigCacheForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
    resetConfigCacheForTests();
  });

  it("manken stage'ini geçerli üretim aşaması olarak kabul eder", () => {
    expect(sanitizeGenerationStage("manken")).toBe("manken");
  });

  it("hosted/production ortamda Supabase claim hatasını memory fallback ile gizlemez", async () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL = "1";
    process.env.VERCEL_ENV = "production";
    resetConfigCacheForTests();
    mockFailedSupabaseFetch();

    await expect(claimGenerationJob(makeJob("job-prod-12345"))).rejects.toThrow(
      /in-memory fallback is disabled/
    );
  });

  it("local/test ortamında Supabase claim hatasında eski memory fallback'i korur", async () => {
    process.env.NODE_ENV = "test";
    resetConfigCacheForTests();
    mockFailedSupabaseFetch();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(claimGenerationJob(makeJob("job-test-12345"))).resolves.toMatchObject({
      claimed: true,
      job: { clientJobId: "job-test-12345", stage: "manken" },
    });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("falling back to memory"),
      expect.any(Error)
    );
  });
});
