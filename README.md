# Portfolio — Bernardo Iannini

Site estático (HTML/CSS/JS) com um blog/Newsroom gerado a partir de
arquivos Markdown. Hospedado na **Vercel** (estático). O painel admin
roda **só localmente**.

---

## ⚡ Como funciona (leia isto)

- **Fonte da verdade dos posts:** `data/posts/*.md`
- **Imagens dos posts:** `img/posts/<slug>/...`
- O build (`npm run build:posts`) lê os `.md` e gera:
  `blog.html`, `posts/*.html`, `data/posts.json`, `sitemap.xml`,
  `js/blog-seed.js`.
- A Vercel serve **só o resultado estático**. Ela **não** roda o admin.

> O admin (`admin.html`) **não funciona no site no ar** — é por design.
> Você gerencia os posts na sua máquina e dá push do resultado.

---

## 🖥️ Rodar / gerenciar localmente

```bash
npm install
npm run admin
```

Abra **http://localhost:4000/bernardolindao.html**
Login: `bernardolindo` · Senha: `iannini`

No painel você cria/edita/publica posts e anexa várias imagens
(elas vão pro topo do post, em grade estilo LinkedIn). Cada
ação grava o `.md`, salva as imagens e roda o build sozinho.

Só pré-visualizar o site (sem admin):

```bash
npm run dev      # http://localhost:8080
```

---

## 🚀 Publicar no ar (fluxo obrigatório)

1. `npm run admin` → cria/edita o post no painel
2. Confira em `http://localhost:4000/blog.html`
3. Commit de **tudo** (inclui as imagens!):

```bash
git add -A
git commit -m "post: <titulo do post>"
git push
```

4. A Vercel publica sozinha em ~1 min.

⚠️ **Nunca esqueça o `git add -A`.** Se faltar a pasta
`img/posts/<slug>/`, o post sai sem imagem no site.

---

## ☁️ Setup na Vercel (uma vez só)

1. Crie um repositório no GitHub **só desta pasta** e dê push.
2. Na Vercel: **Add New → Project → importe esse repo**.
3. Framework Preset: **Other** (o `vercel.json` já configura
   `buildCommand` e `outputDirectory`).
4. Deploy. Depois ligue o domínio `bernardoiannini.com` em
   *Settings → Domains* (importante: o `SITE_URL` em
   `scripts/build-posts.js` aponta pra esse domínio — canonical,
   Open Graph e sitemap usam ele).

Não precisa configurar mais nada — `vercel.json` cuida do resto.
