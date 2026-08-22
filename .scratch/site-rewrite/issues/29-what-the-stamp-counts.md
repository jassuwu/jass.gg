# What the stamp counts

Type: grilling (HITL, small) + task
Status: open
Blocked by: nothing

## Question

`last-touched.ts` derives the stamp from the last commit touching
`src/data`, `src/pages`, `src/layouts`, `src/styles` — so a new friend
act (`src/scripts/`, `src/components/`), a new sound (`public/`), or new
intro copy (`src/intro.ts`) does **not** move the date. The aug-15 detail
blitz only moved the stamp because it happened to touch pages/styles too.
Finding: [site-audit.md](../research/site-audit.md) §8.

1. **The decision:** what counts as "touched"? If the site's pride is the
   details, a shipped detail is surely a touch. Candidate: everything
   under `src/` plus `public/`, minus lockfile-ish noise — or simply the
   whole repo minus `.scratch/` and `README.md`.
2. **The fix regardless of the decision:** on a shallow CI clone, an
   empty `git log` result flows through `new Date("")` → NaN → silent
   fallback to **build time** — the exact lie the stamp exists to avoid.
   Guard the empty string explicitly; prefer failing loud over lying
   quiet. (Check Vercel's clone depth while at it.)
