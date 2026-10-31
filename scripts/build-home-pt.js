#!/usr/bin/env node
'use strict';

/* =========================================================
   build-home-pt.js
   ---------------------------------------------------------
   Gera a home em portugues a partir do index.html (ingles):

     en  ->  /         (index.html, fonte da verdade)
     pt  ->  /pt       (pt/index.html, gerado aqui)

   POR QUE
   A home era uma URL so, em ingles, trocando o idioma no
   cliente. O Google so via a versao em ingles e nao tinha
   como mostrar a versao certa por pais. Com duas URLs e
   hreflang, ele mostra /pt pra quem busca em portugues e /
   pro resto; o middleware.js faz o mesmo com o visitante
   (pelo pais do IP ou pela escolha salva).

   O que muda no arquivo gerado:
     - <html lang>, title, description, og/twitter, canonical
     - idioma fixado em 'pt' (mesmo esquema das paginas de projeto)
     - textos com data-i18n ja saem em portugues no HTML
       (crawler que nao roda JS le portugues)
     - caminhos relativos viram absolutos (a pagina mora em /pt)
   ========================================================= */

const fs   = require('fs');
const path = require('path');
const { loadI18N, SITE_URL } = require('./build-projects.js');

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'pt', 'index.html');

const META = {
  title: 'Bernardo Iannini · Desenvolvedor Full Stack &amp; AI Designer',
  description: 'Bernardo Iannini é desenvolvedor Full Stack e AI Designer em Belo Horizonte, criando sistemas completos da arquitetura à produção: SaaS, fintech, ERPs e IA.',
  ogDescription: 'Portfólio de Bernardo Iannini, desenvolvedor Full Stack e AI Designer de Belo Horizonte: projetos, serviços, experiência e blog.',
  twDescription: 'Projetos, serviços, experiência e blog de Bernardo Iannini, desenvolvedor Full Stack de Belo Horizonte.',
};

const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* troca exatamente uma ocorrencia; se o index mudar e o trecho sumir,
   o build quebra alto em vez de gerar uma pagina meio traduzida */
function swap(s, from, to) {
  if (!s.includes(from)) throw new Error('build-home-pt: trecho nao encontrado: ' + String(from).slice(0, 80));
  return s.replace(from, to);
}

function pick(dict, keyPath) {
  return keyPath.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
}

function build() {
  const I18N = loadI18N();
  const pt = I18N.pt;
  let s = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  s = swap(s, '<html lang="en">', '<html lang="pt-BR">');
  s = s.replace(/<title>[^<]*<\/title>/, `<title>${META.title}</title>`);
  s = s.replace(/(<meta name="description" content=")[^"]*/, `$1${META.description}`);
  s = s.replace(/(<meta property="og:title" content=")[^"]*/, `$1${META.title}`);
  s = s.replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${META.title}`);
  s = s.replace(/(<meta property="og:description" content=")[^"]*/, `$1${META.ogDescription}`);
  s = s.replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${META.twDescription}`);
  s = swap(s, `<link rel="canonical" href="${SITE_URL}/" />`, `<link rel="canonical" href="${SITE_URL}/pt" />`);
  s = swap(s, `<meta property="og:url" content="${SITE_URL}/" />`, `<meta property="og:url" content="${SITE_URL}/pt" />`);
  s = swap(s, '<meta property="og:locale" content="en_US" />', '<meta property="og:locale" content="pt_BR" />');
  s = swap(s, '<meta property="og:locale:alternate" content="pt_BR" />', '<meta property="og:locale:alternate" content="en_US" />');
  s = swap(s, "/* idioma = ROTA (/ = en, /pt = pt)", "/* idioma = ROTA (/ = en, /pt = pt) - arquivo GERADO por scripts/build-home-pt.js, edite o index.html");
  s = swap(s, "localStorage.setItem('lang', 'en')", "localStorage.setItem('lang', 'pt')");

  /* JSON-LD: a WebPage desta URL e a versao pt */
  s = swap(s, `"@id": "${SITE_URL}/#home",\n      "url": "${SITE_URL}/",`, `"@id": "${SITE_URL}/pt#home",\n      "url": "${SITE_URL}/pt",`);
  s = swap(s, '"inLanguage": "en",', '"inLanguage": "pt-BR",');

  /* textos estaticos ja em portugues (so elementos sem filhos) */
  s = s.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/gi, (m, open, tag, key, _txt, close) => {
    const v = pick(pt, key);
    return typeof v === 'string' ? open + escText(v) + close : m;
  });
  s = s.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n-html="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/gi, (m, open, tag, key, inner, close) => {
    const v = pick(pt, key);
    return typeof v === 'string' && !/<\2\b/i.test(inner) ? open + v + close : m;
  });

  /* atributos traduziveis (aria-label, alt, title...) tambem em portugues */
  s = s.replace(/<[a-z][^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/gi, (tag, specs) => {
    specs.split(';').forEach(spec => {
      const [attr, key] = spec.split(':');
      const v = key && pick(pt, key.trim());
      if (typeof v !== 'string') return;
      const re = new RegExp(`(\\s${attr.trim()}=")[^"]*(")`);
      tag = tag.replace(re, (m, a, b) => a + v.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + b);
    });
    return tag;
  });

  /* caminhos relativos -> absolutos (fora dos <script>, que montam HTML
     com template string e nao devem ser tocados) */
  s = s.split(/(<script\b[\s\S]*?<\/script>)/i).map((part, i) => i % 2 ? part
    : part.replace(/(\s(?:src|href)=")(?:\.\/)?(?!https?:|\/|#|mailto:|tel:|data:|javascript:|\$\{)([^"]+)"/g, '$1/$2"')
  ).join('');

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, s);
  console.log('[home-pt] pt/index.html gerado');
}

if (require.main === module) build();
module.exports = { build };
