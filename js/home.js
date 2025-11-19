'use strict';

/* =========================================================
   HOME (Hero + Tagline Scramble)
   ========================================================= */

const taglineEl = document.getElementById('taglineText');
let phrases = I18N[LANG].taglines;

const HOLD_MS = 3000;
const TYPE_MS = 40;
const ERASE_MS = 25;
const FLICKERS = 1;
let phraseIdx = 0;

async function scrambleOut(text) {
  if (!taglineEl) return;
  for (let len = text.length; len >= 0; len--) {
    for (let f = 0; f < FLICKERS; f++) {
      taglineEl.textContent =
        text.slice(0, len) + randChars(text.length - len);
      await sleep(ERASE_MS / 2);
    }
    taglineEl.textContent = text.slice(0, len);
    await sleep(ERASE_MS);
  }
}

async function scrambleIn(text) {
  if (!taglineEl) return;
  for (let i = 0; i <= text.length; i++) {
    const settled = text.slice(0, i);
    const rest = text.length - i;

    for (let f = 0; f < FLICKERS; f++) {
      taglineEl.textContent = settled + randChars(rest);
      await sleep(TYPE_MS / 2);
    }

    taglineEl.textContent = settled;
    await sleep(TYPE_MS);
  }
}

async function cycleTaglines() {
  if (!taglineEl) return;

  taglineEl.textContent = phrases[phraseIdx];
  taglineEl.classList.toggle(
    'glow',
    phrases[phraseIdx].toLowerCase().includes('web developer')
  );

  while (true) {
    await sleep(HOLD_MS);
    const current = phrases[phraseIdx];
    const next = phrases[(phraseIdx + 1) % phrases.length];

    await scrambleOut(current);
    await scrambleIn(next);

    taglineEl.classList.toggle(
      'glow',
      next.toLowerCase().includes('web developer')
    );

    phraseIdx = (phraseIdx + 1) % phrases.length;
  }
}

function renderHero(lang) {
  const h = I18N[lang].hero;
  const hello = document.querySelector('.hero .hello');
  if (hello) hello.textContent = h.hello;
  phrases = I18N[lang].taglines;
}
