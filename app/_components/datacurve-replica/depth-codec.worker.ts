import { DepthWindowCache, depthDecodeWindow, parseDepthCodec } from "./depthCodecFormat";

// Dedicated worker: the main thread never demuxes or decodes video samples.
const scope = self as unknown as {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
};
let packet: ReturnType<typeof parseDepthCodec>;
let config: VideoDecoderConfig;
let timestamps: number[];
const cache = new DepthWindowCache<VideoFrame>();
let busy = false;
const resourceRequests = () => performance.getEntriesByType("resource").filter((entry) => new URL(entry.name).pathname.endsWith(".depth")).length;

async function getFrame(index: number) {
  const timestamp = timestamps[index];
  const cached = cache.get(timestamp);
  if (cached) return cached.clone();
  const window = depthDecodeWindow(packet.manifest.samples, index);
  const frames = new Map<number, VideoFrame>();
  let failure: Error | undefined;
  const decoder = new VideoDecoder({
    output(frame) {
      if (window.timestamps.has(frame.timestamp)) frames.set(frame.timestamp, frame);
      else frame.close();
    },
    error(error) { failure = error; },
  });
  try {
    decoder.configure(config);
    for (let i = window.start; i <= window.end; i++) {
      const sample = packet.manifest.samples[i];
      decoder.decode(new EncodedVideoChunk({ type: sample.key ? "key" : "delta", timestamp: sample.timestamp,
        duration: sample.duration, data: packet.payload.subarray(sample.offset, sample.offset + sample.size) }));
    }
    await decoder.flush();
    if (failure) throw failure;
    if (!frames.has(timestamp)) throw new Error("Requested depth frame was not decoded");
    cache.put(window.block, frames);
    return cache.get(timestamp)!.clone();
  } catch (error) {
    frames.forEach((frame) => frame.close());
    throw error;
  } finally {
    if (decoder.state !== "closed") decoder.close();
  }
}

scope.onmessage = async ({ data }) => {
  if (busy) return; // The client coalesces seeks and permits only one outstanding request.
  busy = true;
  const started = performance.now();
  try {
    if (data.type === "load") {
      if (typeof VideoDecoder === "undefined") throw new Error("WebCodecs unavailable in this worker");
      const response = await fetch(data.src, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`Depth packet HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      packet = parseDepthCodec(buffer);
      const manifest = packet.manifest;
      config = { codec: manifest.codec, codedWidth: manifest.width, codedHeight: manifest.height,
        description: new Uint8Array(manifest.description), hardwareAcceleration: "no-preference" };
      if (!(await VideoDecoder.isConfigSupported(config)).supported) throw new Error(`Unsupported depth codec ${manifest.codec}`);
      timestamps = manifest.samples.map((sample) => sample.timestamp).sort((a, b) => a - b);
      const frame = await getFrame(0);
      scope.postMessage({ type: "ready", frame, bytes: buffer.byteLength, cachedFrames: cache.size,
        resourceRequests: resourceRequests(), contentType: response.headers.get("content-type"),
        elapsed: performance.now() - started,
        manifest: { width: manifest.width, height: manifest.height, duration: manifest.duration,
          fps: manifest.fps, frameCount: manifest.frameCount } }, [frame]);
    } else if (data.type === "seek") {
      const index = Math.max(0, Math.min(timestamps.length - 1, Math.floor(data.frame)));
      const frame = await getFrame(index);
      scope.postMessage({ type: "frame", id: data.id, index, frame, cachedFrames: cache.size,
        resourceRequests: resourceRequests(),
        elapsed: performance.now() - started }, [frame]);
    }
  } catch (error) {
    cache.clear();
    scope.postMessage({ type: "error", reason: error instanceof Error ? error.message : String(error) });
  } finally {
    busy = false;
  }
};
