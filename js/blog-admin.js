'use strict';

/* =========================================================
   BLOG ADMIN — Dashboard + CRUD de posts
   ========================================================= */

/* ---------- Data layer = Supabase (window.BlogDB) ----------
   O painel lê e grava direto no Supabase: o que você salva aqui já fica
   gravado no banco na hora. Só que o site público é estático, então
   publicar ou excluir também dispara POST /api/rebuild (triggerRebuild
   logo abaixo): o build roda de novo, puxa os posts do banco e regera as
   páginas com o SEO intacto.
   A autenticação é checada de forma assíncrona no init().            */

async function apiGetPosts() {
  if (!window.BlogDB) throw new Error('Supabase não configurado — veja js/supabase-config.js');
  return window.BlogDB.listAll();
}

async function reloadPosts() {
  state.posts = await apiGetPosts();
}

/* ---------- Rebuild do site (POST /api/rebuild) ----------
   Contrato do endpoint (a resposta é sempre JSON):
     200 { ok: true, triggered: true }
     401 { ok: false, error: 'unauthorized' }      -> sem token ou token inválido
     403 { ok: false, error: 'forbidden' }         -> logado, mas não é o dono
     405 { ok: false, error: 'method_not_allowed' }
     501 { ok: false, error: 'not_configured' }   -> falta DEPLOY_HOOK_URL
     502 { ok: false, error: 'hook_failed', detail }

   404 (servidor estático local, sem serverless) e falha de rede contam
   como 'not_configured': pro usuário dá no mesmo, não existe rebuild.

   NUNCA lança: devolve { ok, reason, detail? } pra quem chamou decidir a
   mensagem. Falha aqui não desfaz nada: o post já está salvo no banco. */
async function triggerRebuild(reason) {
  let token = '';
  try {
    const session = window.BlogDB ? await window.BlogDB.getSession() : null;
    token = (session && session.access_token) || '';
  } catch (e) {
    token = '';   // sessão ilegível cai no unauthorized abaixo
  }
  if (!token) return { ok: false, reason: 'unauthorized' };

  let res;
  try {
    res = await fetch('/api/rebuild', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ reason: reason || '' }),
    });
  } catch (e) {
    /* fetch só rejeita em falha de rede / servidor fora do ar. */
    return { ok: false, reason: 'not_configured', detail: (e && e.message) || 'sem rede' };
  }

  let body = null;
  try { body = await res.json(); } catch (e) { body = null; }   // resposta não-JSON (HTML de 404, por ex.)
  const erro = (body && body.error) || '';

  if (res.ok) {
    /* Servidor estático pode devolver 200 com HTML pra rota inexistente:
       sem { ok: true } no corpo, nenhum rebuild foi disparado. */
    if (body && body.ok) return { ok: true, reason: 'ok' };
    return { ok: false, reason: 'not_configured' };
  }
  /* 404 e 405 sem corpo JSON: o endpoint não existe aqui (servidor estático
     local costuma responder 405 no POST em vez de 404). Não é falha de hook. */
  if (res.status === 404) return { ok: false, reason: 'not_configured' };
  if (res.status === 405 && !body) return { ok: false, reason: 'not_configured' };
  if (res.status === 501 || erro === 'not_configured') return { ok: false, reason: 'not_configured' };
  /* 403 é diferente de 401 e NÃO é 'not_configured': o endpoint existe, o
     token vale, mas a conta não está na allowlist do dono (ADMIN_USER_ID).
     Recarregar ou entrar de novo não resolve, então a mensagem é outra. */
  if (res.status === 403 || erro === 'forbidden') return { ok: false, reason: 'forbidden' };
  if (res.status === 401 || erro === 'unauthorized') {
    return { ok: false, reason: 'unauthorized' };
  }
  /* 502, 405 e qualquer outra resposta: o post está salvo, o rebuild não rodou. */
  return {
    ok: false,
    reason: 'hook_failed',
    detail: (body && body.detail) || erro || ('HTTP ' + res.status),
  };
}

/* Traduz o resultado do triggerRebuild numa mensagem honesta de toast.
     feito: o que dizer quando o rebuild foi disparado ('Post publicado')
     salvo: o que já está garantido no banco quando o rebuild não rodou
   Devolve { msg, type } pronto pro toast(). */
function rebuildMessage(feito, salvo, rebuild) {
  if (!rebuild) return { msg: salvo + '.', type: 'success' };

  if (rebuild.ok) {
    return { msg: feito + '. O site atualiza em cerca de 1 minuto.', type: 'success' };
  }
  if (rebuild.reason === 'not_configured') {
    return { msg: salvo + '. A atualização automática do site não respondeu, então ele entra no ar no próximo deploy (veja PUBLICAR.md).', type: 'error' };
  }
  if (rebuild.reason === 'unauthorized') {
    return { msg: salvo + ', mas não deu pra confirmar sua sessão para atualizar o site. Recarregue a página; se persistir, entre de novo. O site atualiza no próximo deploy.', type: 'error' };
  }
  if (rebuild.reason === 'forbidden') {
    return { msg: salvo + ', mas esta conta não tem permissão para atualizar o site (só o dono do painel dispara deploy). Confira ADMIN_USER_ID nas variáveis de ambiente da Vercel. O site atualiza no próximo deploy.', type: 'error' };
  }
  const detalhe = rebuild.detail ? ' (' + rebuild.detail + ')' : '';
  return { msg: salvo + ', mas o rebuild do site falhou' + detalhe + '. O site atualiza no próximo deploy.', type: 'error' };
}

/* Mapa { id: views } montado a partir dos posts já carregados.
   (a contagem de views agora mora na coluna `views` da tabela). */
const loadViews = () => {
  const m = {};
  (state.posts || []).forEach(p => { m[p.id] = Number(p.views) || 0; });
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

/* datetime-local trabalha em horário local (YYYY-MM-DDTHH:mm).
   O banco e o site usam ISO UTC — conversão nas duas pontas. */
const pad2 = (n) => String(n).padStart(2, '0');
const toDatetimeLocal = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return toDatetimeLocal();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const fromDatetimeLocal = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const estimateReadTime = (content) =>
  Math.max(1, Math.ceil(((content || '').trim().split(/\s+/).length) / 200));

const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/* ---------- Status: allowlist ----------
   O banco tem CHECK (draft|published) e o painel usa 'scheduled' só na tela.
   O valor entra numa CLASSE CSS (admin-table-status--X), então vem de uma
   lista fechada: valor estranho no banco não escolhe classe nenhuma.
   O texto exibido é o valor real, escapado, pra não mentir na tela. */
const STATUS_CONHECIDOS = ['draft', 'published', 'scheduled'];
const statusClass = (s) => STATUS_CONHECIDOS.includes(String(s || '')) ? String(s) : 'draft';

/* ---------- Endereço de imagem: allowlist de esquema ----------
   Vale pro campo "URL ou caminho" da capa e pro src das imagens do post.
   Passa:
     - caminho do próprio site: img/blog/foto.png ou /img/blog/foto.png
     - endereço http:// ou https:// (é o que o Storage do Supabase devolve)
   Não passa: javascript:, vbscript:, data:, blob:, file:, //outro-host e
   qualquer outro esquema. Esse valor vira src no painel e no site publicado,
   e um dia pode virar href, então o esquema é decidido aqui e não na hora
   de imprimir. */
/* Tira espaço, tab e caractere de controle antes de olhar o esquema: é assim
   que "java<tab>script:" engana uma checagem ingênua. A comparação é por
   código do caractere pra não deixar caractere de controle literal no fonte. */
const semEspacos = (v) => Array.prototype.filter
  .call(String(v == null ? '' : v), (ch) => {
    const code = ch.charCodeAt(0);
    return code > 32 && code !== 127;
  })
  .join('');

/* Bitmap em data URL: o upload antigo do painel gravava a capa comprimida
   assim. data:image de bitmap não executa script (svg executaria, e está
   fora da lista de propósito). */
const DATA_URL_BITMAP = /^data:image\/(png|jpe?g|gif|webp|avif);base64,[A-Za-z0-9+/=]+$/;

function isCaminhoDoSite(valor) {
  const raw = String(valor == null ? '' : valor).trim();
  if (!raw) return false;
  if (raw.startsWith('//')) return false;                            // herda o protocolo e sai do site
  if (/^[a-z][a-z0-9+.-]*:/i.test(semEspacos(raw))) return false;    // tem esquema: não é relativo
  return raw.startsWith('/') || raw.startsWith('img/');
}

function isEnderecoHttp(valor) {
  return /^https?:\/\/[^/\s]/i.test(semEspacos(valor));
}

/* O que o campo "URL ou caminho" aceita. */
function isEnderecoImagemAceito(valor) {
  return isCaminhoDoSite(valor) || isEnderecoHttp(valor);
}

/* src pronto pra <img>: devolve '' quando o endereço não passa na allowlist.
   Melhor uma imagem quebrada do que um src hostil no DOM. Aceita também o
   data:image de bitmap, que é o formato das capas antigas. */
function safeImageSrc(valor) {
  const raw = String(valor == null ? '' : valor).trim();
  if (!raw) return '';
  if (DATA_URL_BITMAP.test(semEspacos(raw))) return raw;
  return isEnderecoImagemAceito(raw) ? raw : '';
}

const AVISO_ENDERECO_IMAGEM =
  'Endereço de imagem não aceito. Use um caminho do site (img/blog/foto.png ou /img/blog/foto.png) ' +
  'ou um endereço http(s). Endereços javascript:, data: e vbscript: são recusados.';

/* =========================================================
   MARKDOWN (.md) - preview do editor
   ---------------------------------------------------------
   O site publica os posts com a lib `marked` (ver scripts/build-posts.js),
   então o preview usa a MESMA lib, carregada da CDN uma vez só e sob
   demanda. Se a CDN falhar, cai no renderizador simples aqui embaixo:
   o painel nunca fica em branco por causa disso.

   Nota: os blocos customizados do design system (cartoes com icone e
   caixas de destaque) sairam do editor. Aqui o conteudo e .md puro (GFM),
   igual ao arquivo que vive em data/posts/<slug>.md.
   ========================================================= */
const MARKED_CDN = 'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js';
const MARKED_OPTS = { gfm: true, breaks: false, mangle: false, headerIds: false };
let markedLoad = null;
let markedWarned = false;

/* Devolve parse(md) se a lib já estiver na página; senão null. */
function getMarkedParser() {
  const lib = window.marked;
  if (!lib) return null;
  if (typeof lib.parse === 'function') return (md) => lib.parse(md, MARKED_OPTS);
  if (typeof lib === 'function') return (md) => lib(md, MARKED_OPTS);
  if (lib.marked && typeof lib.marked.parse === 'function') return (md) => lib.marked.parse(md, MARKED_OPTS);
  return null;
}

/* Carrega o marked uma única vez. Resolve com o parser ou com null
   (nunca rejeita: falha de CDN só faz o preview usar o fallback). */
function ensureMarked() {
  const ready = getMarkedParser();
  if (ready) return Promise.resolve(ready);
  if (markedLoad) return markedLoad;
  markedLoad = new Promise((resolve) => {
    let settled = false;
    const finish = () => { if (settled) return; settled = true; resolve(getMarkedParser()); };
    const s = document.createElement('script');
    s.src = MARKED_CDN;
    s.async = true;
    s.onload = finish;
    s.onerror = finish;
    document.head.appendChild(s);
    setTimeout(finish, 8000); // CDN lenta não trava o preview
  });
  return markedLoad;
}

/* ---------- Sanitização do preview ----------
   O markdown pode vir de qualquer lugar (colado, importado de um .md),
   e o marked deixa HTML cru passar. Então todo HTML gerado passa por uma
   allowlist antes de entrar no DOM: sem <script>, sem atributo on*, sem
   href javascript:, sem tag fora da lista.                              */
const PREVIEW_DROP_TAGS = 'script,style,iframe,object,embed,link,meta,base,form,noscript,template,svg,math,audio,video,source,track,canvas,button,select,textarea,frame,frameset,applet';

const PREVIEW_TAGS = new Set([
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'del', 's', 'strike', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'span', 'div',
  'input', 'sup', 'sub', 'abbr', 'figure', 'figcaption', 'details', 'summary',
  'dl', 'dt', 'dd', 'kbd', 'mark', 'small',
]);

/* `id` fica de fora de propósito: conteúdo colado não pode colidir com
   os ids do painel. */
const PREVIEW_GLOBAL_ATTRS = ['class', 'title'];

const PREVIEW_TAG_ATTRS = {
  a:       ['href', 'target', 'rel'],
  img:     ['src', 'alt', 'width', 'height', 'loading'],
  input:   ['type', 'checked', 'disabled'],
  th:      ['align', 'colspan', 'rowspan', 'scope'],
  td:      ['align', 'colspan', 'rowspan'],
  ol:      ['start'],
  li:      ['value'],
  code:    ['class'],
  details: ['open'],
};

/* Aceita http(s), mailto, tel, âncora e caminho relativo.
   Para imagem aceita também data:image (menos svg, que executa script). */
function isSafeUrl(url, kind) {
  const raw = String(url || '').trim();
  if (!raw) return false;
  // tira espaços e caracteres de controle antes de olhar o esquema
  const bare = raw.replace(/[\u0000-\u0020]+/g, '').toLowerCase();
  if (kind === 'img' && /^data:image\/(png|jpe?g|gif|webp|avif);base64,/.test(bare)) return true;
  if (/^[a-z][a-z0-9+.-]*:/.test(bare)) return /^(https?|mailto|tel):/.test(bare);
  return true; // relativo: img/blog/foto.png, /post.html, #ancora
}

/* Troca o elemento pelos próprios filhos (mantém o texto, joga a tag fora). */
function unwrapElement(el) {
  const parent = el.parentNode;
  if (!parent) { el.remove(); return; }
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

function sanitizeHtml(dirty) {
  const html = String(dirty || '');
  if (!html) return '';
  // Sem DOMParser não tem como limpar: mostra o markdown escapado
  if (typeof DOMParser === 'undefined') return escapeHtml(html);
  try {
    return sanitizeWithDom(html);
  } catch (err) {
    console.warn('[admin] limpeza do preview falhou:', err);
    return escapeHtml(html);
  }
}

function sanitizeWithDom(html) {
  // DOMParser não executa script nem baixa imagem: parse offline e seguro
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc && doc.body;
  if (!body) return '';

  body.querySelectorAll(PREVIEW_DROP_TAGS).forEach(el => el.remove());

  Array.from(body.querySelectorAll('*')).forEach(el => {
    if (!el.parentNode) return; // já saiu do documento junto com o pai
    const tag = el.tagName.toLowerCase();
    if (!PREVIEW_TAGS.has(tag)) { unwrapElement(el); return; }

    const allowed = PREVIEW_GLOBAL_ATTRS.concat(PREVIEW_TAG_ATTRS[tag] || []);
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || !allowed.includes(name)) el.removeAttribute(attr.name);
    });

    if (tag === 'a') {
      const href = el.getAttribute('href');
      if (!isSafeUrl(href, 'a')) el.removeAttribute('href');
      if (el.hasAttribute('href')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    } else if (tag === 'img') {
      if (!isSafeUrl(el.getAttribute('src'), 'img')) { el.remove(); return; }
      el.setAttribute('loading', 'lazy');
    } else if (tag === 'input') {
      // só a checkbox das task lists do GFM, sempre travada
      if ((el.getAttribute('type') || '').toLowerCase() !== 'checkbox') { el.remove(); return; }
      el.setAttribute('disabled', '');
      // hooks de estilo (o marked não marca as task lists com classe)
      const li = el.closest('li');
      if (li) {
        li.classList.add('task-list-item');
        const list = li.parentElement;
        if (list && /^(ul|ol)$/i.test(list.tagName)) list.classList.add('contains-task-list');
      }
    }
  });

  return body.innerHTML;
}

/* ---------- Markdown -> HTML ---------- */
function markdownToHtml(md) {
  const src = String(md || '');
  if (!src.trim()) return '<p class="admin-preview-empty">Sem conteúdo ainda.</p>';
  const parse = getMarkedParser();
  let html;
  try {
    html = parse ? parse(src) : markdownToHtmlSimple(src);
  } catch (err) {
    console.warn('[admin] marked falhou, usando renderizador simples:', err);
    html = markdownToHtmlSimple(src);
  }
  return sanitizeHtml(html);
}

/* Renderizador de emergência (CDN fora do ar). Cobre o básico do markdown
   e é sempre escapado antes, então não injeta HTML. */
function markdownToHtmlSimple(md) {
  let html = escapeHtml(md);

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`);

  html = html.replace(/^(?:---+|\*\*\*+)$/gm, '<hr/>');
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, '<img src="$2" alt="$1"/>');
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, '<a href="$2">$1</a>');

  const listItem = (line) => {
    const text = line.replace(/^\s*(?:[-*+] |\d+[.)] )/, '');
    const task = text.match(/^\[([ xX])\]\s?(.*)$/);
    if (!task) return `<li>${text}</li>`;
    const checked = task[1].toLowerCase() === 'x' ? ' checked' : '';
    return `<li class="task-list-item"><input type="checkbox" disabled${checked}/> ${task[2]}</li>`;
  };

  html = html.replace(/(?:^[-*+] .+(?:\n|$))+/gm, (block) =>
    '<ul>' + block.trim().split('\n').map(listItem).join('') + '</ul>');
  html = html.replace(/(?:^\d+[.)] .+(?:\n|$))+/gm, (block) =>
    '<ol>' + block.trim().split('\n').map(listItem).join('') + '</ol>');

  return html.split(/\n{2,}/).map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h\d|ul|ol|pre|blockquote|img|hr|table|div)/i.test(block)) return block;
    return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');
}

/* =========================================================
   FRONT-MATTER YAML - parser local (sem dependência nova)
   ---------------------------------------------------------
   Cobre exatamente o que existe em data/posts/*.md:
     chave: valor · chave: "valor com espaço" · booleanos · listas
     simples (tags) e listas de objetos (images: - src/alt/caption).
   ========================================================= */
function parseYamlScalar(raw) {
  let v = String(raw == null ? '' : raw).trim();
  if (!/^["'[]/.test(v)) v = v.replace(/\s+#.*$/, '').trim(); // comentário à direita
  if (v === '') return '';
  if (/^".*"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  if (/^\[.*\]$/.test(v)) {
    return v.slice(1, -1).split(',').map(s => parseYamlScalar(s)).filter(s => s !== '');
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return '';
  return v;
}

function parseYamlBlock(block) {
  const data = {};
  const lines = String(block || '').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) { i++; continue; }

    const entry = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!entry) { i++; continue; }

    const key = entry[1];
    const inline = entry[2].trim();
    i++;

    if (inline !== '') { data[key] = parseYamlScalar(inline); continue; }

    // valor vazio: pode ser uma lista nas linhas seguintes
    const list = [];
    while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
      const first = lines[i].replace(/^\s+-\s+/, '');
      const pair = first.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      i++;
      if (!pair) { list.push(parseYamlScalar(first)); continue; }

      const obj = {};
      obj[pair[1]] = parseYamlScalar(pair[2]);
      // propriedades extra do mesmo item (indentadas, sem hífen)
      while (i < lines.length && /^\s{2,}[A-Za-z0-9_-]+:/.test(lines[i]) && !/^\s*-\s/.test(lines[i])) {
        const extra = lines[i].match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
        if (!extra) break;
        obj[extra[1]] = parseYamlScalar(extra[2]);
        i++;
      }
      list.push(obj);
    }
    data[key] = list.length ? list : '';
  }

  return data;
}

/* Separa front-matter e corpo. Sem front-matter, devolve data: null e o
   arquivo inteiro como corpo. */
function parseFrontMatter(text) {
  const src = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const match = src.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!match) return { data: null, body: src };
  return { data: parseYamlBlock(match[1]), body: src.slice(match[0].length).replace(/^\n+/, '') };
}

/* ---------- State ---------- */
const state = {
  view: 'dashboard',
  editingId: null,
  posts: [],
  search: '',
  form: null,
  saving: false,
};

/* ---------- Toast ---------- */
/* Toast unico. Antes existia uma SEGUNDA declaracao de toast() mais abaixo no
   arquivo; por hoisting ela vencia e ignorava o parametro `type`, entao as ~10
   chamadas com 'error' apareciam como sucesso. A duplicata saiu e esta versao
   (que usa .admin-toast/.admin-toast--error do blog.css) e a unica.
   Reaproveita um unico elemento: .admin-toast e fixed no canto, dois toasts
   simultaneos ficariam empilhados um sobre o outro. */
function toast(message, type = 'success') {
  const isError = type === 'error';
  document.getElementById('adminToast')?.remove();   // nunca empilha

  const el = document.createElement('div');
  el.id = 'adminToast';
  el.className = 'admin-toast' + (isError ? ' admin-toast--error' : '');
  /* textContent, NUNCA innerHTML: metade das chamadas de toast() concatena
     mensagem de erro do Supabase, e mensagem de servidor é dado externo. Com
     textContent o texto aparece como texto, sem virar marcação. Se algum dia
     alguém precisar de negrito aqui, monte elementos e use textContent neles. */
  el.textContent = message;
  document.body.appendChild(el);

  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    setTimeout(() => el.remove(), 300);
  }, isError ? 4200 : 2400);   // erro fica mais tempo: da tempo de ler
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

  /* Ranking só com views reais: com tudo zerado cai no empty state honesto
     em vez de listar os posts mais recentes fingindo ranking. */
  const mostRead = posts
    .filter(p => (views[p.id] || 0) > 0)
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
               <tr class="is-clickable" data-edit="${escapeHtml(p.id)}">
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
               <tr class="is-clickable" data-edit="${escapeHtml(p.id)}">
                 <td>
                   <div class="admin-table-title">${escapeHtml(p.title)}</div>
                   <div class="admin-table-slug">${formatDateTime(p.updatedAt || p.createdAt)}</div>
                 </td>
                 <td class="is-right is-nowrap">
                   <span class="admin-table-status admin-table-status--${statusClass(p.status)}">${escapeHtml(p.status)}</span>
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
      <td><span class="admin-table-status admin-table-status--${statusClass(p.status)}">${escapeHtml(p.status)}</span></td>
      <td class="is-meta is-nowrap">${formatDateTime(p.createdAt)}</td>
      <td class="is-views is-nowrap">${v}</td>
      <td class="is-right is-nowrap">
        <div class="admin-table-actions">
          <button class="admin-icon-btn" data-view-post="${escapeHtml(p.slug || p.id)}" title="Ver">${ICONS.eye}</button>
          <button class="admin-icon-btn" data-edit="${escapeHtml(p.id)}" title="Editar">${ICONS.edit}</button>
          <button class="admin-icon-btn" data-duplicate="${escapeHtml(p.id)}" title="Duplicar">${ICONS.copy}</button>
          <button class="admin-icon-btn admin-icon-btn--danger" data-delete="${escapeHtml(p.id)}" title="Excluir">${ICONS.trash}</button>
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
               <th>Publicação</th>
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
  /* Cópia profunda: editar nunca mexe no objeto que vive em state.posts.
     Cancelar descarta capa, tags e imagens; a lista só muda após o save. */
  state.form = post ? JSON.parse(JSON.stringify(post)) : {
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

  /* Capa e imagens que vêm do banco também passam pela allowlist. Um post
     gravado antes dessa checagem (ou por fora do painel) entra no editor sem
     o endereço recusado; se ficasse, o save travaria e o post viraria um post
     que não dá pra editar. */
  const capaRecusada = !!state.form.cover && !safeImageSrc(state.form.cover);
  if (capaRecusada) state.form.cover = '';
  const imagensAntes = state.form.images.length;
  state.form.images = state.form.images.filter(im => im && safeImageSrc(im.src));
  if (capaRecusada || state.form.images.length < imagensAntes) {
    toast('Este post tinha endereço de imagem fora do aceito e ele foi retirado do formulário. ' + AVISO_ENDERECO_IMAGEM, 'error');
  }

  const categories = ['Engenharia', 'IA', 'Projetos', 'Carreira', 'Design', 'Vida', 'Outro'];
  const f = state.form;

  const seedContent = `# Comece a escrever aqui

Use **negrito**, *itálico*, ~~riscado~~ ou \`código inline\`.

## Subtítulos com ##

- Listas com hífen
- Outra linha

- [ ] tarefa pendente
- [x] tarefa concluída

> Citação com >

[Link](https://exemplo.com)

| Coluna | Valor |
| --- | --- |
| markdown | puro |

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
          <button class="admin-btn admin-btn--danger" id="deleteBtn" type="button" data-delete="${escapeHtml(post.id)}">
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
              <p class="admin-card-sub">Markdown puro (.md) com GFM · Ctrl+S salva</p>
            </div>
            <div class="admin-card-actions">
              <div class="admin-editor-tabs">
                <button type="button" class="admin-editor-tab active" data-tab="write">Escrever</button>
                <button type="button" class="admin-editor-tab" data-tab="preview">Preview</button>
                <button type="button" class="admin-editor-tab" data-tab="help">Guia .md</button>
              </div>
            </div>
          </header>

          <!-- Barra .md: importar arquivo / baixar arquivo ====== -->
          <div class="editor-md-io" id="mdIoBar">
            <div class="editor-md-io-text">
              <strong>Este editor fala .md</strong>
              <span>Importe um arquivo com front-matter YAML (ou arraste ele aqui). Baixar é o caminho manual, opcional: publicar aqui já sobe pro site sozinho.</span>
            </div>
            <div class="editor-md-io-actions">
              <input type="file" id="mdFileInput" accept=".md,.markdown,text/markdown" hidden/>
              <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" id="importMdBtn" title="Carregar um arquivo .md neste editor">
                ${ICONS.inbox} Importar .md
              </button>
              <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" id="exportMdBarBtn" title="Baixar este post como arquivo .md">
                ${ICONS.save} Baixar .md
              </button>
            </div>
            <p class="editor-md-io-msg" id="mdIoMsg" hidden></p>
          </div>

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
              <button type="button" class="editor-toolbar-btn" data-md="strike" title="Riscado (~~texto~~)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M16.5 6.5C16.5 5 14.4 4 12 4S7.5 5 7.5 6.8c0 1.9 2 2.5 4.5 3.2M7.5 17.4C7.5 19 9.6 20 12 20s4.5-1 4.5-2.6c0-1.5-1.3-2.3-3.5-2.9"/></svg>
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
              <button type="button" class="editor-toolbar-btn" data-md="task" title="Lista de tarefas (- [ ])">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2 7 4 9 8 4.5"/><polyline points="2 16 4 18 8 13.5"/><line x1="12" y1="7" x2="21" y2="7"/><line x1="12" y1="17" x2="21" y2="17"/></svg>
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
              <button type="button" class="editor-toolbar-btn" data-md="table" title="Tabela (GFM)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="10" y1="4" x2="10" y2="20"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="hr" title="Divisor">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
              </button>
            </div>
          </div>

          <div class="admin-card-body">
            <textarea id="f-content" name="content" class="admin-content-editor" placeholder="# Comece com um título...">${escapeHtml(contentValue)}</textarea>
            <div class="admin-preview" id="previewBox"></div>
            <div class="admin-preview" id="helpBox">
              <h3>Como este editor trabalha</h3>
              <p>O post é um arquivo <code>.md</code>: front-matter YAML no topo, markdown no corpo.
                 Igual aos arquivos de <code>data/posts/&lt;slug&gt;.md</code>.</p>
              <p><strong>Publicar</strong> salva no banco e já dispara o rebuild do site: em cerca de
                 1 minuto o post está no ar, sem você abrir terminal nenhum. Excluir faz o mesmo
                 caminho e tira a página do ar. Rascunho fica só no banco.</p>
              <p><strong>Importar .md</strong> lê o front-matter, preenche os campos da direita e joga o
                 resto do arquivo aqui no corpo. <strong>Baixar .md</strong> faz o caminho de volta: é o
                 jeito manual, pra quando você quiser versionar o post em <code>data/posts/</code> e
                 rodar <code>npm run build:posts</code> na mão. Continua funcionando, mas já não é
                 obrigatório pra publicar.</p>
              <p>Também dá pra arrastar um arquivo <code>.md</code> direto pra cima do editor.</p>

              <h3>Front-matter reconhecido</h3>
              <pre><code>---
title: "Título do post"
subtitle: "Uma frase de resumo"
slug: titulo-do-post
date: "2026-01-31T12:00:00.000Z"
updated: "2026-01-31T12:00:00.000Z"
category: "Engenharia"
tags:
  - markdown
  - blog
cover: "img/blog/capa.png"
coverAlt: "Descrição da capa"
images:
  - src: "img/blog/foto-1.png"
    alt: "Descrição da foto"
    caption: "Legenda opcional"
linkedinUrl: ""
featured: false
status: draft
author: "Bernardo Iannini"
---</code></pre>

              <h3>Markdown do corpo</h3>
              <p><code># Título</code> · <code>## Subtítulo</code> · <code>### Seção</code></p>
              <p><code>**negrito**</code> · <code>*itálico*</code> · <code>~~riscado~~</code> · <code>\`código\`</code></p>
              <p><code>&gt; citação</code> em linha separada</p>
              <p><code>- item</code> · <code>1. item</code> · <code>- [ ] tarefa</code> · <code>- [x] tarefa feita</code></p>
              <p><code>[texto](url)</code> pra link · <code>![alt](url)</code> pra imagem · <code>---</code> pra divisor</p>
              <p>Parágrafo novo pede uma linha em branco. Uma quebra só continua o mesmo parágrafo,
                 exatamente como o build renderiza.</p>
              <p>Bloco de código com três crases:</p>
              <pre><code>\`\`\`js
console.log("código");
\`\`\`</code></pre>
              <p>Tabela no estilo GFM:</p>
              <pre><code>| Coluna | Valor |
| --- | --- |
| linha 1 | 10 |
| linha 2 | 20 |</code></pre>
              <p>O preview usa a mesma lib do build (marked, com GFM), então o que aparece aqui
                 é o que sai no post publicado.</p>
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

          <div class="admin-field">
            <label for="f-publishedAt">
              Data de publicação
              <span class="admin-field-hint">aparece no post · passado ou futuro</span>
            </label>
            <input type="datetime-local" id="f-publishedAt" name="publishedAt" value="${escapeHtml(toDatetimeLocal(f.createdAt))}"/>
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
                ${safeImageSrc(f.cover) ? `
                  <img src="${escapeHtml(safeImageSrc(f.cover))}" alt="capa" class="admin-dropzone-preview"/>
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
            <input type="text" id="f-cover" name="cover" value="${escapeHtml(isEnderecoImagemAceito(f.cover) ? f.cover : '')}" placeholder="https://... ou img/blog/foto.png"/>
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
              <span><strong>Publicação:</strong> ${formatDateTime(f.createdAt)}</span>
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
        <button class="admin-btn" type="button" id="exportMdBtn" title="Baixa este post como arquivo .md pra data/posts/">
          ${ICONS.save} Baixar .md
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
  const publishedAtInput = document.getElementById('f-publishedAt');
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

  // Slug digitado vira kebab-case no blur (sem acento, espaço ou caractere YAML)
  slugInput.addEventListener('blur', () => {
    if (slugInput.value.trim()) slugInput.value = slugify(slugInput.value);
  });

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
    const seguro = safeImageSrc(src);
    if (seguro) {
      content.innerHTML = `
        <img src="${escapeHtml(seguro)}" alt="capa" class="admin-dropzone-preview"/>
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

  /* Marca o campo como inválido. A borda vai inline porque o blog.css não tem
     estado de inválido pra esse input (e o CSS não é deste grupo de arquivos). */
  const marcarCoverInvalido = (invalido) => {
    coverInput.classList.toggle('is-invalid', invalido);
    coverInput.style.borderColor = invalido ? '#e05260' : '';
    if (invalido) coverInput.setAttribute('aria-invalid', 'true');
    else coverInput.removeAttribute('aria-invalid');
  };

  /* URL manual — sobrescreve a imagem enviada (não pode ter as duas).
     O endereço passa pela allowlist de esquema ANTES de virar a capa: enquanto
     o que está digitado não é aceito, a capa não muda, o campo fica marcado
     como inválido e o aviso aparece quando o campo perde o foco (avisar a cada
     tecla enquanto se digita "https://" seria só barulho). Salvar com endereço
     inválido é bloqueado no submitForm. */
  coverInput.addEventListener('input', () => {
    const v = coverInput.value.trim();
    if (!v) {
      marcarCoverInvalido(false);
      if (!DATA_URL_BITMAP.test(state.form.cover || '')) {
        // Não havia upload guardado: limpar o campo limpa a capa.
        state.form.cover = '';
        renderCoverDropzone(null);
      }
      return;
    }
    const aceito = isEnderecoImagemAceito(v);
    marcarCoverInvalido(!aceito);
    if (aceito) {
      state.form.cover = v;
      renderCoverDropzone(v);
    }
  });

  coverInput.addEventListener('blur', () => {
    const v = coverInput.value.trim();
    if (v && !isEnderecoImagemAceito(v)) toast(AVISO_ENDERECO_IMAGEM, 'error');
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
        <img src="${escapeHtml(safeImageSrc(im && im.src))}" alt="" loading="lazy"/>
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

  // Status: agendamento ainda não publica sozinho (vira rascunho).
  // A data de publicação é outro campo — grava em created_at, não agenda.
  statusSelect.addEventListener('change', () => {
    if (statusSelect.value === 'scheduled') {
      toast('Agendamento ainda não está ativo: o post será salvo como rascunho. A data de publicação acima continua valendo quando você publicar.', 'error');
    }
  });

  /* Preview: pinta na hora com o que estiver disponível e, se o marked
     ainda não chegou da CDN, repinta quando ele carregar. */
  const renderPreview = () => {
    const md = contentEditor.value;
    previewBox.innerHTML = markdownToHtml(md);
    if (getMarkedParser()) return;
    ensureMarked().then((parser) => {
      if (!parser) {
        if (!markedWarned) {
          markedWarned = true;
          toast('Preview em modo simples: não consegui carregar o marked da CDN.', 'error');
        }
        return;
      }
      if (previewBox.classList.contains('active')) previewBox.innerHTML = markdownToHtml(md);
    });
  };

  // Tabs (write/preview/help)
  document.querySelectorAll('.admin-editor-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-editor-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      contentEditor.classList.toggle('hidden', which !== 'write');
      previewBox.classList.toggle('active', which === 'preview');
      helpBox.classList.toggle('active', which === 'help');
      if (which === 'preview') renderPreview();
    });
  });

  // Deixa o marked pronto antes do primeiro clique em Preview
  ensureMarked();

  // Word count update
  contentEditor.addEventListener('input', updateCounts);

  /* ===== Toolbar do editor: só markdown de verdade (GFM) ===== */
  const SNIPPETS = {
    heading2:  { wrap: ['## ', ''], placeholder: 'Subtítulo' },
    heading3:  { wrap: ['### ', ''], placeholder: 'Seção' },
    bold:      { wrap: ['**', '**'], placeholder: 'texto em negrito' },
    italic:    { wrap: ['*', '*'], placeholder: 'texto em itálico' },
    strike:    { wrap: ['~~', '~~'], placeholder: 'texto riscado' },
    code:      { wrap: ['`', '`'], placeholder: 'código' },
    link:      { wrap: ['[', '](https://)'], placeholder: 'texto do link' },
    image:     { wrap: ['![', '](https://)'], placeholder: 'alt da imagem' },
    quote:     { wrap: ['> ', ''], placeholder: 'citação aqui' },
    ul:        { block: '- item\n- outro item\n- mais um' },
    ol:        { block: '1. primeiro\n2. segundo\n3. terceiro' },
    task:      { block: '- [ ] tarefa pendente\n- [x] tarefa concluída' },
    hr:        { block: '---' },
    codeblock: { block: '```js\n// código\n```' },
    table:     { block: '| Coluna | Valor |\n| --- | --- |\n| linha 1 | 10 |\n| linha 2 | 20 |' },
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

  /* ===== .md: importar e baixar =====
     O editor trabalha no formato de data/posts/<slug>.md. Importar lê o
     front-matter YAML e preenche o formulário; baixar devolve o mesmo
     formato, pronto pra rodar `npm run build:posts`. Isso é o caminho
     MANUAL: publicar pelo painel já dispara o rebuild sozinho. */
  const mdFileInput = document.getElementById('mdFileInput');
  const mdIoBar = document.getElementById('mdIoBar');
  const mdIoMsg = document.getElementById('mdIoMsg');

  const setMdMsg = (text, kind) => {
    if (!mdIoMsg) return;
    mdIoMsg.textContent = text || '';
    mdIoMsg.classList.toggle('is-error', kind === 'error');
    mdIoMsg.classList.toggle('is-ok', kind === 'ok');
    mdIoMsg.hidden = !text;
  };

  const isMarkdownFile = (file) =>
    /\.(md|markdown)$/i.test(file.name || '') ||
    /^text\/(markdown|x-markdown)$/i.test(file.type || '');

  /* Joga o front-matter nos campos do formulário.
     Devolve a lista do que foi preenchido (só pra mensagem). */
  const applyFrontMatter = (data) => {
    const applied = [];
    const setInput = (el, value, label) => {
      if (!el || value === undefined || value === null || value === '') return;
      el.value = String(value);
      applied.push(label);
    };

    setInput(titleInput, data.title, 'título');
    setInput(document.getElementById('f-subtitle'), data.subtitle, 'subtítulo');
    setInput(document.getElementById('f-author'), data.author, 'autor');

    if (data.slug) {
      slugInput.value = String(data.slug);
      slugManuallyEdited = true;
      applied.push('slug');
    }

    if (data.category) {
      const cat = String(data.category);
      const catSelect = document.getElementById('f-category');
      if (catSelect) {
        if (!Array.from(catSelect.options).some(o => o.value === cat)) {
          catSelect.appendChild(new Option(cat, cat));
        }
        catSelect.value = cat;
        applied.push('categoria');
      }
    }

    if (data.status) {
      const st = String(data.status).toLowerCase();
      if (['draft', 'published', 'scheduled'].includes(st)) {
        statusSelect.value = st;
        applied.push('status');
      }
    }

    if (typeof data.featured === 'boolean') {
      const featuredChk = document.getElementById('f-featured');
      if (featuredChk) {
        featuredChk.checked = data.featured;
        applied.push('destaque');
      }
    }

    /* Arquivo .md é entrada não confiável: a capa e as imagens passam pela
       mesma allowlist do campo digitado antes de entrar no formulário. */
    if (data.cover) {
      const capa = String(data.cover);
      if (safeImageSrc(capa)) {
        state.form.cover = capa;
        coverInput.value = isEnderecoImagemAceito(capa) ? capa : '';
        renderCoverDropzone(capa);
        applied.push('capa');
      } else {
        toast('A capa do arquivo .md foi ignorada. ' + AVISO_ENDERECO_IMAGEM, 'error');
      }
    }
    if (data.coverAlt) state.form.coverAlt = String(data.coverAlt);
    /* linkedinUrl só existe no arquivo .md (o banco não tem essa coluna), mas
       o build imprime esse valor como href, então só http(s) entra. */
    if (data.linkedinUrl) {
      const link = String(data.linkedinUrl);
      if (isEnderecoHttp(link)) state.form.linkedinUrl = link;
      else toast('O linkedinUrl do arquivo .md foi ignorado: use um endereço http(s).', 'error');
    }

    /* id e datas do arquivo ficam guardados só pra voltar no download.
       Nunca sobrescrevem state.form.id: o id do banco manda no CRUD. */
    if (data.date) {
      state.form.importedDate = String(data.date);
      if (publishedAtInput) {
        publishedAtInput.value = toDatetimeLocal(data.date);
        applied.push('data');
      }
    }
    if (data.updated) state.form.importedUpdated = String(data.updated);

    if (Array.isArray(data.tags)) {
      state.form.tags = data.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
      renderTags();
      document.getElementById('f-tags-input')?.blur();
      applied.push('tags');
    }

    if (Array.isArray(data.images)) {
      const brutas = data.images
        .map(im => (typeof im === 'string' ? { src: im } : im))
        .filter(im => im && im.src);
      const aceitas = brutas.filter(im => safeImageSrc(im.src));
      state.form.images = aceitas
        .map(im => ({ src: String(im.src), alt: String(im.alt || ''), caption: String(im.caption || '') }));
      imagesRender();
      const recusadas = brutas.length - aceitas.length;
      if (recusadas > 0) {
        toast(recusadas + ' imagem(ns) do .md ignorada(s). ' + AVISO_ENDERECO_IMAGEM, 'error');
      }
      applied.push('imagens');
    }

    return applied;
  };

  const applyMarkdownText = (text, filename) => {
    const parsed = parseFrontMatter(text);
    contentEditor.value = parsed.body;
    state.form.content = parsed.body;
    updateCounts();
    if (previewBox.classList.contains('active')) renderPreview();

    if (!parsed.data) {
      setMdMsg(`Corpo carregado de ${filename}. Não achei front-matter, então os campos ficaram como estavam.`, 'ok');
      toast('Markdown carregado no corpo do post.');
      return;
    }

    const applied = applyFrontMatter(parsed.data);
    if (!parsed.data.slug && !slugInput.value) {
      const fromName = slugify(String(filename || '').replace(/\.(md|markdown)$/i, ''));
      if (fromName) {
        slugInput.value = fromName;
        slugManuallyEdited = true;
        applied.push('slug (do nome do arquivo)');
      }
    }
    setMdMsg(
      applied.length
        ? `${filename} importado. Preenchi: ${applied.join(', ')}.`
        : `${filename} importado. Só o corpo veio preenchido.`,
      'ok'
    );
    toast('Arquivo .md importado.');
  };

  const readMarkdownFile = (file) => {
    if (!file) return;
    if (!isMarkdownFile(file)) {
      setMdMsg(`"${file.name}" não é um arquivo .md. Aceito só .md ou .markdown.`, 'error');
      toast('Arquivo ignorado: use .md ou .markdown.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => applyMarkdownText(String(reader.result || ''), file.name);
    reader.onerror = () => {
      setMdMsg('Não consegui ler esse arquivo. Tente de novo.', 'error');
      toast('Falha ao ler o arquivo .md', 'error');
    };
    reader.readAsText(file, 'utf-8');
  };

  document.getElementById('importMdBtn')?.addEventListener('click', () => mdFileInput?.click());
  mdFileInput?.addEventListener('change', (e) => {
    readMarkdownFile(e.target.files?.[0]);
    e.target.value = ''; // deixa reimportar o mesmo arquivo
  });

  /* Drag and drop de .md sobre o editor (textarea e barra .md) */
  const dragHasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files');
  const setMdDragState = (on) => {
    contentEditor.classList.toggle('is-md-dragover', on);
    mdIoBar?.classList.toggle('is-md-dragover', on);
  };

  [contentEditor, mdIoBar].filter(Boolean).forEach(zone => {
    ['dragenter', 'dragover'].forEach(ev => {
      zone.addEventListener(ev, (e) => {
        if (!dragHasFiles(e)) return; // arrastar texto continua normal
        e.preventDefault();
        setMdDragState(true);
      });
    });
    zone.addEventListener('dragleave', (e) => {
      // ignora a saída pra dentro de um filho (senão o destaque pisca)
      if (e.relatedTarget && zone.contains(e.relatedTarget)) return;
      setMdDragState(false);
    });
    zone.addEventListener('drop', (e) => {
      if (!dragHasFiles(e)) return;
      e.preventDefault();
      setMdDragState(false);
      readMarkdownFile(e.dataTransfer.files[0]);
    });
  });

  /* Baixa o post como data/posts/<slug>.md */
  const exportMd = () => {
    const data = gatherExportPost();
    const filename = (data.slug || slugify(data.title || 'post') || 'post') + '.md';
    downloadAsFile(filename, postToMarkdown(data), 'text/markdown');
    setMdMsg(`${filename} baixado. Coloque em data/posts/ e rode npm run build:posts.`, 'ok');
    toast(`Baixei ${filename}`);
  };
  document.getElementById('exportMdBtn')?.addEventListener('click', exportMd);
  document.getElementById('exportMdBarBtn')?.addEventListener('click', exportMd);

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
  /* id entre aspas: é o único campo do front-matter que não passa por
     slugify nem por um select, e sem aspas um valor com `:` ou `#` quebraria
     o YAML do arquivo baixado. */
  if (post.id) fm.push(`id: "${escapeFrontMatterString(post.id)}"`);
  fm.push(`title: "${escapeFrontMatterString(post.title || '')}"`);
  if (post.subtitle) fm.push(`subtitle: "${escapeFrontMatterString(post.subtitle)}"`);
  fm.push(`slug: ${post.slug || slugify(post.title || 'post')}`);
  fm.push(`date: "${post.createdAt || new Date().toISOString()}"`);
  fm.push(`updated: "${post.updatedAt || post.createdAt || new Date().toISOString()}"`);
  if (post.category) fm.push(`category: "${escapeFrontMatterString(post.category)}"`);
  if (post.tags?.length) {
    fm.push('tags:');
    post.tags.forEach(t => fm.push(`  - "${escapeFrontMatterString(t)}"`));
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


function gatherFormData() {
  const form = document.getElementById('postForm');
  const fd = new FormData(form);

  // Cover: prioriza URL manual se preenchida, senão usa o data URL do state.
  const manualCover = fd.get('cover')?.trim() || '';
  const cover = manualCover || state.form.cover || '';

  return {
    title: fd.get('title')?.trim() || '',
    subtitle: fd.get('subtitle')?.trim() || '',
    slug: slugify(fd.get('slug')) || slugify(fd.get('title')) || uid(),
    cover,
    tags: state.form.tags || [],
    images: state.form.images || [],
    category: fd.get('category') || 'Outro',
    author: fd.get('author')?.trim() || 'Bernardo Iannini',
    status: fd.get('status') || 'draft',
    publishedAt: fromDatetimeLocal(fd.get('publishedAt')),
    featured: !!fd.get('featured'),
    content: fd.get('content') || '',
  };
}

/* Payload do download .md: o formulário + os campos que só existem no
   arquivo (id, date, updated, coverAlt, linkedinUrl). Assim um .md
   importado volta completo, sem perder nada no caminho. */
function gatherExportPost() {
  const data = gatherFormData();
  const f = state.form || {};
  data.id = f.id || f.importedId || '';
  data.createdAt = data.publishedAt || f.createdAt || f.importedDate || '';
  data.updatedAt = f.updatedAt || f.importedUpdated || '';
  data.coverAlt = f.coverAlt || '';
  data.linkedinUrl = f.linkedinUrl || '';
  return data;
}

async function submitForm() {
  if (state.saving) return;   // duplo clique / Ctrl+S repetido não salva duas vezes
  const data = gatherFormData();

  if (!data.title) {
    toast('O título é obrigatório.', 'error');
    document.getElementById('f-title')?.focus();
    return;
  }
  if (!data.publishedAt) {
    toast('A data de publicação é obrigatória.', 'error');
    document.getElementById('f-publishedAt')?.focus();
    return;
  }
  if (!data.content || data.content.trim().length < 10) {
    toast('Conteúdo muito curto.', 'error');
    document.getElementById('f-content')?.focus();
    return;
  }

  /* Endereço de imagem: última barreira antes de gravar no banco. Esse valor
     sai daqui direto pro site publicado (src da capa e da galeria), então
     endereço fora da allowlist não é salvo, nem com aviso, nem "por enquanto".
     safeImageSrc ainda aceita a capa antiga em data:image de bitmap pra não
     travar a edição de post velho. */
  if (data.cover && !safeImageSrc(data.cover)) {
    toast('Capa não salva. ' + AVISO_ENDERECO_IMAGEM, 'error');
    document.getElementById('f-cover')?.focus();
    return;
  }
  const imagemRuim = (data.images || []).findIndex(im => !im || !safeImageSrc(im.src));
  if (imagemRuim >= 0) {
    toast('A imagem ' + (imagemRuim + 1) + ' do post tem endereço não aceito. ' + AVISO_ENDERECO_IMAGEM, 'error');
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
    createdAt: data.publishedAt,
  };

  /* Trava anti duplo clique (mesmo padrão do login em blog-auth.js):
     desabilita os botões enquanto o save está pendente e libera no finally. */
  state.saving = true;
  const saveBtns = ['saveDraftBtn', 'publishBtn']
    .map(id => document.getElementById(id)).filter(Boolean);
  saveBtns.forEach(b => { b.disabled = true; });

  /* O mesmo guard cobre o rebuild: o botão só volta quando o site já foi
     avisado, senão dá pra clicar em publicar duas vezes no meio do caminho. */
  const publishBtn = document.getElementById('publishBtn');
  const publishLabel = publishBtn ? publishBtn.innerHTML : '';

  let featuredWarn = '';
  let rebuild = null;
  let desativado = false;   // saiu do ar (era publicado, virou rascunho)
  toast('Salvando no Supabase...');
  try {
    if (editing) {
      await window.BlogDB.update(editing.id, post);
    } else {
      await window.BlogDB.create(post);
    }
    // Destaque único: o banco não impõe, então desmarca o featured dos outros.
    if (post.featured) {
      const { error } = await window.BlogDB.raw
        .from('posts')
        .update({ featured: false })
        .eq('featured', true)
        .neq('id', post.id);
      if (error) featuredWarn = ' Atenção: não consegui desmarcar o destaque dos outros posts (' + (error.message || error) + ').';
    }
    state.posts = await window.BlogDB.listAll();

    /* Precisa avisar o build (quem gera a página estática) em DOIS casos:
       publicando, e DESPUBLICANDO um post que estava no ar. Sem o segundo,
       virar rascunho deixaria a página antiga acessível no site até o
       próximo deploy. Rascunho que nunca foi publicado não gasta deploy.
       triggerRebuild não lança: se falhar, o post continua salvo. */
    const despublicando = !!editing && editing.status === 'published' && status !== 'published';
    if (status === 'published' || despublicando) {
      if (publishBtn) publishBtn.innerHTML = ICONS.paperplane + ' Publicando...';
      toast(despublicando ? 'Tirando do site...' : 'Publicando no site...');
      const motivo = despublicando
        ? 'post despublicado: '
        : (editing ? 'post atualizado: ' : 'post publicado: ');
      rebuild = await triggerRebuild(motivo + slug);
      desativado = despublicando;
    }
  } catch (err) {
    toast('Erro ao salvar: ' + (err && err.message || err), 'error');
    return;
  } finally {
    state.saving = false;
    saveBtns.forEach(b => { b.disabled = false; });
    if (publishBtn) publishBtn.innerHTML = publishLabel;
  }

  /* Toast honesto: rascunho fica só no banco; publicado depende do rebuild
     pra virar página estática no ar. */
  let aviso;
  if (status === 'published') {
    aviso = rebuildMessage('Post publicado', 'Post salvo', rebuild);
  } else if (desativado) {
    // Era publicado e virou rascunho: o rebuild é o que tira a página do ar.
    aviso = rebuildMessage('Post tirado do site', 'Post salvo como rascunho', rebuild);
  } else if (data.status === 'scheduled') {
    aviso = { msg: 'Agendamento ainda não está ativo: salvei como rascunho. A data de publicação ficou gravada e vale quando você publicar.', type: 'error' };
  } else {
    aviso = { msg: 'Rascunho salvo. Ele não vai pro site.', type: 'success' };
  }
  toast(aviso.msg + featuredWarn, (featuredWarn || aviso.type === 'error') ? 'error' : 'success');
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
        /* Mesmo guard de duplo clique do save: o botão fica travado até o
           rebuild responder. */
        delBtn.disabled = true;
        toast('Excluindo...');
        window.BlogDB.remove(id).then(async () => {
          /* Quem tira posts/<slug>.html do ar é o build, não o banco: sem
             rebuild a página continua publicada mesmo com o post apagado.
             Vem ANTES do listAll: se recarregar a lista falhar, o post já
             saiu do banco e a página não pode ficar no ar por causa disso. */
          const rebuild = await triggerRebuild('post excluido: ' + (post.slug || post.id));
          const aviso = rebuildMessage('Post excluído', 'Post excluído do banco', rebuild);
          try {
            state.posts = await window.BlogDB.listAll();
          } catch (e) {
            // Excluiu e avisou o site; só a lista da tela ficou velha.
            state.posts = (state.posts || []).filter(p => p.id !== id);
          }
          toast(aviso.msg, aviso.type);
          if (state.editingId === id) { state.editingId = null; state.view = 'posts'; }
          render();
        }).catch((err) => {
          delBtn.disabled = false;
          toast('Erro ao excluir: ' + (err && err.message || err), 'error');
        });
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
          slug: slugify(post.slug || post.title) + '-copia-' + Math.random().toString(36).slice(2, 5),
          /* A cópia não reintroduz endereço de imagem recusado. */
          cover: safeImageSrc(post.cover) ? post.cover : '',
          coverAlt: post.coverAlt || '',
          tags: post.tags || [],
          images: (post.images || []).filter(im => im && safeImageSrc(im.src)),
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
      /* encodeURIComponent no slug: o valor vem do banco e vai pra query
         string. post.html já filtra o parâmetro, mas o painel não manda
         caractere solto pra URL. */
      const slug = encodeURIComponent(viewBtn.dataset.viewPost || '');
      window.open('post.html?slug=' + slug, '_blank', 'noopener');
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

/* =========================================================
   SESSÃO — logout automático por inatividade
   ---------------------------------------------------------
   O token do Supabase se renova sozinho, então uma aba do painel esquecida
   aberta continuaria valendo por tempo indeterminado. Depois de 60 minutos
   SEM nenhuma interação (mouse, teclado, toque, rolagem) a sessão é encerrada
   de verdade (signOut, que apaga as chaves sb-* do localStorage), a tela é
   limpa e aparece a explicação com o caminho de volta pro login.

   60 minutos é longo de propósito: ficar meia hora escrevendo em silêncio é
   normal e derrubar a sessão no meio do texto seria pior que o problema que
   isso resolve. Qualquer interação reinicia a contagem.

   O timer é reiniciado no máximo uma vez a cada 30 segundos: mousemove
   dispara centenas de vezes por segundo e não vale trocar o timeout em todas.
   Na prática o limite fica entre 60 e 60,5 minutos.
   ========================================================= */
const IDLE_LIMITE_MS = 60 * 60 * 1000;
const IDLE_RESET_THROTTLE_MS = 30 * 1000;
const IDLE_EVENTOS = ['mousedown', 'mousemove', 'keydown', 'wheel', 'touchstart', 'touchmove', 'scroll'];

let idleTimer = null;
let idleUltimoReset = 0;
let idleEncerrando = false;

function reiniciarIdle() {
  if (idleEncerrando) return;
  const agora = Date.now();
  if (idleTimer && (agora - idleUltimoReset) < IDLE_RESET_THROTTLE_MS) return;
  idleUltimoReset = agora;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(encerrarPorInatividade, IDLE_LIMITE_MS);
}

function pararRelogioIdle() {
  clearTimeout(idleTimer);
  idleTimer = null;
  IDLE_EVENTOS.forEach(ev => window.removeEventListener(ev, reiniciarIdle, true));
  document.removeEventListener('visibilitychange', idleVisibilidade);
}

function idleVisibilidade() {
  if (!document.hidden) reiniciarIdle();
}

function iniciarRelogioIdle() {
  IDLE_EVENTOS.forEach(ev => window.addEventListener(ev, reiniciarIdle, { passive: true, capture: true }));
  document.addEventListener('visibilitychange', idleVisibilidade);
  idleUltimoReset = 0;
  reiniciarIdle();
}

async function encerrarPorInatividade() {
  if (idleEncerrando) return;
  /* Salvando agora: não derruba a sessão no meio da gravação. Espera mais um
     minuto e tenta de novo. */
  if (state.saving) {
    idleTimer = setTimeout(encerrarPorInatividade, 60 * 1000);
    idleUltimoReset = Date.now();
    return;
  }
  idleEncerrando = true;
  pararRelogioIdle();
  try {
    await window.BlogDB.signOut();
  } catch (e) {
    /* signOut não lança; e mesmo em falha de rede ele limpa as chaves sb-*. */
  }
  mostrarSessaoEncerrada();
}

/* Limpa a tela (nada do post fica visível pra quem chegar depois) e explica
   o que aconteceu. Sem redirecionamento automático de propósito: se a aba
   ficou sozinha, a mensagem precisa estar aqui quando alguém voltar. */
function mostrarSessaoEncerrada() {
  setSidebarStatus('sessão encerrada');
  const conteudo = document.getElementById('adminContent');
  if (conteudo) conteudo.innerHTML = '';
  document.getElementById('adminToast')?.remove();
  document.getElementById('adminIdleOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'adminIdleOverlay';
  overlay.setAttribute('role', 'alertdialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999',
    'display:flex', 'align-items:center', 'justify-content:center',
    'padding:24px', 'background:#0b0b0f', 'color:#f4f4f6',
    'font-family:inherit', 'text-align:center',
  ].join(';');
  overlay.innerHTML = `
    <div style="max-width:460px">
      <h2 style="font-size:22px;margin:0 0 12px">Sessão encerrada por inatividade</h2>
      <p style="line-height:1.7;margin:0 0 8px;opacity:.85">
        Passou 1 hora sem nenhuma interação, então o painel encerrou a sessão sozinho
        para que ninguém continue de onde você parou.
      </p>
      <p style="line-height:1.7;margin:0 0 20px;opacity:.6;font-size:13px">
        Alterações que você não tinha salvo foram perdidas. Entre de novo para continuar.
      </p>
      <button type="button" id="adminIdleLoginBtn"
        style="cursor:pointer;border:0;border-radius:10px;padding:12px 20px;font-size:14px;font-weight:600;background:#f4f4f6;color:#0b0b0f">
        Entrar de novo
      </button>
    </div>`;
  document.body.appendChild(overlay);
  const btn = document.getElementById('adminIdleLoginBtn');
  btn?.addEventListener('click', () => { location.replace('bernardolindao.html'); });
  btn?.focus();
}

/* ---------- Init ---------- */

/* Erro de rede/DNS (backend fora do ar), e não credencial ou dado inválido. */
const isNetworkError = (err) => {
  const m = (err && err.message || String(err || '')).toLowerCase();
  return (err && err.name === 'TypeError') || /failed to fetch|networkerror|fetch|network|dns/.test(m);
};

/* Sidebar: mostra quem está logado de verdade (email da sessão). */
function renderSidebarUser(session) {
  const email = session && session.user && session.user.email || '';
  const name = email ? email.split('@')[0] : 'admin';
  const nameEl = document.querySelector('.admin-user-name');
  const avatarEl = document.querySelector('.admin-user-avatar');
  if (nameEl) { nameEl.textContent = name; nameEl.title = email; }
  if (avatarEl) avatarEl.textContent = (name.charAt(0) || 'B').toUpperCase();
}

function setSidebarStatus(text) {
  const el = document.querySelector('.admin-user-status');
  if (el) el.textContent = text;
}

function renderServerOffline(err) {
  const el = document.getElementById('adminContent');
  if (!el) return;
  const net = isNetworkError(err);
  setSidebarStatus('offline');
  el.innerHTML = `
    <header class="admin-header">
      <div>
        <h1 class="admin-title">${net ? 'Servidor de dados <em>indisponível</em>' : 'Não consegui falar com o <em>Supabase</em>'}</h1>
        <p class="admin-title-sub">${net ? 'O banco Supabase não respondeu (falha de rede ou DNS). Sem ele o painel não lê nem grava posts.' : 'O painel lê e grava os posts no banco Supabase.'}</p>
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
    /* Sem sessão local. Se o backend estiver fora do ar o login também não
       funcionaria: avisa aqui em vez de redirecionar mudo pro login. */
    try {
      const { error: pingErr } = await window.BlogDB.raw.from('posts').select('id').limit(1);
      if (pingErr && isNetworkError(pingErr)) { renderServerOffline(pingErr); return; }
    } catch (err) {
      if (isNetworkError(err)) { renderServerOffline(err); return; }
    }
    location.replace('bernardolindao.html');
    return;
  }

  renderSidebarUser(session);
  attachGlobalEvents();
  try {
    state.posts = await window.BlogDB.listAll();
  } catch (err) {
    console.error('[admin] Supabase indisponível:', err);
    renderServerOffline(err);
    return;
  }
  setSidebarStatus('online');
  render();

  /* Relógio de inatividade só depois que a sessão foi confirmada. */
  iniciarRelogioIdle();
}

document.addEventListener('DOMContentLoaded', init);
