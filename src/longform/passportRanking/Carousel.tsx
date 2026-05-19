import { useCurrentFrame, useVideoConfig } from "remotion";
import { Card } from "./Card";
import type { PassportEntry } from "./data";

const CARD_WIDTH = 400;
const CARD_GAP = 28;
const PITCH = CARD_WIDTH + CARD_GAP;

type Props = {
  entries: PassportEntry[];
  /** Frames per card slot (one full advance = one card moves through center). */
  framesPerCard: number;
  /** Frame at which carousel starts moving (after the hook). */
  startFrame: number;
};

/**
 * Horizontally scrolling stage of country cards.
 *
 * Motion is linear: at each frame the camera advances by
 *   pixelsPerFrame = PITCH / framesPerCard
 * Cards are positioned along the x-axis at i * PITCH and translated by
 * (-cameraOffset + canvasCenter), so card[i] sits exactly at screen center
 * when cameraOffset == i * PITCH.
 *
 * Only cards within ±4 slots of center are rendered visibly (the rest fade
 * out via the Card component's own distance-based opacity).
 */
export const Carousel: React.FC<Props> = ({ entries, framesPerCard, startFrame }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const elapsed = Math.max(0, frame - startFrame);
  const pixelsPerFrame = PITCH / framesPerCard;
  const cameraOffset = elapsed * pixelsPerFrame;

  const canvasCenter = width / 2;
  const cardCenter = (i: number) => i * PITCH + CARD_WIDTH / 2 - cameraOffset + (canvasCenter - CARD_WIDTH / 2);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {entries.map((entry, i) => {
        const center = cardCenter(i);
        const distance = center - canvasCenter;
        // Skip rendering cards that are far past either side — saves React
        // work when there are 100+ entries.
        if (Math.abs(distance) > width * 1.5) return null;
        return (
          <div
            key={`${entry.iso2}-${i}`}
            style={{
              position: "absolute",
              left: center - CARD_WIDTH / 2,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <Card
              entry={entry}
              distanceFromCenter={distance}
              width={CARD_WIDTH}
            />
          </div>
        );
      })}
    </div>
  );
};

export const CAROUSEL_PITCH = PITCH;
export const CAROUSEL_CARD_WIDTH = CARD_WIDTH;
