/* ============================================================
   IMG SKELETON — placeholder so quando a imagem DEMORA.

   Imagens que importam (capas de projeto, galerias, capas do blog,
   fotos dos posts) ganham, enquanto nao chegam, um bloco com brilho
   no formato exato da propria moldura. Em conexao boa ninguem ve:
   o brilho so aparece depois de 200ms sem a imagem. Quando ela
   chega (ou falha), o skeleton some com fade.

   Cobre tambem o que e renderizado depois (lista de projetos, blog)
   via MutationObserver. Autocontido: traz o proprio CSS.
   ============================================================ */
(function () {
  var SEL = [
    '.ps-frame__view img',                         // home: capas dos projetos
    '.cs-win img', '.cs-mkt__btn img', '.cs-gal__btn img',
    '.cs-other__img img', '.cs-app__screens img',  // paginas de projeto
    '.blog-post-cover img',                        // blog: capas (vem do Supabase)
    '.post-body img', '.post-page-hero img', '.post-related-card-cover img' // posts
  ].join(',');

  var css = document.createElement('style');
  css.id = 'img-skeleton-css';
  css.textContent =
    '.sk-host{position:relative}' +
    '.sk-shim{position:absolute;inset:0;z-index:2;pointer-events:none;border-radius:inherit;opacity:0;' +
      'background:linear-gradient(100deg,rgba(255,255,255,.035) 40%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.035) 60%) 0 0/200% 100%,#0e1511;' +
      'animation:sk-show .3s ease .2s forwards,sk-shine 1.4s linear .2s infinite;transition:opacity .35s ease}' +
    '.sk-shim.is-done{opacity:0!important;animation:none}' +
    '@keyframes sk-show{to{opacity:1}}' +
    '@keyframes sk-shine{from{background-position:150% 0,0 0}to{background-position:-50% 0,0 0}}';
  document.head.appendChild(css);

  function hostOf(img) {
    var pic = img.parentElement && img.parentElement.tagName === 'PICTURE' ? img.parentElement : null;
    return (pic || img).parentElement;
  }

  function watch(img) {
    if (img.dataset.sk) return;
    img.dataset.sk = '1';
    if (img.complete && img.naturalWidth) return;        // ja carregou: nada a fazer
    var host = hostOf(img);
    if (!host) return;
    if (getComputedStyle(host).position === 'static') host.classList.add('sk-host');
    var shim = document.createElement('span');
    shim.className = 'sk-shim';
    shim.setAttribute('aria-hidden', 'true');
    host.appendChild(shim);
    var done = function () {
      shim.classList.add('is-done');
      setTimeout(function () { if (shim.parentNode) shim.parentNode.removeChild(shim); }, 400);
    };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }

  function scan(root) {
    if (!root.querySelectorAll) return;
    if (root.matches && root.matches(SEL)) watch(root);
    root.querySelectorAll(SEL).forEach(watch);
  }

  function start() {
    scan(document);
    var queued = [];
    var raf = 0;
    new MutationObserver(function (list) {
      list.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) queued.push(n); }); });
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; queued.splice(0).forEach(scan); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
