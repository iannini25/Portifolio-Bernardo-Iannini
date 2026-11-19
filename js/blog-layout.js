"use strict";(function(S){const a=r=>String(r??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l]),j='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',B='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',W='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 6.6L21 9.2l-5 4.6L17.4 21 12 17.7 6.6 21 8 13.8 3 9.2l6.6-.6z"/></svg>',q='<svg class="bb-flower" viewBox="0 0 60 60" fill="currentColor" aria-hidden="true"><circle cx="30" cy="30" r="22"/>'+[0,45,90,135,180,225,270,315].map(r=>{const l=r*Math.PI/180;return`<circle cx="${(30+21*Math.cos(l)).toFixed(1)}" cy="${(30+21*Math.sin(l)).toFixed(1)}" r="8"/>`}).join("")+"</svg>";function R(r,l){const c=new Date(r);if(isNaN(c))return"";const o=new Intl.DateTimeFormat(l==="pt"?"pt-BR":"en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"America/Sao_Paulo"}).formatToParts(c),b=g=>(o.find(f=>f.type===g)||{}).value||"";return`${b("day")} ${b("month").replace(".","")} ${b("year")}`}function z(r,l){const{lang:c,labels:o,coverOf:b,facets:g,filter:f,query:A}=l,L=t=>o.cats&&o.cats[t]||t;let C=!0;const m=t=>{const e=C?'fetchpriority="high" decoding="async"':'loading="lazy" decoding="async"';return C=!1,`<div class="bb-media"><img src="${a(b(t.cover))}" alt="${a(t.coverAlt||t.title)}" width="800" height="500" ${e}></div>`},d=(t,e,s)=>`<article class="bb ${e}" style="--i:${s}" data-id="${a(t.id)}" data-slug="${a(t.slug)}" data-action="open" data-href="${a(t.url)}">`,v=t=>`<p class="bb-meta">${t.category?`<strong>${a(L(t.category))}</strong><span class="bb-dot" aria-hidden="true"></span>`:""}<span>${a(R(t.date,c))}</span></p>`,$=t=>`<h2 class="bb-t"><a href="${a(t.url)}">${a(t.title)}</a></h2>`,F=t=>`<span class="bb-notch bb-notch--tr"><a class="bb-go" href="${a(t.url)}" tabindex="-1" aria-hidden="true">${B}</a></span>`,O=(t,e,s)=>t.cover?`${d(t,`bb--photo ${e}`,s)}
      ${m(t)}
      ${t.featured?`<span class="bb-badge" title="${a(o.featured)}">${W}<span class="sr-only">${a(o.featured)}</span></span>`:""}
      <div class="bb-tab">${v(t)}${$(t)}</div>
    </article>`:y(t,e,s),I=(t,e,s,i)=>`${d(t,`bb--list ${s}`,i)}
      ${F(t)}
      <div class="bb-list-main">
        ${v(t)}${$(t)}
        ${t.excerpt?`<p class="bb-excerpt">${a(t.excerpt)}</p>`:""}
        <a class="bb-more" href="${a(t.url)}" tabindex="-1">${a(o.more)}</a>
      </div>
      ${e.length?`<ul class="bb-rows">${e.map(n=>`<li><a href="${a(n.url)}"><span>${a(n.title)}</span>${j}</a></li>`).join("")}</ul>`:""}
    </article>`,P=(t,e,s)=>t.cover?`${d(t,`bb--arch ${e}`,s)}
      <div class="bb-arch-text">${v(t)}${$(t)}</div>
      ${m(t)}
    </article>`:y(t,e,s),_=(t,e,s)=>t.cover?`${d(t,`bb--glass ${e}`,s)}
      ${m(t)}
      <span class="bb-orb" aria-hidden="true">${B}</span>
      <div class="bb-glass-text"><p class="bb-meta"><span>${a(t.readMin)} ${a(o.read)}</span><span class="bb-dot" aria-hidden="true"></span><span>${a(R(t.date,c))}</span></p>${$(t)}</div>
    </article>`:y(t,e,s),y=(t,e,s)=>`${d(t,`bb--note ${e}`,s)}
      ${F(t)}
      <div class="bb-list-main">${v(t)}${$(t)}${t.excerpt?`<p class="bb-excerpt">${a(t.excerpt)}</p>`:""}</div>
    </article>`,D=(t,e)=>{const s=f!=="all"||!!A,i=[...g.categories.map(n=>`<button type="button" class="bb-pill${f===n?" is-on":""}" data-filter="${a(n)}">${a(L(n))}</button>`),...g.tags.map(n=>`<button type="button" class="bb-pill${A===n?" is-on":""}" data-tag="${a(n)}">${a(n)}</button>`)].join("");return`<aside class="bb bb--topics ${t}" style="--i:${e}" aria-label="${a(o.topics)}">
      <h2 class="bb-topics-t">${a(o.topics)}</h2>
      <div class="bb-pills">${i}</div>
      <p class="bb-all">${a(o.allTopics)}</p>
      <span class="bb-notch bb-notch--br"><button type="button" class="bb-flower-btn${s?" is-on":""}" data-reset aria-label="${a(o.allTopics)}">${q}${j}</button></span>
    </aside>`},N=(t,e)=>{const s=[];let i=0;for(let n=0;n<t.length;n+=2,i++){const u=t[n],x=t[n+1],h=e+n,p=(w,k,M,E)=>w==="topics"?D(k,M):E?P(w,k,M):O(w,k,M);if(!x){s.push(p(u,"bb--s24",h,!1));break}s.push(i%2===0?p(u,"bb--s14",h,!1)+p(x,"bb--s10",h+1,!0):p(u,"bb--s10",h,!0)+p(x,"bb--s14",h+1,!1))}return s.join(`
`)};if(r.length>=6){const[t,e,s,i,n,u]=r;return[O(t,"bb--a",0),I(e,[s,i],"bb--b",1),P(n,"bb--c",2),_(u,"bb--d",3),D("bb--e",4),N(r.slice(6),5)].join(`
`)}return N([...r,"topics"],0)}const T={render:z};typeof module<"u"&&module.exports?module.exports=T:S.BlogLayout=T})(typeof window<"u"?window:globalThis);
