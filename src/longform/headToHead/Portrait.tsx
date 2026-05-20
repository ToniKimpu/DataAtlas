import { Img, staticFile } from "remotion";
import { CountryFlag } from "../../shared/CountryFlag";
import type { Country } from "./data";

type Props = {
  country: Country;
  width: number;
  height: number;
  radius?: number;
  /** Team-color scrim fading up from the bottom — for cohesion / text legibility. */
  scrim?: boolean;
};

/**
 * Competitor portrait — renders `country.photo` (a leader/representative image
 * in `public/`) when present, otherwise falls back to the country flag. The
 * photo is cropped with `object-fit: cover` + the per-country `photoFocus` so
 * the subject's face stays framed regardless of the box aspect ratio.
 */
export const Portrait: React.FC<Props> = ({
  country,
  width,
  height,
  radius = 16,
  scrim = false,
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        overflow: "hidden",
        position: "relative",
        background: "#FFFFFF",
        flexShrink: 0,
      }}
    >
      {country.photo ? (
        <Img
          src={staticFile(country.photo)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: country.photoFocus ?? "50% 20%",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CountryFlag iso2={country.iso2} height={height} radius={0} shadow={false} />
        </div>
      )}

      {scrim && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "46%",
            background: `linear-gradient(180deg, ${country.color}00 0%, ${country.color}D9 100%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
