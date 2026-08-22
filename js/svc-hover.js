'use strict';

/* =========================================================
   SERVICES — TILT 3D SINCRONIZADO AO MOUSE (nao e GSAP)
   Esta camada e o "efeito 3D" que o card faz sob o ponteiro: em tempo
   real, seguindo o mouse (rAF continuo, NAO um tween). Escreve
   --svc-rx/--svc-ry no .svc-card sob o cursor; o .svc-card__depth
   (camada interna) le essas vars e inclina em rotateX/rotateY, entao o
   card SE INCLINA na direcao do ponteiro conforme voce mexe o mouse.
   O translateZ das pecas (icone/tag/chips/CTA) sobe por :hover no CSS
   (transition CSS, tambem nao-GSAP) e compoe com este tilt.

   DIVISAO DE MOTORES (nunca dois no mesmo elemento):
   · GSAP (services-stack.js) e dono do transform do .svc-card
     (a pilha CardSwap: x/y/z do slot). Aqui NAO tocamos nisso.
   · Este tilt escreve so CSS VARS no .svc-card e o transform vive no
     .svc-card__depth (outro elemento) -> compoe, nao briga.

   GUARD DE COORDENADA (importante): ao ROLAR, o browser dispara
   mousemove/pointermove com o cursor PARADO (a pagina e os cards se
   movem sob ele) e o Lenis emite scroll continuamente mesmo em repouso.
   Sem o mouse ANDAR de verdade (clientX/Y mudarem), o efeito 3D NAO
   ativa -- e isso que impede os cards de "ativar o efeito 3d sozinhos"
   no scroll. So o card da FRENTE (is-top) reage; os recuados ficam
   pointer-events:none. Throttle por rAF. Degrada no toque/reduced-motion.
   ========================================================= */
(function () {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  const MAX_DEG = 13;               // amplitude PRONUNCIADA do lean

  let raf = 0;
  let current = null;
  let px = 0;
  let py = 0;
  let lastX = null, lastY = null;   // ultima posicao REAL do cursor

  // card interativo: o front (is-top) durante a animacao OU qualquer card ja
  // jogado (is-out) no estado final -> o tilt/lift 3D vale em TODOS no fim.
  const isHot = c => !!c && (c.classList.contains('is-top') || c.classList.contains('is-out'));

  function apply() {
    raf = 0;
    if (!current) return;
    if (!isHot(current)) { reset(current); return; }
    const r = current.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const nx = (px - r.left) / r.width - 0.5;    // -0.5 .. 0.5
    const ny = (py - r.top) / r.height - 0.5;
    current.style.setProperty('--svc-rx', (nx * MAX_DEG * 2).toFixed(2) + 'deg');   // rotateY
    current.style.setProperty('--svc-ry', (-ny * MAX_DEG * 2).toFixed(2) + 'deg');  // rotateX
  }

  function reset(card) {
    if (!card) return;
    card.style.setProperty('--svc-rx', '0deg');
    card.style.setProperty('--svc-ry', '0deg');
    card.classList.remove('svc-hot');
  }

  function onMove(e) {
    // guard: mousemove induzido por scroll vem com o cursor PARADO -> ignora
    if (e.clientX === lastX && e.clientY === lastY) return;
    lastX = e.clientX; lastY = e.clientY;
    const card = e.target.closest('.svc-card');
    if (!card || !isHot(card)) {
      if (current) { reset(current); current = null; }
      return;
    }
    if (current && current !== card) reset(current);
    current = card;
    card.classList.add('svc-hot');   // dispara o lift 3D das pecas (CSS)
    px = e.clientX;
    py = e.clientY;
    if (!raf) raf = requestAnimationFrame(apply);
  }

  grid.addEventListener('pointermove', onMove, { passive: true });
  grid.addEventListener('mousemove', onMove, { passive: true });
  grid.addEventListener('mouseleave', function () {
    if (current) { reset(current); current = null; }
  }, { passive: true });
})();
