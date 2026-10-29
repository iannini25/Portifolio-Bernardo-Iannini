-- =====================================================================
-- Correcao: contador de views NAO pode mexer em updated_at.
--
-- O trigger antigo regravava updated_at em QUALQUER update, inclusive o
-- "views = views + 1" de cada visita. O build usa updated_at como
-- dateModified dos posts (JSON-LD, sitemap, feed), entao cada visita
-- fazia o post parecer "editado hoje" pro Google: frescor falso.
--
-- Agora a data so muda quando o CONTEUDO muda (qualquer coluna exceto
-- views e a propria updated_at). Rodar uma vez no SQL Editor do Supabase.
-- =====================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (pg_catalog.to_jsonb(new) - 'views' - 'updated_at')
     is distinct from
     (pg_catalog.to_jsonb(old) - 'views' - 'updated_at') then
    new.updated_at = pg_catalog.now();
  else
    new.updated_at = old.updated_at;
  end if;
  return new;
end;
$$;
