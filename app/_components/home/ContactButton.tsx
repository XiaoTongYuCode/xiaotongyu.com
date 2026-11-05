"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CONTACT_EMAIL } from "../site/SiteChrome";
import styles from "./home.module.css";
import "./contact-motion.css";

type Props = {
  label: string;
  copyLabel: string;
  copied: string;
  copyFailed: string;
};

export default function ContactButton({ label, copyLabel, copied, copyFailed }: Props) {
  const [phase, setPhase] = useState<"idle" | "exit" | "enter-start" | "settled">("idle");
  const [result, setResult] = useState<"success" | "failure" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [widths, setWidths] = useState({ label: 0, email: 0 });
  const textRef = useRef<HTMLSpanElement>(null);
  const labelMeasure = useRef<HTMLSpanElement>(null);
  const emailMeasure = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copying = useRef(false);
  const swapping = useRef(false);
  const showEmail = phase === "enter-start" || phase === "settled";

  useLayoutEffect(() => {
    const measure = () => setWidths({
      label: labelMeasure.current?.getBoundingClientRect().width ?? 0,
      email: emailMeasure.current?.getBoundingClientRect().width ?? 0,
    });
    measure();
    const observer = new ResizeObserver(measure);
    if (labelMeasure.current) observer.observe(labelMeasure.current);
    if (emailMeasure.current) observer.observe(emailMeasure.current);
    return () => observer.disconnect();
  }, [label]);

  useLayoutEffect(() => {
    if (phase !== "enter-start" || !textRef.current) return;
    void textRef.current.offsetHeight;
    setPhase("settled");
  }, [phase]);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function revealAndCopy() {
    if (copying.current) return;
    copying.current = true;
    setAnnouncement("");

    if (!swapping.current) {
      swapping.current = true;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const value = getComputedStyle(document.documentElement).getPropertyValue("--text-swap-dur").trim();
      const duration = (parseFloat(value) || 150) * (value.endsWith("s") && !value.endsWith("ms") ? 1000 : 1);
      if (reducedMotion) {
        setPhase("settled");
      } else {
        setPhase("exit");
        timer.current = setTimeout(() => setPhase("enter-start"), duration);
      }
    }

    try {
      // The click is the only copy trigger, including when the email is already visible.
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setResult("success");
      setAnnouncement(copied);
    } catch {
      setResult("failure");
      setAnnouncement(copyFailed);
    } finally {
      copying.current = false;
    }
  }

  const check = (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <span className={styles.contactControl}>
      <button
        className={styles.secondaryButton}
        type="button"
        aria-label={showEmail ? `${copyLabel}: ${CONTACT_EMAIL}` : label}
        title={copyLabel}
        onClick={revealAndCopy}
      >
        <span className={`t-resize ${styles.contactTextFrame}`} style={{ width: (phase === "idle" ? widths.label : widths.email) || undefined }}>
          <span ref={textRef} className={`t-text-swap${phase === "exit" ? " is-exit" : phase === "enter-start" ? " is-enter-start" : ""}`}>
            {showEmail ? (
              <span className={styles.contactEmail}>
                {CONTACT_EMAIL}
                <span className={styles.copyCheck} data-copied={result === "success"}>{check}</span>
              </span>
            ) : label}
          </span>
        </span>
        <span ref={labelMeasure} className={styles.contactMeasure} aria-hidden="true">{label}</span>
        <span ref={emailMeasure} className={`${styles.contactMeasure} ${styles.contactEmail}`} aria-hidden="true">{CONTACT_EMAIL}{check}</span>
      </button>
      <span role="status" className={result === "failure" ? styles.contactError : styles.visuallyHidden}>{announcement}</span>
    </span>
  );
}
