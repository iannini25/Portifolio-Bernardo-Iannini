'use strict';

/* ============================================================
   SMART BOOT — aquece o cache local pra 2a visita abrir na hora.

   Depois do load, num idle frame, pede ao Service Worker pra
   guardar a casca do site no Cache Storage. As capas ficam de
   fora de proposito: cada aparelho baixa a largura que precisa
   (srcset) e o SW guarda essa, nao todas.

   Nao roda quando a conexao pede economia (Save-Data / 2G):
   ali cada KB conta.
   Nao mostra nada na tela e nao bloqueia scroll.
   ============================================================ */

(function () {
  if (!('serviceWorker' in navigator)) return;

  var SHELL = [
    '/',
    '/style.css',
    '/js/perf-tier.js',
    '/js/language.js',
    '/js/projects.js',
    '/js/scrollfx.js',
    '/js/UI.js',
    '/js/home.js',
    '/favicon.png',
    '/img/eufoto1.webp'
  ];

  function conexaoEconomica() {
    var c = navigator.connection;
    if (!c) return false;
    return !!c.saveData || /(^|-)2g$/.test(c.effectiveType || '');
  }

  function pedirPrecache() {
    if (conexaoEconomica()) return;
    var msg = { type: 'PRECACHE', urls: SHELL };
    navigator.serviceWorker.ready.then(function (reg) {
      if (reg.active) reg.active.postMessage(msg);
    }).catch(function () {});
  }

  function quandoOcioso() {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(pedirPrecache, { timeout: 4000 });
    } else {
      setTimeout(pedirPrecache, 1500);
    }
  }

  if (document.readyState === 'complete') quandoOcioso();
  else window.addEventListener('load', quandoOcioso, { once: true });
})();
