import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FaPassport } from "react-icons/fa";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import { PASSPORTS_BY_RANK } from "./data";

type Props = {
  endFrame: number;
};

/**
 * Hook scene — 5s premium intro.
 *
 * Layout (top to bottom):
 *   ─ gold "2026 RANKING" pill
 *   ─ passport icon emblem (decorative)
 *   ─ big title "WORLD'S STRONGEST PASSPORTS" (PASSPORTS in brand-blue)
 *   ─ subtitle "Visa-free destinations by country"
 *   ─ teaser strip: the six strongest passport flags with a "FEATURING" caption
 *
 * The whole thing fades out over the last 18 frames; the carousel
 * crossfades in below.
 */
export const HookScene: React.FC<Props> = ({ endFrame }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  if (frame >= endFrame) return null;

  const pillT = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 22,
    config: { damping: 13 },
  });
  const emblemT = spring({
    frame: frame - 6,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 24,
    config: { damping: 12 },
  });
  const titleT = spring({
    frame: frame - 16,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 28,
    config: { damping: 12, stiffness: 150 },
  });
  const subtitleT = spring({
    frame: frame - 36,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 22,
    config: { damping: 14 },
  });
  const teaserT = spring({
    frame: frame - 50,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 22,
    config: { damping: 13 },
  });
  const exitT = interpolate(endFrame - frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The six strongest passports, teased at the bottom of the hook.
  const featured = PASSPORTS_BY_RANK.slice(0, 6);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitT,
        pointerEvents: "none",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Soft tier-color spotlight behind everything */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - 600,
          top: "50%",
          marginTop: -400,
          width: 1200,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.20) 0%, rgba(245,158,11,0.08) 35%, transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        {/* Top pill */}
        <div
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            background: "#FEF3C7",
            border: "2px solid #F59E0B",
            fontSize: 22,
            fontWeight: 900,
            color: "#92400E",
            letterSpacing: 6,
            opacity: pillT,
            transform: `translateY(${(1 - pillT) * -20}px)`,
            boxShadow: "0 6px 16px rgba(245,158,11,0.3)",
          }}
        >
          2026 RANKING
        </div>

        {/* Passport icon emblem */}
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: 22,
            background: "#FFFFFF",
            border: "3px solid #F59E0B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 24px rgba(245,158,11,0.30), 0 4px 10px rgba(0,0,0,0.08)",
            opacity: emblemT,
            transform: `scale(${0.6 + emblemT * 0.4}) rotate(${(1 - emblemT) * -8}deg)`,
          }}
        >
          <FaPassport size={48} color="#F59E0B" />
        </div>

        {/* Big title */}
        <div
          style={{
            fontSize: 132,
            fontWeight: 900,
            color: palette.text,
            letterSpacing: 2,
            textAlign: "center",
            lineHeight: 0.95,
            opacity: titleT,
            transform: `scale(${0.78 + titleT * 0.22})`,
            marginTop: 4,
          }}
        >
          WORLD'S
          <br />
          STRONGEST
          <br />
          <span style={{ color: palette.brand }}>PASSPORTS</span>
        </div>

        {/* Decorative divider */}
        <div
          style={{
            marginTop: 12,
            width: 120 * subtitleT,
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${palette.brand}, #F59E0B)`,
            opacity: subtitleT,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: palette.textSoft,
            letterSpacing: 4,
            opacity: subtitleT,
            transform: `translateY(${(1 - subtitleT) * 20}px)`,
          }}
        >
          Visa-free destinations by country
        </div>
      </div>

      {/* Featured-flag teaser strip */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: teaserT,
          transform: `translateY(${(1 - teaserT) * 24}px)`,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 6,
            color: palette.textMuted,
          }}
        >
          FEATURING
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {featured.map((entry, i) => (
            <div
              key={entry.iso2}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                border: `2.5px solid ${palette.border}`,
                boxShadow: `0 6px 14px ${palette.shadow}`,
                opacity: interpolate(teaserT, [0, 1], [0, 1]),
                transform: `translateY(${(1 - teaserT) * (i + 1) * 4}px)`,
              }}
            >
              <CountryFlag iso2={entry.iso2} height={42} radius={0} shadow={false} />
            </div>
          ))}
          <div
            style={{
              alignSelf: "center",
              padding: "6px 12px",
              borderRadius: 999,
              background: palette.text,
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            +{PASSPORTS_BY_RANK.length - featured.length} MORE
          </div>
        </div>
      </div>
    </div>
  );
};
