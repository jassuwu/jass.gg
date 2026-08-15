/**
 * THE WATER (ticket 23), part one: the fuse. The reader lands on the 404 and
 * nothing happens. A few seconds pass. Then the emoji in the joke line starts
 * to cry, and the page begins — slowly, over minutes — to fill with water.
 *
 * This file is only the delay. The physics, the canvas and the tears live in
 * water-404-sim.ts, behind a dynamic import that is never even fetched unless
 * the reader is still here when the beat lands. Someone who bounces in three
 * seconds pays nothing for the flood they never saw.
 *
 * Reduced motion: the fuse never lights. Rising water is nothing but motion —
 * there is no honest still form of a page filling up, so the still form is
 * the page, dry. Checked again at ignition in case the preference flipped
 * while we waited; the sim itself watches for a mid-flood flip and drains.
 */

/** Long enough to read the joke; short enough that most readers are still
 * here when the crying starts. The beat, not a loading strategy. */
const FUSE_MS = 4500;

export function register(): void {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;
  window.setTimeout(() => {
    if (reduced.matches) return;
    /* A failed chunk load is a dry 404, which is just the 404. */
    import("./water-404-sim").then((m) => m.start()).catch(() => {});
  }, FUSE_MS);
}
