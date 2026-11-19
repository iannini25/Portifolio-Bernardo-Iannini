'use strict';

/* =========================================================
   BLOG LAYOUT — monta o bento da pagina do blog.
   Mesma funcao no build (scripts/build-posts.js, HTML estatico que o
   Google le) e no navegador (js/blog.js, filtros e busca).

   Com 6 posts ou mais, abre com a composicao principal:
     foto grande | cartao lime com lista | cartao verde com arco
                 | foto com vidro        | cartao de temas
   O que sobra vai em linhas de dois tamanhos alternados. Post sem capa
   vira cartao de texto, nunca um quadro vazio.

   post: { id, slug, title, excerpt, cover, coverAlt, category, tags,
           date, readMin, featured, url }
   ========================================================= */
(function (root) {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const ARROW = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ARROW_UP = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 6.6L21 9.2l-5 4.6L17.4 21 12 17.7 6.6 21 8 13.8 3 9.2l6.6-.6z"/></svg>';

  /* botao em flor do cartao de temas: 8 petalas em volta de um miolo */
  const FLOWER = '<svg class="bb-flower" viewBox="0 0 60 60" fill="currentColor" aria-hidden="true"><circle cx="30" cy="30" r="22"/>' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const r = a * Math.PI / 180;
      return `<circle cx="${(30 + 21 * Math.cos(r)).toFixed(1)}" cy="${(30 + 21 * Math.sin(r)).toFixed(1)}" r="8"/>`;
    }).join('') + '</svg>';

  /* "13 ago 2026" / "13 Aug 2026", sempre no fuso de quem escreve */
  function shortDate(iso, lang) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const parts = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo',
    }).formatToParts(d);
    const get = (t) => (parts.find(p => p.type === t) || {}).value || '';
    return `${get('day')} ${get('month').replace('.', '')} ${get('year')}`;
  }

  function render(posts, opts) {
    const { lang, labels: L, coverOf, facets, filter, query } = opts;
    const catName = (c) => (L.cats && L.cats[c]) || c;   // a categoria e gravada em pt
    let eager = true;   // so a primeira capa carrega sem lazy (e o LCP da pagina)

    const media = (p) => {
      const loading = eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
      eager = false;
      return `<div class="bb-media"><img src="${esc(coverOf(p.cover))}" alt="${esc(p.coverAlt || p.title)}" width="800" height="500" ${loading}></div>`;
    };
    const open = (p, cls, i) => `<article class="bb ${cls}" style="--i:${i}" data-id="${esc(p.id)}" data-slug="${esc(p.slug)}" data-action="open" data-href="${esc(p.url)}">`;
    const meta = (p) => `<p class="bb-meta">${p.category ? `<strong>${esc(catName(p.category))}</strong><span class="bb-dot" aria-hidden="true"></span>` : ''}<span>${esc(shortDate(p.date, lang))}</span></p>`;
    const title = (p) => `<h2 class="bb-t"><a href="${esc(p.url)}">${esc(p.title)}</a></h2>`;
    const go = (p) => `<span class="bb-notch bb-notch--tr"><a class="bb-go" href="${esc(p.url)}" tabindex="-1" aria-hidden="true">${ARROW_UP}</a></span>`;

    /* foto inteira e o titulo numa aba com curvas invertidas */
    const photo = (p, cls, i) => !p.cover ? note(p, cls, i) : `${open(p, `bb--photo ${cls}`, i)}
      ${media(p)}
      ${p.featured ? `<span class="bb-badge" title="${esc(L.featured)}">${STAR}<span class="sr-only">${esc(L.featured)}</span></span>` : ''}
      <div class="bb-tab">${meta(p)}${title(p)}</div>
    </article>`;

    /* cartao lime: destaque de texto e, se houver, a lista de outros posts */
    const list = (p, rows, cls, i) => `${open(p, `bb--list ${cls}`, i)}
      ${go(p)}
      <div class="bb-list-main">
        ${meta(p)}${title(p)}
        ${p.excerpt ? `<p class="bb-excerpt">${esc(p.excerpt)}</p>` : ''}
        <a class="bb-more" href="${esc(p.url)}" tabindex="-1">${esc(L.more)}</a>
      </div>
      ${rows.length ? `<ul class="bb-rows">${rows.map(r => `<li><a href="${esc(r.url)}"><span>${esc(r.title)}</span>${ARROW}</a></li>`).join('')}</ul>` : ''}
    </article>`;

    /* cartao verde: texto em cima e a foto num arco no canto */
    const arch = (p, cls, i) => !p.cover ? note(p, cls, i) : `${open(p, `bb--arch ${cls}`, i)}
      <div class="bb-arch-text">${meta(p)}${title(p)}</div>
      ${media(p)}
    </article>`;

    /* foto com o texto por cima e um circulo de vidro no centro */
    const glass = (p, cls, i) => !p.cover ? note(p, cls, i) : `${open(p, `bb--glass ${cls}`, i)}
      ${media(p)}
      <span class="bb-orb" aria-hidden="true">${ARROW_UP}</span>
      <div class="bb-glass-text"><p class="bb-meta"><span>${esc(p.readMin)} ${esc(L.read)}</span><span class="bb-dot" aria-hidden="true"></span><span>${esc(shortDate(p.date, lang))}</span></p>${title(p)}</div>
    </article>`;

    const note = (p, cls, i) => `${open(p, `bb--note ${cls}`, i)}
      ${go(p)}
      <div class="bb-list-main">${meta(p)}${title(p)}${p.excerpt ? `<p class="bb-excerpt">${esc(p.excerpt)}</p>` : ''}</div>
    </article>`;

    const topics = (cls, i) => {
      const active = filter !== 'all' || !!query;
      const pills = [
        ...facets.categories.map(c => `<button type="button" class="bb-pill${filter === c ? ' is-on' : ''}" data-filter="${esc(c)}">${esc(catName(c))}</button>`),
        ...facets.tags.map(t => `<button type="button" class="bb-pill${query === t ? ' is-on' : ''}" data-tag="${esc(t)}">${esc(t)}</button>`),
      ].join('');
      return `<aside class="bb bb--topics ${cls}" style="--i:${i}" aria-label="${esc(L.topics)}">
      <h2 class="bb-topics-t">${esc(L.topics)}</h2>
      <div class="bb-pills">${pills}</div>
      <p class="bb-all">${esc(L.allTopics)}</p>
      <span class="bb-notch bb-notch--br"><button type="button" class="bb-flower-btn${active ? ' is-on' : ''}" data-reset aria-label="${esc(L.allTopics)}">${FLOWER}${ARROW}</button></span>
    </aside>`;
    };

    /* linhas seguintes: dois tamanhos que se alternam; sozinho ocupa tudo */
    const rest = (items, startIndex) => {
      const out = [];
      let row = 0;
      for (let k = 0; k < items.length; k += 2, row++) {
        const a = items[k], b = items[k + 1];
        const i = startIndex + k;
        const one = (it, cls, idx, alt) => it === 'topics' ? topics(cls, idx)
          : (alt ? arch(it, cls, idx) : photo(it, cls, idx));
        if (!b) { out.push(one(a, 'bb--s24', i, false)); break; }
        out.push(row % 2 === 0
          ? one(a, 'bb--s14', i, false) + one(b, 'bb--s10', i + 1, true)
          : one(a, 'bb--s10', i, true) + one(b, 'bb--s14', i + 1, false));
      }
      return out.join('\n');
    };

    if (posts.length >= 6) {
      const [a, b, r1, r2, c, d] = posts;
      return [
        photo(a, 'bb--a', 0),
        list(b, [r1, r2], 'bb--b', 1),
        arch(c, 'bb--c', 2),
        glass(d, 'bb--d', 3),
        topics('bb--e', 4),
        rest(posts.slice(6), 5),
      ].join('\n');
    }
    return rest([...posts, 'topics'], 0);
  }

  const api = { render };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BlogLayout = api;
})(typeof window !== 'undefined' ? window : globalThis);
