// Atelify stüdyo — projects
// Proje oluşturma/silme/yeniden adlandırma ve proje durumunu kaydetme/geri yükleme.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


function readProjects() {
  return studioStore.readProjects();
}

function writeProjects(projects) {
  return studioStore.writeProjects(compactPersistedProjects(projects));
}

function createEmptyProjectState() {
  return studioStore.createEmptyProjectState();
}

function openNewProjectDialog() {
  openProjectDialog("create", { id: "", title: "" });
}

function allowedProjectShapeValues(productValue) {
  const productKey = normalizeDesignOptionKey(DESIGN_PRODUCT_OPTIONS, productValue, "");
  return PROJECT_SHAPES_BY_PRODUCT[productKey] || [];
}

function normalizeProjectDetails(productDetails = {}) {
  const productValue = normalizeDesignOptionKey(DESIGN_PRODUCT_OPTIONS, productDetails.productValue, "");
  const shapeValue = normalizeDesignOptionKey(DESIGN_SHAPE_OPTIONS, productDetails.shapeValue, "");
  const metalValue = normalizeProjectMetalValue(productDetails.metalValue);
  if (!productValue || !shapeValue || !metalValue || !allowedProjectShapeValues(productValue).includes(shapeValue)) {
    return null;
  }
  return { productValue, shapeValue, metalValue };
}

function projectDetailChips(productDetails = {}) {
  const normalizedDetails = normalizeProjectDetails(productDetails);
  if (!normalizedDetails) return {};

  const product = DESIGN_PRODUCT_OPTIONS[normalizedDetails.productValue];
  const shape = DESIGN_SHAPE_OPTIONS[normalizedDetails.shapeValue];
  const metal = PROJECT_METAL_OPTIONS[normalizedDetails.metalValue];
  return {
    "product-shape": { label: shape.label, value: normalizedDetails.shapeValue },
    "product-type": { label: product.label, value: normalizedDetails.productValue },
    metal: { label: metal.label, value: normalizedDetails.metalValue },
  };
}

function createNewProject(projectTitle, projectDetails = {}) {
  const projects = readProjects();
  const now = new Date().toISOString();
  const title = String(projectTitle || "").trim();
  const normalizedDetails = normalizeProjectDetails(projectDetails);
  if (!title) {
    setProjectDialogError("Proje adı boş olamaz.");
    projectNameInput?.focus();
    return;
  }
  if (!normalizedDetails) {
    setProjectDialogError("Ürün ve ürün şeklini seç.");
    focusFirstMissingProjectDetail();
    return;
  }

  const initialState = createEmptyProjectState();
  initialState.chips = {
    ...(initialState.chips || {}),
    ...projectDetailChips(normalizedDetails),
  };

  const project = {
    ...currentStudioOwnerFields(),
    createdAt: now,
    id: `ff-project-${Date.now()}`,
    stage: "sketch",
    state: initialState,
    title,
    updatedAt: now,
  };

  if (!writeProjects([project, ...projects])) {
    setProjectDialogError("Proje oluşturulamadı. Tarayıcı depolama alanını kontrol et.");
    return;
  }

  closeProjectDialog();
  openProject(project.id);
}

function openProject(projectId, options = {}) {
  const project = readProjects().find((item) => item.id === projectId);
  if (!project) return;

  if (projectSelectionMode) exitProjectSelectionMode();
  flushProjectSave();

  activeProjectId = project.id;
  studioStore.writeActiveProjectId(project.id);

  switchTab("projeler", {
    skipProjectSave: true,
    scroll: options.scroll,
    showProjectLibrary: false,
    updateHash: options.updateHash,
  });
  showProjectWorkspace();
  renderProjects();
  restoreProjectState(project);
  syncVisiblePendingGenerations({ resume: true });
  updateActiveProjectHeader(project);
}

function renameProject(projectId) {
  const projects = readProjects();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  openProjectDialog("rename", project);
}

function deleteProject(projectId) {
  const projects = readProjects();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  openProjectDialog("delete", project);
}

// --- Toplu proje seçimi / silme ---

function updateSelectProjectsToggleVisibility() {
  if (!selectProjectsToggle) return;
  const hasProjects = readProjects().length > 0;
  selectProjectsToggle.hidden = projectSelectionMode || !hasProjects;
}

function toggleProjectSelection(projectId) {
  const id = String(projectId || "").trim();
  if (!id) return false;
  if (selectedProjectIds.has(id)) {
    selectedProjectIds.delete(id);
  } else {
    selectedProjectIds.add(id);
  }
  updateProjectSelectionToolbar();
  return selectedProjectIds.has(id);
}

function updateProjectSelectionToolbar() {
  const count = selectedProjectIds.size;
  const total = readProjects().length;
  if (projectSelectCount) projectSelectCount.textContent = `${count} proje seçildi`;
  if (projectSelectDeleteButton) {
    projectSelectDeleteButton.disabled = count === 0;
    projectSelectDeleteButton.textContent = count > 0 ? `Seçilenleri sil (${count})` : "Seçilenleri sil";
  }
  if (projectSelectAllButton) {
    projectSelectAllButton.textContent = total > 0 && count >= total ? "Seçimi temizle" : "Tümünü seç";
  }
}

function enterProjectSelectionMode() {
  if (projectSelectionMode || !readProjects().length) return;
  projectSelectionMode = true;
  selectedProjectIds.clear();
  if (projectSelectBar) projectSelectBar.hidden = false;
  if (selectProjectsToggle) selectProjectsToggle.hidden = true;
  projectsPage.setSelection({ active: true, selectedIds: selectedProjectIds, onToggleSelect: toggleProjectSelection });
  renderProjects();
  updateProjectSelectionToolbar();
}

function exitProjectSelectionMode() {
  if (!projectSelectionMode) {
    updateSelectProjectsToggleVisibility();
    return;
  }
  projectSelectionMode = false;
  selectedProjectIds.clear();
  if (projectSelectBar) projectSelectBar.hidden = true;
  projectsPage.setSelection({ active: false, selectedIds: selectedProjectIds, onToggleSelect: null });
  renderProjects();
  updateSelectProjectsToggleVisibility();
}

function toggleAllProjectSelection() {
  const projects = readProjects();
  const allSelected = projects.length > 0 && selectedProjectIds.size >= projects.length;
  selectedProjectIds.clear();
  if (!allSelected) projects.forEach((project) => selectedProjectIds.add(project.id));
  renderProjects();
  updateProjectSelectionToolbar();
}

function requestBulkProjectDelete() {
  if (!selectedProjectIds.size) return;
  openProjectDialog("bulk-delete", { id: "", title: "" });
}

function submitBulkProjectDelete() {
  const ids = new Set(selectedProjectIds);
  if (!ids.size) {
    closeProjectDialog();
    return;
  }

  const projects = readProjects();
  const deletedProjects = projects.filter((project) => ids.has(project.id));
  const nextProjects = projects.filter((project) => !ids.has(project.id));

  preserveDeletedProjectOrderDesigns(deletedProjects);

  if (!writeProjects(nextProjects)) {
    setProjectDialogError("Projeler silinemedi. Tarayıcı depolama alanını kontrol et.");
    return;
  }

  ids.forEach((id) => {
    recordProjectDeletion(id);
    studioStore.clearActiveProjectId(id);
  });
  const deletedActiveProject = activeProjectId && ids.has(activeProjectId);
  if (deletedActiveProject) activeProjectId = "";

  closeProjectDialog();
  exitProjectSelectionMode();
  if (deletedActiveProject) showProjectLibrary({ skipSave: true });
}

function selectedProjectDetailProductValue() {
  return Array.from(projectDetailProductButtons).find((button) => button.classList.contains("is-selected"))?.dataset.projectProduct || "";
}

function selectedProjectDetailShapeValue() {
  return Array.from(projectDetailShapeButtons)
    .find((button) => button.classList.contains("is-selected") && !button.hidden && !button.disabled)
    ?.dataset.projectShape || "";
}

function selectedProjectDetailMetalValue() {
  return Array.from(projectDetailMetalButtons)
    .find((button) => button.classList.contains("is-selected"))
    ?.dataset.projectMetal || "";
}

function setProjectDetailButtonSelection(buttons, selectedValue, datasetKey) {
  buttons.forEach((button) => {
    button.classList.toggle("is-selected", button.dataset[datasetKey] === selectedValue);
    button.setAttribute("aria-checked", String(button.dataset[datasetKey] === selectedValue));
  });
}

function clearProjectDetailShapeSelection() {
  setProjectDetailButtonSelection(projectDetailShapeButtons, "", "projectShape");
}

function clearProjectDetailMetalSelection() {
  setProjectDetailButtonSelection(projectDetailMetalButtons, "", "projectMetal");
}

function updateProjectDetailMetalOptions(productValue) {
  const hasProduct = allowedProjectShapeValues(productValue).length > 0;
  if (projectDetailMetalField) projectDetailMetalField.hidden = !hasProduct;
}

function updateProjectDetailShapeOptions(productValue) {
  const allowedShapes = allowedProjectShapeValues(productValue);
  const hasProduct = allowedShapes.length > 0;

  if (projectDetailShapeField) projectDetailShapeField.hidden = !hasProduct;
  projectDetailShapeButtons.forEach((button) => {
    const isAllowed = allowedShapes.includes(button.dataset.projectShape || "");
    button.hidden = !isAllowed;
    button.disabled = !isAllowed;
    if (!isAllowed) button.classList.remove("is-selected");
  });
}

function resetProjectDetailFields() {
  setProjectDetailButtonSelection(projectDetailProductButtons, "", "projectProduct");
  clearProjectDetailShapeSelection();
  clearProjectDetailMetalSelection();
  if (projectDetailShapeField) projectDetailShapeField.hidden = true;
  if (projectDetailMetalField) projectDetailMetalField.hidden = true;
  projectDetailShapeButtons.forEach((button) => {
    button.hidden = false;
    button.disabled = false;
  });
  updateProjectDialogCreateState();
}

function updateProjectDialogCreateState() {
  if (projectDialogMode !== "create") return;

  const productValue = selectedProjectDetailProductValue();
  const hasProjectName = Boolean((projectNameInput?.value || "").trim());

  updateProjectDetailShapeOptions(productValue);
  updateProjectDetailMetalOptions(productValue);
  const shapeValue = selectedProjectDetailShapeValue();
  const metalValue = selectedProjectDetailMetalValue();
  const hasValidDetails = Boolean(normalizeProjectDetails({ productValue, shapeValue, metalValue }));
  if (projectDialogConfirm) {
    projectDialogConfirm.hidden = !hasValidDetails;
    projectDialogConfirm.disabled = !hasValidDetails || !hasProjectName;
    projectDialogConfirm.classList.toggle("is-disabled", projectDialogConfirm.disabled);
  }
}

function focusFirstMissingProjectDetail() {
  if (!selectedProjectDetailProductValue()) {
    projectDetailProductButtons[0]?.focus();
    return;
  }
  if (!selectedProjectDetailShapeValue()) {
    Array.from(projectDetailShapeButtons).find((button) => !button.hidden && !button.disabled)?.focus();
    return;
  }
  if (!selectedProjectDetailMetalValue()) {
    Array.from(projectDetailMetalButtons).find((button) => !button.hidden && !button.disabled)?.focus();
  }
}

function openProjectDialog(mode, project) {
  if (!projectDialog || !projectDialogTitle || !projectDialogDescription || !projectDialogConfirm) {
    return;
  }

  projectDialogMode = mode;
  projectDialogProjectId = project.id;
  projectDialogPreviousFocus = document.activeElement;
  setProjectDialogError("");

  const projectTitle = project.title || "İsimsiz proje";
  if (mode === "create") {
    if (projectDialogEyebrow) projectDialogEyebrow.textContent = "Yeni proje";
    projectDialogTitle.textContent = "Yeni proje";
    projectDialogDescription.textContent = "Proje başlamadan önce ürün ve şekil bilgisini belirle.";
    if (projectNameField) projectNameField.hidden = false;
    if (projectDetailFields) projectDetailFields.hidden = false;
    if (projectNameInput) {
      projectNameInput.required = true;
      projectNameInput.value = "";
      projectNameInput.placeholder = "Örn. İlk yüzük koleksiyonu";
    }
    projectDialogConfirm.textContent = "Projeyi başlat";
    projectDialogConfirm.hidden = true;
    projectDialogConfirm.disabled = true;
    projectDialogConfirm.classList.remove("is-danger");
    projectDialogConfirm.classList.add("is-disabled");
    resetProjectDetailFields();
  } else if (mode === "delete") {
    if (projectDialogEyebrow) projectDialogEyebrow.textContent = "Proje";
    projectDialogTitle.textContent = "Projeyi sil";
    projectDialogDescription.textContent = `"${projectTitle}" projesi silinecek. Bu işlem geri alınamaz.`;
    if (projectNameField) projectNameField.hidden = true;
    if (projectDetailFields) projectDetailFields.hidden = true;
    if (projectNameInput) {
      projectNameInput.required = false;
      projectNameInput.value = "";
    }
    projectDialogConfirm.textContent = "Projeyi sil";
    projectDialogConfirm.hidden = false;
    projectDialogConfirm.disabled = false;
    projectDialogConfirm.classList.add("is-danger");
    projectDialogConfirm.classList.remove("is-disabled");
  } else if (mode === "bulk-delete") {
    const count = selectedProjectIds.size;
    if (projectDialogEyebrow) projectDialogEyebrow.textContent = "Projeler";
    projectDialogTitle.textContent = "Seçili projeleri sil";
    projectDialogDescription.textContent = `${count} proje silinecek. Bu işlem geri alınamaz.`;
    if (projectNameField) projectNameField.hidden = true;
    if (projectDetailFields) projectDetailFields.hidden = true;
    if (projectNameInput) {
      projectNameInput.required = false;
      projectNameInput.value = "";
    }
    projectDialogConfirm.textContent = "Seçilenleri sil";
    projectDialogConfirm.hidden = false;
    projectDialogConfirm.disabled = false;
    projectDialogConfirm.classList.add("is-danger");
    projectDialogConfirm.classList.remove("is-disabled");
  } else {
    if (projectDialogEyebrow) projectDialogEyebrow.textContent = "Proje";
    projectDialogTitle.textContent = "Projeyi yeniden adlandır";
    projectDialogDescription.textContent = "Proje listesinde görünecek adı güncelle.";
    if (projectNameField) projectNameField.hidden = false;
    if (projectDetailFields) projectDetailFields.hidden = true;
    if (projectNameInput) {
      projectNameInput.required = true;
      projectNameInput.value = projectTitle;
      projectNameInput.placeholder = "";
    }
    projectDialogConfirm.textContent = "Kaydet";
    projectDialogConfirm.hidden = false;
    projectDialogConfirm.disabled = false;
    projectDialogConfirm.classList.remove("is-danger");
    projectDialogConfirm.classList.remove("is-disabled");
  }

  projectDialog.hidden = false;
  document.body.classList.add("is-project-dialog-open");

  window.requestAnimationFrame(() => {
    if ((mode === "create" || mode === "rename") && projectNameInput) {
      projectNameInput.focus();
      if (mode === "rename") projectNameInput.select();
    } else {
      projectDialogConfirm.focus();
    }
  });
}

function closeProjectDialog() {
  if (!projectDialog) return;

  projectDialog.hidden = true;
  document.body.classList.remove("is-project-dialog-open");
  projectDialogMode = "";
  projectDialogProjectId = "";
  setProjectDialogError("");

  if (projectNameInput) {
    projectNameInput.value = "";
    projectNameInput.required = false;
    projectNameInput.placeholder = "";
  }
  if (projectDetailFields) projectDetailFields.hidden = true;
  if (projectDetailShapeField) projectDetailShapeField.hidden = true;
  if (projectDetailMetalField) projectDetailMetalField.hidden = true;
  setProjectDetailButtonSelection(projectDetailProductButtons, "", "projectProduct");
  clearProjectDetailShapeSelection();
  clearProjectDetailMetalSelection();
  if (projectDialogConfirm) {
    projectDialogConfirm.hidden = false;
    projectDialogConfirm.disabled = false;
    projectDialogConfirm.classList.remove("is-disabled");
  }

  if (projectDialogPreviousFocus instanceof HTMLElement) {
    projectDialogPreviousFocus.focus();
  }
  projectDialogPreviousFocus = null;
}

function setProjectDialogError(message) {
  if (!projectDialogError) return;

  projectDialogError.textContent = message;
  projectDialogError.hidden = !message;
}

function submitProjectRename() {
  const projects = readProjects();
  const projectIndex = projects.findIndex((project) => project.id === projectDialogProjectId);
  if (projectIndex === -1) {
    closeProjectDialog();
    return;
  }

  const currentTitle = projects[projectIndex].title || "İsimsiz proje";
  const trimmedTitle = (projectNameInput?.value || "").trim();
  if (!trimmedTitle) {
    setProjectDialogError("Proje adı boş olamaz.");
    projectNameInput?.focus();
    return;
  }

  if (trimmedTitle === currentTitle) {
    closeProjectDialog();
    return;
  }

  const now = new Date().toISOString();
  projects[projectIndex] = {
    ...projects[projectIndex],
    title: trimmedTitle,
    updatedAt: now,
  };

  if (!writeProjects(projects)) {
    setProjectDialogError("Proje yeniden adlandırılamadı. Tarayıcı depolama alanını kontrol et.");
    return;
  }

  renderProjects(projects);
  if (activeProjectId === projectDialogProjectId) {
    updateActiveProjectHeader(projects[projectIndex]);
  }
  closeProjectDialog();
}

function submitProjectCreate() {
  const trimmedTitle = (projectNameInput?.value || "").trim();
  const productValue = selectedProjectDetailProductValue();
  const shapeValue = selectedProjectDetailShapeValue();
  const metalValue = selectedProjectDetailMetalValue();
  if (!trimmedTitle) {
    setProjectDialogError("Proje adı boş olamaz.");
    projectNameInput?.focus();
    return;
  }
  if (!normalizeProjectDetails({ productValue, shapeValue, metalValue })) {
    setProjectDialogError("Ürün, şekil ve metal rengini seç.");
    focusFirstMissingProjectDetail();
    return;
  }

  createNewProject(trimmedTitle, { productValue, shapeValue, metalValue });
}

function submitProjectDelete() {
  const projectId = projectDialogProjectId;
  if (!projectId) {
    closeProjectDialog();
    return;
  }

  const projects = readProjects();
  if (!projects.some((item) => item.id === projectId)) {
    closeProjectDialog();
    return;
  }

  const deletedProject = projects.find((item) => item.id === projectId);
  const nextProjects = projects.filter((item) => item.id !== projectId);

  preserveDeletedProjectOrderDesigns(deletedProject);

  if (!writeProjects(nextProjects)) {
    setProjectDialogError("Proje silinemedi. Tarayıcı depolama alanını kontrol et.");
    return;
  }
  recordProjectDeletion(projectId);

  closeProjectDialog();
  if (activeProjectId === projectId) {
    activeProjectId = "";
    showProjectLibrary({ skipSave: true });
  } else {
    renderProjects(nextProjects);
  }

  studioStore.clearActiveProjectId(projectId);
}

function handleProjectDialogSubmit(event) {
  event.preventDefault();
  if (projectDialogMode === "create") {
    submitProjectCreate();
    return;
  }

  if (projectDialogMode === "delete") {
    submitProjectDelete();
    return;
  }

  if (projectDialogMode === "bulk-delete") {
    submitBulkProjectDelete();
    return;
  }

  submitProjectRename();
}

function readStoredActiveProjectId() {
  return studioStore.readActiveProjectId();
}

function showProjectLibrary(options = {}) {
  if (!projectLibrary || !projectWorkspace) return;

  if (!options.skipSave) {
    saveCurrentProjectState();
  }

  activeProjectId = "";
  studioStore.clearActiveProjectId();

  projectsPage.setActiveProjectId("");
  projectsPage.showLibrary();
  renderProjects();
  scheduleManagedImageVisibilityRefresh();
}

function showProjectWorkspace() {
  projectsPage.showWorkspace();
  scheduleManagedImageVisibilityRefresh();
}

function updateActiveProjectHeader(project) {
  projectsPage.updateActiveHeader(project);
}

function renderProjects(projects = readProjects()) {
  const displayProjects = withProjectGenerationActivity(projects);
  projectsPage.setActiveProjectId(activeProjectId);
  projectsPage.render(displayProjects);
  updateSelectProjectsToggleVisibility();
}

function updateProjectStats(projects = readProjects()) {
  projectsPage.updateStats(withProjectGenerationActivity(projects));
}

function formatProjectDate(value) {
  return StudioProjects.formatProjectDate(value);
}

function withProjectGenerationActivity(projects = []) {
  const generationActivityByProject = projectGenerationActivityFromSavedDesigns();
  return (Array.isArray(projects) ? projects : []).map((project) => {
    const projectId = String(project?.id || "").trim();
    const savedDesignGeneratedAt = generationActivityByProject.get(projectId) || "";
    const lastGeneratedAt = latestIsoDate(project?.lastGeneratedAt || project?.generatedAt, savedDesignGeneratedAt);
    return lastGeneratedAt ? { ...project, lastGeneratedAt } : project;
  });
}

function projectGenerationActivityFromSavedDesigns(designs = readSavedDesigns()) {
  return (Array.isArray(designs) ? designs : []).reduce((activity, design) => {
    const projectId = String(design?.projectId || "").trim();
    if (!projectId || !design?.imageUrl || design?.isLoading === true || design?.status === "loading") return activity;
    const generatedAt = savedDesignGenerationDate(design);
    if (!generatedAt) return activity;
    activity.set(projectId, latestIsoDate(activity.get(projectId), generatedAt));
    return activity;
  }, new Map());
}

function savedDesignGenerationDate(design = {}) {
  const candidates = [design.generatedAt, design.createdAt, design.savedAt, design.updatedAt];
  return candidates.find(validIsoDate) || "";
}

function latestIsoDate(left, right) {
  const leftDate = validIsoDate(left);
  const rightDate = validIsoDate(right);
  if (!leftDate) return rightDate;
  if (!rightDate) return leftDate;
  return new Date(rightDate).getTime() > new Date(leftDate).getTime() ? rightDate : leftDate;
}

function saveCurrentProjectState() {
  if (isRestoringProject || !activeProjectId) return false;

  const projects = readProjects();
  const projectIndex = projects.findIndex((project) => project.id === activeProjectId);
  if (projectIndex === -1) return false;

  const now = new Date().toISOString();
  const state = collectProjectState(projects[projectIndex].state);
  projects[projectIndex] = {
    ...projects[projectIndex],
    stage: state.stage,
    state,
    updatedAt: now,
  };

  const saved = writeProjects(projects);
  if (saved) {
    updateActiveProjectHeader(projects[projectIndex]);
    renderProjects(projects);
  }
  return saved;
}

function flushProjectSave() {
  window.clearTimeout(projectSaveTimer);
  return saveCurrentProjectState();
}

function queueActiveProjectSave() {
  if (isRestoringProject || !activeProjectId) return false;
  window.clearTimeout(projectSaveTimer);
  return saveCurrentProjectState();
}

function projectTitleById(projectId) {
  return readProjects().find((project) => project.id === projectId)?.title || "";
}

function ensureProjectRecord(projectId, options = {}) {
  const safeProjectId = String(projectId || "").trim();
  if (!safeProjectId) return false;

  const projects = readProjects();
  if (projects.some((project) => project.id === safeProjectId)) return true;

  const now = new Date().toISOString();
  const project = {
    createdAt: validIsoDate(options.createdAt) || now,
    id: safeProjectId,
    stage: "sketch",
    state: createEmptyProjectState(),
    title: String(options.title || "Kurtarılan proje").trim(),
    updatedAt: now,
  };

  return writeProjects([...projects, project]);
}

function patchProjectState(projectId, updater, options = {}) {
  const safeProjectId = String(projectId || "").trim();
  if (!safeProjectId || typeof updater !== "function") return false;

  ensureProjectRecord(safeProjectId, options);
  const projects = readProjects();
  const projectIndex = projects.findIndex((project) => project.id === safeProjectId);
  if (projectIndex === -1) return false;

  const previousProject = projects[projectIndex];
  const previousState = previousProject.state && typeof previousProject.state === "object"
    ? previousProject.state
    : createEmptyProjectState();
  const nextState = updater(previousState, previousProject) || previousState;
  const now = new Date().toISOString();
  projects[projectIndex] = {
    ...previousProject,
    stage: nextState.stage || previousProject.stage || "sketch",
    state: nextState,
    updatedAt: now,
  };

  const saved = writeProjects(projects);
  if (saved) {
    renderProjects(projects);
    if (activeProjectId === safeProjectId) updateActiveProjectHeader(projects[projectIndex]);
  }
  return saved;
}

function generationProjectId(job = {}) {
  return String(job.projectId || job.metadata?.projectId || "").trim();
}

function generationProjectTitle(job = {}) {
  return String(job.projectTitle || job.metadata?.projectTitle || "").trim();
}

function generationJobContext(job = {}) {
  return {
    creditCost: normalizeCreditNumber(job.creditCost),
    label: String(job.label || "").trim(),
    metadata: sanitizeGenerationMetadataForServer(compactPersistedValue(job.metadata || {})),
    projectId: generationProjectId(job),
    projectTitle: generationProjectTitle(job),
  };
}

function sanitizeGenerationMetadataForServer(value) {
  try {
    return JSON.parse(JSON.stringify(value || {}, (_key, nestedValue) => {
      if (typeof nestedValue !== "string") return nestedValue;
      if (!nestedValue.startsWith("data:image/")) return nestedValue;
      return nestedValue.length <= MAX_SAVED_SOURCE_IMAGE_URL_LENGTH ? nestedValue : "";
    }));
  } catch {
    return {};
  }
}

function maxProjectStage(currentStage, nextStage) {
  const order = { sketch: 1, form: 2, finish: 2, mockup: 3, manken: 4 };
  return (order[nextStage] || 1) >= (order[currentStage] || 1) ? nextStage : currentStage || nextStage;
}

function currentDesignStage() {
  if (newDesignStudio?.classList.contains("is-manken-stage")) return "manken";
  if (newDesignStudio?.classList.contains("is-mockup-stage")) return "mockup";
  if (newDesignStudio?.classList.contains("is-finish-stage")) return "finish";
  return "sketch";
}

// Proje kimliği: ürün tipi, şekli ve metal. Bu üç chip grubu proje oluşturulurken
// belirlenir, studio'da gizli tutulur ve sonradan değişmez.
const PROJECT_IDENTITY_CHIP_GROUPS = ["product-type", "product-shape", "metal"];

// Otomatik kayıt, DOM'dan yeniden okunan chip değerleriyle proje kimliğini ASLA
// ezmemeli. Yeni bir site sürümünde geri yükleme (restoreSelectedChips) gizli
// chip'i eşleştiremezse default'a düşebilir; o yanlış değer kaydedilirse yuvarlak
// yüzük oval görünür. Kimlik chip'lerini her zaman kayıtlı state'ten taşıyoruz —
// proje boş olsa bile detaylar sayfa yenilenince değişmez.
function preserveProjectIdentityChips(collectedChips, previousChips) {
  const result = { ...(collectedChips || {}) };
  const previous = previousChips || {};
  PROJECT_IDENTITY_CHIP_GROUPS.forEach((group) => {
    const stored = previous[group];
    if (stored && typeof stored === "object" && stored.value) {
      result[group] = stored;
    }
  });
  return result;
}

// Üretilen içeriği koru: geri yükleme (yeni sürüm / sayfa yenileme) sonuçları DOM'a
// tam basamazsa, otomatik kayıt boş DOM'u toplayıp kayıtlı sonuçları kalıcı silmemeli.
// DOM'da görselli içerik yoksa ama önceki kayıtta varsa, önceki kayıtlı liste korunur —
// "üretilmişler üretildiği yerde dursun".
function preserveProducedList(collected, previous) {
  const collectedItems = Array.isArray(collected) ? collected : [];
  if (collectedItems.some(hasRestorableStageImage)) return collected;
  const previousItems = Array.isArray(previous) ? previous : [];
  return previousItems.some(hasRestorableStageImage) ? previous : collected;
}

function preserveProducedObject(collected, previous) {
  if (collected && hasRestorableStageImage(collected)) return collected;
  return previous && hasRestorableStageImage(previous) ? previous : collected;
}

function collectProjectState(previousState = createEmptyProjectState()) {
  const previous = previousState && typeof previousState === "object" ? previousState : createEmptyProjectState();

  const collected = {
    directForm: collectDirectFormState(),
    directMockup: collectDirectMockupState(),
    finishResults: collectFinishResultState(),
    mockupResults: collectMockupResultState(),
    sketches: collectSketchState(),
  };

  const preserved = {
    directForm: preserveProducedObject(collected.directForm, previous.directForm),
    directMockup: preserveProducedObject(collected.directMockup, previous.directMockup),
    finishResults: preserveProducedList(collected.finishResults, previous.finishResults),
    mockupResults: preserveProducedList(collected.mockupResults, previous.mockupResults),
    sketches: preserveProducedList(collected.sketches, previous.sketches),
  };

  // Herhangi bir üretilen alan DOM'dan toplanamayıp kayıttan korunduysa, geri yükleme
  // eksik kalmış demektir; aşamayı da eski state'ten koru ki sonuçlar bulundukları
  // aşamada görünmeye devam etsin.
  const producedContentDropped =
    preserved.directForm !== collected.directForm ||
    preserved.directMockup !== collected.directMockup ||
    preserved.finishResults !== collected.finishResults ||
    preserved.mockupResults !== collected.mockupResults ||
    preserved.sketches !== collected.sketches;

  return {
    ...previous,
    ...preserved,
    chips: preserveProjectIdentityChips(collectSelectedChips(), previous.chips),
    reference: collectReferenceState(previous.reference),
    stage: producedContentDropped ? previous.stage || currentDesignStage() : currentDesignStage(),
    stage1Locked: false,
    stage2EnteredDirectly: false,
  };
}

function collectDirectFormState() {
  if (!directFinishForm) return null;
  const formImageUrl = safePersistedImageUrl(directFinishForm.formImageUrl || "", "formImageUrl");
  const sourceFormUrl = safePersistedImageUrl(directFinishForm.sourceFormUrl || "", "sourceFormUrl");
  const sketchUrl = safePersistedImageUrl(directFinishForm.sketchUrl || formImageUrl || "", "sketchUrl");
  if (!formImageUrl && !sourceFormUrl && !sketchUrl) return null;
  return {
    ...designProfileFieldsFromSource(directFinishForm),
    ...sketchMetadataFieldsFromSource(directFinishForm),
    formImageUrl,
    moldTitle: directFinishForm.moldTitle || "Yüklenen tasarım",
    renderMode: directFinishForm.renderMode || "generated",
    sketchUrl,
    sourceFormUrl,
    subtitle: directFinishForm.subtitle || "",
    title: directFinishForm.title || "Yüklenen tasarım",
  };
}

function collectDirectMockupState() {
  if (!directMockupFinish) return null;
  const finishImageUrl = safePersistedImageUrl(directMockupFinish.finishImageUrl || "", "finishImageUrl");
  const sourceFormUrl = safePersistedImageUrl(directMockupFinish.sourceFormUrl || "", "sourceFormUrl");
  const sketchUrl = safePersistedImageUrl(directMockupFinish.sketchUrl || finishImageUrl || "", "sketchUrl");
  if (!finishImageUrl && !sourceFormUrl && !sketchUrl) return null;
  return {
    ...designProfileFieldsFromSource(directMockupFinish),
    backgroundLabel: directMockupFinish.backgroundLabel || "Yüklenen",
    backgroundValue: directMockupFinish.backgroundValue || "temiz",
    finishImageUrl,
    metalLabel: directMockupFinish.metalLabel || "Yüklenen render",
    metalValue: directMockupFinish.metalValue || "altin",
    moldTitle: directMockupFinish.moldTitle || "Yüklenen ürün",
    renderMode: directMockupFinish.renderMode || "generated",
    sketchUrl,
    sourceFormUrl,
    stoneLabel: directMockupFinish.stoneLabel || "Yok",
    stoneValue: directMockupFinish.stoneValue || "yok",
    surfaceLabel: directMockupFinish.surfaceLabel || "Hazır render",
    surfaceValue: directMockupFinish.surfaceValue || "parlak",
    subtitle: directMockupFinish.subtitle || "",
    title: directMockupFinish.title || "Yüklenen ürün",
  };
}

function collectSelectedChips() {
  const chips = {};
  document.querySelectorAll("[data-chip-group]").forEach((group) => {
    const selected = group.querySelector(".option-chip.is-selected");
    if (!selected) return;
    const groupName = group.dataset.chipGroup;
    const dataKey = CHIP_DATA_KEY_BY_GROUP[groupName] || "";
    chips[groupName] = {
      label: selected.textContent.trim(),
      value: dataKey ? selected.dataset[dataKey] || "" : "",
    };
  });
  return chips;
}

function collectReferenceState(previousReference = {}) {
  const preview = document.querySelector("[data-reference-preview]");
  const hint = document.querySelector("[data-upload-hint]");
  const defaultLabel = uploadLabel?.dataset.defaultText || "Tasarım görseli yükle";
  const visibleLabel = uploadLabel?.textContent || "";
  const fileName = uploadInput?.files?.[0]?.name || (visibleLabel !== defaultLabel ? visibleLabel : "") || previousReference.fileName || "";
  const visiblePreviewUrl = preview?.hidden ? "" : preview?.getAttribute("src") || "";
  const restorableVisiblePreviewUrl = visiblePreviewUrl.startsWith("blob:") ? "" : visiblePreviewUrl;
  const thumbnailUrl =
    safePersistedImageUrl(
      preview?.dataset.referenceThumbnailUrl ||
      previousReference.thumbnailUrl ||
      readSourceThumbnail(fileName),
      "thumbnailUrl"
    );
  const imageDataUrl =
    safePersistedImageUrl(
      preview?.dataset.referenceDataUrl ||
      previousReference.imageDataUrl ||
      (restorableVisiblePreviewUrl.startsWith("data:image/") ? restorableVisiblePreviewUrl : ""),
      "imageDataUrl"
    );
  const previousPreviewUrl = String(previousReference.previewUrl || "");
  const previewUrl = imageDataUrl || thumbnailUrl || safePersistedImageUrl(restorableVisiblePreviewUrl || (previousPreviewUrl.startsWith("blob:") ? "" : previousPreviewUrl), "previewUrl");
  return {
    fileName,
    hint: hint?.textContent || previousReference.hint || "",
    imageDataUrl,
    previewUrl,
    thumbnailUrl,
  };
}

function collectSketchState() {
  const sketches = Array.from(document.querySelectorAll("[data-sketch-card]")).map((card, index) => ({
    ...readDesignProfileDataset(card),
    ...readSketchMetadataDataset(card),
    ...readStorageDataset(card),
    hidden: card.classList.contains("is-hidden"),
    index,
    label: card.dataset.imageLabel || card.querySelector(".sketch-body strong")?.textContent || `Tasarım ${index + 1}`,
    selected: card.classList.contains("is-selected"),
    subtitle: card.querySelector(".sketch-body span")?.textContent || "",
    stageSourceUrl: safePersistedImageUrl(card.dataset.stageSourceUrl || card.dataset.imageUrl || "", "stageSourceUrl"),
    url: safePersistedImageUrl(card.dataset.imageUrl || card.querySelector("[data-sketch-image]")?.getAttribute("src") || "", "url"),
  }));
  return sketches.some((sketch) => sketch.url || sketch.selected) ? sketches : [];
}

function designProfileFromResultCard(card) {
  if (!card) return selectedDesignProfile();
  return designProfileFromFields({
    designModeLabel: card.dataset.designModeLabel || "",
    designModeValue: card.dataset.designModeValue || "",
    moldAspect: card.dataset.moldAspect || "",
    moldKey: card.dataset.moldKey || "",
    moldMeasure: card.dataset.moldMeasure || "",
    moldShape: card.dataset.moldShape || "",
    moldSizeLabel: card.dataset.moldSizeLabel || "",
    moldTitle: card.dataset.moldTitle || "",
    productLabel: card.dataset.productLabel || "",
    productShapeLabel: card.dataset.productShapeLabel || card.dataset.shapeLabel || "",
    productShapeValue: card.dataset.productShapeValue || card.dataset.shapeValue || card.dataset.moldShape || "",
    productValue: card.dataset.productValue || "",
    shapeLabel: card.dataset.shapeLabel || card.dataset.productShapeLabel || "",
    shapeValue: card.dataset.shapeValue || card.dataset.productShapeValue || card.dataset.moldShape || "",
  });
}

function collectFinishResultState() {
  return Array.from(document.querySelectorAll("[data-finish-result-card]")).map((card, index) => {
    const profile = designProfileFromResultCard(card);
    return {
      ...readStorageDataset(card),
      backgroundLabel: card.dataset.backgroundLabel || "Dekupe",
      backgroundValue: card.dataset.backgroundValue || "dekupe",
      designModeLabel: card.dataset.designModeLabel || profile.designModeLabel,
      designModeValue: card.dataset.designModeValue || profile.designModeValue,
      finishImageUrl: safePersistedImageUrl(card.dataset.finishImageUrl || "", "finishImageUrl"),
      id: card.dataset.finishResultId || `finish-saved-${index}`,
      index: index + 1,
      metalLabel: card.dataset.metalLabel || "Altın",
      metalValue: card.dataset.metalValue || "altin",
      moldAspect: card.dataset.moldAspect || profile.moldAspect,
      moldHeightCm: card.dataset.moldHeightCm || "",
      moldKey: card.dataset.moldKey || "",
      moldMeasure: card.dataset.moldMeasure || "",
      moldShape: card.dataset.moldShape || card.dataset.shapeValue || profile.shapeValue,
      moldSizeLabel: card.dataset.moldSizeLabel || card.dataset.moldMeasure || "",
      moldTitle: card.dataset.moldTitle || profile.moldTitle || "Tasarım",
      moldWidthCm: card.dataset.moldWidthCm || "",
      productLabel: card.dataset.productLabel || profile.productLabel,
      productShapeLabel: card.dataset.productShapeLabel || card.dataset.shapeLabel || profile.productShapeLabel,
      productShapeValue: card.dataset.productShapeValue || card.dataset.shapeValue || profile.productShapeValue,
      productValue: card.dataset.productValue || profile.productValue,
      renderMode: card.dataset.renderMode || "composite",
      selected: card.classList.contains("is-selected"),
      shapeValue: card.dataset.shapeValue || card.dataset.productShapeValue || profile.shapeValue,
      sidePrint: card.dataset.sidePrint === "1",
      sidePrintLeft: card.dataset.sidePrintLeft || "",
      sidePrintRight: card.dataset.sidePrintRight || "",
      sketchUrl: safePersistedImageUrl(card.dataset.sketchUrl || "", "sketchUrl"),
      sourceFormUrl: safePersistedImageUrl(card.dataset.sourceFormUrl || "", "sourceFormUrl"),
      stoneLabel: card.dataset.stoneLabel || "Yok",
      stoneValue: card.dataset.stoneValue || "yok",
      subtitle: card.querySelector(".sketch-body span")?.textContent || "",
      surfaceLabel: card.dataset.surfaceLabel || "Parlak",
      surfaceValue: card.dataset.surfaceValue || "parlak",
      title: card.dataset.resultTitle || card.querySelector(".sketch-body strong")?.textContent || "Ürün renderı",
    };
  });
}

function collectMockupResultState() {
  return Array.from(document.querySelectorAll("[data-mockup-result-card]")).map((card, index) => ({
    ...readStorageDataset(card),
    channelLabel: card.dataset.channelLabel || "Etsy",
    channelValue: card.dataset.channelValue || "etsy",
    finishInfo: collectFinishInfoFromMockupCard(card),
    id: card.dataset.mockupResultId || `mockup-saved-${index}`,
    index: index + 1,
    mockupImageUrl: safePersistedImageUrl(card.dataset.mockupImageUrl || "", "mockupImageUrl"),
    ratioLabel: card.dataset.ratioLabel || "1:1",
    ratioValue: card.dataset.ratioValue || "square",
    resolutionLabel: card.dataset.resolutionLabel || "1K",
    resolutionValue: card.dataset.resolutionValue || "1k",
    sceneLabel: card.dataset.sceneLabel || "Mockup",
    sceneValue: card.dataset.sceneValue || "mockup",
    selected: card.classList.contains("is-selected"),
    subtitle: card.querySelector(".sketch-body span")?.textContent || "",
    title: card.dataset.resultTitle || card.querySelector(".sketch-body strong")?.textContent || "Mockup",
    visualStyleLabel: card.dataset.visualStyleLabel || "Minimal",
    visualStyleValue: card.dataset.visualStyleValue || "minimal",
  }));
}

function collectFinishInfoFromMockupCard(card) {
  const profile = designProfileFromResultCard(card);
  return {
    backgroundLabel: card.dataset.backgroundLabel || "Dekupe",
    backgroundValue: card.dataset.backgroundValue || "dekupe",
    designModeLabel: card.dataset.designModeLabel || profile.designModeLabel,
    designModeValue: card.dataset.designModeValue || profile.designModeValue,
    finishImageUrl: safePersistedImageUrl(card.dataset.finishImageUrl || "", "finishImageUrl"),
    metalLabel: card.dataset.metalLabel || "Altın",
    metalValue: card.dataset.metalValue || "altin",
    moldAspect: card.dataset.moldAspect || profile.moldAspect,
    moldHeightCm: card.dataset.moldHeightCm || "",
    moldKey: card.dataset.moldKey || "",
    moldMeasure: card.dataset.moldMeasure || "",
    moldShape: card.dataset.moldShape || card.dataset.shapeValue || profile.shapeValue,
    moldSizeLabel: card.dataset.moldSizeLabel || card.dataset.moldMeasure || "",
    moldTitle: card.dataset.moldTitle || profile.moldTitle || "Tasarım",
    moldWidthCm: card.dataset.moldWidthCm || "",
    productLabel: card.dataset.productLabel || profile.productLabel,
    productShapeLabel: card.dataset.productShapeLabel || card.dataset.shapeLabel || profile.productShapeLabel,
    productShapeValue: card.dataset.productShapeValue || card.dataset.shapeValue || profile.productShapeValue,
    productValue: card.dataset.productValue || profile.productValue,
    renderMode: card.dataset.renderMode || "composite",
    shapeValue: card.dataset.shapeValue || card.dataset.productShapeValue || profile.shapeValue,
    sidePrint: card.dataset.sidePrint === "1",
    sidePrintLeft: card.dataset.sidePrintLeft || "",
    sidePrintRight: card.dataset.sidePrintRight || "",
    sketchUrl: safePersistedImageUrl(card.dataset.sketchUrl || "", "sketchUrl"),
    sourceFormUrl: safePersistedImageUrl(card.dataset.sourceFormUrl || "", "sourceFormUrl"),
    stoneLabel: card.dataset.stoneLabel || "Yok",
    stoneValue: card.dataset.stoneValue || "yok",
    surfaceLabel: card.dataset.surfaceLabel || "Parlak",
    surfaceValue: card.dataset.surfaceValue || "parlak",
    title: card.dataset.finishTitle || "Ürün renderı",
  };
}

function selectedStateItem(items) {
  return (Array.isArray(items) ? items : []).find((item) => item?.selected) || null;
}

function mockupResultStage(result = {}) {
  return normalizeMockupScene(result.scene || { label: result.sceneLabel, value: result.sceneValue }).value;
}

function inferredVisualizationStageFromResults(results = []) {
  const resultList = Array.isArray(results) ? results : [];
  const selectedResult = selectedStateItem(resultList);
  if (selectedResult) return mockupResultStage(selectedResult);
  if (resultList.some((result) => mockupResultStage(result) === "manken" && hasRestorableStageImage(result))) return "manken";
  return resultList.some(hasRestorableStageImage) ? "mockup" : "";
}

function firstRestorableStateItem(items, predicate = () => true) {
  return (Array.isArray(items) ? items : []).find((item) => item && predicate(item)) || null;
}

function markOnlyStateItemSelected(items, selectedItem) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    selected: Boolean(selectedItem && item === selectedItem),
  }));
}

function finishInfoFromMockupState(result = {}) {
  const finishInfo = result.finishInfo && typeof result.finishInfo === "object" ? result.finishInfo : {};
  if (!Object.keys(finishInfo).length) return null;
  const finishImageUrl = safePersistedImageUrl(
    finishInfo.finishImageUrl || result.finishImageUrl || finishInfo.sketchUrl || "",
    "finishImageUrl"
  );
  const sketchUrl = safePersistedImageUrl(finishInfo.sketchUrl || finishImageUrl || "", "sketchUrl");
  const sourceFormUrl = safePersistedImageUrl(finishInfo.sourceFormUrl || "", "sourceFormUrl");
  if (!finishImageUrl && !sketchUrl && !sourceFormUrl) return null;
  return {
    ...finishInfo,
    ...storageFieldsFromSource(finishInfo),
    finishImageUrl,
    sketchUrl,
    sourceFormUrl,
  };
}

function finishStateFromFinishInfo(finishInfo = {}, index = 0) {
  const finishImageUrl = safePersistedImageUrl(finishInfo.finishImageUrl || finishInfo.sketchUrl || "", "finishImageUrl");
  const sketchUrl = safePersistedImageUrl(finishInfo.sketchUrl || finishImageUrl || "", "sketchUrl");
  const sourceFormUrl = safePersistedImageUrl(finishInfo.sourceFormUrl || "", "sourceFormUrl");
  const profile = designProfileFromFields(finishInfo);
  return {
    ...storageFieldsFromSource(finishInfo),
    backgroundLabel: finishInfo.backgroundLabel || "Dekupe",
    backgroundValue: finishInfo.backgroundValue || "dekupe",
    designModeLabel: finishInfo.designModeLabel || profile.designModeLabel,
    designModeValue: finishInfo.designModeValue || profile.designModeValue,
    finishImageUrl,
    id: finishInfo.id || `finish-restored-source-${index}`,
    index: index + 1,
    metalLabel: finishInfo.metalLabel || "Altın",
    metalValue: finishInfo.metalValue || "altin",
    moldAspect: finishInfo.moldAspect || profile.moldAspect,
    moldHeightCm: finishInfo.moldHeightCm || "",
    moldKey: finishInfo.moldKey || "",
    moldMeasure: finishInfo.moldMeasure || "",
    moldShape: finishInfo.moldShape || finishInfo.shapeValue || finishInfo.productShapeValue || profile.shapeValue,
    moldSizeLabel: finishInfo.moldSizeLabel || finishInfo.moldMeasure || "",
    moldTitle: finishInfo.moldTitle || finishInfo.title || "Ürün renderı",
    moldWidthCm: finishInfo.moldWidthCm || "",
    productLabel: finishInfo.productLabel || profile.productLabel,
    productShapeLabel: finishInfo.productShapeLabel || finishInfo.shapeLabel || profile.productShapeLabel,
    productShapeValue: finishInfo.productShapeValue || finishInfo.shapeValue || profile.productShapeValue,
    productValue: finishInfo.productValue || profile.productValue,
    renderMode: finishInfo.renderMode || (finishImageUrl ? "generated" : "composite"),
    selected: true,
    shapeValue: finishInfo.shapeValue || finishInfo.productShapeValue || profile.shapeValue,
    sidePrint: finishInfo.sidePrint === true || finishInfo.sidePrint === "1",
    sidePrintLeft: finishInfo.sidePrintLeft || "",
    sidePrintRight: finishInfo.sidePrintRight || "",
    sketchUrl,
    sourceFormUrl,
    stoneLabel: finishInfo.stoneLabel || "Yok",
    stoneValue: finishInfo.stoneValue || "yok",
    subtitle: finishInfo.subtitle || "",
    surfaceLabel: finishInfo.surfaceLabel || "Parlak",
    surfaceValue: finishInfo.surfaceValue || "parlak",
    title: finishInfo.title || "Ürün renderı",
  };
}

function finishStateMatchesFinishInfo(result = {}, finishInfo = {}) {
  const resultUrls = [
    result.finishImageUrl,
    result.sketchUrl,
    result.sourceFormUrl,
  ].filter(Boolean);
  const finishInfoUrls = [
    finishInfo.finishImageUrl,
    finishInfo.sketchUrl,
    finishInfo.sourceFormUrl,
  ].filter(Boolean);
  if (resultUrls.some((url) => finishInfoUrls.includes(url))) return true;
  return Boolean(result.title && finishInfo.title && result.title === finishInfo.title);
}

function hasRestorableStageImage(item = {}) {
  return [item.url, item.formImageUrl, item.finishImageUrl, item.sketchUrl, item.sourceFormUrl, item.mockupImageUrl]
    .some((url) => safePersistedImageUrl(url || "", "imageUrl"));
}

function prepareProjectStateForRestore(rawState = {}) {
  const state = {
    ...createEmptyProjectState(),
    ...(rawState && typeof rawState === "object" ? rawState : {}),
  };
  const visualizationStage = inferredVisualizationStageFromResults(state.mockupResults);
  const stage =
    normalizeRestoredProjectStage(state.stage) ||
    visualizationStage ||
    (Array.isArray(state.finishResults) && state.finishResults.length ? "finish" : "") ||
    "sketch";

  let sketches = Array.isArray(state.sketches) ? state.sketches.map((item) => ({ ...item })) : [];
  let finishResults = Array.isArray(state.finishResults) ? state.finishResults.map((item) => ({ ...item })) : [];
  const mockupResults = Array.isArray(state.mockupResults) ? state.mockupResults.map((item) => ({ ...item })) : [];
  const directForm = hasRestorableStageImage(state.directForm || {}) ? state.directForm : null;
  const directMockup = hasRestorableStageImage(state.directMockup || {}) ? state.directMockup : null;

  const needsSketchSource = stage === "finish" || isVisualizationStage(stage);
  if (needsSketchSource && !directForm && !selectedStateItem(sketches)) {
    const fallbackSketch = firstRestorableStateItem(sketches, (item) => !item.hidden && hasRestorableStageImage(item));
    if (fallbackSketch) sketches = markOnlyStateItemSelected(sketches, fallbackSketch);
  }

  if (isVisualizationStage(stage) && !directMockup && !selectedStateItem(finishResults)) {
    const mockupSource = selectedStateItem(mockupResults) || firstRestorableStateItem(mockupResults, hasRestorableStageImage);
    const mockupFinishInfo = finishInfoFromMockupState(mockupSource || {});
    const fallbackFinish =
      (mockupFinishInfo && firstRestorableStateItem(finishResults, (result) => finishStateMatchesFinishInfo(result, mockupFinishInfo))) ||
      firstRestorableStateItem(finishResults, hasRestorableStageImage);

    if (fallbackFinish) {
      finishResults = markOnlyStateItemSelected(finishResults, fallbackFinish);
    } else if (mockupFinishInfo) {
      finishResults = [finishStateFromFinishInfo(mockupFinishInfo)];
    }
  }

  return {
    ...state,
    directForm,
    directMockup,
    finishResults,
    mockupResults,
    sketches,
    stage,
  };
}

function restoreProjectState(project) {
  isRestoringProject = true;
  try {
    resetDesignWorkspace();

    const state = prepareProjectStateForRestore(project.state || createEmptyProjectState());
    isSketchGenerating = false;
    stage2EnteredDirectly = false;

    restoreSelectedChips(state.chips || {});
    restoreReferenceState(state.reference || {});
    restoreSketchState(state.sketches || []);
    restoreDirectFormState(state.directForm);
    restoreFinishResultState(state.finishResults || []);
    restoreDirectMockupState(state.directMockup);

    // Önce aşama sınıfını kur, sonra sonuçları çiz: mockup/manken artık ayrı sonuç
    // panelleri taşıdığından, restoreMockupResultState aktif panele yazmalı.
    if (state.stage === "manken") enterMankenStage({ allowMissing: true });
    else if (state.stage === "mockup") enterMockupStage({ allowMissing: true });
    else if (state.stage === "finish") enterFinishStage({ allowMissing: true });
    else if (state.stage === "form") enterFinishStage({ allowMissing: true });
    else openSketchStage();

    restoreMockupResultState(state.mockupResults || []);

    backfillProjectImagesToSavedDesigns(project);
  } catch (error) {
    // Tek bir bozuk proje state'i tüm workspace'i boş/kilitli bırakmamalı.
    // Hata olsa bile en azından 1. aşamayı aç ve kullanıcının devam etmesine izin ver.
    console.error("Proje geri yüklenirken hata oluştu", error);
    try {
      openSketchStage();
    } catch (fallbackError) {
      console.error("1. aşamaya geri dönülürken hata oluştu", fallbackError);
    }
  } finally {
    isRestoringProject = false;
    applyStageRestrictions();
  }
}

function backfillProjectImagesToSavedDesigns(project) {
  const state = project?.state;
  if (!state) return;

  const savedImageUrls = new Set(readSavedDesigns().map((d) => d.imageUrl).filter(Boolean));
  const entries = [];

  (state.sketches || []).forEach((sketch, index) => {
    if (!sketch?.url || savedImageUrls.has(sketch.url)) return;
    entries.push({
      ...designProfileFieldsFromSource(sketch),
      ...sketchMetadataFieldsFromSource(sketch),
      autoSaved: true,
      generatedBy: "ai",
      imageUrl: sketch.url,
      projectId: project.id,
      projectTitle: project.title || "",
      sourceImageUrl: sketch.sourceImageUrl || state.reference?.previewUrl || "",
      sourceStage: "sketch",
      stageSourceUrl: sketch.stageSourceUrl || sketch.url,
      stage: "AI Tasarım Görseli",
      title: sketch.label || `Tasarım ${String(index + 1).padStart(2, "0")}`,
    });
  });

  (state.finishResults || []).forEach((result, index) => {
    const url = result.finishImageUrl;
    if (!url || savedImageUrls.has(url)) return;
    entries.push({
      ...designProfileFieldsFromSource(result),
      autoSaved: true,
      generatedBy: "ai",
      imageUrl: url,
      projectId: project.id,
      projectTitle: project.title || "",
      sourceImageUrl: result.sourceFormUrl || result.sketchUrl || "",
      sourceStage: "finish",
      sourceTitle: result.moldTitle || result.title || "",
      stage: "Ürün Görseli",
      metalLabel: result.metalLabel || "",
      metalValue: result.metalValue || "",
      title: result.title || `${result.metalLabel || "Altın"} ${result.moldTitle || "Yüzük"} ${String(index + 1).padStart(2, "0")}`,
    });
  });

  (state.mockupResults || []).forEach((result, index) => {
    const url = result.mockupImageUrl;
    if (!url || savedImageUrls.has(url)) return;
    entries.push({
      ...designProfileFieldsFromSource(result.finishInfo || result),
      autoSaved: true,
      generatedBy: "ai",
      imageUrl: url,
      projectId: project.id,
      projectTitle: project.title || "",
      sourceImageUrl: result.finishInfo?.finishImageUrl || result.finishInfo?.sketchUrl || "",
      sourceStage: "mockup",
      sourceTitle: result.finishInfo?.title || result.title || "",
      stage: "Mockup / Manken Foto",
      title: result.title || `${normalizeMockupScene({ label: result.sceneLabel, value: result.sceneValue }).label} ${String(index + 1).padStart(2, "0")}`,
    });
  });

  if (!entries.length) return;
  addSavedDesigns(entries);
}

function resetDesignWorkspace() {
  releaseDirectFinishForm();
  releaseDirectMockupFinish();
  isSketchGenerating = false;
  stage2EnteredDirectly = false;

  resetGenerationUiState();
  if (uploadInput) uploadInput.value = "";
  restoreDefaultUploadState();
  restoreDefaultChipState();
  syncRingMoldSizeOptions();
  updateDesignSelectionSummary();
  clearSketchResults();
  openSketchStage();
  updateDraftCost();
  updateFinishCost();
  updateMockupCost();
  setSketchStatus("");
  setFinishStatusMessage("");
  setMockupStatusMessage("");
}

function resetGenerationUiState() {
  removeResultLoading("sketch");
  removeResultLoading("finish");
  removeResultLoading("mockup", { stage: "mockup" });
  removeResultLoading("mockup", { stage: "manken" });
  setGeneratingState(false);
  setFinishGeneratingState(false);
  setMockupGeneratingState(false);
}

function restoreDefaultUploadState() {
  const referencePreview = document.querySelector("[data-reference-preview]");
  const referencePreviewShell = document.querySelector("[data-reference-preview-shell]");
  const uploadDropzone = document.querySelector("[data-upload-dropzone]");
  const uploadHint = document.querySelector("[data-upload-hint]");

  if (uploadLabel) uploadLabel.textContent = uploadLabel.dataset.defaultText || "Tasarım görseli yükle";
  if (uploadHint) uploadHint.textContent = currentUploadHintText();
  if (referencePreview) {
    releaseImageElement(referencePreview);
    releaseReferencePreviewObjectUrl();
    referencePreview.removeAttribute("src");
    delete referencePreview.dataset.referenceDataUrl;
    delete referencePreview.dataset.referenceFileName;
    delete referencePreview.dataset.referenceThumbnailUrl;
    referencePreview.hidden = true;
  }
  referencePreviewShell?.setAttribute("hidden", "");
  uploadDropzone?.classList.remove("has-preview");
  ["direct-form", "direct-finish"].forEach((prefix) => {
    updateStageUploadPreview(prefix, "", "");
  });
}

function restoreDefaultChipState() {
  document.querySelectorAll("[data-chip-group]").forEach((group) => {
    group.querySelectorAll(".option-chip").forEach((chip) => {
      chip.classList.toggle("is-selected", chip.dataset.defaultSelected === "1");
    });
  });
  enforceProductShapeSelection();
  applyProductMetalUI();
}

function restoreSelectedChips(chips) {
  Object.entries(chips || {}).forEach(([groupName, savedChip]) => {
    const group = document.querySelector(`[data-chip-group="${groupName}"]`);
    if (!group || !savedChip) return;
    const dataKey = CHIP_DATA_KEY_BY_GROUP[groupName] || "";
    const candidates = Array.from(group.querySelectorAll(".option-chip"));
    const match =
      (dataKey && candidates.find((chip) => chip.dataset[dataKey] === savedChip.value)) ||
      candidates.find((chip) => chip.textContent.trim() === savedChip.label);
    if (!match) return;
    candidates.forEach((chip) => chip.classList.toggle("is-selected", chip === match));
  });

  enforceProductShapeSelection();
  applyProductMetalUI();
  syncRingMoldSizeOptions();
  updateDraftCost();
  updateFinishCost();
  updateMockupCost();
  updateVisibleSketchCards();
  updateDesignSelectionSummary();
}

function enforceProductShapeSelection() {
  const shapeGroup = document.querySelector('[data-chip-group="product-shape"]');
  if (!shapeGroup) return;

  const allowedShapes = allowedProjectShapeValues(readSelectedChip("product-type").value);
  if (!allowedShapes.length) return;

  const selectedShape = shapeGroup.querySelector(".option-chip.is-selected");
  if (selectedShape && allowedShapes.includes(selectedShape.dataset.productShape || "")) return;

  const fallbackShape = shapeGroup.querySelector(`[data-product-shape="${allowedShapes[0]}"]`);
  if (!fallbackShape) return;

  shapeGroup.querySelectorAll(".option-chip").forEach((chip) => {
    chip.classList.toggle("is-selected", chip === fallbackShape);
  });
}

function currentUploadHintText() {
  const productValue = readSelectedChip("product-type").value || "yuzuk";
  const hint = document.querySelector("[data-upload-hint]");
  if (hint) {
    const productHint = productValue === "kolye" ? hint.dataset.hintKolye : hint.dataset.hintYuzuk;
    if (productHint) return productHint;
    if (hint.dataset.defaultText) return hint.dataset.defaultText;
  }
  return productValue === "kolye"
    ? "Logo/arma görseli ya da kolye fotoğrafı ekle; ürün fotoğrafında yalnız kolye üzerindeki motif alınır."
    : "Logo/arma görseli ya da yüzük fotoğrafı ekle; ürün fotoğrafında yalnız yüzük üstündeki motif alınır.";
}

function applyProductMetalUI() {
  const productValue = readSelectedChip("product-type").value || "yuzuk";
  const isKolye = productValue === "kolye";

  // Label: Yüzük rengi / Kolye rengi
  document.querySelectorAll("[data-metal-label]").forEach((label) => {
    label.textContent = isKolye ? "Kolye rengi" : "Yüzük rengi";
  });

  // Upload hint: ürüne göre değiş
  document.querySelectorAll("[data-upload-hint]").forEach((hint) => {
    const productHint = isKolye ? hint.dataset.hintKolye : hint.dataset.hintYuzuk;
    if (productHint) {
      hint.textContent = productHint;
      hint.dataset.defaultText = productHint;
    }
  });

  // Kolye için iki metal de seçilebilir kalsın — chipler her zaman görünür
  const metalGroup = document.querySelector('[data-chip-group="metal"]');
  if (!metalGroup) return;
  const altinChip = metalGroup.querySelector('[data-metal="altin"]');
  const gumusChip = metalGroup.querySelector('[data-metal="gumus"]');
  const roseChip = metalGroup.querySelector('[data-metal="rose"]');
  if (altinChip) altinChip.style.display = "";
  if (gumusChip) gumusChip.style.display = "";
  if (roseChip) roseChip.style.display = "";

  updateSideEmblemDefaultThumbs();
  updateSidePrintPreviews();
}

function restoreReferenceState(reference) {
  const preview = document.querySelector("[data-reference-preview]");
  const previewShell = document.querySelector("[data-reference-preview-shell]");
  const dropzone = document.querySelector("[data-upload-dropzone]");
  const hint = document.querySelector("[data-upload-hint]");

  if (uploadLabel) uploadLabel.textContent = reference.fileName || uploadLabel.dataset.defaultText || "Tasarım görseli yükle";
  if (hint) hint.textContent = reference.fileName ? "Tasarım hazır. Görsel oluşturmayı başlatabilirsin." : hint.dataset.defaultText || "Seçtiğin ürün, şekil ve yüzey işlemine uygulanacak görseli ekle.";

  const storedDataUrl = safePersistedImageUrl(reference.imageDataUrl || "", "imageDataUrl");
  const storedThumbnailUrl =
    safePersistedImageUrl(reference.thumbnailUrl || "", "thumbnailUrl") ||
    readSourceThumbnail(reference.fileName);
  const restoredImageUrl =
    storedThumbnailUrl ||
    safePersistedImageUrl(String(reference.previewUrl || "").startsWith("blob:") ? "" : reference.previewUrl, "previewUrl") ||
    storedDataUrl;
  if (preview && restoredImageUrl) {
    preview.src = restoredImageUrl;
    if (storedDataUrl) {
      preview.dataset.referenceDataUrl = storedDataUrl;
    } else {
      delete preview.dataset.referenceDataUrl;
    }
    preview.dataset.referenceFileName = reference.fileName || "";
    preview.dataset.referenceThumbnailUrl = storedThumbnailUrl || restoredImageUrl;
    preview.hidden = false;
    previewShell?.removeAttribute("hidden");
    dropzone?.classList.add("has-preview");
  } else {
    dropzone?.classList.remove("has-preview");
  }
}

function restoreDirectFormState(source) {
  if (!source || typeof source !== "object") return;

  const imageUrl = safePersistedImageUrl(
    source.formImageUrl || source.sourceFormUrl || source.sketchUrl || "",
    "formImageUrl"
  );
  if (!imageUrl) return;

  clearSketchCardSelection();
  directFinishForm = {
    ...designProfileFieldsFromSource(source),
    ...sketchMetadataFieldsFromSource(source),
    formImageUrl: imageUrl,
    moldTitle: source.moldTitle || "Yüklenen tasarım",
    renderMode: source.renderMode || "generated",
    sketchUrl: safePersistedImageUrl(source.sketchUrl || imageUrl, "sketchUrl") || imageUrl,
    sourceFormUrl: safePersistedImageUrl(source.sourceFormUrl || "", "sourceFormUrl"),
    subtitle: source.subtitle || "",
    title: source.title || "Yüklenen tasarım",
  };
  updateStageUploadPreview("direct-form", "", "");
}

function restoreSketchState(sketches) {
  if (!Array.isArray(sketches) || sketches.length === 0) return;

  newDesignStudio?.classList.add("has-results");
  ensureSketchCardCount(sketches.length);
  document.querySelectorAll("[data-sketch-card]").forEach((card, index) => {
    const saved = sketches[index];

    if (!saved) {
      resetSketchCard(card, index);
      card.classList.add("is-hidden");
      return;
    }

    card.classList.toggle("is-hidden", Boolean(saved?.hidden));
    card.classList.toggle("is-selected", Boolean(saved?.selected));
    if (saved?.url) {
      setSketchCardImage(
        card,
        {
          ...saved,
          label: saved.label || `Tasarım ${String(index + 1).padStart(2, "0")}`,
          url: saved.url,
        },
        index
      );
    }
  });
  setFormStepReady(Boolean(getSelectedSketchInfo()));
}

function restoreFinishResultState(results) {
  if (!Array.isArray(results) || results.length === 0) return;
  const normalizedResults = results.map(normalizeSavedFinishResult);
  showFinishResults(normalizedResults);
  restoreSelectedResult("[data-finish-result-card]", "finishResultId", normalizedResults);
  setMockupStepReady(Boolean(getSelectedFinishInfo()));
}

function normalizeSavedFinishResult(result, index) {
  const finishImageUrl = result.finishImageUrl || (result.renderMode === "generated" ? result.sketchUrl : "");
  const sourceFormUrl = result.sourceFormUrl || (finishImageUrl ? "" : result.sketchUrl || "");
  const profile = designProfileFromFields(result);

  return {
    background: { label: result.backgroundLabel || "Dekupe", value: result.backgroundValue || "dekupe" },
    formInfo: {
      designModeLabel: result.designModeLabel || profile.designModeLabel,
      designModeValue: result.designModeValue || profile.designModeValue,
      formImageUrl: sourceFormUrl,
      moldAspect: result.moldAspect || profile.moldAspect,
      moldHeightCm: result.moldHeightCm || "",
      moldKey: result.moldKey || "",
      moldMeasure: result.moldMeasure || "",
      moldShape: result.moldShape || result.shapeValue || result.productShapeValue || profile.shapeValue,
      moldSizeLabel: result.moldSizeLabel || result.moldMeasure || "",
      moldTitle: result.moldTitle || profile.moldTitle || "Tasarım",
      moldWidthCm: result.moldWidthCm || "",
      productLabel: result.productLabel || profile.productLabel,
      productShapeLabel: result.productShapeLabel || result.shapeLabel || profile.productShapeLabel,
      productShapeValue: result.productShapeValue || result.shapeValue || profile.productShapeValue,
      productValue: result.productValue || profile.productValue,
      renderMode: sourceFormUrl ? "generated" : "composite",
      shapeValue: result.shapeValue || result.productShapeValue || profile.shapeValue,
      sketchUrl: sourceFormUrl || DEV_SKETCH_DATA_URL,
      title: result.moldTitle || profile.moldTitle || "Tasarım",
    },
    generatedAt: result.generatedAt || "",
    id: result.id || `finish-restored-${index}`,
    imageUrl: finishImageUrl,
    index: result.index || index + 1,
    metal: { label: result.metalLabel || "Altın", value: result.metalValue || "altin" },
    renderMode: result.renderMode || (finishImageUrl ? "generated" : "composite"),
    selected: Boolean(result.selected),
    // Yan baskı bilgisi reload sonrası korunmalı; 3./4. aşama aynı bitmiş ürünü kullanır.
    sidePrint: result.sidePrint === true || result.sidePrint === "1",
    sidePrintLeft: result.sidePrintLeft || "",
    sidePrintRight: result.sidePrintRight || "",
    stone: { label: result.stoneLabel || "Yok", value: result.stoneValue || "yok" },
    surface: { label: result.surfaceLabel || "Parlak", value: result.surfaceValue || "parlak" },
  };
}

function restoreMockupResultState(results) {
  if (!Array.isArray(results) || results.length === 0) return;
  const normalizedResults = results.map(normalizeSavedMockupResult);
  const groupedResults = normalizedResults.reduce(
    (groups, result) => {
      groups[mockupResultStage(result)].push(result);
      return groups;
    },
    { manken: [], mockup: [] }
  );

  showMockupResults(groupedResults.mockup, { stage: "mockup" });
  showMockupResults(groupedResults.manken, { stage: "manken" });
  restoreSelectedResult("[data-mockup-result-card]", "mockupResultId", normalizedResults);
  syncMockupResultUi();
}

function normalizeSavedMockupResult(result, index) {
  const finishProfile = designProfileFromFields(result.finishInfo || result);
  return {
    channel: { label: result.channelLabel || "Etsy", value: result.channelValue || "etsy" },
    finishInfo: {
      backgroundLabel: result.finishInfo?.backgroundLabel || "Dekupe",
      backgroundValue: result.finishInfo?.backgroundValue || "dekupe",
      designModeLabel: result.finishInfo?.designModeLabel || finishProfile.designModeLabel,
      designModeValue: result.finishInfo?.designModeValue || finishProfile.designModeValue,
      finishImageUrl: result.finishInfo?.finishImageUrl || "",
      metalLabel: result.finishInfo?.metalLabel || "Altın",
      metalValue: result.finishInfo?.metalValue || "altin",
      moldAspect: result.finishInfo?.moldAspect || finishProfile.moldAspect,
      moldHeightCm: result.finishInfo?.moldHeightCm || "",
      moldKey: result.finishInfo?.moldKey || "",
      moldMeasure: result.finishInfo?.moldMeasure || "",
      moldShape: result.finishInfo?.moldShape || result.finishInfo?.shapeValue || result.finishInfo?.productShapeValue || finishProfile.shapeValue,
      moldSizeLabel: result.finishInfo?.moldSizeLabel || result.finishInfo?.moldMeasure || "",
      moldTitle: result.finishInfo?.moldTitle || finishProfile.moldTitle || "Tasarım",
      moldWidthCm: result.finishInfo?.moldWidthCm || "",
      productLabel: result.finishInfo?.productLabel || finishProfile.productLabel,
      productShapeLabel: result.finishInfo?.productShapeLabel || result.finishInfo?.shapeLabel || finishProfile.productShapeLabel,
      productShapeValue: result.finishInfo?.productShapeValue || result.finishInfo?.shapeValue || finishProfile.productShapeValue,
      productValue: result.finishInfo?.productValue || finishProfile.productValue,
      renderMode: result.finishInfo?.renderMode || "composite",
      shapeValue: result.finishInfo?.shapeValue || result.finishInfo?.productShapeValue || finishProfile.shapeValue,
      sidePrint: result.finishInfo?.sidePrint === true || result.finishInfo?.sidePrint === "1",
      sidePrintLeft: result.finishInfo?.sidePrintLeft || "",
      sidePrintRight: result.finishInfo?.sidePrintRight || "",
      sketchUrl: result.finishInfo?.sketchUrl || DEV_SKETCH_DATA_URL,
      sourceFormUrl: result.finishInfo?.sourceFormUrl || "",
      stoneLabel: result.finishInfo?.stoneLabel || "Yok",
      stoneValue: result.finishInfo?.stoneValue || "yok",
      surfaceLabel: result.finishInfo?.surfaceLabel || "Parlak",
      surfaceValue: result.finishInfo?.surfaceValue || "parlak",
      title: result.finishInfo?.title || "Ürün renderı",
    },
    generatedAt: result.generatedAt || "",
    id: result.id || `mockup-restored-${index}`,
    imageUrl: result.mockupImageUrl || result.imageUrl || "",
    index: result.index || index + 1,
    ratio: { label: result.ratioLabel || "1:1", value: result.ratioValue || "square" },
    resolution: { label: result.resolutionLabel || "1K", value: result.resolutionValue || "1k" },
    scene: normalizeMockupScene({ label: result.sceneLabel, value: result.sceneValue }),
    selected: Boolean(result.selected),
    visualStyle: { label: result.visualStyleLabel || "Minimal", value: result.visualStyleValue || "minimal" },
  };
}

function restoreDirectMockupState(source) {
  if (!source || typeof source !== "object") return;

  const imageUrl = safePersistedImageUrl(
    source.finishImageUrl || source.sourceFormUrl || source.sketchUrl || "",
    "finishImageUrl"
  );
  if (!imageUrl) return;

  document.querySelectorAll("[data-finish-result-card]").forEach((card) => card.classList.remove("is-selected"));
  directMockupFinish = {
    ...designProfileFieldsFromSource(source),
    backgroundLabel: source.backgroundLabel || "Yüklenen",
    backgroundValue: source.backgroundValue || "temiz",
    finishImageUrl: imageUrl,
    metalLabel: source.metalLabel || "Yüklenen render",
    metalValue: source.metalValue || "altin",
    moldTitle: source.moldTitle || "Yüklenen ürün",
    renderMode: source.renderMode || "generated",
    sketchUrl: safePersistedImageUrl(source.sketchUrl || imageUrl, "sketchUrl") || imageUrl,
    sourceFormUrl: safePersistedImageUrl(source.sourceFormUrl || "", "sourceFormUrl"),
    stoneLabel: source.stoneLabel || "Yok",
    stoneValue: source.stoneValue || "yok",
    surfaceLabel: source.surfaceLabel || "Hazır render",
    surfaceValue: source.surfaceValue || "parlak",
    subtitle: source.subtitle || "",
    title: source.title || "Yüklenen ürün",
  };
  updateStageUploadPreview("direct-finish", "", "");
}

function restoreSelectedResult(selector, dataKey, results) {
  const selected = results.find((result) => result.selected);
  if (!selected) return;
  document.querySelectorAll(selector).forEach((card) => {
    card.classList.toggle("is-selected", card.dataset[dataKey] === selected.id);
  });
}

function showStudio(session, options = {}) {
  const email = session?.user?.email || "";
  overviewPage.renderUserIdentity(email);
  renderProfilePanel(session);
  syncProfileFromServer();

  updateProjectStats();
  renderCurrentPackage(undefined, { renderCredit: options.renderCredit !== false });
}
