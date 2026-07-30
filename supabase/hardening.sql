-- =====================================================================
-- HARDENING.SQL, endurecimento do banco do blog (Bernardo Iannini)
-- ---------------------------------------------------------------------
-- 1. O QUE FAZ: amarra a escrita dos posts ao UID do dono, conserta a
--    função increment_post_views (search_path fixo, só conta publicado),
--    tira privilégios sobrando do papel anon e limita o bucket
--    blog-images a imagens enviadas pelo dono.
-- 2. COMO RODAR: painel do Supabase, menu "SQL Editor", "New query",
--    colar este arquivo INTEIRO e clicar em "Run". Leva 1 segundo.
-- 3. Pode rodar com o site no ar. Não apaga nem edita nenhum post, não
--    mexe em senha, usuário ou sessão. Nenhum dado é alterado. (Existe
--    uma fração de segundo em que as policies são trocadas; as páginas
--    do site são estáticas e não consultam o banco, então ninguém vê.)
-- 4. É idempotente: rodar de novo não duplica nada e não quebra nada.
-- 5. Se a parte de Storage der erro de permissão, o script NÃO aborta:
--    ele avisa por NOTICE e a seção 6 explica o caminho pela interface.
-- =====================================================================
--
-- ---------------------------------------------------------------------
-- SOBRE "PROTEÇÃO CONTRA SQL INJECTION" (leia, é importante)
-- ---------------------------------------------------------------------
-- Não existe nenhum filtro anti SQL injection neste arquivo, porque não
-- faria sentido ter. O site e o painel nunca montam texto de SQL: tudo
-- passa por PostgREST / supabase-js, que envia os valores como parâmetro
-- vinculado, separado da consulta. A única função SQL do projeto
-- (increment_post_views) também usa parâmetro, não concatena string.
-- Ou seja: a injeção de SQL clássica não é a exposição real aqui.
--
-- A barreira que de fato protege os dados é o RLS (Row Level Security):
-- as policies abaixo decidem, linha por linha, quem lê e quem escreve.
-- Um token roubado ou um usuário extra criado no futuro para em
-- "auth.uid() é o dono?", não em um filtro de texto. Por isso este
-- arquivo mexe em policy e em privilégio, não em validação de string.
--
-- Este arquivo também NÃO resolve: senha fraca, falta de MFA e captcha,
-- headers de segurança do site e a URL do Deploy Hook. Ver seção 8.
-- =====================================================================


-- =====================================================================
-- SEÇÃO 1) QUEM É O DONO
-- ---------------------------------------------------------------------
-- O UID abaixo é o do ÚNICO usuário que existe no projeto hoje
-- (bernardo.iannini14@gmail.com). Toda a escrita do blog fica presa a
-- ele. O cadastro público está desligado, então hoje ninguém mais entra,
-- mas se um dia entrar, essa pessoa NÃO consegue escrever nada.
--
-- SE A CONTA MUDAR (e-mail novo, usuário novo, projeto novo):
--   a) painel do Supabase, menu "Authentication", aba "Users", clicar no
--      usuário e copiar o campo "User UID"; ou
--   b) rodar no SQL Editor:  select id, email from auth.users;
-- Depois troque o UID SÓ na função abaixo e rode este arquivo de novo.
-- O UID vive em um lugar só justamente pra não ter que caçar por oito
-- policies diferentes.
-- =====================================================================

create or replace function public.is_blog_owner()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  -- O coalesce existe porque visitante anônimo tem auth.uid() nulo, e
  -- nulo virar false deixa a leitura das policies óbvia.
  select coalesce(auth.uid() = '1d6251aa-8ee4-48b0-aafe-22540cd14338'::uuid, false);
$$;

comment on function public.is_blog_owner() is
  'True somente para o UID do dono do blog. Usada nas policies de RLS de public.posts e de storage.objects. Trocar o UID aqui muda tudo de uma vez.';

-- Quem avalia a policy é o papel que fez a requisição, então anon e
-- authenticated precisam poder EXECUTAR esta função. Ela não devolve
-- dado nenhum: só responde "você é o dono?" sobre quem está chamando.
revoke all privileges on function public.is_blog_owner() from public;
grant execute on function public.is_blog_owner() to anon, authenticated;


-- =====================================================================
-- SEÇÃO 2) RLS DA TABELA posts
-- ---------------------------------------------------------------------
-- Antes: qualquer usuário autenticado criava, editava e apagava
-- QUALQUER post (using (true)). Agora: só o dono.
--
-- Três caminhos que NÃO podem quebrar, e como cada um continua vivo:
--   . site público (visitante anônimo): lê status = 'published';
--   . build da Vercel (usa a anon key): mesmo caminho do visitante;
--   . painel /admin.html (usuário logado): lê tudo e escreve tudo,
--     porque quem faz login é o dono.
-- =====================================================================

alter table public.posts enable row level security;

-- Por que apagar TODAS as policies da tabela e não só as que eu conheço:
-- policies permissivas se somam com OU. Uma sobra antiga com
-- using (true) anularia todo o aperto abaixo sem dar erro nenhum.
-- Então limpamos a lista e recriamos o conjunto inteiro, sempre.
do $$
declare
  nomes text[];
  nome  text;
begin
  -- Junta os nomes primeiro e só depois apaga: mexer no catálogo no meio
  -- de uma varredura do próprio catálogo é pedir problema.
  select coalesce(array_agg(policyname::text), '{}'::text[])
    into nomes
    from pg_policies
   where schemaname = 'public'
     and tablename  = 'posts';

  foreach nome in array nomes loop
    execute format('drop policy if exists %I on public.posts', nome);
    raise notice 'policy antiga removida de public.posts: %', nome;
  end loop;
end $$;

-- 2.1) LEITURA PÚBLICA, só post publicado.
-- Rascunho não aparece pra visitante nem pro build.
create policy "posts_public_read"
  on public.posts for select
  to anon, authenticated
  using (status = 'published');

-- 2.2) LEITURA TOTAL DO DONO, inclui rascunho.
create policy "posts_owner_read_all"
  on public.posts for select
  to authenticated
  using ( (select public.is_blog_owner()) );

-- 2.3) CRIAR: só o dono.
create policy "posts_owner_insert"
  on public.posts for insert
  to authenticated
  with check ( (select public.is_blog_owner()) );

-- 2.4) EDITAR: só o dono. Os dois lados são necessários: o using diz
-- quais linhas ele pode pegar pra editar, o with check valida como a
-- linha fica depois. Só com using, um update poderia empurrar a linha
-- pra fora da regra e ninguém reclamaria.
create policy "posts_owner_update"
  on public.posts for update
  to authenticated
  using      ( (select public.is_blog_owner()) )
  with check ( (select public.is_blog_owner()) );

-- 2.5) APAGAR: só o dono.
create policy "posts_owner_delete"
  on public.posts for delete
  to authenticated
  using ( (select public.is_blog_owner()) );

-- Nota de performance: o (select ...) em volta da função não é enfeite.
-- Assim o Postgres avalia a função uma vez por consulta em vez de uma
-- vez por linha. É a recomendação da própria documentação do Supabase.
--
-- Nota sobre "force row level security": NÃO usamos. Ela faria o RLS
-- valer também pro dono da tabela (papel postgres), o que atrapalharia
-- o SQL Editor e qualquer migração futura. Esse papel só é usado por
-- você, dentro do painel.


-- =====================================================================
-- SEÇÃO 3) PRIVILÉGIOS (o andar de baixo do RLS)
-- ---------------------------------------------------------------------
-- RLS filtra LINHA. Privilégio (grant) libera a OPERAÇÃO. Por padrão o
-- Supabase dá insert, update e delete pro papel anon em toda tabela nova
-- do schema public, e só o RLS estava segurando. Aqui tiramos o que anon
-- não usa, pra a barreira ser duas fechaduras e não uma.
--
-- Detalhe que importa: TRUNCATE não passa por RLS. Um autenticado com
-- esse privilégio limparia a tabela inteira ignorando as policies acima.
-- Por isso ele sai dos dois papéis.
--
-- A ordem é de propósito: primeiro concede o que precisa, depois revoga
-- o resto. Assim, nem por um instante, o site fica sem poder ler.
-- =====================================================================

-- Visitante anônimo e build: só leitura.
grant  select on table public.posts to anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.posts from anon;

-- Painel (usuário logado): CRUD, com o RLS decidindo quais linhas.
grant  select, insert, update, delete on table public.posts to authenticated;
revoke truncate, references, trigger on table public.posts from authenticated;

-- Ninguém que vem pela API precisa CRIAR objeto no banco. Tirar isso é
-- barato e ataca a raiz do search_path hijacking explicado na seção 4:
-- sem poder criar função ou tabela em nenhum schema, não há onde plantar
-- a isca. O app só faz select, insert, update e delete.
-- No Supabase esses papéis normalmente já não têm CREATE, então isso
-- costuma ser só uma confirmação. Vai dentro de um bloco protegido
-- porque, dependendo de quem é o dono do schema public, o comando pode
-- não ser permitido, e um erro solto aqui desfaria TUDO que veio antes
-- (o SQL Editor roda o arquivo inteiro como uma transação só).
do $$
begin
  revoke create on schema public from anon, authenticated;
exception
  when insufficient_privilege then
    raise notice 'nao foi possivel revogar CREATE no schema public (sem permissao). Nao e problema: por padrao anon e authenticated ja nao tem esse privilegio no Supabase.';
end $$;

-- OPCIONAL, DESLIGADO: fazer valer também pras TABELAS FUTURAS. Sem
-- isso, uma tabela nova criada por você no schema public nasce com
-- insert, update e delete liberados pro anon (padrão do Supabase), e a
-- proteção volta a depender só do RLS.
--   alter default privileges in schema public
--     revoke insert, update, delete, truncate on tables from anon;

-- Sobre public.touch_updated_at(): de propósito NÃO revogamos nada dela.
-- É função de trigger, e o Postgres recusa chamada direta ("trigger
-- functions can only be called as triggers"), então não há superfície de
-- ataque, e mexer no privilégio poderia atrapalhar o trigger que mantém
-- o updated_at. Damos apenas o search_path fixo, que é o que o linter do
-- Supabase pede.
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


-- =====================================================================
-- SEÇÃO 4) A FUNÇÃO increment_post_views
-- ---------------------------------------------------------------------
-- POR QUE ELA PRECISAVA SER RECRIADA:
-- ela é SECURITY DEFINER, ou seja, roda com os poderes de quem a criou
-- (o dono do banco) e ignora o RLS. Sem "set search_path" fixo, os nomes
-- que ela usa são resolvidos pelo search_path de QUEM CHAMA. Quem
-- conseguir criar um objeto em um schema que entre nesse caminho faz a
-- função chamar a coisa errada, e essa coisa roda com poder de dono.
-- Isso tem nome: search_path hijacking, e o próprio linter do Supabase
-- aponta. Com "set search_path = ''" nada é resolvido por adivinhação:
-- todo nome vem escrito por extenso (public.posts) e só roda o que está
-- escrito.
--
-- O QUE MUDA NO COMPORTAMENTO:
--   . só incrementa post com status = 'published', então rascunho não
--     ganha mais views vindas de fora;
--   . slug que não existe não dá erro: o update simplesmente não acha
--     linha e a função devolve void. O site não vê exceção.
-- =====================================================================

drop function if exists public.increment_post_views(text);

create function public.increment_post_views(post_slug text)
returns void
language sql
security definer
set search_path = ''
as $$
  -- post_slug é parâmetro vinculado, não texto colado na consulta.
  update public.posts
     set views = views + 1
   where slug   = post_slug
     and status = 'published';
$$;

comment on function public.increment_post_views(text) is
  'Contador de views do site publico. SECURITY DEFINER com search_path fixo; so conta post publicado; slug inexistente nao gera erro.';

-- Executável apenas por quem precisa. Tirar de PUBLIC evita que qualquer
-- papel novo, agora ou no futuro, herde a permissão sem ninguém decidir.
revoke all privileges on function public.increment_post_views(text) from public;
grant execute on function public.increment_post_views(text) to anon, authenticated;

-- Por que anon continua podendo chamar mesmo tendo perdido o UPDATE na
-- seção 3: a função é SECURITY DEFINER, o update acontece com o poder do
-- dono do banco, não com o poder de anon. É exatamente essa a ideia: a
-- ÚNICA escrita liberada pro visitante é "+1 em views de um post
-- publicado", e nada mais.


-- ---------------------------------------------------------------------
-- 4.1) RISCO CONHECIDO E ACEITO: o contador pode ser inflado
-- ---------------------------------------------------------------------
-- Qualquer pessoa com a anon key (que é pública por design, está no
-- arquivo js/supabase-config.js servido pelo site) pode chamar a função
-- em loop e inflar o número de views de um post publicado. Um curl dentro
-- de um while resolve. Não existe captcha nem sessão nesse caminho.
--
-- Tamanho real do problema hoje: pequeno. Views não dão acesso a nada,
-- não vazam dado, e nada no site chama essa função (o número exibido vem
-- do localStorage do próprio visitante, em js/post-static.js). O único
-- limite ativo é o rate limit global da API do Supabase.
--
-- Efeito colateral honesto: cada incremento é um UPDATE em posts, e o
-- trigger posts_touch_updated_at mexe no updated_at. Ou seja, inflar
-- views também mexe na data de última atualização que vai pro sitemap e
-- pro JSON-LD.
--
-- ALTERNATIVA MAIS SIMPLES DE TODAS (uma linha, DESLIGADA): como nada no
-- site chama a função, dá pra fechar o caminho inteiro. Se um dia você
-- ligar o contador de verdade, tire esta linha antes.
--   revoke execute on function public.increment_post_views(text) from anon;
--
-- MITIGAÇÃO OPCIONAL, TAMBÉM DESLIGADA: contar no máximo 1 view por IP,
-- por post, por dia. Não precisa de extensão nenhuma e a tabela é
-- minúscula (três colunas). Pra ligar, descomente o bloco INTEIRO e rode
-- o arquivo de novo. Limites honestos: IP é aproximado (operadora, rede
-- compartilhada, IPv6 que rotaciona) e o cabeçalho x-forwarded-for pode
-- ser forjado, então isso atrapalha script preguiçoso, não adversário
-- dedicado.
--
-- create table if not exists public.post_view_hits (
--   slug    text not null,
--   ip_hash text not null,
--   dia     date not null default (pg_catalog.now() at time zone 'utc')::date,
--   primary key (slug, ip_hash, dia)
-- );
-- alter table public.post_view_hits enable row level security;
-- -- ninguém lê nem escreve direto: só a função definer abaixo toca nela
-- revoke all privileges on table public.post_view_hits from anon, authenticated;
--
-- create or replace function public.increment_post_views(post_slug text)
-- returns void
-- language plpgsql
-- security definer
-- set search_path = ''
-- as $fn$
-- declare
--   v_ip   text;
--   v_hash text;
-- begin
--   -- o PostgREST publica os cabeçalhos da requisição neste GUC
--   v_ip := pg_catalog.split_part(
--             coalesce(
--               (pg_catalog.current_setting('request.headers', true))::json ->> 'x-forwarded-for',
--               ''),
--             ',', 1);
--   v_hash := pg_catalog.md5(v_ip || '|' || post_slug);
--
--   insert into public.post_view_hits (slug, ip_hash)
--   values (post_slug, v_hash)
--   on conflict do nothing;
--
--   -- já contou hoje: sai sem mexer no número
--   if not found then
--     return;
--   end if;
--
--   update public.posts
--      set views = views + 1
--    where slug   = post_slug
--      and status = 'published';
-- end;
-- $fn$;
--
-- -- limpeza manual de vez em quando (essa tabela não precisa de histórico):
-- -- delete from public.post_view_hits where dia < current_date - 30;


-- =====================================================================
-- SEÇÃO 5) STORAGE, bucket blog-images
-- ---------------------------------------------------------------------
-- Antes: qualquer usuário autenticado subia QUALQUER arquivo, de qualquer
-- tipo, tamanho e caminho, e podia sobrescrever o que já estava lá.
-- Agora: só o dono, só imagem, com teto de tamanho.
--
-- POR QUE ISSO IMPORTA MESMO SENDO UM BUCKET PÚBLICO SÓ DE LEITURA:
-- um .html ou um .svg com script hospedado no bucket abre na origem do
-- SEU projeto Supabase (rnupfyzpwwvspiwnttsl.supabase.co), não em
-- bernardoiannini.com. Ele NÃO lê a sessão do painel, que fica no
-- localStorage do seu domínio. O problema é outro, e continua sendo
-- problema: (a) dá um domínio confiável, com o nome do seu projeto, pra
-- montar uma página falsa de login do painel; (b) transforma sua conta em
-- hospedagem de arquivo arbitrário, e quem responde por abuso e malware é
-- você; (c) SVG com script aberto pela URL executa nessa origem, do lado
-- do seu Auth e do seu PostgREST.
-- Por isso image/svg+xml NÃO entra na lista de tipos permitidos e .svg
-- não entra na lista de extensões.
--
-- SEGURO DE RODAR COM O SITE NO AR: as imagens já publicadas continuam
-- abrindo (a leitura pública não muda) e nada é apagado. As regras novas
-- valem para uploads NOVOS.
-- =====================================================================

-- 5.1) Limites do próprio bucket (o que a API aceita receber).
-- O teto de 10 MB e a lista de tipos são iguais aos que o painel já
-- checa antes de enviar (TAMANHO_MAX_UPLOAD e MIME_IMAGEM em
-- js/supabase-client.js). Os dois lados batendo evitam o pior tipo de
-- erro: o painel dizer "máx 10MB", aceitar o arquivo e o servidor
-- recusar depois sem explicação. Na prática nem chega perto disso, o
-- painel reduz a imagem pra 1600px e recompacta antes de subir.
-- Se mudar o número aqui (valor em bytes), mude lá também.
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

  raise notice 'bucket blog-images: publico, teto de 10 MB, so tipos de imagem (sem svg, sem html).';
exception
  when insufficient_privilege then
    raise notice 'SEM PERMISSAO pra configurar o bucket pelo SQL. Faca pela interface: Storage > blog-images > Settings, campo "File size limit" = 10 MB e "Allowed MIME types" = image/png, image/jpeg, image/webp, image/avif, image/gif. NAO inclua image/svg+xml.';
end $$;

-- 5.2) Policies do bucket.
-- Tudo em um bloco único de propósito: se faltar permissão, o bloco
-- inteiro volta atrás junto e o bucket não fica sem policy de upload.
do $$
declare
  nomes text[];
  nome  text;
begin
  -- Limpa qualquer policy antiga que fale deste bucket, inclusive as
  -- criadas pela interface com outro nome. O filtro por 'blog-images'
  -- existe pra NÃO tocar em policy de outro bucket.
  -- Consequência: se existir uma policy geral em storage.objects que
  -- libera tudo pra qualquer autenticado, ela sobrevive e continua
  -- valendo, porque policies somam com OU. A seção 7 lista todas as
  -- policies de objects justamente pra isso ficar visível.
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
    raise notice 'policy antiga removida de storage.objects: %', nome;
  end loop;

  -- LEITURA PÚBLICA: mantida. O site mostra as imagens dos posts e o
  -- Open Graph precisa que a capa abra sem login.
  create policy "blog_images_public_read"
    on storage.objects for select
    using (bucket_id = 'blog-images');

  -- UPLOAD: só o dono, e só arquivo com extensão de imagem.
  -- O painel sempre grava .jpg ou .png (ele recodifica a imagem antes de
  -- subir), então a lista abaixo cobre o uso real com sobra.
  create policy "blog_images_owner_insert"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'blog-images'
      and (select public.is_blog_owner())
      and lower(name) ~ '\.(png|jpe?g|webp|gif|avif)$'
      and name !~ '\.\./'          -- nada de caminho esquisito
    );

  -- SOBRESCREVER: mesma regra, checada na linha atual e na nova. Sem o
  -- with check, daria pra subir .jpg e renomear pra .html depois.
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

  -- APAGAR: só o dono. Aqui NÃO exigimos extensão de imagem de
  -- propósito: se algum arquivo estranho ficou de antes, você precisa
  -- poder limpar.
  create policy "blog_images_owner_delete"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'blog-images'
      and (select public.is_blog_owner())
    );

  raise notice 'policies do bucket blog-images recriadas: leitura publica, escrita so do dono e so imagem.';
exception
  when insufficient_privilege then
    raise notice 'SEM PERMISSAO pra mexer nas policies de storage.objects pelo SQL (acontece em alguns projetos). Faca pela interface: Storage > Policies > bucket blog-images. O passo a passo esta em supabase/storage-setup.sql.';
end $$;

-- ---------------------------------------------------------------------
-- 5.3) APERTOS OPCIONAIS DE STORAGE, os dois DESLIGADOS
-- ---------------------------------------------------------------------
-- (a) Prender o upload às pastas que o painel usa e ao formato de nome
--     que ele gera. Fica mais fechado, mas passa a RECUSAR upload feito
--     pela interface do Supabase, que mantém o nome original do arquivo
--     (com maiúscula, espaço ou acento) e joga na raiz do bucket.
--     Pra usar, troque as duas linhas "lower(name) ~ ..." acima por:
--       and name ~ '^(covers|gallery)/[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|gif|avif)$'
--
-- (b) Fechar a LISTAGEM do bucket pra quem não está logado.
--     Hoje qualquer pessoa com a anon key consegue LISTAR os arquivos do
--     bucket, e isso inclui a capa de um post que ainda está em RASCUNHO:
--     o texto do rascunho fica escondido pelo RLS, a imagem não.
--     Bucket público entrega o arquivo pela URL
--     /storage/v1/object/public/... sem passar por policy, então em
--     teoria o site continua mostrando as imagens mesmo com a leitura
--     fechada aqui. O "em teoria" é de propósito: isso é comportamento do
--     Storage, não promessa deste arquivo.
--     Se quiser ligar, rode as duas linhas abaixo e DEPOIS confira numa
--     aba anônima que a capa de um post ainda aparece no site. Se sumir,
--     rode de novo a policy pública da seção 5.2 pra voltar atrás.
--       drop policy if exists "blog_images_public_read" on storage.objects;
--       create policy "blog_images_owner_read" on storage.objects for select
--         to authenticated using (bucket_id = 'blog-images' and (select public.is_blog_owner()));


-- =====================================================================
-- SEÇÃO 6) SE ALGO FALHAR
-- ---------------------------------------------------------------------
-- . "must be owner of table objects" ou aviso de SEM PERMISSAO:
--   as seções 1 a 4 foram aplicadas normalmente, só a parte de Storage
--   não entrou. Faça pela interface, como o NOTICE explicou.
-- . Upload do painel começa a falhar com "mime type not supported" ou
--   "payload too large": é o teto da seção 5.1 agindo. Suba uma imagem
--   comum (jpg, png, webp) ou aumente o file_size_limit.
-- . Painel diz "permission denied" ou "new row violates row-level
--   security policy" ao salvar post: quem está logado não é o UID da
--   seção 1. Confira em Authentication > Users, corrija o UID na função
--   is_blog_owner() e rode este arquivo de novo.
-- =====================================================================


-- =====================================================================
-- SEÇÃO 7) VERIFICAÇÃO (não altera nada)
-- ---------------------------------------------------------------------
-- O resultado que aparece na tela depois do Run é a lista final de
-- policies. O esperado:
--   posts    posts_public_read         SELECT  {anon,authenticated}
--   posts    posts_owner_read_all      SELECT  {authenticated}
--   posts    posts_owner_insert        INSERT  {authenticated}
--   posts    posts_owner_update        UPDATE  {authenticated}
--   posts    posts_owner_delete        DELETE  {authenticated}
--   objects  blog_images_public_read   SELECT  {public}
--   objects  blog_images_owner_insert  INSERT  {authenticated}
--   objects  blog_images_owner_update  UPDATE  {authenticated}
--   objects  blog_images_owner_delete  DELETE  {authenticated}
--
-- Duas coisas pra olhar no resultado:
--   . policy de posts com "true" na coluna condicao significa que sobrou
--     coisa antiga: rode o arquivo de novo;
--   . policy de objects que NÃO comece com blog_images veio de outro
--     lugar (interface, outro bucket). Se ela liberar escrita geral,
--     anula o aperto do bucket, porque policies somam com OU.
-- =====================================================================

select
  tablename                  as tabela,
  policyname                 as politica,
  cmd                        as operacao,
  roles::text                as papeis,
  coalesce(qual, with_check) as condicao
from pg_policies
where (schemaname = 'public'  and tablename = 'posts')
   or (schemaname = 'storage' and tablename = 'objects')
order by tabela, operacao, politica;


-- =====================================================================
-- SEÇÃO 8) O QUE ESTE ARQUIVO NÃO RESOLVE (não dá pra resolver em SQL)
-- ---------------------------------------------------------------------
-- 1. Senha do painel. Troque em Authentication > Users. Enquanto a senha
--    for curta e conhecida, o RLS acima não ajuda: quem loga como dono
--    tem tudo. Este é o item número um.
-- 2. Força bruta. Ligue captcha em Authentication > Settings (Bot and
--    Abuse Protection) e MFA na conta. Confirme que "Disable signup"
--    continua ligado.
-- 3. Headers de segurança do site (CSP e companhia). Isso vive no
--    vercel.json, não no banco.
-- 4. URL do Deploy Hook da Vercel. Qualquer usuário logado dispara um
--    deploy, e hoje o único usuário é você. Mantenha a variável
--    DEPLOY_HOOK_URL marcada como Sensitive na Vercel.
-- =====================================================================
