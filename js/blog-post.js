'use strict';

/* =========================================================
   POST PAGE — Página individual de um post (?slug=… ou ?id=…)

   Funcionalidades:
   - SEO dinâmico (title, meta description, OpenGraph, Twitter Cards,
     canonical, JSON-LD BlogPosting)
   - Markdown -> HTML com mesmos shortcodes do blog.js
     (:::cards / :::card / :::info / :::success / :::warn / :::danger)
   - Barra de progresso de leitura
   - View counter, related posts (score por tags + categoria)
   - Compartilhar (Twitter / LinkedIn / WhatsApp / copy link)
   ========================================================= */

const STORAGE_KEY   = 'bi_blog_posts';
const STORAGE_VIEWS = 'bi_blog_views';
const SITE_URL      = 'https://bernardoiannini.com';

/* ---------- Storage ----------
   Se localStorage estiver vazio (primeira visita / link compartilhado),
   semeia com os posts default vindos de js/blog-seed.js. Isso garante
   que URLs diretas tipo /post.html?slug=… sempre tenham conteúdo. */
const loadPosts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    const seed = (typeof window !== 'undefined' && window.BI_SEED_POSTS) || [];
    if (seed.length) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch {}
    }
    return seed;
  } catch {
    return (typeof window !== 'undefined' && window.BI_SEED_POSTS) || [];
  }
};

const loadViews = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_VIEWS) || '{}'); }
  catch { return {}; }
};

const saveViews = (v) => localStorage.setItem(STORAGE_VIEWS, JSON.stringify(v));

const incrementViews = (id) => {
  const views = loadViews();
  views[id] = (views[id] || 0) + 1;
  saveViews(views);
  return views[id];
};

/* ---------- Utilities ---------- */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const formatDateISO = (iso) => new Date(iso).toISOString();

const estimateReadTime = (content) =>
  Math.max(1, Math.ceil(((content || '').trim().split(/\s+/).length) / 200));

const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const stripMd = (md) => String(md || '')
  .replace(/^:::.+?:::$/gms, '')
  .replace(/```[\s\S]*?```/g, '')
  .replace(/[#>*_`~\-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const absoluteUrl = (path) => {
  if (!path) return '';
  if (/^https?:/i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/* ---------- Ícones (mesmos do design system) ---------- */
const POST_ICONS = {
  rocket:  '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  code:    '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  bolt:    '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  chart:   '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  check:   '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  clock:   '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  flag:    '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  heart:   '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  star:    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  target:  '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  shield:  '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  zap:     '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  warn:    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  danger:  '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
};

const svgIcon = (name) => {
  const p = POST_ICONS[name] || POST_ICONS.star;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
};

/* ---------- Shortcodes (mesma sintaxe do admin) ---------- */
const parseShortcodeAttrs = (raw) => {
  const attrs = {};
  if (!raw) return attrs;
  const re = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m;
  while ((m = re.exec(raw))) attrs[m[1]] = m[2] || m[3] || m[4] || '';
  return attrs;
};

const inlineMd = (md) => {
  let html = escapeHtml(md);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return html.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
};

const renderCard = (attrs, content) => {
  const icon  = attrs.icon  ? `<div class="post-card-icon">${svgIcon(attrs.icon)}</div>` : '';
  const title = attrs.title ? `<h4 class="post-card-title">${escapeHtml(attrs.title)}</h4>` : '';
  const body  = content     ? `<div class="post-card-body">${inlineMd(content)}</div>` : '';
  return `<!--HTMLBLOCK--><div class="post-card">${icon}<div class="post-card-content">${title}${body}</div></div><!--/HTMLBLOCK-->`;
};

const renderCallout = (type, content, iconName) =>
  `<!--HTMLBLOCK--><div class="post-callout post-callout--${type}"><div class="post-callout-icon">${svgIcon(iconName)}</div><div class="post-callout-body">${inlineMd(content)}</div></div><!--/HTMLBLOCK-->`;

const processShortcodes = (md) => {
  md = md.replace(/^:::cards\s*\n([\s\S]*?)^:::$/gm, (_, inner) => {
    const cards = [];
    inner.replace(/^:::card\s*(.*?)\n([\s\S]*?)^:::$/gm, (_m, attrs, content) => {
      cards.push({ attrs: parseShortcodeAttrs(attrs), content: content.trim() });
      return '';
    });
    if (!cards.length) return '';
    const html = cards.map(c => renderCard(c.attrs, c.content)).join('');
    return `<!--GRID_START-->${html}<!--GRID_END-->`;
  });
  md = md.replace(/^:::card\s*(.*?)\n([\s\S]*?)^:::$/gm, (_, attrs, content) =>
    renderCard(parseShortcodeAttrs(attrs), content.trim())
  );
  const calloutIcons = { info: 'info', success: 'check', warn: 'warn', danger: 'danger' };
  md = md.replace(/^:::(info|success|warn|danger)\s*\n([\s\S]*?)^:::$/gm, (_, type, content) =>
    renderCallout(type, content.trim(), calloutIcons[type])
  );
  return md;
};

/* ---------- Markdown -> HTML ---------- */
function markdownToHtml(md) {
  if (!md) return '';

  md = processShortcodes(md);

  const blocks = [];
  md = md.replace(/<!--HTMLBLOCK-->([\s\S]*?)<!--\/HTMLBLOCK-->/g, (_, b) => {
    blocks.push(b);
    return `\x00HTMLBLOCK_${blocks.length - 1}\x00`;
  });

  let html = escapeHtml(md);

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="lang-${lang || 'text'}">${code.trim()}</code></pre>`
  );

  // HR
  html = html.replace(/^---+$/gm, '<hr/>');

  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy"/>');
  html = html.replace(/(?:^- .+(?:\n|$))+/gm, (m) =>
    '<ul>' + m.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('') + '</ul>'
  );
  html = html.replace(/(?:^\d+\. .+(?:\n|$))+/gm, (m) =>
    '<ol>' + m.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('') + '</ol>'
  );

  html = html.split(/\n{2,}/).map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h\d|ul|ol|pre|blockquote|img|hr)/i.test(block)) return block;
    if (/^\x00HTMLBLOCK_\d+\x00$/.test(block)) return block;
    return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  html = html.replace(/\x00HTMLBLOCK_(\d+)\x00/g, (_, i) => blocks[i] || '');
  html = html.replace(/<!--GRID_START-->/g, '<div class="post-cards-grid">')
             .replace(/<!--GRID_END-->/g, '</div>');

  return html;
}

/* ---------- SEO ---------- */
function setMeta(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el && value) el.setAttribute(attr, value);
}

function injectSEO(post) {
  const url = `${SITE_URL}/post.html?slug=${encodeURIComponent(post.slug || post.id)}`;
  const desc = (post.subtitle || stripMd(post.content)).slice(0, 158).trim();
  const image = absoluteUrl(post.cover) || `${SITE_URL}/favicon_192px.png`;
  const title = `${post.title} · Blog · Bernardo Iannini`;

  document.title = title;

  setMeta('meta[name="description"]', 'content', desc);
  setMeta('link[rel="canonical"]',    'href',    url);

  setMeta('meta[property="og:title"]',       'content', post.title);
  setMeta('meta[property="og:description"]', 'content', desc);
  setMeta('meta[property="og:image"]',       'content', image);
  setMeta('meta[property="og:url"]',         'content', url);
  setMeta('meta[property="og:type"]',        'content', 'article');

  setMeta('meta[name="twitter:title"]',       'content', post.title);
  setMeta('meta[name="twitter:description"]', 'content', desc);
  setMeta('meta[name="twitter:image"]',       'content', image);

  // JSON-LD BlogPosting (Google Rich Results)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: desc,
    image: image,
    datePublished: formatDateISO(post.createdAt),
    dateModified:  formatDateISO(post.updatedAt || post.createdAt),
    author: {
      '@type': 'Person',
      name: post.author || 'Bernardo Iannini',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Bernardo Iannini',
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: (post.tags || []).join(', '),
    articleSection: post.category || 'Blog',
    inLanguage: 'pt-BR',
    url,
  };
  const ldEl = document.getElementById('postJsonLd');
  if (ldEl) ldEl.textContent = JSON.stringify(jsonLd);
}

/* ---------- Related posts ---------- */
function renderRelated(currentPost) {
  const all = loadPosts().filter(p => p.status === 'published' && p.id !== currentPost.id);
  const scored = all.map(p => {
    let score = 0;
    if (p.category === currentPost.category) score += 3;
    (p.tags || []).forEach(t => {
      if ((currentPost.tags || []).includes(t)) score += 2;
    });
    return { p, score };
  }).filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!scored.length) {
    // Fallback: 3 mais recentes (exceto o atual)
    const latest = all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    if (!latest.length) return '';
    return relatedSection(latest);
  }
  return relatedSection(scored.map(s => s.p));
}

function relatedSection(posts) {
  return `
    <section class="post-related">
      <p class="kicker">Continue lendo</p>
      <h2 class="post-related-title">Posts relacionados</h2>
      <div class="post-related-grid">
        ${posts.map(p => `
          <a class="post-related-card" href="?slug=${encodeURIComponent(p.slug || p.id)}" data-slug="${escapeHtml(p.slug || p.id)}">
            ${p.cover ? `
              <div class="post-related-card-cover">
                <img src="${escapeHtml(p.cover)}" alt="${escapeHtml(p.title)}" loading="lazy"/>
              </div>
            ` : '<div class="post-related-card-cover post-related-card-cover--empty"></div>'}
            <div class="post-related-card-body">
              ${p.category ? `<span class="post-related-card-cat">${escapeHtml(p.category)}</span>` : ''}
              <h3 class="post-related-card-title">${escapeHtml(p.title)}</h3>
              <p class="post-related-card-meta">
                <span>${formatDate(p.createdAt)}</span>
                <span class="post-dot" aria-hidden="true"></span>
                <span>${estimateReadTime(p.content)} min</span>
              </p>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

/* ---------- Share ---------- */
function copyToClipboard() {
  navigator.clipboard?.writeText(location.href).then(() => {
    const btn = document.getElementById('copyLinkBtn');
    if (!btn) return;
    const original = btn.dataset.original || btn.innerHTML;
    btn.dataset.original = original;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.classList.add('is-copied');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('is-copied');
    }, 1400);
  });
}
window.copyToClipboard = copyToClipboard;

/* ---------- Not found ---------- */
function renderNotFound() {
  document.title = 'Post não encontrado · Bernardo Iannini';
  document.getElementById('postPage').innerHTML = `
    <div class="post-notfound">
      <div class="post-notfound-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
        </svg>
      </div>
      <h1>Post não encontrado</h1>
      <p>O link pode estar incorreto, ou o post pode ter sido removido.</p>
      <a href="/blog.html" class="post-notfound-cta">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Voltar para o blog
      </a>
    </div>
  `;
}

/* ---------- Render ---------- */
function render(post) {
  injectSEO(post);

  const views    = incrementViews(post.id);
  const readTime = estimateReadTime(post.content);
  const shareText = encodeURIComponent(`${post.title} — Bernardo Iannini`);
  const shareUrl  = encodeURIComponent(location.href);

  document.getElementById('postPage').innerHTML = `
    <section class="post-page-hero">
      <div class="post-page-eyebrow">
        ${post.category ? `<span class="post-page-eyebrow-cat">${escapeHtml(post.category)}</span>` : ''}
        <span class="post-dot" aria-hidden="true"></span>
        <time datetime="${formatDateISO(post.createdAt)}" itemprop="datePublished">${formatDate(post.createdAt)}</time>
        <span class="post-dot" aria-hidden="true"></span>
        <span class="post-page-eyebrow-read">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/>
          </svg>
          ${readTime} min de leitura
        </span>
      </div>

      <h1 class="post-page-title" itemprop="headline">${escapeHtml(post.title)}</h1>
      ${post.subtitle ? `<p class="post-page-subtitle" itemprop="description">${escapeHtml(post.subtitle)}</p>` : ''}

      <div class="post-page-byline">
        <div class="post-page-byline-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
          <img src="img/eufoto1.webp" alt="${escapeHtml(post.author || 'Bernardo Iannini')}" loading="lazy"/>
          <div>
            <span class="post-page-byline-name" itemprop="name">${escapeHtml(post.author || 'Bernardo Iannini')}</span>
            <span class="post-page-byline-role">Full Stack Developer · AI Designer</span>
          </div>
        </div>
        <div class="post-page-byline-stats">
          <span title="Visualizações">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            ${views}
          </span>
        </div>
      </div>
    </section>

    ${post.cover ? `
      <figure class="post-page-cover" itemprop="image">
        <img src="${escapeHtml(post.cover)}" alt="${escapeHtml(post.title)}" loading="eager"/>
      </figure>
    ` : '<div class="post-page-cover-spacer"></div>'}

    <div class="post-page-body" itemprop="articleBody">
      ${markdownToHtml(post.content)}
    </div>

    ${post.tags?.length ? `
      <div class="post-page-tags">
        ${post.tags.map(t => `<a href="/blog.html?q=${encodeURIComponent(t)}" class="post-page-tag">#${escapeHtml(t)}</a>`).join('')}
      </div>
    ` : ''}

    <div class="post-share-bar">
      <span class="post-share-label">Compartilhar este post</span>
      <div class="post-share-buttons">
        <a class="post-share-btn" href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" rel="noopener" aria-label="Compartilhar no Twitter">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 5.92a8.5 8.5 0 0 1-2.36.65 4.13 4.13 0 0 0 1.8-2.27 8.22 8.22 0 0 1-2.61 1 4.1 4.1 0 0 0-6.98 3.74A11.65 11.65 0 0 1 3.4 4.9a4.1 4.1 0 0 0 1.27 5.48 4.07 4.07 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.1 4.1 0 0 1-1.86.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.57a11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.68-6.25 11.68-11.68v-.53A8.36 8.36 0 0 0 22 5.92z"/></svg>
        </a>
        <a class="post-share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener" aria-label="Compartilhar no LinkedIn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.84-2.2 3.8-2.2 4.06 0 4.8 2.67 4.8 6.15V24h-4v-7.1c0-1.7-.03-3.9-2.4-3.9-2.4 0-2.77 1.87-2.77 3.8V24h-4V8z"/></svg>
        </a>
        <a class="post-share-btn" href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.3L2 22l4.8-1.5a11 11 0 0 0 5.2 1.3 11 11 0 0 0 8.5-18.3zm-8.5 16.7a9 9 0 0 1-4.6-1.2l-.3-.2-2.9.9.9-2.8-.2-.3a9 9 0 1 1 7.1 3.6zm5-6.7c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.2-.7.9-.8 1-.1.1-.3.2-.6 0-.3-.1-1.1-.4-2.2-1.3-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.2.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.7.1.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/></svg>
        </a>
        <button id="copyLinkBtn" class="post-share-btn" type="button" aria-label="Copiar link" onclick="copyToClipboard()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="9" y="9" width="12" height="12" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    ${renderRelated(post)}

    <div class="post-author-card">
      <div class="post-author-card-photo">
        <img src="img/eufoto1.webp" alt="Bernardo Iannini" loading="lazy"/>
      </div>
      <div class="post-author-card-info">
        <p class="kicker">Sobre o autor</p>
        <h3>Bernardo Iannini</h3>
        <p class="post-author-card-bio">19 anos · Full Stack Developer · AI Designer. Escrevo sobre o que aprendo no caminho — engenharia, IA, design e os bastidores dos projetos que construo.</p>
        <div class="post-author-card-actions">
          <a href="https://www.linkedin.com/in/bernardo-iannini" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://github.com/iannini25" target="_blank" rel="noopener">GitHub</a>
          <a href="/index.html#contato">Contato</a>
        </div>
      </div>
    </div>
  `;

  // Itemprops invisíveis pro Schema.org
  document.getElementById('postPage').setAttribute('itemid', `${SITE_URL}/post.html?slug=${encodeURIComponent(post.slug || post.id)}`);
}

/* ---------- Init ---------- */
function init() {
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  const params = new URLSearchParams(location.search);
  const ref = params.get('slug') || params.get('id') || params.get('post');

  if (!ref) { renderNotFound(); return; }

  const posts = loadPosts();
  const post = posts.find(p => (p.slug === ref || p.id === ref) && p.status === 'published');

  if (!post) { renderNotFound(); return; }

  render(post);
}

document.addEventListener('DOMContentLoaded', init);
