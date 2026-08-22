'use strict';

/* ============================================================
   PERF TIER — sempre HIGH. Sem degradação automática.
   ============================================================ */

(function () {
  var root = document.documentElement;
  root.dataset.perf = 'high';
  root.dataset.perfMotivo = 'always-on';

  window.podeRodarWebGLPesado = function () { return true; };

  window.perfRenderScale = function (padrao) {
    return typeof padrao === 'number' ? padrao : 1;
  };

  window.perfDegradar = function () {};

  window.perfSetTier = function () { return true; };

  window.perfTier = function () { return 'high'; };

  window.__perf = function () {
    return {
      tier: 'high',
      motivo: 'always-on',
      degradou: 0,
      longTasks: 0,
      cores: navigator.hardwareConcurrency || 'n/d',
      ram: navigator.deviceMemory || 'n/d',
    };
  };
})();
