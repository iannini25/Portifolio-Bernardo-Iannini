import{Renderer as ae,Program as se,Mesh as ue,Triangle as ce}from"https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm";import{createGovernor as fe,isScrolling as me,TOUCH as de}from"./gl-governor.js";const _=8,pe=o=>{const t=o.replace("#","").padEnd(6,"0");return[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255]},ve=o=>{const t=(o&&o.length?o:["#4F46E5","#06B6D4","#E0F2FE"]).slice(0,_),r=t.length,i=[];for(let n=0;n<_;n++)i.push(pe(t[Math.min(n,t.length-1)]));const l=[0,0,0];for(let n=0;n<r;n++)l[0]+=i[n][0],l[1]+=i[n][1],l[2]+=i[n][2];return l[0]/=r,l[1]/=r,l[2]/=r,{arr:i,count:r,avg:l}},he=o=>{switch(o){case"up":return[0,1];case"down":return[0,-1];case"left":return[-1,0];case"right":return[1,0];default:return[0,-1]}},ge=`
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`,xe=`
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
`;function we(o,t={}){const{colors:r=["#ffffff"],speed:i=.5,scale:l=1.6,turbulence:n=1,fluidity:R=.1,rimWidth:x=.2,sharpness:V=2.5,shimmer:H=1.5,glow:N=2,flowDirection:X="down",opacity:Y=1,mouseInteraction:F=!1,mouseStrength:j=1,mouseRadius:J=.35,mouseDampening:E=.15,renderScale:K=.5,maxDpr:Q=1.25,targetFps:O=30,maxBuffer:Z=1400}=t;let p;try{p=new ae({dpr:Math.min(window.devicePixelRatio||1,Q),alpha:!0,antialias:!1,powerPreference:"low-power"})}catch{return()=>{}}const c=p.gl;if(!c)return()=>{};c.clearColor(0,0,0,0);const a=c.canvas;a.style.width="100%",a.style.height="100%",a.style.display="block",o.appendChild(a);const{arr:f,count:$,avg:ee}=ve(r),q=new se(c,{vertex:ge,fragment:xe,uniforms:{iResolution:{value:[1,1,1]},iMouse:{value:[0,0]},iTime:{value:0},uColor0:{value:f[0]},uColor1:{value:f[1]},uColor2:{value:f[2]},uColor3:{value:f[3]},uColor4:{value:f[4]},uColor5:{value:f[5]},uColor6:{value:f[6]},uColor7:{value:f[7]},uColorCount:{value:$},uMouseColor:{value:ee},uFlow:{value:he(X)},uSpeed:{value:i},uScale:{value:l},uTurbulence:{value:n},uFluidity:{value:R},uRimWidth:{value:x},uSharpness:{value:V},uShimmer:{value:H},uGlow:{value:N},uOpacity:{value:Y},uMouseEnabled:{value:F?1:0},uMouseStrength:{value:j},uMouseRadius:{value:J}}}),w=q.uniforms,oe=new ce(c),te=new ue(c,{geometry:oe,program:q});let m=K,k=!1;const I=()=>{const e=o.getBoundingClientRect(),u=p.dpr||1,h=Math.max(1,e.width*m)*u,B=Math.max(1,e.height*m)*u,M=Math.min(1,Z/Math.max(h,B)),g=Math.max(1,Math.floor(e.width*m*M)),le=Math.max(1,Math.floor(e.height*m*M));p.setSize(g,le),a.style.width="100%",a.style.height="100%",w.iResolution.value=[c.drawingBufferWidth,c.drawingBufferHeight,1]},G=new ResizeObserver(()=>{k||(k=!0,requestAnimationFrame(()=>{k=!1,I()}))});G.observe(o),I();const v=[0,0],P=e=>{const u=o.getBoundingClientRect(),h=p.dpr||1;v[0]=(e.clientX-u.left)*h*m,v[1]=(u.height-(e.clientY-u.top))*h*m,E<=0&&(w.iMouse.value[0]=v[0],w.iMouse.value[1]=v[1])};F&&o.addEventListener("pointermove",P,{passive:!0});let s=0,S=!1,d=!1,b=document.visibilityState!=="hidden",A=1e3/O;const re=fe({scale:m,fps:O,onScale:e=>{m=e,I()},onFps:e=>{A=1e3/e}});let T=0,C=0;const ne=()=>p.render({scene:te}),y=e=>{if(S||!d||!b)return;re(e);const u=me(e);if(u&&de){s=requestAnimationFrame(y);return}const h=u?A*2:A;if(e-T<h){s=requestAnimationFrame(y);return}if(T=e,w.iTime.value=e*.001,F&&E>0){C||(C=e);const B=(e-C)/1e3;C=e;const M=Math.min(1,1-Math.exp(-B/Math.max(1e-4,E))),g=w.iMouse.value;g[0]+=(v[0]-g[0])*M,g[1]+=(v[1]-g[1])*M}ne(),s=requestAnimationFrame(y)},ie=()=>{T=0,C=0,cancelAnimationFrame(s),s=requestAnimationFrame(y)},D=e=>{e.preventDefault(),S=!0,cancelAnimationFrame(s)},W=()=>{S=!1,d&&b&&ie()};a.addEventListener("webglcontextlost",D),a.addEventListener("webglcontextrestored",W);const L=()=>{cancelAnimationFrame(s),d&&b&&!S&&(s=requestAnimationFrame(y))},z=new IntersectionObserver(([e])=>{const u=d;d=e.isIntersecting,d&&!u?L():d||cancelAnimationFrame(s)},{rootMargin:"160px 0px",threshold:0});z.observe(o);const U=()=>{b=document.visibilityState!=="hidden",b?L():cancelAnimationFrame(s)};return document.addEventListener("visibilitychange",U),d=o.getBoundingClientRect().bottom>-160&&o.getBoundingClientRect().top<(window.innerHeight||0)+160,L(),()=>{cancelAnimationFrame(s),G.disconnect(),z.disconnect(),document.removeEventListener("visibilitychange",U),a.removeEventListener("webglcontextlost",D),a.removeEventListener("webglcontextrestored",W),F&&o.removeEventListener("pointermove",P);try{o.removeChild(a)}catch{}c.getExtension("WEBGL_lose_context")?.loseContext()}}(function(){const t=document.querySelector(".experience-bg-wrap");if(!t)return;let r=t.querySelector(":scope > .ferrofluid-bg");r||(r=document.createElement("div"),r.className="ferrofluid-bg",r.setAttribute("aria-hidden","true"),t.prepend(r));const i=window.matchMedia("(pointer: coarse)").matches,l=()=>{we(r,{colors:["#a3e635","#bef264","#ffffff"],speed:.1,scale:1.5,turbulence:.5,fluidity:.19,rimWidth:.2,sharpness:5,shimmer:1,glow:2.1,flowDirection:"down",opacity:1,mouseInteraction:!1,renderScale:i?.4:.5,maxDpr:i?1:1.25,maxBuffer:i?900:1400,targetFps:i?24:30})};if(!("IntersectionObserver"in window)){l();return}const n=new IntersectionObserver(R=>{R.some(x=>x.isIntersecting)&&(n.disconnect(),(window.requestIdleCallback||(x=>setTimeout(x,1)))(l,{timeout:600}))},{rootMargin:"900px 0px"});n.observe(t)})();
