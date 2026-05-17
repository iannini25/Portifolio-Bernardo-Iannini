'use strict';

/* =========================================================
   BLOG AUTH — Login simples (client-side, sem servidor)
   Credenciais: bernardolindo / iannini
   Após login, salva uma flag em sessionStorage e redireciona pro admin.
   Aviso: isto é client-side, ideal só para portfolio. Não usar em prod.
   ========================================================= */

const AUTH_KEY = 'bi_blog_auth';
// Usuario: bernardolindo  ·  Senha: iannini
// Aceita tambem "bernardolindao" (nome do arquivo) pra evitar confusao.
const VALID_USERS = ['bernardolindo', 'bernardolindao'];
const VALID_PASS = 'iannini';

function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

function setAuthed() {
  try {
    sessionStorage.setItem(AUTH_KEY, '1');
  } catch (e) {
    // sessionStorage bloqueado (modo privado / file://). Mantem login na
    // sessao via window para o admin nao ficar em loop de redirect.
    window.__BI_AUTHED = true;
  }
}

function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
}

// Se já logado, manda direto pro admin
if (isAuthed()) {
  location.replace('admin.html');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const userInput = document.getElementById('loginUser');
  const passInput = document.getElementById('loginPass');
  const errorEl = document.getElementById('loginError');

  userInput.focus();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = userInput.value.trim().toLowerCase();
    const pass = passInput.value.trim();

    if (VALID_USERS.includes(user) && pass === VALID_PASS) {
      setAuthed();
      errorEl.hidden = true;
      location.href = 'admin.html';
    } else {
      errorEl.hidden = false;
      passInput.value = '';
      passInput.focus();
      // Shake animation
      form.style.animation = 'none';
      void form.offsetWidth;
      form.style.animation = 'login-shake .4s ease';
    }
  });

  // Add shake keyframe dinamicamente
  if (!document.getElementById('login-shake-style')) {
    const style = document.createElement('style');
    style.id = 'login-shake-style';
    style.textContent = `
      @keyframes login-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);
  }
});
