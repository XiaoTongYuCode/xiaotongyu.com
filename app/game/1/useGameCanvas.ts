import { type Dispatch, type RefObject, type SetStateAction, useEffect } from "react";

import {
  HEIGHT,
  WIDTH,
  clearDebugSnapshot,
  createHud,
  renderGame,
  syncDebugSnapshot,
  updateGame,
  type GamePhase,
  type GameStore,
  type HudState,
} from "./gameModel";

type CanvasLoopRefs = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  storeRef: RefObject<GameStore>;
  lastHudPhaseRef: RefObject<GamePhase>;
  setGameCanvasReady: Dispatch<SetStateAction<boolean>>;
  setHud: Dispatch<SetStateAction<HudState>>;
};

export function useGameCanvas({
  canvasRef,
  storeRef,
  lastHudPhaseRef,
  setGameCanvasReady,
  setHud,
}: CanvasLoopRefs) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = WIDTH * ratio;
      canvas.height = HEIGHT * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    let frame = 0;
    const loop = (now: number) => {
      const store = storeRef.current;
      updateGame(store, now);
      renderGame(ctx, store);
      syncDebugSnapshot(store);
      if (now - store.lastHudAt > 80 || store.phase !== lastHudPhaseRef.current) {
        store.lastHudAt = now;
        lastHudPhaseRef.current = store.phase;
        setHud(createHud(store));
      }
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    renderGame(ctx, storeRef.current);
    syncDebugSnapshot(storeRef.current);
    setGameCanvasReady(true);
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      clearDebugSnapshot();
    };
  }, []);
}
