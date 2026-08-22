/**
 * THE AGENTS GAG (ticket 16). "im excited & scared of my agents,
 * mostly the former" is the only sentence on the site about how jass thinks,
 * and this is that sentence demonstrated rather than illustrated: dwell on
 * "agents" and a second cursor fades in and acts on its own — drifts over,
 * drags a selection across "mostly the former", holds it a beat, lets it go,
 * leaves. About four seconds. Nothing explains it, and it plays once per
 * visit, because a friend doesn't repeat the bit that landed.
 *
 * The selection is real — the Selection API, not a painted rectangle — so
 * the site's own lime ::selection dresses it, and there is no second
 * highlight style to drift out of sync with the first.
 *
 * "agents" is unmarked in the HTML on purpose. The page with JS off must be
 * whole, and a span whose only job is a gag would be the gag leaking into
 * the document. The word is found and wrapped here, at runtime, because the
 * wrap exists only so the friend has something to dwell on.
 *
 * Reduced motion: nothing. A phantom cursor has no honest static form — a
 * frozen ghost is just a smudge — so no `still` is registered and the page
 * stays the page.
 */
import { ambient } from "@/scripts/friend";
import * as sound from "@/scripts/sound";

const WORD = "agents";
const PHRASE = "mostly the former";

/* The beats, in ms: fade in beside the word, travel to the phrase, drag the
   selection across it, hold the thought, let go and leave. 3.7s all told —
   long enough to read as intent, short enough to be deniable. */
const FADE = 350;
const TRAVEL = 1050;
const DRAG = 1300;
const HOLD = 650;
const OUT = 350;

/* Clearly not the reader's cursor: foreground at six tenths. Translucent is
   the one place opacity is honest — this is a ghost, not text. */
const GHOST = 0.6;

/* The ghost's mouse (ticket 21): ~2ms of noise through a bandpass, which is
   a plastic microswitch and not a beep. Zero assets — a transient this short
   would cost more as a file than as a loop. Press and release sit at
   slightly different pitches, and the up-click rides a little higher and
   lighter than the down, because that is what a real button does. Both go
   through the bus at a whisper: this is a dwell act, and the bus already
   holds the gate, the mute, and the hidden tab. */
const click =
  (hz: number, level: number) =>
  (ctx: AudioContext, out: GainNode): void => {
    const n = Math.max(1, Math.floor(ctx.sampleRate * 0.002));
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++)
      d[i] = (Math.random() * 2 - 1) * (1 - i / n) * level;
    const s = ctx.createBufferSource();
    s.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = hz;
    f.Q.value = 2;
    s.connect(f);
    f.connect(out);
    s.start();
  };
const PRESS = click(1700, 1);
const RELEASE = click(2100, 0.75);

/** The viewport point of the caret before character `offset`. */
function caret(node: Text, offset: number): DOMRect {
  const r = document.createRange();
  r.setStart(node, offset);
  r.collapse(true);
  return r.getBoundingClientRect();
}

/* easeOutBack for the approach — it overshoots a few percent and settles,
   which is what a hand does and a tween doesn't — and easeInOutCubic for the
   drag, which starts deliberate and lands deliberate. Never linear. */
const arrive = (t: number): number =>
  1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
const pull = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function play(word: Element, node: Text, from: number, to: number): void {
  const sel = getSelection();
  if (!sel) return;

  if (!sel.isCollapsed) {
    /* The reader is holding a selection of their own, and barging in would
       replace it. The bit steps back — and returns the once key it was
       handed on the way in, since a gag that never played shouldn't count
       as played. The friend spends the key before the act runs, so this
       reaches back into its pocket; same-page replay stays parked either
       way, and the refund buys the next page of the visit. */
    try {
      sessionStorage.removeItem("friend:agents-gag");
    } catch {
      /* no memory, nothing to refund */
    }
    return;
  }

  const ghost = document.createElement("div");
  ghost.setAttribute("aria-hidden", "true");
  ghost.style.cssText =
    "position:fixed;left:0;top:0;z-index:10;pointer-events:none;opacity:0;color:var(--color-foreground)";
  /* A plain arrow. The hairline background stroke is for the middle of the
     bit, when the ghost crosses its own lime selection and would otherwise
     sink into it. */
  ghost.innerHTML = `<svg width="14" height="20" viewBox="0 0 14 20"><path d="M2 1 L2 16 L6 12.4 L8.4 18 L10.8 17 L8.4 11.6 L13 11.3 Z" fill="currentColor" stroke="var(--color-background)" stroke-width="1" stroke-linejoin="round"/></svg>`;
  document.body.append(ghost);

  let raf = 0;
  let held = -1;
  let pressed = false;
  const t0 = performance.now();

  /* The tip of the arrow is at (2,1) in its own box; put() lands the tip on
     the point, the way a cursor hotspot works. */
  const put = (x: number, y: number): void => {
    ghost.style.transform = `translate(${x - 2}px, ${y - 1}px)`;
  };

  /* The reader's hand outranks the ghost's. Any pointerdown ends the bit on
     the spot — the ghost takes no pointer events, so the real cursor was
     never blocked, and the selection is released only if it is still ours. */
  const done = (): void => {
    cancelAnimationFrame(raf);
    removeEventListener("pointerdown", done);
    /* Release only a selection the ghost is mid-drag on (held >= 0). The
       old anchorNode check couldn't tell the ghost's selection from the
       reader's own brand-new one — the pointerdown that starts a drag
       collapses the caret into this same text node, and the bit was wiping
       the reader's selection as it bowed out. */
    if (held !== -1) sel.removeAllRanges();
    ghost.remove();
  };
  addEventListener("pointerdown", done);

  const frame = (now: number): void => {
    const t = now - t0;

    /* Anchors are recomputed every frame from the text's own boxes —
       position:fixed and these rects share viewport coordinates, so a
       mid-act scroll moves ghost and words together instead of stranding
       one. Nothing assumes a hover cursor exists: on touch, the ghost is
       born from the word's box, not from a pointer. */
    const w = word.getBoundingClientRect();
    const sx = w.left + w.width * 0.62;
    const sy = w.bottom + 5;
    const a = caret(node, from);

    if (t < FADE) {
      ghost.style.opacity = String(GHOST * (t / FADE));
      put(sx, sy);
    } else if (t < FADE + TRAVEL) {
      ghost.style.opacity = String(GHOST);
      const p = arrive((t - FADE) / TRAVEL);
      /* The bow makes the path an arc instead of a bearing. */
      const bow = Math.sin(Math.min(p, 1) * Math.PI) * 7;
      put(sx + (a.x - sx) * p, sy + (a.y + a.height * 0.72 - sy) * p + bow);
    } else if (t < FADE + TRAVEL + DRAG) {
      /* The button goes down on the first drag frame — the click IS the
         moment the selection starts, not the travel before it. */
      if (!pressed) {
        pressed = true;
        sound.play({ tier: "whisper", synth: PRESS });
      }
      const p = pull((t - FADE - TRAVEL) / DRAG);
      const f = from + (to - from) * p;
      const k = Math.round(f);
      if (k !== held) {
        sel.setBaseAndExtent(node, from, node, k);
        held = k;
      }
      /* Between characters the tip lerps caret-to-caret, so it tracks the
         words themselves — if the phrase wraps at some width, the ghost
         follows it onto the next line instead of sailing off the first. */
      const lo = caret(node, Math.floor(f));
      const hi = caret(node, Math.min(Math.floor(f) + 1, to));
      const fr = f - Math.floor(f);
      put(
        lo.x + (hi.x - lo.x) * fr,
        lo.y + (hi.y - lo.y) * fr + lo.height * 0.72 + Math.sin(t / 90) * 0.7,
      );
    } else if (t < FADE + TRAVEL + DRAG + HOLD) {
      const e = caret(node, to);
      put(e.x, e.y + e.height * 0.72);
    } else if (t < FADE + TRAVEL + DRAG + HOLD + OUT) {
      /* Let go first, then leave. The other order reads as vanishing
         mid-thought; this one reads as finishing it. */
      if (held !== -1) {
        sel.removeAllRanges();
        held = -1;
        /* The up-click lives here and only here. done() also lets go of the
           selection, but silently — an interrupted ghost doesn't finish its
           gesture, so an abort mid-drag never earns the release. */
        sound.play({ tier: "whisper", synth: RELEASE });
      }
      ghost.style.opacity = String(
        GHOST * (1 - (t - FADE - TRAVEL - DRAG - HOLD) / OUT),
      );
    } else {
      done();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}

export function register(): void {
  const header = document.querySelector("main header");
  if (!header) return;

  /* Find the word by walking text nodes rather than by index into INTRO:
     the copy is jass's and this module must survive him editing it. The
     phrase is required in the same node so the wrap can only ever land on
     the "agents" that sits in the sentence it demonstrates. If either is
     gone, nothing registers and the page has lost nothing it had. */
  const walker = document.createTreeWalker(header, NodeFilter.SHOW_TEXT);
  let hit: Text | null = null;
  let at = -1;
  while (walker.nextNode()) {
    const t = walker.currentNode as Text;
    at = t.data.indexOf(WORD);
    if (at >= 0 && t.data.includes(PHRASE, at)) {
      hit = t;
      break;
    }
  }
  if (!hit) return;

  /* Split the word out and wrap it. A bare span: no class, no style, no
     rendered difference — at rest the page is byte-for-byte the page. */
  const wordText = hit.splitText(at);
  wordText.splitText(WORD.length);
  const word = document.createElement("span");
  wordText.before(word);
  word.append(wordText);

  const rest = word.nextSibling;
  if (!(rest instanceof Text)) return;
  const from = rest.data.indexOf(PHRASE);
  if (from < 0) return;

  ambient({
    el: word,
    once: "agents-gag",
    act: () => play(word, rest, from, from + PHRASE.length),
  });
}
