import{j as D}from"./jsx-runtime-D_zvdyIk.js";import{r as e}from"./chunk-EPOLDU6W-CgSudzSq.js";import{H as B,I as J,V as l,S as se,j as oe,L as X,J as Y,e as ae,o as ie,u as ue,y as ce}from"./TierResolver-nYYMFDvd.js";import{d as c}from"./index-CbptNCiK.js";import{u as le}from"./SceneDataContext-CAq341Xd.js";import{u as pe}from"./useTheatreObject-B7WQ-qzE.js";import{a as me}from"./pointerNdc-sUXB2i1s.js";const y=new Map;function Z(t){return Array.isArray(t)?t.join(`
`):t}function fe(t){const a=Z(t);y.set(a,(y.get(a)??0)+1)}function he(t,a){const h=Z(t),T=y.get(h)??0;if(T>1){y.set(h,T-1);return}y.delete(h);const R=new Set;for(const p of Array.isArray(a)?a:[a])p&&!R.has(p)&&(p.dispose(),R.add(p));B.clear(J,Array.isArray(t)?[...t]:t)}const k=300,de=1,Q=.25,W=.5,ve=8,xe=8,ge=1.1,De=7,q=.3+.7*2*Q,ye=45,Te=4,Re=e.createContext(null),Ee=`
  uniform sampler2D depthMap;
  uniform vec2 depthTexel;
  uniform float dilateRadius;
  uniform vec2 mouseDelta;
  uniform float meshDepth;
  uniform float focus;
  uniform float sensitivity;
  varying vec2 vUv;

  float sampleDepth(vec2 uv) {
    float r = clamp(dilateRadius, 0.0, 20.0);
    if (r < 0.5) return texture2D(depthMap, uv).r;
    float maxD = 0.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 o = vec2(float(i), float(j)) * depthTexel * r;
        maxD = max(maxD, texture2D(depthMap, uv + o).r);
      }
    }
    return maxD;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float depth = sampleDepth(uv);
    float actualDepth = depth * meshDepth;
    float focusDepth = focus * meshDepth;

    float scaleFactor = (4.0 - actualDepth) / 4.0;
    pos.xy *= scaleFactor;
    pos.z = actualDepth;

    vec2 edge = smoothstep(0.0, 0.02, uv) * smoothstep(1.0, 0.98, uv);
    pos.xy += mouseDelta * sensitivity * (1.0 - focus) * (actualDepth - focusDepth)
              * vec2(-1.0, 1.0) * (edge.x * edge.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`,Me=`
  uniform sampler2D map;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(map, vUv);
  }
`;function be({url:t,depthMap:a,position:h,rotation:T,scale:R,sheet:p,theatreId:$,sensitivity:F=W,children:K}){const I=e.useRef(null),A=e.useRef(null),m=e.useRef(new l(0,0)),_=e.useRef({x:0,y:0}),E=e.useRef(F),O=e.useRef(new l(0,0)),L=e.useRef(new l(0,0)),f=e.useRef(new l(0,0)),ee=e.useMemo(()=>({sensitivity:c.types.number(F,{nudgeMultiplier:.01,range:[0,5]}),transitionParallax:c.types.compound({in:c.types.compound({x:c.types.number(-1.2,{nudgeMultiplier:.01,range:[-2,2]}),y:c.types.number(0,{nudgeMultiplier:.01,range:[-2,2]})}),out:c.types.compound({x:c.types.number(1.2,{nudgeMultiplier:.01,range:[-2,2]}),y:c.types.number(0,{nudgeMultiplier:.01,range:[-2,2]})})},{label:"Transition Parallax"})}),[]),j=pe(p??null,I,$,ee);e.useEffect(()=>{if(j)return j.onValuesChange(n=>{var o,u,M,w,v,x,g,S;const r=n;E.current=r.sensitivity??W,O.current.set(((u=(o=r.transitionParallax)==null?void 0:o.in)==null?void 0:u.x)??0,((w=(M=r.transitionParallax)==null?void 0:M.in)==null?void 0:w.y)??0),L.current.set(((x=(v=r.transitionParallax)==null?void 0:v.out)==null?void 0:x.x)??0,((S=(g=r.transitionParallax)==null?void 0:g.out)==null?void 0:S.y)??0)})},[j]);const C=e.useRef(new l(0,0)),te=e.useMemo(()=>({mouseDelta:C,sensitivity:E}),[]);e.useEffect(()=>{if(!window.matchMedia("(hover: hover)").matches)return;const n=r=>{me(r,_.current,{yAxis:"down",clamp:!0})};return window.addEventListener("pointermove",n),()=>window.removeEventListener("pointermove",n)},[]);const[i,s]=B(J,[t,a]),H=e.useRef(i);H.current=i;const V=e.useRef(s);V.current=s,e.useEffect(()=>{const n=[t,a];fe(n);const r=H.current,o=V.current;return()=>{he(n,[r,o])}},[t,a]);const P=i.image?i.image.width/i.image.height:1,d=e.useMemo(()=>{var o,u;i.colorSpace=se,s.colorSpace=oe,s.minFilter=X,s.magFilter=X,s.wrapS=Y,s.wrapT=Y;const n=((o=s.image)==null?void 0:o.width)??1024,r=((u=s.image)==null?void 0:u.height)??1024;return new ae({vertexShader:Ee,fragmentShader:Me,side:ie,uniforms:{map:{value:i},depthMap:{value:s},depthTexel:{value:new l(1/n,1/r)},dilateRadius:{value:De},mouseDelta:{value:new l(0,0)},meshDepth:{value:de},focus:{value:Q},sensitivity:{value:E.current}}})},[i,s]);e.useEffect(()=>()=>{d.dispose()},[d]);const U=ue(n=>n.size),re=le();return ce((n,r)=>{if(A.current){const b=2*Math.tan(ye*Math.PI/360)*Te,N=b*(U.width/U.height),z=ge*(N/b>P?N/P:b);A.current.scale.set(z,z,1)}const o=E.current,u=1-Math.exp(-r*ve),M=-_.current.x*q*o,w=-_.current.y*q*o;m.current.x+=(M-m.current.x)*u,m.current.y+=(w-m.current.y)*u;const v=re.transition,x=v<0?O.current:L.current,g=Math.abs(v),S=x.x*g,ne=x.y*g,G=1-Math.exp(-r*xe);f.current.x+=(S-f.current.x)*G,f.current.y+=(ne-f.current.y)*G,C.current.set(m.current.x+f.current.x,m.current.y+f.current.y),d.uniforms.mouseDelta.value.copy(C.current),d.uniforms.sensitivity.value=o}),D.jsx("group",{ref:I,position:h,rotation:T,scale:R,children:D.jsxs("group",{ref:A,children:[D.jsx("mesh",{material:d,children:D.jsx("planeGeometry",{args:[P,1,k,k]})}),D.jsx(Re,{value:te,children:K})]})})}export{Te as D,ye as a,be as b,fe as c,he as r};
//# sourceMappingURL=DepthImageAsset-f798Br1X.js.map
