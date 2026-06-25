import{j as ne}from"./jsx-runtime-D_zvdyIk.js";import{r as D}from"./chunk-EPOLDU6W-CgSudzSq.js";import{v as z,bk as me,e as we,C as pe,V as q,M as Y,b1 as Se,I as Te,aZ as te,bL as Re,a6 as Fe,a_ as re,X as Pe,G as De,bM as Ce,y as Oe,u as Ae,bN as Be,T as ze}from"./TierResolver-nYYMFDvd.js";import{d as h}from"./index-CbptNCiK.js";import{e as Ge,k as We}from"./ktx2-loader-DbgWIILB.js";import{r as ae,o as _e,D as V,u as Ee}from"./useTheatreObject-B7WQ-qzE.js";import{s as ke}from"./subscribeWithInitial-D3gqGtvn.js";import{u as Ue}from"./SceneDataContext-CAq341Xd.js";import{u as Ne}from"./useAssetLoadingStore-BRtoZ4kO.js";import{u as ge}from"./Gltf-C8XK5qFq.js";function Le(t){const e=new Map,n=new Map,r=t.clone();return he(t,r,function(i,a){e.set(a,i),n.set(i,a)}),r.traverse(function(i){if(!i.isSkinnedMesh)return;const a=i,d=e.get(i),f=d.skeleton.bones;a.skeleton=d.skeleton.clone(),a.bindMatrix.copy(d.bindMatrix),a.skeleton.bones=f.map(function(p){return n.get(p)}),a.bind(a.skeleton,a.bindMatrix)}),r}function he(t,e,n){n(t,e);for(let r=0;r<t.children.length;r++)he(t.children[r],e.children[r],n)}const oe=new z,ie=new z;function Xe(t,e){oe.copy(e).normalize();let n=1/0,r=-1/0;for(let i=0;i<8;i++){ie.set(i&1?t.max.x:t.min.x,i&2?t.max.y:t.min.y,i&4?t.max.z:t.min.z);const a=ie.dot(oe);a<n&&(n=a),a>r&&(r=a)}return{range:(r-n)/2,center:(n+r)/2}}const H=new WeakMap;function se(t){if(H.has(t))return;const e={theatreOpacity:{value:1},fadeTransition:{value:0},fadeDirection:{value:new z(1,0,0)},fadeFeather:{value:1},fadeRange:{value:1},fadeCenter:{value:0}};H.set(t,e);const n=t.onBeforeCompile;t.onBeforeCompile=(r,i)=>{n==null||n.call(t,r,i),r.uniforms.theatreOpacity=e.theatreOpacity,r.uniforms.fadeTransition=e.fadeTransition,r.uniforms.fadeDirection=e.fadeDirection,r.uniforms.fadeFeather=e.fadeFeather,r.uniforms.fadeRange=e.fadeRange,r.uniforms.fadeCenter=e.fadeCenter,r.vertexShader=r.vertexShader.replace("void main() {",`varying vec3 vFadeWorldPos;
void main() {`),r.vertexShader=r.vertexShader.replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
vFadeWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;`),r.fragmentShader=r.fragmentShader.replace("void main() {",["uniform float theatreOpacity;","uniform float fadeTransition;","uniform vec3 fadeDirection;","uniform float fadeFeather;","uniform float fadeRange;","uniform float fadeCenter;","varying vec3 vFadeWorldPos;","void main() {"].join(`
`)),r.fragmentShader=r.fragmentShader.replace("#include <dithering_fragment>",["#include <dithering_fragment>","{","  float fadeFactor = 1.0;","  float t = abs(fadeTransition);","  if (fadeRange > 0.0001 && t > 0.0001) {","    vec3 dir = normalize(fadeDirection);","    float d = dot(vFadeWorldPos, dir);","    float halfFeather = fadeFeather * 0.5;","    float s = sign(fadeTransition);","    float planePos = fadeCenter + s * (fadeRange + fadeFeather) * (1.0 - 2.0 * t);","    float rawSmooth = smoothstep(planePos - halfFeather, planePos + halfFeather, d);","    float invertFlag = step(0.0, fadeTransition);","    fadeFactor = abs(invertFlag - rawSmooth);","  }","  gl_FragColor.a *= theatreOpacity * fadeFactor;","  if (gl_FragColor.a < 0.001) discard;","}"].join(`
`))}}function le(t,e,n,r,i){const a=H.get(t);a&&(a.theatreOpacity.value=e,a.fadeTransition.value=n.transition,a.fadeDirection.value.copy(n.direction),a.fadeFeather.value=n.feather,a.fadeRange.value=r,a.fadeCenter.value=i)}const je=`varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  vUv = uv * 2.0 - 1.0;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ie=`varying vec2 vUv;
varying vec3 vWorldPos;

uniform vec2 uBoxSize;
uniform float uCornerRadius;
uniform float uBaseOpacity;
uniform float uFadeDistance;
uniform vec3 uShadowColor;
uniform bool uDebug;

uniform float uTheatreOpacity;
uniform float fadeTransition;
uniform vec3 fadeDirection;
uniform float fadeFeather;
uniform float fadeRange;
uniform float fadeCenter;

float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float d = sdRoundedBox(vUv, uBoxSize, uCornerRadius);
  float sdfAlpha = 1.0 - smoothstep(0.0, uFadeDistance, d);

  float fadeFactor = 1.0;
  float t = abs(fadeTransition);
  if (fadeRange > 0.0001 && t > 0.0001) {
    vec3 dir = normalize(fadeDirection);
    float dp = dot(vWorldPos, dir);
    float halfFeather = fadeFeather * 0.5;
    float s = sign(fadeTransition);
    float planePos = fadeCenter + s * (fadeRange + fadeFeather) * (1.0 - 2.0 * t);
    float rawSmooth = smoothstep(planePos - halfFeather, planePos + halfFeather, dp);
    float invertFlag = step(0.0, fadeTransition);
    fadeFactor = abs(invertFlag - rawSmooth);
  }

  float alpha = sdfAlpha * uBaseOpacity * uTheatreOpacity * fadeFactor;

  if (!uDebug && alpha < 0.001) discard;

  if (uDebug) {
    gl_FragColor = vec4(0.0, 1.0, 0.0, max(alpha, 0.3));
  } else {
    gl_FragColor = vec4(uShadowColor, alpha);
  }
}
`,Ve={enabled:h.types.boolean(!1),opacity:h.types.number(.5,{nudgeMultiplier:.01,range:[0,1]}),fadeDistance:h.types.number(.3,{nudgeMultiplier:.01,range:[.001,2]}),color:h.types.rgba({r:0,g:0,b:0,a:1}),padding:h.types.number(.1,{nudgeMultiplier:.01,range:[0,1]}),offsetY:h.types.number(.001,{nudgeMultiplier:.001,range:[0,.5]}),cornerRadius:h.types.number(.15,{nudgeMultiplier:.01,range:[0,1]}),debug:h.types.boolean(!1)};function Ye(){const t=new me(1,1),e=new we({vertexShader:je,fragmentShader:Ie,uniforms:{uBoxSize:{value:new q(.7,.7)},uCornerRadius:{value:.15},uBaseOpacity:{value:.5},uFadeDistance:{value:.3},uShadowColor:{value:new pe(0)},uDebug:{value:!1},uTheatreOpacity:{value:1},fadeTransition:{value:0},fadeDirection:{value:new z(1,0,0)},fadeFeather:{value:1},fadeRange:{value:1},fadeCenter:{value:0}},transparent:!0,depthWrite:!1}),n=new Y(t,e);return n.rotation.x=-Math.PI/2,{mesh:n,material:e,geometry:t,lastPlaneW:1,lastPlaneH:1}}function Ze(t,e,n,r){const i=e+2*r.padding,a=n+2*r.padding;if(i!==t.lastPlaneW||a!==t.lastPlaneH){t.geometry.dispose();const l=new me(i,a);t.geometry=l,t.mesh.geometry=l,t.lastPlaneW=i,t.lastPlaneH=a}const d=e/i,f=n/a,p=t.material.uniforms;p.uBoxSize.value.set(d,f),p.uCornerRadius.value=r.cornerRadius,p.uBaseOpacity.value=r.opacity,p.uFadeDistance.value=r.fadeDistance,p.uShadowColor.value.setRGB(r.color.r,r.color.g,r.color.b),p.uDebug.value=r.debug}function He(t,e,n,r,i){const a=t.material.uniforms;a.uTheatreOpacity.value=e,a.fadeTransition.value=n.transition,a.fadeDirection.value.copy(n.direction),a.fadeFeather.value=n.feather,a.fadeRange.value=r,a.fadeCenter.value=i}function Ke(t){t.geometry.dispose(),t.material.dispose()}const $e="/editions/spring2026/target-static/cdn/5d31f47ca544f92a5d-glass_normal_map.jpg?v=local",qe=new Te;let L=null;function Je(){return L||(L=qe.load($e),L.wrapS=te,L.wrapT=te,L)}function Qe(t={}){var e,n,r;return{extrude:{enabled:h.types.boolean(t.enabled??!1),depth:h.types.number(t.depth??.02,{nudgeMultiplier:.01,range:[.001,.5]}),borderRadius:h.types.number(t.borderRadius??.01,{nudgeMultiplier:.01,range:[0,.5]}),segments:h.types.number(t.segments??4,{nudgeMultiplier:1,range:[1,16]}),padding:h.types.number(t.padding??.01,{nudgeMultiplier:.01,range:[0,.2]}),scale:{x:h.types.number(((e=t.scale)==null?void 0:e.x)??1,{nudgeMultiplier:.01,range:[.1,10]}),y:h.types.number(((n=t.scale)==null?void 0:n.y)??1,{nudgeMultiplier:.01,range:[.1,10]}),z:h.types.number(((r=t.scale)==null?void 0:r.z)??1,{nudgeMultiplier:.01,range:[.1,10]})},centerWithinGlass:h.types.boolean(t.centerWithinGlass??!1),ior:h.types.number(t.ior??1.5,{nudgeMultiplier:.1,range:[1,20]}),roughness:h.types.number(t.roughness??.5,{nudgeMultiplier:.01,range:[0,1]}),normalScale:h.types.number(t.normalScale??5,{nudgeMultiplier:.5,range:[0,20]}),normalRepeat:h.types.number(t.normalRepeat??5,{nudgeMultiplier:.5,range:[.1,20]}),fresnel:h.types.number(t.fresnel??.5,{nudgeMultiplier:.01,range:[0,1]}),color:h.types.rgba({r:1,g:1,b:1,a:0}),shadow:Ve}}}const en=Qe(),j=new WeakMap;let S=null,K=0,$=0;const ye=new q;function nn(t){const e=t.getSize(ye).multiplyScalar(t.getPixelRatio()),n=Math.round(e.x),r=Math.round(e.y);return S&&K===n&&$===r||(S==null||S.dispose(),S=new Re(n,r),S.type=Fe,S.wrapS=re,S.wrapT=re,K=n,$=r,t.initTexture(S)),S}function tn(){S==null||S.dispose(),S=null,K=0,$=0}function rn(t){if(j.has(t))return;const e={tBackground:{value:null},uResolution:{value:new q(1,1)},uIOR:{value:1.5},uThickness:{value:.5},uFresnel:{value:.5},uBoxBlur:{value:25},uNormalRepeat:{value:5},uTintColor:{value:new pe(1,1,1)},uTintAlpha:{value:0},uTheatreOpacity:{value:1},fadeTransition:{value:0},fadeDirection:{value:new z(1,0,0)},fadeFeather:{value:1},fadeRange:{value:1},fadeCenter:{value:0}};j.set(t,e);const n=t.onBeforeCompile;t.onBeforeCompile=(r,i)=>{n==null||n.call(t,r,i),r.uniforms.tBackground=e.tBackground,r.uniforms.uResolution=e.uResolution,r.uniforms.uIOR=e.uIOR,r.uniforms.uThickness=e.uThickness,r.uniforms.uFresnel=e.uFresnel,r.uniforms.uBoxBlur=e.uBoxBlur,r.uniforms.uNormalRepeat=e.uNormalRepeat,r.uniforms.uTintColor=e.uTintColor,r.uniforms.uTintAlpha=e.uTintAlpha,r.uniforms.uTheatreOpacity=e.uTheatreOpacity,r.uniforms.fadeTransition=e.fadeTransition,r.uniforms.fadeDirection=e.fadeDirection,r.uniforms.fadeFeather=e.fadeFeather,r.uniforms.fadeRange=e.fadeRange,r.uniforms.fadeCenter=e.fadeCenter,r.vertexShader=r.vertexShader.replace("void main() {",`uniform float uNormalRepeat;
varying vec3 vGlassViewNormal;
varying vec3 vGlassWorldPos;
varying vec3 vGlassModelScale;
void main() {`),r.vertexShader=r.vertexShader.replace("#include <uv_vertex>",`#include <uv_vertex>
#ifdef USE_NORMALMAP
  vNormalMapUv *= uNormalRepeat;
#endif`),r.vertexShader=r.vertexShader.replace("#include <fog_vertex>",`#include <fog_vertex>
vGlassViewNormal = normalize(normalMatrix * normal);
vGlassWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
vGlassModelScale = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));`),r.fragmentShader=r.fragmentShader.replace("void main() {",`uniform sampler2D tBackground;
uniform vec2 uResolution;
uniform float uIOR;
uniform float uThickness;
uniform float uFresnel;
uniform float uBoxBlur;
uniform vec3 uTintColor;
uniform float uTintAlpha;
uniform mat4 projectionMatrix;
uniform float uTheatreOpacity;
uniform float fadeTransition;
uniform vec3 fadeDirection;
uniform float fadeFeather;
uniform float fadeRange;
uniform float fadeCenter;
varying vec3 vGlassViewNormal;
varying vec3 vGlassWorldPos;
varying vec3 vGlassModelScale;
void main() {`),r.fragmentShader=r.fragmentShader.replace("#include <dithering_fragment>",`#include <dithering_fragment>
{
  vec3 viewNormal = normalize(vGlassViewNormal);
  vec3 viewDir = normalize(-vViewPosition);
  vec3 worldNormal = normalize(inverseTransformDirection(vGlassViewNormal, viewMatrix));
  vec3 worldPos = vGlassWorldPos;
  vec3 worldViewDir = normalize(cameraPosition - worldPos);

  vec3 refractionRay = refract(-worldViewDir, worldNormal, 1.0 / uIOR);
  vec3 transmissionRay = normalize(refractionRay) * uThickness * vGlassModelScale;
  vec3 refractedExit = worldPos + transmissionRay;

  vec4 ndcPos = projectionMatrix * viewMatrix * vec4(refractedExit, 1.0);
  vec2 refractionCoords = ndcPos.xy / ndcPos.w * 0.5 + 0.5;

  #ifdef USE_NORMALMAP
    vec3 normalTex = texture2D(normalMap, vNormalMapUv).rgb * 2.0 - 1.0;
    refractionCoords += normalTex.xy * normalScale * 0.01;
  #endif

  float blur = uBoxBlur / uResolution.x;
  vec3 bgAccum = texture2D(tBackground, refractionCoords).rgb * 0.4;
  bgAccum += texture2D(tBackground, refractionCoords + vec2(blur, 0.0)).rgb * 0.15;
  bgAccum += texture2D(tBackground, refractionCoords - vec2(blur, 0.0)).rgb * 0.15;
  bgAccum += texture2D(tBackground, refractionCoords + vec2(0.0, blur)).rgb * 0.15;
  bgAccum += texture2D(tBackground, refractionCoords - vec2(0.0, blur)).rgb * 0.15;

  bgAccum *= uTintColor;
  float fresnel = pow(1.0 - abs(dot(viewNormal, viewDir)), 3.0);
  vec4 glassColor = mix(vec4(bgAccum, 1.0), gl_FragColor, opacity);
  vec4 glassEffect = mix(glassColor, vec4(1.0), fresnel * uFresnel);
  gl_FragColor = mix(glassEffect, vec4(uTintColor, 1.0), uTintAlpha);

  float fadeFactor = 1.0;
  float t = abs(fadeTransition);
  if (fadeRange > 0.0001 && t > 0.0001) {
    vec3 dir = normalize(fadeDirection);
    float d = dot(vGlassWorldPos, dir);
    float halfFeather = fadeFeather * 0.5;
    float s = sign(fadeTransition);
    float planePos = fadeCenter + s * (fadeRange + fadeFeather) * (1.0 - 2.0 * t);
    float rawSmooth = smoothstep(planePos - halfFeather, planePos + halfFeather, d);
    float invertFlag = step(0.0, fadeTransition);
    fadeFactor = abs(invertFlag - rawSmooth);
  }
  gl_FragColor.a = uTheatreOpacity * fadeFactor;
  if (gl_FragColor.a < 0.001) discard;
}`)}}function an(t){return e=>{const n=j.get(t);if(!n)return;const r=nn(e);n.tBackground.value=r;const i=e.getSize(ye).multiplyScalar(e.getPixelRatio()),a=Math.round(i.x),d=Math.round(i.y);n.uResolution.value.set(a,d);const f=e.getContext(),l=e.properties.get(r).__webglTexture;if(l){const y=e.state;y.bindTexture(f.TEXTURE_2D,l),f.copyTexSubImage2D(f.TEXTURE_2D,0,0,0,0,0,a,d),y.unbindTexture()}}}function on(){const t=new Se({color:16777215,transparent:!0,opacity:.1,roughness:.05,metalness:0});return rn(t),t.customProgramCacheKey=()=>"frosted-glass",t.normalMap=Je(),t}function sn(t,e){const n=j.get(t);n&&(n.uThickness.value=e.depth,n.uIOR.value=e.ior,n.uBoxBlur.value=e.roughness*50,n.uFresnel.value=e.fresnel,n.uNormalRepeat.value=e.normalRepeat,e.color&&(n.uTintColor.value.setRGB(e.color.r,e.color.g,e.color.b),n.uTintAlpha.value=e.color.a??0)),t.normalScale.set(e.normalScale,e.normalScale),t.roughness=e.roughness}function ln(t,e,n,r,i){const a=j.get(t);a&&(a.uTheatreOpacity.value=e,a.fadeTransition.value=n.transition,a.fadeDirection.value.copy(n.direction),a.fadeFeather.value=n.feather,a.fadeRange.value=r,a.fadeCenter.value=i)}const X=new z;function A(t,e,n,r,i,a){const d=2*Math.PI*i/4,f=Math.max(a-2*i,0),p=Math.PI/4;X.copy(e),X[r]=0,X.normalize();const l=.5*d/(d+f),y=1-X.angleTo(t)/p;return Math.sign(X[n])===1?y*l:f/(d+f)+l+l*(1-y)}class J extends Pe{constructor(e=1,n=1,r=1,i=2,a=.1){const d=i*2+1;if(a=Math.min(e/2,n/2,r/2,a),super(1,1,1,d,d,d),this.type="RoundedBoxGeometry",this.parameters={width:e,height:n,depth:r,segments:i,radius:a},d===1)return;const f=this.toNonIndexed();this.index=null,this.attributes.position=f.attributes.position,this.attributes.normal=f.attributes.normal,this.attributes.uv=f.attributes.uv;const p=new z,l=new z,y=new z(e,n,r).divideScalar(2).subScalar(a),b=this.attributes.position.array,B=this.attributes.normal.array,v=this.attributes.uv.array,F=b.length/6,m=new z,T=.5/d;for(let M=0,g=0;M<b.length;M+=3,g+=2)switch(p.fromArray(b,M),l.copy(p),l.x-=Math.sign(l.x)*T,l.y-=Math.sign(l.y)*T,l.z-=Math.sign(l.z)*T,l.normalize(),b[M+0]=y.x*Math.sign(p.x)+l.x*a,b[M+1]=y.y*Math.sign(p.y)+l.y*a,b[M+2]=y.z*Math.sign(p.z)+l.z*a,B[M+0]=l.x,B[M+1]=l.y,B[M+2]=l.z,Math.floor(M/F)){case 0:m.set(1,0,0),v[g+0]=A(m,l,"z","y",a,r),v[g+1]=1-A(m,l,"y","z",a,n);break;case 1:m.set(-1,0,0),v[g+0]=1-A(m,l,"z","y",a,r),v[g+1]=1-A(m,l,"y","z",a,n);break;case 2:m.set(0,1,0),v[g+0]=1-A(m,l,"x","z",a,e),v[g+1]=A(m,l,"z","x",a,r);break;case 3:m.set(0,-1,0),v[g+0]=1-A(m,l,"x","z",a,e),v[g+1]=1-A(m,l,"z","x",a,r);break;case 4:m.set(0,0,1),v[g+0]=1-A(m,l,"x","y",a,e),v[g+1]=1-A(m,l,"y","x",a,n);break;case 5:m.set(0,0,-1),v[g+0]=A(m,l,"x","y",a,e),v[g+1]=1-A(m,l,"y","x",a,n);break}}static fromJSON(e){return new J(e.width,e.height,e.depth,e.segments,e.radius)}}const ce=1e-4,cn=.001;function un(t){const e=t.geometry;e.boundingBox||e.computeBoundingBox();const n=e.boundingBox,r=n.max.z-n.min.z;return Math.max(n.max.x-n.min.x,n.max.y-n.min.y)>ce&&r<=ce}function fn(t){const e=t.geometry;e.boundingBox||e.computeBoundingBox();const n=e.boundingBox;return{originalGeometry:e,restoreMaterial:t.material,originalRenderOrder:t.renderOrder,originalOnBeforeRender:t.onBeforeRender,currentGeometry:null,currentMaterial:null,frontPlane:null,shadow:null,lastDepth:-1,lastBorderRadius:-1,lastSegments:-1,lastPadding:-1,lastScaleX:-1,lastScaleY:-1,lastScaleZ:-1,lastCenterWithinGlass:null,originalDepthTest:!0,width:n.max.x-n.min.x,height:n.max.y-n.min.y,centerX:(n.min.x+n.max.x)/2,centerY:(n.min.y+n.max.y)/2,centerZ:(n.min.z+n.max.z)/2}}function dn(t,e,n,r,i,a){t.currentMaterial&&(t.currentMaterial.depthWrite=!a,ln(t.currentMaterial,e,n,r,i),t.shadow&&He(t.shadow,e,n,r,i))}function ve(t,e){if(!e.frontPlane)return;t.remove(e.frontPlane);const n=Array.isArray(e.restoreMaterial)?e.restoreMaterial[0]:e.restoreMaterial;n.depthTest=e.originalDepthTest,e.frontPlane=null}function xe(t,e){e.shadow&&(t.remove(e.shadow.mesh),Ke(e.shadow),e.shadow=null)}function Me(t,e){var n,r;(n=e.currentGeometry)==null||n.dispose(),e.currentGeometry=null,(r=e.currentMaterial)==null||r.dispose(),e.currentMaterial=null,xe(t,e),t.renderOrder=e.originalRenderOrder,t.onBeforeRender=e.originalOnBeforeRender,e.lastDepth=-1,e.lastBorderRadius=-1,e.lastSegments=-1,e.lastPadding=-1,e.lastScaleX=-1,e.lastScaleY=-1,e.lastScaleZ=-1,e.lastCenterWithinGlass=null}function mn(t,e,n){var _,o,c,s;if(!e.enabled){t.geometry!==n.originalGeometry&&(t.geometry=n.originalGeometry,t.material=n.restoreMaterial,ve(t,n),Me(t,n));return}const r=Math.max(1,Math.round(e.segments)),i=((_=e.scale)==null?void 0:_.x)??1,a=((o=e.scale)==null?void 0:o.y)??1,d=((c=e.scale)==null?void 0:c.z)??1,f=e.centerWithinGlass??!1,p=(n.width+2*e.padding)*i,l=(n.height+2*e.padding)*a,y=e.depth*d,b=f?n.centerZ:n.centerZ-y/2,B=e.depth!==n.lastDepth,v=e.borderRadius!==n.lastBorderRadius,F=r!==n.lastSegments,m=e.padding!==n.lastPadding,T=i!==n.lastScaleX||a!==n.lastScaleY||d!==n.lastScaleZ,M=f!==n.lastCenterWithinGlass;if(B||v||F||m||T||M){(s=n.currentGeometry)==null||s.dispose();const u=new J(p,l,y,r,e.borderRadius);u.translate(n.centerX,n.centerY,b),n.currentGeometry=u,t.geometry=u,n.lastDepth=e.depth,n.lastBorderRadius=e.borderRadius,n.lastSegments=r,n.lastPadding=e.padding,n.lastScaleX=i,n.lastScaleY=a,n.lastScaleZ=d}if(!n.frontPlane){const u=Array.isArray(n.restoreMaterial)?n.restoreMaterial[0]:n.restoreMaterial;n.originalDepthTest=u.depthTest,n.frontPlane=new Y(n.originalGeometry,u),t.add(n.frontPlane)}if(M){const u=Array.isArray(n.restoreMaterial)?n.restoreMaterial[0]:n.restoreMaterial;u.depthTest=f?!1:n.originalDepthTest,n.frontPlane.position.set(0,0,f?0:cn),n.lastCenterWithinGlass=f}n.currentMaterial||(n.currentMaterial=on(),t.onBeforeRender=an(n.currentMaterial),t.material=n.currentMaterial),sn(n.currentMaterial,e),e.shadow.enabled?(n.shadow||(n.shadow=Ye(),t.add(n.shadow.mesh)),Ze(n.shadow,p,y,e.shadow),n.shadow.mesh.position.set(n.centerX,n.centerY-l/2-e.shadow.offsetY,b)):xe(t,n),t.updateWorldMatrix(!0,!1);const g=t.userData.theatreRenderOrder??0,P=g!==0?g:t.matrixWorld.elements[14];t.renderOrder=P,n.frontPlane&&(n.frontPlane.renderOrder=P+.1),n.shadow&&(n.shadow.mesh.renderOrder=P-.1)}function pn(t,e){t.geometry=e.originalGeometry,t.material=e.restoreMaterial,ve(t,e),Me(t,e)}const ue=new De,gn=new z;function fe(t){const e=t.material;return Array.isArray(e)?e:[e]}function de(t,e,n){const r=[];let i=t;for(;i&&i!==n;)i.name&&r.unshift(i.name.replace(/^\$/,"")),i=i.parent;return`${e} / ${r.join(" / ")}`}function Z(t){return t.name.startsWith("$")}function hn(t,e){let n=t.parent;for(;n;){if(n===e)return!0;n=n.parent}return!1}function yn(t,e,n,r,i){D.useEffect(()=>{if(!t||!e)return;const a=[],d=new Map,f=new Map,p=new Map,l=new Map,y=new Map,b=new Map;for(const o of i){if(!Z(o))continue;const c=[];for(const s of r)hn(s,o)&&(c.push(s),m(s));b.set(o,c)}for(const o of r)f.set(o,1);function B(o,c){if(!c)return o;if(!o)return c;const s=Math.abs(c.transition);if(s<1e-4)return o;if(s>.9999)return c;const u=1-s;return{transition:o.transition*u+c.transition*s,direction:gn.lerpVectors(o.direction,c.direction,s),feather:o.feather*u+c.feather*s,mode:c.mode}}function v(o){let c=f.get(o)??1,s=p.get(o),u=o.parent;for(;u;){const x=d.get(u);x!==void 0?(c*=x,s=B(s,p.get(u))):typeof u.userData.theatreOpacity=="number"&&(c*=u.userData.theatreOpacity,typeof u.userData.theatreTransition=="number"&&(s=B(s,{transition:u.userData.theatreTransition,direction:u.userData.theatreFadeDirection??V.direction,feather:u.userData.theatreFadeFeather??V.feather,mode:u.userData.theatreFadeMode??V.mode}))),u=u.parent}return{opacity:c,fade:s??V}}function F(){for(const o of r)T(o)}function m(o){if(y.has(o))return;y.set(o,o.material);const c=o.material;if(Array.isArray(c)){const s=c.map(u=>{const x=u.clone();return se(x),x});o.material=s}else{const s=c.clone();se(s),o.material=s}}function T(o){const{opacity:c,fade:s}=v(o),u=Math.abs(s.transition)>.001;if(c>=1&&!u&&!y.has(o)||((c<1||u)&&m(o),!y.has(o)))return;const x=o.geometry;x.boundingBox||x.computeBoundingBox(),o.updateWorldMatrix(!0,!1),ue.copy(x.boundingBox).applyMatrix4(o.matrixWorld);const{range:G,center:w}=Xe(ue,s.direction),U=c<.999||u,N=y.get(o),R=l.get(o),Q=R&&o.geometry!==R.originalGeometry;if(!Q){const W=fe(o);for(let C=0;C<W.length;C++){const E=W[C],O=Array.isArray(N)?N[C]:N,ee=((O==null?void 0:O.transparent)??!1)||U,be=(O==null?void 0:O.depthWrite)??!0;E.depthWrite=U?!1:be,E.transparent!==ee&&(E.transparent=ee,E.needsUpdate=!0),le(E,c,s,G,w)}}let I=o.userData.theatreRenderOrder??0;if(I===0){let W=o.parent;for(;W;){const C=W.userData.theatreRenderOrder;if(typeof C=="number"&&C!==0){I=C;break}W=W.parent}}if(I!==0?o.renderOrder=I:u||Q?o.renderOrder=o.matrixWorld.elements[14]:o.renderOrder=0,o.frustumCulled=!u,R!=null&&R.frontPlane&&(R.frontPlane.renderOrder=o.renderOrder+.1),R!=null&&R.shadow&&(R.shadow.mesh.renderOrder=o.renderOrder-.1),R&&(dn(R,c,s,G,w,U),R.frontPlane)){const W=fe(R.frontPlane),C=Array.isArray(N)?N[0]:N,E=(C==null?void 0:C.depthWrite)??!0;for(const O of W)O.depthWrite=U?!1:E,O.transparent||(O.transparent=!0,O.needsUpdate=!0),le(O,c,s,G,w)}}function M(o){const c=b.get(o);if(c)for(const s of c)T(s)}for(const o of i)Z(o)&&(d.set(o,1),a.push(ae(t,de(o,e,n),o,(c,s)=>{d.set(o,c),p.set(o,s),M(o)})));for(const o of r){if(!Z(o))continue;m(o);const c=un(o);let s=null;c&&(s=fn(o),l.set(o,s));const u=(w,U)=>{f.set(o,w),p.set(o,U),T(o)},x=s?w=>{mn(o,w.extrude,s),T(o)}:void 0,G=ae(t,de(o,e,n),o,u,c?en:void 0,x);if(s){const w=s;a.push(()=>{G(),pn(o,w)})}else a.push(G)}const g=[],P=new Set;for(const o of r){let c=o.parent;for(;c&&!P.has(c);)P.add(c),d.has(c)||g.push(_e(c,F)),c=c.parent}const _=requestAnimationFrame(F);return()=>{cancelAnimationFrame(_);for(const o of g)o();for(const o of a)o();for(const[o,c]of y){const s=o.material;o.material=c,o.renderOrder=0,o.frustumCulled=!0;const u=Array.isArray(s)?s:[s];for(const x of u)x.dispose()}tn()}},[t,e,n,r,i])}const vn="skipDispose",k=new Map;function xn(t){t.traverse(e=>{var r;if(!(e instanceof Y))return;(r=e.geometry)==null||r.dispose();const n=Array.isArray(e.material)?e.material:e.material?[e.material]:[];for(const i of n){for(const a of Object.values(i))a instanceof ze&&a.dispose();i.dispose()}})}function Mn(t){k.set(t,(k.get(t)??0)+1)}function bn(t,e){const n=k.get(t)??0;if(n>1){k.set(t,n-1);return}k.set(t,0),queueMicrotask(()=>{(k.get(t)??0)>0||(k.delete(t),xn(e),ge.clear(t))})}function wn(){const t=Ae(e=>e.gl);Ge(t)}function Sn(t){return t.replace(/[^a-zA-Z0-9_]/g,"_").replace(/^[^a-zA-Z]/,"anim_$&")}function Tn(t){const e=new Map;return t.map(n=>{let r=Sn(n.name);const i=e.get(r)??0;return e.set(r,i+1),i>0&&(r=`${r}_${i}`),{key:r,clip:n}})}function Rn(t){if(t.length)return{animations:Object.fromEntries(t.map(({key:e})=>[e,{progress:h.types.number(0,{range:[0,1],nudgeMultiplier:.01}),ambientWeight:h.types.number(0,{range:[0,1],nudgeMultiplier:.01})}]))}}function Fn(t,e,n){let r=!1;for(const{key:i,clip:a}of e){const d=n[i];if(!d)continue;const f=t.clipAction(a);if(d.progress>0){f.timeScale=0,f.time=d.progress*a.duration,f.setEffectiveWeight(1),r=!0;continue}d.ambientWeight>0?(f.setLoop(Be,1/0),f.setEffectiveWeight(d.ambientWeight),f.timeScale===0&&(f.timeScale=1)):(f.timeScale=0,f.setEffectiveWeight(0))}r&&t.update(0)}function kn({url:t,position:e,rotation:n,scale:r,sheet:i,theatreId:a,theatreExtraConfig:d,onTheatreObject:f,children:p}){wn();const l=ge(t,void 0,void 0,s=>{s.setKTX2Loader(We)}),{handle:y}=Ue(),b=a??t,B=D.useRef(l.scene);B.current=l.scene,D.useEffect(()=>{Ne.getState().markAssetLoaded(y,b)},[y,b]),D.useEffect(()=>{Mn(t);const s=B.current;return()=>{bn(t,s)}},[t]);const v=D.useRef(null),F=D.useRef(null),m=D.useMemo(()=>Tn(l.animations),[l.animations]),T=D.useMemo(()=>Rn(m),[m]),M=D.useMemo(()=>T||d?{...T,...d}:void 0,[T,d]),g=Ee(i??null,v,a,M);D.useEffect(()=>{if(f)return f(g),()=>f(null)},[f,g]),D.useEffect(()=>{if(!(!g||!m.length))return ke(g,s=>{const u=s;u.animations&&F.current&&Fn(F.current,m,u.animations)})},[g,m]);const{cloned:P,meshNodes:_,groupNodes:o}=D.useMemo(()=>{const u=l.animations.length>0?Le(l.scene):l.scene.clone(),x=[],G=[];return u.traverse(w=>{w.userData[vn]=!0,w instanceof Y?x.push(w):w.name&&w!==u&&G.push(w)}),{cloned:u,meshNodes:x,groupNodes:G}},[l.scene,l.animations]);yn(i??null,a,P,_,o),D.useEffect(()=>{if(!l.animations.length)return;const s=new Ce(P);F.current=s;for(const u of l.animations){const x=s.clipAction(u);x.timeScale=0,x.play()}return()=>{s.stopAllAction(),s.uncacheRoot(P),F.current=null}},[l.animations,P]),Oe((s,u)=>{F.current&&u>0&&F.current.update(u)});const c={meshes:_,groupRef:v};return ne.jsxs("group",{ref:v,children:[ne.jsx("primitive",{object:P,position:e,rotation:n,scale:r}),p==null?void 0:p(c)]})}export{en as E,kn as G,J as R,vn as S,He as a,Ye as b,on as c,Ze as d,Ke as e,Xe as f,le as g,se as i,an as m,ln as s,sn as u};
//# sourceMappingURL=GltfAsset-BLMCxzHy.js.map
