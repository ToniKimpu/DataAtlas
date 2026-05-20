import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Carousel } from "./Carousel";
import { TopBar } from "./TopBar";
import { ProgressBar } from "./ProgressBar";
import { HookScene } from "./HookScene";
import { ClosingScene } from "./ClosingScene";
import { PASSPORTS_REVEAL_ORDER, PASSPORTS_BY_RANK } from "./data";
import { palette } from "./palette";

export const HOOK_FRAMES = 150;
export const FRAMES_PER_CARD = 120;
export const CLOSING_FRAMES = 450;

export const TOTAL_FRAMES =
  HOOK_FRAMES +
  PASSPORTS_REVEAL_ORDER.length * FRAMES_PER_CARD +
  CLOSING_FRAMES;

export const PassportRanking: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const carouselStart = HOOK_FRAMES;
  const carouselEnd = HOOK_FRAMES + PASSPORTS_REVEAL_ORDER.length * FRAMES_PER_CARD;
  const closingStart = carouselEnd;

  const carouselElapsed = Math.max(0, frame - carouselStart);
  const currentIndex = Math.min(
    PASSPORTS_REVEAL_ORDER.length - 1,
    Math.floor(carouselElapsed / FRAMES_PER_CARD),
  );

  const topRank = PASSPORTS_BY_RANK[0]?.rank ?? 1;
  const topGroup = PASSPORTS_BY_RANK.filter((p) => p.rank === topRank);

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(165deg, #E9F1FF 0%, #F1ECFF 34%, #FFF4E6 64%, #E7FBF3 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Aurora glows — large blurred gradient circles for atmospheric depth */}
      <Blob x={-260} y={-160} size={1040} color="rgba(245,158,11,0.20)" />
      <Blob x={width - 760} y={-240} size={1140} color="rgba(37,99,235,0.16)" />
      <Blob x={width * 0.5 - 580} y={height - 280} size={1180} color="rgba(20,184,166,0.16)" />
      <Blob x={-360} y={height * 0.4} size={820} color="rgba(139,92,246,0.13)" />

      {/* Dashed flight-path arcs — airline route-map motif, on-theme for passports */}
      <FlightArcs width={width} height={height} />

      {/* Dot grid texture */}
      <DotGrid width={width} height={height} />

      {/* Soft horizon line behind cards */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * 0.62,
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(15,23,42,0.07) 30%, rgba(15,23,42,0.07) 70%, transparent 100%)",
        }}
      />

      {/* Edge vignette — gently focuses the eye on the center card */}
      <Vignette />

      {/* Carousel only mounts ~20 frames before its start so it can fade in
          cleanly under the exiting hook — never visible during the hook itself. */}
      {frame >= carouselStart - 20 && frame < closingStart + 30 && (
        <Carousel
          entries={PASSPORTS_REVEAL_ORDER}
          framesPerCard={FRAMES_PER_CARD}
          startFrame={carouselStart}
        />
      )}

      <HookScene endFrame={HOOK_FRAMES} />

      <TopBar
        title="WORLD'S STRONGEST PASSPORTS"
        subtitle="2026 EDITION · VISA-FREE DESTINATIONS"
        currentIndex={currentIndex}
        total={PASSPORTS_REVEAL_ORDER.length}
        startFrame={carouselStart}
      />

      <ProgressBar startFrame={carouselStart} endFrame={carouselEnd} />

      <ClosingScene
        startFrame={closingStart}
        topGroup={topGroup}
        totalCountries={PASSPORTS_REVEAL_ORDER.length}
      />

      <Audio src={staticFile("map-music.mp3")} loop volume={0.3} />
    </AbsoluteFill>
  );
};

/** Large soft blurred gradient circle — gives atmospheric depth without distracting. */
const Blob: React.FC<{ x: number; y: number; size: number; color: string }> = ({
  x,
  y,
  size,
  color,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
      pointerEvents: "none",
      filter: "blur(40px)",
    }}
  />
);

/**
 * Dashed flight-path arcs with node markers — an airline route-map motif that
 * ties the abstract background to the passport/travel theme. Static (the cards
 * provide the motion); coordinates assume the 1920×1080 longform frame.
 */
const FlightArcs: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const arcs = [
    { x1: -60, y1: 300, cx: 620, cy: -90, x2: 1320, y2: 220, color: "#2563EB", op: 0.26 },
    { x1: 360, y1: 1180, cx: 1060, cy: 560, x2: 1980, y2: 760, color: "#F59E0B", op: 0.22 },
    { x1: 1980, y1: 150, cx: 1180, cy: 70, x2: 540, y2: 470, color: "#14B8A6", op: 0.22 },
    { x1: -40, y1: 780, cx: 720, cy: 1020, x2: 1520, y2: 560, color: "#8B5CF6", op: 0.18 },
    { x1: 1000, y1: -70, cx: 1540, cy: 260, x2: 1860, y2: 1010, color: "#2563EB", op: 0.16 },
  ];
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {arcs.map((a, i) => (
        <g key={i}>
          <path
            d={`M ${a.x1} ${a.y1} Q ${a.cx} ${a.cy} ${a.x2} ${a.y2}`}
            fill="none"
            stroke={a.color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="2 14"
            opacity={a.op}
          />
          {[
            [a.x1, a.y1],
            [a.x2, a.y2],
          ].map(([cx, cy], j) => (
            <g key={j} opacity={Math.min(0.5, a.op * 1.7)}>
              <circle cx={cx} cy={cy} r={9} fill="none" stroke={a.color} strokeWidth={2.5} />
              <circle cx={cx} cy={cy} r={3.5} fill={a.color} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
};

/** Soft elliptical edge vignette — darkens the corners to focus the center. */
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse 78% 72% at 50% 47%, transparent 55%, rgba(15,23,42,0.11) 100%)",
    }}
  />
);

/** Fine dotted grid texture overlay. */
const DotGrid: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const spacing = 32;
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, opacity: 0.24, pointerEvents: "none" }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => (
          <circle
            key={`${r}-${c}`}
            cx={c * spacing + spacing / 2}
            cy={r * spacing + spacing / 2}
            r={1.2}
            fill={palette.borderDeep}
          />
        )),
      )}
    </svg>
  );
};
