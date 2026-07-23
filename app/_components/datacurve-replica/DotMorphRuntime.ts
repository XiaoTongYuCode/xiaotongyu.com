import * as THREE from "three";
import { defaultScenes } from "./sceneConfig";
import { fragmentShader, vertexShader } from "./shaders";
import { clamp, mixNumber, resolveTimeline } from "./timeline";
import type { DirectionName, Scene } from "./types";

export type ClipSource = Scene & {
  flipY?: boolean;
  tint?: string;
};

type TextureRecord = {
  aspect: number;
  duration: number;
  isFirst: boolean;
  isReady: boolean;
  lastSeekAt: number;
  lastSeekTime: number;
  lastTextureTime: number;
  loadFailed: boolean;
  needsTextureUpdate: boolean;
  readyPromise: Promise<{ ok: boolean; reason: string }>;
  seekInFlight: boolean;
  source: ClipSource;
  texture: THREE.VideoTexture;
  video: HTMLVideoElement;
};

export type AvoidRect = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  strength: number;
};

export type FinalTarget = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  progress: number;
};

type TimelineSnapshot = {
  a: number;
  b: number;
  sceneIndex: number;
  local: number;
  morph: number;
  phaseType: "play" | "transition";
  progressA: number;
  progressB: number;
};


const emptyData = new Uint8Array([0, 0, 0, 255]);

function directionVector(direction: DirectionName | undefined): [number, number] {
  switch (direction) {
    case "left":
      return [-1, 0];
    case "right":
      return [1, 0];
    case "top":
      return [0, 1];
    case "bottom":
      return [0, -1];
    default:
      return [0, 0];
  }
}

function makeVideo(source: ClipSource) {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.loop = false;
  video.crossOrigin = "anonymous";
  video.disablePictureInPicture = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.src = source.clipSrc;
  return video;
}

function waitForVideo(video: HTMLVideoElement, timeoutMs = 4500): Promise<{ ok: boolean; reason: string }> {
  if (video.readyState >= 1 && video.videoWidth > 0 && video.videoHeight > 0) {
    return Promise.resolve({ ok: true, reason: "ready" });
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean, reason: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      video.removeEventListener("loadedmetadata", ready);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("error", error);
      resolve({ ok, reason });
    };
    const ready = () => {
      if (video.readyState >= 1 && video.videoWidth > 0 && video.videoHeight > 0) finish(true, "ready");
    };
    const error = () => finish(false, "error");
    const timer = window.setTimeout(() => finish(false, "timeout"), timeoutMs);
    video.addEventListener("loadedmetadata", ready);
    video.addEventListener("loadeddata", ready);
    video.addEventListener("error", error);
  });
}

function getRendererContext(canvas: HTMLCanvasElement) {
  const attributes: WebGLContextAttributes = {
    alpha: true,
    antialias: false,
    depth: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: window.innerWidth < 720 ? "default" : "high-performance",
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
  };
  const context = canvas.getContext("webgl2", attributes) ?? canvas.getContext("webgl", attributes);
  if (!context) throw new Error("WebGL context unavailable");

  const originalContextAttributes = context.getContextAttributes.bind(context);
  context.getContextAttributes = (() => originalContextAttributes() ?? attributes) as typeof context.getContextAttributes;

  const originalPrecision = context.getShaderPrecisionFormat.bind(context);
  context.getShaderPrecisionFormat = ((shaderType: number, precisionType: number) => {
    const precision = originalPrecision(shaderType, precisionType);
    if (precision) return precision;
    return {
      precision: precisionType === context.LOW_FLOAT || precisionType === context.LOW_INT ? 8 : 23,
      rangeMax: 127,
      rangeMin: 127,
    } as WebGLShaderPrecisionFormat;
  }) as typeof context.getShaderPrecisionFormat;

  return context;
}

export class DotMorphRuntime {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly emptyTexture: THREE.DataTexture;
  private readonly material: THREE.ShaderMaterial;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly stage: HTMLDivElement;
  private currentTimeline: TimelineSnapshot | null = null;
  private densityScale = 1.15;
  private disposed = false;
  private finalProgress = 0;
  private finalRecords: TextureRecord[] = [];
  private finalTargets: FinalTarget[] = [];
  private geometry: THREE.BufferGeometry | null = null;
  private introT = 0;
  private lastNow = 0;
  private lastParticleTarget = 0;
  private mouseX = 0;
  private mouseY = 0;
  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null;
  private records: TextureRecord[] = [];
  private reducedMotion = false;
  private scroll = 0;
  private sourceAspect = 16 / 9;
  private sources: ClipSource[] = [];
  private transitionSpeed = 0.2;
  private viewportHeight = 1;
  private viewportWidth = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = getRendererContext(canvas);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context: context as WebGLRenderingContext,
      alpha: true,
      antialias: false,
      powerPreference: window.innerWidth < 720 ? "default" : "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 10);
    this.camera.position.set(0, 0, 2.55);
    this.emptyTexture = new THREE.DataTexture(emptyData, 1, 1);
    this.emptyTexture.needsUpdate = true;
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      uniforms: {
        uTextureA: { value: this.emptyTexture },
        uTextureB: { value: this.emptyTexture },
        uFinalTexture0: { value: this.emptyTexture },
        uFinalTexture1: { value: this.emptyTexture },
        uFinalTexture2: { value: this.emptyTexture },
        uTexelA: { value: new THREE.Vector2(1 / 640, 1 / 360) },
        uTexelB: { value: new THREE.Vector2(1 / 640, 1 / 360) },
        uFlipA: { value: 0 },
        uFlipB: { value: 0 },
        uFinalFlip0: { value: 0 },
        uFinalFlip1: { value: 0 },
        uFinalFlip2: { value: 0 },
        uFinalRect0: { value: new THREE.Vector4(0, 0, 0, 0) },
        uFinalRect1: { value: new THREE.Vector4(0, 0, 0, 0) },
        uFinalRect2: { value: new THREE.Vector4(0, 0, 0, 0) },
        uFinalT: { value: 0 },
        uPlaneScale: { value: new THREE.Vector2(1, 1) },
        uViewportScale: { value: new THREE.Vector2(1, 1) },
        uFieldFade: { value: 0 },
        uDepthStrength: { value: 0.96 },
        uIntroT: { value: 0 },
        uMorph: { value: 0 },
        uAvoidFeather: { value: 0.095 },
        uAvoidStrength0: { value: 0 },
        uAvoidStrength1: { value: 0 },
        uAvoidStrength2: { value: 0 },
        uAvoidStrength3: { value: 0 },
        uAvoidRect0: { value: new THREE.Vector4(0, 0, 0, 0) },
        uAvoidRect1: { value: new THREE.Vector4(0, 0, 0, 0) },
        uAvoidRect2: { value: new THREE.Vector4(0, 0, 0, 0) },
        uAvoidRect3: { value: new THREE.Vector4(0, 0, 0, 0) },
        uPixelRatio: { value: 1 },
        uPointScale: { value: 1.52 },
        uTime: { value: 0 },
        uTransitionSeed: { value: 0 },
        uLowQuality: { value: 0 },
        uReducedMotion: { value: 0 },
        uExitAxis: { value: new THREE.Vector2(0, 0) },
        uEnterSide: { value: new THREE.Vector2(0, 0) },
        uTintA: { value: new THREE.Color("#000000") },
        uTintB: { value: new THREE.Color("#000000") },
        uDepthGammaA: { value: 1 },
        uDepthGammaB: { value: 1 },
        uFinalTint0: { value: new THREE.Color("#000000") },
        uFinalTint1: { value: new THREE.Color("#000000") },
        uFinalTint2: { value: new THREE.Color("#000000") },
      },
    });
    this.stage = document.createElement("div");
    this.stage.setAttribute("aria-hidden", "true");
    Object.assign(this.stage.style, {
      height: "1px",
      left: "-9999px",
      overflow: "hidden",
      pointerEvents: "none",
      position: "fixed",
      top: "-9999px",
      width: "1px",
    });
    document.body.appendChild(this.stage);
  }

  resetClock() {
    this.lastNow = 0;
  }

  setSources(sources: ClipSource[]) {
    this.destroyRecords();
    this.sources = sources.length ? sources : defaultScenes;
    this.records = this.sources.map((source, index) => this.createRecord(source, index));
    this.lastParticleTarget = 0;
  }

  setFinalSources(sources: ClipSource[]) {
    this.destroyFinalRecords();
    this.finalRecords = sources.slice(0, 3).map((source, index) => this.createRecord(source, index + 100));
  }

  setDensityScale(value: number) {
    const next = clamp(value, 0.5, 3);
    if (Math.abs(next - this.densityScale) > 0.001) {
      this.densityScale = next;
      this.lastParticleTarget = 0;
    }
  }

  setTransitionSpeed(value: number) {
    this.transitionSpeed = clamp(value, 0.015, 3);
  }

  setIntroT(value: number) {
    this.introT = clamp(value);
  }

  setReducedMotion(value: boolean) {
    this.reducedMotion = value;
    this.material.uniforms.uReducedMotion.value = value ? 1 : 0;
  }

  setScroll(value: number) {
    this.scroll = clamp(value);
  }

  setMousePosition(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }

  setAvoidRects(rects: AvoidRect[]) {
    for (let index = 0; index < 4; index += 1) {
      const rect = rects[index];
      const rectUniform = this.material.uniforms[`uAvoidRect${index}` as keyof typeof this.material.uniforms]?.value as THREE.Vector4 | undefined;
      const strengthUniform = this.material.uniforms[`uAvoidStrength${index}` as keyof typeof this.material.uniforms];
      if (!rectUniform || !strengthUniform) continue;
      if (rect) {
        rectUniform.set(rect.x0, rect.y0, rect.x1, rect.y1);
        strengthUniform.value = clamp(rect.strength);
      } else {
        rectUniform.set(0, 0, 0, 0);
        strengthUniform.value = 0;
      }
    }
  }

  setFinalProgress(value: number) {
    this.finalProgress = clamp(value);
    this.material.uniforms.uFinalT.value = this.finalProgress;
  }

  setFinalTargets(targets: FinalTarget[]) {
    this.finalTargets = targets.slice(0, 3);
  }

  async firstReady() {
    return this.records[0] ? await this.records[0].readyPromise : { ok: false, reason: "no-sources" };
  }

  loadStatus() {
    return {
      failed: this.records.filter((record) => record.loadFailed).length,
      ready: this.records.filter((record) => record.isReady).length,
      total: this.records.length,
    };
  }

  async resize() {
    if (this.disposed) return;
    if (this.records[0]) await this.records[0].readyPromise;
    const firstReady = this.records.find((record) => record.video.videoWidth && record.video.videoHeight);
    if (firstReady) this.sourceAspect = firstReady.video.videoWidth / firstReady.video.videoHeight;
    const cssWidth = this.canvas.clientWidth || window.innerWidth || 1;
    const cssHeight = this.canvas.clientHeight || window.innerHeight || 1;
    this.viewportWidth = cssWidth;
    this.viewportHeight = cssHeight;
    const pixelRatio = Math.min(cssWidth < 720 ? 1 : 1.35, window.devicePixelRatio || 1);
    const target = this.particleTarget(this.cappedCssWidth(cssWidth));
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(cssWidth, cssHeight, false);
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPixelRatio.value = pixelRatio;
    this.material.uniforms.uPointScale.value = cssWidth < 720 ? 1.66 : 1.9;
    this.material.uniforms.uAvoidFeather.value = cssWidth < 720 ? 0.15 : 0.095;
    this.material.uniforms.uLowQuality.value = cssWidth < 1024 ? 1 : 0;
    this.material.uniforms.uFinalT.value = this.finalProgress;
    if (!this.geometry || Math.abs(this.lastParticleTarget - target) > target * 0.2) {
      this.buildGeometry(target);
    }
    this.updatePlaneScale(cssWidth, cssHeight, this.sourceAspect);
    void this.primeVideos();
  }

  render(now = performance.now()): TimelineSnapshot {
    if (this.disposed) {
      return { a: 0, b: 0, sceneIndex: 0, local: 0, morph: 0, phaseType: "play", progressA: 0, progressB: 0 };
    }
    if (!this.geometry) {
      this.buildGeometry(this.particleTarget(this.cappedCssWidth(window.innerWidth || 1024)));
      this.updatePlaneScale(this.canvas.clientWidth || window.innerWidth || 1, this.canvas.clientHeight || window.innerHeight || 1, this.sourceAspect);
    }
    const deltaSeconds = this.lastNow ? Math.min(0.05, (now - this.lastNow) / 1000) : 1 / 60;
    this.lastNow = now;
    this.material.uniforms.uTime.value += deltaSeconds;
    this.material.uniforms.uIntroT.value = this.introT;
    const timeline = resolveTimeline(this.sources, this.scroll, this.records, this.transitionSpeed);
    this.currentTimeline = timeline;
    const currentRecord = this.records[timeline.a];
    const nextRecord = this.records[timeline.b] || currentRecord;
    const currentAspect = currentRecord?.aspect || this.sourceAspect;
    const nextAspect = nextRecord?.aspect || currentAspect;
    this.updatePlaneScale(this.viewportWidth || this.canvas.clientWidth || window.innerWidth || 1, this.viewportHeight || this.canvas.clientHeight || window.innerHeight || 1, mixNumber(currentAspect, nextAspect, timeline.morph));

    const sameRecord = currentRecord && currentRecord === nextRecord;
    const currentSeek = currentRecord ? this.seekRecord(currentRecord, timeline.progressA) : false;
    const nextSeek = nextRecord && !sameRecord ? this.seekRecord(nextRecord, timeline.progressB) : false;
    const uniforms = this.material.uniforms;
    uniforms.uTextureA.value = currentRecord?.texture || this.emptyTexture;
    uniforms.uTextureB.value = nextRecord?.texture || currentRecord?.texture || this.emptyTexture;
    uniforms.uTexelA.value.set(1 / Math.max(1, currentRecord?.video.videoWidth || 640), 1 / Math.max(1, currentRecord?.video.videoHeight || 360));
    uniforms.uTexelB.value.set(1 / Math.max(1, nextRecord?.video.videoWidth || currentRecord?.video.videoWidth || 640), 1 / Math.max(1, nextRecord?.video.videoHeight || currentRecord?.video.videoHeight || 360));
    uniforms.uFlipA.value = currentRecord?.source.flipY ? 1 : 0;
    uniforms.uFlipB.value = nextRecord?.source.flipY ? 1 : 0;
    uniforms.uMorph.value = timeline.morph;
    uniforms.uTransitionSeed.value = (timeline.a + 1) * 17.17 + (timeline.b + 1) * 5.31;
    const [exitX, exitY] = directionVector(currentRecord?.source.exitDirection);
    const [enterX, enterY] = directionVector(nextRecord?.source.enterDirection);
    uniforms.uExitAxis.value.set(exitX, exitY);
    uniforms.uEnterSide.value.set(enterX, enterY);
    uniforms.uTintA.value.set("#000000");
    uniforms.uTintB.value.set("#000000");
    uniforms.uDepthGammaA.value = this.resolveDepthGamma(this.sources[timeline.a], timeline, "A");
    uniforms.uDepthGammaB.value = this.resolveDepthGamma(this.sources[timeline.b], timeline, "B");

    this.updateRecordTexture(currentRecord, currentSeek);
    if (!sameRecord) this.updateRecordTexture(nextRecord, nextSeek);
    this.updateFinalUniforms().forEach((record) => this.updateRecordTexture(record));

    if (this.points) {
      const motionScale = 1 - this.finalProgress;
      const targetX = -this.mouseY * 0.12 * motionScale;
      const targetY = this.mouseX * 0.12 * motionScale;
      this.points.rotation.x += (targetX - this.points.rotation.x) * 0.06;
      this.points.rotation.y += (targetY - this.points.rotation.y) * 0.06;
      this.points.rotation.x += Math.sin(uniforms.uTime.value * 0.11) * 0.0008 * motionScale;
      this.points.rotation.y += Math.cos(uniforms.uTime.value * 0.09) * 0.0011 * motionScale;
    }
    this.renderer.render(this.scene, this.camera);
    return timeline;
  }

  getSceneState() {
    const timeline = this.currentTimeline || resolveTimeline(this.sources, this.scroll, this.records, this.transitionSpeed);
    return {
      count: this.records.length,
      index: timeline.sceneIndex,
      local: timeline.local,
      morph: timeline.morph,
      phaseType: timeline.phaseType,
    };
  }

  destroy() {
    this.disposed = true;
    this.destroyRecords();
    this.destroyFinalRecords();
    this.geometry?.dispose();
    this.material.dispose();
    this.emptyTexture.dispose();
    this.renderer.dispose();
    this.stage.remove();
  }

  private createRecord(source: ClipSource, index = 0): TextureRecord {
    const video = makeVideo(source);
    this.stage.appendChild(video);
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    const record: TextureRecord = {
      aspect: this.sourceAspect,
      duration: source.duration || 1,
      isFirst: index === 0,
      isReady: false,
      lastSeekAt: 0,
      lastSeekTime: -1,
      lastTextureTime: -1,
      loadFailed: false,
      needsTextureUpdate: true,
      readyPromise: Promise.resolve({ ok: false, reason: "pending" }),
      seekInFlight: false,
      source,
      texture,
      video,
    };
    const updateMetadata = () => {
      record.duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : record.duration;
      if (video.videoWidth && video.videoHeight) {
        const nextAspect = video.videoWidth / video.videoHeight;
        record.aspect = nextAspect;
        if (record.isFirst) this.sourceAspect = nextAspect;
      }
    };
    const load = async (attempt: number): Promise<{ ok: boolean; reason: string }> => {
      const result = await waitForVideo(video);
      if (this.disposed) return result;
      if (result.ok) {
        record.isReady = true;
        updateMetadata();
        return result;
      }
      if (attempt < 1) {
        const sep = source.clipSrc.includes("?") ? "&" : "?";
        video.src = `${source.clipSrc}${sep}_retry=${Date.now().toString(36)}`;
        video.load();
        return load(attempt + 1);
      }
      record.loadFailed = true;
      return result;
    };
    record.readyPromise = load(0);
    video.addEventListener("loadedmetadata", updateMetadata);
    video.addEventListener("durationchange", updateMetadata);
    video.addEventListener("loadeddata", () => {
      record.needsTextureUpdate = true;
    });
    video.addEventListener("seeking", () => {
      record.seekInFlight = true;
    });
    video.addEventListener("seeked", () => {
      record.seekInFlight = false;
      record.needsTextureUpdate = true;
    });
    video.addEventListener("timeupdate", () => {
      record.needsTextureUpdate = true;
    });
    video.load();
    return record;
  }

  private destroyRecords() {
    this.records.forEach((record) => this.disposeRecord(record));
    this.records = [];
  }

  private destroyFinalRecords() {
    this.finalRecords.forEach((record) => this.disposeRecord(record));
    this.finalRecords = [];
  }

  private disposeRecord(record: TextureRecord) {
    record.video.pause();
    record.video.removeAttribute("src");
    record.video.load();
    record.video.remove();
    record.texture.dispose();
  }

  private async primeVideos() {
    const records = [...this.records, ...this.finalRecords];
    for (const record of records) {
      try {
        if (record.video.paused) {
          await record.video.play();
          record.video.pause();
        }
      } catch {
        // Browsers can block autoplay priming; frame scrubbing still works after metadata.
      }
      if (record.video.readyState >= 1 && record.video.currentTime === 0) {
        try {
          record.video.currentTime = Math.min(0.01, Math.max(0, record.duration - 0.03));
          record.needsTextureUpdate = true;
        } catch {
          // Some browsers reject early seeks while metadata settles.
        }
      }
    }
  }

  private seekRecord(record: TextureRecord, progress: number) {
    const duration = Math.max(0.001, record.duration - 0.035);
    const time = clamp(progress) * duration;
    const now = performance.now();
    const settling = (record.video.seeking || record.seekInFlight) && now - record.lastSeekAt < 180;
    if (
      record.video.readyState < 1 ||
      settling ||
      Math.abs(record.video.currentTime - time) < 0.024 ||
      Math.abs(record.lastSeekTime - time) < 0.014 ||
      now - record.lastSeekAt < 28
    ) {
      return false;
    }
    try {
      record.lastSeekAt = now;
      record.lastSeekTime = time;
      record.seekInFlight = true;
      record.needsTextureUpdate = true;
      if (Math.abs(record.video.currentTime - time) > 0.18 && "fastSeek" in record.video) {
        record.video.fastSeek(time);
      } else {
        record.video.currentTime = time;
      }
      return true;
    } catch {
      record.seekInFlight = false;
      return false;
    }
  }

  private updateRecordTexture(record: TextureRecord | undefined, forced = false) {
    if (!record?.texture || !record.video) return;
    if (!this.isTextureReady(record)) return;
    const currentTime = record.video.currentTime || 0;
    if (!forced && !record.needsTextureUpdate && Math.abs(currentTime - record.lastTextureTime) < 0.001) return;
    record.texture.needsUpdate = true;
    record.needsTextureUpdate = false;
    record.lastTextureTime = currentTime;
  }

  private isTextureReady(record: TextureRecord | undefined) {
    return Boolean(record?.isReady && record.video.readyState >= 2 && record.video.videoWidth > 0 && record.video.videoHeight > 0);
  }

  private updateFinalUniforms() {
    const records: TextureRecord[] = [];
    const visible = this.visibleSize();
    for (let index = 0; index < 3; index += 1) {
      const target = this.finalTargets[index];
      const record = this.finalRecords[index];
      const textureUniform = this.material.uniforms[`uFinalTexture${index}` as keyof typeof this.material.uniforms];
      const flipUniform = this.material.uniforms[`uFinalFlip${index}` as keyof typeof this.material.uniforms];
      const rectUniform = this.material.uniforms[`uFinalRect${index}` as keyof typeof this.material.uniforms]?.value as THREE.Vector4 | undefined;
      const tintUniform = this.material.uniforms[`uFinalTint${index}` as keyof typeof this.material.uniforms]?.value as THREE.Color | undefined;
      if (!textureUniform || !flipUniform || !rectUniform || !tintUniform) continue;

      if (record && this.finalProgress > 0.001) {
        this.seekRecord(record, target?.progress ?? Math.min(0.88, 0.22 + index * 0.23));
        records.push(record);
        textureUniform.value = record.texture;
        flipUniform.value = record.source.flipY ? 1 : 0;
        tintUniform.set("#000000");
      } else {
        textureUniform.value = this.emptyTexture;
        flipUniform.value = 0;
        tintUniform.set("#000000");
      }

      if (target) {
        const x0 = (clamp(target.x0) - 0.5) * visible.width;
        const x1 = (clamp(target.x1) - 0.5) * visible.width;
        const y0 = (0.5 - clamp(target.y0)) * visible.height;
        const y1 = (0.5 - clamp(target.y1)) * visible.height;
        rectUniform.set(x0, y1, x1, y0);
      } else {
        rectUniform.set(0, 0, 0, 0);
      }
    }
    return records;
  }

  private buildGeometry(target: number) {
    this.lastParticleTarget = target;
    const aspect = this.sourceAspect || 16 / 9;
    const cols = Math.max(96, Math.round(Math.sqrt(target * aspect)));
    const rows = Math.max(96, Math.round(cols / aspect));
    const count = cols * rows;
    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    const seeds = new Float32Array(count);
    let positionCursor = 0;
    let uvCursor = 0;
    for (let y = 0; y < rows; y += 1) {
      const v = rows === 1 ? 0.5 : y / (rows - 1);
      for (let x = 0; x < cols; x += 1) {
        const u = cols === 1 ? 0.5 : x / (cols - 1);
        const seed = this.hash(x, y);
        const seedB = this.hash(x + 19.17, y + 3.11);
        positions[positionCursor] = u - 0.5 + (seed - 0.5) * (cols > 1 ? 1 / (cols - 1) : 0) * 0.08;
        positions[positionCursor + 1] = 0.5 - v + (seedB - 0.5) * (rows > 1 ? 1 / (rows - 1) : 0) * 0.08;
        positions[positionCursor + 2] = 0;
        uvs[uvCursor] = u;
        uvs[uvCursor + 1] = v;
        seeds[positionCursor / 3] = seed;
        positionCursor += 3;
        uvCursor += 2;
      }
    }
    this.geometry?.dispose();
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aUv", new THREE.BufferAttribute(uvs, 2));
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    if (this.points) this.scene.remove(this.points);
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  private updatePlaneScale(width: number, height: number, aspect = this.sourceAspect) {
    const visible = this.visibleSize();
    const cappedWidth = this.cappedCssWidth(width);
    const cappedHeight = Math.min(height, 1000);
    const availableWidth = visible.width * Math.min(1, cappedWidth / Math.max(1, width));
    const availableHeight = visible.height * Math.min(1, cappedHeight / Math.max(1, height));
    const sourceAspect = aspect || 16 / 9;
    const fit = width < 720 ? 0.94 : 0.84;
    let planeX: number;
    let planeY: number;
    if (cappedWidth / cappedHeight > sourceAspect) {
      planeY = availableHeight * fit;
      planeX = planeY * sourceAspect;
    } else {
      planeX = availableWidth * fit;
      planeY = planeX / sourceAspect;
    }
    this.material.uniforms.uPlaneScale.value.set(planeX, planeY);
    this.material.uniforms.uViewportScale.value.set(visible.width, visible.height);
    this.material.uniforms.uFieldFade.value = width > 1600 || height > 1000 ? 1 : 0;
  }

  private visibleSize() {
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) * this.camera.position.z;
    return { height, width: height * this.camera.aspect };
  }

  private cappedCssWidth(width: number) {
    return Math.min(width, 1600);
  }

  private particleTarget(width: number) {
    const cores = navigator.hardwareConcurrency || 4;
    const base = width < 640 || cores < 4 ? 26000 : width < 1024 ? 72000 : 120000;
    const cap = width < 640 || cores < 4 ? 55000 : width < 1024 ? 160000 : 300000;
    return Math.min(cap, Math.round(base * this.densityScale));
  }

  private resolveDepthGamma(source: ClipSource | undefined, timeline: TimelineSnapshot, slot: "A" | "B") {
    if (!source) return 1;
    const start = source.depthGamma ?? 1;
    const end = source.depthGammaEnd;
    if (end == null) return start;
    if (timeline.phaseType === "play") return mixNumber(start, end, timeline.local);
    return slot === "A" ? end : start;
  }

  private hash(x: number, y: number) {
    const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }
}
