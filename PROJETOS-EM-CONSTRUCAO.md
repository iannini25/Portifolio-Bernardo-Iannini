# Projetos — alternar entre "Em construção" e a showcase real

A section de projetos tem **dois modos**, controlados por **um único atributo** no
`index.html`: o `data-ps-soon` na `<section id="projects">`.

- **Com** `data-ps-soon` → aparece a tela "Seção em atualização" (tampa-buraco).
- **Sem** `data-ps-soon` → aparece a showcase real, com todos os projetos.

Todo o código da showcase (HTML, `js/projects.js`, animações do `js/scrollfx.js`)
permanece intacto nos dois modos — nada é apagado, só ocultado.

---

## ✅ Voltar a MOSTRAR os projetos

1. Abra o `index.html` e procure por `data-ps-soon` (fica na abertura da section
   de projetos, perto da linha ~669).
2. Apague **apenas o atributo** `data-ps-soon`. A linha:

   ```html
   <section id="projects" class="section projects projects-showcase" aria-label="projects" data-ps-soon>
   ```

   vira:

   ```html
   <section id="projects" class="section projects projects-showcase" aria-label="projects">
   ```

3. Salve. Pronto — a showcase volta inteira (cards, painel sticky, botão de
   repositórios, animações e traduções).

> Não precisa mexer em CSS nem em JS. O bloco do placeholder (`<div class="ps-soon">…`)
> pode ficar onde está: sem o atributo, ele some sozinho (o CSS o esconde por padrão).

---

## 🚧 Voltar pro modo "Em construção"

Faça o caminho inverso: adicione `data-ps-soon` de volta na mesma tag:

```html
<section id="projects" class="section projects projects-showcase" aria-label="projects" data-ps-soon>
```

Salve e a tela de "Seção em atualização" volta a tampar a section.

---

## Onde cada coisa vive (se um dia precisar mexer)

| O quê                              | Onde                                                          |
| ---------------------------------- | ------------------------------------------------------------- |
| Atributo que alterna os modos      | `index.html` → `<section id="projects" … data-ps-soon>`       |
| Markup do placeholder              | `index.html` → `<div class="ps-soon">` (dentro da section)    |
| Estilos do placeholder             | `style.css` → bloco `PROJECTS "EM CONSTRUÇÃO" (data-ps-soon)` |
| Guard que pula a montagem dos cards| `js/projects.js` → início de `renderProjects()`               |
| Textos PT/EN do placeholder        | `js/language.js` → `projects.soonKicker/soonTitle/soonSub`    |

## Como adicionar os projetos quando chegar a hora

Os projetos são definidos em `js/language.js`, dentro de `projects.list`
(uma lista em inglês e outra em português). Cada projeto só entra na showcase
se tiver **capa (`cover`) e link (`link`)**. Depois de preencher a lista,
remova o `data-ps-soon` como descrito acima.
