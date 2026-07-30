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
const vm   = require('vm');

const ROOT     = path.resolve(__dirname, '..');
const SITE_URL = 'https://bernardoiannini.com';
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
    src + '\n;globalThis.__PC = { PC_ICONS, pcSlug, pcHostname };',
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
    home: '/', list: '/#projects', blog: '/blog.html',
    htmlLang: 'pt-BR', locale: 'pt_BR', altLocale: 'en_US',
    crumbHome: 'Início', crumbList: 'Projetos',
  },
  en: {
    dir: () => path.join(ROOT, 'en', 'projects'),
    url: (s) => `/en/projects/${s}.html`,
    home: '/en/', list: '/en/#projects', blog: '/en/blog.html',
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

/* =========================================================
   BLOCOS — espelho fiel de js/project-case.js
   Mesmas classes, mesma ordem, mesmos separadores. Se algo mudar la,
   muda aqui (e o diff das duas paginas denuncia na hora).
   ========================================================= */
function makeBlocks(PC) {
  const { PC_ICONS, pcSlug, pcHostname } = PC;

  /* linha de registro: status · dominio · ano · papel */
  const regHtml = (p) => {
    const host = pcHostname(p.link);
    const items = [];
    if (p.status) items.push(`<span class="pc-reg__item pc-reg__status"><i class="pc-reg__dot" aria-hidden="true"></i>${p.status}</span>`);
    if (host)     items.push(`<a class="pc-reg__item pc-reg__host" href="${p.link}" target="_blank" rel="noopener noreferrer">${host}</a>`);
    if (p.year)   items.push(`<span class="pc-reg__item">${p.year}</span>`);
    if (p.role)   items.push(`<span class="pc-reg__item">${p.role}</span>`);
    return items.join('<span class="pc-reg__sep" aria-hidden="true">·</span>');
  };

  const techHtml = (p) => (p.stack || [])
    .map((t, i) => `<span class="ps-pill" style="--i:${i}">${t}</span>`).join('');

  /* cap duro de 3 paragrafos: o instrumento precisa chegar cedo */
  const storyTextHtml = (raw) => String(raw).split(/\n\s*\n/).slice(0, 3)
    .map(x => `<p>${x.trim()}</p>`).join('');

  /* nota de margem: fio 1px + tag "// nota do engenheiro" + corpo mono */
  const noteHtml = (text, labels) =>
    '<i class="pc-note__wire" aria-hidden="true"></i>' +
    `<span class="pc-note__tag"><b aria-hidden="true">//</b> ${labels.noteLabel || "engineer's note"}</span>` +
    `<span class="pc-note__body">${text}</span>`;

  const flowHtml = (steps) => steps.map(s =>
    `<span class="pc-flow__step"><span class="pc-flow__label">${s.label}</span>` +
    `${s.sub ? `<span class="pc-flow__sub">${s.sub}</span>` : ''}</span>`
  ).join('<span class="pc-flow__arrow" aria-hidden="true">→</span>');

  /* registro-dev: no MAXIMO UM por topico — deep vence tech */
  const topicsHtml = (p, labels) => (p.topics || []).map((t, i) => {
    const realPath = t.path ? '/' + String(t.path).replace(/^\/+/, '') : '';
    const dev = (t.deep && t.deep.length)
      ? `<details class="pd-deep">` +
        `<summary class="pd-deep__sum"><b aria-hidden="true">$</b> ${labels.deepLabel || 'how i solved it'}</summary>` +
        `<div class="pd-deep__body">${t.deep.map(l => `<span>${l}</span>`).join('')}</div></details>`
      : (t.tech ? `<p class="pd-topic__tech"><b aria-hidden="true">//</b> ${t.tech}</p>` : '');
    return `
      <article class="pd-topic" style="--i:${i}" data-path="${realPath || pcSlug(t.title)}"${t.shot ? ` data-shot="${asset(t.shot)}"` : ''}>
        <span class="pd-topic__icon" aria-hidden="true">${PC_ICONS[t.icon] || PC_ICONS.layers}</span>
        <div class="pd-topic__body">
          <h3 class="pd-topic__title">${t.title}</h3>
          <p class="pd-topic__text">${t.text}</p>
          ${dev}
        </div>
      </article>
    `;
  }).join('');

  const metricsHtml = (metrics) => metrics.map(m =>
    `<div class="pc-metric"><span class="pc-metric__value">${m.value}</span>` +
    `<span class="pc-metric__label">${m.label}</span>` +
    `${m.detail ? `<span class="pc-metric__detail">${m.detail}</span>` : ''}</div>`
  ).join('');

  const specsHtml = (rows) => rows.map(r =>
    `<div class="pc-specs__row"><dt>${r.k}</dt>` +
    `<dd>${r.link ? `<a href="${r.link}" target="_blank" rel="noopener noreferrer">${r.v}</a>` : r.v}</dd></div>`
  ).join('');

  return { regHtml, techHtml, storyTextHtml, noteHtml, flowHtml, topicsHtml, metricsHtml, specsHtml, pcHostname };
}

/* =========================================================
   MAIN — preenche os slots do shell
   ========================================================= */
function fillMain(shellMain, p, lang, next, I18N, B) {
  const t = L[lang];
  const labels = (I18N[lang].projects && I18N[lang].projects.case) || {};
  let h = shellMain;

  /* ---- voltar ---- */
  h = h.replace('<a class="pc-back" href="/#projects">', `<a class="pc-back" href="${t.list}">`);
  h = fillEl(h, 'data-i18n="projects.case.back"', {
    inner: esc(labels.back || 'All projects'),
    tag: tg => setAttr(tg, 'data-i18n', null),
  });

  /* ---- linha de registro ---- */
  const reg = B.regHtml(p);
  h = fillEl(h, 'data-pc-reg', { inner: reg, tag: tg => setAttr(tg, 'hidden', reg ? null : true) });

  /* ---- hero ---- */
  h = fillEl(h, 'data-pc-title', { inner: esc(p.title) });
  h = fillEl(h, 'data-pc-desc',  { inner: esc(answerBlock(p)) });
  h = fillEl(h, 'data-pc-tech',  { inner: B.techHtml(p) });

  /* ---- CTAs ---- */
  h = fillEl(h, 'data-pc-link', {
    tag: tg => setAttr(setAttr(tg, 'href', p.link || '#'), 'style', p.link ? null : 'display: none'),
  });
  h = fillEl(h, 'data-pc-link-label', { inner: esc(labels.visitSite || 'Visit live site') });
  h = fillEl(h, 'data-pc-repo', {
    tag: tg => setAttr(setAttr(tg, 'href', p.repo || '#'), 'style', p.repo ? null : 'display: none'),
  });
  // sem repo o runtime nem toca no rotulo (o CTA fica display:none) — igual aqui
  if (p.repo) h = fillEl(h, 'data-pc-repo-label', { inner: esc(labels.repoBtn || 'Source') });

  /* ---- ato "o problema" — story.problem quando existir, senao o longDesc ---- */
  const prob = (p.story && p.story.problem) || null;
  const storyText = (prob && prob.text) || p.longDesc || '';
  const storyNote = prob && prob.note;
  h = fillEl(h, 'data-pc-story', {
    tag: tg => {
      let out = setAttr(tg, 'hidden', storyText ? null : true);
      if (storyText && !storyNote) out = addClass(out, 'pc-act--solo');
      return out;
    },
  });
  h = fillEl(h, 'data-pc-story-title', {
    inner: !storyText ? '' : ((prob && prob.title)
      || (prob ? (labels.problemTitle || 'The problem') : (labels.aboutTitle || 'About the project'))),
  });
  h = fillEl(h, 'data-pc-story-text', { inner: storyText ? B.storyTextHtml(storyText) : '' });
  h = fillEl(h, 'data-pc-story-note', {
    inner: storyText && storyNote ? B.noteHtml(storyNote, labels) : '',
    tag: tg => setAttr(tg, 'hidden', storyText && storyNote ? null : true),
  });

  /* linha de fluxo — o momento "recontavel em 10 segundos" */
  const steps = (storyText && p.flow && p.flow.steps) || [];
  h = fillEl(h, 'data-pc-flow', {
    inner: steps.length < 2 ? '' : B.flowHtml(steps),
    tag: tg => setAttr(tg, 'hidden', steps.length < 2 ? true : null),
  });

  /* ---- janela: URL viva + video (ou capa + selo "em breve") ---- */
  h = fillEl(h, 'data-pc-url', { inner: esc(B.pcHostname(p.link)) });
  h = fillEl(h, 'data-pc-video', {
    tag: tg => {
      if (!p.video) return setAttr(tg, 'hidden', true);
      let out = setAttr(tg, 'src', asset(p.video));
      if (p.cover) out = setAttr(out, 'poster', asset(p.cover));
      /* preload="none" e regra de performance do site (ver js/projects.js):
         com autoplay o browser ignora a dica, entao nao custa playback. */
      return setAttr(setAttr(out, 'preload', 'none'), 'hidden', null);
    },
  });
  h = fillEl(h, 'data-pc-cover', {
    tag: tg => {
      if (p.video) return setAttr(tg, 'hidden', true);
      let out = setAttr(setAttr(tg, 'src', asset(p.cover)), 'alt', esc(p.title));
      return setAttr(out, 'hidden', p.cover ? null : true);
    },
  });
  h = fillEl(h, 'data-pc-soon', {
    inner: esc(labels.videoSoon || 'Video coming soon'),
    tag: tg => setAttr(setAttr(tg, 'data-i18n', null), 'hidden', p.video ? true : null),
  });

  /* ---- topicos ---- */
  h = fillEl(h, 'data-pc-built-title', { inner: labels.builtTitle || 'How it was built' });
  h = fillEl(h, 'data-pc-topics', { inner: B.topicsHtml(p, labels) });

  /* ---- ato "o que isso mudou" — so com impact.text ou metrics >= 2 ---- */
  const imp = p.impact || {};
  const metrics = (p.metrics || []).slice(0, 4);
  const hasMetrics = metrics.length >= 2;
  const showImpact = !!imp.text || hasMetrics;
  h = fillEl(h, 'data-pc-impact', {
    tag: tg => {
      let out = setAttr(tg, 'hidden', showImpact ? null : true);
      if (!showImpact) return out;
      out = setAttr(out, 'data-path', labels.impactPath || 'impact');
      return imp.note ? out : addClass(out, 'pc-act--solo');
    },
  });
  h = fillEl(h, 'data-pc-impact-title', { inner: showImpact ? (labels.impactTitle || 'What it changed') : '' });
  h = fillEl(h, 'data-pc-impact-text', {
    inner: showImpact && imp.text ? esc(imp.text) : '',
    tag: tg => setAttr(tg, 'hidden', showImpact && imp.text ? null : true),
  });
  h = fillEl(h, 'data-pc-metrics', {
    inner: showImpact && hasMetrics ? B.metricsHtml(metrics) : '',
    tag: tg => showImpact && hasMetrics
      ? setAttr(setAttr(tg, 'hidden', null), 'style', `--pc-metrics-n: ${metrics.length}`)
      : setAttr(tg, 'hidden', true),
  });
  h = fillEl(h, 'data-pc-impact-note', {
    inner: showImpact && imp.note ? B.noteHtml(imp.note, labels) : '',
    tag: tg => setAttr(tg, 'hidden', showImpact && imp.note ? null : true),
  });

  /* ---- ficha tecnica ($ cat specs.txt) — so com specs[] ---- */
  const specRows = (p.specs || []).slice();
  if (specRows.length && p.repo) specRows.push({ k: 'source', v: p.repo, link: p.repo });
  h = fillEl(h, 'data-pc-specs', { tag: tg => setAttr(tg, 'hidden', specRows.length ? null : true) });
  h = fillEl(h, 'data-pc-specs-cmd', { inner: esc(labels.specsCmd || 'cat specs.txt') });
  h = fillEl(h, 'data-pc-specs-comment', {
    inner: specRows.length ? esc('  ' + (labels.specsComment || '# for the technical reader')) : '',
  });
  h = fillEl(h, 'data-pc-specs-list', { inner: specRows.length ? B.specsHtml(specRows) : '' });

  /* ---- assinatura (porta de contato) ---- */
  h = h.replace('<a class="ps-cta ps-cta--ghost pc-sign__cta" href="/#contato">',
                `<a class="ps-cta ps-cta--ghost pc-sign__cta" href="${t.home}#contato">`);
  h = fillEl(h, 'data-pc-sign-line', { inner: labels.signLine || '' });
  h = fillEl(h, 'data-pc-sign-cta',  { inner: esc(labels.signCta || 'Get in touch') });

  /* ---- proximo projeto (URL real, nao ?slug=) ---- */
  h = fillEl(h, 'data-i18n="projects.case.nextProject"', {
    inner: esc(labels.nextProject || 'Next project'),
    tag: tg => setAttr(tg, 'data-i18n', null),
  });
  h = fillEl(h, 'data-pc-next',       { tag: tg => setAttr(tg, 'href', t.url(next.id)) });
  h = fillEl(h, 'data-pc-next-title', { inner: esc(next.title) });
  h = fillEl(h, 'data-pc-next-img',   { tag: tg => setAttr(tg, 'src', asset(next.cover)) });
  if (!next.cover) {
    h = h.replace('<span class="pc-next__thumb" aria-hidden="true">',
                  '<span class="pc-next__thumb" aria-hidden="true" style="display: none">');
  }

  return h;
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
  h = h.replace('href="Curriculo_Bernardo_Iannini.pdf"', 'href="/Curriculo_Bernardo_Iannini.pdf"');
  return h;
}

/* =========================================================
   PAGINA
   ========================================================= */
function page(p, lang, next, I18N, SHELL, B) {
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

  <script>
    /* Aqui o idioma e a ROTA (/projetos/ = pt, /en/projects/ = en), nao
       estado de cliente. Sem isto o applyI18n() do UI.js rodaria no idioma
       salvo no localStorage e deixaria <html lang> e o seletor discordando
       do conteudo servido. Roda ANTES do bloco anti-flicker, que le esse
       mesmo valor. */
    try { localStorage.setItem('lang', '${lang}'); } catch (e) {}
  </script>

  ${SHELL.fx}

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Bernardo Iannini" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(metaDesc)}" />
  <meta property="og:url" content="${SITE_URL}${url}" />
  <meta property="og:image" content="${esc(cover)}" />
  <meta property="og:image:alt" content="${esc(p.title)}" />
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

  ${fillMain(SHELL.main, p, lang, next, I18N, B)}

  <!-- language.js ANTES do UI.js: o init() do UI.js chama applyI18n() de
       forma sincrona assim que carrega. project-case.js NAO entra aqui de
       proposito — o conteudo ja veio pronto do build, carregar de novo so
       daria double-render e flash. -->
  <script src="/js/language.js" defer></script>
  <script src="/js/UI.js" defer></script>
  <script src="/js/sw-register.js" defer></script>

  <!-- GSAP + Lenis (defer) + a camada de motion da pagina, igual ao
       project.html. O project-fx.js so precisa do [data-pc-root] ja
       populado — exatamente o nosso caso. Sem eles a pagina fica 100%
       legivel e funcional. DrawSVG: traco dos icones dos topicos. -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/DrawSVGPlugin.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js" defer></script>
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
  return list.filter(p => p && p.cover && p.link)
             .map(p => ({ ...p, id: p.id || pcSlug(p.title) }));
}

function build(langs = ['pt']) {
  const I18N  = loadI18N();
  const PC    = loadCase();
  const SHELL = loadShell();
  const B     = makeBlocks(PC);
  const report = [];

  for (const lang of langs) {
    const list = realProjects(I18N, lang, PC.pcSlug);
    if (!list.length) { console.warn(`[build-projects] sem projetos em ${lang}`); continue; }
    const dir = L[lang].dir();
    fs.mkdirSync(dir, { recursive: true });

    list.forEach((p, i) => {
      const next = list[(i + 1) % list.length];
      const html = page(p, lang, next, I18N, SHELL, B);
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
