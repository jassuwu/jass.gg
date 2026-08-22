# The repo spoils the show?

Type: grilling (HITL, small)
Status: open
Blocked by: nothing

## Question

The repo is public, and `.scratch/` (33 tracked files) is a complete
spoiler sheet: the map, every ticket, jass's candid quotes, and documented
walkthroughs of every hidden detail — including where the liquid-glass
puzzle's arrows hide — readable by exactly the audience most likely to
open the repo (the site's own thesis says they arrive from twitter and
read code). Finding: [site-audit.md](../research/site-audit.md) §9.

Three honest positions; jass picks one:

1. **The repo is part of the show.** The map *proves* "plain because
   considered" in a way the page can't — leave it, on purpose, recorded.
2. **The magic wants a curtain.** Move `.scratch/` out of the public tree
   (private branch, separate private repo, or gitignore going forward —
   history stays public either way without a rewrite, which is its own
   sub-decision).
3. **Split the difference:** map and research stay public; the per-detail
   walkthroughs (the actual spoilers) move.

Adjacent, same sitting: the `AGENT DRAFT — jass rewrites` comments ship
in public source and say what they say.
