import { brand } from "./theme";

type Props = {
  /** Mark bounding box (bars sit on the bottom edge). */
  width: number;
  height: number;
};

/**
 * The DataAtlas logo mark — four ascending bars with the tallest in amber-gold,
 * echoing the channel's ranking / comparison content (one bar always "wins").
 * Pure CSS, so it stays razor-crisp at any size and can never look muddy.
 */
export const BarMark: React.FC<Props> = ({ width, height }) => {
  const gap = width * 0.066;
  const barW = (width - 3 * gap) / 4;
  const radius = barW * 0.36;
  const heights = [0.44, 0.64, 0.82, 1.0];

  return (
    <div style={{ width, height, position: "relative" }}>
      {heights.map((h, i) => {
        const peak = i === 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i * (barW + gap),
              bottom: 0,
              width: barW,
              height: height * h,
              borderRadius: `${radius}px ${radius}px 0 0`,
              background: peak
                ? `linear-gradient(180deg, ${brand.amberBright} 0%, ${brand.amber} 100%)`
                : `linear-gradient(180deg, ${brand.white} 0%, ${brand.barLight} 100%)`,
              boxShadow: peak
                ? `0 0 ${width * 0.14}px rgba(245,158,11,0.8), 0 ${height * 0.035}px ${height * 0.07}px rgba(8,12,40,0.35)`
                : `0 ${height * 0.03}px ${height * 0.06}px rgba(8,12,40,0.3)`,
            }}
          />
        );
      })}
    </div>
  );
};
