/**
 * THE FRIEND'S VOICE (ticket 21). friend.ts is how the friend knows when to
 * lean; this is how it speaks when it does. The grammar, approved and not to
 * be re-derived here:
 *
 *   SILENCE IS THE RESTING STATE. No ambience, no loop. Sound only ever
 *   belongs to an act, so this module makes no sound of its own — it only
 *   lends a mouth to acts that earned one.
 *
 *   THE GATE. Browsers rightly refuse audio before the reader's first real
 *   gesture (hover is not user activation). The bus arms silently on import
 *   and wakes on the first pointerdown/keydown anywhere; until then every
 *   play() is a no-op that does NOT queue — a sound whose moment passed
 *   ungated stays unplayed. Late is worse than never.
 *
 *   ONE MOUTH. A single bus; a new act ducks whatever was playing with a
 *   short ramp-out (never a click/pop). The friend never talks over itself.
 *
 *   THE LADDER IS CONSENT. Dwell acts whisper; click-armed acts speak at
 *   full. Muted or hidden tab: silent — dead acts make no sound.
 */

/** ~30ms out: short enough to feel like a duck, long enough to never pop. */
const RAMP = 0.03;

/**
 * The volume ladder. `whisper` is jass's tuning knob — the kill pass is his
 * ear on real speakers and a real phone; this value is a starting point,
 * not a verdict.
 */
export const GAIN = { whisper: 0.08, full: 1 };

interface Cue {
  tier: "whisper" | "full";
  /** The sound of something real, fetched on first play and cached. */
  url?: string;
  /** Zero-asset cues: handed the context and a gain staged to the tier. */
  synth?: (ctx: AudioContext, out: GainNode) => void;
  /**
   * How one hot cue sits under the tier without moving the ladder: a 0..1
   * trim multiplied into the staged gain, default 1. The ladder stays two
   * rungs; this is a cue admitting its source material runs loud.
   */
  level?: number;
}

/* Created only inside the wake handler — its absence IS the gate. */
let ctx: AudioContext | undefined;
/* The mouth: the gain node of whatever is speaking right now. */
let live: { g: GainNode; s?: AudioBufferSourceNode } | undefined;
/* Decoded buffers by url. A failed fetch/decode caches null: that url is
   silent forever this visit — a missing sound fails to nothing, never to
   a retry storm or a console tantrum. */
const cache = new Map<string, Promise<AudioBuffer | null>>();

/* The mute egg persists per visit under the friend's namespace. Storage
   throws in some privacy modes; the friend shrugs and keeps it in memory. */
let muted = false;
try {
  muted = sessionStorage.getItem("friend:muted") === "1";
} catch {
  /* no memory, no problem */
}

function wake(): void {
  ctx = new AudioContext();
  removeEventListener("pointerdown", wake, true);
  removeEventListener("keydown", wake, true);
}
addEventListener("pointerdown", wake, true);
addEventListener("keydown", wake, true);

/* Hidden tab: silent — even mid-cue. */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAll();
});

/**
 * The bus's context, or nothing before the gate. A cue whose samples must be
 * decoded BEFORE its moment arrives asks here — decoding takes a context and
 * there must only ever be one, since a second would defeat the gate this
 * module exists to hold. Handing it out is not permission to play: `play()`
 * is still the only way to make a sound, and it still owns the one mouth.
 */
export function context(): AudioContext | undefined {
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

/** "All rights reserved, none exercised", made literal when exercised. */
export function setMuted(m: boolean): void {
  muted = m;
  if (m) stopAll();
  try {
    sessionStorage.setItem("friend:muted", m ? "1" : "0");
  } catch {
    /* no memory, no problem */
  }
}

/** Ramp the mouth out and let go. Never a hard cut: cuts pop. */
export function stopAll(): void {
  if (!ctx || !live) return;
  const { g, s } = live;
  live = undefined;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(g.gain.value, t);
  g.gain.linearRampToValueAtTime(0, t + RAMP);
  s?.stop(t + RAMP);
  setTimeout(() => g.disconnect(), 100);
}

/**
 * Speak. Before the gate, muted, or hidden: nothing, and nothing queued.
 * Otherwise the previous act is ducked — one mouth — and this cue takes it.
 */
export function play(cue: Cue): void {
  const c = ctx;
  if (!c || muted || document.hidden) return;
  c.resume();
  stopAll();
  const g = c.createGain();
  g.gain.value = GAIN[cue.tier] * (cue.level ?? 1);
  g.connect(c.destination);
  const mouth: typeof live = { g };
  live = mouth;
  if (cue.synth) {
    cue.synth(c, g);
    return;
  }
  const url = cue.url;
  if (!url) return;
  let p = cache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => c.decodeAudioData(b))
      .catch(() => null);
    cache.set(url, p);
  }
  p.then((buf) => {
    /* While we loaded, a newer act may have taken the mouth, the reader may
       have muted, or the tab may have gone dark. The moment owns the sound;
       a stale one plays nothing. */
    if (!buf || live !== mouth || muted || document.hidden) return;
    const s = c.createBufferSource();
    s.buffer = buf;
    s.connect(g);
    s.start();
    mouth.s = s;
  });
}
