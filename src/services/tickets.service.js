import {
  appendTicketMessage,
  insertTicketWithMessage,
  listAllTickets,
  listTicketsByUser,
  readTicket,
  updateTicketStatus,
} from "../repositories/tickets.repo.js";
import { listProfilesByUserIds } from "../repositories/profiles.repo.js";
import {
  assertAllContentAllowed,
  isContentModerationError,
} from "../lib/content-moderation.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("tickets");

const MAX_SUBJECT = 200;
const MAX_BODY = 4000;
const ADMIN_ALLOWED_STATUSES = ["open", "answered", "closed"];

function trimString(value, max) {
  return String(value || "").trim().slice(0, max);
}

function moderationResult(error) {
  return { status: error.statusCode || 422, payload: { code: error.code, error: error.message } };
}

export async function createTicket({ user, body }) {
  if (!user?.id) {
    return { status: 401, payload: { error: "Oturum doğrulanamadı." } };
  }
  const safeBody = body && typeof body === "object" ? body : {};
  const subject = trimString(safeBody.subject, MAX_SUBJECT);
  const message = trimString(safeBody.message || safeBody.body, MAX_BODY);

  if (!subject) return { status: 400, payload: { error: "Konu gerekli." } };
  if (!message) return { status: 400, payload: { error: "Mesaj gerekli." } };

  try {
    assertAllContentAllowed([
      { value: subject, field: "subject" },
      { value: message, field: "message" },
    ]);
  } catch (error) {
    if (isContentModerationError(error)) return moderationResult(error);
    throw error;
  }

  try {
    const ticket = await insertTicketWithMessage({ userId: user.id, subject, body: message });
    return { status: 201, payload: { ticket } };
  } catch (error) {
    log.error("create failed", { error, op: "create" });
    return { status: 500, payload: { error: "Destek talebi kaydedilemedi.", detail: error?.message || "" } };
  }
}

export async function replyToTicket({ user, body }) {
  if (!user?.id) {
    return { status: 401, payload: { error: "Oturum doğrulanamadı." } };
  }
  const safeBody = body && typeof body === "object" ? body : {};
  const ticketId = trimString(safeBody.ticketId, 80);
  const message = trimString(safeBody.message || safeBody.body, MAX_BODY);

  if (!ticketId) return { status: 400, payload: { error: "Talep id eksik." } };
  if (!message) return { status: 400, payload: { error: "Mesaj gerekli." } };

  try {
    assertAllContentAllowed([{ value: message, field: "message" }]);
  } catch (error) {
    if (isContentModerationError(error)) return moderationResult(error);
    throw error;
  }

  try {
    const existing = await readTicket({ id: ticketId, userId: user.id });
    if (!existing) return { status: 404, payload: { error: "Talep bulunamadı." } };
    if (existing.status === "closed") {
      return { status: 409, payload: { error: "Bu talep kapatılmış." } };
    }
    const ticket = await appendTicketMessage({
      ticketId,
      userId: user.id,
      sender: "user",
      body: message,
      status: "open",
    });
    return { status: 200, payload: { ticket } };
  } catch (error) {
    log.error("reply failed", { error, op: "reply" });
    return { status: 500, payload: { error: "Mesaj gönderilemedi.", detail: error?.message || "" } };
  }
}

export async function listTickets({ user, limit = 50 }) {
  if (!user?.id) {
    return { status: 401, payload: { error: "Oturum doğrulanamadı." } };
  }
  try {
    const tickets = await listTicketsByUser(user.id, { limit });
    return { status: 200, payload: { tickets } };
  } catch (error) {
    log.error("list failed", { error, op: "list" });
    return { status: 500, payload: { error: "Destek talepleri okunamadı.", detail: error?.message || "" } };
  }
}

export async function adminListAllTickets({ filters = {} } = {}) {
  const normalized = {
    limit: filters.limit,
    status: ADMIN_ALLOWED_STATUSES.includes(filters.status) ? filters.status : "",
    userId: typeof filters.userId === "string" ? filters.userId.trim() : "",
  };
  try {
    const tickets = await listAllTickets(normalized);
    const enriched = await attachTicketUserInfo(tickets);
    return { status: 200, payload: { tickets: enriched } };
  } catch (error) {
    log.error("admin list failed", { error, op: "admin_list" });
    return { status: 500, payload: { error: "Destek talepleri okunamadı.", detail: error?.message || "" } };
  }
}

// Admin listesi için her ticket'a sahip e-postası ve (varsa) ismini ekler.
async function attachTicketUserInfo(tickets) {
  if (!Array.isArray(tickets) || !tickets.length) return tickets || [];
  const userIds = tickets.map((ticket) => ticket.userId).filter(Boolean);
  let byUserId = new Map();
  try {
    const profiles = await listProfilesByUserIds(userIds);
    byUserId = new Map(profiles.map((profile) => [profile.userId, profile]));
  } catch (error) {
    // Profil okunamazsa ticket'ları yine de id ile döndür.
    log.warn("admin list profile enrich failed", { error, op: "admin_list_enrich" });
  }
  return tickets.map((ticket) => {
    const profile = byUserId.get(ticket.userId);
    const name = profile
      ? profile.displayName ||
        [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
        profile.brandName ||
        ""
      : "";
    return {
      ...ticket,
      userEmail: profile?.email || "",
      userName: name,
    };
  });
}

// Admin cevabı (mesaj) ve/veya durum güncellemesi tek çağrıda yapılabilir.
export async function adminReplyToTicket({ admin, id, patch }) {
  const safeId = String(id || "").trim();
  if (!safeId) return { status: 400, payload: { error: "Talep id eksik." } };

  const message = trimString(patch?.message, MAX_BODY);
  const status = patch?.status && ADMIN_ALLOWED_STATUSES.includes(patch.status) ? patch.status : "";
  if (!message && !status) {
    return { status: 400, payload: { error: "Cevap veya durum gerekli." } };
  }

  try {
    const existing = await readTicket({ id: safeId });
    if (!existing) return { status: 404, payload: { error: "Talep bulunamadı." } };

    let ticket = existing;
    if (message) {
      ticket = await appendTicketMessage({
        // Mesaj satırının user_id'si auth.users'a FK; admin API-key oturumunun
        // id'si geçerli bir uuid değil. Bu yüzden satırı ticket sahibine bağlar,
        // admin'i sender='admin' ile ayırırız.
        ticketId: safeId,
        userId: existing.userId,
        sender: "admin",
        body: message,
        // Cevap sonrası açıkça bir durum verilmemişse "answered".
        status: status || "answered",
      });
    } else if (status) {
      ticket = await updateTicketStatus(safeId, status);
    }
    return { status: 200, payload: { ticket } };
  } catch (error) {
    log.error("admin reply failed", { error, op: "admin_reply" });
    return { status: 500, payload: { error: "Talep güncellenemedi.", detail: error?.message || "" } };
  }
}
