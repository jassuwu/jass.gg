# The signature signs itself

Type: prototype (HITL)
Status: open
Blocked by: nothing — buildable now

## Question

Does a self-drawing wordmark read as a signature being signed, or as an intro
animation? Only the first ships.

## Why this exists

The hand font exists because a name in a hand font is a signature — and a
signature is an act, not a glyph. Drawing the strokes of `jass` in on load is
that idea completed. It is also the one detail visible in the first second of
a visit, which is the direct answer to the dead-screenshot problem: the page's
first impression stops being static without gaining any decoration at rest.

## Constraints

- **Once, on load, fast.** ~600ms feels like a pen; 2s feels like a loading
  screen. Measure, don't guess.
- **Reduced motion gets the finished signature instantly.** The name is
  content; the signing is the bonus.
- **The letterforms are Excalifont's own** — trace the four glyphs to SVG
  paths and animate stroke-dashoffset. A different hand drawing his name is a
  forgery.
- **JS-off gets the finished signature** (static SVG or the current text).
  The friend rule: JS only adds.
- **No layout shift.** The signed and unsigned states occupy identical space.
- Open sub-question for jass on screen: does hovering the wordmark re-sign
  it? The "no hover choreography" precedent was about links; the wordmark
  isn't one. Judge it built, not argued.

## Done when

jass has seen it on the real page at both widths and either killed it or kept
it.
