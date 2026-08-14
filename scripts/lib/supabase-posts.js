'use strict';

/* =========================================================
   lib/supabase-posts.js
   ---------------------------------------------------------
   Le os posts publicados direto do Supabase (REST) e devolve
   no MESMO shape que loadPosts() de build-posts.js produz, pra
   as duas fontes poderem ser mescladas sem tratamento extra.

   Config, nesta ordem:
     1. process.env.SUPABASE_URL + SUPABASE_ANON_KEY
     2. parse de js/supabase-config.js (a anon key e publica por
        design; o RLS protege). Assim o build roda na Vercel sem
        precisar de env var nenhuma.

   FAIL-SOFT (regra dura): qualquer erro - config ausente, DNS,
   timeout, 4xx/5xx, JSON invalido - loga aviso e devolve
   { ok: false, posts: [] }. O deploy NUNCA quebra porque o
   banco caiu.

   POR QUE { ok, posts } e nao so o array: "o banco respondeu e
   esta vazio" e "nao consegui falar com o banco" precisam ser
   distinguiveis. Como o banco e hoje a fonte principal (o repo
   pode ter zero .md), tratar os dois como [] faria o build apagar
   os posts publicados do site num blip de rede, com exit 0 e sem
   ninguem perceber. Quem consome DEVE checar o ok antes de
   reescrever ou limpar qualquer saida.
   ========================================================= */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..', '..');
const CONFIG_FILE = path.join(ROOT, 'js', 'supabase-config.js');
const TIMEOUT_MS  = 15000;
const AUTHOR_NAME = 'Bernardo Iannini';

/* slugify compartilhado com build-posts.js. Mora aqui pra nao
   duplicar a regra e pra nao criar require circular entre os dois
   (build-posts importa esta lib, nunca o contrario). */
const slugify = (s) => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const warn = (msg) => console.warn(`[supabase-posts] ${msg}`);

/* Tira a barra final pra montar a URL do REST sem // no meio. */
const trimSlash = (u) => String(u || '').trim().replace(/\/+$/, '');

/* =========================================================
   Config
   ========================================================= */

/* Le url e anonKey do literal em js/supabase-config.js.
   Regex simples de proposito: o arquivo e curto e escrito a mao. */
function readConfigFromFile() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    const src = fs.readFileSync(CONFIG_FILE, 'utf8');
    const url     = (src.match(/url\s*:\s*['"`]([^'"`]+)['"`]/)     || [])[1];
    const anonKey = (src.match(/anonKey\s*:\s*['"`]([^'"`]+)['"`]/) || [])[1];
    if (!url || !anonKey) return null;
    if (/COLE_AQUI/i.test(url) || /COLE_AQUI/i.test(anonKey)) return null;
    return { url: trimSlash(url), anonKey, origin: 'js/supabase-config.js' };
  } catch (e) {
    warn(`nao consegui ler ${path.relative(ROOT, CONFIG_FILE)}: ${e.message}`);
    return null;
  }
}

function resolveConfig() {
  const envUrl = trimSlash(process.env.SUPABASE_URL);
  const envKey = String(process.env.SUPABASE_ANON_KEY || '').trim();
  if (envUrl && envKey) return { url: envUrl, anonKey: envKey, origin: 'env' };
  // Meia config nas env vars quase sempre e engano (ex: apontar staging e
  // esquecer a chave). Avisa alto, senao o build usa producao caladinho.
  if (envUrl || envKey) {
    warn(`env var pela metade (${envUrl ? 'SUPABASE_URL sem SUPABASE_ANON_KEY' : 'SUPABASE_ANON_KEY sem SUPABASE_URL'}) - ignorando as duas e usando js/supabase-config.js.`);
  }
  return readConfigFromFile();
}

/* =========================================================
   Row do banco -> post do build
   ========================================================= */

/* images e jsonb: aceita [{src,alt,caption}] e tambem lista de
   strings (formato antigo). Descarta item sem src. */
function normalizeImages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    const img = (typeof item === 'string') ? { src: item } : item;
    if (!img || typeof img !== 'object') continue;
    const src = String(img.src || img.url || '').trim();
    if (!src) continue;
    const entry = {
      src,
      alt: img.alt || '',
      caption: img.caption || '',
    };
    if (img.width)  entry.width  = img.width;
    if (img.height) entry.height = img.height;
    out.push(entry);
  }
  return out;
}

function mapRow(row) {
  if (!row || typeof row !== 'object') return null;

  // slug sempre passa pelo slugify (kebab-case, sem espaco, / ou ../:
  // o build escreve posts/<slug>.html e nao pode sair da pasta).
  const slug  = slugify(row.slug || row.title);
  const title = String(row.title || '').trim();
  if (!slug || !title) return null;   // row incompleta: fora

  const tags    = Array.isArray(row.tags) ? row.tags : (row.tags ? [row.tags] : []);
  const images  = normalizeImages(row.images);
  const date    = row.created_at || row.createdAt || new Date().toISOString();
  const updated = row.updated_at || row.updatedAt || date;

  return {
    id: row.id || slug,
    slug,
    title,
    subtitle: row.subtitle || '',
    category: row.category || 'Blog',
    tags,
    cover: row.cover || (images[0] && images[0].src) || '',
    coverAlt: row.cover_alt || row.coverAlt || `${title} - ${AUTHOR_NAME}`,
    images,
    linkedinUrl: row.linkedin_url || row.linkedinUrl || '',
    featured: !!row.featured,
    status: row.status || 'published',
    views: Number(row.views) || 0,
    date,
    updated,
    author: row.author || AUTHOR_NAME,
    content: String(row.content || '').trim(),
    source: 'supabase',
  };
}

/* =========================================================
   Busca
   ========================================================= */

/* Devolve { ok, posts }. ok=false significa "nao deu pra saber o que tem
   no banco": quem consome nao pode apagar nem reescrever saida nesse caso. */
const failed = () => ({ ok: false, posts: [] });

async function fetchSupabasePosts() {
  if (typeof fetch !== 'function') {
    warn('fetch global indisponivel (precisa de Node >= 18) - seguindo so com os .md locais.');
    return failed();
  }

  const cfg = resolveConfig();
  if (!cfg) {
    warn('config ausente (SUPABASE_URL/SUPABASE_ANON_KEY ou js/supabase-config.js) - seguindo so com os .md locais.');
    return failed();
  }

  const endpoint = `${cfg.url}/rest/v1/posts?select=*&status=eq.published&order=created_at.desc`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        Accept: 'application/json',
      },
      // Timeout curto: build de deploy nao pode ficar pendurado no banco.
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      const detail = String(await res.text().catch(() => '')).slice(0, 200).replace(/\s+/g, ' ').trim();
      warn(`HTTP ${res.status} ao listar posts${detail ? `: ${detail}` : ''} - seguindo so com os .md locais.`);
      return failed();
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) {
      warn('resposta inesperada do REST (nao veio array) - seguindo so com os .md locais.');
      return failed();
    }

    const mapped = rows.map(mapRow).filter(Boolean);
    const posts  = mapped.filter(p => p.status === 'published');

    // Conta separado: row incompleta (sem slug/title) e um problema de dado,
    // draft filtrado aqui e comportamento normal. Somar os dois mente no log.
    const incomplete = rows.length - mapped.length;
    console.log(`[supabase-posts] ${posts.length} post(s) publicado(s) do banco (config: ${cfg.origin})`
      + (incomplete > 0 ? ` - ${incomplete} row(s) ignorada(s) sem slug ou title` : ''));

    return { ok: true, posts };
  } catch (e) {
    const reason = (e && e.name === 'TimeoutError')
      ? `timeout de ${TIMEOUT_MS}ms`
      : ((e && e.message) || String(e));
    warn(`falha ao consultar o Supabase (${reason}) - seguindo so com os .md locais.`);
    return failed();
  }
}

module.exports = { fetchSupabasePosts, slugify };
