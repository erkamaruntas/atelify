/**
 * Hafif sağlık kontrolü (health check).
 *
 * Uptime izleyiciler (UptimeRobot, BetterStack, Pingdom vb.) ve dağıtım sonrası
 * duman testleri için. Gizli bilgi sızdırmaz: yalnızca kritik ortam
 * değişkenlerinin TANIMLI olup olmadığını (değerini değil) ve sürecin ayakta
 * olduğunu raporlar.
 */

import { isSentryEnabled } from "../lib/sentry.js";

const startedAt = Date.now();

function envPresent(...names) {
  return names.some((name) => {
    const value = process.env[name];
    return typeof value === "string" && value.trim() !== "";
  });
}

export function getHealthReport() {
  const checks = {
    supabaseUrl: envPresent("SUPABASE_URL"),
    supabaseKey: envPresent("SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY"),
    supabaseServiceRole: envPresent("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY"),
    falKey: envPresent("FAL_KEY"),
  };

  const configOk = Object.values(checks).every(Boolean);

  return {
    status: configOk ? "ok" : "degraded",
    time: new Date().toISOString(),
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    checks,
    sentry: isSentryEnabled() ? "enabled" : "disabled",
    region: process.env.VERCEL_REGION || undefined,
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || undefined,
  };
}
