/**
 * Light-theme palette for head-to-head. Mirrors passportRanking/palette.ts so
 * all longform compositions share the same surfaces / text / shadow tones.
 * Team colors come from the matchup's `left.color` / `right.color`, not from
 * this palette.
 *
 * If a third longform composition starts needing the same values, extract to
 * `src/longform/_shared/palette.ts`.
 */
export const palette = {
  bg:        "#F1F5F9",
  bgAlt:     "#FFFFFF",
  card:      "#FFFFFF",
  text:      "#0F172A",
  textSoft:  "#475569",
  textMuted: "#94A3B8",
  border:    "#E2E8F0",
  borderDeep:"#CBD5E1",
  shadow:    "rgba(15, 23, 42, 0.08)",
  shadowDeep:"rgba(15, 23, 42, 0.18)",
};
