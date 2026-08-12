/* ============================================================
   SERVICE WORKER — cache local pra 2a visita carregar na hora.

   POR QUE NAO COOKIE: cookie nao guarda arquivo. Ele viaja junto
   de CADA requisicao (deixa mais LENTO, nao mais rapido) e ainda
   exigiria banner de consentimento. Quem guarda CSS, JS, fonte e
   imagem no dispositivo e o Cache Storage, que e o que este
   arquivo usa. Zero cookie, zero banner, zero UI: o usuario nao
   ve absolutamente nada.

   ESTRATEGIAS
   · navegacao (HTML) -> network-first
   · estatico (css/js/img/fonte) -> stale-while-revalidate
   · videos /videos/** -> cache-first (imuteveis; o smart-boot
     aquece e grava; 2a visita nao rebaixa dezenas de MB)

   O QUE NUNCA ENTRA NO CACHE
   · /api/** e o Supabase
   · /admin.html e /bernardolindao.html
   · qualquer coisa que nao seja GET
   · outra origem (CDN / Google Fonts)
   ============================================================ */
'use strict';

const VERSAO = 'v3';
const CACHE = `bi-${VERSAO}`;

const CASCA = [
  '/style.css',
  '/js/language.js',
  '/js/UI.js',
  '/js/smart-boot.js',
  '/js/projects.js',
  '/js/scrollfx.js',
  '/js/perf-tier.js',
  '/favicon.png',
];

const BLOQUEADOS = [
  /^\/api\//,
  /^\/admin(\.html)?$/,
  /^\/bernardolindao(\.html)?$/,
  /^\/js\/(blog-admin|blog-auth|supabase-client|supabase-config)\.js$/,
];

const ehBloqueado = (pathname) => BLOQUEADOS.some((re) => re.test(pathname));
const ehVideo = (pathname) => pathname.startsWith('/videos/');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(CASCA.map((u) => cache.add(u))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes.map((n) => (n !== CACHE ? caches.delete(n) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  if (url.origin !== self.location.origin) return;
  if (ehBloqueado(url.pathname)) return;

  const querHtml = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (querHtml) {
    event.respondWith((async () => {
      try {
        const resp = await fetch(req);
        if (resp && resp.ok) {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
        }
        return resp;
      } catch {
        const cacheado = await caches.match(req);
        if (cacheado) return cacheado;
        const home = await caches.match('/');
        if (home) return home;
        return new Response('', { status: 504, statusText: 'offline' });
      }
    })());
    return;
  }

  /* videos: cache-first — sao grandes e nao mudam de URL */
  if (ehVideo(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const resp = await fetch(req);
        if (resp && resp.ok) cache.put(req, resp.clone()).catch(() => {});
        return resp;
      } catch {
        return new Response('', { status: 504, statusText: 'offline' });
      }
    })());
    return;
  }

  // estatico -> stale-while-revalidate
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cacheado = await cache.match(req);

    const rede = fetch(req).then((resp) => {
      if (resp && resp.ok) cache.put(req, resp.clone()).catch(() => {});
      return resp;
    }).catch(() => null);

    if (cacheado) { event.waitUntil(rede); return cacheado; }

    const resp = await rede;
    return resp || new Response('', { status: 504, statusText: 'offline' });
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (data === 'limpar-cache') {
    caches.keys().then((ns) => ns.forEach((n) => caches.delete(n)));
    return;
  }
  /* smart-boot manda a lista completa quando chega a 100% */
  if (data && data.type === 'PRECACHE' && Array.isArray(data.urls)) {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const uniq = Array.from(new Set(data.urls.filter(Boolean)));
      /* um a um: addAll aborta tudo se um 404 */
      for (const u of uniq) {
        try {
          const abs = new URL(u, self.location.origin).href;
          if (ehBloqueado(new URL(abs).pathname)) continue;
          const hit = await cache.match(abs);
          if (hit) continue;
          await cache.add(abs);
        } catch (_) { /* 404 / rede — segue o proximo */ }
      }
    })());
  }
});
