/**
 * Head-to-head matchup dataset.
 *
 * To produce a new head-to-head video: swap `matchup` below with a new pairing
 * and metric list. Keep `metrics.length` between 8 and 14 — fewer and the
 * video feels thin, more and viewer attention drops before the closing.
 *
 * `winnerRule` defaults to "higher" (bigger value wins). Set to "lower" for
 * metrics where less is better (poverty rate, infant mortality, median age
 * if you frame it as "younger = demographic edge", etc.).
 */

export type Country = {
  iso2: string;
  name: string;
  /** Team color — used for flag border, value text, winner badge, glow. */
  color: string;
  /**
   * Optional portrait image filename in `public/` (e.g. a leader photo).
   * When unset the flag is used instead, so matchups without a good photo
   * still render cleanly. Licensing is the data author's responsibility —
   * use public-domain / Creative-Commons images only.
   */
  photo?: string;
  /** CSS object-position for the portrait crop. Defaults to "50% 20%". */
  photoFocus?: string;
};

export type Category =
  | "ECONOMY"
  | "MILITARY"
  | "TECH"
  | "INFRASTRUCTURE"
  | "DEMOGRAPHIC"
  | "SPORT";

/** Accent color for each metric category — shown as the small pill above each
 *  metric label, and as the cell border in the closing results grid. */
export const categoryColor: Record<Category, string> = {
  ECONOMY:        "#10B981", // emerald
  MILITARY:       "#DC2626", // crimson
  TECH:           "#6366F1", // indigo
  INFRASTRUCTURE: "#F59E0B", // amber
  DEMOGRAPHIC:    "#14B8A6", // teal
  SPORT:          "#A855F7", // purple
};

export type Metric = {
  label: string;
  category: Category;
  /** Optional unit suffix shown alongside the number ("T", "B", "M", "K", "%"). */
  unit?: string;
  leftVal: number;
  rightVal: number;
  winnerRule?: "higher" | "lower";
  /** Optional one-line context shown small under the values. */
  note?: string;
};

export type Matchup = {
  title: string;
  subtitle: string;
  left: Country;
  right: Country;
  metrics: Metric[];
};

export const matchup: Matchup = {
  title: "USA vs CHINA",
  subtitle: "2024 GLOBAL POWER COMPARISON",
  // Leader portraits — Trump: US-gov public domain (White House, 2025).
  // Xi: CC BY 4.0, Kremlin.ru (Press Service of the President of Russia).
  left:  { iso2: "US", name: "UNITED STATES", color: "#2563EB", photo: "trump.jpg", photoFocus: "50% 20%" },
  right: { iso2: "CN", name: "CHINA",         color: "#E11D48", photo: "xi.jpg",    photoFocus: "50% 9%" },
  // Order alternates winners deliberately — wins should ping-pong across the
  // video so the live scoreboard stays tense. Final score: CHN 8, USA 7, tie 1.
  metrics: [
    { label: "GDP (NOMINAL)",         category: "ECONOMY",        unit: "T",  leftVal: 27.4,  rightVal: 17.7,  note: "Trillions of USD" },
    { label: "POPULATION",            category: "DEMOGRAPHIC",    unit: "M",  leftVal: 334,   rightVal: 1410,  note: "Millions of people" },
    { label: "MILITARY BUDGET",       category: "MILITARY",       unit: "B",  leftVal: 916,   rightVal: 296,   note: "Billions of USD" },
    { label: "ACTIVE MILITARY",       category: "MILITARY",       unit: "K",  leftVal: 1390,  rightVal: 2035,  note: "Personnel, thousands" },
    { label: "FOREIGN RESERVES",      category: "ECONOMY",        unit: "B",  leftVal: 242,   rightVal: 3200,  note: "Billions of USD held by central bank" },
    { label: "NUCLEAR WARHEADS",      category: "MILITARY",       unit: "",   leftVal: 5044,  rightVal: 500 },
    { label: "HIGH-SPEED RAIL",       category: "INFRASTRUCTURE", unit: "K",  leftVal: 0.7,   rightVal: 45,    note: "Thousands of km of track" },
    { label: "AIRCRAFT CARRIERS",     category: "MILITARY",       unit: "",   leftVal: 11,    rightVal: 3 },
    { label: "OLYMPIC GOLD MEDALS",   category: "SPORT",          unit: "",   leftVal: 40,    rightVal: 40,    note: "Paris 2024 — first-place ties remain unbroken" },
    { label: "PATENTS GRANTED",       category: "TECH",           unit: "K",  leftVal: 323,   rightVal: 798,   note: "Thousands per year" },
    { label: "BILLIONAIRES",          category: "ECONOMY",        unit: "",   leftVal: 813,   rightVal: 473 },
    { label: "INTERNET USERS",        category: "TECH",           unit: "M",  leftVal: 331,   rightVal: 1067,  note: "Millions of people online" },
    { label: "FORTUNE 500 COMPANIES", category: "ECONOMY",        unit: "",   leftVal: 139,   rightVal: 135 },
    { label: "5G BASE STATIONS",      category: "INFRASTRUCTURE", unit: "K",  leftVal: 100,   rightVal: 3370,  note: "Thousands deployed" },
    { label: "EXPORTS",               category: "ECONOMY",        unit: "T",  leftVal: 2.0,   rightVal: 3.4,   note: "Trillions of USD" },
    { label: "MEDIAN AGE",            category: "DEMOGRAPHIC",    unit: "yr", leftVal: 38.5,  rightVal: 39.0,  winnerRule: "lower", note: "Younger population = demographic edge" },
  ],
};

export const winnerOf = (m: Metric): "left" | "right" | "tie" => {
  if (m.leftVal === m.rightVal) return "tie";
  const rule = m.winnerRule ?? "higher";
  if (rule === "higher") return m.leftVal > m.rightVal ? "left" : "right";
  return m.leftVal < m.rightVal ? "left" : "right";
};

/** Cumulative score after the first N metrics — drives the live scoreboard. */
export const scoreAfter = (m: Matchup, count: number) => {
  let left = 0;
  let right = 0;
  for (let i = 0; i < Math.min(count, m.metrics.length); i++) {
    const w = winnerOf(m.metrics[i]);
    if (w === "left") left++;
    else if (w === "right") right++;
  }
  return { left, right };
};

/** Format a metric value for on-screen display (compact, max 1 decimal). */
export const formatValue = (v: number): string => {
  if (v >= 1000 && Number.isInteger(v)) return v.toLocaleString("en-US");
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
};

/**
 * One-line "aftermath" caption shown after the WINNER badge — gives the
 * viewer a contextual gut-check of the margin so the metric earns its 6 sec
 * of attention. Phrasing adapts to scale and to lower-is-better metrics.
 */
export const aftermathText = (m: Metric): string => {
  const w = winnerOf(m);
  if (w === "tie") return "DEAD HEAT";

  const [hi, lo] = m.leftVal > m.rightVal ? [m.leftVal, m.rightVal] : [m.rightVal, m.leftVal];
  const rule = m.winnerRule ?? "higher";

  if (rule === "lower") {
    const diff = hi - lo;
    return `LOWER BY ${formatValue(diff)}${m.unit ?? ""}`;
  }

  if (lo === 0) return "AN UNMATCHED LEAD";
  const ratio = hi / lo;
  if (ratio >= 10) return `${ratio.toFixed(1)}× THE SCALE`;
  if (ratio >= 2)  return `${ratio.toFixed(1)}× LARGER`;
  if (ratio >= 1.2) return `${Math.round((ratio - 1) * 100)}% BIGGER`;
  const diff = hi - lo;
  return `AHEAD BY ${formatValue(diff)}${m.unit ?? ""}`;
};
