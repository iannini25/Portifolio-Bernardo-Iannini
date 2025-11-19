'use strict';

/* =========================================================
   PROJECTS — cards + modal de detalhes
   ========================================================= */

/* ---------- Modal helpers ---------- */

let currentProject = null;

function getProjectModalElements() {
  const dialog = document.getElementById('projModal');
  if (!dialog) return null;

  return {
    dialog,
    frame: dialog.querySelector('.proj-modal-frame'),
    title: dialog.querySelector('.proj-modal-title'),
    desc: dialog.querySelector('.proj-modal-desc'),
    chipsWrap: dialog.querySelector('.proj-modal-chips'),
    btnClose: dialog.querySelector('[data-close]'),
    btnRepo: dialog.querySelector('.proj-modal-btn.github'),
    btnSite: dialog.querySelector('.proj-modal-btn.primary'),
  };
}

function closeProjectModal() {
  const els = getProjectModalElements();
  if (!els) return;

  if (typeof els.dialog.close === 'function') {
    els.dialog.close();
  } else {
    els.dialog.removeAttribute('open');
  }
}

/**
 * Abre o modal no estilo do layout de referência
 * p = objeto de projeto vindo de I18N[LANG].projects.list
 */
function openProjectModal(p) {
  const els = getProjectModalElements();
  if (!els) return;

  currentProject = p;

  const { dialog, title, desc, chipsWrap, btnRepo, btnSite } = els;
  const ctas = I18N[LANG].projects.ctas;

  // Título
  if (title) {
    title.textContent = p.title || '';
  }

  // Descrição longa, se existir; senão, usa desc do card
  const longText = p.longDesc || p.desc || '';
  if (desc) {
    desc.textContent = longText;
  }

  // Pills de tecnologias
  if (chipsWrap) {
    chipsWrap.innerHTML = '';
    (p.stack || []).forEach(tech => {
      const span = document.createElement('span');
      span.className = 'proj-modal-chip';
      span.textContent = tech;
      chipsWrap.appendChild(span);
    });
  }
   
  // Botão GitHub
  if (btnRepo) {
    if (p.repo) {
      btnRepo.style.display = '';
      btnRepo.href = p.repo;
      const label = btnRepo.querySelector('.proj-modal-btn-label');
      if (label) label.textContent = ctas.repo;
    } 
  }

  // Botão View Site
  if (btnSite) {
    if (p.link) {
      btnSite.style.display = '';
      btnSite.href = p.link;
      const label = btnSite.querySelector('.proj-modal-btn-label');
      if (label) label.textContent = ctas.site;
    } else {
      btnSite.style.display = 'none';
    }
  }

  // Abre o <dialog>
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

/* Configura listeners básicos do modal (fechar etc.) */
(function setupProjectModal() {
  const els = getProjectModalElements();
  if (!els) return;
  const { dialog, btnClose } = els;

  // Botão "Close"
  if (btnClose) {
    btnClose.addEventListener('click', () => closeProjectModal());
  }

  // Fecha clicando no backdrop (clique direto no <dialog>)
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      closeProjectModal();
    }
  });

  // Fecha com ESC (o próprio dialog já fecha, mas garantimos estado)
  dialog.addEventListener('cancel', e => {
    e.preventDefault();
    closeProjectModal();
  });
})();

/* =========================================================
   RENDERIZAÇÃO DOS CARDS
   ========================================================= */

function renderProjects(lang) {
  const grid = document.getElementById('projGrid');
  if (!grid) return;

  const list = I18N[lang].projects.list;
  const ctas = I18N[lang].projects.ctas;

  grid.innerHTML = '';

  function card(p) {
    const el = document.createElement('article');
    el.className = 'proj-card';

    const chips = (p.stack || [])
      .map(s => `<span class="proj-chip">${s}</span>`)
      .join('');

    el.innerHTML = `
      <div class="proj-media">
        <img class="proj-cover" src="${p.cover}" alt="Cover image for ${p.title}">
        <div class="proj-overlay" aria-hidden="true">
          <span class="overlay__text">${ctas.viewMore}</span>
          <div class="overlay__filler"></div>
        </div>
      </div>

      <div class="proj-body">
        <h3 class="proj-title">${p.title}</h3>
        <p class="proj-desc">${p.desc || ''}</p>
        <div class="proj-meta">${chips}</div>
      </div>
    `;

    return el;
  }

  // Monta os cards
  list.forEach(p => grid.appendChild(card(p)));

  // Hover da capa (sheen + blur de fundo) + clique para abrir modal
  const cards = grid.querySelectorAll('.proj-card');

  cards.forEach((card, idx) => {
    const project = list[idx];

    const enter = () => {
      card.classList.remove('hover-out');
      card.classList.add('hover-in');
    };

    const leave = () => {
      card.classList.remove('hover-in');
      card.classList.add('hover-out');
    };

    card.addEventListener('mouseenter', enter);
    card.addEventListener('mouseleave', leave);

    // Touch
    let touchTimer = null;
    card.addEventListener('touchstart', () => {
      clearTimeout(touchTimer);
      enter();
      touchTimer = setTimeout(() => card.classList.remove('hover-in'), 900);
    });

    // Click abre modal
    card.addEventListener('click', e => {
      const link = e.target.closest('a.btn-link');
      if (link) return; // deixa links funcionarem
      openProjectModal(project);
    });
  });

  // Textos da seção
  const titleEl = document.querySelector('#projects .section-title');
  if (titleEl) titleEl.textContent = I18N[lang].projects.title;

  const subEl = document.querySelector('#projects .section-sub');
  if (subEl) subEl.textContent = I18N[lang].projects.sub;
}
