# Chicken GLB Animation Notes

The active GLB animation clips have been renamed to simple names that match their visual meaning.
Use this table when wiring `/game/1` character states.

| GLB clip name | Actual visual meaning | Current game usage |
| --- | --- | --- |
| `Run` | Normal running animation | Regular movement and jump state, because jump should keep running animation |
| `Idle` | Idle / gesture pose for intro and special states | Intro ready state, start transition, and rocket boost state |
| `Jump` | Jump-over-obstacle animation | Not used currently |
| `JumpAlt` | Exported jump animation variant | Not used currently |
| `Walk` | Walking / fallback motion | Not used currently |

Current model entry point:

```json
{
  "url": "/game/1/Chicken/Meshy_AI_Flying_Chicken_biped_Meshy_AI_Meshy_Merged_Animations.glb"
}
```

Implementation mapping lives in `app/game/1/GameOneClient.tsx` inside `getChickenClipName()`.
