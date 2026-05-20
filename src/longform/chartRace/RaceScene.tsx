import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import {
  race,
  getCountry,
  getCountryStateAt,
  getMaxValueAt,
  getLeaderAt,
  formatValue,
  yearAt,
  VISIBLE_BARS,
} from "./data";
import type { RaceBeat } from "./ChartRace";

type Props = {
  startFrame: number;
  schedule: RaceBeat[];
  totalBodyFrames: number;
};

const SLOT_HEIGHT = 78;
const BAR_HEIGHT = 60;
const BARS_LEFT_X = 380;
const BAR_AREA_WIDTH = 1240;
const BARS_TOP_Y = 240;

/**
 * The race itself. Reads the schedule (built once in ChartRace) and resolves
 * the active beat for the current frame. Three beat kinds:
 *
 *   dwell + storyIdx     → race holds on a year while a StoryCallout overlay
 *                          renders above this scene
 *   dwell  (no storyIdx) → initial or final dwell (no callout)
 *   transition           → animate year[fromYearIdx] → year[fromYearIdx+1]
 *
 * For transitions we ease the rank interpolation (ease-out cubic — bars
 * launch into the swap and settle) but keep the value interp linear, so the
 * on-screen number ticks at a steady, readable cadence.
 */
export const RaceScene: React.FC<Props> = ({ startFrame, schedule, totalBodyFrames }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const within = frame - startFrame;

  // Don't render outside the race window — saves work during the long
  // analysis + closing segments.
  if (within < -20 || within > totalBodyFrames + 20) return null;

  const beat = findBeat(schedule, within);

  let yearIdx: number;
  let t: number;
  let tLinear: number;
  if (beat.kind === "dwell") {
    yearIdx = beat.yearIdx;
    t = 0;
    tLinear = 0;
  } else {
    yearIdx = beat.fromYearIdx;
    tLinear = Math.max(0, Math.min(1, (within - beat.from) / (beat.to - beat.from)));
    t = Easing.out(Easing.cubic)(tLinear);
  }

  // Fade in under the contenders' fade-out, fade out before analysis arrives.
  const enterT = interpolate(within, [-10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitT = interpolate(
    within,
    [totalBodyFrames - 30, totalBodyFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const maxValue = getMaxValueAt(yearIdx, t, tLinear);
  const leader = getLeaderAt(yearIdx, t, tLinear);
  const currentYear = yearAt(yearIdx, t);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: enterT * exitT,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header — title left, year ticker right */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          right: 80,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: palette.textMuted,
              letterSpacing: 5,
            }}
          >
            {race.metricName}
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: palette.text,
              letterSpacing: 3,
              lineHeight: 1,
            }}
          >
            {race.title}
          </div>
        </div>

        <YearTicker year={currentYear} leader={leader} />
      </div>

      {/* Bar stack — every country in the pool gets rendered at its
          interpolated rank. Off-screen bars fade out via their opacity field;
          `overflow: hidden` clips any half-faded bar so it can never spill
          into the footer. */}
      <div
        style={{
          position: "absolute",
          top: BARS_TOP_Y,
          left: 0,
          right: 0,
          height: SLOT_HEIGHT * VISIBLE_BARS,
          overflow: "hidden",
        }}
      >
        {race.countries.map((c) => {
          const s = getCountryStateAt(c.iso2, yearIdx, t, tLinear);
          if (s.opacity <= 0.01) return null;
          const yPos = (s.rank - 1) * SLOT_HEIGHT;
          const barWidth = Math.max(8, (s.value / maxValue) * BAR_AREA_WIDTH);
          const rankNum = Math.round(s.rank);
          return (
            <BarRow
              key={c.iso2}
              iso2={c.iso2}
              name={c.name}
              color={c.color}
              value={s.value}
              barWidth={barWidth}
              yPos={yPos}
              opacity={s.opacity}
              rank={rankNum}
              isLeader={rankNum === 1}
            />
          );
        })}
      </div>

      {/* Footer — source + count */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: palette.textMuted,
            letterSpacing: 2,
          }}
        >
          {race.source}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: palette.textSoft,
            letterSpacing: 3,
          }}
        >
          TOP {VISIBLE_BARS} ECONOMIES
        </div>
      </div>

      {/* Gridlines behind bars — subtle scale reference */}
      <Gridlines width={width} />
    </div>
  );
};

function findBeat(schedule: RaceBeat[], within: number): RaceBeat {
  for (const b of schedule) {
    if (within >= b.from && within < b.to) return b;
  }
  // Clamp before / after the body range to the first / last beat.
  return within < 0 ? schedule[0] : schedule[schedule.length - 1];
}

const Gridlines: React.FC<{ width: number }> = ({ width }) => {
  const lines = [0.25, 0.5, 0.75, 1.0];
  return (
    <svg
      width={width}
      height={SLOT_HEIGHT * VISIBLE_BARS}
      style={{
        position: "absolute",
        top: BARS_TOP_Y,
        left: 0,
        pointerEvents: "none",
        opacity: 0.5,
      }}
    >
      {lines.map((f) => (
        <line
          key={f}
          x1={BARS_LEFT_X + f * BAR_AREA_WIDTH}
          y1={0}
          x2={BARS_LEFT_X + f * BAR_AREA_WIDTH}
          y2={SLOT_HEIGHT * VISIBLE_BARS}
          stroke={palette.borderDeep}
          strokeDasharray="3 7"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
};

const YearTicker: React.FC<{
  year: number;
  leader: ReturnType<typeof getCountry>;
}> = ({ year, leader }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
    {leader && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          borderRadius: 10,
          background: "#FFFFFF",
          border: `2px solid ${leader.color}`,
          boxShadow: `0 8px 18px ${leader.color}33`,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 900, color: palette.textMuted, letterSpacing: 2 }}>
          LEADER
        </div>
        <CountryFlag iso2={leader.iso2} height={28} radius={3} shadow={false} />
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: leader.color,
            letterSpacing: 1,
          }}
        >
          {leader.name}
        </div>
      </div>
    )}
    <div
      style={{
        fontSize: 140,
        fontWeight: 900,
        color: palette.text,
        letterSpacing: 4,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {year}
    </div>
  </div>
);

const BarRow: React.FC<{
  iso2: string;
  name: string;
  color: string;
  value: number;
  barWidth: number;
  yPos: number;
  opacity: number;
  rank: number;
  isLeader: boolean;
}> = ({ iso2, name, color, value, barWidth, yPos, opacity, rank, isLeader }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: yPos + (SLOT_HEIGHT - BAR_HEIGHT) / 2,
        left: 0,
        right: 0,
        height: BAR_HEIGHT,
        opacity,
        display: "flex",
        alignItems: "center",
        transition: "none",
      }}
    >
      {/* Left label area: rank + flag + name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingLeft: 80,
          width: BARS_LEFT_X,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 44,
            fontSize: 26,
            fontWeight: 900,
            color: isLeader ? color : palette.textMuted,
            letterSpacing: 1,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {rank}
        </div>
        <CountryFlag iso2={iso2} height={42} radius={4} shadow={false} />
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: palette.text,
            letterSpacing: 1,
          }}
        >
          {name}
        </div>
      </div>

      {/* The bar */}
      <div
        style={{
          position: "relative",
          width: barWidth,
          height: BAR_HEIGHT,
          background: `linear-gradient(90deg, ${color}EE 0%, ${color} 100%)`,
          borderRadius: 6,
          boxShadow: isLeader
            ? `0 8px 20px ${color}55, inset 0 -3px 0 rgba(0,0,0,0.15)`
            : `0 4px 10px ${color}33, inset 0 -3px 0 rgba(0,0,0,0.12)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 14,
        }}
      >
        {isLeader && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "rgba(255,255,255,0.6)",
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          />
        )}
      </div>

      {/* Value (right of the bar) */}
      <div
        style={{
          marginLeft: 14,
          fontSize: 28,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatValue(value, race.unit)}
      </div>
    </div>
  );
};
