import * as THREE from "three";

export type DepthDimensions = { width: number; height: number; duration: number; fps: number; frameCount: number };
export interface DepthSequence {
  readonly manifest: DepthDimensions | null;
  readonly texture: THREE.Texture | null;
  readonly frameRect: THREE.Vector4;
  load(src: string): Promise<DepthDimensions>;
  seek(progress: number): void;
  pause(): void;
  dispose(): void;
}

export class WebCodecsDepthSequence implements DepthSequence {
  readonly frameRect = new THREE.Vector4(0, 0, 1, 1);
  texture: THREE.VideoFrameTexture | null = null;
  readonly diagnostics = { bytes: 0, cachedFrames: 0, displayedFrame: -1, loadMs: 0, lastSeekMs: 0, seeks: 0, resourceRequests: 0, contentType: "" };
  private worker: Worker | null = null;
  manifest: DepthDimensions | null = null;
  private displayed: VideoFrame | null = null;
  private desiredFrame = 0;
  private pending = false;
  private disposed = false;
  private failed = false;
  private request = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private rejectLoad: ((error: Error) => void) | null = null;

  constructor(private onFailure: (reason: string) => void) {}

  async load(src: string): Promise<DepthDimensions> {
    if (!globalThis.isSecureContext || typeof Worker === "undefined" || typeof VideoDecoder === "undefined") {
      throw new Error("WebCodecs requires a supported browser and HTTPS or localhost");
    }
    return new Promise((resolve, reject) => {
      this.rejectLoad = reject;
      this.worker = new Worker(new URL("./depth-codec.worker.ts", import.meta.url), { type: "module" });
      this.timer = setTimeout(() => this.fail("WebCodecs initialization timed out"), 20000);
      this.worker.onerror = (event) => { event.preventDefault(); this.fail(event.message || "WebCodecs worker failed"); };
      this.worker.onmessage = ({ data }) => {
        if (this.disposed || this.failed) { data.frame?.close(); return; }
        if (data.type === "error") { this.fail(data.reason); return; }
        if (data.type !== "ready" && data.type !== "frame") return;
        clearTimeout(this.timer);
        this.pending = false;
        this.diagnostics.cachedFrames = data.cachedFrames;
        this.diagnostics.resourceRequests = data.resourceRequests;
        this.displayed?.close();
        this.displayed = data.frame as VideoFrame;
        if (!this.texture) {
          this.texture = new THREE.VideoFrameTexture();
          this.texture.colorSpace = THREE.NoColorSpace;
          this.texture.generateMipmaps = false;
        }
        this.texture.setFrame(this.displayed);
        this.diagnostics.displayedFrame = data.index ?? 0;
        if (data.type === "ready") {
          this.manifest = data.manifest;
          const { width, height } = data.manifest as DepthDimensions;
          this.frameRect.set(0.5 / width, 0.5 / height, (width - 1) / width, (height - 1) / height);
          this.diagnostics.bytes = data.bytes;
          this.diagnostics.contentType = data.contentType;
          this.diagnostics.loadMs = data.elapsed;
          this.rejectLoad = null;
          resolve(data.manifest);
        } else {
          this.diagnostics.lastSeekMs = data.elapsed;
        }
        this.requestFrame();
      };
      this.worker.postMessage({ type: "load", src });
    });
  }

  seek(progress: number) {
    if (!this.manifest || this.disposed || this.failed) return;
    const time = Math.min(1, Math.max(0, progress)) * Math.max(0, this.manifest.duration - 0.035);
    this.desiredFrame = Math.min(this.manifest.frameCount - 1, Math.floor(time * this.manifest.fps));
    this.requestFrame();
  }

  private requestFrame() {
    if (!this.worker || !this.manifest || this.pending || this.disposed || this.failed || this.desiredFrame === this.diagnostics.displayedFrame) return;
    this.pending = true;
    this.diagnostics.seeks++;
    this.timer = setTimeout(() => this.fail("WebCodecs seek timed out"), 8000);
    this.worker.postMessage({ type: "seek", frame: this.desiredFrame, id: ++this.request });
  }

  // Keep the compressed packet and bounded frame cache when a scene is inactive.
  pause() {}

  private fail(reason: string) {
    if (this.disposed || this.failed) return;
    this.failed = true;
    clearTimeout(this.timer);
    this.worker?.terminate();
    this.worker = null;
    if (this.rejectLoad) { this.rejectLoad(new Error(reason)); this.rejectLoad = null; }
    else this.onFailure(reason);
  }

  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
    this.rejectLoad?.(new Error("Depth sequence disposed"));
    this.rejectLoad = null;
    this.worker?.terminate();
    this.worker = null;
    this.displayed?.close();
    this.displayed = null;
    this.texture?.dispose();
    this.texture = null;
  }
}
