'use strict';

/* ============================================================
   Registra o Service Worker (ver /sw.js).

   Invisivel: nao pede permissao, nao mostra banner, nao usa
   cookie. So liga o cache local que faz a 2a visita abrir na
   hora — e recebe o PRECACHE do smart-boot apos o load.

   Registra no evento 'load': durante o 1o carregamento a rede
   e a CPU estao disputadas.
   ============================================================ */
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;

  /* SEM reload quando um SW novo assume: HTML/CSS/JS ja sao network-first
     (a pagina aberta ja veio da versao nova). O reload antigo fazia a
     abertura rodar DUAS vezes a cada deploy pra quem ja tinha visitado. */

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(function (reg) {
        try { reg.update(); } catch (e) {}
      })
      .catch(function () {});
  });
})();
