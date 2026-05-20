import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FaTrophy, FaFlagCheckered } from "react-icons/fa";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import { race, getCountry, formatValue } from "./data";

type Props = {
  startFrame: number;
};

/**
 * Closing scene — the winner reveal. A trophy, the champion housed in a proper
 * card (flag + name + value) so it doesn't float in empty space, and — when the
 * winner led every single snapshot — a "wire-to-wire" payoff that pays back the
 * contenders-scene tease ("only one will hold #1 for all N years").
 *
 *   t   0 →  28   : trophy slams in
 *   t  20 →  50   : champion card scales up
 *   t  44 →  70   : winner name + label
 *   t  64 →  92   : value badge
 *   t  86 → 110   : wire-to-wire payoff pill
 *   t 108 → 140   : source footer
 *   t 140 → 270   : hold (composition ends at 270)
 */
export const ClosingScene: React.FC<Props> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < startFrame) return null;

  const t = frame - startFrame;

  const finalYear = race.years[race.years.length - 1];
  const startYear = race.years[0];
  const winnerEntry = finalYear.entries[0];
  const winner = getCountry(winnerEntry.iso2);
  const accent = winner?.color ?? "#F59E0B";

  // Did the winner hold #1 in every snapshot? → wire-to-wire payoff.
  const wireToWire = race.years.every((y) => y.entries[0]?.iso2 === winnerEntry.iso2);
  const yearSpan = finalYear.year - startYear.year;

  const trophyT = spring({ frame: t, fps, from: 0, to: 1, durationInFrames: 28, config: { damping: 11 } });
  const cardT = spring({ frame: t - 20, fps, from: 0, to: 1, durationInFrames: 30, config: { damping: 12 } });
  const nameT = spring({ frame: t - 44, fps, from: 0, to: 1, durationInFrames: 26, config: { damping: 13 } });
  const valueT = spring({ frame: t - 64, fps, from: 0, to: 1, durationInFrames: 28, config: { damping: 13 } });
  const payoffT = spring({ frame: t - 86, fps, from: 0, to: 1, durationInFrames: 24, config: { damping: 13 } });
  const footerT = interpolate(t, [108, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (!winner) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        pointerEvents: "none",
        padding: "0 80px",
      }}
    >
      {/* Accent halo behind everything */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 1500,
          height: 1080,
          marginLeft: -750,
          marginTop: -540,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accent}26 0%, transparent 62%)`,
          filter: "blur(30px)",
        }}
      />

      <FaTrophy
        size={108}
        color={accent}
        style={{
          opacity: trophyT,
          transform: `scale(${0.5 + trophyT * 0.5}) rotate(${(1 - trophyT) * -20}deg)`,
          filter: `drop-shadow(0 16px 32px ${accent}66)`,
        }}
      />

      {/* Champion card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          padding: "32px 64px 30px",
          borderRadius: 28,
          background: `linear-gradient(180deg, #FFFFFF 0%, ${winner.color}0F 100%)`,
          border: `5px solid ${winner.color}`,
          boxShadow: `0 32px 66px ${winner.color}59, 0 0 70px ${winner.color}40`,
          opacity: cardT,
          transform: `translateY(${(1 - cardT) * 30}px) scale(${0.82 + cardT * 0.18})`,
        }}
      >
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: `5px solid ${winner.color}`,
            boxShadow: `0 16px 34px ${winner.color}66`,
          }}
        >
          <CountryFlag iso2={winner.iso2} height={150} radius={0} shadow={false} />
        </div>

        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: palette.text,
            letterSpacing: 2,
            textTransform: "uppercase",
            lineHeight: 1,
            opacity: nameT,
            transform: `translateY(${(1 - nameT) * 20}px)`,
          }}
        >
          {winner.name}
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: winner.color,
            letterSpacing: 6,
            opacity: nameT,
          }}
        >
          GDP CHAMPION · {finalYear.year}
        </div>

        {/* Value badge */}
        <div
          style={{
            marginTop: 8,
            padding: "14px 30px",
            borderRadius: 14,
            background: palette.text,
            color: "#FFFFFF",
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: 3,
            opacity: valueT,
            transform: `scale(${0.7 + valueT * 0.3})`,
            boxShadow: "0 14px 32px rgba(15,23,42,0.28)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatValue(winnerEntry.value, race.unit)}
          {race.unit === "T" ? " TRILLION USD" : ` ${race.unit}`}
        </div>
      </div>

      {/* Wire-to-wire payoff — only when the winner led every snapshot */}
      {wireToWire && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 30px",
            borderRadius: 999,
            background: `${accent}1A`,
            border: `2.5px solid ${accent}`,
            color: accent,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 3,
            opacity: payoffT,
            transform: `translateY(${(1 - payoffT) * 16}px) scale(${0.9 + payoffT * 0.1})`,
            boxShadow: `0 10px 24px ${accent}3D`,
          }}
        >
          <FaFlagCheckered size={24} />
          #1 EVERY YEAR · {startYear.year}–{finalYear.year} ({yearSpan} YEARS)
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: 700,
          color: palette.textMuted,
          letterSpacing: 3,
          textAlign: "center",
          opacity: footerT,
        }}
      >
        {race.source}
      </div>
    </div>
  );
};
