import { interpolate, useCurrentFrame } from "remotion";
import { FaPlaneDeparture } from "react-icons/fa";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import type { PassportEntry } from "./data";
import { tierColor, tierLabel, MAX_VISA_FREE } from "./data";

type Props = {
  entry: PassportEntry;
  distanceFromCenter: number;
  width: number;
};

export const CARD_HEIGHT = 680;

/**
 * Editorial-style card.
 *
 *   - Tier-color top stripe (thin, decorative)
 *   - Tier label pill (ELITE / PREMIUM / STRONG / ...) — instant context
 *   - Flag with thick tier-color border
 *   - Country name (dark text + tier-color underline — not a heavy banner)
 *   - Huge tier-color number
 *   - "VISA-FREE COUNTRIES" subtitle
 *   - Progress bar showing value / MAX_VISA_FREE — viewer sees rank visually
 *   - Tiny "vs world's strongest" comparison line
 *   - Subtle rank marker at bottom
 *
 * No number animation — value always displays correctly.
 */
export const Card: React.FC<Props> = ({ entry, distanceFromCenter, width }) => {
  const _frame = useCurrentFrame();
  void _frame;
  const accent = entry.accent ?? tierColor(entry.rank);
  const tier = tierLabel(entry.rank);

  const focusRamp = width * 1.5;
  const focus = interpolate(Math.abs(distanceFromCenter), [0, focusRamp], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const visibility = interpolate(
    Math.abs(distanceFromCenter),
    [width * 3, width * 4],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  if (visibility <= 0.01) return null;

  const scale = 0.88 + focus * 0.22;
  const lift = focus * -28;
  const cardOpacity = (0.82 + focus * 0.18) * visibility;
  const isActive = focus > 0.55;

  const progress = Math.min(1, entry.visaFree / MAX_VISA_FREE);

  return (
    <div
      style={{
        width,
        height: CARD_HEIGHT,
        flexShrink: 0,
        position: "relative",
        // Card background: subtle vertical gradient + diagonal tier-tinted wash
        // so it never reads as a flat white slab.
        background: `
          linear-gradient(180deg, ${accent}08 0%, transparent 30%, transparent 70%, ${accent}10 100%),
          linear-gradient(135deg, #FFFFFF 0%, #FAFCFE 100%)
        `,
        borderRadius: 24,
        boxShadow: isActive
          ? `0 0 0 4px ${accent}33, 0 28px 56px ${accent}40, 0 8px 18px ${palette.shadowDeep}`
          : `0 10px 26px ${palette.shadow}, 0 2px 4px ${palette.shadow}`,
        transform: `scale(${scale}) translateY(${lift}px)`,
        opacity: cardOpacity,
        transformOrigin: "center center",
        border: `1px solid ${palette.border}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Soft tier-colored radial glow behind the number area — gives the
          number visual weight without a hard background block. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "52%",
          width: width * 0.95,
          height: width * 0.95,
          marginLeft: -width * 0.475,
          marginTop: -width * 0.475,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}14 0%, ${accent}06 35%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Decorative corner dots — top-left + bottom-right for a "stamp" feel */}
      <CornerDots accent={accent} corner="tl" />
      <CornerDots accent={accent} corner="br" />

      {/* Top tier-color accent stripe */}
      <div
        style={{
          height: 8,
          background: `linear-gradient(90deg, ${accent}, ${accent}cc, ${accent})`,
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Header row: tier label pill + decorative dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 22px 0",
        }}
      >
        <div
          style={{
            padding: "5px 12px",
            borderRadius: 6,
            background: `${accent}15`,
            color: accent,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 2.5,
            border: `1.5px solid ${accent}40`,
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          }}
        >
          {tier} TIER
        </div>
        {/* Decorative dots */}
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background: i === 0 ? accent : `${accent}50`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Flag — generous size, prominent border */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: `5px solid ${accent}`,
            boxShadow: `0 10px 22px ${accent}40, 0 2px 6px rgba(0,0,0,0.08)`,
            background: palette.card,
          }}
        >
          <CountryFlag iso2={entry.iso2} height={130} radius={0} shadow={false} />
        </div>
      </div>

      {/* Country name — dark, bold, with tier-color underline */}
      <div
        style={{
          marginTop: 22,
          padding: "0 18px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: entry.name.length > 11 ? 32 : 38,
            fontWeight: 900,
            color: palette.text,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            lineHeight: 1.05,
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          }}
        >
          {entry.name}
        </div>
        <div
          style={{
            margin: "10px auto 0",
            width: 60,
            height: 4,
            borderRadius: 2,
            background: accent,
          }}
        />
      </div>

      {/* Big number */}
      <div
        style={{
          marginTop: 16,
          textAlign: "center",
          fontSize: 130,
          fontWeight: 900,
          lineHeight: 0.92,
          color: accent,
          letterSpacing: -4,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        {entry.visaFree}
      </div>

      {/* Subtitle */}
      <div
        style={{
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: palette.textSoft,
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: 2.5,
        }}
      >
        <FaPlaneDeparture size={16} color={accent} />
        <span>VISA-FREE COUNTRIES</span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          margin: "20px 26px 0",
          height: 6,
          borderRadius: 999,
          background: palette.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
            borderRadius: 999,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 8,
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          color: palette.textMuted,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        out of {MAX_VISA_FREE} max
      </div>

      {/* Rank marker at bottom */}
      <div
        style={{
          marginTop: "auto",
          padding: "12px 22px 18px",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            padding: "6px 16px",
            borderRadius: 999,
            background: palette.bgAlt,
            border: `1.5px solid ${palette.border}`,
            color: palette.textSoft,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: `0 2px 6px ${palette.shadow}`,
          }}
        >
          <span style={{ color: accent, fontWeight: 900 }}>RANK</span>
          <span style={{ color: palette.text, fontSize: 18, fontWeight: 900 }}>
            #{entry.rank}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Three small dots in a corner — subtle "stamp" / "passport" decoration. */
const CornerDots: React.FC<{ accent: string; corner: "tl" | "br" }> = ({ accent, corner }) => {
  const positions =
    corner === "tl"
      ? { top: 14, left: 14, transform: "rotate(0deg)" }
      : { bottom: 14, right: 14, transform: "rotate(180deg)" };
  return (
    <div
      style={{
        position: "absolute",
        ...positions,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        opacity: 0.35,
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", gap: 4 }}>
        <div style={{ width: 3, height: 3, borderRadius: 999, background: accent }} />
        <div style={{ width: 3, height: 3, borderRadius: 999, background: accent }} />
        <div style={{ width: 3, height: 3, borderRadius: 999, background: accent }} />
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <div style={{ width: 3, height: 3, borderRadius: 999, background: accent }} />
        <div style={{ width: 3, height: 3, borderRadius: 999, background: `${accent}60` }} />
      </div>
    </div>
  );
};
