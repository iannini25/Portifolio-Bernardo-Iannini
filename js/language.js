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
    a11y: { skip: "Skip to content" },
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
      kicker: "The Journey",
      title: "The Journey",
      titleA: "Built from curiosity,",
      titleB: "shaped by code.",
      sub: "A bit about me, what I do and what I love building.",
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
            title: "Web Developer & Digital Support",
            org: "Inspire4U",
            role: "Internship",
            loc: "Belo Horizonte, MG",
            start: { year: 2025, month: "MAY" },
            end: { year: 2026, month: "JAN" },
            bullets: [
              "Development and maintenance of WordPress websites, focused on performance and usability.",
              "HTML and CSS adjustments plus small JavaScript customizations to refine design and experience.",
              "On-page SEO to improve the visibility and ranking of the sites.",
              "Digital support and ongoing maintenance of the web projects, backing the partner fintechs."
            ],
            skills: ["WordPress", "HTML", "CSS", "JavaScript", "SEO", "Maintenance"]
          },
          {
            title: "Full Stack Developer on Athena7",
            org: "Inspire4U",
            role: "Internship",
            loc: "Belo Horizonte, MG",
            start: { year: 2026, month: "JAN" },
            end: { year: 2026, month: "JUN" },
            bullets: [
              "Joined Athena7 with the product already underway and took over full-stack development, carrying the platform's evolution forward.",
              "Shipped new features and restructured several parts of the system, so it gained consistency and scale.",
              "Took the platform to production, taking part in the deploy and in running it in a real environment.",
              "Led the infrastructure migration between AWS and a private VPS, tuning environment and production services.",
              "Worked on the core reporting flows and the AI integration, always with an eye on UX, reliability and protecting sensitive data."
            ],
            skills: ["TypeScript", "React", "Node.js", "MySQL", "AI Integration", "Deploy", "AWS", "VPS"]
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
              "Moeda Nobre, for the fintech Tribex: responsible for developing the digital corporate-benefits currency platform.",
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
            title: "Designing products and services with AI",
            org: "MIT",
            role: "Student",
            start: { year: 2025, month: "JUN" },
            end: { year: 2025, month: "AUG" },
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
        videoSoon: "Video coming soon",
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
          cover: "img/athena7-cover.webp",
          id: "athena7",
          category: "system",
          featured: true,
          featuredOrder: 1,
          status: "in production",
          year: "2026",
          role: "evolution & deploy",
          /* preview animado do card (mp4/webm 1600x900 em loop, <=3MB) —
             vazio = usa a cover. Ver PROJETOS-EM-CONSTRUCAO.md. */
          preview: "videos/preview/athena7.mp4",
          /* screen-recording: scroll através do site ao vivo (autoplay/loop) */
          video: "videos/preview/athena7-site.mp4",
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
          cover: "img/moedanobre-cover.webp",
          featured: true,
          featuredOrder: 2,
          id: "moedanobre",
          category: "system",
          status: "in production",
          year: "2026",
          role: "platform development",
          preview: "videos/preview/moedanobre.mp4",
          video: "videos/preview/moedanobre-site.mp4",
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
          cover: "img/iba-cover.webp",
          featured: true,
          featuredOrder: 3,
          id: "iba",
          category: "system",
          status: "in production",
          year: "2026",
          role: "full-stack, whole product",
          preview: "videos/preview/iba.mp4",
          video: "videos/preview/iba-site.mp4",
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
        {
          title: "Módulo Engenharia · Heavy-Industry Automation Site",
          desc: "Institutional site for an engineering firm that automates and maintains the critical machinery of heavy industry: mining, steel, offshore and energy.",
          longDesc: `Módulo Engenharia sells automation, electrical engineering and field maintenance for industry that cannot afford to stop. The site is a single-page journey that opens on a cinematic offshore hero, walks through six services and the four operating segments, and closes on a contact block that turns a visitor into a direct WhatsApp conversation with an engineer. It is a static Astro build with a self-hosted GSAP, ScrollTrigger and Lenis stack and self-hosted fonts, no CDN in production, content driven from typed source files, and Vitest guarding the WhatsApp and form logic.`
          ,
          stack: ["Astro", "TypeScript", "GSAP", "Lenis", "Canvas", "CSS3", "Vitest"],
          link: "https://modulo-engenharia.vercel.app",
          repo: "https://github.com/iannini25/Modulo-engenharia",
          cover: "img/modulo-engenharia.webp",
          id: "modulo-engenharia",
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          preview: "videos/preview/modulo-engenharia.mp4",
          video: "videos/preview/modulo-engenharia.mp4",
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
        },
        {
          title: "BRASA · Fire Kitchen Restaurant",
          desc: "Landing page for BRASA, an authorial live-fire restaurant in São Paulo serving aged cuts over wood embers, with an à la carte menu, a twelve-seat chef's counter and table reservations.",
          longDesc: `BRASA is a fine-dining fire kitchen in São Paulo: long-aged cuts cooked over live wood embers, a twelve-seat chef's counter and a six-course experience. The site sells that room before you walk in, opening on a cinematic hero where a 241-frame JPEG sequence paints on a canvas driven by the scroll, then flowing through the house story, the à la carte menu, an embedded sommelier and a reservation form. It is a hand-built no-build static site in HTML, CSS and vanilla JavaScript, using GSAP ScrollTrigger and Lenis for the scroll cinematics and a full PT and EN dictionary, with a static poster fallback on mobile and reduced motion.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://brasa-restaurante-ten.vercel.app",
          repo: "https://github.com/iannini25/brasa-restaurante",
          cover: "img/brasa-restaurante.webp",
          id: "brasa",
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          preview: "videos/preview/brasa.mp4",
          video: "videos/preview/brasa.mp4",
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
        },
        {
          title: "Sereno · Massage & Rest Studio",
          desc: "Premium landing page for a massage and rest studio that turns browsing into a session booked over WhatsApp.",
          longDesc: `Sereno is a quiet luxury studio in Savassi, Belo Horizonte, selling massage and rest as a ritual, from single sessions to monthly and annual plans. The site opens on a scroll-video hero: the camera advances through the room and descends to the reception, drawn frame by frame on a canvas tied to the scroll, so two AI generated clips read as one continuous shot. It is hand coded in vanilla HTML, CSS and JavaScript, with GSAP, ScrollTrigger and Lenis driving the smooth scroll, the pinned horizontal gallery and the reveals, and a booking form that assembles the visitor's request into a ready to send WhatsApp message.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://sereno-site-one.vercel.app",
          repo: "https://github.com/iannini25/sereno-site",
          cover: "img/sereno.webp",
          id: "sereno",
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          preview: "videos/preview/sereno.mp4",
          video: "videos/preview/sereno.mp4",
          topics: [
            { icon: "sparkles", title: "Scroll-video hero on canvas",
              text: "182 JPG frames from two clips are drawn one by one on a canvas as you scroll, so the camera glides from the room down to the reception as one seamless shot." },
            { icon: "layers", title: "Graceful three-level fallback",
              text: "The hero engine reads a frames manifest and degrades on its own: real frames, then two images with crossfade, then a single Ken-Burns still, always respecting prefers-reduced-motion." },
            { icon: "chart", title: "WhatsApp as the booking engine",
              text: "The visit form collects name, WhatsApp, chosen ritual and best day, then assembles a prefilled WhatsApp message so the studio confirms in minutes with no backend to run." },
            { icon: "palette", title: "Quiet luxury design system",
              text: "A from-scratch brand and pt-BR copy on a cream, blush and gold palette, set in Cormorant Garamond and Jost, with a pinned horizontal gallery walking through a session minute by minute." }
          ]
        },
        {
          title: "Amaro.fy · Made-to-order crochet",
          desc: "A cinematic one-page site for Amaro.fy, a handmade crochet studio in Belo Horizonte that makes exclusive pieces to order and closes every sale over WhatsApp.",
          longDesc: `Amaro.fy sells handmade crochet: each piece is knitted from scratch, in the client's size and color, from a photo or an idea she sends in. The site turns that into a scroll-driven story, from a made-to-order manifesto and a four-step process to a pinned horizontal gallery of finished pieces, plus sizing, care and packaging notes, and it ends in an order form that builds a ready-to-send WhatsApp message so the conversation starts already filled in. Hand-coded in vanilla HTML, CSS and JavaScript with GSAP, ScrollTrigger and Lenis, no build step, degrading gracefully on reduced motion and touch.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://amarofy.vercel.app",
          repo: "https://github.com/iannini25/amaro.fy-website",
          cover: "img/amarofy.webp",
          id: "amarofy",
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          preview: "videos/preview/amarofy.mp4",
          video: "videos/preview/amarofy.mp4",
          topics: [
            { icon: "sparkles", title: "Scroll-scrub hero",
              text: "The opening plays a 100-frame image sequence drawn to a canvas as you scroll, with a widescreen set for desktop and a vertical set for phones." },
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
          longDesc: `Automotiva Express is a Bosch Car Service repair shop in Buritis, Belo Horizonte, selling dealership-grade service without dealership prices. The whole site is an anti-anxiety machine aimed at the number one pain in auto-shop reviews, the surprise bill: nothing is touched before you approve the quote, if something new comes up mid-repair the shop stops and tells you, and every job leaves with a warranty. It is a cinematic one-page story hand-coded in vanilla HTML, CSS and JavaScript, with a canvas frame-sequence hero driven by the scroll and GSAP, ScrollTrigger and Lenis vendored locally, no CDN and no build step.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://automotiva-express.vercel.app",
          repo: "https://github.com/iannini25/automotiva-express",
          cover: "img/automotiva-express.webp",
          id: "automotiva-express",
          category: "site",
          featured: false,
          status: "in production",
          year: "2026",
          preview: "videos/preview/automotiva-express.mp4",
          video: "videos/preview/automotiva-express.mp4",
          topics: [
            { icon: "shield", title: "You approve the price first",
              text: "Nothing gets touched before you approve the quote. If something new turns up mid-repair, the shop stops and tells you, so the surprise bill that dominates auto-shop reviews simply never happens." },
            { icon: "layers", title: "A four-step process you can follow",
              text: "Real diagnosis, a quote you approve, execution you can track and delivery with a warranty. Every step is visible and nothing moves behind your back." },
            { icon: "gauge", title: "Bosch Car Service standard",
              text: "Dealership-grade work without dealership prices: general mechanics, express services and embedded electrical and electronics, backed by the Bosch Car Service network." },
            { icon: "palette", title: "Cinematic one-page build",
              text: "A scroll-driven story with a canvas frame-sequence hero, hand-coded in vanilla HTML, CSS and JavaScript with GSAP, ScrollTrigger and Lenis vendored locally, no CDN and no build step." }
          ]
        },
        {
          title: "bernardoiannini.com · This Site",
          desc: "The site you're on right now: 100% vanilla HTML, CSS and JS, no frameworks, with its own design system.",
          longDesc: `This portfolio is a static site written by hand in vanilla HTML, CSS and JavaScript, with no frameworks anywhere in the stack. Every visual decision lives in a custom design system driven by CSS tokens, and the motion layer runs on GSAP 3 with ScrollTrigger and Lenis smooth scrolling. Remove GSAP and the site still works from end to end.

The EN/PT switch is an i18n engine written from scratch: the entire site changes language without reloading the page. The Newsroom is compiled at build time by a Node script that turns Markdown into static pages, managed through a local admin panel backed by Supabase. Deploys are fully static on Vercel, with sitemap, aria attributes and reduced-motion support.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP 3", "ScrollTrigger", "Lenis", "Node.js", "Markdown", "Supabase", "Vercel"],
          link: "https://bernardoiannini.com",
          repo: "https://github.com/iannini25/iannini-Frontend-Studio",
          cover: "img/portfolio-cover.webp",
          id: "portfolio",
          category: "personal",
          status: "in production",
          year: "2026",
          preview: "",
          video: "",
          topics: [
            { icon: "palette", title: "A design system in pure CSS",
              text: "Colors, spacing and type all resolve to CSS tokens, no framework underneath. GSAP 3, ScrollTrigger and Lenis handle motion on top of that base." },
            { icon: "globe", title: "Two languages, zero reloads",
              text: "The EN/PT engine was written by hand: one click swaps every string on the site without reloading the page, no i18n library involved." },
            { icon: "layers", title: "Markdown in, static pages out",
              text: "A Node build compiles the Newsroom from Markdown into plain static pages. Posts are managed in a local admin panel backed by Supabase." },
            { icon: "gauge", title: "Fully working with motion off",
              text: "Disable GSAP and every page keeps working: motion is an extra layer, never a dependency. Reduced-motion respected, on a fully static Vercel deploy." }
          ]
        }
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
      footer: { rights: "All rights reserved" }
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
    a11y: { skip: "Pular para o conteúdo" },
    tabAway: "volta aqui :(",
    modes: { prof: "Profissional", acad: "Acadêmica", courses: "Cursos & Certificações" },
    hero: { hello: "Olá, eu sou" },
    taglines: [
      "Full Stack Developer.",
      "Corrijo erros do Vibe Coding.",
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
              "Desenvolvimento e manutenção de sites em WordPress, com foco em performance e usabilidade.",
              "Ajustes em HTML e CSS e pequenas customizações em JavaScript para refinar design e experiência.",
              "Aplicação de SEO on-page para melhorar a visibilidade e o posicionamento dos sites.",
              "Suporte digital e manutenção contínua dos projetos web, apoiando as fintechs parceiras."
            ],
            skills: ["WordPress", "HTML", "CSS", "JavaScript", "SEO", "Manutenção"]
          },
          {
            title: "Full Stack Developer no Athena7",
            org: "Inspire4U",
            role: "Estágio",
            loc: "Belo Horizonte, MG",
            start: { year: 2026, month: "JAN" },
            end: { year: 2026, month: "JUN" },
            bullets: [
              "Entrei no Athena7 com o produto já em andamento e assumi o desenvolvimento full-stack, dando continuidade à evolução da plataforma.",
              "Implementei novas funcionalidades e reestruturei várias partes do sistema, que ganhou mais consistência e escala.",
              "Levei a plataforma até produção, participando do deploy e da operação em ambiente real.",
              "Conduzi a migração de infraestrutura entre AWS e VPS privada, ajustando ambiente e serviços de produção.",
              "Trabalhei nos fluxos centrais de denúncia e na integração de IA, sempre de olho em UX, confiabilidade e proteção de dados sensíveis."
            ],
            skills: ["TypeScript", "React", "Node.js", "MySQL", "Integração IA", "Deploy", "AWS", "VPS"]
          },
          {
            title: "Full Stack Developer",
            org: "Freelancer",
            role: "Autônomo",
            loc: "Remoto · Brasil/Irlanda",
            start: { year: 2026, month: "JUN" },
            end: { current: true },
            bullets: [
              "Desenvolvimento full-stack de ponta a ponta: plataformas SaaS, landing pages, automações e sistemas sob medida, do design ao deploy em produção.",
              "Pego projetos que foram criados por IA (Vibe Coding), refaço a arquitetura, refatoro o código e deixo tudo pronto pra produção, além de integrações, manutenção e otimização de performance.",
              "Moeda Nobre, da fintech Tribex: responsável pelo desenvolvimento da plataforma de moeda digital de benefícios corporativos.",
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
            title: "Designing products and services with AI",
            org: "MIT",
            role: "Aluno",
            start: { year: 2025, month: "JUN" },
            end: { year: 2025, month: "AGO" },
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
      case: {
        back: "Todos os projetos",
        viewCase: "Ver estudo de caso",
        visitSite: "Visitar site",
        repoBtn: "Código",
        videoSoon: "Vídeo em breve",
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
          cover: "img/athena7-cover.webp",
          id: "athena7",
          category: "system",
          featured: true,
          featuredOrder: 1,
          status: "em produção",
          year: "2026",
          role: "evolução e deploy",
          /* preview animado do card (mp4/webm 1600x900 em loop, ate 3MB);
             vazio = usa a cover. Ver PROJETOS-EM-CONSTRUCAO.md. */
          preview: "videos/preview/athena7.mp4",
          /* gravacao de tela: scroll pelo site ao vivo (autoplay/loop) */
          video: "videos/preview/athena7-site.mp4",
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
          cover: "img/moedanobre-cover.webp",
          featured: true,
          featuredOrder: 2,
          id: "moedanobre",
          category: "system",
          status: "em produção",
          year: "2026",
          role: "desenvolvimento da plataforma",
          preview: "videos/preview/moedanobre.mp4",
          video: "videos/preview/moedanobre-site.mp4",
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
          cover: "img/iba-cover.webp",
          featured: true,
          featuredOrder: 3,
          id: "iba",
          category: "system",
          status: "em produção",
          year: "2026",
          role: "full-stack, produto inteiro",
          preview: "videos/preview/iba.mp4",
          video: "videos/preview/iba-site.mp4",
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
        {
          title: "Módulo Engenharia · Site de Automação Industrial",
          desc: "Site institucional de uma empresa de engenharia que automatiza e mantém as máquinas críticas da indústria pesada: mineração, siderurgia, offshore e energia.",
          longDesc: `A Módulo Engenharia vende automação, engenharia elétrica e manutenção em campo para a indústria que não pode parar. O site é uma jornada de página única que abre num hero offshore cinematográfico, apresenta seis serviços e os quatro segmentos de atuação, e fecha num bloco de contato que transforma o visitante em conversa direta no WhatsApp com um engenheiro. É um build estático em Astro, com GSAP, ScrollTrigger e Lenis self-hosted e fontes self-hosted, sem CDN em produção, conteúdo vindo de arquivos de fonte tipados, e Vitest cobrindo a lógica de WhatsApp e formulário.`
          ,
          stack: ["Astro", "TypeScript", "GSAP", "Lenis", "Canvas", "CSS3", "Vitest"],
          link: "https://modulo-engenharia.vercel.app",
          repo: "https://github.com/iannini25/Modulo-engenharia",
          cover: "img/modulo-engenharia.webp",
          id: "modulo-engenharia",
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          preview: "videos/preview/modulo-engenharia.mp4",
          video: "videos/preview/modulo-engenharia.mp4",
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
        },
        {
          title: "BRASA · Restaurante de Cozinha de Fogo",
          desc: "Landing page da BRASA, restaurante autoral de fogo vivo em São Paulo que serve cortes maturados sobre brasa de lenha, com cardápio à la carte, balcão de chef de doze lugares e reservas de mesa.",
          longDesc: `A BRASA é uma cozinha de fogo autoral em São Paulo: cortes de maturação longa sobre brasa de lenha viva, um balcão de chef com doze lugares e uma experiência de seis tempos. O site vende essa sala antes de você entrar, abrindo num hero cinematográfico onde uma sequência de 241 frames JPEG desenha num canvas dirigido pelo scroll, e segue pela história da casa, pelo cardápio à la carte, por um sommelier embutido e pelo formulário de reservas. É um site estático feito à mão, sem build, em HTML, CSS e JavaScript puro, com GSAP ScrollTrigger e Lenis para o scroll cinematográfico e um dicionário completo PT e EN, além de pôster estático como fallback no mobile e no modo de movimento reduzido.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://brasa-restaurante-ten.vercel.app",
          repo: "https://github.com/iannini25/brasa-restaurante",
          cover: "img/brasa-restaurante.webp",
          id: "brasa",
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          preview: "videos/preview/brasa.mp4",
          video: "videos/preview/brasa.mp4",
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
        },
        {
          title: "Sereno · Estúdio de Massagem & Repouso",
          desc: "Landing page premium para um estúdio de massagem e repouso, que transforma a visita ao site em uma sessão agendada pelo WhatsApp.",
          longDesc: `Sereno é um estúdio de quiet luxury na Savassi, em Belo Horizonte, que vende massagem e repouso como ritual, do avulso aos planos mensal e anual. O site abre num hero de scroll-vídeo: a câmera avança pela sala e desce até a recepção, desenhada quadro a quadro num canvas amarrado à rolagem, fazendo dois clipes gerados por IA parecerem uma tomada só, contínua. Tudo feito à mão em HTML, CSS e JavaScript puro, com GSAP, ScrollTrigger e Lenis cuidando da rolagem suave, da galeria horizontal com pin e dos reveals, e um formulário que monta o pedido do visitante numa mensagem de WhatsApp pronta para enviar.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://sereno-site-one.vercel.app",
          repo: "https://github.com/iannini25/sereno-site",
          cover: "img/sereno.webp",
          id: "sereno",
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          preview: "videos/preview/sereno.mp4",
          video: "videos/preview/sereno.mp4",
          topics: [
            { icon: "sparkles", title: "Hero de scroll-vídeo no canvas",
              text: "182 frames JPG de dois clipes desenhados um a um no canvas conforme a rolagem, com a câmera indo da sala até a recepção numa emenda invisível." },
            { icon: "layers", title: "Fallback em três níveis",
              text: "O motor do hero lê um manifesto de frames e degrada sozinho: frames reais, depois duas imagens com crossfade, depois uma imagem só com Ken-Burns, sempre respeitando prefers-reduced-motion." },
            { icon: "chart", title: "WhatsApp como motor de agendamento",
              text: "O formulário de visita coleta nome, WhatsApp, ritual desejado e melhor dia e monta uma mensagem de WhatsApp pronta, para a casa confirmar em minutos sem nenhum backend." },
            { icon: "palette", title: "Design system quiet luxury",
              text: "Marca e copy em pt-BR criadas do zero, paleta creme, blush e dourado, tipografia Cormorant Garamond e Jost, e uma galeria horizontal com pin que percorre uma sessão minuto a minuto." }
          ]
        },
        {
          title: "Amaro.fy · Crochê sob medida",
          desc: "Site one-page cinematográfico da Amaro.fy, ateliê de crochê artesanal de Belo Horizonte que faz peças exclusivas sob medida e fecha cada venda pelo WhatsApp.",
          longDesc: `A Amaro.fy vende crochê feito à mão: cada peça é tecida do zero, no tamanho e na cor da cliente, a partir de uma foto ou de uma ideia que ela manda. O site transforma isso numa narrativa guiada pelo scroll, do manifesto do feito sob medida ao processo em quatro passos, até uma galeria horizontal fixada com as peças prontas, com orientações de tamanho, cuidados e embalagem, e termina num formulário de pedido que monta uma mensagem de WhatsApp pronta pra enviar, com a conversa já preenchida. Feito à mão em HTML, CSS e JavaScript puro com GSAP, ScrollTrigger e Lenis, sem build, degradando com elegância no toque e no modo de movimento reduzido.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://amarofy.vercel.app",
          repo: "https://github.com/iannini25/amaro.fy-website",
          cover: "img/amarofy.webp",
          id: "amarofy",
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          preview: "videos/preview/amarofy.mp4",
          video: "videos/preview/amarofy.mp4",
          topics: [
            { icon: "sparkles", title: "Herói controlado pelo scroll",
              text: "A abertura roda uma sequência de 100 frames desenhada num canvas conforme você rola, com um conjunto widescreen no desktop e um vertical no celular." },
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
          longDesc: `A Automotiva Express é uma oficina Bosch Car Service no Buritis, em Belo Horizonte, que vende padrão de concessionária sem preço de concessionária. O site inteiro é uma máquina anti-ansiedade mirando a dor número um das avaliações de oficina, o orçamento-surpresa: nada é mexido antes de você aprovar o preço, se aparece algo novo no meio do reparo a oficina para e te avisa, e todo serviço sai com garantia. É uma narrativa one-page cinematográfica feita à mão em HTML, CSS e JavaScript puro, com um herói de sequência de frames no canvas dirigido pelo scroll e GSAP, ScrollTrigger e Lenis vendorizados localmente, sem CDN e sem build.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP", "ScrollTrigger", "Lenis", "Canvas API"],
          link: "https://automotiva-express.vercel.app",
          repo: "https://github.com/iannini25/automotiva-express",
          cover: "img/automotiva-express.webp",
          id: "automotiva-express",
          category: "site",
          featured: false,
          status: "em produção",
          year: "2026",
          preview: "videos/preview/automotiva-express.mp4",
          video: "videos/preview/automotiva-express.mp4",
          topics: [
            { icon: "shield", title: "Você aprova o preço antes",
              text: "Nada é mexido antes de você aprovar o orçamento. Se aparece algo novo no meio do reparo, a oficina para e te avisa, então o orçamento-surpresa que domina as avaliações de oficina simplesmente não acontece." },
            { icon: "layers", title: "Um processo de quatro passos que dá pra acompanhar",
              text: "Diagnóstico de verdade, um orçamento que você aprova, execução com acompanhamento e entrega com garantia. Cada passo é visível e nada anda nas suas costas." },
            { icon: "gauge", title: "Padrão Bosch Car Service",
              text: "Padrão de concessionária sem preço de concessionária: mecânica geral, serviços express e eletricidade e eletrônica embarcada, com o respaldo da rede Bosch Car Service." },
            { icon: "palette", title: "Build one-page cinematográfico",
              text: "Uma narrativa guiada pelo scroll com herói de sequência de frames no canvas, feita à mão em HTML, CSS e JavaScript puro com GSAP, ScrollTrigger e Lenis vendorizados localmente, sem CDN e sem build." }
          ]
        },
        {
          title: "bernardoiannini.com · Este Site",
          desc: "O site em que você está agora: 100% HTML, CSS e JS puros, sem frameworks, com design system próprio.",
          longDesc: `Este portfólio é um site estático escrito à mão em HTML, CSS e JavaScript puros, sem nenhum framework na stack. Cada decisão visual vive num design system próprio guiado por tokens CSS, e a camada de movimento roda em GSAP 3 com ScrollTrigger e rolagem suave via Lenis. Tire o GSAP e o site continua funcionando de ponta a ponta.

A troca EN/PT é um motor de i18n escrito do zero: o site inteiro muda de idioma sem recarregar a página. O Newsroom é compilado no build por um script Node que transforma Markdown em páginas estáticas, gerenciado por um painel admin local com Supabase. O deploy é 100% estático na Vercel, com sitemap, aria e suporte a reduced-motion.`
          ,
          stack: ["HTML5", "CSS3", "JavaScript (vanilla)", "GSAP 3", "ScrollTrigger", "Lenis", "Node.js", "Markdown", "Supabase", "Vercel"],
          link: "https://bernardoiannini.com",
          repo: "https://github.com/iannini25/iannini-Frontend-Studio",
          cover: "img/portfolio-cover.webp",
          id: "portfolio",
          category: "personal",
          status: "em produção",
          year: "2026",
          preview: "",
          video: "",
          topics: [
            { icon: "palette", title: "Design system em CSS puro",
              text: "Cores, espaçamentos e tipografia resolvem em tokens CSS, sem framework por baixo. GSAP 3, ScrollTrigger e Lenis cuidam do movimento por cima dessa base." },
            { icon: "globe", title: "Dois idiomas, zero reload",
              text: "O motor EN/PT foi escrito à mão: um clique troca todas as strings do site sem recarregar a página, sem biblioteca de i18n no meio." },
            { icon: "layers", title: "Markdown entra, página estática sai",
              text: "Um build Node compila o Newsroom de Markdown para páginas estáticas puras. Os posts são gerenciados num painel admin local com Supabase." },
            { icon: "gauge", title: "Funciona inteiro sem o motion",
              text: "Desligue o GSAP e todas as páginas continuam funcionando: o movimento é camada extra, nunca dependência. Reduced-motion respeitado, num deploy 100% estático na Vercel." }
          ]
        }
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
        bio: "19 anos · Full Stack Developer · AI Designer. Escrevo sobre o que aprendo no caminho: engenharia, IA, design e os bastidores dos projetos que construo.",
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
        bio: "19 anos · Full Stack Developer · AI Designer. Escrevo sobre o que aprendo no caminho: engenharia, IA, design e os bastidores dos projetos que construo.",
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
    const spec = el.getAttribute('data-i18n-attr');
    const [attr, keyPath] = spec.split(':');
    if (!attr || !keyPath) return;
    const val = keyPath
      .split('.')
      .reduce((obj, k) => obj?.[k], I18N[lang]);
    if (typeof val === 'string') el.setAttribute(attr, val);
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


