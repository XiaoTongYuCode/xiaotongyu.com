"use client";

import type { AnchorHTMLAttributes } from "react";
import { useRef } from "react";

import { useMagnetic } from "@/app/_lib/useMagnetic";

type MagneticLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export default function MagneticLink({ className, children, ...rest }: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref);

  return (
    <a ref={ref} className={["magnetic", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </a>
  );
}
