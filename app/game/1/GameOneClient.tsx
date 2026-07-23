"use client";

import { type PointerEvent, useCallback, useEffect, useRef, useState } from "react";

import styles from "./GameOne.module.css";
import { useGameCanvas } from "./useGameCanvas";
import { useGameThreeScene } from "./useGameThreeScene";
import {
  DEFAULT_CHICKEN_MODEL_URL,
  INITIAL_HUD,
  STORAGE_KEY,
  createHud,
  createStore,
  jumpOrThrust,
  startRun,
  type GamePhase,
  type GameStore,
  type HudState,
  type ThemeMode,
} from "./gameModel";

export default function GameOneClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeLayerRef = useRef<HTMLDivElement>(null);
  const titleCoinSlotRef = useRef<HTMLSpanElement>(null);
  const scorePillRef = useRef<HTMLButtonElement>(null);
  const storeRef = useRef<GameStore>(createStore());
  const lastHudPhaseRef = useRef<GamePhase>("ready");
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [launching, setLaunching] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gamePreloadReady, setGamePreloadReady] = useState(false);
  const [gameCanvasReady, setGameCanvasReady] = useState(false);
  const [gameModelReady, setGameModelReady] = useState(false);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameLoadProgress, setGameLoadProgress] = useState(0.08);

  const syncHud = useCallback(() => {
    const store = storeRef.current;
    lastHudPhaseRef.current = store.phase;
    setHud(createHud(store));
  }, []);

  const begin = useCallback(() => {
    if (launching) return;
    setLaunching(true);
    startRun(storeRef.current, 1500);
    syncHud();
    window.setTimeout(() => {
      setLaunching(false);
      syncHud();
    }, 1500);
  }, [launching, syncHud]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "day" ? "night" : "day";
      storeRef.current.theme = next;
      return next;
    });
  }, []);

  const togglePause = useCallback(() => {
    const store = storeRef.current;
    if (store.phase === "playing") {
      store.phase = "paused";
      store.input.thrust = false;
      syncHud();
      return;
    }
    if (store.phase === "paused") {
      store.phase = "playing";
      store.lastFrame = performance.now();
      syncHud();
      return;
    }
    begin();
  }, [begin, syncHud]);

  const resetRun = useCallback(() => {
    setLaunching(false);
    startRun(storeRef.current, 0);
    syncHud();
  }, [syncHud]);

  const openHowToPlay = useCallback(() => {
    if (storeRef.current.phase === "playing") {
      storeRef.current.phase = "paused";
      storeRef.current.input.thrust = false;
      syncHud();
    }
    setShowHowToPlay(true);
  }, [syncHud]);

  const openLeaderboard = useCallback(() => {
    setShowLeaderboard(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const preload = async () => {
      const resources = [
        "/game/1/chicken-model.json",
        DEFAULT_CHICKEN_MODEL_URL,
        "/xtyopen-logo.svg",
      ];
      let completed = 0;
      for (const resource of resources) {
        try {
          await fetch(resource, { cache: "force-cache" });
        } catch {
        }
        if (cancelled) return;
        completed += 1;
        setGameLoadProgress(Math.max(0.08, completed / resources.length * 0.72));
      }
      setGamePreloadReady(true);
    };
    void preload();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const readyCount = [gamePreloadReady, gameCanvasReady, gameModelReady].filter(Boolean).length;
    setGameLoadProgress((current) => Math.max(current, readyCount / 3));
    if (!gamePreloadReady || !gameCanvasReady || !gameModelReady) return undefined;
    const timer = window.setTimeout(() => {
      setGameLoadProgress(1);
      setGameLoading(false);
    }, 360);
    return () => window.clearTimeout(timer);
  }, [gameCanvasReady, gameModelReady, gamePreloadReady]);

  useEffect(() => {
    try {
      const storedBest = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
      if (Number.isFinite(storedBest)) {
        storeRef.current.bestScore = storedBest;
        syncHud();
      }
    } catch {
      syncHud();
    }
  }, [syncHud]);

  useGameCanvas({ canvasRef, storeRef, lastHudPhaseRef, setGameCanvasReady, setHud });
  useGameThreeScene({ threeLayerRef, titleCoinSlotRef, scorePillRef, storeRef, setGameModelReady });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const store = storeRef.current;
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        event.preventDefault();
        if (store.phase === "ready") {
          begin();
          return;
        }
        if (store.phase === "paused") {
          togglePause();
          return;
        }
        jumpOrThrust(store);
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        store.input.left = true;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        store.input.right = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const store = storeRef.current;
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        store.input.thrust = false;
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        store.input.left = false;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        store.input.right = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [begin, togglePause]);

  const handlePointerDown = () => {
    const store = storeRef.current;
    if (store.phase === "ready") {
      begin();
      return;
    }
    if (store.phase === "paused") return;
    jumpOrThrust(store);
  };

  const handlePointerUp = () => {
    storeRef.current.input.thrust = false;
  };

  const progressLabel = Math.round(hud.progress * 100);
  const stopPointer = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <main className={`${styles.gamePage} ${theme === "night" ? styles.gamePageNight : ""}`}>
      {gameLoading ? (
        <div className={styles.gameLoader} role="status" aria-live="polite">
          <div className={styles.gameLoaderMark} aria-hidden="true">
            <span />
          </div>
          <div className={styles.gameLoaderCopy}>
            <p>Loading game</p>
            <strong>{Math.round(gameLoadProgress * 100)}%</strong>
          </div>
          <div className={styles.gameLoaderTrack} aria-hidden="true">
            <i style={{ transform: `scaleX(${gameLoadProgress})` }} />
          </div>
        </div>
      ) : null}
      <div
        className={styles.playfield}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerUp}
        onPointerUp={handlePointerUp}
        role="application"
        aria-label="Start or control the Hit 10k game"
      >
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <div ref={threeLayerRef} className={styles.threeLayer} aria-hidden="true" />

      <nav className={styles.nav} aria-label="Primary navigation" onPointerDown={stopPointer}>
        <a className={styles.navBrand} href="/" aria-label="xtyopen home">
          <img src="/xtyopen-logo.svg" alt="xtyopen" />
        </a>
        <div className={styles.navLinks}>
          <a href="/work">Work</a>
          <a href="/game/1">Game</a>
          <a href="/#about">About</a>
          <a href="mailto:work@xiaotongyu.com">Contact</a>
        </div>
        <a className={styles.navCta} href="mailto:work@xiaotongyu.com">
          Get in touch
        </a>
      </nav>

      <button
        className={`${styles.themeToggle} ${theme === "night" ? styles.themeToggleNight : ""}`}
        type="button"
        aria-label={theme === "night" ? "Switch to day background" : "Switch to night background"}
        aria-pressed={theme === "night"}
        onClick={toggleTheme}
        onPointerDown={stopPointer}
      >
        <span />
      </button>
      <div className={`${styles.damageVignette} ${hud.hurtFlash ? styles.damageVignetteActive : ""}`} aria-hidden="true" />

      {hud.phase === "ready" && !launching ? (
        <section className={`${styles.characterIntro} ${launching ? styles.characterIntroLaunch : ""}`} aria-label="Intro">
          <div className={styles.speechBubble}>
            AI got me fired.
            <br />
            Help me find a job!
          </div>
        </section>
      ) : (
        <section className={styles.uiLayer} aria-labelledby="game-title">
          <div className={styles.hudTop} aria-live="polite">
            <span className={styles.hearts} aria-label={`${hud.lives} lives`}>
              {"♥".repeat(Math.max(0, hud.lives))}
            </span>
            <span className={styles.boostTrack} aria-label={`Rocket fuel ${Math.round(hud.rocketFuel * 100)}%`}>
              <i style={{ transform: `scaleX(${hud.rocketFuel})` }} />
            </span>
            <button
              ref={scorePillRef}
              className={`${styles.scorePill} ${hud.scorePulse ? styles.scorePillHot : ""}`}
              type="button"
              onClick={openLeaderboard}
              onPointerDown={stopPointer}
            >
              Score <strong>{hud.score.toLocaleString()}</strong>
            </button>
            <button
              className={styles.bestScore}
              type="button"
              onClick={openLeaderboard}
              onPointerDown={stopPointer}
            >
              Best {hud.bestScore.toLocaleString()}
            </button>
          </div>

          <div className={styles.copy}>
            <h1 id="game-title">
              Hit 10k <span ref={titleCoinSlotRef} className={styles.titleCoinSlot} aria-hidden="true" />
              <em>We&rsquo;re hiring.</em>
            </h1>
            <p>
              A chicken on a rocket, real physics, real magnet coins, very real obstacles. Cross <strong>10,000
              points</strong> and a hiring email pops up.
              <br />
              <em>(The company isn&rsquo;t real. The points are.)</em>
            </p>
            <div className={styles.controls} onPointerDown={stopPointer}>
              <button type="button" onClick={togglePause}>
                {hud.phase === "playing" ? "Pause" : "Resume"}
              </button>
              <button type="button" onClick={begin}>
                Start
              </button>
              <button type="button" onClick={openHowToPlay}>
                How to play
              </button>
              <button type="button" onClick={resetRun}>
                Reset
              </button>
            </div>
          </div>

          <div className={styles.progressNumber} aria-label={`Progress ${progressLabel}%`}>
            {progressLabel}%
          </div>
          {hud.phase === "paused" ? <div className={styles.pausedBadge}>Paused</div> : null}
          {launching ? <div className={styles.launchHint}>Space to begin</div> : null}
        </section>
      )}

      {hud.phase === "playing" && storeRef.current.runTime < 4.2 ? (
        <div className={styles.playHint} aria-hidden="true">
          Space to jump
        </div>
      ) : null}

      {showHowToPlay ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="how-to-play-title" onPointerDown={stopPointer}>
          <div className={styles.modalPanel}>
            <button className={styles.modalClose} type="button" aria-label="Close how to play" onClick={() => setShowHowToPlay(false)}>
              ×
            </button>
            <p className={styles.modalKicker}>How to play</p>
            <h2 id="how-to-play-title">Keep the chicken moving.</h2>
            <p>Press Space, W, or Arrow Up to jump. Hold while rocket fuel is active to thrust upward.</p>
            <p>Collect coins for score, pick up rockets for a short boost, and avoid crates, spikes, and gaps.</p>
          </div>
        </div>
      ) : null}

      {showLeaderboard ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="leaderboard-title" onPointerDown={stopPointer}>
          <div className={styles.modalPanel}>
            <button className={styles.modalClose} type="button" aria-label="Close leaderboard" onClick={() => setShowLeaderboard(false)}>
              ×
            </button>
            <p className={styles.modalKicker}>Local leaderboard</p>
            <h2 id="leaderboard-title">Best score</h2>
            <div className={styles.leaderboardRow}>
              <span>#1</span>
              <strong>{hud.bestScore.toLocaleString()}</strong>
            </div>
            <p>Stored locally in this browser.</p>
          </div>
        </div>
      ) : null}

    </main>
  );
}
