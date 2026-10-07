(function () {
  function createTabController({ aliases = {}, navItems, panels }) {
    const navList = Array.from(navItems || []);
    const panelList = Array.from(panels || []);

    function normalize(tabKey) {
      return aliases[tabKey] || tabKey || "";
    }

    function hydrateA11y() {
      navList.forEach((button) => {
        const tabKey = normalize(button.dataset.tab);
        if (!button.id) button.id = `tab-${tabKey}`;
        button.setAttribute("aria-controls", `panel-${tabKey}`);
      });

      panelList.forEach((panel) => {
        const panelKey = normalize(panel.dataset.panel);
        if (!panel.id) panel.id = `panel-${panelKey}`;
        panel.setAttribute("aria-labelledby", `tab-${panelKey}`);
      });
    }

    function switchTo(tabKey) {
      const nextTab = normalize(tabKey);

      navList.forEach((button) => {
        const active = normalize(button.dataset.tab) === nextTab;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
      });

      panelList.forEach((panel) => {
        const active = normalize(panel.dataset.panel) === nextTab;
        panel.classList.toggle("is-active", active);
        if (active) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });

      return nextTab;
    }

    function bind(onSelect) {
      navList.forEach((button) => {
        button.addEventListener("click", () => onSelect(normalize(button.dataset.tab)));
      });

      document.querySelectorAll("[data-tab-trigger]").forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
          event.preventDefault();
          onSelect(normalize(trigger.dataset.tabTrigger));
        });
      });
    }

    hydrateA11y();

    return Object.freeze({
      bind,
      normalize,
      switchTo,
    });
  }

  window.FFStudioTabs = Object.freeze({
    createTabController,
  });
})();
