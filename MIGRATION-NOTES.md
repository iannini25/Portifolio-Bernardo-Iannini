# MIGRATION NOTES — Refatoração do Portfólio (v1 → v2)

Resumo do que mudou, como criar/publicar um novo post, e o que **você (Bernardo)** ainda precisa fazer manualmente. Tudo aqui parte do estado em que o build foi rodado pela primeira vez (15/05/2026).

---

## 1. O que mudou (visão geral)

| Antes | Agora |
|---|---|
| Blog renderizado 100% no client via JS lendo `localStorage` | Blog **estático**: cada post é um arquivo HTML real em `/posts/<slug>.html`, gerado por `scripts/build-posts.js` |
| Open Graph e JSON-LD preenchidos depois do load (não capturado por crawlers/preview de WhatsApp) | OG, Twitter Card e JSON-LD **direto no HTML** (server-rendered no build) |
| URLs estilo `post.html?slug=xxx` | URLs limpas `/posts/<slug>.html` (post.html antigo virou redirect) |
| Sitemap manual com paths antigos | Sitemap **regenerado a cada build** com `image:image` (image sitemap) pra cada post |
| Visual / animações / paleta | **Idêntico**. Nada mudou no estilo. |
| i18n PT/EN (`js/language.js`) | **Mantido**, com chaves novas adicionadas (`post.*`, `blog.featured.*`) |
| Admin local com posts em `localStorage` | **Mantido como rascunho local**, agora com botões "Exportar .md" e "Copiar comando publicar" |

---

## 2. Como adicionar um novo post

Você tem 3 caminhos. Use o que for mais confortável:

### Caminho A — Direto no editor de markdown (mais simples)

1. Crie um arquivo em `data/posts/<slug>.md` (use kebab-case no slug).
2. Cole o template abaixo (front-matter + corpo):

```markdown
---
title: "Apresentando o ERP Inspire4U na COTEMIG"
subtitle: "Como foi o evento e o que eu apresentei"
slug: "evento-cotemig-erp-2026"
date: "2026-05-10T18:00:00Z"
updated: "2026-05-10T18:00:00Z"
category: "Eventos"
tags: ["evento", "cotemig", "erp", "palestra"]
cover: "/img/posts/evento-cotemig-erp-2026/cover.jpg"
coverAlt: "Bernardo Iannini apresentando o ERP Inspire4U no auditório da COTEMIG em Belo Horizonte, maio de 2026"
images:
  - src: "/img/posts/evento-cotemig-erp-2026/01.jpg"
    alt: "Bernardo Iannini falando no palco da COTEMIG sobre arquitetura de software"
    caption: "Abertura da apresentação"
  - src: "/img/posts/evento-cotemig-erp-2026/02.jpg"
    alt: "Bernardo Iannini mostrando o dashboard do ERP para alunos"
    caption: "Demo ao vivo do dashboard"
linkedinUrl: "https://www.linkedin.com/posts/bernardo-iannini_..."
featured: true
status: published
author: "Bernardo Iannini"
---

# Apresentando o ERP Inspire4U na COTEMIG

Texto do post em markdown. Suporta:

- **negrito**, *itálico*, `código inline`, [link](https://...)
- listas e listas numeradas
- `> citações`
- ` ```js code blocks ``` `

## Galeria

Use o shortcode `:::gallery ... :::` para gerar uma grid responsiva com **todas** as imagens declaradas no `images:` do front-matter (com `<picture>`, `<figure>` e itemprop pro Schema.org). Lightbox nativo `<dialog>` ao clicar.

:::gallery
:::

## Outros shortcodes

:::info
Uma caixa de informação.
:::

:::success
Algo deu certo.
:::

:::warn
Atenção a isso.
:::

:::danger
Cuidado, isto é perigoso.
:::

:::card icon=rocket title="Cards"
Cards individuais com ícone + título + corpo.
:::

:::cards
:::card icon=bolt title="Velocidade"
3x mais rápido.
:::
:::card icon=shield title="Seguro"
Auth com JWT.
:::
:::
```

3. Coloque as imagens em `/img/posts/<slug>/` (use nomes descritivos com seu nome — ex: `bernardo-iannini-cotemig-palestra.jpg`).
4. Rode:
   ```bash
   npm run build:posts
   ```
5. Commit e deploy. Pronto: o post estará em `https://bernardoiannini.com/posts/<slug>.html`, listado no `/blog.html`, no `sitemap.xml` (com image sitemap), e nos posts relacionados dos posts irmãos.

### Caminho B — Pelo admin local (`/admin.html`)

1. Abra `admin.html`, faça login, crie/edite o post.
2. Quando achar que está pronto, clique em **Exportar .md** — vai baixar o `.md` com o front-matter já preenchido.
3. Mova o arquivo pra `data/posts/`.
4. `npm run build:posts`.

> **Variante**: clique em **Copiar comando publicar** — copia pra clipboard um heredoc bash que cria o arquivo + roda o build em uma linha. Cole no terminal.

### Caminho C — Direto via terminal

```bash
npm run build:posts
```

Esse comando re-lê tudo em `data/posts/*.md`, regera `/posts/*.html`, atualiza `sitemap.xml`, `data/posts.json`, `js/blog-seed.js` e os marcadores `<!--BUILD:...-->` dentro de `blog.html`. **Idempotente** — pode rodar quantas vezes quiser.

---

## 3. Estrutura nova do projeto

```
data/
  posts/                   # FONTE CANÔNICA dos posts (.md com front-matter)
    como-construi-esse-portfolio.md
    ...
  posts.json               # gerado — lista pública (cards/preview)

img/
  posts/<slug>/            # imagens por post (use nomes descritivos)
    cover.png + cover.webp # webp gerado automaticamente pelo build
    01.jpg, 02.jpg ...

posts/                     # gerado — uma página HTML estática por post
  como-construi-esse-portfolio.html
  ...

scripts/
  build-posts.js           # gerador (Node, deps em package.json)

js/
  blog-seed.js             # gerado — fallback de compat usado pelo admin
  blog.js                  # refatorado pra usar window.BI_POSTS
  blog-post.js             # legado (não é mais usado pelos posts estáticos)
  post-static.js           # NOVO — JS leve dos posts estáticos (lightbox, share, progress)
  blog-admin.js            # mantido + 2 botões novos (export .md, copy cmd)
  language.js              # ampliado com chaves post.*

blog.html                  # listagem; agora com marcadores <!--BUILD:...-->
                            # preenchidos pelo build (cards reais no HTML)
post.html                  # virou REDIRECT pra /posts/<slug>.html (preserva links antigos)
404.html                   # NOVO — página de não encontrado decente
humans.txt                 # NOVO
sitemap.xml                # gerado — com image:image
package.json               # NOVO
```

---

## 4. O que você (Bernardo) precisa fazer manualmente

### 4.1 — Substituir as covers stock pelas fotos reais

Os 6 posts seed estão usando as imagens existentes em `/img/` como **placeholder** copiadas pra `/img/posts/<slug>/`. Quando você tiver fotos reais dos eventos, substitua nessas pastas mantendo o nome — ou mude o `cover:` no `.md` correspondente. Depois rode `npm run build:posts`.

Pastas/arquivos atuais (todos placeholders — substituir):

- `/img/posts/como-construi-esse-portfolio/bernardo-iannini-portfolio-cover.png`  ← placeholder
- `/img/posts/ai-designer-o-que-faz/bernardo-iannini-ai-designer-cover.png`       ← placeholder
- `/img/posts/fim-do-css-in-js/bernardo-iannini-css-in-js-cover.png`              ← placeholder
- `/img/posts/erp-inspire4u-licoes/bernardo-iannini-erp-inspire4u-cover.png`      ← placeholder
- `/img/posts/por-que-escrever-ainda-importa/bernardo-iannini-escrita-cover.png`  ← placeholder
- `/img/posts/memoriacache-jogo-portfolio/bernardo-iannini-memoriacache-cover.png` ← placeholder

> **Dica de SEO**: nomeie as imagens incluindo seu nome (ex: `bernardo-iannini-cotemig-palestra-erp.jpg`). Reforça a presença em buscas por imagem. O build gera versão `.webp` automaticamente.

### 4.2 — Cover OG da home (`index.html`)

Hoje está usando `/img/eufoto1.png`. Pra qualidade ideal de preview no Twitter/LinkedIn, crie uma `cover-og.jpg` específica de **1200×630** com seu nome em destaque e troque as duas referências em `index.html`:

```html
<meta property="og:image" content="https://bernardoiannini.com/img/cover-og.jpg" />
<meta name="twitter:image" content="https://bernardoiannini.com/img/cover-og.jpg" />
```

### 4.3 — Adicionar novos perfis sociais

Quando você criar conta em outras redes (Instagram, X, YouTube, Behance, Medium...), adicione as URLs em **dois lugares**:

1. `index.html` — dentro do `<script type="application/ld+json">` da `Person`, no array `sameAs`:
   ```json
   "sameAs": [
     "https://www.linkedin.com/in/bernardo-iannini",
     "https://github.com/iannini25",
     "https://www.instagram.com/seu-handle",
     "https://x.com/seu-handle"
   ]
   ```
2. `index.html` — adicione `<link rel="me" href="...">` no `<head>` (reforça IndieWeb/Mastodon):
   ```html
   <link rel="me" href="https://www.instagram.com/seu-handle">
   ```
3. `scripts/build-posts.js` — atualize `AUTHOR.sameAs` no topo do arquivo. Depois rode `npm run build:posts` pra propagar pros JSON-LD de todos os posts.

### 4.4 — Verificar Google Search Console

Após o deploy:

1. Reenvie o `sitemap.xml` no Search Console.
2. Use **Inspecionar URL** em um post `/posts/<slug>.html` e clique em **Solicitar indexação**.
3. Pra Google Imagens funcionar, valide o sitemap em "Sitemaps" — ele agora tem `image:image` pra cada post.

### 4.5 — Knowledge Graph

Pra Google ler o JSON-LD `Person` e gerar painel de conhecimento, ele costuma demandar:
- Backlinks de fontes confiáveis (LinkedIn, GitHub, perfis com seu nome real)
- `sameAs` consistente (URLs idênticas em todo lugar)
- Wikipedia se possível (não crítico mas ajuda muito)
- Anos de presença consistente

A base já está pronta. O efeito vai aparecer ao longo de semanas/meses.

---

## 5. Comandos úteis

```bash
# Instalar dependências (uma vez só)
npm install

# Build (gera /posts, /data/posts.json, sitemap.xml, atualiza blog.html)
npm run build:posts

# Servir localmente
npm run dev
# abre http://localhost:8080
```

---

## 6. O que NÃO mudou (de propósito)

- Estilo visual (`style.css`, `blog.css` exceto adições novas: galeria, lightbox, progress bar, linkedin-btn)
- Animações
- Paleta (verde + lime + fundo `#060807`)
- i18n PT/EN (apenas adicionei chaves novas)
- Admin local (apenas adicionei botões de export)
- Estrutura de URLs antigas (post.html?slug=… vira redirect)

---

## 7. Pequenos detalhes técnicos

- **WebP automático**: o build chama `sharp` pra gerar `.webp` ao lado de cada `.jpg/.png` referenciada no front-matter. Se sharp não estiver instalado, é silenciosamente pulado.
- **Sitemap**: regenerado completo a cada build. Se você editar `sitemap.xml` à mão, vai ser sobrescrito.
- **Posts relacionados**: ranqueados em build time (peso 3 pra mesma categoria + 2 por tag em comum). Top 3 ficam embutidos no HTML estático.
- **Reading progress bar**: barra fina verde no topo, anexada via JS em `js/post-static.js`.
- **Lightbox da galeria**: usa `<dialog>` nativo, sem libs. Setas/esc funcionam. Click fora fecha.
- **Views**: ainda contadas via localStorage local (UI-only). Pra contagem real, integre Plausible/Umami depois.

---

## 8. Checklist de validação (rode antes de deployar)

- [ ] `npm run build:posts` roda sem erro
- [ ] Cada `/posts/<slug>.html` abre sem JS (visualizar source mostra conteúdo + OG + JSON-LD)
- [ ] `/blog.html` lista os posts mesmo com JS desativado
- [ ] `/sitemap.xml` válido (cole em https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [ ] OG preview no LinkedIn/WhatsApp pega a imagem certa (use https://www.opengraph.xyz/)
- [ ] JSON-LD Person passa no Rich Results Test (https://search.google.com/test/rich-results)

---

Pronto. Qualquer dúvida, abra `scripts/build-posts.js` — ele é autoexplicativo e tem ~600 linhas.
