// Atelify stüdyo — tickets
// Destek talepleri (kullanıcı tarafı).
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


// ─── Destek (ticket) ─────────────────────────────────────────────────────────

const TICKET_STATUS_LABELS = {
  open: "Açık",
  answered: "Yanıtlandı",
  closed: "Kapatıldı",
};

let ticketsCache = [];
let ticketsLoaded = false;
let ticketsLastSignature = "";
let ticketPollTimer = null;
const TICKET_POLL_INTERVAL = 8000;

// Talep listesinin "değişti mi" imzası: yeni mesaj/durum değişimini ucuzca yakalar.
function computeTicketsSignature(tickets) {
  if (!Array.isArray(tickets)) return "";
  return tickets
    .map((ticket) => {
      const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
      const last = messages[messages.length - 1];
      const lastKey = last ? last.createdAt || last.id || last.body || "" : "";
      return `${ticket.id}:${ticket.status || ""}:${messages.length}:${lastKey}`;
    })
    .join("|");
}

function startTicketPolling() {
  stopTicketPolling();
  ticketPollTimer = window.setInterval(() => {
    if (document.hidden) return;
    loadAndRenderTickets({ force: true, silent: true });
  }, TICKET_POLL_INTERVAL);
}

function stopTicketPolling() {
  if (ticketPollTimer) {
    window.clearInterval(ticketPollTimer);
    ticketPollTimer = null;
  }
}

function formatTicketDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("tr-TR");
  } catch (error) {
    return "";
  }
}

function ticketMessageHtml(message) {
  const sender = message.sender === "admin" ? "admin" : "user";
  const label = sender === "admin" ? "Destek" : "Sen";
  return `
    <div class="ticket-message" data-sender="${sender}">
      ${escapeHtml(message.body || "")}
      <small>${escapeHtml(label)} · ${escapeHtml(formatTicketDate(message.createdAt))}</small>
    </div>
  `;
}

function ticketCardHtml(ticket) {
  const status = ticket.status || "open";
  const statusLabel = TICKET_STATUS_LABELS[status] || status;
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
  const thread = messages.map(ticketMessageHtml).join("");
  const reply = status === "closed"
    ? `<p class="ticket-closed-note">Bu talep kapatıldı.</p>`
    : `
      <form class="ticket-reply" data-ticket-reply-form data-ticket-id="${escapeHtml(ticket.id)}">
        <textarea name="message" rows="2" maxlength="4000" placeholder="Yanıt yaz…" required></textarea>
        <div class="cta-row">
          <button class="button button-primary" type="submit">Gönder</button>
        </div>
      </form>
    `;
  return `
    <div class="ticket-card" data-ticket-id="${escapeHtml(ticket.id)}">
      <button class="ticket-card-head" type="button" data-ticket-toggle aria-expanded="false">
        <span class="ticket-card-title">
          <strong>${escapeHtml(ticket.subject || "Destek talebi")}</strong>
          <small>${escapeHtml(formatTicketDate(ticket.updatedAt))} · ${messages.length} mesaj</small>
        </span>
        <span class="ticket-status" data-status="${escapeHtml(status)}">${escapeHtml(statusLabel)}</span>
      </button>
      <div class="ticket-card-body" hidden>
        <div class="ticket-thread">${thread}</div>
        ${reply}
      </div>
    </div>
  `;
}

function renderTickets(tickets) {
  const list = document.querySelector("[data-ticket-list]");
  const empty = document.querySelector("[data-ticket-empty]");
  if (!list || !empty) return;

  // Yeniden render sırasında açık kartları, yazılan taslakları ve odağı koru.
  const openIds = new Set();
  const drafts = new Map();
  list.querySelectorAll(".ticket-card").forEach((card) => {
    const id = card.dataset.ticketId;
    if (!id) return;
    const body = card.querySelector(".ticket-card-body");
    if (body && !body.hidden) openIds.add(id);
    const draft = card.querySelector('[data-ticket-reply-form] textarea[name="message"]');
    if (draft && draft.value) drafts.set(id, draft.value);
  });
  const focusedTicketId =
    document.activeElement?.closest?.(".ticket-card")?.dataset.ticketId || null;

  if (!tickets || !tickets.length) {
    list.innerHTML = "";
    list.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  list.hidden = false;
  list.innerHTML = tickets.map(ticketCardHtml).join("");

  // Önceki açık/taslak durumunu geri yükle.
  openIds.forEach((id) => {
    const card = list.querySelector(`.ticket-card[data-ticket-id="${CSS.escape(id)}"]`);
    if (!card) return;
    card.querySelector("[data-ticket-toggle]")?.setAttribute("aria-expanded", "true");
    const body = card.querySelector(".ticket-card-body");
    if (body) body.hidden = false;
  });
  drafts.forEach((value, id) => {
    const textarea = list.querySelector(
      `.ticket-card[data-ticket-id="${CSS.escape(id)}"] textarea[name="message"]`
    );
    if (textarea) textarea.value = value;
  });
  // Açık kartların mesaj akışını en alta kaydır (chat hissi).
  list.querySelectorAll(".ticket-card-body:not([hidden]) .ticket-thread").forEach((thread) => {
    thread.scrollTop = thread.scrollHeight;
  });
  // Kullanıcı yanıt yazıyorsa odağı geri ver (imleci sona al).
  if (focusedTicketId) {
    const textarea = list.querySelector(
      `.ticket-card[data-ticket-id="${CSS.escape(focusedTicketId)}"] textarea[name="message"]`
    );
    if (textarea) {
      const end = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(end, end);
    }
  }
}

async function loadAndRenderTickets({ force = false, silent = false } = {}) {
  if (ticketsLoaded && !force) {
    renderTickets(ticketsCache);
    return;
  }
  try {
    const { payload, response } = await studioApi.listTickets();
    if (!response.ok) {
      // Polling sırasında sessiz geçici hatalarda ekranı bozma.
      if (silent) return;
      if (response.status !== 401) {
        showStudioToast(payload?.error || "Destek talepleri okunamadı.", "error");
      }
      renderTickets([]);
      return;
    }
    const tickets = Array.isArray(payload?.tickets) ? payload.tickets : [];
    const signature = computeTicketsSignature(tickets);
    ticketsCache = tickets;
    ticketsLoaded = true;
    // Polling'de veri değişmediyse DOM'a hiç dokunma (yazıyı/odak/scroll'u koru).
    if (silent && signature === ticketsLastSignature) return;
    ticketsLastSignature = signature;
    renderTickets(ticketsCache);
  } catch (error) {
    console.warn("[tickets] fetch failed", error);
    if (!silent) renderTickets([]);
  }
}

function toggleTicketForm(show) {
  const form = document.querySelector("[data-ticket-form]");
  const newButton = document.querySelector("[data-ticket-new]");
  if (!form) return;
  form.hidden = !show;
  if (newButton) newButton.hidden = show;
  if (show) {
    const errorBox = form.querySelector("[data-ticket-form-error]");
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }
    form.querySelector('input[name="subject"]')?.focus();
  }
}

async function submitNewTicket(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = form.querySelector("[data-ticket-form-error]");
  const submitButton = form.querySelector("[data-ticket-submit]");
  const formData = new FormData(form);
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (errorBox) {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }
  if (!subject || !message) {
    if (errorBox) {
      errorBox.textContent = "Konu ve mesaj gerekli.";
      errorBox.hidden = false;
    }
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Gönderiliyor…";
  try {
    const { payload, response } = await studioApi.submitTicket({ subject, message });
    if (!response.ok) {
      if (errorBox) {
        errorBox.textContent = payload?.error || "Gönderilemedi.";
        errorBox.hidden = false;
      }
      return;
    }
    form.reset();
    toggleTicketForm(false);
    await loadAndRenderTickets({ force: true });
  } catch (error) {
    if (errorBox) {
      errorBox.textContent = error?.message || "Beklenmeyen bir hata oluştu.";
      errorBox.hidden = false;
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Gönder";
  }
}

async function submitTicketReply(form) {
  const ticketId = form.dataset.ticketId;
  const textarea = form.querySelector('textarea[name="message"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const message = String(textarea?.value || "").trim();
  if (!ticketId || !message) return;

  submitButton.disabled = true;
  submitButton.textContent = "Gönderiliyor…";
  try {
    const { payload, response } = await studioApi.submitTicket({ ticketId, message });
    if (!response.ok) {
      showStudioToast(payload?.error || "Mesaj gönderilemedi.", "error");
      return;
    }
    // Gönderilen metnin taslak olarak geri dolmaması için textarea'yı temizle.
    if (textarea) textarea.value = "";
    await loadAndRenderTickets({ force: true });
    // Yeniden render sonrası ilgili kartı açık tut.
    const card = document.querySelector(`.ticket-card[data-ticket-id="${CSS.escape(ticketId)}"]`);
    if (card) {
      card.querySelector("[data-ticket-toggle]")?.setAttribute("aria-expanded", "true");
      const body = card.querySelector(".ticket-card-body");
      if (body) body.hidden = false;
    }
  } catch (error) {
    showStudioToast(error?.message || "Beklenmeyen bir hata oluştu.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Gönder";
  }
}

function initTicketUi() {
  document.querySelector("[data-ticket-new]")?.addEventListener("click", () => toggleTicketForm(true));
  document.querySelector("[data-ticket-cancel]")?.addEventListener("click", () => {
    document.querySelector("[data-ticket-form]")?.reset();
    toggleTicketForm(false);
  });
  document.querySelector("[data-ticket-form]")?.addEventListener("submit", submitNewTicket);

  // Sekme yeniden görünür olunca (örn. başka tab'dan dönünce) anında tazele.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && ticketPollTimer) {
      loadAndRenderTickets({ force: true, silent: true });
    }
  });

  const list = document.querySelector("[data-ticket-list]");
  if (list) {
    list.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-ticket-toggle]");
      if (!toggle) return;
      const body = toggle.parentElement?.querySelector(".ticket-card-body");
      if (!body) return;
      const open = body.hidden;
      body.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    list.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-ticket-reply-form]");
      if (!form) return;
      event.preventDefault();
      submitTicketReply(form);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTicketUi);
} else {
  initTicketUi();
}

// ─── Admin: üretim talepleri yönetimi ───────────────────────────────────────
let adminRequestsCache = null;
