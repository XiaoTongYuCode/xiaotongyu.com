import type { DirectionName, Scene, SceneConfig } from "./types";

export const sourceWidth = 640;
export const sourceHeight = 360;
export const sceneAspect = sourceWidth / sourceHeight;

const defaultDensityScale = 1.55;
const defaultTransitionSpeed = 0.03;

export const defaultScenes: Scene[] = [
  {
    id: "analyst-copilot",
    clipSrc: "/dotmorph-assets/depth-clip-02.mp4",
    duration: 4,
    depthGamma: 1,
    enterDirection: "auto",
    exitDirection: "auto",
    line: "Let AI carry repetition and leave judgment and craft to people.",
    fragments: ["Let AI carry repetition", "and leave craft to people."],
  },
  {
    id: "prototype-making",
    clipSrc: "/dotmorph-assets/depth-clip-03-tooling.mp4",
    duration: 4.066667,
    depthGamma: 1,
    enterDirection: "auto",
    exitDirection: "auto",
    textRevealSpeed: 1.08,
    line: "Products take shape when tools, systems, and intent move together.",
    fragments: ["Products take shape", "when systems move together."],
  },
  {
    id: "knowledge-structure",
    clipSrc: "/dotmorph-assets/depth-clip-04.mp4",
    duration: 6.041667,
    depthGamma: 0.2,
    enterDirection: "auto",
    exitDirection: "auto",
    line: "Good software is built one careful layer at a time.",
    fragments: ["Good software is built", "one careful layer at a time."],
  },
  {
    id: "industry-map",
    clipSrc: "/dotmorph-assets/depth-clip-05.mp4",
    duration: 3.993832,
    depthGamma: 0.4,
    enterDirection: "auto",
    exitDirection: "auto",
    holdMultiplier: 1.1,
    line: "Small experiments connect into a digital place I can call my own.",
    fragments: ["Small experiments connect", "into a place of my own."],
  },
];

type DepthSceneClip = {
  id?: string;
  src?: string;
  sourceDuration?: number;
  canonicalDuration?: number;
  depthGamma?: number;
  depthGammaEnd?: number | null;
  enterDirection?: string;
  exitDirection?: string;
  holdMultiplier?: number;
  transitionInScale?: number;
  playbackEndAt?: number;
  reverse?: boolean;
  textRevealSpeed?: number;
};

type DepthSceneConfig = {
  clips?: DepthSceneClip[];
  densityScale?: number;
  transitionSpeed?: number;
};

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(Math.max(numeric, min), max) : fallback;
}

function normalizeDirection(value: unknown): DirectionName {
  return value === "left" || value === "right" || value === "top" || value === "bottom" ? value : "auto";
}

function normalizeSceneConfig(config: DepthSceneConfig): Scene[] {
  const clips = Array.isArray(config.clips) ? config.clips : [];
  if (!clips.length) return defaultScenes;
  const normalized: Scene[] = [];
  clips.forEach((clip, index) => {
    const fallback = defaultScenes[index % defaultScenes.length];
    const duration = clip.canonicalDuration || clip.sourceDuration || fallback.duration;
    const src = clip.src || fallback.clipSrc;
    if (!src) return;
    normalized.push({
      id: clip.id || fallback.id || `depth-${index + 1}`,
      clipSrc: src,
      duration,
      depthGamma: clampNumber(clip.depthGamma, 0.2, 3, fallback.depthGamma ?? 1),
      depthGammaEnd: Number.isFinite(clip.depthGammaEnd) ? clampNumber(clip.depthGammaEnd, 0.2, 3, fallback.depthGammaEnd ?? 1) : null,
      enterDirection: normalizeDirection(clip.enterDirection ?? fallback.enterDirection),
      exitDirection: normalizeDirection(clip.exitDirection ?? fallback.exitDirection),
      holdMultiplier: clip.holdMultiplier,
      transitionInScale: clip.transitionInScale,
      playbackEndAt: clip.playbackEndAt,
      reverse: clip.reverse,
      textRevealSpeed: clip.textRevealSpeed,
      line: fallback.line,
      fragments: fallback.fragments,
    });
  });
  return normalized.length ? normalized : defaultScenes;
}

export function normalizeRuntimeConfig(config: DepthSceneConfig): SceneConfig {
  return {
    scenes: normalizeSceneConfig(config),
    densityScale: clampNumber(config.densityScale, 0.5, 3, defaultDensityScale),
    transitionSpeed: clampNumber(config.transitionSpeed, 0.015, 3, defaultTransitionSpeed),
  };
}

export async function loadDepthSceneConfig(): Promise<SceneConfig> {
  const response = await fetch(`/dotmorph-assets/depth-scenes.json?ts=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`depth scene config ${response.status}`);
  return normalizeRuntimeConfig((await response.json()) as DepthSceneConfig);
}

export const defaultSceneConfig: SceneConfig = {
  scenes: defaultScenes,
  densityScale: defaultDensityScale,
  transitionSpeed: defaultTransitionSpeed,
};
