import { createClient } from "@supabase/supabase-js";
import { loadConfig } from "../config/env.js";

let cachedAdminClient = null;
let cachedAuthClient = null;

function numericValue(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function cleanLimit(value, fallback = 200) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(500, Math.max(1, parsed));
}

export function getSupabaseAdminClient() {
  if (cachedAdminClient) return cachedAdminClient;

  const { supabaseUrl, supabaseServiceRoleKey } = loadConfig();
  cachedAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedAdminClient;
}

export function getSupabaseAuthClient() {
  if (cachedAuthClient) return cachedAuthClient;
  const { supabaseUrl, supabasePublishableKey } = loadConfig();
  cachedAuthClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedAuthClient;
}

export async function ensureUserCredits(userId) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("ff_ensure_user_credits", { p_user_id: userId });
  if (error) throw error;
  return Array.isArray(data) ? data[0] || null : data;
}

export async function readUserCredits(userId, options = {}) {
  const admin = getSupabaseAdminClient();
  await ensureUserCredits(userId);

  const nowIso = new Date().toISOString();
  const [{ data: walletRow, error: walletError }, transactionsResult, topupsResult] = await Promise.all([
    admin
      .from("ff_user_credits")
      .select("balance,plan_key,total_granted,spent,is_unlimited,updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    options.includeTransactions === false
      ? Promise.resolve({ data: [], error: null })
      : admin
          .from("ff_credit_transactions")
          .select("id,amount,balance_after,type,stage,job_id,label,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
    admin
      .from("ff_credit_topups")
      .select("amount_remaining,expires_at")
      .eq("user_id", userId)
      .gt("amount_remaining", 0)
      .gt("expires_at", nowIso)
      .order("expires_at", { ascending: true }),
  ]);

  if (walletError) throw walletError;
  if (transactionsResult.error) throw transactionsResult.error;
  if (topupsResult.error) throw topupsResult.error;

  const isUnlimited = Boolean(walletRow?.is_unlimited);
  const subscriptionBalance = numericValue(walletRow?.balance);
  const topupRows = Array.isArray(topupsResult.data) ? topupsResult.data : [];
  const topupBalance = topupRows.reduce((sum, row) => sum + numericValue(row.amount_remaining), 0);
  // Görünen bakiye = abonelik + geçerli (expire olmamış) top-up. Sınırsızda null.
  const balance = isUnlimited ? null : subscriptionBalance + topupBalance;

  return {
    balance,
    isUnlimited,
    planKey: walletRow?.plan_key || "free",
    subscriptionBalance: isUnlimited ? null : subscriptionBalance,
    topupBalance,
    topupNextExpiry: topupRows[0]?.expires_at || null,
    topups: topupRows.map((row) => ({
      amount: numericValue(row.amount_remaining),
      expiresAt: row.expires_at,
    })),
    totalGranted: walletRow?.is_unlimited ? null : numericValue(walletRow?.total_granted),
    spent: numericValue(walletRow?.spent),
    updatedAt: walletRow?.updated_at || null,
    transactions: Array.isArray(transactionsResult.data)
      ? transactionsResult.data.map((row) => ({
          id: row.id,
          amount: row.amount,
          balanceAfter: row.balance_after,
          type: row.type,
          stage: row.stage || "",
          jobId: row.job_id || "",
          label: row.label || "",
          createdAt: row.created_at,
        }))
      : [],
  };
}

async function listAuthUsers(admin, limit) {
  const users = [];
  let page = 1;

  while (users.length < limit && page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: Math.min(200, limit - users.length),
    });
    if (error) throw error;

    const pageUsers = data?.users || [];
    users.push(...pageUsers);
    if (pageUsers.length < 200) break;
    page += 1;
  }

  return users.slice(0, limit);
}

function transactionSummary(rows = []) {
  return rows.reduce(
    (summary, row) => {
      const amount = numericValue(row.amount);
      const type = String(row.type || "");
      const stage = String(row.stage || "other").trim() || "other";

      if (type === "spend") {
        summary.grossSpent += amount;
        summary.spendCount += 1;
        summary.stageBreakdown[stage] = (summary.stageBreakdown[stage] || 0) + amount;
        if (!summary.lastSpendAt || String(row.created_at || "") > summary.lastSpendAt) {
          summary.lastSpendAt = row.created_at || "";
        }
      } else if (type === "refund") {
        summary.refunds += amount;
      }

      return summary;
    },
    { grossSpent: 0, refunds: 0, spendCount: 0, lastSpendAt: "", stageBreakdown: {} }
  );
}

export async function listUserSpendingSummaries(options = {}) {
  const admin = getSupabaseAdminClient();
  const limit = cleanLimit(options.limit);
  const users = await listAuthUsers(admin, limit);
  const userIds = users.map((user) => user.id).filter(Boolean);
  const creditRowsByUserId = new Map();
  const transactionsByUserId = new Map();

  if (userIds.length) {
    const [{ data: creditRows, error: creditError }, { data: transactionRows, error: transactionError }] =
      await Promise.all([
        admin
          .from("ff_user_credits")
          .select("user_id,balance,plan_key,total_granted,spent,is_unlimited,updated_at")
          .in("user_id", userIds),
        admin
          .from("ff_credit_transactions")
          .select("user_id,amount,type,stage,created_at")
          .in("user_id", userIds)
          .in("type", ["spend", "refund"])
          .order("created_at", { ascending: false })
          .limit(5000),
      ]);

    if (creditError) throw creditError;
    if (transactionError) throw transactionError;

    (Array.isArray(creditRows) ? creditRows : []).forEach((row) => {
      creditRowsByUserId.set(row.user_id, row);
    });
    (Array.isArray(transactionRows) ? transactionRows : []).forEach((row) => {
      if (!transactionsByUserId.has(row.user_id)) transactionsByUserId.set(row.user_id, []);
      transactionsByUserId.get(row.user_id).push(row);
    });
  }

  const summaries = users.map((user) => {
    const wallet = creditRowsByUserId.get(user.id) || {};
    const transactions = transactionSummary(transactionsByUserId.get(user.id) || []);
    const isUnlimited = Boolean(wallet.is_unlimited);
    const spent = numericValue(wallet.spent, Math.max(0, transactions.grossSpent - transactions.refunds));

    return {
      userId: user.id,
      email: user.email || "",
      createdAt: user.created_at || "",
      lastSignInAt: user.last_sign_in_at || "",
      balance: isUnlimited ? null : numericValue(wallet.balance),
      isUnlimited,
      planKey: wallet.plan_key || "free",
      totalGranted: isUnlimited ? null : numericValue(wallet.total_granted),
      spent,
      grossSpent: transactions.grossSpent,
      refunds: transactions.refunds,
      spendCount: transactions.spendCount,
      lastSpendAt: transactions.lastSpendAt,
      stageBreakdown: transactions.stageBreakdown,
      updatedAt: wallet.updated_at || null,
    };
  });

  summaries.sort((left, right) => (
    right.spent - left.spent ||
    right.grossSpent - left.grossSpent ||
    String(left.email || "").localeCompare(String(right.email || ""))
  ));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      users: summaries.length,
      spent: summaries.reduce((sum, row) => sum + numericValue(row.spent), 0),
      grossSpent: summaries.reduce((sum, row) => sum + numericValue(row.grossSpent), 0),
      refunds: summaries.reduce((sum, row) => sum + numericValue(row.refunds), 0),
      spendCount: summaries.reduce((sum, row) => sum + numericValue(row.spendCount), 0),
    },
    users: summaries,
  };
}

export async function spendUserCredits({ userId, amount, stage, label, jobId = "" }) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: true, balance: null, isUnlimited: false, message: "" };
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("ff_spend_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_stage: stage || "",
    p_label: label || "",
    p_job_id: jobId || "",
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return {
    success: Boolean(row?.success),
    balance: row?.balance == null ? null : Number(row.balance),
    isUnlimited: Boolean(row?.is_unlimited),
    message: row?.message || "",
  };
}

export async function refundUserCredits({ userId, amount, stage, label, jobId = "" }) {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("ff_refund_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_stage: stage || "",
    p_label: label || "",
    p_job_id: jobId || "",
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return {
    balance: row?.balance == null ? null : Number(row.balance),
    isUnlimited: Boolean(row?.is_unlimited),
  };
}

export async function adminGrantCredits({ userId, amount, label, mode = "add", planKey = null, isUnlimited = null }) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("ff_admin_grant_credits", {
    p_user_id: userId,
    p_amount: Math.trunc(Number(amount) || 0),
    p_label: label || "Manuel yükleme",
    p_mode: normalizeCreditMode(mode),
    p_set_plan_key: planKey,
    p_set_unlimited: isUnlimited,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] || null : data;
}

export async function findUserIdById(userId) {
  const admin = getSupabaseAdminClient();
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) return "";

  const { data, error } = await admin.auth.admin.getUserById(safeUserId);
  if (error) {
    const status = Number(error.status || error.statusCode);
    const message = String(error.message || "").toLowerCase();
    if (status === 404 || message.includes("not found")) return "";
    throw error;
  }

  return data?.user?.id || "";
}

export async function findUserIdByEmail(email) {
  const admin = getSupabaseAdminClient();
  const trimmed = String(email || "").trim().toLowerCase();
  if (!trimmed) return "";

  let page = 1;
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    if (!users.length) return "";
    const match = users.find((user) => String(user.email || "").toLowerCase() === trimmed);
    if (match) return match.id;
    if (users.length < 200) return "";
    page += 1;
  }
  return "";
}

function normalizeCreditMode(value) {
  return String(value || "").trim().toLowerCase() === "set" ? "set" : "add";
}
