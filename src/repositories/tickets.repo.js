import { getSupabaseAdminClient } from "./credits.repo.js";

const TICKETS = "ff_tickets";
const MESSAGES = "ff_ticket_messages";

function rowToMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    ticketId: row.ticket_id,
    userId: row.user_id,
    sender: row.sender,
    body: row.body || "",
    createdAt: row.created_at,
  };
}

function rowToTicket(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject || "",
    status: row.status,
    lastSender: row.last_sender || "user",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: Array.isArray(row.ff_ticket_messages)
      ? row.ff_ticket_messages.map(rowToMessage).filter(Boolean).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      : [],
  };
}

// Yeni ticket = ticket satırı + ilk mesaj. İki insert; mesaj başarısız olursa
// boş ticket kalmasın diye ticket geri silinir.
export async function insertTicketWithMessage({ userId, subject, body }) {
  const admin = getSupabaseAdminClient();
  const { data: ticket, error: ticketError } = await admin
    .from(TICKETS)
    .insert({ user_id: userId, subject: subject || "", status: "open", last_sender: "user" })
    .select("*")
    .single();
  if (ticketError) throw ticketError;

  const { error: messageError } = await admin
    .from(MESSAGES)
    .insert({ ticket_id: ticket.id, user_id: userId, sender: "user", body });
  if (messageError) {
    await admin.from(TICKETS).delete().eq("id", ticket.id);
    throw messageError;
  }

  return readTicket({ id: ticket.id });
}

// Bir ticket'a mesaj ekler ve ticket'ın durum/son-gönderen alanlarını günceller.
export async function appendTicketMessage({ ticketId, userId, sender, body, status }) {
  const admin = getSupabaseAdminClient();
  const { error: messageError } = await admin
    .from(MESSAGES)
    .insert({ ticket_id: ticketId, user_id: userId, sender, body });
  if (messageError) throw messageError;

  const { error: ticketError } = await admin
    .from(TICKETS)
    .update({ status, last_sender: sender })
    .eq("id", ticketId);
  if (ticketError) throw ticketError;

  return readTicket({ id: ticketId });
}

export async function readTicket({ id, userId }) {
  const admin = getSupabaseAdminClient();
  const query = admin.from(TICKETS).select("*, ff_ticket_messages(*)").eq("id", id);
  if (userId) query.eq("user_id", userId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return rowToTicket(data);
}

export async function listTicketsByUser(userId, options = {}) {
  const admin = getSupabaseAdminClient();
  const limit = Math.min(100, Math.max(1, Number.parseInt(options.limit, 10) || 50));
  const { data, error } = await admin
    .from(TICKETS)
    .select("*, ff_ticket_messages(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map(rowToTicket).filter(Boolean);
}

export async function listAllTickets(filters = {}) {
  const admin = getSupabaseAdminClient();
  const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit, 10) || 100));
  let query = admin
    .from(TICKETS)
    .select("*, ff_ticket_messages(*)")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  const { data, error } = await query;
  if (error) throw error;
  return (Array.isArray(data) ? data : []).map(rowToTicket).filter(Boolean);
}

export async function updateTicketStatus(id, status) {
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from(TICKETS).update({ status }).eq("id", id);
  if (error) throw error;
  return readTicket({ id });
}
