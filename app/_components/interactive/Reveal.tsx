"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type RevealProps<T extends ElementType = "div"> = {
  as?: T;
  index?: number;
  className?: string;
  children?: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/**
 * Wraps a block element and reveals it on scroll. Uses
 * IntersectionObserver and stays in the React tree (no DOM scans).
 */
export default function Reveal<T extends ElementType = "div">({
  as,
  index = 0,
  className,
  children,
  ...rest
}: RevealProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = {
    ["--reveal-index" as string]: `${Math.min(Math.max(index, 0), 10)}`,
  };

  return (
    <Component
      ref={ref as React.Ref<HTMLElement>}
      className={["reveal", revealed ? "isRevealed" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}
