/* =========================================================
   Middleware (Vercel Routing Middleware) — so pra rota antiga.

   project.html?slug=<id> era a pagina dinamica dos projetos. Hoje cada
   projeto tem a sua pagina estatica (/projetos/<id>.html). O redirect do
   vercel.json repassava a query junto (/projetos/x.html?slug=x), gerando
   URL duplicada no Google. Aqui o 308 vai direto pra URL limpa.
   ========================================================= */
export const config = { matcher: '/project.html' };

export default function middleware(request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || '';
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return; // sem slug valido: segue a pagina normal
  return Response.redirect(new URL(`/projetos/${slug}.html`, url.origin), 308);
}
