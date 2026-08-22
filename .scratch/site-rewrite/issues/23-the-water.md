# The water

Type: prototype (HITL)
Status: built (aug 15) — jass's follow-up directive honored: physics VENDORED, not invented. Hoffman's spring-column heightfield from the Tuts+ repo, BSD-2-Clause, attribution in the sim file. 4.5s fuse, tears via Range off the live emoji, asymptotic rise capped at min(420px, 45vh), foreground-derived tint, frame-budget guard sheds sim before frame rate. 1.9KB gzipped, zero assets. Awaiting jass's laugh.

## The idea, verbatim in spirit

On the 404, the 😔 in "(pls no one talks to me 😔)" starts crying — and the
page actually fills up with water. Real water, with the realest physics the
browser can carry. Absurdly high effort for something so off in a 404 page;
the effort IS the joke. (A transparent crying gif — anime girl or the emoji
itself — was floated as the crier; the emoji is already on the page and
already the page's one full accent, so it cries first unless jass says
otherwise.)

## The beat

Land on the 404. Nothing. A few seconds pass; the emoji tears up; drops
fall with gravity and splash. Water begins to accumulate from the bottom of
the viewport — a real simulated surface: waves, ripples, splashes where
drops land, ripples where the pointer touches it. It rises slowly. The page
stays fully usable the whole time: links clickable, text readable through
translucent water. If the brainrot monitor can bob when the level reaches
it, that is the funniest object on the site.

## Constraints

- WebGL (or equally fast) fluid — heightfield/shallow-water at minimum;
  this must FEEL like water, not like a blue div growing taller. 60fps on a
  laptop; degrade to nothing (never to jank).
- JS-off: today's 404, whole. Reduced motion: never starts.
- The joke line stays the page's accent; the water takes no accent color —
  water is water.
- Nothing is ever blocked: pointer-events pass through; the reader who
  ignores it entirely loses nothing.

## Done when

jass sees it and laughs, or kills it. There is no middle outcome for this
one.

## Audit findings (aug 22) — hardware manners

From [site-audit.md](../research/site-audit.md) §5–6: the adaptive-quality
and resize paths were never exercised off a 60Hz desktop.

1. Load-shedding reads wall-clock frame delta, so a 30Hz display counts
   every frame as slow — within ~8s the sim sheds to minimum and visibly
   flat-lines twice on healthy hardware. Budget against work done (or
   calibrate the threshold to the display's own refresh) instead.
2. `onResize` calls `rebuild()` undebounced, and iOS fires resize on
   URL-bar collapse — scrolling the 404 on a phone flat-lines the flood.
   Debounce, and preserve the surface across rebuilds.
3. `dpr` is captured once; zoom or a monitor move leaves the canvas blurry
   for the visit. Re-read it in `rebuild()`.
