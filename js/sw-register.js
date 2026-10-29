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

  /* quando um SW novo assume (deploy novo), recarrega UMA vez pra pagina
     ja aberta trocar pra versao nova; sem isso o visitante via a mistura
     do HTML novo com CSS/JS antigos. So recarrega se ja havia um SW antes
     (1a visita nao pisca). */
  var tinhaSW = !!navigator.serviceWorker.controller;
  var recarregou = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!tinhaSW || recarregou) return;
    recarregou = true;
    location.reload();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(function (reg) {
        try { reg.update(); } catch (e) {}
      })
      .catch(function () {});
  });
})();
