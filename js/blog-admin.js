'use strict';

/* =========================================================
   BLOG ADMIN — Dashboard + CRUD de posts
   ========================================================= */

/* ---------- Data layer = Supabase (window.BlogDB) ----------
   O painel lê e grava direto no Supabase. CRUD instantâneo, sem build
   nem deploy: o que você salva aqui já fica gravado no banco.
   A autenticação é checada de forma assíncrona no init().            */

async function apiGetPosts() {
  if (!window.BlogDB) throw new Error('Supabase não configurado — veja js/supabase-config.js');
  return window.BlogDB.listAll();
}

async function reloadPosts() {
  state.posts = await apiGetPosts();
}

/* Mapa { id: views } montado a partir dos posts já carregados.
   (a contagem de views agora mora na coluna `views` da tabela). */
const loadViews = () => {
  const m = {};
  (state.posts || []).forEach(p => { m[p.id] = p.views || 0; });
  return m;
};

/* Converte um data URL (imagem comprimida via canvas) num File nomeado,
   pronto pra subir no Storage do Supabase. */
function dataUrlToFile(dataUrl, baseName) {
  const [head, b64] = String(dataUrl).split(',');
  const mime = (head.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const bin = atob(b64 || '');
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const name = String(baseName || 'img').replace(/\.[^.]+$/, '') + '.' + ext;
  return new File([arr], name, { type: mime });
}

/* Mensagem amigável pra falhas de upload no Storage. */
function uploadErrorMsg(err) {
  const m = (err && err.message || String(err)).toLowerCase();
  if (m.includes('bucket') && m.includes('not found')) {
    return 'Bucket "blog-images" não existe no Supabase. Crie em Storage → New bucket (público).';
  }
  if (m.includes('row-level security') || m.includes('policy')) {
    return 'Sem permissão pra subir imagem — confira as policies do bucket blog-images.';
  }
  return err && err.message || 'Falha ao enviar imagem';
}

/* ---------- Utilities ---------- */
const uid = () => 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const slugify = (s) => String(s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 80);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const estimateReadTime = (content) =>
  Math.max(1, Math.ceil(((content || '').trim().split(/\s+/).length) / 200));

const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/* ---------- Ícones do design system (usados em :::card icon=...) ---------- */
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

function svgIcon(name) {
  const p = POST_ICONS[name] || POST_ICONS.star;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

/* Parse atributos do shortcode: icon=name title="texto longo" key=val */
function parseShortcodeAttrs(raw) {
  const attrs = {};
  if (!raw) return attrs;
  const re = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m;
  while ((m = re.exec(raw))) {
    attrs[m[1]] = m[2] || m[3] || m[4] || '';
  }
  return attrs;
}

/* Processa shortcodes :::card / :::cards / :::info|success|warn|danger
   ANTES do escapeHtml para preservar a sintaxe.  */
function processShortcodes(md) {
  // Grid de cards: :::cards ... :::
  md = md.replace(/^:::cards\s*\n([\s\S]*?)^:::$/gm, (_, inner) => {
    // Processa cards internos
    const cards = [];
    inner.replace(/^:::card\s*(.*?)\n([\s\S]*?)^:::$/gm, (_m, attrs, content) => {
      cards.push({ attrs: parseShortcodeAttrs(attrs), content: content.trim() });
      return '';
    });
    if (!cards.length) return '<!--GRID_EMPTY-->';
    const html = cards.map(c => renderCard(c.attrs, c.content)).join('');
    return `<!--GRID_START-->${html}<!--GRID_END-->`;
  });

  // Card individual: :::card ... :::
  md = md.replace(/^:::card\s*(.*?)\n([\s\S]*?)^:::$/gm, (_, attrs, content) => {
    return renderCard(parseShortcodeAttrs(attrs), content.trim());
  });

  // Callouts: :::info|success|warn|danger
  const calloutMap = { info: 'info', success: 'check', warn: 'warn', danger: 'danger' };
  md = md.replace(/^:::(info|success|warn|danger)\s*\n([\s\S]*?)^:::$/gm, (_, type, content) => {
    return renderCallout(type, content.trim(), calloutMap[type]);
  });

  return md;
}

function renderCard(attrs, content) {
  const icon = attrs.icon ? svgIcon(attrs.icon) : '';
  const title = attrs.title ? `<h4 class="post-card-title">${escapeHtml(attrs.title)}</h4>` : '';
  const body = content ? `<div class="post-card-body">${markdownInline(content)}</div>` : '';
  return `<!--HTMLBLOCK--><div class="post-card">${icon ? `<div class="post-card-icon">${icon}</div>` : ''}<div class="post-card-content">${title}${body}</div></div><!--/HTMLBLOCK-->`;
}

function renderCallout(type, content, iconName) {
  return `<!--HTMLBLOCK--><div class="post-callout post-callout--${type}"><div class="post-callout-icon">${svgIcon(iconName)}</div><div class="post-callout-body">${markdownInline(content)}</div></div><!--/HTMLBLOCK-->`;
}

/* Markdown inline simples (sem block-level) — usado dentro de cards/callouts */
function markdownInline(md) {
  let html = escapeHtml(md);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return html.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
}

/* ---------- Markdown preview ---------- */
function markdownToHtml(md) {
  if (!md) return '<p class="admin-preview-empty">Sem conteúdo ainda.</p>';

  // Processa shortcodes ANTES de escapar HTML — gera markers <!--HTMLBLOCK-->
  md = processShortcodes(md);

  // Separa blocos HTML pré-renderizados pra não escaparem
  const blocks = [];
  md = md.replace(/<!--HTMLBLOCK-->([\s\S]*?)<!--\/HTMLBLOCK-->/g, (_, b) => {
    blocks.push(b);
    return `\x00HTMLBLOCK_${blocks.length - 1}\x00`;
  });

  let html = escapeHtml(md);

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="lang-${lang || 'text'}">${code.trim()}</code></pre>`);

  // HR
  html = html.replace(/^---+$/gm, '<hr/>');

  // Inline
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>');
  html = html.replace(/(?:^- .+(?:\n|$))+/gm, (m) =>
    '<ul>' + m.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('') + '</ul>');
  html = html.replace(/(?:^\d+\. .+(?:\n|$))+/gm, (m) =>
    '<ol>' + m.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('') + '</ol>');

  // Parágrafos
  html = html.split(/\n{2,}/).map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h\d|ul|ol|pre|blockquote|img|hr)/i.test(block)) return block;
    if (/^\x00HTMLBLOCK_\d+\x00$/.test(block)) return block;
    return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  // Substitui markers de volta pelos blocos HTML originais
  html = html.replace(/\x00HTMLBLOCK_(\d+)\x00/g, (_, i) => blocks[i] || '');
  // Trata grid wrappers
  html = html.replace(/<!--GRID_START-->/g, '<div class="post-cards-grid">')
             .replace(/<!--GRID_END-->/g, '</div>')
             .replace(/<!--GRID_EMPTY-->/g, '');

  return html;
}

/* ---------- State ---------- */
const state = {
  view: 'dashboard',
  editingId: null,
  posts: [],
  search: '',
  form: null,
};

/* ---------- Toast ---------- */
function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = 'admin-toast' + (type === 'error' ? ' admin-toast--error' : '');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

/* ---------- HTML helpers ---------- */
const emptyState = (icon, title, text) => `
  <div class="admin-empty">
    <div class="admin-empty-icon">${icon}</div>
    <p class="admin-empty-title">${escapeHtml(title)}</p>
    ${text ? `<p class="admin-empty-text">${escapeHtml(text)}</p>` : ''}
  </div>
`;

const statCard = (label, value, iconSvg) => `
  <div class="admin-stat">
    <span class="admin-stat-label">${escapeHtml(label)}</span>
    <span class="admin-stat-value">${value}</span>
    <span class="admin-stat-icon">${iconSvg}</span>
  </div>
`;

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke-linecap="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>',
  paperplane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21" fill="none"/><polyline points="7 3 7 8 15 8" fill="none"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
};

const newPostButton = `
  <button class="admin-btn admin-btn--primary" data-nav="editor" data-new>
    ${ICONS.plus}
    Novo Post
  </button>
`;

/* ---------- Views ---------- */
function renderDashboard() {
  const posts = state.posts;
  const views = loadViews();
  const published = posts.filter(p => p.status === 'published');
  const drafts = posts.filter(p => p.status === 'draft');
  const totalViews = Object.values(views).reduce((a, b) => a + b, 0);
  const totalReadtime = posts.reduce((acc, p) => acc + estimateReadTime(p.content), 0);

  const mostRead = posts
    .slice()
    .sort((a, b) => (views[b.id] || 0) - (views[a.id] || 0))
    .slice(0, 5);

  const recent = posts
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  const mostReadBody = mostRead.length
    ? `<div class="admin-table-scroll">
         <table class="admin-table admin-table--compact">
           <tbody>
             ${mostRead.map(p => `
               <tr class="is-clickable" data-edit="${p.id}">
                 <td>
                   <div class="admin-table-title">${escapeHtml(p.title)}</div>
                   <div class="admin-table-slug">/${escapeHtml(p.slug || p.id)}</div>
                 </td>
                 <td class="is-right is-nowrap is-views">
                   ${views[p.id] || 0}
                   <span class="admin-table-views-unit">views</span>
                 </td>
               </tr>
             `).join('')}
           </tbody>
         </table>
       </div>`
    : emptyState(ICONS.eye, 'Sem dados ainda', 'Visualizações aparecem aqui depois que alguém abre um post.');

  const recentBody = recent.length
    ? `<div class="admin-table-scroll">
         <table class="admin-table admin-table--compact">
           <tbody>
             ${recent.map(p => `
               <tr class="is-clickable" data-edit="${p.id}">
                 <td>
                   <div class="admin-table-title">${escapeHtml(p.title)}</div>
                   <div class="admin-table-slug">${formatDateTime(p.updatedAt || p.createdAt)}</div>
                 </td>
                 <td class="is-right is-nowrap">
                   <span class="admin-table-status admin-table-status--${p.status}">${p.status}</span>
                 </td>
               </tr>
             `).join('')}
           </tbody>
         </table>
       </div>`
    : emptyState(ICONS.edit, 'Nenhum post ainda', 'Clique em "Novo Post" pra começar.');

  return `
    <header class="admin-header">
      <div>
        <h1 class="admin-title">Boa <em>volta</em>, Bernardo.</h1>
        <p class="admin-title-sub">Aqui está o resumo do que está rolando no blog hoje.</p>
      </div>
      <div class="admin-header-actions">${newPostButton}</div>
    </header>

    <div class="admin-stats">
      ${statCard('Posts publicados', published.length, ICONS.check)}
      ${statCard('Rascunhos', drafts.length, ICONS.edit)}
      ${statCard('Visualizações totais', totalViews, ICONS.eye)}
      ${statCard('Minutos de conteúdo', totalReadtime, ICONS.clock)}
    </div>

    <div class="admin-grid admin-grid--2">
      <section class="admin-card">
        <header class="admin-card-head">
          <div class="admin-card-head-text">
            <h3 class="admin-card-title">Mais lidos</h3>
            <p class="admin-card-sub">por visualizações totais</p>
          </div>
        </header>
        ${mostReadBody}
      </section>

      <section class="admin-card">
        <header class="admin-card-head">
          <div class="admin-card-head-text">
            <h3 class="admin-card-title">Editados recentemente</h3>
            <p class="admin-card-sub">últimas alterações</p>
          </div>
        </header>
        ${recentBody}
      </section>
    </div>
  `;
}

function postsTableRow(p, views) {
  const v = views[p.id] || 0;
  return `
    <tr>
      <td>
        <div class="admin-table-title">
          ${p.featured ? '<span class="admin-table-star" title="Destaque">★</span> ' : ''}
          ${escapeHtml(p.title)}
        </div>
        <div class="admin-table-slug">/${escapeHtml(p.slug || p.id)}</div>
      </td>
      <td>${p.category ? `<span class="blog-post-tag">${escapeHtml(p.category)}</span>` : '<span class="admin-table-dash">—</span>'}</td>
      <td><span class="admin-table-status admin-table-status--${p.status}">${p.status}</span></td>
      <td class="is-meta is-nowrap">${formatDateTime(p.updatedAt || p.createdAt)}</td>
      <td class="is-views is-nowrap">${v}</td>
      <td class="is-right is-nowrap">
        <div class="admin-table-actions">
          <button class="admin-icon-btn" data-view-post="${p.slug || p.id}" title="Ver">${ICONS.eye}</button>
          <button class="admin-icon-btn" data-edit="${p.id}" title="Editar">${ICONS.edit}</button>
          <button class="admin-icon-btn" data-duplicate="${p.id}" title="Duplicar">${ICONS.copy}</button>
          <button class="admin-icon-btn admin-icon-btn--danger" data-delete="${p.id}" title="Excluir">${ICONS.trash}</button>
        </div>
      </td>
    </tr>
  `;
}

function renderPostsList() {
  const q = state.search.toLowerCase();
  const filtered = state.posts.filter(p =>
    !q ||
    p.title.toLowerCase().includes(q) ||
    (p.tags || []).some(t => t.toLowerCase().includes(q))
  );
  const views = loadViews();

  const body = filtered.length
    ? `<div class="admin-table-scroll">
         <table class="admin-table">
           <thead>
             <tr>
               <th>Título</th>
               <th>Categoria</th>
               <th>Status</th>
               <th>Atualizado</th>
               <th>Views</th>
               <th class="is-right">Ações</th>
             </tr>
           </thead>
           <tbody>${filtered.map(p => postsTableRow(p, views)).join('')}</tbody>
         </table>
       </div>`
    : emptyState(
        ICONS.inbox,
        state.search ? 'Nenhum post encontrado' : 'Nenhum post ainda',
        state.search ? 'Tente outro termo de busca.' : 'Clique em "Novo Post" para começar.'
      );

  return `
    <header class="admin-header">
      <div>
        <h1 class="admin-title">Todos os <em>posts</em></h1>
        <p class="admin-title-sub">${state.posts.length} ${state.posts.length === 1 ? 'post' : 'posts'} no total</p>
      </div>
      <div class="admin-header-actions">${newPostButton}</div>
    </header>

    <section class="admin-card">
      <header class="admin-card-head">
        <div class="admin-search">
          ${ICONS.search}
          <input type="search" id="adminSearch" placeholder="Buscar por título ou tag..." value="${escapeHtml(state.search)}" autocomplete="off"/>
        </div>
        <div class="admin-card-actions">
          <span class="admin-card-sub">${filtered.length} de ${state.posts.length}</span>
        </div>
      </header>
      ${body}
    </section>
  `;
}

function renderEditor(post) {
  const isEditing = !!post && !!post.id;
  state.form = post || {
    title: '',
    subtitle: '',
    slug: '',
    cover: '',
    tags: [],
    images: [],
    category: 'Engenharia',
    author: 'Bernardo Iannini',
    status: 'draft',
    featured: false,
    content: '',
  };
  if (!Array.isArray(state.form.images)) state.form.images = [];

  const categories = ['Engenharia', 'IA', 'Projetos', 'Carreira', 'Design', 'Vida', 'Outro'];
  const f = state.form;

  const seedContent = `# Comece a escrever aqui

Use **negrito**, *itálico*, ou \`código inline\`.

## Subtítulos com ##

- Listas com hífen
- Outra linha

> Citação com >

[Link](https://exemplo.com)

\`\`\`js
// blocos de código
const ola = "mundo";
\`\`\`
`;
  const contentValue = f.content || (isEditing ? '' : seedContent);

  return `
    <header class="admin-header">
      <div>
        <h1 class="admin-title">${isEditing ? 'Editando' : 'Novo'} <em>post</em></h1>
        <p class="admin-title-sub">${isEditing ? 'Atualize as informações abaixo' : 'Preencha os campos e publique ou salve como rascunho'}</p>
      </div>
      <div class="admin-header-actions">
        <button class="admin-btn admin-btn--ghost" data-nav="posts" type="button">Cancelar</button>
        ${isEditing ? `
          <button class="admin-btn admin-btn--danger" id="deleteBtn" type="button" data-delete="${post.id}">
            ${ICONS.trash} Excluir
          </button>
        ` : ''}
      </div>
    </header>

    <form id="postForm" class="admin-editor">
      <!-- COLUNA PRINCIPAL ============================================ -->
      <div class="admin-editor-main">
        <section class="admin-card">
          <header class="admin-card-head">
            <div class="admin-card-head-text">
              <h3 class="admin-card-title">Informações principais</h3>
              <p class="admin-card-sub">título, subtítulo e categoria</p>
            </div>
          </header>
          <div class="admin-card-body">
            <div class="admin-field admin-field-title">
              <label for="f-title">Título <span class="admin-field-hint">obrigatório</span></label>
              <input type="text" id="f-title" name="title" required value="${escapeHtml(f.title)}" placeholder="Um título marcante..."/>
            </div>
            <div class="admin-field">
              <label for="f-subtitle">Subtítulo / Excerpt <span class="admin-field-hint">aparece nos cards e na busca</span></label>
              <input type="text" id="f-subtitle" name="subtitle" value="${escapeHtml(f.subtitle)}" placeholder="Uma frase resumindo o post..."/>
            </div>
          </div>
        </section>

        <section class="admin-card">
          <header class="admin-card-head">
            <div class="admin-card-head-text">
              <h3 class="admin-card-title">Conteúdo</h3>
              <p class="admin-card-sub">Markdown + shortcodes · Ctrl+S salva</p>
            </div>
            <div class="admin-card-actions">
              <div class="admin-editor-tabs">
                <button type="button" class="admin-editor-tab active" data-tab="write">Escrever</button>
                <button type="button" class="admin-editor-tab" data-tab="preview">Preview</button>
                <button type="button" class="admin-editor-tab" data-tab="help">Ajuda</button>
              </div>
            </div>
          </header>

          <!-- Toolbar de formatação ============================ -->
          <div class="editor-toolbar" id="editorToolbar">
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn" data-md="heading2" title="Subtítulo (H2)">
                <strong>H2</strong>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="heading3" title="Seção (H3)">
                <strong>H3</strong>
              </button>
            </div>
            <span class="editor-toolbar-sep"></span>
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn" data-md="bold" title="Negrito (Ctrl+B)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="italic" title="Itálico (Ctrl+I)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="code" title="Código inline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </button>
            </div>
            <span class="editor-toolbar-sep"></span>
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn" data-md="ul" title="Lista">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.5" fill="currentColor"/><circle cx="3.5" cy="12" r="1.5" fill="currentColor"/><circle cx="3.5" cy="18" r="1.5" fill="currentColor"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="ol" title="Lista numerada">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="quote" title="Citação">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .5-1 1v2c0 .5.5 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h.5c.5 0 .5 0 .5 1v1c0 1-1 2-2 2s-1 .5-1 1v2c0 .5.5 1 1 1z"/></svg>
              </button>
            </div>
            <span class="editor-toolbar-sep"></span>
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn" data-md="link" title="Link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="image" title="Imagem">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="codeblock" title="Bloco de código">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="hr" title="Divisor">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
              </button>
            </div>
            <span class="editor-toolbar-sep"></span>
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn editor-toolbar-btn--accent" data-md="callout-info" title="Callout · Info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>Info</span>
              </button>
              <button type="button" class="editor-toolbar-btn editor-toolbar-btn--accent" data-md="callout-success" title="Callout · Sucesso">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>OK</span>
              </button>
              <button type="button" class="editor-toolbar-btn editor-toolbar-btn--accent" data-md="callout-warn" title="Callout · Atenção">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Atenção</span>
              </button>
              <button type="button" class="editor-toolbar-btn editor-toolbar-btn--accent" data-md="callout-danger" title="Callout · Perigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span>Perigo</span>
              </button>
            </div>
            <span class="editor-toolbar-sep"></span>
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn editor-toolbar-btn--card" data-md="card" title="Card com ícone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                <span>Card</span>
              </button>
              <button type="button" class="editor-toolbar-btn editor-toolbar-btn--card" data-md="cards-grid" title="Grid de cards">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                <span>Grid</span>
              </button>
            </div>
          </div>

          <div class="admin-card-body">
            <textarea id="f-content" name="content" class="admin-content-editor" placeholder="# Comece com um título...">${escapeHtml(contentValue)}</textarea>
            <div class="admin-preview" id="previewBox"></div>
            <div class="admin-preview" id="helpBox">
              <h3>Markdown básico</h3>
              <p><code># Título</code> · <code>## Subtítulo</code> · <code>### Seção</code></p>
              <p><code>**negrito**</code> · <code>*itálico*</code> · <code>\`código\`</code></p>
              <p><code>&gt; citação</code> em linha separada</p>
              <p><code>- item</code> ou <code>1. item</code> pra listas</p>
              <p><code>[texto](url)</code> pra link · <code>![alt](url)</code> pra imagem</p>
              <p>Blocos de código com três crases:</p>
              <pre><code>\`\`\`js
console.log("código");
\`\`\`</code></pre>

              <h3>Shortcodes do design system</h3>
              <p><strong>Callouts</strong> — destacam informação importante:</p>
              <pre><code>:::info
Conteúdo informativo
:::

:::success
Algo deu certo
:::

:::warn
Atenção a isso
:::

:::danger
Cuidado, perigoso
:::</code></pre>
              <p><strong>Card com ícone</strong> — bloco com título, ícone e descrição:</p>
              <pre><code>:::card icon=rocket title="Lançamento"
Conteúdo do card.
:::</code></pre>
              <p>Ícones disponíveis: <code>rocket</code>, <code>code</code>, <code>bolt</code>, <code>chart</code>, <code>check</code>, <code>clock</code>, <code>flag</code>, <code>heart</code>, <code>star</code>, <code>target</code>, <code>shield</code>, <code>zap</code>.</p>
              <p><strong>Grid de cards</strong> — vários cards lado-a-lado:</p>
              <pre><code>:::cards
:::card icon=rocket title="Velocidade"
3x mais rápido.
:::
:::card icon=shield title="Seguro"
Auth com JWT.
:::
:::</code></pre>
            </div>
            <div class="admin-content-stats">
              <span id="wordCount">0 palavras</span>
              <span id="readTime">0 min de leitura</span>
            </div>
          </div>
        </section>
      </div>

      <!-- COLUNA LATERAL (METADADOS) ================================= -->
      <aside class="admin-editor-side">
        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Publicação</h4>
            <span class="admin-field-section-hint">quando e como</span>
          </div>

          <div class="admin-field">
            <label for="f-status">Status</label>
            <select id="f-status" name="status">
              <option value="draft"     ${f.status === 'draft'     ? 'selected' : ''}>📝 Rascunho</option>
              <option value="published" ${f.status === 'published' ? 'selected' : ''}>✅ Publicado</option>
              <option value="scheduled" ${f.status === 'scheduled' ? 'selected' : ''}>⏰ Agendado</option>
            </select>
          </div>

          <div class="admin-field" id="scheduleField" ${f.status === 'scheduled' ? '' : 'hidden'}>
            <label for="f-scheduledAt">Data de publicação</label>
            <input type="datetime-local" id="f-scheduledAt" name="scheduledAt" value="${f.scheduledAt ? f.scheduledAt.slice(0, 16) : ''}"/>
          </div>

          <div class="admin-field admin-field-row">
            <input type="checkbox" id="f-featured" name="featured" ${f.featured ? 'checked' : ''}/>
            <label for="f-featured">⭐ Marcar como destaque</label>
          </div>
        </div>

        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Identificação</h4>
            <span class="admin-field-section-hint">URL e categoria</span>
          </div>

          <div class="admin-field">
            <label for="f-slug">Slug (URL)</label>
            <input type="text" id="f-slug" name="slug" value="${escapeHtml(f.slug)}" placeholder="auto-gerado"/>
          </div>

          <div class="admin-field">
            <label for="f-category">Categoria</label>
            <select id="f-category" name="category">
              ${categories.map(c => `<option value="${escapeHtml(c)}" ${f.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
            </select>
          </div>

          <div class="admin-field">
            <label for="f-author">Autor</label>
            <input type="text" id="f-author" name="author" value="${escapeHtml(f.author)}"/>
          </div>
        </div>

        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Tags</h4>
            <span class="admin-field-section-hint">enter pra adicionar</span>
          </div>

          <div class="admin-field">
            <div class="admin-tags" id="tagsContainer">
              ${(f.tags || []).map(t => `
                <span class="admin-tag-pill">${escapeHtml(t)}
                  <button type="button" class="admin-tag-remove" data-tag="${escapeHtml(t)}">✕</button>
                </span>
              `).join('')}
              <input type="text" id="f-tags-input" placeholder="adicionar tag..."/>
            </div>
          </div>
        </div>

        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Mídia</h4>
            <span class="admin-field-section-hint">imagem de capa</span>
          </div>

          <!-- Drop zone + botão de upload -->
          <div class="admin-field">
            <div class="admin-dropzone" id="coverDropzone" tabindex="0">
              <input type="file" id="coverFile" accept="image/*" hidden/>
              <div class="admin-dropzone-content" id="coverDropzoneContent">
                ${f.cover ? `
                  <img src="${escapeHtml(f.cover)}" alt="capa" class="admin-dropzone-preview"/>
                  <div class="admin-dropzone-actions">
                    <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="change-cover">Trocar</button>
                    <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-action="remove-cover">Remover</button>
                  </div>
                ` : `
                  <svg class="admin-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p class="admin-dropzone-title">Arraste uma imagem aqui</p>
                  <p class="admin-dropzone-hint">ou <button type="button" class="admin-dropzone-link" data-action="pick-cover">escolha um arquivo</button></p>
                  <p class="admin-dropzone-meta">PNG, JPG, WebP · máx 2MB recomendado</p>
                `}
              </div>
            </div>
          </div>

          <!-- URL manual / caminho relativo -->
          <div class="admin-field">
            <label for="f-cover">
              URL ou caminho
              <span class="admin-field-hint">opcional · use img/blog/foto.png</span>
            </label>
            <input type="text" id="f-cover" name="cover" value="${escapeHtml(f.cover && !f.cover.startsWith('data:') ? f.cover : '')}" placeholder="https://... ou img/blog/foto.png"/>
          </div>
        </div>

        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Imagens do post</h4>
            <span class="admin-field-section-hint">estilo LinkedIn · várias</span>
          </div>
          <div class="admin-field">
            <input type="file" id="imagesFile" accept="image/*" multiple hidden/>
            <div class="admin-images-grid" id="imagesGrid"><!-- preenchido por JS --></div>
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" id="addImagesBtn" style="margin-top:10px">
              ${ICONS.plus} Adicionar imagens
            </button>
            <p class="admin-field-hint" style="margin-top:8px">
              Capa não é obrigatória — anexe quantas imagens quiser e elas aparecem
              numa grade adaptativa no post (igual LinkedIn). Use ↑ ↓ para ordenar.
            </p>
          </div>
        </div>

        ${isEditing ? `
          <div class="admin-field-section">
            <div class="admin-field-section-head">
              <h4 class="admin-field-section-title">Metadados</h4>
            </div>
            <div class="admin-meta">
              <span><strong>Criado:</strong> ${formatDateTime(f.createdAt)}</span>
              <span><strong>Atualizado:</strong> ${formatDateTime(f.updatedAt || f.createdAt)}</span>
              <span><strong>ID:</strong> <code>${escapeHtml(f.id)}</code></span>
            </div>
          </div>
        ` : ''}
      </aside>

      <!-- STICKY ACTIONS BAR ========================================= -->
      <div class="admin-sticky-actions">
        <div class="admin-sticky-actions-info">
          <span class="admin-sticky-actions-dot"></span>
          <span>${isEditing ? 'Editando rascunho · alterações não são salvas automaticamente' : 'Novo post · revise antes de publicar'}</span>
        </div>
        <button class="admin-btn admin-btn--ghost" type="button" data-nav="posts">Cancelar</button>
        <button class="admin-btn" type="button" id="exportMdBtn" title="Backup: baixa o post em Markdown (data/posts/)">
          ${ICONS.save} Exportar .md
        </button>
        <button class="admin-btn" type="button" id="saveDraftBtn">
          ${ICONS.save} Salvar rascunho
        </button>
        <button class="admin-btn admin-btn--primary" type="button" id="publishBtn">
          ${ICONS.paperplane} ${isEditing && f.status === 'published' ? 'Atualizar publicação' : 'Publicar'}
        </button>
      </div>
    </form>
  `;
}

/* ---------- Renderer principal ---------- */
const TOPBAR_LABELS = {
  dashboard: { title: 'Dashboard', crumb: 'visão geral' },
  posts:     { title: 'Posts',     crumb: 'gerenciar publicações' },
  editor:    { title: 'Editor',    crumb: 'criar / editar post' },
};

function updateTopbar() {
  const t = TOPBAR_LABELS[state.view] || TOPBAR_LABELS.dashboard;
  const titleEl = document.getElementById('adminTopbarTitle');
  const crumbEl = document.getElementById('adminTopbarCrumb');
  if (titleEl) titleEl.textContent = t.title;
  if (crumbEl) {
    if (state.view === 'editor') {
      const post = state.editingId ? state.posts.find(p => p.id === state.editingId) : null;
      crumbEl.textContent = post ? `editando · ${post.title}` : 'novo post';
    } else {
      crumbEl.textContent = t.crumb;
    }
  }
}

function render() {
  const content = document.getElementById('adminContent');
  let html = '';

  if (state.view === 'dashboard') html = renderDashboard();
  else if (state.view === 'posts') html = renderPostsList();
  else if (state.view === 'editor') {
    const post = state.editingId ? state.posts.find(p => p.id === state.editingId) : null;
    html = renderEditor(post);
  }

  content.innerHTML = html;

  // Setup específico do editor
  if (state.view === 'editor') {
    setupEditorEvents();
  }

  // Atualiza item ativo na sidebar
  document.querySelectorAll('.admin-nav-item[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.view);
  });

  // Atualiza topbar
  updateTopbar();

  // Volta scroll pro topo quando troca de view (UX)
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ---------- Editor events ---------- */
function setupEditorEvents() {
  const form = document.getElementById('postForm');
  const titleInput = document.getElementById('f-title');
  const slugInput = document.getElementById('f-slug');
  const contentEditor = document.getElementById('f-content');
  const previewBox = document.getElementById('previewBox');
  const helpBox = document.getElementById('helpBox');
  const coverInput = document.getElementById('f-cover');
  const statusSelect = document.getElementById('f-status');
  const scheduleField = document.getElementById('scheduleField');
  const tagsInput = document.getElementById('f-tags-input');
  const tagsContainer = document.getElementById('tagsContainer');
  const wordCount = document.getElementById('wordCount');
  const readTime = document.getElementById('readTime');

  // Set initial content
  if (state.form.content) contentEditor.value = state.form.content;

  const updateCounts = () => {
    const words = (contentEditor.value || '').trim().split(/\s+/).filter(Boolean).length;
    wordCount.textContent = `${words} ${words === 1 ? 'palavra' : 'palavras'}`;
    readTime.textContent = `${estimateReadTime(contentEditor.value)} min de leitura`;
  };
  updateCounts();

  // Auto-slug
  let slugManuallyEdited = !!state.form.slug;
  slugInput.addEventListener('input', () => { slugManuallyEdited = true; });

  titleInput.addEventListener('input', () => {
    if (!slugManuallyEdited) slugInput.value = slugify(titleInput.value);
  });

  /* ===== Capa: upload de arquivo + URL manual =====
     - Upload (file/drag-drop) → comprime e salva como data URL
     - URL manual → salva o caminho direto
     Os dois caminhos atualizam state.form.cover + a preview da dropzone. */
  const dropzone = document.getElementById('coverDropzone');
  const fileInput = document.getElementById('coverFile');

  const renderCoverDropzone = (src) => {
    const content = document.getElementById('coverDropzoneContent');
    if (!content) return;
    if (src) {
      content.innerHTML = `
        <img src="${escapeHtml(src)}" alt="capa" class="admin-dropzone-preview"/>
        <div class="admin-dropzone-actions">
          <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="change-cover">Trocar</button>
          <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-action="remove-cover">Remover</button>
        </div>`;
    } else {
      content.innerHTML = `
        <svg class="admin-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p class="admin-dropzone-title">Arraste uma imagem aqui</p>
        <p class="admin-dropzone-hint">ou <button type="button" class="admin-dropzone-link" data-action="pick-cover">escolha um arquivo</button></p>
        <p class="admin-dropzone-meta">PNG, JPG, WebP · máx 2MB recomendado</p>`;
    }
  };

  /* Comprime imagem via canvas: redimensiona pra max 1600px, qualidade 0.82.
     Retorna data URL JPEG/PNG. Mantém PNG só se tiver transparência forte. */
  const compressImage = (file) => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Arquivo não é imagem'));
    if (file.size > 8 * 1024 * 1024) return reject(new Error('Arquivo muito grande (>8MB)'));

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        // JPEG salva ~70% espaço vs PNG (sem alpha). Default JPEG.
        const useJpeg = !/\.(png|webp)$/i.test(file.name) || file.size > 500_000;
        const mime = useJpeg ? 'image/jpeg' : 'image/png';
        const quality = useJpeg ? 0.82 : 1;
        resolve(canvas.toDataURL(mime, quality));
      };
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });

  // Capa: comprime no navegador e sobe pro Storage do Supabase.
  const handleFile = async (file) => {
    if (!file) return;
    try {
      toast('Enviando capa...');
      const dataUrl = await compressImage(file);
      const named = dataUrlToFile(dataUrl, file.name || 'capa');
      const url = await window.BlogDB.uploadImage(named, 'covers');
      state.form.cover = url;
      renderCoverDropzone(url);
      coverInput.value = ''; // limpa URL manual quando faz upload
      toast('Capa enviada.');
    } catch (err) {
      toast(uploadErrorMsg(err), 'error');
    }
  };

  // Click no dropzone (delegação pra capturar botões internos também)
  dropzone.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'change-cover' || action === 'pick-cover') {
      fileInput.click();
    } else if (action === 'remove-cover') {
      state.form.cover = '';
      renderCoverDropzone(null);
      coverInput.value = '';
      toast('Imagem removida.');
    } else if (!e.target.closest('img, button')) {
      // Click na área vazia também abre o picker
      fileInput.click();
    }
  });

  // File picker
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // reseta pra permitir re-upload do mesmo arquivo
  });

  // Drag and drop
  ['dragenter', 'dragover'].forEach(ev => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragging');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragging');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  // URL manual — sobrescreve a imagem inline (não pode ter os dois ao mesmo tempo)
  coverInput.addEventListener('input', () => {
    const v = coverInput.value.trim();
    if (v) {
      state.form.cover = v;
      renderCoverDropzone(v);
    } else if (state.form.cover && state.form.cover.startsWith('data:')) {
      // Mantém o upload — só limpou a URL
    } else {
      state.form.cover = '';
      renderCoverDropzone(null);
    }
  });

  /* ===== Imagens do post (multi, estilo LinkedIn) ===== */
  const imagesFile = document.getElementById('imagesFile');
  const imagesGrid = document.getElementById('imagesGrid');
  const addImagesBtn = document.getElementById('addImagesBtn');

  const currentSlug = () =>
    slugify(slugInput.value || titleInput.value || 'post') || 'post';

  const imagesRender = () => {
    const imgs = state.form.images || [];
    if (!imgs.length) {
      imagesGrid.innerHTML = '<p class="admin-field-hint">Nenhuma imagem ainda.</p>';
      return;
    }
    imagesGrid.innerHTML = imgs.map((im, i) => `
      <div class="admin-image-item" data-idx="${i}">
        <img src="${escapeHtml(im.src)}" alt="" loading="lazy"/>
        <div class="admin-image-item-body">
          <input type="text" class="admin-image-caption" data-idx="${i}"
                 value="${escapeHtml(im.caption || '')}" placeholder="Legenda (opcional)"/>
          <div class="admin-image-item-actions">
            <button type="button" class="admin-icon-btn" data-img-up="${i}" title="Subir"${i === 0 ? ' disabled' : ''}>↑</button>
            <button type="button" class="admin-icon-btn" data-img-down="${i}" title="Descer"${i === imgs.length - 1 ? ' disabled' : ''}>↓</button>
            <button type="button" class="admin-icon-btn admin-icon-btn--danger" data-img-remove="${i}" title="Remover">${ICONS.trash}</button>
          </div>
        </div>
      </div>
    `).join('');
  };
  imagesRender();

  const uploadOne = async (file) => {
    const dataUrl = await compressImage(file);
    const named = dataUrlToFile(dataUrl, file.name || 'imagem');
    return window.BlogDB.uploadImage(named, 'gallery');
  };

  const handleImageFiles = async (files) => {
    const list = Array.from(files || []).filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    toast(`Enviando ${list.length} imagem(ns)...`);
    let ok = 0;
    for (const file of list) {
      try {
        const path = await uploadOne(file);
        state.form.images.push({ src: path, alt: titleInput.value || '', caption: '' });
        ok++;
        imagesRender();
      } catch (e) {
        toast('Falha em ' + (file.name || 'imagem') + ': ' + e.message, 'error');
      }
    }
    if (ok) toast(`${ok} imagem(ns) adicionada(s).`);
  };

  addImagesBtn?.addEventListener('click', () => imagesFile.click());
  imagesFile?.addEventListener('change', (e) => {
    handleImageFiles(e.target.files);
    e.target.value = '';
  });

  imagesGrid?.addEventListener('click', (e) => {
    const up = e.target.closest('[data-img-up]');
    const down = e.target.closest('[data-img-down]');
    const rm = e.target.closest('[data-img-remove]');
    const arr = state.form.images;
    if (up) {
      const i = +up.dataset.imgUp;
      if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; imagesRender(); }
    } else if (down) {
      const i = +down.dataset.imgDown;
      if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; imagesRender(); }
    } else if (rm) {
      arr.splice(+rm.dataset.imgRemove, 1);
      imagesRender();
    }
  });

  imagesGrid?.addEventListener('input', (e) => {
    const cap = e.target.closest('.admin-image-caption');
    if (cap) {
      const i = +cap.dataset.idx;
      if (state.form.images[i]) state.form.images[i].caption = cap.value;
    }
  });

  // Status toggle scheduled
  statusSelect.addEventListener('change', () => {
    scheduleField.hidden = statusSelect.value !== 'scheduled';
  });

  // Tabs (write/preview/help)
  document.querySelectorAll('.admin-editor-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-editor-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      contentEditor.classList.toggle('hidden', which !== 'write');
      previewBox.classList.toggle('active', which === 'preview');
      helpBox.classList.toggle('active', which === 'help');
      if (which === 'preview') {
        previewBox.innerHTML = markdownToHtml(contentEditor.value);
      }
    });
  });

  // Word count update
  contentEditor.addEventListener('input', updateCounts);

  /* ===== Toolbar do editor — insere snippets markdown no cursor ===== */
  const SNIPPETS = {
    heading2:  { wrap: ['## ', ''], placeholder: 'Subtítulo' },
    heading3:  { wrap: ['### ', ''], placeholder: 'Seção' },
    bold:      { wrap: ['**', '**'], placeholder: 'texto em negrito' },
    italic:    { wrap: ['*', '*'], placeholder: 'texto em itálico' },
    code:      { wrap: ['`', '`'], placeholder: 'código' },
    link:      { wrap: ['[', '](https://)'], placeholder: 'texto do link' },
    image:     { wrap: ['![', '](https://)'], placeholder: 'alt da imagem' },
    quote:     { wrap: ['> ', ''], placeholder: 'citação aqui' },
    ul:        { block: '- item\n- outro item\n- mais um' },
    ol:        { block: '1. primeiro\n2. segundo\n3. terceiro' },
    hr:        { block: '---' },
    codeblock: { block: '```js\n// código\n```' },
    'callout-info':    { block: ':::info\nInformação importante aqui.\n:::' },
    'callout-success': { block: ':::success\nDeu tudo certo.\n:::' },
    'callout-warn':    { block: ':::warn\nAtenção a este ponto.\n:::' },
    'callout-danger':  { block: ':::danger\nCuidado, isto é perigoso.\n:::' },
    card:              { block: ':::card icon=rocket title="Título do Card"\nDescrição curta do card.\n:::' },
    'cards-grid':      { block: ':::cards\n:::card icon=rocket title="Velocidade"\n3x mais rápido.\n:::\n:::card icon=shield title="Seguro"\nAuth com JWT.\n:::\n:::card icon=zap title="Produtividade"\nMenos cliques, mais código.\n:::\n:::' },
  };

  const insertSnippet = (key) => {
    const snip = SNIPPETS[key];
    if (!snip) return;
    const ta = contentEditor;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = ta.value.slice(0, start);
    const selected = ta.value.slice(start, end);
    const after = ta.value.slice(end);

    let inserted = '';
    let newCursor = start;

    if (snip.block) {
      // Insere em nova linha (com quebra antes se necessário)
      const needsNewline = before && !before.endsWith('\n');
      const prefix = needsNewline ? '\n\n' : '';
      inserted = prefix + snip.block + '\n';
      newCursor = start + inserted.length;
      ta.value = before + inserted + after;
    } else {
      // Envolve seleção ou insere placeholder
      const text = selected || snip.placeholder || '';
      inserted = snip.wrap[0] + text + snip.wrap[1];
      ta.value = before + inserted + after;
      if (selected) {
        newCursor = start + inserted.length;
      } else {
        // Cursor no início do placeholder, selecionado
        newCursor = start + snip.wrap[0].length;
        ta.focus();
        ta.setSelectionRange(newCursor, newCursor + text.length);
        updateCounts();
        return;
      }
    }
    ta.focus();
    ta.setSelectionRange(newCursor, newCursor);
    updateCounts();
  };

  document.querySelectorAll('.editor-toolbar-btn[data-md]').forEach(btn => {
    btn.addEventListener('click', () => insertSnippet(btn.dataset.md));
  });

  // Atalhos: Ctrl+B (bold), Ctrl+I (italic)
  contentEditor.addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'b') { e.preventDefault(); insertSnippet('bold'); }
    else if (key === 'i') { e.preventDefault(); insertSnippet('italic'); }
    else if (key === 'k') { e.preventDefault(); insertSnippet('link'); }
  });

  // Tags input
  const addTag = (tag) => {
    tag = tag.trim().toLowerCase();
    if (!tag) return;
    if (!state.form.tags) state.form.tags = [];
    if (state.form.tags.includes(tag)) return;
    state.form.tags.push(tag);
    renderTags();
  };

  const removeTag = (tag) => {
    state.form.tags = (state.form.tags || []).filter(t => t !== tag);
    renderTags();
  };

  const renderTags = () => {
    tagsContainer.innerHTML = `
      ${(state.form.tags || []).map(t => `
        <span class="admin-tag-pill">${escapeHtml(t)}
          <button type="button" class="admin-tag-remove" data-tag="${escapeHtml(t)}">✕</button>
        </span>
      `).join('')}
      <input type="text" id="f-tags-input" placeholder="adicionar tag..."/>
    `;
    document.getElementById('f-tags-input').focus();
    bindTagsInput();
  };

  const bindTagsInput = () => {
    const inp = document.getElementById('f-tags-input');
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(inp.value);
        inp.value = '';
      }
      if (e.key === 'Backspace' && !inp.value && state.form.tags?.length) {
        state.form.tags.pop();
        renderTags();
      }
    });
  };
  bindTagsInput();

  tagsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-tag-remove');
    if (btn) removeTag(btn.dataset.tag);
  });

  // Salvar rascunho -> forca status=draft (nao aparece no site)
  document.getElementById('saveDraftBtn').addEventListener('click', () => {
    statusSelect.value = 'draft';
    submitForm();
  });

  // Publicar -> forca status=published (a CORRECAO do bug: antes o botao
  // publicar nao mexia no status, entao salvava como rascunho).
  document.getElementById('publishBtn')?.addEventListener('click', () => {
    if (statusSelect.value !== 'scheduled') statusSelect.value = 'published';
    submitForm();
  });

  // ===== Export .md =====
  // Gera um arquivo .md com front-matter no formato esperado por
  // scripts/build-posts.js. O arquivo é baixado pelo navegador; o usuário
  // só precisa mover pra data/posts/ e rodar `npm run build:posts`.
  document.getElementById('exportMdBtn')?.addEventListener('click', () => {
    const data = gatherFormData();
    const md = postToMarkdown(data);
    const filename = (data.slug || slugify(data.title || 'post')) + '.md';
    downloadAsFile(filename, md, 'text/markdown');
    toast(`📦 Baixado ${filename} — mova para data/posts/ e rode npm run build:posts`);
  });

  // Submit por Enter/Ctrl+S: usa o status que estiver selecionado
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
  });
}

/* ---------- Export helpers ---------- */
function escapeFrontMatterString(s) {
  // YAML-safe: escapa aspas duplas e barras invertidas
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function postToMarkdown(post) {
  const fm = [];
  fm.push('---');
  if (post.id) fm.push(`id: ${post.id}`);
  fm.push(`title: "${escapeFrontMatterString(post.title || '')}"`);
  if (post.subtitle) fm.push(`subtitle: "${escapeFrontMatterString(post.subtitle)}"`);
  fm.push(`slug: ${post.slug || slugify(post.title || 'post')}`);
  fm.push(`date: "${post.createdAt || new Date().toISOString()}"`);
  fm.push(`updated: "${post.updatedAt || post.createdAt || new Date().toISOString()}"`);
  if (post.category) fm.push(`category: "${escapeFrontMatterString(post.category)}"`);
  if (post.tags?.length) {
    fm.push('tags:');
    post.tags.forEach(t => fm.push(`  - ${t}`));
  }
  if (post.cover) fm.push(`cover: "${escapeFrontMatterString(post.cover)}"`);
  fm.push(`coverAlt: "${escapeFrontMatterString(post.coverAlt || (post.title ? post.title + ' - Bernardo Iannini' : 'Bernardo Iannini'))}"`);
  if (post.images && post.images.length) {
    fm.push('images:');
    post.images.forEach((im) => {
      fm.push(`  - src: "${escapeFrontMatterString(im.src)}"`);
      fm.push(`    alt: "${escapeFrontMatterString(im.alt || post.title || '')}"`);
      if (im.caption) fm.push(`    caption: "${escapeFrontMatterString(im.caption)}"`);
    });
  } else {
    fm.push('images: []');
  }
  fm.push(`linkedinUrl: "${escapeFrontMatterString(post.linkedinUrl || '')}"`);
  fm.push(`featured: ${post.featured ? 'true' : 'false'}`);
  fm.push(`status: ${post.status || 'draft'}`);
  fm.push(`author: "${escapeFrontMatterString(post.author || 'Bernardo Iannini')}"`);
  fm.push('---');
  fm.push('');
  fm.push(post.content || '');
  fm.push('');
  return fm.join('\n');
}

function downloadAsFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
}

function toast(msg) {
  // Toast minimalista — usa o status existente se houver
  let t = document.getElementById('biAdminToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'biAdminToast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0e1410;color:#e7ffe7;border:1px solid rgba(163,230,53,.4);padding:12px 18px;border-radius:999px;font-size:13.5px;font-family:Inter,sans-serif;box-shadow:0 14px 36px -16px rgba(0,0,0,.7);z-index:9999;max-width:90vw;opacity:0;transition:opacity .25s ease, transform .25s ease;pointer-events:none;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(-4px)'; });
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(0)'; }, 4000);
}

function gatherFormData() {
  const form = document.getElementById('postForm');
  const fd = new FormData(form);

  // Cover: prioriza URL manual se preenchida, senão usa o data URL do state.
  const manualCover = fd.get('cover')?.trim() || '';
  const cover = manualCover || state.form.cover || '';

  return {
    title: fd.get('title')?.trim() || '',
    subtitle: fd.get('subtitle')?.trim() || '',
    slug: fd.get('slug')?.trim() || slugify(fd.get('title')) || uid(),
    cover,
    tags: state.form.tags || [],
    images: state.form.images || [],
    category: fd.get('category') || 'Outro',
    author: fd.get('author')?.trim() || 'Bernardo Iannini',
    status: fd.get('status') || 'draft',
    scheduledAt: fd.get('scheduledAt') ? new Date(fd.get('scheduledAt')).toISOString() : null,
    featured: !!fd.get('featured'),
    content: fd.get('content') || '',
  };
}

async function submitForm() {
  const data = gatherFormData();

  if (!data.title) {
    toast('O título é obrigatório.', 'error');
    document.getElementById('f-title')?.focus();
    return;
  }
  if (!data.content || data.content.trim().length < 10) {
    toast('Conteúdo muito curto.', 'error');
    document.getElementById('f-content')?.focus();
    return;
  }

  // Post sendo editado
  const editing = state.editingId ? state.posts.find(p => p.id === state.editingId) : null;

  // Garante slug único contra os posts que já existem
  let slug = data.slug;
  const clash = state.posts.find(p => p.slug === slug && (!editing || p.id !== editing.id));
  if (clash) slug = slug + '-' + Math.random().toString(36).slice(2, 5);

  // O banco só conhece draft/published — 'scheduled' entra como rascunho.
  const status = data.status === 'scheduled' ? 'draft' : data.status;

  const post = {
    id: editing ? editing.id : uid(),
    title: data.title,
    subtitle: data.subtitle,
    slug,
    cover: data.cover,
    coverAlt: (editing && editing.coverAlt) || (data.title + ' - Bernardo Iannini'),
    tags: data.tags,
    images: data.images,
    category: data.category,
    author: data.author,
    status,
    featured: data.featured,
    content: data.content,
  };

  toast('Salvando no Supabase...');
  try {
    if (editing) {
      await window.BlogDB.update(editing.id, post);
    } else {
      await window.BlogDB.create(post);
    }
    state.posts = await window.BlogDB.listAll();
  } catch (err) {
    toast('Erro ao salvar: ' + (err && err.message || err), 'error');
    return;
  }

  toast(status === 'published'
    ? 'Post publicado! Já está no blog.'
    : (data.status === 'scheduled' ? 'Post agendado (salvo como rascunho).' : 'Rascunho salvo.'));
  state.editingId = null;
  state.view = 'posts';
  render();
}

/* ---------- Event delegation ---------- */
function attachGlobalEvents() {
  // Sidebar navigation
  document.querySelectorAll('.admin-nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      state.editingId = null;
      if (btn.hasAttribute('data-new')) state.editingId = null;
      render();
    });
  });

  // Logout — escuta o botão da topbar E o botão da sidebar
  const logoutHandler = async () => {
    if (confirm('Tem certeza que quer sair?')) {
      try { await window.BlogDB.signOut(); } catch (e) { /* noop */ }
      location.href = 'bernardolindao.html';
    }
  };
  document.getElementById('logoutBtn')?.addEventListener('click', logoutHandler);
  document.getElementById('sidebarLogoutBtn')?.addEventListener('click', logoutHandler);

  // Delegação no main content
  document.getElementById('adminContent').addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      state.view = navBtn.dataset.nav;
      if (navBtn.hasAttribute('data-new')) state.editingId = null;
      render();
      return;
    }

    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      state.editingId = editBtn.dataset.edit;
      state.view = 'editor';
      render();
      return;
    }

    const delBtn = e.target.closest('[data-delete]');
    if (delBtn) {
      const id = delBtn.dataset.delete;
      const post = state.posts.find(p => p.id === id);
      if (post && confirm(`Excluir o post "${post.title}"? Esta ação não pode ser desfeita.`)) {
        window.BlogDB.remove(id).then(async () => {
          state.posts = await window.BlogDB.listAll();
          toast('Post excluído.');
          if (state.editingId === id) { state.editingId = null; state.view = 'posts'; }
          render();
        }).catch((err) => toast('Erro ao excluir: ' + (err && err.message || err), 'error'));
      }
      return;
    }

    const dupBtn = e.target.closest('[data-duplicate]');
    if (dupBtn) {
      const post = state.posts.find(p => p.id === dupBtn.dataset.duplicate);
      if (post) {
        const copy = {
          id: uid(),
          title: post.title + ' (cópia)',
          subtitle: post.subtitle || '',
          slug: post.slug + '-copia-' + Math.random().toString(36).slice(2, 5),
          cover: post.cover || '',
          coverAlt: post.coverAlt || '',
          tags: post.tags || [],
          images: post.images || [],
          category: post.category || '',
          author: post.author || 'Bernardo Iannini',
          status: 'draft',
          featured: false,
          content: post.content || '',
        };
        window.BlogDB.create(copy).then(async () => {
          state.posts = await window.BlogDB.listAll();
          toast('Post duplicado (como rascunho).');
          render();
        }).catch((err) => toast('Erro ao duplicar: ' + (err && err.message || err), 'error'));
      }
      return;
    }

    const viewBtn = e.target.closest('[data-view-post]');
    if (viewBtn) {
      window.open(`post.html?slug=${viewBtn.dataset.viewPost}`, '_blank');
      return;
    }

    const rowEdit = e.target.closest('tr[data-edit]');
    if (rowEdit && !e.target.closest('button, a')) {
      state.editingId = rowEdit.dataset.edit;
      state.view = 'editor';
      render();
    }
  });

  // Search input (delegação)
  document.getElementById('adminContent').addEventListener('input', (e) => {
    if (e.target.id === 'adminSearch') {
      state.search = e.target.value;
      // Como agora o empty state não é uma <tr>, precisamos re-render completo
      // mantendo apenas o foco do input para boa UX.
      const cursorPos = e.target.selectionStart;
      render();
      const input = document.getElementById('adminSearch');
      if (input) {
        input.focus();
        try { input.setSelectionRange(cursorPos, cursorPos); } catch {}
      }
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+S → salvar (no editor)
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && state.view === 'editor') {
      e.preventDefault();
      submitForm();
    }
    // Ctrl+N → novo post
    if ((e.metaKey || e.ctrlKey) && e.key === 'n' && state.view !== 'editor') {
      e.preventDefault();
      state.view = 'editor';
      state.editingId = null;
      render();
    }
  });
}

/* ---------- Init ---------- */
function renderServerOffline(err) {
  const el = document.getElementById('adminContent');
  if (!el) return;
  el.innerHTML = `
    <header class="admin-header">
      <div>
        <h1 class="admin-title">Não consegui falar com o <em>Supabase</em></h1>
        <p class="admin-title-sub">O painel lê e grava os posts no banco Supabase.</p>
      </div>
    </header>
    <section class="admin-card">
      <div class="admin-card-body" style="line-height:1.7">
        <p>Verifique:</p>
        <ul style="margin:8px 0 12px 18px">
          <li><code>js/supabase-config.js</code> com a URL e a chave anon corretas</li>
          <li>o <code>schema.sql</code> rodado no SQL Editor do Supabase</li>
          <li>conexão com a internet</li>
        </ul>
        <p style="color:var(--text-hint);font-size:12.5px">Detalhe técnico: ${escapeHtml(err && err.message || String(err))}</p>
        <button class="admin-btn admin-btn--primary" type="button" onclick="location.reload()">Tentar de novo</button>
      </div>
    </section>`;
}

async function init() {
  // Guard de autenticação via Supabase Auth
  if (!window.BlogDB) {
    renderServerOffline(new Error('Supabase não configurado (js/supabase-config.js).'));
    return;
  }
  let session = null;
  try {
    session = await window.BlogDB.getSession();
  } catch (err) {
    renderServerOffline(err);
    return;
  }
  if (!session) {
    location.replace('bernardolindao.html');
    return;
  }

  attachGlobalEvents();
  try {
    state.posts = await window.BlogDB.listAll();
  } catch (err) {
    console.error('[admin] Supabase indisponível:', err);
    renderServerOffline(err);
    return;
  }
  render();
}

document.addEventListener('DOMContentLoaded', init);
