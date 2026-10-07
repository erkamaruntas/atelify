(function () {
  const STAGE_LABELS = {
    finish: "2. Görsel Üretimi",
    form: "2. Görsel Üretimi",
    mockup: "3. Vitrin / Mockup",
    manken: "4. Manken",
    sketch: "1. Ürün / Tasarım",
  };

  function isMankenResult(item) {
    const value = String(item?.sceneValue || item?.sceneLabel || "").trim().toLowerCase();
    return value.includes("manken") || value.includes("elde") || value.includes("boyun");
  }

  class ProjectsPage {
    constructor({ elements = {}, handlers = {} } = {}) {
      this.elements = elements;
      this.handlers = handlers;
      this.activeProjectId = "";
      this.selection = { active: false, selectedIds: new Set(), onToggleSelect: null };
    }

    setHandlers(handlers = {}) {
      this.handlers = { ...this.handlers, ...handlers };
    }

    setSelection(selection = {}) {
      this.selection = { ...this.selection, ...selection };
    }

    setActiveProjectId(projectId) {
      this.activeProjectId = String(projectId || "").trim();
    }

    render(projects) {
      renderProjects(projects, {
        activeProjectId: this.activeProjectId,
        grid: this.elements.projectGrid,
        onDeleteProject: this.handlers.onDeleteProject,
        onOpenProject: this.handlers.onOpenProject,
        onRenameProject: this.handlers.onRenameProject,
        projectEmpty: this.elements.projectEmpty,
        selection: this.selection,
        statMonth: this.elements.statMonth,
        statTotal: this.elements.statTotal,
      });
    }

    updateStats(projects) {
      updateProjectStats(projects, {
        statMonth: this.elements.statMonth,
        statTotal: this.elements.statTotal,
      });
    }

    showLibrary() {
      if (this.elements.projectLibrary) this.elements.projectLibrary.hidden = false;
      if (this.elements.projectWorkspace) this.elements.projectWorkspace.hidden = true;
      if (this.elements.projectWorkspacePlaceholder) this.elements.projectWorkspacePlaceholder.hidden = false;
    }

    showWorkspace() {
      if (this.elements.projectLibrary) this.elements.projectLibrary.hidden = false;
      if (this.elements.projectWorkspace) this.elements.projectWorkspace.hidden = false;
      if (this.elements.projectWorkspacePlaceholder) this.elements.projectWorkspacePlaceholder.hidden = true;
    }

    updateActiveHeader(project) {
      this.setActiveProjectId(project?.id || "");
      if (this.elements.activeProjectName) {
        this.elements.activeProjectName.textContent = project?.title || "Yeni proje";
      }
      if (!this.elements.activeProjectMeta) return;

      const detailLabels = projectDetailLabels(project);
      this.elements.activeProjectMeta.textContent = detailLabels.length
        ? detailLabels.join(" / ")
        : "Ürün / Şekil / Metal";
    }
  }

  function createEmptyProjectState() {
    return {
      chips: {},
      directForm: null,
      directMockup: null,
      finishResults: [],
      mockupResults: [],
      reference: {},
      sketches: [],
      stage: "sketch",
      stage1Locked: false,
      stage2EnteredDirectly: false,
    };
  }

  let openProjectMenu = null;

  function renderProjects(projects, { activeProjectId, grid, onDeleteProject, onOpenProject, onRenameProject, projectEmpty, selection, statMonth, statTotal }) {
    const projectList = sortProjectsByRecentActivity(projects);
    const hasProjects = projectList.length > 0;

    if (projectEmpty) projectEmpty.hidden = hasProjects;
    if (grid) {
      grid.hidden = !hasProjects;
      grid.replaceChildren(
        ...projectList.map((project) =>
          createProjectCard(project, {
            activeProjectId,
            onDeleteProject,
            onOpenProject,
            onRenameProject,
            selection,
          })
        )
      );
    }

    updateProjectStats(projectList, { statMonth, statTotal });
  }

  function createProjectCard(project, { activeProjectId, onDeleteProject, onOpenProject, onRenameProject, selection } = {}) {
    const selectionActive = Boolean(selection?.active);
    const isActive = !selectionActive && Boolean(activeProjectId) && project.id === activeProjectId;
    const isSelected = selectionActive && selection.selectedIds?.has(project.id);

    const card = document.createElement("article");
    card.className = "project-card";
    if (isActive) card.classList.add("is-active");
    if (selectionActive) card.classList.add("is-selecting");
    if (isSelected) card.classList.add("is-selected");
    card.dataset.projectId = project.id;
    card.role = "button";
    card.tabIndex = 0;
    if (isActive) card.setAttribute("aria-current", "true");

    const top = document.createElement("div");
    top.className = "project-card-top";

    const detailLabels = projectDetailLabels(project);
    let details = null;
    if (detailLabels.length) {
      details = document.createElement("div");
      details.className = "project-detail-pills";
      detailLabels.forEach((label) => {
        const pill = document.createElement("span");
        pill.className = "project-detail-pill";
        pill.textContent = label;
        details.append(pill);
      });
    }

    const updated = document.createElement("span");
    updated.className = "project-updated";
    updated.textContent = formatProjectDate(projectDisplayDate(project));

    const menuWrap = document.createElement("div");
    menuWrap.className = "project-menu";

    const menuButton = document.createElement("button");
    menuButton.className = "project-menu-button";
    menuButton.type = "button";
    menuButton.setAttribute("aria-haspopup", "menu");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", `${project.title || "İsimsiz proje"} seçenekleri`);
    menuButton.title = "Proje seçenekleri";
    menuButton.innerHTML = `
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <circle cx="4.5" cy="10" r="1.45"></circle>
        <circle cx="10" cy="10" r="1.45"></circle>
        <circle cx="15.5" cy="10" r="1.45"></circle>
      </svg>
    `;

    const menu = document.createElement("div");
    menu.className = "project-menu-popover";
    menu.role = "menu";
    menu.hidden = true;

    const renameButton = document.createElement("button");
    renameButton.type = "button";
    renameButton.role = "menuitem";
    renameButton.textContent = "Yeniden adlandır";

    const deleteButton = document.createElement("button");
    deleteButton.className = "is-danger";
    deleteButton.type = "button";
    deleteButton.role = "menuitem";
    deleteButton.textContent = "Sil";

    menu.append(renameButton, deleteButton);
    menuWrap.append(menuButton, menu);

    if (selectionActive) menuWrap.hidden = true;

    let check = null;
    if (selectionActive) {
      check = document.createElement("span");
      check.className = "project-select-check";
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";
    }

    const controls = document.createElement("div");
    controls.className = "project-card-controls";
    controls.append(updated, menuWrap, ...(check ? [check] : []));

    const title = document.createElement("h3");
    title.textContent = project.title || "İsimsiz proje";
    top.append(title, controls);

    function toggleSelect() {
      if (typeof selection?.onToggleSelect !== "function") return;
      const nowSelected = selection.onToggleSelect(project.id);
      card.classList.toggle("is-selected", Boolean(nowSelected));
      card.setAttribute("aria-pressed", nowSelected ? "true" : "false");
    }

    function activateCard() {
      if (selectionActive) {
        toggleSelect();
        return;
      }
      if (typeof onOpenProject === "function") onOpenProject(project.id);
    }

    function closeMenu() {
      menu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
      card.classList.remove("has-open-menu");
      if (openProjectMenu === menu) openProjectMenu = null;
    }

    function toggleMenu() {
      if (!menu.hidden) {
        closeMenu();
        return;
      }

      closeOpenProjectMenu(menu);
      menu.hidden = false;
      menuButton.setAttribute("aria-expanded", "true");
      card.classList.add("has-open-menu");
      openProjectMenu = menu;
    }

    card.append(top, ...(details ? [details] : []));
    if (selectionActive) card.setAttribute("aria-pressed", isSelected ? "true" : "false");
    card.addEventListener("click", activateCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCard();
      }
    });

    menuWrap.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    menuWrap.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeMenu();
        menuButton.focus();
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.stopPropagation();
      }
    });
    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMenu();
    });
    renameButton.addEventListener("click", (event) => {
      event.stopPropagation();
      closeMenu();
      if (typeof onRenameProject === "function") onRenameProject(project.id);
    });
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      closeMenu();
      if (typeof onDeleteProject === "function") onDeleteProject(project.id);
    });

    return card;
  }

  function closeOpenProjectMenu(nextMenu = null) {
    if (!openProjectMenu || openProjectMenu === nextMenu) return;

    openProjectMenu.hidden = true;
    openProjectMenu
      .closest(".project-menu")
      ?.querySelector(".project-menu-button")
      ?.setAttribute("aria-expanded", "false");
    openProjectMenu.closest(".project-card")?.classList.remove("has-open-menu");
    openProjectMenu = null;
  }

  if (typeof document !== "undefined") {
    document.addEventListener("click", () => closeOpenProjectMenu());
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeOpenProjectMenu();
    });
  }

  function projectStageLabel(stage) {
    return STAGE_LABELS[stage] || STAGE_LABELS.sketch;
  }

  // Proje açılmadan kartta gösterilecek ürün detayları (ürün / şekil / metal).
  // Kaynak: proje state.chips — oluşturulurken ve düzenlenirken güncellenir.
  const PROJECT_DETAIL_CHIP_KEYS = ["product-type", "product-shape", "metal"];
  function projectDetailLabels(project) {
    const chips = project?.state?.chips;
    if (!chips || typeof chips !== "object") return [];
    return PROJECT_DETAIL_CHIP_KEYS
      .map((key) => {
        const chip = chips[key];
        return chip && typeof chip === "object" ? String(chip.label || "").trim() : "";
      })
      .filter(Boolean);
  }

  function projectCompletedSteps(project) {
    const state = project.state || {};
    let count = 0;
    const mockupResults = state.mockupResults || [];
    if ((state.sketches || []).some((item) => item.selected || item.url) || hasStageSource(state.directForm)) count = 1;
    if ((state.finishResults || []).some((item) => item.selected) || hasStageSource(state.directMockup)) count = 2;
    if (mockupResults.some((item) => item.selected && !isMankenResult(item))) count = 3;
    if (mockupResults.some((item) => item.selected && isMankenResult(item))) count = 4;
    return count;
  }

  function hasStageSource(source) {
    if (!source || typeof source !== "object") return false;
    return Boolean(source.url || source.formImageUrl || source.finishImageUrl || source.sketchUrl || source.sourceFormUrl);
  }

  function projectSummary(project) {
    const completed = projectCompletedSteps(project);
    if (!completed) return "Henüz başlanmadı. Açınca 1. aşamadan devam eder.";
    if (completed === 4) return "Manken görseli seçildi; proje üretim talebine hazır.";
    if (completed === 3) return "Mockup seçildi; manken görseli de üretebilirsin.";
    return `${completed}/4 aşama kaydedildi. Kaldığın yerden devam edebilirsin.`;
  }

  function updateProjectStats(projects, { statMonth, statTotal }) {
    const projectList = Array.isArray(projects) ? projects : [];
    if (statTotal) statTotal.textContent = projectList.length;

    const now = new Date();
    const monthCount = projectList.filter((project) => {
      const date = new Date(project.updatedAt || project.createdAt);
      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;

    if (statMonth) statMonth.textContent = monthCount;
  }

  function formatProjectDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "Bugün";
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function mergeProjects(localProjects = [], cloudProjects = [], limit = 40) {
    const byId = new Map();
    const orderedIds = [];

    [...localProjects, ...cloudProjects].forEach((project) => {
      if (!project?.id) return;
      if (!byId.has(project.id)) orderedIds.push(project.id);

      const current = byId.get(project.id);
      if (!current || dateValue(project.updatedAt || project.createdAt) >= dateValue(current.updatedAt || current.createdAt)) {
        byId.set(project.id, project);
      }
    });

    return sanitizeProjectList(
      orderedIds.map((id) => byId.get(id)).filter(Boolean),
      limit
    );
  }

  function sanitizeProjectList(projects, limit = 40) {
    return sortProjectsByRecentActivity(projects)
      .filter((project) => project && typeof project.id === "string" && project.id && project.isDeleted !== true)
      .map((project) => ({
        ...project,
        state: project.state && typeof project.state === "object" ? project.state : createEmptyProjectState(),
      }))
      .slice(0, limit);
  }

  function dateValue(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
  }

  function projectDisplayDate(project) {
    return projectGeneratedActivityDate(project) || project?.createdAt;
  }

  function sortProjectsByRecentActivity(projects) {
    return (Array.isArray(projects) ? projects : [])
      .slice()
      .sort((left, right) => {
        const rightCreated = dateValue(right?.createdAt);
        const leftCreated = dateValue(left?.createdAt);
        if (rightCreated !== leftCreated) return rightCreated - leftCreated;

        const rightUpdated = dateValue(right?.updatedAt);
        const leftUpdated = dateValue(left?.updatedAt);
        if (rightUpdated !== leftUpdated) return rightUpdated - leftUpdated;

        const rightGenerated = projectGeneratedActivityValue(right);
        const leftGenerated = projectGeneratedActivityValue(left);
        if (rightGenerated !== leftGenerated) return rightGenerated - leftGenerated;

        return 0;
      });
  }

  function projectGeneratedActivityDate(project) {
    const value = projectGeneratedActivityValue(project);
    return value ? new Date(value).toISOString() : "";
  }

  function projectGeneratedActivityValue(project) {
    const state = project?.state && typeof project.state === "object" ? project.state : {};
    return Math.max(
      dateValue(project?.lastGeneratedAt || project?.generatedAt),
      newestGeneratedItemValue(state.sketches, ["url", "imageUrl"]),
      newestGeneratedItemValue(state.finishResults, ["finishImageUrl", "imageUrl"]),
      newestGeneratedItemValue(state.mockupResults, ["mockupImageUrl", "imageUrl"])
    );
  }

  function newestGeneratedItemValue(items, imageKeys) {
    return (Array.isArray(items) ? items : []).reduce((latest, item) => {
      if (!item || typeof item !== "object") return latest;
      const hasGeneratedImage = imageKeys.some((key) => String(item[key] || "").trim());
      if (!hasGeneratedImage) return latest;
      return Math.max(
        latest,
        dateValue(item.generatedAt || item.createdAt || item.savedAt || item.updatedAt)
      );
    }, 0);
  }

  window.FFStudioProjects = Object.freeze({
    ProjectsPage,
    createEmptyProjectState,
    formatProjectDate,
    mergeProjects,
    renderProjects,
    sanitizeProjectList,
    updateProjectStats,
  });
})();
