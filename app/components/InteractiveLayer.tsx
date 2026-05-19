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

export default function InteractiveLayer() {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const riverCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const riverCanvas = riverCanvasRef.current;
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;

    if (!backgroundCanvas || !riverCanvas || !cursor || !cursorDot) {
      return;
    }

    const backgroundCtx = backgroundCanvas.getContext("2d");
    const riverCtx = riverCanvas.getContext("2d");
    if (!backgroundCtx || !riverCtx) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let scrollProgress = 0;
    const pointer = { x: -1000, y: -1000, tx: -1000, ty: -1000 };
    const dots: Dot[] = [];
    const riverDots: RiverDot[] = [];

    const getRiverBaseY = (x: number) =>
      height * 0.5 - (x / Math.max(1, width) - 0.5) * height * 0.32;

    const getRiverWidth = (x: number) => {
      const normalizedX = Math.min(1, Math.max(0, x / Math.max(1, width)));
      const centerDistance = Math.abs(normalizedX - 0.5) * 2;
      return 32 + Math.pow(centerDistance, 1.45) * 178;
    };

    const buildDots = () => {
      dots.length = 0;
      const gap = Math.max(28, Math.min(44, width / 34));
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

    const buildRiver = () => {
      riverDots.length = 0;
      const count = Math.max(520, Math.floor(width * 0.58));

      for (let index = 0; index < count; index += 1) {
        const cluster = Math.random();
        const laneSeed = Math.max(-1, Math.min(1, (Math.random() - 0.5) * 2.2));
        const x = Math.random() * width * 1.7;
        const diagonalBase = getRiverBaseY(x);
        const riverWidth = getRiverWidth(x);
        riverDots.push({
          x,
          y:
            diagonalBase +
            laneSeed * riverWidth +
            (Math.random() - 0.5) * (cluster > 0.58 ? riverWidth * 0.42 : 18),
          baseY: diagonalBase,
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
      [backgroundCanvas, riverCanvas].forEach((canvas) => {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      });
      backgroundCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      riverCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
      buildDots();
      buildRiver();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      cursor.classList.add("isVisible");
      cursorDot.classList.add("isVisible");
    };

    const onPointerLeave = () => {
      cursor.classList.remove("isVisible");
      cursorDot.classList.remove("isVisible");
    };

    const onScroll = () => {
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      scrollProgress = window.scrollY / maxScroll;
      document.documentElement.style.setProperty(
        "--scroll-progress",
        scrollProgress.toFixed(4),
      );
    };

    const animate = (time: number) => {
      const scrollY = window.scrollY;
      pointer.x += (pointer.tx - pointer.x) * 0.16;
      pointer.y += (pointer.ty - pointer.y) * 0.16;

      cursor.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      cursorDot.style.transform = `translate3d(${pointer.tx}px, ${pointer.ty}px, 0) translate(-50%, -50%)`;

      backgroundCtx.clearRect(0, 0, width, height);
      backgroundCtx.fillStyle = "rgba(17, 17, 17, 0.22)";

      const wave = time * 0.001;
      const scrollOffset = scrollY * 0.7;
      dots.forEach((dot) => {
        const dx = dot.baseX - pointer.x;
        const scrolledY =
          ((dot.baseY - scrollOffset + height * 1.5) % (height + 180)) - 90;
        const dy = scrolledY - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, 1 - distance / 180);
        const driftX = Math.sin(wave + dot.phase + scrollY * 0.006) * 8;
        const driftY = Math.cos(wave * 0.82 + dot.phase) * 8;
        dot.x = dot.baseX + driftX + dx * force * 0.12;
        dot.y = scrolledY + driftY + dy * force * 0.12;

        backgroundCtx.globalAlpha = 0.18 + force * 0.34;
        backgroundCtx.beginPath();
        backgroundCtx.arc(dot.x, dot.y, dot.size + force * 2.4, 0, Math.PI * 2);
        backgroundCtx.fill();
      });

      riverCtx.clearRect(0, 0, width, height);
      const riverGradient = riverCtx.createLinearGradient(0, 0, width, 0);
      riverGradient.addColorStop(0, "rgba(17, 17, 17, 0)");
      riverGradient.addColorStop(0.16, "rgba(17, 17, 17, 0.28)");
      riverGradient.addColorStop(0.52, "rgba(17, 17, 17, 0.52)");
      riverGradient.addColorStop(0.84, "rgba(17, 17, 17, 0.24)");
      riverGradient.addColorStop(1, "rgba(17, 17, 17, 0)");
      riverCtx.fillStyle = riverGradient;

      riverDots.forEach((dot) => {
        const riverWave = Math.sin(wave * 1.8 + dot.phase + dot.x * 0.006);
        const clusterPulse = Math.sin(wave * 2.4 + dot.cluster * 10);
        dot.x -= dot.speed;

        if (dot.x < -80) {
          dot.x = width + Math.random() * width * 0.55;
          dot.laneSeed = Math.max(-1, Math.min(1, (Math.random() - 0.5) * 2.2));
          dot.baseY = getRiverBaseY(dot.x);
          dot.y =
            dot.baseY +
            dot.laneSeed * getRiverWidth(dot.x) +
            (Math.random() - 0.5) * 42;
          dot.cluster = Math.random();
          dot.size = 0.75 + Math.random() * (dot.cluster > 0.58 ? 2.8 : 1.45);
          dot.speed = 0.25 + Math.random() * 0.85 + dot.cluster * 0.42;
        }

        dot.baseY = getRiverBaseY(dot.x);
        const targetY =
          dot.baseY +
          dot.laneSeed * getRiverWidth(dot.x) +
          riverWave * 20 +
          clusterPulse * dot.cluster * 14;
        dot.y += (targetY - dot.y) * 0.032;
        const heroFade = Math.max(0, 1 - scrollY / (height * 0.75));
        const centerBias = Math.max(0.24, 1 - Math.abs(dot.y - dot.baseY) / (getRiverWidth(dot.x) * 1.9));
        riverCtx.globalAlpha = heroFade * centerBias * (0.22 + dot.cluster * 0.58);
        riverCtx.beginPath();
        riverCtx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        riverCtx.fill();
      });

      animationFrame = window.requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("isRevealed");
          }
        });
      },
      { threshold: 0.18 },
    );

    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });

    const onMagneticMove = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const pointerEvent = event as PointerEvent;
      const rect = target.getBoundingClientRect();
      const x = pointerEvent.clientX - rect.left - rect.width / 2;
      const y = pointerEvent.clientY - rect.top - rect.height / 2;
      target.style.transform = `translate(${x * 0.08}px, ${y * 0.14}px)`;
    };

    const onMagneticLeave = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      target.style.transform = "";
    };

    const emailResetTimers = new WeakMap<HTMLAnchorElement, number>();
    const activeEmailLinks = new Set<HTMLAnchorElement>();

    const getEmailStatusElement = (target: HTMLAnchorElement) => {
      const statusElement = target.nextElementSibling;
      if (
        statusElement instanceof HTMLElement &&
        statusElement.classList.contains("emailClickStatus")
      ) {
        return statusElement;
      }

      return null;
    };

    const onContactEmailClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        "a.contactLink[href^='mailto:']",
      );

      if (!target) {
        return;
      }

      const statusElement = getEmailStatusElement(target);
      const email = target.href.replace(/^mailto:/, "").split("?")[0];

      event.preventDefault();
      activeEmailLinks.add(target);

      const existingResetTimer = emailResetTimers.get(target);
      if (existingResetTimer) {
        window.clearTimeout(existingResetTimer);
      }

      if (statusElement) {
        statusElement.textContent = "Copying email";
      }

      if (navigator.clipboard?.writeText) {
        void navigator.clipboard
          .writeText(email)
          .then(() => {
            if (statusElement) {
              statusElement.textContent = "Email copied";
            }
          })
          .catch(() => {
            if (statusElement) {
              statusElement.textContent = "Copy unavailable";
            }
          });
      } else if (statusElement) {
        statusElement.textContent = "Copy unavailable";
      }

      if (statusElement) {
        const resetTimer = window.setTimeout(() => {
          if (statusElement) {
            statusElement.textContent = "";
          }
        }, 2200);
        emailResetTimers.set(target, resetTimer);
      }
    };

    const capabilitySettleTimers = new WeakMap<HTMLElement, number>();

    const onCapabilityMove = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const pointerEvent = event as PointerEvent;
      const rect = target.getBoundingClientRect();
      const x = pointerEvent.clientX - rect.left;
      const y = pointerEvent.clientY - rect.top;
      const tiltX = (y / rect.height - 0.5) * -5;
      const tiltY = (x / rect.width - 0.5) * 5;
      const settleTimer = capabilitySettleTimers.get(target);

      if (settleTimer) {
        window.clearTimeout(settleTimer);
        capabilitySettleTimers.delete(target);
      }

      target.classList.remove("isPointerSettling");
      target.classList.add("isPointerActive");
      target.querySelectorAll<HTMLElement>(".capabilityIconDot").forEach((dot) => {
        dot.style.transform = "";
      });
      target.style.setProperty("--card-x", `${x}px`);
      target.style.setProperty("--card-y", `${y}px`);
      target.style.setProperty("--card-tilt-x", `${tiltX.toFixed(2)}deg`);
      target.style.setProperty("--card-tilt-y", `${tiltY.toFixed(2)}deg`);
    };

    const onCapabilityLeave = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const dots = target.querySelectorAll<HTMLElement>(".capabilityIconDot");

      dots.forEach((dot) => {
        const transform = window.getComputedStyle(dot).transform;
        dot.style.transform = transform === "none" ? "" : transform;
      });

      target.classList.remove("isPointerActive");
      target.classList.add("isPointerSettling");
      target.style.setProperty("--card-tilt-x", "0deg");
      target.style.setProperty("--card-tilt-y", "0deg");

      window.requestAnimationFrame(() => {
        dots.forEach((dot) => {
          dot.style.transform = "";
        });
      });

      const settleTimer = window.setTimeout(() => {
        target.style.setProperty("--card-x", "28px");
        target.style.setProperty("--card-y", "28px");
        target.classList.remove("isPointerSettling");
        capabilitySettleTimers.delete(target);
      }, 560);
      capabilitySettleTimers.set(target, settleTimer);
    };

    const magneticElements = document.querySelectorAll<HTMLElement>(".magnetic");
    magneticElements.forEach((element) => {
      element.addEventListener("pointermove", onMagneticMove);
      element.addEventListener("pointerleave", onMagneticLeave);
    });
    document.addEventListener("click", onContactEmailClick);
    const capabilityCards = document.querySelectorAll<HTMLElement>(".capabilityCard");
    capabilityCards.forEach((element) => {
      element.addEventListener("pointermove", onCapabilityMove);
      element.addEventListener("pointerleave", onCapabilityLeave);
    });

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      magneticElements.forEach((element) => {
        element.removeEventListener("pointermove", onMagneticMove);
        element.removeEventListener("pointerleave", onMagneticLeave);
      });
      document.removeEventListener("click", onContactEmailClick);
      activeEmailLinks.forEach((element) => {
        const resetTimer = emailResetTimers.get(element);
        if (resetTimer) {
          window.clearTimeout(resetTimer);
        }
      });
      capabilityCards.forEach((element) => {
        const settleTimer = capabilitySettleTimers.get(element);
        if (settleTimer) {
          window.clearTimeout(settleTimer);
        }
        element.removeEventListener("pointermove", onCapabilityMove);
        element.removeEventListener("pointerleave", onCapabilityLeave);
      });
    };
  }, []);

  return (
    <>
      <canvas ref={backgroundCanvasRef} className="dotField" aria-hidden="true" />
      <canvas ref={riverCanvasRef} className="heroRiver" aria-hidden="true" />
      <div ref={cursorRef} className="cursorRing" aria-hidden="true" />
      <div ref={cursorDotRef} className="cursorDot" aria-hidden="true" />
    </>
  );
}
