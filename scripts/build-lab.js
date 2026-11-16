#!/usr/bin/env node
/* =========================================================
   build-lab.js
   Injeta os sites do Lab (lab.bernardoiannini.com) nas listas de
   projetos do js/language.js (EN e PT), entre os marcadores
   LAB:START / LAB:END, para todo o resto do site (home, paginas de
   projeto, sitemaps) enxergar como qualquer outro projeto.

   FONTE: data/lab.json. Rodar de novo substitui o bloco inteiro.
   Depois: node scripts/build-covers.js && node scripts/build-projects.js --all
   ========================================================= */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LANG_FILE = path.join(ROOT, 'js', 'language.js');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'lab.json'), 'utf8'));
const LAB_URL = 'https://lab.bernardoiannini.com/';
const START = '/* LAB:START */';
const END = '/* LAB:END */';

/* topicos montados a partir do que foi lido de cada site */
function topics(s, lang) {
  const pt = lang === 'pt';
  const fonts = s.fonts.length ? s.fonts.join(' + ') : (pt ? 'fontes do sistema' : 'system fonts');
  const libs = s.libs.length ? s.libs.join(', ') : '';
  const out = [];
  out.push({ icon: 'layers', title: pt ? 'A proposta' : 'The pitch', text: s[lang].pitch });
  out.push({ icon: 'palette', title: pt ? 'Tipografia e cor' : 'Type and color',
    text: pt ? `Tipografia em ${fonts}, com a cor de destaque ${s.accent} guiando botões, selos e detalhes.`
             : `Set in ${fonts}, with the ${s.accent} accent driving buttons, badges and details.` });
  out.push({ icon: 'gauge', title: pt ? 'HTML, CSS e JS puros' : 'Plain HTML, CSS and JS',
    text: pt ? `Sem framework e sem build: ${s.sections} seções escritas à mão${libs ? `, com ${libs} no movimento` : ''}.`
             : `No framework and no build step: ${s.sections} hand-written sections${libs ? `, with ${libs} for motion` : ''}.` });
  out.push({ icon: 'globe', title: pt ? 'Responsivo' : 'Responsive',
    text: pt ? 'O layout se reorganiza para o celular em vez de só encolher, com áreas de toque confortáveis.'
             : 'The layout reflows for phones instead of just shrinking, with comfortable touch targets.' });
  return out;
}

function entry(s, lang) {
  const t = s[lang];
  const pt = lang === 'pt';
  return {
    title: `${s.brand} · ${t.kind}`,
    desc: t.desc,
    longDesc: t.long,
    stack: ['HTML5', 'CSS3', 'JavaScript (vanilla)', ...s.libs],
    link: LAB_URL + s.path,
    cover: `img/covers/${s.id}.webp`,
    id: s.id,
    category: 'site',
    featured: false,
    status: pt ? 'no ar' : 'live',
    year: '2026',
    topics: topics(s, lang),
  };
}

function block(lang) {
  const items = DATA.sites.map(s => JSON.stringify(entry(s, lang), null, 2)
    .split('\n').map(l => '        ' + l).join('\n'));
  return `${START}\n${items.join(',\n')}\n        ${END}`;
}

let src = fs.readFileSync(LANG_FILE, 'utf8');
const nl = src.includes('\r\n') ? '\r\n' : '\n';
src = src.replace(/\r\n/g, '\n');

/* remove blocos antigos */
src = src.replace(/,\n\s*\/\* LAB:START \*\/[\s\S]*?\/\* LAB:END \*\//g, '');

/* fim de cada lista: o fechamento logo antes de "contact: {" */
const anchor = /\n        }\n      ]\n    },\n\s*contact: \{/g;
const idx = [...src.matchAll(anchor)].map(m => m.index);
if (idx.length !== 2) throw new Error(`esperava 2 listas de projetos, achei ${idx.length}`);

/* a primeira lista e EN, a segunda PT (mesma ordem do arquivo) */
const langs = ['en', 'pt'];
for (let k = idx.length - 1; k >= 0; k--) {
  const at = idx[k] + '\n        }'.length;
  src = src.slice(0, at) + ',\n        ' + block(langs[k]) + src.slice(at);
}

fs.writeFileSync(LANG_FILE, src.replace(/\n/g, nl));
console.log(`[lab] ${DATA.sites.length} sites injetados em EN e PT`);
