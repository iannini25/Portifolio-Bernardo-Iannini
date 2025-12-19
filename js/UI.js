'use strict';

/* =========================================================
   GLOBAL / UTIL & SCROLL
   ========================================================= */

/* ===== Scroll suave com compensação ===== */
const header = document.querySelector('header');
const offset = () => (header?.getBoundingClientRect().height || 0) + 10;

document.querySelectorAll('a[data-scroll]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset();
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});



/* =========================================================
   MENU MOBILE
   ========================================================= */
(function () {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileNav');
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.add('open');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    menu.classList.remove('open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  document.addEventListener('click', e => {
    if (menu.classList.contains('open') &&
      !menu.contains(e.target) &&
      !btn.contains(e.target)) {
      close();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });

  menu.querySelectorAll('a[data-scroll]').forEach(a => {
    a.addEventListener('click', () => close());
  });
})();

/* =========================================================
   RESUME BUTTON ATTENTION
   ========================================================= */
(function () {
  const r = document.querySelector('.resume-btn');
  if (r && window.matchMedia('(min-width: 901px)').matches) {
    r.classList.add('resume-attn');
  }
})();

/* =========================================================
   INIT
   ========================================================= */
function init() {
  applyI18n(LANG);
  if (typeof cycleTaglines === 'function') {
    cycleTaglines();
  }
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
