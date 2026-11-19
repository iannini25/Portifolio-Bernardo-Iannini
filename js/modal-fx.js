'use strict';

/* =========================================================
   MODAL-FX  -  abertura "expand-from-trigger" universal
   ---------------------------------------------------------
   Toda vez que um <dialog> abre via showModal(), o card cresce
   a partir do elemento que disparou a abertura (o "trigger"),
   sobre um backdrop borrado. Efeito inspirado no Expandable
   ProfileCard do React, calibrado discreto e premium.

   Funciona de forma UNIVERSAL, sem reescrever contact.js /
   experience.js / post-static.js: faz monkey-patch de
   HTMLDialogElement.prototype.showModal e rastreia o ultimo
   elemento que o usuario ativou.

   Regras:
   - Respeita prefers-reduced-motion (pula o morph, mantem o blur).
   - Degrada com elegancia se window.gsap nao existir (so o blur).
   - So melhora a ABERTURA. Nunca toca nas animacoes de fechamento.
   ========================================================= */

(function () {
  var DialogEl = window.HTMLDialogElement;
  if (!DialogEl || !DialogEl.prototype ||
      typeof DialogEl.prototype.showModal !== 'function') {
    return;
  }

  var proto = DialogEl.prototype;
  if (proto.showModal.__modalFx) return; // patch idempotente

  var TRIGGER_MAX_AGE = 800; // ms: alem disso, o trigger nao conta como "fresco"

  function now() {
    return (typeof performance !== 'undefined' && performance.now)
      ? performance.now()
      : Date.now();
  }

  /* ---------- rastreio do trigger (captura global) ---------- */
  var lastTrigger = { el: null, t: -Infinity };
  function rememberTrigger(ev) {
    if (!ev || !ev.target) return;
    lastTrigger = { el: ev.target, t: now() };
  }
  document.addEventListener('pointerdown', rememberTrigger, true);
  document.addEventListener('click', rememberTrigger, true);

  /* ---------- helpers ---------- */
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // Escolhe o "frame": o card/imagem visivel que deve crescer.
  function pickFrame(dialog) {
    return dialog.querySelector('[data-modal-frame]')
        || dialog.querySelector('.ctm__shell, .proj-modal-frame, .cert-content, .post-lightbox-frame')
        || dialog.firstElementChild
        || dialog;
  }

  // Retorna o elemento-trigger se ainda for fresco e estiver no DOM.
  function resolveTrigger() {
    var el = lastTrigger.el;
    if (!el || !el.isConnected) return null;
    if (now() - lastTrigger.t > TRIGGER_MAX_AGE) return null;
    // Sobe ate o alvo "clicavel" mais proximo para um retangulo limpo
    // (o clique costuma cair num icone/label interno).
    var clickable = el.closest && el.closest('button, a, [role="button"], label, summary');
    return clickable || el;
  }

  function onScreen(r) {
    return !!r && r.width > 0 && r.height > 0 &&
      r.bottom > 0 && r.right > 0 &&
      r.top < (window.innerHeight || document.documentElement.clientHeight) &&
      r.left < (window.innerWidth || document.documentElement.clientWidth);
  }

  /* ---------- limpeza no fechamento ---------- */
  var wiredClose = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;
  function wireClose(dialog, frame) {
    if (wiredClose) {
      if (wiredClose.has(dialog)) return;
      wiredClose.add(dialog);
    }
    dialog.addEventListener('close', function () {
      dialog.classList.remove('modal-fx-open', 'modal-fx-morph');
      if (window.gsap && frame) window.gsap.killTweensOf(frame);
    });
  }

  /* ---------- o morph de abertura ---------- */
  function runMorph(dialog) {
    var frame = pickFrame(dialog);
    wireClose(dialog, frame);

    // Classe base: liga o backdrop borrado (CSS), sempre.
    dialog.classList.add('modal-fx-open');

    var gsap = window.gsap;
    if (!gsap) return; // degrada: backdrop borrado estatico

    // A classe .modal-fx-morph zera (via CSS !important) a animacao de
    // entrada propria do frame, para que ela nao brigue com o GSAP.
    // Os staggers internos (.ctm__channel, .ctm__field) NAO sao tocados.
    dialog.classList.add('modal-fx-morph');
    gsap.killTweensOf(frame);

    // Com a entrada CSS ja neutralizada, este rect e a posicao de repouso.
    var fr = frame.getBoundingClientRect();
    var frameSized = fr.width > 0 && fr.height > 0;

    var trigger = resolveTrigger();
    var tr = trigger ? trigger.getBoundingClientRect() : null;

    var base = {
      autoAlpha: 0,
      duration: 0.5,
      ease: 'power3.out',
      transformOrigin: 'center center',
      clearProps: 'transform,opacity,visibility'
    };

    // So faz o morph "a partir do trigger" quando da pra medir os dois lados.
    // (Frames com imagem lazy podem abrir sem tamanho ainda; nesses casos
    // caimos no scale suave do centro, que nao depende do tamanho do frame.)
    if (trigger && onScreen(tr) && frameSized) {
      // Distancia entre o centro do trigger e o centro do frame.
      var dx = (tr.left + tr.width / 2) - (fr.left + fr.width / 2);
      var dy = (tr.top + tr.height / 2) - (fr.top + fr.height / 2);
      // Escala inicial ~ tamanho do trigger / tamanho do frame (uniforme,
      // discreta). Math.max evita comecos absurdamente minusculos.
      var scale = clamp(Math.max(tr.width / fr.width, tr.height / fr.height), 0.08, 0.9);
      base.x = dx;
      base.y = dy;
      base.scale = scale;
      gsap.from(frame, base);
    } else {
      // Sem trigger fresco/visivel (ou frame ainda sem tamanho):
      // leve escala + fade a partir do centro.
      base.scale = 0.92;
      gsap.from(frame, base);
    }
  }

  /* ---------- monkey-patch de showModal ---------- */
  var originalShowModal = proto.showModal;
  function showModal() {
    var ret = originalShowModal.apply(this, arguments);
    // O morph nunca pode derrubar a abertura do dialog.
    try { runMorph(this); } catch (e) { /* no-op */ }
    return ret;
  }
  showModal.__modalFx = true;
  proto.showModal = showModal;
})();
