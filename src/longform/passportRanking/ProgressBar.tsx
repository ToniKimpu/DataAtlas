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
        bottom: 44,
        left: 80,
        right: 80,
        display: "flex",
        alignItems: "center",
        gap: 16,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 14,
          borderRadius: 999,
          background: palette.bgAlt,
          border: `1.5px solid ${palette.border}`,
          boxShadow: `inset 0 1px 3px ${palette.shadow}`,
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
            boxShadow: `0 0 12px ${palette.brand}55`,
          }}
        />
        {/* Moving head dot — sits at the leading edge of the fill */}
        <div
          style={{
            position: "absolute",
            left: `calc(${t * 100}% - 11px)`,
            top: "50%",
            transform: "translateY(-50%)",
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "#FFFFFF",
            border: `3px solid ${palette.brand}`,
            boxShadow: `0 4px 10px ${palette.shadowDeep}, 0 0 0 4px ${palette.brand}22`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 1,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          minWidth: 60,
          textAlign: "right",
        }}
      >
        {Math.round(t * 100)}%
      </div>
    </div>
  );
};
