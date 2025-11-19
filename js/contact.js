'use strict';

/* =========================================================
   CONTACT
   ========================================================= */

function renderContact(lang) {
  const C = I18N[lang].contact;

  const k = document.querySelector('#contato .contact-kicker');
  const t = document.querySelector('#contato .contact-title');
  const s = document.querySelector('#contato .contact-sub');

  if (k) k.textContent = C.kicker;
  if (t) t.innerHTML = `<span class="caret">›_</span> ${C.title}`;
  if (s) s.textContent = C.sub;

  const name = document.getElementById('fName');
  const email = document.getElementById('fEmail');
  const msg = document.getElementById('fMsg');

  const lblName = name?.closest('label')?.querySelector('.f-label');
  const lblEmail = email?.closest('label')?.querySelector('.f-label');
  const lblMsg = msg?.closest('label')?.querySelector('.f-label');

  if (lblName) lblName.textContent = C.name;
  if (lblEmail) lblEmail.textContent = C.email;
  if (lblMsg) lblMsg.textContent = C.message;

  if (name) name.placeholder = C.namePh;
  if (email) email.placeholder = C.emailPh;
  if (msg) msg.placeholder = C.messagePh;

  const emailBtn = document.getElementById('sendMail');
  const waBtn = document.getElementById('sendWhats');

  if (emailBtn && emailBtn.lastChild) emailBtn.lastChild.nodeValue = ' ' + C.emailCta;
  if (waBtn && waBtn.lastChild) waBtn.lastChild.nodeValue = ' ' + C.waCta;

  const quick = document.querySelector('.contact-console .c-quick');
  if (quick) {
    quick.querySelectorAll('.cbtn').forEach(a => {
      if (a.href?.includes('linkedin')) a.textContent = C.quick.linkedin;
      else if (a.href?.includes('github')) a.textContent = C.quick.github;
      else if (a.id === 'whatsQuick') a.textContent = C.quick.whatsapp;
      else if (a.hasAttribute('download')) a.textContent = C.quick.cv;
    });
  }

  const cmd = document.querySelector('.contact-console .c-line .cmd');
  if (cmd) cmd.textContent = C.consoleCmd;
}

// Email
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('fName')?.value?.trim() || '';
  const email = document.getElementById('fEmail')?.value?.trim() || '';
  const msg = document.getElementById('fMsg')?.value?.trim() || '';

  const subject = `Contact via portifólio — ${name || 'No name'}`;
  const body = [
    `Name: ${name || '(não informado)'}`,
    `Email: ${email || '(não informado)'}`,
    '',
    msg || '(mensagem em branco)'
  ].join('\n');

  window.location.href =
    `mailto:bernardo.iannini14@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// WhatsApp
function buildWhatsLink() {
  const name = document.getElementById('fName')?.value?.trim() || '';
  const msg = document.getElementById('fMsg')?.value?.trim() || '';
  const text = `Hi, i'm ${name || '(não informado)'}\n\n${msg || ''}`.trim();
  return `https://wa.me/5531995624617?text=${encodeURIComponent(text)}`;
}

document.getElementById('sendWhats')?.addEventListener('click', () =>
  window.open(buildWhatsLink(), '_blank')
);

document.getElementById('whatsQuick')?.addEventListener('click', e => {
  e.preventDefault();
  window.open(buildWhatsLink(), '_blank');
});

// Efeito de magnetismo nos botões
document.querySelectorAll('.cbtn').forEach(btn => {
  const strength = 12;

  btn.addEventListener('pointermove', e => {
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    btn.style.transform = `translate(${dx / strength}px, ${dy / strength}px)`;
  });

  ['pointerleave', 'blur'].forEach(ev =>
    btn.addEventListener(ev, () => (btn.style.transform = ''))
  );
});
