"use strict";const SERVICE_ICONS={code:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="14" y1="4" x2="10" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',brain:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 4a3 3 0 0 0-3 3 2.5 2.5 0 0 0-2 2.5A2.5 2.5 0 0 0 7 12a2.5 2.5 0 0 0-2 2.5A2.5 2.5 0 0 0 7 17a3 3 0 0 0 3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 4a3 3 0 0 1 3 3 2.5 2.5 0 0 1 2 2.5A2.5 2.5 0 0 1 17 12a2.5 2.5 0 0 1 2 2.5A2.5 2.5 0 0 1 17 17a3 3 0 0 1-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="4" x2="14" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="10" y1="20" x2="14" y2="20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".55"/></svg>',layers:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 3 8l9 5 9-5-9-5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 13l9 5 9-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 17.5l9 5 9-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/></svg>',tool:'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17a4 4 0 0 1-.7-7.9 6 6 0 0 1 11.6 1A3.5 3.5 0 0 1 17 17H7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9.5 12.5 12 10l2.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'};function buildServiceCard(e,o,t){const r=document.createElement("article");r.className="svc-card",r.style.setProperty("--i",t),r.style.setProperty("--svc-color",t%2?"var(--lime)":"var(--green)");const i=SERVICE_ICONS[e.icon]||SERVICE_ICONS.code,c=(e.features||[]).map(n=>`<li>${n}</li>`).join(""),l=String(t+1).padStart(2,"0");return r.innerHTML=`
    <div class="svc-card__inner">
      <span class="svc-bloom" aria-hidden="true"></span>

      <div class="svc-card__depth">
        <div class="svc-card__head">
          <span class="svc-icon" aria-hidden="true">${i}</span>
          <span class="svc-head-text">
            <h3 class="svc-title">${e.title}</h3>
            ${e.tag?`<span class="svc-tag">${e.tag}</span>`:""}
          </span>
        </div>

        <p class="svc-desc">${e.desc||""}</p>
        ${c?`<ul class="svc-features">${c}</ul>`:""}

        <a class="svc-cta" href="#contato">
          <span>${o}</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  `,r.querySelector(".svc-cta").addEventListener("click",n=>{const s=document.querySelector("#contato");s&&(n.preventDefault(),window.lenis?window.lenis.scrollTo(s):s.scrollIntoView({behavior:"smooth",block:"start"}))}),r}function renderServices(e){const o=document.getElementById("servicesGrid");if(!o)return;const t=I18N[e].services;if(!t)return;const r=document.querySelector("#services .section-title"),i=document.querySelector("#services .section-sub");r&&(r.textContent=t.title),i&&(i.textContent=t.sub);const c=t.ctaLabel||(e==="pt"?"Solicitar proposta":"Get a quote");o.innerHTML="";const l=document.createElement("div");l.className="svc-pile",(t.list||[]).forEach((n,s)=>l.appendChild(buildServiceCard(n,c,s))),o.appendChild(l),document.dispatchEvent(new CustomEvent("svc:rendered"))}
