import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountryFlag } from "../../shared/CountryFlag";
import type { Scene } from "./types";
import { getSceneAt } from "./sceneHelpers";

type Props = { scenes: Scene[] };

/**
 * Floats above the country name at top-center. Springs in once the camera has
 * arrived, springs out at scene end. Renders nothing for hook/closing scenes
 * (which don't have a single iso2).
 */
export const FlagBadge: React.FC<Props> = ({ scenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = getSceneAt(scenes, frame);

  if (!scene.iso2 || !scene.countryName || scene.isoNumerics.length !== 1) return null;

  const withinScene   = frame - scene.startFrame;
  const framesLeft    = scene.endFrame - frame;
  const sceneDuration = scene.endFrame - scene.startFrame;
  const arriveOffset  = Math.floor(sceneDuration * 0.3);

  const enterT = spring({
    frame: withinScene - arriveOffset,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 20,
    config: { damping: 14 },
  });
  const exitT = interpolate(framesLeft, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (enterT <= 0) return null;

  // Position chosen so flag sits at y≈560 (above the country name label which
  // ShortWorldMap renders at y≈760). Both stay inside the safe zone (260-1440)
  // and leave room below for CompanyIcons + ScriptLine.
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "calc(50% - 400px)",
        display: "flex",
        justifyContent: "center",
        opacity: enterT * exitT,
        transform: `translateY(${(1 - enterT) * -18}px) scale(${0.6 + 0.4 * enterT})`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: `0 0 24px ${scene.color}66, 0 8px 24px rgba(0,0,0,0.7)`,
          border: `3px solid ${scene.color}`,
        }}
      >
        <CountryFlag iso2={scene.iso2} height={72} radius={0} />
      </div>
    </div>
  );
};
