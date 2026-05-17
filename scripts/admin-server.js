#!/usr/bin/env node
'use strict';

/* =========================================================
   admin-server.js
   ---------------------------------------------------------
   Servidor LOCAL do painel admin. Roda na sua maquina com:

       npm run admin

   O que ele faz:
     - Serve o site estatico (admin.html, blog.html, css, js...)
     - Expoe uma API REST que le/grava DIRETO em data/posts/*.md
       (essa pasta e a UNICA fonte de verdade dos posts)
     - Apos cada gravacao/exclusao roda scripts/build-posts.js
       sozinho, mantendo blog.html / posts/ / sitemap em sincronia

   Resultado: o painel admin fica 100% alinhado com o blog.
   "Publicar" publica de verdade. "Excluir" apaga de verdade.

   IMPORTANTE: isto roda so localmente. O deploy continua sendo
   o site estatico gerado (GitHub Pages / Netlify / Vercel) -
   voce edita aqui, comita o resultado e faz deploy normal.
   ========================================================= */

const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const url    = require('url');
const { execFile } = require('child_process');
const matter = require('gray-matter');

const ROOT      = path.resolve(__dirname, '..');
const POSTS_SRC = path.join(ROOT, 'data', 'posts');
const POSTS_OUT = path.join(ROOT, 'posts');
const BUILD     = path.join(ROOT, 'scripts', 'build-posts.js');
const PORT      = process.env.ADMIN_PORT || 4000;

/* ---------- util ---------- */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.xml':  'application/xml; charset=utf-8',
  '.pdf':  'application/pdf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain; charset=utf-8',
};

const slugify = (s) => String(s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .slice(0, 80);

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 12 * 1024 * 1024) {     // 12MB hard cap
        reject(new Error('Corpo da requisicao grande demais'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

/* ---------- posts: ler data/posts/*.md ---------- */

function listPostFiles() {
  if (!fs.existsSync(POSTS_SRC)) return [];
  return fs.readdirSync(POSTS_SRC)
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(POSTS_SRC, f));
}

// Converte um .md no formato que o painel admin espera (createdAt/updatedAt...)
function fileToAdminPost(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const base = path.basename(file, '.md');
  const slug = (data.slug || slugify(base)).toLowerCase();
  const createdAt = data.date || data.createdAt || new Date().toISOString();
  const updatedAt = data.updated || data.updatedAt || createdAt;
  return {
    id: String(data.id || slug),
    title: data.title || 'Sem titulo',
    subtitle: data.subtitle || '',
    slug,
    cover: data.cover || '',
    coverAlt: data.coverAlt || data.cover_alt || '',
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
    images: Array.isArray(data.images) ? data.images : [],
    category: data.category || 'Outro',
    author: data.author || 'Bernardo Iannini',
    status: data.status || 'published',
    featured: !!data.featured,
    linkedinUrl: data.linkedinUrl || data.linkedin_url || '',
    scheduledAt: data.scheduledAt || null,
    createdAt: typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString(),
    updatedAt: typeof updatedAt === 'string' ? updatedAt : new Date(updatedAt).toISOString(),
    content: String(content || '').trim(),
    _file: path.basename(file),
  };
}

function loadAllPosts() {
  const out = [];
  for (const f of listPostFiles()) {
    try { out.push(fileToAdminPost(f)); }
    catch (e) { console.error(`[admin-server] erro lendo ${f}:`, e.message); }
  }
  return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Caminho seguro do .md a partir de um slug (impede path traversal)
function postFilePath(slug) {
  const safe = slugify(slug);
  if (!safe) return null;
  return path.join(POSTS_SRC, `${safe}.md`);
}

// Tira featured de todos os outros .md (so 1 destaque por vez)
function clearFeaturedExcept(keepSlug) {
  for (const f of listPostFiles()) {
    if (path.basename(f, '.md') === slugify(keepSlug)) continue;
    try {
      let raw = fs.readFileSync(f, 'utf8');
      if (/^featured:\s*true\s*$/m.test(raw)) {
        raw = raw.replace(/^featured:\s*true\s*$/m, 'featured: false');
        fs.writeFileSync(f, raw, 'utf8');
      }
    } catch (e) { /* ignora */ }
  }
}

function runBuild() {
  return new Promise((resolve) => {
    execFile(process.execPath, [BUILD], { cwd: ROOT }, (err, stdout, stderr) => {
      if (err) console.error('[admin-server] build falhou:', stderr || err.message);
      else console.log('[admin-server] build-posts OK');
      resolve(!err);
    });
  });
}

/* ---------- API ---------- */

async function handleApi(req, res, pathname) {
  // GET /api/posts  -> lista TODOS (inclui rascunhos) = espelho de data/posts/
  if (req.method === 'GET' && pathname === '/api/posts') {
    return sendJson(res, 200, { ok: true, posts: loadAllPosts() });
  }

  // POST /api/posts -> cria/atualiza. Body: { slug, oldSlug, markdown, featured }
  if (req.method === 'POST' && pathname === '/api/posts') {
    let payload;
    try { payload = JSON.parse(await readBody(req)); }
    catch { return sendJson(res, 400, { ok: false, error: 'JSON invalido' }); }

    const slug = slugify(payload.slug || '');
    if (!slug) return sendJson(res, 400, { ok: false, error: 'slug obrigatorio' });
    if (typeof payload.markdown !== 'string' || !payload.markdown.trim()) {
      return sendJson(res, 400, { ok: false, error: 'markdown vazio' });
    }

    if (!fs.existsSync(POSTS_SRC)) fs.mkdirSync(POSTS_SRC, { recursive: true });

    const dst = postFilePath(slug);
    fs.writeFileSync(dst, payload.markdown, 'utf8');

    // Slug mudou no editar -> remove o arquivo antigo e o html gerado
    const oldSlug = slugify(payload.oldSlug || '');
    if (oldSlug && oldSlug !== slug) {
      const oldMd = postFilePath(oldSlug);
      if (oldMd && fs.existsSync(oldMd)) fs.unlinkSync(oldMd);
      const oldHtml = path.join(POSTS_OUT, `${oldSlug}.html`);
      if (fs.existsSync(oldHtml)) fs.unlinkSync(oldHtml);
    }

    if (payload.featured) clearFeaturedExcept(slug);

    await runBuild();
    return sendJson(res, 200, { ok: true, slug, posts: loadAllPosts() });
  }

  // POST /api/upload -> salva uma imagem em img/posts/<slug>/<arquivo>
  // Body: { slug, filename, dataBase64 }  (dataBase64 = conteudo cru, sem o data:)
  if (req.method === 'POST' && pathname === '/api/upload') {
    let payload;
    try { payload = JSON.parse(await readBody(req)); }
    catch { return sendJson(res, 400, { ok: false, error: 'JSON invalido' }); }

    const slug = slugify(payload.slug || '');
    if (!slug) return sendJson(res, 400, { ok: false, error: 'slug obrigatorio' });
    if (!payload.dataBase64) return sendJson(res, 400, { ok: false, error: 'imagem vazia' });

    // Nome de arquivo seguro + extensao a partir do nome original
    const orig = String(payload.filename || 'imagem.jpg');
    const ext = (orig.match(/\.(jpe?g|png|webp|gif)$/i) || [, 'jpg'])[1].toLowerCase();
    const stem = slugify(orig.replace(/\.[^.]+$/, '')) || 'img';
    const dir = path.join(ROOT, 'img', 'posts', slug);
    fs.mkdirSync(dir, { recursive: true });

    let name = `${stem}.${ext}`;
    let n = 1;
    while (fs.existsSync(path.join(dir, name))) name = `${stem}-${n++}.${ext}`;

    try {
      fs.writeFileSync(path.join(dir, name), Buffer.from(payload.dataBase64, 'base64'));
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: 'falha ao gravar imagem: ' + e.message });
    }
    return sendJson(res, 200, { ok: true, path: `/img/posts/${slug}/${name}` });
  }

  // DELETE /api/posts/<slug> -> apaga .md + html gerado
  const delMatch = pathname.match(/^\/api\/posts\/(.+)$/);
  if (req.method === 'DELETE' && delMatch) {
    const slug = slugify(decodeURIComponent(delMatch[1]));
    const md = postFilePath(slug);
    if (!md || !fs.existsSync(md)) {
      return sendJson(res, 404, { ok: false, error: 'post nao encontrado' });
    }
    fs.unlinkSync(md);
    const html = path.join(POSTS_OUT, `${slug}.html`);
    if (fs.existsSync(html)) fs.unlinkSync(html);
    await runBuild();
    return sendJson(res, 200, { ok: true, posts: loadAllPosts() });
  }

  return sendJson(res, 404, { ok: false, error: 'rota nao encontrada' });
}

/* ---------- static ---------- */

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  // normaliza e garante que fica dentro do ROOT
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(abs, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404</h1><p>Nao encontrado: ' + rel + '</p>');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(abs).pipe(res);
  });
}

/* ---------- server ---------- */

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname).catch((e) => {
      console.error('[admin-server] erro API:', e);
      sendJson(res, 500, { ok: false, error: e.message });
    });
    return;
  }
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log('');
  console.log('==================================================');
  console.log('  Painel admin local rodando');
  console.log('==================================================');
  console.log(`  Login:  http://localhost:${PORT}/bernardolindao.html`);
  console.log(`  Admin:  http://localhost:${PORT}/admin.html`);
  console.log(`  Blog:   http://localhost:${PORT}/blog.html`);
  console.log('');
  console.log('  Fonte unica dos posts: data/posts/*.md');
  console.log('  Publicar / Excluir gravam no arquivo e rodam o build.');
  console.log('  Ctrl+C para parar.');
  console.log('==================================================');
});
