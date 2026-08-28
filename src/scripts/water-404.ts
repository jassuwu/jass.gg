/**
 * THE WATER (ticket 23), part one: the fuse. The reader lands on the 404 and
 * nothing happens. A few seconds pass. Then the emoji in the joke line starts
 * to cry, and the page begins — slowly, over minutes — to fill with water.
 *
 * This file is only the delay. The physics, the canvas and the tears live
 * behind dynamic imports that are never even fetched unless the reader is
 * still here when the beat lands. Someone who bounces in three seconds pays
 * nothing for the flood they never saw.
 *
 * Two builds of the water exist. water-404-gl.ts is the real one — Evan
 * Wallace's WebGL heightfield, caustics and all. water-404-sim.ts is the
 * first build, a 2D-canvas spring chain, kept whole as the fallback for
 * machines without WebGL2 or float render targets. The GL module reports
 * whether it could boot; only a "no" fetches the fallback.
 *
 * (A fourth build on WebGPU compute shaders — real shallow-water equations
 * on vgpu — existed for one day, aug 28. jass looked at both and preferred
 * this one. The ticket keeps the record; the code does not.)
 *
 * Reduced motion: the fuse never lights. Rising water is nothing but motion —
 * there is no honest still form of a page filling up, so the still form is
 * the page, dry. Checked again at ignition in case the preference flipped
 * while we waited; both sims watch for a mid-flood flip and drain.
 *
 * /404#flood is the impatient path — for jass showing someone, and for
 * anyone who reads source: the same beat, just a short fuse. It pre-fills
 * nothing; the tank always starts dry, because the rise IS the bit.
 */

/** Long enough to read the joke; short enough that most readers are still
 * here when the crying starts. The beat, not a loading strategy. */
const FUSE_MS = 4500;

export function register(): void {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;
  const fallback = (): Promise<void> =>
    import("./water-404-sim").then((m) => m.start());
  window.setTimeout(
    () => {
      if (reduced.matches) return;
      /* A failed chunk load is a dry 404, which is just the 404. */
      import("./water-404-gl")
        .then((m) => {
          if (!m.start()) return fallback();
        })
        .catch(() => fallback().catch(() => {}));
    },
    location.hash === "#flood" ? 300 : FUSE_MS,
  );
}
