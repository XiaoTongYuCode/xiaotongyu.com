import {
  COIN_COLLECT_PADDING,
  COIN_MAGNET_RADIUS,
  COIN_RADIUS,
  COIN_SCORE,
  GROUND_Y,
  HEIGHT,
  JUMP_BUFFER_MS,
  JUMP_VELOCITY,
  PIT_DAMAGE_Y,
  PLAYER_RADIUS,
  ROCKET_SCORE,
  SCORE_BASE_RATE,
  SCORE_SPEED_FACTOR,
  STORAGE_KEY,
  WIDTH,
} from "./gameConstants";
import { canUseGroundedJump } from "./chickenAnimation";
import { clamp, lerp } from "./gameMath";
import { createStore } from "./gameState";
import {
  clampCoinToReachableRange,
  findFutureStableSurface,
  findSolidFloorFromScreenX,
  getCoinGuideY,
  getCoinReachableRange,
  getLandingFloorAtScreenX,
  getNearestSolidFloorAtScreenX,
  getVisibleTerrainBlocks,
} from "./gameTerrain";
import { type GameStore, type ObstacleKind } from "./gameTypes";

export function circleRectHit(
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

export function pointInExpandedRect(x: number, y: number, radius: number, rx: number, ry: number, rw: number, rh: number) {
  return x >= rx - radius && x <= rx + rw + radius && y >= ry - radius && y <= ry + rh + radius;
}

export function segmentCircleRectHit(
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

export function sweptCircleRectHit(
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

export function makeSparkBurst(store: GameStore, x: number, y: number, color: string, count: number) {
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

export function spawnCoinRun(store: GameStore) {
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

export function spawnObstacle(store: GameStore) {
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

export function spawnRocket(store: GameStore) {
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

export function startRun(store: GameStore, landingDuration = 0) {
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

export function saveBestScore(score: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Math.floor(score)));
  } catch {
  }
}

export function damagePlayer(store: GameStore, now: number, bounceVy = -360) {
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

export function respawnPlayerAfterFall(store: GameStore, now: number) {
  const player = store.player;
  damagePlayer(store, now, -520);
  const leftFloor = findSolidFloorFromScreenX(store, player.x, -1);
  const rightFloor = findSolidFloorFromScreenX(store, player.x, 1);
  const spawn = Math.abs(player.x - leftFloor.x) <= Math.abs(player.x - rightFloor.x) ? leftFloor : rightFloor;
  player.x = clamp(spawn.x, 600, 930);
  player.y = spawn.floorY - PLAYER_RADIUS;
  player.floorY = spawn.floorY;
  player.vy = 0;
  player.grounded = true;
  player.lastGroundedAt = now;
  player.jumpQueuedUntil = 0;
  store.input.thrust = false;
}

export function performJump(store: GameStore, now: number) {
  const player = store.player;
  player.vy = JUMP_VELOCITY;
  player.grounded = false;
  player.jumpStartedAt = now;
  player.jumpQueuedUntil = 0;
  player.lastGroundedAt = 0;
  makeSparkBurst(store, player.x - 8, player.y + 30, "#ffd25f", 7);
}

export function updateGame(store: GameStore, now: number) {
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

  if ((landingFloorY === null && player.y > PIT_DAMAGE_Y) || player.y > HEIGHT + 80) {
    respawnPlayerAfterFall(store, now);
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

export function jumpOrThrust(store: GameStore) {
  if (store.phase !== "playing") return;
  const now = performance.now();
  store.input.thrust = true;
  store.player.jumpQueuedUntil = now + JUMP_BUFFER_MS;
  if (canUseGroundedJump(store.player, now)) {
    performJump(store, now);
  }
}
