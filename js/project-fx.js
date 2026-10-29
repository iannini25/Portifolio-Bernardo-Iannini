'use strict';

/* =========================================================
   PROJECT FX — interação da página de cada projeto (.cs-*).
   Vanilla, sem GSAP/Lenis: a página já chega completa do build
   (scripts/lib/case-render.js); aqui só entra o que precisa de JS.

   1. reveals      blocos sobem/aparecem ao entrar na tela
   2. tour         as telas reais (desktop + celular) rolam junto
                   com a página enquanto a seção fica presa
   3. passos       "como funciona" acende passo a passo, trilho enche
   4. galeria      abas Computador/Celular, setas e ampliação

   Tudo com transform/opacity e um único rAF por frame de scroll.
   ========================================================= */

(() => {
  const root = document.querySelector('.cs[data-pc-root]');
  if (!root) return;

  /* ---------- 1. reveals ---------- */
  const revealEls = root.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- 2. tour pelas telas ---------- */
  const tour = root.querySelector('[data-cs-tour]');
  if (tour) {
    const pans = [...tour.querySelectorAll('[data-cs-pan]')];
    let sizes = [];
    let active = false;
    let ticking = false;

    const measure = () => {
      sizes = pans.map(img => {
        const view = img.parentElement;
        return Math.max(0, img.offsetHeight - view.offsetHeight);
      });
    };
    const update = () => {
      ticking = false;
      const r = tour.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
      pans.forEach((img, i) => {
        img.style.transform = `translate3d(0, ${(-p * sizes[i]).toFixed(1)}px, 0)`;
      });
    };
    const onScroll = () => {
      if (!active || ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    pans.forEach(img => {
      if (img.complete) return;
      img.addEventListener('load', () => { measure(); update(); }, { once: true });
    });
    /* imagens lazy da seção começam a baixar um pouco antes dela chegar */
    const near = new IntersectionObserver(([en]) => {
      active = en.isIntersecting;
      if (active) {
        pans.forEach(img => { img.loading = 'eager'; });
        measure();
        update();
      }
    }, { rootMargin: '600px 0px' });
    near.observe(tour);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); update(); }, { passive: true });
  }

  /* ---------- 3. passos ---------- */
  const stepsEl = root.querySelector('[data-cs-steps]');
  if (stepsEl && 'IntersectionObserver' in window) {
    const steps = [...stepsEl.querySelectorAll('.cs-step')];
    let lit = -1;
    const light = (idx) => {
      if (idx <= lit) return;
      lit = idx;
      steps.forEach((s, i) => s.classList.toggle('is-on', i <= lit));
      stepsEl.style.setProperty('--cs-fill', steps.length > 1 ? (lit / (steps.length - 1)).toFixed(3) : 1);
    };
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) light(steps.indexOf(en.target));
      });
    }, { rootMargin: '0px 0px -30% 0px', threshold: 0.6 });
    steps.forEach(s => sio.observe(s));
  }

  /* ---------- 4. galeria ---------- */
  const gallery = root.querySelector('[data-cs-gallery]');
  if (gallery) {
    const tabs = [...gallery.querySelectorAll('[data-cs-tab]')];
    const panels = [...gallery.querySelectorAll('[data-cs-panel]')];

    const syncArrows = (panel) => {
      const track = panel.querySelector('[data-cs-track]');
      const prev = panel.querySelector('[data-cs-prev]');
      const next = panel.querySelector('[data-cs-next]');
      if (!track || !prev || !next) return;
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    };

    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
      panels.forEach(pn => { pn.hidden = pn.dataset.csPanel !== tab.dataset.csTab; });
      const shown = panels.find(pn => !pn.hidden);
      if (shown) syncArrows(shown);
    }));
    /* setas do teclado entre as abas (padrão WAI-ARIA tabs) */
    tabs.forEach((tab, i) => tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const to = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      to.focus();
      to.click();
    }));

    panels.forEach(panel => {
      const track = panel.querySelector('[data-cs-track]');
      if (!track) return;
      const step = () => Math.max(200, track.clientWidth * 0.8);
      panel.querySelector('[data-cs-prev]')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
      panel.querySelector('[data-cs-next]')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
      track.addEventListener('scroll', () => syncArrows(panel), { passive: true });
      syncArrows(panel);
    });

    /* ampliação: <dialog> nativo (Esc fecha, foco preso pelo browser) */
    const box = gallery.querySelector('[data-cs-lightbox]');
    const bigImg = box && box.querySelector('[data-cs-limg]');
    let list = [];
    let at = 0;
    const show = (i) => {
      if (!list.length) return;
      at = (i + list.length) % list.length;
      const btn = list[at];
      bigImg.src = btn.dataset.csZoom;
      bigImg.alt = (btn.querySelector('img') || {}).alt || '';
    };
    if (box && bigImg && typeof box.showModal === 'function') {
      gallery.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cs-zoom]');
        if (!btn) return;
        const panel = btn.closest('[data-cs-panel]');
        list = [...panel.querySelectorAll('[data-cs-zoom]')];
        show(list.indexOf(btn));
        box.showModal();
      });
      box.querySelector('[data-cs-close]').addEventListener('click', () => box.close());
      box.querySelector('[data-cs-lprev]').addEventListener('click', () => show(at - 1));
      box.querySelector('[data-cs-lnext]').addEventListener('click', () => show(at + 1));
      box.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') show(at + 1);
        if (e.key === 'ArrowLeft') show(at - 1);
      });
      /* clique no fundo escuro fecha */
      box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    } else if (box) {
      /* browser sem <dialog>: abre a imagem direto */
      gallery.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cs-zoom]');
        if (btn) window.open(btn.dataset.csZoom, '_blank', 'noopener');
      });
    }
  }
})();
