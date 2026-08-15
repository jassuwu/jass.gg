/**
 * THE SENTENCE FINISHES ITSELF (jass's ask: "anything to match this in the
 * homepage? for the '(i'm just trying to find my people)' part?").
 *
 * The closer's whole design (see src/intro.ts) is that it needs no call to
 * action because the six links beneath it ARE the mechanism. This makes that
 * argument visible, once, to whoever leans in close enough to read the
 * murmur: dwell on the aside and the socials row draws its underlines in
 * order, left to right, holds a beat, then lets each stroke go the way it
 * came. The page pointing at the door it already built. Wordless, and
 * silent — links stay silent forever; the refusal stands.
 *
 * Implementation rides what exists: every link already carries the drawn
 * underline as a zero-width gradient with a 140ms transition (global.css).
 * Setting inline background-size to full draws it; clearing the inline
 * value hands the property back to the stylesheet and it retracts. No new
 * CSS, no classes, nothing at rest.
 */
import { ambient } from "@/scripts/friend";

/** One beat per stroke; the wave reads as a hand moving along the row. */
const STAGGER = 90;
/** How long the full row stays lit before it starts letting go. */
const HOLD = 700;

export function register(): void {
  /* The murmur is the only accent-quiet thing in the header — selecting by
     that is selecting by meaning. */
  const aside = document.querySelector("header .text-accent-quiet");
  if (!aside) return;
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>("header ul a"),
  ];
  if (links.length === 0) return;

  let sweeping = false;
  ambient({
    el: aside,
    act: () => {
      if (sweeping) return;
      sweeping = true;
      const lastIn = (links.length - 1) * STAGGER;
      links.forEach((a, i) => {
        window.setTimeout(() => {
          a.style.backgroundSize = "100% 2px";
        }, i * STAGGER);
        /* Same order out: first lit, first released — a sweep, not a
           collapse. Clearing the inline value lets hover own the link
           again the instant the bit ends. */
        window.setTimeout(
          () => {
            a.style.backgroundSize = "";
          },
          lastIn + HOLD + i * STAGGER,
        );
      });
      window.setTimeout(
        () => {
          sweeping = false;
        },
        2 * lastIn + HOLD + 200,
      );
    },
  });
}
