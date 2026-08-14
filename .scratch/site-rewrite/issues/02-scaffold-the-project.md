# Scaffold the new project

Type: task
Status: open
Blocked by: 01, 09

## Question

Stand up the new codebase on the rewrite branch, so every later prototype has somewhere real to live.

This is HITL — jass explicitly asked to be grilled through the setup as it happens, not handed a finished tree.

Work to do:

- Delete nearly everything in the repo. **Preserve `.scratch/` (this map), `.git/`, and the content and assets earmarked for curation** — see ticket 06 before deleting anything under `src/data/` or `src/assets/`. Also preserve `public/resume.pdf`.
- Scaffold a fresh Astro project with the latest versions, using the CLI rather than hand-written files.
- Add Tailwind, the linter, the formatter, and the type-check setup via their own scaffolds/init commands wherever those exist.
- Apply the recommendations from ticket 01 (`../research/t3code-tooling.md` §6), grilling jass on each place where t3code's answer and the old jass.gg answer disagree.
- Decide on shadcn — jass's own read is that it probably doesn't fit a minimal-JS text-first site. If it's out, say so and don't install it.
- **Verify the `create astro` flag surface at run time.** Ticket 01 deliberately did not guess it; the flags move between releases.
- **Resolve ESLint vs oxlint here.** Ticket 01 could not verify oxlint's Astro support, which is the deciding factor. Porting the existing working `eslint.config.mts` is the zero-risk default.
- Do **not** add a `vercel.ts` — the existing git-integration deploy needs no config file. t3code has one only because a monorepo needs a filtered build command.
- Confirm the Vercel deploy still works from the branch, and that CI still runs.

Record in the answer: the exact scaffold commands used, the resulting versions, and every decision made under grilling.
