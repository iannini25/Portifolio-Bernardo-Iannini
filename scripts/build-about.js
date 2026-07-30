#!/usr/bin/env node
'use strict';

/* =========================================================
   build-about.js
   ---------------------------------------------------------
   Gera a ENTITY HOME (Fase 3) em HTML estatico:

     pt  ->  /sobre.html
     en  ->  /en/about.html

   POR QUE ESTA PAGINA EXISTE
   O texto mais valioso do site (a bio de 173 palavras escrita
   pelo autor) so existia dentro do I18N, injetado por JS num
   terminal com efeito de digitacao. Crawler de IA nao executa
   JS, entao a identidade da pessoa era invisivel.
   Pre-renderizar aquele terminal no index.html brigaria com a
   animacao e com o layout. Aqui o mesmo conteudo vira prosa
   estatica, numa pagina NOVA (risco visual zero), que e
   exatamente onde o schema manda a identidade morar.

   FONTE DA VERDADE: js/language.js (I18N). Nada e inventado:
   bio, experiencia, formacao e servicos saem de la.
   ========================================================= */

const fs   = require('fs');
const path = require('path');
const { loadI18N, SITE_URL, PERSON } = require('./build-projects.js');

const ROOT = path.resolve(__dirname, '..');
const SITE = SITE_URL + '/#site';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/* ---------- dados canonicos (confirmados com o autor) ---------- */
const AUTHOR = {
  name: 'Bernardo Iannini',
  alternateName: 'Bernardo Araujo Iannini',
  jobTitle: 'Full Stack Developer & AI Designer',
  email: 'bernardo.iannini14@gmail.com',
  image: SITE_URL + '/img/eufoto1.png',
  sameAs: [
    'https://www.linkedin.com/in/bernardo-iannini',
    'https://github.com/iannini25',
  ],
  worksFor: 'Inspire4U',
  alumniOf: 'COTEMIG',
  locality: 'Belo Horizonte', region: 'MG', country: 'BR',
  knowsAbout: [
    'Plataformas SaaS multi-tenant',
    'Sistemas ERP',
    'Plataformas fintech e moeda social digital',
    'Integração de IA em produto',
    'Recuperação de projetos gerados por IA',
    'Migração e operação de infraestrutura (AWS e VPS)',
  ],
};

/* bio aprovada pelo autor, por idioma */
const BIO = {
  pt: 'Sou desenvolvedor Full Stack e construo sistemas completos, da arquitetura ao deploy em produção, principalmente para SaaS, fintechs e automações. Antes do código eu vim da edição de vídeo e do motion design, e esse olhar ainda molda a forma como penso interface e produto. Também pego projetos que nasceram de IA, refaço a arquitetura por baixo e entrego algo que aguenta uso real.',
  en: "I'm a full stack developer building complete systems, from architecture to production deploy, mostly for SaaS, fintech and automation. Before code I came from video editing and motion design, and that eye still shapes how I think about interface and product. I also take on projects born from AI, rebuild the architecture underneath, and ship something that holds up in real use.",
};

const T = {
  pt: {
    file: 'sobre.html', url: '/sobre.html', htmlLang: 'pt-BR', locale: 'pt_BR',
    title: 'Sobre Bernardo Iannini · Desenvolvedor Full Stack em Belo Horizonte',
    h1: 'Sobre Bernardo Iannini',
    navHome: 'Início', navWork: 'Trabalhos', navBlog: 'Blog', navContact: 'Contato',
    sTrajetoria: 'A trajetória', sEsp: 'Especialidades', sExp: 'Experiência',
    sForm: 'Formação', sCursos: 'Cursos e certificações', sPerfis: 'Perfis',
    sFaq: 'Perguntas frequentes', crumbHome: 'Início', crumbAbout: 'Sobre',
    present: 'atual',
  },
  en: {
    file: path.join('en', 'about.html'), url: '/en/about.html', htmlLang: 'en', locale: 'en_US',
    title: 'About Bernardo Iannini · Full Stack Developer in Belo Horizonte',
    h1: 'About Bernardo Iannini',
    navHome: 'Home', navWork: 'Work', navBlog: 'Blog', navContact: 'Contact',
    sTrajetoria: 'The path', sEsp: 'Specialties', sExp: 'Experience',
    sForm: 'Education', sCursos: 'Courses and certifications', sPerfis: 'Profiles',
    sFaq: 'Frequently asked questions', crumbHome: 'Home', crumbAbout: 'About',
    present: 'present',
  },
};

/* pega a bio longa que o autor escreveu (o bloco de saida do terminal) */
function longBio(I18N, lang) {
  const blocks = (I18N[lang] && I18N[lang].about && I18N[lang].about.terminal) || [];
  const out = blocks.filter(b => b.type === 'out' && String(b.text || '').length > 200);
  return out.length ? String(out[0].text) : '';
}

const paras = (text) => String(text || '')
  .split(/\n\s*\n/).map(t => t.trim()).filter(Boolean)
  .map(t => `<p>${esc(t).replace(/\n/g, '<br/>')}</p>`).join('\n        ');

/* data legivel + <time datetime> (o brief exige datetime em toda data) */
function period(e, t) {
  const fmt = (d) => {
    if (!d) return null;
    const y = d.year, m = d.month;
    return { label: [m, y].filter(Boolean).join(' '), dt: y ? String(y) : null };
  };
  const a = fmt(e.start), b = fmt(e.end);
  const left  = a ? `<time datetime="${esc(a.dt || '')}">${esc(a.label)}</time>` : '';
  const right = b ? `<time datetime="${esc(b.dt || '')}">${esc(b.label)}</time>` : esc(t.present);
  return [left, right].filter(Boolean).join(' – ');
}

function entry(e, t) {
  const bullets = (e.bullets || []).map(b => `<li>${esc(b)}</li>`).join('\n            ');
  const skills = (e.skills || []).map(s => `<li>${esc(s)}</li>`).join('');
  return `<article class="ab-entry">
          <h3>${esc(e.title)}</h3>
          <p class="ab-entry__meta">${[e.org, e.role, e.loc].filter(Boolean).map(esc).join(' · ')} · ${period(e, t)}</p>
          ${bullets ? `<ul class="ab-entry__bullets">\n            ${bullets}\n          </ul>` : ''}
          ${skills ? `<ul class="ab-entry__skills">${skills}</ul>` : ''}
        </article>`;
}

/* FAQ: perguntas reais, respostas SO com fato que ja existe no site.
   O schema FAQPage espelha exatamente o texto visivel (exigencia do brief). */
function faq(lang, bio) {
  const loc = 'Belo Horizonte, MG, Brasil';
  return lang === 'en' ? [
    { q: 'Who is Bernardo Iannini?',
      a: BIO.en },
    { q: 'What does he work with?',
      a: 'Multi-tenant SaaS platforms, ERP systems, fintech and digital social currency platforms, AI integration in product, recovery of AI-generated projects, and infrastructure migration and operation (AWS and VPS).' },
    { q: 'Where is he based?',
      a: `He is based in ${loc}, and works remotely for clients in Brazil and Ireland.` },
    { q: 'How can I get in touch?',
      a: `By email at ${AUTHOR.email}, on LinkedIn at linkedin.com/in/bernardo-iannini, or on GitHub at github.com/iannini25.` },
  ] : [
    { q: 'Quem é Bernardo Iannini?',
      a: BIO.pt },
    { q: 'Com o que ele trabalha?',
      a: 'Plataformas SaaS multi-tenant, sistemas ERP, plataformas fintech e de moeda social digital, integração de IA em produto, recuperação de projetos gerados por IA, e migração e operação de infraestrutura (AWS e VPS).' },
    { q: 'Onde ele está?',
      a: `Ele fica em ${loc}, e atende remotamente clientes no Brasil e na Irlanda.` },
    { q: 'Como entrar em contato?',
      a: `Pelo e-mail ${AUTHOR.email}, pelo LinkedIn em linkedin.com/in/bernardo-iannini, ou pelo GitHub em github.com/iannini25.` },
  ];
}

/* ---------- @graph: Person + WebSite + ProfilePage + Breadcrumb + FAQ ---------- */
function graph(lang, t, faqs) {
  const person = {
    '@type': 'Person',
    '@id': PERSON,                          // @id ESTAVEL, reusado no site inteiro
    name: AUTHOR.name,
    alternateName: AUTHOR.alternateName,
    url: SITE_URL + '/',
    mainEntityOfPage: { '@id': SITE_URL + t.url + '#pagina' },
    image: { '@type': 'ImageObject', url: AUTHOR.image, caption: AUTHOR.name },
    jobTitle: AUTHOR.jobTitle,
    description: BIO[lang],
    knowsAbout: AUTHOR.knowsAbout,
    knowsLanguage: ['pt-BR', 'en'],
    email: 'mailto:' + AUTHOR.email,
    homeLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: AUTHOR.locality, addressRegion: AUTHOR.region, addressCountry: AUTHOR.country },
    },
    worksFor: { '@type': 'Organization', name: AUTHOR.worksFor },
    alumniOf: { '@type': 'EducationalOrganization', name: AUTHOR.alumniOf },
    sameAs: AUTHOR.sameAs,
  };
  const site = {
    '@type': 'WebSite',
    '@id': SITE,
    url: SITE_URL + '/',
    name: AUTHOR.name,
    inLanguage: t.htmlLang,
    publisher: { '@id': PERSON },           // sempre por referencia
  };
  const profile = {
    '@type': 'ProfilePage',
    '@id': SITE_URL + t.url + '#pagina',
    url: SITE_URL + t.url,
    name: t.title,
    inLanguage: t.htmlLang,
    about: { '@id': PERSON },
    isPartOf: { '@id': SITE },
    primaryImageOfPage: { '@type': 'ImageObject', url: AUTHOR.image },
  };
  const crumbs = {
    '@type': 'BreadcrumbList',
    '@id': SITE_URL + t.url + '#breadcrumb',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.crumbHome, item: SITE_URL + (lang === 'en' ? '/en/' : '/') },
      { '@type': 'ListItem', position: 2, name: t.crumbAbout, item: SITE_URL + t.url },
    ],
  };
  const faqPage = {
    '@type': 'FAQPage',
    '@id': SITE_URL + t.url + '#faq',
    mainEntity: faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [person, site, profile, crumbs, faqPage] }, null, 2);
}

/* ---------- pagina ---------- */
function page(I18N, lang) {
  const t = T[lang];
  const bio = longBio(I18N, lang) || BIO[lang];
  const xp = (I18N[lang].xp && I18N[lang].xp.timeline) || {};
  const services = (I18N[lang].services && I18N[lang].services.list) || [];
  const faqs = faq(lang, bio);
  const altUrl = lang === 'en' ? T.pt.url : T.en.url;

  const esp = AUTHOR.knowsAbout.map(k => `<li>${esc(k)}</li>`).join('\n          ');
  const svc = services.map(s => `<li><strong>${esc(s.title)}</strong> ${esc(s.desc)}</li>`).join('\n          ');
  const prof = (xp.prof || []).map(e => entry(e, t)).join('\n        ');
  const acad = (xp.acad || []).map(e => entry(e, t)).join('\n        ');
  const cursos = (xp.courses || []).map(e => entry(e, t)).join('\n        ');
  const perfis = AUTHOR.sameAs.map(u =>
    `<li><a href="${esc(u)}" rel="me noopener" target="_blank">${esc(u.replace(/^https?:\/\//, ''))}</a></li>`).join('\n          ');
  const faqHtml = faqs.map(f =>
    `<div class="ab-faq__item">
            <h3>${esc(f.q)}</h3>
            <p>${esc(f.a)}</p>
          </div>`).join('\n          ');

  const metaDesc = BIO[lang].split(/(?<=\.)\s/)[0].slice(0, 158);

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(t.title)}</title>
  <meta name="author" content="${esc(AUTHOR.name)}">
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

  <link rel="canonical" href="${SITE_URL}${t.url}" />
  <link rel="alternate" hreflang="pt-BR" href="${SITE_URL}${T.pt.url}" />
  <link rel="alternate" hreflang="en" href="${SITE_URL}${T.en.url}" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${T.pt.url}" />
  <link rel="alternate" type="application/rss+xml" title="Blog · ${esc(AUTHOR.name)}" href="${SITE_URL}/feed.xml" />

  <meta property="og:type" content="profile" />
  <meta property="og:site_name" content="${esc(AUTHOR.name)}" />
  <meta property="og:title" content="${esc(t.title)}" />
  <meta property="og:description" content="${esc(metaDesc)}" />
  <meta property="og:url" content="${SITE_URL}${t.url}" />
  <meta property="og:image" content="${AUTHOR.image}" />
  <meta property="og:image:alt" content="${esc(AUTHOR.name)}, ${esc(AUTHOR.jobTitle)}" />
  <meta property="og:locale" content="${t.locale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(t.title)}" />
  <meta name="twitter:description" content="${esc(metaDesc)}" />
  <meta name="twitter:image" content="${AUTHOR.image}" />

  <script type="application/ld+json">
${graph(lang, t, faqs)}
  </script>
</head>

<body class="ab-body">
  <header>
    <div class="nav">
      <div class="nav-center">
        <nav class="pill">
          <a href="${lang === 'en' ? '/en/' : '/'}">${esc(t.navHome)}</a>
          <a href="${lang === 'en' ? '/en/#projects' : '/#projects'}">${esc(t.navWork)}</a>
          <a href="${lang === 'en' ? '/en/blog.html' : '/blog.html'}" class="nav-blog-link">${esc(t.navBlog)}</a>
          <a href="${lang === 'en' ? '/en/#contato' : '/#contato'}">${esc(t.navContact)}</a>
        </nav>
      </div>
    </div>
  </header>

  <main class="ab-main">
    <article>
      <h1>${esc(t.h1)}</h1>
      <p class="ab-lead">${esc(BIO[lang])}</p>

      <img class="ab-photo" src="/img/eufoto1.webp" width="320" height="320"
           alt="${esc(AUTHOR.name)}, ${esc(AUTHOR.jobTitle)}, em ${esc(AUTHOR.locality)}" decoding="async"/>

      <section aria-labelledby="ab-traj">
        <h2 id="ab-traj">${esc(t.sTrajetoria)}</h2>
        ${paras(bio)}
      </section>

      <section aria-labelledby="ab-esp">
        <h2 id="ab-esp">${esc(t.sEsp)}</h2>
        <ul class="ab-list">
          ${esp}
        </ul>
      </section>

      ${svc ? `<section aria-labelledby="ab-svc">
        <h2 id="ab-svc">${esc(I18N[lang].services.title || 'Serviços')}</h2>
        <ul class="ab-list">
          ${svc}
        </ul>
      </section>` : ''}

      ${prof ? `<section aria-labelledby="ab-exp">
        <h2 id="ab-exp">${esc(t.sExp)}</h2>
        ${prof}
      </section>` : ''}

      ${acad ? `<section aria-labelledby="ab-form">
        <h2 id="ab-form">${esc(t.sForm)}</h2>
        ${acad}
      </section>` : ''}

      ${cursos ? `<section aria-labelledby="ab-cur">
        <h2 id="ab-cur">${esc(t.sCursos)}</h2>
        ${cursos}
      </section>` : ''}

      <section aria-labelledby="ab-perf">
        <h2 id="ab-perf">${esc(t.sPerfis)}</h2>
        <ul class="ab-list">
          ${perfis}
          <li><a href="mailto:${esc(AUTHOR.email)}">${esc(AUTHOR.email)}</a></li>
        </ul>
      </section>

      <section class="ab-faq" aria-labelledby="ab-faq-t">
        <h2 id="ab-faq-t">${esc(t.sFaq)}</h2>
        <div class="ab-faq__list">
          ${faqHtml}
        </div>
      </section>
    </article>
  </main>

  <script src="/js/language.js" defer></script>
  <script src="/js/UI.js" defer></script>
</body>
</html>
`;
}

function build(langs = ['pt', 'en']) {
  const I18N = loadI18N();
  const out = [];
  for (const lang of langs) {
    const t = T[lang];
    const dest = path.join(ROOT, t.file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, page(I18N, lang), 'utf8');
    out.push(t.url);
    console.log(`  ${lang}: ${t.url}`);
  }
  return out;
}

if (require.main === module) {
  console.log('================================================');
  console.log('  build-about.js (entity home)');
  console.log('================================================');
  build();
  console.log('================================================');
}

module.exports = { build, AUTHOR, BIO, PERSON, SITE };
