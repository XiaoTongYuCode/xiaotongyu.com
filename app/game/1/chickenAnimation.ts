import { COYOTE_TIME_MS, JUMP_VELOCITY, PLAYER_RADIUS } from "./gameConstants";
import { clamp } from "./gameMath";
import { type ChickenAnimationMode, type GameStore, type PlayerState } from "./gameTypes";

export function getChickenAnimationState(store: GameStore, now: number) {
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

export function canUseGroundedJump(player: PlayerState, now: number) {
  return player.grounded || (player.lastGroundedAt > 0 && now - player.lastGroundedAt <= COYOTE_TIME_MS);
}
