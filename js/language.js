'use strict';

/* ======================================================================
   CORE: helpers + I18N + estado de linguagem + applyI18n + language switch
   ====================================================================== */

/* ===== Helpers globais ===== */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/* =========================================================
   I18N (EN/PT) + Estado de linguagem
   ========================================================= */
const I18N = {
  en: {
    htmlLang: "en",
    nav: { home: "Home", about: "About", services: "Services", work: "Work", experience: "Experience", skills: "Skills", projects: "Projects", blog: "Blog", blogSoon: "soon", contact: "Contact", resume: "CV" },
    a11y: {
      skip: "Skip to content",
      menuOpen: "Open menu",
      academic: "Academic",
      termControls: "Terminal controls",
      courses: "Courses & Specializations",
      featured: "Featured projects",
      nextProject: "Next project",
      closeRed: "Close (red)",
      close: "Close",
      filter: "Filter projects by category",
      langSwitch: "Change language",
      langMenu: "Language",
      maximize: "Maximize (green)",
      minimize: "Minimize (yellow)",
      professional: "Professional",
      scrollNext: "Scroll to next section",
      intro: "introduction",
      contact: "contact",
      xp: "experience",
      xpList: "experiences",
      xpIcons: "experience icons",
      social: "social links",
      projects: "projects",
      services: "services",
      about: "about me",
      photoA: "Bernardo Iannini, Full Stack Developer and AI Designer, profile photo",
      photoB: "Bernardo Iannini, alternate profile photo",
      techs: "Technologies",
      viewSite: "View site",
      closeCert: "Close certificate"
    },
    modes: { prof: "Professional", acad: "Academic", courses: "Courses & Certifications" },
    tabAway: "come back here :(",
    hero: { hello: "Hi, I'm" },
    taglines: [
      "Full Stack Developer.",
      "I fix vibecoding mistakes.",
      "I build platforms & MVPs.",
      "Automation & AI.",
      "I fix and deploy projects."
    ],
    about: {
      kicker: "About me",
      title: "About me",
      titleA: "I build software",
      titleB: "that ships to production.",
      sub: "Websites, systems and AI automations, from first draft to deploy.",
      statusLabel: "Status",
      statusValue: "Open to new projects",
      blogLabel: "Blog",
      blogTag: "Live",
      blogTitle: "Sharing what I learn along the way.",
      blogDesc: "Case studies, technical decisions and behind-the-scenes of my projects.",
      blogCta: "Read the blog",
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
            `I'm Bernardo Araújo Iannini, I'm 19 and I work as a Full Stack Developer. I build complete systems, from the architecture all the way to the production deploy, and I'm studying Web and Mobile Development at COTEMIG. That study walks side by side with what I already ship in the real world.

I got into tech in 2025, but I brought an older creative side with me. I came from video editing, motion design and visual effects, and that eye still shapes how I think about interface and product. For me, function and looks get solved in the same decision.

I work with SaaS products, fintechs, web platforms, automations and custom solutions. I also take on projects that were born from AI (Vibe Coding): I start from the rough prototype, fix the architecture underneath and turn it into a scalable system that's actually ready for production.

What drives me is solving real problems with technology, and I always go for the simplest, most scalable and best structured way to do it. It's not about collecting tools. It's about shipping something that works, holds up under real use and truly solves the problem.`
        },
        { type: "type", text: "contact --show" },
        { type: "out", text: "LinkedIn: linkedin.com/in/bernardo-iannini\nGitHub: github.com/iannini25\nEmail: bernardo.iannini14@gmail.com" }
      ],
      /* celular: so o essencial, sem o contact --show */
      terminalMobile: [
        { type: "type", text: "cat about.txt" },
        { type: "out", text: `I'm Bernardo Iannini, 19, a Full Stack Developer. I build complete systems, from architecture to production, and study Web and Mobile Development at COTEMIG.

I came from video editing and motion design, and that still shapes how I think about interface and product.

I work with SaaS, fintechs, automations and AI-born projects that need to become real systems.` }
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
          desc: "Building landing pages, institutional websites and modern interfaces that are fast, responsive and designed to convey value and drive results.",
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
          tag: "AI",
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
          desc: "Fixing, improving and shipping existing projects: buggy systems, code generated through Vibe Coding, and applications that need to reach production.",
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
            title: "Digital Support & Web Development",
            org: "Inspire4U",
            role: "Internship",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "MAY" },
            end: { year: 2025, month: "DEC" },
            bullets: [
              "Development and maintenance of WordPress websites, focused on performance and usability.",
              "HTML and CSS adjustments plus small JavaScript customizations to refine design and experience.",
              "On-page SEO to improve the visibility and ranking of the sites.",
              "Digital support and ongoing maintenance of the web projects, backing the partner fintechs."
            ],
            skills: ["WordPress", "HTML", "CSS", "JavaScript", "SEO", "Maintenance"]
          },
          {
            title: "Web Developer for Athena7",
            org: "Inspire4U",
            role: "Part-time",
            loc: "Belo Horizonte, MG · Hybrid",
            start: { year: 2026, month: "JAN" },
            end: { year: 2026, month: "JUN" },
            bullets: [
              "Joined Athena7 with the product already underway and took over full-stack development, carrying the platform's evolution forward.",
              "Shipped new features and restructured several parts of the system, so it gained consistency and scale.",
              "Took the platform to production, taking part in the deploy and in running it in a real environment.",
              "Led the infrastructure migration between AWS and a private VPS, tuning environment and production services.",
              "Designed and implemented the multi-tenant architecture (multiple organizations) with role-based access control.",
              "Integrated an AI assistant that guides users and answers questions while minimizing exposure of sensitive data.",
              "Worked on the core reporting flows of this privacy-first whistleblowing SaaS, with a strong focus on women's safety."
            ],
            skills: ["TypeScript", "React", "Node.js", "MySQL", "AI Integration", "Deploy", "AWS", "VPS"]
          },
          {
            title: "Software Engineer",
            org: "TribeX Tecnologia Financeira S/A",
            role: "Freelance",
            loc: "Remote · Brazil",
            start: { year: 2026, month: "FEB" },
            end: { current: true },
            bullets: [
              "Led the development of Moeda Nobre, a platform where companies distribute benefits to employees, who spend them at participating merchants by phone while merchants receive via Pix.",
              "Web platform for operations, companies and merchants, including a corporate website and dedicated city pages.",
              "Two published apps (iOS and Android): one for employees to check balance, pay and see history; another for merchants to generate charges and track receivables.",
              "Financial security controls: multi-step approval, full audit history and separation between who authorises a payment and who pays the merchant.",
              "Integration with point-of-sale systems, so merchants charge through their POS while employees pay in the app."
            ],
            skills: ["Software Infrastructure", "iOS Development", "Android", "Next.js", "PostgreSQL", "Pix"]
          },
          {
            title: "Full Stack Developer",
            org: "Freelance",
            role: "Self-employed",
            loc: "Remote · Brazil/Ireland",
            start: { year: 2026, month: "JUN" },
            end: { current: true },
            bullets: [
              "End-to-end full-stack work: SaaS platforms, landing pages, automations and tailor-made systems, from design to production deploy.",
              "Taking projects that were built with AI (Vibe Coding), reworking the architecture, refactoring the code and getting them production-ready, plus integrations, maintenance and performance work.",
              "Innovation Business Alliance (IBA): full development of the international networking platform that connects Brazil and Ireland."
            ],
            skills: ["Full Stack", "Next.js", "React", "Node.js", "SaaS", "Deploy", "Automation", "Vibe Coding"]
          }
        ],
        acad: [
          {
            title: "Web & Mobile Development · Year 1",
            org: "COTEMIG",
            role: "Student",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "FEB" },
            end: { year: 2025, month: "DEC" },
            bullets: [
              "Solid web-development foundation with HTML, CSS and JavaScript, grounded in programming logic.",
              "Back-end and data fundamentals with C# and MySQL.",
              "First contact with Linux and networking, getting to understand the environment applications actually run in."
            ],
            skills: ["HTML", "CSS", "JavaScript", "C#", "MySQL", "Linux", "Networks"]
          },
          {
            title: "Web & Mobile Development · Year 2",
            org: "COTEMIG",
            role: "Student",
            loc: "Belo Horizonte, MG",
            start: { year: 2026, month: "FEB" },
            end: { current: true },
            bullets: [
              "Cross-platform mobile development with Flutter and Dart, plus native with Kotlin (Android) and Swift (iOS).",
              "Python for automation, scripting and back-end logic.",
              "Software Architecture and Design, Systems Modeling and best practices for scalable projects.",
              "Expected graduation in December 2026."
            ],
            skills: ["Python", "Flutter", "Dart", "Kotlin", "Swift", "Software Architecture"]
          }
        ],
        courses: [
          {
            title: "Artificial Intelligence: Develop Products and Services Using AI",
            org: "MIT Professional Education",
            role: "Student",
            start: { year: 2025, month: "JUL" },
            end: { year: 2025, month: "DEC" },
            cert: { id: "cert-mit", img: "Certificado-MIT.webp", label: "Certificate" },
            bullets: [
              "AI strategy, performance metrics, and product design.",
              "Machine learning fundamentals and model evaluation.",
              "Deep learning techniques (MLPs, CNNs, RNNs, transformers).",
              "Data pipelines, AI limitations, and responsible deployment.",
              "Human-Computer Interaction and AI-driven interfaces.",
              "Generative AI, prompt engineering, and marketplace frontiers.",
              "Superminds and human-AI collaboration."
            ],
            skills: ["Machine Learning", "Deep Learning", "AI Strategy", "AI Design", "Prompt Engineering", "HCI", "Generative AI", "Superminds"]
          }
        ]
      }
    },
    skills: {
      title: "Skills",
      sub: "Click a folder to open.",
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
      /* labels da pagina de caso (project.html) — case study de cada projeto */
      case: {
        back: "All projects",
        viewCase: "View case study",
        visitSite: "Visit live site",
        repoBtn: "Source",
        notFound: "Project not found.",
        nextProject: "Next project",
        /* títulos dos atos editoriais (aceitam <em> serif — 1 palavra) */
        aboutTitle: "About the <em>project</em>",
        problemTitle: "The <em>problem</em>",
        builtTitle: "How it was <em>built</em>",
        impactTitle: "What it <em>changed</em>",
        impactPath: "impact",
        /* ficha técnica ($ cat specs.txt — a cerca didática) */
        specsCmd: "cat specs.txt",
        specsComment: "# for the technical reader",
        noteLabel: "engineer's note",
        deepLabel: "how i solved it",
        /* assinatura (porta de contato) */
        signLine: "Designed, built and shipped <em>live</em> by Bernardo Iannini",
        signCta: "Get in touch"
      },
      /* labels do catálogo (seção #projects) — featured + filtros + arquivo.
         Categorias: slugs ESTÁVEIS (system/site/automation/personal) — o
         campo `category` de cada projeto aponta pra cá. "all" é estado. */
      catalog: {
        kicker: "Projects",
        title: "Everything I've <em>built</em> so far",
        sub: "From production SaaS to this very page. Every one shipped.",
        filterPrefix: "$ filter:",
        cats: { all: "All", system: "Systems", site: "Sites", automation: "Automation", personal: "Personal" },
        count: "→ {n} projects",
        countOne: "→ 1 project",
        countFiltered: "→ {n} of {total}",
        empty: "Nothing filed under this category yet. New projects on the way.",
        emptyCta: "→ View all"
      },
      list: [
        {
          title: "Athena7 · Whistleblowing Channel",
          desc: "Multi-tenant SaaS whistleblowing channel with fully anonymous reporting and a two-way chat, built for Brazilian Law 14.457/2022 and NR-1 compliance.",
          longDesc: `Athena7 is a multi-tenant SaaS platform for Whistleblowing Channels and Corporate Integrity that lets companies receive and investigate reports of harassment, discrimination and misconduct with full anonymity. The reporter files the case with no name, e-mail or IP, gets a single tracking code and follows it through a two-way chat, never revealing who they are.

The system runs two independent channels, Women's and Corporate Integrity, and it comes with a full admin panel: a Kanban of cases, an investigation flow with AI-suggested legal classification and formal closure, scheduled PDF reports, configurable alerts and SLA control, granular permissions, training with verifiable certificates, gamification and AI assistants. Everything sits on top of per-tenant encryption at rest and LGPD compliance.`
          ,
          stack: ["TypeScript", "Node.js", "Express", "tRPC v11", "Drizzle ORM", "MySQL 8", "React 19", "Vite", "TailwindCSS", "Socket.io", "OpenPGP", "Google Gemini", "Resend", "PDFKit", "Docker", "Nginx"],
          link: "https://athena7.com.br",
          repo: "",
          cover: "img/covers/athena7.webp?v=4a7b8172",
          id: "athena7",
          category: "system",
          featured: true,
          featuredOrder: 1,
          status: "in production",
          year: "2026",
          role: "evolution & deploy",
          /* preview animado do card (mp4/webm 1600x900 em loop, <=3MB) —
             vazio = usa a cover. Ver PROJETOS-EM-CONSTRUCAO.md. */
          /* screen-recording: scroll através do site ao vivo (autoplay/loop) */
          story: {
            problem: {
              text: `Harassment and misconduct almost never become a report. The person who suffers is afraid of retaliation, doesn't trust that the report is really anonymous, and often has no safe channel to even start, so the whole thing dies in silence. On the other side, the company is exposed: since 2022, Brazilian Law 14.457 requires organizations to keep a whistleblowing channel and a harassment-prevention committee.

The hard part is solving both sides at once. The person needs a place where they genuinely can't be identified, with no name, e-mail or IP, and can still follow the case. The company needs a tool that organizes the investigation, respects deadlines and produces documentary evidence that holds up legally.`,
              note: "Law 14.457/2022 + LGPD · report with no IP · unique tracking code"
            }
          },
          flow: {
            steps: [
              { label: "Pick a channel", sub: "Women or Integrity" },
              { label: "Report", sub: "step-by-step + files" },
              { label: "Get the code", sub: "anonymous key" },
              { label: "AI analyzes", sub: "framing + severity" },
              { label: "Follow up", sub: "anon chat + PDF" }
            ]
          },
          impact: {
            text: "The person reports in minutes, without identifying themselves, and walks away with a code to talk to Compliance anonymously and both ways. The company receives each report already organized in a Kanban, with an AI-suggested legal framing, SLA control and a signed audit trail. What used to be a lost form, or nothing at all, becomes a process with a beginning, a middle and proof.",
            note: "Kanban + SLA + SHA-256 signed PDF, publicly verifiable"
          },
          metrics: [
            { value: "2", label: "independent channels", detail: "Women · Integrity" },
            { value: "6", label: "AI assistants", detail: "Google Gemini" },
            { value: "PT·EN·ES", label: "multilingual reporting", detail: "available 24×7" },
            { value: "LGPD", label: "Law 14.457/2022", detail: "compliance built in" }
          ],
          specs: [
            { k: "architecture", v: "multi-tenant SaaS · tRPC v11 · React 19 + Vite" },
            { k: "database", v: "MySQL 8 · Drizzle ORM · per-tenant isolation" },
            { k: "security", v: "OpenPGP + AES-256-GCM · RBAC · 2FA TOTP · LGPD" },
            { k: "ai", v: "Google Gemini (gemini-2.5-flash)" },
            { k: "infra", v: "private VPS · Docker Compose · Nginx + Let's Encrypt" },
            { k: "migration", v: "from AWS (ECS/RDS) to a private VPS" }
          ],
          topics: [
            { icon: "shield", title: "Anonymous, protected reporting",
              text: "The reporter files the case with full anonymity, with no name, e-mail or IP, gets a single code and follows everything through a two-way chat, without ever revealing who they are.",
              tech: "per-tenant OpenPGP + AES-256-GCM at rest · enveloped key · no IP trail",
              path: "denunciar" },
            { icon: "layers", title: "Two independent channels",
              text: "The Women's channel and the Integrity channel run as separate channels within the same platform, each with its own persona and report categories.",
              tech: "Women's channel (Athena) vs Integrity (Atlas, gender-neutral, 10 categories)",
              path: "canal" },
            { icon: "chart", title: "Full investigation workflow",
              text: "Each case runs on a Kanban with investigation, AI classification and formal closure, plus scheduled PDF reports, alerts and SLA control.",
              tech: "SLA alert engine · SHA-256 signed PDF, verifiable at /verificar/:code",
              path: "empresa/casos" },
            { icon: "sparkles", title: "Training & AI support",
              text: "Granular per-role permissions, training with verifiable certificates, gamification, and AI assistants that guide users and suggest the legal framing of each report.",
              tech: "6 Gemini assistants: 5 conversational + 1 post-report analysis (fire-and-forget)",
              path: "treinamento" }
          ]
        },
        {
          title: "Moeda Nobre · Digital Benefits Currency",
          desc: "Digital benefits currency that keeps money flowing between companies, their employees and the local economy around them.",
          longDesc: `Moeda Nobre is a corporate benefits fintech with its own digital currency. Contracting companies deposit funds on the platform and hand them to employees as monthly balances, which get spent at a network of partner merchants by paying via QR Code with PIN confirmation. Merchants pile up what they receive and cash out through PIX or TED whenever they want.

The system serves four distinct profiles, platform operators, companies, merchants and employees, and each one gets its own dashboard, granular permissions and dedicated flows. On top of that it brings multi-step approval for financial entries, segregation of duties between who creates and who approves, batch import of employees, full audit logs, LGPD compliance, dark mode and a mobile-first app for the employee.`
          ,
          stack: ["Next.js 16", "TypeScript", "TailwindCSS", "shadcn/ui", "Framer Motion", "TanStack Query", "Zustand", "Prisma ORM", "PostgreSQL", "NextAuth", "html5-qrcode", "TipTap", "Docker", "Nginx", "Redis", "private VPS"],
          link: "https://moedanobre.com",
          repo: "",
          /* links do app nas lojas: preenchido, a página do projeto mostra
             os selos oficiais do Google Play / App Store */
          apps: { android: "", ios: "" },
          cover: "img/covers/moedanobre.webp?v=447d1696",
          featured: true,
          featuredOrder: 2,
          id: "moedanobre",
          category: "system",
          status: "in production",
          year: "2026",
          role: "platform development",
          story: {
            problem: {
              text: `Traditional corporate benefits are a voucher that only works at the big chains. The money a company puts in as a benefit leaks straight out of the economy around the employee. The local shops, where people actually live and spend, are left out because they have no simple way to accept that voucher or to get paid for it.

Moeda Nobre flips that around. But the real challenge was never just "build a wallet." It was moving real money between four players (the platform, the company, the merchant and the employee) with approval, segregation of duties and auditing, so nothing ever moves without leaving a trace.`,
              note: "a benefit that leaks out of the local economy: the voucher only works at big chains"
            }
          },
          flow: {
            steps: [
              { label: "Company deposits", sub: "becomes monthly balance" },
              { label: "Approval", sub: "multi-step, rejectable" },
              { label: "Employee pays", sub: "QR Code + PIN" },
              { label: "Merchant cashes out", sub: "PIX or TED" }
            ]
          },
          impact: {
            text: "Moeda Nobre is a B2B2C financial platform in production, not a pilot. Real money flows from the company all the way to the local shop, passing through bank-grade controls: approval across several hands, a clear split between who approves and who pays, universal soft delete and an audit record for every action. Four different profiles run the same system, each with its own panel and its own permissions.",
            note: "multi-step approval + segregation of duties: whoever approves is never whoever pays"
          },
          metrics: [
            { value: "4", label: "dedicated profiles", detail: "operator · company · merchant · employee" },
            { value: "8", label: "approval steps", detail: "rejectable entry" },
            { value: "QR + PIN", label: "payment", detail: "cash out via PIX/TED" },
            { value: "LGPD", label: "versioned consent", detail: "IP + userAgent + version" }
          ],
          specs: [
            { k: "architecture", v: "Next.js 16 · Prisma · PostgreSQL" },
            { k: "payment", v: "QR Code + PIN · FIFO consumption · PIX/TED withdrawal" },
            { k: "controls", v: "multi-step approval · segregation of duties · audit log" },
            { k: "security", v: "NextAuth v5 · bcrypt PIN · versioned LGPD consent" },
            { k: "infra", v: "Docker · Nginx · Redis · private VPS" }
          ],
          topics: [
            { icon: "sparkles", title: "A currency of its own",
              text: "Contracting companies deposit funds on the platform and hand them to employees as monthly balances they can spend nearby.",
              tech: "each entry becomes a monthly balance per employee/benefit/month (original · spent · remaining)",
              path: "cliente/saldos" },
            { icon: "gauge", title: "Spent at partner merchants",
              text: "Employees pay by scanning a QR Code and confirming with a PIN, at a network of partner merchants who pile up balances and cash out via PIX or TED.",
              deep: [
                "The merchant generates a QR with an amount and an expiry; the employee scans it and confirms with a PIN.",
                "Before approving, the system checks the benefit rules (state, city, ZIP, segment) and the available balance.",
                "Consumption is FIFO, oldest balances first, and a single payment can combine several benefits.",
                "On withdrawal the merchant asks for an exact amount and the system consumes the stacks in FIFO order, with a proportional fee."
              ],
              path: "pagar" },
            { icon: "users", title: "Four dedicated profiles",
              text: "Platform operators, companies, merchants and employees each get their own dashboard, granular permissions and dedicated flows.",
              tech: "4 user types, each with sub-roles (MASTER/ADMIN/ENTRY/APPROVER/VIEWER) and role guards in the middleware",
              path: "admin" },
            { icon: "shield", title: "Built-in financial controls",
              text: "Multi-step approval, segregation of duties, batch import of employees, full audit logs and LGPD compliance.",
              deep: [
                "A balance entry moves through 8 states, from draft to distribution, and can be rejected at any step with a reason.",
                "Segregation of duties is strict: whoever creates doesn't approve, and whoever approves doesn't pay (403 if they try).",
                "Batch import validates the whole spreadsheet before writing a single employee.",
                "Everything is soft delete and every action turns into an audit record with before/after state, IP and user agent."
              ],
              path: "auditoria" }
          ]
        },
        {
          title: "IBA · Cross-Border Innovation Network",
          desc: "International networking platform connecting fintechs, institutions and regulators across Brazil, Ireland and the UK, replacing scattered WhatsApp groups with one curated, centralized network.",
          longDesc: `IBA is the digital platform of the Innovation Business Alliance, a membership-led, invitation-only alliance that connects fintech leaders, financial institutions, investors and regulators across Brazil, Ireland and the UK. Instead of scattered chat groups, it brings the whole network into one place: curated member approval, events with check-in, themed committees, a directory and institutional memory.

The product ties together four surfaces (a public site, the member portal, an admin panel and an API) with a member directory, a document library, an AI chat over the knowledge base, cross-border semantic matchmaking, realtime notifications and LGPD compliance. It all runs in five languages, built to work across different time zones and markets.`
          ,
          stack: ["NestJS", "Next.js 16", "React 19", "TypeScript", "Prisma", "PostgreSQL", "Redis", "BullMQ", "Socket.IO", "OpenAI", "Anthropic", "Resend", "Twilio", "next-intl", "Docker", "Nginx"],
          link: "https://ibanetwork.org",
          repo: "",
          cover: "img/covers/iba.webp?v=b42aaaa7",
          featured: true,
          featuredOrder: 3,
          id: "iba",
          category: "system",
          status: "in production",
          year: "2026",
          role: "full-stack, whole product",
          story: {
            problem: {
              text: `Networking between the innovation ecosystems of Brazil, Ireland and the UK used to happen all over the place: WhatsApp groups nobody keeps up with, contacts that get lost, one-off events with no follow-through. There was no profile, no search, no memory, so finding the right company or the right person on the other side of the Atlantic came down to luck and to who you already knew.

Building the trust this corridor is missing is hard precisely because you can't fake it. The platform doesn't invent relationships, it gives structure to a network that already exists: it approves who comes in, organizes what happens and keeps the memory of all of it.`,
              note: "cross-border alliance across BR, IE and UK · invitation-only · 5 languages"
            }
          },
          flow: {
            steps: [
              { label: "Application", sub: "human approval" },
              { label: "Profile", sub: "company and interests" },
              { label: "Connections", sub: "semantic matchmaking" },
              { label: "Living network", sub: "events and committees" }
            ]
          },
          impact: {
            text: "What was once scattered conversation became infrastructure: a curated network where approved members find each other, schedule events, trade knowledge in committees and get connection suggestions based on what they actually do. Instead of a chat group, a whole international platform, in production, in five languages.",
            note: "Turborepo monorepo · NestJS + Next.js · realtime + RAG + matchmaking"
          },
          metrics: [
            { value: "BR·IE·UK", label: "cross-border corridor", detail: "São Paulo · Dublin · London" },
            { value: "5", label: "languages", detail: "EN · PT · ES · IT · DE" },
            { value: "4", label: "surfaces", detail: "site · portal · admin · API" },
            { value: "invite-only", label: "curated approval", detail: "every member reviewed" }
          ],
          specs: [
            { k: "architecture", v: "Turborepo monorepo · NestJS 10 · Next.js 16 + React 19" },
            { k: "database", v: "PostgreSQL (pgvector) · Prisma · 24 migrations" },
            { k: "realtime & queues", v: "Socket.IO · BullMQ · outbox pattern · Redis" },
            { k: "ai", v: "OpenAI + Anthropic · RAG with citations · semantic matchmaking" },
            { k: "security", v: "RBAC (~57 permissions) · 2FA TOTP · LGPD-first" },
            { k: "infra", v: "Docker · Nginx · 5 locales (next-intl)" }
          ],
          topics: [
            { icon: "shield", title: "Curation and trust",
              text: "It's an invitation-only network: every applicant goes through human approval before getting in. Trust is the product, there's no 'sign up free'.",
              tech: "RBAC with 4 roles and ~57 permissions · 2FA TOTP · audit log · LGPD-first",
              path: "admin" },
            { icon: "users", title: "Directory and smart connections",
              text: "Search members by company, role, country and interest, plus a semantic matchmaking that reads the profiles and suggests cross-border connections with a clear reason.",
              deep: [
                "Every profile becomes an embedding; the algorithm crosses profile and history and suggests 6 to 20 people.",
                "Each suggestion carries the reason for the connection, not just a blind match.",
                "Recommendations are recomputed by cron (daily/weekly), off the request path.",
                "The member decides whether they show up in external search or not."
              ],
              path: "portal/directory" },
            { icon: "layers", title: "Living committees and events",
              text: "Themed committees with realtime agendas, in-person events with QR check-in and a versioned document library with granular permissions.",
              tech: "realtime agendas (Socket.IO) · QR check-in · per-document ACL · AI summary on close",
              path: "portal/committees" },
            { icon: "sparkles", title: "AI over the knowledge base",
              text: "An AI chat answers on top of the network's indexed documents, with citations and feedback, turning institutional memory into something you can actually query.",
              deep: [
                "Documents are indexed (RAG) and the chat answers with citations back to the source.",
                "Two AI providers behind it (OpenAI + Anthropic), with caching and cost control.",
                "Answers stream in (SSE) and a circuit breaker keeps the experience from falling over.",
                "AI budget alerts fire at 50/80/100% through metrics."
              ],
              path: "portal/chat" }
          ]
        },
        /* removido a pedido: {
          title: "Módulo Engenharia · Heavy-Industry Automation Site",
          desc: "Institutional site for an engineering firm that automates and maintains the critical machinery of heavy industry: mining, steel, offshore and energy.",
          longDesc: `Módulo Engenharia sells automation, electrical engineering and field maintenance for industry that cannot afford to stop. The site is a single-page journey that opens on a cinematic offshore hero, walks through six services and the four operating segments, and closes on a contact block that turns a visitor into a direct WhatsApp conversation with an engineer. It is a static Astro build with a self-hosted GSAP, ScrollTrigger and Lenis stack and self-hosted fonts, no CDN in production, content driven from typed source files, and Vitest guarding the WhatsApp and form logic.`
          ,
          stack: ["Astro", "TypeScript", "GSAP", "Lenis", "Canvas", "CSS3", "Vitest"],
          link: "https://modulo-engenharia.vercel.app",
          repo: "https://github.com/iannini25/Modulo-engenharia",
          cover: "img/covers/modulo-engenharia.webp?v=40529965",
          id: "modulo-engenharia",
          flow: {
            steps: [
              { label: "Offshore hero", sub: "industry that can't stop" },
              { label: "Six services", sub: "automation, electrical, maintenance" },
              { label: "Four segments", sub: "where the company works" },
              { label: "WhatsApp chat", sub: "straight to an engineer" }
            ]
          },
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          topics: [
            { icon: "sparkles", title: "Cinematic offshore hero",
              text: "An offshore oil platform at dusk slowly pulls back as you scroll, drawn as a frame sequence scrubbed on a canvas with GSAP and Lenis. It degrades to a static poster under reduced-motion, no-JS or missing frames." },
            { icon: "layers", title: "Four heavy-industry segments",
              text: "Mining, steel, offshore and energy each get their own read, from yard machines and long-distance conveyors to blast-furnace instrumentation and offshore control and safety systems." },
            { icon: "users", title: "WhatsApp message builder",
              text: "The contact block keeps WhatsApp as the primary channel: a short form assembles a ready message with name, company and segment and opens a direct conversation with an engineer, with no server round trip." },
            { icon: "gauge", title: "Static Astro, no CDN",
              text: "Built as a static Astro site with fonts and the GSAP/Lenis stack self-hosted and no CDN in production, editable content centralized in typed source files, and Vitest tests over the WhatsApp, form and build logic." }
          ]
        }, */
        {
          title: "CommunityHub · White Label Platform for Associations",
          desc: "Sales landing page for a white label platform that gives chambers of commerce, alliances and business networks a members portal with their own brand, AI introductions, events, committees and documents in one place.",
          longDesc: `CommunityHub is the white label version of the platform that already runs the IBA network between Brazil, Ireland and the United Kingdom. The page is written for association presidents and membership managers: it shows what a member does in a portal with the association's brand, how the AI introduces the right people and explains why, an assistant that only answers from the association's own content, the board running everything from one place, and LGPD and GDPR care. It ends on the plans and a demo request. Hand built in HTML, CSS and vanilla JavaScript, in Portuguese and English.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger"],
          link: "https://communityhub.bernardoiannini.com",
          cover: "img/covers/communityhub.webp?v=ee31ea6a",
          id: "communityhub",
          category: "system",
          featured: false,
          status: "live",
          year: "2026",
          topics: [
            { icon: "users", title: "Members portal with your brand",
              text: "Directory, events, committees and documents in a portal that carries the association's name, colors and domain." },
            { icon: "sparkles", title: "AI introductions that explain why",
              text: "The AI suggests who each member should meet and says why, and the assistant answers only from the association's own content." },
            { icon: "layers", title: "One place for the board",
              text: "The board runs members, events and content without asking IT for anything, with LGPD and GDPR care built in." },
            { icon: "globe", title: "Live at IBA",
              text: "The same platform already runs the IBA network between Brazil, Ireland and the United Kingdom." }
          ]
        },
        {
          title: "Nest Battersea · Sky Homes Residence Selector",
          desc: "Interactive residence selector for Nest Battersea, a 34-storey tower of sky homes with gardens on the Thames in London: click a lit window, fly to it, turn the 3D floor plan and step inside.",
          longDesc: `Nest Battersea is a build to rent tower at 38 Lombard Road, on the Battersea bank of the Thames, with 143 homes stacked like nests and a planted garden for each one. The site turns the official render of the tower into the navigation itself: the two available homes, LOFT 4 and Bungalow 3, are traced exactly over their windows, and a click sets off an AI generated camera flight that ends level with that window. From there the visitor opens a 3D dollhouse plan built from the official floor plans or steps through the glass into the living room and tours every room. Each clip starts and ends on frames of the official image itself, so the building never changes and only the camera moves. It is hand built in HTML, CSS and vanilla JavaScript with no framework, and the page goes on as the full launch site: the verified exterior views, the twelve home types with their official plans, sustainability, a live map of the neighbourhood with walking and driving routes, and the contact with the team. The Three.js plan, GSAP and the map load only when needed, and around 80 automated end-to-end checks cover desktop, phone, reduced motion and no JavaScript.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "Three.js", "GSAP", "ScrollTrigger", "MapLibre GL", "AI video (Kling 3.0)", "Puppeteer"],
          link: "https://nestbattersea.vercel.app",
          repo: "https://github.com/iannini25/NestBatterSea",
          cover: "img/covers/nest-battersea.webp?v=a854f8af",
          id: "nest-battersea",
          flow: {
            steps: [
              { label: "The tower", sub: "official render, windows traced" },
              { label: "Camera flight", sub: "straight to the chosen window" },
              { label: "3D floor plan", sub: "turn it, dive into a room" },
              { label: "Step inside", sub: "tour every room" },
              { label: "The neighbourhood", sub: "live map with real routes" }
            ]
          },
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          topics: [
            { icon: "sparkles", title: "AI camera flights that keep the building intact",
              text: "Each flight and each entry is a Kling 3.0 clip pinned to a first and a last frame: the official render on one end and a level shot of the open window on the other. The AI only invents the path in between, so the facade never redraws itself and only the camera moves." },
            { icon: "layers", title: "3D dollhouse from the official plans",
              text: "Every wall, window, stair and garden of both homes is modeled in Three.js from the architect's plans at 44.4 px per metre. The LOFT 4 plan switches between its two floors, and a click on any room dives into it and opens its photograph." },
            { icon: "palette", title: "A card cut around the interface",
              text: "The first screen is one large card with inverted corners where the logo, the menu, Register interest and the residence mini card sit. Its outline is a single SVG path used as a clip-path, recalculated from the real size of each element so the curves follow any screen." },
            { icon: "gauge", title: "Light on any device, tested end to end",
              text: "Clips come in 1080p or 720p by screen size, interiors in AVIF, WebP or JPG, and the 3D plan loads only when it opens. On the phone the first tap highlights a window and the second flies to it, reduced motion cuts straight to the destination, and about 80 Puppeteer checks cover desktop, retina, mobile and no JavaScript." },
            { icon: "globe", title: "A live map of the neighbourhood",
              text: "The location is a MapLibre GL map styled for the brand, with low 3D buildings and the tower marked as a column of light. A dedicated page lists 33 places with photos, category filters, satellite view and precomputed walking and driving routes that only cross the Thames by real bridges." },
            { icon: "search", title: "Every number from the official sources",
              text: "Twelve home types with areas and plans, 51 affordable homes, wheelchair layouts and the sustainability figures all come from the published planning documents, with sources logged. No price or rent appears, and everything illustrative is marked as such." }
          ]
        },
        /* removido a pedido: {
          title: "BRASA · Fire Kitchen Restaurant",
          desc: "Landing page for BRASA, an authorial live-fire restaurant in São Paulo serving aged cuts over wood embers, with an à la carte menu, a twelve-seat chef's counter and table reservations.",
          longDesc: `BRASA is a fine-dining fire kitchen in São Paulo: long-aged cuts cooked over live wood embers, a twelve-seat chef's counter and a six-course experience. The site sells that room before you walk in, opening on a cinematic hero where a 241-frame JPEG sequence paints on a canvas driven by the scroll, then flowing through the house story, the à la carte menu, an embedded sommelier and a reservation form. It is a hand-built no-build static site in HTML, CSS and vanilla JavaScript, using GSAP ScrollTrigger and Lenis for the scroll cinematics and a full PT and EN dictionary, with a static poster fallback on mobile and reduced motion.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://brasa-restaurante-ten.vercel.app",
          repo: "https://github.com/iannini25/brasa-restaurante",
          cover: "img/covers/brasa.webp?v=f3b139e7",
          id: "brasa",
          flow: {
            steps: [
              { label: "Fire hero", sub: "the room before you walk in" },
              { label: "The house", sub: "live wood-fire embers" },
              { label: "Menu and sommelier", sub: "à la carte and pairings" },
              { label: "Booking", sub: "12-seat chef's counter" }
            ]
          },
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          topics: [
            { icon: "sparkles", title: "Scroll-driven fire hero",
              text: "The hero is not a video. A 241-frame JPEG sequence paints on a canvas, where the scroll only sets a target frame and a requestAnimationFrame loop eases toward it, so a slow decode never stalls the page and the push-in stays smooth." },
            { icon: "layers", title: "Menu, sommelier and reservations",
              text: "The à la carte menu carries an embedded sommelier that suggests a pairing per dish, plus a reservation form that lets guests pick the dining room or the twelve-seat chef's counter." },
            { icon: "globe", title: "Bilingual PT and EN",
              text: "Full localization in Portuguese and English driven by a data-i18n dictionary, with a PT and EN toggle that switches every section, the menu and the sommelier in place." },
            { icon: "gauge", title: "Static, fast, accessible",
              text: "A no-build static site with Fraunces and Hanken typography, a skip link and reduced-motion support: below 861px the hero stays a static poster and no frames are downloaded." }
          ]
        }, */
        {
          title: "Sereno · Massage & Rest Studio",
          desc: "Premium landing page for a massage and rest studio that turns browsing into a session booked over WhatsApp.",
          longDesc: `Sereno is a massage and rest studio in Savassi, Belo Horizonte, that sells each session as a ritual, from single visits to monthly and yearly plans. The site has one job: turn someone who arrived curious into someone who asked for a time slot.\n\nThe page opens with the camera walking into the room and down to reception as you scroll, so the visit starts right there. Then come the studio gallery, a session told minute by minute, the plans and a short form that hands the request, ready to send, to the studio's WhatsApp. Brand, copy and art direction were built from scratch in a quiet-luxury tone: cream, blush and gold.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://sereno-site-one.vercel.app",
          repo: "https://github.com/iannini25/sereno-site",
          cover: "img/covers/sereno.webp?v=6c94e034",
          id: "sereno",
          flow: {
            steps: [
              { label: "Into the room", sub: "the camera glides to reception" },
              { label: "Gallery", sub: "the studio in detail" },
              { label: "Plans", sub: "single, monthly or yearly" },
              { label: "Booking", sub: "request ready on WhatsApp" }
            ]
          },
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          role: "brand, design, copy and front-end",
          topics: [
            { icon: "sparkles", title: "The visit starts on the first fold",
              text: "The camera crosses the room and glides down to reception as you scroll, in one continuous shot. Before reading any price, people have already felt the place." },
            { icon: "layers", title: "A session told minute by minute",
              text: "A horizontal gallery walks through a session from the welcome tea to the final rest, answering what everyone wants to know before booking: what it is like inside." },
            { icon: "chart", title: "WhatsApp as the booking engine",
              text: "The visit form collects name, WhatsApp, chosen ritual and best day, then assembles a ready message so the studio confirms in minutes without any booking system." },
            { icon: "palette", title: "Quiet luxury, no shouting",
              text: "Brand and copy built from scratch: cream, blush and gold, headings in Cormorant Garamond and body in Jost. Lots of air and no color yelling for attention." }
          ]
        },
        {
          title: "Amaro.fy · Made-to-order crochet",
          desc: "A cinematic one-page site for Amaro.fy, a handmade crochet studio in Belo Horizonte that makes exclusive pieces to order and closes every sale over WhatsApp.",
          longDesc: `Amaro.fy sells handmade crochet: each piece is knitted from scratch, in the client's size and color, from a photo or an idea she sends in. The site turns that into a scroll-driven story, from a made-to-order manifesto and a four-step process to a horizontal gallery of finished pieces, with sizing, care and packaging notes.\n\nIt all ends in an order form that writes the WhatsApp message by itself: the client picks the piece and the size and lands in a conversation already filled in. A crochet thread runs down the page margin and draws itself as she scrolls, carrying the handmade idea across the whole layout.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://amarofy.vercel.app",
          repo: "https://github.com/iannini25/amaro.fy-website",
          cover: "img/covers/amarofy.webp?v=399ef1e5",
          id: "amarofy",
          flow: {
            steps: [
              { label: "Manifesto", sub: "made to order" },
              { label: "The process", sub: "four steps" },
              { label: "Finished pieces", sub: "size, care and packaging" },
              { label: "Order", sub: "message ready on WhatsApp" }
            ]
          },
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          topics: [
            { icon: "sparkles", title: "An opening that moves with you",
              text: "The piece is revealed frame by frame as you scroll, with a wide framing on desktop and a vertical one, composed on purpose, on phones." },
            { icon: "users", title: "WhatsApp order builder",
              text: "The order form and size chips assemble a ready-to-send WhatsApp message, so the client lands in a conversation already filled with name, piece and size." },
            { icon: "layers", title: "Pinned horizontal gallery",
              text: "Finished pieces scroll sideways in a pinned track on desktop and fall back to native swipe on touch, every item redoable in the client's color and size." },
            { icon: "palette", title: "Knitted thread signature",
              text: "A single SVG crochet thread runs down the margin and draws itself as the page is scrolled, tying the craft idea to the whole layout." }
          ]
        },
        {
          title: "Automotiva Express · Bosch Car Service Shop",
          desc: "One-page site for Automotiva Express, a Bosch Car Service auto shop in Belo Horizonte, built around one promise: you approve the price before any repair.",
          longDesc: `Automotiva Express is a Bosch Car Service repair shop in Buritis, Belo Horizonte, selling dealership-grade service without dealership prices. The whole site is an anti-anxiety machine aimed at the number one pain in auto-shop reviews, the surprise bill: nothing is touched before you approve the quote, if something new comes up mid-repair the shop stops and tells you, and every job leaves with a warranty.\n\nThe page is a single scroll-driven story: it opens with the car in the shop, shows a four-step process the customer can actually follow and closes with the services and direct contact. Each block answers a concrete doubt from someone who has been burned by a repair bill before.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://automotiva-express.vercel.app",
          repo: "https://github.com/iannini25/automotiva-express",
          cover: "img/covers/automotiva-express.webp?v=a50a7163",
          id: "automotiva-express",
          flow: {
            steps: [
              { label: "Quote", sub: "the price before any work" },
              { label: "You approve", sub: "nothing without your ok" },
              { label: "Repair", sub: "something new? the shop stops and calls" },
              { label: "Warranty", sub: "every job is covered" }
            ]
          },
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          topics: [
            { icon: "shield", title: "You approve the price first",
              text: "Nothing gets touched before you approve the quote. If something new turns up mid-repair, the shop stops and tells you, so the surprise bill that dominates auto-shop reviews simply never happens." },
            { icon: "layers", title: "A four-step process you can follow",
              text: "Real diagnosis, a quote you approve, execution you can track and delivery with a warranty. Every step is visible and nothing moves behind your back." },
            { icon: "gauge", title: "Bosch Car Service standard",
              text: "Dealership-grade work without dealership prices: general mechanics, express services and embedded electrical and electronics, backed by the Bosch Car Service network." },
            { icon: "palette", title: "A page that calms instead of sells",
              text: "Sober tone, few colors and no screaming promotions. The dealership look gives the trust people look for before leaving their car." }
          ]
        },
        {
          title: "BeSafe · Human-Factor Security",
          desc: "Human-factor security platform: companies send simulated phishing through the channels they already use, and whoever clicks learns on the spot.",
          longDesc: "BeSafe is a human-factor security platform for companies. The admin imports the team, sends simulated phishing through email, Outlook, Slack, Teams and WhatsApp, and picks the date. Whoever clicks immediately sees a screen showing what could have leaked and goes straight to a short video lesson on that exact scam.\n\nThe results turn into metrics in two dashboards, one for the admin and one for each employee, and an education platform keeps video modules on old and new scams, always without blaming the person.",
          stack: ["Next.js 16","React 19","TypeScript","Python","PostgreSQL","Docker","Caddy"],
          link: "https://besafebr.com",
          repo: "",
          cover: "img/covers/besafe.webp?v=86534ea2",
          id: "besafe",
          flow: {
            steps: [
              { label: "Import the team", sub: "admin dashboard" },
              { label: "Simulated phishing", sub: "email, Teams, Slack, WhatsApp" },
              { label: "Click = lesson", sub: "video on that scam" },
              { label: "Risk as a metric", sub: "admin and employee dashboards" }
            ]
          },
          category: "system",
          featured: false,
          status: "pre-launch",
          year: "2026",
          role: "full-stack, whole product",
          story: {
            problem: {
              text: "Firewalls and antivirus protect machines, but most incidents start with a person: someone clicks a fake link, approves a payment on the phone or shares access under pressure. Companies rarely know who on their team would fall for a scam, and generic yearly trainings do not change behavior.\n\nThe hard part is testing people for real without exposing or blaming anyone, and turning each mistake into learning right at the moment it happens."
            }
          },
          topics: [
            { icon: "globe", title: "Phishing in every channel",
              text: "The company sends realistic fake scams through the channels the team already uses, email, Outlook, Slack, Teams and WhatsApp, to see who falls for them." },
            { icon: "shield", title: "Learning at the moment of the click",
              text: "Whoever clicks sees what could have leaked and goes straight into a short video lesson about that exact scam, without blame." },
            { icon: "layers", title: "Education platform",
              text: "Video modules on old and new scams, informal and up to date, included in the plan for the whole team." },
            { icon: "chart", title: "Human risk becomes a number",
              text: "Admin and employee dashboards turn behavior into measurable risk, and an in-app assistant helps check whether a message looks suspicious." }
          ]
        },
        {
          title: "JARVIS · Voice Assistant for the Car",
          desc: "A voice assistant for the car: you say \"Hey Jarvis\" and talk normally, and it reads the engine live, controls music and navigation and warns you before problems.",
          longDesc: "JARVIS is a voice assistant I built for my own car, a VW up! TSI, running on a Raspberry Pi inside the vehicle. You say \"Hey Jarvis\" and talk normally, in Portuguese, and it answers with a casual Brazilian personality, hearing you over road noise and letting you interrupt it mid-sentence.\n\nIt reads the engine live through the OBD2 port, explains warning lights and fault codes, answers from the car's owner manual, controls Spotify and navigation, and speaks up on its own with maintenance, fuel and weather alerts. It is the only project here without a website: it lives in the car, and a dashboard on the screen shows the gauges in real time.",
          stack: ["Python","FastAPI","React","Gemini","OpenAI","OBD2","Raspberry Pi"],
          link: "",
          repo: "",
          local: true,
          cover: "img/covers/jarvis.webp?v=e5c56b6e",
          id: "jarvis",
          flow: {
            steps: [
              { label: "\"Hey Jarvis\"", sub: "wake word, hands-free" },
              { label: "Understands", sub: "instant skills or AI" },
              { label: "Reads the car", sub: "live OBD2 data" },
              { label: "Answers by voice", sub: "and acts: music, route" }
            ]
          },
          category: "personal",
          featured: false,
          status: "runs locally",
          year: "2026",
          role: "personal project, whole product",
          story: {
            problem: {
              text: "Car assistants from phones do not know the car: they cannot read the engine, they do not understand a warning light and they struggle with cabin noise. Looking at a screen to find information while driving is exactly what should not happen.\n\nThe challenge was a hands-free copilot that really hears you in a noisy car, answers instantly for simple commands and still handles open questions, all running on a small computer inside the vehicle."
            }
          },
          topics: [
            { icon: "sparkles", title: "Voice built for the car",
              text: "Say \"Hey Jarvis\" and talk normally: it hears you over road noise, can be interrupted and raises its own voice when the cabin gets loud." },
            { icon: "gauge", title: "It knows the car",
              text: "Reads RPM, speed, temperature and more than 36 sensors live, explains fault codes and answers questions from the owner manual." },
            { icon: "layers", title: "Hybrid brain",
              text: "Common commands get an instant answer, open questions go to AI with backups, and a safety check reviews each action." },
            { icon: "shield", title: "Proactive copilot",
              text: "Warns about maintenance, fuel, weather and routes before you ask, controls Spotify and navigation and learns your habits." }
          ]
        },
        {
          title: "bernardoiannini.com · This Site",
          desc: "The site you're on right now: my portfolio, blog and résumé in one place, in two languages, designed and built by me from scratch.",
          longDesc: `This site is where I show who I am and what I build: projects, a blog, a résumé and a direct line to me. It is my own product, so it is also my lab: every page was designed and coded here, without templates.

Each project gets its own page explaining what it is, the problem behind it and how it works, with real screens. The whole site switches between Portuguese and English with one click, works for people navigating by keyboard or screen reader, and stays fully readable when animations are turned off.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP 3", "ScrollTrigger", "Lenis", "Node.js", "Markdown", "Supabase", "Vercel"],
          link: "https://www.bernardoiannini.com",
          repo: "https://github.com/iannini25/iannini-Frontend-Studio",
          cover: "img/covers/portfolio.webp?v=cae4a185",
          id: "portfolio",
          category: "personal",
          status: "in production",
          year: "2026",
          topics: [
            { icon: "palette", title: "One visual language, end to end",
              text: "Dark background, a single lime accent and one type family across home, blog and project pages, so everything reads as the work of the same hand." },
            { icon: "globe", title: "Portuguese and English, one click",
              text: "Every string on the site swaps language instantly, and each project and post also has its own address in each language for whoever arrives from search." },
            { icon: "layers", title: "A page of its own for every project",
              text: "Each project is told as a case: what it is, the problem, how it works, screens you can browse and who built it. Over sixty of them, each with its own accent color." },
            { icon: "users", title: "Made to be read by everyone",
              text: "Keyboard navigation, screen reader labels and respect for reduced motion. Animation adds to the page but is never needed to understand it." }
          ]
        },
        /* LAB:START */
        {
          "title": "Maresia Barcos · Motor catamaran shipyard landing page",
          "desc": "A design study for a fictional motor catamaran builder, made for offshore anglers who want to compare models before talking to sales.",
          "longDesc": "Maresia Barcos is a fictional shipyard built as a design study. The audience takes the sea seriously: weekend anglers, families crossing the bay, buyers who read spec sheets before signing anything. The site's job is to get them to configure a boat or book a sea trial.\n\nThe page opens on a boat cutting through open water, moves into a side-by-side comparison in \"Find the right boat\", builds trust with the equipment partners strip and closes on \"Ready to start your journey?\". Nautical blue is used sparingly, only where a decision happens; white space and water photography do the rest.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/01-barcos/",
          "cover": "img/covers/maresia-barcos.webp",
          "id": "maresia-barcos",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "chart",
              "title": "Specs you can compare",
              "text": "The 24 and 30 models sit in rows with length, beam, fuel and capacity. Buyers can decide on numbers before asking for a quote."
            },
            {
              "icon": "shield",
              "title": "Guarantees in plain figures",
              "text": "The quality card sums up sea-trial hours, hull warranty and zero-ballast. The promise becomes something you can check."
            },
            {
              "icon": "users",
              "title": "Suppliers on display",
              "text": "Engines, electronics, insurance and sonar get their own strip. Boat buyers want to know what goes inside the hull."
            },
            {
              "icon": "palette",
              "title": "Sea blue, sea photos",
              "text": "Nautical blue only marks buttons and the financing block. Aerial shots of turquoise water carry the color everywhere else."
            }
          ],
          "lab": true,
          "accent": "#2558A8",
          "fonts": [
            "Archivo",
            "Inter",
            "Instrument Serif"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Open water",
                "sub": "Boat in motion, stability promise"
              },
              {
                "label": "Find your boat",
                "sub": "Models 24 and 30 with full specs"
              },
              {
                "label": "Financing",
                "sub": "Blue block with payment terms"
              },
              {
                "label": "Owners",
                "sub": "Stories from people who fish with it"
              },
              {
                "label": "Start the journey",
                "sub": "Sea trial or build your boat"
              }
            ]
          },
          "signature": "A huge all-caps headline, half solid and half faded, laid over a boat running in open sea.",
          "goal": "Configure your boat",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "Demão Pinturas · Residential painting service landing page",
          "desc": "A design study for a fictional house-painting company, aimed at homeowners who want a fresh coat without dragging works or a mess.",
          "longDesc": "Demão Pinturas is a fictional interior, exterior and commercial painting company built as a design study. The audience is the homeowner who keeps postponing the job, afraid of mess, delays and a price that shifts halfway. The site needs to get them to request a quote, delivered within a day.\n\nThe page removes those fears one by one: the services gallery splits work by room, \"From quote to handover, no surprises\" walks through four steps, and the FAQ handles the rest. The brand's royal blue drips off a paint roller that crosses the hero and comes back at the close.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/02-pintura/",
          "cover": "img/covers/demao-pinturas.webp",
          "id": "demao-pinturas",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Service by room",
              "text": "A gallery switches between interior, facade and commercial work, listing what each includes. Visitors see the job they need, not a catalog."
            },
            {
              "icon": "shield",
              "title": "Four steps, no surprises",
              "text": "Site visit, colors and schedule, prep, then inspection with a clean house. The job stops being a black box before the quote."
            },
            {
              "icon": "search",
              "title": "Before and after, with context",
              "text": "Finished rooms are listed with timeline and square meters. Results read as case studies, not just nice photos."
            },
            {
              "icon": "palette",
              "title": "The roller as visual thread",
              "text": "Royal blue comes off a paint roller and only marks buttons and the closing block. The brand talks about paint without a brush icon."
            }
          ],
          "lab": true,
          "accent": "#01419A",
          "fonts": [
            "Inter Tight"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Roller hero",
                "sub": "Promise and quote request"
              },
              {
                "label": "Why Demão",
                "sub": "Tested colors, deadlines, warranty"
              },
              {
                "label": "Services",
                "sub": "Gallery by type of room"
              },
              {
                "label": "How it works",
                "sub": "Four steps from quote to handover"
              },
              {
                "label": "FAQ and CTA",
                "sub": "Answers and a fresh-looking home"
              }
            ]
          },
          "signature": "A real paint roller set on a diagonal, painting the hero background blue and returning in the final CTA.",
          "goal": "Get a free quote",
          "niche": "servico",
          "mood": "light"
        },
        {
          "title": "Linha Nobre · Fashion e-commerce home page",
          "desc": "A home page study for a fictional timeless fashion label, with light tailoring and knitwear, for people who buy clothes meant to last.",
          "longDesc": "Linha Nobre is a fictional fashion label created as a design study. It sells light tailoring, knitwear and pale denim to people who would rather buy less and wear it longer. The home page has one job: get visitors into a category or a product and into the cart.\n\nAfter the \"STYLE WITHOUT AN EXPIRY DATE\" hero, a strip covering shipping, returns and payment handles the usual online-shopping doubts. Then come the category picker, the new-season campaign and the best sellers with ratings and color options. The grey-blue of the photo studio becomes the brand color itself.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/03-moda-luxo/",
          "cover": "img/covers/linha-nobre.webp",
          "id": "linha-nobre",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "shield",
              "title": "Objections handled up top",
              "text": "Right under the hero, a bar covers free shipping, 30-day returns, payment options and support. Purchase doubts get answered before the first click."
            },
            {
              "icon": "layers",
              "title": "Categories shown as fabric",
              "text": "Womenswear, tailoring, bags and knitwear appear as texture cards. Shoppers pick by material, the way they would in a store."
            },
            {
              "icon": "chart",
              "title": "A storefront with proof",
              "text": "Each best seller shows price, rating, review count and color dots. You can compare without opening a product page."
            },
            {
              "icon": "palette",
              "title": "Studio color as brand color",
              "text": "The grey-blue photo backdrop matches the banner and the navy footer. Condensed Anton gives it a magazine feel."
            }
          ],
          "lab": true,
          "accent": "#0B2A55",
          "fonts": [
            "Anton",
            "Inter"
          ],
          "sections": 3,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero campaign",
                "sub": "Main look and lookbook link"
              },
              {
                "label": "Guarantee bar",
                "sub": "Shipping, returns, payment, help"
              },
              {
                "label": "Find your style",
                "sub": "Category carousel"
              },
              {
                "label": "New season",
                "sub": "Sale with up to half off"
              },
              {
                "label": "Best sellers",
                "sub": "Products with ratings and colors"
              }
            ]
          },
          "signature": "The condensed headline stacked in three lines, the last one faded, next to the model in a cream blazer.",
          "goal": "Shop the collection",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Terrana Arquitetura · Architecture and interiors studio website",
          "desc": "A design study for a fictional architecture, interiors and landscape studio, made for people about to build or renovate.",
          "longDesc": "Terrana Arquitetura is a fictional studio built as a design study. It works with families who are building, renovating or reshaping a garden and want a home that works day to day. The site has to turn that intent into a message with city, size and project type.\n\n\"From sketch to keys\" shows the four services, \"Real spaces. Real stories\" opens the portfolio on a dark band, and \"Let's design your place\" closes with the form. The palette stays between sand, beige and graphite, with the brand's taupe in the illustrations.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/04-arquitetura/",
          "cover": "img/covers/terrana-arquitetura.webp",
          "id": "terrana-arquitetura",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Services as models",
              "text": "Architecture, interiors, landscaping and site management become isometric miniatures. Each service gets a shape before it gets copy."
            },
            {
              "icon": "globe",
              "title": "Portfolio by place",
              "text": "Projects show a name and a city. It's clear the studio designs for very different settings."
            },
            {
              "icon": "users",
              "title": "A form that asks the right things",
              "text": "The project field asks for type, city and size. The first conversation starts with what the architect needs."
            },
            {
              "icon": "palette",
              "title": "Sand, beige and graphite",
              "text": "Light and dark bands alternate like light and shade in a house. Thin Manrope headings keep the tone calm."
            }
          ],
          "lab": true,
          "accent": "#A8937A",
          "fonts": [
            "Manrope"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Human scale",
                "sub": "Pool house and featured project"
              },
              {
                "label": "Sketch to keys",
                "sub": "Four services as models"
              },
              {
                "label": "Real stories",
                "sub": "Portfolio on a dark band"
              },
              {
                "label": "About the studio",
                "sub": "How the office thinks about daily life"
              },
              {
                "label": "Your place",
                "sub": "Contact form and details"
              }
            ]
          },
          "signature": "The four services drawn as isometric sand-colored models, like small clay houses.",
          "goal": "Start a project",
          "niche": "imovel",
          "mood": "light"
        },
        {
          "title": "Fôlego · Gym and coaching community landing page",
          "desc": "A design study for a fictional gym combining guided training, coaching and community, for people who never managed to stay consistent.",
          "longDesc": "Fôlego is a fictional gym created as a design study. It speaks to people who have started and quit many times and need someone calling them by name plus a clear plan. The site wants them to book a first session.\n\nThe page lays out coaching, community and tailored training, then \"Training for everyone\" shows no-contract packages, and the progress section displays a dashboard with calories and lifting loads. Red-orange and lime green work like sports-kit colors.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/05-fitness/",
          "cover": "img/covers/folego.webp",
          "id": "folego",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "users",
              "title": "Community before equipment",
              "text": "Testimonials and the Saturday run come before the facilities. The gym sells itself through the group that keeps you showing up."
            },
            {
              "icon": "chart",
              "title": "Package or drop-in",
              "text": "Two contrasting cards show a ten-session pack and a single class, no signup fee. The pricing choice fits in one glance."
            },
            {
              "icon": "gauge",
              "title": "Progress you can see",
              "text": "A block mocks up the dashboard with daily calories and load progress. It shows the coach actually tracks you."
            },
            {
              "icon": "palette",
              "title": "Kit colors",
              "text": "Red-orange for actions, lime for highlights, over black-and-white photos. The energy comes from color, not exclamation marks."
            }
          ],
          "lab": true,
          "accent": "#FF4A2A",
          "fonts": [
            "Inter"
          ],
          "sections": 7,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Unlock",
                "sub": "Promise and first session"
              },
              {
                "label": "Active-life hub",
                "sub": "Coaching, community, a testimonial"
              },
              {
                "label": "Plans",
                "sub": "Session pack or drop-in"
              },
              {
                "label": "Progress",
                "sub": "Health dashboard and members"
              },
              {
                "label": "Train with us",
                "sub": "Articles and email invite"
              }
            ]
          },
          "signature": "A runner mid-stride over a diagonal lime-green band, with a member card floating beside him.",
          "goal": "Start training",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Garfo Verde · Restaurant delivery marketplace home",
          "desc": "A design study for a fictional delivery app gathering neighborhood restaurants, for people who order fresh food from their own address.",
          "longDesc": "Garfo Verde is a fictional delivery marketplace created as a design study. It serves people who order in often and want local options with clear delivery times. The page has one dominant action: type your address and find food.\n\nThe address field sits at the center of the hero. Then come round photo categories, a first-order coupon and \"Most ordered dishes\" with restaurant, delivery time and rating. The dark green background makes the food and the leaf-green brand color pop.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/06-delivery/",
          "cover": "img/covers/garfo-verde.webp",
          "id": "garfo-verde",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "search",
              "title": "Address first",
              "text": "The address search holds the hero's spotlight. Everything after depends on knowing where the customer is."
            },
            {
              "icon": "layers",
              "title": "Categories in one swipe",
              "text": "Pizza, Japanese, pasta and desserts appear as round food photos. Picking a cuisine takes a single gesture."
            },
            {
              "icon": "chart",
              "title": "Cards with everything to decide",
              "text": "Each dish shows restaurant, delivery minutes, rating and price, plus an add button. Ordering doesn't need another screen."
            },
            {
              "icon": "palette",
              "title": "Dark ground, bright food",
              "text": "Near-black green makes the photos glow. Anton headings and a Caveat handwritten badge add a market-stall feel."
            }
          ],
          "lab": true,
          "accent": "#8BC34A",
          "fonts": [
            "Anton",
            "Caveat",
            "Plus Jakarta Sans"
          ],
          "sections": 3,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Eat well",
                "sub": "Search by delivery address"
              },
              {
                "label": "Categories",
                "sub": "Cuisine carousel"
              },
              {
                "label": "First order",
                "sub": "Discount code for new users"
              },
              {
                "label": "Most ordered",
                "sub": "Dishes with time, rating, price"
              },
              {
                "label": "Stay hungry",
                "sub": "Coupon newsletter"
              }
            ]
          },
          "signature": "\"COMA BEM\" (eat well) in huge letters, a colorful bowl covering the middle of the word and a handwritten healthy-food badge.",
          "goal": "Find food nearby",
          "niche": "comida",
          "mood": "dark"
        },
        {
          "title": "Alpendre Imóveis · Real estate portal to buy, rent and sell",
          "desc": "A design study for a fictional property portal, for families buying, renting or selling with verified listings and a dedicated agent.",
          "longDesc": "Alpendre Imóveis is a fictional real estate portal created as a design study. The audience is families looking for a home, plus owners who want to sell without hassle. The site has to get people searching listings or leaving their details for an agent.\n\nThe search, with buy, rent and sell tabs, sits right in the hero. A trust section covers verified listings, a dedicated agent and no-queue visits; \"Find your dream home\" brings filters and listing cards; the closing form invites a conversation. The brand's amber marks prices and buttons.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/07-imobiliaria/",
          "cover": "img/covers/alpendre-imoveis.webp",
          "id": "alpendre-imoveis",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "search",
              "title": "Search with three intents",
              "text": "Buy, rent and sell sit as tabs above the neighborhood field. Each visitor enters for their own reason."
            },
            {
              "icon": "shield",
              "title": "Verified listings",
              "text": "Photos, size and paperwork are checked by an agent before going live. Trust in the listing is the portal's edge."
            },
            {
              "icon": "layers",
              "title": "Filters and full cards",
              "text": "Type, location, date and price live in one bar. Each card shows bedrooms, bathrooms, area and a sale or rent tag."
            },
            {
              "icon": "palette",
              "title": "Amber where money is",
              "text": "Amber shows up on prices, buttons and the featured review. Everything else stays stone grey, like a concrete facade."
            }
          ],
          "lab": true,
          "accent": "#FFA829",
          "fonts": [
            "League Spartan"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Home you love",
                "sub": "Search and featured home"
              },
              {
                "label": "How it works",
                "sub": "Verified listings and agent"
              },
              {
                "label": "Find a home",
                "sub": "Filters and listing grid"
              },
              {
                "label": "Clients",
                "sub": "Tilted testimonial cards"
              },
              {
                "label": "Say hello",
                "sub": "Form to reach an agent"
              }
            ]
          },
          "signature": "A wood-and-concrete house cut out in the hero, with the Casa Ipê card and amber arrows to browse homes.",
          "goal": "Search homes",
          "niche": "imovel",
          "mood": "light"
        },
        {
          "title": "Musgo Casa · Design furniture store landing page",
          "desc": "A design study for a fictional furniture brand making timeless pieces in small batches, for people furnishing their home online.",
          "longDesc": "Musgo Casa is a fictional furniture store created as a design study. It sells sofas, tables and armchairs in reforested wood to people setting up or refreshing a home who want to buy online without worry. The site exists to lead them into the catalog and to checkout.\n\nAfter a hero with catalog and review counters, featured rooms lead into \"Modern design for any budget\", with pieces and prices. \"What makes us different\" explains curation, designer support and studio-direct pricing. Moss green shows up on buttons and tags, like a plant in the corner of a room.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/08-moveis/",
          "cover": "img/covers/musgo-casa.webp",
          "id": "musgo-casa",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Rooms before products",
              "text": "Dining table, balcony and sofa appear in styled scenes. Shoppers see the piece at home before the spec sheet."
            },
            {
              "icon": "chart",
              "title": "Prices in plain sight",
              "text": "Each piece shows name and price on the photo, with a cart button. Installments and warranty sit right in the section intro."
            },
            {
              "icon": "users",
              "title": "A designer on call",
              "text": "Specialists help pick sizes and fabrics over video or in store. Buying furniture online feels less risky."
            },
            {
              "icon": "palette",
              "title": "Moss green and wood",
              "text": "The brand green echoes the plants in the photos. Soft 3D illustrations keep the benefits light."
            }
          ],
          "lab": true,
          "accent": "#679936",
          "fonts": [
            "Inter"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Dream home",
                "sub": "Featured room and store numbers"
              },
              {
                "label": "Rooms",
                "sub": "Dining, balcony and sofa"
              },
              {
                "label": "Catalog",
                "sub": "Pieces with price and cart"
              },
              {
                "label": "Why us",
                "sub": "Curation, experts, fair price"
              },
              {
                "label": "Shop now",
                "sub": "Final call and newsletter"
              }
            ]
          },
          "signature": "A bright living room set into a cut-out frame, with a moss-green bar of numbers in the corner.",
          "goal": "Shop furniture",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Arco Estúdio · Branding and digital agency website",
          "desc": "A design study for a fictional branding and digital marketing agency, aimed at companies that want brand and campaigns from one team.",
          "longDesc": "Arco Estúdio is a fictional agency built as a design study. It talks to business owners and marketing teams who want strategy, identity and paid media handled by one crew. The site needs to end in a project email.\n\nThe solutions section lists services as a numbered accordion, \"Our latest projects\" shows fictional cases like Leite Lunar, and \"Got a project? Let's talk\" closes on a midnight-blue band. The brand's indigo violet fills entire blocks, giving the site a poster feel.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/09-agencia/",
          "cover": "img/covers/arco-estudio.webp",
          "id": "arco-estudio",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Services as an index",
              "text": "Strategy, identity, marketing, paid media and analytics become a numbered list that opens on click. Clients find what they need without a wall of text."
            },
            {
              "icon": "sparkles",
              "title": "Cases with the product on show",
              "text": "Packaging and identities appear in cards named after fictional clients. The work speaks before the description."
            },
            {
              "icon": "users",
              "title": "Two layers of proof",
              "text": "Photo testimonials sit next to a strip of client logos. Each backs up the other."
            },
            {
              "icon": "palette",
              "title": "Indigo as a full block",
              "text": "Indigo violet isn't an accent here: it fills whole sections, alternating with midnight blue and white. Karla keeps it friendly and precise."
            }
          ],
          "lab": true,
          "accent": "#4F4AD7",
          "fonts": [
            "Karla"
          ],
          "sections": 5,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Creative studio",
                "sub": "Manifesto, case and numbers"
              },
              {
                "label": "How we work",
                "sub": "Business immersion and video"
              },
              {
                "label": "Solutions",
                "sub": "Expandable service list"
              },
              {
                "label": "Projects",
                "sub": "Recent cases and call to action"
              },
              {
                "label": "Let's talk",
                "sub": "Testimonials and studio email"
              }
            ]
          },
          "signature": "\"ESTÚDIO CRIATIVO\" in heavy type with a small pill-shaped image between the words, above a thin \"BRANDING & DIGITAL\".",
          "goal": "Start a project",
          "niche": "criativo",
          "mood": "light"
        },
        {
          "title": "Andalá Viagens · Family travel agency landing page",
          "desc": "A design study for a fictional family travel agency, for parents who want holidays with kids without weeks of planning.",
          "longDesc": "Andalá Viagens is a fictional agency created as a design study. The audience is parents who want to travel with their kids but stall on logistics: cribs, transfers, a child's pace. The site wants them to request an itinerary.\n\n\"Not sure where to go?\" offers trip types like beach and mountains, \"Your trip in 4 steps\" lays out the process, and \"Why travel with Andalá\" covers a single consultant, car seats on transfers and a fixed price. Sky blue and family beach photos keep it light, far from a package-tour look.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/10-viagens/",
          "cover": "img/covers/andala-viagens.webp",
          "id": "andala-viagens",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "search",
              "title": "Search built for families",
              "text": "The search bar includes a travelers field, like \"Family of 4\", next to destination and dates. Kids count from the first filter."
            },
            {
              "icon": "layers",
              "title": "A four-step process",
              "text": "Tell us about the family, get the plan, tweak it, enjoy. Big numerals make the path clear before any call."
            },
            {
              "icon": "shield",
              "title": "What parents actually ask",
              "text": "Connecting rooms, kid-friendly pace, car seats and 24/7 support get their own cards. These are the doubts that stall a booking."
            },
            {
              "icon": "palette",
              "title": "Sky blue, real families",
              "text": "Light blue shows up in the ocean and the details. Bricolage Grotesque feels warm, nothing like an airline."
            }
          ],
          "lab": true,
          "accent": "#639CCC",
          "fonts": [
            "Bricolage Grotesque"
          ],
          "sections": 7,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "More family time",
                "sub": "Promise and trip search"
              },
              {
                "label": "Where to go",
                "sub": "Trip types in a carousel"
              },
              {
                "label": "4 steps",
                "sub": "From first contact to coming home"
              },
              {
                "label": "Why Andalá",
                "sub": "Benefits and favorite destinations"
              },
              {
                "label": "Next holiday",
                "sub": "Email to get an itinerary"
              }
            ]
          },
          "signature": "\"Viagem em família\" in huge letters running across a photo of a father lifting his son on the beach.",
          "goal": "Plan the trip",
          "niche": "viagem",
          "mood": "light"
        },
        {
          "title": "Liana Nutri · Immunity supplements e-commerce",
          "desc": "A design study for a fictional supplement brand with open formulas and per-batch lab reports, for people who read the label.",
          "longDesc": "Liana Nutri is a fictional supplement brand created as a design study. It speaks to people who read labels, distrust miracle claims and want to know what they're taking. The site needs to lead them to buy a bottle, starting with the featured Calma Imune.\n\nThe exposure section explains the need without alarm, the bioavailability block lines the capsules up side by side, and the shop brings filters by benefit and ingredient. The forest green of the bottles repeats in the foliage photos, tying product to nature.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/11-suplementos/",
          "cover": "img/covers/liana-nutri.webp",
          "id": "liana-nutri",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "search",
              "title": "Filter by benefit",
              "text": "The shop filters by benefit, ingredient and formula type. People arriving with a goal find the right bottle without reading everything."
            },
            {
              "icon": "shield",
              "title": "Transparency as the pitch",
              "text": "Open formula, per-batch report and vegan capsule appear as fixed labels. The brand sells on what it shows, not what it promises."
            },
            {
              "icon": "layers",
              "title": "Science in plain words",
              "text": "What weighs on immunity becomes a short list with photos. The explanation comes before the sale, no jargon."
            },
            {
              "icon": "palette",
              "title": "Bottles and foliage",
              "text": "Each bottle has its own color, but forest green leads. Reviews use product shots among leaves, not stock faces."
            }
          ],
          "lab": true,
          "accent": "#1F3B2A",
          "fonts": [
            "Instrument Sans"
          ],
          "sections": 7,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Natural defense",
                "sub": "Calma Imune with price and buy"
              },
              {
                "label": "Daily exposure",
                "sub": "Why immunity needs support"
              },
              {
                "label": "Bioavailable",
                "sub": "Capsules and ingredients"
              },
              {
                "label": "Supplements",
                "sub": "Shop with filters"
              },
              {
                "label": "Who uses it",
                "sub": "Reviews on foliage cards"
              }
            ]
          },
          "signature": "A huge \"/iana\" wordmark in the middle of the page, its slash in green, flanked by open-formula and lab-report labels.",
          "goal": "Buy supplements",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Alento · Daily wellbeing program landing page",
          "desc": "A design study for a fictional wellbeing platform that suggests one step a day, for people lost in too much health advice.",
          "longDesc": "Alento is a fictional wellbeing platform created as a design study. The audience already knows what they should do for their health but freezes when it's time to choose. The site wants them to take the initial assessment.\n\nThe line \"Most people don't fail at self-care. They fail at deciding what to do today\" frames the problem. \"How we help you feel well, realistically\" shows the two-minute daily check-in and a dashboard of accepted suggestions, and testimonials close on dark green. Mint green only appears where there's an action.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/12-wellness/",
          "cover": "img/covers/alento.webp",
          "id": "alento",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "A problem stated well",
              "text": "The line about not knowing what to do today is the heart of the site. The product is pitched as the answer, not as another habit app."
            },
            {
              "icon": "gauge",
              "title": "A two-minute check-in",
              "text": "Three morning questions, weekly patterns and gentle reminders. The routine is small enough to do on the bus."
            },
            {
              "icon": "chart",
              "title": "A dashboard as proof",
              "text": "A dark chart shows accepted suggestions over the months. It's the only numbers-heavy moment on a calm page."
            },
            {
              "icon": "palette",
              "title": "Sunset and mint",
              "text": "Warm-light photos set the mood and mint green stays on actions. The dark-green close gives weight to the testimonials."
            }
          ],
          "lab": true,
          "accent": "#1FBF7A",
          "fonts": [
            "Inter"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Possible balance",
                "sub": "Promise and how-it-works video"
              },
              {
                "label": "The problem",
                "sub": "Deciding what to do today"
              },
              {
                "label": "Daily check-in",
                "sub": "Questions, patterns, reminders"
              },
              {
                "label": "Support",
                "sub": "Suggestions and guilt-free return"
              },
              {
                "label": "Real lives",
                "sub": "Testimonials and topics"
              }
            ]
          },
          "signature": "\"Equilíbrio possível\" centered over the silhouette of a person in a yoga pose against the sunset.",
          "goal": "Take the assessment",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Mente Calma · Mental health app landing page",
          "desc": "A design study for a fictional meditation and mood-journal app with partner psychologists, for people with only minutes to spare.",
          "longDesc": "Mente Calma is a fictional mental health app created as a design study. It speaks to people on autopilot who think meditation takes time they don't have. The site wants them to download the app or book a session with a partner psychologist.\n\n\"Guided pauses for any time of day\" offers 2 to 10-minute audios, the next section ties each pause to a real moment of the day, and \"Pick the pace that fits your routine\" lays out the plans. The FAQ makes it clear the app doesn't replace therapy. Lilac clouds and sage green keep it light.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/13-mente-calma/",
          "cover": "img/covers/mente-calma.webp",
          "id": "mente-calma",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Duration on the cover",
              "text": "Each audio shows its minutes at the top of the card, from 2 to 10. People choose by the time they have, not by technique."
            },
            {
              "icon": "users",
              "title": "A psychologist when needed",
              "text": "Beyond audios, the app offers video sessions with partner professionals. The top plan includes two a month."
            },
            {
              "icon": "shield",
              "title": "Limits stated clearly",
              "text": "The FAQ says up front the app isn't a replacement for therapy and points to crisis help. Responsibility becomes part of the design."
            },
            {
              "icon": "palette",
              "title": "Lilac sky, sage green",
              "text": "Pink and lilac clouds open the site, sage green marks actions. Nothing shouts, as it should be in a calm app."
            }
          ],
          "lab": true,
          "accent": "#5E9473",
          "fonts": [
            "Inter"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Calm mind",
                "sub": "Mascot, promise, first step"
              },
              {
                "label": "Tools",
                "sub": "Exercises, journey, community"
              },
              {
                "label": "Guided pauses",
                "sub": "Audios by duration"
              },
              {
                "label": "Plans",
                "sub": "Free, Plus and Complete"
              },
              {
                "label": "Questions",
                "sub": "FAQ and therapy notice"
              }
            ]
          },
          "signature": "A small green bag with a smiling face floating among pink clouds, next to a card with the day's tasks.",
          "goal": "Take the first step",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Lastro · AI financial management SaaS landing page",
          "desc": "A design study for a fictional AI finance SaaS, for finance teams juggling accounts and currencies and living in side spreadsheets.",
          "longDesc": "Lastro is a fictional financial management SaaS created as a design study. The audience is finance managers at small and mid-sized companies reconciling accounts, currencies and P&L by hand. The site needs them to start the free trial or book a demo.\n\nThe full \"Overview\" dashboard sits right under the headline, the next section details the multi-currency wallet and real-time P&L, the integrations block shows the connectors, and \"Plans that grow with your operation\" closes with three tiers. Mossy stones and ferns add texture to a usually cold subject.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/14-saas-financas/",
          "cover": "img/covers/lastro.webp",
          "id": "lastro",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "chart",
              "title": "Product shown up front",
              "text": "The dashboard with balance, wallets, cash flow and margin sits in the hero. Managers get the product before reading a feature list."
            },
            {
              "icon": "globe",
              "title": "Many currencies, one balance",
              "text": "Real, dollar, euro and pound share one card with today's rate. It fits teams operating abroad without switching tools."
            },
            {
              "icon": "layers",
              "title": "Plans side by side",
              "text": "Essential, a highlighted Professional and Enterprise on request, with clear limits. A 14-day trial without a card lowers friction."
            },
            {
              "icon": "palette",
              "title": "Moss on a cold subject",
              "text": "Grey cloud backdrops, mossy stones and olive green. Finance gets a sense of solidity, which is what the name means."
            }
          ],
          "lab": true,
          "accent": "#5E7D2A",
          "fonts": [
            "Outfit"
          ],
          "sections": 10,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Next level",
                "sub": "Promise, trial and demo"
              },
              {
                "label": "Overview",
                "sub": "Full dashboard and logos"
              },
              {
                "label": "Features",
                "sub": "Multi-currency and live P&L"
              },
              {
                "label": "Integrations",
                "sub": "Bank and ERP connectors"
              },
              {
                "label": "Plans",
                "sub": "Three tiers and newsletter"
              }
            ]
          },
          "signature": "The full finance dashboard resting on a moss-covered stone, with a fern rising behind it.",
          "goal": "Start free trial",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "Assenta · Design chairs and armchairs e-commerce",
          "desc": "A design study for a fictional chair and armchair brand, for people who want a piece that lasts decades and pick color and fabric.",
          "longDesc": "Assenta is a fictional chair and armchair brand created as a design study. It speaks to people furnishing a home or office without rush who would rather own one good piece than three bad ones. The site wants to lead them to the collection and to checkout.\n\n\"VALUES\" presents customization, sustainability and comfort as tags hanging off a bar stool, \"CHAIR COLLECTION\" filters twelve models by room, and \"CATEGORIES\" shows the office chair in a real room with specs. Lime green over black and white gives it all a poster feel.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/15-cadeiras/",
          "cover": "img/covers/assenta.webp",
          "id": "assenta",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Product against type",
              "text": "Every section sets a cut-out chair over a huge Anton heading. The furniture becomes a character, not a catalog item."
            },
            {
              "icon": "layers",
              "title": "Collection by room",
              "text": "Models filter by work, living and dining room in a priced carousel. The choice starts with where the chair will live."
            },
            {
              "icon": "gauge",
              "title": "Specs that answer doubts",
              "text": "The office chair lists material, lumbar support, height and swivel on a white card. That's what people ask before buying unseen."
            },
            {
              "icon": "palette",
              "title": "Lime, black and moss",
              "text": "Lime and black bring poster energy; the moss-green armchairs calm it down. Pill labels read like store tags."
            }
          ],
          "lab": true,
          "accent": "#B5D97A",
          "fonts": [
            "Anton",
            "Inter Tight"
          ],
          "sections": 3,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Chairs",
                "sub": "Featured armchair and price"
              },
              {
                "label": "Values",
                "sub": "Customization, ethics, comfort"
              },
              {
                "label": "Collection",
                "sub": "Models filtered by room"
              },
              {
                "label": "Categories",
                "sub": "Office chair in a real room"
              },
              {
                "label": "Newsletter",
                "sub": "Launches and new fabrics"
              }
            ]
          },
          "signature": "The word \"CADEIRAS\" in giant lime green at the top, with a moss-green armchair cutting through the letters.",
          "goal": "Browse the collection",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Breu Cold Brew · Bottled cold brew e-commerce",
          "desc": "A design study for a fictional bottled cold brew brand, for people who want specialty iced coffee ready in the fridge, no sugar.",
          "longDesc": "Breu Cold Brew is a fictional cold-extracted coffee brand created as a design study. It serves regular iced-coffee drinkers who want it ready-made, unsweetened and from specialty beans. The site needs them to pick a flavor and buy.\n\nBeans and slow extraction are explained in alternating photo-and-text blocks, \"Find your cold brew\" shows three flavors with prices, and \"Energy for your day\" goes deeper into brewing and beans inside orange arcs. A newsletter with a first-order discount closes the page. Bright orange is used in thin lines, like an outline.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/16-cold-brew/",
          "cover": "img/covers/breu-cold-brew.webp",
          "id": "breu-cold-brew",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Three flavors, no maze",
              "text": "Preto Puro, Mocha Firme and Aveia Gelado each get a short line, price and order button. The whole shop fits in one row."
            },
            {
              "icon": "search",
              "title": "Process as the pitch",
              "text": "Extraction hours, double filtering and small-farm beans get their own sections. People paying more for coffee want to know why."
            },
            {
              "icon": "sparkles",
              "title": "Arcs as frames",
              "text": "Photos of glasses and beans sit inside orange arcs that echo a cup's outline. The same stroke returns in the newsletter."
            },
            {
              "icon": "palette",
              "title": "Classic serif, bright orange",
              "text": "DM Serif Display feels like a coffee shop sign, and orange is kept to lines and buttons. White space lets the coffee be the color."
            }
          ],
          "lab": true,
          "accent": "#FF6B00",
          "fonts": [
            "DM Serif Display",
            "Plus Jakarta Sans",
            "Quicksand"
          ],
          "sections": 7,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Cold Brew",
                "sub": "Featured glass and price"
              },
              {
                "label": "Big hit",
                "sub": "Brand numbers"
              },
              {
                "label": "Beans and brew",
                "sub": "How the coffee is made"
              },
              {
                "label": "Flavors",
                "sub": "Three bottles with prices"
              },
              {
                "label": "Newsletter",
                "sub": "Reviews and discount"
              }
            ]
          },
          "signature": "\"Cold Brew\" in a thin serif, with a glass of coffee and milk swirling right through the letters.",
          "goal": "Buy cold brew",
          "niche": "comida",
          "mood": "light"
        },
        {
          "title": "Colo · Newborn care service landing page",
          "desc": "A design study for a fictional newborn guidance service with a monthly care kit, aimed at first-time parents in the early months.",
          "longDesc": "Colo is a fictional newborn care service created as a design study. It combines guidance from nurses and lactation consultants with a monthly kit of essentials. The audience is first-time parents, tired and full of questions. The site wants them to talk to a specialist.\n\n\"The daily care they need\" organizes bathing, diapers, sleep and feeding as an accordion, \"Made with babies in mind\" shows formulas, chat and kit, and the FAQ makes clear Colo doesn't replace the pediatrician. Electric blue cuts through an almost all-white, soft page.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/17-bebe/",
          "cover": "img/covers/colo.webp",
          "id": "colo",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "users",
              "title": "Real people on the other end",
              "text": "Nurses and consultants answer by chat, with hours shown. For exhausted parents, knowing someone is there matters more than the product."
            },
            {
              "icon": "layers",
              "title": "Routine as questions",
              "text": "Bathing, diapers, sleep and feeding open as an accordion with a short guide each. Information arrives when the doubt does."
            },
            {
              "icon": "shield",
              "title": "No overpromising",
              "text": "The FAQ says straight away the service isn't a pediatrician replacement. Honesty is part of what earns trust here."
            },
            {
              "icon": "palette",
              "title": "Soft white, precise blue",
              "text": "Clouds, bright baby photos and rounded corners set the mood. Electric blue only shows up where there's an action."
            }
          ],
          "lab": true,
          "accent": "#0055FF",
          "fonts": [
            "Bricolage Grotesque"
          ],
          "sections": 7,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Precious start",
                "sub": "Promise and specialist contact"
              },
              {
                "label": "Beyond basics",
                "sub": "Guidance, routine and products"
              },
              {
                "label": "Daily care",
                "sub": "Task guides in an accordion"
              },
              {
                "label": "Made for babies",
                "sub": "Formulas, chat and kit"
              },
              {
                "label": "Families and FAQ",
                "sub": "Stories, answers, final call"
              }
            ]
          },
          "signature": "A father lifting his baby against a sky of clouds, with cards about baby focus and gentle care floating around them.",
          "goal": "Talk to a specialist",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Lume Casa · Smart home devices landing page",
          "desc": "A design study for a fictional AI smart-home device brand, for people who want automation without setting up app after app.",
          "longDesc": "Lume Casa is a fictional smart-home brand created as a design study. It speaks to people who like the idea of automation but give up when faced with five apps and endless setup. The site wants them to answer three questions and get a suggested kit.\n\n\"Meet a smarter way to live\" covers habit learning, privacy and integration, \"Discover the latest home devices\" shows products in a numbered carousel, and \"A smarter life starts with one click\" closes with the app in hand. Neon lime brings life to an otherwise beige and grey page.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/18-smart-device/",
          "cover": "img/covers/lume-casa.webp",
          "id": "lume-casa",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Devices as objects",
              "text": "Products appear like decor, on plinths under soft light. The tech sells itself by disappearing into the home, not by looking like a gadget."
            },
            {
              "icon": "shield",
              "title": "Privacy up front",
              "text": "A lime card says data is processed on the device itself. That's the main objection from people hesitant to put a camera at home."
            },
            {
              "icon": "layers",
              "title": "A numbered catalog",
              "text": "Lamps and climate devices appear on large numbered cards, one at a time. Each product gets room to explain what it does on its own."
            },
            {
              "icon": "palette",
              "title": "Calm beige, electric lime",
              "text": "The beige and grey feel almost like a furniture store, while lime marks displays and buttons. The contrast reads like a light switched on."
            }
          ],
          "lab": true,
          "accent": "#E8F65A",
          "fonts": [
            "Inter"
          ],
          "sections": 5,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Smart home",
                "sub": "Thermostat and promise"
              },
              {
                "label": "Smarter living",
                "sub": "Habits, privacy, integration"
              },
              {
                "label": "Devices",
                "sub": "Numbered product carousel"
              },
              {
                "label": "What people say",
                "sub": "Testimonial and case study"
              },
              {
                "label": "One click",
                "sub": "Three questions, suggested kit"
              }
            ]
          },
          "signature": "A cream, retro-radio-style thermostat on a stone plinth, its lime display reading 21°.",
          "goal": "Build your kit",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "Brisa · Mental health app landing page",
          "desc": "A landing study for Brisa, a fictional app pairing a mood journal with therapist sessions for people who want low-pressure mental care.",
          "longDesc": "Brisa is a fictional brand made for this study: a mental health app combining a guided journal, mood tracking and sessions with licensed psychologists. It speaks to adults who keep putting off looking after their heads because it feels like a hassle. The site has one job: get them to download the app.\n\nIt opens on \"Um canto calmo para cuidar da sua mente\" against a cloudy sky, moves through privacy badges, shows the product in \"Ferramentas que acompanham o seu ritmo\" and closes with \"Seu apoio, onde você estiver\" around a phone. Sage green and open sky keep it far from a clinic look.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/19-terapia-app/",
          "cover": "img/covers/brisa.webp",
          "id": "brisa",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Sky and sage instead of white",
              "text": "The hero and footer use clouds and an open meadow instead of clinical white. Sage green is kept for buttons and badges so the tone stays quiet."
            },
            {
              "icon": "shield",
              "title": "Badges that answer the fear",
              "text": "Right after the hero, four laurel badges cover privacy, licensed therapists and encrypted data. That's the first worry of anyone about to write down their feelings."
            },
            {
              "icon": "layers",
              "title": "The app shown as tiles",
              "text": "A green bento shows monthly sessions, a mood calendar, journaling streaks and a booked session. Visitors get the product without reading a paragraph."
            },
            {
              "icon": "users",
              "title": "A testimonial with room to breathe",
              "text": "A carousel of illustrative quotes pairs large type with a close-up portrait. The footer states the app doesn't replace care and points to a crisis line."
            }
          ],
          "lab": true,
          "accent": "#5E8A5A",
          "fonts": [
            "Manrope"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Sky opener",
                "sub": "Promise of calm and app cards"
              },
              {
                "label": "Badges and partners",
                "sub": "Privacy and integrations"
              },
              {
                "label": "Tools",
                "sub": "Bento with mood, sessions, journal"
              },
              {
                "label": "On your phone",
                "sub": "Voice journal and mood check-in"
              },
              {
                "label": "Story and contact",
                "sub": "Testimonial and help channel"
              }
            ]
          },
          "signature": "A woman with closed eyes against a cloudy sky, surrounded by floating cards for mood, breathing and the next session.",
          "goal": "Download the app",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Ventara · Sports car collection landing page",
          "desc": "A landing study for Ventara, a fictional collection of sports cars and grand tourers for people who want to buy or drive something special.",
          "longDesc": "Ventara is a fictional dealer of sports cars and grand tourers, created for this study. It targets people who want a special car without a drawn-out buying process. The action that matters is booking a test drive.\n\nThe page opens with \"FEITO PARA DESAFIAR LIMITES\" in huge condensed type over the Éter GT, lists stock under \"Encontre seu próximo carro\", explains the service in \"Mais do que só dirigir\" and gives \"FEITO PARA PERFORMAR\" a dark band with clickable hotspots on the car. Alternating light and black bands give it the pacing of a car magazine.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/20-carros/",
          "cover": "img/covers/ventara.webp",
          "id": "ventara",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Huge Anton over cool photos",
              "text": "The condensed headline fills half the width while photos lean grey and steel blue. It reads like the cover of a car magazine."
            },
            {
              "icon": "search",
              "title": "Stock in short cards",
              "text": "Each car shows its name, category and an available or test drive tag. A final card tells how many vehicles are in the collection."
            },
            {
              "icon": "gauge",
              "title": "Specs in the hero",
              "text": "0 to 100 time and horsepower sit in the first fold next to the 360° view. Car people get the numbers before the copy."
            },
            {
              "icon": "sparkles",
              "title": "Hotspots along the side",
              "text": "On the dark band, markers on the car open notes on wheels, brakes and suspension. It shows engineering without a spec sheet."
            }
          ],
          "lab": true,
          "accent": "#5B8BAA",
          "fonts": [
            "Anton",
            "Sora"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Éter GT hero",
                "sub": "Headline, photo and specs"
              },
              {
                "label": "Collection",
                "sub": "Available cars and test drives"
              },
              {
                "label": "How it works",
                "sub": "Curation and easy buying"
              },
              {
                "label": "Performance",
                "sub": "Clickable details on the car"
              },
              {
                "label": "Team",
                "sub": "Manifesto and contact"
              }
            ]
          },
          "signature": "The giant Anton headline set right against a white sports car, with a spec card and a 360° view button.",
          "goal": "Book a test drive",
          "niche": "auto",
          "mood": "light"
        },
        {
          "title": "Lumiar Odontologia · Family dental clinic website",
          "desc": "A website study for Lumiar, a fictional family dental clinic that offers a video chat before the first visit.",
          "longDesc": "Lumiar Odontologia is a fictional neighborhood clinic, made for this study, that sees parents, kids and grandparents on one schedule. It's for families who want everyone's check-up handled with no surprises. The site has to get people to book a visit or a video call.\n\nAfter the \"Odontologia para toda a família\" hero, the page introduces the lead dentist in \"Odontologia avançada para um sorriso mais saudável\", lists reasons in \"Por que escolher a Lumiar\" and ends with articles and a reminder sign-up. Turquoise is used sparingly, only where there's something to click.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/21-clinica-dental/",
          "cover": "img/covers/lumiar-odontologia.webp",
          "id": "lumiar-odontologia",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "users",
              "title": "A video chat before you go",
              "text": "The dentist card mimics a call with camera and mic buttons. It shows the first question can be answered from home, with photos over WhatsApp."
            },
            {
              "icon": "chart",
              "title": "A care plan in steps",
              "text": "A track with assessment, plan, treatment and maintenance runs below the hero. Patients know where they stand before booking."
            },
            {
              "icon": "sparkles",
              "title": "Rewards for check-ups",
              "text": "A turquoise card explains that each on-time check-up earns a star and priority booking. It's a concrete reason to come back."
            },
            {
              "icon": "palette",
              "title": "Turquoise only on what's clickable",
              "text": "The rest stays white and light grey, with two-tone headlines. Turquoise marks buttons and highlights, steering the eye to booking."
            }
          ],
          "lab": true,
          "accent": "#2BB0C9",
          "fonts": [
            "Inter"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Clinic hero",
                "sub": "Promise and booking button"
              },
              {
                "label": "Care steps",
                "sub": "Assessment to maintenance"
              },
              {
                "label": "Team",
                "sub": "Dentist and video consult"
              },
              {
                "label": "Why Lumiar",
                "sub": "Implants, rewards, reminders"
              },
              {
                "label": "Tips and contact",
                "sub": "Articles and reminder sign-up"
              }
            ]
          },
          "signature": "A four-step bar under the hero, from assessment to maintenance, that fills like a progress track.",
          "goal": "Book an appointment",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Morada · Home decor and furniture e-commerce",
          "desc": "An online store study for Morada, a fictional decor brand in natural tones for people furnishing their home piece by piece.",
          "longDesc": "Morada is a fictional decor store made for this study, selling armchairs, lamps, vases and throws in natural tones. It's for people setting up or refreshing a home who want pieces that go together. The main action is adding items to the cart.\n\nAfter \"Decoração atemporal para morar bem\", the store moves through \"Melhores escolhas para a sua casa\", \"Novidades\" and a full feature on the \"Poltrona Alba em linho oliva\", then \"Compre por categoria\" and \"Grandes ofertas\". Olive green on sand makes it feel like a showroom rather than a marketplace.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/22-decoracao/",
          "cover": "img/covers/morada.webp",
          "id": "morada",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Olive on sand",
              "text": "The beige background and olive buttons echo the colors of the products. The whole store looks like a styled room, not a shelf."
            },
            {
              "icon": "layers",
              "title": "Rooms before products",
              "text": "The opener sells collections like Living Room and Lighting in big photos. Priced product cards come after, already in context."
            },
            {
              "icon": "search",
              "title": "Categories and colors at hand",
              "text": "Each product shows color dots and a struck-through old price. The category grid jumps straight to chairs, vases or candles."
            },
            {
              "icon": "sparkles",
              "title": "Free room planning",
              "text": "Near the end, a banner offers to design your living room within a week. It helps shoppers who freeze when matching pieces."
            }
          ],
          "lab": true,
          "accent": "#5A6B2A",
          "fonts": [
            "Plus Jakarta Sans"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Collections",
                "sub": "Living room, decor, lighting"
              },
              {
                "label": "Top picks",
                "sub": "Kits and pieces that match"
              },
              {
                "label": "Featured piece",
                "sub": "Alba armchair with price"
              },
              {
                "label": "Categories, deals",
                "sub": "Shortcuts and discounts"
              },
              {
                "label": "Lookbook",
                "sub": "Rooms and newsletter"
              }
            ]
          },
          "signature": "The olive Alba armchair cut out in front of the word CASA in giant faded letters.",
          "goal": "Shop pieces",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Mordida Chocolates · Artisan chocolate e-commerce",
          "desc": "A store study for Mordida, a fictional chocolatier of handmade bars with bold flavors, for treating yourself or gifting.",
          "longDesc": "Mordida is a fictional chocolatier made for this study, selling handmade bars with single-origin cocoa and unusual fillings. Customers buy for themselves or put together gift boxes. The site needs to sell bars and, ideally, the six-flavor box.\n\nThe hero \"CHOCOLATE FEITO À MÃO PARA QUEM NÃO DIVIDE.\" sits on cocoa brown with yellow type, followed by \"CONHEÇA SEUS NOVOS FAVORITOS\", \"O QUE TEM DE BOM\" and reviews under \"NÃO ACREDITE SÓ NA NOSSA PALAVRA\". Condensed type and scrolling ribbons give it the energy of a local shop with attitude.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/23-chocolate/",
          "cover": "img/covers/mordida-chocolates.webp",
          "id": "mordida-chocolates",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Cocoa brown and butter yellow",
              "text": "The background looks like the bar itself and yellow flags price and action. The photographed wrappers use the same palette, so product and site match."
            },
            {
              "icon": "layers",
              "title": "Bars like a shop shelf",
              "text": "Each card shows the wrapper, the flavor in double brackets and the price. Best-seller and new tags make choosing quick."
            },
            {
              "icon": "sparkles",
              "title": "The six-box as the goal",
              "text": "The store ends with \"Monte a sua caixa de 6\" next to single bars. Free shipping over a set amount nudges people toward the box."
            },
            {
              "icon": "users",
              "title": "A review over a photo",
              "text": "A customer quote sits on a light card above a shot of broken chocolate. It adds social proof without leaving the brand mood."
            }
          ],
          "lab": true,
          "accent": "#F5C76A",
          "fonts": [
            "League Gothic",
            "Outfit"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Promise and featured bar"
              },
              {
                "label": "Favorites",
                "sub": "Bars with price and tags"
              },
              {
                "label": "Ingredients",
                "sub": "What goes into each bar"
              },
              {
                "label": "Reviews",
                "sub": "Customer quotes"
              },
              {
                "label": "Shop and box",
                "sub": "Single bars and box of 6"
              }
            ]
          },
          "signature": "Two crossed scrolling ribbons under the hero, like packaging tape printed with the collection names.",
          "goal": "Build a box",
          "niche": "comida",
          "mood": "light"
        },
        {
          "title": "Cardume · Project management SaaS landing page",
          "desc": "A landing study for Cardume, a fictional project management tool for teams ready to leave scattered spreadsheets behind.",
          "longDesc": "Cardume is a fictional project management product made for this study, aimed at small and mid-size teams still running work on spreadsheets and group chats. The site wants one thing: the team lead starting a free trial.\n\nAfter \"GESTÃO TUDO EM UM DE PROJETOS PARA TIMES MODERNOS\", the page shows the dashboard, makes its case in \"POR QUE TIMES ESCOLHEM A CARDUME\", lists features in \"Tudo o que o seu time precisa\" and lays out pricing in \"Comece pequeno, cresça sem trocar de ferramenta\". Lime green on black and white makes it obvious where to click.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/24-saas-times/",
          "cover": "img/covers/cardume.webp",
          "id": "cardume",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Rock, laptop and a note",
              "text": "The hero pairs a real rock, the product dashboard and a handwritten Caveat note. It dodges the usual floating mockup of software sites."
            },
            {
              "icon": "palette",
              "title": "Lime green as a signal",
              "text": "Black, white and a single lime green. The green shows up on buttons, the recommended plan and the last word of headlines."
            },
            {
              "icon": "layers",
              "title": "Plans side by side",
              "text": "Three plans with a monthly and yearly toggle, the middle one in black. Teams see right away they can start free and grow."
            },
            {
              "icon": "users",
              "title": "Social proof in numbers",
              "text": "Fictional company logos and a dark block with active teams and ratings help win over people who've never heard of the brand."
            }
          ],
          "lab": true,
          "accent": "#A6F06A",
          "fonts": [
            "Anton",
            "Caveat",
            "Inter"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Promise and product dashboard"
              },
              {
                "label": "Why Cardume",
                "sub": "Fewer meetings, more shipping"
              },
              {
                "label": "Features",
                "sub": "Boards, chat and automations"
              },
              {
                "label": "Pricing",
                "sub": "Essential, Team, Enterprise"
              },
              {
                "label": "Final call",
                "sub": "Email sign-up"
              }
            ]
          },
          "signature": "A laptop showing the dashboard balanced on a rock, in front of the word SAAS in giant black letters.",
          "goal": "Start free trial",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "Patalar · Pet store e-commerce with services",
          "desc": "A store study for Patalar, a fictional pet shop selling food and gear and booking grooming, vet and boarding for dogs and cats.",
          "longDesc": "Patalar is a fictional pet shop made for this study, combining an online store with a service center. It's for dog and cat owners who want to shop and care for their pet in one place. The main action is buying; the second is booking a service.\n\nThe hero \"Tudo o que seu pet precisa para uma vida mais feliz e saudável.\" opens with a dog and cat on an orange sofa, followed by the origin story in \"Começou com um cão sem raça\", the \"coleção premium\" by category and \"Banho, saúde e hospedagem no mesmo lugar\". Orange and the Fraunces serif keep it warm.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/25-pet/",
          "cover": "img/covers/patalar.webp",
          "id": "patalar",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Orange and a warm serif",
              "text": "The orange comes from the sofa in the main photo and returns on the house-brand packaging. Fraunces headlines make it feel like a home, not a shelf."
            },
            {
              "icon": "shield",
              "title": "Guarantees up front",
              "text": "A strip under the hero covers same-day delivery, receipts, Pix and support. It settles the worries of someone buying pet food in a hurry."
            },
            {
              "icon": "layers",
              "title": "Services with a book button",
              "text": "Grooming, vet, boarding and group walks each get a photo card and a booking link. The store doubles as the pet's calendar."
            },
            {
              "icon": "users",
              "title": "An origin story with video",
              "text": "The story section shows the founding couple with their dog and a play button. It says the brand started with a mutt, which builds connection."
            }
          ],
          "lab": true,
          "accent": "#F26A1B",
          "fonts": [
            "DM Sans",
            "Fraunces"
          ],
          "sections": 7,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Promise and buying guarantees"
              },
              {
                "label": "Our story",
                "sub": "Origin and video"
              },
              {
                "label": "Collection",
                "sub": "Food, treats, toys"
              },
              {
                "label": "Services",
                "sub": "Grooming, vet, boarding"
              },
              {
                "label": "First order",
                "sub": "Discount and refill reminder"
              }
            ]
          },
          "signature": "A golden retriever and a cat sharing an orange sofa, a ball on the floor, next to the serif headline.",
          "goal": "Shop for your pet",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Lapidária Joias · Fine jewelry website",
          "desc": "A website study for Lapidária, a fictional jeweler of handmade 18k gold pieces for people who buy jewelry to last decades.",
          "longDesc": "Lapidária Joias is a fictional jeweler made for this study, crafting rings, necklaces and earrings by hand in recycled 18k gold. Its customers buy rarely and carefully, often to mark an occasion. The site needs to get them exploring the collection, then joining the list.\n\nThe brand name fills the whole hero in Bodoni over a photo of rings. Then come \"uma seleção de JOIAS EXTRAORDINÁRIAS\", \"desenhadas COM INTENÇÃO\", \"nascidas do EXTRAORDINÁRIO\" and Instagram. Mixing lowercase italics with wide-tracked capitals makes each headline read like an engraving.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/26-joias/",
          "cover": "img/covers/lapidaria-joias.webp",
          "id": "lapidaria-joias",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Bodoni in two voices",
              "text": "Each headline pairs a lowercase italic line with a widely tracked uppercase one. With coffee brown and cream, it recalls old jeweler stationery."
            },
            {
              "icon": "layers",
              "title": "Photos at uneven heights",
              "text": "The selection opens with portraits and pieces in cards of varying height. The irregular rhythm feels editorial rather than catalog."
            },
            {
              "icon": "shield",
              "title": "Provenance in three facts",
              "text": "18k gold, traced stones and polishing sit in three short columns. That's what reassures someone about to spend more on a piece."
            },
            {
              "icon": "search",
              "title": "Collections by type",
              "text": "Necklaces, rings and earrings each get a card with a piece count. Shoppers who know what they want go straight there."
            }
          ],
          "lab": true,
          "accent": "#3A2A20",
          "fonts": [
            "Bodoni Moda"
          ],
          "sections": 5,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Brand name and featured piece"
              },
              {
                "label": "Selection",
                "sub": "Portraits and highlights"
              },
              {
                "label": "With intent",
                "sub": "Gold, stones and workshop"
              },
              {
                "label": "Collections",
                "sub": "Necklaces, rings, earrings"
              },
              {
                "label": "Instagram and list",
                "sub": "Behind the scenes, sign-up"
              }
            ]
          },
          "signature": "The word Lapidária in giant Bodoni over stacked rings, with an italic Joias. tucked above it.",
          "goal": "Explore the collection",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "Orla Odontologia · Dental clinic landing page",
          "desc": "A landing study for Orla, a fictional dental clinic that explains every treatment step before anything starts.",
          "longDesc": "Orla Odontologia is a fictional clinic made for this study, for patients who dread the dentist or have been hit with a surprise quote. The site wants them to book a full assessment.\n\nThe hero \"Seu sorriso bem cuidado começa aqui\" is all blue, with a duotone photo and a whitening card. Next come \"Tratamentos para cada fase do seu sorriso\", the walkthrough in \"Do primeiro contato ao retorno, sem surpresa no caminho\", reviews, an FAQ and a form. The navy duotone ties photos from different sources into one identity.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/27-sorriso/",
          "cover": "img/covers/orla-odontologia.webp",
          "id": "orla-odontologia",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Blue duotone photos",
              "text": "Hero, treatments and the care block all use blue-tinted photos. The clinic keeps one look even with images from different stock sources."
            },
            {
              "icon": "chart",
              "title": "Four numbered steps",
              "text": "First chat, assessment, written plan and treatment get big numerals. It's the direct answer to the fear of a hidden quote."
            },
            {
              "icon": "users",
              "title": "Mock calendar and call",
              "text": "One block shows a video call with the dentist next to a time-slot picker. Patients see how care works before booking."
            },
            {
              "icon": "search",
              "title": "FAQ and a short form",
              "text": "The FAQ covers insurance, kids and whitening, with a WhatsApp shortcut. The final form asks only for name, phone and preferred time."
            }
          ],
          "lab": true,
          "accent": "#3B6FA8",
          "fonts": [
            "Plus Jakarta Sans"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Blue hero",
                "sub": "Promise and treatment card"
              },
              {
                "label": "Treatments",
                "sub": "Prevention to implants"
              },
              {
                "label": "Step by step",
                "sub": "From first contact to follow-up"
              },
              {
                "label": "Reviews and FAQ",
                "sub": "Stories and common questions"
              },
              {
                "label": "Form",
                "sub": "Assessment request"
              }
            ]
          },
          "signature": "The whole hero in blue duotone, a smiling patient with treatment cards laid over the photo.",
          "goal": "Book an assessment",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Forja Fit Club · Gym landing page",
          "desc": "A landing study for Forja, a fictional gym with group classes and personal training for people who want to stay consistent.",
          "longDesc": "Forja Fit Club is a fictional gym made for this study, offering group classes, personal training and fitness assessments. It's for people who've quit gyms before and want a routine that sticks. The site's goal is booking a trial class.\n\nAfter \"Supere seus limites, treine com propósito\", the page covers services in \"Tudo o que você precisa para treinar com constância\", pricing in \"Fitness acessível para todo mundo\", the app in \"Acompanhe a sua evolução\" and class types in \"TREINO QUE SE ADAPTA A VOCÊ\". Every photo is tinted wine red, giving it weight and unity.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/28-academia/",
          "cover": "img/covers/forja-fit-club.webp",
          "id": "forja-fit-club",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Everything tinted wine",
              "text": "Barbells, kettlebells and members appear in wine monochrome. The dark, warm tone says effort without the usual gym neon."
            },
            {
              "icon": "layers",
              "title": "Drop-in or class pack",
              "text": "Two price cards show the cost of trying versus committing. No sign-up fee, which removes the main objection."
            },
            {
              "icon": "gauge",
              "title": "Progress in the app",
              "text": "A dark block shows load, calories and attendance logged in the app. It shows training is followed, not just unlocked."
            },
            {
              "icon": "search",
              "title": "A highlighted FAQ",
              "text": "The FAQ opens the selected question in wine with a big numeral beside it. Trial class, plans and pausing are answered before contact."
            }
          ],
          "lab": true,
          "accent": "#7A0E14",
          "fonts": [
            "Archivo"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Promise and special offer"
              },
              {
                "label": "Services",
                "sub": "Group, personal, assessment"
              },
              {
                "label": "Pricing",
                "sub": "Drop-in and class pack"
              },
              {
                "label": "App and classes",
                "sub": "Progress and workout types"
              },
              {
                "label": "Questions",
                "sub": "FAQ and schedule by email"
              }
            ]
          },
          "signature": "Workout photos fully tinted wine red, with a spinning circular special-offer badge in the hero.",
          "goal": "Book a free class",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "ANIL · Casual womenswear e-commerce",
          "desc": "A store study for ANIL, a fictional streetwear and casual womenswear brand with monthly drops in sizes XS to XL.",
          "longDesc": "ANIL is a fictional womenswear brand made for this study, with street and casual pieces released in small monthly drops, sizes XS to XL. It's for women who want to dress well every day without spending ages on an outfit. The main action is buying.\n\nThe hero \"Vista a sua própria história.\" shows a model in yellow against a blue gradient. Then come \"Coleções em alta\", \"Seu estilo, sem complicação!\", the brand story in \"Moda de rua com cara de céu aberto\" and reviews. Royal blue plays the sky in the name and marks every action.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/29-moda-street/",
          "cover": "img/covers/anil.webp",
          "id": "anil",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Royal blue as sky",
              "text": "The name means indigo, and blue shows up on buttons, ratings and the center card. Black-and-white collection shots make the blue pop harder."
            },
            {
              "icon": "layers",
              "title": "Three ways to shop",
              "text": "Matching basics, a three-piece outfit builder and free returns sit on cards. The blue middle one suggests the piece that completes the look."
            },
            {
              "icon": "shield",
              "title": "Shipping, returns, installments",
              "text": "Free shipping over a set amount, 30-day returns and installments share one strip. Those are the three blockers for buying clothes online."
            },
            {
              "icon": "users",
              "title": "Reviews about fit",
              "text": "Quotes talk about sizing and fabric, the real worry in online fashion. The closing sign-up offers early access to the next drop."
            }
          ],
          "lab": true,
          "accent": "#1A6BFF",
          "fonts": [
            "Plus Jakarta Sans"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Model, promise and lookbook"
              },
              {
                "label": "Collections",
                "sub": "Drops by city"
              },
              {
                "label": "How to shop",
                "sub": "Basics, outfits, returns"
              },
              {
                "label": "About the brand",
                "sub": "Story and guarantees"
              },
              {
                "label": "Reviews and list",
                "sub": "Quotes and next drop"
              }
            ]
          },
          "signature": "A blue gradient hero with a model in a yellow set, against black-and-white collection photos just below.",
          "goal": "Shop the collection",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Cadência · Road cycling club landing page",
          "desc": "A landing study for Cadência, a fictional road cycling club with guided rides and individual training plans.",
          "longDesc": "Cadência is a fictional road cycling club made for this study, with guided rides four times a week and individual training plans. It serves everyone from people just off a leisure bike to riders aiming at a gran fondo. The site wants them to book a first ride, which is free.\n\n\"DOMINE A ESTRADA\" runs edge to edge across the hero photo. Then come the schedule in \"Treine com método. Pedale mais forte\", accordion programs in \"Escolha seu pedal. Monte seu plano\" and the \"Seu primeiro pedal com a gente é por nossa conta\" form. The sky blue in the photo becomes the brand color.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/30-ciclismo/",
          "cover": "img/covers/cadencia.webp",
          "id": "cadencia",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Headline behind the riders",
              "text": "The Anton letters pass behind the athletes, who stay in front. It adds depth and puts people ahead of the brand."
            },
            {
              "icon": "layers",
              "title": "A schedule with spots",
              "text": "Ride cards show day, time, distance, zone and spots left, with a reserve button. Urgency comes from capacity, not a countdown."
            },
            {
              "icon": "gauge",
              "title": "Programs by level",
              "text": "Beginner, performance, gran fondo and indoor trainer sit in an accordion. Each lists weeks, rides per week and required level."
            },
            {
              "icon": "palette",
              "title": "Sky blue and clean white",
              "text": "The sky blue from the photo becomes the action color, with white and graphite elsewhere. The final form gets a yellow-to-blue gradient."
            }
          ],
          "lab": true,
          "accent": "#2D6BE4",
          "fonts": [
            "Anton",
            "Manrope"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Headline and programs"
              },
              {
                "label": "Method",
                "sub": "Coach, zones and numbers"
              },
              {
                "label": "Schedule",
                "sub": "Rides with open spots"
              },
              {
                "label": "Programs",
                "sub": "Beginner to gran fondo"
              },
              {
                "label": "First ride",
                "sub": "Free sign-up form"
              }
            ]
          },
          "signature": "The DOMINE A ESTRADA headline in huge white letters behind two riders against a blue, cloudy sky.",
          "goal": "Book a first ride",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Saibro Tênis Clube · Tennis club landing page",
          "desc": "A landing study for Saibro, a fictional tennis club with court booking, lessons and plans for players of every level.",
          "longDesc": "Saibro Tênis Clube is a fictional club made for this study, with courts, lessons and a community of players from beginner to advanced. It's for people who want to play often without relying on a friend to set it up. The main action is booking a court; the second is joining a plan.\n\nThe \"TÊNIS CLUBE\" hero already offers two shortcuts: \"RESERVA DE QUADRA\" and \"AULAS DE TÊNIS\". Then come \"MAIS QUE UM JOGO UMA COMUNIDADE FORTE\", pricing in \"Três planos pensados para elevar o seu jogo\" and the booking platform. Ball green on dark green ties it all to the court.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/31-tenis/",
          "cover": "img/covers/saibro-tenis-clube.webp",
          "id": "saibro-tenis-clube",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Ball green on forest green",
              "text": "The yellow-green of the ball is the action color and block backgrounds are forest green. Condensed Barlow headlines recall a court scoreboard."
            },
            {
              "icon": "layers",
              "title": "Two shortcuts in the hero",
              "text": "Court booking and lessons appear as photo cards in the first fold. People who know what they want don't need to scroll."
            },
            {
              "icon": "chart",
              "title": "Levels as progress bars",
              "text": "One card shows how many coaches serve beginner, intermediate and advanced players. Players see there's room for their level."
            },
            {
              "icon": "users",
              "title": "Plans and coach matching",
              "text": "Plans are listed with Pro highlighted in dark green. A nearby block shows the platform for picking the right coach."
            }
          ],
          "lab": true,
          "accent": "#C6F432",
          "fonts": [
            "Barlow Condensed",
            "Outfit"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Booking and lesson shortcuts"
              },
              {
                "label": "The club",
                "sub": "Courts, coaches, numbers"
              },
              {
                "label": "Services",
                "sub": "Programs and court rental"
              },
              {
                "label": "Plans",
                "sub": "Basic, Pro and Elite"
              },
              {
                "label": "Platform and help",
                "sub": "Coach match and contact"
              }
            ]
          },
          "signature": "Ball-green tennis balls scattered through the blocks, including a close-up racket cutting across the newsletter card.",
          "goal": "Book a court",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Solário · AI smart home dashboard",
          "desc": "An interface study for Solário, a fictional smart home dashboard with an AI assistant, climate, energy and devices on one screen.",
          "longDesc": "Solário is a concept smart home dashboard under a fictional brand, made for this study. Its imagined user, Helena, wants to see and adjust the whole house without opening five apps. Here the main action isn't a purchase: it's running the home from one place.\n\nThe screen opens with \"Boa tarde, Helena\" and an isometric model of the house with clickable points. Below sit \"Clima e conforto\", \"Dispositivos inteligentes\" and \"Consumo de energia\"; on the right, the \"Sala principal\" with a thermostat and an assistant that suggests actions. Light green only marks what's on or saving.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/32-dashboard-casa/",
          "cover": "img/covers/solario.webp",
          "id": "solario",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "The house as a map",
              "text": "Instead of a room list, the house is a model with tags on each point. Tapping the living room or the door jumps straight to its control."
            },
            {
              "icon": "gauge",
              "title": "An arc thermostat",
              "text": "Climate control is a large arc with green hatching and plus and minus buttons. Target and current temperature sit side by side."
            },
            {
              "icon": "chart",
              "title": "Energy with peaks marked",
              "text": "The black usage block hatches the day's peaks and compares to yesterday. You see in seconds when the house uses most."
            },
            {
              "icon": "palette",
              "title": "Stone grey and light green",
              "text": "A stone grey background keeps the panel calm, and light green only appears on active switches and eco mode. Color means state, not decoration."
            }
          ],
          "lab": true,
          "accent": "#B8E09A",
          "fonts": [
            "Outfit"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Greeting",
                "sub": "Search and eco mode"
              },
              {
                "label": "House map",
                "sub": "Clickable points per room"
              },
              {
                "label": "Climate, devices",
                "sub": "Forecast and controls"
              },
              {
                "label": "Energy",
                "sub": "Daily usage and peaks"
              },
              {
                "label": "Room and assistant",
                "sub": "Thermostat and suggestions"
              }
            ]
          },
          "signature": "An isometric model of the house with solar panels and floating tags for a locked door and the living room temperature.",
          "goal": "Control the home",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "broto. · Cold-pressed green juice landing page",
          "desc": "A landing study for broto., a fictional cold-pressed juice brand delivered the same day, for people who want an easy habit.",
          "longDesc": "broto. is a fictional cold-pressed green juice brand made for this study, with bottles pressed in the morning and delivered the same day. It's for people who want a healthy habit without fuss. The site needs to get them ordering single bottles or the weekly kit.\n\nAfter \"UMA ESCOLHA MAIS VERDE PARA O SEU DIA A DIA\", the page shows ingredients in \"MANTENHA VERDE. MANTENHA SIMPLES\", a three-step process in \"SIMPLES POR NATUREZA\", flavors in \"ESCOLHA O SEU VERDE\" and a zip code lookup. Pistachio green in rounded blocks feels like a bottle label.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/33-suco-detox/",
          "cover": "img/covers/broto.webp",
          "id": "broto",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Pistachio green in blocks",
              "text": "Each section is a rounded block alternating cream and pistachio. Heavy Archivo headlines read like a product label."
            },
            {
              "icon": "layers",
              "title": "A three-step process",
              "text": "Pick, cold-press and deliver chilled sit on numbered, staggered cards. It justifies the price without mentioning it."
            },
            {
              "icon": "sparkles",
              "title": "The weekly kit up front",
              "text": "Next to single flavors, a dark green card sums up the six-bottle kit and total. That's the option the brand wants to sell."
            },
            {
              "icon": "search",
              "title": "Zip code before ordering",
              "text": "The page ends by asking for a zip code to show delivery times. It answers whether the brand reaches your street."
            }
          ],
          "lab": true,
          "accent": "#B9C98A",
          "fonts": [
            "Archivo"
          ],
          "sections": 5,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Promise and bottle of the day"
              },
              {
                "label": "Ingredients",
                "sub": "Avocado, cucumber, apple"
              },
              {
                "label": "How we make it",
                "sub": "Pick, press and deliver"
              },
              {
                "label": "Flavors and kit",
                "sub": "Single bottles and weekly"
              },
              {
                "label": "Delivery",
                "sub": "Times by zip code"
              }
            ]
          },
          "signature": "Avocado, cucumber and green apple shot on pistachio backgrounds, each named in heavy black letters.",
          "goal": "Order juice",
          "niche": "comida",
          "mood": "light"
        },
        {
          "title": "Fominha · Burger joint landing page",
          "desc": "A landing study for Fominha, a fictional smash burger joint with a house blend, offering delivery and pickup.",
          "longDesc": "Fominha is a fictional burger joint made for this study, with beef ground in-house, brioche baked daily and local delivery. It's for people who are hungry right now and choose by what they see. The site has one goal: get them to order.\n\nThe hero \"BURGERS FEITOS PRA DAR VONTADE\" shows the house double on checkered paper with a hand-written price. Then come the ingredients in \"O QUE VAI EM CADA MORDIDA\", the menu in \"OS MAIS PEDIDOS DA CHAPA\" and delivery in \"PEDIU, CHEGOU QUENTE.\". Wine red and mustard yellow give it a classic diner feel.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/34-hamburgueria/",
          "cover": "img/covers/fominha.webp",
          "id": "fominha",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Wine, mustard and checks",
              "text": "Wine red, mustard yellow and checkered paper come straight from the diner. The Caveat note looks chalked on the counter board."
            },
            {
              "icon": "layers",
              "title": "A tabbed menu",
              "text": "Burgers, combos, sides and shakes sit in tabs. Each item has a cut-out photo, short description, price and add button."
            },
            {
              "icon": "sparkles",
              "title": "Ingredients as tags",
              "text": "Next to an open burger, six numbered tags list blend, cheddar, onion and brioche. It's proof nothing comes frozen."
            },
            {
              "icon": "search",
              "title": "Delivery time by zip code",
              "text": "The last section asks for a zip code and shows time to your door, hours and pickup. It answers the question that decides the order."
            }
          ],
          "lab": true,
          "accent": "#8B1A1A",
          "fonts": [
            "Anton",
            "Archivo",
            "Caveat"
          ],
          "sections": 3,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "House burger and price"
              },
              {
                "label": "Promise",
                "sub": "Fresh, never frozen"
              },
              {
                "label": "Ingredients",
                "sub": "Daily bread and build"
              },
              {
                "label": "Menu",
                "sub": "Best sellers by category"
              },
              {
                "label": "Delivery",
                "sub": "Time by zip and pickup"
              }
            ]
          },
          "signature": "A crispy burger on red checkered paper, with the house double's price hand-written and an arrow pointing at it.",
          "goal": "Order now",
          "niche": "comida",
          "mood": "light"
        },
        {
          "title": "Alcova · Smart home app interface",
          "desc": "An interface study for Alcova, a fictional app bringing cameras, lights, robot vacuum and speakers into frosted glass panels.",
          "longDesc": "Alcova is a concept smart home app under a fictional brand, made for this study and shown across three panels. Its imagined user wants to see what's happening in each room and adjust light, sound and cleaning without switching screens. The main action is controlling the rooms.\n\nThe first panel opens on the live \"Sala de estar\" camera and the \"Cômodos\" list. Below sit cards for the \"Quarto\" robot vacuum, the \"Sala de estar\" pendant lamp and the \"Caixas de som\" player. Everything floats in frosted glass over a blurred shot of the home itself.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/35-paineis-casa/",
          "cover": "img/covers/alcova.webp",
          "id": "alcova",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Frosted glass over the home",
              "text": "Cards are translucent over a blurred image of the room. The app feels like a layer on top of the house, not a separate screen."
            },
            {
              "icon": "gauge",
              "title": "Climate pills on the camera",
              "text": "Temperature, humidity, power use and air quality sit as pills over the live feed. One glance shows image and conditions together."
            },
            {
              "icon": "sparkles",
              "title": "Each device its own scene",
              "text": "The robot vacuum shows battery and area, the pendant has a brightness control and the speakers have cover art and a player. Each card speaks for its object."
            },
            {
              "icon": "palette",
              "title": "White, black and sea green",
              "text": "The palette is nearly neutral, with one black card for rhythm. Pale sea green is kept for small signals like devices online."
            }
          ],
          "lab": true,
          "accent": "#A9C5C1",
          "fonts": [
            "Urbanist"
          ],
          "sections": 3,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Panel switch",
                "sub": "Three screens, online status"
              },
              {
                "label": "Live camera",
                "sub": "Living room, climate, power"
              },
              {
                "label": "Rooms",
                "sub": "List and add room"
              },
              {
                "label": "Devices",
                "sub": "Vacuum and lamp"
              },
              {
                "label": "Sound",
                "sub": "Speaker player"
              }
            ]
          },
          "signature": "Frosted glass panels over a blurred photo of the house, with a live living room camera and climate stats in pills.",
          "goal": "Control every room",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "Penumbra · Home automation landing page",
          "desc": "A landing study for Penumbra, a fictional home automation company with no-renovation installs, for people who want light, climate and locks in one app.",
          "longDesc": "Penumbra is a fictional home automation company made for this study, installing lighting, climate, cameras and locks without tearing up walls. It's for house and apartment owners who want comfort but dread renovation and visible wiring. The site has to lead to a site visit.\n\n\"SUA CASA INTELIGENTE, DO SEU JEITO.\" opens over a dimly lit living room. Then come controls in \"TUDO CONECTADO, NADA À VISTA\", scenes in \"UM TOQUE, A CASA INTEIRA\", questions in \"ANTES DA VISITA, O QUE TODO MUNDO PERGUNTA\" and the form. Dark backgrounds with amber mimic a lamp left on.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/36-lumora-casa/",
          "cover": "img/covers/penumbra.webp",
          "id": "penumbra",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Dark with amber light",
              "text": "The whole site is black and graphite, and amber shows up wherever a light is on. The brand name, meaning half-light, becomes the art direction."
            },
            {
              "icon": "layers",
              "title": "Real controls as showcase",
              "text": "Lighting, climate, cameras, energy and security appear as app widgets. Visitors see the product working before reading about it."
            },
            {
              "icon": "sparkles",
              "title": "One-tap scenes",
              "text": "Over a night shot of a house, a panel switches between arrive, cinema and sleep scenes. It shows the payoff better than a feature list."
            },
            {
              "icon": "shield",
              "title": "No renovation, no surprises",
              "text": "A free site visit and one-day install appear as numbered steps. The FAQ covers walls, internet outages and voice assistants."
            }
          ],
          "lab": true,
          "accent": "#F2B045",
          "fonts": [
            "Archivo"
          ],
          "sections": 7,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Promise and live camera"
              },
              {
                "label": "Devices",
                "sub": "Lock, speaker and numbers"
              },
              {
                "label": "All connected",
                "sub": "Light, climate, security"
              },
              {
                "label": "Scenes, process",
                "sub": "One tap and three steps"
              },
              {
                "label": "Questions, visit",
                "sub": "FAQ and form"
              }
            ]
          },
          "signature": "An amber lighting card with a pendant lit at 65%, the only bright block in a panel of dark controls.",
          "goal": "Book a site visit",
          "niche": "tech",
          "mood": "dark"
        },
        {
          "title": "Ondina · Music web app with player, queue and playlists",
          "desc": "A design study for a fictional music app built for late listening: trending artists, a night queue and mood playlists on one screen.",
          "longDesc": "Ondina is a fictional streaming brand made as an interface study. It imagines an app for people who listen at the end of the day, greeting them with a ready-made \"lamp-light night\". The screen has one job: get someone to press play without hunting for anything.\n\nEverything lives on a single view. Trending artists run across the top, the night queue sits next to popular playlists, and the player stays pinned at the bottom. The key visual call was warm amber over near-black brown with frosted glass, so it feels like a dim lamp rather than a control panel.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/37-player-musica/",
          "cover": "img/covers/ondina.webp",
          "id": "ondina",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Lamp amber instead of neon",
              "text": "Amber on dark brown steers clear of the cold streaming look. The color matches the promise of music for late evenings."
            },
            {
              "icon": "layers",
              "title": "Queue and playlists side by side",
              "text": "The night queue, with durations and likes, sits next to mood playlists. Visitors see what plays next and where they could go after."
            },
            {
              "icon": "users",
              "title": "Artist cards with context tags",
              "text": "Each artist card carries a tag like Trending, New single or Live. The tag says why it is worth a listen right now, before any click."
            },
            {
              "icon": "sparkles",
              "title": "Playlists named after moments",
              "text": "Lamp-light night, Lo-fi for rain, Easy workout: lists are grouped by situation, not genre. Each gets its own icon and color."
            }
          ],
          "lab": true,
          "accent": "#F2B640",
          "fonts": [
            "Urbanist"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Search and nav",
                "sub": "Discover, playlists, artists, genres"
              },
              {
                "label": "Trending artists",
                "sub": "Carousel with tags and instant play"
              },
              {
                "label": "Up next",
                "sub": "The night queue, track by track"
              },
              {
                "label": "Popular playlists",
                "sub": "Lists by mood and moment"
              },
              {
                "label": "Pinned player",
                "sub": "Controls always within reach"
              }
            ]
          },
          "signature": "The floating player with its amber play button, over a blurred backdrop that reads like a room with the lights down.",
          "goal": "Press play",
          "niche": "criativo",
          "mood": "dark"
        },
        {
          "title": "Ressoa · Online headphone store",
          "desc": "An e-commerce study for a fictional headphone shop: clear categories, upfront guarantees and an electric-blue hero.",
          "longDesc": "Ressoa is a fictional headphone retailer built as an online retail study. It speaks to people replacing their headphones who are unsure where to start: over-ear, on-ear, noise cancelling or gaming. The site has to move them into a category and from there to the cart.\n\nThe hero puts the word IMERSÃO huge behind the model, followed by a strip covering shipping, warranty, payment and support. Then come shop by category, the \"Som de outro nível\" feature and a row of partner brands. The electric blue up top plays against the navy footer.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/38-fones/",
          "cover": "img/covers/ressoa.webp",
          "id": "ressoa",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Electric blue, condensed type",
              "text": "The hero runs vivid blue edge to edge with huge Anton behind the photo. The store reads like a brand, not a generic catalog."
            },
            {
              "icon": "shield",
              "title": "Objections handled up front",
              "text": "Free shipping, a one-year warranty, Pix and installments, and WhatsApp support sit right under the hero. Online-shopping doubts are gone before the scroll."
            },
            {
              "icon": "search",
              "title": "Browse by headphone type",
              "text": "Categories show the product photo and each line's discount. People who don't know the jargon can pick by the shape they see."
            },
            {
              "icon": "users",
              "title": "A newsletter with a short promise",
              "text": "The footer asks for an email for launches and coupons, once a week. Stating the frequency eases the fear of spam."
            }
          ],
          "lab": true,
          "accent": "#1F5BD8",
          "fonts": [
            "Anton",
            "Plus Jakarta Sans"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Immersion",
                "sub": "Hero with a shop-now button"
              },
              {
                "label": "Guarantees",
                "sub": "Shipping, warranty, payment, help"
              },
              {
                "label": "Categories",
                "sub": "Over-ear, on-ear, ANC, gaming"
              },
              {
                "label": "Next-level sound",
                "sub": "Featured product and collection"
              },
              {
                "label": "Brands and footer",
                "sub": "Partners, coupons and links"
              }
            ]
          },
          "signature": "IMERSÃO set in giant white condensed letters, cut through by the model in headphones stepping in front of the type.",
          "goal": "Buy headphones",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Candeia · Landing page for a design lighting studio",
          "desc": "A study for a fictional studio making paper and wood lamps, aimed at people who want warm light at home and need help choosing.",
          "longDesc": "Candeia is a fictional studio making lamps from fiber paper and solid wood, built as a brand study. It targets people furnishing a home who want a beautiful piece but are unsure which size or height suits the room. The final action is sending a photo of the space and getting a recommendation.\n\nThe page moves through \"A seleção\", a catalog of four lamps filterable by table, floor and pendant, and ends on the send-us-a-photo form. The dark hero shows the Empilhada 03 glowing orange, while the rest of the site breathes in cream.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/39-luminarias/",
          "cover": "img/covers/candeia.webp",
          "id": "candeia",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "The orange of a lit bulb",
              "text": "The orange accent is the color of the light the pieces give off. It glows in the dark hero, then shows up only in buttons and details on cream."
            },
            {
              "icon": "search",
              "title": "Catalog filtered by use",
              "text": "The four lamps filter by table, floor or pendant, with prices and finish swatches. Comparing is easy without opening product pages."
            },
            {
              "icon": "users",
              "title": "Advice from a room photo",
              "text": "The closing form asks for a name, WhatsApp and room type. The promise is the right piece and height, with no obligation to buy."
            },
            {
              "icon": "layers",
              "title": "The workshop through materials",
              "text": "A section lists mulberry paper, freijó and eucalyptus wood and warm LED next to a real room with the lamp installed. Material becomes the price argument."
            }
          ],
          "lab": true,
          "accent": "#E2761F",
          "fonts": [
            "Urbanist"
          ],
          "sections": 4,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Lit hero",
                "sub": "Empilhada 03 with material tags"
              },
              {
                "label": "The selection",
                "sub": "Three pieces in real rooms"
              },
              {
                "label": "Catalog",
                "sub": "Four shapes, filter by use"
              },
              {
                "label": "The workshop",
                "sub": "Materials and years at the bench"
              },
              {
                "label": "Room photo",
                "sub": "Recommendation via WhatsApp"
              }
            ]
          },
          "signature": "The Empilhada 03 lamp lit up in the dark hero, with tags pointing out materials and thumbnails to switch pieces.",
          "goal": "Get a recommendation",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Mirante Residências · Landing page for a luxury real estate agency",
          "desc": "A study for a fictional agency selling beach, mountain and city homes, aimed at families who prefer curation over listing portals.",
          "longDesc": "Mirante is a fictional high-end real estate agency, created as a design study. Its audience is families looking for a beach, mountain or city home who don't want to dig through listing sites. The site's job is to get them talking to a consultant, and from there to a private viewing.\n\nAfter the \"Onde a vida mora\" hero comes a three-step method, a showcase filterable by beach, mountain and city, a pre-visit FAQ and the closing form. Italic Instrument Serif set against navy gives it the feel of an architecture magazine.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/40-imovel-luxo/",
          "cover": "img/covers/mirante-residencias.webp",
          "id": "mirante-residencias",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Magazine italic and navy",
              "text": "Instrument Serif italics alternate with Inter Tight capitals in the headlines. Navy appears in the footer and buttons, quiet like a signature."
            },
            {
              "icon": "search",
              "title": "Homes filtered by landscape",
              "text": "Houses are split into beach, mountain and city, with town, bedrooms and size on each card. Buyers start from a lifestyle, not a price."
            },
            {
              "icon": "shield",
              "title": "Questions answered before the visit",
              "text": "The FAQ covers how private viewings work, unlisted homes and who handles the paperwork. These are the worries of buyers wary of exposing their family."
            },
            {
              "icon": "users",
              "title": "A form that starts with the wish",
              "text": "The last block asks what the person is looking for, plus name and WhatsApp. The consultant gets context and the conversation starts in the right place."
            }
          ],
          "lab": true,
          "accent": "#0C2340",
          "fonts": [
            "Instrument Serif",
            "Inter Tight"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Where life lives",
                "sub": "Hero with a home and a browse button"
              },
              {
                "label": "The method",
                "sub": "Curation, private viewing, deed"
              },
              {
                "label": "The showcase",
                "sub": "Homes by beach, mountain, city"
              },
              {
                "label": "Before the visit",
                "sub": "Testimonial and FAQ"
              },
              {
                "label": "Conversation",
                "sub": "Form to reach a consultant"
              }
            ]
          },
          "signature": "The headline \"Onde A VIDA MORA\" laid over the white house photo, mixing a thin italic with heavy capitals.",
          "goal": "Book a private viewing",
          "niche": "imovel",
          "mood": "light"
        },
        {
          "title": "Bruma · Landing page for a numbered design lamp",
          "desc": "A study for a fictional blown-glass, brass and marble lamp sold in a numbered edition to people who buy design as an object.",
          "longDesc": "Bruma is a fictional object lamp, made as a product-launch study. It ships in a numbered edition, with a blown-glass shade, brushed brass stem and green marble base. It's for people who buy design to keep on display, and the site has to get them to reserve their unit.\n\nThe page runs through an opening statement about light as a feeling, the size family, a hand-made anatomy section and the three materials, before the reservation form for Bruma 01. Everything is olive green, like the glass shade itself.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/41-luminaria-objeto/",
          "cover": "img/covers/bruma.webp",
          "id": "bruma",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "A site the color of the glass",
              "text": "The shade's olive green becomes the whole palette, from hero to footer. Pale gray Archivo headlines fade in and out like the lamp's glow."
            },
            {
              "icon": "layers",
              "title": "Anatomy in four parts",
              "text": "A diagram numbers the shade, rim, stem and touch dimmer, each with a short note. The price now has concrete parts behind it."
            },
            {
              "icon": "gauge",
              "title": "Size family with prices",
              "text": "Table, mini and floor versions sit side by side with sizes and prices, plus a light-mode control. Buyers pick a size without leaving the page."
            },
            {
              "icon": "shield",
              "title": "Reservation with an order summary",
              "text": "The final form asks for name, email and shade color and shows lead time and total. The numbered edition explains why it's a reservation, not a checkout."
            }
          ],
          "lab": true,
          "accent": "#5E6B3A",
          "fonts": [
            "Archivo"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "The lamp, its size and price"
              },
              {
                "label": "A feeling",
                "sub": "The lamp lit at night"
              },
              {
                "label": "The family",
                "sub": "Table, mini and floor sizes"
              },
              {
                "label": "Made by hand",
                "sub": "Anatomy and three materials"
              },
              {
                "label": "Reservation",
                "sub": "Form with order summary"
              }
            ]
          },
          "signature": "The green shade overlapping the name BRUMA in giant black letters, with dimensions and price set around it.",
          "goal": "Reserve the lamp",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "argila · Mineral skincare landing page with red clay",
          "desc": "A study for a fictional skincare brand using red clay and volcanic minerals, for people who want a short, fragrance-free routine.",
          "longDesc": "Argila is a fictional mineral skincare brand, built as an identity and product page study. Its hero product is a restorative cream with red clay and basalt powder. The audience is people tired of ten-step routines who want a few products that make sense. The site has to sell the first jar.\n\nAfter the hero come the three-product line, the do-more-with-less idea, the ingredients section and a morning-and-night routine in three steps. Brick red clay paired with Bodoni Moda gives it the air of an old apothecary brand.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/42-skincare/",
          "cover": "img/covers/argila.webp",
          "id": "argila",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Brick red and apothecary serif",
              "text": "Clay red fills the hero and whole blocks, while Bodoni Moda gives it heritage weight. Uppercase Jost handles the technical details."
            },
            {
              "icon": "search",
              "title": "Ingredients shown as swatches",
              "text": "Clay, basalt, squalane and niacinamide appear as texture dots, each with one line on what it does. The label becomes something people understand."
            },
            {
              "icon": "layers",
              "title": "Routine with morning and night tabs",
              "text": "Three numbered steps, each timed, change with the selected tab. Customers know exactly where the cream fits in their day."
            },
            {
              "icon": "users",
              "title": "A coupon for the first jar",
              "text": "The close offers free shipping on the first order in exchange for an email, with the routine as a bonus PDF. It's a small step for the undecided."
            }
          ],
          "lab": true,
          "accent": "#7A1E12",
          "fonts": [
            "Bodoni Moda",
            "Jost"
          ],
          "sections": 7,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "The cream and customer rating"
              },
              {
                "label": "Skin at rest",
                "sub": "The three products in the line"
              },
              {
                "label": "Do more with less",
                "sub": "The brand idea in numbers"
              },
              {
                "label": "What's in the jar",
                "sub": "Ingredients and three-step routine"
              },
              {
                "label": "First jar",
                "sub": "Reviews and shipping coupon"
              }
            ]
          },
          "signature": "The word argila in huge Bodoni, with the red jar balanced on a stack of black stones in the middle of the letters.",
          "goal": "Buy the cream",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "QUASAR · Collectible digital art gallery",
          "desc": "A study for a fictional gallery selling numbered digital art editions to people who want to collect without crypto wallets or jargon.",
          "longDesc": "Quasar is a fictional collectible digital art gallery, made as a brand study. Works come from independent creators in numbered, certified editions. It's for people who like collecting but avoid crypto wallets and technical talk. The site wants two things: sell pieces from the current drop and get visitors on the list for the next one.\n\nThe page moves from an intro piece to the grid of Drop 01, explains buying in four steps, introduces the creators and closes on the sign-up. Pure red with pixel-style Silkscreen type gives it the feel of a collector's video game.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/43-colecionaveis/",
          "cover": "img/covers/quasar.webp",
          "id": "quasar",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Pure red and pixel lettering",
              "text": "Pixel Silkscreen headlines and a red with no half-tones define the gallery. The white background lets the 3D pieces shine like toys."
            },
            {
              "icon": "search",
              "title": "A drop filtered by technique",
              "text": "The twelve-piece grid filters by inflated 3D, pixel and generative, with creator, edition and price on each card. It compares like a shop window."
            },
            {
              "icon": "shield",
              "title": "Buying explained in four steps",
              "text": "Create an account, pick a piece, pay by Pix or card, receive the work. The payment step is highlighted in red to show there's no crypto."
            },
            {
              "icon": "users",
              "title": "Creators with their own profiles",
              "text": "Each artist gets a card with specialty, piece count and a follow button. The gallery sells authorship, not just images."
            }
          ],
          "lab": true,
          "accent": "#E10600",
          "fonts": [
            "Archivo",
            "Silkscreen"
          ],
          "sections": 5,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero",
                "sub": "Astronaut and a drop button"
              },
              {
                "label": "A world of your own",
                "sub": "Featured piece and numbers"
              },
              {
                "label": "Drop 01",
                "sub": "Twelve pieces with filters"
              },
              {
                "label": "How to buy",
                "sub": "Four steps to your screen"
              },
              {
                "label": "Next drop",
                "sub": "Creators and waitlist"
              }
            ]
          },
          "signature": "The glossy red 3D astronaut over the name QUASAR in black pixel letters, with art cards flying beside it.",
          "goal": "Join the drop list",
          "niche": "criativo",
          "mood": "light"
        },
        {
          "title": "Sereno · Landing page for an indie eau de parfum",
          "desc": "A study for a fictional perfume house and its Flor Noturna scent, aimed at people who choose fragrance by the story of its notes.",
          "longDesc": "Sereno is a fictional independent perfume house, made as a launch study. The lead product is Flor Noturna, an eau de parfum with red rose, poppy and amber. It's for people who choose perfume by story and notes, not by the mall display. The site has to lead to buying a bottle or the sample kit.\n\nThe page covers the brand's story, the notes in three timed stages, three versions to choose from and a four-gesture application ritual. Blood red with Bodoni and Italiana gives the whole thing the mood of a gala night.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/44-perfume/",
          "cover": "img/covers/sereno-perfume.webp",
          "id": "sereno-perfume",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Rose red and gala lettering",
              "text": "Tall, thin Italiana shares headlines with Bodoni Moda over deep red and cream. The contrast recalls classic perfume packaging."
            },
            {
              "icon": "layers",
              "title": "The scent pyramid in three cards",
              "text": "Top, heart and base notes become three cards with a photo, timing and ingredients. Non-experts see how the scent shifts through the night."
            },
            {
              "icon": "gauge",
              "title": "Three versions to compare",
              "text": "Vinho Lento, Flor Noturna and Orvalho Rosé show notes, rating, size and price. The add-to-bag button lives on each card."
            },
            {
              "icon": "users",
              "title": "A sample kit as the way in",
              "text": "The close offers all three scents in 2 ml vials, with the cost credited toward a full bottle. It lowers the risk of buying perfume unsmelled."
            }
          ],
          "lab": true,
          "accent": "#B30000",
          "fonts": [
            "Bodoni Moda",
            "Italiana",
            "Manrope"
          ],
          "sections": 5,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Flor Noturna",
                "sub": "Bottle, reviews and price"
              },
              {
                "label": "The blooming",
                "sub": "Story and concentration"
              },
              {
                "label": "Three stages",
                "sub": "Top, heart and base notes"
              },
              {
                "label": "Choose your night",
                "sub": "Three scents to buy"
              },
              {
                "label": "Ritual and kit",
                "sub": "How to apply, and samples"
              }
            ]
          },
          "signature": "The red bottle floating on clouds, with FLOR NOTURNA in tall, thin letters spanning the top of the page.",
          "goal": "Buy the fragrance",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "Filigrana · Landing page for a handmade gold jeweler",
          "desc": "A study for a fictional jeweler making gold pieces by hand, focused on brides and made-to-order wedding jewelry.",
          "longDesc": "Filigrana is a fictional jeweler working in handmade 18k gold, created as a brand study. It focuses on brides and families looking for wedding pieces, from earrings to commissioned necklaces. The site has to get them to book a private fitting at the workshop.\n\nThe page moves through the collections, a piece of the season with full specs and price, the workshop process and a pre-fitting FAQ. Italic Cormorant Garamond, gold and a cream background give it the tone of a wedding invitation.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/45-joalheria/",
          "cover": "img/covers/filigrana.webp",
          "id": "filigrana",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Invitation italics and gold-orange",
              "text": "Every headline pairs a Cormorant italic with a spaced uppercase word. Gold-orange appears only in buttons, like a detail on a piece of jewelry."
            },
            {
              "icon": "search",
              "title": "Season piece with full specs",
              "text": "The featured necklace lists metal, stones, weight, lead time and price, with thumbnails to switch photos. It's a product page inside the landing."
            },
            {
              "icon": "layers",
              "title": "A three-step bench process",
              "text": "Joint design, casting and filigree, then setting and polish are explained beside a photo of the goldsmith's hands. The weeks of waiting gain a reason."
            },
            {
              "icon": "users",
              "title": "Fittings booked by event date",
              "text": "The final form asks for name, WhatsApp and the wedding date. Staff know the deadline before they even reply."
            }
          ],
          "lab": true,
          "accent": "#B4561C",
          "fonts": [
            "Archivo",
            "Cormorant Garamond"
          ],
          "sections": 6,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Timeless adoration",
                "sub": "Bride, collection and featured pieces"
              },
              {
                "label": "Collections",
                "sub": "Necklaces, earrings, bracelets, rings"
              },
              {
                "label": "Season piece",
                "sub": "Specs and reservation"
              },
              {
                "label": "The workshop",
                "sub": "Three handmade stages"
              },
              {
                "label": "Private fitting",
                "sub": "FAQ and booking"
              }
            ]
          },
          "signature": "The bride in a red sari between the words ADORAÇÃO ATEMPORAL, with a golden lace border cutting across the bottom of the hero.",
          "goal": "Book a private fitting",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "Matiz · Interactive gradient palette page",
          "desc": "A study for a fictional color studio showing six gradient palettes with hex codes, in-app previews and its own generator.",
          "longDesc": "Matiz is a fictional color studio, made as a study in pages that work as tools. It's for designers and developers tired of bland gradients. The site's thesis is that a good gradient is a single hue running from near-black to near-white. Visitors are meant to copy a palette, build their own and follow the studio.\n\nAfter the \"Chega de gradientes sem sal\" hero, the page explains the rule and opens the six palettes, such as Acid Lime, Tangerine, Lagoon and Cherry Cola. Each gets a mood photo, a hex scale and an app screen painted in it.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/46-paletas/",
          "cover": "img/covers/matiz.webp",
          "id": "matiz",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Six palettes, one hue each",
              "text": "Each palette runs from almost black to almost white without mixing colors. The rule is visible right in the hex scale."
            },
            {
              "icon": "layers",
              "title": "Palettes on a real screen",
              "text": "Right after each scale comes an app panel painted in that color, with buttons and charts. Designers see the gradient at work, not just looking pretty."
            },
            {
              "icon": "sparkles",
              "title": "A generator at the end",
              "text": "A block lets visitors build a palette from one hue and see it applied instantly. The page becomes a tool, not just a showcase."
            },
            {
              "icon": "users",
              "title": "Photos that set the mood",
              "text": "Every palette comes with a photo in the same tone, from sunset to lagoon. It helps people pick color by feeling, not by code."
            }
          ],
          "lab": true,
          "accent": "#E3261B",
          "fonts": [
            "Archivo",
            "Inter Tight",
            "JetBrains Mono",
            "Permanent Marker"
          ],
          "sections": 10,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "No more bland",
                "sub": "Hero with the studio's thesis"
              },
              {
                "label": "The rule",
                "sub": "One hue from dark to light"
              },
              {
                "label": "Six palettes",
                "sub": "Hex, photo and applied screen"
              },
              {
                "label": "Generator",
                "sub": "Build your own from one hue"
              },
              {
                "label": "Follow the studio",
                "sub": "Sign up for new palettes"
              }
            ]
          },
          "signature": "The headline CHEGA DE GRADIENTES in heavy capitals, with \"sem sal\" scribbled over it by hand in Permanent Marker.",
          "goal": "Grab a palette",
          "niche": "criativo",
          "mood": "dark"
        },
        {
          "title": "Calmaria · Online store for natural skincare",
          "desc": "An e-commerce study for a fictional natural skincare brand, for people starting a simple routine who want to understand the label.",
          "longDesc": "Calmaria is a fictional natural skincare brand, built as an online store study. It's for people who want to start caring for their skin without getting lost in actives and steps. The site has to get them to build a routine and add it to the cart.\n\nThe path goes through where-to-start categories, best sellers, a five-minute ritual kit, ingredients and a three-step routine, ending in the FAQ. Moss green with condensed Anton and a cat in the hero pull the brand away from skincare clichés.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/47-skincare-glow/",
          "cover": "img/covers/calmaria.webp",
          "id": "calmaria",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Moss green with a sense of humor",
              "text": "Condensed Anton in moss green and a cat in a cucumber mask break the niche's seriousness. The brand feels close without losing care."
            },
            {
              "icon": "search",
              "title": "Start from the need",
              "text": "Categories come as photo cards: moisturizers, serums, body and kits. Beginners pick where to start, not which active."
            },
            {
              "icon": "layers",
              "title": "A routine in three steps",
              "text": "Cleanse, treat and moisturize, with morning and night tabs and a build-my-routine button. The sequence turns into a cart in one click."
            },
            {
              "icon": "shield",
              "title": "Labels and doubts, straight",
              "text": "Ingredients like cucumber, aloe and niacinamide get their own cards, and the FAQ covers sensitive skin, pregnancy and returns. Online-buyer objections are answered."
            }
          ],
          "lab": true,
          "accent": "#2E4A33",
          "fonts": [
            "Anton",
            "Plus Jakarta Sans"
          ],
          "sections": 9,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "New skincare",
                "sub": "Hero, guarantees and badges"
              },
              {
                "label": "Where to start",
                "sub": "Categories and best sellers"
              },
              {
                "label": "Five minutes",
                "sub": "The ritual kit featured"
              },
              {
                "label": "Ingredients, routine",
                "sub": "What's inside and how to use it"
              },
              {
                "label": "Reviews and FAQ",
                "sub": "Questions and a 10% coupon"
              }
            ]
          },
          "signature": "An orange Persian cat with cucumber slices over its eyes, cut out between the words NOVO SKINCARE in moss green.",
          "goal": "Build a routine",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Altamar · Landing page for a luxury electric GT",
          "desc": "A study for a fictional luxury electric GT brand, aimed at buyers who want quiet power for long coastal drives.",
          "longDesc": "Altamar is a fictional electric GT carmaker, built as a launch study. It's for people buying a luxury car for the road who want power without noise. The site needs to get them to book a ninety-minute test drive.\n\nThe page presents three models, the performance figures, the long-trip cabin and a test-drive booking pitched as better than any catalog. It closes with a section showing the brand's design system. Sand tones and a handwritten signature give it the feel of a coastal sunset.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/48-carro-luxo/",
          "cover": "img/covers/altamar.webp",
          "id": "altamar",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Sand, serif and a signature",
              "text": "The sand accent and Mrs Saint Delafield script give the car a touring feel rather than a racing one. The final section opens up the brand palette and type."
            },
            {
              "icon": "gauge",
              "title": "Figures on a dark panel",
              "text": "Power, acceleration, range and charging get a dark block with a performance ruler. It's the one loud moment on an otherwise calm page."
            },
            {
              "icon": "search",
              "title": "Three models to compare",
              "text": "Maré GT, Falésia and Restinga appear with a type filter and three figures each. Buyers grasp the lineup without a spec sheet."
            },
            {
              "icon": "users",
              "title": "A test drive with a chosen route",
              "text": "The form asks for model, contact, city and date, while the side panel shows the car on a coastal route. The visit becomes a planned drive."
            }
          ],
          "lab": true,
          "accent": "#A8967F",
          "fonts": [
            "Mrs Saint Delafield"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "The motion",
                "sub": "Hero with the GT and test drive"
              },
              {
                "label": "Three ways",
                "sub": "Models side by side"
              },
              {
                "label": "Power and cabin",
                "sub": "Figures and interior"
              },
              {
                "label": "Ninety minutes",
                "sub": "Test-drive booking"
              },
              {
                "label": "Design aspects",
                "sub": "Palette, type and final call"
              }
            ]
          },
          "signature": "The blue GT parked on a coast road at dusk, with a line handwritten in Mrs Saint Delafield beside the headline.",
          "goal": "Book a test drive",
          "niche": "auto",
          "mood": "light"
        },
        {
          "title": "Lâmina Diagnósticos · Clinical laboratory website",
          "desc": "A study for a fictional clinical lab, for patients who want to book tests, understand prep and track their results.",
          "longDesc": "Lâmina Diagnósticos is a fictional clinical lab, made as an institutional website study. It's for patients holding a doctor's order who want to know price, prep and turnaround before leaving home. The main action is booking a sample collection, at the lab or at home.\n\nThe page shows the most requested tests with price and prep, goes inside the lab, shares a patient story and lists services. Then come result tracking, four steps, an FAQ and the booking form. Navy with cyan and Barlow Condensed feel technical without hospital coldness.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/49-laboratorio/",
          "cover": "img/covers/lamina-diagnosticos.webp",
          "id": "lamina-diagnosticos",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Technical blue in capitals",
              "text": "Uppercase Barlow Condensed with the last word in cyan gives the headlines the tone of a lab report. Navy blocks carry the seriousness."
            },
            {
              "icon": "search",
              "title": "Tests with price and prep",
              "text": "The most requested tests show price, fasting and turnaround, filtered by blood and hormones. Patients decide before calling."
            },
            {
              "icon": "chart",
              "title": "Results tracked step by step",
              "text": "A panel shows the sample collected, in analysis and released, with app alerts. It eases the anxiety of waiting for results."
            },
            {
              "icon": "users",
              "title": "Home collection in the form",
              "text": "Booking asks for name, WhatsApp and the tests ordered, and offers home collection. It serves the elderly and children with no queue."
            }
          ],
          "lab": true,
          "accent": "#1EA7E1",
          "fonts": [
            "Barlow Condensed",
            "Barlow"
          ],
          "sections": 10,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Rigor and trust",
                "sub": "Hero with booking and prep"
              },
              {
                "label": "Most requested",
                "sub": "Tests with price and fasting"
              },
              {
                "label": "Inside the lab",
                "sub": "Behind the scenes and a story"
              },
              {
                "label": "Services, results",
                "sub": "Home visits and tracking"
              },
              {
                "label": "Book collection",
                "sub": "Four steps, FAQ and form"
              }
            ]
          },
          "signature": "A blue-gloved hand holding a red-capped sample tube next to the headline in white condensed capitals.",
          "goal": "Book a sample collection",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Ávora · Premium car rental website",
          "desc": "A study for a fictional premium car rental brand, for road-trippers who want the right model for each route.",
          "longDesc": "Ávora is a fictional premium car rental company, made as a brand and booking-flow study. It's for people taking road trips who want a car that matches the drive, with no counter or paperwork. The site has to get them to complete a reservation.\n\nAfter a hero with search, it moves through choosing the car before the route, four steps from booking to the road, routes worth every kilometer and a booking that fits on one screen. Gold-beige on cream with dark cards makes it feel like a hotel, not a parking lot.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/50-aluguel-carros/",
          "cover": "img/covers/avora.webp",
          "id": "avora",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Quiet hotel gold",
              "text": "Gold-beige on cream, with black blocks only at key moments. The rental feels like hospitality, not a fleet."
            },
            {
              "icon": "search",
              "title": "A fleet filtered by style",
              "text": "Cars filter by sedan, SUV, sports, electric and convertible, with daily rate and transmission on each card. Choosing starts from the kind of trip."
            },
            {
              "icon": "globe",
              "title": "Routes suggested with the car",
              "text": "Coast, mountains and countryside appear as destinations with distances. The site sells the trip before the daily rate."
            },
            {
              "icon": "layers",
              "title": "Booking summed up in one card",
              "text": "One screen shows the car, dates, extras like insurance and child seat, and the total. No surprises at pickup."
            }
          ],
          "lab": true,
          "accent": "#A8875A",
          "fonts": [],
          "sections": 9,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero with search",
                "sub": "Location, dates and guarantees"
              },
              {
                "label": "Pick the car",
                "sub": "Fleet filtered by style"
              },
              {
                "label": "Four steps",
                "sub": "From booking to the road"
              },
              {
                "label": "Routes and booking",
                "sub": "Destinations and summary"
              },
              {
                "label": "Close",
                "sub": "Reviews, FAQ and quote"
              }
            ]
          },
          "signature": "The four booking steps drawn as dark stair-steps rising from left to right.",
          "goal": "Reserve a car",
          "niche": "auto",
          "mood": "light"
        },
        {
          "title": "Orvalho · Landing page for a vitamin C face cleanser",
          "desc": "A study for a fictional citrus skincare brand and its cleansing gel, for people who want a quick, fresh routine.",
          "longDesc": "Orvalho is a fictional skincare brand built on Sicilian lemon, made as a single-product landing study. The star is a vitamin C facial cleansing gel. It's for people who want to wash their face properly in a minute, no fuss. The site has to sell the gel and ideally the full routine.\n\nThe page covers four actives and what each does, a sixty-second morning-and-night routine, a 21-day user test and the full line made from the same lemon. Leaf green and lemon yellow make the freshness visible before any copy.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/51-skincare-vidro/",
          "cover": "img/covers/orvalho.webp",
          "id": "orvalho",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Leaf green and lemon yellow",
              "text": "The palette comes straight from the ingredient: green leaf, yellow peel, light background. The formula's freshness becomes color before it becomes a claim."
            },
            {
              "icon": "chart",
              "title": "A user test in charts",
              "text": "The site shows its participant test as bars, a weekly chart and a usage diary. The figures are presented as an example from the fictional brand."
            },
            {
              "icon": "gauge",
              "title": "A timed routine",
              "text": "Wet, massage for 60 seconds, rinse, with morning and night tabs and a timer on the photo. The promised minute becomes concrete."
            },
            {
              "icon": "layers",
              "title": "A full line to grow the order",
              "text": "Gel, serum, gel-cream and toner appear with prices and add buttons. People who came for the gel leave with the routine."
            }
          ],
          "lab": true,
          "accent": "#2E7D32",
          "fonts": [
            "Plus Jakarta Sans"
          ],
          "sections": 10,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Citrus fresh",
                "sub": "Hero with buy button and reviews"
              },
              {
                "label": "Four actives",
                "sub": "What each ingredient does"
              },
              {
                "label": "Sixty seconds",
                "sub": "How to use, morning and night"
              },
              {
                "label": "21-day test",
                "sub": "Results and the full line"
              },
              {
                "label": "Reviews and FAQ",
                "sub": "Questions and a 10% coupon"
              }
            ]
          },
          "signature": "The yellow gel tube among lemons and leaves, with water drops over a blurred green background.",
          "goal": "Buy the cleanser",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Partida · App-based car rental platform",
          "desc": "A study for a fictional rental platform offering daily, weekly or subscription cars, for people who want to skip the counter.",
          "longDesc": "Partida is a fictional car rental platform, made as a digital product study. It rents by day, week or subscription, with the contract on your phone and pickup by code. It's for people who hate rental queues and surprise fees. The site has to take them from search to choosing a car.\n\nThe hero already holds the search with location and dates. Then come the no-counter pitch, the fleet, seasonal destinations and plans priced by how long you drive. Black, white and black-and-white photos give it the sober, direct feel of an app.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/52-drive-locadora/",
          "cover": "img/covers/partida.webp",
          "id": "partida",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "App-style black and white",
              "text": "With no accent color, the site uses only black, white and desaturated destination photos. The car and the price become the only focal points."
            },
            {
              "icon": "search",
              "title": "Search above the fold",
              "text": "Pickup location, dates and category sit in a bar right under the hero. Visitors know what to do from the start."
            },
            {
              "icon": "gauge",
              "title": "Three plans by usage time",
              "text": "Daily, weekly and subscription sit side by side with what each includes. The middle plan gets a black card as the most popular."
            },
            {
              "icon": "shield",
              "title": "Pickup by code on your phone",
              "text": "Four steps show choosing, sending your license, pickup code and return, with the app screen alongside. The no-counter promise is visible."
            }
          ],
          "lab": true,
          "accent": "#0E0E0E",
          "fonts": [],
          "sections": 9,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Hero with search",
                "sub": "Location, dates and category"
              },
              {
                "label": "No counter",
                "sub": "The pitch in numbers and photos"
              },
              {
                "label": "Pick your car",
                "sub": "Fleet with filters and rates"
              },
              {
                "label": "Places and steps",
                "sub": "Season trips and code pickup"
              },
              {
                "label": "Plans and FAQ",
                "sub": "Day, week, subscription"
              }
            ]
          },
          "signature": "The black jeep at sunset in the hero, with the location, dates and category search bar docked right below it.",
          "goal": "Find my car",
          "niche": "auto",
          "mood": "light"
        },
        {
          "title": "PRENSA Smash Burger · Smash burger joint site with menu and ordering",
          "desc": "A study for a fictional street smash burger joint, with a filterable menu and ordering for pickup or delivery.",
          "longDesc": "Prensa is a fictional smash burger joint, made as a street-food brand study. It's for people who want an honest burger with crispy edges and melting cheese close to home. The site has to get them to order, whether for pickup, delivery or a table.\n\nAfter the house manifesto, the menu appears, then the three-step method and a photo wall of the line out the door. It all leads to the order form. Griddle red with condensed Big Shoulders gives it the volume of a street sign.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/55-burger-smash/",
          "cover": "img/covers/prensa-smash-burger.webp",
          "id": "prensa-smash-burger",
          "category": "site",
          "featured": false,
          "status": "live",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Griddle red, street-sign type",
              "text": "Uppercase condensed Big Shoulders and bright red recall a diner sign. Diagonal tapes of house slang cut between sections."
            },
            {
              "icon": "search",
              "title": "A menu filtered by hunger",
              "text": "Tabs split smash, chicken, veggie and sides, with price and an add button on every burger. Choosing takes seconds."
            },
            {
              "icon": "layers",
              "title": "Ordering with a ticket alongside",
              "text": "The form switches between pickup, delivery and table, while a paper ticket shows items and total. Finish on the site or send it on WhatsApp."
            },
            {
              "icon": "globe",
              "title": "Map and griddle hours",
              "text": "An illustrated map marks the address and a table lists opening days and times. People heading over don't need to ask."
            }
          ],
          "lab": true,
          "accent": "#E3171A",
          "fonts": [
            "Big Shoulders Display",
            "Bricolage Grotesque"
          ],
          "sections": 8,
          "role": "design, copy and front-end",
          "flow": {
            "steps": [
              {
                "label": "Street smash",
                "sub": "Hero with order and menu"
              },
              {
                "label": "Manifesto",
                "sub": "Blend, griddle and prep time"
              },
              {
                "label": "Pick your damage",
                "sub": "Tabbed menu with prices"
              },
              {
                "label": "Method and line",
                "sub": "Three steps and house photos"
              },
              {
                "label": "Order and come",
                "sub": "Order form, map and hours"
              }
            ]
          },
          "signature": "The word SMASH in giant white letters on red, with the burger in front and a diagonal tape of house slang cutting across.",
          "goal": "Place an order",
          "niche": "comida",
          "mood": "light"
        }
        /* LAB:END */
      ]
    },
    contact: {
      kicker: "Let's talk",
      lineA: "Let's build something real,",
      lineB: "with real impact.",
      sub: "Whether it's a product, a website or just an idea, I'm one click away.",
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
        sub: "Pick a channel below or send a message. I reply fast.",
        or: "or write to me",
        send: "Send message",
        whatsMeta: "+55 31 99562-4617",
        fillAll: "Please fill all fields.",
        opening: "Opening your email client…"
      }
    },
    blog: {
      bento: { topics: "Topics", allTopics: "See all topics", more: "Read more", read: "min read", featured: "Featured", cats: { Carreira: "Career", Eventos: "Events", Projetos: "Projects", "Formação": "Education" } },
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
        bio: "19 years old · Full Stack Developer · AI Designer. I write about what I learn along the way: engineering, AI, design and the behind-the-scenes of the projects I build.",
        contact: "Contact"
      },
      featured: {
        latest: "Latest",
        spotlight: "Spotlight",
        empty: "The first post is coming soon.",
        badge: "Featured"
      },
      footer: { rights: "All rights reserved", madeBy: "Made by" }
    },
    post: {
      back: "Back to blog",
      share: { label: "Share this post" },
      linkedin: "View original post on LinkedIn",
      related: { kicker: "Keep reading", title: "Related posts" },
      author: {
        kicker: "About the author",
        bio: "19 years old · Full Stack Developer · AI Designer. I write about what I learn along the way: engineering, AI, design and the behind-the-scenes of the projects I build.",
        contact: "Contact"
      },
      footer: { back: "Back to blog", portfolio: "Portfolio" }
    }
  },

  /* ==================== PT ===================== */

  pt: {
    htmlLang: "pt-BR",
    nav: { home: "Início", about: "Sobre", services: "Serviços", work: "Trabalhos", experience: "Experiência", skills: "Habilidades", projects: "Projetos", blog: "Blog", blogSoon: "em breve", contact: "Contato", resume: "Currículo" },
    a11y: {
      skip: "Pular para o conteúdo",
      menuOpen: "Abrir menu",
      academic: "Acadêmica",
      termControls: "Controles do terminal",
      courses: "Cursos & Especializações",
      featured: "Projetos em destaque",
      nextProject: "Próximo projeto",
      closeRed: "Fechar (vermelho)",
      close: "Fechar",
      filter: "Filtrar projetos por categoria",
      langSwitch: "Trocar idioma",
      langMenu: "Idioma",
      maximize: "Maximizar (verde)",
      minimize: "Minimizar (amarelo)",
      professional: "Profissional",
      scrollNext: "Ir para a próxima seção",
      intro: "apresentação",
      contact: "contato",
      xp: "experiência",
      xpList: "experiências",
      xpIcons: "ícones de experiência",
      social: "links sociais",
      projects: "projetos",
      services: "serviços",
      about: "sobre mim",
      photoA: "Bernardo Iannini, desenvolvedor Full Stack e AI Designer, em foto de perfil",
      photoB: "Bernardo Iannini, foto alternativa de perfil",
      techs: "Tecnologias",
      viewSite: "Ver site",
      closeCert: "Fechar certificado"
    },
    tabAway: "volta aqui :(",
    modes: { prof: "Profissional", acad: "Acadêmica", courses: "Cursos & Certificações" },
    hero: { hello: "Olá, eu sou" },
    taglines: [
      "Desenvolvedor Full Stack.",
      "Corrijo erros do Vibe Coding.",
      "Crio plataformas e MVPs.",
      "Automações & IA.",
      "Corrijo e publico projetos."
    ],
    about: {
      kicker: "Sobre mim",
      title: "Sobre mim",
      titleA: "Eu construo software",
      titleB: "que vai pra produção.",
      sub: "Sites, sistemas e automações com IA, do primeiro rascunho ao deploy.",
      statusLabel: "Status",
      statusValue: "Aberto a novos projetos",
      blogLabel: "Blog",
      blogTag: "No ar",
      blogTitle: "Compartilhando o que aprendo no caminho.",
      blogDesc: "Estudos de caso, decisões técnicas e bastidores dos projetos.",
      blogCta: "Ler o blog",
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
            `Sou Bernardo Araújo Iannini, tenho 19 anos e trabalho como desenvolvedor Full Stack. Construo sistemas completos, da arquitetura até o deploy em produção, e curso Desenvolvimento Web e Mobile no COTEMIG. Essa formação caminha lado a lado com o que eu já entrego no mundo real.

Entrei na tecnologia em 2025, mas trago uma base criativa mais antiga. Venho da edição de vídeo, do motion design e dos efeitos visuais, e esse olhar ainda molda a forma como penso interface e produto. Pra mim, função e estética se resolvem na mesma decisão.

Trabalho com produtos SaaS, fintechs, plataformas web, automações e soluções sob medida. Também pego projetos que nasceram de IA (Vibe Coding): parto do protótipo cru, conserto a arquitetura por baixo e transformo tudo num sistema escalável, pronto de verdade pra produção.

O que me move é resolver problemas reais com tecnologia, e busco sempre o caminho mais simples, escalável e bem estruturado. Não é sobre acumular ferramentas. É sobre entregar algo que funciona, aguenta o uso real e resolve de verdade.`
        },
        { type: "type", text: "contact --show" },
        { type: "out", text: "LinkedIn: linkedin.com/in/bernardo-iannini\nGitHub: github.com/iannini25\nEmail: bernardo.iannini14@gmail.com" }
      ],
      /* celular: so o essencial, sem o contact --show */
      terminalMobile: [
        { type: "type", text: "cat about.txt" },
        { type: "out", text: `Sou Bernardo Iannini, 19 anos, desenvolvedor Full Stack. Construo sistemas completos, da arquitetura à produção, e curso Desenvolvimento Web e Mobile no COTEMIG.

Venho da edição de vídeo e do motion design, e isso ainda molda como penso interface e produto.

Trabalho com SaaS, fintechs, automações e projetos nascidos de IA que precisam virar sistema de verdade.` }
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
            title: "Suporte Digital & Desenvolvimento Web",
            org: "Inspire4U",
            role: "Estágio",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "MAI" },
            end: { year: 2025, month: "DEZ" },
            bullets: [
              "Desenvolvimento e manutenção de sites em WordPress, com foco em performance e usabilidade.",
              "Ajustes em HTML e CSS e pequenas customizações em JavaScript para refinar design e experiência.",
              "Aplicação de SEO on-page para melhorar a visibilidade e o posicionamento dos sites.",
              "Suporte digital e manutenção contínua dos projetos web, apoiando as fintechs parceiras."
            ],
            skills: ["WordPress", "HTML", "CSS", "JavaScript", "SEO", "Manutenção"]
          },
          {
            title: "Desenvolvedor Web no Athena7",
            org: "Inspire4U",
            role: "Meio período",
            loc: "Belo Horizonte, MG · Híbrido",
            start: { year: 2026, month: "JAN" },
            end: { year: 2026, month: "JUN" },
            bullets: [
              "Entrei no Athena7 com o produto já em andamento e assumi o desenvolvimento full-stack, dando continuidade à evolução da plataforma.",
              "Implementei novas funcionalidades e reestruturei várias partes do sistema, que ganhou mais consistência e escala.",
              "Levei a plataforma até produção, participando do deploy e da operação em ambiente real.",
              "Conduzi a migração de infraestrutura entre AWS e VPS privada, ajustando ambiente e serviços de produção.",
              "Projetei e implementei a arquitetura multi-tenant (várias organizações) com controle de acesso por papéis.",
              "Integrei um assistente de IA que orienta o usuário e tira dúvidas, minimizando a exposição de dados sensíveis.",
              "Trabalhei nos fluxos centrais de denúncia deste SaaS privacy-first, com forte foco na segurança das mulheres."
            ],
            skills: ["TypeScript", "React", "Node.js", "MySQL", "Integração IA", "Deploy", "AWS", "VPS"]
          },
          {
            title: "Engenheiro de Software",
            org: "TribeX Tecnologia Financeira S/A",
            role: "Freelance",
            loc: "Remoto · Brasil",
            start: { year: 2026, month: "FEV" },
            end: { current: true },
            bullets: [
              "Liderei o desenvolvimento do Moeda Nobre, plataforma em que empresas distribuem benefícios aos colaboradores, que gastam em comércios credenciados pelo celular enquanto o comércio recebe via Pix.",
              "Plataforma web para operação, empresas e comércios, incluindo site institucional e páginas dedicadas por cidade.",
              "Dois apps publicados (iOS e Android): um para o colaborador ver saldo, pagar e consultar o extrato; outro para o comércio gerar cobranças e acompanhar recebíveis.",
              "Controles financeiros de segurança: aprovação em várias etapas, histórico completo de auditoria e separação entre quem autoriza um pagamento e quem paga o comércio.",
              "Integração com sistemas de PDV, para o comércio cobrar pela maquininha enquanto o colaborador paga pelo app."
            ],
            skills: ["Infraestrutura de Software", "Desenvolvimento iOS", "Android", "Next.js", "PostgreSQL", "Pix"]
          },
          {
            title: "Desenvolvedor Full Stack",
            org: "Freelancer",
            role: "Autônomo",
            loc: "Remoto · Brasil/Irlanda",
            start: { year: 2026, month: "JUN" },
            end: { current: true },
            bullets: [
              "Desenvolvimento full-stack de ponta a ponta: plataformas SaaS, landing pages, automações e sistemas sob medida, do design ao deploy em produção.",
              "Pego projetos que foram criados por IA (Vibe Coding), refaço a arquitetura, refatoro o código e deixo tudo pronto pra produção, além de integrações, manutenção e otimização de performance.",
              "Innovation Business Alliance (IBA): desenvolvimento completo da plataforma internacional de networking que conecta Brasil e Irlanda."
            ],
            skills: ["Full Stack", "Next.js", "React", "Node.js", "SaaS", "Deploy", "Automação", "Vibe Coding"]
          }
        ],
        acad: [
          {
            title: "Desenvolvimento Web e Mobile · 1º ano",
            org: "COTEMIG",
            role: "Aluno",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "FEV" },
            end: { year: 2025, month: "DEZ" },
            bullets: [
              "Base sólida de desenvolvimento web com HTML, CSS e JavaScript, apoiada em lógica de programação.",
              "Fundamentos de back-end e dados com C# e MySQL.",
              "Primeiro contato com Linux e redes, começando a entender o ambiente onde as aplicações rodam de verdade."
            ],
            skills: ["HTML", "CSS", "JavaScript", "C#", "MySQL", "Linux", "Redes"]
          },
          {
            title: "Desenvolvimento Web e Mobile · 2º ano",
            org: "COTEMIG",
            role: "Aluno",
            loc: "Belo Horizonte, MG",
            start: { year: 2026, month: "FEV" },
            end: { current: true },
            bullets: [
              "Desenvolvimento mobile multiplataforma com Flutter e Dart, além de nativo com Kotlin (Android) e Swift (iOS).",
              "Python para automações, scripts e lógica de back-end.",
              "Arquitetura e Projeto de Software, Modelagem de Sistemas e boas práticas para projetos escaláveis.",
              "Conclusão prevista para dezembro de 2026."
            ],
            skills: ["Python", "Flutter", "Dart", "Kotlin", "Swift", "Arquitetura de Software"]
          }
        ],
        courses: [
          {
            title: "Artificial Intelligence: Develop Products and Services Using AI",
            org: "MIT Professional Education",
            role: "Aluno",
            start: { year: 2025, month: "JUL" },
            end: { year: 2025, month: "DEZ" },
            cert: { id: "cert-mit", img: "Certificado-MIT.webp", label: "Certificado" },
            bullets: [
              "Estratégia de IA, métricas de performance e design de produtos.",
              "Fundamentos de machine learning e avaliação de modelos.",
              "Técnicas de deep learning (MLPs, CNNs, RNNs, transformers).",
              "Pipelines de dados, limitações da IA e implantação responsável.",
              "Interação Humano-Computador e interfaces impulsionadas por IA.",
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
      sub: "Clique numa pasta para abrir.",
      tilesLabels: {
        os: "Sistemas & Cloud",
        programming: "Programação",
        web: "Web e Mobile",
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
      case: {
        back: "Todos os projetos",
        viewCase: "Ver estudo de caso",
        visitSite: "Visitar site",
        repoBtn: "Código",
        notFound: "Projeto não encontrado.",
        nextProject: "Próximo projeto",
        /* títulos dos atos editoriais (aceitam <em> serif — 1 palavra) */
        aboutTitle: "Sobre o <em>projeto</em>",
        problemTitle: "O <em>problema</em>",
        builtTitle: "Como foi <em>construído</em>",
        impactTitle: "O que isso <em>mudou</em>",
        impactPath: "impacto",
        /* ficha técnica ($ cat specs.txt — a cerca didática) */
        specsCmd: "cat specs.txt",
        specsComment: "# para quem é técnico",
        noteLabel: "nota do engenheiro",
        deepLabel: "como resolvi",
        /* assinatura (porta de contato) */
        signLine: "Projetado, construído e colocado <em>no ar</em> por Bernardo Iannini",
        signCta: "Entrar em contato"
      },
      /* labels do catálogo (seção #projects) — espelho do bloco EN */
      catalog: {
        kicker: "Projetos",
        title: "Tudo que <em>construí</em> até hoje",
        sub: "De SaaS em produção a esta própria página. Cada um entregue.",
        filterPrefix: "$ filter:",
        cats: { all: "Todos", system: "Sistemas", site: "Sites", automation: "Automações", personal: "Pessoais" },
        count: "→ {n} projetos",
        countOne: "→ 1 projeto",
        countFiltered: "→ {n} de {total}",
        empty: "Nada arquivado nessa categoria ainda. Projetos novos a caminho.",
        emptyCta: "→ Ver todos"
      },
      list: [
        {
          title: "Athena7 · Canal de Denúncias",
          desc: "Plataforma SaaS multi-tenant de Canal de Denúncias com relato 100% anônimo e chat bidirecional, feita para adequação à Lei 14.457/2022 e à NR-1.",
          longDesc: `O Athena7 é uma plataforma SaaS multi-tenant de Canal de Denúncias e Integridade Corporativa que permite às empresas receberem e investigarem relatos de assédio, discriminação e irregularidades de forma totalmente anônima. O denunciante registra o caso sem nome, e-mail ou IP, recebe um código único de acompanhamento e conversa por um chat bidirecional, sem nunca revelar quem é.

O sistema opera com dois canais independentes, Integridade da Mulher e Integridade Corporativa, e vem com um painel completo: Kanban de casos, fluxo de investigação com classificação legal sugerida por IA e conclusão formal, relatórios agendados em PDF, alertas configuráveis e controle de SLA, permissões granulares, treinamentos com certificado verificável, gamificação e assistentes de IA. Tudo isso apoiado em criptografia por tenant em repouso e conformidade com a LGPD.`
          ,
          stack: ["TypeScript", "Node.js", "Express", "tRPC v11", "Drizzle ORM", "MySQL 8", "React 19", "Vite", "TailwindCSS", "Socket.io", "OpenPGP", "Google Gemini", "Resend", "PDFKit", "Docker", "Nginx"],
          link: "https://athena7.com.br",
          repo: "",
          cover: "img/covers/athena7.webp?v=4a7b8172",
          id: "athena7",
          category: "system",
          featured: true,
          featuredOrder: 1,
          status: "em produção",
          year: "2026",
          role: "evolução e deploy",
          /* preview animado do card (mp4/webm 1600x900 em loop, ate 3MB);
             vazio = usa a cover. Ver PROJETOS-EM-CONSTRUCAO.md. */
          /* gravacao de tela: scroll pelo site ao vivo (autoplay/loop) */
          story: {
            problem: {
              text: `Assédio e irregularidades quase nunca viram denúncia. Quem sofre tem medo de retaliação, não confia que o relato seja mesmo anônimo e muitas vezes não tem um canal seguro pra começar, então o problema morre no silêncio. Do outro lado, a empresa fica exposta: desde 2022, a Lei 14.457 obriga organizações a manter um canal de denúncias e uma comissão de prevenção ao assédio.

O difícil é resolver as duas pontas ao mesmo tempo. A pessoa precisa de um lugar onde de fato não seja identificada, sem nome, e-mail ou IP, e ainda consiga acompanhar o caso. A empresa precisa de uma ferramenta que organize a investigação, respeite prazos e gere prova documental com validade legal.`,
              note: "Lei 14.457/2022 + LGPD · relato sem IP · código único de acompanhamento"
            }
          },
          flow: {
            steps: [
              { label: "Escolhe o canal", sub: "Mulher ou Integridade" },
              { label: "Relata", sub: "passo a passo + anexos" },
              { label: "Recebe o código", sub: "chave anônima" },
              { label: "IA analisa", sub: "enquadramento + gravidade" },
              { label: "Acompanha", sub: "chat anônimo + PDF" }
            ]
          },
          impact: {
            text: "A pessoa faz o relato em minutos, sem se identificar, e sai com um código pra conversar com o Compliance de forma anônima e nos dois sentidos. A empresa recebe cada denúncia já organizada num Kanban, com sugestão de enquadramento legal pela IA, controle de SLA e uma trilha de auditoria assinada. O que antes era um formulário perdido, ou nada, vira um processo com começo, meio e prova.",
            note: "Kanban + SLA + PDF assinado (SHA-256), verificável publicamente"
          },
          metrics: [
            { value: "2", label: "canais independentes", detail: "Mulher · Integridade" },
            { value: "6", label: "assistentes de IA", detail: "Google Gemini" },
            { value: "PT·EN·ES", label: "relato multilíngue", detail: "disponível 24×7" },
            { value: "LGPD", label: "Lei 14.457/2022", detail: "conformidade nativa" }
          ],
          specs: [
            { k: "arquitetura", v: "SaaS multi-tenant · tRPC v11 · React 19 + Vite" },
            { k: "banco", v: "MySQL 8 · Drizzle ORM · isolamento por tenant" },
            { k: "segurança", v: "OpenPGP + AES-256-GCM · RBAC · 2FA TOTP · LGPD" },
            { k: "ia", v: "Google Gemini (gemini-2.5-flash)" },
            { k: "infra", v: "VPS privada · Docker Compose · Nginx + Let's Encrypt" },
            { k: "migração", v: "da AWS (ECS/RDS) para uma VPS privada" }
          ],
          topics: [
            { icon: "shield", title: "Relato anônimo e protegido",
              text: "O denunciante registra o caso de forma 100% anônima, sem nome, e-mail ou IP, recebe um código único e acompanha tudo por um chat bidirecional, sem nunca revelar quem é.",
              tech: "OpenPGP por tenant + AES-256-GCM em repouso · chave envelopada · sem rastro de IP",
              path: "denunciar" },
            { icon: "layers", title: "Dois canais independentes",
              text: "O Canal da Mulher e o Canal de Integridade funcionam como canais separados dentro da mesma plataforma, cada um com sua persona e suas categorias de relato.",
              tech: "Canal da Mulher (Athena) vs Integridade (Atlas, gênero-neutro, 10 categorias)",
              path: "canal" },
            { icon: "chart", title: "Fluxo completo de investigação",
              text: "Cada caso corre num Kanban com investigação, classificação por IA e conclusão formal, além de relatórios agendados em PDF, alertas e controle de SLA.",
              tech: "motor de alertas de SLA · PDF assinado SHA-256, verificável em /verificar/:code",
              path: "empresa/casos" },
            { icon: "sparkles", title: "Treinamento e suporte com IA",
              text: "Permissões granulares por papel, treinamentos com certificado verificável, gamificação e assistentes de IA que orientam usuários e sugerem o enquadramento legal de cada relato.",
              tech: "6 assistentes Gemini: 5 conversacionais + 1 de análise pós-denúncia (fire-and-forget)",
              path: "treinamento" }
          ]
        },
        {
          title: "Moeda Nobre · Moeda Digital de Benefícios",
          desc: "Moeda digital de benefícios que faz o dinheiro circular entre as empresas, os colaboradores e a economia local em volta deles.",
          longDesc: `Moeda Nobre é uma fintech de benefícios corporativos com moeda digital própria. Empresas contratantes depositam valores na plataforma e entregam aos colaboradores como saldos mensais, que são gastos numa rede de comércios credenciados pagando por QR Code com confirmação por PIN. Os comércios vão acumulando o que recebem e resgatam em PIX ou TED quando quiserem.

O sistema atende quatro perfis distintos, operadores da plataforma, empresas, comércios e colaboradores, e cada um tem seu próprio painel, permissões granulares e fluxos dedicados. Por cima disso, ele traz aprovação multi-etapa dos lançamentos financeiros, segregação de funções entre quem cria e quem aprova, importação em lote de colaboradores, log de auditoria completo, conformidade com a LGPD, dark mode e um app mobile-first para o colaborador.`
          ,
          stack: ["Next.js 16", "TypeScript", "TailwindCSS", "shadcn/ui", "Framer Motion", "TanStack Query", "Zustand", "Prisma ORM", "PostgreSQL", "NextAuth", "html5-qrcode", "TipTap", "Docker", "Nginx", "Redis", "VPS privada"],
          link: "https://moedanobre.com",
          repo: "",
          /* links do app nas lojas: preenchido, a página do projeto mostra
             os selos oficiais do Google Play / App Store */
          apps: { android: "", ios: "" },
          cover: "img/covers/moedanobre.webp?v=447d1696",
          featured: true,
          featuredOrder: 2,
          id: "moedanobre",
          category: "system",
          status: "em produção",
          year: "2026",
          role: "desenvolvimento da plataforma",
          story: {
            problem: {
              text: `O benefício corporativo tradicional é um vale que só funciona nas grandes redes. O dinheiro que a empresa injeta como benefício vaza direto pra fora da economia em volta do colaborador. O comércio local, onde as pessoas de fato vivem e gastam, fica de fora, porque não tem como aceitar aquele vale nem receber por ele de um jeito simples.

O Moeda Nobre vira esse jogo. Só que o desafio real nunca foi só "criar uma carteira". Era mover dinheiro de verdade entre quatro atores (a plataforma, a empresa, o comércio e o colaborador) com aprovação, segregação de funções e auditoria, pra que nada saísse do lugar sem deixar rastro.`,
              note: "benefício que vaza da economia local: o vale só serve na grande rede"
            }
          },
          flow: {
            steps: [
              { label: "Empresa deposita", sub: "vira saldo mensal" },
              { label: "Aprovação", sub: "multi-etapa, rejeitável" },
              { label: "Colaborador paga", sub: "QR Code + PIN" },
              { label: "Comércio resgata", sub: "PIX ou TED" }
            ]
          },
          impact: {
            text: "O Moeda Nobre é uma plataforma financeira B2B2C em produção, não um piloto. Dinheiro real circula da empresa até o comércio local passando por controles de nível bancário: aprovação em várias mãos, uma divisão clara entre quem aprova e quem paga, soft delete universal e registro de auditoria pra cada ação. Quatro perfis diferentes operam o mesmo sistema, cada um com seu painel e suas permissões.",
            note: "aprovação multi-etapa + segregação de funções: quem aprova nunca é quem paga"
          },
          metrics: [
            { value: "4", label: "perfis dedicados", detail: "operador · empresa · comércio · colaborador" },
            { value: "8", label: "etapas de aprovação", detail: "lançamento rejeitável" },
            { value: "QR + PIN", label: "pagamento", detail: "resgate em PIX/TED" },
            { value: "LGPD", label: "aceite versionado", detail: "IP + userAgent + versão" }
          ],
          specs: [
            { k: "arquitetura", v: "Next.js 16 · Prisma · PostgreSQL" },
            { k: "pagamento", v: "QR Code + PIN · consumo FIFO · resgate PIX/TED" },
            { k: "controles", v: "aprovação multi-etapa · segregação de funções · log de auditoria" },
            { k: "segurança", v: "NextAuth v5 · PIN em bcrypt · aceite LGPD versionado" },
            { k: "infra", v: "Docker · Nginx · Redis · VPS privada" }
          ],
          topics: [
            { icon: "sparkles", title: "Uma moeda própria",
              text: "Empresas contratantes depositam valores na plataforma e entregam aos colaboradores como saldos mensais pra gastar ali perto.",
              tech: "cada lançamento vira um saldo mensal por colaborador/benefício/mês (original · consumido · restante)",
              path: "cliente/saldos" },
            { icon: "gauge", title: "Gasto em comércios credenciados",
              text: "Colaboradores pagam escaneando um QR Code e confirmando com um PIN, numa rede de comércios credenciados que acumulam saldo e resgatam via PIX ou TED.",
              deep: [
                "O comércio gera um QR com valor e prazo de validade; o colaborador escaneia e confirma com o PIN.",
                "Antes de aprovar, o sistema checa as restrições do benefício (estado, cidade, CEP, segmento) e o saldo disponível.",
                "O consumo é FIFO, saldos mais antigos primeiro, e um mesmo pagamento pode juntar vários benefícios.",
                "No resgate, o comércio pede um valor exato e o sistema consome as pilhas em FIFO, com taxa proporcional."
              ],
              path: "pagar" },
            { icon: "users", title: "Quatro perfis dedicados",
              text: "Operadores da plataforma, empresas, comércios e colaboradores, cada um com seu próprio painel, permissões granulares e fluxos dedicados.",
              tech: "4 tipos de usuário, cada um com sub-papéis (MASTER/ADMIN/LANÇADOR/APROVADOR/VISUALIZADOR) e proteção por papel no middleware",
              path: "admin" },
            { icon: "shield", title: "Controles financeiros embutidos",
              text: "Aprovação multi-etapa, segregação de funções, importação em lote de colaboradores, log de auditoria completo e conformidade com a LGPD.",
              deep: [
                "O lançamento de saldo passa por 8 estados, do rascunho à distribuição, e pode ser rejeitado em qualquer etapa com motivo.",
                "A segregação de funções é dura: quem cria não aprova, e quem aprova não paga (403 se tentar).",
                "A importação em lote valida a planilha inteira antes de gravar um colaborador sequer.",
                "Tudo é soft delete e cada ação vira registro de auditoria com estado antes/depois, IP e user agent."
              ],
              path: "auditoria" }
          ]
        },
        {
          title: "IBA · Rede de Inovação Cross-Border",
          desc: "Plataforma internacional de networking que conecta fintechs, instituições e reguladores de Brasil, Irlanda e Reino Unido, no lugar de grupos de WhatsApp dispersos.",
          longDesc: `A IBA é a plataforma digital da Innovation Business Alliance, uma aliança membership-led e invitation-only que conecta líderes de fintech, instituições financeiras, investidores e reguladores entre Brasil, Irlanda e Reino Unido. No lugar de grupos de mensagens espalhados, ela traz toda a rede pra um só lugar: aprovação curada de membros, eventos com check-in, comitês temáticos, diretório e memória institucional.

O produto amarra quatro superfícies (um site público, o portal do membro, um painel administrativo e uma API) com diretório de membros, biblioteca de documentos, chat de IA sobre a base de conhecimento, matchmaking semântico cross-border, notificações em tempo real e conformidade com a LGPD. Tudo isso em cinco idiomas, pensado pra operar entre fusos e mercados diferentes.`
          ,
          stack: ["NestJS", "Next.js 16", "React 19", "TypeScript", "Prisma", "PostgreSQL", "Redis", "BullMQ", "Socket.IO", "OpenAI", "Anthropic", "Resend", "Twilio", "next-intl", "Docker", "Nginx"],
          link: "https://ibanetwork.org",
          repo: "",
          cover: "img/covers/iba.webp?v=b42aaaa7",
          featured: true,
          featuredOrder: 3,
          id: "iba",
          category: "system",
          status: "em produção",
          year: "2026",
          role: "full-stack, produto inteiro",
          story: {
            problem: {
              text: `O networking entre os ecossistemas de inovação de Brasil, Irlanda e Reino Unido acontecia espalhado: grupos de WhatsApp que ninguém acompanha, contatos que se perdem, eventos pontuais sem continuidade. Não tinha perfil, não tinha busca, não tinha memória, então achar a empresa ou a pessoa certa do outro lado do Atlântico dependia de sorte e de quem você já conhecia.

Construir a confiança que falta nesse corredor é difícil justamente porque ela não pode ser fabricada. A plataforma não inventa relações, ela dá estrutura a uma rede que já existe: aprova quem entra, organiza o que acontece e guarda a memória de tudo.`,
              note: "aliança cross-border entre BR, IE e UK · invitation-only · 5 idiomas"
            }
          },
          flow: {
            steps: [
              { label: "Candidatura", sub: "aprovação humana" },
              { label: "Perfil", sub: "empresa e interesses" },
              { label: "Conexões", sub: "matchmaking semântico" },
              { label: "Rede viva", sub: "eventos e comitês" }
            ]
          },
          impact: {
            text: "O que era conversa dispersa virou infraestrutura: uma rede curada onde membros aprovados se encontram, marcam eventos, trocam conhecimento em comitês e recebem sugestões de conexão com base no que realmente fazem. No lugar de um grupo de mensagens, uma plataforma internacional inteira, em produção, em cinco idiomas.",
            note: "monorepo Turborepo · NestJS + Next.js · realtime + RAG + matchmaking"
          },
          metrics: [
            { value: "BR·IE·UK", label: "corredor cross-border", detail: "São Paulo · Dublin · Londres" },
            { value: "5", label: "idiomas", detail: "EN · PT · ES · IT · DE" },
            { value: "4", label: "superfícies", detail: "site · portal · admin · API" },
            { value: "só convite", label: "aprovação curada", detail: "todo membro é revisado" }
          ],
          specs: [
            { k: "arquitetura", v: "monorepo Turborepo · NestJS 10 · Next.js 16 + React 19" },
            { k: "banco", v: "PostgreSQL (pgvector) · Prisma · 24 migrações" },
            { k: "realtime & filas", v: "Socket.IO · BullMQ · outbox pattern · Redis" },
            { k: "ia", v: "OpenAI + Anthropic · RAG com citações · matchmaking semântico" },
            { k: "segurança", v: "RBAC (~57 permissões) · 2FA TOTP · LGPD-first" },
            { k: "infra", v: "Docker · Nginx · 5 locales (next-intl)" }
          ],
          topics: [
            { icon: "shield", title: "Curadoria e confiança",
              text: "É uma rede invitation-only: todo candidato passa por aprovação humana antes de entrar. Confiança é o produto, não existe 'cadastre-se grátis'.",
              tech: "RBAC com 4 papéis e ~57 permissões · 2FA TOTP · audit log · LGPD-first",
              path: "admin" },
            { icon: "users", title: "Diretório e conexões inteligentes",
              text: "Busca de membros por empresa, cargo, país e interesse, mais um matchmaking semântico que lê os perfis e sugere as conexões cross-border com motivo claro.",
              deep: [
                "Cada perfil vira um embedding; o algoritmo cruza perfil e histórico e sugere de 6 a 20 pessoas.",
                "Cada sugestão traz o porquê da conexão, não só um match cego.",
                "As recomendações são recalculadas por cron (diário/semanal), fora do caminho da requisição.",
                "O membro decide se aparece ou não na busca externa."
              ],
              path: "portal/diretorio" },
            { icon: "layers", title: "Comitês e eventos vivos",
              text: "Comitês temáticos com agendas em tempo real, eventos presenciais com check-in por QR e uma biblioteca de documentos versionada com permissões granulares.",
              tech: "agendas realtime (Socket.IO) · check-in por QR · ACL por documento · resumo por IA ao fechar",
              path: "portal/comites" },
            { icon: "sparkles", title: "IA sobre a base de conhecimento",
              text: "Um chat de IA responde em cima dos documentos indexados da rede, com citações e feedback, transformando a memória institucional em algo que dá pra consultar.",
              deep: [
                "Os documentos são indexados (RAG) e o chat responde com citações de volta pra fonte.",
                "Dois provedores de IA por trás (OpenAI + Anthropic), com cache e controle de custo.",
                "As respostas vêm em streaming (SSE) e um circuit breaker evita que a experiência caia.",
                "Alertas de orçamento de IA disparam em 50/80/100% via métricas."
              ],
              path: "portal/chat" }
          ]
        },
        /* removido a pedido: {
          title: "Módulo Engenharia · Site de Automação Industrial",
          desc: "Site institucional de uma empresa de engenharia que automatiza e mantém as máquinas críticas da indústria pesada: mineração, siderurgia, offshore e energia.",
          longDesc: `A Módulo Engenharia vende automação, engenharia elétrica e manutenção em campo para a indústria que não pode parar. O site é uma jornada de página única que abre num hero offshore cinematográfico, apresenta seis serviços e os quatro segmentos de atuação, e fecha num bloco de contato que transforma o visitante em conversa direta no WhatsApp com um engenheiro. É um build estático em Astro, com GSAP, ScrollTrigger e Lenis self-hosted e fontes self-hosted, sem CDN em produção, conteúdo vindo de arquivos de fonte tipados, e Vitest cobrindo a lógica de WhatsApp e formulário.`
          ,
          stack: ["Astro", "TypeScript", "GSAP", "Lenis", "Canvas", "CSS3", "Vitest"],
          link: "https://modulo-engenharia.vercel.app",
          repo: "https://github.com/iannini25/Modulo-engenharia",
          cover: "img/covers/modulo-engenharia.webp?v=40529965",
          id: "modulo-engenharia",
          flow: {
            steps: [
              { label: "Hero offshore", sub: "a indústria que não pode parar" },
              { label: "Seis serviços", sub: "automação, elétrica, manutenção" },
              { label: "Quatro segmentos", sub: "onde a empresa atua" },
              { label: "Conversa no WhatsApp", sub: "direto com um engenheiro" }
            ]
          },
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          topics: [
            { icon: "sparkles", title: "Hero offshore cinematográfico",
              text: "Uma plataforma de petróleo offshore ao entardecer se afasta devagar conforme você rola, desenhada como sequência de frames num canvas comandado por GSAP e Lenis. Degrada para um pôster estático com reduced-motion, sem JS ou frames ausentes." },
            { icon: "layers", title: "Quatro segmentos da indústria pesada",
              text: "Mineração, siderurgia, offshore e energia têm cada uma sua leitura, das máquinas de pátio e transportadores de longa distância à instrumentação de alto-forno e aos sistemas de controle e segurança offshore." },
            { icon: "users", title: "Construtor de mensagem no WhatsApp",
              text: "O bloco de contato mantém o WhatsApp como canal primário: um formulário curto monta uma mensagem pronta com nome, empresa e segmento e abre conversa direta com um engenheiro, sem depender de servidor." },
            { icon: "gauge", title: "Astro estático, sem CDN",
              text: "Feito como site Astro estático, com fontes e a stack GSAP/Lenis self-hosted e sem CDN em produção, conteúdo editável centralizado em arquivos de fonte tipados, e testes Vitest sobre a lógica de WhatsApp, formulário e build." }
          ]
        }, */
        {
          title: "CommunityHub · Plataforma White Label para Associações",
          desc: "Landing de venda de uma plataforma white label que dá a câmaras de comércio, alianças e redes de negócios um portal de membros com a própria marca, apresentações por IA, eventos, comitês e documentos num só lugar.",
          longDesc: `O CommunityHub é a versão white label da plataforma que já roda a rede da IBA entre Brasil, Irlanda e Reino Unido. A página fala com presidentes e gestores de membros de associações: mostra o que o membro faz num portal com a marca da associação, como a IA apresenta as pessoas certas e explica por quê, um assistente que só responde com o conteúdo da própria associação, a diretoria operando tudo de um lugar e o cuidado com LGPD e GDPR. Termina nos planos e no pedido de demonstração. Feita à mão em HTML, CSS e JavaScript puro, em português e inglês.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger"],
          link: "https://communityhub.bernardoiannini.com",
          cover: "img/covers/communityhub.webp?v=ee31ea6a",
          id: "communityhub",
          category: "system",
          featured: false,
          status: "no ar",
          year: "2026",
          topics: [
            { icon: "users", title: "Portal de membros com a sua marca",
              text: "Diretório, eventos, comitês e documentos num portal com o nome, as cores e o domínio da associação." },
            { icon: "sparkles", title: "IA que apresenta e explica",
              text: "A IA sugere quem cada membro deve conhecer e diz por quê, e o assistente só responde com o conteúdo da própria associação." },
            { icon: "layers", title: "Um lugar só para a diretoria",
              text: "A diretoria cuida de membros, eventos e conteúdo sem pedir nada ao TI, com LGPD e GDPR previstos desde o início." },
            { icon: "globe", title: "Em produção na IBA",
              text: "A mesma plataforma já roda a rede da IBA entre Brasil, Irlanda e Reino Unido." }
          ]
        },
        {
          title: "Nest Battersea · Seletor de Residências",
          desc: "Seletor interativo de residências da Nest Battersea, torre de 34 andares com apartamentos com jardim às margens do Tâmisa, em Londres: você clica numa janela acesa, voa até ela, gira a planta 3D e entra no apartamento.",
          longDesc: `A Nest Battersea é uma torre de aluguel em 38 Lombard Road, na margem de Battersea do Tâmisa, com 143 apartamentos empilhados como ninhos e um jardim para cada um. O site transforma a imagem oficial da torre na própria navegação: as duas residências disponíveis, LOFT 4 e Bungalow 3, estão desenhadas exatamente sobre as suas janelas, e um clique dispara um voo de câmera gerado por IA que termina de frente para aquela janela. Dali a pessoa abre uma planta 3D montada a partir das plantas oficiais ou atravessa o vidro até a sala e percorre cada cômodo. Cada vídeo começa e termina em quadros da própria imagem oficial, então o prédio nunca muda e só a câmera se move. Foi feito à mão em HTML, CSS e JavaScript puro, sem framework, e a página segue como o site completo do lançamento: as vistas externas verificadas, as doze tipologias com as plantas oficiais, sustentabilidade, um mapa ao vivo do bairro com rotas a pé e de carro e o contato com a equipe. A planta em Three.js, o GSAP e o mapa só carregam quando necessário, e cerca de 80 verificações automáticas de ponta a ponta cobrem computador, celular, movimento reduzido e navegação sem JavaScript.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "Three.js", "GSAP", "ScrollTrigger", "MapLibre GL", "Vídeo com IA (Kling 3.0)", "Puppeteer"],
          link: "https://nestbattersea.vercel.app",
          repo: "https://github.com/iannini25/NestBatterSea",
          cover: "img/covers/nest-battersea.webp?v=a854f8af",
          id: "nest-battersea",
          flow: {
            steps: [
              { label: "A torre", sub: "imagem oficial, janelas marcadas" },
              { label: "Voo de câmera", sub: "direto até a janela escolhida" },
              { label: "Planta 3D", sub: "gire e mergulhe num cômodo" },
              { label: "Entrar", sub: "tour por cada cômodo" },
              { label: "O bairro", sub: "mapa ao vivo com rotas reais" }
            ]
          },
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          topics: [
            { icon: "sparkles", title: "Voos de câmera com IA sem mudar o prédio",
              text: "Cada voo e cada entrada é um clipe do Kling 3.0 preso a um quadro inicial e a um final: a imagem oficial numa ponta e uma foto nivelada da janela aberta na outra. A IA só inventa o caminho do meio, então a fachada nunca se redesenha e só a câmera se move." },
            { icon: "layers", title: "Planta 3D a partir das plantas oficiais",
              text: "Cada parede, janela, escada e jardim dos dois apartamentos foi modelado em Three.js a partir das plantas do arquiteto, na escala de 44,4 px por metro. A planta do LOFT 4 alterna entre os dois andares, e um clique em qualquer cômodo mergulha nele e abre a foto." },
            { icon: "palette", title: "Um cartão recortado em volta da interface",
              text: "A primeira tela é um cartão grande com cantos invertidos onde ficam o logo, o menu, o Register interest e o mini card da residência. O contorno é um único path SVG usado como clip-path, recalculado a partir do tamanho real de cada elemento, então as curvas acompanham qualquer tela." },
            { icon: "gauge", title: "Leve em qualquer aparelho e testado de ponta a ponta",
              text: "Os vídeos vêm em 1080p ou 720p conforme a tela, os interiores em AVIF, WebP ou JPG, e a planta 3D só carrega quando abre. No celular o primeiro toque destaca a janela e o segundo voa até ela, o movimento reduzido corta direto para o destino e cerca de 80 verificações com Puppeteer cobrem computador, retina, celular e navegação sem JavaScript." },
            { icon: "globe", title: "Um mapa ao vivo do bairro",
              text: "A localização é um mapa MapLibre GL com estilo próprio da marca, prédios 3D baixos e a torre marcada como uma coluna de luz. Uma página dedicada traz 33 lugares com foto, filtros por categoria, visão de satélite e rotas a pé e de carro pré-calculadas, que só atravessam o Tâmisa por pontes de verdade." },
            { icon: "search", title: "Cada número vem das fontes oficiais",
              text: "As doze tipologias com áreas e plantas, as 51 casas affordable, os layouts para cadeira de rodas e os dados de sustentabilidade saem dos documentos públicos de licenciamento, com as fontes registradas. Nenhum preço ou aluguel aparece, e tudo que é ilustrativo está marcado." }
          ]
        },
        /* removido a pedido: {
          title: "BRASA · Restaurante de Cozinha de Fogo",
          desc: "Landing page da BRASA, restaurante autoral de fogo vivo em São Paulo que serve cortes maturados sobre brasa de lenha, com cardápio à la carte, balcão de chef de doze lugares e reservas de mesa.",
          longDesc: `A BRASA é uma cozinha de fogo autoral em São Paulo: cortes de maturação longa sobre brasa de lenha viva, um balcão de chef com doze lugares e uma experiência de seis tempos. O site vende essa sala antes de você entrar, abrindo num hero cinematográfico onde uma sequência de 241 frames JPEG desenha num canvas dirigido pelo scroll, e segue pela história da casa, pelo cardápio à la carte, por um sommelier embutido e pelo formulário de reservas. É um site estático feito à mão, sem build, em HTML, CSS e JavaScript puro, com GSAP ScrollTrigger e Lenis para o scroll cinematográfico e um dicionário completo PT e EN, além de pôster estático como fallback no mobile e no modo de movimento reduzido.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://brasa-restaurante-ten.vercel.app",
          repo: "https://github.com/iannini25/brasa-restaurante",
          cover: "img/covers/brasa.webp?v=f3b139e7",
          id: "brasa",
          flow: {
            steps: [
              { label: "Hero de fogo", sub: "a sala antes de você entrar" },
              { label: "A casa", sub: "brasa de lenha viva" },
              { label: "Cardápio e sommelier", sub: "à la carte e harmonização" },
              { label: "Reserva", sub: "balcão de 12 lugares" }
            ]
          },
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          topics: [
            { icon: "sparkles", title: "Hero de fogo dirigido pelo scroll",
              text: "O hero não é um vídeo. Uma sequência de 241 frames JPEG desenha num canvas, onde o scroll só define o frame-alvo e um loop requestAnimationFrame persegue esse alvo, então um decode lento nunca trava a página e o mergulho fica liso." },
            { icon: "layers", title: "Cardápio, sommelier e reservas",
              text: "O cardápio à la carte traz um sommelier embutido que sugere uma harmonização por prato, além de um formulário de reserva que deixa o cliente escolher o salão ou o balcão de chef de doze lugares." },
            { icon: "globe", title: "Bilíngue PT e EN",
              text: "Localização completa em português e inglês por um dicionário data-i18n, com um seletor PT e EN que troca cada seção, o cardápio e o sommelier na hora." },
            { icon: "gauge", title: "Estático, rápido e acessível",
              text: "Site estático sem build, tipografia Fraunces e Hanken, skip link e suporte a movimento reduzido: abaixo de 861px o hero continua um pôster estático e nenhum frame é baixado." }
          ]
        }, */
        {
          title: "Sereno · Estúdio de Massagem & Repouso",
          desc: "Landing page premium para um estúdio de massagem e repouso, que transforma a visita ao site em uma sessão agendada pelo WhatsApp.",
          longDesc: `Sereno é um estúdio de massagem e repouso na Savassi, em Belo Horizonte, que vende a sessão como ritual: do avulso aos planos mensal e anual. O trabalho do site é um só: fazer quem chegou curioso sair com um horário pedido.\n\nA página abre com a câmera entrando na sala e descendo até a recepção enquanto você rola, como se a visita começasse ali. Depois vêm a galeria do espaço, uma sessão contada minuto a minuto, os planos e um formulário curto que já entrega o pedido pronto no WhatsApp da casa. Marca, copy e direção de arte foram criadas do zero, no tom de luxo silencioso: creme, blush e dourado.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://sereno-site-one.vercel.app",
          repo: "https://github.com/iannini25/sereno-site",
          cover: "img/covers/sereno.webp?v=6c94e034",
          id: "sereno",
          flow: {
            steps: [
              { label: "Entrada na sala", sub: "a câmera desce até a recepção" },
              { label: "Galeria", sub: "o estúdio em detalhes" },
              { label: "Planos", sub: "avulso, mensal ou anual" },
              { label: "Agendamento", sub: "pedido pronto no WhatsApp" }
            ]
          },
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          role: "marca, design, copy e front-end",
          topics: [
            { icon: "sparkles", title: "A visita começa na primeira dobra",
              text: "A câmera atravessa a sala e desce até a recepção conforme a rolagem, numa tomada contínua. Antes de ler qualquer preço, a pessoa já sentiu o lugar." },
            { icon: "layers", title: "Uma sessão contada minuto a minuto",
              text: "Uma galeria horizontal percorre a sessão do chá de chegada ao repouso final, respondendo o que todo mundo quer saber antes de marcar: como é lá dentro." },
            { icon: "chart", title: "WhatsApp como motor de agendamento",
              text: "O formulário de visita coleta nome, WhatsApp, ritual desejado e melhor dia e monta uma mensagem pronta, para a casa confirmar em minutos sem sistema de agenda." },
            { icon: "palette", title: "Luxo silencioso, sem exagero",
              text: "Marca e copy criadas do zero: paleta creme, blush e dourado, títulos em Cormorant Garamond e texto em Jost. Muito respiro e nenhuma cor gritando." }
          ]
        },
        {
          title: "Amaro.fy · Crochê sob medida",
          desc: "Site one-page cinematográfico da Amaro.fy, ateliê de crochê artesanal de Belo Horizonte que faz peças exclusivas sob medida e fecha cada venda pelo WhatsApp.",
          longDesc: `A Amaro.fy vende crochê feito à mão: cada peça é tecida do zero, no tamanho e na cor da cliente, a partir de uma foto ou de uma ideia que ela manda. O site transforma isso numa narrativa guiada pelo scroll, do manifesto do feito sob medida ao processo em quatro passos, até uma galeria horizontal com as peças prontas, com orientações de tamanho, cuidados e embalagem.\n\nTudo termina num formulário de pedido que monta a mensagem de WhatsApp sozinho: a cliente escolhe a peça e o tamanho e cai numa conversa já preenchida. Um fio de crochê desce pela margem da página e se desenha enquanto ela rola, levando a ideia do feito à mão para o layout inteiro.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://amarofy.vercel.app",
          repo: "https://github.com/iannini25/amaro.fy-website",
          cover: "img/covers/amarofy.webp?v=399ef1e5",
          id: "amarofy",
          flow: {
            steps: [
              { label: "Manifesto", sub: "feito sob medida" },
              { label: "O processo", sub: "quatro passos" },
              { label: "Peças prontas", sub: "tamanho, cuidados e embalagem" },
              { label: "Pedido", sub: "mensagem pronta no WhatsApp" }
            ]
          },
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          topics: [
            { icon: "sparkles", title: "Abertura que anda com a rolagem",
              text: "A peça vai sendo revelada quadro a quadro conforme você rola, com um enquadramento largo no computador e outro vertical, pensado de propósito, no celular." },
            { icon: "users", title: "Montador de pedido no WhatsApp",
              text: "O formulário de pedido e os chips de tamanho montam uma mensagem de WhatsApp pronta pra enviar, e a cliente cai numa conversa já preenchida com nome, peça e tamanho." },
            { icon: "layers", title: "Galeria horizontal fixada",
              text: "As peças prontas correm de lado numa faixa fixada no desktop e viram swipe nativo no toque, cada uma refeita na cor e no tamanho da cliente." },
            { icon: "palette", title: "Assinatura do fio tecido",
              text: "Um único fio de crochê em SVG desce pela margem e se desenha conforme a página rola, amarrando a ideia do artesanal ao layout inteiro." }
          ]
        },
        {
          title: "Automotiva Express · Oficina Bosch Car Service",
          desc: "Site one-page da Automotiva Express, oficina Bosch Car Service em Belo Horizonte, construído em cima de uma promessa: você aprova o preço antes de qualquer reparo.",
          longDesc: `A Automotiva Express é uma oficina Bosch Car Service no Buritis, em Belo Horizonte, que vende padrão de concessionária sem preço de concessionária. O site inteiro é uma máquina anti-ansiedade mirando a dor número um das avaliações de oficina, o orçamento-surpresa: nada é mexido antes de você aprovar o preço, se aparece algo novo no meio do reparo a oficina para e te avisa, e todo serviço sai com garantia.\n\nA página é uma narrativa única, guiada pela rolagem: abre com o carro na oficina, mostra o processo em quatro passos que o cliente consegue acompanhar e fecha com os serviços e o contato direto. Cada bloco responde a uma desconfiança concreta de quem já levou um susto com conta de oficina.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://automotiva-express.vercel.app",
          repo: "https://github.com/iannini25/automotiva-express",
          cover: "img/covers/automotiva-express.webp?v=a50a7163",
          id: "automotiva-express",
          flow: {
            steps: [
              { label: "Orçamento", sub: "o preço antes de mexer" },
              { label: "Você aprova", sub: "nada sem o seu ok" },
              { label: "Reparo", sub: "apareceu algo novo? a oficina para e avisa" },
              { label: "Garantia", sub: "todo serviço sai garantido" }
            ]
          },
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          topics: [
            { icon: "shield", title: "Você aprova o preço antes",
              text: "Nada é mexido antes de você aprovar o orçamento. Se aparece algo novo no meio do reparo, a oficina para e te avisa, então o orçamento-surpresa que domina as avaliações de oficina simplesmente não acontece." },
            { icon: "layers", title: "Um processo de quatro passos que dá pra acompanhar",
              text: "Diagnóstico de verdade, um orçamento que você aprova, execução com acompanhamento e entrega com garantia. Cada passo é visível e nada anda nas suas costas." },
            { icon: "gauge", title: "Padrão Bosch Car Service",
              text: "Padrão de concessionária sem preço de concessionária: mecânica geral, serviços express e eletricidade e eletrônica embarcada, com o respaldo da rede Bosch Car Service." },
            { icon: "palette", title: "Uma página que acalma em vez de vender",
              text: "Tom sóbrio, poucas cores e nada de promoção gritando. A estética de concessionária passa a confiança que o cliente procura antes de deixar o carro." }
          ]
        },
        {
          title: "BeSafe · Segurança do Fator Humano",
          desc: "Plataforma de segurança do fator humano: a empresa dispara phishing simulado nos canais que já usa, e quem clica aprende na hora.",
          longDesc: "A BeSafe é uma plataforma de segurança do fator humano para empresas. O administrador importa a equipe, dispara phishing simulado por e-mail, Outlook, Slack, Teams e WhatsApp e escolhe a data. Quem clica vê na hora uma tela mostrando o que poderia ter vazado e vai direto pra uma aula curta em vídeo sobre aquele golpe.\n\nOs resultados viram métrica em dois painéis, um do administrador e um de cada colaborador, e uma plataforma de educação mantém módulos em vídeo sobre golpes antigos e novos, sempre sem culpar a pessoa.",
          stack: ["Next.js 16","React 19","TypeScript","Python","PostgreSQL","Docker","Caddy"],
          link: "https://besafebr.com",
          repo: "",
          cover: "img/covers/besafe.webp?v=86534ea2",
          id: "besafe",
          flow: {
            steps: [
              { label: "Importa a equipe", sub: "painel do administrador" },
              { label: "Phishing simulado", sub: "e-mail, Teams, Slack, WhatsApp" },
              { label: "Clicou, aprendeu", sub: "vídeo sobre aquele golpe" },
              { label: "Risco vira métrica", sub: "painel do admin e do colaborador" }
            ]
          },
          category: "system",
          featured: false,
          status: "pré-lançamento",
          year: "2026",
          role: "full-stack, produto inteiro",
          story: {
            problem: {
              text: "Firewall e antivírus protegem máquinas, mas a maioria dos incidentes começa numa pessoa: alguém clica num link falso, aprova um pagamento pelo telefone ou passa um acesso sob pressão. A empresa quase nunca sabe quem da equipe cairia num golpe, e o treinamento genérico de uma vez por ano não muda comportamento.\n\nO difícil é testar as pessoas de verdade sem expor nem culpar ninguém, e transformar cada erro em aprendizado no exato momento em que ele acontece."
            }
          },
          topics: [
            { icon: "globe", title: "Phishing em todos os canais",
              text: "A empresa dispara golpes falsos e realistas pelos canais que a equipe já usa, e-mail, Outlook, Slack, Teams e WhatsApp, pra ver quem cai." },
            { icon: "shield", title: "Aprendizado na hora do clique",
              text: "Quem clica vê o que poderia ter vazado e vai direto pra uma aula curta em vídeo sobre aquele golpe, sem culpa." },
            { icon: "layers", title: "Plataforma de educação",
              text: "Módulos em vídeo sobre golpes antigos e novos, com linguagem informal e sempre atualizados, inclusos no plano pra equipe toda." },
            { icon: "chart", title: "Risco humano vira número",
              text: "Os painéis do administrador e do colaborador transformam comportamento em risco medido, e um assistente no app ajuda a checar se uma mensagem é suspeita." }
          ]
        },
        {
          title: "JARVIS · Assistente de Voz para o Carro",
          desc: "Um assistente de voz para o carro: você diz \"Hey Jarvis\" e fala normal, e ele lê o motor ao vivo, controla música e navegação e avisa antes do problema.",
          longDesc: "O JARVIS é um assistente de voz que eu construí pro meu próprio carro, um VW up! TSI, rodando num Raspberry Pi dentro do veículo. Você diz \"Hey Jarvis\" e conversa normal, em português, e ele responde com personalidade bem brasileira, te ouvindo mesmo com o barulho da estrada e aceitando ser interrompido no meio da frase.\n\nEle lê o motor ao vivo pela porta OBD2, explica luzes do painel e códigos de falha, responde com base no manual do carro, controla o Spotify e a navegação e fala sozinho quando precisa: manutenção, combustível e clima. É o único projeto daqui sem site: ele mora no carro, e um painel na tela mostra os mostradores em tempo real.",
          stack: ["Python","FastAPI","React","Gemini","OpenAI","OBD2","Raspberry Pi"],
          link: "",
          repo: "",
          local: true,
          cover: "img/covers/jarvis.webp?v=e5c56b6e",
          id: "jarvis",
          flow: {
            steps: [
              { label: "\"Hey Jarvis\"", sub: "palavra de ativação, mãos livres" },
              { label: "Entende", sub: "comando na hora ou IA" },
              { label: "Lê o carro", sub: "dados OBD2 ao vivo" },
              { label: "Responde em voz", sub: "e age: música, rota" }
            ]
          },
          category: "personal",
          featured: false,
          status: "roda localmente",
          year: "2026",
          role: "projeto pessoal, produto inteiro",
          story: {
            problem: {
              text: "Assistente de celular não conhece o carro: não lê o motor, não entende uma luz acesa no painel e sofre com o barulho da cabine. E ficar olhando tela atrás de informação enquanto dirige é justamente o que não pode.\n\nO desafio era um copiloto de mãos livres que te ouve de verdade num carro barulhento, responde na hora os comandos simples e ainda dá conta de perguntas abertas, tudo rodando num computador pequeno dentro do carro."
            }
          },
          topics: [
            { icon: "sparkles", title: "Voz feita pro carro",
              text: "Diga \"Hey Jarvis\" e fale normal: ele te ouve com o barulho da estrada, aceita ser interrompido e aumenta a própria voz quando a cabine fica barulhenta." },
            { icon: "gauge", title: "Ele conhece o carro",
              text: "Lê rotação, velocidade, temperatura e mais de 36 sensores ao vivo, explica códigos de falha e responde com base no manual do carro." },
            { icon: "layers", title: "Cérebro híbrido",
              text: "Comandos comuns têm resposta na hora, perguntas abertas vão pra IA com reservas, e uma checagem de segurança revisa cada ação." },
            { icon: "shield", title: "Copiloto que se antecipa",
              text: "Avisa de manutenção, combustível, clima e rota antes de você perguntar, controla o Spotify e a navegação e aprende os seus hábitos." }
          ]
        },
        {
          title: "bernardoiannini.com · Este Site",
          desc: "O site em que você está agora: meu portfólio, blog e currículo num lugar só, em dois idiomas, desenhado e construído por mim do zero.",
          longDesc: `Este site é onde eu mostro quem sou e o que construo: projetos, blog, currículo e um caminho direto pra falar comigo. É o meu próprio produto, então é também o meu laboratório: cada página foi desenhada e programada aqui, sem template.

Cada projeto ganha uma página própria explicando o que é, o problema por trás e como funciona, com telas reais. O site inteiro troca entre português e inglês com um clique, funciona pra quem navega por teclado ou leitor de tela e continua legível com as animações desligadas.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP 3", "ScrollTrigger", "Lenis", "Node.js", "Markdown", "Supabase", "Vercel"],
          link: "https://www.bernardoiannini.com",
          repo: "https://github.com/iannini25/iannini-Frontend-Studio",
          cover: "img/covers/portfolio.webp?v=cae4a185",
          id: "portfolio",
          category: "personal",
          status: "em produção",
          year: "2026",
          topics: [
            { icon: "palette", title: "Uma linguagem visual do começo ao fim",
              text: "Fundo escuro, um único acento lima e uma família tipográfica na home, no blog e nas páginas de projeto, pra tudo parecer feito pela mesma mão." },
            { icon: "globe", title: "Português e inglês, um clique",
              text: "Todo texto do site troca de idioma na hora, e cada projeto e post tem também o próprio endereço em cada idioma pra quem chega pela busca." },
            { icon: "layers", title: "Uma página própria por projeto",
              text: "Cada projeto é contado como um caso: o que é, o problema, como funciona, telas pra navegar e quem construiu. São mais de sessenta, cada um com a sua cor de acento." },
            { icon: "users", title: "Feito pra todo mundo ler",
              text: "Navegação por teclado, rótulos pra leitor de tela e respeito ao movimento reduzido. A animação soma, mas nunca é necessária pra entender a página." }
          ]
        },
        /* LAB:START */
        {
          "title": "Maresia Barcos · Landing page de estaleiro de catamarãs a motor",
          "desc": "Estudo para um estaleiro fictício de catamarãs a motor, pensado para quem pesca longe e quer comparar modelos antes de falar com vendas.",
          "longDesc": "Maresia Barcos é uma marca fictícia de estaleiro criada como estudo de design. O público é quem leva o mar a sério: pescador de fim de semana, família que atravessa baía, gente que compara ficha técnica antes de assinar. O site existe para levar essa pessoa a montar o próprio barco ou agendar um teste no mar.\n\nA página começa com a lancha cortando o mar aberto, passa pela comparação lado a lado em \"Encontre o barco ideal\", reforça confiança em \"Parceiros que equipam cada casco\" e fecha em \"Pronto para começar sua jornada?\". O azul-náutico aparece pouco, só onde há decisão, e o resto fica em branco e foto de água.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/01-barcos/",
          "cover": "img/covers/maresia-barcos.webp",
          "id": "maresia-barcos",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "chart",
              "title": "Ficha técnica que se compara",
              "text": "Os modelos 24 e 30 aparecem em linhas com comprimento, boca, combustível e passageiros. Dá para decidir pelo número antes de pedir proposta."
            },
            {
              "icon": "shield",
              "title": "Garantias ditas com números",
              "text": "O card de qualidade resume horas de teste no mar, garantia do casco e balanço zero. A promessa vira coisa verificável, não adjetivo."
            },
            {
              "icon": "users",
              "title": "Fornecedores à vista",
              "text": "Motores, eletrônica, seguro e sonar ganham uma faixa própria. Quem compra barco quer saber o que vai dentro do casco."
            },
            {
              "icon": "palette",
              "title": "Azul de mar, foto de mar",
              "text": "O azul-náutico só marca botões e o bloco de financiamento. As fotos aéreas de água turquesa carregam a cor do resto da página."
            }
          ],
          "lab": true,
          "accent": "#2558A8",
          "fonts": [
            "Archivo",
            "Inter",
            "Instrument Serif"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Mar aberto",
                "sub": "Lancha em movimento e promessa"
              },
              {
                "label": "Encontre o barco",
                "sub": "Modelos 24 e 30 com ficha técnica"
              },
              {
                "label": "Financiamento",
                "sub": "Bloco azul com prazo de pagamento"
              },
              {
                "label": "Clientes",
                "sub": "Relatos de quem já pesca com o barco"
              },
              {
                "label": "Comece a jornada",
                "sub": "Teste no mar ou montagem do barco"
              }
            ]
          },
          "signature": "A headline gigante em caixa alta, metade sólida e metade apagada, sobreposta à lancha em alto-mar.",
          "goal": "Montar seu barco",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "Demão Pinturas · Landing page de serviço de pintura residencial",
          "desc": "Estudo para uma empresa fictícia de pintura residencial, voltado a quem quer pintar a casa sem obra arrastada nem sujeira no fim.",
          "longDesc": "Demão Pinturas é uma empresa fictícia de pintura interna, externa e comercial, criada como estudo de design. O público é o morador que adia a pintura por medo de bagunça, atraso e preço que muda no meio. O site precisa levar essa pessoa a pedir um orçamento, que sai em até um dia.\n\nA página tira os medos um por um: \"Pintura caprichada, do preparo à última demão\" mostra os serviços por ambiente, \"Do orçamento à entrega, sem surpresa no caminho\" explica as quatro etapas e o FAQ responde o resto. O azul-royal da marca escorre de um rolo de tinta que atravessa o herói e volta no fechamento.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/02-pintura/",
          "cover": "img/covers/demao-pinturas.webp",
          "id": "demao-pinturas",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Serviço por ambiente",
              "text": "Uma galeria troca entre pintura interna, fachada e comercial, com o que está incluso em cada uma. O cliente vê o serviço que precisa, não um catálogo."
            },
            {
              "icon": "shield",
              "title": "Quatro etapas sem surpresa",
              "text": "Visita técnica, cores e cronograma, preparo e vistoria com casa limpa. A obra deixa de ser caixa-preta antes mesmo do orçamento."
            },
            {
              "icon": "search",
              "title": "Antes e depois com contexto",
              "text": "\"Veja o que uma pintura nova pode fazer\" lista ambientes reais com prazo e metragem. O resultado aparece como caso, não só como foto bonita."
            },
            {
              "icon": "palette",
              "title": "O rolo como fio visual",
              "text": "O azul-royal sai de um rolo de tinta e marca só botões e o bloco final. A marca fala de pintura sem precisar de ícone de pincel."
            }
          ],
          "lab": true,
          "accent": "#01419A",
          "fonts": [
            "Inter Tight"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói com rolo",
                "sub": "Promessa e pedido de orçamento"
              },
              {
                "label": "Por que a Demão",
                "sub": "Cores testadas, prazo e garantia"
              },
              {
                "label": "Serviços",
                "sub": "Galeria por tipo de ambiente"
              },
              {
                "label": "Como funciona",
                "sub": "Quatro etapas do orçamento à entrega"
              },
              {
                "label": "Dúvidas e CTA",
                "sub": "FAQ e casa de cara nova"
              }
            ]
          },
          "signature": "Um rolo de pintura real em diagonal, pintando de azul o fundo do herói e reaparecendo no CTA final.",
          "goal": "Pedir orçamento grátis",
          "niche": "servico",
          "mood": "light"
        },
        {
          "title": "Linha Nobre · Home de e-commerce de moda",
          "desc": "Estudo de home para uma loja fictícia de moda atemporal, com alfaiataria leve e tricô, para quem compra peça que dura mais de uma estação.",
          "longDesc": "Linha Nobre é uma marca fictícia de moda criada como estudo de design. Vende alfaiataria leve, tricô e jeans claro para quem prefere comprar menos e usar por mais tempo. A home tem um trabalho só: levar o visitante a uma categoria ou a um produto e colocar no carrinho.\n\nDepois do herói \"ESTILO SEM PRAZO\", a faixa de frete, troca e pagamento tira as objeções de compra online. Em seguida vêm \"DESCUBRA SEU ESTILO\" por categoria, a campanha \"ESSENCIAIS DA NOVA ESTAÇÃO\" e os \"MAIS VENDIDOS\" com nota e variação de cor. O azul-acinzentado do estúdio fotográfico vira a cor da própria marca.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/03-moda-luxo/",
          "cover": "img/covers/linha-nobre.webp",
          "id": "linha-nobre",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "shield",
              "title": "Objeções resolvidas no topo",
              "text": "Logo abaixo do herói, uma barra resume frete grátis, troca em 30 dias, Pix ou cartão e suporte. A dúvida de compra é respondida antes do primeiro clique."
            },
            {
              "icon": "layers",
              "title": "Categorias com foto de tecido",
              "text": "Feminino, alfaiataria, bolsas e tricô aparecem como cartões de textura. A pessoa escolhe pelo material, como faria na loja física."
            },
            {
              "icon": "chart",
              "title": "Vitrine com prova",
              "text": "Cada item dos mais vendidos traz preço, nota, número de avaliações e bolinhas de cor. Dá para comparar sem abrir a página do produto."
            },
            {
              "icon": "palette",
              "title": "Cor do estúdio vira marca",
              "text": "O azul-acinzentado do fundo das fotos é o mesmo do banner e do rodapé marinho. Anton condensado dá o tom editorial de revista."
            }
          ],
          "lab": true,
          "accent": "#0B2A55",
          "fonts": [
            "Anton",
            "Inter"
          ],
          "sections": 3,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Estilo sem prazo",
                "sub": "Campanha principal e lookbook"
              },
              {
                "label": "Barra de garantias",
                "sub": "Frete, troca, pagamento e suporte"
              },
              {
                "label": "Descubra seu estilo",
                "sub": "Categorias em carrossel"
              },
              {
                "label": "Nova estação",
                "sub": "Promoção com até metade do preço"
              },
              {
                "label": "Mais vendidos",
                "sub": "Produtos com nota e cores"
              }
            ]
          },
          "signature": "O título condensado \"ESTILO SEM PRAZO\" empilhado em três linhas, com a última apagada, ao lado da modelo de blazer creme.",
          "goal": "Comprar a coleção",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Terrana Arquitetura · Site de estúdio de arquitetura e interiores",
          "desc": "Estudo para um escritório fictício de arquitetura, interiores e paisagismo, feito para quem vai construir ou reformar e procura um estúdio.",
          "longDesc": "Terrana Arquitetura é um estúdio fictício criado como estudo de design. Atende famílias que vão construir, reformar ou redesenhar um jardim e querem uma casa que funcione no dia a dia. O site precisa transformar essa vontade em uma mensagem com cidade, metragem e tipo de projeto.\n\n\"Do croqui à chave na mão\" mostra os quatro serviços, \"Espaços reais. Histórias reais\" abre o portfólio em fundo escuro e \"Vamos desenhar o seu lugar\" fecha com o formulário. A paleta fica entre areia, bege e grafite, com o tom de taupe da marca nas ilustrações.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/04-arquitetura/",
          "cover": "img/covers/terrana-arquitetura.webp",
          "id": "terrana-arquitetura",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Serviços em maquete",
              "text": "Projeto, interiores, paisagismo e gestão de obra viram miniaturas isométricas. Cada serviço ganha uma forma antes de ganhar um texto."
            },
            {
              "icon": "globe",
              "title": "Portfólio por lugar",
              "text": "Os projetos aparecem com nome e cidade, como Casa Varanda e Residência Serra. Fica claro que o estúdio desenha para contextos diferentes."
            },
            {
              "icon": "users",
              "title": "Formulário que já pergunta certo",
              "text": "O campo do projeto pede tipo, cidade e metragem. A primeira conversa já começa com o que o arquiteto precisa saber."
            },
            {
              "icon": "palette",
              "title": "Areia, bege e grafite",
              "text": "O site alterna blocos claros e escuros como luz e sombra numa casa. Manrope fino nos títulos mantém o tom calmo."
            }
          ],
          "lab": true,
          "accent": "#A8937A",
          "fonts": [
            "Manrope"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Escala humana",
                "sub": "Casa com piscina e projeto em destaque"
              },
              {
                "label": "Do croqui à chave",
                "sub": "Quatro serviços em maquete"
              },
              {
                "label": "Histórias reais",
                "sub": "Portfólio em fundo escuro"
              },
              {
                "label": "Sobre o estúdio",
                "sub": "Como o escritório pensa o cotidiano"
              },
              {
                "label": "Seu lugar",
                "sub": "Formulário e contatos"
              }
            ]
          },
          "signature": "Os quatro serviços ilustrados como maquetes isométricas em tom areia, como pequenas casas de argila.",
          "goal": "Conversar sobre o projeto",
          "niche": "imovel",
          "mood": "light"
        },
        {
          "title": "Fôlego · Landing page de academia com coaching",
          "desc": "Estudo para uma academia fictícia que junta treino guiado, coaching e comunidade, para quem nunca conseguiu manter constância.",
          "longDesc": "Fôlego é uma academia fictícia criada como estudo de design. Fala com quem já começou e parou várias vezes: gente que precisa de alguém chamando pelo nome e de um plano claro. O site quer que essa pessoa marque o primeiro treino.\n\n\"Tudo para você treinar com constância\" apresenta coaching, comunidade e treino sob medida, \"Treino acessível para todos\" mostra os pacotes sem fidelidade e \"Acompanhe sua evolução de saúde\" exibe o painel de calorias e cargas. O laranja-vermelho e o verde-limão funcionam como cores de uniforme esportivo.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/05-fitness/",
          "cover": "img/covers/folego.webp",
          "id": "folego",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "users",
              "title": "Comunidade antes do aparelho",
              "text": "Depoimentos e corrida de sábado aparecem antes da estrutura física. A academia se vende pelo grupo que cobra com carinho."
            },
            {
              "icon": "chart",
              "title": "Pacote ou aula avulsa",
              "text": "Dois cartões contrastantes mostram pacote de dez sessões e aula avulsa, sem matrícula. A decisão de preço cabe numa olhada."
            },
            {
              "icon": "gauge",
              "title": "Evolução visível",
              "text": "Um bloco simula o painel com calorias do dia e progresso de cargas. Mostra que o coach acompanha de verdade, não só passa ficha."
            },
            {
              "icon": "palette",
              "title": "Laranja e limão de uniforme",
              "text": "Laranja-vermelho para ação e verde-limão para destaque, sobre fotos em preto e branco. A energia vem da cor, não de exclamação."
            }
          ],
          "lab": true,
          "accent": "#FF4A2A",
          "fonts": [
            "Inter"
          ],
          "sections": 7,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Destrave",
                "sub": "Promessa e primeiro treino"
              },
              {
                "label": "Hub de vida ativa",
                "sub": "Coaching, comunidade e depoimento"
              },
              {
                "label": "Planos",
                "sub": "Pacote de sessões ou aula avulsa"
              },
              {
                "label": "Evolução",
                "sub": "Painel de saúde e alunos"
              },
              {
                "label": "Treine com a gente",
                "sub": "Conteúdos e convite por e-mail"
              }
            ]
          },
          "signature": "O atleta correndo sobre uma faixa diagonal verde-limão, com um card de membro flutuando ao lado.",
          "goal": "Começar a treinar",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Garfo Verde · Home de app de delivery de restaurantes",
          "desc": "Estudo para um delivery fictício que reúne restaurantes do bairro, para quem quer pedir comida fresca a partir do próprio endereço.",
          "longDesc": "Garfo Verde é um marketplace fictício de delivery criado como estudo de design. Atende quem pede comida em casa com frequência e quer opções do bairro com prazo claro. O site tem uma ação dominante: digitar o endereço e encontrar comida.\n\nO campo de endereço fica no centro do herói. Depois vêm as \"Categorias\" em círculos com foto, o cupom de primeiro pedido e os \"Pratos mais pedidos\" com restaurante, tempo de entrega e nota. O fundo verde-escuro deixa o prato e o verde-folha da marca saltarem.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/06-delivery/",
          "cover": "img/covers/garfo-verde.webp",
          "id": "garfo-verde",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "search",
              "title": "Endereço como ponto de partida",
              "text": "A busca por endereço ocupa o lugar de destaque do herói. Tudo o que vem depois depende de saber onde a pessoa está."
            },
            {
              "icon": "layers",
              "title": "Categorias em um deslize",
              "text": "Pizza, japonesa, massas e sobremesas aparecem como pratos fotografados em círculo. Escolher o tipo de comida vira um gesto só."
            },
            {
              "icon": "chart",
              "title": "Cards com tudo para decidir",
              "text": "Cada prato mostra restaurante, minutos de entrega, nota e preço, com botão de adicionar. Dá para pedir sem abrir outra tela."
            },
            {
              "icon": "palette",
              "title": "Fundo escuro, comida acesa",
              "text": "O verde-escuro quase preto destaca as fotos. Anton nos títulos e Caveat no selo manuscrito dão um ar de feira."
            }
          ],
          "lab": true,
          "accent": "#8BC34A",
          "fonts": [
            "Anton",
            "Caveat",
            "Plus Jakarta Sans"
          ],
          "sections": 3,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Coma bem",
                "sub": "Busca pelo endereço de entrega"
              },
              {
                "label": "Categorias",
                "sub": "Tipos de comida em carrossel"
              },
              {
                "label": "Primeiro pedido",
                "sub": "Cupom de desconto para novos"
              },
              {
                "label": "Mais pedidos",
                "sub": "Pratos com tempo, nota e preço"
              },
              {
                "label": "Fique com fome",
                "sub": "Newsletter de cupons"
              }
            ]
          },
          "signature": "\"COMA BEM\" em letras gigantes, com um bowl colorido cobrindo o meio da palavra e um selo manuscrito de comida saudável.",
          "goal": "Encontrar comida",
          "niche": "comida",
          "mood": "dark"
        },
        {
          "title": "Alpendre Imóveis · Portal imobiliário para comprar, alugar e vender",
          "desc": "Estudo para um portal imobiliário fictício, para famílias que querem comprar, alugar ou vender com anúncio conferido e corretor dedicado.",
          "longDesc": "Alpendre Imóveis é um portal imobiliário fictício criado como estudo de design. O público são famílias procurando casa, e também quem quer vender sem dor de cabeça. O site precisa levar a pessoa a buscar um imóvel ou a deixar o contato com um corretor.\n\nA busca com abas de comprar, alugar e vender aparece logo no herói. \"Escolhida por 80 mil famílias\" explica anúncio conferido, corretor dedicado e visita sem fila, \"Encontre a casa dos seus sonhos\" traz filtros e cards de imóveis e \"Diga olá a dias mais leves, juntos\" fecha com o formulário. O âmbar da marca marca preços e botões.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/07-imobiliaria/",
          "cover": "img/covers/alpendre-imoveis.webp",
          "id": "alpendre-imoveis",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "search",
              "title": "Busca com três intenções",
              "text": "Comprar, alugar e vender ficam em abas acima do campo de bairro ou cidade. Cada visitante entra pelo próprio motivo."
            },
            {
              "icon": "shield",
              "title": "Anúncio conferido",
              "text": "Fotos, metragem e documentação são checadas por um corretor antes de ir ao ar. O portal se diferencia pela confiança no anúncio."
            },
            {
              "icon": "layers",
              "title": "Filtros e cards completos",
              "text": "Tipo, localização, data e preço ficam numa barra só. Cada card mostra quartos, banheiros, área e um selo de venda ou aluguel."
            },
            {
              "icon": "palette",
              "title": "Âmbar onde há dinheiro",
              "text": "O amarelo-âmbar aparece em preços, botões e no depoimento em destaque. O resto fica em cinza-pedra, como fachada de concreto."
            }
          ],
          "lab": true,
          "accent": "#FFA829",
          "fonts": [
            "League Spartan"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Lar que você ama",
                "sub": "Busca e imóvel em destaque"
              },
              {
                "label": "Como funciona",
                "sub": "Anúncio conferido e corretor"
              },
              {
                "label": "Encontre a casa",
                "sub": "Filtros e lista de imóveis"
              },
              {
                "label": "Clientes",
                "sub": "Depoimentos em cartões inclinados"
              },
              {
                "label": "Diga olá",
                "sub": "Formulário para falar com corretor"
              }
            ]
          },
          "signature": "A casa de madeira e concreto recortada no herói, com o card da Casa Ipê e setas âmbar para navegar entre imóveis.",
          "goal": "Buscar imóvel",
          "niche": "imovel",
          "mood": "light"
        },
        {
          "title": "Musgo Casa · Landing page de loja de móveis de design",
          "desc": "Estudo para uma loja fictícia de móveis de desenho atemporal, feitos em pequenos lotes, para quem quer mobiliar a casa comprando online.",
          "longDesc": "Musgo Casa é uma loja fictícia de móveis criada como estudo de design. Vende sofás, mesas e poltronas de madeira de reflorestamento para quem está montando ou renovando a casa e quer comprar pela internet sem medo. O site existe para levar essa pessoa ao catálogo e à compra.\n\nDepois do herói com contadores de catálogo e avaliações, os ambientes em destaque abrem caminho para \"Design moderno para qualquer orçamento\", com peças e preços. \"O que nos torna diferentes dos outros\" explica seleção, atendimento de designers e preço direto do estúdio. O verde-musgo aparece em botões e etiquetas, como uma planta no canto da sala.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/08-moveis/",
          "cover": "img/covers/musgo-casa.webp",
          "id": "musgo-casa",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Ambientes antes de produtos",
              "text": "Mesa de jantar, varanda e sofá aparecem em cenas montadas. O cliente vê a peça na casa antes de ver a ficha."
            },
            {
              "icon": "chart",
              "title": "Preço visível no catálogo",
              "text": "Cada peça mostra nome e preço sobre a foto, com botão de carrinho. Parcelamento e garantia aparecem logo no título da seção."
            },
            {
              "icon": "users",
              "title": "Designer de plantão",
              "text": "Atendimento de especialista ajuda a escolher medidas e tecidos por vídeo ou na loja. Comprar móvel online fica menos arriscado."
            },
            {
              "icon": "palette",
              "title": "Verde-musgo e madeira",
              "text": "O verde da marca conversa com as plantas das fotos. Ilustrações 3D suaves dão leveza aos diferenciais."
            }
          ],
          "lab": true,
          "accent": "#679936",
          "fonts": [
            "Inter"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Casa dos sonhos",
                "sub": "Sala em destaque e números da loja"
              },
              {
                "label": "Ambientes",
                "sub": "Jantar, varanda e sofá"
              },
              {
                "label": "Catálogo",
                "sub": "Peças com preço e carrinho"
              },
              {
                "label": "Diferenciais",
                "sub": "Seleção, especialista e preço"
              },
              {
                "label": "Comprar agora",
                "sub": "Chamada final e newsletter"
              }
            ]
          },
          "signature": "A sala clara com sofá e poltrona, encaixada num recorte com uma barra verde-musgo de números no canto.",
          "goal": "Comprar móveis",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Arco Estúdio · Site de agência de branding e digital",
          "desc": "Estudo para uma agência fictícia de branding e marketing digital, voltado a empresas que precisam de marca e campanha no mesmo time.",
          "longDesc": "Arco Estúdio é uma agência fictícia criada como estudo de design. Fala com donos de negócio e times de marketing que querem estratégia, identidade e mídia paga feitas por uma só equipe. O site precisa terminar em um e-mail de projeto.\n\n\"Soluções inovadoras de branding\" lista os serviços como acordeão numerado, \"Nossos projetos mais recentes\" mostra cases fictícios como Leite Lunar e \"Tem um projeto? Vamos conversar\" fecha em fundo azul-noite. O violeta-índigo da marca domina blocos inteiros, dando ao site cara de pôster.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/09-agencia/",
          "cover": "img/covers/arco-estudio.webp",
          "id": "arco-estudio",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Serviços como índice",
              "text": "Estratégia, identidade, marketing, mídia paga e dados viram uma lista numerada que abre no clique. O cliente acha o que precisa sem rolar um texto longo."
            },
            {
              "icon": "sparkles",
              "title": "Cases com produto à mostra",
              "text": "Embalagens e identidades aparecem em cards com o nome do cliente fictício. O trabalho fala antes da descrição."
            },
            {
              "icon": "users",
              "title": "Prova social em duas camadas",
              "text": "Depoimentos com foto ficam ao lado de uma faixa de logos de empresas atendidas. Uma reforça a outra."
            },
            {
              "icon": "palette",
              "title": "Índigo em bloco inteiro",
              "text": "O violeta-índigo não é detalhe: ocupa seções inteiras, alternando com azul-noite e branco. Karla dá um tom técnico e amigável."
            }
          ],
          "lab": true,
          "accent": "#4F4AD7",
          "fonts": [
            "Karla"
          ],
          "sections": 5,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Estúdio criativo",
                "sub": "Manifesto, case e números"
              },
              {
                "label": "Como trabalhamos",
                "sub": "Imersão no negócio e vídeo"
              },
              {
                "label": "Soluções",
                "sub": "Serviços em lista que se abre"
              },
              {
                "label": "Projetos",
                "sub": "Cases recentes e chamada"
              },
              {
                "label": "Vamos conversar",
                "sub": "Depoimentos e e-mail do estúdio"
              }
            ]
          },
          "signature": "\"ESTÚDIO CRIATIVO\" em letras pesadas com uma pequena imagem em pílula entre as palavras, sobre \"BRANDING & DIGITAL\" em traço fino.",
          "goal": "Começar um projeto",
          "niche": "criativo",
          "mood": "light"
        },
        {
          "title": "Andalá Viagens · Landing page de agência de viagens em família",
          "desc": "Estudo para uma agência fictícia de viagens em família, para pais que querem férias com criança sem passar semanas planejando.",
          "longDesc": "Andalá Viagens é uma agência fictícia criada como estudo de design. O público são pais e mães que querem viajar com os filhos, mas travam na logística: berço, traslado, ritmo de criança. O site quer que essa família peça um roteiro.\n\n\"Não sabe para onde ir?\" oferece tipos de viagem como praia e montanha, \"Sua viagem em 4 passos\" mostra o processo e \"Por que viajar com a Andalá\" detalha consultora única, traslado com cadeirinha e preço fechado. O azul-céu e as fotos de família na praia dão o tom leve, sem cara de pacote turístico.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/10-viagens/",
          "cover": "img/covers/andala-viagens.webp",
          "id": "andala-viagens",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "search",
              "title": "Busca pensada para família",
              "text": "A barra de busca já tem o campo de viajantes, como \"Família de 4\", ao lado de destino e datas. A criança entra na conta desde o primeiro filtro."
            },
            {
              "icon": "layers",
              "title": "Processo em quatro passos",
              "text": "Contar sobre a família, receber o roteiro, ajustar e só aproveitar. Números grandes deixam o caminho claro antes de qualquer conversa."
            },
            {
              "icon": "shield",
              "title": "Detalhes que pais perguntam",
              "text": "Quartos conjugados, ritmo de criança, cadeirinha no traslado e suporte 24h ganham cartões próprios. São as dúvidas que travam a compra."
            },
            {
              "icon": "palette",
              "title": "Azul-céu e família real",
              "text": "O azul-claro aparece no oceano e nos detalhes. Bricolage Grotesque dá um ar caloroso, longe do visual de companhia aérea."
            }
          ],
          "lab": true,
          "accent": "#639CCC",
          "fonts": [
            "Bricolage Grotesque"
          ],
          "sections": 7,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Mais tempo junto",
                "sub": "Promessa e busca de viagem"
              },
              {
                "label": "Para onde ir",
                "sub": "Tipos de destino em carrossel"
              },
              {
                "label": "4 passos",
                "sub": "Do contato à volta para casa"
              },
              {
                "label": "Por que a Andalá",
                "sub": "Diferenciais e destinos favoritos"
              },
              {
                "label": "Próximas férias",
                "sub": "E-mail para receber o roteiro"
              }
            ]
          },
          "signature": "\"Viagem em família\" em letras enormes atravessando a foto de um pai erguendo o filho na praia.",
          "goal": "Planejar a viagem",
          "niche": "viagem",
          "mood": "light"
        },
        {
          "title": "Liana Nutri · E-commerce de suplementos de imunidade",
          "desc": "Estudo para uma marca fictícia de suplementos com fórmula aberta e laudo por lote, para quem quer cuidar da imunidade com informação.",
          "longDesc": "Liana Nutri é uma marca fictícia de suplementos criada como estudo de design. Fala com quem lê rótulo, desconfia de promessa milagrosa e quer saber o que está tomando. O site precisa levar essa pessoa a comprar um frasco, a partir do Calma Imune em destaque.\n\n\"Seu sistema imune está exposto o tempo todo\" explica a necessidade sem alarme, a seção de formas biodisponíveis mostra as cápsulas lado a lado e \"Suplementos /iana\" traz filtros por benefício e ingrediente. O verde-floresta dos frascos se repete nas fotos de folhagem, ligando produto e natureza.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/11-suplementos/",
          "cover": "img/covers/liana-nutri.webp",
          "id": "liana-nutri",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "search",
              "title": "Filtro por benefício",
              "text": "A loja deixa filtrar por benefício, ingrediente e tipo de fórmula. Quem chega com um objetivo acha o frasco certo sem ler tudo."
            },
            {
              "icon": "shield",
              "title": "Transparência como argumento",
              "text": "Fórmula aberta, laudo por lote e cápsula vegana aparecem como rótulos fixos. A marca se vende pelo que mostra, não pelo que promete."
            },
            {
              "icon": "layers",
              "title": "Ciência em linguagem simples",
              "text": "Os fatores que pesam na imunidade viram uma lista curta com fotos. A explicação vem antes da venda, sem jargão."
            },
            {
              "icon": "palette",
              "title": "Frasco e folhagem",
              "text": "Cada frasco tem sua cor, mas o verde-floresta domina. Os depoimentos usam fotos dos produtos em folhagem, não rostos de banco de imagem."
            }
          ],
          "lab": true,
          "accent": "#1F3B2A",
          "fonts": [
            "Instrument Sans"
          ],
          "sections": 7,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Defesa natural",
                "sub": "Calma Imune com preço e compra"
              },
              {
                "label": "Exposição diária",
                "sub": "Por que a imunidade precisa de apoio"
              },
              {
                "label": "Biodisponível",
                "sub": "Cápsulas e ingredientes"
              },
              {
                "label": "Suplementos",
                "sub": "Loja com filtros"
              },
              {
                "label": "Quem usa",
                "sub": "Depoimentos em cards de folhagem"
              }
            ]
          },
          "signature": "O wordmark \"/iana\" enorme no meio da página, com a barra em verde, ladeado por rótulos de fórmula aberta e laudo por lote.",
          "goal": "Comprar suplemento",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Alento · Landing page de programa de bem-estar diário",
          "desc": "Estudo para uma plataforma fictícia de bem-estar que sugere um passo por dia, para quem se perde no excesso de conselhos de saúde.",
          "longDesc": "Alento é uma plataforma fictícia de bem-estar criada como estudo de design. O público é quem já sabe o que deveria fazer pela saúde, mas trava na hora de escolher. O site quer que essa pessoa faça a avaliação inicial.\n\nO texto \"A maioria das pessoas não falha no autocuidado. Falha em decidir o que fazer hoje\" define o problema. \"Como ajudamos você a ficar bem, com realismo\" mostra o registro diário de dois minutos e o painel de sugestões aceitas, e os depoimentos fecham em fundo verde-escuro. O verde-menta aparece só em pontos de ação.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/12-wellness/",
          "cover": "img/covers/alento.webp",
          "id": "alento",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Um problema bem dito",
              "text": "A frase sobre não saber o que fazer hoje é o centro do site. O produto é apresentado como resposta a ela, não como mais um app de hábito."
            },
            {
              "icon": "gauge",
              "title": "Registro de dois minutos",
              "text": "Três perguntas pela manhã, padrões da semana e lembretes gentis. A rotina pedida é pequena o bastante para caber num ônibus."
            },
            {
              "icon": "chart",
              "title": "Painel que prova o método",
              "text": "Um gráfico em fundo escuro mostra sugestões aceitas ao longo dos meses. É o único momento de número numa página de tom calmo."
            },
            {
              "icon": "palette",
              "title": "Pôr do sol e verde-menta",
              "text": "Fotos de luz quente fazem o clima, e o verde-menta fica nos detalhes de ação. O fechamento em verde-escuro dá peso aos relatos."
            }
          ],
          "lab": true,
          "accent": "#1FBF7A",
          "fonts": [
            "Inter"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Equilíbrio possível",
                "sub": "Promessa e vídeo de como funciona"
              },
              {
                "label": "O problema",
                "sub": "Decidir o que fazer hoje"
              },
              {
                "label": "Registro diário",
                "sub": "Perguntas, padrões e lembretes"
              },
              {
                "label": "Apoio e painel",
                "sub": "Sugestões e continuidade sem culpa"
              },
              {
                "label": "Vidas reais",
                "sub": "Depoimentos e temas"
              }
            ]
          },
          "signature": "\"Equilíbrio possível\" centralizado sobre a silhueta de uma pessoa em postura de ioga contra o pôr do sol.",
          "goal": "Fazer avaliação",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Mente Calma · Landing page de app de saúde mental",
          "desc": "Estudo para um app fictício de meditação e diário de humor com psicólogos parceiros, para quem tem poucos minutos livres no dia.",
          "longDesc": "Mente Calma é um app fictício de saúde mental criado como estudo de design. Fala com quem vive no automático e acha que meditar exige tempo que não tem. O site quer que a pessoa baixe o app ou agende uma sessão com psicólogo parceiro.\n\n\"Pausas guiadas para qualquer hora do dia\" mostra áudios de 2 a 10 minutos, \"Cultive uma mente mais saudável nos ambientes do dia a dia\" liga cada pausa a um momento real e \"Escolha o ritmo que cabe na sua rotina\" apresenta os planos. O FAQ deixa claro que o app não substitui terapia. Nuvens lilases e verde-sálvia dão a leveza.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/13-mente-calma/",
          "cover": "img/covers/mente-calma.webp",
          "id": "mente-calma",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Pausas com duração na capa",
              "text": "Cada áudio mostra os minutos no topo do card, de 2 a 10. A pessoa escolhe pelo tempo que tem, não pelo nome da técnica."
            },
            {
              "icon": "users",
              "title": "Psicólogo quando precisar",
              "text": "Além dos áudios, o app oferece sessões por vídeo com profissionais parceiros. O plano Completo inclui duas por mês."
            },
            {
              "icon": "shield",
              "title": "Limites ditos com clareza",
              "text": "O FAQ responde de cara que o app não substitui terapia e indica onde buscar ajuda em crise. Responsabilidade vira parte do design."
            },
            {
              "icon": "palette",
              "title": "Céu lilás, verde-sálvia",
              "text": "Nuvens em tons de rosa e lilás abrem o site, e o verde-sálvia marca as ações. Nada grita, como deveria ser num app de calma."
            }
          ],
          "lab": true,
          "accent": "#5E9473",
          "fonts": [
            "Inter"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Mente calma",
                "sub": "Mascote, promessa e primeiro passo"
              },
              {
                "label": "Ferramentas",
                "sub": "Exercícios, jornada e comunidade"
              },
              {
                "label": "Pausas guiadas",
                "sub": "Áudios por duração"
              },
              {
                "label": "Planos",
                "sub": "Livre, Plus e Completo"
              },
              {
                "label": "Perguntas",
                "sub": "FAQ e aviso sobre terapia"
              }
            ]
          },
          "signature": "Uma bolsinha verde com rosto sorridente flutuando entre nuvens rosadas, com um card de tarefas do dia ao lado.",
          "goal": "Dar o primeiro passo",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Lastro · Landing page de SaaS de gestão financeira com IA",
          "desc": "Estudo para um SaaS fictício de finanças com IA, para times financeiros que lidam com várias contas e moedas e vivem de planilha paralela.",
          "longDesc": "Lastro é um SaaS fictício de gestão financeira criado como estudo de design. O público são gestores financeiros de pequenas e médias empresas que conciliam contas, moedas e DRE à mão. O site precisa levar esse gestor a começar o teste grátis ou pedir demonstração.\n\nO painel \"Visão geral\" aparece inteiro logo abaixo do título, \"Tudo o que o financeiro precisa, sem planilha paralela\" detalha carteira multimoeda e DRE em tempo real, a seção de integrações mostra os conectores e \"Planos que crescem junto com a sua operação\" fecha com três planos. Pedras com musgo e samambaias dão textura a um tema que costuma ser frio.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/14-saas-financas/",
          "cover": "img/covers/lastro.webp",
          "id": "lastro",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "chart",
              "title": "Produto mostrado de cara",
              "text": "O painel com saldo, carteiras, fluxo de caixa e margem aparece logo no herói. O gestor entende o produto antes de ler qualquer recurso."
            },
            {
              "icon": "globe",
              "title": "Várias moedas num saldo",
              "text": "Real, dólar, euro e libra convivem num mesmo card com câmbio do dia. Atende quem opera fora do Brasil sem trocar de sistema."
            },
            {
              "icon": "layers",
              "title": "Planos lado a lado",
              "text": "Essencial, Profissional em destaque e Corporativo sob consulta, com limites claros. O teste de 14 dias sem cartão reduz o atrito."
            },
            {
              "icon": "palette",
              "title": "Musgo num tema frio",
              "text": "Fundo de nuvem em cinza, pedras com musgo e o verde-oliva da marca. Finanças ganham um ar de solidez, que é o próprio sentido de lastro."
            }
          ],
          "lab": true,
          "accent": "#5E7D2A",
          "fonts": [
            "Outfit"
          ],
          "sections": 10,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Próximo nível",
                "sub": "Promessa, teste e demonstração"
              },
              {
                "label": "Visão geral",
                "sub": "Painel completo e logos"
              },
              {
                "label": "Recursos",
                "sub": "Multimoeda e DRE em tempo real"
              },
              {
                "label": "Integrações",
                "sub": "Conectores com bancos e ERPs"
              },
              {
                "label": "Planos",
                "sub": "Três níveis e newsletter"
              }
            ]
          },
          "signature": "O painel financeiro em tela cheia apoiado numa pedra coberta de musgo, com uma samambaia surgindo por trás.",
          "goal": "Testar grátis",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "Assenta · E-commerce de cadeiras e poltronas de design",
          "desc": "Estudo para uma marca fictícia de cadeiras e poltronas de design, para quem quer uma peça que dure décadas e escolhe cor e tecido.",
          "longDesc": "Assenta é uma marca fictícia de cadeiras e poltronas criada como estudo de design. Fala com quem monta a casa ou o escritório com calma e prefere uma peça boa a três ruins. O site quer levar essa pessoa à coleção e à compra.\n\n\"VALORES\" apresenta personalização, sustentabilidade e conforto em etiquetas presas à banqueta, \"COLEÇÃO DE CADEIRAS\" filtra os doze modelos por ambiente e \"CATEGORIAS\" mostra a cadeira de escritório numa sala real com ficha técnica. O verde-limão sobre preto e branco deixa tudo com cara de cartaz.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/15-cadeiras/",
          "cover": "img/covers/assenta.webp",
          "id": "assenta",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Produto contra a tipografia",
              "text": "Cada seção coloca uma cadeira recortada sobre um título enorme em Anton. O móvel vira personagem, não item de catálogo."
            },
            {
              "icon": "layers",
              "title": "Coleção por ambiente",
              "text": "Os modelos filtram por trabalho, sala de estar e sala de jantar, em carrossel com preço. A escolha começa pelo lugar onde a cadeira vai ficar."
            },
            {
              "icon": "gauge",
              "title": "Ficha que responde dúvidas",
              "text": "A cadeira de escritório traz material, apoio lombar, altura e giro num card branco. É o que se pergunta antes de comprar sem sentar."
            },
            {
              "icon": "palette",
              "title": "Limão, preto e verde-musgo",
              "text": "O verde-limão e o preto dão energia de cartaz, e o verde-musgo das poltronas acalma. As etiquetas em pílula parecem tags de loja."
            }
          ],
          "lab": true,
          "accent": "#B5D97A",
          "fonts": [
            "Anton",
            "Inter Tight"
          ],
          "sections": 3,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Cadeiras",
                "sub": "Poltrona em destaque e preço"
              },
              {
                "label": "Valores",
                "sub": "Personalização, ética e conforto"
              },
              {
                "label": "Coleção",
                "sub": "Modelos filtrados por ambiente"
              },
              {
                "label": "Categorias",
                "sub": "Escritório em cena real"
              },
              {
                "label": "Newsletter",
                "sub": "Lançamentos e novos tecidos"
              }
            ]
          },
          "signature": "A palavra \"CADEIRAS\" em verde-limão gigante no topo, com uma poltrona verde-musgo cortando as letras.",
          "goal": "Ver a coleção",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Breu Cold Brew · E-commerce de cold brew engarrafado",
          "desc": "Estudo para uma marca fictícia de cold brew engarrafado, para quem quer café especial gelado pronto na geladeira, sem açúcar.",
          "longDesc": "Breu Cold Brew é uma marca fictícia de café extraído a frio criada como estudo de design. Atende quem toma café gelado com frequência e quer algo pronto, sem açúcar e com grão especial. O site precisa levar essa pessoa a escolher um sabor e comprar.\n\nGrão e extração lenta são explicados em blocos alternados de foto e texto, \"Encontre o seu cold brew\" mostra três sabores com preço e \"Energia para o seu dia com a Breu\" aprofunda preparo e grãos dentro de arcos laranja. A newsletter fecha com desconto no primeiro pedido. O laranja vivo aparece em traços finos, como um contorno.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/16-cold-brew/",
          "cover": "img/covers/breu-cold-brew.webp",
          "id": "breu-cold-brew",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Três sabores, sem labirinto",
              "text": "Preto Puro, Mocha Firme e Aveia Gelado aparecem com descrição curta, preço e botão de pedido. A loja inteira cabe numa linha."
            },
            {
              "icon": "search",
              "title": "O processo como argumento",
              "text": "Horas de extração, filtragem dupla e grão de pequenos produtores ganham seções próprias. Quem paga mais por café quer saber o porquê."
            },
            {
              "icon": "sparkles",
              "title": "Arcos como moldura",
              "text": "Fotos de copo e grãos ficam dentro de arcos laranja que lembram o contorno de um copo. O mesmo traço volta na newsletter."
            },
            {
              "icon": "palette",
              "title": "Serifa clássica, laranja vivo",
              "text": "DM Serif Display no título dá ar de cafeteria, e o laranja aparece só em linhas e botões. O fundo branco deixa o café ser a cor."
            }
          ],
          "lab": true,
          "accent": "#FF6B00",
          "fonts": [
            "DM Serif Display",
            "Plus Jakarta Sans",
            "Quicksand"
          ],
          "sections": 7,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Cold Brew",
                "sub": "Copo em destaque e preço"
              },
              {
                "label": "Fazendo sucesso",
                "sub": "Números da marca"
              },
              {
                "label": "Grão e extração",
                "sub": "Como o café é feito"
              },
              {
                "label": "Sabores",
                "sub": "Três garrafas com preço"
              },
              {
                "label": "Newsletter",
                "sub": "Depoimentos e desconto"
              }
            ]
          },
          "signature": "\"Cold Brew\" em serifa fina, com o copo de café e leite se misturando bem no meio das letras.",
          "goal": "Comprar cold brew",
          "niche": "comida",
          "mood": "light"
        },
        {
          "title": "Colo · Landing page de cuidados com recém-nascidos",
          "desc": "Estudo para um serviço fictício de orientação e kit de cuidados para bebês, voltado a pais de primeira viagem nos primeiros meses.",
          "longDesc": "Colo é um serviço fictício de cuidados com recém-nascidos criado como estudo de design. Junta orientação de enfermeiras e consultoras de amamentação com um kit mensal de itens essenciais. O público são pais de primeira viagem, cansados e cheios de dúvida. O site quer que eles falem com uma especialista.\n\n\"O cuidado diário de que eles precisam\" organiza banho, fraldas, sono e alimentação em acordeão, \"Feito pensando nos bebês\" mostra fórmulas, chat e kit, e \"Perguntas frequentes\" deixa claro que o Colo não substitui o pediatra. O azul-elétrico corta um site quase todo branco e macio.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/17-bebe/",
          "cover": "img/covers/colo.webp",
          "id": "colo",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "users",
              "title": "Gente de verdade do outro lado",
              "text": "Enfermeiras e consultoras respondem por chat, com horário informado. Para pais exaustos, saber que há alguém disponível pesa mais que o produto."
            },
            {
              "icon": "layers",
              "title": "Rotina em perguntas",
              "text": "Banho, troca de fraldas, sono e alimentação abrem como acordeão, com um guia curto em cada. A informação chega quando a dúvida aparece."
            },
            {
              "icon": "shield",
              "title": "Sem prometer demais",
              "text": "O FAQ responde logo que o serviço não substitui o pediatra. A honestidade é parte do que gera confiança nesse público."
            },
            {
              "icon": "palette",
              "title": "Branco macio, azul preciso",
              "text": "Nuvens, fotos claras de bebê e cantos arredondados fazem o clima. O azul-elétrico só aparece onde há uma ação a tomar."
            }
          ],
          "lab": true,
          "accent": "#0055FF",
          "fonts": [
            "Bricolage Grotesque"
          ],
          "sections": 7,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Começo precioso",
                "sub": "Promessa e contato com especialista"
              },
              {
                "label": "Além do essencial",
                "sub": "Orientação, rotina e itens"
              },
              {
                "label": "Cuidado diário",
                "sub": "Guias por tarefa em acordeão"
              },
              {
                "label": "Feito para bebês",
                "sub": "Fórmulas, chat e kit"
              },
              {
                "label": "Famílias e FAQ",
                "sub": "Relatos, dúvidas e chamada final"
              }
            ]
          },
          "signature": "Um pai erguendo o bebê contra um céu de nuvens, com cards de foco no bebê e cuidado gentil flutuando ao redor.",
          "goal": "Falar com especialista",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Lume Casa · Landing page de dispositivos de casa inteligente",
          "desc": "Estudo para uma marca fictícia de aparelhos de casa inteligente com IA, para quem quer automação sem configurar app por app.",
          "longDesc": "Lume Casa é uma marca fictícia de dispositivos de casa inteligente criada como estudo de design. Fala com quem gosta da ideia de automação, mas desiste diante de cinco apps e muita configuração. O site quer que essa pessoa responda três perguntas e receba um kit sugerido.\n\n\"Conheça um jeito mais inteligente de viver\" explica aprendizado de hábitos, privacidade e integração, \"Descubra os dispositivos mais recentes para casa\" apresenta os produtos em carrossel numerado e \"Uma vida mais inteligente começa com um clique\" fecha com o app na mão. O amarelo-limão neon dá vida a um site quase todo bege e cinza.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/18-smart-device/",
          "cover": "img/covers/lume-casa.webp",
          "id": "lume-casa",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Aparelho como objeto",
              "text": "Os dispositivos aparecem como peças de decoração, em pedestais e luz suave. A tecnologia se vende por sumir na casa, não por parecer gadget."
            },
            {
              "icon": "shield",
              "title": "Privacidade em destaque",
              "text": "Um card amarelo diz que os dados são processados no próprio aparelho. É a objeção mais comum de quem hesita em pôr câmera em casa."
            },
            {
              "icon": "layers",
              "title": "Catálogo numerado",
              "text": "Luminárias e climatização aparecem em cards grandes numerados, um por vez. Cada produto tem espaço para explicar o que faz sozinho."
            },
            {
              "icon": "palette",
              "title": "Bege calmo, limão elétrico",
              "text": "O fundo bege e cinza é quase de loja de móveis, e o amarelo-limão marca visores e botões. O contraste lembra uma luz acesa."
            }
          ],
          "lab": true,
          "accent": "#E8F65A",
          "fonts": [
            "Inter"
          ],
          "sections": 5,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Casa inteligente",
                "sub": "Termostato e promessa"
              },
              {
                "label": "Jeito mais inteligente",
                "sub": "Hábitos, privacidade e integração"
              },
              {
                "label": "Dispositivos",
                "sub": "Produtos em carrossel numerado"
              },
              {
                "label": "O que dizem",
                "sub": "Depoimento e estudo de caso"
              },
              {
                "label": "Um clique",
                "sub": "Três perguntas e kit sugerido"
              }
            ]
          },
          "signature": "Um termostato creme estilo rádio retrô sobre um pedestal de pedra, com o visor em amarelo-limão marcando 21°.",
          "goal": "Montar seu kit",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "Brisa · Landing page de app de saúde mental",
          "desc": "Estudo de landing para a Brisa, app fictício que junta diário de humor e sessões com psicólogos para quem quer cuidar da mente sem pressão.",
          "longDesc": "Brisa é uma marca fictícia criada para este estudo: um app de saúde mental que reúne diário guiado, registro de humor e sessões com psicólogos. O público é gente adulta que adia o cuidado com a cabeça por achar complicado. O site existe para levar essa pessoa a baixar o app.\n\nA página começa com \"Um canto calmo para cuidar da sua mente\" sobre um céu de nuvens, passa pelos selos de privacidade, mostra o produto em \"Ferramentas que acompanham o seu ritmo\" e fecha com \"Seu apoio, onde você estiver\", centrado no celular. O verde-sálvia e o céu aberto tiram qualquer cara de clínica.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/19-terapia-app/",
          "cover": "img/covers/brisa.webp",
          "id": "brisa",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Céu e verde-sálvia no lugar do branco",
              "text": "O herói e o rodapé usam nuvens e um gramado aberto em vez do branco hospitalar. O verde-sálvia aparece só em botões e selos, para o tom continuar sereno."
            },
            {
              "icon": "shield",
              "title": "Selos que respondem ao medo",
              "text": "Logo após o herói, quatro coroas de louros falam de privacidade, psicólogos com registro e dados criptografados. É a primeira dúvida de quem vai escrever sobre o que sente."
            },
            {
              "icon": "layers",
              "title": "O app mostrado em blocos",
              "text": "Um bento verde mostra sessões no mês, calendário de humor, rotina do diário e uma sessão agendada. O visitante entende o produto sem ler um parágrafo."
            },
            {
              "icon": "users",
              "title": "Depoimento com rosto e pausa",
              "text": "Um carrossel de relatos ilustrativos traz frase grande e foto em close. O rodapé reforça que o app não substitui atendimento e indica o CVV."
            }
          ],
          "lab": true,
          "accent": "#5E8A5A",
          "fonts": [
            "Manrope"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Céu de abertura",
                "sub": "Promessa de calma e cartões do app"
              },
              {
                "label": "Selos e parceiros",
                "sub": "Privacidade e integrações"
              },
              {
                "label": "Ferramentas",
                "sub": "Bento com humor, sessões e diário"
              },
              {
                "label": "No celular",
                "sub": "Diário de voz e check-in de humor"
              },
              {
                "label": "Relato e contato",
                "sub": "Depoimento e canal de ajuda"
              }
            ]
          },
          "signature": "Uma mulher de olhos fechados contra um céu de nuvens, cercada por cartões flutuantes de humor, respiração e próxima sessão.",
          "goal": "Baixar o app",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Ventara · Landing page de coleção de carros esportivos",
          "desc": "Estudo de landing para a Ventara, coleção fictícia de esportivos e grand tourers para quem quer comprar ou dirigir um carro especial.",
          "longDesc": "Ventara é uma revenda fictícia de esportivos e grand tourers, inventada para este estudo. O público é quem sonha com um carro especial mas não quer um processo longo de compra. A ação que importa é agendar um test drive.\n\nA página abre com \"FEITO PARA DESAFIAR LIMITES\" em letras condensadas enormes sobre a foto do Éter GT, mostra o estoque em \"Encontre seu próximo carro\", explica o atendimento em \"Mais do que só dirigir\" e dedica uma faixa escura a \"FEITO PARA PERFORMAR\", com pontos clicáveis sobre o carro. O contraste entre faixas claras e pretas dá ritmo de catálogo de revista.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/20-carros/",
          "cover": "img/covers/ventara.webp",
          "id": "ventara",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Anton enorme contra fotos frias",
              "text": "O título condensado ocupa metade da largura e as fotos puxam para cinza e azul-aço. O resultado lembra uma capa de revista de automóvel."
            },
            {
              "icon": "search",
              "title": "Estoque em cartões curtos",
              "text": "Cada carro aparece com nome, categoria e um selo de disponível ou test drive. Um cartão final mostra quantos veículos há na coleção."
            },
            {
              "icon": "gauge",
              "title": "Ficha técnica no herói",
              "text": "Aceleração de 0 a 100 e potência aparecem já na primeira dobra, junto com a vista 360°. Quem gosta de carro recebe o número antes do texto."
            },
            {
              "icon": "sparkles",
              "title": "Pontos sobre a lateral",
              "text": "Na faixa escura, marcadores sobre o carro abrem detalhes de rodas, freios e suspensão. É um jeito de mostrar engenharia sem lista de especificações."
            }
          ],
          "lab": true,
          "accent": "#5B8BAA",
          "fonts": [
            "Anton",
            "Sora"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói Éter GT",
                "sub": "Título, foto e ficha técnica"
              },
              {
                "label": "Coleção",
                "sub": "Carros disponíveis e test drive"
              },
              {
                "label": "Como funciona",
                "sub": "Curadoria e compra sem esforço"
              },
              {
                "label": "Performance",
                "sub": "Detalhes clicáveis sobre o carro"
              },
              {
                "label": "Equipe",
                "sub": "Manifesto e contato"
              }
            ]
          },
          "signature": "O título em Anton gigante, colado na foto do esportivo branco com ficha técnica e botão de vista 360°.",
          "goal": "Agendar test drive",
          "niche": "auto",
          "mood": "light"
        },
        {
          "title": "Lumiar Odontologia · Site de clínica odontológica familiar",
          "desc": "Estudo de site para a Lumiar, clínica odontológica fictícia que atende a família inteira, com conversa por vídeo antes da primeira visita.",
          "longDesc": "Lumiar Odontologia é uma clínica de bairro fictícia, criada para este estudo, que atende pais, filhos e avós na mesma agenda. O público é a família que quer resolver o check-up de todo mundo sem surpresa. O site precisa levar a pessoa a agendar uma consulta ou uma conversa por vídeo.\n\nDepois do herói \"Odontologia para toda a família\", a página mostra o dentista responsável em \"Odontologia avançada para um sorriso mais saudável\", reúne motivos em \"Por que escolher a Lumiar\" e fecha com artigos e um cadastro de lembretes. O azul-turquesa aparece pouco, só onde há algo para clicar.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/21-clinica-dental/",
          "cover": "img/covers/lumiar-odontologia.webp",
          "id": "lumiar-odontologia",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "users",
              "title": "Conversa por vídeo antes de ir",
              "text": "O cartão do dentista simula uma chamada com botões de câmera e microfone. Mostra que a primeira dúvida pode ser tirada de casa, com fotos pelo WhatsApp."
            },
            {
              "icon": "chart",
              "title": "Plano de cuidado em etapas",
              "text": "Uma régua com avaliação, plano, tratamento e manutenção acompanha a dobra inicial. O paciente sabe em que ponto está antes de marcar."
            },
            {
              "icon": "sparkles",
              "title": "Recompensas por check-up",
              "text": "Um cartão turquesa explica que cada check-up em dia vale uma estrela e dá prioridade na agenda. É um motivo concreto para voltar."
            },
            {
              "icon": "palette",
              "title": "Turquesa só no que se clica",
              "text": "O resto da página fica em branco e cinza claro, com títulos em duas cores. O turquesa marca botões e destaques, e guia o olho até a agenda."
            }
          ],
          "lab": true,
          "accent": "#2BB0C9",
          "fonts": [
            "Inter"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói da clínica",
                "sub": "Promessa e botão de agendar"
              },
              {
                "label": "Etapas do cuidado",
                "sub": "Avaliação até manutenção"
              },
              {
                "label": "Equipe",
                "sub": "Dentista e consulta por vídeo"
              },
              {
                "label": "Por que a Lumiar",
                "sub": "Próteses, recompensas, lembretes"
              },
              {
                "label": "Dicas e contato",
                "sub": "Artigos e cadastro de lembrete"
              }
            ]
          },
          "signature": "Uma barra de quatro etapas logo abaixo do herói, da avaliação à manutenção, que avança como uma régua de progresso.",
          "goal": "Agendar consulta",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Morada · E-commerce de decoração e móveis",
          "desc": "Estudo de loja online para a Morada, marca fictícia de móveis e decoração em tons naturais para quem monta a casa aos poucos.",
          "longDesc": "Morada é uma loja fictícia de decoração, criada para este estudo, com poltronas, luminárias, vasos e mantas em tons naturais. O público é quem está montando ou renovando a casa e quer peças que combinem entre si. A ação principal é colocar produtos no carrinho.\n\nDepois de \"Decoração atemporal para morar bem\", a loja passa por \"Melhores escolhas para a sua casa\", \"Novidades\" e um destaque inteiro para a \"Poltrona Alba em linho oliva\", antes de \"Compre por categoria\" e \"Grandes ofertas\". O verde-oliva sobre fundo areia faz a loja parecer um showroom, não um marketplace.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/22-decoracao/",
          "cover": "img/covers/morada.webp",
          "id": "morada",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Oliva sobre areia",
              "text": "O fundo bege e os botões verde-oliva repetem as cores das próprias peças. A loja inteira parece um ambiente montado, não uma prateleira."
            },
            {
              "icon": "layers",
              "title": "Ambientes antes de produtos",
              "text": "A abertura vende coleções como Sala de Estar e Iluminação em fotos grandes. Só depois aparecem os cartões com preço, já com contexto de uso."
            },
            {
              "icon": "search",
              "title": "Categorias e cores à mão",
              "text": "Cada produto mostra bolinhas de cor e o preço antigo riscado. A grade por categoria leva direto a poltronas, vasos ou velas."
            },
            {
              "icon": "sparkles",
              "title": "Projeto de ambiente grátis",
              "text": "Perto do fim, um banner oferece montar a sala em uma semana. É um serviço que ajuda quem trava na hora de combinar as peças."
            }
          ],
          "lab": true,
          "accent": "#5A6B2A",
          "fonts": [
            "Plus Jakarta Sans"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Coleções",
                "sub": "Sala, decoração e iluminação"
              },
              {
                "label": "Melhores escolhas",
                "sub": "Kits e peças que combinam"
              },
              {
                "label": "Peça em destaque",
                "sub": "Poltrona Alba com preço"
              },
              {
                "label": "Categorias e ofertas",
                "sub": "Atalhos e descontos"
              },
              {
                "label": "Lookbook",
                "sub": "Ambientes e newsletter"
              }
            ]
          },
          "signature": "A Poltrona Alba em verde-oliva recortada na frente da palavra CASA em letras gigantes e esmaecidas.",
          "goal": "Comprar peças",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Mordida Chocolates · E-commerce de chocolate artesanal",
          "desc": "Estudo de loja para a Mordida, chocolataria fictícia de barras artesanais com sabores ousados, para quem compra para si ou para presentear.",
          "longDesc": "Mordida é uma chocolataria fictícia, criada para este estudo, que vende barras feitas à mão com cacau de origem e recheios fora do comum. O público compra para si ou monta caixas de presente. O site precisa vender barras e, de preferência, a caixa com seis sabores.\n\nO herói \"CHOCOLATE FEITO À MÃO PARA QUEM NÃO DIVIDE.\" vem em marrom-cacau com letras amarelas, seguido de \"CONHEÇA SEUS NOVOS FAVORITOS\", \"O QUE TEM DE BOM\" e depoimentos em \"NÃO ACREDITE SÓ NA NOSSA PALAVRA\". A tipografia condensada e as faixas rolando dão energia de loja de bairro com atitude.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/23-chocolate/",
          "cover": "img/covers/mordida-chocolates.webp",
          "id": "mordida-chocolates",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Marrom-cacau e amarelo-manteiga",
              "text": "O fundo lembra a própria barra e o amarelo destaca preço e ação. As embalagens fotografadas repetem essa paleta, então produto e site falam a mesma língua."
            },
            {
              "icon": "layers",
              "title": "Barras com cara de prateleira",
              "text": "Cada cartão mostra a embalagem, o sabor entre parênteses duplos e o preço. Selos de mais vendida e novo ajudam a escolher rápido."
            },
            {
              "icon": "sparkles",
              "title": "Caixa de seis como meta",
              "text": "O fim da loja traz \"Monte a sua caixa de 6\" ao lado das barras avulsas. O frete grátis acima de um valor empurra para a caixa."
            },
            {
              "icon": "users",
              "title": "Depoimento sobre a foto",
              "text": "O relato de cliente fica num cartão claro em cima de uma foto de chocolate quebrado. Dá prova social sem sair do clima da marca."
            }
          ],
          "lab": true,
          "accent": "#F5C76A",
          "fonts": [
            "League Gothic",
            "Outfit"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Promessa e barra em destaque"
              },
              {
                "label": "Favoritos",
                "sub": "Barras com preço e selo"
              },
              {
                "label": "Ingredientes",
                "sub": "O que vai em cada barra"
              },
              {
                "label": "Depoimentos",
                "sub": "Relatos de clientes"
              },
              {
                "label": "Loja e caixa",
                "sub": "Barras avulsas e caixa de 6"
              }
            ]
          },
          "signature": "Duas faixas cruzadas de texto rolando abaixo do herói, como fitas de embalagem com os nomes das coleções.",
          "goal": "Montar uma caixa",
          "niche": "comida",
          "mood": "light"
        },
        {
          "title": "Cardume · Landing page de SaaS de gestão de projetos",
          "desc": "Estudo de landing para a Cardume, SaaS fictício de gestão de projetos para times que querem sair das planilhas soltas.",
          "longDesc": "Cardume é um software fictício de gestão de projetos, criado para este estudo, para times pequenos e médios que hoje se organizam em planilhas e grupos de conversa. O site quer uma coisa: que o líder do time comece o teste grátis.\n\nDepois de \"GESTÃO TUDO EM UM DE PROJETOS PARA TIMES MODERNOS\", a página mostra o painel, explica em \"POR QUE TIMES ESCOLHEM A CARDUME\", lista recursos em \"Tudo o que o seu time precisa\" e apresenta os planos em \"Comece pequeno, cresça sem trocar de ferramenta\". O verde-limão sobre preto e branco deixa claro onde clicar.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/24-saas-times/",
          "cover": "img/covers/cardume.webp",
          "id": "cardume",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Pedra, notebook e anotação",
              "text": "O herói junta uma pedra real, o painel do produto e uma anotação manuscrita em Caveat. Foge do mockup flutuante comum em sites de software."
            },
            {
              "icon": "palette",
              "title": "Verde-limão como sinal",
              "text": "Preto, branco e um único verde-limão. O verde aparece nos botões, no plano recomendado e na última palavra dos títulos."
            },
            {
              "icon": "layers",
              "title": "Planos lado a lado",
              "text": "Três planos com alternância mensal e anual e o do meio em preto. O time vê de cara que pode começar de graça e crescer."
            },
            {
              "icon": "users",
              "title": "Prova social em números",
              "text": "Logos de empresas fictícias e um bloco escuro com times ativos e nota média ajudam a vencer a desconfiança de quem nunca ouviu falar da marca."
            }
          ],
          "lab": true,
          "accent": "#A6F06A",
          "fonts": [
            "Anton",
            "Caveat",
            "Inter"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Promessa e painel do produto"
              },
              {
                "label": "Por que a Cardume",
                "sub": "Menos reunião, mais entrega"
              },
              {
                "label": "Recursos",
                "sub": "Quadros, chat e automações"
              },
              {
                "label": "Planos",
                "sub": "Essencial, Time e Empresa"
              },
              {
                "label": "Chamada final",
                "sub": "Cadastro com email"
              }
            ]
          },
          "signature": "Um notebook com o painel equilibrado em cima de uma pedra, na frente da palavra SAAS em letras pretas gigantes.",
          "goal": "Testar grátis",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "Patalar · E-commerce pet com loja e serviços",
          "desc": "Estudo de loja para a Patalar, pet shop fictício que vende ração e acessórios e agenda banho, veterinário e hospedagem para cães e gatos.",
          "longDesc": "Patalar é um pet shop fictício, criado para este estudo, que junta loja online e centro de serviços. O público são tutores de cães e gatos que querem comprar e cuidar do pet no mesmo lugar. A ação principal é comprar; a secundária, agendar um serviço.\n\nO herói \"Tudo o que seu pet precisa para uma vida mais feliz e saudável.\" abre com um cão e um gato no sofá laranja, seguido da história em \"Começou com um cão sem raça\", da \"coleção premium\" por categoria e de \"Banho, saúde e hospedagem no mesmo lugar\". O laranja e a serifa Fraunces deixam tudo acolhedor.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/25-pet/",
          "cover": "img/covers/patalar.webp",
          "id": "patalar",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Laranja e serifa calorosa",
              "text": "O laranja vem do sofá da foto principal e volta nas embalagens da linha própria. Os títulos em Fraunces dão um tom de casa, não de prateleira."
            },
            {
              "icon": "shield",
              "title": "Garantias logo na entrada",
              "text": "Uma faixa abaixo do herói fala de entrega no mesmo dia, nota fiscal, Pix e suporte. Resolve as dúvidas de quem compra ração com pressa."
            },
            {
              "icon": "layers",
              "title": "Serviços com botão de agendar",
              "text": "Banho e tosa, veterinário, hospedagem e passeio em grupo têm cartão com foto e link de agendar. A loja vira também agenda do pet."
            },
            {
              "icon": "users",
              "title": "História com vídeo",
              "text": "A seção da origem traz o casal fundador com o cão e um botão de vídeo. Conta que a marca nasceu de um vira-lata, o que cria vínculo."
            }
          ],
          "lab": true,
          "accent": "#F26A1B",
          "fonts": [
            "DM Sans",
            "Fraunces"
          ],
          "sections": 7,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Promessa e garantias de compra"
              },
              {
                "label": "Nossa história",
                "sub": "Origem e vídeo"
              },
              {
                "label": "Coleção",
                "sub": "Rações, petiscos, brinquedos"
              },
              {
                "label": "Serviços",
                "sub": "Banho, veterinário, hospedagem"
              },
              {
                "label": "Primeira compra",
                "sub": "Cupom e lembrete de reposição"
              }
            ]
          },
          "signature": "Um golden retriever e um gato dividindo um sofá laranja, com uma bolinha no chão, ao lado do título em serifa.",
          "goal": "Comprar para o pet",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Lapidária Joias · Site de joalheria fina",
          "desc": "Estudo de site para a Lapidária, joalheria fictícia de peças em ouro 18k feitas à mão, para quem compra joia pensando em décadas.",
          "longDesc": "Lapidária Joias é uma joalheria fictícia, criada para este estudo, de anéis, colares e brincos feitos à mão em ouro 18k reciclado. O público compra pouco e com cuidado, muitas vezes para marcar uma data. O site precisa levar a pessoa a explorar a coleção e, depois, a assinar a lista.\n\nO nome da marca ocupa o herói inteiro em Bodoni sobre uma foto de anéis. Em seguida vêm \"uma seleção de JOIAS EXTRAORDINÁRIAS\", \"desenhadas COM INTENÇÃO\", \"nascidas do EXTRAORDINÁRIO\" e o Instagram. A mistura de itálico minúsculo com caixa alta espaçada faz cada título soar como gravação.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/26-joias/",
          "cover": "img/covers/lapidaria-joias.webp",
          "id": "lapidaria-joias",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Bodoni em dois registros",
              "text": "Cada título junta uma linha em itálico minúsculo e outra em caixa alta bem espaçada. Com o marrom-café e o creme, lembra papelaria de joalheria antiga."
            },
            {
              "icon": "layers",
              "title": "Fotos em alturas diferentes",
              "text": "A seleção abre com retratos e peças em cartões de alturas variadas. O ritmo irregular faz a página parecer um editorial, não um catálogo."
            },
            {
              "icon": "shield",
              "title": "Origem em três fatos",
              "text": "Ouro 18k, pedras rastreadas e polimento aparecem em três colunas curtas. É o que dá segurança a quem vai gastar mais com uma peça."
            },
            {
              "icon": "search",
              "title": "Coleções por tipo",
              "text": "Colares, anéis e brincos ganham cartão próprio com número de peças. Quem já sabe o que quer vai direto, sem filtrar uma vitrine longa."
            }
          ],
          "lab": true,
          "accent": "#3A2A20",
          "fonts": [
            "Bodoni Moda"
          ],
          "sections": 5,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Nome da marca e peça em foco"
              },
              {
                "label": "Seleção",
                "sub": "Retratos e peças em destaque"
              },
              {
                "label": "Com intenção",
                "sub": "Ouro, pedras e oficina"
              },
              {
                "label": "Coleções",
                "sub": "Colares, anéis e brincos"
              },
              {
                "label": "Instagram e lista",
                "sub": "Bastidores e cadastro"
              }
            ]
          },
          "signature": "A palavra Lapidária em Bodoni gigante sobre a foto de anéis empilhados, com Joias. em itálico encaixado acima.",
          "goal": "Explorar a coleção",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "Orla Odontologia · Landing page de clínica odontológica",
          "desc": "Estudo de landing para a Orla, clínica odontológica fictícia que explica cada etapa do tratamento antes de começar.",
          "longDesc": "Orla Odontologia é uma clínica fictícia, criada para este estudo, para pacientes que têm receio de dentista ou já tiveram orçamento surpresa. O site quer que a pessoa agende uma avaliação completa.\n\nO herói \"Seu sorriso bem cuidado começa aqui\" é todo azul, com foto em duotom e um cartão de clareamento. Depois vêm \"Tratamentos para cada fase do seu sorriso\", o passo a passo em \"Do primeiro contato ao retorno, sem surpresa no caminho\", depoimentos, perguntas frequentes e um formulário. O azul-marinho em duotom amarra fotos de origens diferentes numa mesma identidade.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/27-sorriso/",
          "cover": "img/covers/orla-odontologia.webp",
          "id": "orla-odontologia",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Fotos em duotom azul",
              "text": "Herói, tratamentos e bloco de atendimento usam fotos tingidas de azul. Assim a clínica tem uma cara só, mesmo com imagens de bancos diferentes."
            },
            {
              "icon": "chart",
              "title": "Quatro passos numerados",
              "text": "Conversa inicial, avaliação, plano por escrito e tratamento aparecem com números grandes. É a resposta direta ao medo de orçamento escondido."
            },
            {
              "icon": "users",
              "title": "Agenda e chamada simuladas",
              "text": "Um bloco mostra uma videochamada com o dentista ao lado de uma agenda de horários. O paciente vê como vai ser o atendimento antes de marcar."
            },
            {
              "icon": "search",
              "title": "Perguntas e formulário curto",
              "text": "O FAQ cobre convênio, crianças e clareamento, com atalho para o WhatsApp. O formulário final pede só nome, telefone e período."
            }
          ],
          "lab": true,
          "accent": "#3B6FA8",
          "fonts": [
            "Plus Jakarta Sans"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói azul",
                "sub": "Promessa e cartão de tratamento"
              },
              {
                "label": "Tratamentos",
                "sub": "Prevenção a implantes"
              },
              {
                "label": "Passo a passo",
                "sub": "Do contato ao retorno"
              },
              {
                "label": "Depoimentos e FAQ",
                "sub": "Relatos e dúvidas comuns"
              },
              {
                "label": "Formulário",
                "sub": "Pedido de avaliação"
              }
            ]
          },
          "signature": "O herói inteiro em duotom azul, com uma paciente sorrindo e cartões de tratamento sobre a foto.",
          "goal": "Agendar avaliação",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Forja Fit Club · Landing page de academia",
          "desc": "Estudo de landing para a Forja, academia fictícia de aulas em grupo e personal para quem quer treinar com constância.",
          "longDesc": "Forja Fit Club é uma academia fictícia, criada para este estudo, que oferece aulas em grupo, personal e avaliação física. O público é quem já desistiu de academia antes e quer uma rotina que dure. O objetivo do site é que a pessoa agende uma aula experimental.\n\nDepois de \"Supere seus limites, treine com propósito\", a página mostra serviços em \"Tudo o que você precisa para treinar com constância\", preços em \"Fitness acessível para todo mundo\", o app em \"Acompanhe a sua evolução\" e modalidades em \"TREINO QUE SE ADAPTA A VOCÊ\". Todas as fotos são tingidas de vinho, o que dá peso e unidade.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/28-academia/",
          "cover": "img/covers/forja-fit-club.webp",
          "id": "forja-fit-club",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Tudo tingido de vinho",
              "text": "Barras, kettlebells e alunos aparecem em monocromia vinho. O tom escuro e quente fala de esforço sem cair no neon de academia."
            },
            {
              "icon": "layers",
              "title": "Aula avulsa ou pacote",
              "text": "Dois cartões de preço deixam claro o custo de experimentar e o de se comprometer. Sem taxa de matrícula, o que tira a principal objeção."
            },
            {
              "icon": "gauge",
              "title": "Evolução dentro do app",
              "text": "Um bloco escuro mostra carga, calorias e frequência registradas no app. Mostra que o treino é acompanhado, não só liberado."
            },
            {
              "icon": "search",
              "title": "Perguntas com destaque",
              "text": "O FAQ abre a dúvida selecionada em vinho, com um número grande ao lado. Aula experimental, plano e congelamento ficam respondidos antes do contato."
            }
          ],
          "lab": true,
          "accent": "#7A0E14",
          "fonts": [
            "Archivo"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Promessa e oferta especial"
              },
              {
                "label": "Serviços",
                "sub": "Grupo, personal e avaliação"
              },
              {
                "label": "Preços",
                "sub": "Aula avulsa e pacote"
              },
              {
                "label": "App e modalidades",
                "sub": "Evolução e tipos de treino"
              },
              {
                "label": "Dúvidas",
                "sub": "FAQ e grade por email"
              }
            ]
          },
          "signature": "Fotos de treino inteiras tingidas de vermelho-vinho, com um selo circular giratório de oferta especial no herói.",
          "goal": "Agendar aula grátis",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "ANIL · E-commerce de moda feminina casual",
          "desc": "Estudo de loja para a ANIL, marca fictícia de moda feminina street e casual com drops mensais do PP ao GG.",
          "longDesc": "ANIL é uma marca fictícia de moda feminina, criada para este estudo, com peças street e casual que saem em drops mensais de tiragem curta, do PP ao GG. O público é a mulher que quer vestir bem no dia a dia sem montar look por horas. A ação principal é comprar.\n\nO herói \"Vista a sua própria história.\" traz uma modelo em amarelo sobre fundo azul. Depois vêm \"Coleções em alta\", \"Seu estilo, sem complicação!\", a história da marca em \"Moda de rua com cara de céu aberto\" e depoimentos. O azul-royal funciona como o céu do nome e marca cada ação.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/29-moda-street/",
          "cover": "img/covers/anil.webp",
          "id": "anil",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Azul-royal como céu",
              "text": "O nome vem do anil e o azul aparece em botões, notas e no cartão central. As coleções em preto e branco deixam o azul ainda mais forte."
            },
            {
              "icon": "layers",
              "title": "Três jeitos de comprar",
              "text": "Básicos que combinam, monte o look em três peças e troca sem custo aparecem em cartões. O do meio, em azul, sugere a peça que fecha o visual."
            },
            {
              "icon": "shield",
              "title": "Frete, troca e parcela",
              "text": "Frete grátis acima de um valor, 30 dias para trocar e parcelamento ficam juntos numa faixa. São as três travas de quem compra roupa online."
            },
            {
              "icon": "users",
              "title": "Depoimentos sobre caimento",
              "text": "Os relatos falam de tamanho e tecido, que é o que preocupa na moda online. O cadastro final dá acesso antecipado ao próximo drop."
            }
          ],
          "lab": true,
          "accent": "#1A6BFF",
          "fonts": [
            "Plus Jakarta Sans"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Modelo, promessa e lookbook"
              },
              {
                "label": "Coleções",
                "sub": "Drops por cidade"
              },
              {
                "label": "Como comprar",
                "sub": "Básicos, look e troca"
              },
              {
                "label": "Sobre a marca",
                "sub": "História e garantias"
              },
              {
                "label": "Clientes e lista",
                "sub": "Depoimentos e próximo drop"
              }
            ]
          },
          "signature": "Um herói em degradê azul com a modelo de conjunto amarelo, contrastando com coleções em preto e branco logo abaixo.",
          "goal": "Comprar a coleção",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Cadência · Landing page de clube de ciclismo de estrada",
          "desc": "Estudo de landing para a Cadência, clube fictício de ciclismo de estrada com pedais guiados e planilha de treino individual.",
          "longDesc": "Cadência é um clube fictício de ciclismo de estrada, criado para este estudo, com pedais guiados quatro vezes por semana e planilha individual. O público vai de quem saiu da bike de passeio a quem mira um gran fondo. O site quer que a pessoa marque o primeiro pedal, que é gratuito.\n\n\"DOMINE A ESTRADA\" atravessa a foto do herói de ponta a ponta. Depois vêm a agenda em \"Treine com método. Pedale mais forte\", os programas em acordeão em \"Escolha seu pedal. Monte seu plano\" e o formulário de \"Seu primeiro pedal com a gente é por nossa conta\". O azul do céu da foto vira a cor da marca.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/30-ciclismo/",
          "cover": "img/covers/cadencia.webp",
          "id": "cadencia",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "Título atrás das ciclistas",
              "text": "As letras em Anton passam por trás das atletas, que ficam em primeiro plano. Dá profundidade ao herói e coloca as pessoas antes da marca."
            },
            {
              "icon": "layers",
              "title": "Agenda com vagas",
              "text": "Cartões de pedal mostram dia, horário, distância, zona e vagas restantes, com botão de reservar. A urgência vem das vagas, não de contador."
            },
            {
              "icon": "gauge",
              "title": "Programas por nível",
              "text": "Iniciação, performance, gran fondo e rolo indoor ficam num acordeão. Cada um mostra semanas, pedais por semana e exigência de nível."
            },
            {
              "icon": "palette",
              "title": "Azul-céu e branco limpo",
              "text": "O azul do céu da foto vira a cor de ação e o resto é branco e grafite. O formulário final ganha um degradê do amarelo ao azul."
            }
          ],
          "lab": true,
          "accent": "#2D6BE4",
          "fonts": [
            "Anton",
            "Manrope"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Título e programas"
              },
              {
                "label": "Método",
                "sub": "Treinador, zonas e números"
              },
              {
                "label": "Agenda",
                "sub": "Pedais com vagas"
              },
              {
                "label": "Programas",
                "sub": "Do iniciante ao gran fondo"
              },
              {
                "label": "Primeiro pedal",
                "sub": "Formulário gratuito"
              }
            ]
          },
          "signature": "O título DOMINE A ESTRADA em letras brancas enormes atrás de duas ciclistas pedalando contra um céu azul de nuvens.",
          "goal": "Agendar primeiro pedal",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Saibro Tênis Clube · Landing page de clube de tênis",
          "desc": "Estudo de landing para o Saibro, clube de tênis fictício com reserva de quadra, aulas e planos para jogadores de todos os níveis.",
          "longDesc": "Saibro Tênis Clube é um clube fictício, criado para este estudo, com quadras, aulas e uma comunidade de jogadores do iniciante ao avançado. O público é quem quer jogar com frequência sem depender de amigo para marcar. A ação principal é reservar quadra; a segunda, assinar um plano.\n\nO herói \"TÊNIS CLUBE\" já oferece dois atalhos: \"RESERVA DE QUADRA\" e \"AULAS DE TÊNIS\". Depois vêm \"MAIS QUE UM JOGO UMA COMUNIDADE FORTE\", os planos em \"Três planos pensados para elevar o seu jogo\" e a apresentação da plataforma de agendamento. O verde-bola sobre verde-escuro amarra tudo à quadra.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/31-tenis/",
          "cover": "img/covers/saibro-tenis-clube.webp",
          "id": "saibro-tenis-clube",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Verde-bola sobre verde-escuro",
              "text": "O amarelo-esverdeado da bola é a cor de ação e o fundo dos blocos é verde-floresta. Os títulos condensados em Barlow lembram placar de quadra."
            },
            {
              "icon": "layers",
              "title": "Dois atalhos no herói",
              "text": "Reserva de quadra e aulas aparecem como cartões com foto logo na primeira dobra. Quem já sabe o que quer não precisa rolar."
            },
            {
              "icon": "chart",
              "title": "Níveis em barra de progresso",
              "text": "Um cartão mostra quantos treinadores atendem iniciante, intermediário e avançado. O jogador vê que tem lugar para o nível dele."
            },
            {
              "icon": "users",
              "title": "Planos e escolha de treinador",
              "text": "Os planos aparecem em lista com o Pro destacado em verde-escuro. Um bloco ao lado mostra a plataforma para escolher o treinador ideal."
            }
          ],
          "lab": true,
          "accent": "#C6F432",
          "fonts": [
            "Barlow Condensed",
            "Outfit"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Reserva e aulas em atalho"
              },
              {
                "label": "O clube",
                "sub": "Quadras, treinadores e números"
              },
              {
                "label": "Serviços",
                "sub": "Programas e aluguel de quadra"
              },
              {
                "label": "Planos",
                "sub": "Básico, Pro e Elite"
              },
              {
                "label": "Plataforma e ajuda",
                "sub": "Treinador ideal e contato"
              }
            ]
          },
          "signature": "Bolas de tênis em verde-bola espalhadas pelos blocos, incluindo uma raquete em close atravessando o cartão de newsletter.",
          "goal": "Reservar quadra",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Solário · Dashboard de casa inteligente com IA",
          "desc": "Estudo de interface para o Solário, painel fictício de casa inteligente com assistente de IA, clima, energia e dispositivos numa tela.",
          "longDesc": "Solário é um painel conceito de casa inteligente, com marca fictícia, criado para este estudo. A usuária imaginada, Helena, quer ver e ajustar a casa inteira sem abrir cinco apps. Aqui a ação principal não é uma compra: é controlar a casa de um lugar só.\n\nA tela abre com \"Boa tarde, Helena\" e uma maquete isométrica da casa com pontos clicáveis. Abaixo ficam \"Clima e conforto\", \"Dispositivos inteligentes\" e \"Consumo de energia\"; à direita, a \"Sala principal\" com termostato e um assistente que sugere ações. O verde-claro só marca o que está ligado ou economizando.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/32-dashboard-casa/",
          "cover": "img/covers/solario.webp",
          "id": "solario",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "sparkles",
              "title": "A casa como mapa",
              "text": "Em vez de lista de cômodos, a casa aparece em maquete com etiquetas sobre cada ponto. Tocar na sala ou na porta leva direto ao controle."
            },
            {
              "icon": "gauge",
              "title": "Termostato em arco",
              "text": "O controle de clima é um arco grande com hachura verde e botões de mais e menos. A temperatura alvo e a atual ficam lado a lado."
            },
            {
              "icon": "chart",
              "title": "Energia com picos marcados",
              "text": "O bloco preto de consumo destaca os picos do dia com hachura e compara com ontem. Dá para ver em segundos quando a casa gasta mais."
            },
            {
              "icon": "palette",
              "title": "Cinza-pedra e verde-claro",
              "text": "O fundo cinza-pedra deixa o painel calmo e o verde-claro aparece só em interruptores ligados e no modo econômico. Cor vira estado, não enfeite."
            }
          ],
          "lab": true,
          "accent": "#B8E09A",
          "fonts": [
            "Outfit"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Saudação",
                "sub": "Busca e modo econômico"
              },
              {
                "label": "Mapa da casa",
                "sub": "Pontos clicáveis por cômodo"
              },
              {
                "label": "Clima e aparelhos",
                "sub": "Previsão e controles"
              },
              {
                "label": "Energia",
                "sub": "Consumo do dia e picos"
              },
              {
                "label": "Sala e assistente",
                "sub": "Termostato e sugestões"
              }
            ]
          },
          "signature": "Uma maquete isométrica da casa com painéis solares e etiquetas flutuantes de porta trancada e temperatura da sala.",
          "goal": "Controlar a casa",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "broto. · Landing page de suco verde prensado a frio",
          "desc": "Estudo de landing para a broto., marca fictícia de sucos prensados a frio entregues no mesmo dia, para quem quer um hábito simples.",
          "longDesc": "broto. é uma marca fictícia de sucos verdes prensados a frio, criada para este estudo, com garrafas feitas de manhã e entregues no mesmo dia. O público é quem quer um hábito saudável sem complicação. O site precisa levar a pessoa a pedir garrafas avulsas ou o kit da semana.\n\nDepois de \"UMA ESCOLHA MAIS VERDE PARA O SEU DIA A DIA\", a página mostra os ingredientes em \"MANTENHA VERDE. MANTENHA SIMPLES\", o processo em três passos em \"SIMPLES POR NATUREZA\", os sabores em \"ESCOLHA O SEU VERDE\" e uma busca por CEP. O verde-pistache em blocos arredondados lembra um rótulo de garrafa.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/33-suco-detox/",
          "cover": "img/covers/broto.webp",
          "id": "broto",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Verde-pistache em blocos",
              "text": "Cada seção é um bloco de cantos arredondados, alternando creme e verde-pistache. Os títulos em Archivo pesado lembram rótulo de produto."
            },
            {
              "icon": "layers",
              "title": "Processo em três passos",
              "text": "Escolhemos, prensamos a frio e entregamos gelado aparecem em cartões numerados e desalinhados. Explica o preço sem falar dele."
            },
            {
              "icon": "sparkles",
              "title": "Kit da semana em destaque",
              "text": "Ao lado dos sabores avulsos, um cartão verde-escuro resume o kit com seis garrafas e o total. É a opção que a marca quer vender."
            },
            {
              "icon": "search",
              "title": "CEP antes do pedido",
              "text": "O fim da página pede o CEP para mostrar os horários de entrega. Resolve a dúvida de quem não sabe se a marca chega na rua dele."
            }
          ],
          "lab": true,
          "accent": "#B9C98A",
          "fonts": [
            "Archivo"
          ],
          "sections": 5,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Promessa e garrafa do dia"
              },
              {
                "label": "Ingredientes",
                "sub": "Abacate, pepino, maçã verde"
              },
              {
                "label": "Como fazemos",
                "sub": "Seleção, prensa e entrega"
              },
              {
                "label": "Sabores e kit",
                "sub": "Garrafas avulsas e semana"
              },
              {
                "label": "Entrega",
                "sub": "Horários por CEP"
              }
            ]
          },
          "signature": "Abacate, pepino e maçã verde fotografados sobre fundos verde-pistache, cada um com o nome em letras pretas pesadas.",
          "goal": "Pedir suco",
          "niche": "comida",
          "mood": "light"
        },
        {
          "title": "Fominha · Landing page de hamburgueria",
          "desc": "Estudo de landing para a Fominha, hamburgueria fictícia de smash e blend da casa, com delivery e retirada.",
          "longDesc": "Fominha é uma hamburgueria fictícia, criada para este estudo, com blend moído na casa, pão brioche do dia e entrega na região. O público é quem está com fome agora e decide pelo que vê. O site tem um só objetivo: fazer a pessoa pedir.\n\nO herói \"BURGERS FEITOS PRA DAR VONTADE\" mostra o Duplo da Casa sobre papel xadrez, com preço anotado à mão. Depois vêm os ingredientes em \"O QUE VAI EM CADA MORDIDA\", o cardápio em \"OS MAIS PEDIDOS DA CHAPA\" e a entrega em \"PEDIU, CHEGOU QUENTE.\". Vermelho-vinho e amarelo-mostarda dão clima de lanchonete clássica.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/34-hamburgueria/",
          "cover": "img/covers/fominha.webp",
          "id": "fominha",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Vinho, mostarda e xadrez",
              "text": "Vermelho-vinho, amarelo-mostarda e o papel xadrez vêm direto da lanchonete. A anotação em Caveat parece escrita no quadro do balcão."
            },
            {
              "icon": "layers",
              "title": "Cardápio com abas",
              "text": "Burgers, combos, acompanhamentos e shakes ficam em abas. Cada item tem foto recortada, descrição curta, preço e botão de adicionar."
            },
            {
              "icon": "sparkles",
              "title": "Ingredientes em etiquetas",
              "text": "Ao lado do burger aberto, seis etiquetas numeradas listam blend, cheddar, cebola e brioche. É a prova de que nada vem congelado."
            },
            {
              "icon": "search",
              "title": "Tempo de entrega por CEP",
              "text": "A última seção pede o CEP e mostra o tempo até a porta, com horário e opção de retirada. Responde a pergunta que decide o pedido."
            }
          ],
          "lab": true,
          "accent": "#8B1A1A",
          "fonts": [
            "Anton",
            "Archivo",
            "Caveat"
          ],
          "sections": 3,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Burger da casa e preço"
              },
              {
                "label": "Promessa",
                "sub": "Fresco e zero congelado"
              },
              {
                "label": "Ingredientes",
                "sub": "Pão do dia e montagem"
              },
              {
                "label": "Cardápio",
                "sub": "Mais pedidos por categoria"
              },
              {
                "label": "Entrega",
                "sub": "Tempo por CEP e retirada"
              }
            ]
          },
          "signature": "Um hambúrguer empanado sobre papel xadrez vermelho, com o preço do Duplo da Casa escrito à mão e uma seta apontando.",
          "goal": "Pedir agora",
          "niche": "comida",
          "mood": "light"
        },
        {
          "title": "Alcova · Interface de app de casa inteligente",
          "desc": "Estudo de interface para a Alcova, app fictício que reúne câmeras, luzes, robô aspirador e som da casa em painéis de vidro fosco.",
          "longDesc": "Alcova é um app conceito de casa inteligente, com marca fictícia, criado para este estudo e apresentado em três painéis. O usuário imaginado quer ver o que acontece em cada cômodo e mexer em luz, som e limpeza sem trocar de tela. A ação principal é controlar os cômodos.\n\nO primeiro painel abre com a câmera ao vivo da \"Sala de estar\" e a lista de \"Cômodos\". Embaixo, cartões do \"Quarto\" com o robô aspirador, da \"Sala de estar\" com o pendente e das \"Caixas de som\" com o player. Tudo flutua em vidro fosco sobre um fundo desfocado da própria casa.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/35-paineis-casa/",
          "cover": "img/covers/alcova.webp",
          "id": "alcova",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "layers",
              "title": "Vidro fosco sobre a casa",
              "text": "Os cartões são translúcidos sobre um fundo desfocado do próprio ambiente. O app parece uma camada sobre a casa, não uma tela à parte."
            },
            {
              "icon": "gauge",
              "title": "Clima em pílulas sobre a câmera",
              "text": "Temperatura, umidade, consumo e qualidade do ar ficam em pílulas sobre o vídeo ao vivo. Uma olhada mostra imagem e condições juntas."
            },
            {
              "icon": "sparkles",
              "title": "Cada aparelho com sua cena",
              "text": "O robô aspirador tem bateria e área limpa, o pendente tem controle de brilho e o som tem capa e player. Cada cartão fala do seu objeto."
            },
            {
              "icon": "palette",
              "title": "Branco, preto e verde-água",
              "text": "A paleta é quase neutra, com um cartão preto para dar ritmo. O verde-água claro fica para pequenos sinais, como os dispositivos online."
            }
          ],
          "lab": true,
          "accent": "#A9C5C1",
          "fonts": [
            "Urbanist"
          ],
          "sections": 3,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Troca de painel",
                "sub": "Três telas e status online"
              },
              {
                "label": "Câmera ao vivo",
                "sub": "Sala com clima e consumo"
              },
              {
                "label": "Cômodos",
                "sub": "Lista e novo cômodo"
              },
              {
                "label": "Aparelhos",
                "sub": "Aspirador e luminária"
              },
              {
                "label": "Som",
                "sub": "Player das caixas de som"
              }
            ]
          },
          "signature": "Painéis de vidro fosco sobre uma foto desfocada da casa, com a câmera da sala ao vivo e indicadores de clima em pílulas.",
          "goal": "Controlar os cômodos",
          "niche": "tech",
          "mood": "light"
        },
        {
          "title": "Penumbra · Landing page de automação residencial",
          "desc": "Estudo de landing para a Penumbra, empresa fictícia de automação residencial sem obra, para quem quer luz, clima e portas num app só.",
          "longDesc": "Penumbra é uma empresa fictícia de automação residencial, criada para este estudo, que instala luz, clima, câmeras e fechaduras sem quebrar parede. O público é dono de casa ou apartamento que quer conforto mas teme obra e fio aparente. O site precisa levar a uma visita técnica.\n\n\"SUA CASA INTELIGENTE, DO SEU JEITO.\" abre sobre uma sala à meia-luz. Depois vêm os controles em \"TUDO CONECTADO, NADA À VISTA\", as cenas em \"UM TOQUE, A CASA INTEIRA\", as dúvidas em \"ANTES DA VISITA, O QUE TODO MUNDO PERGUNTA\" e o formulário. O fundo escuro com âmbar imita a luz de um abajur aceso.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/36-lumora-casa/",
          "cover": "img/covers/penumbra.webp",
          "id": "penumbra",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Escuro com luz âmbar",
              "text": "O site inteiro fica em preto e grafite, e o âmbar aparece onde há luz ligada. O próprio nome da marca vira a direção de arte."
            },
            {
              "icon": "layers",
              "title": "Controles reais como vitrine",
              "text": "Iluminação, clima, câmeras, energia e segurança aparecem como widgets do app. O visitante vê o produto funcionando antes de ler sobre ele."
            },
            {
              "icon": "sparkles",
              "title": "Cenas com um toque",
              "text": "Sobre a foto de uma fachada à noite, um painel alterna cenas como chegar, cinema e dormir. Mostra o ganho do sistema melhor que uma lista."
            },
            {
              "icon": "shield",
              "title": "Sem obra, sem susto",
              "text": "Visita técnica sem custo e instalação em um dia aparecem em passos numerados. O FAQ responde sobre parede, internet caindo e assistente de voz."
            }
          ],
          "lab": true,
          "accent": "#F2B045",
          "fonts": [
            "Archivo"
          ],
          "sections": 7,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Promessa e câmera ao vivo"
              },
              {
                "label": "Dispositivos",
                "sub": "Fechadura, som e números"
              },
              {
                "label": "Tudo conectado",
                "sub": "Luz, clima e segurança"
              },
              {
                "label": "Cenas e processo",
                "sub": "Um toque e três passos"
              },
              {
                "label": "Dúvidas e visita",
                "sub": "FAQ e formulário"
              }
            ]
          },
          "signature": "Um cartão âmbar de iluminação com um pendente aceso a 65%, o único bloco claro num painel de controles escuros.",
          "goal": "Agendar visita técnica",
          "niche": "tech",
          "mood": "dark"
        },
        {
          "title": "Ondina · App web de música com player, fila e playlists",
          "desc": "Estudo de um app de música fictício para quem ouve à noite: artistas em alta, fila da noite e playlists por clima numa tela só.",
          "longDesc": "Ondina é uma marca fictícia de streaming criada como estudo de interface. A ideia é um app para quem ouve música no fim do dia, com uma saudação que já entrega a \"noite de abajur\" pronta. O trabalho da tela é simples: fazer a pessoa apertar play sem precisar procurar nada.\n\nTudo vive numa única tela. No topo, o carrossel \"Artistas em alta\"; embaixo, a fila \"Na sequência\" ao lado das \"Playlists populares\", e o player fixo no rodapé. A decisão visual foi um âmbar quente sobre marrom quase preto, com vidro fosco, para parecer luz de abajur e não painel de controle.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/37-player-musica/",
          "cover": "img/covers/ondina.webp",
          "id": "ondina",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Âmbar de abajur no lugar do neon",
              "text": "O destaque amarelo-âmbar sobre marrom escuro afasta o app do visual frio de streaming. O tom acompanha a promessa de música para o fim da noite."
            },
            {
              "icon": "layers",
              "title": "Fila e playlists lado a lado",
              "text": "A fila da noite, com duração e curtidas, fica ao lado das playlists por clima. Quem chega vê o que vai tocar e para onde pode ir em seguida."
            },
            {
              "icon": "users",
              "title": "Artistas com selo de contexto",
              "text": "Cada card de artista traz um selo como Em alta, Novo single ou Ao vivo. O selo diz por que vale ouvir agora antes mesmo do clique."
            },
            {
              "icon": "sparkles",
              "title": "Playlists nomeadas pelo momento",
              "text": "Noite de Abajur, Lo-fi pra Chuva, Treino Leve: as listas são organizadas por situação, não por gênero. Cada uma ganha um ícone e uma cor própria."
            }
          ],
          "lab": true,
          "accent": "#F2B640",
          "fonts": [
            "Urbanist"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Busca e navegação",
                "sub": "Descobrir, playlists, artistas, gêneros"
              },
              {
                "label": "Artistas em alta",
                "sub": "Carrossel com selo e play direto"
              },
              {
                "label": "Na sequência",
                "sub": "A fila da noite, faixa a faixa"
              },
              {
                "label": "Playlists populares",
                "sub": "Listas por clima e momento"
              },
              {
                "label": "Player fixo",
                "sub": "Controles sempre à mão no rodapé"
              }
            ]
          },
          "signature": "O player flutuante com o botão de play em âmbar, sobre um fundo desfocado que lembra uma sala com a luz baixa.",
          "goal": "Dar play na fila",
          "niche": "criativo",
          "mood": "dark"
        },
        {
          "title": "Ressoa · Loja online de fones de ouvido",
          "desc": "Estudo de e-commerce para uma loja fictícia de fones: categorias claras, garantias à vista e um herói em azul elétrico.",
          "longDesc": "Ressoa é uma loja fictícia de fones de ouvido, criada como estudo de varejo online. O público é quem quer trocar de fone e não sabe por onde começar: over-ear, on-ear, cancelamento de ruído ou gamer. O site precisa levar a pessoa até uma categoria e dali ao carrinho.\n\nO herói abre com a palavra IMERSÃO gigante atrás da modelo, seguido de uma faixa com frete, garantia, pagamento e suporte. Depois vêm \"Compre por categoria\", o destaque \"Som de outro nível\" e a régua de marcas parceiras. O azul elétrico do topo contrasta com o azul-marinho do rodapé.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/38-fones/",
          "cover": "img/covers/ressoa.webp",
          "id": "ressoa",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Azul elétrico com tipo condensado",
              "text": "O herói usa um azul vivo de ponta a ponta com Anton enorme por trás da foto. A loja ganha cara de marca, não de catálogo genérico."
            },
            {
              "icon": "shield",
              "title": "Objeções resolvidas na dobra",
              "text": "Frete grátis, garantia de 1 ano, Pix e parcelamento e suporte por WhatsApp aparecem logo abaixo do herói. A dúvida de quem compra online some antes da rolagem."
            },
            {
              "icon": "search",
              "title": "Entrada por tipo de fone",
              "text": "As categorias trazem foto do produto e o desconto de cada linha. Quem não conhece os termos técnicos escolhe pelo formato que vê."
            },
            {
              "icon": "users",
              "title": "Newsletter com promessa curta",
              "text": "O rodapé pede o e-mail para lançamentos e cupons, uma vez por semana. A frequência dita na chamada reduz o medo de spam."
            }
          ],
          "lab": true,
          "accent": "#1F5BD8",
          "fonts": [
            "Anton",
            "Plus Jakarta Sans"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Imersão",
                "sub": "Herói com chamada para comprar"
              },
              {
                "label": "Garantias",
                "sub": "Frete, garantia, pagamento, suporte"
              },
              {
                "label": "Categorias",
                "sub": "Over-ear, on-ear, ruído, gamer"
              },
              {
                "label": "Som de outro nível",
                "sub": "Destaque de produto e coleção"
              },
              {
                "label": "Marcas e rodapé",
                "sub": "Parceiras, cupons e links"
              }
            ]
          },
          "signature": "A palavra IMERSÃO em letras condensadas brancas, cortada pela modelo de fone que sai da frente do texto.",
          "goal": "Comprar fone",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Candeia · Landing de ateliê de luminárias de design",
          "desc": "Estudo para um ateliê fictício de luminárias de papel e madeira, feito para quem quer luz quente em casa e precisa de ajuda para escolher.",
          "longDesc": "Candeia é um ateliê fictício de luminárias de papel de fibra e madeira maciça, criado como estudo de marca. O público é quem está montando a casa e quer uma peça bonita, mas não sabe qual tamanho ou altura funciona no ambiente. A ação final é mandar uma foto do cômodo e receber uma indicação.\n\nA página passa por \"A seleção\", pelo catálogo \"Quatro formas de acender o fim do dia\" com filtros por mesa, piso e pendente, e fecha em \"Mande uma foto do ambiente\". O herói escuro mostra a Empilhada 03 acesa em laranja, e o resto do site respira em creme.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/39-luminarias/",
          "cover": "img/covers/candeia.webp",
          "id": "candeia",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Laranja de lâmpada acesa",
              "text": "O destaque laranja é a cor da luz que as peças fazem. Ele aparece no herói escuro e depois só em botões e detalhes sobre o creme."
            },
            {
              "icon": "search",
              "title": "Catálogo com filtro por uso",
              "text": "As quatro peças podem ser filtradas por mesa, piso ou pendente, com preço e cores de acabamento. Fica fácil comparar sem abrir página de produto."
            },
            {
              "icon": "users",
              "title": "Consultoria pela foto do cômodo",
              "text": "O formulário final pede nome, WhatsApp e tipo de ambiente. A promessa é indicar a peça e a altura certas, sem compromisso de compra."
            },
            {
              "icon": "layers",
              "title": "Ateliê mostrado com materiais",
              "text": "Uma seção lista papel de amoreira, freijó e eucalipto e LED quente, ao lado de uma sala real com a peça instalada. O material vira argumento de preço."
            }
          ],
          "lab": true,
          "accent": "#E2761F",
          "fonts": [
            "Urbanist"
          ],
          "sections": 4,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói aceso",
                "sub": "Empilhada 03 com etiquetas de material"
              },
              {
                "label": "A seleção",
                "sub": "Três peças em ambientes reais"
              },
              {
                "label": "Catálogo",
                "sub": "Quatro formas, filtro por uso"
              },
              {
                "label": "O ateliê",
                "sub": "Materiais e anos de bancada"
              },
              {
                "label": "Foto do ambiente",
                "sub": "Pedido de indicação por WhatsApp"
              }
            ]
          },
          "signature": "A luminária Empilhada 03 acesa no herói escuro, com etiquetas apontando os materiais e miniaturas para trocar de peça.",
          "goal": "Pedir indicação",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Mirante Residências · Landing de imobiliária de alto padrão",
          "desc": "Estudo para uma imobiliária fictícia de casas de praia, serra e cidade, voltado a famílias que preferem curadoria a portal de anúncios.",
          "longDesc": "Mirante é uma imobiliária fictícia de alto padrão, criada como estudo de design. O público são famílias que procuram casa de praia, serra ou cidade e não querem garimpar em portal. O site existe para levar essa pessoa a uma conversa com um consultor e, dali, a uma visita privada.\n\nDepois do herói \"Onde a vida mora\", vêm o método em três passos de \"Todo lar começa com a visão de viver melhor\", a vitrine \"Feito com propósito\" filtrada por praia, serra e cidade, o FAQ \"Antes da visita, as respostas\" e o formulário final. A serifa itálica de Instrument Serif contra o azul-marinho dá o tom de revista de arquitetura.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/40-imovel-luxo/",
          "cover": "img/covers/mirante-residencias.webp",
          "id": "mirante-residencias",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Itálico de revista e azul-marinho",
              "text": "Instrument Serif em itálico alterna com Inter Tight em caixa-alta nos títulos. O azul-marinho aparece no rodapé e nos botões, sóbrio como uma assinatura."
            },
            {
              "icon": "search",
              "title": "Vitrine filtrada por paisagem",
              "text": "As casas são separadas em praia, serra e cidade, com cidade, suítes e metragem no card. O comprador começa pelo estilo de vida, não pelo preço."
            },
            {
              "icon": "shield",
              "title": "Dúvidas respondidas antes da visita",
              "text": "O FAQ explica como funciona a visita privada, os imóveis fora de anúncio e quem cuida da documentação. São as perguntas de quem tem receio de expor a família."
            },
            {
              "icon": "users",
              "title": "Formulário que começa pelo desejo",
              "text": "O último bloco pergunta o que a pessoa procura, com nome e WhatsApp. O consultor recebe contexto e a conversa já começa no ponto certo."
            }
          ],
          "lab": true,
          "accent": "#0C2340",
          "fonts": [
            "Instrument Serif",
            "Inter Tight"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Onde a vida mora",
                "sub": "Herói com casa e chamada para imóveis"
              },
              {
                "label": "O método",
                "sub": "Curadoria, visita privada, escritura"
              },
              {
                "label": "Feito com propósito",
                "sub": "Casas por praia, serra e cidade"
              },
              {
                "label": "Antes da visita",
                "sub": "Depoimento e perguntas frequentes"
              },
              {
                "label": "Conversa",
                "sub": "Formulário para falar com consultor"
              }
            ]
          },
          "signature": "O título \"Onde A VIDA MORA\" escrito sobre a foto da casa branca, misturando itálico fino e caixa-alta pesada.",
          "goal": "Agendar visita privada",
          "niche": "imovel",
          "mood": "light"
        },
        {
          "title": "Bruma · Landing de luminária-objeto numerada",
          "desc": "Estudo para uma luminária fictícia de vidro soprado, latão e mármore, feita em edição numerada para quem compra design como objeto.",
          "longDesc": "Bruma é uma luminária-objeto fictícia, criada como estudo de lançamento de produto. Ela é vendida em edição numerada, com cúpula de vidro soprado, haste de latão e base de mármore verde. O público é quem compra peça de design para ficar à vista, e o site precisa levar essa pessoa a reservar a sua unidade.\n\nA página passa por \"Não é só luz. É um sentimento\", pela família de tamanhos em \"Luz que se adapta a você\", pela anatomia em \"Cada parte feita à mão\" e pelos materiais antes de \"Reserve a sua Bruma 01\". Tudo é verde-oliva, como o próprio vidro da cúpula.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/41-luminaria-objeto/",
          "cover": "img/covers/bruma.webp",
          "id": "bruma",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Um site da cor do vidro",
              "text": "O verde-oliva da cúpula vira a paleta inteira, do herói ao rodapé. Os títulos em Archivo cinza-claro somem e reaparecem como a luz da peça."
            },
            {
              "icon": "layers",
              "title": "Anatomia em quatro partes",
              "text": "Um diagrama numera cúpula, borda, haste e dimmer de toque, cada um com uma explicação curta. O preço passa a ter peças concretas por trás."
            },
            {
              "icon": "gauge",
              "title": "Família de tamanhos com preço",
              "text": "Bruma mesa, mini e alta aparecem lado a lado com medidas e valor, junto de um controle de modo de luz. Quem compra escolhe o tamanho sem sair da página."
            },
            {
              "icon": "shield",
              "title": "Reserva com resumo do pedido",
              "text": "O formulário final pede nome, e-mail e cor da cúpula e mostra um resumo com prazo e total. A edição numerada justifica a reserva em vez da compra imediata."
            }
          ],
          "lab": true,
          "accent": "#5E6B3A",
          "fonts": [
            "Archivo"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "A peça, as medidas e o preço"
              },
              {
                "label": "Um sentimento",
                "sub": "A luz acesa à noite"
              },
              {
                "label": "A família",
                "sub": "Mesa, mini e alta lado a lado"
              },
              {
                "label": "Feita à mão",
                "sub": "Anatomia e três materiais"
              },
              {
                "label": "Reserva",
                "sub": "Formulário com resumo do pedido"
              }
            ]
          },
          "signature": "A cúpula verde da luminária sobreposta ao nome BRUMA em letras pretas gigantes, com as medidas e o preço ao redor.",
          "goal": "Reservar a peça",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "argila · Landing de skincare mineral com argila vermelha",
          "desc": "Estudo para uma marca fictícia de skincare com argila vermelha e minerais vulcânicos, para quem quer rotina curta e sem fragrância.",
          "longDesc": "Argila é uma marca fictícia de skincare mineral, criada como estudo de identidade e página de produto. O carro-chefe é um creme restaurador com argila vermelha e pó de basalto. O público é quem cansou de rotina com dez etapas e quer poucos produtos que façam sentido. O site precisa vender o primeiro pote.\n\nDepois do herói, vêm a linha em \"Pele, em repouso\", a ideia de \"Skincare que faz mais, com menos\", os ingredientes em \"O que vai no pote\" e a rotina em \"Três passos, manhã e noite\". O vermelho-tijolo da argila, com Bodoni Moda, dá o ar de marca de farmácia antiga.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/42-skincare/",
          "cover": "img/covers/argila.webp",
          "id": "argila",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Vermelho-tijolo e serifa de bula",
              "text": "O vermelho da argila cobre o herói e blocos inteiros, e a Bodoni Moda dá peso de marca tradicional. Jost em caixa-alta fica com as informações técnicas."
            },
            {
              "icon": "search",
              "title": "Ingredientes com cara de amostra",
              "text": "Argila, basalto, esqualano e niacinamida aparecem como bolinhas de textura, cada uma com uma frase do que faz. O rótulo vira coisa que se entende."
            },
            {
              "icon": "layers",
              "title": "Rotina com aba manhã e noite",
              "text": "Três passos numerados, com tempo de cada um, mudam conforme a aba escolhida. A cliente sabe exatamente onde o creme entra no dia."
            },
            {
              "icon": "users",
              "title": "Cupom para o primeiro pote",
              "text": "O fechamento oferece frete grátis no primeiro pedido em troca do e-mail, com a rotina em PDF de bônus. É um passo pequeno para quem ainda está na dúvida."
            }
          ],
          "lab": true,
          "accent": "#7A1E12",
          "fonts": [
            "Bodoni Moda",
            "Jost"
          ],
          "sections": 7,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "O creme e a avaliação das clientes"
              },
              {
                "label": "Pele, em repouso",
                "sub": "Os três produtos da linha"
              },
              {
                "label": "Fazer mais com menos",
                "sub": "A ideia da marca em números"
              },
              {
                "label": "O que vai no pote",
                "sub": "Ingredientes e rotina de três passos"
              },
              {
                "label": "Primeiro pote",
                "sub": "Depoimentos e cupom de frete"
              }
            ]
          },
          "signature": "A palavra argila em Bodoni enorme, com o pote vermelho equilibrado sobre uma pilha de pedras pretas no meio das letras.",
          "goal": "Comprar o creme",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "QUASAR · Galeria de arte digital colecionável",
          "desc": "Estudo para uma galeria fictícia de arte digital em edições numeradas, para quem quer colecionar sem carteira cripto nem jargão.",
          "longDesc": "Quasar é uma galeria fictícia de arte digital colecionável, criada como estudo de marca. As obras são de criadores independentes, em edições numeradas com certificado. O público é quem gosta de colecionar mas foge de carteira cripto e de linguagem técnica. O site quer duas coisas: vender peças do drop atual e colocar o visitante na lista do próximo.\n\nA página segue de \"Um mundo feito para ser seu\" para a grade \"Peças do drop 01\", explica a compra em \"Da galeria para a sua tela\", apresenta \"Quem faz as peças\" e fecha no cadastro. Vermelho puro com tipografia pixelada Silkscreen deixa tudo com cara de videogame de colecionador.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)"
          ],
          "link": "https://lab.bernardoiannini.com/sites/43-colecionaveis/",
          "cover": "img/covers/quasar.webp",
          "id": "quasar",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Vermelho puro e letra de pixel",
              "text": "Silkscreen pixelado nos títulos e um vermelho sem meio-tom marcam a galeria. O fundo branco deixa as peças em 3D brilharem como brinquedo."
            },
            {
              "icon": "search",
              "title": "Drop com filtro por técnica",
              "text": "A grade de doze peças filtra por 3D inflado, pixel e generativa, com criador, edição e preço em cada card. Dá para comparar como numa vitrine."
            },
            {
              "icon": "shield",
              "title": "Compra explicada em quatro passos",
              "text": "Criar conta, escolher a peça, pagar com Pix ou cartão e receber a obra. O passo do pagamento ganha destaque em vermelho para mostrar que não há cripto."
            },
            {
              "icon": "users",
              "title": "Criadores com perfil próprio",
              "text": "Cada artista tem card com especialidade, número de peças e botão de seguir. A galeria vende autoria, não só imagem."
            }
          ],
          "lab": true,
          "accent": "#E10600",
          "fonts": [
            "Archivo",
            "Silkscreen"
          ],
          "sections": 5,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói",
                "sub": "Astronauta e chamada para o drop"
              },
              {
                "label": "Um mundo seu",
                "sub": "Peça em destaque e números"
              },
              {
                "label": "Drop 01",
                "sub": "Doze peças com filtro"
              },
              {
                "label": "Como comprar",
                "sub": "Quatro passos até a sua tela"
              },
              {
                "label": "Próximo drop",
                "sub": "Criadores e lista de espera"
              }
            ]
          },
          "signature": "O astronauta vermelho em 3D brilhante sobre o nome QUASAR em letras pixeladas pretas, com cartas de peças voando ao lado.",
          "goal": "Entrar na lista do drop",
          "niche": "criativo",
          "mood": "light"
        },
        {
          "title": "Sereno · Landing de perfume autoral (eau de parfum)",
          "desc": "Estudo para uma perfumaria fictícia e seu perfume Flor Noturna, voltado a quem compra fragrância pela história das notas.",
          "longDesc": "Sereno é uma perfumaria autoral fictícia, criada como estudo de lançamento. O produto principal é o Flor Noturna, um eau de parfum com rosa vermelha, papoula e âmbar. O público é quem escolhe perfume pela história e pelas notas, não pela vitrine do shopping. O site precisa levar à compra do frasco ou do kit de amostras.\n\nA página passa por \"A arte do florescer\", pelas notas em \"Três tempos, uma só noite\", pelas três versões em \"Escolha a sua noite\" e pelo \"O ritual em quatro gestos\". O vermelho-sangue com Bodoni e Italiana deixa tudo com clima de noite de gala.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/44-perfume/",
          "cover": "img/covers/sereno-perfume.webp",
          "id": "sereno-perfume",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Vermelho de rosa e letra de gala",
              "text": "Italiana alta e fina divide os títulos com Bodoni Moda, sobre vermelho profundo e creme. O contraste lembra embalagem de perfumaria clássica."
            },
            {
              "icon": "layers",
              "title": "Pirâmide olfativa em três cards",
              "text": "Saída, coração e fundo viram três cards com foto, tempo de duração e notas. Quem não entende de perfume entende como o cheiro muda ao longo da noite."
            },
            {
              "icon": "gauge",
              "title": "Três versões para comparar",
              "text": "Vinho Lento, Flor Noturna e Orvalho Rosé aparecem com nota, avaliação, tamanho e preço. O botão de sacola fica no próprio card."
            },
            {
              "icon": "users",
              "title": "Kit de amostras como porta",
              "text": "O fechamento oferece as três fragrâncias em frasco de 2 ml, com o valor virando crédito na compra. Reduz o risco de comprar perfume sem sentir."
            }
          ],
          "lab": true,
          "accent": "#B30000",
          "fonts": [
            "Bodoni Moda",
            "Italiana",
            "Manrope"
          ],
          "sections": 5,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Flor Noturna",
                "sub": "Frasco, avaliações e preço"
              },
              {
                "label": "Do florescer",
                "sub": "A história e a concentração"
              },
              {
                "label": "Três tempos",
                "sub": "Notas de saída, coração e fundo"
              },
              {
                "label": "Escolha a noite",
                "sub": "Três fragrâncias para comprar"
              },
              {
                "label": "Ritual e kit",
                "sub": "Como aplicar e amostras"
              }
            ]
          },
          "signature": "O frasco vermelho flutuando sobre nuvens, com FLOR NOTURNA em letras finas e altas atravessando o topo da página.",
          "goal": "Comprar o perfume",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "Filigrana · Landing de joalheria artesanal em ouro",
          "desc": "Estudo para uma joalheria fictícia de ouro feito à mão, focada em noivas e peças sob medida para casamento.",
          "longDesc": "Filigrana é uma joalheria fictícia de ouro 18k feito à mão, criada como estudo de marca. O foco são noivas e famílias que procuram peças para o casamento, de brincos a gargantilhas sob encomenda. O site precisa levar a pessoa a marcar uma prova privada no ateliê.\n\nA página passa por \"Nossas coleções\", pela \"Peça da estação\" com ficha técnica e preço, pelo processo em \"Feitas à mão no nosso ateliê\" e pelo FAQ \"Antes da sua prova\". Cormorant Garamond em itálico, ouro e um fundo creme dão o tom de convite de casamento.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/45-joalheria/",
          "cover": "img/covers/filigrana.webp",
          "id": "filigrana",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Itálico de convite e laranja-ouro",
              "text": "Cada título junta um itálico em Cormorant com uma palavra em caixa-alta espaçada. O laranja-ouro aparece só em botões, como um detalhe de joia."
            },
            {
              "icon": "search",
              "title": "Peça da estação com ficha",
              "text": "A gargantilha em destaque traz material, pedras, peso, prazo e preço, com miniaturas para trocar de foto. É uma página de produto dentro da landing."
            },
            {
              "icon": "layers",
              "title": "Processo em três etapas de bancada",
              "text": "Desenho a quatro mãos, fundição e filigrana, cravação e polimento são explicados ao lado da foto das mãos da ourives. A espera de semanas ganha motivo."
            },
            {
              "icon": "users",
              "title": "Prova marcada pela data do evento",
              "text": "O formulário final pede nome, WhatsApp e a data do casamento. Quem atende já sabe o prazo antes de responder."
            }
          ],
          "lab": true,
          "accent": "#B4561C",
          "fonts": [
            "Archivo",
            "Cormorant Garamond"
          ],
          "sections": 6,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Adoração atemporal",
                "sub": "Noiva, coleção e peças em destaque"
              },
              {
                "label": "Nossas coleções",
                "sub": "Colares, brincos, pulseiras, anéis"
              },
              {
                "label": "Peça da estação",
                "sub": "Ficha técnica e reserva"
              },
              {
                "label": "O ateliê",
                "sub": "Três etapas feitas à mão"
              },
              {
                "label": "Prova privada",
                "sub": "FAQ e agendamento"
              }
            ]
          },
          "signature": "A noiva de sári vermelho entre as palavras ADORAÇÃO ATEMPORAL, com uma barra de renda dourada recortando a base do herói.",
          "goal": "Marcar prova privada",
          "niche": "luxo",
          "mood": "light"
        },
        {
          "title": "Matiz · Página interativa de paletas de gradiente",
          "desc": "Estudo para um estúdio fictício de cor que mostra seis paletas de gradiente com hex, aplicação em interface e gerador próprio.",
          "longDesc": "Matiz é um estúdio de cor fictício, criado como estudo de página-ferramenta. O público são designers e devs cansados de gradiente sem graça. A tese do site é que gradiente bom é um matiz só, indo do quase preto ao quase branco. O que se espera do visitante é que copie uma paleta, gere a sua e siga o estúdio.\n\nDepois do herói \"Chega de gradientes sem sal\", a página explica a regra e abre as seis paletas, como Acid Lime, Tangerine, Lagoon e Cherry Cola. Cada uma ganha foto de clima, escala com hex e uma tela de app pintada com ela.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/46-paletas/",
          "cover": "img/covers/matiz.webp",
          "id": "matiz",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Seis paletas, um matiz cada",
              "text": "Cada paleta vai de um tom quase preto a um quase branco, sem misturar cores. A regra fica visível na própria escala de hex."
            },
            {
              "icon": "layers",
              "title": "Paleta aplicada em tela real",
              "text": "Logo depois da escala vem um painel de app pintado com aquela cor, com botões e gráficos. O designer vê o gradiente trabalhando, não só bonito."
            },
            {
              "icon": "sparkles",
              "title": "Gerador no fim da página",
              "text": "Um bloco permite montar a própria paleta a partir de um matiz e ver o resultado aplicado na hora. A página vira ferramenta e não só vitrine."
            },
            {
              "icon": "users",
              "title": "Fotos que dão clima à cor",
              "text": "Cada paleta é acompanhada de uma foto no mesmo tom, de pôr do sol a lagoa. Ajuda a escolher a cor pelo sentimento, não pelo código."
            }
          ],
          "lab": true,
          "accent": "#E3261B",
          "fonts": [
            "Archivo",
            "Inter Tight",
            "JetBrains Mono",
            "Permanent Marker"
          ],
          "sections": 10,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Sem sal",
                "sub": "Herói com a tese do estúdio"
              },
              {
                "label": "A regra",
                "sub": "Um matiz do escuro ao claro"
              },
              {
                "label": "As seis paletas",
                "sub": "Hex, foto e tela aplicada"
              },
              {
                "label": "Gerador",
                "sub": "Monte a sua a partir de um matiz"
              },
              {
                "label": "Siga o estúdio",
                "sub": "Cadastro para novas paletas"
              }
            ]
          },
          "signature": "O título CHEGA DE GRADIENTES escrito em caixa-alta pesada, com \"sem sal\" rabiscado à mão em Permanent Marker por cima.",
          "goal": "Copiar uma paleta",
          "niche": "criativo",
          "mood": "dark"
        },
        {
          "title": "Calmaria · Loja online de skincare natural",
          "desc": "Estudo de e-commerce para uma marca fictícia de skincare natural, para quem quer começar uma rotina simples e entender o rótulo.",
          "longDesc": "Calmaria é uma marca fictícia de skincare natural, criada como estudo de loja online. O público é quem quer começar a cuidar da pele sem se perder em ativos e etapas. O site precisa fazer essa pessoa montar uma rotina e colocar os produtos no carrinho.\n\nO caminho passa por \"Escolha por onde começar\", pelos \"Mais amados\", pelo kit em \"Cinco minutos só seus\", pelos ingredientes e por \"Sua rotina em 3 passos\", até o FAQ. O verde-musgo com Anton condensado e um gato no herói tiram a marca do lugar comum do skincare.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/47-skincare-glow/",
          "cover": "img/covers/calmaria.webp",
          "id": "calmaria",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Verde-musgo com humor",
              "text": "Anton condensado em verde-musgo e um gato de máscara de pepino quebram a seriedade do nicho. A marca parece próxima sem perder o cuidado."
            },
            {
              "icon": "search",
              "title": "Começar pela necessidade",
              "text": "As categorias vêm em cards de foto, com hidratantes, séruns, corpo e kits. Quem é iniciante escolhe por onde começar, não por ativo."
            },
            {
              "icon": "layers",
              "title": "Rotina montada em três passos",
              "text": "Limpar, tratar e hidratar, com aba manhã e noite e um botão para montar a rotina. A sequência vira carrinho em um clique."
            },
            {
              "icon": "shield",
              "title": "Rótulo e dúvidas sem rodeio",
              "text": "Ingredientes como pepino, aloe e niacinamida ganham card próprio, e o FAQ fala de pele sensível, gravidez e troca. As objeções de quem compra online ficam respondidas."
            }
          ],
          "lab": true,
          "accent": "#2E4A33",
          "fonts": [
            "Anton",
            "Plus Jakarta Sans"
          ],
          "sections": 9,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Novo skincare",
                "sub": "Herói, garantias e selos"
              },
              {
                "label": "Por onde começar",
                "sub": "Categorias e mais amados"
              },
              {
                "label": "Cinco minutos",
                "sub": "O kit ritual em destaque"
              },
              {
                "label": "Ingredientes e rotina",
                "sub": "O que vai na fórmula e como usar"
              },
              {
                "label": "Depoimentos e FAQ",
                "sub": "Dúvidas e cupom de 10%"
              }
            ]
          },
          "signature": "Um gato persa laranja com rodelas de pepino nos olhos, recortado entre as palavras NOVO SKINCARE em verde-musgo.",
          "goal": "Montar a rotina",
          "niche": "comercio",
          "mood": "light"
        },
        {
          "title": "Altamar · Landing de GT elétrico de luxo",
          "desc": "Estudo para uma marca fictícia de GT elétrico de luxo, voltada a quem quer potência silenciosa para viagens longas na costa.",
          "longDesc": "Altamar é uma marca automotiva fictícia de GTs elétricos, criada como estudo de lançamento. O público é quem compra carro de luxo para estrada e quer potência sem barulho. O site precisa levar essa pessoa a agendar um test drive de noventa minutos.\n\nA página apresenta \"Três maneiras de chegar ao mar\" com os três modelos, os números de \"Potência que não precisa levantar a voz\", a cabine em \"Uma cabine feita para a viagem longa\" e o agendamento em \"Noventa minutos na estrada valem mais que um catálogo\". No fim, uma seção mostra o design system da marca. Tons de areia e uma assinatura manuscrita dão o ar de pôr do sol na costa.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/48-carro-luxo/",
          "cover": "img/covers/altamar.webp",
          "id": "altamar",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Areia, serifa e assinatura",
              "text": "O destaque cor de areia e a caligrafia Mrs Saint Delafield dão ao carro um tom de viagem, não de pista. A seção final abre a paleta e a tipografia da marca."
            },
            {
              "icon": "gauge",
              "title": "Números em painel escuro",
              "text": "Potência, aceleração, autonomia e recarga ganham um bloco escuro com régua de desempenho. É o único momento barulhento de uma página calma."
            },
            {
              "icon": "search",
              "title": "Três modelos para comparar",
              "text": "Maré GT, Falésia e Restinga aparecem com filtro por tipo e três números cada. O comprador entende a linha sem abrir uma ficha técnica."
            },
            {
              "icon": "users",
              "title": "Test drive com rota escolhida",
              "text": "O formulário pede modelo, contato, cidade e data, e o lado direito mostra o carro na rota Serra–Mirante. A visita vira passeio marcado."
            }
          ],
          "lab": true,
          "accent": "#A8967F",
          "fonts": [
            "Mrs Saint Delafield"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "O movimento",
                "sub": "Herói com o GT e o test drive"
              },
              {
                "label": "Três maneiras",
                "sub": "Os modelos lado a lado"
              },
              {
                "label": "Potência e cabine",
                "sub": "Números e interior"
              },
              {
                "label": "Noventa minutos",
                "sub": "Agendamento do test drive"
              },
              {
                "label": "Aspectos do design",
                "sub": "Paleta, tipo e convite final"
              }
            ]
          },
          "signature": "O GT azul parado na estrada costeira ao entardecer, com \"Move que nem um sonho\" escrito à mão em Mrs Saint Delafield ao lado do título.",
          "goal": "Agendar test drive",
          "niche": "auto",
          "mood": "light"
        },
        {
          "title": "Lâmina Diagnósticos · Site de laboratório de análises clínicas",
          "desc": "Estudo para um laboratório fictício de análises clínicas, para pacientes que querem marcar exame, entender o preparo e acompanhar o laudo.",
          "longDesc": "Lâmina Diagnósticos é um laboratório fictício de análises clínicas, criado como estudo de site institucional. O público é o paciente com pedido médico na mão, que quer saber preço, preparo e prazo antes de sair de casa. A ação principal é agendar a coleta, no laboratório ou em domicílio.\n\nA página mostra \"Exames mais procurados\" com preço e preparo, entra \"Por dentro do laboratório\", traz o depoimento em \"Quem coletou conta\" e lista os \"Serviços do laboratório\". Depois vêm o acompanhamento do laudo, quatro passos, FAQ e o formulário. Azul-marinho com azul-ciano e Barlow Condensed dão firmeza técnica sem frieza de hospital.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/49-laboratorio/",
          "cover": "img/covers/lamina-diagnosticos.webp",
          "id": "lamina-diagnosticos",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Azul técnico em caixa-alta",
              "text": "Barlow Condensed em caixa-alta, com a última palavra em azul-ciano, dá aos títulos um tom de laudo. O azul-marinho dos blocos escuros passa seriedade."
            },
            {
              "icon": "search",
              "title": "Exames com preço e preparo",
              "text": "Os mais procurados aparecem com valor, jejum e prazo, filtrados por sangue e hormônios. O paciente decide antes de ligar."
            },
            {
              "icon": "chart",
              "title": "Laudo acompanhado etapa a etapa",
              "text": "Um painel mostra a amostra coletada, em análise e liberada, com aviso no app. Responde à ansiedade de quem espera resultado."
            },
            {
              "icon": "users",
              "title": "Coleta em casa no formulário",
              "text": "O agendamento pede nome, WhatsApp e exames do pedido, e oferece coleta domiciliar. Atende idosos e crianças sem fila."
            }
          ],
          "lab": true,
          "accent": "#1EA7E1",
          "fonts": [
            "Barlow Condensed",
            "Barlow"
          ],
          "sections": 10,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Rigor e confiança",
                "sub": "Herói com agendamento e preparo"
              },
              {
                "label": "Mais procurados",
                "sub": "Exames com preço e jejum"
              },
              {
                "label": "O laboratório",
                "sub": "Bastidores, números e depoimento"
              },
              {
                "label": "Serviços e laudo",
                "sub": "Domiciliar, rotina e acompanhamento"
              },
              {
                "label": "Agende sua coleta",
                "sub": "Quatro passos, FAQ e formulário"
              }
            ]
          },
          "signature": "Uma mão de luva azul segurando o tubo de coleta com tampa vermelha, ao lado do título em caixa-alta condensada branca.",
          "goal": "Agendar coleta",
          "niche": "saude",
          "mood": "light"
        },
        {
          "title": "Ávora · Site de locadora de carros premium",
          "desc": "Estudo para uma locadora fictícia de carros premium, para quem viaja de carro e quer escolher o modelo certo para cada rota.",
          "longDesc": "Ávora é uma locadora fictícia de carros premium, criada como estudo de marca e de fluxo de reserva. O público é quem faz viagem de estrada e quer um carro à altura do caminho, sem balcão nem papelada. O site precisa levar a pessoa a fechar a reserva.\n\nDepois do herói com busca, vêm \"Escolha o carro antes de escolher a rota\", os \"Quatro degraus entre a reserva e a estrada\", as \"Rotas que valem cada quilômetro\" e \"A reserva inteira cabe numa tela\". Bege-dourado sobre creme com cards escuros deixa a locadora com cara de hotel, não de estacionamento.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/50-aluguel-carros/",
          "cover": "img/covers/avora.webp",
          "id": "avora",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Dourado discreto de hotel",
              "text": "Um bege-dourado sobre creme e blocos pretos aparecem só nos momentos-chave. A locadora soa como hospitalidade, não como frota."
            },
            {
              "icon": "search",
              "title": "Frota filtrada por estilo",
              "text": "Os carros filtram por sedã, SUV, esportivo, elétrico e conversível, com diária e câmbio no card. A escolha começa pelo tipo de viagem."
            },
            {
              "icon": "globe",
              "title": "Rotas sugeridas com o carro",
              "text": "Litoral, serra e interior aparecem como destinos com quilometragem. O site vende a viagem antes de vender a diária."
            },
            {
              "icon": "layers",
              "title": "Reserva resumida num card",
              "text": "Uma tela mostra o carro, as datas, os opcionais como seguro e cadeirinha e o total. Nada de surpresa no balcão."
            }
          ],
          "lab": true,
          "accent": "#A8875A",
          "fonts": [],
          "sections": 9,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói com busca",
                "sub": "Local, datas e garantias"
              },
              {
                "label": "Escolha o carro",
                "sub": "Frota com filtro por estilo"
              },
              {
                "label": "Quatro degraus",
                "sub": "Da reserva à estrada"
              },
              {
                "label": "Rotas e reserva",
                "sub": "Destinos e resumo do pedido"
              },
              {
                "label": "Fechamento",
                "sub": "Depoimentos, FAQ e proposta"
              }
            ]
          },
          "signature": "Os quatro passos da reserva desenhados como degraus escuros que sobem da esquerda para a direita.",
          "goal": "Reservar carro",
          "niche": "auto",
          "mood": "light"
        },
        {
          "title": "Orvalho · Landing de gel de limpeza facial com vitamina C",
          "desc": "Estudo para uma marca fictícia de skincare cítrico e seu gel de limpeza, para quem quer uma rotina rápida e fresca.",
          "longDesc": "Orvalho é uma marca fictícia de skincare com limão-siciliano, criada como estudo de landing de produto único. O herói é um gel de limpeza facial com vitamina C. O público é quem quer lavar o rosto direito em um minuto, sem complicação. O site precisa vender o gel e, de preferência, a rotina inteira.\n\nA página passa por \"Quatro ativos, cada um com uma função\", por \"Sessenta segundos, manhã e noite\", pelo teste em \"O que 42 pessoas sentiram em 21 dias\" e por \"A rotina completa, do mesmo limão\". Verde-folha e amarelo-limão deixam o frescor visível antes de qualquer texto.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/51-skincare-vidro/",
          "cover": "img/covers/orvalho.webp",
          "id": "orvalho",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Verde-folha e amarelo-limão",
              "text": "A paleta sai direto do ingrediente: folha verde, casca amarela e fundo claro. O frescor da fórmula vira cor antes de virar argumento."
            },
            {
              "icon": "chart",
              "title": "Teste de uso em gráfico",
              "text": "O site mostra o teste com participantes em barras, gráfico por semana e diário de uso. Os números são apresentados como exemplo da marca fictícia."
            },
            {
              "icon": "gauge",
              "title": "Rotina cronometrada",
              "text": "Molhar, massagear por 60 segundos e enxaguar, com aba manhã e noite e um cronômetro na foto. O minuto prometido fica concreto."
            },
            {
              "icon": "layers",
              "title": "Linha completa para subir o pedido",
              "text": "Gel, sérum, gel-creme e tônico aparecem com preço e botão de adicionar. Quem veio pelo gel sai com a rotina."
            }
          ],
          "lab": true,
          "accent": "#2E7D32",
          "fonts": [
            "Plus Jakarta Sans"
          ],
          "sections": 10,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Frescor cítrico",
                "sub": "Herói com compra e avaliações"
              },
              {
                "label": "Quatro ativos",
                "sub": "Função de cada ingrediente"
              },
              {
                "label": "Sessenta segundos",
                "sub": "Como usar, manhã e noite"
              },
              {
                "label": "Teste de 21 dias",
                "sub": "Resultados e linha completa"
              },
              {
                "label": "Depoimentos e FAQ",
                "sub": "Dúvidas e cupom de 10%"
              }
            ]
          },
          "signature": "O tubo amarelo do gel entre limões e folhas, com gotas d'água sobre um fundo verde desfocado.",
          "goal": "Comprar o gel",
          "niche": "bemestar",
          "mood": "light"
        },
        {
          "title": "Partida · Plataforma de aluguel de carros por app",
          "desc": "Estudo para uma locadora fictícia que aluga por diária, semana ou assinatura, para quem quer retirar o carro sem balcão.",
          "longDesc": "Partida é uma plataforma fictícia de aluguel de carros, criada como estudo de produto digital. Ela aluga por diária, semana ou assinatura, com contrato no celular e retirada por código. O público é quem odeia fila de locadora e taxa surpresa. O site precisa levar a pessoa da busca à escolha do carro.\n\nO herói já traz a busca com local e datas. Depois vêm \"Nada de locadora do jeito de sempre\", \"Escolha seu carro\", os destinos da temporada e os planos em \"Pague pelo tempo que você usa\". Preto, branco e fotos em preto e branco deixam o produto com cara de app, sóbrio e direto.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/52-drive-locadora/",
          "cover": "img/covers/partida.webp",
          "id": "partida",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Preto e branco de app",
              "text": "Sem cor de destaque, o site usa só preto, branco e fotos dessaturadas nos destinos. O carro e o preço viram os únicos pontos de atenção."
            },
            {
              "icon": "search",
              "title": "Busca na primeira dobra",
              "text": "Local de retirada, datas e categoria ficam numa barra logo abaixo do herói. Quem chega já sabe o que fazer."
            },
            {
              "icon": "gauge",
              "title": "Três planos por tempo de uso",
              "text": "Diária, semanal e assinatura aparecem lado a lado com o que cada um inclui. O plano do meio ganha fundo preto como o mais escolhido."
            },
            {
              "icon": "shield",
              "title": "Retirada por código no celular",
              "text": "Quatro passos mostram escolha, envio da CNH, código de retirada e devolução, com a tela do app ao lado. A promessa de zero balcão fica visível."
            }
          ],
          "lab": true,
          "accent": "#0E0E0E",
          "fonts": [],
          "sections": 9,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Herói com busca",
                "sub": "Local, datas e categoria"
              },
              {
                "label": "Sem balcão",
                "sub": "A proposta em números e fotos"
              },
              {
                "label": "Escolha seu carro",
                "sub": "Frota com filtro e diária"
              },
              {
                "label": "Destinos e passos",
                "sub": "Temporada e retirada por código"
              },
              {
                "label": "Planos e FAQ",
                "sub": "Diária, semana, assinatura"
              }
            ]
          },
          "signature": "O jipe preto no pôr do sol do herói, com a barra de busca de local, datas e categoria encaixada logo abaixo.",
          "goal": "Encontrar meu carro",
          "niche": "auto",
          "mood": "light"
        },
        {
          "title": "PRENSA Smash Burger · Site de hamburgueria de smash com cardápio e pedido",
          "desc": "Estudo para uma hamburgueria fictícia de smash burger de rua, com cardápio filtrável e pedido para retirada ou entrega.",
          "longDesc": "Prensa é uma hamburgueria fictícia de smash burger, criada como estudo de marca de comida de rua. O público é quem quer um lanche honesto, com borda crocante e queijo escorrendo, perto de casa. O site precisa fazer a pessoa pedir, seja para retirar, receber ou comer na mesa.\n\nDepois do manifesto da casa, o cardápio aparece em \"Escolhe o estrago\", o método em \"Três passos, zero atalho\" e a fila em \"Fumaça, fila e gente boa\". Tudo leva ao pedido em \"Pede que a chapa tá quente\". Vermelho de chapa com Big Shoulders condensada dá o volume de placa de rua.",
          "stack": [
            "HTML5",
            "CSS3",
            "JavaScript (vanilla)",
            "GSAP"
          ],
          "link": "https://lab.bernardoiannini.com/sites/55-burger-smash/",
          "cover": "img/covers/prensa-smash-burger.webp",
          "id": "prensa-smash-burger",
          "category": "site",
          "featured": false,
          "status": "no ar",
          "year": "2026",
          "topics": [
            {
              "icon": "palette",
              "title": "Vermelho de chapa e letra de placa",
              "text": "Big Shoulders condensada em caixa-alta e vermelho vivo lembram letreiro de lanchonete. Fitas diagonais com gírias da casa cortam as seções."
            },
            {
              "icon": "search",
              "title": "Cardápio filtrado por fome",
              "text": "As abas separam smash, frango, veggie e acompanhamentos, com preço e botão de adicionar em cada lanche. Escolher leva segundos."
            },
            {
              "icon": "layers",
              "title": "Pedido com comanda ao lado",
              "text": "O formulário troca entre retirada, entrega e mesa, e uma comanda de papel mostra itens e total. Dá para fechar pelo site ou mandar no WhatsApp."
            },
            {
              "icon": "globe",
              "title": "Mapa e horário da chapa",
              "text": "Um mapa ilustrado marca o endereço e uma tabela mostra os dias e horários de funcionamento. Quem quer ir até lá não precisa perguntar."
            }
          ],
          "lab": true,
          "accent": "#E3171A",
          "fonts": [
            "Big Shoulders Display",
            "Bricolage Grotesque"
          ],
          "sections": 8,
          "role": "design, copy e front-end",
          "flow": {
            "steps": [
              {
                "label": "Smash de rua",
                "sub": "Herói com pedido e cardápio"
              },
              {
                "label": "Manifesto",
                "sub": "Blend, chapa e tempo de preparo"
              },
              {
                "label": "Escolhe o estrago",
                "sub": "Cardápio com abas e preço"
              },
              {
                "label": "Método e fila",
                "sub": "Três passos e fotos da casa"
              },
              {
                "label": "Pede e vem",
                "sub": "Pedido, mapa e horário"
              }
            ]
          },
          "signature": "A palavra SMASH em letras brancas gigantes sobre fundo vermelho, com o hambúrguer na frente e uma fita de avisos atravessando na diagonal.",
          "goal": "Fazer o pedido",
          "niche": "comida",
          "mood": "light"
        }
        /* LAB:END */
      ]
    },

    contact: {
      kicker: "Vamos conversar",
      lineA: "Vamos construir algo real,",
      lineB: "com impacto real.",
      sub: "Seja um produto, um site ou só uma ideia, estou a um clique de distância.",
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
        sub: "Escolha um canal abaixo ou me mande uma mensagem. Respondo rápido.",
        or: "ou me escreva",
        send: "Enviar mensagem",
        whatsMeta: "+55 31 99562-4617",
        fillAll: "Preencha todos os campos.",
        opening: "Abrindo seu cliente de e-mail…"
      }
    },
    blog: {
      bento: { topics: "Temas", allTopics: "Ver todos os temas", more: "Ler mais", read: "min de leitura", featured: "Destaque" },
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
        bio: "19 anos · Desenvolvedor Full Stack · AI Designer. Escrevo sobre o que aprendo no caminho: engenharia, IA, design e os bastidores dos projetos que construo.",
        contact: "Contato"
      },
      featured: {
        latest: "Mais recente",
        spotlight: "Destaque",
        empty: "O primeiro post está chegando.",
        badge: "Destaque"
      },
      footer: { rights: "Todos os direitos reservados", madeBy: "Feito por" }
    },
    post: {
      back: "Voltar ao blog",
      share: { label: "Compartilhar este post" },
      linkedin: "Ver post original no LinkedIn",
      related: { kicker: "Continue lendo", title: "Posts relacionados" },
      author: {
        kicker: "Sobre o autor",
        bio: "19 anos · Desenvolvedor Full Stack · AI Designer. Escrevo sobre o que aprendo no caminho: engenharia, IA, design e os bastidores dos projetos que construo.",
        contact: "Contato"
      },
      footer: { back: "Voltar ao blog", portfolio: "Portfólio" }
    }
  }
};

/* idioma inicial: o salvo (paginas bilingues gravam o da rota antes deste
   script) > o preferido do navegador, se for pt ou en > ingles */
function browserLang() {
  const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  const hit = list.find(l => /^(pt|en)/i.test(l));
  return hit ? hit.slice(0, 2).toLowerCase() : null;
}
let LANG = localStorage.getItem('lang') || browserLang() || 'en';

/* =========================================================
   NAVBAR (apenas lang code + lang do <html>)
   ========================================================= */
function renderNav(lang) {
  const code = document.getElementById('langCode');
  if (code) code.textContent = lang.toUpperCase();
  document.documentElement.lang = I18N[lang].htmlLang || lang;
  /* curriculo no idioma ativo: PT -> Curriculo_..., EN -> Resume_... */
  document.querySelectorAll('a[href$="Curriculo_Bernardo_Iannini.pdf"], a[href$="Resume_Bernardo_Iannini.pdf"]').forEach(a => {
    a.setAttribute('href', '/' + (lang === 'pt' ? 'Curriculo_Bernardo_Iannini.pdf' : 'Resume_Bernardo_Iannini.pdf'));
  });
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
  if (typeof renderProjectCase === 'function') renderProjectCase(lang);
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
    el.getAttribute('data-i18n-attr').split(';').forEach(spec => {
      const [attr, keyPath] = spec.split(':');
      if (!attr || !keyPath) return;
      const val = keyPath
        .split('.')
        .reduce((obj, k) => obj?.[k], I18N[lang]);
      if (typeof val === 'string') el.setAttribute(attr.trim(), val);
    });
  });

  // Sincroniza a seleção do menu de idioma com o lang ativo — precisa
  // rodar no BOOT também (não só no clique), senão o leitor de tela e o
  // foco do menu apontam o idioma errado quando há preferência salva.
  document.querySelectorAll('#langMenu [data-lang]').forEach(o =>
    o.setAttribute('aria-selected', String(o.getAttribute('data-lang') === lang)));

  // Marca i18n como pronto — remove a máscara de anti-flicker do <body>
  // (CSS inline em page-fx faz o fade-in suave)
  document.documentElement.classList.add('i18n-ready');
}

/* =========================================================
   LANGUAGE SWITCH (menu suspenso do header)
   ========================================================= */
/* escolha explicita de idioma: cookie que o middleware.js le no servidor
   (vale mais que o pais do IP nas proximas visitas) */
function rememberLang(lang) {
  document.cookie = 'lang=' + lang + '; path=/; max-age=31536000; samesite=lax';
}

(function languageSwitch() {
  const btn = document.getElementById('langBtn');
  const menu = document.getElementById('langMenu');

  if (!btn || !menu) return;

  const options = [...menu.querySelectorAll('[data-lang]')];

  function openMenu() {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    // foca a opção já selecionada (ou a primeira) — teclado entra pronto
    (options.find(o => o.getAttribute('aria-selected') === 'true') || options[0])?.focus();
  }
  function closeMenu(focusBtn) {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    if (focusBtn) btn.focus();
  }
  function select(li) {
    const lang = li.getAttribute('data-lang');
    if (!lang) return;
    closeMenu(true);
    rememberLang(lang);
    /* pagina com versao propria no outro idioma (hreflang): vai pra ela */
    const alt = document.querySelector(`link[rel="alternate"][hreflang^="${lang}"]`);
    if (alt) {
      const dest = new URL(alt.href);
      if (dest.pathname !== location.pathname) { location.href = dest.pathname + location.hash; return; }
    }
    applyI18n(lang); // já sincroniza aria-selected das opções
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu(false) : openMenu();
  });
  // seta pra baixo no botão abre e entra no menu
  btn.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(); }
  });

  options.forEach((li, i) => {
    li.addEventListener('click', () => select(li));
    li.addEventListener('keydown', e => {
      switch (e.key) {
        case 'Enter':
        case ' ':        e.preventDefault(); select(li); break;
        case 'ArrowDown': e.preventDefault(); options[(i + 1) % options.length].focus(); break;
        case 'ArrowUp':   e.preventDefault(); options[(i - 1 + options.length) % options.length].focus(); break;
        case 'Escape':    e.preventDefault(); closeMenu(true); break;
        /* Tab NÃO é interceptado: o foco caminha English→Português→próximo
           controle naturalmente, e o focusout abaixo fecha o menu sem
           perder o foco (fechar aqui jogava o foco pro topo da página). */
      }
    });
  });

  // fecha ao SAIR do menu por teclado (Tab pra fora) — relatedTarget é o
  // próximo focado; se não for o botão nem outra opção, fecha sem roubar foco
  menu.addEventListener('focusout', e => {
    if (!menu.contains(e.relatedTarget) && e.relatedTarget !== btn) closeMenu(false);
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu(false);
  });
})();


