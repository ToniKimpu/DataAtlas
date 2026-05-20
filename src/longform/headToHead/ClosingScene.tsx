import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FaTrophy } from "react-icons/fa";
import { CountryFlag } from "../../shared/CountryFlag";
import { Portrait } from "./Portrait";
import { palette } from "./palette";
import {
  matchup,
  scoreAfter,
  winnerOf,
  categoryColor,
  type Country,
  type Metric,
} from "./data";

type Props = {
  startFrame: number;
};

/**
 * Closing scene — two stages:
 *   0–150     ResultsGrid (all 16 metrics flashed in a 4×4 grid)
 *   150 →     Trophy + champion photo panel + final scoreboard + footer
 *
 * The grid is the "recap" beat that rewards the viewer for sticking through.
 * Trophy stage uses `t = within - GRID_DURATION` so all the existing spring
 * offsets stay the same relative to the trophy landing.
 */
const GRID_DURATION = 150;

export const ClosingScene: React.FC<Props> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < startFrame) return null;

  const within = frame - startFrame;
  const t = within - GRID_DURATION;

  const final = scoreAfter(matchup, matchup.metrics.length);
  const tied = final.left === final.right;
  const winner = tied ? null : final.left > final.right ? matchup.left : matchup.right;
  const accent = winner?.color ?? "#F59E0B";

  const trophyT = spring({ frame: t, fps, from: 0, to: 1, durationInFrames: 28, config: { damping: 11 } });
  const panelT = spring({ frame: t - 20, fps, from: 0, to: 1, durationInFrames: 28, config: { damping: 12 } });
  const nameT = spring({ frame: t - 44, fps, from: 0, to: 1, durationInFrames: 24, config: { damping: 14 } });
  const scoreT = spring({ frame: t - 64, fps, from: 0, to: 1, durationInFrames: 28, config: { damping: 13 } });
  const footerT = interpolate(t, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <ResultsGrid within={within} duration={GRID_DURATION} fps={fps} />

      {/* Trophy stage — only renders once the grid has begun fading */}
      {t > -10 && (
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
          {/* Champion glow */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 1500,
              height: 1100,
              marginLeft: -750,
              marginTop: -550,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${accent}2E 0%, transparent 62%)`,
              filter: "blur(30px)",
            }}
          />

          <FaTrophy
            size={104}
            color="#F59E0B"
            style={{
              opacity: trophyT,
              transform: `scale(${0.5 + trophyT * 0.5}) rotate(${(1 - trophyT) * -20}deg)`,
              filter: "drop-shadow(0 14px 28px rgba(245,158,11,0.6))",
            }}
          />

          {!tied && winner && (
            <>
              {/* Champion photo panel */}
              <div
                style={{
                  width: 340,
                  height: 412,
                  borderRadius: 26,
                  overflow: "hidden",
                  position: "relative",
                  border: `6px solid ${winner.color}`,
                  boxShadow: `0 28px 60px ${winner.color}73, 0 0 60px ${winner.color}4D`,
                  opacity: panelT,
                  transform: `translateY(${(1 - panelT) * 30}px) scale(${0.8 + panelT * 0.2})`,
                }}
              >
                <Portrait
                  country={winner}
                  width={328}
                  height={400}
                  radius={21}
                  scrim
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "0 16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      borderRadius: 7,
                      overflow: "hidden",
                      border: "3px solid rgba(255,255,255,0.95)",
                      boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
                      display: "flex",
                    }}
                  >
                    <CountryFlag iso2={winner.iso2} height={42} radius={0} shadow={false} />
                  </div>
                  <div
                    style={{
                      fontSize: winner.name.length > 9 ? 32 : 40,
                      fontWeight: 900,
                      color: "#FFFFFF",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      lineHeight: 1,
                      textShadow: "0 3px 12px rgba(0,0,0,0.65)",
                      textAlign: "center",
                    }}
                  >
                    {winner.name}
                  </div>
                </div>
              </div>

              {/* WINS THE BOUT pill */}
              <div
                style={{
                  padding: "12px 32px",
                  borderRadius: 999,
                  background: winner.color,
                  color: "#FFFFFF",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 6,
                  opacity: nameT,
                  transform: `translateY(${(1 - nameT) * 20}px)`,
                  boxShadow: `0 14px 32px ${winner.color}77`,
                }}
              >
                WINS THE BOUT
              </div>
            </>
          )}

          {tied && (
            <div
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: palette.text,
                letterSpacing: 4,
                opacity: nameT,
              }}
            >
              IT'S A TIE
            </div>
          )}

          {/* Final scoreboard */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              opacity: scoreT,
              transform: `translateY(${(1 - scoreT) * 18}px)`,
            }}
          >
            <ScoreCell
              country={matchup.left}
              score={final.left}
              highlight={!tied && winner === matchup.left}
            />
            <div style={{ fontSize: 46, fontWeight: 900, color: palette.textMuted }}>–</div>
            <ScoreCell
              country={matchup.right}
              score={final.right}
              highlight={!tied && winner === matchup.right}
            />
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: palette.textSoft,
              letterSpacing: 3,
              textAlign: "center",
              opacity: footerT,
            }}
          >
            {matchup.metrics.length} metrics compared · Data: World Bank, SIPRI, Forbes 2024
          </div>
        </div>
      )}
    </>
  );
};

const ScoreCell: React.FC<{
  country: Country;
  score: number;
  highlight: boolean;
}> = ({ country, score, highlight }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      padding: "14px 28px",
      borderRadius: 16,
      background: highlight ? `${country.color}14` : palette.card,
      border: `3px solid ${country.color}`,
      boxShadow: highlight
        ? `0 16px 34px ${country.color}5C`
        : `0 6px 14px ${palette.shadow}`,
      opacity: highlight ? 1 : 0.72,
    }}
  >
    <div
      style={{
        borderRadius: 5,
        overflow: "hidden",
        border: `2px solid ${country.color}`,
        display: "flex",
      }}
    >
      <CountryFlag iso2={country.iso2} height={30} radius={0} shadow={false} />
    </div>
    <div style={{ fontSize: 66, fontWeight: 900, color: country.color, lineHeight: 1 }}>
      {score}
    </div>
    <div style={{ fontSize: 14, fontWeight: 900, color: palette.text, letterSpacing: 2 }}>
      {country.name}
    </div>
  </div>
);

/**
 * 4×4 grid showing the result of every metric. Cells stagger-animate in over
 * ~64 frames, hold, then the whole grid fades over the last 25 frames.
 * Winner flag is full-color + scaled-up; loser flag is dimmed.
 */
const ResultsGrid: React.FC<{
  within: number;
  duration: number;
  fps: number;
}> = ({ within, duration, fps }) => {
  const exitT = interpolate(within, [duration - 25, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (exitT <= 0) return null;

  const titleT = spring({
    frame: within,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 18,
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
        opacity: exitT,
        gap: 26,
        padding: "0 80px",
        pointerEvents: "none",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 5,
          opacity: titleT,
          transform: `translateY(${(1 - titleT) * -16}px)`,
        }}
      >
        ALL {matchup.metrics.length} RESULTS
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          width: "100%",
          maxWidth: 1600,
        }}
      >
        {matchup.metrics.map((m, i) => (
          <ResultCell key={i} metric={m} index={i} within={within} fps={fps} />
        ))}
      </div>
    </div>
  );
};

const ResultCell: React.FC<{
  metric: Metric;
  index: number;
  within: number;
  fps: number;
}> = ({ metric, index, within, fps }) => {
  const cellT = spring({
    frame: within - 12 - index * 4,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 16,
    config: { damping: 13, stiffness: 220 },
  });
  const winner = winnerOf(metric);
  const accent =
    winner === "left" ? matchup.left.color
    : winner === "right" ? matchup.right.color
    : "#F59E0B";

  return (
    <div
      style={{
        opacity: cellT,
        transform: `scale(${0.6 + cellT * 0.4})`,
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.95)",
        border: `2.5px solid ${accent}`,
        boxShadow: `0 6px 16px ${accent}44`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        minHeight: 112,
      }}
    >
      {/* Category strip — tiny color tag at top */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          color: categoryColor[metric.category],
          letterSpacing: 2,
        }}
      >
        {metric.category}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 1,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {metric.label}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FlagCell country={matchup.left} highlight={winner === "left"} dim={winner === "right"} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: palette.textMuted,
            letterSpacing: 1,
          }}
        >
          {winner === "tie" ? "TIE" : "vs"}
        </span>
        <FlagCell country={matchup.right} highlight={winner === "right"} dim={winner === "left"} />
      </div>
    </div>
  );
};

const FlagCell: React.FC<{
  country: Country;
  highlight: boolean;
  dim: boolean;
}> = ({ country, highlight, dim }) => (
  <div
    style={{
      borderRadius: 4,
      overflow: "hidden",
      border: highlight ? `2.5px solid ${country.color}` : `1.5px solid ${palette.border}`,
      opacity: dim ? 0.4 : 1,
      boxShadow: highlight ? `0 4px 10px ${country.color}66` : "none",
      transform: highlight ? "scale(1.1)" : "scale(1)",
      transformOrigin: "center",
    }}
  >
    <CountryFlag iso2={country.iso2} height={36} radius={0} shadow={false} />
  </div>
);
