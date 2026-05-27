import { type HudState, type TerrainProfileSlice } from "./gameTypes";

export const WIDTH = 1644;
export const HEIGHT = 1080;
export const GROUND_Y = 906;
export const PLAYER_RADIUS = 36;
export const TARGET_SCORE = 10000;
export const SCORE_BASE_RATE = 4;
export const SCORE_SPEED_FACTOR = 0.012;
export const COIN_SCORE = 12;
export const ROCKET_SCORE = 36;
export const COIN_RADIUS = 22;
export const COIN_MAGNET_RADIUS = 286;
export const COIN_COLLECT_PADDING = 52;
export const COIN_MAX_FLOAT_FROM_PLAYER = 26;
export const COIN_MAX_PLATFORM_FLOAT_FROM_PLAYER = 32;
export const JUMP_VELOCITY = -800;
export const JUMP_BUFFER_MS = 140;
export const COYOTE_TIME_MS = 120;
export const PIT_DAMAGE_Y = GROUND_Y + 48;
export const SIDE_YAW = Math.PI * 0.38;
export const INTRO_CHICKEN_Y = 356;
export const DEFAULT_CHICKEN_MODEL_URL = "/game/1/Chicken/Meshy_AI_Flying_Chicken_biped_Meshy_AI_Meshy_Merged_Animations.glb";
export const STORAGE_KEY = "hit-10k-game-1-best-score";
export const TERRAIN_CYCLE = 5200;
export const TERRAIN_PROFILE: ReadonlyArray<TerrainProfileSlice> = [
  { start: 0, width: 1320, height: 0 },
  { start: 1320, width: 250, height: 56 },
  { start: 1570, width: 340, height: 0 },
  { start: 1910, width: 210, height: null },
  { start: 2120, width: 540, height: 0 },
  { start: 2660, width: 330, height: 76 },
  { start: 2990, width: 260, height: 76 },
  { start: 3250, width: 260, height: null },
  { start: 3510, width: 640, height: 0 },
  { start: 4150, width: 360, height: 58 },
  { start: 4510, width: 360, height: 0 },
  { start: 4870, width: 210, height: null },
  { start: 5080, width: 120, height: 0 },
] as const;

export const INITIAL_HUD: HudState = {
  phase: "ready",
  score: 0,
  lives: 3,
  bestScore: 0,
  rocketFuel: 0,
  progress: 0,
  scorePulse: false,
  hurtFlash: false,
};
