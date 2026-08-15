# Curate the content

Type: grilling
Status: resolved

## Question

What content exists on the new site, in what taxonomy, with what fields per entry?

Work through `github.com/jassuwu/jassuwu` (the profile README) alongside the current site and settle:

1. **Does the `things` / `toys` split come to the site?** The README already uses it and the site doesn't — it flattens everything into "projects." The split is voice: it signals which work is serious without anyone having to say so. In or out?
2. **What survives.** The README and the site disagree:
   - README-only, not on the site: `andrew-dictate`, `skills`, `ass`, `onandemo.js`
   - Site-only, dropped from the README: `psgoogle` (2024, no visual)
   - On both: `better-splitwise`, `mojify`, `quilt`, `savemefrom`, `incomerank`, `liquid-glass-cursor`, `subway-cursors`
   Go through each. Keep, drop, or reclassify.
3. **Entry format.** The README format is bold name — em dash — one lowercase line, with no date, no tags, no thumbnail. The current collection schema carries `tags`, `date`, `featured`, `thumbnail`, `thumbnailAlt`, `github`, `link`. What does an entry actually show under rung-2 plainness, and what does the schema keep for sorting even if it never renders?
4. **The thumbnails.** Seven Remotion-derived `.webp` files exist. Rung 2 demotes them to on-demand reveals. Are they kept, and if so what reveals them?
5. **Blog.** All existing posts are discarded — they were AI-written and jass judged them low quality. A `hello-world` post survives as a **stub marked as needing to be written by jass himself**. Confirm nothing else carries over, and decide what the blog index shows when it holds exactly one unwritten post.
6. **Work experience.** Currently hardcoded in a component with three entries. Does it become content, stay in code, or compress to something much shorter now that recruiters are explicitly the fallback audience and the résumé PDF serves them?
7. **Socials.** Six links today: résumé, twitter, github, discord, linkedin, email. All six, or fewer?

Record the final content inventory in the answer — it's the input to ticket 08.

## Answer

**The profile README is the source of truth for what exists.** That's the rule this ticket produces, and everything else follows from it.

The evidence: the README already had `andrew-dictate` (pushed the day before this ticket ran) and had already dropped `psgoogle`. Neither change ever reached the site. The README is the list jass actually maintains, so the site follows it rather than competing with it. When they disagree, the README wins. Recorded in `src/content.config.ts` so the next session doesn't have to rediscover it.

### The taxonomy

`things` / `toys` comes to the site as a `kind` field. The split is voice — it says which work is serious without anyone having to say so.

### What shipped: 11 entries

**things (5)** — andrew-dictate, better-splitwise, mojify, quilt, skills
**toys (6)** — ass, onandemo.js, savemefrom, incomerank, liquid-glass-cursor, subway-cursors

Added, never on the site before: **andrew-dictate, skills, ass, onandemo.js**.
Dropped: **psgoogle** — 2024, no live link, no thumbnail, and already gone from the README.

Validated against the real loader: 11 projects, 5 things, 6 toys.

### Entry format

Renders: **name, one line, and the links** (live + source). The description is now the README's one-liner, replacing the site's two-to-three-sentence paragraphs — rung-2 plainness wants a line, not a blurb.

Schema keeps `date` for sorting only, never rendered. **`tags` and `featured` are gone**: tags on an 11-item list are noise when `kind` already categorises, and `featured` is a second ranking system on a list short enough to read whole.

### Thumbnails: deleted

All seven Remotion-derived `.webp` files are gone. jass: *"nah fuck 'em. delete if they're not used."* Nothing renders them — ticket 04 settled that stage one has no hover reveal to hide them behind, and 4 of the 11 entries never had one, so any design depending on them was already inconsistent. Recoverable from git if stage two wants them.

### Blog

All three posts deleted, with their banner images. They were AI-written and jass judged them low quality, so they are not migrating. `hello-world` survives as a **stub with `draft: true`** and an in-file comment instructing future agents not to write it — an agent-written post there would recreate exactly the problem that emptied the folder.

The blog schema drops `tags` and `bannerImage` and gains `draft`, so an unwritten post cannot render as a finished one.

Whether `/blog` exists as a route at all while its only post is unwritten is **ticket 07's call** — it's a routing question.

### Work experience

Three entries, in code at `src/data/work.ts` rather than a collection: they change about once a year and don't need a loader and a schema. No bullet points, because jass asked for it *"cleverly shown in less space, and in tone with the rest of the site"* — that's a rendering decision for ticket 08, and pre-writing CV bullets would prejudge it.

One observation handed to 08: the shape is `cypher → stealth → cypher`. He left and came back. A peer reads that instantly and three equal rows hide it — worth leaning on rather than flattening.

### Socials

**All six stay** — résumé, twitter, github, discord, linkedin, email. jass overruled the recommendation to cut linkedin and discord. Restored in `src/constants.ts`.

### Left open, deliberately

Ten SVG icons survive in `src/assets/icons/`, four of which (`hamburger-menu`, `github-primary`, `move-left`, `move-left-muted`) belong to a nav and blog UI that no longer exist. They weren't deleted because ticket 08 may render socials as **text rather than icons**, in which case all ten go, not four. Deleting the obvious four now would just be a second cleanup later. Flagged for 08.
