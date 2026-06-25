import{j as v}from"./jsx-runtime-D_zvdyIk.js";import{K,t as b,y as oe,X as ne,M as ie,Y as ue,Z as Y,_ as se,R as le,U as ce,L as G,J as $,S as me,e as de,n as fe,v as D,$ as ve,s as pe,u as he}from"./TierResolver-nYYMFDvd.js";import{r as f}from"./chunk-EPOLDU6W-CgSudzSq.js";import{u as xe}from"./constants-D_Mco9k_.js";import{R as ye}from"./reducedMotion-CdiMTSZU.js";import{C as Me,V as ge}from"./colorAndNoise-D12tu5Fy.js";import{u as Te}from"./PlaygroundApp-CQn2WJ-l.js";import{t as _}from"./theatreTypes-D5hqG3JB.js";import{S as X,a as Ee,s as Se}from"./SpatialVideoDemo.theatre-DtkraTCz.js";import"./index-Bb8JjhAW.js";import"./preload-helper-Bc6gya-x.js";import"./BrowserSpecsListener-CHOIQcVy.js";import"./index-Dk1-D4QQ.js";import"./index-CbptNCiK.js";import"./presets-ClUyafeV.js";const we=50,Z=768,Oe=1,Ce=.035,J=64,Fe=`
  out vec3 vLocalPos;
  out vec3 vCameraLocal;
  out vec3 vWorldPos;

  void main() {
    vLocalPos = position;
    vCameraLocal = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Ae=`
  precision highp float;
  precision highp sampler3D;

  uniform sampler3D uVolume;
  uniform float uOpacity;
  uniform float uEdgeWidth;
  uniform float uEdgeOnly;
  uniform float uNearFade;
  uniform float uBrightness;
  uniform vec3 uHsl;
  uniform float uTime;
  uniform vec3 uNoiseScale;
  uniform vec3 uNoiseMovement;
  uniform float uNoiseStrength;
  uniform float uOffset;
  uniform int uOpacityCurve;
  uniform float uFalloff;
  uniform float uIntensity;

  in vec3 vLocalPos;
  in vec3 vCameraLocal;
  in vec3 vWorldPos;
  out vec4 outColor;

${Me}
${ge}

  vec3 animatedUvOffset(vec3 p) {
    if (abs(uNoiseStrength) <= 0.000001) return vec3(0.0);
    vec3 noisePos = p * uNoiseScale + uTime * uNoiseMovement;
    return vec3(
      cnoise(noisePos),
      cnoise(noisePos + vec3(19.19, 7.31, 3.77)),
      cnoise(noisePos + vec3(5.13, 23.17, 11.71))
    ) * uNoiseStrength;
  }

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

  float curveOpacity(float t) {
    float value = 1.0;
    if (uOpacityCurve == 0) {
      value = 1.0 - t * uFalloff;
    } else if (uOpacityCurve == 1) {
      value = exp(-t * uFalloff * 3.0);
    } else if (uOpacityCurve == 2) {
      value = t < uFalloff ? 1.0 : 0.05;
    } else if (uOpacityCurve == 3) {
      value = exp(-pow((t - 0.5) * uFalloff * 3.0, 2.0));
    }
    return clamp(value, 0.02, 1.0) * uIntensity;
  }

  void main() {
    vec3 rayDir = normalize(vLocalPos - vCameraLocal);
    vec2 bounds = hitBox(vCameraLocal, rayDir);
    if (bounds.x > bounds.y) discard;
    bounds.x = max(bounds.x, 0.0);

    float steps = float(${J});
    float dt = (bounds.y - bounds.x) / steps;
    float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 noiseSamplePos = vCameraLocal + rayDir * mix(bounds.x, bounds.y, 0.5);
    vec3 uvOffset = animatedUvOffset(noiseSamplePos + 0.5);

    vec3 accum = vec3(0.0);
    float alpha = 0.0;
    for (int i = 0; i < ${J}; i++) {
      float t = bounds.x + (float(i) + jitter) * dt;
      vec3 p = vCameraLocal + rayDir * t;
      vec3 uvw = clamp(p + 0.5 + uvOffset, vec3(0.001), vec3(0.999));
      float z = fract(uvw.z + uOffset);
      vec4 tex = texture(uVolume, vec3(uvw.x, 1.0 - uvw.y, z));
      float luma = max(max(tex.r, tex.g), tex.b);
      float edgeDist = min(min(uvw.x, 1.0 - uvw.x), min(uvw.y, 1.0 - uvw.y));
      float edge = 1.0 - smoothstep(0.0, uEdgeWidth, edgeDist);
      float edgeMask = mix(1.0, edge, uEdgeOnly);
      float density = smoothstep(0.09, 0.091, luma) * uOpacity * curveOpacity(uvw.z) * edgeMask;
      float a = density / steps;
      accum += applyHsl(tex.rgb, uHsl) * uBrightness * a * (1.0 - alpha);
      alpha += a * (1.0 - alpha);
      if (alpha > 0.96) break;
    }

    float nearFade = smoothstep(0.0, max(0.0001, uNearFade), length(vWorldPos - cameraPosition));
    outColor = vec4(accum * nearFade, alpha * nearFade);
  }
`,V=new Map;function Le({videoUrl:t,position:e=[0,0,0],rotation:r=[0,0,0],scale:a=[1,1,1],offset:o=0,animateOffset:n=0,opacity:u=1,spacing:i=Ce,width:s=Oe,frameCount:l=we,textureMax:c=Z,centerDepth:y=!1,renderOnTop:p=!1,opacityCurve:M="linear",falloff:E=.5,intensity:h=.7,edgeWidth:O=.001,edgeOnly:C=0,nearFade:F=2,brightness:Q=1,hsl:k=[0,0,0],noiseScale:ee=[0,0,0],noiseMovement:te=[0,0,0],noiseStrength:ae=0,blendMode:re="normal",groupRef:T}){const m=f.useMemo(()=>{const x=new K;return x.name="Theatre-positioned spatial video layer",x},[]),g=f.useRef(null),A=f.useRef(0),S=f.useRef(0);f.useEffect(()=>{if(T)return T.current=m,()=>{T.current===m&&(T.current=null)}},[T,m]);const[P,R,N]=e,[I,U,z]=r,[W,B,H]=a;return f.useEffect(()=>{m.position.set(P,R,N),m.rotation.set(b.degToRad(I),b.degToRad(U),b.degToRad(z)),m.scale.set(W,B,H)},[m,P,R,N,I,U,z,W,B,H]),f.useEffect(()=>{var w;const x=++S.current;if((w=g.current)==null||w.dispose(),g.current=null,A.current=0,!!t)return Ie(t,l,c).then(d=>{if(x!==S.current)return;const L=_e(d);g.current=L,m.add(L.group)}).catch(d=>{S.current}),()=>{var d;S.current++,(d=g.current)==null||d.dispose(),g.current=null}},[l,c,m,t]),oe((x,w)=>{const d=g.current;if(!d)return;const j=xe.getState().preferReducedMotion?ye:1;A.current+=n*Math.min(w,1/30)*60*j,Ve(d,{width:s,spacing:i,opacity:u,center:y,renderOnTop:p,blendMode:re,opacityCurve:M,falloff:E,intensity:h,edgeWidth:O,edgeOnly:C,nearFade:F,brightness:Q,hsl:k,noiseScale:ee,noiseMovement:te,noiseStrength:ae,time:x.clock.elapsedTime*j,offset:o+A.current})}),v.jsx("primitive",{object:m})}function be(t){return new de({glslVersion:ve,vertexShader:Fe,fragmentShader:Ae,uniforms:{uVolume:{value:t},uOpacity:{value:.72},uEdgeWidth:{value:.001},uEdgeOnly:{value:0},uNearFade:{value:2},uBrightness:{value:1},uHsl:{value:new D},uTime:{value:0},uNoiseScale:{value:new D},uNoiseMovement:{value:new D},uNoiseStrength:{value:0},uOffset:{value:0},uOpacityCurve:{value:0},uFalloff:{value:.5},uIntensity:{value:.7}},transparent:!0,depthTest:!0,depthWrite:!1,blending:Y,side:fe})}function De(t){const e=new se(t.data,t.width,t.height,t.layerCount);return e.format=le,e.type=ce,e.minFilter=G,e.magFilter=G,e.wrapS=$,e.wrapT=$,e.colorSpace=me,e.unpackAlignment=1,e.needsUpdate=!0,e}function _e(t){const e=new K;e.name="Raymarched spatial video layer";const r=De(t),a=new ne(1,1,1),o=be(r),n=new ie(a,o);return n.name="Raymarched spatial video frames",n.frustumCulled=!1,n.renderOrder=30,e.add(n),{group:e,material:o,mesh:n,texture:r,layerCount:t.layerCount,aspect:t.aspect,dispose:()=>{e.removeFromParent(),a.dispose(),o.dispose(),r.dispose()}}}function Ve(t,e){const r=Math.max(e.width,.001),a=r/Math.max(.001,t.aspect),o=Math.max(e.spacing,e.spacing*Math.max(1,t.layerCount-1));t.group.scale.set(r,a,o),t.group.position.z=e.center?0:-o*.5,t.material.uniforms.uOpacity.value=e.opacity,t.material.uniforms.uEdgeWidth.value=e.edgeWidth,t.material.uniforms.uEdgeOnly.value=e.edgeOnly,t.material.uniforms.uNearFade.value=e.nearFade,t.material.uniforms.uBrightness.value=e.brightness,t.material.uniforms.uHsl.value.fromArray(e.hsl),t.material.uniforms.uNoiseScale.value.fromArray(e.noiseScale),t.material.uniforms.uNoiseMovement.value.fromArray(e.noiseMovement),t.material.uniforms.uNoiseStrength.value=e.noiseStrength,t.material.uniforms.uTime.value=e.time,t.material.uniforms.uOffset.value=Re(e.offset,t.layerCount),t.material.uniforms.uOpacityCurve.value=Pe(e.opacityCurve),t.material.uniforms.uFalloff.value=e.falloff,t.material.uniforms.uIntensity.value=e.intensity;const n=e.blendMode==="additive"?ue:Y,u=!e.renderOnTop,i=!1;(t.material.blending!==n||t.material.depthTest!==u||t.material.depthWrite!==i)&&(t.material.blending=n,t.material.depthTest=u,t.material.depthWrite=i,t.material.needsUpdate=!0),t.mesh.renderOrder=e.renderOnTop?1e3:30}function Pe(t){switch(t){case"expo":return 1;case"step":return 2;case"gauss":return 3;case"flat":return 4;case"linear":default:return 0}}function Re(t,e){return e<=0||!Number.isFinite(t)?0:(t%e+e)%e/e}function Ne(t,e){const r=Math.max(1,Math.min(e,t));return r===1?[0]:Array.from({length:r},(a,o)=>Math.round(o/(r-1)*(t-1)))}async function Ie(t,e,r){const a=Math.max(1,Math.floor(e)),o=Math.max(64,Math.floor(r||Z)),n=`${t}|${a}|${o}`,u=V.get(n);if(u)return u;const i=Ue(t,a,o).catch(s=>{throw V.delete(n),s});return V.set(n,i),i}async function Ue(t,e,r){const a=document.createElement("video");a.crossOrigin="anonymous",a.muted=!0,a.playsInline=!0,a.preload="metadata",a.src=t,a.load();try{if(a.readyState<HTMLMediaElement.HAVE_METADATA&&await q(a,"loadedmetadata"),!Number.isFinite(a.duration)||a.duration<=0)throw new Error("Video does not expose a finite duration");const o=a.videoWidth,n=a.videoHeight;if(!o||!n)throw new Error("Video has no readable dimensions");const u=o/Math.max(1,n),i=Math.min(1,r/Math.max(o,n)),s=Math.max(1,Math.round(o*i)),l=Math.max(1,Math.round(n*i)),c=Ne(e,e),y=new Uint8Array(s*l*4*c.length),p=document.createElement("canvas");p.width=s,p.height=l;const M=p.getContext("2d",{willReadFrequently:!0});if(!M)throw new Error("Could not create 2D canvas context");const E=Math.max(0,a.duration-.001);for(let h=0;h<c.length;h++){const O=c.length===1?E*.5:h/(c.length-1)*E;await ze(a,O),M.clearRect(0,0,s,l),M.drawImage(a,0,0,s,l);const C=M.getImageData(0,0,s,l);y.set(C.data,h*s*l*4),(h&3)===0&&await new Promise(F=>setTimeout(F,0))}return{data:y,width:s,height:l,aspect:u,layerCount:c.length}}finally{a.removeAttribute("src"),a.load(),a.remove()}}function q(t,e){return new Promise((r,a)=>{const o=window.setTimeout(()=>a(new Error(`Timeout waiting for video ${e}`)),1e4),n=()=>{window.clearTimeout(o),t.removeEventListener(e,u),t.removeEventListener("error",i)},u=()=>{n(),r()},i=()=>{n(),a(t.error??new Error(`Video ${e} failed`))};t.addEventListener(e,u,{once:!0}),t.addEventListener("error",i,{once:!0})})}async function ze(t,e){const r=Math.max(0,Math.min(e,Math.max(0,(t.duration||0)-.001)));if(Math.abs(t.currentTime-r)<.002&&t.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA)return;const a=q(t,"seeked");t.currentTime=r,await a}const We=[0,0,-.8];function Be({cameraZ:t}){const e=he(r=>r.camera);return f.useEffect(()=>{e.position.set(0,0,t),e.lookAt(...We)},[e,t]),null}function He({videoUrl:t,cameraZ:e,position:r,rotation:a,scale:o,offset:n,animateOffset:u,opacity:i,spacing:s,edgeOnly:l,nearFade:c,brightness:y,blendMode:p}){return v.jsxs(v.Fragment,{children:[v.jsx("color",{attach:"background",args:["#05060d"]}),v.jsx(Be,{cameraZ:e}),v.jsx(Le,{videoUrl:t,position:r,rotation:a,scale:o,offset:n,animateOffset:u,opacity:i,spacing:s,edgeOnly:l,nearFade:c,brightness:y,blendMode:p})]})}function ot(){var a;const{values:t}=Te("SpatialVideo",Se),e=t??Ee,r=((a=X.find(o=>o.id===e.video))==null?void 0:a.url)??X[0].url;return v.jsx(pe,{flat:!0,camera:{fov:45,near:.1,far:100},children:v.jsx(He,{videoUrl:r,cameraZ:e.cameraZ,position:_(e.position),rotation:_(e.rotation),scale:_(e.scale),offset:e.offset,animateOffset:e.animateOffset,opacity:e.opacity,spacing:e.spacing,edgeOnly:e.edgeOnly,nearFade:e.nearFade,brightness:e.brightness,blendMode:e.blendMode},r)})}export{ot as default};
//# sourceMappingURL=SpatialVideoDemo-C-dfnfE9.js.map
