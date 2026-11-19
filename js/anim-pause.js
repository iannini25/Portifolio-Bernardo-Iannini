'use strict';

/* =========================================================
   ANIM PAUSE — so anima o que esta na tela.

   A home tem dezenas de animacoes CSS em loop (cursor do terminal,
   brilhos, pontinhos da timeline, botao girando...). Fora da tela elas
   continuavam rodando e o browser redesenhava a cada frame. Aqui cada
   secao fora da viewport ganha .is-off e o CSS pausa as animacoes dela.
   ========================================================= */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => en.target.classList.toggle('is-off', !en.isIntersecting));
  }, { rootMargin: '150px 0px' });
  document.querySelectorAll('main > section, main > div, .experience-bg-wrap > section, footer')
    .forEach(el => io.observe(el));
})();
