import { useEffect, useId, useRef } from "react";
import { HERO_LINE_PATHS } from "./content";

export function HeroLineField() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const shimmerRefs = useRef<(SVGEllipseElement | null)[]>([]);
  const pointerRef = useRef<SVGEllipseElement | null>(null);
  const maskRef = useRef<Array<{ cx: number; rx: number; y: number; speed: number; direction: number; opacity: number }>>([]);
  const targetPointer = useRef({ x: 800, y: 531, active: false });
  const smoothPointer = useRef({ x: 800, y: 531, opacity: 0 });
  const id = useId().replace(/:/g, "");
  const maskId = `hero-lines-mask-${id}`;
  const gradientId = `hero-shimmer-grad-${id}`;

  useEffect(() => {
    let seed = 99;
    const random = () => {
      seed = (16807 * seed) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const reset = (shape: (typeof maskRef.current)[number], randomValue = random) => {
      shape.cx = 100 + 1400 * randomValue();
      shape.rx = 520 + 520 * randomValue();
      shape.y = shape.direction === 1 ? -880 - 400 * randomValue() : 1942 + 400 * randomValue();
      shape.speed = 280 + 320 * randomValue();
      shape.opacity = 0.85 + 0.15 * randomValue();
    };
    maskRef.current = Array.from({ length: 8 }, (_, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      return {
        cx: 100 + 1400 * random(),
        rx: 520 + 520 * random(),
        y: direction === 1 ? -880 - 1062 * random() : 1942 + 1062 * random(),
        speed: 280 + 320 * random(),
        direction,
        opacity: 0.85 + 0.15 * random(),
      };
    });

    const pointerMove = (event: PointerEvent) => {
      const host = hostRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const scale = Math.max(1600 / rect.width, 1059 / rect.height);
      const scaledWidth = rect.width * scale;
      const scaledHeight = rect.height * scale;
      targetPointer.current.x = (event.clientX - rect.left) * scale - (scaledWidth - 1600) / 2;
      targetPointer.current.y = (event.clientY - rect.top) * scale - (scaledHeight - 1059) / 2;
      targetPointer.current.active = true;
    };
    const pointerLeave = () => {
      targetPointer.current.active = false;
    };

    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerleave", pointerLeave);

    let frameId = 0;
    let idleTimeoutId = 0;
    let last = performance.now();
    const scheduleFrame = (active: boolean) => {
      if (active) {
        frameId = window.requestAnimationFrame(frame);
        return;
      }
      idleTimeoutId = window.setTimeout(() => {
        frameId = window.requestAnimationFrame(frame);
      }, 200);
    };
    const frame = (now: number) => {
      frameId = 0;
      idleTimeoutId = 0;
      const host = hostRef.current;
      const active = host?.dataset.active !== "false" && !document.hidden;
      if (!active) {
        last = now;
        scheduleFrame(false);
        return;
      }

      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      for (let index = 0; index < 8; index += 1) {
        const shape = maskRef.current[index];
        if (!shape) continue;
        shape.y += shape.speed * delta * shape.direction;
        if ((shape.direction === 1 && shape.y > 1942) || (shape.direction === -1 && shape.y < -880)) reset(shape);
        const ellipse = shimmerRefs.current[index];
        if (ellipse) {
          ellipse.setAttribute("cx", shape.cx.toFixed(0));
          ellipse.setAttribute("cy", shape.y.toFixed(0));
          ellipse.setAttribute("rx", shape.rx.toFixed(0));
          ellipse.setAttribute("opacity", shape.opacity.toFixed(2));
        }
      }

      const pointer = smoothPointer.current;
      const target = targetPointer.current;
      pointer.x += (target.x - pointer.x) * 0.12;
      pointer.y += (target.y - pointer.y) * 0.12;
      pointer.opacity += ((target.active ? 1 : 0) - pointer.opacity) * 0.08;
      if (pointerRef.current) {
        pointerRef.current.setAttribute("cx", pointer.x.toFixed(0));
        pointerRef.current.setAttribute("cy", pointer.y.toFixed(0));
        pointerRef.current.setAttribute("opacity", pointer.opacity.toFixed(3));
      }
      scheduleFrame(true);
    };

    frameId = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(idleTimeoutId);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerleave", pointerLeave);
    };
  }, []);

  return (
    <div ref={hostRef} className="hero-line-field" aria-hidden="true">
      <svg viewBox="0 0 1600 1059" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
          <mask id={maskId}>
            <rect width="1600" height="1059" fill="black" />
            {Array.from({ length: 8 }, (_, index) => (
              <ellipse
                key={index}
                ref={(node) => {
                  shimmerRefs.current[index] = node;
                }}
                cx="800"
                cy="-200"
                rx="100"
                ry="440"
                fill={`url(#${gradientId})`}
                opacity="0.7"
              />
            ))}
            <ellipse ref={pointerRef} cx="800" cy="-2000" rx="420" ry="320" fill={`url(#${gradientId})`} opacity="0" />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          {HERO_LINE_PATHS.map((path, index) => (
            <path key={index} d={path} stroke="black" strokeOpacity="0.08" strokeWidth="1.5" />
          ))}
        </g>
      </svg>
    </div>
  );
}
