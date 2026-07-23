import Lenis from "lenis";
import { useEffect } from "react";

declare global {
  interface Window {
    __lenis?: InstanceType<typeof Lenis>;
  }
}

export function useTargetSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia?.("(hover: none) and (pointer: coarse)").matches) return undefined;
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium")) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (value: number) => Math.min(1, 1.001 - 2 ** (-10 * value)),
    });
    let frameId = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(frame);
    };
    frameId = window.requestAnimationFrame(frame);
    window.__lenis = lenis;

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
      if (window.__lenis === lenis) window.__lenis = undefined;
    };
  }, []);
}
