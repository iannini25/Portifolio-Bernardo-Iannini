-- =====================================================================
-- STORAGE SETUP — bucket de imagens do blog (blog-images)
-- ---------------------------------------------------------------------
-- O bucket não foi criado quando o schema.sql rodou. Cole este arquivo
-- no SQL Editor do Supabase e clique em "Run".
--
-- Se der erro "must be owner of table objects" nas linhas de policy,
-- use o caminho pela interface (descrito no fim deste arquivo).
-- =====================================================================

-- 1) Cria o bucket público
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- 2) Policies do bucket
drop policy if exists "blog_images_public_read" on storage.objects;
drop policy if exists "blog_images_auth_write"  on storage.objects;
drop policy if exists "blog_images_auth_update" on storage.objects;
drop policy if exists "blog_images_auth_delete" on storage.objects;

create policy "blog_images_public_read"
  on storage.objects for select
  using (bucket_id = 'blog-images');

create policy "blog_images_auth_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images');

create policy "blog_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images');

create policy "blog_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images');

-- =====================================================================
-- ALTERNATIVA pela interface (se o SQL acima falhar nas policies):
--
-- 1. Menu Storage → New bucket
--    - Name: blog-images
--    - Public bucket: LIGADO
--    - Create
--
-- 2. Aba "Policies" do bucket → New policy → "For full customization"
--    Crie 1 policy de INSERT:
--      - Allowed operation: INSERT
--      - Target roles: authenticated
--      - WITH CHECK: bucket_id = 'blog-images'
--    (leitura pública já vem habilitada por ser bucket Public)
-- =====================================================================
