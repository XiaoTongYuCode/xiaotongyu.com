"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DotMorphReplicaStyles } from "./DotMorphReplicaStyles";
import { HeroLineField } from "./HeroLineField";
import { defaultSceneConfig, loadDepthSceneConfig } from "./sceneConfig";
import { StoryText } from "./StoryText";
import type { SceneConfig, SceneState } from "./types";
import { ArrowIcon, LoadingDots } from "./ui";
import { initRuntime, type Runtime } from "./runtimeController";
import { useTargetSmoothScroll } from "./useTargetSmoothScroll";
import { CONTACT_MAILTO, handleContactEmailClick, SiteFooter, SiteNav, useSiteCopy } from "../site/SiteChrome";

export default function DotMorphReplica() {
  useTargetSmoothScroll();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const storyStateHandlerRef = useRef<(state: SceneState) => void>(() => undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sceneConfig, setSceneConfig] = useState<SceneConfig>(defaultSceneConfig);
  const { copy, languageSwitcher } = useSiteCopy();
  const activeScenes = sceneConfig.scenes;
  const localizedScenes = useMemo(
    () =>
      activeScenes.map((scene) => ({
        ...scene,
        line: copy.scenes[scene.id] ?? scene.line,
      })),
    [activeScenes, copy.scenes],
  );
  useEffect(() => {
    let mounted = true;
    loadDepthSceneConfig()
      .then((loadedConfig) => {
        if (mounted && loadedConfig.scenes.length) {
          setSceneConfig(loadedConfig);
        }
      })
      .catch(() => {
        if (mounted) setSceneConfig(defaultSceneConfig);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return undefined;
    setIsLoaded(false);
    try {
      runtimeRef.current = initRuntime(canvas, section, sceneConfig, (state) => storyStateHandlerRef.current(state), setIsLoaded);
    } catch (error) {
      console.error(error);
      setIsLoaded(true);
    }
    return () => {
      runtimeRef.current?.cleanup();
      runtimeRef.current = null;
    };
  }, [sceneConfig]);

  return (
    <main className="dotmorph-page">
      <SiteNav copy={copy} languageSwitcher={languageSwitcher} />

      <section ref={sectionRef} className="defining-intelligence-section" aria-label={copy.hero.sectionLabel}>
        <div className="dotmorph-sticky">
          <HeroLineField />
          <canvas ref={canvasRef} className="dotmorph-canvas-mask" aria-hidden="true" />
          <LoadingDots visible={!isLoaded} />

          <div className="dotmorph-intro">
            <div>
              <h1>{copy.hero.title}</h1>
              <p>{copy.hero.subtitle}</p>
              <div className="dotmorph-actions">
                <a
                  href={CONTACT_MAILTO}
                  onClick={(event) => handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed)}
                >
                  {copy.hero.primaryCta}
                </a>
                <a href="/work">
                  {copy.hero.secondaryCta}
                  <ArrowIcon size={14} />
                </a>
              </div>
            </div>
          </div>

          <StoryText scenes={localizedScenes} stateHandlerRef={storyStateHandlerRef} />
        </div>
      </section>

      <section id="about" className="content-section">
        <div>
          <p className="section-kicker">{copy.content.kicker}</p>
          <div className="copy-stack">
            {copy.content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              {copy.content.closing} <a href="/work">{copy.content.join}</a>
            </p>
          </div>

        </div>
      </section>

      <SiteFooter copy={copy} />

      <DotMorphReplicaStyles />
    </main>
  );
}
