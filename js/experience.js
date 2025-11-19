'use strict';

/* =========================================================
   EXPERIENCE (Timeline)
   ========================================================= */

const btnAcad = document.getElementById('btnAcad');
const btnProf = document.getElementById('btnProf');
const btnCourses = document.getElementById('btnCourses');

const groupAcad = document.getElementById('group-acad');
const groupProf = document.getElementById('group-prof');
const groupCourses = document.getElementById('group-courses');

const tlMode = document.getElementById('tlMode');
let CURRENT_MODE = 'prof';

function buildTlEntry(e, side) {
  const el = document.createElement('article');
  el.className = `tl-entry ${side}`;

  /* ---------------------------------------------------------
     BLOCO OPCIONAL DE CERTIFICADO (BOTÃO + MODAL)
     --------------------------------------------------------- */
  let certBlock = '';
  if (e.cert && e.cert.id && e.cert.img) {
    const imgSrc = e.cert.img.startsWith('img/')
      ? e.cert.img
      : `img/${e.cert.img}`;
    const label = e.cert.label || 'Certificate';

    certBlock = `
        <div class="cert-btn-wrap">
          <button class="btn-cert" type="button" data-cert-id="${e.cert.id}">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="cert-icon">
              <!-- medalha circular -->
              <circle cx="12" cy="9" r="5.2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6" />
              <circle cx="12" cy="9" r="2.6"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4" />

              <!-- fitas da medalha -->
              <path
                d="M9.5 13.5 8 20l3-1.7L14 20l-1.5-6.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>${label}</span>
          </button>
        </div>

        <dialog id="${e.cert.id}" class="cert-modal">
          <div class="cert-content">
            <button class="cert-close" type="button" aria-label="Close certificate">×</button>
            <img src="${imgSrc}" alt="${label} - ${e.title}">
          </div>
        </dialog>
    `;
  }

  /* ---------------------------------------------------------
     TEMPLATE DO CARD DA TIMELINE
     --------------------------------------------------------- */
  el.innerHTML = `
      <span class="dot"></span>
      <div class="tl-card panel">
        <div class="card-head">
          <span class="caret">›_</span><span class="sep"></span>
        </div>

        <h3>${e.title}</h3>

        <div class="meta">
          <span class="pill org">${e.org}</span>
          <span class="pill role">${e.role}</span>
        </div>

        ${certBlock}

        ${e.loc ? `
        <div class="loc">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"
             stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="10" r="3"
             stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>${e.loc}</span>
        </div>` : ''}

        ${Array.isArray(e.bullets)
        ? `<ul class="bullets">${e.bullets
          .map(b => `<li>${b}</li>`)
          .join('')}</ul>`
        : ''}

        <div class="skills">
          ${(e.skills || [])
        .map(s => `<button class="btn-skill">${s}</button>`)
        .join('')}
        </div>
      </div>
    `;

  return el;
}

/* =========================================================
   LIGA OS MODAIS DOS CERTIFICADOS
   ========================================================= */
function wireCertModals() {
  const buttons = document.querySelectorAll('.btn-cert');

  buttons.forEach(btn => {
    const id = btn.getAttribute('data-cert-id');
    if (!id) return;

    const dialog = document.getElementById(id);
    if (!dialog) return;

    const closeBtn = dialog.querySelector('.cert-close');

    // abrir modal
    btn.addEventListener('click', () => {
      if (dialog.showModal) {
        dialog.showModal();
      } else {
        const img = dialog.querySelector('img');
        if (img && img.src) window.open(img.src, '_blank');
      }
    });

    // fechar modal com o X
    if (closeBtn)
      closeBtn.addEventListener('click', () => dialog.close());

    // impedir que ESC feche abruptamente
    dialog.addEventListener('cancel', e => {
      e.preventDefault();
      dialog.close();
    });
  });
}

/* =========================================================
   RENDERIZA A TIMELINE
   ========================================================= */
function renderTimeline(lang) {
  if (!groupProf || !groupAcad || !groupCourses) return;

  groupProf.innerHTML = '';
  groupAcad.innerHTML = '';
  groupCourses.innerHTML = '';

  const data = I18N[lang].xp.timeline;
  const sides = n => (n % 2 ? 'right' : 'left');

  data.prof.forEach((e, i) => groupProf.appendChild(buildTlEntry(e, sides(i))));
  data.acad.forEach((e, i) => groupAcad.appendChild(buildTlEntry(e, sides(i))));
  data.courses.forEach((e, i) =>
    groupCourses.appendChild(buildTlEntry(e, sides(i)))
  );

  setMode(CURRENT_MODE, lang);

  // depois de renderizar tudo, conectar eventos dos modais
  wireCertModals();
}

/* =========================================================
   TROCA ENTRE OS MODOS (prof / acad / courses)
   ========================================================= */
function setMode(mode, lang = LANG) {
  CURRENT_MODE = mode;

  if (tlMode) tlMode.textContent = I18N[lang].xp.modes?.[mode] || '';

  groupProf?.classList.toggle('is-hidden', mode !== 'prof');
  groupAcad?.classList.toggle('is-hidden', mode !== 'acad');
  groupCourses?.classList.toggle('is-hidden', mode !== 'courses');

  btnProf?.classList.toggle('active', mode === 'prof');
  btnAcad?.classList.toggle('active', mode === 'acad');
  btnCourses?.classList.toggle('active', mode === 'courses');
}

btnProf?.addEventListener('click', () => setMode('prof'));
btnAcad?.addEventListener('click', () => setMode('acad'));
btnCourses?.addEventListener('click', () => setMode('courses'));
