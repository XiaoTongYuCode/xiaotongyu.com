import{j as r}from"./jsx-runtime-D_zvdyIk.js";import{s as d,e as m,y as c}from"./TierResolver-nYYMFDvd.js";import{r as s}from"./chunk-EPOLDU6W-CgSudzSq.js";import{F as f}from"./FluidField-g3zs99GC.js";import{s as u}from"./sharedZeroTexture-BGkXyl3y.js";import{u as v}from"./PlaygroundApp-CQn2WJ-l.js";import{d as i}from"./index-CbptNCiK.js";import{b as n,D as a}from"./presets-ClUyafeV.js";import{f as y}from"./theatreTypes-D5hqG3JB.js";import"./constants-D_Mco9k_.js";import"./index-Bb8JjhAW.js";import"./preload-helper-Bc6gya-x.js";import"./reducedMotion-CdiMTSZU.js";import"./useStickyMountGate-DkOADX5n.js";import"./SceneDataContext-CAq341Xd.js";import"./reportError-C0JYu6Sl.js";import"./useCanvasPointer-Bi4-9gKY.js";import"./pointerNdc-sUXB2i1s.js";import"./lenisManager-BGOTe4iO.js";import"./BrowserSpecsListener-CHOIQcVy.js";import"./index-Dk1-D4QQ.js";const g={driveFluid:!0,gain:6,fluid:{enabled:!0,curl:6.5,velocityDissipation:.96,densityDissipation:.92,pressure:.8,splatRadius:.5,splatForce:.08,simSize:a,dyeSize:n}},F={driveFluid:i.types.boolean(!0),gain:i.types.number(6,{range:[0,40],nudgeMultiplier:.1}),fluid:i.types.compound({enabled:i.types.boolean(!0),curl:i.types.number(6.5,{range:[0,20],nudgeMultiplier:.01}),velocityDissipation:i.types.number(.96,{range:[0,1],nudgeMultiplier:.001}),densityDissipation:i.types.number(.92,{range:[0,1],nudgeMultiplier:.001}),pressure:i.types.number(.8,{range:[0,1],nudgeMultiplier:.001}),splatRadius:i.types.number(.5,{range:[0,2],nudgeMultiplier:.001}),splatForce:i.types.number(.08,{range:[0,1],nudgeMultiplier:.001}),...y(a,n)})},h=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,x=`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform float uGain;

  vec3 hueToRgb(float hue) {
    vec3 k = mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0);
    return clamp(min(k, 4.0 - k), 0.0, 1.0);
  }

  void main() {
    vec2 vel = texture2D(uVelocity, vUv).xy;
    float speed = clamp(length(vel) * uGain, 0.0, 1.0);
    float angle = atan(vel.y, vel.x) / 6.2831853 + 0.5;
    vec3 color = mix(vec3(0.02, 0.02, 0.05), hueToRgb(angle), speed);
    gl_FragColor = vec4(color, 1.0);
  }
`;function D({velocityRef:o,gain:e}){const t=s.useMemo(()=>new m({vertexShader:h,fragmentShader:x,uniforms:{uVelocity:{value:u()},uGain:{value:1}},depthTest:!1,depthWrite:!1}),[]);return s.useEffect(()=>()=>t.dispose(),[t]),t.uniforms.uGain.value=e,c(()=>{t.uniforms.uVelocity.value=o.current??u()}),r.jsxs("mesh",{frustumCulled:!1,children:[r.jsx("planeGeometry",{args:[2,2]}),r.jsx("primitive",{object:t,attach:"material"})]})}function O(){const{values:o}=v("FluidField",F),e=o??g,t=s.useRef({transition:0,scrollVelocity:0}),l=s.useRef(null),p={enabled:e.fluid.enabled,influence:1,curl:e.fluid.curl,velocityDissipation:e.fluid.velocityDissipation,densityDissipation:e.fluid.densityDissipation,pressure:e.fluid.pressure,splatRadius:e.fluid.splatRadius,splatForce:e.fluid.splatForce,simSize:e.fluid.simSize,dyeSize:e.fluid.dyeSize};return r.jsx("div",{style:{position:"relative",width:"100%",height:"100%"},children:r.jsxs(d,{style:{background:"#05050a"},children:[r.jsx(f,{fluid:p,fluidVelocityRef:l,driveFluid:e.driveFluid,motion:t}),r.jsx(D,{velocityRef:l,gain:e.gain})]})})}export{O as default};
//# sourceMappingURL=FluidFieldDemo-DBmTmyXw.js.map
