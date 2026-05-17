'use strict';

/* =========================================================
   BLOG NAV — Menu mobile + dropdown (versão enxuta do UI.js)
   ========================================================= */

/* Menu mobile */
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

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });

  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => close());
  });
})();

/* Work dropdown — desktop */
(function () {
  const btn = document.getElementById('workBtn');
  const menu = document.getElementById('workMenu');
  if (!btn || !menu) return;

  const positionMenu = () => {
    const r = btn.getBoundingClientRect();
    menu.style.top = `${r.bottom + 12}px`;
    menu.style.left = `${r.left + r.width / 2}px`;
  };

  const close = () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    window.removeEventListener('scroll', positionMenu, true);
    window.removeEventListener('resize', positionMenu);
  };

  const open = () => {
    if (menu.parentNode !== document.body) document.body.appendChild(menu);
    positionMenu();
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    window.addEventListener('scroll', positionMenu, true);
    window.addEventListener('resize', positionMenu);
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => close());
  });
})();

/* Work dropdown — mobile */
(function () {
  const btn = document.querySelector('.mobile-dd-btn');
  const menu = document.querySelector('.mobile-dd-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();
