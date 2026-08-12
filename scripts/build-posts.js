#!/usr/bin/env node
'use strict';

/* =========================================================
   build-posts.js
   ---------------------------------------------------------
   Le data/posts/*.md + os posts publicados no Supabase, mescla
   as duas fontes (banco vence em conflito de slug) e gera:
     - /posts/<slug>.html  (paginas estaticas completas com OG/Twitter/JSON-LD)
     - /data/posts.json    (lista publica usada pela home do blog)
     - sitemap.xml         (site + posts, com image: nas capas)
     - sitemap-imagens.xml (capas/galerias — Google Images)
     - feed.xml            (RSS atualizado a cada publish)
     - blog.html           (substitui o bloco entre marcadores <!--BUILD:...-->)
     - js/blog-seed.js     (fallback de compatibilidade)
     - versoes .webp das imagens declaradas no front-matter (se sharp disponivel)
   ========================================================= */

const fs    = require('fs');
const path  = require('path');
const matter = require('gray-matter');
const { Marked } = require('marked');
const { fetchSupabasePosts, slugify } = require('./lib/supabase-posts');

let sharp = null;
try { sharp = require('sharp'); }
catch (e) { /* opcional - se faltar, pulamos webp */ }

const ROOT       = path.resolve(__dirname, '..');
const POSTS_SRC  = path.join(ROOT, 'data', 'posts');
const POSTS_OUT  = path.join(ROOT, 'posts');
const SITE_URL   = 'https://bernardoiannini.com';
const AUTHOR     = {
  name: 'Bernardo Iannini',
  fullName: 'Bernardo Araujo Iannini',
  alternateName: ['Bernardo Iannini', 'Bernardo A. Iannini', 'Bernardo Araujo Iannini'],
  url: SITE_URL + '/',
  image: SITE_URL + '/img/eufoto1.png',
  email: 'bernardo.iannini14@gmail.com',
  telephone: '+55-31-99562-4617',
  jobTitle: 'Full Stack Developer & AI Designer',
  sameAs: [
    'https://www.linkedin.com/in/bernardo-iannini',
    'https://github.com/iannini25',
  ],
  worksFor: { name: 'Inspire4U', type: 'Organization' },
  alumniOf: { name: 'COTEMIG', type: 'EducationalOrganization' },
  address: {
    locality: 'Belo Horizonte',
    region:   'MG',
    country:  'BR',
  },
  knowsAbout: [
    'Desenvolvimento Web', 'Full Stack', 'AI Design', 'C#', 'SQL', 'TypeScript',
    'JavaScript', 'React', 'Python', 'UX Design', 'Edicao de Video', 'ERP'
  ],
};

/* =========================================================
   Utilidades
   ========================================================= */

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const escapeAttr = (s) => escapeHtml(s);

const escapeXml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[c]));

// slugify vive em scripts/lib/supabase-posts.js: as duas fontes (md e
// banco) precisam sanear o slug com a MESMA regra.

// Imagem remota = URL absoluta http(s) ou protocolo-relativa. Posts
// escritos no admin apontam pro Storage do Supabase, que e outro host:
// nada de prefixar dominio, inventar .webp ou tentar ler do disco.
const isRemoteUrl = (p) => /^(?:https?:)?\/\//i.test(String(p || ''));

const absoluteUrl = (p) => {
  if (!p) return '';
  if (isRemoteUrl(p)) return p;   // ja e absoluta (Storage/CDN): nao prefixa
  return SITE_URL + (p.startsWith('/') ? '' : '/') + p;
};

// Caminho .webp equivalente (toda capa/imagem LOCAL ganha versao webp via
// generateWebpForPosts). Usado SO em <img> de exibicao — OG/JSON-LD seguem
// com o original (png/jpg) para compatibilidade com scrapers sociais.
// Imagem remota volta intacta: o .webp dela nao existe em lugar nenhum.
const toWebp = (p) => isRemoteUrl(p)
  ? String(p || '')
  : String(p || '').replace(/\.(jpe?g|png)$/i, '.webp');

/* JSON pra dentro de <script>: o parser de HTML fecha a tag em '</script'
   (e um '<!--' abre comentario), entao um titulo ou corpo com essas
   sequencias quebraria o BI_POSTS e o JSON-LD da pagina. Escapar o '<'
   como < e valido em JSON e em JS, e o dado chega intacto no parse.
   Vale mais agora que o conteudo vem do painel direto pra producao. */
const jsonForScript = (value, indent) =>
  JSON.stringify(value, null, indent).replace(/</g, '\\u003c');

const stripMd = (md) => String(md || '')
  .replace(/^:::[\s\S]*?^:::[ \t]*$/gm, '')
  .replace(/```[\s\S]*?```/g, '')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/[#>*_`~|]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const wordCount = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

const readTimeMin = (content) => Math.max(1, Math.ceil(wordCount(content) / 200));

const formatDatePt = (iso) => {
  try {
    // timeZone fixo em UTC: a data exibida sai identica em qualquer
    // maquina de build (local GMT-3 vs Vercel UTC).
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
  } catch { return iso || ''; }
};

const isoDate = (iso) => {
  try { return new Date(iso).toISOString(); }
  catch { return iso || ''; }
};

const dateOnly = (iso) => {
  try { return new Date(iso).toISOString().slice(0, 10); }
  catch { return (iso || '').slice(0, 10); }
};

/* =========================================================
   Carrega posts de data/posts/*.md
   ========================================================= */

function listPostFiles() {
  if (!fs.existsSync(POSTS_SRC)) return [];
  return fs.readdirSync(POSTS_SRC)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(POSTS_SRC, f));
}

function loadPosts() {
  const out = [];
  for (const file of listPostFiles()) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const { data, content } = matter(raw);
      // slugify sempre, mesmo com slug declarado no front-matter:
      // kebab-case, sem espaco, / ou ../ (nao escreve fora de posts/)
      const slug = slugify(data.slug || path.basename(file, '.md'));
      const date    = data.date    || data.createdAt || new Date().toISOString();
      const updated = data.updated || data.updatedAt || date;
      const id   = data.id || slug;
      const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);
      const images = Array.isArray(data.images) ? data.images : [];
      const post = {
        id,
        slug,
        title: data.title || 'Untitled',
        subtitle: data.subtitle || '',
        category: data.category || 'Blog',
        tags,
        cover: data.cover || (images[0]?.src) || '',
        coverAlt: data.coverAlt || data.cover_alt || (data.title ? `${data.title} - Bernardo Iannini` : 'Bernardo Iannini'),
        images,
        linkedinUrl: data.linkedinUrl || data.linkedin_url || '',
        featured: !!data.featured,
        status: data.status || 'published',
        date,
        updated,
        author: data.author || AUTHOR.name,
        content: content.trim(),
        source: path.basename(file),
      };
      out.push(post);
    } catch (e) {
      console.error(`[build-posts] erro ao parsear ${file}:`, e.message);
    }
  }
  return out
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* =========================================================
   Markdown -> HTML
   ---------------------------------------------------------
   Markdown padrao (GFM) renderizado pelo marked: titulos, enfase,
   codigo inline e cercado, listas (inclusive de tarefas), citacoes,
   regua, tabelas, imagens e links. A saida e HTML semantico simples
   (h2, p, pre, table, blockquote...) — sem cards, callouts ou icones.

   Unico bloco especial que sobrou: :::gallery, que injeta a grade de
   midia montada a partir do front-matter (images:).
   ========================================================= */

const SAFE_URL_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

/* Devolve '' quando a URL nao e segura (javascript:, data:, vbscript: e
   variantes disfarcadas com espaco/controle no meio do esquema). */
function safeUrl(href) {
  const raw = String(href ?? '').trim();
  if (!raw) return '';
  const flat = raw.replace(/[\x00-\x20]+/g, '').toLowerCase();
  const colon = flat.indexOf(':');
  if (colon === -1) return raw;               // relativo, ancora ou query
  const sep = flat.search(/[/?#]/);
  if (sep !== -1 && sep < colon) return raw;  // ex: /pasta/arquivo:1
  return SAFE_URL_SCHEMES.has(flat.slice(0, colon)) ? raw : '';
}

const SITE_HOST = SITE_URL
  .replace(/^https?:\/\//i, '')
  .replace(/\/.*$/, '')
  .replace(/^www\./i, '')
  .toLowerCase();

/* Externo = http(s) (ou protocolo-relativo) apontando pra fora do dominio.
   Link interno/relativo NUNCA recebe target=_blank. */
function isExternalUrl(href) {
  const url = String(href || '');
  if (!/^(?:https?:)?\/\//i.test(url)) return false;
  const host = url
    .replace(/^(?:https?:)?\/\//i, '')
    .split(/[/?#]/)[0]
    .replace(/^www\./i, '')
    .toLowerCase();
  return host !== SITE_HOST;
}

/* Escapa sem escapar duas vezes — o marked entrega alguns campos
   (alt, title de link) ja escapados. */
const escapeOnce = (s) => String(s ?? '')
  .replace(/&(?!#?\w+;)/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/* Instancia propria do marked (nao mexe em opcoes globais).
   gfm: tabelas, strike, task list e autolink. breaks: false — uma
   quebra de linha simples nao virou <br>, so linha em branco separa. */
const mdParser = new Marked({ gfm: true, breaks: false, pedantic: false });

/* ATENCAO: renderers abaixo usam a assinatura POSICIONAL do marked v12
   (link(href, title, text)...). O marked 13+ passa um unico objeto token
   e quebraria links/imagens em silencio. Versao fixada (sem ^) no
   package.json; ao atualizar, migrar para a assinatura por token. */
mdParser.use({
  renderer: {
    link(href, title, text) {
      const url = safeUrl(href);
      if (!url) return text;                  // link perigoso vira texto puro
      const attrs = [`href="${escapeOnce(url)}"`];
      if (title) attrs.push(`title="${escapeOnce(title)}"`);
      if (isExternalUrl(url)) attrs.push('target="_blank"', 'rel="noopener"');
      return `<a ${attrs.join(' ')}>${text}</a>`;
    },
    image(href, title, text) {
      const url = safeUrl(href);
      if (!url) return text || '';
      const attrs = [`src="${escapeOnce(url)}"`, `alt="${escapeOnce(text || '')}"`];
      if (title) attrs.push(`title="${escapeOnce(title)}"`);
      attrs.push('loading="lazy"');
      return `<img ${attrs.join(' ')}/>`;
    },
    /* HTML cru escrito no .md vira TEXTO: markdown de post nao injeta
       script/iframe/onclick. Mesma politica dos renderizadores do
       cliente (js/blog.js escapa antes de parsear).
       Em nivel de bloco o texto entra num <p> pra nao ficar solto
       dentro de .post-page-body. */
    html(raw, block) {
      const text = escapeHtml(String(raw ?? '').trim());
      if (!text) return '';
      return block ? `<p>${text}</p>\n` : text;
    },
  },
});

/* Grade adaptativa estilo LinkedIn/Twitter:
   1 img = grande · 2 = lado a lado · 3 = uma alta + duas ·
   4 = grade 2x2 · 5+ = 2x2 com "+N" no 4o (resto so no lightbox). */
function mediaGridHtml(post) {
  if (!post.images || !post.images.length) return '';
  const total = post.images.length;
  const countClass = total >= 5 ? 'post-media--many' : `post-media--${total}`;
  const extra = total > 4 ? total - 4 : 0;

  const items = post.images.map((img, i) => {
    const src = img.src || '';
    const alt = img.alt || post.coverAlt || post.title;
    const w   = img.width  || 1200;
    const h   = img.height || 800;
    const cap = img.caption || '';
    // So emite <source webp> quando existe um .webp gerado por nos: imagem
    // remota (Storage) ou que ja e .webp/.svg volta igual do toWebp.
    const webp = toWebp(src);
    const webpSource = (webp && webp !== src)
      ? `<source type="image/webp" srcset="${escapeAttr(webp)}"/>` : '';
    const moreBadge = (extra && i === 3)
      ? `<span class="post-media-more" aria-hidden="true">+${extra}</span>` : '';
    return `<figure class="post-media-item" itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
      <picture>
        ${webpSource}
        <img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" width="${w}" height="${h}" itemprop="contentUrl" data-gallery-index="${i}"/>
      </picture>
      ${moreBadge}
      <meta itemprop="creator" content="${escapeAttr(AUTHOR.name)}"/>
      <meta itemprop="copyrightHolder" content="${escapeAttr(AUTHOR.name)}"/>
      <meta itemprop="creditText" content="${escapeAttr(AUTHOR.name)}"/>
      ${cap ? `<figcaption itemprop="caption">${escapeHtml(cap)}</figcaption>` : ''}
    </figure>`;
  }).join('');
  return `<div class="post-media ${countClass}" data-gallery>${items}</div>`;
}

function renderGallery(post) {
  const grid = mediaGridHtml(post);
  return grid ? `<!--HTMLBLOCK-->${grid}<!--/HTMLBLOCK-->` : '';
}

/* :::gallery -> grade de midia montada com o front-matter (images:).
   Unico bloco especial que sobrou: e midia, nao widget de conteudo.

   Aceita as duas formas, com e sem a linha de fechamento:
     :::gallery          e     :::gallery
     :::                        (nada)
   Antes so a forma fechada era substituida, mas quem suprime a grade do
   topo (galleryInBody) casa com a linha de abertura sozinha. Resultado:
   escrever ":::gallery" sem fechar publicava o texto cru no post E matava
   a grade automatica, ou seja, post no ar sem imagem nenhuma. Forma aberta
   consome so a propria linha. */
function processGallery(md, post) {
  return md
    .replace(/^:::gallery[^\n]*\n?[\s\S]*?^:::[ \t]*$/gm, () => renderGallery(post))
    .replace(/^:::gallery[^\n]*$/gm, () => renderGallery(post));
}

function markdownToHtml(md, post) {
  if (!md) return '';

  // 1) :::gallery -> HTML pronto, envolto em <!--HTMLBLOCK-->
  md = processGallery(md, post);

  // 2) Esconde o HTML que nos mesmos geramos atras de sentinelas NUL,
  //    pra o marked nao reescrever nem escapar essa parte.
  const blocks = [];
  md = md.replace(/<!--HTMLBLOCK-->([\s\S]*?)<!--\/HTMLBLOCK-->/g, (_, b) => {
    blocks.push(b);
    return `\x00HTMLBLOCK_${blocks.length - 1}\x00`;
  });

  // 3) Markdown padrao (GFM) -> HTML semantico
  let html = mdParser.parse(md);

  // 4) Devolve os blocos. A sentinela sozinha vira um paragrafo no
  //    marked: tira o <p> antes, senao a galeria (<div>) fica dentro
  //    de um <p> e o navegador quebra a arvore.
  html = html
    .replace(/<p>\s*\x00HTMLBLOCK_(\d+)\x00\s*<\/p>/g, (_, i) => blocks[i] || '')
    .replace(/\x00HTMLBLOCK_(\d+)\x00/g, (_, i) => blocks[i] || '');

  // 5) Rede de seguranca: todo <img> sai com loading="lazy"
  html = html.replace(/<img\s+([^>]*?)\/?>/gi, (m, attrs) =>
    /loading=/i.test(attrs) ? m : `<img ${attrs.trim()} loading="lazy"/>`);

  return html;
}

/* =========================================================
   Related posts (score por categoria + tags)
   ========================================================= */

function pickRelated(current, all, max = 3) {
  const others = all.filter(p => p.id !== current.id);
  const scored = others.map(p => {
    let score = 0;
    if (p.category && p.category === current.category) score += 3;
    (p.tags || []).forEach(t => {
      if ((current.tags || []).includes(t)) score += 2;
    });
    return { p, score };
  });
  const positive = scored.filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(x => x.p);
  if (positive.length >= max) return positive;
  const fallback = others
    .filter(p => !positive.includes(p))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, max - positive.length);
  return [...positive, ...fallback];
}

/* =========================================================
   NAV / FOOTER comuns
   ========================================================= */

function navbarHtml() {
  return `<header>
    <div class="nav">
      <nav id="mobileNav" class="mobile-nav" aria-hidden="true">
        <a href="/index.html#home" data-i18n="nav.home">Home</a>
        <a href="/index.html#sobre" data-i18n="nav.about">About</a>
        <a href="/index.html#services" data-i18n="nav.services">Services</a>
        <div class="mobile-dd">
          <button type="button" class="mobile-dd-btn" aria-haspopup="menu" aria-expanded="false">
            <span data-i18n="nav.work">Work</span>
            <svg class="mobile-dd-caret" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="mobile-dd-menu" role="menu">
            <a href="/index.html#xp" data-i18n="nav.experience" role="menuitem">Experience</a>
            <a href="/index.html#skills" data-i18n="nav.skills" role="menuitem">Skills</a>
            <a href="/index.html#projects" data-i18n="nav.projects" role="menuitem">Projects</a>
          </div>
        </div>
        <a href="/blog.html" class="nav-blog-link active-link"><span data-i18n="nav.blog">Blog</span></a>
        <a href="/index.html#contato" data-i18n="nav.contact">Contact</a>
      </nav>
      <div class="lang-slot" aria-label="Language switch">
        <button id="langBtn" class="lang-switch pill" aria-haspopup="listbox" aria-expanded="false">
          <span class="lang-ico" aria-hidden="true">&#127760;</span>
          <span id="langCode">EN</span>
          <svg class="caret" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <ul id="langMenu" class="lang-menu" role="listbox">
          <li data-lang="en" role="option" aria-selected="true">English</li>
          <li data-lang="pt" role="option" aria-selected="false">Portugues</li>
        </ul>
      </div>
      <div class="nav-center">
        <nav class="pill">
          <a href="/index.html#home" data-i18n="nav.home">Home</a>
          <a href="/index.html#sobre" data-i18n="nav.about">About</a>
          <a href="/index.html#services" data-i18n="nav.services">Services</a>
          <div class="nav-dd">
            <button type="button" id="workBtn" class="nav-dd-btn" aria-haspopup="menu" aria-expanded="false">
              <span data-i18n="nav.work">Work</span>
              <svg class="nav-dd-caret" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <ul id="workMenu" class="nav-dd-menu" role="menu">
              <li><a href="/index.html#xp" data-i18n="nav.experience" role="menuitem">Experience</a></li>
              <li><a href="/index.html#skills" data-i18n="nav.skills" role="menuitem">Skills</a></li>
              <li><a href="/index.html#projects" data-i18n="nav.projects" role="menuitem">Projects</a></li>
            </ul>
          </div>
          <a href="/blog.html" class="nav-blog-link active-link"><span data-i18n="nav.blog">Blog</span></a>
          <a href="/index.html#contato" data-i18n="nav.contact">Contact</a>
        </nav>
      </div>
      <button id="menuBtn" class="menu-btn" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobileNav">
        <span class="menu-line"></span><span class="menu-line"></span><span class="menu-line"></span>
      </button>
      <div class="nav-right">
        <a class="resume-btn" href="/Curriculo_Bernardo_Iannini.pdf" download>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v11m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span data-i18n="nav.resume">Curriculo</span>
        </a>
      </div>
    </div>
  </header>`;
}

/* =========================================================
   Template do post estatico
   ========================================================= */

function postPageHtml(post, related) {
  const url = `${SITE_URL}/posts/${post.slug}.html`;
  const desc = (post.subtitle || stripMd(post.content)).slice(0, 158).trim();
  // absoluteUrl NAO reprefixa URL do Storage: og:image/twitter:image saem
  // com um dominio so.
  const cover = post.cover ? absoluteUrl(post.cover) : `${SITE_URL}/img/eufoto1.png`;
  const readMin = readTimeMin(post.content);
  const articleBody = markdownToHtml(post.content, post);

  // OG image tags - inclui alt e dimensoes
  const ogImageTags = [
    `<meta property="og:image" content="${escapeAttr(cover)}"/>`,
    `<meta property="og:image:alt" content="${escapeAttr(post.coverAlt)}"/>`,
    `<meta property="og:image:width" content="1200"/>`,
    `<meta property="og:image:height" content="630"/>`,
  ].join('\n  ');

  // JSON-LD BlogPosting
  const imagesForLd = post.images && post.images.length
    ? post.images.map(img => ({
        '@type': 'ImageObject',
        url: absoluteUrl(img.src),
        caption: img.caption || '',
        description: img.alt || post.coverAlt || post.title,
        creator: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
        copyrightHolder: { '@type': 'Person', name: AUTHOR.name },
        creditText: AUTHOR.name,
        license: AUTHOR.url,
      }))
    : [{
        '@type': 'ImageObject',
        url: cover,
        description: post.coverAlt,
        creator: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
        copyrightHolder: { '@type': 'Person', name: AUTHOR.name },
        creditText: AUTHOR.name,
        license: AUTHOR.url,
      }];

  const jsonLdPost = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: desc,
    image: imagesForLd,
    datePublished: isoDate(post.date),
    dateModified:  isoDate(post.updated),
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
      alternateName: AUTHOR.alternateName,
      url: AUTHOR.url,
      image: AUTHOR.image,
      sameAs: AUTHOR.sameAs,
    },
    publisher: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: [...(post.tags || []), AUTHOR.name, 'Belo Horizonte', 'Full Stack Developer', 'AI Designer'].join(', '),
    articleSection: post.category,
    inLanguage: 'pt-BR',
    url,
    wordCount: wordCount(post.content),
    timeRequired: `PT${readMin}M`,
  };

  const jsonLdCrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE_URL + '/blog.html' },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  // Tags
  const tagsHtml = (post.tags && post.tags.length)
    ? `<div class="post-page-tags">
        ${post.tags.map(t => `<a href="/blog.html?q=${encodeURIComponent(t)}" class="post-page-tag">#${escapeHtml(t)}</a>`).join('')}
      </div>`
    : '';

  // Share
  const shareText = encodeURIComponent(`${post.title} - Bernardo Iannini`);
  const shareUrl = encodeURIComponent(url);
  const shareBar = `<div class="post-share-bar">
      <span class="post-share-label" data-i18n="post.share.label">Compartilhar este post</span>
      <div class="post-share-buttons">
        <a class="post-share-btn" href="https://twitter.com/intent/tweet?text=${shareText}&amp;url=${shareUrl}" target="_blank" rel="noopener" aria-label="Compartilhar no Twitter">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 5.92a8.5 8.5 0 0 1-2.36.65 4.13 4.13 0 0 0 1.8-2.27 8.22 8.22 0 0 1-2.61 1 4.1 4.1 0 0 0-6.98 3.74A11.65 11.65 0 0 1 3.4 4.9a4.1 4.1 0 0 0 1.27 5.48 4.07 4.07 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.86.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.57a11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.68-6.25 11.68-11.68v-.53A8.36 8.36 0 0 0 22 5.92z"/></svg>
        </a>
        <a class="post-share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener" aria-label="Compartilhar no LinkedIn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.84-2.2 3.8-2.2 4.06 0 4.8 2.67 4.8 6.15V24h-4v-7.1c0-1.7-.03-3.9-2.4-3.9-2.4 0-2.77 1.87-2.77 3.8V24h-4V8z"/></svg>
        </a>
        <a class="post-share-btn" href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.8-1.5a11 11 0 0 0 5.2 1.3 11 11 0 0 0 8.5-18.3zm-8.5 16.7a9 9 0 0 1-4.6-1.2l-.3-.2-2.9.9.9-2.8-.2-.3a9 9 0 1 1 7.1 3.6z"/></svg>
        </a>
        <button id="copyLinkBtn" class="post-share-btn" type="button" aria-label="Copiar link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="9" y="9" width="12" height="12" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>`;

  /* LinkedIn original link.
     safeUrl e nao escapeAttr: escapar so impede sair do atributo, nao impede
     um esquema perigoso (javascript:) virar link clicavel. Este era o unico
     href do build que nao passava pelo filtro de esquema. */
  const linkedinUrlSeguro = safeUrl(post.linkedinUrl);
  const linkedinLink = linkedinUrlSeguro ? `
    <div class="post-linkedin-link">
      <a href="${escapeAttr(linkedinUrlSeguro)}" target="_blank" rel="noopener" class="post-linkedin-btn">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
          <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.84-2.2 3.8-2.2 4.06 0 4.8 2.67 4.8 6.15V24h-4v-7.1c0-1.7-.03-3.9-2.4-3.9-2.4 0-2.77 1.87-2.77 3.8V24h-4V8z"/>
        </svg>
        <span data-i18n="post.linkedin">Ver post original no LinkedIn</span>
      </a>
    </div>` : '';

  // Related posts
  const relatedHtml = related && related.length ? `
    <section class="post-related">
      <p class="kicker" data-i18n="post.related.kicker">Continue lendo</p>
      <h2 class="post-related-title" data-i18n="post.related.title">Posts relacionados</h2>
      <div class="post-related-grid">
        ${related.map(r => {
          const rUrl = `/posts/${r.slug}.html`;
          const rCover = r.cover || '/img/eufoto1.png';
          return `<a class="post-related-card" href="${rUrl}" data-slug="${escapeAttr(r.slug)}">
            <div class="post-related-card-cover">
              <img src="${escapeAttr(toWebp(rCover))}" alt="${escapeAttr(r.coverAlt || r.title)}" loading="lazy" width="800" height="500"/>
            </div>
            <div class="post-related-card-body">
              ${r.category ? `<span class="post-related-card-cat">${escapeHtml(r.category)}</span>` : ''}
              <h3 class="post-related-card-title">${escapeHtml(r.title)}</h3>
              <p class="post-related-card-meta">
                <span>${formatDatePt(r.date)}</span>
                <span class="post-dot" aria-hidden="true"></span>
                <span>${readTimeMin(r.content)} min</span>
              </p>
            </div>
          </a>`;
        }).join('')}
      </div>
    </section>` : '';

  // A CAPA fica SO na capa (card/destaque do blog). Ela nao aparece
  // dentro do post. As imagens do post vao para o TOPO, antes do texto.
  // Se o corpo ja usa :::gallery, a grade fica so onde o autor colocou
  // (senao a galeria sairia duplicada, com data-gallery repetido).
  const hasMedia = !!(post.images && post.images.length);
  const galleryInBody = /^:::gallery/m.test(post.content);
  const topMedia = (hasMedia && !galleryInBody)
    ? mediaGridHtml(post)
    : '<div class="post-page-cover-spacer"></div>';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(post.title)} - Bernardo Iannini</title>
  <meta name="description" content="${escapeAttr(desc)}"/>
  <meta name="author" content="${escapeAttr(AUTHOR.name)}"/>
  <meta name="robots" content="index, follow, max-image-preview:large"/>
  <link rel="canonical" href="${url}"/>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=JetBrains+Mono:wght@400;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/blog.css">

  <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32">
  <link rel="icon" type="image/png" href="/favicon-48.png" sizes="48x48">
  <link rel="icon" type="image/png" href="/favicon_192px.png" sizes="192x192">
  <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any">
  <meta name="theme-color" content="#060807">

  <meta property="og:type" content="article"/>
  <meta property="og:site_name" content="Bernardo Iannini"/>
  <meta property="og:title" content="${escapeAttr(post.title)}"/>
  <meta property="og:description" content="${escapeAttr(desc)}"/>
  ${ogImageTags}
  <meta property="og:url" content="${url}"/>
  <meta property="og:locale" content="pt_BR"/>
  <meta property="og:locale:alternate" content="en_US"/>
  <meta property="article:published_time" content="${isoDate(post.date)}"/>
  <meta property="article:modified_time" content="${isoDate(post.updated)}"/>
  <meta property="article:author" content="${AUTHOR.url}"/>
  <meta property="article:section" content="${escapeAttr(post.category)}"/>
  ${(post.tags || []).map(t => `<meta property="article:tag" content="${escapeAttr(t)}"/>`).join('\n  ')}

  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeAttr(post.title)}"/>
  <meta name="twitter:description" content="${escapeAttr(desc)}"/>
  <meta name="twitter:image" content="${escapeAttr(cover)}"/>
  <meta name="twitter:image:alt" content="${escapeAttr(post.coverAlt)}"/>

  <style id="page-fx">
    html:not(.i18n-ready) body { opacity: 0; }
    body { opacity: 1; transition: opacity .35s cubic-bezier(.22,.61,.36,1); }
    html:not(.i18n-ready) main { transform: scale(1.03); filter: blur(8px); }
    main { transition: transform .45s cubic-bezier(.22,.61,.36,1), filter .45s cubic-bezier(.22,.61,.36,1); }
    body.page-leaving { opacity: 0; pointer-events: none; }
    body.page-leaving main { transform: scale(.97); filter: blur(8px); }
    @media (prefers-reduced-motion: reduce) {
      html:not(.i18n-ready) main { transform: none; filter: none; }
      body, body.page-leaving { transition: opacity .18s ease; }
      main, body.page-leaving main { transition: none; transform: none; filter: none; }
    }
  </style>
  <!-- Sem JS a classe i18n-ready nunca chega: desfaz a mascara anti-flicker -->
  <noscript><style>body{opacity:1!important}main{transform:none!important;filter:none!important}</style></noscript>
  <script>
    (function () {
      try {
        var l = localStorage.getItem('lang');
        if (l === 'pt' || l === 'en') {
          document.documentElement.lang = (l === 'pt') ? 'pt-BR' : 'en';
        }
      } catch (e) {}
      /* PAINT LIBERADO SEMPRE (ver index.html): antes a classe so era
         adicionada quando havia idioma salvo, entao visitante novo e crawler
         encaravam tela branca ate executar o language.js. Sem preferencia
         salva o HTML ja esta no idioma default, logo nao ha texto pra piscar.
         FORA do try de proposito: se o localStorage lancar (modo privado com
         storage bloqueado), o catch engoliria o add e a pagina ficaria
         invisivel justamente no navegador mais restritivo. */
      document.documentElement.classList.add('i18n-ready');
    })();
    window.addEventListener('pageshow', function () {
      document.body && document.body.classList.remove('page-leaving');
    });
  </script>

  <script type="application/ld+json">
${jsonForScript(jsonLdPost, 2)}
  </script>
  <script type="application/ld+json">
${jsonForScript(jsonLdCrumbs, 2)}
  </script>
</head>

<body class="blog-body post-body">
  ${navbarHtml()}

  <main class="post-main">
    <div class="post-back-row">
      <a href="/blog.html" class="post-back" id="postBack" aria-label="Voltar ao blog">
        <span class="post-back-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="post-back-text" data-i18n="post.back">Voltar ao blog</span>
      </a>
    </div>

    <article class="post-page" id="postPage" itemscope itemtype="https://schema.org/BlogPosting" itemid="${url}">
      <section class="post-page-hero">
        <div class="post-page-eyebrow">
          <span class="post-page-eyebrow-cat">${escapeHtml(post.category)}</span>
          <span class="post-dot" aria-hidden="true"></span>
          <time datetime="${isoDate(post.date)}" itemprop="datePublished">${formatDatePt(post.date)}</time>
          <span class="post-dot" aria-hidden="true"></span>
          <span class="post-page-eyebrow-read">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/>
            </svg>
            ${readMin} min de leitura
          </span>
        </div>

        <h1 class="post-page-title" itemprop="headline">${escapeHtml(post.title)}</h1>
        ${post.subtitle ? `<p class="post-page-subtitle" itemprop="description">${escapeHtml(post.subtitle)}</p>` : ''}

        <div class="post-page-byline">
          <div class="post-page-byline-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
            <img src="/img/eufoto1.webp" alt="${escapeAttr(AUTHOR.name)}, autor do post" loading="lazy" width="48" height="48"/>
            <div>
              <span class="post-page-byline-name" itemprop="name">${escapeHtml(AUTHOR.name)}</span>
              <span class="post-page-byline-role">${escapeHtml(AUTHOR.jobTitle)}</span>
              <link itemprop="url" href="${AUTHOR.url}"/>
            </div>
          </div>
        </div>
      </section>

      ${topMedia}

      <div class="post-page-body" itemprop="articleBody">
${articleBody}
      </div>

      ${tagsHtml}
      ${linkedinLink}
      ${shareBar}
      ${relatedHtml}

      <div class="post-author-card">
        <div class="post-author-card-photo">
          <img src="/img/eufoto1.webp" alt="${escapeAttr(AUTHOR.name)}, ${escapeAttr(AUTHOR.jobTitle)}" loading="lazy" width="120" height="120"/>
        </div>
        <div class="post-author-card-info">
          <p class="kicker" data-i18n="post.author.kicker">Sobre o autor</p>
          <h3>${escapeHtml(AUTHOR.name)}</h3>
          <p class="post-author-card-bio" data-i18n="post.author.bio">19 anos &middot; Full Stack Developer &middot; AI Designer. Escrevo sobre o que aprendo no caminho - engenharia, IA, design e os bastidores dos projetos que construo.</p>
          <div class="post-author-card-actions">
            ${AUTHOR.sameAs.map(u => {
              if (u.includes('linkedin')) return `<a href="${u}" target="_blank" rel="noopener">LinkedIn</a>`;
              if (u.includes('github')) return `<a href="${u}" target="_blank" rel="noopener">GitHub</a>`;
              return `<a href="${u}" target="_blank" rel="noopener">${u.replace(/^https?:\/\//, '').split('/')[0]}</a>`;
            }).join('\n            ')}
            <a href="/index.html#contato" data-i18n="post.author.contact">Contato</a>
          </div>
        </div>
      </div>
    </article>

    <!-- Lightbox da galeria -->
    <dialog class="post-lightbox" id="postLightbox" aria-label="Visualizacao ampliada da imagem">
      <button class="post-lightbox-close" type="button" data-lightbox-close aria-label="Fechar">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>
      </button>
      <button class="post-lightbox-nav post-lightbox-nav--prev" type="button" data-lightbox-prev aria-label="Imagem anterior">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="post-lightbox-nav post-lightbox-nav--next" type="button" data-lightbox-next aria-label="Proxima imagem">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <figure class="post-lightbox-frame">
        <img id="postLightboxImg" src="" alt=""/>
        <figcaption id="postLightboxCaption"></figcaption>
      </figure>
    </dialog>

    <footer class="post-footer">
      <div class="post-footer-inner">
        <p>&copy; <span id="footerYear">${new Date().getFullYear()}</span> Bernardo Iannini &middot; <span data-i18n="blog.footer.rights">Todos os direitos reservados</span></p>
        <div class="post-footer-links">
          <a href="/blog.html" data-i18n="post.footer.back">Voltar ao blog</a>
          <span aria-hidden="true">&middot;</span>
          <a href="/index.html" data-i18n="post.footer.portfolio">Portfolio</a>
        </div>
      </div>
    </footer>
  </main>

  <script src="/js/language.js" defer></script>
  <script src="/js/UI.js" defer></script>
  <script src="/js/post-static.js" defer></script>
  <script src="/js/sw-register.js" defer></script>
  <!-- contorno que segue o cursor nos cards de "leia tambem" (mesmo do blog) -->
  <script src="/js/blog-fx.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>
  <script src="/js/modal-fx.js" defer></script>
</body>
</html>
`;
}

/* =========================================================
   Geracao de WebP
   ========================================================= */

async function ensureWebp(srcRel) {
  if (!sharp || !srcRel) return;
  // Imagem hospedada fora (Storage do Supabase, CDN): nao esta no disco
  // do build e o Vercel nao publica nada por cima dela. Pula.
  if (isRemoteUrl(srcRel)) return;
  if (!/\.(jpe?g|png)$/i.test(srcRel)) return;
  const srcAbs = path.join(ROOT, srcRel.replace(/^\//, ''));
  const dstAbs = srcAbs.replace(/\.(jpe?g|png)$/i, '.webp');
  if (!fs.existsSync(srcAbs)) return;
  if (fs.existsSync(dstAbs)) {
    const s1 = fs.statSync(srcAbs).mtimeMs;
    const s2 = fs.statSync(dstAbs).mtimeMs;
    if (s2 >= s1) return; // ja atualizado
  }
  try {
    await sharp(srcAbs).webp({ quality: 82 }).toFile(dstAbs);
    return dstAbs;
  } catch (e) {
    console.warn(`[build-posts] falha gerando webp para ${srcRel}:`, e.message);
  }
}

async function generateWebpForPosts(posts) {
  if (!sharp) {
    console.log('[build-posts] sharp nao instalado - pulando geracao de .webp');
    return 0;
  }
  const seen = new Set();
  let count = 0;
  for (const p of posts) {
    const srcs = [p.cover, ...(p.images || []).map(i => i.src)].filter(Boolean);
    for (const src of srcs) {
      if (seen.has(src)) continue;
      seen.add(src);
      const r = await ensureWebp(src);
      if (r) count++;
    }
  }
  return count;
}

/* =========================================================
   sitemap.xml
   ========================================================= */

function buildSitemap(posts) {
  // lastmod da home/blog = post mais recente, nao a data do build:
  // build sem mudanca de conteudo nao suja o git diff. Sem posts, omite.
  const latest = posts.length
    ? dateOnly(posts.reduce((max, p) =>
        new Date(p.updated) > new Date(max) ? p.updated : max, posts[0].updated))
    : '';
  const lastmodTag = latest ? `\n    <lastmod>${latest}</lastmod>` : '';
  const entries = [];

  entries.push(`<url>
    <loc>${SITE_URL}/</loc>${lastmodTag}
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

  entries.push(`<url>
    <loc>${SITE_URL}/blog.html</loc>${lastmodTag}
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);

  /* Paginas estaticas do site — o deploy sobrescreve sitemap.xml; se so
     listarmos home/blog/posts, sumiria /sobre e /projetos do Google. */
  const staticPages = [
    { loc: '/sobre.html', priority: '0.8' },
    { loc: '/en/about.html', priority: '0.7' },
  ];
  for (const page of staticPages) {
    const abs = path.join(ROOT, page.loc.replace(/^\//, '').replace(/\//g, path.sep));
    if (!fs.existsSync(abs)) continue;
    entries.push(`<url>
    <loc>${SITE_URL}${page.loc}</loc>${lastmodTag}
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  for (const dir of ['projetos', path.join('en', 'projects')]) {
    const absDir = path.join(ROOT, dir);
    if (!fs.existsSync(absDir)) continue;
    for (const f of fs.readdirSync(absDir).filter(x => x.endsWith('.html')).sort()) {
      const loc = `/${dir.replace(/\\/g, '/')}/${f}`;
      entries.push(`<url>
    <loc>${SITE_URL}${loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }
  }

  for (const p of posts) {
    const url = `${SITE_URL}/posts/${p.slug}.html`;
    const images = [];
    if (p.cover) {
      images.push({ src: p.cover, caption: p.coverAlt, title: p.title });
    }
    (p.images || []).forEach(img => {
      images.push({ src: img.src, caption: img.caption || img.alt, title: img.alt || p.title });
    });
    const imageTags = images.map(img => `    <image:image>
      <image:loc>${escapeXml(absoluteUrl(img.src))}</image:loc>
      <image:caption>${escapeXml(img.caption || '')}</image:caption>
      <image:title>${escapeXml(img.title || '')}</image:title>
    </image:image>`).join('\n');

    entries.push(`<url>
    <loc>${url}</loc>
    <lastmod>${dateOnly(p.updated)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
${imageTags}
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${entries.join('\n  ')}
</urlset>
`;
}

/* sitemap-imagens.xml — capas e galerias dos posts (automatico no deploy).
   Covers nao viram <img> no HTML do post (so OG/JSON-LD), entao o crawl
   de <img> do build-discovery nao as pega; aqui entram direto. */
function buildImageSitemap(posts) {
  const blocks = [];
  for (const p of posts) {
    const images = [];
    if (p.cover) images.push({ src: p.cover, title: p.title, caption: p.coverAlt || p.title });
    (p.images || []).forEach(img => {
      images.push({
        src: img.src,
        title: img.alt || p.title,
        caption: img.caption || img.alt || p.title,
      });
    });
    if (!images.length) continue;
    const imageTags = images.map(img => `    <image:image>
      <image:loc>${escapeXml(absoluteUrl(img.src))}</image:loc>
      <image:title>${escapeXml(img.title || '')}</image:title>
      <image:caption>${escapeXml(img.caption || '')}</image:caption>
    </image:image>`).join('\n');
    blocks.push(`  <url>
    <loc>${SITE_URL}/posts/${p.slug}.html</loc>
${imageTags}
  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blocks.join('\n')}
</urlset>
`;
}

function rfc822(dateStr) {
  const d = new Date(dateStr || Date.now());
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

function cdata(text) {
  return `<![CDATA[${String(text || '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

/* feed.xml — RSS atualizado a cada publish (antes so via build:discovery local) */
function buildFeed(posts) {
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0] ? sorted[0].updated || sorted[0].date : new Date().toISOString();
  const items = sorted.map(p => {
    const url = `${SITE_URL}/posts/${p.slug}.html`;
    const cats = [p.category, ...(p.tags || [])]
      .filter(Boolean)
      .map(c => `      <category>${escapeXml(c)}</category>`)
      .join('\n');
    const enclosure = p.cover
      ? `\n      <enclosure url="${escapeXml(absoluteUrl(p.cover))}" type="image/jpeg" length="0"/>`
      : '';
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <dc:creator>${escapeXml(AUTHOR.name)}</dc:creator>
${cats}${cats ? '\n' : ''}      <description>${cdata(p.excerpt || p.description || p.title)}</description>${enclosure}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(AUTHOR.name)}</title>
    <link>${SITE_URL}/blog.html</link>
    <description>${escapeXml('Eventos, projetos e bastidores de Bernardo Iannini, desenvolvedor Full Stack e AI Designer em Belo Horizonte.')}</description>
    <language>pt-BR</language>
    <managingEditor>${escapeXml(AUTHOR.email)} (${escapeXml(AUTHOR.name)})</managingEditor>
    <webMaster>${escapeXml(AUTHOR.email)} (${escapeXml(AUTHOR.name)})</webMaster>
    <lastBuildDate>${rfc822(latest)}</lastBuildDate>
    <generator>scripts/build-posts.js</generator>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}${items ? '\n' : ''}  </channel>
</rss>
`;
}

/* =========================================================
   blog.html - listagem estatica
   ========================================================= */

function planLayout(total) {
  if (total <= 0) return [];
  if (total === 1) return ['blog-post-card--featured'];
  if (total === 2) return ['blog-post-card--featured', 'blog-post-card--tall'];
  if (total === 3) return ['blog-post-card--featured', 'blog-post-card--tall', 'blog-post-card--full'];
  if (total === 4) return ['blog-post-card--featured', 'blog-post-card--tall', 'blog-post-card--wide', 'blog-post-card--wide'];
  if (total === 5) return ['blog-post-card--featured', 'blog-post-card--tall', 'blog-post-card--wide', 'blog-post-card--wide', 'blog-post-card--full'];
  const out = ['blog-post-card--featured', 'blog-post-card--tall', 'blog-post-card--wide', 'blog-post-card--wide'];
  let remaining = total - 4;
  while (remaining > 0) {
    if (remaining >= 3) { out.push('blog-post-card--normal','blog-post-card--normal','blog-post-card--normal'); remaining -= 3; }
    else if (remaining === 2) { out.push('blog-post-card--wide','blog-post-card--wide'); remaining = 0; }
    else { out.push('blog-post-card--full'); remaining = 0; }
  }
  return out;
}

function buildBentoHtml(posts) {
  // Ordenar: featured primeiro, depois por data DESC
  const sorted = posts.slice().sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date) - new Date(a.date);
  });
  const plan = planLayout(sorted.length);
  return sorted.map((p, i) => {
    const url = `/posts/${p.slug}.html`;
    const layout = plan[i] || 'blog-post-card--normal';
    const cover = p.cover || '';
    const readMin = readTimeMin(p.content);
    return `<article class="blog-post-card ${layout}${cover ? '' : ' blog-post-card--no-image'}"
             data-id="${escapeAttr(p.id)}" data-slug="${escapeAttr(p.slug)}"
             data-action="open" data-href="${url}"
             data-cover="${escapeAttr(toWebp(cover))}"
             data-category="${escapeAttr(p.category)}"
             data-tags="${escapeAttr((p.tags || []).join(','))}"
             data-date="${escapeAttr(isoDate(p.date))}"
             data-readtime="${readMin}"
             data-featured="${p.featured ? '1' : '0'}">
      ${cover ? `<div class="blog-post-cover"><img src="${escapeAttr(toWebp(cover))}" alt="${escapeAttr(p.coverAlt || p.title)}" loading="lazy" width="800" height="500"/></div>` : '<div class="blog-post-cover"></div>'}
      ${p.featured ? `<span class="blog-post-featured-badge">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 9.2l-5 4.6L17.4 21 12 17.7 6.6 21 8 13.8 3 9.2l6.6-.6z"/></svg>
        <span data-i18n="blog.featured.badge">Destaque</span>
      </span>` : ''}
      <div class="blog-post-content">
        <div class="blog-post-meta">
          <span class="blog-post-category">${escapeHtml(p.category)}</span>
          <span class="blog-post-date">${formatDatePt(p.date)}</span>
          <span class="blog-post-readtime">${readMin} min de leitura</span>
        </div>
        <h3 class="blog-post-title"><a href="${url}">${escapeHtml(p.title)}</a></h3>
        ${p.subtitle ? `<p class="blog-post-excerpt">${escapeHtml(p.subtitle)}</p>` : ''}
        ${p.tags?.length ? `<div class="blog-post-tags">${p.tags.slice(0, 3).map(t => `<span class="blog-post-tag">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      </div>
    </article>`;
  }).join('\n      ');
}

function buildFeaturedHtml(posts) {
  const featured = posts.find(p => p.featured) || posts.slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  if (!featured) {
    return `<div class="bid-featured-inner bid-featured-inner--empty">
      <div class="bid-featured-content">
        <p class="bid-kicker" data-i18n="blog.featured.spotlight">Spotlight</p>
        <h3 class="bid-featured-title" data-i18n="blog.featured.empty">O primeiro post esta chegando.</h3>
      </div>
    </div>`;
  }
  const url = `/posts/${featured.slug}.html`;
  const readMin = readTimeMin(featured.content);
  const cover = featured.cover || '';
  return `<a class="bid-featured-inner" href="${url}" data-id="${escapeAttr(featured.id)}" data-cover="${escapeAttr(toWebp(cover))}">
      ${cover ? `<div class="bid-featured-img"><img src="${escapeAttr(toWebp(cover))}" alt="${escapeAttr(featured.coverAlt || featured.title)}" loading="lazy" width="1200" height="630"/></div>` : '<div class="bid-featured-img bid-featured-img--gradient"></div>'}
      <div class="bid-featured-noise" aria-hidden="true"></div>
      <div class="bid-featured-content">
        <span class="bid-featured-badge">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 9.2l-5 4.6L17.4 21 12 17.7 6.6 21 8 13.8 3 9.2l6.6-.6z"/></svg>
          <span data-i18n="${featured.featured ? 'blog.featured.spotlight' : 'blog.featured.latest'}">${featured.featured ? 'Spotlight' : 'Latest'}</span>
        </span>
        <h3 class="bid-featured-title">${escapeHtml(featured.title)}</h3>
        <div class="bid-featured-meta">
          <span>${formatDatePt(featured.date)}</span>
          <span>&middot;</span>
          <span>${readMin} min</span>
          <span>&middot;</span>
          <span>${escapeHtml(featured.category)}</span>
        </div>
      </div>
    </a>`;
}

function buildFiltersHtml(posts) {
  const cats = [...new Set(posts.map(p => p.category).filter(Boolean))];
  const chips = [
    `<button type="button" class="blog-chip blog-chip--active" data-filter="all" data-i18n="blog.filters.all">Todos</button>`,
    ...cats.map(c => `<button type="button" class="blog-chip" data-filter="${escapeAttr(c)}">${escapeHtml(c)}</button>`)
  ];
  return chips.join('\n        ');
}

function buildTagCloudHtml(posts) {
  const tagFreq = {};
  posts.forEach(p => (p.tags || []).forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
  const sorted = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (!sorted.length) return '<p style="color:var(--text-hint);font-size:12px;">Nenhuma tag ainda.</p>';
  const max = sorted[0][1];
  return sorted.map(([tag, count]) => {
    const big = count / max > .6 ? 'bid-tag--big' : '';
    return `<span class="bid-tag ${big}" data-tag="${escapeAttr(tag)}">#${escapeHtml(tag)}</span>`;
  }).join('\n          ');
}

function buildStatsHtml(posts) {
  const totalReadTime = posts.reduce((acc, p) => acc + readTimeMin(p.content), 0);
  const cats = new Set(posts.map(p => p.category).filter(Boolean));
  return {
    posts: posts.length,
    categories: cats.size,
    readtime: totalReadTime,
  };
}

function buildBlogJsonLd(posts) {
  const items = posts.slice(0, 20).map(p => ({
    '@type': 'BlogPosting',
    headline: p.title,
    url: `${SITE_URL}/posts/${p.slug}.html`,
    datePublished: isoDate(p.date),
    dateModified: isoDate(p.updated),
    image: p.cover ? absoluteUrl(p.cover) : `${SITE_URL}/img/eufoto1.png`,
    author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog - Bernardo Iannini',
    description: 'Eventos, projetos e bastidores',
    url: SITE_URL + '/blog.html',
    inLanguage: 'pt-BR',
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
      alternateName: AUTHOR.alternateName,
      url: AUTHOR.url,
      image: AUTHOR.image,
      sameAs: AUTHOR.sameAs,
    },
    publisher: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    blogPost: items,
  };
}

function replaceBetween(html, startMarker, endMarker, replacement) {
  const reStart = startMarker.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const reEnd   = endMarker.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp(`(${reStart})[\\s\\S]*?(${reEnd})`, 'g');
  if (!re.test(html)) {
    console.warn(`[build-posts] marcador nao encontrado: ${startMarker}`);
    return html;
  }
  // Funcao de substituicao: conteudo com $1/$&/$' entra literal,
  // sem ser interpretado como referencia de captura.
  return html.replace(re, (m, start, end) => `${start}\n${replacement}\n${end}`);
}

function updateBlogHtml(posts) {
  const blogPath = path.join(ROOT, 'blog.html');
  if (!fs.existsSync(blogPath)) {
    console.warn('[build-posts] blog.html nao encontrado, pulando');
    return;
  }
  let html = fs.readFileSync(blogPath, 'utf8');
  const stats = buildStatsHtml(posts);
  const jsonLd = buildBlogJsonLd(posts);

  html = replaceBetween(html, '<!--BUILD:POSTS_BENTO-->', '<!--/BUILD:POSTS_BENTO-->', buildBentoHtml(posts));
  html = replaceBetween(html, '<!--BUILD:FEATURED-->',    '<!--/BUILD:FEATURED-->',    buildFeaturedHtml(posts));
  html = replaceBetween(html, '<!--BUILD:FILTERS-->',     '<!--/BUILD:FILTERS-->',     buildFiltersHtml(posts));
  html = replaceBetween(html, '<!--BUILD:TAG_CLOUD-->',   '<!--/BUILD:TAG_CLOUD-->',   buildTagCloudHtml(posts));
  html = replaceBetween(html, '<!--BUILD:JSONLD-->',      '<!--/BUILD:JSONLD-->', `<script type="application/ld+json">\n${jsonForScript(jsonLd, 2)}\n</script>`);

  // Stats: grava o valor REAL tanto no texto quanto em data-count.
  // data-count vira a fonte de verdade que o blog.js anima (ele NAO
  // recalcula mais no cliente — evita zerar quando a lista esta stale).
  const setStat = (h, id, val) => h.replace(
    new RegExp(`<span class="bid-stat-value" id="${id}"[^>]*>[^<]*</span>`),
    `<span class="bid-stat-value" id="${id}" data-count="${val}">${val}</span>`
  );
  html = setStat(html, 'stat-posts', stats.posts);
  html = setStat(html, 'stat-categories', stats.categories);
  html = setStat(html, 'stat-readtime', stats.readtime);

  // window.BI_POSTS injetado pra blog.js usar
  const liteList = posts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    cover: p.cover,
    coverAlt: p.coverAlt,
    tags: p.tags,
    category: p.category,
    author: p.author,
    status: p.status,
    featured: p.featured,
    createdAt: p.date,
    updatedAt: p.updated,
    readTimeMin: readTimeMin(p.content),
    url: `/posts/${p.slug}.html`,
    excerpt: stripMd(p.content).slice(0, 200),
  }));
  html = replaceBetween(html, '<!--BUILD:WINDOW_POSTS-->', '<!--/BUILD:WINDOW_POSTS-->',
    `<script>window.BI_POSTS=${jsonForScript(liteList)};</script>`);

  fs.writeFileSync(blogPath, html, 'utf8');
}

/* =========================================================
   data/posts.json + js/blog-seed.js (compat)
   ========================================================= */

function writePostsJson(posts) {
  const liteList = posts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    cover: p.cover,
    coverAlt: p.coverAlt,
    tags: p.tags,
    category: p.category,
    author: p.author,
    status: p.status,
    featured: p.featured,
    createdAt: p.date,
    updatedAt: p.updated,
    readTimeMin: readTimeMin(p.content),
    url: `/posts/${p.slug}.html`,
    excerpt: stripMd(p.content).slice(0, 200),
  }));
  fs.writeFileSync(path.join(ROOT, 'data', 'posts.json'), JSON.stringify(liteList, null, 2), 'utf8');
}

function writeBlogSeed(posts) {
  // Mantem compat com blog-seed.js antigo (admin usa pra rascunho local)
  const seed = posts.map(p => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    slug: p.slug,
    cover: p.cover,
    tags: p.tags,
    category: p.category,
    author: p.author,
    status: p.status,
    featured: p.featured,
    createdAt: p.date,
    updatedAt: p.updated,
    content: p.content,
  }));
  const out = `'use strict';
// AUTO-GERADO por scripts/build-posts.js - nao edite manualmente.
// Fontes: tabela posts do Supabase (painel) + data/posts/*.md
window.BI_SEED_POSTS = ${JSON.stringify(seed, null, 2)};
`;
  fs.writeFileSync(path.join(ROOT, 'js', 'blog-seed.js'), out, 'utf8');
}

/* =========================================================
   Merge das duas fontes
   ========================================================= */

/* Junta .md local + banco. Em conflito de slug o SUPABASE VENCE: ele e o
   editor ao vivo, o .md e historico/fallback. Ordena por data desc e
   mantem o filtro de publicados. */
function mergePosts(localPosts, remotePosts) {
  const bySlug = new Map();
  for (const p of localPosts)  bySlug.set(p.slug, p);
  for (const p of remotePosts) bySlug.set(p.slug, p);
  return [...bySlug.values()]
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/* =========================================================
   MAIN
   ========================================================= */

async function main() {
  const startedAt = Date.now();
  if (!fs.existsSync(POSTS_OUT)) fs.mkdirSync(POSTS_OUT, { recursive: true });
  if (!fs.existsSync(POSTS_SRC)) fs.mkdirSync(POSTS_SRC, { recursive: true });

  // 0) Fontes: .md do repo + posts publicados no Supabase.
  const localPosts = loadPosts();
  const remote     = await fetchSupabasePosts();
  const posts = mergePosts(localPosts, remote.posts);

  /* MODO DEGRADADO: o banco nao respondeu (DNS, timeout, chave rotacionada,
     RLS mexido). Como o banco e a fonte principal, seguir em frente aqui
     apagaria do site todo post que veio dele: a limpeza de orfaos derrubaria
     os HTML do checkout e sitemap/posts.json/blog.html seriam reescritos
     vazios, com exit 0 e ninguem percebendo. Entao: gera o que der dos .md
     e NAO destroi nada que ja esta publicado. */
  const degraded = !remote.ok;
  if (degraded) {
    console.warn('[build-posts] MODO DEGRADADO: o banco nao respondeu. Preservando as paginas ja publicadas');
    console.warn('             (nao vou remover orfaos nem reescrever sitemap, posts.json, seed e blog.html).');
  }

  const fromSupabase = posts.filter(p => p.source === 'supabase').length;
  const fromMarkdown = posts.length - fromSupabase;
  // Quantos .md perderam o dedup para um post do banco com o mesmo slug.
  const overridden = localPosts.filter(p =>
    remote.posts.some(r => r.slug === p.slug)).length;

  if (!posts.length && !degraded) {
    console.warn('[build-posts] Nenhum post publicado (data/posts/*.md vazio e nada publicado no Supabase)');
  }

  // 1) Gerar /posts/<slug>.html
  let writtenPosts = 0;
  for (const post of posts) {
    const related = pickRelated(post, posts, 3);
    const html = postPageHtml(post, related);
    const dst = path.join(POSTS_OUT, `${post.slug}.html`);
    fs.writeFileSync(dst, html, 'utf8');
    writtenPosts++;
  }

  // 1b) Remover HTML orfaos: post deletado ou despublicado nao pode
  //     continuar no ar (a Vercel publica o diretorio inteiro).
  //     Em modo degradado NAO limpa: sem saber o que o banco tem, todo
  //     post publicado pareceria orfao.
  const validFiles = new Set(posts.map(p => `${p.slug}.html`));
  let removedOrphans = 0;
  if (!degraded) {
    for (const f of fs.readdirSync(POSTS_OUT).filter(f => f.endsWith('.html'))) {
      if (!validFiles.has(f)) {
        fs.unlinkSync(path.join(POSTS_OUT, f));
        removedOrphans++;
      }
    }
  }

  // 2 a 4) Indices (sitemap, posts.json, seed, blog.html). Todos derivam da
  //        lista completa, entao em modo degradado ficam como estao: melhor
  //        um indice do ultimo deploy bom que um indice vazio.
  if (!degraded) {
    const sitemap = buildSitemap(posts);
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
    fs.writeFileSync(path.join(ROOT, 'sitemap-imagens.xml'), buildImageSitemap(posts), 'utf8');
    fs.writeFileSync(path.join(ROOT, 'feed.xml'), buildFeed(posts), 'utf8');
    writePostsJson(posts);
    writeBlogSeed(posts);
    updateBlogHtml(posts);
  }

  // 5) WebP
  const webpCount = await generateWebpForPosts(posts);

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2);
  console.log('');
  console.log('================================================');
  console.log('  build-posts.js -- resumo');
  console.log('================================================');
  console.log(`  posts gerados:    ${writtenPosts}`);
  console.log(`    do supabase:    ${fromSupabase}`);
  console.log(`    dos .md:        ${fromMarkdown}`);
  if (overridden > 0) {
    console.log(`    .md sobrescritos pelo banco (mesmo slug): ${overridden}`);
  }
  console.log(`  orfaos removidos: ${degraded ? 'pulado (modo degradado)' : removedOrphans}`);
  console.log(`  imagens .webp:    ${webpCount}`);
  if (degraded) {
    console.log(`  sitemap:          PRESERVADO (banco fora do ar)`);
    console.log(`  posts json:       PRESERVADO (banco fora do ar)`);
    console.log(`  blog.html:        PRESERVADO (banco fora do ar)`);
  } else {
    console.log(`  sitemap:          ${path.relative(ROOT, path.join(ROOT, 'sitemap.xml'))}`);
    console.log(`  sitemap-imagens:  ${path.relative(ROOT, path.join(ROOT, 'sitemap-imagens.xml'))}`);
    console.log(`  feed.xml:         ${path.relative(ROOT, path.join(ROOT, 'feed.xml'))}`);
    console.log(`  posts json:       ${path.relative(ROOT, path.join(ROOT, 'data', 'posts.json'))}`);
    console.log(`  blog.html:        atualizado`);
  }
  console.log(`  tempo:            ${elapsed}s`);
  console.log('================================================');
  if (degraded) {
    console.log('');
    console.log('  ATENCAO: build rodou em MODO DEGRADADO. O site continua com o');
    console.log('  conteudo do ultimo deploy bom. Confira o Supabase e refaca o deploy.');
  }
}

/* Rodou direto (`node scripts/build-posts.js`): builda.
   Foi importado (require): so expoe as funcoes, sem efeito colateral. */
if (require.main === module) {
  main().catch(err => {
    console.error('[build-posts] erro fatal:', err);
    process.exit(1);
  });
}

module.exports = {
  markdownToHtml, stripMd, safeUrl, isExternalUrl, isRemoteUrl,
  absoluteUrl, toWebp, loadPosts, mergePosts, main,
};
