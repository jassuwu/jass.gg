/**
 * THE ROW RIDES ITS OWN SHAFT (ticket 22, instance three of the takeover).
 *
 * incomerank's one move is guess-then-reveal: you drag a puck to where you
 * think you rank, then ride a log-scale elevator up past labelled floors —
 * the poverty line, the median person, the global top 1%, the famous — to
 * where you actually are, with a ratchet tick for every notch of the climb,
 * and the guess left behind on the wall showing how wrong you were. So the
 * row's act is that ride, in miniature, and it runs itself: jass's words,
 * "a small demo that just runs by itself, not the entire app."
 *
 * THE MACHINERY IS THE PRODUCT'S, VENDORED, NOT AN HOMAGE — see the header
 * of `incomerank-tower.ts`: the shaft is drawn by the same `towerBody` that
 * draws the live reveal, the share pages and the OG cards; the ticks and
 * the landing thunk are the same oscillators and envelopes; the crowd of
 * dots is the product's own distribution, inverse-CDF sampled so it thickens
 * where billions live and thins to a lonely tail. Nothing here is a picture
 * of the product. It is the product's code drawing the product's numbers.
 *
 * THE CHOREOGRAPHY IS BORROWED TOO, from the product's own README demo
 * (`remotion/src/choreography.ts`): the same subject — ₹50,000 a month in
 * India, about $20 a day at market rates — the same honest guess ("I'm
 * average": the global median, top 50%), the same truth (top ~18%), the same
 * beats in the same order, ENTRY → ASCENT → HOLD → TAIL → ELON. The README
 * runs eighteen seconds with an input form up front; this is a row, not a
 * video, so the form is cut outright and the rest is compressed to under
 * nine — a reader probing a row will give it that, and no more.
 *
 * The beats, in this miniature:
 *
 *   ENTRY   the shaft appears over the row, car at the ground, the crowd
 *           dense around it. The guess is already on the wall — the product
 *           bakes the bet into the shaft so the car visibly passes it.
 *   ASCENT  the car climbs, easing in and out the way the product's does,
 *           one tick per notch: slow, machine-gun, slow. It passes the
 *           poverty line, then the median with its GUESS pill, and keeps
 *           going — that overshoot is the entire point of the product.
 *   HOLD    it lands (thunk, chime). The floor lights: $20/day · YOU · TOP
 *           18%, and the guess sits below it with the gap between them
 *           labelled in people — 2.6 billion — the product's own number.
 *   TAIL    a steady climb past the famous ladder, ticking hard, floors and
 *           names streaming down through the box.
 *   ELON    the second landing, at the ceiling. His floor, his number, and
 *           the multiple the README quotes — how many times the subject's
 *           day he makes in his. The tail rings out, and the shaft is gone.
 *
 * EVERY WORD ON SCREEN IS THE PRODUCT'S: landmark labels and tags from its
 * tower module, its GUESS pill, its YOU floor, and three machine facts
 * formatted by its own formatters (rank-copy.ts, ported at three lines each).
 * Nothing is instructed, nothing is captioned, nothing is in jass's voice.
 *
 * THE BOX IS THE ROW'S REGION PLUS A HALO, the mojify projector's shape: a
 * small portrait window centered on the row, on an opaque page-colour
 * ground, clamped into the viewport. The product's own top-and-bottom fade
 * is on it, and a matching side fade, so the crowd dissolves into the page
 * at the edges instead of being a card — nothing on this site has a border
 * and this is not the thing that gets one. `aria-hidden`, `pointer-events:
 * none`: a projection, not a surface. The car is an HTML overlay at the
 * product's own eye-line fraction, exactly as its remotion Shaft draws it,
 * so the floor lines land on it to the pixel.
 *
 * THE RATCHET GOES THROUGH THE ONE MOUTH. The act takes the bus once, at
 * whisper tier — a dwell is not consent, and a click that could be heard at
 * full would be the only thing on the page that is — and every tick and
 * both landings go into that staged gain for the length of the ride. Before
 * the reader's first gesture the bus refuses and the ride plays mute, which
 * is the browser's law and the murmur's whole reason. If another act takes
 * the mouth mid-ride the bus ducks this one, and the ticks simply stop
 * arriving, which is the one-mouth rule working as written. A natural
 * finish leaves the chime ringing; every other exit takes the sound with
 * it, because the reader asked for the page back.
 *
 * THE EASY OUT IS SACRED. Escape and click-anywhere from the shared easyOut,
 * which swallows the entry tap by clock. This act's own exits: on hover
 * devices the region is the box plus a margin, checked live on pointermove
 * and re-checked on scroll (a wheel moves the box under a still hand); on
 * touch, any scroll is walking away. A hidden tab ends it. A resize only
 * re-places the box. Every exit is instant; only the natural ending fades,
 * because nobody asked for that one.
 *
 * Reduced motion gets the honest still: the product ships exactly this
 * frame as its share card — the landed shaft, YOU lit, the guess left
 * below, the gap in people — so that frame is registered as `still`. No
 * ride, no blur, no fade, no sound; it appears, holds a beat, and goes.
 */
import { easyOut, entry, occupy } from "@/scripts/friend";
import { play, stopAll } from "@/scripts/sound";

import {
  buildTower,
  camYFor,
  CAR_FRAC,
  fracBelow,
  incomeAtF,
  land,
  SHAFT_HALF,
  tick,
  TOWER_PEAK_DAILY,
  towerBody,
  VIEW_H,
  WORLD_CDF,
  WORLD_POP,
  worldY,
  type TowerColors,
} from "./incomerank-tower";

/* ---- the subject, the product's own demo subject ---- */

/* ₹50,000 a month in India, converted the way the product converts it:
   ÷ 12 months, ÷ 365 days, ÷ the market rate its IND.json carries (83.67 ₹
   per US$, 2024). The tower's axis is nominal US$/day, so this is ~$19.6. */
const INR_PER_USD = 83.67;
const YOU_DAILY = (50_000 * 12) / 365 / INR_PER_USD;
/* The honest guess: "I'm about average". The global median, top 50%. */
const GUESS_TOP = 50;
const GUESS_DAILY = incomeAtF(WORLD_CDF, 0.5);
const YOU_FRAC = fracBelow(WORLD_CDF, YOU_DAILY);
/* The ground and the ceiling: the poorest income the data covers, and the
   richest person alive. The ride runs the full height, as the product's. */
const BOTTOM = WORLD_CDF[0][0];
const PEAK = TOWER_PEAK_DAILY;

/* The product's own formatters (rank-copy.ts), so the three numbers the
   miniature reveals are spelled the way the product spells them. */
const fmtTop = (top: number): string =>
  top >= 1 ? `${Math.round(top)}%` : top >= 0.1 ? `${top.toFixed(1)}%` : "0.1%";
const fmtPeople = (n: number): string =>
  n >= 1e9
    ? `${(n / 1e9).toFixed(1)} billion`
    : n >= 1e6
      ? `${Math.round(n / 1e6)} million`
      : Math.round(n).toLocaleString("en-US");
const fmtMult = (m: number): string =>
  m >= 1e6 ? `${Math.round(m / 1e6)} million×` : `${Math.round(m)}×`;

const YOU_LABEL = `TOP ${fmtTop((1 - YOU_FRAC) * 100)}`;
const GAP_LABEL = `${fmtPeople(WORLD_POP * Math.abs(YOU_FRAC - 0.5))} people`;
const ELON_LABEL = fmtMult(PEAK / YOU_DAILY);

/* ---- the beats (ms), the product's order at a row's length ---- */

const ENTRY = 600;
const ASCENT = 2000;
const HOLD = 1500;
const TAIL = 3200;
const ELON = 1300;
const ENTRY_END = ENTRY;
const ASCENT_END = ENTRY_END + ASCENT;
const HOLD_END = ASCENT_END + HOLD;
const TAIL_END = HOLD_END + TAIL;
const TOTAL = TAIL_END + ELON;
/* The still holds about as long as the product's HOLD beat, and a little. */
const STILL_MS = 3000;

/* The ratchet: one tick per notch of vertical travel, the product's notch,
   its three-per-frame cap, and its backlog drop at peak speed. */
const TICK_NOTCH = 11;

/* THE LADDER, AND THESE ARE JASS'S KNOBS. The product mixes its tick at
   0.32 and its landing at 1.0 against a master of its own; the bus stages a
   whisper of 0.08 above these, so they are lifted toward the rung's ceiling
   the way every synth act here stages itself. Loud is the bus's business. */
const TICK_VOL = 0.5;
const LAND_TRIM = 1.5;

/* ---- the box ---- */

/* Portrait, the shaft's own shape. The height sets the scale — 300 viewBox
   units into 220px — and the width buys a margin of page either side of
   the walls so the side fade has something to fade. Small on purpose. */
const H_PX = 220;
const W_PX = 220;
/* The one knob the vendored tower grew: the product's labels at this scale
   land under 7px, so they are lifted until the floor labels sit near the
   page's micro step. 1.6 is as far as it goes before neighbouring famous
   floors start overprinting each other. */
const FONT_SCALE = 1.6;
/* The floor tags — the story of the climb — on top of FONT_SCALE: at 1.6
   alone they land near 7.5px on screen and read as texture. */
const TAG_SCALE = 1.25;
const DOTS = 1400;
/* The region's forgiveness: how far past the box a hand may drift. */
const HALO = 24;

const SCALE = H_PX / VIEW_H;
const VB_W = W_PX / SCALE;
/* Where the walls fall inside the box, for the car's eye-line. */
const WALL_PCT = ((VB_W / 2 - SHAFT_HALF) / VB_W) * 100;

/* Tokens only, one light-dark at its one declaration site — the tower
   speaks in CSS colour strings, so it speaks in the page's own. `you` is the
   text-safe accent rather than the mark: the product's YOU pill sets its
   text in paper, and in light mode paper is white, which the invariant lime
   could not carry. The car below is a fill too — the one thing the eye
   follows for nine seconds — so it takes the accent, not the mark: the
   mark is 1.16:1 on white, fine for a hover stroke, invisible on a mover. */
const COLORS: TowerColors = {
  wall: "var(--color-muted-foreground)",
  crowd: "var(--color-foreground)",
  you: "var(--color-accent)",
  rich: "var(--color-muted-foreground)",
  ink: "var(--color-foreground)",
  muted: "var(--color-muted-foreground)",
  guess: "var(--color-muted-foreground)",
  paper: "var(--color-background)",
};

const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const logLerp = (a: number, b: number, t: number): number =>
  Math.pow(10, Math.log10(a) + (Math.log10(b) - Math.log10(a)) * t);

/** The income at the car line at time t — the product's camera, in ms. */
function camDailyAt(t: number): number {
  if (t <= ENTRY_END) return BOTTOM;
  if (t < ASCENT_END)
    return logLerp(BOTTOM, YOU_DAILY, easeInOutCubic((t - ENTRY_END) / ASCENT));
  if (t <= HOLD_END) return YOU_DAILY;
  if (t < TAIL_END) return logLerp(YOU_DAILY, PEAK, (t - HOLD_END) / TAIL);
  return PEAK;
}

interface Shaft {
  body: string;
  landing: string;
  peak: string;
}

/* The shaft, built once on first act and kept — it is income-independent
   from then on; only the viewBox and the crowd's blur move per frame. */
let shaft: Shaft | undefined;

function build(): Shaft {
  if (shaft) return shaft;
  const t = buildTower(WORLD_CDF, YOU_DAILY, DOTS);
  const k = FONT_SCALE;
  const nn = (v: number): number => Math.round(v * 100) / 100;
  /* The body, YOU hidden: the car overlay is the marker until it lands. The
     guess is baked in with the product's own pill so the ride passes it. */
  const body = towerBody(t, COLORS, {
    live: true,
    hideYou: true,
    guessDaily: GUESS_DAILY,
    guessTopLabel: `GUESS · TOP ${GUESS_TOP}%`,
    quietFloors: true,
    fontScale: k,
    tagScale: TAG_SCALE,
  });
  /* The landing: the same renderer clamped to a two-unit band around YOU,
     which leaves it nothing to draw but that floor — its line, its label,
     its tag, and the pill the product puts on the truth. Static strokes,
     no filter, so it carries no second copy of the blur's id. Below it,
     centered in the gap, the people between the bet and the fact. */
  const yy = t.you.y;
  const gy = worldY(GUESS_DAILY);
  const halo = `paint-order="stroke" stroke="${COLORS.paper}" stroke-width="${nn(2 * k)}" stroke-linejoin="round"`;
  const landing =
    towerBody(t, COLORS, {
      live: false,
      clampTopY: yy - 1,
      clampBottomY: yy + 1,
      youLabel: YOU_LABEL,
      fontScale: k,
      tagScale: TAG_SCALE,
    }) +
    `<text x="0" y="${nn((yy + gy) / 2 + 2.6 * k)}" text-anchor="middle" font-size="${nn(7.4 * k)}" fill="${COLORS.muted}" letter-spacing="0.3" ${halo}>${GAP_LABEL.toUpperCase()}</text>`;
  /* The ceiling's number, right-anchored on Elon's floor, in his colour. */
  const py = worldY(PEAK);
  const peak = `<text x="${nn(SHAFT_HALF - 6 * k)}" y="${nn(py + 8 * k)}" text-anchor="end" font-size="${nn(7.4 * k)}" font-weight="700" fill="${COLORS.you}" letter-spacing="0.2" ${halo}>${ELON_LABEL}</text>`;
  shaft = { body, landing, peak };
  return shaft;
}

/* ---- the act ---- */

export function register(): void {
  const row = document.querySelector<HTMLElement>(
    'li[data-entry="incomerank"]',
  );
  if (!row) return;

  const pointerish = matchMedia("(hover: hover)");

  /* Last pointer position over the page, for the region check: pointermove
     is silent during a wheel-scroll, so the scroll handler re-checks with
     the pointer's last known viewport spot, which scrolling doesn't move. */
  let lastX = 0;
  let lastY = 0;
  row.addEventListener("pointermove", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  });

  let live = false;
  let box: HTMLElement | undefined;
  let frame: number | undefined;
  let timer: number | undefined;
  let release: (() => void) | undefined;
  let offOut: (() => void) | undefined;
  let place = (): void => {};

  /* The region is the row AND the box, plus the halo. The box is narrower
     than the row (a shaft, not a banner), and a dwell that began on the
     name or the description's far end must not be ended by the first
     pixel of pointermove after mount: the region contains its own door. */
  const inRegion = (x: number, y: number): boolean => {
    if (!box) return false;
    const b = box.getBoundingClientRect();
    const w = row.getBoundingClientRect();
    return (
      x >= Math.min(b.left, w.left) - HALO &&
      x <= Math.max(b.right, w.right) + HALO &&
      y >= Math.min(b.top, w.top) - HALO &&
      y <= Math.max(b.bottom, w.bottom) + HALO
    );
  };

  const end = (silence: boolean): void => {
    if (!live) return;
    live = false;
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
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
    /* The natural finish leaves the chime ringing; a reader who asked for
       the page back gets silence with it. */
    if (silence) stopAll();
  };

  const onMove = (e: PointerEvent): void => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!inRegion(lastX, lastY)) end(true);
  };
  const onScroll = (): void => {
    /* On touch a scroll is walking away, full stop. On hover devices the
       page just moved under a still hand — same containment question. */
    if (!pointerish.matches || !inRegion(lastX, lastY)) end(true);
  };
  const onHide = (): void => {
    if (document.hidden) end(true);
  };

  /** Mount the shaft over the row. `ride` is the act; `!ride` is the still. */
  const mount = (ride: boolean): void => {
    if (live) return;
    live = true;
    /* A takeover holds the stage: nothing else starts over a live shaft. */
    release = occupy();

    const { body, landing, peak } = build();

    box = document.createElement("div");
    box.setAttribute("aria-hidden", "true");
    /* Real text in the machine role: the labels are facts, and the mono is
       the only face on the page that could pass for an instrument's. */
    box.className = "font-machine";
    box.style.cssText =
      `position:absolute;z-index:10;width:${W_PX}px;height:${H_PX}px;` +
      `background:var(--color-background);pointer-events:none;overflow:hidden;` +
      /* The product's own vertical fade, and a side fade to match it, so
         the box has no edge — the crowd thins into the page. */
      `mask-image:linear-gradient(to bottom,transparent,#000 9%,#000 91%,transparent),` +
      `linear-gradient(to right,transparent,#000 8%,#000 92%,transparent);` +
      `mask-composite:intersect;`;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block";
    svg.innerHTML =
      body +
      `<g class="ir-land" opacity="${ride ? 0 : 1}">${landing}</g>` +
      `<g class="ir-peak" opacity="0">${peak}</g>`;
    box.append(svg);

    /* The car: the product's eye-line at CAR_FRAC, wall to wall, and the
       glowing dot the floors land on. A fill and a rule — the mark's two
       permitted jobs. */
    const car = document.createElement("div");
    car.style.cssText = `position:absolute;left:${WALL_PCT}%;right:${WALL_PCT}%;top:${CAR_FRAC * 100}%;height:0`;
    car.innerHTML =
      `<div style="position:absolute;left:0;right:0;top:-1px;height:2px;background:var(--color-accent);opacity:.9"></div>` +
      `<div style="position:absolute;left:50%;top:0;width:10px;height:10px;transform:translate(-50%,-50%);border-radius:9999px;background:var(--color-accent);box-shadow:0 0 0 4px color-mix(in oklab,var(--color-accent) 22%,transparent)"></div>`;
    box.append(car);

    const blur = svg.querySelector("feGaussianBlur");
    const landG = svg.querySelector<SVGGElement>(".ir-land");
    const peakG = svg.querySelector<SVGGElement>(".ir-peak");
    const look = (daily: number): void =>
      svg.setAttribute(
        "viewBox",
        `${-VB_W / 2} ${camYFor(daily)} ${VB_W} ${VIEW_H}`,
      );
    look(ride ? BOTTOM : YOU_DAILY);

    place = (): void => {
      if (!box) return;
      const r = row.getBoundingClientRect();
      /* Centered on the row — the halo above and below is the takeover's
         region — then clamped so the whole shaft is always on screen. */
      const top = Math.max(
        8,
        Math.min(r.top + r.height / 2 - H_PX / 2, innerHeight - H_PX - 8),
      );
      box.style.left = `${scrollX + r.left + (r.width - W_PX) / 2}px`;
      box.style.top = `${scrollY + top}px`;
    };
    place();
    document.body.append(box);

    /* The universal exits arrive with the box: the tap that summoned it is
       already stamped before them. */
    offOut = easyOut(() => end(true));
    if (pointerish.matches) document.addEventListener("pointermove", onMove);
    document.addEventListener("visibilitychange", onHide);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", place);

    if (!ride) {
      /* The still: the share card's frame, held, then gone. No fades —
         the reader asked for none. */
      timer = window.setTimeout(() => end(false), STILL_MS);
      return;
    }

    /* The site's one timing word, on the way in only. */
    box.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 140,
      easing: "ease-out",
    });

    /* Ask for the mouth once, for the whole ride. Before the gate the bus
       refuses and these stay undefined; not a pixel below depends on them. */
    let ctx: AudioContext | undefined;
    let out: GainNode | undefined;
    play({
      tier: "whisper",
      synth: (c, g) => {
        ctx = c;
        out = g;
      },
    });

    const reveal = (g: SVGGElement | null): void => {
      g?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 260,
        easing: "ease-out",
        fill: "forwards",
      });
    };

    /* The ride. Wall-clock, not `ctx.currentTime`, because there may be no
       context at all and a suspended one does not advance. */
    const t0 = performance.now();
    let prevY = worldY(BOTTOM);
    let prevT = t0;
    let acc = 0;
    let landedYou = false;
    let landedPeak = false;
    const step = (now: number): void => {
      if (!live) return;
      const t = now - t0;
      const daily = camDailyAt(t);
      look(daily);

      /* The ratchet: the product's accumulator, walked frame by frame. */
      const y = worldY(daily);
      const d = Math.abs(y - prevY);
      acc += d;
      let fired = 0;
      while (acc >= TICK_NOTCH && fired < 3) {
        acc -= TICK_NOTCH;
        if (ctx && out) tick(ctx, out, TICK_VOL);
        fired++;
      }
      if (acc > TICK_NOTCH) acc = TICK_NOTCH;

      /* Velocity blur on the crowd, the product's curve. */
      const dt = Math.max(1, now - prevT);
      blur?.setAttribute(
        "stdDeviation",
        `0 ${Math.min(4, (d / dt) * 8).toFixed(2)}`,
      );
      prevY = y;
      prevT = now;

      if (!landedYou && t >= ASCENT_END) {
        landedYou = true;
        if (ctx && out) land(ctx, out, LAND_TRIM);
        reveal(landG);
      }
      if (!landedPeak && t >= TAIL_END) {
        landedPeak = true;
        if (ctx && out) land(ctx, out, LAND_TRIM);
        reveal(peakG);
      }
      if (t >= TOTAL) {
        /* The ending reads as an ending: the shaft fades, the chime rings
           on, and the page is exactly itself. */
        frame = undefined;
        const fade = box?.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 200,
          easing: "ease-out",
          fill: "forwards",
        });
        if (fade) fade.onfinish = () => end(false);
        else end(false);
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };

  /* Dwell on hover devices, tap on the description everywhere — and the
     ride speaks, so the row earns the murmur. No `once`: a fact bears
     repeating, and a tap is consent. `still` is the share card's frame. */
  entry({
    el: row,
    act: () => mount(true),
    still: () => mount(false),
    sound: true,
  });
}
