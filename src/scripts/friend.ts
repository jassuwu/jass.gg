/**
 * THE FRIEND'S BODY (ticket 14). Everything static on this site is the
 * document; everything JavaScript is the friend — a character who leans over
 * while you read, waits for the beat, and never repeats a bit. This module is
 * how the friend knows when to lean.
 *
 * The grammar, settled in the grilling session and not to be re-decided here:
 *
 *   pointer  — DWELL. An act arms when the cursor enters its element and
 *              fires 500ms later if it hasn't left. Instant hover is a
 *              soundboard; a friend has timing.
 *   touch    — SCROLL-DWELL. An act fires when its element rests in the
 *              middle band of the viewport and the scrolling has paused.
 *              Zero taps stolen: entry names are links and a tap always
 *              navigates. No long-press anywhere — it fights the OS and
 *              nobody finds it.
 *   both     — THE DELIBERATE PATH. A click/tap on an act's handle (never a
 *              link) performs it on demand, and consent means it may repeat.
 *
 * One-shot gags play once per VISIT (sessionStorage) — a friend doesn't redo
 * a bit because you refreshed. Ambient acts repeat freely on re-dwell.
 *
 * Reduced motion: acts that are motion vanish; an act with an honest static
 * form registers that form as `still` and gets it instead.
 *
 * The budget matters: the analytics beacon is 2.8 KB and this module must
 * stay smaller. No dependencies, ever.
 */

export interface FriendAct {
  /** The element the act belongs to — what the reader is dwelling on. */
  el: Element;
  /** The bit itself. */
  act: () => void;
  /**
   * Set for one-shot gags: a stable key, played once per visit. Ambient
   * acts leave it unset and repeat on re-dwell.
   */
  once?: string;
  /**
   * The act's honest static form, for readers who asked for less motion.
   * Left unset, the act simply never happens for them — a transient bit is
   * motion, and the affordance being removed is nothing: the page at rest.
   */
  still?: () => void;
}

const DWELL_MS = 500;
/** Scroll must rest this long before a visible act fires. */
const SETTLE_MS = 400;
/** The middle band: the viewport minus this margin top and bottom. */
const BAND = "-35% 0px -35% 0px";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const pointerish = matchMedia("(hover: hover)");

/* sessionStorage throws in some privacy modes. The friend shrugs: with no
   memory, one-shot gags simply stay one-shot per page instead. */
const seen = (key: string): boolean => {
  try {
    return sessionStorage.getItem(`friend:${key}`) === "1";
  } catch {
    return false;
  }
};
const remember = (key: string): void => {
  try {
    sessionStorage.setItem(`friend:${key}`, "1");
  } catch {
    /* no memory, no problem */
  }
};

const playedThisPage = new Set<FriendAct>();

function run(a: FriendAct): void {
  if (reduced.matches) {
    a.still?.();
    return;
  }
  if (a.once) {
    if (seen(a.once) || playedThisPage.has(a)) return;
    playedThisPage.add(a);
    remember(a.once);
  }
  a.act();
}

/* ---- pointer: dwell ---- */

function armDwell(a: FriendAct): void {
  let timer: number | undefined;
  a.el.addEventListener("pointerenter", () => {
    timer = window.setTimeout(() => run(a), DWELL_MS);
  });
  a.el.addEventListener("pointerleave", () => window.clearTimeout(timer));
}

/* ---- touch: scroll-dwell ---- */

const inBand = new Set<FriendAct>();
const byEl = new WeakMap<Element, FriendAct>();
let observer: IntersectionObserver | undefined;
let settleTimer: number | undefined;

function settle(): void {
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => inBand.forEach(run), SETTLE_MS);
}

function armScrollDwell(a: FriendAct): void {
  byEl.set(a.el, a);
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const act = byEl.get(entry.target);
        if (!act) continue;
        if (entry.isIntersecting) inBand.add(act);
        else inBand.delete(act);
      }
      settle();
    },
    { rootMargin: BAND },
  );
  observer.observe(a.el);
  addEventListener("scroll", settle, { passive: true });
}

/* ---- the public surface ---- */

/**
 * Register an ambient act: dwell on pointer devices, scroll-dwell on touch.
 * The one entry point for anything the friend does uninvited.
 */
export function ambient(a: FriendAct): void {
  if (pointerish.matches) armDwell(a);
  else armScrollDwell(a);
}

/**
 * Register a deliberate act on a handle element — a click or tap, never on a
 * link. Consent means it repeats: `once` is ignored here on purpose.
 */
export function deliberate(handle: Element, a: FriendAct): void {
  handle.addEventListener("click", () => {
    if (reduced.matches) {
      a.still?.();
      return;
    }
    a.act();
  });
}
