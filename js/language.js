'use strict';

/* ======================================================================
   CORE: helpers + I18N + estado de linguagem + applyI18n + language switch
   ====================================================================== */

/* ===== Helpers globais ===== */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const SCRAMBLE_CHARS = "Aabcdefghijklmnopqrstuvwxyz!@#$%&*";
function randChars(n) {
  return Array.from({ length: n }, () =>
    SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
  ).join('');
}

/* =========================================================
   I18N (EN/PT) + Estado de linguagem
   ========================================================= */
const I18N = {
  en: {
    htmlLang: "en",
    nav: { home: "Home", about: "About", experience: "Experience", skills: "Skills", projects: "Projects", contact: "Contact", resume: "CV" },
    modes: { prof: "Professional", acad: "Academic", courses: "Courses & Certifications" },
    hero: { hello: "Hi, I'm" },
    taglines: ["Web developer.", "AI Product Designer.", "Video editor."],
    about: {
      kicker: "About me",
      terminal: [
        { type: "type", text: "cat about.txt" },
        {
          type: "out",
          text:
            `I'm Bernardo Araújo Iannini, 18 years old, a technology student at COTEMIG and an intern at Inspire4U, where I work in web development and innovation projects for fintechs.

I have hands-on experience with C#, SQL, HTML, CSS, WordPress, and MySQL, as well as projects in video editing and creation, an area in which I have already won awards.

Currently, I am deepening my knowledge in software development and have a strong interest in cybersecurity, seeking to combine creativity, technical skills, and strategic vision to build secure and innovative digital solutions.`
        },
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
            title: "Web Developer & Digital Support",
            org: "Inspire4U",
            role: "Internship",
            loc: "Belo Horizonte, MG",
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
            title: "Technical High School in IT",
            org: "COTEMIG",
            role: "Student",
            loc: "Belo Horizonte, MG",
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
            title: "Designing products and services with AI",
            org: "MIT",
            role: "Student",
            cert: { id: "cert-mit", img: "erpinspire4u.png", label: "Certificate" },
            bullets: ["Foundations of ML/DL, AI strategy and product design applied to real use cases."],
            skills: ["Machine Learning", "Deep Learning", "AI Strategy", "AI Design"]
          }
        ]
      }
    },
    skills: {
      title: "Skills",
      sub: "Click the squares to reveal.",
      tilesLabels: {
        os: "Operating Systems",
        programming: "Programming",
        web: "Web Development",
        creative: "Creative"
      }
    },
    projects: {
      title: "Projects",
      sub: "A concise selection of my recent work in web, product, and media.",
      ctas: { site: "Site", repo: "Repo", viewMore: "View more" },
      list: [
        {
          title: "Memória Cache Podcast — Website",
          desc: "Black & white landing plus episodes list with YouTube/Spotify integrations.",
          longDesc: `My first fully hand-coded professional website using pure HTML, CSS and JavaScript.  
Includes a clean landing page, episodes section, and a Reels-style “Short Clips” system powered by manually structured JSON files.  
This project taught me front-end architecture and real data organization.
`
,
          stack: ["HTML", "CSS", "JavaScript", "UX"],
          link: "https://memoriacache.com.br",
          repo: "",
          cover: "img/memoriacache.png"
        },
        {
          title: "Condo Manager Assistant",
          desc: "Toolbox for condo managers: tasks, notices, quick reports, and resident flows.",
          longDesc: `Built to solve the information overload in my building’s WhatsApp group.  
I developed an online platform using Firebase to centralize announcements, tasks and resident communication.  
It improved clarity and helped the building management run smoothly.`
,
          stack: ["HTML", "CSS", "JavaScript", "Product", "UX",],
          link: "https://condo-assistant.example",
          repo: "",
          cover: "img/joselopes.png"
        },
        {
          title: "Inspire4U ERP — Website",
          desc: "Corporate ERP website with performance, accessibility and SEO improvements.",
          longDesc: `My first WordPress project, built with no templates.  
I designed everything in Figma and rebuilt it manually with Elementor and custom CSS.  
Includes SEO, accessibility and performance optimization to elevate Inspire4U’s digital presence.`
,
          stack: ["WordPress", "Performance", "A11y", "Figma", "SEO", "Elementor"],
          link: "https://erpi4u.com",
          repo: "",
          cover: "img/erpinspire4u.png"
        }
      ]
    },
    contact: {
      kicker: "Let's talk",
      title: "Contact",
      sub: "Let's get your idea off the paper — quick, to-the-point response.",
      name: "Your name",
      email: "Your email",
      message: "Message",
      namePh: "What should I call you?",
      emailPh: "so I can get back to you ;)",
      messagePh: "Tell us briefly what you need.",
      emailCta: "Send via email",
      waCta: "Open in WhatsApp",
      quick: { linkedin: "LinkedIn", github: "GitHub", whatsapp: "WhatsApp", cv: "Download CV" },
      consoleCmd: "open --channel linkedin"
    }
  },

  /* ==================== PT ===================== */

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
          type: "out",
          text:
            `Sou Bernardo Araújo Iannini, 18 anos, estudante de tecnologia no COTEMIG e estagiário na Inspire4U, atuando em desenvolvimento web e projetos de inovação para fintechs.

Tenho experiência prática com C#, SQL, HTML, CSS, WordPress e MySQL, além de projetos em edição e criação de vídeo — área na qual já fui premiado.

Atualmente, aprofundo conhecimentos em desenvolvimento de software e tenho forte interesse em cibersegurança, buscando unir criatividade, técnica e visão estratégica para construir soluções digitais seguras e inovadoras.`
        },
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
            title: "Desenvolvedor Web & Suporte Digital",
            org: "Inspire4U",
            role: "Estágio",
            loc: "Belo Horizonte, MG",
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
            title: "Ensino Técnico em Informática",
            org: "COTEMIG",
            role: "Aluno",
            loc: "Belo Horizonte, MG",
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
            title: "Designing products and services with AI",
            org: "MIT",
            role: "Aluno",
            cert: { id: "cert-mit", img: "erpinspire4u.png", label: "Certificado" },
            bullets: [
              "Fundamentos de ML/DL, estratégia de IA e design de produto aplicados a casos reais."
            ],
            skills: ["Machine Learning", "Deep Learning", "Estratégia de IA", "Design de IA"]
          }
        ]
      }
    },

    skills: {
      title: "Habilidades",
      sub: "Clique nos quadrados para revelar.",
      tilesLabels: {
        os: "Sistemas Operacionais",
        programming: "Programação",
        web: "Desenvolvimento Web",
        creative: "Criativo"
      }
    },

    projects: {
      title: "Projetos",
      sub: "Uma seleção concisa do meu trabalho recente em web, produto e mídia.",
      ctas: { site: "Site", repo: "Repositório", viewMore: "Ver mais" },
      list: [
        {
          title: "Memória Cache Podcast — Website",
          desc: "Landing em preto & branco e lista de episódios integrando YouTube/Spotify.",
          longDesc: `Meu primeiro site profissional feito totalmente à mão usando HTML, CSS e JavaScript puro.  
Possui landing page limpa, página de episódios e um sistema de “cortes” estilo Reels/TikTok, alimentado por arquivos JSON organizados manualmente.  
O projeto me ensinou arquitetura front-end, organização e dinâmica real com dados estruturados.`
,
          stack: ["HTML", "CSS", "JavaScript", "UX"],
          link: "https://memoriacache.com.br",
          repo: "https://github.com/iannini25",
          cover: "img/memoriacache.png"
        },
        {
          title: "Auxílio para Síndico",
          desc: "Ferramentas para síndicos: tarefas, avisos, relatórios rápidos e fluxos de moradores.",
          longDesc: `Criado para resolver o caos de informações no grupo de WhatsApp do meu prédio.  
Desenvolvi uma plataforma online com Firebase para centralizar avisos, tarefas e comunicações entre moradores.  
Melhorou a transparência e facilitou muito o trabalho do síndico.`
,
          stack: ["HTML", "CSS", "JavaScript", "Product", "UX",],
          link: "https://condo-assistant.example",
          repo: "https://github.com/iannini25",
          cover: "img/joselopes.png"
        },
        {
          title: "Inspire4U ERP — Website",
          desc: "Site institucional com melhorias de performance, acessibilidade e SEO.",
          longDesc: `Meu primeiro projeto em WordPress, desenvolvido sem templates.  
Criei o design no Figma e reconstruí tudo manualmente com Elementor e CSS próprio.  
Inclui SEO, acessibilidade e performance ajustadas para posicionar melhor a Inspire4U.`
,
          stack: ["WordPress", "Performance", "A11y", "Figma", "SEO", "Elementor"],
          link: "https://erpi4u.com",
          repo: "https://github.com/iannini25",
          cover: "img/erpinspire4u.png"
        }
      ]
    },

    contact: {
      kicker: "Vamos conversar",
      title: "Contato",
      sub: "Tiro sua ideia do papel — resposta direta e objetiva.",
      name: "Seu nome",
      email: "Seu e-mail",
      message: "Mensagem",
      namePh: "Como devo te chamar?",
      emailPh: "para eu poder te responder ;)",
      messagePh: "Conte rapidamente o que você precisa.",
      emailCta: "Enviar por e-mail",
      waCta: "Abrir no WhatsApp",
      quick: {
        linkedin: "LinkedIn",
        github: "GitHub",
        whatsapp: "WhatsApp",
        cv: "Baixar CV"
      },
      consoleCmd: "open --canal linkedin"
    }
  }
};

let LANG = localStorage.getItem('lang') || 'en';

/* =========================================================
   NAVBAR (apenas lang code + lang do <html>)
   ========================================================= */
function renderNav(lang) {
  const code = document.getElementById('langCode');
  if (code) code.textContent = lang.toUpperCase();
  document.documentElement.lang = I18N[lang].htmlLang || lang;
}

/* =========================================================
   I18N — APLICAÇÃO (carrega tudo)
   ========================================================= */
function applyI18n(lang) {
  LANG = lang;
  localStorage.setItem('lang', LANG);

  renderNav(lang);
  // essas funções vêm dos outros arquivos: home/about/experience/skills/projects/contact
  if (typeof renderHero === 'function') renderHero(lang);
  if (typeof renderTerminal === 'function') renderTerminal(lang);
  if (typeof renderTimeline === 'function') renderTimeline(lang);
  if (typeof renderSkills === 'function') renderSkills(lang);
  if (typeof renderProjects === 'function') renderProjects(lang);
  if (typeof renderContact === 'function') renderContact(lang);

  if (typeof refreshSkillItemTooltips === 'function') {
    refreshSkillItemTooltips();
  }

  // Textos com data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keyPath = el.getAttribute('data-i18n');
    const val = keyPath
      .split('.')
      .reduce((obj, k) => obj?.[k], I18N[lang]);

    if (typeof val === 'string') el.textContent = val;
  });
}

/* =========================================================
   LANGUAGE SWITCH (menu suspenso do header)
   ========================================================= */
(function languageSwitch() {
  const btn = document.getElementById('langBtn');
  const menu = document.getElementById('langMenu');

  if (!btn || !menu) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', menu.classList.contains('open'));
  });

  menu.querySelectorAll('[data-lang]').forEach(li =>
    li.addEventListener('click', () => {
      const lang = li.getAttribute('data-lang');
      if (!lang) return;

      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      applyI18n(lang);

      menu
        .querySelectorAll("[role='option']")
        .forEach(o => o.setAttribute('aria-selected', 'false'));

      li.setAttribute('aria-selected', 'true');
    })
  );

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
