/**
 * Passport strength dataset — visa-free destinations per country.
 *
 * SOURCE: Henley Passport Index baseline (2024 snapshot).
 * REFRESH: The Henley index is republished quarterly. Before publishing a new
 *   video re-pull the numbers from https://www.henleyglobal.com/passport-index
 *   (or your preferred source — Arton, Nomad Capitalist, Passport Index all
 *   differ slightly because they measure visa-on-arrival differently).
 *
 * Entries are listed by rank ascending (best passport first). The carousel
 * reveals them in this order, so the climax is the country at the bottom of
 * this list. If you want WORST-first build-up to BEST, reverse() the array in
 * PassportRanking.tsx instead of re-sorting here.
 *
 * `accent` is the scene/card glow color. Default uses theme.accent but a few
 * standout tiers get distinguishing colors so the viewer feels the tier
 * changes pass by.
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

/** The current max visa-free score in the dataset — used for progress bars. */
export const MAX_VISA_FREE = Math.max(...[194, 194]); // top tier hardcoded for stability when data swaps

export const PASSPORTS: PassportEntry[] = [
  // Tier 1 — 194 visa-free
  { iso2: "FR", name: "France",      rank: 1, visaFree: 194 },
  { iso2: "DE", name: "Germany",     rank: 1, visaFree: 194 },
  { iso2: "IT", name: "Italy",       rank: 1, visaFree: 194 },
  { iso2: "JP", name: "Japan",       rank: 1, visaFree: 194 },
  { iso2: "SG", name: "Singapore",   rank: 1, visaFree: 194 },
  { iso2: "ES", name: "Spain",       rank: 1, visaFree: 194 },

  // Tier 2 — 193
  { iso2: "FI", name: "Finland",     rank: 2, visaFree: 193 },
  { iso2: "KR", name: "South Korea", rank: 2, visaFree: 193 },
  { iso2: "SE", name: "Sweden",      rank: 2, visaFree: 193 },

  // Tier 3 — 192
  { iso2: "AT", name: "Austria",     rank: 3, visaFree: 192 },
  { iso2: "DK", name: "Denmark",     rank: 3, visaFree: 192 },
  { iso2: "IE", name: "Ireland",     rank: 3, visaFree: 192 },
  { iso2: "NL", name: "Netherlands", rank: 3, visaFree: 192 },

  // Tier 4 — 191
  { iso2: "BE", name: "Belgium",     rank: 4, visaFree: 191 },
  { iso2: "LU", name: "Luxembourg",  rank: 4, visaFree: 191 },
  { iso2: "NO", name: "Norway",      rank: 4, visaFree: 191 },
  { iso2: "PT", name: "Portugal",    rank: 4, visaFree: 191 },
  { iso2: "GB", name: "UK",          rank: 4, visaFree: 191 },

  // Tier 5 — 190
  { iso2: "GR", name: "Greece",      rank: 5, visaFree: 190 },
  { iso2: "CH", name: "Switzerland", rank: 5, visaFree: 190 },

  // Tier 6 — 189
  { iso2: "AU", name: "Australia",   rank: 6, visaFree: 189 },
  { iso2: "CZ", name: "Czechia",     rank: 6, visaFree: 189 },
  { iso2: "MT", name: "Malta",       rank: 6, visaFree: 189 },
  { iso2: "NZ", name: "New Zealand", rank: 6, visaFree: 189 },
  { iso2: "PL", name: "Poland",      rank: 6, visaFree: 189 },

  // Tier 7 — 188
  { iso2: "CA", name: "Canada",      rank: 7, visaFree: 188 },
  { iso2: "HU", name: "Hungary",     rank: 7, visaFree: 188 },
  { iso2: "US", name: "USA",         rank: 7, visaFree: 188 },

  // Tier 8-9
  { iso2: "EE", name: "Estonia",     rank: 8, visaFree: 187 },
  { iso2: "LT", name: "Lithuania",   rank: 8, visaFree: 187 },
  { iso2: "LV", name: "Latvia",      rank: 9, visaFree: 186 },
  { iso2: "SK", name: "Slovakia",    rank: 9, visaFree: 186 },
  { iso2: "SI", name: "Slovenia",    rank: 9, visaFree: 186 },

  // Tier 10-14
  { iso2: "IS", name: "Iceland",     rank: 10, visaFree: 185 },
  { iso2: "AE", name: "UAE",         rank: 11, visaFree: 184 },
  { iso2: "HR", name: "Croatia",     rank: 12, visaFree: 175 },
  { iso2: "RO", name: "Romania",     rank: 13, visaFree: 173 },
  { iso2: "BG", name: "Bulgaria",    rank: 14, visaFree: 170 },
  { iso2: "CY", name: "Cyprus",      rank: 14, visaFree: 170 },

  // Mid-tier (15-30 range)
  { iso2: "LI", name: "Liechtenstein", rank: 15, visaFree: 169 },
  { iso2: "MC", name: "Monaco",      rank: 16, visaFree: 168 },
  { iso2: "AR", name: "Argentina",   rank: 17, visaFree: 162 },
  { iso2: "BR", name: "Brazil",      rank: 18, visaFree: 161 },
  { iso2: "HK", name: "Hong Kong",   rank: 19, visaFree: 158 },
  { iso2: "CL", name: "Chile",       rank: 20, visaFree: 157 },
  { iso2: "IL", name: "Israel",      rank: 21, visaFree: 156 },
  { iso2: "MX", name: "Mexico",      rank: 22, visaFree: 153 },
  { iso2: "VA", name: "Vatican",     rank: 23, visaFree: 150 },
  { iso2: "UY", name: "Uruguay",     rank: 24, visaFree: 148 },
  { iso2: "MY", name: "Malaysia",    rank: 25, visaFree: 146 },
  { iso2: "CR", name: "Costa Rica",  rank: 26, visaFree: 140 },
  { iso2: "AD", name: "Andorra",     rank: 27, visaFree: 168 },
  { iso2: "SM", name: "San Marino",  rank: 28, visaFree: 165 },
  { iso2: "TW", name: "Taiwan",      rank: 29, visaFree: 145 },

  // 30s-40s
  { iso2: "PA", name: "Panama",      rank: 31, visaFree: 142 },
  { iso2: "TR", name: "Turkey",      rank: 32, visaFree: 116 },
  { iso2: "VE", name: "Venezuela",   rank: 33, visaFree: 124 },
  { iso2: "PE", name: "Peru",        rank: 34, visaFree: 137 },
  { iso2: "RS", name: "Serbia",      rank: 35, visaFree: 137 },
  { iso2: "PY", name: "Paraguay",    rank: 36, visaFree: 142 },
  { iso2: "GT", name: "Guatemala",   rank: 37, visaFree: 133 },
  { iso2: "HN", name: "Honduras",    rank: 38, visaFree: 132 },
  { iso2: "SV", name: "El Salvador", rank: 39, visaFree: 134 },
  { iso2: "NI", name: "Nicaragua",   rank: 40, visaFree: 131 },

  // 40s-50s
  { iso2: "RU", name: "Russia",      rank: 45, visaFree: 119 },
  { iso2: "ZA", name: "S. Africa",   rank: 46, visaFree: 106 },
  { iso2: "GE", name: "Georgia",     rank: 47, visaFree: 78 },
  { iso2: "UA", name: "Ukraine",     rank: 48, visaFree: 148 },
  { iso2: "MD", name: "Moldova",     rank: 49, visaFree: 122 },
  { iso2: "AL", name: "Albania",     rank: 50, visaFree: 124 },
  { iso2: "TH", name: "Thailand",    rank: 51, visaFree: 82 },
  { iso2: "EC", name: "Ecuador",     rank: 52, visaFree: 95 },
  { iso2: "CO", name: "Colombia",    rank: 53, visaFree: 135 },
  { iso2: "BO", name: "Bolivia",     rank: 54, visaFree: 84 },

  // 60s-70s
  { iso2: "ID", name: "Indonesia",   rank: 65, visaFree: 78 },
  { iso2: "PH", name: "Philippines", rank: 66, visaFree: 67 },
  { iso2: "IN", name: "India",       rank: 80, visaFree: 62 },
  { iso2: "CN", name: "China",       rank: 67, visaFree: 85 },
  { iso2: "KZ", name: "Kazakhstan",  rank: 68, visaFree: 79 },
  { iso2: "MN", name: "Mongolia",    rank: 69, visaFree: 63 },
  { iso2: "MA", name: "Morocco",     rank: 70, visaFree: 67 },
  { iso2: "EG", name: "Egypt",       rank: 71, visaFree: 53 },
  { iso2: "KE", name: "Kenya",       rank: 72, visaFree: 76 },
  { iso2: "NG", name: "Nigeria",     rank: 90, visaFree: 46 },

  // 80s-90s
  { iso2: "VN", name: "Vietnam",     rank: 82, visaFree: 55 },
  { iso2: "DZ", name: "Algeria",     rank: 84, visaFree: 53 },
  { iso2: "ET", name: "Ethiopia",    rank: 85, visaFree: 44 },
  { iso2: "MM", name: "Myanmar",     rank: 86, visaFree: 48 },
  { iso2: "BD", name: "Bangladesh",  rank: 96, visaFree: 40 },
  { iso2: "LB", name: "Lebanon",     rank: 95, visaFree: 41 },
  { iso2: "LY", name: "Libya",       rank: 97, visaFree: 39 },
  { iso2: "IR", name: "Iran",        rank: 98, visaFree: 41 },
  { iso2: "SD", name: "Sudan",       rank: 99, visaFree: 42 },
  { iso2: "KP", name: "North Korea", rank: 100, visaFree: 39 },

  // Bottom tier
  { iso2: "PK", name: "Pakistan",    rank: 103, visaFree: 33 },
  { iso2: "SO", name: "Somalia",     rank: 102, visaFree: 34 },
  { iso2: "YE", name: "Yemen",       rank: 101, visaFree: 33 },
  { iso2: "IQ", name: "Iraq",        rank: 104, visaFree: 31 },
  { iso2: "SY", name: "Syria",       rank: 105, visaFree: 27 },
  { iso2: "AF", name: "Afghanistan", rank: 106, visaFree: 26 },
];

/** Most-to-least visa-free; the carousel reveals from least to most for the climax. */
export const PASSPORTS_BY_RANK = [...PASSPORTS].sort((a, b) => a.rank - b.rank);

/** Reverse: weakest first, strongest last (used for build-up reveal). */
export const PASSPORTS_REVEAL_ORDER = [...PASSPORTS].sort((a, b) => b.rank - a.rank);
