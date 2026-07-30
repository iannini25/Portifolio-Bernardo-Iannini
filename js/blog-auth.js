'use strict';

/* =========================================================
   BLOG AUTH — Login via Supabase Auth
   ---------------------------------------------------------
   Login por usuário + senha. A conta é criada no painel do
   Supabase (Authentication → Users). A sessão é persistida
   pelo próprio supabase-js (localStorage) e renovada sozinha.

   O Supabase Auth exige e-mail, mas o campo aceita o apelido
   curto: USER_ALIASES traduz "bernardo" pro e-mail real da
   conta. Digitar o e-mail completo também funciona.
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

document.addEventListener('DOMContentLoaded', async () => {
  const form     = document.getElementById('loginForm');
  const userInp  = document.getElementById('loginUser');
  const passInp  = document.getElementById('loginPass');
  const errorEl  = document.getElementById('loginError');
  const submitBt = form && form.querySelector('.login-submit');

  if (!form) return;

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

  const showError = (msg) => {
    errorEl.hidden = false;
    errorEl.textContent = msg || 'E-mail ou senha incorretos.';
    passInp.value = '';
    passInp.focus();
    form.style.animation = 'none';
    void form.offsetWidth;
    form.style.animation = 'login-shake .4s ease';
  };

  // Sem config do Supabase → avisa e para
  if (!window.BlogDB) {
    showError('Supabase não configurado. Veja supabase/SETUP.md.');
    return;
  }

  // Já logado? vai direto pro admin
  try {
    if (await window.BlogDB.isAuthed()) {
      location.replace('admin.html');
      return;
    }
  } catch (e) { /* segue pro form */ }

  userInp && userInp.focus();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = resolveEmail(userInp.value);
    const pass  = passInp.value;

    if (!email || !pass) { showError('Preencha usuário e senha.'); return; }

    errorEl.hidden = true;
    if (submitBt) { submitBt.disabled = true; submitBt.textContent = 'Entrando...'; }

    try {
      await window.BlogDB.signIn(email, pass);
      location.href = 'admin.html';
    } catch (err) {
      const m = (err && err.message || '').toLowerCase();
      showError(
        m.includes('invalid') ? 'Usuário ou senha incorretos.'
        : m.includes('not confirmed') ? 'E-mail ainda não confirmado no Supabase.'
        : (m.includes('failed to fetch') || m.includes('networkerror'))
          ? 'Servidor do blog indisponível. Tente de novo em instantes.'
        : ('Erro ao entrar: ' + (err.message || 'tente de novo')));
      if (submitBt) { submitBt.disabled = false; submitBt.textContent = 'Entrar'; }
    }
  });
});
