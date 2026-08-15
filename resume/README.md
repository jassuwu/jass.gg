# resume

The resume, typeset from source. It used to live in `jassuwu/resume.tex`,
compiled by hand in a browser and copy-pasted into `public/` — this replaced
that repo, which is gone.

```
resume.yaml ──typst──► public/resume.pdf   served by Vercel as a static file
                       public/resume.json  JSON Resume
```

## Editing it

Everything you would want to change is in **`resume.yaml`**. Nothing in it is a
point size, and nothing in `resume.typ` is a fact about jass.

```sh
bun run resume                        # build into public/, then gate it
typst watch --font-path fonts resume.typ   # live preview while writing
```

Then look at the PDF and commit it. `public/resume.pdf` and `public/resume.json`
are **committed on purpose** — Vercel serves them as ordinary static files, so
deploying has no resume build step and nothing new that can fail at deploy time.

You cannot forget to rebuild. Typst output is byte-reproducible, so CI rebuilds
from `resume.yaml` and byte-compares against what is committed; a stale PDF fails
the build with the command to fix it. (Verified: identical sha256 from
macOS/arm64 and Alpine/x86_64.)

`typst watch` runs the one-page assertion too, so an overlong bullet turns red
while you are writing it rather than in CI.

## The rules that are not negotiable

`resume.typ` enforces three constraints. Each is a measured failure of the
LaTeX resume this replaced, not a preference — **read [`ATS.md`](ATS.md) before
changing one**, and never fix a red gate by editing the gate.

1. **No letter-spacing on section headings.** Tracked headings extract as
   `E X P E R I E N C E`, and section headings are how an ATS segments a resume.
2. **No icon fonts.** FontAwesome glyphs have no Unicode mapping. The old
   resume shipped a garbled contact line — `§ /jassuwu`, `ï /in/kprnv` — for a
   year, on the one row a parser most wants to read.
3. **Ragged-right, never justified.** A free hedge; the weakest of the three.

The gates use **pdfminer.six, not `pdftotext`**. That inverts the obvious choice
and it matters: poppler silently repairs tracked-out text in every mode, so the
intuitive `pdftotext | grep` gate passes on a document that is broken for every
parser that does not do that reassembly. See `check.py`.

## Typst, and the bet being made

Typst is pre-1.0 and its author has committed to further breaking changes. That
is a real cost for a document that has to stay correct for years, and it is
bounded deliberately:

- The compiler is pinned **exactly** (`0.15.1`, never a range) in `build.sh` and
  in `.github/workflows/ci.yml`. Bump both together. An upgrade surfaces as a
  compile error on ~200 lines we wrote, at a time we chose.
- Content lives in `resume.yaml` under [JSON Resume](https://jsonresume.org)
  field names. **The renderer is the disposable half.** If Typst ever becomes a
  bad bet, that file is unchanged and only `resume.typ` gets rewritten.

## Fonts

Vendored in `fonts/`, all SIL OFL 1.1 — see [`fonts/LICENSES.md`](fonts/LICENSES.md).
Typst takes TTF/OTF only, so the site's `src/fonts/*.woff2` were converted once,
by hand, and committed here. Do not convert in a build step.

**Ioskeley Mono** keeps the site's machine role — section labels, dates, skill
labels. **Excalifont** is vendored but unused: a resume has no margin to annotate.

**Baskervville sets the name and nothing else, and that is the one real departure
from the site.** jass.gg is Baskervville throughout, which it can afford because
`astro.config.mjs` pins body text at 18px — commented there as "where Baskervville
stops looking thin". A resume body is ~10.5pt, well under that, and the first
draft of this file set everything in it and looked washed out and grey for exactly
that reason. It is a display cut being asked to do text work.

So the body is **Source Serif 4**, a text face, cut from its optical-size axis at
`opsz` 10.5 — the design the typeface itself offers for text at this size.
Baskervville stays where it is beautiful: the name, at 26pt.

## Files

```
resume.yaml        the content. the only file you normally edit
resume.typ         the layout. ~200 lines, no template, no imports
fonts/             vendored TTFs + licences
ATS.md             what a machine sees, and why the gates are what they are
build.sh           compile + validate + gate. CI runs exactly this
check.py           the extraction gates
yaml2json.py       resume.yaml -> JSON Resume, and the schema validator
```
