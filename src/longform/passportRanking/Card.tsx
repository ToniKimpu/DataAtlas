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
 * "Passport Cover" card — a bold two-zone design.
 *
 *   ┌─ HEADER (accent-color gradient panel) ──────────┐
 *   │   • tier label pill (white-on-color)            │
 *   │   • decorative dots + faint stamp-ring marks    │
 *   │   • glossy diagonal sheen                       │
 *   │   • flag in a white frame — pops off the color  │
 *   ├─ BODY (clean light surface) ────────────────────┤
 *   │   • country name + accent underline             │
 *   │   • huge accent number + soft glow              │
 *   │   • "VISA-FREE COUNTRIES" subtitle              │
 *   │   • progress bar vs MAX_VISA_FREE               │
 *   │   • rank chip                                   │
 *   └─────────────────────────────────────────────────┘
 *
 * The accent color (gold/blue/teal/violet/orange/rose by tier) drives the
 * header gradient, the border, the shadows and every highlight — so the card
 * reads as part of the scene instead of a flat white slab.
 *
 * No number animation — value always displays correctly.
 */
export const Card: React.FC<Props> = ({ entry, distanceFromCenter, width }) => {
  const _frame = useCurrentFrame();
  void _frame;
  const accent = entry.accent ?? tierColor(entry.rank);
  const tier = tierLabel(entry.rank);

  // Accent variants for the colored header gradient + highlights.
  const accentLight = lighten(accent, 0.24);
  const accentDeep = darken(accent, 0.26);

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
        background: palette.card,
        borderRadius: 26,
        boxShadow: isActive
          ? `0 0 0 4px ${rgba(accent, 0.3)}, 0 32px 62px ${rgba(accentDeep, 0.45)}, 0 10px 22px ${palette.shadowDeep}`
          : `0 16px 32px ${rgba(accent, 0.18)}, 0 4px 9px ${palette.shadow}`,
        transform: `scale(${scale}) translateY(${lift}px)`,
        opacity: cardOpacity,
        transformOrigin: "center center",
        border: `1px solid ${rgba(accent, 0.28)}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── HEADER: accent-colored gradient panel ────────────────────── */}
      <div
        style={{
          position: "relative",
          background: `linear-gradient(158deg, ${accentLight} 0%, ${accent} 50%, ${accentDeep} 100%)`,
          padding: "20px 22px 26px",
          overflow: "hidden",
        }}
      >
        {/* Glossy diagonal sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(150deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.06) 34%, rgba(255,255,255,0) 58%)",
            pointerEvents: "none",
          }}
        />
        {/* Faint stamp-ring watermarks — passport motif */}
        <div
          style={{
            position: "absolute",
            right: -66,
            top: -74,
            width: 226,
            height: 226,
            borderRadius: "50%",
            border: "11px solid rgba(255,255,255,0.11)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -54,
            bottom: -94,
            width: 184,
            height: 184,
            borderRadius: "50%",
            border: "9px solid rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />

        {/* Header row: tier pill + decorative dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              padding: "6px 13px",
              borderRadius: 7,
              background: "rgba(255,255,255,0.18)",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 2.5,
              border: "1.5px solid rgba(255,255,255,0.55)",
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            {tier} TIER
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === 0 ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Flag — white frame so it pops off the colored panel */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 22,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border: "5px solid #FFFFFF",
              boxShadow:
                "0 14px 30px rgba(0,0,0,0.32), 0 3px 8px rgba(0,0,0,0.22)",
              background: "#FFFFFF",
            }}
          >
            <CountryFlag iso2={entry.iso2} height={132} radius={0} shadow={false} />
          </div>
        </div>
      </div>

      {/* ── BODY: clean light surface ────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          flex: 1,
          background: `linear-gradient(180deg, #FFFFFF 0%, #FBFCFE 55%, ${rgba(accent, 0.09)} 100%)`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Shadow cast by the header onto the body — depth between zones */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 22,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.14) 0%, rgba(15,23,42,0) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Soft accent glow behind the number */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "40%",
            width: width * 0.95,
            height: width * 0.95,
            marginLeft: -width * 0.475,
            marginTop: -width * 0.475,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${rgba(accent, 0.16)} 0%, ${rgba(accent, 0.05)} 38%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Stamp-style corner dots */}
        <CornerDots accent={accent} />

        {/* Country name — dark, bold, accent underline */}
        <div
          style={{
            marginTop: 26,
            padding: "0 18px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: entry.name.length > 11 ? 31 : 37,
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
              margin: "11px auto 0",
              width: 64,
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${rgba(accent, 0)} 0%, ${accent} 50%, ${rgba(accent, 0)} 100%)`,
            }}
          />
        </div>

        {/* Big number */}
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 124,
            fontWeight: 900,
            lineHeight: 0.92,
            color: accent,
            letterSpacing: -4,
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            position: "relative",
            zIndex: 1,
            textShadow: `0 6px 24px ${rgba(accent, 0.34)}`,
          }}
        >
          {entry.visaFree}
        </div>

        {/* Metric label — accent pill so the core stat of the video stands out */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 18px",
              borderRadius: 999,
              background: rgba(accent, 0.13),
              border: `1.5px solid ${rgba(accent, 0.34)}`,
              color: darken(accent, 0.22),
              fontSize: 17,
              fontWeight: 900,
              letterSpacing: 1.8,
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            }}
          >
            <FaPlaneDeparture size={16} color={accent} />
            <span>VISA-FREE COUNTRIES</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ margin: "18px 28px 0", position: "relative", zIndex: 1 }}>
          <div
            style={{
              height: 7,
              borderRadius: 999,
              background: rgba(accent, 0.14),
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${accentLight}, ${accent})`,
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        {/* Rank chip */}
        <div
          style={{
            marginTop: "auto",
            padding: "12px 22px 20px",
            display: "flex",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              padding: "7px 18px",
              borderRadius: 999,
              background: palette.bgAlt,
              border: `1.5px solid ${rgba(accent, 0.32)}`,
              color: palette.textSoft,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: `0 3px 10px ${rgba(accent, 0.18)}`,
            }}
          >
            <span style={{ color: accent, fontWeight: 900 }}>RANK</span>
            <span style={{ color: palette.text, fontSize: 18, fontWeight: 900 }}>
              #{entry.rank}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Small stamp-style dot cluster in the bottom-right of the card body. */
const CornerDots: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    style={{
      position: "absolute",
      bottom: 14,
      right: 14,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      opacity: 0.3,
      pointerEvents: "none",
    }}
  >
    <div style={{ display: "flex", gap: 4 }}>
      <Dot c={accent} />
      <Dot c={accent} />
      <Dot c={accent} />
    </div>
    <div style={{ display: "flex", gap: 4 }}>
      <Dot c={accent} />
      <Dot c={rgba(accent, 0.4)} />
    </div>
  </div>
);

const Dot: React.FC<{ c: string }> = ({ c }) => (
  <div style={{ width: 3, height: 3, borderRadius: 999, background: c }} />
);

/* ── Color helpers ──────────────────────────────────────────────────── */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Mix a hex color toward `target` (0 = black, 255 = white) by `amount` (0–1). */
function mixToward(hex: string, target: number, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const m = (c: number) => Math.round(c + (target - c) * amount);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

const lighten = (hex: string, amount: number) => mixToward(hex, 255, amount);
const darken = (hex: string, amount: number) => mixToward(hex, 0, amount);

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
