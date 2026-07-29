-- =====================================================================
-- SUPABASE SCHEMA — Blog do Bernardo Iannini
-- ---------------------------------------------------------------------
-- Cole este arquivo INTEIRO no SQL Editor do Supabase e clique em "Run".
-- Cria: tabela `posts`, índices, RLS (segurança), trigger de updated_at,
-- e as policies do bucket de imagens `blog-images`.
-- É idempotente — pode rodar de novo sem quebrar nada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TABELA DE POSTS
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id          text primary key default ('p_' || substr(md5(random()::text), 1, 16)),
  slug        text not null unique,
  title       text not null,
  subtitle    text default '',
  cover       text default '',
  cover_alt   text default '',
  category    text default '',
  author      text default 'Bernardo Iannini',
  tags        text[] default '{}',
  images      jsonb default '[]'::jsonb,   -- galeria: [{src, alt, caption}]
  content     text default '',            -- markdown
  status      text not null default 'draft' check (status in ('draft','published')),
  featured    boolean not null default false,
  views       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índices pra listagem rápida
create index if not exists posts_status_idx     on public.posts (status);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_slug_idx       on public.posts (slug);

-- ---------------------------------------------------------------------
-- 2) TRIGGER — mantém updated_at sempre atualizado
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 3) RPC — incrementa o contador de views de forma atômica
--    (chamada pelo site público sem precisar de login)
-- ---------------------------------------------------------------------
create or replace function public.increment_post_views(post_slug text)
returns void language sql security definer as $$
  update public.posts set views = views + 1 where slug = post_slug;
$$;

-- ---------------------------------------------------------------------
-- 4) ROW LEVEL SECURITY
--    Leitura pública só de posts publicados.
--    Escrita (criar/editar/apagar) só para usuários logados.
-- ---------------------------------------------------------------------
alter table public.posts enable row level security;

-- Limpa policies antigas pra poder rodar de novo
drop policy if exists "posts_public_read"   on public.posts;
drop policy if exists "posts_auth_read_all" on public.posts;
drop policy if exists "posts_auth_insert"   on public.posts;
drop policy if exists "posts_auth_update"   on public.posts;
drop policy if exists "posts_auth_delete"   on public.posts;

-- Qualquer visitante lê posts PUBLICADOS
create policy "posts_public_read"
  on public.posts for select
  using (status = 'published');

-- Usuário logado (admin) lê TUDO, inclusive rascunhos
create policy "posts_auth_read_all"
  on public.posts for select
  to authenticated
  using (true);

-- Só logado cria
create policy "posts_auth_insert"
  on public.posts for insert
  to authenticated
  with check (true);

-- Só logado edita
create policy "posts_auth_update"
  on public.posts for update
  to authenticated
  using (true) with check (true);

-- Só logado apaga
create policy "posts_auth_delete"
  on public.posts for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 5) STORAGE — bucket público de imagens do blog
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- Policies do bucket
drop policy if exists "blog_images_public_read"  on storage.objects;
drop policy if exists "blog_images_auth_write"   on storage.objects;
drop policy if exists "blog_images_auth_update"  on storage.objects;
drop policy if exists "blog_images_auth_delete"  on storage.objects;

-- Qualquer um VÊ as imagens
create policy "blog_images_public_read"
  on storage.objects for select
  using (bucket_id = 'blog-images');

-- Só logado FAZ UPLOAD
create policy "blog_images_auth_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images');

-- Só logado SUBSTITUI
create policy "blog_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images');

-- Só logado APAGA
create policy "blog_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images');

-- =====================================================================
-- FIM. Depois de rodar, vá em Table Editor → posts pra confirmar.
-- =====================================================================
