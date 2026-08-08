'use strict';

/* =========================================================
   PROJECT CASE — camada de motion (project.html)
   Separada de js/project-case.js (dados) porque carrega DEPOIS do
   CDN do GSAP/Lenis — mesma razão pela qual js/scrollfx.js é o
   último script no index.html. Progressive enhancement: sem GSAP
   ou com prefers-reduced-motion, a página fica 100% funcional e
   estática (project-case.js já populou tudo; o CSS mostra o fio
   cheio e os tópicos legíveis — estados "apagados" só sob .fx-on).

   O corpo do caso: vídeo sticky no topo + tópicos rolando embaixo.
   Aqui vive a coreografia: fio que se desenha, tópico ativo que
   acende (ícone com traço DrawSVG), URL viva digitando /#topico na
   barra da janela e contador 01/NN.
   ========================================================= */
(function () {
  const root = document.querySelector('[data-pc-root]');
  if (!root) return; // não estamos em project.html

  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const plugins = [ScrollTrigger];
  if (window.DrawSVGPlugin) plugins.push(window.DrawSVGPlugin);
  gsap.registerPlugin(...plugins);
  document.documentElement.classList.add('fx-on');

  /* SMOOTH-SCROLL (Lenis) — mesma receita do scrollfx.js: só desktop/
     mouse, lerp discreto no ticker do GSAP. */
  if (window.Lenis && !window.matchMedia('(pointer: coarse)').matches) {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, touchMultiplier: 0 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis-on');
    window.lenis = lenis;
  }

  /* ---- hero + ato do problema + janela: fade+sobe uma vez, sem scroll
     trigger. Conteúdo que nasce visível (ou perto da dobra) entra uma
     vez — scrub 'clamp' em página curta colapsa pra intervalo
     degenerado e trava opacity:0. O ato do problema fica logo sob o
     hero (pode estar parcialmente visível no load), então entra na
     MESMA leva one-shot — nunca scrub. */
  gsap.from(['.pc-reg', '.pc-hero__title', '.pc-hero__desc', '.pc-hero__cta'], {
    y: 16, autoAlpha: 0, duration: .6, stagger: .08, ease: 'power2.out',
  });
  const storySec = root.querySelector('[data-pc-story]');
  if (storySec && !storySec.hidden) {
    const parts = gsap.utils.toArray(storySec.querySelectorAll(
      '.pc-act__title, .pc-act__text > p, .pc-flow:not([hidden]), .pc-note__tag, .pc-note__body'));
    if (parts.length) {
      gsap.from(parts, { y: 14, autoAlpha: 0, duration: .55, stagger: .07, delay: .18, ease: 'power2.out' });
    }
    const wire = storySec.querySelector('.pc-note:not([hidden]) .pc-note__wire');
    if (wire) gsap.fromTo(wire, { scaleY: 0 }, { scaleY: 1, duration: .7, delay: .35, ease: 'power2.out' });
  }
  gsap.from('.pc-video__win', { y: 16, autoAlpha: 0, duration: .6, delay: .28, ease: 'power2.out' });

  /* ---- glow de cursor nas curvas do topo do hero — mesmo padrão do
     index (rastreio no documento, rect cacheado com refresh ao entrar,
     quickTo com leve inércia). Só pointer fino. ---- */
  const topo = document.querySelector('.pc-topo');
  if (topo && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let tRect = topo.getBoundingClientRect();
    const refreshTopo = () => { tRect = topo.getBoundingClientRect(); };
    window.addEventListener('scroll', refreshTopo, { passive: true });
    window.addEventListener('resize', refreshTopo, { passive: true });
    const gpos = { x: -600, y: -600 };
    const applyTopo = () => {
      topo.style.setProperty('--mx', gpos.x.toFixed(1) + 'px');
      topo.style.setProperty('--my', gpos.y.toFixed(1) + 'px');
    };
    const gqx = gsap.quickTo(gpos, 'x', { duration: .34, ease: 'power3', onUpdate: applyTopo });
    const gqy = gsap.quickTo(gpos, 'y', { duration: .34, ease: 'power3' });
    let topoPrimed = false, wasInside = false;
    const within = e => e.clientX >= tRect.left && e.clientX <= tRect.right &&
                        e.clientY >= tRect.top && e.clientY <= tRect.bottom;
    document.addEventListener('mousemove', e => {
      let inside = within(e);
      if (inside && !wasInside) { refreshTopo(); inside = within(e); }
      wasInside = inside;
      if (!inside) {
        if (topo.classList.contains('is-hot')) { topo.classList.remove('is-hot'); topoPrimed = false; }
        return;
      }
      const x = e.clientX - tRect.left, y = e.clientY - tRect.top;
      if (!topoPrimed) { topoPrimed = true; gpos.x = x; gpos.y = y; applyTopo(); }
      gqx(x); gqy(y);
      if (!topo.classList.contains('is-hot')) topo.classList.add('is-hot');
    }, { passive: true });
  }

  let dynamicKills = [];
  const killDynamic = () => {
    dynamicKills.forEach(t => { t.scrollTrigger?.kill?.(); t.kill?.(); });
    dynamicKills = [];
  };

  /* ---- URL viva: digita /#topico na barra da janela sticky ---- */
  let typeTween = null;
  let caretTimer = null;
  function typePath(str) {
    const el = root.querySelector('[data-pd-path]');
    const caret = root.querySelector('[data-pd-caret]');
    if (!el) return;
    if (typeTween) typeTween.kill();
    clearTimeout(caretTimer);
    caret?.classList.add('is-on');
    const obj = { n: 0 };
    /* one-shot: se auto-completa e a var typeTween já mata o anterior —
       empurrar em dynamicKills só acumularia lixo a cada ativação */
    typeTween = gsap.to(obj, {
      n: str.length,
      duration: Math.min(.05 * str.length, .75),
      ease: 'none',
      onUpdate: () => { el.textContent = str.slice(0, Math.round(obj.n)); },
      onComplete: () => { caretTimer = setTimeout(() => caret?.classList.remove('is-on'), 1100); },
    });
  }

  /* ---- a JANELA QUE NAVEGA: shot da tela do tópico ativo em crossfade
     sobre a capa, entrando em duotone verde e assentando em cor.
     Regra "vídeo manda": com vídeo cadastrado, shots são ignorados.
     Cortado em pointer grosso (custo de GPU do filter em área grande).
     GSAP anima SÓ a opacity do box; duotone→cor é classe + CSS. ---- */
  const shotbox = root.querySelector('[data-pc-shotbox]');
  const shotImg = root.querySelector('[data-pc-shot]');
  const caseVideo = root.querySelector('[data-pc-video]');
  const shotsOn = !!(shotbox && shotImg && caseVideo && caseVideo.hidden) &&
    !window.matchMedia('(pointer: coarse)').matches;
  let shotTween = null, shotTimer = null;
  function setShot(src) {
    if (!shotsOn) return;
    if (shotTween) shotTween.kill();
    clearTimeout(shotTimer);
    if (!src) {
      shotTween = gsap.to(shotbox, { autoAlpha: 0, duration: .35, ease: 'power2.out' });
      return;
    }
    shotbox.hidden = false;
    if (shotImg.getAttribute('src') === src) {
      shotTween = gsap.to(shotbox, { autoAlpha: 1, duration: .45, ease: 'power2.out' });
      if (!shotbox.classList.contains('is-color')) {
        shotTimer = setTimeout(() => shotbox.classList.add('is-color'), 160);
      }
      return;
    }
    /* troca de tela: recolhe rápido, troca o src, entra em duotone
       e assenta em cor (a transição de filter é 100% CSS) */
    shotbox.classList.remove('is-color');
    shotTween = gsap.to(shotbox, {
      autoAlpha: 0, duration: .18, ease: 'power1.out',
      onComplete: () => {
        shotImg.setAttribute('src', src);
        shotTween = gsap.to(shotbox, { autoAlpha: 1, duration: .45, ease: 'power2.out' });
        shotTimer = setTimeout(() => shotbox.classList.add('is-color'), 220);
      },
    });
  }

  /* traço do ícone se desenha na PRIMEIRA ativação (DrawSVG) —
     one-shot, sem entrar em dynamicKills (se auto-completa) */
  function drawIcon(item) {
    if (!window.DrawSVGPlugin || item.dataset.drawn) return;
    item.dataset.drawn = '1';
    const strokes = [...item.querySelectorAll('.pd-topic__icon svg *')]
      .filter(el => el.getAttribute('stroke'));
    if (!strokes.length) return;
    gsap.from(strokes, {
      drawSVG: '0%', duration: .55, ease: 'power2.out', stagger: .07,
    });
  }

  function buildReveals() {
    const items = gsap.utils.toArray('.pd-topic');
    const stepEl = root.querySelector('[data-pd-step]');

    /* chegada de cada tópico (scrub curto — sempre abaixo da dobra
       porque o vídeo sticky ocupa o topo da viewport). O reveal anima
       os FILHOS: a opacity do .pd-topic pertence à classe is-active
       (ativo aceso / recuados) — GSAP escrevendo opacity inline no
       container matava esse estado pra sempre (dois motores na mesma
       propriedade). */
    items.forEach(el => {
      const parts = [el.querySelector('.pd-topic__icon'), el.querySelector('.pd-topic__body')]
        .filter(Boolean);
      if (!parts.length) return;
      dynamicKills.push(gsap.fromTo(parts,
        { y: 26, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'clamp(top 96%)', end: 'clamp(top 76%)', scrub: .5 },
        }));
    });

    /* fio do rail se desenha junto do scroll (contínuo → ease none) */
    const wire = root.querySelector('[data-pd-wire]');
    const rail = root.querySelector('.pd-rail');
    if (wire && rail) {
      dynamicKills.push(gsap.fromTo(wire,
        { scaleY: 0 },
        {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: rail, start: 'clamp(top 88%)', end: 'clamp(bottom 62%)', scrub: .5 },
        }));
    }

    /* preload dos shots (senão o primeiro crossfade pisca) */
    if (shotsOn) {
      items.forEach(el => {
        if (el.dataset.shot) { const im = new Image(); im.src = el.dataset.shot; }
      });
    }

    /* ativação: um tópico por vez acende; a URL viva digita o path
       (REAL — /admin/cases — quando cadastrado; /#slug no fallback),
       o contador avança e a janela navega pra tela do tópico.
       onLeaveBack devolve pro anterior. */
    let activeIdx = -1;
    const typeTopicPath = item => {
      const p = (item && item.dataset.path) || '';
      typePath(p.startsWith('/') ? p : '/#' + p);
    };
    const setActive = i => {
      if (i === activeIdx || !items.length) return;
      activeIdx = i;
      items.forEach((x, j) => x.classList.toggle('is-active', j === i));
      const item = items[i];
      if (!item) return;
      typeTopicPath(item);
      if (stepEl) {
        stepEl.textContent =
          `${String(i + 1).padStart(2, '0')}/${String(items.length).padStart(2, '0')}`;
      }
      /* só desenha o traço se o ícone está EM CENA — o setActive inicial
         (posição real do scroll) pode ativar um tópico fora da viewport
         e o desenho rodaria invisível, gastando a estreia do efeito */
      if (ScrollTrigger.isInViewport(item)) drawIcon(item);
      setShot(item.dataset.shot || '');
    };
    const topicSts = items.map((item, i) => {
      const st = ScrollTrigger.create({
        trigger: item,
        start: 'clamp(top 78%)',
        onEnter: () => setActive(i),
        onLeaveBack: () => setActive(Math.max(0, i - 1)),
      });
      dynamicKills.push(st);
      return st;
    });
    /* estado inicial pela POSIÇÃO REAL do scroll (não 0 cego): no
       re-render de idioma no meio da página, triggers recriados com o
       scroll já além do start nunca disparam onEnter (não há
       cruzamento) — sem isto o ativo resetava pro tópico 1 e TRAVAVA.
       st.start já resolve o clamp(), então a regra é idêntica à do
       trigger. */
    if (items.length) {
      let startIdx = 0;
      topicSts.forEach((st, i) => { if (st.scroll() >= st.start) startIdx = i; });
      setActive(startIdx);
    }

    /* ato "o que isso mudou" digita /#impacto na URL viva (a janela
       sticky ainda está/esteve em cena). Trigger SEPARADO dos tópicos:
       o contador 01/NN conta SÓ tópicos. Ao voltar, redigita o path
       do tópico ativo. */
    const impactSec = root.querySelector('[data-pc-impact]');
    if (impactSec && !impactSec.hidden) {
      dynamicKills.push(ScrollTrigger.create({
        trigger: impactSec,
        start: 'clamp(top 78%)',
        onEnter: () => typePath('/#' + (impactSec.dataset.path || 'impacto')),
        onLeaveBack: () => typeTopicPath(items[activeIdx]),
      }));
    }

    /* atos de baixo da página (impacto, ficha, assinatura) — sempre
       abaixo da dobra (vêm depois do corpo do caso): reveal scrub dos
       FILHOS no padrão dos tópicos. O ato do problema NÃO entra aqui
       (one-shot no load — vive perto da dobra). */
    const lateReveal = sec => {
      if (!sec || sec.hidden) return;
      const parts = gsap.utils.toArray(sec.querySelectorAll(
        '.pc-act__title, .pc-act__lead:not([hidden]), .pc-metric, ' +
        '.pc-specs__cmd, .pc-specs__row, .pc-sign__line, .pc-sign__cta'));
      if (parts.length) {
        dynamicKills.push(gsap.fromTo(parts,
          { y: 14, autoAlpha: 0 },
          {
            y: 0, autoAlpha: 1, ease: 'power2.out', stagger: .06,
            scrollTrigger: { trigger: sec, start: 'clamp(top 92%)', end: 'clamp(top 70%)', scrub: .5 },
          }));
      }
      const note = sec.querySelector('.pc-note:not([hidden])');
      if (note) {
        const wire = note.querySelector('.pc-note__wire');
        if (wire) {
          dynamicKills.push(gsap.fromTo(wire, { scaleY: 0 }, {
            scaleY: 1, ease: 'none',
            scrollTrigger: { trigger: note, start: 'clamp(top 92%)', end: 'clamp(top 74%)', scrub: .5 },
          }));
        }
        const bits = gsap.utils.toArray(note.querySelectorAll('.pc-note__tag, .pc-note__body'));
        if (bits.length) {
          dynamicKills.push(gsap.fromTo(bits, { autoAlpha: 0 }, {
            autoAlpha: 1, ease: 'power2.out', stagger: .08,
            scrollTrigger: { trigger: note, start: 'clamp(top 90%)', end: 'clamp(top 72%)', scrub: .5 },
          }));
        }
      }
    };
    lateReveal(impactSec);
    lateReveal(root.querySelector('[data-pc-specs]'));
    lateReveal(root.querySelector('.pc-sign'));

    const next = root.querySelector('.pc-next__link');
    if (next) {
      dynamicKills.push(gsap.fromTo(next,
        { y: 22, autoAlpha: 0 },
        {
          y: 0, autoAlpha: 1, ease: 'power2.out',
          scrollTrigger: { trigger: next, start: 'clamp(top 95%)', end: 'clamp(top 75%)', scrub: .5 },
        }));
    }

    /* vídeo (quando existir) pausa fora do corpo do caso */
    const video = root.querySelector('[data-pc-video]');
    const body = root.querySelector('.pd-body');
    if (video && !video.hidden && body) {
      /* na página do case o scroll do site roda AINDA mais lento que no card */
      const CASE_RATE = 0.5;   // fonte 60fps x 0.5 = 30fps efetivos, igual aos cards
      video.playbackRate = CASE_RATE;
      video.addEventListener('loadedmetadata', () => { video.playbackRate = CASE_RATE; });
      dynamicKills.push(ScrollTrigger.create({
        trigger: body,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: self => {
          if (self.isActive) { video.playbackRate = CASE_RATE; video.play?.().catch(() => {}); }
          else video.pause?.();
        },
      }));
    }
  }

  buildReveals();
  ScrollTrigger.sort();

  /* ---- DOCK do vídeo (só desktop): a janela entra CENTRALIZADA, subindo
     de baixo da tela, e "atraca" na coluna da direita conforme rola —
     depois o sticky do CSS a segura à direita enquanto os tópicos sobem
     à esquerda; no fim do corpo ela solta e a página segue normal.
     O deslocamento centro→direita é function-based + invalidateOnRefresh
     pra recomputar o delta a cada resize. matchMedia limpa tudo e zera o
     transform quando cai pro mobile (lá a janela é inline, sem dock). */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const win = root.querySelector('.pc-video__win');
    const stage = root.querySelector('.pd-stage');
    const body = root.querySelector('.pd-body');
    if (!win || !stage || !body) return;
    /* delta horizontal: do centro do conteúdo (.pd-body) até o centro da
       coluna direita (.pd-stage). Medidos SEM transform-x (só a janela é
       transladada), então o rect é estável. */
    /* delta horizontal: centro do conteúdo (.pd-body) -> centro da coluna
       direita (.pd-stage). Medidos SEM transform-x (só a janela translada). */
    const dockDelta = () => {
      const b = body.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      return (b.left + b.width / 2) - (s.left + s.width / 2);
    };
    /* DOCK por POSIÇÃO VIVA (robusto). Lê o topo do .pd-body a cada tick:
         bt >= 0  (aproximando / estacionando no topo) -> p=0 -> a janela
                  fica CENTRALIZADA e ampliada (entra de baixo centralizada);
         bt <  0  (rolando além do topo) -> p sobe até 1 em ~32% da tela ->
                  ATRACA na coluna direita, tamanho normal.
       Como usa a posição REAL do frame (não um start cacheado do
       ScrollTrigger), é imune ao reflow async do conteúdo/fontes — o vídeo
       nunca "atraca cedo". O dock termina bem antes dos tópicos subirem
       (eles começam 120vh abaixo), então nunca cobre o texto. */
    /* curva bezier suave (easeOut): a janela sai do centro com fluidez e
       DESACELERA ao encaixar na direita — assentamento limpo/premium.
       DOCK maior (50% da tela) = leva mais scroll pra atracar => mais lenta
       e gradual. O easeOut ainda tira a janela do centro cedo, então os
       tópicos (120vh abaixo) nunca são cobertos. */
    const dockEase = gsap.parseEase('power2.out');
    const applyDock = () => {
      const bt = body.getBoundingClientRect().top;
      const vh = Math.max(1, window.innerHeight);
      /* DOIS tempos (curva bezier easeOut nos dois):
         - x desliza pra direita MAIS CEDO (limpa o centro rápido -> o
           texto/progresso pode aparecer antes, sem sobreposição);
         - scale ENCOLHE devagar (assentamento limpo/premium, "mais lenta"). */
      const px = bt >= 0 ? 0 : dockEase(Math.min(1, -bt / (vh * 0.30)));
      const ps = bt >= 0 ? 0 : dockEase(Math.min(1, -bt / (vh * 0.58)));
      gsap.set(win, { x: dockDelta() * (1 - px), scale: 1 + 0.18 * (1 - ps) });
    };
    const st = ScrollTrigger.create({
      trigger: body, start: 'top bottom', end: 'bottom top',
      onUpdate: applyDock, onRefresh: applyDock,
    });
    applyDock();
    return () => {
      st.kill();
      gsap.set(win, { clearProps: 'transform' });
    };
  });

  /* REFRESH robusto do ScrollTrigger: o corpo do caso é populado async
     (project-case.js) e as FONTES carregam depois — sem recalcular quando
     o layout assenta, o start do dock congela numa posição antiga e o
     vídeo "atraca" cedo demais (ainda na aproximação, antes de aparecer
     centralizado). Recalcula ao terminar as fontes e no load. */
  /* O start do dock é uma posição ABSOLUTA (topo do .pd-body), que depende
     da altura de tudo acima (hero+problema). Esse conteúdo é populado
     async (renderProjectCase) e as FONTES reflowam depois — se o layout
     muda e o start não é recalculado, o vídeo atraca cedo (antes de
     aparecer centralizado na dobra). Um ResizeObserver re-mede a CADA
     reflow real (debounce por rAF, sem laço: transform não muda layout),
     então o start está sempre correto independe de timing. */
  let refreshRaf = null;
  const refreshSoon = () => {
    if (refreshRaf) return;
    refreshRaf = requestAnimationFrame(() => { refreshRaf = null; ScrollTrigger.refresh(); });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshSoon);
  window.addEventListener('load', refreshSoon);
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(refreshSoon);
    ro.observe(root);
  }

  /* troca de idioma reconstrói os tópicos (innerHTML novo) — os
     ScrollTriggers antigos ficam órfãos e precisam ser refeitos.
     O ato do problema é ONE-SHOT de load: seus nós novos nascem sem
     estilos inline (visíveis), mas o fio da nota é pré-recolhido pelo
     CSS .fx-on — sem re-animar, precisa assentar cheio na mão. */
  document.addEventListener('pc:rendered', () => {
    killDynamic();
    const storyWire = root.querySelector('[data-pc-story] .pc-note:not([hidden]) .pc-note__wire');
    if (storyWire) gsap.set(storyWire, { scaleY: 1 });
    buildReveals();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
})();
