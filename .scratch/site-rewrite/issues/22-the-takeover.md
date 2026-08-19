# The takeover

Type: prototype (HITL)
Status: built (aug 15; instance two aug 20) — instance one is live: three copies of the package's own cursor polygon hidden at sub-JND contrast in the row's halo, legible only through the lens's saturation; found arrows fill accent-mark, all three pin the row's underline. Wordless, so the copy rule is satisfied by silence. Instance two (music-to-my-ai) shipped aug 20 and the grammar has graduated to the map. Both awaiting jass's play test.

## The direction, jass's words

"once they hover they kinda go thru a puzzle where they have to do a puzzle
with the mouse like liquid glass, but they can hover out of the region to go
back as always, it shouldn't be confusing. and now imagine this as a concept
for all the apps: you hover, it kinda takes over a bit, shows what's up, has
an easy out back to the page."

## The grammar this adds

A **takeover** is one step past a demo: the row, on dwell, borrows a little
of the page and gives the reader something to DO with the product's own
mechanic — and the easy out is sacred: leaving the region ends it instantly,
completely, every time. Not confusing means: the takeover region is obvious
while inside it, the page is exactly itself the moment you're out, and
nothing is ever locked.

## Instance one: the liquid glass puzzle

Built this pass. The refracting cursor is the mechanic, so the puzzle is
something only the glass can do — content in the row's region that is only
legible/findable through the lens. Constraint carried from the copy rule:
any revealed TEXT must be existing site copy or a machine fact, never new
jass-voice words; wordless (shapes, marks) is safest.

## Instance two: the page writes itself

Shipped aug 20 with the music-to-my-ai entry. The mechanic is one note per
chunk of an arriving reply, so the takeover is the page arriving: dwell on
the row and a full clone of `<main>` lays over the real one, empties, and
comes back a chunk at a time until the last chunk restores the last word.
About 3.7 seconds, 30 chunks, ~8 notes a second.

What it settles, beyond the ticket's own grammar:

- **The takeover may be the whole page, not just the row's region.** Instance
  one's region was a row plus a halo; this one is the document. The easy out
  survives the scale change intact, which was the open question — leaving the
  row ends it, and so do a click anywhere, Escape, and hiding the tab.
- **Dwell arms it, not a click, and that is now the grammar for both
  instances.** The first build was click-armed, carried a pointer cursor on
  its description, and ran fifteen seconds. jass killed all three at once:
  *"a user clicks to see what happens... it should really be like the liquid
  glass cursor takeover."* A takeover is found by resting on it and left by
  moving off it — the same contract as instance one — and it has to pay off
  immediately, because the reader is probing, not settling in to watch.
- **The copy rule is satisfied by construction rather than by silence.** Every
  streamed word is the site's own, so a takeover CAN be wordy as long as the
  words are already on the page. Instance one had to be wordless because it
  was inventing marks; this one is quoting.
- **The page's structure can be the arrangement.** Four of the product's six
  voices, one per region — header kalimba, `things` piano, `toys` sitar,
  footer harp — with the pitch walk running continuously across the
  boundaries so it reads as one piece in movements. Nothing announces the
  change; the reader just hears that toys are not things.
- **Uneven tempo is the honesty, not a flourish.** A fixed rate reads as a
  typewriter effect. Gaps are drawn per chunk from their own hash stream —
  mostly near the measured 208ms, a quarter in a burst, a tenth in a stall,
  plus a breath at a full stop — which is also what makes the product's own
  burst-thinning audible, since at a fixed rate that branch can never fire.
- **The clone is the mechanism of choice at page scale**, taken from the
  vergil cut: it reflows exactly like the thing it was cloned from, so
  nothing has to guess where a line wraps at 390px. Per-element overlays were
  tried first and fail on inline text that wraps.
- **A chunk spans text nodes**, which is what makes a four-second page
  musical instead of a wash. The page is 1,088 characters in 39 text nodes;
  cutting per node forces a 39-chunk floor and over twenty notes a second.
  Letting an arrival cross the boundary between a heading and the row under
  it gives 30 chunks at ~8/sec — and it is the more faithful reading, since
  the product defines a chunk as the text added in one callback
  "concatenated across all growth in the batch".
- **It whispers.** A dwell is not consent, so it takes ticket 21's quiet
  rung. The vergil cut's full-tier dwell stays the recorded exception: a
  judgment cut does not whisper, and a page quietly typing itself does.
- **Two bugs worth not repeating.** Waiting on all four voices meant ~240 KB
  of network before a character moved, so only the first voice gates the
  start now and a region whose voice is still in flight borrows the one that
  landed. And `Wordmark.astro` ships its signing IIFE *inside* `<main>`: a
  script's source is a text node like any other, so the piece opened by
  streaming 1.4 KB of JavaScript that renders nothing. Any future act that
  walks the page's text must strip `script`/`style` first.
- **jass's calls on this instance**: the whole page rather than the intro
  alone; varying speed; varying instruments; dwell-armed on liquid glass's
  grammar; and quieter than the product's own 0.6 master. `TIER` and `LEVEL`
  in the module are his knobs, as `GAIN.whisper` is in the bus; `RATE_MS` is
  the one to move if 3.7s is still long. The wordmark is skipped: a
  signature is a drawing, not prose.

## Later instances (fog — graduate one at a time, each judged on screen)

Candidates, not commitments: incomerank's guess-puck in miniature; quilt
letting the reader type a github name; mojify turning the reader's cursor
trail to text. Each must pass the same bar: the product's own mechanic, an
easy out, no confusion, no new copy.

## Done when

The liquid glass takeover is live and jass keeps it; the grammar section
above graduates to the map if a second instance ships. **The graduation
condition is met** — the grammar is in the map as of aug 20. What remains is
jass's play test on both instances.
