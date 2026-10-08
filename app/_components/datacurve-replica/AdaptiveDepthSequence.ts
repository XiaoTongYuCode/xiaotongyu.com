import { DepthFrameSequence } from "./DepthFrameSequence";
import { WebCodecsDepthSequence, type DepthSequence } from "./WebCodecsDepthSequence";
import encodedSources from "./encodedSources.generated.json";

/** Prefer WebCodecs, with static atlases as a fallback or an explicit ?depth=atlas override. */
export class AdaptiveDepthSequence implements DepthSequence {
  private active: DepthSequence = new DepthFrameSequence();
  private fallback: DepthFrameSequence | null = null;
  private disposed = false;
  private source = "";
  private progress = 0;
  mode: "atlas" | "webcodecs" = "atlas";
  fallbackReason: string | null = null;

  get texture() { return this.active.texture; }
  get manifest() { return this.active.manifest; }
  get frameRect() { return this.active.frameRect; }
  get diagnostics() {
    return { mode: this.mode, fallbackReason: this.fallbackReason,
      ...(this.active instanceof WebCodecsDepthSequence ? this.active.diagnostics : {}) };
  }

  async load(src: string) {
    this.source = src;
    const packed = (encodedSources as Record<string, string>)[src];
    if (packed && new URLSearchParams(window.location.search).get("depth") !== "atlas") {
      this.active.dispose();
      this.active = new WebCodecsDepthSequence((reason) => { void this.useFallback(reason).catch(() => undefined); });
      this.mode = "webcodecs";
      try { return await this.active.load(packed); }
      catch (error) {
        if (this.disposed) throw error;
        return await this.useFallback(error instanceof Error ? error.message : String(error));
      }
    }
    return await this.active.load(src);
  }

  private async useFallback(reason: string) {
    this.fallbackReason = reason;
    const fallback = new DepthFrameSequence();
    this.fallback = fallback;
    try {
      const manifest = await fallback.load(this.source);
      if (this.disposed) throw new Error("Depth sequence disposed");
      this.active.dispose();
      this.active = fallback;
      this.fallback = null;
      this.mode = "atlas";
      this.active.seek(this.progress);
      return manifest;
    } catch (error) {
      fallback.dispose();
      this.fallback = null;
      throw error;
    }
  }

  seek(progress: number) { this.progress = progress; this.active.seek(progress); }
  pause() { this.active.pause(); }
  dispose() { this.disposed = true; this.active.dispose(); this.fallback?.dispose(); }
}
