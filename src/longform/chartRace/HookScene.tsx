import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import { race } from "./data";

type Props = {
  endFrame: number;
};

/**
 * Opening hook for the GDP race:
 *   1. Top pill drops in
 *   2. Title slides up
 *   3. Year range banner ("1960 → 2024") slams in
 *   4. A preview row of contender flags fans in left → right
 *
 * Fades out over the final 18 frames so the RaceScene can crossfade cleanly.
 *
 * The "contender" flags are the countries that finish in the final-year top 6 —
 * picked dynamically from `race.years` so swapping the dataset stays one-file.
 */
export const HookScene: React.FC<Props> = ({ endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= endFrame) return null;

  const pillT = spring({ frame, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 13 } });
  const titleT = spring({ frame: frame - 14, fps, from: 0, to: 1, durationInFrames: 26, config: { damping: 14 } });
  const rangeT = spring({ frame: frame - 38, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 11, stiffness: 200 } });
  const flagsBaseT = spring({ frame: frame - 70, fps, from: 0, to: 1, durationInFrames: 26, config: { damping: 14 } });
  const exitT = interpolate(endFrame - frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final-year top 6 → the headliners on the hook
  const finalYear = race.years[race.years.length - 1];
  const headliners = finalYear.entries.slice(0, 6);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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
          background: "#DBEAFE",
          border: "2px solid #2563EB",
          fontSize: 22,
          fontWeight: 900,
          color: "#1E3A8A",
          letterSpacing: 6,
          opacity: pillT,
          transform: `translateY(${(1 - pillT) * -20}px)`,
          boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
          marginBottom: 32,
        }}
      >
        BAR-CHART RACE
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 110,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 4,
          lineHeight: 1,
          textAlign: "center",
          opacity: titleT,
          transform: `translateY(${(1 - titleT) * 30}px)`,
        }}
      >
        {race.title}
      </div>

      {/* Year range banner */}
      <div
        style={{
          marginTop: 36,
          padding: "16px 36px",
          borderRadius: 14,
          background: palette.text,
          color: "#FFFFFF",
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: 6,
          opacity: rangeT,
          transform: `scale(${0.7 + rangeT * 0.3})`,
          boxShadow: "0 14px 32px rgba(15,23,42,0.25)",
        }}
      >
        {race.years[0].year} → {finalYear.year}
      </div>

      {/* Subtitle */}
      <div
        style={{
          marginTop: 24,
          fontSize: 26,
          fontWeight: 700,
          color: palette.textSoft,
          letterSpacing: 4,
          opacity: rangeT,
        }}
      >
        {race.subtitle}
      </div>

      {/* Headliner flag preview row */}
      <div style={{ display: "flex", gap: 24, marginTop: 56 }}>
        {headliners.map((entry, i) => {
          const t = spring({
            frame: frame - 70 - i * 6,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 22,
            config: { damping: 12, stiffness: 180 },
          });
          return (
            <div
              key={entry.iso2}
              style={{
                opacity: t * flagsBaseT,
                transform: `translateY(${(1 - t) * 30}px) scale(${0.7 + t * 0.3})`,
                borderRadius: 10,
                overflow: "hidden",
                border: "3px solid #FFFFFF",
                boxShadow: "0 10px 22px rgba(15,23,42,0.25)",
              }}
            >
              <CountryFlag iso2={entry.iso2} height={110} radius={0} shadow={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
