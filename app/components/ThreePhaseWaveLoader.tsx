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

type GradientStopConfig = {
  offset: string;
  opacity: number;
};

// SVG canvas and visual center. / SVG 画布与视觉中心。
const SVG_CONFIG = {
  centerX: 80,
  centerY: 36,
  height: 72,
  viewBox: "0 0 160 72",
  width: 160,
} as const;

// Wave geometry. / 波形轨道几何参数。
const WAVE_TRACK_CONFIG = {
  amplitude: 17,
  circleRadius: 15,
  endpointGateExponent: 0.36,
  envelopeBase: 0.84,
  envelopePrimaryFrequency: 0.82,
  envelopePrimaryStrength: 0.11,
  envelopeSecondaryFrequency: 1.74,
  envelopeSecondaryStrength: 0.05,
  halfWavelengthOffset: Math.PI,
  exitCircleRadius: 16,
  segmentCount: 28,
  width: 124,
} as const;

// Track motion and exit timing. / 轨道运动与退出阶段时间比例。
const MOTION_CONFIG = {
  defaultExitDurationMs: 2800,
  exitAccelerationRatio: 0.6,
  exitCircleMorphRatio: 0.12,
  exitMaxTrackSpeed: 0.2,
  exitMinWidthScale: 0.28,
  exitNarrowingRatio: 0.25,
  // Fraction of max track speed at which the width starts narrowing. With
  // value=1/3 the ribbon enters a "accelerating + narrowing" overlap state
  // while the speed easeInQuint curve climbs through the back third of its
  // acceleration window — instead of waiting until acceleration fully ends.
  // 收窄起始触发的速度阈值（相对最高速度的占比）。1/3 表示当速度达到峰值的
  // 1/3 时就开始同时收缩宽度，与剩余加速阶段重叠。
  exitNarrowingSpeedTrigger: 1 / 3,
  exitStartTrackSpeed: 0.004,
  introTrackSpeed: 0.0024,
  waitingTrackSpeed: 0.0032,
} as const;

const EXIT_FINAL_RATIO =
  1 - MOTION_CONFIG.exitAccelerationRatio - MOTION_CONFIG.exitNarrowingRatio;
const EXIT_FINAL_START_RATIO =
  MOTION_CONFIG.exitAccelerationRatio + MOTION_CONFIG.exitNarrowingRatio;

// Invert easeInQuint to find the timeline ratio at which the easeInQuint-driven
// speed lerp first crosses `exitNarrowingSpeedTrigger * exitMaxTrackSpeed`.
// 反解 easeInQuint：求出速度首次达到 trigger * 最高速度 时所对应的归一化时间，
// 再换算到整段退出动画的相对位置，作为宽度收缩的起点。
const EXIT_NARROWING_SPEED_FRACTION = Math.min(
  1,
  Math.max(
    0,
    (MOTION_CONFIG.exitMaxTrackSpeed * MOTION_CONFIG.exitNarrowingSpeedTrigger -
      MOTION_CONFIG.exitStartTrackSpeed) /
      (MOTION_CONFIG.exitMaxTrackSpeed - MOTION_CONFIG.exitStartTrackSpeed),
  ),
);
const EXIT_NARROWING_START_RATIO =
  MOTION_CONFIG.exitAccelerationRatio * Math.pow(EXIT_NARROWING_SPEED_FRACTION, 1 / 5);
const EXIT_NARROWING_SPAN_RATIO = Math.max(
  EXIT_FINAL_START_RATIO - EXIT_NARROWING_START_RATIO,
  Number.EPSILON,
);

// Keyframe checkpoints inside the final phase. / 最终阶段内部关键帧位置。
const EXIT_KEYFRAME_CONFIG = {
  circlePopWithinFinalRatio: 0.35,
  circlePeakWithinFinalRatio: 0.65,
  ribbonDimWithinFinalRatio: 0.65,
  stageSettleWithinFinalRatio: 0.6,
} as const;

// SVG mask gradients that control extra thickness. / 控制轨道增厚区域的 SVG 蒙版渐变。
const MASK_CONFIG = {
  color: "#fff",
  horizontalX1: 18,
  horizontalX2: 142,
  verticalY1: 14,
  verticalY2: 58,
  midHorizontalStops: [
    { offset: "0", opacity: 0.62 },
    { offset: "0.28", opacity: 0.16 },
    { offset: "0.5", opacity: 0.06 },
    { offset: "0.72", opacity: 0.16 },
    { offset: "1", opacity: 0.62 },
  ],
  farHorizontalStops: [
    { offset: "0", opacity: 0.68 },
    { offset: "0.22", opacity: 0.12 },
    { offset: "0.42", opacity: 0 },
    { offset: "0.58", opacity: 0 },
    { offset: "0.78", opacity: 0.12 },
    { offset: "1", opacity: 0.68 },
  ],
  midVerticalStops: [
    { offset: "0", opacity: 0.36 },
    { offset: "0.32", opacity: 0.1 },
    { offset: "0.5", opacity: 0 },
    { offset: "0.68", opacity: 0.1 },
    { offset: "1", opacity: 0.36 },
  ],
  farVerticalStops: [
    { offset: "0", opacity: 0.42 },
    { offset: "0.28", opacity: 0.08 },
    { offset: "0.44", opacity: 0 },
    { offset: "0.56", opacity: 0 },
    { offset: "0.72", opacity: 0.08 },
    { offset: "1", opacity: 0.42 },
  ],
} satisfies Record<string, number | string | GradientStopConfig[]>;

// CSS tunables for size, stroke, opacity, timing, and transforms. / 尺寸、线宽、透明度、时间与变换参数。
const STYLE_CONFIG = {
  iconMinWidthPx: 118,
  iconPreferredWidthVw: 18,
  iconMaxWidthPx: 164,
  color: "#050505",
  breathPeakPercent: 50,
  easeLoad: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeExit: "cubic-bezier(0.86, 0, 0.07, 1)",
  easeExitStroke: "cubic-bezier(0.7, 0, 0.84, 0)",
  shadowSoft: "0 0 10px rgba(0, 0, 0, 0.08)",
  shadowDeep: "0 12px 24px rgba(0, 0, 0, 0.18)",
  introDurationMs: 1180,
  introPathFadeInPercent: 18,
  introOvershootPercent: 56,
  waitingTransitionMs: 540,
  breathDurationMs: 2600,
  circleSpinMs: 220,
  glowIntroOpacity: 0.12,
  glowIdleOpacity: 0.08,
  glowBreathOpacity: 0.16,
  glowStrokeWidth: 6.4,
  glowIdleStrokeWidth: 5.4,
  glowBreathStrokeWidth: 7,
  glowBlurPx: 5,
  baseInitialOpacity: 0.34,
  baseExitOpacity: 0.58,
  baseReducedOpacity: 0.5,
  baseStrokeWidth: 1.55,
  baseIdleStrokeWidth: 1.45,
  baseBreathStrokeWidth: 1.72,
  baseBreathOpacity: 0.68,
  distanceMidOpacity: 0.56,
  distanceFarOpacity: 0.9,
  distanceIdleOpacity: 0.72,
  distanceMidStrokeWidth: 3.28,
  distanceFarStrokeWidth: 5.6,
  distanceFarShadow: "0 0 7px rgba(0, 0, 0, 0.18)",
  exitCircleStrokeWidth: 3.4,
  exitCircleDash: "0.18 0.82",
  exitCirclePopOpacity: 0.86,
  exitDashFinal: "0.08 0.92",
  exitCircleStartScale: 0.3,
  exitCirclePopScale: 0.96,
  exitCirclePeakScale: 1,
  exitCircleEndScale: 0.05,
  markIntroStartScaleX: 0.22,
  markIntroStartScaleY: 0.88,
  markIntroOvershootScaleX: 1.08,
  markIntroBlurPx: 7,
  stageSettleScale: 0.68,
  stageEndScale: 0.02,
  stageSettleBlurPx: 0.5,
  stageEndBlurPx: 8,
  symbolSettleScale: 0.84,
  symbolEndScale: 0.04,
  symbolSettleRotateDeg: 360,
  symbolEndRotateDeg: 1180,
  ribbonDimOpacity: 0.45,
  ribbonDimRotateDeg: 540,
  ribbonEndRotateDeg: 900,
} as const;

const DEFAULT_EXIT_DURATION_MS = MOTION_CONFIG.defaultExitDurationMs;

const toPathCoordinate = (value: number) => value.toFixed(2);
const toPercent = (ratio: number) => `${Number((ratio * 100).toFixed(3))}%`;
const exitFinalCheckpoint = (withinFinalRatio: number) =>
  toPercent(EXIT_FINAL_START_RATIO + EXIT_FINAL_RATIO * withinFinalRatio);

const EXIT_FINAL_START_PERCENT = toPercent(EXIT_FINAL_START_RATIO);
const EXIT_STAGE_SETTLE_PERCENT = exitFinalCheckpoint(
  EXIT_KEYFRAME_CONFIG.stageSettleWithinFinalRatio,
);
const EXIT_RIBBON_DIM_PERCENT = exitFinalCheckpoint(
  EXIT_KEYFRAME_CONFIG.ribbonDimWithinFinalRatio,
);
const EXIT_CIRCLE_POP_PERCENT = exitFinalCheckpoint(
  EXIT_KEYFRAME_CONFIG.circlePopWithinFinalRatio,
);
const EXIT_CIRCLE_PEAK_PERCENT = exitFinalCheckpoint(
  EXIT_KEYFRAME_CONFIG.circlePeakWithinFinalRatio,
);

const renderGradientStops = (stops: GradientStopConfig[]) =>
  stops.map(({ offset, opacity }) => (
    <stop
      key={`${offset}-${opacity}`}
      offset={offset}
      stopColor={MASK_CONFIG.color}
      stopOpacity={opacity}
    />
  ));

// Catmull-Rom-style smooth bezier segments. The first/last neighbors are clamped, so
// the start and end tangents point inward — this gives a pointed (V) corner when two
// rails meet at a seam, which is the desired wave-tip silhouette.
// Catmull-Rom 风格贝塞尔片段：端点邻居被自钳制，使首尾切线指向内侧。两段轨道在接缝
// 处相交时会形成尖角顶点（再由 stroke-linejoin: round 自然磨成圆角），即设计中的波尖。
const railSegments = (points: TrackPoint[]) => {
  let path = "";

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
  const segmentCount = WAVE_TRACK_CONFIG.segmentCount;
  const centerX = SVG_CONFIG.centerX;
  const centerY = SVG_CONFIG.centerY;
  const widthScale = options.widthScale ?? 1;
  const circleProgress = options.circleProgress ?? 0;
  const width = WAVE_TRACK_CONFIG.width * widthScale;
  const leftX = centerX - width / 2;
  const buildRailPoint = (progress: number, railOffset: number, rail: "upper" | "lower") => {
    const sampleX = progress * Math.PI * 2 + phase;
    const endpointGate = Math.pow(
      Math.sin(progress * Math.PI),
      WAVE_TRACK_CONFIG.endpointGateExponent,
    );
    const wave = Math.sin(sampleX + railOffset);
    const envelope =
      WAVE_TRACK_CONFIG.envelopeBase +
      Math.sin(sampleX * WAVE_TRACK_CONFIG.envelopePrimaryFrequency + railOffset) *
        WAVE_TRACK_CONFIG.envelopePrimaryStrength +
      Math.sin(sampleX * WAVE_TRACK_CONFIG.envelopeSecondaryFrequency - railOffset) *
        WAVE_TRACK_CONFIG.envelopeSecondaryStrength;

    const wavePoint = {
      x: leftX + progress * width,
      y: centerY + wave * endpointGate * WAVE_TRACK_CONFIG.amplitude * envelope,
    };
    const circlePoint = {
      x: centerX - Math.cos(progress * Math.PI) * WAVE_TRACK_CONFIG.circleRadius,
      y:
        centerY +
        Math.sin(progress * Math.PI) *
          WAVE_TRACK_CONFIG.circleRadius *
          (rail === "upper" ? -1 : 1),
    };

    return {
      x: lerp(wavePoint.x, circlePoint.x, circleProgress),
      y: lerp(wavePoint.y, circlePoint.y, circleProgress),
    };
  };

  // Both rails include their shared seam endpoints (18,36) and (142,36). Each rail's
  // own clamped tangent at the seam keeps the path pointed at the wave tips.
  // 上下轨各自保留共享端点 (18,36)/(142,36)，靠各自的端点钳制切线在接缝处形成尖角顶点。
  const upperRail = Array.from({ length: segmentCount + 1 }, (_, index) => {
    const progress = index / segmentCount;

    return buildRailPoint(progress, 0, "upper");
  });
  const lowerRail = Array.from({ length: segmentCount + 1 }, (_, index) => {
    const progress = (segmentCount - index) / segmentCount;

    return buildRailPoint(progress, WAVE_TRACK_CONFIG.halfWavelengthOffset, "lower");
  });

  // Single continuous closed path: start at the left tip, trace the upper rail to the
  // right tip, then trace the lower rail back. No degenerate L commands — those would
  // produce stray round caps that look like a gap at the seam.
  // 用一条连续闭合路径：从左尖端出发→上轨→右尖端→下轨→闭合。删除原先零长度的 L
  // 命令——它们会在接缝处被渲染成孤立的 round-cap，看上去就像缺口。
  const upperStart = upperRail[0];
  return `M${toPathCoordinate(upperStart.x)} ${toPathCoordinate(upperStart.y)}${railSegments(upperRail)}${railSegments(lowerRail)} Z`;
};

const initialTrackPath = buildWaveTrackPath();

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
  const midVerticalGradientId = `tpwl-mid-vertical-mask-gradient-${svgId}`;
  const farVerticalGradientId = `tpwl-far-vertical-mask-gradient-${svgId}`;

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
      const speedProgress = clamp(exitProgress / MOTION_CONFIG.exitAccelerationRatio);
      const exitAcceleration = easeInQuint(speedProgress);
      const speed =
        phase === "exiting"
          ? lerp(
              MOTION_CONFIG.exitStartTrackSpeed,
              MOTION_CONFIG.exitMaxTrackSpeed,
              exitAcceleration,
            )
          : phase === "waiting"
            ? MOTION_CONFIG.waitingTrackSpeed
            : MOTION_CONFIG.introTrackSpeed;
      const narrowProgress = easeOutCubic(
        clamp((exitProgress - EXIT_NARROWING_START_RATIO) / EXIT_NARROWING_SPAN_RATIO),
      );
      const widthScale =
        phase === "exiting" ? lerp(1, MOTION_CONFIG.exitMinWidthScale, narrowProgress) : 1;
      const circleProgress =
        phase === "exiting"
          ? smoothStep(
              (exitProgress - EXIT_FINAL_START_RATIO) / MOTION_CONFIG.exitCircleMorphRatio,
            )
          : 0;
      trackPhaseRef.current += elapsed * speed;
      lastTrackFrameTimeRef.current = time;
      const currentPath = buildWaveTrackPath(trackPhaseRef.current, {
        circleProgress,
        widthScale,
      });
      glowPathRef.current?.setAttribute("d", currentPath);
      basePathRef.current?.setAttribute("d", currentPath);
      midDistancePathRef.current?.setAttribute("d", currentPath);
      farDistancePathRef.current?.setAttribute("d", currentPath);
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
        style={
          {
            "--tpwl-acceleration-ratio": MOTION_CONFIG.exitAccelerationRatio,
            "--tpwl-narrowing-ratio": MOTION_CONFIG.exitNarrowingRatio,
            "--tpwl-final-ratio": EXIT_FINAL_RATIO,
            "--tpwl-exit-duration": `${exitDurationMs}ms`,
          } as CSSProperties
        }
        viewBox={SVG_CONFIG.viewBox}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        focusable="false"
      >
        <defs>
          <linearGradient
            id={midGradientId}
            x1={MASK_CONFIG.horizontalX1}
            x2={MASK_CONFIG.horizontalX2}
            y1="0"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            {renderGradientStops(MASK_CONFIG.midHorizontalStops)}
          </linearGradient>
          <linearGradient
            id={farGradientId}
            x1={MASK_CONFIG.horizontalX1}
            x2={MASK_CONFIG.horizontalX2}
            y1="0"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            {renderGradientStops(MASK_CONFIG.farHorizontalStops)}
          </linearGradient>
          <linearGradient
            id={midVerticalGradientId}
            x1="0"
            x2="0"
            y1={MASK_CONFIG.verticalY1}
            y2={MASK_CONFIG.verticalY2}
            gradientUnits="userSpaceOnUse"
          >
            {renderGradientStops(MASK_CONFIG.midVerticalStops)}
          </linearGradient>
          <linearGradient
            id={farVerticalGradientId}
            x1="0"
            x2="0"
            y1={MASK_CONFIG.verticalY1}
            y2={MASK_CONFIG.verticalY2}
            gradientUnits="userSpaceOnUse"
          >
            {renderGradientStops(MASK_CONFIG.farVerticalStops)}
          </linearGradient>
          <mask id={midMaskId} maskUnits="userSpaceOnUse">
            <rect width={SVG_CONFIG.width} height={SVG_CONFIG.height} fill={`url(#${midGradientId})`} />
            <rect
              width={SVG_CONFIG.width}
              height={SVG_CONFIG.height}
              fill={`url(#${midVerticalGradientId})`}
            />
          </mask>
          <mask id={farMaskId} maskUnits="userSpaceOnUse">
            <rect width={SVG_CONFIG.width} height={SVG_CONFIG.height} fill={`url(#${farGradientId})`} />
            <rect
              width={SVG_CONFIG.width}
              height={SVG_CONFIG.height}
              fill={`url(#${farVerticalGradientId})`}
            />
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
          <circle
            className="tpwlIcon__exitCircle"
            cx={SVG_CONFIG.centerX}
            cy={SVG_CONFIG.centerY}
            r={WAVE_TRACK_CONFIG.exitCircleRadius}
            pathLength="1"
          />
        </g>
      </svg>
    </>
  );
}

const loaderIconStyles = `
.tpwlIcon {
  --tpwl-ease-load: ${STYLE_CONFIG.easeLoad};
  display: block;
  width: clamp(${STYLE_CONFIG.iconMinWidthPx}px, ${STYLE_CONFIG.iconPreferredWidthVw}vw, ${STYLE_CONFIG.iconMaxWidthPx}px);
  height: auto;
  overflow: visible;
  color: ${STYLE_CONFIG.color};
  filter:
    drop-shadow(${STYLE_CONFIG.shadowSoft})
    drop-shadow(${STYLE_CONFIG.shadowDeep});
}

.tpwlIcon__symbol,
.tpwlIcon__ribbon {
  transform-origin: ${SVG_CONFIG.centerX}px ${SVG_CONFIG.centerY}px;
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
  stroke-width: ${STYLE_CONFIG.glowStrokeWidth};
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  filter: blur(${STYLE_CONFIG.glowBlurPx}px);
  animation: tpwlIconGlowIntro ${STYLE_CONFIG.introDurationMs}ms var(--tpwl-ease-load) both;
}

.tpwlIcon__base {
  opacity: ${STYLE_CONFIG.baseInitialOpacity};
  stroke-width: ${STYLE_CONFIG.baseStrokeWidth};
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: tpwlIconPathIntro ${STYLE_CONFIG.introDurationMs}ms var(--tpwl-ease-load) both;
}

.tpwlIcon__distance {
  opacity: 0;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: tpwlIconPathIntro ${STYLE_CONFIG.introDurationMs}ms var(--tpwl-ease-load) both;
}

.tpwlIcon__distance--mid {
  opacity: ${STYLE_CONFIG.distanceMidOpacity};
  stroke-width: ${STYLE_CONFIG.distanceMidStrokeWidth};
}

.tpwlIcon__distance--far {
  opacity: ${STYLE_CONFIG.distanceFarOpacity};
  stroke-width: ${STYLE_CONFIG.distanceFarStrokeWidth};
  filter: drop-shadow(${STYLE_CONFIG.distanceFarShadow});
}

.tpwlIcon__exitCircle {
  opacity: 0;
  stroke-width: ${STYLE_CONFIG.exitCircleStrokeWidth};
  stroke-dasharray: ${STYLE_CONFIG.exitCircleDash};
  stroke-dashoffset: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.tpwlIcon--intro {
  animation: tpwlIconMarkIntro ${STYLE_CONFIG.introDurationMs}ms var(--tpwl-ease-load) both;
}

/*
 * In the waiting/idle state, remove stroke-dasharray entirely. A closed path with
 * dasharray is rendered as a dash pattern with explicit start/end caps (linecap=round)
 * at the M point, producing a visible wedge between the two caps when the seam has a
 * sharp tangent angle. Switching to dasharray:none restores the closed-loop semantics
 * so the seam is rendered with stroke-linejoin (round) and joins cleanly.
 *
 * waiting/idle 状态下完全去掉 stroke-dasharray：闭合路径只要带 dasharray，浏览器就会把
 * 它当成"虚线"渲染，在 M 起止点用 linecap (圆头帽) 而不是 linejoin (圆角拐角) 收口，
 * 切线方向不一致时两个帽之间会留下楔形缺口。改为 dasharray:none 之后路径恢复闭合环
 * 语义，接缝由 stroke-linejoin:round 平滑闭合。
 */
.tpwlIcon--waiting .tpwlIcon__base {
  stroke-dasharray: none;
  stroke-dashoffset: 0;
  animation:
    tpwlIconPathToBreath ${STYLE_CONFIG.waitingTransitionMs}ms ease-out both,
    tpwlIconPathBreath ${STYLE_CONFIG.breathDurationMs}ms ease-in-out ${STYLE_CONFIG.waitingTransitionMs}ms infinite;
}

.tpwlIcon--waiting .tpwlIcon__distance {
  stroke-dasharray: none;
  stroke-dashoffset: 0;
  animation:
    tpwlIconDistanceToBreath ${STYLE_CONFIG.waitingTransitionMs}ms ease-out both,
    tpwlIconDistanceBreath ${STYLE_CONFIG.breathDurationMs}ms ease-in-out ${STYLE_CONFIG.waitingTransitionMs}ms infinite;
}

.tpwlIcon--waiting .tpwlIcon__glow {
  stroke-dasharray: none;
  stroke-dashoffset: 0;
  animation:
    tpwlIconGlowToBreath ${STYLE_CONFIG.waitingTransitionMs}ms ease-out both,
    tpwlIconGlowBreath ${STYLE_CONFIG.breathDurationMs}ms ease-in-out ${STYLE_CONFIG.waitingTransitionMs}ms infinite;
}

.tpwlIcon--exiting {
  animation: tpwlIconStageExit var(--tpwl-exit-duration) ${STYLE_CONFIG.easeExit} both;
}

.tpwlIcon--exiting .tpwlIcon__symbol {
  animation: tpwlIconSymbolExit var(--tpwl-exit-duration) ${STYLE_CONFIG.easeExit} both;
}

.tpwlIcon--exiting .tpwlIcon__ribbon {
  animation: tpwlIconRibbonExit var(--tpwl-exit-duration) ${STYLE_CONFIG.easeExit} both;
}

.tpwlIcon--exiting .tpwlIcon__base {
  stroke-dashoffset: 0;
  animation: tpwlIconBaseExit var(--tpwl-exit-duration) ${STYLE_CONFIG.easeExitStroke} both;
}

.tpwlIcon--exiting .tpwlIcon__distance {
  stroke-dashoffset: 0;
  animation: tpwlIconDistanceExit var(--tpwl-exit-duration) ${STYLE_CONFIG.easeExitStroke} both;
}

.tpwlIcon--exiting .tpwlIcon__glow {
  stroke-dashoffset: 0;
  animation: tpwlIconGlowExit var(--tpwl-exit-duration) ${STYLE_CONFIG.easeExitStroke} both;
}

.tpwlIcon--exiting .tpwlIcon__exitCircle {
  animation:
    tpwlIconCircleExit var(--tpwl-exit-duration) ${STYLE_CONFIG.easeExit} both,
    tpwlIconCircleSpin ${STYLE_CONFIG.circleSpinMs}ms linear infinite;
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
    opacity: ${STYLE_CONFIG.glowIdleOpacity};
    stroke-dashoffset: 0;
  }

  .tpwlIcon__base {
    opacity: ${STYLE_CONFIG.baseReducedOpacity};
    stroke-dashoffset: 0;
  }

  .tpwlIcon__distance {
    opacity: ${STYLE_CONFIG.distanceFarOpacity};
    stroke-dashoffset: 0;
  }
}

@keyframes tpwlIconMarkIntro {
  0% {
    opacity: 0;
    transform: scaleX(${STYLE_CONFIG.markIntroStartScaleX}) scaleY(${STYLE_CONFIG.markIntroStartScaleY});
    filter:
      drop-shadow(${STYLE_CONFIG.shadowSoft})
      drop-shadow(${STYLE_CONFIG.shadowDeep})
      blur(${STYLE_CONFIG.markIntroBlurPx}px);
  }

  ${STYLE_CONFIG.introOvershootPercent}% {
    opacity: 1;
    transform: scaleX(${STYLE_CONFIG.markIntroOvershootScaleX}) scaleY(1);
    filter:
      drop-shadow(${STYLE_CONFIG.shadowSoft})
      drop-shadow(${STYLE_CONFIG.shadowDeep})
      blur(0);
  }

  100% {
    opacity: 1;
    transform: scaleX(1) scaleY(1);
    filter:
      drop-shadow(${STYLE_CONFIG.shadowSoft})
      drop-shadow(${STYLE_CONFIG.shadowDeep})
      blur(0);
  }
}

@keyframes tpwlIconPathIntro {
  0% {
    opacity: 0;
    stroke-dashoffset: 1;
  }

  ${STYLE_CONFIG.introPathFadeInPercent}% {
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

  ${STYLE_CONFIG.introPathFadeInPercent}% {
    opacity: ${STYLE_CONFIG.glowIntroOpacity};
  }

  100% {
    opacity: ${STYLE_CONFIG.glowIntroOpacity};
    stroke-dashoffset: 0;
  }
}

@keyframes tpwlIconPathBreath {
  0%,
  100% {
    opacity: ${STYLE_CONFIG.baseReducedOpacity};
    stroke-width: ${STYLE_CONFIG.baseIdleStrokeWidth};
  }

  ${STYLE_CONFIG.breathPeakPercent}% {
    opacity: ${STYLE_CONFIG.baseBreathOpacity};
    stroke-width: ${STYLE_CONFIG.baseBreathStrokeWidth};
  }
}

@keyframes tpwlIconPathToBreath {
  from {
    opacity: 1;
    stroke-width: ${STYLE_CONFIG.baseStrokeWidth};
  }

  to {
    opacity: ${STYLE_CONFIG.baseReducedOpacity};
    stroke-width: ${STYLE_CONFIG.baseIdleStrokeWidth};
  }
}

@keyframes tpwlIconDistanceBreath {
  0%,
  100% {
    opacity: ${STYLE_CONFIG.distanceIdleOpacity};
  }

  ${STYLE_CONFIG.breathPeakPercent}% {
    opacity: 1;
  }
}

@keyframes tpwlIconDistanceToBreath {
  from {
    opacity: 1;
  }

  to {
    opacity: ${STYLE_CONFIG.distanceIdleOpacity};
  }
}

@keyframes tpwlIconGlowBreath {
  0%,
  100% {
    opacity: ${STYLE_CONFIG.glowIdleOpacity};
    stroke-width: ${STYLE_CONFIG.glowIdleStrokeWidth};
  }

  ${STYLE_CONFIG.breathPeakPercent}% {
    opacity: ${STYLE_CONFIG.glowBreathOpacity};
    stroke-width: ${STYLE_CONFIG.glowBreathStrokeWidth};
  }
}

@keyframes tpwlIconGlowToBreath {
  from {
    opacity: ${STYLE_CONFIG.glowIntroOpacity};
    stroke-width: ${STYLE_CONFIG.glowStrokeWidth};
  }

  to {
    opacity: ${STYLE_CONFIG.glowIdleOpacity};
    stroke-width: ${STYLE_CONFIG.glowIdleStrokeWidth};
  }
}

@keyframes tpwlIconStageExit {
  0%,
  ${EXIT_FINAL_START_PERCENT} {
    transform: scale(1);
    filter:
      drop-shadow(${STYLE_CONFIG.shadowSoft})
      drop-shadow(${STYLE_CONFIG.shadowDeep})
      blur(0);
  }

  ${EXIT_STAGE_SETTLE_PERCENT} {
    transform: scale(${STYLE_CONFIG.stageSettleScale});
    filter:
      drop-shadow(${STYLE_CONFIG.shadowSoft})
      drop-shadow(${STYLE_CONFIG.shadowDeep})
      blur(${STYLE_CONFIG.stageSettleBlurPx}px);
  }

  100% {
    transform: scale(${STYLE_CONFIG.stageEndScale});
    filter:
      drop-shadow(0 0 0 rgba(0, 0, 0, 0))
      drop-shadow(0 0 0 rgba(0, 0, 0, 0))
      blur(${STYLE_CONFIG.stageEndBlurPx}px);
  }
}

@keyframes tpwlIconSymbolExit {
  0%,
  ${EXIT_FINAL_START_PERCENT} {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  ${EXIT_STAGE_SETTLE_PERCENT} {
    opacity: 1;
    transform: scale(${STYLE_CONFIG.symbolSettleScale}) rotate(${STYLE_CONFIG.symbolSettleRotateDeg}deg);
  }

  100% {
    opacity: 0;
    transform: scale(${STYLE_CONFIG.symbolEndScale}) rotate(${STYLE_CONFIG.symbolEndRotateDeg}deg);
  }
}

@keyframes tpwlIconRibbonExit {
  0%,
  ${EXIT_FINAL_START_PERCENT} {
    opacity: 1;
    transform: rotate(0deg);
  }

  ${EXIT_RIBBON_DIM_PERCENT} {
    opacity: ${STYLE_CONFIG.ribbonDimOpacity};
    transform: rotate(${STYLE_CONFIG.ribbonDimRotateDeg}deg);
  }

  100% {
    opacity: 0;
    transform: rotate(${STYLE_CONFIG.ribbonEndRotateDeg}deg);
  }
}

/*
 * Same reason as waiting state: during the early/middle of exit the path must stay a
 * continuous closed loop (no stroke-dasharray) so the M point uses linejoin, not the
 * cap-on-cap wedge. Only the final dotted-dissolve segment needs a numeric dasharray;
 * since "none" → numeric isn't smoothly interpolatable, the browser snaps at the
 * boundary — and that snap is concealed by the simultaneous opacity fade + circle
 * morph happening in the final 15%.
 *
 * 与 waiting 同因：退出前 85% 必须维持闭合环 (dasharray:none) 以避免 M 点 cap 楔形
 * 缺口；最后 15% 再切到虚线 dash 收尾。"none" 与数值之间无法平滑插值，浏览器会在该
 * 边界 snap，恰好被同时进行的不透明度淡出与圆形 morph 掩盖。
 */
@keyframes tpwlIconBaseExit {
  0%,
  ${EXIT_FINAL_START_PERCENT} {
    opacity: ${STYLE_CONFIG.baseExitOpacity};
    stroke-dasharray: none;
  }

  100% {
    opacity: 0;
    stroke-dasharray: ${STYLE_CONFIG.exitDashFinal};
  }
}

@keyframes tpwlIconDistanceExit {
  0%,
  ${EXIT_FINAL_START_PERCENT} {
    opacity: 1;
    stroke-dasharray: none;
  }

  100% {
    opacity: 0;
    stroke-dasharray: ${STYLE_CONFIG.exitDashFinal};
  }
}

@keyframes tpwlIconGlowExit {
  0%,
  ${EXIT_FINAL_START_PERCENT} {
    opacity: ${STYLE_CONFIG.glowBreathOpacity};
    stroke-dasharray: none;
  }

  100% {
    opacity: 0;
    stroke-dasharray: ${STYLE_CONFIG.exitDashFinal};
  }
}

@keyframes tpwlIconCircleExit {
  0%,
  ${EXIT_FINAL_START_PERCENT} {
    opacity: 0;
    transform: scale(${STYLE_CONFIG.exitCircleStartScale});
  }

  ${EXIT_CIRCLE_POP_PERCENT} {
    opacity: ${STYLE_CONFIG.exitCirclePopOpacity};
    transform: scale(${STYLE_CONFIG.exitCirclePopScale});
  }

  ${EXIT_CIRCLE_PEAK_PERCENT} {
    opacity: 1;
    transform: scale(${STYLE_CONFIG.exitCirclePeakScale});
  }

  100% {
    opacity: 0;
    transform: scale(${STYLE_CONFIG.exitCircleEndScale});
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
