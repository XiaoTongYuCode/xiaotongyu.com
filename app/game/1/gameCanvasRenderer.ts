import { GROUND_Y, HEIGHT, WIDTH } from "./gameConstants";
import { clamp } from "./gameMath";
import { type GameStore } from "./gameTypes";

export function drawRoundedRect(
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

export function drawBackground(ctx: CanvasRenderingContext2D, store: GameStore) {
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

export function getScoreTagTarget() {
  return { x: WIDTH - 178, y: 88 };
}

export function drawCoinCollectFeedback(ctx: CanvasRenderingContext2D, store: GameStore, now: number) {
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

export function renderGame(ctx: CanvasRenderingContext2D, store: GameStore) {
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
