import{Renderer as re,Program as ae,Mesh as ie,Triangle as le}from"https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm";import{createGovernor as se,isScrolling as ue,TOUCH as ce}from"./gl-governor.js";const W=o=>{const n=o.replace("#","");return[parseInt(n.slice(0,2),16)/255,parseInt(n.slice(2,4),16)/255,parseInt(n.slice(4,6),16)/255]},de=`
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`,fe=`
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
`;function me(o,n={}){const{speed:l=.3,innerLineCount:v=32,outerLineCount:w=36,warpIntensity:y=1,rotation:F=-45,edgeFadeWidth:h=0,colorCycleSpeed:z=1,brightness:N=.2,color1:U="#ffffff",color2:G="#ffffff",color3:X="#ffffff",enableMouseInteraction:x=!0,mouseInfluence:j=2,renderScale:J=.8,maxDpr:K=1.5,maxBuffer:Q=2200,targetFps:E=60,interactTarget:b=o}=n;let u;try{u=new re({alpha:!0,premultipliedAlpha:!1,antialias:!1,dpr:Math.min(window.devicePixelRatio||1,K),powerPreference:"low-power"})}catch{return()=>{}}const r=u.gl;if(!r)return()=>{};r.clearColor(0,0,0,0);const a=r.canvas;a.style.display="block",a.style.width="100%",a.style.height="100%",o.appendChild(a);const Z=new le(r),$=F*Math.PI/180,c=new ae(r,{vertex:de,fragment:fe,uniforms:{uTime:{value:0},uResolution:{value:new Float32Array([1,1,1])},uSpeed:{value:l},uInnerLines:{value:v},uOuterLines:{value:w},uWarpIntensity:{value:y},uRotation:{value:$},uEdgeFadeWidth:{value:h},uColorCycleSpeed:{value:z},uBrightness:{value:N},uColor1:{value:new Float32Array(W(U))},uColor2:{value:new Float32Array(W(G))},uColor3:{value:new Float32Array(W(X))},uMouse:{value:new Float32Array([.5,.5])},uMouseInfluence:{value:j},uEnableMouse:{value:x}}}),R=new ie(r,{geometry:Z,program:c}),d=[.5,.5],f=[.5,.5],P=e=>{const t=o.getBoundingClientRect();f[0]=(e.clientX-t.left)/t.width,f[1]=1-(e.clientY-t.top)/t.height},k=()=>{f[0]=.5,f[1]=.5};x&&(b.addEventListener("mousemove",P,{passive:!0}),b.addEventListener("mouseleave",k,{passive:!0}));let m=J,M=!1;const A=()=>{const e=o.getBoundingClientRect(),t=u.dpr||1,B=Math.max(1,e.width*m)*t,te=Math.max(1,e.height*m)*t,V=Math.min(1,Q/Math.max(B,te)),oe=Math.max(1,Math.floor(e.width*m*V)),ne=Math.max(1,Math.floor(e.height*m*V));u.setSize(oe,ne),a.style.width="100%",a.style.height="100%";const S=c.uniforms.uResolution.value;S[0]=r.drawingBufferWidth,S[1]=r.drawingBufferHeight,S[2]=r.drawingBufferWidth/Math.max(1,r.drawingBufferHeight)},q=new ResizeObserver(()=>{M||(M=!0,requestAnimationFrame(()=>{M=!1,A()}))});q.observe(o),A();let i=0,C=!1,s=!1,p=document.visibilityState!=="hidden",I=1e3/E;const ee=se({scale:m,fps:E,onScale:e=>{m=e,A()},onFps:e=>{I=1e3/e}});let L=0;const ve=()=>{c.uniforms.uTime.value=0,u.render({scene:R})},g=e=>{if(C||!s||!p)return;ee(e);const t=ue(e);if(t&&ce){i=requestAnimationFrame(g);return}const B=t?I*2:I;if(e-L<B){i=requestAnimationFrame(g);return}L=e,c.uniforms.uTime.value=e*.001,x&&(d[0]+=.05*(f[0]-d[0]),d[1]+=.05*(f[1]-d[1]),c.uniforms.uMouse.value[0]=d[0],c.uniforms.uMouse.value[1]=d[1]),u.render({scene:R}),i=requestAnimationFrame(g)},D=e=>{e.preventDefault(),C=!0,cancelAnimationFrame(i)},O=()=>{C=!1,s&&p&&(cancelAnimationFrame(i),i=requestAnimationFrame(g))};a.addEventListener("webglcontextlost",D),a.addEventListener("webglcontextrestored",O);const T=()=>{cancelAnimationFrame(i),s&&p&&!C&&(L=0,i=requestAnimationFrame(g))},Y=new IntersectionObserver(([e])=>{const t=s;s=e.isIntersecting,s&&!t?T():s||cancelAnimationFrame(i)},{rootMargin:"160px 0px",threshold:0});Y.observe(o);const _=()=>{p=document.visibilityState!=="hidden",p?T():cancelAnimationFrame(i)};document.addEventListener("visibilitychange",_);const H=o.getBoundingClientRect();return s=H.bottom>-160&&H.top<(window.innerHeight||0)+160,T(),()=>{cancelAnimationFrame(i),q.disconnect(),Y.disconnect(),document.removeEventListener("visibilitychange",_),a.removeEventListener("webglcontextlost",D),a.removeEventListener("webglcontextrestored",O),x&&(b.removeEventListener("mousemove",P),b.removeEventListener("mouseleave",k));try{o.removeChild(a)}catch{}r.getExtension("WEBGL_lose_context")?.loseContext()}}(function(){const n=document.querySelector("#services");if(!n)return;let l=n.querySelector(".linewaves-bg");l||(l=document.createElement("div"),l.className="linewaves-bg",l.setAttribute("aria-hidden","true"),n.prepend(l));const v=window.matchMedia("(pointer: coarse)").matches,w=()=>{me(l,{speed:.2,innerLineCount:32,outerLineCount:40,warpIntensity:1,rotation:-52,edgeFadeWidth:0,colorCycleSpeed:1,brightness:.1,color1:"#a3e635",color2:"#d9f99d",color3:"#ffffff",enableMouseInteraction:!0,mouseInfluence:.8,interactTarget:n,renderScale:v?.6:.8,maxDpr:v?1:1.5,targetFps:v?30:60})};if(!("IntersectionObserver"in window)){w();return}const y=new IntersectionObserver(F=>{F.some(h=>h.isIntersecting)&&(y.disconnect(),(window.requestIdleCallback||(h=>setTimeout(h,1)))(w,{timeout:600}))},{rootMargin:"900px 0px"});y.observe(n)})();
