(function () {
  class OverviewPage {
    constructor(elements = {}) {
      this.elements = elements;
    }

    renderUserIdentity(email) {
      renderUserIdentity(email, this.elements);
    }

    renderCurrentPackage(plan) {
      renderCurrentPackage(plan, this.elements);
    }

    renderRecentDesigns(designs, options = {}) {
      renderRecentDesigns(designs, {
        empty: this.elements.overviewRecentEmpty,
        grid: this.elements.overviewRecentGrid,
        ...options,
      });
    }
  }

  function firstNameFrom(email) {
    if (!email) return "ustam.";
    const handle = email.split("@")[0] || "";
    const token = handle.split(/[._-]/)[0] || handle;
    if (!token) return "ustam.";
    return token.charAt(0).toUpperCase() + token.slice(1) + ".";
  }

  function renderUserIdentity(email, { studioEmail, userFirst }) {
    if (studioEmail) studioEmail.textContent = email || "-";
    if (userFirst) userFirst.textContent = firstNameFrom(email);
  }

  function renderCurrentPackage(plan, elements) {
    if (!plan) return;

    const {
      creditDisplay,
      currentPackageCredit,
      currentPackageName,
      currentPackageScope,
      currentPackageSummary,
      currentPackageSupport,
      finishCredit,
      formCredit,
      mockupCredit,
      newDesignCredit,
      statCredit,
    } = elements;

    if (currentPackageName) currentPackageName.textContent = plan.name;
    if (currentPackageSummary) currentPackageSummary.textContent = plan.summary;
    if (currentPackageCredit) currentPackageCredit.textContent = plan.credit;
    if (currentPackageScope) currentPackageScope.textContent = plan.scope;
    if (currentPackageSupport) currentPackageSupport.textContent = plan.support;

    if (creditDisplay) creditDisplay.textContent = plan.credit;
    if (statCredit) statCredit.textContent = plan.credit;
    if (newDesignCredit) newDesignCredit.textContent = plan.credit;
    if (formCredit) formCredit.textContent = plan.credit;
    if (finishCredit) finishCredit.textContent = plan.credit;
    if (mockupCredit) mockupCredit.textContent = plan.credit;
  }

  function renderRecentDesigns(designs, { grid, empty, limit = 3 }) {
    if (!grid) return;

    const designList = (Array.isArray(designs) ? designs : [])
      .slice()
      .sort((first, second) => dateValue(second.createdAt) - dateValue(first.createdAt))
      .slice(0, limit);
    grid.replaceChildren(...designList.map(createOverviewDesignCard));
    grid.hidden = designList.length === 0;
    if (empty) empty.hidden = designList.length > 0;
  }

  function createOverviewDesignCard(design) {
    const isLoading = isSavedDesignLoading(design);
    const card = document.createElement("article");
    card.className = isLoading ? "design-card is-loading" : "design-card";
    if (isLoading) {
      card.setAttribute("role", "status");
      card.setAttribute("aria-busy", "true");
    }

    const visual = document.createElement("div");
    visual.className = isLoading ? "design-visual is-loading" : design.imageUrl ? "design-visual has-image" : "design-visual";

    if (isLoading) {
      const spinner = document.createElement("span");
      spinner.className = "result-spinner";
      spinner.setAttribute("aria-hidden", "true");
      visual.append(spinner);
    } else if (design.imageUrl) {
      const image = document.createElement("img");
      image.className = "saved-design-image";
      image.src = design.imageUrl;
      image.alt = design.title || "Kaydedilen tasarım";
      image.decoding = "async";
      image.loading = "lazy";
      visual.append(image);
    } else {
      const shape = document.createElement("span");
      shape.className = "visual-shape";
      const stone = document.createElement("span");
      stone.className = "visual-stone";
      visual.append(shape, stone);
    }

    const body = document.createElement("div");
    body.className = "design-body";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = isLoading ? "Oluşturuluyor" : design.autoSaved ? "Otomatik kaydedildi" : "Kaydedilen tasarım";

    const title = document.createElement("h3");
    title.className = "design-title";
    title.textContent = design.title || "Tasarım";

    const meta = document.createElement("div");
    meta.className = "design-meta";

    const date = document.createElement("span");
    date.textContent = formatDate(design.createdAt);

    const stage = document.createElement("span");
    stage.textContent = isLoading ? "Görsel hazırlanıyor" : design.stage || "Tasarım Görseli";

    meta.append(date, stage);
    body.append(eyebrow, title, meta);
    card.append(visual, body);
    return card;
  }

  function formatDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "Bugün";
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function dateValue(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
  }

  function isSavedDesignLoading(design) {
    const imageUrl = typeof design?.imageUrl === "string" ? design.imageUrl.trim() : "";
    return !imageUrl && (design?.isLoading === true || design?.status === "loading");
  }

  window.FFStudioOverview = Object.freeze({
    OverviewPage,
    firstNameFrom,
    renderCurrentPackage,
    renderRecentDesigns,
    renderUserIdentity,
  });
})();
