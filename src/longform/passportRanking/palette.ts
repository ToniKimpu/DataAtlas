/**
 * Light-theme palette for the passport ranking longform.
 *
 * Kept local to this composition (not in shared/theme.ts) because the shorts
 * engine is dark-themed and that's intentional — verticals on phones look
 * better with deep backgrounds, longform on TV/desktop screens reads better
 * light. Don't unify these.
 */

export const palette = {
  // Page surfaces
  bg:       "#F1F5F9",   // soft slate — page background
  bgAlt:    "#FFFFFF",   // pure white — used for decorative bands
  card:     "#FFFFFF",   // card surface

  // Text
  text:     "#0F172A",   // primary dark
  textSoft: "#475569",   // body/secondary
  textMuted:"#94A3B8",   // labels, footers

  // Lines & shadows
  border:    "#E2E8F0",
  borderDeep:"#CBD5E1",
  shadow:    "rgba(15, 23, 42, 0.08)",
  shadowDeep:"rgba(15, 23, 42, 0.18)",

  // Brand accent for chrome (top bar badge etc.)
  brand:     "#2563EB",
  brandSoft: "#DBEAFE",
};
