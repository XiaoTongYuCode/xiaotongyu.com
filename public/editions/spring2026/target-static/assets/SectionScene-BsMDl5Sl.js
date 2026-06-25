var da=Object.defineProperty;var ha=(t,e,a)=>e in t?da(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var I=(t,e,a)=>ha(t,typeof e!="symbol"?e+"":e,a);import{j as H}from"./jsx-runtime-D_zvdyIk.js";import{r as d}from"./chunk-EPOLDU6W-CgSudzSq.js";import{u as we}from"./constants-D_Mco9k_.js";import{e as Oe,e4 as ga,V as Ie,C as ve,bk as mt,M as He,S as ft,u as Se,y as dt,L as ze,J as We,K as tt,X as pa,n as va,Z as at,v as ce,$ as ea,Y as ht,j as Sa,I as xa,bO as rt,t as L,x as Ne,a0 as Ta,Q as ot,d as Ge,O as nt,D as Ma,R as ba,P as Ca,bJ as ya}from"./TierResolver-nYYMFDvd.js";import{b as Fa}from"./dpr-CTU4OejM.js";import{E as Aa}from"./Environment-mzIMdyjZ.js";import{g as wa,F as Ra}from"./FluidField-g3zs99GC.js";import{c as Ia,e as Rt,r as Ea,d as it,f as st,g as Da,h as Oa,i as ka,P as _a,a as La}from"./SdfRegistry-Dt1Gv0Vq.js";import{R as Ba}from"./reducedMotion-CdiMTSZU.js";import{u as Pa}from"./useStickyMountGate-DkOADX5n.js";import{r as Na}from"./reportError-C0JYu6Sl.js";import{e as Ua,k as Va}from"./ktx2-loader-DbgWIILB.js";import{C as za,V as Wa}from"./colorAndNoise-D12tu5Fy.js";import{s as Pe}from"./sharedZeroTexture-BGkXyl3y.js";import{b as gt,D as Be,A as It,a as Ga,e as Ha,c as ja}from"./sectionModels-BCRoCzB2.js";import{g as ut,m as Qa,j as Et,h as ta,i as pt,k as lt,l as ct,d as Dt,c as Xe,f as Ya}from"./presets-ClUyafeV.js";import{r as Ot,a as Xa,g as $a,h as qa,i as Ka,u as Za,j as aa,S as Ja,b as kt,c as er,D as tr}from"./Camera-BiKH_hhf.js";import{u as ar,C as rr}from"./useCanvasPointer-Bi4-9gKY.js";import{g as _t,c as xe,r as oe,A as or,e as nr,f as ir,h as sr,M as ur,i as lr,j as cr,k as mr}from"./renderScaleResolve-BAuFPf4b.js";import{D as vt,a as fr,M as dr}from"./layers-CClLq2fm.js";import{S as hr}from"./SectionFluidVelocityContext-DHVefnD6.js";const gr=10,pr=.064;function $o(){const{isMobile:t,isLandscapeMobile:e,isTouchDevice:a}=we.getState();return t===!0||e===!0||a===!0}function vr(t,e,a,r=gr){const n=Math.max(0,Math.min(a,pr)),o=1-Math.exp(-n*r);return t+(e-t)*o}const Lt={none:0,linear:1,reinhard:2,cineon:3,aces:4,agx:5,neutral:6},Bt={none:0,solid:1,linear:2},Sr=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,xr=`
  uniform sampler2D tMap;
  uniform sampler2D tOverlay;
  uniform sampler2D tDry;
  uniform float uHasMap;
  uniform float uHasOverlay;
  uniform float uHasDry;
  uniform float uDecodeSRGB;
  uniform int uBackgroundMode;
  uniform vec3 uBackgroundColor1;
  uniform vec3 uBackgroundColor2;
  uniform vec3 uBackgroundColor3;
  uniform float uBackgroundAngle;
  uniform float uBackgroundSmooth;
  uniform float uBackgroundAspect;
  uniform int uBackgroundPointCount;
  uniform float uBackgroundBias1;
  uniform float uBackgroundBias2;
  uniform float uBackgroundDarken;
  uniform float uBackgroundLoadFade;
  uniform float uBehindDarken;
  uniform float uBehindSaturation;
  uniform int uToneMapping;
  uniform float uIntroEnabled;
  uniform float uIntroProgress;
  uniform float uIntroGlowIntensity;
  uniform float uIntroBlendRange;
  uniform float uIntroWarpStrength;
  uniform float uIntroNoiseAmount;
  uniform float uIntroNoiseScale;
  uniform vec2 uIntroCenter;
  uniform vec3 uIntroGlowColor;
  uniform vec3 uIntroBgColor;
  uniform vec2 uIntroResolution;
  varying vec2 vUv;

  // three.js tone-mapping functions (also declares the toneMappingExposure uniform).
  ${ga.tonemapping_pars_fragment}

  vec3 applyToneMapping(vec3 linearColor) {
    if (uToneMapping == 1) return LinearToneMapping(linearColor);
    if (uToneMapping == 2) return ReinhardToneMapping(linearColor);
    if (uToneMapping == 3) return CineonToneMapping(linearColor);
    if (uToneMapping == 4) return ACESFilmicToneMapping(linearColor);
    if (uToneMapping == 5) return AgXToneMapping(linearColor);
    if (uToneMapping == 6) return NeutralToneMapping(linearColor);
    return linearColor;
  }

  vec3 sRGBToLinear(vec3 c) {
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
  }

  vec3 linearToSRGB(vec3 c) {
    c = max(c, vec3(0.0));
    return mix(
      c * 12.92,
      1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055,
      step(0.0031308, c)
    );
  }

  float gradientMix(float position, float bias) {
    float center = clamp(0.5 + bias, 0.0, 1.0);
    float halfSmooth = clamp(uBackgroundSmooth, 0.0, 100.0) / 200.0;
    float start = center - halfSmooth;
    float end = center + halfSmooth;
    if (halfSmooth <= 0.0001) return step(center, position);
    return smoothstep(start, end, position);
  }

  float linearGradientPosition(vec2 uv) {
    float radiansAngle = radians(uBackgroundAngle);
    vec2 direction = vec2(sin(radiansAngle), cos(radiansAngle));
    vec2 aspectUv = (uv - 0.5) * vec2(uBackgroundAspect, 1.0);
    float extent = abs(direction.x) * uBackgroundAspect + abs(direction.y);
    return dot(aspectUv, direction) / extent + 0.5;
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += valueNoise(p) * amp;
      p *= 2.03;
      amp *= 0.5;
    }
    return value;
  }

  float introRadialMask(vec2 uv) {
    if (uIntroEnabled < 0.5 || uIntroProgress >= 1.0) return 1.0;

    float progress = clamp(uIntroProgress, 0.0, 1.0);
    if (progress <= 0.0) return 0.0;
    float aspect = uIntroResolution.x / max(uIntroResolution.y, 1.0);
    vec2 center = clamp(uIntroCenter, vec2(0.0), vec2(1.0));
    vec2 dv = (uv - center) * vec2(aspect, 1.0);
    float radial = length(dv);

    // Same center-out mask shape as the hero handoff radial transition: the
    // authored center lives in screen UV, while X is aspect-corrected so the
    // reveal stays circular in viewport space.
    vec2 farCorner = max(center, 1.0 - center) * vec2(aspect, 1.0);
    float maxRadius = length(farCorner);
    float feather = max(uIntroBlendRange / max(uIntroResolution.y, 1.0), 0.001);
    float noiseAmount = max(uIntroNoiseAmount, 0.0) / max(uIntroResolution.y, 1.0);
    float noise = fbm(dv * max(uIntroNoiseScale, 0.001) + progress * 0.65) * 2.0 - 1.0;
    float noisyRadial = radial + noise * noiseAmount;
    float radialEdge = progress * (maxRadius + feather * 2.0) - feather;
    return 1.0 - smoothstep(
      radialEdge - feather,
      radialEdge + feather,
      noisyRadial
    );
  }

  vec2 introWarpUv(vec2 uv, float mask) {
    if (uIntroEnabled < 0.5 || uIntroProgress >= 1.0) return uv;

    float progress = clamp(uIntroProgress, 0.0, 1.0);
    float aspect = uIntroResolution.x / max(uIntroResolution.y, 1.0);
    vec2 center = clamp(uIntroCenter, vec2(0.0), vec2(1.0));
    vec2 dv = (uv - center) * vec2(aspect, 1.0);
    float radial = length(dv);
    vec2 radialDirection = radial > 0.0001
      ? normalize(vec2(dv.x / max(aspect, 0.001), dv.y))
      : vec2(0.0, 1.0);
    vec2 tangent = vec2(-radialDirection.y, radialDirection.x);

    float seam = 1.0 - abs(mask * 2.0 - 1.0);
    float life = sin(clamp(progress, 0.0, 1.0) * 3.14159265);
    float ripple = sin(radial * 42.0 - progress * 12.0) * seam;
    vec2 radialWarp = radialDirection * uIntroWarpStrength * seam * life * 0.12;
    vec2 tangentWarp = tangent * ripple * uIntroWarpStrength * life * 0.018;
    return uv + radialWarp + tangentWarp;
  }

  vec3 applyRadialIntroReveal(vec3 inputColor, float mask) {
    if (uIntroEnabled < 0.5 || uIntroProgress >= 1.0) return inputColor;

    float edge = 1.0 - abs(mask * 2.0 - 1.0);
    vec3 finalColor = mix(uIntroBgColor, inputColor, mask);
    return mix(
      finalColor,
      uIntroGlowColor,
      edge * max(uIntroGlowIntensity, 0.0) * 0.35
    );
  }

  vec3 backgroundColor(vec2 uv) {
    if (uBackgroundMode == 1) return uBackgroundColor1; // solid uses color 1

    float position = linearGradientPosition(uv);
    if (uBackgroundPointCount < 3) {
      return mix(
        uBackgroundColor1,
        uBackgroundColor3,
        gradientMix(position, uBackgroundBias1)
      );
    }

    if (position < 0.5) {
      return mix(
        uBackgroundColor1,
        uBackgroundColor2,
        gradientMix(position * 2.0, uBackgroundBias1)
      );
    }

    return mix(
      uBackgroundColor2,
      uBackgroundColor3,
      gradientMix((position - 0.5) * 2.0, uBackgroundBias2)
    );
  }

  void main() {
    float introMask = introRadialMask(vUv);
    vec2 introUv = introWarpUv(vUv, introMask);
    vec4 color = uHasMap > 0.5 ? texture2D(tMap, introUv) : vec4(0.0);
    vec4 overlay = uHasOverlay > 0.5 ? texture2D(tOverlay, introUv) : vec4(0.0);
    vec4 dry = uHasDry > 0.5 ? texture2D(tDry, introUv) : vec4(0.0);
    // Composite the whole section in gamma/sRGB space — the LDR look designers
    // chose (the original direct-to-sRGB-canvas playground). The scene texture
    // is already display-referred, so it is used as-is; only the linear
    // gradient is encoded to sit in the same space before blending.
    if (uBackgroundMode > 0) {
      vec3 bg = linearToSRGB(backgroundColor(vUv));
      bg *= 1.0 - clamp(uBackgroundDarken, 0.0, 1.0);
      // Fade the gradient in alongside the section's video light volume:
      // until the volume is mounted the gradient sits at 5% so a
      // freshly-arrived (still-decoding) section never flashes the full
      // gradient on its own. 1 = fully shown.
      bg *= mix(0.05, 1.0, clamp(uBackgroundLoadFade, 0.0, 1.0));
      color.rgb = mix(bg, color.rgb, color.a);
      color.a = 1.0;
    }
    color.rgb += overlay.rgb;
    color.a = max(color.a, overlay.a);
    // "Behind page content" tune-down: desaturate then darken the whole
    // section output so it stops competing with the foreground.
    float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(vec3(luma), color.rgb, uBehindSaturation);
    color.rgb *= (1.0 - uBehindDarken);
    // Tone map in linear space. The composite above is in gamma/sRGB space, so
    // decode to linear, apply the three.js curve (which applies the
    // toneMappingExposure uniform internally), then re-encode to gamma before
    // the LDR clamp below.
    if (uToneMapping > 0) {
      vec3 lin = sRGBToLinear(color.rgb);
      lin = applyToneMapping(lin);
      color.rgb = linearToSRGB(lin);
    }
    // Composite the dry layer over the tone-mapped, tuned-down main layer. The
    // dry layer is post-exempt, so it lands after tone mapping — but still
    // inside the section image, so host transition + knockout passes shape and
    // clip it.
    color.rgb = dry.rgb + color.rgb * (1.0 - dry.a);
    color.a = dry.a + color.a * (1.0 - dry.a);
    color.rgb = applyRadialIntroReveal(color.rgb, introMask);
    // LDR clamp: a direct 8-bit sRGB write would clamp here; mirror that so
    // additive highlights don't blow past white.
    color.rgb = clamp(color.rgb, 0.0, 1.0);
    // The HalfFloat composer re-encodes linear→sRGB on output, so decode the
    // gamma-domain result back to linear first — the round-trip reproduces
    // this composite pixel-for-pixel. A direct sRGB canvas target (uDecodeSRGB
    // == 0) isn't re-encoded, so it takes the value as-is.
    if (uDecodeSRGB > 0.5) color.rgb = sRGBToLinear(color.rgb);
    gl_FragColor = color;
  }
`,X={enabled:!1,progress:1,glowIntensity:2,feather:48,warpStrength:.35,noiseAmount:18,noiseScale:4,center:{x:.5,y:.58},glowColor:{r:1,g:.4,b:.1,a:1},bgColor:{r:.012,g:.118,b:.114,a:1}};function Tr(t,e,a,r,n,o,f){const s=e.current,i=new Oe({uniforms:{tMap:{value:null},tOverlay:{value:null},tDry:{value:null},uHasMap:{value:0},uHasOverlay:{value:0},uHasDry:{value:0},uDecodeSRGB:{value:0},uBackgroundMode:{value:Bt[s.mode]},uBackgroundColor1:{value:new ve(s.color1)},uBackgroundColor2:{value:new ve(s.color2)},uBackgroundColor3:{value:new ve(s.color3)},uBackgroundAngle:{value:s.angle},uBackgroundSmooth:{value:s.smooth},uBackgroundAspect:{value:1},uBackgroundPointCount:{value:s.pointCount},uBackgroundBias1:{value:s.bias1},uBackgroundBias2:{value:s.bias2},uBackgroundDarken:{value:s.darken},uBackgroundLoadFade:{value:1},uBehindDarken:{value:0},uBehindSaturation:{value:1},uToneMapping:{value:Lt[s.toneMapping]},toneMappingExposure:{value:s.toneMappingExposure},uIntroEnabled:{value:X.enabled?1:0},uIntroProgress:{value:X.progress},uIntroGlowIntensity:{value:X.glowIntensity},uIntroBlendRange:{value:X.feather},uIntroWarpStrength:{value:X.warpStrength},uIntroNoiseAmount:{value:X.noiseAmount},uIntroNoiseScale:{value:X.noiseScale},uIntroCenter:{value:new Ie(X.center.x,X.center.y)},uIntroGlowColor:{value:new ve(X.glowColor.r,X.glowColor.g,X.glowColor.b)},uIntroBgColor:{value:new ve(X.bgColor.r,X.bgColor.g,X.bgColor.b)},uIntroResolution:{value:new Ie(1,1)}},depthTest:!1,depthWrite:!1,vertexShader:Sr,fragmentShader:xr}),u=new mt(2,2),v=new He(u,i);let b=s.color1,m=s.color2,x=s.color3;const y=new Ie(1,1);return v.frustumCulled=!1,v.onBeforeRender=C=>{var $;const D=t.current,E=(a==null?void 0:a.current)??null,O=(r==null?void 0:r.current)??null,h=e.current;i.uniforms.tMap.value=D,i.uniforms.tOverlay.value=E,i.uniforms.tDry.value=O,i.uniforms.uHasMap.value=D?1:0,i.uniforms.uHasOverlay.value=E?1:0,i.uniforms.uHasDry.value=O?1:0,i.uniforms.uBackgroundMode.value=Bt[h.mode],h.color1!==b&&(i.uniforms.uBackgroundColor1.value.set(h.color1),b=h.color1),h.color2!==m&&(i.uniforms.uBackgroundColor2.value.set(h.color2),m=h.color2),h.color3!==x&&(i.uniforms.uBackgroundColor3.value.set(h.color3),x=h.color3),i.uniforms.uBackgroundAngle.value=h.angle,i.uniforms.uBackgroundSmooth.value=h.smooth,i.uniforms.uToneMapping.value=Lt[h.toneMapping],i.uniforms.toneMappingExposure.value=h.toneMappingExposure,C.getSize(y),i.uniforms.uBackgroundAspect.value=y.x/y.y,i.uniforms.uIntroResolution.value.copy(y);const M=(o==null?void 0:o.current)??X;i.uniforms.uIntroEnabled.value=M.enabled?1:0,i.uniforms.uIntroProgress.value=M.progress,i.uniforms.uIntroGlowIntensity.value=M.glowIntensity,i.uniforms.uIntroBlendRange.value=M.feather??X.feather,i.uniforms.uIntroWarpStrength.value=M.warpStrength??X.warpStrength,i.uniforms.uIntroNoiseAmount.value=M.noiseAmount??X.noiseAmount,i.uniforms.uIntroNoiseScale.value=M.noiseScale??X.noiseScale,i.uniforms.uIntroCenter.value.set(M.center.x,M.center.y),i.uniforms.uIntroGlowColor.value.setRGB(M.glowColor.r,M.glowColor.g,M.glowColor.b),i.uniforms.uIntroBgColor.value.setRGB(M.bgColor.r,M.bgColor.g,M.bgColor.b),i.uniforms.uBackgroundPointCount.value=h.pointCount,i.uniforms.uBackgroundBias1.value=h.bias1,i.uniforms.uBackgroundBias2.value=h.bias2,i.uniforms.uBackgroundDarken.value=h.darken,i.uniforms.uBackgroundLoadFade.value=(f==null?void 0:f.current)??1;const k=C.getRenderTarget();if(i.uniforms.uDecodeSRGB.value=k&&k.texture.colorSpace!==ft?1:0,n){const ee=gt((($=n.motionRef.current)==null?void 0:$.screenOffset)??0),w=n.paramsRef.current;i.uniforms.uBehindDarken.value=ee*((w==null?void 0:w.darken)??0),i.uniforms.uBehindSaturation.value=1-ee*(1-((w==null?void 0:w.saturation)??1))}},{mesh:v,material:i,dispose(){u.dispose(),i.dispose()}}}function St(t){return t<=-1||t>=1}function ra(t,e){const a=t??e;return[Number.isFinite(a[0])?a[0]:e[0],Number.isFinite(a[1])?a[1]:e[1]]}function Mr(t,e){const[a,r]=ra(t,e),n=Math.min(a,r),o=Math.max(n+1e-4,a,r);return[n,o]}const br=1.2;function Pt(){const t=we.getState();return t.preferReducedMotion===!0||t.isMobile!==!0}const oa=.001,Cr=.04,yr=.025,Fr=ta.toFixed(1),Ar=pt.toFixed(1),wr=String(pt),Rr=5.208,Ir=50,Er=1,Dr=.035,Nt=new xa,Ut=6,Vt={"/editions/spring2026/target-static/cdn/3a67102bfe57103223-15de67fa52a247e9805165ba4417e3b7.mp4":{src:"/editions/spring2026/target-static/cdn/fcc0bfaf330c4ab755-video1-50f-360p.ktx2",duration:5.9388,width:640,height:360,layerCount:50},"/editions/spring2026/target-static/cdn/51a2364d667a65adb0-c2ffb10c9eeb46a4a36b562d482d3988.mp4":{src:"/editions/spring2026/target-static/cdn/a806bd1a62cec78064-video2-50f-360p.ktx2",duration:5.208,width:476,height:360,layerCount:50},"/editions/spring2026/target-static/cdn/446d72a6f0db029311-33de6200b962468fa7b58e50836eb729.mp4":{src:"/editions/spring2026/target-static/cdn/4ae5a37e0537292fa6-video3-50f-360p.ktx2",duration:5.208,width:200,height:360,layerCount:50},"/editions/spring2026/target-static/cdn/a7526c4dddc0f49510-4396d38b5ba744f8aab63ed520071bd6.mp4":{src:"/editions/spring2026/target-static/cdn/bb486f68cfbcc8d365-video4-50f-360p.ktx2",duration:5.208,width:476,height:360,layerCount:50}},zt=new Set;function Or(t,e,a){const r=e instanceof Error?e.message:String(e),n=`${t}:${r}`;if(zt.has(n))return;zt.add(n);const o=Da(e);Na(e,"VideoLightVolume.source",{...a,...o,sourceUrl:t,...Oa()})}function xt(t){const e=t.search(/[?#]/);return e===-1?t:t.slice(0,e)}function kr(t,e){try{const a=new URL(t,"https://example.com").searchParams;for(const r of e){const n=Number(a.get(r));if(Number.isFinite(n)&&n>0)return n}}catch{}return null}function _r(t){const e=xt(t).match(/(?:^|[-_])(\d+)f(?:[-_.]|$)/i),a=e?Number(e[1]):NaN;return Number.isFinite(a)&&a>0?a:Ir}function Lr(t){return kr(t,["duration","d"])??Rr}function Wt(t){return/\.ktx2$/i.test(xt(t))?{src:t,duration:Lr(t),layerCount:_r(t)}:null}function na(t,e){if(e){const o=Wt(e);if(o)return o}const a=xt(t),r=Vt[t];if(r)return r;const n=a===t?null:Vt[a]??null;return n||Wt(t)}function ia(t){const e=t;return e.isCompressedArrayTexture===!0||e.isDataArrayTexture===!0}function Br(t){return t==="low"?.5:t==="medium"?.7:1}function Pr(t,e){const a=Number.isFinite(t)?t:ut;return Math.max(ta,Math.min(pt,Math.round(a*e)))}function Gt({sourceUrl:t,ktx2Url:e,depthMapUrl:a,settings:r,groupRef:n,behindSpeed:o=1,quality:f,motion:s,fluidVelocityRef:i,timeScale:u=1,externalLoadFadeRef:v}){const b=Se(w=>w.gl),m=d.useRef(null),x=d.useRef(r),[y,C]=d.useState(null);x.current=r;const D=Br(f),E=d.useRef(D);E.current=D,d.useEffect(()=>{var w;(w=m.current)==null||w.apply(r,D)},[r,D]);const O=d.useRef(0),h=d.useRef(null),M=d.useRef(0),k=d.useRef(null),$=d.useRef(!1);dt(w=>{var j,z,Q,g;const T=w.clock.elapsedTime,l=h.current===null?0:Math.max(0,T-h.current);h.current=T;const p=St(((j=s==null?void 0:s.current)==null?void 0:j.transition)??0),F=m.current;if(F&&(k.current!==F&&(k.current=F,M.current=0),!p&&M.current<1&&(M.current=Ia(M.current,l,{durationSeconds:br,offscreen:p,reducedMotion:Pt()}),F.setLoadFade(Rt(M.current)))),v&&(v.current=$.current?1:y?Rt(M.current):0),p)return;const A=((z=s==null?void 0:s.current)==null?void 0:z.screenOffset)??0,R=1-gt(A)*(1-o),q=we.getState().preferReducedMotion?Ba:1;O.current+=l*R*q*u,(g=m.current)==null||g.setTime(O.current,(i==null?void 0:i.current)??null,((Q=s==null?void 0:s.current)==null?void 0:Q.scrollVelocity)??0)});const ee=Pa();return d.useEffect(()=>{var F;if(!ee)return;a!=null&&a.trim()||Ua(b);const w=new AbortController;let T=null;const l=performance.now(),p=a!=null&&a.trim()?null:na(t,e);return(F=m.current)==null||F.dispose(),m.current=null,$.current=!1,C(null),Nr(t,e,a,w.signal).then(A=>{const R=zr(A);if(w.signal.aborted){R.dispose();return}T=R,m.current=R,R.apply(x.current,E.current),R.setLoadFade(Pt()?1:0),n&&(n.current=R.group),C(R.group)}).catch(A=>{if(w.signal.aborted)return;$.current=!0,v&&(v.current=1);const R=(a==null?void 0:a.trim())||(p==null?void 0:p.src)||e||t;Or(R,A,{originalSourceUrl:t,loadUrl:R,ktx2Url:(p==null?void 0:p.src)??e,depthMapUrl:a,phase:a!=null&&a.trim()?"depth-map-load":"ktx2-load",elapsedMs:Ea(l),width:p==null?void 0:p.width,height:p==null?void 0:p.height,layerCount:p==null?void 0:p.layerCount})}),()=>{w.abort(),n&&n.current===(T==null?void 0:T.group)&&(n.current=null),T==null||T.dispose(),m.current===T&&(m.current=null)}},[a,b,n,e,t,ee,v]),y?H.jsx("primitive",{object:y}):null}async function Nr(t,e,a,r){const n=a==null?void 0:a.trim();if(n)return Vr(t,n,r);const o=na(t,e);if(!o)throw new Error(`[VideoLightVolume] Missing KTX2 volume for ${t}. Pass ktx2Url or use a .ktx2 source URL.`);const f=await it(()=>Va.loadAsync(o.src),{signal:r}).catch(s=>{throw st(s instanceof Error?s:new Error(String(s)),{sourceUrl:t,loadUrl:o.src,ktx2Url:o.src,phase:"ktx2-load",width:o.width,height:o.height,layerCount:o.layerCount})});try{if(r.aborted)throw new DOMException("KTX2 load aborted","AbortError");if(f.colorSpace=ft,f.minFilter=ze,f.magFilter=ze,f.wrapS=We,f.wrapT=We,!ia(f))throw new Error(`[VideoLightVolume] Expected ${o.src} to load as a KTX2 array texture.`);const s=f.image,i=s.width??o.width,u=s.height??o.height;if(!i||!u)throw new Error(`[VideoLightVolume] KTX2 texture dimensions missing for ${o.src}.`);const v=s.depth??o.layerCount;return{texture:f,width:i,height:u,layerCount:v,aspect:i/Math.max(1,u),duration:Math.max(oa,o.duration)}}catch(s){throw f.dispose(),s}}function Ur(t){const e=t.image,a=(e==null?void 0:e.width)||(e==null?void 0:e.naturalWidth),r=(e==null?void 0:e.height)||(e==null?void 0:e.naturalHeight);return a&&r?{width:a,height:r}:null}async function Vr(t,e,a){const r=it(()=>Nt.loadAsync(t),{signal:a}).catch(s=>{throw st(s instanceof Error?s:new Error(String(s)),{sourceUrl:t,loadUrl:t,depthMapUrl:e,phase:"depth-map-source-load"})}),n=it(()=>Nt.loadAsync(e),{signal:a}).catch(s=>{throw st(s instanceof Error?s:new Error(String(s)),{sourceUrl:t,loadUrl:e,depthMapUrl:e,phase:"depth-map-depth-load"})});r.catch(()=>{n.then(s=>s.dispose()).catch(()=>{})}),n.catch(()=>{r.then(s=>s.dispose()).catch(()=>{})});const[o,f]=await Promise.all([r,n]);try{if(a.aborted)throw new DOMException("depth map load aborted","AbortError");o.colorSpace=ft,f.colorSpace=Sa;for(const i of[o,f])i.minFilter=ze,i.magFilter=ze,i.wrapS=We,i.wrapT=We,i.flipY=!1;const s=Ur(o);if(!s)throw new Error(`[VideoLightVolume] Source image dimensions missing for ${t}.`);return{texture:o,depthTexture:f,width:s.width,height:s.height,layerCount:1,aspect:s.width/Math.max(1,s.height),duration:Er}}catch(s){throw o.dispose(),f.dispose(),s}}function zr(t){const e=new tt;e.name="videoLightVolume";const a=t.texture,r=t.depthTexture,n=t.aspect,o=r!==void 0,f=!o&&ia(a),s=o?"sampler2D":f?"sampler2DArray":"sampler3D",i=new pa(1,1,1),u=new Oe({glslVersion:ea,vertexShader:`
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
      precision highp ${s};
      uniform ${s} uVolume;
      ${o?"uniform sampler2D uDepthMap;":""}
      uniform float uOpacity;
      uniform float uBrightness;
      uniform float uThreshold;
      uniform float uSoftness;
      uniform float uEdgeFade;
      uniform float uLoopCount;
      uniform float uGridTimeOffset;
      uniform float uGridOpacity;
      uniform float uNearFade;
      uniform float uRaymarchSteps;
      uniform float uLayerCount;
      uniform float uScrubOffset;
      uniform vec3 uCenterFade;
      uniform vec3 uHsl;
      uniform float uTime;
      uniform vec3 uNoiseScale;
      uniform vec3 uNoiseMovement;
      uniform float uNoiseStrength;
      uniform float uLoadFade;
      in vec3 vLocalPos;
      in vec3 vCameraLocal;
      in vec3 vWorldPos;
      out vec4 outColor;

${za}
${Wa}

      vec3 animatedUvOffset(vec3 p) {
        if (abs(uNoiseStrength) <= 0.000001) return vec3(0.0);
        vec3 noisePos = p * uNoiseScale + uTime * uNoiseMovement;
        return vec3(
          cnoise(noisePos),
          cnoise(noisePos + vec3(19.19, 7.31, 3.77)),
          cnoise(noisePos + vec3(5.13, 23.17, 11.71))
        ) * uNoiseStrength;
      }

      vec4 sampleVolume(${s} tex, vec3 uvw) {
        ${o?`
        vec4 image = texture(tex, uvw.xy);
        float depthLimit = clamp(texture(uDepthMap, uvw.xy).r, 0.0, 1.0);
        float z = clamp(uvw.z, 0.0, 1.0);
        float thickness = max(${Dr.toFixed(3)}, 1.0 / max(uRaymarchSteps, 1.0));
        float frontMask = smoothstep(0.0, thickness, z);
        float backMask = depthLimit >= 0.999 ? 1.0 : 1.0 - smoothstep(depthLimit, min(depthLimit + thickness, 1.0), z);
        image.a *= clamp(frontMask * backMask, 0.0, 1.0);
        return image;
        `:f?`
        float layerCount = max(1.0, uLayerCount);
        float layerPos = clamp(uvw.z, 0.0, 0.999999) * max(0.0, layerCount - 1.0);
        float layer0 = floor(layerPos);
        float layer1 = min(layer0 + 1.0, layerCount - 1.0);
        float mixLayer = fract(layerPos);
        return mix(
          texture(tex, vec3(uvw.xy, layer0)),
          texture(tex, vec3(uvw.xy, layer1)),
          mixLayer
        );
        `:`
        return texture(tex, uvw);
        `}
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

      void main() {
        vec3 rayDir = normalize(vLocalPos - vCameraLocal);
        vec2 bounds = hitBox(vCameraLocal, rayDir);
        if (bounds.x > bounds.y) discard;
        bounds.x = max(bounds.x, 0.0);
        // Defensive clamp mirrors the JS uniform clamp so malformed live edits
        // cannot exceed the shader's static loop bound.
        float steps = clamp(uRaymarchSteps, ${Fr}, ${Ar});
        float dt = (bounds.y - bounds.x) / steps;
        float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        vec3 noiseSamplePos = vCameraLocal + rayDir * mix(bounds.x, bounds.y, 0.5);
        vec3 uvOffset = animatedUvOffset(noiseSamplePos + 0.5);
        vec3 accum = vec3(0.0);
        float alpha = 0.0;
        for (int i = 0; i < ${wr}; i++) {
          if (float(i) >= steps) break;
          float t = bounds.x + (float(i) + jitter) * dt;
          vec3 p = vCameraLocal + rayDir * t;
          float rayDepth01 = clamp((t - bounds.x) / max(bounds.y - bounds.x, 0.0001), 0.0, 1.0);
          vec3 rawUvw = p + 0.5 + uvOffset;
          float sideDistance = min(min(rawUvw.x, 1.0 - rawUvw.x), min(rawUvw.y, 1.0 - rawUvw.y));
          float edgeFade = max(uEdgeFade, 0.0);
          float sideMask = edgeFade > 0.0001 ? smoothstep(0.0, edgeFade, sideDistance) : 1.0;
          float sideFeatherDepth = 1.0 - smoothstep(0.25, 0.85, rayDepth01);
          float sideFeather = mix(1.0, sideMask, sideFeatherDepth);
          vec3 uvw = clamp(rawUvw, vec3(0.001), vec3(0.999));
          float z = ${o?"uvw.z":"fract(uvw.z * max(0.0, uLoopCount) + uScrubOffset + uGridTimeOffset)"};
          vec4 tex = sampleVolume(uVolume, vec3(uvw.x, 1.0 - uvw.y, z));
          float centerFade = smoothstep(uCenterFade.x, uCenterFade.y, abs(uvw.z - 0.5));
          centerFade = mix(1.0, centerFade, clamp(uCenterFade.z, 0.0, 1.0));
          float luma = max(max(tex.r, tex.g), tex.b);
          float density = smoothstep(uThreshold, uThreshold + max(0.0001, uSoftness), luma) * tex.a * centerFade * uOpacity * sideFeather * uGridOpacity;
          float a = density / steps;
          accum += applyHsl(tex.rgb, uHsl) * uBrightness * a * (1.0 - alpha);
          alpha += a * (1.0 - alpha);
          if (alpha > 0.96) break;
        }
        float nearFade = smoothstep(0.0, max(0.0001, uNearFade), length(vWorldPos - cameraPosition));
        outColor = vec4(accum * nearFade, alpha * nearFade) * uLoadFade;
      }
    `,uniforms:{uVolume:{value:a},uDepthMap:{value:r??a},uOpacity:{value:1.8},uBrightness:{value:1.25},uThreshold:{value:.09},uSoftness:{value:.001},uEdgeFade:{value:.06},uLoopCount:{value:1},uGridTimeOffset:{value:0},uGridOpacity:{value:1},uNearFade:{value:0},uRaymarchSteps:{value:ut},uLayerCount:{value:t.layerCount},uScrubOffset:{value:0},uCenterFade:{value:new ce(...Qa)},uHsl:{value:new ce},uTime:{value:0},uNoiseScale:{value:new ce},uNoiseMovement:{value:new ce},uNoiseStrength:{value:0},uLoadFade:{value:1}},transparent:!0,depthWrite:!1,depthTest:!1,blending:at,side:va}),v=[u],b=[null],m=l=>{for(const p of v)l(p);for(const p of b)p&&l(p)},x=l=>{const p=new He(i,l);return p.name="Raymarched videoLightVolume",p.frustumCulled=!1,p},y=x(u),C=[y];e.add(y);const D=l=>{for(;C.length<l;){const p=u.clone();v.push(p),b.push(null);const F=x(p);C.push(F),e.add(F)}for(;C.length>l;){const p=C.pop();p==null||p.removeFromParent();const F=v.pop(),A=b.pop();F==null||F.dispose(),A==null||A.dispose()}},E=l=>(b[l]||(b[l]=Wr(v[l],a,s)),b[l]),O=new ce(1,1,1),h=()=>{e.updateWorldMatrix(!0,!1),e.getWorldScale(O);const l=Math.max(Math.abs(O.x),1e-4),p=Math.max(Math.abs(O.y),1e-4),F=Math.max(Math.abs(O.z),1e-4);m(A=>{A.uniforms.uFluidWorldScale&&A.uniforms.uFluidWorldScale.value.set(l,p,F)})},M=Math.max(oa,t.duration);let k=Et,$=0,ee=ut,w=null,T=0;return{group:e,apply:(l,p=1)=>{var B,me,J,V,P;e.name=`videoLightVolume:${l.source}`,e.userData.videoLightLayer=l.layer,e.visible=l.visible&&l.opacity>1e-4,e.position.fromArray(l.position),e.rotation.fromArray(l.rotation),e.scale.set(l.scale[0]*l.width,l.scale[1]*(l.width/Math.max(.001,n)),l.scale[2]*l.depth);const F=((B=l.grid)==null?void 0:B.enabled)===!0,A=F?Math.max(1,Math.min(Ut,Math.round(l.grid.columns||1))):1,R=F?Math.max(1,Math.min(Ut,Math.round(l.grid.rows||1))):1,q=Number.isFinite((J=(me=l.grid)==null?void 0:me.spacing)==null?void 0:J[0])?l.grid.spacing[0]:1.1,j=Number.isFinite((P=(V=l.grid)==null?void 0:V.spacing)==null?void 0:P[1])?l.grid.spacing[1]:1.1,z=F?Math.max(0,l.grid.randomTimeOffset||0):0,Q=F?Math.max(0,Math.min(1,l.grid.outerOpacity??1)):1,g=Math.floor((A-1)*.5),ie=Math.floor((R-1)*.5),he=Math.max(g,A-1-g,ie,R-1-ie,1);D(A*R);for(let c=0;c<C.length;c++){const G=c%A,ge=Math.floor(c/A),Ce=Math.max(Math.abs(G-g),Math.abs(ge-ie))/he,ne=G===g&&ge===ie,fe=Math.sin((c+1)*12.9898+A*78.233)*43758.5453%1;C[c].position.set((G-(A-1)*.5)*q,(ge-(R-1)*.5)*j,0),C[c].userData.gridTimeOffset=ne?0:(fe+1)%1*z,C[c].userData.gridOpacity=1-Math.min(Ce,1)*(1-Q),C[c].renderOrder=l.renderBehindPointCloud?-5:35}const te=Number.isFinite(l.fluidStrength[0])?l.fluidStrength[0]:0,_=Number.isFinite(l.fluidStrength[1])?l.fluidStrength[1]:0,[W,ue]=ra(l.fluidDepthStrength,ct),[le,N]=Mr(l.fluidDistanceRange,lt),Z=Math.max(Math.abs(te),Math.abs(_))>1e-6;for(let c=0;c<C.length;c++){const G=Z?E(c):v[c];C[c].material!==G&&(C[c].material=G)}const U=l.blendMode==="additive"?ht:at;ee=Pr(l.raymarchSteps,p),m(c=>{c.blending=U,c.uniforms.uOpacity.value=l.opacity,c.uniforms.uBrightness.value=l.brightness,c.uniforms.uThreshold.value=Math.max(l.threshold,yr),c.uniforms.uSoftness.value=l.softness,c.uniforms.uEdgeFade.value=Math.max(l.edgeFade,0),c.uniforms.uLoopCount.value=Number.isFinite(l.loopCount)?Math.max(0,l.loopCount):1,c.uniforms.uNearFade.value=l.nearFade,c.uniforms.uRaymarchSteps.value=ee,c.uniforms.uCenterFade.value.fromArray(l.centerFade),c.uniforms.uHsl.value.fromArray(l.hsl),c.uniforms.uNoiseScale.value.fromArray(l.noiseScale),c.uniforms.uNoiseMovement.value.fromArray(l.noiseMovement),c.uniforms.uNoiseStrength.value=l.noiseStrength,c.uniforms.uFluidStrength&&c.uniforms.uFluidStrength.value.set(te,_),c.uniforms.uFluidDepthStrength&&c.uniforms.uFluidDepthStrength.value.set(W,ue),c.uniforms.uFluidDistanceRange&&c.uniforms.uFluidDistanceRange.value.set(le,N)}),h();for(let c=0;c<C.length;c++)for(const G of[v[c],b[c]])G&&(G.uniforms.uGridTimeOffset.value=C[c].userData.gridTimeOffset,G.uniforms.uGridOpacity.value=C[c].userData.gridOpacity);k=typeof l.playbackSpeed=="number"&&Number.isFinite(l.playbackSpeed)?l.playbackSpeed:Et,$=typeof l.scrollVelocityScrub=="number"&&Number.isFinite(l.scrollVelocityScrub)?l.scrollVelocityScrub:0},setTime:(l,p,F)=>{const A=p??Pe();m(z=>{z.uniforms.uTime.value=l,z.uniforms.uFluidVelocity&&(z.uniforms.uFluidVelocity.value=A)});const R=w===null?0:l-w;w=l;const q=L.clamp(R,-.1,.1);T+=q*k/M+q*L.clamp(F,-1,1)*$;const j=(T%1+1)%1;m(z=>{z.uniforms.uScrubOffset.value=j})},setLoadFade:l=>{const p=L.clamp(l,0,1);m(F=>{F.uniforms.uLoadFade.value=p})},dispose:()=>{e.removeFromParent(),i.dispose(),m(l=>{l.dispose()}),a.dispose(),r==null||r.dispose()}}}function Ue(t,e,a){const r=t.replace(e,a);if(r===t)throw new Error("[VideoLightVolume] fluid shader patch target was not found");return r}function Wr(t,e,a){let r=t.fragmentShader;const n=`uniform ${a} uVolume;
`;return r=Ue(r,n,`${n}      uniform sampler2D uFluidVelocity;
`),r=Ue(r,`uniform float uScrubOffset;
`,`uniform float uScrubOffset;
      uniform vec2 uFluidStrength;
      uniform vec2 uFluidDepthStrength;
      uniform vec2 uFluidDistanceRange;
      uniform vec3 uFluidWorldScale;
      uniform vec2 uFluidResolution;
`),r=Ue(r,`        vec3 uvOffset = animatedUvOffset(noiseSamplePos + 0.5);
        vec3 accum = vec3(0.0);
`,`        vec3 uvOffset = animatedUvOffset(noiseSamplePos + 0.5);
        vec2 fluidUv = clamp(gl_FragCoord.xy / max(uFluidResolution, vec2(1.0)), 0.0, 1.0);
        vec2 fluidOffset = -texture(uFluidVelocity, fluidUv).xy * uFluidStrength * vec2(-1.0, 1.0) * ${Cr.toFixed(2)};
        vec3 accum = vec3(0.0);
`),r=Ue(r,`          vec3 rawUvw = p + 0.5 + uvOffset;
          float sideDistance = min(min(rawUvw.x, 1.0 - rawUvw.x), min(rawUvw.y, 1.0 - rawUvw.y));
`,`          vec3 rawUvw = p + 0.5 + uvOffset;
          float fluidDepthMix = smoothstep(0.0, 1.0, rayDepth01);
          float fluidDepthStrength = mix(uFluidDepthStrength.x, uFluidDepthStrength.y, fluidDepthMix);
          float fluidDistance = length((p - vCameraLocal) * uFluidWorldScale);
          float fluidDistanceStrength = 1.0 - smoothstep(uFluidDistanceRange.x, uFluidDistanceRange.y, fluidDistance);
          rawUvw.xy += fluidOffset * fluidDepthStrength * fluidDistanceStrength;
          float sideDistance = min(min(rawUvw.x, 1.0 - rawUvw.x), min(rawUvw.y, 1.0 - rawUvw.y));
`),new Oe({glslVersion:ea,vertexShader:t.vertexShader,fragmentShader:r,uniforms:{...rt.clone(t.uniforms),uVolume:{value:e},uFluidVelocity:{value:Pe()},uFluidStrength:{value:new Ie},uFluidDepthStrength:{value:new Ie(ct[0],ct[1])},uFluidDistanceRange:{value:new Ie(lt[0],lt[1])},uFluidWorldScale:{value:new ce(1,1,1)},uFluidResolution:{value:new Ie(1,1)}},transparent:!0,depthWrite:!1,depthTest:!1,blending:t.blending,side:t.side})}const Ht=Math.PI/2,jt=[-Dt,Dt],Gr=6,Hr=14,jr=5,Qr=new ce(1,1,1);function Yr({cameraObject:t,cameraRigObject:e,position:a,target:r,animation:n,positionOffset:o,mobilePositionOffset:f,rotationOffset:s,mobileRotationOffset:i,pointerInfluence:u,behindPointerInfluence:v=1,scrollDrift:b=Xa,motion:m,cameraDollyOffset:x=0,cameraDollyTransitionOffset:y=0}){const C=Se(Z=>Z.camera),D=t??C,E=ar(),O=we(Z=>Z.isMobile),h=we(Z=>Z.isLandscapeMobile),M=d.useRef(null),k=d.useRef(null),$=d.useRef(null),ee=d.useRef(null),w=d.useRef(null),T=d.useRef(null),l=d.useRef(null),p=d.useRef(null),F=d.useRef(null),A=d.useRef(null),R=d.useRef(null),q=M.current??(M.current=new ce),j=k.current??(k.current=new Ne),z=$.current??($.current={pitch:0,yaw:0}),Q=ee.current??(ee.current=new ce),g=w.current??(w.current=new Ta),ie=T.current??(T.current=[0,0,0]),he=l.current??(l.current=new ce),te=p.current??(p.current=new ot),_=F.current??(F.current=new Ne),W=A.current??(A.current=new Ne),ue=kt[n]??kt.none,le=d.useMemo(()=>Ot(o,f,O,h,[0,0,0]),[o,f,O,h]),N=d.useMemo(()=>Ot(s,i,O,h,[0,0,0]),[s,i,O,h]);return dt((Z,U)=>{var se,de;const{transition:B,progress:me,screenOffset:J}=m.current;if(St(B))return;const V=we.getState().preferReducedMotion,P=ue({position:a,target:r,transition:B,progress:me,screenOffset:V?0:J,scrollDrift:b}),[c,G]=(u==null?void 0:u[0])??jt,[ge,Ce]=(u==null?void 0:u[1])??jt,{x:ne,y:fe,active:Te}=E.current,Me=Te&&!V,be=1-gt(J)*(1-v),Fe=Me?L.mapLinear(ne,-1,1,c,G)*Ht*be:0,Ee=Me?L.mapLinear(-fe,-1,1,ge,Ce)*Ht*be:0,Ae=Me?Gr:Hr;z.pitch=L.damp(z.pitch,Ee,Ae,U),z.yaw=L.damp(z.yaw,Fe,Ae,U),Q.set(P.position[0]-P.target[0],P.position[1]-P.target[1],P.position[2]-P.target[2]),g.setFromVector3(Q),g.theta+=z.yaw,g.phi+=z.pitch,g.makeSafe(),Q.setFromSpherical(g),ie[0]=P.target[0]+Q.x,ie[1]=P.target[1]+Q.y,ie[2]=P.target[2]+Q.z,R.current===null||V?R.current=x:R.current=L.damp(R.current,x,jr,U);const K=V?0:y*L.clamp(-B,0,1),Re=(P.localZOffset??0)+R.current+K;$a(D,le,N,e),qa(D,ie,P.target,q,j,Re),Ka(D,e),Za(D);const pe=e??D.parent;if(pe!=null&&pe.userData[aa]){const S=(se=pe.userData)[de=Ja]??(se[de]=new Ne);he.set(...P.position),q.set(...P.target),j.lookAt(he,q,D.up),te.setFromRotationMatrix(j),_.compose(he,te,Qr),Re!==0&&_.multiply(W.makeTranslation(0,0,Re)),S.multiplyMatrices(pe.matrixWorld,_)}},-1),null}const Xr=`uniform sampler2D tDiffuse;
uniform sampler2D tOld;
uniform sampler2D tFluidMask;
uniform sampler2D tAfterImageExclude;
uniform sampler2D tBloom;
uniform float uDamp;
uniform float uStrength;
uniform float uThreshold;
uniform float uFluidMaskStrength;
uniform float uFluidChromaticStrength;
uniform float uAfterImageExcludeStrength;
uniform vec3 uBloomColor;
uniform float uBloomOpacity;
uniform float uChromaticAmount;
uniform float uChromaticAngle;
uniform float uNoiseAmount;
uniform float uNoiseScale;
uniform float uNoiseTime;
uniform float uVignetteAmount;
uniform float uVignetteRadius;
uniform float uVignetteSoftness;
uniform float uVignetteAspect;

varying vec2 vUv;

float afterImageLuma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec3 fluid = vec3(0.0);
  float chromaticAmount = uChromaticAmount;
  if (uFluidMaskStrength > 0.0001) {
    fluid = texture2D(tFluidMask, vUv).rgb * uFluidMaskStrength;
    float fluidChromatic = clamp(
      length(fluid.xy) * uFluidChromaticStrength,
      0.0,
      2.0
    );
    chromaticAmount *= 1.0 + fluidChromatic;
  }

  vec4 current = texture2D(tDiffuse, vUv);
  if (chromaticAmount > 0.0001) {
    vec2 chromaticCenter = vUv - 0.5;
    float chromaticRadius = length(chromaticCenter);
    float chromaticAngleCos = cos(uChromaticAngle);
    float chromaticAngleSin = sin(uChromaticAngle);
    vec2 chromaticDir = chromaticRadius > 0.00001
      ? chromaticCenter / chromaticRadius
      : vec2(0.0);
    chromaticDir = vec2(
      chromaticDir.x * chromaticAngleCos - chromaticDir.y * chromaticAngleSin,
      chromaticDir.x * chromaticAngleSin + chromaticDir.y * chromaticAngleCos
    );
    vec2 chromaticOffset = chromaticDir *
      chromaticAmount *
      (chromaticRadius + 0.15) *
      smoothstep(0.0, 0.05, chromaticRadius);
    vec4 currentR = texture2D(
      tDiffuse,
      clamp(vUv + chromaticOffset, vec2(0.0), vec2(1.0))
    );
    vec4 currentB = texture2D(
      tDiffuse,
      clamp(vUv - chromaticOffset, vec2(0.0), vec2(1.0))
    );
    current = vec4(vec3(currentR.r, current.g, currentB.b), current.a);
  }
  if (uBloomOpacity > 0.0001) {
    vec3 bloom = texture2D(tBloom, vUv).rgb;
    current.rgb += bloom * uBloomColor * uBloomOpacity;
  }

  vec4 previous = texture2D(tOld, vUv);
  float keep = step(uThreshold, afterImageLuma(previous.rgb));
  vec3 decayed = previous.rgb * uDamp * keep;
  vec3 afterimage = max(current.rgb, decayed);

  float mixAfter = clamp(uStrength, 0.0, 1.0);
  mixAfter *= smoothstep(1.0, 0.0, abs(fluid.r));
  mixAfter *= smoothstep(1.0, 0.0, abs(fluid.g));
  mixAfter *= smoothstep(1.0, 0.0, abs(fluid.b));
  // The background light-volume FBO is already precomposited into tDiffuse. Its
  // alpha mask keeps the temporal trail on the pointcloud layer instead of
  // smearing the raymarched volume texture. (Foreground is composited after
  // this pass, so it is not masked here.)
  if (uAfterImageExcludeStrength > 0.5) {
    mixAfter *= 1.0 - clamp(texture2D(tAfterImageExclude, vUv).a, 0.0, 1.0);
  }

  vec3 color = mix(current.rgb, afterimage, mixAfter);

  if (uNoiseAmount > 0.0001) {
    float scale = clamp(uNoiseScale, 0.1, 8.0);
    vec2 noiseCell = floor(gl_FragCoord.xy / scale);
    float noise = rand(
      noiseCell + vec2(uNoiseTime * 59.0, uNoiseTime * 83.0)
    ) - 0.5;
    color += noise * uNoiseAmount;
  }

  vec2 centered = vUv - 0.5;
  centered.x *= uVignetteAspect;
  float softness = max(uVignetteSoftness, 0.0001);
  float edge = smoothstep(
    uVignetteRadius - softness,
    uVignetteRadius,
    length(centered)
  );
  float shade = mix(1.0, 1.0 - clamp(uVignetteAmount, 0.0, 1.0), edge);
  shade = mix(1.0, shade, smoothstep(0.5, 1.0, vUv.y));
  color *= shade;

  gl_FragColor = vec4(color, current.a);
}
`,$r=`uniform sampler2D tDiffuse;
uniform float uAmount;
uniform float uWidth;
uniform float uHeight;
uniform float uRounded;
uniform float uBlur;
uniform vec3 uColor;

varying vec2 vUv;

float topRoundedRectSdf(vec2 point, vec2 size, float radius) {
  float x = abs(point.x);
  float y = point.y;
  float clampedRadius = min(radius, min(size.x, size.y));
  vec2 cornerCenter = size - vec2(clampedRadius);

  if (clampedRadius > 0.0 && x > cornerCenter.x && y > cornerCenter.y) {
    vec2 cornerDelta = vec2(x - cornerCenter.x, y - cornerCenter.y);
    return length(cornerDelta) - clampedRadius;
  }

  return max(x - size.x, y - size.y);
}

void main() {
  vec4 source = texture2D(tDiffuse, vUv);
  float amount = clamp(uAmount, 0.0, 1.0);
  float width = max(clamp(uWidth, 0.0, 1.0), 0.0001);
  float height = max(clamp(uHeight, 0.0, 1.0), 0.0001);
  float vertical = 1.0 - smoothstep(0.0, height, vUv.y);
  float radius = clamp(uRounded, 0.0, 1.0) * min(width, height);
  float blur = max(uBlur, 0.0001);
  vec2 shapePoint = vec2((vUv.x - 0.5) * 2.0, vUv.y);
  float sdf = topRoundedRectSdf(shapePoint, vec2(width, height), radius);
  float shapeMask = 1.0 - smoothstep(0.0, blur, sdf);
  float k = vertical * shapeMask * amount;
  // Force alpha so the downstream bg gradient doesn't bleed through gaps.
  source.a = mix(source.a, 1.0, k);
  source.rgb = mix(source.rgb, uColor, k);
  gl_FragColor = source;
}
`,Tt=`varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,$e={uniforms:{tDiffuse:{value:null},tOld:{value:null},tFluidMask:{value:null},tAfterImageExclude:{value:null},tBloom:{value:null},uDamp:{value:.93},uStrength:{value:0},uThreshold:{value:.04},uFluidMaskStrength:{value:0},uFluidChromaticStrength:{value:0},uAfterImageExcludeStrength:{value:0},uBloomColor:{value:new ve(1,1,1)},uBloomOpacity:{value:0},uChromaticAmount:{value:0},uChromaticAngle:{value:0},uNoiseAmount:{value:0},uNoiseScale:{value:1},uNoiseTime:{value:0},uVignetteAmount:{value:0},uVignetteRadius:{value:.72},uVignetteSoftness:{value:.35},uVignetteAspect:{value:1}},vertexShader:Tt,fragmentShader:Xr},qe={uniforms:{tDiffuse:{value:null},uAmount:{value:0},uWidth:{value:1},uHeight:{value:1},uRounded:{value:0},uBlur:{value:.08},uColor:{value:new ve(0,0,0)}},vertexShader:Tt,fragmentShader:$r},qr=new ve;function Qt(t,e){const a=new He(new mt(2,2),e);return t.add(a),a}class Kr{constructor(e){I(this,"rawSceneTarget",null);I(this,"options");I(this,"preset");I(this,"renderer",null);I(this,"afterImageOldTarget",null);I(this,"afterImageTarget",null);I(this,"afterImageMaterial",null);I(this,"afterImageScene",new Ge);I(this,"afterImageCamera",new nt(-1,1,1,-1,0,1));I(this,"afterImageQuad",null);I(this,"crossFadeTransitionTarget",null);I(this,"crossFadeTransitionMaterial",null);I(this,"crossFadeTransitionScene",new Ge);I(this,"crossFadeTransitionCamera",new nt(-1,1,1,-1,0,1));I(this,"crossFadeTransitionQuad",null);I(this,"fxWidth",0);I(this,"fxHeight",0);I(this,"sceneWidth",1);I(this,"sceneHeight",1);I(this,"initialized",!1);I(this,"hasAfterImageFrame",!1);I(this,"afterImageCameraFade",1);I(this,"afterImageScrollFade",1);I(this,"afterImageScrollFadeTime",0);I(this,"afterImageCameraSampleReady",!1);I(this,"transientRtsCleared",!0);I(this,"afterImageCameraPosition",new ce);I(this,"afterImagePreviousCameraPosition",new ce);I(this,"afterImageCameraQuaternion",new ot);I(this,"afterImagePreviousCameraQuaternion",new ot);this.options=e,this.preset=e.preset}init(e){if(this.renderer=e,this.initialized)return;this.initialized=!0,this.afterImageMaterial=new Oe({uniforms:rt.clone($e.uniforms),vertexShader:$e.vertexShader,fragmentShader:$e.fragmentShader,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.afterImageQuad=Qt(this.afterImageScene,this.afterImageMaterial);const a=this.preset.tint;this.afterImageMaterial.uniforms.uBloomColor.value.setRGB(a[0],a[1],a[2])}resize(e,a,r,n,o,f){var s,i,u;if(this.sceneWidth=r,this.sceneHeight=n,this.rawSceneTarget){this.rawSceneTarget.setSize(r,n);const v=this.rawSceneTarget.depthTexture;v&&(v.image.width!==r||v.image.height!==n)&&(v.image.width=r,v.image.height=n,v.needsUpdate=!0)}(s=this.afterImageOldTarget)==null||s.setSize(o,f),(i=this.afterImageTarget)==null||i.setSize(o,f),(u=this.crossFadeTransitionTarget)==null||u.setSize(o,f),this.fxWidth=o,this.fxHeight=f,this.hasAfterImageFrame=!1,this.afterImageCameraSampleReady=!1,this.renderer&&_t(this.renderer).setSize(e,a),this.afterImageMaterial&&(this.afterImageMaterial.uniforms.uVignetteAspect.value=e/Math.max(a,1))}acquireSceneTarget(e){this.rawSceneTarget||(this.rawSceneTarget=xe(e,"main",this.sceneWidth,this.sceneHeight))}releaseSceneTarget(e){this.rawSceneTarget&&(oe(e,"main",this.rawSceneTarget),this.rawSceneTarget=null)}acquireFxTargets(e){this.afterImageOldTarget||(this.afterImageOldTarget=xe(e,"fx",this.fxWidth,this.fxHeight),this.afterImageTarget=xe(e,"fx",this.fxWidth,this.fxHeight),this.hasAfterImageFrame=!1)}releaseFxTargets(e){this.afterImageOldTarget&&(oe(e,"fx",this.afterImageOldTarget),this.afterImageOldTarget=null),this.afterImageTarget&&(oe(e,"fx",this.afterImageTarget),this.afterImageTarget=null),this.crossFadeTransitionTarget&&(oe(e,"fx",this.crossFadeTransitionTarget),this.crossFadeTransitionTarget=null),this.hasAfterImageFrame=!1,this.transientRtsCleared=!0}resetTransientState(e){if(this.hasAfterImageFrame=!1,this.afterImageCameraSampleReady=!1,this.afterImageCameraFade=1,this.afterImageScrollFade=1,this.afterImageScrollFadeTime=0,e&&!this.transientRtsCleared&&this.afterImageOldTarget&&this.afterImageTarget){const a=e.getRenderTarget(),r=e.getClearColor(qr).clone(),n=e.getClearAlpha();e.setClearColor(0,0),e.setRenderTarget(this.afterImageOldTarget),e.clear(),e.setRenderTarget(this.afterImageTarget),e.clear(),e.setRenderTarget(a),e.setClearColor(r,n),this.transientRtsCleared=!0}}applyPreset(e){if(this.preset=e,this.afterImageMaterial){const a=e.tint;this.afterImageMaterial.uniforms.uBloomColor.value.setRGB(a[0],a[1],a[2])}}isBloomActive(e){return this.getBloomOverlayOpacity(e)>0}isAfterImageActive(e){return e.cameraMotion.afterimageEnabled!==!1&&(e.cameraMotion.afterimageStrength??Be.afterimageStrength)>0}isVignetteActive(e){return e.cameraMotion.vignetteEnabled!==!1&&(e.cameraMotion.vignetteAmount??0)>0}getBloomOverlayOpacity(e){return!this.preset.enabled||e.cameraMotion.bloomEnabled===!1?0:this.preset.opacity}get hasPersistedAfterImageFrame(){return this.hasAfterImageFrame}get afterImageOldTexture(){var e;return((e=this.afterImageOldTarget)==null?void 0:e.texture)??null}updateCameraFade(e){if(e.updateMatrixWorld(!0),e.getWorldPosition(this.afterImageCameraPosition),e.getWorldQuaternion(this.afterImageCameraQuaternion),!this.afterImageCameraSampleReady){this.afterImagePreviousCameraPosition.copy(this.afterImageCameraPosition),this.afterImagePreviousCameraQuaternion.copy(this.afterImageCameraQuaternion),this.afterImageCameraSampleReady=!0,this.afterImageCameraFade=1;return}const a=this.afterImageCameraPosition.distanceTo(this.afterImagePreviousCameraPosition),r=1-Math.abs(this.afterImageCameraQuaternion.dot(this.afterImagePreviousCameraQuaternion)),n=a+r*2;this.afterImageCameraFade=1-L.smoothstep(n,or,nr),this.afterImagePreviousCameraPosition.copy(this.afterImageCameraPosition),this.afterImagePreviousCameraQuaternion.copy(this.afterImageCameraQuaternion)}resetCameraFade(){this.afterImageCameraFade=1}invalidateCameraBaseline(){this.afterImageCameraSampleReady=!1}renderBloom(e){return this.rawSceneTarget?_t(e).render(e,this.rawSceneTarget.texture,this.preset.intensity,this.preset.radius,this.preset.threshold):null}renderAfterImage(e,a){if(!this.afterImageOldTarget||!this.afterImageTarget||!this.afterImageMaterial)return;const{ctx:r,source:n,bloomTexture:o,fluidMaskTexture:f,afterImageExcludeTexture:s}=a,i=r.cameraMotion,u=i.afterimageEnabled===!1?0:i.afterimageStrength??Be.afterimageStrength,v=i.vignetteEnabled===!1?0:i.vignetteAmount??0,b=o?this.getBloomOverlayOpacity(r):0,m=i.chromaticEnabled===!1?0:i.chromaticAmount??0,x=i.noiseEnabled===!1?0:i.noiseAmount??0;if(u<=0&&v<=0&&b<=0&&m<=0&&x<=0){this.hasAfterImageFrame=!1;return}const y=L.clamp(1-L.smoothstep(Math.abs(r.scrollVelocity),ir,sr),0,1),C=performance.now(),D=this.afterImageScrollFadeTime?Math.min(ur,(C-this.afterImageScrollFadeTime)/1e3):1/60;this.afterImageScrollFadeTime=C;const E=L.clamp(i.afterimageScrollFadeLerp??Be.afterimageScrollFadeLerp,It[0],It[1]);this.afterImageScrollFade=this.hasAfterImageFrame?vr(this.afterImageScrollFade,y,D,E):y;const O=this.afterImageScrollFade,h=this.afterImageMaterial.uniforms;h.tDiffuse.value=n,h.tOld.value=this.hasAfterImageFrame?this.afterImageOldTarget.texture:n,h.tFluidMask.value=f??this.options.zeroTexture,h.tAfterImageExclude.value=s??this.options.zeroTexture,h.uAfterImageExcludeStrength.value=s?1:0,h.tBloom.value=o??this.options.zeroTexture;const M=L.clamp(i.afterimageDamp??Be.afterimageDamp,0,.999),k=L.lerp(cr,M,O);h.uDamp.value=this.hasAfterImageFrame?Math.pow(k,D*lr):0,h.uFluidMaskStrength.value=f?1:0,h.uFluidChromaticStrength.value=f?4:0,h.uStrength.value=L.clamp(u*O*this.afterImageCameraFade,0,1),h.uThreshold.value=i.afterimageThreshold??.04,h.uBloomOpacity.value=b,h.uChromaticAmount.value=m,h.uChromaticAngle.value=i.chromaticAngle??this.preset.rgbAngle,h.uNoiseAmount.value=L.clamp(x,0,1),h.uNoiseScale.value=L.clamp(i.noiseScale??1,.1,8),h.uNoiseTime.value=performance.now()*.001%1e3,h.uVignetteAmount.value=L.clamp(v,0,1),h.uVignetteRadius.value=L.clamp(i.vignetteRadius??.72,0,1.5),h.uVignetteSoftness.value=L.clamp(i.vignetteSoftness??.35,.001,1),e.setRenderTarget(this.afterImageTarget),e.clear(),e.render(this.afterImageScene,this.afterImageCamera);const $=this.afterImageOldTarget;this.afterImageOldTarget=this.afterImageTarget,this.afterImageTarget=$,this.hasAfterImageFrame=!0,this.transientRtsCleared=!1}renderCrossFadeTransition(e,a,r,n,o,f,s,i){if(r<=0||(this.crossFadeTransitionTarget??(this.crossFadeTransitionTarget=xe(e,"fx",this.fxWidth,this.fxHeight)),this.crossFadeTransitionMaterial||(this.crossFadeTransitionMaterial=new Oe({uniforms:rt.clone(qe.uniforms),vertexShader:qe.vertexShader,fragmentShader:qe.fragmentShader,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.crossFadeTransitionQuad=Qt(this.crossFadeTransitionScene,this.crossFadeTransitionMaterial)),!this.crossFadeTransitionTarget))return null;const u=this.crossFadeTransitionMaterial.uniforms;return u.tDiffuse.value=a,u.uAmount.value=L.clamp(r,0,1),u.uWidth.value=L.clamp(n,0,1),u.uHeight.value=L.clamp(o,0,1),u.uRounded.value=L.clamp(f,0,1),u.uBlur.value=L.clamp(s,1e-4,1),u.uColor.value.setRGB(i.r,i.g,i.b),e.setRenderTarget(this.crossFadeTransitionTarget),e.clear(),e.render(this.crossFadeTransitionScene,this.crossFadeTransitionCamera),this.crossFadeTransitionTarget.texture}dispose(){var e,a,r,n,o,f,s,i;(e=this.rawSceneTarget)==null||e.dispose(),(a=this.afterImageOldTarget)==null||a.dispose(),(r=this.afterImageTarget)==null||r.dispose(),this.rawSceneTarget=null,this.afterImageOldTarget=null,this.afterImageTarget=null,this.initialized=!1,this.afterImageQuad&&this.afterImageScene.remove(this.afterImageQuad),(n=this.afterImageQuad)==null||n.geometry.dispose(),(o=this.afterImageMaterial)==null||o.dispose(),this.afterImageMaterial=null,this.afterImageQuad=null,this.crossFadeTransitionQuad&&this.crossFadeTransitionScene.remove(this.crossFadeTransitionQuad),(f=this.crossFadeTransitionQuad)==null||f.geometry.dispose(),(s=this.crossFadeTransitionMaterial)==null||s.dispose(),(i=this.crossFadeTransitionTarget)==null||i.dispose(),this.crossFadeTransitionMaterial=null,this.crossFadeTransitionQuad=null,this.crossFadeTransitionTarget=null}}const Zr=4,Yt=new WeakMap;function sa(t){let e=Yt.get(t);return e||(e=[],Yt.set(t,e)),e}function Jr(t,e){const a=sa(t);return a.length>0?a.pop():new Kr(e)}function eo(t,e){const a=sa(t);if(a.length>=Zr){e.dispose();return}a.push(e)}let Ke=null;function to(){return Ke||(Ke=ro()),Ke}const ao=d.forwardRef(function(e,a){const{bloom:r,zeroTexture:n,maxDpr:o,dpr:f}=e,s=Se(y=>y.gl),i=Se(y=>y.size),u=Se(y=>y.viewport.dpr),v=f!=null?Math.min(Math.max(.05,f),o??1/0):o!=null?Math.min(u,o):u,b=n??to(),m=d.useRef(null),x=m.current??(m.current=Jr(s,{preset:r,zeroTexture:b}));return d.useImperativeHandle(a,()=>x,[x]),d.useEffect(()=>{x.init(s),x.resetTransientState(s),x.invalidateCameraBaseline()},[x,s]),d.useEffect(()=>{x.applyPreset(r)},[x,r]),d.useEffect(()=>{const y=Math.max(1,Math.round(i.width*v)),C=Math.max(1,Math.round(i.height*v));x.resize(i.width,i.height,y,C,y,C)},[x,i.width,i.height,v]),d.useEffect(()=>()=>{x.releaseSceneTarget(s),x.releaseFxTargets(s),eo(s,x)},[s,x]),null});function ro(){const t=new Ma(new Uint8Array([0,0,0,255]),1,1,ba);return t.needsUpdate=!0,t}const ua=1.5,Xt=2,$t=new ve,ke=new ve,oo={r:0,g:0,b:0},no=4;function _e(t){const e=[];return t.traverse(a=>{const r=a.material;r&&(Array.isArray(r)?e.push(...r):e.push(r))}),e}function io(t){const e=[],a=new Set;for(const r of t)!r||a.has(r)||(a.add(r),e.push({object:r,visible:r.visible}),r.visible=!1);return e}function Ve(t){for(const{object:e,visible:a}of t)e.visible=a}function qt(t,e){let a=e;for(;a;){if(a===t)return!0;a=a.parent}return!1}function so(){const t=new Ge,e=new nt(-1,1,1,-1,0,1),a=new mt(2,2),r=new Oe({uniforms:{tMap:{value:null},tFluidMask:{value:Pe()},uFluidMaskStrength:{value:0},uFluidChromaticStrength:{value:no},uChromaticAmount:{value:0},uChromaticAngle:{value:0}},vertexShader:Tt,fragmentShader:`
      uniform sampler2D tMap;
      uniform sampler2D tFluidMask;
      uniform float uFluidMaskStrength;
      uniform float uFluidChromaticStrength;
      uniform float uChromaticAmount;
      uniform float uChromaticAngle;
      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(tMap, vUv);
        if (color.a <= 0.0001) discard;

        vec3 fluid = texture2D(tFluidMask, vUv).rgb * uFluidMaskStrength;
        float fluidChromatic = clamp(
          length(fluid.xy) * uFluidChromaticStrength,
          0.0,
          2.0
        );
        float chromaticAmount = uChromaticAmount * (1.0 + fluidChromatic);

        if (chromaticAmount > 0.000001) {
          vec2 chromaticCenter = vUv - 0.5;
          float chromaticRadius = length(chromaticCenter);
          float chromaticAngleCos = cos(uChromaticAngle);
          float chromaticAngleSin = sin(uChromaticAngle);
          vec2 chromaticDir = chromaticRadius > 0.00001
            ? chromaticCenter / chromaticRadius
            : vec2(0.0);
          chromaticDir = vec2(
            chromaticDir.x * chromaticAngleCos - chromaticDir.y * chromaticAngleSin,
            chromaticDir.x * chromaticAngleSin + chromaticDir.y * chromaticAngleCos
          );
          vec2 chromaticOffset = chromaticDir *
            chromaticAmount *
            (chromaticRadius + 0.15) *
            smoothstep(0.0, 0.05, chromaticRadius);
          vec4 colorR = texture2D(
            tMap,
            clamp(vUv + chromaticOffset, vec2(0.0), vec2(1.0))
          );
          vec4 colorB = texture2D(
            tMap,
            clamp(vUv - chromaticOffset, vec2(0.0), vec2(1.0))
          );
          color.rgb = vec3(colorR.r, color.g, colorB.b);
        }

        gl_FragColor = color;
      }
    `,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1}),n=new He(a,r);n.frustumCulled=!1,t.add(n);const o={};let f=1,s=1,i=1,u=1;const v=(m,x)=>{const y=o[x];y&&(oe(m,"video",y),delete o[x])},b=m=>{v(m,"background"),v(m,"environment"),v(m,"foreground")};return{scene:t,camera:e,material:r,quad:n,setSizes:(m,x,y,C)=>{var D,E,O;f=m,s=x,i=y,u=C,(D=o.background)==null||D.setSize(m,x),(E=o.environment)==null||E.setSize(m,x),(O=o.foreground)==null||O.setSize(y,C)},acquire:(m,x)=>(x.background?o.background??(o.background=xe(m,"video",f,s)):v(m,"background"),x.environment?o.environment??(o.environment=xe(m,"video",f,s)):v(m,"environment"),x.foreground?o.foreground??(o.foreground=xe(m,"video",i,u)):v(m,"foreground"),o),release:b,dispose:m=>{t.remove(n),a.dispose(),r.dispose(),b(m)}}}function uo(t,e,a){var r;for(const n of t)for(const o of _e(n)){const f=o.uniforms,s=(r=f==null?void 0:f.uFluidResolution)==null?void 0:r.value;s&&typeof s.set=="function"&&s.set(e,a)}}function Ze(t,e,a,r,n,o=!1){if(r.length===0&&!o)return;const f=[];e.traverse(b=>{if(b===e)return;const m=r.some(x=>qt(b,x)||qt(x,b));f.push({object:b,visible:b.visible}),b.visible=m&&b.visible});const s=t.getRenderTarget(),i=t.autoClear,u=e.background,v=t.getClearAlpha();t.getClearColor(ke),o||(e.background=null),t.autoClear=!1,t.setClearColor(0,0),uo(r,n.width,n.height),t.setRenderTarget(n),t.clear(),t.render(e,a),t.setRenderTarget(s),t.setClearColor(ke,v),t.autoClear=i,e.background=u,Ve(f)}function lo(t){return t.some(e=>_e(e).some(a=>a.blending===ht))}function co(t){let e=!1;const a=1<<vt;return t.traverseVisible(r=>{e||(r.layers.mask&a)===0||(e=_e(r).some(n=>n.visible))}),e}function mo(t){let e=!1;const a=1<<vt;return t.traverseVisible(r=>{e||!r.userData[fr]||(r.layers.mask&a)===0||(e=_e(r).some(n=>n.visible))}),e}function fo(t){return"blitFramebuffer"in t}function Kt(t,e){const a=t.properties.get(e).__webglFramebuffer;if(Array.isArray(a)){const r=a[0];return(Array.isArray(r)?r[0]:r)??null}return a??null}function ho(t,e,a,r=e.width,n=e.height){const o=t.getContext();if(!fo(o))return!1;const f=t.getRenderTarget();t.setRenderTarget(a),t.setRenderTarget(f);const s=Kt(t,e),i=Kt(t,a);return!s||!i?!1:(t.state.bindFramebuffer(o.READ_FRAMEBUFFER,s),t.state.bindFramebuffer(o.DRAW_FRAMEBUFFER,i),o.blitFramebuffer(0,0,r,n,0,0,a.width,a.height,o.DEPTH_BUFFER_BIT,o.NEAREST),t.setRenderTarget(f),!0)}function Zt(t,e,a,r,n={}){const o=Math.max(0,n.chromaticAmount??0),f=n.fluidMaskTexture??null,s=t.autoClear;e.material.blending=lo(r)?ht:at,e.material.uniforms.tMap.value=a,e.material.uniforms.tFluidMask.value=f??Pe(),e.material.uniforms.uFluidMaskStrength.value=o>0&&f?1:0,e.material.uniforms.uChromaticAmount.value=o,e.material.uniforms.uChromaticAngle.value=n.chromaticAngle??0,t.autoClear=!1,t.render(e.scene,e.camera),t.autoClear=s,e.material.uniforms.tMap.value=null,e.material.uniforms.tFluidMask.value=Pe()}function go(t,e){const a=[];let r=e;for(;r.parent&&r!==t;){for(const n of r.parent.children)n!==r&&(a.push({object:n,visible:n.visible}),n.visible=!1);r=r.parent}return a}function la(t,e,a,r,n=[]){const o=io(n);if(!(r!=null&&r.visible)){t.render(e,a),Ve(o);return}const f=t.autoClear,s=go(e,r),i=_e(r).map(u=>({material:u,colorWrite:u.colorWrite,depthWrite:u.depthWrite,depthTest:u.depthTest}));for(const{material:u}of i)u.colorWrite=!1,u.depthWrite=!0,u.depthTest=!0;t.autoClear=!1,t.render(e,a),Ve(s);for(const{material:u,colorWrite:v,depthWrite:b,depthTest:m}of i)u.colorWrite=v,u.depthWrite=b,u.depthTest=m;t.render(e,a),t.autoClear=f,Ve(o)}function po(t,e,a,r,n=!1){const o=t.getRenderTarget(),f=t.autoClear,s=e.background,i=t.getClearAlpha(),u=a.layers.mask;t.getClearColor(ke),e.background=null,a.layers.set(vt),t.autoClear=!1,t.setClearColor(0,0),t.setRenderTarget(r),t.clear(!0,n,!1),t.render(e,a),t.setRenderTarget(o),t.setClearColor(ke,i),t.autoClear=f,e.background=s,a.layers.mask=u}function Je(t,e,a,r,n,o){const f=t.getRenderTarget(),s=t.autoClear,i=e.background,u=t.getClearAlpha(),v=a.layers.mask,b=_e(e).map(m=>({material:m,colorWrite:m.colorWrite}));t.getClearColor(ke);for(const{material:m}of b)m.colorWrite=!1;e.background=null,a.layers.set(dr),t.autoClear=!1,t.setClearColor(0,0),t.setRenderTarget(o),t.clear(!0,!0,!1),la(t,e,a,r,n);for(const{material:m,colorWrite:x}of b)m.colorWrite=x;t.setRenderTarget(f),t.setClearColor(ke,u),t.autoClear=s,e.background=i,a.layers.mask=v}function vo({bloom:t,bloomEnabled:e,chromaticEnabled:a,chromaticAmount:r,chromaticAngle:n,vignetteEnabled:o,vignetteAmount:f,vignetteRadius:s,vignetteSoftness:i,heroBottomGradient:u,afterimageEnabled:v,afterimageStrength:b,afterimageDamp:m,afterimageScrollFadeLerp:x,afterimageThreshold:y,noiseEnabled:C,noiseAmount:D,noiseScale:E,outputTextureRef:O,foregroundTextureRef:h,dryTextureRef:M,fboDpr:k,renderScale:$=1,reduceQualityBehind:ee=!0,behindOffset:w=0,dryLayerMsaa:T=!0,transparentBackground:l=!1,motion:p,fluidVelocityRef:F,pointCloudRef:A,foregroundVideoLightVolumeRef:R,videoLightVolumeRef:q,renderScene:j,renderCamera:z}){const Q=d.useRef(null),g=Se(V=>V.gl),ie=Se(V=>V.scene),he=Se(V=>V.camera),te=Se(V=>V.size),_=j??ie,W=z??he,ue=d.useRef({scrollVelocity:0,cameraMotion:{}}),le=d.useRef({ctx:ue.current,source:null,bloomTexture:null,fluidMaskTexture:null,afterImageExcludeTexture:null}),N=d.useMemo(()=>so(),[]),Z=T?"dryMsaa":"dry",U=d.useRef(null),B=d.useRef(null),me=d.useRef({width:1,height:1}),J=d.useRef(null);return d.useEffect(()=>()=>N.dispose(g),[N,g]),d.useEffect(()=>()=>{U.current&&(oe(g,Z,U.current),U.current=null),B.current&&(oe(g,"dryDepth",B.current),B.current=null),J.current&&(oe(g,"sceneCapture",J.current),J.current=null)},[g,Z]),d.useEffect(()=>{N.setSizes(Math.max(1,Math.round(te.width*k.background)),Math.max(1,Math.round(te.height*k.background)),Math.max(1,Math.round(te.width*k.foreground)),Math.max(1,Math.round(te.height*k.foreground)));const V=Math.max(1,Math.round(te.width*Xt)),P=Math.max(1,Math.round(te.height*Xt));me.current={width:V,height:P},U.current&&(U.current.depthTexture=null,U.current.setSize(V,P))},[k.background,k.foreground,te.height,te.width,N]),dt(()=>{var Ct,yt,Ft,At,wt;const{progress:V,transition:P}=p.current;if(St(P)){(Ct=Q.current)==null||Ct.releaseSceneTarget(g),(yt=Q.current)==null||yt.releaseFxTargets(g),(Ft=Q.current)==null||Ft.resetTransientState(g),N.release(g),U.current&&(oe(g,Z,U.current),U.current=null),B.current&&(oe(g,"dryDepth",B.current),B.current=null),J.current&&(oe(g,"sceneCapture",J.current),J.current=null),O.current=null,h&&(h.current=null),M&&(M.current=null);return}const c=Q.current;if(!c){O.current=null,h&&(h.current=null),M&&(M.current=null);return}if(c.acquireSceneTarget(g),c.acquireFxTargets(g),!c.rawSceneTarget){O.current=null,h&&(h.current=null),M&&(M.current=null);return}const G=(A==null?void 0:A.current)??null,ge=(q==null?void 0:q.current)??null,Ce=(R==null?void 0:R.current)??null,ne=[],fe=[];for(const re of[ge,Ce])re!=null&&re.visible&&(re.userData.videoLightLayer==="foreground"?fe.push(re):ne.push(re));const Te=[...ne,...fe],Me=_.background!==null,ye=ne.length>0,be=Me,Fe=fe.length>0,Ee=ye||be,Ae=a&&ye?r:0,K=N.acquire(g,{background:ye,environment:be,foreground:Fe});ye&&K.background&&Ze(g,_,W,ne,K.background),be&&K.environment&&Ze(g,_,W,[],K.environment,!0),Fe&&K.foreground&&Ze(g,_,W,fe,K.foreground),g.getClearColor($t);const Re=g.getClearAlpha();g.setClearColor(0,l?0:1);const pe=Ga(p.current.screenOffset,w),se=ja(pe,$,ee),de=se<1;let S=J.current;de?S?(S.width!==c.rawSceneTarget.width||S.height!==c.rawSceneTarget.height)&&S.setSize(c.rawSceneTarget.width,c.rawSceneTarget.height):S=J.current=xe(g,"sceneCapture",c.rawSceneTarget.width,c.rawSceneTarget.height):S&&(oe(g,"sceneCapture",S),J.current=null,S=null);const je=S??c.rawSceneTarget;if(S){const re=Math.max(1,Math.round(S.width*se)),De=Math.max(1,Math.round(S.height*se));S.viewport.set(0,0,re,De),S.scissor.set(0,0,re,De),S.scissorTest=!0}g.setRenderTarget(je),g.clear();const ca=_.background;if(Ee&&(K.environment&&Zt(g,N,K.environment.texture,[]),K.background&&Zt(g,N,K.background.texture,ne,{chromaticAmount:Ae,chromaticAngle:n,fluidMaskTexture:(F==null?void 0:F.current)??null}),_.background=null),G instanceof ka&&G.applyBehindContentQuality(se,Ha(pe,ee)),la(g,_,W,G,Te),_.background=ca,S&&(S.scissorTest=!1,S.viewport.set(0,0,S.width,S.height),S.scissor.set(0,0,S.width,S.height),mr(g,S,c.rawSceneTarget,se)),M)if(!co(_))U.current&&(oe(g,Z,U.current),U.current=null),B.current&&(oe(g,"dryDepth",B.current),B.current=null),M.current=null;else{const re=U.current??(U.current=xe(g,Z,me.current.width,me.current.height)),De=mo(_);if(De||re.samples>0)B.current&&(oe(g,"dryDepth",B.current),B.current=null),De||Je(g,_,W,G,Te,re);else{const Y=B.current??(B.current=xe(g,"dryDepth",c.rawSceneTarget.width,c.rawSceneTarget.height));(Y.width!==c.rawSceneTarget.width||Y.height!==c.rawSceneTarget.height)&&(Y.depthTexture=null,Y.setSize(c.rawSceneTarget.width,c.rawSceneTarget.height));const Qe=de?Math.max(1,Math.round(Y.width*se)):Y.width,Ye=de?Math.max(1,Math.round(Y.height*se)):Y.height;de&&(Y.viewport.set(0,0,Qe,Ye),Y.scissor.set(0,0,Qe,Ye),Y.scissorTest=!0),Je(g,_,W,G,Te,Y),de&&(Y.scissorTest=!1,Y.viewport.set(0,0,Y.width,Y.height),Y.scissor.set(0,0,Y.width,Y.height)),ho(g,Y,re,Qe,Ye)||Je(g,_,W,G,Te,re)}po(g,_,W,re,De),M.current=re.texture}h&&(h.current=((At=K.foreground)==null?void 0:At.texture)??null),g.setClearColor($t,Re);const Mt=e?c.renderBloom(g):null;ue.current.scrollVelocity=p.current.scrollVelocity||wa();const ae=ue.current.cameraMotion;ae.bloomEnabled=e,ae.afterimageEnabled=v,ae.afterimageStrength=b,ae.afterimageDamp=m,ae.afterimageScrollFadeLerp=x,ae.afterimageThreshold=y,ae.vignetteEnabled=o,ae.vignetteAmount=f,ae.vignetteRadius=s,ae.vignetteSoftness=i,ae.chromaticEnabled=!1,ae.chromaticAmount=0,ae.chromaticAngle=n,ae.noiseEnabled=C,ae.noiseAmount=D,ae.noiseScale=E,c.updateCameraFade(W);const Le=le.current;Le.source=c.rawSceneTarget.texture,Le.bloomTexture=Mt,Le.fluidMaskTexture=null,Le.afterImageExcludeTexture=((wt=K.background)==null?void 0:wt.texture)??null,c.renderAfterImage(g,Le);const bt=v&&b>0||o&&f>0||C&&D>0||Mt!==null&&c.getBloomOverlayOpacity(ue.current)>0?c.afterImageOldTexture??c.rawSceneTarget.texture:c.rawSceneTarget.texture,ma=u?u.opacity*(1-L.smoothstep(V,u.fadeStartProgress,u.fadeEndProgress)):0,fa=c.renderCrossFadeTransition(g,bt,ma,(u==null?void 0:u.width)??1,(u==null?void 0:u.height)??1,(u==null?void 0:u.rounded)??0,(u==null?void 0:u.blur)??.08,(u==null?void 0:u.color)??oo);O.current=fa??bt,g.setRenderTarget(null)},0),H.jsx(ao,{ref:Q,bloom:t,maxDpr:ua,dpr:k.main})}const So={visibility:1,pointSizeScale:1,introColorMix:0,timeScale:1,driveFluid:!0,scrollVelocity:0},et="#0a0a14",xo={position:[0,0,0],rotation:[0,0,0]};function To(t){return{...t.environment}}function Jt(t,e,a){return!a||!e?t:[((t==null?void 0:t[0])??0)+e[0],((t==null?void 0:t[1])??0)+e[1],((t==null?void 0:t[2])??0)+e[2]]}function Mo(t){return{position:t.camera.position,target:t.camera.target,animation:t.camera.animation??tr,fov:t.camera.fov,mobileFov:t.camera.mobileFov,positionOffset:t.camera.positionOffset,mobilePositionOffset:t.camera.mobilePositionOffset,rotationOffset:t.camera.rotationOffset,mobileRotationOffset:t.camera.mobileRotationOffset,pointerInfluence:t.camera.pointerInfluence,scrollDrift:t.camera.scrollDrift}}function bo(t){return{...So,pointSizeScale:t.pointcloud.pointSizeScale??1,position:t.pointcloud.position?[t.pointcloud.position.x,t.pointcloud.position.y,t.pointcloud.position.z]:void 0,rotation:t.pointcloud.rotation?[t.pointcloud.rotation.x,t.pointcloud.rotation.y,t.pointcloud.rotation.z]:void 0,scale:t.pointcloud.scale,mobile:t.pointcloud.mobile?{position:t.pointcloud.mobile.position?[t.pointcloud.mobile.position.x,t.pointcloud.mobile.position.y,t.pointcloud.mobile.position.z]:void 0,rotation:t.pointcloud.mobile.rotation?[t.pointcloud.mobile.rotation.x,t.pointcloud.mobile.rotation.y,t.pointcloud.mobile.rotation.z]:void 0}:void 0,opacity:t.pointcloud.opacity,exposure:0,transparent:t.pointcloud.transparent??!0,blendMode:t.pointcloud.blendMode,simplePoints:!t.pointcloud.fluid.enabled,randomize:t.pointcloud.randomize?[t.pointcloud.randomize.x,t.pointcloud.randomize.y,t.pointcloud.randomize.z]:void 0,cameraFade:t.pointcloud.cameraFade}}function Co(t){const{bloom:e,chromatic:a,vignette:r,afterimage:n,noise:o,toneMapping:f,toneMappingExposure:s}=t.postprocessing;return{bloom:e,bloomEnabled:e.enabled,chromaticEnabled:a.enabled,chromaticAmount:a.amount,chromaticAngle:a.angle,vignetteEnabled:r.enabled,vignetteAmount:r.amount,vignetteRadius:r.radius,vignetteSoftness:r.softness,afterimageEnabled:n.enabled,afterimageStrength:n.strength,afterimageDamp:n.damp,afterimageScrollFadeLerp:Be.afterimageScrollFadeLerp,afterimageThreshold:n.threshold,noiseEnabled:o.enabled,noiseAmount:o.amount,noiseScale:o.scale,toneMapping:f,toneMappingExposure:s}}function yo(t){return t.videoLightVolume??null}function Fo(t){return t.foregroundVideoLightVolume??null}function qo({preset:t,camera:e=Mo(t),cameraDollyOffset:a=0,cameraDollyTransitionOffset:r=0,postprocessing:n=Co(t),pointCloud:o=bo(t),backgroundDarken:f=0,sceneTransform:s=xo,videoLightVolume:i=yo(t),foregroundVideoLightVolume:u=Fo(t),sdfs:v=t.sdfs,sdfHelpers:b=!1,fboDpr:m,renderScale:x=1,transition:y=0,progress:C=0,screenOffset:D=0,behindContent:E=t.behindContent,dryLayerMsaa:O=!0,motion:h,loadingHandle:M,onPointCloudLoad:k,onPointCloudError:$,mousePointerEnabled:ee=!0,subSceneContent:w}){var se,de;const T=To(t),l=we(S=>S.isMobile),p=we(S=>S.isLandscapeMobile),F=d.useMemo(()=>({background:Math.max(.05,(m==null?void 0:m.background)??Xe.background),main:Math.max(.05,(m==null?void 0:m.main)??Xe.main),foreground:Math.max(.05,(m==null?void 0:m.foreground)??Xe.foreground)}),[m==null?void 0:m.background,m==null?void 0:m.foreground,m==null?void 0:m.main]),A=Math.min(Math.max(x,.01),1),R=Math.min(F.main,ua),q=d.useRef(null),j=d.useRef(null),z=Fa(),Q=d.useRef(null),g=d.useRef(null),[ie,he]=d.useState(0);d.useEffect(()=>{q.current=null,j.current=null,he(S=>S+1)},[t.id]);const te=d.useCallback(S=>{q.current=S,he(je=>je+1),k==null||k(S)},[k]),_=d.useRef({transition:y,progress:C,scrollVelocity:o.scrollVelocity,screenOffset:D});h||(_.current.transition=y,_.current.progress=C,_.current.scrollVelocity=o.scrollVelocity,_.current.screenOffset=D);const W=h??_,ue=d.useMemo(()=>new Ge,[]),le=d.useMemo(()=>{const S=new tt;return S.name="SectionScene content transform",S},[]),N=d.useMemo(()=>new Ca(50,1,.1,100),[]),Z=d.useMemo(()=>{const S=new tt;return S.name="SectionScene camera rig",S.userData[aa]=!0,S},[]);d.useEffect(()=>(N.removeFromParent(),()=>{N.removeFromParent()}),[N]);const[U,B,me]=s.position,[J,V,P]=s.rotation;d.useEffect(()=>{le.position.set(U,B,me),le.rotation.set(J,V,P),le.updateMatrixWorld(!0)},[le,U,B,me,J,V,P]);const c=Se(S=>S.size);d.useEffect(()=>{N.aspect=c.width/c.height,N.updateProjectionMatrix()},[N,c]);const G=d.useRef(null),ge=d.useRef(null),Ce=d.useRef(null),ne=T.bgMode,fe=ne==="hdr"||ne===void 0&&T.background,Te=fe||ne===void 0?"none":ne==="solid"?"solid":"linear",Me=d.useMemo(()=>({mode:Te,color1:T.bgColor1??et,color2:T.bgColor2??et,color3:Ya({bgColor2:T.bgColor2,bgColor3:T.bgColor3,bgGradientPoints:T.bgGradientPoints},et),angle:T.bgAngle??0,smooth:T.bgSpread??50,pointCount:T.bgGradientPoints??2,bias1:T.bgBias1??0,bias2:T.bgBias2??0,toneMapping:n.toneMapping,toneMappingExposure:n.toneMappingExposure,darken:f}),[n.toneMapping,n.toneMappingExposure,Te,T.bgColor1,T.bgColor2,T.bgColor3,T.bgAngle,T.bgSpread,T.bgGradientPoints,T.bgBias1,T.bgBias2,f]),ye=d.useRef(Me);ye.current=Me;const be=d.useRef(n.introTransition??null);be.current=n.introTransition??null;const Fe=d.useRef({darken:E.darken,saturation:E.saturation});Fe.current.darken=E.darken,Fe.current.saturation=E.saturation;const Ee=d.useRef(i?0:1),Ae=d.useMemo(()=>Tr(G,ye,ge,Ce,{motionRef:W,paramsRef:Fe},be,Ee),[W]),K=!!(l||p),Re=d.useMemo(()=>{var S;return Jt(o.position,(S=o.mobile)==null?void 0:S.position,K)},[K,(se=o.mobile)==null?void 0:se.position,o.position]),pe=d.useMemo(()=>{var S;return Jt(o.rotation,(S=o.mobile)==null?void 0:S.rotation,K)},[K,(de=o.mobile)==null?void 0:de.rotation,o.rotation]);return d.useEffect(()=>()=>Ae.dispose(),[Ae]),H.jsxs(H.Fragment,{children:[ya(H.jsxs(rr,{mouseEnabled:ee,children:[H.jsx("primitive",{object:Z}),H.jsx(er,{cameraObject:N,cameraRigObject:Z,position:e.position,target:e.target,fov:e.fov,mobileFov:e.mobileFov,mobileFovMultiplier:e.mobileFovMultiplier,positionOffset:e.positionOffset,mobilePositionOffset:e.mobilePositionOffset,rotationOffset:e.rotationOffset,mobileRotationOffset:e.mobileRotationOffset}),H.jsx(Yr,{cameraObject:N,cameraRigObject:Z,position:e.position,target:e.target,animation:e.animation,positionOffset:e.positionOffset,mobilePositionOffset:e.mobilePositionOffset,rotationOffset:e.rotationOffset,mobileRotationOffset:e.mobileRotationOffset,pointerInfluence:e.pointerInfluence,behindPointerInfluence:E.pointerInfluence,scrollDrift:e.scrollDrift,motion:W,cameraDollyOffset:a,cameraDollyTransitionOffset:r}),H.jsxs("primitive",{object:le,children:[H.jsx(Aa,{url:T.url,background:fe,blur:T.blur,darken:T.darken,rotation:T.rotation}),H.jsx(Ra,{fluid:t.pointcloud.fluid,fluidVelocityRef:j,driveFluid:o.driveFluid,scrollVelocity:o.scrollVelocity,motion:W}),i&&H.jsx(d.Suspense,{fallback:null,children:H.jsx(Gt,{sourceUrl:i.videoUrl,ktx2Url:i.ktx2Url,depthMapUrl:i.depthMapUrl,settings:i,groupRef:Q,behindSpeed:E.speed,quality:z,timeScale:i.timeScale??1,motion:W,fluidVelocityRef:j,externalLoadFadeRef:Ee})}),u&&H.jsx(d.Suspense,{fallback:null,children:H.jsx(Gt,{sourceUrl:u.videoUrl,ktx2Url:u.ktx2Url,depthMapUrl:u.depthMapUrl,settings:u,groupRef:g,behindSpeed:E.speed,quality:z,timeScale:u.timeScale??1,motion:W,fluidVelocityRef:j})}),H.jsx(d.Suspense,{fallback:null,children:H.jsx(_a,{pointcloud:t.pointcloud,id:t.id,motion:W,fluidVelocityRef:j,visibility:o.visibility,pointSizeScale:o.pointSizeScale??1,position:Re,rotation:pe,scale:o.scale,opacity:o.opacity,exposure:o.exposure,transparent:o.transparent,blendMode:o.blendMode,simplePoints:o.simplePoints,randomize:o.randomize,cameraFade:o.cameraFade,introColorMix:o.introColorMix,timeScale:o.timeScale,behindSpeed:E.speed,reduceQualityBehind:E.reduceQuality,behindOffset:E.offset,renderDpr:R,renderScale:A,parentObject:le,onLoad:te,onError:$,loadingHandle:M,children:H.jsx(La,{pointCloudRef:q,pointCloudVersion:ie,sdfs:v,showHelpers:b,children:H.jsx(hr,{value:j,children:w})})})})]}),H.jsx(vo,{bloom:n.bloom,bloomEnabled:n.bloomEnabled,chromaticEnabled:n.chromaticEnabled,chromaticAmount:n.chromaticAmount,chromaticAngle:n.chromaticAngle,vignetteEnabled:n.vignetteEnabled,vignetteAmount:n.vignetteAmount,vignetteRadius:n.vignetteRadius,vignetteSoftness:n.vignetteSoftness,heroBottomGradient:n.heroBottomGradient,afterimageEnabled:n.afterimageEnabled,afterimageStrength:n.afterimageStrength,afterimageDamp:n.afterimageDamp,afterimageScrollFadeLerp:n.afterimageScrollFadeLerp,afterimageThreshold:n.afterimageThreshold,noiseEnabled:n.noiseEnabled,noiseAmount:n.noiseAmount,noiseScale:n.noiseScale,toneMapping:n.toneMapping,toneMappingExposure:n.toneMappingExposure,outputTextureRef:G,foregroundTextureRef:ge,dryTextureRef:w?Ce:void 0,fboDpr:F,renderScale:A,reduceQualityBehind:E.reduceQuality,behindOffset:E.offset,dryLayerMsaa:O,transparentBackground:Me.mode!=="none",motion:W,fluidVelocityRef:j,pointCloudRef:q,foregroundVideoLightVolumeRef:g,videoLightVolumeRef:Q,renderScene:ue,renderCamera:N})]}),ue,{scene:ue,camera:N}),H.jsx("primitive",{object:Ae.mesh})]})}export{X as I,qo as S,vr as a,bo as b,Co as d,$o as s};
//# sourceMappingURL=SectionScene-BsMDl5Sl.js.map
