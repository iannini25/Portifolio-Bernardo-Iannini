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
    nav: { home: "Home", about: "About", services: "Services", work: "Work", experience: "Experience", skills: "Skills", projects: "Projects", blog: "Blog", blogSoon: "soon", contact: "Contact", resume: "CV" },
    modes: { prof: "Professional", acad: "Academic", courses: "Courses & Certifications" },
    tabAway: "come back here :(",
    hero: { hello: "Hi, I'm" },
    taglines: [
      "Full Stack Developer.",
      "I build platforms & MVPs.",
      "Automation & AI.",
      "I fix and deploy projects."
    ],
    about: {
      kicker: "The Journey",
      title: "The Journey",
      titleA: "Built from curiosity,",
      titleB: "shaped by code.",
      sub: "A bit about me, what I do and what I love building.",
      statusLabel: "Status",
      statusValue: "Open to new projects",
      blogLabel: "Blog",
      blogTag: "Soon",
      blogTitle: "Sharing what I learn along the way.",
      blogDesc: "Case studies, technical decisions and behind-the-scenes of my projects.",
      blogCta: "Coming soon",
      cvLabel: "Resume",
      cvTitle: "Full journey on a single page.",
      cvCta: "Download resume",
      locLabel: "Where I'm based",
      locValue: "Belo Horizonte, MG · Brazil",
      locRemote: "Remote · Brazil/Ireland",
      locTimezone: "UTC−3",
      terminal: [
        { type: "type", text: "cat about.txt" },
        {
          type: "out",
          text:
            `I'm Bernardo Araújo Iannini, 19 years old, a Web and Mobile Development student at COTEMIG and Full Stack Developer at Inspire4U, where I build digital solutions, web platforms and innovation projects.

I currently work on the Athena 7 ecosystem, a platform focused on whistleblowing channels, women's protection in corporate environments, NR-1 compliance support, and corporate education. On this project, I work across different parts of the product — from interfaces and features to integrations, improvements and platform architecture.

I have hands-on experience with C#, MySQL, HTML, CSS, JavaScript, Kotlin, Swift, Dart, Flutter and Python, as well as exposure to other modern development technologies. I'm also into video editing and creation, an area where I've already shipped award-winning projects and which sharpens my creative vision within technology.

Today, I'm deepening my knowledge in software development and studying cybersecurity, with a focus on tools and concepts tied to pentesting. I'm also connected to the Innovation Business Alliance, an organization with presence in Ireland, working to bring technology, innovation and real impact closer together.

I'm passionate about technology, solving problems and turning ideas into real products. I'm always looking to grow, build more complete solutions and ship well-thought-out projects for clients, users and the market.`
        },
        { type: "type", text: "contact --show" },
        { type: "out", text: "LinkedIn: linkedin.com/in/bernardo-iannini\nGitHub: github.com/iannini25\nEmail: bernardo.iannini14@gmail.com" }
      ]
    },
    services: {
      title: "Services",
      sub: "What I deliver for clients and teams.",
      list: [
        {
          tag: "WEB",
          icon: "code",
          color: "#22c55e",
          title: "Web Development",
          desc: "Building landing pages, institutional websites and modern interfaces — fast, responsive and designed to convey value and drive results.",
          features: ["Landing Pages", "Institutional Websites", "Page Redesigns"]
        },
        {
          tag: "CORE",
          icon: "layers",
          color: "#2dd4bf",
          title: "Systems & Platforms",
          desc: "Full web platform development, MVPs, dashboards and tailored systems with real front-end, back-end, database and authentication architecture.",
          features: ["Web Platforms", "Dashboards & Panels", "Systems from Scratch"]
        },
        {
          tag: "IA",
          icon: "brain",
          color: "#a3e635",
          title: "Automation & AI",
          desc: "Creating automations, intelligent flows and AI-driven solutions to reduce manual work, improve processes and make operations more efficient.",
          features: ["Process Automation", "Agents & Chatbots", "API Integrations"]
        },
        {
          tag: "OPS",
          icon: "tool",
          color: "#10b981",
          title: "Fix & Deploy",
          desc: "Fixing, improving and shipping existing projects — buggy systems, code generated through Vibe Coding, and applications that need to reach production.",
          features: ["Bug Fixes", "Code Refactoring", "VPS/Cloud Deploy"]
        }
      ]
    },
    xp: {
      title: "Experience",
      sub: "My professional and academic journey",
      timeline: {
        currentLabel: "Current",
        currentSub: "IN PROGRESS",
        prof: [
          {
            title: "Web Developer & Digital Support",
            org: "Inspire4U",
            role: "Internship",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "MAY" },
            end: { year: 2026, month: "JAN" },
            bullets: [
              "Worked on development and maintenance of WordPress websites, focusing on performance and usability.",
              "Implemented HTML and CSS adjustments to improve design and user experience.",
              "Applied SEO and GEO techniques to optimize digital visibility and positioning.",
              "Participated in innovation projects and provided digital support for partner fintechs."
            ],
            skills: ["WordPress", "HTML", "CSS", "SEO", "GEO"]
          },
          {
            title: "Full Stack Developer — Athena7 (Whistleblower)",
            org: "Inspire4U",
            role: "Internship",
            loc: "Belo Horizonte, MG",
            start: { year: 2026, month: "JAN" },
            end: { current: true },
            bullets: [
              "End-to-end full-stack development with a strong focus on UX, performance and reliability.",
              "Designed and implemented a multi-tenant architecture (multiple organizations) with role-based access control.",
              "Built core reporting flows: incident submission, follow-ups, messaging, status tracking and audit/history.",
              "Integrated an AI assistant to guide users and improve the reporting experience while minimizing exposure of sensitive data.",
              "Structured and maintained the database schema and migrations to ensure consistency and scalability.",
              "Deployed and operated the platform on a VPS, managing environment configuration and production services (process manager + web server).",
              "Added user-protection features (quick-exit patterns, discreet UX) to improve safety during reporting."
            ],
            skills: ["TypeScript", "React", "Node.js", "MySQL", "AI Integration", "Multi-tenant", "RBAC", "VPS"]
          }
        ],
        acad: [
          {
            title: "Technical High School in IT",
            org: "COTEMIG",
            role: "Student",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "FEB" },
            end: { year: 2026, month: "DEC" },
            bullets: [
              "Hands-on learning in Programming Logic, Databases, and Web Development.",
              "Direct experience with Google tools, school projects, and practices focused on the IT market.",
              "Technical education focused on programming, innovation, and problem-solving."
            ],
            skills: ["C#", "MySQL", "HTML", "CSS", "JavaScript", "Linux"]
          },
          {
            title: "Mobile & Web Development Specialization",
            org: "COTEMIG",
            role: "Student",
            loc: "Belo Horizonte, MG",
            start: { year: 2026, month: "FEB" },
            end: { current: true },
            bullets: [
              "Deepening knowledge in cross-platform mobile and modern web development.",
              "Hands-on with Flutter and Dart to build performant, native-feeling apps for Android and iOS from a single codebase.",
              "Native mobile development with Kotlin (Android) and Swift (iOS) — exploring platform APIs, lifecycle and UI frameworks.",
              "Python for scripting, automation and backend logic, with a focus on clean, maintainable code.",
              "Software architecture fundamentals: design patterns, MVC/MVVM, separation of concerns and scalable project structure."
            ],
            skills: ["Flutter", "Dart", "Kotlin", "Swift", "Python", "Software Architecture"]
          }
        ],
        courses: [
          {
            title: "Designing products and services with AI",
            org: "MIT",
            role: "Student",
            start: { year: 2025, month: "JUN" },
            end: { year: 2025, month: "AUG" },
            cert: { id: "cert-mit", img: "Certificado-MIT.png", label: "Certificate" },
            bullets: [
              "AI strategy, performance metrics, and product design.",
              "Machine learning fundamentals and model evaluation.",
              "Deep learning techniques (MLPs, CNNs, RNNs, transformers).",
              "Data pipelines, AI limitations, and responsible deployment.",
              "Human–Computer Interaction and AI-driven interfaces.",
              "Generative AI, prompt engineering, and marketplace frontiers.",
              "Superminds and human–AI collaboration."
            ],
            skills: ["Machine Learning", "Deep Learning", "AI Strategy", "AI Design", "Prompt Engineering", "HCI", "Generative AI", "Superminds"]
          }
        ]
      }
    },
    skills: {
      title: "Skills",
      sub: "Click the squares to reveal.",
      tilesLabels: {
        os: "OS & Cloud",
        programming: "Programming",
        web: "Web & Mobile",
        creative: "Design & AI"
      }
    },
    projects: {
      title: "Projects",
      sub: "A concise selection of my recent work in web, product, and media.",
      ctaTitle: "More on my repository",
      repoAll: "https://github.com/iannini25",
      ctas: { site: "View site", repo: "GitHub", viewMore: "View more", viewAll: "View all" },
      soonKicker: "Projects",
      soonTitle: "Section under <em>maintenance</em>",
      soonSub: "I'm wrapping up new projects to showcase here. Come back soon!",
      showcase: {
        kicker: "Building things that matter",
        title: "Featured Work",
        visitBtn: "Visit Project",
        repoBtn: "Source",
        scrollHint: "scroll to explore"
      },
      list: [
        {
          title: "Athena7 — Whistleblowing Channel",
          desc: "SaaS whistleblowing channel with end-to-end encryption and anonymous chat for Brazilian Law 14.457/2022 compliance.",
          longDesc: `Athena7 is a multi-tenant SaaS platform for Whistleblowing Channels and Corporate Integrity that lets companies receive and investigate reports of harassment, discrimination and misconduct with full anonymity. The reporter sends an encrypted statement directly in the browser, gets a single access key and follows the case through a two-way chat without ever revealing their identity.

The system runs two independent channels — Women's Integrity and Corporate Integrity — and provides a full admin panel with a Kanban of cases, investigation flow with classification and formal closure, scheduled PDF reports, configurable alerts, SLA control, user management with granular permissions, training with certificates, gamification, AI-powered support, blog with newsletter, and a public hiring form with administrative approval.`
          ,
          stack: ["TypeScript", "Node.js", "tRPC v11", "Drizzle ORM", "MySQL 8", "React 18", "Vite", "Wouter", "TailwindCSS", "shadcn/ui", "Resend", "OpenAI API", "PDFKit", "PM2", "Nginx"],
          link: "https://athena7.com.br",
          repo: "",
          cover: "img/athena7.com.br.png"
        },
        {
          title: "Moeda Nobre — Digital Benefits Currency",
          desc: "Digital benefits currency that keeps money flowing between companies, employees and their local economy.",
          longDesc: `Moeda Nobre is a corporate benefits fintech platform with its own digital currency. Contracting companies deposit funds on the platform and distribute them as monthly balances to their employees, who spend the balance at a network of partner merchants by paying via QR Code with PIN confirmation. Merchants accumulate what they receive and request withdrawals through PIX or TED whenever they want.

The system serves four distinct user profiles — platform operators, companies, merchants and employees — each with their own dashboard, granular permissions and dedicated flows. It includes multi-step approval for financial entries, segregation of duties between who creates and who approves, batch import of employees, complete audit logs, LGPD compliance, dark mode and a mobile-first app for the employee.`
          ,
          stack: ["Next.js", "TypeScript", "TailwindCSS", "shadcn/ui", "Framer Motion", "React Query", "Zustand", "Prisma ORM", "PostgreSQL", "NextAuth", "html5-qrcode", "TipTap", "Docker", "AWS EC2", "Nginx", "Redis"],
          link: "https://moedanobre.com",
          repo: "",
          cover: "img/moedanobre.com_.png",
          featured: true
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
          repo: "https://github.com/iannini25",
          cover: "img/erpinspire4u.png"
        },
        {
          title: "Project Alpha",
          desc: "Placeholder — short description to be filled in.",
          longDesc: "Placeholder project. Edit this entry in js/language.js to replace it with a real one.",
          stack: ["Placeholder"],
          link: "",
          repo: "",
          cover: ""
        },
        {
          title: "Project Beta",
          desc: "Placeholder — short description to be filled in.",
          longDesc: "Placeholder project. Edit this entry in js/language.js to replace it with a real one.",
          stack: ["Placeholder"],
          link: "",
          repo: "",
          cover: ""
        }
      ]
    },
    contact: {
      kicker: "Let's talk",
      lineA: "Let's build something real,",
      lineB: "with real impact.",
      sub: "Whether it's a product, a website or just an idea — I'm one click away.",
      openCta: "Get in touch",
      name: "Name",
      email: "Email",
      message: "Message",
      namePh: "What should I call you?",
      emailPh: "so I can get back to you",
      messagePh: "Tell me briefly what you have in mind.",
      modal: {
        kicker: "Direct line",
        title: "Let's talk.",
        sub: "Pick a channel below or send a message — I reply fast.",
        or: "or write to me",
        send: "Send message",
        whatsMeta: "+55 31 99562-4617",
        fillAll: "Please fill all fields.",
        opening: "Opening your email client…"
      }
    },
    blog: {
      kicker: "Blog",
      heroTitle: "More than code, <em>stories.</em>",
      heroSub: "Case studies, technical decisions and behind-the-scenes of the projects I've been building.",
      soonKicker: "Blog",
      soonTitle: "Coming <em>soon</em>",
      soonSub: "I'm wrapping up the first pieces: case studies, technical decisions and behind-the-scenes of my projects. Stay tuned!",
      soonBack: "Back to home",
      profile: { kicker: "Author" },
      stats: {
        title: "By the numbers",
        sub: "what's happening here",
        posts: "posts",
        categories: "categories",
        readtime: "min total",
        views: "total views"
      },
      location: { status: "writing from" },
      topics: { title: "Topics", sub: "what I write about" },
      center: { hint: "no covers yet" },
      search: { placeholder: "Search by title, tag or content..." },
      sort: {
        label: "Sort",
        recent: "Most recent",
        oldest: "Oldest first",
        popular: "Most read",
        readtime: "Quick read"
      },
      filters: { all: "All" },
      posts: {
        kicker: "Posts",
        title: "Everything I've <em>written</em> so far"
      },
      empty: {
        title: "No posts here yet",
        text: "Soon, content about engineering, AI, design and the backstage of my projects. Come back soon!"
      },
      author: {
        kicker: "Author",
        bio: "19 years old · Full Stack Developer · AI Designer. I write about what I learn along the way — engineering, AI, design and the behind-the-scenes of the projects I build.",
        contact: "Contact"
      },
      featured: {
        latest: "Latest",
        spotlight: "Spotlight",
        empty: "The first post is coming soon.",
        badge: "Featured"
      },
      footer: { rights: "All rights reserved" }
    },
    post: {
      back: "Back to blog",
      share: { label: "Share this post" },
      linkedin: "View original post on LinkedIn",
      related: { kicker: "Keep reading", title: "Related posts" },
      author: {
        kicker: "About the author",
        bio: "19 years old · Full Stack Developer · AI Designer. I write about what I learn along the way — engineering, AI, design and the behind-the-scenes of the projects I build.",
        contact: "Contact"
      },
      footer: { back: "Back to blog", portfolio: "Portfolio" }
    }
  },

  /* ==================== PT ===================== */

  pt: {
    htmlLang: "pt-BR",
    nav: { home: "Início", about: "Sobre", services: "Serviços", work: "Trabalhos", experience: "Experiência", skills: "Habilidades", projects: "Projetos", blog: "Blog", blogSoon: "em breve", contact: "Contato", resume: "Currículo" },
    tabAway: "volta aqui :(",
    modes: { prof: "Profissional", acad: "Acadêmica", courses: "Cursos & Certificações" },
    hero: { hello: "Olá, eu sou" },
    taglines: [
      "Full Stack Developer.",
      "Crio plataformas e MVPs.",
      "Automações & IA.",
      "Corrijo e publico projetos."
    ],
    about: {
      kicker: "A Trajetória",
      title: "A Trajetória",
      titleA: "Construída por curiosidade,",
      titleB: "moldada por código.",
      sub: "Um pouco sobre mim, o que eu faço e o que gosto de construir.",
      statusLabel: "Status",
      statusValue: "Aberto a novos projetos",
      blogLabel: "Blog",
      blogTag: "Em breve",
      blogTitle: "Compartilhando o que aprendo no caminho.",
      blogDesc: "Estudos de caso, decisões técnicas e bastidores dos projetos.",
      blogCta: "Em breve",
      cvLabel: "Currículo",
      cvTitle: "Trajetória completa em uma página.",
      cvCta: "Baixar currículo",
      locLabel: "Onde eu estou",
      locValue: "Belo Horizonte, MG · Brasil",
      locRemote: "Remoto · Brasil/Irlanda",
      locTimezone: "UTC−3",
      terminal: [
        { type: "type", text: "cat about.txt" },
        {
          type: "out",
          text:
            `Sou Bernardo Araújo Iannini, tenho 19 anos, sou estudante de Desenvolvimento Web e Mobile no COTEMIG e atuo como Full Stack Developer na Inspire4U, criando soluções digitais, plataformas web e projetos de inovação.

Atualmente, trabalho no ecossistema Athena 7, uma plataforma voltada para canais de denúncia, proteção de mulheres no ambiente corporativo, suporte à NR-1 e educação dentro de empresas. No projeto, atuo em diferentes partes do produto, desde interfaces e funcionalidades até integrações, melhorias e estruturação da plataforma.

Tenho experiência prática com C#, MySQL, HTML, CSS, JavaScript, Kotlin, Swift, Dart, Flutter e Python, além de contato com outras tecnologias do desenvolvimento moderno. Também me interesso por criação e edição de vídeo, área em que já desenvolvi projetos premiados e que fortalece minha visão criativa dentro da tecnologia.

Hoje, aprofundo meus conhecimentos em desenvolvimento de software e estudo cibersegurança, com foco em ferramentas e conceitos ligados a pentest. Também sou conectado à Innovation Business Alliance, organização com presença na Irlanda, buscando aproximar tecnologia, inovação e impacto real.

Sou apaixonado por tecnologia, por resolver problemas e por transformar ideias em produtos reais. Estou sempre buscando evoluir, criar soluções mais completas e entregar projetos bem pensados para clientes, usuários e mercado.`
        },
        { type: "type", text: "contact --show" },
        { type: "out", text: "LinkedIn: linkedin.com/in/bernardo-iannini\nGitHub: github.com/iannini25\nEmail: bernardo.iannini14@gmail.com" }
      ]
    },
    services: {
      title: "Serviços",
      sub: "O que eu entrego para clientes e times.",
      list: [
        {
          tag: "WEB",
          icon: "code",
          color: "#22c55e",
          title: "Desenvolvimento Web",
          desc: "Criação de landing pages, sites institucionais e interfaces modernas, rápidas e responsivas, pensadas para transmitir valor e gerar resultado.",
          features: ["Landing Pages", "Sites Institucionais", "Redesign de Páginas"]
        },
        {
          tag: "CORE",
          icon: "layers",
          color: "#2dd4bf",
          title: "Sistemas & Plataformas",
          desc: "Desenvolvimento de plataformas web completas, MVPs, dashboards e sistemas sob medida, com estrutura real de front-end, back-end, banco de dados e autenticação.",
          features: ["Plataformas Web", "Dashboards e Painéis", "Sistemas do Zero"]
        },
        {
          tag: "IA",
          icon: "brain",
          color: "#a3e635",
          title: "Automação & IA",
          desc: "Criação de automações, fluxos inteligentes e soluções com IA para reduzir tarefas manuais, melhorar processos e tornar operações mais eficientes.",
          features: ["Automações de Processos", "Agentes e Chatbots", "Integrações com APIs"]
        },
        {
          tag: "OPS",
          icon: "tool",
          color: "#10b981",
          title: "Correção & Deploy",
          desc: "Correção, melhoria e publicação de projetos existentes, incluindo sistemas com bugs, códigos gerados por Vibe Coding e aplicações que precisam ir para produção.",
          features: ["Correção de Bugs", "Refatoração de Código", "Deploy em VPS/Cloud"]
        }
      ]
    },
    xp: {
      title: "Experiência",
      sub: "Minha trajetória profissional e acadêmica",
      timeline: {
        currentLabel: "Atual",
        currentSub: "EM ANDAMENTO",
        prof: [
          {
            title: "Desenvolvedor Web & Suporte Digital",
            org: "Inspire4U",
            role: "Estágio",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "MAI" },
            end: { year: 2026, month: "JAN" },
            bullets: [
              "Desenvolvimento e manutenção de sites em WordPress com foco em performance e usabilidade.",
              "Ajustes em HTML e CSS para melhorar design e experiência do usuário.",
              "Aplicação de técnicas de SEO e GEO para otimizar visibilidade e posicionamento.",
              "Participação em projetos de inovação e suporte digital a fintechs parceiras."
            ],
            skills: ["WordPress", "HTML", "CSS", "SEO", "GEO"]
          },
          {
            title: "Full Stack Developer — Athena7 (Whistleblower)",
            org: "Inspire4U",
            role: "Estágio",
            loc: "Belo Horizonte, MG",
            start: { year: 2026, month: "JAN" },
            end: { current: true },
            bullets: [
              "Desenvolvimento full-stack ponta a ponta, com foco em UX, performance e confiabilidade.",
              "Design e implementação de arquitetura multi-tenant (múltiplas organizações) com controle de acesso baseado em papéis (RBAC).",
              "Construção dos fluxos centrais de denúncia: registro de incidentes, acompanhamentos, mensagens, status e histórico de auditoria.",
              "Integração de um assistente de IA para orientar usuários e melhorar a experiência de denúncia, minimizando a exposição de dados sensíveis.",
              "Estruturação e manutenção do schema do banco de dados e migrações, garantindo consistência e escalabilidade.",
              "Deploy e operação da plataforma em VPS, gerenciando configuração de ambiente e serviços de produção (process manager + servidor web).",
              "Implementação de recursos de proteção ao usuário (saída rápida, UX discreta) para aumentar a segurança durante a denúncia."
            ],
            skills: ["TypeScript", "React", "Node.js", "MySQL", "Integração IA", "Multi-tenant", "RBAC", "VPS"]
          }
        ],
        acad: [
          {
            title: "Ensino Técnico em Informática",
            org: "COTEMIG",
            role: "Aluno",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "FEV" },
            end: { year: 2026, month: "DEZ" },
            bullets: [
              "Aprendizado prático em Lógica de Programação, Bancos de Dados e Desenvolvimento Web.",
              "Vivência com ferramentas Google, projetos escolares e práticas voltadas ao mercado de TI.",
              "Formação técnica com foco em programação, inovação e resolução de problemas."
            ],
            skills: ["C#", "MySQL", "HTML", "CSS", "JavaScript", "Linux"]
          },
          {
            title: "Especialização em Desenvolvimento Mobile & Web",
            org: "COTEMIG",
            role: "Aluno",
            loc: "Belo Horizonte, MG",
            start: { year: 2026, month: "FEV" },
            end: { current: true },
            bullets: [
              "Aprofundando o conhecimento em desenvolvimento mobile multiplataforma e em web moderno.",
              "Prática com Flutter e Dart para construir apps performáticos e com cara de nativo para Android e iOS a partir de um único código.",
              "Desenvolvimento nativo com Kotlin (Android) e Swift (iOS) — explorando APIs de plataforma, ciclo de vida e frameworks de UI.",
              "Python para scripts, automações e lógica de backend, com foco em código limpo e bem estruturado.",
              "Fundamentos de Arquitetura de Software: design patterns, MVC/MVVM, separação de responsabilidades e estrutura escalável de projetos."
            ],
            skills: ["Flutter", "Dart", "Kotlin", "Swift", "Python", "Arquitetura de Software"]
          }
        ],
        courses: [
          {
            title: "Designing products and services with AI",
            org: "MIT",
            role: "Aluno",
            start: { year: 2025, month: "JUN" },
            end: { year: 2025, month: "AGO" },
            cert: { id: "cert-mit", img: "Certificado-MIT.png", label: "Certificado" },
            bullets: [
              "Estratégia de IA, métricas de performance e design de produtos.",
              "Fundamentos de machine learning e avaliação de modelos.",
              "Técnicas de deep learning (MLPs, CNNs, RNNs, transformers).",
              "Pipelines de dados, limitações da IA e implantação responsável.",
              "Interação Humano–Computador e interfaces impulsionadas por IA.",
              "IA generativa, engenharia de prompt e fronteiras de marketplaces.",
              "Superminds e colaboração entre humanos e IA."
            ],
            skills: ["Machine Learning", "Deep Learning", "Estratégia de IA", "Design de IA", "Engenharia de prompt", "HCI", "IA Generativa", "Superminds"]
          }
        ]
      }
    },

    skills: {
      title: "Habilidades",
      sub: "Clique nos quadrados para revelar.",
      tilesLabels: {
        os: "Sistemas & Cloud",
        programming: "Programação",
        web: "Web & Mobile",
        creative: "Design & IA"
      }
    },

    projects: {
      soonKicker: "Projetos",
      soonTitle: "Seção em <em>atualização</em>",
      soonSub: "Estou finalizando o desenvolvimento de novos projetos pra mostrar aqui. Volte em breve!",
      title: "Projetos",
      sub: "Uma seleção concisa do meu trabalho recente em web, produto e mídia.",
      ctaTitle: "Mais no meu repositório",
      repoAll: "https://github.com/iannini25",
      ctas: { site: "Ver site", repo: "GitHub", viewMore: "Ver mais", viewAll: "Ver todos" },
      showcase: {
        kicker: "Construindo coisas que importam",
        title: "Trabalhos em Destaque",
        visitBtn: "Ver Projeto",
        repoBtn: "Código",
        scrollHint: "role para explorar"
      },
      list: [
        {
          title: "Athena7 — Canal de Denúncias",
          desc: "Plataforma SaaS de Canal de Denúncias com criptografia ponta a ponta e chat anônimo para adequação à Lei 14.457/2022.",
          longDesc: `O Athena7 é uma plataforma SaaS multi-tenant de Canal de Denúncias e Integridade Corporativa que permite empresas receberem e investigarem relatos de assédio, discriminação e irregularidades de forma totalmente anônima. O denunciante envia seu relato criptografado diretamente no navegador, recebe uma chave de acesso única e acompanha o caso via chat bidirecional sem jamais se identificar.

O sistema opera com dois canais independentes — Integridade da Mulher e Integridade Corporativa — e oferece um painel completo com Kanban de casos, fluxo de investigação com classificação e conclusão formal, relatórios agendados com PDF, alertas configuráveis, controle de SLA, gestão de usuários com permissões granulares, treinamentos com certificado, gamificação, suporte via IA, blog com newsletter e formulário público de contratação com aprovação administrativa.`
          ,
          stack: ["TypeScript", "Node.js", "tRPC v11", "Drizzle ORM", "MySQL 8", "React 18", "Vite", "Wouter", "TailwindCSS", "shadcn/ui", "Resend", "OpenAI API", "PDFKit", "PM2", "Nginx"],
          link: "https://athena7.com.br",
          repo: "",
          cover: "img/athena7.com.br.png"
        },
        {
          title: "Moeda Nobre — Moeda Digital de Benefícios",
          desc: "Moeda digital de benefícios que faz o dinheiro circular entre empresas, colaboradores e a economia em volta deles.",
          longDesc: `Moeda Nobre é uma plataforma fintech de benefícios corporativos com moeda digital própria. Empresas contratantes depositam valores na plataforma e distribuem como saldos mensais aos seus colaboradores, que utilizam o saldo em uma rede de comércios credenciados pagando por QR Code com confirmação por PIN. Os comércios acumulam o que receberam e solicitam resgate em PIX ou TED quando quiserem.

O sistema atende quatro perfis de usuário distintos — operadores da plataforma, empresas, comércios e colaboradores — cada um com seu próprio painel, permissões granulares e fluxos dedicados. Inclui aprovação multi-etapa de lançamentos financeiros, segregação de funções entre quem cria e quem aprova, importação em lote de colaboradores, log de auditoria completo, conformidade com LGPD, dark mode e app mobile-first para o colaborador.`
          ,
          stack: ["Next.js", "TypeScript", "TailwindCSS", "shadcn/ui", "Framer Motion", "React Query", "Zustand", "Prisma ORM", "PostgreSQL", "NextAuth", "html5-qrcode", "TipTap", "Docker", "AWS EC2", "Nginx", "Redis"],
          link: "https://moedanobre.com",
          repo: "",
          cover: "img/moedanobre.com_.png",
          featured: true
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
        },
        {
          title: "Projeto Alpha",
          desc: "Placeholder — descrição curta a ser preenchida.",
          longDesc: "Card placeholder para manter o layout balanceado. Substitua por um projeto real em js/language.js.",
          stack: ["Placeholder"],
          link: "",
          repo: "",
          cover: ""
        },
        {
          title: "Projeto Beta",
          desc: "Placeholder — descrição curta a ser preenchida.",
          longDesc: "Card placeholder para manter o layout balanceado. Substitua por um projeto real em js/language.js.",
          stack: ["Placeholder"],
          link: "",
          repo: "",
          cover: ""
        }
      ]
    },

    contact: {
      kicker: "Vamos conversar",
      lineA: "Vamos construir algo real,",
      lineB: "com impacto real.",
      sub: "Seja um produto, um site ou só uma ideia — estou a um clique de distância.",
      openCta: "Entrar em contato",
      name: "Nome",
      email: "E-mail",
      message: "Mensagem",
      namePh: "Como devo te chamar?",
      emailPh: "pra eu poder te responder",
      messagePh: "Me conta rapidinho o que você tem em mente.",
      modal: {
        kicker: "Linha direta",
        title: "Bora trocar uma ideia.",
        sub: "Escolha um canal abaixo ou me mande uma mensagem — respondo rápido.",
        or: "ou me escreva",
        send: "Enviar mensagem",
        whatsMeta: "+55 31 99562-4617",
        fillAll: "Preencha todos os campos.",
        opening: "Abrindo seu cliente de e-mail…"
      }
    },
    blog: {
      kicker: "Blog",
      heroTitle: "Mais do que código, <em>histórias.</em>",
      heroSub: "Estudos de caso, decisões técnicas e bastidores dos projetos que tenho construído.",
      soonKicker: "Blog",
      soonTitle: "Em <em>breve</em>",
      soonSub: "Estou finalizando os primeiros conteúdos: estudos de caso, decisões técnicas e bastidores dos projetos. Volte logo!",
      soonBack: "Voltar para home",
      profile: { kicker: "Autor" },
      stats: {
        title: "Em números",
        sub: "o que tá rolando aqui",
        posts: "posts",
        categories: "categorias",
        readtime: "min totais",
        views: "views totais"
      },
      location: { status: "escrevendo de" },
      topics: { title: "Tópicos", sub: "do que eu escrevo" },
      center: { hint: "sem capas ainda" },
      search: { placeholder: "Buscar por título, tag ou conteúdo..." },
      sort: {
        label: "Ordenar",
        recent: "Mais recentes",
        oldest: "Mais antigos",
        popular: "Mais lidos",
        readtime: "Leitura rápida"
      },
      filters: { all: "Todos" },
      posts: {
        kicker: "Posts",
        title: "Tudo que <em>escrevi</em> até hoje"
      },
      empty: {
        title: "Ainda nenhum post por aqui",
        text: "Em breve, conteúdos sobre engenharia, IA, design e os bastidores dos projetos. Volte logo!"
      },
      author: {
        kicker: "Autor",
        bio: "19 anos · Full Stack Developer · AI Designer. Escrevo sobre o que aprendo no caminho — engenharia, IA, design e os bastidores dos projetos que construo.",
        contact: "Contato"
      },
      featured: {
        latest: "Mais recente",
        spotlight: "Destaque",
        empty: "O primeiro post está chegando.",
        badge: "Destaque"
      },
      footer: { rights: "Todos os direitos reservados" }
    },
    post: {
      back: "Voltar ao blog",
      share: { label: "Compartilhar este post" },
      linkedin: "Ver post original no LinkedIn",
      related: { kicker: "Continue lendo", title: "Posts relacionados" },
      author: {
        kicker: "Sobre o autor",
        bio: "19 anos · Full Stack Developer · AI Designer. Escrevo sobre o que aprendo no caminho — engenharia, IA, design e os bastidores dos projetos que construo.",
        contact: "Contato"
      },
      footer: { back: "Voltar ao blog", portfolio: "Portfólio" }
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
  // essas funções vêm dos outros arquivos: home/about/experience/skills/projects/contact/blog
  if (typeof renderHero === 'function') renderHero(lang);
  if (typeof renderTerminal === 'function') renderTerminal(lang);
  if (typeof renderServices === 'function') renderServices(lang);
  if (typeof renderTimeline === 'function') renderTimeline(lang);
  if (typeof renderSkills === 'function') renderSkills(lang);
  if (typeof renderProjects === 'function') renderProjects(lang);
  if (typeof renderContact === 'function') renderContact(lang);
  if (typeof renderBlog === 'function') renderBlog(lang);

  if (typeof refreshSkillItemTooltips === 'function') {
    refreshSkillItemTooltips();
  }

  // Textos com data-i18n (textContent)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keyPath = el.getAttribute('data-i18n');
    const val = keyPath
      .split('.')
      .reduce((obj, k) => obj?.[k], I18N[lang]);

    if (typeof val === 'string') el.textContent = val;
  });

  // Textos com data-i18n-html (innerHTML — pra strings com <em>, <strong> etc.)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const keyPath = el.getAttribute('data-i18n-html');
    const val = keyPath
      .split('.')
      .reduce((obj, k) => obj?.[k], I18N[lang]);

    if (typeof val === 'string') el.innerHTML = val;
  });

  // Atributos com data-i18n-attr (formato "attr:key.path")
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const spec = el.getAttribute('data-i18n-attr');
    const [attr, keyPath] = spec.split(':');
    if (!attr || !keyPath) return;
    const val = keyPath
      .split('.')
      .reduce((obj, k) => obj?.[k], I18N[lang]);
    if (typeof val === 'string') el.setAttribute(attr, val);
  });

  // Marca i18n como pronto — remove a máscara de anti-flicker do <body>
  // (CSS inline em page-fx faz o fade-in suave)
  document.documentElement.classList.add('i18n-ready');
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


