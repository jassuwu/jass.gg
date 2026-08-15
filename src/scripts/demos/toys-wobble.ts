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
 */

const reduced = matchMedia("(prefers-reduced-motion: reduce)");

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
  for (const ch of word) {
    const s = document.createElement("span");
    s.textContent = ch;
    s.setAttribute("aria-hidden", "true");
    /* transform-origin near the baseline so a letter pivots where it stands.
       touch-action spares a tap the double-tap-zoom wait without stealing
       the scroll; user-select keeps a fast run of pokes from becoming a text
       selection — prefixed twice for safari. */
    s.style.cssText =
      "display:inline-block;transform-origin:50% 85%;touch-action:manipulation;-webkit-user-select:none;user-select:none";
    const poke = (e: PointerEvent): void => {
      /* Checked again here, not just at register: a reader who asks for less
         motion mid-visit gets it, even with the letters already wrapped. */
      if (!reduced.matches) kick(s, e.clientX);
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
