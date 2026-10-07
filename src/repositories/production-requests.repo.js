import { getSupabaseAdminClient } from "./credits.repo.js";

const TABLE = "ff_production_requests";

function rowToRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    designId: row.design_id || null,
    designRef: row.design_ref || "",
    designSnapshot: row.design_snapshot || {},
    status: row.status,
    product: row.product || "",
    productShape: row.product_shape || "",
    metal: row.metal || "",
    sizeKey: row.size_key || "",
    sizeLabel: row.size_label || "",
    quantity: Number(row.quantity) || 1,
    customerNote: row.customer_note || "",
    contactInfo: row.contact_info || {},
    internalNote: row.internal_note || "",
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertProductionRequest(input) {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from(TABLE)
    .insert({
      user_id: input.userId,
      design_id: input.designId || null,
      design_ref: input.designRef || "",
      design_snapshot: input.designSnapshot || {},
      status: "pending",
      product: input.product || "",
      product_shape: input.productShape || "",
      metal: input.metal || "",
      size_key: input.sizeKey || "",
      size_label: input.sizeLabel || "",
      quantity: input.quantity || 1,
      customer_note: input.customerNote || "",
      contact_info: input.contactInfo || {},
      metadata: input.metadata || {},
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToRequest(data);
}

export async function listProductionRequestsByUser(userId, options = {}) {
  const admin = getSupabaseAdminClient();
  const limit = Math.min(100, Math.max(1, Number.parseInt(options.limit, 10) || 50));
  const { data, error } = await admin
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (Array.isArray(data) ? data : []).map(rowToRequest).filter(Boolean);
}

export async function readProductionRequest({ id, userId }) {
  const admin = getSupabaseAdminClient();
  const query = admin.from(TABLE).select("*").eq("id", id);
  if (userId) query.eq("user_id", userId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return rowToRequest(data);
}

export async function listAllProductionRequests(filters = {}) {
  const admin = getSupabaseAdminClient();
  const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit, 10) || 100));
  let query = admin.from(TABLE).select("*").order("created_at", { ascending: false }).limit(limit);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.userId) query = query.eq("user_id", filters.userId);

  const { data, error } = await query;
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map(rowToRequest).filter(Boolean);
}

export async function updateProductionRequest(id, patch) {
  const admin = getSupabaseAdminClient();
  const updates = {};
  if (typeof patch.status === "string") updates.status = patch.status;
  if (typeof patch.internalNote === "string") updates.internal_note = patch.internalNote;
  if (patch.metadata && typeof patch.metadata === "object") updates.metadata = patch.metadata;
  if (!Object.keys(updates).length) {
    return readProductionRequest({ id });
  }
  const { data, error } = await admin
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToRequest(data);
}
