'use strict';

/* =========================================================
   PROJECTS — featured grid + GitHub CTA card + details modal
   ========================================================= */

const PROJ_ICONS = {
  arrowUpRight:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>',

  arrowDownLeft:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M17 7 7 17M15 17H7V9" stroke="currentColor" stroke-width="2.4" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>',

  github:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.14 8.96 7.49 10.41.55.1.75-.24.75-.53v-1.86c-3.04.66-3.68-1.45-3.68-1.45-.5-1.28-1.22-1.63-1.22-1.63-.99-.67.08-.66.08-.66 1.09.08 1.66 1.13 1.66 1.13.98 1.67 2.57 1.19 3.2.91.1-.71.38-1.19.69-1.46-2.43-.28-4.99-1.22-4.99-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.41.11-2.94 0 0 .92-.29 3.02 1.13A10.5 10.5 0 0 1 12 6.8c.94 0 1.88.13 2.77.38 2.1-1.42 3.02-1.13 3.02-1.13.6 1.53.22 2.66.11 2.94.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.14-5.01 5.41.39.34.73 1.02.73 2.07v3.07c0 .3.2.64.76.53 4.34-1.45 7.48-5.56 7.48-10.41C23.02 5.24 18.27.5 12 .5z"/></svg>',
};

/* =========================================================
   MODAL
   ========================================================= */

let currentProject = null;

function getProjectModalElements() {
  const dialog = document.getElementById('projModal');
  if (!dialog) return null;

  return {
    dialog,
    title:     dialog.querySelector('.proj-modal-title'),
    desc:      dialog.querySelector('.proj-modal-desc'),
    chipsWrap: dialog.querySelector('.proj-modal-chips'),
    btnClose:  dialog.querySelector('[data-close]'),
    btnRepo:   dialog.querySelector('.proj-modal-btn.github'),
    btnSite:   dialog.querySelector('.proj-modal-btn.primary'),
  };
}

function closeProjectModal() {
  const els = getProjectModalElements();
  if (!els) return;

  if (typeof els.dialog.close === 'function') {
    els.dialog.close();
  } else {
    els.dialog.removeAttribute('open');
  }
}

function openProjectModal(p) {
  const els = getProjectModalElements();
  if (!els || !p) return;

  currentProject = p;
  const ctas = I18N[LANG].projects.ctas;

  if (els.title) els.title.textContent = p.title || '';
  if (els.desc)  els.desc.textContent  = p.longDesc || p.desc || '';

  if (els.chipsWrap) {
    els.chipsWrap.innerHTML = '';
    (p.stack || []).forEach(tech => {
      const chip = document.createElement('span');
      chip.className = 'proj-modal-chip';
      chip.textContent = tech;
      els.chipsWrap.appendChild(chip);
    });
  }

  applyModalLink(els.btnRepo, p.repo, ctas.repo);
  applyModalLink(els.btnSite, p.link, ctas.site);

  if (typeof els.dialog.showModal === 'function') {
    els.dialog.showModal();
  } else {
    els.dialog.setAttribute('open', '');
  }
}

function applyModalLink(btn, href, label) {
  if (!btn) return;
  const labelEl = btn.querySelector('.proj-modal-btn-label');

  if (href) {
    btn.style.display = '';
    btn.href = href;
    if (labelEl) labelEl.textContent = label;
  } else {
    btn.style.display = 'none';
  }
}

(function setupProjectModal() {
  const els = getProjectModalElements();
  if (!els) return;

  if (els.btnClose) {
    els.btnClose.addEventListener('click', closeProjectModal);
  }

  els.dialog.addEventListener('click', e => {
    if (e.target === els.dialog) closeProjectModal();
  });

  els.dialog.addEventListener('cancel', e => {
    e.preventDefault();
    closeProjectModal();
  });
})();

/* =========================================================
   CARD BUILDERS
   ========================================================= */

function buildProjectCard(p) {
  const card = document.createElement('article');
  card.className = 'proj-card';
  if (p.featured) card.classList.add('proj-card--featured');

  const cover = p.cover
    ? `<img class="proj-cover" src="${p.cover}" alt="${p.title}" loading="lazy">`
    : `<div class="proj-cover proj-cover--placeholder" aria-hidden="true"></div>`;

  card.innerHTML = `
    <div class="proj-media">
      ${cover}
      <div class="proj-veil" aria-hidden="true"></div>
    </div>

    <div class="proj-content">
      <h3 class="proj-title">${p.title}</h3>
      <p class="proj-desc">${p.desc || ''}</p>
    </div>

    <span class="proj-arrow" aria-hidden="true">${PROJ_ICONS.arrowUpRight}</span>
    ${p.featured ? `<span class="proj-badge" aria-hidden="true">${PROJ_ICONS.arrowDownLeft}</span>` : ''}
  `;

  return card;
}

function buildCtaCard(href, labels) {
  const card = document.createElement('article');
  card.className = 'proj-cta';

  card.innerHTML = `
    <span class="proj-cta__icon" aria-hidden="true">${PROJ_ICONS.github}</span>
    <h3 class="proj-cta__title">${labels.title}</h3>
    <a class="proj-cta__btn" href="${href}" target="_blank" rel="noopener noreferrer">
      <span>${labels.btn}</span>
      ${PROJ_ICONS.arrowUpRight}
    </a>
  `;

  return card;
}

/* Compute the grid index where the CTA should be inserted so it lands at the
   middle column of the last row of a 3-column grid (matching the reference
   layout). Works for any number of projects. */
function computeCtaInsertIndex(projectCount, columns = 3) {
  if (projectCount <= 0) return 0;

  const totalCells = projectCount + 1;
  const rows = Math.ceil(totalCells / columns);
  const middleCol = Math.ceil(columns / 2);
  const position = (rows - 1) * columns + middleCol; // 1-based grid position

  return Math.max(0, Math.min(position - 1, projectCount));
}

/* =========================================================
   INTERACTIONS
   ========================================================= */

function bindCardInteractions(cardEl, project) {
  const enter = () => {
    cardEl.classList.remove('hover-out');
    cardEl.classList.add('hover-in');
  };

  const leave = () => {
    cardEl.classList.remove('hover-in');
    cardEl.classList.add('hover-out');
  };

  cardEl.addEventListener('mouseenter', enter);
  cardEl.addEventListener('mouseleave', leave);

  let touchTimer = null;
  cardEl.addEventListener('touchstart', () => {
    clearTimeout(touchTimer);
    enter();
    touchTimer = setTimeout(() => cardEl.classList.remove('hover-in'), 900);
  }, { passive: true });

  cardEl.addEventListener('click', () => openProjectModal(project));

  cardEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProjectModal(project);
    }
  });

  cardEl.tabIndex = 0;
  cardEl.setAttribute('role', 'button');
  cardEl.setAttribute('aria-label', project.title);
}

/* =========================================================
   RENDER
   ========================================================= */

function renderProjects(lang) {
  const grid = document.getElementById('projGrid');
  if (!grid) return;

  const data = I18N[lang].projects;
  const list = data.list || [];

  // Section heading
  const titleEl = document.querySelector('#projects .section-title');
  const subEl   = document.querySelector('#projects .section-sub');
  if (titleEl) titleEl.textContent = data.title;
  if (subEl)   subEl.textContent   = data.sub;

  // Build cards
  const cards = list.map(buildProjectCard);

  // GitHub CTA card (lives inside the grid, middle column of last row)
  const ctaCard = buildCtaCard(data.repoAll || 'https://github.com/iannini25', {
    title: data.ctaTitle,
    btn:   data.ctas.viewAll,
  });

  const ctaIndex = computeCtaInsertIndex(list.length, 3);
  cards.splice(ctaIndex, 0, ctaCard);

  grid.innerHTML = '';
  cards.forEach(el => grid.appendChild(el));

  // Wire interactions to real project cards only
  grid.querySelectorAll('.proj-card').forEach((cardEl, idx) => {
    const project = list[idx];
    if (project) bindCardInteractions(cardEl, project);
  });
}
