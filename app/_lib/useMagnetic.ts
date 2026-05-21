"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Apply a small "magnetic" pull to an element when the pointer is over it.
 * Cleans up its own listeners when unmounted.
 */
export function useMagnetic(
  ref: RefObject<HTMLElement | null>,
  options: { translateX?: number; translateY?: number } = {},
) {
  const { translateX = 0.08, translateY = 0.14 } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      node.style.transform = `translate(${x * translateX}px, ${y * translateY}px)`;
    };

    const onLeave = () => {
      node.style.transform = "";
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, translateX, translateY]);
}
