import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { geoGraticule, geoMercator, geoPath } from "d3-geo";
import { countriesGeo, featureCode } from "../../shared/worldData";
import type { Camera, Scene } from "./types";
import { getHighlights, getSceneAt } from "./sceneHelpers";

const BASE_SCALE    = 170;
const LAND_BORDER   = "#0f1a2e";
const LAND_DEFAULT  = "#3d4a63";
const GRATICULE     = "rgba(140, 170, 210, 0.14)";
const BORDER_DASH   = 10000;
const BORDER_FRAMES = 38;
const PULSE_FRAMES  = 42;
const FONT_NAME     = 90;

const graticule = geoGraticule().step([20, 20])();

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const mixColor = (t: number, from: string, to: string): string => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${m.join(",")})`;
};

type Props = {
  width: number;
  height: number;
  camera: Camera;
  scenes: Scene[];
  /** Defs prefix to keep gradient IDs unique when multiple maps mount in one composition. */
  idPrefix?: string;
};

/**
 * Generic shorts world map. Identical visual language to the original
 * InternetWorldMap (ocean gradient, graticule, country highlights, pen-tool
 * border draw, pulse rings, outlined country name). Driven by the SCENES
 * array of whichever short is rendering it.
 */
export const ShortWorldMap: React.FC<Props> = ({
  width,
  height,
  camera,
  scenes,
  idPrefix = "short",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const projection = geoMercator()
    .rotate([-camera.lng, 0])
    .center([0, camera.lat])
    .scale(BASE_SCALE * camera.zoom)
    .translate([width / 2, height / 2]);
  const path = geoPath(projection);

  const highlights    = getHighlights(scenes, frame);
  const scene         = getSceneAt(scenes, frame);
  const withinScene   = frame - scene.startFrame;
  const framesLeft    = scene.endFrame - frame;
  const sceneDuration = scene.endFrame - scene.startFrame;
  const arriveOffset  = Math.floor(sceneDuration * 0.3);
  const afterArrive   = withinScene - arriveOffset;

  // Ocean darkens with zoom so country fills pop
  const oceanDark = interpolate(camera.zoom, [1, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const oceanCenter = mixColor(oceanDark, "#1a3254", "#07101e");
  const oceanMid    = mixColor(oceanDark, "#0e1c34", "#030c18");
  const oceanEdge   = mixColor(oceanDark, "#04091a", "#01040c");

  const countryPulse = 0.82 + 0.18 * Math.sin(frame * 0.12);

  const labelEnter = spring({
    frame: afterArrive,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 20,
    config: { damping: 14 },
  });
  const labelExit = interpolate(framesLeft, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelOpacity = labelEnter * labelExit;
  const labelScale   = 0.7 + 0.3 * labelEnter;
  const showLabel    = !!(scene.countryName && scene.isoNumerics.length === 1 && labelOpacity > 0);

  const drawT = interpolate(afterArrive, [0, BORDER_FRAMES], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let activeBorderPath: string | null = null;
  if (showLabel) {
    // Prefer ISO-numeric matching; fall back to feature.properties.name for
    // unrecognized states (Kosovo, Somaliland, N. Cyprus) that lack an id.
    const code    = parseInt(scene.isoNumerics[0] ?? "", 10);
    const fallbackName = scene.featureNames?.[0];
    const feature = countriesGeo.features.find((f) => {
      if (Number.isFinite(code) && featureCode(f) === code) return true;
      const name = (f.properties as { name?: string } | null)?.name;
      return !!fallbackName && name === fallbackName;
    });
    if (feature) activeBorderPath = path(feature) ?? null;
  }

  const graticulePath = path(graticule);
  const oceanId    = `${idPrefix}-ocean`;
  const vignetteId = `${idPrefix}-vignette`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id={oceanId} cx="50%" cy="50%" r="78%">
          <stop offset="0%"   stopColor={oceanCenter} />
          <stop offset="75%"  stopColor={oceanMid} />
          <stop offset="100%" stopColor={oceanEdge} />
        </radialGradient>
        <radialGradient id={vignetteId} cx="50%" cy="50%" r="72%">
          <stop offset="55%"  stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.65" />
        </radialGradient>
      </defs>

      {/* Ocean */}
      <rect width={width} height={height} fill={`url(#${oceanId})`} />

      {/* Graticule */}
      {graticulePath && (
        <path d={graticulePath} fill="none" stroke={GRATICULE} strokeWidth={0.5} />
      )}

      {/* Countries */}
      {countriesGeo.features.map((f, i) => {
        const code = String(featureCode(f));
        const name = (f.properties as { name?: string } | null)?.name;
        // Try id first; fall back to feature name for ID-less states.
        const highlight =
          highlights.byCode.get(code) ??
          (name ? highlights.byName.get(name) : undefined);
        const d = path(f);
        if (!d) return null;

        if (!highlight) {
          return (
            <path key={i} d={d} fill={LAND_DEFAULT} stroke={LAND_BORDER} strokeWidth={0.7} />
          );
        }

        const mixT       = highlight.isActive ? countryPulse : 0.45;
        const fill       = mixColor(mixT, LAND_DEFAULT, highlight.color);
        const glowFilter = highlight.isActive
          ? `drop-shadow(0 0 12px ${highlight.color}aa)`
          : "none";

        return (
          <path
            key={i}
            d={d}
            fill={fill}
            stroke={highlight.isActive ? highlight.color : LAND_BORDER}
            strokeWidth={highlight.isActive ? 2 : 0.9}
            style={{ filter: glowFilter }}
          />
        );
      })}

      {/* Arrival pulse rings */}
      {showLabel && [0, 1, 2].map((i) => {
        const pT = interpolate(afterArrive - i * 10, [0, PULSE_FRAMES], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (pT <= 0 || pT >= 1) return null;
        return (
          <circle
            key={i}
            cx={width / 2}
            cy={height / 2}
            r={pT * 300}
            fill="none"
            stroke={scene.color}
            strokeWidth={4 * (1 - pT)}
            opacity={(1 - pT) * 0.55}
          />
        );
      })}

      {/* Pen-tool border draw on active country */}
      {activeBorderPath && drawT > 0 && (
        <path
          d={activeBorderPath}
          fill="none"
          stroke={scene.color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={BORDER_DASH}
          strokeDashoffset={BORDER_DASH * (1 - drawT)}
          style={{ filter: `drop-shadow(0 0 10px ${scene.color})` }}
        />
      )}

      {/* Country name — outlined text. Positioned at y≈760 (height/2 - 200)
          so it sits below the FlagBadge (y≈560) and above CompanyIcons (y≈900),
          with all three inside the YouTube/FB safe zone. */}
      {showLabel && (() => {
        const cx    = width / 2;
        const nameY = height / 2 - 200;
        return (
          <g
            opacity={labelOpacity}
            transform={`translate(${cx},${nameY}) scale(${labelScale}) translate(${-cx},${-nameY})`}
          >
            <text
              x={cx} y={nameY}
              textAnchor="middle" dominantBaseline="central"
              fill="none" stroke="rgba(0,0,0,0.92)" strokeWidth={18}
              strokeLinejoin="round"
              fontSize={FONT_NAME} fontWeight="900"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              {scene.countryName}
            </text>
            <text
              x={cx} y={nameY}
              textAnchor="middle" dominantBaseline="central"
              fill="#FFFFFF"
              fontSize={FONT_NAME} fontWeight="900"
              fontFamily="Arial Black, Impact, sans-serif"
            >
              {scene.countryName}
            </text>
          </g>
        );
      })()}

      {/* Vignette */}
      <rect width={width} height={height} fill={`url(#${vignetteId})`} pointerEvents="none" />
    </svg>
  );
};
