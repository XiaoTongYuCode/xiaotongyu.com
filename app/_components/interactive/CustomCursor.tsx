"use client";

import { useEffect, useRef } from "react";

/**
 * Custom pointer follower with a smoothed ring and a precise dot.
 * Visually replaces the native cursor (CSS sets `cursor: none`).
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let animationFrame = 0;
    const pointer = { x: -1000, y: -1000, tx: -1000, ty: -1000 };

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      ring.classList.add("isVisible");
      dot.classList.add("isVisible");
    };

    const onPointerLeave = () => {
      ring.classList.remove("isVisible");
      dot.classList.remove("isVisible");
    };

    const tick = () => {
      pointer.x += (pointer.tx - pointer.x) * 0.16;
      pointer.y += (pointer.ty - pointer.y) * 0.16;
      ring.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      dot.style.transform = `translate3d(${pointer.tx}px, ${pointer.ty}px, 0) translate(-50%, -50%)`;
      animationFrame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursorRing" aria-hidden="true" />
      <div ref={dotRef} className="cursorDot" aria-hidden="true" />
    </>
  );
}
