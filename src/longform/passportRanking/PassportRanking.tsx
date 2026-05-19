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
        background: `linear-gradient(180deg, #EFF6FF 0%, #FFFBEB 50%, #ECFEFF 100%)`,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Atmospheric blobs — large blurred gradient circles for depth */}
      <Blob x={-200} y={-100} size={900} color="rgba(245,158,11,0.18)" />
      <Blob x={width - 700} y={-200} size={1000} color="rgba(37,99,235,0.12)" />
      <Blob x={width * 0.5 - 500} y={height - 200} size={1000} color="rgba(20,184,166,0.12)" />

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
            "linear-gradient(90deg, transparent 0%, rgba(15,23,42,0.06) 30%, rgba(15,23,42,0.06) 70%, transparent 100%)",
        }}
      />

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

/** Fine dotted grid texture overlay. */
const DotGrid: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const spacing = 32;
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }}
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
