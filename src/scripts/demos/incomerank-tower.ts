/**
 * INCOMERANK'S OWN MACHINERY, VENDORED — the geometry from `src/lib/tower.ts`,
 * the ratchet from `src/lib/sound.ts`, and a downsample of the distribution
 * from `src/data/world.json`, all from github.com/jassuwu/incomerank (MIT).
 * Real mechanic, real code: the shaft the row's act rides is drawn by the
 * same functions that draw the live reveal, the /r/N share pages and the OG
 * cards — not a re-creation of them.
 *
 * The adaptations, and there are exactly five:
 *
 *   1. `fontScale` on `TowerOpts`. The product renders its shaft near
 *      full-viewport; the miniature renders at roughly 0.6 viewBox scale, so
 *      the source's font sizes land under 6px and the landmark labels — the
 *      one text this act is allowed — become decoration. The scale multiplies
 *      every font size and the offsets that space them, and nothing else.
 *   2. `tick()`/`land()` take `(ctx, out)` instead of owning a module-level
 *      context and master. This site has one mouth (sound.ts) and the bus
 *      hands acts a staged gain; the product's own gate/mute plumbing would
 *      be a second mouth, so it stays behind. The oscillators, envelopes and
 *      numbers are the product's, untouched.
 *   3. The static helpers (`towerFrame`, `towerStill`, the guess-phase
 *      framing constants) are dropped — the act rides, it never serves an
 *      OG card.
 *   5. `tagScale` on `TowerOpts`, multiplying only the tag line's font size:
 *      at the miniature's scale the tags fall under legible even with
 *      `fontScale` at the ceiling the labels tolerate.
 *   4. `WORLD_CDF` is the product's `cdfNom` (the tower's own axis: nominal
 *      market-FX US$/day) downsampled from 1,600 points to 75, log-spaced
 *      with the three quantiles the act quotes — the median, top 18%, top
 *      1% — anchored exactly, so every number the miniature shows is the
 *      data's own to five digits, at a hundredth of the bytes.
 */

// ── axis: income → world-y (up = richer = more negative y) ──────────────────
export const DECADE = 120; //   world units per 10× of income
export const SHAFT_HALF = 112; // shaft half-width — fills the viewBox (±116)
export const VIEW_W = 232; //    viewBox width (portrait shaft + label margins)
export const VIEW_H = 300; //    viewBox height (~2.5 decades visible)
export const CAR_FRAC = 0.54; // the car (your eye-line) sits this far down

export const worldY = (daily: number): number =>
  -DECADE * Math.log10(Math.max(daily, 1e-6));
/** viewBox top (y) that puts `daily` at the car line. */
export const camYFor = (daily: number): number =>
  worldY(daily) - VIEW_H * CAR_FRAC;

/** Income (height) at fraction-below F, from an ascending [income, F] CDF. */
export function incomeAtF(cdf: [number, number][], F: number): number {
  const n = cdf.length;
  if (F <= cdf[0][1]) return cdf[0][0];
  if (F >= cdf[n - 1][1]) return cdf[n - 1][0];
  let lo = 0,
    hi = n - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (cdf[m][1] < F) lo = m;
    else hi = m;
  }
  const t = (F - cdf[lo][1]) / (cdf[hi][1] - cdf[lo][1]);
  return cdf[lo][0] + t * (cdf[hi][0] - cdf[lo][0]);
}
/** Fraction-below for a daily income (inverse of the above). */
export function fracBelow(cdf: [number, number][], daily: number): number {
  const n = cdf.length;
  if (daily <= cdf[0][0]) return cdf[0][1];
  if (daily >= cdf[n - 1][0]) return cdf[n - 1][1];
  let lo = 0,
    hi = n - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (cdf[m][0] < daily) lo = m;
    else hi = m;
  }
  const t = (daily - cdf[lo][0]) / (cdf[hi][0] - cdf[lo][0]);
  return cdf[lo][1] + t * (cdf[hi][1] - cdf[lo][1]);
}

export interface Dot {
  x: number;
  y: number;
}
export interface Floor {
  daily: number;
  y: number;
  label: string;
  tag: string;
  kind: "poor" | "mid" | "you" | "rich" | "famous" | "peak";
}

// Famous-income ladder for the lonely tail (nominal US$/day, estimated
// 2025–2026). The product's own yardstick, basis mixed and disclosed there
// (earnings ÷ 365 for the entertainers, wealth growth ÷ 365 for the
// billionaires — see incomerank's SOURCES.md).
const FAMOUS: Omit<Floor, "y">[] = [
  {
    daily: 110_000,
    label: "Shah Rukh Khan",
    tag: "India · Bollywood · ~$110K/day",
    kind: "famous",
  },
  {
    daily: 233_000,
    label: "MrBeast",
    tag: "US · top creator · ~$233K/day",
    kind: "famous",
  },
  {
    daily: 370_000,
    label: "BTS",
    tag: "S. Korea · K-pop · ~$370K/day",
    kind: "famous",
  },
  {
    daily: 753_000,
    label: "Cristiano Ronaldo",
    tag: "Portugal · football · ~$750K/day",
    kind: "famous",
  },
  {
    daily: 1_100_000,
    label: "Taylor Swift",
    tag: "US · pop music · ~$1.1M/day",
    kind: "famous",
  },
  {
    daily: 18_000_000,
    label: "Aliko Dangote",
    tag: "Nigeria · Africa's richest · +~$18M/day",
    kind: "famous",
  },
  {
    daily: 30_000_000,
    label: "Tadashi Yanai",
    tag: "Japan · Uniqlo · +~$30M/day",
    kind: "famous",
  },
  {
    daily: 50_000_000,
    label: "Mukesh Ambani",
    tag: "India · Reliance · +~$50M/day",
    kind: "famous",
  },
  {
    daily: 120_000_000,
    label: "Jeff Bezos",
    tag: "US · Amazon · +~$120M/day",
    kind: "famous",
  },
  {
    daily: 1_360_000_000,
    label: "Elon Musk",
    tag: "richest person alive · +~$1.4B/day",
    kind: "peak",
  },
];
/** The ceiling of the tower — Elon Musk's estimated daily wealth growth. */
export const TOWER_PEAK_DAILY = FAMOUS[FAMOUS.length - 1].daily;

export interface Tower {
  dots: Dot[];
  floors: Floor[];
  you: { daily: number; y: number; frac: number };
  shaftTopY: number; //    y of the highest drawn landmark (the lonely tail)
  shaftBottomY: number; // y of the ground
  dotsTopY: number; //     y above which the data runs out
}

const fmtDay = (d: number): string =>
  d >= 1000
    ? `$${Math.round(d / 1000)}k/day`
    : d >= 10
      ? `$${Math.round(d)}/day`
      : `$${d.toFixed(2)}/day`;

// deterministic jitter so static frames are stable
const jitter = (i: number): number => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1; // [-1, 1)
};

/**
 * Build the tower for a user income (in the basis of `cdf`). `nDots`
 * people-dots are inverse-CDF sampled, so they cluster where billions live.
 */
export function buildTower(
  cdf: [number, number][],
  youDaily: number,
  nDots = 2200,
): Tower {
  const dataTop = cdf[cdf.length - 1][0];
  const dots: Dot[] = [];
  for (let i = 1; i <= nDots; i++) {
    const F = i / (nDots + 1);
    const income = incomeAtF(cdf, F);
    dots.push({ x: jitter(i) * SHAFT_HALF * 0.97, y: worldY(income) });
  }

  const youFrac = fracBelow(cdf, youDaily);
  const median = incomeAtF(cdf, 0.5);
  const top1 = incomeAtF(cdf, 0.99);

  // landmark floors (poverty → median → you → the rich → a billionaire)
  const base: Omit<Floor, "y">[] = [
    {
      daily: 2.15,
      label: fmtDay(2.15),
      tag: "extreme poverty line",
      kind: "poor",
    },
    {
      daily: median,
      label: fmtDay(median),
      tag: "the world's median person",
      kind: "mid",
    },
    {
      daily: 30,
      label: fmtDay(30),
      tag: "a global middle-class life",
      kind: "mid",
    },
    {
      daily: top1,
      label: fmtDay(top1),
      tag: "the global top 1%",
      kind: "rich",
    },
    { daily: 1000, label: "$1,000/day", tag: "the top 0.1%", kind: "rich" },
    { daily: 10000, label: "$10,000/day", tag: "the top 0.01%", kind: "rich" },
    ...FAMOUS, //                    the famous tail, topping out at Elon Musk
  ];
  const raw: Floor[] = base.map((f) => ({ ...f, y: worldY(f.daily) }));

  const sorted = raw
    .filter((f) => Math.abs(Math.log10(f.daily) - Math.log10(youDaily)) > 0.12)
    .concat([
      {
        daily: youDaily,
        y: worldY(youDaily),
        label: fmtDay(youDaily),
        tag: "YOU",
        kind: "you",
      },
    ])
    .sort((a, b) => a.daily - b.daily);
  // keep labels from stacking: enforce a minimum vertical gap. YOU + the
  // famous tail are always kept (their spacing is hand-curated).
  const floors: Floor[] = [];
  let lastLog = -Infinity;
  for (const f of sorted) {
    const lg = Math.log10(f.daily);
    if (
      f.kind === "you" ||
      f.kind === "famous" ||
      f.kind === "peak" ||
      lg - lastLog > 0.16
    ) {
      floors.push(f);
      lastLog = lg;
    }
  }

  return {
    dots,
    floors,
    you: { daily: youDaily, y: worldY(youDaily), frac: youFrac },
    shaftTopY: worldY(TOWER_PEAK_DAILY), // the shaft runs all the way to Elon
    shaftBottomY: worldY(cdf[0][0]),
    dotsTopY: worldY(dataTop),
  };
}

export interface TowerColors {
  wall: string;
  crowd: string;
  you: string;
  rich: string;
  ink: string;
  muted: string;
  guess: string;
  paper: string;
}

const nn = (v: number): number => Math.round(v * 100) / 100;

export interface TowerOpts {
  guessDaily?: number; //   draw a ghost "guess" line here
  live?: boolean; //        non-scaling strokes for the browser
  clampTopY?: number; //    don't render above this y
  clampBottomY?: number; // don't render below this y
  hideYou?: boolean; //     skip the YOU floor + marker (a car overlay draws it)
  quietFloors?: boolean; // recede ordinary floors so you / guess / Elon pop
  youLabel?: string; //     render a labeled accent "YOU" pill on the shaft
  guessTopLabel?: string; // label text for the guess pill
  fontScale?: number; //    the miniature's knob — see the header
  tagScale?: number; //     the tags' own, on top of it (adaptation 5)
}

/** The shaft body (walls, crowd, floors, you, guess) as an inner-SVG string. */
export function towerBody(t: Tower, c: TowerColors, o: TowerOpts = {}): string {
  const live = o.live ?? true;
  const k = o.fontScale ?? 1;
  const ve = live ? ` vector-effect="non-scaling-stroke"` : "";
  const top = o.clampTopY ?? -Infinity;
  const bot = o.clampBottomY ?? Infinity;
  const bottomY = Math.min(t.shaftBottomY + 30, bot);
  let s = "";

  // a small right-anchored label pill (rect + text), pinned to the right wall.
  const pill = (
    yc: number,
    label: string,
    fillc: string,
    txtc: string,
    borderc?: string,
  ): string => {
    const fs = 7.4 * k;
    const w = label.length * fs * 0.56 + 13 * k;
    const h = 13 * k;
    const xL = SHAFT_HALF - w;
    return (
      `<rect x="${nn(xL)}" y="${nn(yc - h / 2)}" width="${nn(w)}" height="${nn(h)}" rx="${nn(h / 2)}" fill="${fillc}"${borderc ? ` stroke="${borderc}" stroke-width="1"` : ""}/>` +
      `<text x="${nn(SHAFT_HALF - 6 * k)}" y="${nn(yc + 2.6 * k)}" text-anchor="end" font-size="${nn(fs)}" font-weight="700" fill="${txtc}" letter-spacing="0.2">${label}</text>`
    );
  };

  // shaft walls
  for (const x of [-SHAFT_HALF, SHAFT_HALF])
    s += `<line x1="${x}" y1="${nn(Math.max(t.shaftTopY - 40, top))}" x2="${x}" y2="${nn(bottomY)}" stroke="${c.wall}" stroke-width="${live ? 1 : 1.2}" opacity="0.5"${ve}/>`;

  // the crowd of humanity (dense at the bottom, thinning to a lonely tail).
  // Live: wrapped in a vertical motion-blur filter the ride drives by speed.
  if (live)
    s += `<defs><filter id="vblur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur id="vblur-b" in="SourceGraphic" stdDeviation="0 0"/></filter></defs>`;
  s += `<g class="pg-crowd"${live ? ` filter="url(#vblur)"` : ""}>`;
  for (const d of t.dots) {
    if (d.y < top || d.y > bot) continue;
    s += `<circle cx="${nn(d.x)}" cy="${nn(d.y)}" r="1.15" fill="${c.crowd}" opacity="0.55"/>`;
  }
  s += `</g>`;

  // floors: a hairline across the shaft + label inside, left.
  const q = o.quietFloors ?? false;
  const lg = (d: number): number => Math.log10(Math.max(d, 1e-6));
  for (const f of t.floors) {
    if (f.y < top || f.y > bot) continue;
    if (o.hideYou && f.kind === "you") continue;
    const isYou = f.kind === "you";
    const isPeak = f.kind === "peak"; //   Elon: the accented ceiling
    const isFamous = f.kind === "famous";
    const strong = isYou || isPeak; //     solid, emphasized lines
    const col = isYou || isPeak ? c.you : c.ink;
    const haloW = (q ? 2.6 : 2.4) * k;
    const halo = `paint-order="stroke" stroke="${c.paper}" stroke-width="${nn(haloW)}" stroke-linejoin="round"`;
    const lineOp = strong ? 0.95 : isFamous ? 0.5 : q ? 0.26 : 0.32;
    const labelOp = strong ? 1 : q ? 0.78 : 0.9;
    s += `<line x1="${-SHAFT_HALF}" y1="${nn(f.y)}" x2="${SHAFT_HALF}" y2="${nn(f.y)}" stroke="${col}" stroke-width="${strong ? (live ? 2 : 2.4) : live ? 1 : 1.1}" opacity="${lineOp}" stroke-dasharray="${strong ? "" : live ? "3 4" : "4 5"}"${ve}/>`;
    s += `<text x="${-SHAFT_HALF + 5}" y="${nn(f.y - 4.5 * k)}" font-size="${nn((isFamous || isPeak ? 9.6 : 9) * k)}" font-weight="700" fill="${col}" opacity="${labelOp}" ${halo}>${f.label}</text>`;
    // the secondary tag, dropped near the action so it never overlaps the
    // YOU/guess marks.
    const nearAction =
      q &&
      !strong &&
      (Math.abs(lg(f.daily) - lg(t.you.daily)) < 0.35 ||
        (o.guessDaily
          ? Math.abs(lg(f.daily) - lg(o.guessDaily)) < 0.35
          : false));
    if (!nearAction)
      s += `<text x="${-SHAFT_HALF + 5}" y="${nn(f.y + 8 * k)}" font-size="${nn(6.4 * k * (o.tagScale ?? 1))}" fill="${isYou || isPeak ? c.you : c.muted}" opacity="${strong ? 0.95 : q ? 0.7 : 0.85}" letter-spacing="0.3" paint-order="stroke" stroke="${c.paper}" stroke-width="${nn(1.7 * k)}" stroke-linejoin="round">${f.tag.toUpperCase()}</text>`;
    // Elon gets a small ▲ cap so the ceiling reads as a distinct accent FORM
    // from the (also-accent) YOU marks.
    if (isPeak)
      s += `<text x="0" y="${nn(f.y - 2.5)}" text-anchor="middle" font-size="${nn(9 * k)}" fill="${c.you}">▲</text>`;
  }

  // YOUR GUESS — deliberately UNLIKE the truth so they can never be confused:
  // muted (not accent), a HOLLOW ring on the right wall (not a filled center
  // dot), a longer "5 4" dash, and a right-anchored pill.
  if (o.guessDaily) {
    const gy = worldY(o.guessDaily);
    if (gy >= top && gy <= bot) {
      s += `<line x1="${-SHAFT_HALF}" y1="${nn(gy)}" x2="${SHAFT_HALF}" y2="${nn(gy)}" stroke="${c.guess}" stroke-width="${live ? 1.4 : 1.6}" opacity="0.7" stroke-dasharray="5 4"${ve}/>`;
      s += `<circle cx="${SHAFT_HALF}" cy="${nn(gy)}" r="${nn(3.6 * k)}" fill="${c.paper}" stroke="${c.guess}" stroke-width="1.4"/>`;
      s += pill(
        gy - 11 * k,
        o.guessTopLabel ?? "YOUR GUESS",
        c.paper,
        c.guess,
        c.wall,
      );
    }
  }

  // YOU — the truth: a labeled accent pill (the car overlay supplies the dot
  // and eye-line), or the plain glowing dot when no label is asked for.
  const yy = t.you.y;
  if (o.youLabel && yy >= top && yy <= bot) {
    s += `<g class="you-mark">${pill(yy - 11 * k, o.youLabel, c.you, c.paper)}</g>`;
  } else if (!o.hideYou && yy >= top && yy <= bot) {
    s += `<circle cx="0" cy="${nn(yy)}" r="4.5" fill="${c.you}"/>`;
    s += `<circle cx="0" cy="${nn(yy)}" r="8" fill="none" stroke="${c.you}" stroke-width="${live ? 1 : 1.2}" opacity="0.6"${ve}/>`;
  }
  return s;
}

// ── the casino ratchet, re-plumbed into the site's one mouth ────────────────

/** A short, bright mechanical tick (one notch of the selector). */
export function tick(ctx: AudioContext, out: GainNode, vol = 0.32): void {
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.value = 1500 + Math.random() * 220;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.05);
  // the bus only disconnects its own gain when the next act ducks this one;
  // each tick tidies its private nodes the moment it has rung out.
  o.onended = () => g.disconnect();
}

/** The satisfying landing: a low thunk + a short chime. */
export function land(ctx: AudioContext, out: GainNode, trim = 1): void {
  const t = ctx.currentTime;
  const thunk = ctx.createOscillator();
  thunk.type = "sine";
  thunk.frequency.setValueAtTime(240, t);
  thunk.frequency.exponentialRampToValueAtTime(90, t + 0.2);
  const tg = ctx.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.55 * trim, t + 0.012);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  thunk.connect(tg).connect(out);
  thunk.start(t);
  thunk.stop(t + 0.55);
  thunk.onended = () => tg.disconnect();

  const chime = ctx.createOscillator();
  chime.type = "sine";
  chime.frequency.value = 1320;
  const cg = ctx.createGain();
  cg.gain.setValueAtTime(0.0001, t + 0.03);
  cg.gain.exponentialRampToValueAtTime(0.22 * trim, t + 0.06);
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  chime.connect(cg).connect(out);
  chime.start(t + 0.03);
  chime.stop(t + 0.5);
  chime.onended = () => cg.disconnect();
}

// ── the world, downsampled ──────────────────────────────────────────────────

/** People the product's distribution actually covers (`world.json`). */
export const WORLD_POP = 8_141_808_945;

/**
 * The product's `cdfNom` — nominal market-FX US$/day against fraction-below,
 * built from World Bank PIP, Pareto-tailed with WID.world — at 75 of its
 * 1,600 points. See adaptation 4 in the header.
 */
export const WORLD_CDF: [number, number][] = [
  [0.05, 0.00291],
  [0.0592, 0.00307],
  [0.0701, 0.00327],
  [0.083, 0.00351],
  [0.0982, 0.0038],
  [0.1163, 0.00417],
  [0.1376, 0.00469],
  [0.1629, 0.00539],
  [0.1929, 0.0064],
  [0.2284, 0.00792],
  [0.2704, 0.01017],
  [0.3201, 0.01338],
  [0.3789, 0.01804],
  [0.4486, 0.02496],
  [0.531, 0.03459],
  [0.6287, 0.04711],
  [0.7443, 0.06584],
  [0.8811, 0.09255],
  [1.0431, 0.12975],
  [1.2349, 0.1787],
  [1.4619, 0.23565],
  [1.7307, 0.29417],
  [2.0489, 0.34733],
  [2.4256, 0.3918],
  [2.8715, 0.43437],
  [3.3994, 0.4753],
  [3.7976, 0.5],
  [4.0244, 0.51433],
  [4.7643, 0.55139],
  [5.6403, 0.59048],
  [6.6772, 0.62885],
  [7.9049, 0.66668],
  [9.3582, 0.70254],
  [11.079, 0.73561],
  [13.116, 0.76495],
  [15.527, 0.79009],
  [18.382, 0.81151],
  [19.822, 0.82],
  [21.761, 0.8299],
  [25.762, 0.84694],
  [30.498, 0.86316],
  [36.105, 0.87894],
  [42.743, 0.8946],
  [50.602, 0.91022],
  [59.905, 0.92556],
  [70.919, 0.93977],
  [83.957, 0.95236],
  [99.393, 0.96291],
  [117.67, 0.97122],
  [139.3, 0.97758],
  [164.91, 0.98248],
  [195.23, 0.98623],
  [231.12, 0.98878],
  [260.55, 0.99],
  [273.62, 0.99083],
  [323.92, 0.99322],
  [383.47, 0.99499],
  [453.98, 0.99629],
  [537.44, 0.99726],
  [636.25, 0.99797],
  [753.23, 0.9985],
  [891.71, 0.99889],
  [1055.65, 0.99917],
  [1249.73, 0.99938],
  [1479.5, 0.99953],
  [1751.51, 0.99965],
  [2073.53, 0.99973],
  [2454.75, 0.9998],
  [2906.06, 0.99985],
  [3440.35, 0.99989],
  [4072.87, 0.99991],
  [4821.67, 0.99994],
  [5708.15, 0.99995],
  [6757.6, 0.99996],
  [8000.0, 0.99997],
];
