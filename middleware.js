/* =========================================================
   Middleware (Vercel Routing Middleware)

   1) IDIOMA DO VISITANTE
      Paginas que existem nos dois idiomas:
        /                    <->  /pt
        /projetos/<id>.html  <->  /en/projects/<id>.html
        /sobre.html          <->  /en/about.html
      Quem chega numa versao que nao e a sua vai pra outra (302):
        1. escolha salva no seletor (cookie lang);
        2. idioma preferido do navegador (Accept-Language), se ele
           pedir portugues ou ingles;
        3. pais do IP (header x-vercel-ip-country): paises de lingua
           portuguesa -> pt, resto -> en.
      Robos de busca e previews de link NUNCA sao redirecionados:
      o Google rastreia dos EUA e precisa ver as duas versoes
      (o hreflang de cada pagina diz a ele qual mostrar em cada pais).

   2) ROTA ANTIGA
      project.html?slug=<id> era a pagina dinamica dos projetos. O
      redirect do vercel.json repassava a query junto, gerando URL
      duplicada no Google. Aqui o 308 vai direto pra URL limpa.
   ========================================================= */
export const config = {
  matcher: ['/', '/index.html', '/pt', '/sobre.html', '/en/about.html', '/projetos/:path*', '/en/projects/:path*', '/project.html'],
};

const LUSOPHONE = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL']);
const BOT = /bot|crawl|spider|slurp|archiver|facebookexternalhit|embedly|preview|lighthouse|pagespeed|headless|google|bing|yandex|baidu|duckduck|whatsapp|telegram|linkedin|twitter|discord|slack|skype|vkshare|pinterest|semrush|ahrefs|gpt|claude|anthropic|perplexity|curl|wget|python|node-fetch|axios/i;

/* idioma e versao equivalente de cada pagina bilingue */
function counterpart(pathname) {
  if (pathname === '/' || pathname === '/index.html') return { lang: 'en', alt: '/pt' };
  if (pathname === '/pt') return { lang: 'pt', alt: '/' };
  if (pathname === '/sobre.html') return { lang: 'pt', alt: '/en/about.html' };
  if (pathname === '/en/about.html') return { lang: 'en', alt: '/sobre.html' };
  let m = pathname.match(/^\/projetos\/([a-z0-9-]+)\.html$/);
  if (m) return { lang: 'pt', alt: `/en/projects/${m[1]}.html` };
  m = pathname.match(/^\/en\/projects\/([a-z0-9-]+)\.html$/);
  if (m) return { lang: 'en', alt: `/projetos/${m[1]}.html` };
  return null;
}

/* 1o idioma da lista do navegador (por ordem de q) que seja pt ou en */
function browserLang(header) {
  const langs = header.split(',').map((part, i) => {
    const [tag, ...params] = part.trim().toLowerCase().split(';');
    const q = params.map(p => p.trim()).find(p => p.startsWith('q='));
    return { tag, q: q ? parseFloat(q.slice(2)) || 0 : 1, i };
  }).filter(l => l.tag && l.q > 0).sort((a, b) => b.q - a.q || a.i - b.i);
  const hit = langs.find(l => /^(pt|en)(-|$)/.test(l.tag));
  return hit ? hit.tag.slice(0, 2) : null;
}

function wantedLang(request) {
  const cookie = request.headers.get('cookie') || '';
  const saved = cookie.match(/(?:^|;\s*)lang=(pt|en)\b/);
  if (saved) return saved[1];
  const browser = browserLang(request.headers.get('accept-language') || '');
  if (browser) return browser;
  const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
  if (country) return LUSOPHONE.has(country) ? 'pt' : 'en';
  return null;
}

export default function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname === '/project.html') {
    const slug = url.searchParams.get('slug') || '';
    if (!/^[a-z0-9-]{1,60}$/.test(slug)) return; // sem slug valido: segue a pagina normal
    return Response.redirect(new URL(`/projetos/${slug}.html`, url.origin), 308);
  }

  if (request.method !== 'GET') return;
  const page = counterpart(url.pathname);
  if (!page) return;
  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT.test(ua)) return;
  if (request.headers.get('purpose') === 'prefetch' || request.headers.get('sec-purpose')) return;

  const lang = wantedLang(request);
  if (!lang || lang === page.lang) return;

  const dest = new URL(page.alt + url.search, url.origin);
  return new Response(null, {
    status: 302,
    headers: { Location: dest.toString(), 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
  });
}
