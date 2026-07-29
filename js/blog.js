'use strict';

/* =========================================================
   BLOG — Lista, filtros, busca e bento grid.
   Fonte de dados (em ordem de preferência):
     1) window.BI_POSTS      — injetado pelo build em blog.html
     2) window.BI_SEED_POSTS — gerado por scripts/build-posts.js
     3) array inline abaixo  — fallback de emergência
   Views (popularidade) ainda usam localStorage local.
   ========================================================= */

const STORAGE_KEY = 'bi_blog_posts';   // legado, preservado pra compat
const STORAGE_VIEWS = 'bi_blog_views';

/* ---------- Default seed posts (fallback de emergência) ---------- */
const SEED_POSTS = (typeof window !== 'undefined' && (window.BI_POSTS || window.BI_SEED_POSTS)) || [
  {
    id: 'seed-1',
    title: 'Como construí esse portfólio do zero',
    subtitle: 'Decisões técnicas, atalhos, e o que aprendi pelo caminho.',
    slug: 'como-construi-esse-portfolio',
    cover: 'img/eufoto1.webp',
    tags: ['frontend', 'css', 'design'],
    category: 'Engenharia',
    author: 'Bernardo Iannini',
    status: 'published',
    featured: true,
    createdAt: '2026-05-10T10:00:00Z',
    updatedAt: '2026-05-10T10:00:00Z',
    content: `# Como construí esse portfólio do zero

Quando comecei a desenhar esse portfólio, queria algo que **não parecesse mais um template**.

## Decisões de design

A primeira coisa foi escolher uma paleta consistente: verde (#22c55e) + lime (#a3e635) sobre fundo escuro (#060807). O contraste é alto, mas o glow lime amacia as bordas.

> "Um portfólio bom é como um café bom: simples, mas com personalidade."

## Stack

- HTML / CSS / Vanilla JS
- Sem frameworks (queria controle total sobre o CSS)
- Animações com \`transform\` e \`opacity\` pra performance

## O que eu faria diferente

1. Modularizaria o CSS desde o início
2. Usaria CSS variables com mais agressividade
3. Talvez Astro pra próxima versão

E você, qual stack escolheria pra um portfólio em 2026?`
  },
  {
    id: 'seed-2',
    title: 'AI Designer: o que faz e por que importa',
    subtitle: 'Uma profissão nova nascendo no cruzamento entre design e engenharia.',
    slug: 'ai-designer-o-que-faz',
    cover: 'img/memoriacache.webp',
    tags: ['ia', 'design', 'carreira'],
    category: 'IA',
    author: 'Bernardo Iannini',
    status: 'published',
    featured: false,
    createdAt: '2026-05-05T14:30:00Z',
    updatedAt: '2026-05-05T14:30:00Z',
    content: `# AI Designer: o que faz e por que importa

A função de **AI Designer** ainda é nova — e por isso confunde muita gente.

## Não é prompt engineer

Prompt engineer otimiza prompts. AI Designer **desenha o sistema inteiro**: dados, prompts, fluxos, agentes, UX.

## O que entrega no dia a dia

- Mapeia onde IA agrega valor real (e onde não agrega)
- Define personas, tom e guardrails dos agentes
- Trabalha com engenheiros pra integrar modelos
- Testa qualidade, viés e edge cases

## Como entrei nessa área

Aos 17 anos, percebi que sabia escrever código *e* sabia explicar o problema pro modelo. Isso virou meu diferencial.`
  },
  {
    id: 'seed-3',
    title: 'O fim do CSS-in-JS?',
    subtitle: 'A discussão que voltou em 2026 e por que eu mudei de lado.',
    slug: 'fim-do-css-in-js',
    cover: 'img/athena7.com.br.webp',
    tags: ['css', 'frontend', 'react'],
    category: 'Engenharia',
    author: 'Bernardo Iannini',
    status: 'published',
    featured: false,
    createdAt: '2026-04-28T09:15:00Z',
    updatedAt: '2026-04-28T09:15:00Z',
    content: `# O fim do CSS-in-JS?

Spoiler: não, **CSS-in-JS não morreu**. Mas mudou de papel.

## O que aconteceu

Tailwind v4 ficou tão expressivo que muita gente abandonou styled-components. CSS Modules voltou com força. E o suporte nativo a CSS Nesting tirou a última vantagem técnica de runtime CSS-in-JS.

## Quando ainda vale a pena

\`\`\`tsx
const Button = styled.button\`
  background: \${props => props.variant === 'primary' ? 'green' : 'gray'};
\`
\`\`\`

Em libraries de componentes (com tokens dinâmicos), ainda compensa. Em apps, raramente.

## Minha escolha hoje

**Tailwind + CSS modules** quando preciso de scope.`
  },
  {
    id: 'seed-4',
    title: 'Erp Inspire4U: lições de um projeto real',
    subtitle: 'Construindo software pra colégio, do MVP em 3 semanas até produção.',
    slug: 'erp-inspire4u-licoes',
    cover: 'img/erpinspire4u.webp',
    tags: ['produto', 'backend', 'sql'],
    category: 'Projetos',
    author: 'Bernardo Iannini',
    status: 'published',
    featured: false,
    createdAt: '2026-04-20T16:00:00Z',
    updatedAt: '2026-04-20T16:00:00Z',
    content: `# ERP Inspire4U: lições de um projeto real

O **Inspire4U** é um colégio em Belo Horizonte. Eles precisavam de um ERP que controlasse matrículas, mensalidades, professores e turmas. Tudo isso em **3 semanas**.

## O MVP

- C# + SQL Server no backend
- Vue.js no frontend
- Auth simples com JWT

## O que deu errado

A primeira versão **não tinha logs decentes**. Quando um boleto sumiu, perdemos 4 horas debugando.

## A correção

Adicionei logs estruturados (Serilog) e um dashboard simples de auditoria. Nunca mais sumiu nada.

## Aprendizado

> Antes de qualquer feature nova, pergunte: "como vou debugar isso em produção?"`
  },
  {
    id: 'seed-5',
    title: 'Por que escrever ainda importa em 2026',
    subtitle: 'Mesmo com IA escrevendo tudo, a clareza continua sendo o diferencial.',
    slug: 'por-que-escrever-ainda-importa',
    cover: 'img/joselopes.webp',
    tags: ['escrita', 'carreira', 'comunicação'],
    category: 'Carreira',
    author: 'Bernardo Iannini',
    status: 'published',
    featured: false,
    createdAt: '2026-04-12T11:20:00Z',
    updatedAt: '2026-04-12T11:20:00Z',
    content: `# Por que escrever ainda importa em 2026

Você pode pedir pra IA escrever qualquer coisa. Mas **você ainda precisa saber se o texto está bom**.

## A nova habilidade do dev

Não é mais "saber escrever em inglês". É **saber distinguir um texto medíocre de um bom**.

## Como pratico

1. Escrevo o draft à mão
2. Peço pra IA criticar (não corrigir)
3. Reescrevo com base na crítica

## O resultado

Textos mais curtos, mais diretos, e que **soam como eu**.`
  },
  {
    id: 'seed-6',
    title: 'Memoriacache: o jogo que virou portfólio',
    subtitle: 'Como um joguinho de memória virou projeto-chave no meu CV.',
    slug: 'memoriacache-jogo-portfolio',
    cover: 'img/memoriacache.webp',
    tags: ['jogo', 'react', 'animação'],
    category: 'Projetos',
    author: 'Bernardo Iannini',
    status: 'published',
    featured: false,
    createdAt: '2026-04-02T20:00:00Z',
    updatedAt: '2026-04-02T20:00:00Z',
    content: `# Memoriacache: o jogo que virou portfólio

Comecei o **Memoriacache** como um exercício de fim de semana. Hoje, é um dos projetos que mais abre portas em entrevistas.

## A ideia

Um jogo da memória onde as cartas representam estruturas de dados (cache, heap, stack...) — combina diversão com aprendizado.

## A stack

- React + TypeScript
- Framer Motion (animações)
- LocalStorage pra ranking

## Por que funciona como portfólio

Recrutadores **jogam** antes de ler o CV. Engajamento > leitura.`
  }
];

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

const saveViews = (views) => {
  localStorage.setItem(STORAGE_VIEWS, JSON.stringify(views));
};

const incrementViews = (id) => {
  const views = loadViews();
  views[id] = (views[id] || 0) + 1;
  saveViews(views);
  return views[id];
};

/* ---------- Utility ---------- */
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const estimateReadTime = (content) => {
  const words = (content || '').trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/* ---------- Ícones do design system (mesmos do admin) ---------- */
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
  const icon = attrs.icon ? `<div class="post-card-icon">${svgIcon(attrs.icon)}</div>` : '';
  const title = attrs.title ? `<h4 class="post-card-title">${escapeHtml(attrs.title)}</h4>` : '';
  const body = content ? `<div class="post-card-body">${inlineMd(content)}</div>` : '';
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

/* ---------- Markdown → HTML ---------- */
function markdownToHtml(md) {
  if (!md) return '';

  // Shortcodes ANTES de escapar HTML
  md = processShortcodes(md);

  // Salva blocos pré-renderizados pra não escaparem
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
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>');
  html = html.replace(/(?:^- .+(?:\n|$))+/gm, (m) =>
    '<ul>' + m.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('') + '</ul>'
  );
  html = html.replace(/(?:^\d+\. .+(?:\n|$))+/gm, (m) =>
    '<ol>' + m.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('') + '</ol>'
  );

  // Parágrafos
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
// Versao .webp da capa (toda capa tem webp gerado pelo build). So pra exibicao.
const toWebp = (p) => String(p || '').replace(/\.(jpe?g|png)$/i, '.webp');

function postCardHtml(post, layout, views) {
  const content = post.excerpt || post.content || '';
  const readTime = post.readTimeMin || estimateReadTime(post.content);
  const hasCover = !!post.cover;
  const viewCount = views[post.id] || 0;
  const url = postUrl(post);
  return `
    <article class="blog-post-card ${layout} ${hasCover ? '' : 'blog-post-card--no-image'}"
             data-id="${post.id}" data-slug="${escapeHtml(post.slug || post.id)}"
             data-action="open" data-href="${url}"
             data-cover="${escapeHtml(toWebp(post.cover) || '')}">
      ${hasCover ? `
        <div class="blog-post-cover">
          <img src="${escapeHtml(toWebp(post.cover))}" alt="${escapeHtml(post.coverAlt || post.title)}" loading="lazy" width="800" height="500"/>
        </div>
      ` : '<div class="blog-post-cover"></div>'}

      ${post.featured ? `
        <span class="blog-post-featured-badge">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 9.2l-5 4.6L17.4 21 12 17.7 6.6 21 8 13.8 3 9.2l6.6-.6z"/></svg>
          Destaque
        </span>
      ` : ''}

      ${viewCount > 0 ? `
        <span class="blog-post-views" title="Visualizações">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ${viewCount}
        </span>
      ` : ''}

      <div class="blog-post-content">
        <div class="blog-post-meta">
          ${post.category ? `<span class="blog-post-category">${escapeHtml(post.category)}</span>` : ''}
          <span class="blog-post-date">${formatDate(post.createdAt)}</span>
          <span class="blog-post-readtime">${readTime} min de leitura</span>
        </div>
        <h3 class="blog-post-title"><a href="${url}">${escapeHtml(post.title)}</a></h3>
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

  const readTime = estimateReadTime(featured.content);
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
    wrap.innerHTML = '<p style="color:var(--text-hint);font-size:12px;">Nenhuma tag ainda.</p>';
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
      img.style.backgroundImage = `url("${toWebp(post.cover)}")`;
      img.classList.add('active');
      center.classList.add('has-image');
      // Marca o tile como link clicável pro post atual
      center.dataset.action = 'open';
      center.dataset.id = post.id;
      center.setAttribute('aria-label', `Abrir post: ${post.title}`);
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
    current.textContent = '—';
    return;
  }

  // Limpa timer anterior
  if (topicRotatorTimer) clearInterval(topicRotatorTimer);

  let idx = 0;
  const swap = () => {
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
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${hh}:${mm} GMT-3`;
  };
  tick();
  setInterval(tick, 30 * 1000);
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
      (p.content || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // sort
  const sortFn = {
    recent:   (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest:   (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    popular:  (a, b) => (loadViews()[b.id] || 0) - (loadViews()[a.id] || 0),
    readtime: (a, b) => estimateReadTime(a.content) - estimateReadTime(b.content),
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
