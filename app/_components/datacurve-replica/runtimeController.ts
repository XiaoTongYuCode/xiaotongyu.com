import { DotMorphRuntime, type AvoidRect, type ClipSource } from "./DotMorphRuntime";
import { clamp } from "./timeline";
import type { SceneConfig, SceneState } from "./types";

declare global {
  interface Window {
    __morph?: unknown;
  }
}

export type Runtime = {
  cleanup: () => void;
};

function rectToScreenRect(element: Element | null, canvasRect: DOMRect, strength: number, padX: number, padY: number): AvoidRect | null {
  if (!element || canvasRect.width <= 0 || canvasRect.height <= 0) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 1 || rect.height <= 1) return null;
  const x0 = clamp((rect.left - canvasRect.left - padX) / canvasRect.width);
  const y0 = clamp((rect.top - canvasRect.top - padY) / canvasRect.height);
  const x1 = clamp((rect.right - canvasRect.left + padX) / canvasRect.width);
  const y1 = clamp((rect.bottom - canvasRect.top + padY) / canvasRect.height);
  if (x1 <= x0 || y1 <= y0) return null;
  return { x0, y0, x1, y1, strength };
}

function toRuntimeSources(config: SceneConfig): ClipSource[] {
  return config.scenes.map((scene) => ({
    ...scene,
    tint: "#000000",
  }));
}

export function initRuntime(canvas: HTMLCanvasElement, section: HTMLElement, config: SceneConfig, onState: (state: SceneState) => void, onLoad: (ready: boolean) => void): Runtime {
  const runtime = new DotMorphRuntime(canvas);
  const introElement = section.querySelector<HTMLElement>(".dotmorph-intro");
  const lineField = section.querySelector<HTMLElement>(".hero-line-field");
  const storyElement = section.querySelector<HTMLElement>(".dotmorph-story");
  const sources = toRuntimeSources(config);
  runtime.setSources(sources);
  runtime.setDensityScale(config.densityScale);
  runtime.setTransitionSpeed(config.transitionSpeed);

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mouse = { x: 0, y: 0 };
  const smoothMouse = { x: 0, y: 0 };
  let animationFrame = 0;
  let disposed = false;
  let paused = false;
  let lastStateKey = "";
  let lastTick = performance.now();
  let lastLoadReady: boolean | null = null;
  let runtimeReady = false;
  let sectionScrollRange = 1;
  let sectionTop = 0;
  const introFadeEnd = 0.053;
  const storyFadeStart = 0.049;
  const storyFadeDuration = 0.027;
  const canvasFadeDuration = 0.027;
  const timelineStart = 0.076;

  const resize = () => {
    sectionTop = section.offsetTop;
    sectionScrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
    void runtime.resize();
  };

  const currentProgress = () => clamp((window.scrollY - sectionTop) / sectionScrollRange);

  const pointer = (event: PointerEvent) => {
    mouse.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    mouse.y = (event.clientY / Math.max(1, window.innerHeight)) * -2 + 1;
  };

  const collectAvoidRects = (introOpacity: number): AvoidRect[] => {
    const canvasRect = canvas.getBoundingClientRect();
    return [
      rectToScreenRect(section.querySelector(".dotmorph-intro h1"), canvasRect, 0.8 * introOpacity, 28, 18),
      rectToScreenRect(section.querySelector(".dotmorph-intro p"), canvasRect, 0.55 * introOpacity, 34, 18),
      rectToScreenRect(section.querySelector(".dotmorph-actions"), canvasRect, 0.5 * introOpacity, 42, 28),
      rectToScreenRect(section.querySelector(".dotmorph-story p"), canvasRect, 0.46, 34, 18),
    ].filter((rect): rect is AvoidRect => Boolean(rect)).slice(0, 4);
  };

  const applyVisualState = (progress: number) => {
    const introOpacity = Math.max(0, 1 - progress / introFadeEnd);
    const storyOpacity = clamp((progress - storyFadeStart) / storyFadeDuration);
    const canvasOpacity = runtimeReady && !reducedQuery.matches ? clamp(progress / canvasFadeDuration) : 0;

    canvas.style.opacity = canvasOpacity.toFixed(4);
    if (introElement) {
      introElement.style.opacity = introOpacity.toFixed(4);
      introElement.style.transform = `translateY(${((1 - introOpacity) * 20).toFixed(2)}px) scale(${(0.92 + 0.08 * introOpacity).toFixed(3)})`;
      introElement.style.pointerEvents = introOpacity > 0.05 ? "auto" : "none";
    }
    if (lineField) {
      lineField.style.opacity = introOpacity.toFixed(4);
      lineField.dataset.active = introOpacity > 0.01 ? "true" : "false";
    }
    if (storyElement) storyElement.style.opacity = storyOpacity.toFixed(4);

    return { introOpacity, storyOpacity };
  };

  const emitLoad = (ready: boolean) => {
    if (lastLoadReady === ready) return;
    lastLoadReady = ready;
    onLoad(ready);
  };

  const frame = (now: number) => {
    if (disposed || paused) {
      animationFrame = 0;
      return;
    }
    const progress = currentProgress();
    const deltaSeconds = Math.min(0.08, Math.max(0.001, (now - lastTick) / 1000));
    lastTick = now;
    const { introOpacity } = applyVisualState(progress);
    const mouseResponse = reducedQuery.matches ? 1 : 1 - Math.exp(-deltaSeconds * 3.8);
    smoothMouse.x += (mouse.x - smoothMouse.x) * mouseResponse;
    smoothMouse.y += (mouse.y - smoothMouse.y) * mouseResponse;

    const intro = reducedQuery.matches ? 1 : clamp(progress / timelineStart);
    const scroll = clamp((progress - timelineStart) / (1 - timelineStart));
    runtime.setReducedMotion(reducedQuery.matches);
    runtime.setIntroT(intro);
    runtime.setScroll(scroll);
    runtime.setFinalProgress(0);
    runtime.setMousePosition(smoothMouse.x, smoothMouse.y);
    runtime.setAvoidRects(collectAvoidRects(introOpacity));
    const timeline = runtime.render(now);
    const stateKey = `${timeline.sceneIndex}:${timeline.phaseType}:${Math.round(timeline.local * 1000)}:${Math.round(timeline.morph * 1000)}`;
    if (stateKey !== lastStateKey) {
      lastStateKey = stateKey;
      onState({ index: timeline.sceneIndex, local: timeline.local, morph: timeline.morph, progress, phaseType: timeline.phaseType });
    }
    const status = runtime.loadStatus();
    emitLoad(status.ready > 0 || status.failed === status.total);
    animationFrame = window.requestAnimationFrame(frame);
  };

  const startFrame = () => {
    if (disposed || paused || animationFrame) return;
    runtime.resetClock();
    lastTick = performance.now();
    animationFrame = window.requestAnimationFrame(frame);
  };

  const stopFrame = () => {
    if (!animationFrame) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const handleScroll = () => {
    applyVisualState(currentProgress());
  };

  window.addEventListener("resize", resize);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("pointermove", pointer, { passive: true });
  resize();
  applyVisualState(currentProgress());
  runtime.firstReady().then((result) => {
    if (disposed) return;
    if (!result.ok) {
      emitLoad(true);
      return;
    }
    runtimeReady = true;
    window.__morph = runtime;
    emitLoad(true);
    applyVisualState(currentProgress());
    startFrame();
  });

  const visibility = () => {
    paused = document.hidden;
    if (paused) stopFrame();
    else startFrame();
  };
  document.addEventListener("visibilitychange", visibility);

  const observer = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver(([entry]) => {
        paused = Boolean(entry && !entry.isIntersecting) || document.hidden;
        if (paused) stopFrame();
        else startFrame();
      }, { threshold: 0 })
    : null;
  observer?.observe(section);

  return {
    cleanup: () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("visibilitychange", visibility);
      observer?.disconnect();
      if (window.__morph === runtime) window.__morph = undefined;
      runtime.destroy();
    },
  };
}
