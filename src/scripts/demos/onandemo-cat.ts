/**
 * THE ROW THAT PERFORMS ITS OWN PRODUCT (ticket 15). onandemo.js is a
 * published cursor-chasing engine — 11.9 KB, dependency-free — and the only
 * honest demo of a cursor-chasing engine is a chase. Dwell on the row and the
 * engine is imported from npm, the same package anyone else would install,
 * and the cat chases the reader's actual cursor. Nothing here reimplements
 * the trick; the product does its own job on the page that lists it.
 *
 * THE BIT ENDS ON A TIMER, not when the cursor leaves the column. The engine
 * positions the cat `fixed`, so the chase is viewport-wide — a cursor leaving
 * the column is usually a reader playing, and a demo that ends the moment you
 * engage with it punishes the engagement. Ten seconds is the arc: the cat
 * crosses the page to reach you, catches you, settles; then it runs off the
 * nearest edge and the page is plain again. Re-dwell and it returns — a cat
 * that comes when called twice is the product working, not a bit repeating.
 *
 * On touch there is no cursor to chase, so the cat gets a synthetic one: it
 * enters at the left edge at the row's height, startles, runs the width of
 * the viewport, and leaves. Same engine, same sprite, fed one fake mousemove.
 *
 * Lazy throughout: the engine is dynamically imported on first act, and its
 * cat ships as a data URL inside the bundle — no asset request, no ?url
 * plumbing, no cost to a reader who never dwells. The engine's own element is
 * `pointer-events: none`, so no click ever lands on a cat.
 */

import { ambient } from "@/scripts/friend";

const ROW = 'li[data-entry="onandemo.js"]';

/* Pinned to the installed preset (onandemo@0.0.2): 32px cells, and the two
   horizontal run states off its sheet. The exit borrows exactly these and
   nothing else; if the preset ever redraws, this is the whole coupling. */
const CELL = 32;
const RUN_E = [
  [3, 0],
  [3, 1],
] as const;
const RUN_W = [
  [4, 2],
  [4, 3],
] as const;

/* The engine's own cadence, kept so the exit matches its gait. */
const TICK_MS = 100;
const CHASE_MS = 10_000;
/* Three times the engine's default speed: a cat that has decided to leave
   does not amble. */
const EXIT_SPEED = 30;

/* One cat at a time. Ambient acts re-fire on every re-dwell; this makes the
   second dwell a no-op until the first cat has fully left. */
let active = false;

/* The engine's destroy() is instant, and a cat does not teleport. So the
   exit clones the element the engine made — its inline styles carry the
   sheet, the size, the exact spot it was standing — destroys the engine, and
   runs the clone off the edge on the engine's own run frames. When the clone
   clears the viewport it is removed, and the row is armed again. */
function exitRun(el: HTMLElement, east: boolean): void {
  const ghost = el.cloneNode() as HTMLElement;
  /* The id belongs to the engine's element; the next spawn mints a new one. */
  ghost.removeAttribute("id");
  ghost.style.transform = "";
  let x = parseFloat(el.style.left) || 0;
  let frame = 0;
  document.body.appendChild(ghost);
  const timer = window.setInterval(() => {
    x += east ? EXIT_SPEED : -EXIT_SPEED;
    frame += 1;
    const cells = east ? RUN_E : RUN_W;
    const [cx, cy] = cells[frame % 2 ? 1 : 0];
    ghost.style.left = `${x}px`;
    ghost.style.backgroundPosition = `${-cx * CELL}px ${-cy * CELL}px`;
    if (x < -CELL || x > window.innerWidth + CELL) {
      window.clearInterval(timer);
      ghost.remove();
      active = false;
    }
  }, TICK_MS);
}

/* The engine appends #onandemo only after its sheet decodes — a data URL, so
   quick, but not synchronous. Poll briefly and give up quietly if it never
   lands (reduced motion flipping on mid-visit makes the engine mount nothing
   at all, on purpose — its manners, not ours). */
function whenMounted(cb: (el: HTMLElement) => void): void {
  let tries = 40;
  const timer = window.setInterval(() => {
    const el = document.getElementById("onandemo");
    if (el) {
      window.clearInterval(timer);
      cb(el);
      return;
    }
    tries -= 1;
    if (tries <= 0) {
      window.clearInterval(timer);
      active = false;
    }
  }, 50);
}

/* Pointer: the real chase. persist off, so the cat spawns at (32, 32) —
   oneko's birthplace — and the entrance is part of the demo: it has to cross
   the page to reach you. */
async function chase(): Promise<void> {
  const { onandemo } = await import("onandemo");
  const destroy = onandemo({ persist: false });
  whenMounted((el) => {
    window.setTimeout(() => {
      const east = parseFloat(el.style.left) + CELL / 2 > window.innerWidth / 2;
      destroy();
      exitRun(el, east);
    }, CHASE_MS);
  });
}

/* Touch: one walk across, at the row's height. The engine has no spawn
   option, but it has persistence, and it reads localStorage["onandemo"]
   synchronously at mount — so the walk plants the spawn point there and
   takes the key straight back out. (The engine can still write it if the
   reader leaves the page mid-walk; the next walk overwrites it and the
   chase never reads it, so the residue is inert.) If storage is denied the
   engine starts at its birthplace instead and the walk opens with a
   diagonal; fine. */
async function walk(rowY: number): Promise<void> {
  const { onandemo } = await import("onandemo");
  try {
    localStorage.setItem("onandemo", JSON.stringify({ x: -CELL / 2, y: rowY }));
  } catch {
    /* no storage, no planted spawn */
  }
  /* The crossing is timed, not the speed: default pace on a phone, scaled up
     on wider hover-less viewports so the walk stays about four seconds. */
  const speed = Math.max(10, Math.round(window.innerWidth / 40));
  const destroy = onandemo({ persist: true, speed });
  try {
    localStorage.removeItem("onandemo");
  } catch {
    /* nothing to take back */
  }
  whenMounted((el) => {
    /* A beat before the cursor speaks, so the engine's alert pose gets its
       ticks: the cat notices, then runs. */
    window.setTimeout(() => {
      document.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: window.innerWidth + 300,
          clientY: rowY,
        }),
      );
    }, 400);
    /* The engine clamps the cat inside the viewport, so it arrives at the
       right edge and runs in place. That is the handoff: destroy, and let
       the exit carry it off. The tick cap is a seatbelt — past it, the cat
       leaves from wherever it got to. */
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks += 1;
      const x = parseFloat(el.style.left) || 0;
      if (x >= window.innerWidth - CELL - 0.5 || ticks > 150) {
        window.clearInterval(timer);
        destroy();
        exitRun(el, true);
      }
    }, TICK_MS);
  });
}

export function register(): void {
  const row = document.querySelector(ROW);
  if (!row) return;
  ambient({
    el: row,
    /* No `once` and no `still`, both on purpose: the act repeats because a
       working product bears repeating, and there is no static form because a
       chase is pure motion — reduced-motion readers get the page at rest.
       The engine agrees: under reduced motion it mounts nothing at all. */
    act: () => {
      if (active) return;
      active = true;
      const done = (): void => {
        active = false;
      };
      if (matchMedia("(hover: hover)").matches) {
        chase().catch(done);
      } else {
        const r = row.getBoundingClientRect();
        const y = Math.min(
          Math.max(r.top + r.height / 2, CELL),
          window.innerHeight - CELL,
        );
        walk(y).catch(done);
      }
    },
  });
}
