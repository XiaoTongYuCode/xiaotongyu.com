export type DepthSample = { offset: number; size: number; timestamp: number; duration: number; key: boolean };
export type DepthCodecManifest = {
  version: number; codec: string; description: number[];
  width: number; height: number; fps: number; duration: number; frameCount: number;
  samples: DepthSample[];
};

export function parseDepthCodec(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 8 || new TextDecoder().decode(bytes.subarray(0, 4)) !== "DPC1") throw new Error("Invalid depth packet header");
  const length = new DataView(buffer).getUint32(4, true);
  if (length < 2 || length > 1024 * 1024 || length + 8 >= bytes.length) throw new Error("Invalid depth packet metadata");
  const manifest = JSON.parse(new TextDecoder().decode(bytes.subarray(8, 8 + length))) as DepthCodecManifest;
  if (manifest.version !== 1 || !/^avc1\.[0-9a-f]{6}$/i.test(manifest.codec) ||
      ![manifest.width, manifest.height].every((n) => Number.isInteger(n) && n > 0 && n <= 4096) ||
      !Number.isFinite(manifest.fps) || manifest.fps <= 0 || !Number.isFinite(manifest.duration) || manifest.duration <= 0 ||
      !Array.isArray(manifest.description) || manifest.description.length < 7 || manifest.description.length > 65536 ||
      !manifest.description.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) ||
      !Array.isArray(manifest.samples) || !manifest.samples.length || manifest.samples.length > 1024 ||
      manifest.frameCount !== manifest.samples.length || !manifest.samples[0].key) throw new Error("Invalid depth packet config");
  const payload = bytes.subarray(8 + length);
  let offset = 0;
  const timestamps = new Set<number>();
  for (const sample of manifest.samples) {
    if (sample.offset !== offset || !Number.isSafeInteger(sample.size) || sample.size <= 0 || offset + sample.size > payload.length ||
        !Number.isSafeInteger(sample.timestamp) || sample.timestamp < 0 || timestamps.has(sample.timestamp) ||
        !Number.isSafeInteger(sample.duration) || sample.duration <= 0 || typeof sample.key !== "boolean") throw new Error("Invalid depth sample");
    offset += sample.size;
    timestamps.add(sample.timestamp);
  }
  if (offset !== payload.length) throw new Error("Unexpected depth packet payload");
  return { manifest, payload };
}

// Packet order is decode order; timestamps are display order (including B frames).
export function depthDecodeWindow(samples: DepthSample[], frame: number, size = 24) {
  const ordered = samples.map((sample, index) => ({ index, timestamp: sample.timestamp })).sort((a, b) => a.timestamp - b.timestamp);
  const block = Math.floor(Math.min(samples.length - 1, Math.max(0, frame)) / size);
  const wanted = ordered.slice(block * size, (block + 1) * size);
  let start = Math.min(...wanted.map((sample) => sample.index));
  while (start > 0 && !samples[start].key) start--;
  return { block, start, end: Math.max(...wanted.map((sample) => sample.index)), timestamps: new Set(wanted.map((sample) => sample.timestamp)) };
}

export class DepthWindowCache<T extends { close(): void }> {
  private windows = new Map<number, Map<number, T>>();
  get(timestamp: number) {
    for (const [block, frames] of this.windows) {
      const frame = frames.get(timestamp);
      if (frame) {
        this.windows.delete(block);
        this.windows.set(block, frames);
        return frame;
      }
    }
  }
  put(block: number, frames: Map<number, T>) {
    this.windows.get(block)?.forEach((frame) => frame.close());
    this.windows.delete(block);
    this.windows.set(block, frames);
    while (this.windows.size > 2) {
      const oldest = this.windows.keys().next().value!;
      this.windows.get(oldest)!.forEach((frame) => frame.close());
      this.windows.delete(oldest);
    }
  }
  get size() { return [...this.windows.values()].reduce((sum, frames) => sum + frames.size, 0); }
  clear() { this.windows.forEach((frames) => frames.forEach((frame) => frame.close())); this.windows.clear(); }
}
