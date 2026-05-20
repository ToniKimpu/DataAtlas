import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette } from "./palette";
import type { StoryMoment } from "./data";

type Props = {
  storyMoment: StoryMoment;
  /** Year being dwelled on — usually `storyMoment.year` but stays explicit so
   *  the callout matches the on-screen year ticker exactly. */
  year: number;
  /** Total frames this callout has on screen — used to schedule the fade out. */
  durationFrames: number;
};

/**
 * Full-screen overlay that interrupts the race for ~8 s with a year + headline
 * + body. Wrap in a Sequence at the moment the race lands on `year`. The
 * RaceScene continues to render beneath (this component supplies its own dim
 * scrim) so the bars stay visible as context.
 *
 * Tight pacing — text elements appear in sequence so something is always
 * animating until ~2.5 s in. Year gets a subtle pulse during the hold so the
 * "static" feel never sets in.
 *
 *   0 →  15  : scrim fades in
 *   8 →  30  : card slides in
 *  14 →  36  : year springs in
 *  28 →  50  : title springs in
 *  48 →  72  : body fades in
 *  72 → 210  : hold (year pulses subtly)
 * 210 → 240  : fade out
 */
export const StoryCallout: React.FC<Props> = ({ storyMoment, year, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scrimT = spring({ frame, fps, from: 0, to: 1, durationInFrames: 15, config: { damping: 18 } });
  const cardT = spring({ frame: frame - 8, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 12, stiffness: 200 } });
  const yearT = spring({ frame: frame - 14, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 11 } });
  const titleT = spring({ frame: frame - 28, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 13 } });
  const bodyT = spring({ frame: frame - 48, fps, from: 0, to: 1, durationInFrames: 24, config: { damping: 14 } });
  const exitT = interpolate(frame, [durationFrames - 30, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle 1.4 Hz pulse on the year during the hold phase. Keeps the callout
  // from feeling static even though no new content is arriving.
  const pulse = 1 + 0.025 * Math.sin((frame - 76) * 0.3);
  const pulseActive = frame > 76 && frame < durationFrames - 30 ? pulse : 1;

  const accent = storyMoment.accent ?? "#0F172A";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        opacity: exitT,
      }}
    >
      {/* Dim scrim — bars stay visible behind */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,23,42,0.55)",
          opacity: scrimT,
        }}
      />

      {/* Story card */}
      <div
        style={{
          position: "relative",
          background: "#FFFFFF",
          borderRadius: 24,
          padding: "44px 64px 52px",
          maxWidth: 1240,
          opacity: cardT,
          transform: `scale(${0.86 + cardT * 0.14})`,
          boxShadow: "0 40px 80px rgba(15,23,42,0.45)",
          borderTop: `10px solid ${accent}`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: palette.textMuted,
            letterSpacing: 6,
            marginBottom: 6,
          }}
        >
          STORY MOMENT
        </div>

        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            color: accent,
            letterSpacing: 4,
            lineHeight: 1,
            marginBottom: 18,
            opacity: yearT,
            transform: `translateY(${(1 - yearT) * 18}px) scale(${pulseActive})`,
            transformOrigin: "left center",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {year}
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: palette.text,
            letterSpacing: 2,
            lineHeight: 1.05,
            marginBottom: 22,
            opacity: titleT,
            transform: `translateY(${(1 - titleT) * 20}px)`,
          }}
        >
          {storyMoment.title}
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: palette.textSoft,
            lineHeight: 1.4,
            maxWidth: 1080,
            opacity: bodyT,
            transform: `translateY(${(1 - bodyT) * 14}px)`,
          }}
        >
          {storyMoment.body}
        </div>
      </div>
    </div>
  );
};
