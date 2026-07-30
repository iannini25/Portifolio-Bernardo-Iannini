-- =====================================================================
-- STORAGE SETUP, bucket de imagens do blog (blog-images)
-- ---------------------------------------------------------------------
-- Use este arquivo quando SÓ a parte de Storage precisar ser criada ou
-- corrigida (por exemplo: o bucket não nasceu quando o schema.sql
-- rodou). Cole no SQL Editor do Supabase e clique em "Run".
-- É idempotente e não apaga imagem nenhuma.
--
-- O que ele deixa configurado:
--   . bucket público, teto de 10 MB por arquivo;
--   . só tipos de imagem (sem image/svg+xml, sem text/html);
--   . leitura pública, porque o site mostra as imagens;
--   . upload, substituição e exclusão SÓ do dono do blog.
--
-- POR QUE BLOQUEAR HTML E SVG NUM BUCKET SÓ DE LEITURA PÚBLICA:
-- o arquivo é servido pela origem do SEU projeto Supabase
-- (rnupfyzpwwvspiwnttsl.supabase.co), não por bernardoiannini.com. Ele
-- não lê a sessão do painel, que fica no localStorage do seu domínio,
-- mas dá um domínio com a sua cara pra montar uma página falsa de login,
-- transforma sua conta em hospedagem de arquivo qualquer, e um SVG com
-- script aberto pela URL executa nessa origem, do lado do seu Auth.
--
-- Este arquivo é a mesma configuração que já vem em supabase/schema.sql
-- e em supabase/hardening.sql. Se mudar aqui, mude lá também.
-- Se der erro de permissão ("must be owner of table objects"), use o
-- caminho pela interface, descrito no fim do arquivo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Depende de quem é o dono
--    A função public.is_blog_owner() guarda o UID do dono e é criada
--    por supabase/schema.sql ou por supabase/hardening.sql. Sem ela as
--    policies abaixo não fazem sentido, então paramos aqui com um aviso
--    claro em vez de criar meia configuração.
-- ---------------------------------------------------------------------
do $$
begin
  if to_regprocedure('public.is_blog_owner()') is null then
    raise exception
      'Rode primeiro supabase/hardening.sql (ou supabase/schema.sql): a funcao public.is_blog_owner() ainda nao existe neste banco.';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 1) Cria o bucket público, com teto de tamanho e lista de tipos
--    O teto de 10 MB e a lista de tipos são os mesmos que o painel checa
--    antes de enviar (TAMANHO_MAX_UPLOAD e MIME_IMAGEM em
--    js/supabase-client.js). Se mudar aqui, mude lá também, senão o
--    painel aceita um arquivo que o servidor vai recusar depois.
-- ---------------------------------------------------------------------
do $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values (
    'blog-images', 'blog-images', true,
    10485760,
    array['image/png','image/jpeg','image/webp','image/avif','image/gif']
  )
  on conflict (id) do update
    set public             = true,
        file_size_limit    = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

  raise notice 'bucket blog-images pronto: publico, teto de 10 MB, so tipos de imagem.';
exception
  when insufficient_privilege then
    raise notice 'SEM PERMISSAO pra criar/configurar o bucket pelo SQL. Use o caminho pela interface descrito no fim deste arquivo.';
end $$;

-- ---------------------------------------------------------------------
-- 2) Policies do bucket
--    Tudo em um bloco só: se faltar permissão no meio, o bloco inteiro
--    volta atrás e o bucket não fica sem policy de upload.
-- ---------------------------------------------------------------------
do $$
declare
  nomes text[];
  nome  text;
begin
  -- Apaga só as policies que falam deste bucket, inclusive as criadas
  -- pela interface com outro nome, pra não tocar em nenhum outro bucket
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
    raise notice 'policy antiga removida: %', nome;
  end loop;

  -- Leitura pública: o site mostra as imagens e o Open Graph precisa que
  -- a capa abra sem login
  create policy "blog_images_public_read"
    on storage.objects for select
    using (bucket_id = 'blog-images');

  -- Upload só do dono, e só arquivo com extensão de imagem. O painel
  -- sempre grava .jpg ou .png, porque recodifica antes de subir.
  create policy "blog_images_owner_insert"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'blog-images'
      and (select public.is_blog_owner())
      and lower(name) ~ '\.(png|jpe?g|webp|gif|avif)$'
      and name !~ '\.\./'
    );

  -- Substituir: mesma regra na linha atual e na nova, senão daria pra
  -- subir .jpg e renomear pra .html depois
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

  -- Apagar: só o dono. Sem exigir extensão de imagem de propósito, pra
  -- você poder limpar arquivo estranho que tenha sobrado de antes.
  create policy "blog_images_owner_delete"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'blog-images'
      and (select public.is_blog_owner())
    );

  raise notice 'policies do bucket blog-images prontas.';
exception
  when insufficient_privilege then
    raise notice 'SEM PERMISSAO pra mexer nas policies de storage.objects pelo SQL. Use o caminho pela interface descrito no fim deste arquivo.';
end $$;

-- ---------------------------------------------------------------------
-- 3) Conferência (só lê, não altera nada)
-- ---------------------------------------------------------------------
select
  policyname                 as politica,
  cmd                        as operacao,
  roles::text                as papeis,
  coalesce(qual, with_check) as condicao
from pg_policies
where schemaname = 'storage'
  and tablename  = 'objects'
order by operacao, politica;

-- =====================================================================
-- ALTERNATIVA pela interface (se o SQL acima falhar por permissão):
--
-- 1. Menu Storage > New bucket
--      Name: blog-images
--      Public bucket: LIGADO
--      Additional configuration:
--        File size limit: 10 MB
--        Allowed MIME types: image/png, image/jpeg, image/webp,
--                            image/avif, image/gif
--      (NÃO inclua image/svg+xml. Nunca inclua text/html.)
--    Se o bucket já existe, os mesmos campos estão em
--    Storage > blog-images > Settings.
--
-- 2. Aba "Policies" do bucket > New policy > "For full customization".
--    Crie três policies. Em todas, troque o UID pelo seu se a conta
--    mudar (Authentication > Users, campo "User UID").
--
--    a) UPLOAD
--       Policy name: blog_images_owner_insert
--       Allowed operation: INSERT
--       Target roles: authenticated
--       WITH CHECK:
--         bucket_id = 'blog-images'
--         and auth.uid() = '1d6251aa-8ee4-48b0-aafe-22540cd14338'::uuid
--         and lower(name) ~ '\.(png|jpe?g|webp|gif|avif)$'
--
--    b) SUBSTITUIR
--       Policy name: blog_images_owner_update
--       Allowed operation: UPDATE
--       Target roles: authenticated
--       USING e WITH CHECK: a mesma expressão do item (a)
--
--    c) APAGAR
--       Policy name: blog_images_owner_delete
--       Allowed operation: DELETE
--       Target roles: authenticated
--       USING:
--         bucket_id = 'blog-images'
--         and auth.uid() = '1d6251aa-8ee4-48b0-aafe-22540cd14338'::uuid
--
--    A leitura pública já vem habilitada por o bucket ser Public, então
--    não precisa de policy de SELECT pra o site mostrar as imagens.
-- =====================================================================
