'use strict';

/* =========================================================
   POST /api/rebuild
   ---------------------------------------------------------
   Dispara um deploy novo na Vercel depois que o painel admin
   salva um post no Supabase. O build do deploy puxa os posts
   do banco e regenera as paginas estaticas, entao o site
   atualiza sozinho sem perder SEO.

   Contrato (a resposta e SEMPRE JSON):
     200 { ok: true,  triggered: true }
     401 { ok: false, error: 'unauthorized' }
     405 { ok: false, error: 'method_not_allowed' }
     501 { ok: false, error: 'not_configured' }            // falta DEPLOY_HOOK_URL
     502 { ok: false, error: 'hook_failed', detail: '...' }

   Sem dependencias externas: usa o fetch global do Node 18+.
   ========================================================= */

/* Config do Supabase.
   Vem de process.env quando existir; senao cai nos valores publicos do
   projeto. O client usa js/supabase-config.js, mas aquele arquivo e
   client-side (window.SUPABASE_CONFIG) e nao da pra ler daqui, por isso
   os valores ficam embutidos como fallback. A chave `anon` e publica por
   design: o RLS e que protege os dados. NUNCA usar a `service_role`. */
const SUPABASE_URL_PADRAO = 'https://rnupfyzpwwvspiwnttsl.supabase.co';
const SUPABASE_ANON_PADRAO =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudXBmeXpwd3d2c3Bpd250dHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzU1ODMsImV4cCI6MjA5NDk1MTU4M30.iJitU6bkENP69GSq3B1UQhuZ9f1HEVe2QjK2-LBwwZs';

/* Timeout curto nas duas chamadas de rede (validar token + chamar o hook).
   Duas x 8s = 16s no pior caso, com folga dentro do maxDuration 30 do
   vercel.json. */
const TIMEOUT_MS = 8000;

/* Config resolvida em PAR: URL e chave sempre da mesma origem. Setar so uma
   env var misturaria o projeto novo com a chave do antigo, e toda validacao
   de token passaria a falhar com 401 sem explicacao. */
function configSupabase() {
  const envUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const envKey = String(process.env.SUPABASE_ANON_KEY || '').trim();
  if (envUrl && envKey) return { base: envUrl, anonKey: envKey };
  if (envUrl || envKey) {
    console.warn('[rebuild] env var do Supabase pela metade: ignorando e usando o padrao do projeto.');
  }
  return { base: SUPABASE_URL_PADRAO, anonKey: SUPABASE_ANON_PADRAO };
}

/* Responde JSON e nunca deixa a resposta ser cacheada. */
function responderJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/* fetch com AbortController pra nao pendurar a funcao serverless. */
async function fetchComTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

/* Extrai o token de "Authorization: Bearer <token>". */
function lerTokenBearer(req) {
  const bruto = String((req.headers && req.headers.authorization) || '').trim();
  const m = /^Bearer\s+(.+)$/i.exec(bruto);
  return m ? m[1].trim() : '';
}

/* Valida o token de verdade contra o Supabase Auth.
   Precisa voltar 200 com um user.id, senao trata como nao autorizado. */
async function tokenPertenceAUsuario(token) {
  const { base, anonKey } = configSupabase();
  if (!base || !anonKey) return false;

  try {
    const resp = await fetchComTimeout(base + '/auth/v1/user', {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: 'Bearer ' + token,
      },
    });
    if (!resp.ok) return false;
    const user = await resp.json().catch(() => null);
    return Boolean(user && user.id);
  } catch (err) {
    // Timeout ou rede fora: sem confirmacao, nao autoriza.
    return false;
  }
}

/* Motivo opcional do body, so pra aparecer no log da funcao. */
function lerMotivo(req) {
  try {
    const body = req.body;
    if (!body) return '';
    const obj = typeof body === 'string' ? JSON.parse(body) : body;
    return typeof obj.reason === 'string' ? obj.reason.slice(0, 120) : '';
  } catch (err) {
    return '';
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return responderJson(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const token = lerTokenBearer(req);
  if (!token) {
    return responderJson(res, 401, { ok: false, error: 'unauthorized' });
  }

  const autorizado = await tokenPertenceAUsuario(token);
  if (!autorizado) {
    return responderJson(res, 401, { ok: false, error: 'unauthorized' });
  }

  const hookUrl = String(process.env.DEPLOY_HOOK_URL || '').trim();
  if (!hookUrl) {
    // Nada configurado ainda: o post fica salvo no banco e o site atualiza
    // no proximo deploy. O painel mostra esse aviso pro usuario.
    return responderJson(res, 501, { ok: false, error: 'not_configured' });
  }

  try {
    const resp = await fetchComTimeout(hookUrl, { method: 'POST' });
    if (!resp.ok) {
      // detail nunca inclui a URL do hook: so o status HTTP.
      console.error('[rebuild] deploy hook recusou, status ' + resp.status);
      return responderJson(res, 502, {
        ok: false,
        error: 'hook_failed',
        detail: 'deploy hook respondeu ' + resp.status,
      });
    }
  } catch (err) {
    // Mensagens de erro de rede podem conter a URL, por isso o detail e fixo.
    const timeout = err && err.name === 'AbortError';
    console.error('[rebuild] falha ao chamar o deploy hook (' + (timeout ? 'timeout' : 'rede') + ')');
    return responderJson(res, 502, {
      ok: false,
      error: 'hook_failed',
      detail: timeout ? 'timeout ao chamar o deploy hook' : 'falha de rede ao chamar o deploy hook',
    });
  }

  const motivo = lerMotivo(req);
  console.log('[rebuild] deploy disparado' + (motivo ? ' (' + motivo + ')' : ''));
  return responderJson(res, 200, { ok: true, triggered: true });
};
