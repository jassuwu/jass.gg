# Every act earns its tap

Type: grilling + prototype (HITL)
Status: open — unblocked aug 22, ready for the phone session
~~Blocked by: 14~~ — resolved aug 22: the tap grammar exists (`entry()` in
friend.ts) and scroll-dwell is out of the code entirely

## The floor moved (aug 22)

The grammar build gave every act its tap door for free: `entry()` wires
description-tap on every registered row, so on a phone every act already
fires deliberately — tap-the-description is *the* touch entry, and the
only one. The session's question is no longer "can this act fire on
touch" but "is this act worth a tap": port / replace / desktop-only, act
by act, on jass's phone. The bare rows stay bare — no handle, no cursor —
so nothing below even enters the verdict list unless it performs.

## Question

Nine details were built hover-first. Under the tap grammar, each one gets a
verdict from jass on his phone: **port** (this is its tap form), **replace**
(the bit doesn't translate; a different bit does this row on touch), or
**desktop-only** (the act is honestly cursor-native and mobile gets the
page at rest).

Work the list against [research/mobile-audit.md](../research/mobile-audit.md)
(per-detail section — what each act's mechanics assume about a cursor):

- **The signature** (13) — the load signing survives everywhere; the
  question is the re-sign: what summons it on touch (tap the wordmark?),
  and does a summoned signature still read as signing?
- **quilt** — the graph clamps to 342px in the column: illegible. Its tap
  form needs a mobile answer for size, not just trigger.
- **the cat** (onandemo) — the touch walk already exists and is honest
  (synthetic cursor, timed crossing, silent by geometry); it only needs the
  tap trigger. Likely the cheapest port on the list.
- **liquid-glass takeover** (22) — a hover-lens puzzle. Port or
  desktop-only?
- **vergil cut** — the strip slice + ring; sound now legal on tap.
- **ass-slap** — a slap wants a tap more than a hover ever did.
- **toys wobble, closer sweep, agents gag, andrew-dictate song** — each a
  verdict.
- **the footer room** (19) — the 2am murmur is static (clock at load,
  unaffected), but any *performed* leaving-beat 19 invents needs a touch
  trigger that isn't scroll position; what's "leaving" under a thumb?
- **the 404** (18, 23) — brainrot + water on touch: input assumptions per
  the audit.
- **the sound of the site** (21) — ~~under scroll-dwell, mobile acts fired
  before any tap and played mute (the bus's gate)~~ — resolved by the
  grammar build: the tap that starts an act is the gesture that wakes the
  bus, so tap-borne acts play whole. The mute egg is currently unwired for
  everyone — sound is now real on mobile, so that affordance reopens.
- ~~**vergil's private band observer** (`vergil-cut.ts`)~~ — died with
  scroll-dwell in the aug 22 grammar build; no hidden scroll dependency
  remains anywhere in the scripts.

- **music-to-my-ai** (new, post-merge) — the whole page streams itself
  with sound. ~~On a phone today it fires uninvited from a scroll pause,
  and the tap that would stop it is also the gesture that kills it
  instantly~~ — both closed by the grammar build: it fires only on its
  description's tap, and the shared easy out swallows the entry gesture,
  so an act can no longer be killed by its own birth. Its four-second,
  quittable, whole-page shape made it exactly the easy honest port it
  looked like; the verdict left is whether jass keeps it.

Per-act fix-notes from [the site audit](../research/site-audit.md):
~~the marimba flam~~ and ~~quilt's error residue~~ were fixed in the
aug 22 fix pass. Still open for this session's verdicts: a dwell during
the load-signing is swallowed (benign — the reader is watching the load
signing — recorded as accepted); ass and andrew-dictate are audio-only
(nothing for deaf readers — does the tap form add a visible half?).

One session with jass, on his phone, act by act. Verdicts recorded here;
build work lands in the acts' own tickets where they're still open.
