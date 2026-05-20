'use strict';

/* =========================================================
   POST-STATIC — JS leve para os posts pré-renderizados
   em /posts/<slug>.html (geração via scripts/build-posts.js).

   Responsabilidades:
   - Copy-link button
   - View counter local (localStorage) — só telemetria de UI
   - Lightbox da galeria (<dialog>) com setas/teclado
   - Reading progress bar (top da página)
   - Smooth fade-out ao sair pra outra página interna
   ========================================================= */

(function () {
  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Copy link ---------- */
  const copyBtn = document.getElementById('copyLinkBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = location.href;
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(ta);
      };
      const after = () => {
        const original = copyBtn.dataset.original || copyBtn.innerHTML;
        copyBtn.dataset.original = original;
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        copyBtn.classList.add('is-copied');
        setTimeout(() => {
          copyBtn.innerHTML = original;
          copyBtn.classList.remove('is-copied');
        }, 1400);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).then(after, () => { fallback(); after(); });
      } else { fallback(); after(); }
    });
  }

  /* ---------- View counter local (UI-only) ---------- */
  try {
    const STORAGE_VIEWS = 'bi_blog_views';
    const article = document.getElementById('postPage');
    const slug = article?.getAttribute('itemid')?.split('/').pop()?.replace('.html', '') || location.pathname.split('/').pop().replace('.html', '');
    if (slug) {
      const raw = localStorage.getItem(STORAGE_VIEWS);
      const views = raw ? JSON.parse(raw) : {};
      views[slug] = (views[slug] || 0) + 1;
      localStorage.setItem(STORAGE_VIEWS, JSON.stringify(views));
    }
  } catch {}

  /* ---------- Lightbox da galeria ---------- */
  const dialog = document.getElementById('postLightbox');
  if (dialog) {
    const imgEl   = document.getElementById('postLightboxImg');
    const capEl   = document.getElementById('postLightboxCaption');
    const galleries = document.querySelectorAll('[data-gallery]');
    const all = [];
    galleries.forEach(g => {
      g.querySelectorAll('img[data-gallery-index]').forEach(img => {
        all.push({
          src: img.currentSrc || img.src,
          alt: img.alt || '',
          caption: img.closest('figure')?.querySelector('figcaption')?.textContent || '',
        });
      });
    });

    let current = 0;
    const show = (i) => {
      if (!all.length) return;
      current = (i + all.length) % all.length;
      const item = all[current];
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      capEl.textContent = item.caption || '';
      capEl.style.display = item.caption ? '' : 'none';
    };

    galleries.forEach(g => {
      g.addEventListener('click', (e) => {
        const img = e.target.closest('img[data-gallery-index]');
        if (!img) return;
        e.preventDefault();
        const idx = Number(img.dataset.galleryIndex || 0);
        // Encontra o índice global dessa imagem em `all`
        const globalIdx = all.findIndex(x => x.src === (img.currentSrc || img.src));
        show(globalIdx >= 0 ? globalIdx : idx);
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      });
    });

    dialog.addEventListener('click', (e) => {
      if (e.target.matches('[data-lightbox-close]') || e.target.closest('[data-lightbox-close]')) {
        dialog.close?.() || dialog.removeAttribute('open');
      }
      if (e.target.matches('[data-lightbox-prev]') || e.target.closest('[data-lightbox-prev]')) show(current - 1);
      if (e.target.matches('[data-lightbox-next]') || e.target.closest('[data-lightbox-next]')) show(current + 1);
      // Click fora da imagem fecha
      if (e.target === dialog) dialog.close?.() || dialog.removeAttribute('open');
    });

    document.addEventListener('keydown', (e) => {
      if (!dialog.open) return;
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'Escape') dialog.close?.() || dialog.removeAttribute('open');
    });
  }

  /* ---------- Reading progress bar ---------- */
  const article = document.getElementById('postPage');
  if (article) {
    const bar = document.createElement('div');
    bar.className = 'post-progress-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    const update = () => {
      const rect = article.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const total = rect.height - window.innerHeight;
      const scrolled = Math.max(0, Math.min(1, (window.scrollY - top + 80) / Math.max(total, 1)));
      bar.style.transform = `scaleX(${scrolled})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- Fade-out ao sair pra outra página interna ----------
     Browser com View Transitions cross-document (Chrome/Edge 126+):
     NAO intercepta — navegacao normal + @view-transition nativo (CSS).
     Sem suporte (Firefox/Safari): mantem o fade JS. */
  const SUPPORTS_CROSS_DOC_VT =
    'startViewTransition' in document && 'onpagereveal' in window;
  if (!SUPPORTS_CROSS_DOC_VT)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (a.target === '_blank') return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => { location.href = url.href; }, 220);
    } catch {}
  });
})();
