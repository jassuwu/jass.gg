# The touch grammar facts

Type: research (AFK)
Status: resolved aug 22 — findings in
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

## Resolution

Every claim followed to the owning spec/vendor doc; full citations in the
research file. The constraints that bind the tap redesign:

1. **Audio starts only from the activation-trigger list** — on touch that is
   `pointerup`/`touchend`/`click`, **never `pointerdown`**, never scroll,
   never IntersectionObserver. Activation lands on the *up* event.
2. **Transient activation expires (~5s in Chromium)** — the gated call runs
   synchronously in the tap handler, not after an async load.
3. **One shared AudioContext resumed on first tap** is the cross-engine
   "one tap unlocks the visit" primitive (Web Audio gates on *sticky*
   activation). Safari unlocks media **elements** per-element — reuse one
   element and swap `src` if media elements ever join the bus.
4. **`pointerenter` fires on tap but `pointerleave` waits for finger-lift**
   (Pointer Events spec) — hover-dwell handlers on touch flash and reverse;
   a separate tap path is mandatory, not a nicety.
5. **`:hover` is sticky on touch in both engines** — every hover style must
   be safe frozen-on, or scoped inside `@media (hover: hover)`.
6. **Branch the grammar on `(hover: hover) and (pointer: fine)`** — iPads
   report `coarse`/`none` even with a trackpad attached (WebKit bug
   209292): iPad is touch, full stop.
7. **First-tap-reveal / second-tap-navigate is out** — it's a Safari-only
   heuristic side effect, absent in Chrome, and conflicts with WCAG 1.4.13.
   Preview and navigate must be *separate targets* (name navigates,
   description performs — the settled shape — is exactly this).
8. **Haptics are Android-only** (`navigator.vibrate`, itself
   activation-gated); iOS has nothing. Don't build on vibration.
9. **Long-press belongs to the OS** (iOS fires no `contextmenu` at all);
   the only discoverable gesture is plain tap with one consistent visible
   affordance, activating on the up-event (WCAG 2.5.2).

**Latent bug this surfaces:** `sound.ts` wakes on `pointerdown` — which on
touch grants *no* activation, and a scroll gesture ends in `pointercancel`
(no up), so the bus can hold a permanently-suspended context and play
silence into it. The wake must move to `pointerup`/`click`/`keydown` as
part of ticket 14.
