export type DirectionName = "left" | "right" | "top" | "bottom" | "auto";

export type Scene = {
  id: string;
  clipSrc: string;
  duration: number;
  depthGamma?: number;
  depthGammaEnd?: number | null;
  enterDirection?: DirectionName;
  exitDirection?: DirectionName;
  holdMultiplier?: number;
  transitionInScale?: number;
  playbackEndAt?: number;
  reverse?: boolean;
  textRevealSpeed?: number;
  line: string;
  fragments: string[];
};

export type SceneConfig = {
  scenes: Scene[];
  densityScale: number;
  transitionSpeed: number;
};

export type SceneState = {
  index: number;
  local: number;
  morph: number;
  progress: number;
  phaseType: "play" | "transition";
};
