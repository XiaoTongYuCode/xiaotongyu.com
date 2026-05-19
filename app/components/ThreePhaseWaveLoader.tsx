"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useRef, useState } from "react";

type LoaderPhase = "intro" | "waiting" | "exiting" | "done";

type TrackPoint = {
  x: number;
  y: number;
};

type WaveTrackOptions = {
  circleProgress?: number;
  widthScale?: number;
};

export type ThreePhaseWaveLoaderProps = {
  buttonLabel?: string;
  className?: string;
  exitDurationMs?: number;
  introDurationMs?: number;
  lockBodyScroll?: boolean;
  onComplete?: () => void;
};

const toPathCoordinate = (value: number) => value.toFixed(2);

const pointsToSmoothPath = (points: TrackPoint[]) => {
  const firstPoint = points[0];
  let path = `M${toPathCoordinate(firstPoint.x)} ${toPathCoordinate(firstPoint.y)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[Math.min(points.length - 1, index + 2)];
    const controlA = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlB = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    };

    path += ` C${toPathCoordinate(controlA.x)} ${toPathCoordinate(controlA.y)} ${toPathCoordinate(controlB.x)} ${toPathCoordinate(controlB.y)} ${toPathCoordinate(next.x)} ${toPathCoordinate(next.y)}`;
  }

  return path;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const easeInCubic = (value: number) => value * value * value;
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
const smoothStep = (value: number) => {
  const progress = clamp(value);

  return progress * progress * (3 - 2 * progress);
};

const buildWaveTrackPath = (phase = 0, options: WaveTrackOptions = {}) => {
  const segmentCount = 28;
  const centerX = 80;
  const centerY = 36;
  const widthScale = options.widthScale ?? 1;
  const circleProgress = options.circleProgress ?? 0;
  const width = 124 * widthScale;
  const leftX = centerX - width / 2;
  const amplitude = 17;
  const circleRadius = 15;
  const halfWavelengthOffset = Math.PI;
  const buildRailPoint = (progress: number, railOffset: number, rail: "upper" | "lower") => {
    const sampleX = progress * Math.PI * 2 + phase;
    const endpointGate = Math.pow(Math.sin(progress * Math.PI), 0.36);
    const wave = Math.sin(sampleX + railOffset);
    const envelope =
      0.84 +
      Math.sin(sampleX * 0.82 + railOffset) * 0.11 +
      Math.sin(sampleX * 1.74 - railOffset) * 0.05;

    const wavePoint = {
      x: leftX + progress * width,
      y: centerY + wave * endpointGate * amplitude * envelope,
    };
    const circlePoint = {
      x: centerX - Math.cos(progress * Math.PI) * circleRadius,
      y:
        centerY +
        Math.sin(progress * Math.PI) * circleRadius * (rail === "upper" ? -1 : 1),
    };

    return {
      x: lerp(wavePoint.x, circlePoint.x, circleProgress),
      y: lerp(wavePoint.y, circlePoint.y, circleProgress),
    };
  };

  const upperRail = Array.from({ length: segmentCount + 1 }, (_, index) => {
    const progress = index / segmentCount;

    return buildRailPoint(progress, 0, "upper");
  });
  const lowerRail = Array.from({ length: segmentCount }, (_, index) => {
    const progress = (segmentCount - index - 1) / segmentCount;

    return buildRailPoint(progress, halfWavelengthOffset, "lower");
  });

  return `${pointsToSmoothPath([...upperRail, ...lowerRail])} Z`;
};

const initialTrackPath = buildWaveTrackPath();
const DEFAULT_INTRO_DURATION_MS = 1280;
const DEFAULT_EXIT_DURATION_MS = 2800;

export default function ThreePhaseWaveLoader({
  buttonLabel = "Enter site",
  className,
  exitDurationMs = DEFAULT_EXIT_DURATION_MS,
  introDurationMs = DEFAULT_INTRO_DURATION_MS,
  lockBodyScroll = true,
  onComplete,
}: ThreePhaseWaveLoaderProps) {
  const [phase, setPhase] = useState<LoaderPhase>("intro");
  const svgId = useId().replace(/:/g, "");
  const exitTimerRef = useRef<number | null>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);
  const exitStartedAtRef = useRef<number | null>(null);
  const trackPhaseRef = useRef(0);
  const lastTrackFrameTimeRef = useRef<number | null>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const basePathRef = useRef<SVGPathElement>(null);
  const midDistancePathRef = useRef<SVGPathElement>(null);
  const farDistancePathRef = useRef<SVGPathElement>(null);

  const midMaskId = `tpwl-mid-mask-${svgId}`;
  const farMaskId = `tpwl-far-mask-${svgId}`;
  const midGradientId = `tpwl-mid-mask-gradient-${svgId}`;
  const farGradientId = `tpwl-far-mask-gradient-${svgId}`;

  useEffect(() => {
    if (!lockBodyScroll) {
      return undefined;
    }

    if (phase !== "done" && previousBodyOverflowRef.current === null) {
      previousBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    if (phase === "done" && previousBodyOverflowRef.current !== null) {
      document.body.style.overflow = previousBodyOverflowRef.current;
      previousBodyOverflowRef.current = null;
    }

    return () => {
      if (previousBodyOverflowRef.current !== null) {
        document.body.style.overflow = previousBodyOverflowRef.current;
        previousBodyOverflowRef.current = null;
      }
    };
  }, [lockBodyScroll, phase]);

  useEffect(() => {
    const introTimer = window.setTimeout(() => {
      setPhase((currentPhase) => (currentPhase === "intro" ? "waiting" : currentPhase));
    }, introDurationMs);

    return () => {
      window.clearTimeout(introTimer);
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, [introDurationMs]);

  useEffect(() => {
    if (phase === "done") {
      onComplete?.();
    }
  }, [onComplete, phase]);

  useEffect(() => {
    if (phase === "done") {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return undefined;
    }

    let animationFrame = 0;
    lastTrackFrameTimeRef.current = null;

    const animateTrack = (time: number) => {
      const previousTime = lastTrackFrameTimeRef.current ?? time;
      const elapsed = time - previousTime;
      const exitProgress =
        phase === "exiting" && exitStartedAtRef.current !== null
          ? clamp((time - exitStartedAtRef.current) / exitDurationMs)
          : 0;
      const exitAcceleration = easeInCubic(exitProgress);
      const speed =
        phase === "exiting"
          ? 0.004 + exitAcceleration * 0.196
          : phase === "waiting"
            ? 0.0032
            : 0.0016;
      const narrowProgress = easeOutCubic(clamp((exitProgress - 0.48) / 0.2));
      const widthScale = phase === "exiting" ? lerp(1, 0.28, narrowProgress) : 1;
      const circleProgress =
        phase === "exiting" ? smoothStep((exitProgress - 0.84) / 0.1) : 0;
      trackPhaseRef.current += elapsed * speed;
      lastTrackFrameTimeRef.current = time;
      const currentPath = buildWaveTrackPath(trackPhaseRef.current, {
        circleProgress,
        widthScale,
      });
      const pathElements = [
        glowPathRef.current,
        basePathRef.current,
        midDistancePathRef.current,
        farDistancePathRef.current,
      ].filter((element): element is SVGPathElement => Boolean(element));

      pathElements.forEach((element) => {
        element.setAttribute("d", currentPath);
      });
      animationFrame = window.requestAnimationFrame(animateTrack);
    };

    animationFrame = window.requestAnimationFrame(animateTrack);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [exitDurationMs, phase]);

  const enterSite = () => {
    if (phase === "exiting" || phase === "done") {
      return;
    }

    setPhase("exiting");
    exitStartedAtRef.current = performance.now();
    exitTimerRef.current = window.setTimeout(() => {
      setPhase("done");
    }, exitDurationMs);
  };

  if (phase === "done") {
    return null;
  }

  return (
    <div
      className={["tpwl", `tpwl--${phase}`, className].filter(Boolean).join(" ")}
      style={{ "--tpwl-exit-duration": `${exitDurationMs}ms` } as CSSProperties}
      role="dialog"
      aria-modal="true"
    >
      <style>{loaderStyles}</style>
      <div className="tpwl__stage">
        <svg
          className="tpwl__mark"
          viewBox="0 0 160 72"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              id={midGradientId}
              x1="0"
              x2="0"
              y1="10"
              y2="62"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0.78" />
              <stop offset="0.34" stopColor="#fff" stopOpacity="0.12" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.04" />
              <stop offset="0.66" stopColor="#fff" stopOpacity="0.12" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.78" />
            </linearGradient>
            <linearGradient
              id={farGradientId}
              x1="0"
              x2="0"
              y1="10"
              y2="62"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="0.26" stopColor="#fff" stopOpacity="0.28" />
              <stop offset="0.44" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.56" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.74" stopColor="#fff" stopOpacity="0.28" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
            </linearGradient>
            <mask id={midMaskId} maskUnits="userSpaceOnUse">
              <rect width="160" height="72" fill={`url(#${midGradientId})`} />
            </mask>
            <mask id={farMaskId} maskUnits="userSpaceOnUse">
              <rect width="160" height="72" fill={`url(#${farGradientId})`} />
            </mask>
          </defs>
          <g className="tpwl__symbol">
            <g className="tpwl__ribbon">
              <path
                ref={glowPathRef}
                className="tpwl__glow"
                pathLength="1"
                d={initialTrackPath}
              />
              <path
                ref={basePathRef}
                className="tpwl__base"
                pathLength="1"
                d={initialTrackPath}
              />
              <path
                ref={midDistancePathRef}
                className="tpwl__distance tpwl__distance--mid"
                pathLength="1"
                d={initialTrackPath}
                mask={`url(#${midMaskId})`}
              />
              <path
                ref={farDistancePathRef}
                className="tpwl__distance tpwl__distance--far"
                pathLength="1"
                d={initialTrackPath}
                mask={`url(#${farMaskId})`}
              />
            </g>
            <circle className="tpwl__exit-circle" cx="80" cy="36" r="16" pathLength="1" />
          </g>
        </svg>
        <button className="tpwl__button" type="button" onClick={enterSite}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

const loaderStyles = `
.tpwl {
  --tpwl-ease-load: cubic-bezier(0.16, 1, 0.3, 1);
  --tpwl-ease-hover: cubic-bezier(0.22, 1, 0.36, 1);
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 46% 22%, rgba(255, 255, 255, 0.055), transparent 25vw),
    radial-gradient(circle at 15% 56%, rgba(255, 255, 255, 0.04), transparent 22vw),
    linear-gradient(180deg, rgba(18, 18, 17, 0.96), #0d0d0c 54%, #0a0a09);
  color: #fff;
  cursor: auto;
}

.tpwl::before,
.tpwl::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
}

.tpwl::before {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse at 50% 42%, #000 0%, transparent 72%);
  opacity: 0.42;
}

.tpwl::after {
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.44), transparent 22%, transparent 78%, rgba(0, 0, 0, 0.42)),
    radial-gradient(ellipse at 50% 105%, rgba(255, 255, 255, 0.04), transparent 48%);
}

.tpwl--exiting {
  pointer-events: none;
  animation: tpwlOverlayExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both;
}

.tpwl__stage {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  width: min(360px, calc(100vw - 48px));
  transform: translateY(-5vh);
}

.tpwl__mark {
  display: block;
  width: clamp(118px, 18vw, 164px);
  height: auto;
  overflow: visible;
  filter:
    drop-shadow(0 0 14px rgba(255, 255, 255, 0.14))
    drop-shadow(0 12px 24px rgba(0, 0, 0, 0.62));
}

.tpwl__symbol,
.tpwl__ribbon {
  transform-origin: 80px 36px;
}

.tpwl__glow,
.tpwl__base,
.tpwl__distance,
.tpwl__exit-circle {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.tpwl__glow {
  opacity: 0;
  stroke: rgba(255, 255, 255, 0.72);
  stroke-width: 6.4;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  filter: blur(5px);
  animation: tpwlGlowIntro 1180ms var(--tpwl-ease-load) both;
}

.tpwl__base {
  stroke: rgba(255, 255, 255, 0.34);
  stroke-width: 1.55;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: tpwlPathIntro 1180ms var(--tpwl-ease-load) both;
}

.tpwl__distance {
  opacity: 0;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: tpwlPathIntro 1180ms var(--tpwl-ease-load) both;
}

.tpwl__distance--mid {
  stroke: rgba(255, 255, 255, 0.56);
  stroke-width: 3.05;
}

.tpwl__distance--far {
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 5.15;
  filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.18));
}

.tpwl__exit-circle {
  opacity: 0;
  stroke: #fff;
  stroke-width: 3.4;
  stroke-dasharray: 0.18 0.82;
  stroke-dashoffset: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.tpwl--intro .tpwl__mark {
  animation: tpwlMarkIntro 1180ms var(--tpwl-ease-load) both;
}

.tpwl--waiting .tpwl__base {
  stroke-dashoffset: 0;
  animation:
    tpwlPathToBreath 540ms ease-out both,
    tpwlPathBreath 2600ms ease-in-out 540ms infinite;
}

.tpwl--waiting .tpwl__distance {
  stroke-dashoffset: 0;
  animation:
    tpwlDistanceToBreath 540ms ease-out both,
    tpwlDistanceBreath 2600ms ease-in-out 540ms infinite;
}

.tpwl--waiting .tpwl__glow {
  stroke-dashoffset: 0;
  animation:
    tpwlGlowToBreath 540ms ease-out both,
    tpwlGlowBreath 2600ms ease-in-out 540ms infinite;
}

.tpwl--exiting .tpwl__stage {
  animation: tpwlStageExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both;
}

.tpwl--exiting .tpwl__symbol {
  animation: tpwlSymbolExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both;
}

.tpwl--exiting .tpwl__ribbon {
  animation: tpwlRibbonExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both;
}

.tpwl--exiting .tpwl__base {
  stroke-dashoffset: 0;
  animation: tpwlBaseExit var(--tpwl-exit-duration) cubic-bezier(0.7, 0, 0.84, 0) both;
}

.tpwl--exiting .tpwl__distance {
  stroke-dashoffset: 0;
  animation: tpwlDistanceExit var(--tpwl-exit-duration) cubic-bezier(0.7, 0, 0.84, 0) both;
}

.tpwl--exiting .tpwl__glow {
  stroke-dashoffset: 0;
  animation: tpwlGlowExit var(--tpwl-exit-duration) cubic-bezier(0.7, 0, 0.84, 0) both;
}

.tpwl--exiting .tpwl__exit-circle {
  animation:
    tpwlCircleExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both,
    tpwlCircleSpin 220ms linear infinite;
}

.tpwl__button {
  min-height: 34px;
  margin-top: clamp(66px, 14vh, 112px);
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.84);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 720;
  line-height: 1;
  backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  opacity: 0;
  transform: translateY(8px);
  transition:
    border-color 180ms var(--tpwl-ease-hover),
    background 180ms var(--tpwl-ease-hover),
    color 180ms var(--tpwl-ease-hover),
    transform 180ms var(--tpwl-ease-hover);
  animation: tpwlButtonIn 520ms var(--tpwl-ease-load) 920ms both;
}

.tpwl__button:hover {
  border-color: rgba(255, 255, 255, 0.32);
  background: rgba(255, 255, 255, 0.13);
  color: #fff;
  transform: translateY(6px);
}

.tpwl__button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.72);
  outline-offset: 4px;
}

.tpwl--exiting .tpwl__button {
  animation: tpwlButtonOut 220ms ease both;
}

@media (max-width: 580px) {
  .tpwl__stage {
    transform: translateY(-8vh);
  }

  .tpwl__button {
    margin-top: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tpwl,
  .tpwl::before,
  .tpwl::after,
  .tpwl__stage,
  .tpwl__mark,
  .tpwl__symbol,
  .tpwl__ribbon,
  .tpwl__glow,
  .tpwl__base,
  .tpwl__distance,
  .tpwl__exit-circle,
  .tpwl__button {
    animation: none;
  }

  .tpwl__glow {
    opacity: 0.12;
    stroke-dashoffset: 0;
  }

  .tpwl__base {
    opacity: 0.68;
    stroke-dashoffset: 0;
  }

  .tpwl__distance {
    opacity: 0.9;
    stroke-dashoffset: 0;
  }

  .tpwl__button {
    opacity: 1;
    transform: none;
  }
}

@keyframes tpwlMarkIntro {
  0% {
    opacity: 0;
    transform: scaleX(0.22) scaleY(0.88);
    filter:
      drop-shadow(0 0 14px rgba(255, 255, 255, 0.14))
      drop-shadow(0 12px 24px rgba(0, 0, 0, 0.62))
      blur(7px);
  }

  56% {
    opacity: 1;
    transform: scaleX(1.08) scaleY(1);
    filter:
      drop-shadow(0 0 14px rgba(255, 255, 255, 0.14))
      drop-shadow(0 12px 24px rgba(0, 0, 0, 0.62))
      blur(0);
  }

  100% {
    opacity: 1;
    transform: scaleX(1) scaleY(1);
    filter:
      drop-shadow(0 0 14px rgba(255, 255, 255, 0.14))
      drop-shadow(0 12px 24px rgba(0, 0, 0, 0.62))
      blur(0);
  }
}

@keyframes tpwlPathIntro {
  0% {
    opacity: 0;
    stroke-dashoffset: 1;
  }

  18% {
    opacity: 1;
  }

  100% {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}

@keyframes tpwlGlowIntro {
  0% {
    opacity: 0;
    stroke-dashoffset: 1;
  }

  18% {
    opacity: 0.14;
  }

  100% {
    opacity: 0.14;
    stroke-dashoffset: 0;
  }
}

@keyframes tpwlPathBreath {
  0%,
  100% {
    opacity: 0.5;
    stroke-width: 1.45;
  }

  50% {
    opacity: 0.68;
    stroke-width: 1.72;
  }
}

@keyframes tpwlPathToBreath {
  from {
    opacity: 1;
    stroke-width: 1.55;
  }

  to {
    opacity: 0.5;
    stroke-width: 1.45;
  }
}

@keyframes tpwlDistanceBreath {
  0%,
  100% {
    opacity: 0.72;
  }

  50% {
    opacity: 1;
  }
}

@keyframes tpwlDistanceToBreath {
  from {
    opacity: 1;
  }

  to {
    opacity: 0.72;
  }
}

@keyframes tpwlGlowBreath {
  0%,
  100% {
    opacity: 0.08;
    stroke-width: 5.4;
  }

  50% {
    opacity: 0.2;
    stroke-width: 7;
  }
}

@keyframes tpwlGlowToBreath {
  from {
    opacity: 0.14;
    stroke-width: 6.4;
  }

  to {
    opacity: 0.08;
    stroke-width: 5.4;
  }
}

@keyframes tpwlStageExit {
  0%,
  78% {
    transform: translateY(-5vh) scale(1);
    filter: blur(0);
  }

  92% {
    transform: translateY(-5vh) scale(0.68);
    filter: blur(0.5px);
  }

  100% {
    transform: translateY(-5vh) scale(0.02);
    filter: blur(8px);
  }
}

@keyframes tpwlSymbolExit {
  0%,
  76% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  92% {
    opacity: 1;
    transform: scale(0.84) rotate(360deg);
  }

  100% {
    opacity: 0;
    transform: scale(0.04) rotate(1180deg);
  }
}

@keyframes tpwlRibbonExit {
  0%,
  82% {
    opacity: 1;
    transform: rotate(0deg);
  }

  96% {
    opacity: 0.45;
    transform: rotate(540deg);
  }

  100% {
    opacity: 0;
    transform: rotate(900deg);
  }
}

@keyframes tpwlBaseExit {
  0%,
  82% {
    opacity: 0.58;
    stroke-dasharray: 1;
  }

  100% {
    opacity: 0;
    stroke-dasharray: 0.08 0.92;
  }
}

@keyframes tpwlDistanceExit {
  0%,
  82% {
    opacity: 1;
    stroke-dasharray: 1;
  }

  100% {
    opacity: 0;
    stroke-dasharray: 0.08 0.92;
  }
}

@keyframes tpwlGlowExit {
  0%,
  82% {
    opacity: 0.18;
    stroke-dasharray: 1;
  }

  100% {
    opacity: 0;
    stroke-dasharray: 0.08 0.92;
  }
}

@keyframes tpwlCircleExit {
  0%,
  62% {
    opacity: 0;
    transform: scale(0.3);
  }

  76% {
    opacity: 0.86;
    transform: scale(0.96);
  }

  88% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.05);
  }
}

@keyframes tpwlCircleSpin {
  0% {
    stroke-dashoffset: 0;
  }

  100% {
    stroke-dashoffset: -1;
  }
}

@keyframes tpwlButtonIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tpwlButtonOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes tpwlOverlayExit {
  0%,
  84% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    visibility: hidden;
  }
}
`;
