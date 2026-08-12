/* ============================================================
   FERROFLUID BG — fundo WebGL animado da experiencia INTEIRA (#xp +
   #timeline), envoltos em .experience-bg-wrap.

   Porte vanilla (sem React) do componente <Ferrofluid/> do React Bits.
   E um shader 2D fullscreen (ogl) -> preenche QUALQUER proporcao limpo,
   sem "caixa" nem distorcao. Ocupa a section inteira (canvas inset:0),
   SEM mascara: substitui o fundo preto por fluido verde fluindo.

   Adaptado ao site: SO as cores mudaram (verde/lima/branco do tema); o
   resto dos parametros e o do exemplo de uso. Fundo transparente
   (clearColor 0) -> o fluido compoe sobre o --bg escuro do site.

   Perf: render em escala reduzida (renderScale) com cap de buffer, dpr
   limitado, ~30fps, pausa fora da viewport / aba oculta, desktop-only,
   respeita prefers-reduced-motion. ogl via CDN ESM (padrao GSAP/Lenis).
   ============================================================ */
import { Renderer, Program, Mesh, Triangle } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm';

const MAX_COLORS = 8;

const hexToRGB = hex => {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
};

const prepColors = input => {
  const base = (input && input.length ? input : ['#4F46E5', '#06B6D4', '#E0F2FE']).slice(0, MAX_COLORS);
  const count = base.length;
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]));
  const avg = [0, 0, 0];
  for (let i = 0; i < count; i++) { avg[0] += arr[i][0]; avg[1] += arr[i][1]; avg[2] += arr[i][2]; }
  avg[0] /= count; avg[1] /= count; avg[2] /= count;
  return { arr, count, avg };
};

const flowVec = d => {
  switch (d) {
    case 'up': return [0, 1];
    case 'down': return [0, -1];
    case 'left': return [-1, 0];
    case 'right': return [1, 0];
    default: return [0, -1];
  }
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uMouseColor;
uniform vec2  uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

#define PI 3.14159265

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 p = fragCoord / iResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = iTime;

  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);

  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;

  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);

  float mapeaks = smin(peaks, peaks2, max(uFluidity, 0.001));

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mp = iMouse / iResolution.y * ref;
    float md = length(p - mp) / ref;
    float rr = max(uMouseRadius, 0.02);
    mGlow = exp(-md * md / (rr * rr)) * uMouseStrength;
  }

  float band = (uRimWidth - abs((mapeaks - 0.4) * 2.0)) * 5.0;
  float ltn = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
  ltn = pow(ltn, uSharpness) * uGlow;
  ltn *= clamp(1.0 - mGlow, 0.0, 1.0);

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 col = palette(h);

  vec3 outc = col * ltn;
  float a = clamp(max(outc.r, max(outc.g, outc.b)), 0.0, 1.0);
  fragColor = vec4(outc, a * uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

function initFerrofluid(container, opts = {}) {
  const {
    colors = ['#ffffff'],
    speed = 0.5, scale = 1.6, turbulence = 1, fluidity = 0.1,
    rimWidth = 0.2, sharpness = 2.5, shimmer = 1.5, glow = 2,
    flowDirection = 'down', opacity = 1,
    mouseInteraction = false, mouseStrength = 1, mouseRadius = 0.35, mouseDampening = 0.15,
    renderScale = 0.8, maxDpr = 1.25, targetFps = 30, maxBuffer = 2200,
  } = opts;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, maxDpr),
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    return () => {};
  }
  const gl = renderer.gl;
  if (!gl) return () => {};
  gl.clearColor(0, 0, 0, 0);
  const canvas = gl.canvas;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  const { arr, count, avg } = prepColors(colors);

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      iResolution: { value: [1, 1, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uColor0: { value: arr[0] }, uColor1: { value: arr[1] },
      uColor2: { value: arr[2] }, uColor3: { value: arr[3] },
      uColor4: { value: arr[4] }, uColor5: { value: arr[5] },
      uColor6: { value: arr[6] }, uColor7: { value: arr[7] },
      uColorCount: { value: count },
      uMouseColor: { value: avg },
      uFlow: { value: flowVec(flowDirection) },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uTurbulence: { value: turbulence },
      uFluidity: { value: fluidity },
      uRimWidth: { value: rimWidth },
      uSharpness: { value: sharpness },
      uShimmer: { value: shimmer },
      uGlow: { value: glow },
      uOpacity: { value: opacity },
      uMouseEnabled: { value: mouseInteraction ? 1 : 0 },
      uMouseStrength: { value: mouseStrength },
      uMouseRadius: { value: mouseRadius },
    },
  });
  const uniforms = program.uniforms;

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  let resizePending = false;
  const setSize = () => {
    const rect = container.getBoundingClientRect();
    const dpr = renderer.dpr || 1;
    // cap no maior lado do buffer: a experiencia e ALTA (cabecalho + timeline);
    // sem o cap o buffer explodiria. buffer real = w * dpr.
    const bw = Math.max(1, rect.width * renderScale) * dpr;
    const bh = Math.max(1, rect.height * renderScale) * dpr;
    const k = Math.min(1, maxBuffer / Math.max(bw, bh));
    const w = Math.max(1, Math.floor(rect.width * renderScale * k));
    const h = Math.max(1, Math.floor(rect.height * renderScale * k));
    renderer.setSize(w, h);
    // renderer.setSize mexe no style do canvas — devolvemos 100% pra o CSS
    // esticar de volta ao container (preenche a section inteira)
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
  };
  const ro = new ResizeObserver(() => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => { resizePending = false; setSize(); });
  });
  ro.observe(container);
  setSize();

  // mouse (opcional; desligado no uso atual) — le na section, nao no canvas
  const mouseTarget = [0, 0];
  const handleMove = e => {
    const rect = container.getBoundingClientRect();
    const sc = renderer.dpr || 1;
    mouseTarget[0] = (e.clientX - rect.left) * sc * renderScale;
    mouseTarget[1] = (rect.height - (e.clientY - rect.top)) * sc * renderScale;
    if (mouseDampening <= 0) { uniforms.iMouse.value[0] = mouseTarget[0]; uniforms.iMouse.value[1] = mouseTarget[1]; }
  };
  if (mouseInteraction) container.addEventListener('pointermove', handleMove, { passive: true });

  let raf = 0;
  let contextLost = false;
  let isVisible = true;
  let tabVisible = document.visibilityState !== 'hidden';
  const frameInterval = 1000 / targetFps;
  let lastFrame = 0;
  let lastMouseT = 0;

  const render = () => renderer.render({ scene: mesh });

  const loop = t => {
    if (contextLost || !isVisible || !tabVisible) return;
    if (t - lastFrame < frameInterval) { raf = requestAnimationFrame(loop); return; }
    lastFrame = t;

    uniforms.iTime.value = t * 0.001;

    if (mouseInteraction && mouseDampening > 0) {
      if (!lastMouseT) lastMouseT = t;
      const dt = (t - lastMouseT) / 1000;
      lastMouseT = t;
      const factor = Math.min(1, 1 - Math.exp(-dt / Math.max(1e-4, mouseDampening)));
      const cur = uniforms.iMouse.value;
      cur[0] += (mouseTarget[0] - cur[0]) * factor;
      cur[1] += (mouseTarget[1] - cur[1]) * factor;
    }

    render();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { lastFrame = 0; lastMouseT = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };

  const handleContextLost = e => { e.preventDefault(); contextLost = true; cancelAnimationFrame(raf); };
  const handleContextRestored = () => { contextLost = false; if (isVisible && tabVisible && !prefersReducedMotion) start(); };
  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);

  const io = new IntersectionObserver(([entry]) => {
    const was = isVisible;
    isVisible = entry.isIntersecting;
    if (isVisible && !was && !contextLost && tabVisible && !prefersReducedMotion) start();
  }, { threshold: 0 });
  io.observe(container);

  const handleVisibilityChange = () => {
    tabVisible = document.visibilityState !== 'hidden';
    if (tabVisible && isVisible && !contextLost && !prefersReducedMotion) start();
    else cancelAnimationFrame(raf);
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // reduced-motion: 1 frame e para
  if (prefersReducedMotion) { uniforms.iTime.value = 0; render(); }
  else raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    if (mouseInteraction) container.removeEventListener('pointermove', handleMove);
    try { container.removeChild(canvas); } catch {}
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

/* ---- monta o fundo cobrindo a experiencia INTEIRA (#xp + #timeline) ---- */
(function mountExperienceFerrofluid() {
  const wrap = document.querySelector('.experience-bg-wrap');
  if (!wrap) return;
  // desktop-only (perf) — mobile fica sem, igual os outros fx do site.
  if (!window.matchMedia('(min-width: 1025px)').matches) return;
  // ...e desktop LARGO nao quer dizer desktop POTENTE (ver js/gpu-gate.js):
  // em maquina fraca o fundo nao liga. E camada decorativa, nada quebra.
  if (typeof podeRodarWebGLPesado === 'function' && !podeRodarWebGLPesado()) return;

  let layer = wrap.querySelector(':scope > .ferrofluid-bg');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'ferrofluid-bg';
    layer.setAttribute('aria-hidden', 'true');
    wrap.prepend(layer);
  }

  initFerrofluid(layer, {
    // SO as cores mudaram (lima -> verde -> branco, tema do site);
    // o resto e o do exemplo de uso.
    colors: ['#a3e635', '#22c55e', '#ffffff'],
    speed: 0.1,
    scale: 1.5,
    turbulence: 0.5,
    fluidity: 0.19,
    rimWidth: 0.2,
    sharpness: 5,
    shimmer: 1,
    glow: 2.1,
    flowDirection: 'down',
    opacity: 1,
    mouseInteraction: false,
    /* medium ainda liga o shader (podeRodarWebGLPesado), mas em
       resolucao menor — mesmos pixels na tela, menos trabalho GPU. */
    renderScale: typeof perfRenderScale === 'function' ? perfRenderScale(0.8) : 0.8,
    maxDpr: (document.documentElement.dataset.perf === 'medium') ? 1 : 1.25,
    targetFps: (document.documentElement.dataset.perf === 'medium') ? 24 : 30,
  });
})();
