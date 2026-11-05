"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Locale, WorkItemCopy } from "../../_i18n";
import { CrowdRenderer, type CrowdProfile } from "./CrowdRenderer";
import { TRACK_COLORS } from "./crowdSimulation";
import { DISPLAY_NAME } from "../site/identity";
import { HOME_COPY } from "./copy";
import { POINTER_SLOT } from "./PointerTracking";
import styles from "./home.module.css";

const LABEL_BANKS = Array.from({ length: TRACK_COLORS.length * 2 }, (_, index) => index);

export default function CrowdScene({ locale, projects }: { locale: Locale; projects: WorkItemCopy[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const rendererRef = useRef<CrowdRenderer | null>(null);
  const [available, setAvailable] = useState(true);
  const isChinese = locale === "zh-CN";
  const content = HOME_COPY[locale];
  const profiles = useMemo<CrowdProfile[]>(() => {
    return [
      ...projects.map((project) => ({
        name: project.title,
        caption: content.projects[project.title]?.caption ?? project.kind,
        url: project.url,
        visitLabel: isChinese ? "访问" : "Visit",
      })),
      { name: DISPLAY_NAME, caption: content.personalCaption, url: "/about", visitLabel: isChinese ? "关于" : "About" },
    ];
  }, [projects, isChinese, content]);
  const profilesRef = useRef(profiles);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: CrowdRenderer;
    try {
      renderer = new CrowdRenderer(canvas, labelsRef.current, profilesRef.current);
      rendererRef.current = renderer;
      renderer.setPaused(preference.matches);
    } catch {
      setAvailable(false);
      return;
    }
    const updatePreference = () => {
      renderer.setPaused(preference.matches);
    };
    preference.addEventListener("change", updatePreference);
    const clearPointer = () => renderer.clearPointer();
    window.addEventListener("blur", clearPointer);
    return () => {
      preference.removeEventListener("change", updatePreference);
      window.removeEventListener("blur", clearPointer);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    profilesRef.current = profiles;
    rendererRef.current?.updateProfiles(profiles);
  }, [profiles]);

  return (
    <div
      className={styles.scene}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") {
          rendererRef.current?.clearPointer();
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        const track = event.target instanceof Element ? event.target.closest<HTMLElement>("a[data-person][aria-hidden='false']") : null;
        rendererRef.current?.setPointer(
          (event.clientX - rect.left) / Math.max(1, rect.width),
          (event.clientY - rect.top) / Math.max(1, rect.height),
          track?.dataset.person ? Number(track.dataset.person) : undefined,
        );
      }}
      onPointerLeave={() => rendererRef.current?.clearPointer()}
      onPointerCancel={() => rendererRef.current?.clearPointer()}
    >
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        aria-label={isChinese ? "带有移动虚影的人群。三路彩色追踪框轮流选中人物，鼠标附近的人物会显示橙色追踪框。" : "A softly focused walking crowd with motion trails. Three colored frames track people, with an orange frame selecting the person near your pointer."}
        role="img"
      />
      {available ? (
        <div className={styles.trackingLayer}>
          {LABEL_BANKS.map((index) => (
            <a
              key={index}
              ref={(element) => { labelsRef.current[index] = element; }}
              className={styles.track}
              style={{ "--track-color": TRACK_COLORS[Math.floor(index / 2)] } as CSSProperties}
              rel="noreferrer"
              aria-hidden="true"
              tabIndex={-1}
              data-slot={Math.floor(index / 2)}
              data-bank={index % 2}
              data-pointer-track={Math.floor(index / 2) === POINTER_SLOT ? "true" : undefined}
              onPointerDown={() => rendererRef.current?.setFocused(false)}
              onFocus={(event) => rendererRef.current?.setFocused(event.currentTarget.matches(":focus-visible"))}
              onBlur={() => rendererRef.current?.setFocused(false)}
            >
              <span className={styles.trackName} data-track-name />
              <span className={styles.trackBox} />
              <span className={styles.trackCaption} data-track-caption />
            </a>
          ))}
        </div>
      ) : (
        <p className={styles.sceneFallback}>{isChinese ? "每一个想法，都始于一次连接。" : "Every idea begins with a connection."}</p>
      )}
    </div>
  );
}
