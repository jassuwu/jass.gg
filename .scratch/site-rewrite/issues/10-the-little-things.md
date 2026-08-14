# The little things

Type: prototype
Status: open
Blocked by: 08 (stage one, which is built and stable)

## Question

Stage one of ticket 08 is a real, working, plain homepage that jass has iterated
on for a full session and stopped objecting to. This ticket is stage two: the
details that take it from _fine_ to **"what a great eye for detail"** — jass's
words, and the actual bar.

Ticket 04's method still governs and is not up for re-litigation: **the number
of details is an output of looking at a real page, not a budget set in
advance.** Add where it's dead, nowhere else. If a change makes the page look
more designed, it's the wrong change.

## Do not re-litigate

These were all settled, several of them the hard way. A fresh session that
reopens any of them is wasting the session.

- **No-JS is a hard constraint.** `dist/` currently ships zero `.js` and zero
  `<script>`. JS may only _add_. Check this after every change.
- **Links carry no decoration at rest, anywhere.** Two attempts at a resting
  mark were rejected on sight. Position and colour separate links instead;
  lime arrives on hover and focus. The known cost is written into `global.css`.
- **A link inside prose takes `accent-quiet`.** The one case where position has
  nothing to work with. Links in a list or a row never need it.
- **Each page gets one full-strength accent**, on the most human thing on it.
  The wordmark on `/`, the joke on `/404`.
- **There is no work section**, and employment history is off the site.
- **All copy on the site is jass's.** Never rewrite it. The profile README is
  the source of truth for entry descriptions; change it there first.
- Colour and font vocabulary lives in `CONTEXT.md`. Read it before touching a
  token.

## The candidates, ranked

### 1. Open Graph and favicon — the biggest hole on the site

**There are no `og:` tags at all.** `public/opengraph.jpg` exists, left over
from the old site, and _nothing references it_. `Layout.astro` sets a favicon
and a description and that is the whole of the head.

This matters more than anything else on this list because of who the audience
is. Peers meet this site as a link pasted into Discord or Twitter. Most people
will see the preview card before they ever see the page — and right now the
preview is whatever the platform scrapes by accident.

Needs: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, and the
`twitter:card` pair. Then an actual image. The image is a design job, not a
config job, and it should look like the site: neutral, lime, the wordmark in
Excalifont. Astro can generate it at build time, or it can be a static file.

Also decide the favicon here. `public/favicon.webp` is the old site's.

### 2. A real focus-visible state

Killing resting underlines opened a hole we accepted deliberately: at rest a
link is visually identical to ordinary text. Keyboard users currently get the
browser's default focus ring, which is the last piece of unstyled chrome on the
site.

Making focus a designed accent state is both the honest counterweight to that
decision and a detail that says someone thought about people who don't use a
mouse. `a:focus-visible` already inherits the hover underline; it deserves
better than to be an afterthought of the hover rule.

### 3. `/llms.txt`

From jass's own research directory (`docs/portfolio-inspiration.md`, Jeremy
Howard). The intro now says he shepherds agents and is scared of them. A site
that then serves a clean machine-readable version of itself _to agents_ is the
joke landing twice.

One Astro route generated from the existing content collections. No human ever
sees it. Cheap, and about as on-theme as a detail can get.

### 4. `scroll-margin-top` on the section anchors

`#things`, `#toys` and `#writing` currently jump with the heading welded to the
top edge of the viewport. Nobody notices scroll margin. Everybody notices its
absence without knowing what they noticed.

### 5. A print stylesheet

Someone will hit Cmd+P on a page that sits next to a résumé. Expanding link
`href`s after the link text on print is the classic move, and it's genuinely
needed here because the links carry no decoration to hint they exist.

### 6. The marginalia meme reveal — deliberately last

Ticket 05's original idea, folded into 08 and never built. The site looks like
static HTML until hovering one word brings a meme to life, contextual to the
sentence around it.

It's the most fun and the least certain. It needs hover, which half the traffic
doesn't have. It needs bespoke authored moments, which don't survive a two-week
appetite. And a signature interaction _positioned to be found_ reads as trying,
which is the thing this whole effort is subtracting.

If it gets built, settle first: what it degrades to with JS off (the default,
not the edge case); whether touch and keyboard get a path or it's an accepted
desktop-only reward; whether the marked word is marked at all; whether it lives
in Excalifont; how many (one is a secret, five is a mechanic, ten is a theme
site); and how long one costs to author.

## Known gaps, not candidates

- **Mobile has never been seen, only measured.** Screenshot capture failed
  every time this session. Layout is verified at 390px by measurement: no
  horizontal scroll, nothing overflows, tap targets are 27–28px. Nobody has
  looked at it.
- **Substance signals** is still the sharpest open problem on the map and is
  still blocked on there being 11 GitHub stars across 11 repos.

## Done when

jass says the page is done, which is ticket 08's close condition too. This
ticket exists so a fresh session has an entry point that isn't 200 lines of
history.
