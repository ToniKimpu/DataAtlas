import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountryFlag } from "../../shared/CountryFlag";
import { Portrait } from "./Portrait";
import { palette } from "./palette";
import { matchup, type Country } from "./data";

type Props = {
  endFrame: number;
};

/** Split the matchup title ("USA vs CHINA") into its two sides. */
const titleParts = matchup.title.split(/\s+vs\.?\s+/i);

/**
 * Opening hook — gold pill, a team-colored "USA VS CHINA" headline, then the
 * two competitors as large leader-photo panels with a VS coin between them,
 * subtitle and metric-count caption last. Fades out over the final 18 frames.
 */
export const HookScene: React.FC<Props> = ({ endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame >= endFrame) return null;

  const pillT = spring({ frame, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 13 } });
  const headlineT = spring({ frame: frame - 12, fps, from: 0, to: 1, durationInFrames: 24, config: { damping: 13 } });
  const leftT = spring({ frame: frame - 24, fps, from: 0, to: 1, durationInFrames: 26, config: { damping: 12, stiffness: 150 } });
  const rightT = spring({ frame: frame - 32, fps, from: 0, to: 1, durationInFrames: 26, config: { damping: 12, stiffness: 150 } });
  const vsT = spring({ frame: frame - 48, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 10, stiffness: 220 } });
  const subtitleT = spring({ frame: frame - 70, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 14 } });
  const countT = spring({ frame: frame - 86, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 13 } });
  const exitT = interpolate(endFrame - frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
        gap: 26,
        opacity: exitT,
        pointerEvents: "none",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Top pill */}
      <div
        style={{
          padding: "10px 24px",
          borderRadius: 999,
          background: "#FEF3C7",
          border: "2px solid #F59E0B",
          fontSize: 22,
          fontWeight: 900,
          color: "#92400E",
          letterSpacing: 6,
          opacity: pillT,
          transform: `translateY(${(1 - pillT) * -20}px)`,
          boxShadow: "0 6px 16px rgba(245,158,11,0.3)",
        }}
      >
        HEAD TO HEAD
      </div>

      {/* Team-colored headline */}
      <div
        style={{
          fontSize: 82,
          fontWeight: 900,
          letterSpacing: 1,
          lineHeight: 1,
          opacity: headlineT,
          transform: `translateY(${(1 - headlineT) * -22}px) scale(${0.86 + headlineT * 0.14})`,
          textShadow: "0 3px 10px rgba(255,255,255,0.85)",
        }}
      >
        {titleParts.length === 2 ? (
          <>
            <span style={{ color: matchup.left.color }}>{titleParts[0].toUpperCase()}</span>
            <span style={{ color: "#F59E0B", margin: "0 20px" }}>VS</span>
            <span style={{ color: matchup.right.color }}>{titleParts[1].toUpperCase()}</span>
          </>
        ) : (
          <span style={{ color: palette.text }}>{matchup.title.toUpperCase()}</span>
        )}
      </div>

      {/* Competitor photo panels + VS coin */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <HookPanel country={matchup.left} t={leftT} fromX={-180} />

        <div
          style={{
            zIndex: 2,
            margin: "0 -34px",
            opacity: vsT,
            transform: `scale(${0.4 + vsT * 0.6}) rotate(${(1 - vsT) * -25}deg)`,
          }}
        >
          <div
            style={{
              width: 134,
              height: 134,
              borderRadius: "50%",
              background: "#0F172A",
              border: "5px solid #F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 16px 36px rgba(15,23,42,0.5), 0 0 0 8px rgba(245,158,11,0.18)",
              color: "#FFFFFF",
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            VS
          </div>
        </div>

        <HookPanel country={matchup.right} t={rightT} fromX={180} />
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: palette.textSoft,
          letterSpacing: 4,
          opacity: subtitleT,
          transform: `translateY(${(1 - subtitleT) * 16}px)`,
          textAlign: "center",
        }}
      >
        {matchup.subtitle}
      </div>

      {/* Metrics count caption */}
      <div
        style={{
          padding: "9px 20px",
          borderRadius: 999,
          background: palette.text,
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: 900,
          letterSpacing: 4,
          opacity: countT,
          transform: `translateY(${(1 - countT) * 14}px)`,
        }}
      >
        {matchup.metrics.length} METRICS · ONE WINNER
      </div>
    </div>
  );
};

const PANEL_W = 372;
const PANEL_H = 472;

const HookPanel: React.FC<{ country: Country; t: number; fromX: number }> = ({
  country,
  t,
  fromX,
}) => (
  <div
    style={{
      width: PANEL_W,
      height: PANEL_H,
      borderRadius: 26,
      overflow: "hidden",
      position: "relative",
      border: `5px solid ${country.color}`,
      boxShadow: `0 26px 56px ${country.color}66, 0 6px 16px rgba(15,23,42,0.2)`,
      opacity: t,
      transform: `translateX(${(1 - t) * fromX}px) scale(${0.86 + t * 0.14})`,
    }}
  >
    <Portrait country={country} width={PANEL_W - 10} height={PANEL_H - 10} radius={21} scrim />

    {/* Name + flag overlay at the bottom */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "0 18px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          borderRadius: 8,
          overflow: "hidden",
          border: "3px solid rgba(255,255,255,0.95)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
          display: "flex",
        }}
      >
        <CountryFlag iso2={country.iso2} height={48} radius={0} shadow={false} />
      </div>
      <div
        style={{
          fontSize: country.name.length > 9 ? 32 : 38,
          fontWeight: 900,
          color: "#FFFFFF",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          lineHeight: 1,
          textShadow: "0 3px 12px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
      >
        {country.name}
      </div>
    </div>
  </div>
);
