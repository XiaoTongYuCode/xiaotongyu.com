import {
  COIN_MAX_FLOAT_FROM_PLAYER,
  COIN_MAX_PLATFORM_FLOAT_FROM_PLAYER,
  GROUND_Y,
  HEIGHT,
  PLAYER_RADIUS,
  TERRAIN_CYCLE,
  TERRAIN_PROFILE,
  WIDTH,
} from "./gameConstants";
import { clamp, positiveModulo } from "./gameMath";
import { type GameStore, type Pickup } from "./gameTypes";

export function getTerrainProfileAtWorldX(worldX: number) {
  const localX = positiveModulo(worldX, TERRAIN_CYCLE);
  for (const slice of TERRAIN_PROFILE) {
    if (localX >= slice.start && localX < slice.start + slice.width) {
      return slice;
    }
  }
  return TERRAIN_PROFILE[0];
}

export function getTerrainFloorAtScreenX(store: GameStore, screenX: number) {
  const worldX = store.worldOffset + screenX;
  const terrain = getTerrainProfileAtWorldX(worldX);
  if (terrain.height === null) {
    return null;
  }
  return GROUND_Y - terrain.height;
}

export function getNearestSolidFloorAtScreenX(store: GameStore, screenX: number) {
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

export function findStableSurfaceAtScreenX(store: GameStore, screenX: number, width: number) {
  const margin = Math.max(22, width * 0.22);
  const probes = [screenX - margin, screenX, screenX + width * 0.45, screenX + width * 0.9, screenX + width + margin];
  const floors = probes.map((probe) => getTerrainFloorAtScreenX(store, probe));
  if (floors.some((floor) => floor === null)) return null;
  const firstFloor = floors[0];
  if (firstFloor === null) return null;
  if (floors.some((floor) => floor !== firstFloor)) return null;
  return firstFloor;
}

export function findFutureStableSurface(store: GameStore, baseX: number, width: number) {
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

export function findSolidFloorFromScreenX(store: GameStore, screenX: number, direction: -1 | 1) {
  for (let distance = 0; distance <= 520; distance += 24) {
    const x = screenX + distance * direction;
    const floorY = getTerrainFloorAtScreenX(store, x);
    if (floorY !== null) {
      return { x, floorY };
    }
  }
  return { x: screenX, floorY: GROUND_Y };
}

export function getCoinGuideY(store: GameStore, screenX: number, index: number, count: number) {
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

export function getCoinReachableRange(store: GameStore, screenX: number) {
  const floorY = getNearestSolidFloorAtScreenX(store, screenX);
  const maxFloat = floorY < GROUND_Y ? COIN_MAX_PLATFORM_FLOAT_FROM_PLAYER : COIN_MAX_FLOAT_FROM_PLAYER;
  return {
    floorY,
    minY: floorY - PLAYER_RADIUS - maxFloat,
    maxY: floorY - PLAYER_RADIUS + 2,
    maxFloat,
  };
}

export function clampCoinToReachableRange(store: GameStore, pickup: Pickup) {
  const range = getCoinReachableRange(store, pickup.x);
  pickup.y = clamp(pickup.y, range.minY, range.maxY);
  return range;
}

export function getLandingFloorAtScreenX(store: GameStore, screenX: number, previousBottom: number, currentBottom: number) {
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

export function getVisibleTerrainBlocks(store: GameStore) {
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

export function getVisibleTerrainGaps(store: GameStore) {
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

export function getVisibleTerrainSlices(store: GameStore) {
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

export function getTerrainBands(store: GameStore) {
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

export function mergeTerrainBands(bands: Array<{ x: number; y: number; width: number; height: number }>) {
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
