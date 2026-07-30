#!/usr/bin/env node
'use strict';

/* =========================================================
   build-projects.js
   ---------------------------------------------------------
   Gera uma pagina ESTATICA por projeto, uma URL real cada:

     pt  ->  /projetos/<slug>.html
     en  ->  /en/projects/<slug>.html

   POR QUE: hoje os projetos so existem em project.html?slug=X,
   montado no cliente. Nenhum crawler de IA executa JS (GPTBot,
   ClaudeBot, PerplexityBot, OAI-SearchBot leem so o HTML da 1a
   resposta), entao 9 estudos de caso eram invisiveis e o <h1>
   servido era "Loading...".

   FONTE DA VERDADE: continua sendo js/language.js (I18N). Este
   script le o objeto em build time, entao o fluxo de escrita do
   autor nao muda: ele edita o language.js como sempre.

   A pagina gerada NAO carrega project-case.js (o conteudo ja vem
   pronto): sem double-render e sem flash. Carrega so a camada de
   interatividade/animacao, igual ao resto do site.
   ========================================================= */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT     = path.resolve(__dirname, '..');
const SITE_URL = 'https://bernardoiannini.com';
const PERSON   = SITE_URL + '/#pessoa';   // @id estavel (Fase 3)

/* ---------- I18N: extrai o objeto sem executar a parte de DOM ---------- */
function loadI18N() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'language.js'), 'utf8');
  // o arquivo mistura dados (I18N) e runtime (le localStorage/DOM).
  // Cortamos na 1a linha de runtime pra rodar so a declaracao do objeto.
  const cut = src.search(/^let LANG\s*=/m);
  const dataOnly = cut > 0 ? src.slice(0, cut) : src;
  const ctx = { console };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(dataOnly + '\n;globalThis.__I18N = I18N;', ctx, { timeout: 10000 });
  if (!ctx.__I18N) throw new Error('I18N nao encontrado em js/language.js');
  return ctx.__I18N;
}

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean);

const abs = (p) => {
  if (!p) return '';
  if (/^https?:/i.test(p)) return p;
  return SITE_URL + (p.startsWith('/') ? '' : '/') + p;
};

const L = {
  pt: {
    dir: () => path.join(ROOT, 'projetos'),
    url: (s) => `/projetos/${s}.html`,
    home: '/', list: '/#projects', htmlLang: 'pt-BR', locale: 'pt_BR',
    back: 'Todos os projetos', crumbHome: 'Início', crumbList: 'Projetos',
    visit: 'Ver site', source: 'Código', built: 'Como foi construído',
    stackLabel: 'Stack', specsLabel: 'Ficha técnica', nextLabel: 'Próximo projeto',
    nav: { home: 'Início', about: 'Sobre', services: 'Serviços', work: 'Trabalhos',
           blog: 'Blog', contact: 'Contato', resume: 'Currículo' },
  },
  en: {
    dir: () => path.join(ROOT, 'en', 'projects'),
    url: (s) => `/en/projects/${s}.html`,
    home: '/en/', list: '/en/#projects', htmlLang: 'en', locale: 'en_US',
    back: 'All projects', crumbHome: 'Home', crumbList: 'Projects',
    visit: 'Visit live site', source: 'Source', built: 'How it was built',
    stackLabel: 'Stack', specsLabel: 'Technical specs', nextLabel: 'Next project',
    nav: { home: 'Home', about: 'About', services: 'Services', work: 'Work',
           blog: 'Blog', contact: 'Contact', resume: 'Resume' },
  },
};

/* BLOCO DE RESPOSTA (40-60 palavras)
   Regra do brief: nao inventar prosa. Montamos SO com texto do autor:
   `desc` + as primeiras frases do `longDesc`, cortando na fronteira de
   frase mais proxima da faixa. Se nem assim chegar a 40 palavras,
   entregamos o que existe e o relatorio marca [PREENCHER]. */
function answerBlock(p) {
  const norm = (s) => String(s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

  // quantas palavras de `cand` ja aparecem em `have` (evita repetir a mesma
  // frase: varios projetos abrem o longDesc reescrevendo o desc)
  const overlap = (have, cand) => {
    const H = new Set(norm(have).split(' ').filter(w => w.length > 3));
    const C = norm(cand).split(' ').filter(w => w.length > 3);
    if (!C.length) return 1;
    return C.filter(w => H.has(w)).length / C.length;
  };

  const out = [];
  const push = (s) => {
    s = String(s || '').trim();
    if (!s) return;
    if (out.length && overlap(out.join(' '), s) > 0.6) return;   // repeticao: descarta
    out.push(s);
  };

  /* Fonte PRIMARIA e o longDesc: e o texto mais completo do autor. Costurar
     desc + longDesc repetia a abertura (vários projetos reescrevem o desc na
     1a frase do longDesc). O desc entra so pra completar se faltar palavra. */
  const first = String(p.longDesc || '').split(/\n\s*\n/)[0] || '';
  for (const s of first.split(/(?<=[.!?])\s+/)) {
    if (words(out.join(' ')).length >= 40) break;
    push(s);
  }
  if (words(out.join(' ')).length < 40) push(p.desc);

  let text = out.join(' ').trim();
  const w = words(text);
  if (w.length > 60) text = w.slice(0, 60).join(' ').replace(/[,;:]$/, '') + '…';
  return text;
}

function jsonLd(p, lang, url) {
  const t = L[lang];
  const isSoftware = p.category === 'system' || p.category === 'automation';
  const work = {
    '@type': isSoftware ? 'SoftwareApplication' : 'CreativeWork',
    '@id': SITE_URL + url + '#projeto',
    name: p.title,
    description: p.desc || '',
    url: SITE_URL + url,
    inLanguage: t.htmlLang,
    author:    { '@id': PERSON },   // sempre por referencia, nunca duplicar
    publisher: { '@id': PERSON },
    creator:   { '@id': PERSON },
    isPartOf:  { '@id': SITE_URL + '/#site' },
  };
  if (p.cover) work.image = abs(p.cover);
  if (p.year)  work.dateCreated = String(p.year);
  if (p.link)  work.sameAs = [p.link];
  if (Array.isArray(p.stack) && p.stack.length) {
    work.keywords = p.stack.join(', ');
    if (isSoftware) { work.applicationCategory = 'WebApplication'; work.operatingSystem = 'Web'; }
  }
  const crumbs = {
    '@type': 'BreadcrumbList',
    '@id': SITE_URL + url + '#breadcrumb',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.crumbHome, item: SITE_URL + t.home },
      { '@type': 'ListItem', position: 2, name: t.crumbList, item: SITE_URL + t.list },
      { '@type': 'ListItem', position: 3, name: p.title, item: SITE_URL + url },
    ],
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [work, crumbs] }, null, 2);
}

const paras = (text) => String(text || '')
  .split(/\n\s*\n/).map(t => t.trim()).filter(Boolean)
  .map(t => `<p>${esc(t).replace(/\n/g, '<br/>')}</p>`).join('\n          ');

function regLine(p) {
  const bits = [];
  if (p.status) bits.push(esc(p.status));
  if (p.link)   bits.push(esc(String(p.link).replace(/^https?:\/\//, '').replace(/\/$/, '')));
  if (p.year)   bits.push(esc(String(p.year)));
  if (p.role)   bits.push(esc(p.role));
  return bits.join(' · ');
}

/* ---------- pagina ---------- */
function page(p, lang, next) {
  const t   = L[lang];
  const url = t.url(p.id);
  const alt = lang === 'en' ? L.pt.url(p.id) : L.en.url(p.id);
  const answer = answerBlock(p);
  const cover  = p.cover ? abs(p.cover) : abs('img/eufoto1.png');
  // description da meta: usa o desc do autor, cortado na faixa boa
  let metaDesc = String(p.desc || answer).replace(/\s+/g, ' ').trim();
  if (metaDesc.length > 160) metaDesc = metaDesc.slice(0, 157).replace(/[\s,;:]+$/, '') + '…';

  const title = `${p.title} · Bernardo Iannini`;

  const stack = Array.isArray(p.stack) && p.stack.length
    ? `<div class="pc-hero__tech">${p.stack.map((s, i) => `<span class="ps-pill" style="--i:${i}">${esc(s)}</span>`).join('')}</div>`
    : '';

  const specs = Array.isArray(p.specs) && p.specs.length
    ? `<section class="pc-specs" aria-label="${esc(t.specsLabel)}">
        <ul class="pc-specs__list">
          ${p.specs.map(s => `<li><span class="pc-specs__k">${esc(s.k)}</span> <span class="pc-specs__v">${esc(s.v)}</span></li>`).join('\n          ')}
        </ul>
      </section>` : '';

  const story = p.longDesc
    ? `<section class="pc-act pc-act--story" aria-labelledby="pcStoryTitle">
        <div class="pc-act__main">
          <h2 class="pc-act__title" id="pcStoryTitle">${esc(t.built)}</h2>
          <div class="pc-act__text">
          ${paras(p.longDesc)}
          </div>
        </div>
      </section>` : '';

  const impact = p.impact
    ? `<section class="pc-act pc-act--impact" aria-labelledby="pcImpactTitle">
        <div class="pc-act__main">
          <h2 class="pc-act__title" id="pcImpactTitle">${lang === 'en' ? 'Impact' : 'Impacto'}</h2>
          <div class="pc-act__text">
          ${paras(p.impact)}
          </div>
        </div>
      </section>` : '';

  const ctas = [
    p.link ? `<a class="ps-cta ps-cta--primary" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">${esc(t.visit)}</a>` : '',
    p.repo ? `<a class="ps-cta ps-cta--ghost" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">${esc(t.source)}</a>` : '',
  ].filter(Boolean).join('\n        ');

  const nextLink = next
    ? `<nav class="pc-next" aria-label="${esc(t.nextLabel)}">
      <a class="pc-next__link" href="${t.url(next.id)}">
        <span class="pc-next__label">${esc(t.nextLabel)}</span>
        <span class="pc-next__title">${esc(next.title)}</span>
      </a>
    </nav>` : '';

  const reg = regLine(p);

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="author" content="Bernardo Iannini">
  <meta name="description" content="${esc(metaDesc)}" />
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=JetBrains+Mono:wght@400;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">

  <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
  <link rel="icon" type="image/png" href="/favicon-48.png" sizes="48x48">
  <link rel="icon" type="image/png" href="/favicon_192px.png" sizes="192x192">
  <link rel="apple-touch-icon" href="/favicon_192px.png">
  <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any">
  <meta name="theme-color" content="#060807">

  <link rel="canonical" href="${SITE_URL}${url}" />
  <link rel="alternate" hreflang="pt-BR" href="${SITE_URL}${L.pt.url(p.id)}" />
  <link rel="alternate" hreflang="en" href="${SITE_URL}${L.en.url(p.id)}" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${L.pt.url(p.id)}" />
  <link rel="alternate" type="application/rss+xml" title="Blog · Bernardo Iannini" href="${SITE_URL}/feed.xml" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Bernardo Iannini" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(metaDesc)}" />
  <meta property="og:url" content="${SITE_URL}${url}" />
  <meta property="og:image" content="${esc(cover)}" />
  <meta property="og:image:alt" content="${esc(p.title)}" />
  <meta property="og:locale" content="${t.locale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(metaDesc)}" />
  <meta name="twitter:image" content="${esc(cover)}" />

  <script type="application/ld+json">
${jsonLd(p, lang, url)}
  </script>
</head>

<body class="pc-body">
  <!-- NAV estatica: os rotulos ja vem no idioma da rota, sem data-i18n,
       porque idioma aqui e URL e nao estado de cliente. -->
  <header>
    <div class="nav">
      <div class="nav-center">
        <nav class="pill">
          <a href="${t.home}">${esc(t.nav.home)}</a>
          <a href="${t.home}#sobre">${esc(t.nav.about)}</a>
          <a href="${t.home}#services">${esc(t.nav.services)}</a>
          <a href="${t.list}">${esc(t.nav.work)}</a>
          <a href="${lang === 'en' ? '/en/blog.html' : '/blog.html'}" class="nav-blog-link">${esc(t.nav.blog)}</a>
          <a href="${t.home}#contato">${esc(t.nav.contact)}</a>
        </nav>
      </div>
      <div class="nav-right">
        <a class="resume-btn" href="/Curriculo_Bernardo_Iannini.pdf" download>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v11m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>${esc(t.nav.resume)}</span>
        </a>
      </div>
    </div>
  </header>

  <main class="pc-main">
    <div class="pc-top">
      <a class="pc-back" href="${t.list}">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>${esc(t.back)}</span>
      </a>
    </div>

    <article class="pc-hero">
      ${reg ? `<p class="pc-reg">${reg}</p>` : ''}
      <h1 class="pc-hero__title">${esc(p.title)}</h1>
      <p class="pc-hero__desc">${esc(answer)}</p>
      ${stack}
      ${ctas ? `<div class="pc-hero__cta">\n        ${ctas}\n      </div>` : ''}
    </article>

    ${p.cover ? `<figure class="pc-shotbox">
      <img class="pc-shot" src="${esc(p.cover.startsWith('/') ? p.cover : '/' + p.cover)}" alt="${esc(p.title)}" width="1200" height="750" loading="eager" fetchpriority="high" decoding="async"/>
    </figure>` : ''}

    ${story}
    ${specs}
    ${impact}
    ${nextLink}
  </main>

  <!-- language.js ANTES do UI.js: o UI.js chama applyI18n() no init.
       Os rotulos da nav ja vem estaticos no HTML acima (idioma e rota,
       nao estado de cliente), o language.js entra so pra nao quebrar
       essa dependencia e pro switch continuar funcionando. -->
  <script src="/js/language.js" defer></script>
  <script src="/js/UI.js" defer></script>
</body>
</html>
`;
}

/* ---------- main ---------- */
function build(langs = ['pt']) {
  const I18N = loadI18N();
  const report = [];

  for (const lang of langs) {
    const list = (I18N[lang] && I18N[lang].projects && I18N[lang].projects.list) || [];
    if (!list.length) { console.warn(`[build-projects] sem projetos em ${lang}`); continue; }
    const dir = L[lang].dir();
    fs.mkdirSync(dir, { recursive: true });

    list.forEach((p, i) => {
      const next = list[(i + 1) % list.length];
      const html = page(p, lang, next);
      fs.writeFileSync(path.join(dir, `${p.id}.html`), html, 'utf8');
      const total = words(p.longDesc).length + words(p.desc).length;
      report.push({ lang, id: p.id, url: L[lang].url(p.id), words: total, answer: words(answerBlock(p)).length, thin: total < 150 });
    });
    console.log(`  ${lang}: ${list.length} paginas -> ${path.relative(ROOT, dir)}`);
  }
  return report;
}

if (require.main === module) {
  const langs = process.argv.includes('--all') ? ['pt', 'en'] : ['pt'];
  console.log('================================================');
  console.log('  build-projects.js');
  console.log('================================================');
  const rep = build(langs);
  const thin = rep.filter(r => r.thin);
  console.log(`  total: ${rep.length} paginas`);
  console.log(`  abaixo de 150 palavras (viram [PREENCHER]): ${thin.length}`);
  thin.forEach(r => console.log(`    ${r.lang} ${r.id.padEnd(20)} ${r.words}w  (bloco de resposta: ${r.answer}w)`));
  console.log('================================================');
}

module.exports = { build, loadI18N, answerBlock, L, SITE_URL, PERSON };
