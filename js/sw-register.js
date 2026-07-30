'use strict';

/* ============================================================
   Registra o Service Worker (ver /sw.js).

   Invisivel: nao pede permissao, nao mostra banner, nao usa
   cookie. So liga o cache local que faz a 2a visita abrir na
   hora.

   Registra no evento 'load' de proposito: durante o 1o
   carregamento a rede e a CPU estao disputadas, e instalar o SW
   junto atrasaria justamente a primeira visita, que e a que
   precisa ser rapida. O ganho e da proxima em diante.
   ============================================================ */
(function () {
  if (!('serviceWorker' in navigator)) return;

  // http://localhost conta como origem segura; file:// nao suporta SW
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {
      /* silencioso de proposito: se falhar, o site funciona igual,
         so sem o cache extra. Nada pra mostrar pro usuario. */
    });
  });
})();
