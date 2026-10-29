'use strict';

/* =========================================================
   CASE RENDER — o <main> da página individual de cada projeto.

   Uma página por projeto e por idioma (/projetos/<id>.html e
   /en/projects/<id>.html), toda montada no build: o HTML já chega
   completo pro leitor, pro Google e pros crawlers de IA. A camada
   de interação (js/project-fx.js) só realça o que já está aqui.

   Narrativa, de cima pra baixo:
     hero (o que é + link do site + lojas + autor)
     em números → o que é → o problema
     navegue pelo site (telas reais rolando com a página)
     como funciona (passos) → o que ele faz (funcionalidades)
     telas do projeto (galeria) → resultado
     quem construiu (Bernardo) → outros projetos

   Sem stack na página (a pedido): o foco é entender o produto.
   Imagens vêm de img/projects/<id>/ (scripts de captura):
     scroll.webp / mscroll.webp  faixas roláveis desktop / celular
     desk-N.webp (+ -800)        telas de computador
     mob-N.webp                  telas de celular
     extra-*.webp                imagens extras que o autor quiser
   ========================================================= */

const fs = require('fs');
const path = require('path');

const UI = {
  pt: {
    crumbHome: 'Início', crumbList: 'Projetos',
    visit: 'Visitar o site', newTab: 'abre em nova aba',
    fType: 'Tipo', fYear: 'Ano', fStatus: 'Status', fRole: 'Meu papel', fSite: 'Site',
    apps: 'Baixe o app', seeApps: 'Ver os aplicativos', marketing: 'Na vitrine das lojas',
    playAlt: 'Disponível no Google Play', storeAlt: 'Baixar na App Store',
    by: 'Projeto desenvolvido por',
    facts: 'Ficha do projeto',
    whatIs: 'O que é', problem: 'O problema',
    preview: 'Navegue pelo site',
    live: 'Veja o site ao vivo',
    liveHint: 'É o site real, na versão mais recente: role e clique dentro das janelas.',
    liveLoad: 'Carregando o site…',
    previewHint: 'Role a página: as telas andam junto com você.',
    how: 'Como funciona',
    features: 'O que ele faz', more: 'Ver detalhes',
    gallery: 'Telas do projeto', desktop: 'Computador', mobile: 'Celular',
    prev: 'Anterior', next: 'Próxima', close: 'Fechar', zoom: 'Ampliar',
    screen: 'Tela', of: 'de',
    result: 'Resultado',
    author: 'Quem construiu',
    authorRole: 'Full Stack Developer & AI Designer · Belo Horizonte, Brasil',
    authorBio: 'Construo sistemas completos, da arquitetura ao deploy em produção: SaaS, fintechs, ERPs e automações. Cada projeto deste portfólio é parte da bagagem que eu levo pro próximo.',
    authorAbout: 'Conheça minha trajetória', authorContact: 'Quer algo assim? Fale comigo',
    others: 'Outros projetos', all: 'Ver todos os projetos',
    photoAlt: (t) => `Bernardo Iannini, desenvolvedor do projeto ${t}`,
    shotAlt: (t, kind, i) => `${t}: tela ${i} no ${kind === 'mobile' ? 'celular' : 'computador'}`,
  },
  en: {
    crumbHome: 'Home', crumbList: 'Projects',
    visit: 'Visit the website', newTab: 'opens in a new tab',
    fType: 'Type', fYear: 'Year', fStatus: 'Status', fRole: 'My role', fSite: 'Website',
    apps: 'Get the app', seeApps: 'See the apps', marketing: 'In the store windows',
    playAlt: 'Get it on Google Play', storeAlt: 'Download on the App Store',
    by: 'Project built by',
    facts: 'Project facts',
    whatIs: 'What it is', problem: 'The problem',
    preview: 'Browse the website',
    live: 'See the live website',
    liveHint: 'This is the real site, latest version: scroll and click inside the windows.',
    liveLoad: 'Loading the site…',
    previewHint: 'Scroll the page: the screens move with you.',
    how: 'How it works',
    features: 'What it does', more: 'See details',
    gallery: 'Project screens', desktop: 'Desktop', mobile: 'Mobile',
    prev: 'Previous', next: 'Next', close: 'Close', zoom: 'Enlarge',
    screen: 'Screen', of: 'of',
    result: 'Result',
    author: 'Who built it',
    authorRole: 'Full Stack Developer & AI Designer · Belo Horizonte, Brazil',
    authorBio: 'I build complete systems, from architecture to production deploy: SaaS, fintech, ERPs and automation. Every project in this portfolio is part of the baggage I carry into the next one.',
    authorAbout: 'Read my story', authorContact: 'Want something like this? Get in touch',
    others: 'More projects', all: 'See all projects',
    photoAlt: (t) => `Bernardo Iannini, developer of ${t}`,
    shotAlt: (t, kind, i) => `${t}: ${kind === 'mobile' ? 'mobile' : 'desktop'} screen ${i}`,
  },
};

const ICON = {
  layersBig: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 3 8l9 5 9-5-9-5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 13l9 5 9-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" stroke="currentColor" stroke-width="1.8"/><path d="M10.5 18.3h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="m8 12.3 2.6 2.6L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  megaphone: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 10v4a1 1 0 0 0 1 1H7l7 4.5v-15L7 9H4.5a1 1 0 0 0-1 1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M17.5 9a4 4 0 0 1 0 6M7 15l1.2 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  idea: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V17h5v-1.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 2.5 20h19L12 3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.3v.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4.5" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M10 9.2v5.6l4.6-2.8L10 9.2z" fill="currentColor"/><path d="M8 20.5h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 12h17M12 3.5c2.4 2.2 3.6 5.1 3.6 8.5S14.4 18.3 12 20.5c-2.4-2.2-3.6-5.1-3.6-8.5S9.6 5.7 12 3.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  zoom: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.86V21H9z"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.14 8.96 7.49 10.41.55.1.75-.24.75-.53v-1.86c-3.04.66-3.68-1.45-3.68-1.45-.5-1.28-1.22-1.63-1.22-1.63-.99-.67.08-.66.08-.66 1.09.08 1.66 1.13 1.66 1.13.98 1.67 2.57 1.19 3.2.91.1-.71.38-1.19.69-1.46-2.43-.28-4.99-1.22-4.99-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.41.11-2.94 0 0 .92-.29 3.02 1.13A10.5 10.5 0 0 1 12 6.8c.94 0 1.88.13 2.77.38 2.1-1.42 3.02-1.13 3.02-1.13.6 1.53.22 2.66.11 2.94.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.14-5.01 5.41.39.34.73 1.02.73 2.07v3.07c0 .3.2.64.76.53 4.34-1.45 7.48-5.56 7.48-10.41C23.02 5.24 18.27.5 12 .5z"/></svg>',
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

/* título "Nome · Subtítulo" vira nome grande + subtítulo menor */
function splitTitle(title) {
  const [name, ...rest] = String(title || '').split(/\s+·\s+/);
  return { name: name.trim(), sub: rest.join(' · ').trim() };
}

/* a página não fala de stack (a pedido): frases que citam tecnologia
   saem do texto. Termos = a stack do próprio projeto + os mais comuns. */
const TECH_BASE = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'GSAP', 'ScrollTrigger', 'Lenis',
  'React', 'Next.js', 'Node', 'Prisma', 'PostgreSQL', 'MySQL', 'Docker', 'Nginx', 'Redis', 'Tailwind',
  'TailwindCSS', 'Vite', 'Supabase', 'Vercel', 'Gemini', 'requestAnimationFrame', 'Astro', 'Markdown',
  'JPEG', 'framework', 'frameworks', 'vanilla', 'ORM', 'VPS', 'AWS', 'shadcn', 'Zustand', 'Socket.io'];
/* títulos de funcionalidade que são só sobre COMO foi feito (não sobre o
   que o produto faz pra quem usa) também saem */
const TECH_TITLE = ['CDN', 'estático', 'estática', 'static', 'build', 'fallback', 'canvas', 'motion'];

function techRegex(p, extra = []) {
  const terms = [...new Set([...(p.stack || []), ...TECH_BASE, ...extra])]
    .map(t => String(t).replace(/\s+v?\d[\w.]*$/, '').trim())   // "Next.js 16" -> "Next.js"
    .filter(t => t.length > 1)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?<!\\p{L})(${terms.join('|')})(?!\\p{L})`, 'iu');
}

function isTechTopic(p, tp) {
  return techRegex(p, TECH_TITLE).test(tp.title || '');
}

function techFilter(p) {
  const re = techRegex(p);
  return (txt) => String(txt || '')
    .split(/(?<=[.!?])\s+/)
    .filter(sentence => !re.test(sentence))
    .join(' ')
    .trim();
}

function paragraphs(text, max, clean) {
  return String(text || '').split(/\n\s*\n/)
    .map(s => (clean ? clean(s) : s).trim()).filter(Boolean).slice(0, max);
}

/* largura x altura de um .webp lendo só o cabeçalho (VP8 / VP8L / VP8X),
   pra o HTML declarar a proporção real e não pular layout ao carregar */
function webpSize(file) {
  try {
    const b = fs.readFileSync(file);
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (kind === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  } catch { /* sem arquivo: quem chama usa o padrão */ }
  return null;
}

/* imagens disponíveis do projeto (o build olha o disco: soltou o arquivo
   na pasta, ele aparece na página) */
function projectMedia(root, id) {
  const dir = path.join(root, 'img', 'projects', id);
  const has = (f) => fs.existsSync(path.join(dir, f));
  const v = (f) => {
    try { return '?v=' + Math.round(fs.statSync(path.join(dir, f)).mtimeMs).toString(36); }
    catch { return ''; }
  };
  const url = (f) => `/img/projects/${id}/${f}${v(f)}`;
  const list = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const desk = list.filter(f => /^desk-\d+\.webp$/.test(f)).sort()
    .map(f => ({ kind: 'desktop', src: url(f), small: has(f.replace('.webp', '-800.webp')) ? url(f.replace('.webp', '-800.webp')) : '', w: 1280, h: 800 }));
  const extra = list.filter(f => /^extra-[\w-]+\.(webp|avif|jpg|png)$/.test(f)).sort()
    .map(f => ({ kind: 'desktop', src: url(f), small: '', w: 1280, h: 800 }));
  const mob = list.filter(f => /^mob-\d+\.webp$/.test(f)).sort()
    .map(f => ({ kind: 'mobile', src: url(f), small: '', w: 780, h: 1688 }));
  return {
    scroll: has('scroll.webp') ? url('scroll.webp') : '',
    mscroll: has('mscroll.webp') ? url('mscroll.webp') : '',
    scrollSize: webpSize(path.join(dir, 'scroll.webp')) || { w: 960, h: 3600 },
    mscrollSize: webpSize(path.join(dir, 'mscroll.webp')) || { w: 520, h: 7880 },
    desktop: [...desk, ...extra],
    mobile: mob,
  };
}

function storeBadges(p, lang, u) {
  const apps = (p.apps && !Array.isArray(p.apps)) ? p.apps : {};
  const out = [];
  if (apps.android) {
    out.push(`<a class="cs-store" href="${esc(apps.android)}" target="_blank" rel="noopener noreferrer">` +
      `<img src="/img/badges/google-play-${lang === 'pt' ? 'pt' : 'en'}.png" alt="${esc(u.playAlt)}" width="646" height="250" class="cs-store__play"></a>`);
  }
  if (apps.ios) {
    out.push(`<a class="cs-store" href="${esc(apps.ios)}" target="_blank" rel="noopener noreferrer">` +
      `<img src="/img/badges/app-store.svg" alt="${esc(u.storeAlt)}" width="120" height="40" class="cs-store__apple"></a>`);
  }
  if (!out.length) return '';
  return `<div class="cs-stores" aria-label="${esc(u.apps)}">${out.join('')}</div>`;
}

function appBadges(app, lang, u) {
  const out = [];
  if (app.ios) out.push(`<a class="cs-store" href="${esc(app.ios)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(app.name)}: ${esc(u.storeAlt)}">` +
    `<img src="/img/badges/app-store.svg" alt="${esc(u.storeAlt)}" width="120" height="40" class="cs-store__apple"></a>`);
  if (app.android) out.push(`<a class="cs-store" href="${esc(app.android)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(app.name)}: ${esc(u.playAlt)}">` +
    `<img src="/img/badges/google-play-${lang === 'pt' ? 'pt' : 'en'}.png" alt="${esc(u.playAlt)}" width="646" height="250" class="cs-store__play"></a>`);
  return out.length ? `<div class="cs-stores">${out.join('')}</div>` : '';
}

const tx = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[lang] || v.pt || '') : (v || '');

function shotFigure(item, i, total, title, u) {
  const alt = u.shotAlt(title, item.kind, i + 1);
  const srcset = item.small ? ` srcset="${item.small} 800w, ${item.src} 1280w" sizes="(max-width: 700px) 86vw, 640px"` : '';
  return `<li class="cs-gal__item cs-gal__item--${item.kind}">
            <button type="button" class="cs-gal__btn" data-cs-zoom="${item.src}" aria-label="${esc(u.zoom)}: ${esc(alt)}">
              <img src="${item.small || item.src}"${srcset} alt="${esc(alt)}" width="${item.w}" height="${item.h}" loading="lazy" decoding="async">
              <span class="cs-gal__zoom" aria-hidden="true">${ICON.zoom}</span>
            </button>
          </li>`;
}

/* ---------------------------------------------------------------
   MAIN
   --------------------------------------------------------------- */
function renderCaseMain(o) {
  const { p, lang, t, others, root, PC_ICONS, coverSet, asset, hostname, answer } = o;
  const cfg = o.cfg || {};
  const u = UI[lang];
  const { name, sub } = splitTitle(p.title);
  const host = hostname(p.link);
  const media = projectMedia(root, p.id);
  const metrics = (p.metrics || []).slice(0, 4);
  const clean = techFilter(p);
  const prob = (p.story && p.story.problem) || null;
  const whatIs = paragraphs(p.longDesc, 2, clean);
  const problem = prob ? paragraphs(prob.text, 2, clean) : [];
  const steps = (p.flow && p.flow.steps) || [];
  const topics = (p.topics || [])
    .filter(tp => !isTechTopic(p, tp))
    .map(tp => ({
      ...tp,
      text: clean(tp.text),
      deep: (tp.deep || []).map(clean).filter(Boolean),
    }))
    .filter(tp => tp.text && tp.text.length >= 60);   // sobrou frase solta: o card sai
  const impact = clean((p.impact && p.impact.text) || '');
  const coverSrc = asset(p.cover);
  const reg = [p.status, p.year, p.role].filter(Boolean).map(esc);

  const sec = [];

  /* ---- breadcrumb visível (mesma trilha do JSON-LD) ---- */
  sec.push(`
    <nav class="cs-crumbs" aria-label="Breadcrumb">
      <a href="${t.home}">${u.crumbHome}</a><span aria-hidden="true">/</span>
      <a href="${t.list}">${u.crumbList}</a><span aria-hidden="true">/</span>
      <span aria-current="page">${esc(name)}</span>
    </nav>`);

  /* ---- hero ---- */
  sec.push(`
    <section class="cs-hero" aria-labelledby="csTitle">
      <div class="cs-hero__text">
        ${reg.length ? `<p class="cs-reg">${p.status ? '<i class="cs-reg__dot" aria-hidden="true"></i>' : ''}${reg.join('<span aria-hidden="true">·</span>')}</p>` : ''}
        <h1 class="cs-title${name.length > 12 ? ' cs-title--long' : ''}" id="csTitle">${esc(name)}${sub ? `<span class="cs-title__sub">${esc(sub)}</span>` : ''}</h1>
        <p class="cs-lead">${esc(p.desc || answer)}</p>
        <div class="cs-actions">
          ${p.link ? `<a class="cs-visit" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">
            <span class="cs-visit__icon" aria-hidden="true">${ICON.globe}</span>
            <span class="cs-visit__text"><b>${u.visit}</b><span>${esc(host)}</span></span>
            <span class="cs-visit__arrow" aria-hidden="true">${ICON.arrow}</span>
            <span class="sr-only">(${u.newTab})</span>
          </a>` : ''}
          ${storeBadges(p, lang, u)}
          ${Array.isArray(cfg.apps) && cfg.apps.length ? `<a class="cs-pill" href="#apps">${ICON.phone}${u.seeApps}</a>` : ''}
        </div>
        <p class="cs-by">${u.by} <a href="${t.about}" rel="author">Bernardo Iannini</a></p>
      </div>
      <figure class="cs-hero__media">
        ${p.link ? `<a class="cs-win cs-win--link" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer" aria-label="${u.visit}: ${esc(host)}">` : '<div class="cs-win">'}
          <div class="cs-win__bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host)}</span></div>
          <picture>
            <source type="image/avif" srcset="${coverSet('avif')}" sizes="(max-width: 900px) 92vw, 46vw">
            <img class="cs-win__img" src="${coverSrc}" srcset="${coverSet('webp')}" sizes="(max-width: 900px) 92vw, 46vw"
                 alt="${esc(p.title)}" width="1600" height="900" fetchpriority="high" decoding="async">
          </picture>
          ${p.link ? `<span class="cs-win__go" aria-hidden="true">${u.visit} ${ICON.arrow}</span>` : ''}
        ${p.link ? '</a>' : '</div>'}
      </figure>
    </section>`);

  /* ---- o que é: painel com fundo geometrico + ficha do projeto ----
     texto proprio do data/cases.json (whatIs) quando existir; senao o
     longDesc filtrado. A ficha usa so fatos ja cadastrados. */
  const ownWhat = cfg.whatIs && tx(cfg.whatIs, lang);
  const whatParas = ownWhat ? ownWhat.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean) : whatIs;
  const CAT = { pt: { system: 'Plataforma web', site: 'Site', personal: 'Projeto pessoal', automation: 'Automação' },
                en: { system: 'Web platform', site: 'Website', personal: 'Personal project', automation: 'Automation' } };
  const facts = [
    [u.fType, CAT[lang][p.category] || ''],
    [u.fYear, p.year],
    [u.fStatus, p.status],
    [u.fRole, p.role],
  ].filter(([, v]) => v);
  const deco = `<svg class="cs-deco" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
      <defs><pattern id="csDots-${p.id}" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3"/></pattern></defs>
      <rect class="cs-deco__dots" width="600" height="600" fill="url(#csDots-${p.id})"/>
      <circle class="cs-deco__ring" cx="470" cy="150" r="200"/><circle class="cs-deco__ring" cx="470" cy="150" r="140"/>
      <circle class="cs-deco__ring" cx="470" cy="150" r="80"/><circle class="cs-deco__dot" cx="470" cy="150" r="7"/>
      <path class="cs-deco__line" d="M0 470 L600 250"/><path class="cs-deco__line" d="M0 540 L600 320"/>
      <rect class="cs-deco__sq" x="70" y="80" width="64" height="64" rx="10"/>
    </svg>`;
  if (whatParas.length) {
    sec.push(`
    <section class="cs-about" aria-labelledby="csWhat" data-reveal>
      ${deco}
      <div class="cs-about__main">
        <h2 class="cs-h2" id="csWhat"><span class="cs-h2__icon">${ICON.idea}</span>${u.whatIs}</h2>
        <p class="cs-about__lead">${esc(whatParas[0])}</p>
        ${whatParas.slice(1, 3).map(x => `<p>${esc(x)}</p>`).join('')}
      </div>
      <aside class="cs-about__facts" aria-label="${u.facts}">
        ${facts.map(([k, v]) => `<div class="cs-fact2"><span class="cs-fact2__k">${k}</span><span class="cs-fact2__v">${esc(v)}</span></div>`).join('')}
        ${p.link ? `<a class="cs-fact2 cs-fact2--link" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer"><span class="cs-fact2__k">${u.fSite}</span><span class="cs-fact2__v">${esc(host)} ${ICON.arrow}</span></a>` : ''}
      </aside>
    </section>`);
  }

  /* ---- o problema: so nos projetos que resolvem um problema real
     (sistemas). Site de vitrine nao tem esse bloco. ---- */
  if (problem.length) {
    sec.push(`
    <section class="cs-about cs-about--problem" aria-labelledby="csProblem" data-reveal>
      <div class="cs-about__main">
        <h2 class="cs-h2" id="csProblem"><span class="cs-h2__icon cs-h2__icon--warn">${ICON.alert}</span>${u.problem}</h2>
        <p class="cs-about__lead">${esc(problem[0])}</p>
        ${problem.slice(1, 2).map(x => `<p>${esc(x)}</p>`).join('')}
      </div>
    </section>`);
  }

  /* ---- frentes do produto (estilo dos apps do Moeda Nobre) ---- */
  if (cfg.pillars && Array.isArray(cfg.pillars.items)) {
    sec.push(`
    <section class="cs-pillars" aria-labelledby="csPillars">
      <h2 class="cs-h2" id="csPillars" data-reveal><span class="cs-h2__icon">${ICON.layersBig}</span>${esc(tx(cfg.pillars.title, lang))}</h2>
      <div class="cs-pillars__grid" style="--n:${cfg.pillars.items.length}">
        ${cfg.pillars.items.map((it, i) => `<article class="cs-pillar" data-reveal style="--i:${i}">
          <span class="cs-pillar__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="cs-pillar__icon" aria-hidden="true">${PC_ICONS[it.icon] || PC_ICONS.layers}</span>
          <h3 class="cs-pillar__name">${esc(tx(it.name, lang))}</h3>
          <p class="cs-pillar__desc">${esc(tx(it.desc, lang))}</p>
        </article>`).join('')}
      </div>
    </section>`);
  }

  /* ---- aplicativos (cada um com icone, cor, o que faz, lojas e telas) ---- */
  if (Array.isArray(cfg.apps) && cfg.apps.length) {
    sec.push(`
    <section class="cs-apps" id="apps" aria-labelledby="csApps">
      <div class="cs-apps__head" data-reveal>
        <h2 class="cs-h2" id="csApps"><span class="cs-h2__icon">${ICON.phone}</span>${esc(tx(cfg.appsTitle, lang) || u.apps)}</h2>
        ${cfg.appsLead ? `<p class="cs-apps__lead">${esc(tx(cfg.appsLead, lang))}</p>` : ''}
      </div>
      ${cfg.apps.map(app => `
      <article class="cs-app" style="--app:${esc(app.color || '#22c55e')}" data-reveal>
        <div class="cs-app__info">
          <div class="cs-app__id">
            <img class="cs-app__icon" src="/img/projects/${p.id}/${app.icon}" alt="" width="96" height="96" loading="lazy" decoding="async">
            <div>
              <h3 class="cs-app__name">${esc(app.name)}</h3>
              <p class="cs-app__who">${esc(tx(app.who, lang))}</p>
            </div>
          </div>
          <p class="cs-app__desc">${esc(tx(app.desc, lang))}</p>
          <ul class="cs-app__feats">${(tx(app.features, lang) || []).map(ft => `<li>${ICON.check}<span>${esc(ft)}</span></li>`).join('')}</ul>
          ${appBadges(app, lang, u)}
        </div>
        <ul class="cs-app__screens" tabindex="0" aria-label="${esc(app.name)}: ${u.mobile}">
          ${(app.screens || []).map((sc, i) => `<li><button type="button" class="cs-app__shot" data-cs-zoom="/img/projects/${p.id}/${sc}" aria-label="${u.zoom}: ${esc(app.name)} ${i + 1}"><img src="/img/projects/${p.id}/${sc}" alt="${esc(app.name)}: ${u.screen} ${i + 1}" width="600" height="1300" loading="lazy" decoding="async"></button></li>`).join('')}
        </ul>
      </article>`).join('')}
    </section>`);
  }

  /* ---- marketing (pecas publicadas) ---- */
  if (Array.isArray(cfg.marketing) && cfg.marketing.length) {
    const [first, ...rest] = cfg.marketing;
    const fig = (m, cls) => `<figure class="cs-mkt__item ${cls}"><button type="button" class="cs-mkt__btn" data-cs-zoom="/img/projects/${p.id}/${m.src}" aria-label="${u.zoom}: ${esc(tx(m.alt, lang))}"><img src="/img/projects/${p.id}/${m.src}" alt="${esc(tx(m.alt, lang))}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async"></button></figure>`;
    sec.push(`
    <section class="cs-mkt" aria-labelledby="csMkt" data-cs-gallery>
      <h2 class="cs-h2" id="csMkt" data-reveal><span class="cs-h2__icon">${ICON.megaphone}</span>${u.marketing}</h2>
      <div class="cs-mkt__grid" data-cs-panel="mkt">
        ${fig(first, 'cs-mkt__item--wide')}
        ${rest.map(m => fig(m, '')).join('')}
      </div>
      <dialog class="cs-lightbox" data-cs-lightbox aria-label="${u.marketing}">
        <button type="button" class="cs-lightbox__close" data-cs-close aria-label="${u.close}">${ICON.close}</button>
        <button type="button" class="cs-lightbox__arrow cs-lightbox__arrow--prev" data-cs-lprev aria-label="${u.prev}">${ICON.chevL}</button>
        <img alt="" data-cs-limg>
        <button type="button" class="cs-lightbox__arrow cs-lightbox__arrow--next" data-cs-lnext aria-label="${u.next}">${ICON.chevR}</button>
      </dialog>
    </section>`);
  }

  /* ---- o site AO VIVO: o proprio site carregado nas janelas (so quando
     ele permite ser embutido). Interativo, sempre a versao mais recente,
     com rolagem, efeitos e videos de verdade. Carrega ao se aproximar. ---- */
  if (cfg.embed && p.link) {
    sec.push(`
    <section class="cs-live" data-cs-live aria-labelledby="csLive">
      <div class="cs-tour__head" data-reveal>
        <h2 class="cs-h2" id="csLive"><span class="cs-h2__icon">${ICON.play}</span>${u.live}</h2>
        <p class="cs-tour__hint">${u.liveHint}</p>
      </div>
      <div class="cs-live__stage">
        <div class="cs-live__desk cs-win">
          <div class="cs-win__bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host)}</span></div>
          <div class="cs-live__vp" data-cs-vp="1440">
            <img class="cs-live__poster" src="${coverSrc}" alt="" width="1600" height="900" loading="lazy" decoding="async">
            <span class="cs-live__load">${u.liveLoad}</span>
            <iframe data-src="${esc(p.link)}" title="${esc(name)} · ${u.desktop}" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" tabindex="0"></iframe>
          </div>
        </div>
        <div class="cs-live__phone">
          <div class="cs-tour__notch" aria-hidden="true"></div>
          <div class="cs-live__vp" data-cs-vp="390">
            <span class="cs-live__load">${u.liveLoad}</span>
            <iframe data-src="${esc(p.link)}" title="${esc(name)} · ${u.mobile}" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" tabindex="0"></iframe>
          </div>
        </div>
      </div>
    </section>`);
  } else if (cfg.tour !== false && (media.scroll || media.mscroll)) {
    sec.push(`
    <section class="cs-tour" data-cs-tour aria-labelledby="csTour">
      <div class="cs-tour__sticky">
        <div class="cs-tour__head">
          <h2 class="cs-h2" id="csTour">${u.preview}</h2>
          <p class="cs-tour__hint">${u.previewHint}</p>
        </div>
        <div class="cs-tour__stage">
          ${media.scroll ? `<div class="cs-tour__desk cs-win">
            <div class="cs-win__bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host)}</span></div>
            <div class="cs-tour__view"><img data-cs-pan src="${media.scroll}" alt="${esc(u.shotAlt(name, 'desktop', 1))}" width="${media.scrollSize.w}" height="${media.scrollSize.h}" loading="lazy" decoding="async"></div>
          </div>` : ''}
          ${media.mscroll ? `<div class="cs-tour__phone" aria-hidden="${media.scroll ? 'true' : 'false'}">
            <div class="cs-tour__notch"></div>
            <div class="cs-tour__view"><img data-cs-pan src="${media.mscroll}" alt="${esc(u.shotAlt(name, 'mobile', 1))}" width="${media.mscrollSize.w}" height="${media.mscrollSize.h}" loading="lazy" decoding="async"></div>
          </div>` : ''}
        </div>
      </div>
    </section>`);
  }

  /* ---- como funciona ---- */
  if (steps.length >= 2) {
    sec.push(`
    <section class="cs-how" aria-labelledby="csHow">
      <h2 class="cs-h2" id="csHow" data-reveal>${u.how}</h2>
      <ol class="cs-steps" data-cs-steps style="--n:${steps.length}">
        ${steps.map((s, i) => `<li class="cs-step" style="--i:${i}">
          <span class="cs-step__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="cs-step__label">${s.label}</span>
          ${s.sub ? `<span class="cs-step__sub">${s.sub}</span>` : ''}
        </li>`).join('')}
      </ol>
    </section>`);
  }

  /* ---- o que ele faz ---- */
  if (topics.length) {
    sec.push(`
    <section class="cs-features" aria-labelledby="csFeat">
      <h2 class="cs-h2" id="csFeat" data-reveal>${u.features}</h2>
      <div class="cs-feat-grid">
        ${topics.map((tp, i) => `<article class="cs-feat" data-reveal style="--i:${i}">
          <span class="cs-feat__icon" aria-hidden="true">${PC_ICONS[tp.icon] || PC_ICONS.layers}</span>
          <h3 class="cs-feat__title">${tp.title}</h3>
          <p class="cs-feat__text">${tp.text}</p>
          ${(tp.deep && tp.deep.length) ? `<details class="cs-feat__more"><summary>${u.more}</summary><ul>${tp.deep.map(l => `<li>${l}</li>`).join('')}</ul></details>` : ''}
        </article>`).join('')}
      </div>
    </section>`);
  }

  /* ---- galeria ---- */
  const kinds = cfg.gallery === false ? [] : [['desktop', media.desktop], ['mobile', media.mobile]].filter(([, l]) => l.length);
  if (kinds.length) {
    sec.push(`
    <section class="cs-gallery" aria-labelledby="csGal" data-cs-gallery>
      <div class="cs-gallery__head" data-reveal>
        <h2 class="cs-h2" id="csGal">${u.gallery}</h2>
        ${kinds.length > 1 ? `<div class="cs-tabs" role="tablist" aria-label="${u.gallery}">
          ${kinds.map(([k], i) => `<button type="button" role="tab" class="cs-tab" id="csTab-${k}" aria-controls="csPanel-${k}" aria-selected="${i === 0}" data-cs-tab="${k}">${u[k]}</button>`).join('')}
        </div>` : ''}
      </div>
      ${kinds.map(([k, list], i) => `<div class="cs-gal" id="csPanel-${k}" role="${kinds.length > 1 ? 'tabpanel' : 'group'}"${kinds.length > 1 ? ` aria-labelledby="csTab-${k}"` : ''}${i ? ' hidden' : ''} data-cs-panel="${k}">
        <ul class="cs-gal__track" data-cs-track tabindex="0" aria-label="${u.gallery}: ${u[k]}">
          ${list.map((it, j) => shotFigure(it, j, list.length, name, u)).join('')}
        </ul>
        <div class="cs-gal__nav">
          <button type="button" class="cs-gal__arrow" data-cs-prev aria-label="${u.prev}">${ICON.chevL}</button>
          <button type="button" class="cs-gal__arrow" data-cs-next aria-label="${u.next}">${ICON.chevR}</button>
        </div>
      </div>`).join('')}
      <dialog class="cs-lightbox" data-cs-lightbox aria-label="${u.gallery}">
        <button type="button" class="cs-lightbox__close" data-cs-close aria-label="${u.close}">${ICON.close}</button>
        <button type="button" class="cs-lightbox__arrow cs-lightbox__arrow--prev" data-cs-lprev aria-label="${u.prev}">${ICON.chevL}</button>
        <img alt="" data-cs-limg>
        <button type="button" class="cs-lightbox__arrow cs-lightbox__arrow--next" data-cs-lnext aria-label="${u.next}">${ICON.chevR}</button>
      </dialog>
    </section>`);
  }

  /* ---- resultado ---- */
  if (impact) {
    sec.push(`
    <section class="cs-result" data-reveal aria-labelledby="csResult">
      <h2 class="cs-h2" id="csResult">${u.result}</h2>
      <p>${esc(impact)}</p>
    </section>`);
  }

  /* ---- quem construiu: a assinatura do Bernardo em cada projeto ---- */
  sec.push(`
    <section class="cs-author" data-reveal aria-labelledby="csAuthor">
      <img class="cs-author__photo" src="/img/eufoto1.webp" alt="${esc(u.photoAlt(name))}" width="584" height="583" loading="lazy" decoding="async">
      <div class="cs-author__body">
        <h2 class="cs-author__kicker" id="csAuthor">${u.author}</h2>
        <p class="cs-author__name"><a href="${t.about}" rel="author">Bernardo Iannini</a></p>
        <p class="cs-author__role">${u.authorRole}</p>
        <p class="cs-author__bio">${u.authorBio}</p>
        <div class="cs-author__links">
          <a class="cs-pill cs-pill--solid" href="${t.home}#contato">${u.authorContact}<span aria-hidden="true">${ICON.arrow}</span></a>
          <a class="cs-pill" href="${t.about}">${u.authorAbout}</a>
          <a class="cs-icon" href="https://www.linkedin.com/in/bernardo-iannini" target="_blank" rel="me noopener noreferrer" aria-label="LinkedIn">${ICON.linkedin}</a>
          <a class="cs-icon" href="https://github.com/iannini25" target="_blank" rel="me noopener noreferrer" aria-label="GitHub">${ICON.github}</a>
        </div>
      </div>
    </section>`);

  /* ---- outros projetos (links internos) ---- */
  if (others.length) {
    sec.push(`
    <nav class="cs-others" aria-labelledby="csOthers">
      <div class="cs-others__head">
        <h2 class="cs-h2" id="csOthers">${u.others}</h2>
        <a class="cs-others__all" href="${t.list}">${u.all}<span aria-hidden="true">${ICON.arrow}</span></a>
      </div>
      <ul class="cs-others__list">
        ${others.map(op => {
          const s = splitTitle(op.title);
          return `<li><a class="cs-other" href="${t.url(op.id)}">
            <span class="cs-other__img"><img src="${asset(op.cover)}" srcset="${o.coverSetFor(op, 'webp')}" sizes="(max-width: 700px) 90vw, 30vw" alt="" width="1600" height="900" loading="lazy" decoding="async"></span>
            <span class="cs-other__name">${esc(s.name)}</span>
            ${s.sub ? `<span class="cs-other__sub">${esc(s.sub)}</span>` : ''}
          </a></li>`;
        }).join('')}
      </ul>
    </nav>`);
  }

  return `<main id="pcMain" class="cs" data-pc-root>
${sec.join('\n')}
  </main>`;
}

module.exports = { renderCaseMain, projectMedia, splitTitle, techFilter, TECH_BASE, UI };
