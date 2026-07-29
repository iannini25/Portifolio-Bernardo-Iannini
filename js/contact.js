'use strict';

/* =========================================================
   CONTACT — hero (frase + CTA) + modal (canais + form)
   ========================================================= */

const CONTACT_EMAIL = 'bernardo.iannini14@gmail.com';
const CONTACT_WHATS = '5531995624617';

/* ---------- I18N RENDER ---------- */
function renderContact(lang) {
  const C = I18N[lang]?.contact;
  if (!C) return;

  const set = (sel, txt) => {
    const el = document.querySelector(sel);
    if (el && txt != null) el.textContent = txt;
  };

  set('.contact-hero__kicker', C.kicker);
  set('[data-i18n="contact.lineA"]',     C.lineA);
  set('[data-i18n="contact.lineB"]',     C.lineB);
  set('.contact-hero__sub',              C.sub);
  set('.contact-hero__cta-label',        C.openCta);

  const M = C.modal || {};
  set('[data-i18n="contact.modal.kicker"]', M.kicker);
  set('#ctmTitle',                          M.title);
  set('[data-i18n="contact.modal.sub"]',    M.sub);
  set('[data-i18n="contact.modal.or"]',     M.or);
  set('[data-i18n="contact.modal.send"]',   M.send);
  set('[data-i18n="contact.modal.whatsMeta"]', M.whatsMeta);

  set('[data-i18n="contact.name"]',    C.name);
  set('[data-i18n="contact.email"]',   C.email);
  set('[data-i18n="contact.message"]', C.message);

  const name = document.getElementById('ctmName');
  const mail = document.getElementById('ctmEmail2');
  const msg  = document.getElementById('ctmMsg');
  if (name) name.placeholder = C.namePh    || '';
  if (mail) mail.placeholder = C.emailPh   || '';
  if (msg)  msg.placeholder  = C.messagePh || '';
}

/* ---------- MODAL OPEN / CLOSE ---------- */
const openBtn   = document.getElementById('openContactBtn');
const dialog    = document.getElementById('contactModal');
const closeBtn  = dialog?.querySelector('[data-close-contact]');

function openContactModal() {
  if (!dialog) return;
  dialog.classList.remove('is-closing');
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
  // restart entrance animations on every open
  dialog.querySelectorAll('.ctm__channel, .ctm__field, .ctm__submit, .ctm__shell')
    .forEach(el => {
      el.style.animation = 'none';
      // reflow so the animation can replay
      void el.offsetWidth;
      el.style.animation = '';
    });
}

function closeContactModal() {
  if (!dialog) return;
  dialog.classList.add('is-closing');
  setTimeout(() => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    dialog.classList.remove('is-closing');
  }, 260);
}

openBtn?.addEventListener('click', openContactModal);
closeBtn?.addEventListener('click', closeContactModal);

// click no backdrop fecha
dialog?.addEventListener('click', e => {
  if (e.target === dialog) closeContactModal();
});

// ESC
dialog?.addEventListener('cancel', e => {
  e.preventDefault();
  closeContactModal();
});

/* ---------- CHANNELS (WhatsApp link dinâmico com mensagem do form) ---------- */
function buildWhatsLink() {
  const name = document.getElementById('ctmName')?.value?.trim();
  const msg  = document.getElementById('ctmMsg')?.value?.trim();
  const text = name || msg
    ? `Hi, I'm ${name || ''}\n\n${msg || ''}`.trim()
    : '';
  const base = `https://wa.me/${CONTACT_WHATS}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

document.getElementById('ctmWhats')?.addEventListener('click', e => {
  // Reescreve o href no momento do clique pra incluir o que o usuário digitou
  e.currentTarget.href = buildWhatsLink();
});

/* ---------- FORM SUBMIT (mailto:) ---------- */
const form   = document.getElementById('ctmForm');
const status = document.getElementById('ctmStatus');

form?.addEventListener('submit', e => {
  e.preventDefault();

  const name  = document.getElementById('ctmName')?.value?.trim()   || '';
  const email = document.getElementById('ctmEmail2')?.value?.trim() || '';
  const msg   = document.getElementById('ctmMsg')?.value?.trim()    || '';

  if (!name || !email || !msg) {
    if (status) {
      status.textContent = (I18N[LANG]?.contact?.modal?.fillAll) || 'Please fill all fields.';
      status.className = 'ctm__status fail';
    }
    return;
  }

  const subject = `Contato via portfólio — ${name}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    msg,
  ].join('\n');

  window.location.href =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (status) {
    status.textContent = (I18N[LANG]?.contact?.modal?.opening) || 'Opening your email client…';
    status.className = 'ctm__status ok';
  }
});
