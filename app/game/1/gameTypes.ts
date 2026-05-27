import * as THREE from "three";

export type GamePhase = "ready" | "playing" | "paused";
export type PickupKind = "coin" | "rocket";
export type ObstacleKind = "crate" | "spike";
export type ThemeMode = "day" | "night";
export type ChickenAnimationMode = "idle" | "landing-call" | "jump" | "boost" | "run";
export type TerrainProfileSlice = { start: number; width: number; height: number | null };

export type InputState = {
  left: boolean;
  right: boolean;
  thrust: boolean;
};

export type PlayerState = {
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  hurtUntil: number;
  floorY: number;
  jumpStartedAt: number;
  jumpQueuedUntil: number;
  lastGroundedAt: number;
  landedAt: number;
};

export type Pickup = {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  radius: number;
  spin: number;
  collected: boolean;
};

export type Obstacle = {
  id: number;
  kind: ObstacleKind;
  x: number;
  y: number;
  width: number;
  height: number;
  hit: boolean;
};

export type Spark = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: string;
};

export type CoinCollectEffect = {
  id: number;
  fromX: number;
  fromY: number;
  startedAt: number;
  duration: number;
  value: number;
};

export type CoinAssets = {
  geometry: THREE.CylinderGeometry;
  materials: [THREE.MeshStandardMaterial, THREE.MeshStandardMaterial, THREE.MeshStandardMaterial];
  texture: THREE.CanvasTexture;
};

export type RocketPickupModel = {
  root: THREE.Group;
  flame: THREE.Mesh;
};

export type ObstacleModel = {
  root: THREE.Group;
  kind: ObstacleKind;
};

export type LoadedChickenModel = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

export type ChickenGlbRuntime = {
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  currentAction: THREE.AnimationAction | null;
  currentMode: ChickenAnimationMode | null;
  model: THREE.Group;
  clipCount: number;
};

export type GameStore = {
  phase: GamePhase;
  player: PlayerState;
  pickups: Pickup[];
  obstacles: Obstacle[];
  sparks: Spark[];
  coinEffects: CoinCollectEffect[];
  input: InputState;
  lastFrame: number;
  runTime: number;
  score: number;
  lives: number;
  bestScore: number;
  speed: number;
  rocketFuel: number;
  nextCoinAt: number;
  nextObstacleAt: number;
  nextRocketAt: number;
  spawnId: number;
  shake: number;
  damageFlashUntil: number;
  bestBeatUntil: number;
  lastHudAt: number;
  landingUntil: number;
  launchStartAt: number;
  theme: ThemeMode;
  worldOffset: number;
  terrainMeshCount: number;
  terrainPieceCount: number;
  coinMeshCount: number;
  coinEffectMeshCount: number;
  obstacleMeshCount: number;
  titleCoinVisible: boolean;
  chickenModelSource: "procedural" | "glb";
  chickenAnimationClip: string | null;
  chickenAnimationClipCount: number;
};

export type HudState = {
  phase: GamePhase;
  score: number;
  lives: number;
  bestScore: number;
  rocketFuel: number;
  progress: number;
  scorePulse: boolean;
  hurtFlash: boolean;
};

export type GameDebugSnapshot = {
  phase: GamePhase;
  score: number;
  runTime: number;
  speed: number;
  lives: number;
  player: Pick<PlayerState, "x" | "y" | "grounded" | "floorY">;
  chickenAnimation: {
    mode: ChickenAnimationMode;
    airborne: boolean;
    landingCall: number;
    jumpKick: number;
    landImpact: number;
    modelSource: "procedural" | "glb";
    clip: string | null;
    clipCount: number;
  };
  coinBounds: {
    maxGroundFloat: number;
    maxPlatformFloat: number;
    collectRadius: number;
    magnetRadius: number;
  };
  coins: Array<{
    x: number;
    y: number;
    floorY: number;
    floatFromPlayerTop: number;
    maxFloat: number;
    withinReach: boolean;
    magnetActive: boolean;
  }>;
  obstacles: Array<{ kind: ObstacleKind; x: number; y: number; floorY: number | null; width: number; height: number }>;
  terrainProfile: ReadonlyArray<TerrainProfileSlice>;
  terrain3d: {
    visibleBands: number;
    meshCount: number;
    pieceCount: number;
    modelKind: "single-extruded-geometry";
    hasTexture: boolean;
  };
  obstacle3d: {
    activeMeshes: number;
    usesCanvas2D: boolean;
  };
  coin3d: {
    sharedModelName: string;
    activeCollectibleMeshes: number;
    activeCollectEffectMeshes: number;
    titleCoinVisible: boolean;
  };
  rocket: {
    fuel: number;
    visibleOnCharacter: boolean;
    thrusting: boolean;
    activePickupCount: number;
    pickups: Array<{ x: number; y: number }>;
  };
};

declare global {
  interface Window {
    __hit10kDebug?: GameDebugSnapshot;
  }
}
