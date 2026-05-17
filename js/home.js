'use strict';

/* =========================================================
   HOME — Hero + Tagline Morph Scramble
   Em vez de "apagar tudo e escrever de novo", a frase atual se
   transforma DIRETO na próxima: cada posição ignita, embaralha
   alguns frames, e settla no caractere alvo. Fluxo contínuo,
   sem gap visual de tela vazia.
   ========================================================= */

const taglineEl = document.getElementById('taglineText');
let phrases = I18N[LANG].taglines;

const HOLD_MS    = 3200;  // tempo que cada frase fica visível
const MORPH_MS   = 1100;  // duração da transformação entre frases
const GLYPH_TICK = 55;    // intervalo do flicker dos glifos (ms)

let phraseIdx = 0;

/* Charset enxuto — só letras, casando com o tom italic serif da tagline */
const SCRAMBLE_GLYPHS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const randGlyph = () =>
  SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0];

/* Espaços, pontuação e acentos preservam — só letras/dígitos rolam */
const isScramblable = ch => /[\p{L}\p{N}]/u.test(ch);

/* Sorteia uma cor de acento pra letra embaralhada — ~40% recebem cor
   (um pouco mais colorido pra integrar melhor com a paleta da página).
   Decisão estável por posição (só sorteia uma vez, no momento da ignição). */
function pickAccent() {
  const r = Math.random();
  if (r < 0.20) return 'green';   // 20% verde primário
  if (r < 0.40) return 'lime';    // 20% lime
  return null;                    // 60% sem acento (cor padrão)
}

/* Cola adjacentes com o mesmo acento num grupo só pra reduzir DOM nodes */
function paintTagline(parts) {
  // parts: array de { char, accent }
  const frag = document.createDocumentFragment();
  let group = null;

  for (const p of parts) {
    if (group && group.accent === p.accent) {
      group.text += p.char;
    } else {
      if (group) frag.appendChild(makeNode(group));
      group = { accent: p.accent, text: p.char };
    }
  }
  if (group) frag.appendChild(makeNode(group));

  taglineEl.textContent = '';
  taglineEl.appendChild(frag);
}

function makeNode(group) {
  if (!group.accent) return document.createTextNode(group.text);
  const span = document.createElement('span');
  span.className = 'scramble-accent scramble-accent--' + group.accent;
  span.textContent = group.text;
  return span;
}

/* =========================================================
   MORPH — frase atual → frase alvo, posição a posição.
   ========================================================= */
function scrambleTo(toText, duration = MORPH_MS) {
  return new Promise(resolve => {
    if (!taglineEl) { resolve(); return; }

    const fromText  = taglineEl.textContent || '';
    const fromChars = [...fromText];
    const toChars   = [...toText];
    const maxLen    = Math.max(fromChars.length, toChars.length);
    const denom     = Math.max(1, maxLen - 1);

    // Cada posição tem:
    //  ignite — quando começa a embaralhar (cedo, com jitter)
    //  settle — quando para no caractere alvo (mais tarde, com jitter)
    const events = Array.from({ length: maxLen }, (_, i) => {
      const order  = i / denom;
      const ignite = order * duration * 0.35 + Math.random() * duration * 0.15;
      const settle = duration * 0.40 + order * duration * 0.45 + Math.random() * duration * 0.15;
      return { ignite, settle };
    });

    // Caches por posição
    const glyphCache  = new Array(maxLen);
    const accentCache = new Array(maxLen);
    let lastRoll = 0;
    let sheenFired = false;

    const start = performance.now();
    taglineEl.classList.add('scrambling');

    function fireSheen() {
      if (sheenFired) return;
      sheenFired = true;
      taglineEl.classList.add('sheen-done');

      // Remove a classe EXATAMENTE quando a animação termina, não num
      // setTimeout arbitrário. Garante que a saída acontece no frame
      // em que o gradient já está em background-position: 0% 0%, com
      // a área visível inteiramente em currentColor — zero snap visual.
      let cleaned = false;
      const clean = () => {
        if (cleaned) return;
        cleaned = true;
        taglineEl.classList.remove('sheen-done');
        taglineEl.removeEventListener('animationend', onAnimEnd);
      };
      const onAnimEnd = e => {
        if (e.animationName === 'tagline-sheen-text') clean();
      };
      taglineEl.addEventListener('animationend', onAnimEnd);
      // Fallback se animationend não disparar (edge cases)
      setTimeout(clean, 1100);
    }

    function tick(now) {
      const elapsed = now - start;
      const rollNow = (now - lastRoll) >= GLYPH_TICK;
      if (rollNow) lastRoll = now;

      // Dispara o sheen no meio do morph — assim ele roda em paralelo
      // com a parte final do scramble, e termina suavemente depois.
      if (!sheenFired && elapsed >= duration * 0.5) fireSheen();

      let pending = 0;
      const parts = [];

      for (let i = 0; i < maxLen; i++) {
        const { ignite, settle } = events[i];
        const fromCh = fromChars[i];
        const toCh   = toChars[i];

        if (elapsed >= settle) {
          if (toCh !== undefined) parts.push({ char: toCh, accent: null });
          continue;
        }

        if (elapsed >= ignite) {
          const ref = toCh ?? fromCh;
          if (ref === undefined) continue;

          if (!isScramblable(ref)) {
            parts.push({ char: ref, accent: null });
          } else {
            if (rollNow || glyphCache[i] === undefined) {
              glyphCache[i] = randGlyph();
            }
            if (accentCache[i] === undefined) {
              accentCache[i] = pickAccent();
            }
            parts.push({ char: glyphCache[i], accent: accentCache[i] });
          }
          pending++;
        } else {
          if (fromCh !== undefined) {
            parts.push({ char: fromCh, accent: null });
            pending++;
          }
        }
      }

      paintTagline(parts);

      if (pending === 0) {
        taglineEl.textContent = toText;
        taglineEl.classList.remove('scrambling');
        // garantia (se o morph for muito rápido e nem chegou em 50%)
        fireSheen();
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  });
}

/* =========================================================
   LOOP — alterna entre as frases indefinidamente
   ========================================================= */
async function cycleTaglines() {
  if (!taglineEl) return;

  const applyGlow = phrase =>
    taglineEl.classList.toggle('glow', phrase.toLowerCase().includes('web developer'));

  taglineEl.textContent = '';

  while (true) {
    const next = phrases[phraseIdx];
    await scrambleTo(next);
    applyGlow(next);
    await sleep(HOLD_MS);
    phraseIdx = (phraseIdx + 1) % phrases.length;
  }
}

function renderHero(lang) {
  const h = I18N[lang].hero;
  const hello = document.querySelector('.hero .hello');
  if (hello) hello.textContent = h.hello;
  phrases = I18N[lang].taglines;
}
