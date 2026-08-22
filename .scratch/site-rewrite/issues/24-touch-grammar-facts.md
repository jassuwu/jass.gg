# The touch grammar facts

Type: research (AFK)
Status: in progress — research agent running, findings land in
[research/touch-grammar.md](../research/touch-grammar.md)
Blocks: 14 (the friend under a thumb, tap redesign)

## Question

What platform facts constrain a tap-driven act grammar on real phones?

1. **User activation** — which events legally start audio/media on iOS
   Safari and Android Chrome; whether one tap unlocks the page's audio for
   the visit; whether scroll or IntersectionObserver ever qualify (the old
   grammar assumed they could feed the sound bus — did that ever work?).
2. **Hover emulation on tap** — when mobile browsers synthesize
   pointerenter/:hover on tap (does a tap accidentally arm the dwell path?);
   the right capability query for "thumb-driven" (hover/any-hover/pointer).
3. **Affordance patterns** — how minimal text-first sites signal "this
   element performs" on touch without decoration; what the platform HIGs
   say about invisible gestures.
4. **Haptics** — navigator.vibrate support reality (iOS: none?).
5. **Navigate-vs-preview** — established tap-disambiguation patterns and
   why first-tap-hijacking is hated; the accessibility angle.
