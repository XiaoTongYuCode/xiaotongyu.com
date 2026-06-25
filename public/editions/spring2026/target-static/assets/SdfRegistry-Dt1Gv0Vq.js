var Xt=Object.defineProperty;var nt=e=>{throw TypeError(e)};var Qt=(e,t,n)=>t in e?Xt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var b=(e,t,n)=>Qt(e,typeof t!="symbol"?t+"":t,n),ot=(e,t,n)=>t.has(e)||nt("Cannot "+n);var ve=(e,t,n)=>(ot(e,t,"read from private field"),n?n.call(e):t.get(e)),Ae=(e,t,n)=>t.has(e)?nt("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,n),De=(e,t,n,o)=>(ot(e,t,"write to private field"),o?o.call(e,n):t.set(e,n),n);import{j as ee}from"./jsx-runtime-D_zvdyIk.js";import{r as C}from"./chunk-EPOLDU6W-CgSudzSq.js";import{t as M,ad as en,ae as rt,S as fe,h as tn,l as wt,m as I,aW as nn,C as bt,ac as on,be as rn,v as x,G as an,aU as sn,b8 as at,Z as ue,N as te,Y as ln,cN as cn,cO as un,bu as Re,aa as be,x as de,e as xt,z as dn,u as se,e5 as fn,d as hn,W as pn,bQ as mn,y as Ct,w as yn,Q as Sn,bJ as vn}from"./TierResolver-nYYMFDvd.js";import{t as it,u as st}from"./constants-D_Mco9k_.js";import{S as gn}from"./SceneDataContext-CAq341Xd.js";import{u as wn}from"./useStickyMountGate-DkOADX5n.js";import{r as lt}from"./reportError-C0JYu6Sl.js";import{u as ct}from"./useAssetLoadingStore-BRtoZ4kO.js";import{g as Tt,w as Mt,P as bn,d as xn,c as Cn,e as Tn,b as Mn,a as Fn}from"./sectionModels-BCRoCzB2.js";import{c as An,s as Dn,e as _n,a as Pn}from"./FluidField-g3zs99GC.js";import{s as Ft}from"./sharedZeroTexture-BGkXyl3y.js";import{A as En,S as On,b as Rn,a as Ln,D as Nn,B as ne,M as zn,T as Un,d as In,C as kn,e as Gn,O as Hn,f as Bn,g as jn,s as Wn}from"./AssetSdf-BJHyVxEZ.js";import{P as ke,e as Yn}from"./presets-ClUyafeV.js";function qn(){var t,n;const e=(t=globalThis.navigator)==null?void 0:t.connection;return{visibilityState:(n=globalThis.document)==null?void 0:n.visibilityState,...e?{networkEffectiveType:e.effectiveType,networkSaveData:e.saveData,networkDownlink:e.downlink}:{}}}function At(e){const t=performance.now()-e;return Math.max(0,Math.round(t))}function H(e,t){return Object.assign(e,{assetTelemetry:t}),e}function $n(e){const t=e==null?void 0:e.assetTelemetry;return t&&typeof t=="object"?t:{}}const Vn=64,Kn=1024,Jn=.25;function Le(e){return!e||!Number.isFinite(e)?1:1+(Math.max(1,Kn/e)-1)*Jn}const Dr={source512:Le(512),source256:Le(256)},Zn=5,Xn=.01;function Qn(e){return 1-Math.pow(1-M.clamp(e,0,1),3)}function eo(e,t,n){if(n.reducedMotion)return 1;const o=M.clamp(e,0,1);if(n.offscreen||o>=1)return o;const r=Math.min(Math.max(t,0),1/30);return Math.min(1,o+r/Math.max(n.durationSeconds,1e-6))}const to={256:256,512:512,1024:1024,full:1024,center:512},no={3:"512",2:"512",1:"256",0:"256"};function Dt(e,t){if(e.length===0)throw new Error("resolveCloudAsset: sources must not be empty");const n=no[t],o=to[n],r=oo(e,o);return{asset:r.src,textureSize:r.resolution,preferredResolution:n}}function oo(e,t){let n,o,r;for(const i of e)i.resolution===t?n=i:i.resolution>t&&(!o||i.resolution<o.resolution)&&(o=i),(!r||i.resolution>r.resolution)&&(r=i);return n??o??r}const _e=new WeakMap;class ro extends en{constructor(t){super(t),this.decoderPath="",this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}}setDecoderPath(t){return this.decoderPath=t,this}setDecoderConfig(t){return this.decoderConfig=t,this}setWorkerLimit(t){return this.workerLimit=t,this}load(t,n,o,r){const i=new rt(this.manager);i.setPath(this.path),i.setResponseType("arraybuffer"),i.setRequestHeader(this.requestHeader),i.setWithCredentials(this.withCredentials),i.load(t,a=>{this.parse(a,n,r)},o,r)}parse(t,n,o=()=>{}){this.decodeDracoFile(t,n,null,null,fe,o).catch(o)}decodeDracoFile(t,n,o,r,i=tn,a=()=>{}){const s={attributeIDs:o||this.defaultAttributeIDs,attributeTypes:r||this.defaultAttributeTypes,useUniqueIDs:!!o,vertexColorSpace:i};return this.decodeGeometry(t,s).then(n).catch(a)}decodeGeometry(t,n){const o=JSON.stringify(n);if(_e.has(t)){const l=_e.get(t);if(l.key===o)return l.promise;if(t.byteLength===0)throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}let r;const i=this.workerNextTaskID++,a=t.byteLength,s=this._getWorker(i,a).then(l=>(r=l,new Promise((c,u)=>{r._callbacks[i]={resolve:c,reject:u},r.postMessage({type:"decode",id:i,taskConfig:n,buffer:t},[t])}))).then(l=>this._createGeometry(l.geometry));return s.catch(()=>!0).then(()=>{r&&i&&this._releaseTask(r,i)}),_e.set(t,{key:o,promise:s}),s}_createGeometry(t){const n=new wt;t.index&&n.setIndex(new I(t.index.array,1));for(let o=0;o<t.attributes.length;o++){const{name:r,array:i,itemSize:a,stride:s,vertexColorSpace:l}=t.attributes[o];let c;if(a===s)c=new I(i,a);else{const u=new nn(i,s);c=new rn(u,a,0)}r==="color"&&(this._assignVertexColorSpace(c,l),c.normalized=!(i instanceof Float32Array)),n.setAttribute(r,c)}return n}_assignVertexColorSpace(t,n){if(n!==fe)return;const o=new bt;for(let r=0,i=t.count;r<i;r++)o.fromBufferAttribute(t,r),on.colorSpaceToWorking(o,fe),t.setXYZ(r,o.r,o.g,o.b)}_loadLibrary(t,n){const o=new rt(this.manager);return o.setPath(this.decoderPath),o.setResponseType(n),o.setWithCredentials(this.withCredentials),new Promise((r,i)=>{o.load(t,r,void 0,i)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;const t=typeof WebAssembly!="object"||this.decoderConfig.type==="js",n=[];return t?n.push(this._loadLibrary("draco_decoder.js","text")):(n.push(this._loadLibrary("draco_wasm_wrapper.js","text")),n.push(this._loadLibrary("draco_decoder.wasm","arraybuffer"))),this.decoderPending=Promise.all(n).then(o=>{const r=o[0];t||(this.decoderConfig.wasmBinary=o[1]);const i=ao.toString(),a=["/* draco decoder */",r,"","/* worker */",i.substring(i.indexOf("{")+1,i.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([a]))}),this.decoderPending}_getWorker(t,n){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){const r=new Worker(this.workerSourceURL);r._callbacks={},r._taskCosts={},r._taskLoad=0,r.postMessage({type:"init",decoderConfig:this.decoderConfig}),r.onmessage=function(i){const a=i.data;switch(a.type){case"decode":r._callbacks[a.id].resolve(a);break;case"error":r._callbacks[a.id].reject(a);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+a.type+'"')}},this.workerPool.push(r)}else this.workerPool.sort(function(r,i){return r._taskLoad>i._taskLoad?-1:1});const o=this.workerPool[this.workerPool.length-1];return o._taskCosts[t]=n,o._taskLoad+=n,o})}_releaseTask(t,n){t._taskLoad-=t._taskCosts[n],delete t._callbacks[n],delete t._taskCosts[n]}debug(){console.log("Task load: ",this.workerPool.map(t=>t._taskLoad))}dispose(){for(let t=0;t<this.workerPool.length;++t)this.workerPool[t].terminate();return this.workerPool.length=0,this.workerSourceURL!==""&&URL.revokeObjectURL(this.workerSourceURL),this}}function ao(){let e,t;onmessage=function(a){const s=a.data;switch(s.type){case"init":e=s.decoderConfig,t=new Promise(function(u){e.onModuleLoaded=function(d){u({draco:d})},DracoDecoderModule(e)});break;case"decode":const l=s.buffer,c=s.taskConfig;t.then(u=>{const d=u.draco,f=new d.Decoder;try{const m=n(d,f,new Int8Array(l),c),y=m.attributes.map(h=>h.array.buffer);m.index&&y.push(m.index.array.buffer),self.postMessage({type:"decode",id:s.id,geometry:m},y)}catch(m){console.error(m),self.postMessage({type:"error",id:s.id,error:m.message})}finally{d.destroy(f)}});break}};function n(a,s,l,c){const u=c.attributeIDs,d=c.attributeTypes;let f,m;const y=s.GetEncodedGeometryType(l);if(y===a.TRIANGULAR_MESH)f=new a.Mesh,m=s.DecodeArrayToMesh(l,l.byteLength,f);else if(y===a.POINT_CLOUD)f=new a.PointCloud,m=s.DecodeArrayToPointCloud(l,l.byteLength,f);else throw new Error("THREE.DRACOLoader: Unexpected geometry type.");if(!m.ok()||f.ptr===0)throw new Error("THREE.DRACOLoader: Decoding failed: "+m.error_msg());const h={index:null,attributes:[]};for(const p in u){const F=self[d[p]];let A,g;if(c.useUniqueIDs)g=u[p],A=s.GetAttributeByUniqueId(f,g);else{if(g=s.GetAttributeId(f,a[u[p]]),g===-1)continue;A=s.GetAttribute(f,g)}const S=r(a,s,f,p,F,A);p==="color"&&(S.vertexColorSpace=c.vertexColorSpace),h.attributes.push(S)}return y===a.TRIANGULAR_MESH&&(h.index=o(a,s,f)),a.destroy(f),h}function o(a,s,l){const u=l.num_faces()*3,d=u*4,f=a._malloc(d);s.GetTrianglesUInt32Array(l,d,f);const m=new Uint32Array(a.HEAPF32.buffer,f,u).slice();return a._free(f),{array:m,itemSize:1}}function r(a,s,l,c,u,d){const f=l.num_points(),m=d.num_components(),y=i(a,u),h=m*u.BYTES_PER_ELEMENT,p=Math.ceil(h/4)*4,F=p/u.BYTES_PER_ELEMENT,A=f*h,g=f*p,S=a._malloc(A);s.GetAttributeDataArrayForAllPoints(l,d,y,A,S);const T=new u(a.HEAPF32.buffer,S,A/u.BYTES_PER_ELEMENT);let E;if(h===p)E=T.slice();else{E=new u(g/u.BYTES_PER_ELEMENT);let D=0;for(let _=0,N=T.length;_<N;_++){for(let $=0;$<m;$++)E[D+$]=T[_*m+$];D+=F}}return a._free(S),{name:c,count:f,itemSize:m,array:E,stride:F}}function i(a,s){switch(s){case Float32Array:return a.DT_FLOAT32;case Int8Array:return a.DT_INT8;case Int16Array:return a.DT_INT16;case Int32Array:return a.DT_INT32;case Uint8Array:return a.DT_UINT8;case Uint16Array:return a.DT_UINT16;case Uint32Array:return a.DT_UINT32}}}const _t=8e3,io=[250,1e3];function Pt(e){return e.reason??new DOMException("The operation was aborted.","AbortError")}function so(e){if(e!=null&&e.aborted)throw Pt(e)}function lo(e,t){return new Promise((n,o)=>{const r=()=>{clearTimeout(i),o(Pt(t))},i=setTimeout(()=>{t==null||t.removeEventListener("abort",r),n()},e);t==null||t.addEventListener("abort",r,{once:!0})})}async function co(e,t={}){const{signal:n,retryDelaysMs:o=io}=t;for(let r=0;;r++){so(n);try{return await e()}catch(i){if(n!=null&&n.aborted||r>=o.length)throw i;await lo(o[r],n)}}}function Et(e,t={}){const{timeoutMs:n=_t,retryDelaysMs:o}=t;return co(async()=>{const r=new AbortController,i=setTimeout(()=>r.abort(new DOMException("fetch timeout","TimeoutError")),n);try{return await fetch(e,{signal:r.signal})}finally{clearTimeout(i)}},{retryDelaysMs:o})}const Ot='const U="DecompressionStream is unavailable for deflate streams";let M=null;const N="https://cdn.jsdelivr.net/npm/brotli-wasm@3.0.1/index.web.js",p=self;p.onmessage=async e=>{const{id:o}=e.data;try{const n="buffer"in e.data?await R(e.data.buffer):B(e.data);p.postMessage({id:o,result:n},[n.positions.buffer,n.colors.buffer])}catch(n){p.postMessage({id:o,error:n instanceof Error?n.message:String(n)})}};function B(e){return{positions:q(e.posBytes,e.meta),colors:D(e.y,e.cb,e.cr,e.meta),count:e.meta.N,bounds:{min:[e.meta.bbox[0],e.meta.bbox[1],e.meta.bbox[2]],max:[e.meta.bbox[3],e.meta.bbox[4],e.meta.bbox[5]]}}}async function R(e){var l;const o=new Uint8Array(e),n=new DataView(o.buffer,o.byteOffset,4).getUint32(0,!0),t=JSON.parse(new TextDecoder().decode(o.slice(4,4+n)));if(!((l=t.format)!=null&&l.startsWith("mdpc-")))throw new Error(`Unsupported MDPC format: ${t.format}`);let r=4+n;const s=o.slice(r,r+t.posLen);r+=t.posLen;const c=o.slice(r,r+t.yLen);r+=t.yLen;const i=o.slice(r,r+t.cbLen);r+=t.cbLen;const f=o.slice(r,r+t.crLen),[d,w,h,m]=await Promise.all([u(s,t.codec),u(c,t.codec),u(i,t.codec),u(f,t.codec)]);return B({meta:t,posBytes:d,y:w,cb:h,cr:m})}async function u(e,o){const n=o==="deflate"?"deflate":"br",t=globalThis.DecompressionStream;if(t)try{const c=new Uint8Array(e.byteLength);c.set(e);const i=new Blob([c.buffer]).stream().pipeThrough(new t(n));return new Uint8Array(await new Response(i).arrayBuffer())}catch(c){if(n==="deflate")throw c}else if(n==="deflate")throw new Error(U);M??(M=import(N).then(async c=>{const i=await(c.default??c);if(typeof(i==null?void 0:i.decompress)!="function")throw new Error("brotli-wasm did not expose decompress()");return i}));const s=(await M).decompress(e);return s instanceof Uint8Array?s:new Uint8Array(s)}function q(e,o){const[n,t,r,s,c,i]=o.bbox,f=(1<<o.qpPos)-1,d=(s-n)/f,w=(c-t)/f,h=(i-r)/f,m=new Float32Array(o.N*3);let l=0n,E=0;for(let b=0;b<o.N;b+=1){let y=0n,g=0n;for(;;){const a=e[E++]??0;if(y|=BigInt(a&127)<<g,!(a&128))break;g+=7n}l+=y;let S=0,L=0,A=0;for(let a=0;a<o.qpPos;a+=1)l>>BigInt(a*3)&1n&&(S|=1<<a),l>>BigInt(a*3+1)&1n&&(L|=1<<a),l>>BigInt(a*3+2)&1n&&(A|=1<<a);m[b*3]=n+S*d,m[b*3+1]=t+L*w,m[b*3+2]=r+A*h}return m}function D(e,o,n,t){const r=new Float32Array(t.N*3);for(let s=0;s<t.N;s+=1){const c=e[s]??0,i=(o[Math.min(o.length-1,Math.floor(s/t.chromaSub))]??128)-128,f=(n[Math.min(n.length-1,Math.floor(s/t.chromaSub))]??128)-128;r[s*3]=x((c+1.402*f)/255),r[s*3+1]=x((c-.344136*i-.714136*f)/255),r[s*3+2]=x((c+1.772*i)/255)}return r}function x(e){return e<0?0:e>1?1:e}\n',ut=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",Ot],{type:"text/javascript;charset=utf-8"});function uo(e){let t;try{if(t=ut&&(self.URL||self.webkitURL).createObjectURL(ut),!t)throw"";const n=new Worker(t,{type:"module",name:e==null?void 0:e.name});return n.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(t)}),n}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(Ot),{type:"module",name:e==null?void 0:e.name})}}const fo="DecompressionStream is unavailable for deflate streams",Ge="Unsupported MDPC deflate stream: DecompressionStream('deflate') is unavailable in this browser";let q=null,Rt=1;const B=new Map,Lt=1e4;let le=null;async function Nt(e,t={}){const n=await Et(e);if(!n.ok)throw H(new Error(`Failed to fetch ${e}: ${n.status}`),{assetUrl:e,phase:"mdpc-fetch"});let o;try{o=await n.arrayBuffer()}catch(d){throw H(d instanceof Error?d:new Error(String(d)),{assetUrl:e,phase:"mdpc-read"})}const r=o.byteLength,{meta:i,metaLen:a}=po(o,e);mo(i,e);const s=await yo(o,i,a),l=s?await go(s,e):await vo(o,e);return{...t.orientAsConverted??e.includes("/converted/")?ho(l):l,byteSize:r,hasColors:!0}}function ho(e){const t=new Float32Array(e.positions);for(let n=0;n<e.count;n++){const o=n*3;t[o+1]=-t[o+1],t[o+2]=-t[o+2]}return{...e,positions:t,bounds:{min:[e.bounds.min[0],-e.bounds.max[1],-e.bounds.max[2]],max:[e.bounds.max[0],-e.bounds.min[1],-e.bounds.min[2]]}}}function zt(){return globalThis.DecompressionStream}function po(e,t){var n;try{const o=new Uint8Array(e),r=new DataView(o.buffer,o.byteOffset,4).getUint32(0,!0),i=JSON.parse(new TextDecoder().decode(o.slice(4,4+r)));if(!((n=i.format)!=null&&n.startsWith("mdpc-")))throw new Error(`Unsupported MDPC format: ${i.format}`);return{meta:i,metaLen:r}}catch(o){throw H(o instanceof Error?o:new Error(String(o)),{assetUrl:t,phase:"mdpc-parse"})}}function mo(e,t){if(e.codec!=="deflate")return;const n=zt();if(!le||le.Ctor!==n)try{if(!n)throw new Error("missing constructor");new n("deflate"),le={Ctor:n,supported:!0}}catch{le={Ctor:n,supported:!1}}if(!le.supported)throw H(new Error(Ge),{assetUrl:t,phase:"mdpc-unsupported-decompression-stream",decodeKind:"mdpc-native-preflight",mdpcFormat:e.format,mdpcCodec:e.codec,decompressionFormat:"deflate"})}async function yo(e,t,n){const o=zt();if(!o)return null;try{const r=new Uint8Array(e),i=t.codec==="deflate"?"deflate":"br";let a=4+n;const s=r.slice(a,a+t.posLen);a+=t.posLen;const l=r.slice(a,a+t.yLen);a+=t.yLen;const c=r.slice(a,a+t.cbLen);a+=t.cbLen;const u=r.slice(a,a+t.crLen),[d,f,m,y]=await Promise.all([ge(s,o,i),ge(l,o,i),ge(c,o,i),ge(u,o,i)]);return{meta:t,posBytes:d,y:f,cb:m,cr:y}}catch{return null}}async function ge(e,t,n){const o=new Uint8Array(e.byteLength);o.set(e);const r=new Blob([o.buffer]).stream().pipeThrough(new t(n));return new Uint8Array(await new Response(r).arrayBuffer())}function xe(e,t){return{assetUrl:e.url,phase:t,decodeKind:e.decodeKind,mdpcElapsedMs:At(e.startedAt)}}function So(e,t){return e===fo?H(new Error(Ge),{...xe(t,"mdpc-unsupported-decompression-stream"),mdpcCodec:"deflate",decompressionFormat:"deflate"}):H(new Error(e),{...xe(t,"mdpc-decode")})}function Ut(e){for(const t of B.values())t.reject(e(t));B.clear()}function It(){q==null||q.terminate(),q=null}function kt(e,t){return e*(t+1)}function Gt(e,t){return setTimeout(()=>{B.has(e)&&(It(),Ut(n=>H(new Error(`MDPC worker decode timeout after ${t}ms`),{...xe(n,"mdpc-decode-timeout"),mdpcTimeoutMs:t})))},t)}function Ht(e,t,n,o,r,i){B.set(e,{resolve:a=>{clearTimeout(t),n(a)},reject:a=>{clearTimeout(t),o(a)},url:r,decodeKind:i,startedAt:performance.now()})}function vo(e,t){const n=Rt++,o=Bt();return new Promise((r,i)=>{const a=kt(Lt,B.size),s=Gt(n,a);Ht(n,s,r,i,t,"mdpc-worker"),o.postMessage({id:n,buffer:e},[e])})}function go(e,t){const n=Rt++,o=Bt();return new Promise((r,i)=>{const a=kt(Lt,B.size),s=Gt(n,a);Ht(n,s,r,i,t,"mdpc-native-streams-worker"),o.postMessage({id:n,...e},[e.posBytes.buffer,e.y.buffer,e.cb.buffer,e.cr.buffer])})}function Bt(){if(q)return q;const e=new uo;return e.onmessage=t=>{const n=B.get(t.data.id);if(n){if(B.delete(t.data.id),t.data.error){n.reject(So(t.data.error,n));return}n.resolve(t.data.result)}},e.onerror=t=>{const n=t.filename?`${t.filename}:${t.lineno??"?"}:${t.colno??"?"}`:"unknown location",o=t.message||`MDPC worker failed at ${n}`;Ut(r=>H(new Error(o),{...xe(r,"mdpc-worker-error"),workerLocation:n})),It()},q=e,e}const we=10,wo=["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"];let X=null;const ce=new Map,Pe=new Map;async function bo(e,t={}){if(ce.has(e)){const r=Pe.get(e);return t.orientAsConverted!==void 0&&r!==void 0&&t.orientAsConverted!==r&&`${e}${r}${t.orientAsConverted}`,ce.get(e)}Pe.set(e,t.orientAsConverted);const n=/^(https?|blob):/.test(e)||e.startsWith("/"),o=(async()=>{if(n)return xo(e,t.orientAsConverted);try{return await Nt(`/pointclouds/${e}.mdpc`,{orientAsConverted:t.orientAsConverted})}catch{}const r=`/pointclouds/${e}.bin`;if(await Co(r))return Mo(r);throw new Error(`Pointcloud not found: ${e} (no .mdpc or .bin)`)})();return ce.set(e,o),o.catch(()=>{ce.get(e)===o&&(ce.delete(e),Pe.delete(e))}),o}const Ee=/\.(mdpc|bin)(?=[?#]|$)/;async function xo(e,t){const n=Ee.test(e)?[e.replace(Ee,".bin"),e.replace(Ee,".mdpc")]:[e];let o;for(let r=0;r<n.length;r++)try{return await Nt(n[r],{orientAsConverted:t})}catch(i){o=i}throw o instanceof Error?o:new Error(`Failed to load pointcloud: ${e}`)}async function Co(e){try{const t=await fetch(e,{method:"HEAD",signal:AbortSignal.timeout(_t)});return t.ok?!(t.headers.get("content-type")??"").startsWith("text/html"):!1}catch{return!1}}function To(){return X||(X=new ro,X.setDecoderPath("/draco/"),X.setDecoderConfig({type:"wasm"}),X.preload()),X}async function Mo(e){const t=await Et(e);if(!t.ok)throw new Error(`Failed to fetch ${e}: ${t.status}`);const n=await t.arrayBuffer(),o=new TextDecoder,r=parseInt(o.decode(n.slice(0,we)),10);if(!Number.isFinite(r)||r<=0)throw new Error(`Invalid point cloud header: ${e}`);const i=JSON.parse(o.decode(n.slice(we,we+r))),a={},s={};if(Array.isArray(i.attributes))for(let c=0;c<i.attributes.length;c++){const[u,d]=i.attributes[c];a[u]=c,s[u]=wo[d]??"Float32Array"}else if(i.format==="draco-pointcloud"&&i.attributes)a.position=0,a.color=1,s.position="Float32Array",s.color="Float32Array";else throw new Error(`Unsupported point cloud metadata: ${e}`);const l=await To().decodeGeometry(n.slice(we+r),{attributeIDs:a,attributeTypes:s,useUniqueIDs:!0});return{...Fo(l,Ao(i.bounds)),byteSize:n.byteLength}}function Fo(e,t){const n=e.getAttribute("position")??e.getAttribute("positions");if(!n)throw new Error("Point cloud has no position attribute");const o=n.array instanceof Float32Array?n.array:new Float32Array(n.array),r=o.length/3,i=e.getAttribute("color")??e.getAttribute("colors");let a=new Float32Array(r*3),s=!1;if(i){const l=i.array,c=i.array instanceof Uint8Array?1/255:i.array instanceof Uint16Array?1/65535:1;a=new Float32Array(l.length);for(let u=0;u<l.length;u++)a[u]=(l[u]??0)*c;s=Po(a)}return s||a.fill(1),e.dispose(),{positions:o,colors:a,count:r,hasColors:s,bounds:t}}function Ao(e){if(!e||typeof e!="object")return;const t=e;if(!(!dt(t.min)||!dt(t.max)))return{min:t.min,max:t.max}}function dt(e){return Array.isArray(e)&&e.length===3&&e.every(t=>typeof t=="number"&&Number.isFinite(t))}function Do(e,t){const n=Math.random();if(!e.cdf||t<=0||Math.random()>t)return Math.floor(n*e.count);let o=0,r=e.cdf.length-1;for(;o<r;){const i=o+r>>1;e.cdf[i]<n?o=i+1:r=i}return o}function _o(e,t){const n=new Float32Array(e.positions),o=e.bounds?new x(...e.bounds.min):new x(1/0,1/0,1/0),r=e.bounds?new x(...e.bounds.max):new x(-1/0,-1/0,-1/0);if(!e.bounds)for(let l=0;l<e.count;l++){const c=n[l*3],u=n[l*3+1],d=n[l*3+2];c<o.x&&(o.x=c),c>r.x&&(r.x=c),u<o.y&&(o.y=u),u>r.y&&(r.y=u),d<o.z&&(o.z=d),d>r.z&&(r.z=d)}const i=new x().subVectors(r,o),a=new x().addVectors(o,r).multiplyScalar(.5),s=t*2/(Math.max(i.x,i.y,i.z)||1);for(let l=0;l<e.count;l++)n[l*3]=(n[l*3]-a.x)*s,n[l*3+1]=(n[l*3+1]-a.y)*s,n[l*3+2]=(n[l*3+2]-a.z)*s;return n}function Po(e){let t=-1/0,n=1/0;for(let o=0;o<e.length;o++){const r=e[o];if(!Number.isFinite(r))return!1;r<n&&(n=r),r>t&&(t=r)}return n>=0&&t<=1.5}const ft={off:0,dots:1,xLines:2,yLines:3,zLines:4,floorGrid:5,sphere:6,ripple:7,spokes:8,spiral:10},Eo=new Set(["xLines","yLines","zLines","floorGrid"]),Oo=2.5,jt=Math.PI*2;function He(e){return ft[e]??ft.off}function Wt(e,t){return`${e.layout}:${e.gridSize}:${e.layoutRadius}:${e.layoutThickness}:${e.layoutPreserveY}:${e.layoutTwist}:${e.layoutAmplitude}:${e.layoutFrequency}:${e.layoutSpokes}:${e.layoutRadialSpacing}:${e.layoutTurns}:${e.layoutHeight}:${t}`}function Yt(e,t,n){const o=new Float32Array(t*3),r=n.layout;if(r==="off"||r==="dots")return o;const i=Math.max(Math.abs(n.gridSize),1e-4);return Eo.has(r)?(Ro(o,e,t,r,i),o):(Lo(o,e,t,n,i),o)}function Ro(e,t,n,o,r){for(let i=0;i<n;i++){const a=i*3,s=t[a]??0,l=t[a+1]??0,c=t[a+2]??0,u=oe(s,r),d=oe(l,r),f=oe(c,r);if(o==="xLines")e[a]=s,e[a+1]=d,e[a+2]=f;else if(o==="yLines")e[a]=u,e[a+1]=l,e[a+2]=f;else if(o==="zLines")e[a]=u,e[a+1]=d,e[a+2]=c;else{const m=(l-d)**2+(c-f)**2,y=(s-u)**2+(l-d)**2;e[a]=y<m?u:s,e[a+1]=d,e[a+2]=y<m?c:f}}}function Lo(e,t,n,o,r){const i=ko(t,n),a=new x,s=new x;for(let l=0;l<n;l++){const c=l*3;a.set(t[c]??0,t[c+1]??0,t[c+2]??0).sub(i.center).multiplyScalar(i.scale),o.layout==="sphere"?No(s,a,o):o.layout==="ripple"?zo(s,a,o,r):o.layout==="spokes"?Uo(s,a,o):Io(s,a,o),s.divideScalar(i.scale).add(i.center),e[c]=s.x,e[c+1]=s.y,e[c+2]=s.z}}function No(e,t,n){const o=t.length(),r=Math.max(n.layoutRadius??4.5,.001),i=M.clamp(n.layoutThickness??.9,0,1),a=M.clamp(n.layoutPreserveY??.35,0,1),s=o>1e-4?e.copy(t).divideScalar(o):e.set(0,1,0);e.copy(s).multiplyScalar(M.lerp(r,o,i)),e.y=M.lerp(e.y,t.y,a),Ho(e,e.y*(n.layoutTwist??0))}function zo(e,t,n,o){const r=Math.hypot(t.x,t.z),i=oe(r,o),a=Math.atan2(t.z,t.x)+t.y*(n.layoutTwist??0),s=Math.sin(i*(n.layoutFrequency??11.5))*(n.layoutAmplitude??.16);e.set(Math.cos(a)*i,t.y+s,Math.sin(a)*i)}function Uo(e,t,n){const o=Math.max(n.layoutSpokes??24,3),r=jt/o,i=Math.atan2(t.z,t.x)+t.y*(n.layoutTwist??0),a=oe(i,r),s=n.layoutRadialSpacing??0;let l=Math.hypot(t.x,t.z);s>1e-4&&(l=oe(l,s)),e.set(Math.cos(a)*l,t.y,Math.sin(a)*l)}function Io(e,t,n){const o=M.clamp(t.y/5+.5,0,1),r=Math.max(n.layoutRadius??2.5,.001),i=Math.max(n.layoutHeight??5,.001),a=n.layoutTurns??3,s=o*a*jt+Math.hypot(t.x,t.z)*(n.layoutTwist??0);e.set(Math.cos(s)*r,(o-.5)*i,Math.sin(s)*r)}function ko(e,t){const n=Go(e,t,.001),o=n.getCenter(new x),r=n.getSize(new x),i=Math.max(r.x,r.y,r.z,1e-4);return{center:o,scale:Oo*2/i}}function Go(e,t,n){const o=new an,r=new x;for(let i=0;i<t;i++){const a=i*3;r.set(e[a]??0,e[a+1]??0,e[a+2]??0),o.expandByPoint(r)}return o.min.set(Math.floor(o.min.x/n)*n-n,Math.floor(o.min.y/n)*n-n,Math.floor(o.min.z/n)*n-n),o.max.set(Math.ceil(o.max.x/n)*n+n,Math.ceil(o.max.y/n)*n+n,Math.ceil(o.max.z/n)*n+n),o}function oe(e,t){return Math.round(e/t)*t}function Ho(e,t){const n=Math.cos(t),o=Math.sin(t),r=e.x*n-e.z*o,i=e.x*o+e.z*n;e.x=r,e.z=i}const Bo=`uniform float uTime;
uniform float uPointSize;
uniform float uDistanceSizeInfluence;
uniform float uDistanceSizeNear;
uniform float uDistanceSizeFar;
uniform float uDistanceSizeMax;
uniform float uPointSizeScale;
uniform float uDensityFillJitter;
uniform float uDensityFillPass;
uniform float uDensityFillPointSizeScale;
uniform float uMaxPointSize;
uniform float uSimplePoints;
uniform float uOpacity;
uniform float uExposure;
uniform float uTransparentPoints;
uniform vec3 uRandomize;
uniform float uCamFadeNear;
uniform float uCamFadeFar;
uniform float uCamFadeEnabled;
uniform float uDPR;
// Adaptive render scale (1 = full). gl_PointSize and uMaxPointSize are both in
// render-target device pixels; uDPR already carries renderScale into the point
// size, so the max-size ceiling is scaled here too to stay invariant on the
// upsampled quad (clamped near points pixelate with the scene, not balloon).
uniform float uRenderScale;
uniform float uFlowEnabled;
uniform float uFlowType;
uniform float uFlowStrength;
uniform float uFlowSpeed;
uniform float uFlowScale;
uniform float uFlowGridLayout;
uniform float uFlowGridEnabled;
uniform float uFlowGridSize;
uniform float uFlowGridStrength;
uniform vec3 uFlowGridMix;
uniform vec3 uFlowGridRotation;
uniform float uFlowConveyorEnabled;
uniform float uFlowConveyorSpeed;
uniform float uFlowConveyorDepth;
uniform vec3 uFlowConveyorAxis;
uniform float uFlowConveyorDistanceNear;
uniform float uFlowConveyorDistanceFar;
uniform float uFlowRandomnessExponent;
uniform float uFlowDistanceNear;
uniform float uFlowDistanceFar;
uniform sampler2D uFluidVelocity;
uniform float uFluidInfluence;
uniform float uTransitionYOffset;
uniform float uTransitionProgress;
uniform float uTransitionRestProgress;
uniform float uTransitionPow;
uniform float uIntroColorMix;
uniform float uSelectiveAmount;
uniform vec3 uSelectiveAdj[__POINTCLOUD_COLOR_CORRECTION_RANGE_COUNT__];
uniform float uAnchorHighlightOpacity;
uniform float uAnchorHighlightScale;
uniform vec3 uAnchorGlowPositions[8];
uniform float uAnchorGlowRadius;
uniform float uAnchorGlowStrength;
uniform float uAnchorGlowPulse[8];
uniform float uAnchorGlowStrumStrength;
const int SDF_SHAPE_COUNT = __SDF_SHAPE_COUNT__;
uniform int uSdfShapeCount;
uniform float uSdfShapeType[SDF_SHAPE_COUNT];
uniform float uSdfShapeStrength[SDF_SHAPE_COUNT];
uniform float uSdfShapeFalloff[SDF_SHAPE_COUNT];
uniform float uSdfShapeGradient[SDF_SHAPE_COUNT];
uniform float uSdfShapePolarity[SDF_SHAPE_COUNT];
uniform vec4 uSdfShapeParams[SDF_SHAPE_COUNT];
uniform vec4 uSdfShapeBounds[SDF_SHAPE_COUNT];
uniform mat4 uSdfShapeInverseMatrices[SDF_SHAPE_COUNT];

attribute float aSize;
attribute vec4 aRandom;
attribute float aAnchorHighlight;
attribute vec3 aLayoutTarget;

varying vec3 vCloudColor;
varying float vSplatSize;
varying vec3 vWorldPosition;
varying float vAnchorGlow;
varying float vProjectedPointSize;
varying float vCameraFade;
varying float vSparkleSeed;

const float ANCHOR_PROJECTED_POINT_SIZE = 2.0;
const float CONVEYOR_SPEED_SCALE = 0.6;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

#if POINTCLOUD_USE_FLOW
float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = hash(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

vec3 curlNoise(vec3 p) {
  float e = 0.1;
  float n1 = valueNoise(p + vec3(0.0, e, 0.0));
  float n2 = valueNoise(p - vec3(0.0, e, 0.0));
  float a = (n1 - n2) / (2.0 * e);
  n1 = valueNoise(p + vec3(0.0, 0.0, e));
  n2 = valueNoise(p - vec3(0.0, 0.0, e));
  float b = (n1 - n2) / (2.0 * e);
  n1 = valueNoise(p + vec3(e, 0.0, 0.0));
  n2 = valueNoise(p - vec3(e, 0.0, 0.0));
  float c = (n1 - n2) / (2.0 * e);
  return normalize(vec3(a - b, b - c, c - a));
}

float applyFlow(inout vec3 pos, float distanceToCamera) {
  if (uFlowEnabled < 0.5 || uFlowStrength <= 0.0) return 1.0;
  float flowMask = smoothstep(uFlowDistanceFar, uFlowDistanceNear, distanceToCamera);
  if (flowMask <= 0.0001) return 1.0;
  float t = uTime * uFlowSpeed;
  float s = max(uFlowScale, 0.0001);
  float strength = uFlowStrength * flowMask;
  if (uFlowType < 2.5) {
    vec3 curl = curlNoise(pos * s + vec3(t * 0.08, t * 0.05, -t * 0.04));
    pos += curl * strength * 0.16 * (0.45 + aRandom.w);
    return 1.0;
  } else {
    float sparseMask = pow(aRandom.x, max(uFlowRandomnessExponent, 1.0));
    float rise = fract(t * 0.04 + pow(aRandom.y, 10.0) * 20.0);
    float lifeScale = smoothstep(0.0, 0.08, rise) * (1.0 - smoothstep(0.82, 1.0, rise));
    pos.y += rise * sparseMask * strength * 7.0 * mix(0.4, 1.2, aRandom.z);
    pos.y += sin(t + aRandom.x * 20.0) * sparseMask * strength * 0.08 * aRandom.w;
    return lifeScale;
  }
}
#endif

#if POINTCLOUD_USE_FLOW_LAYOUT
vec3 rotateX(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);
}

vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
}

vec3 rotateZ(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z);
}

vec3 rotateGrid(vec3 p, vec3 rotation) {
  p = rotateX(p, rotation.x);
  p = rotateY(p, rotation.y);
  return rotateZ(p, rotation.z);
}

vec3 rotateGridInverse(vec3 p, vec3 rotation) {
  p = rotateZ(p, -rotation.z);
  p = rotateY(p, -rotation.y);
  return rotateX(p, -rotation.x);
}

vec3 applyFlowLayout(vec3 pos, float mask) {
  if (
    uFlowGridEnabled < 0.5 ||
    uFlowGridLayout < 0.5 ||
    uFlowGridStrength <= 0.0 ||
    mask <= 0.0
  ) {
    return pos;
  }
  vec3 target = aLayoutTarget;
  if (uFlowGridLayout < 1.5) {
    float gridSize = max(uFlowGridSize, 0.0001);
    vec3 gridPos = rotateGridInverse(pos, uFlowGridRotation);
    vec3 snapped = floor(gridPos / gridSize + 0.5) * gridSize;
    vec3 gridMix = clamp(uFlowGridMix, vec3(0.0), vec3(1.0));
    return rotateGrid(mix(gridPos, snapped, gridMix), uFlowGridRotation);
  }
  return mix(pos, target, clamp(uFlowGridStrength, 0.0, 1.0));
}
#endif

#if POINTCLOUD_USE_CONVEYOR
float conveyorFlowOffset(vec4 mv, float mask, out float life) {
  life = 1.0;
  if (uFlowConveyorEnabled < 0.5 || mask <= 0.0) {
    return 0.0;
  }
  float speed = uFlowConveyorSpeed * CONVEYOR_SPEED_SCALE;
  if (abs(speed) <= 0.0001) {
    return 0.0;
  }
  float depth = max(uFlowConveyorDepth, 0.001);
  float distanceToCamera = max(-mv.z, 0.001);
  float flowMask = smoothstep(
    uFlowConveyorDistanceFar,
    uFlowConveyorDistanceNear,
    distanceToCamera
  );
  if (flowMask <= 0.0001) {
    return 0.0;
  }
  float direction = speed >= 0.0 ? 1.0 : -1.0;
  float phase = fract(aRandom.x + uTime * abs(speed) / depth);
  life = 1.0 - smoothstep(0.25, 0.5, abs(phase - 0.5));
  return (phase - 0.5) * depth * direction * flowMask;
}
#endif

float anchorGlowForPosition(vec3 pos) {
  float glow = 0.0;
  for (int i = 0; i < 8; i++) {
    float pulse = uAnchorGlowPulse[i];
    float radius = max(uAnchorGlowRadius, 0.0001);
    float particleStrength = mix(0.45, 1.15, pow(aRandom.y, 0.65));
    float strength = (uAnchorGlowStrength + pulse * uAnchorGlowStrumStrength) * particleStrength;
    float d = distance(pos, uAnchorGlowPositions[i]);
    float falloff = clamp(1.0 - d / radius, 0.0, 1.0);
    falloff = falloff * falloff * falloff * falloff;
    glow = max(glow, falloff * strength);
  }
  return glow;
}

float sdfSphere(vec3 p, float radius) {
  return length(p) - max(radius, 0.0001);
}

float sdfBox(vec3 p, vec3 halfExtents) {
  vec3 q = abs(p) - max(halfExtents, vec3(0.0001));
  return length(max(q, vec3(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdfTorus(vec3 p, vec2 torus) {
  vec2 q = vec2(length(p.xz) - max(torus.x, 0.0001), p.y);
  return length(q) - max(torus.y, 0.0001);
}

float sdfCylinder(vec3 p, float radius, float halfHeight) {
  vec2 d = abs(vec2(length(p.xz), p.y)) -
    vec2(max(radius, 0.0001), max(halfHeight, 0.0001));
  return min(max(d.x, d.y), 0.0) + length(max(d, vec2(0.0)));
}

const float SDF_INV_SQRT_3 = 0.57735027;
const float DODECAHEDRON_NORMAL_SHORT = 0.35682209;
const float DODECAHEDRON_NORMAL_LONG = 0.93417236;
const vec3 DODECAHEDRON_NORMAL_111 = vec3(SDF_INV_SQRT_3);
const vec3 DODECAHEDRON_NORMAL_0SL = vec3(
  0.0,
  DODECAHEDRON_NORMAL_SHORT,
  DODECAHEDRON_NORMAL_LONG
);
const vec3 DODECAHEDRON_NORMAL_SL0 = vec3(
  DODECAHEDRON_NORMAL_SHORT,
  DODECAHEDRON_NORMAL_LONG,
  0.0
);
const vec3 DODECAHEDRON_NORMAL_L0S = vec3(
  DODECAHEDRON_NORMAL_LONG,
  0.0,
  DODECAHEDRON_NORMAL_SHORT
);

float sdfOctahedron(vec3 p, float size) {
  return (dot(abs(p), vec3(1.0)) - max(size, 0.0001)) * SDF_INV_SQRT_3;
}

float sdfDodecahedron(vec3 p, float radius) {
  vec3 q = abs(p);
  float d = dot(q, DODECAHEDRON_NORMAL_111);
  d = max(d, dot(q, DODECAHEDRON_NORMAL_0SL));
  d = max(d, dot(q, DODECAHEDRON_NORMAL_SL0));
  d = max(d, dot(q, DODECAHEDRON_NORMAL_L0S));
  return d - max(radius, 0.0001);
}

// Type indices must match getSdfShapeTypeIndex() in PointcloudObject.ts.
float sdfForShapeLocal(int shapeType, vec4 params, vec3 localPosition) {
  if (shapeType == 1) {
    return sdfSphere(localPosition, params.x);
  }
  if (shapeType == 2) {
    return sdfBox(localPosition, params.xyz);
  }
  if (shapeType == 3) {
    return sdfTorus(localPosition, params.xy);
  }
  if (shapeType == 4) {
    return sdfCylinder(localPosition, params.x, params.y);
  }
  if (shapeType == 5) {
    return sdfOctahedron(localPosition, params.x);
  }
  if (shapeType == 6) {
    return sdfDodecahedron(localPosition, params.x);
  }
  return 1e6;
}

vec3 sdfNormalForShapeLocal(int shapeType, vec4 params, vec3 localPosition) {
  float e = 0.006;
  vec2 k = vec2(1.0, -1.0);
  vec3 n =
    k.xyy * sdfForShapeLocal(shapeType, params, localPosition + k.xyy * e) +
    k.yyx * sdfForShapeLocal(shapeType, params, localPosition + k.yyx * e) +
    k.yxy * sdfForShapeLocal(shapeType, params, localPosition + k.yxy * e) +
    k.xxx * sdfForShapeLocal(shapeType, params, localPosition + k.xxx * e);
  float lenSq = dot(n, n);
  if (lenSq <= 0.000001) {
    vec3 fallback = localPosition + aRandom.xyz - vec3(0.5);
    lenSq = max(dot(fallback, fallback), 0.000001);
    return fallback * inversesqrt(lenSq);
  }
  return n * inversesqrt(lenSq);
}

// Quintic ease (Perlin smootherstep). C2-continuous, unlike GLSL's cubic
// smoothstep, so the push ramps in/out with no derivative kink -> the
// displacement varies smoothly with distance and reads as more fluid.
float smootherstep01(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

vec3 applySdfShapeCollision(vec3 pos, float mask) {
  if (mask <= 0.0 || uSdfShapeCount <= 0) {
    return pos;
  }
  vec3 pushed = pos;
  int shapeCount = min(uSdfShapeCount, SDF_SHAPE_COUNT);
  for (int i = 0; i < shapeCount; i++) {
    float strength = uSdfShapeStrength[i];
    float falloff = uSdfShapeFalloff[i];
    if (strength <= 0.0001 || falloff <= 0.0001) {
      continue;
    }

    vec4 bounds = uSdfShapeBounds[i];
    vec3 centerDelta = pushed - bounds.xyz;
    if (dot(centerDelta, centerDelta) > bounds.w * bounds.w) {
      continue;
    }

    int shapeType = int(uSdfShapeType[i] + 0.5);
    vec4 params = uSdfShapeParams[i];
    mat4 inverseMatrix = uSdfShapeInverseMatrices[i];
    vec3 localPosition = (inverseMatrix * vec4(pushed, 1.0)).xyz;
    float distanceToShape = sdfForShapeLocal(shapeType, params, localPosition);
    if (distanceToShape >= falloff) {
      continue;
    }

    vec3 localNormal = sdfNormalForShapeLocal(shapeType, params, localPosition);
    mat3 inverseBasis = mat3(inverseMatrix);
    vec3 cloudNormalRaw = vec3(
      dot(inverseBasis[0], localNormal),
      dot(inverseBasis[1], localNormal),
      dot(inverseBasis[2], localNormal)
    );
    float normalLenSq = dot(cloudNormalRaw, cloudNormalRaw);
    vec3 cloudNormal = normalLenSq > 0.000001
      ? cloudNormalRaw * inversesqrt(normalLenSq)
      : normalize(aRandom.xyz - vec3(0.5));
    // Normalized distance through the influence band: 0 at the surface,
    // 1 at the outer falloff edge. Reach (falloff) and push magnitude
    // (strength) are decoupled so widening the band no longer strengthens
    // the push -- they can be dialed independently.
    float outsideDistance = max(distanceToShape, 0.0);
    float bandT = clamp(outsideDistance / falloff, 0.0, 1.0);
    // Quintic shoulder, then gradient shapes how fast the push damps with
    // distance: >1 hugs the surface (steeper damping), <1 reaches farther
    // (gentler damping).
    float fade = 1.0 - smootherstep01(bandT);
    fade = pow(fade, max(uSdfShapeGradient[i], 0.001));
    // Particles inside the shape eject outward, ramping to a capped
    // one-falloff depth so deeply-buried points don't fling out arbitrarily.
    float interior = clamp(-distanceToShape / falloff, 0.0, 1.0);
    float repel = strength * (fade + interior);
    pushed += cloudNormal * repel * uSdfShapePolarity[i];
  }
  return pushed;
}

vec3 markdownPaletteColor(float seed) {
  float r = fract(seed * 4.91 + aRandom.y * 2.37);
  if (r < 0.2) return vec3(0.2196, 0.7765, 0.3059);
  if (r < 0.55) return vec3(0.5059, 0.4275, 0.9176);
  if (r < 0.72) return vec3(0.8549, 0.4078, 0.9843);
  if (r < 0.88) return vec3(0.2667, 0.5569, 0.9647);
  return vec3(0.8980);
}

vec3 remapToMarkdownColor(vec3 sourceColor, float seed) {
  vec3 palette = markdownPaletteColor(seed);
  float luma = dot(sourceColor, vec3(0.2126, 0.7152, 0.0722));
  float value = max(max(sourceColor.r, sourceColor.g), sourceColor.b);
  float brightness = mix(luma, value, 0.45);
  vec3 chroma = normalize(max(palette, vec3(0.001)));
  vec3 colored = chroma * (0.18 + brightness * 1.55);
  return mix(vec3(brightness), colored, 0.86);
}

// Triangular weight for a hue sector centered at \`center\` (in turns 0..1),
// linearly falling to zero at ±1/6 turn away.
float hueSectorWeight(float hue, float center) {
  float d = abs(hue - center);
  d = min(d, 1.0 - d);
  return clamp(1.0 - d * 6.0, 0.0, 1.0);
}

float hueToRgbChannel(float p, float q, float t) {
  t = fract(t);
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

vec3 hslToRgb(vec3 hsl) {
  float h = hsl.x;
  float s = clamp(hsl.y, 0.0, 1.0);
  float l = clamp(hsl.z, 0.0, 1.0);
  if (s < 0.0001) return vec3(l);
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  return vec3(
    hueToRgbChannel(p, q, h + 1.0 / 3.0),
    hueToRgbChannel(p, q, h),
    hueToRgbChannel(p, q, h - 1.0 / 3.0)
  );
}

vec3 applySelectiveColor(vec3 rgb) {
  float amount = clamp(uSelectiveAmount, 0.0, 1.0);
  if (amount < 0.0001) return rgb;

  float maxC = max(rgb.r, max(rgb.g, rgb.b));
  float minC = min(rgb.r, min(rgb.g, rgb.b));
  float chroma = maxC - minC;

  // Hue weights (R/Y/G/C/B/M) — scaled by saturation so neutrals don't bleed.
  float hue = 0.0;
  vec4 wRYGC = vec4(0.0);
  vec2 wBM = vec2(0.0);
  if (chroma > 0.0001) {
    if (rgb.r >= rgb.g && rgb.r >= rgb.b) {
      hue = (rgb.g - rgb.b) / chroma;
      if (hue < 0.0) hue += 6.0;
    } else if (rgb.g >= rgb.b) {
      hue = (rgb.b - rgb.r) / chroma + 2.0;
    } else {
      hue = (rgb.r - rgb.g) / chroma + 4.0;
    }
    hue *= 1.0 / 6.0; // turns
    wRYGC = vec4(
      hueSectorWeight(hue, 0.0 / 6.0),
      hueSectorWeight(hue, 1.0 / 6.0),
      hueSectorWeight(hue, 2.0 / 6.0),
      hueSectorWeight(hue, 3.0 / 6.0)
    );
    wBM = vec2(
      hueSectorWeight(hue, 4.0 / 6.0),
      hueSectorWeight(hue, 5.0 / 6.0)
    );
  }

  // Lightness weights (W/N/K) — based on max+min midpoint.
  float L = (maxC + minC) * 0.5;
  float wW = smoothstep(0.5, 1.0, L);
  float wK = 1.0 - smoothstep(0.0, 0.5, L);
  float wN = clamp(1.0 - abs(L * 2.0 - 1.0), 0.0, 1.0);

  // Accumulate weighted HSL deltas. Each uSelectiveAdj is (hueShiftTurns, satAdd, litAdd).
  vec3 totalAdj =
    wRYGC.x * uSelectiveAdj[0] +
    wRYGC.y * uSelectiveAdj[1] +
    wRYGC.z * uSelectiveAdj[2] +
    wRYGC.w * uSelectiveAdj[3] +
    wBM.x   * uSelectiveAdj[4] +
    wBM.y   * uSelectiveAdj[5] +
    wW      * uSelectiveAdj[6] +
    wN      * uSelectiveAdj[7] +
    wK      * uSelectiveAdj[8];
  totalAdj *= amount;

  float saturation = chroma > 0.0001
    ? (L > 0.5 ? chroma / max(2.0 - maxC - minC, 0.0001) : chroma / max(maxC + minC, 0.0001))
    : 0.0;

  vec3 hsl = vec3(
    fract(hue + totalAdj.x),
    clamp(saturation + totalAdj.y, 0.0, 1.0),
    clamp(L + totalAdj.z, 0.0, 1.0)
  );
  return clamp(hslToRgb(hsl), 0.0, 1.0);
}

void main() {
  float anchorHighlight = clamp(aAnchorHighlight * uAnchorHighlightOpacity, 0.0, 1.0);
  vSplatSize = aSize;
  vSparkleSeed = fract(aRandom.x * 17.13 + aRandom.y * 3.71 + aRandom.z * 11.47);
  vec3 pos = position;
  float anchorMotionMask = 1.0 - step(0.0001, aAnchorHighlight);
  pos += (aRandom.xyz * 2.0 - 1.0) * uRandomize * anchorMotionMask;
#if POINTCLOUD_USE_DENSITY_FILL
  if (uDensityFillJitter > 0.0) {
    vec3 densityFillJitter = vec3(
      hash(aRandom.xyz + vec3(uDensityFillPass * 11.13, 0.0, 0.0)),
      hash(aRandom.yzx + vec3(0.0, uDensityFillPass * 17.71, 0.0)),
      hash(aRandom.zxy + vec3(0.0, 0.0, uDensityFillPass * 23.37))
    );
    pos += (densityFillJitter * 2.0 - 1.0) * uDensityFillJitter * anchorMotionMask;
  }
#endif
  pos.y += sin(uTime * 0.18 + aRandom.x * 12.0) * 0.006 * anchorMotionMask;
  float restProgress = clamp(uTransitionRestProgress, 0.0001, 1.0);
  float transitionSettle = smoothstep(0.0, restProgress, clamp(uTransitionProgress, 0.0, 1.0));
  float transitionMask = pow(aRandom.y, max(uTransitionPow, 0.0001)) * mix(0.35, 1.0, aRandom.z);
  float transitionFloat = transitionMask * (1.0 - transitionSettle);
  pos.y += uTransitionYOffset * transitionFloat * anchorMotionMask;
  float conveyorLife = 1.0;
  float conveyorOffset = 0.0;
  float flowSize = 1.0;
#if POINTCLOUD_USE_FLOW || POINTCLOUD_USE_CONVEYOR
  vec4 preFlowMv = viewMatrix * modelMatrix * vec4(pos, 1.0);
#endif
#if POINTCLOUD_USE_CONVEYOR
  conveyorOffset = conveyorFlowOffset(preFlowMv, anchorMotionMask, conveyorLife);
#endif
#if POINTCLOUD_USE_FLOW
  float preFlowDistance = length(preFlowMv.xyz);
  flowSize = anchorMotionMask > 0.5 ? applyFlow(pos, preFlowDistance) : 1.0;
#endif
#if POINTCLOUD_USE_FLOW_LAYOUT
  pos = applyFlowLayout(pos, anchorMotionMask);
#endif
  float simpleMask = step(0.5, uSimplePoints);
  pos = applySdfShapeCollision(pos, anchorMotionMask);
  vAnchorGlow = simpleMask > 0.5
    ? 0.0
    : clamp(anchorGlowForPosition(pos) * uAnchorHighlightOpacity, 0.0, 1.0);
  vec3 introColor = remapToMarkdownColor(color, aRandom.x);
  vec3 baseColor = mix(color, introColor, clamp(uIntroColorMix, 0.0, 1.0));
  baseColor = applySelectiveColor(baseColor) * exp2(uExposure);
  vCloudColor = mix(baseColor, vec3(1.0), clamp(vAnchorGlow, 0.0, 1.0));

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
#if POINTCLOUD_USE_CONVEYOR
  vec3 conveyorAxisWorld = normalize(mat3(modelMatrix) * uFlowConveyorAxis);
  worldPosition.xyz += conveyorAxisWorld * conveyorOffset;
#endif
  vec4 mv = viewMatrix * worldPosition;
  vWorldPosition = worldPosition.xyz;
#if POINTCLOUD_USE_FLUID
  if (simpleMask < 0.5 && uFluidInfluence > 0.0) {
    vec4 clipPos = projectionMatrix * mv;
    vec2 screenUV = clamp(clipPos.xy / max(clipPos.w, 0.0001) * 0.5 + 0.5, 0.0, 1.0);
    vec2 fluidVel = texture2D(uFluidVelocity, screenUV).xy;
    float depthAtten = 1.0 / (1.0 + max(-mv.z, 0.0) * 0.3);
    mv.xy += fluidVel * uFluidInfluence * 0.02 * depthAtten * anchorMotionMask;
  }
#endif
  float dist = length(mv.xyz);
  vCameraFade = uCamFadeEnabled > 0.5
    ? 1.0 - smoothstep(uCamFadeNear, max(uCamFadeFar, uCamFadeNear + 0.0001), dist)
    : 1.0;
  float baseSize = mix(0.6, 1.6, pow(aRandom.z, 4.0));
  float splatSize = mix(0.65, 1.35, vSplatSize);
  baseSize *= mix(1.0, splatSize, 0.3);
  float distSizeT = smoothstep(uDistanceSizeNear, uDistanceSizeFar, dist);
  float distSize = mix(1.0, uDistanceSizeMax, distSizeT);
  baseSize *= mix(1.0, distSize, uDistanceSizeInfluence);
  baseSize *= flowSize;
  baseSize *= conveyorLife;
  float opaqueSizeScale = mix(max(uOpacity, 0.0), 1.0, step(0.5, uTransparentPoints));
  float ps =
    uPointSize *
    max(uPointSizeScale, 0.001) *
    baseSize *
    opaqueSizeScale *
    max(uDensityFillPointSizeScale, 0.001) *
    uDPR *
    (120.0 / max(dist, 0.1));
  // ps is in render-target px, which shrink with renderScale; the frag's
  // min-size cull is an on-screen threshold, so normalize back to on-screen px
  // (÷ uRenderScale) — otherwise the cull tightens as the scale drops and faint
  // transparent points pop out while the scale animates. /1 at full scale.
  vProjectedPointSize = ps / uRenderScale;
  gl_PointSize = clamp(ps, 0.0, uMaxPointSize * uRenderScale);
  gl_Position = projectionMatrix * mv;
}
`,jo=`precision highp float;

uniform float uTime;
uniform float uOpacity;
uniform float uLoadFade;
uniform float uDensityFillOpacityScale;
uniform float uTransparentPoints;
uniform float uCausticsEnabled;
uniform float uCausticsStrength;
uniform float uCausticsScale;
uniform float uCausticsPower;
uniform float uCausticsSparkle;
uniform vec3 uCausticsAxisScale;
uniform vec3 uCausticsSpeed;
uniform vec3 uCausticsColor;

varying vec3 vCloudColor;
varying vec3 vWorldPosition;
varying float vAnchorGlow;
varying float vProjectedPointSize;
varying float vCameraFade;
varying float vSparkleSeed;

const float MIN_PROJECTED_POINT_SIZE = 0.55;

#if POINTCLOUD_USE_CAUSTICS
float dotNoise(vec3 p) {
  const float PHI = 1.618033988;
  const mat3 GOLD = mat3(
    -0.571464913, 0.814921382, 0.096597072,
    -0.278044873, -0.303026659, 0.911518454,
    0.772087367, 0.494042493, 0.399753815
  );
  return dot(cos(GOLD * p), sin(PHI * p * GOLD));
}

float causticsPattern(vec3 worldPos) {
  float scale = max(uCausticsScale, 0.0001);
  vec3 p = worldPos * scale * max(uCausticsAxisScale, vec3(0.0001));
  vec3 drift = uTime * uCausticsSpeed;
  float n1 = dotNoise(p + drift);
  float n2 = dotNoise(p * 1.73 + vec3(-drift.y, drift.z, -drift.x));
  float n3 = dotNoise(p * 3.11 + vec3(drift.z, -drift.x, drift.y));
  float ridges = max(
    0.0,
    1.0 - min(min(abs(n1), abs(n2)), abs(n3)) * 1.7
  );
  float crossings = max(0.0, 1.0 - abs(n1 + n2 * 0.55 - n3 * 0.35) * 1.15);
  return pow(
    clamp(ridges * 0.82 + crossings * 0.28, 0.0, 1.0),
    max(0.001, uCausticsPower)
  );
}

vec3 applyCaustics(vec3 color, float r2) {
  if (uCausticsEnabled > 0.5) {
    float pointMask = 0.55 + 0.45 * smoothstep(0.25, 0.0, r2);
    float caustics = causticsPattern(vWorldPosition) * uCausticsStrength;
    color += uCausticsColor * caustics * pointMask;

    if (uCausticsSparkle > 0.0001) {
      float sparse = smoothstep(0.985, 1.0, vSparkleSeed);
      float twinkle = 0.5 + 0.5 * sin(
        uTime * mix(4.0, 11.0, vSparkleSeed) + vSparkleSeed * 37.699112
      );
      float pulse = smoothstep(0.72, 1.0, twinkle);
      pulse *= pulse * pulse;
      float center = smoothstep(0.18, 0.0, r2);
      float sparkle = uCausticsSparkle * sparse * pulse * center;
      color += mix(uCausticsColor, vec3(1.0), 0.82) * sparkle;
    }
  }
  return color;
}
#endif

void main() {
  float minPointSize = mix(0.01, MIN_PROJECTED_POINT_SIZE, step(0.5, uTransparentPoints));
  if (vProjectedPointSize < minPointSize) discard;

  vec2 uv = gl_PointCoord - 0.5;
  float r2 = dot(uv, uv);
  if (r2 > 0.25) discard;

  vec3 color = vCloudColor;
#if POINTCLOUD_USE_CAUSTICS
  color = applyCaustics(color, r2);
#endif
  float alpha = mix(1.0, uOpacity, step(0.5, uTransparentPoints)) * uDensityFillOpacityScale * vCameraFade * uLoadFade;
  gl_FragColor = vec4(clamp(color, vec3(0.0), vec3(1.0)), alpha);
}
`,Wo="__POINTCLOUD_COLOR_CORRECTION_RANGE_COUNT__",Yo="__SDF_SHAPE_COUNT__",ht=8,O=4,qo=1048576,$o=2.5,Vo=.3,Ko=.995,Jo=1;function qt(e,t){var o,r,i,a,s,l;const n=t.gridStrength??1;return e.set(((o=t.gridMix)==null?void 0:o.x)??(((r=t.gridAxes)==null?void 0:r.x)===!1?0:n),((i=t.gridMix)==null?void 0:i.y)??(((a=t.gridAxes)==null?void 0:a.y)===!1?0:n),((s=t.gridMix)==null?void 0:s.z)??(((l=t.gridAxes)==null?void 0:l.z)===!1?0:n)),e.x=M.clamp(e.x,0,1),e.y=M.clamp(e.y,0,1),e.z=M.clamp(e.z,0,1),e}const pt=new dn(0,0,0,"XYZ");function $t(e,t){return pt.set((t==null?void 0:t.x)??0,(t==null?void 0:t.y)??0,(t==null?void 0:t.z)??0),e.set(0,0,1).applyEuler(pt).normalize()}function Vt(e){return Math.max(e??Vn,1)}function mt(e){return e?`${e.source512}:${e.source256}`:"default"}function Ne(e,t){return e===512&&(t==null?void 0:t.source512)!==void 0?t.source512:e===256&&(t==null?void 0:t.source256)!==void 0?t.source256:Le(e)}function Zo(e){const t=e??ke;return`${t.enabled}:${t.opacity}:${t.pointSizeScale}:${t.jitter}`}function Q(e){return e?1:0}function ze(e,t){if(!e)return{POINTCLOUD_USE_FLOW:1,POINTCLOUD_USE_FLOW_LAYOUT:1,POINTCLOUD_USE_CONVEYOR:1,POINTCLOUD_USE_FLUID:1,POINTCLOUD_USE_DENSITY_FILL:1,POINTCLOUD_USE_CAUSTICS:1};const n=e.flow,o=n.enabled&&n.strength>0,r=n.gridEnabled&&He(n.layout)>0&&n.gridStrength>0,i=n.conveyorEnabled&&Math.abs(n.conveyorSpeed)>1e-4,a=t.fluidEnabled!==!1&&e.fluid.enabled&&e.fluid.influence>0,s=e.densityFill??ke,l=s.enabled&&s.opacity>0,c=e.caustics,u=c===void 0||c.enabled&&(c.strength>0||Math.max(c.sparkle,0)>0);return{POINTCLOUD_USE_FLOW:Q(o),POINTCLOUD_USE_FLOW_LAYOUT:Q(r),POINTCLOUD_USE_CONVEYOR:Q(i),POINTCLOUD_USE_FLUID:Q(a),POINTCLOUD_USE_DENSITY_FILL:Q(l),POINTCLOUD_USE_CAUSTICS:Q(u)}}function yt(e){return`${e.POINTCLOUD_USE_FLOW}${e.POINTCLOUD_USE_FLOW_LAYOUT}${e.POINTCLOUD_USE_CONVEYOR}${e.POINTCLOUD_USE_FLUID}${e.POINTCLOUD_USE_DENSITY_FILL}${e.POINTCLOUD_USE_CAUSTICS}`}var re,he;const Be=class Be extends sn{constructor(n,o={}){const r=o.radius??$o,i=o.maxPoints??qo,a=o.samplingInfluence??Vo,s=o.pointcloud??null,l=o.textureSize??Math.ceil(Math.sqrt(n.count)),c=Xo(n,r,Math.min(l*l,i),a,s),u=Ne(l,s==null?void 0:s.particleScalars),d=er({...o,textureSize:l},s);super();b(this,"pointCount");b(this,"visiblePointCount");b(this,"cloudInfo",null);b(this,"sourcePositions");b(this,"anchorHighlightValues");b(this,"anchorHighlightAttribute");b(this,"points");b(this,"cloudMaterial");b(this,"densityFillPoints");b(this,"densityFillMaterial");b(this,"pointcloud");b(this,"transparentPoints",!0);b(this,"blendMode","normal");b(this,"loadFade",1);b(this,"textureSize");b(this,"pointSizeResolutionMultiplier");b(this,"lastParticleScalarsKey","");b(this,"lastDensityFillKey","");b(this,"lastShaderDefinesKey","");b(this,"fluidOptionEnabled");b(this,"lastColorCorrections",null);b(this,"layoutTargetAttribute");b(this,"layoutTargetSignature");Ae(this,re,1/0);Ae(this,he,1);const f=Qo(d);this.points=new at(c.geometry,d),this.densityFillPoints=new at(c.geometry,f),this.points.frustumCulled=!1,this.densityFillPoints.frustumCulled=!1,this.densityFillPoints.visible=!1,this.add(this.points,this.densityFillPoints),this.cloudMaterial=d,this.densityFillMaterial=f,this.pointcloud=s,this.pointCount=c.count,this.visiblePointCount=c.count,this.sourcePositions=c.positions,this.anchorHighlightValues=c.anchorHighlightValues,this.anchorHighlightAttribute=c.anchorHighlightAttribute,this.textureSize=l,this.pointSizeResolutionMultiplier=u,this.lastParticleScalarsKey=mt(s==null?void 0:s.particleScalars),this.fluidOptionEnabled=o.fluidEnabled!==!1,this.lastShaderDefinesKey=yt(ze(s,o)),this.layoutTargetAttribute=c.layoutTargetAttribute,this.layoutTargetSignature=c.layoutTargetSignature,this.frustumCulled=!1,this.applyDensityFill(s==null?void 0:s.densityFill),typeof o.renderOrder=="number"&&(this.renderOrder=o.renderOrder,this.points.renderOrder=o.renderOrder,this.densityFillPoints.renderOrder=o.renderOrder)}static async loadFromPointcloud(n,o,r={}){var d;const i=Dt(n.sources,o),a=(d=n.id)!=null&&d.startsWith("cloud-converted-")?!0:void 0,s=await bo(i.asset,{orientAsConverted:a}),l=i.textureSize,c={id:n.id??"",asset:i.asset,resolution:l,byteSize:s.byteSize},u=new Be(s,{...r,pointcloud:n,textureSize:l});return u.cloudInfo=c,{pointcloud:u,cloudInfo:c}}get material(){return this.cloudMaterial}get geometry(){return this.points.geometry}setTime(n){this.cloudMaterial.uniforms.uTime.value=n}setDpr(n){this.cloudMaterial.uniforms.uDPR.value=n}setRenderScale(n){this.cloudMaterial.uniforms.uRenderScale.value=n}setPointSize(n){this.cloudMaterial.uniforms.uPointSize.value=n*this.pointSizeResolutionMultiplier}setPointSizeScale(n){this.cloudMaterial.uniforms.uPointSizeScale.value=Math.max(n,.001)}setOpacity(n){this.cloudMaterial.uniforms.uOpacity.value=M.clamp(n,0,1),this.applyBlendMode()}setLoadFade(n){this.loadFade=M.clamp(n,0,1),this.cloudMaterial.uniforms.uLoadFade.value=this.loadFade,this.applyBlendMode()}setExposure(n){this.cloudMaterial.uniforms.uExposure.value=M.clamp(n,-4,4)}setTransparent(n){this.transparentPoints=n,this.cloudMaterial.uniforms.uTransparentPoints.value=n?1:0,this.applyBlendMode()}setBlendMode(n){this.blendMode=n,this.applyBlendMode()}applyBlendMode(){const n=this.transparentPoints?this.blendMode==="additive"?ln:this.blendMode==="multiply"?cn:this.blendMode==="subtractive"?un:this.cloudMaterial.uniforms.uOpacity.value>=Ko&&this.loadFade>=1?te:ue:this.loadFade<1?ue:te;Ie(this.cloudMaterial,n),Ie(this.densityFillMaterial,n===te?ue:n,!0)}setRandomize(n){this.cloudMaterial.uniforms.uRandomize.value.set(Math.max(n[0],0),Math.max(n[1],0),Math.max(n[2],0))}setSimplePoints(n){this.cloudMaterial.uniforms.uSimplePoints.value=n?1:0}setCameraFade(n){const o=Math.max(n.near,0);this.cloudMaterial.uniforms.uCamFadeEnabled.value=n.enabled?1:0,this.cloudMaterial.uniforms.uCamFadeNear.value=o,this.cloudMaterial.uniforms.uCamFadeFar.value=Math.max(n.far,o+1e-4),this.transparentPoints&&n.enabled&&this.cloudMaterial.blending===te&&(this.cloudMaterial.blending=ue,this.cloudMaterial.transparent=!0,this.cloudMaterial.depthWrite=!1,this.cloudMaterial.needsUpdate=!0)}setFluidVelocity(n){this.cloudMaterial.uniforms.uFluidVelocity.value=n}setFluidInfluence(n){this.cloudMaterial.uniforms.uFluidInfluence.value=Math.max(0,n)}setSdfShapes(n){const o=this.cloudMaterial.uniforms,r=M.clamp(n.length,0,O),i=o.uSdfShapeType.value,a=o.uSdfShapeStrength.value,s=o.uSdfShapeFalloff.value,l=o.uSdfShapeGradient.value,c=o.uSdfShapePolarity.value,u=o.uSdfShapeParams.value,d=o.uSdfShapeBounds.value,f=o.uSdfShapeInverseMatrices.value;o.uSdfShapeCount.value=r;for(let m=0;m<r;m++){const y=n[m];i[m]=tr(y.type),a[m]=Math.max(0,y.strength),s[m]=Math.max(0,y.falloff),l[m]=Math.max(.001,y.gradient),c[m]=y.invert?-1:1,u[m].copy(y.params),d[m].copy(y.bounds),f[m].copy(y.inverseMatrix)}}setIntroColorMix(n){this.cloudMaterial.uniforms.uIntroColorMix.value=M.clamp(n,0,1)}setTransitionUniforms(n){const o=this.cloudMaterial.uniforms;o.uTransitionYOffset.value=n.yOffset,o.uTransitionProgress.value=n.progress,o.uTransitionRestProgress.value=n.restProgress,o.uTransitionPow.value=n.pow}applyDynamicUniforms(n){var l,c,u,d,f;const o=this.cloudMaterial.uniforms,r=this.updatePointSizeResolutionMultiplier(n.particleScalars);o.uPointSize.value=n.pointSize*r,o.uMaxPointSize.value=Vt(n.maxPointSize)*r,o.uDistanceSizeInfluence.value=n.distanceSizeInfluence??.25,o.uDistanceSizeNear.value=n.distanceSizeNear??4,o.uDistanceSizeFar.value=n.distanceSizeFar??18,o.uDistanceSizeMax.value=n.distanceSizeMax??1.5;const i=n.colorCorrections;i!==this.lastColorCorrections&&(this.lastColorCorrections=i,o.uSelectiveAmount.value=Tt(i),Mt(o.uSelectiveAdj.value,i));const a=n.caustics;a&&(o.uCausticsEnabled.value=a.enabled?1:0,o.uCausticsStrength.value=a.strength,o.uCausticsScale.value=a.scale,o.uCausticsPower.value=a.power,o.uCausticsSparkle.value=Math.max(a.sparkle,0),o.uCausticsAxisScale.value.set(a.axisScale.x,a.axisScale.y,a.axisScale.z),o.uCausticsSpeed.value.set(a.speed.x,a.speed.y,a.speed.z),o.uCausticsColor.value.setRGB(a.color.r,a.color.g,a.color.b,fe));const s=n.flow;o.uFlowEnabled.value=s.enabled?1:0,o.uFlowType.value=Kt(s.type),o.uFlowStrength.value=s.strength,o.uFlowSpeed.value=s.speed,o.uFlowScale.value=s.scale,o.uFlowGridLayout.value=He(s.layout),o.uFlowGridEnabled.value=s.gridEnabled?1:0,o.uFlowGridSize.value=Math.max(Math.abs(s.gridSize),1e-4),o.uFlowGridStrength.value=s.gridStrength,qt(o.uFlowGridMix.value,s),o.uFlowGridRotation.value.set(((l=s.gridRotation)==null?void 0:l.x)??0,((c=s.gridRotation)==null?void 0:c.y)??0,((u=s.gridRotation)==null?void 0:u.z)??0),o.uFlowConveyorEnabled.value=s.conveyorEnabled?1:0,o.uFlowConveyorSpeed.value=s.conveyorSpeed,o.uFlowConveyorDepth.value=s.conveyorDepth,$t(o.uFlowConveyorAxis.value,s.conveyorRotation),o.uFlowConveyorDistanceNear.value=((d=s.conveyorDistance)==null?void 0:d.near)??s.distanceNear,o.uFlowConveyorDistanceFar.value=((f=s.conveyorDistance)==null?void 0:f.far)??s.distanceFar,o.uFlowRandomnessExponent.value=s.randomnessExponent,o.uFlowDistanceNear.value=s.distanceNear,o.uFlowDistanceFar.value=s.distanceFar,this.applyDensityFill(n.densityFill),this.syncShaderDefines(n)}syncShaderDefines(n){const o=ze(n,{fluidEnabled:this.fluidOptionEnabled}),r=yt(o);r!==this.lastShaderDefinesKey&&(this.lastShaderDefinesKey=r,Object.assign(this.cloudMaterial.defines,o),Object.assign(this.densityFillMaterial.defines,o,{POINTCLOUD_USE_DENSITY_FILL:1}),this.cloudMaterial.needsUpdate=!0,this.densityFillMaterial.needsUpdate=!0)}updatePointSizeResolutionMultiplier(n){const o=mt(n);return o!==this.lastParticleScalarsKey&&(this.lastParticleScalarsKey=o,this.pointSizeResolutionMultiplier=Ne(this.textureSize,n)),this.pointSizeResolutionMultiplier}applyDensityFill(n){const o=Zo(n);if(o===this.lastDensityFillKey)return;this.lastDensityFillKey=o;const r=n??ke,i=r.enabled;this.densityFillPoints.visible=i,this.densityFillMaterial.uniforms.uDensityFillJitter.value=i?Math.max(r.jitter,0):0,this.densityFillMaterial.uniforms.uDensityFillOpacityScale.value=i?M.clamp(r.opacity,0,1):0,this.densityFillMaterial.uniforms.uDensityFillPointSizeScale.value=i?Math.max(r.pointSizeScale,.001):1,this.applyBlendMode()}setActivePointCount(n){const o=Math.max(1,Math.min(this.effectiveMaxPoints,Math.round(n)));o!==this.visiblePointCount&&(this.points.geometry.setDrawRange(0,o),this.visiblePointCount=o)}get effectiveMaxPoints(){return Math.min(this.pointCount,ve(this,re))}setMaxActivePoints(n){const o=n===void 0?1/0:Math.max(1,Math.min(Yn,Math.round(n)));o!==ve(this,re)&&(De(this,re,o),this.visiblePointCount>this.effectiveMaxPoints&&this.setActivePointCount(this.effectiveMaxPoints))}applyBehindContentQuality(n,o,r){r!==void 0&&De(this,he,r),this.setDpr(ve(this,he)*n),this.setRenderScale(n),this.setActivePointCount(this.effectiveMaxPoints*o)}updateParticleLayoutTargets(n){const o=n??this.pointcloud;if(!o)return;const r=this.points.geometry.getAttribute("position");if(!r||!(r.array instanceof Float32Array))return;const i=Wt(o.flow,this.pointCount);if(i===this.layoutTargetSignature)return;const a=Yt(r.array,this.pointCount,o.flow);this.layoutTargetAttribute=new I(a,3).setUsage(Re),this.layoutTargetSignature=i,this.points.geometry.setAttribute("aLayoutTarget",this.layoutTargetAttribute)}markActive(){if(!this.cloudInfo)return;const{id:n,asset:o,resolution:r,byteSize:i}=this.cloudInfo;globalThis.__PRETEXT_ACTIVE_CLOUD__={id:n,asset:o,resolution:`${r}`,byteSize:i}}update(n,o){this.setTime(n),typeof o=="number"&&this.setDpr(o)}dispose(){this.points.geometry.dispose(),this.cloudMaterial.dispose(),this.densityFillMaterial.dispose()}};re=new WeakMap,he=new WeakMap;let Ue=Be;function Xo(e,t,n,o,r){var p;const i=_o(e,t),a=new Float32Array(n*3),s=new Float32Array(n*3),l=new Float32Array(n),c=new Float32Array(n*4),u=new Float32Array(n);for(let F=0;F<n;F++){const A=Do(e,o),g=F*3,S=A*3;a[g]=i[S],a[g+1]=i[S+1],a[g+2]=i[S+2],s[g]=e.colors[S]??1,s[g+1]=e.colors[S+1]??1,s[g+2]=e.colors[S+2]??1,l[F]=((p=e.sizes)==null?void 0:p[A])??.5;const T=F*4;c[T]=Math.random(),c[T+1]=Math.random(),c[T+2]=Math.random(),c[T+3]=Math.random()}const d=r?Yt(a,n,r.flow):a.slice(),f=new wt;f.setAttribute("position",new I(a,3)),f.setAttribute("color",new I(s,3)),f.setAttribute("aSize",new I(l,1)),f.setAttribute("aRandom",new I(c,4));const m=new I(d,3).setUsage(Re),y=r?Wt(r.flow,n):"";f.setAttribute("aLayoutTarget",m);const h=new I(u,1).setUsage(Re);return f.setAttribute("aAnchorHighlight",h),f.setDrawRange(0,n),{geometry:f,count:n,positions:a,anchorHighlightValues:u,anchorHighlightAttribute:h,layoutTargetAttribute:m,layoutTargetSignature:y}}function Ie(e,t,n=t!==te){e.blending===t&&e.transparent===n&&e.depthWrite===!n||(e.blending=t,e.transparent=n,e.depthWrite=!n,e.needsUpdate=!0)}function Qo(e){const t=new xt({defines:{...e.defines,POINTCLOUD_USE_DENSITY_FILL:1},vertexShader:e.vertexShader,fragmentShader:e.fragmentShader,vertexColors:e.vertexColors,transparent:e.transparent,alphaTest:e.alphaTest,depthWrite:e.depthWrite,blending:e.blending,uniforms:{...e.uniforms,uDensityFillJitter:{value:0},uDensityFillPass:{value:Jo},uDensityFillPointSizeScale:{value:1},uDensityFillOpacityScale:{value:0}}});return Ie(t,ue,!0),t}function er(e,t){var S,T,E,D,_,N;const n=e.externals??{},o=n.zeroVelocityTexture??Ft(),r=e.dpr??(typeof window<"u"?window.devicePixelRatio:1),i=n.glowPositions??Array.from({length:ht},()=>new x),a=n.glowPulseValues??new Float32Array(ht),s=new Float32Array(O),l=new Float32Array(O),c=new Float32Array(O),u=new Float32Array(O).fill(1),d=new Float32Array(O).fill(1),f=Array.from({length:O},()=>new be),m=Array.from({length:O},()=>new be),y=Array.from({length:O},()=>new de),h=(t==null?void 0:t.caustics)??{enabled:!0,strength:1.4,scale:.75,power:2.1,sparkle:0,axisScale:{x:1,y:1,z:2.4},speed:{x:.18,y:-.12,z:.08},color:{r:.95,g:.78,b:.42}},p=(t==null?void 0:t.flow)??{enabled:!1,type:"curl",layout:"off",strength:0,speed:0,scale:1,gridEnabled:!1,gridSize:.1,gridStrength:0,gridMix:{x:0,y:0,z:0},gridRotation:{x:0,y:0,z:0},conveyorEnabled:!1,conveyorSpeed:0,conveyorDepth:1,conveyorRotation:{x:0,y:0,z:0},conveyorDistance:{near:0,far:1},randomnessExponent:1,distanceNear:0,distanceFar:1},F=e.fluidEnabled!==!1&&((S=t==null?void 0:t.fluid)!=null&&S.enabled)?t.fluid.influence:0,A=Ne(e.textureSize,t==null?void 0:t.particleScalars),g=bn.map(()=>new x);return Mt(g,t==null?void 0:t.colorCorrections),new xt({defines:ze(t,e),vertexShader:Bo.replace(Wo,String(xn)).replaceAll(Yo,String(O)),fragmentShader:jo,vertexColors:!0,transparent:!1,alphaTest:0,depthWrite:!0,blending:te,uniforms:{uTime:{value:0},uPointSize:{value:((t==null?void 0:t.pointSize)??.018)*A},uDistanceSizeInfluence:{value:(t==null?void 0:t.distanceSizeInfluence)??.25},uDistanceSizeNear:{value:(t==null?void 0:t.distanceSizeNear)??4},uDistanceSizeFar:{value:(t==null?void 0:t.distanceSizeFar)??18},uDistanceSizeMax:{value:(t==null?void 0:t.distanceSizeMax)??1.5},uPointSizeScale:{value:e.pointSizeScale??1},uDensityFillJitter:{value:0},uDensityFillPass:{value:0},uDensityFillPointSizeScale:{value:1},uMaxPointSize:{value:Vt(t==null?void 0:t.maxPointSize)*A},uOpacity:{value:1},uLoadFade:{value:1},uExposure:{value:0},uDensityFillOpacityScale:{value:1},uTransparentPoints:{value:1},uSimplePoints:{value:0},uRandomize:{value:new x},uCamFadeEnabled:{value:0},uCamFadeNear:{value:0},uCamFadeFar:{value:1},uCausticsEnabled:{value:h.enabled?1:0},uCausticsStrength:{value:h.strength},uCausticsScale:{value:h.scale},uCausticsPower:{value:h.power},uCausticsSparkle:{value:Math.max(h.sparkle,0)},uCausticsAxisScale:{value:new x(h.axisScale.x,h.axisScale.y,h.axisScale.z)},uCausticsSpeed:{value:new x(h.speed.x,h.speed.y,h.speed.z)},uCausticsColor:{value:new bt().setRGB(h.color.r,h.color.g,h.color.b,fe)},uDPR:{value:r},uRenderScale:{value:1},uFlowEnabled:{value:p.enabled?1:0},uFlowType:{value:Kt(p.type)},uFlowStrength:{value:p.strength},uFlowSpeed:{value:p.speed},uFlowScale:{value:p.scale},uFlowGridLayout:{value:He(p.layout)},uFlowGridEnabled:{value:p.gridEnabled?1:0},uFlowGridSize:{value:p.gridSize},uFlowGridStrength:{value:p.gridStrength},uFlowGridMix:{value:qt(new x,p)},uFlowGridRotation:{value:new x(((T=p.gridRotation)==null?void 0:T.x)??0,((E=p.gridRotation)==null?void 0:E.y)??0,((D=p.gridRotation)==null?void 0:D.z)??0)},uFlowConveyorEnabled:{value:p.conveyorEnabled?1:0},uFlowConveyorSpeed:{value:p.conveyorSpeed},uFlowConveyorDepth:{value:p.conveyorDepth},uFlowConveyorAxis:{value:$t(new x,p.conveyorRotation)},uFlowConveyorDistanceNear:{value:((_=p.conveyorDistance)==null?void 0:_.near)??p.distanceNear},uFlowConveyorDistanceFar:{value:((N=p.conveyorDistance)==null?void 0:N.far)??p.distanceFar},uFlowRandomnessExponent:{value:p.randomnessExponent},uFlowDistanceNear:{value:p.distanceNear},uFlowDistanceFar:{value:p.distanceFar},uFluidVelocity:{value:o},uFluidInfluence:{value:F},uTransitionYOffset:{value:0},uTransitionProgress:{value:1},uTransitionRestProgress:{value:.5},uTransitionPow:{value:10},uIntroColorMix:{value:e.introColorMix??0},uSelectiveAmount:{value:Tt(t==null?void 0:t.colorCorrections)},uSelectiveAdj:{value:g},uAnchorHighlightOpacity:{value:0},uAnchorHighlightScale:{value:Zn},uAnchorGlowPositions:{value:i},uAnchorGlowRadius:{value:.13},uAnchorGlowStrength:{value:.22},uAnchorGlowPulse:{value:a},uAnchorGlowStrumStrength:{value:1.05},uSdfShapeCount:{value:0},uSdfShapeType:{value:s},uSdfShapeStrength:{value:l},uSdfShapeFalloff:{value:c},uSdfShapeGradient:{value:u},uSdfShapePolarity:{value:d},uSdfShapeParams:{value:f},uSdfShapeBounds:{value:m},uSdfShapeInverseMatrices:{value:y}}})}function tr(e){return e==="sphere"?1:e==="box"?2:e==="torus"?3:e==="cylinder"?4:e==="octahedron"?5:e==="dodecahedron"?6:0}function Kt(e){return e==="rise"?3:2}const nr=1080,or=1.2,rr=.05,St=12e3;function ar({isCriticalLoadingHandle:e,shouldLoad:t,renderTier:n}){return e&&(!t||n===null)}function vt(e){return!e}function ir({error:e,phase:t,fallbackAssetTelemetry:n,id:o,handle:r,renderTier:i,elapsedMs:a,loadingHandle:s,isCriticalLoadingHandle:l,visibilityTelemetry:c,browserAssetTelemetry:u}){const d=$n(e),f=e instanceof Error?e.message:String(e),m={phase:t,...n,...d,id:o,handle:r,renderTier:i,elapsedMs:a,loadingHandle:s,isCriticalLoadingHandle:l,...c,...u};return d.phase==="mdpc-unsupported-decompression-stream"||f===Ge?{kind:"component-telemetry",targetName:"pointcloud_mdpc_unsupported_deflate",parentName:"pointcloud_loader",metadata:{source:"PointCloud.load",...m,phase:d.phase??"mdpc-unsupported-decompression-stream",message:f}}:{kind:"report-error",metadata:m}}function _r(e){var Qe;const{id:t,pointcloud:n,timeScale:o=1,visibility:r,pointSizeScale:i,position:a,rotation:s,scale:l,opacity:c,exposure:u,transparent:d,blendMode:f,simplePoints:m,randomize:y,cameraFade:h,introColorMix:p,behindSpeed:F=1,reduceQualityBehind:A=!0,behindOffset:g=0,motion:S,fluidVelocityRef:T,onLoad:E,onError:D,loadingHandle:_,renderDpr:N,renderScale:$=1,parentObject:pe,children:je}=e,k=se(w=>w.gl),Ce=se(w=>w.scene),We=se(w=>w.camera),Te=se(w=>w.size),Ye=se(w=>w.viewport.dpr),qe=it(w=>w.trackers),$e=it(w=>w.pageViewToken),Ve=C.useRef({trackers:qe,pageViewToken:$e,size:Te});Ve.current={trackers:qe,pageViewToken:$e,size:Te};const V=C.useRef(null),Ke=C.useRef(pe);Ke.current=pe,C.useEffect(()=>{const w=V.current;w&&(pe??Ce).add(w)},[pe,V,Ce]);const Jt=(Qe=C.useContext(gn))==null?void 0:Qe.handle,K=wn(),Je=ct(w=>_?w.criticalHandles.includes(_):!1),G=fn(),ae=C.useRef(null),me=C.useRef(!1);C.useEffect(()=>{if(!ar({isCriticalLoadingHandle:Je,shouldLoad:K,renderTier:G})){ae.current=null,me.current=!1;return}if(ae.current??(ae.current=An()),!vt(me.current))return;const R=Dn(St,ae.current,v=>{if(!vt(me.current))return;me.current=!0;const z=K?"render-tier timeout":"sticky-mount timeout",J=new Error(`PointCloud startup ${z} after ${St}ms`);lt(J,"PointCloud.startup",{id:t,loadingHandle:_,reason:z,shouldLoad:K,renderTier:G,...v}),D==null||D(J)});return()=>R.clear()},[t,Je,_,D,G,K]),C.useEffect(()=>{if(!K||G===null)return;let w=!1,R=null,v=!1,z="load";const J=performance.now(),ie=()=>{R&&(R.removeFromParent(),R.dispose(),V.current===R&&(V.current=null),R=null)};return Ue.loadFromPointcloud({...n,id:t},G,{dpr:Ye,pointSizeScale:i,introColorMix:p}).then(async({pointcloud:P})=>{if(w){P.dispose();return}R=P,z="warmup";const j=new hn;j.add(P);try{await _n(async()=>{if(w)return;const W=k.getRenderTarget(),Z=k.autoClear,L=new pn(2,2);try{await k.compileAsync(j,We),k.setRenderTarget(L),k.autoClear=!0,k.render(j,We)}finally{k.autoClear=Z,k.setRenderTarget(W),L.dispose()}},{visibilityAwareWatchdog:!0})}finally{v=!0}if(w){ie();return}P.removeFromParent(),(Ke.current??Ce).add(P),V.current=P,P.markActive(),E==null||E(P)}).catch(P=>{if(v=!0,ie(),w)return;const j=ct.getState().criticalHandles;let W={};try{const Y=Dt(n.sources,G);W={assetUrl:Y.asset,textureSize:Y.textureSize,preferredResolution:Y.preferredResolution}}catch{}const Z=At(J),L=ir({error:P,phase:z,fallbackAssetTelemetry:W,id:t,handle:Jt,renderTier:G,elapsedMs:Z,loadingHandle:_,isCriticalLoadingHandle:_?j.includes(_):void 0,visibilityTelemetry:Pn(P),browserAssetTelemetry:qn()});if(L.kind==="component-telemetry"){const{trackers:Y,pageViewToken:Me,size:Fe}=Ve.current;mn({trackers:Y,pageViewToken:Me,enabled:!0,targetName:L.targetName,parentName:L.parentName,width:Fe.width,height:Fe.height,duration:Z,metadata:L.metadata})}else lt(P,"PointCloud.load",L.metadata);D==null||D(P)}),()=>{w=!0,v&&ie()}},[K,G,t,n.sources]);const Ze=C.useRef(0),ye=C.useRef(0),Xe=C.useRef(null);return Ct((w,R)=>{var et,tt;const v=V.current;if(!v)return;const z=((et=S==null?void 0:S.current)==null?void 0:et.transition)??0,J=typeof r=="number"&&r<=0||z<=-1||z>=1;Xe.current!==v&&(Xe.current=v,ye.current=0);const ie=typeof r=="number"&&r<=0||z>=1;ye.current=eo(ye.current,R,{durationSeconds:or,offscreen:ie,reducedMotion:st.getState().preferReducedMotion===!0});const P=Qn(ye.current);if(v.setLoadFade(P),typeof r=="number"&&(v.visible=r>0),a&&v.position.set(a[0],a[1],a[2]),s&&v.rotation.set(M.degToRad(s[0]),M.degToRad(s[1]),M.degToRad(s[2])),typeof l=="number"&&v.scale.setScalar(Math.max(l,.001)),typeof i=="number"&&v.setPointSizeScale(i),typeof c=="number"&&v.setOpacity(c),typeof u=="number"&&v.setExposure(u),f&&v.setBlendMode(f),typeof d=="boolean"&&v.setTransparent(d),typeof m=="boolean"&&v.setSimplePoints(m),y){const Se=rr*(1-P);Se===0?v.setRandomize(y):v.setRandomize([y[0]+Se,y[1]+Se,y[2]+Se])}h&&v.setCameraFade(h),typeof p=="number"&&v.setIntroColorMix(p),v.updateParticleLayoutTargets(n),v.applyDynamicUniforms(n);const j=Math.max(1,Te.height)/nr,W=((tt=S==null?void 0:S.current)==null?void 0:tt.screenOffset)??0,Z=Mn(W),L=Fn(W,g);if(v.setMaxActivePoints(n.maxPoints),v.applyBehindContentQuality(Cn(L,$,A),Tn(L,A),(N??Ye)*j),J)return;const Y=Math.min(R,1/30),Me=1-Z*(1-F),Zt=st.getState().preferReducedMotion?Xn:1;Ze.current+=Y*o*Me*Zt,v.setTime(Ze.current),v.setFluidVelocity((T==null?void 0:T.current)??Ft()),v.setFluidInfluence(n.fluid.enabled?n.fluid.influence*o:0)}),je?ee.jsx(ee.Fragment,{children:je}):null}const U=0,sr=new x(1,1,1);function Pr({pointCloudRef:e,pointCloudVersion:t,sdfs:n,showHelpers:o=!1,children:r}){const i=yn(h=>h.tier>=2),a=C.useRef(null),s=C.useRef(U),l=C.useRef([]),c=C.useRef({activeShapes:[],cloudInverseMatrix:new de,sdfMatrix:new de,unscaledSdfMatrix:new de,position:new x,quaternion:new Sn,scale:new x(1,1,1),shapes:Array.from({length:O},()=>({type:"box",inverseMatrix:new de,params:new be,bounds:new be,strength:0,falloff:0,gradient:1}))}),[u,d]=C.useState(null);C.useEffect(()=>{d(e.current)},[e,t]);const f=C.useCallback(h=>(l.current.push(h),()=>{l.current=l.current.filter(p=>p!==h)}),[]),m=C.useMemo(()=>({registerSdf:f}),[f]);Ct(()=>{const h=e.current,p=a.current;if(p!==h&&(p==null||p.setSdfShapes([]),a.current=h,s.current=U),!h)return;if(!i){s.current>U&&(h.setSdfShapes([]),s.current=U);return}const F=l.current;if(!F.some(({objectRef:T,sdfRef:E})=>T.current&&E.current.enabled!==!1)){s.current>U&&(h.setSdfShapes([]),s.current=U);return}const g=c.current,S=g.activeShapes;S.length=0,h.updateWorldMatrix(!0,!1),g.cloudInverseMatrix.copy(h.matrixWorld).invert();for(const{objectRef:T,sdfRef:E}of F){if(S.length>=O)break;const D=T.current,_=E.current;if(!D||_.enabled===!1)continue;D.updateWorldMatrix(!0,!1),g.sdfMatrix.multiplyMatrices(g.cloudInverseMatrix,D.matrixWorld);const N=g.shapes[S.length];lr(_,N,g.sdfMatrix,g)&&S.push(N)}S.length===U&&s.current===U||(h.setSdfShapes(S),s.current=S.length)}),C.useEffect(()=>()=>{var h;(h=a.current)==null||h.setSdfShapes([]),s.current=U},[]);const y=u&&(n!=null&&n.length)?vn(ee.jsx(ee.Fragment,{children:n.map((h,p)=>ee.jsx(En,{sdf:h,showHelper:o},h.id??p))}),u):null;return ee.jsxs(On.Provider,{value:i?m:null,children:[y,r]})}function lr(e,t,n,o){const r=e.strength??Rn,i=e.falloff??Ln,a=e.gradient??Nn;return n.decompose(o.position,o.quaternion,o.scale),!gt(o.position)||!cr(o.quaternion)||!gt(o.scale)?!1:(t.type=ur(e.type),e.type==="cube"?(t.params.set(ne*Oe(o.scale.x),ne*Oe(o.scale.y),ne*Oe(o.scale.z),0),hr(o.position,t.params,i,t.bounds),o.unscaledSdfMatrix.compose(o.position,o.quaternion,sr),t.inverseMatrix.copy(o.unscaledSdfMatrix).invert()):(dr(e.type,t.params),fr(e.type,o.position,o.scale,i,t.bounds),t.inverseMatrix.copy(n).invert()),t.strength=r,t.falloff=i,t.gradient=a,t.invert=e.invert??!1,!0)}function gt(e){return Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.z)}function cr(e){return Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.z)&&Number.isFinite(e.w)}function Oe(e){return Math.max(zn,Math.abs(e))}function ur(e){return e==="cube"?"box":e==="dodeca"?"dodecahedron":e}function dr(e,t){if(e==="torus"){t.set(Un,In,0,0);return}if(e==="cylinder"){t.set(kn,Gn,0,0);return}if(e==="octahedron"){t.set(Hn,0,0,0);return}if(e==="dodeca"){t.set(Bn,0,0,0);return}if(e==="sphere"){t.set(jn,0,0,0);return}t.set(ne,ne,ne,0)}function fr(e,t,n,o,r){const i=Math.max(n.x,n.y,n.z),a=(Wn(e)+Math.max(0,o))*i;r.set(t.x,t.y,t.z,a)}function hr(e,t,n,o){const r=Math.hypot(t.x,t.y,t.z)+Math.max(0,n);o.set(e.x,e.y,e.z,r)}export{Vn as D,_r as P,Pr as a,Dr as b,eo as c,co as d,Qn as e,H as f,$n as g,qn as h,Ue as i,At as r};
//# sourceMappingURL=SdfRegistry-Dt1Gv0Vq.js.map
