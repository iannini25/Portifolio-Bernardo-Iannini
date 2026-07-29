'use strict';

/* =========================================================
   SERVICES — grid de cards com ícone, tag, título, descrição e features
   ========================================================= */

const SERVICE_ICONS = {
  /* Code brackets — Web */
  code:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<line x1="14" y1="4" x2="10" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>',

  /* Brain (two-lobe) — AI / Core */
  brain:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M10 4a3 3 0 0 0-3 3 2.5 2.5 0 0 0-2 2.5A2.5 2.5 0 0 0 7 12a2.5 2.5 0 0 0-2 2.5A2.5 2.5 0 0 0 7 17a3 3 0 0 0 3 3" ' +
        'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M14 4a3 3 0 0 1 3 3 2.5 2.5 0 0 1 2 2.5A2.5 2.5 0 0 1 17 12a2.5 2.5 0 0 1 2 2.5A2.5 2.5 0 0 1 17 17a3 3 0 0 1-3 3" ' +
        'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<line x1="10" y1="4" x2="14" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<line x1="10" y1="20" x2="14" y2="20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>' +
    '</svg>',

  /* Stacked layers — Systems / Platforms */
  layers:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 3 3 8l9 5 9-5-9-5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M3 13l9 5 9-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M3 17.5l9 5 9-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
    '</svg>',

  /* Cloud upload — Deploy / Ops */
  tool:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M7 17a4 4 0 0 1-.7-7.9 6 6 0 0 1 11.6 1A3.5 3.5 0 0 1 17 17H7z" ' +
        'stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M12 10v7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M9.5 12.5 12 10l2.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>',
};

function buildServiceCard(item, ctaLabel, index) {
  const card = document.createElement('article');
  card.className = 'svc-card';
  card.style.setProperty('--i', index);            // usado no top do sticky

  // Alterna as 2 cores principais do site (verde / lime) por card: fica
  // harmonico e faz a TROCA do deck ficar obvia (a cor muda a cada swap).
  card.style.setProperty('--svc-color', index % 2 ? 'var(--lime)' : 'var(--green)');

  const iconSvg = SERVICE_ICONS[item.icon] || SERVICE_ICONS.code;
  const features = (item.features || [])
    .map(f => `<li>${f}</li>`)
    .join('');
  const num = String(index + 1).padStart(2, '0');

  card.innerHTML = `
    <div class="svc-card__inner">
      <span class="svc-watermark" aria-hidden="true">${iconSvg}</span>
      <span class="svc-bloom" aria-hidden="true"></span>

      <div class="svc-card__depth">
        <div class="svc-card__head">
          <span class="svc-icon" aria-hidden="true">${iconSvg}</span>
          <span class="svc-head-text">
            <h3 class="svc-title">${item.title}</h3>
            ${item.tag ? `<span class="svc-tag">${item.tag}</span>` : ''}
          </span>
        </div>

        <p class="svc-desc">${item.desc || ''}</p>
        ${features ? `<ul class="svc-features">${features}</ul>` : ''}

        <a class="svc-cta" href="#contato">
          <span>${ctaLabel}</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  `;

  // scroll suave proprio pro CTA (mesmo comportamento de antes)
  card.querySelector('.svc-cta').addEventListener('click', e => {
    const target = document.querySelector('#contato');
    if (!target) return;
    e.preventDefault();
    if (window.lenis) window.lenis.scrollTo(target);
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  return card;
}

function renderServices(lang) {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  const data = I18N[lang].services;
  if (!data) return;

  const titleEl = document.querySelector('#services .section-title');
  const subEl   = document.querySelector('#services .section-sub');
  if (titleEl) titleEl.textContent = data.title;
  if (subEl)   subEl.textContent   = data.sub;

  // CTA de venda no rodapé de cada card (fallback se o i18n não tiver)
  const ctaLabel = data.ctaLabel || (lang === 'pt' ? 'Solicitar proposta' : 'Get a quote');

  // Os cards vivem dentro de um .svc-pile (o "palco"): em modo pilha
  // (CardSwap) ele vira o container 3D fixado na viewport; no fallback
  // estatico e so um bloco normal e os cards viram lista vertical.
  // #servicesGrid segue como hook externo (observers de i18n).
  grid.innerHTML = '';
  const pile = document.createElement('div');
  pile.className = 'svc-pile';
  (data.list || []).forEach((item, i) => pile.appendChild(buildServiceCard(item, ctaLabel, i)));
  grid.appendChild(pile);

  // Avisa as camadas de scroll (pilha CardSwap) e reveal pra reconstruir.
  // Evento explicito no lugar de MutationObserver: o pin do ScrollTrigger
  // cria um .pin-spacer que faria o observer entrar em loop de rebuild.
  document.dispatchEvent(new CustomEvent('svc:rendered'));
}
