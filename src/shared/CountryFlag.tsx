import * as Flags from "country-flag-icons/react/3x2";

type Props = {
  iso2: string;
  height: number;
  radius?: number;
  shadow?: boolean;
};

/**
 * Single deduped flag component. Looks up by iso2 against the entire
 * country-flag-icons set (no per-short import list to maintain). Returns null
 * if the code is unknown.
 *
 * Defaults match the AtlasBrief engine (radius 6, shadow on). Pass radius={0}
 * to suppress rounding (e.g. when the flag is wrapped in its own bordered
 * card and the rounded corners would clip the border).
 */
export const CountryFlag: React.FC<Props> = ({
  iso2,
  height,
  radius = 6,
  shadow = true,
}) => {
  const Flag = (Flags as Record<string, React.FC<{ style?: React.CSSProperties }>>)[iso2];
  if (!Flag) return null;
  return (
    <div
      style={{
        height,
        width: height * 1.5,
        borderRadius: radius,
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: shadow ? "0 2px 8px rgba(0,0,0,0.35)" : "none",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <Flag style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
};
