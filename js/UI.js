'use strict';

/* =========================================================
   GLOBAL / UTIL & SCROLL
   ========================================================= */

/* ===== Scroll suave com compensação ===== */
const header = document.querySelector('header');
const offset = () => (header?.getBoundingClientRect().height || 0) + 10;

/* Destino de uma ancora: o inicio do CONTEUDO da section logo abaixo da
   navbar. Usa a posicao de layout (offsetTop), porque titulos e cards podem
   estar deslocados por parallax/entrada nessa hora e enganariam a medida. */
function anchorTop(el) {
  if (el.id === 'home') return 0;
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  if (el.id === 'projects') return y;   /* o titulo ja tem respiro proprio */
  const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
  const navBottom = header?.querySelector('.nav')?.getBoundingClientRect().bottom || offset();
  return Math.max(0, y + pad - navBottom - 28);
}
function scrollToAnchor(el) {
  const top = anchorTop(el);
  if (window.lenis) window.lenis.scrollTo(top, { force: true });
  else window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('a[data-scroll]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        scrollToAnchor(el);
        /* Contato: abre o modal na hora e o fundo rola ate a section atras dele */
        if (href === '#contato' && typeof openContactModal === 'function') openContactModal();
      } else {
        // a âncora não existe NESTA página (ex.: project.html não tem
        // #home/#sobre/...) — navega pra home já na section certa, em
        // vez de engolir o clique silenciosamente
        window.location.href = '/' + href;
      }
    }
  });
});



/* =========================================================
   MENU MOBILE
   ========================================================= */
(function () {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileNav');
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.add('open');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    menu.classList.remove('open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  document.addEventListener('click', e => {
    if (menu.classList.contains('open') &&
      !menu.contains(e.target) &&
      !btn.contains(e.target)) {
      close();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });

  menu.querySelectorAll('a[data-scroll]').forEach(a => {
    a.addEventListener('click', () => close());
  });
})();

/* =========================================================
   WORK DROPDOWN — desktop (#workBtn / #workMenu)
   O menu é movido pro <body> ao abrir (escapa do stacking context
   do .pill que tem backdrop-filter próprio) e reposicionado via
   position: fixed baseado no rect do botão. Assim o blur funciona
   limpo, igual ao .lang-menu.
   ========================================================= */
(function () {
  const btn = document.getElementById('workBtn');
  const menu = document.getElementById('workMenu');
  if (!btn || !menu) return;

  // Lembra onde o menu vivia no DOM, pra poder voltar
  const originalParent = menu.parentNode;
  const originalNext   = menu.nextSibling;

  const positionMenu = () => {
    const r = btn.getBoundingClientRect();
    // 12px de gap abaixo do botão, centralizado horizontalmente
    menu.style.top  = `${r.bottom + 12}px`;
    menu.style.left = `${r.left + r.width / 2}px`;
  };

  const close = () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    window.removeEventListener('scroll', positionMenu, true);
    window.removeEventListener('resize', positionMenu);
  };

  const open = () => {
    // Teletransporta pro body — fora do .pill (que tem backdrop-filter)
    if (menu.parentNode !== document.body) document.body.appendChild(menu);
    positionMenu();
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    // Mantém alinhado se rolar ou redimensionar
    window.addEventListener('scroll', positionMenu, true);
    window.addEventListener('resize', positionMenu);
  };

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  // Fecha quando clicar em um item (rolagem já é feita pelos a[data-scroll])
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => close());
  });
})();

/* =========================================================
   WORK DROPDOWN — mobile (.mobile-dd-btn / .mobile-dd-menu)
   ========================================================= */
(function () {
  const btn = document.querySelector('.mobile-dd-btn');
  const menu = document.querySelector('.mobile-dd-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  // Clicar num sub-item fecha o menu mobile inteiro (já tratado pelo .mobile-nav)
  // — aqui só garantimos que o dropdown também reseta
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* =========================================================
   TAB AWAY — muda o título quando o usuário sai da aba
   (lê i18n.tabAway no idioma atual) e restaura quando volta.
   ========================================================= */
(function () {
  const ORIGINAL_TITLE = document.title;

  // Lê o texto traduzido toda vez — assim segue o idioma atual,
  // mesmo se o user trocou no language switch.
  const getAwayTitle = () => {
    const fallback = 'come back here :(';
    try {
      return (typeof I18N !== 'undefined' && I18N[LANG]?.tabAway) || fallback;
    } catch (_) { return fallback }
  };

  const setAway   = () => { document.title = getAwayTitle() };
  const setOrigin = () => { document.title = ORIGINAL_TITLE };

  document.addEventListener('visibilitychange', () => {
    document.hidden ? setAway() : setOrigin();
  });

  // Defesa extra: blur/focus da window cobre casos onde visibilitychange
  // não dispara (alguns navegadores quando a janela perde foco).
  window.addEventListener('blur',  setAway);
  window.addEventListener('focus', setOrigin);
})();

/* =========================================================
   NAME — quebra "Iannini" (.name .break) em letras individuais pra
   cada uma poder ter seu próprio hover (brilho do gradient).
   ========================================================= */
(function () {
  const target = document.querySelector('.name .break');
  if (!target || target.dataset.split === '1') return;

  const text = target.textContent;
  const frag = document.createDocumentFragment();

  for (const ch of text) {
    if (ch === ' ') {
      frag.appendChild(document.createTextNode(' '));
      continue;
    }
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = ch;
    // Pseudo ::before usa attr(data-char) pra reproduzir a letra
    // numa camada com o gradient sobreposta.
    span.setAttribute('data-char', ch);
    frag.appendChild(span);
  }

  target.textContent = '';
  target.appendChild(frag);
  target.dataset.split = '1';

  // Acessibilidade: leitor de tela continua falando "Iannini" inteiro
  target.setAttribute('aria-label', text);
})();

/* =========================================================
   TERMINAL — tilt 3D suave seguindo o mouse na section About.

   Anti-glitch nas bordas:
   - Rect é cacheado (não recalcula no mousemove): getBoundingClientRect
     retorna a AABB do elemento *transformado*, então recalcular cria
     feedback loop quando o tilt deforma a caixa perto das bordas.
   - mousemove é registrado no DOCUMENT e o hit-test usa o rect cacheado:
     evita que a rotação faça o cursor "sair/entrar" do elemento perto
     dos cantos (que causava o flicker mouseleave/mouseenter).
   - Lerp em rAF contínuo: tilt persegue o target suavemente — sem
     saltos abruptos a cada pixel de mousemove.
   ========================================================= */
(function () {
  const term = document.querySelector('.about-term');
  if (!term) return;

  const MAX_TILT = 9;       // graus máximos em cada eixo (no pico do ramp)
  const LERP = 0.12;        // fator de suavização (0..1) — quanto maior, mais rápido segue
  const EPSILON = 0.01;     // limiar pra parar o rAF quando já chegou
  const RAMP_MIN = 0.30;    // força inicial ao entrar (30% do MAX_TILT)
  const RAMP_TAU = 520;     // ms — constante de tempo da exponencial Weibull
  const RAMP_POW = 2.2;     // expoente do tempo — >1 deixa o INÍCIO mais lento
  const RAMP_FULL = 0.999;  // ramp considerado "saturado" — para o rAF

  let rect = null;
  let inside = false;
  let enteredAt = 0;          // timestamp da entrada (pra curva exponencial)
  let curX = 0, curY = 0;     // tilt atual aplicado
  let rawX = 0, rawY = 0;     // alvo "cru" (vindo da posição do mouse, sem ramp)
  let raf = 0;

  const refreshRect = () => { rect = term.getBoundingClientRect(); };

  // Weibull ease-in: arranca em RAMP_MIN e assintota em 1, com início bem lento.
  // Curva: f(t) = RAMP_MIN + (1 − RAMP_MIN) · (1 − e^(−(t/τ)^p))
  // Com p=2 (Weibull k=2), a derivada em t=0 é zero — começa "parado"
  // e acelera, em vez do arranque rápido da exponencial simples.
  const rampAt = (now) => {
    if (!inside) return 1;
    const u = (now - enteredAt) / RAMP_TAU;
    const k = 1 - Math.exp(-Math.pow(u, RAMP_POW));
    return RAMP_MIN + (1 - RAMP_MIN) * k;
  };

  const tick = () => {
    raf = 0;
    const ramp = rampAt(performance.now());
    const tgtX = rawX * ramp;
    const tgtY = rawY * ramp;

    curX += (tgtX - curX) * LERP;
    curY += (tgtY - curY) * LERP;

    const settled = Math.abs(tgtX - curX) < EPSILON && Math.abs(tgtY - curY) < EPSILON;
    // Enquanto o ramp ainda cresce, segue agendando mesmo já "estabilizado"
    // — o alvo efetivo muda no próximo frame conforme a curva sobe.
    const ramping = inside && ramp < RAMP_FULL;

    if (settled && !ramping) {
      curX = tgtX; curY = tgtY;
      term.style.setProperty('--term-tilt-x', `${curX.toFixed(3)}deg`);
      term.style.setProperty('--term-tilt-y', `${curY.toFixed(3)}deg`);
      return;
    }
    term.style.setProperty('--term-tilt-x', `${curX.toFixed(3)}deg`);
    term.style.setProperty('--term-tilt-y', `${curY.toFixed(3)}deg`);
    raf = requestAnimationFrame(tick);
  };

  const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

  // Hit-test manual contra o rect cacheado — independe do transform atual
  document.addEventListener('mousemove', e => {
    if (!rect) refreshRect();
    const x = e.clientX, y = e.clientY;
    const within = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    if (within) {
      if (!inside) {
        inside = true;
        enteredAt = performance.now();  // reinicia a curva exponencial
      }
      const px = (x - rect.left) / rect.width;
      const py = (y - rect.top)  / rect.height;
      // anel de borda (.term-ring) que segue o cursor — MESMO efeito dos cards
      term.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      term.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      // Mouse no topo → tilt pra cima; mouse à direita → tilt pra direita.
      rawX = (0.5 - py) * 2 * MAX_TILT;
      rawY = (px - 0.5) * 2 * MAX_TILT;
      schedule();
    } else if (inside) {
      inside = false;
      rawX = 0; rawY = 0;
      schedule();
    }
  }, { passive: true });

  // Rect só muda em layout shift — não no transform do próprio terminal.
  // Com o Lenis rodando, 'scroll' dispara TODO frame: coalescer em rAF
  // deixa no máximo uma leitura de layout por frame pintado.
  window.addEventListener('resize', refreshRect);
  let rectAgendado = false;
  window.addEventListener('scroll', () => {
    if (rectAgendado) return;
    rectAgendado = true;
    requestAnimationFrame(() => { rectAgendado = false; refreshRect(); });
  }, { passive: true });
  refreshRect();
})();

/* =========================================================
   PHOTO — bloqueia drag das imagens (cinto+suspensório)
   ========================================================= */
(function () {
  document.querySelectorAll('.photo__img').forEach(img => {
    img.addEventListener('dragstart', e => e.preventDefault());
  });
})();


/* =========================================================
   SCROLL CUE — rola da hero para a próxima section ao clicar
   ========================================================= */
(function () {
  const cue = document.getElementById('scrollCue');
  if (!cue) return;

  cue.addEventListener('click', () => {
    const hero = cue.closest('section') || document.getElementById('home');
    // próxima section irmã depois da hero
    const next = hero?.nextElementSibling?.matches?.('section')
      ? hero.nextElementSibling
      : document.querySelector('main section + section');
    if (!next) return;

    scrollToAnchor(next);
  });
})();

/* =========================================================
   PHOTO — troca em PERSIANAS (CSS .photo__px). Monta N faixas com
   pedacos da foto B. Entrada: as faixas sobem em sequencia a partir da
   coluna do cursor. Saida: seguem subindo e saem pelo topo a partir do
   ponto de saida; no fim voltam (sem animacao) pra baixo, prontas.
   ========================================================= */
(function photoBlinds() {
  const photo = document.querySelector('.hero .photo');
  const imgB = photo && photo.querySelector('.photo__img--b');
  if (!photo || !imgB) return;
  const N = 9;
  const grid = document.createElement('div');
  grid.className = 'photo__px';
  grid.setAttribute('aria-hidden', 'true');
  grid.style.setProperty('--n', N);
  grid.style.setProperty('--src', 'url("' + (imgB.currentSrc || imgB.src) + '")');
  const strips = [];
  for (let x = 0; x < N; x++) {
    const i = document.createElement('i');
    const s = document.createElement('b');
    s.style.setProperty('--x', x);
    i.appendChild(s);
    grid.appendChild(i);
    strips.push({ el: s, c: (x + .5) / N });
  }
  photo.appendChild(grid);

  /* atraso de cada faixa = distancia ate a coluna do cursor + acaso */
  const stagger = (e, span, jitter) => {
    const r = photo.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    for (const s of strips) {
      const d = Math.abs(s.c - px) * span + Math.random() * jitter;
      s.el.style.setProperty('--d', d.toFixed(3) + 's');
    }
  };
  let resetTimer = 0;
  photo.addEventListener('pointerenter', (e) => {
    clearTimeout(resetTimer);
    stagger(e, .1, .02);
    if (photo.classList.contains('is-out')) {
      /* ainda saindo pelo topo: volta pra baixo sem animar e sobe de novo */
      photo.classList.add('is-reset');
      photo.classList.remove('is-out');
      void photo.offsetWidth;
      photo.classList.remove('is-reset');
    }
    photo.classList.add('is-b');
  });
  photo.addEventListener('pointerleave', (e) => {
    stagger(e, .08, .02);
    photo.classList.remove('is-b');
    photo.classList.add('is-out');
    resetTimer = setTimeout(() => {
      photo.classList.add('is-reset');
      photo.classList.remove('is-out');
      void photo.offsetWidth;
      photo.classList.remove('is-reset');
    }, 560);
  });
})();

/* =========================================================
   BOTOES DE CURRICULO (navbar e card do Sobre) — monta as camadas do
   hover/clique (CSS .cv-btn). O <span data-i18n> do rotulo e mantido
   intacto (a traducao continua trocando o texto). O download acontece
   normal; a animacao e so visual.
   ========================================================= */
(function cvButtons() {
  const pt = (document.documentElement.lang || '').toLowerCase().startsWith('pt');
  const ICON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.resume-btn, .about-cv-btn').forEach((btn) => {
    if (btn.classList.contains('cv-btn')) return;

    const face = document.createElement('span');
    face.className = 'cv-btn__face';
    const text = document.createElement('span');
    text.className = 'cv-btn__text';
    while (btn.firstChild) text.appendChild(btn.firstChild);
    face.innerHTML = '<span class="cv-btn__fill" aria-hidden="true"></span>';
    face.appendChild(text);
    face.insertAdjacentHTML('beforeend',
      '<span class="cv-btn__icon" aria-hidden="true">' + ICON + '</span>' +
      '<span class="cv-btn__done" aria-hidden="true">✓ ' + (pt ? 'Baixado' : 'Downloaded') + '</span>');
    btn.appendChild(face);
    btn.insertAdjacentHTML('beforeend', '<span class="cv-btn__orbit" aria-hidden="true"></span>');
    btn.classList.add('cv-btn');
    if (reduce) return;

    const done = face.querySelector('.cv-btn__done');
    let busy = false;
    btn.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      const w = btn.offsetWidth, h = btn.offsetHeight;
      btn.style.setProperty('--r', (h / 2 + 4) + 'px');
      btn.style.width = w + 'px';
      btn.style.height = h + 'px';               /* altura travada: o rotulo sai do fluxo */
      void btn.offsetWidth;                       /* fixa a largura de partida */
      btn.classList.add('is-loading');
      btn.style.width = h + 'px';                 /* pilula -> circulo */

      setTimeout(() => {
        /* reabre no tamanho que o "✓ Baixado" precisa */
        const pad = w - text.offsetWidth;
        const range = document.createRange();
        range.selectNodeContents(done);
        const wDone = Math.max(w, Math.ceil(range.getBoundingClientRect().width) + pad);
        btn.classList.remove('is-loading');
        btn.classList.add('is-done');
        btn.style.width = wDone + 'px';
        setTimeout(() => {
          btn.classList.remove('is-done');
          btn.style.width = w + 'px';
          setTimeout(() => { btn.style.width = ''; btn.style.height = ''; busy = false; }, 470);
        }, 2000);
      }, 1600);
    });
  });
})();

/* =========================================================
   PAGE TRANSITIONS — fade-out suave ao navegar entre páginas
   Intercepta cliques em <a> com mesma origem mas pathname diferente.
   Combinado com o anti-flicker no <head>, dá fade-out + fade-in.
   ========================================================= */
(function pageTransitions() {
  // Se o browser tem View Transitions cross-document (Chrome/Edge 126+),
  // NAO interceptamos: deixamos a navegacao normal e o @view-transition
  // do CSS faz a transicao nativa (GPU). Isso evita transicao dupla.
  // 'onpagereveal' so existe em browsers com cross-document VT (Chrome
  // 126+/Edge/Opera) — sinal confiavel, sem regredir Chromium 111-125.
  const SUPPORTS_CROSS_DOC_VT =
    'startViewTransition' in document && 'onpagereveal' in window;
  if (SUPPORTS_CROSS_DOC_VT) return;

  const PAGE_PATHS = new Set(['/index.html', '/blog.html', '/post.html', '/', '/index', '/blog', '/post']);

  const isCrossPageLink = (a) => {
    const href = a.getAttribute('href');
    if (!href) return false;
    if (a.hasAttribute('target')) return false;
    if (a.hasAttribute('download')) return false;

    // Hash puro (anchor) → não é cross-page
    if (href.startsWith('#')) return false;
    // Protocolo externo (mailto:, tel:, http(s) externo)
    if (/^(mailto|tel|javascript):/i.test(href)) return false;

    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return false;
      if (url.pathname === location.pathname) return false;
      return true;
    } catch (_) {
      return false;
    }
  };

  document.addEventListener('click', (e) => {
    // Permite Ctrl/Cmd/Shift-click pra abrir em nova aba
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;

    const a = e.target.closest('a[href]');
    if (!a || !isCrossPageLink(a)) return;

    const href = a.getAttribute('href');
    e.preventDefault();

    document.body.classList.add('page-leaving');

    // Aguarda a transição (.45s scale+blur) antes de navegar
    const TRANSITION_MS = 420;
    let navigated = false;
    const go = () => {
      if (navigated) return;
      navigated = true;
      window.location.href = href;
    };
    // Usa transitionend OU timeout (fallback se o evento não disparar)
    document.body.addEventListener('transitionend', go, { once: true });
    setTimeout(go, TRANSITION_MS + 80);
  });
})();

/* =========================================================
   INIT
   ========================================================= */
function init() {
  applyI18n(LANG);
  if (typeof cycleTaglines === 'function') {
    cycleTaglines();
  }
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
