import { interpolate, useCurrentFrame } from "remotion";
import { palette } from "./palette";

type Props = {
  startFrame: number;
  endFrame: number;
};

/**
 * Bottom-of-frame video progress bar.
 *
 * Bigger than a hairline so it reads from across a TV/monitor — also adds a
 * moving "head" dot at the current position and a percentage readout to the
 * right.
 */
export const ProgressBar: React.FC<Props> = ({ startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  if (frame < startFrame || frame > endFrame) return null;

  const t = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        left: 80,
        right: 80,
        display: "flex",
        alignItems: "center",
        gap: 22,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 26,
          borderRadius: 999,
          background: palette.bgAlt,
          border: `2px solid ${palette.borderDeep}`,
          boxShadow: `inset 0 2px 5px ${palette.shadow}, 0 8px 22px ${palette.shadowDeep}`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${t * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${palette.brand}, #F59E0B 50%, #E11D48)`,
            borderRadius: 999,
            boxShadow: `0 0 20px ${palette.brand}77`,
          }}
        />
        {/* Glossy highlight strip along the top of the fill */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 3,
            width: `${t * 100}%`,
            height: 7,
            borderRadius: 999,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Moving head dot — sits at the leading edge of the fill */}
        <div
          style={{
            position: "absolute",
            left: `calc(${t * 100}% - 19px)`,
            top: "50%",
            transform: "translateY(-50%)",
            width: 38,
            height: 38,
            borderRadius: 999,
            background: "#FFFFFF",
            border: `5px solid ${palette.brand}`,
            boxShadow: `0 6px 16px ${palette.shadowDeep}, 0 0 0 6px ${palette.brand}22`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 1,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          minWidth: 92,
          textAlign: "right",
        }}
      >
        {Math.round(t * 100)}%
      </div>
    </div>
  );
};
