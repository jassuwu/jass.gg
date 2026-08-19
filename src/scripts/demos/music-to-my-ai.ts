/**
 * THE PAGE WRITES ITSELF (ticket 22, instance two of the takeover).
 *
 * music-to-my-ai turns a streaming LLM reply into music: every time a few
 * more characters land, exactly one note plays. Nothing loops underneath.
 * So the only honest demo is the one the product performs — text arriving,
 * with sound — and the only page it can arrive on is this one. Dwell on the
 * row and the whole page empties and comes back a chunk at a time, one note
 * per chunk, until the last chunk restores the last word.
 *
 * IT IS THE WHOLE PAGE, not the row, and that is what makes it a takeover
 * rather than a demo: the reader rests on one line in the shelf and
 * everything above and below it starts being typed. It also satisfies the
 * copy rule by construction — the streamed words are the site's own,
 * verbatim, every one of them, so nothing new is ever put in jass's voice.
 *
 * IT RUNS ON LIQUID GLASS'S GRAMMAR, which is jass's call and the second
 * thing this instance settles. Dwell arms it, not a click; leaving the row
 * ends it instantly and completely; there is no marker, no cursor change and
 * no instruction, because the takeover is found the way instance one's
 * arrows are. An earlier build was click-armed with a pointer cursor and ran
 * the page out over fifteen seconds. Both were wrong for the same reason: a
 * reader touches a row to see what happens, and a thing that asks for a
 * click and then holds them for fifteen seconds has mistaken itself for a
 * video. It is now about four seconds, and any moment of it is quittable.
 *
 * THE ARRANGEMENT IS THE PAGE'S OWN STRUCTURE. The product ships six voices;
 * this plays four of them, and which one you hear is where you are: the
 * header is kalimba, `things` is piano, `toys` is sitar, the footer is harp.
 * Nothing announces the change — the reader just notices that toys sound
 * different from things, which is the page's own split heard rather than
 * read. The pitch walk does NOT reset at a boundary: one continuous line
 * through four timbres, so it reads as one piece in movements instead of
 * four clips in a row.
 *
 * THE SPEED IS UNEVEN ON PURPOSE, because real streams are. A model does not
 * emit at a metronome — it floods, then stalls, then breathes at a full stop
 * — and a fixed rate is the single thing that would make this read as a
 * typewriter effect rather than a reply. So the gap between chunks is drawn
 * per chunk from its own hash stream: mostly near the nominal rate, a
 * quarter of the time in a burst, a tenth of the time in a stall. Which is
 * also what makes the product's burst-thinning audible here — hits closer
 * than 180ms duck, so a flood stays pleasant instead of turning into a
 * cluster. At a fixed rate that rule can never fire.
 *
 * A CHUNK SPANS TEXT NODES, and that is the fix that made four seconds
 * musical rather than a wash. The page is 1,088 characters in 39 separate
 * text nodes; cutting per node forces a floor of 39 chunks and, at this
 * length, over twenty notes a second. Letting a chunk run across the
 * boundary between a heading and the row under it drops that to about
 * thirty, or roughly seven notes a second — and it is the more faithful
 * reading besides. The product defines a chunk as the text added in one
 * observer callback, "concatenated across all growth in the batch", which on
 * a real page routinely spans several elements of one rendered answer.
 *
 * THE MECHANISM IS THE PRODUCT'S, PORTED, NOT AN HOMAGE. Chunk sizes, the
 * word-boundary split, the pentatonic walk and its hash, the weight curve,
 * the octave drop and its sample-shift budget, burst-thinning, the sparse
 * sampler with its lowpass, its envelope and its procedural hall, and every
 * instrument's measured tuning — all lifted from music-to-my-ai's own
 * `site/demo.ts`, `src/core/{mapping,sampler}.ts` and `src/instruments`.
 * Same numbers, so what plays here is what installs.
 *
 * THE SAMPLES ARE THE PRODUCT'S OWN, VENDORED — `public/sounds/mtma`, the
 * same four voices the extension ships, trimmed to the notes the walk below
 * can actually reach. They were hotlinked off music-to-my-ai.jass.gg first,
 * on the quilt row's reasoning: prove the thing by using it. That was the
 * wrong call twice over. Quilt hotlinks a LIVE SERVICE, so its request is
 * genuinely the product working; static mp3s on another origin prove
 * nothing except that a file exists. And it cost a cross-origin connection
 * on the reader's first hover, which is the one thing a dwell act has no
 * budget for. Vendored, they are same-origin, on the page's own warm
 * connection, and their CC BY attribution travels with them in
 * `ATTRIBUTION.txt` beside the files.
 *
 * NOTHING WAITS ON SOUND. The visual stream and the audio are two separate
 * things that happen to start together, and that ordering is load-bearing:
 * the bus refuses to speak before the reader's first click or keypress, and
 * an earlier build had the whole tick loop INSIDE the `play()` callback — so
 * on a fresh page, before any gesture, `play()` returned early and hovering
 * the row did nothing whatsoever. Not silent: dead. The loop now runs on
 * `performance.now()` and fires a note only if a context and a decoded voice
 * both exist, so the page always writes itself the instant the dwell lands
 * and the sound joins whenever the browser allows it.
 *
 * Buffers are decoded on the reader's FIRST GESTURE ANYWHERE rather than on
 * hover, which is the rest of that fix — the bus creates its context then,
 * and `context()` is the seam that lets this ask for it. Fetching starts
 * earlier still, when the pointer enters the section the row lives in.
 * Nothing is fetched at rest.
 *
 * THE REAL PAGE IS NEVER TOUCHED. The stream is written into a full clone of
 * <main>, laid over the real one on an opaque page-colour sheet — the vergil
 * cut's mechanism, for the vergil cut's reason: a clone reflows exactly like
 * the thing it was cloned from, so the swap is invisible and no overlay has
 * to guess where a line will wrap. The document underneath keeps its text,
 * its selection, its focus, and the span agents-gag wraps around "agents" at
 * runtime. Removing the clone IS the page coming back whole, which is why
 * nothing here can leave it half-written. Zero layout movement: the sheet is
 * absolutely positioned and the real <main> never changes height.
 *
 * The clone is `inert` and `aria-hidden`, with its ids stripped — a second
 * copy of the page must not enter the tab order, be read out, or answer to
 * `#things`. Assistive tech and the keyboard keep talking to the real one.
 *
 * THE EASY OUT IS SACRED (ticket 22's one law). Leaving the row ends it, and
 * so does a click anywhere, Escape, or hiding the tab. It also just ends on
 * its own. Nothing is ever locked, and re-dwelling replays it.
 *
 * It whispers, because a dwell is not consent (ticket 21's ladder) and
 * because jass's ear had already called the click-armed version too loud.
 * The vergil cut takes the full rung on a dwell and says so as an explicit
 * exception; a judgment cut does not whisper, and a page quietly typing
 * itself does.
 *
 * One mouth, and this act gets no exception: if the reader wanders onto
 * another row mid-stream, that row's act takes the bus — but leaving this
 * row has already ended the piece by then, so in practice the two never
 * argue.
 *
 * Reduced motion: nothing at all, and no `still`. Text that arrives is the
 * entire idea; text that is already there is just the page, which the reader
 * already has.
 */
import { ambient } from "@/scripts/friend";
import { context, play, stopAll } from "@/scripts/sound";

/* ---- the voices, tuned as the product tunes them ---- */

interface Voice {
  /** Scale degree 0 sits here. */
  base: number;
  reverb: number;
  release: number;
  /** Measured, not guessed — the product's 0015 tuning pass. */
  trim: number;
  /**
   * The sparse sample set, two per octave. The product ships nine notes per
   * instrument, from 36 to 84; listed here are only the ones the walk below
   * can actually land on from that instrument's base, so nothing is fetched
   * that could never be struck.
   */
  samples: number[];
}

const VOICES: Record<string, Voice> = {
  /* The default, and the one that won the product's voicing prototype. */
  kalimba: {
    base: 69,
    reverb: 0.32,
    release: 0.9,
    trim: 2.6,
    samples: [67, 72, 79, 84],
  },
  piano: {
    base: 60,
    reverb: 0.25,
    release: 0.95,
    trim: 1.6,
    samples: [60, 67, 72, 79, 84],
  },
  sitar: {
    base: 62,
    reverb: 0.35,
    release: 1.05,
    trim: 1.75,
    samples: [60, 67, 72, 79, 84],
  },
  harp: {
    base: 72,
    reverb: 0.45,
    release: 1.15,
    trim: 2.5,
    samples: [72, 79, 84],
  },
};

const SRC = (voice: string, midi: number) =>
  `/sounds/mtma/${voice}/${midi}.mp3`;

/**
 * THE LADDER, AND THESE ARE JASS'S KNOBS. A dwell act whispers (ticket 21),
 * so this rides the bus's quiet rung; `LEVEL` trims underneath it. The
 * product's own landing page runs its master at 0.6 and jass's ear called
 * that too loud here, which is the whole reason this sits on `whisper`
 * instead of `full`. Note the material still runs hot under the rung —
 * every instrument's `trim` is a measured multiplier above 1 — so the
 * effective level is around 0.16, not 0.08.
 *
 * If it needs to be louder than the rung allows, the change is `TIER` to
 * "full" with a small `LEVEL`, not a number above 1: `level` is documented
 * as a 0..1 trim and the bus multiplies it into the rung.
 */
const TIER = "whisper" as const;
const LEVEL = 1;

/* ---- the stream ---- */

/**
 * The nominal gap between chunks. claude.ai's measured rate is 208ms — 4.8
 * chunks/sec, music-to-my-ai ticket 0006 — and this runs at a bit over half
 * of it, deliberately. The measured rate is honest for a chat window someone
 * is reading; it is wrong for a row someone is hovering to find out what
 * happens. Compressed, the whole page is about four seconds. This is the
 * number to move if that is still long.
 */
const RATE_MS = 115;

/* Chunk sizes on the real sites are wildly uneven — median 33 chars on
   claude.ai, 3 on chatgpt.com, occasional bursts far past either. A fixed
   split sounds metronomic and undersells the thing, so the product cycles a
   spread of targets and breaks on word boundaries. Same spread and same
   order, doubled: the product blends both sites and lands on a mean of 16.6,
   and this page wants claude.ai's end of that range, whose mean is 33. Fewer,
   larger arrivals — which is what keeps a four-second page at about seven
   notes a second instead of twenty. */
const SIZES = [16, 42, 26, 68, 10, 34, 52, 18];

/* The tempo bands, as multiples of the nominal rate: a flood, the ordinary
   pace, and a stall. Probabilities first, then the range each draws from. */
const P_BURST = 0.26;
const P_STALL = 0.1;
const BURST = [0.3, 0.55];
const NORMAL = [0.7, 1.3];
const STALL = [1.6, 2.6];
/** A full stop is where a reply actually pauses. */
const BREATH_MS = 90;

/** Major pentatonic — bright without being able to sound wrong. */
const PENT = [0, 2, 4, 7, 9];

/** Deterministic per-chunk hash: the same page always plays the same piece.
 * The reader who clicks twice hears that it is a rule, not a shuffle. */
function hash(str: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

const lerp = (r: number[], t: number): number =>
  (r[0] ?? 0) + ((r[1] ?? 0) - (r[0] ?? 0)) * t;

/** How long until the next chunk lands. Drawn from its own hash stream so
 * the tempo is reproducible but uncorrelated with the tune. */
function gapAfter(text: string, i: number): number {
  const r = hash(text, i ^ 0x9e3779b9);
  let g: number;
  if (r < P_BURST) g = RATE_MS * lerp(BURST, r / P_BURST);
  else if (r > 1 - P_STALL)
    g = RATE_MS * lerp(STALL, (r - (1 - P_STALL)) / P_STALL);
  else g = RATE_MS * lerp(NORMAL, (r - P_BURST) / (1 - P_BURST - P_STALL));
  return /[.!?]["')\s]*$/.test(text) ? g + BREATH_MS : g;
}

/** How "big" a chunk is, 0–1 on a log curve: 0 at ~8 characters, 1 at ~800. */
const weightOf = (chars: number): number =>
  Math.min(
    1,
    Math.max(0, Math.log10(Math.max(1, chars) / 8) / Math.log10(100)),
  );

/**
 * Semitones from `midi` to the nearest sample this voice actually carries.
 * The sampler always plays the closest sample at an adjusted rate, so this
 * is exactly the shift that note will incur.
 */
function shift(v: Voice, midi: number): number {
  let best = Infinity;
  for (const sample of v.samples)
    best = Math.min(best, Math.abs(sample - midi));
  return best;
}

/** Two samples per octave means the sampler never shifts far inside the
 * sampled range; past this it is an audible artifact. The product's number. */
const SHIFT_BUDGET = 5;

interface Struck {
  degree: number;
  midi: number;
  gain: number;
  bright: number;
  release: number;
}

/**
 * The Direct mapping. One note per chunk, fired on arrival, never smoothed
 * or rescheduled — the product's comment says do not add smoothing here, and
 * that goes for this copy too.
 *
 * The octave drop is ported and reachable: doubling the chunk targets puts
 * the largest of them past the 80 characters weight 0.5 needs, so a big
 * arrival drops an octave and reads as mass rather than just volume. Its
 * sample-shift guard comes with it, and that guard is also why the sample
 * lists above stay correct — a drop is skipped unless the dropped note is
 * still within budget of a sample this voice already carries, so it can
 * never ask for one that was never fetched.
 *
 * The sub-octave is NOT ported: it needs weight past 0.8, which is 250
 * characters in a single chunk, and the largest target here is 68. It would
 * be an untestable branch pretending to be fidelity.
 *
 * Burst-thinning IS ported and, unlike at a fixed rate, fires — that is what
 * the tempo bands above are for.
 */
function strike(
  v: Voice,
  degree: number,
  text: string,
  count: number,
  gapSec: number,
): Struck {
  /* Gentle walk: pitch moves between hits rather than sitting still. */
  const up = hash(text, count) > 0.44;
  const next = Math.max(0, Math.min(13, degree + (up ? 1 : -1)));
  const weight = weightOf(text.length);
  const undropped =
    v.base +
    (PENT[next % PENT.length] ?? 0) +
    12 * Math.floor(next / PENT.length);

  /* Past half weight the note drops an octave — mass, not just volume. The
     drop is skipped only when it would NEWLY cross the shift budget, so a
     register-mismatched voice stays put rather than growling. */
  let drop = 0;
  if (weight > 0.5) {
    const wasFine = shift(v, undropped) <= SHIFT_BUDGET;
    const staysFine = shift(v, undropped - 12) <= SHIFT_BUDGET;
    if (staysFine || !wasFine) drop = -12;
  }

  let gain = v.trim * (0.85 + 0.5 * weight);
  /* Back-to-back hits duck so a fast flood stays pleasant. */
  if (gapSec < 0.09) gain *= 0.5;
  else if (gapSec < 0.18) gain *= 0.75;
  if (/[.!?]["')\s]*$/.test(text)) gain *= 1.15;

  return {
    degree: next,
    midi: undropped + drop,
    gain,
    bright: 1 + 0.6 * weight,
    /* Bigger arrivals ring longer. */
    release: v.release * (1 + 1.2 * weight),
  };
}

/* ---- the sound ---- */

/**
 * Fetched on first intent, decoded once, kept for the visit — and kept PER
 * VOICE, which is what stops the act waiting on ~240 KB before the first
 * character moves. Every voice starts fetching together; only the first one
 * is ever awaited.
 *
 * A failure caches nothing to play. The row goes quiet about it, the way a
 * friend who cannot find the thing does not announce that he cannot.
 */
const fetched = new Map<string, Promise<Map<number, ArrayBuffer>>>();
const decoded = new Map<string, Promise<Map<number, AudioBuffer>>>();
/** Decoded and ready right now, for the fallback at strike time. */
const ready = new Map<string, Map<number, AudioBuffer>>();

function preload(): void {
  for (const [voice, v] of Object.entries(VOICES)) {
    if (fetched.has(voice)) continue;
    fetched.set(
      voice,
      Promise.all(
        v.samples.map(async (midi) => {
          try {
            const res = await fetch(SRC(voice, midi));
            return [midi, await res.arrayBuffer()] as const;
          } catch {
            return [midi, undefined] as const;
          }
        }),
      ).then((pairs) => {
        const m = new Map<number, ArrayBuffer>();
        for (const [midi, buf] of pairs) if (buf) m.set(midi, buf);
        return m;
      }),
    );
  }
}

function decode(
  ctx: AudioContext,
  voice: string,
): Promise<Map<number, AudioBuffer>> {
  preload();
  let d = decoded.get(voice);
  if (!d) {
    d = fetched.get(voice)!.then(async (buffers) => {
      const m = new Map<number, AudioBuffer>();
      await Promise.all(
        [...buffers].map(async ([midi, buf]) => {
          try {
            /* decodeAudioData detaches its input and this act repeats, so it
               decodes a copy and the source survives for nothing — which
               costs a few hundred KB and buys never thinking about it. */
            m.set(midi, await ctx.decodeAudioData(buf.slice(0)));
          } catch {
            /* A missing octave is survivable — the closest note covers it. */
          }
        }),
      );
      ready.set(voice, m);
      return m;
    });
    decoded.set(voice, d);
  }
  return d;
}

/** Every voice, started together. Only `FIRST` is awaited before the piece
 * begins; the rest land during it, and a region whose voice has not arrived
 * yet speaks in the one that has. */
function warm(ctx: AudioContext): void {
  for (const voice of Object.keys(VOICES)) void decode(ctx, voice);
}

/** The header's voice, and so the only one the start waits on. */
const FIRST = "kalimba";

interface Chain {
  dry: GainNode;
  send: GainNode;
}

/** The product's sampler graph: a limiter under the master, and a procedural
 * hall beside it. Rebuilt per act, because the bus hands out a fresh mouth
 * each time and disconnects the old one. */
function chain(ctx: AudioContext, out: GainNode): Chain {
  /* Notes overlap — at this rate with a ~1s release a dozen can sound at
     once, and reverb sits on top of that. A limiter keeps a flood from
     clipping without touching individual notes. */
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 3;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.15;
  limiter.connect(out);

  const dry = ctx.createGain();
  dry.connect(limiter);

  /* Procedural hall impulse — no impulse-response file to ship. */
  const verb = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * 2.2);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
  }
  verb.buffer = buf;

  const send = ctx.createGain();
  send.connect(verb);
  verb.connect(limiter);
  return { dry, send };
}

/** Closest sample, played at an adjusted rate. Two per octave means the
 * shift stays small enough that the instrument still sounds like itself. */
function nearest(v: Voice, midi: number): number {
  let best = v.samples[0]!;
  for (const s of v.samples) {
    if (Math.abs(s - midi) < Math.abs(best - midi)) best = s;
  }
  return best;
}

function note(
  ctx: AudioContext,
  to: Chain,
  voice: string,
  v: Voice,
  n: Struck,
): void {
  /* A region whose voice has not decoded yet speaks in the one that has,
     rather than dropping the note: the whole claim is one note per chunk, so
     a wrong timbre for a beat beats a hole. If nothing has decoded at all —
     first run, gesture only just given — the chunk is silent and the text
     still arrives, which is the browser's rule, not a failure of this act. */
  const buffers = ready.get(voice) ?? ready.get(FIRST);
  if (!buffers) return;
  const sampled = nearest(v, n.midi);
  const buffer = buffers.get(sampled);
  if (!buffer) return;
  const t = ctx.currentTime + 0.001;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = Math.pow(2, (n.midi - sampled) / 12);

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = Math.min(18000, 3200 * n.bright);

  const env = ctx.createGain();
  env.gain.setValueAtTime(Math.max(0.0001, n.gain), t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + n.release);

  const bleed = ctx.createGain();
  bleed.gain.value = v.reverb;

  src.connect(tone);
  tone.connect(env);
  env.connect(to.dry);
  env.connect(bleed);
  bleed.connect(to.send);

  src.start(t);
  src.stop(t + n.release + 0.05);
}

/* ---- the clone ---- */

/* The sheet is opaque page colour, so an empty clone reads as an empty page
   rather than as the real one showing through. `pointer-events: none` keeps
   the document under it usable — and any pointerdown ends the act anyway. */
const CSS = `
.friend-mtma-sheet {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;
  background: var(--color-background);
  pointer-events: none;
}`;

let styled = false;
function styles(): void {
  if (styled) return;
  styled = true;
  const el = document.createElement("style");
  el.textContent = CSS;
  document.head.append(el);
}

interface Reveal {
  node: Text;
  /** The node's full text; the clone shows a prefix of it. */
  full: string;
  /** Show up to here. Offsets, not rebuilt strings, so whatever whitespace
   * the markup happened to carry is reproduced exactly. */
  to: number;
}

interface Chunk {
  /** Everything this one arrival uncovers — often spanning several nodes. */
  reveals: Reveal[];
  /** This chunk's own characters: what the mapping hashes and weighs. */
  text: string;
  /** The region the chunk STARTS in; a chunk crossing a boundary keeps the
   * voice it began in rather than switching mid-arrival. */
  voice: string;
}

/** Which voice a region speaks in. The page's structure, heard. */
const REGIONS: Array<[string, string]> = [
  ["header", "kalimba"],
  ["section:nth-of-type(1)", "piano"],
  ["section:nth-of-type(2)", "sitar"],
  ["footer", "harp"],
];

function build(main: HTMLElement): {
  sheet: HTMLElement;
  chunks: Chunk[];
} {
  const clone = main.cloneNode(true) as HTMLElement;
  for (const [selector, voice] of REGIONS) {
    clone.querySelector(selector)?.setAttribute("data-mtma", voice);
  }
  /* A second copy of the page must not answer to `#things`, take focus, or
     be read out. Ids go, and inert plus aria-hidden do the other two. */
  for (const el of clone.querySelectorAll("[id]")) el.removeAttribute("id");
  clone.setAttribute("aria-hidden", "true");
  clone.setAttribute("inert", "");
  /* The wordmark is skipped by the text walk below — a signature is a
     drawing, not prose — but it also has to arrive settled rather than
     re-signing. The real `.sig` drops these two classes the moment it has
     signed, so normally the clone inherits a finished mark; a dwell inside
     the first second of a visit would otherwise copy a half-drawn one and
     freeze it there, because the clone has no script to take them off
     again. Without them the markup IS the finished signature. */
  clone.querySelector(".sig")?.classList.remove("signing", "go");
  /* The clone is a picture of the page, so it carries no behaviour — and one
     script in particular has to go before the walk below can be trusted.
     Wordmark.astro ships its signing IIFE INSIDE <main>, and a script's
     source is a text node like any other: left in, the piece opened by
     streaming 1.4 KB of JavaScript that renders nothing, so the first
     several seconds played notes over a page that visibly did nothing. That
     was the bug, not the network. */
  for (const el of clone.querySelectorAll("script, style, noscript, template"))
    el.remove();

  /* The text of the page, in order, as the stream will deliver it. */
  const pieces: Array<{ node: Text; full: string; voice: string }> = [];
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text;
    const full = node.data;
    /* Whitespace between inline elements is layout, not copy — emptying it
       would weld a name to its description. It is left exactly as it is. */
    if (!/\S/.test(full)) continue;
    /* The wordmark's only text is its `sr-only` label; the mark itself is
       drawn. A signature is not prose and does not get typed. */
    if (node.parentElement?.closest("svg, .sr-only, script, style")) continue;
    const voice = node.parentElement
      ?.closest("[data-mtma]")
      ?.getAttribute("data-mtma");
    if (!voice) continue;
    pieces.push({ node, full, voice });
  }

  /* Cut the whole page into arrivals, letting one run across the boundary
     between nodes — see the header on why this is both the faithful reading
     and the thing that keeps four seconds musical. `acc` measures the
     current arrival across nodes; `pending` is what it will uncover. */
  const chunks: Chunk[] = [];
  let pending: Reveal[] = [];
  let acc = "";
  let voice = pieces[0]?.voice ?? FIRST;
  let ci = 0;

  for (const piece of pieces) {
    if (!acc) voice = piece.voice;
    let from = 0;
    const word = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = word.exec(piece.full))) {
      const end = m.index + m[0].length;
      const seg = piece.full.slice(from, end);
      if (acc.length + seg.length >= (SIZES[ci % SIZES.length] ?? 33)) {
        pending.push({ node: piece.node, full: piece.full, to: end });
        chunks.push({ reveals: pending, text: acc + seg, voice });
        pending = [];
        acc = "";
        from = end;
        ci++;
        voice = piece.voice;
      }
    }
    /* Whatever is left of this node rides along with the next arrival. */
    if (from < piece.full.length) {
      pending.push({
        node: piece.node,
        full: piece.full,
        to: piece.full.length,
      });
      acc += piece.full.slice(from);
    }
    piece.node.data = "";
  }
  if (pending.length) chunks.push({ reveals: pending, text: acc, voice });

  const sheet = document.createElement("div");
  sheet.className = "friend-mtma-sheet";
  sheet.append(clone);
  return { sheet, chunks };
}

/* ---- the act ---- */

let running = false;
/** When the last run ended, for the cooldown below. */
let lastEnd = 0;
/**
 * On pointer the dwell timer arms once per enter, so a parked cursor is
 * already safe. Touch is why this exists: scroll-dwell re-runs whenever the
 * row settles in the band, and without a cooldown a thumb resting mid-page
 * would restart the piece the instant it finished.
 */
const COOLDOWN_MS = 1500;

export function register(): void {
  const row = document.querySelector<HTMLElement>(
    'li[data-entry="music-to-my-ai"]',
  );
  const main = document.querySelector<HTMLElement>("main");
  if (!row || !main) return;

  styles();

  /* Nothing is fetched at rest — but "intent" is the section, not the row.
     Waiting for the row itself left only the 500ms of dwell to get bytes off
     the network, which is not enough on a first visit and is the whole
     reason the first hover used to stall. Entering the section the row lives
     in is the same promise made earlier, and buys the width of a column. */
  (row.closest("section") ?? row).addEventListener("pointerenter", preload, {
    once: true,
  });

  /* Decoding needs the bus's context, which exists only after the reader's
     first click or keypress — so it happens THEN, not on hover. By the time
     a dwell lands the buffers are usually already sitting there. The bus
     registers its own wake handler at import, before this one, so the
     context is up by the time this runs. Touch gets its preload here too:
     a tap is a pointerdown long before it is a scroll-dwell. */
  const warmUp = (): void => {
    preload();
    const ctx = context();
    if (!ctx) return;
    warm(ctx);
    removeEventListener("pointerdown", warmUp, true);
    removeEventListener("keydown", warmUp, true);
  };
  addEventListener("pointerdown", warmUp, true);
  addEventListener("keydown", warmUp, true);

  let timer: number | undefined;
  let clear: (() => void) | undefined;
  /* The sheet is pinned to <main>'s box, and <main> moves when the column
     does. Cheaper and calmer than ending the act over a rotated phone. */
  let place = (): void => {};

  const end = (silence: boolean): void => {
    if (!running) return;
    running = false;
    lastEnd = Date.now();
    window.clearTimeout(timer);
    removeEventListener("pointerdown", out, true);
    removeEventListener("keydown", esc, true);
    removeEventListener("resize", place);
    document.removeEventListener("visibilitychange", hidden);
    clear?.();
    clear = undefined;
    /* A natural finish leaves the tails ringing — the last note of a reply
       does not get cut off. Every other exit takes the sound with it,
       because the reader asked for the page back. */
    if (silence) stopAll();
  };

  const out = (): void => end(true);
  const esc = (e: KeyboardEvent): void => {
    if (e.key === "Escape") end(true);
  };
  const hidden = (): void => {
    if (document.hidden) end(true);
  };

  const start = (): void => {
    if (running || Date.now() - lastEnd < COOLDOWN_MS) return;
    running = true;

    const { sheet, chunks } = build(main);
    place = (): void => {
      sheet.style.top = `${main.offsetTop}px`;
      sheet.style.height = `${main.offsetHeight}px`;
    };
    place();
    document.body.append(sheet);
    clear = () => sheet.remove();

    addEventListener("pointerdown", out, true);
    addEventListener("keydown", esc, true);
    addEventListener("resize", place);
    document.addEventListener("visibilitychange", hidden);

    /* Ask for the mouth. Before the reader's first gesture the bus refuses
       and the synth never runs, which is correct and must not matter: this
       call cannot gate a single pixel below. */
    let ctx: AudioContext | undefined;
    let to: Chain | undefined;
    play({
      tier: TIER,
      level: LEVEL,
      synth: (c, mouth) => {
        ctx = c;
        to = chain(c, mouth);
        /* Whatever has not decoded yet — later voices on a first run. */
        warm(c);
      },
    });

    /* The stream. Wall-clock, not `ctx.currentTime`, because there may be no
       context at all and a suspended one does not advance. */
    let i = 0;
    let degree = 0;
    let last = performance.now();
    const tick = (): void => {
      const c = chunks[i];
      if (!c) {
        /* The last chunk already put the last word back, so the page is
           whole a tick before the sheet goes. */
        end(false);
        return;
      }
      for (const r of c.reveals) r.node.data = r.full.slice(0, r.to);
      const now = performance.now();
      const v = VOICES[c.voice] ?? VOICES[FIRST]!;
      const n = strike(v, degree, c.text, i, (now - last) / 1000);
      degree = n.degree;
      last = now;
      if (ctx && to) note(ctx, to, c.voice, v, n);
      i++;
      timer = window.setTimeout(tick, gapAfter(c.text, i));
    };
    tick();
  };

  /* THE EASY OUT, and the reason this is a dwell act rather than a click:
     the region is the row, and leaving it ends the piece the way stepping
     out of the glass ends instance one. */
  row.addEventListener("pointerleave", () => end(true));

  /* Dwell on pointer, scroll-dwell on touch. No `once` — re-dwelling
     replays it, subject to the cooldown above. Reduced motion gets no act
     and no `still`: a page that is already written is just the page. */
  ambient({ el: row, act: start });
}
