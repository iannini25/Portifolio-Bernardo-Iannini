-- =====================================================================
-- SUPABASE SCHEMA, blog do Bernardo Iannini
-- ---------------------------------------------------------------------
-- Cole este arquivo INTEIRO no SQL Editor do Supabase e clique em "Run".
-- Cria: tabela `posts`, índices, trigger de updated_at, a função de
-- views, o RLS (segurança) e o bucket de imagens `blog-images`.
-- É idempotente, pode rodar de novo sem quebrar nada.
--
-- ESTE ARQUIVO JÁ NASCE ENDURECIDO: escrita só do dono, leitura pública
-- apenas de post publicado, upload só de imagem. O irmão dele,
-- supabase/hardening.sql, aplica exatamente o mesmo estado em um banco
-- que já existe e explica em detalhe o porquê de cada regra. Os dois
-- terminam no mesmo lugar, então rodar um depois do outro é seguro.
-- Se mudar uma regra de segurança aqui, mude lá também.
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
-- 2) TRIGGER, mantém updated_at sempre atualizado
--    O "set search_path" fixo é o que o linter do Supabase pede: sem
--    ele, os nomes usados dentro da função dependem de quem chama.
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 3) QUEM É O DONO
--    O UID é o do único usuário do projeto. Ele manda em toda a escrita
--    do blog, tanto na tabela quanto no bucket de imagens.
--    Trocou de conta? Pegue o novo em Authentication > Users (campo
--    "User UID"), ou com: select id, email from auth.users;
--    Depois troque só aqui e rode este arquivo de novo.
-- ---------------------------------------------------------------------
create or replace function public.is_blog_owner()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.uid() = '1d6251aa-8ee4-48b0-aafe-22540cd14338'::uuid, false);
$$;

comment on function public.is_blog_owner() is
  'True somente para o UID do dono do blog. Usada nas policies de RLS de public.posts e de storage.objects. Trocar o UID aqui muda tudo de uma vez.';

-- Quem avalia a policy é o papel que fez a requisição, então anon e
-- authenticated precisam poder executar esta função.
revoke all privileges on function public.is_blog_owner() from public;
grant execute on function public.is_blog_owner() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4) RPC, incrementa o contador de views de forma atômica
--    Chamada pelo site público, sem login. É SECURITY DEFINER (roda com
--    o poder do dono do banco e ignora o RLS), então o search_path fixo
--    não é opcional: sem ele, dá search_path hijacking. Só conta post
--    publicado, e slug inexistente não gera erro.
--    O risco de alguém inflar o contador via curl está documentado em
--    supabase/hardening.sql, seção 4.1.
-- ---------------------------------------------------------------------
drop function if exists public.increment_post_views(text);

create function public.increment_post_views(post_slug text)
returns void
language sql
security definer
set search_path = ''
as $$
  -- post_slug é parâmetro vinculado, não texto colado na consulta
  update public.posts
     set views = views + 1
   where slug   = post_slug
     and status = 'published';
$$;

comment on function public.increment_post_views(text) is
  'Contador de views do site publico. SECURITY DEFINER com search_path fixo; so conta post publicado; slug inexistente nao gera erro.';

revoke all privileges on function public.increment_post_views(text) from public;
grant execute on function public.increment_post_views(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 5) ROW LEVEL SECURITY
--    Leitura pública só de post publicado (é disso que o site e o build
--    da Vercel dependem). Leitura total, criação, edição e exclusão só
--    do dono. Um usuário logado que não seja o dono não escreve nada.
-- ---------------------------------------------------------------------
alter table public.posts enable row level security;

-- Limpa TODAS as policies da tabela antes de recriar. Policies
-- permissivas somam com OU, então uma sobra antiga com using (true)
-- anularia tudo abaixo sem dar erro nenhum.
do $$
declare
  nomes text[];
  nome  text;
begin
  select coalesce(array_agg(policyname::text), '{}'::text[])
    into nomes
    from pg_policies
   where schemaname = 'public'
     and tablename  = 'posts';

  foreach nome in array nomes loop
    execute format('drop policy if exists %I on public.posts', nome);
  end loop;
end $$;

-- Qualquer visitante lê post PUBLICADO
create policy "posts_public_read"
  on public.posts for select
  to anon, authenticated
  using (status = 'published');

-- O dono lê TUDO, inclusive rascunho
create policy "posts_owner_read_all"
  on public.posts for select
  to authenticated
  using ( (select public.is_blog_owner()) );

-- Só o dono cria
create policy "posts_owner_insert"
  on public.posts for insert
  to authenticated
  with check ( (select public.is_blog_owner()) );

-- Só o dono edita (using: quais linhas ele pega; with check: como a
-- linha pode ficar depois)
create policy "posts_owner_update"
  on public.posts for update
  to authenticated
  using      ( (select public.is_blog_owner()) )
  with check ( (select public.is_blog_owner()) );

-- Só o dono apaga
create policy "posts_owner_delete"
  on public.posts for delete
  to authenticated
  using ( (select public.is_blog_owner()) );

-- ---------------------------------------------------------------------
-- 6) PRIVILÉGIOS
--    O RLS filtra LINHA, o grant libera a OPERAÇÃO. Por padrão o
--    Supabase dá insert, update e delete pro papel anon em toda tabela
--    nova do schema public. O visitante nunca escreve, então tiramos.
--    TRUNCATE sai dos dois papéis porque TRUNCATE não passa por RLS.
--    Concede primeiro, revoga depois: o site nunca fica sem poder ler.
-- ---------------------------------------------------------------------
grant  select on table public.posts to anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.posts from anon;

grant  select, insert, update, delete on table public.posts to authenticated;
revoke truncate, references, trigger on table public.posts from authenticated;

-- Ninguém que vem pela API precisa criar objeto no banco, e sem poder
-- criar não há onde plantar a isca do search_path hijacking. Protegido
-- num bloco porque um erro de permissão solto aqui desfaria o arquivo
-- inteiro (o SQL Editor roda tudo como uma transação só).
do $$
begin
  revoke create on schema public from anon, authenticated;
exception
  when insufficient_privilege then
    raise notice 'nao foi possivel revogar CREATE no schema public (sem permissao). Por padrao esses papeis ja nao tem esse privilegio no Supabase.';
end $$;

-- ---------------------------------------------------------------------
-- 7) STORAGE, bucket público de imagens do blog
--    Leitura pública (o site mostra as imagens), upload e alteração só
--    do dono e só de arquivo com extensão de imagem. Sem svg e sem
--    html: arquivo desses servido pelo bucket abre na origem do seu
--    projeto Supabase, do lado do seu Auth, e serve de página falsa de
--    login. O porquê completo está em supabase/hardening.sql, seção 5.
--
--    Os dois blocos abaixo engolem erro de permissão de propósito: em
--    alguns projetos o SQL Editor não pode mexer em storage. Se cair no
--    aviso, faça pela interface (ver supabase/storage-setup.sql).
-- ---------------------------------------------------------------------
do $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'blog-images', 'blog-images', true,
    10485760,  -- 10 MB, o mesmo teto que js/supabase-client.js checa antes de enviar
    array['image/png','image/jpeg','image/webp','image/avif','image/gif']
  )
  on conflict (id) do update
    set public             = true,
        file_size_limit    = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;
exception
  when insufficient_privilege then
    raise notice 'SEM PERMISSAO pra criar/configurar o bucket pelo SQL. Faca em Storage > New bucket (blog-images, publico) e depois em Settings ajuste "File size limit" = 10 MB e "Allowed MIME types" = image/png, image/jpeg, image/webp, image/avif, image/gif. NAO inclua image/svg+xml.';
end $$;

do $$
declare
  nomes text[];
  nome  text;
begin
  -- Apaga só policy que fale deste bucket, pra não tocar em outro
  select coalesce(array_agg(policyname::text), '{}'::text[])
    into nomes
    from pg_policies
   where schemaname = 'storage'
     and tablename  = 'objects'
     and (coalesce(qual, '') like '%blog-images%'
       or coalesce(with_check, '') like '%blog-images%'
       or policyname like 'blog\_images%');

  foreach nome in array nomes loop
    execute format('drop policy if exists %I on storage.objects', nome);
  end loop;

  -- Qualquer um VÊ as imagens
  create policy "blog_images_public_read"
    on storage.objects for select
    using (bucket_id = 'blog-images');

  -- Só o dono FAZ UPLOAD, e só de imagem
  create policy "blog_images_owner_insert"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'blog-images'
      and (select public.is_blog_owner())
      and lower(name) ~ '\.(png|jpe?g|webp|gif|avif)$'
      and name !~ '\.\./'
    );

  -- Só o dono SUBSTITUI, e o nome novo também tem que ser de imagem
  create policy "blog_images_owner_update"
    on storage.objects for update
    to authenticated
    using (
      bucket_id = 'blog-images'
      and (select public.is_blog_owner())
    )
    with check (
      bucket_id = 'blog-images'
      and (select public.is_blog_owner())
      and lower(name) ~ '\.(png|jpe?g|webp|gif|avif)$'
      and name !~ '\.\./'
    );

  -- Só o dono APAGA (sem exigir extensão: precisa poder limpar lixo)
  create policy "blog_images_owner_delete"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'blog-images'
      and (select public.is_blog_owner())
    );
exception
  when insufficient_privilege then
    raise notice 'SEM PERMISSAO pra mexer nas policies de storage.objects pelo SQL. Faca pela interface: Storage > Policies. O passo a passo esta em supabase/storage-setup.sql.';
end $$;

-- =====================================================================
-- FIM. Depois de rodar, vá em Table Editor > posts pra confirmar.
-- Pra ver o resultado das regras de segurança, rode a seção 7 de
-- supabase/hardening.sql (ela só lê, não altera nada).
-- =====================================================================
