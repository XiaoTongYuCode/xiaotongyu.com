"use client";

import { useEffect, useRef } from "react";

type RiverDot = {
  x: number;
  y: number;
  baseY: number;
  laneSeed: number;
  speed: number;
  phase: number;
  size: number;
  cluster: number;
};

/**
 * Diagonal "river" of particles flowing across the hero area.
 * Self-contained canvas component.
 */
export default function HeroRiver() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    const riverDots: RiverDot[] = [];

    const getBaseY = (x: number) =>
      height * 0.5 - (x / Math.max(1, width) - 0.5) * height * 0.32;

    const getRiverWidth = (x: number) => {
      const normalizedX = Math.min(1, Math.max(0, x / Math.max(1, width)));
      const centerDistance = Math.abs(normalizedX - 0.5) * 2;
      return 32 + Math.pow(centerDistance, 1.45) * 178;
    };

    const buildRiver = () => {
      riverDots.length = 0;
      const count = Math.max(520, Math.floor(width * 0.58));

      for (let i = 0; i < count; i += 1) {
        const cluster = Math.random();
        const laneSeed = Math.max(-1, Math.min(1, (Math.random() - 0.5) * 2.2));
        const x = Math.random() * width * 1.7;
        const baseY = getBaseY(x);
        const riverWidth = getRiverWidth(x);
        riverDots.push({
          x,
          y:
            baseY +
            laneSeed * riverWidth +
            (Math.random() - 0.5) * (cluster > 0.58 ? riverWidth * 0.42 : 18),
          baseY,
          laneSeed,
          speed: 0.25 + Math.random() * 0.85 + cluster * 0.42,
          phase: Math.random() * Math.PI * 2,
          size: 0.75 + Math.random() * (cluster > 0.58 ? 2.8 : 1.45),
          cluster,
        });
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
      buildRiver();
    };

    const animate = (time: number) => {
      const wave = time * 0.001;
      const scrollY = window.scrollY;

      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(17, 17, 17, 0)");
      gradient.addColorStop(0.16, "rgba(17, 17, 17, 0.28)");
      gradient.addColorStop(0.52, "rgba(17, 17, 17, 0.52)");
      gradient.addColorStop(0.84, "rgba(17, 17, 17, 0.24)");
      gradient.addColorStop(1, "rgba(17, 17, 17, 0)");
      ctx.fillStyle = gradient;

      riverDots.forEach((dot) => {
        const riverWave = Math.sin(wave * 1.8 + dot.phase + dot.x * 0.006);
        const clusterPulse = Math.sin(wave * 2.4 + dot.cluster * 10);
        dot.x -= dot.speed;

        if (dot.x < -80) {
          dot.x = width + Math.random() * width * 0.55;
          dot.laneSeed = Math.max(-1, Math.min(1, (Math.random() - 0.5) * 2.2));
          dot.baseY = getBaseY(dot.x);
          dot.y =
            dot.baseY +
            dot.laneSeed * getRiverWidth(dot.x) +
            (Math.random() - 0.5) * 42;
          dot.cluster = Math.random();
          dot.size = 0.75 + Math.random() * (dot.cluster > 0.58 ? 2.8 : 1.45);
          dot.speed = 0.25 + Math.random() * 0.85 + dot.cluster * 0.42;
        }

        dot.baseY = getBaseY(dot.x);
        const targetY =
          dot.baseY +
          dot.laneSeed * getRiverWidth(dot.x) +
          riverWave * 20 +
          clusterPulse * dot.cluster * 14;
        dot.y += (targetY - dot.y) * 0.032;

        const heroFade = Math.max(0, 1 - scrollY / (height * 0.75));
        const centerBias = Math.max(
          0.24,
          1 - Math.abs(dot.y - dot.baseY) / (getRiverWidth(dot.x) * 1.9),
        );
        ctx.globalAlpha = heroFade * centerBias * (0.22 + dot.cluster * 0.58);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="heroRiver" aria-hidden="true" />;
}
