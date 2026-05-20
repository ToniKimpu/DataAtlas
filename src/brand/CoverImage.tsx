import { AbsoluteFill } from "remotion";
import { BarMark } from "./BarMark";
import { brand } from "./theme";

/**
 * YouTube channel banner — 2560×1440.
 *
 * YouTube crops the banner per device; the only region guaranteed visible
 * everywhere is the centered **1546×423 safe area**. The logo lockup — mark,
 * wordmark, tagline — is centered so it lands inside that safe area, while the
 * faint bar "skyline" runs full-width for the TV crop.
 */
const W = 2560;
const H = 1440;

/** Deterministic heights for the faint background bar skyline. */
const SKYLINE = [
  0.34, 0.52, 0.42, 0.66, 0.5, 0.78, 0.58, 0.9, 0.68, 1.0,
  0.74, 0.86, 0.6, 0.7, 0.48, 0.62, 0.4, 0.54,
];

export const CoverImage: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(125deg, ${brand.blueBright} 0%, ${brand.blue} 52%, ${brand.indigo} 100%)`,
        fontFamily: brand.font,
      }}
    >
      {/* Bright radial light source, upper-center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 62% 72% at 50% 20%, rgba(160,180,255,0.5) 0%, transparent 62%)",
        }}
      />

      {/* Faint bar "skyline" along the bottom — echoes the mark, says "data" */}
      <Skyline />

      {/* Glow accents */}
      <Glow x={W * 0.15} y={H * 0.34} size={1300} color="rgba(130,160,255,0.32)" />
      <Glow x={W * 0.87} y={H * 0.72} size={1320} color="rgba(245,158,11,0.17)" />

      {/* Edge vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 460px 130px rgba(15,18,62,0.55)",
        }}
      />

      {/* ── Logo lockup — centered, lands inside the 1546×423 safe area ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
          <BarMark width={212} height={176} />
          <div
            style={{
              fontSize: 152,
              fontWeight: 900,
              letterSpacing: 4,
              lineHeight: 1,
              color: brand.white,
              textShadow: "0 8px 32px rgba(8,12,44,0.5)",
            }}
          >
            DATA ATLAS
          </div>
        </div>

        {/* Tagline, framed by small amber dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 9,
            color: brand.muted,
          }}
        >
          <Dot />
          THE WORLD, BY THE NUMBERS
          <Dot />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Faint full-width bar skyline anchored to the bottom edge. */
const Skyline: React.FC = () => {
  const n = SKYLINE.length;
  const slot = W / n;
  const barW = slot * 0.66;
  const maxH = H * 0.34;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {SKYLINE.map((h, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: i * slot + (slot - barW) / 2,
            width: barW,
            height: maxH * h,
            borderRadius: "14px 14px 0 0",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
      ))}
    </div>
  );
};

const Dot: React.FC = () => (
  <span
    style={{
      width: 9,
      height: 9,
      borderRadius: 999,
      background: brand.amber,
      boxShadow: "0 0 12px rgba(245,158,11,0.8)",
    }}
  />
);

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
