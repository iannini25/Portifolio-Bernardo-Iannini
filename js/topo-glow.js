'use strict';

/* =========================================================
   TOPO GLOW — as curvas de nível acendem em volta do cursor.

   Versão leve: uma LENTE circular (260px) segue o mouse; dentro dela
   vive uma cópia acesa das mesmas curvas, contra-deslocada pra casar
   com o mapa de fundo. Só dois transforms mudam por frame (lente vai,
   miolo volta): o browser move camadas já rasterizadas, sem repintar
   nada. A versão antiga movia uma máscara + drop-shadow sobre o SVG
   da seção inteira e repintava tudo a cada movimento.

   Só em pointer fino (mouse); some ao sair da área.
   ========================================================= */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const tops = document.querySelectorAll('.pj-topo');
  if (!tops.length) return;

  const R = 130; // raio da lente
  const SVG_NS = 'http://www.w3.org/2000/svg';

  tops.forEach(topo => {
    const base = topo.querySelector('.pj-topo__layer');
    if (!base) return;

    const lens = document.createElement('div');
    lens.className = 'pj-topo__lens';
    const inner = document.createElement('div');
    inner.className = 'pj-topo__lensin';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'pj-topo__glowsvg');
    svg.setAttribute('viewBox', base.getAttribute('viewBox'));
    svg.setAttribute('preserveAspectRatio', base.getAttribute('preserveAspectRatio') || 'xMidYMid slice');
    /* halo largo e tênue + traço fino: "glow" sem filter */
    ['pj-topo__halo', 'pj-topo__glow'].forEach(cls => {
      const use = document.createElementNS(SVG_NS, 'use');
      use.setAttribute('href', '#topoLines');
      use.setAttribute('class', cls);
      svg.appendChild(use);
    });
    inner.appendChild(svg);
    lens.appendChild(inner);
    topo.appendChild(lens);

    let rect = null;
    const measure = () => {
      rect = topo.getBoundingClientRect();
      inner.style.width = rect.width + 'px';
      inner.style.height = rect.height + 'px';
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('scroll', () => { rect = null; }, { passive: true });

    /* posição suavizada (lerp) só enquanto há movimento */
    let tx = -999, ty = -999, x = -999, y = -999, raf = 0, on = false;
    const frame = () => {
      x += (tx - x) * 0.28;
      y += (ty - y) * 0.28;
      const lx = x - R, ly = y - R;
      lens.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
      inner.style.transform = `translate3d(${(-lx).toFixed(1)}px, ${(-ly).toFixed(1)}px, 0)`;
      raf = (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? requestAnimationFrame(frame) : 0;
    };

    document.addEventListener('mousemove', e => {
      if (!rect) rect = topo.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) {
        if (on) { on = false; lens.classList.remove('is-on'); }
        return;
      }
      tx = e.clientX - rect.left;
      ty = e.clientY - rect.top;
      if (!on) { on = true; x = tx; y = ty; lens.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });
  });
})();
