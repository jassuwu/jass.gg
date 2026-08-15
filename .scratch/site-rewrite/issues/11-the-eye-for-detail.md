# The eye for detail

Type: prototype
Status: open
Follows: 10 (which is closed in everything but name)

**Read this cold. Start here, not at ticket 10.**

## The destination

jass's words, and they are the whole brief:

> a huge eye for detail here, and tons of easter eggs and micro-interactions —
> as long as it adds to the experience

And the failure state, also his:

> okay, clean site. but lots of good engineers have this. what is so unique
> about this?

**Winning looks like a site that pays out at every depth of attention.** Skim
it: clean, quiet, fast. Actually read it: things start happening. Poke at it:
there is more. Someone who goes looking keeps being rewarded, and leaves
thinking _this person cared about things nobody would notice, and then made
sure I would notice._

## Why this ticket exists, and what tickets 10's two passes taught

Two passes of "little things" shipped before this ticket was written. They were
good and they were **the wrong category**, and knowing why is the single most
useful thing on this page.

Everything built so far is **polish, not personality.** The italic ampersand,
the 71-character measure, the leading-versus-gap ordering, the underline that
draws — those are correctness at a high level. They make the site not-wrong.
Nobody has ever screenshotted a line-height ratio and sent it to a friend. That
work raised the floor and was mistaken for raising the ceiling.

`CONTEXT.md` opens by naming this exact trap: AI slop is _plain without
considered_; the target is **plain _because_ considered**; and it says outright
that **"the two look identical in a screenshot, which is the central risk."**

So here is the thing that ticket 10 never said and this one exists to say:

> **Considered-ness has to be findable.** A detail nobody can discover is
> indistinguishable from no detail. Invisible virtue cannot differentiate this
> site from a clean, empty one — that is precisely what a clean, empty one also
> looks like.

The register shifts from **craft** to **things people find.** Not the invisible
substrate. The stuff that makes the page feel authored by a person rather than
assembled correctly.

## The philosophy — settled, do not re-derive

Set by jass directly, and it overrides ticket 04's framing where they disagree:

- **There is no cap.** Three details or a hundred; the count is an output, never
  an input. A detail is never rejected for being the fortieth. Any session that
  proposes "let's do three or four" has already made the mistake — that is a
  budget set in advance, which is the exact thing ticket 04 killed.
- **The test is per-detail.** Does this one add? Does it read as noise, or as
  trying? Every detail defends itself alone.
- **The only aggregate property that matters is voice, not quantity.** Thirty
  details sharing a logic compound into "this person thought about everything."
  Thirty each doing their own clever thing read as noise even when every one is
  individually fine. That is a demo reel, and it is the only way a large number
  actually hurts.
- **Every detail must be derivable from the site's own logic**, not imported
  from a site you liked. That logic: position and colour do the work instead of
  decoration; the accent appears only when the reader asks for it; wit is
  delivered deadpan with nothing explaining it; every element is paper, machine,
  or hand.

## The tension, and its resolution

The map says **"if a change makes the page look more designed, it's the wrong
change,"** and it filed the marginalia reveal under _reads as trying_. Easter
eggs appear to contradict that.

They do not, and the resolution has to be held onto or a fresh session will
either refuse to build anything or bolt decoration onto the page:

> **A genuine easter egg is hidden. It costs nothing at rest and appears only to
> someone who went looking.** The page stays plain for the skimmer. That is how
> "don't look more designed" and "tons of easter eggs" are both true at once.

The corollary is a real constraint: **a detail positioned to be found is not an
easter egg, it is a feature.** If it announces itself, it has failed on both
counts.

## Do not re-litigate

Settled, several of them the hard way. A session that reopens any of these is
wasting itself.

- **No-JS is a hard constraint, and the check has changed.** `dist/` shipped
  zero scripts for the whole rewrite, and then Vercel Web Analytics went in —
  one 2.8 KB inline module, last in the body. That grep is now false on purpose.
  Check instead that **every word, link and route works with JavaScript
  disabled**, and never delete the beacon to make the old check pass. JS may
  only _add_.
- **Links carry no decoration at rest, anywhere.** Two attempts at a resting
  mark were rejected on sight. Position and colour separate links; lime arrives
  on hover and focus. The WCAG 1.4.1 cost is accepted and recorded in
  `global.css`.
- **Each page gets one full-strength accent**, on the most human thing on it.
  The wordmark on `/`, the joke on `/404`. `accent-quiet` is for an aside that
  would otherwise compete — currently the closer's murmur.
- **There is no work section and no writing section.** Employment history is on
  the résumé. Writing returns with a post, not before; a section heading is a
  promise that something is under it.
- **All copy on the site is jass's.** Never write it for him. Diagnose, give him
  shapes and constraints, let him land the words. The closer was arrived at this
  way and it worked.
- Colour and font vocabulary lives in `CONTEXT.md`. Read it before touching a
  token.

## What is already built — do not rebuild it

**Correctness (ticket 10, done):** full `og:`/`twitter:` tags and a generated
card; a lime-tile favicon; a designed focus ring; `/llms.txt`; scroll margin on
the anchors; a print stylesheet.

**Craft (passes one and two):** the 676-byte italic-ampersand font; the
underline that draws in and retracts to the left; the entry row that wakes as a
unit on hover; `text-wrap: pretty`; list leading fixed so entry gaps beat
wrapped-line gaps; prose capped to ~71 characters; the stamp revealing its
commit subject on hover.

**Three things already egg-shaped, and they are the seeds:**

1. `/llms.txt` — a clean machine-readable copy of the site, served to agents, by
   a man whose intro says he is scared of his agents. No human ever sees it.
2. The stamp hover — a date that hands you the diff _and_ tells you what changed.
3. The 676-byte font that exists so that two ampersands are beautiful.

**There are three of them, they are all quiet, and that is the whole problem.**
That is the pattern to multiply.

## What has not been done, and is the actual gap

Nothing in the "someone would tell a friend about this" category. Not one thing
on the site rewards curiosity with delight rather than with correctness.

Deliberately left for this ticket rather than pre-specified, because ticket 04's
method still governs: **the details are an output of looking at the real page,
not a list drawn up in advance.** Two starting points only, both already agreed:

- **A View Source comment.** This audience opens devtools on a site this
  deliberately plain — that is the _point_ of it being plain. Wit placed where
  nobody puts wit, zero JS, zero rendered bytes. Needs jass's words.
- **The marginalia meme reveal**, ticket 10's item 6, never built. The most fun
  and the least certain. Before building, settle: what it degrades to with JS
  off (the default, not the edge case); whether touch and keyboard get a path;
  whether the marked word is marked at all; and how long one costs to author.

## Working method

**Passes, not pitches.** Build a batch, jass looks, he kills what is noise,
repeat. Pitching ideas in chat is the slow version — half of them can only be
judged on screen. The previous session agreed this and then did one pass and
stopped, using "nobody has looked at it yet" as a reason to stop building rather
than a reason to get eyes. Do not repeat that. The per-detail test is the
agent's judgement to make; killing noise is jass's.

**Measure before shipping.** This has already killed candidates and saved
others, and it is not optional ceremony:

- the entry list looked like it needed a smaller gap; measurement showed the gap
  was already the _smaller_ number and the leading was the fault
- the closer's aside was going to wrap on mobile at 511px against a 342px column
- the wordmark's `j` was suspected of misalignment; it is 1.8px, which is
  nothing, and the tail's overhang compensates
- the entry descriptions were suspected of hyphens standing in for dashes; there
  are none

Two of those four were rejections. That ratio is healthy.

**Nobody has looked at this site.** Not once, at any width, by any human or
agent. Screenshot capture fails in-session, and `codex-verify-ui` cannot run
because jass's account rejects the pinned `gpt-5.6-sol` model. Either fix that
auth, move the pin, or — best — **open the PR**, because Vercel's git
integration gives a preview deployment, which is a real URL on a real origin and
the only way to test the OG card at all. Discord cannot scrape localhost.

## Where the work stands

52 commits ahead of `main`, all pushed, no PR. CI runs on `pull_request` —
`verify` for the site and `resume`, which rebuilds the PDF and fails if the
committed one is stale. Both pass locally.

Merging replaces the old site: `/blog`, every post, `/palette` and `/projects`
begin 404ing, including three posts in Google's index. That is the recorded
decision — no redirects, which is what makes `/404` load-bearing — and it is
cheap to reverse with a `vercel.json` if it turns out to sting.

## Pass one (aug 15) — what got built, and the structural fact it surfaced

The structural fact first, because it shapes every later pass: **the
"tell-a-friend" eggs are all gated on jass's words.** The View Source comment,
the marginalia memes, a humans.txt — every detail with actual personality needs
his voice, because the site's personality _is_ his voice. So a session's build
pass splits cleanly: build everything copy-free that defends itself, and wire
the copy-gated ones so each becomes a one-constant edit when the words arrive.

Built, each with its defence in a comment at the site:

- **Paper gets the stamp's working** — the commit subject prints; the print
  block's own premise is that paper can't hover. Also fixed a latent artifact:
  `opacity: 0` was reserving a blank paragraph-shaped hole at the sheet's end.
- **The keyboard gets it too** — `group-focus-within` reveals the subject; the
  focus ring's comment calls the keyboard the one pointerless way to find
  things, and a hover-only reveal contradicted it.
- **The section you asked for signs itself** — `section:target > h2` draws the
  site's 2px lime stroke and retracts it the way it came, once, on anchor
  arrival. The page has no nav, so an anchor arrival is always an outside
  link; accent appears only when the reader asks, and following an anchor is
  asking. Removed outright under reduced motion (a transient cue, not an
  affordance).
- **`rel="me"` on the five external socials** — the /llms.txt move again:
  serve a machine convention where no human looks. GitHub links back, so the
  handshake actually closes.
- **`<time datetime>` on the stamp** — the markup says the date is a date, for
  whoever reads source.
- **View Source comment plumbing** — `SOURCE_NOTE` in `src/intro.ts`, emitted
  as the first thing in `<body>` via `set:html` (Astro strips real template
  comments). Empty string ships zero bytes. The slot's constraints are on the
  constant; the words are jass's.

## The marginalia reveal — questions settled, build blocked on content

The four questions the ticket said to settle before building, settled:

- **JS off:** pure CSS (`:hover`/`:focus-within` on a span, sibling or
  `:has()` selector to the reveal). The no-JS path _is_ the only path; nothing
  degrades because nothing is JS.
- **Keyboard and touch:** the marked word gets `tabindex="0"`. Keyboard: tab
  lands a lime ring on a word mid-paragraph with no visible reason — the
  mystery is the egg working — and the margin answers. Touch: a tap focuses
  the span, which is the same reveal. Recorded tension: a focusable
  non-interactive span is an a11y anti-pattern; a screen reader hits a stop
  that announces a bare word. Mitigation at build time (`aria-hidden` on the
  reveal is already precedent — the stamp subject does it).
- **Is the word marked?** No. A genuine egg is hidden; the intro is read with
  a cursor over it, and discovery-by-accident is the mechanism.
- **Cost per instance:** one span + one absolutely-positioned figure in the
  true margin, which exists only above ~1100px viewport; below that the
  reveal is display:none and mobile loses nothing at rest. ~15 minutes of
  build per instance once jass supplies the pair.

**Blocked on jass:** each instance is a (word, meme) pair, and both halves are
his — the word choice is voice and the meme is taste. The mechanism is
mechanical once the first pair exists.

## Copy slots open for jass — shapes and constraints, no drafts

- **The View Source comment** (`SOURCE_NOTE`, `src/intro.ts`). Deadpan, nothing
  explaining it; no `--` inside (terminates the comment). It sits right after
  the head's machine tags — the reader arrives having just scrolled past
  og-tags and font preloads. Shapes that fit the register: a remark aimed at
  exactly the kind of person who is currently reading it; or the site stating
  a fact about itself no renderer shows; or one line that rewards the trip
  without acknowledging the trip exists.
- **Marginalia pairs** — (word in the intro, meme) as above.
- **The OG re-shoot** — the old card was a photograph of a screen, which only
  jass can retake. Still on the table from ticket 10.

## Done when

jass says the page is done, which is ticket 08's close condition too.
