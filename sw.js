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
       Sempre tenta a rede primeiro, entao o conteudo nunca fica
       velho. Se a rede falhar (offline, tunel, wifi ruim), cai
       pro cache e a pagina ainda abre.
   · estatico (css/js/img/fonte) -> stale-while-revalidate
       Responde do cache NA HORA (0ms) e revalida em segundo
       plano. E dai que vem a sensacao de instantaneo.

   O QUE NUNCA ENTRA NO CACHE
   · /api/** e o Supabase (dados vivos, e o vercel.json ja manda
     no-store)
   · /admin.html e /bernardolindao.html (painel privado)
   · qualquer coisa que nao seja GET
   · outra origem (CDN e Google Fonts): o CSP do site so libera
     connect-src pra 'self' e pro Supabase, entao um fetch daqui
     pra jsdelivr seria BLOQUEADO. Esses ja tem cache proprio de
     CDN, entao nao ha perda.

   ATUALIZACAO
   O nome do cache tem VERSAO. Ao mudar a versao, o activate apaga
   os caches antigos. NAO uso skipWaiting de proposito: trocar os
   arquivos no meio da navegacao pode misturar CSS novo com JS
   velho. O SW novo assume no proximo carregamento, que e o
   comportamento seguro.
   ============================================================ */
'use strict';

const VERSAO = 'v2';
const CACHE = `bi-${VERSAO}`;

/* Casca minima: o que toda pagina usa. Proposital ser curto —
   precache grande atrasa a instalacao e desperdica dados de quem
   entra uma vez so. O resto entra sozinho conforme for usado. */
const CASCA = [
  '/style.css',
  '/js/language.js',
  '/js/UI.js',
  '/favicon.png',
];

/* nunca cachear */
const BLOQUEADOS = [
  /^\/api\//,
  /^\/admin(\.html)?$/,
  /^\/bernardolindao(\.html)?$/,
  // o JS do painel tambem nao: o vercel.json manda no-store no /admin,
  // entao guardar os assets dele no dispositivo de um VISITANTE seria
  // incoerente (e deixaria versao velha do painel em cache).
  /^\/js\/(blog-admin|blog-auth|supabase-client|supabase-config)\.js$/,
];

const ehBloqueado = (pathname) => BLOQUEADOS.some((re) => re.test(pathname));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll falha inteiro se UM arquivo falhar; adiciona um a um
      // pra uma 404 pontual nao impedir a instalacao do SW
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

  // so mesma origem (ver comentario do CSP no topo)
  if (url.origin !== self.location.origin) return;
  if (ehBloqueado(url.pathname)) return;

  // HTML / navegacao -> network-first
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
        // ultima tentativa: a home, pra nao morrer numa tela de erro do browser
        const home = await caches.match('/');
        if (home) return home;
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
      // resposta opaca (status 0) nao serve pra validar nada
      if (resp && resp.ok) cache.put(req, resp.clone()).catch(() => {});
      return resp;
    }).catch(() => null);

    // cache primeiro (0ms); a revalidacao segue em segundo plano
    if (cacheado) { event.waitUntil(rede); return cacheado; }

    const resp = await rede;
    return resp || new Response('', { status: 504, statusText: 'offline' });
  })());
});

/* permite limpar o cache pelo console, se algum dia precisar:
   navigator.serviceWorker.controller.postMessage('limpar-cache') */
self.addEventListener('message', (event) => {
  if (event.data === 'limpar-cache') {
    caches.keys().then((ns) => ns.forEach((n) => caches.delete(n)));
  }
});
