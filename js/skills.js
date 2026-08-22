'use strict';

/* =========================================================
   SKILLS — PASTAS (folders UI)
   Cada categoria e uma PASTA 3D. Clicar abre a tampa frontal
   (rotateX) e os arquivos sobem e se abrem em LEQUE acima da
   pasta; cada arquivo mostra icone + nome + extensao (como um
   arquivo de verdade). Uma pasta aberta por vez.

   Fluxo: SKILLS_FOLDERS (dados) -> buildSkillsFolders (render
   uma vez) -> renderSkills (i18n de titulo/sub/labels a cada
   troca de idioma). Nenhum no de arquivo e escrito a mao no
   HTML — tudo nasce daqui.
   ========================================================= */

const SKILLS_FOLDERS = [
  {
    key: 'os',
    labelKey: 'os',
    label: 'OS & Cloud',
    icon: 'icons/server-operating-systems-svgrepo-com.svg',
    files: [
      { name: 'Linux',   icon: 'icons/ubuntulinux.png', ext: '.sh' },
      { name: 'Kali',    icon: 'icons/kalilinux.png',   ext: '.iso' },
      { name: 'Windows', icon: 'icons/windows.png',     ext: '.exe' },
      { name: 'macOS',   icon: 'icons/apple.svg',       ext: '.app' },
      { name: 'AWS',     icon: 'icons/aws.svg',         ext: '.tf' },
      { name: 'VPS',     icon: 'icons/VPS.svg',         ext: '.ssh' }
    ]
  },
  {
    key: 'programming',
    labelKey: 'programming',
    label: 'Programming',
    icon: 'icons/code-svgrepo-com.svg',
    files: [
      { name: 'C#',         icon: 'icons/csharp.png',     ext: '.cs' },
      { name: 'Python',     icon: 'icons/python.png',     ext: '.py' },
      { name: 'TypeScript', icon: 'icons/typescript.svg', ext: '.ts' },
      { name: 'JavaScript', icon: 'icons/javascript.png', ext: '.js' },
      { name: 'Dart',       icon: 'icons/dart.svg',       ext: '.dart' },
      { name: 'MySQL',      icon: 'icons/mysql.png',      ext: '.sql' }
    ]
  },
  {
    key: 'web',
    labelKey: 'web',
    label: 'Web & Mobile',
    icon: 'icons/web-svgrepo-com.svg',
    files: [
      { name: 'HTML',      icon: 'icons/html.png',      ext: '.html' },
      { name: 'CSS',       icon: 'icons/css.png',       ext: '.css' },
      { name: 'WordPress', icon: 'icons/wordpress.png', ext: '.php' },
      { name: 'React',     icon: 'icons/react.svg',     ext: '.tsx' },
      { name: 'Flutter',   icon: 'icons/flutter.svg',   ext: '.dart' },
      { name: 'Kotlin',    icon: 'icons/kotlin.svg',    ext: '.kt' },
      { name: 'Swift',     icon: 'icons/swift.svg',     ext: '.swift' }
    ]
  },
  {
    key: 'creative',
    labelKey: 'creative',
    label: 'Design & AI',
    icon: 'icons/design-svgrepo-com.svg',
    files: [
      { name: 'Figma',         icon: 'icons/figma.svg',       ext: '.fig' },
      { name: 'Photoshop',     icon: 'icons/photoshop.png',   ext: '.psd' },
      { name: 'Premiere',      icon: 'icons/premiere.png',    ext: '.prproj' },
      { name: 'After Effects', icon: 'icons/aftereffects.png', ext: '.aep' },
      { name: 'Blender',       icon: 'icons/blender.png',     ext: '.blend' },
      { name: 'Claude',        icon: 'icons/claude.svg',      ext: '.md' },
      { name: 'Jupyter',       icon: 'icons/jupyter.png',     ext: '.ipynb' }
    ]
  }
];

/* -------- render de um arquivo (mini-card que voa) -------- */
function buildSkillFile(file, index, total) {
  const mid = (total - 1) / 2;
  const off = index - mid;                         // -mid .. +mid (centro = 0)
  const arch = mid === 0 ? 1 : 1 - Math.abs(off) / mid; // 1 no centro, 0 nas pontas
  const delay = (Math.abs(off) * 0.045).toFixed(3);     // leque abre do centro pra fora

  const el = document.createElement('span');
  el.className = 'ff-file';
  el.setAttribute('role', 'listitem');
  el.style.setProperty('--off', String(off));
  el.style.setProperty('--arch', arch.toFixed(3));
  el.style.setProperty('--fd', delay + 's');            // leque (desktop): stagger centro->fora
  el.style.setProperty('--fdi', (index * 0.04).toFixed(3) + 's'); // grade (mobile): stagger em ordem

  const img = document.createElement('img');
  img.className = 'ff-icon';
  img.src = file.icon;
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';

  const name = document.createElement('span');
  name.className = 'ff-name';
  name.textContent = file.name;

  const ext = document.createElement('span');
  ext.className = 'ff-ext';
  ext.textContent = file.ext;

  el.append(img, name, ext);
  return el;
}

/* -------- render de uma pasta -------- */
function buildSkillFolder(cat) {
  const total = cat.files.length;

  const wrap = document.createElement('div');
  wrap.className = 'skill-folder';
  wrap.dataset.key = cat.key;

  // arquivos (ficam acima da pasta ao abrir). aria-hidden fechado: um
  // leitor de tela NAO deve anunciar os arquivos de uma pasta colapsada
  // (aria-hidden nao afeta layout -> a animacao de abrir continua).
  const filesBox = document.createElement('div');
  filesBox.className = 'folder-files';
  filesBox.id = 'ff-' + cat.key;
  filesBox.setAttribute('role', 'list');
  filesBox.setAttribute('aria-hidden', 'true');
  cat.files.forEach((f, i) => filesBox.appendChild(buildSkillFile(f, i, total)));
  // foco sob o cursor (sem :hover -> sem tremida entre arquivos sobrepostos)
  filesBox.addEventListener('pointermove', onFilesPointerMove, { passive: true });
  filesBox.addEventListener('pointerleave', onFilesPointerLeave, { passive: true });

  // a pasta em si e o botao. aria-label explicito ("OS & Cloud, 6 skills")
  // pra o nome acessivel nao virar o run-on "6OS & Cloud// 6 files".
  const btn = document.createElement('button');
  btn.className = 'folder-btn';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', filesBox.id);
  btn.setAttribute('aria-label', cat.label + ', ' + total + ' skills');

  const shape = document.createElement('span');
  shape.className = 'folder-shape';
  shape.setAttribute('aria-hidden', 'true');

  const tab = document.createElement('span');
  tab.className = 'folder-tab';

  const back = document.createElement('span');
  back.className = 'folder-back';

  const front = document.createElement('span');
  front.className = 'folder-front';

  const top = document.createElement('span');
  top.className = 'folder-front__top';

  // icone grande e solido dentro de um TILE arredondado verde (duotone) ->
  // UM foco cheio, nao um risquinho fino no canto.
  const icoWrap = document.createElement('span');
  icoWrap.className = 'folder-ico-wrap';
  const fico = document.createElement('img');
  fico.className = 'folder-ico';
  fico.src = cat.icon;
  fico.alt = '';
  fico.loading = 'lazy';
  fico.decoding = 'async';
  icoWrap.appendChild(fico);

  top.append(icoWrap);

  const bottom = document.createElement('span');
  bottom.className = 'folder-front__bottom';

  const label = document.createElement('span');
  label.className = 'folder-label';
  label.dataset.labelKey = cat.labelKey;
  label.textContent = cat.label;

  // UM contador so: dot verde pulsante + "N tools" mono sob o label
  // (a antiga pill "● N" no topo saiu -> sem repeticao). decorativo.
  const meta = document.createElement('span');
  meta.className = 'folder-meta';
  meta.setAttribute('aria-hidden', 'true');   // o nome acessivel vem do aria-label

  const dot = document.createElement('span');
  dot.className = 'status-dot';

  const detail = document.createElement('span');
  detail.className = 'folder-detail';
  detail.dataset.count = String(total);
  detail.textContent = total + ' tools';

  meta.append(dot, detail);
  bottom.append(label, meta);
  front.append(top, bottom);
  shape.append(tab, back, front);
  btn.appendChild(shape);

  wrap.append(filesBox, btn);
  return wrap;
}

/* -------- foco sob o cursor nos arquivos abertos (sem :hover) --------
   Os arquivos do leque se SOBREPOEM; com :hover puro, o `scale` de foco move a
   area-alvo e o :hover "pisca" entre 2 arquivos na borda/ponta. Aqui o JS marca
   UM alvo por movimento -> o topo real sob o cursor -> zero tremida/travamento.
   Ver style.css .ff-file.ff-hot. */
var FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)');
var lastHotX = null, lastHotY = null;

function clearHot(container) {
  container.querySelectorAll('.ff-file.ff-hot').forEach(f => f.classList.remove('ff-hot'));
}
function onFilesPointerMove(e) {
  // guard anti-scroll: ao rolar, o browser dispara pointermove com o cursor
  // PARADO -> so mexe no foco quando o mouse ANDA de verdade (clientX/Y mudam).
  if (e.clientX === lastHotX && e.clientY === lastHotY) return;
  lastHotX = e.clientX; lastHotY = e.clientY;
  const box = e.currentTarget;
  const folder = box.closest('.skill-folder');
  if (!folder || !folder.classList.contains('open')) { clearHot(box); return; }
  const file = e.target.closest('.ff-file');
  if (!file) { clearHot(box); return; }
  if (file.classList.contains('ff-hot')) return;   // ja e o alvo -> nada muda
  clearHot(box);
  file.classList.add('ff-hot');
}
function onFilesPointerLeave(e) {
  clearHot(e.currentTarget);
}

/* -------- interacao: uma pasta aberta por vez -------- */
function closeOpenFolders(except) {
  document.querySelectorAll('.skill-folder.open').forEach(folder => {
    if (folder === except) return;
    folder.classList.remove('open');
    const btn = folder.querySelector('.folder-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    const files = folder.querySelector('.folder-files');
    if (files) {
      files.setAttribute('aria-hidden', 'true');   // esconde do leitor ao fechar
      clearHot(files);                              // some o foco ao fechar
    }
  });
}

/* garante FOLGA: o leque sobe ~300px (desktop) ou a altura da grade
   (mobile) acima da pasta. Se a pasta esta perto do topo (comum num tap
   mobile), o leque ficaria atras da nav fixa -> rola pra uma posicao
   segura, com o topo do leque abaixo da nav. */
function ensureFolderVisible(folder) {
  const btn = folder.querySelector('.folder-btn');
  const files = folder.querySelector('.folder-files');
  if (!btn) return;

  const navH = 56;   // --nav-h
  const margin = 16;
  const coarse = window.matchMedia('(max-width: 980px)').matches;

  // no reflow (grade) o container tem altura real -> seu topo E o topo do leque.
  // no leque (desktop) o container tem altura 0 -> estima 300px acima da pasta.
  const fanTop = (coarse && files)
    ? files.getBoundingClientRect().top
    : btn.getBoundingClientRect().top - 300;

  const safeTop = navH + margin;
  if (fanTop >= safeTop) return;                      // ja tem folga

  const delta = safeTop - fanTop;                     // desce o conteudo em delta
  const targetY = Math.max(0, window.scrollY - delta);
  if (window.lenis && typeof window.lenis.scrollTo === 'function') {
    window.lenis.scrollTo(targetY, { duration: 0.6 });
  } else {
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }
}

function toggleFolder(folder) {
  const btn = folder.querySelector('.folder-btn');
  const files = folder.querySelector('.folder-files');
  const willOpen = !folder.classList.contains('open');
  closeOpenFolders(folder);                 // fecha qualquer outra antes
  folder.classList.toggle('open', willOpen);
  if (btn) btn.setAttribute('aria-expanded', String(willOpen));
  if (files) {
    if (willOpen) {
      files.removeAttribute('aria-hidden');   // revela pro leitor
    } else {
      files.setAttribute('aria-hidden', 'true');
      clearHot(files);                         // fechando -> tira o foco
    }
  }
  if (willOpen) ensureFolderVisible(folder);
}

/* -------- boot: monta as pastas uma unica vez -------- */
/* HOVER na box do gradiente: um facho de luz suave segue o cursor. Escreve
   --mx/--my em % RELATIVOS a box (::before/::after usam os mesmos insets
   --box-*, entao a conta bate). So mouse fino; rAF-throttled; recalcula os
   insets no resize (mudam por breakpoint). O fade e do CSS (:hover::after). */
function initBoxSpotlight(host) {
  const ins = { t: 0, r: 0, b: 0, l: 0 };
  function readInsets() {
    const cs = getComputedStyle(host);
    ins.t = parseFloat(cs.getPropertyValue('--box-top')) || 0;
    ins.r = parseFloat(cs.getPropertyValue('--box-right')) || 0;
    ins.b = parseFloat(cs.getPropertyValue('--box-bottom')) || 0;
    ins.l = parseFloat(cs.getPropertyValue('--box-left')) || 0;
  }
  readInsets();
  window.addEventListener('resize', readInsets, { passive: true });
  let raf = 0, mx = 50, my = 50;
  host.addEventListener('pointermove', e => {
    const r = host.getBoundingClientRect();
    const boxW = r.width - ins.l - ins.r;
    const boxH = r.height - ins.t - ins.b;
    if (boxW <= 0 || boxH <= 0) return;
    mx = ((e.clientX - (r.left + ins.l)) / boxW) * 100;
    my = ((e.clientY - (r.top + ins.t)) / boxH) * 100;
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0;
      host.style.setProperty('--mx', mx.toFixed(2) + '%');
      host.style.setProperty('--my', my.toFixed(2) + '%');
    });
  }, { passive: true });
}

function buildSkillsFolders() {
  const host = document.getElementById('skillsFolders');
  if (!host || host.dataset.built === '1') return;
  host.dataset.built = '1';

  SKILLS_FOLDERS.forEach(cat => {
    const folder = buildSkillFolder(cat);
    host.appendChild(folder);
    const btn = folder.querySelector('.folder-btn');
    if (btn) btn.addEventListener('click', () => toggleFolder(folder));
  });
  initBoxSpotlight(host);

  // Esc fecha a pasta aberta e devolve o foco ao botao
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.skill-folder.open');
    if (!open) return;
    closeOpenFolders(null);
    const btn = open.querySelector('.folder-btn');
    if (btn) btn.focus();
  });
}

/* -------- i18n: titulo, subtitulo e labels das pastas -------- */
function renderSkills(lang) {
  const S = (typeof I18N !== 'undefined' && I18N[lang] && I18N[lang].skills) || null;

  const title = document.querySelector('#skills .section-title');
  const sub = document.querySelector('#skills .section-sub');
  if (S) {
    if (title) title.textContent = S.title;
    if (sub) sub.textContent = S.sub;
  }

  const toolsWord = lang === 'pt' ? 'ferramentas' : 'tools';
  const skillsWord = lang === 'pt' ? 'habilidades' : 'skills';

  document.querySelectorAll('#skillsFolders .skill-folder').forEach(folder => {
    const key = folder.dataset.key;
    const label = folder.querySelector('.folder-label');
    const detail = folder.querySelector('.folder-detail');
    const btn = folder.querySelector('.folder-btn');
    const count = detail && detail.dataset.count ? detail.dataset.count : '';

    const labelText = (S && S.tilesLabels && S.tilesLabels[key])
      ? S.tilesLabels[key]
      : (label ? label.textContent : '');

    if (label && labelText) label.textContent = labelText;
    if (detail && count) detail.textContent = count + ' ' + toolsWord;
    // nome acessivel limpo, localizado ("OS & Cloud, 6 skills" / "6 habilidades")
    if (btn && labelText) btn.setAttribute('aria-label', labelText + ', ' + count + ' ' + skillsWord);
  });
}

if (document.readyState !== 'loading') buildSkillsFolders();
else document.addEventListener('DOMContentLoaded', buildSkillsFolders);
