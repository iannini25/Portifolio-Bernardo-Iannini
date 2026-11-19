'use strict';

/* =========================================================
   SCROLL RESTORE — volta pro lugar certo da home.

   O browser restaura a rolagem (ou pula pra #ancora) ANTES das secoes
   animadas terminarem de montar: o pin de Servicos, a timeline e as
   pastas crescem depois e empurram o conteudo, e a pessoa caia no meio
   do site. Aqui:
     - ao sair da home, guarda a SECAO em que estava + a distancia
       dentro dela (nao o pixel absoluto, que muda com o layout);
     - ao voltar pelo historico, reaplica isso depois que o layout assenta;
     - chegando por #ancora (ex.: /#projects), re-posiciona na secao.
   bfcache (pagina congelada inteira) ja volta certinho: nada a fazer.
   ========================================================= */
(() => {
  const KEY = 'bi-home-scroll';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* so secoes de verdade, visiveis e no fluxo (fora modais/dialogs/fixos) */
  const sections = () => [...document.querySelectorAll('main section[id]')].filter(el => {
    if (el.closest('dialog, [role="dialog"]')) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.position !== 'fixed' && el.getBoundingClientRect().height > 0;
  });
  const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  /* guarda: secao cujo topo esta acima do meio da tela, mais proxima */
  window.addEventListener('pagehide', () => {
    const y = window.scrollY;
    let best = null;
    for (const s of sections()) {
      const t = absTop(s);
      if (t <= y + 1) best = { id: s.id, off: y - t };
    }
    try { sessionStorage.setItem(KEY, JSON.stringify({ y, ...(best || {}) })); } catch (e) {}
  });

  const go = (y) => {
    if (window.lenis && typeof window.lenis.scrollTo === 'function') window.lenis.scrollTo(y, { immediate: true, force: true });
    window.scrollTo(0, y);
  };

  /* voltar/avancar E recarregar: volta exatamente onde a pessoa estava
     (secao + distancia dentro dela). Link novo com #ancora: o MESMO ponto
     em que o menu leva (window.biAnchorTop, de js/UI.js). */
  const target = () => {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    const kind = nav && nav.type;
    if (kind === 'back_forward' || kind === 'reload') {
      try {
        const st = JSON.parse(sessionStorage.getItem(KEY) || 'null');
        if (st) {
          const el = st.id && document.getElementById(st.id);
          return el ? absTop(el) + st.off : st.y;
        }
      } catch (e) {}
    }
    if (location.hash.length > 1) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) {
        if (typeof window.biAnchorTop === 'function') return window.biAnchorTop(el);
        const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        return absTop(el) - margin;
      }
    }
    return null;
  };

  /* reaplica algumas vezes enquanto o layout assenta (fontes, imagens,
     pin-spacers do ScrollTrigger). Para assim que a pessoa rolar. */
  /* Para de vez assim que a pessoa fizer QUALQUER coisa (inclusive clicar
     no menu: antes o clique nao contava, e um refresh do ScrollTrigger no
     meio da rolagem puxava a pagina de volta — parecia que o clique
     "travava"). E nunca passa de 3s depois do load. */
  let done = false;
  const stop = () => {
    if (done) return;
    done = true;
    if (window.ScrollTrigger) window.ScrollTrigger.removeEventListener('refresh', apply);
  };
  ['wheel', 'touchstart', 'keydown', 'pointerdown', 'click'].forEach(ev =>
    window.addEventListener(ev, stop, { passive: true, capture: true, once: true }));

  function apply() { if (done) return; const y = target(); if (y != null) go(Math.max(0, y)); }

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) return;                       // bfcache: ja esta certo
    [0, 300, 900, 1800].forEach(ms => setTimeout(apply, ms));
    if (window.ScrollTrigger) window.ScrollTrigger.addEventListener('refresh', apply);
    window.addEventListener('load', () => {
      if (window.ScrollTrigger && !done) window.ScrollTrigger.addEventListener('refresh', apply);
      setTimeout(apply, 200);
      setTimeout(stop, 3000);
    }, { once: true });
  });
})();
