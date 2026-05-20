'use strict';

/* =========================================================
   PROJECTS SHOWCASE — sticky scroll com IntersectionObserver
   Esquerda rola, direita (sticky) troca conforme o card ativo.
   Sem libs. Mobile: vira cards empilhados (CSS cuida).
   ========================================================= */

let progressRaf = null;
let progressBound = false;
let activeProjectId = null;

const PS_ICONS = {
  arrowUpRight:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* slug a partir do título (sem acento, lowercase, hifenizado) */
function psSlug(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

/* Só projetos reais entram na showcase: precisa de capa E link.
   Deriva id (slug) e number ("01"...) quando faltarem. */
function psPrepare(list) {
  return (list || [])
    .filter(p => p && p.cover && p.link)
    .map((p, i) => ({
      ...p,
      id: p.id || psSlug(p.title),
      number: p.number || String(i + 1).padStart(2, '0'),
    }));
}

/* ---------- CARD DA ESQUERDA ---------- */
function buildShowcaseCard(p, labels) {
  const card = document.createElement('article');
  card.className = 'ps-card';
  card.dataset.id = p.id;
  card.dataset.number = p.number;

  const cover = p.cover
    ? `<img class="ps-card__img" src="${p.cover}" alt="${p.title}" loading="lazy" decoding="async">`
    : `<div class="ps-card__img ps-card__img--placeholder" aria-hidden="true"></div>`;

  card.innerHTML = `
    <div class="ps-card__media">
      ${cover}
      <div class="ps-card__veil" aria-hidden="true"></div>
      <span class="ps-card__num">${p.number}</span>
    </div>

    <div class="ps-card__mobile">
      <h3 class="ps-card__title">${p.title}</h3>
      <p class="ps-card__desc">${p.longDesc || p.shortDesc || p.desc || ''}</p>
      <div class="ps-card__tech">
        ${(p.stack || []).map((t, i) =>
          `<span class="ps-pill" style="--i:${i}">${t}</span>`).join('')}
      </div>
      ${p.link ? `<a class="ps-cta ps-cta--primary" href="${p.link}" target="_blank" rel="noopener noreferrer">
        <span>${labels.visitBtn}</span>${PS_ICONS.arrowUpRight}
      </a>` : ''}
    </div>
  `;
  return card;
}

/* ---------- PAINEL DIREITA (STICKY) ---------- */
function updatePanelTo(project, labels) {
  const panel = document.querySelector('[data-ps-panel]');
  if (!panel || !project) return;
  if (activeProjectId === project.id) return;
  activeProjectId = project.id;

  panel.classList.add('is-leaving');

  setTimeout(() => {
    const numEl   = panel.querySelector('[data-ps-num]');
    const titleEl = panel.querySelector('[data-ps-title-detail]');
    const descEl  = panel.querySelector('[data-ps-desc]');
    const techEl  = panel.querySelector('[data-ps-tech]');
    const linkEl  = panel.querySelector('[data-ps-link]');
    const repoEl  = panel.querySelector('[data-ps-repo]');

    if (numEl)   numEl.textContent   = project.number;
    if (titleEl) titleEl.textContent = project.title;
    if (descEl)  descEl.textContent  = project.longDesc || project.shortDesc || project.desc || '';

    if (techEl) {
      techEl.innerHTML = (project.stack || [])
        .map((tech, i) => `<span class="ps-pill" style="--i:${i}">${tech}</span>`)
        .join('');
    }

    if (linkEl) {
      if (project.link) {
        linkEl.href = project.link;
        linkEl.style.display = '';
        const lbl = linkEl.querySelector('[data-ps-link-label]');
        if (lbl) lbl.textContent = labels.visitBtn;
      } else {
        linkEl.style.display = 'none';
      }
    }

    if (repoEl) {
      if (project.repo) {
        repoEl.href = project.repo;
        repoEl.style.display = '';
        const lbl = repoEl.querySelector('[data-ps-repo-label]');
        if (lbl) lbl.textContent = labels.repoBtn;
      } else {
        repoEl.style.display = 'none';
      }
    }

    if (project.accent) {
      panel.style.setProperty('--ps-accent', project.accent);
    } else {
      panel.style.removeProperty('--ps-accent');
    }

    panel.classList.remove('is-leaving');
  }, 200);
}

/* ---------- OBSERVER: detecta o card no centro da tela ----------
   A esquerda rola normal. Quando um card cruza o CENTRO do viewport,
   o painel da direita (que esta sticky/grudado via CSS) troca de
   conteudo pra esse projeto. A direita NAO se move — so muda o texto. */
let projectsObserver = null;

function setupObserver(projects, labels) {
  if (projectsObserver) projectsObserver.disconnect();

  projectsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.dataset.id;
      const project = projects.find(p => p.id === id);
      if (project) updatePanelTo(project, labels);
      document.querySelectorAll('.ps-card').forEach(card =>
        card.classList.toggle('is-active', card.dataset.id === id));
    });
  }, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  document.querySelectorAll('.ps-card').forEach(card =>
    projectsObserver.observe(card));
}

/* ---------- PROGRESS BAR (progresso ao longo da lista) ---------- */
function setupProgressBar() {
  const listEl = document.querySelector('[data-ps-list]');
  const bar = document.querySelector('[data-ps-bar]');
  if (!listEl || !bar) return;

  const update = () => {
    progressRaf = null;
    const rect = listEl.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 quando o topo da lista chega ao centro; 1 quando o fim passa
    const span = rect.height - vh * 0.5;
    const passed = (vh * 0.5) - rect.top;
    const pct = span > 0 ? Math.max(0, Math.min(1, passed / span)) : 0;
    bar.style.transform = `scaleX(${pct.toFixed(4)})`;
  };

  if (!progressBound) {
    window.addEventListener('scroll', () => {
      if (progressRaf) return;
      progressRaf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', () => {
      if (progressRaf) return;
      progressRaf = requestAnimationFrame(update);
    }, { passive: true });
    progressBound = true;
  }
  update();
}

/* ---------- SCROLL HINT ---------- */
function setupScrollHint() {
  const hint = document.querySelector('[data-ps-hint]');
  const head = document.querySelector('.ps-head');
  if (!hint || !head) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => hint.classList.toggle('is-hidden', !e.isIntersecting));
  }, { threshold: 0.1 });
  obs.observe(head);
}

/* ---------- CTA: todos os repositórios ---------- */
function setupReposCta(data) {
  const wrap = document.querySelector('[data-ps-repos]');
  const link = document.querySelector('[data-ps-repos-link]');
  const lbl  = document.querySelector('[data-ps-repos-label]');
  if (!wrap || !link) return;

  const href = data.repoAll || 'https://github.com/iannini25';
  if (href) {
    link.href = href;
    if (lbl) lbl.textContent = data.ctaTitle || (data.ctas && data.ctas.viewAll) || 'GitHub';
    wrap.style.display = '';
  } else {
    wrap.style.display = 'none';
  }
}

/* ---------- RENDER PRINCIPAL (i18n) ---------- */
function renderProjects(lang) {
  const list = document.querySelector('[data-ps-list]');
  if (!list) return;

  const data = I18N[lang].projects;
  const projects = psPrepare(data.list);
  const labels = data.showcase || {
    kicker: 'Featured Work',
    title: 'Featured Work',
    visitBtn: 'Visit Project',
    repoBtn: 'Source',
    scrollHint: 'scroll to explore',
  };

  const kickerEl = document.querySelector('[data-ps-kicker]');
  const titleEl  = document.querySelector('[data-ps-title]');
  const hintLbl  = document.querySelector('[data-ps-hint-label]');
  if (kickerEl) kickerEl.textContent = labels.kicker;
  if (titleEl)  titleEl.textContent  = labels.title;
  if (hintLbl)  hintLbl.textContent  = labels.scrollHint;

  list.innerHTML = '';
  projects.forEach(p => list.appendChild(buildShowcaseCard(p, labels)));

  activeProjectId = null;
  if (projects[0]) updatePanelTo(projects[0], labels);

  setupObserver(projects, labels);
  setupProgressBar();
  setupScrollHint();
  setupReposCta(data);
}

/* expor pro language.js */
window.renderProjects = renderProjects;
