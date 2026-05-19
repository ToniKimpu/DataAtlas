import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../../shared/theme";
import { CountryFlag } from "../../shared/CountryFlag";
import type { Scene } from "./types";
import { getSceneAt } from "./sceneHelpers";

type FlagRowItem = {
  iso2: string;
  label: string;
  color?: string;
};

type Props = {
  scenes: Scene[];
  /** Big focal element — e.g. "90%", "303B", "#1", "ZERO". */
  bigText: string;
  /** Caption directly under the big text — e.g. "OF YOUR TECH". */
  label: string;
  /** Sub-caption under the label — e.g. "STARTS ON ONE ISLAND". */
  subText?: string;
  /** Optional red urgent line above the flags row. */
  redAccent?: string;
  /** Country flags to show in a row at the bottom. 1 to ~8 fit comfortably. */
  flags: FlagRowItem[];
  /** Main accent color (matches the closing scene's accent). */
  color: string;
  /** Big-text font size. Default 240. Drop for longer strings. */
  bigSize?: number;
  /** Which scene id triggers this card. Default "closing". */
  sceneId?: string;
};

/**
 * Generic closing card. Replaces the per-short ClosingOverlay components —
 * each short now just configures this with its big stat / label / flags.
 *
 * Layout (top to bottom, centered):
 *   bigText (huge, scene color, glowing)
 *   label   (white, bold, letter-spaced)
 *   subText (muted, smaller)
 *   redAccent (red, smaller, optional)
 *   ───── divider line that grows from 0 to 600 ─────
 *   flag row (each flag a small bordered card with label below)
 */
export const ClosingCard: React.FC<Props> = ({
  scenes,
  bigText,
  label,
  subText,
  redAccent,
  flags,
  color,
  bigSize = 240,
  sceneId = "closing",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getSceneAt(scenes, frame);

  if (scene.id !== sceneId) return null;

  const withinScene = frame - scene.startFrame;
  const framesLeft  = scene.endFrame - frame;

  const titleT = spring({
    frame: withinScene - 5,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 28,
    config: { damping: 14 },
  });
  const exitT = interpolate(framesLeft, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const numberScale = 0.6 + 0.4 * titleT;

  const flagsT = spring({
    frame: withinScene - 25,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 22,
    config: { damping: 13 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        opacity: titleT * exitT,
        fontFamily: "'Arial Black', Impact, sans-serif",
        pointerEvents: "none",
        padding: "0 60px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            color,
            fontSize: bigSize,
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: bigText.length > 4 ? -6 : -2,
            textShadow: `0 0 80px ${color}99, 0 0 30px ${color}66`,
            transform: `scale(${numberScale})`,
            transformOrigin: "center bottom",
          }}
        >
          {bigText}
        </div>
        <div
          style={{
            color: theme.white,
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: 8,
            textShadow: "0 4px 20px rgba(0,0,0,0.9)",
            marginTop: 14,
          }}
        >
          {label}
        </div>
        {subText && (
          <div
            style={{
              color: theme.textMuted,
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 5,
              marginTop: 10,
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            {subText}
          </div>
        )}
        {redAccent && (
          <div
            style={{
              color: theme.danger,
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: 6,
              marginTop: 14,
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            {redAccent}
          </div>
        )}
      </div>

      <div
        style={{
          width: interpolate(withinScene, [20, 50], [0, 600], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 3,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          borderRadius: 2,
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 22,
          opacity: flagsT,
          maxWidth: 920,
        }}
      >
        {flags.map((f, i) => {
          const itemT = spring({
            frame: withinScene - 25 - i * 5,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 22,
            config: { damping: 13 },
          });
          const accent = f.color ?? color;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                opacity: itemT,
                transform: `translateY(${(1 - itemT) * 30}px)`,
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `3px solid ${accent}`,
                  boxShadow: `0 0 18px ${accent}66, 0 4px 16px rgba(0,0,0,0.6)`,
                }}
              >
                <CountryFlag iso2={f.iso2} height={flags.length > 5 ? 48 : 64} radius={0} />
              </div>
              <div
                style={{
                  color: accent,
                  fontSize: flags.length > 5 ? 18 : 22,
                  fontWeight: 800,
                  textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                  letterSpacing: 1,
                }}
              >
                {f.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
