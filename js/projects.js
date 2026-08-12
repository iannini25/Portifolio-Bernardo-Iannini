'use strict';

/* =========================================================
   PROJECTS — "A BANCADA VIVA" (catálogo completo)
   Três atos: pilha de janelas (featured), linha de comando
   (filtros) e arquivo (fileiras que respiram no hover).

   Este arquivo cuida de DADOS + INTERAÇÃO (render i18n, swap
   da pilha, filtros/FLIP, hover-expand das fileiras, teclado).
   A camada de motion ambiente (pulsos das guias, anel de
   proximidade, reveals de scroll) vive em js/scrollfx.js e é
   reconstruída via 'pj:rendered' / MutationObserver.

   Degradação: sem GSAP tudo funciona com transições CSS ou
   troca instantânea; sem hover (touch) os cards mostram a
   régua completa e o tap navega direto (CSS cuida).
   ========================================================= */

let pjActiveFilter = 'all';
let pjStackOrder = [];        /* ids na ordem [frente, trás-1, trás-2] */
let pjSwapBusy = false;
let pjBound = false;          /* listeners são delegados e presos UMA vez */

/* ---- auto-rotação do featured: cada projeto fica PJ_AUTO_MS (6s) e troca ----
   Tempo fixo por projeto. A janela da frente toca o preview desde o começo
   (reset no pjPromote), e a troca acontece aos 6s. Nunca troca quando é
   inútil/proibido (fora da tela, aba oculta, reduced-motion): nesses casos
   re-checa sozinho sem prender. Interação manual REINICIA a contagem. */
const pjTouchMode = window.matchMedia('(hover: none)').matches;
const PJ_AUTO_MS = 6000;   /* tempo fixo de cada projeto em destaque */
let pjAutoTimer = null;

/* contexto do render atual — os handlers delegados leem daqui, então a
   troca de idioma (re-render) nunca deixa closure velha viva */
const pjCtx = { projects: [], featured: [], data: null };

const pjReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* tier atual (js/perf-tier.js grava em <html data-perf>). Fallback
   'high' se o script nao rodou — nao pune quem tem o site sem o gate. */
const pjPerf = () =>
  document.documentElement.dataset.perf || 'high';

/* Videos de preview sao o maior custo da section (decode H.264 em
   paralelo). A capa .webp e exatamente o que o usuario ve com o video
   pausado no poster — visual identico.
   low    → nenhum <video> (so img)
   medium → video so na pilha featured
   high   → featured + arquivo */
const pjWantVideo = (where) => {
  const t = pjPerf();
  if (t === 'low') return false;
  if (t === 'medium') return where === 'featured';
  return true;
};

/* featured com QUALQUER parte na viewport (medido na hora — à prova de
   flag presa; um getBoundingClientRect a cada 5s é irrelevante) */
function pjFeaturedVisible() {
  const wrap = document.querySelector('[data-pj-featured]');
  if (!wrap || wrap.style.display === 'none') return false;
  const r = wrap.getBoundingClientRect();
  return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
}

/* vídeo (preview) da janela da frente, se houver */
function pjFrontVideo() {
  const stack = document.querySelector('[data-pj-stack]');
  const win = stack && stack.querySelector('.pj-win.is-front');
  return (win && win.querySelector('video.pj-win__img')) || null;
}

/* limpa o timer pendente da rotação */
function pjClearAdvance() {
  clearTimeout(pjAutoTimer);
  pjAutoTimer = null;
}

/* troca pra próxima janela, respeitando visibilidade/reduced-motion.
   Quando trocar é inútil/proibido, re-checa em 1s sem prender. */
function pjAdvance() {
  pjClearAdvance();
  const featured = pjCtx.featured;
  if (featured.length < 2) return;
  if (document.hidden || pjReducedMotion() || !pjFeaturedVisible()) {
    pjAutoTimer = setTimeout(pjAdvance, 1000);
    return;
  }
  /* troca em andamento: espera assentar e re-tenta (senão pjPromote sai
     cedo por pjSwapBusy e a rotação não se re-agenda) */
  if (pjSwapBusy) { pjAutoTimer = setTimeout(pjAdvance, 700); return; }
  const i = featured.findIndex(p => p.id === pjStackOrder[0]);
  const next = featured[(i + 1) % featured.length];
  if (next) pjPromote(next.id); /* pjPromote re-agenda no fim */
}

/* agenda a próxima troca: tempo FIXO de PJ_AUTO_MS (6s) por projeto. O vídeo
   da frente é reiniciado no pjPromote e roda em loop; a troca vem aos 6s.
   Chamado no setup, em cada promoção e ao voltar pra aba. */
function pjScheduleAdvance() {
  pjClearAdvance();
  if (pjCtx.featured.length < 2) return;
  pjAutoTimer = setTimeout(pjAdvance, PJ_AUTO_MS);
}

const PJ_ICONS = {
  arrowUpRight:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* slug a partir do título (sem acento, lowercase, hifenizado) */
function pjSlug(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

/* Só projetos reais entram: precisa de capa E link. Deriva id quando
   faltar; category cai em "personal" se alguém esquecer o campo. */
function pjPrepare(list) {
  return (list || [])
    .filter(p => p && p.cover && p.link)
    .map(p => ({
      ...p,
      id: p.id || pjSlug(p.title),
      category: p.category || 'personal',
    }));
}

/* hostname legível a partir do link (barra da "janela de browser") */
function pjHost(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return String(link || '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  }
}

function pjCaseHref(p) {
  return `project.html?slug=${encodeURIComponent(p.id)}`;
}

/* mídia do card/janela: preview animado (mp4/webm) quando existir
   E o tier de performance permitir; senão a capa estática. O <video>
   nasce pausado; play/pause por hover+viewport fica no scrollfx
   (só desktop / só high|medium conforme o caso). */
function pjMediaHTML(p, imgClass, where) {
  if (p.preview && pjWantVideo(where)) {
    /* sites = preview é um scroll-through do site inteiro; roda mais devagar
       que o padrão (data-rate lido no scrollfx). Logos dos sistemas ficam 1x. */
    const rate = p.category === 'site' ? ' data-rate="0.5"' : '';
    /* preload="none" e nao "metadata": sao 11 previews somando 54MB, e
       "metadata" fazia o browser abrir requisicao pra TODOS eles no load,
       mesmo os que nunca aparecem na tela. O poster (a capa .webp) e o que
       o usuario ve parado, e quem toca chama .play() (pjMediaHTML e usado
       pela pilha, que da play so no card da frente). Visual identico,
       11 requisicoes de video a menos no carregamento. */
    return `<video class="${imgClass}" src="${p.preview}" poster="${p.cover}"${rate}
      muted loop playsinline preload="none" aria-label="${p.title}"></video>`;
  }
  return `<img class="${imgClass}" src="${p.cover}" alt="${p.title}" loading="lazy" decoding="async">`;
}

/* =========================================================
   ATO 1 — PILHA DE JANELAS (featured)
   ========================================================= */

/* slots visuais da pilha: 0 = frente, 1 = trás-direita, 2 = trás-esquerda.
   As classes .is-slot-N carregam transform/filtro no CSS; o swap só
   troca classes (GSAP-free) — a transição CSS faz a coreografia. */
function buildFeaturedWindow(p, slot) {
  const win = document.createElement('article');
  win.className = `pj-win is-slot-${slot}${slot === 0 ? ' is-front' : ''}`;
  win.dataset.id = p.id;
  win.innerHTML = `
    <div class="ps-frame__bar" aria-hidden="true">
      <span class="ps-frame__dots"><i></i><i></i><i></i></span>
      <span class="ps-frame__url">${pjHost(p.link)}</span>
    </div>
    <a class="pj-win__view ps-frame__view" href="${pjCaseHref(p)}" tabindex="${slot === 0 ? 0 : -1}"
       aria-label="${p.title}">
      ${pjMediaHTML(p, 'pj-win__img', 'featured')}
      <span class="pj-win__veil" aria-hidden="true"></span>
    </a>
  `;
  return win;
}

function pjFeaturedList(projects) {
  return projects
    .filter(p => p.featured)
    .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99))
    .slice(0, 3);
}

/* painel de texto do projeto ativo (crossfade no swap) */
function pjUpdatePanel(project, data) {
  const panel = document.querySelector('[data-pj-panel]');
  if (!panel || !project) return;

  const cats = (data.catalog && data.catalog.cats) || {};
  const caseLabels = data.case || {};

  const write = () => {
    const catEl  = panel.querySelector('[data-pj-cat]');
    const title  = panel.querySelector('[data-pj-title-detail]');
    const desc   = panel.querySelector('[data-pj-desc]');
    const tech   = panel.querySelector('[data-pj-tech]');
    const caseEl = panel.querySelector('[data-pj-case]');
    const linkEl = panel.querySelector('[data-pj-link]');

    if (catEl) catEl.textContent = cats[project.category] || project.category;
    if (title) title.textContent = project.title;
    if (desc)  desc.textContent  = project.desc || '';
    if (tech) {
      tech.classList.remove('is-fx');
      tech.innerHTML = (project.stack || [])
        .map((t, i) => `<span class="ps-pill" style="--i:${i}">${t}</span>`).join('');
    }
    if (caseEl) {
      caseEl.href = pjCaseHref(project);
      const lbl = caseEl.querySelector('[data-pj-case-label]');
      if (lbl) lbl.textContent = caseLabels.viewCase || 'View case study';
    }
    if (linkEl) {
      linkEl.href = project.link;
      const lbl = linkEl.querySelector('[data-pj-link-label]');
      if (lbl) lbl.textContent = caseLabels.visitSite || 'Visit live site';
    }
  };

  /* crossfade discreto com GSAP quando disponível; senão troca direta */
  if (window.gsap && !pjReducedMotion()) {
    const parts = ['.pj-panel__meta', '[data-pj-title-detail]', '[data-pj-desc]',
      '[data-pj-tech]', '.pj-panel__cta'].map(s => panel.querySelector(s)).filter(Boolean);
    gsap.to(parts, {
      autoAlpha: 0, y: -8, duration: .18, ease: 'power2.in', stagger: .02,
      onComplete: () => {
        write();
        /* o crossfade do container é a entrada — desliga a keyframe
           própria das pills (senão cada rotação re-toca a cascata de
           ~680ms por cima do fade e o painel fica nervoso) */
        const tech = panel.querySelector('[data-pj-tech]');
        if (tech) tech.classList.add('is-fx');
        gsap.fromTo(parts, { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: .45, ease: 'power3.out', stagger: .05, clearProps: 'visibility' });
      },
    });
  } else {
    write();
  }
}

/* dots 01 02 03 sob o painel. Atualiza IN PLACE quando os botões já
   existem — reconstruir o innerHTML no promote destruía o botão focado
   (foco caía pro body e o focusout religava a auto-rotação no meio da
   interação). Reconstrução completa só no render i18n. */
function pjUpdateNav(featured, activeId) {
  const nav = document.querySelector('[data-pj-nav]');
  if (!nav) return;

  const dots = nav.querySelectorAll('.pj-panel__dot');
  const sameSet = dots.length === featured.length &&
    featured.every(p => nav.querySelector(`[data-pj-goto="${p.id}"]`));
  if (sameSet) {
    dots.forEach(b => {
      const on = b.dataset.pjGoto === activeId;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
      /* label acompanha o idioma atual (o in-place também roda no i18n) */
      const p = featured.find(x => x.id === b.dataset.pjGoto);
      if (p) b.setAttribute('aria-label', p.title);
    });
    return;
  }

  nav.innerHTML = featured.map((p, i) => `
    <button type="button" class="pj-panel__dot${p.id === activeId ? ' is-on' : ''}"
      data-pj-goto="${p.id}" aria-label="${p.title}"
      aria-pressed="${p.id === activeId}">${String(i + 1).padStart(2, '0')}</button>
  `).join('');
}

/* promove a janela `id` pra frente da pilha */
function pjPromote(id) {
  const featured = pjCtx.featured, data = pjCtx.data;
  if (pjSwapBusy) return;
  const from = pjStackOrder.indexOf(id);
  if (from <= 0) return; // já é a frente (ou não existe)

  pjSwapBusy = true;
  /* nova ordem: clicada vira frente; as outras mantêm ordem relativa */
  pjStackOrder = [id, ...pjStackOrder.filter(x => x !== id)];

  const stack = document.querySelector('[data-pj-stack]');
  if (stack) {
    pjStackOrder.forEach((pid, slot) => {
      const win = stack.querySelector(`.pj-win[data-id="${pid}"]`);
      if (!win) return;
      win.classList.remove('is-slot-0', 'is-slot-1', 'is-slot-2', 'is-front');
      win.classList.add(`is-slot-${slot}`);
      if (slot === 0) win.classList.add('is-front');
      const view = win.querySelector('.pj-win__view');
      if (view) view.tabIndex = slot === 0 ? 0 : -1;
      /* janela que saiu da frente volta pro POSTER (a capa): sem reset ela
         congela no último frame preto do vídeo já tocado. load() reexibe o
         poster (ex.: athena7 no fundo mostra img/athena7-cover.webp). */
      const bv = win.querySelector('video.pj-win__img');
      if (bv && slot !== 0) { try { bv.pause(); bv.load(); } catch (e) {} }
    });
  }

  const project = featured.find(p => p.id === id);
  pjUpdatePanel(project, data);
  pjUpdateNav(featured, id);

  /* trava re-cliques até a coreografia CSS assentar (~.65s) */
  setTimeout(() => { pjSwapBusy = false; }, pjReducedMotion() ? 0 : 620);

  /* o novo da frente toca desde o começo — so se o tier permitir video.
     Em low nao ha <video>; em medium/high o scrollfx tambem sincroniza. */
  const fv = pjFrontVideo();
  if (fv && pjWantVideo('featured')) {
    try { fv.currentTime = 0; } catch (e) {}
    const play = () => { fv.play?.().catch(() => {}); };
    if (typeof window.biWhenAssetReady === 'function') {
      window.biWhenAssetReady(fv.getAttribute('src') || '', play);
    } else play();
  }
  pjScheduleAdvance();
}

function pjSetupFeatured() {
  const stack = document.querySelector('[data-pj-stack]');
  const featuredWrap = document.querySelector('[data-pj-featured]');
  if (!stack || !featuredWrap) return;

  const featured = pjCtx.featured;
  if (!featured.length) { featuredWrap.style.display = 'none'; return; }
  featuredWrap.style.display = '';

  /* preserva a ordem atual da pilha entre re-renders (troca de idioma) */
  const sameSet = pjStackOrder.length === featured.length &&
    featured.every(p => pjStackOrder.includes(p.id));
  if (!sameSet) pjStackOrder = featured.map(p => p.id);

  stack.innerHTML = '';
  pjStackOrder.forEach((id, slot) => {
    const p = featured.find(x => x.id === id);
    if (p) stack.appendChild(buildFeaturedWindow(p, slot));
  });

  const activeId = pjStackOrder[0];
  const active = featured.find(p => p.id === activeId);
  pjUpdatePanel(active, pjCtx.data);
  pjUpdateNav(featured, activeId);

  /* (re)agenda a rotação pro vídeo da frente atual — cobre também o
     rebuild na troca de idioma, que recria os elementos <video> */
  pjScheduleAdvance();
}

/* =========================================================
   ATO 2 — LINHA DE COMANDO (filtros por categoria)
   ========================================================= */

const PJ_CAT_ORDER = ['all', 'system', 'site', 'automation', 'personal'];

function pjCounterText(shown, total, cat) {
  const c = cat || {};
  if (pjActiveFilter !== 'all') {
    return (c.countFiltered || '→ {n} of {total}')
      .replace('{n}', shown).replace('{total}', total);
  }
  if (shown === 1) return c.countOne || '→ 1 project';
  return (c.count || '→ {n} projects').replace('{n}', shown);
}

function pjSetupFilters() {
  const bar = document.querySelector('[data-pj-filters]');
  const countEl = document.querySelector('[data-pj-count]');
  if (!bar) return;

  const projects = pjCtx.projects;
  const cat = (pjCtx.data && pjCtx.data.catalog) || {};
  const cats = cat.cats || {};

  /* só categorias com >=1 projeto viram chip (nunca filtro morto) */
  const available = PJ_CAT_ORDER.filter(slug =>
    slug === 'all' || projects.some(p => p.category === slug));

  /* filtro ativo pode ter sumido num re-render — volta pro all */
  if (!available.includes(pjActiveFilter)) pjActiveFilter = 'all';

  bar.innerHTML = available.map(slug => `
    <button type="button" class="pj-filter${slug === pjActiveFilter ? ' is-on' : ''}"
      data-pj-filter="${slug}" aria-pressed="${slug === pjActiveFilter}">
      ${cats[slug] || slug}
    </button>
  `).join('');

  /* sublinhado que viaja entre os chips (a transicao CSS faz a viagem) */
  const ink = document.createElement('span');
  ink.className = 'pj-cli__ink';
  ink.setAttribute('aria-hidden', 'true');
  bar.appendChild(ink);
  pjMoveInk();

  if (countEl) {
    const shown = pjActiveFilter === 'all'
      ? projects.length
      : projects.filter(p => p.category === pjActiveFilter).length;
    countEl.textContent = pjCounterText(shown, projects.length, cat);
  }
}

/* posiciona o sublinhado sob o chip ativo (chamado no render, no clique
   e no resize) */
function pjMoveInk() {
  const bar = document.querySelector('[data-pj-filters]');
  const ink = bar && bar.querySelector('.pj-cli__ink');
  const on = bar && bar.querySelector('.pj-filter.is-on');
  if (!ink || !on) return;
  ink.style.transform = `translateX(${on.offsetLeft}px) translateY(${on.offsetTop + on.offsetHeight - ink.offsetHeight}px)`;
  ink.style.width = `${on.offsetWidth}px`;
}

/* =========================================================
   ATO 3 — O ARQUIVO (fileiras que respiram)
   ========================================================= */

/* card do arquivo: PLACA DE GALERIA — só o screenshot num frame limpo
   (sem chrome de browser), dessaturado e quieto no repouso; ganha COR no
   hover. Título/categoria numa legenda editorial ABAIXO do frame. */
function buildArchCard(p, data) {
  const cats = (data.catalog && data.catalog.cats) || {};
  const caseLabels = data.case || {};
  const card = document.createElement('article');
  card.className = 'pj-card';
  card.dataset.id = p.id;
  card.dataset.cat = p.category;
  /* o Flip casa card antigo -> novo por este id (sem ele, getState de
     elementos destruídos + elementos novos = nada viaja no filtro) */
  card.setAttribute('data-flip-id', p.id);

  card.innerHTML = `
    <a class="pj-card__frame ps-frame__view" href="${pjCaseHref(p)}"
       aria-label="${p.title} · ${caseLabels.viewCase || 'View case study'}">
      <span class="pj-card__view">
        ${pjMediaHTML(p, 'pj-card__img', 'archive')}
      </span>
    </a>
    <div class="pj-card__cap">
      <span class="pj-card__title">${p.title}</span>
      <span class="pj-card__catlabel">${cats[p.category] || p.category}</span>
    </div>
  `;
  return card;
}

/* agrupa em fileiras de 3 — cada fileira é um grid próprio, pro hover
   só re-ponderar as colunas da própria fileira */
function pjChunkRows(cards) {
  const rows = [];
  for (let i = 0; i < cards.length; i += 3) rows.push(cards.slice(i, i + 3));
  return rows;
}

function pjMountRows(arch, cards) {
  arch.innerHTML = '';
  pjChunkRows(cards).forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'pj-row';
    rowEl.dataset.n = row.length;
    row.forEach(card => rowEl.appendChild(card));
    arch.appendChild(rowEl);
  });
}

/* hover-expand: o card sob o cursor vira data-hot da fileira; o CSS
   anima grid-template-columns (vizinhos cedem num único layout pass).
   focus-within espelha pro teclado. No touch (hover: none) os eventos
   de mouse SINTÉTICOS do tap não armam o estado — o tap navega direto
   e a gaveta já é conteúdo estático (CSS cuida). */
function pjBindRowHover(arch) {
  const touch = window.matchMedia('(hover: none)');
  const setHot = (card, on) => {
    const row = card.closest('.pj-row');
    if (!row) return;
    const idx = [...row.children].indexOf(card);
    if (on) {
      row.dataset.hot = idx;
      card.classList.add('is-hot');
    } else if (row.dataset.hot === String(idx)) {
      delete row.dataset.hot;
      card.classList.remove('is-hot');
    }
    row.querySelectorAll('.pj-card').forEach(c => {
      if (c !== card || !on) c.classList.remove('is-hot');
    });
  };

  arch.addEventListener('mouseover', e => {
    if (touch.matches) return;
    const card = e.target.closest('.pj-card');
    if (card) setHot(card, true);
  });
  arch.addEventListener('mouseout', e => {
    if (touch.matches) return;
    const card = e.target.closest('.pj-card');
    if (card && !card.contains(e.relatedTarget)) setHot(card, false);
  });
  arch.addEventListener('focusin', e => {
    if (touch.matches) return;
    const card = e.target.closest('.pj-card');
    if (card) setHot(card, true);
  });
  arch.addEventListener('focusout', e => {
    const card = e.target.closest('.pj-card');
    if (card && !card.contains(e.relatedTarget)) setHot(card, false);
  });
}

/* aplica o filtro. Com GSAP Flip: cards navegam pra nova posição
   (getState → re-chunk → Flip.from). Sem Flip: troca instantânea. */
function pjApplyFilter(slug) {
  const projects = pjCtx.projects, data = pjCtx.data;
  pjActiveFilter = slug;

  const arch = document.querySelector('[data-ps-list]');
  const bar = document.querySelector('[data-pj-filters]');
  const countEl = document.querySelector('[data-pj-count]');
  const emptyEl = document.querySelector('[data-pj-empty]');
  if (!arch) return;

  /* chips: estado visual + direção do stagger (novo à direita → entra
     da direita) */
  let dir = 1;
  if (bar) {
    const order = [...bar.querySelectorAll('[data-pj-filter]')].map(b => b.dataset.pjFilter);
    const prev = bar.querySelector('.is-on');
    dir = order.indexOf(slug) >= order.indexOf(prev ? prev.dataset.pjFilter : 'all') ? 1 : -1;
    bar.querySelectorAll('[data-pj-filter]').forEach(b => {
      const on = b.dataset.pjFilter === slug;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on);
    });
    pjMoveInk();
  }

  const filtered = slug === 'all' ? projects : projects.filter(p => p.category === slug);
  if (countEl) countEl.textContent = pjCounterText(filtered.length, projects.length, data.catalog);

  if (emptyEl) emptyEl.hidden = filtered.length > 0;
  arch.style.display = filtered.length ? '' : 'none';

  const rebuild = () => pjMountRows(arch, filtered.map(p => buildArchCard(p, data)));

  /* ÂNCORA DE SCROLL: re-montar o arquivo muda a altura do documento e
     o browser pode clampar o scroll (no mobile o catálogo em coluna
     única perde ~1500px de uma vez — a seção "sumia" da viewport).
     Medimos a barra de filtros antes e devolvemos ela pro MESMO lugar
     da tela depois do re-layout. */
  const cli = document.querySelector('[data-pj-cli]');
  const anchorBefore = cli ? cli.getBoundingClientRect().top : null;
  const reanchor = () => {
    if (anchorBefore === null || !cli) return;
    const delta = cli.getBoundingClientRect().top - anchorBefore;
    if (Math.abs(delta) > 1) window.scrollBy(0, delta);
  };

  /* touch/reduced-motion/low|medium: troca instantânea ancorada.
     A coreografia 3D (rotateX + scale) e cara pra compositor fraco
     e o visual final e o mesmo — so a viagem muda. */
  const canAnim = window.gsap && !pjReducedMotion() && !pjTouchMode && pjPerf() === 'high';
  if (!canAnim) {
    rebuild();
    reanchor();
    return;
  }

  /* SEM Flip: coreografia OUT -> remonta -> IN. Todo card do novo conjunto
     anima (sempre VISÍVEL, em qualquer direção do filtro) e não usa o
     absolute:true do Flip, que colapsava o container e travava a página.
     window.__pjSwapping avisa o scrollfx pra ADIAR o rebuild dele durante a
     troca (senão ele re-aplica o clip-path e causa a "travada + volta"). */
  const outgoing = Array.prototype.slice.call(arch.querySelectorAll('.pj-card'));
  window.__pjSwapping = true;

  const done = () => {
    window.__pjSwapping = false;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };

  const animateIn = () => {
    const incoming = Array.prototype.slice.call(arch.querySelectorAll('.pj-card'));
    if (!incoming.length) { done(); return; }
    /* ENTRA: cada card sobe virando de baixo (rotateX 3D) + escala com um
       leve overshoot (back.out), em cascata pela direção do filtro. */
    gsap.fromTo(incoming,
      { autoAlpha: 0, scale: .8, y: 54, rotateX: -30, transformPerspective: 760,
        transformOrigin: '50% 100%' },
      { autoAlpha: 1, scale: 1, y: 0, rotateX: 0, duration: .64, ease: 'back.out(1.5)',
        stagger: { each: .075, from: dir < 0 ? 'end' : 'start' },
        clearProps: 'all', onComplete: done });
  };

  if (outgoing.length) {
    /* SAI: os antigos giram e somem pra cima, rápido, antes de remontar. */
    gsap.to(outgoing, {
      autoAlpha: 0, scale: .86, y: -22, rotateX: 18, transformPerspective: 760,
      duration: .26, ease: 'power2.in',
      stagger: { each: .028, from: dir < 0 ? 'start' : 'end' },
      onComplete: () => { rebuild(); reanchor(); animateIn(); },
    });
  } else {
    rebuild();
    reanchor();
    animateIn();
  }
}

/* =========================================================
   BINDS ÚNICOS — todos os listeners são delegados em containers
   que sobrevivem ao re-render (innerHTML troca, container fica).
   Handlers leem pjCtx, então nunca seguram closure de idioma velho.
   ========================================================= */
function pjBindOnce(arch) {
  if (pjBound) return;
  pjBound = true;

  pjBindRowHover(arch);

  /* pilha: janela de trás promove; frente navega (o <a> cuida) */
  const stack = document.querySelector('[data-pj-stack]');
  if (stack) {
    stack.addEventListener('click', e => {
      const win = e.target.closest('.pj-win');
      if (!win || win.classList.contains('is-front')) return;
      e.preventDefault();
      pjPromote(win.dataset.id);
    });
  }

  /* dots 01 02 03 + setas do teclado */
  const nav = document.querySelector('[data-pj-nav]');
  if (nav) {
    nav.addEventListener('click', e => {
      const btn = e.target.closest('[data-pj-goto]');
      if (btn) pjPromote(btn.dataset.pjGoto);
    });
    nav.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const featured = pjCtx.featured;
      if (!featured.length) return;
      const i = featured.findIndex(p => p.id === pjStackOrder[0]);
      const next = featured[(i + (e.key === 'ArrowRight' ? 1 : featured.length - 1)) % featured.length];
      pjPromote(next.id);
      nav.querySelector('.is-on')?.focus();
    });
  }

  /* barra de filtros */
  const bar = document.querySelector('[data-pj-filters]');
  if (bar) {
    bar.addEventListener('click', e => {
      const btn = e.target.closest('[data-pj-filter]');
      if (!btn || btn.dataset.pjFilter === pjActiveFilter) return;
      pjApplyFilter(btn.dataset.pjFilter);
    });
  }

  /* CTA do estado vazio → volta pro "all" */
  const emptyCta = document.querySelector('[data-pj-empty-cta]');
  if (emptyCta) emptyCta.addEventListener('click', () => pjApplyFilter('all'));

  /* auto-rotação do featured: dirigida pelo fim do vídeo da frente (ou
     tempo fixo p/ cover). Ao voltar pra aba, re-agenda na hora — o vídeo
     volta a tocar e o 'ended' dispara a troca quando terminar. */
  pjScheduleAdvance();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) pjScheduleAdvance();
  });

  /* o sublinhado dos filtros re-mede no resize (quebra de linha muda
     offsetTop dos chips) */
  let inkRaf = null;
  window.addEventListener('resize', () => {
    if (inkRaf) return;
    inkRaf = requestAnimationFrame(() => { inkRaf = null; pjMoveInk(); });
  }, { passive: true });

  /* se o monitor de FPS/long-task cair o tier no meio da visita,
     desliga play e (em low) para a auto-rotação cara da pilha.
     O visual fica no poster — mesmo look, zero decode. */
  window.addEventListener('perf:degradou', (e) => {
    const para = e.detail && e.detail.para;
    if (para === 'low') {
      document.querySelectorAll('video.pj-win__img, video.pj-card__img').forEach(v => {
        try { v.pause(); v.load(); } catch (err) {}
      });
      /* low: ainda troca capa a cada 6s (barato, so CSS class), mas
         sem play de video. Se preferir congelar: pjClearAdvance(). */
    } else if (para === 'medium') {
      document.querySelectorAll('video.pj-card__img').forEach(v => {
        try { v.pause(); } catch (err) {}
      });
    }
  });
}

/* =========================================================
   SCROLL HINT + CTA REPOS (mantidos da showcase)
   ========================================================= */
let hintObserver = null;

function setupScrollHint() {
  const hint = document.querySelector('[data-ps-hint]');
  const head = document.querySelector('.ps-head');
  if (!hint || !head) return;
  if (hintObserver) hintObserver.disconnect();
  hintObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => hint.classList.toggle('is-hidden', !e.isIntersecting));
  }, { threshold: 0.1 });
  hintObserver.observe(head);
}

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

/* =========================================================
   RENDER PRINCIPAL (i18n) — chamado pelo applyI18n
   ========================================================= */
function renderProjects(lang) {
  const arch = document.querySelector('[data-ps-list]');
  if (!arch) return;

  /* PLACEHOLDER "em construção": com data-ps-soon na section, o CSS
     esconde o catálogo e mostra o aviso — nada precisa ser montado. */
  if (document.querySelector('#projects[data-ps-soon]')) return;

  const data = I18N[lang].projects;
  const cat = data.catalog || {};
  const projects = pjPrepare(data.list);

  /* head — título + subtítulo (o kicker "Projects" foi removido a pedido) */
  const titleEl = document.querySelector('[data-ps-title]');
  if (titleEl) titleEl.innerHTML = cat.title || 'Projects';
  const subEl = document.querySelector('[data-ps-sub]');
  if (subEl) subEl.textContent = cat.sub || '';

  /* prompt da linha de filtros */
  const prompt = document.querySelector('[data-pj-prompt]');
  if (prompt) prompt.textContent = cat.filterPrefix || '$ filter:';

  /* hint do scroll (label do chip que segue o cursor sobre as capas) */
  const hintLbl = document.querySelector('[data-ps-hint-label]');
  if (hintLbl && data.showcase) hintLbl.textContent = data.showcase.scrollHint || '';
  /* label do cursor-badge circular (scrollfx) — curto pra caber girando
     em volta da bolinha: "Ver mais / View more" */
  arch.dataset.visitLabel = (data.ctas && data.ctas.viewMore) ||
    (data.case && data.case.viewCase) || 'View more';

  /* empty state */
  const emptyText = document.querySelector('[data-pj-empty-text]');
  const emptyCta = document.querySelector('[data-pj-empty-cta]');
  if (emptyText) emptyText.textContent = cat.empty || '';
  if (emptyCta) emptyCta.textContent = cat.emptyCta || '→ View all';

  /* contexto novo ANTES de montar os atos (handlers delegados leem dele) */
  pjCtx.projects = projects;
  pjCtx.featured = pjFeaturedList(projects);
  pjCtx.data = data;

  /* três atos */
  pjSetupFeatured();
  pjSetupFilters();

  const filtered = pjActiveFilter === 'all'
    ? projects
    : projects.filter(p => p.category === pjActiveFilter);
  pjMountRows(arch, filtered.map(p => buildArchCard(p, data)));
  const emptyEl = document.querySelector('[data-pj-empty]');
  if (emptyEl) emptyEl.hidden = filtered.length > 0;
  arch.style.display = filtered.length ? '' : 'none';

  pjBindOnce(arch);
  setupScrollHint();
  setupReposCta(data);

  /* sinaliza pra camada de motion (scrollfx.js) reconstruir os fx
     ambientes da seção (pulsos, anel de proximidade, reveals) */
  document.dispatchEvent(new CustomEvent('pj:rendered'));
}

/* expor pro language.js */
window.renderProjects = renderProjects;
