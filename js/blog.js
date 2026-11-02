'use strict';

/* =========================================================
   BLOG — Lista, filtros, busca e bento grid.
   Fonte de dados (em ordem de preferência):
     1) window.BI_POSTS      — injetado pelo build em blog.html
     2) window.BI_SEED_POSTS — gerado por scripts/build-posts.js
     3) array vazio: sem posts fake, o empty state real assume
   Views (popularidade) usam a coluna `views` do banco (via BI_POSTS)
   e o localStorage local como complemento na mesma sessão.
   ========================================================= */

const STORAGE_KEY = 'bi_blog_posts';   // legado, preservado pra compat
const STORAGE_VIEWS = 'bi_blog_views';

/* ---------- Default seed posts (fallback de emergência) ---------- */
const SEED_POSTS = (typeof window !== 'undefined' && (window.BI_POSTS || window.BI_SEED_POSTS)) || [];

/* ---------- Carregamento de posts ----------
   Prioriza window.BI_POSTS (gerado pelo build), depois window.BI_SEED_POSTS
   e por fim o array inline. Não usa mais localStorage como fonte canônica
   pra que filtros/busca trabalhem sempre com os posts publicados de fato. */
const loadPosts = () => {
  if (typeof window !== 'undefined') {
    if (Array.isArray(window.BI_POSTS) && window.BI_POSTS.length) return window.BI_POSTS;
    if (Array.isArray(window.BI_SEED_POSTS) && window.BI_SEED_POSTS.length) return window.BI_SEED_POSTS;
  }
  return SEED_POSTS;
};

const loadViews = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_VIEWS) || '{}'); }
  catch { return {}; }
};

/* Quem grava as views é a página do post (por slug); aqui só lemos. */

/* ---------- Utility ---------- */
const activeLang = () => (typeof LANG !== 'undefined' && LANG) || 'en';

const formatDate = (iso) => {
  const d = new Date(iso);
  const locale = activeLang() === 'pt' ? 'pt-BR' : 'en-US';
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
};

const estimateReadTime = (content) => {
  const words = (content || '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/* =========================================================
   Markdown → HTML (GFM)
   ---------------------------------------------------------
   Markdown padrão, saída semântica e simples: h1..h6, p, ul/ol/li,
   pre/code, blockquote, hr, table, a, img, strong, em, del, code, br.
   Não existe mais shortcode de card/callout/ícone: post é texto.
   Mesmo contrato do build canônico (scripts/build-posts.js, marked).

   Segurança: o markdown do autor é escapado ANTES do parse, então
   nenhum HTML cru sobrevive (nem <script>, nem onerror=). Links e
   imagens passam por mdSafeUrl, que bloqueia javascript:/data:.
   ========================================================= */

const MD_SAFE_SCHEMES = ['http', 'https', 'mailto', 'tel'];
const MD_SITE_HOST = 'bernardoiannini.com';
const MD_ITEM_RE = /^(\s*)([-*+]|\d{1,9}[.)])(\s+)(.*)$/;

/* '' quando a URL não é segura (javascript:, data:, vbscript:…). */
const mdSafeUrl = (href) => {
  const raw = String(href == null ? '' : href).trim();
  if (!raw) return '';
  const flat = raw.replace(/[\x00-\x20]+/g, '').toLowerCase();
  const colon = flat.indexOf(':');
  if (colon === -1) return raw;               // relativo, âncora ou query
  const sep = flat.search(/[/?#]/);
  if (sep !== -1 && sep < colon) return raw;  // ex: /pasta/arquivo:1
  return MD_SAFE_SCHEMES.indexOf(flat.slice(0, colon)) !== -1 ? raw : '';
};

/* Externo = http(s) fora do domínio. Link interno nunca abre em nova aba. */
const mdIsExternalUrl = (href) => {
  const url = String(href || '');
  if (!/^(?:https?:)?\/\//i.test(url)) return false;
  const host = url
    .replace(/^(?:https?:)?\/\//i, '')
    .split(/[/?#]/)[0]
    .replace(/^www\./i, '')
    .toLowerCase();
  return host !== MD_SITE_HOST;
};

/* Ênfase, negrito e riscado. Espera texto sem tags. */
function mdEmphasis(text) {
  return String(text == null ? '' : text)
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<em><strong>$1</strong></em>')
    .replace(/___([^_]+)___/g, '<em><strong>$1</strong></em>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w])__([^_]+)__(?!\w)/g, '$1<strong>$2</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w*])_([^_\n]+)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');
}

/* Nível inline. Recebe texto JÁ escapado e devolve HTML. */
function mdInline(text) {
  const slots = [];
  const slot = (html) => `\x00MD${slots.push(html) - 1}\x00`;
  let out = String(text == null ? '' : text);

  // Quebra dura do GFM: dois espaços ou "\" no fim da linha.
  out = out.replace(/(?: {2,}|\\)\n/g, '<br>');

  // Escapes de barra invertida saem da disputa (\* vira * literal).
  out = out.replace(/\\([\\`*_{}[\]()#+\-.!~|])/g, (_, ch) => slot(ch));

  // Código inline: guardado antes de tudo, não sofre outra transformação.
  out = out.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, ticks, code) =>
    slot(`<code>${code.replace(/^ | $/g, '')}</code>`));

  // Imagem: ![alt](src "título") — a URL aceita um nível de parênteses.
  out = out.replace(/!\[([^\]]*)\]\(\s*((?:[^\s()]|\([^\s()]*\))+)(?:\s+&quot;([\s\S]*?)&quot;)?\s*\)/g,
    (_, alt, src, title) => {
      const url = mdSafeUrl(src);
      if (!url) return alt;
      return slot(`<img src="${url}" alt="${alt}"${title ? ` title="${title}"` : ''} loading="lazy"/>`);
    });

  // Link: [texto](url "título") — a URL aceita um nível de parênteses.
  out = out.replace(/\[([^\]]*)\]\(\s*((?:[^\s()]|\([^\s()]*\))+)(?:\s+&quot;([\s\S]*?)&quot;)?\s*\)/g,
    (_, label, href, title) => {
      const url = mdSafeUrl(href);
      if (!url) return mdEmphasis(label);
      const ext = mdIsExternalUrl(url) ? ' target="_blank" rel="noopener"' : '';
      return slot(`<a href="${url}"${title ? ` title="${title}"` : ''}${ext}>${mdEmphasis(label)}</a>`);
    });

  out = mdEmphasis(out);

  // Autolink GFM: URL nua e e-mail.
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s<>()]+[^\s<>()[\].,;:!?'"])/g, (m, pre, raw) => {
    const url = mdSafeUrl(raw);
    if (!url) return m;
    const ext = mdIsExternalUrl(url) ? ' target="_blank" rel="noopener"' : '';
    return pre + slot(`<a href="${url}"${ext}>${url}</a>`);
  });
  out = out.replace(/(^|[\s(])([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g,
    (_, pre, mail) => pre + slot(`<a href="mailto:${mail}">${mail}</a>`));

  // Devolve os pedaços guardados (um link pode conter código inline).
  for (let pass = 0; pass < 5 && out.indexOf('\x00MD') !== -1; pass++) {
    out = out.replace(/\x00MD(\d+)\x00/g, (_, n) => slots[n] || '');
  }
  return out;
}

/* Uma linha de tabela → células (sem os pipes das pontas). */
function mdTableCells(row) {
  return String(row).replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
}

/* Tabela GFM: cabeçalho + linha de alinhamento + corpo.
   Devolve null quando as linhas não formam uma tabela. */
function mdTable(lines, start) {
  const head = lines[start];
  const sep  = lines[start + 1];
  if (!head || !sep || head.indexOf('|') === -1 || sep.indexOf('|') === -1) return null;

  const sepCells = mdTableCells(sep);
  if (!sepCells.length || !sepCells.every(c => /^:?-+:?$/.test(c))) return null;

  const align = sepCells.map(c => {
    if (/^:-+:$/.test(c)) return 'center';
    if (/^:-+$/.test(c))  return 'left';
    if (/^-+:$/.test(c))  return 'right';
    return '';
  });
  const cell = (content, tag, a) =>
    `<${tag}${a ? ` align="${a}"` : ''}>${mdInline(content || '')}</${tag}>`;

  const headCells = mdTableCells(head);
  const rows = [];
  let i = start + 2;
  while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') !== -1) {
    const cells = mdTableCells(lines[i]);
    rows.push('<tr>\n' + align.map((a, k) => cell(cells[k], 'td', a)).join('\n') + '\n</tr>');
    i++;
  }
  const thead = '<thead>\n<tr>\n' + align.map((a, k) => cell(headCells[k], 'th', a)).join('\n') + '\n</tr>\n</thead>';
  return {
    html: `<table>\n${thead}\n<tbody>\n${rows.join('\n')}\n</tbody>\n</table>`,
    next: i,
  };
}

/* Lista ul/ol: aninhamento por indentação + itens de tarefa do GFM. */
function mdList(lines, start) {
  const first = lines[start].match(MD_ITEM_RE);
  const baseIndent = first[1].length;
  const ordered = /^\d/.test(first[2]);
  const startAt = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  let loose = false;
  let i = start;

  while (i < lines.length) {
    const line = lines[i];
    const item = line.match(MD_ITEM_RE);

    if (item && item[1].length <= baseIndent + 1) {
      if (items.length && ordered !== /^\d/.test(item[2])) break;   // ul ↔ ol
      items.push({
        indent: item[1].length + item[2].length + item[3].length,
        lines: [item[4]],
      });
      i++;
      continue;
    }
    if (!items.length) break;

    if (!line.trim()) {
      // Linha em branco: só continua se o que vem depois ainda pertence
      // à lista (item do mesmo tipo, ou conteúdo indentado do item).
      const next = lines[i + 1];
      if (!next || !next.trim()) break;
      const nextItem = next.match(MD_ITEM_RE);
      const nextIndent = next.match(/^\s*/)[0].length;
      const sameList = !!nextItem &&
        nextItem[1].length <= baseIndent + 1 &&
        ordered === /^\d/.test(nextItem[2]);
      if (!sameList && nextIndent <= baseIndent) break;
      loose = true;
      items[items.length - 1].lines.push('');
      i++;
      continue;
    }

    // Linha indentada (sub-lista, parágrafo ou código do item).
    const cur = items[items.length - 1];
    const indent = line.match(/^\s*/)[0].length;
    cur.lines.push(indent >= cur.indent ? line.slice(cur.indent) : line.trim());
    i++;
  }

  const body = items.map(it => {
    let text = it.lines.join('\n');
    let box = '';
    const task = text.match(/^\[([ xX])\]\s+/);
    if (task) {
      box = `<input ${/[xX]/.test(task[1]) ? 'checked="" ' : ''}disabled="" type="checkbox"> `;
      text = text.slice(task[0].length);
    }
    let inner = mdBlocks(text);
    // Lista tight (sem linha em branco) deixa o texto solto no <li>,
    // como no GFM. Lista loose mantém o <p>.
    if (!loose) inner = inner.replace(/^<p>([\s\S]*?)<\/p>\n?/, '$1');
    return `<li>${box}${inner}</li>`;
  }).join('\n');

  const tag = ordered ? 'ol' : 'ul';
  const attr = ordered && startAt !== 1 ? ` start="${startAt}"` : '';
  return { html: `<${tag}${attr}>\n${body}\n</${tag}>`, next: i };
}

/* Nível de bloco. Recebe markdown JÁ escapado. */
function mdBlocks(src) {
  const lines = String(src == null ? '' : src).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;

  const isBlockStart = (l) =>
    /^\s{0,3}(?:#{1,6}\s|&gt;|```|~~~)/.test(l) ||
    /^\s{0,3}(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/.test(l) ||
    MD_ITEM_RE.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Sentinela de bloco HTML preservado (galeria).
    const held = line.match(/^\s*(\x00HTMLBLOCK_\d+\x00)\s*$/);
    if (held) { out.push(held[1]); i++; continue; }

    // Código cercado: ``` ou ~~~
    const fence = line.match(/^\s{0,3}(`{3,}|~{3,})\s*([A-Za-z0-9_+#.-]*)/);
    if (fence) {
      const close = new RegExp('^\\s{0,3}' + fence[1][0] + '{' + fence[1].length + ',}\\s*$');
      const code = [];
      i++;
      while (i < lines.length && !close.test(lines[i])) { code.push(lines[i]); i++; }
      i++;
      const cls = fence[2] ? ` class="language-${fence[2]}"` : '';
      out.push(`<pre><code${cls}>${code.join('\n')}\n</code></pre>`);
      continue;
    }

    // Código indentado com 4 espaços (markdown padrão).
    if (/^(?: {4}|\t)/.test(line)) {
      const code = [];
      while (i < lines.length && (/^(?: {4}|\t)/.test(lines[i]) || !lines[i].trim())) {
        code.push(lines[i].replace(/^(?: {4}|\t)/, ''));
        i++;
      }
      while (code.length && !code[code.length - 1].trim()) code.pop();
      out.push(`<pre><code>${code.join('\n')}\n</code></pre>`);
      continue;
    }

    // Título ATX: # até ######
    const head = line.match(/^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (head) {
      const level = head[1].length;
      out.push(`<h${level}>${mdInline(head[2])}</h${level}>`);
      i++;
      continue;
    }

    // Régua
    if (/^\s{0,3}(?:(?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // Citação (o ">" chega escapado como "&gt;")
    if (/^\s{0,3}&gt;/.test(line)) {
      const quoted = [];
      while (i < lines.length && lines[i].trim()) {
        quoted.push(lines[i].replace(/^\s{0,3}&gt;\s?/, ''));
        i++;
      }
      out.push(`<blockquote>\n${mdBlocks(quoted.join('\n'))}\n</blockquote>`);
      continue;
    }

    // Tabela GFM
    const table = mdTable(lines, i);
    if (table) { out.push(table.html); i = table.next; continue; }

    // Lista
    if (MD_ITEM_RE.test(line)) {
      const list = mdList(lines, i);
      if (list.next > i) { out.push(list.html); i = list.next; continue; }
    }

    // Parágrafo (ou título setext, quando a linha seguinte é === / ---)
    const buf = [];
    let setext = 0;
    while (i < lines.length && lines[i].trim()) {
      const l = lines[i];
      if (buf.length && /^\s{0,3}=+\s*$/.test(l)) { setext = 1; i++; break; }
      if (buf.length && /^\s{0,3}-+\s*$/.test(l)) { setext = 2; i++; break; }
      if (buf.length && isBlockStart(l)) break;
      buf.push(l);
      i++;
    }
    const text = mdInline(buf.join('\n'));
    out.push(setext ? `<h${setext}>${text}</h${setext}>` : `<p>${text}</p>`);
  }

  return out.join('\n');
}

/* Markdown → HTML. Ponto de entrada único. */
function markdownToHtml(md) {
  if (!md) return '';

  // 1) Blocos HTML prontos ficam atrás de sentinelas NUL ANTES de
  //    escapar, senão o próprio marcador seria escapado.
  const blocks = [];
  let src = String(md).replace(/<!--HTMLBLOCK-->([\s\S]*?)<!--\/HTMLBLOCK-->/g, (_, b) => {
    blocks.push(b);
    return `\x00HTMLBLOCK_${blocks.length - 1}\x00`;
  });

  // 2) :::gallery depende do front-matter (images:) e só é montada no
  //    build (scripts/build-posts.js). Aqui a cerca sai pra não vazar.
  src = src.replace(/^:::gallery[^\n]*\n?[\s\S]*?^:::[ \t]*$/gm, '');

  // 3) Escapa tudo e 4) parseia bloco por bloco.
  const html = mdBlocks(escapeHtml(src));

  // 5) Devolve os blocos preservados.
  return html.replace(/\x00HTMLBLOCK_(\d+)\x00/g, (_, i) => blocks[i] || '');
}

/* ---------- State ---------- */
const state = {
  posts: [],
  filtered: [],
  filter: 'all',
  query: '',
  sort: 'recent',
};

/* ---------- Render ----------
   Os posts usam URL pública estática `/posts/<slug>.html`. O título também
   é um <a> real pra compatibilidade SEO + crawlers que ignoram JS. */
const postUrl = (post) => post.url || `/posts/${post.slug || post.id}.html`;
/* Versao .webp da capa (o build gera webp de toda capa LOCAL). So pra exibicao.
   Capa remota (Storage do Supabase, de post feito no painel) volta intacta:
   o .webp dela nao existe no bucket, e trocar a extensao quebraria a imagem
   em todo re-render do cliente (filtro, busca, ordenacao, troca de idioma).
   Mesma regra do isRemoteUrl de scripts/build-posts.js. */
const isRemoteUrl = (p) => /^(?:https?:)?\/\//i.test(String(p || ''));

/* URL indo pra dentro de url("...") no CSS. escapeHtml NAO serve aqui: o
   navegador nao trata a folha de estilo como HTML, entao uma capa contendo
   aspa ou barra invertida fecharia o valor e injetaria propriedades. Estes
   4 caracteres sao os unicos que quebram um url("..."), e a forma
   percent-encoded deles resolve para a mesma imagem. */
const cssUrl = (p) => String(p || '')
  .replace(/\\/g, '%5C')
  .replace(/"/g, '%22')
  .replace(/\r/g, '%0D')
  .replace(/\n/g, '%0A');
const toWebp = (p) => isRemoteUrl(p)
  ? String(p || '')
  : String(p || '').replace(/\.(jpe?g|png)$/i, '.webp');

/* temas do cartao de pilulas: categorias e as tags mais usadas */
function blogFacets() {
  const pub = state.posts.filter(p => p.status === 'published');
  const count = {};
  pub.forEach(p => (p.tags || []).forEach(t => { count[t] = (count[t] || 0) + 1; }));
  return {
    categories: [...new Set(pub.map(p => p.category).filter(Boolean))],
    tags: Object.keys(count).sort((x, y) => count[y] - count[x]).slice(0, 8),
  };
}

let lastBento = '';
function renderBento() {
  const grid = document.getElementById('blogBento');
  const empty = document.getElementById('blogEmpty');
  const lang = activeLang();
  const t = (typeof I18N !== 'undefined' && I18N[lang] && I18N[lang].blog) || {};
  const html = BlogLayout.render(state.filtered.map(p => ({
    id: p.id,
    slug: p.slug || p.id,
    title: p.title,
    excerpt: p.excerpt || p.subtitle || '',
    cover: p.cover,
    coverAlt: p.coverAlt,
    category: p.category,
    tags: p.tags,
    date: p.createdAt,
    readMin: Number(p.readTimeMin) || estimateReadTime(p.content),
    featured: p.featured,
    url: postUrl(p),
  })), {
    lang,
    labels: t.bento || {},
    coverOf: toWebp,
    facets: blogFacets(),
    filter: state.filter,
    query: state.query,
  });
  empty.hidden = state.filtered.length > 0;
  if (html === lastBento) return;      // applyI18n re-renderiza sem mudanca: nao reinicia a entrada
  lastBento = html;
  grid.innerHTML = html;
}

/* ---------- Filter + sort + search ---------- */
function applyFilters() {
  let list = state.posts.filter(p => p.status === 'published');

  if (state.filter !== 'all') {
    list = list.filter(p => p.category === state.filter);
  }

  if (state.query) {
    const q = state.query.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.subtitle || '').toLowerCase().includes(q) ||
      (p.excerpt || p.content || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // sort (views do banco + localStorage; readtime vem do build)
  const views = loadViews();
  const viewOf = (p) => Math.max(Number(p.views) || 0, views[p.slug] || 0, views[p.id] || 0);
  const sortFn = {
    recent:   (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest:   (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    popular:  (a, b) => viewOf(b) - viewOf(a),
    readtime: (a, b) => (Number(a.readTimeMin) || estimateReadTime(a.content)) - (Number(b.readTimeMin) || estimateReadTime(b.content)),
  }[state.sort] || ((a, b) => 0);

  list.sort(sortFn);

  // Garante que o featured aparece primeiro (apenas em "recent")
  if (state.sort === 'recent' && state.filter === 'all' && !state.query) {
    const featured = list.find(p => p.featured);
    if (featured) {
      list = [featured, ...list.filter(p => p.id !== featured.id)];
    }
  }

  state.filtered = list;
}

/* ---------- Navegação para a página individual do post ----------
   URL pública estática: /posts/<slug>.html (gerada por scripts/build-posts.js).
   Aceita também data-href no elemento clicado pra evitar lookup. */
function openPost(id, href) {
  const post = state.posts.find(p => p.id === id);
  const url = href || (post ? postUrl(post) : null);
  if (!url) return;
  // Browser com View Transitions cross-document: navega direto e deixa
  // o @view-transition (CSS) animar nativo. Sem suporte: fade JS atual.
  if ('startViewTransition' in document && 'onpagereveal' in window) {
    location.href = url;
    return;
  }
  document.body.classList.add('page-leaving');
  setTimeout(() => { location.href = url; }, 220);
}

/* ---------- Event delegation ---------- */
function attachEvents() {
  // Click delegation (cards, tags, chips)
  document.addEventListener('click', (e) => {
    // Não interceptar clique direto em <a> dentro do card (deixa o navegador navegar — preserva ctrl+click etc)
    if (e.target.closest('a[href]')) return;

    const search = document.getElementById('blogSearch');
    const reset = e.target.closest('[data-reset]');
    const pill = e.target.closest('.bb-pill');
    if (reset || pill) {
      const tag = pill && pill.dataset.tag;
      const cat = pill && pill.dataset.filter;
      /* clicar na pilula ativa desliga; a flor volta pra tudo */
      state.filter = cat && state.filter !== cat ? cat : 'all';
      state.query = tag && state.query !== tag ? tag : '';
      search.value = state.query ? '#' + state.query : '';
      applyFilters();
      renderBento();
      const top = document.querySelector('.bb-head').getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }

    const openEl = e.target.closest('[data-action="open"]');
    if (openEl) openPost(openEl.dataset.id, openEl.dataset.href);
  });

  // Search
  const search = document.getElementById('blogSearch');
  search.addEventListener('input', (e) => {
    state.query = e.target.value.replace(/^#/, '').trim();
    applyFilters();
    renderBento();
  });

  // Sort
  document.getElementById('blogSort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    applyFilters();
    renderBento();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    // ⌘K / Ctrl+K → focus search
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      search.focus();
      search.select();
    }
  });

}

/* ---------- Re-render quando o idioma muda (chamado por applyI18n) ---------- */
function renderBlog() {
  renderBento();
}
// Expor globalmente pra language.js chamar
window.renderBlog = renderBlog;

/* ---------- Init ---------- */
function init() {
  state.posts = loadPosts();
  applyFilters();
  renderBento();
  attachEvents();
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // Aplica i18n inicial (caso language.js já tenha rodado, garante consistência)
  if (typeof applyI18n === 'function' && typeof LANG !== 'undefined') {
    applyI18n(LANG);
  }

  // Redireciona links legados ?post=slug-or-id para a nova página estática
  const params = new URLSearchParams(location.search);
  const target = params.get('post');
  if (target) {
    const post = state.posts.find(p => p.id === target || p.slug === target);
    if (post) location.replace(postUrl(post));
  }

  // Pré-preenche busca via ?q=
  const q = params.get('q');
  if (q) {
    state.query = q;
    const input = document.getElementById('blogSearch');
    if (input) input.value = q;
    applyFilters();
    renderBento();
  }
}

document.addEventListener('DOMContentLoaded', init);
