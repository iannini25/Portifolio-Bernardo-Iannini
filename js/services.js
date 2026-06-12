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

  /* Gauge / speedometer — Performance */
  gauge:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M3 14a9 9 0 1 1 18 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="12" y1="14" x2="16" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="12" cy="14" r="1.6" fill="currentColor"/>' +
      '<line x1="3" y1="14" x2="5" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<line x1="19" y1="14" x2="21" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<line x1="12" y1="5" x2="12" y2="7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '</svg>',

  /* Filmstrip — Video / Motion */
  film:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/>' +
      '<line x1="7" y1="4"  x2="7"  y2="20" stroke="currentColor" stroke-width="1.8"/>' +
      '<line x1="17" y1="4" x2="17" y2="20" stroke="currentColor" stroke-width="1.8"/>' +
      '<line x1="3" y1="9"   x2="7"  y2="9"  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<line x1="3" y1="14"  x2="7"  y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<line x1="17" y1="9"  x2="21" y2="9"  stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      '<line x1="17" y1="14" x2="21" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
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

function buildServiceCard(item, ctaLabel) {
  const card = document.createElement('article');
  card.className = 'service-card';

  if (item.color) {
    card.style.setProperty('--svc-color', item.color);
  }

  const iconSvg = SERVICE_ICONS[item.icon] || SERVICE_ICONS.code;
  const features = (item.features || [])
    .map(f => `<li>${f}</li>`)
    .join('');

  card.innerHTML = `
    <div class="service-head">
      <span class="service-icon" aria-hidden="true">${iconSvg}</span>
      ${item.tag ? `<span class="service-tag">${item.tag}</span>` : ''}
    </div>

    <h3 class="service-title">${item.title}</h3>
    <p class="service-desc">${item.desc || ''}</p>

    ${features ? `<ul class="service-features">${features}</ul>` : ''}

    <a class="service-cta" href="#contato">
      <span>${ctaLabel}</span>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
  `;

  // scroll suave próprio (o bind global de a[data-scroll] do UI.js roda
  // antes deste render; scroll-margin-top da section compensa o header)
  card.querySelector('.service-cta').addEventListener('click', e => {
    const target = document.querySelector('#contato');
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  grid.innerHTML = '';
  (data.list || []).forEach(item => grid.appendChild(buildServiceCard(item, ctaLabel)));
}
