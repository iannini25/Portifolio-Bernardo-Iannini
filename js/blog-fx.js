'use strict';

/* ============================================================
   BLOG FX — contorno que segue o cursor nos cards do blog.

   Mesma camada que o scrollfx faz na landing (projetos e
   experiencia): escreve so as CSS VARS --mx/--my (em %) no card
   sob o ponteiro; quem desenha e o CSS (o ::before/::after
   mascarado no anel de 1px da borda, em blog.css).

   Padroniza o blog com o resto do site sem duplicar efeito:
   nada de transform aqui, entao NAO briga com o hover/scale que
   o CSS ja faz nos cards.

   · delegado no documento -> sobrevive a re-render da lista
     (filtros/busca do blog.js recriam os cards)
   · throttle por rAF (1 escrita de var por frame)
   · so mouse fino; no toque o CSS ja esconde o contorno
   ============================================================ */
(function blogCursorOutline() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!fine.matches) return;

  /* prefers-reduced-motion: o anel que persegue o cursor e puro adorno;
     com a preferencia ativa nem liga o efeito (o CSS ja zera as transitions) */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* alvos: cards da lista de posts + tiles do bento de identidade (blog.html)
     + cards de "leia tambem" das paginas internas de post (posts/*.html) */
  const SEL = '.blog-post-card, .bid-tile:not(.bid-center), .post-related-card';

  let raf = 0;
  let pending = null;   // { el, x, y }

  function flush() {
    raf = 0;
    if (!pending) return;
    const { el, x, y } = pending;
    el.style.setProperty('--mx', x.toFixed(1) + '%');
    el.style.setProperty('--my', y.toFixed(1) + '%');
  }

  document.addEventListener('mousemove', e => {
    const el = e.target.closest?.(SEL);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    pending = {
      el,
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
    if (!raf) raf = requestAnimationFrame(flush);
  }, { passive: true });
})();
