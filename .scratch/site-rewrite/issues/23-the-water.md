# The water

Type: prototype (HITL)
Status: open — jass's idea, his words: "i really love this"

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
