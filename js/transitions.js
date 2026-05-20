/* ==========================================================================
   PAGE TRANSITIONS — fallback isolado e auto-suficiente.

   Usado SO nas paginas que nao tem interceptador proprio
   (404, admin, login). As paginas principais (index/blog/posts) ja
   tratam isso em UI.js / blog.js / post-static.js.

   - Chrome/Edge 126+ (cross-document VT)  -> nao faz nada (CSS nativo cuida)
   - prefers-reduced-motion                -> nao faz nada (instantaneo)
   - Firefox/Safari/outros                 -> fade-out leve (<= 200ms) + navega
   Sem libs, sem dependencia de CSS externo.
   ========================================================================== */
(function () {
  'use strict';

  var hasNativeVT =
    'startViewTransition' in document && 'onpagereveal' in window;
  var reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hasNativeVT || reduced) return;

  function isInternal(a) {
    if (!a || !a.getAttribute('href')) return false;
    if (a.hasAttribute('download')) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.getAttribute('rel') === 'external') return false;
    var href = a.getAttribute('href');
    if (/^(#|mailto:|tel:|javascript:)/i.test(href)) return false;
    try {
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return false;
      if (u.pathname === location.pathname && u.search === location.search)
        return false; // mesma pagina (so hash) — nao navega
      return true;
    } catch (e) { return false; }
  }

  var navigating = false;

  document.addEventListener('click', function (e) {
    if (navigating) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!isInternal(a)) return;

    e.preventDefault();
    navigating = true;
    var dest = a.href;

    var b = document.body;
    b.style.transition = 'opacity 180ms cubic-bezier(.22,1,.36,1)';
    b.style.opacity = '0';
    b.style.pointerEvents = 'none';

    setTimeout(function () { location.href = dest; }, 190);
  });

  // Voltou pelo historico (bfcache) — restaura estado visual.
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) {
      navigating = false;
      var b = document.body;
      b.style.opacity = '';
      b.style.pointerEvents = '';
      b.style.transition = '';
    }
  });
})();
