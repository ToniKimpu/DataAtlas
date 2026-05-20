/**
 * Passport strength dataset — visa-free destinations per country.
 *
 * SOURCE: Henley Passport Index 2026 (https://www.henleyglobal.com/passport-index,
 *   cross-checked against the Wikipedia "Henley Passport Index" ranking table).
 *
 * IMPORTANT — rank/score consistency:
 *   In the Henley index a passport's rank is *derived* from its score, so the
 *   two always move together: a better rank never has a lower `visaFree`. The
 *   carousel reveals weakest → strongest, so the on-screen number must climb
 *   monotonically. Keep that invariant when swapping in new data — every entry
 *   below is ordered best-rank-first and its score is ≤ the entry above it.
 *
 * REFRESH: Henley republishes quarterly. Before publishing a new video re-pull
 *   the numbers (sources — Henley, Arton, Nomad Capitalist — differ slightly
 *   because they count visa-on-arrival differently; pick one and stay with it).
 *
 * This is a curated 100-country selection of the ~199 ranked passports — picked
 * for recognisability and an even spread across every tier. Ties are capped at
 * ~3–4 countries per score so the reveal never stalls on a long run of
 * identical cards.
 *
 * `accent` is an optional per-card glow override; when unset it is derived
 * from the rank tier (see `tierColor`).
 */

export type PassportEntry = {
  iso2: string;
  name: string;
  rank: number;
  visaFree: number;
  /** Optional accent override; defaults are derived from rank tier. */
  accent?: string;
};

/**
 * Tier color by rank — used as default accent when entry.accent is unset.
 * Chosen for the LIGHT theme: saturated but not neon, all readable on white
 * cards, and the bottom tier is rose (not pure red) so weak passports don't
 * read as a danger warning.
 */
export const tierColor = (rank: number): string => {
  if (rank <= 5)   return "#F59E0B"; // Gold — top tier, prestigious
  if (rank <= 15)  return "#2563EB"; // Royal blue — strong
  if (rank <= 30)  return "#14B8A6"; // Teal — mid-strong
  if (rank <= 50)  return "#8B5CF6"; // Violet — mid
  if (rank <= 70)  return "#F97316"; // Orange — weakening
  return "#E11D48";                   // Rose — weak passports (softer than pure red)
};

/**
 * Editorial tier name shown as a small tag on each card. Helps the viewer
 * instantly grasp "how good is this passport" without reading the number.
 */
export const tierLabel = (rank: number): string => {
  if (rank <= 5)   return "ELITE";
  if (rank <= 15)  return "PREMIUM";
  if (rank <= 30)  return "STRONG";
  if (rank <= 50)  return "MODERATE";
  if (rank <= 70)  return "WEAK";
  return "LIMITED";
};

/** The current top score in the dataset — used to scale the card progress bars. */
export const MAX_VISA_FREE = 192; // Singapore, rank 1 (Henley 2026)

/**
 * Henley Passport Index 2026 — curated 100-country selection, best rank first.
 * Score (visaFree) is non-increasing down the list, matching the real index.
 */
export const PASSPORTS: PassportEntry[] = [
  // ELITE — rank 1-5
  { iso2: "SG", name: "Singapore",   rank: 1,  visaFree: 192 },
  { iso2: "JP", name: "Japan",       rank: 2,  visaFree: 187 },
  { iso2: "KR", name: "South Korea", rank: 2,  visaFree: 187 },
  { iso2: "AE", name: "UAE",         rank: 2,  visaFree: 187 },
  { iso2: "SE", name: "Sweden",      rank: 3,  visaFree: 186 },
  { iso2: "FR", name: "France",      rank: 4,  visaFree: 185 },
  { iso2: "DE", name: "Germany",     rank: 4,  visaFree: 185 },
  { iso2: "IT", name: "Italy",       rank: 4,  visaFree: 185 },
  { iso2: "ES", name: "Spain",       rank: 4,  visaFree: 185 },
  { iso2: "AT", name: "Austria",     rank: 5,  visaFree: 184 },
  { iso2: "GR", name: "Greece",      rank: 5,  visaFree: 184 },
  { iso2: "PT", name: "Portugal",    rank: 5,  visaFree: 184 },

  // PREMIUM — rank 6-15
  { iso2: "GB", name: "UK",          rank: 6,  visaFree: 183 },
  { iso2: "HU", name: "Hungary",     rank: 6,  visaFree: 183 },
  { iso2: "MY", name: "Malaysia",    rank: 6,  visaFree: 183 },
  { iso2: "PL", name: "Poland",      rank: 6,  visaFree: 183 },
  { iso2: "AU", name: "Australia",   rank: 7,  visaFree: 182 },
  { iso2: "CA", name: "Canada",      rank: 7,  visaFree: 182 },
  { iso2: "CZ", name: "Czechia",     rank: 7,  visaFree: 182 },
  { iso2: "NZ", name: "New Zealand", rank: 7,  visaFree: 182 },
  { iso2: "HR", name: "Croatia",     rank: 8,  visaFree: 181 },
  { iso2: "EE", name: "Estonia",     rank: 8,  visaFree: 181 },
  { iso2: "LT", name: "Lithuania",   rank: 9,  visaFree: 180 },
  { iso2: "IS", name: "Iceland",     rank: 10, visaFree: 179 },
  { iso2: "US", name: "USA",         rank: 10, visaFree: 179 },
  { iso2: "BG", name: "Bulgaria",    rank: 11, visaFree: 177 },
  { iso2: "RO", name: "Romania",     rank: 11, visaFree: 177 },
  { iso2: "MC", name: "Monaco",      rank: 12, visaFree: 176 },
  { iso2: "CL", name: "Chile",       rank: 13, visaFree: 174 },
  { iso2: "CY", name: "Cyprus",      rank: 13, visaFree: 174 },
  { iso2: "HK", name: "Hong Kong",   rank: 13, visaFree: 174 },
  { iso2: "AR", name: "Argentina",   rank: 15, visaFree: 168 },
  { iso2: "BR", name: "Brazil",      rank: 15, visaFree: 168 },

  // STRONG — rank 16-30
  { iso2: "IL", name: "Israel",      rank: 16, visaFree: 166 },
  { iso2: "MX", name: "Mexico",      rank: 20, visaFree: 156 },
  { iso2: "UY", name: "Uruguay",     rank: 21, visaFree: 155 },
  { iso2: "VA", name: "Vatican",     rank: 23, visaFree: 151 },
  { iso2: "CR", name: "Costa Rica",  rank: 24, visaFree: 148 },
  { iso2: "PA", name: "Panama",      rank: 25, visaFree: 147 },
  { iso2: "PY", name: "Paraguay",    rank: 26, visaFree: 145 },
  { iso2: "UA", name: "Ukraine",     rank: 28, visaFree: 142 },
  { iso2: "PE", name: "Peru",        rank: 29, visaFree: 141 },
  { iso2: "RS", name: "Serbia",      rank: 30, visaFree: 135 },

  // MODERATE — rank 31-50
  { iso2: "TW", name: "Taiwan",      rank: 31, visaFree: 134 },
  { iso2: "GT", name: "Guatemala",   rank: 32, visaFree: 132 },
  { iso2: "SV", name: "El Salvador", rank: 33, visaFree: 131 },
  { iso2: "CO", name: "Colombia",    rank: 34, visaFree: 130 },
  { iso2: "HN", name: "Honduras",    rank: 35, visaFree: 129 },
  { iso2: "NI", name: "Nicaragua",   rank: 38, visaFree: 125 },
  { iso2: "AL", name: "Albania",     rank: 40, visaFree: 121 },
  { iso2: "GE", name: "Georgia",     rank: 41, visaFree: 120 },
  { iso2: "VE", name: "Venezuela",   rank: 43, visaFree: 116 },
  { iso2: "RU", name: "Russia",      rank: 44, visaFree: 113 },
  { iso2: "TR", name: "Turkey",      rank: 44, visaFree: 113 },
  { iso2: "QA", name: "Qatar",       rank: 45, visaFree: 111 },
  { iso2: "ZA", name: "S. Africa",   rank: 46, visaFree: 100 },
  { iso2: "KW", name: "Kuwait",      rank: 47, visaFree: 96 },
  { iso2: "EC", name: "Ecuador",     rank: 48, visaFree: 93 },
  { iso2: "MV", name: "Maldives",    rank: 49, visaFree: 92 },

  // WEAK — rank 51-70
  { iso2: "SA", name: "Saudi Arabia", rank: 51, visaFree: 87 },
  { iso2: "JM", name: "Jamaica",     rank: 53, visaFree: 85 },
  { iso2: "CN", name: "China",       rank: 55, visaFree: 82 },
  { iso2: "KZ", name: "Kazakhstan",  rank: 57, visaFree: 78 },
  { iso2: "BY", name: "Belarus",     rank: 58, visaFree: 77 },
  { iso2: "BO", name: "Bolivia",     rank: 58, visaFree: 77 },
  { iso2: "TH", name: "Thailand",    rank: 59, visaFree: 76 },
  { iso2: "MA", name: "Morocco",     rank: 63, visaFree: 71 },
  { iso2: "DO", name: "Dominican Rep.", rank: 63, visaFree: 71 },
  { iso2: "ID", name: "Indonesia",   rank: 64, visaFree: 70 },
  { iso2: "KE", name: "Kenya",       rank: 65, visaFree: 69 },
  { iso2: "GH", name: "Ghana",       rank: 67, visaFree: 67 },
  { iso2: "PH", name: "Philippines", rank: 69, visaFree: 65 },
  { iso2: "MN", name: "Mongolia",    rank: 70, visaFree: 64 },

  // LIMITED — rank 71+
  { iso2: "ZW", name: "Zimbabwe",    rank: 73, visaFree: 61 },
  { iso2: "UZ", name: "Uzbekistan",  rank: 74, visaFree: 59 },
  { iso2: "IN", name: "India",       rank: 77, visaFree: 56 },
  { iso2: "CU", name: "Cuba",        rank: 77, visaFree: 56 },
  { iso2: "DZ", name: "Algeria",     rank: 78, visaFree: 55 },
  { iso2: "EG", name: "Egypt",       rank: 84, visaFree: 49 },
  { iso2: "JO", name: "Jordan",      rank: 84, visaFree: 49 },
  { iso2: "VN", name: "Vietnam",     rank: 85, visaFree: 48 },
  { iso2: "KH", name: "Cambodia",    rank: 86, visaFree: 47 },
  { iso2: "LA", name: "Laos",        rank: 88, visaFree: 45 },
  { iso2: "NG", name: "Nigeria",     rank: 89, visaFree: 44 },
  { iso2: "LB", name: "Lebanon",     rank: 90, visaFree: 43 },
  { iso2: "ET", name: "Ethiopia",    rank: 91, visaFree: 42 },
  { iso2: "MM", name: "Myanmar",     rank: 91, visaFree: 42 },
  { iso2: "SD", name: "Sudan",       rank: 92, visaFree: 41 },
  { iso2: "LY", name: "Libya",       rank: 93, visaFree: 39 },
  { iso2: "LK", name: "Sri Lanka",   rank: 93, visaFree: 39 },
  { iso2: "IR", name: "Iran",        rank: 94, visaFree: 38 },
  { iso2: "BD", name: "Bangladesh",  rank: 95, visaFree: 36 },
  { iso2: "KP", name: "North Korea", rank: 96, visaFree: 35 },
  { iso2: "NP", name: "Nepal",       rank: 96, visaFree: 35 },
  { iso2: "SO", name: "Somalia",     rank: 97, visaFree: 32 },
  { iso2: "PK", name: "Pakistan",    rank: 98, visaFree: 31 },
  { iso2: "YE", name: "Yemen",       rank: 98, visaFree: 31 },
  { iso2: "IQ", name: "Iraq",        rank: 99, visaFree: 29 },
  { iso2: "SY", name: "Syria",       rank: 100, visaFree: 26 },
  { iso2: "AF", name: "Afghanistan", rank: 101, visaFree: 23 },
];

/** Strongest first (rank ascending) — used by the hook/closing reveals. */
export const PASSPORTS_BY_RANK = [...PASSPORTS].sort((a, b) => a.rank - b.rank);

/** Weakest first, strongest last — the carousel reveal order (build-up climax). */
export const PASSPORTS_REVEAL_ORDER = [...PASSPORTS].sort((a, b) => b.rank - a.rank);
