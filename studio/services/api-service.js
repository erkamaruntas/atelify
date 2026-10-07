(function () {
  class StudioApiService {
    constructor({ authHeaders, endpoints, fetchImpl = window.fetch.bind(window), onUnauthorized }) {
      this.authHeaders = authHeaders;
      this.endpoints = endpoints;
      this.fetch = fetchImpl;
      // Oturum süresi dolduğunda (server 401 döndüğünde) çağrılır. Studio bunu
      // temiz bir login yönlendirmesine bağlar. Hata yutulur ki bir handler
      // sorunu tüm API akışını kırmasın.
      this.onUnauthorized = typeof onUnauthorized === "function" ? onUnauthorized : null;
    }

    async requestJson(url, options = {}) {
      const headers = options.auth === false
        ? options.headers || {}
        : await this.authHeaders(options.headers || {});
      const response = await this.fetch(url, {
        body: options.body,
        cache: options.cache || "no-store",
        headers,
        method: options.method || "GET",
      });
      const payload = await response.json().catch(() => ({}));

      // Kimlik doğrulamalı bir istek 401 dönerse oturum büyük olasılıkla
      // sona ermiştir; merkezi handler'ı bilgilendir.
      if (response.status === 401 && options.auth !== false && this.onUnauthorized) {
        try {
          this.onUnauthorized({ url, payload });
        } catch (error) {
          if (window.console && console.warn) {
            console.warn("[auth] onUnauthorized handler failed.", error);
          }
        }
      }

      return { payload, response };
    }

    readCredits() {
      return this.requestJson(this.endpoints.credits(), { method: "GET" });
    }

    readProfile() {
      return this.requestJson(this.endpoints.profile(), { method: "GET" });
    }

    updateProfile(body) {
      return this.requestJson(this.endpoints.profile(), {
        body: JSON.stringify(body || {}),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
    }

    listDesigns({ sinceDays = 365 } = {}) {
      const url = new URL(this.endpoints.designs(), window.location.href);
      url.searchParams.set("sinceDays", String(sinceDays));
      return this.requestJson(url.toString(), { method: "GET" });
    }

    readAdminCredits({ email = "", userId = "" } = {}) {
      const url = new URL(this.endpoints.adminCredits(), window.location.href);
      if (email) url.searchParams.set("email", email);
      if (userId) url.searchParams.set("userId", userId);
      return this.requestJson(url.toString(), { method: "GET" });
    }

    grantAdminCredits(body) {
      return this.requestJson(this.endpoints.adminCredits(), {
        body: JSON.stringify(body || {}),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    }

    listAdminRoles() {
      return this.requestJson(this.endpoints.adminRoles(), { method: "GET" });
    }

    listAdminSpending({ limit = 200 } = {}) {
      const url = new URL(this.endpoints.adminSpending(), window.location.href);
      url.searchParams.set("limit", String(limit));
      return this.requestJson(url.toString(), { method: "GET" });
    }

    setAdminRole(body) {
      return this.requestJson(this.endpoints.adminRoles(), {
        body: JSON.stringify(body || {}),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    }

    submitGeneration({ apiUrl, job, jobContext, requestPayload }) {
      return this.requestJson(apiUrl, {
        body: JSON.stringify({
          ...requestPayload,
          clientJobId: job.id,
          jobContext,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    }

    readGenerationStatus({ clientJobId, count, requestId = "", stage }) {
      const statusUrl = new URL(this.endpoints.generationStatus(), window.location.href);
      statusUrl.searchParams.set("stage", stage);
      statusUrl.searchParams.set("clientJobId", clientJobId);
      if (requestId) statusUrl.searchParams.set("requestId", requestId);
      statusUrl.searchParams.set("count", String(count));
      return this.requestJson(statusUrl.toString(), { method: "GET" });
    }

    recoverGenerations() {
      return this.requestJson(this.endpoints.recoverGenerations(), { method: "GET" });
    }

    markGenerationDelivered(clientJobId) {
      return this.requestJson(this.endpoints.generationDelivered(), {
        body: JSON.stringify({ clientJobId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    }

    submitProductionRequest(body) {
      return this.requestJson(this.endpoints.productionRequests(), {
        body: JSON.stringify(body || {}),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    }

    listProductionRequests() {
      return this.requestJson(this.endpoints.productionRequests(), { method: "GET" });
    }

    adminListProductionRequests({ status = "", userId = "" } = {}) {
      const url = new URL(this.endpoints.adminProductionRequests(), window.location.href);
      if (status) url.searchParams.set("status", status);
      if (userId) url.searchParams.set("userId", userId);
      return this.requestJson(url.toString(), { method: "GET" });
    }

    adminUpdateProductionRequest(body) {
      return this.requestJson(this.endpoints.adminProductionRequests(), {
        body: JSON.stringify(body || {}),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
    }

    submitTicket(body) {
      return this.requestJson(this.endpoints.tickets(), {
        body: JSON.stringify(body || {}),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    }

    listTickets() {
      return this.requestJson(this.endpoints.tickets(), { method: "GET" });
    }

    adminListTickets({ status = "", userId = "" } = {}) {
      const url = new URL(this.endpoints.adminTickets(), window.location.href);
      if (status) url.searchParams.set("status", status);
      if (userId) url.searchParams.set("userId", userId);
      return this.requestJson(url.toString(), { method: "GET" });
    }

    adminReplyTicket(body) {
      return this.requestJson(this.endpoints.adminTickets(), {
        body: JSON.stringify(body || {}),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
    }

    adminListUserDesigns({ userId = "", sinceDays = 30 } = {}) {
      const url = new URL(this.endpoints.adminUserDesigns(), window.location.href);
      if (userId) url.searchParams.set("userId", userId);
      url.searchParams.set("sinceDays", String(sinceDays));
      return this.requestJson(url.toString(), { method: "GET" });
    }
  }

  window.FFStudioApiService = Object.freeze({
    StudioApiService,
  });
})();
