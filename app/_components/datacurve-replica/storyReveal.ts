import type { CSSProperties } from "react";
import { smoothstep } from "./timeline";

function characterReveal(index: number, total: number, local: number) {
  const span = Math.max(1, total - 1);
  const start = (index / span) * 0.9;
  return smoothstep(start, start + 0.12, local);
}

export function revealStyle(index: number, total: number, local: number): CSSProperties {
  const strength = characterReveal(index, total, local);
  return {
    opacity: 0.12 + strength * 0.88,
  };
}
