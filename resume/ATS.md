# What a machine sees

`resume.typ` and `tools/check.py` both point here. This is the reasoning behind
the constraints they enforce, so that someone who finds one of them inconvenient
can read why it exists before deciding to remove it.

Everything below was measured on real PDFs, not inferred. Where something is
unverified it says so.

## How an ATS actually reads a PDF

The thing that matters is **PDF content-stream order**, not visual position.
Apache PDFBox's `PDFTextStripper` — the extractor under a large share of
JVM-based enterprise HR tooling — documents its default plainly: text extraction
happens _"in the same sequence as the text in the PDF page content stream… The
default is to not sort by position"_, for performance. Position sorting is
opt-in.

This cuts both ways:

- If content-stream order is correct, a **naive** extractor is correct for free.
- **Position-sorting** extractors run column-detection heuristics that can
  _introduce_ errors a naive reader would not make.

Typst emits clean content-stream order — role and date come out on one line, in
source order, under `pdftotext -raw`.

## The two bugs the gates exist to catch

### 1. Icon fonts extract as garbage

This was live in the resume this replaces, for a year, on the single row a parser
most wants to read. The FontAwesome glyphs in the contact line are `Custom`-encoded
with no Unicode mapping:

```
jass.gg | jass@jass.gg | § /jassuwu | \x8a /jassdotgg | ï /in/kprnv | * India
```

The email survived; every profile link did not. **Use the words.** There is no
icon font in this document and there must not be one.

### 2. Letter-spacing destroys section headings

The big one. Set the headings in the site's micro-label style — mono, small,
uppercase, `tracking: 0.12em` — and they extract as:

```
'E X P E R I E N C E'   'P R O J E C T S'   'S K I L L S'   'E D U C A T I O N'
```

Section headings are precisely what a parser uses to segment a resume. Tracked-out
headings mean it finds no experience section at all.

**This is engine-agnostic.** Letter-spacing is per-glyph positioning in any
typesetting system; LaTeX `soul`/`microtype` tracking does the same thing. It is a
design constraint, not a Typst quirk.

The mitigation is not to give up the label feel — it is to get it from **face,
size, weight and case** instead of from glyph positioning. Four signals, none of
which touch the content stream. That is what `section()` in `resume.typ` does.

Worth knowing: jass.gg itself has no `letter-spacing` anywhere in `src/`. So this
conflicts with an aesthetic you might reach for, not one the site currently ships.

## Why the gate uses pdfminer.six and not pdftotext

**This inverts the obvious choice, and it is the reason `tools/check.py` exists
as Python rather than two lines of `grep`.**

Measured, on a build with `tracking: 0.12em` deliberately added to the headings:

| Extractor             | Sees `EXPERIENCE`     | Catches the bug? |
| --------------------- | --------------------- | ---------------- |
| `pdftotext` (default) | `EXPERIENCE`          | **no**           |
| `pdftotext -raw`      | `EXPERIENCE`          | **no**           |
| `pdftotext -layout`   | `EXPERIENCE`          | **no**           |
| `pdfminer.six`        | `E X P E R I E N C E` | yes              |
| `pypdf`               | `E X P E R I E N C E` | yes              |

Poppler runs a word-reassembly heuristic that silently repairs tracked-out text.
So the intuitive gate — `pdftotext resume.pdf - | grep -q EXPERIENCE` — passes on
a document that is broken for every parser that does not do that reassembly. It
is a gate that cannot fail.

If you ever swap the extraction library, re-run the check in
`tools/check.py`'s docstring first: add tracking, confirm the gate goes red, then
remove it. An extraction gate that has never been seen to fail is decoration.

## What is accepted, knowingly

### Right-aligned dates degrade under position-sorting extractors

Default `pdftotext` and `pdfminer.six` both group by column rather than row on a
wide horizontal gap:

```
Software Developer
Cypher (Backed by YCombinator W22)      ← both left cells, then…
Oct 2025 – Present
Chennai, India                          ← …both right cells
```

The trigger is the wide gap, not the layout primitive — `#h(1fr)` does it too, and
the previous pdfTeX resume had the identical characteristic. Nothing is lost; the
role↔date association is weakened.

This is accepted because right-aligned dates are the strongest convention in
resume typography and the failure is graceful. Two things follow from accepting
it, and both are load-bearing:

- The **contact line is not a two-column row.** It is stacked under the name,
  left-aligned, with no wide gap anywhere — because that is the one line where a
  degraded read is expensive.
- **Never put a section in a side column.** A true multi-column resume fails this
  way structurally rather than gracefully.

### Justified text — a hedge, not a rule

Under `justify: true`, poppler's `-raw` mode collapsed word spaces on ~4% of lines
of a synthetic justified paragraph; ragged-right measured 0%. But pdfminer.six and
pypdf found **zero** lost spaces in the same PDFs — so the spaces genuinely are in
the file and this is a poppler heuristic, not a defect.

Flagged explicitly because it would be easy to over-conclude from one extractor.
Ragged-right sidesteps it for free and costs nothing typographically here, so the
document is ragged-right. This is the weakest of the three rules.

## Tagging

Typst 0.14+ emits a tagged PDF automatically from semantic markup: headings become
`/H1`, bullets become a real `/L` → `/LI` → `/Lbl` + `/LBody` list. The structure
tree carries an explicit, unambiguous reading order — which is immune to the
column-heuristic problem above.

`--pdf-standard ua-1,a-2a` compiles clean. PDF/UA-1 adds accessibility checks
(document title, heading hierarchy) and `a-2a` requires valid tagging, so a clean
pass is a real assertion about structure rather than a badge.

**Honest caveat:** it is _not_ verified that any specific commercial ATS (Workday,
Greenhouse, Lever, Taleo) reads the structure tree. Legacy PDFBox and pdfminer
pipelines ignore it. Treat tagging as correctness and accessibility — both of
which stand on their own — not as a proven ranking win.

## The scorecard

| Hazard                             | Verdict                                        |
| ---------------------------------- | ---------------------------------------------- |
| Icon fonts                         | **Fatal.** Was live in the old resume          |
| Letter-spacing on headings         | **Fatal, engine-agnostic**                     |
| True multi-column / sidebar layout | **Avoid.** Fails structurally                  |
| Right-aligned dates                | Degraded, accepted                             |
| Tables for layout                  | Same class; avoid nested or merged cells       |
| Justified text                     | Cosmetic risk, one extractor only              |
| Standard ligatures                 | Fine — Identity-H + ToUnicode on every face    |
| Custom OFL fonts                   | Fine, subsetted and embedded                   |
| Text as outlines                   | Fatal, but Typst never does this for text      |
| Untagged PDF                       | Missed opportunity; was true of the old resume |
