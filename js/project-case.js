'use strict';

/* =========================================================
   PROJECT CASE STUDY — página individual (project.html?slug=X)
   Lê o slug da URL, encontra o projeto em I18N[lang].projects.list
   e popula hero/vídeo/tópicos. Sem GSAP: puro render de dados —
   a camada de motion (reveals) vive em js/project-fx.js, separada,
   porque carrega DEPOIS do CDN do GSAP (ver comentário no project.html).
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

/* nota de margem (a "tinta" do levantamento): fio 1px + tag "// nota do
   engenheiro" + corpo mono. Sem texto, a nota some (o grid do ato colapsa
   pra coluna única via .pc-act--solo, setada por quem chama). */
function pcNote(el, text, labels) {
  if (!el) return;
  if (!text) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false;
  el.innerHTML =
    '<i class="pc-note__wire" aria-hidden="true"></i>' +
    `<span class="pc-note__tag"><b aria-hidden="true">//</b> ${labels.noteLabel || "engineer's note"}</span>` +
    `<span class="pc-note__body">${text}</span>`;
}

/* mesmos criterios do showcase (psPrepare em js/projects.js): só
   projetos com capa E link entram como caso navegável */
function pcRealProjects(lang) {
  const list = (I18N[lang] && I18N[lang].projects && I18N[lang].projects.list) || [];
  return list
    .filter(p => p && p.cover && p.link)
    .map(p => ({ ...p, id: p.id || pcSlug(p.title) }));
}

function pcCurrentSlug() {
  return new URLSearchParams(location.search).get('slug') || '';
}

function renderProjectCase(lang) {
  const root = document.querySelector('[data-pc-root]');
  if (!root) return; // não estamos em project.html

  const projects = pcRealProjects(lang);
  const slug = pcCurrentSlug();
  const project = projects.find(p => p.id === slug);

  if (!project) {
    // slug ausente/inválido/placeholder — volta pra grade em vez de
    // renderizar uma página vazia
    location.replace('/#projects');
    return;
  }

  const labels = (I18N[lang].projects && I18N[lang].projects.case) || {};

  /* ---- <title> / meta description (client-side; ver nota no head) ---- */
  const docTitle = `${project.title} — Bernardo Iannini`;
  document.title = docTitle;
  const descEl = document.querySelector('[data-pc-docdesc]');
  if (descEl) descEl.setAttribute('content', project.desc || '');

  /* ---- linha de registro — fatos secos, cada item só entra se o campo
     existir (status com dot verde estático · domínio real · ano · papel) ---- */
  const regEl = root.querySelector('[data-pc-reg]');
  if (regEl) {
    const host = pcHostname(project.link);
    const items = [];
    if (project.status) items.push(`<span class="pc-reg__item pc-reg__status"><i class="pc-reg__dot" aria-hidden="true"></i>${project.status}</span>`);
    if (host) items.push(`<a class="pc-reg__item pc-reg__host" href="${project.link}" target="_blank" rel="noopener noreferrer">${host}</a>`);
    if (project.year) items.push(`<span class="pc-reg__item">${project.year}</span>`);
    if (project.role) items.push(`<span class="pc-reg__item">${project.role}</span>`);
    regEl.innerHTML = items.join('<span class="pc-reg__sep" aria-hidden="true">·</span>');
    regEl.hidden = !items.length;
  }

  /* ---- hero ---- */
  const titleEl  = root.querySelector('[data-pc-title]');
  const descPEl  = root.querySelector('[data-pc-desc]');
  const techEl   = root.querySelector('[data-pc-tech]');
  if (titleEl)  titleEl.textContent  = project.title;
  if (descPEl)  descPEl.textContent  = project.desc || '';
  if (techEl) {
    techEl.innerHTML = (project.stack || [])
      .map((t, i) => `<span class="ps-pill" style="--i:${i}">${t}</span>`)
      .join('');
  }

  /* ---- CTAs ---- */
  const linkEl = root.querySelector('[data-pc-link]');
  const repoEl = root.querySelector('[data-pc-repo]');
  if (linkEl) {
    linkEl.href = project.link;
    linkEl.style.display = project.link ? '' : 'none';
    const lbl = linkEl.querySelector('[data-pc-link-label]');
    if (lbl) lbl.textContent = labels.visitSite || 'Visit live site';
  }
  if (repoEl) {
    repoEl.style.display = project.repo ? '' : 'none';
    if (project.repo) {
      repoEl.href = project.repo;
      const lbl = repoEl.querySelector('[data-pc-repo-label]');
      if (lbl) lbl.textContent = labels.repoBtn || 'Source';
    }
  }

  /* ---- vídeo (loop autônomo) com fallback pra capa ----
     Sem video cadastrado: mostra a capa + selo "em breve". Com video:
     toca em loop, silencioso, sem controles — a capa fica como poster. */
  const urlEl   = root.querySelector('[data-pc-url]');
  const videoEl = root.querySelector('[data-pc-video]');
  const coverEl = root.querySelector('[data-pc-cover]');
  const soonEl  = root.querySelector('[data-pc-soon]');
  if (urlEl) urlEl.textContent = pcHostname(project.link);
  if (videoEl && coverEl && soonEl) {
    if (project.video) {
      videoEl.src = project.video;
      if (project.cover) videoEl.setAttribute('poster', project.cover);
      videoEl.hidden = false;
      coverEl.hidden = true;
      soonEl.hidden = true;
      videoEl.playbackRate = 0.4; // scroll do site mais lento na página do case
      videoEl.addEventListener('loadedmetadata', () => { videoEl.playbackRate = 0.4; }, { once: true });
      videoEl.play?.().catch(() => {}); // autoplay pode ser bloqueado sem gesto; silencioso, sem problema
    } else {
      videoEl.hidden = true;
      videoEl.removeAttribute('src');
      coverEl.src = project.cover || '';
      coverEl.alt = project.title;
      coverEl.hidden = !project.cover;
      soonEl.hidden = false;
      soonEl.textContent = labels.videoSoon || 'Video coming soon';
    }
  }

  /* ---- ato "o problema" — story.problem quando existir; senão o
     longDesc (fallback: título "Sobre o projeto", sem nota/fluxo).
     Cap duro de 3 parágrafos: o instrumento precisa chegar cedo. ---- */
  const storyEl = root.querySelector('[data-pc-story]');
  if (storyEl) {
    const prob = (project.story && project.story.problem) || null;
    const rawText = (prob && prob.text) || project.longDesc || '';
    storyEl.hidden = !rawText;
    if (rawText) {
      const note = prob && prob.note;
      storyEl.classList.toggle('pc-act--solo', !note);
      const stTitle = storyEl.querySelector('[data-pc-story-title]');
      if (stTitle) {
        stTitle.innerHTML = (prob && prob.title)
          || (prob ? (labels.problemTitle || 'The problem') : (labels.aboutTitle || 'About the project'));
      }
      const stText = storyEl.querySelector('[data-pc-story-text]');
      if (stText) {
        stText.innerHTML = rawText.split(/\n\s*\n/).slice(0, 3)
          .map(p => `<p>${p.trim()}</p>`).join('');
      }
      pcNote(storyEl.querySelector('[data-pc-story-note]'), note, labels);
      /* linha de fluxo — o momento "recontável em 10 segundos" */
      const stFlow = storyEl.querySelector('[data-pc-flow]');
      if (stFlow) {
        const steps = (project.flow && project.flow.steps) || [];
        stFlow.hidden = steps.length < 2;
        stFlow.innerHTML = steps.length < 2 ? '' : steps.map(s =>
          `<span class="pc-flow__step"><span class="pc-flow__label">${s.label}</span>${s.sub ? `<span class="pc-flow__sub">${s.sub}</span>` : ''}</span>`
        ).join('<span class="pc-flow__arrow" aria-hidden="true">→</span>');
      }
    }
  }

  /* ---- título real da seção de tópicos ---- */
  const builtEl = root.querySelector('[data-pc-built-title]');
  if (builtEl) builtEl.innerHTML = labels.builtTitle || 'How it was built';

  /* ---- tópicos (o que foi construído) ----
     data-path alimenta a "URL viva": path REAL do produto quando
     cadastrado (digita /admin/cases), senão slug do título (/#topico).
     data-shot alimenta a "janela que navega" (project-fx.js).
     Registro-dev: no MÁXIMO UM por tópico — deep (details "$ como
     resolvi") vence tech (linha "// …"). */
  const topicsEl = root.querySelector('[data-pc-topics]');
  if (topicsEl) {
    /* preserva o estado open dos <details> no re-render de idioma */
    const openIdx = [...topicsEl.querySelectorAll('.pd-topic')]
      .map((t, i) => (t.querySelector('.pd-deep') || {}).open ? i : -1)
      .filter(i => i >= 0);
    topicsEl.innerHTML = (project.topics || []).map((t, i) => {
      const realPath = t.path ? '/' + String(t.path).replace(/^\/+/, '') : '';
      const dev = (t.deep && t.deep.length)
        ? `<details class="pd-deep"${openIdx.includes(i) ? ' open' : ''}>` +
          `<summary class="pd-deep__sum"><b aria-hidden="true">$</b> ${labels.deepLabel || 'how i solved it'}</summary>` +
          `<div class="pd-deep__body">${t.deep.map(l => `<span>${l}</span>`).join('')}</div></details>`
        : (t.tech ? `<p class="pd-topic__tech"><b aria-hidden="true">//</b> ${t.tech}</p>` : '');
      return `
      <article class="pd-topic" style="--i:${i}" data-path="${realPath || pcSlug(t.title)}"${t.shot ? ` data-shot="${t.shot}"` : ''}>
        <span class="pd-topic__icon" aria-hidden="true">${PC_ICONS[t.icon] || PC_ICONS.layers}</span>
        <div class="pd-topic__body">
          <h3 class="pd-topic__title">${t.title}</h3>
          <p class="pd-topic__text">${t.text}</p>
          ${dev}
        </div>
      </article>
    `;
    }).join('');
  }

  /* ---- ato "o que isso mudou" — só com impact.text ou metrics>=2 ---- */
  const impactEl = root.querySelector('[data-pc-impact]');
  if (impactEl) {
    const imp = project.impact || {};
    const metrics = (project.metrics || []).slice(0, 4);
    const hasMetrics = metrics.length >= 2;
    const show = !!imp.text || hasMetrics;
    impactEl.hidden = !show;
    if (show) {
      impactEl.classList.toggle('pc-act--solo', !imp.note);
      impactEl.dataset.path = labels.impactPath || 'impact';
      const t = impactEl.querySelector('[data-pc-impact-title]');
      if (t) t.innerHTML = labels.impactTitle || 'What it changed';
      const tx = impactEl.querySelector('[data-pc-impact-text]');
      if (tx) { tx.hidden = !imp.text; tx.textContent = imp.text || ''; }
      const mEl = impactEl.querySelector('[data-pc-metrics]');
      if (mEl) {
        mEl.hidden = !hasMetrics;
        mEl.style.setProperty('--pc-metrics-n', metrics.length);
        mEl.innerHTML = !hasMetrics ? '' : metrics.map(m =>
          `<div class="pc-metric"><span class="pc-metric__value">${m.value}</span>` +
          `<span class="pc-metric__label">${m.label}</span>` +
          `${m.detail ? `<span class="pc-metric__detail">${m.detail}</span>` : ''}</div>`
        ).join('');
      }
      pcNote(impactEl.querySelector('[data-pc-impact-note]'), imp.note, labels);
    }
  }

  /* ---- ficha técnica ($ cat specs.txt) — só com specs[] ---- */
  const specsEl = root.querySelector('[data-pc-specs]');
  if (specsEl) {
    const specRows = (project.specs || []).slice();
    specsEl.hidden = !specRows.length;
    if (specRows.length) {
      if (project.repo) specRows.push({ k: 'source', v: project.repo, link: project.repo });
      const cmd = specsEl.querySelector('[data-pc-specs-cmd]');
      if (cmd) cmd.textContent = labels.specsCmd || 'cat specs.txt';
      const com = specsEl.querySelector('[data-pc-specs-comment]');
      if (com) com.textContent = '  ' + (labels.specsComment || '# for the technical reader');
      const list = specsEl.querySelector('[data-pc-specs-list]');
      if (list) {
        list.innerHTML = specRows.map(r =>
          `<div class="pc-specs__row"><dt>${r.k}</dt>` +
          `<dd>${r.link ? `<a href="${r.link}" target="_blank" rel="noopener noreferrer">${r.v}</a>` : r.v}</dd></div>`
        ).join('');
      }
    }
  }

  /* ---- assinatura (porta de contato) ---- */
  const signLine = root.querySelector('[data-pc-sign-line]');
  if (signLine) signLine.innerHTML = labels.signLine || '';
  const signCta = root.querySelector('[data-pc-sign-cta]');
  if (signCta) signCta.textContent = labels.signCta || 'Get in touch';

  /* ---- próximo projeto (cicla pela lista) — com thumb duotone ---- */
  const nextEl = root.querySelector('[data-pc-next]');
  if (nextEl && projects.length > 1) {
    const idx = projects.findIndex(p => p.id === project.id);
    const next = projects[(idx + 1) % projects.length];
    nextEl.href = `project.html?slug=${encodeURIComponent(next.id)}`;
    const nt = nextEl.querySelector('[data-pc-next-title]');
    if (nt) nt.textContent = next.title;
    const nimg = nextEl.querySelector('[data-pc-next-img]');
    if (nimg) {
      const thumb = nimg.closest('.pc-next__thumb');
      if (next.cover) { nimg.src = next.cover; if (thumb) thumb.style.display = ''; }
      else if (thumb) thumb.style.display = 'none';
    }
    nextEl.closest('.pc-next').style.display = '';
  } else if (nextEl) {
    nextEl.closest('.pc-next').style.display = 'none';
  }

  // sinaliza pra camada de motion (project-fx.js) que o conteúdo
  // acabou de ser (re)montado — usado no rebuild após troca de idioma
  document.dispatchEvent(new CustomEvent('pc:rendered'));
}

/* expor pro language.js (mesmo padrão de renderProjects/renderServices/...) */
window.renderProjectCase = renderProjectCase;
