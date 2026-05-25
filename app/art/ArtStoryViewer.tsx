"use client";

import type { MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ArtStoryImage } from "./storyImages";

type ArtStoryViewerProps = {
  autoAdvanceActive: boolean;
  images: readonly ArtStoryImage[];
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
};

const AUTO_ADVANCE_INTERVAL_MS = 3000;
const WHEEL_STEP_THRESHOLD = 150;
const WHEEL_COOLDOWN_MS = 360;
const WHEEL_IDLE_RESET_MS = 140;
const TOUCH_STEP_THRESHOLD = 48;
const FRAME_FADE_MS = 520;

export default function ArtStoryViewer({
  autoAdvanceActive,
  images,
  isAudioPlaying,
  onToggleAudio,
}: ArtStoryViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoAdvanceEnabled, setIsAutoAdvanceEnabled] = useState(true);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const activeIndexRef = useRef(0);
  const previousFrameTimerRef = useRef<number | null>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const wheelDeltaRef = useRef(0);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const wheelLockedUntilRef = useRef(0);
  const touchHandledRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const totalImages = images.length;
  const activeImage = images[activeIndex];
  const previousImage = previousIndex !== null ? images[previousIndex] : null;
  const hasReachedLastFrame = activeIndex === totalImages - 1;

  const clearPreviousFrame = useCallback(() => {
    if (previousFrameTimerRef.current !== null) {
      window.clearTimeout(previousFrameTimerRef.current);
    }

    previousFrameTimerRef.current = window.setTimeout(() => {
      setPreviousIndex(null);
      previousFrameTimerRef.current = null;
    }, FRAME_FADE_MS);
  }, []);

  const goToFrame = useCallback(
    (targetIndex: number) => {
      const currentIndex = activeIndexRef.current;
      const nextIndex = Math.min(Math.max(targetIndex, 0), totalImages - 1);

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

  const stepFrame = useCallback(
    (direction: 1 | -1) => {
      return goToFrame(activeIndexRef.current + direction);
    },
    [goToFrame],
  );

  const handleActiveImageClick = useCallback(
    (event: MouseEvent<HTMLImageElement>) => {
      const imageRect = event.currentTarget.getBoundingClientRect();
      const direction = event.clientX < imageRect.left + imageRect.width / 2 ? -1 : 1;

      stepFrame(direction);
    },
    [stepFrame],
  );

  const toggleAutoAdvance = useCallback(() => {
    setIsAutoAdvanceEnabled((currentValue) => {
      if (!currentValue && activeIndexRef.current === totalImages - 1) {
        goToFrame(0);
      }

      return !currentValue;
    });
  }, [goToFrame, totalImages]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (!autoAdvanceActive || !isAutoAdvanceEnabled) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (activeIndexRef.current >= totalImages - 1) {
        setIsAutoAdvanceEnabled(false);
        return;
      }

      stepFrame(1);
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoAdvanceActive, isAutoAdvanceEnabled, stepFrame, totalImages]);

  useEffect(() => {
    if (activeIndex < totalImages - 1 && window.scrollY > 0) {
      window.scrollTo({ left: 0, top: 0 });
    }
  }, [activeIndex, totalImages]);

  useEffect(() => {
    const handleScroll = () => {
      if (activeIndexRef.current < totalImages - 1 && window.scrollY > 0) {
        window.scrollTo({ left: 0, top: 0 });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [totalImages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        !["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)
      ) {
        return;
      }

      const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
      const currentIndex = activeIndexRef.current;
      const atFirstFrame = currentIndex === 0;
      const atLastFrame = currentIndex === totalImages - 1;

      if ((direction < 0 && atFirstFrame) || (direction > 0 && atLastFrame)) {
        return;
      }

      event.preventDefault();
      stepFrame(direction);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [stepFrame, totalImages]);

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

  useEffect(() => {
    const viewer = viewerRef.current;

    if (!viewer) {
      return undefined;
    }

    const resetTouch = () => {
      touchStartRef.current = null;
      touchHandledRef.current = false;
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
      touchHandledRef.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchStart = touchStartRef.current;
      const touch = event.touches[0];

      if (!touchStart || !touch) {
        return;
      }

      const deltaX = touchStart.x - touch.clientX;
      const deltaY = touchStart.y - touch.clientY;
      const dominantDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

      if (Math.hypot(deltaX, deltaY) < TOUCH_STEP_THRESHOLD) {
        return;
      }

      const direction = dominantDelta > 0 ? 1 : -1;
      const currentIndex = activeIndexRef.current;
      const atFirstFrame = currentIndex === 0;
      const atLastFrame = currentIndex === totalImages - 1;

      if ((direction < 0 && atFirstFrame) || (direction > 0 && atLastFrame)) {
        resetTouch();
        return;
      }

      event.preventDefault();

      if (touchHandledRef.current) {
        return;
      }

      touchHandledRef.current = stepFrame(direction);
    };

    viewer.addEventListener("touchstart", handleTouchStart, { passive: true });
    viewer.addEventListener("touchmove", handleTouchMove, { passive: false });
    viewer.addEventListener("touchend", resetTouch);
    viewer.addEventListener("touchcancel", resetTouch);

    return () => {
      viewer.removeEventListener("touchstart", handleTouchStart);
      viewer.removeEventListener("touchmove", handleTouchMove);
      viewer.removeEventListener("touchend", resetTouch);
      viewer.removeEventListener("touchcancel", resetTouch);
    };
  }, [stepFrame, totalImages]);

  return (
    <>
      <section
        className="artViewer"
        ref={viewerRef}
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
            onClick={handleActiveImageClick}
          />
        </div>
        <div className="artViewer__controls">
          <div className="artViewer__counter" aria-live="polite">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            <span>{String(totalImages).padStart(2, "0")}</span>
            <button
              className="artViewer__stepButton"
              type="button"
              onClick={() => stepFrame(-1)}
              disabled={activeIndex === 0}
              aria-label="Previous image"
            >
              {"<"}
            </button>
            <button
              className="artViewer__stepButton"
              type="button"
              onClick={() => stepFrame(1)}
              disabled={activeIndex === totalImages - 1}
              aria-label="Next image"
            >
              {">"}
            </button>
          </div>
          <button
            className="artViewer__autoButton"
            type="button"
            onClick={toggleAutoAdvance}
            aria-label={isAutoAdvanceEnabled ? "Pause autoplay" : "Start autoplay"}
            aria-pressed={isAutoAdvanceEnabled}
          >
            {isAutoAdvanceEnabled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="14" y="3" width="5" height="18" rx="1" />
                <rect x="5" y="3" width="5" height="18" rx="1" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
              </svg>
            )}
          </button>
          <button
            className="artViewer__audioButton"
            type="button"
            onClick={onToggleAudio}
            aria-label={isAudioPlaying ? "Pause music" : "Play music"}
            aria-pressed={isAudioPlaying}
          >
            {isAudioPlaying ? (

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                <path d="M16 9a5 5 0 0 1 0 6" />
                <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 9a5 5 0 0 1 .95 2.293" />
                <path d="M19.364 5.636a9 9 0 0 1 1.889 9.96" />
                <path d="m2 2 20 20" />
                <path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11" />
                <path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686" />
              </svg>
            )}
          </button>
        </div>
      </section>
      {hasReachedLastFrame ? (
        <section className="artSignature" aria-label="署名">
          <p>圆涟畸漪</p>
        </section>
      ) : null}
    </>
  );
}
