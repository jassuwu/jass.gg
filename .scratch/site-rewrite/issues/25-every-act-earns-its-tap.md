# Every act earns its tap

Type: grilling + prototype (HITL)
Status: open
Blocked by: 14 (the tap grammar must exist before acts are ported to it)

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
- **the sound of the site** (21) — under scroll-dwell, mobile acts fired
  before any tap and played mute (the bus's gate); under tap grammar every
  act carries its own unlock. The mute egg is currently unwired for
  everyone — if sound becomes real on mobile, that affordance reopens.
- **vergil's private band observer** (`vergil-cut.ts`) — duplicates the
  friend's -35% band for cooldown/preload; must die with scroll-dwell or it
  keeps a hidden scroll dependency.

- **music-to-my-ai** (new, post-merge) — the whole page streams itself
  with sound, registered via `ambient()`: on a phone today it fires
  uninvited from a scroll pause, and the tap that would stop it is also
  the gesture that kills it instantly. The most dramatic act on the site
  and the most in need of the tap grammar. Its four-second, quittable,
  whole-page shape may actually be the *easiest* honest tap port.

Per-act fix-notes from [the site audit](../research/site-audit.md) to
carry into whichever verdict each act gets: toys-wobble taps flam the
marimba (enter+down both ding); a dwell during the load-signing is
swallowed (no re-arm without leave); quilt's error path leaves residue;
ass and andrew-dictate are audio-only (nothing for deaf readers — does
the tap form add a visible half?).

One session with jass, on his phone, act by act. Verdicts recorded here;
build work lands in the acts' own tickets where they're still open.
