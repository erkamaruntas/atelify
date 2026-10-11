// Atelify stüdyo — admin-panel
// Yönetim paneli: üretim talepleri, destek talepleri ve kullanıcı görselleri.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function renderAdminRequestsTable(requests) {
  const tbody = document.querySelector("[data-admin-request-tbody]");
  const empty = document.querySelector("[data-admin-request-empty]");
  const wrap = document.querySelector("[data-admin-request-table-wrap]");
  if (!tbody || !empty || !wrap) return;

  if (!requests || !requests.length) {
    tbody.innerHTML = "";
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  wrap.hidden = false;
  tbody.innerHTML = "";
  requests.forEach((request) => {
    const snapshot = request.designSnapshot || {};
    const contact = request.contactInfo || {};
    const meta = request.metadata || {};
    const metalLabel = PRODUCTION_METAL_LABELS[request.metal] || request.metal || "—";
    const statusLabel = PRODUCTION_STATUS_LABELS[request.status] || request.status;
    const created = request.createdAt ? new Date(request.createdAt).toLocaleString("tr-TR") : "";
    const sizeDetails = [request.sizeLabel || request.sizeKey || "—", meta.ringMeasureLabel || ""].filter(Boolean).join(" · ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img alt="" src="${escapeHtml(snapshot.imageUrl || "")}" loading="lazy" /></td>
      <td>
        <strong>${escapeHtml(snapshot.title || "Tasarım")}</strong>
        <div class="request-meta">${escapeHtml(snapshot.productLabel || request.product)} · ${escapeHtml(snapshot.shapeLabel || request.productShape)}</div>
        <div class="request-meta">${escapeHtml(created)}</div>
      </td>
      <td class="request-contact">
        <div><code>${escapeHtml(request.userId.slice(0, 8))}…</code></div>
        ${contact.email ? `<div>${escapeHtml(contact.email)}</div>` : ""}
        ${contact.phone ? `<div>${escapeHtml(contact.phone)}</div>` : ""}
      </td>
      <td class="request-meta">
        ${escapeHtml(metalLabel)}<br/>
        ${escapeHtml(sizeDetails)}<br/>
        ${request.quantity} adet
        ${request.customerNote ? `<div class="request-note">"${escapeHtml(request.customerNote.slice(0, 120))}${request.customerNote.length > 120 ? "…" : ""}"</div>` : ""}
      </td>
      <td><span class="production-card-status" data-status="${escapeHtml(request.status)}">${escapeHtml(statusLabel)}</span></td>
      <td>
        ${request.status === "pending" ? `<button class="button button-primary" type="button" data-admin-mark-paid="${escapeHtml(request.id)}">Ödendi işaretle</button>` : ""}
        <button class="button button-secondary" type="button" data-admin-edit-request="${escapeHtml(request.id)}">Güncelle</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadAndRenderAdminRequests() {
  const statusFilter = document.querySelector("[data-admin-request-status-filter]")?.value || "";
  const userFilter = document.querySelector("[data-admin-request-user-filter]")?.value || "";
  try {
    const { payload, response } = await studioApi.adminListProductionRequests({
      status: statusFilter,
      userId: userFilter.trim(),
    });
    if (!response.ok) {
      showStudioToast(payload?.error || "Üretim talepleri okunamadı.", "error");
      renderAdminRequestsTable([]);
      return;
    }
    adminRequestsCache = Array.isArray(payload?.requests) ? payload.requests : [];
    renderAdminRequestsTable(adminRequestsCache);
  } catch (error) {
    console.warn("[admin] requests fetch failed", error);
    renderAdminRequestsTable([]);
  }
}

function openAdminProductionDialog(request) {
  const dialog = document.querySelector("[data-admin-production-dialog]");
  const form = document.querySelector("[data-admin-production-form]");
  if (!dialog || !form || typeof dialog.showModal !== "function") return;

  form.dataset.requestId = request.id;
  document.querySelector("[data-admin-production-summary]").textContent =
    `${request.designSnapshot?.title || "Tasarım"} · ${PRODUCTION_METAL_LABELS[request.metal] || request.metal} · ${request.quantity} adet`;
  form.querySelector("[data-admin-production-status]").value = request.status || "pending";
  form.querySelector('textarea[name="internalNote"]').value = request.internalNote || "";
  const errorBox = form.querySelector("[data-admin-production-error]");
  errorBox.hidden = true;
  errorBox.textContent = "";
  dialog.showModal();
}

async function submitAdminProductionUpdate(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const dialog = document.querySelector("[data-admin-production-dialog]");
  const errorBox = form.querySelector("[data-admin-production-error]");
  const submitButton = form.querySelector("[data-admin-production-submit]");
  errorBox.hidden = true;
  errorBox.textContent = "";

  const id = form.dataset.requestId;
  if (!id) return;

  const formData = new FormData(form);
  submitButton.disabled = true;
  submitButton.textContent = "Kaydediliyor…";
  try {
    const { payload, response } = await studioApi.adminUpdateProductionRequest({
      id,
      status: formData.get("status") || "",
      internalNote: formData.get("internalNote") || "",
    });
    if (!response.ok) {
      errorBox.textContent = payload?.error || "Güncellenemedi.";
      errorBox.hidden = false;
      return;
    }
    dialog?.close();
    await loadAndRenderAdminRequests();
  } catch (error) {
    errorBox.textContent = error?.message || "Beklenmeyen bir hata oluştu.";
    errorBox.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Kaydet";
  }
}

// Online ödeme sağlayıcısı bağlı olmadığı için ödeme elle onaylanır: pending bir
// siparişi tek tıkla "ödendi" (confirmed) yapar.
async function markOrderPaid(id, button) {
  const safeId = String(id || "").trim();
  if (!safeId) return;
  if (button) {
    button.disabled = true;
    button.textContent = "İşaretleniyor…";
  }
  try {
    const { payload, response } = await studioApi.adminUpdateProductionRequest({
      id: safeId,
      status: "confirmed",
    });
    if (!response.ok) {
      showStudioToast(payload?.error || "Sipariş güncellenemedi.", "error");
      if (button) {
        button.disabled = false;
        button.textContent = "Ödendi işaretle";
      }
      return;
    }
    await loadAndRenderAdminRequests();
  } catch (error) {
    showStudioToast(error?.message || "Beklenmeyen bir hata oluştu.", "error");
    if (button) {
      button.disabled = false;
      button.textContent = "Ödendi işaretle";
    }
  }
}

function initAdminPanelUi() {
  const tabButton = document.querySelector('.studio-tab[data-tab="yonetim"]');
  if (tabButton) {
    tabButton.addEventListener("click", () => {
      loadAndRenderAdminRequests();
      // Ticket'lar switchTab içinde yüklenir + canlı polling başlatılır.
    });
  }

  document.querySelector("[data-admin-refresh-requests]")?.addEventListener("click", () => {
    loadAndRenderAdminRequests();
  });
  document.querySelector("[data-admin-request-status-filter]")?.addEventListener("change", () => {
    loadAndRenderAdminRequests();
  });
  document.querySelector("[data-admin-request-user-filter]")?.addEventListener("change", () => {
    loadAndRenderAdminRequests();
  });

  document.querySelector("[data-admin-request-tbody]")?.addEventListener("click", (event) => {
    const paidButton = event.target.closest("[data-admin-mark-paid]");
    if (paidButton) {
      markOrderPaid(paidButton.dataset.adminMarkPaid, paidButton);
      return;
    }
    const button = event.target.closest("[data-admin-edit-request]");
    if (!button) return;
    const id = button.dataset.adminEditRequest;
    const request = (adminRequestsCache || []).find((row) => row.id === id);
    if (request) openAdminProductionDialog(request);
  });

  document.querySelector("[data-admin-production-form]")?.addEventListener("submit", submitAdminProductionUpdate);
  document.querySelector("[data-admin-production-cancel]")?.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("[data-admin-production-dialog]")?.close();
  });

  initAdminTicketUi();
}

// ─── Admin: destek (ticket) yönetimi ─────────────────────────────────────────

let adminTicketsCache = [];
let adminTicketsLastSignature = "";
let adminTicketPollTimer = null;

function startAdminTicketPolling() {
  stopAdminTicketPolling();
  adminTicketPollTimer = window.setInterval(() => {
    if (document.hidden) return;
    loadAndRenderAdminTickets({ silent: true });
  }, TICKET_POLL_INTERVAL);
}

function stopAdminTicketPolling() {
  if (adminTicketPollTimer) {
    window.clearInterval(adminTicketPollTimer);
    adminTicketPollTimer = null;
  }
}

function adminTicketCardHtml(ticket) {
  const status = ticket.status || "open";
  const statusLabel = TICKET_STATUS_LABELS[status] || status;
  const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
  const thread = messages.map(ticketMessageHtml).join("");
  const statusOptions = ["open", "answered", "closed"]
    .map((value) => `<option value="${value}"${value === status ? " selected" : ""}>${escapeHtml(TICKET_STATUS_LABELS[value])}</option>`)
    .join("");
  // Sahip kimliği: varsa isim + e-posta; yoksa kısaltılmış id'ye düş.
  const userName = String(ticket.userName || "").trim();
  const userEmail = String(ticket.userEmail || "").trim();
  let userLabel;
  if (userEmail) {
    userLabel = `${userName ? `${escapeHtml(userName)} · ` : ""}<code>${escapeHtml(userEmail)}</code>`;
  } else if (userName) {
    userLabel = escapeHtml(userName);
  } else {
    userLabel = `<code>${escapeHtml(String(ticket.userId || "").slice(0, 8))}…</code>`;
  }
  return `
    <div class="ticket-card" data-admin-ticket-id="${escapeHtml(ticket.id)}">
      <button class="ticket-card-head" type="button" data-ticket-toggle aria-expanded="false">
        <span class="ticket-card-title">
          <strong>${escapeHtml(ticket.subject || "Destek talebi")}</strong>
          <small>${userLabel} · ${escapeHtml(formatTicketDate(ticket.updatedAt))} · ${messages.length} mesaj</small>
        </span>
        <span class="ticket-status" data-status="${escapeHtml(status)}">${escapeHtml(statusLabel)}</span>
      </button>
      <div class="ticket-card-body" hidden>
        <div class="cta-row admin-ticket-tools">
          <button type="button" class="button" data-admin-view-designs data-user-id="${escapeHtml(ticket.userId || "")}">🖼️ Kullanıcının görsellerini gör</button>
        </div>
        <div class="ticket-thread">${thread}</div>
        <form class="ticket-reply" data-admin-ticket-form data-ticket-id="${escapeHtml(ticket.id)}">
          <textarea name="message" rows="2" maxlength="4000" placeholder="Yanıt yaz… (boş bırakıp sadece durumu da güncelleyebilirsin)"></textarea>
          <div class="cta-row admin-ticket-reply-row">
            <label class="admin-ticket-status-label">
              Durum
              <select name="status" data-admin-ticket-status>${statusOptions}</select>
            </label>
            <button class="button button-primary" type="submit">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAdminTickets(tickets) {
  const list = document.querySelector("[data-admin-ticket-list]");
  const empty = document.querySelector("[data-admin-ticket-empty]");
  if (!list || !empty) return;

  // Yeniden render sırasında açık kartları, taslak metni, durum seçimini ve odağı koru.
  const openIds = new Set();
  const drafts = new Map();
  const statuses = new Map();
  list.querySelectorAll(".ticket-card").forEach((card) => {
    const id = card.dataset.adminTicketId;
    if (!id) return;
    const body = card.querySelector(".ticket-card-body");
    if (body && !body.hidden) openIds.add(id);
    const draft = card.querySelector('[data-admin-ticket-form] textarea[name="message"]');
    if (draft && draft.value) drafts.set(id, draft.value);
    const statusSel = card.querySelector("[data-admin-ticket-status]");
    if (statusSel) statuses.set(id, statusSel.value);
  });
  const focusedId =
    document.activeElement?.closest?.(".ticket-card")?.dataset.adminTicketId || null;

  if (!tickets || !tickets.length) {
    list.innerHTML = "";
    list.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  list.hidden = false;
  list.innerHTML = tickets.map(adminTicketCardHtml).join("");

  openIds.forEach((id) => {
    const card = list.querySelector(`.ticket-card[data-admin-ticket-id="${CSS.escape(id)}"]`);
    if (!card) return;
    card.querySelector("[data-ticket-toggle]")?.setAttribute("aria-expanded", "true");
    const body = card.querySelector(".ticket-card-body");
    if (body) body.hidden = false;
  });
  drafts.forEach((value, id) => {
    const textarea = list.querySelector(
      `.ticket-card[data-admin-ticket-id="${CSS.escape(id)}"] textarea[name="message"]`
    );
    if (textarea) textarea.value = value;
  });
  statuses.forEach((value, id) => {
    const statusSel = list.querySelector(
      `.ticket-card[data-admin-ticket-id="${CSS.escape(id)}"] [data-admin-ticket-status]`
    );
    if (statusSel) statusSel.value = value;
  });
  list.querySelectorAll(".ticket-card-body:not([hidden]) .ticket-thread").forEach((thread) => {
    thread.scrollTop = thread.scrollHeight;
  });
  if (focusedId) {
    const textarea = list.querySelector(
      `.ticket-card[data-admin-ticket-id="${CSS.escape(focusedId)}"] textarea[name="message"]`
    );
    if (textarea) {
      const end = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(end, end);
    }
  }
}

async function loadAndRenderAdminTickets({ silent = false } = {}) {
  const statusFilter = document.querySelector("[data-admin-ticket-status-filter]")?.value || "";
  const userFilter = document.querySelector("[data-admin-ticket-user-filter]")?.value || "";
  try {
    const { payload, response } = await studioApi.adminListTickets({
      status: statusFilter,
      userId: userFilter.trim(),
    });
    if (!response.ok) {
      if (silent) return;
      showStudioToast(payload?.error || "Destek talepleri okunamadı.", "error");
      renderAdminTickets([]);
      return;
    }
    const tickets = Array.isArray(payload?.tickets) ? payload.tickets : [];
    // İmzaya filtreleri de kat ki filtre değişince mutlaka yeniden çizilsin.
    const signature = `${statusFilter}|${userFilter.trim()}#${computeTicketsSignature(tickets)}`;
    adminTicketsCache = tickets;
    if (silent && signature === adminTicketsLastSignature) return;
    adminTicketsLastSignature = signature;
    renderAdminTickets(adminTicketsCache);
  } catch (error) {
    console.warn("[admin] tickets fetch failed", error);
    if (!silent) renderAdminTickets([]);
  }
}

async function submitAdminTicketReply(form) {
  const id = form.dataset.ticketId;
  const message = String(form.querySelector('textarea[name="message"]')?.value || "").trim();
  const status = form.querySelector("[data-admin-ticket-status]")?.value || "";
  const submitButton = form.querySelector('button[type="submit"]');
  if (!id) return;
  if (!message && !status) {
    showStudioToast("Cevap veya durum gerekli.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Kaydediliyor…";
  try {
    const { payload, response } = await studioApi.adminReplyTicket({ id, message, status });
    if (!response.ok) {
      showStudioToast(payload?.error || "Güncellenemedi.", "error");
      return;
    }
    // Gönderilen metnin taslak olarak geri dolmaması için textarea'yı temizle.
    const sentTextarea = form.querySelector('textarea[name="message"]');
    if (sentTextarea) sentTextarea.value = "";
    await loadAndRenderAdminTickets();
    const card = document.querySelector(`.ticket-card[data-admin-ticket-id="${CSS.escape(id)}"]`);
    if (card) {
      card.querySelector("[data-ticket-toggle]")?.setAttribute("aria-expanded", "true");
      const body = card.querySelector(".ticket-card-body");
      if (body) body.hidden = false;
    }
  } catch (error) {
    showStudioToast(error?.message || "Beklenmeyen bir hata oluştu.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Kaydet";
  }
}

// ─── Admin: kullanıcının ürettiği görseller (iade/şikayet doğrulaması) ────────
const TICKET_STAGE_LABELS = {
  sketch: "Eskiz",
  finish: "Finish",
  mockup: "Mockup",
  manken: "Manken",
};

function ensureAdminDesignsDialog() {
  let dialog = document.querySelector("[data-admin-designs-dialog]");
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.setAttribute("data-admin-designs-dialog", "");
  dialog.className = "admin-designs-dialog"; // stil: studio-theme.css
  dialog.innerHTML = `
    <div class="admin-designs-inner">
      <header class="admin-designs-head">
        <strong>Kullanıcının ürettiği görseller</strong>
        <button type="button" class="button button-secondary button-sm" data-admin-designs-close>Kapat</button>
      </header>
      <p class="admin-designs-meta" data-admin-designs-meta></p>
      <div class="admin-designs-body" data-admin-designs-body></div>
    </div>
  `;
  document.body.appendChild(dialog);
  dialog.addEventListener("click", (event) => {
    // Backdrop (dialog elemanının kendisi) tıklanınca kapat.
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelector("[data-admin-designs-close]")?.addEventListener("click", () => dialog.close());
  return dialog;
}

function adminDesignGroupHtml(design) {
  const images = Array.isArray(design.images) ? design.images : [];
  const stage = TICKET_STAGE_LABELS[design.stage] || design.stage || "";
  const head = [stage, design.product, design.productShape]
    .filter(Boolean)
    .map((part) => escapeHtml(String(part)))
    .join(" · ");
  const when = escapeHtml(formatTicketDate(design.createdAt));
  const cells = images
    .map((image) => {
      const url = escapeHtml(String(image.url || ""));
      if (!url) return "";
      return `<a class="admin-design-thumb" href="${url}" target="_blank" rel="noopener">
        <img src="${url}" loading="lazy" alt="" />
      </a>`;
    })
    .join("");
  return `
    <section class="admin-design-group">
      <div class="admin-design-group-meta">${head}${head && when ? " · " : ""}${when}</div>
      <div class="admin-design-grid">${cells}</div>
    </section>
  `;
}

async function openAdminUserDesigns(userId) {
  const id = String(userId || "").trim();
  if (!id) {
    showStudioToast("Kullanıcı kimliği bulunamadı.", "error");
    return;
  }
  const dialog = ensureAdminDesignsDialog();
  const meta = dialog.querySelector("[data-admin-designs-meta]");
  const body = dialog.querySelector("[data-admin-designs-body]");
  if (meta) meta.textContent = "Yükleniyor…";
  if (body) body.innerHTML = "";
  if (!dialog.open) dialog.showModal();

  try {
    const { payload, response } = await studioApi.adminListUserDesigns({ userId: id, sinceDays: 30 });
    if (!response.ok) {
      if (meta) meta.textContent = payload?.error || "Görseller okunamadı.";
      return;
    }
    const designs = Array.isArray(payload?.designs) ? payload.designs : [];
    const days = payload?.sinceDays || 30;
    const totalImages = designs.reduce(
      (sum, design) => sum + (Array.isArray(design.images) ? design.images.length : 0),
      0
    );
    if (meta) {
      meta.textContent = totalImages
        ? `Son ${days} gün · ${totalImages} görsel · ${designs.length} üretim`
        : `Son ${days} günde kayıtlı görsel yok. (30 günden eski üretimler arşivden silinir.)`;
    }
    if (body) body.innerHTML = designs.map(adminDesignGroupHtml).join("");
  } catch (error) {
    if (meta) meta.textContent = error?.message || "Beklenmeyen bir hata oluştu.";
  }
}

function initAdminTicketUi() {
  document.querySelector("[data-admin-refresh-tickets]")?.addEventListener("click", () => {
    loadAndRenderAdminTickets();
  });
  document.querySelector("[data-admin-ticket-status-filter]")?.addEventListener("change", () => {
    loadAndRenderAdminTickets();
  });
  document.querySelector("[data-admin-ticket-user-filter]")?.addEventListener("change", () => {
    loadAndRenderAdminTickets();
  });

  // Sekme yeniden görünür olunca admin paneli anında tazele.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && adminTicketPollTimer) {
      loadAndRenderAdminTickets({ silent: true });
    }
  });

  const list = document.querySelector("[data-admin-ticket-list]");
  if (list) {
    list.addEventListener("click", (event) => {
      const viewDesigns = event.target.closest("[data-admin-view-designs]");
      if (viewDesigns) {
        openAdminUserDesigns(viewDesigns.dataset.userId || "");
        return;
      }
      const toggle = event.target.closest("[data-ticket-toggle]");
      if (!toggle) return;
      const body = toggle.parentElement?.querySelector(".ticket-card-body");
      if (!body) return;
      const open = body.hidden;
      body.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    list.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-admin-ticket-form]");
      if (!form) return;
      event.preventDefault();
      submitAdminTicketReply(form);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdminPanelUi);
} else {
  initAdminPanelUi();
}
