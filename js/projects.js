'use strict';

/* =========================================================
   PROJECTS SHOWCASE — sticky scroll com IntersectionObserver
   Esquerda rola, direita (sticky) troca conforme o card ativo.
   Sem libs. Mobile: vira cards empilhados (CSS cuida).
   ========================================================= */

let activeProjectId = null;
let psFitBound = false;

const psReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
   Deriva id (slug) quando faltar. */
function psPrepare(list) {
  return (list || [])
    .filter(p => p && p.cover && p.link)
    .map(p => ({
      ...p,
      id: p.id || psSlug(p.title),
    }));
}

/* hostname legivel a partir do link do projeto (pra barra do "browser") */
function psHost(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return String(link || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  }
}

/* ---------- CARD DA ESQUERDA ----------
   A capa vive numa "janela de browser" minimalista (barra com dots +
   URL mono) — irma do terminal do About. A area da imagem e um link
   pro projeto; o scrollfx poe o wipe de render e o cursor-chip. */
function buildShowcaseCard(p, labels) {
  const card = document.createElement('article');
  card.className = 'ps-card';
  card.dataset.id = p.id;

  const cover = p.cover
    ? `<img class="ps-card__img" src="${p.cover}" alt="${p.title}" loading="lazy" decoding="async">`
    : `<div class="ps-card__img ps-card__img--placeholder" aria-hidden="true"></div>`;

  card.innerHTML = `
    <div class="ps-card__media">
      <div class="ps-frame__bar" aria-hidden="true">
        <span class="ps-frame__dots"><i></i><i></i><i></i></span>
        <span class="ps-frame__url">${psHost(p.link)}</span>
      </div>
      <a class="ps-frame__view" href="${p.link}" target="_blank" rel="noopener noreferrer"
         aria-label="${p.title} — ${labels.visitBtn}">
        ${cover}
        <div class="ps-card__veil" aria-hidden="true"></div>
      </a>
    </div>

    <div class="ps-card__mobile">
      <h3 class="ps-card__title">${p.title}</h3>
      <p class="ps-card__desc">${p.desc || p.shortDesc || p.longDesc || ''}</p>
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

/* ---------- FIT-CHECK: o conteudo do painel NUNCA corta ----------
   tier 1 (--compact): tipografia compacta; tier 2 (--scroll): rola com
   fade nas bordas. Classes definidas no CSS da showcase. */
function psFitCheck() {
  const panel = document.querySelector('.ps-panel');
  const inner = document.querySelector('[data-ps-panel]');
  if (!panel || !inner) return;
  if (getComputedStyle(panel).display === 'none') return; // mobile: sem painel

  panel.classList.remove('ps-panel--compact', 'ps-panel--scroll');
  const fits = () => inner.scrollHeight <= panel.clientHeight - 16;
  if (fits()) return;
  panel.classList.add('ps-panel--compact');
  if (!fits()) panel.classList.add('ps-panel--scroll');
}

/* altura REAL da media (imagem 16:9) -> --ps-card-real no CSS, que
   centraliza o 1o/ultimo card com o painel sticky */
function psMeasureCard() {
  const section = document.querySelector('.projects-showcase');
  const media = document.querySelector('.ps-card__media');
  if (!section || !media) return;
  const h = media.offsetHeight;
  if (h) section.style.setProperty('--ps-card-real', `${h}px`);
}

/* entrada do conteudo novo do painel — GSAP quando disponivel (stagger +
   rule que se desenha); sem GSAP/reduced-motion, fica o fade do CSS */
function psPanelEnterFx(panel) {
  if (!window.gsap || psReducedMotion()) return;

  const tech = panel.querySelector('[data-ps-tech]');
  if (tech) tech.classList.add('is-fx'); // keyframe CSS das pills sai do caminho

  const parts = ['[data-ps-title-detail]', '[data-ps-desc]',
    '[data-ps-tech]', '.ps-panel__cta']
    .map(sel => panel.querySelector(sel)).filter(Boolean);
  const rule = panel.querySelector('[data-ps-rule]');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } });
  tl.fromTo(parts,
    { y: 16, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: .55, stagger: .055, clearProps: 'visibility' }, 0);
  if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: .7 }, .08);
}

/* ---------- PAINEL DIREITA (STICKY) ---------- */
function updatePanelTo(project, labels) {
  const panel = document.querySelector('[data-ps-panel]');
  if (!panel || !project) return;
  if (activeProjectId === project.id) return;
  activeProjectId = project.id;

  panel.classList.add('is-leaving');

  setTimeout(() => {
    const titleEl = panel.querySelector('[data-ps-title-detail]');
    const descEl  = panel.querySelector('[data-ps-desc]');
    const techEl  = panel.querySelector('[data-ps-tech]');
    const linkEl  = panel.querySelector('[data-ps-link]');
    const repoEl  = panel.querySelector('[data-ps-repo]');

    if (titleEl) titleEl.textContent = project.title;
    if (descEl)  descEl.textContent  = project.desc || project.shortDesc || project.longDesc || '';

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
    psFitCheck();
    psPanelEnterFx(panel.closest('.ps-panel') || panel);
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

/* ---------- SCROLL HINT ---------- */
let hintObserver = null;

function setupScrollHint() {
  const hint = document.querySelector('[data-ps-hint]');
  const head = document.querySelector('.ps-head');
  if (!hint || !head) return;

  // re-render (i18n) chama de novo: desconecta o anterior pra nao acumular
  if (hintObserver) hintObserver.disconnect();
  hintObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => hint.classList.toggle('is-hidden', !e.isIntersecting));
  }, { threshold: 0.1 });
  hintObserver.observe(head);
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

  /* PLACEHOLDER "em construção" (data-ps-soon na section): a showcase
     fica oculta pelo CSS e nada precisa ser montado — o placeholder é
     HTML estático traduzido pelo applyI18n. PARA REATIVAR os projetos
     basta remover o atributo data-ps-soon da <section id="projects">;
     todo o código abaixo volta a rodar normalmente. */
  if (document.querySelector('#projects[data-ps-soon]')) return;

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

  // label do cursor-chip que segue o mouse sobre as capas (scrollfx)
  list.dataset.visitLabel = labels.visitBtn;

  list.innerHTML = '';
  projects.forEach(p => list.appendChild(buildShowcaseCard(p, labels)));

  activeProjectId = null;
  if (projects[0]) updatePanelTo(projects[0], labels);

  setupObserver(projects, labels);
  setupScrollHint();
  setupReposCta(data);

  // mede a media 16:9 (centragem do sticky) e garante painel sem corte;
  // refaz nos resizes
  psMeasureCard();
  psFitCheck();
  if (!psFitBound) {
    let fitRaf = null;
    window.addEventListener('resize', () => {
      if (fitRaf) return;
      fitRaf = requestAnimationFrame(() => { fitRaf = null; psMeasureCard(); psFitCheck(); });
    }, { passive: true });
    psFitBound = true;
  }
}

/* expor pro language.js */
window.renderProjects = renderProjects;
