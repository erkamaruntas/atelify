import { getSupabaseAdminClient } from "../repositories/credits.repo.js";
import {
  readGenerationJob,
  sanitizeClientJobId,
} from "../repositories/generation-jobs.repo.js";

const IDEMPOTENCY_TABLE = "idempotency_keys";
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function cleanUserId(value) {
  return String(value || "").trim();
}

function rowToIdempotencyKey(row) {
  if (!row) return null;
  return {
    key: row.key || "",
    userId: row.user_id || "",
    responsePayload: row.response_payload || null,
    createdAt: row.created_at || null,
    expiresAt: row.expires_at || null,
  };
}

function isDuplicateKeyError(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return code === "23505" || message.includes("duplicate key");
}

function isMissingIdempotencyTableError(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    (message.includes("idempotency_keys") &&
      (message.includes("schema cache") ||
        message.includes("could not find") ||
        message.includes("does not exist")))
  );
}

function isStoredResponse(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Number.isInteger(value.status) &&
    value.payload &&
    typeof value.payload === "object" &&
    !Array.isArray(value.payload)
  );
}

function withIdempotentFlag(response) {
  if (!response?.payload || typeof response.payload !== "object" || Array.isArray(response.payload)) {
    return response;
  }
  return {
    status: response.status,
    payload: {
      ...response.payload,
      idempotent: true,
    },
  };
}

function pendingResponse({ key, stage, job, pendingPayload }) {
  const payload = {
    clientJobId: key,
    idempotent: true,
    pending: true,
    stage: job?.stage || stage || "",
    ...pendingPayload,
  };

  if (job?.requestId) payload.requestId = job.requestId;
  if (job?.status) payload.status = job.status;

  return { status: 202, payload };
}

async function deleteExpiredKey(admin, key) {
  const { error } = await admin
    .from(IDEMPOTENCY_TABLE)
    .delete()
    .eq("key", key)
    .lt("expires_at", new Date().toISOString());
  if (error) throw error;
}

async function readIdempotencyKey(admin, key) {
  const { data, error } = await admin
    .from(IDEMPOTENCY_TABLE)
    .select("*")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return rowToIdempotencyKey(data);
}

async function claimIdempotencyKey({ key, userId }) {
  const admin = getSupabaseAdminClient();
  await deleteExpiredKey(admin, key);

  const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MS).toISOString();
  const { data, error } = await admin
    .from(IDEMPOTENCY_TABLE)
    .insert({
      key,
      user_id: userId,
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (!error) return { claimed: true, row: rowToIdempotencyKey(data) };
  if (!isDuplicateKeyError(error)) throw error;

  return {
    claimed: false,
    row: await readIdempotencyKey(admin, key),
  };
}

async function storeIdempotencyResponse({ key, userId, response }) {
  const admin = getSupabaseAdminClient();
  const responsePayload = {
    payload: response?.payload && typeof response.payload === "object" ? response.payload : {},
    status: Number.isInteger(response?.status) ? response.status : 500,
    stored_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from(IDEMPOTENCY_TABLE)
    .update({ response_payload: responsePayload })
    .eq("key", key)
    .eq("user_id", userId);

  if (error) throw error;
}

async function duplicateResponse({ key, pendingPayload, row, stage, userId }) {
  if (!row) {
    return pendingResponse({ key, pendingPayload, stage });
  }

  if (row.userId && row.userId !== userId) {
    return {
      status: 403,
      payload: { error: "Bu üretim başka bir kullanıcıya ait." },
    };
  }

  if (isStoredResponse(row.responsePayload)) {
    return withIdempotentFlag(row.responsePayload);
  }

  const job = await readGenerationJob(key);
  if (job?.userId && job.userId !== userId) {
    return {
      status: 403,
      payload: { error: "Bu üretim başka bir kullanıcıya ait." },
    };
  }
  if (job?.status === "completed" && job.result) {
    return withIdempotentFlag({ status: 200, payload: job.result });
  }
  if (["failed", "cancelled"].includes(job?.status)) {
    return {
      status: 409,
      payload: {
        clientJobId: key,
        error: job.error || "Bu idempotent üretim isteği tamamlanamadı.",
        idempotent: true,
        stage: job.stage || stage || "",
        status: job.status,
      },
    };
  }

  return pendingResponse({ key, pendingPayload, stage, job });
}

async function finalizeIdempotentResponse({ key, userId }, response) {
  try {
    await storeIdempotencyResponse({ key, userId, response });
  } catch (error) {
    console.warn("[idempotency] response store failed", error);
  }
  return response;
}

export async function createGenerationIdempotency({
  clientJobId,
  pendingPayload = {},
  stage,
  userId,
} = {}) {
  const key = sanitizeClientJobId(clientJobId);
  const safeUserId = cleanUserId(userId);

  if (!key || !safeUserId) {
    return {
      finalize: async (response) => response,
      key: "",
      proceed: true,
    };
  }

  try {
    const claim = await claimIdempotencyKey({ key, userId: safeUserId });
    if (!claim.claimed) {
      return {
        key,
        proceed: false,
        response: await duplicateResponse({
          key,
          pendingPayload,
          row: claim.row,
          stage,
          userId: safeUserId,
        }),
      };
    }

    return {
      finalize: (response) => finalizeIdempotentResponse({ key, userId: safeUserId }, response),
      key,
      proceed: true,
    };
  } catch (error) {
    if (isMissingIdempotencyTableError(error)) {
      console.warn(
        "[idempotency] idempotency_keys table is unavailable; falling back to generation_jobs claim.",
        error
      );
      return {
        finalize: async (response) => response,
        key,
        proceed: true,
      };
    }

    console.error("[idempotency] claim failed", error);
    return {
      key,
      proceed: false,
      response: {
        status: 500,
        payload: { error: "İstek güvenli biçimde başlatılamadı." },
      },
    };
  }
}
