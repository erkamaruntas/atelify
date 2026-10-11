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

// Tanıtım videosu: bölüme gelince sessiz başlar, bölümden çıkınca duraklar.
// Kullanıcı videoyu kendisi durdurduysa geri gelince yeniden başlatılmaz.
// "Hareketi azalt" tercihi açıksa otomatik oynatma yapılmaz.
(function initFilmAutoplay() {
  const video = document.querySelector("[data-autoplay-in-view]");
  if (!video || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let pausedByUser = false;
  let pausingProgrammatically = false;
  let autoStarted = false;

  video.addEventListener("pause", () => {
    if (pausingProgrammatically) {
      pausingProgrammatically = false;
      return;
    }
    // Video bitince de "pause" gelir; o durumda kullanıcı durdurmuş sayılmaz.
    if (!video.ended) pausedByUser = true;
  });
  video.addEventListener("play", () => {
    pausedByUser = false;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (pausedByUser || !video.paused || video.ended) return;
          // İlk başlatma sessiz olmalı (tarayıcılar yalnızca sessiz videonun kendiliğinden
          // başlamasına izin verir). Sonradan kullanıcı sesi açtıysa ona dokunma.
          if (!autoStarted) video.muted = true;
          autoStarted = true;
          video.play().catch(() => {
            // Tarayıcı izin vermezse kullanıcı oynat düğmesiyle başlatabilir.
          });
        } else if (!video.paused) {
          pausingProgrammatically = true;
          video.pause();
        }
      });
    },
    { threshold: 0.5 }
  );
  observer.observe(video);
})();
