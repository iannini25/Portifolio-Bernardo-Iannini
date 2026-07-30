'use strict';

/* =========================================================
   BLOG AUTH: login via Supabase Auth
   ---------------------------------------------------------
   Login por usuário + senha. A conta é criada no painel do
   Supabase (Authentication > Users). A sessão é persistida
   pelo próprio supabase-js (localStorage) e renovada sozinha.

   O Supabase Auth exige e-mail, mas o campo aceita o apelido
   curto: USER_ALIASES traduz "bernardo" pro e-mail real da
   conta. Digitar o e-mail completo também funciona.

   ENDURECIMENTO DESTA TELA (leia antes de mexer):

   1) Freio de força bruta no cliente. Depois de 5 tentativas
      erradas o formulário trava por 60s, e o tempo dobra a
      cada nova rodada de falhas (60s, 2min, 4min, 8min, teto
      de 15min). O estado fica no localStorage com timestamp,
      então recarregar a página não zera a trava. Passada 1h
      sem falha nova, a escalada decai pro começo, pra que
      erro de digitação em dias diferentes não acumule.

      Seja honesto sobre o que isso é: NÃO é proteção de
      servidor. Quem sabe abrir o DevTools apaga a chave do
      localStorage, e quem ataca de verdade nem usa este
      formulário: manda POST direto no /auth/v1/token do
      Supabase e o freio daqui nem existe pra ele. O que este
      freio faz é barrar o ataque casual pelo formulário (o
      curioso que descobriu a URL e vai chutando senha na
      mão) e deixar óbvio que a página não é um brinquedo.
      A barreira REAL contra força bruta é, nesta ordem:
      senha longa e aleatória, o rate limit do endpoint de
      token do Supabase, e o CAPTCHA + MFA que precisam ser
      ligados no painel do Supabase (não dá pra fazer isso
      só no código daqui).

      Se você se trancar fora por acidente: abra o Console do
      navegador e rode
      localStorage.removeItem('bi_login_guard')
      ou espere a contagem regressiva terminar.

   2) A mensagem de erro de credencial é SEMPRE a mesma, seja
      o usuário inexistente, a senha errada ou o e-mail não
      confirmado. Mensagem diferente por caso vira oráculo:
      o atacante descobre qual usuário existe só pela
      resposta. O motivo real do erro vai pro console (só
      quem está no navegador vê), nunca pra tela.

   3) Todo caminho de erro espera completar MIN_ATTEMPT_MS
      antes de mostrar a mensagem, pra que "usuário não
      existe" e "senha errada" levem o mesmo tempo na tela.
      Honestidade: isso iguala o tempo do NOSSO lado; a
      latência do Supabase ainda varia e quem mede o endpoint
      dele direto não passa por aqui.

   4) O <form> é method="post" no HTML. Isso importa mesmo com
      preventDefault: se este script falhar em carregar, um
      submit nativo por GET colocaria a senha na barra de
      endereço, no histórico e no Referer. Com POST, nunca.
      Não troque pra GET e não coloque a senha em query
      string em nenhum caminho.
   ========================================================= */

const USER_ALIASES = {
  bernardo: 'bernardo.iannini14@gmail.com',
};

/* Apelido -> e-mail. Qualquer coisa com @ passa direto. */
const resolveEmail = (input) => {
  const v = String(input || '').trim();
  if (v.includes('@')) return v;
  return USER_ALIASES[v.toLowerCase()] || v;
};

/* ---------------------------------------------------------
   Freio de força bruta (estado persistido)
   --------------------------------------------------------- */

const GUARD_KEY          = 'bi_login_guard';
const GUARD_MAX_FAILS    = 5;                 // tentativas erradas antes de travar
const GUARD_BASE_LOCK_MS = 60 * 1000;         // 1ª trava: 60s
const GUARD_MAX_LOCK_MS  = 15 * 60 * 1000;    // teto: 15min
const GUARD_MAX_ROUNDS   = 8;                 // limite do expoente (o teto já corta antes)
const GUARD_DECAY_MS     = 60 * 60 * 1000;    // 1h sem falha zera a escalada
const MIN_ATTEMPT_MS     = 600;               // piso de tempo de resposta na tela

/* Mensagem única de credencial. Não crie variações disso. */
const GENERIC_CREDENTIAL_ERROR = 'Usuário ou senha incorretos.';

/* Cópia em memória: usada quando o localStorage está bloqueado
   (aba privada, cookies de terceiros travados). Nesse caso a
   trava só vale enquanto a aba estiver aberta, e não tem o que
   fazer sem servidor. */
const EMPTY_GUARD = { fails: 0, until: 0, round: 0, ts: 0 };

let guardMemory = { ...EMPTY_GUARD };

const guardStore = (() => {
  try {
    const k = '__bi_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return localStorage;
  } catch (e) {
    return null;
  }
})();

/* Lê e SANEIA o estado. Qualquer coisa fora do esperado volta
   pro zero: valor corrompido não pode virar trava eterna. */
const readGuard = () => {
  if (!guardStore) return { ...guardMemory };

  let raw = null;
  try { raw = guardStore.getItem(GUARD_KEY); } catch (e) { return { ...guardMemory }; }
  if (!raw) return { ...EMPTY_GUARD };

  let parsed = null;
  try { parsed = JSON.parse(raw); } catch (e) { return { ...EMPTY_GUARD }; }
  if (!parsed || typeof parsed !== 'object') return { ...EMPTY_GUARD };

  const num = (v, max) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(Math.floor(n), max);
  };

  const now   = Date.now();
  const round = num(parsed.round, GUARD_MAX_ROUNDS);
  const fails = num(parsed.fails, GUARD_MAX_FAILS);

  /* Clamp do prazo: se o relógio do sistema mudou ou alguém
     escreveu um timestamp absurdo, a trava não pode passar do
     teto contado a partir de agora. */
  let until = num(parsed.until, Number.MAX_SAFE_INTEGER);
  if (until > now + GUARD_MAX_LOCK_MS) until = now + GUARD_MAX_LOCK_MS;

  /* Timestamp da última falha, usado só pra decair a escalada.
     Se vier do futuro (relógio mexido), trata como agora. */
  let ts = num(parsed.ts, Number.MAX_SAFE_INTEGER);
  if (ts > now) ts = now;

  /* Decaimento: passada 1h sem falha nova e sem trava ativa, a
     contagem e a escalada voltam ao zero. Sem isso, o dono que
     errasse a senha em dias diferentes acumularia rodadas até
     cair em bloqueios de 15min por dois erros de digitação. */
  if (until <= now && ts > 0 && (now - ts) > GUARD_DECAY_MS) return { ...EMPTY_GUARD };

  return { fails, until, round, ts };
};

const writeGuard = (state) => {
  const stamped = { ...state, ts: Date.now() };
  guardMemory = { ...stamped };
  if (!guardStore) return;
  try { guardStore.setItem(GUARD_KEY, JSON.stringify(stamped)); } catch (e) { /* segue com a cópia em memória */ }
};

const clearGuard = () => {
  guardMemory = { ...EMPTY_GUARD };
  if (!guardStore) return;
  try { guardStore.removeItem(GUARD_KEY); } catch (e) { /* ignora */ }
};

/* Quanto falta da trava, em ms. 0 = liberado. */
const lockRemaining = (state) => Math.max(0, (state.until || 0) - Date.now());

/* 60s, 2min, 4min, 8min, 15min (teto). */
const lockDurationFor = (round) => {
  const r = Math.min(Math.max(0, round | 0), GUARD_MAX_ROUNDS);
  return Math.min(GUARD_BASE_LOCK_MS * Math.pow(2, r), GUARD_MAX_LOCK_MS);
};

const formatWait = (ms) => {
  const total = Math.max(1, Math.ceil(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  if (min <= 0) return sec + 's';
  return min + 'min ' + String(sec).padStart(2, '0') + 's';
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

document.addEventListener('DOMContentLoaded', async () => {
  const form     = document.getElementById('loginForm');
  const userInp  = document.getElementById('loginUser');
  const passInp  = document.getElementById('loginPass');
  const errorEl  = document.getElementById('loginError');
  const submitBt = form && form.querySelector('.login-submit');

  if (!form) return;

  /* Bloqueia o submit nativo JÁ, antes de qualquer await. O handler
     de verdade só é ligado depois da checagem de sessão, e um Enter
     dado nesse intervalo faria o navegador enviar o formulário sem
     passar por aqui. Com method="post" no HTML a senha não iria pra
     URL nem nesse caso, mas o certo é nunca sair da página. */
  form.addEventListener('submit', (e) => e.preventDefault());

  // Animação de shake (injetada uma vez)
  if (!document.getElementById('login-shake-style')) {
    const style = document.createElement('style');
    style.id = 'login-shake-style';
    style.textContent = `
      @keyframes login-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }`;
    document.head.appendChild(style);
  }

  const setMessage = (msg) => {
    if (!errorEl) return;
    errorEl.hidden = false;
    errorEl.textContent = msg || GENERIC_CREDENTIAL_ERROR;
  };

  const showError = (msg) => {
    setMessage(msg);
    if (passInp) { passInp.value = ''; }
    if (passInp && !passInp.disabled) passInp.focus();
    form.style.animation = 'none';
    void form.offsetWidth;
    form.style.animation = 'login-shake .4s ease';
  };

  /* ---------- estado visual da trava ---------- */

  let countdownTimer = null;

  const setFormEnabled = (enabled) => {
    if (userInp)  userInp.disabled  = !enabled;
    if (passInp)  passInp.disabled  = !enabled;
    if (submitBt) {
      submitBt.disabled = !enabled;
      /* .login-submit não tem estilo :disabled no blog.css, então
         o estado desabilitado é sinalizado aqui pra não parecer
         que o botão simplesmente parou de funcionar. */
      submitBt.style.opacity = enabled ? '' : '.5';
      submitBt.style.cursor  = enabled ? '' : 'not-allowed';
    }
  };

  const stopCountdown = () => {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  };

  /* Trava a tela e conta o tempo restante em voz alta. */
  const applyLock = (remainingMs, shake) => {
    stopCountdown();
    setFormEnabled(false);
    if (submitBt) submitBt.textContent = 'Bloqueado';

    /* A caixa de erro é role="alert". Se ela ficar "viva" durante a
       contagem, o leitor de tela anuncia o texto a cada segundo.
       Silencia enquanto conta e devolve depois. */
    if (errorEl) errorEl.setAttribute('aria-live', 'off');

    const tick = () => {
      const left = lockRemaining(readGuard());
      if (left <= 0) {
        stopCountdown();
        setFormEnabled(true);
        if (submitBt) submitBt.textContent = 'Entrar';
        /* Limpa a mensagem em vez de escrever "liberado": a caixa é
           vermelha, não serve pra dar boa notícia. */
        if (errorEl) {
          errorEl.hidden = true;
          errorEl.textContent = GENERIC_CREDENTIAL_ERROR;
          errorEl.setAttribute('aria-live', 'polite');
        }
        if (userInp) userInp.focus();
        return;
      }
      setMessage('Muitas tentativas. Aguarde ' + formatWait(left) + ' para tentar de novo.');
    };

    if (shake) {
      showError('Muitas tentativas. Aguarde ' + formatWait(remainingMs) + ' para tentar de novo.');
    } else {
      setMessage('Muitas tentativas. Aguarde ' + formatWait(remainingMs) + ' para tentar de novo.');
    }
    countdownTimer = setInterval(tick, 1000);
  };

  /* Conta uma falha. Ao bater o limite, abre a próxima trava
     (dobrando o tempo da rodada anterior). */
  const registerFailure = () => {
    const state = readGuard();
    const fails = (state.fails || 0) + 1;

    if (fails < GUARD_MAX_FAILS) {
      writeGuard({ fails, until: state.until || 0, round: state.round || 0 });
      const left = GUARD_MAX_FAILS - fails;
      return { locked: false, left };
    }

    const round      = Math.min((state.round || 0), GUARD_MAX_ROUNDS);
    const lockMs     = lockDurationFor(round);
    const nextRound  = Math.min(round + 1, GUARD_MAX_ROUNDS);
    writeGuard({ fails: 0, until: Date.now() + lockMs, round: nextRound });
    return { locked: true, lockMs };
  };

  /* Sem config do Supabase: avisa e desliga o formulário. O submit
     nativo já está bloqueado pelo listener lá de cima. */
  if (!window.BlogDB) {
    setFormEnabled(false);
    setMessage('Supabase não configurado. Veja supabase/SETUP.md.');
    return;
  }

  // Já logado? vai direto pro admin
  try {
    if (await window.BlogDB.isAuthed()) {
      location.replace('admin.html');
      return;
    }
  } catch (e) { /* segue pro form */ }

  /* Trava herdada de uma sessão anterior (recarregar não zera). */
  const startState = readGuard();
  const startLeft  = lockRemaining(startState);
  if (startLeft > 0) {
    applyLock(startLeft, false);
  } else if (userInp) {
    userInp.focus();
  }

  let submitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;

    /* Revalida a trava a cada submit: o botão desabilitado é só
       aparência, e o Enter no campo ou um clique forçado pelo
       DevTools chegariam aqui do mesmo jeito. */
    const left = lockRemaining(readGuard());
    if (left > 0) { applyLock(left, true); return; }

    const email = resolveEmail(userInp ? userInp.value : '');
    const pass  = passInp ? passInp.value : '';

    if (!email || !pass) { showError('Preencha usuário e senha.'); return; }

    if (errorEl) errorEl.hidden = true;
    submitting = true;
    if (submitBt) { submitBt.disabled = true; submitBt.textContent = 'Entrando...'; }

    const startedAt = Date.now();

    try {
      await window.BlogDB.signIn(email, pass);
      clearGuard();
      location.href = 'admin.html';
    } catch (err) {
      const raw = String((err && err.message) || '');
      const m   = raw.toLowerCase();

      /* Rede fora não é falha de credencial: não conta tentativa
         e não vira oráculo de nada. */
      const isNetwork = m.includes('failed to fetch') || m.includes('networkerror') ||
                        m.includes('load failed') || m.includes('timeout');

      /* Rate limit do próprio Supabase. Fala do IP de quem pediu,
         não de qual usuário existe, então pode aparecer na tela. */
      const isRateLimited = m.includes('rate limit') || m.includes('too many requests') ||
                            m.includes('you can only request this after');

      /* Motivo verdadeiro só no console: quem está no navegador vê,
         a tela não entrega nada. */
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[login] falha:', raw);
      }

      /* Iguala o tempo de todo erro. Sem isso, "usuário não existe"
         e "senha errada" podem levar tempos diferentes e responder
         a pergunta que a mensagem única se recusa a responder. */
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_ATTEMPT_MS) await sleep(MIN_ATTEMPT_MS - elapsed);

      submitting = false;

      if (isNetwork) {
        if (submitBt) { submitBt.disabled = false; submitBt.textContent = 'Entrar'; }
        showError('Servidor do blog indisponível. Tente de novo em instantes.');
        return;
      }

      if (isRateLimited) {
        if (submitBt) { submitBt.disabled = false; submitBt.textContent = 'Entrar'; }
        showError('Muitas tentativas em pouco tempo. Aguarde um instante antes de tentar de novo.');
        return;
      }

      /* Qualquer outra falha (usuário inexistente, senha errada,
         e-mail não confirmado, erro do provedor) usa a MESMA
         mensagem, de propósito. */
      const result = registerFailure();

      if (result.locked) {
        applyLock(result.lockMs, true);
        return;
      }

      if (submitBt) { submitBt.disabled = false; submitBt.textContent = 'Entrar'; }
      const aviso = result.left <= 2
        ? ' Restam ' + result.left + (result.left === 1 ? ' tentativa' : ' tentativas') + ' antes do bloqueio.'
        : '';
      showError(GENERIC_CREDENTIAL_ERROR + aviso);
    }
  });
});
