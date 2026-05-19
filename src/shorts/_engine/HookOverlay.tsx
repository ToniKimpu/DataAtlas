import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../shared/theme";
import type { Scene, WordCue } from "./types";
import { getSceneAt } from "./sceneHelpers";

type Props = {
  scenes: Scene[];
  /** Word-level cues from narration-timings.json. */
  words: WordCue[];
  /**
   * Optional cap on how many cues to render in the hook. If omitted, every
   * cue whose frame falls inside the hook scene is shown — which is what you
   * usually want, because the cue list and scene boundaries already align.
   */
  hookCueCount?: number;
  /** Scene id treated as the hook (defaults to "hook"). */
  hookSceneId?: string;
  /** Words that get the gold highlight when current (lowercased, no punctuation). */
  keyWords?: string[];
};

type WordItem = {
  text: string;
  raw: string;
  frame: number;
  phraseIdx: number;
  isKey: boolean;
};

/**
 * Big-text karaoke for the opening hook of a short. Splits the first N
 * narration cues into per-word items, paces them across the cue window, and
 * pops them into the center of the frame one by one. Key words get a gold
 * pulse; the current word is sky-blue.
 *
 * Renders nothing once the scene is past the hook.
 */
export const HookOverlay: React.FC<Props> = ({
  scenes,
  words,
  hookCueCount,
  hookSceneId = "hook",
  keyWords = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getSceneAt(scenes, frame);

  if (scene.id !== hookSceneId) return null;
  if (words.length < 1) return null;

  const keySet = new Set(keyWords.map((w) => w.toLowerCase()));

  const cuesInScene = words.filter(
    (w) => w.frame >= scene.startFrame && w.frame < scene.endFrame,
  );
  const hookPhrases = hookCueCount !== undefined
    ? cuesInScene.slice(0, hookCueCount)
    : cuesInScene;

  const schedule: WordItem[] = hookPhrases.flatMap((phrase, phraseIdx) => {
    const rawWords = phrase.word.split(" ");
    const endFrame = phrase.frame + Math.round(phrase.durationSec * 30);
    const duration = Math.max(endFrame - phrase.frame, rawWords.length * 6);

    return rawWords.map((raw, i) => ({
      text: raw.replace(/[.,!?]/g, ""),
      raw,
      frame: phrase.frame + Math.round((i / rawWords.length) * duration),
      phraseIdx,
      isKey: keySet.has(raw.replace(/[.,!?]/g, "").toLowerCase()),
    }));
  });

  if (schedule.length === 0) return null;

  const sceneOpacity = interpolate(
    frame,
    [0, 8, scene.endFrame - 12, scene.endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const appearedWords = schedule.filter((w) => frame >= w.frame);
  const currentWord = appearedWords[appearedWords.length - 1] ?? null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 60px",
        opacity: sceneOpacity,
        fontFamily: "'Arial Black', Impact, sans-serif",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "90%",
          height: "45%",
          background: "radial-gradient(ellipse at center, rgba(10,18,40,0.75) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      <div style={{ position: "relative", textAlign: "center" }}>
        {hookPhrases.map((_, phraseIdx) => {
          const phraseWords = schedule.filter((w) => w.phraseIdx === phraseIdx);
          const phraseStart = phraseWords[0]?.frame ?? 0;
          if (frame < phraseStart) return null;

          const phraseEnterT = spring({
            frame: frame - phraseStart,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 15,
            config: { damping: 16 },
          });

          return (
            <div
              key={phraseIdx}
              style={{
                marginBottom: phraseIdx === hookPhrases.length - 1 ? 0 : 48,
                opacity: phraseEnterT,
              }}
            >
              {phraseWords.map((wordItem, wi) => {
                const appeared = frame >= wordItem.frame;
                const isCurrent =
                  currentWord?.phraseIdx === wordItem.phraseIdx &&
                  currentWord?.frame === wordItem.frame;

                const wordT = spring({
                  frame: frame - wordItem.frame,
                  fps,
                  from: 0,
                  to: 1,
                  durationInFrames: 10,
                  config: { damping: 11, stiffness: 200 },
                });

                const fontSize = wordItem.isKey ? 100 : 76;
                const color = wordItem.isKey
                  ? isCurrent ? "#FFD700" : "#FCD34D"
                  : isCurrent ? "#60A5FA" : theme.white;
                const glowShadow = isCurrent
                  ? `0 0 40px ${color}cc, 0 0 12px ${color}88, 0 3px 10px rgba(0,0,0,0.9)`
                  : "0 3px 10px rgba(0,0,0,0.9)";

                const scale = appeared ? 0.72 + 0.28 * wordT : 0.72;
                const translateY = appeared ? (1 - wordT) * 22 : 22;

                return (
                  <span
                    key={wi}
                    style={{
                      display: "inline-block",
                      opacity: appeared ? wordT : 0,
                      transform: `scale(${scale}) translateY(${translateY}px)`,
                      fontSize,
                      fontWeight: 900,
                      color,
                      marginRight: wordItem.isKey ? 18 : 14,
                      textShadow: glowShadow,
                      letterSpacing: wordItem.isKey ? 1 : 0.5,
                      lineHeight: 1.25,
                    }}
                  >
                    {wordItem.raw}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
