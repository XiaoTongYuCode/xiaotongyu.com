import {
  COIN_COLLECT_PADDING,
  COIN_MAGNET_RADIUS,
  COIN_MAX_FLOAT_FROM_PLAYER,
  COIN_MAX_PLATFORM_FLOAT_FROM_PLAYER,
  COIN_RADIUS,
  GROUND_Y,
  INITIAL_HUD,
  PLAYER_RADIUS,
  TARGET_SCORE,
  TERRAIN_PROFILE,
} from "./gameConstants";
import { getChickenAnimationState } from "./chickenAnimation";
import { clamp } from "./gameMath";
import { findStableSurfaceAtScreenX, getCoinReachableRange, getTerrainBands } from "./gameTerrain";
import { type GameDebugSnapshot, type GameStore, type HudState, type ThemeMode } from "./gameTypes";

export function createStore(bestScore = 0, theme: ThemeMode = "day"): GameStore {
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

export function createHud(store: GameStore): HudState {
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

export function createDebugSnapshot(store: GameStore): GameDebugSnapshot {
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

export function canExposeDebugSnapshot() {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1")
  );
}

export function syncDebugSnapshot(store: GameStore) {
  if (!canExposeDebugSnapshot()) return;
  const snapshot = createDebugSnapshot(store);
  window.__hit10kDebug = snapshot;
  document.documentElement.dataset.hit10kDebug = JSON.stringify(snapshot);
}

export function clearDebugSnapshot() {
  if (!canExposeDebugSnapshot()) return;
  delete window.__hit10kDebug;
  delete document.documentElement.dataset.hit10kDebug;
}
