"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ArtStoryImage } from "./storyImages";

type ArtStoryViewerProps = {
  images: readonly ArtStoryImage[];
};

const WHEEL_STEP_THRESHOLD = 260;
const WHEEL_COOLDOWN_MS = 520;
const WHEEL_IDLE_RESET_MS = 180;
const TOUCH_STEP_THRESHOLD = 86;
const FRAME_FADE_MS = 520;

export default function ArtStoryViewer({ images }: ArtStoryViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const activeIndexRef = useRef(0);
  const previousFrameTimerRef = useRef<number | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const wheelDeltaRef = useRef(0);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const wheelLockedUntilRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const totalImages = images.length;
  const activeImage = images[activeIndex];
  const previousImage = previousIndex !== null ? images[previousIndex] : null;

  const clearPreviousFrame = useCallback(() => {
    if (previousFrameTimerRef.current !== null) {
      window.clearTimeout(previousFrameTimerRef.current);
    }

    previousFrameTimerRef.current = window.setTimeout(() => {
      setPreviousIndex(null);
      previousFrameTimerRef.current = null;
    }, FRAME_FADE_MS);
  }, []);

  const stepFrame = useCallback(
    (direction: 1 | -1) => {
      const currentIndex = activeIndexRef.current;
      const nextIndex = Math.min(Math.max(currentIndex + direction, 0), totalImages - 1);

      if (nextIndex === currentIndex) {
        return false;
      }

      setPreviousIndex(currentIndex);
      setActiveIndex(nextIndex);
      activeIndexRef.current = nextIndex;
      clearPreviousFrame();
      return true;
    },
    [clearPreviousFrame, totalImages],
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      if (previousFrameTimerRef.current !== null) {
        window.clearTimeout(previousFrameTimerRef.current);
      }

      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;

    if (!viewer) {
      return undefined;
    }

    const resetWheelIntentSoon = () => {
      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }

      wheelIdleTimerRef.current = window.setTimeout(() => {
        wheelDeltaRef.current = 0;
        wheelIdleTimerRef.current = null;
      }, WHEEL_IDLE_RESET_MS);
    };

    const handleWheel = (event: WheelEvent) => {
      const direction = event.deltaY > 0 ? 1 : -1;
      const currentIndex = activeIndexRef.current;
      const atFirstFrame = currentIndex === 0;
      const atLastFrame = currentIndex === totalImages - 1;

      if ((direction < 0 && atFirstFrame) || (direction > 0 && atLastFrame)) {
        wheelDeltaRef.current = 0;
        return;
      }

      event.preventDefault();

      const now = window.performance.now();
      if (now < wheelLockedUntilRef.current) {
        return;
      }

      wheelDeltaRef.current += event.deltaY;
      resetWheelIntentSoon();

      if (Math.abs(wheelDeltaRef.current) < WHEEL_STEP_THRESHOLD) {
        return;
      }

      const didStep = stepFrame(wheelDeltaRef.current > 0 ? 1 : -1);
      if (didStep) {
        wheelDeltaRef.current = 0;
        wheelLockedUntilRef.current = now + WHEEL_COOLDOWN_MS;
      }
    };

    viewer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewer.removeEventListener("wheel", handleWheel);
    };
  }, [stepFrame, totalImages]);

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const touchStartY = touchStartYRef.current;
    const touchEndY = event.changedTouches[0]?.clientY;
    touchStartYRef.current = null;

    if (touchStartY === null || typeof touchEndY !== "number") {
      return;
    }

    const deltaY = touchStartY - touchEndY;

    if (Math.abs(deltaY) < TOUCH_STEP_THRESHOLD) {
      return;
    }

    stepFrame(deltaY > 0 ? 1 : -1);
  };

  return (
    <section
      className="artViewer"
      ref={viewerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="圆涟畸漪故事连载"
    >
      <div className="artViewer__stage">
        {previousImage ? (
          <img
            className="artViewer__image artViewer__image--previous"
            src={previousImage.src}
            width={previousImage.width}
            height={previousImage.height}
            alt=""
            aria-hidden="true"
          />
        ) : null}
        <img
          className="artViewer__image artViewer__image--active"
          key={activeImage.src}
          src={activeImage.src}
          width={activeImage.width}
          height={activeImage.height}
          alt={activeImage.alt}
        />
      </div>
      <div className="artViewer__counter" aria-live="polite">
        <span>{String(activeIndex + 1).padStart(2, "0")}</span>
        <span>{String(totalImages).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
