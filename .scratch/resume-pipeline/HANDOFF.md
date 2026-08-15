# Handoff: the resume pipeline

**Read this cold. You do not need the chat it came from.**

Companion document: [`research.md`](research.md), 616 lines, most of it measured
rather than read. Read §0, §4 and §6 of it before writing any code. This file is
the decisions and the traps; that file is the evidence.

## The job

jass's resume lives in a **separate repo, `jassuwu/resume.tex`**: one hand-written
`.tex` file, no CI, no releases. He compiles it by hand in a free online LaTeX
editor, downloads the PDF, and hand-copies it into `jass.gg/public/resume.pdf`.

He wants **one source-of-truth document** that CI turns into a well-typeset PDF
automatically, hosted from the same pipeline, so every change lives in one repo.
His words: "really good formatting, really good font". He is explicitly not
looking for a template site.

## Already settled — do not re-open

**The site-side plumbing**, designed in a session on 2026-06-09 and unchanged:
GitHub Actions in the resume repo → rolling `latest` release asset → `curl` a
Vercel deploy hook → jass.gg fetches the PDF at build time, with the committed
`public/resume.pdf` as fallback. jass.gg is static Astro on Vercel via git
integration, no adapter, no `vercel.json`, canonical host `www.jass.gg`.

**Not a template.** The recommendation is to write the layout by hand and import
nothing. Read `basic-resume`'s source for reference; do not depend on it.

## The one decision that is actually open

**Typst, or stay on LaTeX.** The research recommends Typst 0.15.x and makes a
strong case. The argument against is real and it is jass's to weigh, not yours:

He would be putting a document that must stay correct **for years** onto a
**pre-1.0 language whose author has publicly committed to more breaking changes**
— including function parameter syntax, which would touch every `#let` in the file.
LaTeX documents from 1995 still compile; Typst offers no equivalent promise, and
0.14→0.15 took seven months and shipped breakage.

The counter: pinning the compiler exactly (`0.15.1`, never `^0.15`) makes the
build reproducible indefinitely — the release binary stays on GitHub and Typst has
no runtime dependencies to rot. Upgrades then fail as a compile error on an
80-line file he wrote himself, not as silent wrongness. Bounded, but a recurring
tax LaTeX would not charge.

**Ask him. Do not decide this for him.**

## The traps — all measured, all engine-agnostic

These are the findings that change what you build, regardless of which tool wins.

### His current PDF already has a live ATS bug

Verified independently, twice. The FontAwesome icons in the contact line — the row
a parser most wants to read — extract as garbage:

```
jass.gg | jass@jass.gg | § /jassuwu | \x8a /jassdotgg | ï /in/kprnv | * India
```

Those are `Custom`-encoded glyphs with no Unicode mapping. The PDF is also
`Tagged: no`. **The incumbent is not a safe baseline to beat carefully** — it is
already broken in the place that matters most. Drop icon fonts entirely; use the
words.

### Letter-spacing destroys section headings

The single most important finding. Headings set in the site's house style (mono,
small, uppercase, `tracking: 0.12em`) extracted as:

```
'E X P E R I E N C E'   'P R O J E C T S'   'S K I L L S'
```

from two independent extractors. Removing tracking recovered both exactly.
**Section headings are how an ATS segments a resume** — tracked-out headings mean
the parser finds no experience section at all.

This is not a Typst problem. Letter-spacing is per-glyph positioning in every
typesetting system; LaTeX `soul`/`microtype` would do the same. **It is a design
constraint.** Get the small-label feel from size, weight, case and colour instead.

Worth knowing: **jass.gg itself does not track its micro labels** — checked, there
is no `tracking`/`letter-spacing` anywhere in `src/`. So this conflicts with an
aesthetic he might reach for, not one he currently ships. Smaller collision than
it first appears, but say it out loud before he adds tracking and wonders why
recruiters never see his jobs.

### Ragged-right, not justified

A free hedge rather than a hard rule. Under `justify: true`, poppler's `-raw` mode
collapsed word spaces on ~4% of lines. **pdfminer.six and pypdf found zero on the
same files**, so the spaces are genuinely in the PDF and this is a poppler
heuristic, not a defect — do not over-conclude from one extractor. Ragged-right
sidesteps it entirely and costs nothing typographically here.

### What is genuinely better

Typst 0.14+ emits a **tagged PDF** with a real structure tree
(`/Document → /H1 → /L → /LI → /Lbl + /LBody`) automatically, and
`--pdf-standard ua-1,a-2a` passes clean. That is a strict improvement over the
current untagged pdfTeX output.

Unverified and flagged as such: whether any specific commercial ATS actually reads
structure trees. Treat tagging as correctness, not as a proven ranking win.

### Fonts

Typst takes **TTF/OTF/TTC only — no WOFF2**. The site's `src/fonts/*.woff2` need a
one-time conversion; Ioskeley ships upstream TTFs, prefer those. Vendor them in
the resume repo rather than reaching across repos.

## Build order

1. Convert the three fonts `.woff2` → `.ttf` once, commit under `fonts/`.
2. Transcribe `resume.tex` content into `resume.yaml`, using JSON Resume field
   names so the data stays portable if the renderer ever changes.
3. Hand-write `resume.typ` (~80 lines). **No letter-spacing on section headings.
   No icon fonts. Ragged-right.**
4. Put the one-page invariant *inside the document* — `context` + `assert` on
   `counter(page).final()`. Verified: exits 1 with a readable error, needs no
   `pdfinfo`, and fires in local preview too. Compile is ~50 ms.
5. Add `pdftotext | grep` gates for the contact line and the section headings, so
   the two bugs above can never come back silently.
6. Wire the workflow. Keep the committed `public/resume.pdf` fallback.
7. **Rename the repo** — `resume.tex` becomes a lie. Do this *before* wiring CI,
   because the deploy hook lives on the repo.

## Two things beyond the tool choice

**The content is stale**, and no pipeline fixes that. As of the June research: the
Cypher role carries one placeholder bullet written *before he started* (Sep 30
2025), and no 2026 projects are listed. Shipping a beautiful build of a stale
document is the least useful possible outcome. Raise this early.

**There was a keep-it-current design** from the same June session, and it is worth
resurrecting once the pipeline exists: append-only `BRAG.md` + a `CURATION.md`
holding the one-page invariant and a drop-weakest rule; a weekly sweep appends to
BRAG; a monthly agent opens a PR *only* when an entry beats the weakest existing
bullet; CI fails if the page count moves; a human merges. Prefer GitHub Actions
cron over Claude routines — research-preview caps, and cron-OIDC bug #814 means
keeping a `workflow_dispatch` fallback.

## Also possible, worth pricing before committing

One YAML could feed a `/resume` **page** on jass.gg as well as the PDF, plus a
machine-readable JSON. See research §3. If that lands, `/llms.txt` should list it
— the site already serves itself to agents and a structured resume is the obvious
next thing to hand them.
