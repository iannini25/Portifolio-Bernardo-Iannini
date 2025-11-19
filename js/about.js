'use strict';

/* =========================================================
   ABOUT — Terminal (Kali style)
   ========================================================= */

const term = document.getElementById('terminal');

function termLine(html) {
  if (!term) return;
  const d = document.createElement('div');
  d.innerHTML = html;
  term.appendChild(d);
  term.scrollTop = term.scrollHeight;
}

async function typeKaliPromptAndCmd(cmdToType) {
  if (!term) return;

  termLine(
    `<span class="k-ps1-top">┌──(</span><span class="k-ps1-user">bernardoiannini</span><span class="k-ps1-top">㉿</span><span class="k-ps1-host">localhost</span><span class="k-ps1-top">)-[</span><span class="k-ps1-path">~</span><span class="k-ps1-top">]</span>`
  );

  const pre = `<span class="k-ps1-bottom">└─$</span> <span class="cmd">`;
  let typed = '';

  for (let i = 0; i <= cmdToType.length; i++) {
    const html = pre + typed + `</span>`;

    if (term.lastChild?.dataset?.typing === '1') {
      term.lastChild.innerHTML = html;
    } else {
      const d = document.createElement('div');
      d.dataset.typing = '1';
      d.innerHTML = html;
      term.appendChild(d);
    }

    if (i < cmdToType.length) {
      typed += cmdToType[i];
      await sleep(22);
    }
  }

  term.lastChild?.removeAttribute('data-typing');
}

async function renderTerminal(lang) {
  if (!term) return;

  term.innerHTML = '';
  const script = I18N[lang].about.terminal;

  for (const step of script) {
    if (step.type === 'type') await typeKaliPromptAndCmd(step.text);
    else if (step.type === 'out')
      termLine(`<span class="out">${step.text.replace(/\n/g, '<br>')}</span>`);

    await sleep(300);
  }
}
