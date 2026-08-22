/**
 * THE ROW PERFORMS ITS OWN PRODUCT — AND NOW IT DEALS YOU IN (ticket 22,
 * instance one of the takeover). liquid-glass-cursor is a cursor, so the demo
 * is your cursor: dwell on the row and the arrow you point with becomes the
 * actual published glass — the real npm package, not a re-creation —
 * refracting this page behind it.
 *
 * New this pass: the glass has something to find. Hidden in the whitespace of
 * the row and a modest halo around it sit three small copies of the package's
 * own cursor polygon — the macOS arrow from its source, verbatim — painted in
 * ink one nudge of chroma off the page's own background. To the naked eye
 * they are nothing. Through the lens they light up, and the reason is the
 * package's real optics, not the idea of them: the displacement map is flat
 * in the interior (rim-only refraction), so what the lens center actually
 * does to the backdrop is the `saturate()` term of its backdrop-filter. This
 * instance turns that knob up. On a page that is greyscale plus one reserved
 * lime, a saturating lens changes nothing — saturation is the identity on
 * R=G=B — except the one thing in the region that carries chroma: the ink.
 * A UV lamp, built from the product's own mechanic. The rim's chromatic
 * fringe smears the ink a beat before the center makes it legible, which is
 * the lure that pulls a sweeping hand back.
 *
 * Park the glass on an arrow for a beat and it fills accent-mark and stays —
 * a fill, which is the one job that token is allowed. Find all three and the
 * row's name draws the same 2px stroke a hover draws — the site's own
 * underline, pinned by an inline background-size while the takeover lasts —
 * and that is the whole win. No confetti, no modal, no words: the marks are
 * wordless and the shape is a machine fact (the PATH constant from the
 * package source), so the copy rule is satisfied by silence.
 *
 * No instructions, by construction: the first arrow hides just past the end
 * of the row's own line, where the first playful sweep lands, and finding
 * one teaches the game. Nothing ever says "puzzle".
 *
 * THE EASY OUT IS SACRED (the ticket's one law). The takeover region is the
 * row plus the halo, implied rather than outlined, and leaving it ends
 * everything instantly and completely — glass destroyed, arrows removed,
 * underline retracting the way it came — back to the exact page, every time.
 * Nothing is locked. Re-dwell deals a fresh board: ambient acts repeat, and
 * the arrows land in new blank spots each hand.
 *
 * Chromium only, and silent elsewhere. The effect needs `backdrop-filter:
 * url(#svg-filter)`, which Firefox and Safari parse but do not render — so
 * `CSS.supports` says yes everywhere and means it only in Chromium. The one
 * honest tell without painting pixels is `navigator.userAgentData`, which
 * only Chromium ships. Both checks run; on any other engine this module does
 * nothing, which is the correct demo of a product whose README says the same.
 * (The ink's relative-color syntax rides the same gate.)
 *
 * Touch devices get nothing for a plainer reason: no cursor to replace.
 *
 * Reduced motion: the act does not play, and there is no `still`. The glass
 * is not purely reader-driven — it lags behind the hand on a lerp and tilts
 * with velocity, which is motion the reader didn't make — and it hides the
 * real cursor, which is exactly the kind of surprise that setting asks to be
 * spared. The honest static form of "your cursor, but glass" is your cursor,
 * which the page already has. friend.ts enforces this: no `still` means the
 * act simply never happens for those readers.
 */
import type { createLiquidGlassCursor } from "liquid-glass-cursor";

import { ambient, occupy } from "../friend";
import { play } from "../sound";

type Destroy = ReturnType<typeof createLiquidGlassCursor>;

/**
 * The sound of the glass (ticket 21): one soft droplet when it arrives, one
 * when it leaves — and now they bracket the takeover. No continuous watery
 * bed — silence is the resting state, and a cursor is not a faucet.
 * Synthesized, zero assets: a short sine blip pushed through a resonant
 * lowpass that sweeps shut reads as a drop hitting water. Whisper tier
 * throughout, because dwell is what earned all of it.
 */
function drop(ctx: AudioContext, out: GainNode, pitch: number, t: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  /* The quick upward bend is the physics of the thing: a drop's bubble
     shrinks as it rings, and pitch rising ~a fifth over 100ms is the
     "bloip" everyone knows. Flat pitch reads as a phone notification. */
  osc.frequency.setValueAtTime(pitch, t);
  osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, t + 0.1);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 5;
  lp.frequency.setValueAtTime(pitch * 4, t);
  lp.frequency.exponentialRampToValueAtTime(pitch, t + 0.16);
  const env = ctx.createGain();
  /* 5ms in so the sine never starts mid-cycle (that pops), exponential
     out because that is how ringing dies, then a hard zero — the ramp
     can't reach it and a tail parked at 0.001 is still a tail. */
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(1, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  env.gain.linearRampToValueAtTime(0, t + 0.22);
  osc.connect(lp).connect(env).connect(out);
  osc.start(t);
  osc.stop(t + 0.22);
  /* The bus only disconnects its own gain when the next act ducks this
     one; the drop tidies its private nodes the moment it has rung out. */
  osc.onended = () => env.disconnect();
}

function droplet(pitch: number): void {
  play({
    tier: "whisper",
    synth: (ctx, out) => drop(ctx, out, pitch, ctx.currentTime),
  });
}

/* Arrive a fourth above leave: related enough to be the same water, apart
   enough that on/off never reads as a stutter of one sound. The finds climb
   a D major arpeggio between them — three drops, each higher, so progress is
   audible without ever being counted out loud — and the win is a double drip
   of the arpeggio's root and third an octave up. It replaces the third
   find's drop outright (one mouth: the bus would duck it anyway). */
const ARRIVE = 660;
const LEAVE = 494;
const FOUND_PITCH = [587, 740, 880];
const WIN_PITCH = [1175, 1480];

function winDrips(): void {
  play({
    tier: "whisper",
    synth: (ctx, out) => {
      const t = ctx.currentTime;
      drop(ctx, out, WIN_PITCH[0], t);
      drop(ctx, out, WIN_PITCH[1], t + 0.13);
    },
  });
}

/* ---- the takeover ---- */

/* The lens. The package's default saturate is 1.2 — a garnish. 7 is a lamp.
   Everything else it would touch in the halo is greyscale and greyscale is a
   fixed point of saturation, so the page through the glass looks exactly like
   the stock demo — until it crosses ink. This is jass's tuning knob no. 1. */
const SATURATION = 7;

/* The halo: modest, implied, never outlined. Wide enough vertically that the
   arrows have somewhere to hide beyond the row's own line, tight enough that
   "I left" and "it ended" are always the same event. */
const HALO_X = 32;
const HALO_Y = 56;

/* A find is a park, not a graze: the lens must rest on an arrow this long.
   A pass-through sweep collecting everything by accident is not a puzzle;
   250ms is exactly the pause a hand already makes at something it noticed. */
const HOLD_MS = 250;
const FIND_R2 = 30 * 30;
/* Arrows keep more than twice the find radius apart, so parking on one can
   never silently collect its neighbour. */
const APART = 72;

/* The hidden shape IS the product's: cursor path and box copied verbatim
   from liquid-glass-cursor/index.ts. The glass arrow (drawn at 2x) hunts
   three of its own siblings at 1x. */
const CURSOR_W = 19.2;
const CURSOR_H = 32;
const PATH = "M 0,0 L 0,28 L 6.4,22 L 11.2,32 L 16,30 L 11.2,20 L 19.2,20 Z";

/* The ink, tokens only, one light-dark at its one declaration site — the
   site's own theming rule, held even inside a gag.

   Light mode: 10% of accent-mark mixed into the background. ΔE(ok) ≈ 0.017
   from white — under the ~0.02 adjacent-patch JND, so a small isolated shape
   is effectively invisible; saturate(7) lands it around rgb(236,255,187),
   plainly lime. Dark mode is where saturation physics bites: it cannot add
   lightness, and oklab-mixing toward a light lime would lift L enough to
   read as a smudge naked. So the dark arm mixes harder for chroma and then
   pins lightness just above the page with relative color syntax — the ink
   differs from the background almost purely in chroma, which is exactly the
   axis the lens amplifies. Both percentages and the pinned L are jass's
   tuning knob no. 2, judged on a real screen in both modes. */
const INK =
  "light-dark(" +
  "color-mix(in oklab, var(--color-background) 90%, var(--color-accent-mark))," +
  "oklch(from color-mix(in oklab, var(--color-background) 75%, var(--color-accent-mark)) 0.18 c h))";

/* Where may an arrow hide? Anywhere blank. The ink is ~opaque near-background
   paint, so an arrow overlapping a glyph would blot it — the one way this
   gag could damage the page. elementFromPoint is the honest blankness
   detector: whitespace inside the list hits LI/UL/SECTION and kin; text hits
   A, SPAN, H2, P and is refused. Probed at the centre and four corners of
   the arrow's box so the whole footprint is clear, not just its middle. */
const CLEAR = new Set([
  "LI",
  "UL",
  "OL",
  "SECTION",
  "MAIN",
  "BODY",
  "HTML",
  "HEADER",
  "FOOTER",
  "DIV",
]);
const PROBES: [number, number][] = [
  [0, 0],
  [-8, -14],
  [8, -14],
  [-8, 14],
  [8, 14],
];
/* Candidate grid pitch. The grid origin gets a random offset per hand, so a
   replay deals different blank spots from the same whitespace. */
const STEP = 28;

interface Mark {
  el: SVGSVGElement;
  path: SVGPathElement;
  /** Page coordinates of the arrow's centre — scroll-proof. */
  cx: number;
  cy: number;
  found: boolean;
  hold?: number;
}

/** The region: row rect plus halo, recomputed live so scroll can't stale it. */
function contains(row: HTMLElement, x: number, y: number): boolean {
  const r = row.getBoundingClientRect();
  return (
    x >= r.left - HALO_X &&
    x <= r.right + HALO_X &&
    y >= r.top - HALO_Y &&
    y <= r.bottom + HALO_Y
  );
}

/** Every blank slot in the region, in viewport coordinates. */
function blankSlots(row: HTMLElement): { x: number; y: number }[] {
  const r = row.getBoundingClientRect();
  /* Clamped to the viewport with room for the probes: an arrow the reader
     would have to scroll to find is not hidden, it is lost. */
  const minX = Math.max(r.left - HALO_X, 10);
  const maxX = Math.min(r.right + HALO_X, innerWidth - 10);
  const minY = Math.max(r.top - HALO_Y, 16);
  const maxY = Math.min(r.bottom + HALO_Y, innerHeight - 16);
  const ox = Math.random() * STEP;
  const oy = Math.random() * STEP;
  const out: { x: number; y: number }[] = [];
  for (let y = minY + oy; y <= maxY; y += STEP) {
    for (let x = minX + ox; x <= maxX; x += STEP) {
      const clear = PROBES.every((p) => {
        const el = document.elementFromPoint(x + p[0], y + p[1]);
        return el !== null && CLEAR.has(el.tagName);
      });
      if (clear) out.push({ x, y });
    }
  }
  return out;
}

/**
 * Deal a hand of up to three arrows. The first is the teach: the blank slot
 * nearest the end of the row's own line, so the sweep a reader was already
 * making runs straight through it. The rest are drawn at random from slots
 * far enough from everything already dealt. Fewer blank slots deal a smaller
 * hand; zero deals none and the takeover degrades to the plain glass demo,
 * which is still true.
 */
function deal(row: HTMLElement): { x: number; y: number }[] {
  const pool = blankSlots(row);
  if (pool.length === 0) return [];
  const r = row.getBoundingClientRect();
  const line = row.querySelector("span")?.getBoundingClientRect();
  const seedX = Math.min((line?.right ?? r.left) + 26, r.right);
  const seedY = (r.top + r.bottom) / 2;
  pool.sort(
    (a, b) =>
      (a.x - seedX) ** 2 +
      (a.y - seedY) ** 2 -
      ((b.x - seedX) ** 2 + (b.y - seedY) ** 2),
  );
  const hand = [pool.shift()!];
  while (hand.length < 3) {
    const far = pool.filter((p) =>
      hand.every((h) => (p.x - h.x) ** 2 + (p.y - h.y) ** 2 >= APART * APART),
    );
    if (far.length === 0) break;
    const pick = far[Math.floor(Math.random() * far.length)];
    hand.push(pick);
    pool.splice(pool.indexOf(pick), 1);
  }
  return hand;
}

function spawnMark(x: number, y: number): Mark {
  const NS = "http://www.w3.org/2000/svg";
  const el = document.createElementNS(NS, "svg");
  el.setAttribute("viewBox", `0 0 ${CURSOR_W} ${CURSOR_H}`);
  el.setAttribute("width", String(CURSOR_W));
  el.setAttribute("height", String(CURSOR_H));
  /* One notch below the glass (max int32), so the lens always paints over
     its quarry and the backdrop-filter always sees it. A light scatter of
     rotation so three identical arrows read as dropped, not typeset. */
  el.style.cssText =
    `position:absolute;left:${scrollX + x - CURSOR_W / 2}px;` +
    `top:${scrollY + y - CURSOR_H / 2}px;pointer-events:none;` +
    `z-index:2147483646;` +
    `transform:rotate(${Math.round(Math.random() * 60 - 30)}deg);`;
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", PATH);
  path.style.fill = INK;
  /* The same 140ms the site's underline uses: one timing vocabulary. */
  path.style.transition = "fill 140ms ease-out";
  el.appendChild(path);
  document.body.appendChild(el);
  return { el, path, cx: scrollX + x, cy: scrollY + y, found: false };
}

/**
 * The puzzle, alive from glass-mount to region-exit. Returns its own
 * dispose; `onExit` is the register-level teardown it calls when the region
 * rule fires. Every listener here exists only while the takeover does.
 */
function startPuzzle(
  row: HTMLElement,
  x0: number,
  y0: number,
  onExit: () => void,
): () => void {
  const link = row.querySelector<HTMLAnchorElement>("a");
  const marks = deal(row).map((s) => spawnMark(s.x, s.y));
  let lastX = x0;
  let lastY = y0;
  let found = 0;

  const near = (m: Mark): boolean => {
    const px = lastX + scrollX;
    const py = lastY + scrollY;
    return (px - m.cx) ** 2 + (py - m.cy) ** 2 < FIND_R2;
  };

  const find = (m: Mark): void => {
    m.found = true;
    m.path.style.fill = "var(--color-accent-mark)";
    found += 1;
    if (found === marks.length) {
      /* The win is the site's own hover stroke, pinned: inline
         background-size rides the underline gradient and transition every
         link already carries. Cleared on exit, it retracts the way it came —
         the same pen, taking the line back. */
      if (link) link.style.backgroundSize = "100% 2px";
      winDrips();
    } else {
      droplet(FOUND_PITCH[Math.min(found - 1, FOUND_PITCH.length - 1)]);
    }
  };

  const onMove = (e: PointerEvent): void => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!contains(row, lastX, lastY)) {
      onExit();
      return;
    }
    for (const m of marks) {
      if (m.found) continue;
      if (near(m)) {
        m.hold ??= window.setTimeout(() => {
          m.hold = undefined;
          /* Re-checked at fire: the page may have scrolled under a parked
             hand, and the moment owns the find. */
          if (near(m)) find(m);
        }, HOLD_MS);
      } else if (m.hold !== undefined) {
        window.clearTimeout(m.hold);
        m.hold = undefined;
      }
    }
  };

  /* pointermove is silent during a wheel-scroll, but scrolling moves the
     region under a still hand — re-check with the pointer's last viewport
     position, which scroll doesn't change. */
  const onScroll = (): void => {
    if (!contains(row, lastX, lastY)) onExit();
  };
  /* Out through the window edge is out. */
  const onDocLeave = (): void => onExit();
  /* Reflow moves the whitespace the arrows were dealt into; rather than
     chase it, fold the hand. Resizing mid-game is walking away. */
  const onResize = (): void => onExit();

  document.addEventListener("pointermove", onMove);
  document.addEventListener("mouseleave", onDocLeave);
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);

  return () => {
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("mouseleave", onDocLeave);
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onResize);
    for (const m of marks) {
      if (m.hold !== undefined) window.clearTimeout(m.hold);
      m.el.remove();
    }
    if (link) link.style.backgroundSize = "";
  };
}

export function register(): void {
  const row = document.querySelector<HTMLElement>(
    '[data-entry="liquid-glass-cursor"]',
  );
  if (!row) return;
  if (!matchMedia("(hover: hover)").matches) return;
  if (!("userAgentData" in navigator)) return;
  if (!CSS.supports("backdrop-filter", "url(#f)")) return;

  /* The package's module entry auto-invokes createLiquidGlassCursor() at
     import time — built to self-demo when dropped in a <script> tag. Imported
     here, that would spawn a page-wide instance with no destroy handle: a
     cursor that never leaves. Its init has one escape hatch — if
     document.readyState is "loading" it defers to DOMContentLoaded instead —
     so for the duration of the import an own-property shadows readyState with
     "loading", then deletes itself to restore the real getter. The deferred
     listener it leaves behind waits for an event that already fired: one
     inert function, no DOM, no filters, no listeners that run. The shadow
     spans one module fetch of a same-origin asset; nothing on this page reads
     readyState in that window. */
  const load = async () => {
    Object.defineProperty(document, "readyState", {
      value: "loading",
      configurable: true,
    });
    try {
      return (await import("liquid-glass-cursor")).createLiquidGlassCursor;
    } finally {
      delete (document as { readyState?: string }).readyState;
    }
  };

  let loading: Promise<typeof createLiquidGlassCursor> | undefined;
  let destroy: Destroy | undefined;
  let endPuzzle: (() => void) | undefined;
  /* Still hovering? The import is async and the dwell already happened, so
     without this a pass-through that left during the load would get a glass
     cursor after the fact, on a row it is no longer over. */
  let wanted = false;
  /* Last pointer position over the row. The package hides the native cursor
     the instant it mounts but only draws the glass on the next mousemove — a
     hand that dwelt and then held still would have no cursor at all. One
     synthetic mousemove at the known position closes the gap. */
  let px = 0;
  let py = 0;

  row.addEventListener("pointermove", (e) => {
    px = e.clientX;
    py = e.clientY;
  });

  /* THE easy out — the only exit, so there is exactly one and it cannot
     half-run. destroy() is the package's own teardown and removes everything
     it made: the glass, the filter <svg>, the cursor-hiding <style>, both
     document listeners. The puzzle's dispose removes everything IT made:
     arrows, timers, listeners, the pinned underline. Each entrance builds
     fresh, so enter/leave any number of times leaves no residue. The leave
     drop is guarded by destroy: a pass-through that left mid-import took no
     glass with it, so it gets no drop. The sound is OF the leaving. */
  const exit = (): void => {
    if (!destroy) return;
    if (unveil) {
      cancelAnimationFrame(unveil);
      unveil = undefined;
    }
    destroy();
    destroy = undefined;
    release?.();
    release = undefined;
    endPuzzle?.();
    endPuzzle = undefined;
    wanted = false;
    droplet(LEAVE);
  };

  let release: (() => void) | undefined;
  /* The entrance's repair loop (audit, aug 22). */
  let unveil: number | undefined;

  ambient({
    el: row,
    act: () => {
      wanted = true;
      loading ??= load();
      void loading.then((create) => {
        if (!wanted || destroy) return;
        destroy = create({ saturation: SATURATION });
        /* A takeover holds the stage: no other ambient act may start
           until the easy out runs. This is what kept the vergil cut from
           ever again firing under a live glass. */
        release = occupy();

        /* THE ENTRANCE (audit fix). The package hides the native cursor
           synchronously but renders its glass from (-9999,-9999) on a
           lerp, and the synthetic mousemove below only sets the lerp's
           TARGET — the stock mount is ~300ms of no pointer at all, then
           an arrow flying in from off-screen. Repaired from outside the
           package: hand the native cursor back (the package's cursor:none
           style is detached), hold the glass invisible, and only when the
           lerp has actually delivered it to the hand — or a 1.2s cap —
           swap the two. The read becomes "the arrow turned to glass", not
           "the arrow vanished and glass flew in". */
        const glass = document.body.lastElementChild as HTMLElement | null;
        const veil = [...document.head.querySelectorAll("style")]
          .filter((s) => s.textContent === "* { cursor: none !important; }")
          .pop();
        if (glass?.querySelector("svg") && veil) {
          veil.remove();
          glass.style.opacity = "0";
          glass.style.transition = "opacity 140ms ease-out";
          const t0 = performance.now();
          const settle = (): void => {
            unveil = undefined;
            /* Exited mid-glide: the cursor stays native, correctly —
               destroy() already ran and its S.remove() was a no-op on the
               detached veil. */
            if (!destroy) return;
            const m = new DOMMatrix(getComputedStyle(glass).transform);
            const near = Math.hypot(m.e - px, m.f - py) < 28;
            if (near || performance.now() - t0 > 1200) {
              glass.style.opacity = "";
              document.head.append(veil);
            } else {
              unveil = requestAnimationFrame(settle);
            }
          };
          unveil = requestAnimationFrame(settle);
        }

        document.dispatchEvent(
          new MouseEvent("mousemove", { clientX: px, clientY: py }),
        );
        endPuzzle = startPuzzle(row, px, py, exit);
        /* Only here, where the glass is actually on screen — a dwell whose
           import is still in flight has nothing to sound like yet. */
        droplet(ARRIVE);
      });
    },
  });

  /* Before the glass exists, the region is just the row: a pass-through that
     leaves mid-import cancels the pending mount. Once the glass is up the
     halo owns the exit (the puzzle's region check), so this bails. */
  row.addEventListener("pointerleave", () => {
    if (destroy) return;
    wanted = false;
  });
}
