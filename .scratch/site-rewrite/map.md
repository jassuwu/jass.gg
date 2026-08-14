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

**But that number is never set in advance** (ticket 04). Build the page plain, look at it, and add only where it's actually dead. Allocating a count and then shopping for things to fill it produces one good detail and one filler detail.

### Reference

`github.com/jassuwu/jassuwu` (profile README) is the visual and structural reference. Bold name — em dash — one lowercase line. No cards, no thumbnails, no tag pills, no dates. One live self-made artifact (the quilt SVG) doing the work that decoration would otherwise do.

`docs/portfolio-inspiration.md` in the main checkout (71 sites, untracked, kept from the July effort) is the research directory — mine it rather than generating fresh options.

### Standing constraints

- **No-JS is a hard constraint.** Every word, link and route works with JavaScript disabled. JS may only *add* (analytics, comments, interactions CSS genuinely cannot do). Compromise to "JS but light" only where absolutely required, and say so out loud when you do.
- **Astro, minimal JS, light payload.** Latest versions. Tailwind, with a defined escape hatch to plain CSS (ticket 09). shadcn only if it earns its place (it probably won't).
- **Scaffold, don't hand-write.** Use CLI scaffolds and tooling generators for as much of the setup as possible.
- **The profile README (`github.com/jassuwu/jassuwu`) is the source of truth for what exists.** It's the list jass actually maintains. When it and the site disagree, the README wins.
- **Content ports, it does not get rewritten.** Exception: all existing blog posts are discarded — they were AI-written and jass writes the future ones himself. Never draft a post for him; that's the failure this rewrite is correcting.

### Skills every session should consult

`/grilling` and `/domain-modeling` by default. `/prototype` for the prototype tickets. `/research` for research tickets.

### Hazard

`.scratch/` is **not** gitignored, and ticket 02 deletes nearly the whole repo. **This map must survive that wipe.** Preserve `.scratch/` explicitly when gutting the tree.

## Decisions so far

- **Audience** — peers and the terminally-online dev crowd; recruiters are a fallback path served by the résumé PDF, not by the site's structure.
- **The site is stale from inattention, not friction** — so no publishing-pipeline or CMS work belongs in this effort. A rewrite is justified by pride and by wanting a site that's fun to touch, not by automation.
- **Invariants that survive the rewrite** — neutral + lime palette (`oklch(0.9392 0.1588 124.39)` as the single reserved accent, zinc ramp, light and dark); the tone of the intro paragraph; and the craft-in-the-corners ethos (a unique 404, that class of detail). *Nothing else is load-bearing* — every component, page and layout is fair game. (The progressive blur was named here originally and has since been ruled out by ticket 04 — it was decoration, not craft.)
- **Plainness rung: text-first (rung 2)** — cards, badges and thumbnails go; projects become a text list. The seven Remotion thumbnails were initially demoted to on-demand reveals and have since been **deleted outright** (ticket 06) — nothing rendered them.
- **The tell is content density plus a live artifact, not a placed interaction** — the page is immediately full of real shipped work. A signature interaction *positioned to be found* reads as trying, and trying is what's being subtracted. Drive-by visitors who never interact are an accepted loss.
- [Page architecture: routes, anchors, and growth](issues/07-page-architecture.md) — **two routes: `/` and `/404`.** `/blog/<slug>` appears only when a written post exists; no blog index until then. **The palette page is deleted outright** ("literally useless"). **No redirects** — every dead URL 404s, including `/projects`, `/palette` and three indexed blog posts, which makes the 404 load-bearing as well as an invariant. No nav (scroll is the interface, sections get linkable `id`s). No internal/external link distinction. No dark/light toggle. **Show every entry, forever — no pagination, no filtering.** The volume is the argument.
- [Validate the three-font typography system](issues/03-typography-system.md) — **the system holds.** Baskervville = the paper, IoskeleyMono = the machine, Excalifont = the hand (marginalia **and the `jass` wordmark** — a name in a hand font is a signature, not a gimmick). None mandatory on a page; use what the content calls for. Body settled at **18px/1.7**; five-step scale in `@theme`.
  - **Lime never colours text** — 1.16:1 on white. It marks text: links get a lime underline and keep `color: inherit`. `lime-highlight` is the rarer surface treatment.
  - **The paper role has no bold.** Baskervville ships one weight; Google's API serves the 400 file for a 700 request. Emphasis is italic, or it moves to the machine role. Hierarchy comes from size and space, not weight — a constraint ticket 08 designs within.
  - **Zero third-party font requests**; 168 KB self-hosted, all SIL OFL 1.1 with the grant embedded in the binaries.
- [Curate the content](issues/06-content-curation.md) — **11 entries, from the README verbatim**: 5 things (andrew-dictate, better-splitwise, mojify, quilt, skills), 6 toys (ass, onandemo.js, savemefrom, incomerank, liquid-glass-cursor, subway-cursors). `psgoogle` dropped. Entry renders name + one line + links; `date` sorts and never renders; `tags` and `featured` gone. **All 7 thumbnails deleted.** Blog wiped to a single `draft: true` stub jass writes himself. All six socials stay. Work history in `src/data/work.ts`, no bullets — 08 renders it "cleverly, in less space, in tone".
- [Set the detail budget](issues/04-the-detail-budget.md) — **there is no budget, and setting one up front was the wrong method.** The count is an output of looking at a real page, not an input to designing one. Ticket 08 builds the page *plain, with no micro-interactions at all*, it gets judged in that state, and only then does anything get added — where it's dead, and nowhere else. Ticket 05 folded into 08 and deleted, because the marginalia reveal can't be judged apart from the page it lives on. Also settled: the **progressive blur is out** (decoration, not function — the one named invariant that fails the thesis), the live signal is a build-time **"last touched" stamp** rather than a clock, and links stay as the lime underline with no hover choreography.
- **giscus and PostHog stay.** Both must degrade cleanly under the no-JS constraint.
- **Build mechanics** — in place on `jassuwu/jass.gg`, new branch, near-total deletion, fresh scaffold. Content collections survive as a model, reshaped around `things` / `toys`.
- **Appetite** — a few evenings over roughly two weeks.
- [t3code marketing site: stack and tooling diff](issues/01-t3code-tooling-diff.md) — it's Astro 7 with a 6-line config, a one-line tsconfig, **no Tailwind in the marketing tier** (though `apps/web` uses Tailwind + shadcn), and two tiny progressive-enhancement scripts with real static fallbacks. Take the shape; leave the whole root toolchain (vite-plus, pnpm catalogs, oxlint+plugin, tsgo, Blacksmith CI). Bun stays; TypeScript stays on 6.0.3, not 7. Verified scaffold commands in [`research/t3code-tooling.md`](research/t3code-tooling.md) §6.
- [Scaffold the new project](issues/02-scaffold-the-project.md) — standing on `t3code/rewrite-website-design`. Astro 7.2.2, Tailwind 4.3.3, TS 6.0.3 (not 7), ESLint over oxlint, Bun 1.3.14. No shadcn, none of the four Tailwind satellites, no `vercel.ts`, no shadcn token bloat. Dark mode via `color-scheme` + `light-dark()` — one definition site per token, zero JS. **`dist/` ships zero `.js` and zero `<script>` tags.** `src/data/`, `src/assets/` and `public/resume.pdf` preserved for ticket 06.
- [CSS strategy: Tailwind or vanilla CSS?](issues/09-css-strategy.md) — **Tailwind by default, plain CSS by exception.** Tokens live in `@theme` as custom properties so both worlds share them. Escape to a scoped `<style>` block for `:has()`/sibling selectors, keyframes, long-form prose, and anywhere the utility string is longer than the CSS. No `@apply`-built semantic classes; one owner per property.

- **There is no work section, and employment history is off the homepage entirely.** Reverses ticket 06's "work history in `src/data/work.ts`, rendered cleverly in less space". Six shapes were tried and rejected — right-aligned periods, a left-axis timeline, prose, an arc-with-aside, an inline run, and grouping by employer. The section wasn't styled wrong; a CV block inside a project index stays a CV block. **The research settles it: of the 71 sites in `docs/portfolio-inspiration.md`, not one puts employment history on its index** — Anthony Fu, Robby Leonardi, Michael Anderson, Philippe Dubost and Tania Rascia all move it to a separate résumé artifact, and the minimal indexes jass admires (rsms, Taylor Town, Paco Coursey, Tim Holman, David Rudnick) simply don't list employers. The résumé PDF is linked in the socials row and carries it. jass's reason is the stronger one: *"where i work" and "years of experience" shouldn't be the thing defining me — my intro, my things, my toys, my writing, in that order.* `src/data/work.ts` is deleted. Note that ticket 06's "cypher → stealth → cypher" story dies with it; that was real and is now visible only on the résumé.
  - The four rejected variants are preserved on the `prototype/work-section` branch (`7a3e085`), not on main.

- **The stamp and the résumé both found homes in ticket 08.** The *stamp* is the footer's last line: a build-time date derived from the last commit that touched content — not from build time, which would claim the site was touched on every redeploy — and **linked to that commit**, so it hands over the diff instead of asserting a date. The *résumé* is one word in the socials row at the top; a text-first index has no better place for it, and a button would make it the loudest thing on a page built for peers.
- **The colour and font vocabulary is settled, in [`CONTEXT.md`](../../CONTEXT.md).** It is **accent** — never "primary" or "secondary", which imply a matched pair this palette doesn't have. Three neutrals (`background`, `foreground`, `muted-foreground`); the accent in three strengths (`accent` as text, `accent-quiet` desaturated, `accent-mark` the invariant, fills only) plus unthemed `on-accent`. Every themed colour is one `light-dark()` at a single declaration site. Fonts stay **paper / machine / hand**, named for the job so no markup ever names a typeface. Deleted as unused: `--color-muted`, `--color-border`, `--text-small`, `lime-highlight`.
- **Links carry no decoration at rest, anywhere.** Ticket 03's thick lime underline and a thinner neutral replacement were both rejected on sight — on a page where nearly every noun is a link, any resting mark tiles the page with rules. Position and colour do the separating instead. **The accent is now exactly four things: the wordmark, the writing line, link hover, and text selection — three of which the reader has to ask for.** Accepted cost, recorded rather than hidden: at rest a link isn't distinguishable from ordinary text, which fails WCAG 1.4.1 for anyone who can't hover.

- [Build the reference homepage](issues/08-reference-homepage.md) — **stage one is built and has stopped drawing objections.** The page is four things in one order: the intro, things, toys, writing. Settled here, mostly by subtraction: **links carry no resting decoration** (two attempts at a mark were rejected on sight; the WCAG 1.4.1 cost is accepted and recorded in `global.css`); **a link inside prose takes `accent-quiet`**, the one case position can't handle; **each page gets one full-strength accent**, on the most human thing on it; socials are text and the ten SVGs are deleted; entry names link to the built thing rather than the repo; the stamp links to the commit it names. The 404 was rebuilt around who actually lands there. **All copy is jass's**, and the profile README was updated so the two agree.
- [The little things](issues/10-the-little-things.md) — **stage two, split out of 08.** Ticket 04 folded 05 into 08 because a detail can't be judged apart from the page it lives on; stage one now exists, so that condition is met and the details get their own ticket. Ranked: OG tags and favicon first, then a real focus-visible state, `/llms.txt`, `scroll-margin-top` on the anchors, a print stylesheet, and the marginalia reveal deliberately last.

## Not yet specified

- **Substance signals — the sharpest open problem.** jass, in ticket 07: *"at some point we have to have some kind of stats, otherwise it will all look like throwaway projects, and i never built anything substanceful."* Showing every entry proves **quantity** and actively undermines **depth** — 100 one-line entries read as a scroll of weekend hacks. `things`/`toys` says which is which, but nothing inside `things` says any of them are substantial.
  - **What counts as proof:** users and GitHub stars. *Not* `brew install` or `on npm` — those are availability, not evidence; anyone can publish.
  - **Thresholded.** A proof only renders above some floor; below it, nothing. A field that can print `1★` is worse than no field.
  - **The blocking fact: there are 11 stars across all 11 repos.** mojify has 10, savemefrom has 1, nine have zero. At any sensible threshold exactly *one* entry ever shows a number — which reads as a spotlight on mojify, not a system, and the silence everywhere else stays legible. Stars cannot carry this today.
  - **Users needs instrumentation first** — analytics on each project site, then months of accumulation before there's anything to print. Long lead time, and the instrumentation is out of scope for this map (see below).
  - **The no-data alternative, from jass's own research** (`docs/portfolio-inspiration.md`, Julia Johnson): make the *entry itself* carry the substance — problem, jass's part, the hard bit, the shipped result. Depth in the writing rather than a metric beside it. Costs nothing but words, works today, and doesn't wait on a number that may never arrive. Tension: it's longer per entry, which fights rung-2 plainness on a page that shows everything.
  - Graduates after ticket 08, per ticket 04's method — it can't be judged until the real page exists.
- **How writing is presented.** Post layout, prose styles, and what a `/blog/<slug>` page looks like under the new system — waits on the index being settled.
- **Whether giscus and PostHog actually survive contact with the no-JS spine.** Both are JS; the constraint says content works without them. Revisit once the page architecture is real.
- **Identity assets** — favicon, OG image, and whether jass's photo appears at all (`avatar.webp` is committed; a full-frame `photo.webp` exists untracked on main). The socials half is settled: **they render as text, and all ten SVGs are deleted.** Sharpened by ticket 08: **there are no `og:` tags on the site at all.** `public/opengraph.jpg` is the old site's and nothing references it, so a link pasted in Discord or Twitter previews whatever the platform scrapes by accident. Now the top candidate in [ticket 10](issues/10-the-little-things.md).

## Out of scope

- **Instrumenting the project sites with analytics.** Substance signals want real user numbers, which means adding PostHog or similar to each of the 11 project repos. That's work in other repositories with its own destination — it doesn't belong to a map whose end is a signed-off jass.gg homepage. Revisit as a fresh effort if the proof-field idea survives ticket 08.

- **Admin login / master password / any write path from the browser.** Floated and dropped — it re-solves a friction problem that was never the cause, and it needs a backend, which would bend every other decision toward "we need a server." Belongs to a different effort with a different destination.
- **The résumé auto-publish pipeline** (resume.tex → CI → release → deploy hook) and the BRAG.md curation system. Real work, planned June 2026, but its destination is keeping the résumé current — not this site's design.
- **Rewriting the existing blog posts.** They're discarded, not improved.
