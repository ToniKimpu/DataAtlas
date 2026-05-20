import { interpolate, useCurrentFrame } from "remotion";
import { FaCrown } from "react-icons/fa";
import { CountryFlag } from "../../shared/CountryFlag";
import { Portrait } from "./Portrait";
import { palette } from "./palette";
import { matchup, scoreAfter, type Country } from "./data";

type Props = {
  startFrame: number;
  /** 0-based index of the metric currently on screen (drives the "X / N" counter). */
  currentMetricIndex: number;
  /** Number of metrics that have already had their WINNER badge revealed.
   *  Drives the live scoreboard so wins tick up at the moment of declaration,
   *  not at the start of the next segment. Range: 0..matchup.metrics.length. */
  winnersDeclared: number;
};

/**
 * Persistent top chrome. Each side shows a circular leader-photo avatar (flag
 * chip overlaid), the country name, and a solid team-color WINS badge. The
 * avatar keeps both faces on screen through every metric without crowding the
 * per-metric panels. Whichever side leads gets a gold crown.
 */
export const Arena: React.FC<Props> = ({
  startFrame,
  currentMetricIndex,
  winnersDeclared,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const enterT = interpolate(frame - startFrame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const score = scoreAfter(matchup, winnersDeclared);
  const leftLeads = score.left > score.right;
  const rightLeads = score.right > score.left;

  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        left: 56,
        right: 56,
        height: 178,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: enterT,
        transform: `translateY(${(1 - enterT) * -22}px)`,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        pointerEvents: "none",
      }}
    >
      <SideHeader country={matchup.left} score={score.left} align="left" isLeading={leftLeads} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "#0F172A",
            border: "4px solid #F59E0B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: 2,
            boxShadow:
              "0 12px 28px rgba(15,23,42,0.45), 0 0 0 6px rgba(245,158,11,0.22)",
          }}
        >
          VS
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: 3,
            padding: "5px 14px",
            borderRadius: 999,
            background: palette.text,
            boxShadow: "0 4px 12px rgba(15,23,42,0.3)",
          }}
        >
          {currentMetricIndex + 1} / {matchup.metrics.length}
        </div>
      </div>

      <SideHeader country={matchup.right} score={score.right} align="right" isLeading={rightLeads} />
    </div>
  );
};

const SideHeader: React.FC<{
  country: Country;
  score: number;
  align: "left" | "right";
  isLeading: boolean;
}> = ({ country, score, align, isLeading }) => {
  const isLeft = align === "left";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isLeft ? "row" : "row-reverse",
        alignItems: "center",
        gap: 22,
      }}
    >
      {/* Circular leader avatar with team ring + flag chip */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {isLeading && (
          <FaCrown
            size={34}
            color="#F59E0B"
            style={{
              position: "absolute",
              top: -26,
              left: "50%",
              transform: "translateX(-50%) rotate(-8deg)",
              filter: "drop-shadow(0 4px 10px rgba(245,158,11,0.6))",
            }}
          />
        )}
        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: "50%",
            padding: 5,
            background: `linear-gradient(160deg, ${country.color}, ${country.color}AA)`,
            boxShadow: `0 10px 26px ${country.color}66, 0 0 0 4px ${country.color}1F`,
          }}
        >
          <Portrait country={country} width={114} height={114} radius={57} />
        </div>
        {/* Flag chip overlapping the bottom-outer corner */}
        <div
          style={{
            position: "absolute",
            bottom: -4,
            [isLeft ? "right" : "left"]: -8,
            borderRadius: 6,
            overflow: "hidden",
            border: "3px solid #FFFFFF",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            display: "flex",
          }}
        >
          <CountryFlag iso2={country.iso2} height={34} radius={0} shadow={false} />
        </div>
      </div>

      {/* Name + WINS badge */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isLeft ? "flex-start" : "flex-end",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: palette.text,
            letterSpacing: 1,
            textTransform: "uppercase",
            lineHeight: 1,
            textShadow: "0 2px 6px rgba(255,255,255,0.9)",
          }}
        >
          {country.name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 10,
            background: country.color,
            boxShadow: `0 10px 22px ${country.color}66`,
          }}
        >
          <span style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1 }}>
            {score}
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: 3,
              opacity: 0.95,
            }}
          >
            WINS
          </span>
        </div>
      </div>
    </div>
  );
};
