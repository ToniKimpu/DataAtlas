import { AbsoluteFill } from "remotion";
import { BarMark } from "./BarMark";
import { brand } from "./theme";

/**
 * YouTube channel profile picture — 800×800.
 *
 * YouTube masks the avatar to a circle, so the mark + wordmark stay centered
 * and clear of the corners. The bar mark carries the identity at tiny sizes;
 * the wordmark reads on the channel page.
 */
const S = 800;

export const ProfileImage: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 38%, ${brand.blueBright} 0%, ${brand.blue} 56%, ${brand.indigoDeep} 100%)`,
        fontFamily: brand.font,
      }}
    >
      {/* Soft glow behind the mark */}
      <Glow x={S / 2} y={326} size={640} color="rgba(150,170,255,0.45)" />

      {/* Logo mark */}
      <div style={{ position: "absolute", left: S / 2 - 188, top: 188 }}>
        <BarMark width={376} height={292} />
      </div>

      {/* Wordmark */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 540,
          textAlign: "center",
          fontSize: 76,
          fontWeight: 900,
          letterSpacing: 2,
          lineHeight: 1,
          color: brand.white,
          textShadow: "0 6px 24px rgba(10,14,50,0.5)",
        }}
      >
        DATA ATLAS
      </div>
    </AbsoluteFill>
  );
};

/** Large soft radial glow. */
const Glow: React.FC<{ x: number; y: number; size: number; color: string }> = ({
  x,
  y,
  size,
  color,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(40px)",
      pointerEvents: "none",
    }}
  />
);
