#!/usr/bin/env node
/* =====================================================================
   build-discovery.js
   Gerador dos arquivos de descoberta do site: sitemap.xml,
   sitemap-imagens.xml e feed.xml.

   COMO RODAR
     node scripts/build-discovery.js

   IMPORTANTE: rode LOCALMENTE e faça commit dos arquivos gerados.
   O lastmod vem do histórico do git (git log -1 --format=%cI). Num build
   remoto sem histórico completo (Vercel usa checkout raso) o git não
   responde e o script cairia no mtime, que lá seria a hora do deploy.
   Data de deploy não é data de atualização de conteúdo, então o lugar
   certo de rodar isto é na máquina, com o repositório inteiro.

   REGRAS DE DESCOBERTA
     - Varre o filesystem, nunca uma lista fixa. Quando /en/**, /sobre.html
       e os posts existirem, entram sozinhos.
     - index.html da raiz vira "/", en/index.html vira "/en/".
     - Fora isso: todo *.html da raiz e tudo dentro de posts/, projetos/
       e en/ (este último recursivo, porque abriga en/posts e en/projects).
     - Ficam de fora as páginas da lista PAGINAS_EXCLUIDAS e qualquer
       arquivo com "noindex" no <head>.

   Sem dependência externa: só fs, path e child_process.
   ===================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ---------------------------------------------------------------------
   Configuração
   ------------------------------------------------------------------- */

const RAIZ = path.resolve(__dirname, '..');
const SITE = 'https://bernardoiannini.com';

/** Diretórios varridos além da raiz. Não precisam existir ainda. */
const DIRETORIOS_VARRIDOS = ['posts', 'projetos', 'en'];

/**
 * Páginas que nunca entram na descoberta, comparadas pelo nome do arquivo.
 *   admin.html            painel administrativo
 *   bernardolindao.html   página privada
 *   post.html             template legado de post (redireciona por querystring)
 *   project.html          template legado de case (redireciona por querystring)
 *   404.html              página de erro
 * As quatro primeiras também carregam <meta name="robots" content="noindex">,
 * então seriam pegas pelo filtro de noindex de qualquer jeito. project.html
 * NÃO tem noindex: ele fica de fora porque é um shell dirigido por
 * ?slug=, e o conteúdo real vive em /projetos/<slug>.html.
 */
const PAGINAS_EXCLUIDAS = new Set([
  'admin.html',
  'bernardolindao.html',
  'post.html',
  'project.html',
  '404.html',
]);

/**
 * Extensões que não entram no sitemap de imagens.
 * SVG aqui é sempre ícone ou ornamento de interface, não conteúdo
 * indexável. Para passar a listar SVG, basta esvaziar este conjunto.
 */
const EXTENSOES_IGNORADAS = new Set(['.svg']);

/** Marcador do corpo do artigo nos posts gerados por build-posts.js. */
const CLASSE_CORPO_POST = 'post-page-body';

const CANAL_FEED = {
  titulo: 'Bernardo Iannini',
  link: `${SITE}/blog.html`,
  descricao:
    'Eventos, projetos e bastidores de Bernardo Iannini, desenvolvedor Full Stack e AI Designer em Belo Horizonte.',
  idioma: 'pt-BR',
  autor: 'Bernardo Iannini',
  email: 'bernardo.iannini14@gmail.com',
};

/* ---------------------------------------------------------------------
   Utilidades de arquivo e data
   ------------------------------------------------------------------- */

let gitDisponivel = true;

/**
 * Data do último commit que tocou o arquivo, em ISO 8601.
 * Retorna null quando o arquivo ainda não está no git.
 */
function dataDoGit(caminhoRelativo) {
  if (!gitDisponivel) return null;
  try {
    const saida = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', caminhoRelativo],
      { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    const data = saida.trim();
    return data || null;
  } catch (erro) {
    // Sem git no PATH ou fora de um repositório: avisa uma vez e desiste.
    gitDisponivel = false;
    console.warn(
      '  aviso: git indisponível, todas as datas virão do mtime do arquivo.'
    );
    return null;
  }
}

/** Data de modificação do arquivo, em ISO 8601. Último recurso. */
function dataDoArquivo(caminhoAbsoluto) {
  return new Date(fs.statSync(caminhoAbsoluto).mtime).toISOString();
}

/**
 * lastmod de uma página: git primeiro, mtime só como fallback.
 * Nunca usa a hora atual.
 */
function calcularLastmod(caminhoAbsoluto, caminhoRelativo) {
  const doGit = dataDoGit(caminhoRelativo);
  if (doGit) return { data: doGit, origem: 'git' };
  return { data: dataDoArquivo(caminhoAbsoluto), origem: 'mtime' };
}

/** Lista os *.html de um diretório. `recursivo` desce nas subpastas. */
function listarHtml(diretorioAbsoluto, recursivo) {
  if (!fs.existsSync(diretorioAbsoluto)) return [];
  const encontrados = [];
  for (const item of fs.readdirSync(diretorioAbsoluto, { withFileTypes: true })) {
    const completo = path.join(diretorioAbsoluto, item.name);
    if (item.isDirectory()) {
      if (recursivo) encontrados.push(...listarHtml(completo, true));
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.html')) {
      encontrados.push(completo);
    }
  }
  return encontrados;
}

/** Caminho relativo à raiz do projeto, sempre com barra normal. */
function relativoDaRaiz(caminhoAbsoluto) {
  return path.relative(RAIZ, caminhoAbsoluto).split(path.sep).join('/');
}

/* ---------------------------------------------------------------------
   Leitura do HTML
   ------------------------------------------------------------------- */

/** Recorta o <head>. Se não achar, devolve o começo do arquivo. */
function recortarHead(html) {
  const comHead = html.match(/<head[\s\S]*?<\/head>/i);
  return comHead ? comHead[0] : html.slice(0, 4000);
}

/**
 * Página com noindex declarado no <head> não entra em lugar nenhum.
 * Olhar só o <head> evita falso positivo quando um post fala de noindex
 * no meio do texto.
 */
function temNoindex(html) {
  return /noindex/i.test(recortarHead(html));
}

/** Valor de um <meta name="..."> ou <meta property="..."> do <head>. */
function lerMeta(html, chave) {
  const head = recortarHead(html);
  const padrao = new RegExp(
    `<meta[^>]*(?:name|property)=["']${chave}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  const invertido = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${chave}["']`,
    'i'
  );
  const achado = head.match(padrao) || head.match(invertido);
  return achado ? decodificarEntidades(achado[1]) : null;
}

/** Todos os valores de um mesmo <meta property="...">, ex.: article:tag. */
function lerMetas(html, chave) {
  const head = recortarHead(html);
  const padrao = new RegExp(
    `<meta[^>]*(?:name|property)=["']${chave}["'][^>]*content=["']([^"']*)["']`,
    'gi'
  );
  const valores = [];
  let achado;
  while ((achado = padrao.exec(head))) valores.push(decodificarEntidades(achado[1]));
  return valores;
}

/** Conteúdo de <title>, sem o sufixo do site. */
function lerTitulo(html) {
  const achado = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!achado) return null;
  return decodificarEntidades(achado[1].trim()).replace(/\s*[-·]\s*Bernardo Iannini$/, '');
}

function decodificarEntidades(texto) {
  return String(texto)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/* ---------------------------------------------------------------------
   Descoberta das páginas
   ------------------------------------------------------------------- */

/** URL pública de um arquivo HTML, a partir do caminho relativo. */
function urlDaPagina(caminhoRelativo) {
  if (caminhoRelativo === 'index.html') return '/';
  if (/^(.+)\/index\.html$/.test(caminhoRelativo)) {
    return '/' + caminhoRelativo.replace(/index\.html$/, '');
  }
  return '/' + caminhoRelativo;
}

/** changefreq e priority conforme o tipo de página. */
function classificarUrl(url) {
  if (url === '/' || url === '/en/') return { prioridade: '1.0', changefreq: 'weekly' };
  if (/^\/(?:en\/)?blog\.html$/.test(url)) return { prioridade: '0.8', changefreq: 'weekly' };
  if (/^\/(?:en\/)?(?:sobre|about)\.html$/.test(url)) return { prioridade: '0.8', changefreq: 'monthly' };
  if (/^\/(?:en\/)?(?:projetos|projects)\//.test(url)) return { prioridade: '0.8', changefreq: 'monthly' };
  if (/^\/(?:en\/)?posts\//.test(url)) return { prioridade: '0.7', changefreq: 'monthly' };
  return { prioridade: '0.6', changefreq: 'monthly' };
}

function descobrirPaginas() {
  const arquivos = [
    ...listarHtml(RAIZ, false),
    ...DIRETORIOS_VARRIDOS.flatMap((dir) => listarHtml(path.join(RAIZ, dir), true)),
  ];

  const paginas = [];
  const ignoradas = [];

  for (const absoluto of arquivos) {
    const relativo = relativoDaRaiz(absoluto);
    const nome = path.basename(relativo).toLowerCase();

    if (PAGINAS_EXCLUIDAS.has(nome)) {
      ignoradas.push({ relativo, motivo: 'lista de exclusão' });
      continue;
    }

    const html = fs.readFileSync(absoluto, 'utf8');
    if (temNoindex(html)) {
      ignoradas.push({ relativo, motivo: 'noindex' });
      continue;
    }

    const url = urlDaPagina(relativo);
    const { data, origem } = calcularLastmod(absoluto, relativo);
    paginas.push({
      absoluto,
      relativo,
      url,
      html,
      lastmod: data,
      origemLastmod: origem,
      ...classificarUrl(url),
    });
  }

  // Ordem estável: prioridade maior primeiro, depois alfabética.
  paginas.sort((a, b) => {
    const diferenca = Number(b.prioridade) - Number(a.prioridade);
    return diferenca !== 0 ? diferenca : a.url.localeCompare(b.url);
  });

  return { paginas, ignoradas };
}

/* ---------------------------------------------------------------------
   Imagens
   ------------------------------------------------------------------- */

/** Transforma o src de uma imagem em URL absoluta. */
function absolutizarSrc(src, caminhoRelativoDaPagina) {
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('//')) return 'https:' + src;
  if (src.startsWith('/')) return SITE + src;
  const diretorio = path.posix.dirname(caminhoRelativoDaPagina);
  const resolvido = path.posix.normalize(
    (diretorio === '.' ? '' : diretorio + '/') + src
  );
  return `${SITE}/${resolvido.replace(/^\.?\//, '')}`;
}

/**
 * Imagens realmente referenciadas por <img src> na página.
 * SVG inline nunca aparece aqui porque só lemos a tag <img>.
 */
function imagensDaPagina(pagina) {
  const encontradas = [];
  const vistas = new Set();
  const tags = pagina.html.match(/<img\b[^>]*>/gi) || [];

  for (const tag of tags) {
    const comSrc = tag.match(/\ssrc=["']([^"']*)["']/i);
    if (!comSrc) continue;

    const src = decodificarEntidades(comSrc[1].trim());
    // src vazio (placeholder de lightbox), data URI e âncora não são imagem.
    if (!src || src.startsWith('data:') || src.startsWith('#')) continue;
    if (EXTENSOES_IGNORADAS.has(path.posix.extname(src.split('?')[0]).toLowerCase())) continue;

    const url = absolutizarSrc(src, pagina.relativo);
    if (vistas.has(url)) continue;
    vistas.add(url);
    encontradas.push(url);
  }

  return encontradas;
}

/* ---------------------------------------------------------------------
   Posts do blog
   ------------------------------------------------------------------- */

/**
 * Recorta o miolo do <div class="post-page-body">, respeitando divs
 * aninhadas. Devolve null se o marcador não existir.
 */
function extrairCorpoDoArtigo(html) {
  const abertura = html.match(
    new RegExp(`<div[^>]*class=["'][^"']*${CLASSE_CORPO_POST}[^"']*["'][^>]*>`, 'i')
  );
  if (!abertura) return null;

  const inicio = abertura.index + abertura[0].length;
  const varredura = /<div\b[^>]*>|<\/div\s*>/gi;
  varredura.lastIndex = inicio;

  let profundidade = 1;
  let tag;
  while ((tag = varredura.exec(html))) {
    profundidade += tag[0][1] === '/' ? -1 : 1;
    if (profundidade === 0) return html.slice(inicio, tag.index).trim();
  }
  return null;
}

/** Deixa href e src absolutos: leitor de RSS não tem a base do site. */
function absolutizarHtml(trecho) {
  return trecho
    .replace(/(\s(?:href|src)=)["']\/(?!\/)([^"']*)["']/gi, `$1"${SITE}/$2"`)
    .replace(/<script\b[\s\S]*?<\/script>/gi, '');
}

/** Monta os itens do feed a partir dos posts encontrados no disco. */
function montarPosts(paginas) {
  return paginas
    .filter((p) => /^\/posts\//.test(p.url))
    .map((p) => {
      const publicado = lerMeta(p.html, 'article:published_time');
      const corpo = extrairCorpoDoArtigo(p.html);
      return {
        url: SITE + p.url,
        titulo: lerMeta(p.html, 'og:title') || lerTitulo(p.html) || p.relativo,
        descricao: lerMeta(p.html, 'description') || '',
        data: publicado || p.lastmod,
        categoria: lerMeta(p.html, 'article:section'),
        tags: lerMetas(p.html, 'article:tag'),
        autor: lerMeta(p.html, 'author') || CANAL_FEED.autor,
        conteudo: corpo ? absolutizarHtml(corpo) : null,
      };
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data));
}

/* ---------------------------------------------------------------------
   Serialização XML
   ------------------------------------------------------------------- */

function escaparXml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Fecha o conteúdo em CDATA, quebrando um "]]>" que apareça dentro. */
function cdata(texto) {
  return `<![CDATA[${String(texto).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

/** Data ISO no formato RFC 822 exigido pelo RSS 2.0. */
function paraRfc822(iso) {
  const d = new Date(iso);
  const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const p2 = (n) => String(n).padStart(2, '0');
  return (
    `${dias[d.getUTCDay()]}, ${p2(d.getUTCDate())} ${meses[d.getUTCMonth()]} ` +
    `${d.getUTCFullYear()} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:` +
    `${p2(d.getUTCSeconds())} GMT`
  );
}

function gerarSitemap(paginas) {
  const urls = paginas
    .map(
      (p) => `  <url>
    <loc>${escaparXml(SITE + p.url)}</loc>
    <lastmod>${escaparXml(p.lastmod)}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.prioridade}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function gerarSitemapImagens(paginas) {
  const blocos = [];
  let total = 0;

  for (const pagina of paginas) {
    const imagens = imagensDaPagina(pagina);
    if (!imagens.length) continue;
    total += imagens.length;
    const listadas = imagens
      .map((src) => `    <image:image>\n      <image:loc>${escaparXml(src)}</image:loc>\n    </image:image>`)
      .join('\n');
    blocos.push(`  <url>
    <loc>${escaparXml(SITE + pagina.url)}</loc>
${listadas}
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blocos.join('\n')}
</urlset>
`;

  return { xml, total, paginasComImagem: blocos.length };
}

function gerarFeed(posts, dataDoCanal) {
  const itens = posts
    .map((post) => {
      const categorias = [post.categoria, ...post.tags]
        .filter(Boolean)
        .map((c) => `      <category>${escaparXml(c)}</category>`)
        .join('\n');

      const conteudo = post.conteudo
        ? `\n      <content:encoded>${cdata(post.conteudo)}</content:encoded>`
        : '';

      return `    <item>
      <title>${escaparXml(post.titulo)}</title>
      <link>${escaparXml(post.url)}</link>
      <guid isPermaLink="true">${escaparXml(post.url)}</guid>
      <pubDate>${paraRfc822(post.data)}</pubDate>
      <dc:creator>${escaparXml(post.autor)}</dc:creator>
${categorias}${categorias ? '\n' : ''}      <description>${cdata(post.descricao)}</description>${conteudo}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escaparXml(CANAL_FEED.titulo)}</title>
    <link>${escaparXml(CANAL_FEED.link)}</link>
    <description>${escaparXml(CANAL_FEED.descricao)}</description>
    <language>${CANAL_FEED.idioma}</language>
    <managingEditor>${escaparXml(CANAL_FEED.email)} (${escaparXml(CANAL_FEED.autor)})</managingEditor>
    <webMaster>${escaparXml(CANAL_FEED.email)} (${escaparXml(CANAL_FEED.autor)})</webMaster>
    <lastBuildDate>${paraRfc822(dataDoCanal)}</lastBuildDate>
    <generator>scripts/build-discovery.js</generator>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
${itens}${itens ? '\n' : ''}  </channel>
</rss>
`;
}

/* ---------------------------------------------------------------------
   Verificação de boa formação do XML
   ------------------------------------------------------------------- */

/**
 * Checagem leve, sem dependência: aninhamento das tags, elemento raiz
 * único e "&" solto fora de CDATA. Roda a cada build para nenhum título
 * com caractere especial derrubar o arquivo em produção.
 */
function verificarXml(xml, nome) {
  const erros = [];
  const semOpaco = xml
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!\[CDATA\[[\s\S]*?]]>/g, '');

  const pilha = [];
  const tags = /<(\/?)([A-Za-z_][\w.:-]*)((?:[^<>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  let raizes = 0;
  let achado;

  while ((achado = tags.exec(semOpaco))) {
    const ehFechamento = achado[1] === '/';
    const ehAutoFechada = achado[4] === '/';
    const nomeTag = achado[2];

    if (ehFechamento) {
      const aberta = pilha.pop();
      if (aberta !== nomeTag) {
        erros.push(`</${nomeTag}> fecha <${aberta || 'nada'}>`);
      }
      if (pilha.length === 0) raizes++;
    } else if (ehAutoFechada) {
      if (pilha.length === 0) raizes++;
    } else {
      pilha.push(nomeTag);
    }
  }

  if (pilha.length) erros.push(`tags abertas sem fechar: ${pilha.join(', ')}`);
  if (raizes !== 1) erros.push(`esperado 1 elemento raiz, encontrado ${raizes}`);

  const ampersandSolto = semOpaco.match(
    /&(?!(?:[A-Za-z][A-Za-z0-9]*|#\d+|#[xX][0-9A-Fa-f]+);)/g
  );
  if (ampersandSolto) {
    erros.push(`${ampersandSolto.length} "&" sem escape fora de CDATA`);
  }

  if (erros.length) {
    throw new Error(`${nome} não está bem formado: ${erros.join(' | ')}`);
  }
}

/* ---------------------------------------------------------------------
   Execução
   ------------------------------------------------------------------- */

function escrever(nomeArquivo, conteudo) {
  fs.writeFileSync(path.join(RAIZ, nomeArquivo), conteudo, 'utf8');
}

function main() {
  console.log('build-discovery: varrendo o site...\n');

  const { paginas, ignoradas } = descobrirPaginas();
  if (!paginas.length) {
    throw new Error('nenhuma página encontrada, algo está errado na varredura.');
  }

  const posts = montarPosts(paginas);

  // lastBuildDate do feed: post mais recente ou, sem posts, a data do
  // blog.html. Nunca now(), pra o arquivo não mudar a cada execução.
  const blog = paginas.find((p) => p.url === '/blog.html');
  const dataDoCanal = posts.length
    ? posts[0].data
    : (blog ? blog.lastmod : paginas[0].lastmod);

  const sitemap = gerarSitemap(paginas);
  const imagens = gerarSitemapImagens(paginas);
  const feed = gerarFeed(posts, dataDoCanal);

  verificarXml(sitemap, 'sitemap.xml');
  verificarXml(imagens.xml, 'sitemap-imagens.xml');
  verificarXml(feed, 'feed.xml');

  escrever('sitemap.xml', sitemap);
  escrever('sitemap-imagens.xml', imagens.xml);
  escrever('feed.xml', feed);

  /* --- Resumo --------------------------------------------------------- */
  const porMtime = paginas.filter((p) => p.origemLastmod === 'mtime');
  const semCorpo = posts.filter((p) => !p.conteudo);

  console.log(`  sitemap.xml           ${paginas.length} URLs`);
  console.log(
    `  sitemap-imagens.xml   ${imagens.total} imagens em ${imagens.paginasComImagem} páginas`
  );
  console.log(`  feed.xml              ${posts.length} itens`);

  console.log('\n  URLs publicadas:');
  for (const p of paginas) {
    console.log(
      `    ${p.url.padEnd(38)} ${p.lastmod}  (${p.origemLastmod}, prio ${p.prioridade})`
    );
  }

  if (ignoradas.length) {
    console.log('\n  Fora do sitemap:');
    for (const i of ignoradas) console.log(`    ${i.relativo.padEnd(38)} ${i.motivo}`);
  }

  if (porMtime.length) {
    console.log(
      `\n  aviso: ${porMtime.length} página(s) ainda não commitadas, lastmod veio do mtime:`
    );
    for (const p of porMtime) console.log(`    ${p.relativo}`);
  }

  if (semCorpo.length) {
    console.log(
      `\n  aviso: ${semCorpo.length} post(s) sem <div class="${CLASSE_CORPO_POST}">, ` +
        'o feed sai sem content:encoded neles:'
    );
    for (const p of semCorpo) console.log(`    ${p.url}`);
  }

  console.log('\nbuild-discovery: pronto.');
}

try {
  main();
} catch (erro) {
  console.error(`\nbuild-discovery: FALHOU. ${erro.message}`);
  process.exit(1);
}
