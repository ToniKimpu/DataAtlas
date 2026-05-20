import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FaCrown } from "react-icons/fa";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import {
  matchup,
  winnerOf,
  formatValue,
  aftermathText,
  categoryColor,
  type Country,
  type Metric,
} from "./data";

type Props = {
  index: number;
  startFrame: number;
  metricFrames: number;
};

/**
 * Frame inside the metric segment at which the WINNER badge slams in. Exported
 * so HeadToHead.tsx can compute "winners declared so far" → live scoreboard.
 *
 * Tied to the 570-frame timing below — adjust together if pacing changes.
 */
export const WINNER_DECLARED_AT = 480;

/** Sub-timing within the 570-frame segment (frames):
 *    0–22    category badge + label slide down
 *    22–60   label holds (viewer reads)
 *    60–240  LEFT panel slides in, counter ticks 0 → final
 *    240–420 RIGHT panel slides in, counter ticks 0 → final
 *    420–480 compare hold (2s — winner is obvious by here)
 *    480–498 WINNER badge slams
 *    510–526 AFTERMATH callout slides up
 *    550–570 fade out
 */
const LEFT_RANGE: [number, number] = [60, 240];
const RIGHT_RANGE: [number, number] = [240, 420];
const AFTERMATH_AT = 510;

const PANEL_WIDTH = 840;
const PANEL_HEIGHT = 422;

export const MetricRow: React.FC<Props> = ({ index, startFrame, metricFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local = frame - startFrame;
  if (local < 0 || local >= metricFrames) return null;

  const metric = matchup.metrics[index];
  if (!metric) return null;
  const winner = winnerOf(metric);
  const cat = categoryColor[metric.category];

  const labelT = spring({ frame: local, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 13 } });

  // Counters tick up cubic-out — fast climb, gentle settle
  const leftCounter = interpolate(local, LEFT_RANGE, [0, metric.leftVal], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const rightCounter = interpolate(local, RIGHT_RANGE, [0, metric.rightVal], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const leftRevealT = spring({
    frame: local - LEFT_RANGE[0],
    fps,
    from: 0,
    to: 1,
    durationInFrames: 24,
    config: { damping: 13 },
  });
  const rightRevealT = spring({
    frame: local - RIGHT_RANGE[0],
    fps,
    from: 0,
    to: 1,
    durationInFrames: 24,
    config: { damping: 13 },
  });

  const winnerT = spring({
    frame: local - WINNER_DECLARED_AT,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 18,
    config: { damping: 10, stiffness: 240 },
  });

  // Subtle pulse on the WINNER badge (gentle scale wobble after it lands)
  const winnerPulse = winnerT > 0.95
    ? 1 + Math.sin((local - WINNER_DECLARED_AT - 18) * 0.18) * 0.02
    : 1;

  const aftermathT = spring({
    frame: local - AFTERMATH_AT,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 16,
    config: { damping: 13 },
  });

  const exitT = interpolate(metricFrames - local, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Magnitude bars — scaled relative to the larger value so the lead is felt
  const maxVal = Math.max(metric.leftVal, metric.rightVal) || 1;
  const leftBarPct = (leftCounter / maxVal) * 100;
  const rightBarPct = (rightCounter / maxVal) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 220,
        bottom: 150,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitT,
        pointerEvents: "none",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Category pill — context for the metric, color-coded across the bout */}
      <div
        style={{
          padding: "6px 18px",
          borderRadius: 999,
          background: `${cat}1F`,
          border: `2px solid ${cat}`,
          color: cat,
          fontSize: 17,
          fontWeight: 900,
          letterSpacing: 4,
          opacity: labelT,
          transform: `translateY(${(1 - labelT) * -16}px)`,
          marginBottom: 12,
          boxShadow: `0 4px 12px ${cat}33`,
        }}
      >
        {metric.category}
      </div>

      {/* Metric label — dark broadcast banner */}
      <div
        style={{
          padding: "14px 40px",
          borderRadius: 14,
          background: palette.text,
          color: "#FFFFFF",
          fontSize: 38,
          fontWeight: 900,
          letterSpacing: 4,
          opacity: labelT,
          transform: `translateY(${(1 - labelT) * -28}px)`,
          marginBottom: 26,
          boxShadow: `0 16px 34px rgba(15,23,42,0.34), 0 0 0 4px rgba(255,255,255,0.8), 0 0 0 6px ${cat}55`,
        }}
      >
        {metric.label}
      </div>

      {/* Two team panels straddling the seam */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 80 }}>
        <TeamPanel
          country={matchup.left}
          displayValue={leftCounter}
          finalValue={metric.leftVal}
          unit={metric.unit ?? ""}
          revealT={leftRevealT}
          barPct={leftBarPct}
          isWinner={winner === "left"}
          isTie={winner === "tie"}
          winnerT={winnerT}
          winnerPulse={winnerPulse}
          fromX={-140}
        />
        <TeamPanel
          country={matchup.right}
          displayValue={rightCounter}
          finalValue={metric.rightVal}
          unit={metric.unit ?? ""}
          revealT={rightRevealT}
          barPct={rightBarPct}
          isWinner={winner === "right"}
          isTie={winner === "tie"}
          winnerT={winnerT}
          winnerPulse={winnerPulse}
          fromX={140}
        />
      </div>

      {/* Optional note + aftermath callout */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {metric.note && (
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: palette.textSoft,
              letterSpacing: 2,
              opacity: rightRevealT,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {metric.note}
          </div>
        )}
        <Aftermath metric={metric} winner={winner} t={aftermathT} />
      </div>
    </div>
  );
};

const TeamPanel: React.FC<{
  country: Country;
  displayValue: number;
  finalValue: number;
  unit: string;
  revealT: number;
  barPct: number;
  isWinner: boolean;
  isTie: boolean;
  winnerT: number;
  winnerPulse: number;
  fromX: number;
}> = ({
  country,
  displayValue,
  finalValue,
  unit,
  revealT,
  barPct,
  isWinner,
  isTie,
  winnerT,
  winnerPulse,
  fromX,
}) => {
  const isInt = Number.isInteger(finalValue);
  const reached = displayValue >= finalValue - 0.005;
  const display = reached
    ? formatValue(finalValue)
    : isInt
      ? formatValue(Math.floor(displayValue))
      : displayValue.toFixed(1);

  // Winning panel lifts + brightens once the winner is declared.
  const lift = isWinner ? winnerT : 0;

  return (
    <div
      style={{
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
        background: "#FFFFFF",
        border: `3px solid ${country.color}`,
        boxShadow: isWinner
          ? `0 28px 60px ${country.color}80, 0 0 0 6px ${country.color}2E, 0 0 60px ${country.color}5C`
          : `0 18px 38px ${country.color}38, 0 6px 14px ${palette.shadow}`,
        opacity: revealT,
        transform: `translateX(${(1 - revealT) * fromX}px) translateY(${-lift * 14}px) scale(${(0.82 + revealT * 0.18) * (1 + lift * 0.03) * winnerPulse})`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Winner glow wash behind the body */}
      {isWinner && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 80% 70% at 50% 60%, ${country.color}33 0%, transparent 70%)`,
            opacity: winnerT,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Header strip — solid team color */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "0 26px",
          height: 86,
          background: `linear-gradient(180deg, ${country.color} 0%, ${country.color}DD 100%)`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            borderRadius: 8,
            overflow: "hidden",
            border: "3px solid rgba(255,255,255,0.95)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
          }}
        >
          <CountryFlag iso2={country.iso2} height={48} radius={0} shadow={false} />
        </div>
        <span
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: 2,
            textTransform: "uppercase",
            textShadow: "0 2px 6px rgba(0,0,0,0.28)",
          }}
        >
          {country.name}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "0 36px",
          background: isWinner
            ? `linear-gradient(180deg, ${country.color}12 0%, ${country.color}26 100%)`
            : `linear-gradient(180deg, #FFFFFF 0%, ${country.color}0D 100%)`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Big counter value */}
        <div
          style={{
            fontSize: 138,
            fontWeight: 900,
            color: country.color,
            letterSpacing: -4,
            lineHeight: 1,
            textShadow: `0 8px 26px ${country.color}55`,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {display}
          {unit && (
            <span style={{ fontSize: 66, marginLeft: 6, letterSpacing: 0, opacity: 0.85 }}>
              {unit}
            </span>
          )}
        </div>

        {/* Magnitude bar — fills proportionally to max(left, right) */}
        <div
          style={{
            width: "100%",
            height: 24,
            borderRadius: 999,
            background: `${country.color}1A`,
            border: `1.5px solid ${country.color}3D`,
            overflow: "hidden",
            boxShadow: `inset 0 2px 4px ${palette.shadow}`,
          }}
        >
          <div
            style={{
              width: `${barPct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${country.color}CC, ${country.color})`,
              borderRadius: 999,
              boxShadow: `0 0 16px ${country.color}99`,
            }}
          />
        </div>

        {/* Winner badge — space reserved so loser panel stays the same height */}
        <div style={{ height: 64, display: "flex", alignItems: "center" }}>
          {isWinner && !isTie && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 30px",
                borderRadius: 12,
                background: country.color,
                color: "#FFFFFF",
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: 4,
                boxShadow: `0 14px 32px ${country.color}99, 0 0 30px ${country.color}66`,
                opacity: winnerT,
                transform: `translateY(${(1 - winnerT) * -18}px) scale(${0.7 + winnerT * 0.3})`,
              }}
            >
              <FaCrown size={32} color="#FFFFFF" />
              <span>WINNER</span>
            </div>
          )}
          {isTie && (
            <div
              style={{
                padding: "10px 26px",
                borderRadius: 12,
                background: palette.text,
                color: "#FFFFFF",
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: 4,
                opacity: winnerT,
                transform: `scale(${0.8 + winnerT * 0.2})`,
              }}
            >
              TIE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Aftermath: React.FC<{
  metric: Metric;
  winner: "left" | "right" | "tie";
  t: number;
}> = ({ metric, winner, t }) => {
  if (t <= 0) return null;
  const text = aftermathText(metric);
  const color =
    winner === "left" ? matchup.left.color
    : winner === "right" ? matchup.right.color
    : "#0F172A";

  return (
    <div
      style={{
        padding: "16px 40px",
        borderRadius: 14,
        background: color,
        color: "#FFFFFF",
        fontSize: 42,
        fontWeight: 900,
        letterSpacing: 4,
        opacity: t,
        transform: `translateY(${(1 - t) * 26}px) scale(${0.86 + t * 0.14})`,
        boxShadow: `0 16px 42px ${color}77, 0 0 0 5px ${color}22`,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {winner === "left" && <span style={{ fontSize: 38, lineHeight: 1 }}>◀</span>}
      <span>{text}</span>
      {winner === "right" && <span style={{ fontSize: 38, lineHeight: 1 }}>▶</span>}
    </div>
  );
};
