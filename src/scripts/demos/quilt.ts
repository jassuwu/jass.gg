/**
 * THE QUILT ROW PERFORMS ITS OWN PRODUCT (ticket 15). quilt's pitch is
 * "merge the calendars, get an SVG endpoint" — so the demo IS the endpoint.
 * Dwell on the row — or tap its description, which on touch is the only way
 * in — and the friend holds up jass's real merged contribution graph,
 * rendered live by the deployed service at quilt.jass.gg. Hotlinking
 * it is the point: the row proves the product by using it, and if the
 * service were down the proof would honestly not exist, which is the
 * correct amount of fakery (none).
 *
 * Nothing at rest: no element, no request, no styles until the first act.
 * The image is an overlay — absolutely positioned above the row's own box —
 * so no row ever moves, including at 390px where there is no margin to
 * borrow. It gets no card, border, shadow or radius from this site; the SVG
 * arrives with its own ground and its own corners. It does wear this site's
 * colours — through the service's own ?color/?bg knobs, so this is demoing
 * quilt's second feature, not dressing over its output. One print for both
 * modes: the ground is the site's dark background and the ramp tops out at
 * accent-mark, the invariant lime that can never be text on white — here it
 * never has to be, because it sits inside the SVG's own dark ground.
 *
 * No `once`: the graph is a fact, not a gag, and a fact bears repeating —
 * on re-dwell, and on tap, where consent may always repeat. It leaves when
 * the pointer does, or after a beat — the beat exists for touch, where
 * there is no leave. The act is silent (an SVG has no voice), so no `sound`
 * and no murmur.
 */
import { entry } from "@/scripts/friend";

/** jass's real merged graph — both accounts — generated at request time by
 * the live service. The colours are the site's own tokens converted to sRGB
 * hex, because the endpoint speaks hex and CSS speaks oklch: `color` is
 * accent-mark oklch(0.9392 0.1588 124.39) = #d4fd80, `bg` is the dark-mode
 * background oklch(0.145 0 0) = #0a0a0a. The service derives the rest of
 * the green ramp from those two ends itself. */
const SRC =
  "https://quilt.jass.gg/u/jassuwu,jassucyd.svg?color=d4fd80&bg=0a0a0a";

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
  left: 50%;
  /* Full native size — the SVG is 800px wide, which is 50rem, wider than
     the 42rem column. It spills past the row into the page margins on
     purpose (jass: "it can takeover a larger space, cuz it's not that
     visible") — centered on the row, held up with both hands rather than
     pinched in one. The viewport clamp keeps phones whole, and the overlay
     still moves no row. */
  width: min(calc(100vw - 2rem), 50rem);
  height: auto;
  opacity: 0;
  transform: translate(-50%, 4px);
  pointer-events: none;
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.friend-quilt-up { opacity: 1; transform: translate(-50%, 0); }
@media (prefers-reduced-motion: reduce) {
  .friend-quilt { transition: none; transform: translate(-50%, 0); }
}`;

export function register(): void {
  const row = document.querySelector('li[data-entry="quilt"]');
  if (!row) return;

  let img: HTMLImageElement | undefined;
  let style: HTMLStyleElement | undefined;
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
    style = document.createElement("style");
    style.textContent = CSS;
    document.head.append(style);
    row.classList.add("friend-quilt-row");
    img = document.createElement("img");
    img.className = "friend-quilt";
    img.alt =
      "the last year of github contributions, both accounts merged, fetched live";
    img.decoding = "async";
    img.addEventListener("load", () => {
      loaded = true;
      if (wanted) lift();
    });
    img.addEventListener("error", () => {
      /* Retired for the visit — so the scaffolding retires with it: the
         injected style and the row's positioning class have no image left
         to serve, and the `data-acts` cursor comes off too — a description
         that still invites the tap would be promising a graph that isn't
         coming. */
      dead = true;
      img?.remove();
      style?.remove();
      row.classList.remove("friend-quilt-row");
      row.removeAttribute("data-acts");
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
     second code path, and it serves both entries: reduced-motion readers get
     it from the tap too. The pointerleave above and the beat are its exits. */
  entry({ el: row, act: show, still: show });
}
