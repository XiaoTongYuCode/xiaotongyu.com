"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useRef } from "react";

export type ThreePhaseWaveLoaderPhase = "intro" | "waiting" | "exiting";

type TrackPoint = {
  x: number;
  y: number;
};

type WaveTrackOptions = {
  circleProgress?: number;
  widthScale?: number;
};

export type ThreePhaseWaveLoaderProps = {
  className?: string;
  exitDurationMs?: number;
  phase: ThreePhaseWaveLoaderPhase;
  title?: string;
};

const DEFAULT_EXIT_DURATION_MS = 2800;

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
const easeInQuint = (value: number) => value * value * value * value * value;
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
const EXIT_START_TRACK_SPEED = 0.004;
const EXIT_MAX_TRACK_SPEED = 0.25;

export default function ThreePhaseWaveLoader({
  className,
  exitDurationMs = DEFAULT_EXIT_DURATION_MS,
  phase,
  title,
}: ThreePhaseWaveLoaderProps) {
  const svgId = useId().replace(/:/g, "");
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
    if (phase === "exiting") {
      exitStartedAtRef.current = performance.now();
      return;
    }

    exitStartedAtRef.current = null;
  }, [phase]);

  useEffect(() => {
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
      const speedProgress = clamp(exitProgress / 0.58);
      const exitAcceleration = easeInQuint(speedProgress);
      const speed =
        phase === "exiting"
          ? lerp(EXIT_START_TRACK_SPEED, EXIT_MAX_TRACK_SPEED, exitAcceleration)
          : phase === "waiting"
            ? 0.0032
            : 0.0016;
      const narrowProgress = easeOutCubic(clamp((exitProgress - 0.58) / 0.12));
      const widthScale = phase === "exiting" ? lerp(1, 0.28, narrowProgress) : 1;
      const circleProgress =
        phase === "exiting" ? smoothStep((exitProgress - 0.7) / 0.12) : 0;
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

  return (
    <>
      <style>{loaderIconStyles}</style>
      <svg
        className={["tpwlIcon", `tpwlIcon--${phase}`, className].filter(Boolean).join(" ")}
        style={{ "--tpwl-exit-duration": `${exitDurationMs}ms` } as CSSProperties}
        viewBox="0 0 160 72"
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
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
        <g className="tpwlIcon__symbol">
          <g className="tpwlIcon__ribbon">
            <path
              ref={glowPathRef}
              className="tpwlIcon__glow"
              pathLength="1"
              d={initialTrackPath}
            />
            <path
              ref={basePathRef}
              className="tpwlIcon__base"
              pathLength="1"
              d={initialTrackPath}
            />
            <path
              ref={midDistancePathRef}
              className="tpwlIcon__distance tpwlIcon__distance--mid"
              pathLength="1"
              d={initialTrackPath}
              mask={`url(#${midMaskId})`}
            />
            <path
              ref={farDistancePathRef}
              className="tpwlIcon__distance tpwlIcon__distance--far"
              pathLength="1"
              d={initialTrackPath}
              mask={`url(#${farMaskId})`}
            />
          </g>
          <circle className="tpwlIcon__exitCircle" cx="80" cy="36" r="16" pathLength="1" />
        </g>
      </svg>
    </>
  );
}

const loaderIconStyles = `
.tpwlIcon {
  --tpwl-ease-load: cubic-bezier(0.16, 1, 0.3, 1);
  display: block;
  width: clamp(118px, 18vw, 164px);
  height: auto;
  overflow: visible;
  color: #050505;
  filter:
    drop-shadow(0 0 10px rgba(0, 0, 0, 0.08))
    drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18));
}

.tpwlIcon__symbol,
.tpwlIcon__ribbon {
  transform-origin: 80px 36px;
}

.tpwlIcon__glow,
.tpwlIcon__base,
.tpwlIcon__distance,
.tpwlIcon__exitCircle {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.tpwlIcon__glow {
  opacity: 0;
  stroke-width: 6.4;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  filter: blur(5px);
  animation: tpwlIconGlowIntro 1180ms var(--tpwl-ease-load) both;
}

.tpwlIcon__base {
  opacity: 0.34;
  stroke-width: 1.55;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: tpwlIconPathIntro 1180ms var(--tpwl-ease-load) both;
}

.tpwlIcon__distance {
  opacity: 0;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: tpwlIconPathIntro 1180ms var(--tpwl-ease-load) both;
}

.tpwlIcon__distance--mid {
  opacity: 0.56;
  stroke-width: 3.05;
}

.tpwlIcon__distance--far {
  opacity: 0.9;
  stroke-width: 5.15;
  filter: drop-shadow(0 0 7px rgba(0, 0, 0, 0.18));
}

.tpwlIcon__exitCircle {
  opacity: 0;
  stroke-width: 3.4;
  stroke-dasharray: 0.18 0.82;
  stroke-dashoffset: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.tpwlIcon--intro {
  animation: tpwlIconMarkIntro 1180ms var(--tpwl-ease-load) both;
}

.tpwlIcon--waiting .tpwlIcon__base {
  stroke-dashoffset: 0;
  animation:
    tpwlIconPathToBreath 540ms ease-out both,
    tpwlIconPathBreath 2600ms ease-in-out 540ms infinite;
}

.tpwlIcon--waiting .tpwlIcon__distance {
  stroke-dashoffset: 0;
  animation:
    tpwlIconDistanceToBreath 540ms ease-out both,
    tpwlIconDistanceBreath 2600ms ease-in-out 540ms infinite;
}

.tpwlIcon--waiting .tpwlIcon__glow {
  stroke-dashoffset: 0;
  animation:
    tpwlIconGlowToBreath 540ms ease-out both,
    tpwlIconGlowBreath 2600ms ease-in-out 540ms infinite;
}

.tpwlIcon--exiting {
  animation: tpwlIconStageExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both;
}

.tpwlIcon--exiting .tpwlIcon__symbol {
  animation: tpwlIconSymbolExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both;
}

.tpwlIcon--exiting .tpwlIcon__ribbon {
  animation: tpwlIconRibbonExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both;
}

.tpwlIcon--exiting .tpwlIcon__base {
  stroke-dashoffset: 0;
  animation: tpwlIconBaseExit var(--tpwl-exit-duration) cubic-bezier(0.7, 0, 0.84, 0) both;
}

.tpwlIcon--exiting .tpwlIcon__distance {
  stroke-dashoffset: 0;
  animation: tpwlIconDistanceExit var(--tpwl-exit-duration) cubic-bezier(0.7, 0, 0.84, 0) both;
}

.tpwlIcon--exiting .tpwlIcon__glow {
  stroke-dashoffset: 0;
  animation: tpwlIconGlowExit var(--tpwl-exit-duration) cubic-bezier(0.7, 0, 0.84, 0) both;
}

.tpwlIcon--exiting .tpwlIcon__exitCircle {
  animation:
    tpwlIconCircleExit var(--tpwl-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both,
    tpwlIconCircleSpin 220ms linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .tpwlIcon,
  .tpwlIcon__symbol,
  .tpwlIcon__ribbon,
  .tpwlIcon__glow,
  .tpwlIcon__base,
  .tpwlIcon__distance,
  .tpwlIcon__exitCircle {
    animation: none;
  }

  .tpwlIcon__glow {
    opacity: 0.08;
    stroke-dashoffset: 0;
  }

  .tpwlIcon__base {
    opacity: 0.5;
    stroke-dashoffset: 0;
  }

  .tpwlIcon__distance {
    opacity: 0.9;
    stroke-dashoffset: 0;
  }
}

@keyframes tpwlIconMarkIntro {
  0% {
    opacity: 0;
    transform: scaleX(0.22) scaleY(0.88);
    filter:
      drop-shadow(0 0 10px rgba(0, 0, 0, 0.08))
      drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18))
      blur(7px);
  }

  56% {
    opacity: 1;
    transform: scaleX(1.08) scaleY(1);
    filter:
      drop-shadow(0 0 10px rgba(0, 0, 0, 0.08))
      drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18))
      blur(0);
  }

  100% {
    opacity: 1;
    transform: scaleX(1) scaleY(1);
    filter:
      drop-shadow(0 0 10px rgba(0, 0, 0, 0.08))
      drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18))
      blur(0);
  }
}

@keyframes tpwlIconPathIntro {
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

@keyframes tpwlIconGlowIntro {
  0% {
    opacity: 0;
    stroke-dashoffset: 1;
  }

  18% {
    opacity: 0.12;
  }

  100% {
    opacity: 0.12;
    stroke-dashoffset: 0;
  }
}

@keyframes tpwlIconPathBreath {
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

@keyframes tpwlIconPathToBreath {
  from {
    opacity: 1;
    stroke-width: 1.55;
  }

  to {
    opacity: 0.5;
    stroke-width: 1.45;
  }
}

@keyframes tpwlIconDistanceBreath {
  0%,
  100% {
    opacity: 0.72;
  }

  50% {
    opacity: 1;
  }
}

@keyframes tpwlIconDistanceToBreath {
  from {
    opacity: 1;
  }

  to {
    opacity: 0.72;
  }
}

@keyframes tpwlIconGlowBreath {
  0%,
  100% {
    opacity: 0.08;
    stroke-width: 5.4;
  }

  50% {
    opacity: 0.16;
    stroke-width: 7;
  }
}

@keyframes tpwlIconGlowToBreath {
  from {
    opacity: 0.12;
    stroke-width: 6.4;
  }

  to {
    opacity: 0.08;
    stroke-width: 5.4;
  }
}

@keyframes tpwlIconStageExit {
  0%,
  70% {
    transform: scale(1);
    filter:
      drop-shadow(0 0 10px rgba(0, 0, 0, 0.08))
      drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18))
      blur(0);
  }

  88% {
    transform: scale(0.68);
    filter:
      drop-shadow(0 0 10px rgba(0, 0, 0, 0.08))
      drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18))
      blur(0.5px);
  }

  100% {
    transform: scale(0.02);
    filter:
      drop-shadow(0 0 0 rgba(0, 0, 0, 0))
      drop-shadow(0 0 0 rgba(0, 0, 0, 0))
      blur(8px);
  }
}

@keyframes tpwlIconSymbolExit {
  0%,
  70% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  88% {
    opacity: 1;
    transform: scale(0.84) rotate(360deg);
  }

  100% {
    opacity: 0;
    transform: scale(0.04) rotate(1180deg);
  }
}

@keyframes tpwlIconRibbonExit {
  0%,
  70% {
    opacity: 1;
    transform: rotate(0deg);
  }

  90% {
    opacity: 0.45;
    transform: rotate(540deg);
  }

  100% {
    opacity: 0;
    transform: rotate(900deg);
  }
}

@keyframes tpwlIconBaseExit {
  0%,
  70% {
    opacity: 0.58;
    stroke-dasharray: 1;
  }

  100% {
    opacity: 0;
    stroke-dasharray: 0.08 0.92;
  }
}

@keyframes tpwlIconDistanceExit {
  0%,
  70% {
    opacity: 1;
    stroke-dasharray: 1;
  }

  100% {
    opacity: 0;
    stroke-dasharray: 0.08 0.92;
  }
}

@keyframes tpwlIconGlowExit {
  0%,
  70% {
    opacity: 0.16;
    stroke-dasharray: 1;
  }

  100% {
    opacity: 0;
    stroke-dasharray: 0.08 0.92;
  }
}

@keyframes tpwlIconCircleExit {
  0%,
  70% {
    opacity: 0;
    transform: scale(0.3);
  }

  80% {
    opacity: 0.86;
    transform: scale(0.96);
  }

  90% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.05);
  }
}

@keyframes tpwlIconCircleSpin {
  0% {
    stroke-dashoffset: 0;
  }

  100% {
    stroke-dashoffset: -1;
  }
}
`;
