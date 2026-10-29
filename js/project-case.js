'use strict';

/* =========================================================
   PROJECT CASE — helpers compartilhados com o build (ícones, slug,
   hostname, srcset das capas) + o redirect da rota antiga
   project.html?slug=X pra página estática do projeto.
   ========================================================= */

/* ---------- ícones dos tópicos (mesmo estilo do SERVICE_ICONS) ---------- */
const PC_ICONS = {
  shield:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>',
  layers:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 3 3 8l9 5 9-5-9-5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M3 13l9 5 9-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M3 17.5l9 5 9-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
    '</svg>',
  chart:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M4 20V10M11 20V4M18 20v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M3 20h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>',
  sparkles:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" opacity=".8"/>' +
    '</svg>',
  gauge:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M3 14a9 9 0 1 1 18 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M12 14 16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="12" cy="14" r="1.5" fill="currentColor"/>' +
    '</svg>',
  users:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M16 4.6a3.2 3.2 0 0 1 0 6.2M19.5 20c0-2.8-2-5.1-4.7-5.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>',
  palette:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2s-.6-1.6-1-2 .3-2 1.6-2H16a5 5 0 0 0 5-5 8.8 8.8 0 0 0-9-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<circle cx="7.5" cy="10.5" r="1.1" fill="currentColor"/><circle cx="9.5" cy="7" r="1.1" fill="currentColor"/>' +
      '<circle cx="14.5" cy="7" r="1.1" fill="currentColor"/><circle cx="16.5" cy="11" r="1.1" fill="currentColor"/>' +
    '</svg>',
  search:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M20 20l-4.8-4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>',
  globe:
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M3.5 12h17M12 3.5c2.4 2.2 3.6 5.1 3.6 8.5S14.4 18.3 12 20.5c-2.4-2.2-3.6-5.1-3.6-8.5S9.6 5.7 12 3.5z" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
    '</svg>',
};

function pcSlug(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

function pcHostname(link) {
  if (!link) return '';
  try { return new URL(link).hostname.replace(/^www\./, ''); }
  catch { return String(link).replace(/^https?:\/\/(www\.)?/, ''); }
}

/* srcset das capas geradas pelo build:covers (img/covers/<id>.webp?v=hash
   + variantes -480/-800/-1200). Fora desse padrão devolve '' e a página
   usa só o src. Mesma regra do js/projects.js. */
const PC_COVER_W = [480, 800, 1200, 1600];
const PC_COVER_SIZES = '(max-width: 900px) 92vw, 46vw';
const PC_NEXT_SIZES = '(max-width: 700px) 90vw, 30vw';
function pcCoverSet(cover, ext) {
  const m = /^(.*\/covers\/[^/?]+)\.webp(\?[^#]*)?$/.exec(cover || '');
  if (!m) return '';
  const [, base, q = ''] = m;
  return PC_COVER_W.map((w, i) =>
    `${base}${i === PC_COVER_W.length - 1 ? '' : '-' + w}.${ext}${q} ${w}w`).join(', ');
}

/* mesmos criterios do showcase (pjPrepare em js/projects.js): só
   projetos com capa E link têm página */
function pcRealProjects(lang) {
  const list = (I18N[lang] && I18N[lang].projects && I18N[lang].projects.list) || [];
  return list
    .filter(p => p && p.cover && (p.link || p.local))
    .map(p => ({ ...p, id: p.id || pcSlug(p.title) }));
}

/* project.html?slug=X é a rota antiga: a página de verdade é a estática
   gerada pelo build (scripts/build-projects.js + lib/case-render.js).
   Na Vercel o redirect 301 já acontece no servidor; aqui cobre o dev
   local e qualquer link antigo que chegue sem passar por ele. */
function renderProjectCase(lang) {
  if (!document.querySelector('[data-pc-redirect]')) return;
  const slug = new URLSearchParams(location.search).get('slug') || '';
  const project = pcRealProjects(lang).find(p => p.id === slug);
  if (!project) { location.replace('/#projects'); return; }
  const id = encodeURIComponent(project.id);
  location.replace(lang === 'en' ? `/en/projects/${id}.html` : `/projetos/${id}.html`);
}

/* expor pro language.js (mesmo padrão de renderProjects/renderServices/...) */
window.renderProjectCase = renderProjectCase;
