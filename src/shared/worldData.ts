import worldRaw from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";

const topology = worldRaw as unknown as Topology<{
  countries: GeometryCollection;
}>;

export const countriesGeo = feature(
  topology,
  topology.objects.countries,
) as FeatureCollection<Geometry, { name: string }>;

export type CountryFeature = Feature<Geometry, { name: string }>;

export const featureCode = (f: CountryFeature): number =>
  parseInt(String(f.id ?? "0"), 10);
