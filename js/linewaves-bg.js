/* ============================================================
   LINEWAVES BG — fundo WebGL animado da section de Serviços.

   Porte vanilla (sem React) do componente <LineWaves/> do React Bits,
   adaptado ao site (mesma "linguagem" do fundo anterior):
     · cores do tema — verde institucional (--green) + lima (--lime)
     · desktop-only (perf; mobile fica sem, igual glow-wire)
     · mascara vertical (CSS .linewaves-bg) funde nas sections vizinhas:
       desvanece no topo (-> Sobre) e na base (-> Experiencia)
     · pausa fora da viewport / aba oculta; respeita prefers-reduced-motion
       (pinta 1 frame e para)

   Shader e uniforms sao os do componente original (so as cores mudaram).
   ogl carregado via CDN ESM, mesmo padrao de GSAP/Lenis no index.
   ============================================================ */
import { Renderer, Program, Mesh, Triangle } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm';

const hexToVec3 = hex => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`;

/* Inicia o LineWaves dentro de `container`. `interactTarget` recebe o
   mouse (usamos a section inteira pra reagir mesmo por cima dos cards,
   ja que o container fica atras deles). Devolve o teardown. */
function initLineWaves(container, opts = {}) {
  const {
    speed = 0.3,
    innerLineCount = 32,
    outerLineCount = 36,
    warpIntensity = 1.0,
    rotation = -45,
    edgeFadeWidth = 0.0,
    colorCycleSpeed = 1.0,
    brightness = 0.2,
    color1 = '#ffffff',
    color2 = '#ffffff',
    color3 = '#ffffff',
    enableMouseInteraction = true,
    mouseInfluence = 2.0,
    renderScale = 0.8,
    maxDpr = 1.5,
    maxBuffer = 2200,
    targetFps = 60,
    interactTarget = container,
  } = opts;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, maxDpr),
    });
  } catch {
    return () => {};
  }
  const gl = renderer.gl;
  if (!gl) return () => {};
  gl.clearColor(0, 0, 0, 0);
  const canvas = gl.canvas;
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const geometry = new Triangle(gl);
  const rotationRad = (rotation * Math.PI) / 180;

  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Float32Array([1, 1, 1]) },
      uSpeed: { value: speed },
      uInnerLines: { value: innerLineCount },
      uOuterLines: { value: outerLineCount },
      uWarpIntensity: { value: warpIntensity },
      uRotation: { value: rotationRad },
      uEdgeFadeWidth: { value: edgeFadeWidth },
      uColorCycleSpeed: { value: colorCycleSpeed },
      uBrightness: { value: brightness },
      uColor1: { value: new Float32Array(hexToVec3(color1)) },
      uColor2: { value: new Float32Array(hexToVec3(color2)) },
      uColor3: { value: new Float32Array(hexToVec3(color3)) },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uMouseInfluence: { value: mouseInfluence },
      uEnableMouse: { value: enableMouseInteraction },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });

  // mouse com lerp suave (0.05) e recentragem ao sair — atachado na section
  const current = [0.5, 0.5];
  const target = [0.5, 0.5];
  const handleMove = e => {
    const rect = container.getBoundingClientRect();
    target[0] = (e.clientX - rect.left) / rect.width;
    target[1] = 1.0 - (e.clientY - rect.top) / rect.height;
  };
  const handleLeave = () => { target[0] = 0.5; target[1] = 0.5; };
  if (enableMouseInteraction) {
    interactTarget.addEventListener('mousemove', handleMove, { passive: true });
    interactTarget.addEventListener('mouseleave', handleLeave, { passive: true });
  }

  let resizePending = false;
  const setSize = () => {
    const rect = container.getBoundingClientRect();
    // Cap no maior lado do drawing-buffer: a section fica MUITO alta quando o
    // deck CardSwap pina (pin-spacer). Buffer real = w * dpr, contamos o dpr.
    const dpr = renderer.dpr || 1;
    const bw = Math.max(1, rect.width * renderScale) * dpr;
    const bh = Math.max(1, rect.height * renderScale) * dpr;
    const k = Math.min(1, maxBuffer / Math.max(bw, bh));
    const width = Math.max(1, Math.floor(rect.width * renderScale * k));
    const height = Math.max(1, Math.floor(rect.height * renderScale * k));
    renderer.setSize(width, height);

    // renderer.setSize sobrescreve o style do canvas com o tamanho do buffer —
    // devolvemos 100% pra CSS esticar de volta ao container.
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const res = program.uniforms.uResolution.value;
    res[0] = gl.drawingBufferWidth;
    res[1] = gl.drawingBufferHeight;
    res[2] = gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight);
  };

  const ro = new ResizeObserver(() => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => { resizePending = false; setSize(); });
  });
  ro.observe(container);
  setSize();

  let raf = 0;
  let contextLost = false;
  let isVisible = true;
  let tabVisible = document.visibilityState !== 'hidden';
  const frameInterval = 1000 / targetFps;
  let lastFrameTime = 0;

  const renderStaticFrame = () => {
    program.uniforms.uTime.value = 0;
    renderer.render({ scene: mesh });
  };

  const loop = t => {
    if (contextLost || !isVisible || !tabVisible) return;
    if (t - lastFrameTime < frameInterval) { raf = requestAnimationFrame(loop); return; }
    lastFrameTime = t;

    program.uniforms.uTime.value = t * 0.001;

    if (enableMouseInteraction) {
      current[0] += 0.05 * (target[0] - current[0]);
      current[1] += 0.05 * (target[1] - current[1]);
      program.uniforms.uMouse.value[0] = current[0];
      program.uniforms.uMouse.value[1] = current[1];
    }

    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(loop);
  };

  const handleContextLost = e => { e.preventDefault(); contextLost = true; cancelAnimationFrame(raf); };
  const handleContextRestored = () => {
    contextLost = false;
    if (isVisible && tabVisible && !prefersReducedMotion) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);

  const io = new IntersectionObserver(([entry]) => {
    const wasVisible = isVisible;
    isVisible = entry.isIntersecting;
    if (isVisible && !wasVisible && !contextLost && tabVisible && !prefersReducedMotion) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  }, { threshold: 0 });
  io.observe(container);

  const handleVisibilityChange = () => {
    tabVisible = document.visibilityState !== 'hidden';
    if (tabVisible && isVisible && !contextLost && !prefersReducedMotion) {
      cancelAnimationFrame(raf);
      lastFrameTime = 0;
      raf = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(raf);
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // reduced-motion: 1 frame e para, sem loop perpetuo
  if (prefersReducedMotion) renderStaticFrame();
  else raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    if (enableMouseInteraction) {
      interactTarget.removeEventListener('mousemove', handleMove);
      interactTarget.removeEventListener('mouseleave', handleLeave);
    }
    try { container.removeChild(canvas); } catch {}
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

/* ---- monta o fundo na section de Servicos ---- */
(function mountServicesLineWaves() {
  const section = document.querySelector('#services');
  if (!section) return;
  // desktop-only (perf) — mobile fica sem o fundo, igual glow-wire/xp-pulse.
  // O CSS tambem esconde .linewaves-bg abaixo de 1024px se a janela encolher.
  if (!window.matchMedia('(min-width: 1025px)').matches) return;

  let layer = section.querySelector('.linewaves-bg');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'linewaves-bg';
    layer.setAttribute('aria-hidden', 'true');
    section.prepend(layer);
  }

  initLineWaves(layer, {
    speed: 0.2,
    innerLineCount: 32,
    outerLineCount: 40,
    warpIntensity: 1.0,
    rotation: -52,
    edgeFadeWidth: 0.0,
    colorCycleSpeed: 1.0,
    brightness: 0.1,
    color1: '#22c55e',       // verde institucional (--green)
    color2: '#a3e635',       // lima do tema (--lime)
    color3: '#ffffff',       // realce
    enableMouseInteraction: true,
    mouseInfluence: 0.8,
    interactTarget: section, // mouse funciona mesmo por cima dos cards
  });
})();
