import{r as y}from"./chunk-EPOLDU6W-CgSudzSq.js";import{d as g}from"./index-CbptNCiK.js";import{j as B}from"./jsx-runtime-D_zvdyIk.js";import{u as j}from"./constants-D_Mco9k_.js";import{D as o0,R as y0,F as D0,r as a0,br as S0,bs as T0,bt as M0,m as Y,aT as H,bu as k,G as R0,bj as E0,v as $,bv as C0,$ as _0,o as l0,Z as w0,C as i0,M as u0,y as B0,K as P0,t as s0}from"./TierResolver-nYYMFDvd.js";import{U as J}from"./constants-CblcJfKC.js";import{a as O0}from"./useAssetLoadingStore-BRtoZ4kO.js";import{s as F0}from"./sharedZeroTexture-BGkXyl3y.js";import{s as A0,D as I0}from"./layers-CClLq2fm.js";import{u as U0}from"./SectionFluidVelocityContext-DHVefnD6.js";import{u as G0}from"./useCanvasPointer-Bi4-9gKY.js";const Y0=45,L0=.35,X0=5400,P=-.08,N0=102,V0=-295,z0=4500,W0=15e4,j0=[.2,.9,.3,.986],H0=[0,0,.58,1],k0=600,$0=55,Z0=650,K0=300,q0=14,Ke=2e3,J0="#ffffff",Z=[{char:"E",trackingEm:P},{char:"v",trackingEm:P},{char:"e",trackingEm:P},{char:"r",trackingEm:-.03},{char:"y",trackingEm:-.04},{char:"w",trackingEm:P},{char:"h",trackingEm:P},{char:"e",trackingEm:P},{char:"r",trackingEm:P},{char:"e",trackingEm:P}],Q=[Z,Z,Z],K=Q.flatMap((t,e)=>t.map((n,i)=>({...n,wordIndex:e,letterIndex:i})));function Q0(t){const n=(360-t.reduce((d,a)=>d+a,0))/Q.length,i=[];let s=n/2,r=0;for(const d of Q){for(let a=0;a<d.length;a++)i[r]=s+t[r]/2,s+=t[r],r+=1;s+=n}return i}function qe(t,e){return 2*Math.atan(t/2/e)*(180/Math.PI)}function e0(t,e,n,i){const s=3*t,r=3*(n-t)-s,d=1-s-r,a=3*e,c=3*(i-e)-a,m=1-a-c,h=u=>((d*u+r)*u+s)*u,v=u=>((m*u+c)*u+a)*u,M=u=>(3*d*u+2*r)*u+s,w=u=>{let S=u;for(let T=0;T<8;T++){const U=h(S)-u;if(Math.abs(U)<1e-6)return S;const O=M(S);if(Math.abs(O)<1e-6)break;S-=U/O}return S};return u=>u<=0?0:u>=1?1:v(w(u))}function Je(t,e,n,i){const s=y.useRef(i);s.current=i,y.useEffect(()=>{if(!t||!e)return;const r=t.object(e,n,{reconfigure:!0});s.current(r.value);const d=r.onValuesChange(a=>{s.current(a)});return()=>{d(),t.detachObject(e)}},[t,e])}const I=4096;function ee({entries:t,curvesData:e,bandHeaders:n,bandRefs:i,ascender:s,descender:r,unitsPerEm:d}){const a=new Map;t.forEach(T=>a.set(T.codePoint,T));const c=Math.max(1,Math.ceil(e.length/4)),m=Math.ceil(c/I),h=new Float32Array(I*m*4).fill(-1);h.set(e);const v=new o0(h,I,m,y0,D0);v.minFilter=v.magFilter=a0,v.needsUpdate=!0;const M=Math.floor(n.length/2)+Math.floor(i.length/2),w=Math.max(1,Math.ceil(M/I)),u=new Uint32Array(I*w*2);u.set(n,0),u.set(i,n.length);const S=new o0(u,I,w,S0,T0);return S.minFilter=S.magFilter=a0,S.needsUpdate=!0,{codePoints:a,curvesTex:v,bandsTex:S,ascender:s,descender:r,unitsPerEm:d}}class te extends M0{constructor(e=1024){super();const n=new Float32Array([-1,-1,0,-1,1,0,1,1,0,1,-1,0]),i=new Float32Array([0,0,0,1,1,1,1,0]),s=new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1]),r=new Uint16Array([0,2,1,0,3,2]);this.setIndex(new Y(r,1)),this.setAttribute("position",new Y(n,3)),this.setAttribute("uv",new Y(i,2)),this.setAttribute("normal",new Y(s,3)),this.maxGlyphs=e,this.glyphCount=0,this.aScaleBias=new Float32Array(e*4),this.aGlyphBandScale=new Float32Array(e*4),this.aBandMaxTexCoords=new Float32Array(e*4);const d=new H(this.aScaleBias,4);d.setUsage(k),this.setAttribute("aScaleBias",d);const a=new H(this.aGlyphBandScale,4);a.setUsage(k),this.setAttribute("aGlyphBandScale",a);const c=new H(this.aBandMaxTexCoords,4);c.setUsage(k),this.setAttribute("aBandMaxTexCoords",c),this.instanceCount=0,this.boundingBox=new R0,this.boundingSphere=new E0}computeBoundingSphere(){!this.boundingBox||this.boundingBox.isEmpty()?this.boundingSphere.set(new $,0):this.boundingBox.getBoundingSphere(this.boundingSphere)}addGlyph(e,n,i,s,r,d,a){if(this.glyphCount>=this.maxGlyphs)return!1;const c=this.glyphCount,m=s/2,h=r/2,v=n+m,M=i+h;return this.aScaleBias[c*4+0]=m,this.aScaleBias[c*4+1]=h,this.aScaleBias[c*4+2]=v,this.aScaleBias[c*4+3]=M,this.boundingBox.expandByPoint(new $(v-m,M-h,0)),this.boundingBox.expandByPoint(new $(v+m,M+h,0)),this.aGlyphBandScale[c*4+0]=e.width,this.aGlyphBandScale[c*4+1]=e.height,this.aGlyphBandScale[c*4+2]=e.width/e.bandDimX,this.aGlyphBandScale[c*4+3]=e.height/e.bandDimY,this.aBandMaxTexCoords[c*4+0]=e.bandCount-1,this.aBandMaxTexCoords[c*4+1]=e.bandCount-1,this.aBandMaxTexCoords[c*4+2]=e.bandsTexCoordX,this.aBandMaxTexCoords[c*4+3]=e.bandsTexCoordY,this.glyphCount++,this.instanceCount=this.glyphCount,!0}updateBuffers(){this.attributes.aScaleBias.needsUpdate=!0,this.attributes.aGlyphBandScale.needsUpdate=!0,this.attributes.aBandMaxTexCoords.needsUpdate=!0,this.computeBoundingSphere()}}const ne=`
precision highp int;
precision highp usampler2D;

in vec2 vTexCoords;
flat in vec4 vGlyphBandScale;
flat in uvec4 vBandMaxTexCoords;

uniform sampler2D curvesTex;
uniform usampler2D bandsTex;

const float epsilon = 0.0001;

#define glyphScale     vGlyphBandScale.xy
#define bandScale      vGlyphBandScale.zw
#define bandMax        vBandMaxTexCoords.xy
#define bandsTexCoords vBandMaxTexCoords.zw

float TraceRayCurveH(vec2 p1, vec2 p2, vec2 p3, float pixelsPerEm)
{
    if(max(max(p1.x, p2.x), p3.x) * pixelsPerEm < -0.5)
    {
        return 0.0;
    }

    uint code = (0x2E74U >> (((p1.y > 0.0) ? 2U : 0U) + ((p2.y > 0.0) ? 4U : 0U) + ((p3.y > 0.0) ? 8U : 0U))) & 3U;
    if(code == 0U)
    {
        return 0.0;
    }

    vec2 a = p1 - p2 * 2.0 + p3;
    vec2 b = p1 - p2;
    float c = p1.y;
    float ayr = 1.0 / a.y;
    float d = sqrt(max(b.y * b.y - a.y * c, 0.0));
    float t1 = (b.y - d) * ayr;
    float t2 = (b.y + d) * ayr;

    if(abs(a.y) < epsilon)
    {
        t1 = t2 = c / (2.0 * b.y);
    }

    float coverage = 0.0;

    if((code & 1U) != 0U)
    {
        float x1 = (a.x * t1 - b.x * 2.0) * t1 + p1.x;
        float cov_c = clamp(x1 * pixelsPerEm + 0.5, 0.0, 1.0);
        coverage += cov_c;
    }

    if(code > 1U)
    {
        float x2 = (a.x * t2 - b.x * 2.0) * t2 + p1.x;
        float cov_c = clamp(x2 * pixelsPerEm + 0.5, 0.0, 1.0);
        coverage -= cov_c;
    }

    return coverage;
}

float TraceRayBandH(uvec2 bandData, float pixelsPerEm)
{
    float coverage = 0.0;
    for(uint curve = 0U; curve < bandData.x; ++curve)
    {
        uint curveOffset = bandData.y + curve;
        ivec2 curveLoc = ivec2(texelFetch(bandsTex, ivec2(curveOffset & 0xFFFU, curveOffset >> 12U), 0).xy);
        vec4 p12 = texelFetch(curvesTex, curveLoc, 0) / vec4(glyphScale, glyphScale) - vec4(vTexCoords, vTexCoords);
        vec2 p3 = texelFetch(curvesTex, ivec2(curveLoc.x + 1, curveLoc.y), 0).xy / glyphScale - vTexCoords;
        coverage += TraceRayCurveH(p12.xy, p12.zw, p3.xy, pixelsPerEm);
    }
    return coverage;
}

float TraceRayBandV(uvec2 bandData, float pixelsPerEm)
{
    float coverage = 0.0;
    for(uint curve = 0U; curve < bandData.x; ++curve)
    {
        uint curveOffset = bandData.y + curve;
        ivec2 curveLoc = ivec2(texelFetch(bandsTex, ivec2(curveOffset & 0xFFFU, curveOffset >> 12U), 0).xy);
        vec4 p12 = texelFetch(curvesTex, curveLoc, 0) / vec4(glyphScale, glyphScale) - vec4(vTexCoords, vTexCoords);
        vec2 p3 = texelFetch(curvesTex, ivec2(curveLoc.x + 1, curveLoc.y), 0).xy / glyphScale - vTexCoords;
        coverage += TraceRayCurveH(p12.yx, p12.wz, p3.yx, pixelsPerEm);
    }
    return coverage;
}
`,re=`
    vec2 fdx = dFdx(vTexCoords);
    vec2 fdy = dFdy(vTexCoords);
    // Modern WebGL GPUs legally return 0.0 for fragment derivatives inside colorless Depth-Only passes!
    // A strict mechanical floor guarantees we never divide-by-zero -> Infinity.
    vec2 fw = max(max(abs(fdx), abs(fdy)), vec2(0.000001));
    vec2 pixelsPerEm = vec2(1.0 / fw.x, 1.0 / fw.y);

    // Shadow cameras evaluate text at a sub-pixel size and the algorithm aggressively culls it into alpha 0.0.
    // Clamping to a high resolution floor forces solid strokes when drawn locally into a shadow mapping buffer!
    pixelsPerEm = clamp(pixelsPerEm, vec2(1.0), vec2(200.0));

    uvec2 bandIndex = uvec2(clamp(uvec2(vTexCoords * bandScale), uvec2(0U, 0U), bandMax));

    uint hBandOffset = bandsTexCoords.y * 4096U + bandsTexCoords.x + bandIndex.y;
    uvec2 hBandData = texelFetch(bandsTex, ivec2(hBandOffset & 0xFFFU, hBandOffset >> 12U), 0).xy;

    uint vBandOffset = bandsTexCoords.y * 4096U + bandsTexCoords.x + bandMax.y + 1U + bandIndex.x;
    uvec2 vBandData = texelFetch(bandsTex, ivec2(vBandOffset & 0xFFFU, vBandOffset >> 12U), 0).xy;

    float coverageX = TraceRayBandH(hBandData, pixelsPerEm.x);
    float coverageY = TraceRayBandV(vBandData, pixelsPerEm.y);

    coverageX = min(abs(coverageX), 1.0);
    coverageY = min(abs(coverageY), 1.0);
    float slugAlpha = (coverageX + coverageY) * 0.5;
`,oe=`
in vec4 aScaleBias;
in vec4 aGlyphBandScale;
in vec4 aBandMaxTexCoords;

out vec2 vTexCoords;
flat out vec4 vGlyphBandScale;
flat out uvec4 vBandMaxTexCoords;
`,ae=`
    vec3 transformed = vec3( position.xy * aScaleBias.xy + aScaleBias.zw, 0.0 );
    vTexCoords = position.xy * 0.5 + 0.5;
    
    #ifdef SLUG_MODELSPACE_UV
    #ifdef USE_UV
    vUv = transformed.xy;
    #endif
    #ifdef USE_MAP
    
    
    vMapUv = ( mapTransform * vec3( vec2(length(modelMatrix[0].xyz)*transformed.x,length(modelMatrix[2].xyz)*transformed.y), 1.0 ) ).xy;
    #endif
    #endif

    vGlyphBandScale = aGlyphBandScale;
    vBandMaxTexCoords = uvec4(aBandMaxTexCoords);
`,ie=`
precision highp float;
${ne}
uniform vec3 uColor;
// Left-to-right reveal in glyph-local space (0 = hidden, 1 = fully shown).
// vTexCoords.x runs 0→1 across the glyph quad, so this matches a CSS
// clip-path inset(0 right% 0 0) wipe and rotates with the glyph for free.
uniform float uReveal;
// Global fade multiplier, driven by the host's Theatre opacity.
uniform float uOpacity;

out vec4 fragColor;

void main() {
    if (vTexCoords.x > uReveal) discard;
${re}
    if (slugAlpha < 0.001) discard;
    fragColor = vec4(uColor, slugAlpha * uOpacity);
}
`,se=`
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D uFluidVelocity;
uniform float uFluidInfluence;
in vec2 position;
${oe}
void main() {
${ae}
    vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
    vec4 clip = projectionMatrix * mv;
    if (uFluidInfluence > 0.0001 && clip.w > 0.0001) {
      vec2 screenUv = clamp(clip.xy / clip.w * 0.5 + 0.5, 0.0, 1.0);
      vec2 fluidVel = texture(uFluidVelocity, screenUv).xy;
      float depthAtten = 1.0 / (1.0 + max(-mv.z, 0.0) * 0.3);
      mv.xy += fluidVel * uFluidInfluence * 0.02 * depthAtten;
      clip = projectionMatrix * mv;
    }
    gl_Position = clip;
}
`;class ce extends C0{constructor(e={}){super({vertexShader:se,fragmentShader:ie,uniforms:{curvesTex:{value:null},bandsTex:{value:null},uColor:{value:new i0(1,1,1)},uReveal:{value:1},uOpacity:{value:1},uFluidVelocity:{value:null},uFluidInfluence:{value:0}},transparent:!0,depthWrite:!1,blending:w0,side:l0,glslVersion:_0}),e.curvesTex&&(this.uniforms.curvesTex.value=e.curvesTex),e.bandsTex&&(this.uniforms.bandsTex.value=e.bandsTex),e.color&&(this.uniforms.uColor.value=new i0(e.color))}}const le=[{codePoint:-1,width:0,height:0,advanceWidth:658,bearingX:0,bearingY:0,bandCount:0,bandDimX:0,bandDimY:0,bandsTexCoordX:0,bandsTexCoordY:0},{codePoint:69,width:420,height:668,advanceWidth:577,bearingX:93,bearingY:0,bandCount:16,bandDimX:27,bandDimY:42,bandsTexCoordX:0,bandsTexCoordY:0},{codePoint:118,width:450,height:500,advanceWidth:504,bearingX:27,bearingY:0,bandCount:16,bandDimX:29,bandDimY:32,bandsTexCoordX:32,bandsTexCoordY:0},{codePoint:101,width:417,height:524,advanceWidth:520,bearingX:52,bearingY:-12,bandCount:16,bandDimX:27,bandDimY:33,bandsTexCoordX:64,bandsTexCoordY:0},{codePoint:114,width:264,height:512,advanceWidth:375,bearingX:88,bearingY:0,bandCount:16,bandDimX:17,bandDimY:33,bandsTexCoordX:96,bandsTexCoordY:0},{codePoint:121,width:450,height:710,advanceWidth:504,bearingX:27,bearingY:-210,bandCount:16,bandDimX:29,bandDimY:45,bandsTexCoordX:128,bandsTexCoordY:0},{codePoint:119,width:654,height:500,advanceWidth:708,bearingX:27,bearingY:0,bandCount:16,bandDimX:41,bandDimY:32,bandsTexCoordX:160,bandsTexCoordY:0},{codePoint:104,width:393,height:722,advanceWidth:564,bearingX:88,bearingY:0,bandCount:16,bandDimX:25,bandDimY:46,bandsTexCoordX:192,bandsTexCoordY:0}],ue=[82,303,82,188.5,82,74,251,74,420,74,420,37,420,0,210,0,0,0,0,334,0,668,210,668,420,668,420,631,420,594,251,594,82,594,82,485.5,82,377,232.5,377,383,377,383,340,383,303,232.5,303,82,303,-1,-1,0,500,43.5,500,87,500,156.5,293.5,226,87,227,87,228,87,298,293.5,368,500,409,500,450,500,358.5,250,267,0,225,0,183,0,91.5,250,0,500,-1,-1,223,65,270,65,300,88,330,111,341,156,376.5,146,412,136,396,70,347,35,298,0,223,0,118,0,59,68,0,136,0,260,0,381,60,452,121,524,223,524,312,524,364,466,417,409,417,314,417,295,414,277,411,259,407,247,243,247,79,247,82,160,119,112,157,65,223,65,-1,-1,221,461,162,461,125,421,89,381,81,307,208,307,335,307,336,312,336,317,336,323,336,333,336,390,304,425,273,461,221,461,-1,-1,82,0,41,0,0,0,0,250,0,500,32.5,500,65,500,70.5,436,76,372,90,435,134,473,178,512,235,512,242,512,249,511,257,510,264,509,261.5,466,259,423,253,424,242,425,231,426,219,426,157,426,119,379,82,332,82,253,82,126.5,82,0,-1,-1,87,710,156,499,225,288,226,288,227,288,297.5,499,368,710,409,710,450,710,355,446.5,260,183,224,84,184,42,144,0,83,0,65,0,47,5,29,10,13,19,19,53,25,87,45,75,56,72,68,68,81,68,118,68,139,92,160,116,186,189,93,449.5,0,710,43.5,710,87,710,-1,-1,185,98,186,98,187,98,239,299,291,500,328,500,365,500,417,299,469,98,470,98,471,98,523,299,575,500,614.5,500,654,500,583,250,512,0,472,0,432,0,380,197,328,394,327,394,326,394,274,197,222,0,182,0,142,0,71,250,0,500,40.5,500,81,500,133,299,185,98,-1,-1,0,0,0,361,0,722,41,722,82,722,82,571.5,82,421,105,465,145,488,186,512,239,512,309,512,351,468,393,425,393,351,393,175.5,393,0,352,0,311,0,311,167,311,334,311,385,285,412,260,440,213,440,151,440,116,401,82,362,82,290,82,145,82,0,41,0,0,0],de=[2,224,3,226,2,229,2,231,2,233,2,235,2,237,3,239,3,242,2,245,2,247,2,249,2,251,2,253,3,255,2,258,2,260,2,262,2,264,6,266,6,272,6,278,6,284,6,290,6,296,6,302,6,308,6,314,6,320,6,326,6,332,4,338,2,342,2,344,4,346,4,350,4,354,4,358,4,362,4,366,4,370,4,374,4,378,4,382,4,386,4,390,4,394,4,398,2,402,2,404,3,406,3,409,2,412,2,414,3,416,4,419,2,423,3,425,2,428,2,430,3,432,2,435,2,437,2,439,2,441,5,443,6,448,5,454,5,459,2,464,2,466,4,468,3,472,6,475,5,481,4,486,6,490,5,496,3,501,2,504,2,506,2,508,8,510,6,518,8,524,6,532,6,538,6,544,10,550,6,560,6,566,8,572,9,580,5,589,4,594,6,598,2,604,2,606,2,608,2,610,2,612,2,614,2,616,3,618,2,621,2,623,2,625,5,627,7,632,4,639,5,643,6,648,2,654,2,656,2,658,3,660,4,663,2,667,3,669,4,672,2,676,2,678,2,680,2,682,3,684,3,687,4,690,3,694,5,697,5,702,3,707,2,710,4,712,2,716,4,718,4,722,4,726,4,730,4,734,4,738,4,742,4,746,4,750,4,754,5,758,6,763,7,769,5,776,5,781,4,786,5,790,4,795,3,799,2,802,2,804,2,806,3,808,2,811,2,813,2,815,4,817,4,821,4,825,8,829,8,837,8,845,8,853,8,861,8,869,8,877,8,885,8,893,8,901,6,909,6,915,6,921,2,927,3,929,2,932,3,934,4,937,3,941,2,944,5,946,4,951,2,955,3,957,4,960,3,964,2,967,3,969,2,972,4,974,4,978,4,982,4,986,4,990,4,994,5,998,6,1003,6,1009,6,1015,6,1021,4,1027,2,1031,2,1033,2,1035,2,1037,2,1039,2,1041,2,1043,4,1045,3,1049,3,1052,2,1055,2,1057,3,1059,3,1062,2,1065,3,1067,3,1070,2,1073,3,1075,2,1078],pe=[2,0,4,0,2,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,10,0,0,0,4,0,10,0,8,0,4,0,8,0,4,0,8,0,4,0,8,0,4,0,8,0,4,0,8,0,4,0,6,0,8,0,4,0,6,0,4,0,5,0,3,0,5,0,3,0,5,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,9,0,11,0,1,0,3,0,5,0,7,0,1,0,3,0,18,0,20,0,18,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,18,0,16,0,14,0,20,0,13,0,20,0,13,0,20,0,13,0,14,0,20,0,13,0,14,0,20,0,14,0,20,0,14,0,20,0,14,0,20,0,19,0,14,0,16,0,15,0,19,0,16,0,19,0,16,0,18,0,19,0,16,0,18,0,16,0,18,0,16,0,17,0,18,0,17,0,18,0,17,0,18,0,17,0,18,0,26,0,27,0,25,0,26,0,22,0,27,0,37,0,25,0,23,0,22,0,27,0,37,0,28,0,25,0,23,0,37,0,36,0,28,0,24,0,25,0,23,0,36,0,28,0,36,0,28,0,36,0,28,0,34,0,36,0,29,0,28,0,33,0,34,0,29,0,32,0,33,0,42,0,43,0,40,0,29,0,32,0,43,0,44,0,40,0,29,0,32,0,44,0,40,0,29,0,32,0,44,0,45,0,39,0,40,0,29,0,32,0,45,0,30,0,39,0,29,0,32,0,31,0,30,0,31,0,30,0,29,0,28,0,29,0,28,0,30,0,29,0,40,0,41,0,28,0,35,0,36,0,27,0,30,0,40,0,41,0,35,0,36,0,27,0,30,0,39,0,40,0,41,0,35,0,36,0,37,0,27,0,30,0,39,0,41,0,35,0,37,0,27,0,30,0,39,0,41,0,35,0,37,0,27,0,30,0,39,0,41,0,35,0,37,0,27,0,30,0,31,0,39,0,45,0,41,0,35,0,37,0,22,0,27,0,26,0,31,0,45,0,41,0,35,0,22,0,26,0,31,0,45,0,41,0,35,0,22,0,26,0,31,0,45,0,44,0,41,0,35,0,23,0,22,0,26,0,31,0,44,0,42,0,41,0,35,0,23,0,24,0,25,0,26,0,31,0,32,0,35,0,24,0,25,0,32,0,35,0,24,0,25,0,32,0,33,0,34,0,35,0,24,0,25,0,60,0,48,0,60,0,48,0,60,0,48,0,60,0,48,0,60,0,48,0,60,0,48,0,60,0,48,0,59,0,60,0,48,0,59,0,48,0,59,0,48,0,59,0,48,0,58,0,51,0,59,0,50,0,48,0,55,0,56,0,57,0,58,0,51,0,50,0,48,0,55,0,51,0,50,0,48,0,55,0,52,0,51,0,50,0,48,0,54,0,55,0,53,0,52,0,50,0,48,0,49,0,47,0,49,0,47,0,49,0,47,0,49,0,50,0,47,0,50,0,51,0,59,0,47,0,51,0,59,0,51,0,58,0,59,0,52,0,51,0,58,0,59,0,52,0,58,0,52,0,58,0,52,0,58,0,52,0,58,0,52,0,57,0,58,0,52,0,53,0,57,0,53,0,54,0,57,0,56,0,54,0,55,0,56,0,67,0,68,0,69,0,70,0,71,0,67,0,74,0,73,0,72,0,71,0,67,0,75,0,74,0,67,0,75,0,66,0,67,0,75,0,76,0,66,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,66,0,64,0,62,0,76,0,76,0,77,0,71,0,72,0,70,0,76,0,77,0,72,0,73,0,70,0,69,0,62,0,76,0,77,0,74,0,73,0,68,0,69,0,62,0,76,0,77,0,74,0,68,0,62,0,76,0,75,0,74,0,68,0,62,0,76,0,75,0,68,0,62,0,76,0,75,0,67,0,68,0,62,0,64,0,63,0,67,0,64,0,66,0,67,0,64,0,66,0,64,0,66,0,64,0,66,0,64,0,65,0,66,0,65,0,66,0,65,0,66,0,65,0,66,0,86,0,88,0,90,0,92,0,86,0,88,0,90,0,92,0,86,0,88,0,90,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,88,0,90,0,80,0,94,0,92,0,86,0,84,0,82,0,80,0,94,0,92,0,86,0,84,0,82,0,80,0,94,0,92,0,86,0,84,0,82,0,80,0,94,0,92,0,92,0,93,0,92,0,93,0,94,0,92,0,94,0,92,0,94,0,91,0,80,0,94,0,79,0,91,0,80,0,90,0,91,0,80,0,90,0,80,0,81,0,88,0,89,0,90,0,81,0,82,0,88,0,89,0,82,0,88,0,82,0,88,0,87,0,82,0,84,0,83,0,87,0,84,0,86,0,87,0,84,0,86,0,84,0,85,0,86,0,85,0,86,0,103,0,105,0,110,0,96,0,103,0,105,0,110,0,96,0,103,0,105,0,110,0,96,0,103,0,105,0,110,0,96,0,103,0,105,0,110,0,96,0,103,0,105,0,110,0,96,0,103,0,105,0,109,0,110,0,96,0,102,0,103,0,105,0,106,0,109,0,96,0,102,0,106,0,107,0,108,0,109,0,96,0,102,0,107,0,108,0,99,0,98,0,96,0,102,0,101,0,100,0,99,0,98,0,96,0,101,0,100,0,98,0,96,0,98,0,96,0,98,0,96,0,98,0,96,0,98,0,96,0,97,0,111,0,97,0,111,0,97,0,111,0,97,0,99,0,109,0,111,0,99,0,108,0,109,0,100,0,99,0,108,0,100,0,108,0,100,0,108,0,100,0,107,0,108,0,100,0,101,0,107,0,101,0,107,0,101,0,107,0,106,0,101,0,106,0,104,0,101,0,104,0,101,0,102,0,104,0,102,0,104,0],ge=983,fe=-263,xe=1e3,he={entries:le,curvesData:ue,bandHeaders:de,bandRefs:pe,ascender:ge,descender:fe,unitsPerEm:xe},c0=180,ve=2;function me(t,e,n){return t||!e?0:Math.max(n,0)}function be(){return{scrollSpinDeg:0,scrollYOffset:0,scrollOriginY:null,lastScrollY:null}}function ye(t,e){t.lastScrollY=e,t.scrollOriginY=e,t.scrollYOffset=0}function De(t,e,n){return t.scrollOriginY!==null&&t.scrollOriginY>n&&e<=ve?(t.scrollOriginY=0,t.lastScrollY=e,!0):!1}function Se(t,e,n){const i=t.lastScrollY,s=t.scrollOriginY??e;if(t.scrollOriginY=s,t.lastScrollY=e,t.scrollYOffset=Math.max(0,(e-s)*n.scrollYPerPx),i!==null){const r=Math.max(-c0,Math.min(c0,e-i));t.scrollSpinDeg-=r*n.scrollSpinDegPerPx}return{scrollSpin:t.scrollSpinDeg,scrollY:t.scrollYOffset}}const F=Math.PI/180,Te=.1,Me=600,Re=.12,Ee=.01,Ce=2.5,_e=18,we=8,q=e0(...H0),o={ringFromDeg:N0,ringToDeg:V0,introDurationMs:z0,introBezier:j0,ambientDurationMs:W0,scrollSpinDegPerPx:Re,scrollYPerPx:Ee,pointerRepulseEnabled:!0,pointerRepulseStrength:Ce,pointerXRotationDeg:_e,pointerXRotationDamping:we,wordStaggerMs:k0,letterStaggerMs:$0,slideDurationMs:Z0,wipeDurationMs:K0,revealSweepDeg:q0,ringTiltDeg:18,reverseSpin:!1,radiusVmin:Y0,letterSizeRatio:L0,perspectivePx:X0,letterColor:J0};function Be(t){let e=t==null?void 0:t.parent;for(;e;){const n=e.userData.theatreOpacity;if(typeof n=="number")return n;e=e.parent}return 1}function Pe(t,e,n){const i=t-J;if(i<=0)return e.ringFromDeg;if(i<e.introDurationMs)return e.ringFromDeg+(e.ringToDeg-e.ringFromDeg)*n(i/e.introDurationMs);const s=i-e.introDurationMs;return e.ringToDeg-360*(s/e.ambientDurationMs)}function Oe(t,e,n,i,s){const r=new te(1),d=t.codePoints.get(e.codePointAt(0)??0);d&&(r.addGlyph(d,-d.advanceWidth/2+d.bearingX,d.bearingY,d.width,d.height,0,0),r.updateBuffers());const a=new ce({curvesTex:t.curvesTex,bandsTex:t.bandsTex,color:s});a.uniforms.uReveal.value=0;const c=new u0(r,a);c.frustumCulled=!1,c.scale.setScalar(n);const m=(t.ascender+t.descender)/2;c.position.set(0,-m*n,i);const h=new P0;return h.add(c),A0(h,I0),{group:h,material:a,resting:0}}function Qe({controls:t,controlsRef:e,scrubMs:n=null,waitForLoading:i=!0,debug:s=!1,width:r,children:d}){const a=t??(e==null?void 0:e.current)??o,c=r===void 0?1:r/90,m=y.useRef(null),h=y.useRef(null),v=y.useRef([]),M=y.useRef(!1),w=y.useRef(null),u=y.useRef(be()),S=U0(),T=y.useMemo(()=>ee(he),[]);y.useEffect(()=>()=>{T.curvesTex.dispose(),T.bandsTex.dispose()},[T]);const U=y.useRef(a);U.current=a;const O=e??U,t0=y.useRef(e0(...a.introBezier)),n0=y.useRef(a.introBezier),d0=x=>{const l=n0.current,p=x.introBezier;return p!==l&&(p[0]!==l[0]||p[1]!==l[1]||p[2]!==l[2]||p[3]!==l[3])&&(n0.current=p,t0.current=e0(...p)),t0.current};y.useEffect(()=>{n===null&&(w.current=null)},[n]),y.useEffect(()=>{const x=h.current;if(!T||!x)return;const{unitsPerEm:l}=T,p=K.map(({char:b,trackingEm:C})=>{const D=T.codePoints.get(b.codePointAt(0)??0);return(((D==null?void 0:D.advanceWidth)??0)/l+C)*a.letterSizeRatio*(180/Math.PI)}),_=Q0(p),R=a.radiusVmin*a.letterSizeRatio/l;return v.current=K.map(({char:b},C)=>{const D=Oe(T,b,R,a.radiusVmin,a.letterColor);return D.resting=_[C],D.group.rotation.y=(_[C]-O.current.revealSweepDeg)*F,x.add(D.group),D}),M.current=!0,()=>{M.current=!1,v.current.forEach(({group:b})=>{var C;(C=b.parent)==null||C.remove(b),b.traverse(D=>{D instanceof u0&&(D.geometry.dispose(),D.material.dispose())})}),v.current=[]}},[T,a.radiusVmin,a.letterSizeRatio,a.letterColor,O]);const L=(x,l,p=0,_=0,R=0)=>{const b=j.getState().preferReducedMotion,C=b?q(s0.clamp((x-J)/Me,0,1)):1;if(m.current){const E=b?-.9*(1-C):0;m.current.position.y=_+E,m.current.rotation.x=l.ringTiltDeg*F}if(h.current){const E=l.reverseSpin?-1:1;if(b)h.current.rotation.y=E*(l.ringToDeg+p*Te)*F;else{const A=E*(Pe(x,l,d0(l))+p);h.current.rotation.y=(A+R)*F}}if(!M.current)return;const D=Be(m.current);if(b){for(const{group:E,material:A,resting:G}of v.current)A.uniforms.uOpacity.value=D*C,A.uniforms.uReveal.value=1,E.rotation.y=G*F;return}for(let E=0;E<v.current.length;E++){const{group:A,material:G,resting:x0}=v.current[E],{wordIndex:h0,letterIndex:v0}=K[E];G.uniforms.uOpacity.value=D;const r0=J+h0*l.wordStaggerMs,z=x-r0,m0=z<=0?-l.revealSweepDeg:z<l.slideDurationMs?-l.revealSweepDeg*(1-q(z/l.slideDurationMs)):0;A.rotation.y=(x0+m0)*F;const b0=r0+v0*l.letterStaggerMs,W=x-b0;G.uniforms.uReveal.value=W<=0?0:W<l.wipeDurationMs?q(W/l.wipeDurationMs):1}},X=()=>{typeof window>"u"||ye(u.current,window.scrollY)},p0=()=>{if(typeof window>"u")return{scrollSpin:u.current.scrollSpinDeg,scrollY:u.current.scrollYOffset};const x=u.current;return De(x,window.scrollY,window.innerHeight),Se(x,window.scrollY,O.current)},g0=G0(),N=y.useRef(0),f0=(x,l,p)=>{const R=l.active&&!j.getState().preferReducedMotion?l.x*x.pointerXRotationDeg:0,b=1-Math.exp(-Math.max(0,x.pointerXRotationDamping)*p);return N.current=s0.lerp(N.current,R,b),N.current},V=x=>{if(!M.current)return;const l=j.getState().preferReducedMotion,p=(S==null?void 0:S.current)??F0(),_=me(l,x.pointerRepulseEnabled,x.pointerRepulseStrength);for(const{material:R}of v.current)R.uniforms.uFluidVelocity.value=p,R.uniforms.uFluidInfluence.value=_};return B0((x,l)=>{const p=O.current,_=x.clock.getElapsedTime()*1e3,R=f0(p,g0.current,l);if(n!==null){X(),L(n,p,0,0,R),V(p);return}if(w.current===null){if(!(M.current&&(!i||O0.getState().isLoadingComplete))){X(),L(0,p,0,0,R),V(p);return}w.current=_,X()}const b=p0();L(_-w.current,p,b.scrollSpin,b.scrollY,R),V(p)}),B.jsxs("group",{ref:m,"rotation-x":a.ringTiltDeg*F,scale:[c,c,c],children:[B.jsx("group",{ref:h}),d,s&&B.jsxs(B.Fragment,{children:[B.jsxs("mesh",{"rotation-x":-Math.PI/2,children:[B.jsx("ringGeometry",{args:[a.radiusVmin*.99,a.radiusVmin,128]}),B.jsx("meshBasicMaterial",{color:"#ff2d78",side:l0,transparent:!0,opacity:.7})]}),B.jsx("axesHelper",{args:[a.radiusVmin]})]})]})}const f={spin:{fromDeg:o.ringFromDeg,toDeg:o.ringToDeg,ambientMs:o.ambientDurationMs,tiltDeg:o.ringTiltDeg,reverse:o.reverseSpin,pointerXDeg:o.pointerXRotationDeg,pointerXDamping:o.pointerXRotationDamping},intro:{durationMs:o.introDurationMs,ease:o.introBezier.join(", ")},scroll:{spinDegPerPx:o.scrollSpinDegPerPx,yPerPx:o.scrollYPerPx},pointerRepulse:{enabled:o.pointerRepulseEnabled,strength:o.pointerRepulseStrength},reveal:{wordStaggerMs:o.wordStaggerMs,letterStaggerMs:o.letterStaggerMs,slideDurationMs:o.slideDurationMs,wipeDurationMs:o.wipeDurationMs,sweepDeg:o.revealSweepDeg}},Fe={fromDeg:g.types.number(f.spin.fromDeg,{range:[-360,360],nudgeMultiplier:1}),toDeg:g.types.number(f.spin.toDeg,{range:[-720,360],nudgeMultiplier:1}),ambientMs:g.types.number(f.spin.ambientMs,{range:[2e3,3e5],nudgeMultiplier:1e3}),tiltDeg:g.types.number(f.spin.tiltDeg,{range:[-90,90],nudgeMultiplier:1}),reverse:g.types.boolean(f.spin.reverse),pointerXDeg:g.types.number(f.spin.pointerXDeg,{range:[-90,90],nudgeMultiplier:1}),pointerXDamping:g.types.number(f.spin.pointerXDamping,{range:[1,40],nudgeMultiplier:1})},Ae={durationMs:g.types.number(f.intro.durationMs,{range:[0,1e4],nudgeMultiplier:50}),ease:g.types.string(f.intro.ease)},Ie={spinDegPerPx:g.types.number(f.scroll.spinDegPerPx,{range:[-1,1],nudgeMultiplier:.01}),yPerPx:g.types.number(f.scroll.yPerPx,{range:[0,.1],nudgeMultiplier:.001})},Ue={enabled:g.types.boolean(f.pointerRepulse.enabled),strength:g.types.number(f.pointerRepulse.strength,{range:[0,20],nudgeMultiplier:.1})},Ge={wordStaggerMs:g.types.number(f.reveal.wordStaggerMs,{range:[0,2e3],nudgeMultiplier:10}),letterStaggerMs:g.types.number(f.reveal.letterStaggerMs,{range:[0,500],nudgeMultiplier:5}),slideDurationMs:g.types.number(f.reveal.slideDurationMs,{range:[0,3e3],nudgeMultiplier:10}),wipeDurationMs:g.types.number(f.reveal.wipeDurationMs,{range:[0,2e3],nudgeMultiplier:10}),sweepDeg:g.types.number(f.reveal.sweepDeg,{range:[0,90],nudgeMultiplier:1})},et={spin:g.types.compound(Fe,{label:"spin"}),intro:g.types.compound(Ae,{label:"intro"}),scroll:g.types.compound(Ie,{label:"scroll"}),pointerRepulse:g.types.compound(Ue,{label:"pointer repulse"}),reveal:g.types.compound(Ge,{label:"reveal"})};function Ye(t){const e=t.split(",").map(n=>parseFloat(n.trim()));return e.length===4&&e.every(Number.isFinite)?[e[0],e[1],e[2],e[3]]:[...o.introBezier]}function tt(){return{spin:{...f.spin},intro:{...f.intro},scroll:{...f.scroll},pointerRepulse:{...f.pointerRepulse},reveal:{...f.reveal}}}function nt(t){const e=t.spin,n=t.intro,i=t.scroll,s=t.pointerRepulse,r=t.reveal;return{...o,ringFromDeg:(e==null?void 0:e.fromDeg)??o.ringFromDeg,ringToDeg:(e==null?void 0:e.toDeg)??o.ringToDeg,introDurationMs:(n==null?void 0:n.durationMs)??o.introDurationMs,introBezier:Ye((n==null?void 0:n.ease)??o.introBezier.join(", ")),ambientDurationMs:(e==null?void 0:e.ambientMs)??o.ambientDurationMs,scrollSpinDegPerPx:(i==null?void 0:i.spinDegPerPx)??o.scrollSpinDegPerPx,scrollYPerPx:(i==null?void 0:i.yPerPx)??o.scrollYPerPx,pointerRepulseEnabled:(s==null?void 0:s.enabled)??o.pointerRepulseEnabled,pointerRepulseStrength:(s==null?void 0:s.strength)??o.pointerRepulseStrength,pointerXRotationDeg:(e==null?void 0:e.pointerXDeg)??o.pointerXRotationDeg,pointerXRotationDamping:(e==null?void 0:e.pointerXDamping)??o.pointerXRotationDamping,ringTiltDeg:(e==null?void 0:e.tiltDeg)??o.ringTiltDeg,reverseSpin:(e==null?void 0:e.reverse)??o.reverseSpin,wordStaggerMs:(r==null?void 0:r.wordStaggerMs)??o.wordStaggerMs,letterStaggerMs:(r==null?void 0:r.letterStaggerMs)??o.letterStaggerMs,slideDurationMs:(r==null?void 0:r.slideDurationMs)??o.slideDurationMs,wipeDurationMs:(r==null?void 0:r.wipeDurationMs)??o.wipeDurationMs,revealSweepDeg:(r==null?void 0:r.sweepDeg)??o.revealSweepDeg}}export{o as D,Ke as F,K as H,L0 as L,X0 as P,Y0 as R,k0 as W,Qe as a,Fe as b,tt as c,Ae as d,Ie as e,Ue as f,Ge as g,f as h,et as i,qe as j,$0 as k,Q0 as l,q0 as m,nt as r,Je as u};
//# sourceMappingURL=heroRingTheatreControls-BUSRyfGz.js.map
