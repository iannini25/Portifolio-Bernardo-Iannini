'use strict';

/* ============================================================
   PERF TIER — camada de adaptive loading.

   Substitui o js/gpu-gate.js mantendo compatibilidade TOTAL com
   ele: continua expondo window.podeRodarWebGLPesado(), entao os
   dois modulos de fundo (linewaves-bg.js e ferrofluid-bg.js)
   funcionam sem tocar numa linha deles.

   A diferenca pro gpu-gate: em vez de uma decisao BINARIA
   ("roda WebGL ou nao"), aqui existem tres niveis e a decisao
   pode ser REVISTA durante a visita, se a maquina comecar a
   sofrer de verdade.

   PRIVACIDADE: nada aqui e enviado pra lugar nenhum. As APIs
   usadas (deviceMemory, hardwareConcurrency, connection) sao
   lidas e descartadas na mesma funcao. O nivel escolhido fica
   so no sessionStorage do proprio usuario.
   ============================================================ */

(function () {

  var root = document.documentElement;
  var TIERS = ['low', 'medium', 'high'];

  /* ==========================================================
     1. CLASSIFICACAO INICIAL
     ========================================================== */

  function classificar() {
    try {
      var nav = navigator || {};

      /* preferencia explicita do usuario vence tudo. Se ele pediu
         menos movimento, nao e questao de performance — e de
         respeito. */
      if (window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return { tier: 'low', motivo: 'reduced-motion' };
      }

      /* escolha manual anterior do usuario. sessionStorage e nao
         localStorage de proposito. */
      try {
        var salvo = sessionStorage.getItem('perf-tier');
        if (salvo && TIERS.indexOf(salvo) !== -1) {
          return { tier: salvo, motivo: 'escolha-do-usuario' };
        }
      } catch (e) { /* modo privado bloqueia storage — segue o baile */ }

      var con = nav.connection || nav.mozConnection || nav.webkitConnection;

      /* economia de dados declarada: o usuario PEDIU pra gastar menos.
         Isso e um pedido, nao uma estimativa. */
      if (con && con.saveData) {
        return { tier: 'low', motivo: 'save-data' };
      }
      if (con && /^(slow-)?2g$/.test(con.effectiveType || '')) {
        return { tier: 'low', motivo: 'rede-2g' };
      }

      var cores  = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 0;
      var ram    = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 0;
      var rede3g = con ? /^3g$/.test(con.effectiveType || '') : false;

      /* Maquina claramente fraca. Os limiares sao os MESMOS que o
         gpu-gate ja usava — mantidos de proposito pra decisao nao
         mudar de comportamento em quem ja visitava o site. */
      if ((cores > 0 && cores <= 4) || (ram > 0 && ram <= 4)) {
        return { tier: 'low', motivo: 'hardware-fraco' };
      }

      /* Zona cinzenta: nem fraco nem folgado.
         RAM ficou DE FORA deste degrau de proposito: o Chrome limita
         navigator.deviceMemory a 8 por especificacao, entao "ram <= 8"
         seria verdadeiro em QUALQUER maquina (ate num desktop de 64GB)
         e jogaria o planeta inteiro em medium. O sinal de RAM continua
         valendo no degrau de cima (<= 4GB -> low), onde e informativo. */
      if ((cores > 0 && cores <= 8) || rede3g) {
        return { tier: 'medium', motivo: 'hardware-mediano' };
      }

      /* API ausente (Safari e Firefox nao expoem deviceMemory) cai
         aqui. Conservador ao contrario: na duvida DEIXA rodar, pra
         nao punir navegador que so nao conta o que tem. O monitor
         de FPS la embaixo pega o caso de estar errado. */
      return { tier: 'high', motivo: cores || ram ? 'hardware-ok' : 'sem-sinais' };

    } catch (e) {
      return { tier: 'high', motivo: 'erro-na-deteccao' };
    }
  }

  var inicial = classificar();
  root.dataset.perf = inicial.tier;
  root.dataset.perfMotivo = inicial.motivo;

  /* ==========================================================
     2. COMPATIBILIDADE COM O gpu-gate.js

     linewaves-bg.js e ferrofluid-bg.js sao <script type="module">
     e chamam window.podeRodarWebGLPesado(). Mantendo essa funcao
     com a mesma assinatura, os dois arquivos continuam intactos.
     ========================================================== */

  window.podeRodarWebGLPesado = function () {
    return root.dataset.perf !== 'low';
  };

  /* Escala de render sugerida pros shaders. Se um dia quiser que o
     ferrofluid leia isso, e so trocar o renderScale fixo por
     window.perfRenderScale(). Enquanto nao trocar, nao faz nada —
     ta aqui pronto, sem obrigar refactor. */
  window.perfRenderScale = function (padrao) {
    var base = typeof padrao === 'number' ? padrao : 1;
    var t = root.dataset.perf;
    if (t === 'medium') return base * 0.65;   // 42% dos pixels
    if (t === 'low')    return base * 0.45;
    return base;
  };

  /* ==========================================================
     3. DEGRADACAO — um degrau por vez, sem recarregar
     ========================================================== */

  var jaDegradou = false;

  function degradar(motivo) {
    var atual = root.dataset.perf;
    var i = TIERS.indexOf(atual);
    if (i <= 0) return;                       // ja esta em 'low'
    if (jaDegradou) return;                   // no maximo UM degrau por visita

    jaDegradou = true;
    var novo = TIERS[i - 1];
    root.dataset.perf = novo;
    root.dataset.perfMotivo = motivo;

    /* pausa os previews de video que estiverem tocando. Eles ja tem
       poster (a .webp da capa), entao a imagem na tela continua
       sendo exatamente a mesma — so para de decodificar. */
    if (novo === 'low') {
      var vids = document.querySelectorAll('video[src], video[data-pc-video]');
      for (var k = 0; k < vids.length; k++) {
        try { vids[k].pause(); } catch (e) {}
      }
    }

    window.dispatchEvent(new CustomEvent('perf:degradou', {
      detail: { de: atual, para: novo, motivo: motivo }
    }));
  }

  window.perfDegradar = degradar;

  /* ==========================================================
     4. MONITOR LEVE — long tasks

     'longtask' = tarefa que segurou a main thread por mais de
     50ms. Uma so pode ser o proprio carregamento. Tres seguidas
     depois da pagina pronta e sintoma real.
     ========================================================== */

  var longTasks = 0;
  var observador = null;

  function ligarObservadorLongTask() {
    if (!('PerformanceObserver' in window)) return;
    try {
      observador = new PerformanceObserver(function (list) {
        longTasks += list.getEntries().length;
        if (longTasks >= 3) {
          degradar('long-tasks');
          desligarMonitores();
        }
      });
      observador.observe({ type: 'longtask', buffered: false });
    } catch (e) {
      /* navegador sem suporte ao tipo 'longtask' (Safari). Sem drama:
         o monitor de FPS abaixo cobre o mesmo sintoma. */
    }
  }

  /* ==========================================================
     5. MONITOR LEVE — FPS

     Nao e benchmark. E so contar frames por 3 segundos. O custo de
     um requestAnimationFrame vazio e proximo de zero, e ele desliga
     sozinho depois de decidir.

     Mede so DEPOIS do load + um respiro de 2s, porque durante o
     carregamento todo site fica abaixo de 60fps e isso nao diz nada
     sobre a maquina.
     ========================================================== */

  var rafId = null;

  function medirFPS() {
    var frames = 0;
    var inicio = 0;
    var JANELA = 3000;
    var PISO   = 32;      // abaixo disso a rolagem ja "arrasta" visivelmente

    function frame(agora) {
      if (!inicio) inicio = agora;
      frames++;

      if (agora - inicio >= JANELA) {
        var fps = frames / ((agora - inicio) / 1000);
        if (fps < PISO) degradar('fps-baixo');
        desligarMonitores();
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
  }

  function desligarMonitores() {
    if (observador) { try { observador.disconnect(); } catch (e) {} observador = null; }
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* aba escondida nao renderiza: medir la daria FPS falso-baixo e
     degradaria o site sem motivo. */
  function comecarMonitoramento() {
    if (root.dataset.perf === 'low') return;      // ja esta no minimo
    if (document.visibilityState === 'hidden') return;

    ligarObservadorLongTask();
    setTimeout(function () {
      if (document.visibilityState === 'visible') medirFPS();
    }, 2000);

    /* trava de seguranca: se nada decidiu em 20s, desliga tudo. */
    setTimeout(desligarMonitores, 20000);
  }

  if (document.readyState === 'complete') comecarMonitoramento();
  else window.addEventListener('load', comecarMonitoramento, { once: true });

  /* ==========================================================
     6. CONTROLE MANUAL

     Quem sabe mais sobre a maquina do usuario e o usuario.

        window.perfSetTier('high' | 'medium' | 'low')

     Grava no sessionStorage e recarrega — recarregar aqui e ok
     porque foi o usuario que PEDIU a mudanca, entao ele espera que
     algo aconteca. (Degradacao automatica nunca recarrega.)
     ========================================================== */

  window.perfSetTier = function (tier) {
    if (TIERS.indexOf(tier) === -1) return false;
    try { sessionStorage.setItem('perf-tier', tier); } catch (e) {}
    location.reload();
    return true;
  };

  window.perfTier = function () { return root.dataset.perf; };

  /* debug: abra o console e rode  __perf() */
  window.__perf = function () {
    return {
      tier: root.dataset.perf,
      motivo: root.dataset.perfMotivo,
      degradou: jaDegradou,
      longTasks: longTasks,
      cores: navigator.hardwareConcurrency || 'n/d',
      ram: navigator.deviceMemory || 'n/d'
    };
  };

})();
