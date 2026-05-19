/**
 * YouTube Shorts + Facebook Reels overlay safe zones for a 1080×1920 canvas.
 *
 * Both platforms render UI chrome ON TOP of the video — anything important in
 * these zones gets covered (status bar, channel handle, like/comment/share
 * buttons, music label, description, captions toggle, etc.).
 *
 * Reference: YouTube Shorts overlay covers ~150-220px at the top and
 * ~480-540px at the bottom; Reels is similar but slightly less aggressive.
 * The right ~140px wide column on the bottom 2/3 is the action-button stack.
 *
 * All shorts using src/shorts/_engine/ components position their overlays
 * inside SAFE_TOP..SAFE_BOTTOM and SAFE_LEFT..SAFE_RIGHT.
 */

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

/** Top edge of the safe content area (px from top). Anything above this risks being covered. */
export const SAFE_TOP = 260;
/** Bottom edge of the safe content area (px from top). Anything below risks the description / action buttons. */
export const SAFE_BOTTOM = 1440;
/** Left margin to keep content away from the screen edge. */
export const SAFE_LEFT = 60;
/** Right margin — wider than left to give clearance to YouTube/FB action button column. */
export const SAFE_RIGHT = 160;

/** Distance from the bottom edge of the canvas to the safe-area floor. */
export const SAFE_BOTTOM_OFFSET = CANVAS_HEIGHT - SAFE_BOTTOM; // 480
