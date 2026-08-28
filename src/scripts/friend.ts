/**
 * THE FRIEND'S BODY (ticket 14). Everything static on this site is the
 * document; everything JavaScript is the friend — a character who leans over
 * while you read, waits for the beat, and never repeats a bit. This module is
 * how the friend knows when to lean.
 *
 * The grammar, settled with jass (aug 22, superseding the grilling session's
 * scroll-dwell) and not to be re-decided here:
 *
 *   dwell    — the WHISPER entry, hover devices only. An act arms when the
 *              cursor enters its element and fires 500ms later if it hasn't
 *              left. Instant hover is a soundboard; a friend has timing.
 *   tap      — the DELIBERATE entry, and on touch the ONLY entry. A click or
 *              tap on a row's DESCRIPTION starts its act immediately — no
 *              dwell wait, because a tap already is the wait. The name stays
 *              a pure link and always navigates; the description is the
 *              act's handle and says so with a cursor.
 *
 * Scroll-dwell is dead grammar. jass, from his phone: "middle of the scroll
 * view initiating actions is not it at all" — and the audit agreed (every
 * act resting in the band fired at once; the footer could never fire at
 * all). Scroll position initiates nothing, ever again. Do not rebuild it.
 *
 * One-shot gags play once per VISIT (sessionStorage) — a friend doesn't redo
 * a bit because you refreshed. Ambient acts repeat freely on re-dwell, and
 * a click may always repeat: consent is consent.
 *
 * Reduced motion: acts that are motion vanish; an act with an honest static
 * form registers that form as `still` and gets it instead.
 *
 * The budget matters: the analytics beacon is 2.8 KB and this module must
 * stay smaller. No dependencies, ever — the sound bus next door is a
 * sibling, not a dependency.
 */
import { isAwake, onWake } from "./sound";

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

/** A row's act, for `entry()`. The one extra field is a declaration. */
export interface EntryAct extends FriendAct {
  /**
   * The act speaks. This is what buys the row the murmur below: a
   * sound-bearing act dwelled before the bus's first wake gesture plays
   * mute, and the friend gets one chance per visit to admit it.
   */
  sound?: boolean;
}

const DWELL_MS = 500;

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

/* ---- one act at a time ---- */

/* A takeover holds the whole stage; while one is live no ambient act may
   start (audit, aug 22: the glass halo overlaps the savemefrom row, and the
   vergil cut fired UNDER a live takeover — two acts fighting over one page
   and one mouth). The deliberate path respects the stage too. A click is
   also every takeover's exit, and the exit runs first — but the same click
   never starts the next act (see `outAt` below): one press gives the page
   back, and the next press, on whichever handle, is a fresh ask. */
let occupied = 0;

/* When the shared exit last put an act out (event clock). The click that
   follows that pointerdown is the same gesture, and the reader made it to
   get the page back — so the handle refuses to start anything for a beat. */
let outAt = -1;
const OUT_MS = 1000;

/**
 * Claim the stage. Returns the one release — idempotent, so an exit path
 * that runs twice cannot free someone else's claim.
 */
export function occupy(): () => void {
  occupied++;
  let done = false;
  return () => {
    if (done) return;
    done = true;
    occupied--;
  };
}

/**
 * THE EASY OUT, SHARED (ticket 22's one law, implemented once). Every
 * takeover ends on Escape and on a click anywhere — pointerdown, capture
 * phase: the down IS the reader asking for the page back, and no element
 * gets to swallow the ask. Call it when the act takes the stage; it returns
 * the uninstall, which the act's own teardown owns. Natural exits — the
 * pointer leaving the region, scroll, a hidden tab — stay each act's
 * business.
 *
 * The entry gesture is swallowed by clock, not plumbing. A deliberate entry
 * fires on `click`, whose pointerdown is already history when the act
 * installs this — but acts install asynchronously (the glass imports its
 * package first) and event order is exactly the kind of fact that shifts
 * under a refactor, so exits also refuse any gesture stamped before this
 * breath: an act can never be killed by its own birth.
 */
export function easyOut(end: () => void): () => void {
  const t0 = performance.now();
  const down = (e: Event): void => {
    if (e.timeStamp > t0) {
      outAt = e.timeStamp;
      end();
    }
  };
  const key = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && e.timeStamp > t0) end();
  };
  addEventListener("pointerdown", down, true);
  addEventListener("keydown", key, true);
  return () => {
    removeEventListener("pointerdown", down, true);
    removeEventListener("keydown", key, true);
  };
}

function run(a: FriendAct): void {
  if (occupied) return;
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

/** Returns the disarm, for a press that arrives inside the dwell window. */
function armDwell(a: FriendAct): () => void {
  let timer: number | undefined;
  a.el.addEventListener("pointerenter", () => {
    /* Hybrid devices can deliver a second enter (mouse resting + finger
       tap) with no leave between; without the clear the first timer is
       orphaned and the act fires twice. */
    window.clearTimeout(timer);
    timer = window.setTimeout(() => run(a), DWELL_MS);
  });
  a.el.addEventListener("pointerleave", () => window.clearTimeout(timer));
  return () => window.clearTimeout(timer);
}

/* ---- the murmur ---- */

/**
 * A dwell-borne act that carries sound plays MUTE before the bus's first
 * wake gesture — the browser's law, not a bug — and until now the reader
 * had no way to know a performance was running half of itself. So the one
 * time per visit it happens, the friend leans in beside the row's
 * description and admits it, in the hand, in the quiet accent, and takes
 * the aside back the moment any gesture wakes the bus. Text only: a note
 * about withheld sound that made sound would be a liar.
 */
const MURMUR = "(psst. im \u{1F910} til u click me)";

/* The in-memory half of "once": where sessionStorage throws, seen() is
   always false, and without this the aside would stack on every mute dwell. */
let murmured = false;

function murmur(row: Element): void {
  if (murmured || isAwake() || seen("murmured")) return;
  const desc = row.querySelector(":scope > a + span");
  if (!desc) return;
  murmured = true;
  remember("murmured");
  const el = document.createElement("span");
  /* Marked, so an act that photographs the page (music-to-my-ai clones
     <main>) can leave the aside out of the picture: it is the friend
     leaning in beside the row, not a line the page reads aloud. */
  el.setAttribute("data-murmur", "");
  /* Existing utilities only — the closer's aside already pays for these. */
  el.className =
    "ml-2 font-hand text-micro whitespace-nowrap text-accent-quiet";
  el.textContent = MURMUR;
  desc.after(el);
  /* Reachable only through run(), so reduced motion never sees the fades. */
  el.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 400,
    easing: "ease-out",
  });
  onWake(() => {
    const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 400,
      easing: "ease-out",
    });
    fade.onfinish = () => el.remove();
  });
}

/* ---- the public surface ---- */

/**
 * Register an ambient act: dwell, hover devices only. The entry point for
 * anything the friend does uninvited that is NOT a row — rows go through
 * `entry()`, which arms this and the tap handle both. On touch this arms
 * nothing at all: an uninvited act with no row has no honest trigger under
 * a thumb, and scroll position is not one.
 */
export function ambient(a: FriendAct): void {
  if (pointerish.matches) armDwell(a);
}

/**
 * Register an act-bearing row — a `li[data-entry]` whose act now has both
 * entries. On hover devices the whole row dwells, exactly as `ambient()`.
 * On every device a click or tap on the DESCRIPTION span starts the act
 * immediately; the name's <a> is never touched, so a tap on the name
 * navigates, always. Registration marks the row `data-acts`, which is what
 * global.css keys the description's cursor and hover lift off — the markup
 * can't know, because an act may refuse its row at runtime (capability
 * gates) and a bare row must stay bare.
 *
 * The click path ignores `once` on purpose — consent means it may repeat —
 * and it wakes the bus by being a gesture, which is why it never earns the
 * murmur: the murmur belongs to the dwell, the one entry that can arrive
 * before sound is allowed.
 */
export function entry(a: EntryAct): void {
  const dwelt: FriendAct = a.sound
    ? {
        ...a,
        act: () => {
          murmur(a.el);
          a.act();
        },
      }
    : a;
  const disarm = pointerish.matches ? armDwell(dwelt) : undefined;

  const handle = a.el.querySelector(":scope > a + span");
  if (!handle) return;
  a.el.setAttribute("data-acts", "");
  handle.addEventListener("click", (e) => {
    /* A press inside the dwell window is the same intent said louder, not
       a second one: the pending whisper yields, or a slap would land twice. */
    disarm?.();
    /* The click whose pointerdown just ended an act is the reader asking
       for the page back — the page is the answer, not the act again. This
       is also what makes the live act's own handle an exit like any other
       spot, instead of the one place on the page that restarts it. */
    if (e.timeStamp - outAt < OUT_MS) return;
    if (occupied) return;
    if (reduced.matches) {
      a.still?.();
      return;
    }
    a.act();
  });
}
