'use strict';

/* =========================================================
   i18n-static.js
   ---------------------------------------------------------
   Aplica o I18N no HTML gerado, no build: o que o language.js
   faria no navegador (data-i18n, data-i18n-html, data-i18n-attr)
   ja sai pronto no idioma da pagina. Crawler e quem tem JS lento
   nunca veem texto do outro idioma.

   So mexe em elementos simples (texto sem tags filhas); o resto
   o language.js resolve no cliente como sempre.
   ========================================================= */

const pick = (dict, keyPath) => keyPath.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function localizeStatic(html, dict) {
  if (!dict) return html;
  html = html.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/gi, (m, open, tag, key, _t, close) => {
    const v = pick(dict, key);
    return typeof v === 'string' ? open + escText(v) + close : m;
  });
  html = html.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n-html="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/gi, (m, open, tag, key, inner, close) => {
    const v = pick(dict, key);
    return typeof v === 'string' && !new RegExp(`<${tag}\\b`, 'i').test(inner) ? open + v + close : m;
  });
  html = html.replace(/<[a-z][^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/gi, (tag, specs) => {
    specs.split(';').forEach(spec => {
      const [attr, key] = spec.split(':');
      const v = key && pick(dict, key.trim());
      if (typeof v !== 'string') return;
      tag = tag.replace(new RegExp(`(\\s${attr.trim()}=")[^"]*(")`), (mm, a, b) => a + escAttr(v) + b);
    });
    return tag;
  });
  return html;
}

/* rotulos do cabecalho comum (project.html, build-about, build-posts):
   ganham data-i18n-attr pra seguir o idioma da pagina e do seletor */
const HEADER_LABELS = [
  ['aria-label="Language switch"', 'aria-label:a11y.langSwitch'],
  ['aria-label="Language / Idioma"', 'aria-label:a11y.langMenu'],
  ['aria-label="Abrir menu"', 'aria-label:a11y.menuOpen'],
];
function tagHeaderLabels(html) {
  for (const [orig, spec] of HEADER_LABELS) {
    html = html.split(orig).join(`${orig} data-i18n-attr="${spec}"`);
  }
  return html.replace(/(data-i18n-attr="[^"]+")(\s+data-i18n-attr="[^"]+")+/g, '$1');
}

module.exports = { localizeStatic, tagHeaderLabels };
