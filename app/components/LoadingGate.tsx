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
};

const DEFAULT_INTRO_DURATION_MS = 1280;
const DEFAULT_EXIT_DURATION_MS = 2800;

export default function LoadingGate({
  buttonLabel = "Enter site",
  exitDurationMs = DEFAULT_EXIT_DURATION_MS,
  introDurationMs = DEFAULT_INTRO_DURATION_MS,
  lockBodyScroll = true,
  onComplete,
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
    }, exitDurationMs);
  };

  if (phase === "done") {
    return null;
  }

  return (
    <div
      className={["loadingGate", `loadingGate--${phase}`].join(" ")}
      style={{ "--loading-gate-exit-duration": `${exitDurationMs}ms` } as CSSProperties}
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
  animation: loadingGateOverlayExit var(--loading-gate-exit-duration) cubic-bezier(0.86, 0, 0.07, 1) both;
}

.loadingGate__stage {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  width: min(360px, calc(100vw - 48px));
  transform: translateY(-5vh);
}

.loadingGate__button {
  min-height: 34px;
  margin-top: clamp(66px, 14vh, 112px);
  padding: 0 18px;
  border: 1px solid rgba(5, 5, 5, 0.16);
  border-radius: 999px;
  background: rgba(5, 5, 5, 0.06);
  color: rgba(5, 5, 5, 0.82);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 720;
  line-height: 1;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  opacity: 0;
  transform: translateY(8px);
  transition:
    border-color 180ms var(--loading-gate-ease-hover),
    background 180ms var(--loading-gate-ease-hover),
    color 180ms var(--loading-gate-ease-hover),
    transform 180ms var(--loading-gate-ease-hover);
  animation: loadingGateButtonIn 520ms var(--loading-gate-ease-load) 920ms both;
}

.loadingGate__button:hover {
  border-color: rgba(5, 5, 5, 0.3);
  background: rgba(5, 5, 5, 0.1);
  color: #050505;
  transform: translateY(6px);
}

.loadingGate__button:focus-visible {
  outline: 2px solid rgba(5, 5, 5, 0.68);
  outline-offset: 4px;
}

.loadingGate--exiting .loadingGate__button {
  animation: loadingGateButtonOut 220ms ease both;
}

@media (max-width: 580px) {
  .loadingGate__stage {
    transform: translateY(-8vh);
  }

  .loadingGate__button {
    margin-top: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loadingGate,
  .loadingGate__button {
    animation: none;
  }

  .loadingGate__button {
    opacity: 1;
    transform: none;
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
