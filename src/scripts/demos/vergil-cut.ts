/**
 * SAVEMEFROM DEMOS ITSELF (ticket 15). The row's line reads "paste a url,
 * vergil slices the page to pieces", and clicking it collects: green flash,
 * vergil's slash plays over THIS page, the page comes apart into diagonal
 * pieces, drifts, and snaps back whole. The product's own trick, performed on
 * the portfolio that lists it — the one entry whose demo is a full-page gag,
 * because a page-sized effect shrunk into a row would be a thumbnail of
 * itself.
 *
 * Deliberate, not ambient: a judgment cut is not something the friend does
 * uninvited. The description span is the handle — never the link, which keeps
 * navigating — and a click is consent, so it repeats.
 *
 * The mechanism is savemefrom's own, not an homage to it: the same clip,
 * re-cut to its 1.5s of green-screen (160 KB against the original 15.2 MB —
 * the rest of that file is DMC footage with a real background, unkeyable),
 * and the same SVG feColorMatrix chroma key, alpha = r - 2g + b + 1, copied
 * from savemefrom's index.html. Green becomes glass; the slashes land on
 * whatever is behind them, which is now this page.
 *
 * The slice never touches the live DOM. Each piece is a full clone of <main>
 * inside a viewport-covering strip, clipped to its diagonal band, drawn over
 * the real page on an opaque page-colour sheet. The pieces fly; the document
 * under them never moves; removing the overlay IS the page coming back
 * whole. Scroll, selection, focus — untouched throughout.
 *
 * The clip ends by burning to white, and that whiteout is load-bearing: the
 * strips spawn behind it, so the swap from "slashed page" to "page in
 * pieces" happens under a flash instead of on camera.
 *
 * The cut sounds (ticket 21): click-armed, so full tier — the reader asked.
 * Everything goes through the sound bus, the one mouth; the video element
 * itself stays muted forever. See AUDIO below for why the track ships
 * beside the mp4 instead of inside it.
 *
 * Lazy: nothing is fetched until the first pointer enters the row. Reduced
 * motion: nothing at all, and no `still` — a slice with no motion is a
 * broken page, not a quieter one — so the module also skips the preload and
 * the cursor hint, and the row is just a row. A dead act makes no sound:
 * the register bails before any listener exists, so the cue dies with it.
 */
import { deliberate } from "@/scripts/friend";
import { play, stopAll } from "@/scripts/sound";

/* Six pieces at tan(12°). More strips read as confetti, fewer as a page
   fold; six is where it still reads as swordwork. */
const STRIPS = 6;
const SLANT = 0.21;
const SLICE_MS = 1600;

/* Above the page, below nothing that matters: the overlay sheet, then the
   keyed video, then the green flash on top. */
const Z = 40;

/* The slash rides the bus, not the video track. Muxing audio back into the
   mp4 was the other option and it loses twice: the clip ends at the 1.5s
   whiteout but the sound doesn't — the final hit rings for another ~0.7s,
   and cutting that ring at the container edge is audible — and a video
   element speaks outside the bus, where nothing can duck it and the mute
   egg can't reach it. So: the source clip's own first 2.2s, mono aac,
   17 KB, same t=0 as the video (the shared quarter-second of silence at
   the head absorbs any start skew), faded out under the drift. The cut
   sounds, the ring carries the flying pieces, and the snap home lands in
   restored silence — the page pretends nothing happened, and so does the
   speaker. */
const AUDIO = "/vergil.m4a";

let video: HTMLVideoElement | undefined;
let running = false;

/* Built on first intent, kept for repeats. The filter is savemefrom's,
   verbatim: the matrix drives any green-dominant pixel's alpha below zero,
   the transfer sharpens the ramp so slash edges key cleanly. */
function ensureVideo(): HTMLVideoElement {
  if (video) return video;
  const defs = document.createElement("div");
  defs.setAttribute("aria-hidden", "true");
  defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  defs.innerHTML =
    `<svg width="0" height="0"><filter id="vergil-chroma" color-interpolation-filters="sRGB">` +
    `<feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 1 -2 1 0 1"/>` +
    `<feComponentTransfer><feFuncA type="linear" slope="3" intercept="-0.5"/></feComponentTransfer>` +
    `</filter></svg>`;
  document.body.append(defs);

  video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = "auto";
  video.src = "/vergil.mp4";
  video.style.cssText =
    `position:fixed;inset:0;width:100%;height:100%;object-fit:cover;` +
    `pointer-events:none;z-index:${Z + 2};filter:url(#vergil-chroma)`;
  video.load();
  return video;
}

/* The green flash is CSS, not the clip: keyed, the clip's own green frames
   are perfectly transparent — that is the whole trick — so the flash has to
   come from this side of the filter. It comes in the site's own lime, which
   is what the judgment cut would flash if it lived here. */
function flash(): void {
  const f = document.createElement("div");
  f.setAttribute("aria-hidden", "true");
  f.style.cssText = `position:fixed;inset:0;z-index:${Z + 4};pointer-events:none;background:var(--color-accent-mark)`;
  document.body.append(f);
  const a = f.animate(
    { opacity: [0.85, 0] },
    { duration: 260, easing: "ease-out" },
  );
  a.onfinish = () => f.remove();
}

function slice(onDone: () => void): void {
  const main = document.querySelector("main");
  if (!main || !("animate" in Element.prototype)) {
    onDone();
    return;
  }
  const rect = main.getBoundingClientRect();
  const W = innerWidth;
  const H = innerHeight;

  /* Parallel cut lines, slanted like the slashes. `dy` is how far a line
     falls across the viewport; extending the band ladder by dy keeps the
     corners covered at any aspect ratio. Bands overlap by a pixel so the
     spawn frame — pieces still at rest — has no hairline seams. */
  const dy = W * SLANT;
  const step = (H + dy) / STRIPS;

  /* The sheet: opaque page colour under the pieces. Without it the gaps
     between drifting strips would show the live page sitting there intact,
     which is the one thing the bit cannot afford to admit. */
  const sheet = document.createElement("div");
  sheet.setAttribute("aria-hidden", "true");
  sheet.style.cssText = `position:fixed;inset:0;z-index:${Z};pointer-events:none;overflow:hidden;background:var(--color-background)`;

  /* Along the cut and across it, unit vectors. Pieces shear along the blade
     and separate across it, alternating sides — the classic fall. */
  const len = Math.hypot(W, dy);
  const ux = W / len;
  const uy = -dy / len;

  let last: Animation | undefined;
  for (let i = 0; i < STRIPS; i++) {
    const strip = document.createElement("div");
    const a = i * step;
    const b = a + step;
    strip.style.cssText =
      `position:fixed;inset:0;background:var(--color-background);will-change:transform;` +
      `clip-path:polygon(0 ${a - 1}px,${W}px ${a - dy - 1}px,${W}px ${b - dy + 1}px,0 ${b + 1}px)`;

    /* A full copy of <main>, pinned to where the real one sits right now —
       fixed strip and getBoundingClientRect share viewport coordinates, so
       a scrolled page slices exactly as the reader left it. Listeners don't
       survive cloneNode; these are stills of the page, which is all a piece
       of debris needs to be. */
    const copy = main.cloneNode(true) as HTMLElement;
    copy.style.cssText = `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;margin:0`;
    strip.append(copy);
    sheet.append(strip);

    /* Uneven on purpose — modular arithmetic instead of Math.random() so a
       replay falls the same way, like a recording, which is what it is. */
    const dir = i % 2 ? 1 : -1;
    const m = dir * (34 + ((i * 37) % 29));
    const g = dir * (10 + ((i * 13) % 9));
    const r = dir * (0.5 + ((i * 11) % 10) / 10);
    const at = (k: number): string =>
      `translate(${(m * ux - g * uy) * k}px,${(m * uy + g * ux) * k}px) rotate(${r * k}deg)`;

    /* Three beats: thrown apart fast, a slow drift while it sinks in, then
       snapped home hard. The snap is the punchline — vergil sheathes. */
    last = strip.animate(
      [
        { transform: "translate(0,0)", easing: "cubic-bezier(.12,.84,.22,1)" },
        { transform: at(0.9), offset: 0.26, easing: "linear" },
        { transform: at(1), offset: 0.66, easing: "cubic-bezier(.78,0,.14,1)" },
        { transform: "translate(0,0)" },
      ],
      { duration: SLICE_MS },
    );
  }
  document.body.append(sheet);
  if (last)
    last.onfinish = () => {
      sheet.remove();
      onDone();
    };
  else onDone();
}

function perform(): void {
  if (running) return;
  running = true;
  const v = ensureVideo();
  flash();
  document.body.append(v);
  v.currentTime = 0;

  /* One path out, whatever the video does: ended, errored, or never came
     (first tap on touch races the lazy load; offline gets nothing). The
     watchdog outlives the clip by a second — worst case the flash lands,
     nothing slashes, and the page still gets cut, which is most of the
     joke. */
  let cut = false;
  const proceed = (): void => {
    if (cut) return;
    cut = true;
    window.clearTimeout(watchdog);
    slice(() => {
      running = false;
    });
    /* The strips spawn under the clip's whiteout; the fade hands the white
       frame over to the already-sliced page instead of blinking it away. */
    const fade = v.animate(
      { opacity: [1, 0] },
      { duration: 180, easing: "ease-out" },
    );
    fade.onfinish = () => v.remove();
  };
  const watchdog = window.setTimeout(proceed, 2600);
  v.onended = proceed;
  v.onerror = proceed;
  /* The act takes the mouth: nothing whispers under a judgment cut. Full
     tier because a click asked. The bus holds the rest of the law — muted
     site or missing file and the page just gets cut silently, which is
     still most of the joke. */
  stopAll();
  play({ tier: "full", url: AUDIO });
  v.play().catch(proceed);
}

export function register(): void {
  const desc = document.querySelector('li[data-entry="savemefrom"] > span');
  if (!(desc instanceof HTMLElement)) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* The row's own line is the instruction — "vergil slices the page to
     pieces" — so the description gets the one affordance that costs nothing
     at rest: a pointer cursor, visible only to a cursor already on it. The
     hover-brightening stays keyed to the link alone; the index's comment
     about the description not promising a click predates the description
     being able to keep the promise. */
  desc.style.cursor = "pointer";

  /* First intent fetches the clip and warms the http cache for the audio —
     a bare fetch, no Audio(), no bus: the bus does its own fetch on first
     play, and this makes that one instant instead of late. The li catches
     the pointer before the span does, and on touch the entering tap is the
     click itself, which is what the watchdog above is for. */
  desc.parentElement?.addEventListener(
    "pointerenter",
    () => {
      ensureVideo();
      fetch(AUDIO).catch(() => {});
    },
    { once: true },
  );

  deliberate(desc, { el: desc, act: perform });
}
