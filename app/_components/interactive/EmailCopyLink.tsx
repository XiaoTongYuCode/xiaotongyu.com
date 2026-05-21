"use client";

import { useEffect, useRef, useState } from "react";

import { useMagnetic } from "@/app/_lib/useMagnetic";

type EmailCopyLinkProps = {
  email: string;
  className?: string;
  children?: React.ReactNode;
};

type Status = "" | "Copying email" | "Email copied" | "Copy unavailable";

const RESET_AFTER_MS = 2200;

/**
 * "mailto:" link that also copies the address to the clipboard.
 * Shows a status string for screen readers.
 */
export default function EmailCopyLink({
  email,
  className,
  children,
}: EmailCopyLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const timerRef = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>("");
  useMagnetic(ref);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (timerRef.current) window.clearTimeout(timerRef.current);
    setStatus("Copying email");

    const onDone = (next: Status) => {
      setStatus(next);
      timerRef.current = window.setTimeout(() => setStatus(""), RESET_AFTER_MS);
    };

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard
        .writeText(email)
        .then(() => onDone("Email copied"))
        .catch(() => onDone("Copy unavailable"));
    } else {
      onDone("Copy unavailable");
    }
  };

  return (
    <>
      <a
        ref={ref}
        className={["contactLink", "magnetic", className].filter(Boolean).join(" ")}
        href={`mailto:${email}`}
        onClick={handleClick}
      >
        {children ?? email}
      </a>
      <span className="emailClickStatus" role="status" aria-live="polite">
        {status}
      </span>
    </>
  );
}
