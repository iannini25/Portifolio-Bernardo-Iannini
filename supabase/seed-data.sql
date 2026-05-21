-- =====================================================================
-- SEED — Migra os 2 posts atuais (data/posts.json) pro Supabase.
-- Rode DEPOIS do schema.sql. Opcional — só pra não começar vazio.
-- =====================================================================

insert into public.posts (id, slug, title, subtitle, cover, cover_alt, category, author, tags, content, status, featured, created_at, updated_at)
values
(
  'p_70h0q5twmp8ili8y',
  'novooo-testedz',
  'novooo testedz',
  'asdasdasdasd',
  '/img/posts/post/eu.jpg',
  'novooo testedz - Bernardo Iannini',
  'Vida',
  'Bernardo Iannini',
  '{}',
  E'# Comece a escrever aqui\n\nUse **negrito**, *itálico*, ou `código inline`.\n\n## Subtítulos com ##\n\n- Listas com hífen\n- Outra linha\n\n> Citação com >\n\n[Link](https://exemplo.com)\n\n```js\n// blocos de código\nconst ola = "mundo";\n```',
  'published',
  false,
  '2026-05-16T15:42:14.434Z',
  '2026-05-16T15:42:14.434Z'
),
(
  'p_voryg5ozmp7o2acd',
  'teste',
  'teste',
  'testando',
  '/img/posts/teste/cover.png',
  'teste - Bernardo Iannini',
  'IA',
  'Bernardo Iannini',
  '{}',
  E'# Comece a escrever aqui\n\nUse **negrito**, *itálico*, ou `código inline`.\n\n## Subtítulos com ##\n\n- Listas com hífen\n- Outra linha\n\n> Citação com >\n\n[Link](https://exemplo.com)\n\n```js\n// blocos de código\nconst ola = "mundo";\n\nolaolaola\n```',
  'published',
  false,
  '2026-05-16T01:27:29.245Z',
  '2026-05-16T02:39:58.122Z'
)
on conflict (id) do nothing;
