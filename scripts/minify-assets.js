#!/usr/bin/env node
/**
 * Minifica CSS/JS in-place para o deploy.
 *
 * Roda dentro do build da Vercel (ver "build" no package.json). Como a Vercel faz
 * checkout limpo e publica o diretorio inteiro (outputDirectory "."), sobrescrever
 * os arquivos aqui NAO altera o repositorio nem o dev local (`npm run dev` serve a
 * fonte legivel). A saida renderizada e identica — minificacao so remove
 * espacos/comentarios e encurta nomes locais.
 *
 * Usa esbuild em modo `transform` (nao `bundle`), entao nomes de escopo global
 * (ex.: I18N, LANG, BlogDB) sao preservados — os scripts compartilham globais
 * entre si via <script> separados.
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');

// Arquivos-alvo: CSS principais + todos os JS locais.
const cssFiles = ['style.css', 'blog.css'];
const jsDir = path.join(ROOT, 'js');
const jsFiles = fs
  .readdirSync(jsDir)
  .filter((f) => f.endsWith('.js') && !f.endsWith('.min.js'))
  .map((f) => path.join('js', f));

async function minifyFile(rel, loader) {
  const abs = path.join(ROOT, rel);
  const code = fs.readFileSync(abs, 'utf8');
  const before = Buffer.byteLength(code);
  const result = await esbuild.transform(code, {
    loader,
    minify: true,
    legalComments: 'none',
    // `transform` (sem bundle) ja preserva identificadores de topo/globais.
  });
  fs.writeFileSync(abs, result.code, 'utf8');
  const after = Buffer.byteLength(result.code);
  const pct = before ? Math.round((1 - after / before) * 100) : 0;
  console.log(
    `  ${rel}: ${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB (${pct}% menor)`
  );
  return { before, after };
}

(async () => {
  console.log('Minificando assets (CSS/JS)...');
  let totBefore = 0;
  let totAfter = 0;
  for (const f of cssFiles) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    const { before, after } = await minifyFile(f, 'css');
    totBefore += before;
    totAfter += after;
  }
  for (const f of jsFiles) {
    const { before, after } = await minifyFile(f, 'js');
    totBefore += before;
    totAfter += after;
  }
  const pct = totBefore ? Math.round((1 - totAfter / totBefore) * 100) : 0;
  console.log(
    `Total: ${(totBefore / 1024).toFixed(1)}KB -> ${(totAfter / 1024).toFixed(1)}KB (${pct}% menor)`
  );
})().catch((err) => {
  console.error('Falha ao minificar assets:', err);
  process.exit(1);
});
