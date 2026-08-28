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

## Audit findings (aug 22) — hardware manners, FIXED same day

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

**Fix record (aug 22, this branch):** the slow threshold is calibrated to
the display's own cadence (median of the first 40 frames × 1.5) before
anything is judged; resize is debounced 200ms and split by axis — a
height-only change (the iOS URL bar) re-hangs the frame and keeps the
water, only a real width change rebuilds the columns; `dpr` is re-read on
every re-size. `bun run verify` green.

## Fourth build (aug 28) — compute shaders on vgpu — REVERTED same day

jass compared it against the third build and preferred the third: "that
looked so much better." Reverted in full — module deleted, vgpu removed
from package.json, fuse back to GL → 2D. The record below stands as what
was learned; the code is gone. The lesson for next time is that the
visuals were carried by the *rendering* (refraction, caustics, colour),
which both builds shared — and the fluid solver underneath, while more
correct, read as tamer on screen. Correctness was not the axis being
judged.

jass asked for "true compute-shader shit", so the heightfield is gone and
`water-404-wgpu.ts` solves the shallow-water equations on the GPU with an
actual velocity field:

    ∂v/∂t = −g ∇h + a        ∂h/∂t = −∇·((H + h) v)

Staggered — velocities, then heights from the divergence of the *updated*
velocities — two compute dispatches over ping-pong storage buffers, four
substeps a frame. What the heightfield could not do and this does: water
runs downhill and PILES UP on the low side of a tilted phone (the gyro is
now the `a` term in the momentum equation, not a drawn slope), waves carry
momentum, splashes push water outward, and the shake term is the real
coffee-cup effect. Spray became a GPU particle system — a storage buffer
integrated in compute, spawned GPU-side from a hash, one instanced draw,
4096 of them instead of 96. Evan Wallace's caustics and Fresnel shading
stay, and so does everything the third build earned (aqua, page
refraction, floating monitor, never pre-filled).

Runs on **vgpu** 0.3.1 (Vercel's WebGPU layer), chosen for WGSL reflection,
ping-pong storage and lazy pipelines. Cost is layered so nobody pays for
what they can't run: the 404's own script is 742 B and gates on
`navigator.gpu` *before* the import, so a non-WebGPU browser never fetches
vgpu at all. WebGPU → 9.6 KB + 56 KB vgpu, gzipped, 4.5s in. WebGL2 →
8.9 KB (`water-404-gl.ts`). Neither → 2 KB (the original 2D sim).

Three numerics bugs found and fixed by measurement, not by looking:
1. **CFL violation.** g=2600/H=34/2 substeps put a wave 2.5 cells per step;
   the explicit scheme needs <1. The field pinned to its clamps inside a
   second and every wave came out a square. Now g=300 with 4 substeps —
   0.42 cells per step. The stability product is documented at the
   constants; raising any of the three requires rechecking it.
2. **Mass created at the walls.** Differencing cell centres and letting the
   index clamp at the edges pumped volume in: the whole surface floated
   upward off nothing (+5px in 16s) until it parked on the clamp. Replaced
   with a conservative finite-volume face flux — identical from either
   side, zero through a wall. Mean now holds at −0.06 over 26s instead of
   climbing.
3. **Uniform overrun.** `array<vec4f, 8>` fed a flat `Float32Array(32)`
   made vgpu write 32 vectors and throw every frame; and splat impulses
   were being addressed in css px where the kernel wanted grid cells, so
   drop landings hit the wrong place entirely.

`/404#flood` exposes `window.__water` — `level`, `probes`, `step(n)`,
`poke(x,z,s)` — because verifying a GPU sim by squinting at it is
guesswork, and the preview harness fires no rAF at all. That hook is how
all three bugs above were caught, and it is absent without the hash.

## Third build (aug 22) — colour, refraction, playable — CURRENT (awaiting verify)

jass's verdict on the second build: "fucking worse." Specific complaints,
each fixed: (1) the #flood pre-fill made the tank start half full — the
pre-fill is gone, the beat always plays, and the rise TAU dropped 90→55 so
the water is playable inside ~15s; (2) no colour — the water is now a
scheme-aware aqua/cyan (deliberately not the lime; the accent stays
reserved) with depth gradient and white glints; (3) no refraction — the
page is now redrawn as a live replica (text runs measured off the real
DOM, the video blitted per frame) into a texture, and everything below
the waterline is that replica bent through the heightfield: wobble,
waterline lens squeeze, chromatic fringe, caustics as actual light, the
surface band reflecting the page above; (4) not playable — the pointer
now works anywhere in the water, wake scales with speed, fast drags throw
spray, clicking dumps a real splash. The monochrome-ink decision from the
first two builds is dead; jass overruled it in person.

**Gyro addendum (aug 22, jass's idea):** on mobile the tank is IN the
phone. The orientation sensor keeps the water level with the earth — tilt
the phone and the waterline tilts against the screen (tanh-capped near
±27°), with surge splats at the rising edge so it sloshes instead of
pivoting; the accelerometer churns the field on a shake (linear-accel
threshold, cooldown so it reads as waves). Landscape remapped via
screen.orientation. iOS sensors are permission-gated behind a gesture, so
the first tap asks once; denied degrades silently to the pointer toy.
Coarse-pointer devices only. The floating monitor tilts with the line.

## Second build (aug 22) — the water, but real (superseded same day)

jass's verdict on the first build: looks okay, and okay is not the spec.
New directive: steal from https://madebyevan.com/webgl-water/. So
`water-404-gl.ts` vendors Evan Wallace's WebGL Water (MIT, attribution in
file): his GPU heightfield kernel on ping-pong float textures (rings now
spread in 2D and bounce off the viewport walls), his caustics (refracted
surface mesh, brightness from triangle-area compression via derivatives —
projected onto the page as the tank's back wall, so light dances over the
drowned text), and his Fresnel + peaked-normal surface shading on a
perspective band above the waterline. The monitor now FLOATS when the
level reaches it — bobbing and tilting on the actual simulated surface
via an async one-frame-late height readback. Still monochrome ink, still
pointer-events: none, still no accent. The 2D sim is kept byte-for-byte
as the no-WebGL2 fallback; the fuse tries GL first. `/404#flood` is the
impatient path: short fuse, tank pre-filled. Two stability scars from the
build, both fixed: unbounded caustic projections (a steep facet refracts a
ray nearly horizontal → screen-filling triangles → GPU wedge) are now
clamped to a 160px deviation from the flat-water hit, and the sim kernel
gained a ±24px amplitude ceiling Evan's bounded pool never needed.
