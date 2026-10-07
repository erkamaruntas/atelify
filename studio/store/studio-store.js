(function () {
  class StudioStore {
    constructor({
      activeProjectKey,
      creditWalletKey,
      limits = {},
      onWrite = null,
      packageKey,
      packageNormalizer = (value) => String(value || ""),
      pendingGenerationsKey,
      projectsDomain,
      projectsKey,
      savedDesignsDomain,
      savedDesignsKey,
      sourceThumbnailsKey,
      storage,
    }) {
      this.activeProjectKey = activeProjectKey;
      this.creditWalletKey = creditWalletKey;
      this.limits = {
        pendingGenerations: limits.pendingGenerations || 8,
        projects: limits.projects || 40,
        savedDesigns: limits.savedDesigns || 80,
      };
      this.onWrite = typeof onWrite === "function" ? onWrite : null;
      this.packageKey = packageKey;
      this.packageNormalizer = packageNormalizer;
      this.projectsDomain = projectsDomain;
      this.savedDesignsDomain = savedDesignsDomain;
      this.storage = storage;
      this.memoryWrites = new Map();
      this.setStorageKeys({
        activeProjectKey,
        creditWalletKey,
        pendingGenerationsKey,
        projectsKey,
        savedDesignsKey,
        sourceThumbnailsKey,
      });
    }

    setStorageKeys({
      activeProjectKey,
      creditWalletKey,
      pendingGenerationsKey,
      projectsKey,
      savedDesignsKey,
      sourceThumbnailsKey,
    } = {}) {
      if (activeProjectKey) this.activeProjectKey = activeProjectKey;
      if (creditWalletKey) this.creditWalletKey = creditWalletKey;
      if (pendingGenerationsKey) this.pendingGenerationsKey = pendingGenerationsKey;
      if (projectsKey) this.projectsKey = projectsKey;
      if (savedDesignsKey) this.savedDesignsKey = savedDesignsKey;
      if (sourceThumbnailsKey) this.sourceThumbnailsKey = sourceThumbnailsKey;
    }

    ownsStorageKey(key) {
      return [
        this.activeProjectKey,
        this.creditWalletKey,
        this.pendingGenerationsKey,
        this.projectsKey,
        this.savedDesignsKey,
        this.sourceThumbnailsKey,
      ].includes(key);
    }

    readSelectedPackage() {
      try {
        return this.packageNormalizer(window.localStorage.getItem(this.packageKey));
      } catch {
        return "";
      }
    }

    writeSelectedPackage(planKey) {
      const normalizedPlanKey = this.packageNormalizer(planKey);
      if (!normalizedPlanKey) return false;
      try {
        window.localStorage.setItem(this.packageKey, normalizedPlanKey);
        return true;
      } catch {
        return false;
      }
    }

    readCreditWallet() {
      return this.storage.readJson(this.creditWalletKey, null);
    }

    writeCreditWallet(wallet) {
      return this.storage.writeJson(this.creditWalletKey, wallet);
    }

    readSourceThumbnails() {
      const value = this.storage.readJson(this.sourceThumbnailsKey, {});
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    writeSourceThumbnails(thumbnails) {
      const value = thumbnails && typeof thumbnails === "object" && !Array.isArray(thumbnails)
        ? thumbnails
        : {};
      return this.storage.writeJson(this.sourceThumbnailsKey, value);
    }

    createEmptyProjectState() {
      return this.projectsDomain.createEmptyProjectState();
    }

    readProjects() {
      return this.projectsDomain.sanitizeProjectList(
        this.readArrayWithMemoryFallback(this.projectsKey),
        this.limits.projects
      );
    }

    writeProjects(projects, options = {}) {
      const projectList = Array.isArray(projects) ? projects : [];
      const ok = this.writeJsonWithMemoryFallback(
        this.projectsKey,
        projectList.slice(0, this.limits.projects)
      );
      if (ok && options.sync !== false) this.notifyWrite();
      return ok;
    }

    mergeProjects(localProjects = [], cloudProjects = []) {
      return this.projectsDomain.mergeProjects(localProjects, cloudProjects, this.limits.projects);
    }

    sanitizeProjects(projects = []) {
      return this.projectsDomain.sanitizeProjectList(projects, this.limits.projects);
    }

    readSavedDesigns() {
      return this.savedDesignsDomain.sanitizeSavedDesignList(
        this.readArrayWithMemoryFallback(this.savedDesignsKey),
        this.limits.savedDesigns
      );
    }

    writeSavedDesigns(designs, options = {}) {
      const designList = Array.isArray(designs) ? designs : [];
      const ok = this.writeJsonWithMemoryFallback(
        this.savedDesignsKey,
        designList.slice(0, this.limits.savedDesigns)
      );
      if (ok && options.sync !== false) this.notifyWrite();
      return ok;
    }

    mergeSavedDesigns(localDesigns = [], cloudDesigns = []) {
      return this.savedDesignsDomain.mergeSavedDesigns(
        localDesigns,
        cloudDesigns,
        this.limits.savedDesigns
      );
    }

    sanitizeSavedDesigns(designs = []) {
      return this.savedDesignsDomain.sanitizeSavedDesignList(designs, this.limits.savedDesigns);
    }

    readPendingGenerations() {
      return this.storage.readArray(this.pendingGenerationsKey);
    }

    writePendingGenerations(jobs) {
      const jobList = Array.isArray(jobs) ? jobs : [];
      return this.storage.writeJson(
        this.pendingGenerationsKey,
        jobList.slice(0, this.limits.pendingGenerations)
      );
    }

    readActiveProjectId() {
      try {
        return window.localStorage.getItem(this.activeProjectKey) || "";
      } catch {
        return "";
      }
    }

    writeActiveProjectId(projectId) {
      try {
        window.localStorage.setItem(this.activeProjectKey, String(projectId || ""));
        return true;
      } catch {
        return false;
      }
    }

    clearActiveProjectId(projectId = "") {
      try {
        if (!projectId || window.localStorage.getItem(this.activeProjectKey) === projectId) {
          window.localStorage.removeItem(this.activeProjectKey);
        }
        return true;
      } catch {
        return false;
      }
    }

    notifyWrite() {
      this.onWrite?.();
    }

    readArrayWithMemoryFallback(key) {
      const memoryValue = this.memoryWrites.get(key);
      if (Array.isArray(memoryValue)) return cloneJsonValue(memoryValue);
      return this.storage.readArray(key);
    }

    writeJsonWithMemoryFallback(key, value) {
      const ok = this.storage.writeJson(key, value);
      if (ok) {
        this.memoryWrites.delete(key);
        return true;
      }

      this.memoryWrites.set(key, cloneJsonValue(value));
      console.warn(`[studio-store] ${key} could not be persisted to localStorage; using in-memory state until cloud sync completes.`);
      return true;
    }
  }

  function cloneJsonValue(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }

  window.FFStudioStore = Object.freeze({
    StudioStore,
  });
})();
