# The phone column

Type: prototype (HITL)
Status: open
Blocked by: nothing — buildable now (static layout; independent of the tap
grammar)

## Question

The static page at 390px is *fine* — no overflow, the closer wraps as a
unit, 18px holds — but fine was the bar the desktop page cleared before the
detail passes. What does **considered** look like at phone width?

- **Tap targets**: entry links measure ~23px tall. Padded hit areas
  (`::after` box, no visual change) for links — and for whatever the tap
  grammar makes of descriptions — without opening the leading.
- **The wordmark's scale** on a 390px column — display-size on desktop; is
  it still the one oversized thing, or merely big?
- **Spacing audit**: section gaps, scroll-margins and the anchor
  experience, the footer's position on a short viewport.
- **Anything the phone reveals**: this is the "look at the real page and
  add only where it's dead" pass (ticket 04's method) run at 390px.

Judged by jass on his phone, same bar as ticket 08: stops drawing
objections.
