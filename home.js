// Ana sayfa: "Fotoğraf → Gravür → Mücevher" bölümü.
// Bölüm içinde ne kadar kaydırıldığına göre aşama değişir, alttaki çizgi dolar.
(function initTransformStory() {
  const section = document.querySelector("[data-transform]");
  if (!section) return;

  const steps = [...section.querySelectorAll("[data-transform-step]")];
  const visuals = [...section.querySelectorAll("[data-transform-visual]")];
  const bars = [...section.querySelectorAll("[data-transform-bar]")];
  const count = steps.length;
  let current = 0;
  let ticking = false;

  function update() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    const stage = Math.min(count - 1, Math.floor(progress * count));

    bars.forEach((bar, i) => {
      const local = Math.min(1, Math.max(0, progress * count - i));
      bar.style.transform = `scaleX(${local})`;
    });

    if (stage === current) return;
    current = stage;
    steps.forEach((el, i) => el.classList.toggle("is-active", i === stage));
    visuals.forEach((el, i) => el.classList.toggle("is-active", i === stage));
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
})();
