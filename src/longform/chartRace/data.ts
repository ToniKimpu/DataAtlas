/**
 * Bar-Chart Race dataset — top 10 economies by nominal GDP, 1960 → 2024.
 *
 * To produce a new chart-race video: swap `race` below with a new metric
 * (population, military spending, internet users, CO2 emissions, etc.).
 * Snapshots can be at any cadence; the engine smoothly interpolates between
 * consecutive snapshots. Keep snapshot count between 10 and 20 — fewer feels
 * choppy, more bloats the runtime without adding narrative.
 *
 * Each snapshot's `entries` array is ranked 1 → N by value (highest first).
 * Countries not in a snapshot are treated as off-screen (rank = OFF_RANK)
 * and slide in/out automatically.
 */

export type Country = {
  iso2: string;
  /** Display name shown on the bar — keep ≤ 12 chars for layout. */
  name: string;
  /** Bar fill color. Pick distinct hues; visible flag handles brand identity. */
  color: string;
};

export type YearEntry = {
  iso2: string;
  value: number;
};

export type YearSnapshot = {
  year: number;
  /** Top-N ranked highest → lowest. */
  entries: YearEntry[];
};

export type RaceData = {
  title: string;
  subtitle: string;
  metricName: string;
  /** Unit suffix shown next to values: "T", "B", "M", "K", "%". */
  unit: string;
  /** Source line shown in the footer of the race scene. */
  source: string;
  /** Every country that ever appears in any snapshot. */
  countries: Country[];
  years: YearSnapshot[];
};

/** Visual rank assigned to countries not in a snapshot's top-N.
 *  Acts as the "off-screen" slot just below the visible bars. */
export const OFF_RANK = 11;

/** How many bars are shown on screen. */
export const VISIBLE_BARS = 10;

const countries: Country[] = [
  { iso2: "US", name: "USA",         color: "#2563EB" }, // royal blue
  { iso2: "RU", name: "USSR",        color: "#DC2626" }, // red (used 1960–1990; Russia drops out of top 10 after)
  { iso2: "GB", name: "UK",          color: "#1E40AF" }, // navy
  { iso2: "DE", name: "GERMANY",     color: "#18181B" }, // black
  { iso2: "FR", name: "FRANCE",      color: "#6366F1" }, // indigo
  { iso2: "CN", name: "CHINA",       color: "#B91C1C" }, // deep red
  { iso2: "JP", name: "JAPAN",       color: "#E11D48" }, // rose
  { iso2: "CA", name: "CANADA",      color: "#B45309" }, // amber
  { iso2: "IT", name: "ITALY",       color: "#16A34A" }, // green
  { iso2: "IN", name: "INDIA",       color: "#F97316" }, // orange
  { iso2: "BR", name: "BRAZIL",      color: "#15803D" }, // forest
  { iso2: "ES", name: "SPAIN",       color: "#EAB308" }, // yellow
  { iso2: "MX", name: "MEXICO",      color: "#047857" }, // teal
  { iso2: "KR", name: "S. KOREA",    color: "#8B5CF6" }, // purple
];

/**
 * Anchor years at 5-year intervals (and 2024). Engine interpolates between
 * consecutive snapshots. Values are nominal GDP in trillions USD (approximate
 * historical figures; sources: World Bank, IMF, Maddison estimates pre-1980).
 * West Germany pre-1990 grouped under "DE"; USSR under "RU" 1960–1990.
 */
const years: YearSnapshot[] = [
  {
    year: 1960,
    entries: [
      { iso2: "US", value: 0.543 },
      { iso2: "RU", value: 0.250 },
      { iso2: "GB", value: 0.073 },
      { iso2: "DE", value: 0.072 },
      { iso2: "FR", value: 0.062 },
      { iso2: "CN", value: 0.060 },
      { iso2: "JP", value: 0.044 },
      { iso2: "CA", value: 0.041 },
      { iso2: "IT", value: 0.040 },
      { iso2: "IN", value: 0.037 },
    ],
  },
  {
    year: 1965,
    entries: [
      { iso2: "US", value: 0.744 },
      { iso2: "RU", value: 0.350 },
      { iso2: "DE", value: 0.115 },
      { iso2: "FR", value: 0.103 },
      { iso2: "GB", value: 0.100 },
      { iso2: "JP", value: 0.091 },
      { iso2: "IT", value: 0.075 },
      { iso2: "CN", value: 0.070 },
      { iso2: "IN", value: 0.060 },
      { iso2: "CA", value: 0.055 },
    ],
  },
  {
    year: 1970,
    entries: [
      { iso2: "US", value: 1.073 },
      { iso2: "RU", value: 0.435 },
      { iso2: "JP", value: 0.213 },
      { iso2: "DE", value: 0.209 },
      { iso2: "FR", value: 0.149 },
      { iso2: "GB", value: 0.130 },
      { iso2: "IT", value: 0.108 },
      { iso2: "CN", value: 0.092 },
      { iso2: "CA", value: 0.087 },
      { iso2: "IN", value: 0.063 },
    ],
  },
  {
    year: 1975,
    entries: [
      { iso2: "US", value: 1.685 },
      { iso2: "RU", value: 0.600 },
      { iso2: "JP", value: 0.521 },
      { iso2: "DE", value: 0.488 },
      { iso2: "FR", value: 0.361 },
      { iso2: "GB", value: 0.240 },
      { iso2: "IT", value: 0.224 },
      { iso2: "CA", value: 0.173 },
      { iso2: "CN", value: 0.163 },
      { iso2: "BR", value: 0.130 },
    ],
  },
  {
    year: 1980,
    entries: [
      { iso2: "US", value: 2.857 },
      { iso2: "JP", value: 1.129 },
      { iso2: "RU", value: 0.954 },
      { iso2: "DE", value: 0.853 },
      { iso2: "FR", value: 0.701 },
      { iso2: "GB", value: 0.564 },
      { iso2: "IT", value: 0.475 },
      { iso2: "CN", value: 0.305 },
      { iso2: "CA", value: 0.273 },
      { iso2: "BR", value: 0.235 },
    ],
  },
  {
    year: 1985,
    entries: [
      { iso2: "US", value: 4.339 },
      { iso2: "JP", value: 1.424 },
      { iso2: "RU", value: 1.050 },
      { iso2: "DE", value: 0.660 },
      { iso2: "FR", value: 0.554 },
      { iso2: "GB", value: 0.491 },
      { iso2: "IT", value: 0.459 },
      { iso2: "CA", value: 0.370 },
      { iso2: "CN", value: 0.310 },
      { iso2: "BR", value: 0.220 },
    ],
  },
  {
    year: 1990,
    entries: [
      { iso2: "US", value: 5.963 },
      { iso2: "JP", value: 3.133 },
      { iso2: "DE", value: 1.772 },
      { iso2: "FR", value: 1.275 },
      { iso2: "IT", value: 1.141 },
      { iso2: "GB", value: 1.094 },
      { iso2: "RU", value: 0.660 },
      { iso2: "CA", value: 0.594 },
      { iso2: "ES", value: 0.539 },
      { iso2: "BR", value: 0.462 },
    ],
  },
  {
    year: 1995,
    entries: [
      { iso2: "US", value: 7.640 },
      { iso2: "JP", value: 5.550 },
      { iso2: "DE", value: 2.590 },
      { iso2: "FR", value: 1.601 },
      { iso2: "GB", value: 1.336 },
      { iso2: "IT", value: 1.170 },
      { iso2: "BR", value: 0.770 },
      { iso2: "CN", value: 0.734 },
      { iso2: "ES", value: 0.620 },
      { iso2: "CA", value: 0.604 },
    ],
  },
  {
    year: 2000,
    entries: [
      { iso2: "US", value: 10.250 },
      { iso2: "JP", value: 4.968 },
      { iso2: "DE", value: 1.943 },
      { iso2: "GB", value: 1.665 },
      { iso2: "FR", value: 1.365 },
      { iso2: "CN", value: 1.211 },
      { iso2: "IT", value: 1.143 },
      { iso2: "CA", value: 0.744 },
      { iso2: "MX", value: 0.708 },
      { iso2: "BR", value: 0.652 },
    ],
  },
  {
    year: 2005,
    entries: [
      { iso2: "US", value: 13.039 },
      { iso2: "JP", value: 4.755 },
      { iso2: "DE", value: 2.861 },
      { iso2: "GB", value: 2.527 },
      { iso2: "CN", value: 2.286 },
      { iso2: "FR", value: 2.199 },
      { iso2: "IT", value: 1.853 },
      { iso2: "CA", value: 1.173 },
      { iso2: "ES", value: 1.157 },
      { iso2: "KR", value: 0.934 },
    ],
  },
  {
    year: 2010,
    entries: [
      { iso2: "US", value: 14.992 },
      { iso2: "CN", value: 6.087 },
      { iso2: "JP", value: 5.700 },
      { iso2: "DE", value: 3.397 },
      { iso2: "FR", value: 2.647 },
      { iso2: "GB", value: 2.464 },
      { iso2: "BR", value: 2.209 },
      { iso2: "IT", value: 2.137 },
      { iso2: "IN", value: 1.676 },
      { iso2: "CA", value: 1.613 },
    ],
  },
  {
    year: 2015,
    entries: [
      { iso2: "US", value: 18.225 },
      { iso2: "CN", value: 11.062 },
      { iso2: "JP", value: 4.395 },
      { iso2: "DE", value: 3.358 },
      { iso2: "GB", value: 2.928 },
      { iso2: "FR", value: 2.439 },
      { iso2: "IN", value: 2.103 },
      { iso2: "IT", value: 1.832 },
      { iso2: "BR", value: 1.802 },
      { iso2: "CA", value: 1.553 },
    ],
  },
  {
    year: 2020,
    entries: [
      { iso2: "US", value: 21.323 },
      { iso2: "CN", value: 14.688 },
      { iso2: "JP", value: 5.040 },
      { iso2: "DE", value: 3.843 },
      { iso2: "GB", value: 2.707 },
      { iso2: "IN", value: 2.668 },
      { iso2: "FR", value: 2.630 },
      { iso2: "IT", value: 1.889 },
      { iso2: "CA", value: 1.645 },
      { iso2: "KR", value: 1.638 },
    ],
  },
  {
    year: 2024,
    entries: [
      { iso2: "US", value: 28.781 },
      { iso2: "CN", value: 18.532 },
      { iso2: "DE", value: 4.591 },
      { iso2: "JP", value: 4.110 },
      { iso2: "IN", value: 3.937 },
      { iso2: "GB", value: 3.495 },
      { iso2: "FR", value: 3.131 },
      { iso2: "IT", value: 2.328 },
      { iso2: "CA", value: 2.214 },
      { iso2: "BR", value: 2.174 },
    ],
  },
];

export const race: RaceData = {
  title: "THE GREAT GDP RACE",
  subtitle: "TOP 10 ECONOMIES · 1960 → 2024",
  metricName: "NOMINAL GDP",
  unit: "T",
  source: "Source: World Bank, IMF · Nominal GDP, trillions USD",
  countries,
  years,
};

/* ──────────────────────────────────────────────────────────────────────────
 * Story moments
 * ────────────────────────────────────────────────────────────────────────── */

export type StoryMoment = {
  /** Year this story fires on — must match a `race.years[i].year`. */
  year: number;
  title: string;
  body: string;
  /** Optional accent color override; defaults to a neutral. */
  accent?: string;
};

/**
 * Story callouts that interrupt the race at dramatic historical moments.
 * Body text is intentionally punchy (≤ 12 words) so it reads in 2–3 s — the
 * callout only holds for ~8 s total, so wordier copy gets cut off.
 */
export const storyMoments: StoryMoment[] = [
  {
    year: 1980,
    title: "JAPAN OVERTAKES USSR",
    body: "#2 for the first time. The postwar miracle peaks.",
    accent: "#E11D48",
  },
  {
    year: 1995,
    title: "USSR DISSOLVES",
    body: "Russia's GDP falls 50%. Out of the top 10 for 30 years.",
    accent: "#DC2626",
  },
  {
    year: 2010,
    title: "CHINA PASSES JAPAN",
    body: "First time since 1968. Now #2 — and gaining.",
    accent: "#B91C1C",
  },
  {
    year: 2020,
    title: "PANDEMIC SHOCK",
    body: "Every G7 contracts. China is the only top-10 to grow.",
    accent: "#16A34A",
  },
];

/** Map yearIdx → story moment, computed once at load. */
export const storyByYearIdx = (() => {
  const m = new Map<number, StoryMoment>();
  for (const sm of storyMoments) {
    const idx = years.findIndex((y) => y.year === sm.year);
    if (idx >= 0) m.set(idx, sm);
  }
  return m;
})();

/* ──────────────────────────────────────────────────────────────────────────
 * Climbers / Fallers — analysis-scene data
 * ────────────────────────────────────────────────────────────────────────── */

export type Movement = {
  country: Country;
  fromRank: number;
  toRank: number;
  /** Positive = climbed; negative = fell (lower rank number is better). */
  delta: number;
  /** Year the country first appeared in the dataset. */
  firstYear: number;
};

const movements: Movement[] = (() => {
  const out: Movement[] = [];
  const finalSnap = years[years.length - 1];
  for (const c of countries) {
    let firstRank: number | undefined;
    let firstYear: number | undefined;
    for (const y of years) {
      const idx = y.entries.findIndex((e) => e.iso2 === c.iso2);
      if (idx >= 0) {
        firstRank = idx + 1;
        firstYear = y.year;
        break;
      }
    }
    if (firstRank === undefined || firstYear === undefined) continue;
    const finalIdx = finalSnap.entries.findIndex((e) => e.iso2 === c.iso2);
    const toRank = finalIdx >= 0 ? finalIdx + 1 : OFF_RANK;
    out.push({
      country: c,
      fromRank: firstRank,
      toRank,
      delta: firstRank - toRank,
      firstYear,
    });
  }
  return out;
})();

/** Top N climbers across the timeline (biggest improvement in rank). */
export const topClimbers = (n: number): Movement[] =>
  movements
    .filter((m) => m.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, n);

/** Top N fallers across the timeline (biggest drop in rank). */
export const topFallers = (n: number): Movement[] =>
  movements
    .filter((m) => m.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, n);

/** Lookup table for fast country resolution by iso2. */
const countryByIso = Object.fromEntries(countries.map((c) => [c.iso2, c]));

export const getCountry = (iso2: string): Country | undefined => countryByIso[iso2];

/**
 * Resolve a country's rank + value at a specific snapshot.
 * Returns rank = OFF_RANK if the country isn't in that snapshot's top-N.
 */
const stateInSnapshot = (
  iso2: string,
  snapshot: YearSnapshot,
): { rank: number; value: number } => {
  const idx = snapshot.entries.findIndex((e) => e.iso2 === iso2);
  if (idx === -1) return { rank: OFF_RANK, value: 0 };
  return { rank: idx + 1, value: snapshot.entries[idx].value };
};

/**
 * Interpolated country state at a point between two consecutive snapshots.
 *
 * @param yearIdx index of the "from" snapshot
 * @param t       progress 0 → 1 to the next snapshot (already eased by caller)
 * @param tLinear linear progress, used for value interpolation (smoother numbers
 *                than easing the value too)
 */
export const getCountryStateAt = (
  iso2: string,
  yearIdx: number,
  t: number,
  tLinear: number,
): { rank: number; value: number; opacity: number } => {
  const a = stateInSnapshot(iso2, race.years[yearIdx]);
  const b = race.years[yearIdx + 1]
    ? stateInSnapshot(iso2, race.years[yearIdx + 1])
    : a;

  const rank = a.rank + (b.rank - a.rank) * t;
  const value = a.value + (b.value - a.value) * tLinear;

  // Fade in/out across the bottom slot — a country crossing rank 10 → 11 fades
  // smoothly out (and vice versa). At rank OFF_RANK (11) opacity is exactly 0,
  // so countries parked off-screen never render as stray zero-value bars.
  const opacity = Math.max(0, Math.min(1, OFF_RANK - rank));

  return { rank, value, opacity };
};

/** Max value of all visible bars at this interpolated moment.
 *  Drives the bar width scale so the leader is always at 100%. */
export const getMaxValueAt = (
  yearIdx: number,
  t: number,
  tLinear: number,
): number => {
  let max = 0;
  for (const c of countries) {
    const s = getCountryStateAt(c.iso2, yearIdx, t, tLinear);
    if (s.rank < VISIBLE_BARS + 0.5 && s.value > max) max = s.value;
  }
  return max || 1;
};

/** The country currently in 1st place at this interpolated moment. */
export const getLeaderAt = (
  yearIdx: number,
  t: number,
  tLinear: number,
): Country | undefined => {
  let best: { c: Country; v: number } | undefined;
  for (const c of countries) {
    const s = getCountryStateAt(c.iso2, yearIdx, t, tLinear);
    if (!best || s.value > best.v) best = { c, v: s.value };
  }
  return best?.c;
};

/**
 * Compact value formatter — keeps numbers feeling alive across the full
 * dynamic range. For "T" (trillions) we adaptively show billions when
 * < 1T, because "543B" reads more kinetically than "0.54T" — the digits
 * actually move during interpolation instead of creeping in the second decimal.
 *
 * Examples:
 *   0.060T → "60B"      0.543T → "543B"     1.073T → "1.07T"
 *   5.963T → "5.96T"   28.781T → "28.8T"
 */
export const formatValue = (v: number, unit: string): string => {
  if (unit === "T") {
    if (v < 1) {
      const billions = v * 1000;
      return `${Math.round(billions)}B`;
    }
    if (v >= 10) return `${v.toFixed(1)}T`;
    return `${v.toFixed(2)}T`;
  }
  if (v >= 100) return `${Math.round(v)}${unit}`;
  if (v >= 10) return `${v.toFixed(1)}${unit}`;
  return `${v.toFixed(2)}${unit}`;
};

/** Interpolated display year between two snapshots — for the year ticker. */
export const yearAt = (yearIdx: number, t: number): number => {
  const a = race.years[yearIdx].year;
  const b = race.years[yearIdx + 1]?.year ?? a;
  return Math.round(a + (b - a) * t);
};
