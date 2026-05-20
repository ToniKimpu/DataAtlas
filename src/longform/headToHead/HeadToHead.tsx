import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HookScene } from "./HookScene";
import { Arena } from "./Arena";
import { MetricRow, WINNER_DECLARED_AT } from "./MetricRow";
import { ClosingScene } from "./ClosingScene";
import { ProgressBar } from "../passportRanking/ProgressBar";
import { matchup, winnerOf } from "./data";
import { palette } from "./palette";

export const HOOK_FRAMES = 240;
export const METRIC_FRAMES = 570;
export const CLOSING_FRAMES = 870;

export const TOTAL_FRAMES =
  HOOK_FRAMES + matchup.metrics.length * METRIC_FRAMES + CLOSING_FRAMES;

/**
 * Diagonal seam geometry. The two team halves are clipped so the dividing edge
 * runs from x=54% at the top to x=46% at the bottom — a "/" lean. The Seam glow
 * is a vertical bar rotated to sit exactly on that edge:
 *   tan(angle) = (54%-46%)·width / height = 0.08·1920 / 1080  →  ~8.1°
 */
const SEAM_ANGLE = 8.1;
const LEFT_CLIP = "polygon(0% 0%, 54% 0%, 46% 100%, 0% 100%)";
const RIGHT_CLIP = "polygon(54% 0%, 100% 0%, 100% 100%, 46% 100%)";

export const HeadToHead: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const arenaStart = HOOK_FRAMES;
  const arenaEnd = HOOK_FRAMES + matchup.metrics.length * METRIC_FRAMES;
  const closingStart = arenaEnd;

  const elapsedInArena = Math.max(0, frame - arenaStart);
  const currentMetricIndex = Math.min(
    matchup.metrics.length - 1,
    Math.floor(elapsedInArena / METRIC_FRAMES),
  );
  const inMetric = elapsedInArena % METRIC_FRAMES;
  const winnersDeclared = Math.min(
    matchup.metrics.length,
    currentMetricIndex + (inMetric >= WINNER_DECLARED_AT ? 1 : 0),
  );

  return (
    <AbsoluteFill
      style={{
        // Neutral light base — the team halves overlay their color on top.
        background:
          "linear-gradient(180deg, #EEF2F7 0%, #DFE5EC 55%, #C9D2DD 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Split-arena background ───────────────────────────────────────── */}

      {/* Two team-colored halves, clipped to a diagonal wedge each */}
      <ArenaHalf color={matchup.left.color} side="left" />
      <ArenaHalf color={matchup.right.color} side="right" />

      {/* Radial speed lines — energy radiating from the clash point */}
      <SpeedLines width={width} height={height} />

      {/* Glowing diagonal seam where the two halves meet */}
      <Seam leftColor={matchup.left.color} rightColor={matchup.right.color} />

      {/* Top light pool — brightens the header band */}
      <Spotlight color="#FFFFFF" x={width * 0.5} y={120} size={1500} alpha={0.5} />

      {/* Soft texture grid — kept light so it doesn't compete */}
      <DotGrid width={width} height={height} />

      {/* Floor band + edge vignette for depth */}
      <FloorBand />
      <Vignette />

      {/* ── Foreground content ──────────────────────────────────────────── */}

      <HookScene endFrame={HOOK_FRAMES} />

      {frame >= arenaStart - 20 && frame < closingStart + 10 && (
        <>
          <Arena
            startFrame={arenaStart}
            currentMetricIndex={currentMetricIndex}
            winnersDeclared={winnersDeclared}
          />
          {matchup.metrics.map((_, i) => (
            <MetricRow
              key={i}
              index={i}
              startFrame={arenaStart + i * METRIC_FRAMES}
              metricFrames={METRIC_FRAMES}
            />
          ))}
        </>
      )}

      <ProgressBar startFrame={arenaStart} endFrame={arenaEnd} />

      <ClosingScene startFrame={closingStart} />

      {/* Background music loop — quiet bed under everything */}
      <Audio src={staticFile("map-music.mp3")} loop volume={0.3} />

      {/* Whoosh on each metric's label arrival — gives every metric a punchy
          "arrival" beat, same pattern as the WINNER ping. */}
      {matchup.metrics.map((_, i) => (
        <Sequence
          key={`whoosh-${i}`}
          from={arenaStart + i * METRIC_FRAMES}
          durationInFrames={45}
        >
          <Audio src={staticFile("map-whoosh.mp3")} volume={0.55} />
        </Sequence>
      ))}

      {/* WINNER reveal SFX — one ping per metric at WINNER_DECLARED_AT. Skipped
          for ties (Olympic Gold Medals at index 8) since there's no winner to
          announce. */}
      {matchup.metrics.map((m, i) => {
        if (winnerOf(m) === "tie") return null;
        return (
          <Sequence
            key={`winner-sfx-${i}`}
            from={arenaStart + i * METRIC_FRAMES + WINNER_DECLARED_AT}
            durationInFrames={75}
          >
            <Audio src={staticFile("map-reveal.mp3")} volume={0.7} />
          </Sequence>
        );
      })}

      {/* Closing trophy SFX — louder, plays as the trophy lands (after the
          150-frame results grid stage in ClosingScene). */}
      <Sequence from={closingStart + 150} durationInFrames={120}>
        <Audio src={staticFile("map-reveal.mp3")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ─── Background helpers ────────────────────────────────────────────────────

/**
 * One team-colored half of the arena, clipped to a diagonal wedge. The color is
 * layered as alpha overlays on the light base so the half stays bright enough
 * for the white metric panels to pop, while still reading unmistakably as
 * "blue territory" or "red territory".
 */
const ArenaHalf: React.FC<{ color: string; side: "left" | "right" }> = ({ color, side }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      clipPath: side === "left" ? LEFT_CLIP : RIGHT_CLIP,
      background: `
        radial-gradient(ellipse 66% 58% at ${side === "left" ? "28%" : "72%"} 20%, ${color}5E 0%, transparent 66%),
        linear-gradient(${side === "left" ? "150deg" : "210deg"}, ${color}24 0%, ${color}3D 55%, ${color}66 100%)
      `,
      pointerEvents: "none",
    }}
  />
);

/** Glowing diagonal seam where the two halves clash — soft glow + bright core. */
const Seam: React.FC<{ leftColor: string; rightColor: string }> = ({
  leftColor,
  rightColor,
}) => {
  const base: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transformOrigin: "center",
    pointerEvents: "none",
  };
  return (
    <>
      {/* Soft glow halo bleeding into both colors */}
      <div
        style={{
          ...base,
          width: 210,
          height: 1600,
          transform: `translate(-50%, -50%) rotate(${SEAM_ANGLE}deg)`,
          background: `linear-gradient(90deg, ${leftColor}00 0%, ${leftColor}4D 40%, rgba(255,255,255,0.9) 50%, ${rightColor}4D 60%, ${rightColor}00 100%)`,
          filter: "blur(36px)",
          opacity: 0.7,
        }}
      />
      {/* Bright thin core */}
      <div
        style={{
          ...base,
          width: 6,
          height: 1600,
          transform: `translate(-50%, -50%) rotate(${SEAM_ANGLE}deg)`,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 14%, rgba(255,255,255,0.95) 86%, transparent 100%)",
          boxShadow: "0 0 26px rgba(255,255,255,0.9)",
        }}
      />
    </>
  );
};

/** Big soft radial spotlight. */
const Spotlight: React.FC<{
  color: string;
  x: number;
  y: number;
  size: number;
  alpha: number;
}> = ({ color, x, y, size, alpha }) => {
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}${a} 0%, ${color}00 60%)`,
        filter: "blur(40px)",
        pointerEvents: "none",
      }}
    />
  );
};

/** Edge darkening — corners go slightly slate, center stays bright. */
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      boxShadow: "inset 0 0 320px 90px rgba(15,23,42,0.20)",
      pointerEvents: "none",
    }}
  />
);

/** Bottom band — implies a floor and grounds the composition. */
const FloorBand: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 300,
      background:
        "linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.05) 55%, rgba(15,23,42,0.16) 100%)",
      pointerEvents: "none",
    }}
  />
);

/**
 * Radial "speed lines" from the center of the frame, masked to a ring so they
 * fade out at both the very center and the edges — a halo of energy radiating
 * from the clash point. 36 lines = one every 10°.
 */
const SpeedLines: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(width, height);
  const numLines = 36;
  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.14,
        pointerEvents: "none",
        WebkitMask:
          "radial-gradient(circle at center, transparent 16%, black 32%, black 74%, transparent 100%)",
        mask:
          "radial-gradient(circle at center, transparent 16%, black 32%, black 74%, transparent 100%)",
      }}
    >
      {Array.from({ length: numLines }).map((_, i) => {
        const angle = (i / numLines) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(rad) * radius}
            y2={cy + Math.sin(rad) * radius}
            stroke="#0F172A"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
};

/** Subtle dot grid texture — kept very light so it doesn't compete with the lights. */
const DotGrid: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const spacing = 36;
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none" }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <circle
            key={`${r}-${c}`}
            cx={c * spacing + spacing / 2}
            cy={r * spacing + spacing / 2}
            r={1}
            fill={palette.borderDeep}
          />
        )),
      )}
    </svg>
  );
};
