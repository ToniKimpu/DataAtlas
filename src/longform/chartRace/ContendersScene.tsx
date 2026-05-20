import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountryFlag } from "../../shared/CountryFlag";
import { palette } from "./palette";
import { race, formatValue, getCountry, type Country } from "./data";

/**
 * "Watch for" spoiler cards — derived once at module load because they depend
 * only on the static dataset, never on the current frame. Keeping this out of
 * the component avoids any conditional-hook hazards in ContendersScene.
 */
type WatchForCardData = { country: Country; label: string };

const WATCH_FOR_CARDS: WatchForCardData[] = (() => {
  const startYear = race.years[0];
  const finalYear = race.years[race.years.length - 1];
  const cards: WatchForCardData[] = [];

  // Biggest climber from start-of-race entrants
  const climbers = race.countries
    .map((c) => {
      const start = startYear.entries.findIndex((e) => e.iso2 === c.iso2);
      const end = finalYear.entries.findIndex((e) => e.iso2 === c.iso2);
      if (start < 0 || end < 0) return null;
      return { c, startRank: start + 1, endRank: end + 1, delta: start - end };
    })
    .filter((x): x is { c: Country; startRank: number; endRank: number; delta: number } => !!x)
    .sort((a, b) => b.delta - a.delta);
  if (climbers[0]) {
    cards.push({
      country: climbers[0].c,
      label: `WILL CLIMB FROM #${climbers[0].startRank} TO #${climbers[0].endRank}`,
    });
  }

  // A country that vanishes from the top 10 (USSR-style)
  const vanisher = race.countries.find((c) => {
    const inStart = startYear.entries.some((e) => e.iso2 === c.iso2);
    const inEnd = finalYear.entries.some((e) => e.iso2 === c.iso2);
    return inStart && !inEnd;
  });
  if (vanisher) {
    cards.push({ country: vanisher, label: "WILL VANISH FROM THE TOP 10" });
  }

  // A late-joiner that ends in the top 5
  const late = race.countries.find((c) => {
    const inStart = startYear.entries.some((e) => e.iso2 === c.iso2);
    const endRank = finalYear.entries.findIndex((e) => e.iso2 === c.iso2);
    return !inStart && endRank >= 0 && endRank <= 4;
  });
  if (late) {
    const endRank = finalYear.entries.findIndex((e) => e.iso2 === late.iso2) + 1;
    cards.push({ country: late, label: `WILL ENTER AND REACH #${endRank}` });
  }

  return cards.slice(0, 3);
})();

type Props = {
  startFrame: number;
  durationFrames: number;
};

/**
 * "Meet the contenders" segment between hook and race. Aggressively tight
 * (10 s total) so the race starts inside the first 20 s. Something is always
 * animating in — no dead air.
 *
 * Timing (within = frame - startFrame, target durationFrames = 300):
 *    0 →  18   : pill
 *   10 →  32   : title
 *   20 →  42   : subtitle
 *   30 →  104  : 10 contender cards stagger in (last lands ≈ 3.5 s)
 *  100 → 188   : WATCH FOR header + 3 spoiler cards (last lands ≈ 6.3 s)
 *  188 → 270   : hold ≈ 2.7 s
 *  270 → 300   : fade out
 */
export const ContendersScene: React.FC<Props> = ({ startFrame, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < startFrame || frame >= startFrame + durationFrames) return null;

  const within = frame - startFrame;

  const pillT = spring({ frame: within, fps, from: 0, to: 1, durationInFrames: 18, config: { damping: 13 } });
  const titleT = spring({ frame: within - 10, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 14 } });
  const subT = spring({ frame: within - 20, fps, from: 0, to: 1, durationInFrames: 22, config: { damping: 14 } });
  const exitT = interpolate(
    within,
    [durationFrames - 30, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const startYear = race.years[0];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 80,
        gap: 32,
        opacity: exitT,
        pointerEvents: "none",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Top pill */}
      <div
        style={{
          padding: "8px 22px",
          borderRadius: 999,
          background: "#DBEAFE",
          border: "2px solid #2563EB",
          fontSize: 20,
          fontWeight: 900,
          color: "#1E3A8A",
          letterSpacing: 6,
          opacity: pillT,
          transform: `translateY(${(1 - pillT) * -16}px)`,
          boxShadow: "0 6px 16px rgba(37,99,235,0.2)",
        }}
      >
        MEET THE CONTENDERS · {startYear.year}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 3,
          lineHeight: 1,
          textAlign: "center",
          opacity: titleT,
          transform: `translateY(${(1 - titleT) * 24}px)`,
        }}
      >
        10 ECONOMIES ENTER THE RACE
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: palette.textSoft,
          letterSpacing: 4,
          opacity: subT,
          transform: `translateY(${(1 - subT) * 16}px)`,
        }}
      >
        ONLY ONE WILL HOLD #1 FOR ALL 64 YEARS
      </div>

      {/* 5×2 contenders grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 18,
          width: "100%",
          maxWidth: 1700,
          marginTop: 12,
          padding: "0 80px",
        }}
      >
        {startYear.entries.map((entry, i) => (
          <ContenderCard
            key={entry.iso2}
            iso2={entry.iso2}
            value={entry.value}
            rank={i + 1}
            within={within}
            fps={fps}
            delay={30 + i * 6}
          />
        ))}
      </div>

      {/* WATCH FOR section */}
      <div
        style={{
          marginTop: 12,
          width: "100%",
          maxWidth: 1700,
          padding: "0 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <WatchForHeader within={within} fps={fps} delay={100} />
        <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          {WATCH_FOR_CARDS.map((card, i) => (
            <WatchForCard
              key={card.country.iso2}
              country={card.country}
              label={card.label}
              within={within}
              fps={fps}
              delay={130 + i * 18}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ContenderCard: React.FC<{
  iso2: string;
  value: number;
  rank: number;
  within: number;
  fps: number;
  delay: number;
}> = ({ iso2, value, rank, within, fps, delay }) => {
  const country = getCountry(iso2);
  const t = spring({
    frame: within - delay,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 20,
    config: { damping: 12, stiffness: 200 },
  });
  if (!country) return null;
  return (
    <div
      style={{
        background: palette.card,
        borderRadius: 14,
        padding: "16px 18px",
        border: `3px solid ${country.color}`,
        boxShadow: `0 10px 24px ${country.color}33`,
        opacity: t,
        transform: `translateY(${(1 - t) * 24}px) scale(${0.85 + t * 0.15})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: palette.textMuted,
          letterSpacing: 3,
        }}
      >
        #{rank}
      </div>
      <CountryFlag iso2={iso2} height={56} radius={4} shadow={false} />
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: palette.text,
          letterSpacing: 1,
        }}
      >
        {country.name}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: country.color,
          letterSpacing: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatValue(value, race.unit)}
      </div>
    </div>
  );
};

const WatchForHeader: React.FC<{ within: number; fps: number; delay: number }> = ({
  within,
  fps,
  delay,
}) => {
  const t = spring({
    frame: within - delay,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 22,
    config: { damping: 13 },
  });
  return (
    <div
      style={{
        padding: "8px 20px",
        borderRadius: 999,
        background: "#FEF3C7",
        border: "2px solid #F59E0B",
        fontSize: 18,
        fontWeight: 900,
        color: "#92400E",
        letterSpacing: 5,
        opacity: t,
        transform: `translateY(${(1 - t) * -10}px)`,
      }}
    >
      WATCH FOR …
    </div>
  );
};

const WatchForCard: React.FC<{
  country: ReturnType<typeof getCountry>;
  label: string;
  within: number;
  fps: number;
  delay: number;
}> = ({ country, label, within, fps, delay }) => {
  const t = spring({
    frame: within - delay,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 22,
    config: { damping: 13, stiffness: 180 },
  });
  if (!country) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 22px",
        borderRadius: 14,
        background: palette.card,
        border: `2.5px solid ${country.color}`,
        boxShadow: `0 8px 18px ${country.color}33`,
        opacity: t,
        transform: `translateY(${(1 - t) * 20}px) scale(${0.9 + t * 0.1})`,
      }}
    >
      <CountryFlag iso2={country.iso2} height={36} radius={4} shadow={false} />
      <div
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: country.color,
          letterSpacing: 1,
        }}
      >
        {country.name}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: palette.textSoft,
          letterSpacing: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
};

