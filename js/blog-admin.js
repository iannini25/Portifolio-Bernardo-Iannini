"use strict";async function apiGetPosts(){if(!window.BlogDB)throw new Error("Supabase n\xE3o configurado \u2014 veja js/supabase-config.js");return window.BlogDB.listAll()}async function reloadPosts(){state.posts=await apiGetPosts()}async function triggerRebuild(e){let t="";try{const s=window.BlogDB?await window.BlogDB.getSession():null;t=s&&s.access_token||""}catch{t=""}if(!t)return{ok:!1,reason:"unauthorized"};let o;try{o=await fetch("/api/rebuild",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+t},body:JSON.stringify({reason:e||""})})}catch(s){return{ok:!1,reason:"not_configured",detail:s&&s.message||"sem rede"}}let n=null;try{n=await o.json()}catch{n=null}const r=n&&n.error||"";return o.ok?n&&n.ok?{ok:!0,reason:"ok"}:{ok:!1,reason:"not_configured"}:o.status===404?{ok:!1,reason:"not_configured"}:o.status===405&&!n?{ok:!1,reason:"not_configured"}:o.status===501||r==="not_configured"?{ok:!1,reason:"not_configured"}:o.status===403||r==="forbidden"?{ok:!1,reason:"forbidden"}:o.status===401||r==="unauthorized"?{ok:!1,reason:"unauthorized"}:{ok:!1,reason:"hook_failed",detail:n&&n.detail||r||"HTTP "+o.status}}function rebuildMessage(e,t,o){if(!o)return{msg:t+".",type:"success"};if(o.ok)return{msg:e+". O site atualiza em cerca de 1 minuto.",type:"success"};if(o.reason==="not_configured")return{msg:t+". A atualiza\xE7\xE3o autom\xE1tica do site n\xE3o respondeu, ent\xE3o ele entra no ar no pr\xF3ximo deploy (veja PUBLICAR.md).",type:"error"};if(o.reason==="unauthorized")return{msg:t+", mas n\xE3o deu pra confirmar sua sess\xE3o para atualizar o site. Recarregue a p\xE1gina; se persistir, entre de novo. O site atualiza no pr\xF3ximo deploy.",type:"error"};if(o.reason==="forbidden")return{msg:t+", mas esta conta n\xE3o tem permiss\xE3o para atualizar o site (s\xF3 o dono do painel dispara deploy). Confira ADMIN_USER_ID nas vari\xE1veis de ambiente da Vercel. O site atualiza no pr\xF3ximo deploy.",type:"error"};const n=o.detail?" ("+o.detail+")":"";return{msg:t+", mas o rebuild do site falhou"+n+". O site atualiza no pr\xF3ximo deploy.",type:"error"}}const loadViews=()=>{const e={};return(state.posts||[]).forEach(t=>{e[t.id]=Number(t.views)||0}),e};function dataUrlToFile(e,t){const[o,n]=String(e).split(","),r=(o.match(/data:([^;]+)/)||[])[1]||"image/jpeg",s=(r.split("/")[1]||"jpg").replace("jpeg","jpg"),m=atob(n||""),p=new Uint8Array(m.length);for(let l=0;l<m.length;l++)p[l]=m.charCodeAt(l);const v=String(t||"img").replace(/\.[^.]+$/,"")+"."+s;return new File([p],v,{type:r})}function uploadErrorMsg(e){const t=(e&&e.message||String(e)).toLowerCase();return t.includes("bucket")&&t.includes("not found")?'Bucket "blog-images" n\xE3o existe no Supabase. Crie em Storage \u2192 New bucket (p\xFAblico).':t.includes("row-level security")||t.includes("policy")?"Sem permiss\xE3o pra subir imagem \u2014 confira as policies do bucket blog-images.":e&&e.message||"Falha ao enviar imagem"}const uid=()=>"p_"+Math.random().toString(36).slice(2,10)+Date.now().toString(36),slugify=e=>String(e||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,80),formatDate=e=>new Date(e).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric"}),formatDateTime=e=>new Date(e).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}),pad2=e=>String(e).padStart(2,"0"),toDatetimeLocal=e=>{const t=e?new Date(e):new Date;return Number.isNaN(t.getTime())?toDatetimeLocal():`${t.getFullYear()}-${pad2(t.getMonth()+1)}-${pad2(t.getDate())}T${pad2(t.getHours())}:${pad2(t.getMinutes())}`},fromDatetimeLocal=e=>{if(!e)return null;const t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString()},estimateReadTime=e=>Math.max(1,Math.ceil((e||"").trim().split(/\s+/).length/200)),escapeHtml=e=>String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),STATUS_CONHECIDOS=["draft","published","scheduled"],statusClass=e=>STATUS_CONHECIDOS.includes(String(e||""))?String(e):"draft",semEspacos=e=>Array.prototype.filter.call(String(e??""),t=>{const o=t.charCodeAt(0);return o>32&&o!==127}).join(""),DATA_URL_BITMAP=/^data:image\/(png|jpe?g|gif|webp|avif);base64,[A-Za-z0-9+/=]+$/;function isCaminhoDoSite(e){const t=String(e??"").trim();return!t||t.startsWith("//")||/^[a-z][a-z0-9+.-]*:/i.test(semEspacos(t))?!1:t.startsWith("/")||t.startsWith("img/")}function isEnderecoHttp(e){return/^https?:\/\/[^/\s]/i.test(semEspacos(e))}function isEnderecoImagemAceito(e){return isCaminhoDoSite(e)||isEnderecoHttp(e)}function safeImageSrc(e){const t=String(e??"").trim();return t&&(DATA_URL_BITMAP.test(semEspacos(t))||isEnderecoImagemAceito(t))?t:""}const AVISO_ENDERECO_IMAGEM="Endere\xE7o de imagem n\xE3o aceito. Use um caminho do site (img/blog/foto.png ou /img/blog/foto.png) ou um endere\xE7o http(s). Endere\xE7os javascript:, data: e vbscript: s\xE3o recusados.",MARKED_CDN="https://cdn.jsdelivr.net/npm/marked@12/marked.min.js",MARKED_OPTS={gfm:!0,breaks:!1,mangle:!1,headerIds:!1};let markedLoad=null,markedWarned=!1;function getMarkedParser(){const e=window.marked;return e?typeof e.parse=="function"?t=>e.parse(t,MARKED_OPTS):typeof e=="function"?t=>e(t,MARKED_OPTS):e.marked&&typeof e.marked.parse=="function"?t=>e.marked.parse(t,MARKED_OPTS):null:null}function ensureMarked(){const e=getMarkedParser();return e?Promise.resolve(e):markedLoad||(markedLoad=new Promise(t=>{let o=!1;const n=()=>{o||(o=!0,t(getMarkedParser()))},r=document.createElement("script");r.src=MARKED_CDN,r.async=!0,r.onload=n,r.onerror=n,document.head.appendChild(r),setTimeout(n,8e3)}),markedLoad)}const PREVIEW_DROP_TAGS="script,style,iframe,object,embed,link,meta,base,form,noscript,template,svg,math,audio,video,source,track,canvas,button,select,textarea,frame,frameset,applet",PREVIEW_TAGS=new Set(["p","br","hr","strong","b","em","i","del","s","strike","code","pre","blockquote","ul","ol","li","a","img","h1","h2","h3","h4","h5","h6","table","thead","tbody","tfoot","tr","th","td","caption","span","div","input","sup","sub","abbr","figure","figcaption","details","summary","dl","dt","dd","kbd","mark","small"]),PREVIEW_GLOBAL_ATTRS=["class","title"],PREVIEW_TAG_ATTRS={a:["href","target","rel"],img:["src","alt","width","height","loading"],input:["type","checked","disabled"],th:["align","colspan","rowspan","scope"],td:["align","colspan","rowspan"],ol:["start"],li:["value"],code:["class"],details:["open"]};function isSafeUrl(e,t){const o=String(e||"").trim();if(!o)return!1;const n=o.replace(/[\u0000-\u0020]+/g,"").toLowerCase();return t==="img"&&/^data:image\/(png|jpe?g|gif|webp|avif);base64,/.test(n)?!0:/^[a-z][a-z0-9+.-]*:/.test(n)?/^(https?|mailto|tel):/.test(n):!0}function unwrapElement(e){const t=e.parentNode;if(!t){e.remove();return}for(;e.firstChild;)t.insertBefore(e.firstChild,e);t.removeChild(e)}function sanitizeHtml(e){const t=String(e||"");if(!t)return"";if(typeof DOMParser>"u")return escapeHtml(t);try{return sanitizeWithDom(t)}catch(o){return console.warn("[admin] limpeza do preview falhou:",o),escapeHtml(t)}}function sanitizeWithDom(e){const t=new DOMParser().parseFromString(e,"text/html"),o=t&&t.body;return o?(o.querySelectorAll(PREVIEW_DROP_TAGS).forEach(n=>n.remove()),Array.from(o.querySelectorAll("*")).forEach(n=>{if(!n.parentNode)return;const r=n.tagName.toLowerCase();if(!PREVIEW_TAGS.has(r)){unwrapElement(n);return}const s=PREVIEW_GLOBAL_ATTRS.concat(PREVIEW_TAG_ATTRS[r]||[]);if(Array.from(n.attributes).forEach(m=>{const p=m.name.toLowerCase();(p.startsWith("on")||!s.includes(p))&&n.removeAttribute(m.name)}),r==="a"){const m=n.getAttribute("href");isSafeUrl(m,"a")||n.removeAttribute("href"),n.hasAttribute("href")&&(n.setAttribute("target","_blank"),n.setAttribute("rel","noopener noreferrer"))}else if(r==="img"){if(!isSafeUrl(n.getAttribute("src"),"img")){n.remove();return}n.setAttribute("loading","lazy")}else if(r==="input"){if((n.getAttribute("type")||"").toLowerCase()!=="checkbox"){n.remove();return}n.setAttribute("disabled","");const m=n.closest("li");if(m){m.classList.add("task-list-item");const p=m.parentElement;p&&/^(ul|ol)$/i.test(p.tagName)&&p.classList.add("contains-task-list")}}}),o.innerHTML):""}function markdownToHtml(e){const t=String(e||"");if(!t.trim())return'<p class="admin-preview-empty">Sem conte\xFAdo ainda.</p>';const o=getMarkedParser();let n;try{n=o?o(t):markdownToHtmlSimple(t)}catch(r){console.warn("[admin] marked falhou, usando renderizador simples:",r),n=markdownToHtmlSimple(t)}return sanitizeHtml(n)}function markdownToHtmlSimple(e){let t=escapeHtml(e);t=t.replace(/```(\w*)\n([\s\S]*?)```/g,(n,r,s)=>`<pre><code class="language-${r||"text"}">${s.trim()}</code></pre>`),t=t.replace(/^(?:---+|\*\*\*+)$/gm,"<hr/>"),t=t.replace(/`([^`\n]+)`/g,"<code>$1</code>"),t=t.replace(/^#### (.+)$/gm,"<h4>$1</h4>"),t=t.replace(/^### (.+)$/gm,"<h3>$1</h3>"),t=t.replace(/^## (.+)$/gm,"<h2>$1</h2>"),t=t.replace(/^# (.+)$/gm,"<h1>$1</h1>"),t=t.replace(/^&gt;\s?(.+)$/gm,"<blockquote>$1</blockquote>"),t=t.replace(/~~([^~]+)~~/g,"<del>$1</del>"),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*([^*\n]+)\*/g,"<em>$1</em>"),t=t.replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g,'<img src="$2" alt="$1"/>'),t=t.replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g,'<a href="$2">$1</a>');const o=n=>{const r=n.replace(/^\s*(?:[-*+] |\d+[.)] )/,""),s=r.match(/^\[([ xX])\]\s?(.*)$/);return s?`<li class="task-list-item"><input type="checkbox" disabled${s[1].toLowerCase()==="x"?" checked":""}/> ${s[2]}</li>`:`<li>${r}</li>`};return t=t.replace(/(?:^[-*+] .+(?:\n|$))+/gm,n=>"<ul>"+n.trim().split(`
`).map(o).join("")+"</ul>"),t=t.replace(/(?:^\d+[.)] .+(?:\n|$))+/gm,n=>"<ol>"+n.trim().split(`
`).map(o).join("")+"</ol>"),t.split(/\n{2,}/).map(n=>(n=n.trim(),n?/^<(h\d|ul|ol|pre|blockquote|img|hr|table|div)/i.test(n)?n:`<p>${n.replace(/\n/g,"<br/>")}</p>`:"")).join(`
`)}function parseYamlScalar(e){let t=String(e??"").trim();return/^["'[]/.test(t)||(t=t.replace(/\s+#.*$/,"").trim()),t===""?"":/^".*"$/.test(t)?t.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"):/^'.*'$/.test(t)?t.slice(1,-1).replace(/''/g,"'"):/^\[.*\]$/.test(t)?t.slice(1,-1).split(",").map(o=>parseYamlScalar(o)).filter(o=>o!==""):t==="true"?!0:t==="false"?!1:t==="null"||t==="~"?"":t}function parseYamlBlock(e){const t={},o=String(e||"").split(`
`);let n=0;for(;n<o.length;){const r=o[n];if(!r.trim()||/^\s*#/.test(r)){n++;continue}const s=r.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);if(!s){n++;continue}const m=s[1],p=s[2].trim();if(n++,p!==""){t[m]=parseYamlScalar(p);continue}const v=[];for(;n<o.length&&/^\s+-\s+/.test(o[n]);){const l=o[n].replace(/^\s+-\s+/,""),y=l.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);if(n++,!y){v.push(parseYamlScalar(l));continue}const b={};for(b[y[1]]=parseYamlScalar(y[2]);n<o.length&&/^\s{2,}[A-Za-z0-9_-]+:/.test(o[n])&&!/^\s*-\s/.test(o[n]);){const $=o[n].match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);if(!$)break;b[$[1]]=parseYamlScalar($[2]),n++}v.push(b)}t[m]=v.length?v:""}return t}function parseFrontMatter(e){const t=String(e||"").replace(/^\uFEFF/,"").replace(/\r\n?/g,`
`),o=t.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);return o?{data:parseYamlBlock(o[1]),body:t.slice(o[0].length).replace(/^\n+/,"")}:{data:null,body:t}}const state={view:"dashboard",editingId:null,posts:[],search:"",statusFilter:"all",form:null,saving:!1};function toast(e,t="success"){const o=t==="error";document.getElementById("adminToast")?.remove();const n=document.createElement("div");n.id="adminToast",n.className="admin-toast"+(o?" admin-toast--error":""),n.textContent=e,document.body.appendChild(n),clearTimeout(toast._t),toast._t=setTimeout(()=>{n.style.transition="opacity .3s ease, transform .3s ease",n.style.opacity="0",n.style.transform="translateY(10px)",setTimeout(()=>n.remove(),300)},o?4200:2400)}const emptyState=(e,t,o)=>`
  <div class="admin-empty">
    <div class="admin-empty-icon">${e}</div>
    <p class="admin-empty-title">${escapeHtml(t)}</p>
    ${o?`<p class="admin-empty-text">${escapeHtml(o)}</p>`:""}
  </div>
`,statCard=(e,t,o,n)=>`
  <div class="admin-stat">
    <span class="admin-stat-label">${escapeHtml(e)}</span>
    <span class="admin-stat-value">${t}</span>
    ${n?`<span class="admin-stat-hint">${escapeHtml(n)}</span>`:""}
    <span class="admin-stat-icon">${o}</span>
  </div>
`,ICONS={plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-linecap="round" stroke-linejoin="round"/></svg>',edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>',eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke-linecap="round"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',search:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>',paperplane:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21" fill="none"/><polyline points="7 3 7 8 15 8" fill="none"/></svg>',inbox:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 9.2l-5 4.6L17.4 21 12 17.7 6.6 21 8 13.8 3 9.2l6.6-.6z"/></svg>'},greeting=()=>{const e=new Date().getHours();return e<5?"Boa madrugada":e<12?"Bom dia":e<18?"Boa tarde":"Boa noite"},formatDayLong=()=>new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"}),fmtNum=e=>Number(e||0).toLocaleString("pt-BR"),statusLabel=e=>{const t=String(e||"draft");return t==="published"?"publicado":t==="scheduled"?"agendado":"rascunho"},newPostButton=`
  <button class="admin-btn admin-btn--primary" data-nav="editor" data-new>
    ${ICONS.plus}
    Novo Post
  </button>
`;function renderDashboard(){const e=state.posts,t=loadViews(),o=u=>Number(t[u.id]||u.views||0),n=e.filter(u=>u.status==="published"),r=e.filter(u=>u.status==="draft"),s=n.reduce((u,w)=>u+o(w),0),m=n.reduce((u,w)=>u+estimateReadTime(w.content),0),p=n.find(u=>u.featured),v=Date.now(),l=n.filter(u=>new Date(u.createdAt).getTime()>v).sort((u,w)=>new Date(u.createdAt)-new Date(w.createdAt)),y=n.slice().sort((u,w)=>o(w)-o(u)||new Date(w.createdAt)-new Date(u.createdAt)).slice(0,6),b=Math.max(1,...y.map(o)),$=e.slice().sort((u,w)=>new Date(w.createdAt)-new Date(u.createdAt)).slice(0,6),k={};n.forEach(u=>{const w=u.category||"Sem categoria";k[w]=(k[w]||0)+1});const g=Object.entries(k).sort((u,w)=>w[1]-u[1]),B=Math.max(1,...g.map(([,u])=>u)),M=y.length?`<div class="admin-rank">
         ${y.map((u,w)=>{const R=o(u),U=Math.round(R/b*100);return`
             <button type="button" class="admin-rank-row" data-edit="${escapeHtml(u.id)}">
               <span class="admin-rank-n">${String(w+1).padStart(2,"0")}</span>
               <div class="admin-rank-body">
                 <span class="admin-rank-title">${escapeHtml(u.title)}</span>
                 <span class="admin-rank-track" aria-hidden="true"><span style="width:${U}%"></span></span>
               </div>
               <span class="admin-rank-val">${fmtNum(R)}</span>
             </button>`}).join("")}
       </div>
       ${s===0?'<p class="admin-dash-note">As views agora gravam no banco. O n\xFAmero sobe quando algu\xE9m abre o post (uma vez por visita).</p>':""}`:emptyState(ICONS.eye,"Nenhum publicado","Publique um post pra aparecer o ranking."),S=$.length?`<div class="admin-feed">
         ${$.map(u=>`
           <button type="button" class="admin-feed-row" data-edit="${escapeHtml(u.id)}">
             <span class="admin-table-status admin-table-status--${statusClass(u.status)}">${escapeHtml(statusLabel(u.status))}</span>
             <span class="admin-feed-title">${escapeHtml(u.title)}</span>
             <span class="admin-feed-date">${formatDate(u.createdAt)}</span>
           </button>`).join("")}
       </div>`:emptyState(ICONS.edit,"Nenhum post ainda",'Clique em "Novo Post" pra come\xE7ar.'),q=p?`<button type="button" class="admin-feat" data-edit="${escapeHtml(p.id)}">
         ${safeImageSrc(p.cover)?`<img class="admin-feat-cover" src="${escapeHtml(safeImageSrc(p.cover))}" alt="">`:'<div class="admin-feat-cover admin-feat-cover--empty" aria-hidden="true"></div>'}
         <div class="admin-feat-text">
           <span class="admin-feat-kicker">${ICONS.star} Destaque do blog</span>
           <span class="admin-feat-title">${escapeHtml(p.title)}</span>
           <span class="admin-feat-meta">${formatDate(p.createdAt)} \xB7 ${fmtNum(o(p))} views \xB7 ${estimateReadTime(p.content)} min</span>
         </div>
       </button>`:'<p class="admin-dash-note">Nenhum post marcado como destaque.</p>',z=g.length?`<div class="admin-cats">
         ${g.map(([u,w])=>`
           <div class="admin-cat">
             <span class="admin-cat-name">${escapeHtml(u)}</span>
             <span class="admin-cat-track" aria-hidden="true"><span style="width:${Math.round(w/B*100)}%"></span></span>
             <span class="admin-cat-n">${w}</span>
           </div>`).join("")}
       </div>`:emptyState(ICONS.inbox,"Sem categorias","Categorias aparecem quando houver post publicado."),P=l.length?`<div class="admin-feed">
         ${l.map(u=>`
           <button type="button" class="admin-feed-row" data-edit="${escapeHtml(u.id)}">
             <span class="admin-feed-title">${escapeHtml(u.title)}</span>
             <span class="admin-feed-date">${formatDateTime(u.createdAt)}</span>
           </button>`).join("")}
       </div>`:"";return`
    <header class="admin-header">
      <div>
        <h1 class="admin-title">${greeting()}, <em>Bernardo</em>.</h1>
        <p class="admin-title-sub">${formatDayLong()} \xB7 ${n.length} no ar \xB7 ${fmtNum(s)} views</p>
      </div>
      <div class="admin-header-actions">${newPostButton}</div>
    </header>

    <div class="admin-stats">
      ${statCard("Publicados",n.length,ICONS.check,r.length?r.length+" rascunho"+(r.length===1?"":"s"):"nenhum rascunho")}
      ${statCard("Visualiza\xE7\xF5es",fmtNum(s),ICONS.eye,s?"soma dos posts no ar":"ainda zerado no banco")}
      ${statCard("Minutos no ar",m,ICONS.clock,"leitura dos publicados")}
      ${statCard("Categorias",g.length,ICONS.inbox,g.length?g[0][0]+" na frente":"\u2014")}
    </div>

    <div class="admin-grid admin-grid--2">
      <section class="admin-card">
        <header class="admin-card-head">
          <div class="admin-card-head-text">
            <h3 class="admin-card-title">Mais lidos</h3>
            <p class="admin-card-sub">views reais no banco</p>
          </div>
        </header>
        ${M}
      </section>

      <section class="admin-card">
        <header class="admin-card-head">
          <div class="admin-card-head-text">
            <h3 class="admin-card-title">Por data de publica\xE7\xE3o</h3>
            <p class="admin-card-sub">os mais recentes primeiro</p>
          </div>
        </header>
        ${S}
      </section>
    </div>

    <div class="admin-grid admin-grid--2">
      <section class="admin-card">
        <header class="admin-card-head">
          <div class="admin-card-head-text">
            <h3 class="admin-card-title">Destaque</h3>
            <p class="admin-card-sub">o que o blog empurra no topo</p>
          </div>
        </header>
        ${q}
      </section>

      <section class="admin-card">
        <header class="admin-card-head">
          <div class="admin-card-head-text">
            <h3 class="admin-card-title">Categorias</h3>
            <p class="admin-card-sub">posts publicados por assunto</p>
          </div>
        </header>
        ${z}
      </section>
    </div>

    ${l.length?`
      <section class="admin-card">
        <header class="admin-card-head">
          <div class="admin-card-head-text">
            <h3 class="admin-card-title">Data futura</h3>
            <p class="admin-card-sub">j\xE1 publicados, com data \xE0 frente de hoje</p>
          </div>
        </header>
        ${P}
      </section>`:""}
  `}function postsTableRow(e,t,o){const n=Number(t[e.id]||e.views||0),r=Math.round(n/Math.max(1,o)*100),s=safeImageSrc(e.cover),m=(e.title||"?").trim().charAt(0).toUpperCase();return`
    <tr>
      <td>
        <div class="admin-table-post">
          ${s?`<img class="admin-table-thumb" src="${escapeHtml(s)}" alt="" width="44" height="44">`:`<span class="admin-table-thumb admin-table-thumb--letter" aria-hidden="true">${escapeHtml(m)}</span>`}
          <div>
            <div class="admin-table-title" data-edit="${escapeHtml(e.id)}">
              ${e.featured?'<span class="admin-table-star" title="Destaque">\u2605</span> ':""}
              ${escapeHtml(e.title)}
            </div>
            <div class="admin-table-slug">/${escapeHtml(e.slug||e.id)}</div>
          </div>
        </div>
      </td>
      <td>${e.category?`<span class="blog-post-tag">${escapeHtml(e.category)}</span>`:'<span class="admin-table-dash">\u2014</span>'}</td>
      <td><span class="admin-table-status admin-table-status--${statusClass(e.status)}">${escapeHtml(statusLabel(e.status))}</span></td>
      <td class="is-meta is-nowrap">${formatDate(e.createdAt)}</td>
      <td class="is-views">
        <div class="admin-table-views">
          <span class="admin-table-views-n">${fmtNum(n)}</span>
          <span class="admin-rank-track admin-rank-track--sm" aria-hidden="true"><span style="width:${r}%"></span></span>
        </div>
      </td>
      <td class="is-right is-nowrap">
        <div class="admin-table-actions">
          <button class="admin-icon-btn" data-view-post="${escapeHtml(e.slug||e.id)}" title="Ver">${ICONS.eye}</button>
          <button class="admin-icon-btn" data-edit="${escapeHtml(e.id)}" title="Editar">${ICONS.edit}</button>
          <button class="admin-icon-btn" data-duplicate="${escapeHtml(e.id)}" title="Duplicar">${ICONS.copy}</button>
          <button class="admin-icon-btn admin-icon-btn--danger" data-delete="${escapeHtml(e.id)}" title="Excluir">${ICONS.trash}</button>
        </div>
      </td>
    </tr>
  `}function renderPostsList(){const e=state.search.toLowerCase(),t=state.statusFilter||"all",o=state.posts.filter(l=>l.status==="published").length,n=state.posts.filter(l=>l.status==="draft").length,r=state.posts.filter(l=>t==="published"&&l.status!=="published"||t==="draft"&&l.status!=="draft"?!1:e?l.title.toLowerCase().includes(e)||(l.category||"").toLowerCase().includes(e)||(l.tags||[]).some(y=>y.toLowerCase().includes(e)):!0),s=loadViews(),m=Math.max(1,...r.map(l=>Number(s[l.id]||l.views||0))),p=(l,y,b)=>`<button type="button" class="admin-chip${t===l?" is-on":""}" data-status-filter="${l}">${escapeHtml(y)} <em>${b}</em></button>`,v=r.length?`<div class="admin-table-scroll">
         <table class="admin-table">
           <thead>
             <tr>
               <th>Post</th>
               <th>Categoria</th>
               <th>Status</th>
               <th>Publica\xE7\xE3o</th>
               <th>Views</th>
               <th class="is-right">A\xE7\xF5es</th>
             </tr>
           </thead>
           <tbody>${r.map(l=>postsTableRow(l,s,m)).join("")}</tbody>
         </table>
       </div>`:emptyState(ICONS.inbox,e||t!=="all"?"Nenhum post neste filtro":"Nenhum post ainda",e?"Tente outro termo de busca.":'Clique em "Novo Post" para come\xE7ar.');return`
    <header class="admin-header">
      <div>
        <h1 class="admin-title">Todos os <em>posts</em></h1>
        <p class="admin-title-sub">${o} no ar \xB7 ${n} rascunho${n===1?"":"s"}</p>
      </div>
      <div class="admin-header-actions">${newPostButton}</div>
    </header>

    <section class="admin-card">
      <header class="admin-card-head">
        <div class="admin-filters">
          ${p("all","Todos",state.posts.length)}
          ${p("published","Publicados",o)}
          ${p("draft","Rascunhos",n)}
        </div>
        <div class="admin-search">
          ${ICONS.search}
          <input type="search" id="adminSearch" placeholder="Buscar t\xEDtulo, tag ou categoria..." value="${escapeHtml(state.search)}" autocomplete="off"/>
        </div>
      </header>
      ${v}
    </section>
  `}function renderEditor(e){const t=!!e&&!!e.id;state.form=e?JSON.parse(JSON.stringify(e)):{title:"",subtitle:"",slug:"",cover:"",tags:[],images:[],category:"Engenharia",author:"Bernardo Iannini",status:"draft",featured:!1,content:""},Array.isArray(state.form.images)||(state.form.images=[]);const o=!!state.form.cover&&!safeImageSrc(state.form.cover);o&&(state.form.cover="");const n=state.form.images.length;state.form.images=state.form.images.filter(v=>v&&safeImageSrc(v.src)),(o||state.form.images.length<n)&&toast("Este post tinha endere\xE7o de imagem fora do aceito e ele foi retirado do formul\xE1rio. "+AVISO_ENDERECO_IMAGEM,"error");const r=["Engenharia","IA","Projetos","Carreira","Design","Vida","Outro"],s=state.form,p=s.content||(t?"":`# Comece a escrever aqui

Use **negrito**, *it\xE1lico*, ~~riscado~~ ou \`c\xF3digo inline\`.

## Subt\xEDtulos com ##

- Listas com h\xEDfen
- Outra linha

- [ ] tarefa pendente
- [x] tarefa conclu\xEDda

> Cita\xE7\xE3o com >

[Link](https://exemplo.com)

| Coluna | Valor |
| --- | --- |
| markdown | puro |

\`\`\`js
// blocos de c\xF3digo
const ola = "mundo";
\`\`\`
`);return`
    <header class="admin-header">
      <div>
        <h1 class="admin-title">${t?"Editando":"Novo"} <em>post</em></h1>
        <p class="admin-title-sub">${t?"Atualize as informa\xE7\xF5es abaixo":"Preencha os campos e publique ou salve como rascunho"}</p>
      </div>
      <div class="admin-header-actions">
        <button class="admin-btn admin-btn--ghost" data-nav="posts" type="button">Cancelar</button>
        ${t?`
          <button class="admin-btn admin-btn--danger" id="deleteBtn" type="button" data-delete="${escapeHtml(e.id)}">
            ${ICONS.trash} Excluir
          </button>
        `:""}
      </div>
    </header>

    <form id="postForm" class="admin-editor">
      <!-- COLUNA PRINCIPAL ============================================ -->
      <div class="admin-editor-main">
        <section class="admin-card">
          <header class="admin-card-head">
            <div class="admin-card-head-text">
              <h3 class="admin-card-title">Informa\xE7\xF5es principais</h3>
              <p class="admin-card-sub">t\xEDtulo, subt\xEDtulo e categoria</p>
            </div>
          </header>
          <div class="admin-card-body">
            <div class="admin-field admin-field-title">
              <label for="f-title">T\xEDtulo <span class="admin-field-hint">obrigat\xF3rio</span></label>
              <input type="text" id="f-title" name="title" required value="${escapeHtml(s.title)}" placeholder="Um t\xEDtulo marcante..."/>
            </div>
            <div class="admin-field">
              <label for="f-subtitle">Subt\xEDtulo / Excerpt <span class="admin-field-hint">aparece nos cards e na busca</span></label>
              <input type="text" id="f-subtitle" name="subtitle" value="${escapeHtml(s.subtitle)}" placeholder="Uma frase resumindo o post..."/>
            </div>
          </div>
        </section>

        <section class="admin-card">
          <header class="admin-card-head">
            <div class="admin-card-head-text">
              <h3 class="admin-card-title">Conte\xFAdo</h3>
              <p class="admin-card-sub">Markdown puro (.md) com GFM \xB7 Ctrl+S salva</p>
            </div>
            <div class="admin-card-actions">
              <div class="admin-editor-tabs">
                <button type="button" class="admin-editor-tab active" data-tab="write">Escrever</button>
                <button type="button" class="admin-editor-tab" data-tab="preview">Preview</button>
                <button type="button" class="admin-editor-tab" data-tab="help">Guia .md</button>
              </div>
            </div>
          </header>

          <!-- Barra .md: importar arquivo / baixar arquivo ====== -->
          <div class="editor-md-io" id="mdIoBar">
            <div class="editor-md-io-text">
              <strong>Este editor fala .md</strong>
              <span>Importe um arquivo com front-matter YAML (ou arraste ele aqui). Baixar \xE9 o caminho manual, opcional: publicar aqui j\xE1 sobe pro site sozinho.</span>
            </div>
            <div class="editor-md-io-actions">
              <input type="file" id="mdFileInput" accept=".md,.markdown,text/markdown" hidden/>
              <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" id="importMdBtn" title="Carregar um arquivo .md neste editor">
                ${ICONS.inbox} Importar .md
              </button>
              <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" id="exportMdBarBtn" title="Baixar este post como arquivo .md">
                ${ICONS.save} Baixar .md
              </button>
            </div>
            <p class="editor-md-io-msg" id="mdIoMsg" hidden></p>
          </div>

          <!-- Toolbar de formata\xE7\xE3o ============================ -->
          <div class="editor-toolbar" id="editorToolbar">
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn" data-md="heading2" title="Subt\xEDtulo (H2)">
                <strong>H2</strong>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="heading3" title="Se\xE7\xE3o (H3)">
                <strong>H3</strong>
              </button>
            </div>
            <span class="editor-toolbar-sep"></span>
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn" data-md="bold" title="Negrito (Ctrl+B)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="italic" title="It\xE1lico (Ctrl+I)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="strike" title="Riscado (~~texto~~)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M16.5 6.5C16.5 5 14.4 4 12 4S7.5 5 7.5 6.8c0 1.9 2 2.5 4.5 3.2M7.5 17.4C7.5 19 9.6 20 12 20s4.5-1 4.5-2.6c0-1.5-1.3-2.3-3.5-2.9"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="code" title="C\xF3digo inline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </button>
            </div>
            <span class="editor-toolbar-sep"></span>
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn" data-md="ul" title="Lista">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.5" fill="currentColor"/><circle cx="3.5" cy="12" r="1.5" fill="currentColor"/><circle cx="3.5" cy="18" r="1.5" fill="currentColor"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="ol" title="Lista numerada">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="task" title="Lista de tarefas (- [ ])">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="2 7 4 9 8 4.5"/><polyline points="2 16 4 18 8 13.5"/><line x1="12" y1="7" x2="21" y2="7"/><line x1="12" y1="17" x2="21" y2="17"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="quote" title="Cita\xE7\xE3o">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .5-1 1v2c0 .5.5 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h.5c.5 0 .5 0 .5 1v1c0 1-1 2-2 2s-1 .5-1 1v2c0 .5.5 1 1 1z"/></svg>
              </button>
            </div>
            <span class="editor-toolbar-sep"></span>
            <div class="editor-toolbar-group">
              <button type="button" class="editor-toolbar-btn" data-md="link" title="Link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="image" title="Imagem">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="codeblock" title="Bloco de c\xF3digo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="14" y1="4" x2="10" y2="20"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="table" title="Tabela (GFM)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="10" y1="4" x2="10" y2="20"/></svg>
              </button>
              <button type="button" class="editor-toolbar-btn" data-md="hr" title="Divisor">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
              </button>
            </div>
          </div>

          <div class="admin-card-body">
            <textarea id="f-content" name="content" class="admin-content-editor" placeholder="# Comece com um t\xEDtulo...">${escapeHtml(p)}</textarea>
            <div class="admin-preview" id="previewBox"></div>
            <div class="admin-preview" id="helpBox">
              <h3>Como este editor trabalha</h3>
              <p>O post \xE9 um arquivo <code>.md</code>: front-matter YAML no topo, markdown no corpo.
                 Igual aos arquivos de <code>data/posts/&lt;slug&gt;.md</code>.</p>
              <p><strong>Publicar</strong> salva no banco e j\xE1 dispara o rebuild do site: em cerca de
                 1 minuto o post est\xE1 no ar, sem voc\xEA abrir terminal nenhum. Excluir faz o mesmo
                 caminho e tira a p\xE1gina do ar. Rascunho fica s\xF3 no banco.</p>
              <p><strong>Importar .md</strong> l\xEA o front-matter, preenche os campos da direita e joga o
                 resto do arquivo aqui no corpo. <strong>Baixar .md</strong> faz o caminho de volta: \xE9 o
                 jeito manual, pra quando voc\xEA quiser versionar o post em <code>data/posts/</code> e
                 rodar <code>npm run build:posts</code> na m\xE3o. Continua funcionando, mas j\xE1 n\xE3o \xE9
                 obrigat\xF3rio pra publicar.</p>
              <p>Tamb\xE9m d\xE1 pra arrastar um arquivo <code>.md</code> direto pra cima do editor.</p>

              <h3>Front-matter reconhecido</h3>
              <pre><code>---
title: "T\xEDtulo do post"
subtitle: "Uma frase de resumo"
slug: titulo-do-post
date: "2026-01-31T12:00:00.000Z"
updated: "2026-01-31T12:00:00.000Z"
category: "Engenharia"
tags:
  - markdown
  - blog
cover: "img/blog/capa.png"
coverAlt: "Descri\xE7\xE3o da capa"
images:
  - src: "img/blog/foto-1.png"
    alt: "Descri\xE7\xE3o da foto"
    caption: "Legenda opcional"
linkedinUrl: ""
featured: false
status: draft
author: "Bernardo Iannini"
---</code></pre>

              <h3>Markdown do corpo</h3>
              <p><code># T\xEDtulo</code> \xB7 <code>## Subt\xEDtulo</code> \xB7 <code>### Se\xE7\xE3o</code></p>
              <p><code>**negrito**</code> \xB7 <code>*it\xE1lico*</code> \xB7 <code>~~riscado~~</code> \xB7 <code>\`c\xF3digo\`</code></p>
              <p><code>&gt; cita\xE7\xE3o</code> em linha separada</p>
              <p><code>- item</code> \xB7 <code>1. item</code> \xB7 <code>- [ ] tarefa</code> \xB7 <code>- [x] tarefa feita</code></p>
              <p><code>[texto](url)</code> pra link \xB7 <code>![alt](url)</code> pra imagem \xB7 <code>---</code> pra divisor</p>
              <p>Par\xE1grafo novo pede uma linha em branco. Uma quebra s\xF3 continua o mesmo par\xE1grafo,
                 exatamente como o build renderiza.</p>
              <p>Bloco de c\xF3digo com tr\xEAs crases:</p>
              <pre><code>\`\`\`js
console.log("c\xF3digo");
\`\`\`</code></pre>
              <p>Tabela no estilo GFM:</p>
              <pre><code>| Coluna | Valor |
| --- | --- |
| linha 1 | 10 |
| linha 2 | 20 |</code></pre>
              <p>O preview usa a mesma lib do build (marked, com GFM), ent\xE3o o que aparece aqui
                 \xE9 o que sai no post publicado.</p>
            </div>
            <div class="admin-content-stats">
              <span id="wordCount">0 palavras</span>
              <span id="readTime">0 min de leitura</span>
            </div>
          </div>
        </section>
      </div>

      <!-- COLUNA LATERAL (METADADOS) ================================= -->
      <aside class="admin-editor-side">
        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Publica\xE7\xE3o</h4>
            <span class="admin-field-section-hint">quando e como</span>
          </div>

          <div class="admin-field">
            <label for="f-status">Status</label>
            <select id="f-status" name="status">
              <option value="draft"     ${s.status==="draft"?"selected":""}>\u{1F4DD} Rascunho</option>
              <option value="published" ${s.status==="published"?"selected":""}>\u2705 Publicado</option>
              <option value="scheduled" ${s.status==="scheduled"?"selected":""}>\u23F0 Agendado</option>
            </select>
          </div>

          <div class="admin-field">
            <label for="f-publishedAt">
              Data de publica\xE7\xE3o
              <span class="admin-field-hint">aparece no post \xB7 passado ou futuro</span>
            </label>
            <input type="datetime-local" id="f-publishedAt" name="publishedAt" value="${escapeHtml(toDatetimeLocal(s.createdAt))}"/>
          </div>

          <div class="admin-field admin-field-row">
            <input type="checkbox" id="f-featured" name="featured" ${s.featured?"checked":""}/>
            <label for="f-featured">\u2B50 Marcar como destaque</label>
          </div>
        </div>

        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Identifica\xE7\xE3o</h4>
            <span class="admin-field-section-hint">URL e categoria</span>
          </div>

          <div class="admin-field">
            <label for="f-slug">Slug (URL)</label>
            <input type="text" id="f-slug" name="slug" value="${escapeHtml(s.slug)}" placeholder="auto-gerado"/>
          </div>

          <div class="admin-field">
            <label for="f-category">Categoria</label>
            <select id="f-category" name="category">
              ${r.map(v=>`<option value="${escapeHtml(v)}" ${s.category===v?"selected":""}>${escapeHtml(v)}</option>`).join("")}
            </select>
          </div>

          <div class="admin-field">
            <label for="f-author">Autor</label>
            <input type="text" id="f-author" name="author" value="${escapeHtml(s.author)}"/>
          </div>
        </div>

        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Tags</h4>
            <span class="admin-field-section-hint">enter pra adicionar</span>
          </div>

          <div class="admin-field">
            <div class="admin-tags" id="tagsContainer">
              ${(s.tags||[]).map(v=>`
                <span class="admin-tag-pill">${escapeHtml(v)}
                  <button type="button" class="admin-tag-remove" data-tag="${escapeHtml(v)}">\u2715</button>
                </span>
              `).join("")}
              <input type="text" id="f-tags-input" placeholder="adicionar tag..."/>
            </div>
          </div>
        </div>

        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">M\xEDdia</h4>
            <span class="admin-field-section-hint">imagem de capa</span>
          </div>

          <!-- Drop zone + bot\xE3o de upload -->
          <div class="admin-field">
            <div class="admin-dropzone" id="coverDropzone" tabindex="0">
              <input type="file" id="coverFile" accept="image/*" hidden/>
              <div class="admin-dropzone-content" id="coverDropzoneContent">
                ${safeImageSrc(s.cover)?`
                  <img src="${escapeHtml(safeImageSrc(s.cover))}" alt="capa" class="admin-dropzone-preview"/>
                  <div class="admin-dropzone-actions">
                    <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="change-cover">Trocar</button>
                    <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-action="remove-cover">Remover</button>
                  </div>
                `:`
                  <svg class="admin-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p class="admin-dropzone-title">Arraste uma imagem aqui</p>
                  <p class="admin-dropzone-hint">ou <button type="button" class="admin-dropzone-link" data-action="pick-cover">escolha um arquivo</button></p>
                  <p class="admin-dropzone-meta">PNG, JPG, WebP \xB7 m\xE1x 2MB recomendado</p>
                `}
              </div>
            </div>
          </div>

          <!-- URL manual / caminho relativo -->
          <div class="admin-field">
            <label for="f-cover">
              URL ou caminho
              <span class="admin-field-hint">opcional \xB7 use img/blog/foto.png</span>
            </label>
            <input type="text" id="f-cover" name="cover" value="${escapeHtml(isEnderecoImagemAceito(s.cover)?s.cover:"")}" placeholder="https://... ou img/blog/foto.png"/>
          </div>
        </div>

        <div class="admin-field-section">
          <div class="admin-field-section-head">
            <h4 class="admin-field-section-title">Imagens do post</h4>
            <span class="admin-field-section-hint">estilo LinkedIn \xB7 v\xE1rias</span>
          </div>
          <div class="admin-field">
            <input type="file" id="imagesFile" accept="image/*" multiple hidden/>
            <div class="admin-images-grid" id="imagesGrid"><!-- preenchido por JS --></div>
            <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" id="addImagesBtn" style="margin-top:10px">
              ${ICONS.plus} Adicionar imagens
            </button>
            <p class="admin-field-hint" style="margin-top:8px">
              Capa n\xE3o \xE9 obrigat\xF3ria \u2014 anexe quantas imagens quiser e elas aparecem
              numa grade adaptativa no post (igual LinkedIn). Use \u2191 \u2193 para ordenar.
            </p>
          </div>
        </div>

        ${t?`
          <div class="admin-field-section">
            <div class="admin-field-section-head">
              <h4 class="admin-field-section-title">Metadados</h4>
            </div>
            <div class="admin-meta">
              <span><strong>Publica\xE7\xE3o:</strong> ${formatDateTime(s.createdAt)}</span>
              <span><strong>Atualizado:</strong> ${formatDateTime(s.updatedAt||s.createdAt)}</span>
              <span><strong>ID:</strong> <code>${escapeHtml(s.id)}</code></span>
            </div>
          </div>
        `:""}
      </aside>

      <!-- STICKY ACTIONS BAR ========================================= -->
      <div class="admin-sticky-actions">
        <div class="admin-sticky-actions-info">
          <span class="admin-sticky-actions-dot"></span>
          <span>${t?"Editando rascunho \xB7 altera\xE7\xF5es n\xE3o s\xE3o salvas automaticamente":"Novo post \xB7 revise antes de publicar"}</span>
        </div>
        <button class="admin-btn admin-btn--ghost" type="button" data-nav="posts">Cancelar</button>
        <button class="admin-btn" type="button" id="exportMdBtn" title="Baixa este post como arquivo .md pra data/posts/">
          ${ICONS.save} Baixar .md
        </button>
        <button class="admin-btn" type="button" id="saveDraftBtn">
          ${ICONS.save} Salvar rascunho
        </button>
        <button class="admin-btn admin-btn--primary" type="button" id="publishBtn">
          ${ICONS.paperplane} ${t&&s.status==="published"?"Atualizar publica\xE7\xE3o":"Publicar"}
        </button>
      </div>
    </form>
  `}const TOPBAR_LABELS={dashboard:{title:"Dashboard",crumb:"vis\xE3o geral"},posts:{title:"Posts",crumb:"gerenciar publica\xE7\xF5es"},editor:{title:"Editor",crumb:"criar / editar post"}};function updateTopbar(){const e=TOPBAR_LABELS[state.view]||TOPBAR_LABELS.dashboard,t=document.getElementById("adminTopbarTitle"),o=document.getElementById("adminTopbarCrumb");if(t&&(t.textContent=e.title),o)if(state.view==="editor"){const n=state.editingId?state.posts.find(r=>r.id===state.editingId):null;o.textContent=n?`editando \xB7 ${n.title}`:"novo post"}else o.textContent=e.crumb}function render(){const e=document.getElementById("adminContent"),t=render._view!==state.view;render._view=state.view;let o="";if(state.view==="dashboard")o=renderDashboard();else if(state.view==="posts")o=renderPostsList();else if(state.view==="editor"){const n=state.editingId?state.posts.find(r=>r.id===state.editingId):null;o=renderEditor(n)}e.innerHTML=o,state.view==="editor"&&setupEditorEvents(),document.querySelectorAll(".admin-nav-item[data-view]").forEach(n=>{n.classList.toggle("active",n.dataset.view===state.view)}),updateTopbar(),t&&window.scrollTo({top:0,behavior:"instant"})}function setupEditorEvents(){const e=document.getElementById("postForm"),t=document.getElementById("f-title"),o=document.getElementById("f-slug"),n=document.getElementById("f-content"),r=document.getElementById("previewBox"),s=document.getElementById("helpBox"),m=document.getElementById("f-cover"),p=document.getElementById("f-status"),v=document.getElementById("f-publishedAt"),l=document.getElementById("f-tags-input"),y=document.getElementById("tagsContainer"),b=document.getElementById("wordCount"),$=document.getElementById("readTime");state.form.content&&(n.value=state.form.content);const k=()=>{const a=(n.value||"").trim().split(/\s+/).filter(Boolean).length;b.textContent=`${a} ${a===1?"palavra":"palavras"}`,$.textContent=`${estimateReadTime(n.value)} min de leitura`};k();let g=!!state.form.slug;o.addEventListener("input",()=>{g=!0}),o.addEventListener("blur",()=>{o.value.trim()&&(o.value=slugify(o.value))}),t.addEventListener("input",()=>{g||(o.value=slugify(t.value))});const B=document.getElementById("coverDropzone"),M=document.getElementById("coverFile"),S=a=>{const i=document.getElementById("coverDropzoneContent");if(!i)return;const d=safeImageSrc(a);d?i.innerHTML=`
        <img src="${escapeHtml(d)}" alt="capa" class="admin-dropzone-preview"/>
        <div class="admin-dropzone-actions">
          <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" data-action="change-cover">Trocar</button>
          <button type="button" class="admin-btn admin-btn--danger admin-btn--sm" data-action="remove-cover">Remover</button>
        </div>`:i.innerHTML=`
        <svg class="admin-dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <p class="admin-dropzone-title">Arraste uma imagem aqui</p>
        <p class="admin-dropzone-hint">ou <button type="button" class="admin-dropzone-link" data-action="pick-cover">escolha um arquivo</button></p>
        <p class="admin-dropzone-meta">PNG, JPG, WebP \xB7 m\xE1x 2MB recomendado</p>`},q=a=>new Promise((i,d)=>{if(!a.type.startsWith("image/"))return d(new Error("Arquivo n\xE3o \xE9 imagem"));if(a.size>8*1024*1024)return d(new Error("Arquivo muito grande (>8MB)"));const c=new FileReader;c.onload=f=>{const h=new Image;h.onload=()=>{let{width:I,height:E}=h;if(I>1600||E>1600){const Y=Math.min(1600/I,1600/E);I=Math.round(I*Y),E=Math.round(E*Y)}const A=document.createElement("canvas");A.width=I,A.height=E;const L=A.getContext("2d");L.imageSmoothingEnabled=!0,L.imageSmoothingQuality="high",L.drawImage(h,0,0,I,E);const F=!/\.(png|webp)$/i.test(a.name)||a.size>5e5,it=F?"image/jpeg":"image/png",st=F?.82:1;i(A.toDataURL(it,st))},h.onerror=()=>d(new Error("Falha ao carregar imagem")),h.src=f.target.result},c.onerror=()=>d(new Error("Falha ao ler arquivo")),c.readAsDataURL(a)}),z=async a=>{if(a)try{toast("Enviando capa...");const i=await q(a),d=dataUrlToFile(i,a.name||"capa"),c=await window.BlogDB.uploadImage(d,"covers");state.form.cover=c,S(c),m.value="",toast("Capa enviada.")}catch(i){toast(uploadErrorMsg(i),"error")}};B.addEventListener("click",a=>{const i=a.target.closest("[data-action]")?.dataset.action;i==="change-cover"||i==="pick-cover"?M.click():i==="remove-cover"?(state.form.cover="",S(null),m.value="",toast("Imagem removida.")):a.target.closest("img, button")||M.click()}),M.addEventListener("change",a=>{const i=a.target.files?.[0];i&&z(i),a.target.value=""}),["dragenter","dragover"].forEach(a=>{B.addEventListener(a,i=>{i.preventDefault(),B.classList.add("is-dragging")})}),["dragleave","drop"].forEach(a=>{B.addEventListener(a,i=>{i.preventDefault(),B.classList.remove("is-dragging")})}),B.addEventListener("drop",a=>{const i=a.dataTransfer?.files?.[0];i&&z(i)});const P=a=>{m.classList.toggle("is-invalid",a),m.style.borderColor=a?"#e05260":"",a?m.setAttribute("aria-invalid","true"):m.removeAttribute("aria-invalid")};m.addEventListener("input",()=>{const a=m.value.trim();if(!a){P(!1),DATA_URL_BITMAP.test(state.form.cover||"")||(state.form.cover="",S(null));return}const i=isEnderecoImagemAceito(a);P(!i),i&&(state.form.cover=a,S(a))}),m.addEventListener("blur",()=>{const a=m.value.trim();a&&!isEnderecoImagemAceito(a)&&toast(AVISO_ENDERECO_IMAGEM,"error")});const u=document.getElementById("imagesFile"),w=document.getElementById("imagesGrid"),R=document.getElementById("addImagesBtn"),U=()=>slugify(o.value||t.value||"post")||"post",C=()=>{const a=state.form.images||[];if(!a.length){w.innerHTML='<p class="admin-field-hint">Nenhuma imagem ainda.</p>';return}w.innerHTML=a.map((i,d)=>`
      <div class="admin-image-item" data-idx="${d}">
        <img src="${escapeHtml(safeImageSrc(i&&i.src))}" alt="" loading="lazy"/>
        <div class="admin-image-item-body">
          <input type="text" class="admin-image-caption" data-idx="${d}"
                 value="${escapeHtml(i.caption||"")}" placeholder="Legenda (opcional)"/>
          <div class="admin-image-item-actions">
            <button type="button" class="admin-icon-btn" data-img-up="${d}" title="Subir"${d===0?" disabled":""}>\u2191</button>
            <button type="button" class="admin-icon-btn" data-img-down="${d}" title="Descer"${d===a.length-1?" disabled":""}>\u2193</button>
            <button type="button" class="admin-icon-btn admin-icon-btn--danger" data-img-remove="${d}" title="Remover">${ICONS.trash}</button>
          </div>
        </div>
      </div>
    `).join("")};C();const Z=async a=>{const i=await q(a),d=dataUrlToFile(i,a.name||"imagem");return window.BlogDB.uploadImage(d,"gallery")},X=async a=>{const i=Array.from(a||[]).filter(c=>c.type.startsWith("image/"));if(!i.length)return;toast(`Enviando ${i.length} imagem(ns)...`);let d=0;for(const c of i)try{const f=await Z(c);state.form.images.push({src:f,alt:t.value||"",caption:""}),d++,C()}catch(f){toast("Falha em "+(c.name||"imagem")+": "+f.message,"error")}d&&toast(`${d} imagem(ns) adicionada(s).`)};R?.addEventListener("click",()=>u.click()),u?.addEventListener("change",a=>{X(a.target.files),a.target.value=""}),w?.addEventListener("click",a=>{const i=a.target.closest("[data-img-up]"),d=a.target.closest("[data-img-down]"),c=a.target.closest("[data-img-remove]"),f=state.form.images;if(i){const h=+i.dataset.imgUp;h>0&&([f[h-1],f[h]]=[f[h],f[h-1]],C())}else if(d){const h=+d.dataset.imgDown;h<f.length-1&&([f[h+1],f[h]]=[f[h],f[h+1]],C())}else c&&(f.splice(+c.dataset.imgRemove,1),C())}),w?.addEventListener("input",a=>{const i=a.target.closest(".admin-image-caption");if(i){const d=+i.dataset.idx;state.form.images[d]&&(state.form.images[d].caption=i.value)}}),p.addEventListener("change",()=>{p.value==="scheduled"&&toast("Agendamento ainda n\xE3o est\xE1 ativo: o post ser\xE1 salvo como rascunho. A data de publica\xE7\xE3o acima continua valendo quando voc\xEA publicar.","error")});const _=()=>{const a=n.value;r.innerHTML=markdownToHtml(a),!getMarkedParser()&&ensureMarked().then(i=>{if(!i){markedWarned||(markedWarned=!0,toast("Preview em modo simples: n\xE3o consegui carregar o marked da CDN.","error"));return}r.classList.contains("active")&&(r.innerHTML=markdownToHtml(a))})};document.querySelectorAll(".admin-editor-tab").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(".admin-editor-tab").forEach(d=>d.classList.remove("active")),a.classList.add("active");const i=a.dataset.tab;n.classList.toggle("hidden",i!=="write"),r.classList.toggle("active",i==="preview"),s.classList.toggle("active",i==="help"),i==="preview"&&_()})}),ensureMarked(),n.addEventListener("input",k);const Q={heading2:{wrap:["## ",""],placeholder:"Subt\xEDtulo"},heading3:{wrap:["### ",""],placeholder:"Se\xE7\xE3o"},bold:{wrap:["**","**"],placeholder:"texto em negrito"},italic:{wrap:["*","*"],placeholder:"texto em it\xE1lico"},strike:{wrap:["~~","~~"],placeholder:"texto riscado"},code:{wrap:["`","`"],placeholder:"c\xF3digo"},link:{wrap:["[","](https://)"],placeholder:"texto do link"},image:{wrap:["![","](https://)"],placeholder:"alt da imagem"},quote:{wrap:["> ",""],placeholder:"cita\xE7\xE3o aqui"},ul:{block:`- item
- outro item
- mais um`},ol:{block:`1. primeiro
2. segundo
3. terceiro`},task:{block:`- [ ] tarefa pendente
- [x] tarefa conclu\xEDda`},hr:{block:"---"},codeblock:{block:"```js\n// c\xF3digo\n```"},table:{block:`| Coluna | Valor |
| --- | --- |
| linha 1 | 10 |
| linha 2 | 20 |`}},N=a=>{const i=Q[a];if(!i)return;const d=n,c=d.selectionStart,f=d.selectionEnd,h=d.value.slice(0,c),x=d.value.slice(c,f),I=d.value.slice(f);let E="",A=c;if(i.block)E=(h&&!h.endsWith(`
`)?`

`:"")+i.block+`
`,A=c+E.length,d.value=h+E+I;else{const L=x||i.placeholder||"";if(E=i.wrap[0]+L+i.wrap[1],d.value=h+E+I,x)A=c+E.length;else{A=c+i.wrap[0].length,d.focus(),d.setSelectionRange(A,A+L.length),k();return}}d.focus(),d.setSelectionRange(A,A),k()};document.querySelectorAll(".editor-toolbar-btn[data-md]").forEach(a=>{a.addEventListener("click",()=>N(a.dataset.md))}),n.addEventListener("keydown",a=>{if(!(a.metaKey||a.ctrlKey))return;const i=a.key.toLowerCase();i==="b"?(a.preventDefault(),N("bold")):i==="i"?(a.preventDefault(),N("italic")):i==="k"&&(a.preventDefault(),N("link"))});const tt=a=>{a=a.trim().toLowerCase(),a&&(state.form.tags||(state.form.tags=[]),!state.form.tags.includes(a)&&(state.form.tags.push(a),j()))},et=a=>{state.form.tags=(state.form.tags||[]).filter(i=>i!==a),j()},j=()=>{y.innerHTML=`
      ${(state.form.tags||[]).map(a=>`
        <span class="admin-tag-pill">${escapeHtml(a)}
          <button type="button" class="admin-tag-remove" data-tag="${escapeHtml(a)}">\u2715</button>
        </span>
      `).join("")}
      <input type="text" id="f-tags-input" placeholder="adicionar tag..."/>
    `,document.getElementById("f-tags-input").focus(),H()},H=()=>{const a=document.getElementById("f-tags-input");a.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===",")&&(i.preventDefault(),tt(a.value),a.value=""),i.key==="Backspace"&&!a.value&&state.form.tags?.length&&(state.form.tags.pop(),j())})};H(),y.addEventListener("click",a=>{const i=a.target.closest(".admin-tag-remove");i&&et(i.dataset.tag)}),document.getElementById("saveDraftBtn").addEventListener("click",()=>{p.value="draft",submitForm()}),document.getElementById("publishBtn")?.addEventListener("click",()=>{p.value!=="scheduled"&&(p.value="published"),submitForm()});const V=document.getElementById("mdFileInput"),G=document.getElementById("mdIoBar"),D=document.getElementById("mdIoMsg"),T=(a,i)=>{D&&(D.textContent=a||"",D.classList.toggle("is-error",i==="error"),D.classList.toggle("is-ok",i==="ok"),D.hidden=!a)},at=a=>/\.(md|markdown)$/i.test(a.name||"")||/^text\/(markdown|x-markdown)$/i.test(a.type||""),nt=a=>{const i=[],d=(c,f,h)=>{!c||f===void 0||f===null||f===""||(c.value=String(f),i.push(h))};if(d(t,a.title,"t\xEDtulo"),d(document.getElementById("f-subtitle"),a.subtitle,"subt\xEDtulo"),d(document.getElementById("f-author"),a.author,"autor"),a.slug&&(o.value=String(a.slug),g=!0,i.push("slug")),a.category){const c=String(a.category),f=document.getElementById("f-category");f&&(Array.from(f.options).some(h=>h.value===c)||f.appendChild(new Option(c,c)),f.value=c,i.push("categoria"))}if(a.status){const c=String(a.status).toLowerCase();["draft","published","scheduled"].includes(c)&&(p.value=c,i.push("status"))}if(typeof a.featured=="boolean"){const c=document.getElementById("f-featured");c&&(c.checked=a.featured,i.push("destaque"))}if(a.cover){const c=String(a.cover);safeImageSrc(c)?(state.form.cover=c,m.value=isEnderecoImagemAceito(c)?c:"",S(c),i.push("capa")):toast("A capa do arquivo .md foi ignorada. "+AVISO_ENDERECO_IMAGEM,"error")}if(a.coverAlt&&(state.form.coverAlt=String(a.coverAlt)),a.linkedinUrl){const c=String(a.linkedinUrl);isEnderecoHttp(c)?state.form.linkedinUrl=c:toast("O linkedinUrl do arquivo .md foi ignorado: use um endere\xE7o http(s).","error")}if(a.date&&(state.form.importedDate=String(a.date),v&&(v.value=toDatetimeLocal(a.date),i.push("data"))),a.updated&&(state.form.importedUpdated=String(a.updated)),Array.isArray(a.tags)&&(state.form.tags=a.tags.map(c=>String(c).trim().toLowerCase()).filter(Boolean),j(),document.getElementById("f-tags-input")?.blur(),i.push("tags")),Array.isArray(a.images)){const c=a.images.map(x=>typeof x=="string"?{src:x}:x).filter(x=>x&&x.src),f=c.filter(x=>safeImageSrc(x.src));state.form.images=f.map(x=>({src:String(x.src),alt:String(x.alt||""),caption:String(x.caption||"")})),C();const h=c.length-f.length;h>0&&toast(h+" imagem(ns) do .md ignorada(s). "+AVISO_ENDERECO_IMAGEM,"error"),i.push("imagens")}return i},ot=(a,i)=>{const d=parseFrontMatter(a);if(n.value=d.body,state.form.content=d.body,k(),r.classList.contains("active")&&_(),!d.data){T(`Corpo carregado de ${i}. N\xE3o achei front-matter, ent\xE3o os campos ficaram como estavam.`,"ok"),toast("Markdown carregado no corpo do post.");return}const c=nt(d.data);if(!d.data.slug&&!o.value){const f=slugify(String(i||"").replace(/\.(md|markdown)$/i,""));f&&(o.value=f,g=!0,c.push("slug (do nome do arquivo)"))}T(c.length?`${i} importado. Preenchi: ${c.join(", ")}.`:`${i} importado. S\xF3 o corpo veio preenchido.`,"ok"),toast("Arquivo .md importado.")},W=a=>{if(!a)return;if(!at(a)){T(`"${a.name}" n\xE3o \xE9 um arquivo .md. Aceito s\xF3 .md ou .markdown.`,"error"),toast("Arquivo ignorado: use .md ou .markdown.","error");return}const i=new FileReader;i.onload=()=>ot(String(i.result||""),a.name),i.onerror=()=>{T("N\xE3o consegui ler esse arquivo. Tente de novo.","error"),toast("Falha ao ler o arquivo .md","error")},i.readAsText(a,"utf-8")};document.getElementById("importMdBtn")?.addEventListener("click",()=>V?.click()),V?.addEventListener("change",a=>{W(a.target.files?.[0]),a.target.value=""});const K=a=>Array.from(a.dataTransfer?.types||[]).includes("Files"),O=a=>{n.classList.toggle("is-md-dragover",a),G?.classList.toggle("is-md-dragover",a)};[n,G].filter(Boolean).forEach(a=>{["dragenter","dragover"].forEach(i=>{a.addEventListener(i,d=>{K(d)&&(d.preventDefault(),O(!0))})}),a.addEventListener("dragleave",i=>{i.relatedTarget&&a.contains(i.relatedTarget)||O(!1)}),a.addEventListener("drop",i=>{K(i)&&(i.preventDefault(),O(!1),W(i.dataTransfer.files[0]))})});const J=()=>{const a=gatherExportPost(),i=(a.slug||slugify(a.title||"post")||"post")+".md";downloadAsFile(i,postToMarkdown(a),"text/markdown"),T(`${i} baixado. Coloque em data/posts/ e rode npm run build:posts.`,"ok"),toast(`Baixei ${i}`)};document.getElementById("exportMdBtn")?.addEventListener("click",J),document.getElementById("exportMdBarBtn")?.addEventListener("click",J),e.addEventListener("submit",a=>{a.preventDefault(),submitForm()})}function escapeFrontMatterString(e){return String(e??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"')}function postToMarkdown(e){const t=[];return t.push("---"),e.id&&t.push(`id: "${escapeFrontMatterString(e.id)}"`),t.push(`title: "${escapeFrontMatterString(e.title||"")}"`),e.subtitle&&t.push(`subtitle: "${escapeFrontMatterString(e.subtitle)}"`),t.push(`slug: ${e.slug||slugify(e.title||"post")}`),t.push(`date: "${e.createdAt||new Date().toISOString()}"`),t.push(`updated: "${e.updatedAt||e.createdAt||new Date().toISOString()}"`),e.category&&t.push(`category: "${escapeFrontMatterString(e.category)}"`),e.tags?.length&&(t.push("tags:"),e.tags.forEach(o=>t.push(`  - "${escapeFrontMatterString(o)}"`))),e.cover&&t.push(`cover: "${escapeFrontMatterString(e.cover)}"`),t.push(`coverAlt: "${escapeFrontMatterString(e.coverAlt||(e.title?e.title+" - Bernardo Iannini":"Bernardo Iannini"))}"`),e.images&&e.images.length?(t.push("images:"),e.images.forEach(o=>{t.push(`  - src: "${escapeFrontMatterString(o.src)}"`),t.push(`    alt: "${escapeFrontMatterString(o.alt||e.title||"")}"`),o.caption&&t.push(`    caption: "${escapeFrontMatterString(o.caption)}"`)})):t.push("images: []"),t.push(`linkedinUrl: "${escapeFrontMatterString(e.linkedinUrl||"")}"`),t.push(`featured: ${e.featured?"true":"false"}`),t.push(`status: ${e.status||"draft"}`),t.push(`author: "${escapeFrontMatterString(e.author||"Bernardo Iannini")}"`),t.push("---"),t.push(""),t.push(e.content||""),t.push(""),t.join(`
`)}function downloadAsFile(e,t,o="text/plain"){const n=new Blob([t],{type:o+";charset=utf-8"}),r=URL.createObjectURL(n),s=document.createElement("a");s.href=r,s.download=e,document.body.appendChild(s),s.click(),setTimeout(()=>{document.body.removeChild(s),URL.revokeObjectURL(r)},200)}function gatherFormData(){const e=document.getElementById("postForm"),t=new FormData(e),n=t.get("cover")?.trim()||""||state.form.cover||"";return{title:t.get("title")?.trim()||"",subtitle:t.get("subtitle")?.trim()||"",slug:slugify(t.get("slug"))||slugify(t.get("title"))||uid(),cover:n,tags:state.form.tags||[],images:state.form.images||[],category:t.get("category")||"Outro",author:t.get("author")?.trim()||"Bernardo Iannini",status:t.get("status")||"draft",publishedAt:fromDatetimeLocal(t.get("publishedAt")),featured:!!t.get("featured"),content:t.get("content")||""}}function gatherExportPost(){const e=gatherFormData(),t=state.form||{};return e.id=t.id||t.importedId||"",e.createdAt=e.publishedAt||t.createdAt||t.importedDate||"",e.updatedAt=t.updatedAt||t.importedUpdated||"",e.coverAlt=t.coverAlt||"",e.linkedinUrl=t.linkedinUrl||"",e}async function submitForm(){if(state.saving)return;const e=gatherFormData();if(!e.title){toast("O t\xEDtulo \xE9 obrigat\xF3rio.","error"),document.getElementById("f-title")?.focus();return}if(!e.publishedAt){toast("A data de publica\xE7\xE3o \xE9 obrigat\xF3ria.","error"),document.getElementById("f-publishedAt")?.focus();return}if(!e.content||e.content.trim().length<10){toast("Conte\xFAdo muito curto.","error"),document.getElementById("f-content")?.focus();return}if(e.cover&&!safeImageSrc(e.cover)){toast("Capa n\xE3o salva. "+AVISO_ENDERECO_IMAGEM,"error"),document.getElementById("f-cover")?.focus();return}const t=(e.images||[]).findIndex(g=>!g||!safeImageSrc(g.src));if(t>=0){toast("A imagem "+(t+1)+" do post tem endere\xE7o n\xE3o aceito. "+AVISO_ENDERECO_IMAGEM,"error");return}const o=state.editingId?state.posts.find(g=>g.id===state.editingId):null;let n=e.slug;state.posts.find(g=>g.slug===n&&(!o||g.id!==o.id))&&(n=n+"-"+Math.random().toString(36).slice(2,5));const s=e.status==="scheduled"?"draft":e.status,m={id:o?o.id:uid(),title:e.title,subtitle:e.subtitle,slug:n,cover:e.cover,coverAlt:o&&o.coverAlt||e.title+" - Bernardo Iannini",tags:e.tags,images:e.images,category:e.category,author:e.author,status:s,featured:e.featured,content:e.content,createdAt:e.publishedAt};state.saving=!0;const p=["saveDraftBtn","publishBtn"].map(g=>document.getElementById(g)).filter(Boolean);p.forEach(g=>{g.disabled=!0});const v=document.getElementById("publishBtn"),l=v?v.innerHTML:"";let y="",b=null,$=!1;toast("Salvando no Supabase...");try{if(o?await window.BlogDB.update(o.id,m):await window.BlogDB.create(m),m.featured){const{error:B}=await window.BlogDB.raw.from("posts").update({featured:!1}).eq("featured",!0).neq("id",m.id);B&&(y=" Aten\xE7\xE3o: n\xE3o consegui desmarcar o destaque dos outros posts ("+(B.message||B)+").")}state.posts=await window.BlogDB.listAll();const g=!!o&&o.status==="published"&&s!=="published";(s==="published"||g)&&(v&&(v.innerHTML=ICONS.paperplane+" Publicando..."),toast(g?"Tirando do site...":"Publicando no site..."),b=await triggerRebuild((g?"post despublicado: ":o?"post atualizado: ":"post publicado: ")+n),$=g)}catch(g){toast("Erro ao salvar: "+(g&&g.message||g),"error");return}finally{state.saving=!1,p.forEach(g=>{g.disabled=!1}),v&&(v.innerHTML=l)}let k;s==="published"?k=rebuildMessage("Post publicado","Post salvo",b):$?k=rebuildMessage("Post tirado do site","Post salvo como rascunho",b):e.status==="scheduled"?k={msg:"Agendamento ainda n\xE3o est\xE1 ativo: salvei como rascunho. A data de publica\xE7\xE3o ficou gravada e vale quando voc\xEA publicar.",type:"error"}:k={msg:"Rascunho salvo. Ele n\xE3o vai pro site.",type:"success"},toast(k.msg+y,y||k.type==="error"?"error":"success"),state.editingId=null,state.view="posts",render()}function attachGlobalEvents(){document.querySelectorAll(".admin-nav-item[data-view]").forEach(t=>{t.addEventListener("click",()=>{state.view=t.dataset.view,state.editingId=null,t.hasAttribute("data-new")&&(state.editingId=null),render()})});const e=async()=>{if(confirm("Tem certeza que quer sair?")){try{await window.BlogDB.signOut()}catch{}location.href="bernardolindao.html"}};document.getElementById("logoutBtn")?.addEventListener("click",e),document.getElementById("sidebarLogoutBtn")?.addEventListener("click",e),document.getElementById("adminContent").addEventListener("click",t=>{const o=t.target.closest("[data-status-filter]");if(o){state.statusFilter=o.dataset.statusFilter||"all",render();return}const n=t.target.closest("[data-nav]");if(n){state.view=n.dataset.nav,n.hasAttribute("data-new")&&(state.editingId=null),render();return}const r=t.target.closest("[data-edit]");if(r){state.editingId=r.dataset.edit,state.view="editor",render();return}const s=t.target.closest("[data-delete]");if(s){const l=s.dataset.delete,y=state.posts.find(b=>b.id===l);y&&confirm(`Excluir o post "${y.title}"? Esta a\xE7\xE3o n\xE3o pode ser desfeita.`)&&(s.disabled=!0,toast("Excluindo..."),window.BlogDB.remove(l).then(async()=>{const b=await triggerRebuild("post excluido: "+(y.slug||y.id)),$=rebuildMessage("Post exclu\xEDdo","Post exclu\xEDdo do banco",b);try{state.posts=await window.BlogDB.listAll()}catch{state.posts=(state.posts||[]).filter(g=>g.id!==l)}toast($.msg,$.type),state.editingId===l&&(state.editingId=null,state.view="posts"),render()}).catch(b=>{s.disabled=!1,toast("Erro ao excluir: "+(b&&b.message||b),"error")}));return}const m=t.target.closest("[data-duplicate]");if(m){const l=state.posts.find(y=>y.id===m.dataset.duplicate);if(l){const y={id:uid(),title:l.title+" (c\xF3pia)",subtitle:l.subtitle||"",slug:slugify(l.slug||l.title)+"-copia-"+Math.random().toString(36).slice(2,5),cover:safeImageSrc(l.cover)?l.cover:"",coverAlt:l.coverAlt||"",tags:l.tags||[],images:(l.images||[]).filter(b=>b&&safeImageSrc(b.src)),category:l.category||"",author:l.author||"Bernardo Iannini",status:"draft",featured:!1,content:l.content||""};window.BlogDB.create(y).then(async()=>{state.posts=await window.BlogDB.listAll(),toast("Post duplicado (como rascunho)."),render()}).catch(b=>toast("Erro ao duplicar: "+(b&&b.message||b),"error"))}return}const p=t.target.closest("[data-view-post]");if(p){const l=encodeURIComponent(p.dataset.viewPost||"");window.open("post.html?slug="+l,"_blank","noopener");return}const v=t.target.closest("tr[data-edit]");v&&!t.target.closest("button, a")&&(state.editingId=v.dataset.edit,state.view="editor",render())}),document.getElementById("adminContent").addEventListener("input",t=>{if(t.target.id==="adminSearch"){state.search=t.target.value;const o=t.target.selectionStart;render();const n=document.getElementById("adminSearch");if(n){n.focus();try{n.setSelectionRange(o,o)}catch{}}}}),document.addEventListener("keydown",t=>{(t.metaKey||t.ctrlKey)&&t.key==="s"&&state.view==="editor"&&(t.preventDefault(),submitForm()),(t.metaKey||t.ctrlKey)&&t.key==="n"&&state.view!=="editor"&&(t.preventDefault(),state.view="editor",state.editingId=null,render())})}const IDLE_LIMITE_MS=3600*1e3,IDLE_RESET_THROTTLE_MS=30*1e3,IDLE_EVENTOS=["mousedown","mousemove","keydown","wheel","touchstart","touchmove","scroll"];let idleTimer=null,idleUltimoReset=0,idleEncerrando=!1;function reiniciarIdle(){if(idleEncerrando)return;const e=Date.now();idleTimer&&e-idleUltimoReset<IDLE_RESET_THROTTLE_MS||(idleUltimoReset=e,clearTimeout(idleTimer),idleTimer=setTimeout(encerrarPorInatividade,IDLE_LIMITE_MS))}function pararRelogioIdle(){clearTimeout(idleTimer),idleTimer=null,IDLE_EVENTOS.forEach(e=>window.removeEventListener(e,reiniciarIdle,!0)),document.removeEventListener("visibilitychange",idleVisibilidade)}function idleVisibilidade(){document.hidden||reiniciarIdle()}function iniciarRelogioIdle(){IDLE_EVENTOS.forEach(e=>window.addEventListener(e,reiniciarIdle,{passive:!0,capture:!0})),document.addEventListener("visibilitychange",idleVisibilidade),idleUltimoReset=0,reiniciarIdle()}async function encerrarPorInatividade(){if(!idleEncerrando){if(state.saving){idleTimer=setTimeout(encerrarPorInatividade,60*1e3),idleUltimoReset=Date.now();return}idleEncerrando=!0,pararRelogioIdle();try{await window.BlogDB.signOut()}catch{}mostrarSessaoEncerrada()}}function mostrarSessaoEncerrada(){setSidebarStatus("sess\xE3o encerrada");const e=document.getElementById("adminContent");e&&(e.innerHTML=""),document.getElementById("adminToast")?.remove(),document.getElementById("adminIdleOverlay")?.remove();const t=document.createElement("div");t.id="adminIdleOverlay",t.setAttribute("role","alertdialog"),t.setAttribute("aria-modal","true"),t.style.cssText=["position:fixed","inset:0","z-index:9999","display:flex","align-items:center","justify-content:center","padding:24px","background:#0b0b0f","color:#f4f4f6","font-family:inherit","text-align:center"].join(";"),t.innerHTML=`
    <div style="max-width:460px">
      <h2 style="font-size:22px;margin:0 0 12px">Sess\xE3o encerrada por inatividade</h2>
      <p style="line-height:1.7;margin:0 0 8px;opacity:.85">
        Passou 1 hora sem nenhuma intera\xE7\xE3o, ent\xE3o o painel encerrou a sess\xE3o sozinho
        para que ningu\xE9m continue de onde voc\xEA parou.
      </p>
      <p style="line-height:1.7;margin:0 0 20px;opacity:.6;font-size:13px">
        Altera\xE7\xF5es que voc\xEA n\xE3o tinha salvo foram perdidas. Entre de novo para continuar.
      </p>
      <button type="button" id="adminIdleLoginBtn"
        style="cursor:pointer;border:0;border-radius:10px;padding:12px 20px;font-size:14px;font-weight:600;background:#f4f4f6;color:#0b0b0f">
        Entrar de novo
      </button>
    </div>`,document.body.appendChild(t);const o=document.getElementById("adminIdleLoginBtn");o?.addEventListener("click",()=>{location.replace("bernardolindao.html")}),o?.focus()}const isNetworkError=e=>{const t=(e&&e.message||String(e||"")).toLowerCase();return e&&e.name==="TypeError"||/failed to fetch|networkerror|fetch|network|dns/.test(t)};function renderSidebarUser(e){const t=e&&e.user&&e.user.email||"",o=t?t.split("@")[0]:"admin",n=document.querySelector(".admin-user-name"),r=document.querySelector(".admin-user-avatar");n&&(n.textContent=o,n.title=t),r&&(r.textContent=(o.charAt(0)||"B").toUpperCase())}function setSidebarStatus(e){const t=document.querySelector(".admin-user-status");t&&(t.textContent=e)}function renderServerOffline(e){const t=document.getElementById("adminContent");if(!t)return;const o=isNetworkError(e);setSidebarStatus("offline"),t.innerHTML=`
    <header class="admin-header">
      <div>
        <h1 class="admin-title">${o?"Servidor de dados <em>indispon\xEDvel</em>":"N\xE3o consegui falar com o <em>Supabase</em>"}</h1>
        <p class="admin-title-sub">${o?"O banco Supabase n\xE3o respondeu (falha de rede ou DNS). Sem ele o painel n\xE3o l\xEA nem grava posts.":"O painel l\xEA e grava os posts no banco Supabase."}</p>
      </div>
    </header>
    <section class="admin-card">
      <div class="admin-card-body" style="line-height:1.7">
        <p>Verifique:</p>
        <ul style="margin:8px 0 12px 18px">
          <li><code>js/supabase-config.js</code> com a URL e a chave anon corretas</li>
          <li>o <code>schema.sql</code> rodado no SQL Editor do Supabase</li>
          <li>conex\xE3o com a internet</li>
        </ul>
        <p style="color:var(--text-hint);font-size:12.5px">Detalhe t\xE9cnico: ${escapeHtml(e&&e.message||String(e))}</p>
        <button class="admin-btn admin-btn--primary" type="button" onclick="location.reload()">Tentar de novo</button>
      </div>
    </section>`}async function init(){if(!window.BlogDB){renderServerOffline(new Error("Supabase n\xE3o configurado (js/supabase-config.js)."));return}let e=null;try{e=await window.BlogDB.getSession()}catch(t){renderServerOffline(t);return}if(!e){try{const{error:t}=await window.BlogDB.raw.from("posts").select("id").limit(1);if(t&&isNetworkError(t)){renderServerOffline(t);return}}catch(t){if(isNetworkError(t)){renderServerOffline(t);return}}location.replace("bernardolindao.html");return}renderSidebarUser(e),attachGlobalEvents();try{state.posts=await window.BlogDB.listAll()}catch(t){console.error("[admin] Supabase indispon\xEDvel:",t),renderServerOffline(t);return}setSidebarStatus("online"),render(),iniciarRelogioIdle()}document.addEventListener("DOMContentLoaded",init);
