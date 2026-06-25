var F=s=>{throw TypeError(s)};var L=(s,e,t)=>e.has(s)||F("Cannot "+t);var l=(s,e,t)=>(L(s,e,"read from private field"),t?t.call(s):e.get(s)),_=(s,e,t)=>e.has(s)?F("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(s):e.set(s,t),S=(s,e,t,i)=>(L(s,e,"write to private field"),i?i.call(s,t):e.set(s,t),t);import{W as T,R as W,L as z,a as k,M as N,O as G,l as K,bn as Q,e as m,bO as C,V as f,a6 as w,N as H,bP as Y,C as U,v as x,Y as j,b2 as q}from"./TierResolver-nYYMFDvd.js";import{s as X}from"./sharedZeroTexture-BGkXyl3y.js";function V(s=!1){const e=new T(1,1,{minFilter:z,magFilter:z,format:W,depthBuffer:s,stencilBuffer:!1});return e.texture.generateMipmaps=!1,e}const Z=6,J=4,R=new WeakMap;function I(s,e){let t=R.get(s);t||(t=new Map,R.set(s,t));let i=t.get(e);return i||(i=[],t.set(e,i)),i}function $(s){if(s==="main"){const t=V(!0);return t.depthTexture=new k(1,1),t}const e=V(s==="dry"||s==="dryMsaa"||s==="dryDepth"||s==="sceneCapture");return s==="dryMsaa"&&(e.samples=J),e}function ee(s,e,t){const i=Math.max(1,Math.round(e)),a=Math.max(1,Math.round(t));s.setSize(i,a);const r=s.depthTexture;r&&(r.image.width!==i||r.image.height!==a)&&(r.image.width=i,r.image.height=a,r.needsUpdate=!0)}function pe(s,e,t,i){const a=I(s,e).pop()??$(e);return ee(a,t,i),a}function ge(s,e,t){(e==="dry"||e==="dryMsaa"||e==="dryDepth")&&(t.depthTexture=null);const i=I(s,e);if(i.length>=Z){t.dispose();return}i.push(t)}function ve(s){const e=R.get(s);if(e){for(const t of e.values())for(const i of t)i.dispose();R.delete(s)}}const b={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class M{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const te=new G(-1,1,1,-1,0,1);class se extends K{constructor(){super(),this.setAttribute("position",new Q([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Q([0,2,0,0,2,0],2))}}const ie=new se;class E{constructor(e){this._mesh=new N(ie,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,te)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class re extends M{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof m?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=C.clone(e.uniforms),this.material=new m({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new E(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class O extends M{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){const a=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,u;this.inverse?(o=0,u=1):(o=1,u=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),r.buffers.stencil.setFunc(a.ALWAYS,o,4294967295),r.buffers.stencil.setClear(u),r.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(a.EQUAL,1,4294967295),r.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),r.buffers.stencil.setLocked(!0)}}class ae extends M{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class oe{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const i=e.getSize(new f);this._width=i.width,this._height=i.height,t=new T(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:w}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new re(b),this.copyPass.material.blending=H,this.timer=new Y}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let i=!1;for(let a=0,r=this.passes.length;a<r;a++){const o=this.passes[a];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),o.needsSwap){if(i){const u=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(u.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(u.EQUAL,1,4294967295)}this.swapBuffers()}O!==void 0&&(o instanceof O?i=!0:o instanceof ae&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new f);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const i=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(i,a),this.renderTarget2.setSize(i,a);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,a)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class le extends M{constructor(e,t=1){super();const i=b;this.map=e,this.opacity=t,this.needsSwap=!1,this.uniforms=C.clone(i.uniforms),this.material=new m({uniforms:this.uniforms,vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,depthTest:!1,depthWrite:!1,premultipliedAlpha:!0}),this._fsQuad=new E(null)}render(e,t,i){const a=e.autoClear;e.autoClear=!1,this._fsQuad.material=this.material,this.uniforms.opacity.value=this.opacity,this.uniforms.tDiffuse.value=this.map,this.material.transparent=this.opacity<1,e.setRenderTarget(this.renderToScreen?null:i),this.clear&&e.clear(),this._fsQuad.render(e),e.autoClear=a}dispose(){this.material.dispose(),this._fsQuad.dispose()}}const ne={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new U(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class g extends M{constructor(e,t=1,i,a){super(),this.strength=t,this.radius=i,this.threshold=a,this.resolution=e!==void 0?new f(e.x,e.y):new f(256,256),this.clearColor=new U(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new T(r,o,{type:w}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const v=new T(r,o,{type:w});v.texture.name="UnrealBloomPass.h"+c,v.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(v);const D=new T(r,o,{type:w});D.texture.name="UnrealBloomPass.v"+c,D.texture.generateMipmaps=!1,this.renderTargetsVertical.push(D),r=Math.round(r/2),o=Math.round(o/2)}const u=ne;this.highPassUniforms=C.clone(u.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new m({uniforms:this.highPassUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader}),this.separableBlurMaterials=[];const n=[6,10,14,18,22];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(n[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new f(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const B=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=B,this.bloomTintColors=[new x(1,1,1),new x(1,1,1),new x(1,1,1),new x(1,1,1),new x(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=C.clone(b.uniforms),this.blendMaterial=new m({uniforms:this.copyUniforms,vertexShader:b.vertexShader,fragmentShader:b.fragmentShader,premultipliedAlpha:!0,blending:j,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new U,this._oldClearAlpha=1,this._basic=new q,this._fsQuad=new E(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),a=Math.round(t/2);this.renderTargetBright.setSize(i,a);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,a),this.renderTargetsVertical[r].setSize(i,a),this.separableBlurMaterials[r].uniforms.invSize.value=new f(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2)}render(e,t,i,a,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let u=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=u.texture,this.separableBlurMaterials[n].uniforms.direction.value=g.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=g.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this._fsQuad.render(e),u=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=o}_getSeparableBlurMaterial(e){const t=[],i=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(i*i))/i);return new m({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new f(.5,.5)},direction:{value:new f(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new m({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}g.BlurDirectionX=new f(1,0);g.BlurDirectionY=new f(0,1);const P=.5,xe=.001,Te=.1,be=.08,Me=8e-4,_e=.012,Se=60,we=.064;var h,p,d;class ue{constructor(e){_(this,h);_(this,p);_(this,d);S(this,h,new oe(e)),l(this,h).renderToScreen=!1,S(this,p,new le(X())),S(this,d,new g(new f(1,1),0,0,0)),l(this,h).addPass(l(this,p)),l(this,h).addPass(l(this,d)),l(this,h).setSize(1,1)}setSize(e,t){l(this,h).setPixelRatio(P),l(this,h).setSize(e,t),l(this,d).resolution.set(e*P,t*P)}render(e,t,i,a,r){return l(this,p).map=t,l(this,d).strength=i,l(this,d).radius=a,l(this,d).threshold=r,e.setRenderTarget(null),l(this,h).render(),l(this,h).readBuffer.texture}dispose(){l(this,d).dispose(),l(this,p).material.dispose(),l(this,h).dispose()}}h=new WeakMap,p=new WeakMap,d=new WeakMap;const A=new WeakMap;function Ce(s){let e=A.get(s);return e||(e=new ue(s),A.set(s,e)),e}function Re(s){const e=A.get(s);e&&(e.dispose(),A.delete(s))}const y=new WeakMap;function he(s){let e=y.get(s);return e||(e=new E(new m({uniforms:{tDiffuse:{value:null},uScale:{value:new f(1,1)},uMaxUv:{value:new f(1,1)}},vertexShader:`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          uniform sampler2D tDiffuse;
          uniform vec2 uScale;
          uniform vec2 uMaxUv;
          varying vec2 vUv;
          void main() {
            gl_FragColor = texture2D(tDiffuse, min(vUv * uScale, uMaxUv));
          }
        `,blending:H,depthTest:!1,depthWrite:!1})),y.set(s,e)),e}function fe(s,e,t){const i=Math.max(1,Math.round(s*t)),a=Math.max(1,Math.round(e*t)),r=i/s,o=a/e;return{scaleX:r,scaleY:o,maxU:r-.5/s,maxV:o-.5/e}}function Ae(s,e,t,i){const a=he(s),r=a.material;r.uniforms.tDiffuse.value=e.texture;const{scaleX:o,scaleY:u,maxU:n,maxV:B}=fe(e.width,e.height,i);r.uniforms.uScale.value.set(o,u),r.uniforms.uMaxUv.value.set(n,B);const c=s.getRenderTarget(),v=s.autoClear;s.autoClear=!1,s.setRenderTarget(t),a.render(s),s.setRenderTarget(c),s.autoClear=v}function ye(s){const e=y.get(s);e&&(e.dispose(),y.delete(s))}export{Me as A,we as M,Re as a,ye as b,pe as c,ve as d,_e as e,xe as f,Ce as g,Te as h,Se as i,be as j,Ae as k,ge as r};
//# sourceMappingURL=renderScaleResolve-BAuFPf4b.js.map
