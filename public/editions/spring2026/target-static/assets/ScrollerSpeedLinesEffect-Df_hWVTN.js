var C=Object.defineProperty;var F=(f,l,n)=>l in f?C(f,l,{enumerable:!0,configurable:!0,writable:!0,value:n}):f[l]=n;var t=(f,l,n)=>F(f,typeof l!="symbol"?l+"":l,n);import{E as M,B}from"./index-CW_tL5Oi.js";import{V as y,f as o,v as w}from"./TierResolver-nYYMFDvd.js";import{D as i,r as R,c as r}from"./DriveEasterEgg-DziINbFc.js";import"./chunk-EPOLDU6W-CgSudzSq.js";import"./constants-D_Mco9k_.js";import"./index-Bb8JjhAW.js";import"./jsx-runtime-D_zvdyIk.js";import"./preload-helper-Bc6gya-x.js";import"./useCanvasPointer-Bi4-9gKY.js";import"./pointerNdc-sUXB2i1s.js";import"./PopupChannel-BJSRKsrU.js";import"./postEffectRegistry-5s3S_tnT.js";import"./(_locale).editions.spring2026-B3HcLaFe.js";import"./reportError-C0JYu6Sl.js";import"./Media-CKKVem6B.js";import"./index-CRnHN5xY.js";import"./safeLazy-BsBflYCi.js";import"./clamp-co6UzHBn.js";import"./useSectionRegistry-D8UPIPk2.js";import"./middleware-BLXTWOs6.js";import"./lenisManager-BGOTe4iO.js";import"./Button-Dxzzf00d.js";import"./useAssetLoadingStore-BRtoZ4kO.js";import"./constants-CblcJfKC.js";import"./sectionModels-BCRoCzB2.js";import"./presets-ClUyafeV.js";import"./constants-BO0BHkLO.js";import"./dpr-CTU4OejM.js";import"./useStickyMountGate-DkOADX5n.js";import"./SceneDataContext-CAq341Xd.js";import"./index-CbptNCiK.js";import"./SheetContext-DOef6YoM.js";import"./deploy-urls-BqJLL-2u.js";import"./useElementVisibility-CjBIXy3R.js";import"./SectionScene-BsMDl5Sl.js";import"./Environment-mzIMdyjZ.js";import"./EnvironmentObject-Dlj4s8zO.js";import"./FluidField-g3zs99GC.js";import"./reducedMotion-CdiMTSZU.js";import"./SdfRegistry-Dt1Gv0Vq.js";import"./sharedZeroTexture-BGkXyl3y.js";import"./AssetSdf-BJHyVxEZ.js";import"./ktx2-loader-DbgWIILB.js";import"./colorAndNoise-D12tu5Fy.js";import"./Camera-BiKH_hhf.js";import"./renderScaleResolve-BAuFPf4b.js";import"./layers-CClLq2fm.js";import"./SectionFluidVelocityContext-DHVefnD6.js";import"./POS-CBEX_kaM.js";import"./subscribeWithInitial-D3gqGtvn.js";import"./index-DeWFcGU_.js";import"./Environment-CAvtAK_I.js";import"./extends-CF3RwP-h.js";import"./Gltf-C8XK5qFq.js";import"./OrbitControls-CXLakT_d.js";import"./useTheatreObject-B7WQ-qzE.js";import"./heroRingTheatreControls-BUSRyfGz.js";import"./HeroRingObject-DsnPlt5-.js";import"./meta-CwiYJk4F.js";const L=`
  uniform vec2 resolution;
  uniform float uTime;
  uniform float uScrollVelocity;
  uniform float uScrollDirection;
  uniform vec2 uGazeOffset;
  uniform float uStrength;
  uniform float uSpeed;
  uniform float uDensity;
  uniform float uBendStrength;
  uniform float uCenterFollow;
  uniform float uLineWidth;
  uniform float uLineColorShift;
  uniform float uRgbShift;
  uniform vec3 uRgbStrength;
  uniform vec3 uTintColor;
  uniform float uTintMix;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  float hash11(float value) {
    return fract(sin(value * 127.1) * 43758.5453123);
  }

  float speedLineSeed(vec2 uv, float density) {
    return hash11(floor(uv.x * 128.0 * density));
  }

  float vDrop(vec2 uv, float t, float density, float lineWidth) {
    uv.x = uv.x * 128.0 * density;
    float dx = fract(uv.x);
    uv.x = floor(uv.x);
    uv.y *= 0.05;
    float o = sin(uv.x * 215.4);
    float s = cos(uv.x * 33.1) * 0.3 + 0.7;
    float trail = mix(95.0, 35.0, s);
    float yv = fract(uv.y + t * s + o) * trail;
    yv = 1.0 / yv;
    yv = smoothstep(0.0, 1.0, yv * yv);
    yv = sin(yv * 3.14159) * (s * 5.0);
    float d2 = sin(dx * 3.14159);
    float width = clamp(lineWidth, 0.01, 1.0);
    float line = width >= 0.999 ? d2 : smoothstep(1.0 - width, 1.0, d2);
    return yv * (line * line);
  }

  vec2 bendTunnelPoint(vec2 p, float steer, float strength) {
    // Bend the tunnel walls around the vanishing point. The vanishing point
    // itself is shifted separately by uCenterFollow so the tunnel endpoint
    // can follow the popup/car movement without smearing the whole image.
    float baseRadius = length(p);
    float wallBend = smoothstep(0.04, 0.75, baseRadius);
    float edgeRelease = 1.0 - smoothstep(1.0, 1.45, baseRadius);
    p.x -= steer * p.y * p.y * wallBend * edgeRelease * 0.36 * strength;
    return p;
  }

  vec2 tunnelCenter(float steer, float centerFollow) {
    return 0.5 * resolution.xy + vec2(-steer * centerFollow * resolution.y * 0.35, 0.0);
  }

  vec2 bendSceneUv(vec2 uv, float steer, float strength, float centerFollow) {
    vec2 center = tunnelCenter(steer, centerFollow);
    vec2 p = (uv * resolution.xy - center) / resolution.y;
    p = bendTunnelPoint(p, steer, strength * 0.5);
    return (p * resolution.y + center) / resolution.xy;
  }

  vec3 getTunnelEffect(
    vec2 fragCoord,
    float time,
    float direction,
    vec2 gazeOffset,
    float density,
    float bendStrength,
    float centerFollow,
    float lineWidth,
    float lineColorShift,
    float rgbShift,
    vec3 rgbStrength,
    vec3 tintColor,
    float tintMix
  ) {
    float steer = clamp(gazeOffset.x, -1.0, 1.0);
    vec2 center = tunnelCenter(steer, centerFollow);
    vec2 p = (fragCoord.xy - center) / resolution.y;
    p = bendTunnelPoint(p, steer, bendStrength);

    float d = length(p) + 0.1;
    float angle = atan(p.x, p.y) / 3.14159;
    float depth = 2.0 / d;
    float baseRadius = length((fragCoord.xy - center) / resolution.y);
    float wallBend = smoothstep(0.04, 0.75, baseRadius);
    float edgeRelease = 1.0 - smoothstep(1.0, 1.45, baseRadius);
    float laneCurve = -steer * wallBend * edgeRelease * baseRadius * 0.12 * bendStrength;

    vec2 tunnelUv = vec2(angle + laneCurve, depth);
    float t = time * 0.72 * direction;
    float fringeOffset = mix(0.008, 0.026, smoothstep(0.15, 1.1, d)) * rgbShift;

    vec2 fringeUvA = tunnelUv + vec2(fringeOffset, 0.026 * rgbShift);
    vec2 fringeUvB = tunnelUv - vec2(fringeOffset, 0.022 * rgbShift);
    float core = vDrop(tunnelUv, t, density, lineWidth);
    float fringeA = vDrop(fringeUvA, t * 1.015, density, lineWidth);
    float fringeB = vDrop(fringeUvB, t * 0.985, density, lineWidth);
    float mask = max(core, max(fringeA, fringeB) * 0.82);

    float lineWeight = core + (fringeA + fringeB) * 0.82 + 0.0001;
    float lineSeed = (
      speedLineSeed(tunnelUv, density) * core +
      speedLineSeed(fringeUvA, density) * fringeA * 0.82 +
      speedLineSeed(fringeUvB, density) * fringeB * 0.82
    ) / lineWeight;
    float lineShift = clamp(lineColorShift, 0.0, 2.0);
    float lineShiftMix = clamp(lineColorShift, 0.0, 1.0);
    float lineHueShift = (lineSeed - 0.5) * 0.42 * lineShift;
    float lineDrift = sin(lineSeed * 6.28318 + time * 0.45 * direction) * 0.035 * lineShift;
    float hue = fract((angle + laneCurve) * 0.72 + depth * 0.018 + time * 0.55 * direction + lineHueShift + lineDrift);
    float saturation = mix(0.82, mix(0.68, 0.96, hash11(lineSeed * 53.17 + 4.0)), lineShiftMix);
    float value = mix(1.0, mix(0.78, 1.16, hash11(lineSeed * 37.73 + 9.0)), lineShiftMix);
    vec3 coreColor = hsv2rgb(vec3(hue, saturation, value));
    vec3 warmFringe = hsv2rgb(vec3(hue + 0.055, min(1.0, saturation + 0.08), value));
    vec3 coolFringe = hsv2rgb(vec3(hue - 0.07, min(1.0, saturation + 0.08), value));

    vec3 color = coreColor * core;
    color += warmFringe * fringeA * 0.35;
    color += coolFringe * fringeB * 0.35;
    color *= rgbStrength;
    color += vec3(mask) * 0.08;
    color = color / (color + vec3(1.15));
    color = mix(color, tintColor * mask, tintMix);

    return color * mask * min(d * d, 1.8);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float baseIntensity = smoothstep(0.1, 1.2, uScrollVelocity);
    float tunnelIntensity = baseIntensity * uStrength;
    if (tunnelIntensity <= 0.001) {
      outputColor = inputColor;
      return;
    }

    float steer = clamp(uGazeOffset.x, -1.0, 1.0);
    vec2 sceneUv = bendSceneUv(
      uv,
      steer,
      baseIntensity * uBendStrength,
      baseIntensity * uCenterFollow
    );
    vec4 sceneColor = texture2D(inputBuffer, clamp(sceneUv, vec2(0.0), vec2(1.0)));

    vec2 fragCoord = uv * resolution;
    vec3 tunnelColor = getTunnelEffect(
      fragCoord,
      uTime * uSpeed,
      -uScrollDirection * 2.0,
      uGazeOffset,
      uDensity,
      uBendStrength,
      baseIntensity * uCenterFollow,
      uLineWidth,
      uLineColorShift,
      uRgbShift,
      uRgbStrength,
      uTintColor,
      uTintMix
    );

    vec3 color = sceneColor.rgb + tunnelColor * tunnelIntensity * 0.55;
    outputColor = vec4(clamp(color, 0.0, 1.0), inputColor.a);
  }
`;class Oe extends M{constructor(){const n=new y(1,1),e=new o(0),s=new o(0),a=new o(1),m=new o(new y(0,0)),u=new o(i.strength),c=new o(i.speed),h=new o(i.dpr),v=new o(i.bendStrength),p=new o(i.centerFollow),d=new o(i.lineWidth),g=new o(i.lineColorShift),S=new o(i.rgbShift),U=new o(new w(i.rgb.r,i.rgb.g,i.rgb.b)),b=new o(new w(i.color.r,i.color.g,i.color.b)),x=new o(i.colorMix);super("ScrollerSpeedLinesEffect",L,{blendFunction:B.NORMAL,uniforms:new Map([["resolution",new o(n)],["uTime",e],["uScrollVelocity",s],["uScrollDirection",a],["uGazeOffset",m],["uStrength",u],["uSpeed",c],["uDensity",h],["uBendStrength",v],["uCenterFollow",p],["uLineWidth",d],["uLineColorShift",g],["uRgbShift",S],["uRgbStrength",U],["uTintColor",b],["uTintMix",x]])});t(this,"resolution");t(this,"timeUniform");t(this,"velocityUniform");t(this,"directionUniform");t(this,"gazeUniform");t(this,"strengthUniform");t(this,"speedUniform");t(this,"densityUniform");t(this,"bendStrengthUniform");t(this,"centerFollowUniform");t(this,"lineWidthUniform");t(this,"lineColorShiftUniform");t(this,"rgbShiftUniform");t(this,"rgbStrengthUniform");t(this,"tintColorUniform");t(this,"tintMixUniform");this.resolution=n,this.timeUniform=e,this.velocityUniform=s,this.directionUniform=a,this.gazeUniform=m,this.strengthUniform=u,this.speedUniform=c,this.densityUniform=h,this.bendStrengthUniform=v,this.centerFollowUniform=p,this.lineWidthUniform=d,this.lineColorShiftUniform=g,this.rgbShiftUniform=S,this.rgbStrengthUniform=U,this.tintColorUniform=b,this.tintMixUniform=x}setSize(n,e){this.resolution.set(n,e)}setSettings(n){const e=R(n);this.strengthUniform.value=e.enabled?Math.max(0,e.strength):0,this.speedUniform.value=Math.max(0,e.speed),this.densityUniform.value=r(e.dpr,.1,4),this.bendStrengthUniform.value=Math.max(0,e.bendStrength),this.centerFollowUniform.value=r(e.centerFollow,-2,2),this.lineWidthUniform.value=r(e.lineWidth,.01,1),this.lineColorShiftUniform.value=r(e.lineColorShift,0,2),this.rgbShiftUniform.value=r(e.rgbShift,0,4),this.rgbStrengthUniform.value.set(Math.max(0,e.rgb.r),Math.max(0,e.rgb.g),Math.max(0,e.rgb.b)),this.tintColorUniform.value.set(r(e.color.r,0,1),r(e.color.g,0,1),r(e.color.b,0,1)),this.tintMixUniform.value=r(e.colorMix,0,1)}setDriveState({time:n,velocity:e,direction:s,gazeX:a}){this.timeUniform.value=n,this.velocityUniform.value=e,this.directionUniform.value=s,this.gazeUniform.value.set(a,0)}}export{Oe as ScrollerSpeedLinesEffect};
//# sourceMappingURL=ScrollerSpeedLinesEffect-Df_hWVTN.js.map
