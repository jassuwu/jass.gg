#!/usr/bin/env bun
/**
 * ansi frames → mojify.frames.json (format v1 — the spec lives in the doc
 * block of src/scripts/demos/mojify-text-video.ts, which is the reader of
 * record; this file is the writer and must stay in agreement with it).
 *
 * usage:
 *   bun convert.ts <framesDir> <fps> <out.json>
 *
 * reads every *.ansi / *.txt in <framesDir> in name order (zero-pad the
 * names), parses the truecolor SGR escapes mojify emits, and writes one
 * JSON film. the size budget is enforced here, not hoped for: colors are
 * quantized to a channel step, and if the film doesn't fit under 300 KB
 * GZIPPED — the bytes that actually cross the wire; vercel gzips json — the
 * step coarsens and it tries again — RLE runs merge as neighbours snap to
 * the same value, so coarser is smaller. if even the coarsest step doesn't
 * fit, it fails loudly with the actual knobs to turn (width, fps, seconds)
 * rather than shipping a heavy asset quietly.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/* On the wire, gzipped: RLE text zips 6–8×, so this is a few MB raw, which
   is fine — it's fetched once, on intent, and parsed off the main thread. */
const BUDGET = 300_000;
/* Channel quantization steps, finest first. 8 is invisible; 64 is five
   levels per channel and still reads fine at terminal-art scale. */
const STEPS = [8, 16, 24, 32, 48, 64];

type RGB = [number, number, number];
interface Cell {
  ch: string;
  color: RGB | null;
}

/* ---- ansi parsing ---- */

/* xterm 256-color fallback, in case a recipe ever emits 38;5;n. mojify's
   default recipe is truecolor (38;2;r;g;b), so this mostly never runs. */
function xterm(n: number): RGB {
  if (n < 16) {
    const base: RGB[] = [
      [0, 0, 0],
      [205, 0, 0],
      [0, 205, 0],
      [205, 205, 0],
      [0, 0, 238],
      [205, 0, 205],
      [0, 205, 205],
      [229, 229, 229],
      [127, 127, 127],
      [255, 0, 0],
      [0, 255, 0],
      [255, 255, 0],
      [92, 92, 255],
      [255, 0, 255],
      [0, 255, 255],
      [255, 255, 255],
    ];
    return base[n]!;
  }
  if (n < 232) {
    const v = (i: number): number => (i === 0 ? 0 : 55 + i * 40);
    const c = n - 16;
    return [v(Math.floor(c / 36)), v(Math.floor(c / 6) % 6), v(c % 6)];
  }
  const g = 8 + (n - 232) * 10;
  return [g, g, g];
}

function parseAnsi(text: string): Cell[][] {
  const rows: Cell[][] = [];
  let row: Cell[] = [];
  let fg: RGB | null = null;

  const sgr = (params: string): void => {
    const p = params === "" ? [0] : params.split(";").map(Number);
    for (let i = 0; i < p.length; i++) {
      const code = p[i]!;
      if (code === 0 || code === 39) fg = null;
      else if (code === 38 && p[i + 1] === 2) {
        fg = [p[i + 2] ?? 0, p[i + 3] ?? 0, p[i + 4] ?? 0];
        i += 4;
      } else if (code === 38 && p[i + 1] === 5) {
        fg = xterm(p[i + 2] ?? 0);
        i += 2;
      } else if (code === 48 && p[i + 1] === 2) i += 4;
      else if (code === 48 && p[i + 1] === 5) i += 2;
      /* everything else (bold, etc.) has no pixel here — ignored. */
    }
  };

  /* codepoint-wise, so block/directional glyphs above 0xFFFF would survive;
     mojify's recipes are BMP but the spread costs nothing. */
  const chars = [...text];
  for (let i = 0; i < chars.length; ) {
    const ch = chars[i]!;
    if (ch === "\x1b") {
      const rest = chars.slice(i, i + 32).join("");
      const m = /^\x1b\[([0-9;]*)m/.exec(rest);
      if (m) {
        sgr(m[1]!);
        i += m[0].length;
        continue;
      }
      /* any other CSI/escape: not a pixel, stripped. */
      const other = /^\x1b\[[0-9;?]*[A-Za-z]/.exec(rest);
      i += other ? other[0].length : 1;
      continue;
    }
    if (ch === "\n") {
      rows.push(row);
      row = [];
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    row.push({ ch, color: fg });
    i++;
  }
  if (row.length) rows.push(row);
  /* trailing blank rows are padding, not picture */
  while (rows.length && rows[rows.length - 1]!.every((c) => c.ch === " "))
    rows.pop();
  return rows;
}

/* ---- encoding ---- */

const q = (v: number, step: number): number =>
  Math.min(255, Math.round(v / step) * step);
const hex = (c: RGB): string =>
  c.map((v) => v.toString(16).padStart(2, "0")).join("");

function encode(
  grids: Cell[][][],
  w: number,
  h: number,
  fps: number,
  step: number,
): string {
  const palette: string[] = [];
  const index = new Map<string, number>();
  const frames = grids.map((grid) => {
    const runs: [number, string][] = [];
    let color = -2; /* impossible, so the first cell always opens a run */
    let text = "";
    const push = (ch: string, c: number): void => {
      /* -2 is "whatever run is open" — a space never flushes anything. */
      if (c !== -2 && c !== color && text !== "") {
        runs.push([color, text]);
        text = "";
      }
      if (c !== -2) color = c;
      else if (color === -2) color = -1;
      text += ch;
    };
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cell = grid[y]?.[x] ?? { ch: " ", color: null };
        /* spaces are invisible and have no color to disagree about: they
           extend whatever run is open, which is most of the compression. */
        if (cell.ch === " " || !cell.color) {
          push(cell.ch, cell.ch === " " ? -2 : -1);
          continue;
        }
        const key = hex([
          q(cell.color[0], step),
          q(cell.color[1], step),
          q(cell.color[2], step),
        ]);
        let ci = index.get(key);
        if (ci === undefined) {
          ci = palette.length;
          palette.push(key);
          index.set(key, ci);
        }
        push(cell.ch, ci);
      }
      /* the row separator rides inside the open run — see the format spec */
      if (y < h - 1) text += "\n";
    }
    if (text !== "") runs.push([color === -2 ? -1 : color, text]);
    return runs;
  });
  return JSON.stringify({ v: 1, w, h, fps, palette, frames });
}

/* ---- main ---- */

const [dir, fpsArg, out] = process.argv.slice(2);
if (!dir || !fpsArg || !out) {
  console.error("usage: bun convert.ts <framesDir> <fps> <out.json>");
  process.exit(1);
}
const fps = Number(fpsArg);
if (!Number.isFinite(fps) || fps <= 0) {
  console.error(`fps must be a positive number, got "${fpsArg}"`);
  process.exit(1);
}

const files = readdirSync(dir)
  .filter((f) => f.endsWith(".ansi") || f.endsWith(".txt"))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (files.length === 0) {
  console.error(`no .ansi/.txt frames in ${dir}`);
  process.exit(1);
}

const grids = files.map((f) => parseAnsi(readFileSync(join(dir, f), "utf8")));
const w = Math.max(...grids.map((g) => Math.max(0, ...g.map((r) => r.length))));
const h = Math.max(...grids.map((g) => g.length));
if (w === 0 || h === 0) {
  console.error("parsed an empty grid — are these really mojify .ansi frames?");
  process.exit(1);
}

for (const step of STEPS) {
  const json = encode(grids, w, h, fps, step);
  const bytes = Buffer.byteLength(json);
  const gz = Bun.gzipSync(Buffer.from(json)).byteLength;
  if (gz <= BUDGET) {
    writeFileSync(out, json);
    const film = JSON.parse(json) as { palette: string[]; frames: unknown[][] };
    const runs = film.frames.map((f) => f.length);
    const maxRuns = Math.max(...runs);
    const avgRuns = Math.round(runs.reduce((a, b) => a + b, 0) / runs.length);
    console.log(
      `${files.length} frames, ${w}x${h} @ ${fps}fps, palette ${film.palette.length} ` +
        `(step ${step}) → ${bytes} bytes raw, ${gz} gzipped → ${out}\n` +
        `runs per frame: avg ${avgRuns}, max ${maxRuns} — the painter's cost per beat`,
    );
    process.exit(0);
  }
  console.log(`step ${step}: ${gz} gzipped — over ${BUDGET}, coarsening…`);
}

console.error(
  `doesn't fit under ${BUDGET} gzipped bytes even at the coarsest quantization.\n` +
    `turn a real knob and rerun: fewer columns (--width), fewer fps, or ` +
    `fewer seconds of clip.`,
);
process.exit(1);
