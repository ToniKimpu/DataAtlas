import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../shared/theme";
import type { Scene, WordCue } from "./types";
import { getSceneAt } from "./sceneHelpers";
import { SAFE_BOTTOM_OFFSET } from "./safeZones";

type Props = {
  scenes: Scene[];
  /** Cue-level timings from narration-timings.json (one cue = one phrase). */
  words: WordCue[];
  /** Scene IDs that handle their own text (default: hook + closing). */
  skipScenes?: string[];
  /**
   * Words that get the gold "key word" treatment when active. Match is
   * case-insensitive after stripping basic punctuation. Optional — leave empty
   * to fall back to the scene's accent color for the current word.
   */
  keyWords?: string[];
};

/**
 * Bottom caption matched to the HookOverlay style:
 *   - One cue (phrase) at a time, synced to narration-timings.json
 *   - Each word springs in individually as its proportional time arrives
 *   - Past words stay visible at 0.85 opacity (so the viewer can re-read)
 *   - Current word jumps in size + scene accent color
 *   - "Key words" jump bigger and pulse gold
 *
 * Position: bottom: SAFE_BOTTOM_OFFSET so captions sit above the YouTube
 * Shorts / Reels chrome (description + action button stack).
 */
export const ScriptLine: React.FC<Props> = ({
  scenes,
  words,
  skipScenes = ["hook", "closing"],
  keyWords = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getSceneAt(scenes, frame);

  if (skipScenes.includes(scene.id)) return null;

  // Find the cue currently being spoken: frame ∈ [cue.frame, cue.frame + duration).
  const currentCue = words.find((w) => {
    const start = w.frame;
    const end = w.frame + Math.round(w.durationSec * fps);
    return frame >= start && frame < end;
  });

  if (!currentCue) return null;

  const cueWords = currentCue.word.split(" ").filter(Boolean);
  const cueDurFrames = Math.max(1, Math.round(currentCue.durationSec * fps));
  const within = frame - currentCue.frame;
  const keySet = new Set(keyWords.map((w) => w.toLowerCase()));

  // Each word's pop-in starts at its proportional point inside the cue.
  // edge-tts paces words roughly evenly so this lines up with what's spoken.
  const schedule = cueWords.map((raw, i) => {
    const cleaned = raw.replace(/[.,!?]/g, "").toLowerCase();
    return {
      raw,
      frame: currentCue.frame + Math.round((i / cueWords.length) * cueDurFrames),
      isKey: keySet.has(cleaned),
    };
  });

  const currentWordIdx = Math.min(
    cueWords.length - 1,
    Math.max(0, Math.floor((within / cueDurFrames) * cueWords.length)),
  );

  // Cue exit fade — last 8 frames of the cue smooth out so the next cue can
  // pop in without the previous one snapping away.
  const exitT = interpolate(cueDurFrames - within, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        bottom: SAFE_BOTTOM_OFFSET,
        opacity: exitT,
        fontFamily: "'Arial Black', Impact, 'Helvetica Neue', sans-serif",
        textAlign: "center",
        pointerEvents: "none",
        lineHeight: 1.18,
      }}
    >
      {schedule.map((item, i) => {
        const appeared  = frame >= item.frame;
        const isCurrent = i === currentWordIdx;
        const isPast    = i < currentWordIdx;

        const wordT = spring({
          frame: frame - item.frame,
          fps,
          from: 0,
          to: 1,
          durationInFrames: 10,
          config: { damping: 11, stiffness: 200 },
        });

        // Slightly smaller than HookOverlay (which dominates the screen) since
        // bottom captions are supplementary, not the focal element.
        const fontSize = item.isKey
          ? (isCurrent ? 92 : 80)
          : (isCurrent ? 76 : 64);

        // Color logic mirrors HookOverlay:
        //   key + current → gold pulse
        //   key + past    → warm gold
        //   current       → scene accent color
        //   past / unspoken → white
        const color = item.isKey
          ? isCurrent ? "#FFD700" : "#FCD34D"
          : isCurrent ? scene.color : theme.white;

        const outline = "0 0 6px #000, 0 0 6px #000, 0 0 6px #000";
        const drop    = "0 6px 14px rgba(0,0,0,0.9)";
        const textShadow = isCurrent
          ? `${outline}, ${drop}, 0 0 28px ${color}cc, 0 0 10px ${color}88`
          : `${outline}, ${drop}`;

        const scale      = appeared ? 0.72 + 0.28 * wordT : 0.72;
        const translateY = appeared ? (1 - wordT) * 18 : 18;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: appeared ? wordT * (isPast ? 0.88 : 1) : 0,
              transform: `scale(${scale}) translateY(${translateY}px)`,
              fontSize,
              fontWeight: 900,
              color,
              marginRight: i < cueWords.length - 1 ? (item.isKey ? 14 : 10) : 0,
              textShadow,
              letterSpacing: item.isKey ? 1 : 0.5,
              WebkitTextStroke: "1.5px rgba(0,0,0,0.55)",
            }}
          >
            {item.raw}
          </span>
        );
      })}
    </div>
  );
};
