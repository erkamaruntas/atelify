import { getSupabaseAdminClient } from "../repositories/credits.repo.js";
import { getPlan, isRecurringPlan } from "../config/plans.js";

// Kullanıcının gösterime esas aboneliğini seçer: önce aktif/past_due (en geç dönem
// sonu), yoksa en güncel canceled satır. pending/expired satırlar yok sayılır.
export function pickPrimarySubscription(rows = []) {
  const relevant = rows.filter((row) => ["active", "past_due", "canceled"].includes(row.status));
  if (!relevant.length) return null;

  const rank = (row) => (row.status === "active" || row.status === "past_due" ? 2 : 1);
  return relevant
    .slice()
    .sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(b) - rank(a);
      const aTime = Date.parse(a.current_period_end || a.updated_at || "") || 0;
      const bTime = Date.parse(b.current_period_end || b.updated_at || "") || 0;
      return bTime - aTime;
    })[0];
}

export function summaryFromRow(row) {
  if (!row) return { planKey: "free", status: "none", currentPeriodEnd: null, active: false };
  const plan = getPlan(row.plan_key);
  const periodEnd = row.current_period_end || null;
  const notExpired = !periodEnd || Date.parse(periodEnd) > Date.now();
  // "İptal edildi ama dönem sonuna kadar geçerli" durumunda plan hâlâ etkin sayılır.
  const active = Boolean(plan) && (row.status === "active" || row.status === "past_due" || (row.status === "canceled" && notExpired));
  return {
    planKey: plan ? plan.key : "free",
    status: row.status,
    currentPeriodEnd: periodEnd,
    active,
  };
}

// Kullanıcının mevcut abonelik özetini döndürür (gösterim için).
export async function getSubscriptionSummary({ userId }) {
  if (!userId) throw new Error("Kullanıcı kimliği gerekli.");

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("ff_subscriptions")
    .select("plan_key, status, current_period_end, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message || "Abonelik bilgisi okunamadı.");
  return summaryFromRow(pickPrimarySubscription(data || []));
}

// Aboneliği DÖNEM SONUNDA iptal eder: aktif/past_due satırları 'canceled' işaretler,
// current_period_end'e dokunmaz — kullanıcı kalan kredilerini dönem sonuna kadar
// kullanmaya devam eder. Cüzdan (kredi) DEĞİŞTİRİLMEZ.
// Döner: { canceled, planKey, currentPeriodEnd }.
export async function cancelSubscription({ userId }) {
  if (!userId) throw new Error("Kullanıcı kimliği gerekli.");

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("ff_subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .in("status", ["active", "past_due"])
    .select("plan_key, status, current_period_end, updated_at");

  if (error) throw new Error(error.message || "Abonelik iptal edilemedi.");

  const rows = data || [];
  if (!rows.length) {
    return { canceled: false, reason: "no_active_subscription", ...summaryFromRow(await primaryRow(admin, userId)) };
  }

  const summary = summaryFromRow(pickPrimarySubscription(rows));
  return { canceled: true, planKey: summary.planKey, currentPeriodEnd: summary.currentPeriodEnd, status: "canceled" };
}

async function primaryRow(admin, userId) {
  const { data } = await admin
    .from("ff_subscriptions")
    .select("plan_key, status, current_period_end, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);
  return pickPrimarySubscription(data || []);
}

// Başarılı bir abonelik tahsilatını (ilk ödeme veya aylık yenileme) uygular:
// cüzdanı planın creditAmount'una RESETLER (use-it-or-lose-it). Provider-bağımsız —
// iyzico/PayTR webhook adaptörleri çözdükleri (userId, planKey, ref, eventId) ile
// burayı çağırır. Idempotency + atomiklik DB tarafında (ff_apply_subscription_renewal).
//
// Döner: { applied, planKey, creditAmount } — applied=false ise olay zaten işlenmişti
// ya da plan tekrarlayan değil (free/once).
export async function applyPlanRenewal({
  provider = "iyzico",
  eventId,
  userId,
  subscriptionRef,
  planKey,
  periodEnd = null,
  label = "",
}) {
  const plan = getPlan(planKey);
  if (!plan) {
    throw new Error(`Bilinmeyen plan: ${planKey}`);
  }
  if (!isRecurringPlan(planKey)) {
    // Free/tek seferlik planlar yenilenmez.
    return { applied: false, reason: "non_recurring", planKey: plan.key };
  }
  if (!userId) {
    throw new Error("Kullanıcı kimliği gerekli.");
  }
  if (!eventId) {
    throw new Error("Olay kimliği gerekli.");
  }
  if (!subscriptionRef) {
    throw new Error("Abonelik referansı gerekli.");
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("ff_apply_subscription_renewal", {
    p_provider: provider,
    p_event_id: eventId,
    p_user_id: userId,
    p_subscription_ref: subscriptionRef,
    p_plan_key: plan.key,
    p_amount: plan.creditAmount,
    p_period_end: periodEnd,
    p_label: label || `Abonelik yenileme (${plan.key})`,
  });

  if (error) {
    throw new Error(error.message || "Abonelik yenileme uygulanamadı.");
  }

  return {
    applied: data === true,
    planKey: plan.key,
    creditAmount: plan.creditAmount,
  };
}
