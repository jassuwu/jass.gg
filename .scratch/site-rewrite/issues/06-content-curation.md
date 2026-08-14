# Curate the content

Type: grilling
Status: open

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
