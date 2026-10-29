/* ============================================================
   GL GOVERNOR — qualidade adaptativa dos fundos WebGL.

   Mede a fluidez REAL da página no aparelho de quem visita (intervalo
   entre frames do rAF). Se a página cai abaixo de ~42fps de forma
   sustentada, o efeito baixa a própria resolução interna (o CSS estica
   o canvas: o desenho fica só mais macio, a forma e o movimento são os
   mesmos) e, no limite, o fps. Nunca sobe de volta: evita gangorra.

   Durante a rolagem o fundo roda na metade da taxa: segue vivo e a
   rolagem ganha folga no frame.
   ============================================================ */

let scrollingUntil = 0;
window.addEventListener('scroll', () => { scrollingUntil = performance.now() + 180; }, { passive: true });

export function isScrolling(now) {
  return now < scrollingUntil;
}

export function createGovernor({ scale, minScale = 0.3, fps, minFps = 20, onScale, onFps }) {
  let prev = 0;
  let acc = 0;
  let n = 0;
  let cooldown = 0;

  return function sample(t) {
    if (prev && t - prev < 250) {          // ignora pausas (aba oculta, fora da tela)
      acc += t - prev;
      n++;
    }
    prev = t;
    if (n < 30) return;
    const avg = acc / n;
    acc = 0;
    n = 0;
    if (cooldown > 0) { cooldown--; return; }
    if (avg <= 24) return;                  // ~42fps ou melhor: tudo certo
    if (scale > minScale) {
      scale = Math.max(minScale, scale * 0.8);
      onScale(scale);
    } else if (fps > minFps) {
      fps = Math.max(minFps, Math.round(fps * 0.75));
      onFps(fps);
    }
    cooldown = 2;                           // espera assentar antes de medir de novo
  };
}
