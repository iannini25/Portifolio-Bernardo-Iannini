'use strict';

/* ============================================================
   BLOG SORT — troca o <select> nativo por um listbox da casa.

   POR QUE: o <select> abre o menu do SISTEMA OPERACIONAL (lista
   cinza, realce azul), que nao tem nada a ver com o design do
   site e nao aceita estilo nenhum por dentro.

   COMO: progressive enhancement. O <select> continua no HTML e
   continua sendo a FONTE DA VERDADE — este script so o esconde e
   desenha um listbox por cima. Ao escolher uma opcao, escreve no
   select e dispara 'change', entao o js/blog.js nao muda em nada
   (ele ja escuta o change do #blogSort). Sem JS, o usuario ve o
   select nativo normal e a ordenacao funciona igual.

   PADRAO VISUAL: o mesmo do switch de idioma do header
   (.lang-switch + .lang-menu em style.css) — pill de gatilho,
   painel com blur, e o circulo lime que sobe preenchendo o item
   no hover. Assim o blog nao inventa um componente novo.

   A11Y: role=listbox/option, aria-expanded, aria-activedescendant,
   teclado completo (setas, Home/End, Enter/Espaco, Esc, Tab),
   foco devolvido ao gatilho ao fechar, digitar salta pra opcao.
   ============================================================ */
(function blogSortListbox() {
  const select = document.getElementById('blogSort');
  if (!select || select.dataset.enhanced === '1') return;

  const host = select.closest('.blog-sort') || select.parentElement;
  if (!host) return;

  const options = Array.from(select.options);
  if (!options.length) return;

  select.dataset.enhanced = '1';
  select.classList.add('blog-sort-select--native');   // esconde (CSS)
  select.setAttribute('tabindex', '-1');
  select.setAttribute('aria-hidden', 'true');

  /* ---------- monta o gatilho + painel ---------- */
  const wrap = document.createElement('div');
  wrap.className = 'blog-sort-ui';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'blog-sort-trigger';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  // o <label for="blogSort"> ja nomeia o controle; aponta pra ele
  const labelEl = host.querySelector('.blog-sort-label');
  if (labelEl) {
    if (!labelEl.id) labelEl.id = 'blogSortLabel';
    btn.setAttribute('aria-labelledby', labelEl.id);
  } else {
    btn.setAttribute('aria-label', 'Ordenar');
  }

  const btnText = document.createElement('span');
  btnText.className = 'blog-sort-value';
  btn.appendChild(btnText);

  btn.insertAdjacentHTML('beforeend',
    '<svg class="blog-sort-caret" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');

  const list = document.createElement('ul');
  list.className = 'blog-sort-menu';
  list.setAttribute('role', 'listbox');
  list.id = 'blogSortMenu';
  btn.setAttribute('aria-controls', list.id);

  const items = options.map((opt, i) => {
    const li = document.createElement('li');
    li.className = 'blog-sort-option';
    li.id = 'blogSortOpt' + i;
    li.setAttribute('role', 'option');
    li.dataset.value = opt.value;
    li.textContent = opt.textContent.trim();
    // o i18n do site reescreve o <option>; o texto do item e re-sincronizado
    // em syncFromSelect(), entao traduzir a pagina nao quebra o rotulo.
    list.appendChild(li);
    return li;
  });

  wrap.append(btn, list);
  host.appendChild(wrap);

  /* ---------- estado ---------- */
  let openIdx = -1;   // item "ativo" (navegacao por teclado) enquanto aberto

  const isOpen = () => list.classList.contains('open');

  function syncFromSelect() {
    const i = Math.max(0, select.selectedIndex);
    btnText.textContent = (options[i] && options[i].textContent.trim()) || '';
    items.forEach((li, k) => {
      li.textContent = options[k].textContent.trim();   // re-sincroniza i18n
      li.setAttribute('aria-selected', k === i ? 'true' : 'false');
    });
  }

  function setActive(i) {
    openIdx = Math.max(0, Math.min(items.length - 1, i));
    items.forEach((li, k) => li.classList.toggle('is-active', k === openIdx));
    const li = items[openIdx];
    if (li) {
      btn.setAttribute('aria-activedescendant', li.id);
      // mantem visivel quando a lista tem rolagem
      if (li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
    }
  }

  function open() {
    if (isOpen()) return;
    syncFromSelect();
    list.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    setActive(Math.max(0, select.selectedIndex));
  }

  function close(focusBtn) {
    if (!isOpen()) return;
    list.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.removeAttribute('aria-activedescendant');
    items.forEach(li => li.classList.remove('is-active'));
    openIdx = -1;
    if (focusBtn) btn.focus();
  }

  /* escolher: escreve no <select> e dispara change -> js/blog.js reordena */
  function choose(i) {
    const opt = options[i];
    if (!opt) return;
    if (select.value !== opt.value) {
      select.value = opt.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    syncFromSelect();
    close(true);
  }

  /* ---------- mouse ---------- */
  btn.addEventListener('click', () => (isOpen() ? close(false) : open()));

  list.addEventListener('click', e => {
    const li = e.target.closest('.blog-sort-option');
    if (!li) return;
    choose(items.indexOf(li));
  });

  list.addEventListener('mousemove', e => {
    const li = e.target.closest('.blog-sort-option');
    if (li) setActive(items.indexOf(li));
  }, { passive: true });

  document.addEventListener('click', e => {
    if (isOpen() && !wrap.contains(e.target)) close(false);
  });

  /* ---------- teclado ---------- */
  btn.addEventListener('keydown', e => {
    const k = e.key;
    if (!isOpen()) {
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ' || k === 'Spacebar') {
        e.preventDefault();
        open();
      }
      return;
    }
    if (k === 'ArrowDown')      { e.preventDefault(); setActive(openIdx + 1); }
    else if (k === 'ArrowUp')   { e.preventDefault(); setActive(openIdx - 1); }
    else if (k === 'Home')      { e.preventDefault(); setActive(0); }
    else if (k === 'End')       { e.preventDefault(); setActive(items.length - 1); }
    else if (k === 'Enter' || k === ' ' || k === 'Spacebar') { e.preventDefault(); choose(openIdx); }
    else if (k === 'Escape')    { e.preventDefault(); close(true); }
    else if (k === 'Tab')       { close(false); }
    else if (k.length === 1) {
      // digitar a primeira letra salta pra opcao correspondente
      const from = openIdx + 1;
      const found = items.findIndex((li, idx) =>
        idx >= from && li.textContent.trim().toLowerCase().startsWith(k.toLowerCase()));
      const wrapped = found !== -1 ? found : items.findIndex(li =>
        li.textContent.trim().toLowerCase().startsWith(k.toLowerCase()));
      if (wrapped !== -1) setActive(wrapped);
    }
  });

  /* o i18n troca o texto dos <option> depois; reflete no listbox */
  select.addEventListener('change', syncFromSelect);
  document.addEventListener('i18n:applied', syncFromSelect);
  // fallback: o site aplica i18n no load sem evento proprio garantido
  window.addEventListener('load', syncFromSelect);

  syncFromSelect();
})();
