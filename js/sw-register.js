'use strict';

/* ============================================================
   Registra o Service Worker (ver /sw.js).

   Invisivel: nao pede permissao, nao mostra banner, nao usa
   cookie. So liga o cache local que faz a 2a visita abrir na
   hora — e recebe o PRECACHE do smart-boot ao atingir 100%.

   Registra no evento 'load': durante o 1o carregamento a rede
   e a CPU estao disputadas.
   ============================================================ */
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(function (reg) {
        /* forca update do SW v3 (videos cache-first + PRECACHE) */
        try { reg.update(); } catch (e) {}
      })
      .catch(function () {});
  });
})();
