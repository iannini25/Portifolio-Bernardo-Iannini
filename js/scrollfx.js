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
  /* tier do js/perf-tier.js — decide quanto de motion/video roda */
  const perfTier = () => document.documentElement.dataset.perf || 'high';
  const perfIsLow = () => perfTier() === 'low';
  const perfIsHigh = () => perfTier() === 'high';

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
    const splitInto = (parent, str) => {
      str.split(/(\s+)/).forEach(tok => {
        if (!tok) return;
        if (!tok.trim()) { parent.appendChild(document.createTextNode(tok)); return; }
        const word = document.createElement('span');
        word.className = 'chw';
        for (const ch of tok) {
          const c = document.createElement('span');
          c.className = 'chx';
          c.textContent = ch;
          word.appendChild(c);
        }
        parent.appendChild(word);
      });
    };

    /* elementos inline do título (o <em> serif) são PRESERVADOS: o
       split entra dentro deles, então o estilo por letra continua
       valendo (o CSS do em também estiliza os .chx internos). */
    const wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        splitInto(wrap, node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        splitInto(clone, node.textContent);
        wrap.appendChild(clone);
      }
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
          /* power2.out no scrub distribui o deslocamento e o elemento
             ASSENTA no fim (não para seco). Regra: só nas CHEGADAS —
             todo parallax/draw contínuo fica em 'none' (linear é o certo). */
          ease: 'power2.out',
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
        ease: 'power2.out',
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
          ease: 'power2.out',
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

    /* About: fio ondulado que nasce na esquerda e ACABA aqui, no centro
       inferior da propria section — este e o unico fio glow do site.
       O draw termina quando a borda inferior de about cruza os 70% do
       viewport. */
    const about = document.querySelector('#sobre');
    if (about) {
      about.classList.add('wire-host');
      const path = makeWire(about, '0 0 100 1000',
        'M7,-10 C2,140 15,240 8,400 C3,540 14,640 26,740 C40,830 50,850 50,1012',
        'glow-wire--about');
      gsap.fromTo(path, { drawSVG: '0% 0%' }, {
        drawSVG: '0% 100%',
        ease: 'none',
        scrollTrigger: { trigger: about, start: 'top 80%', end: 'bottom 70%', scrub: .6 },
      });
    }

    /* Services e Experience NÃO tem fio: o glow morre no fim de about. */
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
          ease: 'power2.out',
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
    /* VELOCITY SKEW (estilo VelocityText/motion): a velocidade do scroll
       INCLINA o marquee; parou de rolar, ele volta ao reto (mola por lerp).
       Aplica skewX no .marquee-duo — o loop mexe só nos tracks internos, então
       não briga. Reaproveita eased (sentido) e boost (pico de velocidade). */
    const duo = document.querySelector('.marquee-duo');
    let skew = 0;
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
      if (duo) {
        const skewTarget = gsap.utils.clamp(-26, 26, -eased * boost * 8);
        skew += (skewTarget - skew) * (1 - Math.pow(.82, deltaTime / 16.7));
        duo.style.transform = `skewX(${skew.toFixed(2)}deg)`;
      }
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

  /* ============================================================
     PONTEIRO EM rAF — utilitario compartilhado.

     Todo handler de mousemove daqui pra baixo passa por aqui.
     Duas ideias:

     1. COALESCER: o mouse dispara 120x/s (mouse gamer chega a
        1000x/s) mas a tela so pinta 60x/s. Guardamos a ultima
        posicao e processamos UMA vez por frame. Metade ou mais do
        trabalho some sem que nada mude na tela.

     2. CACHEAR OS RECT: um getBoundingClientRect() logo depois de
        escrever style forca layout sincrono. Mas o rect de um card
        so muda em scroll/resize — NAO muda quando o mouse anda.
        Entao lemos uma vez, guardamos, e invalidamos em
        scroll/resize.
     ============================================================ */
  function onPointerFrame(alvo, handler, opts) {
    opts = opts || {};
    var ultimoEvento = null;
    var agendado = false;

    function processar() {
      agendado = false;
      var e = ultimoEvento;
      ultimoEvento = null;
      if (e) handler(e);
    }

    alvo.addEventListener('mousemove', function (e) {
      ultimoEvento = e;
      if (!agendado) {
        agendado = true;
        requestAnimationFrame(processar);
      }
    }, { passive: true });

    if (opts.onLeave) {
      alvo.addEventListener('mouseleave', function () {
        ultimoEvento = null;
        opts.onLeave();
      });
    }
  }

  /* cache de rect com invalidacao em scroll/resize */
  function criarCacheRect() {
    var mapa = new WeakMap();
    var sujo = false;

    function invalidar() { sujo = true; }
    addEventListener('scroll', invalidar, { passive: true });
    addEventListener('resize', invalidar, { passive: true });

    function rect(el) {
      if (sujo) { mapa = new WeakMap(); sujo = false; }
      var r = mapa.get(el);
      if (!r) { r = el.getBoundingClientRect(); mapa.set(el, r); }
      return r;
    }
    /* exposto porque a PILHA se move por transform SEM scroll/resize
       (avanco automatico das janelas): quem re-renderiza ou re-posiciona
       chama rect.invalidar() pra nao servir rect velho */
    rect.invalidar = invalidar;
    return rect;
  }
  var rectDe = criarCacheRect();

  function buildMouse() {
    if (!hasPointer()) return;

    /* (.scroll-cue fica de fora: a animação CSS de bob é dona do
       transform dele e anularia o magnetismo) */
    magnetize('.resume-btn, .contact-hero__cta', .32);
    magnetize('.sbtn', .38);
    magnetize('.ps-cta, .ps-repos__btn', .22);

    /* BRILHO TOPOGRÁFICO: as curvas de nível do fundo acendem de leve ao
       redor do cursor. Em low: desligado (mousemove global + quickTo
       em todo cursor = custo constante; o SVG base continua no lugar). */
    if (!perfIsLow()) {
    document.querySelectorAll('.pj-topo').forEach(topoEl => {
      let tRect = topoEl.getBoundingClientRect();
      const refreshTopo = () => { tRect = topoEl.getBoundingClientRect(); };
      window.addEventListener('scroll', refreshTopo, { passive: true });
      window.addEventListener('resize', refreshTopo, { passive: true });

      const gpos = { x: -600, y: -600 };
      const applyTopo = () => {
        topoEl.style.setProperty('--mx', gpos.x.toFixed(1) + 'px');
        topoEl.style.setProperty('--my', gpos.y.toFixed(1) + 'px');
      };
      const gqx = gsap.quickTo(gpos, 'x', { duration: .34, ease: 'power3', onUpdate: applyTopo });
      const gqy = gsap.quickTo(gpos, 'y', { duration: .34, ease: 'power3' });
      let topoPrimed = false, wasInside = false;
      const within = e => e.clientX >= tRect.left && e.clientX <= tRect.right &&
                          e.clientY >= tRect.top && e.clientY <= tRect.bottom;

      document.addEventListener('mousemove', e => {
        let inside = within(e);
        if (inside && !wasInside) { refreshTopo(); inside = within(e); }  // rect fresco ao entrar
        wasInside = inside;
        if (!inside) {
          if (topoEl.classList.contains('is-hot')) { topoEl.classList.remove('is-hot'); topoPrimed = false; }
          return;
        }
        const x = e.clientX - tRect.left, y = e.clientY - tRect.top;
        if (!topoPrimed) { topoPrimed = true; gpos.x = x; gpos.y = y; applyTopo(); }
        gqx(x); gqy(y);
        if (!topoEl.classList.contains('is-hot')) topoEl.classList.add('is-hot');
      }, { passive: true });
    });
    }

    /* spotlight dos service-cards: --mx/--my seguem o cursor (delegado
       no grid — sobrevive ao re-render dos cards) */
    const grid = document.getElementById('servicesGrid');
    if (grid) {
      onPointerFrame(grid, e => {
        const card = e.target.closest('.service-card');
        if (!card) return;
        const r = rectDe(card);
        if (!r.width || !r.height) return;
        card.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
      });
    }

    /* cursor-badge CIRCULAR seguindo o mouse sobre as capas: bolinha
       central (disco de vidro + seta) e "Ver mais" escrito em círculo
       girando devagar em volta. Delegado nos containers (sobrevive ao
       re-render); vale pro arquivo e pra janela da FRENTE da pilha
       featured (as de trás promovem no clique, não ganham badge). */
    const list = document.querySelector('[data-ps-list]');
    const stage = document.querySelector('[data-pj-stage]');
    if (list || stage) {
      const chip = document.createElement('span');
      chip.className = 'ps-cursorchip';
      chip.setAttribute('aria-hidden', 'true');
      /* r=40 no viewBox 100 → circunferência ≈ 251; textLength trava o
         texto pra preencher o círculo inteiro sem emenda (loop perfeito) */
      chip.innerHTML =
        '<svg class="ps-cursorchip__ring" viewBox="0 0 100 100">' +
          '<defs><path id="psChipRing" fill="none" ' +
            'd="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0"/></defs>' +
          '<text><textPath data-chip-label href="#psChipRing" startOffset="0" ' +
            'textLength="251" lengthAdjust="spacing"></textPath></text>' +
        '</svg>' +
        '<span class="ps-cursorchip__core">' +
          '<svg viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M9 7h8v8" ' +
            'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ' +
            'stroke-linejoin="round"/></svg>' +
        '</span>';
      document.body.appendChild(chip);

      const ringEl = chip.querySelector('[data-chip-label]');
      /* repete o rótulo em volta do círculo, separado por ponto-médio */
      const ringText = lbl =>
        ((lbl || 'View more').toUpperCase() + '   ·   ').repeat(3);

      const chipX = gsap.quickTo(chip, 'x', { duration: .35, ease: 'power3.out' });
      const chipY = gsap.quickTo(chip, 'y', { duration: .35, ease: 'power3.out' });
      let chipOn = false;
      const hide = () => {
        if (!chipOn) return;
        chipOn = false;
        gsap.to(chip, { autoAlpha: 0, scale: .7, duration: .2, overwrite: 'auto' });
      };
      const follow = (e, hit) => {
        if (hit) {
          if (!chipOn) {
            chipOn = true;
            ringEl.textContent = ringText(list && list.dataset.visitLabel);
            gsap.set(chip, { x: e.clientX, y: e.clientY });
            gsap.to(chip, { autoAlpha: 1, scale: 1, duration: .3, ease: 'back.out(1.7)', overwrite: 'auto' });
          }
          chipX(e.clientX);
          chipY(e.clientY);
        } else {
          hide();
        }
      };
      if (list) {
        list.addEventListener('mousemove',
          e => follow(e, !!e.target.closest('.ps-frame__view')), { passive: true });
        list.addEventListener('mouseleave', hide);
      }
      if (stage) {
        stage.addEventListener('mousemove',
          e => follow(e, !!e.target.closest('.pj-win.is-front .ps-frame__view')), { passive: true });
        stage.addEventListener('mouseleave', hide);
      }
    }

    /* anel de borda por proximidade nas janelas da pilha — a luz existe
       no espaço: acende ANTES do hover, proporcional à distância. Só
       escreve CSS vars (o ::before mask-composite faz o resto).
       Em low/medium: desligado — e rAF + getBoundingClientRect em N
       janelas a cada frame de mouse. */
    if (stage && perfIsHigh()) {
      const RADIUS = 260;
      const clearGlow = () => stage.querySelectorAll('.pj-win')
        .forEach(w => w.style.setProperty('--glow-i', '0'));

      /* a lista de .pj-win so muda quando a pilha re-renderiza, nao a
         cada movimento do mouse. Cacheamos e revalidamos no rebuild.
         O observer tambem ve mudanca de CLASSE (is-front troca no avanco
         automatico da pilha, que move as janelas por transform SEM
         scroll/resize) -> invalida o cache de rect junto. Nossas escritas
         de --glow-* mexem no atributo style, nao em class, entao NAO
         disparam o observer. */
      let wins = [];
      const refreshWins = () => {
        wins = Array.from(stage.querySelectorAll('.pj-win'));
        rectDe.invalidar();
      };
      refreshWins();
      new MutationObserver(refreshWins).observe(stage, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['class'],
      });

      onPointerFrame(stage, e => {
        /* FASE 1 — so LE. nenhuma escrita entre as leituras, entao o
           navegador resolve tudo com um layout so (ou nenhum, porque o
           cache ja tem os rect). */
        const dados = wins.map(w => {
          const r = rectDe(w);
          if (!r.width || !r.height) return null;
          const d = Math.max(0,
            Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) -
            Math.max(r.width, r.height) / 2);
          const prox = RADIUS * .5, fade = RADIUS * .75;
          return {
            w,
            i: d <= prox ? 1 : d <= fade ? (fade - d) / (fade - prox) : 0,
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100
          };
        });

        /* FASE 2 — so ESCREVE. */
        for (const it of dados) {
          if (!it) continue;
          it.w.style.setProperty('--glow-i', it.i.toFixed(3));
          it.w.style.setProperty('--glow-x', it.x.toFixed(1) + '%');
          it.w.style.setProperty('--glow-y', it.y.toFixed(1) + '%');
        }
      }, { onLeave: clearGlow });
    }

    /* eco do anel nos cards do arquivo (--mx/--my; o :hover liga) */
    if (list) {
      onPointerFrame(list, e => {
        const frame = e.target.closest('.pj-card__frame');
        if (!frame) return;
        const r = rectDe(frame);
        if (!r.width || !r.height) return;
        frame.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
        frame.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
      });

      /* previews dos cards: loop AUTÔNOMO gerenciado em buildDynamic
         (viewport-based) — o hover não toca no playback, só expande o
         card; a animação continua correndo por baixo do reveal de cor. */
    }

    /* mesmo contorno-que-segue-o-cursor dos cards do arquivo, agora nos
       cards de EXPERIENCIA (.tl-card): so escreve --mx/--my (%); o :hover +
       o ::before mascarado (SO outline, sem glow) fazem o resto. Delegado na
       secao #timeline (onde a timeline vive) -> sobrevive ao re-render. */
    const xpSection = document.querySelector('#timeline');
    if (xpSection) {
      onPointerFrame(xpSection, e => {
        const card = e.target.closest('.tl-card');
        if (!card) return;
        const r = rectDe(card);
        if (!r.width || !r.height) return;
        card.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
      });
    }

    const hero = document.querySelector('.hero');
    if (!hero) return;
    const photoX = gsap.quickTo('.hero .photo', 'x', { duration: .9, ease: 'power3.out' });
    const photoY = gsap.quickTo('.hero .photo', 'y', { duration: .9, ease: 'power3.out' });
    const stackX = gsap.quickTo('.hero .stack', 'x', { duration: 1.1, ease: 'power3.out' });
    const stackY = gsap.quickTo('.hero .stack', 'y', { duration: 1.1, ease: 'power3.out' });

    /* fundo da hero = as MESMAS curvas de nível da section de projetos
       (.pj-topo, acende ao redor do cursor — vive no HTML + buildMouse
       acima). Aqui só resta o parallax delicado da foto/nome. */
    hero.addEventListener('mousemove', e => {
      const nx = e.clientX / window.innerWidth - .5;
      const ny = e.clientY / window.innerHeight - .5;
      photoX(nx * -16); photoY(ny * -10);
      stackX(nx * 12); stackY(ny * 8);
    });
    hero.addEventListener('mouseleave', () => {
      photoX(0); photoY(0); stackX(0); stackY(0);
    });
  }

  /* ============================================================
     DINÂMICOS — tudo que referencia DOM re-renderizável
     ============================================================ */
  function buildDynamic() {
    buildTitles();
    buildServiceCards();

    riseVars(gsap.utils.toArray('.about-card'),
      { trigger: '.about-side', y: '44px', stagger: .14, end: 'top 38%' });
    /* skills: as pastas acendem do MIOLO pra fora (onda curta), não em
       varredura linear top-down — pouso mais coeso da grade */
    riseVars(gsap.utils.toArray('.skills-folders .skill-folder'),
      { trigger: '.skills-folders', y: '52px',
        stagger: { each: .07, from: 'center', grid: 'auto' } });
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
        /* chegadas (ano, card, filhos) ASSENTAM; o galho é DRAW → 'none' */
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: entry,
          start: 'clamp(top 90%)',
          end: 'clamp(top 42%)',
          scrub: .5,
        },
      });
      tl.fromTo(branch, { scaleX: 0 }, { scaleX: 1, duration: .16, ease: 'none' }, .02);
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

    /* ============ CATÁLOGO — A BANCADA VIVA ============ */

    /* featured: palco + painel chegam juntos (rise suave; os transforms
       das janelas pertencem ao CSS dos slots — GSAP NÃO toca neles) */
    riseSoft('.pj-panel__inner, .pj-panel__nav');

    /* filtros + contador chegam como uma linha só */
    riseSoft('.pj-cli__row');

    /* arquivo: em high, cada fileira sobe em 3D + wipe + paralaxe.
       Em medium/low o visual FINAL e o mesmo (card assentado) — so a
       viagem fica mais barata (y/opacity), sem rotateX/clipPath por
       card (cada um desses forca layer e compositing). */
    if (perfIsHigh()) {
      gsap.utils.toArray('.pj-row').forEach(row => {
        const cards = gsap.utils.toArray(row.children);
        if (!cards.length) return;
        dynamicKills.push(gsap.fromTo(cards,
          { y: 56, rotateX: -18, scale: .93, autoAlpha: 0,
            transformPerspective: 900, transformOrigin: '50% 100%' },
          {
            y: 0, rotateX: 0, scale: 1, autoAlpha: 1, ease: 'power2.out', stagger: .09,
            immediateRender: false,
            scrollTrigger: { trigger: row, start: 'clamp(top 94%)', end: 'clamp(top 60%)', scrub: .5 },
          }));
      });
      gsap.utils.toArray('.pj-card').forEach(card => {
        const view = card.querySelector('.pj-card__view');
        if (view) {
          dynamicKills.push(gsap.fromTo(view,
            { clipPath: 'inset(0 0 100% 0)' },
            {
              clipPath: 'inset(0 0 0% 0)',
              ease: 'power2.out',
              immediateRender: false,
              scrollTrigger: { trigger: card, start: 'clamp(top 96%)', end: 'clamp(top 58%)', scrub: .5 },
            }));
        }
        const img = card.querySelector('.pj-card__img');
        if (!img) return;
        dynamicKills.push(gsap.fromTo(img,
          { yPercent: -5, scale: 1.12 },
          {
            yPercent: 5,
            scale: 1.12,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: .4 },
          }));
      });
    } else if (!perfIsLow()) {
      /* medium: rise simples por fileira, sem 3D/wipe/paralaxe */
      gsap.utils.toArray('.pj-row').forEach(row => {
        const cards = gsap.utils.toArray(row.children);
        if (!cards.length) return;
        dynamicKills.push(gsap.fromTo(cards,
          { y: 36, autoAlpha: 0 },
          {
            y: 0, autoAlpha: 1, ease: 'power2.out', stagger: .06,
            immediateRender: false,
            scrollTrigger: { trigger: row, start: 'clamp(top 92%)', end: 'clamp(top 62%)', scrub: .4 },
          }));
      });
    } else {
      /* low: so um fade leve da fileira — zero scrub por card */
      riseSoft('.pj-row');
    }

    /* a Corrente: pulsos so em high (loop infinito = trabalho constante) */
    const guides = gsap.utils.toArray('.pj-guide__pulse');
    if (guides.length && perfIsHigh()) {
      const pulseTweens = guides.map((pulse, i) => {
        const tl = gsap.timeline({ repeat: -1, delay: i * 2.4, paused: true });
        tl.set(pulse, { yPercent: -110, opacity: 0 })
          .to(pulse, { opacity: .5, duration: .14, ease: 'none' }, .02)
          .to(pulse, { yPercent: 780, duration: 13 + i * 2.6, ease: 'none' }, 0)
          .to(pulse, { opacity: 0, duration: .18, ease: 'none' }, '>-.2');
        dynamicKills.push(tl);
        return tl;
      });
      dynamicKills.push(ScrollTrigger.create({
        trigger: '.pj-featured',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: self => pulseTweens.forEach(t => self.isActive ? t.play() : t.pause()),
      }));
    }

    /* janelas com preview: so a da FRENTE toca. Em low nao ha <video>
       (projects.js renderiza <img>); em medium/high sincroniza. */
    const stackEl = document.querySelector('[data-pj-stack]');
    const winVideos = (!perfIsLow() && stackEl)
      ? gsap.utils.toArray(stackEl.querySelectorAll('video.pj-win__img')) : [];
    if (winVideos.length) {
      let stageInView = false;
      const syncWinVideos = () => winVideos.forEach(v => {
        const isFront = stageInView &&
          !!v.closest('.pj-win')?.classList.contains('is-front');
        if (isFront) {
          if (v.paused) {
            const play = () => { v.play?.().catch(() => {}); };
            if (typeof window.biWhenAssetReady === 'function') {
              window.biWhenAssetReady(v.getAttribute('src') || '', play);
            } else play();
          }
        }
        else if (!v.paused) v.pause?.();
      });
      dynamicKills.push(ScrollTrigger.create({
        trigger: '.pj-stage',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: self => { stageInView = self.isActive; syncWinVideos(); },
      }));
      const winObserver = new MutationObserver(syncWinVideos);
      winVideos.forEach(v => {
        const win = v.closest('.pj-win');
        if (win) winObserver.observe(win, { attributes: true, attributeFilter: ['class'] });
      });
      dynamicKills.push({ kill: () => winObserver.disconnect() });
    }

    /* previews do ARQUIVO: efeitos intactos, mas no maximo UM video
       tocando por vez (o mais perto do centro da viewport). Decodificar
       4–6 H.264 juntos e o que faz notebook potente engasgar aqui. */
    if (perfIsHigh()) {
      const cardVideos = gsap.utils.toArray(
        document.querySelectorAll('.pj-arch video.pj-card__img'));
      if (cardVideos.length) {
        const visible = new Set();
        const syncArchiveVideos = () => {
          let best = null;
          let bestDist = Infinity;
          const midY = (window.innerHeight || 0) * 0.5;
          visible.forEach(v => {
            const r = v.getBoundingClientRect();
            if (!r.height) return;
            const dist = Math.abs((r.top + r.bottom) * 0.5 - midY);
            if (dist < bestDist) { bestDist = dist; best = v; }
          });
          cardVideos.forEach(v => {
            if (v === best) {
              const rate = parseFloat(v.dataset.rate);
              if (rate) v.playbackRate = rate;
              if (v.paused) {
                const play = () => { v.play?.().catch(() => {}); };
                if (typeof window.biWhenAssetReady === 'function') {
                  window.biWhenAssetReady(v.getAttribute('src') || '', play);
                } else play();
              }
            } else if (!v.paused) {
              v.pause?.();
            }
          });
        };
        const cardIO = new IntersectionObserver(entries => {
          entries.forEach(en => {
            if (en.isIntersecting) visible.add(en.target);
            else {
              visible.delete(en.target);
              if (!en.target.paused) en.target.pause?.();
            }
          });
          syncArchiveVideos();
        }, { rootMargin: '40px 0px', threshold: [0, 0.2, 0.5, 0.8] });
        cardVideos.forEach(v => cardIO.observe(v));
        let scrollRaf = 0;
        const onScrollSync = () => {
          if (scrollRaf) return;
          scrollRaf = requestAnimationFrame(() => {
            scrollRaf = 0;
            syncArchiveVideos();
          });
        };
        window.addEventListener('scroll', onScrollSync, { passive: true });
        dynamicKills.push({
          kill: () => {
            cardIO.disconnect();
            window.removeEventListener('scroll', onScrollSync);
            if (scrollRaf) cancelAnimationFrame(scrollRaf);
          }
        });
      }
    }
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
    /* Flip dos filtros (js/projects.js) ainda em voo: matar/recriar os
       tweens de y/autoAlpha dos .pj-card agora atropelaria transforms
       no meio da viagem — adia até o pouso (checagens de 120ms) */
    if ((window.Flip && Flip.isFlipping && Flip.isFlipping('.pj-card')) || window.__pjSwapping) {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(rebuild, 120);
      return;
    }
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

    ['[data-ps-list]', '[data-pj-stack]', '#servicesGrid', '#group-prof', '#group-acad', '#group-courses']
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

    /* SMOOTH-SCROLL (Lenis) — só no desktop/mouse e tier high|medium:
       no toque a rolagem nativa é melhor; em low o lerp constante do
       Lenis compete com o resto. reduced-motion já abortou o boot. */
    if (window.Lenis && !window.matchMedia('(pointer: coarse)').matches && !perfIsLow()) {
      const lenis = new Lenis({
        lerp: perfTier() === 'medium' ? 0.14 : 0.09,
        wheelMultiplier: 1,
        smoothWheel: true,
        touchMultiplier: 0,
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      document.documentElement.classList.add('lenis-on');
      /* expõe pra âncoras do nav rolarem PELO Lenis (senão o
         window.scrollTo({behavior:smooth}) nativo briga com ele) */
      window.lenis = lenis;
    }

    buildHeroIntro();
    buildWires();
    buildLines();
    buildMarquees();
    buildDepth();
    buildMouse();
    buildDynamic();
    bindRebuildHooks();

    /* se o monitor de FPS cair o tier no meio da visita, reconstroi
       a camada dinamica no modo mais leve e mata videos/Lenis. */
    window.addEventListener('perf:degradou', (e) => {
      const para = e.detail && e.detail.para;
      document.querySelectorAll('video.pj-win__img, video.pj-card__img').forEach(v => {
        try {
          v.pause();
          if (para === 'low') v.load();
        } catch (err) {}
      });
      if (para === 'low' && window.lenis) {
        try {
          window.lenis.destroy();
          window.lenis = null;
          document.documentElement.classList.remove('lenis-on');
        } catch (err) {}
      }
      if (document.documentElement.classList.contains('fx-on')) rebuild();
    });

    ScrollTrigger.sort();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
