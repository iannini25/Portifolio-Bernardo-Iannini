'use strict';

/* =========================================================
   SKILLS
   ========================================================= */

function renderSkills(lang) {
  const S = I18N[lang].skills;

  const title = document.querySelector('#skills .section-title');
  const sub = document.querySelector('#skills .section-sub');

  if (title) title.textContent = S.title;
  if (sub) sub.textContent = S.sub;

  const tiles = document.querySelectorAll('.skills-tiles .tile-square');
  const keysByIndex = ['os', 'programming', 'web', 'creative'];

  tiles.forEach((tile, i) => {
    const key = tile.getAttribute('data-label-key') || keysByIndex[i];
    const label = S.tilesLabels[key] || '';
    if (label) tile.setAttribute('data-label', label);
  });
}

// Toggle de abrir/fechar os tiles
document.querySelectorAll('.skills-tiles .tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const isOpen = tile.classList.toggle('open');
    tile.setAttribute('aria-expanded', String(isOpen));
  });
});

// Sheen na borda dos quadrados
document.querySelectorAll('.skills-tiles .tile-square').forEach(tile => {
  tile.addEventListener('pointermove', e => {
    const r = tile.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    tile.style.setProperty('--sheen-x', `${x}%`);
  });
  tile.addEventListener('pointerleave', () =>
    tile.style.setProperty('--sheen-x', '-20%')
  );
});

function refreshSkillItemTooltips() {
  document.querySelectorAll('.skills-tiles .reveal-grid li').forEach(li => {
    const current = li.getAttribute('data-label');
    if (current && current.trim()) return;

    const img = li.querySelector('img, svg');
    const fromAlt =
      img?.getAttribute('alt') ||
      img?.getAttribute('aria-label') ||
      img?.getAttribute('data-name') ||
      '';

    if (fromAlt.trim()) {
      li.setAttribute('data-label', fromAlt.trim());
      li.setAttribute('title', fromAlt.trim());
    }
  });
}
