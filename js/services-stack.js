'use strict';

/* =========================================================
   SERVICES v3 — CARDSWAP DECK (scroll-scrubbed)
   Porte vanilla do "CardSwap" (React Bits), adaptado pro projeto:
   os 4 servicos viram uma PILHA 3D em perspectiva, claramente
   empilhada e legivel. A camada (.svc-pile) ganha perspective; cada
   card e posicionado num "slot":
       x = i * DX      (direita)
       y = -i * DY     (sobe)
       z = -i * DZ     (recua)   cards retos (sem skew: texto/icones cravados).
   O card da FRENTE (slot 0) fica maior/legivel; os 3 atras recuam num
   leque 3D visivel pra cima-e-direita.

   REVELACAO PELO SCROLL (JOGADOS): UMA timeline mestra encadeia N
   "arremessos" — o card da frente e JOGADO pra uma area diferente da
   tela (grade 2x2 com jitter + giro variado = casual, "jogado"),
   encolhe e FICA la, enquanto os de tras promovem um slot (a fila
   avanca). No fim os N cards ficam espalhados, todos visiveis de uma
   vez. Tudo SCRUBADO por um ScrollTrigger com pin sobre servicos: rolar
   pra baixo joga os cards; pra cima reverte (voltam pra fila).

   DONO DO TRANSFORM: esta timeline e a UNICA que escreve transform em
   .svc-card (x/y/z/rotation/scale/skew/xPercent/yPercent). O tilt de ponteiro
   (svc-hover.js) escreve --svc-rx/--svc-ry lidos pelo .svc-card__depth
   (outro elemento) e o translateZ 3D das pecas (icone/tag/chips/CTA)
   vive nas camadas internas: nada disso pisa no transform do card.
   O z-index de pintura e DERIVADO do z de cada card a cada frame
   (nao ha keyframe de z-index — reversivel no scrub sem flicker).
   A classe .is-top marca o card da frente (menor distancia ao slot 0):
   o hover 3D-lift + tilt so valem nele; os recuados nao levantam.

   DEGRADA: toque / prefers-reduced-motion / <=820px / sem GSAP ->
   sem pin, sem 3D; lista vertical estatica legivel (.is-static no CSS).
   Reconstroi na troca de idioma (services.js reescreve #servicesGrid)
   via MutationObserver. CSS par: bloco "SERVICES — CARDSWAP DECK".
   ========================================================= */
(function () {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');
  const narrow = window.matchMedia('(max-width: 820px)');

  /* ---- geometria do leque (px absolutos: scrub deterministico) ---- */
  const DX = 55;              // passo horizontal por slot (direita)
  const DY = 58;              // passo vertical por slot (sobe)
  const DZ = DX * 1.5;        // passo de profundidade por slot (recua)
  /* SKEW 0: o cisalhamento re-rasterizava os SVGs (icones/watermark) a
     cada subpixel do scrub = o "tremor" dos icones. Cards retos = texto
     e icones cravados; o leque le a profundidade pela perspectiva x/y/z. */
  const SKEW = 0;

  /* Swap = o card da FRENTE RECUA direto pro fundo (contido no deck),
     encolhendo, enquanto os de tras promovem um slot. SEM queda longa pra
     fora (o modelo "cai 340px" virava um card gigante solto no rodape).
     Folga curta entre swaps: continuo, sem zona morta seguida de arrancada. */
  const DMOVE = 0.85;         // duracao de um arremesso (mais longo = mais liso)
  const PROMOTE_STAGGER = 0;  // sem stagger: nao sobrepoe promotes entre arremessos
  const REST = 0;             // SEM descanso: arremessos EMENDADOS -> a animacao
                              // nunca para (era o que travava alguns frames de scroll)
  const SWAP_SPAN = DMOVE + REST;
  const LEAD = 0.05;          // beat minimo antes do 1o
  const TAIL = 0.15;          // assentamento minimo depois do ultimo
  const EASE = 'none';        // promote LINEAR: velocidade constante, sem parar nas pontas

  const slotX = i => i * DX;
  const slotY = i => -i * DY;
  const slotZ = i => -i * DZ;

  let triggers = [];
  let tl = null;
  let rebuildTimer = 0;

  function canStack() {
    return !!(window.gsap && window.ScrollTrigger) &&
      !reduce.matches && !coarse.matches && !narrow.matches;
  }

  function killTriggers() {
    triggers.forEach(t => { try { if (t && t.kill) t.kill(); } catch (e) { /* DOM ja trocado */ } });
    triggers = [];
    if (tl) { try { tl.kill(); } catch (e) {} tl = null; }
  }

  function clearInline(cards) {
    if (window.gsap) {
      window.gsap.set(cards, {
        clearProps: 'transform,filter,opacity,zIndex,x,y,z,scale,rotation,skewY,xPercent,yPercent,--svc-veil',
      });
    }
    cards.forEach(c => {
      c.style.transform = '';
      c.style.filter = '';
      c.style.opacity = '';
      c.style.zIndex = '';
      c.classList.remove('is-top', 'is-out');
    });
  }

  function build() {
    killTriggers();
    const pile = grid.querySelector('.svc-pile');
    const cards = pile
      ? Array.prototype.slice.call(pile.querySelectorAll('.svc-card'))
      : Array.prototype.slice.call(grid.querySelectorAll('.svc-card'));
    clearInline(cards);

    if (!canStack() || !pile || cards.length < 2) {
      grid.classList.remove('is-pile');
      grid.classList.add('is-static');   // CSS: lista vertical legivel
      return;
    }
    grid.classList.remove('is-static');
    grid.classList.add('is-pile');

    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    const N = cards.length;

    /* PINTURA (z-index): rank por (z + peso do y), so reescrito quando muda
       -> discreto/estavel, sem flicker no scrub. FRONT (is-top): NAO medido
       pela posicao quadro a quadro (isso oscilava quando o deck parava no
       MEIO de um swap, com dois cards perto do slot 0, e piscava/limpava o
       hover). Agora e DETERMINISTICO pelo PROGRESSO da timeline: depois de k
       swaps, o card da frente e cards[k]. Histerese de 0.12 alem do meio do
       swap trava o front no repouso mesmo com o jitter de scroll do Lenis. */
    let lastZi = [], lastFront = -1, lastTop = -2;
    function updateStack() {
      const st = cards.map(c => ({
        y: Number(gsap.getProperty(c, 'y')) || 0,
        z: Number(gsap.getProperty(c, 'z')) || 0,
      }));
      const byZ = cards.map((_, i) => i)
        .sort((a, b) => (st[b].z + st[b].y * 0.02) - (st[a].z + st[a].y * 0.02));
      byZ.forEach((idx, rank) => {
        const zi = 100 + (N - rank) * 10;
        if (lastZi[idx] !== zi) { cards[idx].style.zIndex = String(zi); lastZi[idx] = zi; }
      });
      const p = tl ? tl.progress() : 0;
      const D = tl ? tl.duration() : 1;
      const now = p * D;   // tempo atual na timeline

      // IS-OUT: o card i "pousou" quando seu arremesso terminou -> vira
      // INTERATIVO (pointer-events + hover 3D lift), acumulando ate o fim.
      // No FIM todos sao is-out => o hover 3D funciona em TODOS, nao so no
      // ultimo. (classList.toggle com force e no-op se ja esta no estado.)
      cards.forEach((c, i) => c.classList.toggle('is-out', now >= LEAD + i * SWAP_SPAN + DMOVE));

      // front pelo progresso (histerese), sempre 0..N-1
      let raw = (now - LEAD) / SWAP_SPAN;
      raw = Math.max(0, Math.min(N - 1, raw));
      let front = (lastFront >= 0) ? lastFront : Math.round(raw);
      if (raw > front + 0.62) front = Math.min(N - 1, Math.round(raw));       // avancou
      else if (raw < front - 0.62) front = Math.max(0, Math.round(raw));      // voltou
      lastFront = front;

      // IS-TOP = o front (card grande no centro, sendo jogado). Mas quando o
      // front JA pousou (fim da animacao), ninguem e "front": some o is-top,
      // todos ficam is-out equivalentes (sem borda verde especial num so).
      const top = (now >= LEAD + front * SWAP_SPAN + DMOVE) ? -1 : front;
      if (top !== lastTop) {
        cards.forEach((c, i) => {
          c.classList.toggle('is-top', i === top);
          if (i !== top) {
            c.classList.remove('svc-hot');
            c.style.setProperty('--svc-rx', '0deg');
            c.style.setProperty('--svc-ry', '0deg');
          }
        });
        lastTop = top;
      }
    }

    /* posicao inicial: card i no slot i (leque em repouso) */
    cards.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50, yPercent: -50,
        x: slotX(i), y: slotY(i), z: slotZ(i),
        skewY: SKEW, transformOrigin: 'center center', force3D: true,
      });
    });
    updateStack();

    /* ---- destino de cada arremesso: os cards sao JOGADOS pra areas diferentes
       da tela (grade 2x2 com jitter deterministico + giro variado = casual,
       "jogado"), encolhem e ficam. No fim, todos espalhados e visiveis. z
       crescente = ordem de arremesso por cima. ---- */
    /* ---- RESPONSIVO: mede o card REAL (offsetW/H ignoram o transform =
       tamanho natural em scale 1) e escolhe SCALE + espacamento que fazem o
       grid 2x2 caber em QUALQUER tela, sem estourar as bordas nem invadir a
       nav do topo. Antes o SCALE era fixo -> em notebook os cards passavam da
       tela e batiam na nav. ---- */
    const VW = window.innerWidth, VH = window.innerHeight;
    const cardW = Math.max.apply(null, cards.map(c => c.offsetWidth).concat(300));
    const cardH = Math.max.apply(null, cards.map(c => c.offsetHeight).concat(300));
    /* zona da nav flutuante no topo (mede o <header> se existir) e respiro */
    const hdr = document.querySelector('header');
    const NAV = hdr ? Math.min(170, Math.max(96, hdr.getBoundingClientRect().bottom + 22)) : 116;
    const GAP = 26;
    const cols = Math.ceil(Math.sqrt(N));             // 2 pra N=4
    const rows = Math.ceil(N / cols);                 // 2 pra N=4
    /* SCALE que cabe as LINHAS na altura (descontando a nav) e as COLUNAS na
       largura. Teto 0.82 (nao gigante em telas enormes), piso 0.42 (legivel). */
    const fitH = (VH - NAV - 2 * GAP) / ((rows + 0.1) * cardH);
    const fitW = (VW - 2 * GAP) / ((cols * 0.66 + 0.34) * cardW);
    const SCALE = Math.max(0.42, Math.min(0.82, fitH, fitW));
    /* meia-extensao do card JA girado (folga p/ nao vazar) */
    const HX = (SCALE * cardW / 2) * 1.12, HY = (SCALE * cardH / 2) * 1.12;
    const SPREAD_X = 0.5;    // horizontal: colunas proximas
    const SPREAD_Y = 0.95;   // vertical: usa o range disponivel abaixo da nav
    const OFFY = NAV / 2;    // desce o cluster p/ centrar ABAIXO da nav
    const SX = Math.max(30, (VW / 2 - HX - GAP) * SPREAD_X);
    const SY = Math.max(20, ((VH - NAV) / 2 - HY - GAP) * SPREAD_Y);
    const scatter = cards.map((_, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = cols > 1 ? (col / (cols - 1)) * 2 - 1 : 0;   // -1 .. 1
      const cy = rows > 1 ? (row / (rows - 1)) * 2 - 1 : 0;   // -1 .. 1
      return {
        x: cx * SX,                                    // grade ALINHADA (sem jitter)
        y: cy * SY + OFFY,                             // + OFFY: nunca invade a nav
        z: 40 + i * 16,                                // a frente da fila + ordem de pintura
        // giro direcional: esquerda p/ esquerda, direita um pouco MAIS p/ direita
        rot: cx < 0 ? cx * 7 : cx * 10,
      };
    });

    /* ---- timeline mestra: N arremessos sequenciais (fromTo absoluto =
       100% deterministica no scrub/refresh) ---- */
    tl = gsap.timeline({ paused: true, onUpdate: updateStack });
    let order = cards.map((_, i) => i);   // order[slot] = indice do card

    for (let s = 0; s < N; s++) {
      const base = LEAD + s * SWAP_SPAN;
      const front = order[0];
      const rest = order.slice(1);
      const F = cards[front];
      const t = scatter[s];               // area jogada do s-esimo (= card `front`)

      // JOGA o card da frente pro seu lugar: voa (x,y), encolhe e gira. Como o
      // proximo arremesso ja emenda (REST 0), sempre ha um card em movimento ->
      // fluido. power2.out = partida rapida (cobre a emenda) + assentamento liso.
      tl.fromTo(F,
        { x: slotX(0), y: slotY(0), z: slotZ(0), rotation: 0, scale: 1 },
        { x: t.x, y: t.y, z: t.z, rotation: t.rot, scale: SCALE,
          duration: DMOVE, ease: 'power2.out', immediateRender: false },
        base);

      // os de tras PROMOVEM um slot pra frente (a fila avanca), em leve stagger
      rest.forEach((cardIdx, i) => {
        tl.fromTo(cards[cardIdx],
          { x: slotX(i + 1), y: slotY(i + 1), z: slotZ(i + 1) },
          { x: slotX(i), y: slotY(i), z: slotZ(i),
            duration: DMOVE, ease: EASE, immediateRender: false },
          base + i * PROMOTE_STAGGER);
      });

      order = rest;   // card jogado SAI da fila (nao cicla pro fundo)
    }

    // folga final: o leque assenta antes de soltar o pin
    tl.to({}, { duration: TAIL });

    /* pin + scrub: rolar a regiao avanca/reverte os swaps. start 'top top':
       ao encaixar, o palco (100svh, cards centrados) fica centrado na
       viewport. anticipatePin + invalidateOnRefresh: pin liso com Lenis.
       scrub 1 amortece a rodinha (deslize continuo, nao degraus).
       SEM snap: o snap do ScrollTrigger chama scrollTo PROPRIO e briga com
       o Lenis (a "travada" ao soltar o scroll); o scrub suave ja assenta. */
    // ~0.6 viewport de scroll por unidade de timeline: mais scroll por
    // movimento = desenrola mais GRADUAL/liso (ritmo cinematografico)
    const pinLen = () => Math.round(window.innerHeight * tl.duration() * 0.6);
    const st = ST.create({
      trigger: pile,
      pin: pile,
      start: 'top top',
      end: () => '+=' + pinLen(),
      scrub: 1.2,   // amortece mais a rodinha -> deslize continuo e suave
      animation: tl,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: updateStack,
    });
    triggers.push(st);

    ST.refresh();
  }

  const schedule = () => {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(build, 180);
  };

  // Rebuild na troca de idioma: services.js dispara 'svc:rendered' depois de
  // reescrever os cards. NAO usamos MutationObserver porque o pin do
  // ScrollTrigger cria um .pin-spacer (mutacao de childList) que dispararia
  // um LOOP de rebuild -> resetava a timeline (front=0), dava flicker e
  // limpava o hover a cada ~180ms.
  document.addEventListener('svc:rendered', schedule);

  // Rebuild quando o modo muda (reduced-motion / toque / largura)
  [reduce, coarse, narrow].forEach(mq => {
    if (mq.addEventListener) mq.addEventListener('change', schedule);
    else if (mq.addListener) mq.addListener(schedule); // Safari antigo
  });

  // Rebuild (debounced) no resize: recalcula SCALE/espacamento responsivos
  // pra o grid caber ao mudar o tamanho da janela (ex.: notebook -> monitor).
  window.addEventListener('resize', schedule, { passive: true });

  function boot() { build(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
