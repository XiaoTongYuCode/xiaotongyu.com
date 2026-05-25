"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import ThreePhaseWaveLoader, { type ThreePhaseWaveLoaderPhase } from "./ThreePhaseWaveLoader";

type LoadingGatePhase = ThreePhaseWaveLoaderPhase | "done";

type LoadingGateProps = {
  buttonLabel?: string;
  description?: string;
  exitDurationMs?: number;
  iconTitle?: string;
  introDurationMs?: number;
  loadingButtonLabel?: string;
  lockBodyScroll?: boolean;
  onComplete?: () => void;
  preloadUrls?: readonly string[];
  revealDelayMs?: number;
  title?: string;
};

const DEFAULT_INTRO_DURATION_MS = 1280;
const DEFAULT_EXIT_DURATION_MS = 2000;
const DEFAULT_REVEAL_DELAY_MS = 1000;
const EMPTY_PRELOAD_URLS: readonly string[] = [];

export default function LoadingGate({
  buttonLabel = "Enter site",
  description = "Focus on Game / Web / APP",
  exitDurationMs = DEFAULT_EXIT_DURATION_MS,
  iconTitle = "Loading",
  introDurationMs = DEFAULT_INTRO_DURATION_MS,
  loadingButtonLabel = "Loading",
  lockBodyScroll = true,
  onComplete,
  preloadUrls = EMPTY_PRELOAD_URLS,
  revealDelayMs = DEFAULT_REVEAL_DELAY_MS,
  title = "Keep up and be committed to the next AI era",
}: LoadingGateProps) {
  const [phase, setPhase] = useState<LoadingGatePhase>("intro");
  const [preloadComplete, setPreloadComplete] = useState(preloadUrls.length === 0);
  const [preloadLoadedCount, setPreloadLoadedCount] = useState(0);
  const exitTimerRef = useRef<number | null>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);
  const preloadTotal = preloadUrls.length;
  const preloadProgress = preloadTotal > 0 ? preloadLoadedCount / preloadTotal : 1;
  const preloadProgressPercent = Math.round(preloadProgress * 100);
  const hasPreloadProgress = preloadTotal > 0;
  const canEnter = phase === "waiting" && preloadComplete;
  const resolvedButtonLabel = preloadComplete
    ? buttonLabel
    : `${loadingButtonLabel} ${preloadProgressPercent}%`;

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
    if (preloadUrls.length === 0) {
      setPreloadLoadedCount(0);
      setPreloadComplete(true);
      return undefined;
    }

    const uniqueUrls = Array.from(new Set(preloadUrls));
    let settledCount = 0;
    let cancelled = false;

    setPreloadLoadedCount(0);
    setPreloadComplete(false);

    const markSettled = () => {
      if (cancelled) {
        return;
      }

      settledCount += 1;
      setPreloadLoadedCount(settledCount);

      if (settledCount >= uniqueUrls.length) {
        setPreloadComplete(true);
      }
    };

    uniqueUrls.forEach((url) => {
      const image = new Image();
      let settled = false;
      const settleOnce = () => {
        if (settled) {
          return;
        }

        settled = true;
        markSettled();
      };

      image.decoding = "async";
      image.onload = settleOnce;
      image.onerror = settleOnce;
      image.src = url;

      if (image.complete) {
        settleOnce();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [preloadUrls]);

  useEffect(() => {
    if (phase === "done") {
      onComplete?.();
    }
  }, [onComplete, phase]);

  const enterSite = () => {
    if (phase === "exiting" || phase === "done") {
      return;
    }

    if (!canEnter) {
      return;
    }

    setPhase("exiting");
    exitTimerRef.current = window.setTimeout(() => {
      setPhase("done");
    }, exitDurationMs + revealDelayMs);
  };

  if (phase === "done") {
    return null;
  }

  return (
    <div
      className={["loadingGate", `loadingGate--${phase}`].join(" ")}
      style={
        {
          "--loading-gate-exit-duration": `${exitDurationMs}ms`,
          "--loading-gate-reveal-delay": `${revealDelayMs}ms`,
        } as CSSProperties
      }
      role="dialog"
      aria-modal="true"
    >
      <style>{loadingGateStyles}</style>
      <div className="loadingGate__stage">
        <ThreePhaseWaveLoader
          className="loadingGate__icon"
          exitDurationMs={exitDurationMs}
          phase={phase}
          title={iconTitle}
        />
        <div className="loadingGate__copy">
          {hasPreloadProgress ? (
            <div
              className="loadingGate__progress"
              style={{ "--loading-gate-progress": preloadProgress } as CSSProperties}
              aria-label={`Loading assets ${preloadProgressPercent}%`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={preloadProgressPercent}
            >
              <span />
            </div>
          ) : null}
          <span className="loadingGate__name">{title}</span>
          <span className="loadingGate__line">
            {description}
          </span>
        </div>
        <button
          className="loadingGate__button"
          type="button"
          onClick={enterSite}
          disabled={!canEnter}
        >
          {resolvedButtonLabel}
        </button>
      </div>
    </div>
  );
}

const loadingGateStyles = `
.loadingGate {
  --loading-gate-ease-load: cubic-bezier(0.16, 1, 0.3, 1);
  --loading-gate-ease-hover: cubic-bezier(0.22, 1, 0.36, 1);
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #fff;
  color: #050505;
  cursor: auto;
}

.loadingGate--exiting {
  pointer-events: none;
  animation: loadingGateOverlayExit var(--loading-gate-reveal-delay) cubic-bezier(0.22, 1, 0.36, 1) var(--loading-gate-exit-duration) both;
}

.loadingGate__stage {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  width: min(360px, calc(100vw - 48px));
  transform: translateY(-5vh);
}

.loadingGate__copy {
  display: grid;
  justify-items: center;
  gap: 16px;
  margin-top: clamp(20px, 2vh, 30px);
  opacity: 0;
  text-align: center;
  transform: translateY(8px);
  animation: loadingGateCopyIn 520ms var(--loading-gate-ease-load) 780ms both;
}

.loadingGate__name {
  max-width: min(520px, calc(100vw - 48px));
  font-size: 16px;
  font-weight: 650;
  line-height: 1.32;
}

.loadingGate__line {
  max-width: min(260px, calc(100vw - 72px));
  color: rgba(5, 5, 5, 0.48);
  font-size: 12px;
  font-weight: 620;
  line-height: 1.35;
}

.loadingGate__progress {
  position: relative;
  width: min(212px, calc(100vw - 112px));
  height: 2px;
  overflow: hidden;
  background: rgba(5, 5, 5, 0.12);
}

.loadingGate__progress span {
  position: absolute;
  inset: 0;
  display: block;
  background: #050505;
  transform: scaleX(var(--loading-gate-progress));
  transform-origin: 0 50%;
  transition: transform 180ms var(--loading-gate-ease-load);
}

.loadingGate__button {
  min-height: 24px;
  margin-top: 24px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  // background: #111;
  // color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 720;
  line-height: 1;
  opacity: 0;
  transform: translateY(8px);
  transition:
    background 180ms var(--loading-gate-ease-hover),
    box-shadow 180ms var(--loading-gate-ease-hover),
    color 180ms var(--loading-gate-ease-hover),
    transform 180ms var(--loading-gate-ease-hover);
  animation: loadingGateButtonIn 520ms var(--loading-gate-ease-load) 920ms both;
}

.loadingGate__button:disabled {
  color: rgba(5, 5, 5, 0.36);
  cursor: default;
}

.loadingGate__button:hover {
  background: #272727;
  color: #fff;
  transform: translateY(6px);
}

.loadingGate__button:disabled:hover {
  background: transparent;
  color: rgba(5, 5, 5, 0.36);
  transform: translateY(0);
}

.loadingGate__button:focus-visible {
  outline: 2px solid rgba(5, 5, 5, 0.68);
  outline-offset: 4px;
}

.loadingGate--exiting .loadingGate__copy,
.loadingGate--exiting .loadingGate__button {
  animation: loadingGateButtonOut 220ms ease both;
}

@media (max-width: 580px) {
  .loadingGate__stage {
    transform: translateY(-8vh);
  }

  .loadingGate__copy {
    gap: 12px;
    margin-top: 42px;
  }

  .loadingGate__name {
    max-width: min(320px, calc(100vw - 56px));
    font-size: 13px;
    line-height: 1.4;
  }

  .loadingGate__line {
    font-size: 10.5px;
  }

  .loadingGate__button {
    min-height: 32px;
    margin-top: 18px;
    padding: 0 16px;
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loadingGate,
  .loadingGate__copy,
  .loadingGate__button {
    animation: none;
  }

  .loadingGate__copy,
  .loadingGate__button {
    opacity: 1;
    transform: none;
  }
}

@keyframes loadingGateCopyIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingGateButtonIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingGateButtonOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes loadingGateOverlayExit {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    visibility: hidden;
  }
}
`;
