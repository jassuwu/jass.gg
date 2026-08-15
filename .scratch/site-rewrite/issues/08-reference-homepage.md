# Build the reference homepage

Type: prototype
Status: open
Blocked by: 02, 03, 04, 06, 07
Absorbs: 05 (the marginalia reveal, now handed on to ticket 10)
Stage two: [ticket 10](10-the-little-things.md)

## Question

Build the real homepage, on the real scaffold, with the real content — and iterate with jass until he signs off.

**This ticket is the destination.** Everything before it exists to make this one buildable in a single sitting; everything after it is mechanical.

Constraints, all previously settled:

- Rung-2 plain: no cards, no badges, no thumbnails, no hero.
- The typography system from ticket 03, at the exact values it settled on.
- The content inventory from ticket 06, in the taxonomy it settled on.
- The routes and link behaviour from ticket 07: **one page**, no nav, sections get linkable `id`s, **every entry shown — no pagination, no filtering, no "show more"**. The volume is the argument. `Layout.astro` and `/404` already exist.
- The content from ticket 06: 5 things, 6 toys, work history in `src/data/work.ts` (rendered "cleverly, in less space, in tone" — the shape is `cypher → stealth → cypher`), all six socials, and the résumé PDF.
- Ten SVG icons still sit in `src/assets/icons/`. If socials render as text, **all ten go** — decide here, and delete rather than leaving four orphans.
- **No micro-interactions at all in the first pass** — see the two stages below.
- Works fully with JavaScript disabled. Light and dark both.
- Neutral + lime, lime reserved.
- Baskervville has no bold (ticket 03). Hierarchy comes from size and space, or it moves to the machine font. Designing around a bold that doesn't exist is the easiest way to waste an evening here.

How to run it:

- **One direction, iterated with jass in the loop.** Not a spread of options to choose between — that's what produced 20 rejected demos in July. If a fork appears, put it to jass and take one branch.
- Show it in a browser, not as a diff. It's judged on how it looks and feels, not on how it reads as code.
- Judge every iteration against the thesis: plain _because_ considered. If a change makes it look more designed, it's the wrong change. If a change makes it look careless, it's also the wrong change.

## Stage one — built, and iterated to a stop

Built plain with no micro-interactions, judged in that state, then reshaped over
one long session of jass reacting to it in a browser. It survived. The page
reads as tended without any details bolted on, which was the test.

**The page is four things in one order: the intro, things, toys, writing.**

What stage one settled, most of it by subtraction:

- **The work section is gone entirely**, reversing ticket 06. Six shapes were
  tried and rejected. Of the 71 sites in `docs/portfolio-inspiration.md`, not
  one puts employment history on its index. jass: *"where i work" and "years of
  experience" shouldn't be the thing defining me.* `src/data/work.ts` deleted;
  the four rejected shapes live on the `prototype/work-section` branch.
- **Links carry no decoration at rest.** Ticket 03's thick lime underline and a
  thinner neutral replacement were both rejected on sight. Position and colour
  separate links; lime arrives on hover and focus. Accepted and recorded cost:
  fails WCAG 1.4.1 for anyone who can't hover.
- **A link inside prose takes `accent-quiet`** — the one case where position has
  nothing to work with.
- **Each page gets one full-strength accent**, on the most human thing on it.
  The wordmark on `/`, the joke on `/404`.
- **Socials render as text**; all ten SVGs and the assets barrel are deleted.
  The résumé is one word in that row.
- **Entry names link to the built thing**, not the repo. Two entries with no
  site point at the repo.
- **The stamp is the footer**, derived from the last content commit rather than
  build time, and linked to that commit. A date that hands you the diff.
- **Tap targets**: the socials row and the stamp are `inline-block` with padding
  to reach ~28px. Entry names stay inline at 23px.
- **The 404 is rebuilt around who arrives there.** Big number in the machine
  role, jass's line, and only the three channels you can actually reply on.
- **All copy is jass's.** The intro, the 404, the writing line, the
  andrew-dictate description. The profile README was updated to match.
- **Vocabulary settled in `CONTEXT.md`.** It is *accent*, never primary or
  secondary. Four type steps; `small` and `title` were deleted when nothing
  referenced them.

## Stage two — moved to ticket 10

The details that take the page from fine to *"what a great eye for detail"*.
Ticket 04's method still governs: add where it's dead, nowhere else.

Split out because stage one is now stable enough to judge details against, which
is the exact condition ticket 04 said was missing when it folded 05 into here.
See **[ticket 10](10-the-little-things.md)**.

Done when jass says *that's it*.
