# What the stamp counts

Type: grilling (HITL, small) + task
Status: closed — resolved aug 22, fixed on this branch
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

## Resolution

**Everything that ships counts: `TRACKED = ["src", "public"]`.** A new
friend act, a reworked component, a new sound — each now moves the date;
`.scratch`, README, resume sources and configs stay excluded by not being
listed. The shallow-clone lie is closed: an empty path-filtered `git log`
now degrades to HEAD's own commit date (a real date, at worst slightly
newer than the true last touch) instead of flowing through `new Date("")`
into build time. Build time remains only for the no-git-at-all case.
