# Page architecture: routes, anchors, and growth

Type: grilling
Status: resolved

## Question

The site collapses to a single page. What are the routes, how do links behave, and how does the page absorb content that doesn't exist yet?

jass raised this directly: *there's a lot of things that will be anchor tags — some internal, some external. External is fine. But internals, like a link to a blog post? We might need to account for future inclusions.*

Settle:

1. **The route list.** Agreed so far: one index, `/blog/<slug>`, the palette page, `/404`. Confirm — and confirm nothing else needs a route.
2. **The palette page.** It survives because it's long and genuinely jass's, but the name only makes sense once you've read the definition on the page. Rename it to something anyone gets, or drop it if it turns out to be dead weight. Decide by reading it.
3. **Anchor vs route.** Within the index — do sections have URLs anyone can link to? Does the page have navigation at all, or is scrolling the whole interface? A nav on a one-page site is either honest or it's furniture.
4. **Link behaviour.** Do internal and external links look and behave differently? jass flagged this as a possible micro-interaction — coordinate with ticket 04's budget rather than deciding it twice.
5. **Growth.** The index holds intro, work, things, toys and socials today. What happens at 20 things? At 40? Does the page have a designed failure mode, or does it get restructured later — and if later, say so now so nobody designs for a size that won't hold.
6. **Legacy URLs.** `/blog`, `/projects`, `/palette` and three `/blog/<slug>` posts are live and indexed today, and the posts are being deleted. Redirect, 410, or a custom 404 that says what happened? The 404 is already an invariant jass cares about — this may be its job.
7. **Dark/light.** Currently a `.dark` class, which implies JS. Under the no-JS constraint: `prefers-color-scheme` only, a CSS-only toggle, or is the toggle one of the places we compromise to "JS but light"?

## Answer

### Routes

Two, today:

| route | status |
|---|---|
| `/` | the whole site |
| `/404` | every dead URL |

`/blog/<slug>` appears **only when a written post exists**. There is no `/blog` index while its one post is a `draft: true` stub — a blog index listing nothing is worse than no blog.

**`/projects` and `/palette` are gone with no redirect.** jass: *"don't worry about legacy. 404 if such a page doesn't exist."* Astro can emit static meta-refresh redirects with no config file (verified), and that capability is deliberately unused.

### The palette page is deleted outright

Not folded, not renamed — **dropped**. jass: *"literally useless."*

For the record, since the recommendation went the other way: it was 340 words across 11 entries, structurally identical to a things/toys list, and folding it in as a third section named `tools` was on the table. Dropping it is the stronger call — the page existed to list which editor and terminal he uses, which is the most replaceable content on any developer site.

### The 404 now carries weight

With no redirects, the 404 is the only thing standing between a visitor and a dead end — for `/projects`, `/palette`, and three blog posts that were live and indexed. It is a named invariant *and* now load-bearing.

Built plain for now (`src/pages/404.astro`). Its personality is stage-two work, per ticket 04: added after the page is judged bare, not before.

### Navigation: none

Scroll is the interface. A nav on a single page is furniture that exists because sites have navs.

Sections get stable `id`s so `#things` is linkable — costs nothing visually, makes the page addressable in a way a nav wouldn't.

### Links: no internal/external distinction

Every link is the lime underline from ticket 03. Nearly every link on this page is external — github, live demos, socials — so marking external links would mark almost everything, which marks nothing.

### Dark/light: no manual toggle

`color-scheme: light dark` + `light-dark()` tokens follow the OS with zero JS, already in the scaffold. A manual override would need a script, `localStorage`, and a blocking inline snippet to avoid a flash of the wrong theme — it would be the only real JavaScript on the site, bought to override a preference the reader already set system-wide.

### Growth: show everything

**No pagination, no filtering, no "show more" — ever.** jass: *"show all tbh. i think that's the charm, they come look at the page and see like 100 projects, it tells them how much i build."*

The volume **is** the argument. This also settles the tell from the map's opening decisions — content density — in the most literal way available: the page is long because the work is real.

**But jass named the failure mode himself**, and it's the sharpest open problem left on this map:

> *"at some point we have to have some kind of stats, otherwise it will all look like throwaway projects, and i never built anything substanceful."*

A list of 100 one-line entries proves *quantity* and actively undermines *depth* — it reads as a scroll of weekend hacks. The `things`/`toys` split does part of this work (it says which is which) but nothing inside `things` signals that any of them are substantial.

Not solved here, because per ticket 04 it can't be judged until the real page exists. Carried to **Not yet specified** on the map. The seed: a single `proof` field per entry, rendered in the machine font — `10★`, `brew install`, `on npm`, `10k+ users`. The portfolio research already flagged this pattern (Anthony Fu: *"add `role` and one credible `proof` field to each project"*), and mojify's 10 stars and homebrew tap are real evidence going unused right now.

### Also done here

`Layout.astro` extracted. `index.astro` was inlining the whole document shell, which a code review called fine at one page and duplication at two — the 404 is the second page.
