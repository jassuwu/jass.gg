# Page architecture: routes, anchors, and growth

Type: grilling
Status: claimed

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
