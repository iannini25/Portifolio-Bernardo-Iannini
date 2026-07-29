'use strict';

/* =========================================================
   ABOUT CARDS — contorno que ACENDE no hover seguindo o cursor, o MESMO
   efeito dos cards de Experiencia (.tl-card::before): um anel de 1px na
   borda com gradiente radial verde/lima que persegue o ponteiro.

   Injeta um elemento-anel (.about-card-ring) em cada card do painel lateral
   e escreve --mx/--my (%) no card sob o cursor (delegado na .about-side ->
   sobrevive a troca de idioma). O anel mascarado + o :hover (CSS) fazem o
   resto. Degrada: sem JS nao ha anel; no toque / reduced-motion nao ha
   follow (o :hover ainda acende o anel centrado). CSS par: .about-card-ring.
   ========================================================= */
(function () {
  const side = document.querySelector('.about-side');
  if (!side) return;

  // injeta o anel (1x por card)
  side.querySelectorAll('.about-card').forEach(card => {
    if (card.querySelector(':scope > .about-card-ring')) return;
    const ring = document.createElement('span');
    ring.className = 'about-card-ring';
    ring.setAttribute('aria-hidden', 'true');
    card.prepend(ring);
  });

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches) return;

  // cursor-follow: escreve --mx/--my (%) no card sob o cursor
  side.addEventListener('mousemove', e => {
    const card = e.target.closest('.about-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    card.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  }, { passive: true });
})();
