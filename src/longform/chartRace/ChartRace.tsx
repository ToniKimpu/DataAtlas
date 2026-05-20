import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { HookScene } from "./HookScene";
import { ContendersScene } from "./ContendersScene";
import { RaceScene } from "./RaceScene";
import { StoryCallout } from "./StoryCallout";
import { AnalysisScene } from "./AnalysisScene";
import { ClosingScene } from "./ClosingScene";
import { race, storyByYearIdx } from "./data";
import { palette } from "./palette";

/* ──────────────────────────────────────────────────────────────────────────
 * Timing constants — pacing rule: no static hold over ~3 s. Animations land
 * fast, brief hold for read, then move on.
 *
 *   HOOK           — opening title scene (7 s)
 *   CONTENDERS     — "meet the 10 contenders" + WATCH FOR (10 s)
 *   INITIAL_DWELL  — hold on year[0] before the race begins (2 s)
 *   TRANSITION     — animation between two consecutive snapshots (8 s)
 *   STORY_DWELL    — race pauses for a story callout (8 s, 4× in dataset)
 *   FINAL_DWELL    — hold on the last year before analysis (3 s)
 *   ANALYSIS       — climbers + fallers (14 s — 7 s per stage)
 *   CLOSING        — trophy + winner reveal (9 s)
 *
 * With 14 snapshots and 4 story moments @ 30 fps:
 *   210 + 300 + 60 + 13×240 + 4×240 + 90 + 420 + 270 = 5490 frames = 3:03
 *   Race body starts at HOOK + CONTENDERS = 510 frames = 0:17
 *
 * Total is intentionally tight. To extend back toward 5–8 min without
 * reintroducing dead air, add more story moments in data.ts (each = +8 s)
 * or densify the snapshot cadence (every 2 yrs instead of every 5).
 * ────────────────────────────────────────────────────────────────────────── */

export const HOOK_FRAMES = 210;
export const CONTENDERS_FRAMES = 300;
export const INITIAL_DWELL = 60;
export const TRANSITION_FRAMES = 240;
export const STORY_DWELL_FRAMES = 240;
export const FINAL_DWELL = 90;
export const ANALYSIS_FRAMES = 420;
export const CLOSING_FRAMES = 270;

/* ──────────────────────────────────────────────────────────────────────────
 * Race schedule
 *
 * A flat list of beats that the race body steps through. Both transitions and
 * dwells are first-class entries so the timing math stays one loop —
 * RaceScene resolves (yearIdx, t) by finding the active beat, and the story
 * callouts are positioned as <Sequence>s using the beats marked storyIdx.
 *
 * `from` / `to` are race-local frames (0 = race body starts).
 * ────────────────────────────────────────────────────────────────────────── */

export type RaceBeat =
  | { kind: "dwell"; from: number; to: number; yearIdx: number; storyIdx?: number }
  | { kind: "transition"; from: number; to: number; fromYearIdx: number };

const { schedule, totalBodyFrames } = buildSchedule();

export const TOTAL_FRAMES =
  HOOK_FRAMES + CONTENDERS_FRAMES + totalBodyFrames + ANALYSIS_FRAMES + CLOSING_FRAMES;

function buildSchedule(): { schedule: RaceBeat[]; totalBodyFrames: number } {
  const beats: RaceBeat[] = [];
  let cursor = 0;

  // Initial dwell on year[0]
  beats.push({ kind: "dwell", from: cursor, to: cursor + INITIAL_DWELL, yearIdx: 0 });
  cursor += INITIAL_DWELL;

  const N = race.years.length;
  for (let i = 0; i < N - 1; i++) {
    // Transition year[i] → year[i+1]
    beats.push({
      kind: "transition",
      from: cursor,
      to: cursor + TRANSITION_FRAMES,
      fromYearIdx: i,
    });
    cursor += TRANSITION_FRAMES;

    // Story dwell on landing year (skip if it's the final snapshot — that's
    // FINAL_DWELL's job and analysis carries the recap)
    const target = i + 1;
    if (storyByYearIdx.has(target) && target !== N - 1) {
      beats.push({
        kind: "dwell",
        from: cursor,
        to: cursor + STORY_DWELL_FRAMES,
        yearIdx: target,
        storyIdx: target,
      });
      cursor += STORY_DWELL_FRAMES;
    }
  }

  // Final dwell on year[last]
  beats.push({ kind: "dwell", from: cursor, to: cursor + FINAL_DWELL, yearIdx: N - 1 });
  cursor += FINAL_DWELL;

  return { schedule: beats, totalBodyFrames: cursor };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Composition root
 * ────────────────────────────────────────────────────────────────────────── */

export const ChartRace: React.FC = () => {
  const { width, height } = useVideoConfig();

  const contendersStart = HOOK_FRAMES;
  const raceStart = HOOK_FRAMES + CONTENDERS_FRAMES;
  const raceEnd = raceStart + totalBodyFrames;
  const analysisStart = raceEnd;
  const closingStart = analysisStart + ANALYSIS_FRAMES;

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(168deg, #EAF1FF 0%, #F0ECFF 34%, #FFF4E6 66%, #E9F7F6 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Aurora glows — large blurred gradient circles for atmospheric depth */}
      <Blob x={-280} y={-180} size={1020} color="rgba(37,99,235,0.17)" />
      <Blob x={width - 740} y={-230} size={1120} color="rgba(225,29,72,0.12)" />
      <Blob x={width * 0.5 - 560} y={height - 320} size={1160} color="rgba(20,184,166,0.14)" />
      <Blob x={width - 460} y={height * 0.42} size={760} color="rgba(245,158,11,0.12)" />

      {/* Growth-curve motif — a faint accelerating GDP curve, on-theme for the race */}
      <GrowthChart width={width} height={height} />

      {/* Dot grid texture */}
      <DotGrid width={width} height={height} />

      {/* Floor band + edge vignette for depth */}
      <FloorBand />
      <Vignette />

      <HookScene endFrame={HOOK_FRAMES} />

      <ContendersScene
        startFrame={contendersStart}
        durationFrames={CONTENDERS_FRAMES}
      />

      <RaceScene
        startFrame={raceStart}
        schedule={schedule}
        totalBodyFrames={totalBodyFrames}
      />

      {/* Story callout overlays — fire on each story-dwell beat. The race is
          still rendering beneath; the callout supplies its own dim scrim. */}
      {schedule
        .filter((b): b is Extract<RaceBeat, { kind: "dwell" }> & { storyIdx: number } =>
          b.kind === "dwell" && b.storyIdx !== undefined,
        )
        .map((b) => {
          const story = storyByYearIdx.get(b.yearIdx);
          if (!story) return null;
          return (
            <Sequence
              key={`story-${b.storyIdx}`}
              from={raceStart + b.from}
              durationInFrames={b.to - b.from}
            >
              <StoryCallout
                storyMoment={story}
                year={race.years[b.yearIdx].year}
                durationFrames={b.to - b.from}
              />
            </Sequence>
          );
        })}

      <AnalysisScene startFrame={analysisStart} durationFrames={ANALYSIS_FRAMES} />

      <ClosingScene startFrame={closingStart} />

      {/* Background music — quiet bed under everything */}
      <Audio src={staticFile("map-music.mp3")} loop volume={0.3} />

      {/* Whoosh on contenders arrival */}
      <Sequence from={contendersStart - 8} durationInFrames={45}>
        <Audio src={staticFile("map-whoosh.mp3")} volume={0.55} />
      </Sequence>

      {/* Whoosh on race start — punchier transition cue */}
      <Sequence from={raceStart - 8} durationInFrames={45}>
        <Audio src={staticFile("map-whoosh.mp3")} volume={0.6} />
      </Sequence>

      {/* Reveal sting at each story callout landing */}
      {schedule
        .filter((b) => b.kind === "dwell" && b.storyIdx !== undefined)
        .map((b, i) => (
          <Sequence
            key={`story-sfx-${i}`}
            from={raceStart + b.from}
            durationInFrames={90}
          >
            <Audio src={staticFile("map-reveal.mp3")} volume={0.6} />
          </Sequence>
        ))}

      {/* Whoosh on analysis arrival */}
      <Sequence from={analysisStart - 8} durationInFrames={45}>
        <Audio src={staticFile("map-whoosh.mp3")} volume={0.6} />
      </Sequence>

      {/* Climbers / fallers stage switch midway through analysis */}
      <Sequence
        from={analysisStart + Math.floor(ANALYSIS_FRAMES / 2) - 8}
        durationInFrames={45}
      >
        <Audio src={staticFile("map-whoosh.mp3")} volume={0.5} />
      </Sequence>

      {/* Trophy reveal sting */}
      <Sequence from={closingStart + 20} durationInFrames={120}>
        <Audio src={staticFile("map-reveal.mp3")} volume={0.9} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** Atmospheric depth — same pattern as passportRanking. */
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
 * Faint accelerating "GDP growth" curve sweeping up across the lower half of
 * the frame — an on-theme background motif for the race. Kept very light so it
 * never competes with the bars; reads mostly as texture, and shows fuller in
 * the hook / contenders / closing where there is open space.
 */
const GrowthChart: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const pts: [number, number][] = [
    [0, height * 0.93],
    [width * 0.16, height * 0.9],
    [width * 0.32, height * 0.85],
    [width * 0.47, height * 0.78],
    [width * 0.61, height * 0.7],
    [width * 0.73, height * 0.62],
    [width * 0.86, height * 0.52],
    [width, height * 0.42],
  ];
  // Smooth path: quadratic curves through each point → next-midpoint.
  let line = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    line += ` Q ${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
  }
  line += ` L ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="cr-growth-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(37,99,235,0.13)" />
          <stop offset="100%" stopColor="rgba(37,99,235,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#cr-growth-fill)" />
      <path
        d={line}
        fill="none"
        stroke="rgba(37,99,235,0.3)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={5}
          fill="#FFFFFF"
          stroke="rgba(37,99,235,0.45)"
          strokeWidth={2.5}
        />
      ))}
    </svg>
  );
};

/** Bottom band — a subtle floor shadow that grounds the bars. */
const FloorBand: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 240,
      background:
        "linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.05) 60%, rgba(15,23,42,0.11) 100%)",
      pointerEvents: "none",
    }}
  />
);

/** Soft elliptical edge vignette — keeps focus toward the center. */
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse 80% 74% at 50% 46%, transparent 56%, rgba(15,23,42,0.10) 100%)",
    }}
  />
);

const DotGrid: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const spacing = 32;
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, opacity: 0.22, pointerEvents: "none" }}
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
