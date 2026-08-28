/**
 * THE ROW PLAYS THE PRODUCT'S OWN OUTPUT (ticket 22, the mojify takeover).
 *
 * mojify turns media into text — a Go CLI that renders video as truecolor,
 * edge-aware character art. So the demo is a clip mojify itself exported:
 * real colored-text frames, produced by `mojify export`, played back here as
 * actual monospace characters in a box over the row. Nothing in this file
 * renders media; the renderer already ran, on jass's machine, and what ships
 * is its output verbatim. The mechanic is the product's (media → text) and
 * the pixels are the product's (its own export); this module is only the
 * projector.
 *
 * THE FRAME FORMAT (v1), at /demos/mojify.frames.json:
 *
 *   {
 *     "v": 1,
 *     "w": 60, "h": 17,          // the grid, in character cells
 *     "fps": 12,                 // playback rate
 *     "palette": ["rrggbb", …],  // quantized truecolor, hex, no '#'
 *     "frames": [ Frame, … ]     // full frames, in order, no deltas
 *   }
 *
 *   Frame = [ [colorIndex, "text"], … ]
 *
 * A frame is a list of RLE runs: same-color spans of characters, row-major,
 * free to cross a row boundary — the '\n' between rows rides inside whatever
 * run is open, so painting a frame is nothing but streaming runs into a
 * <pre>. colorIndex -1 means unstyled: the page's own foreground, for
 * colorless recipes and padding. Spaces never break a run (invisible things
 * have no color to disagree about), which is most of why a few seconds of
 * truecolor video fits in a couple hundred KB of JSON before compression.
 * The converter that writes this lives in .scratch/mojify-asset/convert.ts;
 * the handoff doc beside it has the exact `mojify export` invocation.
 *
 * THE ASSET MAY NOT EXIST, and that is a state this module is built for:
 * only jass can run the export, so until he does, there is no file. Dead
 * acts make no sound — the build checks for the asset (a static site knows
 * its own files) and without it register() registers NOTHING: no entry, no
 * `data-acts`, no cursor on the description, no request, the row exactly as
 * bare as better-splitwise. A promise the page can't keep is never made. The frames themselves are fetched later,
 * on intent — the pointer entering the row's section, or the first
 * completed gesture anywhere (which is what a touch reader's first tap is)
 * — never at rest, and never twice.
 *
 * THE BOX IS THE ROW'S REGION PLUS A HALO. The grid renders at its natural
 * size once, invisibly, gets measured, and is transform-scaled to fit — the
 * row's width, or wider, up to what the viewport allows (jass, aug 28: "a
 * lot more detail"; a hundred-odd columns need the room to stay glyphs
 * rather than pixels). So the art is real text at every size, not a bitmap
 * of text, which is the entire point of the product. The box centers on the row,
 * clamped into the viewport, on the product's own ground, not the page's:
 * mojify's truecolor export is a terminal's picture — pixel colours drawn
 * for a dark screen — so the box is the site's dark background and the
 * unstyled ink its light foreground in BOTH modes (the quilt row settled
 * this: the art sits inside its own dark ground). There is no border
 * because nothing on this site has one. It is `aria-hidden` with
 * `pointer-events: none` — a projection, not a surface; the page under it
 * keeps working, and any pointerdown ends the act anyway.
 *
 * IT PLAYS ONCE. A clip that loops has mistaken itself for wallpaper. The
 * last frame holds a beat so the ending reads as an ending, then the page
 * is back exactly as it was. Re-dwell or re-tap replays from the top —
 * consent repeats.
 *
 * THE EASY OUT IS SACRED. Escape and click-anywhere come from the friend's
 * shared easyOut, which swallows the entry tap by clock. This act's own
 * exits: on hover devices the region is the box plus a margin, checked live
 * on pointermove and re-checked on scroll (a wheel moves the region under a
 * still hand); on touch, any scroll is walking away and ends it. A hidden
 * tab ends it. A resize just re-places the box — cheaper and calmer than
 * ending the act over a rotated phone.
 *
 * Silent, for now (`sound` undeclared): the export loop below is
 * frame-only, and a soundtrack this row didn't earn would be decoration.
 *
 * Reduced motion: nothing registers at all, the vergil cut's precedent — a
 * video with the motion removed is one frame pretending, not a still form
 * of the act, and a bare row must not grow a cursor that promises it.
 */
import { easyOut, entry, occupy } from "@/scripts/friend";

type Run = [color: number, text: string];
type Frame = Run[];

interface Film {
  v: number;
  w: number;
  h: number;
  fps: number;
  palette: string[];
  frames: Frame[];
}

const SRC = "/demos/mojify.frames.json";

/* Whether the asset exists is a build-time fact — the site is static, and
   the honest re-probe is a rebuild. astro.config.mjs defines this from the
   file's existence, so an absent film costs nothing at runtime (no request
   at rest, no 404 in anyone's console) and a present one arms the row. A
   define, not a glob: a glob would ship a second, hashed copy of the film
   under _astro that nothing ever loads. */
const HAS_FILM = import.meta.env.MOJIFY_FILM === true;

/* The measurement size. Arbitrary — the box is transform-scaled to the row
   regardless — but 16px keeps the unscaled grid near its final size, so the
   browser rasterizes glyphs close to the scale they'll show at. */
const BASE_PX = 16;
/* One character cell of breathing room between the art and the box edge. */
const PAD = 12;
/* The region's forgiveness: how far past the box a hand may drift. */
const HALO = 24;
/* The widest the box may grow, and the least it keeps from the viewport's
   edge: wider than the column on purpose — detail needs the room. */
const MAX_W = 960;
const EDGE = 12;
/* The last frame holds this long, so the ending reads as an ending. */
const HOLD_MS = 500;

/* Hex from the converter is trusted-shape, not trusted-content: one strict
   test before it becomes a style, so a hand-edited asset can degrade to
   foreground instead of injecting whatever it likes into a color. */
const HEX = /^[0-9a-fA-F]{6}$/;

function valid(d: unknown): d is Film {
  const f = d as Film;
  return (
    !!f &&
    f.v === 1 &&
    Number.isFinite(f.w) &&
    Number.isFinite(f.h) &&
    Number.isFinite(f.fps) &&
    f.fps > 0 &&
    Array.isArray(f.palette) &&
    Array.isArray(f.frames) &&
    f.frames.length > 0
  );
}

/* Fetched once per visit, on intent. A missing or malformed asset caches
   null and the act is quietly dead for the visit — but register() already
   HEAD-probed before arming anything, so in practice null here means the
   file changed shape, not that it never existed. */
let filmP: Promise<Film | null> | undefined;
function load(): Promise<Film | null> {
  filmP ??= fetch(SRC)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (valid(d) ? d : null))
    .catch(() => null);
  return filmP;
}

const esc = (t: string): string =>
  t.replace(/[&<>]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;",
  );

/** A frame as markup: unstyled runs are bare text, colored runs a span
 * each. Built once per frame and kept — at a hundred-odd columns a frame is
 * thousands of runs, and building nodes for them every beat is what would
 * make the switch visible; one innerHTML of a ready string is not. The
 * palette hex is validated before it becomes a style; the text is escaped. */
const markup = new WeakMap<Film, string[]>();
function html(film: Film, i: number): string {
  let cached = markup.get(film);
  if (!cached) markup.set(film, (cached = []));
  let s = cached[i];
  if (s !== undefined) return s;
  s = "";
  for (const [c, t] of film.frames[i] ?? []) {
    const hex = film.palette[c];
    s +=
      c < 0 || !hex || !HEX.test(hex)
        ? esc(t)
        : `<span style="color:#${hex}">${esc(t)}</span>`;
  }
  return (cached[i] = s);
}

/** Switch the <pre> to frame i. Fast enough to read as video, which is the
 * ask: text in HTML, swapped quickly, not a <video> of text. */
function paint(pre: HTMLPreElement, film: Film, i: number): void {
  if (!film.frames[i]) return;
  pre.innerHTML = html(film, i);
}

export function register(): void {
  const row = document.querySelector<HTMLElement>('li[data-entry="mojify"]');
  if (!row) return;
  /* The vergil cut's gate, for the vergil cut's reason: this is a video. */
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const pointerish = matchMedia("(hover: hover)");

  /* Last pointer position over the page, for the region check: pointermove
     is silent during a wheel-scroll, so the scroll handler re-checks with
     the pointer's last known viewport spot, which scrolling doesn't move. */
  let lastX = 0;
  let lastY = 0;

  let live = false;
  /* Still wanted? The fetch is async and the dwell already happened; a
     pass-through that left during the load must not get a box after the
     fact, over a row it is no longer on. */
  let wanted = false;
  let timer: number | undefined;
  let box: HTMLElement | undefined;
  let release: (() => void) | undefined;
  let offOut: (() => void) | undefined;
  let place = (): void => {};

  const inRegion = (x: number, y: number): boolean => {
    if (!box) return false;
    const r = box.getBoundingClientRect();
    return (
      x >= r.left - HALO &&
      x <= r.right + HALO &&
      y >= r.top - HALO &&
      y <= r.bottom + HALO
    );
  };

  const end = (): void => {
    if (!live) return;
    live = false;
    wanted = false;
    window.clearTimeout(timer);
    offOut?.();
    offOut = undefined;
    release?.();
    release = undefined;
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", onHide);
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", place);
    box?.remove();
    box = undefined;
  };

  const onMove = (e: PointerEvent): void => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!inRegion(lastX, lastY)) end();
  };
  const onScroll = (): void => {
    /* On touch a scroll is walking away, full stop. On hover devices the
       page just moved under a still hand — same containment question. */
    if (!pointerish.matches || !inRegion(lastX, lastY)) end();
  };
  const onHide = (): void => {
    if (document.hidden) end();
  };

  const mount = (film: Film): void => {
    /* A slow first fetch can outlive the reader's interest: if the row has
       been scrolled away by the time the frames land, mounting would clamp
       the box into a viewport its row already left. No row, no clip. */
    const r0 = row.getBoundingClientRect();
    if (r0.bottom < 0 || r0.top > innerHeight) {
      wanted = false;
      return;
    }
    live = true;
    /* A takeover holds the stage: nothing else starts over a playing clip. */
    release = occupy();

    box = document.createElement("div");
    box.setAttribute("aria-hidden", "true");
    box.style.cssText =
      `position:absolute;z-index:10;visibility:hidden;` +
      `padding:${PAD}px;background:oklch(0.145 0 0);color:oklch(0.985 0 0);` +
      `pointer-events:none;overflow:hidden;`;
    const pre = document.createElement("pre");
    /* Real text in the machine role — the site's own mono, which is also
       the only face on the page that could pass for a terminal's. */
    pre.className = "font-machine";
    pre.style.cssText =
      `margin:0;display:inline-block;line-height:1;` +
      `font-size:${BASE_PX}px;white-space:pre;transform-origin:0 0;`;
    box.append(pre);

    paint(pre, film, 0);
    document.body.append(box);
    /* Measured once, unscaled; place() only ever re-derives the transform. */
    const natural = pre.getBoundingClientRect();

    place = (): void => {
      if (!box) return;
      const r = row.getBoundingClientRect();
      /* Fit the widest column the viewport gives — at least the row, at
         most MAX_W — and never taller than most of the viewport. */
      const maxW = Math.max(r.width, Math.min(innerWidth - 2 * EDGE, MAX_W));
      const s = Math.min(
        (maxW - PAD * 2) / natural.width,
        (innerHeight * 0.8 - PAD * 2) / natural.height,
      );
      const bw = natural.width * s + PAD * 2;
      const bh = natural.height * s + PAD * 2;
      /* Centered on the row — the halo above and below is the takeover's
         region — then clamped so the whole clip is always on screen. */
      const top = Math.max(
        EDGE,
        Math.min(r.top + r.height / 2 - bh / 2, innerHeight - bh - EDGE),
      );
      const left = Math.max(
        EDGE,
        Math.min(r.left + (r.width - bw) / 2, innerWidth - bw - EDGE),
      );
      box.style.left = `${scrollX + left}px`;
      box.style.top = `${scrollY + top}px`;
      box.style.width = `${bw}px`;
      box.style.height = `${bh}px`;
      pre.style.transform = `scale(${s})`;
    };
    place();
    box.style.visibility = "";
    /* The site's one timing word. Entry only: every exit is instant,
       because the reader who asked for the page back gets it back. */
    box.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 140,
      easing: "ease-out",
    });

    /* The universal exits arrive with the box, not with the intent — the
       tap that summoned the clip is already stamped before them. */
    offOut = easyOut(end);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("visibilitychange", onHide);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", place);

    /* Play once, on the wall clock: the frame due is derived from elapsed
       time, never from a count of ticks, so a slow paint costs a frame and
       not the clip's length — mojify's own rule ("frame timing favors
       smooth playback over showing every decoded frame"), kept here. */
    const t0 = performance.now();
    const beat = 1000 / film.fps;
    const last = film.frames.length - 1;
    let shown = 0;
    const tick = (): void => {
      const due = Math.min(last, Math.floor((performance.now() - t0) / beat));
      if (due > shown) {
        shown = due;
        paint(pre, film, shown);
      }
      if (shown === last) {
        timer = window.setTimeout(end, HOLD_MS);
        return;
      }
      timer = window.setTimeout(
        tick,
        (shown + 1) * beat - (performance.now() - t0),
      );
    };
    timer = window.setTimeout(tick, beat);
  };

  /* The else-branch is the whole feature: no asset, no entry, no cursor —
     the row stays exactly as bare as it is today. */
  if (!HAS_FILM) return;

  row.addEventListener("pointermove", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  });
  /* Before the box exists the region is just the row: a pass-through
         that leaves mid-fetch cancels the pending mount. Once mounted, the
         box plus halo owns the exit (the pointermove check above). */
  row.addEventListener("pointerleave", () => {
    if (!live) wanted = false;
  });

  /* Frames arrive on intent, not at rest: entering the section is the
         hover reader's promise made early; the first completed gesture
         anywhere is the touch reader's — a tap's up-edge lands long before
         its click reaches the description. */
  (row.closest("section") ?? row).addEventListener(
    "pointerenter",
    () => void load(),
    { once: true },
  );
  const warmUp = (): void => {
    void load();
    removeEventListener("pointerup", warmUp, true);
  };
  /* Touch only: a hover reader's first click on some link elsewhere is
         no intent toward this row, and the section enter already served
         them. */
  if (!pointerish.matches) addEventListener("pointerup", warmUp, true);

  entry({
    el: row,
    act: () => {
      if (live) return;
      wanted = true;
      void load().then((film) => {
        if (!film || !wanted || live) return;
        mount(film);
      });
    },
  });
}
