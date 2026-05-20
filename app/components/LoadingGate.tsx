"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import ThreePhaseWaveLoader, { type ThreePhaseWaveLoaderPhase } from "./ThreePhaseWaveLoader";

type LoadingGatePhase = ThreePhaseWaveLoaderPhase | "done";

type LoadingGateProps = {
  buttonLabel?: string;
  exitDurationMs?: number;
  introDurationMs?: number;
  lockBodyScroll?: boolean;
  onComplete?: () => void;
  revealDelayMs?: number;
};

const DEFAULT_INTRO_DURATION_MS = 1280;
const DEFAULT_EXIT_DURATION_MS = 2800;
const DEFAULT_REVEAL_DELAY_MS = 1000;

export default function LoadingGate({
  buttonLabel = "Enter site",
  exitDurationMs = DEFAULT_EXIT_DURATION_MS,
  introDurationMs = DEFAULT_INTRO_DURATION_MS,
  lockBodyScroll = true,
  onComplete,
  revealDelayMs = DEFAULT_REVEAL_DELAY_MS,
}: LoadingGateProps) {
  const [phase, setPhase] = useState<LoadingGatePhase>("intro");
  const exitTimerRef = useRef<number | null>(null);
  const previousBodyOverflowRef = useRef<string | null>(null);

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

  const enterSite = () => {
    if (phase === "exiting" || phase === "done") {
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
          title="Loading"
        />
        <div className="loadingGate__copy">
          <span className="loadingGate__name">Keep up and be committed to the next AI era</span>
          <span className="loadingGate__line">
            Focus on Game / Web / APP
          </span>
        </div>
        <button className="loadingGate__button" type="button" onClick={enterSite}>
          {buttonLabel}
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

.loadingGate__button:hover {
  background: #272727;
  color: #fff;
  transform: translateY(6px);
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
