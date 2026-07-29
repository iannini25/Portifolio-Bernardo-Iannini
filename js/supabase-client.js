'use strict';

/* =========================================================
   SUPABASE CLIENT — data layer do blog (window.BlogDB)
   ---------------------------------------------------------
   Pré-requisitos (carregar ANTES deste arquivo):
     1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     2. <script src="/js/supabase-config.js"></script>

   Expõe window.BlogDB com a API usada por blog.js / blog-post.js /
   blog-admin.js / blog-auth.js. Tudo assíncrono (Promises).

   Mapeamento: o banco usa snake_case (cover_alt, created_at) e o app
   usa camelCase (coverAlt, createdAt) — convertido aqui nas pontas.
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
      const { data, error } = await sb
        .from('posts').select('*').eq('slug', slug).maybeSingle();
      if (error) throw error;
      return fromRow(data);
    },

    async getById(id) {
      const { data, error } = await sb
        .from('posts').select('*').eq('id', id).maybeSingle();
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
      const { data, error } = await sb
        .from('posts').update(toRow(patch)).eq('id', id).select().single();
      if (error) throw error;
      return fromRow(data);
    },

    async remove(id) {
      const { error } = await sb.from('posts').delete().eq('id', id);
      if (error) throw error;
    },

    /* Incrementa views de forma atômica (RPC, não exige login) */
    async incrementViews(slug) {
      try {
        await sb.rpc('increment_post_views', { post_slug: slug });
      } catch (e) {
        console.warn('[BlogDB] incrementViews falhou:', e?.message || e);
      }
    },

    /* ===================== STORAGE ===================== */

    /* Sobe um arquivo pro bucket blog-images e devolve a URL pública.
       folder: subpasta lógica (ex: 'covers', 'gallery'). */
    async uploadImage(file, folder = 'covers') {
      const safe = (file.name || 'img')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const ext = (safe.split('.').pop() || 'png');
      const base = safe.replace(/\.[^.]+$/, '').slice(0, 40) || 'img';
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}.${ext}`;

      const { error } = await sb.storage
        .from('blog-images')
        .upload(path, file, { cacheControl: '31536000', upsert: false });
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
      try { await sb.auth.signOut(); } catch (e) { /* noop */ }
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
