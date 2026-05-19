import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FaIndustry, FaOilCan, FaShip } from "react-icons/fa";
import type { IconType } from "react-icons";
import { CountryFlag } from "../../shared/CountryFlag";
import { theme } from "../../shared/theme";
import type { Scene, WordCue } from "./types";
import { getSceneAt } from "./sceneHelpers";
import { BRAND_MAP } from "./brandIcons";

/**
 * One visual element pinned to a specific narration cue. The cueIdx field
 * is the index into the WORD_TIMINGS array (i.e., the global cue order).
 *
 * Why cue-pinned: viral-pacing shorts swap visuals every 1.5–3s — once per
 * spoken phrase. Tying the visual to the cue index means the beats stay in
 * sync with the narration even if you regenerate the TTS and the frame
 * numbers shift.
 */
export type Beat =
  | StatBeat
  | PortraitBeat
  | ComparisonBeat
  | StampBeat
  | CounterBeat
  | LogoBeat;

export type StatBeat = {
  type: "stat";
  cueIdx: number;
  bigNumber: string;     // e.g. "303B"
  label: string;         // e.g. "BARRELS OF OIL"
  subText?: string;      // e.g. "VENEZUELA"
  /** Optional small portrait shown beside the stat. */
  insetImage?: string;   // staticFile path, e.g. "venezuela/maduro.jpg"
  insetFlag?: string;    // iso2, e.g. "VE"
  color?: string;        // override scene color
};

export type PortraitBeat = {
  type: "portrait";
  cueIdx: number;
  /** Path under public/. If missing on disk, falls back to initials. */
  image?: string;
  /** Initials shown when image is unavailable (e.g. "MBS"). */
  fallbackInitials: string;
  flagIso2: string;
  label: string;         // person or country name
  subStat?: string;      // e.g. "267B BARRELS"
  color?: string;
};

export type ComparisonBeat = {
  type: "comparison";
  cueIdx: number;
  rows: {
    flagIso2: string;
    label: string;
    value: number;       // numeric value, drives bar width relative to max
    suffix: string;      // unit shown after value (e.g. "B")
    highlight?: boolean; // taller, glowing row
  }[];
};

export type StampBeat = {
  type: "stamp";
  cueIdx: number;
  word: string;          // big stamped word
  icon?: "industry" | "oil" | "ship";
  color?: string;        // override scene color
  /** Optional photo behind the icon (rendered desaturated + dim). */
  bgImage?: string;
};

export type CounterBeat = {
  type: "counter";
  cueIdx: number;
  to: number;            // counts up from 0
  suffix: string;        // appended after the number, e.g. "%"
  label: string;         // line above the number, e.g. "INFLATION"
  color?: string;
  /** Optional photo behind the counting number (dimmed for legibility). */
  bgImage?: string;
};

export type LogoBeat = {
  type: "logo";
  cueIdx: number;
  /** Key into BRAND_MAP (e.g. "Apple", "Nvidia", "AI", "Gaming"). */
  company: string;
  /** Caption under the logo. Free-form (e.g. "iPhone, Mac" or "EVERY iPHONE"). */
  caption?: string;
  /** Override the brand color from BRAND_MAP. */
  color?: string;
};

const ICON_MAP: Record<NonNullable<StampBeat["icon"]>, IconType> = {
  industry: FaIndustry,
  oil: FaOilCan,
  ship: FaShip,
};

type Props = {
  beats: Beat[];
  words: WordCue[];
  scenes: Scene[];
  /** Scene IDs where beats should NOT render (default: hook + closing). */
  skipScenes?: string[];
};

/**
 * Top-level beat orchestrator. For each frame it picks the most-recently-
 * started cue, looks up the beat for that cue index, and renders it with
 * spring entry / exit. Beats persist across the gap between cues so the
 * screen never goes empty mid-scene.
 *
 * Position: occupies the lower-mid third of the frame (y≈900 to y≈1320),
 * leaving the country flag/name above and the ScriptLine caption below.
 */
export const BeatLayer: React.FC<Props> = ({
  beats,
  words,
  scenes,
  skipScenes = ["hook", "closing"],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getSceneAt(scenes, frame);
  if (skipScenes.includes(scene.id)) return null;

  // Find the index of the most-recently-started cue.
  let activeCueIdx = -1;
  for (let i = 0; i < words.length; i++) {
    if (words[i].frame <= frame) activeCueIdx = i;
    else break;
  }
  if (activeCueIdx < 0) return null;

  // Find the most recently-started beat — the latest beat whose cue has been
  // reached. Beats are assumed to be sorted by cueIdx ascending. This makes a
  // beat persist across "gap" cues that don't have their own beat.
  let beatIdx = -1;
  for (let i = 0; i < beats.length; i++) {
    if (beats[i].cueIdx <= activeCueIdx) beatIdx = i;
    else break;
  }
  if (beatIdx < 0) return null;
  const activeBeat = beats[beatIdx];

  // Beat lifetime: from this beat's cue start until the NEXT beat's cue start
  // (or scene end if this is the last beat).
  const startFrame = words[activeBeat.cueIdx].frame;
  const nextBeat = beats[beatIdx + 1];
  const endFrame = nextBeat
    ? words[nextBeat.cueIdx].frame
    : scene.endFrame;
  const within = frame - startFrame;
  const lifetime = Math.max(1, endFrame - startFrame);

  const enterT = spring({
    frame: within,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 16,
    config: { damping: 14 },
  });
  const exitT = interpolate(lifetime - within, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enterT * exitT;
  const lift = (1 - enterT) * 30;
  const sceneColor = scene.color;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        // Top of beat area sits below country name (y≈760+90); bottom stays
        // clear of ScriptLine (y≈1300).
        top: "47%",
        bottom: "32%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translateY(${lift}px)`,
        pointerEvents: "none",
        fontFamily: "'Arial Black', Impact, sans-serif",
      }}
    >
      {renderBeat(activeBeat, sceneColor, within, fps)}
    </div>
  );
};

/* ───── Per-type renderers ───── */

const renderBeat = (
  beat: Beat,
  sceneColor: string,
  within: number,
  fps: number,
): React.ReactNode => {
  switch (beat.type) {
    case "stat":       return <StatBeatView       beat={beat} sceneColor={sceneColor} />;
    case "portrait":   return <PortraitBeatView   beat={beat} sceneColor={sceneColor} />;
    case "comparison": return <ComparisonBeatView beat={beat} sceneColor={sceneColor} within={within} fps={fps} />;
    case "stamp":      return <StampBeatView      beat={beat} sceneColor={sceneColor} />;
    case "counter":    return <CounterBeatView    beat={beat} sceneColor={sceneColor} within={within} />;
    case "logo":       return <LogoBeatView       beat={beat} sceneColor={sceneColor} />;
  }
};

const LogoBeatView: React.FC<{ beat: LogoBeat; sceneColor: string }> = ({
  beat,
  sceneColor,
}) => {
  const entry = BRAND_MAP[beat.company];
  const color = beat.color ?? entry?.brand ?? sceneColor;
  const Icon = entry?.type === "icon" ? entry.Icon : null;
  const textLabel = entry?.type === "text" ? entry.label : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: 140,
          background: "rgba(8,14,32,0.92)",
          border: `6px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 48px ${color}aa, 0 12px 32px rgba(0,0,0,0.7)`,
        }}
      >
        {Icon && <Icon size={150} color={color} />}
        {textLabel && (
          <span
            style={{
              color,
              fontSize: textLabel.length > 5 ? 56 : 72,
              fontWeight: 900,
              letterSpacing: -1,
              textShadow: `0 0 18px ${color}, 0 4px 10px rgba(0,0,0,0.8)`,
            }}
          >
            {textLabel}
          </span>
        )}
      </div>
      {beat.caption && (
        <div
          style={{
            color: theme.white,
            fontSize: beat.caption.length > 14 ? 38 : 48,
            fontWeight: 900,
            letterSpacing: 2,
            textShadow: "0 0 10px #000, 0 4px 12px rgba(0,0,0,0.9)",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          {beat.caption}
        </div>
      )}
    </div>
  );
};

const StatBeatView: React.FC<{ beat: StatBeat; sceneColor: string }> = ({
  beat,
  sceneColor,
}) => {
  const color = beat.color ?? sceneColor;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {(beat.insetImage || beat.insetFlag) && (
        <PortraitChip
          image={beat.insetImage}
          fallbackInitials={beat.subText ?? ""}
          flagIso2={beat.insetFlag}
          color={color}
          size={140}
        />
      )}
      <div style={{ textAlign: beat.insetImage ? "left" : "center" }}>
        <div
          style={{
            color,
            fontSize: 180,
            lineHeight: 0.9,
            letterSpacing: -4,
            textShadow: `0 0 40px ${color}99, 0 0 12px #000, 0 6px 14px rgba(0,0,0,0.95)`,
            WebkitTextStroke: "2px rgba(0,0,0,0.4)",
          }}
        >
          {beat.bigNumber}
        </div>
        <div
          style={{
            color,
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: 4,
            marginTop: 8,
            textShadow: `0 0 12px ${color}88, 0 0 8px #000, 0 4px 10px rgba(0,0,0,0.95)`,
          }}
        >
          {beat.label}
        </div>
        {beat.subText && (
          <div
            style={{
              color: theme.white,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 5,
              marginTop: 6,
              opacity: 0.85,
              textShadow: "0 0 6px #000, 0 2px 6px rgba(0,0,0,0.8)",
            }}
          >
            {beat.subText}
          </div>
        )}
      </div>
    </div>
  );
};

const PortraitBeatView: React.FC<{ beat: PortraitBeat; sceneColor: string }> = ({
  beat,
  sceneColor,
}) => {
  const color = beat.color ?? sceneColor;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <PortraitChip
        image={beat.image}
        fallbackInitials={beat.fallbackInitials}
        flagIso2={beat.flagIso2}
        color={color}
        size={240}
      />
      <div>
        <div
          style={{
            color,
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: 1,
            textShadow: `0 0 14px ${color}99, 0 0 6px #000, 0 4px 14px rgba(0,0,0,0.95)`,
          }}
        >
          {beat.label}
        </div>
        {beat.subStat && (
          <div
            style={{
              color: theme.white,
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -2,
              marginTop: 4,
              textShadow: `0 0 24px ${color}cc, 0 0 10px #000, 0 6px 16px rgba(0,0,0,0.95)`,
              WebkitTextStroke: "1.5px rgba(0,0,0,0.5)",
            }}
          >
            {beat.subStat}
          </div>
        )}
      </div>
    </div>
  );
};

const ComparisonBeatView: React.FC<{
  beat: ComparisonBeat;
  sceneColor: string;
  within: number;
  fps: number;
}> = ({ beat, within, fps, sceneColor }) => {
  const max = Math.max(...beat.rows.map((r) => r.value));
  return (
    <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 14 }}>
      {beat.rows.map((row, i) => {
        const barT = spring({
          frame: within - i * 6,
          fps,
          from: 0,
          to: 1,
          durationInFrames: 22,
          config: { damping: 16 },
        });
        const widthPct = (row.value / max) * 100 * barT;
        const barColor = row.highlight ? sceneColor : "rgba(255,255,255,0.55)";
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: barT,
              transform: `translateX(${(1 - barT) * 30}px)`,
            }}
          >
            <div style={{ width: 60, flexShrink: 0 }}>
              <CountryFlag iso2={row.flagIso2} height={36} radius={4} />
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <div
                style={{
                  height: row.highlight ? 46 : 36,
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    background: row.highlight
                      ? `linear-gradient(90deg, ${barColor}, ${barColor}cc)`
                      : barColor,
                    boxShadow: row.highlight ? `0 0 18px ${barColor}` : "none",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  color: theme.white,
                  fontSize: row.highlight ? 26 : 22,
                  fontWeight: 900,
                  letterSpacing: 1,
                  textShadow: "0 0 6px #000, 0 2px 6px rgba(0,0,0,0.9)",
                }}
              >
                {row.label}
              </div>
            </div>
            <div
              style={{
                color: row.highlight ? sceneColor : theme.white,
                fontSize: row.highlight ? 38 : 28,
                fontWeight: 900,
                width: 100,
                textAlign: "right",
                textShadow: "0 0 6px #000, 0 2px 6px rgba(0,0,0,0.9)",
              }}
            >
              {row.value}
              {row.suffix}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StampBeatView: React.FC<{ beat: StampBeat; sceneColor: string }> = ({
  beat,
  sceneColor,
}) => {
  const color = beat.color ?? sceneColor;
  const Icon = beat.icon ? ICON_MAP[beat.icon] : null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
      }}
    >
      {beat.bgImage && (
        <div
          style={{
            width: 560,
            height: 220,
            borderRadius: 18,
            overflow: "hidden",
            border: `4px solid ${color}`,
            boxShadow: `0 0 28px ${color}55, 0 8px 22px rgba(0,0,0,0.65)`,
          }}
        >
          <Img
            src={staticFile(beat.bgImage)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "saturate(0.85) brightness(0.85)",
            }}
          />
        </div>
      )}
      {Icon && !beat.bgImage && (
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            background: "rgba(8,14,32,0.92)",
            border: `5px solid ${color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 36px ${color}88`,
          }}
        >
          <Icon size={108} color={color} />
        </div>
      )}
      <div
        style={{
          color,
          fontSize: beat.word.length > 10 ? 64 : 88,
          fontWeight: 900,
          letterSpacing: 4,
          textTransform: "uppercase",
          textShadow: `0 0 18px ${color}, 0 0 8px #000, 0 6px 14px rgba(0,0,0,0.95)`,
          transform: "rotate(-3deg)",
          border: `4px solid ${color}`,
          padding: "8px 26px",
          borderRadius: 10,
          background: "rgba(0,0,0,0.7)",
          whiteSpace: "nowrap",
        }}
      >
        {beat.word}
      </div>
    </div>
  );
};

const CounterBeatView: React.FC<{
  beat: CounterBeat;
  sceneColor: string;
  within: number;
}> = ({ beat, within, sceneColor }) => {
  const color = beat.color ?? sceneColor;
  const t = interpolate(within, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const value = Math.floor(t * beat.to);
  const formatted = value.toLocaleString();
  // Auto-shrink the number when it gets long.
  const numChars = formatted.length + beat.suffix.length;
  const numFontSize = numChars >= 11 ? 110 : numChars >= 9 ? 130 : 144;
  return (
    <div
      style={{
        position: "relative",
        textAlign: "center",
        padding: beat.bgImage ? "26px 32px" : 0,
        width: beat.bgImage ? 920 : "auto",
        maxWidth: 920,
      }}
    >
      {beat.bgImage && (
        <Img
          src={staticFile(beat.bgImage)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 22,
            filter: "saturate(0.85) brightness(0.38)",
            border: `4px solid ${color}`,
            boxShadow: `0 0 30px ${color}55, 0 10px 24px rgba(0,0,0,0.65)`,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          color: theme.white,
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: 6,
          textShadow: "0 0 8px #000, 0 4px 10px rgba(0,0,0,0.95)",
          marginBottom: 8,
        }}
      >
        {beat.label}
      </div>
      <div
        style={{
          position: "relative",
          color,
          fontSize: numFontSize,
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: -3,
          textShadow: `0 0 50px ${color}aa, 0 0 12px #000, 0 6px 14px rgba(0,0,0,0.95)`,
          whiteSpace: "nowrap",
        }}
      >
        {formatted}
        {beat.suffix}
      </div>
    </div>
  );
};

/* ───── Shared subcomponent: portrait chip with flag overlay ───── */

const PortraitChip: React.FC<{
  image?: string;
  fallbackInitials: string;
  flagIso2?: string;
  color: string;
  size: number;
}> = ({ image, fallbackInitials, flagIso2, color, size }) => {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 22,
        overflow: "visible",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 22,
          overflow: "hidden",
          border: `5px solid ${color}`,
          boxShadow: `
            0 0 0 2px rgba(0,0,0,0.55),
            0 0 40px ${color}88,
            0 0 14px ${color}55,
            0 14px 28px rgba(0,0,0,0.7)
          `,
          background: "linear-gradient(135deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)",
        }}
      >
        {image ? (
          <Img
            src={staticFile(image)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
              fontSize: size * 0.36,
              fontWeight: 900,
              letterSpacing: -2,
              textShadow: `0 0 12px ${color}, 0 2px 6px rgba(0,0,0,0.8)`,
              background: `radial-gradient(circle at center, ${color}22 0%, rgba(0,0,0,0) 70%)`,
            }}
          >
            {fallbackInitials}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 30%)",
            pointerEvents: "none",
          }}
        />
      </div>
      {flagIso2 && (
        <div
          style={{
            position: "absolute",
            bottom: -10,
            right: -10,
            borderRadius: 8,
            overflow: "hidden",
            border: `3px solid ${color}`,
            boxShadow: `0 0 16px ${color}88, 0 6px 14px rgba(0,0,0,0.85)`,
          }}
        >
          <CountryFlag iso2={flagIso2} height={Math.max(36, size * 0.26)} radius={0} />
        </div>
      )}
    </div>
  );
};
