'use strict';

/* =========================================================
   SCROLL FX — camada artística scroll-driven (GSAP + ScrollTrigger
   + DrawSVG)

   · HERO     — fade-in de chegada (só opacidade) + paralaxe de
                ponteiro e saída em camadas no scroll.
   · O TIPO   — títulos se compõem letra a letra; marquee duo
                "Open to Work" roda em loop infinito (sentidos
                opostos) e ACELERA com o scroll, decaindo de volta.
   · A LINHA  — fios glow (SVG) que se desenham com o scroll: o do
                About termina no centro, onde o de Services começa,
                que por sua vez entrega na espinha da timeline.
   · SERVICES — grid limpo: cards sobem em cascata presa ao scroll
                enquanto os ícones se DESENHAM em sincronia (DrawSVG);
                spotlight segue o mouse dentro do card.
   · PROFUNDIDADE — paralaxe nas capas da showcase, aurora, hero.
   · O MOUSE  — botões magnéticos e paralaxe de ponteiro no hero.

   Progressive enhancement: sem GSAP ou com prefers-reduced-motion
   nada disso roda e o site fica no design estático de sempre.
   CSS par: bloco "SCROLL FX (GSAP)" no fim do style.css.
   ========================================================= */

(() => {

  /* tweens/triggers de DOM re-renderizável (i18n, troca de track) —
     mortos e recriados a cada rebuild */
  let dynamicKills = [];
  let rebuildTimer = null;
  let muted = false; // ignora mutations causadas pelo próprio rebuild

  const hasPointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasDraw = () => !!window.DrawSVGPlugin;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* títulos que ganham composição letra a letra (re-split a cada i18n) */
  const SPLIT_TITLES =
    '.about-title__line, .services-section .section-title, ' +
    '.skills-tiles .section-title, .xp-title, .ps-title, .contact-hero__line';

  /* ============================================================
     O TIPO — split de título em letras (idempotente)
     ============================================================ */
  function splitTitle(el) {
    const existing = el.querySelectorAll('.chx');
    if (existing.length) return [...existing];

    const text = el.textContent;
    if (!text.trim()) return [];
    el.setAttribute('aria-label', text.trim());

    /* cada PALAVRA vira um grupo atômico (.chw, nowrap) — senão o
       browser quebra linha entre os inline-blocks das letras e parte
       palavras ao meio em telas estreitas */
    const wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    text.split(/(\s+)/).forEach(tok => {
      if (!tok) return;
      if (!tok.trim()) { wrap.appendChild(document.createTextNode(tok)); return; }
      const word = document.createElement('span');
      word.className = 'chw';
      for (const ch of tok) {
        const c = document.createElement('span');
        c.className = 'chx';
        c.textContent = ch;
        word.appendChild(c);
      }
      wrap.appendChild(word);
    });
    el.textContent = '';
    el.appendChild(wrap);
    return [...el.querySelectorAll('.chx')];
  }

  function buildTitles() {
    document.querySelectorAll(SPLIT_TITLES).forEach(el => {
      const chars = splitTitle(el);
      if (!chars.length) return;
      dynamicKills.push(gsap.fromTo(chars,
        { yPercent: 85, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          ease: 'none',
          stagger: .04,
          /* clamp(): em telas altas a ultima section nao tem scroll
             suficiente — o range encolhe pro que existe e o reveal
             SEMPRE completa */
          scrollTrigger: { trigger: el, start: 'clamp(top 94%)', end: 'clamp(top 55%)', scrub: .5 },
        }));
    });
  }

  /* ============================================================
     RISE — entrada em cascata presa ao scroll.
     Hoveráveis sobem via --rise-x/--rise-y/--rise-s (translate/scale
     independentes, ver CSS): o :hover do stylesheet segue intacto.
     ============================================================ */
  function riseVars(items, opts = {}) {
    if (!items.length) return;
    dynamicKills.push(gsap.fromTo(items,
      { '--rise-x': (opts.x || '0px'), '--rise-y': (opts.y ?? '48px'), autoAlpha: 0 },
      {
        '--rise-x': '0px',
        '--rise-y': '0px',
        autoAlpha: 1,
        ease: 'none',
        stagger: opts.stagger ?? .12,
        scrollTrigger: {
          trigger: opts.trigger || items[0],
          start: `clamp(${opts.start || 'top 92%'})`,
          end: `clamp(${opts.end || 'top 50%'})`,
          scrub: .5,
        },
      }));
  }

  /* não-hoveráveis (parágrafos, kickers) podem usar transform direto */
  function riseSoft(targets) {
    gsap.utils.toArray(targets).forEach(el => {
      dynamicKills.push(gsap.fromTo(el,
        { y: 26, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'clamp(top 95%)', end: 'clamp(top 66%)', scrub: .5 },
        }));
    });
  }

  /* ============================================================
     FIOS GLOW — SVG que se desenha com o scroll (DrawSVG)
     ============================================================ */
  function makeWire(host, viewBox, d, extraClass) {
    let svg = host.querySelector(`.glow-wire${extraClass ? '.' + extraClass : ''}`);
    if (svg) return svg.querySelector('path');
    svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', `glow-wire${extraClass ? ' ' + extraClass : ''}`);
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    host.prepend(svg);
    return path;
  }

  function buildWires() {
    if (!hasDraw()) return;

    /* About: fio ondulado que nasce na esquerda e TERMINA no centro
       inferior — chegada VERTICAL em x=50, exatamente onde o fio de
       Services nasce. O draw termina quando a borda about/services
       cruza os 70% do viewport... */
    const about = document.querySelector('#sobre');
    if (about) {
      about.classList.add('wire-host');
      /* o ULTIMO trecho (y ~850 -> 1012) e perfeitamente vertical em
         x=50: a emenda com Services vira uma reta continua, sem "X" */
      const path = makeWire(about, '0 0 100 1000',
        'M7,-10 C2,140 15,240 8,400 C3,540 14,640 26,740 C40,830 50,850 50,1012',
        'glow-wire--about');
      gsap.fromTo(path, { drawSVG: '0% 0%' }, {
        drawSVG: '0% 100%',
        ease: 'none',
        scrollTrigger: { trigger: about, start: 'top 80%', end: 'bottom 70%', scrub: .6 },
      });
    }

    /* ...e o de Services COMEÇA nesse mesmo instante (start na mesma
       linha de 70% — a borda é compartilhada), saindo VERTICAL do
       centro: emenda contínua, sem quina nem buraco. */
    const services = document.querySelector('#services');
    if (services) {
      /* entra RETO no centro (y -12 -> 170 vertical), serpenteia pelos
         cards e sai RETO de novo (y 920 -> 1012 vertical) pro fio da
         Experience — emendas em linha reta nas duas pontas */
      const path = makeWire(services, '0 0 1000 1000',
        'M500,-12 C500,90 500,140 480,210 C440,330 300,330 280,430 ' +
        'C262,520 700,470 740,570 C770,650 560,680 520,790 ' +
        'C504,840 500,880 500,1012',
        'glow-wire--svc');
      gsap.fromTo(path, { drawSVG: '0% 0%' }, {
        drawSVG: '0% 100%',
        ease: 'none',
        scrollTrigger: { trigger: services, start: 'top 70%', end: 'bottom 45%', scrub: .6 },
      });
    }

    /* Na Experience NÃO há fio fixo: o de Services morre no topo da
       section, e o vão até a espinha da timeline é atravessado por um
       PULSO-laser one-shot (buildPulse) quando a espinha vai nascer. */
  }

  /* ============================================================
     PULSO-LASER — quando a espinha da timeline vai começar a
     desenhar, um sinal curto cai do topo da Experience até o
     início da linha ("tum") e some — sem linha fixa no meio.
     ============================================================ */
  function buildPulse() {
    if (!window.matchMedia('(min-width: 1025px)').matches) return;
    const xp = document.querySelector('#xp');
    const line = document.querySelector('.work-timeline .tl-line');
    if (!xp || !line) return;

    xp.classList.add('wire-host');
    let pulse = xp.querySelector('.xp-pulse');
    if (!pulse) {
      pulse = document.createElement('span');
      pulse.className = 'xp-pulse';
      pulse.setAttribute('aria-hidden', 'true');
      xp.appendChild(pulse);
    }

    let busy = false;
    const fire = () => {
      if (busy) return;
      busy = true;
      /* distância real do topo da section até o início da espinha */
      const xpTop = xp.getBoundingClientRect().top;
      const lineTop = line.getBoundingClientRect().top; /* origin top: estável */
      const dist = Math.max(160, lineTop - xpTop);
      gsap.timeline({ onComplete: () => { busy = false; } })
        .fromTo(pulse, { y: -140 }, { y: dist - 20, duration: .8, ease: 'power2.in' }, 0)
        .fromTo(pulse, { autoAlpha: 0 }, { autoAlpha: 1, duration: .15, ease: 'power1.out' }, 0)
        /* visivel ate quase o pouso: o sinal ENTREGA na espinha */
        .to(pulse, { autoAlpha: 0, duration: .2, ease: 'power1.out' }, .72);
    };

    ScrollTrigger.create({
      trigger: '.work-timeline .tl',
      start: 'top 58%', /* o MESMO instante em que a espinha nasce */
      onEnter: fire,
    });
  }

  /* ============================================================
     A LINHA — espinha da timeline (tinta + dots que acendem)
     ============================================================ */
  function buildLines() {
    const wrap = document.querySelector('.work-timeline .tl');
    const line = document.querySelector('.work-timeline .tl-line');
    if (!wrap || !line) return;

    let dots = [];
    const measure = () => {
      /* geometria de LAYOUT da linha (offsetTop/offsetHeight ignoram o
         scale do draw em andamento) — a linha se estende acima do .tl
         no desktop pra emendar com o fio da section de Experience */
      const wrapTop = wrap.getBoundingClientRect().top;
      const lineTop = wrapTop + line.offsetTop;
      const lineH = line.offsetHeight || 1;
      dots = gsap.utils.toArray('.work-timeline .dot').map(d => {
        const dr = d.getBoundingClientRect();
        return { el: d, frac: ((dr.top + dr.height / 2) - lineTop) / lineH };
      });
    };
    const light = p => dots.forEach(d => d.el.classList.toggle('is-lit', p >= d.frac - .015));

    gsap.fromTo(line, { '--tl-draw': 0 }, {
      '--tl-draw': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 58%',
        end: 'bottom 78%',
        scrub: .4,
        onRefresh: self => { measure(); light(self.progress); },
        onUpdate: self => light(self.progress),
      },
    });
  }

  /* ============================================================
     SERVICES — cards em cascata + ícones que se desenham em
     SINCRONIA (mesmo trigger e mesmo range = um movimento só)
     ============================================================ */
  function buildServiceCards() {
    const cards = gsap.utils.toArray('.service-card');
    if (!cards.length) return;

    /* entrada LATERAL convergindo pro centro: metade esquerda vem da
       esquerda, metade direita da direita — os externos viajam mais
       (mesmo range de scrub = chegada sincronizada, velocidades
       diferentes). --rise-x preserva o :hover do stylesheet. */
    cards.forEach((card, i) => {
      const side = i < cards.length / 2 ? -1 : 1;
      const depth = Math.abs(i - (cards.length - 1) / 2);
      const dist = Math.round(44 + depth * 38);
      dynamicKills.push(gsap.fromTo(card,
        { '--rise-x': `${side * dist}px`, autoAlpha: 0 },
        {
          '--rise-x': '0px',
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '#servicesGrid',
            start: 'clamp(top 90%)',
            end: 'clamp(top 48%)',
            scrub: .5,
          },
        }));
    });

    if (hasDraw()) {
      const strokes = cards.flatMap(card =>
        [...card.querySelectorAll('.service-icon svg *')].filter(s => s.getAttribute('stroke')));
      if (strokes.length) {
        dynamicKills.push(gsap.fromTo(strokes,
          { drawSVG: '0% 0%' },
          {
            drawSVG: '0% 100%',
            ease: 'none',
            stagger: .05,
            scrollTrigger: { trigger: '#servicesGrid', start: 'top 92%', end: 'top 48%', scrub: .5 },
          }));
      }
    }
  }

  /* ============================================================
     MARQUEE DUO — loop infinito em sentidos opostos. O SENTIDO
     segue o scroll: rolando pra baixo as faixas correm no sentido
     natural; rolando pra cima, INVERTEM — com transição suave
     passando pelo zero (sem tranco). Paradas fora da tela.
     Posição é um acumulador "wrapped" (0 <-> -50%): reversível
     sem emenda (tween repeat:-1 travaria ao andar pra trás).
     ============================================================ */
  function buildMarquees() {
    const strips = [];

    document.querySelectorAll('[data-marquee]').forEach(m => {
      const track = m.querySelector('[data-marquee-track]');
      if (!track) return;
      const dir = Number(m.dataset.marqueeDir) || -1;

      /* meia-pista precisa ser mais larga que a tela; o loop usa duas
         metades idênticas (xPercent 0 <-> -50 = emenda invisível) */
      if (!track.dataset.cloned) {
        /* fatia cada item em LETRAS antes de clonar (hover de glow
           caractere a caractere — os clones já nascem fatiados) */
        track.querySelectorAll('.marquee__item').forEach(item => {
          if (item.querySelector('.marquee__char')) return;
          const txt = item.textContent;
          item.textContent = '';
          for (const ch of txt) {
            if (ch === ' ') { item.appendChild(document.createTextNode(' ')); continue; }
            const s = document.createElement('span');
            s.className = 'marquee__char';
            s.textContent = ch;
            item.appendChild(s);
          }
        });

        const base = track.innerHTML;
        let half = base;
        track.innerHTML = half;
        let guard = 0;
        while (track.scrollWidth < window.innerWidth * 1.25 && guard++ < 30) {
          half += base;
          track.innerHTML = half;
        }
        track.innerHTML = half + half;
        track.dataset.cloned = '1';
      }

      const strip = {
        setX: gsap.quickSetter(track, 'xPercent'),
        dir,
        pos: dir < 0 ? 0 : -25, // fases diferentes pra não nascerem espelhadas
        active: false,
      };
      strips.push(strip);

      const st = ScrollTrigger.create({
        trigger: m,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: self => { strip.active = self.isActive; },
      });
      strip.active = st.isActive;
    });

    if (!strips.length) return;

    let flow = 1;   // alvo de sentido: +1 (scroll pra baixo/repouso), -1 (pra cima)
    let eased = 1;  // sentido aplicado, suavizado no tempo
    let boost = 0;  // pico de velocidade proporcional ao scroll, decai a zero
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: self => {
        if (self.direction) flow = self.direction;
        boost = Math.max(boost,
          gsap.utils.clamp(0, 3.5, Math.abs(self.getVelocity()) / 600));
      },
    });

    const SPEED = 50 / 30; // % da pista por segundo (meia-pista a cada 30s)
    gsap.ticker.add((time, deltaTime) => {
      eased += (flow - eased) * (1 - Math.pow(.9, deltaTime / 16.7));
      boost *= Math.pow(.94, deltaTime / 16.7); // decaimento por tempo
      const vel = eased * (1 + boost); // sentido do scroll × pico de velocidade
      strips.forEach(s => {
        if (!s.active) return;
        s.pos = gsap.utils.wrap(-50, 0,
          s.pos + s.dir * vel * SPEED * (deltaTime / 1000));
        s.setX(s.pos);
      });
    });
  }

  /* ============================================================
     HERO — fade-in de chegada: elementos aparecem em sequência
     quando a página abre (SÓ opacidade, sem deslocamento)
     ============================================================ */
  function buildHeroIntro() {
    const els = gsap.utils.toArray(
      ['.hero .photo', '.hero .hello', '.hero .name', '.hero .tagline',
        '.hero .rail', '.scroll-cue']);
    if (!els.length) return;
    gsap.from(els, {
      autoAlpha: 0,
      duration: 1.1,
      ease: 'power2.out',
      stagger: .14,
      clearProps: 'opacity,visibility',
    });
  }

  /* ============================================================
     PROFUNDIDADE — paralaxe (hero, aurora)
     ============================================================ */
  function buildDepth() {
    const hero = document.querySelector('.hero');
    if (hero) {
      gsap.timeline({
        defaults: { ease: 'none' },
        /* clamp(): progress 0 exato em scrollY 0 — sem drift residual
           no repouso quando o start resolver negativo */
        scrollTrigger: { trigger: hero, start: 'clamp(top top)', end: 'bottom top', scrub: .6 },
      })
        .to('.hero .stack', { yPercent: 16, autoAlpha: .3 }, 0)
        .to('.hero .photo', { yPercent: 9 }, 0)
        .to('.hero .rail', { yPercent: 13, autoAlpha: .25 }, 0);
    }

    const contact = document.querySelector('#contato');
    if (contact) {
      gsap.timeline({
        defaults: { ease: 'none' },
        /* end 'bottom bottom': a section e a ULTIMA da pagina — 'bottom
           top' nunca chega e o scrub congelava a 42% (aurora 23px
           abaixo do projetado). Assim o progress fecha em 1 exatamente
           no fim do scroll. */
        scrollTrigger: { trigger: contact, start: 'top bottom', end: 'bottom bottom', scrub: .8 },
      })
        .fromTo('.aurora', { yPercent: 10 }, { yPercent: -4 }, 0)
        .fromTo('.aurora__halo--violet', { xPercent: -7 }, { xPercent: 5 }, 0)
        .fromTo('.aurora__halo--magenta', { xPercent: 7 }, { xPercent: -5 }, 0);
    }
  }

  /* ============================================================
     O MOUSE — botões magnéticos + spotlight + paralaxe no hero
     ============================================================ */
  function magnetize(selector, strength = .3) {
    gsap.utils.toArray(selector).forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: .45, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: .45, ease: 'power3.out' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  function buildMouse() {
    if (!hasPointer()) return;

    /* (.scroll-cue fica de fora: a animação CSS de bob é dona do
       transform dele e anularia o magnetismo) */
    magnetize('.resume-btn, .contact-hero__cta', .32);
    magnetize('.sbtn', .38);
    magnetize('.ps-cta, .ps-repos__btn', .22);

    /* spotlight dos service-cards: --mx/--my seguem o cursor (delegado
       no grid — sobrevive ao re-render dos cards) */
    const grid = document.getElementById('servicesGrid');
    if (grid) {
      grid.addEventListener('mousemove', e => {
        const card = e.target.closest('.service-card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
      }, { passive: true });
    }

    /* cursor-chip "Visit ↗" seguindo o mouse sobre as capas de projeto
       (delegado na lista — sobrevive ao re-render dos cards) */
    const list = document.querySelector('[data-ps-list]');
    if (list) {
      const chip = document.createElement('span');
      chip.className = 'ps-cursorchip';
      chip.setAttribute('aria-hidden', 'true');
      chip.innerHTML = '<span data-chip-label>Visit</span>' +
        '<svg viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" ' +
        'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      document.body.appendChild(chip);

      const chipX = gsap.quickTo(chip, 'x', { duration: .35, ease: 'power3.out' });
      const chipY = gsap.quickTo(chip, 'y', { duration: .35, ease: 'power3.out' });
      let chipOn = false;
      const hide = () => {
        if (!chipOn) return;
        chipOn = false;
        gsap.to(chip, { autoAlpha: 0, scale: .8, duration: .2, overwrite: 'auto' });
      };
      list.addEventListener('mousemove', e => {
        if (e.target.closest('.ps-frame__view')) {
          if (!chipOn) {
            chipOn = true;
            chip.querySelector('[data-chip-label]').textContent =
              list.dataset.visitLabel || 'Visit';
            gsap.set(chip, { x: e.clientX, y: e.clientY });
            gsap.to(chip, { autoAlpha: 1, scale: 1, duration: .25, overwrite: 'auto' });
          }
          chipX(e.clientX);
          chipY(e.clientY);
        } else {
          hide();
        }
      }, { passive: true });
      list.addEventListener('mouseleave', hide);
    }

    const hero = document.querySelector('.hero');
    if (!hero) return;
    const photoX = gsap.quickTo('.hero .photo', 'x', { duration: .9, ease: 'power3.out' });
    const photoY = gsap.quickTo('.hero .photo', 'y', { duration: .9, ease: 'power3.out' });
    const stackX = gsap.quickTo('.hero .stack', 'x', { duration: 1.1, ease: 'power3.out' });
    const stackY = gsap.quickTo('.hero .stack', 'y', { duration: 1.1, ease: 'power3.out' });

    /* brilho blueprint — 100% compositor: wrapper estático, chip de
       500px (miolo lima + halo verde, difuso) movido por transform,
       grade interna contra-transladada (módulo da célula = ancorada
       no mundo) que INCLINA na direção do movimento (skew ∝ velocidade)
       e relaxa ao parar. Geometria do chip vive no CSS (.hero-beam). */
    let bp = hero.querySelector('div.hero-blueprint');
    if (!bp) {
      hero.querySelector('.hero-blueprint')?.remove();
      bp = document.createElement('div');
      bp.className = 'hero-blueprint';
      bp.setAttribute('aria-hidden', 'true');
      const mkChip = document.createElement('div');
      mkChip.className = 'hero-beam';
      /* invólucro com máscara própria: a grade morre ANTES da luz */
      const mkMask = document.createElement('div');
      mkMask.className = 'hero-beam__gridmask';
      const mkGrid = document.createElement('div');
      mkGrid.className = 'hero-beam__grid';
      mkMask.appendChild(mkGrid);
      mkChip.appendChild(mkMask);
      bp.appendChild(mkChip);
      hero.appendChild(bp);
    }
    const beamChip = bp.querySelector('.hero-beam');
    const beamGrid = bp.querySelector('.hero-beam__grid');
    const CELL = 64;

    const beam = { x: -999, y: -999 };
    let lastBx = -999, lastBy = -999;
    let skX = 0, skY = 0;

    const applyBeam = () => {
      const vx = beam.x - lastBx, vy = beam.y - lastBy;
      lastBx = beam.x; lastBy = beam.y;
      /* skew alvo ∝ velocidade, suavizado — e decai sozinho ao parar
         (clamps curtos: brilho delicado, nao holofote que entorta) */
      skX += (gsap.utils.clamp(-6, 6, vx * .5) - skX) * .14;
      skY += (gsap.utils.clamp(-4.5, 4.5, vy * .42) - skY) * .14;
      gsap.set(beamChip, { x: beam.x, y: beam.y });
      gsap.set(beamGrid, {
        x: -(((beam.x % CELL) + CELL) % CELL),
        y: -(((beam.y % CELL) + CELL) % CELL),
        skewX: skX,
        skewY: skY,
      });
    };
    /* duration curta = o brilho gruda no cursor (preciso), sem ficar duro */
    const beamX = gsap.quickTo(beam, 'x', { duration: .35, ease: 'power3.out', onUpdate: applyBeam });
    const beamY = gsap.quickTo(beam, 'y', { duration: .35, ease: 'power3.out', onUpdate: applyBeam });
    let beamOn = false;

    hero.addEventListener('mousemove', e => {
      const nx = e.clientX / window.innerWidth - .5;
      const ny = e.clientY / window.innerHeight - .5;
      photoX(nx * -16); photoY(ny * -10);
      stackX(nx * 12); stackY(ny * 8);
    });
    hero.addEventListener('mouseleave', () => {
      photoX(0); photoY(0); stackX(0); stackY(0);
    });

    const beamOff = () => {
      if (!beamOn) return;
      beamOn = false;
      gsap.to(bp, { autoAlpha: 0, duration: .5, ease: 'power2.out', overwrite: 'auto' });
    };
    /* rastreio no DOCUMENTO: a camada é full-bleed e o hero ocupa só a
       coluna do <main> — nas margens laterais o mousemove do hero nem
       dispara. O facho vive enquanto o ponteiro estiver DENTRO do
       retângulo da camada e fora do header fixo (que a sobrepõe). */
    document.addEventListener('mousemove', e => {
      const r = bp.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside || e.target.closest('header')) { beamOff(); return; }
      if (!beamOn) {
        beamOn = true;
        /* nasce NO cursor (sem viajar desde longe) e acende suave */
        beam.x = e.clientX - r.left;
        beam.y = e.clientY - r.top;
        applyBeam();
        gsap.to(bp, { autoAlpha: 1, duration: .45, ease: 'power2.out', overwrite: 'auto' });
      }
      beamX(e.clientX - r.left);
      beamY(e.clientY - r.top);
    }, { passive: true });
  }

  /* ============================================================
     DINÂMICOS — tudo que referencia DOM re-renderizável
     ============================================================ */
  function buildDynamic() {
    buildTitles();
    buildServiceCards();

    riseVars(gsap.utils.toArray('.about-card'),
      { trigger: '.about-side', y: '44px', stagger: .14, end: 'top 38%' });
    riseVars(gsap.utils.toArray('.tile-square'),
      { trigger: '.skills-tiles .tiles-wrap', y: '52px', stagger: .12 });
    /* só o botão REAL da showcase (.ps-repos) — o CTA do placeholder
       "em construção" sobe junto com a janela (.ps-soon__win, riseSoft)
       e não pode receber vars próprias com trigger oculto */
    riseVars(gsap.utils.toArray('.ps-repos .ps-repos__btn'),
      { trigger: '.ps-repos', y: '24px' });

    /* timeline: cada entrada se CONSTRÓI com o scroll, em sequência —
       1) o galho desenha da espinha em direção ao card,
       2) o ano assenta do seu lado,
       3) a casca do card desliza do lado dele,
       4) o conteúdo interno (título, meta, bullets, chips) cai em
          cascata dentro do card. Tudo numa timeline única scrubada. */
    gsap.utils.toArray('.work-timeline .tl-entry').forEach(entry => {
      const card = entry.querySelector('.tl-card');
      const year = entry.querySelector('.tl-year');
      const fromLeft = entry.classList.contains('tl-entry--left');

      /* galho espinha→card (desktop; o CSS o esconde no mobile) */
      let branch = entry.querySelector('.tl-branch');
      if (!branch) {
        branch = document.createElement('span');
        branch.className = 'tl-branch';
        branch.setAttribute('aria-hidden', 'true');
        entry.appendChild(branch);
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: entry,
          start: 'clamp(top 90%)',
          end: 'clamp(top 42%)',
          scrub: .5,
        },
      });
      tl.fromTo(branch, { scaleX: 0 }, { scaleX: 1, duration: .16 }, .02);
      if (year) {
        tl.fromTo(year,
          { '--rise-y': '16px', autoAlpha: 0 },
          { '--rise-y': '0px', autoAlpha: 1, duration: .3 }, 0);
      }
      if (card) {
        tl.fromTo(card,
          { '--rise-x': fromLeft ? '-52px' : '52px', autoAlpha: 0 },
          { '--rise-x': '0px', autoAlpha: 1, duration: .42 }, .12);
        /* exclui <dialog> (modal de certificado): animar autoAlpha nele
           deixaria o modal invisível se aberto antes do scrub completar */
        const parts = gsap.utils.toArray(card.children)
          .filter(el => el.tagName !== 'DIALOG');
        if (parts.length) {
          tl.fromTo(parts,
            { y: 14, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: .35, stagger: .07 }, .3);
        }
      }
      dynamicKills.push(tl);
    });

    /* parágrafos/kickers de apoio (+ janela do placeholder de projetos,
       que sobe inteira como um card) */
    riseSoft('.section-sub, .xp-sub, .ps-kicker, .ps-soon__win, ' +
      '.about-head .kicker, .contact-hero__kicker, .contact-hero__sub');

    /* CTA do contato sobe via --rise-y (é magnético: x/y são do mouse) */
    riseVars(gsap.utils.toArray('.contact-hero__cta'),
      { trigger: '.contact-hero__inner', y: '28px', end: 'top 55%' });

    /* showcase: a "pagina" RENDERIZA na janela (wipe descendo a partir
       da barra, preso ao scroll) + paralaxe interna da capa 16:9 */
    gsap.utils.toArray('.ps-card').forEach(card => {
      const view = card.querySelector('.ps-frame__view');
      if (view) {
        dynamicKills.push(gsap.fromTo(view,
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top 96%', end: 'top 58%', scrub: .5 },
          }));
      }
      const img = card.querySelector('.ps-card__img');
      if (!img) return;
      dynamicKills.push(gsap.fromTo(img,
        { yPercent: -7, scale: 1.15 },
        {
          yPercent: 7,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: .4 },
        }));
    });
  }

  function killDynamic() {
    dynamicKills.forEach(k => {
      if (k.scrollTrigger) k.scrollTrigger.kill();
      if (k.kill) k.kill();
    });
    dynamicKills = [];
  }

  /* ============================================================
     REBUILD — re-render (i18n, troca de track) refaz só o dinâmico
     ============================================================ */
  function rebuild() {
    muted = true;
    killDynamic();
    buildDynamic();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    setTimeout(() => { muted = false; }, 80);
  }

  function bindRebuildHooks() {
    const schedule = () => {
      if (muted) return;
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(rebuild, 160);
    };

    ['[data-ps-list]', '#servicesGrid', '#group-prof', '#group-acad', '#group-courses']
      .forEach(sel => {
        const el = document.querySelector(sel);
        if (el) new MutationObserver(schedule).observe(el, { childList: true });
      });
    document.querySelectorAll(SPLIT_TITLES).forEach(el =>
      new MutationObserver(schedule).observe(el, { childList: true }));

    /* troca de track só alterna .is-hidden (sem mutação de filhos) */
    document.querySelectorAll('.xp-ico').forEach(btn =>
      btn.addEventListener('click', schedule));
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const plugins = [ScrollTrigger];
    if (window.DrawSVGPlugin) plugins.push(window.DrawSVGPlugin);
    gsap.registerPlugin(...plugins);

    document.documentElement.classList.add('fx-on');

    buildHeroIntro();
    buildWires();
    buildLines();
    buildPulse();
    buildMarquees();
    buildDepth();
    buildMouse();
    buildDynamic();
    bindRebuildHooks();

    ScrollTrigger.sort();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
