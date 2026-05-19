import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "./types";
import { getSceneAt } from "./sceneHelpers";
import { theme } from "../../shared/theme";
import { BRAND_MAP } from "./brandIcons";

const ICON_SIZE  = 72;
const BADGE_SIZE = 128;
const STAGGER    = 10;

type Props = { scenes: Scene[] };

/**
 * Renders the current scene's `companies` as a row (or two) of branded badges.
 * Springs each in with a stagger so they cascade from left to right after the
 * camera arrives.
 */
export const CompanyIcons: React.FC<Props> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getSceneAt(scenes, frame);

  if (!scene.countryName || scene.companies.length === 0) return null;

  const withinScene   = frame - scene.startFrame;
  const framesLeft    = scene.endFrame - frame;
  const sceneDuration = scene.endFrame - scene.startFrame;
  const arriveOffset  = Math.floor(sceneDuration * 0.3);

  const containerEnter = spring({
    frame: withinScene - arriveOffset,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 18,
    config: { damping: 14 },
  });
  const containerExit = interpolate(framesLeft, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (containerEnter <= 0) return null;

  // Split into rows of max 3
  const rows: string[][] = [];
  for (let i = 0; i < scene.companies.length; i += 3) {
    rows.push(scene.companies.slice(i, i + 3));
  }

  // Top: 47% places badges starting at y≈900 — below the country name label
  // (y≈760) and above the ScriptLine caption (top y≈1300). Two badge rows fit
  // comfortably without overlapping the script caption box below.
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "47%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        opacity: containerEnter * containerExit,
        transform: `translateY(${(1 - containerEnter) * 30}px)`,
        pointerEvents: "none",
        fontFamily: theme.fontFamily,
      }}
    >
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: "flex", gap: 24 }}>
          {row.map((company, colIdx) => {
            const globalIdx = rowIdx * 3 + colIdx;
            const entry = BRAND_MAP[company];
            const brand = entry?.brand ?? scene.color;

            const badgeT = spring({
              frame: withinScene - arriveOffset - globalIdx * STAGGER,
              fps,
              from: 0,
              to: 1,
              durationInFrames: 16,
              config: { damping: 12 },
            });

            return (
              <div
                key={company}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  opacity: badgeT,
                  transform: `scale(${0.5 + 0.5 * badgeT}) translateY(${(1 - badgeT) * 20}px)`,
                }}
              >
                <div
                  style={{
                    width: BADGE_SIZE,
                    height: BADGE_SIZE,
                    borderRadius: BADGE_SIZE / 2,
                    background: "rgba(8, 14, 32, 0.92)",
                    border: `4px solid ${brand}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 28px ${brand}88, 0 8px 32px rgba(0,0,0,0.7)`,
                  }}
                >
                  {entry?.type === "icon" && (
                    <entry.Icon size={ICON_SIZE} color={brand} />
                  )}
                  {(entry?.type === "text" || !entry) && (
                    <span style={{
                      color: brand,
                      fontSize: company.length > 5 ? 24 : 30,
                      fontWeight: 900,
                      textAlign: "center",
                      padding: "0 10px",
                      textShadow: `0 0 12px ${brand}`,
                    }}>
                      {entry?.type === "text" ? entry.label : company}
                    </span>
                  )}
                </div>

                <div style={{
                  color: theme.white,
                  fontSize: 30,
                  fontWeight: 800,
                  textShadow: "0 0 12px rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1)",
                  letterSpacing: 0.5,
                }}>
                  {company}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
