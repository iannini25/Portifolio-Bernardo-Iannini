'use strict';

/* =========================================================
   SUPABASE CLIENT — data layer do blog (window.BlogDB)
   ---------------------------------------------------------
   Pré-requisitos (carregar ANTES deste arquivo):
     1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     2. <script src="/js/supabase-config.js"></script>

   Expõe window.BlogDB com a API usada por blog.js /
   blog-admin.js / blog-auth.js. Tudo assíncrono (Promises).

   Mapeamento: o banco usa snake_case (cover_alt, created_at) e o app
   usa camelCase (coverAlt, createdAt) — convertido aqui nas pontas.

   Sobre "injeção de SQL": nada aqui monta SQL. Toda consulta passa pelo
   supabase-js, que fala com o PostgREST e envia cada filtro como VALOR
   parametrizado (`.eq('slug', x)` nunca é concatenado dentro de uma query).
   Por isso não existe filtro de entrada mágico neste arquivo: quem controla
   o acesso aos dados são as policies de RLS no banco. O que este arquivo faz
   é normalizar a entrada (slug/id sempre string, no formato canônico) pra
   nunca cair num filtro estranho por acidente, e nunca construir string de
   filtro por concatenação (sem `.or('...' + valor)`).
   ========================================================= */

(function () {
  const cfg = window.SUPABASE_CONFIG;

  if (!cfg || !cfg.url || /COLE_AQUI/.test(cfg.url)) {
    console.error('[BlogDB] js/supabase-config.js não configurado.');
    window.BlogDB = null;
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.error('[BlogDB] supabase-js não carregou — inclua o <script> da CDN antes deste arquivo.');
    window.BlogDB = null;
    return;
  }

  const sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  /* ---- Normalização da entrada dos filtros ----
     Mesma regra de slug do resto do projeto (blog-admin.js e
     scripts/lib/supabase-posts.js): minúsculas, sem acento, só a-z 0-9 e
     hífen, no máximo 80 caracteres. Slug válido passa igual; qualquer coisa
     fora do formato (aspas, ponto e vírgula, espaço, objeto) é reduzida ao
     formato canônico antes de virar valor de filtro. */
  const normalizeSlug = (s) => String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);

  /* id é `text` livre no banco (gerado por uid() no painel). Não dá pra impor
     formato sem quebrar registro antigo, então garante só o tipo (string) e um
     teto de tamanho. */
  const normalizeId = (v) => String(v == null ? '' : v).trim().slice(0, 128);

  /* Upload: allowlist de tipo de imagem. Defesa em profundidade honesta — quem
     tem o token pode falar direto com a API do Storage, então o limite que
     realmente vale é o do bucket (Allowed MIME types + File size limit, no
     painel do Supabase). Aqui o objetivo é não deixar o painel subir .html,
     .svg (SVG executa script) ou arquivo gigante por acidente. */
  const MIME_IMAGEM = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
  };
  const TAMANHO_MAX_UPLOAD = 10 * 1024 * 1024;

  /* ---- Mapeamento DB (snake_case) <-> App (camelCase) ---- */
  const fromRow = (r) => !r ? null : ({
    id:        r.id,
    slug:      r.slug,
    title:     r.title || '',
    subtitle:  r.subtitle || '',
    cover:     r.cover || '',
    coverAlt:  r.cover_alt || '',
    category:  r.category || '',
    author:    r.author || 'Bernardo Iannini',
    tags:      Array.isArray(r.tags) ? r.tags : [],
    images:    Array.isArray(r.images) ? r.images : [],
    content:   r.content || '',
    status:    r.status || 'draft',
    featured:  !!r.featured,
    views:     r.views || 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });

  const toRow = (p) => {
    const row = {};
    const map = {
      id: 'id', slug: 'slug', title: 'title', subtitle: 'subtitle',
      cover: 'cover', coverAlt: 'cover_alt', category: 'category',
      author: 'author', tags: 'tags', images: 'images', content: 'content',
      status: 'status', featured: 'featured',
      createdAt: 'created_at',
    };
    for (const k in map) {
      if (p[k] !== undefined) row[map[k]] = p[k];
    }
    return row;
  };

  window.BlogDB = {
    raw: sb,
    ready: true,

    /* ===================== POSTS ===================== */

    /* Lista posts publicados (site público) */
    async listPublished() {
      const { data, error } = await sb
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(fromRow);
    },

    /* Lista TODOS os posts (admin — inclui rascunhos) */
    async listAll() {
      const { data, error } = await sb
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(fromRow);
    },

    async getBySlug(slug) {
      const alvo = normalizeSlug(slug);
      if (!alvo) return null;
      const { data, error } = await sb
        .from('posts').select('*').eq('slug', alvo).maybeSingle();
      if (error) throw error;
      return fromRow(data);
    },

    async getById(id) {
      const alvo = normalizeId(id);
      if (!alvo) return null;
      const { data, error } = await sb
        .from('posts').select('*').eq('id', alvo).maybeSingle();
      if (error) throw error;
      return fromRow(data);
    },

    async create(post) {
      const { data, error } = await sb
        .from('posts').insert(toRow(post)).select().single();
      if (error) throw error;
      return fromRow(data);
    },

    async update(id, patch) {
      const alvo = normalizeId(id);
      if (!alvo) throw new Error('update sem id');
      const { data, error } = await sb
        .from('posts').update(toRow(patch)).eq('id', alvo).select().single();
      if (error) throw error;
      return fromRow(data);
    },

    async remove(id) {
      const alvo = normalizeId(id);
      if (!alvo) throw new Error('remove sem id');
      const { error } = await sb.from('posts').delete().eq('id', alvo);
      if (error) throw error;
    },

    /* Incrementa views de forma atômica (RPC, não exige login).
       Hoje ninguém chama: o site conta views no localStorage (post-static.js).
       O slug vai normalizado igual ao resto — a RPC usa parâmetro vinculado
       (`where slug = post_slug`), então o valor nunca virou SQL. */
    async incrementViews(slug) {
      const alvo = normalizeSlug(slug);
      if (!alvo) return;
      try {
        await sb.rpc('increment_post_views', { post_slug: alvo });
      } catch (e) {
        console.warn('[BlogDB] incrementViews falhou:', e?.message || e);
      }
    },

    /* ===================== STORAGE ===================== */

    /* Sobe um arquivo pro bucket blog-images e devolve a URL pública.
       folder: subpasta lógica ('covers' ou 'gallery').

       O tipo vem do MIME real do File, não da extensão que o nome traz: a
       extensão gravada é a do MIME da allowlist, então um "foto.html" com
       image/png sai como .png, e um arquivo image/svg+xml é recusado antes
       de sair da máquina. */
    async uploadImage(file, folder = 'covers') {
      if (!file) throw new Error('Nenhum arquivo pra enviar');

      const mime = String(file.type || '').toLowerCase();
      const ext = MIME_IMAGEM[mime];
      if (!ext) {
        throw new Error('Tipo de arquivo não aceito (' + (mime || 'desconhecido') + '). Use PNG, JPG, WebP, AVIF ou GIF.');
      }
      if (typeof file.size === 'number' && file.size > TAMANHO_MAX_UPLOAD) {
        throw new Error('Arquivo muito grande (máx 10MB).');
      }

      const pasta = folder === 'gallery' ? 'gallery' : 'covers';
      const safe = (file.name || 'img')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const base = safe.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'img';
      const path = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}.${ext}`;

      const { error } = await sb.storage
        .from('blog-images')
        .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: mime });
      if (error) throw error;

      const { data } = sb.storage.from('blog-images').getPublicUrl(path);
      return data.publicUrl;
    },

    /* ===================== AUTH ===================== */

    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    async signOut() {
      /* signOut do supabase-js não lança: retorna {error}. Em falha de
         rede o gotrue NÃO limpa a sessão local, então removemos as
         chaves sb-* do localStorage na mão pra garantir o logout
         mesmo com o backend fora do ar. */
      let falhou = false;
      try {
        const { error } = await sb.auth.signOut();
        falhou = !!error;
      } catch (e) { falhou = true; }
      if (falhou) {
        try {
          const chaves = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf('sb-') === 0) chaves.push(k);
          }
          chaves.forEach((k) => localStorage.removeItem(k));
        } catch (e2) { /* noop */ }
      }
    },

    async getSession() {
      const { data } = await sb.auth.getSession();
      return data.session || null;
    },

    async isAuthed() {
      return !!(await this.getSession());
    },

    onAuthChange(cb) {
      return sb.auth.onAuthStateChange((_event, session) => cb(session));
    },
  };
})();
