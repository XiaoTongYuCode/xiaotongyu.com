"use client";

import { type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import styles from "./GameOne.module.css";

type GamePhase = "ready" | "playing" | "paused";
type PickupKind = "coin" | "rocket";
type ObstacleKind = "crate" | "spike";
type ThemeMode = "day" | "night";
type ChickenAnimationMode = "idle" | "landing-call" | "jump" | "boost" | "run";

type InputState = {
  left: boolean;
  right: boolean;
  thrust: boolean;
};

type PlayerState = {
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

type Pickup = {
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  radius: number;
  spin: number;
  collected: boolean;
};

type Obstacle = {
  id: number;
  kind: ObstacleKind;
  x: number;
  y: number;
  width: number;
  height: number;
  hit: boolean;
};

type Spark = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  color: string;
};

type CoinCollectEffect = {
  id: number;
  fromX: number;
  fromY: number;
  startedAt: number;
  duration: number;
  value: number;
};

type CoinAssets = {
  geometry: THREE.CylinderGeometry;
  materials: [THREE.MeshStandardMaterial, THREE.MeshStandardMaterial, THREE.MeshStandardMaterial];
  texture: THREE.CanvasTexture;
};

type RocketPickupModel = {
  root: THREE.Group;
  flame: THREE.Mesh;
};

type ObstacleModel = {
  root: THREE.Group;
  kind: ObstacleKind;
};

type LoadedChickenModel = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

type ChickenGlbRuntime = {
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  currentAction: THREE.AnimationAction | null;
  currentMode: ChickenAnimationMode | null;
  model: THREE.Group;
  clipCount: number;
};

type GameStore = {
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

type HudState = {
  phase: GamePhase;
  score: number;
  lives: number;
  bestScore: number;
  rocketFuel: number;
  progress: number;
  scorePulse: boolean;
  hurtFlash: boolean;
};

type GameDebugSnapshot = {
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
  terrainProfile: typeof TERRAIN_PROFILE;
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

const WIDTH = 1644;
const HEIGHT = 1080;
const GROUND_Y = 906;
const PLAYER_RADIUS = 36;
const TARGET_SCORE = 10000;
const SCORE_BASE_RATE = 4;
const SCORE_SPEED_FACTOR = 0.012;
const COIN_SCORE = 12;
const ROCKET_SCORE = 36;
const COIN_RADIUS = 22;
const COIN_MAGNET_RADIUS = 286;
const COIN_COLLECT_PADDING = 52;
const COIN_MAX_FLOAT_FROM_PLAYER = 26;
const COIN_MAX_PLATFORM_FLOAT_FROM_PLAYER = 32;
const JUMP_VELOCITY = -800;
const JUMP_BUFFER_MS = 140;
const COYOTE_TIME_MS = 120;
const SIDE_YAW = Math.PI * 0.38;
const INTRO_CHICKEN_Y = 356;
const DEFAULT_CHICKEN_MODEL_URL = "/game/1/Chicken/Meshy_AI_Flying_Chicken_biped_Meshy_AI_Meshy_Merged_Animations.glb";
const STORAGE_KEY = "hit-10k-game-1-best-score";
const TERRAIN_CYCLE = 5200;
const TERRAIN_PROFILE: ReadonlyArray<{ start: number; width: number; height: number | null }> = [
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

const INITIAL_HUD: HudState = {
  phase: "ready",
  score: 0,
  lives: 3,
  bestScore: 0,
  rocketFuel: 0,
  progress: 0,
  scorePulse: false,
  hurtFlash: false,
};

function createStore(bestScore = 0, theme: ThemeMode = "day"): GameStore {
  return {
    phase: "ready",
    player: {
      x: 766,
      y: GROUND_Y - PLAYER_RADIUS,
      vy: 0,
      grounded: true,
      hurtUntil: 0,
      floorY: GROUND_Y,
      jumpStartedAt: 0,
      jumpQueuedUntil: 0,
      lastGroundedAt: 0,
      landedAt: 0,
    },
    pickups: [],
    obstacles: [],
    sparks: [],
    coinEffects: [],
    input: {
      left: false,
      right: false,
      thrust: false,
    },
    lastFrame: 0,
    runTime: 0,
    score: 0,
    lives: 3,
    bestScore,
    speed: 620,
    rocketFuel: 0,
    nextCoinAt: 0.8,
    nextObstacleAt: 5.8,
    nextRocketAt: 3.2,
    spawnId: 1,
    shake: 0,
    damageFlashUntil: 0,
    bestBeatUntil: 0,
    lastHudAt: 0,
    landingUntil: 0,
    launchStartAt: 0,
    theme,
    worldOffset: 0,
    terrainMeshCount: 0,
    terrainPieceCount: 0,
    coinMeshCount: 0,
    coinEffectMeshCount: 0,
    obstacleMeshCount: 0,
    titleCoinVisible: false,
    chickenModelSource: "procedural",
    chickenAnimationClip: null,
    chickenAnimationClipCount: 0,
  };
}

function createHud(store: GameStore): HudState {
  const now = typeof performance === "undefined" ? 0 : performance.now();
  return {
    phase: store.phase,
    score: Math.floor(store.score),
    lives: store.lives,
    bestScore: Math.floor(store.bestScore),
    rocketFuel: store.rocketFuel,
    progress: clamp(store.score / TARGET_SCORE, 0, 1),
    scorePulse: now < store.bestBeatUntil,
    hurtFlash: now < store.damageFlashUntil,
  };
}

function createDebugSnapshot(store: GameStore): GameDebugSnapshot {
  const animation = getChickenAnimationState(store, performance.now());
  return {
    phase: store.phase,
    score: store.score,
    runTime: store.runTime,
    speed: store.speed,
    lives: store.lives,
    player: {
      x: store.player.x,
      y: store.player.y,
      grounded: store.player.grounded,
      floorY: store.player.floorY,
    },
    chickenAnimation: {
      mode: animation.mode,
      airborne: animation.airborne,
      landingCall: animation.landingCall,
      jumpKick: animation.jumpKick,
      landImpact: animation.landImpact,
      modelSource: store.chickenModelSource,
      clip: store.chickenAnimationClip,
      clipCount: store.chickenAnimationClipCount,
    },
    coinBounds: {
      maxGroundFloat: COIN_MAX_FLOAT_FROM_PLAYER,
      maxPlatformFloat: COIN_MAX_PLATFORM_FLOAT_FROM_PLAYER,
      collectRadius: PLAYER_RADIUS + COIN_RADIUS + COIN_COLLECT_PADDING,
      magnetRadius: COIN_MAGNET_RADIUS,
    },
    coins: store.pickups
      .filter((pickup) => pickup.kind === "coin")
      .map((pickup) => {
        const range = getCoinReachableRange(store, pickup.x);
        const floatFromPlayerTop = range.floorY - PLAYER_RADIUS - pickup.y;
        const magnetActive = Math.hypot(pickup.x - store.player.x, pickup.y - store.player.y) < COIN_MAGNET_RADIUS;
        return {
          x: pickup.x,
          y: pickup.y,
          floorY: range.floorY,
          floatFromPlayerTop,
          maxFloat: range.maxFloat,
          withinReach: floatFromPlayerTop <= range.maxFloat + 0.5 && pickup.y <= range.maxY + 0.5,
          magnetActive,
        };
      }),
    obstacles: store.obstacles.map((obstacle) => ({
      kind: obstacle.kind,
      x: obstacle.x,
      y: obstacle.y,
      floorY: findStableSurfaceAtScreenX(store, obstacle.x, obstacle.width),
      width: obstacle.width,
      height: obstacle.height,
    })),
    terrainProfile: TERRAIN_PROFILE,
    terrain3d: {
      visibleBands: getTerrainBands(store).length,
      meshCount: store.terrainMeshCount,
      pieceCount: store.terrainPieceCount,
      modelKind: "single-extruded-geometry",
      hasTexture: false,
    },
    obstacle3d: {
      activeMeshes: store.obstacleMeshCount,
      usesCanvas2D: false,
    },
    coin3d: {
      sharedModelName: "shared-rotating-coin-model",
      activeCollectibleMeshes: store.coinMeshCount,
      activeCollectEffectMeshes: store.coinEffectMeshCount,
      titleCoinVisible: store.titleCoinVisible,
    },
    rocket: {
      fuel: store.rocketFuel,
      visibleOnCharacter: store.phase === "playing" && store.rocketFuel > 0,
      thrusting: store.phase === "playing" && store.input.thrust && store.rocketFuel > 0,
      activePickupCount: store.pickups.filter((pickup) => pickup.kind === "rocket").length,
      pickups: store.pickups
        .filter((pickup) => pickup.kind === "rocket")
        .map((pickup) => ({ x: pickup.x, y: pickup.y })),
    },
  };
}

function canExposeDebugSnapshot() {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1")
  );
}

function syncDebugSnapshot(store: GameStore) {
  if (!canExposeDebugSnapshot()) return;
  const snapshot = createDebugSnapshot(store);
  window.__hit10kDebug = snapshot;
  document.documentElement.dataset.hit10kDebug = JSON.stringify(snapshot);
}

function clearDebugSnapshot() {
  if (!canExposeDebugSnapshot()) return;
  delete window.__hit10kDebug;
  delete document.documentElement.dataset.hit10kDebug;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getChickenAnimationState(store: GameStore, now: number) {
  const isLanding = store.phase === "playing" && store.landingUntil > now;
  const boosting = store.phase === "playing" && !isLanding && store.rocketFuel > 0;
  const airborne = store.phase === "ready" || isLanding || !store.player.grounded || boosting;
  const jumpAge = store.player.jumpStartedAt > 0 ? (now - store.player.jumpStartedAt) / 1000 : 99;
  const jumpStretch = Math.max(0, 1 - jumpAge / 0.42);
  const timedJumpKick = Math.sin(clamp(jumpAge / 0.28, 0, 1) * Math.PI) * jumpStretch;
  const velocityJumpKick = !store.player.grounded ? clamp(-store.player.vy / Math.abs(JUMP_VELOCITY), 0, 1) * 0.86 : 0;
  const airborneLift = !store.player.grounded
    ? clamp((store.player.floorY - PLAYER_RADIUS - store.player.y) / 170, 0, 1) * 0.62
    : 0;
  const jumpKick = Math.max(timedJumpKick, velocityJumpKick, airborneLift);
  const landAge = store.player.landedAt > 0 ? (now - store.player.landedAt) / 1000 : 99;
  const landImpact = Math.sin(clamp(landAge / 0.22, 0, 1) * Math.PI) * Math.max(0, 1 - landAge / 0.28);
  let landingCall = 0;
  if (isLanding) {
    const duration = Math.max(1, store.landingUntil - store.launchStartAt);
    const t = clamp((now - store.launchStartAt) / duration, 0, 1);
    landingCall = Math.sin(clamp((t - 0.18) / 0.62, 0, 1) * Math.PI);
  }

  let mode: ChickenAnimationMode = "run";
  if (store.phase === "ready") {
    mode = "idle";
  } else if (isLanding) {
    mode = "landing-call";
  } else if (boosting) {
    mode = "boost";
  } else if (!store.player.grounded || isLanding) {
    mode = "jump";
  }

  return { mode, isLanding, boosting, airborne, jumpKick, landImpact, landingCall };
}

function positiveModulo(value: number, modulus: number) {
  return ((value % modulus) + modulus) % modulus;
}

function getTerrainProfileAtWorldX(worldX: number) {
  const localX = positiveModulo(worldX, TERRAIN_CYCLE);
  for (const slice of TERRAIN_PROFILE) {
    if (localX >= slice.start && localX < slice.start + slice.width) {
      return slice;
    }
  }
  return TERRAIN_PROFILE[0];
}

function getTerrainFloorAtScreenX(store: GameStore, screenX: number) {
  const worldX = store.worldOffset + screenX;
  const terrain = getTerrainProfileAtWorldX(worldX);
  if (terrain.height === null) {
    return null;
  }
  return GROUND_Y - terrain.height;
}

function getNearestSolidFloorAtScreenX(store: GameStore, screenX: number) {
  const directFloor = getTerrainFloorAtScreenX(store, screenX);
  if (directFloor !== null) return directFloor;

  for (let distance = 28; distance <= 420; distance += 28) {
    const forwardFloor = getTerrainFloorAtScreenX(store, screenX + distance);
    if (forwardFloor !== null) return forwardFloor;
    const backwardFloor = getTerrainFloorAtScreenX(store, screenX - distance);
    if (backwardFloor !== null) return backwardFloor;
  }
  return GROUND_Y;
}

function findStableSurfaceAtScreenX(store: GameStore, screenX: number, width: number) {
  const margin = Math.max(22, width * 0.22);
  const probes = [screenX - margin, screenX, screenX + width * 0.45, screenX + width * 0.9, screenX + width + margin];
  const floors = probes.map((probe) => getTerrainFloorAtScreenX(store, probe));
  if (floors.some((floor) => floor === null)) return null;
  const firstFloor = floors[0];
  if (firstFloor === null) return null;
  if (floors.some((floor) => floor !== firstFloor)) return null;
  return firstFloor;
}

function findFutureStableSurface(store: GameStore, baseX: number, width: number) {
  for (let offset = 0; offset <= 780; offset += 42) {
    const x = baseX + offset;
    const floorY = findStableSurfaceAtScreenX(store, x, width);
    if (floorY !== null) {
      return { x, floorY };
    }
  }
  const fallbackX = baseX + 260;
  return { x: fallbackX, floorY: getNearestSolidFloorAtScreenX(store, fallbackX) };
}

function findSolidFloorFromScreenX(store: GameStore, screenX: number, direction: -1 | 1) {
  for (let distance = 0; distance <= 520; distance += 24) {
    const x = screenX + distance * direction;
    const floorY = getTerrainFloorAtScreenX(store, x);
    if (floorY !== null) {
      return { x, floorY };
    }
  }
  return { x: screenX, floorY: GROUND_Y };
}

function getCoinGuideY(store: GameStore, screenX: number, index: number, count: number) {
  const floorY = getTerrainFloorAtScreenX(store, screenX);
  if (floorY === null) {
    const left = findSolidFloorFromScreenX(store, screenX, -1);
    const right = findSolidFloorFromScreenX(store, screenX, 1);
    const span = Math.max(1, right.x - left.x);
    const progress = clamp((screenX - left.x) / span, 0, 1);
    const arc = Math.sin(progress * Math.PI);
    const baseFloor = Math.min(left.floorY, right.floorY);
    return baseFloor - PLAYER_RADIUS - 4 - arc * 24;
  }

  const aheadFloor = getTerrainFloorAtScreenX(store, screenX + 116);
  const behindFloor = getTerrainFloorAtScreenX(store, screenX - 116);
  const approachingGap = aheadFloor === null || behindFloor === null;
  const approachingStep =
    (aheadFloor !== null && aheadFloor < floorY - 28) ||
    (behindFloor !== null && behindFloor < floorY - 28);
  const groupProgress = count <= 1 ? 0 : index / (count - 1);
  const routeArc = Math.sin(groupProgress * Math.PI) * (approachingGap ? 22 : approachingStep ? 16 : 4);
  const floorLift = floorY < GROUND_Y ? 3 : 0;
  return floorY - PLAYER_RADIUS - floorLift - routeArc;
}

function getCoinReachableRange(store: GameStore, screenX: number) {
  const floorY = getNearestSolidFloorAtScreenX(store, screenX);
  const maxFloat = floorY < GROUND_Y ? COIN_MAX_PLATFORM_FLOAT_FROM_PLAYER : COIN_MAX_FLOAT_FROM_PLAYER;
  return {
    floorY,
    minY: floorY - PLAYER_RADIUS - maxFloat,
    maxY: floorY - PLAYER_RADIUS + 2,
    maxFloat,
  };
}

function clampCoinToReachableRange(store: GameStore, pickup: Pickup) {
  const range = getCoinReachableRange(store, pickup.x);
  pickup.y = clamp(pickup.y, range.minY, range.maxY);
  return range;
}

function getLandingFloorAtScreenX(store: GameStore, screenX: number, previousBottom: number, currentBottom: number) {
  const terrainFloor = getTerrainFloorAtScreenX(store, screenX);
  if (terrainFloor === null) {
    return null;
  }
  const canLandOnPlatform =
    terrainFloor < GROUND_Y &&
    previousBottom <= terrainFloor + 7 &&
    currentBottom >= terrainFloor;
  const stayingOnPlatform =
    store.player.grounded &&
    store.player.floorY === terrainFloor &&
    terrainFloor < GROUND_Y &&
    currentBottom >= terrainFloor - 12;

  if (canLandOnPlatform || stayingOnPlatform) {
    return terrainFloor;
  }
  return GROUND_Y;
}

function getVisibleTerrainBlocks(store: GameStore) {
  const blocks: Array<{ x: number; y: number; width: number; height: number }> = [];
  const cycleBase = Math.floor(store.worldOffset / TERRAIN_CYCLE) * TERRAIN_CYCLE;
  for (let repeat = -1; repeat <= 2; repeat += 1) {
    for (const slice of TERRAIN_PROFILE) {
      if (slice.height === null || slice.height <= 0) continue;
      const worldX = cycleBase + repeat * TERRAIN_CYCLE + slice.start;
      const x = worldX - store.worldOffset;
      if (x > WIDTH + 120 || x + slice.width < -120) continue;
      blocks.push({
        x,
        y: GROUND_Y - slice.height,
        width: slice.width,
        height: slice.height,
      });
    }
  }
  return blocks;
}

function getVisibleTerrainGaps(store: GameStore) {
  const gaps: Array<{ x: number; width: number }> = [];
  const cycleBase = Math.floor(store.worldOffset / TERRAIN_CYCLE) * TERRAIN_CYCLE;
  for (let repeat = -1; repeat <= 2; repeat += 1) {
    for (const slice of TERRAIN_PROFILE) {
      if (slice.height !== null) continue;
      const worldX = cycleBase + repeat * TERRAIN_CYCLE + slice.start;
      const x = worldX - store.worldOffset;
      if (x > WIDTH + 120 || x + slice.width < -120) continue;
      gaps.push({ x, width: slice.width });
    }
  }
  return gaps;
}

function getVisibleTerrainSlices(store: GameStore) {
  const slices: Array<{ x: number; width: number; height: number | null }> = [];
  const cycleBase = Math.floor(store.worldOffset / TERRAIN_CYCLE) * TERRAIN_CYCLE;
  for (let repeat = -1; repeat <= 2; repeat += 1) {
    for (const slice of TERRAIN_PROFILE) {
      const worldX = cycleBase + repeat * TERRAIN_CYCLE + slice.start;
      const x = worldX - store.worldOffset;
      if (x > WIDTH + 120 || x + slice.width < -120) continue;
      slices.push({ x, width: slice.width, height: slice.height });
    }
  }
  return slices.sort((a, b) => a.x - b.x);
}

function getTerrainBands(store: GameStore) {
  const left = -80;
  const right = WIDTH + 80;
  const edges = new Set<number>([left, right]);

  for (const slice of getVisibleTerrainSlices(store)) {
    edges.add(clamp(slice.x, left, right));
    edges.add(clamp(slice.x + slice.width, left, right));
  }

  const sortedEdges = [...edges].sort((a, b) => a - b);
  const bands: Array<{ x: number; y: number; width: number; height: number }> = [];
  for (let i = 0; i < sortedEdges.length - 1; i += 1) {
    const x = sortedEdges[i];
    const width = sortedEdges[i + 1] - x;
    if (width <= 0.5) continue;
    const y = getTerrainFloorAtScreenX(store, x + width / 2);
    if (y === null) continue;
    bands.push({
      x,
      y,
      width,
      height: HEIGHT + 80 - y,
    });
  }
  return bands;
}

function mergeTerrainBands(bands: Array<{ x: number; y: number; width: number; height: number }>) {
  const merged: Array<{ x: number; y: number; width: number; height: number }> = [];
  for (const band of bands) {
    const previous = merged.at(-1);
    if (previous && Math.abs(previous.y - band.y) < 0.5 && Math.abs(previous.x + previous.width - band.x) < 0.5) {
      previous.width += band.width;
      previous.height = Math.max(previous.height, band.height);
    } else {
      merged.push({ ...band });
    }
  }
  return merged;
}

function circleRectHit(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  const nearestX = clamp(cx, rx, rx + rw);
  const nearestY = clamp(cy, ry, ry + rh);
  return Math.hypot(cx - nearestX, cy - nearestY) <= radius;
}

function pointInExpandedRect(x: number, y: number, radius: number, rx: number, ry: number, rw: number, rh: number) {
  return x >= rx - radius && x <= rx + rw + radius && y >= ry - radius && y <= ry + rh + radius;
}

function segmentCircleRectHit(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  const steps = Math.max(2, Math.ceil(Math.hypot(bx - ax, by - ay) / Math.max(6, radius * 0.42)));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    if (circleRectHit(lerp(ax, bx, t), lerp(ay, by, t), radius, rx, ry, rw, rh)) {
      return true;
    }
  }
  return false;
}

function sweptCircleRectHit(
  previousCx: number,
  previousCy: number,
  cx: number,
  cy: number,
  radius: number,
  previousRx: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  const sweepLeft = Math.min(previousRx, rx);
  const sweepWidth = rw + Math.abs(previousRx - rx);
  return (
    pointInExpandedRect(previousCx, previousCy, radius, sweepLeft, ry, sweepWidth, rh) ||
    pointInExpandedRect(cx, cy, radius, sweepLeft, ry, sweepWidth, rh) ||
    segmentCircleRectHit(previousCx, previousCy, cx, cy, radius, sweepLeft, ry, sweepWidth, rh)
  );
}

function makeSparkBurst(store: GameStore, x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const force = 70 + Math.random() * 190;
    store.sparks.push({
      id: store.spawnId + i,
      x,
      y,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force - 40,
      age: 0,
      life: 0.35 + Math.random() * 0.28,
      color,
    });
  }
  store.spawnId += count;
}

function spawnCoinRun(store: GameStore) {
  const baseX = WIDTH + 120;
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i += 1) {
    const x = baseX + i * 74;
    const reachable = getCoinReachableRange(store, x);
    const laneY = getCoinGuideY(store, x, i, count);
    store.pickups.push({
      id: store.spawnId,
      kind: "coin",
      x,
      y: clamp(laneY, reachable.minY, reachable.maxY),
      radius: COIN_RADIUS,
      spin: Math.random() * Math.PI * 2,
      collected: false,
    });
    store.spawnId += 1;
  }
}

function spawnObstacle(store: GameStore) {
  const kind: ObstacleKind = "spike";
  const size = { width: 72, height: 68 };
  const placement = findFutureStableSurface(store, WIDTH + 88, size.width);
  store.obstacles.push({
    id: store.spawnId,
    kind,
    x: placement.x,
    y: placement.floorY - size.height,
    width: size.width,
    height: size.height,
    hit: false,
  });
  store.spawnId += 1;
}

function spawnRocket(store: GameStore) {
  const placement = findFutureStableSurface(store, WIDTH + 150, 112);
  store.pickups.push({
    id: store.spawnId,
    kind: "rocket",
    x: placement.x + 42,
    y: placement.floorY - PLAYER_RADIUS - 36,
    radius: 36,
    spin: 0,
    collected: false,
  });
  store.spawnId += 1;
}

function startRun(store: GameStore, landingDuration = 0) {
  const bestScore = store.bestScore;
  const theme = store.theme;
  const chickenModelSource = store.chickenModelSource;
  const chickenAnimationClip = store.chickenAnimationClip;
  const chickenAnimationClipCount = store.chickenAnimationClipCount;
  const now = performance.now();
  Object.assign(store, createStore(bestScore, theme), {
    phase: "playing" as const,
    lastFrame: now,
    landingUntil: landingDuration > 0 ? now + landingDuration : 0,
    launchStartAt: now,
    chickenModelSource,
    chickenAnimationClip,
    chickenAnimationClipCount,
  });
}

function saveBestScore(score: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Math.floor(score)));
  } catch {
  }
}

function damagePlayer(store: GameStore, now: number, bounceVy = -360) {
  const player = store.player;
  if (now <= player.hurtUntil) return;
  store.lives = Math.max(1, store.lives - 1);
  store.shake = 1;
  store.damageFlashUntil = now + 620;
  player.hurtUntil = now + 1100;
  player.vy = bounceVy;
  player.grounded = false;
  makeSparkBurst(store, player.x, player.y, "#ff6d6d", 20);
}

function performJump(store: GameStore, now: number) {
  const player = store.player;
  player.vy = JUMP_VELOCITY;
  player.grounded = false;
  player.jumpStartedAt = now;
  player.jumpQueuedUntil = 0;
  player.lastGroundedAt = 0;
  makeSparkBurst(store, player.x - 8, player.y + 30, "#ffd25f", 7);
}

function canUseGroundedJump(player: PlayerState, now: number) {
  return player.grounded || (player.lastGroundedAt > 0 && now - player.lastGroundedAt <= COYOTE_TIME_MS);
}

function updateGame(store: GameStore, now: number) {
  if (store.phase !== "playing") {
    store.lastFrame = now;
    return;
  }

  const dt = Math.min(0.033, Math.max(0, (now - store.lastFrame) / 1000 || 0));
  store.lastFrame = now;
  if (store.landingUntil > now) {
    return;
  }
  store.runTime += dt;
  const boostingForward = store.rocketFuel > 0;
  const baseSpeed = Math.min(820, 620 + store.runTime * 5.0 + store.score / 1500);
  store.speed = boostingForward ? Math.min(1680, baseSpeed * 2.45) : baseSpeed;
  store.worldOffset += store.speed * dt;
  store.score += dt * (SCORE_BASE_RATE + store.speed * SCORE_SPEED_FACTOR);
  if (store.score > store.bestScore) {
    store.bestScore = store.score;
    store.bestBeatUntil = now + 260;
    saveBestScore(store.bestScore);
  }
  store.shake = Math.max(0, store.shake - dt * 3.2);

  const player = store.player;
  const previousPlayerX = player.x;
  const previousPlayerY = player.y;
  if (player.grounded) {
    player.lastGroundedAt = now;
  }

  const horizontalIntent = (store.input.right ? 1 : 0) - (store.input.left ? 1 : 0);
  player.x = clamp(player.x + horizontalIntent * dt * 330, 600, 930);

  if (player.jumpQueuedUntil >= now && canUseGroundedJump(player, now)) {
    performJump(store, now);
  }

  if (store.input.thrust && store.rocketFuel > 0) {
    player.vy -= 3450 * dt;
    player.vy = Math.max(player.vy, -1240);
    store.rocketFuel = Math.max(0, store.rocketFuel - dt * 0.42);
    makeSparkBurst(store, player.x - 40, player.y + 24, "#ff8a37", 2);
  } else {
    player.vy += 1760 * dt;
    if (store.rocketFuel > 0) {
      store.rocketFuel = Math.max(0, store.rocketFuel - dt * 0.2);
    }
  }

  const fallingBefore = player.vy > 180;
  const previousBottom = player.y + PLAYER_RADIUS;
  player.y += player.vy * dt;
  const currentBottom = player.y + PLAYER_RADIUS;
  const landingFloorY = getLandingFloorAtScreenX(store, player.x, previousBottom, currentBottom);
  const playerFloorY = landingFloorY === null ? Number.POSITIVE_INFINITY : landingFloorY - PLAYER_RADIUS;
  if (landingFloorY !== null && player.y >= playerFloorY) {
    player.y = playerFloorY;
    if (!player.grounded && fallingBefore) {
      player.landedAt = now;
      makeSparkBurst(store, player.x - 4, player.y + 32, "#d7b681", 5);
    }
    player.vy = 0;
    player.grounded = true;
    player.floorY = landingFloorY;
    player.lastGroundedAt = now;
    if (player.jumpQueuedUntil >= now) {
      performJump(store, now);
    }
  } else {
    player.grounded = false;
  }
  player.y = Math.max(180, player.y);

  if (player.y > HEIGHT + 80) {
    damagePlayer(store, now, -520);
    player.x = 706;
    player.y = getNearestSolidFloorAtScreenX(store, player.x) - PLAYER_RADIUS;
    player.floorY = getNearestSolidFloorAtScreenX(store, player.x);
    player.grounded = true;
    player.lastGroundedAt = now;
  }

  for (const block of getVisibleTerrainBlocks(store)) {
    if (
      player.floorY !== block.y &&
      circleRectHit(player.x, player.y, PLAYER_RADIUS * 0.62, block.x, block.y + 8, block.width, block.height - 8)
    ) {
      if (now > player.hurtUntil) {
        store.shake = 0.45;
        player.hurtUntil = now + 420;
        player.x = clamp(block.x - PLAYER_RADIUS * 0.9, 600, 930);
        player.vy = -520;
        player.grounded = false;
        makeSparkBurst(store, player.x, player.y + 16, "#ffd25f", 9);
      }
      break;
    }
  }

  if (store.runTime >= store.nextCoinAt) {
    spawnCoinRun(store);
    store.nextCoinAt = store.runTime + 1.55 + Math.random() * 0.85;
  }

  if (store.runTime >= store.nextObstacleAt) {
    spawnObstacle(store);
    store.nextObstacleAt = store.runTime + Math.max(3.8, 5.0 - store.runTime * 0.018 + Math.random() * 1.0);
  }

  if (store.runTime >= store.nextRocketAt) {
    spawnRocket(store);
    store.nextRocketAt = store.runTime + 6.4 + Math.random() * 2.8;
  }

  for (const pickup of store.pickups) {
    pickup.x -= store.speed * dt;
    pickup.spin += dt * (pickup.kind === "coin" ? 7.2 : 2.4);

    if (pickup.kind === "coin") {
      const reachable = clampCoinToReachableRange(store, pickup);
      const distance = Math.hypot(pickup.x - player.x, pickup.y - player.y);
      if (distance < COIN_MAGNET_RADIUS) {
        const pull = (1 - distance / COIN_MAGNET_RADIUS) * 9.2 * dt;
        pickup.x += (player.x - pickup.x) * pull;
        pickup.y += (player.y - pickup.y) * pull;
        if (distance > PLAYER_RADIUS + pickup.radius + COIN_COLLECT_PADDING) {
          pickup.y = Math.max(pickup.y, reachable.minY);
        }
      }
    }

    const hitRadius =
      pickup.kind === "coin" ? PLAYER_RADIUS + pickup.radius + COIN_COLLECT_PADDING : PLAYER_RADIUS + pickup.radius + 56;
    if (!pickup.collected && Math.hypot(pickup.x - player.x, pickup.y - player.y) < hitRadius) {
      pickup.collected = true;
      if (pickup.kind === "coin") {
        store.coinEffects.push({
          id: store.spawnId,
          fromX: pickup.x,
          fromY: pickup.y,
          startedAt: now,
          duration: 720,
          value: COIN_SCORE,
        });
        store.spawnId += 1;
        store.score += COIN_SCORE;
        if (store.score > store.bestScore) {
          store.bestScore = store.score;
          store.bestBeatUntil = now + 420;
          saveBestScore(store.bestScore);
        }
        makeSparkBurst(store, pickup.x, pickup.y, "#ffd25f", 12);
      } else {
        store.rocketFuel = 1;
        store.score += ROCKET_SCORE;
        if (store.score > store.bestScore) {
          store.bestScore = store.score;
          store.bestBeatUntil = now + 420;
          saveBestScore(store.bestScore);
        }
        makeSparkBurst(store, pickup.x, pickup.y, "#73d6ff", 18);
      }
    }
  }

  for (const obstacle of store.obstacles) {
    const previousObstacleX = obstacle.x;
    obstacle.x -= store.speed * dt;
    if (
      !obstacle.hit &&
      now > player.hurtUntil &&
      sweptCircleRectHit(
        previousPlayerX,
        previousPlayerY,
        player.x,
        player.y,
        PLAYER_RADIUS * 1.06,
        previousObstacleX,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
      )
    ) {
      obstacle.hit = true;
      damagePlayer(store, now);
    }
  }

  for (const spark of store.sparks) {
    spark.age += dt;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 420 * dt;
  }

  store.pickups = store.pickups.filter((pickup) => !pickup.collected && pickup.x > -100);
  store.obstacles = store.obstacles.filter((obstacle) => obstacle.x > -120);
  store.sparks = store.sparks.filter((spark) => spark.age < spark.life);
  store.coinEffects = store.coinEffects.filter((effect) => now - effect.startedAt < effect.duration + 360);

}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBackground(ctx: CanvasRenderingContext2D, store: GameStore) {
  const night = store.theme === "night" ? 1 : 0;
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, night > 0 ? `rgba(29, 20, 45, ${night})` : "#f3ce9f");
  sky.addColorStop(0.48, night > 0 ? `rgba(46, 31, 61, ${night})` : "#fff0cf");
  sky.addColorStop(1, night > 0 ? `rgba(28, 20, 44, ${night})` : "#fff9e6");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (night > 0) {
    ctx.fillStyle = "#201530";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const dusk = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    dusk.addColorStop(0, "rgba(27, 19, 44, 0.96)");
    dusk.addColorStop(0.62, "rgba(58, 39, 67, 0.96)");
    dusk.addColorStop(1, "rgba(24, 18, 37, 0.98)");
    ctx.fillStyle = dusk;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  ctx.save();
  ctx.globalAlpha = night > 0 ? 0.16 : 0.52;
  for (let i = 0; i < 5; i += 1) {
    const x = ((i * 310 + 130 - store.runTime * 24) % 1940) - 150;
    const y = 178 + (i % 3) * 44;
    ctx.fillStyle = night > 0 ? "#6c6078" : "#dce1de";
    drawRoundedRect(ctx, x, y, 108, 28, 16);
    ctx.fill();
    drawRoundedRect(ctx, x + 48, y - 22, 130, 52, 28);
    ctx.fill();
    drawRoundedRect(ctx, x + 126, y + 2, 108, 30, 17);
    ctx.fill();
  }
  ctx.restore();

  if (store.phase === "ready") {
    return;
  }

  ctx.fillStyle = night > 0 ? "#1c1430" : "#d3c0a2";
  ctx.beginPath();
  ctx.moveTo(-80, 814);
  ctx.bezierCurveTo(180, 772, 300, 806, 432, 822);
  ctx.bezierCurveTo(620, 840, 716, 706, 940, 718);
  ctx.bezierCurveTo(1134, 730, 1256, 816, 1720, 760);
  ctx.lineTo(WIDTH + 80, GROUND_Y + 80);
  ctx.lineTo(-80, GROUND_Y + 80);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = night > 0 ? "#140f25" : "#c9b18b";
  ctx.beginPath();
  ctx.moveTo(-80, 850);
  ctx.bezierCurveTo(160, 820, 310, 922, 492, 874);
  ctx.bezierCurveTo(720, 814, 854, 888, 1014, 854);
  ctx.bezierCurveTo(1200, 814, 1400, 900, 1720, 842);
  ctx.lineTo(WIDTH + 80, GROUND_Y + 68);
  ctx.lineTo(-80, GROUND_Y + 68);
  ctx.closePath();
  ctx.fill();
}

function getScoreTagTarget() {
  return { x: WIDTH - 178, y: 88 };
}

function drawCoinCollectFeedback(ctx: CanvasRenderingContext2D, store: GameStore, now: number) {
  if (store.coinEffects.length === 0) return;
  const target = getScoreTagTarget();
  ctx.save();
  for (const effect of store.coinEffects) {
    const rawT = clamp((now - effect.startedAt) / effect.duration, 0, 1);
    const arrivalT = clamp((rawT - 0.64) / 0.36, 0, 1);
    if (arrivalT <= 0) continue;
    const alpha = 1 - arrivalT;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#f0a51e";
    ctx.strokeStyle = "rgba(72, 41, 4, 0.28)";
    ctx.lineWidth = 3;
    ctx.font = "900 21px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const y = target.y - 22 - arrivalT * 30;
    ctx.strokeText(`+${effect.value}`, target.x + 38, y);
    ctx.fillText(`+${effect.value}`, target.x + 38, y);
  }
  ctx.restore();
}

function renderGame(ctx: CanvasRenderingContext2D, store: GameStore) {
  const now = performance.now();
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  if (store.shake > 0) {
    ctx.translate((Math.random() - 0.5) * store.shake * 14, (Math.random() - 0.5) * store.shake * 10);
  }
  drawBackground(ctx, store);
  if (store.phase === "ready") {
    ctx.restore();
    return;
  }
  for (const spark of store.sparks) {
    const alpha = 1 - spark.age / spark.life;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 2 + alpha * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  drawCoinCollectFeedback(ctx, store, now);
  ctx.restore();
}

function jumpOrThrust(store: GameStore) {
  if (store.phase !== "playing") return;
  const now = performance.now();
  store.input.thrust = true;
  store.player.jumpQueuedUntil = now + JUMP_BUFFER_MS;
  if (canUseGroundedJump(store.player, now)) {
    performJump(store, now);
  }
}

function makeToonMaterial(color: string, roughness = 0.82) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0,
    flatShading: true,
  });
}

function createRocketPickupModel(): RocketPickupModel {
  const root = new THREE.Group();
  root.name = "rocket-pickup-3d";

  const bodyMaterial = makeToonMaterial("#c12a2c", 0.68);
  const bandMaterial = makeToonMaterial("#fff4da", 0.72);
  const metalMaterial = makeToonMaterial("#2b2b2b", 0.58);
  const flameMaterial = makeToonMaterial("#ffb340", 0.56);
  const windowMaterial = makeToonMaterial("#6fd7ff", 0.5);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 1.72, 8), bodyMaterial);
  body.name = "rocket-pickup-body";
  body.rotation.x = Math.PI / 2;
  root.add(body);

  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.22, 8), bandMaterial);
  band.name = "rocket-pickup-band";
  band.rotation.x = Math.PI / 2;
  band.position.z = 0.16;
  root.add(band);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 8), metalMaterial);
  nose.name = "rocket-pickup-nose";
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 1.1;
  root.add(nose);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.28, 8), metalMaterial);
  nozzle.name = "rocket-pickup-nozzle";
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.z = -1.04;
  root.add(nozzle);

  const window = new THREE.Mesh(new THREE.DodecahedronGeometry(0.115, 0), windowMaterial);
  window.name = "rocket-pickup-window";
  window.position.set(0, 0.22, 0.35);
  window.scale.set(1, 0.36, 1);
  root.add(window);

  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8), flameMaterial);
  flame.name = "rocket-pickup-flame";
  flame.rotation.x = -Math.PI / 2;
  flame.position.z = -1.35;
  root.add(flame);

  const makeFin = (x: number) => {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 4), bandMaterial);
    fin.position.set(x, -0.16, -0.62);
    fin.rotation.set(Math.PI / 2, 0, Math.PI / 4);
    fin.scale.set(0.76, 0.92, 0.54);
    return fin;
  };
  root.add(makeFin(-0.23));
  root.add(makeFin(0.23));

  return { root, flame };
}

function createObstacleModel(kind: ObstacleKind): ObstacleModel {
  const root = new THREE.Group();
  root.name = `${kind}-obstacle-3d`;

  if (kind === "spike") {
    const spikeMaterial = makeToonMaterial("#2f343c", 0.72);
    const spikeSideMaterial = makeToonMaterial("#171b22", 0.82);
    const highlightMaterial = makeToonMaterial("#737984", 0.7);
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 4), [
      spikeSideMaterial,
      spikeMaterial,
    ]);
    spike.name = "spike-body";
    spike.rotation.y = Math.PI / 4;
    root.add(spike);

    const highlight = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.72, 3), highlightMaterial);
    highlight.name = "spike-highlight";
    highlight.position.set(0.12, 0.04, 0.28);
    highlight.rotation.set(0.1, -0.18, -0.18);
    highlight.scale.set(0.42, 0.9, 0.32);
    root.add(highlight);
  } else {
    const topMaterial = makeToonMaterial("#bd8750", 0.84);
    const frontMaterial = makeToonMaterial("#81502b", 0.9);
    const sideMaterial = makeToonMaterial("#593018", 0.92);
    const panelMaterial = makeToonMaterial("#4a240f", 0.96);
    const edgeMaterial = makeToonMaterial("#9b6538", 0.86);
    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.58), [
      sideMaterial,
      sideMaterial,
      topMaterial,
      frontMaterial,
      frontMaterial,
      sideMaterial,
    ]);
    box.name = "crate-body";
    root.add(box);

    const topLip = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.12, 0.62), edgeMaterial);
    topLip.name = "crate-top-lip";
    topLip.position.set(0, 0.42, 0.04);
    root.add(topLip);

    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.18, 0.03), panelMaterial);
    frontPanel.name = "crate-front-panel";
    frontPanel.position.set(0.02, -0.18, 0.31);
    root.add(frontPanel);

    const sidePanel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.032), panelMaterial);
    sidePanel.name = "crate-side-panel";
    sidePanel.position.set(0.48, -0.06, 0.03);
    sidePanel.rotation.y = Math.PI / 2;
    root.add(sidePanel);
  }

  return { root, kind };
}

function createChickenModel() {
  const root = new THREE.Group();
  root.name = "runner-chicken";

  const bodyMaterial = makeToonMaterial("#e3e8dc");
  const bellyMaterial = makeToonMaterial("#5f6860");
  const wingMaterial = makeToonMaterial("#d7ded6");
  const combMaterial = makeToonMaterial("#bd2325");
  const beakMaterial = makeToonMaterial("#c77a16");
  const eyeMaterial = makeToonMaterial("#070707", 0.55);
  const mouthInteriorMaterial = makeToonMaterial("#180b08", 0.72);
  const tongueMaterial = makeToonMaterial("#c93624", 0.66);
  const rocketBodyMaterial = makeToonMaterial("#c12a2c", 0.68);
  const rocketBandMaterial = makeToonMaterial("#fff4da", 0.72);
  const rocketMetalMaterial = makeToonMaterial("#2b2b2b", 0.58);
  const rocketFlameMaterial = makeToonMaterial("#ffb340", 0.56);

  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.96, 0), bodyMaterial);
  body.scale.set(1.08, 1.02, 0.92);
  body.position.y = -0.1;
  root.add(body);

  const lowerBodyShade = new THREE.Mesh(new THREE.DodecahedronGeometry(0.66, 0), bellyMaterial);
  lowerBodyShade.name = "lower-body-shade";
  lowerBodyShade.position.set(0, -0.6, 0.08);
  lowerBodyShade.scale.set(1.24, 0.42, 0.88);
  root.add(lowerBodyShade);

  const belly = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.68, 5), bellyMaterial);
  belly.name = "belly";
  belly.rotation.x = Math.PI;
  belly.position.set(0, -0.47, 0.43);
  belly.scale.set(1.2, 0.84, 0.36);
  root.add(belly);

  const flankFeathers = new THREE.Group();
  flankFeathers.name = "flank-feathers";
  const makeFlankFeather = (x: number, z: number, rotationZ: number) => {
    const feather = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 4), bellyMaterial);
    feather.position.set(x, -0.58, z);
    feather.rotation.set(Math.PI, 0, rotationZ);
    feather.scale.set(0.82, 0.78, 0.45);
    return feather;
  };
  flankFeathers.add(makeFlankFeather(-0.34, 0.42, -0.18));
  flankFeathers.add(makeFlankFeather(0.34, 0.42, 0.18));
  flankFeathers.visible = false;
  root.add(flankFeathers);

  const breastFeathers = new THREE.Group();
  breastFeathers.name = "breast-feathers";
  const makeBreastTriangle = (x: number, width: number, height: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(0, -height / 2);
    shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), bellyMaterial);
    mesh.position.set(x, -0.68, 0.62);
    mesh.rotation.x = -0.16;
    mesh.scale.set(0.78, 0.72, 1);
    return mesh;
  };
  breastFeathers.add(makeBreastTriangle(-0.28, 0.32, 0.36));
  breastFeathers.add(makeBreastTriangle(0, 0.38, 0.42));
  breastFeathers.add(makeBreastTriangle(0.28, 0.32, 0.36));
  root.add(breastFeathers);

  const leftWing = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), wingMaterial);
  leftWing.name = "left-wing";
  leftWing.scale.set(0.78, 1.42, 0.54);
  leftWing.position.set(-0.8, -0.06, 0.02);
  leftWing.rotation.z = 0.16;
  root.add(leftWing);

  const rightWing = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), wingMaterial);
  rightWing.name = "right-wing";
  rightWing.scale.set(0.78, 1.42, 0.54);
  rightWing.position.set(0.8, -0.06, 0.02);
  rightWing.rotation.z = -0.16;
  root.add(rightWing);

  const tail = new THREE.Group();
  tail.name = "tail";
  const makeTailFeather = (x: number, y: number, rotationZ: number) => {
    const feather = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), wingMaterial);
    feather.scale.set(0.82, 0.5, 1.26);
    feather.position.set(x, y, -0.76);
    feather.rotation.set(0.2, -0.32, rotationZ);
    return feather;
  };
  tail.add(makeTailFeather(-0.16, -0.3, -0.28));
  tail.add(makeTailFeather(0.02, -0.24, 0.04));
  tail.add(makeTailFeather(0.18, -0.31, 0.28));
  root.add(tail);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.31, 0.76, 4), beakMaterial);
  beak.name = "beak";
  beak.rotation.x = Math.PI / 2;
  beak.rotation.z = Math.PI / 4;
  beak.position.set(0, 0.12, 0.9);
  beak.scale.set(1.08, 0.74, 0.62);
  root.add(beak);

  const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.54, 4), beakMaterial);
  lowerBeak.name = "lower-beak";
  lowerBeak.rotation.x = Math.PI / 2;
  lowerBeak.rotation.z = Math.PI / 4;
  lowerBeak.position.set(0, -0.08, 0.87);
  lowerBeak.scale.set(0.86, 0.44, 0.46);
  root.add(lowerBeak);

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.035), mouthInteriorMaterial);
  mouth.name = "mouth";
  mouth.position.set(0, -0.01, 1.1);
  mouth.rotation.x = -0.12;
  mouth.scale.set(1, 0.74, 1);
  root.add(mouth);

  const tongue = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), tongueMaterial);
  tongue.name = "tongue";
  tongue.position.set(0, -0.08, 1.12);
  tongue.scale.set(1.24, 0.42, 0.5);
  root.add(tongue);

  const leftEye = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085, 0), eyeMaterial);
  leftEye.name = "left-eye";
  leftEye.position.set(-0.28, 0.38, 0.78);
  root.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085, 0), eyeMaterial);
  rightEye.name = "right-eye";
  rightEye.position.set(0.28, 0.38, 0.78);
  root.add(rightEye);

  const comb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), combMaterial);
  comb.name = "comb";
  comb.scale.set(0.86, 1.34, 0.62);
  comb.position.set(0.02, 0.94, -0.04);
  comb.rotation.set(-0.2, 0.08, -0.1);
  root.add(comb);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.54, 5), beakMaterial);
  leftLeg.name = "left-leg";
  leftLeg.position.set(-0.23, -0.88, 0.06);
  leftLeg.rotation.z = -0.2;
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.54, 5), beakMaterial);
  rightLeg.name = "right-leg";
  rightLeg.position.set(0.23, -0.88, 0.06);
  rightLeg.rotation.z = 0.2;
  root.add(rightLeg);

  const leftFoot = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.32, 4), beakMaterial);
  leftFoot.name = "left-foot";
  leftFoot.position.set(-0.25, -1.14, 0.2);
  leftFoot.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  leftFoot.scale.set(1.0, 0.92, 0.62);
  root.add(leftFoot);

  const rightFoot = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.32, 4), beakMaterial);
  rightFoot.name = "right-foot";
  rightFoot.position.set(0.25, -1.14, 0.2);
  rightFoot.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  rightFoot.scale.set(1.0, 0.92, 0.62);
  root.add(rightFoot);

  const callWaveMaterial = new THREE.MeshBasicMaterial({
    color: "#f5c55e",
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const callWave = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 6, 28), callWaveMaterial);
  callWave.name = "call-wave";
  callWave.position.set(0, -0.02, 1.38);
  callWave.rotation.x = Math.PI / 2;
  callWave.visible = false;
  root.add(callWave);

  const callWaveSecondary = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.01, 6, 28),
    callWaveMaterial.clone(),
  );
  callWaveSecondary.name = "call-wave-secondary";
  callWaveSecondary.position.set(0, -0.02, 1.42);
  callWaveSecondary.rotation.x = Math.PI / 2;
  callWaveSecondary.visible = false;
  root.add(callWaveSecondary);

  const rocket = new THREE.Group();
  rocket.name = "boost-rocket";
  rocket.visible = false;
  rocket.position.set(0, -1.08, -0.02);

  const rocketBody = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 1.72, 8), rocketBodyMaterial);
  rocketBody.name = "rocket-body";
  rocketBody.rotation.x = Math.PI / 2;
  rocket.add(rocketBody);

  const rocketBand = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.22, 8), rocketBandMaterial);
  rocketBand.name = "rocket-band";
  rocketBand.rotation.x = Math.PI / 2;
  rocketBand.position.z = 0.16;
  rocket.add(rocketBand);

  const rocketNose = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 8), rocketMetalMaterial);
  rocketNose.name = "rocket-nose";
  rocketNose.rotation.x = Math.PI / 2;
  rocketNose.position.z = 1.1;
  rocket.add(rocketNose);

  const rocketNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.28, 8), rocketMetalMaterial);
  rocketNozzle.name = "rocket-nozzle";
  rocketNozzle.rotation.x = Math.PI / 2;
  rocketNozzle.position.z = -1.04;
  rocket.add(rocketNozzle);

  const rocketFlame = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.58, 8), rocketFlameMaterial);
  rocketFlame.name = "rocket-flame";
  rocketFlame.rotation.x = -Math.PI / 2;
  rocketFlame.position.z = -1.42;
  rocket.add(rocketFlame);

  const makeRocketFin = (x: number) => {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 4), rocketBandMaterial);
    fin.position.set(x, -0.16, -0.62);
    fin.rotation.set(Math.PI / 2, 0, Math.PI / 4);
    fin.scale.set(0.76, 0.92, 0.54);
    return fin;
  };
  rocket.add(makeRocketFin(-0.23));
  rocket.add(makeRocketFin(0.23));
  root.add(rocket);

  return {
    root,
    parts: {
      body,
      lowerBodyShade,
      belly,
      flankFeathers,
      leftWing,
      rightWing,
      tail,
      leftLeg,
      rightLeg,
      leftFoot,
      rightFoot,
      comb,
      beak,
      lowerBeak,
      mouth,
      tongue,
      leftEye,
      rightEye,
      breastFeathers,
      callWave,
      callWaveSecondary,
      rocket,
      rocketFlame,
    },
  };
}

function createCoinTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(88, 70, 18, 128, 128, 116);
    gradient.addColorStop(0, "#fff8ba");
    gradient.addColorStop(0.5, "#ffbd25");
    gradient.addColorStop(1, "#b96a08");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(128, 128, 116, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(128, 70, 4, 0.38)";
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.fillStyle = "rgba(92, 48, 0, 0.66)";
    ctx.font = "bold 72px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AI", 128, 133);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createCoinAssets(): CoinAssets {
  const texture = createCoinTexture();
  const faceMaterial = new THREE.MeshStandardMaterial({
    color: "#ffc439",
    map: texture,
    roughness: 0.38,
    metalness: 0.32,
    flatShading: true,
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: "#c8790d",
    roughness: 0.48,
    metalness: 0.22,
    flatShading: true,
  });
  return {
    geometry: new THREE.CylinderGeometry(0.48, 0.48, 0.24, 32),
    materials: [edgeMaterial, faceMaterial, faceMaterial],
    texture,
  };
}

function createCoinModel(assets: CoinAssets) {
  const root = new THREE.Group();
  root.name = "shared-rotating-coin-model";
  const coin = new THREE.Mesh(assets.geometry, assets.materials);
  coin.name = "shared-rotating-coin-mesh";
  coin.rotation.x = Math.PI / 2;
  root.add(coin);
  return root;
}

function disposeCoinAssets(assets: CoinAssets) {
  assets.geometry.dispose();
  assets.texture.dispose();
  for (const material of assets.materials) {
    material.dispose();
  }
}

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) {
          value.dispose();
        }
      }
      material.dispose();
    }
  });
}

async function loadOptionalChickenModel() {
  try {
    const manifest = await fetch("/game/1/chicken-model.json");
    let url = DEFAULT_CHICKEN_MODEL_URL;
    if (manifest.ok) {
      const data = await manifest.json() as { url?: unknown };
      if (typeof data.url === "string" && data.url) {
        url = data.url;
      }
    }
    const gltf = await new GLTFLoader().loadAsync(url);
    return {
      scene: gltf.scene,
      animations: gltf.animations,
    };
  } catch {
    return null;
  }
}

function prepareLoadedChickenModel(model: THREE.Group) {
  model.name = "loaded-chicken-glb";
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.frustumCulled = false;
    child.castShadow = false;
    child.receiveShadow = false;
  });

  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  if (size.y <= 0) return;

  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 2.26 / size.y;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale - 1.12, -center.z * scale);
}

function getChickenClipName(mode: ChickenAnimationMode, clipNames: string[]) {
  const patternsByMode: Record<ChickenAnimationMode, string[]> = {
    idle: ["idle"],
    "landing-call": ["idle"],
    jump: ["run"],
    boost: ["idle"],
    run: ["run"],
  };
  const patterns = patternsByMode[mode];
  const match = clipNames.find((clipName) => {
    const name = clipName.toLowerCase();
    return patterns.some((pattern) => name.includes(pattern.toLowerCase()));
  });
  return match ?? clipNames[0] ?? null;
}

function applyChickenGlbAnimation(runtime: ChickenGlbRuntime, mode: ChickenAnimationMode, store: GameStore, dt: number) {
  const clipName = getChickenClipName(mode, [...runtime.actions.keys()]);
  if (!clipName) {
    store.chickenAnimationClip = null;
    return;
  }

  if (runtime.currentMode !== mode) {
    const nextAction = runtime.actions.get(clipName);
    if (nextAction) {
      if (mode === "idle") {
        for (const action of runtime.actions.values()) {
          action.stop();
          action.enabled = false;
        }
      }
      nextAction.enabled = true;
      nextAction.reset();
      nextAction.setEffectiveTimeScale(mode === "run" || mode === "jump" ? 1.16 : 1);
      nextAction.setEffectiveWeight(1);
      nextAction.setLoop(THREE.LoopRepeat, Infinity);
      if (mode !== "idle" && runtime.currentAction && runtime.currentAction !== nextAction) {
        runtime.currentAction.crossFadeTo(nextAction, mode === "landing-call" ? 0.18 : 0.12, false);
      }
      nextAction.play();
      runtime.currentAction = nextAction;
      runtime.currentMode = mode;
    }
  } else if (runtime.currentAction) {
    runtime.currentAction.setEffectiveTimeScale(mode === "run" || mode === "jump" ? 1.16 : 1);
  }

  runtime.mixer.update(dt);
  store.chickenAnimationClip = clipName;
}

export default function GameOneClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeLayerRef = useRef<HTMLDivElement>(null);
  const titleCoinSlotRef = useRef<HTMLSpanElement>(null);
  const scorePillRef = useRef<HTMLButtonElement>(null);
  const storeRef = useRef<GameStore>(createStore());
  const lastHudPhaseRef = useRef<GamePhase>("ready");
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [launching, setLaunching] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gamePreloadReady, setGamePreloadReady] = useState(false);
  const [gameCanvasReady, setGameCanvasReady] = useState(false);
  const [gameModelReady, setGameModelReady] = useState(false);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameLoadProgress, setGameLoadProgress] = useState(0.08);

  const syncHud = useCallback(() => {
    const store = storeRef.current;
    lastHudPhaseRef.current = store.phase;
    setHud(createHud(store));
  }, []);

  const begin = useCallback(() => {
    if (launching) return;
    setLaunching(true);
    startRun(storeRef.current, 1500);
    syncHud();
    window.setTimeout(() => {
      setLaunching(false);
      syncHud();
    }, 1500);
  }, [launching, syncHud]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "day" ? "night" : "day";
      storeRef.current.theme = next;
      return next;
    });
  }, []);

  const togglePause = useCallback(() => {
    const store = storeRef.current;
    if (store.phase === "playing") {
      store.phase = "paused";
      store.input.thrust = false;
      syncHud();
      return;
    }
    if (store.phase === "paused") {
      store.phase = "playing";
      store.lastFrame = performance.now();
      syncHud();
      return;
    }
    begin();
  }, [begin, syncHud]);

  const resetRun = useCallback(() => {
    setLaunching(false);
    startRun(storeRef.current, 0);
    syncHud();
  }, [syncHud]);

  const openHowToPlay = useCallback(() => {
    if (storeRef.current.phase === "playing") {
      storeRef.current.phase = "paused";
      storeRef.current.input.thrust = false;
      syncHud();
    }
    setShowHowToPlay(true);
  }, [syncHud]);

  const openLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const preload = async () => {
      const resources = [
        "/game/1/chicken-model.json",
        DEFAULT_CHICKEN_MODEL_URL,
        "/xtyopen-logo.svg",
      ];
      let completed = 0;
      for (const resource of resources) {
        try {
          await fetch(resource, { cache: "force-cache" });
        } catch {
        }
        if (cancelled) return;
        completed += 1;
        setGameLoadProgress(Math.max(0.08, completed / resources.length * 0.72));
      }
      setGamePreloadReady(true);
    };
    void preload();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const readyCount = [gamePreloadReady, gameCanvasReady, gameModelReady].filter(Boolean).length;
    setGameLoadProgress((current) => Math.max(current, readyCount / 3));
    if (!gamePreloadReady || !gameCanvasReady || !gameModelReady) return undefined;
    const timer = window.setTimeout(() => {
      setGameLoadProgress(1);
      setGameLoading(false);
    }, 360);
    return () => window.clearTimeout(timer);
  }, [gameCanvasReady, gameModelReady, gamePreloadReady]);

  useEffect(() => {
    try {
      const storedBest = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
      if (Number.isFinite(storedBest)) {
        storeRef.current.bestScore = storedBest;
        syncHud();
      }
    } catch {
      syncHud();
    }
  }, [syncHud]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = WIDTH * ratio;
      canvas.height = HEIGHT * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    let frame = 0;
    const loop = (now: number) => {
      const store = storeRef.current;
      updateGame(store, now);
      renderGame(ctx, store);
      syncDebugSnapshot(store);
      if (now - store.lastHudAt > 80 || store.phase !== lastHudPhaseRef.current) {
        store.lastHudAt = now;
        lastHudPhaseRef.current = store.phase;
        setHud(createHud(store));
      }
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    renderGame(ctx, storeRef.current);
    syncDebugSnapshot(storeRef.current);
    setGameCanvasReady(true);
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      clearDebugSnapshot();
    };
  }, []);

  useEffect(() => {
    const host = threeLayerRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.HemisphereLight(0xfff7df, 0x5e6670, 2.2);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 2.7);
    key.position.set(-2.8, 4.4, 5.8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd6a1, 1.1);
    rim.position.set(3.4, 1.5, 2.3);
    scene.add(rim);

    const terrainGroup = new THREE.Group();
    terrainGroup.name = "terrain-3d-models";
    scene.add(terrainGroup);
    const terrainTopMaterial = new THREE.MeshStandardMaterial({
      color: "#c47a3a",
      roughness: 0.86,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainFrontMaterial = new THREE.MeshStandardMaterial({
      color: "#753012",
      roughness: 0.9,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainSideMaterial = new THREE.MeshStandardMaterial({
      color: "#3f190c",
      roughness: 0.92,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainShadeMaterial = new THREE.MeshStandardMaterial({
      color: "#5e260f",
      roughness: 0.92,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainLipMaterial = new THREE.MeshStandardMaterial({
      color: "#8b3d18",
      roughness: 0.88,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainRailMaterial = new THREE.MeshStandardMaterial({
      color: "#d08a4a",
      roughness: 0.8,
      metalness: 0,
      flatShading: false,
      side: THREE.DoubleSide,
    });
    const terrainDetailMaterial = new THREE.MeshStandardMaterial({
      color: "#421708",
      roughness: 0.96,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainFaceShadowMaterial = new THREE.MeshStandardMaterial({
      color: "#4c1d0c",
      roughness: 0.96,
      metalness: 0,
      flatShading: false,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    const terrainShadowMaterial = new THREE.MeshBasicMaterial({
      color: "#4a2a14",
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const terrainMaterials: THREE.Material[] = [
      terrainTopMaterial,
      terrainLipMaterial,
      terrainFrontMaterial,
      terrainSideMaterial,
      terrainShadeMaterial,
      terrainRailMaterial,
      terrainDetailMaterial,
      terrainFaceShadowMaterial,
    ];
    const terrainMesh = new THREE.Mesh(new THREE.BufferGeometry(), terrainMaterials);
    terrainMesh.name = "terrain-single-extruded-model";
    terrainMesh.renderOrder = -2;
    terrainGroup.add(terrainMesh);
    const terrainShadowMesh = new THREE.Mesh(new THREE.BufferGeometry(), terrainShadowMaterial);
    terrainShadowMesh.name = "terrain-contact-shadows";
    terrainShadowMesh.renderOrder = -1;
    terrainGroup.add(terrainShadowMesh);

    const chicken = createChickenModel();
    scene.add(chicken.root);
    const proceduralChickenParts: THREE.Object3D[] = [
      chicken.parts.body,
      chicken.parts.lowerBodyShade,
      chicken.parts.belly,
      chicken.parts.flankFeathers,
      chicken.parts.leftWing,
      chicken.parts.rightWing,
      chicken.parts.tail,
      chicken.parts.leftLeg,
      chicken.parts.rightLeg,
      chicken.parts.leftFoot,
      chicken.parts.rightFoot,
      chicken.parts.comb,
      chicken.parts.beak,
      chicken.parts.lowerBeak,
      chicken.parts.mouth,
      chicken.parts.tongue,
      chicken.parts.leftEye,
      chicken.parts.rightEye,
      chicken.parts.breastFeathers,
    ];
    let cancelledModelLoad = false;
    let chickenGlbRuntime: ChickenGlbRuntime | null = null;
    void loadOptionalChickenModel().then((loadedChicken) => {
      if (cancelledModelLoad) return;
      if (!loadedChicken) {
        setGameModelReady(true);
        return;
      }
      prepareLoadedChickenModel(loadedChicken.scene);
      chicken.root.add(loadedChicken.scene);
      const mixer = new THREE.AnimationMixer(loadedChicken.scene);
      const actions = new Map<string, THREE.AnimationAction>();
      for (const clip of loadedChicken.animations) {
        actions.set(clip.name, mixer.clipAction(clip));
      }
      chickenGlbRuntime = {
        mixer,
        actions,
        currentAction: null,
        currentMode: null,
        model: loadedChicken.scene,
        clipCount: loadedChicken.animations.length,
      };
      storeRef.current.chickenModelSource = "glb";
      storeRef.current.chickenAnimationClipCount = loadedChicken.animations.length;
      applyChickenGlbAnimation(chickenGlbRuntime, "idle", storeRef.current, 0);
      for (const part of proceduralChickenParts) {
        part.visible = false;
      }
      setGameModelReady(true);
    });
    const sharedRotatingCoinAssets = createCoinAssets();
    const titleCoin = createCoinModel(sharedRotatingCoinAssets);
    titleCoin.visible = false;
    scene.add(titleCoin);
    const coinMeshes = new Map<number, THREE.Group>();
    const coinEffectMeshes = new Map<number, THREE.Group>();
    const rocketPickupMeshes = new Map<number, RocketPickupModel>();
    const obstacleMeshes = new Map<number, ObstacleModel>();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
    };

    const screenToScene = (x: number, y: number) => {
      const rect = host.getBoundingClientRect();
      const distance = camera.position.z;
      const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      const width = height * camera.aspect;
      return {
        x: (x / WIDTH - 0.5) * width,
        y: -(y / HEIGHT - 0.5) * height,
        rect,
      };
    };

    const clientToScene = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      const logicalX = ((clientX - rect.left) / Math.max(1, rect.width)) * WIDTH;
      const logicalY = ((clientY - rect.top) / Math.max(1, rect.height)) * HEIGHT;
      return screenToScene(logicalX, logicalY);
    };

    const terrainPoint = (x: number, y: number, z: number) => {
      const point = screenToScene(x, y);
      return new THREE.Vector3(point.x, point.y, z);
    };

    const createTerrainModelGeometry = (
      bands: Array<{ x: number; y: number; width: number; height: number }>,
      worldOffset: number,
    ) => {
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const groups: Array<{ start: number; count: number; materialIndex: number }> = [];
      const push = (point: THREE.Vector3) => vertices.push(point.x, point.y, point.z);
      const addQuad = (
        a: THREE.Vector3,
        b: THREE.Vector3,
        c: THREE.Vector3,
        d: THREE.Vector3,
        materialIndex: number,
      ) => {
        const start = vertices.length / 3;
        push(a);
        push(b);
        push(c);
        push(a);
        push(c);
        push(d);
        groups.push({ start, count: 6, materialIndex });
      };
      const addRoundedRail = (
        x1: number,
        x2: number,
        centerY: number,
        centerZ: number,
        radiusY: number,
        radiusZ: number,
      ) => {
        const segments = 8;
        for (let i = 0; i < segments; i += 1) {
          const angleA = (i / segments) * Math.PI;
          const angleB = ((i + 1) / segments) * Math.PI;
          const yA = centerY - Math.sin(angleA) * radiusY;
          const yB = centerY - Math.sin(angleB) * radiusY;
          const zA = centerZ + Math.cos(angleA) * radiusZ;
          const zB = centerZ + Math.cos(angleB) * radiusZ;
          addQuad(
            terrainPoint(x1, yA, zA),
            terrainPoint(x2, yA, zA),
            terrainPoint(x2, yB, zB),
            terrainPoint(x1, yB, zB),
            5,
          );
        }
      };
      const addFrontBrick = (x: number, y: number, width: number, height: number, z: number) => {
        addQuad(
          terrainPoint(x, y, z),
          terrainPoint(x + width, y, z),
          terrainPoint(x + width, y + height, z),
          terrainPoint(x, y + height, z),
          6,
        );
      };
      const addDiagonalFaceShadow = (x: number, y: number, width: number, height: number, z: number) => {
        addQuad(
          terrainPoint(x, y, z),
          terrainPoint(x + width, y + 12, z),
          terrainPoint(x + width - 22, y + height, z),
          terrainPoint(x - 22, y + height - 12, z),
          7,
        );
      };

      const topDepth = 24;
      const lipHeight = 18;
      const bottom = HEIGHT + 96;
      const backZ = -0.68;
      const frontZ = -0.14;
      const lipZ = -0.02;

      for (const band of bands) {
        const x1 = band.x;
        const x2 = band.x + band.width;
        const topY = band.y;
        const blockBottom = bottom;
        const topBackLeft = terrainPoint(x1, topY, backZ);
        const topBackRight = terrainPoint(x2, topY, backZ);
        const topFrontLeft = terrainPoint(x1, topY + topDepth, frontZ);
        const topFrontRight = terrainPoint(x2, topY + topDepth, frontZ);
        const lipBottomLeft = terrainPoint(x1, topY + topDepth + lipHeight, lipZ);
        const lipBottomRight = terrainPoint(x2, topY + topDepth + lipHeight, lipZ);
        const frontBottomLeft = terrainPoint(x1, blockBottom, lipZ);
        const frontBottomRight = terrainPoint(x2, blockBottom, lipZ);
        const backBottomLeft = terrainPoint(x1, blockBottom, backZ);
        const backBottomRight = terrainPoint(x2, blockBottom, backZ);

        addQuad(topBackLeft, topBackRight, topFrontRight, topFrontLeft, 0);
        addQuad(topFrontLeft, topFrontRight, lipBottomRight, lipBottomLeft, 1);
        addQuad(lipBottomLeft, lipBottomRight, frontBottomRight, frontBottomLeft, 2);
        addQuad(topBackRight, topBackLeft, backBottomLeft, backBottomRight, 4);
        addQuad(topBackLeft, topFrontLeft, frontBottomLeft, backBottomLeft, 3);
        addQuad(topFrontRight, topBackRight, backBottomRight, frontBottomRight, 3);
        addRoundedRail(x1 + 4, x2 - 4, topY + 3, backZ + 0.08, 8, 0.07);
        addRoundedRail(x1 + 4, x2 - 4, topY + topDepth + 5, frontZ + 0.02, 9, 0.075);

        const brickRows = Math.max(1, Math.floor((blockBottom - topY) / 128));
        const brickSpacing = 236;
        for (let row = 0; row < Math.min(3, brickRows); row += 1) {
          const rowY = topY + 72 + row * 104;
          const rowOffset = row % 2 === 0 ? 34 : 118;
          const firstBrickWorldX =
            Math.floor((x1 + worldOffset - rowOffset) / brickSpacing) * brickSpacing + rowOffset;
          for (let brickWorldX = firstBrickWorldX; brickWorldX < x2 + worldOffset - 52; brickWorldX += brickSpacing) {
            const brickX = brickWorldX - worldOffset;
            const clippedBrickX = Math.max(brickX, x1 + 24);
            const clippedBrickRight = Math.min(brickX + 126, x2 - 24);
            const brickWidth = clippedBrickRight - clippedBrickX;
            if (brickWidth > 44) {
              addFrontBrick(clippedBrickX, rowY, brickWidth, 22, lipZ + 0.006);
            }
          }
        }

        if (topY < GROUND_Y && band.width > 116) {
          addDiagonalFaceShadow(
            x2 - Math.min(122, band.width * 0.42),
            topY + topDepth + 10,
            Math.min(104, band.width * 0.34),
            Math.min(118, blockBottom - topY - topDepth - 36),
            lipZ + 0.012,
          );
        }
      }

      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      for (const group of groups) {
        geometry.addGroup(group.start, group.count, group.materialIndex);
      }
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      return geometry;
    };

    const createTerrainShadowGeometry = (bands: Array<{ x: number; y: number; width: number; height: number }>) => {
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const push = (point: THREE.Vector3) => vertices.push(point.x, point.y, point.z);
      const addQuad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
        push(a);
        push(b);
        push(c);
        push(a);
        push(c);
        push(d);
      };

      const shadowZ = -0.74;
      for (const band of bands) {
        const inset = Math.min(72, Math.max(20, band.width * 0.14));
        const y = band.y + 74;
        addQuad(
          terrainPoint(band.x + inset, y, shadowZ),
          terrainPoint(band.x + band.width - inset, y, shadowZ),
          terrainPoint(band.x + band.width - inset + 34, y + 24, shadowZ),
          terrainPoint(band.x + inset + 34, y + 24, shadowZ),
        );
      }

      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      return geometry;
    };

    const rebuildTerrainModels = (store: GameStore) => {
      if (store.phase === "ready") {
        terrainMesh.visible = false;
        terrainShadowMesh.visible = false;
        store.terrainMeshCount = 0;
        store.terrainPieceCount = 0;
        return;
      }

      const isNight = store.theme === "night";
      terrainTopMaterial.color.set(isNight ? "#6f5a44" : "#a85f2a");
      terrainFrontMaterial.color.set(isNight ? "#271b2b" : "#61260e");
      terrainSideMaterial.color.set(isNight ? "#120d1b" : "#321207");
      terrainShadeMaterial.color.set(isNight ? "#201427" : "#4d1c09");
      terrainLipMaterial.color.set(isNight ? "#382934" : "#733011");
      terrainRailMaterial.color.set(isNight ? "#7b6148" : "#bd7638");
      terrainDetailMaterial.color.set(isNight ? "#1d0d1d" : "#351104");
      terrainFaceShadowMaterial.color.set(isNight ? "#140914" : "#3d1608");
      terrainFaceShadowMaterial.opacity = isNight ? 0.55 : 0.42;
      terrainShadowMaterial.opacity = isNight ? 0.34 : 0.22;

      const terrainBands = mergeTerrainBands(getTerrainBands(store));
      terrainMesh.geometry.dispose();
      terrainMesh.geometry = createTerrainModelGeometry(terrainBands, store.worldOffset);
      terrainMesh.visible = terrainBands.length > 0;
      terrainShadowMesh.geometry.dispose();
      terrainShadowMesh.geometry = createTerrainShadowGeometry(terrainBands);
      terrainShadowMesh.visible = terrainBands.length > 0;
      store.terrainMeshCount = terrainBands.length > 0 ? 2 : 0;
      store.terrainPieceCount = terrainBands.length;
    };

    let frame = 0;
    let lastThreeFrameAt = 0;
    const loop = (now: number) => {
      const store = storeRef.current;
      const seconds = now / 1000;
      const threeDt = Math.min(0.05, Math.max(0, (now - lastThreeFrameAt) / 1000 || 0));
      lastThreeFrameAt = now;
      const animation = getChickenAnimationState(store, now);
      const { isLanding, boosting, airborne, jumpKick, landImpact, landingCall } = animation;
      const flap = Math.sin(seconds * (airborne ? 16 : 9));
      const blink = Math.pow(Math.max(0, Math.sin(seconds * (store.phase === "ready" ? 2.7 : 3.8) + 0.9)), 20);
      const idleBreath = store.phase === "ready" ? Math.sin(seconds * 2.4) : 0;
      const runBounce = store.phase === "playing" && !airborne ? Math.abs(Math.sin(store.runTime * 12)) : 0;
      const callPunch = Math.sin(landingCall * Math.PI);
      let logicalX = WIDTH * 0.5;
      let logicalY = INTRO_CHICKEN_Y;
      let logicalScale = 1.86;
      let yaw = 0;
      let roll = Math.sin(seconds * 1.3) * 0.025;
      let pitch = Math.sin(seconds * 1.1) * 0.03;
      let jumpMorph = airborne ? 1 : 0;

      if (store.phase === "ready") {
        logicalY += Math.sin(seconds * 2.2) * 10;
        logicalScale += idleBreath * 0.018 + Math.sin(seconds * 3.4) * 0.014;
        pitch += idleBreath * 0.025;
        roll += Math.sin(seconds * 1.8) * 0.018;
      }

      if (store.phase === "playing") {
        if (isLanding) {
          const duration = Math.max(1, store.landingUntil - store.launchStartAt);
          const t = clamp((now - store.launchStartAt) / duration, 0, 1);
          const eased = easeOutCubic(t);
          jumpMorph = 1 - clamp((t - 0.8) / 0.2, 0, 1);
          logicalX = lerp(WIDTH * 0.5, store.player.x, eased);
          logicalY = lerp(INTRO_CHICKEN_Y, store.player.y, eased) - Math.sin(t * Math.PI) * 120 + landingCall * 18 - callPunch * 8;
          logicalScale = lerp(1.86, 0.76, eased);
          yaw = easeInOutCubic(clamp((t - 0.08) / 0.58, 0, 1)) * SIDE_YAW;
          pitch = lerp(0.04, -0.16, Math.sin(t * Math.PI)) + landingCall * 0.18 - callPunch * 0.06;
          roll = lerp(0, -0.08, eased) - landingCall * 0.035;
        } else {
          logicalX = store.player.x;
          logicalY = store.player.y - runBounce * 2.2 + landImpact * 3;
          logicalScale = 0.76;
          yaw = SIDE_YAW;
          if (boosting) {
            logicalY -= 16 + Math.sin(seconds * 22) * 4;
          }
          pitch = airborne ? clamp(store.player.vy / 2300, -0.24, 0.18) : 0;
          roll = boosting ? -0.14 + Math.sin(seconds * 18) * 0.018 : airborne ? -0.12 - jumpKick * 0.04 : Math.sin(store.runTime * 8) * 0.018;
        }
      }

      chicken.root.visible = true;
      const position = screenToScene(logicalX, logicalY);
      chicken.root.position.set(position.x, position.y, 0);
      chicken.root.rotation.set(pitch, yaw, roll);
      const baseScale = logicalScale * 0.32;
      const idlePulse = store.phase === "ready" ? idleBreath * 0.035 : 0;
      const squash = airborne ? 0.92 - landingCall * 0.2 - jumpKick * 0.1 : 1 + runBounce * 0.035 + idlePulse + landImpact * 0.18;
      const stretch = airborne ? 1.1 + landingCall * 0.28 + jumpKick * 0.2 : 1 - runBounce * 0.025 - idlePulse * 0.45 - landImpact * 0.14;
      if (chickenGlbRuntime) {
        const glbPulse = store.phase === "ready" ? idleBreath * 0.012 : landImpact * 0.035;
        chicken.root.scale.setScalar(baseScale * (1 + glbPulse));
      } else {
        chicken.root.scale.set(baseScale * squash, baseScale * stretch, baseScale * (1 + landingCall * 0.06));
      }

      const wingLift = airborne ? 0.86 + flap * 0.34 + landingCall * 0.48 + jumpKick * 0.46 : 0.16 + flap * 0.06 + idlePulse * 0.42 + landImpact * 0.2;
      chicken.parts.leftWing.rotation.set(0.08, 0.1, 0.16 + wingLift);
      chicken.parts.rightWing.rotation.set(0.08, -0.1, -0.16 - wingLift);
      chicken.parts.leftLeg.rotation.z = airborne ? -0.86 + flap * 0.1 - jumpKick * 0.22 - landingCall * 0.08 : -0.2 + Math.sin(seconds * 12) * 0.12 - landImpact * 0.24;
      chicken.parts.rightLeg.rotation.z = airborne ? 0.66 - flap * 0.1 + jumpKick * 0.2 + landingCall * 0.06 : 0.2 - Math.sin(seconds * 12) * 0.12 + landImpact * 0.2;
      chicken.parts.leftFoot.rotation.z = Math.PI / 4 + (airborne ? -0.52 - jumpKick * 0.22 : Math.sin(seconds * 12) * 0.1 - landImpact * 0.18);
      chicken.parts.rightFoot.rotation.z = Math.PI / 4 + (airborne ? 0.38 + jumpKick * 0.18 : -Math.sin(seconds * 12) * 0.1 + landImpact * 0.16);
      chicken.parts.tail.rotation.set(0.12 + flap * 0.025, -0.28 + (airborne ? jumpKick * 0.1 : Math.sin(seconds * 9) * 0.04), Math.sin(seconds * 10) * 0.034 - landingCall * 0.12);
      chicken.parts.tail.scale.set(1 + landingCall * 0.12, 1 + jumpKick * 0.16, 1 + landImpact * 0.12);
      chicken.parts.comb.rotation.x = -0.2 + (airborne ? flap * 0.05 : idleBreath * 0.035) - jumpKick * 0.1 + landingCall * 0.2;
      chicken.parts.body.scale.set(
        1.08 + landingCall * 0.1 - jumpKick * 0.06 + landImpact * 0.1 + runBounce * 0.02,
        0.96 + jumpMorph * 0.08 - landingCall * 0.22 + jumpKick * 0.14 - landImpact * 0.12,
        0.9 + landingCall * 0.12,
      );
      chicken.parts.lowerBodyShade.scale.set(
        1.18 + landingCall * 0.08 + landImpact * 0.08,
        0.44 - landingCall * 0.08 + jumpKick * 0.06 - landImpact * 0.04,
        0.84 + landingCall * 0.08,
      );
      chicken.parts.belly.scale.set(
        1.28 + landingCall * 0.08 + landImpact * 0.08,
        0.78 - landingCall * 0.16 + jumpKick * 0.1 - landImpact * 0.1,
        0.38 + landingCall * 0.05,
      );
      chicken.parts.flankFeathers.scale.set(1 + landingCall * 0.06 + landImpact * 0.08, 1 - landingCall * 0.08 + jumpKick * 0.06, 1);
      chicken.parts.breastFeathers.visible = store.phase === "ready" || isLanding;
      chicken.parts.breastFeathers.scale.set(1 + landingCall * 0.1 - jumpKick * 0.04 + landImpact * 0.08, 1 + jumpMorph * 0.05 - landingCall * 0.1 - landImpact * 0.08, 1);
      chicken.parts.beak.rotation.x = Math.PI / 2 - landingCall * 0.22 - jumpKick * 0.07;
      chicken.parts.beak.rotation.y = store.phase === "ready" ? Math.sin(seconds * 3) * 0.035 : 0;
      chicken.parts.beak.scale.set(1.12 + landingCall * 0.12, 0.82 + landingCall * 0.2, 0.72);
      chicken.parts.lowerBeak.rotation.x = Math.PI / 2 + landingCall * 0.36 + jumpKick * 0.08;
      chicken.parts.lowerBeak.rotation.y = store.phase === "ready" ? Math.sin(seconds * 3) * 0.025 : 0;
      chicken.parts.lowerBeak.position.y = -0.09 - landingCall * 0.16;
      chicken.parts.lowerBeak.position.z = 0.84 + landingCall * 0.05;
      const mouthOpen = store.phase === "ready" ? 0.7 + Math.max(0, Math.sin(seconds * 4.2)) * 0.24 : landingCall;
      chicken.parts.mouth.visible = mouthOpen > 0.08;
      chicken.parts.mouth.scale.x = 0.64 + mouthOpen * 0.44;
      chicken.parts.mouth.scale.y = 0.26 + mouthOpen * 0.9;
      chicken.parts.tongue.visible = mouthOpen > 0.18;
      chicken.parts.tongue.scale.set(1 + mouthOpen * 0.18, 0.32 + mouthOpen * 0.36, 0.44);
      chicken.parts.tongue.position.y = -0.08 - mouthOpen * 0.035;
      const eyeSquint = clamp(1 - blink * 0.86 + landingCall * 0.2, 0.12, 1.2);
      chicken.parts.leftEye.scale.set(1 + landingCall * 0.08, eyeSquint, 1);
      chicken.parts.rightEye.scale.set(1 + landingCall * 0.08, eyeSquint, 1);
      chicken.parts.callWave.visible = landingCall > 0.02;
      chicken.parts.callWave.scale.setScalar(0.66 + landingCall * 1.62);
      chicken.parts.callWave.position.z = 1.2 + landingCall * 0.52;
      const callMaterial = chicken.parts.callWave.material as THREE.MeshBasicMaterial;
      callMaterial.opacity = landingCall * 0.5;
      const secondaryCall = Math.max(0, landingCall - 0.26) / 0.74;
      chicken.parts.callWaveSecondary.visible = secondaryCall > 0.02;
      chicken.parts.callWaveSecondary.scale.setScalar(0.82 + secondaryCall * 2.0);
      chicken.parts.callWaveSecondary.position.z = 1.18 + secondaryCall * 0.76;
      const secondaryCallMaterial = chicken.parts.callWaveSecondary.material as THREE.MeshBasicMaterial;
      secondaryCallMaterial.opacity = secondaryCall * 0.26;
      const rocketThrust = boosting ? 0.64 + (store.input.thrust ? 0.36 : 0) : 0;
      chicken.parts.rocket.visible = boosting;
      chicken.parts.rocketFlame.visible = boosting;
      chicken.parts.rocket.position.y = -1.1 + Math.sin(seconds * 28) * 0.022;
      chicken.parts.rocket.rotation.set(
        0.03 + Math.sin(seconds * 20) * 0.018,
        0,
        Math.sin(seconds * 24) * 0.024,
      );
      chicken.parts.rocket.scale.set(
        1.28 + Math.sin(seconds * 22) * 0.024 * rocketThrust,
        1.1,
        1.26 + Math.sin(seconds * 17) * 0.032 * rocketThrust,
      );
      chicken.parts.rocketFlame.scale.set(
        0.5 + rocketThrust * 0.84 + Math.sin(seconds * 42) * 0.18 * rocketThrust,
        0.74 + rocketThrust * 0.38 + Math.sin(seconds * 36) * 0.12 * rocketThrust,
        0.54 + rocketThrust * 0.84 + Math.sin(seconds * 45) * 0.18 * rocketThrust,
      );
      if (chickenGlbRuntime) {
        applyChickenGlbAnimation(chickenGlbRuntime, animation.mode, store, threeDt);
        for (const part of proceduralChickenParts) {
          part.visible = false;
        }
        chicken.parts.callWave.visible = false;
        chicken.parts.callWaveSecondary.visible = false;
      }

      titleCoin.visible = store.phase === "playing";
      store.titleCoinVisible = titleCoin.visible;
      if (titleCoin.visible) {
        const slot = titleCoinSlotRef.current?.getBoundingClientRect();
        const titlePosition = slot
          ? clientToScene(slot.left + slot.width / 2, slot.top + slot.height / 2)
          : screenToScene(565, 314);
        titleCoin.position.set(titlePosition.x, titlePosition.y, 0.08);
        titleCoin.scale.setScalar(0.23);
        titleCoin.rotation.set(0.2, seconds * 3.2, 0.02);
      }

      rebuildTerrainModels(store);

      const activeRocketPickupIds = new Set<number>();
      for (const pickup of store.pickups) {
        if (pickup.kind !== "rocket") continue;
        activeRocketPickupIds.add(pickup.id);
        let rocketPickup = rocketPickupMeshes.get(pickup.id);
        if (!rocketPickup) {
          rocketPickup = createRocketPickupModel();
          rocketPickupMeshes.set(pickup.id, rocketPickup);
          scene.add(rocketPickup.root);
        }
        const rocketPosition = screenToScene(pickup.x, pickup.y + Math.sin(pickup.spin * 2) * 5);
        rocketPickup.root.position.set(rocketPosition.x, rocketPosition.y, 0.24);
        rocketPickup.root.scale.setScalar(0.2);
        rocketPickup.root.rotation.set(-0.08, SIDE_YAW + 0.34, Math.sin(seconds * 5.6 + pickup.id) * 0.08);
        rocketPickup.flame.scale.set(
          0.68 + Math.sin(seconds * 18 + pickup.id) * 0.12,
          0.72,
          0.68 + Math.sin(seconds * 21 + pickup.id) * 0.16,
        );
        rocketPickup.root.visible = true;
      }

      for (const [id, rocketPickup] of rocketPickupMeshes) {
        if (activeRocketPickupIds.has(id)) continue;
        scene.remove(rocketPickup.root);
        disposeObject3D(rocketPickup.root);
        rocketPickupMeshes.delete(id);
      }

      const activeObstacleIds = new Set<number>();
      for (const obstacle of store.obstacles) {
        activeObstacleIds.add(obstacle.id);
        let obstacleModel = obstacleMeshes.get(obstacle.id);
        if (!obstacleModel || obstacleModel.kind !== obstacle.kind) {
          if (obstacleModel) {
            scene.remove(obstacleModel.root);
            disposeObject3D(obstacleModel.root);
          }
          obstacleModel = createObstacleModel(obstacle.kind);
          obstacleMeshes.set(obstacle.id, obstacleModel);
          scene.add(obstacleModel.root);
        }
        const center = screenToScene(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
        const xScale =
          Math.abs(screenToScene(obstacle.x + obstacle.width, obstacle.y).x - screenToScene(obstacle.x, obstacle.y).x) *
          (obstacle.kind === "spike" ? 1.0 : 0.98);
        const yScale =
          Math.abs(screenToScene(obstacle.x, obstacle.y + obstacle.height).y - screenToScene(obstacle.x, obstacle.y).y) *
          (obstacle.kind === "spike" ? 1.0 : 0.98);
        obstacleModel.root.position.set(center.x, center.y, 0.36);
        obstacleModel.root.scale.set(xScale, yScale, Math.min(xScale, yScale) * (obstacle.kind === "spike" ? 0.72 : 0.9));
        obstacleModel.root.rotation.set(0.04, obstacle.kind === "spike" ? -0.14 : -0.18, 0);
        obstacleModel.root.visible = true;
      }

      for (const [id, obstacleModel] of obstacleMeshes) {
        if (activeObstacleIds.has(id)) continue;
        scene.remove(obstacleModel.root);
        disposeObject3D(obstacleModel.root);
        obstacleMeshes.delete(id);
      }
      store.obstacleMeshCount = activeObstacleIds.size;

      const activeCoinIds = new Set<number>();
      for (const pickup of store.pickups) {
        if (pickup.kind !== "coin") continue;
        activeCoinIds.add(pickup.id);
        let coin = coinMeshes.get(pickup.id);
        if (!coin) {
          coin = createCoinModel(sharedRotatingCoinAssets);
          coinMeshes.set(pickup.id, coin);
          scene.add(coin);
        }
        const coinPosition = screenToScene(pickup.x, pickup.y);
        coin.position.set(coinPosition.x, coinPosition.y, 0.1);
        coin.scale.setScalar(0.16);
        coin.rotation.set(0.12, pickup.spin + seconds * 2.3, 0);
        coin.visible = true;
      }

      for (const [id, coin] of coinMeshes) {
        if (activeCoinIds.has(id)) continue;
        scene.remove(coin);
        coinMeshes.delete(id);
      }
      store.coinMeshCount = activeCoinIds.size;

      const activeCoinEffectIds = new Set<number>();
      for (const effect of store.coinEffects) {
        const t = clamp((now - effect.startedAt) / effect.duration, 0, 1);
        if (t >= 1) continue;
        activeCoinEffectIds.add(effect.id);
        let coin = coinEffectMeshes.get(effect.id);
        if (!coin) {
          coin = createCoinModel(sharedRotatingCoinAssets);
          coinEffectMeshes.set(effect.id, coin);
          scene.add(coin);
        }
        const eased = easeInOutCubic(t);
        const from = screenToScene(effect.fromX, effect.fromY);
        const scoreRect = scorePillRef.current?.getBoundingClientRect();
        const target = scoreRect
          ? clientToScene(scoreRect.left + scoreRect.width / 2, scoreRect.top + scoreRect.height / 2)
          : screenToScene(getScoreTagTarget().x, getScoreTagTarget().y);
        coin.position.set(
          lerp(from.x, target.x, eased),
          lerp(from.y, target.y, eased) + Math.sin(t * Math.PI) * 0.86,
          0.34,
        );
        coin.scale.setScalar(lerp(0.12, 0.058, eased) * (1 + Math.sin(t * Math.PI) * 0.2));
        coin.rotation.set(0.16, seconds * 9.8 + effect.id * 0.1, 0.03);
        coin.visible = true;
      }

      for (const [id, coin] of coinEffectMeshes) {
        if (activeCoinEffectIds.has(id)) continue;
        scene.remove(coin);
        coinEffectMeshes.delete(id);
      }
      store.coinEffectMeshCount = activeCoinEffectIds.size;

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(loop);

    return () => {
      cancelledModelLoad = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      for (const coin of coinMeshes.values()) {
        scene.remove(coin);
      }
      for (const coin of coinEffectMeshes.values()) {
        scene.remove(coin);
      }
      for (const rocketPickup of rocketPickupMeshes.values()) {
        scene.remove(rocketPickup.root);
        disposeObject3D(rocketPickup.root);
      }
      for (const obstacleModel of obstacleMeshes.values()) {
        scene.remove(obstacleModel.root);
        disposeObject3D(obstacleModel.root);
      }
      terrainMesh.geometry.dispose();
      terrainShadowMesh.geometry.dispose();
      terrainGroup.remove(terrainMesh);
      terrainGroup.remove(terrainShadowMesh);
      terrainTopMaterial.dispose();
      terrainFrontMaterial.dispose();
      terrainSideMaterial.dispose();
      terrainShadeMaterial.dispose();
      terrainLipMaterial.dispose();
      terrainRailMaterial.dispose();
      terrainDetailMaterial.dispose();
      terrainFaceShadowMaterial.dispose();
      terrainShadowMaterial.dispose();
      disposeObject3D(chicken.root);
      disposeCoinAssets(sharedRotatingCoinAssets);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const store = storeRef.current;
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        event.preventDefault();
        if (store.phase === "ready") {
          begin();
          return;
        }
        if (store.phase === "paused") {
          togglePause();
          return;
        }
        jumpOrThrust(store);
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        store.input.left = true;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        store.input.right = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const store = storeRef.current;
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        store.input.thrust = false;
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        store.input.left = false;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        store.input.right = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [begin, togglePause]);

  const handlePointerDown = () => {
    const store = storeRef.current;
    if (store.phase === "ready") {
      begin();
      return;
    }
    if (store.phase === "paused") return;
    jumpOrThrust(store);
  };

  const handlePointerUp = () => {
    storeRef.current.input.thrust = false;
  };

  const progressLabel = Math.round(hud.progress * 100);
  const stopPointer = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <main className={`${styles.gamePage} ${theme === "night" ? styles.gamePageNight : ""}`}>
      {gameLoading ? (
        <div className={styles.gameLoader} role="status" aria-live="polite">
          <div className={styles.gameLoaderMark} aria-hidden="true">
            <span />
          </div>
          <div className={styles.gameLoaderCopy}>
            <p>Loading game</p>
            <strong>{Math.round(gameLoadProgress * 100)}%</strong>
          </div>
          <div className={styles.gameLoaderTrack} aria-hidden="true">
            <i style={{ transform: `scaleX(${gameLoadProgress})` }} />
          </div>
        </div>
      ) : null}
      <div
        className={styles.playfield}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerUp}
        onPointerUp={handlePointerUp}
        role="application"
        aria-label="Start or control the Hit 10k game"
      >
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <div ref={threeLayerRef} className={styles.threeLayer} aria-hidden="true" />

      <nav className={styles.nav} aria-label="Primary navigation" onPointerDown={stopPointer}>
        <a className={styles.navBrand} href="/" aria-label="xtyopen home">
          <img src="/xtyopen-logo.svg" alt="xtyopen" />
        </a>
        <div className={styles.navLinks}>
          <a href="/#profile">Profile</a>
          <a href="/#work">Work</a>
          <a href="/#studio">Studio</a>
          <a href="/#contact">Contact</a>
        </div>
        <a className={styles.navCta} href="/#contact">
          Get in touch
        </a>
      </nav>

      <button
        className={`${styles.themeToggle} ${theme === "night" ? styles.themeToggleNight : ""}`}
        type="button"
        aria-label={theme === "night" ? "Switch to day background" : "Switch to night background"}
        aria-pressed={theme === "night"}
        onClick={toggleTheme}
        onPointerDown={stopPointer}
      >
        <span />
      </button>
      <div className={`${styles.damageVignette} ${hud.hurtFlash ? styles.damageVignetteActive : ""}`} aria-hidden="true" />

      {hud.phase === "ready" || launching ? (
        <section className={`${styles.characterIntro} ${launching ? styles.characterIntroLaunch : ""}`} aria-label="Intro">
          <div className={styles.speechBubble}>
            AI got me fired.
            <br />
            Help me find a job!
          </div>
        </section>
      ) : (
        <section className={styles.uiLayer} aria-labelledby="game-title">
          <div className={styles.hudTop} aria-live="polite">
            <span className={styles.hearts} aria-label={`${hud.lives} lives`}>
              {"♥".repeat(Math.max(0, hud.lives))}
            </span>
            <span className={styles.boostTrack} aria-label={`Rocket fuel ${Math.round(hud.rocketFuel * 100)}%`}>
              <i style={{ transform: `scaleX(${hud.rocketFuel})` }} />
            </span>
            <button
              ref={scorePillRef}
              className={`${styles.scorePill} ${hud.scorePulse ? styles.scorePillHot : ""}`}
              type="button"
              onClick={openLeaderboard}
              onPointerDown={stopPointer}
            >
              Score <strong>{hud.score.toLocaleString()}</strong>
            </button>
            <button
              className={styles.bestScore}
              type="button"
              onClick={openLeaderboard}
              onPointerDown={stopPointer}
            >
              Best {hud.bestScore.toLocaleString()}
            </button>
          </div>

          <div className={styles.copy}>
            <h1 id="game-title">
              Hit 10k <span ref={titleCoinSlotRef} className={styles.titleCoinSlot} aria-hidden="true" />
              <em>We&rsquo;re hiring.</em>
            </h1>
            <p>
              A chicken on a rocket, real physics, real magnet coins, very real obstacles. Cross <strong>10,000
              points</strong> and a hiring email pops up.
              <br />
              <em>(The company isn&rsquo;t real. The points are.)</em>
            </p>
            <div className={styles.controls} onPointerDown={stopPointer}>
              <button
                className={styles.iconControl}
                type="button"
                aria-label={hud.phase === "playing" ? "Pause game" : "Resume game"}
                onClick={togglePause}
              >
                {hud.phase === "playing" ? (
                  <svg
                    aria-hidden="true"
                    className={`${styles.controlIcon} ${styles.pauseControlIcon}`}
                    fill="none"
                    height="27"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    style={{ width: 27, height: 27, transform: "scaleX(1.45)" }}
                    viewBox="2 1 20 22"
                    width="27"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="6" height="20" x="4" y="2" rx="2" />
                    <rect width="6" height="20" x="14" y="2" rx="2" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    className={styles.controlIcon}
                    fill="none"
                    height="27"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    style={{ width: 27, height: 27 }}
                    viewBox="3 3 18 18"
                    width="27"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                  </svg>
                )}
              </button>
              <button type="button" onClick={begin}>
                Start
              </button>
              <button type="button" onClick={openHowToPlay}>
                How to play
              </button>
              <button type="button" onClick={resetRun}>
                Reset
              </button>
            </div>
          </div>

          <div className={styles.progressNumber} aria-label={`Progress ${progressLabel}%`}>
            {progressLabel}%
          </div>
          {hud.phase === "paused" ? <div className={styles.pausedBadge}>Paused</div> : null}
          {launching ? <div className={styles.launchHint}>Space to begin</div> : null}
        </section>
      )}

      {hud.phase === "playing" && storeRef.current.runTime < 4.2 ? (
        <div className={styles.playHint} aria-hidden="true">
          Space to jump
        </div>
      ) : null}

      {showHowToPlay ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="how-to-play-title" onPointerDown={stopPointer}>
          <div className={styles.modalPanel}>
            <button className={styles.modalClose} type="button" aria-label="Close how to play" onClick={() => setShowHowToPlay(false)}>
              ×
            </button>
            <p className={styles.modalKicker}>How to play</p>
            <h2 id="how-to-play-title">Keep the chicken moving.</h2>
            <p>Press Space, W, or Arrow Up to jump. Hold while rocket fuel is active to thrust upward.</p>
            <p>Collect coins for score, pick up rockets for a short boost, and avoid crates, spikes, and gaps.</p>
          </div>
        </div>
      ) : null}

      {showLeaderboard ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="leaderboard-title" onPointerDown={stopPointer}>
          <div className={styles.modalPanel}>
            <button className={styles.modalClose} type="button" aria-label="Close leaderboard" onClick={() => setShowLeaderboard(false)}>
              ×
            </button>
            <p className={styles.modalKicker}>Local leaderboard</p>
            <h2 id="leaderboard-title">Best score</h2>
            <div className={styles.leaderboardRow}>
              <span>#1</span>
              <strong>{hud.bestScore.toLocaleString()}</strong>
            </div>
            <p>Stored locally in this browser.</p>
          </div>
        </div>
      ) : null}

    </main>
  );
}
