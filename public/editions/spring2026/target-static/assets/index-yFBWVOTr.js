import{s as z}from"./index-Dk1-D4QQ.js";import{g as R,D as V,a as $,r as D,s as F}from"./deploy-urls-BqJLL-2u.js";const Y=`
  .vc-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  }
  .vc-modal {
    background: #111;
    border: 1px solid #333;
    padding: 24px;
    min-width: 450px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
  }
  .vc-modal h2 {
    margin: 0 0 8px 0;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .vc-sheet-label {
    color: #666;
    font-size: 11px;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .vc-changed-sections {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 10px 0 16px;
  }
  .vc-changed-tag {
    display: inline-block;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid;
  }
  .vc-no-changes {
    color: #555;
    font-size: 11px;
    margin: 10px 0 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .vc-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #333;
    background: #0a0a0a;
    color: #fff;
    font-size: 13px;
    font-family: inherit;
    margin-bottom: 12px;
    outline: none;
    transition: border-color 0.15s;
  }
  .vc-input:focus {
    border-color: #fff;
  }
  .vc-input::placeholder {
    color: #555;
  }
  .vc-btn {
    padding: 10px 20px;
    border: 1px solid #333;
    background: #111;
    color: #fff;
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .vc-btn:hover {
    background: #222;
    border-color: #555;
  }
  .vc-btn-primary {
    background: #fff;
    color: #000;
    border-color: #fff;
  }
  .vc-btn-primary:hover {
    background: #ddd;
    border-color: #ddd;
  }
  .vc-btn-row {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 20px;
  }
  .vc-section-title {
    color: #666;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .vc-unsaved-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    background: #f44;
    border-radius: 50%;
    pointer-events: none;
  }
  .vc-select {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #333;
    background: #0a0a0a;
    color: #fff;
    font-size: 12px;
    font-family: inherit;
    outline: none;
    cursor: pointer;
  }
  .vc-select:focus {
    border-color: #fff;
  }
  .vc-select option {
    background: #111;
    color: #fff;
  }
  .vc-state-list {
    max-height: 340px;
    overflow-y: auto;
    margin-bottom: 16px;
  }
  .vc-state-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #222;
    margin-bottom: 4px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .vc-state-row:hover {
    border-color: #444;
    background: #1a1a1a;
  }
  .vc-state-row.selected {
    border-color: #fff;
    background: #1a1a1a;
  }
  .vc-state-row .vc-state-name {
    color: #fff;
    font-size: 12px;
    font-weight: 600;
  }
  .vc-state-row .vc-state-meta {
    color: #555;
    font-size: 10px;
  }
  .vc-state-row .vc-state-section-tag {
    padding: 2px 6px;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid #444;
    color: #999;
    white-space: nowrap;
  }
  .vc-empty {
    color: #555;
    font-size: 11px;
    text-align: center;
    padding: 24px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .vc-filter-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .vc-deploy-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border: 1px solid #333;
    margin-bottom: 16px;
  }
  .vc-deploy-row .vc-deploy-label {
    color: #999;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .vc-btn-deploy {
    padding: 6px 14px;
    border: 1px solid #555;
    background: transparent;
    color: #fff;
    font-size: 11px;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .vc-btn-deploy:hover {
    background: #222;
    border-color: #888;
  }
  .vc-btn-deploy:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;let U=!1;function G(){if(U||typeof document>"u")return;const e=document.createElement("style");e.textContent=Y,document.head.appendChild(e);const t=document.createElement("style");t.textContent=`
    @keyframes slideUp {
      from { transform: translate(-50%, 20px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
  `,document.head.appendChild(t),U=!0}function M(){const e=document.createElement("div");e.className="vc-overlay",e.style.zIndex="999999",document.body.appendChild(e);const t=document.createElement("div");t.className="vc-modal",e.appendChild(t);const o=()=>e.remove();return e.addEventListener("click",s=>{s.target===e&&o()}),{modal:t,close:o,overlay:e}}function m(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function B(){return window.location.pathname.replace(/\/theatre$/,"")}function k(e){try{return z.createContentOfSaveFile(e)}catch{return}}function A(e){const t=document.createElement("div");t.style.cssText=`
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #fff;
    color: #000;
    padding: 12px 24px;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    z-index: 999999;
    animation: slideUp 0.3s ease;
  `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.style.opacity="0",t.style.transition="opacity 0.3s",setTimeout(()=>t.remove(),300)},2e3)}const l={PULL_STATE_URL:"theatre-pull-state-url",PULL_STATE_NAME:"theatre-pull-state-name",PULL_SECTION:"theatre-pull-section",PULL_CURRENT_STATE:"theatre-pull-current-state",PULL_STATE_JSON:"theatre-pull-state-json",LAST_AUTHOR:"theatre-last-author"},K="theatre",X=new Set(Object.values(l));function Q(){return typeof window>"u"?"":localStorage.getItem(l.LAST_AUTHOR)||""}function W(e){typeof window>"u"||localStorage.setItem(l.LAST_AUTHOR,e)}function C(){if(typeof localStorage>"u")return;const e=[];for(let t=0;t<localStorage.length;t++){const o=localStorage.key(t);!o||X.has(o)||o.includes(K)&&e.push(o)}e.forEach(t=>localStorage.removeItem(t))}function ue(){return typeof window>"u"?!1:!!localStorage.getItem(l.PULL_STATE_URL)}function pe(){if(typeof window>"u")return null;const e=localStorage.getItem(l.PULL_STATE_URL);if(!e)return null;const t=localStorage.getItem(l.PULL_STATE_NAME)||"unknown",o=localStorage.getItem(l.PULL_SECTION)||null;let s=null;const a=localStorage.getItem(l.PULL_CURRENT_STATE);if(a)try{s=JSON.parse(a)}catch{}return localStorage.removeItem(l.PULL_STATE_URL),localStorage.removeItem(l.PULL_STATE_NAME),localStorage.removeItem(l.PULL_SECTION),localStorage.removeItem(l.PULL_CURRENT_STATE),{url:e,name:t,section:o,currentState:s}}function N(e){localStorage.setItem(l.PULL_STATE_JSON,JSON.stringify(e))}function fe(){const e=localStorage.getItem(l.PULL_STATE_JSON);if(localStorage.removeItem(l.PULL_STATE_JSON),!e)return null;try{return JSON.parse(e)}catch{return null}}function O(e,t,o,s){localStorage.setItem(l.PULL_STATE_URL,e),localStorage.setItem(l.PULL_STATE_NAME,t),o&&localStorage.setItem(l.PULL_SECTION,o),s&&localStorage.setItem(l.PULL_CURRENT_STATE,JSON.stringify(s))}async function Z(e){try{return await(await fetch(`${B()}/theatre-api`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json()}catch(t){return{success:!1,error:t.message}}}function ee(e,t){var T;const{modal:o,close:s}=M(),a=Q(),{changedSections:r,onPushSuccess:d}=t,h=k(e.address.projectId),L=Object.keys((h==null?void 0:h.sheetsById)??{});let c=t.activeSheetId,u=!1;const g=()=>{const f=r.length>0?`<div class="vc-changed-sections">
          ${r.map(i=>`<span class="vc-changed-tag" style="border-color:#66666655; background:#66666614; color:#999; opacity:${c===i||c==="all"?"1":"0.35"}">${i}</span>`).join("")}
        </div>`:'<div class="vc-no-changes">No sections changed since last load.</div>';o.innerHTML=`
      <h2>Push Version</h2>

      <div class="vc-section-title">Section to push</div>
      <select class="vc-select" id="vc-section-select" style="width:100%;margin-bottom:16px">
        ${L.map(i=>`
          <option value="${i}" ${c===i?"selected":""}>
            ${i}${r.includes(i)?" ●":""}
          </option>
        `).join("")}
        <option value="all" ${c==="all"?"selected":""}>
          All Sections
        </option>
      </select>

      <div class="vc-section-title">Changed sections</div>
      ${f}

      <input type="text" class="vc-input" id="vc-author" placeholder="Your name" value="${m(a)}" />
      <input type="text" class="vc-input" id="vc-name" placeholder="Version name" />
      <input type="text" class="vc-input" id="vc-key" placeholder="Preview key (auto-generated)" />

      <div class="vc-btn-row" style="flex-wrap: wrap; gap: 8px;">
        <button class="vc-btn" id="vc-cancel">Cancel</button>
        <button class="vc-btn vc-btn-primary" id="vc-push-shopify" ${u?"disabled":""}>
          ${u?"Pushing...":c==="all"?"Push All":`Push ${c}`}
        </button>
      </div>
    `;const p=o.querySelector("#vc-section-select");p.addEventListener("change",()=>{c=p.value,g()}),o.querySelector("#vc-cancel").addEventListener("click",s);const E=o.querySelector("#vc-name"),y=o.querySelector("#vc-key");E&&E.addEventListener("input",()=>{if(y&&!y.dataset.manual){const i=E.value.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),x=(c==="all"?"all":c).toLowerCase();y.value=i?`${x}-${i}`:""}}),y&&y.addEventListener("input",()=>{y.dataset.manual="true"}),o.querySelector("#vc-push-shopify").addEventListener("click",async()=>{const i=o.querySelector("#vc-author").value.trim(),x=o.querySelector("#vc-name").value.trim(),n=o.querySelector("#vc-key").value.trim();if(!i||!x){alert("Please fill in both fields");return}u=!0,g();const v=k(e.address.projectId)??{};let w,S;if(c==="all")w=v,S="all";else{const _=v.sheetsById;w={sheetsById:{[c]:_==null?void 0:_[c]},definitionVersion:v.definitionVersion,revisionHistory:v.revisionHistory},S=c}const b=await Z({state:w,name:x,section:S,author:i,projectName:e.address.projectId,key:n||void 0});b.success?(W(i),d(),s(),A(c==="all"?"Pushed all sections to Shopify!":`Pushed ${c} to Shopify!`)):(u=!1,g(),alert(`Push failed: ${b.error}`))})};g(),(T=o.querySelector("#vc-author"))==null||T.focus()}async function te(e){try{const t=new URLSearchParams({action:"list"});e&&t.set("section",e);const o=await fetch(`${B()}/theatre-api?${t}`);return o.ok?await o.json():{success:!1,error:`HTTP ${o.status}`}}catch(t){return{success:!1,error:t.message}}}function oe(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.sheetsById=="object"&&t.sheetsById!==null}async function ne(){const e=R();if(e.size===0)return null;const t=await Promise.all(Array.from(e.entries()).map(async([s,a])=>{try{const r=await fetch(a);if(!r.ok)return null;const d=await r.json();return oe(d)?{name:s,state:d}:null}catch{return null}})),o={};for(const s of t){if(!s)continue;const{name:a,state:r}=s,d=r.sheetsById[a]??r.sheetsById.Scene??Object.values(r.sheetsById)[0];d&&(o[a]=d)}return Object.keys(o).length===0?null:{definitionVersion:V,revisionHistory:[],sheetsById:o}}function se(e,t){const{modal:o,close:s}=M();let a=[],r=null;const d=t??"all";let h=!0,L=!1,c=!1,u=null;const g=t??null,T=R().size>0,f=()=>{var x;const p=d==="all"?a:a.filter(n=>n.section===d||n.section==="all"),E=p.length>0?p.map(n=>`
              <div class="vc-state-row ${n.handle===r?"selected":""}" data-handle="${m(n.handle)}">
                <span class="vc-state-section-tag" style="border-color:#66666655; color:#999">${m(n.section||"—")}</span>
                <div style="flex:1;min-width:0">
                  <div class="vc-state-name">${m(n.name)}</div>
                  <div class="vc-state-meta">${m(n.author)} · ${m(n.version)}${n.key?` · key: ${m(n.key)}`:""}</div>
                </div>
              </div>`).join(""):`<div class="vc-empty">${h?"Loading…":`No versions found for ${g??"this section"}`}</div>`,y=g?`<div style="color:#fff;font-size:12px;font-weight:600;margin-bottom:12px;font-family:'SF Mono',monospace;text-transform:uppercase;letter-spacing:0.5px">${m(g)}</div>`:"",i=T?`<div class="vc-deploy-row">
          <span class="vc-deploy-label">Current production state</span>
          <button class="vc-btn-deploy" id="vc-match-deploy" ${c?"disabled":""}>
            ${c?"Loading…":"Match Deploy"}
          </button>
        </div>`:"";o.innerHTML=`
      <h2>Pull Version</h2>
      ${y}
      ${i}
      <div class="vc-section-title">${T?"Or select":"Select"} a version to load into the editor</div>
      ${u?`<div style="color:#f44;font-size:11px;margin-bottom:12px">${m(u)}</div>`:""}
      <div class="vc-state-list">${E}</div>
      <div class="vc-btn-row">
        <button class="vc-btn" id="vc-cancel">Cancel</button>
        <button class="vc-btn vc-btn-primary" id="vc-pull-confirm" ${!r||L?"disabled":""}>
          ${L?"Pulling…":"Pull"}
        </button>
      </div>
    `,o.querySelectorAll(".vc-state-row").forEach(n=>{n.addEventListener("click",()=>{r=n.getAttribute("data-handle"),f()})}),o.querySelector("#vc-cancel").addEventListener("click",s),(x=o.querySelector("#vc-match-deploy"))==null||x.addEventListener("click",async()=>{c=!0,u=null,f();const n=await ne();if(!n){c=!1,u="Failed to fetch deployed state from CDN",f();return}s(),A("Loading deployed state…"),C(),N({...n}),O("deploy","Production Deploy"),setTimeout(()=>window.location.reload(),100)}),o.querySelector("#vc-pull-confirm").addEventListener("click",async()=>{if(!r)return;L=!0,u=null,f();const n=a.find(b=>b.handle===r);if(!n||!n.fileUrl){L=!1,u="No file URL available for this version",f();return}const v=n.section!=="all";s(),A(v?`Loading ${n.section} from "${n.name}"…`:`Loading "${n.name}"…`);let w;v&&(w=k(e.address.projectId));let S;try{const b=await fetch(n.fileUrl);b.ok&&(S=await b.json())}catch{}C(),S&&N(S),O(n.fileUrl,n.name,v?n.section:void 0,w),setTimeout(()=>window.location.reload(),100)})};f(),te(t).then(p=>{h=!1,p.success&&p.states?a=p.states:u=p.error||"Failed to load states",f()})}let I=!1,P=null;function ae(e){P=e}function re(e){if(!P)return[];const t=k(e.address.projectId),o=t==null?void 0:t.sheetsById;if(!o)return[];const s=new Set([...Object.keys(P),...Object.keys(o)]),a=[];for(const r of s){const d=JSON.stringify(P[r]||null),h=JSON.stringify(o[r]||null);d!==h&&a.push(r)}return a}function q(){const e=document.querySelector("[data-vc-push-button]");if(!e)return;let t=e.querySelector(".vc-unsaved-dot");I&&!t?(t=document.createElement("span"),t.className="vc-unsaved-dot",e.appendChild(t),e.style.position="relative"):!I&&t&&t.remove()}function H(){I||(I=!0,q())}function J(){I=!1,q()}function ce(){const e=()=>{var a;const o=document.querySelector('[title="Push Version"]');if(!o)return!1;const s=document.createElement("span");return s.style.cssText=`
      color: #666;
      font-family: 'SF Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    `,s.textContent=`SECTION: ${$}`,(a=o.parentElement)==null||a.insertBefore(s,o),D(s),!0};if(e())return;const t=new MutationObserver(()=>{e()&&t.disconnect()});t.observe(document.body,{childList:!0,subtree:!0})}let j=!1;function le(e){j||(j=!0,G(),setTimeout(()=>{document.addEventListener("pointerup",t=>{const o=t.target;(o.closest('[class*="theatre"]')||o.closest("[data-theatre]")||o.closest(".vc-")===null)&&!o.closest(".vc-overlay")&&o.closest('[class*="theatre"]')&&H()})},1e3),z.extend({id:"version-control",toolbars:{global(t){return t([{type:"Icon",title:"Pull Version",svgSource:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',onClick:()=>se(e,$)},{type:"Icon",title:"Push Version",svgSource:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',onClick:()=>ee(e,{activeSheetId:$,changedSections:re(e),onPushSuccess:J})}]),()=>{}}}}),setTimeout(()=>{document.querySelectorAll('[class*="theatre"] button').forEach(o=>{o.getAttribute("title")==="Push Version"&&o.setAttribute("data-vc-push-button","true")})},500),ce())}const ve=Object.freeze(Object.defineProperty({__proto__:null,clearUnsavedChanges:J,initVersionControlExtension:le,markUnsavedChanges:H,setActiveSheetId:F,setInitialSheetsById:ae},Symbol.toStringTag,{value:"Module"}));export{pe as a,fe as b,C as c,k as g,ue as h,ve as i,ae as s};
//# sourceMappingURL=index-yFBWVOTr.js.map
