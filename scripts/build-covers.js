#!/usr/bin/env node
'use strict';

/* =========================================================
   BUILD COVERS — capas responsivas dos projetos.

   Entrada: covers-src/<id>.(png|jpg|jpeg|webp)   (1 arquivo-mestre
            por projeto, 16:9; o <id> é o mesmo do language.js)
   Saída:   img/covers/<id>-{480,800,1200}.{avif,webp}
            img/covers/<id>.{avif,webp}            (1600w, o padrão)

   O site serve <picture> com AVIF -> WebP e srcset por largura: o
   celular baixa a de 480/800, o notebook a de 800/1200, a TV/retina
   a de 1600. Ninguém baixa mais pixel do que a tela mostra.

   Imagem tem cache immutable de 1 ano (vercel.json). Por isso o build
   grava ?v=<hash do mestre> no campo cover do js/language.js: trocou
   a capa, muda a URL, todo mundo recebe a nova.

   Uso:  npm run build:covers            (só o que mudou)
         npm run build:covers -- --force (refaz tudo)
   ========================================================= */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let sharp;
try { sharp = require('sharp'); }
catch { console.error('[covers] sharp não instalado: npm i sharp'); process.exit(1); }

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'covers-src');
const OUT_DIR = path.join(ROOT, 'img', 'covers');

const RATIO = 16 / 9;
const WIDTHS = [480, 800, 1200, 1600];   /* a última vira o arquivo padrão */
const AVIF = { quality: 52, effort: 6, chromaSubsampling: '4:2:0' };
const WEBP = { quality: 80, effort: 6, smartSubsample: true };
const EXTS = ['.png', '.jpg', '.jpeg', '.webp'];

const LANG_FILE = path.join(ROOT, 'js', 'language.js');
const force = process.argv.includes('--force');

function hashOf(file) {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
}

/* cover: "img/covers/<id>.webp[?v=...]" -> com o hash atual do mestre */
function stampVersions(ids) {
  let src = fs.readFileSync(LANG_FILE, 'utf8');
  let n = 0;
  for (const [id, v] of ids) {
    const re = new RegExp(`(cover:\\s*")img/covers/${id}\\.webp(?:\\?v=[a-z0-9]+)?(")`, 'g');
    src = src.replace(re, (_, a, b) => { n++; return `${a}img/covers/${id}.webp?v=${v}${b}`; });
  }
  fs.writeFileSync(LANG_FILE, src);
  return n;
}

function outName(id, w, ext) {
  const last = WIDTHS[WIDTHS.length - 1];
  return path.join(OUT_DIR, w === last ? `${id}.${ext}` : `${id}-${w}.${ext}`);
}

function upToDate(srcFile, id) {
  if (force) return false;
  const srcTime = fs.statSync(srcFile).mtimeMs;
  return WIDTHS.every(w => ['avif', 'webp'].every(ext => {
    const f = outName(id, w, ext);
    return fs.existsSync(f) && fs.statSync(f).mtimeMs >= srcTime;
  }));
}

async function buildOne(srcFile) {
  const id = path.basename(srcFile, path.extname(srcFile));
  if (upToDate(srcFile, id)) return { id, skipped: true };

  const meta = await sharp(srcFile).metadata();
  const srcRatio = meta.width / meta.height;
  if (Math.abs(srcRatio - RATIO) > 0.02) {
    console.warn(`[covers] ${id}: ${meta.width}x${meta.height} não é 16:9 — recortando pelo centro`);
  }
  if (meta.width < 1600) {
    console.warn(`[covers] ${id}: só ${meta.width}px de largura — o ideal é 2560px (mín. 1920px)`);
  }

  const sizes = [];
  for (const w of WIDTHS) {
    const h = Math.round(w / RATIO);
    const base = sharp(srcFile)
      .rotate()
      .resize(w, h, { fit: 'cover', position: 'attention', withoutEnlargement: false, kernel: 'lanczos3' })
      .toColorspace('srgb');
    const avif = outName(id, w, 'avif');
    const webp = outName(id, w, 'webp');
    await base.clone().avif(AVIF).toFile(avif);
    await base.clone().webp(WEBP).toFile(webp);
    sizes.push(`${w}w ${(fs.statSync(avif).size / 1024).toFixed(0)}/${(fs.statSync(webp).size / 1024).toFixed(0)}KB`);
  }
  return { id, sizes };
}

(async () => {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`[covers] pasta ${path.relative(ROOT, SRC_DIR)}/ não existe`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(SRC_DIR)
    .filter(f => EXTS.includes(path.extname(f).toLowerCase()))
    .map(f => path.join(SRC_DIR, f));
  if (!files.length) { console.log('[covers] nenhuma capa em covers-src/'); return; }

  const versions = [];
  for (const f of files) {
    const r = await buildOne(f);
    versions.push([r.id, hashOf(f)]);
    if (r.skipped) console.log(`[covers] ${r.id}: em dia`);
    else console.log(`[covers] ${r.id}: ${r.sizes.join(' · ')} (avif/webp)`);
  }
  console.log(`[covers] ${stampVersions(versions)} campos cover versionados em js/language.js`);
})().catch(err => { console.error('[covers]', err); process.exit(1); });
