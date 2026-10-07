import * as THREE from "three";

export type DepthFrameManifest = {
  version: number;
  width: number;
  height: number;
  columns: number;
  rows: number;
  frameCount: number;
  fps: number;
  duration: number;
  atlases: string[];
};

export function parseDepthFrameManifest(value: unknown): DepthFrameManifest {
  const manifest = value as DepthFrameManifest;
  if (
    !manifest || manifest.version !== 1 ||
    ![manifest.width, manifest.height, manifest.columns, manifest.rows, manifest.frameCount]
      .every((number) => Number.isInteger(number) && number > 0) ||
    manifest.width * manifest.columns > 4096 || manifest.height * manifest.rows > 4096 ||
    !Number.isFinite(manifest.fps) || manifest.fps <= 0 ||
    !Number.isFinite(manifest.duration) || manifest.duration <= 0 ||
    !Array.isArray(manifest.atlases) ||
    manifest.atlases.length !== Math.ceil(manifest.frameCount / (manifest.columns * manifest.rows)) ||
    !manifest.atlases.every((src) => typeof src === "string" && /^\/dotmorph-assets\/frames\/[\w/-]+\.webp$/.test(src))
  ) throw new Error("Invalid depth frame manifest");
  return manifest;
}

export function depthFrameAtProgress(manifest: DepthFrameManifest, progress: number) {
  const time = Math.min(1, Math.max(0, progress)) * Math.max(0, manifest.duration - 0.035);
  return Math.min(manifest.frameCount - 1, Math.floor(time * manifest.fps));
}

export function depthFrameRect(manifest: DepthFrameManifest, frame: number) {
  const local = frame % (manifest.columns * manifest.rows);
  const column = local % manifest.columns;
  const row = Math.floor(local / manifest.columns);
  const width = manifest.width * manifest.columns;
  const height = manifest.height * manifest.rows;
  // Texture uploads flip the image vertically. Stay half a texel inside each
  // tile so linear filtering and Sobel samples cannot bleed into another frame.
  return [
    (column * manifest.width + 0.5) / width,
    ((manifest.rows - row - 1) * manifest.height + 0.5) / height,
    (manifest.width - 1) / width,
    (manifest.height - 1) / height,
  ] as const;
}

type Atlas = {
  texture: THREE.Texture;
  promise: Promise<THREE.Texture>;
  ready: boolean;
  cancel: () => void;
};

/** Static image textures only: no media element, decoder, or video request. */
export class DepthFrameSequence {
  readonly frameRect = new THREE.Vector4(0, 0, 1, 1);
  manifest: DepthFrameManifest | null = null;
  texture: THREE.Texture | null = null;
  private atlases = new Map<number, Atlas>();
  private controller = new AbortController();
  private disposed = false;
  private displayedAtlas = -1;
  private desiredFrame = 0;
  private direction = 1;
  private failedAtlases = new Set<number>();

  async load(src: string) {
    const timeout = setTimeout(() => this.controller.abort(), 15000);
    let manifest: DepthFrameManifest;
    try {
      const response = await fetch(src, { signal: this.controller.signal });
      if (!response.ok) throw new Error(`depth frames ${response.status}`);
      manifest = parseDepthFrameManifest(await response.json());
    } finally {
      clearTimeout(timeout);
    }
    if (this.disposed) throw new Error("Depth sequence disposed");
    this.manifest = manifest;
    await this.loadAtlas(0);
    if (this.disposed) throw new Error("Depth sequence disposed");
    this.displayFrame(0);
    return manifest;
  }

  seek(progress: number) {
    if (this.disposed || !this.manifest) return;
    const frame = depthFrameAtProgress(this.manifest, progress);
    if (frame !== this.desiredFrame) this.direction = frame > this.desiredFrame ? 1 : -1;
    this.desiredFrame = frame;
    const index = this.atlasIndex(frame);
    if (this.atlases.get(index)?.ready) this.displayFrame(frame);
    else if (!this.atlases.has(index) && !this.failedAtlases.has(index)) void this.loadAtlas(index).then(() => {
      if (!this.disposed && this.atlasIndex(this.desiredFrame) === index) this.displayFrame(this.desiredFrame);
    }).catch(() => { /* Keep the last decoded frame if a later image fails. */ });
    // Prefetch in the scroll direction. Inactive scenes retain only one atlas.
    const neighbor = index + this.direction;
    if (neighbor >= 0 && neighbor < this.manifest.atlases.length && !this.atlases.has(neighbor) && !this.failedAtlases.has(neighbor)) {
      void this.loadAtlas(neighbor).catch(() => undefined);
    }
    this.trimAtlases();
  }

  dispose() {
    this.disposed = true;
    this.controller.abort();
    this.atlases.forEach((atlas) => {
      atlas.cancel();
      atlas.texture.dispose();
    });
    this.atlases.clear();
    this.texture = null;
  }

  pause() {
    for (const [index, atlas] of this.atlases) {
      if (index === this.displayedAtlas || (index === 0 && this.displayedAtlas < 0)) continue;
      this.atlases.delete(index);
      atlas.cancel();
      atlas.texture.dispose();
    }
  }

  private atlasIndex(frame: number) {
    return Math.floor(frame / ((this.manifest?.columns ?? 1) * (this.manifest?.rows ?? 1)));
  }

  private displayFrame(frame: number) {
    if (!this.manifest) return;
    const index = this.atlasIndex(frame);
    const atlas = this.atlases.get(index);
    if (!atlas?.ready) return;
    this.displayedAtlas = index;
    this.texture = atlas.texture;
    this.frameRect.set(...depthFrameRect(this.manifest, frame));
    this.trimAtlases();
  }

  private loadAtlas(index: number): Promise<THREE.Texture> {
    const cached = this.atlases.get(index);
    if (cached) return cached.promise;
    const src = this.manifest?.atlases[index];
    if (!src || this.disposed || this.failedAtlases.has(index)) return Promise.reject(new Error("Depth atlas unavailable"));
    const atlas = {} as Atlas;
    atlas.ready = false;
    atlas.promise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.atlases.get(index) === atlas) this.atlases.delete(index);
        this.failedAtlases.add(index);
        atlas.texture.dispose();
        reject(new Error("Depth atlas timeout"));
      }, 15000);
      atlas.cancel = () => {
        clearTimeout(timeout);
        reject(new Error("Depth atlas disposed"));
      };
      atlas.texture = new THREE.TextureLoader().load(src, (texture) => {
        clearTimeout(timeout);
        if (this.disposed || this.atlases.get(index) !== atlas) {
          texture.dispose();
          reject(new Error("Depth atlas disposed"));
          return;
        }
        const image = texture.image as HTMLImageElement;
        if (image.naturalWidth !== this.manifest!.width * this.manifest!.columns ||
            image.naturalHeight !== this.manifest!.height * this.manifest!.rows) {
          this.atlases.delete(index);
          this.failedAtlases.add(index);
          texture.dispose();
          reject(new Error("Depth atlas dimensions mismatch"));
          return;
        }
        atlas.ready = true;
        resolve(texture);
      }, undefined, (error) => {
        clearTimeout(timeout);
        if (this.atlases.get(index) === atlas) {
          this.atlases.delete(index);
          this.failedAtlases.add(index);
        }
        atlas.texture.dispose();
        reject(error);
      });
      atlas.texture.minFilter = THREE.LinearFilter;
      atlas.texture.magFilter = THREE.LinearFilter;
      atlas.texture.generateMipmaps = false;
      // These values are depth data. Match the raw samples of the old source.
      atlas.texture.colorSpace = THREE.NoColorSpace;
    });
    this.atlases.set(index, atlas);
    return atlas.promise;
  }

  private trimAtlases() {
    const desired = this.atlasIndex(this.desiredFrame);
    // While an image is loading, keep the displayed atlas as a fallback. Once
    // decoded, the cache holds just the current atlas and its next neighbor.
    for (const [index, atlas] of this.atlases) {
      if (index === desired || index === desired + this.direction || index === this.displayedAtlas ||
          (index === 0 && this.displayedAtlas < 0)) continue;
      this.atlases.delete(index);
      atlas.cancel();
      atlas.texture.dispose();
    }
  }
}
