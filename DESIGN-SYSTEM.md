# Design System, Portfólio Bernardo Iannini

Documento de referência das páginas internas do site (case de projeto, sobre, blog, post, login, admin) e da padronização de cores e fontes em vigor. Todos os valores abaixo foram extraídos do código real (`style.css`, `blog.css`, HTML gerado). Nada aqui é proposta: é o que está no ar.

Páginas cobertas:

| Página | Arquivo | CSS | Scripts principais |
|---|---|---|---|
| Case de projeto | `projetos/<slug>.html` (gerado) + `project.html` (shell) | `style.css` | language, UI, GSAP + ScrollTrigger + DrawSVG, Lenis, project-fx |
| Sobre | `sobre.html` (gerado por `scripts/build-about.js`) | `style.css` | language, UI, sw-register (sem GSAP) |
| Blog (listagem) | `blog.html` | `style.css` + `blog.css` | language, UI, blog, blog-fx, blog-sort |
| Post | `posts/<slug>.html` (gerado por `scripts/build-posts.js`) | `style.css` + `blog.css` | language, UI, post-static, blog-fx, GSAP, modal-fx |
| Login / Admin | `bernardolindao.html` / `admin.html` | `blog.css` | blog-auth / blog-admin |

As páginas de **login** e do **admin de gerenciar blog** são as implementações de referência deste design para o fluxo de publicação (formulários, editor, tabelas, feedback). Estão especificadas por completo nas seções 12 e 13.

---

## 1. Cores

### 1.1 Núcleo da paleta

| Token | Valor | Papel |
|---|---|---|
| `--bg` | `#060807` | Fundo do site inteiro (quase preto esverdeado) |
| `--text` | `#f3f6f4` | Texto principal |
| `--green` | `#22c55e` | Verde oficial (acento primário) |
| `--green-2` | `#16a34a` | Verde escuro (tom de apoio; os botões primários usam o gradiente oficial) |
| `--lime` | `#a3e635` | Lime oficial (acento secundário, hover, foco) |
| `--gradient-lime` | `linear-gradient(135deg, var(--green) 0%, var(--lime) 100%)` | **O gradiente oficial da casa.** Sempre 135deg, sempre green para lime |
| `--muted` | `#a7b5ab` | Texto secundário |
| `--rail` | `#0e1511` | Superfície escura sólida (trilhos, fundos de vídeo) |
| `--border` | `#1c2a20` | Borda sólida escura |

### 1.2 Escala de texto (do mais claro ao mais apagado)

| Token | Valor | Uso |
|---|---|---|
| `--text` | `#f3f6f4` | Títulos, texto de destaque |
| `--text-italic` | `#e6efe9` | Taglines em serif |
| `--text-soft` | `#dce4de` | Corpo de leitura (parágrafos) |
| `--text-icon` | `#dbe7df` | Ícones |
| `--text-mint` | `#d8f3e4` | Labels mono de destaque (status, specs) |
| `--text-accent` | `#cfe7db` | Links dentro de fichas |
| `--muted` | `#a7b5ab` | Subtítulos de seção |
| `--text-hint` | `#9fb2a6` | Kickers, metadados, hints (o "cinza" da casa) |
| `--chev` | `#94b8a2` | Chevrons decorativos |

### 1.3 Alphas padronizados

Brancos translúcidos (superfícies e bordas de vidro):

| Token | Valor |
|---|---|
| `--w-02` a `--w-12` | `rgba(255,255,255,.02)` até `.12` (passos .02, .03, .05, .06, .08, .10, .12) |

Verdes translúcidos (glows, fundos de acento):

| Token | Valor |
|---|---|
| `--g-08` a `--g-80` | `rgba(34,197,94, X)` com X em .08, .10, .14, .15, .16, .18, .22, .28, .30, .35, .45, .50, .55, .70, .80 |

Verde tinta (linhas técnicas, wireframes, topográfico):

| Token | Valor |
|---|---|
| `--ink` | `rgb(65,110,84)` |
| `--gline-28/-35/-38/-42` | `rgba(65,110,84, .28 / .35 / .38 / .42)` |

Regra: nunca inventar um `rgba` de verde ou branco novo. Se precisar de um alpha, usar o token mais próximo.

### 1.4 Vidro, sombras e inputs

| Token | Valor | Uso |
|---|---|---|
| `--glass` | `rgba(10,18,14,.55)` | Superfície de vidro padrão |
| `--glass-2` | `rgba(15,25,20,.6)` | Vidro em par com glass (gradientes 180deg) |
| `--shadow-35` | `0 12px 28px rgba(0,0,0,.35)` | Sombra leve |
| `--shadow-38` | `0 22px 44px rgba(0,0,0,.38)` | Sombra média |
| `--shadow-45` | `0 20px 50px rgba(0,0,0,.45)` | Sombra pesada (cards de post) |
| `--input-bg` / `--input-bg-focus` | `rgba(10,18,14,.6)` / `.72` | Campos de formulário |

Superfície de card padrão das páginas internas: `linear-gradient(135deg, rgba(15,25,20,.55), rgba(10,18,14,.85))` com borda `1px solid var(--gline-28)`.

### 1.5 Cores funcionais

| Token | Valor | Uso |
|---|---|---|
| `--term-prompt` / `--term-path` / `--term-cmd` / `--term-out` | `#66e6a1` / `#b7ffda` / `#a4e3ff` / `#e7f5ee` | Terminal (about da home e barra da janela de case) |
| `--msg-red` / `--msg-yellow` / `--msg-green` | `#ffb3ae` / `#ffe2a6` / `#b9f5c8` | Mensagens de erro / aviso / sucesso |
| `--win-red` / `--win-ylw` / `--win-grn` | `#ff5f57` / `#febc2e` / `#28c840` | Traffic lights coloridos (só no terminal da home; nas janelas de projeto os dots são neutros `--w-10` e apenas o 3º acende em `--green`) |
| Cor do texto sobre gradiente | `#08120c` (nav, chips) ou `#04130a` (badges, botões primários) | Único texto escuro do site: sempre sobre preenchimento green/lime |
| LinkedIn | `#0a66c2` | Exceção documentada, só no botão de LinkedIn do post |

### 1.6 Tokens locais do blog (`blog.css`)

| Token | Valor |
|---|---|
| `--svc-color` | `#a3e635` (promovido a `:root` pelo blog.css) |
| `--svc-15/-25/-40` | `rgba(163,230,53, .15/.25/.40)` |
| `--post-grad` | `linear-gradient(135deg, var(--green) 0%, var(--svc-color) 100%)` (idêntico ao oficial) |
| `--post-grad-soft` | `linear-gradient(135deg, rgba(34,197,94,.18) 0%, rgba(163,230,53,.14) 100%)` |

### 1.7 Onde o gradiente oficial aparece (e onde não)

Aparece em: título do hero do case (`.pc-hero__title`, clipado no texto), palavras `<em>` em serif de títulos, fio dos tópicos (`.pd-wire i`), círculo de hover da nav (pill, dropdown, lang menu), `.resume-btn` no hover, badges de destaque, valores de estatísticas (clipado), barra lateral de `<pre>`, barra de progresso do post, submit do login e botão primário do admin (publicar).

Não aparece em: fundos de card (sempre vidro escuro), bordas em repouso, corpo de texto. O gradiente é acento, nunca superfície.

---

## 2. Fontes

Carregadas via Google Fonts em todas as páginas:

```
Inter: 400, 500, 600, 700, 800, 900 (+ itálico 400, 500, 600)
JetBrains Mono: 400, 600, 700
Instrument Serif: regular e itálico
```

### 2.1 Papel de cada família

| Família | Papel | Regra |
|---|---|---|
| **Inter** | Tudo por padrão: corpo, títulos, botões, nav | Stack: `Inter, system-ui, -apple-system, Segoe UI, Roboto, ...`. Títulos em 800/900 com letter-spacing negativo |
| **JetBrains Mono** | A voz "dev" do site: kickers, metadados, labels técnicos, URLs, comandos, código, tags, specs, datas | Sempre em tamanhos pequenos (.66rem a .8rem nos labels, 13px em código), muitas vezes uppercase com letter-spacing largo (.04em a .3em) |
| **Instrument Serif** (itálico) | A voz "emocional": a palavra de destaque dentro de títulos, taglines, blockquotes, subtítulo de post | Sempre `font-style: italic; font-weight: 400`. Quase sempre com `--gradient-lime` clipado no texto ou cor `--green`/`--lime`. Fallback: `Georgia, serif` |

Padrão de título da casa: Inter 800/900 + uma palavra em `<em>` Instrument Serif itálico com gradiente. Nunca usar o serif para texto corrido.

### 2.2 Escala tipográfica

| Nível | Tamanho | Peso / detalhes |
|---|---|---|
| Nome do hero (home) | `clamp(58px, 9.6vw, 112px)` | 900, line-height .96, letter-spacing -.012em |
| Título de página (post) | `clamp(30px, 4.8vw, 54px)` | 900, -.022em, line-height 1.06 |
| Título de página (blog hero) | `clamp(40px, 6.5vw, 76px)` | 900, -.025em, line-height 1.05 |
| Título de página (case hero) | `clamp(2.4rem, 5vw, 4.2rem)` | 800, uppercase, gradiente clipado, line-height 1.08 |
| Título de seção (global `.section-title`) | `clamp(36px, 6.5vw, 56px)` | 900, -.012em, centrado |
| Título de seção (blog) | `clamp(28px, 4vw, 44px)` | 900, -.02em |
| Título de ato (case `.pc-act__title`) | `clamp(1.5rem, 2.4vw, 2.1rem)` | 800, -.015em, line-height 1.15 |
| Título de card | 15px a 22px conforme a variante (ver seção 6) | 800 |
| Corpo de leitura (post) | 17px, line-height 1.78 | Inter 400, `--text-soft` |
| Corpo de leitura (case/sobre) | 1.02rem / line-height 1.65 a 1.75 | `--text-soft` |
| Kicker global | .85rem, uppercase, .18em | 800, `--text-hint`, prefixo `//` em mono verde |
| Metadado mono | .66rem a .78rem | JetBrains Mono, `--text-hint` |

Base do body: Inter, `line-height: 1.6`, cor `--text`.

---

## 3. Fundamentos de superfície

### 3.1 Raios de borda

| Raio | Uso |
|---|---|
| `999px` | Pills: nav, chips, tags, badges, botões redondos |
| `22px` | Cards grandes (bento do blog, author card, capa de post, tiles) |
| `16px` a `18px` | Cards médios (specs, next project, toolbar, share bar, admin card) |
| `12px` a `14px` | Elementos internos (ícones de tópico, inputs, imagens do corpo, `<pre>`, menus) |
| `6px` a `10px` | Micro (badge de categoria, código inline, itens de menu) |

### 3.2 Receita de card padrão (páginas internas)

```css
border-radius: 22px;                 /* ou 16-18px no médio */
border: 1px solid var(--gline-28);   /* ou var(--w-05) no case */
background: linear-gradient(135deg, rgba(15,25,20,.55), rgba(10,18,14,.85));
overflow: hidden;
isolation: isolate;
```

Hover padrão: `translateY(-2px a -4px)` + borda acendendo (`--g-28` a `--g-50`) ou sumindo (quando há contorno de cursor), com transição `.25s a .32s`.

### 3.3 Efeitos de assinatura

- **Contorno que segue o cursor**: anel de `padding: 1px` com `mask-composite: exclude` e `radial-gradient` lime na posição `--mx/--my` (ou `--glow-x/--glow-y`) alimentada por JS (`blog-fx.js` / `project-fx.js` / `scrollfx.js`). Desligado em `@media (hover: none)`.
- **Janela de browser**: barra de 34px com 3 dots de 7px (neutros `--w-10`; só o 3º acende em verde quando ativa) + URL em mono .66rem. Usada no catálogo (`.pj-win`), no case (`.pc-video__win`) e é irmã do terminal do about.
- **Duotone que ganha cor**: imagens de preview nascem `grayscale(1) brightness(.92)` com véu `#2c5438` em `mix-blend-mode: multiply` e revelam a cor no hover/ativação (`.55s ease`).
- **Círculo lime que sobe**: hover de itens de nav e menus é um círculo com `--gradient-lime` escalando de 0 a 1 a partir de baixo (`cubic-bezier(.34, 1.2, .5, 1)`), texto vira `#08120c`.
- **Grain global**: `body::after` com ruído fractal SVG em `opacity .045` (mata banding). Vinheta suave só no topo em `body::before`. **Exceção: o blog desliga os dois** (ver 3.4).

### 3.4 Regra de fundo por página

- Site em geral: `--bg` + vinheta de topo + grain + fundos WebGL condicionados ao tier de performance.
- **Blog e post: fundo nenhum, de propósito.** `.blog-body { background: none }` e `content: none` nas duas camadas fixas. Fica só o `--bg` do html. Não adicionar gradiente, textura, grain ou WebGL nessas páginas.
- Login: única exceção do blog, radial verde `900px 600px at 50% 30%` sobre `--bg`.
- Case: fundo topográfico SVG (`.pc-topo`, traço `--ink` a 13%) com máscara de fade e glow que segue o cursor.

---

## 4. Motion

### 4.1 Easings padronizados

| Curva | Token / valor | Uso |
|---|---|---|
| Casa (saída suave) | `--ps-ease: cubic-bezier(.22, 1, .36, 1)` | Entradas, setas, listbox, transforms em geral |
| Lift / zoom | `cubic-bezier(.22, .61, .36, 1)` | Cards subindo, zoom de imagem, sweeps, transição de página |
| Círculo lime | `cubic-bezier(.34, 1.2, .5, 1)` | Hover de menus (leve overshoot) |
| PillNav | `cubic-bezier(.34, 1.25, .5, 1)` | Círculo da nav principal |
| Cor / borda | `ease` | Mudanças de cor simples |

### 4.2 Durações

| Faixa | Uso |
|---|---|
| .16s a .2s | Cor e borda (chips, tags, links) |
| .22s a .32s | Lifts de card, menus abrindo, chevrons |
| .4s a .5s | Contorno de cursor, círculo lime |
| .55s a .9s | Zoom de imagem, duotone ganhando cor, sweep de avatar |
| `--ps-dur: 700ms` | Traffic lights e transições da showcase |
| `--pj-swap: .62s` / `--pj-color: 1.15s` | Troca de janela empilhada / recolorir |

### 4.3 Transição de página (`#page-fx`, inline no head)

Máscara anti-flicker de i18n: página nasce `opacity: 0` até `.i18n-ready`; `main` entra de `scale(1.03) + blur(8px)` para o estado normal em `.45s`; ao sair (`body.page-leaving`) vai para `scale(.97) + blur(8px)`. Opacidade em `.35s cubic-bezier(.22,.61,.36,1)`.

### 4.4 Stack de animação

- **GSAP 3.13** + ScrollTrigger + DrawSVG e **Lenis** só nas páginas que precisam (case, post). Sobre e blog listagem não carregam GSAP (blog usa CSS + JS leve).
- Ordem de script obrigatória: `language.js` antes de `UI.js`, `project-fx.js` por último.
- Mousemove sempre coalescido a 1x por frame (rAF) com cache de `getBoundingClientRect` (padrão `onPointerFrame` + `criarCacheRect` em `scrollfx.js`). Nunca ler layout dentro de um handler de mousemove cru.

### 4.5 Adaptive loading (perf-tier)

`js/perf-tier.js` roda síncrono no head e põe `data-perf="high|medium|low"` no `<html>` antes do 1º paint.

- `high`: tudo como foi desenhado (nenhum seletor de tier se aplica).
- `medium`: blur da nav cai de 8px para 5px, sombras dos menus levemente reduzidas. WebGL continua.
- `low`: WebGL desligado (0 canvas), backdrop-filter vira fundo sólido `rgba(18,21,19,.95)`, animações decorativas infinitas desligadas, `will-change: auto` global.

Qualquer componente novo com animação infinita ou blur deve prever os degraus `medium` e `low`.

### 4.6 Reduced motion

`prefers-reduced-motion: reduce` sempre respeitado: animações infinitas mortas com `!important`, shimmer congelado, transições de transform zeradas, sweep de avatar removido, carets de terminal ocultos. Todo componente novo com animação precisa do seu bloco de reduced motion.

---

## 5. Acessibilidade

- **Anel de foco padrão**: `outline: 2px solid var(--lime); outline-offset: 3px`. Em containers com `overflow: hidden`, o anel vai para dentro (`outline-offset: -2px` ou `-3px`).
- **Alvos de toque**: em `pointer: coarse` todo link/CTA ganha `min-height: 44px` ou padding expandido com margem negativa compensando.
- **Contraste medido, não chutado**: scrims de imagem calibrados por pior caso (ex.: scrim do card de post garante 5.5:1 na meta e 9.5:1 no resumo sobre capa branca); anel de foco da busca usa `--g-70` porque `--g-10` media 1.15:1 e o SC 1.4.11 pede 3:1.
- **Tópicos não ativos do case** sobem o texto para `--text-soft` para manter AA mesmo esmaecidos.
- Skip-link presente, `scroll-margin-top` em headings ancorados, `<dialog>` nativo no lightbox.

---

## 6. Breakpoints

Não há grade fixa de breakpoints; cada componente quebra onde precisa. Os pontos mais usados (em ordem de frequência): **900px** (nav mobile, toolbar), **1024px**, **760px**, **720px**, **540/560px** (grids viram 1 coluna), **480px**, **640px**, **980px**, **860/861px** (layout de 2 colunas do case; admin colapsa). Alturas: `max-height: 560px` desliga o sticky do case.

Unidades: `100svh` para alturas de viewport (nunca `100vh` puro em áreas críticas), `clamp()` para tudo que escala.

---

## 7. Nav compartilhada (todas as páginas internas)

- `header` fixo, `top: 20px` + `margin-top: 30px`, fundo transparente; no case ele sai de cena (`body.pc-nav-hidden` desliza para cima).
- `.nav`: grid `minmax(0,1fr) auto minmax(0,1fr)`, `max-width: 1120px`, altura mínima `--nav-h: 56px` (64px em telas pequenas).
- `.pill` central: `padding: 6px`, `background: var(--w-05)`, `border: 1px solid var(--w-10)`, `radius 999px`, `backdrop-filter: blur(8px)`. Links `8px 16px`, 700, .9rem, hover com círculo lime subindo.
- `.lang-switch.pill`: 38px de altura, mesmo vidro; menu com entrada animada e item selecionado em `--lime`.
- `.resume-btn`: mesmo vidro; hover vira `--gradient-lime` com texto `#08120c`, glow e brilho varrendo.
- Mobile (≤900px): `.menu-btn` 44x38 vira X; `.mobile-nav` em painel de vidro `blur(10px)` com links de 44px+.
- Link ativo do blog: tracinho `16x2px` verde embaixo (`.nav-blog-link.active-link`).
- Sobre é exceção minimalista: nav de 4 links simples, sem lang switch, sem resume, sem menu mobile.

---

## 8. Página de case (`projetos/<slug>.html`)

Coluna central de **980px** (`padding: nav + 56px topo, 120px base`). Ordem das seções:

1. **Voltar** (`.pc-back`): mono .78rem, hint, seta desliza -3px no hover.
2. **Hero**: linha de registro em mono .74rem (status uppercase mint + dot verde com glow + host), título uppercase com gradiente clipado, descrição `62ch` em `--text-soft`, stack em `.ps-pill` (mono .76rem, entrada staggered 32ms por item, separador `·`), CTAs `.ps-cta` (sem fundo: primário verde que vira lime, ghost hint que vira texto; seta anda `3px,-3px`).
3. **Ato de história** (`.pc-act--story`): grid `62ch + 240px` com nota de margem (`.pc-note`: fio de 1px `--gline-35` que o GSAP desenha, mono .66/.72rem) e fluxo (`.pc-flow`).
4. **Corpo em 2 colunas** (≥861px): tópicos à esquerda (`padding-top: 98vh`), **janela de vídeo sticky** à direita (`100svh`, centrada). Janela: `radius 18px`, barra de browser, vídeo `aspect 3/2`, badge "em breve" pill com blur, screenshot em duotone que ganha cor. Abaixo de 861px vira fluxo normal.
5. **Tópicos** (`.pd-topic`): grid `44px + 1fr`, ícone 44x44 `radius 12px` que acende verde quando ativo (borda `--g-45`, glow `--g-15`), fio vertical com `--gradient-lime` desenhado no scroll, não ativos a `opacity .55`. Tech em mono .7rem com `//` verde; deep dive em `<details>` mono com chevron.
6. **Ato de impacto**: lead + métricas em grid (`--pc-metrics-n` colunas), valores `clamp(1.4rem, 2.1vw, 1.8rem)` 800 `tabular-nums`, divisores de 1px.
7. **Specs** (`.pc-specs`): card `--glass` `radius 16px`, comando `$` em mono mint, linhas `dt` mono / `dd` texto com grid `160px + 1fr`.
8. **Assinatura** (`.pc-sign`): linha com `<em>` serif gradiente + CTA ghost para `/#contato`.
9. **Próximo projeto** (`.pc-next`): card `--glass` com thumb `168x94` em duotone que ganha cor, label mono .68rem `.16em`, hover levanta 2px e acende borda.

Fundo: topográfico SVG atrás de tudo. Nav some ao rolar para a janela.

---

## 9. Página sobre (`sobre.html`)

Deliberadamente tipográfica: **sem cards, sem sombras, sem blur, sem gradiente, sem GSAP**.

- Coluna de **720px** (~70ch). `h1` `clamp(28px, 4vw, 40px)` 900; lead `clamp(16px, 2vw, 19px)`.
- Foto 200x200 circular com borda `--gline-35` (150px no mobile).
- `h2` com `border-bottom: 1px solid var(--gline-28)`; `h3` 16px 700.
- Parágrafos `--text-soft` com `line-height: 1.75`. Links em `--lime` sublinhados.
- Listas com marker verde. Entradas de experiência: meta em mono 12px hint, bullets, skills em pills mono 11px com borda `--gline-28`.
- FAQ em texto simples (o schema espelha exatamente o texto visível).

---

## 10. Blog, listagem (`blog.html`)

Container `1280px`, `padding-top: 120px`. Sem fundo (ver 3.4).

1. **Hero centrado**: kicker, título `clamp(40px, 6.5vw, 76px)` 900 com `<em>` serif em shimmer (gradiente 110deg green-lime-green animado 6s, congelado em reduced motion), sub `580px`.
2. **Bento de identidade**: grid 3 colunas, linhas `9rem auto 9rem`, gap 14px, tiles `radius 22px` na superfície padrão com contorno que segue o cursor. Tiles: perfil (avatar 76px com troca de foto e sweep), post em destaque (span 2, scrim duplo, badge gradiente), estatísticas (valores com gradiente clipado + sparkline que se desenha), localização (pulse lime + relógio mono), tópicos (rotator estilo terminal com `>` lime + tag cloud), centro (preview com grid tech mascarado). Quebra: 2 colunas a 900px, 1 a 540px.
3. **Toolbar sticky** (`top: 88px`): vidro `rgba(10,18,14,.72)` + `blur(8px)`, `radius 18px`. Busca 44px com foco lime + anel `--g-70`; chips inativos em vidro / ativo em `--gradient-lime` com texto `#08120c` e sombra neutra curta; sort com listbox próprio (o `<select>` nativo escondido continua sendo a fonte da verdade), menu `blur(10px)` com item de círculo lime.
4. **Bento de posts**: grid 6 colunas, linhas de 240px, gap 16px. Card `radius 22px`, contorno de cursor, hover levanta 4px e a borda some para não lavar o gradiente. Excerpt aparece no hover (visível por padrão no touch). Variantes: featured `4x2` (título `clamp(24px, 3vw, 36px)`), tall `2x2` (22px), wide `3x1` (19px), normal `2x1` (17px), full `6x1` (22px). O plano de layout por quantidade de posts vive em `build-posts.js`.
5. **Author card**: grid `200px + 1fr`, foto 160px circular com anel verde e halo girando 22s, botões pill.
6. **Footer**: linha de 1px `--gline-28`, texto 12px hint.

---

## 11. Post (`posts/<slug>.html`)

Coluna de leitura de **760px**. Barra de progresso fixa de 3px em gradiente no topo.

- **Voltar**: pill de vidro com seta em círculo de 22px com `--post-grad`.
- **Hero**: eyebrow pill (categoria + data + tempo de leitura, mono-ish 11.5px uppercase), título `clamp(30px, 4.8vw, 54px)` 900, subtítulo em serif itálico, byline com avatar 40px entre duas linhas de 1px.
- **Capa**: `radius 22px`, `aspect 16/9`, `--shadow-45`, scrim sutil na base.

### 11.1 Tipografia do corpo markdown (`.post-page-body`)

Base: Inter 17px, **line-height 1.78**, `--text-soft`.

| Elemento | Regra |
|---|---|
| `h1` | `clamp(24px, 3.4vw, 30px)` 900 |
| `h2` | `clamp(20px, 2.6vw, 26px)` 800 + linha inferior `--gline-28` + tracinho 56x2px em `--post-grad` |
| `h3` / `h4` / `h5` | `clamp(17px, 2.1vw, 20px)` 800 / 16px 700 / 14.5px 700 |
| `h6` | JetBrains Mono 12px uppercase verde (vira label técnico) |
| `em` | Instrument Serif itálico verde |
| `a` | `--svc-color` sublinhado (decoration a 35%), hover clareia para `#c6f570` |
| `code` | Mono .88em, fundo `--g-10`, borda `--g-22`, cor lime |
| `pre` | `radius 14px`, gradiente escuro, barra lateral de 3px em `--post-grad`, mono 13px |
| `blockquote` | Serif itálico `clamp(17px, 2vw, 20px)`, borda esquerda verde 3px, fundo `--g-10` esvanecendo, aspa gigante a 12% |
| `ul` / `ol` | Markers verde / lime |
| `img` | `radius 14px`, borda `--gline-28` |
| `hr` | 1px, 60% de largura, gradiente que esvanece nas pontas |
| `table` | Borda-gradiente (`--post-grad` no border-box), `radius 12px`, thead mono uppercase verde sobre `--g-10`, zebra a .015 |
| task list | Checkbox 15px custom, checked em verde com check escuro |

Depois do corpo: tags pill mono, botão LinkedIn (exceção azul), share bar de vidro com botões 40x40, related em grid `minmax(220px, 1fr)` com os mesmos cards de vidro, author card flex com foto 88px, footer na mesma coluna. Lightbox em `<dialog>` sobre `rgba(6,8,7,.96)`. Print esconde todo o chrome e inverte para fundo branco.

---

## 12. Login (referência)

Página `bernardolindao.html`, corpo `.login-body`. É a porta de entrada do fluxo de publicação e a implementação de referência de formulário do site.

- **Cena**: grid `place-items: center`, `padding 24px`. Único fundo permitido no universo do blog: `radial-gradient(900px 600px at 50% 30%, rgba(34,197,94,.14), transparent 60%)` sobre `--bg`.
- **Card**: `width: min(440px, 100%)`, `padding 40px`, `radius 24px`, borda `--gline-35`, fundo `linear-gradient(135deg, rgba(15,25,20,.85), rgba(8,18,12,.92))`, sombra `0 30px 80px rgba(0,0,0,.5)`. Halo `::before` com dois radiais girando em `blog-rotate 22s linear infinite`.
- **Logo pill**: `padding 6px 12px`, `radius 999px`, fundo `--g-10`, borda `--g-35`, texto 11px 800 `.14em` uppercase lime, dot 6px lime com `box-shadow 0 0 10px var(--lime)`.
- **Títulos**: `.login-title` 28px 900 `-.02em`; `.login-sub` 14px `--text-hint`.
- **Campo padrão de formulário** (vale como referência para qualquer form do site):
  - Label: 11px 700 `.14em` uppercase `--text-hint`
  - Input: altura 48px, `radius 12px`, borda `--gline-28/35`, fundo `--input-bg`, texto 14px
  - Foco: `border-color: var(--green)` + `box-shadow: 0 0 0 4px var(--g-15)`
- **Submit**: altura 50px, `radius 12px`, **gradiente oficial** `var(--gradient-lime)`, texto `#04130a` 14px 800 `.04em` uppercase, sombra `0 10px 28px rgba(34,197,94,.35)`; hover levanta 2px e sobe a sombra para `.5`.
- **Erro**: fundo `rgba(255,80,70,.12)`, borda `rgba(255,80,70,.3)`, texto `--msg-red` 13px 600.

---

## 13. Admin, gerenciar blog (referência de publicação)

Shell `admin.html`, UI montada por `js/blog-admin.js`, corpo `.admin-body` sobre `--bg` sólido. É a implementação de referência de dashboard/ferramenta do design system: mesma paleta e fontes do site, porém superfícies opacas, densidade maior e zero decoração gratuita.

### 13.1 Estrutura

| Token | Valor |
|---|---|
| `--admin-sidebar-w` | `264px` (0 em ≤860px) |
| `--admin-topbar-h` | `64px` (56px em ≤860px) |
| `--admin-content-max` | `1320px` |
| `--admin-content-pad` | `clamp(20px, 3vw, 44px)` |

- **Sidebar** fixa: fundo `linear-gradient(180deg, #0a120e, #060807)`, borda direita `--gline-28`, sombra `6px 0 24px rgba(0,0,0,.45)`. Brand com label 10px `.22em` lime e `<em>` em Instrument Serif. Item de nav: `padding 11px 14px`, `radius 12px`, 13px 700 `--text-soft`, hover `--w-05`; ativo `--g-10` + texto lime + anel interno `inset 0 0 0 1px var(--g-22)`. Logout no fim, hover em vermelho (`--msg-red`). Em ≤860px vira barra horizontal rolável.
- **Topbar** sticky opaca (de propósito, sem blur): `linear-gradient(180deg, #0b1410, #070b09)`, borda inferior `--gline-28` + fio de 1px em gradiente. Título 15px 800, breadcrumb 12px hint.
- **Conteúdo**: `padding 32px var(--admin-content-pad) 60px`, inner `max-width 1320px`, coluna com `gap 24px`. O admin neutraliza explicitamente as regras globais de `header`/`main` do `style.css` e aplica `box-sizing: border-box` universal só no seu escopo.
- **Header de view**: título `clamp(26px, 3vw, 34px)` 900 com `<em>` serif lime, sub 14px hint.

### 13.2 Componentes base

- **Botão** (`.admin-btn`): altura 44px, `padding 0 18px`, `radius 12px`, borda `--gline-35`, fundo `--w-03`, 13px 700, hover borda verde + `--g-08`. Variantes: `--primary` no **gradiente oficial** `var(--gradient-lime)` com texto `#04130a` e sombra verde (hover inverte o sentido do gradiente e levanta 2px); `--danger` em vermelho; `--ghost` transparente; `--sm` 30px com `blur(8px)` sobre `rgba(10,18,14,.8)` (flutua sobre imagens).
- **Botão de ícone** (`.admin-icon-btn`): 32x32, `radius 8px`, borda `--w-10`, fundo `--w-03`; hover borda verde + texto lime + `--g-10`; variante danger em vermelho. SVG 14px.
- **Card** (`.admin-card`): `radius 18px`, borda `--gline-28`, superfície padrão da casa; head `18px 24px` com borda inferior, título 14px 800, sub 11px hint.
- **Stats**: grid de 4, `.admin-stat` `padding 22px` `radius 16px`, hover levanta 2px; valor 32px 900 com gradiente green-lime clipado, label 10px `.16em` uppercase, ícone 34px em `--g-10` lime.
- **Busca** (`.admin-search`): 42px, `radius 10px`, fundo `--input-bg`, borda `--gline-28`, max 360px.

### 13.3 Tabela de posts

- `th`: 10px 800 `.16em` uppercase `--text-hint`, fundo `--w-02`, borda inferior `--gline-28`.
- `td`: `padding 14px 24px`, 13px, borda inferior `--w-05`; hover da linha `--w-02`; linha clicável com `cursor: pointer`.
- Título 14px 700 + slug embaixo em JetBrains Mono 11px hint. Views em lime 800. Estrela de destaque lime com `drop-shadow`.
- **Badges de status** (`padding 4px 10px`, `radius 6px`, 10px 800 `.12em` uppercase):
  - Publicado: fundo `--g-15`, texto lime, borda `--g-35`
  - Rascunho: `rgba(254,188,46,.12)` / `#febc2e` / borda `.3`
  - Agendado: `rgba(99,102,241,.12)` / `#a5b4fc` / borda `.3`

### 13.4 Editor de post

Grid `minmax(0,1fr) + 340px` com gap 20px e `padding-bottom: 120px` (folga para a action bar). Sidebar de metadados sticky em `calc(topbar + 20px)`. Em ≤1024px vira 1 coluna.

- **Seção de fields** (Publicação / Identificação / Mídia / Tags): card `radius 16px` na superfície padrão, título 11px 800 `.18em` uppercase **lime**, head com borda inferior.
- **Field**: label 11px 700 `.14em` uppercase hint em cima; input/textarea/select `padding 11px 14px`, `radius 10px`, fundo `--input-bg`, borda `--gline-28`; foco verde + anel `0 0 0 4px var(--g-10)`. Checkbox 18px com `accent-color: var(--green)`.
- **Campo de título**: input 24px 800 `-.01em` (o título do post já nasce com cara de título).
- **Barra .md** (`.editor-md-io`, importar/baixar o arquivo markdown): faixa entre o head do card e a toolbar, fundo `--w-02`, título 12px 800 lime, hint 11.5px; mensagens `is-ok` (lime sobre `--g-08`) e `is-error` (`--msg-red` sobre vermelho .08); drag de `.md` acende `--g-08` e o textarea ganha `inset 0 0 0 3px var(--g-15)`.
- **Toolbar de formatação**: `padding 10px 14px` sobre gradiente sutil, grupos em caixinhas `radius 9px` fundo `--w-02`, separadores de 1px; botões 32px `radius 7px`, hover `--w-05`, `:active scale(.95)`; variantes `--accent` (verde .08, texto lime) e `--card` (lime .1 com borda lime .25).
- **Textarea do conteúdo**: `min-height 420px`, **JetBrains Mono 13px**, `line-height 1.7` (escreve-se markdown em mono). Contador de palavras/leitura 11px hint com separador `·`.
- **Tabs Editor/Preview**: pill container `--w-03` `radius 10px`; tab ativa `--g-15` + lime.
- **Preview**: `radius 10px`, fundo `--w-02`, versão compacta da tipografia de post (h1 26px, code lime sobre `--w-06`, blockquote com borda verde, tabela com bordas `--gline-28`, task list com accent verde).
- **Dropzone de capa**: `aspect 16/9`, `radius 12px`, borda `1.5px dashed var(--gline-35)`, fundo `--w-02`; hover borda verde + `--g-08` + ícone lime; arrastando vira borda sólida lime + `--g-15` + `scale(.99)`; com imagem, o preview cobre tudo e as ações (`--sm` com blur) flutuam no canto inferior direito.
- **Multi-imagem** (estilo LinkedIn): itens em linha com thumb 56x56 `radius 8px`, caption input 12.5px, ações em `.admin-icon-btn` (desabilitado a `opacity .35`).
- **Tags**: container tipo input (`min-height 46px`, `cursor: text`, foco verde + anel); pill de tag `--g-10` + borda `--g-35` + texto lime 11px 700 com x removível.

### 13.5 Action bar e feedback

- **Action bar de publicação** (`.admin-sticky-actions`): pílula fixa no rodapé do viewport, `bottom 24px`, respeitando a sidebar (`left: sidebar + pad`), `max-width` igual ao conteúdo; `padding 14px 18px`, `radius 14px`, borda `--gline-35`, fundo opaco `linear-gradient(180deg, #0c1410, #080d0a)`, sombra `0 14px 40px rgba(0,0,0,.55)`. Info à esquerda (11px hint) com dot lime pulsando de glow (`box-shadow 0 0 8px var(--lime)`), botões à direita (o de publicar é o `--primary`).
- **Toast**: fixo `bottom/right 24px`, `radius 12px`, fundo quase opaco `linear-gradient(135deg, rgba(15,25,20,.95), rgba(8,18,12,.98))`, **borda verde** (sucesso, com `✓` lime) ou vermelha (erro, com `✕` `--msg-red`), 13px 600, entrada `blog-toast-in .25s ease` subindo 10px.

### 13.6 O que o admin ensina sobre o design

1. Ferramenta usa superfície **opaca** onde conteúdo rola por baixo (topbar, action bar); blur fica para o site público.
2. Status tem cor semântica própria (verde publicado, âmbar rascunho, índigo agendado): as duas únicas cores fora da paleta verde além do LinkedIn, restritas a badges.
3. Labels de ferramenta: 10-11px, 700/800, uppercase, letter-spacing largo, `--text-hint` (ou lime quando é título de grupo).
4. Markdown se escreve em JetBrains Mono e se lê na tipografia do post: o preview é a ponte.
5. Toda área de drop tem 3 estados: repouso tracejado, hover verde, arrastando lime sólido.

---

## 14. Regras da casa

1. **Nunca usar travessão** no conteúdo visível do site. Voz humana e direta, pt-BR no root e en em `/en/`.
2. **Gradiente oficial só em 135deg, green para lime.** Como acento, nunca como superfície.
3. **Texto escuro (`#08120c` / `#04130a`) só existe sobre preenchimento green/lime.**
4. Toda animação nova precisa de: bloco `prefers-reduced-motion`, comportamento nos tiers `medium`/`low`, e mousemove coalescido por rAF com rect cacheado.
5. Blur (`backdrop-filter`) só em elementos fixed/sticky, sempre com fallback sólido no tier `low`.
6. Novos alphas de cor: usar os tokens `--w-*` / `--g-*` / `--gline-*` existentes, não criar rgba solto.
7. Serif = uma palavra de ênfase, itálico, 400. Mono = metadado técnico, pequeno, geralmente uppercase espaçado. Inter = todo o resto.
8. Imagens de preview entram em duotone e ganham cor por interação.
9. Contraste se mede (WCAG AA no pior caso do scrim), não se estima.
10. Blog e post ficam sem fundo. Ponto.
11. Comentários de código em português; nada de trailer de coautoria em commit.
12. Páginas geradas (`projetos/`, `posts/`, `sobre.html`) são build: editar os geradores em `scripts/`, nunca o HTML gerado à mão.
