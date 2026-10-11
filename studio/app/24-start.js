// Atelify stüdyo — start
// Stüdyoyu başlatır. Her zaman en son yüklenir.
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


initStudio().catch(() => {
  window.location.href = "./login.html";
});

