import { interpolate, useCurrentFrame } from "remotion";
import { palette } from "./palette";

type Props = {
  title: string;
  subtitle: string;
  currentIndex: number;
  total: number;
  startFrame: number;
};

/**
 * Light-theme top chrome: dark title on the left, soft-blue rank chip on
 * the right.
 */
export const TopBar: React.FC<Props> = ({ title, subtitle, currentIndex, total, startFrame }) => {
  const frame = useCurrentFrame();
  if (frame < startFrame) return null;

  const enterT = interpolate(frame - startFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayRank = Math.min(total, currentIndex + 1);

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        left: 60,
        right: 60,
        height: 84,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: enterT,
        transform: `translateY(${(1 - enterT) * -20}px)`,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        pointerEvents: "none",
      }}
    >
      <div>
        <div
          style={{
            color: palette.text,
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: 1.5,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: palette.textSoft,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 3,
            marginTop: 4,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          padding: "12px 22px",
          borderRadius: 14,
          background: palette.brandSoft,
          border: `2px solid ${palette.brand}`,
          boxShadow: `0 6px 14px ${palette.shadow}`,
          display: "flex",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        <span
          style={{
            color: palette.brand,
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          #{displayRank}
        </span>
        <span
          style={{
            color: palette.textSoft,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          OF {total}
        </span>
      </div>
    </div>
  );
};
