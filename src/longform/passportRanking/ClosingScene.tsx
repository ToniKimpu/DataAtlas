import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import type { PassportEntry } from "./data";
import { tierColor } from "./data";

type Props = {
  startFrame: number;
  topGroup: PassportEntry[];
  totalCountries: number;
};

/**
 * Light-theme closing reveal: huge gold "#1", subtitle, divider, the top-ranked
 * passport(s) as a flag row, footer with data source. `topGroup` holds every
 * country sharing rank 1 — usually one, but the row handles a tie gracefully.
 */
export const ClosingScene: React.FC<Props> = ({ startFrame, topGroup, totalCountries }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame) return null;

  const within = frame - startFrame;
  const accent = topGroup[0]?.accent ?? tierColor(topGroup[0]?.rank ?? 1);

  const titleT = spring({
    frame: within - 2,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 26,
    config: { damping: 14 },
  });
  const flagsT = spring({
    frame: within - 30,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 22,
    config: { damping: 13 },
  });
  const footerT = interpolate(within, [70, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        pointerEvents: "none",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          opacity: titleT,
          transform: `scale(${0.62 + titleT * 0.38})`,
        }}
      >
        <div
          style={{
            fontSize: 260,
            fontWeight: 900,
            lineHeight: 0.88,
            color: accent,
            letterSpacing: -10,
          }}
        >
          #1
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 36,
            fontWeight: 900,
            color: palette.text,
            letterSpacing: 6,
          }}
        >
          STRONGEST PASSPORT IN THE WORLD
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 22,
            fontWeight: 800,
            color: palette.textSoft,
            letterSpacing: 4,
          }}
        >
          {topGroup[0]?.visaFree ?? 0} VISA-FREE DESTINATIONS
        </div>
      </div>

      <div
        style={{
          height: 3,
          width: interpolate(within, [25, 55], [0, 700], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 28,
          opacity: flagsT,
          maxWidth: 1500,
        }}
      >
        {topGroup.map((entry, i) => {
          const itemT = spring({
            frame: within - 30 - i * 5,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 22,
            config: { damping: 12 },
          });
          const c = entry.accent ?? tierColor(entry.rank);
          return (
            <div
              key={entry.iso2}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "16px 18px",
                borderRadius: 16,
                background: palette.card,
                boxShadow: `0 12px 28px ${palette.shadow}`,
                border: `3px solid ${c}`,
                opacity: itemT,
                transform: `translateY(${(1 - itemT) * 22}px) scale(${0.88 + itemT * 0.12})`,
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `3px solid ${c}`,
                }}
              >
                <CountryFlag iso2={entry.iso2} height={86} radius={0} shadow={false} />
              </div>
              <div
                style={{
                  color: palette.text,
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {entry.name}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 20,
          fontWeight: 700,
          color: palette.textMuted,
          letterSpacing: 3,
          textAlign: "center",
          opacity: footerT,
        }}
      >
        Ranked {totalCountries} passports · Data: Henley Passport Index 2026
      </div>
    </div>
  );
};
