# Integração com Supabase — Guia de setup (tudo no navegador)

Este guia liga o blog a um banco Supabase. Depois disso você escreve, edita e
publica posts **direto pelo `/admin.html` no navegador** — sem build local, sem
commit, sem deploy. O que você salvar aparece no site na hora.

Você só precisa fazer os passos 1 a 5 (≈10 min, tudo no navegador). O passo 6
é comigo.

---

## 1. Criar o projeto Supabase

1. Vá em <https://supabase.com> → **Start your project** → entre com GitHub.
2. **New project**:
   - **Name**: `blog-bernardo`
   - **Database Password**: gere uma forte e **guarde** (não vai precisar no dia a dia).
   - **Region**: `South America (São Paulo)`.
3. Espere ~2 min o projeto provisionar.

## 2. Criar as tabelas (SQL)

1. No menu lateral: **SQL Editor** → **New query**.
2. Abra o arquivo `supabase/schema.sql` deste projeto, copie **tudo**, cole no editor.
3. Clique **Run**. Tem que aparecer `Success`.
4. (Opcional) Repita com `supabase/seed-data.sql` pra já entrar com os 2 posts atuais.

> Conferir: menu **Table Editor** → deve existir a tabela `posts`.

## 3. Criar seu usuário admin

1. Menu lateral: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Coloque seu e-mail e uma senha. Marque **Auto Confirm User** (pula a confirmação por e-mail).
3. Esse será o login do `/admin.html`.

> Depois, em **Authentication → Providers → Email**, deixe **"Allow new users to
> sign up"** **DESLIGADO** — assim ninguém além de você cria conta.

## 4. Pegar as chaves do projeto

1. Menu lateral: **Project Settings** (engrenagem) → **API**.
2. Copie dois valores:
   - **Project URL** — algo como `https://abcdefgh.supabase.co`
   - **Project API keys → `anon` `public`** — uma chave longa começando com `eyJ...`

> A chave `anon` é **pública de propósito** — pode ficar no código do site. Quem
> protege os dados é o RLS (Row Level Security) que o `schema.sql` já configurou.
> **Nunca** use a chave `service_role` no front-end.

## 5. Me mandar as chaves

Cole no chat as duas linhas, assim:

```
SUPABASE_URL = https://abcdefgh.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
```

## 6. (Eu faço) Ligar o site ao banco

Com as chaves eu:

- Preencho `js/supabase-config.js`.
- Faço o `/admin.html` logar via Supabase Auth e fazer CRUD direto na tabela.
- Faço o upload de imagens (capa + galeria) ir pro Storage do Supabase.
- Faço `blog.html` e a página de post lerem do Supabase.
- Removo a dependência de build/commit pra publicar conteúdo.

---

## Como vai funcionar depois

| Ação | Antes | Depois |
|---|---|---|
| Criar/editar post | editar `.md` + `npm run build` + commit + deploy | abrir `/admin.html`, escrever, **Salvar** → no ar na hora |
| Imagens | colocar em `/img/posts/...` + commit | arrastar no admin → sobe pro Storage |
| Login do admin | usuário/senha no código (`blog-auth.js`) | conta real no Supabase Auth |
| Onde os posts moram | arquivos no Git | tabela `posts` no Supabase |

## Custo

Plano **Free** do Supabase: 500 MB de banco, 1 GB de Storage, 50.000 usuários
ativos/mês. Pra um blog pessoal é de sobra — **R$ 0**.

## Observação sobre SEO

A versão atual (estática) entrega o HTML já pronto pros robôs. Lendo do Supabase,
o conteúdo é montado no navegador. O Google **executa JavaScript** e indexa
normalmente, mas o preview de link no WhatsApp/LinkedIn fica genérico (eles não
rodam JS). Pra um blog pessoal isso é aceitável. Se mais pra frente você quiser
os dois (edição no navegador **e** SEO de preview perfeito), dá pra adicionar um
"botão Publicar" que dispara um rebuild automático na Vercel — me avisa que eu
monto.
