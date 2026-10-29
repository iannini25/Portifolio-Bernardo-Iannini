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

  }
  /* ---------- 5. ampliação: uma só pra página toda ----------
     Qualquer [data-cs-zoom] abre no <dialog> nativo (Esc fecha, foco
     preso pelo browser). As setas passeiam pelas imagens do mesmo grupo
     (painel da galeria, telas de um app, peças de marketing). */
  const box = root.querySelector('[data-cs-lightbox]');
  const bigImg = box && box.querySelector('[data-cs-limg]');
  if (box && bigImg) {
    let list = [];
    let at = 0;
    const show = (i) => {
      if (!list.length) return;
      at = (i + list.length) % list.length;
      bigImg.src = list[at].dataset.csZoom;
      bigImg.alt = (list[at].querySelector('img') || {}).alt || '';
    };
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cs-zoom]');
      if (!btn) return;
      if (typeof box.showModal !== 'function') { window.open(btn.dataset.csZoom, '_blank', 'noopener'); return; }
      const group = btn.closest('[data-cs-panel], .cs-app__screens, .cs-mkt__grid') || root;
      list = [...group.querySelectorAll('[data-cs-zoom]')];
      show(list.indexOf(btn));
      if (!box.open) box.showModal();
    });
    box.querySelector('[data-cs-close]').addEventListener('click', () => box.close());
    box.querySelector('[data-cs-lprev]').addEventListener('click', () => show(at - 1));
    box.querySelector('[data-cs-lnext]').addEventListener('click', () => show(at + 1));
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(at + 1);
      if (e.key === 'ArrowLeft') show(at - 1);
    });
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  }

  /* ---------- 6. o site ao vivo ----------
     O próprio site do projeto dentro das janelas, renderizado na largura
     real (1440 no computador, 390 no celular) e reduzido por transform
     pra caber. Só carrega quando a seção chega perto da tela. */
  const live = root.querySelector('[data-cs-live]');
  if (live) {
    const vps = [...live.querySelectorAll('[data-cs-vp]')]
      .filter(vp => vp.offsetParent !== null);          // no celular a janela de PC some
    const fit = () => vps.forEach(vp => {
      const frame = vp.querySelector('iframe');
      const w = Number(vp.dataset.csVp);
      const k = vp.clientWidth / w;
      frame.style.width = w + 'px';
      frame.style.height = Math.ceil(vp.clientHeight / k) + 'px';
      frame.style.transform = `scale(${k})`;
    });
    const load = () => vps.forEach(vp => {
      const frame = vp.querySelector('iframe');
      if (frame.src) return;
      frame.addEventListener('load', () => vp.classList.add('is-ready'), { once: true });
      frame.src = frame.dataset.src;
    });
    fit();
    window.addEventListener('resize', fit, { passive: true });
    if ('IntersectionObserver' in window) {
      const lio = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        load();
        lio.disconnect();
      }, { rootMargin: '500px 0px' });
      lio.observe(live);
    } else {
      load();
    }
  }
})();
