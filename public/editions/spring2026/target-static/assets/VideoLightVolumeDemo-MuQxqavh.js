import{j as s}from"./jsx-runtime-D_zvdyIk.js";import{s as C,u as F,K as R,X as j,e as P,n as O,Z as g,v as _,$ as k,M as B,Y as U,_ as D,R as H,U as N,L as w,S as z}from"./TierResolver-nYYMFDvd.js";import{r as h}from"./chunk-EPOLDU6W-CgSudzSq.js";import{C as G}from"./colorAndNoise-D12tu5Fy.js";import{u as I}from"./PlaygroundApp-CQn2WJ-l.js";import{v as x,o as $,t as b}from"./theatreTypes-D5hqG3JB.js";import{d as p}from"./index-CbptNCiK.js";import{O as W}from"./OrbitControls-CXLakT_d.js";import"./constants-D_Mco9k_.js";import"./index-Bb8JjhAW.js";import"./preload-helper-Bc6gya-x.js";import"./BrowserSpecsListener-CHOIQcVy.js";import"./index-Dk1-D4QQ.js";import"./presets-ClUyafeV.js";import"./extends-CF3RwP-h.js";const X="/editions/spring2026/target-static/cdn/3a67102bfe57103223-15de67fa52a247e9805165ba4417e3b7.mp4",m={visible:!0,width:.7,depth:3.5,opacity:1.8,brightness:1.25,threshold:.09,softness:.001,blendMode:"normal",steps:96,nearFade:0,position:{x:-.065,y:-.815,z:-.95},rotation:{x:-.149,y:.259,z:-1.502},scale:{x:2.75,y:4.17,z:.31},hsl:{x:0,y:0,z:0}},q={visible:p.types.boolean(m.visible,{label:"Visible"}),width:p.types.number(m.width,{range:[.05,20],nudgeMultiplier:.01}),depth:p.types.number(m.depth,{range:[.01,20],nudgeMultiplier:.01}),opacity:p.types.number(m.opacity,{range:[0,8],nudgeMultiplier:.01}),brightness:p.types.number(m.brightness,{range:[0,8],nudgeMultiplier:.01}),threshold:p.types.number(m.threshold,{range:[0,1],nudgeMultiplier:.001}),softness:p.types.number(m.softness,{range:[.001,1],nudgeMultiplier:.001}),blendMode:p.types.stringLiteral(m.blendMode,$(["normal","additive"]),{as:"menu",label:"Blend Mode"}),steps:p.types.number(m.steps,{range:[8,96],nudgeMultiplier:1}),nearFade:p.types.number(m.nearFade,{range:[0,12],nudgeMultiplier:.1,label:"Near Fade"}),position:x([-.065,-.815,-.95],{range:[-4,4],nudgeMultiplier:.001}),rotation:x([-.149,.259,-1.502],{range:[-Math.PI,Math.PI],nudgeMultiplier:.001}),scale:x([2.75,4.17,.31],{range:[.01,10],nudgeMultiplier:.01}),hsl:x([0,0,0],{range:[-1,1],nudgeMultiplier:.01})},L=50,J=256,E=[0,.15,5.2],T=[0,-.35,-.8];function K(){const t=F(e=>e.camera);return h.useEffect(()=>{t.position.fromArray(E),t.lookAt(...T),t.updateProjectionMatrix()},[t]),null}function Y({sourceUrl:t,settings:e,onStatus:a}){const n=h.useRef(null),r=h.useRef(e),[i,u]=h.useState(null);return r.current=e,h.useEffect(()=>{var o;(o=n.current)==null||o.apply(e)},[e]),h.useEffect(()=>{var v;const o=new AbortController;let d=null;return(v=n.current)==null||v.dispose(),n.current=null,u(null),a(`Extracting ${L} videoLightVolume frames…`),oe(t,L,J,o.signal).then(l=>{const c=ee(l);if(o.signal.aborted){c.dispose();return}d=c,n.current=c,c.apply(r.current),u(c.group),a(`Loaded ${l.layerCount} videoLightVolume frames (${l.width}×${l.height}).`)}).catch(l=>{if(o.signal.aborted)return;const c=l instanceof Error?l.message:String(l);a(`videoLightVolume source error: ${c}`)}),()=>{o.abort(),d==null||d.dispose(),n.current===d&&(n.current=null)}},[a,t]),i?s.jsx("primitive",{object:i}):s.jsx(Z,{settings:e})}function Z({settings:t}){if(!t.visible)return null;const e=16/9;return s.jsx("group",{position:t.position,rotation:t.rotation,scale:[t.scale[0]*t.width,t.scale[1]*(t.width/e),t.scale[2]*t.depth],children:s.jsxs("mesh",{children:[s.jsx("boxGeometry",{args:[1,1,1]}),s.jsx("meshBasicMaterial",{color:"#8fd6ff",wireframe:!0,transparent:!0,opacity:.5})]})})}function Q({sourceUrl:t,settings:e,onStatus:a}){return s.jsxs(s.Fragment,{children:[s.jsx("color",{attach:"background",args:["#05060d"]}),s.jsx(K,{}),s.jsx(W,{makeDefault:!0,target:T}),s.jsx(Y,{sourceUrl:t,settings:e,onStatus:a})]})}function Me(){const{values:t}=I("VideoLightVolume",q),e=t??m,[a,n]=h.useState("Ready to load videoLightVolume."),r=X,i=h.useMemo(()=>({visible:e.visible,width:e.width,depth:e.depth,opacity:e.opacity,brightness:e.brightness,threshold:e.threshold,softness:e.softness,blendMode:e.blendMode,steps:e.steps,nearFade:e.nearFade,position:b(e.position),rotation:b(e.rotation),scale:b(e.scale),hsl:b(e.hsl)}),[e]);return s.jsxs("div",{className:"relative h-full w-full bg-black",children:[s.jsx(C,{camera:{position:E,fov:45,near:.1,far:100},children:s.jsx(Q,{sourceUrl:r,settings:i,onStatus:n})}),s.jsxs("div",{className:"pointer-events-none absolute right-16 bottom-16 max-w-96 rounded-[12px] bg-black/55 px-12 py-10 text-xs leading-snug text-white/80 backdrop-blur-md",children:[s.jsx("div",{className:"font-medium text-white",children:"videoLightVolume"}),s.jsx("div",{children:a}),s.jsx("div",{className:"mt-4 text-white/45",children:"VF Source is temporarily backed by a sample video URL until the VFPlayer source-frame seam is added."})]})]})}function ee(t){const e=new R;e.name="videoLightVolume";const a=te(t),n=t.aspect||t.width/Math.max(1,t.height),r=new j(1,1,1),i=new P({glslVersion:k,vertexShader:`
      out vec3 vLocalPos;
      out vec3 vCameraLocal;
      out vec3 vWorldPos;
      void main() {
        vLocalPos = position;
        vCameraLocal = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      precision highp float;
      precision highp sampler3D;
      uniform sampler3D uVolume;
      uniform float uOpacity;
      uniform float uBrightness;
      uniform float uThreshold;
      uniform float uSoftness;
      uniform float uSteps;
      uniform float uNearFade;
      uniform vec3 uHsl;
      in vec3 vLocalPos;
      in vec3 vCameraLocal;
      in vec3 vWorldPos;
      out vec4 outColor;

${G}

      vec2 hitBox(vec3 orig, vec3 dir) {
        vec3 boxMin = vec3(-0.5);
        vec3 boxMax = vec3(0.5);
        vec3 invDir = 1.0 / dir;
        vec3 tMinTmp = (boxMin - orig) * invDir;
        vec3 tMaxTmp = (boxMax - orig) * invDir;
        vec3 tMin = min(tMinTmp, tMaxTmp);
        vec3 tMax = max(tMinTmp, tMaxTmp);
        float t0 = max(max(tMin.x, tMin.y), tMin.z);
        float t1 = min(min(tMax.x, tMax.y), tMax.z);
        return vec2(t0, t1);
      }

      void main() {
        vec3 rayDir = normalize(vLocalPos - vCameraLocal);
        vec2 bounds = hitBox(vCameraLocal, rayDir);
        if (bounds.x > bounds.y) discard;
        bounds.x = max(bounds.x, 0.0);
        float steps = clamp(uSteps, 8.0, 96.0);
        float dt = (bounds.y - bounds.x) / steps;
        vec3 accum = vec3(0.0);
        float alpha = 0.0;
        for (int i = 0; i < 96; i++) {
          if (float(i) >= steps) break;
          float t = bounds.x + (float(i) + 0.5) * dt;
          vec3 p = vCameraLocal + rayDir * t;
          vec3 uvw = p + 0.5;
          vec4 tex = texture(uVolume, vec3(uvw.x, 1.0 - uvw.y, uvw.z));
          float luma = max(max(tex.r, tex.g), tex.b);
          float density = smoothstep(uThreshold, uThreshold + max(0.0001, uSoftness), luma) * uOpacity;
          float a = density / steps;
          accum += applyHsl(tex.rgb, uHsl) * uBrightness * a * (1.0 - alpha);
          alpha += a * (1.0 - alpha);
          if (alpha > 0.96) break;
        }
        float nearFade = smoothstep(0.0, max(0.0001, uNearFade), length(vWorldPos - cameraPosition));
        outColor = vec4(accum * nearFade, alpha * nearFade);
      }
    `,uniforms:{uVolume:{value:a},uOpacity:{value:1.8},uBrightness:{value:1.25},uThreshold:{value:.09},uSoftness:{value:.001},uSteps:{value:96},uNearFade:{value:0},uHsl:{value:new _}},transparent:!0,depthWrite:!1,depthTest:!1,blending:g,side:O}),u=new B(r,i);return u.name="Raymarched videoLightVolume",u.frustumCulled=!1,e.add(u),{group:e,apply:o=>{e.visible=o.visible,e.position.fromArray(o.position),e.rotation.fromArray(o.rotation),e.scale.set(o.scale[0]*o.width,o.scale[1]*(o.width/Math.max(.001,n)),o.scale[2]*o.depth),u.renderOrder=10,i.blending=o.blendMode==="additive"?U:g,i.uniforms.uOpacity.value=o.opacity,i.uniforms.uBrightness.value=o.brightness,i.uniforms.uThreshold.value=o.threshold,i.uniforms.uSoftness.value=o.softness,i.uniforms.uSteps.value=o.steps,i.uniforms.uNearFade.value=o.nearFade,i.uniforms.uHsl.value.fromArray(o.hsl)},dispose:()=>{e.removeFromParent(),r.dispose(),i.dispose(),a.dispose()}}}function te(t){const e=new D(t.data,t.width,t.height,t.layerCount);return e.format=H,e.type=N,e.minFilter=w,e.magFilter=w,e.colorSpace=z,e.unpackAlignment=1,e.needsUpdate=!0,e}async function oe(t,e,a,n){M(n);const r=document.createElement("video");r.crossOrigin="anonymous",r.muted=!0,r.playsInline=!0,r.preload="metadata";try{if(r.src=t,r.load(),r.readyState<HTMLMediaElement.HAVE_METADATA&&await V(r,"loadedmetadata",n),M(n),!Number.isFinite(r.duration)||r.duration<=0)throw new Error("Video does not expose a finite duration");const i=Math.min(1,a/Math.max(r.videoWidth,r.videoHeight)),u=Math.max(1,Math.round(r.videoWidth*i)),o=Math.max(1,Math.round(r.videoHeight*i)),d=Math.max(1,Math.floor(e)),v=new Uint8Array(u*o*4*d),l=document.createElement("canvas");l.width=u,l.height=o;const c=l.getContext("2d",{willReadFrequently:!0});if(!c)throw new Error("Could not create 2D canvas context");const y=Math.max(0,r.duration-.001);for(let f=0;f<d;f++){const A=d===1?y*.5:f/(d-1)*y;await re(r,A,n),c.clearRect(0,0,u,o),c.drawImage(r,0,0,u,o),v.set(c.getImageData(0,0,u,o).data,f*u*o*4),(f&3)===0&&await new Promise(S=>setTimeout(S,0))}return{data:v,width:u,height:o,layerCount:d,aspect:r.videoWidth/Math.max(1,r.videoHeight)}}finally{r.removeAttribute("src"),r.load()}}async function re(t,e,a){M(a);const n=Math.max(0,Math.min(e,t.duration-.001));if(Math.abs(t.currentTime-n)<.002&&t.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA)return;const r=V(t,"seeked",a);t.currentTime=n,await r}function V(t,e,a){return M(a),new Promise((n,r)=>{const i=()=>{window.clearTimeout(v),t.removeEventListener(e,u),t.removeEventListener("error",o),a==null||a.removeEventListener("abort",d)},u=()=>{i(),n()},o=()=>{var l;i(),r(new Error(((l=t.error)==null?void 0:l.message)||`Video ${e} failed`))},d=()=>{i(),r(new DOMException("videoLightVolume build aborted","AbortError"))},v=window.setTimeout(()=>{i(),r(new Error(`Timed out waiting for video ${e}`))},1e4);t.addEventListener(e,u,{once:!0}),t.addEventListener("error",o,{once:!0}),a==null||a.addEventListener("abort",d,{once:!0})})}function M(t){if(t!=null&&t.aborted)throw new DOMException("videoLightVolume build aborted","AbortError")}export{Me as default};
//# sourceMappingURL=VideoLightVolumeDemo-MuQxqavh.js.map
