#!/usr/bin/env node
'use strict';

/* =========================================================
   build-projects.js
   ---------------------------------------------------------
   Gera uma pagina ESTATICA por projeto, uma URL real cada:

     pt  ->  /projetos/<slug>.html
     en  ->  /en/projects/<slug>.html

   POR QUE: sem isto os projetos so existiriam em project.html?slug=X,
   montado no cliente. Nenhum crawler de IA executa JS (GPTBot,
   ClaudeBot, PerplexityBot, OAI-SearchBot leem so o HTML da 1a
   resposta), entao 9 estudos de caso eram invisiveis e o <h1>
   servido era "Loading...".

   COMO: a pagina nasce do PROPRIO project.html — o shell real — com
   os slots data-pc-* preenchidos no build com EXATAMENTE o mesmo HTML
   que js/project-case.js monta em runtime. Nao existe layout paralelo:
   mexeu no shell, a pagina gerada muda junto no proximo build.

   FONTES DA VERDADE (lidas em build time, nunca copiadas pra ca):
     js/language.js      -> I18N (conteudo dos projetos + rotulos)
     js/project-case.js  -> PC_ICONS, pcSlug, pcHostname
     project.html        -> shell (anti-flicker, nav, main, topo)

   A pagina gerada NAO carrega project-case.js: o conteudo ja veio
   pronto, entao carregar de novo so daria double-render e flash.
   Carrega o RESTO igual ao project.html — language.js, UI.js,
   sw-register.js, GSAP (+ScrollTrigger +DrawSVG), Lenis e
   project-fx.js, que e a camada de motion e so precisa do
   [data-pc-root] ja populado.

   UNICO desvio deliberado do runtime: o paragrafo do hero
   ([data-pc-desc]) recebe o BLOCO DE RESPOSTA (40-60 palavras,
   funcao answerBlock) em vez do `desc` curto. E o motivo de estas
   paginas existirem: a resposta direta que o crawler de IA extrai.
   Ver comentario da funcao.
   ========================================================= */

const fs   = require('fs');
const path = require('path');
const { localizeStatic, tagHeaderLabels } = require('./lib/i18n-static');
const vm   = require('vm');
const { renderCaseMain, projectMedia, splitTitle } = require('./lib/case-render');
/* configuracao propria de cada pagina (apps, site ao vivo, blocos extras) */
const CASES = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'cases.json'), 'utf8')); } catch { return {}; } })();

const ROOT     = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.bernardoiannini.com';
const PERSON   = SITE_URL + '/#pessoa';   // @id estavel (Fase 3)

/* =========================================================
   FONTES DA VERDADE
   ========================================================= */

/* I18N: extrai o objeto sem executar a parte de DOM do language.js */
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

/* project-case.js: os icones e os dois helpers vem do arquivo de verdade,
   nao de uma copia. O modulo so toca no DOM DENTRO de funcoes, entao roda
   inteiro num contexto com window/URL falsos sem efeito colateral. */
function loadCase() {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'project-case.js'), 'utf8');
  const ctx = { window: {}, console, URL };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(
    src + '\n;globalThis.__PC = { PC_ICONS, pcSlug, pcHostname, pcCoverSet, PC_COVER_SIZES, PC_NEXT_SIZES };',
    ctx, { timeout: 10000 });
  if (!ctx.__PC || !ctx.__PC.PC_ICONS) throw new Error('PC_ICONS nao encontrado em js/project-case.js');
  return ctx.__PC;
}

/* project.html: o shell. Recortamos os pedacos que a pagina gerada reusa. */
function loadShell() {
  const src = fs.readFileSync(path.join(ROOT, 'project.html'), 'utf8');

  const fxStart = src.indexOf('<style id="page-fx">');
  const fxEnd   = src.indexOf('<!-- Open Graph');
  if (fxStart < 0 || fxEnd < 0) throw new Error('bloco anti-flicker nao encontrado em project.html');

  const skipStart = src.indexOf('<a class="skip-link"');
  const headStart = src.indexOf('<header>');
  const headEnd   = src.indexOf('</header>') + '</header>'.length;
  const mainStart = src.indexOf('<main id="pcMain"');
  const mainEnd   = src.indexOf('</main>') + '</main>'.length;
  if (skipStart < 0 || headStart < 0 || mainStart < 0) throw new Error('body do project.html fora do formato esperado');

  return {
    fx:     src.slice(fxStart, fxEnd).trimEnd(),
    skip:   src.slice(skipStart, src.indexOf('</a>', skipStart) + 4),
    header: src.slice(headStart, headEnd),
    main:   src.slice(mainStart, mainEnd),
  };
}

/* =========================================================
   MICRO-EDITOR DE HTML
   ---------------------------------------------------------
   O repo nao tem parser de DOM e nao vamos instalar um. Como o shell
   e HTML conhecido e bem formado, basta um scanner que respeita aspas
   e aninhamento pra achar o elemento de um marcador, trocar o conteudo
   e mexer nos atributos.
   ========================================================= */

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/* indice do '>' que fecha a tag aberta em `open` (ignora '>' dentro de aspas) */
function tagEndAt(html, open) {
  let quote = null;
  for (let i = open + 1; i < html.length; i++) {
    const c = html[i];
    if (quote) { if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '>') return i;
  }
  throw new Error('tag sem fechamento a partir de ' + open);
}

/* acha o elemento que carrega o atributo `attr` (1a ocorrencia).
   O (?![-\w]) impede que data-pc-story case com data-pc-story-title. */
function locate(html, attr) {
  const re = new RegExp('\\s' + attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![-\\w])');
  const m = re.exec(html);
  if (!m) throw new Error('marcador ausente no shell: ' + attr);
  const open = html.lastIndexOf('<', m.index);
  const end  = tagEndAt(html, open);
  const name = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(open, end + 1))[1].toLowerCase();
  return { open, end, name, tag: html.slice(open, end + 1) };
}

/* indice do '</name>' que fecha a tag aberta, contando aninhamento */
function closeIndexOf(html, name, from) {
  const open  = new RegExp('<' + name + '(?=[\\s/>])', 'gi');
  const close = new RegExp('</' + name + '\\s*>', 'gi');
  let depth = 1, i = from;
  for (;;) {
    open.lastIndex = i; close.lastIndex = i;
    const o = open.exec(html);
    const c = close.exec(html);
    if (!c) throw new Error('sem </' + name + '> a partir de ' + from);
    if (o && o.index < c.index) { depth++; i = o.index + 1; continue; }
    if (--depth === 0) return c.index;
    i = c.index + 1;
  }
}

/* seta/remove atributo na string da tag aberta (value null|false remove) */
function setAttr(tag, name, value) {
  const re = new RegExp(
    '\\s+' + name + '(?![-\\w])(?:=(?:"[^"]*"|\'[^\']*\'|[^\\s>]+))?', 'i');
  const stripped = tag.replace(re, '');
  if (value === null || value === false) return stripped;
  const attr = value === true
    ? ' ' + name
    : ' ' + name + '="' + String(value).replace(/"/g, '&quot;') + '"';
  const selfClose = /\/>$/.test(stripped);
  return stripped.slice(0, selfClose ? -2 : -1) + attr + (selfClose ? '/>' : '>');
}

function addClass(tag, cls) {
  const m = /\sclass="([^"]*)"/i.exec(tag);
  if (!m) return setAttr(tag, 'class', cls);
  if (m[1].split(/\s+/).includes(cls)) return tag;
  return tag.replace(m[0], ' class="' + m[1] + ' ' + cls + '"');
}

/* preenche um slot: `inner` troca o conteudo, `tag` reescreve a tag aberta */
function fillEl(html, attr, { inner, tag } = {}) {
  const el = locate(html, attr);
  const open = tag ? tag(el.tag) : el.tag;
  const head = html.slice(0, el.open) + open;
  if (inner === undefined || VOID_TAGS.has(el.name)) return head + html.slice(el.end + 1);
  return head + inner + html.slice(closeIndexOf(html, el.name, el.end + 1));
}

/* =========================================================
   HELPERS DE TEXTO / URL
   ========================================================= */

/* escapa o que o runtime escreve com textContent (title, desc, impact.text…).
   Campos que o runtime escreve com innerHTML entram crus, senao o <em>
   serif dos titulos viraria texto literal. */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean);

const abs = (p) => {
  if (!p) return '';
  if (/^https?:/i.test(p)) return p;
  return SITE_URL + (p.startsWith('/') ? '' : '/') + p;
};

/* caminhos do I18N sao relativos a raiz ("img/x.webp"): em /projetos/x.html
   isso resolveria pra /projetos/img/x.webp. Aqui viram sempre absolutos. */
const asset = (p) => {
  if (!p) return '';
  if (/^(https?:|data:|\/)/i.test(p)) return p;
  return '/' + p;
};

const dig = (obj, keyPath) => keyPath.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

const L = {
  pt: {
    dir: () => path.join(ROOT, 'projetos'),
    url: (s) => `/projetos/${s}.html`,
    home: '/', list: '/#projects', blog: '/blog.html', about: '/sobre.html',
    htmlLang: 'pt-BR', locale: 'pt_BR', altLocale: 'en_US',
    crumbHome: 'Início', crumbList: 'Projetos',
  },
  en: {
    dir: () => path.join(ROOT, 'en', 'projects'),
    url: (s) => `/en/projects/${s}.html`,
    /* a home e o blog sao uma URL so (idioma troca no cliente): nao
       existe /en/ nem /en/blog.html, linkar pra eles dava 404 */
    home: '/', list: '/#projects', blog: '/blog.html', about: '/en/about.html',
    htmlLang: 'en', locale: 'en_US', altLocale: 'pt_BR',
    crumbHome: 'Home', crumbList: 'Projects',
  },
};

/* =========================================================
   BLOCO DE RESPOSTA (40-60 palavras)
   Regra: nao inventar prosa. Montamos SO com texto do autor —
   `longDesc` (o texto mais completo) cortado na fronteira de frase
   mais proxima da faixa; o `desc` entra so pra completar se faltar
   palavra. Se nem assim chegar a 40, entregamos o que existe e o
   relatorio marca [PREENCHER].

   Este e o unico ponto em que a pagina estatica difere do runtime
   (que joga o `desc` no [data-pc-desc]): e o paragrafo que o crawler
   de IA extrai como resposta, e nos 3 cases com story.problem o
   longDesc nao aparece em nenhum outro lugar da pagina.
   ========================================================= */
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

/* =========================================================
   DADOS ESTRUTURADOS
   ========================================================= */
function jsonLd(p, lang, url) {
  const t = L[lang];
  const isSoftware = p.category === 'system' || p.category === 'automation';
  const media = projectMedia(ROOT, p.id);
  const { name } = splitTitle(p.title);
  const img = (src, caption) => ({
    '@type': 'ImageObject',
    contentUrl: abs(src.split('?')[0]),
    caption,
    creator: { '@id': PERSON },
    creditText: 'Bernardo Iannini',
    copyrightNotice: 'Bernardo Iannini',
  });
  const images = [];
  if (p.cover) images.push(img(p.cover, p.title));
  media.desktop.concat(media.mobile).slice(0, 6)
    .forEach((m, i) => images.push(img(m.src, `${name} · ${i + 1}`)));

  const work = {
    '@type': isSoftware ? 'SoftwareApplication' : 'CreativeWork',
    '@id': SITE_URL + url + '#projeto',
    name: p.title,
    alternateName: name,
    description: p.desc || '',
    abstract: answerBlock(p),
    url: SITE_URL + url,
    inLanguage: t.htmlLang,
    author:    { '@id': PERSON },   // sempre por referencia, nunca duplicar
    creator:   { '@id': PERSON },
    publisher: { '@id': PERSON },
    isPartOf:  { '@id': SITE_URL + '/#site' },
    mainEntityOfPage: { '@id': SITE_URL + url + '#pagina' },
  };
  if (images.length) work.image = images;
  if (p.year)  work.dateCreated = String(p.year);
  if (p.link)  work.sameAs = [p.link];
  if (Array.isArray(p.stack) && p.stack.length) work.keywords = p.stack.join(', ');
  if (isSoftware) {
    work.applicationCategory = 'BusinessApplication';
    work.operatingSystem = (p.apps && (p.apps.android || p.apps.ios)) ? 'Web, Android, iOS' : 'Web';
    if (p.link) work.url = p.link;
  }
  const pageNode = {
    '@type': 'WebPage',
    '@id': SITE_URL + url + '#pagina',
    url: SITE_URL + url,
    name: `${p.title} · Bernardo Iannini`,
    inLanguage: t.htmlLang,
    isPartOf: { '@id': SITE_URL + '/#site' },
    about: { '@id': SITE_URL + url + '#projeto' },
    author: { '@id': PERSON },
    breadcrumb: { '@id': SITE_URL + url + '#breadcrumb' },
  };
  if (p.cover) pageNode.primaryImageOfPage = { '@type': 'ImageObject', url: abs(p.cover.split('?')[0]) };
  const crumbs = {
    '@type': 'BreadcrumbList',
    '@id': SITE_URL + url + '#breadcrumb',
    itemListElement: [
      /* sem o nivel "Projetos": ele e uma ancora da home (/#projects), nao
         uma pagina, e o Google leria a home duplicada na trilha */
      { '@type': 'ListItem', position: 1, name: t.crumbHome, item: SITE_URL + t.home },
      { '@type': 'ListItem', position: 2, name: p.title, item: SITE_URL + url },
    ],
  };
  /* a pessoa por referencia + o vinculo explicito "fez este projeto" */
  const person = {
    '@type': 'Person',
    '@id': PERSON,
    name: 'Bernardo Iannini',
    url: SITE_URL + '/',
    image: SITE_URL + '/img/eufoto1.png',
    jobTitle: 'Full Stack Developer & AI Designer',
    sameAs: ['https://www.linkedin.com/in/bernardo-iannini', 'https://github.com/iannini25'],
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [work, pageNode, crumbs, person] }, null, 2);
}

/* =========================================================
   NAV — mesma estrutura do shell (menu mobile, dropdown, hamburguer),
   mas com os rotulos JA no idioma da ROTA e sem data-i18n: aqui idioma
   e URL, nao estado de cliente, entao o applyI18n() do UI.js nao pode
   reescrever a nav pro idioma salvo no localStorage. O switch de idioma
   sai da pagina pelo mesmo motivo (a troca e navegar pro hreflang).
   ========================================================= */
function bakeLabels(html, lang, I18N) {
  let h = html;
  for (;;) {
    const m = /\sdata-i18n(?![-\w])="([^"]+)"/.exec(h);
    if (!m) break;
    const val = dig(I18N[lang], m[1]);
    h = fillEl(h, m[0].trim(), {
      inner: typeof val === 'string' ? esc(val) : undefined,
      tag: tg => setAttr(tg, 'data-i18n', null),
    });
  }
  return h;
}

function fillNav(shellHeader, lang, I18N) {
  const t = L[lang];
  let h = shellHeader;

  /* o switch de idioma FICA (a .nav e um grid de 3 colunas: sem ele o pill
     central desalinha), mas aqui ele NAVEGA pro hreflang equivalente em vez
     de so trocar strings — ver o script no fim do <body>. */
  h = h.replace('<span id="langCode">EN</span>', `<span id="langCode">${lang.toUpperCase()}</span>`);
  h = h.replace(/(<li data-lang="(en|pt)"[^>]*aria-selected=")(?:true|false)(")/g,
                (m, head, li, tail) => head + String(li === lang) + tail);

  h = bakeLabels(h, lang, I18N);

  // ancoras da home viram absolutas (nao existem NESTA pagina)
  h = h.replace(/\sdata-scroll(?![-\w])/g, '');
  h = h.replace(/href="#/g, `href="${t.home}#`);
  h = h.replace(/href="\/blog\.html"/g, `href="${t.blog}"`);
  h = h.replace('href="Curriculo_Bernardo_Iannini.pdf"', lang === 'en' ? 'href="/Resume_Bernardo_Iannini.pdf"' : 'href="/Curriculo_Bernardo_Iannini.pdf"');
  return h;
}

/* =========================================================
   PAGINA
   ========================================================= */
function page(p, lang, others, I18N, SHELL, PC) {
  const t   = L[lang];
  const url = t.url(p.id);
  const cover = p.cover ? abs(p.cover) : abs('img/eufoto1.png');
  // description da meta: usa o desc do autor, cortado na faixa boa
  let metaDesc = String(p.desc || answerBlock(p)).replace(/\s+/g, ' ').trim();
  if (metaDesc.length > 160) metaDesc = metaDesc.slice(0, 157).replace(/[\s,;:]+$/, '') + '…';

  const title = `${p.title} · Bernardo Iannini`;

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${esc(title)}</title>
  <meta name="author" content="Bernardo Iannini">
  <meta name="description" content="${esc(metaDesc)}" />
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=JetBrains+Mono:wght@400;600;700&family=Instrument+Serif:ital@0;1&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=JetBrains+Mono:wght@400;600;700&family=Instrument+Serif:ital@0;1&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=JetBrains+Mono:wght@400;600;700&family=Instrument+Serif:ital@0;1&display=swap"></noscript></noscript>
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

  <script>
    /* Aqui o idioma e a ROTA (/projetos/ = pt, /en/projects/ = en), nao
       estado de cliente. Sem isto o applyI18n() do UI.js rodaria no idioma
       salvo no localStorage e deixaria <html lang> e o seletor discordando
       do conteudo servido. Roda ANTES do bloco anti-flicker, que le esse
       mesmo valor. */
    try { localStorage.setItem('lang', '${lang}'); } catch (e) {}
  </script>

  ${SHELL.fx}
  <script>document.documentElement.classList.add('cs-js');</script>

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Bernardo Iannini" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(metaDesc)}" />
  <meta property="og:url" content="${SITE_URL}${url}" />
  <meta property="og:image" content="${esc(cover)}" />
  <meta property="og:image:width" content="1600" />
  <meta property="og:image:height" content="900" />
  <meta property="og:image:alt" content="${esc(p.title)} · Bernardo Iannini" />
  <meta property="article:author" content="${SITE_URL}${t.about}" />
  <meta property="og:locale" content="${t.locale}" />
  <meta property="og:locale:alternate" content="${t.altLocale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(metaDesc)}" />
  <meta name="twitter:image" content="${esc(cover)}" />

  <script type="application/ld+json">
${jsonLd(p, lang, url)}
  </script>
</head>

<body>
  ${bakeLabels(SHELL.skip, lang, I18N)}

  ${fillNav(SHELL.header, lang, I18N)}

  ${renderCaseMain({
    p, lang, t, others, root: ROOT, cfg: CASES[p.id] || {},
    PC_ICONS: PC.PC_ICONS,
    hostname: PC.pcHostname,
    asset,
    answer: answerBlock(p),
    coverSet: (ext) => PC.pcCoverSet(asset(p.cover), ext),
    coverSetFor: (op, ext) => PC.pcCoverSet(asset(op.cover), ext),
  })}

  <!-- language.js ANTES do UI.js: o init() do UI.js chama applyI18n() de
       forma sincrona assim que carrega. project-case.js NAO entra aqui de
       proposito — o conteudo ja veio pronto do build, carregar de novo so
       daria double-render e flash. -->
  <script src="/js/language.js" defer></script>
  <script src="/js/UI.js" defer></script>
  <script src="/js/sw-register.js" defer></script>
  <script src="/js/img-skeleton.js" defer></script>

  <!-- camada de interacao da pagina (vanilla, sem GSAP/Lenis): reveals,
       tour pelas telas, passos e galeria. Sem ela a pagina fica 100%
       legivel e funcional. -->
  <script src="/js/project-fx.js" defer></script>

  <script>
    /* Seletor de idioma: NAVEGA pro equivalente em vez de so trocar strings
       (o conteudo desta pagina veio pronto do build, no idioma da rota).
       Fase de CAPTURA pra rodar antes do handler que o language.js pendura
       em cada <li>, que chamaria applyI18n() no lugar. */
    (function () {
      var menu = document.getElementById('langMenu');
      if (!menu) return;
      var alt = { pt: '${L.pt.url(p.id)}', en: '${L.en.url(p.id)}' };
      function go(e) {
        var li = e.target && e.target.closest && e.target.closest('[data-lang]');
        if (!li) return;
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        var url = alt[li.getAttribute('data-lang')];
        if (!url) return;
        e.preventDefault();
        e.stopPropagation();
        document.cookie = 'lang=' + li.getAttribute('data-lang') + '; path=/; max-age=31536000; samesite=lax';
        location.href = url;
      }
      menu.addEventListener('click', go, true);
      menu.addEventListener('keydown', go, true);
    })();
  </script>
</body>

</html>
`;
}

/* =========================================================
   BUILD
   ========================================================= */

/* mesmos criterios do showcase e do project-case.js (pcRealProjects):
   so projetos com capa E link entram como caso navegavel */
function realProjects(I18N, lang, pcSlug) {
  const list = (I18N[lang] && I18N[lang].projects && I18N[lang].projects.list) || [];
  return list.filter(p => p && p.cover && (p.link || p.local))
             .map(p => ({ ...p, id: p.id || pcSlug(p.title) }));
}

function build(langs = ['pt']) {
  const I18N  = loadI18N();
  const PC    = loadCase();
  const SHELL = loadShell();
  const report = [];

  for (const lang of langs) {
    const list = realProjects(I18N, lang, PC.pcSlug);
    if (!list.length) { console.warn(`[build-projects] sem projetos em ${lang}`); continue; }
    const dir = L[lang].dir();
    fs.mkdirSync(dir, { recursive: true });

    list.forEach((p, i) => {
      const others = [1, 2, 3].map(k => list[(i + k) % list.length]).filter(o => o.id !== p.id);
      const html = localizeStatic(tagHeaderLabels(page(p, lang, others, I18N, SHELL, PC)), I18N[lang]);
      if (html.includes('[object Object]')) {
        throw new Error(`[build-projects] ${lang}/${p.id}: [object Object] no HTML`);
      }
      fs.writeFileSync(path.join(dir, `${p.id}.html`), html, 'utf8');
      const total = words(p.longDesc).length + words(p.desc).length;
      report.push({ lang, id: p.id, url: L[lang].url(p.id), words: total,
                    answer: words(answerBlock(p)).length, thin: total < 150 });
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
