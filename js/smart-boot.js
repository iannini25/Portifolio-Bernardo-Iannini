'use strict';

/* ============================================================
   SMART BOOT — carregamento progressivo ate o site ficar liso.

   Problema: notebook potente ainda engasga na section de Projetos
   porque varios MP4s + GSAP + WebGL competem no mesmo frame.

   Solucao (sem matar efeitos):
   1. Depois do load, aquece capas e previews EM FILA (1 video por vez)
      nos idle frames — a UI ja esta usavel com posters.
   2. Barra lime sutil no topo (so na 1a visita / cache frio).
   3. Ao chegar em 100%, pede ao Service Worker pra guardar tudo
      no Cache Storage. Proximas visitas leem do disco (0ms).

   Nao bloqueia scroll nem esconde a pagina.
   ============================================================ */

(function () {
  var WARM_KEY = 'bi-warm-v3';
  var CACHE_NAME = 'bi-v3'; /* deve bater com VERSAO em /sw.js */

  var SHELL = [
    '/',
    '/style.css',
    '/js/perf-tier.js',
    '/js/language.js',
    '/js/projects.js',
    '/js/scrollfx.js',
    '/js/UI.js',
    '/js/home.js',
    '/favicon.png',
    '/img/eufoto1.webp'
  ];

  var COVERS = [
    '/img/athena7-cover.webp',
    '/img/moedanobre-cover.webp',
    '/img/iba-cover.webp',
    '/img/modulo-engenharia.webp',
    '/img/brasa-restaurante.webp',
    '/img/sereno.webp',
    '/img/amarofy.webp',
    '/img/automotiva-express.webp',
    '/img/portfolio-cover.webp'
  ];

  /* previews usados na home (pilha + arquivo). site-mp4s sao mais
     pesados e so entram depois dos cards. */
  var PREVIEWS = [
    '/videos/preview/athena7.mp4',
    '/videos/preview/moedanobre.mp4',
    '/videos/preview/iba.mp4',
    '/videos/preview/modulo-engenharia.mp4',
    '/videos/preview/brasa.mp4',
    '/videos/preview/sereno.mp4',
    '/videos/preview/amarofy.mp4',
    '/videos/preview/automotiva-express.mp4'
  ];

  var SITE_VIDEOS = [
    '/videos/preview/athena7-site.mp4',
    '/videos/preview/moedanobre-site.mp4',
    '/videos/preview/iba-site.mp4'
  ];

  var done = false;
  var bar = null;
  var fill = null;

  function jaAquecido() {
    try { return localStorage.getItem(WARM_KEY) === '1'; }
    catch (e) { return false; }
  }

  function marcarAquecido() {
    try { localStorage.setItem(WARM_KEY, '1'); } catch (e) {}
    done = true;
    window.biWarmReady = true;
    window.dispatchEvent(new CustomEvent('bi:warm-ready'));
  }

  function garantirBarra() {
    if (bar) return;
    bar = document.createElement('div');
    bar.id = 'bi-smart-boot';
    bar.setAttribute('aria-hidden', 'true');
    fill = document.createElement('div');
    fill.className = 'bi-smart-boot__fill';
    bar.appendChild(fill);
    (document.body || document.documentElement).appendChild(bar);
  }

  function setProgresso(p) {
    if (!fill) return;
    var n = Math.max(0, Math.min(100, p));
    fill.style.width = n + '%';
    if (n >= 100) {
      bar.classList.add('is-done');
      setTimeout(function () {
        if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
        bar = null;
        fill = null;
      }, 480);
    }
  }

  function idle(ms) {
    return new Promise(function (resolve) {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(function () { resolve(); }, { timeout: ms || 1200 });
      } else {
        setTimeout(resolve, Math.min(ms || 120, 200));
      }
    });
  }

  function fetchOk(url) {
    return fetch(url, { credentials: 'same-origin', cache: 'force-cache' })
      .then(function (r) { return r && r.ok ? r : null; })
      .catch(function () { return null; });
  }

  /* grava no Cache Storage do browser (mesmo namespace do SW).
     Se o SW ainda nao instalou, o cache ainda serve na 2a visita
     via caches.match / quando o SW assumir. */
  function guardarNoCache(url, response) {
    if (!('caches' in window) || !response) return Promise.resolve();
    return caches.open(CACHE_NAME)
      .then(function (c) { return c.put(url, response.clone()); })
      .catch(function () {});
  }

  function aquecerUm(url) {
    return fetchOk(url).then(function (resp) {
      if (!resp) return false;
      return guardarNoCache(url, resp).then(function () { return true; });
    });
  }

  function pedirPrecacheAoSW(urls) {
    if (!('serviceWorker' in navigator)) return;
    var msg = { type: 'PRECACHE', urls: urls };
    var ctrl = navigator.serviceWorker.controller;
    if (ctrl) {
      ctrl.postMessage(msg);
      return;
    }
    navigator.serviceWorker.ready.then(function (reg) {
      if (reg.active) reg.active.postMessage(msg);
    }).catch(function () {});
  }

  async function rodarFila(urls, onStep, concorrencia) {
    var i = 0;
    var ativos = 0;
    var max = Math.max(1, concorrencia || 1);

    return new Promise(function (resolve) {
      function kick() {
        while (ativos < max && i < urls.length) {
          (function (url) {
            ativos++;
            aquecerUm(url).then(function () {
              ativos--;
              if (onStep) onStep(url);
              if (i >= urls.length && ativos === 0) resolve();
              else kick();
            });
          })(urls[i++]);
        }
        if (i >= urls.length && ativos === 0) resolve();
      }
      kick();
    });
  }

  async function boot() {
    window.biWarmReady = jaAquecido();

    var all = SHELL.concat(COVERS, PREVIEWS, SITE_VIDEOS);
    /* se ja aquecido: ainda manda PRECACHE pro SW (pode ser SW novo)
       e sai sem barra — visita ja esta lisa. */
    if (window.biWarmReady) {
      pedirPrecacheAoSW(all);
      window.dispatchEvent(new CustomEvent('bi:warm-ready'));
      return;
    }

    garantirBarra();
    setProgresso(4);

    var total = all.length;
    var feitos = 0;
    function tick() {
      feitos++;
      setProgresso(4 + Math.round((feitos / total) * 96));
    }

    /* Fase 1 — casca (paralelo leve) */
    await idle(400);
    await rodarFila(SHELL, tick, 3);
    await idle(600);

    /* Fase 2 — capas (baratas, soltam a section visual) */
    await rodarFila(COVERS, tick, 3);
    await idle(800);

    /* Fase 3 — previews dos cards, UM por vez (o gargalo real) */
    await rodarFila(PREVIEWS, function (url) {
      tick();
      /* avisa a section pra poder dar play sem esperar o resto */
      window.dispatchEvent(new CustomEvent('bi:asset-ready', { detail: { url: url } }));
    }, 1);

    await idle(1000);

    /* Fase 4 — videos longos de case (baixa prioridade) */
    await rodarFila(SITE_VIDEOS, tick, 1);

    setProgresso(100);
    pedirPrecacheAoSW(all);
    marcarAquecido();
  }

  /* API publica: a section de projetos pode esperar um preview
     especifico antes de .play() na primeira vez. */
  window.biWhenAssetReady = function (url, cb) {
    if (!url) { cb && cb(); return; }
    var abs = url.charAt(0) === '/' ? url : '/' + url.replace(/^\.\//, '');
    if (window.biWarmReady) { cb && cb(); return; }
    if (!('caches' in window)) { cb && cb(); return; }
    caches.match(abs).then(function (hit) {
      if (hit) { cb && cb(); return; }
      var once = function (e) {
        var u = (e.detail && e.detail.url) || '';
        if (u === abs || u.endsWith(abs)) {
          window.removeEventListener('bi:asset-ready', once);
          cb && cb();
        }
      };
      window.addEventListener('bi:asset-ready', once);
      /* timeout de seguranca — nunca prende o play pra sempre */
      setTimeout(function () {
        window.removeEventListener('bi:asset-ready', once);
        cb && cb();
      }, 12000);
    }).catch(function () { cb && cb(); });
  };

  if (document.readyState === 'complete') {
    setTimeout(boot, 600);
  } else {
    window.addEventListener('load', function () { setTimeout(boot, 600); }, { once: true });
  }
})();
