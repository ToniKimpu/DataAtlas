import type { Scene } from "./types";

/** Find the scene that contains the given frame, or the last scene if past the end. */
export const getSceneAt = (scenes: Scene[], frame: number): Scene =>
  scenes.find((s) => frame >= s.startFrame && frame < s.endFrame) ??
  scenes[scenes.length - 1];

export type HighlightInfo = { color: string; isActive: boolean };

export type Highlights = {
  /** Highlights keyed by feature.id (numeric ISO as string). */
  byCode: Map<string, HighlightInfo>;
  /** Fallback for features without an id (Kosovo, Somaliland, N. Cyprus). */
  byName: Map<string, HighlightInfo>;
};

/**
 * Build the highlight map for the current frame. Past scenes stay highlighted
 * at lower intensity; the current scene's countries are marked active (full
 * glow + bright fill). Both ISO-numeric and name-based matchers are populated
 * so ShortWorldMap can resolve every feature regardless of whether it has an
 * id in the topology.
 */
export const getHighlights = (scenes: Scene[], frame: number): Highlights => {
  const byCode = new Map<string, HighlightInfo>();
  const byName = new Map<string, HighlightInfo>();
  const current = getSceneAt(scenes, frame);
  const closingId = scenes[scenes.length - 1]?.id;

  for (const scene of scenes) {
    if (frame < scene.startFrame) continue;
    const isActive = current.id === scene.id || current.id === closingId;
    const info: HighlightInfo = { color: scene.color, isActive };
    scene.isoNumerics.forEach((code) => byCode.set(code, info));
    scene.featureNames?.forEach((name) => byName.set(name, info));
  }

  return { byCode, byName };
};
