'use strict';

/* =========================================================
   EXPERIENCE (Timeline / Trail)
   ========================================================= */

const btnAcad    = document.getElementById('btnAcad');
const btnProf    = document.getElementById('btnProf');
const btnCourses = document.getElementById('btnCourses');

const groupAcad    = document.getElementById('group-acad');
const groupProf    = document.getElementById('group-prof');
const groupCourses = document.getElementById('group-courses');

const tlMode = document.getElementById('tlMode');
let CURRENT_MODE = 'prof';

/* SVGs reutilizados ------------------------------------------------ */
const SVG_PIN = `
  <svg class="loc-ico" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"
          stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
  </svg>`;

const SVG_CERT = `
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" class="cert-icon">
    <circle cx="12" cy="9" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="12" cy="9" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <path d="M9.5 13.5 8 20l3-1.7L14 20l-1.5-6.5"
          fill="none" stroke="currentColor" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

/* =========================================================
   YEAR-CARD (caixinha lateral com início/fim)
   ========================================================= */
function yearCardHtml(e, lang) {
  const tl = I18N[lang].xp.timeline;
  const start = e.start || {};
  const end   = e.end   || {};

  const startBlock = `
    <div class="tl-year-row">
      <span class="tl-year-num">${start.year ?? ''}</span>
      <span class="tl-year-mon">${start.month ?? ''}</span>
    </div>`;

  const endBlock = end.current
    ? `
      <div class="tl-year-row tl-year-row--current">
        <span class="tl-year-num">${tl.currentLabel || 'Current'}</span>
        <span class="tl-year-mon">${tl.currentSub   || 'IN PROGRESS'}</span>
      </div>`
    : `
      <div class="tl-year-row">
        <span class="tl-year-num">${end.year ?? ''}</span>
        <span class="tl-year-mon">${end.month ?? ''}</span>
      </div>`;

  return `
    <div class="tl-year">
      ${startBlock}
      ${endBlock}
    </div>`;
}

/* =========================================================
   CONTENT-CARD (card grande com a experiência)
   ========================================================= */
function contentCardHtml(e) {
  let certBlock = '';
  if (e.cert && e.cert.id && e.cert.img) {
    const imgSrc = e.cert.img.startsWith('img/') ? e.cert.img : `img/${e.cert.img}`;
    const label  = e.cert.label || 'Certificate';

    certBlock = `
      <div class="cert-btn-wrap">
        <button class="btn-cert" type="button" data-cert-id="${e.cert.id}">
          ${SVG_CERT}
          <span>${label}</span>
        </button>
      </div>
      <dialog id="${e.cert.id}" class="cert-modal">
        <div class="cert-content">
          <button class="cert-close" type="button" aria-label="Close certificate">×</button>
          <img src="${imgSrc}" alt="${label} - ${e.title}" loading="lazy" decoding="async">
        </div>
      </dialog>`;
  }

  const head = `
    <h3 class="tl-card-title">${e.title}</h3>
    <div class="tl-meta">
      <span class="tl-org">${e.org}</span>
      <span class="tl-role">${e.role}</span>
    </div>`;

  const loc = e.loc
    ? `<div class="tl-loc">${SVG_PIN}<span>${e.loc}</span></div>`
    : '';

  const bullets = Array.isArray(e.bullets) && e.bullets.length
    ? `<ul class="tl-bullets">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
    : '';

  const skills = Array.isArray(e.skills) && e.skills.length
    ? `<div class="tl-skills">${e.skills.map(s => `<button class="btn-skill" type="button">${s}</button>`).join('')}</div>`
    : '';

  return `
    <div class="tl-card panel">
      ${head}
      ${loc}
      ${bullets}
      ${certBlock}
      ${skills}
    </div>`;
}

/* =========================================================
   END-OF-TIMELINE (indicador "continua" no final de cada track)
   ========================================================= */
function buildTlEnd() {
  const el = document.createElement('div');
  el.className = 'tl-end';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <span class="tl-end__dot tl-end__dot--a"></span>
    <span class="tl-end__dot tl-end__dot--b"></span>
    <span class="tl-end__dot tl-end__dot--c"></span>
    <span class="tl-end__dot tl-end__dot--d"></span>
    <span class="tl-end__btn">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="tl-end__icon">
        <path class="tl-end__chev tl-end__chev--1"
          d="M6 6.5l5 5.5-5 5.5"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="tl-end__chev tl-end__chev--2"
          d="M13 6.5l5 5.5-5 5.5"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  `;
  return el;
}

/* =========================================================
   ENTRY (linha completa: ano + dot + card, alternada)
   ========================================================= */
function buildTlEntry(e, index, lang) {
  // Par = card à direita, ano à esquerda. Ímpar = invertido.
  const cardSide = index % 2 === 0 ? 'right' : 'left';

  const article = document.createElement('article');
  article.className = `tl-entry tl-entry--${cardSide}`;

  // Estrutura simples: .tl-year, .dot, .tl-card são grid items diretos
  // de .tl-entry. Sem wrappers .tl-side — assim o grid pode centralizar
  // verticalmente cada item de forma confiável.
  article.innerHTML = `
    ${yearCardHtml(e, lang)}
    <span class="dot" aria-hidden="true"></span>
    ${contentCardHtml(e)}`;

  return article;
}

/* =========================================================
   MODAIS DE CERTIFICADO
   ========================================================= */
function wireCertModals() {
  document.querySelectorAll('.btn-cert').forEach(btn => {
    const id = btn.getAttribute('data-cert-id');
    if (!id) return;

    const dialog = document.getElementById(id);
    if (!dialog) return;

    const closeBtn = dialog.querySelector('.cert-close');

    btn.addEventListener('click', () => {
      if (dialog.showModal) {
        dialog.showModal();
      } else {
        const img = dialog.querySelector('img');
        if (img && img.src) window.open(img.src, '_blank');
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());

    dialog.addEventListener('cancel', ev => {
      ev.preventDefault();
      dialog.close();
    });
  });
}

/* =========================================================
   RENDER + SWITCH MODE
   ========================================================= */
function renderTimeline(lang) {
  if (!groupProf || !groupAcad || !groupCourses) return;

  const data = I18N[lang].xp.timeline;

  const fillGroup = (group, list) => {
    group.innerHTML = '';
    list.forEach((e, i) => group.appendChild(buildTlEntry(e, i, lang)));
    group.appendChild(buildTlEnd());
  };

  fillGroup(groupProf,    data.prof    || []);
  fillGroup(groupAcad,    data.acad    || []);
  fillGroup(groupCourses, data.courses || []);

  setMode(CURRENT_MODE, lang);
  wireCertModals();
}

function setMode(mode, lang = LANG) {
  CURRENT_MODE = mode;

  if (tlMode) tlMode.textContent = I18N[lang].xp.modes?.[mode] || I18N[lang].modes?.[mode] || '';

  groupProf?.classList.toggle('is-hidden',    mode !== 'prof');
  groupAcad?.classList.toggle('is-hidden',    mode !== 'acad');
  groupCourses?.classList.toggle('is-hidden', mode !== 'courses');

  btnProf?.classList.toggle('active',    mode === 'prof');
  btnAcad?.classList.toggle('active',    mode === 'acad');
  btnCourses?.classList.toggle('active', mode === 'courses');
}

btnProf?.addEventListener('click',    () => setMode('prof'));
btnAcad?.addEventListener('click',    () => setMode('acad'));
btnCourses?.addEventListener('click', () => setMode('courses'));
