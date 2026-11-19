'use strict';

/* =========================================================
   SERVICES — REVEAL DE ENTRADA scroll-driven (Direction: cascata)
   Cada .svc-card "constroi" o proprio conteudo conforme sobe pra
   frente da pilha: icone, titulo, tag, descricao, cada chip e o CTA
   entram em cascata (fade + sobem uns px), presos ao scroll (scrub).
   O objetivo e legibilidade: a oferta se monta na frente do usuario.

   COEXISTENCIA (nao briga com nenhum dos dois sistemas ja existentes):
   · services-stack.js e dono do `transform`/`filter` do .svc-card
     (scale/blur da pilha) e da classe .is-top.
   · svc-hover.js e dono do `transform` do .svc-card__depth (tilt) e
     do translateZ de hover nas pecas (icone/tag/chips/CTA).
   Por isso o reveal SO anima `opacity` (autoAlpha) e a propriedade
   INDIVIDUAL `translate` (via a var --svc-rise, aplicada no CSS) — que
   SOMA ao `transform` de hover sem sobrescrever, igual ao padrao
   --rise-x do resto do site. Nunca escreve `transform` em elemento
   nenhum. Os chips fazem o fade pelo GRUPO (.svc-features) pra nao
   pisar no opacity .82/1 que o is-top/hover governa em cada <li>.

   Degrada (toque / reduced-motion / tela estreita / is-static da
   pilha): nao roda, remove a classe .svc-reveal e limpa o inline —
   conteudo 100% visivel. Reconstroi na troca de idioma (services.js
   reescreve o innerHTML de #servicesGrid) via MutationObserver.
   CSS par: bloco "SERVICES — REVEAL DE ENTRADA" no fim do style.css.
   ========================================================= */
(function () {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  const coarse = window.matchMedia('(pointer: coarse)');
  const narrow = window.matchMedia('(max-width: 820px)');   // mesmo corte da pilha

  const RISE = '16px';       // deslocamento discreto do reveal (premium, sutil)
  const CONTENT_SEL =
    '.svc-icon, .svc-title, .svc-tag, .svc-desc, .svc-features, .svc-features li, .svc-cta';

  let tweens = [];
  let rebuildTimer = 0;

  /* mesmas condicoes da pilha; le is-static/is-pile tambem. No modo pilha
     (CardSwap, .is-pile) o reveal de entrada NAO roda: cada card cicla pra
     frente pelo scroll e seu conteudo tem que estar 100% visivel (o front
     e legivel, os de tras so ficam menores pela perspectiva). Na pilha
     degradada (.is-static) idem: lista estatica, nada escondido. */
  function canReveal() {
    return !!(window.gsap && window.ScrollTrigger) &&
      !grid.classList.contains('is-static') &&
      !grid.classList.contains('is-pile');
  }

  function cards() {
    return Array.prototype.slice.call(grid.querySelectorAll('.svc-card'));
  }

  function killTweens() {
    tweens.forEach(t => { if (t && t.kill) t.kill(); });
    tweens = [];
  }

  /* limpa qualquer estado inline do reveal -> conteudo totalmente visivel */
  function clearReveal(list) {
    grid.classList.remove('svc-reveal');
    if (!window.gsap) return;
    list.forEach(card =>
      window.gsap.set(card.querySelectorAll(CONTENT_SEL),
        { clearProps: 'opacity,visibility,--svc-rise' }));
  }

  function build() {
    killTweens();
    const list = cards();
    clearReveal(list);

    if (!canReveal() || !list.length) return;   // degrada: tudo visivel

    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    grid.classList.add('svc-reveal');

    list.forEach(card => {
      const icon  = card.querySelector('.svc-icon');
      const title = card.querySelector('.svc-title');
      const tag   = card.querySelector('.svc-tag');
      const desc  = card.querySelector('.svc-desc');
      const feats = card.querySelector('.svc-features');
      const chips = card.querySelectorAll('.svc-features li');
      const cta   = card.querySelector('.svc-cta');

      /* timeline unica por card, presa ao scroll da ENTRADA do card
         (clamp: em tela alta o range encolhe pro scroll que existe e o
         reveal SEMPRE completa). A pilha cobre/recua o card bem depois,
         entao a cascata ja terminou quando ele vira topo. */
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: card,
          start: 'clamp(top 88%)',
          end: 'clamp(top 46%)',
          scrub: 0.5,
        },
      });

      /* fade (autoAlpha) + rise (--svc-rise -> translate individual) */
      const rise = (el, at, dur) => {
        if (!el) return;
        tl.fromTo(el,
          { autoAlpha: 0, '--svc-rise': RISE },
          { autoAlpha: 1, '--svc-rise': '0px', duration: dur || 0.5 }, at);
      };

      rise(icon, 0);
      rise(title, 0.06);
      rise(tag, 0.10);
      rise(desc, 0.16);

      /* chips: o GRUPO faz o fade (preserva o opacity .82/1 que o CSS
         is-top/hover governa em cada <li>); cada chip so DESLIZA
         (translate individual, stagger curto) — opacity do li fica
         com o CSS, transform do li fica com o hover. */
      if (feats) {
        tl.fromTo(feats, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.22);
        if (chips.length) {
          tl.fromTo(chips,
            { '--svc-rise': RISE },
            { '--svc-rise': '0px', duration: 0.4, stagger: 0.05 }, 0.22);
        }
      }

      rise(cta, 0.34, 0.45);

      tweens.push(tl);
    });

    ST.refresh();
  }

  /* debounce 200ms: um tico depois da pilha (180ms) pra ler o is-static
     ja atualizado na troca de idioma / mudanca de modo */
  const schedule = () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(build, 200);
  };

  /* rebuild na troca de idioma: services.js dispara 'svc:rendered' (evento
     explicito no lugar de MutationObserver, que reagiria ao .pin-spacer do
     ScrollTrigger da pilha) */
  document.addEventListener('svc:rendered', schedule);

  /* rebuild quando o modo muda (reduced-motion / toque / largura) */
  [narrow].forEach(mq => {
    if (mq.addEventListener) mq.addEventListener('change', schedule);
    else if (mq.addListener) mq.addListener(schedule);   // Safari antigo
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
