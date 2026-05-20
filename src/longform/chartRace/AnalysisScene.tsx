import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import { topClimbers, topFallers, OFF_RANK, type Movement } from "./data";

type Props = {
  startFrame: number;
  durationFrames: number;
};

/**
 * Post-race analysis. Two-stage reveal, very fast pacing:
 *
 *   Stage 1 (0 → 210)    : "BIGGEST CLIMBERS" — top 3 risers
 *   Stage 2 (210 → 420)  : "BIGGEST FALLERS" — top 3 droppers
 *
 * Per stage (210 f / 7 s):
 *    0 →  18   : pill slams in (0.6 s)
 *   24 →  72   : 3 podium cards land in succession (last ≈ 2.4 s)
 *   72 → 180   : hold ≈ 3.6 s to read three flags + deltas
 *  180 → 210   : crossfade
 *
 * The "WHO ROSE?" / "WHO LOST?" title text is intentionally absent — the pill
 * already says BIGGEST CLIMBERS / FALLERS, a sentence-form title on top is
 * redundant and slows everything down.
 */
export const AnalysisScene: React.FC<Props> = ({ startFrame, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < startFrame || frame >= startFrame + durationFrames) return null;

  const within = frame - startFrame;
  const half = Math.floor(durationFrames / 2);

  const stage1Out = interpolate(within, [half - 30, half], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stage2In = interpolate(within, [half, half + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stage2Out = interpolate(within, [durationFrames - 30, durationFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const climbers = topClimbers(3);
  const fallers = topFallers(3);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        pointerEvents: "none",
      }}
    >
      {/* Stage 1 — Climbers */}
      {within < half + 5 && (
        <div style={{ opacity: stage1Out }}>
          <Stage
            kind="climber"
            withinStage={within}
            movements={climbers}
            fps={fps}
          />
        </div>
      )}

      {/* Stage 2 — Fallers */}
      {within >= half - 5 && (
        <div style={{ opacity: stage2In * stage2Out }}>
          <Stage
            kind="faller"
            withinStage={within - half}
            movements={fallers}
            fps={fps}
          />
        </div>
      )}
    </div>
  );
};

const Stage: React.FC<{
  kind: "climber" | "faller";
  withinStage: number;
  movements: Movement[];
  fps: number;
}> = ({ kind, withinStage, movements, fps }) => {
  const isClimber = kind === "climber";
  const accent = isClimber ? "#16A34A" : "#DC2626";
  const Icon = isClimber ? FaArrowUp : FaArrowDown;

  const pillT = spring({ frame: withinStage, fps, from: 0, to: 1, durationInFrames: 18, config: { damping: 13 } });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 42,
        padding: "0 80px",
      }}
    >
      {/* Pill — the whole header. No redundant "WHO ROSE?" title. */}
      <div
        style={{
          padding: "14px 32px",
          borderRadius: 999,
          background: `${accent}1A`,
          border: `2.5px solid ${accent}`,
          fontSize: 32,
          fontWeight: 900,
          color: accent,
          letterSpacing: 6,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: pillT,
          transform: `translateY(${(1 - pillT) * -16}px) scale(${0.92 + pillT * 0.08})`,
          boxShadow: `0 10px 24px ${accent}44`,
        }}
      >
        <Icon size={28} />
        {isClimber ? "BIGGEST CLIMBERS" : "BIGGEST FALLERS"}
      </div>

      {/* Cards row — tight stagger so all 3 land within ~2 s */}
      <div style={{ display: "flex", gap: 24, marginTop: 6 }}>
        {movements.map((m, i) => (
          <MovementCard
            key={m.country.iso2}
            movement={m}
            podiumIdx={i}
            accent={accent}
            isClimber={isClimber}
            within={withinStage}
            fps={fps}
            delay={24 + i * 8}
          />
        ))}
      </div>
    </div>
  );
};

const MovementCard: React.FC<{
  movement: Movement;
  podiumIdx: number;
  accent: string;
  isClimber: boolean;
  within: number;
  fps: number;
  delay: number;
}> = ({ movement, podiumIdx, accent, isClimber, within, fps, delay }) => {
  const t = spring({
    frame: within - delay,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 22,
    config: { damping: 12, stiffness: 200 },
  });

  const { country, fromRank, toRank, delta, firstYear } = movement;
  const fellOff = toRank >= OFF_RANK;
  const podiumLabels = ["1st", "2nd", "3rd"];

  return (
    <div
      style={{
        background: palette.card,
        borderRadius: 18,
        padding: "26px 28px 30px",
        border: `3px solid ${country.color}`,
        boxShadow: `0 18px 36px ${country.color}33`,
        opacity: t,
        transform: `translateY(${(1 - t) * 30}px) scale(${0.86 + t * 0.14})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        minWidth: 320,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: palette.textMuted,
          letterSpacing: 4,
        }}
      >
        {podiumLabels[podiumIdx] ?? `${podiumIdx + 1}TH`}
      </div>

      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: `4px solid ${country.color}`,
          boxShadow: `0 8px 18px ${country.color}55`,
        }}
      >
        <CountryFlag iso2={country.iso2} height={96} radius={0} shadow={false} />
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 1.5,
        }}
      >
        {country.name}
      </div>

      {/* Big delta */}
      <div
        style={{
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 56,
          fontWeight: 900,
          color: accent,
          letterSpacing: 1,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {isClimber ? "+" : ""}
        {delta}
      </div>

      {/* From/to */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 4,
          fontSize: 18,
          fontWeight: 900,
          color: palette.textSoft,
          letterSpacing: 2,
        }}
      >
        <span>FROM #{fromRank}</span>
        <span style={{ color: palette.textMuted }}>→</span>
        <span style={{ color: accent }}>
          {fellOff ? "OUT" : `#${toRank}`}
        </span>
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: palette.textMuted,
          letterSpacing: 2,
        }}
      >
        SINCE {firstYear}
      </div>
    </div>
  );
};
