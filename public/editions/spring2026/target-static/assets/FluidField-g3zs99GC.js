var Ve=Object.defineProperty;var ve=i=>{throw TypeError(i)};var Ie=(i,e,t)=>e in i?Ve(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var l=(i,e,t)=>Ie(i,typeof e!="symbol"?e+"":e,t),se=(i,e,t)=>e.has(i)||ve("Cannot "+t);var f=(i,e,t)=>(se(i,e,"read from private field"),t?t.call(i):e.get(i)),F=(i,e,t)=>e.has(i)?ve("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(i):e.set(i,t),T=(i,e,t,s)=>(se(i,e,"write to private field"),s?s.call(i,t):e.set(i,t),t),g=(i,e,t)=>(se(i,e,"access private method"),t);var he=(i,e,t,s)=>({set _(n){T(i,e,n,t)},get _(){return f(i,e,s)}});import{r as E}from"./chunk-EPOLDU6W-CgSudzSq.js";import{W as fe,a6 as Ue,R as ze,bk as Oe,e as Be,M as He,d as We,O as Ne,V as I,r as ne,L as pe,v as Xe,C as we,t as w,u as me,y as Ye}from"./TierResolver-nYYMFDvd.js";import{u as Ge}from"./constants-D_Mco9k_.js";import{a as je}from"./reducedMotion-CdiMTSZU.js";import{u as qe}from"./useStickyMountGate-DkOADX5n.js";import{r as Ze}from"./reportError-C0JYu6Sl.js";import{u as $e}from"./useCanvasPointer-Bi4-9gKY.js";import{o as Qe}from"./lenisManager-BGOTe4iO.js";import{b as Je,D as Ke,M as ke,a as et}from"./presets-ClUyafeV.js";const tt=14,it=10,st=.002,nt=.32,rt=8,ot=80,at=.01,lt=1/30;let ye=!1,H=0,oe=0,W=0,K=0,ae=0;const ge=new WeakMap;function be(i,e){const t=performance.now(),s=e-i,n=Math.max(rt,Math.min(ot,t-K));K=t,oe=Math.abs(s)<at?0:Math.max(-1,Math.min(1,s/n*nt))}function ut(i){const e=i.target;let t,s;if(e===document||e===window||e===null)s=window.scrollY,t=W,W=s;else if(e instanceof HTMLElement)s=e.scrollTop,t=ge.get(e)??s,ge.set(e,s);else return;be(t,s)}function ct(i){be(W,i.scroll),W=i.scroll}function dt(i){const e=Math.max(0,Math.min(i,lt)),t=1-Math.exp(-e*tt),s=Math.exp(-e*it);H+=(oe-H)*t,oe*=s,Math.abs(H)<st&&(H=0)}function De(i){const e=(i-ae)/1e3;ae=i,dt(e),requestAnimationFrame(De)}function vt(){ye||typeof window>"u"||(ye=!0,W=window.scrollY,K=performance.now(),ae=K,document.addEventListener("scroll",ut,{passive:!0,capture:!0}),Qe(i=>i.on("scroll",ct)),requestAnimationFrame(De))}function ht(){return vt(),H}function ce(){return performance.now()}function ft(){return typeof document>"u"?"unknown":document.visibilityState??"visible"}function Me(){return typeof document>"u"?!0:document.hidden!==!0}function pt(i=ce()){const e=Me();return{visibleElapsedMs:0,hiddenElapsedMs:0,segmentStartedAt:i,isVisible:e,everHidden:!e}}function q(i,e=ce()){const t=Math.max(0,e-i.segmentStartedAt);return i.isVisible?i.visibleElapsedMs+=t:i.hiddenElapsedMs+=t,i.segmentStartedAt=e,i.isVisible=Me(),i.everHidden||(i.everHidden=!i.isVisible),Re(i,e)}function Re(i,e=ce()){const t=Math.max(0,e-i.segmentStartedAt);return{visibilityState:ft(),everHidden:i.everHidden||!i.isVisible,visibleElapsedMs:Math.round(i.visibleElapsedMs+(i.isVisible?t:0)),hiddenElapsedMs:Math.round(i.hiddenElapsedMs+(i.isVisible?0:t))}}function mt(i,e,t){let s=null,n=!1;const o=()=>{s!==null&&(window.clearTimeout(s),s=null)},r=()=>{if(o(),n||!e.isVisible)return;const h=Math.max(0,i-e.visibleElapsedMs);s=window.setTimeout(()=>{if(q(e),e.isVisible&&e.visibleElapsedMs>=i){n=!0,a(),t(Re(e));return}r()},h)},u=()=>{q(e),r()},a=()=>{typeof document>"u"||document.removeEventListener("visibilitychange",u)};return typeof document<"u"&&document.addEventListener("visibilitychange",u),q(e),r(),{clear:()=>{n||(n=!0,q(e),o(),a())}}}function yt(i){return i instanceof Error?i.visibilityTelemetry??{}:{}}function gt(i,e){return Object.assign(i,{visibilityTelemetry:e}),i}let $=!1;const de=[];function xt(i,{visibilityAwareWatchdog:e=!1}={}){return new Promise((t,s)=>{de.push({task:i,resolve:t,reject:s,visibilityAwareWatchdog:e}),Fe()})}const St=30,xe=15e3;function Fe(){$||de.length!==0&&window.setTimeout(Tt,St)}function Tt(){if($)return;const i=de.shift();if(!i)return;$=!0;let e=!1;const t=()=>{e||(e=!0,s.clear(),$=!1,Fe())};let s;if(i.visibilityAwareWatchdog)s=mt(xe,pt(),n=>{i.reject(gt(new Error("warmup watchdog timeout"),n)),t()});else{const n=window.setTimeout(()=>{i.reject(new Error("warmup watchdog timeout")),t()},xe);s={clear:()=>window.clearTimeout(n)}}i.task().then(i.resolve,i.reject).finally(t)}const wt=1e3,Z=new Map;let U=null,Se=0;function Le(){if(U!==null)return U;if(typeof window>"u")return U=!1,U;const i=new URLSearchParams(window.location.search);let e=!1;try{e=window.localStorage.getItem("scenePerf")==="1"}catch{e=!1}return U=i.has("scenePerf")||e,U}function bt(i,e){if(!Le())return e();const t=performance.now();try{return e()}finally{Dt(i,performance.now()-t)}}function Dt(i,e){if(!Le())return;const t=Z.get(i)??{total:0,count:0,max:0};t.total+=e,t.count++,t.max=Math.max(t.max,e),Z.set(i,t);const s=performance.now();if(s-Se<wt)return;Se=s;const n=Array.from(Z,([o,r])=>({name:o,avg:`${(r.total/Math.max(1,r.count)).toFixed(2)}ms`,max:`${r.max.toFixed(2)}ms`,count:r.count})).sort((o,r)=>parseFloat(r.avg)-parseFloat(o.avg));console.table(n),Z.clear()}var b,P;class B{constructor(e,t,s){F(this,b);F(this,P);l(this,"uniform");const n={minFilter:s,magFilter:s,format:ze,type:Ue,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1};T(this,b,new fe(e,t,n)),T(this,P,new fe(e,t,n)),this.uniform={value:f(this,b).texture}}get read(){return f(this,b).texture}get write(){return f(this,P)}swap(){const e=f(this,b);T(this,b,f(this,P)),T(this,P,e),this.uniform.value=f(this,b).texture}dispose(){f(this,b).dispose(),f(this,P).dispose()}}b=new WeakMap,P=new WeakMap;class L{constructor(e,t,s,n){l(this,"gl");l(this,"uniforms");l(this,"mesh");l(this,"scene");l(this,"camera");this.gl=e,this.uniforms=n;const o=new Oe(2,2),r=new Be({vertexShader:t,fragmentShader:s,uniforms:n,depthWrite:!1,depthTest:!1});this.mesh=new He(o,r),this.scene=new We,this.scene.add(this.mesh),this.camera=new Ne(-1,1,1,-1,0,1)}render(e){this.gl.setRenderTarget(e??null),this.gl.render(this.scene,this.camera)}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose()}}function re(i,e=1/60){const t=Math.max(0,Math.min(1,i));return t===0?0:Math.pow(t,Math.max(0,e)*60)}const _=`varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;

void main() {
  vUv = uv;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(position, 1.0);
}

`,Mt=`varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main() {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = dissipation * texture2D(uSource, coord);
  gl_FragColor.a = 1.0;
}

`,Rt=`varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main() {
  gl_FragColor = value * texture2D(uTexture, vUv);
}

`,Ft=`varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}

`,Lt=`// Display pass from Pavel Dobryakov's WebGL-Fluid-Simulation (MIT):
// straight passthrough of the dye texture.

varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  gl_FragColor = texture2D(uTexture, vUv);
}
`,_t=`varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}

`,Ct=`varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}

`,Et=`varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}

`,Pt=`// Splat brush. Deposits \`color\` along the segment from \`prevPoint\` to \`point\`
// with a Gaussian falloff. Pavel Dobryakov's WebGL-Fluid-Simulation (MIT) uses
// the same additive exp(-d^2/radius) deposit; here the distance is measured to
// the stroke segment (standard point-to-segment SDF) so pointer motion paints a
// continuous round-tipped stroke instead of discrete dots. \`radius\` is the
// Gaussian variance (aspect-corrected on X).

varying vec2 vUv;

uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform vec2 prevPoint;
uniform float radius;

// Point-to-segment distance: the canonical 2D SDF from Inigo Quilez
// (https://iquilezles.org/articles/distfunctions2d/ — \`sdSegment\`),
// aspect-corrected on X so the brush stays round on non-square viewports.
float segmentDistance(vec2 uv, vec2 a, vec2 b) {
  vec2 pa = uv - a;
  vec2 ba = b - a;
  pa.x *= aspectRatio;
  ba.x *= aspectRatio;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float d = segmentDistance(vUv, prevPoint, point);
  // Guard the divisor: a zero radius would divide by zero and write NaNs that
  // poison the velocity FBO.
  vec3 splat = exp(-(d * d) / max(radius, 1e-6)) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
`,At=`varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;

void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}

`,Te=i=>w.clamp(Math.floor(i),ke,et),Vt={simSize:Ke,dyeSize:Je,densityDissipation:.97,velocityDissipation:.98,pressureDissipation:.8,pressureIterations:10,curl:30,splatRadius:.25};var D,ee,te,V,z,d,le,_e,ue,Ce,Ee,Q,J;class It{constructor(e,t={}){F(this,d);l(this,"gl");l(this,"config");l(this,"fbos");F(this,D,[]);l(this,"passes");l(this,"width",0);l(this,"height",0);l(this,"aspect",1);l(this,"simW",0);l(this,"simH",0);l(this,"dyeW",0);l(this,"dyeH",0);F(this,ee,new I);F(this,te,new I);F(this,V,0);F(this,z,null);this.gl=e,this.config={...Vt,...t},g(this,d,ue).call(this,1),g(this,d,Ce).call(this),this.reset()}setTextureSizes(e,t){if(!Number.isFinite(e)||!Number.isFinite(t))return!1;const s=Te(e),n=Te(t);return s===this.config.simSize&&n===this.config.dyeSize?!1:(this.config.simSize=s,this.config.dyeSize=n,g(this,d,le).call(this,this.aspect),this.width>0&&this.height>0&&this.passes.display.uniforms.texelSize.value.set(1/this.width,1/this.height),!0)}setSize(e,t){this.width=e,this.height=t;const s=e/t;Math.abs(s-this.aspect)>.01&&(this.aspect=s,g(this,d,le).call(this,s)),this.passes.display.uniforms.texelSize.value.set(1/e,1/t)}async compileAsync(){await Promise.all(Object.values(this.passes).map(e=>this.gl.compileAsync(e.scene,e.camera)))}update(e){g(this,d,_e).call(this);const{fbos:t,passes:s,config:n}=this;g(this,d,Q).call(this);try{s.curl.uniforms.uVelocity.value=t.velocity.read,s.curl.render(t.curl.write),t.curl.swap(),s.vorticity.uniforms.uVelocity.value=t.velocity.read,s.vorticity.uniforms.uCurl.value=t.curl.read,s.vorticity.uniforms.curl.value=n.curl,s.vorticity.uniforms.dt.value=e,s.vorticity.render(t.velocity.write),t.velocity.swap(),s.divergence.uniforms.uVelocity.value=t.velocity.read,s.divergence.render(t.divergence.write),t.divergence.swap(),s.clear.uniforms.uTexture.value=t.pressure.read,s.clear.uniforms.value.value=re(n.pressureDissipation,e),s.clear.render(t.pressure.write),t.pressure.swap(),s.pressure.uniforms.uDivergence.value=t.divergence.read;for(let o=0;o<n.pressureIterations;o++)s.pressure.uniforms.uPressure.value=t.pressure.read,s.pressure.render(t.pressure.write),t.pressure.swap();s.gradientSubtract.uniforms.uPressure.value=t.pressure.read,s.gradientSubtract.uniforms.uVelocity.value=t.velocity.read,s.gradientSubtract.render(t.velocity.write),t.velocity.swap(),s.advection.uniforms.texelSize.value.set(1/this.simW,1/this.simH),s.advection.uniforms.uVelocity.value=t.velocity.read,s.advection.uniforms.uSource.value=t.velocity.read,s.advection.uniforms.dissipation.value=re(n.velocityDissipation,e),s.advection.uniforms.dt.value=e,s.advection.render(t.velocity.write),t.velocity.swap(),s.advection.uniforms.texelSize.value.set(1/this.dyeW,1/this.dyeH),s.advection.uniforms.uVelocity.value=t.velocity.read,s.advection.uniforms.uSource.value=t.density.read,s.advection.uniforms.dissipation.value=re(n.densityDissipation,e),s.advection.render(t.density.write),t.density.swap()}finally{g(this,d,J).call(this)}for(const o of f(this,D))o.armed=!0}render(e=null){g(this,d,Q).call(this);try{this.passes.display.uniforms.uTexture.value=this.fbos.density.read,this.passes.display.render(e)}finally{g(this,d,J).call(this)}}splat(e,t,s,n,o,r,u=e,a=t){const h=f(this,ee).set(e/this.width,1-t/this.height),c=f(this,te).set(u/this.width,1-a/this.height),p=r/200;g(this,d,Q).call(this);try{const v=this.passes.splat;v.uniforms.uTarget.value=this.fbos.velocity.read,v.uniforms.radius.value=p*p,v.uniforms.aspectRatio.value=this.width/this.height,v.uniforms.point.value.copy(h),v.uniforms.prevPoint.value.copy(c),v.uniforms.color.value.set(s,-n,0),v.render(this.fbos.velocity.write),this.fbos.velocity.swap(),v.uniforms.uTarget.value=this.fbos.density.read,v.uniforms.color.value.set(o.r,o.g,o.b),v.render(this.fbos.density.write),this.fbos.density.swap()}finally{g(this,d,J).call(this)}}updateConfig(e,t){this.config[e]=t}get velocityTexture(){return this.fbos.velocity.read}reset(){const e=this.gl.getRenderTarget(),t=new we;this.gl.getClearColor(t);const s=this.gl.getClearAlpha();this.gl.setClearColor(0,0);for(const n of Object.values(this.fbos))this.gl.setRenderTarget(n.write),this.gl.clear(),n.swap(),this.gl.setRenderTarget(n.write),this.gl.clear(),n.swap();this.gl.setRenderTarget(e),this.gl.setClearColor(t,s)}dispose(){for(const e of f(this,D))for(const t of Object.values(e.fbos))t.dispose();T(this,D,[]);for(const e of Object.values(this.fbos))e.dispose();for(const e of Object.values(this.passes))e.dispose()}}D=new WeakMap,ee=new WeakMap,te=new WeakMap,V=new WeakMap,z=new WeakMap,d=new WeakSet,le=function(e){f(this,D).push({fbos:this.fbos,armed:!1}),g(this,d,ue).call(this,e,!1),g(this,d,Ee).call(this)},_e=function(){f(this,D).length!==0&&T(this,D,f(this,D).filter(e=>{if(!e.armed)return!0;for(const t of Object.values(e.fbos))t.dispose();return!1}))},ue=function(e,t=!0){if(this.fbos&&t)for(const h of Object.values(this.fbos))h.dispose();const{simSize:s,dyeSize:n}=this.config;let o=s,r=s,u=n,a=n;e>1?(r=Math.round(s/e),a=Math.round(n/e)):(o=Math.round(s*e),u=Math.round(n*e)),this.fbos={density:new B(u,a,pe),velocity:new B(o,r,pe),divergence:new B(o,r,ne),curl:new B(o,r,ne),pressure:new B(o,r,ne)},this.simW=o,this.simH=r,this.dyeW=u,this.dyeH=a},Ce=function(){const{simSize:e}=this.config,t=()=>({value:new I(1/e,1/e)});this.passes={curl:new L(this.gl,_,Ft,{texelSize:t(),uVelocity:{value:null}}),vorticity:new L(this.gl,_,At,{texelSize:t(),uVelocity:{value:null},uCurl:{value:null},curl:{value:this.config.curl},dt:{value:1/60}}),divergence:new L(this.gl,_,_t,{texelSize:t(),uVelocity:{value:null}}),clear:new L(this.gl,_,Rt,{texelSize:t(),uTexture:{value:null},value:{value:this.config.pressureDissipation}}),pressure:new L(this.gl,_,Et,{texelSize:t(),uPressure:{value:null},uDivergence:{value:null}}),gradientSubtract:new L(this.gl,_,Ct,{texelSize:t(),uPressure:{value:null},uVelocity:{value:null}}),advection:new L(this.gl,_,Mt,{texelSize:t(),uVelocity:{value:null},uSource:{value:null},dt:{value:1/60},dissipation:{value:this.config.velocityDissipation}}),display:new L(this.gl,_,Lt,{texelSize:{value:new I},uTexture:{value:null}}),splat:new L(this.gl,_,Pt,{uTarget:{value:null},aspectRatio:{value:1},point:{value:new I},prevPoint:{value:new I},color:{value:new Xe},radius:{value:(this.config.splatRadius/200)**2}})}},Ee=function(){const e=1/this.simW,t=1/this.simH,s=[this.passes.curl,this.passes.vorticity,this.passes.divergence,this.passes.clear,this.passes.pressure,this.passes.gradientSubtract];for(const n of s)n.uniforms.texelSize.value.set(e,t)},Q=function(){he(this,V)._++===0&&T(this,z,this.gl.getRenderTarget())},J=function(){T(this,V,Math.max(0,f(this,V)-1)),f(this,V)===0&&(this.gl.setRenderTarget(f(this,z)),T(this,z,null))};const Ut=.018,zt=.72,Ot=8,Bt=.02,Ht=.3,Wt=.9,Nt=5,Xt=50,Yt=65,Gt=2,jt=500,qt=1e4;class Zt{constructor(e,t){l(this,"fluid");l(this,"color",new we);l(this,"mouse",{x:0,y:0,px:0,py:0,inside:!1});l(this,"handPointers",new Map);l(this,"handPointerActiveIds",new Set);l(this,"lastActiveAt",0);l(this,"lastStepTime",-1);l(this,"lastScrollPaintStepTime",-1);l(this,"scrollClear",0);l(this,"lastPointerProcessTime",-1);l(this,"lastScrollClearTime",-1);this.fluid=new It(e,t)}configure(e,t){return this.fluid.setTextureSizes(e,t)}resize(e,t){this.fluid.setSize(e,t),this.mouse.inside=!1,this.handPointers.clear()}compileAsync(){return this.fluid.compileAsync()}reset(){this.fluid.reset(),this.mouse.x=0,this.mouse.y=0,this.mouse.px=0,this.mouse.py=0,this.mouse.inside=!1,this.handPointers.clear(),this.handPointerActiveIds.clear(),this.lastActiveAt=0,this.lastStepTime=-1,this.lastScrollPaintStepTime=-1,this.lastPointerProcessTime=-1,this.lastScrollClearTime=-1,this.scrollClear=0}get densityTexture(){return this.fluid.fbos.density.read}get velocityTexture(){return this.fluid.fbos.velocity.read}update(e,t,s,n,o,r){if(this.fluid.updateConfig("curl",s.pointcloud.fluid.curl),r!==this.lastScrollClearTime){this.lastScrollClearTime=r;const h=w.smoothstep(Math.abs(t.scrollVelocity),Bt,Ht);this.scrollClear=w.damp(this.scrollClear,h,Nt,e)}const u=this.scrollClear,a=s.pointcloud.fluid.velocityDissipation;if(this.fluid.updateConfig("velocityDissipation",w.lerp(a,Math.min(a,Wt),u)),this.fluid.updateConfig("densityDissipation",s.pointcloud.fluid.densityDissipation),this.fluid.updateConfig("pressureDissipation",s.pointcloud.fluid.pressure),t.pointerActive||(this.mouse.inside=!1),t.pointerActive&&s.pointcloud.fluid.enabled&&n>0&&o>0&&r!==this.lastPointerProcessTime){this.lastPointerProcessTime=r;const h=t.pointer,c=(h.x*.5+.5)*n,p=(-h.y*.5+.5)*o,v=performance.now(),x=this.mouse.inside&&v-this.lastActiveAt<80;this.mouse.px=x?this.mouse.x:c,this.mouse.py=x?this.mouse.y:p,this.mouse.x=c,this.mouse.y=p,this.mouse.inside=!0,this.lastActiveAt=v;const M=this.mouse.x-this.mouse.px,y=this.mouse.y-this.mouse.py;if(M!==0||y!==0){const m=Math.hypot(M,y)/Math.max(e,1e-4),R=1+(Gt-1)*w.smoothstep(m,jt,qt),S=s.pointcloud.fluid.splatForce*R;this.color.setHSL(r*.1%1,.8,.5),this.fluid.splat(this.mouse.x,this.mouse.y,M*S,y*S,this.color,s.pointcloud.fluid.splatRadius*Xt,this.mouse.px,this.mouse.py)}}return this.paintHandFluidPointers(t,s,n,o,r),this.paintScrollFluidRects(t,s,n,o,r,e),t.transitionRole!=="warmup"&&r!==this.lastStepTime&&(this.lastStepTime=r,bt("cloudTexture.sharedFluid",()=>this.fluid.update(Math.min(e,1/30)))),this.fluid.fbos.velocity.read}paintHandFluidPointers(e,t,s,n,o){const r=e.handFluidPointers;if(!r||r.length===0||e.transitionRole==="warmup"||!t.pointcloud.fluid.enabled||s<=0||n<=0){(!r||r.length===0)&&this.handPointers.clear();return}const u=this.handPointerActiveIds;u.clear();for(const a of r){const h=w.clamp(a.x,0,1)*s,c=w.clamp(a.y,0,1)*n,p=this.handPointers.get(a.id);if(this.handPointers.set(a.id,{x:h,y:c}),u.add(a.id),!p)continue;const v=h-p.x,x=c-p.y;Math.hypot(v,x)<=.001||(this.color.setHSL((o*.11+a.id*.08)%1,.74,.54),this.fluid.splat(h,c,v*t.pointcloud.fluid.splatForce*a.strength*1.35,x*t.pointcloud.fluid.splatForce*a.strength*1.35,this.color,t.pointcloud.fluid.splatRadius*Yt,p.x,p.y))}for(const a of this.handPointers.keys())u.has(a)||this.handPointers.delete(a)}paintScrollFluidRects(e,t,s,n,o,r){const u=e.scrollFluidRects,a=e.scrollVelocity;if(!u||e.transitionRole==="warmup"||!t.pointcloud.fluid.enabled||s<=0||n<=0||o===this.lastScrollPaintStepTime||Math.abs(a)<Ut)return;const h=Math.max(window.innerWidth,1),c=Math.max(window.innerHeight,1),p=e.scrollFluidRectInfluences,v=Math.min(Ot,u.length/4),x=w.clamp(r*60,.25,2),M=w.clamp(a,-1,1)*zt*x;if(!(Math.abs(M)<1e-4)){this.lastScrollPaintStepTime=o,this.color.setHSL((o*.07+.11)%1,.55,.54);for(let y=0;y<v;y++){const m=y*4,R=u[m],S=u[m+1],N=u[m+2],A=u[m+3];if(N<=0||A<=0)continue;const ie=Math.max(0,S),X=Math.min(c,S+A),O=w.clamp((X-ie)/Math.max(A,1),0,1);if(O<=0)continue;const C=Math.max(0,(p==null?void 0:p[y])??1);if(C<=0)continue;const Y=(R+N*.5)/h*s,G=(S+A*.5)/c*n,j=M*C,Pe=Math.sin(o*1.7+y*1.91)*Math.abs(j)*.28,Ae=w.clamp(Math.min(N,A)*.045*(s/h),9,23);this.fluid.splat(Y,G,Pe,-j*O,this.color,Ae)}}}dispose(){this.fluid.dispose()}}const k=new WeakMap;function $t(i,e){const t=k.get(i);if(t)return t.refs++,t.fluid;const s=new Zt(i,e);return k.set(i,{fluid:s,refs:1}),s}function Qt(i,e){if(!i||!e)return;const t=k.get(i);!t||t.fluid!==e||(t.refs--,t.refs<=0&&(k.delete(i),e.dispose()))}function ai({fluid:i,fluidVelocityRef:e,driveFluid:t=!0,scrollVelocity:s=0,motion:n}){const o=me(m=>m.gl),r=me(m=>m.size),u=$e(),a=i.simSize,h=i.dyeSize,c=E.useMemo(()=>$t(o,{simSize:a,dyeSize:h}),[o]);E.useEffect(()=>()=>Qt(o,c),[o,c]),E.useEffect(()=>{c.resize(Math.max(1,r.width),Math.max(1,r.height))},[c,r.height,r.width]);const p=qe(),v=E.useRef(!1);E.useEffect(()=>{if(!p)return;let m=!1;return xt(async()=>{m||(await c.compileAsync(),!m&&(c.update(1/60,{transitionRole:"solo",pointer:{x:0,y:0},pointerActive:!1,scrollVelocity:0},{pointcloud:{fluid:i}},Math.max(1,r.width),Math.max(1,r.height),0),m||(v.current=!0)))},{visibilityAwareWatchdog:!0}).catch(R=>{m||Ze(R,"FluidField.warmup",{...yt(R)})}),()=>{m=!0}},[p,c]);const x=E.useRef(0),M=E.useRef({transitionRole:"solo",pointer:{x:0,y:0},pointerActive:!1,scrollVelocity:0}),y=E.useRef(null);return Ye((m,R)=>{var X,O;const S=((X=n==null?void 0:n.current)==null?void 0:X.transition)??0;if(S<=-1||S>=1){e.current=c.velocityTexture;return}const A=Math.min(R,1/30),ie=S>=0&&S<1;if(t&&ie&&v.current){c.configure(a,h)&&(c.reset(),x.current=0),x.current+=A;const C=M.current;C.pointer.x=u.current.x,C.pointer.y=u.current.y,C.pointerActive=u.current.active;const Y=Ge.getState().preferReducedMotion;C.scrollVelocity=Y?0:((O=n==null?void 0:n.current)==null?void 0:O.scrollVelocity)||s||ht();let G=i;Y&&((!y.current||y.current.src!==i)&&(y.current={src:i,out:{...i,splatForce:i.splatForce*je}}),G=y.current.out);const j=c.update(R,C,{pointcloud:{fluid:G}},Math.max(1,r.width),Math.max(1,r.height),x.current);e.current=j}else e.current=c.velocityTexture}),null}export{ai as F,yt as a,pt as c,xt as e,ht as g,mt as s};
//# sourceMappingURL=FluidField-g3zs99GC.js.map
