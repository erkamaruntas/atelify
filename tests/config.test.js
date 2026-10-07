import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getPublicConfig, resetConfigCacheForTests } from "../src/config/env.js";

const ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_KEY",
  "FF_STORAGE_BUCKET",
  "FAL_KEY",
  "FF_PUBLIC_SITE_URL",
  "PUBLIC_SITE_URL",
  "SITE_URL",
  "APP_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
];

let originalEnv = {};

function setBaseEnv() {
  process.env.SUPABASE_URL = "https://project-ref.supabase.co";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_test";
  process.env.FF_STORAGE_BUCKET = "ff-design-assets";
  process.env.FAL_KEY = "fal_test";
}

describe("public config", () => {
  beforeEach(() => {
    originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
    // Silmek yerine boşaltıyoruz: env.js eksik (undefined) anahtarları yerel .env
    // dosyasından doldurur; boş string ise "tanımsız" sayılır ve .env'den doldurulmaz.
    // Böylece testler geliştiricinin .env içeriğinden bağımsız çalışır.
    for (const key of ENV_KEYS) process.env[key] = "";
    setBaseEnv();
    resetConfigCacheForTests();
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
    resetConfigCacheForTests();
  });

  it("canlı site URL'ini public config'e normalize ederek ekler", () => {
    process.env.FF_PUBLIC_SITE_URL = "ff.example.com/login.html?x=1#reset";

    expect(getPublicConfig().siteUrl).toBe("https://ff.example.com/");
  });

  it("site URL yoksa eski current-origin davranışı için boş bırakır", () => {
    expect(getPublicConfig().siteUrl).toBe("");
  });
});
