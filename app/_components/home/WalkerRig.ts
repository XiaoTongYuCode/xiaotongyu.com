import { WALKING_STYLES } from "./walkingStyles";

type Point = { x: number; y: number };
type Foot = { center: Point; ankle: Point; heel: Point; toe: Point; angle: number; stance: boolean; phase: number };
type Leg = { hip: Point; knee: Point; ankle: Point; foot: Foot };
export type WalkerPose = { hip: Point; shoulder: Point; head: Point; legs: Leg[]; phase: number; variant: number };

export const WALKER_VARIANTS = WALKING_STYLES.length;
export const STANCE_FRACTION = .62;
const TAU = Math.PI * 2;
const HEIGHT = 99;
const THIGH = 24;
const SHIN = 24;
const TORSO = 33.8;
const HIP_REFERENCE = -(THIGH + SHIN - .8);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x: number) => { const p = clamp(x); return p * p * (3 - 2 * p); };
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Heel contact, flat-foot support, toe-off, then a low clearance swing. */
export function footPose(phase: number, variant = 0): Foot {
  const walk = WALKING_STYLES[variant];
  const travel = HEIGHT * walk.stride;
  const p = ((phase % 1) + 1) % 1;
  const stance = p < STANCE_FRACTION;
  const reach = travel * STANCE_FRACTION / 2;
  let x: number, y = 0, angle: number;
  if (stance) {
    // Root travel and this backward foot motion cancel in ground coordinates.
    x = reach - travel * p;
    angle = -walk.heelStrike * (1 - ease(p / .10)) + walk.toeOff * ease((p - .44) / .18);
  } else {
    const s = (p - STANCE_FRACTION) / (1 - STANCE_FRACTION);
    const tangent = -travel * (1 - STANCE_FRACTION);
    const s2 = s * s, s3 = s2 * s;
    x = (2 * s3 - 3 * s2 + 1) * -reach + (s3 - 2 * s2 + s) * tangent
      + (-2 * s3 + 3 * s2) * reach + (s3 - s2) * tangent;
    // A shallow, slightly early clearance arc lets the leg pass underneath the
    // body. The former tall arc forced the IK knee into a marching pose.
    const arc = Math.sin(Math.PI * s);
    y = -walk.clearance * arc * arc * (1 + .18 * Math.sin(TAU * s));
    angle = mix(walk.toeOff, -walk.heelStrike, ease(s));
  }
  const pivot = angle < 0 ? -3 : 7;
  const transform = (localX: number, localY: number): Point => ({
    x: x + pivot + (localX - pivot) * Math.cos(angle) - localY * Math.sin(angle),
    y: y + (localX - pivot) * Math.sin(angle) + localY * Math.cos(angle),
  });
  return { center: { x, y }, ankle: transform(0, -3.2), heel: transform(-3, 0), toe: transform(7, 0), angle, stance, phase: p };
}

/** Most of a step is extended; flexion belongs to loading and early recovery. */
function kneeFlexion(foot: Foot) {
  const p = foot.phase;
  if (foot.stance) {
    if (p < .10) return mix(5, 10, ease(p / .10));
    if (p < .25) return mix(10, 4, ease((p - .10) / .15));
    if (p < .46) return 4;
    return mix(4, 18, ease((p - .46) / (STANCE_FRACTION - .46)));
  }
  const swing = (p - STANCE_FRACTION) / (1 - STANCE_FRACTION);
  if (swing < .18) return mix(18, 36, ease(swing / .18));
  // Extend well before heel contact, rather than carrying a bent knee forward.
  return mix(36, 5, ease((swing - .18) / .48));
}

function kneeFor(hip: Point, foot: Foot): Point {
  const ankle = foot.ankle;
  const dx = ankle.x - hip.x, dy = ankle.y - hip.y;
  const distance = Math.max(.01, Math.hypot(dx, dy));
  // A tiny reach tolerance avoids a knee pop at nearly straight support poses.
  const stretch = Math.max(1, distance / (THIGH + SHIN - .15));
  const upper = THIGH * stretch, lower = SHIN * stretch;
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance);
  const geometricBend = Math.sqrt(Math.max(.02, upper * upper - along * along));
  // This side-view rig allows modest foreshortening instead of resolving every
  // short hip-to-ankle distance by visibly bending the supporting knee.
  const bend = Math.min(geometricBend, distance * .5 * Math.tan(kneeFlexion(foot) * Math.PI / 360));
  return { x: hip.x + dx / distance * along + dy / distance * bend,
    y: hip.y + dy / distance * along - dx / distance * bend };
}

export function walkerPose(phase: number, variant: number): WalkerPose {
  const cycle = phase / TAU;
  const walk = WALKING_STYLES[variant];
  const feet = [footPose(cycle + .5 + walk.asymmetry, variant), footPose(cycle, variant)];
  const sway = Math.sin(phase) * walk.sway;
  // The weight-bearing foot sets pelvis height. Transfer that weight smoothly
  // during double support; the unweighted swinging foot cannot pull it down.
  let weightedHeight = 0, totalWeight = 0;
  feet.forEach((foot, side) => {
    if (!foot.stance) return;
    const weight = ease(foot.phase / .12) * (1 - ease((foot.phase - .50) / .12));
    const dx = foot.ankle.x - (sway + (side === 0 ? -.8 : .8));
    const reach = (THIGH + SHIN) * Math.cos(4 * Math.PI / 360);
    weightedHeight += weight * (foot.ankle.y - Math.sqrt(Math.max(1, reach * reach - dx * dx)));
    totalWeight += weight;
  });
  let hipY = weightedHeight / Math.max(.001, totalWeight);
  feet.forEach((foot, side) => {
    const dx = foot.ankle.x - (sway + (side === 0 ? -.8 : .8));
    // A loose reach guard keeps side-view limb extension around 2%
    // without forcing both knees to flex throughout weight transfer.
    const reach = (THIGH + SHIN) * 1.02;
    hipY = Math.max(hipY, foot.ankle.y - Math.sqrt(Math.max(1, reach * reach - dx * dx)));
  });
  const hip = { x: sway, y: hipY };
  const hipOffset = hipY - HIP_REFERENCE;
  const shoulder = { x: sway * .4 + walk.lean - Math.sin(phase + walk.lag) * .42,
    y: hipY - TORSO - hipOffset * .48 };
  const head = { x: shoulder.x + 1.0 - Math.sin(phase + walk.lag + .16) * .19,
    y: shoulder.y - 10.2 - hipOffset * .12 };
  return { hip, shoulder, head, phase, variant,
    legs: feet.map((foot, side) => {
      const joint = { x: hip.x + (side === 0 ? -.8 : .8), y: hip.y };
      return { hip: joint, knee: kneeFor(joint, foot), ankle: foot.ankle, foot };
    }) };
}

type Wardrobe = { shoulder: number; waist: number; hem: number; length: number; trouser: number; tone: number; hair: number; carry: "none" | "satchel" | "tote" | "backpack" | "pocket" };
const WARDROBES: Wardrobe[] = ([
  { shoulder: 10.4, waist: 8.7, hem: 9.6, length: 5, trouser: 4.2, tone: 82, hair: 0, carry: "satchel" },
  { shoulder: 10.0, waist: 9.8, hem: 12.4, length: 17, trouser: 3.8, tone: 106, hair: 1, carry: "pocket" },
  { shoulder: 9.2, waist: 8.3, hem: 10.9, length: 12, trouser: 3.5, tone: 95, hair: 2, carry: "tote" },
  { shoulder: 12.1, waist: 12.0, hem: 11.3, length: 6, trouser: 4.8, tone: 75, hair: 0, carry: "backpack" },
  { shoulder: 10.7, waist: 10.2, hem: 13.3, length: 20, trouser: 4.2, tone: 91, hair: 2, carry: "none" },
  { shoulder: 9.4, waist: 8.5, hem: 9.4, length: 4, trouser: 3.7, tone: 116, hair: 3, carry: "pocket" },
  { shoulder: 10.8, waist: 9.7, hem: 10.2, length: 7, trouser: 3.9, tone: 88, hair: 1, carry: "none" },
  { shoulder: 11.5, waist: 10.8, hem: 11.6, length: 11, trouser: 5.0, tone: 101, hair: 0, carry: "tote" },
] satisfies Wardrobe[]).map((style) => ({
  ...style,
  shoulder: style.shoulder * 1.10,
  waist: style.waist * 1.12,
  hem: style.hem * 1.10,
  trouser: style.trouser * 1.08,
}));
const gray = (v: number) => `rgb(${v},${v},${v})`;

function oval(ctx: CanvasRenderingContext2D, point: Point, rx: number, ry: number, color: string) {
  ctx.beginPath(); ctx.ellipse(point.x, point.y, rx, ry, -.08, 0, TAU); ctx.fillStyle = color; ctx.fill();
}

/** Tapered garment volume around a joint chain, instead of equal-width tubes. */
function garment(ctx: CanvasRenderingContext2D, joints: Point[], widths: number[], color: string) {
  const sides = [-1, 1].map((side) => joints.map((joint, index) => {
    const before = joints[Math.max(0, index - 1)], after = joints[Math.min(joints.length - 1, index + 1)];
    const dx = after.x - before.x, dy = after.y - before.y, length = Math.max(.01, Math.hypot(dx, dy));
    return { x: joint.x + side * dy / length * widths[index], y: joint.y - side * dx / length * widths[index] };
  }));
  ctx.beginPath();
  ctx.moveTo(sides[0][0].x, sides[0][0].y);
  ctx.lineTo(mix(sides[0][0].x, sides[0][1].x, .85), mix(sides[0][0].y, sides[0][1].y, .85));
  ctx.quadraticCurveTo(sides[0][1].x, sides[0][1].y,
    mix(sides[0][1].x, sides[0][2].x, .15), mix(sides[0][1].y, sides[0][2].y, .15));
  ctx.lineTo(sides[0][2].x, sides[0][2].y);
  ctx.quadraticCurveTo(joints[2].x, joints[2].y + widths[2] * .65, sides[1][2].x, sides[1][2].y);
  ctx.lineTo(mix(sides[1][2].x, sides[1][1].x, .85), mix(sides[1][2].y, sides[1][1].y, .85));
  ctx.quadraticCurveTo(sides[1][1].x, sides[1][1].y,
    mix(sides[1][1].x, sides[1][0].x, .15), mix(sides[1][1].y, sides[1][0].y, .15));
  ctx.lineTo(sides[1][0].x, sides[1][0].y);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}

function shoe(ctx: CanvasRenderingContext2D, foot: Foot, tone: number) {
  ctx.save();
  ctx.translate(foot.heel.x, foot.heel.y);
  ctx.rotate(foot.angle);
  ctx.beginPath(); ctx.moveTo(0, -.3); ctx.lineTo(.2, -3.6);
  ctx.quadraticCurveTo(3.2, -4.5, 5.0, -2.6);
  ctx.quadraticCurveTo(7.5, -2.3, 10.6, -1.5);
  ctx.quadraticCurveTo(11.4, .2, 9.5, .5); ctx.lineTo(.4, .4);
  ctx.closePath(); ctx.fillStyle = gray(tone); ctx.fill(); ctx.restore();
}

function arm(ctx: CanvasRenderingContext2D, pose: WalkerPose, style: Wardrobe, near: boolean) {
  const shift = near ? 1 : -1;
  const walk = WALKING_STYLES[pose.variant];
  const shoulder = { x: pose.shoulder.x + shift * 2.1, y: pose.shoulder.y + 2.1 };
  const held = near && style.carry !== "none" && style.carry !== "backpack";
  const armPhase = pose.phase + (near ? 0 : Math.PI) - walk.lag;
  const swing = (-Math.cos(armPhase) + .06 * Math.sin(armPhase * 2 + .4)) * (held ? .025 : walk.arm * (near ? 1 : .88));
  const upperAngle = swing + (style.carry === "pocket" && held ? -.05 : .02);
  const lowerAngle = upperAngle + (held && style.carry === "pocket" ? .48 : .18);
  const elbow = { x: shoulder.x + Math.sin(upperAngle) * 19.0, y: shoulder.y + Math.cos(upperAngle) * 19.0 };
  const hand = { x: elbow.x + Math.sin(lowerAngle) * 17.0, y: elbow.y + Math.cos(lowerAngle) * 17.0 };
  garment(ctx, [shoulder, elbow, hand], [4.3, 3.35, 2.25], gray(style.tone + (near ? -3 : 18)));
  if (!(held && style.carry === "pocket")) oval(ctx, { x: hand.x + .1, y: hand.y + 1.2 }, 1.5, 2.4, gray(style.tone + 30));
  return hand;
}

export function drawWalker(ctx: CanvasRenderingContext2D, phase: number, variant: number) {
  const style = WARDROBES[variant];
  const pose = walkerPose(phase, variant);
  ctx.save(); ctx.translate(44, 117);
  arm(ctx, pose, style, false);
  pose.legs.forEach((leg, index) => {
    garment(ctx, [leg.hip, leg.knee, leg.ankle], [style.trouser + .6, style.trouser * .84, style.trouser * .66], gray(style.tone + (index ? -4 : 18)));
    shoe(ctx, leg.foot, style.tone - (index ? 12 : 0));
  });

  const { hip, shoulder, head } = pose;
  const hemY = hip.y + style.length;
  const hemLag = Math.sin(phase - .65) * (style.length > 10 ? 1.5 : .4);
  const shading = ctx.createLinearGradient(shoulder.x - style.shoulder, shoulder.y, shoulder.x + style.shoulder, shoulder.y + 7);
  shading.addColorStop(0, gray(style.tone + 17)); shading.addColorStop(.52, gray(style.tone)); shading.addColorStop(1, gray(style.tone - 8));
  ctx.beginPath();
  ctx.moveTo(shoulder.x - 3.2, shoulder.y - 2);
  ctx.quadraticCurveTo(shoulder.x - style.shoulder * .8, shoulder.y - 1.8, shoulder.x - style.shoulder, shoulder.y + 3.8);
  ctx.bezierCurveTo(shoulder.x - style.shoulder - .8, shoulder.y + 12, hip.x - style.waist, hip.y - 9, hip.x - style.hem + hemLag, hemY - 1.4);
  ctx.quadraticCurveTo(hip.x - 1 + hemLag, hemY + 1.6, hip.x + style.hem + hemLag * .4, hemY - .8);
  ctx.bezierCurveTo(hip.x + style.waist, hip.y - 9, shoulder.x + style.shoulder + 1, shoulder.y + 12, shoulder.x + style.shoulder - 1, shoulder.y + 4);
  ctx.quadraticCurveTo(shoulder.x + style.shoulder * .55, shoulder.y - 2, shoulder.x + 3.1, shoulder.y - 2.3);
  ctx.closePath(); ctx.fillStyle = shading; ctx.fill();

  // Collar, neck and asymmetric head/hair silhouette keep the clothed body joined.
  ctx.fillStyle = gray(style.tone + 24);
  ctx.beginPath(); ctx.moveTo(shoulder.x - 2.0, shoulder.y + .5); ctx.lineTo(head.x - 2.2, head.y + 5);
  ctx.lineTo(head.x + 2.6, head.y + 5); ctx.lineTo(shoulder.x + 3.3, shoulder.y + .3); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(head.x - 3.7, head.y + 4.8);
  ctx.bezierCurveTo(head.x - 6, head.y + .4, head.x - 5.6, head.y - 6.7, head.x - .7, head.y - 7.1);
  ctx.bezierCurveTo(head.x + 3.5, head.y - 7.6, head.x + 4.7, head.y - 4.4, head.x + 4.0, head.y - 1.6);
  ctx.lineTo(head.x + 5.6, head.y + .1); ctx.lineTo(head.x + 4.0, head.y + 1.2);
  ctx.quadraticCurveTo(head.x + 4.0, head.y + 5.7, head.x + .8, head.y + 6.1);
  ctx.closePath(); ctx.fillStyle = gray(style.tone + 28); ctx.fill();
  ctx.beginPath(); ctx.moveTo(head.x - 4.0, head.y + 3.7);
  ctx.bezierCurveTo(head.x - 7.0, head.y - 2, head.x - 4.5, head.y - 8.5, head.x + .5, head.y - 7.5);
  ctx.quadraticCurveTo(head.x + 4.8, head.y - 7.3, head.x + 4.3, head.y - 3.9);
  ctx.quadraticCurveTo(head.x + .2, head.y - 5.1, head.x - .8, head.y - 2.3);
  ctx.lineTo(head.x - 1.7, head.y + 3.4); ctx.closePath();
  ctx.fillStyle = gray(style.hair === 3 ? 134 : style.tone - 15); ctx.fill();
  if (style.hair === 2) oval(ctx, { x: head.x - 4.1, y: head.y + 4.8 }, 3.6, 7.7, gray(style.tone - 11));
  if (style.hair === 1) oval(ctx, { x: head.x - 5.3, y: head.y - .5 }, 2.7, 3.7, gray(style.tone - 15));

  if (style.carry === "backpack") {
    ctx.beginPath(); ctx.moveTo(shoulder.x - 8, shoulder.y + 4);
    ctx.bezierCurveTo(shoulder.x - 16, shoulder.y + 2, shoulder.x - 15, shoulder.y + 23, shoulder.x - 9, shoulder.y + 25);
    ctx.lineTo(shoulder.x - 6.3, shoulder.y + 8); ctx.closePath(); ctx.fillStyle = gray(style.tone - 9); ctx.fill();
  }
  const hand = arm(ctx, pose, style, true);
  if (style.carry === "satchel") {
    ctx.strokeStyle = gray(style.tone - 18); ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.moveTo(shoulder.x - 3.4, shoulder.y + 1); ctx.lineTo(hip.x + 7, hip.y - 2); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(hip.x + 3.6, hip.y - 8.4, 7.8, 12.4, 2); ctx.fillStyle = gray(style.tone - 12); ctx.fill();
  }
  if (style.carry === "tote") {
    const lag = Math.sin(phase - .9) * .8;
    ctx.strokeStyle = gray(style.tone - 15); ctx.lineWidth = .9;
    ctx.beginPath(); ctx.ellipse(hand.x + lag, hand.y + 3, 3, 4, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hand.x - 4 + lag, hand.y + 5);
    ctx.lineTo(hand.x + 4.2 + lag, hand.y + 5.4); ctx.lineTo(hand.x + 5 + lag, hand.y + 17);
    ctx.quadraticCurveTo(hand.x, hand.y + 18.5, hand.x - 4.3 + lag, hand.y + 16.4);
    ctx.closePath(); ctx.fillStyle = gray(style.tone - 7); ctx.fill();
  }
  ctx.restore();
}
