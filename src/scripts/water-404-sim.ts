/**
 * THE WATER (ticket 23), part two: the water. jass's directive was to copy a
 * physics that already works, not to invent one, so the surface here is the
 * classic spring-column heightfield from Michael Hoffman's "Make a Splash
 * With Dynamic 2D Water Effects" — every column of water is a spring obeying
 * Hooke's law, and neighbouring columns pull on each other so waves actually
 * travel. The proven constants and the update loop are vendored verbatim
 * (adapted from C# to TypeScript, y-axis flipped for canvas) from the
 * official Tuts+ repository:
 *
 *   https://github.com/tutsplus/unity-2d-water-effect  (Water.cs)
 *
 *   Copyright (c) 2014, Tuts+
 *   All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions are
 *   met:
 *
 *   1. Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *   A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 *   HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 *   SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 *   LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *   DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *   THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 *   OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * What was stripped: Unity meshes, LineRenderers, colliders, the per-splash
 * particle prefabs. What was kept, untouched: the spring step, the two-pass
 * neighbour spread run eight times, the splash-by-velocity entry point.
 * Everything around it — the tears, the rise, the pointer, the drawing —
 * is scenario code, not physics.
 *
 * The other candidates, for the record: Pavel Dobryakov's WebGL fluid is
 * dye advection in a sealed box — gorgeous, but nothing pools and nothing
 * rises, which is the whole bit. LiquidFun pools beautifully and costs a
 * megabyte of emscripten. This is ~4 KB and it is the same water every
 * platformer you loved used.
 *
 * The scenario: the 😔 in the joke line tears up. Drops form, fall, splash.
 * Water accumulates from the bottom over MINUTES — the reader who leaves at
 * twenty seconds sees an inch of water and a crying emoji, which is already
 * the joke. The pointer disturbs the surface. Nothing is ever blocked: the
 * canvas is fixed, pointer-events none, and translucent — the page reads
 * through it. No accent: water is water, so it borrows the page's ink at
 * low alpha and works over both schemes for free.
 *
 * If the frame budget slips the sim shrinks (fewer spread passes, then
 * coarser columns) and the frame rate does not. Hidden tab: the loop stops
 * dead. Reduced motion flipping on mid-flood: everything drains (removed).
 * No sound in this pass.
 */

/* ---- the vendored physics (Water.cs, adapted) ---- */

/** springconstant, damping, spread — Hoffman's tuning, not ours. Unitless,
 * per fixed step; the feel lives in these three numbers and they are the
 * thing we were told to copy. */
const K = 0.02;
const DAMP = 0.04;
const SPREAD = 0.05;
/** Hoffman runs the spread eight times per step so waves outrun their own
 * decay. First thing sacrificed if a laptop can't keep up. */
const FULL_PASSES = 8;

/* ---- scenario tuning ---- */

const STEP = 1 / 60;
/** css px between columns. Doubles if the frame budget slips. */
const BASE_SPACING = 6;
/** rise: level(t) = RISE_MAX * (1 - e^(-t/RISE_TAU)), t from the first
 * splash. ~80 px at twenty seconds (the inch), ~three quarters of the way
 * at three minutes, asymptotic forever — the page never drowns. */
const RISE_TAU = 90;
const RISE_FRAC = 0.45;
const GRAVITY = 1400;
/** px-per-second impact → px-per-step splash velocity, softened. */
const IMPACT = 0.55 * STEP;
const MAX_SPLASH = 14;
const TEAR_R = 2.6;
const FORM_S = 0.55;
const EMOJI = "\u{1F614}";

interface Drop {
  x: number;
  y: number;
  r: number;
  vy: number;
  /** forming: clinging to the emoji, growing. falling: gravity's. */
  falling: boolean;
  t: number;
}

interface Spray {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

let started = false;

export function start(): void {
  if (started) return;
  started = true;

  /* The tears need a crier. The emoji lives in the live text — found via
     Range so the DOM is never touched, and re-measured every spawn so
     scroll and resize cost nothing extra. No emoji, no water: the bit has
     no source and silently doesn't exist. */
  let crier: Text | null = null;
  let crierAt = -1;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const at = (n as Text).data.indexOf(EMOJI);
    if (at >= 0) {
      crier = n as Text;
      crierAt = at;
      break;
    }
  }
  if (!crier) return;
  const emojiNode = crier;

  const canvas = document.createElement("canvas");
  /* Above the page, under nothing that matters; pointer-events: none is the
     load-bearing line — every link stays clickable through the flood. */
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:30";
  canvas.setAttribute("aria-hidden", "true");
  const c = canvas.getContext("2d");
  if (!c) return; /* no canvas, no water, no fuss */
  document.body.appendChild(canvas);

  /* ink = the page's foreground token, resolved by the browser for the
     current scheme. Alpha does the glass; the colour is never ours. */
  let ink = "#888";
  const readInk = (): void => {
    ink = getComputedStyle(document.body).color || ink;
  };
  readInk();

  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;

  /* the columns. u = deviation from the resting level (px, down-positive),
     v = velocity (px per step). Rebuilt flat on resize; a resize is a scene
     cut, not a physics event. */
  let n = 0;
  let spacing = BASE_SPACING;
  let u = new Float32Array(0);
  let v = new Float32Array(0);
  let lDelta = new Float32Array(0);
  let rDelta = new Float32Array(0);
  let passes = FULL_PASSES;

  const rebuild = (): void => {
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    n = Math.max(16, Math.ceil(w / spacing) + 1);
    u = new Float32Array(n);
    v = new Float32Array(n);
    lDelta = new Float32Array(n);
    rDelta = new Float32Array(n);
    readInk();
  };
  rebuild();

  let simT = 0;
  /** simT at first landing; -1 = still dry. The rise clock. */
  let wetAt = -1;
  let level = 0;
  const drops: Drop[] = [];
  const spray: Spray[] = [];
  let nextTear = 0.8;
  let leftEye = true;

  const col = (x: number): number =>
    Math.min(n - 1, Math.max(0, Math.round(x / spacing)));
  const surfaceAt = (x: number): number => h - level + u[col(x)];

  /** Water.cs `Splash`: find the column, add velocity. That's the whole
   * proven interface and it stays that way. */
  const splash = (x: number, speed: number): void => {
    v[col(x)] += Math.max(-MAX_SPLASH, Math.min(MAX_SPLASH, speed));
  };

  /* the vendored update, verbatim in structure: Hooke per column, then
     eight passes of neighbour spread hitting velocity AND position, exactly
     as Water.cs does it. Do not tune; it is already water. */
  const stepPhysics = (): void => {
    for (let i = 0; i < n; i++) {
      const force = K * u[i] + DAMP * v[i];
      u[i] += v[i];
      v[i] -= force;
    }
    for (let j = 0; j < passes; j++) {
      for (let i = 0; i < n; i++) {
        if (i > 0) {
          lDelta[i] = SPREAD * (u[i] - u[i - 1]);
          v[i - 1] += lDelta[i];
        }
        if (i < n - 1) {
          rDelta[i] = SPREAD * (u[i] - u[i + 1]);
          v[i + 1] += rDelta[i];
        }
      }
      for (let i = 0; i < n; i++) {
        if (i > 0) u[i - 1] += lDelta[i];
        if (i < n - 1) u[i + 1] += rDelta[i];
      }
    }
  };

  /** Where a tear wells up: just under one eye of the 😔, alternating.
   * Measured live so scrolling never strands the tears mid-air. */
  const eye = (): { x: number; y: number } | null => {
    if (!emojiNode.isConnected) return null;
    const r = document.createRange();
    r.setStart(emojiNode, crierAt);
    r.setEnd(emojiNode, crierAt + 2); /* surrogate pair */
    const b = r.getBoundingClientRect();
    if (b.width === 0) return null;
    leftEye = !leftEye;
    return {
      x: b.left + b.width * (leftEye ? 0.34 : 0.66),
      y: b.top + b.height * 0.58,
    };
  };

  const stepScenario = (): void => {
    simT += STEP;

    nextTear -= STEP;
    if (nextTear <= 0) {
      nextTear = 1.5 + Math.random() * 1.5;
      const at = eye();
      if (at)
        drops.push({ x: at.x, y: at.y, r: 0.4, vy: 0, falling: false, t: 0 });
    }

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.t += STEP;
      if (!d.falling) {
        /* welling up: swell, sag a little, let go. */
        d.r = 0.4 + (TEAR_R - 0.4) * Math.min(1, d.t / FORM_S);
        d.y += 4 * STEP;
        if (d.t >= FORM_S) d.falling = true;
        continue;
      }
      d.vy += GRAVITY * STEP;
      d.y += d.vy * STEP;
      const s = surfaceAt(d.x);
      if (d.y + d.r >= s) {
        /* landed. shallow water takes a soft hit — a drop on a wet floor
           is a tap, not a wave. */
        const depth = Math.min(1, level / 24 + 0.3);
        splash(d.x, d.vy * IMPACT * depth);
        const bits = 3 + ((Math.random() * 3) | 0);
        for (let k = 0; k < bits; k++)
          spray.push({
            x: d.x,
            y: s,
            vx: (Math.random() - 0.5) * 160,
            vy: -(60 + Math.random() * 140),
            life: 0.5 + Math.random() * 0.25,
          });
        if (wetAt < 0) wetAt = simT;
        drops.splice(i, 1);
      }
    }

    for (let i = spray.length - 1; i >= 0; i--) {
      const p = spray[i];
      p.life -= STEP;
      p.vy += GRAVITY * STEP;
      p.x += p.vx * STEP;
      p.y += p.vy * STEP;
      if (p.life <= 0 || p.y > surfaceAt(p.x) + 4) spray.splice(i, 1);
    }

    if (wetAt >= 0) {
      const riseMax = Math.min(420, h * RISE_FRAC);
      level = riseMax * (1 - Math.exp(-(simT - wetAt) / RISE_TAU));
    }

    stepPhysics();
  };

  const draw = (): void => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = ink;
    c.strokeStyle = ink;

    if (level > 0.5 || wetAt >= 0) {
      const base = h - level;
      c.beginPath();
      c.moveTo(0, h + 2);
      c.lineTo(0, base + u[0]);
      for (let i = 1; i < n; i++) c.lineTo(i * spacing, base + u[i]);
      c.lineTo(w, h + 2);
      c.closePath();
      /* the body: ink at eight percent — glass over light, glass over
         dark, text legible through both. */
      c.globalAlpha = 0.08;
      c.fill();
      /* the meniscus: same path's top edge, drawn firmer. */
      c.globalAlpha = 0.35;
      c.lineWidth = 1.25;
      c.beginPath();
      c.moveTo(0, base + u[0]);
      for (let i = 1; i < n; i++) c.lineTo(i * spacing, base + u[i]);
      c.stroke();
    }

    c.globalAlpha = 0.32;
    for (const d of drops) {
      c.beginPath();
      c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 0.38;
    for (const p of spray) {
      c.beginPath();
      c.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  };

  /* the pointer is a finger in the water: crossing the surface band nudges
     the local column by how fast it moved. Trailing the cursor along the
     meniscus is the toy inside the bit. */
  let px = -1;
  let py = -1;
  const onMove = (e: PointerEvent): void => {
    const dy = py < 0 ? 0 : e.clientY - py;
    px = e.clientX;
    py = e.clientY;
    if (level < 6) return;
    if (Math.abs(e.clientY - surfaceAt(e.clientX)) < 26)
      splash(px, Math.max(-6, Math.min(6, dy * 0.35)) || 1.2);
  };
  addEventListener("pointermove", onMove, { passive: true });

  /* the loop. Fixed 60 Hz physics under an rAF that clamps its debt — a
     background tab fast-forwards nothing, it just resumes. If real frames
     run long, shed load: passes first, then column density. Never the
     frame rate. */
  let raf = 0;
  let last = 0;
  let acc = 0;
  let slow = 0;

  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    const raw = (now - last) / 1000;
    last = now;
    acc += Math.min(raw, 0.05);
    let steps = 0;
    while (acc >= STEP && steps < 3) {
      stepScenario();
      acc -= STEP;
      steps++;
    }
    if (steps === 3) acc = 0;
    draw();

    if (raw > 0.025) slow++;
    else if (slow > 0) slow--;
    if (slow > 45) {
      slow = 0;
      if (passes > 3) passes -= 2;
      else if (spacing < 24) {
        spacing *= 2;
        rebuild();
      }
    }
  };

  const onVis = (): void => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  const onResize = (): void => rebuild();
  addEventListener("resize", onResize);

  const scheme = matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", readInk);

  /* reduced motion flipping on mid-flood: the reader asked for stillness,
     so the water doesn't freeze — it was never there. */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const drain = (): void => {
    if (!reduced.matches) return;
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVis);
    removeEventListener("resize", onResize);
    removeEventListener("pointermove", onMove);
    scheme.removeEventListener("change", readInk);
    reduced.removeEventListener("change", drain);
    canvas.remove();
  };
  reduced.addEventListener("change", drain);

  last = performance.now();
  raf = requestAnimationFrame(frame);
}
