'use strict';

/* ============================================================
   GPU GATE — decide se a maquina aguenta os fundos WebGL.

   Os dois fundos (linewaves e ferrofluid) rodam shader em rAF
   continuo. Eles ja eram desktop-only, mas desktop LARGO nao
   quer dizer desktop POTENTE: notebook antigo com grafico
   integrado abria os dois e engasgava a pagina inteira.

   Sinais usados (todos padrao, sem lib):
   · hardwareConcurrency -> nucleos logicos de CPU
   · deviceMemory        -> GB de RAM (aproximado, Chromium)
   · prefers-reduced-motion -> respeito explicito do usuario
   · saveData / conexao lenta -> economia declarada

   Conservador de proposito: na duvida (API ausente) DEIXA rodar,
   pra nao punir navegador que simplesmente nao expoe o dado.
   Nada aqui muda layout: os fundos sao camadas decorativas.
   ============================================================ */
function podeRodarWebGLPesado() {
  try {
    const nav = navigator || {};

    // usuario pediu menos movimento: nem liga
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;

    // economia de dados / conexao ruim
    const con = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (con) {
      if (con.saveData) return false;
      if (/^(slow-)?2g$/.test(con.effectiveType || '')) return false;
    }

    // CPU: 4 nucleos ou menos costuma ser maquina fraca ou VM
    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0
        && nav.hardwareConcurrency <= 4) return false;

    // RAM: 4GB ou menos
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0
        && nav.deviceMemory <= 4) return false;

    return true;
  } catch (e) {
    return true;   // na duvida, deixa rodar
  }
}

// exposto no escopo global (os fundos sao <script type="module">, que nao
// veem funcao de outro arquivo classico sem isso)
window.podeRodarWebGLPesado = podeRodarWebGLPesado;
