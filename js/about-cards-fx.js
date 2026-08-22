'use strict';

/* =========================================================
   ABOUT CARDS — contorno que ACENDE no hover seguindo o cursor.
   ========================================================= */
(function () {
  const side = document.querySelector('.about-side');
  if (!side) return;

  side.querySelectorAll('.about-card').forEach(card => {
    if (card.querySelector(':scope > .about-card-ring')) return;
    const ring = document.createElement('span');
    ring.className = 'about-card-ring';
    ring.setAttribute('aria-hidden', 'true');
    card.prepend(ring);
  });

  side.addEventListener('mousemove', e => {
    const card = e.target.closest('.about-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    card.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  }, { passive: true });
})();
