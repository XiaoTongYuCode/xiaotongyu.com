"use client";

import { useEffect, useRef } from "react";

/**
 * Top-of-viewport scroll progress bar. Also exposes
 * `--scroll-progress` and `--scroll-progress-eased` on `<html>`
 * for any CSS that wants to react to scroll.
 */
export default function ScrollProgress() {
  const targetRef = useRef(0);
  const easedRef = useRef(0);

  useEffect(() => {
    let animationFrame = 0;

    const update = () => {
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      targetRef.current = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      document.documentElement.style.setProperty(
        "--scroll-progress",
        targetRef.current.toFixed(4),
      );
    };

    const tick = () => {
      easedRef.current += (targetRef.current - easedRef.current) * 0.075;
      document.documentElement.style.setProperty(
        "--scroll-progress-eased",
        easedRef.current.toFixed(4),
      );
      animationFrame = window.requestAnimationFrame(tick);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div className="scrollProgress" aria-hidden="true" />;
}
