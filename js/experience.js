"use strict";const btnAcad=document.getElementById("btnAcad"),btnProf=document.getElementById("btnProf"),btnCourses=document.getElementById("btnCourses"),groupAcad=document.getElementById("group-acad"),groupProf=document.getElementById("group-prof"),groupCourses=document.getElementById("group-courses"),tlMode=document.getElementById("tlMode");let CURRENT_MODE="prof";const SVG_PIN=`
  <svg class="loc-ico" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"
          stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
  </svg>`,SVG_CERT=`
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" class="cert-icon">
    <circle cx="12" cy="9" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="12" cy="9" r="2.6" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <path d="M9.5 13.5 8 20l3-1.7L14 20l-1.5-6.5"
          fill="none" stroke="currentColor" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;function yearCardHtml(t,n){const e=I18N[n].xp.timeline,l=t.start||{},s=t.end||{},r=`
    <div class="tl-year-row">
      <span class="tl-year-num">${l.year??""}</span>
      <span class="tl-year-mon">${l.month??""}</span>
    </div>`,c=s.current?`
      <div class="tl-year-row tl-year-row--current">
        <span class="tl-year-num">${e.currentLabel||"Current"}</span>
        <span class="tl-year-mon">${e.currentSub||"IN PROGRESS"}</span>
      </div>`:`
      <div class="tl-year-row">
        <span class="tl-year-num">${s.year??""}</span>
        <span class="tl-year-mon">${s.month??""}</span>
      </div>`;return`
    <div class="tl-year">
      ${r}
      ${c}
    </div>`}function contentCardHtml(t){let n="";if(t.cert&&t.cert.id&&t.cert.img){const c=t.cert.img.startsWith("img/")?t.cert.img:`img/${t.cert.img}`,o=t.cert.label||"Certificate";n=`
      <div class="cert-btn-wrap">
        <button class="btn-cert" type="button" data-cert-id="${t.cert.id}">
          ${SVG_CERT}
          <span>${o}</span>
        </button>
      </div>
      <dialog id="${t.cert.id}" class="cert-modal">
        <div class="cert-content">
          <button class="cert-close" type="button" aria-label="${I18N[LANG].a11y&&I18N[LANG].a11y.closeCert||"Close certificate"}">\xD7</button>
          <img src="${c}" alt="${o} - ${t.title}" loading="lazy" decoding="async">
        </div>
      </dialog>`}const e=`
    <h3 class="tl-card-title">${t.title}</h3>
    <div class="tl-meta">
      <span class="tl-org">${t.org}</span>
      <span class="tl-role">${t.role}</span>
    </div>`,l=t.loc?`<div class="tl-loc">${SVG_PIN}<span>${t.loc}</span></div>`:"",s=Array.isArray(t.bullets)&&t.bullets.length?`<ul class="tl-bullets">${t.bullets.map(c=>`<li>${c}</li>`).join("")}</ul>`:"",r=Array.isArray(t.skills)&&t.skills.length?`<div class="tl-skills">${t.skills.map(c=>`<button class="btn-skill" type="button">${c}</button>`).join("")}</div>`:"";return`
    <div class="tl-card panel">
      ${e}
      ${l}
      ${s}
      ${n}
      ${r}
    </div>`}function buildTlEnd(){const t=document.createElement("div");return t.className="tl-end",t.setAttribute("aria-hidden","true"),t.innerHTML=`
    <span class="tl-end__dot tl-end__dot--a"></span>
    <span class="tl-end__dot tl-end__dot--b"></span>
    <span class="tl-end__dot tl-end__dot--c"></span>
    <span class="tl-end__dot tl-end__dot--d"></span>
    <span class="tl-end__btn">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="tl-end__icon">
        <path class="tl-end__chev tl-end__chev--1"
          d="M6 6.5l5 5.5-5 5.5"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="tl-end__chev tl-end__chev--2"
          d="M13 6.5l5 5.5-5 5.5"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  `,t}function buildTlEntry(t,n,e){const l=n%2===0?"right":"left",s=document.createElement("article");return s.className=`tl-entry tl-entry--${l}`,s.innerHTML=`
    ${yearCardHtml(t,e)}
    <span class="dot" aria-hidden="true"></span>
    ${contentCardHtml(t)}`,s}function wireCertModals(){document.querySelectorAll(".btn-cert").forEach(t=>{const n=t.getAttribute("data-cert-id");if(!n)return;const e=document.getElementById(n);if(!e)return;const l=e.querySelector(".cert-close");t.addEventListener("click",()=>{if(e.showModal)e.showModal();else{const s=e.querySelector("img");s&&s.src&&window.open(s.src,"_blank")}}),l&&l.addEventListener("click",()=>e.close()),e.addEventListener("cancel",s=>{s.preventDefault(),e.close()})})}function renderTimeline(t){if(!groupProf||!groupAcad||!groupCourses)return;const n=I18N[t].xp.timeline,e=(l,s)=>{l.innerHTML="",s.forEach((r,c)=>l.appendChild(buildTlEntry(r,c,t))),l.appendChild(buildTlEnd())};e(groupProf,n.prof||[]),e(groupAcad,n.acad||[]),e(groupCourses,n.courses||[]),setMode(CURRENT_MODE,t),wireCertModals()}function setMode(t,n=LANG){CURRENT_MODE=t,tlMode&&(tlMode.textContent=I18N[n].xp.modes?.[t]||I18N[n].modes?.[t]||""),groupProf?.classList.toggle("is-hidden",t!=="prof"),groupAcad?.classList.toggle("is-hidden",t!=="acad"),groupCourses?.classList.toggle("is-hidden",t!=="courses"),btnProf?.classList.toggle("active",t==="prof"),btnAcad?.classList.toggle("active",t==="acad"),btnCourses?.classList.toggle("active",t==="courses")}btnProf?.addEventListener("click",()=>setMode("prof")),btnAcad?.addEventListener("click",()=>setMode("acad")),btnCourses?.addEventListener("click",()=>setMode("courses"));
