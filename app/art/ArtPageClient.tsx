"use client";

import { useCallback, useRef, useState } from "react";

import mudantingMusic from "../../assets/music/music_mudanting.mp3";
import LoadingGate from "../components/LoadingGate";
import ArtStoryViewer from "./ArtStoryViewer";
import type { ArtStoryImage } from "./storyImages";

type ArtPageClientProps = {
  images: readonly ArtStoryImage[];
  preloadUrls: readonly string[];
};

export default function ArtPageClient({ images, preloadUrls }: ArtPageClientProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExhibitionReady, setIsExhibitionReady] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    void audio
      .play()
      .then(() => {
        setIsAudioPlaying(true);
      })
      .catch(() => {
        setIsAudioPlaying(false);
      });
  }, []);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      playAudio();
      return;
    }

    audio.pause();
    setIsAudioPlaying(false);
  }, [playAudio]);

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        src={mudantingMusic}
        onEnded={() => setIsAudioPlaying(false)}
        onPause={() => setIsAudioPlaying(false)}
        onPlay={() => setIsAudioPlaying(true)}
      />
      <LoadingGate
        buttonLabel="Enter"
        description="A short artwork series from @圆涟畸漪"
        loadingButtonLabel="Loading"
        onComplete={() => setIsExhibitionReady(true)}
        onEnter={playAudio}
        preloadUrls={preloadUrls}
        revealDelayMs={620}
        title="Please view in landscape for the best experience"
      />
      <ArtStoryViewer
        autoAdvanceActive={isExhibitionReady}
        images={images}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={toggleAudio}
      />
    </>
  );
}
