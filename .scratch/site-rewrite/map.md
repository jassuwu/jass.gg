# Map: jass.gg ground-up rewrite

## Destination

jass has seen a **real, working homepage** — running in a browser, on the new scaffold, with real content — and signed off on it. Alongside it: the design spec and content curation that make the remaining pages mechanical to build.

The map ends at approval of one concrete thing. It does **not** carry the rewrite to a deployed site — that's a separate effort, deliberately, because July's failure was 20 demos built before anything was approved.

## Notes

**Domain: personal site design + Astro frontend.**

### The thesis

Two words do all the work here, and they are not the same word:

- **plain** — the surface. Low ornament, nothing decorative, no hero, no glass, no gradient.
- **considered** — the substrate. Every spacing value, transition, empty state and edge case chosen deliberately.

AI slop is **plain without considered**, and it costs instant respect. The target is **plain _because_ considered** — restraint that cost more than decoration would have. These look identical in a screenshot, which is the central design risk of this effort. Every ticket should be judged against it.

Corollary, in jass's words: *not a lot of small things — a specific small number of small things, each turned up to 100.*

### Reference

`github.com/jassuwu/jassuwu` (profile README) is the visual and structural reference. Bold name — em dash — one lowercase line. No cards, no thumbnails, no tag pills, no dates. One live self-made artifact (the quilt SVG) doing the work that decoration would otherwise do.

`docs/portfolio-inspiration.md` in the main checkout (71 sites, untracked, kept from the July effort) is the research directory — mine it rather than generating fresh options.

### Standing constraints

- **No-JS is a hard constraint.** Every word, link and route works with JavaScript disabled. JS may only *add* (analytics, comments, interactions CSS genuinely cannot do). Compromise to "JS but light" only where absolutely required, and say so out loud when you do.
- **Astro, minimal JS, light payload.** Latest versions. Tailwind, with a defined escape hatch to plain CSS (ticket 09). shadcn only if it earns its place (it probably won't).
- **Scaffold, don't hand-write.** Use CLI scaffolds and tooling generators for as much of the setup as possible.
- **Content ports, it does not get rewritten.** Exception: all existing blog posts are discarded — they were AI-written and jass writes the future ones himself.

### Skills every session should consult

`/grilling` and `/domain-modeling` by default. `/prototype` for the prototype tickets. `/research` for research tickets.

### Hazard

`.scratch/` is **not** gitignored, and ticket 02 deletes nearly the whole repo. **This map must survive that wipe.** Preserve `.scratch/` explicitly when gutting the tree.

## Decisions so far

- **Audience** — peers and the terminally-online dev crowd; recruiters are a fallback path served by the résumé PDF, not by the site's structure.
- **The site is stale from inattention, not friction** — so no publishing-pipeline or CMS work belongs in this effort. A rewrite is justified by pride and by wanting a site that's fun to touch, not by automation.
- **Invariants that survive the rewrite** — neutral + lime palette (`oklch(0.9392 0.1588 124.39)` as the single reserved accent, zinc ramp, light and dark); the tone of the intro paragraph; and the craft-in-the-corners ethos (a unique 404, the progressive blur, that class of detail). *Nothing else is load-bearing* — every component, page and layout is fair game.
- **Plainness rung: text-first (rung 2)** — cards, badges and thumbnails go; projects become a text list; images appear only on demand. Accepted cost: the seven Remotion thumbnails built in June get demoted to reveals.
- **The tell is content density plus a live artifact, not a placed interaction** — the page is immediately full of real shipped work. A signature interaction *positioned to be found* reads as trying, and trying is what's being subtracted. Drive-by visitors who never interact are an accepted loss.
- **Shape: single page**, plus `/blog/<slug>`, plus the palette page (renamed or dropped), plus `/404`. Existing blog URLs are not broken for aesthetics.
- **Typography system** — Baskervville = the paper (body, prose); IoskeleyMono = the machine (dates, periods, repo names, anything factual); Excalifont = the margin (annotation, memes, asides — never a headline). Subject to validation in ticket 03.
- **giscus and PostHog stay.** Both must degrade cleanly under the no-JS constraint.
- **Build mechanics** — in place on `jassuwu/jass.gg`, new branch, near-total deletion, fresh scaffold. Content collections survive as a model, reshaped around `things` / `toys`.
- **Appetite** — a few evenings over roughly two weeks.
- [t3code marketing site: stack and tooling diff](issues/01-t3code-tooling-diff.md) — it's Astro 7 with a 6-line config, a one-line tsconfig, **no Tailwind in the marketing tier** (though `apps/web` uses Tailwind + shadcn), and two tiny progressive-enhancement scripts with real static fallbacks. Take the shape; leave the whole root toolchain (vite-plus, pnpm catalogs, oxlint+plugin, tsgo, Blacksmith CI). Bun stays; TypeScript stays on 6.0.3, not 7. Verified scaffold commands in [`research/t3code-tooling.md`](research/t3code-tooling.md) §6.
- [CSS strategy: Tailwind or vanilla CSS?](issues/09-css-strategy.md) — **Tailwind by default, plain CSS by exception.** Tokens live in `@theme` as custom properties so both worlds share them. Escape to a scoped `<style>` block for `:has()`/sibling selectors, keyframes, long-form prose, and anywhere the utility string is longer than the CSS. No `@apply`-built semantic classes; one owner per property.

## Not yet specified

- **How writing is presented.** Post layout, prose styles, and what a `/blog/<slug>` page looks like under the new system — waits on the index being settled.
- **Whether giscus and PostHog actually survive contact with the no-JS spine.** Both are JS; the constraint says content works without them. Revisit once the page architecture is real.
- **The "live" element.** jass floated representing something like a local clock creatively as a component. Whether anything live exists at all depends on the detail budget (ticket 04).
- **Dark/light toggle without JS.** Currently a `.dark` class, which implies a script. `prefers-color-scheme` only? A CSS-only toggle? Unresolved.
- **Identity assets** — favicon, OG image, and whether jass's photo appears on the site at all (`photo.webp` and a square `avatar.webp` exist untracked on main).
- **How the résumé PDF is surfaced** under a text-first index.
- **Redirects and legacy URL handling** — sharpens once ticket 07 fixes the routes.
- **What the palette page is called**, if it survives ticket 07.

## Out of scope

- **Admin login / master password / any write path from the browser.** Floated and dropped — it re-solves a friction problem that was never the cause, and it needs a backend, which would bend every other decision toward "we need a server." Belongs to a different effort with a different destination.
- **The résumé auto-publish pipeline** (resume.tex → CI → release → deploy hook) and the BRAG.md curation system. Real work, planned June 2026, but its destination is keeping the résumé current — not this site's design.
- **Rewriting the existing blog posts.** They're discarded, not improved.
