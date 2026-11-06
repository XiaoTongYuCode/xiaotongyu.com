import walkerCast from "../../../public/walkers/cast.json";

export const WALKER_ATLAS = {
  frameCount: 48,
  columns: 8,
  tileWidth: 88,
  tileHeight: 140,
  anchorX: 44,
  anchorY: 117,
  bodyHeight: 99,
} as const;
export const WALKER_BLURS = [2.2, 3.6, 5.8, 9] as const;
export const BAKED_BLUR_SCALE = .5;

export type WalkerStyle = { id: string; src: string; height: number; stride: number; provenance: string; calibration: string };
/** Four captured performers; coat/backpack remain authored clothing variants. */
export const SILHOUETTE_CAST: readonly WalkerStyle[] = walkerCast;

export type WalkerAtlasSource = { images: HTMLImageElement[]; preblurred: boolean; cast: readonly WalkerStyle[] };
const pending = new Map<number,Promise<WalkerAtlasSource>>();

/** Decode once before constructing the crowd. Failed assets use the old rig. */
export function loadWalkerAtlas(variantCount: 3 | 6 = 6): Promise<WalkerAtlasSource> {
  const existing=pending.get(variantCount);
  if (existing) return existing;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return Promise.reject(new Error("Canvas is unavailable"));
  const preblurred = !("filter" in context);
  const cast=SILHOUETTE_CAST.slice(0,variantCount);
  const loading = Promise.all(cast.map(async ({ src }) => {
    const image = new Image();
    image.decoding = "async";
    image.src = preblurred ? src.replace(".webp", "-blurred.webp") : src;
    await image.decode();
    const scale = preblurred ? BAKED_BLUR_SCALE : 1;
    if (image.naturalWidth !== WALKER_ATLAS.columns * WALKER_ATLAS.tileWidth * scale
      || image.naturalHeight !== WALKER_ATLAS.frameCount / WALKER_ATLAS.columns * WALKER_ATLAS.tileHeight * (preblurred ? WALKER_BLURS.length : 1) * scale) {
      throw new Error("Unexpected walker atlas dimensions");
    }
    return image;
  })).then((images) => ({ images, preblurred, cast })).catch((error) => {
    pending.delete(variantCount);
    throw error;
  });
  pending.set(variantCount,loading);
  return loading;
}
