/* =========================================================
   GLOBAL / UTIL & SCROLL
   ========================================================= */
(function () {
  'use strict';

  /* ===== Scroll suave com compensação ===== */
  const header = document.querySelector('header');
  const offset = () => (header?.getBoundingClientRect().height || 0) + 10;
  document.querySelectorAll('a[data-scroll]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - offset();
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* ===== Helpers ===== */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const SCRAMBLE_CHARS = "Aabcdefghijklmnopqrstuvwxyz!@#$%&*";
  const randChars = n => Array.from({ length: n }, () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]).join('');

  /* =========================================================
     I18N (EN/PT) + Estado de linguagem
     ========================================================= */
  const I18N = {
    en: {
      htmlLang: "en",
      nav: { home: "Home", about: "About", experience: "Experience", skills: "Skills", projects: "Projects", contact: "Contact", resume: "Download CV" },
      modes: { prof: "Professional", acad: "Academic", courses: "Courses & Certifications" },
      hero: { hello: "Hi, I'm" },
      taglines: ["Web developer.", "AI Product Designer.", "Video editor."],
      about: {
        kicker: "About me",
        terminal: [
          { type: "type", text: "cat about.txt" },
          {
            type: "out", text:
              `I'm Bernardo Araújo Iannini, 18 years old, a technology student at COTEMIG and an intern at Inspire4U, where I work in web development and innovation projects for fintechs.

I have hands-on experience with C#, SQL, HTML, CSS, WordPress, and MySQL, as well as projects in video editing and creation, an area in which I have already won awards.

Currently, I am deepening my knowledge in software development and have a strong interest in cybersecurity, seeking to combine creativity, technical skills, and strategic vision to build secure and innovative digital solutions.` },
          { type: "type", text: "contact --show" },
          { type: "out", text: "LinkedIn: linkedin.com/in/bernardo-iannini\nGitHub: github.com/iannini25\nEmail: bernardo.iannini14@gmail.com" }
        ]
      },
      xp: {
        title: "Experience",
        sub: "My professional and academic journey",
        timeline: {
          prof: [
            {
              title: "Web Developer & Digital Support", org: "Inspire4U", role: "Internship", loc: "Belo Horizonte, MG",
              bullets: [
                "Worked on development and maintenance of WordPress websites, focusing on performance and usability.",
                "Implemented HTML and CSS adjustments to improve design and user experience.",
                "Applied SEO and GEO techniques to optimize digital visibility and positioning.",
                "Participated in innovation projects and provided digital support for partner fintechs."
              ],
              skills: ["WordPress", "HTML", "CSS", "SEO", "GEO"]
            }
          ],
          acad: [
            {
              title: "Technical High School in IT", org: "COTEMIG", role: "Student", loc: "Belo Horizonte, MG",
              bullets: [
                "Hands-on learning in Programming Logic, Databases, and Web Development.",
                "Direct experience with Google tools, school projects, and practices focused on the IT market.",
                "Technical education focused on programming, innovation, and problem-solving."
              ],
              skills: ["C#", "MySQL", "HTML", "CSS", "JavaScript", "Linux"]
            }
          ],
          courses: [
            {
              title: "Designing products and services with AI", org: "MIT", role: "Student",
              cert: { id: "cert-mit", img: "erpinspire4u.png", label: "Certificate" },
              bullets: ["Foundations of ML/DL, AI strategy and product design applied to real use cases."],
              skills: ["Machine Learning", "Deep Learning", "AI Strategy", "AI Design"]
            }
          ]
        }
      },
      skills: { title: "Skills", sub: "Click the squares to reveal.", tilesLabels: { os: "Operating Systems", programming: "Programming", web: "Web Development", creative: "Creative" } },
      projects: {
        title: "Projects",
        sub: "A concise selection of my recent work in web, product, and media.",
        ctas: { site: "Site", repo: "Repo", viewMore: "View more" },
        list: [
          { title: "Memória Cache Podcast — Site", desc: "Black & white landing plus episodes list with YouTube/Spotify integrations.", stack: ["HTML", "CSS", "JavaScript"], link: "https://memoriacache.example", repo: "", cover: "memoriacache.png" },
          { title: "Condo Manager Assistant", desc: "Toolbox for condo managers: tasks, notices, quick reports, and resident flows.", stack: ["Product", "UX", "Automation"], link: "https://condo-assistant.example", repo: "", cover: "joselopes.png" },
          { title: "Inspire4U ERP — Website", desc: "Corporate ERP website with performance, accessibility and SEO improvements.", stack: ["WordPress", "Performance", "A11y"], link: "https://erpi4u.com", repo: "", cover: "erpinspire4u.png" }
        ]
      },
      contact: {
        kicker: "Let's talk",
        title: "Contact",
        sub: "Let's get your idea off the paper — quick, to-the-point response.",
        name: "Your name", email: "Your email", message: "Message",
        namePh: "What should I call you?", emailPh: "so I can get back to you ;)", messagePh: "Tell us briefly what you need.",
        emailCta: "Send via email", waCta: "Open in WhatsApp",
        quick: { linkedin: "LinkedIn", github: "GitHub", whatsapp: "WhatsApp", cv: "Download CV" },
        consoleCmd: "open --channel linkedin"
      }
    },

    pt: {
      htmlLang: "pt-BR",
      nav: { home: "Início", about: "Sobre", experience: "Experiência", skills: "Habilidades", projects: "Projetos", contact: "Contato", resume: "Currículo" },
      modes: { prof: "Profissional", acad: "Acadêmica", courses: "Cursos & Certificações" },
      hero: { hello: "Olá, eu sou" },
      taglines: ["Desenvolvedor web.", "Designer de Produto em IA.", "Editor de vídeo."],
      about: {
        kicker: "Sobre mim",
        terminal: [
          { type: "type", text: "cat about.txt" },
          {
            type: "out", text:
              `Sou Bernardo Araújo Iannini, 18 anos, estudante de tecnologia no COTEMIG e estagiário na Inspire4U, atuando em desenvolvimento web e projetos de inovação para fintechs.

Tenho experiência prática com C#, SQL, HTML, CSS, WordPress e MySQL, além de projetos em edição e criação de vídeo — área na qual já fui premiado.

Atualmente, aprofundo conhecimentos em desenvolvimento de software e tenho forte interesse em cibersegurança, buscando unir criatividade, técnica e visão estratégica para construir soluções digitais seguras e inovadoras.` },
          { type: "type", text: "contact --show" },
          { type: "out", text: "LinkedIn: linkedin.com/in/bernardo-iannini\nGitHub: github.com/iannini25\nEmail: bernardo.iannini14@gmail.com" }
        ]
      },
      xp: {
        title: "Experiência",
        sub: "Minha trajetória profissional e acadêmica",
        timeline: {
          prof: [
            {
              title: "Desenvolvedor Web & Suporte Digital", org: "Inspire4U", role: "Estágio", loc: "Belo Horizonte, MG",
              bullets: [
                "Desenvolvimento e manutenção de sites em WordPress com foco em performance e usabilidade.",
                "Ajustes em HTML e CSS para melhorar design e experiência do usuário.",
                "Aplicação de técnicas de SEO e GEO para otimizar visibilidade e posicionamento.",
                "Participação em projetos de inovação e suporte digital a fintechs parceiras."
              ],
              skills: ["WordPress", "HTML", "CSS", "SEO", "GEO"]
            }
          ],
          acad: [
            {
              title: "Ensino Técnico em Informática", org: "COTEMIG", role: "Aluno", loc: "Belo Horizonte, MG",
              bullets: [
                "Aprendizado prático em Lógica de Programação, Bancos de Dados e Desenvolvimento Web.",
                "Vivência com ferramentas Google, projetos escolares e práticas voltadas ao mercado de TI.",
                "Formação técnica com foco em programação, inovação e resolução de problemas."
              ],
              skills: ["C#", "MySQL", "HTML", "CSS", "JavaScript", "Linux"]
            }
          ],
          courses: [
            {
              title: "Designing products and services with AI", org: "MIT", role: "Aluno",
              cert: { id: "cert-mit", img: "erpinspire4u.png", label: "Certificado" },
              bullets: ["Fundamentos de ML/DL, estratégia de IA e design de produto aplicados a casos reais."],
              skills: ["Machine Learning", "Deep Learning", "Estratégia de IA", "Design de IA"]
            }
          ]
        }
      },
      skills: { title: "Habilidades", sub: "Clique nos quadrados para revelar.", tilesLabels: { os: "Sistemas Operacionais", programming: "Programação", web: "Desenvolvimento Web", creative: "Criativo" } },
      projects: {
        title: "Projetos",
        sub: "Uma seleção concisa do meu trabalho recente em web, produto e mídia.",
        ctas: { site: "Site", repo: "Repositório", viewMore: "Ver mais" },
        list: [
          { title: "Memória Cache Podcast — Site", desc: "Landing em preto & branco e lista de episódios integrando YouTube/Spotify.", stack: ["HTML", "CSS", "JavaScript"], link: "https://memoriacache.example", repo: "", cover: "memoriacache.png" },
          { title: "Auxílio para Síndico", desc: "Ferramentas para síndicos: tarefas, avisos, relatórios rápidos e fluxos de moradores.", stack: ["Produto", "UX", "Automação"], link: "https://condo-assistant.example", repo: "", cover: "joselopes.png" },
          { title: "Inspire4U ERP — Website", desc: "Site institucional com melhorias de performance, acessibilidade e SEO.", stack: ["WordPress", "Performance", "A11y"], link: "https://erpi4u.com", repo: "", cover: "erpinspire4u.png" }
        ]
      },
      contact: {
        kicker: "Vamos conversar",
        title: "Contato",
        sub: "Tiro sua ideia do papel — resposta direta e objetiva.",
        name: "Seu nome", email: "Seu e-mail", message: "Mensagem",
        namePh: "Como devo te chamar?", emailPh: "para eu poder te responder ;)", messagePh: "Conte rapidamente o que você precisa.",
        emailCta: "Enviar por e-mail", waCta: "Abrir no WhatsApp",
        quick: { linkedin: "LinkedIn", github: "GitHub", whatsapp: "WhatsApp", cv: "Baixar CV" },
        consoleCmd: "open --canal linkedin"
      }
    }
  };
  let LANG = (localStorage.getItem('lang') || 'en');

  /* =========================================================
     HOME (Hero + Tagline com efeito Scramble)
     ========================================================= */
  const taglineEl = document.getElementById('taglineText');
  let phrases = I18N[LANG].taglines;
  const HOLD_MS = 3000, TYPE_MS = 40, ERASE_MS = 25, FLICKERS = 1;
  let phraseIdx = 0;

  async function scrambleOut(text) {
    for (let len = text.length; len >= 0; len--) {
      for (let f = 0; f < FLICKERS; f++) { taglineEl.textContent = text.slice(0, len) + randChars(text.length - len); await sleep(ERASE_MS / 2); }
      taglineEl.textContent = text.slice(0, len); await sleep(ERASE_MS);
    }
  }
  async function scrambleIn(text) {
    for (let i = 0; i <= text.length; i++) {
      const settled = text.slice(0, i); const rest = text.length - i;
      for (let f = 0; f < FLICKERS; f++) { taglineEl.textContent = settled + randChars(rest); await sleep(TYPE_MS / 2); }
      taglineEl.textContent = settled; await sleep(TYPE_MS);
    }
  }
  async function cycleTaglines() {
    if (!taglineEl) return;
    taglineEl.textContent = phrases[phraseIdx];
    taglineEl.classList.toggle('glow', phrases[phraseIdx].toLowerCase().includes('web developer'));
    while (true) {
      await sleep(HOLD_MS);
      const current = phrases[phraseIdx];
      const next = phrases[(phraseIdx + 1) % phrases.length];
      await scrambleOut(current);
      await scrambleIn(next);
      taglineEl.classList.toggle('glow', next.toLowerCase().includes('web developer'));
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }
  function renderHero(lang) {
    const h = I18N[lang].hero; const hello = document.querySelector('.hero .hello'); if (hello) hello.textContent = h.hello;
    phrases = I18N[lang].taglines; // loop continua usando novo conjunto
  }

  /* =========================================================
     ABOUT (Terminal estilo Kali + Janela R/Y/G -> Popups)
     ========================================================= */
  const term = document.getElementById('terminal');
  function termLine(html) { const d = document.createElement('div'); d.innerHTML = html; term.appendChild(d); term.scrollTop = term.scrollHeight; }

  async function typeKaliPromptAndCmd(cmdToType) {
    termLine(`<span class="k-ps1-top">┌──(</span><span class="k-ps1-user">bernardoiannini</span><span class="k-ps1-top">㉿</span><span class="k-ps1-host">localhost</span><span class="k-ps1-top">)-[</span><span class="k-ps1-path">~</span><span class="k-ps1-top">]</span>`);
    const pre = `<span class="k-ps1-bottom">└─$</span> <span class="cmd">`;
    let typed = '';
    for (let i = 0; i <= cmdToType.length; i++) {
      const html = pre + typed + `</span>`;
      if (term.lastChild?.dataset?.typing === '1') { term.lastChild.innerHTML = html; } else { const d = document.createElement('div'); d.dataset.typing = '1'; d.innerHTML = html; term.appendChild(d); }
      if (i < cmdToType.length) { typed += cmdToType[i]; await sleep(22); }
    }
    term.lastChild?.removeAttribute('data-typing');
  }
  async function renderTerminal(lang) {
    if (!term) return; term.innerHTML = '';
    const script = I18N[lang].about.terminal;
    for (const step of script) {
      if (step.type === 'type') await typeKaliPromptAndCmd(step.text);
      else if (step.type === 'out') termLine(`<span class="out">${step.text.replace(/\n/g, '<br>')}</span>`);
      await sleep(300);
    }
  }

  /* ===== Pop-up mínimo reutilizável ===== */
  (function ensureModal() {
    if (document.getElementById('ux-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'ux-modal'; modal.setAttribute('aria-hidden', 'true');
    modal.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:9999;';
    modal.innerHTML = `
      <div class="modal-backdrop" data-close="true" style="position:absolute;inset:0;background:rgba(0,0,0,.55)"></div>
      <div class="modal-panel" role="dialog" aria-modal="true" style="position:relative;z-index:1;width:min(460px,96vw);background:#0f1713;color:#e7f5ee;border:1px solid rgba(65,110,84,.35);border-radius:14px;box-shadow:0 30px 70px rgba(0,0,0,.6);padding:20px">
        <button class="modal-close" data-close="true" aria-label="Fechar" style="position:absolute;right:10px;top:6px;width:32px;height:32px;border:none;border-radius:8px;background:transparent;color:#cfe7db;font-size:24px;cursor:pointer">×</button>
        <h3 id="modal-title" style="margin:0 0 8px;font-size:20px">Mensagem</h3>
        <p id="modal-msg" style="margin:0 0 16px;opacity:.95"></p>
        <button class="modal-ok" data-close="true" style="appearance:none;border:1px solid rgba(34,197,94,.5);background:rgba(34,197,94,.15);color:#d8f3e4;font-weight:800;font-family:inherit;letter-spacing:.02em;padding:8px 14px;border-radius:10px;cursor:pointer">Entendi</button>
      </div>`;
    document.body.appendChild(modal);
    modal.show = (title, msg) => { modal.querySelector('#modal-title').textContent = title; modal.querySelector('#modal-msg').textContent = msg; modal.style.display = 'flex'; modal.setAttribute('aria-hidden', 'false'); };
    modal.hide = () => { modal.style.display = 'none'; modal.setAttribute('aria-hidden', 'true'); };
    modal.addEventListener('click', e => { if (e.target.dataset.close === 'true') modal.hide(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display === 'flex') modal.hide(); });
  })();
  function openModal(title, msg) { const m = document.getElementById('ux-modal'); if (m && typeof m.show === 'function') m.show(title, msg); }

  // Dots da barra do terminal
  document.querySelector('.t-dot.t-r')?.addEventListener('click', () => openModal('Fechar janela', 'Pode fechar não animal'));
  document.querySelector('.t-dot.t-y')?.addEventListener('click', () => openModal('Minimizar', 'Minizar nada náo'));
  document.querySelector('.t-dot.t-g')?.addEventListener('click', () => openModal('Maximizar', 'Sai fora'));

  /* =========================================================
     EXPERIENCE (timeline + modos + certificado)
     ========================================================= */
  const btnAcad = document.getElementById('btnAcad');
  const btnProf = document.getElementById('btnProf');
  const btnCourses = document.getElementById('btnCourses');
  const groupAcad = document.getElementById('group-acad');
  const groupProf = document.getElementById('group-prof');
  const groupCourses = document.getElementById('group-courses');
  const tlMode = document.getElementById('tlMode');
  let CURRENT_MODE = 'prof';

  function buildTlEntry(e, side) {
    const el = document.createElement('article');
    el.className = `tl-entry ${side}`;
    el.innerHTML = `
    <span class="dot"></span>
    <div class="tl-card panel">
      <div class="card-head"><span class="caret">›_</span><span class="sep"></span></div>
      <h3>${e.title}</h3>

      <div class="meta">
        <span class="pill org">${e.org}</span>
        <span class="pill role">${e.role}</span>
      </div>

      ${e.loc ? `
      <div class="loc">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" stroke="currentColor" stroke-width="2" fill="none" />
          <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
        </svg>
        <span>${e.loc}</span>
      </div>` : ``}

      ${e.cert ? `
        <div class="cert-btn-wrap">
          <button class="btn-cert" type="button" data-cert="${e.cert.id}">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <use href="#ico-certificate" />
            </svg> ${e.cert.label}
          </button>
        </div>
        <dialog id="${e.cert.id}" class="cert-modal">
          <div class="cert-content">
            <button class="cert-close" aria-label="Fechar">&times;</button>
            <img src="${e.cert.img}" alt="${e.title}" />
          </div>
        </dialog>` : ``}

      ${Array.isArray(e.bullets) ? `<ul class="bullets">${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ``}
      <div class="skills">${(e.skills || []).map(s => `<button class="btn-skill">${s}</button>`).join('')}</div>
    </div>`;
    return el;
  }


  function renderTimeline(lang) {
    if (!groupProf || !groupAcad || !groupCourses) return;
    groupProf.innerHTML = ''; groupAcad.innerHTML = ''; groupCourses.innerHTML = '';
    const data = I18N[lang].xp.timeline; const sides = n => (n % 2 ? 'right' : 'left');
    data.prof.forEach((e, i) => groupProf.appendChild(buildTlEntry(e, sides(i))));
    data.acad.forEach((e, i) => groupAcad.appendChild(buildTlEntry(e, sides(i))));
    data.courses.forEach((e, i) => groupCourses.appendChild(buildTlEntry(e, sides(i))));

    // Modais de certificado
    document.querySelectorAll('.btn-cert').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.cert; const dialog = document.getElementById(id);
        if (dialog?.showModal) dialog.showModal();
      });
    });
    document.querySelectorAll('.cert-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', e => { e.target.closest('dialog')?.close(); });
    });

    setMode(CURRENT_MODE, lang);
  }

  function setMode(mode, lang = LANG) {
    CURRENT_MODE = mode; if (tlMode) tlMode.textContent = I18N[lang].modes[mode];
    const isProf = mode === 'prof', isAcad = mode === 'acad', isCourses = mode === 'courses';
    groupProf?.classList.toggle('is-hidden', !isProf);
    groupAcad?.classList.toggle('is-hidden', !isAcad);
    groupCourses?.classList.toggle('is-hidden', !isCourses);
    btnProf?.classList.toggle('active', isProf); btnAcad?.classList.toggle('active', isAcad); btnCourses?.classList.toggle('active', isCourses);
    btnProf?.setAttribute('aria-selected', String(isProf)); btnAcad?.setAttribute('aria-selected', String(isAcad)); btnCourses?.setAttribute('aria-selected', String(isCourses));
  }
  btnProf?.addEventListener('click', () => setMode('prof'));
  btnAcad?.addEventListener('click', () => setMode('acad'));
  btnCourses?.addEventListener('click', () => setMode('courses'));

  // Ícones grandes da seção experiência (apenas no light alternam ativo)
  document.querySelectorAll('.xp-ico').forEach(icon => {
    icon.addEventListener('click', () => { if (document.documentElement.getAttribute('data-theme') === 'light') icon.classList.toggle('active'); });
  });

  /* =========================================================
     PROJECTS (cards uniformes por idioma)
     ========================================================= */
  function renderProjects(lang) {
    const grid = document.getElementById('projGrid'); if (!grid) return;
    const list = I18N[lang].projects.list; const ctas = I18N[lang].projects.ctas; grid.innerHTML = '';
    function card(p) {
      const el = document.createElement('article'); el.className = 'proj-card';
      const chips = (p.stack || []).map(s => `<span class="proj-chip">${s}</span>`).join('');
      const ctaLive = p.link ? `<a class="btn-link" href="${p.link}" target="_blank" rel="noopener">${ctas.site}</a>` : '';
      const ctaRepo = p.repo ? `<a class="btn-link" href="${p.repo}" target="_blank" rel="noopener">${ctas.repo}</a>` : '';
      el.innerHTML = `
        <img class="proj-cover" src="${p.cover}" alt="Cover image for ${p.title}">
        <div class="proj-body"><h3 class="proj-title">${p.title}</h3><p class="proj-desc">${p.desc || ''}</p><div class="proj-meta">${chips}</div></div>
        <div class="proj-cta">${ctaLive}${ctaRepo}</div>`;
      return el;
    }
    list.forEach(p => grid.appendChild(card(p)));
    document.querySelector('#projects .section-title')?.replaceChildren(document.createTextNode(I18N[lang].projects.title));
    const pSub = document.querySelector('#projects .section-sub'); if (pSub) pSub.textContent = I18N[lang].projects.sub;
    const more = document.querySelector('#projects .btn-more span'); if (more) more.textContent = ctas.viewMore;
  }

  /* =========================================================
     SKILLS (títulos/labels + tiles interativos)
     ========================================================= */
  function renderSkills(lang) {
    const S = I18N[lang].skills; const title = document.querySelector('#skills .section-title'); const sub = document.querySelector('#skills .section-sub');
    if (title) title.textContent = S.title; if (sub) sub.textContent = S.sub;
    const tiles = document.querySelectorAll('.skills-tiles .tile-square');
    const keysByIndex = ['os', 'programming', 'web', 'creative'];
    tiles.forEach((tile, i) => { const key = tile.getAttribute('data-label-key') || keysByIndex[i]; const label = S.tilesLabels[key] || ''; if (label) tile.setAttribute('data-label', label); });
  }

  // Interações dos tiles
  document.querySelectorAll('.skills-tiles .tile').forEach(tile => {
    tile.addEventListener('click', (e) => { if (!(e.target instanceof HTMLElement)) return; const isOpen = tile.classList.toggle('open'); tile.setAttribute('aria-expanded', String(isOpen)); });
  });
  document.querySelectorAll('.skills-tiles .tile-square').forEach(tile => {
    tile.addEventListener('pointermove', (e) => { const r = tile.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 100; tile.style.setProperty('--sheen-x', x + '%'); });
    tile.addEventListener('pointerleave', () => tile.style.setProperty('--sheen-x', '-20%'));
  });

  // Tooltips dos ícones revelados
  function refreshSkillItemTooltips() {
    document.querySelectorAll('.skills-tiles .reveal-grid li').forEach(li => {
      const current = li.getAttribute('data-label'); if (current && current.trim()) return;
      const img = li.querySelector('img, svg');
      const fromAlt = img?.getAttribute('alt') || img?.getAttribute('aria-label') || img?.getAttribute('data-name') || '';
      if (fromAlt.trim()) { li.setAttribute('data-label', fromAlt.trim()); li.setAttribute('title', fromAlt.trim()); }
    });
  }

  /* =========================================================
     CONTACT (console + form + WhatsApp + efeitos)
     ========================================================= */
  function renderContact(lang) {
    const C = I18N[lang].contact;
    const kk = document.querySelector('#contato .contact-kicker'); const tt = document.querySelector('#contato .contact-title'); const ss = document.querySelector('#contato .contact-sub');
    if (kk) kk.textContent = C.kicker; if (tt) tt.innerHTML = `<span class="caret">›_</span> ${C.title}`; if (ss) ss.textContent = C.sub;
    const nameInput = document.getElementById('fName'); const emailInput = document.getElementById('fEmail'); const msgInput = document.getElementById('fMsg');
    const nameLabel = nameInput?.closest('label')?.querySelector('.f-label'); const emailLabel = emailInput?.closest('label')?.querySelector('.f-label'); const msgLabel = msgInput?.closest('label')?.querySelector('.f-label');
    if (nameLabel) nameLabel.textContent = C.name; if (emailLabel) emailLabel.textContent = C.email; if (msgLabel) msgLabel.textContent = C.message;
    if (nameInput) nameInput.placeholder = C.namePh; if (emailInput) emailInput.placeholder = C.emailPh; if (msgInput) msgInput.placeholder = C.messagePh;
    const emailBtn = document.getElementById('sendMail'); const waBtn = document.getElementById('sendWhats');
    if (emailBtn) emailBtn.lastChild.nodeValue = ' ' + C.emailCta; if (waBtn) waBtn.lastChild.nodeValue = ' ' + C.waCta;
    const quick = document.querySelector('.contact-console .c-quick');
    if (quick) {
      quick.querySelectorAll('.cbtn').forEach(a => {
        if (a.href?.includes('linkedin')) a.textContent = C.quick.linkedin;
        else if (a.href?.includes('github')) a.textContent = C.quick.github;
        else if (a.id === 'whatsQuick') a.textContent = C.quick.whatsapp;
        else if (a.hasAttribute('download')) a.textContent = C.quick.cv;
      });
    }
    const cmd = document.querySelector('.contact-console .c-line .cmd'); if (cmd) cmd.textContent = C.consoleCmd;
  }

  // Envio por e-mail
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fName')?.value?.trim() || '';
    const email = document.getElementById('fEmail')?.value?.trim() || '';
    const msg = document.getElementById('fMsg')?.value?.trim() || '';
    const subject = `Contact via portifólio — ${name || 'No name'}`;
    const body = [`Name: ${name || '(não informado)'}`, `Email: ${email || '(não informado)'}`, '', msg || '(mensagem em branco)'].join('\n');
    const mail = `mailto:bernardo.iannini14@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; window.location.href = mail;
  });
  function buildWhatsLink() {
    const name = document.getElementById('fName')?.value?.trim() || '';
    const msg = document.getElementById('fMsg')?.value?.trim() || '';
    const text = `Hi, i'm ${name || '(não informado)'}\n\n${msg || ''}`.trim();
    const phone = '5531995624617';
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
  document.getElementById('sendWhats')?.addEventListener('click', () => window.open(buildWhatsLink(), '_blank'));
  document.getElementById('whatsQuick')?.addEventListener('click', (e) => { e.preventDefault(); window.open(buildWhatsLink(), '_blank'); });

  // Efeitos: glow/magnetismo
  const cap = document.querySelector('.capsule');
  cap?.addEventListener('pointermove', (e) => { const r = cap.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 100; const y = ((e.clientY - r.top) / r.height) * 100; cap.style.setProperty('--mx', x + '%'); cap.style.setProperty('--my', y + '%'); });
  document.querySelectorAll('.cbtn').forEach(btn => {
    const strength = 12;
    btn.addEventListener('pointermove', (e) => { const r = btn.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2); const dy = e.clientY - (r.top + r.height / 2); btn.style.transform = `translate(${dx / strength}px, ${dy / strength}px)`; });
    ['pointerleave', 'blur'].forEach(ev => btn.addEventListener(ev, () => btn.style.transform = ''));
  });

  /* =========================================================
     NAVBAR (resume label) + HTML lang
     ========================================================= */
  function renderNav(lang) {
    const code = document.getElementById('langCode'); if (code) code.textContent = lang.toUpperCase();
    document.documentElement.lang = I18N[lang].htmlLang || lang;
    const resumeSpan = document.querySelector('.resume-btn [data-i18n="nav.resume"]'); if (resumeSpan) resumeSpan.textContent = I18N[lang].nav.resume;
  }

  /* =========================================================
     THEME (dark default + persist + posicionamento)
     ========================================================= */
  (function themeToggle() {
    const html = document.documentElement; const cb = document.getElementById('darkmode-toggle'); const navRight = document.querySelector('.nav-right');
    function place() { const w = navRight?.offsetWidth || 0; document.documentElement.style.setProperty('--navr-w', w + 'px'); }
    window.addEventListener('resize', place); place();
    html.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); if (cb) cb.checked = true;
    function setTheme(next) { html.setAttribute('data-theme', next); localStorage.setItem('theme', next); if (cb) cb.checked = (next === 'dark'); }
    cb?.addEventListener('change', () => setTheme(cb.checked ? 'dark' : 'light'));
  })();

  /* =========================================================
     APLICAÇÃO DE I18N (um lugar só)
     ========================================================= */
  function applyI18n(lang) {
    LANG = lang; localStorage.setItem('lang', LANG);
    // Nav + atributos
    renderNav(lang);
    // Textos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const keyPath = el.getAttribute('data-i18n');
      const val = keyPath.split('.').reduce((obj, k) => obj?.[k], I18N[lang]);
      if (typeof val === 'string') el.textContent = val;
    });
    // Seções
    renderHero(lang);
    renderTerminal(lang);
    const xpTitle = document.querySelector('.xp-title'); if (xpTitle) xpTitle.textContent = I18N[lang].xp.title;
    const xpSub = document.querySelector('.xp-sub'); if (xpSub) xpSub.textContent = I18N[lang].xp.sub;
    renderTimeline(lang);
    renderSkills(lang);
    renderProjects(lang);
    renderContact(lang);
    refreshSkillItemTooltips();
  }

  /* =========================================================
     LANGUAGE SWITCH (menu + init)
     ========================================================= */
  (function languageSwitch() {
    const btn = document.getElementById('langBtn'); const menu = document.getElementById('langMenu'); if (!btn || !menu) return;
    btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('open'); btn.setAttribute('aria-expanded', menu.classList.contains('open')); });
    menu.querySelectorAll('[data-lang]').forEach(li => {
      li.addEventListener('click', () => { const lang = li.getAttribute('data-lang'); menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); applyI18n(lang); menu.querySelectorAll("[role='option']").forEach(o => o.setAttribute('aria-selected', 'false')); li.setAttribute('aria-selected', 'true'); });
    });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target) && !btn.contains(e.target)) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  })();

  /* =========================================================
     INIT
     ========================================================= */
  function init() { applyI18n(LANG); cycleTaglines(); }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);

})();

// Liga a animação do botão de currículo no header
// Liga a animação do botão de currículo no header (somente desktop)
(function enableResumeAttention(){
  const resumeBtn = document.querySelector('.resume-btn');
  if (resumeBtn && window.matchMedia('(min-width: 901px)').matches){
    resumeBtn.classList.add('resume-attn');
  }
})();




/* ===== MENU MOBILE ===== */
(function(){
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileNav');
  if(!btn || !menu) return;

  const open  = () => {
    menu.classList.add('open');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded','true');
    menu.setAttribute('aria-hidden','false');
  };
  const close = () => {
    menu.classList.remove('open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-hidden','true');
  };

  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  // fecha ao clicar fora
  document.addEventListener('click', (e)=>{
    if(menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)){
      close();
    }
  });

  // fecha com ESC
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && menu.classList.contains('open')) close();
  });

  // fecha ao navegar por âncora
  menu.querySelectorAll('a[data-scroll]').forEach(a=>{
    a.addEventListener('click', ()=> close());
  });

  // integra com o scroll suave que você já tem:
  // (nada a mudar – seu offset já usa a altura do header)
})();


/* ===== RESUME BUTTON: atenção sutil loop ===== */
(function(){
  const r = document.querySelector('.resume-btn');
  if(r) r.classList.add('resume-attn');
})();

