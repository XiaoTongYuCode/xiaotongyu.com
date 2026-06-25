var Sr=Object.defineProperty;var Rt=n=>{throw TypeError(n)};var Cr=(n,o,e)=>o in n?Sr(n,o,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[o]=e;var _e=(n,o,e)=>Cr(n,typeof o!="symbol"?o+"":o,e),et=(n,o,e)=>o.has(n)||Rt("Cannot "+e);var t=(n,o,e)=>(et(n,o,"read from private field"),e?e.call(n):o.get(n)),S=(n,o,e)=>o.has(n)?Rt("Cannot add the same private member more than once"):o instanceof WeakSet?o.add(n):o.set(n,e),C=(n,o,e,i)=>(et(n,o,"write to private field"),i?i.call(n,e):o.set(n,e),e),T=(n,o,e)=>(et(n,o,"access private method"),e);import{j as $}from"./jsx-runtime-D_zvdyIk.js";import{r as d}from"./chunk-EPOLDU6W-CgSudzSq.js";import{W as yr,L as Bt,a6 as kt,a as Dr,bs as Tr,e as te,V as Z,O as Lt,M as lt,bk as Ot,d as ct,u as zt,i as ke,v as tt,Q as bt,P as Nt,y as Ur,w as Pr,bQ as Er,t as F,bJ as Rr,T as Br}from"./TierResolver-nYYMFDvd.js";import{R as br,P as Ar,a as Mr,b as Ir}from"./index-CW_tL5Oi.js";import{D as Wr,e as Vr,H as Fr,R as _r,f as Ht,a as kr,S as Lr}from"./useElementVisibility-CjBIXy3R.js";import{S as Or}from"./SceneDataContext-CAq341Xd.js";import{H as At}from"./sectionModels-BCRoCzB2.js";import{S as zr}from"./GltfAsset-BLMCxzHy.js";import{d as Nr,a as Hr,b as Gr}from"./renderScaleResolve-BAuFPf4b.js";import{i as qr}from"./EnvironmentObject-Dlj4s8zO.js";import{g as Gt,c as Mt,k as It,d as Wt,e as Yr,M as J,f as Oe,h as Vt,m as Zr,i as jr,u as $r}from"./useSectionRegistry-D8UPIPk2.js";import{a as Kr}from"./useAssetLoadingStore-BRtoZ4kO.js";import{u as Qr,g as rt}from"./postEffectRegistry-5s3S_tnT.js";import{u as Ft,t as Xr}from"./constants-D_Mco9k_.js";var k,L,pe,he,ee,nt,ot;class Jr{constructor(){S(this,ee);S(this,k,null);S(this,L,null);S(this,pe,1);S(this,he,1)}current(){return t(this,k)??C(this,k,T(this,ee,ot).call(this)),t(this,k)}incoming(){return t(this,L)??C(this,L,T(this,ee,ot).call(this)),t(this,L)}setSize(o,e){C(this,pe,o),C(this,he,e),t(this,k)&&T(this,ee,nt).call(this,t(this,k),o,e),t(this,L)&&T(this,ee,nt).call(this,t(this,L),o,e)}dispose(){var o,e;(o=t(this,k))==null||o.dispose(),(e=t(this,L))==null||e.dispose(),C(this,k,null),C(this,L,null)}}k=new WeakMap,L=new WeakMap,pe=new WeakMap,he=new WeakMap,ee=new WeakSet,nt=function(o,e,i){o.setSize(e,i);const s=o.depthTexture;s&&(s.image.width!==e||s.image.height!==i)&&(s.image.width=e,s.image.height=i,s.needsUpdate=!0)},ot=function(){const o=new yr(t(this,pe),t(this,he),{type:kt,depthBuffer:!0,stencilBuffer:!1,minFilter:Bt,magFilter:Bt});return o.depthTexture=new Dr(t(this,pe),t(this,he)),o.depthTexture.type=Tr,o};const qt=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,fe={vertexShader:qt,depthTest:!1,depthWrite:!1},He=`
  bool currentCloser = false;
  if (uFullyEntered > 0.5) {
    float depthCurrent = texture2D(tCurrentDepth, vUv).r;
    float depthIncoming = texture2D(tIncomingDepth, vUv).r;
    currentCloser = depthCurrent < depthIncoming;
  }
`;function en(){return new te({...fe,uniforms:{tCurrent:{value:null},tIncoming:{value:null},tCurrentDepth:{value:null},tIncomingDepth:{value:null},uProgress:{value:0},uDirection:{value:new Z(0,-1)},uFullyEntered:{value:0},uViewportBottomVUv:{value:0},uScrollBendVUv:{value:0}},fragmentShader:`
      uniform sampler2D tCurrent;
      uniform sampler2D tIncoming;
      uniform sampler2D tCurrentDepth;
      uniform sampler2D tIncomingDepth;
      uniform float uProgress;
      uniform vec2 uDirection;
      uniform float uFullyEntered;
      uniform float uViewportBottomVUv;
      uniform float uScrollBendVUv;
      varying vec2 vUv;

      // Match knockoutShader's scrollBendY exactly: same arch shape, same
      // detuned-π pair, so the cut edge tracks the knockout cover edges.
      float scrollBendY(float x) {
        float t = clamp(x, 0.0, 1.0);
        float arch = sin(t * 3.14159265);
        return (arch + sin(t * 3.1431853) * 2.0) * uScrollBendVUv;
      }

      void main() {
        vec4 current = texture2D(tCurrent, vUv);
        vec4 incoming = texture2D(tIncoming, vUv);
        ${He}
        // Guard normalize(vec2(0,0)) — undefined in GLSL.
        vec2 dir = length(uDirection) > 0.0001
          ? normalize(uDirection)
          : vec2(0.0, -1.0);
        float scale = max(0.5 * (abs(dir.x) + abs(dir.y)), 0.0001);
        // Remap vUv.y into the visible viewport span so the cut tracks
        // window.innerHeight, not the taller canvas (window.outerHeight).
        vec2 visibleVUv = vec2(
          vUv.x,
          (vUv.y - uViewportBottomVUv) / max(1.0 - uViewportBottomVUv, 0.0001)
        );
        vec2 bentVisibleVUv = vec2(
          visibleVUv.x,
          visibleVUv.y - scrollBendY(visibleVUv.x)
        );
        float norm = dot(bentVisibleVUv - 0.5, dir) / scale;
        // Cut traverses the viewport linearly with progress so it tracks the
        // knockout cover bottom edge (which moves linearly with scroll). A
        // bend-amplitude factor on edgeTravel would speed the cut up vs the
        // cover at non-midpoint progress and they only align where the
        // formula collapses (progress=0.5). Any bleed near viewport corners
        // at peak velocity is hidden by the knockout cover drawn on top.
        float edge = 1.0 - 2.0 * uProgress;
        // Narrow smoothstep band (~1 fragment at innerHeight = 800) so
        // diagonal directions or arched cuts don't stair-step inside any
        // cover-free region. Fixed band keeps this portable without the
        // derivative extension.
        float mask = smoothstep(edge - 0.003, edge + 0.003, norm);
        vec4 mixed = mix(current, incoming, mask);
        gl_FragColor = currentCloser ? current : mixed;
      }
    `})}function tn(){return new te({...fe,uniforms:{tInput:{value:null}},fragmentShader:`
      uniform sampler2D tInput;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(tInput, vUv);
      }
    `})}function rn(){return new te({...fe,uniforms:{tCurrent:{value:null},tIncoming:{value:null},tCurrentDepth:{value:null},tIncomingDepth:{value:null},uProgress:{value:0},uFullyEntered:{value:0}},fragmentShader:`
      uniform sampler2D tCurrent;
      uniform sampler2D tIncoming;
      uniform sampler2D tCurrentDepth;
      uniform sampler2D tIncomingDepth;
      uniform float uProgress;
      uniform float uFullyEntered;
      varying vec2 vUv;
      void main() {
        vec4 current = texture2D(tCurrent, vUv);
        vec4 incoming = texture2D(tIncoming, vUv);
        ${He}
        vec4 mixed = mix(current, incoming, uProgress);
        gl_FragColor = currentCloser ? current : mixed;
      }
    `})}function nn(){return new te({...fe,uniforms:{tCurrent:{value:null},tIncoming:{value:null},tCurrentDepth:{value:null},tIncomingDepth:{value:null},uProgress:{value:0},uFullyEntered:{value:0},uReducedMotion:{value:0},uTime:{value:0},uScrollProgress:{value:0},uScrollBendVUv:{value:0},uAspect:{value:1},uCenter:{value:new Z(.5,.5)},uNoiseStrength:{value:.2},uMudStrength:{value:.35},uEdgeStrength:{value:1},uGlowStrength:{value:1},uZoomStrength:{value:.1},uTextureScale:{value:1},uDistance:{value:1},uMode:{value:0},uAngle:{value:0},uSpread:{value:1.2},uBend:{value:0},uWipeSharpness:{value:2},uWipeWaveAmp:{value:.4},uWipeWaveFreq:{value:0},uWipeWaveSpeed:{value:2},uWipeWaveScroll:{value:1},uWipeScrollBend:{value:0},uWipeDistort:{value:new Z(.5,1)},uWipeTranslate:{value:new Z(-.2,.5)},uWipeSwayAmp:{value:.2},uWipeSwayFreq:{value:-.5},uWipeSwaySpeed:{value:1},uWipeSwayWhole:{value:.5}},fragmentShader:`
      uniform sampler2D tCurrent;
      uniform sampler2D tIncoming;
      uniform sampler2D tCurrentDepth;
      uniform sampler2D tIncomingDepth;
      uniform float uProgress;
      uniform float uFullyEntered;
      uniform float uReducedMotion;
      uniform float uTime;
      uniform float uScrollProgress;
      uniform float uScrollBendVUv;
      uniform float uAspect;
      uniform vec2 uCenter;
      uniform float uNoiseStrength;
      uniform float uMudStrength;
      uniform float uEdgeStrength;
      uniform float uGlowStrength;
      uniform float uZoomStrength;
      uniform float uTextureScale;
      uniform float uDistance;
      uniform float uMode;
      uniform float uAngle;
      uniform float uSpread;
      uniform float uBend;
      uniform float uWipeSharpness;
      uniform float uWipeWaveAmp;
      uniform float uWipeWaveFreq;
      uniform float uWipeWaveSpeed;
      uniform float uWipeWaveScroll;
      uniform float uWipeScrollBend;
      uniform vec2 uWipeDistort;
      uniform vec2 uWipeTranslate;
      uniform float uWipeSwayAmp;
      uniform float uWipeSwayFreq;
      uniform float uWipeSwaySpeed;
      uniform float uWipeSwayWhole;
      varying vec2 vUv;

      const float PI = 3.14159265;
      const float TWO_PI = 6.28318530;

      float tri(float t) {
        return 1.0 - abs(2.0 * t - 1.0);
      }

      float sineInOut(float t) {
        return -0.5 * (cos(PI * t) - 1.0);
      }

      vec2 rotate2d(vec2 v, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
      }

      float scrollBendYUv(float x) {
        float t = clamp(x, 0.0, 1.0);
        return sin(t * PI) * 3.0 * uScrollBendVUv * uWipeScrollBend;
      }

      void main() {
        float progress = clamp(uProgress, 0.0, 1.0);
        ${He}

        if (progress <= 0.0) {
          gl_FragColor = texture2D(tCurrent, vUv);
          return;
        }
        if (progress >= 1.0 && uDistance >= 0.999) {
          gl_FragColor = currentCloser
            ? texture2D(tCurrent, vUv)
            : texture2D(tIncoming, vUv);
          return;
        }

        float time2pi = uTime * TWO_PI;
        vec2 center = clamp(uCenter, vec2(0.0), vec2(1.0));
        vec2 dv = (vUv - center) * vec2(uAspect, 1.0);
        float radial = length(dv);
        vec2 farCorner = max(center, 1.0 - center) * vec2(uAspect, 1.0);
        float maxDist = length(farCorner);
        float feather = max(0.02, 0.08 * uSpread);
        float radialDistance = max(uDistance, 0.0);
        float radialEdge = progress * (maxDist * radialDistance + feather * 2.0) - feather;
        float radialTransition = 1.0 - smoothstep(
          radialEdge - feather,
          radialEdge + feather,
          radial
        );

        vec2 direction = vec2(cos(uAngle), sin(uAngle));
        vec2 tangent = vec2(-direction.y, direction.x);
        vec2 radialDirection = radial > 0.0001
          ? normalize(vec2(dv.x / max(uAspect, 0.001), dv.y))
          : direction;

        float pixelTransition = radialTransition;
        vec2 uv1 = vUv;
        vec2 uv2 = vUv;

        if (uMode > 0.5) {
          // y11i study-005 preset 1 values are exposed in Theatre under
          // Wipe settings: https://y11i-3d.github.io/study-005/
          // Sharpness/frequencies use y11i's 2 ** value scale.
          float wipeSharpness = pow(2.0, uWipeSharpness);
          vec2 wipeDirection = normalize(vec2(sin(uAngle), cos(uAngle)));
          vec2 wipeUv = rotate2d(vUv * vec2(uAspect, 1.0), uAngle);
          float wipeWave = sin(
            wipeUv.x / max(uAspect, 0.001) * TWO_PI * pow(2.0, uWipeWaveFreq) +
            time2pi * uWipeWaveSpeed +
            uScrollProgress * TWO_PI * uWipeWaveScroll
          ) * uWipeWaveAmp * tri(progress);
          float wipeExtent = abs(wipeDirection.x) * 0.5 + abs(wipeDirection.y) * 0.5;
          // Subtract in UV space to match knockout's top-left pixel bend convention.
          vec2 bentWipeUv = vec2(vUv.x, vUv.y - scrollBendYUv(vUv.x));
          float wipePosition = dot(bentWipeUv - 0.5, wipeDirection) / max(wipeExtent * 2.0, 0.001) + 0.5;
          float wipeFeather = 0.5 / max(wipeSharpness, 0.001);
          float wipeEdge = mix(-wipeFeather, 1.0 + wipeFeather, progress) + wipeWave;
          pixelTransition = 1.0 - smoothstep(
            wipeEdge - wipeFeather,
            wipeEdge + wipeFeather,
            wipePosition
          );

          vec2 translate = uWipeTranslate;
          vec2 distort = uWipeDistort;
          vec2 translate1 = translate * progress;
          vec2 translate2 = translate * (progress - 1.0);
          vec2 distort1 = translate * pixelTransition * distort;
          vec2 distort2 = translate * (pixelTransition - 1.0) * distort;
          float sway = sin(
            time2pi * uWipeSwaySpeed +
            vUv.x * TWO_PI * pow(2.0, uWipeSwayFreq)
          ) * uWipeSwayAmp;
          float swayBlend = mix(
            tri(pixelTransition),
            tri(progress),
            uWipeSwayWhole
          );
          sway *= sineInOut(swayBlend);
          vec2 bend = radialDirection * uBend * tri(pixelTransition) * sineInOut(tri(progress)) * 0.18;
          vec2 displacement1 = translate1 + distort1 + vec2(0.0, sway) + bend;
          vec2 displacement2 = translate2 + distort2 + vec2(0.0, sway) + bend;
          float topFade = 1.0 - smoothstep(0.72, 0.98, vUv.y);
          displacement1 *= mix(1.0, topFade, step(0.0, displacement1.y));
          displacement2 *= mix(1.0, topFade, step(0.0, displacement2.y));
          uv1 = vUv + displacement1;
          uv2 = vUv + displacement2;
        } else {
          float seamMask = tri(pixelTransition);
          vec2 translate = direction * clamp(uZoomStrength * 4.0, 0.0, 2.0) * 0.25;
          vec2 distort = vec2(1.0, 2.5) * max(uMudStrength, 0.0);

          vec2 translate1 = translate * progress * seamMask;
          vec2 translate2 = translate * (progress - 1.0) * seamMask;
          vec2 distort1 = translate * (pixelTransition * distort) * seamMask;
          vec2 distort2 = translate * ((pixelTransition - 1.0) * distort) * seamMask;

          float angleNoise = dot(vUv - center, tangent) * TWO_PI * max(uTextureScale, 0.001);
          float swayBase = sin(time2pi + angleNoise) * uNoiseStrength;
          float swayBlend = mix(tri(pixelTransition), tri(progress), 0.5);
          vec2 sway = tangent * swayBase * sineInOut(swayBlend) * seamMask;
          vec2 bend = radialDirection * uBend * seamMask * sineInOut(tri(progress)) * 0.18;
          uv1 = vUv + translate1 + distort1 + sway + bend;
          uv2 = vUv + translate2 + distort2 + sway + bend;
        }
        // Reduced motion: skip the scene-texture displacement (translate /
        // distort / sway / bend) so neither scene slides up or sideways as the
        // swipe passes — only the wipe boundary reveals. (Zoom enters via
        // translate/uZoomStrength, so resetting the UVs neutralizes it too.)
        if (uReducedMotion > 0.5) {
          uv1 = vUv;
          uv2 = vUv;
        }
        vec4 current = texture2D(tCurrent, uv1);
        vec4 incoming = texture2D(tIncoming, uv2);
        vec4 mixed = mix(current, incoming, pixelTransition);

        float edge = tri(pixelTransition);
        mixed = mix(mixed, vec4(vec3(1.0), 1.0), edge * uEdgeStrength * 0.18);
        mixed = mix(mixed, mixed * mix(1.0, 2.5, edge), edge * uGlowStrength * 0.35);

        gl_FragColor = currentCloser ? texture2D(tCurrent, vUv) : mixed;
      }
    `})}function on(){return new te({...fe,uniforms:{tCurrent:{value:null},tIncoming:{value:null},uProgress:{value:0},uOrigin:{value:new Z(.5,.5)},uSoftness:{value:.25},uEdgeGlow:{value:.4},uZoom:{value:.08},uAspect:{value:1}},fragmentShader:`
      uniform sampler2D tCurrent;
      uniform sampler2D tIncoming;
      uniform float uProgress;
      uniform vec2 uOrigin;
      uniform float uSoftness;
      uniform float uEdgeGlow;
      uniform float uZoom;
      uniform float uAspect;
      varying vec2 vUv;

      // Aspect-correct distance so the iris is circular on non-square canvases.
      float aspectDist(vec2 uv) {
        return length((uv - uOrigin) * vec2(uAspect, 1.0));
      }

      void main() {
        // Normalise distance so the farthest corner from the origin maps to 1,
        // guaranteeing the iris fully clears the screen at progress 1.
        float maxDist = max(
          max(aspectDist(vec2(0.0, 0.0)), aspectDist(vec2(1.0, 0.0))),
          max(aspectDist(vec2(0.0, 1.0)), aspectDist(vec2(1.0, 1.0)))
        );
        float nd = aspectDist(vUv) / max(maxDist, 0.0001);

        float softness = max(uSoftness, 0.0001);
        // Travel the front past 1 by softness on each end so the feather
        // band fully clears at progress 0 and 1 (no residual ring).
        float radius = uProgress * (1.0 + 2.0 * softness) - softness;
        float mask = 1.0 - smoothstep(radius - softness, radius + softness, nd);

        // Incoming zooms from (1 - uZoom) toward 1 as it reveals, scaling about
        // the origin so the reveal feels like it pushes forward.
        float scale = mix(1.0 - uZoom, 1.0, uProgress);
        vec2 zoomUv = uOrigin + (vUv - uOrigin) / max(scale, 0.0001);
        vec4 incoming = texture2D(tIncoming, zoomUv);
        vec4 current = texture2D(tCurrent, vUv);
        vec4 mixed = mix(current, incoming, mask);

        // Luminous leading edge on the reveal front; naturally vanishes at the
        // extremes where the front sits off-screen.
        float edge = 1.0 - smoothstep(0.0, softness, abs(nd - radius));
        mixed.rgb += edge * uEdgeGlow * mask;

        gl_FragColor = mixed;
      }
    `})}function sn(){return new te({...fe,uniforms:{tCurrent:{value:null},tIncoming:{value:null},tCurrentDepth:{value:null},tIncomingDepth:{value:null},uProgress:{value:0},uDirection:{value:new Z(1,0)},uFeather:{value:0},uFullyEntered:{value:0},uViewportBottomVUv:{value:0},uNoiseAmount:{value:0}},fragmentShader:`
      uniform sampler2D tCurrent;
      uniform sampler2D tIncoming;
      uniform sampler2D tCurrentDepth;
      uniform sampler2D tIncomingDepth;
      uniform float uProgress;
      uniform vec2 uDirection;
      uniform float uFeather;
      uniform float uFullyEntered;
      uniform float uViewportBottomVUv;
      uniform float uNoiseAmount;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += noise(p) * amplitude;
          p = p * 2.03 + 17.13;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec4 current = texture2D(tCurrent, vUv);
        vec4 incoming = texture2D(tIncoming, vUv);
        ${He}
        // Guard normalize(vec2(0,0)) — undefined in GLSL.
        vec2 dir = length(uDirection) > 0.0001
          ? normalize(uDirection)
          : vec2(1.0, 0.0);
        float scale = max(0.5 * (abs(dir.x) + abs(dir.y)), 0.0001);
        // Remap vUv.y into the visible viewport span so the wipe edge tracks
        // window.innerHeight, not the taller canvas (window.outerHeight).
        vec2 visibleVUv = vec2(
          vUv.x,
          (vUv.y - uViewportBottomVUv) / max(1.0 - uViewportBottomVUv, 0.0001)
        );
        float norm = dot(visibleVUv - 0.5, dir) / scale;
        // Extend edge travel by feather on each side so the feather band
        // clears [-1, 1] at both extremes — otherwise a non-zero feather
        // leaves a seam of the opposite scene at progress 0 and 1.
        float feather = max(uFeather, 0.0001);
        // Skip the 16-hash fbm walk when the dissolve is disabled.
        float transitionNoise = uNoiseAmount > 0.0
          ? (fbm(visibleVUv * vec2(3.5, 5.5) + uProgress * 1.7) - 0.5) * uNoiseAmount
          : 0.0;
        // Include uNoiseAmount in edgeTravel so transitionNoise can't pull the
        // wipe back on-screen at progress 0/1 (where the noise is signed and
        // the mask would otherwise reveal a sliver of the wrong scene).
        float edgeTravel = 1.0 + feather + uNoiseAmount;
        float edge = edgeTravel * (1.0 - 2.0 * uProgress) + transitionNoise;
        float mask = smoothstep(edge - feather, edge + feather, norm);
        vec4 mixed = mix(current, incoming, mask);
        gl_FragColor = currentCloser ? current : mixed;
      }
    `})}function an(){return new te({...fe,uniforms:{tCurrent:{value:null},tIncoming:{value:null},uProgress:{value:0},uStrength:{value:1}},fragmentShader:`
      uniform sampler2D tCurrent;
      uniform sampler2D tIncoming;
      uniform float uProgress;
      uniform float uStrength;
      varying vec2 vUv;

      vec4 softSample(sampler2D tex, vec2 uv) {
        vec4 c = texture2D(tex, clamp(uv, 0.0, 1.0));
        vec2 outside = max(vec2(0.0), max(vec2(0.0) - uv, uv - vec2(1.0)));
        float d = length(outside);
        float mask = 1.0 - smoothstep(0.0, 0.03, d);
        c.rgb *= mask;
        c.a *= mask;
        return c;
      }

      float random(vec3 scale, float seed) {
        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
      }

      vec4 zoomSample(sampler2D tex, vec2 uv, vec2 center, float scale, float blur) {
        vec2 scaledUv = (uv - center) / scale + center;
        if (blur < 0.001) {
          return softSample(tex, scaledUv);
        }
        vec4 color = vec4(0.0);
        float total = 0.0;
        vec2 toCenter = center - scaledUv;
        float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
        const float SAMPLES = 15.0;
        for (float t = 0.0; t < SAMPLES; t++) {
          float percent = (t + offset) / SAMPLES;
          float weight = 4.0 * (percent - percent * percent);
          vec2 sampleUv = scaledUv + toCenter * percent * blur;
          color += softSample(tex, sampleUv) * weight;
          total += weight;
        }
        return color / total;
      }

      void main() {
        float p = uProgress;
        vec2 center = vec2(0.5, 0.5);

        float currentScale = mix(1.0, 1.0 + 2.0 * uStrength, p);
        float currentBlur = mix(0.0, 0.6 * uStrength, p);
        float nextBlur = mix(0.3 * uStrength, 0.0, p);

        vec4 currentCol = zoomSample(tCurrent, vUv, center, currentScale, currentBlur);
        vec4 nextCol = zoomSample(tIncoming, vUv, center, 1.0, nextBlur);

        float fade = smoothstep(0.55, 1.0, p);
        gl_FragColor = mix(currentCol, nextCol, fade);
      }
    `})}var ae,ut,O,K,z,Q,ge,ze,ue,N,H,G,q,le,ce,we,Be,xe,A,it,Yt,Zt,jt,st;class un extends br{constructor(e,i){const s=new ct;super(s,e);S(this,A);_e(this,"mainScenes",[]);_e(this,"transitioningSection",null);_e(this,"transitioningCamera",null);S(this,ae);S(this,ut,"");S(this,O,0);S(this,K,0);S(this,z,0);S(this,Q,0);S(this,ge);S(this,ze,new Lt(-1,1,1,-1,0,1));S(this,ue,tn());S(this,N,rn());S(this,H,nn());S(this,G,sn());S(this,q,en());S(this,le,an());S(this,ce,on());S(this,we,new lt(new Ot(2,2),t(this,ue)));S(this,Be,null);S(this,xe,null);C(this,ge,s),C(this,ae,i),t(this,ge).add(t(this,we))}setSize(e,i){super.setSize(e,i),t(this,ae).setSize(e,i)}knockoutLayerTargets(){return{current:t(this,Be),incoming:t(this,xe)}}render(e,i){const{mainScenes:s,transitioningSection:u}=this;(u==null?void 0:u.mode)!=="hero"&&T(this,A,Yt).call(this);const x=e.autoClear;e.autoClear=!1;const v=t(this,ae).current();C(this,Be,v),C(this,xe,null),e.setRenderTarget(v),e.setClearColor(8421504,1),e.clear();for(const w of s)e.render(w,this.camera);let r;if(u){const w=t(this,ae).incoming();if(C(this,xe,w),e.setRenderTarget(w),e.setClearColor(8421504,1),e.clear(),e.render(u.scene,this.transitioningCamera??this.camera),u.mode==="zoomBlur")r=t(this,le),r.uniforms.tCurrent.value=v.texture,r.uniforms.tIncoming.value=w.texture,r.uniforms.uProgress.value=u.progress,r.uniforms.uStrength.value=u.zoomBlurStrength;else if(u.mode==="crossfade")r=t(this,N),r.uniforms.tCurrent.value=v.texture,r.uniforms.tIncoming.value=w.texture,r.uniforms.tCurrentDepth.value=v.depthTexture,r.uniforms.tIncomingDepth.value=w.depthTexture,r.uniforms.uProgress.value=u.progress,r.uniforms.uFullyEntered.value=!u.disableDepthMerge&&u.progress>=1?1:0;else if(u.mode==="hero"){const c=u.hero;r=t(this,H),r.uniforms.tCurrent.value=v.texture,r.uniforms.tIncoming.value=w.texture,r.uniforms.tCurrentDepth.value=v.depthTexture,r.uniforms.tIncomingDepth.value=w.depthTexture,r.uniforms.uProgress.value=u.progress,r.uniforms.uFullyEntered.value=!u.disableDepthMerge&&u.progress>=1?1:0,r.uniforms.uTime.value=performance.now()/1e3%1e3;const p=Ft.getState().preferReducedMotion;r.uniforms.uReducedMotion.value=p?1:0,r.uniforms.uScrollProgress.value=p?0:T(this,A,Zt).call(this,u.scrollProgress,c.wipe.waveScrollLerp),r.uniforms.uScrollBendVUv.value=p?0:T(this,A,jt).call(this,T(this,A,st).call(this),c.wipe.scrollBendLerp),r.uniforms.uAspect.value=e.domElement.clientWidth/Math.max(e.domElement.clientHeight,1),r.uniforms.uCenter.value.set(c.center.x,c.center.y),r.uniforms.uNoiseStrength.value=c.noiseStrength,r.uniforms.uMudStrength.value=c.textureStrength,r.uniforms.uEdgeStrength.value=c.outlineStrength,r.uniforms.uGlowStrength.value=c.glowStrength,r.uniforms.uZoomStrength.value=c.zoomStrength,r.uniforms.uTextureScale.value=c.textureScale,r.uniforms.uDistance.value=c.distance,r.uniforms.uMode.value=c.mode==="wipe"?1:0,r.uniforms.uAngle.value=c.angleDeg*Math.PI/180,r.uniforms.uSpread.value=c.spread,r.uniforms.uBend.value=c.bend,r.uniforms.uWipeSharpness.value=c.wipe.sharpness,r.uniforms.uWipeWaveAmp.value=c.wipe.waveAmp,r.uniforms.uWipeWaveFreq.value=c.wipe.waveFreq,r.uniforms.uWipeWaveSpeed.value=c.wipe.waveSpeed,r.uniforms.uWipeWaveScroll.value=c.wipe.waveScroll,r.uniforms.uWipeScrollBend.value=c.wipe.scrollBend,r.uniforms.uWipeDistort.value.set(c.wipe.distort.x,c.wipe.distort.y),r.uniforms.uWipeTranslate.value.set(c.wipe.translate.x,c.wipe.translate.y),r.uniforms.uWipeSwayAmp.value=c.wipe.swayAmp,r.uniforms.uWipeSwayFreq.value=c.wipe.swayFreq,r.uniforms.uWipeSwaySpeed.value=c.wipe.swaySpeed,r.uniforms.uWipeSwayWhole.value=c.wipe.swayWhole}else if(u.mode==="reveal"){const c=u.reveal;r=t(this,ce),r.uniforms.tCurrent.value=v.texture,r.uniforms.tIncoming.value=w.texture,r.uniforms.uProgress.value=u.progress,r.uniforms.uOrigin.value.set(c.origin.x,c.origin.y),r.uniforms.uSoftness.value=c.softness,r.uniforms.uEdgeGlow.value=c.edgeGlow,r.uniforms.uZoom.value=c.zoom,r.uniforms.uAspect.value=e.domElement.clientWidth/Math.max(e.domElement.clientHeight,1)}else u.mode==="bend"?(r=t(this,q),r.uniforms.uDirection.value.set(u.bendDirection.x,u.bendDirection.y),r.uniforms.tCurrent.value=v.texture,r.uniforms.tIncoming.value=w.texture,r.uniforms.tCurrentDepth.value=v.depthTexture,r.uniforms.tIncomingDepth.value=w.depthTexture,r.uniforms.uProgress.value=u.progress,r.uniforms.uFullyEntered.value=!u.disableDepthMerge&&u.progress>=1?1:0,r.uniforms.uViewportBottomVUv.value=T(this,A,it).call(this,e,v.height),r.uniforms.uScrollBendVUv.value=Ft.getState().preferReducedMotion?0:T(this,A,st).call(this)):(r=t(this,G),r.uniforms.uDirection.value.set(u.swipeDirection.x,u.swipeDirection.y),r.uniforms.uFeather.value=u.swipeFeather,r.uniforms.uNoiseAmount.value=u.swipeNoiseAmount,r.uniforms.tCurrent.value=v.texture,r.uniforms.tIncoming.value=w.texture,r.uniforms.tCurrentDepth.value=v.depthTexture,r.uniforms.tIncomingDepth.value=w.depthTexture,r.uniforms.uProgress.value=u.progress,r.uniforms.uFullyEntered.value=!u.disableDepthMerge&&u.progress>=1?1:0,r.uniforms.uViewportBottomVUv.value=T(this,A,it).call(this,e,v.height))}else r=t(this,ue),r.uniforms.tInput.value=v.texture;t(this,we).material=r,e.setRenderTarget(this.renderToScreen?null:i),e.render(t(this,ge),t(this,ze)),e.autoClear=x}dispose(){t(this,ue).uniforms.tInput.value=null,t(this,N).uniforms.tCurrent.value=null,t(this,N).uniforms.tIncoming.value=null,t(this,N).uniforms.tCurrentDepth.value=null,t(this,N).uniforms.tIncomingDepth.value=null,t(this,H).uniforms.tCurrent.value=null,t(this,H).uniforms.tIncoming.value=null,t(this,H).uniforms.tCurrentDepth.value=null,t(this,H).uniforms.tIncomingDepth.value=null,t(this,G).uniforms.tCurrent.value=null,t(this,G).uniforms.tIncoming.value=null,t(this,G).uniforms.tCurrentDepth.value=null,t(this,G).uniforms.tIncomingDepth.value=null,t(this,q).uniforms.tCurrent.value=null,t(this,q).uniforms.tIncoming.value=null,t(this,q).uniforms.tCurrentDepth.value=null,t(this,q).uniforms.tIncomingDepth.value=null,t(this,le).uniforms.tCurrent.value=null,t(this,le).uniforms.tIncoming.value=null,t(this,ce).uniforms.tCurrent.value=null,t(this,ce).uniforms.tIncoming.value=null,t(this,ue).dispose(),t(this,N).dispose(),t(this,H).dispose(),t(this,G).dispose(),t(this,q).dispose(),t(this,le).dispose(),t(this,ce).dispose(),t(this,we).geometry.dispose(),super.dispose()}}ae=new WeakMap,ut=new WeakMap,O=new WeakMap,K=new WeakMap,z=new WeakMap,Q=new WeakMap,ge=new WeakMap,ze=new WeakMap,ue=new WeakMap,N=new WeakMap,H=new WeakMap,G=new WeakMap,q=new WeakMap,le=new WeakMap,ce=new WeakMap,we=new WeakMap,Be=new WeakMap,xe=new WeakMap,A=new WeakSet,it=function(e,i){return Math.max(0,1-window.innerHeight*e.getPixelRatio()/i)},Yt=function(){C(this,O,0),C(this,K,0),C(this,z,0),C(this,Q,0)},Zt=function(e,i){const s=performance.now();if(t(this,Q)===0)return C(this,Q,s),C(this,z,e),t(this,z);const u=Math.min((s-t(this,Q))/1e3,1/30);C(this,Q,s);const x=1-Math.exp(-u*Math.max(i,.001));return C(this,z,t(this,z)+(e-t(this,z))*x),t(this,z)},jt=function(e,i){const s=performance.now();if(t(this,K)===0)return C(this,K,s),C(this,O,0),t(this,O);const u=Math.min((s-t(this,K))/1e3,1/30);C(this,K,s);const x=1-Math.exp(-u*Math.max(i,.001));return C(this,O,t(this,O)+(e-t(this,O))*x),t(this,O)},st=function(){const e=window.innerHeight;return e>0?Gt()/e:0};const ln={b100:"#090909"},W=1,cn=4,mn=`
  precision highp float;

  uniform sampler2D tInput;
  uniform vec2 uViewport;
  uniform float uUseBaseLayer;
  uniform float uUseCutouts;
  uniform int uCoverCount;
  uniform vec4 uCovers[${J}];
  uniform float uCoverPinBottom[${J}];
  uniform float uCoverPinTop[${J}];
  uniform int uCutoutCount;
  uniform vec4 uCutouts[${Oe}];
  uniform float uUseTransition;
  uniform float uInvertTransition;
  uniform float uTransitionProgress;
  uniform vec2 uTransitionDirection;
  uniform float uViewportBottomVUv;
  uniform float uScrollBendPx;
  uniform float uScrollBendVUv;
  varying vec2 vUv;

  float roundedRectSdf(vec2 p, vec4 rect, float radius) {
    vec2 halfSize = rect.zw * 0.5;
    vec2 center = rect.xy + halfSize;
    float r = min(radius, min(halfSize.x, halfSize.y));
    vec2 q = abs(p - center) - halfSize + vec2(r);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  // Negative inside / positive outside SDF → feathered [0,1] coverage with a
  // ~2px anti-aliased band (matches the legacy overlay's smoothstep edge).
  float sdfMask(float sd) {
    return 1.0 - smoothstep(-1.0, 1.0, sd);
  }

  float scrollBendArch(float t) {
    float arch = sin(t * 3.14159265);
    return arch + sin(t * 3.1431853) * 2.0;
  }

  float scrollBendUv(float x) {
    return scrollBendArch(clamp(x, 0.0, 1.0)) * uScrollBendVUv;
  }

  float scrollBendPx(float px) {
    float t = clamp(px / max(uViewport.x, 1.0), 0.0, 1.0);
    return scrollBendArch(t) * uScrollBendPx;
  }

  float pinBottomRectSdf(vec2 p, vec4 rect) {
    float topD = (rect.y - scrollBendPx(p.x)) - p.y;
    float bottomD = p.y - (rect.y + rect.w);
    float leftD = rect.x - p.x;
    float rightD = p.x - (rect.x + rect.z);
    return max(max(topD, bottomD), max(leftD, rightD));
  }

  float pinTopRectMask(vec2 p, vec4 rect) {
    // Retail POS hides the leading bend; keep that top edge un-feathered so
    // the unused AA fringe cannot show as a full-width hairline.
    float bottomD = (p.y + scrollBendPx(p.x)) - (rect.y + rect.w);
    float leftD = rect.x - p.x;
    float rightD = p.x - (rect.x + rect.z);
    return step(rect.y, p.y) * sdfMask(max(bottomD, max(leftD, rightD)));
  }

  float coverMask(vec2 p, vec4 rect, float pinBottom, float pinTop) {
    vec2 bentP = vec2(p.x, p.y + scrollBendPx(p.x));
    return pinBottom > 0.5
      ? sdfMask(pinBottomRectSdf(p, rect))
      : pinTop > 0.5
        ? pinTopRectMask(p, rect)
        : sdfMask(roundedRectSdf(bentP, rect, 0.0));
  }

  // Feathered [0,1] coverage for the incoming side of a bend (1 on the
  // revealed side, 0 on the other). fwidth gives a resolution-correct ~1px
  // edge so the bend seam is anti-aliased too.
  float incomingTransitionCoverage(vec2 uv) {
    vec2 dir = length(uTransitionDirection) > 0.0001
      ? normalize(uTransitionDirection)
      : vec2(0.0, -1.0);
    float scale = max(0.5 * (abs(dir.x) + abs(dir.y)), 0.0001);
    vec2 visibleVUv = vec2(
      uv.x,
      (uv.y - uViewportBottomVUv) / max(1.0 - uViewportBottomVUv, 0.0001)
    );
    vec2 bentVisibleVUv = vec2(
      visibleVUv.x,
      visibleVUv.y - scrollBendUv(visibleVUv.x)
    );
    float norm = dot(bentVisibleVUv - 0.5, dir) / scale;
    float edge = 1.0 - 2.0 * uTransitionProgress;
    float feather = max(fwidth(norm), 1e-4);
    return smoothstep(edge - feather, edge + feather, norm);
  }

  void main() {
    vec2 p = vec2(vUv.x * uViewport.x, (1.0 - vUv.y) * uViewport.y);

    float coverage = 0.0;
    if (uUseBaseLayer > 0.5) {
      float covered = 0.0;
      for (int i = 0; i < ${J}; i++) {
        if (i >= uCoverCount) break;
        covered = max(
          covered,
          coverMask(p, uCovers[i], uCoverPinBottom[i], uCoverPinTop[i])
        );
      }
      coverage = 1.0 - covered;
    }

    if (uUseCutouts > 0.5) {
      float cut = 0.0;
      for (int i = 0; i < ${Oe}; i++) {
        if (i >= uCutoutCount) break;
        cut = max(cut, sdfMask(roundedRectSdf(p, uCutouts[i], 0.0)));
      }
      coverage = max(coverage, cut);
    }

    if (uUseTransition > 0.5) {
      float t = incomingTransitionCoverage(vUv);
      coverage *= uInvertTransition > 0.5 ? 1.0 - t : t;
    }

    if (coverage <= 0.0) discard;

    gl_FragColor = vec4(texture2D(tInput, vUv).rgb, coverage);
    #include <colorspace_fragment>
  }
`;function fn(){return new te({vertexShader:qt,fragmentShader:mn,depthTest:!1,depthWrite:!1,transparent:!0,uniforms:{tInput:{value:null},uViewport:{value:new Z(1,1)},uUseBaseLayer:{value:1},uUseCutouts:{value:0},uCoverCount:{value:0},uCovers:{value:new Float32Array(J*4)},uCoverPinBottom:{value:new Float32Array(J)},uCoverPinTop:{value:new Float32Array(J)},uCutoutCount:{value:0},uCutouts:{value:new Float32Array(Oe*4)},uUseTransition:{value:0},uInvertTransition:{value:0},uTransitionProgress:{value:1},uTransitionDirection:{value:new Z(0,-1)},uViewportBottomVUv:{value:0},uScrollBendPx:{value:0},uScrollBendVUv:{value:0}}})}var be,Ne,D,Ae,Me,Ie,X,Y,P,$t,Kt,Qt,Xt,Jt,er,tr,rr,nr;class vn extends Ar{constructor(){super("LayerKnockoutPass");S(this,P);S(this,be,new ct);S(this,Ne,new Lt(-1,1,1,-1,0,1));S(this,D,fn());S(this,Ae,new lt(new Ot(2,2),t(this,D)));S(this,Me,null);S(this,Ie,null);S(this,X,1);S(this,Y,1);this.needsSwap=!1,t(this,be).add(t(this,Ae))}setTransitionState(e){C(this,Me,e)}setLayerSourceProvider(e){C(this,Ie,e)}setViewportSize(e,i){C(this,X,Math.max(1,e)),C(this,Y,Math.max(1,i)),t(this,D).uniforms.uViewport.value.set(t(this,X),t(this,Y))}setSize(){}render(e,i){var r;e.setRenderTarget(this.renderToScreen?null:i),e.setClearColor(ln.b100,1),e.clear(!0,!0,!1);const s=T(this,P,Kt).call(this),u=T(this,P,$t).call(this,s);if(u.length===0)return;const x=Gt();T(this,P,Xt).call(this,T(this,P,Qt).call(this,x)),T(this,P,Jt).call(this,s),t(this,D).uniforms.uViewportBottomVUv.value=T(this,P,rr).call(this,e),t(this,D).uniforms.uScrollBendPx.value=x,t(this,D).uniforms.uScrollBendVUv.value=T(this,P,nr).call(this,x);const v=((r=t(this,Ie))==null?void 0:r.call(this))??null;for(const w of u){const c=T(this,P,tr).call(this,w.sourceLayer,i,v);c&&(T(this,P,er).call(this,w),t(this,D).uniforms.tInput.value=c.texture,e.render(t(this,be),t(this,Ne)))}}dispose(){t(this,D).uniforms.tInput.value=null,t(this,D).dispose(),t(this,Ae).geometry.dispose(),super.dispose()}}be=new WeakMap,Ne=new WeakMap,D=new WeakMap,Ae=new WeakMap,Me=new WeakMap,Ie=new WeakMap,X=new WeakMap,Y=new WeakMap,P=new WeakSet,$t=function(e){const i=t(this,Me);if(!i)return[];const s=e.length>0,u=[],x=i.incomingIndex!==null&&i.mode==="bend",v=({sourceLayer:r,useTransition:w,invertTransition:c,includeBaseLayer:p=!0})=>{!p&&!s||u.push({sourceLayer:r,transitionDirection:i.direction,transitionProgress:i.progress,useBaseLayer:p,useCutouts:s,useTransition:w,invertTransition:c})};return x&&i.incomingIndex!==null?(v({sourceLayer:"current",useTransition:!1,invertTransition:!1,includeBaseLayer:!1}),v({sourceLayer:"incoming",useTransition:!0,invertTransition:!1})):v({sourceLayer:"composite",useTransition:!1,invertTransition:!1}),u},Kt=function(){const e=[],i=Mt(),s=Vt();let u=0;for(const[x]of It.cutouts){if(u>=Oe)break;const v=Wt(x,i,s)??x.getBoundingClientRect();if(v.width<=0||v.height<=0)continue;const r=v.left+v.width,w=v.top+v.height;r<-W||w<-W||v.left>t(this,X)+W||v.top>t(this,Y)+W||(e.push(v),u++)}return e},Qt=function(e){const i=[],s=Mt(),u=Vt(),x=Yr(e)+W;for(const[v,r]of It.covers){if(i.length>=J)break;if(r.full){i.push({left:-W,top:-W,width:t(this,X)+W*2,height:t(this,Y)+W*2,pinBottom:!!r.pinBottom,pinTop:!!r.pinTop});continue}const w=Wt(v,s,u)??v.getBoundingClientRect();if(w.width<=0||w.height<=0)continue;const c=Math.max(0,w.top-x);Math.min(t(this,Y),w.top+w.height+x)-c<cn||i.push({left:-W,top:w.top,width:t(this,X)+W*2,height:w.height,pinBottom:!!r.pinBottom,pinTop:!!r.pinTop})}return i},Xt=function(e){const i=t(this,D).uniforms.uCovers.value,s=t(this,D).uniforms.uCoverPinBottom.value,u=t(this,D).uniforms.uCoverPinTop.value;i.fill(0),s.fill(0),u.fill(0),e.forEach((x,v)=>{const r=v*4;i[r]=x.left,i[r+1]=x.top,i[r+2]=x.width,i[r+3]=x.height,s[v]=x.pinBottom?1:0,u[v]=x.pinTop?1:0}),t(this,D).uniforms.uCoverCount.value=e.length},Jt=function(e){const i=t(this,D).uniforms.uCutouts.value;i.fill(0),e.forEach((s,u)=>{const x=u*4;i[x]=s.left,i[x+1]=s.top,i[x+2]=s.width,i[x+3]=s.height}),t(this,D).uniforms.uCutoutCount.value=e.length},er=function(e){t(this,D).uniforms.uUseBaseLayer.value=e.useBaseLayer?1:0,t(this,D).uniforms.uUseCutouts.value=e.useCutouts?1:0,t(this,D).uniforms.uTransitionDirection.value.set(e.transitionDirection.x,e.transitionDirection.y),t(this,D).uniforms.uTransitionProgress.value=e.transitionProgress,t(this,D).uniforms.uUseTransition.value=e.useTransition?1:0,t(this,D).uniforms.uInvertTransition.value=e.invertTransition?1:0},tr=function(e,i,s){return e==="current"?(s==null?void 0:s.current)??i:e==="incoming"?(s==null?void 0:s.incoming)??i??(s==null?void 0:s.current)??null:i??(s==null?void 0:s.current)??(s==null?void 0:s.incoming)??null},rr=function(e){const i=Math.max(1,t(this,Y)*e.getPixelRatio());return Math.max(0,1-window.innerHeight*e.getPixelRatio()/i)},nr=function(e){const i=window.innerHeight;return i>0?e/i:0};const dn=new Set(["bend","swipe","reveal"]),pn=.9999,hn=[],gn="sectionRevealDirection",wn="stateDrivenSceneOverlay",xn=-.998;function Sn(n,o){n.setEffects(o),n.recompile()}function de(n,o=Ht,e=1,i=1){const s=F.clamp(1+n,0,1),u=F.clamp(o,0,.9999),x=F.clamp(Math.max(e,u+1e-4),1e-4,1),v=F.clamp((s-u)/(x-u),0,1);return Math.pow(v,Math.max(i,1e-4))}function Gn({sections:n,onRendererReady:o,contentMountedElements:e,quality:i,onQualityDowngrade:s,enableKnockout:u=!0,domKnockout:x=!1,scenePresets:v=[],fpsTrackingEnabled:r=!1}){const w=i==="low"?.03333333333333333:.016666666666666666,c=d.useRef(0),{gl:p,camera:re,size:U}=zt(),Ce=d.useRef(null),mt=d.useRef(!1),ir=5e3;d.useEffect(()=>{p.setClearColor(8421504,1)},[p]);const Ge=d.useRef(performance.now()),ye=d.useRef(60),qe=d.useRef(!1),Ye=d.useRef(typeof document<"u"?document.hasFocus():!0),sr=i==="low"?25:45;d.useEffect(()=>{const a=()=>{Ye.current=!0,Ge.current=performance.now()},h=()=>{Ye.current=!1};return window.addEventListener("focus",a),window.addEventListener("blur",h),()=>{window.removeEventListener("focus",a),window.removeEventListener("blur",h)}},[]);const j=d.useRef(new Map),De=d.useMemo(()=>new Set(n.map(a=>a.element)),[n]);for(const a of De)j.current.has(a)||j.current.set(a,new ct);const ft=d.useRef([]),ar=d.useMemo(()=>new Map(n.map(a=>[a.element,a])),[n]);d.useEffect(()=>{for(const[a,h]of j.current)De.has(a)||(_t(h),j.current.delete(a));ft.current=n.map(a=>{const h=j.current.get(a.element);return h?[a.element,h]:null}).filter(a=>a!==null)},[n,De]),d.useEffect(()=>{const a=j.current;return()=>{for(const h of a.values())_t(h);a.clear()}},[]);const ne=d.useRef(null),Ze=d.useRef(null),We=d.useRef(null),Te=d.useRef(null),je=d.useRef(null),vt=Qr(),ur=d.useRef(new Z);d.useEffect(()=>{const a=new Mr(p,{frameBufferType:kt}),h=new Jr,y=new un(re,h),M=new Ir(re,...rt().map(V=>V.effect));let E=null;return a.addPass(y),a.addPass(M),u?(E=new vn,E.renderToScreen=!0,E.setViewportSize(U.width,U.height),E.setLayerSourceProvider(()=>y.knockoutLayerTargets()),a.addPass(E)):M.renderToScreen=!0,a.setSize(U.width,U.height),je.current=h,Ze.current=y,We.current=E,Te.current=M,ne.current=a,a.render(0),()=>{var V,Ee;(V=ne.current)==null||V.dispose(),(Ee=je.current)==null||Ee.dispose(),Nr(p),Hr(p),Gr(p),Dn(),ne.current=null,Ze.current=null,We.current=null,Te.current=null,je.current=null}},[p,re,u]),d.useEffect(()=>{if(vt===0)return;const a=Te.current;if(!a)return;Sn(a,rt().map(y=>y.effect));const h=p.getDrawingBufferSize(ur.current);a.setSize(h.width,h.height),ke()},[p,vt]),d.useEffect(()=>()=>qr(p),[p]),d.useEffect(()=>{var a;ne.current&&(ne.current.setSize(U.width,U.height),(a=We.current)==null||a.setViewportSize(U.width,U.height),ke())},[U.width,U.height]),d.useEffect(()=>{qe.current=!1,ye.current=60},[i]);const dt=d.useRef(!1),Ue=d.useRef(new Map),pt=d.useRef(new tt),ht=d.useRef(new tt),gt=d.useRef(new bt),wt=d.useRef(new bt),xt=d.useRef(new tt),lr=d.useRef(new Nt);d.useRef(""),d.useEffect(()=>{for(const a of Ue.current.keys())De.has(a)||Ue.current.delete(a)},[De]),d.useEffect(()=>{const a=U.width/U.height;for(const h of Ue.current.values())h.aspect=a,h.updateProjectionMatrix()},[U.width,U.height]);const Pe=a=>{const h=j.current.get(a);if(!h)return;const y=Ue.current.get(a);if(y&&y.parent)return y;const M=h.getObjectByProperty("type","PerspectiveCamera");return M&&(M.aspect=U.width/U.height,M.updateProjectionMatrix(),Ue.current.set(a,M)),M},cr=(a,h)=>{a.updateMatrixWorld();const y=xt.current;return y.set(h.x,h.y,h.z),a.localToWorld(y),{x:y.x,y:y.y,z:y.z}},mr=(a,h)=>{if(!a||!h)return{x:.5,y:.5};a.updateMatrixWorld();const y=xt.current;return y.set(h.x,h.y,h.z).project(a),{x:F.clamp(y.x*.5+.5,0,1),y:F.clamp(y.y*.5+.5,0,1)}};Ur((a,h)=>{var yt,Dt,Tt,Ut,Pt;if(!ne.current)return;for(const f of rt())(yt=f.update)==null||yt.call(f,a,h);if(ke(),c.current+=h,c.current<w-1/1e3)return;c.current=Math.max(0,c.current-w);const y=performance.now();if(Ye.current){const g=1e3/(y-Ge.current);if(ye.current+=(g-ye.current)*.01,!qe.current&&i!=="low"&&s&&ye.current<sr&&(qe.current=!0,s()),Kr.getState().isLoaded&&Ce.current===null&&(Ce.current=y),r&&!mt.current&&Ce.current!==null&&y-Ce.current>=ir){const{trackers:l,pageViewToken:R}=Xr.getState();if(l!=null&&l.dux){mt.current=!0;const{tier:I}=Pr.getState();Er({trackers:l,pageViewToken:R,enabled:r,targetName:"fps_measurement",parentName:"renderer_pipeline",width:U.width,height:U.height,duration:Math.round(y-Ce.current),metadata:{measuredFps:Math.round(ye.current*100)/100,effectiveTier:I,targetFps:w===1/30?30:60}})}}}Ge.current=y;const M=ar,E=[];for(const[f,g]of ft.current){const l=M.get(f);if(!l)continue;const R=Zr(f),b=(((Dt=l.offsets)==null?void 0:Dt.transition)??"bend")==="bend"?jr(f,R.transition):R.transition;E.push({element:f,scene:g,section:l,progress:R.progress,transition:b})}const V=[],Ee=[];let m=null;const $e=f=>{V.push(f),Ee.push(f.scene)};for(let f=0;f<E.length;f++){const g=E[f],l=g.section.offsets;if(g.element.dataset[wn]==="true"&&g.transition<=xn)continue;let I=g.transition>-1&&g.transition<1;if(!I&&g.transition<0&&f>0&&(I=E[f-1].progress>=((l==null?void 0:l.sceneEnterAt)??Wr)),!I&&g.transition>=1&&f<E.length-1&&(I=E[f+1].progress<((l==null?void 0:l.sceneExitAt)??Vr)),!I)continue;const b=f>0?E[f-1]:void 0,Qe=(b==null?void 0:b.section.handle)===At&&g.section.handle!==At&&g.transition<0,Et=Qe?"hero":(l==null?void 0:l.transition)??"none",Xe=x&&dn.has(Et)?"crossfade":Et;if(Xe!=="none"){m&&$e(m);const B=(Qe?(Tt=b==null?void 0:b.section.offsets)==null?void 0:Tt.hero:l==null?void 0:l.hero)??Fr,Je=Xe==="hero"&&g.element.dataset[gn]==="out",Re=Je?"crossfade":Xe,gr=Re==="hero"&&b?cr(b.scene,B.center):void 0,wr={center:{x:.5,y:.5},noiseStrength:B.noiseStrength,textureStrength:B.textureStrength,outlineStrength:B.outlineStrength,glowStrength:B.glowStrength,zoomStrength:B.zoomStrength,textureScale:B.textureScale,distance:B.distance,mode:B.mode,angleDeg:B.angleDeg,spread:B.spread,bend:B.bend,wipe:B.wipe},se=(l==null?void 0:l.reveal)??_r,xr={origin:se.origin,softness:se.softness,edgeGlow:se.edgeGlow,zoom:se.zoom};m={...g,mode:Re,transitionT:Je?de(g.transition):Re==="crossfade"?de(g.transition,(l==null?void 0:l.crossfadeStartAt)??Ht):Re==="hero"?de(g.transition,B.startAt,B.endAt,B.curve):Re==="reveal"?de(g.transition,se.startAt,se.endAt,se.curve):de(g.transition),scrollProgress:(b==null?void 0:b.progress)??g.progress,swipeDirection:(l==null?void 0:l.swipeDirection)??{x:1,y:0},swipeFeather:(l==null?void 0:l.swipeFeather)??0,swipeNoiseAmount:(l==null?void 0:l.swipeNoiseAmount)??0,hero:wr,heroCenterWorld:gr,fadeOutReveal:Je,reveal:xr,bendDirection:(l==null?void 0:l.bendDirection)??{x:0,y:-1},zoomBlurStrength:(l==null?void 0:l.zoomBlurStrength)??1,lerpCameraWithPrevious:Qe||((l==null?void 0:l.lerpCameraWithPrevious)??!1)};continue}$e(g)}m&&V.length===0&&($e(m),m=null);let oe,_;const Ve=f=>{f.transition>0?(!oe||f.transition<oe.transition)&&(oe=f):(!_||f.transition>_.transition)&&(_=f)};for(const f of V)Ve(f);m!=null&&m.lerpCameraWithPrevious&&Ve(m);for(let f=1;f<E.length;f++){const g=E[f];if(g.transition>=0)continue;const l=g.section.offsets;!(l!=null&&l.lerpCameraWithPrevious)||l.transition!=="none"||(Ve(E[f-1]),Ve(g))}const St=(Ut=E[E.length-1])==null?void 0:Ut.element;let ie;if(oe&&_&&oe.element!==St&&_.element!==St){const f=Pe(oe.element),g=Pe(_.element);if(f&&g){const l=m!=null&&m.lerpCameraWithPrevious&&_.element===m.element?F.smoothstep(m.transitionT,0,.5):de(_.transition);f.getWorldPosition(pt.current),g.getWorldPosition(ht.current),f.getWorldQuaternion(gt.current),g.getWorldQuaternion(wt.current);const R=lr.current;R.position.lerpVectors(pt.current,ht.current,l),R.quaternion.slerpQuaternions(gt.current,wt.current,l),R.fov=F.lerp(f.fov,g.fov,l),R.aspect=U.width/U.height,R.near=F.lerp(f.near,g.near,l),R.far=F.lerp(f.far,g.far,l),R.updateProjectionMatrix(),ie=R}else ie=g??f}else{const f=oe??_;f&&(ie=Pe(f.element))}const Ct=m!==null&&(m.fadeOutReveal||m.mode==="hero"&&m.hero.mode==="radial"&&m.hero.distance<.999),vr=m?{scene:m.scene,mode:m.mode,progress:m.transitionT,scrollProgress:m.scrollProgress,swipeDirection:m.swipeDirection,swipeFeather:m.swipeFeather,swipeNoiseAmount:m.swipeNoiseAmount,disableDepthMerge:Ct,hero:{...m.hero,center:m.mode==="hero"?mr(ie??Pe(m.element),m.heroCenterWorld):m.hero.center},reveal:m.reveal,bendDirection:m.bendDirection,zoomBlurStrength:m.zoomBlurStrength}:null,ve=Ze.current,dr=m&&!m.lerpCameraWithPrevious?Pe(m.element)??null:null,Fe=$r.getState(),pr=m!==null&&!Ct,Ke=Fe.exclusiveOverlayElement!==null&&(m==null?void 0:m.element)===Fe.exclusiveOverlayElement&&m.transitionT>=pn&&pr;Fe.exclusiveCoverActive!==Ke&&Fe.setExclusiveCoverActive(Ke),ve&&(ve.mainScenes=Ke?hn:Ee,ve.transitioningSection=vr,ve.transitioningCamera=dr),ie&&(ve&&(ve.mainCamera=ie),Te.current&&(Te.current.mainCamera=ie));const hr=(()=>{var l,R;const f=I=>n.findIndex(b=>b.element===I);if(m){const I=f(m.element);return I<0?null:{incomingIndex:I,progress:m.transitionT,direction:m.bendDirection,mode:m.mode}}const g=V[V.length-1];return!g||f(g.element)<0?null:{incomingIndex:null,progress:1,direction:((l=g.section.offsets)==null?void 0:l.bendDirection)??{x:0,y:-1},mode:((R=g.section.offsets)==null?void 0:R.transition)??"bend"}})();(Pt=We.current)==null||Pt.setTransitionState(hr),ne.current.render(h),dt.current||(dt.current=!0,o())},1);const fr=kr(a=>a.ready);return $.jsx($.Fragment,{children:n.map(a=>{const h=j.current.get(a.element);if(!h)return null;const y=e===void 0||e.has(a.element),M=fr[a.handle]??!1;return $.jsx(d.Fragment,{children:Rr($.jsx(Lr,{value:v,children:$.jsxs(Or,{value:{element:a.element,handle:a.handle,progress:a.progress,transition:a.transition,screenOffset:a.screenOffset,stateUrl:a.stateUrl,isContentMounted:y,isPresetResolved:M},children:[$.jsx(Rn,{transform:a.transform,scene:h}),$.jsxs(d.Suspense,{fallback:null,children:[a.content,$.jsx(En,{scene:h})]})]})}),h)},`scene-${a.handle}`)})})}const Cn=new Nt,yn=1;let Le=0,at=0;function Dn(){at+=1,Le=0,me.clear(),Se.length=0}const me=new Map,Se=[];function Tn(n){if(me.has(n.scene)){me.set(n.scene,n);return}me.set(n.scene,n),Se.push(n.scene),or()}function Un(n){if(!me.delete(n))return;const o=Se.indexOf(n);o!==-1&&Se.splice(o,1)}function or(){for(;Le<yn&&Se.length>0;){const n=Se.shift(),o=me.get(n);if(!o)continue;me.delete(n),Le++;const e=at;o.gl.compileAsync(o.scene,o.camera).then(o.onDone).catch(()=>{}).finally(()=>{e===at&&(Le--,or())})}}const Pn=100;function En({scene:n}){const{gl:o}=zt();return d.useEffect(()=>{let e=!1,i=0;const s=new Set,u=()=>{if(e)return;const p=n.getObjectByProperty("type","PerspectiveCamera")??Cn;Tn({scene:n,camera:p,gl:o,onDone:()=>{e||ke()}})},x=()=>{e||(clearTimeout(i),i=setTimeout(u,Pn))},v=p=>{w(p.child),x()},r=p=>{c(p.child)},w=p=>{if(!s.has(p)){s.add(p),p.addEventListener("childadded",v),p.addEventListener("childremoved",r);for(const re of p.children)w(re)}},c=p=>{if(s.has(p)){s.delete(p),p.removeEventListener("childadded",v),p.removeEventListener("childremoved",r);for(const re of p.children)c(re)}};return w(n),x(),()=>{e=!0,clearTimeout(i),Un(n);for(const p of s)p.removeEventListener("childadded",v),p.removeEventListener("childremoved",r);s.clear()}},[o,n]),null}function Rn({transform:n,scene:o}){return d.useEffect(()=>{n?(o.position.set(n.position.x,n.position.y,n.position.z),o.rotation.set(n.rotation.x,n.rotation.y,n.rotation.z),o.scale.set(n.scale.x,n.scale.y,n.scale.z)):(o.position.set(0,0,0),o.rotation.set(0,0,0),o.scale.set(1,1,1))},[o,n]),null}function _t(n){n.traverse(o=>{if(!o.userData[zr]&&o instanceof lt&&(o.geometry&&o.geometry.dispose(),o.material)){const e=Array.isArray(o.material)?o.material:[o.material];for(const i of e){for(const s of Object.values(i))s instanceof Br&&s.dispose();i.dispose()}}}),n.clear()}export{Gn as R};
//# sourceMappingURL=RendererPipeline-8uZwk8Gh.js.map
