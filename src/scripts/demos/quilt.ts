/**
 * THE QUILT ROW PERFORMS ITS OWN PRODUCT (ticket 15). quilt's pitch is
 * "merge the calendars, get an SVG endpoint" — so the demo IS the endpoint.
 * Dwell on the row and the friend holds up jass's real merged contribution
 * graph, rendered live by the deployed service at quilt.jass.gg. Hotlinking
 * it is the point: the row proves the product by using it, and if the
 * service were down the proof would honestly not exist, which is the
 * correct amount of fakery (none).
 *
 * Nothing at rest: no element, no request, no styles until the first act.
 * The image is an overlay — absolutely positioned above the row's own box —
 * so no row ever moves, including at 390px where there is no margin to
 * borrow. It gets no card, border, shadow or radius from this site; the SVG
 * arrives with its own dark ground and its own corners, and dressing the
 * product's output would be claiming it. Shown at half its native 800px so
 * the year reads as a strip, not a billboard.
 *
 * Ambient, no `once`: the graph is a fact, not a gag, and a fact bears
 * repeating. It leaves when the pointer does, or after a beat — the beat
 * exists for touch, where there is no leave.
 */
import { ambient } from "@/scripts/friend";

/** jass's real merged graph, generated at request time by the live service. */
const SRC = "https://quilt.jass.gg/u/jassuwu.svg";

/** How long the friend holds the quilt up before putting it back down. */
const HOLD_MS = 4000;

/* The rise is 4px of lift as it fades in — held up, not switched on. Under
   reduced motion both transitions go; the quilt is an honest static form and
   appears as one. `pointer-events: none` because the overlay crosses the rows
   above it, and an image that ate their hover would make the shelf worse to
   own one trick. */
const CSS = `
li.friend-quilt-row { position: relative; }
.friend-quilt {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0;
  width: min(100%, 25rem);
  height: auto;
  opacity: 0;
  transform: translateY(4px);
  pointer-events: none;
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.friend-quilt-up { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .friend-quilt { transition: none; transform: none; }
}`;

export function register(): void {
  const row = document.querySelector('li[data-entry="quilt"]');
  if (!row) return;

  let img: HTMLImageElement | undefined;
  let loaded = false;
  /** A failed fetch retires the act for the visit. Silence, never an error:
   * a friend who can't find the thing doesn't announce that he can't. */
  let dead = false;
  /** Whether the reader still wants it by the time the network delivers. */
  let wanted = false;
  let hideTimer: number | undefined;

  const hide = (): void => {
    wanted = false;
    window.clearTimeout(hideTimer);
    img?.classList.remove("friend-quilt-up");
  };

  const lift = (): void => {
    img?.classList.add("friend-quilt-up");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hide, HOLD_MS);
  };

  const show = (): void => {
    if (dead) return;
    wanted = true;
    if (img) {
      if (loaded) lift();
      return; /* still in flight — the load handler checks `wanted` */
    }
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.append(style);
    row.classList.add("friend-quilt-row");
    img = document.createElement("img");
    img.className = "friend-quilt";
    img.alt =
      "the last year of github contributions, all accounts merged, fetched live";
    img.decoding = "async";
    img.addEventListener("load", () => {
      loaded = true;
      if (wanted) lift();
    });
    img.addEventListener("error", () => {
      dead = true;
      img?.remove();
    });
    /* The request starts here, on first act — never at rest. Revealing is
       gated on `load` so the quilt appears whole or not at all; a broken-image
       glyph is the one thing worse than nothing. */
    img.src = SRC;
    row.append(img);
  };

  row.addEventListener("pointerleave", hide);

  /* `still` is the same appearance — the CSS above already strips its motion,
     so the honest static form falls out of the media query rather than a
     second code path. The pointerleave above and the beat are its exits. */
  ambient({ el: row, act: show, still: show });
}
