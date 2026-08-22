/**
 * THE LABEL IS A TOY (ticket 16). The section that announces play doesn't get
 * to sit there being furniture: poke a letter of "toys" and it swings on a
 * spring and settles. The word performing its own meaning, on the heading of
 * the section where everything else performs.
 *
 * This act binds pointer events directly instead of going through friend.ts,
 * and the departure needs defending: dwell is the grammar for bits the friend
 * does UNINVITED — the 500ms is what keeps an uninvited bit from being a
 * soundboard. A poke is the reader's own act, and a flick that answers half a
 * second late reads as broken, not considered. `deliberate()` is the right
 * spirit but the wrong shape — one handle, one act — and this is four handles
 * sharing one spring.
 *
 * The spring is a damped sine baked into WAAPI keyframes rather than a rAF
 * loop: exponential decay is literally how a spring settles, the browser
 * interpolates it off-thread, and the default fill of `none` means the moment
 * the animation ends the letter is byte-for-byte the element that never
 * moved. Nothing loops, nothing persists, re-poking forever costs nothing.
 *
 * At rest the wrapping must cost zero pixels. inline-block is safe here only
 * because overflow stays visible — clip an inline-block and its baseline
 * jumps from the text's baseline to the box's bottom margin edge — and the
 * face is a monospace, so splitting the run can't lose a kern. The h2 keeps
 * its accessible name via aria-label, the letter spans go aria-hidden, and
 * the :target stroke still paints on the h2 itself, underneath whichever
 * letters happen to be mid-swing.
 *
 * Reduced motion: a toy that is only motion has no honest still form — it is
 * not translated, it is absent. The module returns before touching the DOM.
 *
 * The sound (ticket 21): the label is also an instrument. Each letter is a
 * marimba bar — a poke strikes it at a whisper, synthesized through the bus,
 * zero assets. The pitch belongs to the letter, not to the poke, so poking
 * t-o-y-s left to right always plays the same four-note lick. The bus's one
 * mouth means a fast run damps each bar as the next is struck — which is what
 * a real marimba does under one pair of hands, so the rule and the material
 * agree for free. The sound rides the same guards as the swing: gated behind
 * the reader's first gesture by the bus, absent under reduced motion because
 * the whole act is.
 */

import { play } from "@/scripts/sound";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");

/* The voicing: C5, E5, D5, G5 — up a third, back a step, up a fourth. A lick,
   not a scale: no three neighbours in a row, and the contour turns. It sits in
   C major with no leading tone, so any partial poke order still lands as
   consonant, and the full run ends on the fifth — up, open, unresolved — the
   right cadence for a heading whose whole job is an invitation. */
const HZ = [523.25, 659.25, 587.33, 783.99];

/* A struck bar. The fundamental is a sine with a fast exponential decay —
   which is simply what a struck idiophone does — and a quieter second
   harmonic dies first, the brief wooden edge that says mallet, not beep.
   Peaks sum to 1 so the tier gain staged by the bus is the ceiling. */
function ding(i: number): void {
  const f = HZ[i % HZ.length];
  play({
    tier: "whisper",
    synth(ctx, out) {
      const t = ctx.currentTime;
      for (const [mult, peak, tail] of [
        [1, 0.85, 0.45],
        [2, 0.15, 0.12],
      ]) {
        const o = ctx.createOscillator();
        o.frequency.value = f * mult;
        const g = ctx.createGain();
        /* Exponential ramps can't touch zero; 1e-4 of a whisper is silence.
           The 4ms rise is only there so the strike doesn't click. */
        g.gain.setValueAtTime(1e-4, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
        g.gain.exponentialRampToValueAtTime(1e-4, t + tail);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + tail);
      }
    },
  });
}

/* Two and a half swings, decayed to nothing. The sine ends on a zero
   crossing, so the last keyframe is exactly the rest pose — no snap when
   `fill: none` hands the element back. */
function kick(el: HTMLElement, fromX: number): void {
  const box = el.getBoundingClientRect();
  /* Tip away from the side the poke came from — the physics people expect
     from a desk toy — and jitter the strength so no two pokes match. */
  const amp =
    (fromX < box.left + box.width / 2 ? 1 : -1) * (0.7 + Math.random() * 0.6);
  const frames: Keyframe[] = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const s = amp * Math.sin(5 * Math.PI * t) * Math.exp(-5 * t);
    frames.push({
      transform: `translateY(${(-3 * Math.abs(s)).toFixed(2)}px) rotate(${(16 * s).toFixed(2)}deg)`,
    });
  }
  for (const a of el.getAnimations()) a.cancel();
  el.animate(frames, { duration: 700, easing: "linear" });
}

export function register(): void {
  if (reduced.matches) return;
  const h2 = document.querySelector<HTMLElement>("#toys > h2");
  const word = h2?.textContent?.trim();
  if (!h2 || !word) return;
  h2.setAttribute("aria-label", word);
  h2.textContent = "";
  for (const [i, ch] of [...word].entries()) {
    const s = document.createElement("span");
    s.textContent = ch;
    s.setAttribute("aria-hidden", "true");
    /* transform-origin near the baseline so a letter pivots where it stands.
       touch-action spares a tap the double-tap-zoom wait without stealing
       the scroll; user-select keeps a fast run of pokes from becoming a text
       selection — prefixed twice for safari. */
    s.style.cssText =
      "display:inline-block;transform-origin:50% 85%;touch-action:manipulation;-webkit-user-select:none;user-select:none";
    let lastDing = 0;
    const poke = (e: PointerEvent): void => {
      /* Checked again here, not just at register: a reader who asks for less
         motion mid-visit gets it, even with the letters already wrapped. The
         note lives inside the same check — a dead act makes no sound. */
      if (!reduced.matches) {
        kick(s, e.clientX);
        /* A tap fires enter and down in the same instant; the kick dedupes
           itself (cancel + restart), the note did not — the second play()
           cut the first 0ms into its attack and the bar flammed. One strike
           per beat: the note debounces where the kick already does. */
        const now = performance.now();
        if (now - lastDing > 80) {
          lastDing = now;
          ding(i);
        }
      }
    };
    /* enter kicks on hover and on a touch's first contact; down lets a
       reader already parked on a letter poke it again. On a tap both fire in
       the same instant — the second cancels and restarts the first, one
       visible kick. */
    s.addEventListener("pointerenter", poke);
    s.addEventListener("pointerdown", poke);
    h2.append(s);
  }
}
