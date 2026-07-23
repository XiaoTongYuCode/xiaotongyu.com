import type { Scene } from "./types";

type TimelineSource = {
  duration: number;
};

type TimelinePhase =
  | {
      type: "play";
      index: number;
      start: number;
      end: number;
      weight: number;
      from: number;
      to: number;
    }
  | {
      type: "transition";
      a: number;
      b: number;
      start: number;
      end: number;
      weight: number;
      fromA: number;
      targetA: number;
      fromB: number;
      toB: number;
    };

export type TimelineState = {
  a: number;
  b: number;
  sceneIndex: number;
  local: number;
  morph: number;
  phaseType: "play" | "transition";
  progressA: number;
  progressB: number;
};

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

export function mixNumber(from: number, to: number, value: number) {
  return from + (to - from) * clamp(value);
}

function expoIn(value: number) {
  const t = clamp(value);
  if (t <= 0) return 0;
  return Math.pow(2, 10 * t - 10);
}

function expoOut(value: number) {
  const t = clamp(value);
  if (t >= 1) return 1;
  return 1 - Math.pow(2, -10 * t);
}

function recordDuration(scene: Scene, source?: TimelineSource) {
  const duration = source?.duration || scene.duration;
  return Number.isFinite(duration) && duration > 0.05 ? duration : 1;
}

function transitionEdge(duration: number) {
  return clamp(0.7 / duration, 0.08, 0.22);
}

export function timelinePhases(scenes: Scene[], sources: TimelineSource[], transitionSpeed: number) {
  const phases: TimelinePhase[] = [];
  let cursor = 0;
  const lastIndex = scenes.length - 1;
  for (let index = 0; index <= lastIndex; index += 1) {
    const duration = recordDuration(scenes[index], sources[index]);
    const enter = index === 0 ? 0 : transitionEdge(duration);
    const exit = index === lastIndex ? 0 : transitionEdge(duration);
    const from = enter;
    const to = 1 - exit;
    const playWeight = Math.max(0.001, duration * Math.max(0.001, to - from) * (scenes[index].holdMultiplier ?? 1) * 22);
    phases.push({ type: "play", index, start: cursor, end: cursor + playWeight, weight: playWeight, from, to });
    cursor += playWeight;

    if (index < lastIndex) {
      const nextDuration = recordDuration(scenes[index + 1], sources[index + 1]);
      const nextEnter = transitionEdge(nextDuration);
      const reverseCurrent = Boolean(scenes[index].reverse);
      const reverseNext = Boolean(scenes[index + 1].reverse);
      const transitionWeight =
        (Math.max(1.35, Math.min(2.55, (exit * duration + nextEnter * nextDuration) * 1.18)) *
          (scenes[index + 1].transitionInScale ?? 1)) /
        transitionSpeed;
      phases.push({
        type: "transition",
        a: index,
        b: index + 1,
        start: cursor,
        end: cursor + transitionWeight,
        weight: transitionWeight,
        fromA: reverseCurrent ? enter : to,
        targetA: reverseCurrent ? 0 : 1,
        fromB: reverseNext ? 1 : 0,
        toB: reverseNext ? 1 - nextEnter : nextEnter,
      });
      cursor += transitionWeight;
    }
  }
  return phases;
}

export function resolveTimeline(scenes: Scene[], scroll: number, sources: TimelineSource[], transitionSpeed: number): TimelineState {
  const lastIndex = scenes.length - 1;
  if (lastIndex <= 0) {
    return { a: 0, b: 0, sceneIndex: 0, local: scroll, morph: 0, phaseType: "play", progressA: scroll, progressB: scroll };
  }
  if (scroll >= 0.999) {
    return { a: lastIndex, b: lastIndex, sceneIndex: lastIndex, local: 1, morph: 0, phaseType: "play", progressA: 1, progressB: 1 };
  }
  const phases = timelinePhases(scenes, sources, transitionSpeed);
  const total = phases[phases.length - 1]?.end || 1;
  const position = clamp(scroll) * total;
  const phase = phases.find((candidate) => position <= candidate.end) || phases[phases.length - 1];
  const local = phase.weight > 0 ? clamp((position - phase.start) / phase.weight) : 1;
  if (phase.type === "transition") {
    const morph = clamp(local);
    return {
      a: phase.a,
      b: phase.b,
      sceneIndex: morph < 0.5 ? phase.a : phase.b,
      local,
      morph,
      phaseType: "transition",
      progressA: mixNumber(phase.fromA, phase.targetA, expoOut(local)),
      progressB: mixNumber(phase.fromB, phase.toB, expoIn(local)),
    };
  }

  let playLocal = local;
  const playbackEndAt = scenes[phase.index].playbackEndAt ?? 1;
  if (playbackEndAt < 1) {
    playLocal = Math.min(1, local / playbackEndAt);
  }
  if (scenes[phase.index].reverse) {
    playLocal = 1 - playLocal;
  }
  const progress = mixNumber(phase.from, phase.to, playLocal);
  return {
    a: phase.index,
    b: phase.index,
    sceneIndex: phase.index,
    local,
    morph: 0,
    phaseType: "play",
    progressA: progress,
    progressB: progress,
  };
}
