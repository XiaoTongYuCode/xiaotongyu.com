"use client";

import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  phase: number;
  size: number;
};

type LightningNode = { kind: "dot"; dot: Dot } | { kind: "pointer" };

type LightningPath = {
  nodes: LightningNode[];
  createdAt: number;
  drawDuration: number;
  expiresAt: number;
};

const POINTER_INFLUENCE_RADIUS = 180;
const MAX_LIGHTNING_SEGMENT_LENGTH = 100;

/**
 * Background dotted grid + cursor-driven lightning.
 * Owns its own canvas and pointer/scroll listeners.
 */
export default function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let pointerVisible = false;
    let lightningPaths: LightningPath[] = [];
    let nextLightningAt = 0;
    const pointer = { x: -1000, y: -1000, tx: -1000, ty: -1000 };
    const dots: Dot[] = [];

    const buildDots = () => {
      dots.length = 0;
      const gap = Math.max(22, Math.min(34, width / 42));
      const cols = Math.ceil(width / gap) + 2;
      const rows = Math.ceil(height / gap) + 8;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = col * gap - gap;
          const y = row * gap - gap * 4;
          dots.push({
            x,
            y,
            baseX: x,
            baseY: y,
            phase: Math.random() * Math.PI * 2,
            size: Math.random() * 1.6 + 0.8,
          });
        }
      }
    };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = Math.max(window.innerHeight, 760);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildDots();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      pointerVisible = true;
    };

    const onPointerLeave = () => {
      pointerVisible = false;
      lightningPaths = [];
    };

    const getLightningNodePoint = (node: LightningNode) => {
      if (node.kind === "pointer") return { x: pointer.tx, y: pointer.ty };
      return { x: node.dot.x, y: node.dot.y };
    };

    const buildLightningPath = (time: number): LightningPath | null => {
      const candidates = dots.filter((dot) => {
        const dx = dot.x - pointer.tx;
        const dy = dot.y - pointer.ty;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return (
          dot.x > -24 &&
          dot.x < width + 24 &&
          dot.y > -24 &&
          dot.y < height + 24 &&
          distance > 36 &&
          distance <= POINTER_INFLUENCE_RADIUS
        );
      });

      if (candidates.length < 4) return null;

      const pickNearbyDot = (origin: { x: number; y: number }, used: Set<Dot>) => {
        const nearby = candidates
          .filter((dot) => !used.has(dot))
          .map((dot) => ({ dot, distance: Math.hypot(dot.x - origin.x, dot.y - origin.y) }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3 + Math.floor(Math.random() * 3));
        if (nearby.length === 0) return null;
        return nearby[Math.floor(Math.random() * nearby.length)].dot;
      };

      const segmentCount = 3 + Math.floor(Math.random() * 3);
      const outwardNodes: LightningNode[] = [{ kind: "pointer" }];
      const used = new Set<Dot>();

      for (let i = 0; i < segmentCount; i += 1) {
        const origin = getLightningNodePoint(outwardNodes[outwardNodes.length - 1]);
        const dot = pickNearbyDot(origin, used);
        if (!dot) return null;
        used.add(dot);
        outwardNodes.push({ kind: "dot", dot });
      }

      return {
        nodes: [...outwardNodes].reverse(),
        createdAt: time,
        drawDuration: 680 + Math.random() * 260,
        expiresAt: time + 1480 + Math.random() * 520,
      };
    };

    const drawLightningPaths = (time: number) => {
      if (!pointerVisible) {
        lightningPaths = [];
        return;
      }

      lightningPaths = lightningPaths.filter((p) => time <= p.expiresAt);

      if (lightningPaths.length < 3 && time >= nextLightningAt) {
        const next = buildLightningPath(time);
        if (next) lightningPaths.push(next);
        nextLightningAt = time + 720 + Math.random() * 520;
      }

      lightningPaths.forEach((path) => {
        const life = path.expiresAt - path.createdAt;
        const age = time - path.createdAt;
        const drawProgress = Math.min(1, age / path.drawDuration);
        const fadeDuration = Math.max(1, life - path.drawDuration);
        const fadeProgress = Math.max(0, (age - path.drawDuration) / fadeDuration);
        const opacity = Math.min(1, age / 140) * Math.max(0, 1 - fadeProgress);

        const points = path.nodes.map(getLightningNodePoint);
        const constrained = [points[0]];
        for (let i = 1; i < points.length; i += 1) {
          const prev = constrained[constrained.length - 1];
          const target = points[i];
          const dx = target.x - prev.x;
          const dy = target.y - prev.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > MAX_LIGHTNING_SEGMENT_LENGTH) {
            const progress = MAX_LIGHTNING_SEGMENT_LENGTH / distance;
            constrained.push({
              x: prev.x + dx * progress,
              y: prev.y + dy * progress,
            });
            break;
          }
          constrained.push(target);
        }

        const segLengths = constrained.slice(1).map((p, i) => {
          const prev = constrained[i];
          return Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
        });
        const total = segLengths.reduce((sum, l) => sum + l, 0);
        if (total <= 0) return;

        let remaining = total * drawProgress;

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(constrained[0].x, constrained[0].y);
        for (let i = 1; i < constrained.length; i += 1) {
          const prev = constrained[i - 1];
          const point = constrained[i];
          const segLength = segLengths[i - 1];

          if (remaining >= segLength) {
            ctx.lineTo(point.x, point.y);
            remaining -= segLength;
            continue;
          }

          const segProgress = Math.max(0, remaining / Math.max(1, segLength));
          ctx.lineTo(
            prev.x + (point.x - prev.x) * segProgress,
            prev.y + (point.y - prev.y) * segProgress,
          );
          break;
        }
        ctx.globalAlpha = opacity * 0.12;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 7.2;
        ctx.stroke();

        ctx.globalAlpha = opacity * 0.36;
        ctx.strokeStyle = "rgba(17, 17, 17, 0.24)";
        ctx.lineWidth = 2.8;
        ctx.stroke();
        ctx.restore();
      });
    };

    const animate = (time: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.16;
      pointer.y += (pointer.ty - pointer.y) * 0.16;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(17, 17, 17, 0.22)";

      const wave = time * 0.001;
      const scrollY = window.scrollY;
      const scrollOffset = scrollY * 0.7;

      dots.forEach((dot) => {
        const dx = dot.baseX - pointer.x;
        const scrolledY =
          ((dot.baseY - scrollOffset + height * 1.5) % (height + 180)) - 90;
        const dy = scrolledY - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 1 - distance / POINTER_INFLUENCE_RADIUS);
        const driftX = Math.sin(wave + dot.phase + scrollY * 0.006) * 8;
        const driftY = Math.cos(wave * 0.82 + dot.phase) * 8;
        dot.x = dot.baseX + driftX + dx * force * 0.12;
        dot.y = scrolledY + driftY + dy * force * 0.12;

        ctx.globalAlpha = 0.18 + force * 0.34;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size + force * 2.4, 0, Math.PI * 2);
        ctx.fill();
      });

      drawLightningPaths(time);

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="dotField" aria-hidden="true" />;
}
