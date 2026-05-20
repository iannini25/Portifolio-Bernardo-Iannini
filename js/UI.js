'use strict';

/* =========================================================
   GLOBAL / UTIL & SCROLL
   ========================================================= */

/* ===== Scroll suave com compensação ===== */
const header = document.querySelector('header');
const offset = () => (header?.getBoundingClientRect().height || 0) + 10;

document.querySelectorAll('a[data-scroll]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset();
        window.scrollTo({ top, behavior: 'smooth' });
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

  // Respeita usuários que pedem menos movimento — desliga o efeito inteiro
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  // Rect só muda em layout shift — não no transform do próprio terminal
  window.addEventListener('resize', refreshRect);
  window.addEventListener('scroll', refreshRect, { passive: true });
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

    const top = next.getBoundingClientRect().top + window.pageYOffset - offset();
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* =========================================================
   RESUME BUTTON ATTENTION
   ========================================================= */
(function () {
  const r = document.querySelector('.resume-btn');
  if (r && window.matchMedia('(min-width: 901px)').matches) {
    r.classList.add('resume-attn');
  }
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
   BLOG SOON — bloqueio de cliques nos links de blog
   Intercepta cliques em qualquer link com [data-blog-soon]
   ou href apontando pra blog.html/posts e impede navegação.
   ========================================================= */
(function blockBlogLinks(){
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a, button');
    if (!anchor) return;

    const isMarked = anchor.hasAttribute('data-blog-soon') ||
                     anchor.classList.contains('is-soon');
    const href = anchor.getAttribute('href') || '';
    const isBlogHref = /(^|\/)blog\.html(\?|#|$)/i.test(href) ||
                       /\/posts\//i.test(href);

    if (isMarked || (isBlogHref && anchor.classList.contains('nav-blog-link'))) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
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
