import { Easing } from "remotion";
import type { Camera, Scene } from "./types";

/**
 * Generic camera keyframe builder for shorts.
 *
 * Each scene gets two keyframes:
 *   - "arrive at" frame (~30% into the scene) — locks the camera at scene.camera
 *   - "depart at" frame (5 frames before scene end) — holds, then next scene's
 *     arrival smoothly interpolates from this position
 *
 * The result is a slow zoom into each country, hold, then transit to the next.
 */
export type Keyframe = { frame: number } & Camera;

/**
 * Build keyframes for a sequence of scenes. The first keyframe (frame 0) opens
 * way zoomed-out so the hook scene gets a dramatic punch-in.
 */
export const buildKeyframes = (
  scenes: Scene[],
  openCamera: Camera = { lng: 10, lat: 20, zoom: 0.28 },
): Keyframe[] => {
  const kfs: Keyframe[] = [{ frame: 0, ...openCamera }];

  for (const scene of scenes) {
    const duration = scene.endFrame - scene.startFrame;
    const arriveAt = scene.startFrame + Math.floor(duration * 0.3);
    kfs.push({ frame: arriveAt, ...scene.camera });
    kfs.push({ frame: Math.max(arriveAt + 1, scene.endFrame - 5), ...scene.camera });
  }

  return kfs;
};

const ease = Easing.inOut(Easing.cubic);

const shortestLngDelta = (fromLng: number, toLng: number): number => {
  let d = toLng - fromLng;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
};

export const getCameraAtFrame = (frame: number, keyframes: Keyframe[]): Camera => {
  if (keyframes.length === 0) return { lng: 0, lat: 0, zoom: 1 };
  if (frame <= keyframes[0].frame) {
    const { lng, lat, zoom } = keyframes[0];
    return { lng, lat, zoom };
  }
  const last = keyframes[keyframes.length - 1];
  if (frame >= last.frame) return { lng: last.lng, lat: last.lat, zoom: last.zoom };

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      if (a.frame === b.frame) return { lng: a.lng, lat: a.lat, zoom: a.zoom };
      const tLinear = (frame - a.frame) / (b.frame - a.frame);
      const t = ease(tLinear);
      const dLng = shortestLngDelta(a.lng, b.lng);
      return {
        lng: a.lng + dLng * t,
        lat: a.lat + (b.lat - a.lat) * t,
        zoom: a.zoom + (b.zoom - a.zoom) * t,
      };
    }
  }
  return { lng: last.lng, lat: last.lat, zoom: last.zoom };
};
