import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { STORY_LINES } from "./content";
import { defaultScenes } from "./sceneConfig";
import { revealStyle } from "./storyReveal";
import { clamp } from "./timeline";
import type { Scene, SceneState } from "./types";

type StoryTextProps = {
  scenes: Scene[];
  stateHandlerRef: MutableRefObject<(state: SceneState) => void>;
};

export function StoryText({ scenes, stateHandlerRef }: StoryTextProps) {
  const storySceneIndexRef = useRef(0);
  const storyRevealRef = useRef(0);
  const [, forceRender] = useState(0);

  useEffect(() => {
    storySceneIndexRef.current = 0;
    storyRevealRef.current = 0;
    forceRender((value) => value + 1);

    stateHandlerRef.current = (sceneState) => {
      if (sceneState.phaseType === "play") {
        storySceneIndexRef.current = sceneState.index;
        const scene = scenes[storySceneIndexRef.current] || scenes[0] || defaultScenes[0];
        storyRevealRef.current = clamp(sceneState.local * (scene.textRevealSpeed ?? 1));
        forceRender((value) => value + 1);
      }
    };

    return () => {
      stateHandlerRef.current = () => undefined;
    };
  }, [scenes, stateHandlerRef]);

  const storyIndex = Math.min(storySceneIndexRef.current, Math.max(scenes.length, STORY_LINES.length) - 1);
  const currentLine = scenes[storyIndex]?.line || STORY_LINES[storyIndex] || STORY_LINES[0];
  const activeCharacters = useMemo(() => Array.from(currentLine), [currentLine]);

  return (
    <div className="dotmorph-story">
      <p aria-label={currentLine}>
        {activeCharacters.map((character, index) => (
          <span key={`${storyIndex}-${index}`} style={revealStyle(index, activeCharacters.length, storyRevealRef.current)}>
            {character}
          </span>
        ))}
      </p>
    </div>
  );
}
