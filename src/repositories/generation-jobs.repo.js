import { loadConfig } from "../config/env.js";

const GENERATION_JOBS_TABLE = "ff_generation_jobs";
const MAX_MEMORY_JOBS = 200;

function memoryStore() {
  if (!globalThis.__ffGenerationJobs) {
    globalThis.__ffGenerationJobs = new Map();
  }
  return globalThis.__ffGenerationJobs;
}

export function sanitizeClientJobId(value) {
  const id = String(value || "").trim();
  return /^[a-zA-Z0-9_.:-]{8,160}$/.test(id) ? id : "";
}

export function sanitizeGenerationStage(value) {
  const stage = String(value || "").trim().toLowerCase();
  return ["sketch", "finish", "mockup", "manken"].includes(stage) ? stage : "";
}

export function sanitizeGenerationCount(stage, value) {
  if (stage === "finish") return Number.parseInt(value, 10) === 4 ? 4 : 1;
  if (stage === "mockup" || stage === "manken") return Number.parseInt(value, 10) === 4 ? 4 : 1;
  return Number.parseInt(value, 10) === 4 ? 4 : 1;
}

export function sanitizeGenerationJobContext(value) {
  const context = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    creditCost: sanitizeNonNegativeInteger(context.creditCost),
    label: String(context.label || "").trim().slice(0, 160),
    metadata: sanitizeJobMetadata(context.metadata),
    projectId: String(context.projectId || "").trim().slice(0, 180),
    projectTitle: String(context.projectTitle || "").trim().slice(0, 180),
  };
}

export function sanitizeGenerationJob(job) {
  if (!job || typeof job !== "object") return null;

  const clientJobId = sanitizeClientJobId(job.clientJobId || job.client_job_id);
  const stage = sanitizeGenerationStage(job.stage);
  if (!clientJobId || !stage) return null;

  const createdAt = validIsoDate(job.createdAt || job.created_at) || new Date().toISOString();
  const userId = sanitizeUserId(job.userId || job.user_id);
  return {
    clientJobId,
    count: sanitizeGenerationCount(stage, job.count),
    createdAt,
    creditCost: sanitizeNonNegativeInteger(job.creditCost || job.credit_cost),
    deliveredAt: validIsoDate(job.deliveredAt || job.delivered_at) || "",
    error: String(job.error || "").trim(),
    label: String(job.label || "").trim(),
    metadata: sanitizeJobMetadata(job.metadata),
    projectId: String(job.projectId || job.project_id || "").trim(),
    projectTitle: String(job.projectTitle || job.project_title || "").trim(),
    requestId: String(job.requestId || job.request_id || "").trim(),
    result: job.result && typeof job.result === "object" ? job.result : null,
    stage,
    status: sanitizeGenerationStatus(job.status),
    updatedAt: validIsoDate(job.updatedAt || job.updated_at) || createdAt,
    userId,
  };
}

export async function readGenerationJob(clientJobId) {
  const safeClientJobId = sanitizeClientJobId(clientJobId);
  if (!safeClientJobId) return null;

  const supabaseConfig = supabaseRestConfig();
  if (supabaseConfig) {
    try {
      return await readSupabaseGenerationJob(supabaseConfig, safeClientJobId);
    } catch (error) {
      handleSupabaseFailure("read", error);
    }
  }

  return memoryStore().get(safeClientJobId) || null;
}

export async function upsertGenerationJob(job) {
  const sanitizedJob = sanitizeGenerationJob(job);
  if (!sanitizedJob) return null;

  const nextJob = {
    ...sanitizedJob,
    updatedAt: new Date().toISOString(),
  };

  const supabaseConfig = supabaseRestConfig();
  if (supabaseConfig) {
    try {
      await upsertSupabaseGenerationJob(supabaseConfig, nextJob);
    } catch (error) {
      handleSupabaseFailure("upsert", error);
    }
  }

  upsertMemoryGenerationJob(nextJob);
  return nextJob;
}

export async function listRecoverableGenerationJobs(userId, options = {}) {
  const safeUserId = sanitizeUserId(userId);
  if (!safeUserId) return [];

  const supabaseConfig = supabaseRestConfig();
  if (supabaseConfig) {
    try {
      return await listSupabaseRecoverableGenerationJobs(supabaseConfig, safeUserId, options);
    } catch (error) {
      handleSupabaseFailure("recoverable list", error);
    }
  }

  const limit = sanitizeListLimit(options.limit);
  return Array.from(memoryStore().values())
    .map(sanitizeGenerationJob)
    .filter(Boolean)
    .filter((job) => job.userId === safeUserId && isRecoverableGenerationJob(job))
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, limit);
}

export async function claimGenerationJob(job) {
  const sanitizedJob = sanitizeGenerationJob(job);
  if (!sanitizedJob) return { claimed: false, job: null };

  const nextJob = {
    ...sanitizedJob,
    updatedAt: new Date().toISOString(),
  };

  const supabaseConfig = supabaseRestConfig();
  if (supabaseConfig) {
    try {
      const inserted = await insertSupabaseGenerationJob(supabaseConfig, nextJob);
      if (inserted) {
        upsertMemoryGenerationJob(inserted);
        return { claimed: true, job: inserted };
      }
      const existing = await readSupabaseGenerationJob(supabaseConfig, sanitizedJob.clientJobId);
      if (existing) upsertMemoryGenerationJob(existing);
      return { claimed: false, job: existing };
    } catch (error) {
      handleSupabaseFailure("claim", error);
    }
  }

  const store = memoryStore();
  const existing = store.get(sanitizedJob.clientJobId);
  if (existing) return { claimed: false, job: existing };
  upsertMemoryGenerationJob(nextJob);
  return { claimed: true, job: nextJob };
}

export function isLiveGenerationStatus(status) {
  return ["submitting", "queued", "running", "completed"].includes(String(status || "").toLowerCase());
}

export async function patchGenerationJob(clientJobId, patch) {
  const safeClientJobId = sanitizeClientJobId(clientJobId);
  if (!safeClientJobId) return null;

  const existingJob = await readGenerationJob(safeClientJobId);
  if (!existingJob) return null;

  return upsertGenerationJob({
    ...existingJob,
    ...patch,
    clientJobId: safeClientJobId,
    createdAt: existingJob.createdAt,
    stage: patch?.stage || existingJob.stage,
  });
}

function upsertMemoryGenerationJob(job) {
  const store = memoryStore();
  store.set(job.clientJobId, job);

  if (store.size <= MAX_MEMORY_JOBS) return;

  const sortedJobs = Array.from(store.values()).sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
  sortedJobs.slice(MAX_MEMORY_JOBS).forEach((oldJob) => store.delete(oldJob.clientJobId));
}

function handleSupabaseFailure(operation, error) {
  if (!allowsMemoryFallbackOnSupabaseFailure()) {
    const message = error?.message || String(error || "unknown error");
    const wrapped = new Error(
      `[generation-jobs] Supabase ${operation} failed; in-memory fallback is disabled for hosted/production environments. ${message}`
    );
    wrapped.cause = error;
    throw wrapped;
  }

  console.warn(`[generation-jobs] Supabase ${operation} failed; falling back to memory.`, error);
}

function allowsMemoryFallbackOnSupabaseFailure() {
  if (truthyEnv("FF_ALLOW_GENERATION_MEMORY_FALLBACK")) return true;
  if (truthyEnv("FF_DISABLE_GENERATION_MEMORY_FALLBACK")) return false;

  const vercelEnv = String(process.env.VERCEL_ENV || "").trim().toLowerCase();
  const nodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const isHostedVercel = truthyEnv("VERCEL");

  return !isHostedVercel && vercelEnv !== "production" && nodeEnv !== "production";
}

function truthyEnv(name) {
  return ["1", "true", "yes", "on"].includes(String(process.env[name] || "").trim().toLowerCase());
}

function supabaseRestConfig() {
  if (typeof fetch !== "function") return null;
  const { supabaseUrl, supabaseServiceRoleKey } = loadConfig();

  return {
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
    },
    restUrl: `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/${GENERATION_JOBS_TABLE}`,
  };
}

async function readSupabaseGenerationJob(config, clientJobId) {
  const url = `${config.restUrl}?client_job_id=eq.${encodeURIComponent(clientJobId)}&select=*`;
  const response = await fetch(url, {
    headers: config.headers,
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = await response.json();
  return normalizeSupabaseRow(Array.isArray(rows) ? rows[0] : null);
}

async function listSupabaseRecoverableGenerationJobs(config, userId, options = {}) {
  const params = new URLSearchParams({
    delivered_at: "is.null",
    limit: String(sanitizeListLimit(options.limit)),
    order: "updated_at.desc",
    select: "*",
    status: "in.(submitting,queued,running,completed)",
    user_id: `eq.${userId}`,
  });
  const response = await fetch(`${config.restUrl}?${params.toString()}`, {
    headers: config.headers,
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = await response.json();
  return (Array.isArray(rows) ? rows : []).map(normalizeSupabaseRow).filter(Boolean);
}

async function insertSupabaseGenerationJob(config, job) {
  const response = await fetch(`${config.restUrl}?on_conflict=client_job_id`, {
    body: JSON.stringify(toSupabaseRow(job)),
    headers: {
      ...config.headers,
      Prefer: "resolution=ignore-duplicates,return=representation",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return normalizeSupabaseRow(rows[0]);
}

async function upsertSupabaseGenerationJob(config, job) {
  const response = await fetch(`${config.restUrl}?on_conflict=client_job_id`, {
    body: JSON.stringify(toSupabaseRow(job)),
    headers: {
      ...config.headers,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

function toSupabaseRow(job) {
  return {
    client_job_id: job.clientJobId,
    count: job.count,
    created_at: job.createdAt,
    credit_cost: job.creditCost || 0,
    delivered_at: job.deliveredAt || null,
    error: job.error || "",
    label: job.label || "",
    metadata: job.metadata || {},
    project_id: job.projectId || "",
    project_title: job.projectTitle || "",
    request_id: job.requestId || "",
    result: job.result || null,
    stage: job.stage,
    status: job.status,
    updated_at: job.updatedAt,
    user_id: job.userId || null,
  };
}

function normalizeSupabaseRow(row) {
  if (!row) return null;
  return sanitizeGenerationJob({
    clientJobId: row.client_job_id,
    count: row.count,
    createdAt: row.created_at,
    creditCost: row.credit_cost,
    deliveredAt: row.delivered_at,
    error: row.error,
    label: row.label,
    metadata: row.metadata,
    projectId: row.project_id,
    projectTitle: row.project_title,
    requestId: row.request_id,
    result: row.result,
    stage: row.stage,
    status: row.status,
    updatedAt: row.updated_at,
    userId: row.user_id,
  });
}

function sanitizeGenerationStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (["submitting", "queued", "running", "completed", "failed", "cancelled"].includes(status)) return status;
  return "submitting";
}

function validIsoDate(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function sanitizeUserId(value) {
  const id = String(value || "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ? id
    : "";
}

function sanitizeJobMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return {};
  }
}

function sanitizeNonNegativeInteger(value) {
  const numberValue = Number.parseInt(value, 10);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function sanitizeListLimit(value) {
  const numberValue = Number.parseInt(value, 10);
  if (!Number.isFinite(numberValue)) return 20;
  return Math.min(50, Math.max(1, numberValue));
}

function isRecoverableGenerationJob(job) {
  if (!job || job.deliveredAt) return false;
  return ["submitting", "queued", "running", "completed"].includes(job.status);
}
