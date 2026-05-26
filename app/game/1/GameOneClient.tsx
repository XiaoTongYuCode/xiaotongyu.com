"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./GameOne.module.css";

type GamePhase = "ready" | "playing" | "won" | "lost";
type PickupKind = "coin" | "rocket";
type ObstacleKind = "crate" | "spike" | "drone";

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

type GameStore = {
  phase: GamePhase;
  player: PlayerState;
  pickups: Pickup[];
  obstacles: Obstacle[];
  sparks: Spark[];
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
  lastHudAt: number;
};

type HudState = {
  phase: GamePhase;
  score: number;
  lives: number;
  bestScore: number;
  rocketFuel: number;
  progress: number;
};

const WIDTH = 960;
const HEIGHT = 540;
const GROUND_Y = 414;
const PLAYER_RADIUS = 28;
const TARGET_SCORE = 10000;
const MIN_WIN_SECONDS = 8;
const STORAGE_KEY = "hit-10k-game-1-best-score";

const INITIAL_HUD: HudState = {
  phase: "ready",
  score: 0,
  lives: 3,
  bestScore: 0,
  rocketFuel: 0,
  progress: 0,
};

function createStore(bestScore = 0): GameStore {
  return {
    phase: "ready",
    player: {
      x: 168,
      y: GROUND_Y - PLAYER_RADIUS,
      vy: 0,
      grounded: true,
      hurtUntil: 0,
    },
    pickups: [],
    obstacles: [],
    sparks: [],
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
    speed: 260,
    rocketFuel: 0,
    nextCoinAt: 0.45,
    nextObstacleAt: 1.4,
    nextRocketAt: 4.8,
    spawnId: 1,
    shake: 0,
    lastHudAt: 0,
  };
}

function createHud(store: GameStore): HudState {
  return {
    phase: store.phase,
    score: Math.floor(store.score),
    lives: store.lives,
    bestScore: store.bestScore,
    rocketFuel: store.rocketFuel,
    progress: clamp(store.score / TARGET_SCORE, 0, 1),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
  const baseX = WIDTH + 90;
  const laneY = 255 + Math.random() * 96;
  const count = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i += 1) {
    store.pickups.push({
      id: store.spawnId,
      kind: "coin",
      x: baseX + i * 58,
      y: laneY + Math.sin(i * 0.9) * 34,
      radius: 17,
      spin: Math.random() * Math.PI * 2,
      collected: false,
    });
    store.spawnId += 1;
  }
}

function spawnObstacle(store: GameStore) {
  const kindRoll = Math.random();
  const kind: ObstacleKind = kindRoll > 0.72 ? "drone" : kindRoll > 0.38 ? "spike" : "crate";
  const size = kind === "drone" ? { width: 54, height: 38 } : kind === "spike" ? { width: 48, height: 54 } : { width: 62, height: 58 };
  store.obstacles.push({
    id: store.spawnId,
    kind,
    x: WIDTH + 88,
    y: kind === "drone" ? 250 + Math.random() * 54 : GROUND_Y - size.height,
    width: size.width,
    height: size.height,
    hit: false,
  });
  store.spawnId += 1;
}

function spawnRocket(store: GameStore) {
  store.pickups.push({
    id: store.spawnId,
    kind: "rocket",
    x: WIDTH + 120,
    y: 238 + Math.random() * 72,
    radius: 24,
    spin: 0,
    collected: false,
  });
  store.spawnId += 1;
}

function startRun(store: GameStore) {
  const bestScore = store.bestScore;
  Object.assign(store, createStore(bestScore), {
    phase: "playing" as const,
    lastFrame: performance.now(),
  });
}

function finishRun(store: GameStore, phase: "won" | "lost") {
  store.phase = phase === "won" && store.score >= TARGET_SCORE ? "won" : "lost";
  store.bestScore = Math.max(store.bestScore, Math.floor(store.score));
  try {
    window.localStorage.setItem(STORAGE_KEY, String(store.bestScore));
  } catch {
    // Local storage can be unavailable in strict privacy contexts.
  }
}

function updateGame(store: GameStore, now: number) {
  if (store.phase !== "playing") {
    store.lastFrame = now;
    return;
  }

  const dt = Math.min(0.033, Math.max(0, (now - store.lastFrame) / 1000 || 0));
  store.lastFrame = now;
  store.runTime += dt;
  store.speed = Math.min(430, 260 + store.runTime * 4.8 + store.score / 220);
  store.score += dt * (360 + store.speed * 0.74);
  store.shake = Math.max(0, store.shake - dt * 3.2);

  const player = store.player;
  const horizontalIntent = (store.input.right ? 1 : 0) - (store.input.left ? 1 : 0);
  player.x = clamp(player.x + horizontalIntent * dt * 260, 108, 320);

  if (store.input.thrust && store.rocketFuel > 0) {
    player.vy -= 1320 * dt;
    player.vy = Math.max(player.vy, -510);
    store.rocketFuel = Math.max(0, store.rocketFuel - dt * 0.42);
    makeSparkBurst(store, player.x - 34, player.y + 22, "#ff8a37", 1);
  } else {
    player.vy += 1640 * dt;
  }

  player.y += player.vy * dt;
  const floorY = GROUND_Y - PLAYER_RADIUS;
  if (player.y >= floorY) {
    player.y = floorY;
    player.vy = 0;
    player.grounded = true;
  } else {
    player.grounded = false;
  }
  player.y = Math.max(106, player.y);

  if (store.runTime >= store.nextCoinAt) {
    spawnCoinRun(store);
    store.nextCoinAt = store.runTime + 1.15 + Math.random() * 0.75;
  }

  if (store.runTime >= store.nextObstacleAt) {
    spawnObstacle(store);
    store.nextObstacleAt = store.runTime + Math.max(0.82, 1.58 - store.runTime * 0.012 + Math.random() * 0.72);
  }

  if (store.runTime >= store.nextRocketAt) {
    spawnRocket(store);
    store.nextRocketAt = store.runTime + 6.4 + Math.random() * 2.8;
  }

  for (const pickup of store.pickups) {
    pickup.x -= store.speed * dt;
    pickup.spin += dt * (pickup.kind === "coin" ? 7.2 : 2.4);

    if (pickup.kind === "coin") {
      const distance = Math.hypot(pickup.x - player.x, pickup.y - player.y);
      if (distance < 178) {
        const pull = (1 - distance / 178) * 10.5 * dt;
        pickup.x += (player.x - pickup.x) * pull;
        pickup.y += (player.y - pickup.y) * pull;
      }
    }

    const hitRadius = pickup.kind === "coin" ? PLAYER_RADIUS + pickup.radius : PLAYER_RADIUS + 22;
    if (!pickup.collected && Math.hypot(pickup.x - player.x, pickup.y - player.y) < hitRadius) {
      pickup.collected = true;
      if (pickup.kind === "coin") {
        store.score += 520;
        makeSparkBurst(store, pickup.x, pickup.y, "#ffd25f", 12);
      } else {
        store.rocketFuel = 1;
        store.score += 720;
        makeSparkBurst(store, pickup.x, pickup.y, "#73d6ff", 18);
      }
    }
  }

  for (const obstacle of store.obstacles) {
    obstacle.x -= (store.speed + (obstacle.kind === "drone" ? 34 : 0)) * dt;
    if (
      !obstacle.hit &&
      now > player.hurtUntil &&
      circleRectHit(
        player.x,
        player.y,
        PLAYER_RADIUS * 0.86,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height,
      )
    ) {
      obstacle.hit = true;
      store.lives -= 1;
      store.shake = 1;
      player.hurtUntil = now + 1100;
      player.vy = -360;
      makeSparkBurst(store, player.x, player.y, "#ff6d6d", 20);
      if (store.lives <= 0) {
        finishRun(store, "lost");
      }
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

  if (store.score >= TARGET_SCORE && store.runTime >= MIN_WIN_SECONDS) {
    store.score = TARGET_SCORE;
    finishRun(store, "won");
  }
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
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#fff8e8");
  sky.addColorStop(0.44, "#dff5ff");
  sky.addColorStop(1, "#fbf5e7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.46;
  for (let i = 0; i < 7; i += 1) {
    const x = ((i * 190 - store.runTime * 18) % 1160) - 120;
    ctx.fillStyle = i % 2 ? "#ffffff" : "#ffe9c4";
    drawRoundedRect(ctx, x, 72 + (i % 3) * 34, 120 + (i % 3) * 44, 24, 18);
    ctx.fill();
  }
  ctx.restore();

  const horizon = ctx.createLinearGradient(0, 260, 0, GROUND_Y);
  horizon.addColorStop(0, "rgba(255, 214, 137, 0.22)");
  horizon.addColorStop(1, "rgba(129, 116, 91, 0.18)");
  ctx.fillStyle = horizon;
  ctx.beginPath();
  ctx.moveTo(0, 292);
  ctx.bezierCurveTo(180, 238, 284, 324, 424, 284);
  ctx.bezierCurveTo(584, 238, 720, 300, 960, 258);
  ctx.lineTo(WIDTH, GROUND_Y + 42);
  ctx.lineTo(0, GROUND_Y + 42);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#35322f";
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  ctx.fillStyle = "#494540";
  ctx.fillRect(0, GROUND_Y, WIDTH, 10);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i += 1) {
    const x = ((i * 86 - store.runTime * store.speed * 0.7) % 1040) - 80;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 56);
    ctx.lineTo(x + 58, GROUND_Y + 24);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 210, 95, 0.36)";
  ctx.setLineDash([36, 34]);
  ctx.lineDashOffset = -store.runTime * store.speed * 0.72;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 66);
  ctx.lineTo(WIDTH, GROUND_Y + 66);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCoin(ctx: CanvasRenderingContext2D, pickup: Pickup) {
  const squash = Math.abs(Math.cos(pickup.spin)) * 0.56 + 0.44;
  ctx.save();
  ctx.translate(pickup.x, pickup.y);
  ctx.scale(squash, 1);
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.beginPath();
  ctx.ellipse(0, 28, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  const coin = ctx.createRadialGradient(-6, -7, 3, 0, 0, 22);
  coin.addColorStop(0, "#fff7ad");
  coin.addColorStop(0.58, "#ffd25f");
  coin.addColorStop(1, "#d89825");
  ctx.fillStyle = coin;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(119, 74, 0, 0.28)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillRect(-3, -11, 6, 22);
  ctx.restore();
}

function drawRocketPickup(ctx: CanvasRenderingContext2D, pickup: Pickup) {
  ctx.save();
  ctx.translate(pickup.x, pickup.y + Math.sin(pickup.spin * 2) * 4);
  ctx.rotate(-0.22);
  ctx.fillStyle = "rgba(0, 0, 0, 0.17)";
  ctx.beginPath();
  ctx.ellipse(2, 34, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#eef8ff";
  drawRoundedRect(ctx, -28, -12, 56, 24, 12);
  ctx.fill();
  ctx.fillStyle = "#ff6b35";
  ctx.beginPath();
  ctx.moveTo(28, -12);
  ctx.lineTo(48, 0);
  ctx.lineTo(28, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#58c8f5";
  ctx.beginPath();
  ctx.arc(-8, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.moveTo(-30, -10);
  ctx.lineTo(-47, -22);
  ctx.lineTo(-34, 0);
  ctx.lineTo(-47, 22);
  ctx.lineTo(-30, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.beginPath();
  ctx.ellipse(obstacle.width / 2, obstacle.height + 9, obstacle.width * 0.58, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (obstacle.kind === "spike") {
    ctx.fillStyle = "#31343a";
    ctx.beginPath();
    ctx.moveTo(0, obstacle.height);
    ctx.lineTo(obstacle.width * 0.5, 0);
    ctx.lineTo(obstacle.width, obstacle.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.beginPath();
    ctx.moveTo(obstacle.width * 0.5, 7);
    ctx.lineTo(obstacle.width * 0.68, obstacle.height - 8);
    ctx.lineTo(obstacle.width * 0.52, obstacle.height - 8);
    ctx.closePath();
    ctx.fill();
  } else if (obstacle.kind === "drone") {
    ctx.fillStyle = "#2f3744";
    drawRoundedRect(ctx, 0, 8, obstacle.width, obstacle.height - 10, 12);
    ctx.fill();
    ctx.fillStyle = "#ff6868";
    ctx.beginPath();
    ctx.arc(obstacle.width * 0.7, obstacle.height * 0.48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#171b21";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, 12);
    ctx.lineTo(8, 18);
    ctx.moveTo(obstacle.width - 8, 18);
    ctx.lineTo(obstacle.width + 12, 12);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#8b6440";
    ctx.fillRect(0, 14, obstacle.width, obstacle.height - 14);
    ctx.fillStyle = "#b8834b";
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(14, 0);
    ctx.lineTo(obstacle.width, 0);
    ctx.lineTo(obstacle.width, obstacle.height - 14);
    ctx.lineTo(obstacle.width, 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(58, 35, 17, 0.42)";
    ctx.lineWidth = 4;
    ctx.strokeRect(7, 20, obstacle.width - 14, obstacle.height - 26);
  }
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, store: GameStore) {
  const { player } = store;
  const airborne = !player.grounded || store.rocketFuel > 0;
  const hurt = performance.now() < player.hurtUntil;
  const bob = Math.sin(store.runTime * 15) * (player.grounded ? 2.8 : 0);
  const squash = player.grounded ? 1 + Math.sin(store.runTime * 17) * 0.035 : 0.92;
  const stretch = player.grounded ? 1 - Math.sin(store.runTime * 17) * 0.035 : 1.1;

  ctx.save();
  ctx.translate(player.x, player.y + bob);
  if (hurt) {
    ctx.globalAlpha = 0.56 + Math.sin(store.runTime * 54) * 0.24;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, PLAYER_RADIUS + 16, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  if (store.rocketFuel > 0) {
    ctx.save();
    ctx.translate(-30, 12);
    ctx.rotate(0.12);
    ctx.fillStyle = "#eff9ff";
    drawRoundedRect(ctx, -38, -10, 44, 20, 9);
    ctx.fill();
    ctx.fillStyle = "#ff6337";
    ctx.fillRect(-2, -12, 12, 24);
    if (store.input.thrust) {
      const flame = ctx.createLinearGradient(-44, 0, -82, 0);
      flame.addColorStop(0, "#fff07b");
      flame.addColorStop(0.45, "#ff8a37");
      flame.addColorStop(1, "rgba(255, 74, 56, 0)");
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(-38, -9);
      ctx.lineTo(-82 - Math.random() * 10, 0);
      ctx.lineTo(-38, 9);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.scale(squash, stretch);
  const body = ctx.createRadialGradient(-12, -14, 7, 4, 0, 42);
  body.addColorStop(0, "#fff7b2");
  body.addColorStop(0.62, "#ffc948");
  body.addColorStop(1, "#f09a22");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 1, 31, 29, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f1a92e";
  ctx.beginPath();
  ctx.ellipse(-8, 6, 14, 18, -0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff4a4";
  ctx.beginPath();
  ctx.arc(18, -16, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1b1b1b";
  ctx.beginPath();
  ctx.arc(24, -20, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff7c31";
  ctx.beginPath();
  ctx.moveTo(34, -15);
  ctx.lineTo(53, -8);
  ctx.lineTo(34, -3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#8c4f19";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, 26);
  ctx.lineTo(-12, airborne ? 38 : 48);
  ctx.moveTo(9, 25);
  ctx.lineTo(13, airborne ? 39 : 48);
  ctx.stroke();
  ctx.restore();
}

function renderGame(ctx: CanvasRenderingContext2D, store: GameStore) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  if (store.shake > 0) {
    ctx.translate((Math.random() - 0.5) * store.shake * 14, (Math.random() - 0.5) * store.shake * 10);
  }
  drawBackground(ctx, store);
  for (const pickup of store.pickups) {
    if (pickup.kind === "coin") {
      drawCoin(ctx, pickup);
    } else {
      drawRocketPickup(ctx, pickup);
    }
  }
  for (const obstacle of store.obstacles) {
    drawObstacle(ctx, obstacle);
  }
  drawPlayer(ctx, store);

  for (const spark of store.sparks) {
    const alpha = 1 - spark.age / spark.life;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 2 + alpha * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function jumpOrThrust(store: GameStore) {
  if (store.phase !== "playing") return;
  store.input.thrust = true;
  if (store.player.grounded) {
    store.player.vy = -650;
    store.player.grounded = false;
    makeSparkBurst(store, store.player.x - 8, store.player.y + 30, "#ffd25f", 7);
  }
}

export default function GameOneClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const storeRef = useRef<GameStore>(createStore());
  const lastHudPhaseRef = useRef<GamePhase>("ready");
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);

  const syncHud = useCallback(() => {
    const store = storeRef.current;
    lastHudPhaseRef.current = store.phase;
    setHud(createHud(store));
  }, []);

  const begin = useCallback(() => {
    startRun(storeRef.current);
    syncHud();
  }, [syncHud]);

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
      if (now - store.lastHudAt > 80 || store.phase !== lastHudPhaseRef.current) {
        store.lastHudAt = now;
        lastHudPhaseRef.current = store.phase;
        setHud(createHud(store));
      }
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    renderGame(ctx, storeRef.current);
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const store = storeRef.current;
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        event.preventDefault();
        if (store.phase === "ready") {
          begin();
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
  }, [begin]);

  const handlePointerDown = () => {
    const store = storeRef.current;
    if (store.phase !== "playing") {
      begin();
    }
    jumpOrThrust(store);
  };

  const handlePointerUp = () => {
    storeRef.current.input.thrust = false;
  };

  const isVictory = hud.phase === "won" && hud.score >= TARGET_SCORE;
  const isFinished = isVictory || hud.phase === "lost";
  const phaseTitle =
    isVictory
      ? "10,000 hit - we're hiring"
      : hud.phase === "lost"
        ? "Run ended"
        : "Hit 10k - We're Hiring";

  return (
    <main className={styles.gamePage}>
      <section className={styles.shell} aria-labelledby="game-title">
        <div className={styles.copy}>
          <a className={styles.homeLink} href="/">
            XiaoTongYu / games
          </a>
          <p className={styles.kicker}>2.5D web runner</p>
          <h1 id="game-title">{phaseTitle}</h1>
          <p>
            Control a rocket chicken, collect magnetic coins, dodge 3D hazards,
            and reach 10,000 points to unlock the hiring message.
          </p>
          <div className={styles.controls}>
            <span>Space / W / tap: jump or thrust</span>
            <span>A/D: drift</span>
          </div>
        </div>

        <div className={styles.gameCard}>
          <div className={styles.hud} aria-live="polite">
            <div>
              <span>Score</span>
              <strong>{hud.score.toLocaleString()}</strong>
            </div>
            <div>
              <span>Best</span>
              <strong>{hud.bestScore.toLocaleString()}</strong>
            </div>
            <div>
              <span>Lives</span>
              <strong aria-label={`${hud.lives} lives`}>{"♥".repeat(Math.max(0, hud.lives))}</strong>
            </div>
          </div>

          <div className={styles.progress} aria-label={`Progress ${Math.round(hud.progress * 100)}%`}>
            <span style={{ transform: `scaleX(${hud.progress})` }} />
          </div>

          <button
            className={styles.stage}
            type="button"
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerUp}
            onPointerUp={handlePointerUp}
            aria-label="Start or control the Hit 10k game"
          >
            <canvas ref={canvasRef} className={styles.canvas} />
            {hud.phase !== "playing" ? (
              <span className={styles.startOverlay}>
                <strong>{hud.phase === "ready" ? "Start run" : "Run again"}</strong>
                <small>Tap, click, or press Space</small>
              </span>
            ) : null}
          </button>

          <div className={styles.boostMeter}>
            <span>Rocket fuel</span>
            <div>
              <i style={{ transform: `scaleX(${hud.rocketFuel})` }} />
            </div>
          </div>
        </div>
      </section>

      {isFinished ? (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="game-result-title">
          <div className={styles.modalCard}>
            <p className={styles.kicker}>{isVictory ? "Mission complete" : "Try another run"}</p>
            <h2 id="game-result-title">
              {isVictory ? "You hit 10k. We're hiring." : "The chicken needs another sprint."}
            </h2>
            <p>
              {isVictory
                ? "You handled jumps, magnet coins, rocket flight, and moving obstacles. Send the same energy to product engineering."
                : "Collect rockets earlier, hold thrust through dense coin arcs, and keep three hearts alive."}
            </p>
            <div className={styles.resultStats} aria-label="Run result">
              <span>
                Final score <strong>{hud.score.toLocaleString()}</strong>
              </span>
              <span>
                Best <strong>{hud.bestScore.toLocaleString()}</strong>
              </span>
              <span>
                Lives <strong>{hud.lives}</strong>
              </span>
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={begin}>
                Play again
              </button>
              {isVictory ? (
                <a href="mailto:work@xiaotongyu.com?subject=Hit%2010k%20-%20We're%20Hiring">
                  Apply / say hi
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
