'use strict';

/* =========================================================
   BLOG — Lista, filtros, busca e bento grid.
   Fonte de dados (em ordem de preferência):
     1) window.BI_POSTS      — injetado pelo build em blog.html
     2) window.BI_SEED_POSTS — gerado por scripts/build-posts.js
     3) array vazio: sem posts fake, o empty state real assume
   Views (popularidade) ainda usam localStorage local.
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

/* ---------- Bento layout planner ----------
   Distribuição assimétrica inspirada no About.tsx.
   Recebe o total de posts e devolve um array de classes que SEMPRE
   preenche 6 colunas sem deixar buracos.

   Larguras (em colunas de um grid de 6):
     featured = 4×2  | tall = 2×2  | wide = 3×1  | normal = 2×1  | full = 6×1
*/
function planLayout(total) {
  const out = [];
  if (total <= 0) return out;

  // Caso especial: 1 post → full-width
  if (total === 1) return ['blog-post-card--featured'];

  // Caso especial: 2 → featured + tall (fila 1 completa)
  if (total === 2) return ['blog-post-card--featured', 'blog-post-card--tall'];

  // Caso especial: 3 → featured + tall + full
  if (total === 3) return ['blog-post-card--featured', 'blog-post-card--tall', 'blog-post-card--full'];

  // Caso 4 → featured + tall + 2 wide (fila 3 completa)
  if (total === 4) return ['blog-post-card--featured', 'blog-post-card--tall', 'blog-post-card--wide', 'blog-post-card--wide'];

  // Caso 5 → featured + tall + 2 wide + full
  if (total === 5) return ['blog-post-card--featured', 'blog-post-card--tall', 'blog-post-card--wide', 'blog-post-card--wide', 'blog-post-card--full'];

  // A partir de 6 posts: começa com featured + tall + 2 wide,
  // depois aloca em blocos de 6 colunas que preencham linhas inteiras.
  out.push('blog-post-card--featured');                        // 4 cols, 2 rows
  out.push('blog-post-card--tall');                            // 2 cols, 2 rows  (linha 1-2 cheia)
  out.push('blog-post-card--wide');                            // 3 cols, 1 row
  out.push('blog-post-card--wide');                            // 3 cols, 1 row   (linha 3 cheia)

  let remaining = total - 4;
  while (remaining > 0) {
    if (remaining >= 3) {
      // tall (2×2) + normal (2×1) + normal (2×1) — depois normal+normal+normal pra fila seguinte
      // Usamos 3 normais (3 × 2 col = 6 cols) por linha — mais limpo e respira melhor
      out.push('blog-post-card--normal');
      out.push('blog-post-card--normal');
      out.push('blog-post-card--normal');
      remaining -= 3;
    } else if (remaining === 2) {
      // 2 últimos → 2× wide (3 cols cada) para encher a linha
      out.push('blog-post-card--wide');
      out.push('blog-post-card--wide');
      remaining = 0;
    } else {
      // 1 último → full width
      out.push('blog-post-card--full');
      remaining = 0;
    }
  }
  return out;
}

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

function postCardHtml(post, layout, views) {
  const lang = activeLang();
  const t = (I18N?.[lang]?.blog) || {};
  const content = post.excerpt || post.content || '';
  const readTime = post.readTimeMin || estimateReadTime(post.content);
  const hasCover = !!post.cover;
  // Views são gravadas pela página do post por SLUG (fallback pro id legado)
  const viewCount = views[post.slug] || views[post.id] || 0;
  const url = postUrl(post);
  const badgeLabel = t.featured?.badge || (lang === 'pt' ? 'Destaque' : 'Featured');
  const viewsLabel = lang === 'pt' ? 'Visualizações' : 'Views';
  const readLabel = lang === 'pt' ? 'min de leitura' : 'min read';
  return `
    <article class="blog-post-card ${layout} ${hasCover ? '' : 'blog-post-card--no-image'}"
             data-id="${escapeHtml(post.id)}" data-slug="${escapeHtml(post.slug || post.id)}"
             data-action="open" data-href="${escapeHtml(url)}"
             data-cover="${escapeHtml(toWebp(post.cover) || '')}">
      ${hasCover ? `
        <div class="blog-post-cover">
          <img src="${escapeHtml(toWebp(post.cover))}" alt="${escapeHtml(post.coverAlt || post.title)}" loading="lazy" width="800" height="500"/>
        </div>
      ` : '<div class="blog-post-cover"></div>'}

      ${post.featured ? `
        <span class="blog-post-featured-badge">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 9.2l-5 4.6L17.4 21 12 17.7 6.6 21 8 13.8 3 9.2l6.6-.6z"/></svg>
          ${escapeHtml(badgeLabel)}
        </span>
      ` : ''}

      ${viewCount > 0 ? `
        <span class="blog-post-views" title="${escapeHtml(viewsLabel)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ${viewCount}
        </span>
      ` : ''}

      <div class="blog-post-content">
        <div class="blog-post-meta">
          ${post.category ? `<span class="blog-post-category">${escapeHtml(post.category)}</span>` : ''}
          <span class="blog-post-date">${formatDate(post.createdAt)}</span>
          <span class="blog-post-readtime">${readTime} ${readLabel}</span>
        </div>
        <h3 class="blog-post-title"><a href="${escapeHtml(url)}">${escapeHtml(post.title)}</a></h3>
        ${post.subtitle ? `<p class="blog-post-excerpt">${escapeHtml(post.subtitle)}</p>` : ''}
        ${post.tags?.length ? `
          <div class="blog-post-tags">
            ${post.tags.slice(0, 3).map(t => `<span class="blog-post-tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </article>
  `;
}

function renderBento() {
  const grid = document.getElementById('blogBento');
  const empty = document.getElementById('blogEmpty');
  const list = state.filtered;
  const views = loadViews();

  if (!list.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const plan = planLayout(list.length);
  grid.innerHTML = list.map((post, i) => postCardHtml(post, plan[i] || 'blog-post-card--normal', views)).join('');
}

/* Featured tile dentro do bento de identidade (topo) */
function renderIdentityFeatured() {
  const target = document.getElementById('bidFeatured');
  if (!target) return;

  const published = state.posts.filter(p => p.status === 'published');
  const featured = published.find(p => p.featured) ||
                   published.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const lang = (typeof LANG !== 'undefined' && LANG) || 'en';
  const t = (I18N?.[lang]?.blog) || {};

  if (!featured) {
    target.innerHTML = `<div class="bid-featured-inner bid-featured-inner--empty">
      <div class="bid-featured-content">
        <p class="bid-kicker">${t.featured?.spotlight || 'Spotlight'}</p>
        <h3 class="bid-featured-title">${lang === 'pt' ? 'O primeiro post está chegando.' : 'The first post is coming soon.'}</h3>
      </div>
    </div>`;
    return;
  }

  const readTime = Number(featured.readTimeMin) || estimateReadTime(featured.content);
  const hasCover = !!featured.cover;
  const badgeText = featured.featured
    ? (t.featured?.spotlight || 'Spotlight')
    : (t.featured?.latest || 'Latest');

  target.dataset.id = featured.id;
  target.dataset.action = 'open';
  target.dataset.cover = toWebp(featured.cover) || '';
  target.innerHTML = `
    <div class="bid-featured-inner">
      ${hasCover ? `
        <div class="bid-featured-img">
          <img src="${escapeHtml(toWebp(featured.cover))}" alt="${escapeHtml(featured.title)}" loading="lazy"/>
        </div>
      ` : '<div class="bid-featured-img bid-featured-img--gradient"></div>'}
      <div class="bid-featured-noise" aria-hidden="true"></div>
      <div class="bid-featured-content">
        <span class="bid-featured-badge">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 9.2l-5 4.6L17.4 21 12 17.7 6.6 21 8 13.8 3 9.2l6.6-.6z"/></svg>
          ${escapeHtml(badgeText)}
        </span>
        <h3 class="bid-featured-title">${escapeHtml(featured.title)}</h3>
        <div class="bid-featured-meta">
          <span>${formatDate(featured.createdAt)}</span>
          <span>·</span>
          <span>${readTime} min</span>
          ${featured.category ? `<span>·</span><span>${escapeHtml(featured.category)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* Identity tag cloud (dentro do tile bid-topics) */
function renderIdentityTags() {
  const wrap = document.getElementById('blogTagCloud');
  if (!wrap) return;
  const tagFreq = {};
  state.posts.filter(p => p.status === 'published').forEach(p => {
    (p.tags || []).forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
  });
  const sorted = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (!sorted.length) {
    const noTags = activeLang() === 'pt' ? 'Nenhuma tag ainda.' : 'No tags yet.';
    wrap.innerHTML = `<p style="color:var(--text-hint);font-size:12px;">${noTags}</p>`;
    return;
  }
  const max = sorted[0][1];
  wrap.innerHTML = sorted.map(([tag, count]) => {
    const big = count / max > .6 ? 'bid-tag--big' : '';
    return `<span class="bid-tag ${big}" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</span>`;
  }).join('');
}

/* Center preview — carrossel automático aleatório com pausa no hover.
   Cada ciclo escolhe um post aleatório (uniforme), evitando repetir o
   último. O tile é CLICÁVEL: ao clicar, navega para o post que está
   sendo exibido naquele momento (seja do carrossel ou de um hover). */
let centerCarouselTimer = null;
let centerResumeTimer = null;
let centerSwapTimer = null;

function setupCenterPreview() {
  const center = document.getElementById('bidCenter');
  const img = document.getElementById('bidCenterImg');
  const meta = document.getElementById('bidCenterMeta');
  if (!center || !img) return;

  const root = document.getElementById('blogIdentity');
  if (!root) return;

  /* Post atualmente exibido — usado pelo handler de clique. */
  let currentPost = null;

  /* Fade out → swap → fade in. Sem flash. */
  const setPreview = (post) => {
    // Mesmo post já exibido: não reinicia o fade (evita piscar ao mover
    // o mouse entre os filhos do card; o pause já foi renovado no hover).
    // Cancela swap pendente pra outro post e restaura o estado visível.
    if (post && currentPost && post.id === currentPost.id) {
      if (centerSwapTimer) { clearTimeout(centerSwapTimer); centerSwapTimer = null; }
      img.classList.add('active');
      if (meta) meta.classList.toggle('is-visible', !!post.title);
      return;
    }
    if (centerSwapTimer) clearTimeout(centerSwapTimer);

    if (!post || !post.cover) {
      currentPost = null;
      img.classList.remove('active');
      center.classList.remove('has-image');
      center.removeAttribute('data-action');
      center.removeAttribute('data-id');
      if (meta) {
        meta.classList.remove('is-visible');
        meta.innerHTML = '';
      }
      return;
    }

    const apply = () => {
      currentPost = post;
      img.style.backgroundImage = `url("${cssUrl(toWebp(post.cover))}")`;
      img.classList.add('active');
      center.classList.add('has-image');
      // Marca o tile como link clicável pro post atual
      center.dataset.action = 'open';
      center.dataset.id = post.id;
      const openLabel = activeLang() === 'pt' ? 'Abrir post' : 'Open post';
      center.setAttribute('aria-label', `${openLabel}: ${post.title}`);
      if (meta) {
        meta.innerHTML = post.title
          ? `<span class="bid-center-meta-title">${escapeHtml(post.title)}</span>${post.subtitle ? `<span class="bid-center-meta-sub">${escapeHtml(post.subtitle)}</span>` : ''}`
          : '';
        meta.classList.toggle('is-visible', !!post.title);
      }
    };

    const isFirstShow = !img.classList.contains('active');
    if (isFirstShow) {
      apply();
    } else {
      img.classList.remove('active');
      if (meta) meta.classList.remove('is-visible');
      centerSwapTimer = setTimeout(apply, 280);
    }
  };

  /* Lista de posts elegíveis (publicados + com cover) */
  const eligiblePosts = () =>
    state.posts.filter(p => p.status === 'published' && p.cover);

  /* Escolhe UM post aleatório uniforme, evitando repetir o último. */
  const pickRandomPost = () => {
    const posts = eligiblePosts();
    if (!posts.length) return null;
    const lastId = currentPost?.id || null;
    const pool = posts.length > 1
      ? posts.filter(p => p.id !== lastId)
      : posts;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const showNext = () => {
    const post = pickRandomPost();
    if (post) setPreview(post);
  };

  const startCarousel = () => {
    stopCarousel();
    showNext(); // mostra um aleatório imediatamente (sempre diferente do anterior)
    centerCarouselTimer = setInterval(showNext, 3200);
  };

  const stopCarousel = () => {
    if (centerCarouselTimer) {
      clearInterval(centerCarouselTimer);
      centerCarouselTimer = null;
    }
  };

  /* Pausa o auto-cycle por X ms (após hover). Resume sozinho. */
  const pauseCarousel = (resumeAfter = 2800) => {
    stopCarousel();
    if (centerResumeTimer) clearTimeout(centerResumeTimer);
    centerResumeTimer = setTimeout(startCarousel, resumeAfter);
  };

  /* Hover override — mostra o post hovered e pausa o carrossel */
  const showHovered = (post) => {
    if (!post || !post.cover) return;
    pauseCarousel();
    setPreview(post);
  };

  // Hover nas tiles do bento de identidade
  root.querySelectorAll('[data-cover]').forEach(tile => {
    if (tile === center) return;
    tile.addEventListener('mouseenter', () => {
      const post = state.posts.find(p => p.id === tile.dataset.id);
      if (post) showHovered(post);
    });
  });

  // Hover nos cards do bento principal de posts
  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.blog-post-card');
    if (!card || !card.dataset.cover) return;
    const post = state.posts.find(p => p.id === card.dataset.id);
    if (post) showHovered(post);
  });

  // Pausa quando passa o mouse no próprio center (deixa o user "ler")
  center.addEventListener('mouseenter', () => pauseCarousel(4500));
  center.addEventListener('mouseleave', () => pauseCarousel(800));

  // Acessibilidade: clique no tile já funciona via delegation
  // (data-action="open" + data-id), mas precisamos suportar teclado.
  center.setAttribute('role', 'link');
  center.setAttribute('tabindex', '0');
  center.style.cursor = 'pointer';
  center.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (currentPost) openPost(currentPost.id);
    }
  });

  // Aba oculta: pausa o carrossel (e o resume pendente); retoma ao voltar
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopCarousel();
      if (centerResumeTimer) clearTimeout(centerResumeTimer);
    } else {
      startCarousel();
    }
  });

  // Inicia o carrossel
  startCarousel();
}

/* Count-up animado de 0 → valor final */
function animateCount(el, target, duration = 1100) {
  if (!el) return;
  const start = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(target * ease(progress));
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

function renderStats() {
  const published = state.posts.filter(p => p.status === 'published');

  // readtime: usa o readTimeMin REAL calculado no build (a lista injetada
  // em blog.html nao traz o content completo, so o readTimeMin/excerpt).
  const totals = {
    'stat-posts':      published.length,
    'stat-categories': new Set(published.map(p => p.category).filter(Boolean)).size,
    'stat-readtime':   published.reduce((acc, p) => acc + (Number(p.readTimeMin) || estimateReadTime(p.content)), 0),
  };

  Object.entries(totals).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Fonte de verdade = data-count gravado pelo build (ele leu todos os
    // .md por completo). So usa o calculo do cliente se o atributo faltar
    // (ex: dev sem rodar o build). Assim nunca zera com lista stale.
    const built = el.getAttribute('data-count');
    const target = (built !== null && built !== '' && !Number.isNaN(Number(built)))
      ? Number(built)
      : value;
    if (el.dataset.countDone) {
      el.textContent = target;
    } else {
      animateCount(el, target);
      el.dataset.countDone = '1';
    }
  });
}

/* Rotator de tópicos — frase que muda sozinha (efeito tech) */
let topicRotatorTimer = null;
function renderTopicsRotator() {
  const el = document.getElementById('bidTopicRotator');
  if (!el) return;
  const current = el.querySelector('.bid-topic-current');
  if (!current) return;

  // Coleta categorias + tags top
  const categories = [...new Set(state.posts
    .filter(p => p.status === 'published')
    .map(p => p.category)
    .filter(Boolean))];
  const tagFreq = {};
  state.posts.filter(p => p.status === 'published').forEach(p => {
    (p.tags || []).forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; });
  });
  const topTags = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([t]) => '#' + t);

  const items = [...categories, ...topTags];
  if (!items.length) {
    // Blog zerado: placeholder neutro no lugar da rotação
    current.textContent = activeLang() === 'pt' ? 'Em breve' : 'Coming soon';
    return;
  }

  // Limpa timer anterior
  if (topicRotatorTimer) clearInterval(topicRotatorTimer);

  let idx = 0;
  const swap = () => {
    if (document.hidden) return; // aba oculta: não gasta DOM à toa
    current.classList.add('is-leaving');
    setTimeout(() => {
      idx = (idx + 1) % items.length;
      current.textContent = items[idx];
      current.classList.remove('is-leaving');
    }, 240);
  };
  current.textContent = items[0];
  topicRotatorTimer = setInterval(swap, 2400);
}

/* Mini clock no tile de localização (atualiza minuto a minuto) */
function startClock() {
  const el = document.getElementById('bidClock');
  if (!el) return;
  const tick = () => {
    if (document.hidden) return; // aba oculta: não gasta DOM à toa
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${hh}:${mm} GMT-3`;
  };
  tick();
  setInterval(tick, 30 * 1000);
  // Ao voltar pra aba, atualiza na hora (o tick pode ter sido pulado)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
}

function renderFilters() {
  const wrap = document.getElementById('blogFilters');
  if (!wrap) return;
  const lang = (typeof LANG !== 'undefined' && LANG) || 'en';
  const allLabel = I18N?.[lang]?.blog?.filters?.all || 'All';

  const categories = [...new Set(state.posts
    .filter(p => p.status === 'published')
    .map(p => p.category)
    .filter(Boolean))];

  const chips = [
    `<button type="button" class="blog-chip ${state.filter === 'all' ? 'blog-chip--active' : ''}" data-filter="all">${escapeHtml(allLabel)}</button>`,
    ...categories.map(c =>
      `<button type="button" class="blog-chip ${state.filter === c ? 'blog-chip--active' : ''}" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`
    )
  ];
  wrap.innerHTML = chips.join('');
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

  // sort (views por slug com fallback pro id legado; readtime vem do build)
  const views = loadViews();
  const sortFn = {
    recent:   (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest:   (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    popular:  (a, b) => (views[b.slug] || views[b.id] || 0) - (views[a.slug] || views[a.id] || 0),
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
    if (e.target.closest('a[href]') && !e.target.closest('.blog-chip,.bid-tag')) return;

    const openEl = e.target.closest('[data-action="open"]');
    if (openEl) { openPost(openEl.dataset.id, openEl.dataset.href); return; }

    const chip = e.target.closest('.blog-chip');
    if (chip) {
      state.filter = chip.dataset.filter;
      applyFilters();
      renderBento();
      renderFilters();
      return;
    }

    const tagEl = e.target.closest('.bid-tag');
    if (tagEl) {
      state.query = tagEl.dataset.tag;
      document.getElementById('blogSearch').value = '#' + tagEl.dataset.tag;
      applyFilters();
      renderBento();
      window.scrollTo({ top: document.querySelector('.blog-toolbar-section').offsetTop - 100, behavior: 'smooth' });
    }
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
function renderBlog(lang) {
  // Re-render dos componentes que dependem de I18N além do data-i18n simples
  renderIdentityFeatured();
  renderFilters();
  renderBento();
  renderIdentityTags();
  renderTopicsRotator();
  // Stats já foram animadas; só atualiza o valor final
  renderStats();
}
// Expor globalmente pra language.js chamar
window.renderBlog = renderBlog;

/* ---------- Init ---------- */
function init() {
  state.posts = loadPosts();
  applyFilters();
  renderStats();
  renderFilters();
  renderIdentityFeatured();
  renderIdentityTags();
  renderTopicsRotator();
  renderBento();
  startClock();
  setupCenterPreview();
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
