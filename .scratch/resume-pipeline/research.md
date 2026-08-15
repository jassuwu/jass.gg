# Resume pipeline: one source of truth → a well-typeset PDF

Research notes, 2026-08-15. Scope: replacing the hand-written `resume.tex` with a
single source document that CI turns into a PDF (and ideally HTML + JSON).
Site-side plumbing (release asset → deploy hook → build-time fetch) is settled and
not re-litigated here.

**Bottom line:** Typst, driven by a YAML data file, compiled by
`typst-community/setup-typst` in the resume repo. It is the only option that gives
real typographic control, embeds his own OFL fonts, compiles in ~50 ms, and — as of
0.14/0.15 — emits a *tagged* PDF with a real structure tree, which is the single
biggest ATS improvement available over his current pdfTeX output. The strongest
argument against it is in §6.

Everything marked **[measured]** below I ran locally on this machine: Typst 0.15.1
(official darwin-arm64 binary), poppler 26.08.0 `pdftotext`, `pdfminer.six`, `pypdf`,
against both his real `public/resume.pdf` and a YAML-driven Typst resume built with
his actual site fonts. Reproduction steps in the appendix.

---

## 0. Baseline — what his current PDF actually does [measured]

Worth stating first, because it reframes the ATS question. `public/resume.pdf` is
pdfTeX 1.40.27 output from `resume.tex` (which is literally headed
`% ATS-Optimized vibe-coded Resume`).

```
$ pdfinfo public/resume.pdf
Creator: LaTeX with hyperref   Producer: pdfTeX-1.40.27
Tagged:  no                    Pages: 1     File size: 144482 bytes
```

```
$ pdftotext public/resume.pdf -
jass.gg | jass@jass.gg | § /jassuwu |  /jassdotgg | ï /in/kprnv | * India
```

Three defects, all real:

| Defect | Cause | Evidence |
|---|---|---|
| GitHub/X/LinkedIn/location icons extract as `§`, `` (U+F09B), `ï`, `*` | `fontawesome5` ships Type 1 subsets with **`encoding: Custom`** and no usable ToUnicode for the PUA glyphs | `pdffonts` shows `ILUWKE+FontAwesome5Brands-Regular … Custom`; the other 8 fonts are `Builtin` |
| Not tagged | pdfTeX without `tagpdf`; no structure tree at all | `Tagged: no` |
| A stray `•` orphaned onto its own line in one entry | poppler layout reconstruction on the `tabularx` blocks | visible in `pdftotext` default mode, entry 2 |

So the incumbent is *not* a safe baseline that a new toolchain has to beat carefully.
It has a live text-extraction bug in the contact line — the row a parser most wants
to read. Any replacement that drops icon fonts is already ahead.

---

## 1. Typst, as of August 2026

### State of the project

| | |
|---|---|
| Latest release | **0.15.0**, 2026-06-15 ([release](https://github.com/typst/typst/releases/tag/v0.15.0), [blog](https://typst.app/blog/2026/typst-0.15/)); 0.15.1 is the current patch |
| Previous | 0.14.0, 2025-10-24 ([blog](https://typst.app/blog/2025/typst-0.14/)) — ~7 months between minors |
| 1.0 | No date. Laurenz Mädje, ["Evolving Typst"](https://laurmaedje.github.io/posts/evolving-typst/), 2026-01-05: *"I **do** consider Typst ready for production use and yet I think releasing a 1.x version now would be naive."* Remaining planned breakage: custom elements, math precedence, function parameter syntax. Proposed mitigation is a Rust-edition-style `target` compatibility field, kept "for a version or two" |
| Ecosystem | [Typst Universe](https://typst.app/universe/); LWN counted "over 800 packages" in [Sept 2025](https://lwn.net/Articles/1037577/) |

**Production-ready for a one-page resume: yes, with margin to spare.** The 0.x number
is about *language* stability, not output quality. The failure mode of a breaking
change is "CI errors, you fix three lines" — not "your PDF is silently wrong". Pin
the version in CI and it is a non-issue.

### Typography quality vs LaTeX

| Dimension | Verdict | Source |
|---|---|---|
| Line breaking / justification | **Equal.** Typst uses the same Knuth–Plass optimal-fit algorithm as TeX | [LWN 2025-09-17](https://lwn.net/Articles/1037577/) |
| Math | Near-identical; algorithms ported closely from TeX | ibid. |
| Float/table placement | **Typst better** — floats and page-splitting tables handled more cleanly | ibid. |
| Widows/orphans | **LaTeX better.** Typst "is not as good as LaTeX at avoiding widows and orphans" | ibid. |
| **Microtypography** | **LaTeX wins, clearly.** Typst has only a very limited protrusion; **font expansion (`microtype`'s hz) is entirely absent** | [typst#4693](https://github.com/typst/typst/issues/4693), [typst#6161](https://github.com/typst/typst/pull/6161) |
| OpenType control | Good: `ligatures`, `alternates` (`salt`), `number-type` (`lnum`/`onum`), and raw `features` dict for arbitrary tags | [text docs](https://typst.app/docs/reference/text/text/) |
| Variable fonts | **New in 0.15** — `wght`/`wdth`/`slnt`/`ital`/`opsz` auto-wired; `typst fonts --variants` lists axes | [0.15 release](https://github.com/typst/typst/releases/tag/v0.15.0) |

The microtype gap is the real typographic loss and it is worth being honest about it —
but on a one-page **ragged-right** resume it is inert. Protrusion and expansion only
buy you anything in justified multi-line prose. See §4: ragged-right is also the
ATS-safer setting, so the two considerations point the same way.

### Custom font embedding [measured]

Typst loads fonts from `--font-path` / `TYPST_FONT_PATHS`, priority `--font-path` >
system > embedded defaults ([docs](https://typst.app/docs/reference/text/text/)).

**Formats: `.ttf`, `.otf`, `.ttc`/`.otc` only. WOFF2 is not supported.** This matters
concretely — the repo ships `src/fonts/*.woff2`, so a conversion step is required.
It is trivial and dependency-light:

```python
from fontTools.ttLib import TTFont       # fontTools + brotli
f = TTFont("IoskeleyMono-Regular.woff2"); f.flavor = None
f.save("IoskeleyMono-Regular.ttf")
```

I ran exactly that on his three families and compiled a resume with them. All three
embed correctly:

```
$ pdffonts resume.pdf
UFIPGV+Excalifont-Regular      CID TrueType  Identity-H  emb yes  sub yes  uni yes
YKDQUT+Baskervville-Regular    CID TrueType  Identity-H  emb yes  sub yes  uni yes
FTOZJB+Ioskeley-Mono           CID TrueType  Identity-H  emb yes  sub yes  uni yes
RQMPLY+Ioskeley-Mono-Bold      CID TrueType  Identity-H  emb yes  sub yes  uni yes
IXGKWT+Baskervville-Italic     CID TrueType  Identity-H  emb yes  sub yes  uni yes
```

`Identity-H` + `uni yes` on every font, subsetted, **40 KB total PDF** (vs 144 KB for
the pdfTeX one). Text extracts cleanly — no `§`/`ï` garbage. The three-role system
(Baskervville prose / Ioskeley facts / Excalifont wordmark) transfers to the resume
one-for-one.

Licensing: all three are OFL. Embedding in a PDF is explicitly permitted and does not
infect the document's own licence ([OFL FAQ](https://openfontlicense.org/ofl-faq/)).
Ioskeley Mono ships TTF releases directly ([ahatem/IoskeleyMono](https://github.com/ahatem/IoskeleyMono)),
so for the mono role he can skip conversion and vendor the upstream TTF.

### Compile speed [measured]

```
$ time typst compile --font-path fonts resume.typ resume.pdf
real 0.05   0.07   0.05      (three consecutive runs)
```

**~50–70 ms** for the full one-page resume with five subsetted font faces. For
comparison, a pdfTeX run of a comparable resume is ~1–2 s, and a TeX Live install in
CI is 1–5 minutes. This is the difference between a workflow that takes ~20 s
end-to-end and one that takes several minutes.

### GitHub Actions story

**[`typst-community/setup-typst@v5`](https://github.com/typst-community/setup-typst)** —
community-maintained, not official-from-Typst-GmbH, but it is *the* action (listed on
the [Marketplace](https://github.com/marketplace/actions/setup-typst)). Downloads the
release binary from `typst/typst`, adds it to PATH, caches `@preview` packages.
Inputs: `typst-version` (SemVer range), `cache-dependency-path`, `token`,
`allow-prereleases`, `typst-versions-map`. No container needed; it is a binary download,
so setup is a few seconds. Alternative if he wants zero third-party actions: a
three-line `curl | tar` of the GitHub release asset (exactly what I did here).

### Known gaps vs LaTeX

| Gap | Bites a one-page resume? |
|---|---|
| No font expansion, minimal protrusion | No (ragged-right) |
| Weaker widow/orphan control | No (one page) |
| No `parshape` equivalent | No |
| Cannot include existing PDFs | No |
| ~800 packages vs CTAN's decades | No — a resume needs zero packages |
| Docs "confusingly organized" ([LWN](https://lwn.net/Articles/1037577/)) | Mildly |
| Pre-1.0 breaking changes | Only if unpinned |
| **HTML export experimental** | **Yes** — see §3 |

### CV/resume template ecosystem

Mature enough to read for ideas, not mature enough to adopt. All of these are
"template sites in package form" — the exact thing he said he doesn't want.

| Package | Note |
|---|---|
| [`basic-resume`](https://typst.app/universe/package/basic-resume/) | v0.2.9 (2025-09-29). Explicitly *"designed to work well with ATS"*. The closest thing to a reference for the ATS-safe structural choices |
| [`modern-cv`](https://typst.app/universe/package/modern-cv/) | Port of Awesome-CV. **Requires FontAwesome** — reintroduces exactly the icon-encoding bug in his current PDF |
| [`moderner-cv`](https://typst.app/universe/package/moderner-cv/) | moderncv adaptation. Also FontAwesome |
| [`chicv`](https://typst.app/universe/package/chicv/) | Minimal, fully customisable |
| [`modern-resume`](https://typst.app/universe/package/modern-resume/) | Clean/concise, a touch of colour |

Recommendation: **read `basic-resume`'s source, import nothing.** A resume layout in
Typst is ~80 lines. My working prototype (header, two sections with right-aligned
dates, bulleted lists, skills block) is 60 lines including the YAML plumbing.
Depending on a template package buys nothing and imports someone else's typography.

---

## 2. Data-driven authoring — content separate from layout

| Approach | Typographic control | Machinery | How it fails |
|---|---|---|---|
| **Typst + `yaml()`/`json()`** | **Total** — you write the layout yourself in Typst | One binary. Zero runtime deps | Layout bugs are your own. Pre-1.0 syntax churn on upgrade |
| **RenderCV** (YAML → generated Typst → PDF) | **Theme-bounded.** 5 built-in themes; custom themes mean writing Typst anyway, through Python/Jinja | Python package + Typst + Pydantic schema | You end up fighting a generator to express a design it wasn't built for. The escape hatch *is* raw Typst — so you took on a dependency to end up where you started |
| **Pandoc MD/YAML → Typst** | Moderate. Typst is a first-class pandoc writer (`-t typst`, `--pdf-engine=typst`, `--typst-input` → `sys.inputs`) | pandoc + Typst | Pandoc's AST is document-shaped, not résumé-shaped. Entries with role/org/dates/place have no natural Pandoc representation; you end up encoding structure in YAML metadata and doing the real work in the Typst template — i.e. option 1 with pandoc bolted on |
| **Pandoc MD → LaTeX** | High, if you write the LaTeX template | pandoc + full TeX Live in CI (~1–5 min, GBs) | Same AST-shape problem, plus the TeX install and pdfTeX's ToUnicode landmines |
| **JSON Resume + renderer** | **Low.** You pick a theme; themes are HTML/CSS printed to PDF | `resume-cli` + a theme + usually headless Chrome | Governance is shaky: `resume-schema` and `resume-cli` were both **archived in 2026** and folded into [`jsonresume/jsonresume.org`](https://github.com/jsonresume/jsonresume.org); the repo itself says the CLI *"is not actively maintained"* and the monorepo is *"maintained with the help of AI agents"*. Print-to-PDF also gives you browser typography (no Knuth–Plass, no real hyphenation) |
| **Quarto → Typst** | Moderate–high via `typst-template.typ` + `typst-show.typ` partials ([docs](https://quarto.org/docs/output-formats/typst-custom.html)) | Quarto + pandoc + Typst | Heavy for a one-page document. Quarto earns its keep on computational reports, not resumes |
| **HTML/CSS → Chrome print** | Deceptive. Full CSS control, but no optimal line breaking, weak hyphenation, and font rendering differs by Chrome version | Headless Chrome in CI | Non-reproducible across Chrome versions; the worst determinism story of the lot |

**The `resume.json` schema is still worth stealing even if you don't use its tooling.**
Adopt the field names from [jsonresume.org/schema](https://jsonresume.org/schema) for
his own YAML — that's free interoperability with the whole ecosystem of parsers and
importers, with no dependency.

Typst's data loading is first-class: `json()`, `yaml()`, `toml()`, `csv()`, `xml()`,
`cbor()`, `read()` ([docs](https://typst.app/docs/reference/data-loading/)). One line:

```typst
#let cv = yaml("resume.yaml")
```

---

## 3. One source → PDF + HTML + JSON

**JSON is free.** If the source of truth is `resume.yaml`, then `resume.json` is a
two-line conversion in CI, published alongside the PDF as a release asset. Or make
JSON the source and skip the step. Either way this output costs nothing.

**HTML is the interesting one, and the answer is *not* Typst's HTML export.**

Typst's own docs, current as of 0.15:

> "Typst's HTML export is currently under active development. The feature is still
> very incomplete and only available for experimentation behind a feature flag.
> **Do not use this feature for production use cases.**"
> — [typst.app/docs/reference/html](https://typst.app/docs/reference/html/)

0.15 moved it forward (MathML for equations; experimental multi-file "bundle" export;
minified output; `lang` on `<html>`) but it is still `--features html`, emits **no CSS**,
and produces standalone documents rather than fragments. Even if it were stable, it
would be the wrong tool: he already has an opinionated Astro design system, and Typst
HTML would fight it.

**The right shape — fan out from data, not from the document:**

```
resume.yaml  ──┬──> resume.typ  ──> typst compile ──> resume.pdf   (release asset)
               ├──> resume.json                     (release asset, JSON Resume shape)
               └──> jass.gg /resume.astro           (Astro reads the same YAML/JSON)
```

The site already builds statically and can fetch data at build time
([Astro data fetching](https://docs.astro.build/en/guides/data-fetching/), or a custom
[content loader](https://docs.astro.build/en/reference/content-loader-reference/)).
`/resume` renders from the JSON with the site's existing type scale, colour tokens
and three font roles — genuinely *his* HTML, not a converter's. This also means the
`/resume` page and the PDF can legitimately differ where the medium demands it
(the PDF is one page; the page needn't be).

| Approach | PDF | HTML | JSON | Verdict |
|---|---|---|---|---|
| **Typst + YAML, Astro renders HTML** | native, excellent | native to the site | trivial | **Natural.** Each output produced by the tool that's best at it |
| Typst HTML export | excellent | experimental, no CSS | via `typst query` | Painful today; revisit post-1.0 |
| Pandoc | via Typst/LaTeX | decent generic HTML | `-t json` (Pandoc AST, not resume-shaped) | Middling at all three |
| JSON Resume themes | print-to-PDF | good | native | Good HTML+JSON, weak PDF |

Also worth knowing: `typst query` can pull labelled `metadata` elements out of a
compiled document as JSON ([docs](https://typst.app/docs/reference/introspection/query/)) —
useful if the *document* ever becomes the source of truth, but with YAML upstream you
never need it.

---

## 4. ATS parseability — measured, not folklore

### How ATS actually reads a PDF

The mechanism that matters is **PDF content-stream order**, not visual position.
Apache PDFBox's `PDFTextStripper` — the extractor under a large share of JVM-based
enterprise HR tooling — documents its default plainly: *"By default, text extraction
is done in the same sequence as the text in the PDF page content stream… The default
is to not sort by position"*, for performance reasons
([javadoc](https://pdfbox.apache.org/docs/2.0.12/javadocs/org/apache/pdfbox/text/PDFTextStripper.html)).
Position sorting is opt-in via `setSortByPosition(true)`.

This cuts both ways, and it is the crux of the whole question:

- If content-stream order is correct, a **naive** extractor is correct for free.
- **Position-sorting** extractors run column-detection heuristics that can *introduce*
  errors a naive reader wouldn't make.

I measured exactly this. [measured]

### Finding A — Typst's content-stream order is clean

`pdftotext -raw` (content-stream order, no reconstruction) on my YAML-driven Typst
resume:

```
EXPERIENCE
Software Developer Oct 2025 - Present
Cypher (Backed by YCombinator W22) Chennai, India
– Developing and maintaining a full-stack payment card platform using React, ...
```

Perfect. Same for the `grid()` layout *and* the `#h(1fr)` layout — Typst emits
right-aligned dates in the same order they appear in the source.

### Finding B — position-sorting extractors *do* break on right-aligned dates

Default `pdftotext` (which reconstructs layout) on the same file moved the project
year `2024` from its correct position to **the last line of the document**. Likewise
`pdfminer.six` grouped columns rather than rows:

```
Software Developer
Cypher (Backed by YCombinator W22)      ← both left-column cells, then…
Oct 2025 - Present
Chennai, India                          ← …both right-column cells
```

**This happens with `#h(1fr)` too, not just `grid()`.** The trigger is the *wide
horizontal gap*, not the layout primitive. A parser that reads
`Software Developer / Cypher / Oct 2025 – Present / Chennai` still gets everything —
it's degraded, not lost — but the role↔date association is weakened. Note his current
pdfTeX resume has the identical characteristic; this is not a Typst regression.

*Mitigation if he wants to be maximally safe:* put the date inline on the same line as
the role (`Software Developer — Cypher · Oct 2025–Present`) rather than flushed right.
That is a genuine typographic sacrifice. My read: right-aligned dates are the single
strongest convention in resume typography and the failure is graceful, so keep them —
but know the cost, and never put a *section* in a side column.

### Finding C — letter-spacing destroys section headings. This is the big one.

I set section headings in the site's house style: mono, small, uppercase,
`tracking: 0.12em`. Two independent extractors:

```
pdfminer.six → ['E X P E R I E N C E', 'P R O J E C T S', 'S K I L L S']
pypdf        → ['E X P E R I E N C E', 'P R O J E C T S']
```

Remove `tracking` and both recover exactly:

```
pdfminer.six → ['EXPERIENCE', 'PROJECTS', 'SKILLS']
```

Section headings are precisely what a parser uses to segment a resume. Tracked-out
headings mean the parser sees no `EXPERIENCE` section at all. **This is engine-agnostic**
— letter-spacing is implemented as per-glyph positioning in any typesetting system, so
LaTeX `soul`/`microtype` tracking would do the same. It is a *design* constraint, not a
Typst one, and it directly conflicts with the site's micro-label aesthetic.

*Mitigation:* get the "small mono label" feel from size, weight, case and colour —
not tracking. Or apply tracking only to the wordmark, which no parser needs to read.

### Finding D — a `pdftotext -raw` artifact worth *not* panicking about

Under `justify: true`, poppler's `-raw` mode collapsed word spaces on tightly-set
lines: `DevelopedProgressiveWebApplicationsachieving…`. A synthetic 52-line justified
paragraph reproduced it on **4% of lines**; the same text ragged-right: **0%**.

But `pdfminer.six` and `pypdf` extracted **0 lost-space lines from the same PDFs**.
So the spaces *are* in the PDF — this is a poppler `-raw` heuristic, not a Typst
defect. **Flagging this explicitly because it would be easy to over-conclude from a
single extractor.** Still, it is a free hedge: ragged-right avoids the artifact
entirely, and (per §1) costs nothing typographically once microtype is off the table.

Related open Typst issues worth tracking, none of which touch Latin resume text:
[#3416](https://github.com/typst/typst/issues/3416) and
[#4582](https://github.com/typst/typst/issues/4582) (ToUnicode when one glyph maps
from multiple codepoints — CJK), [#4225](https://github.com/typst/typst/issues/4225)
(complex shaping, e.g. Devanagari), [#1267](https://github.com/typst/typst/issues/1267)
(hyphenated words copy with the hyphen). 0.14 fixed multi-codepoint→same-glyph
extraction and line-break space retention
([changelog](https://typst.app/docs/changelog/0.14.0/)).

### Finding E — tagged PDF, and why it's the real win

```
$ pdfinfo resume.pdf   →  Tagged: yes
StructTreeRoot: True   MarkInfo: {'/Marked': True}   Lang: en
/Document
  /P /P /P
  /H1 → /P
  /Em /Span
  /L → /LI → /Lbl + /LBody
  /H1 → /P
  ...
```

Typst 0.14+ tags automatically from semantic markup — *"If you are using the built-in
markup and elements, Typst will automatically select the right tags"*
([0.14 blog](https://typst.app/blog/2025/typst-0.14/)). Headings become `/H1`, bullets
become a proper `/L`→`/LI`→`/Lbl`+`/LBody` list, emphasis becomes `/Em`. The structure
tree carries **an explicit, unambiguous reading order** that is immune to the
column-heuristic problem in Finding B.

`--pdf-standard ua-1,a-2a` compiled **clean, zero warnings** [measured] — PDF/UA-1
runs additional accessibility checks (missing title, heading hierarchy, missing alt
text) and `a-2a` requires a valid tagged PDF, so a clean pass is a real assertion
about document structure, cheap to run in CI
([PDF standards docs](https://typst.app/docs/reference/pdf/), 0.15 added targeting
multiple compatible standards at once).

**Honest caveat, flagged:** I could not verify that any *specific* commercial ATS
(Workday, Greenhouse, Lever, Taleo) reads the structure tree. Legacy PDFBox/pdfminer
pipelines ignore it. But every modern layout-aware parser can use it, the direction of
travel is toward layout-aware extraction (see
[arXiv 2510.09722](https://arxiv.org/abs/2510.09722), Oct 2025, deployed in Alibaba's
HR platform — fine-tuned layout parser normalising heterogeneous resume layouts), and
it costs nothing. Also note tagging is the *legal* direction: European Accessibility
Act and ADA Title II deadlines are why Typst built it.

### ATS scorecard

| Hazard | Verdict | Evidence |
|---|---|---|
| Icon fonts (FontAwesome etc.) | **Fatal — and live in his current PDF today** | `encoding: Custom`; extracts as `§ ï *` |
| Letter-spacing on headings | **Fatal, engine-agnostic** | Finding C, two extractors |
| True multi-column (sidebar) layout | **Avoid** | industry-standard failure; not tested here |
| Right-aligned dates via `grid`/`h(1fr)` | **Degraded, acceptable** | Finding B |
| Tables used for layout | Same class as above; avoid nested/merged cells | — |
| Justified text | Cosmetic risk in one extractor only | Finding D |
| Standard `liga`/`clig` ligatures | **Fine** in Typst | CID Identity-H + ToUnicode; `uni yes` on all faces |
| Text as paths / outlines | Fatal, but Typst never does this for text | — |
| Custom OFL fonts | **Fine** | Finding, §1 |
| Untagged PDF | Missed opportunity | his current PDF |

---

## 5. CI mechanics — top 2 candidates

### 5a. Typst + YAML (recommended)

```yaml
# .github/workflows/resume.yml  (in jassuwu/resume.tex → rename the repo)
name: resume
on:
  push: { branches: [main] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: typst-community/setup-typst@v5
        with:
          typst-version: 0.15.1        # exact pin, not a range — see §6

      # fonts live in the repo as .ttf under fonts/ ; committed, ~1-2 MB
      - run: |
          typst compile \
            --font-path fonts \
            --pdf-standard ua-1,a-2a \
            --creation-timestamp 0 \
            resume.typ resume.pdf

      - run: python3 tools/yaml2json.py resume.yaml > resume.json

      - uses: softprops/action-gh-release@v2
        with: { tag_name: latest, files: "resume.pdf\nresume.json" }

      - run: curl -fsS -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}"
```

| Concern | Answer |
|---|---|
| **Build time** | ~5 s action setup + **~50 ms** compile [measured]. Whole workflow well under 30 s |
| **Fonts** | Commit `.ttf` files to the resume repo under `fonts/`, point `--font-path` at it. No system font install, no [Fontist](https://github.com/fontist/setup-fontist), no container. Convert the site's `.woff2` **once**, by hand, and commit the result — do not convert in CI |
| **Determinism** | `--creation-timestamp` / `SOURCE_DATE_EPOCH` pins the timestamp ([typst#3806](https://github.com/typst/typst/issues/3806)). With a pinned compiler version and vendored fonts, byte-identical output. Verify with a `sha256sum` step if he wants the guarantee |
| **One-page invariant** | **Best mechanic of any option — no extra tooling at all.** Put the assertion *in the document*: |

```typst
#context {
  let n = counter(page).final().first()
  assert(n == 1, message: "resume must be exactly one page, got " + str(n))
}
```

Verified [measured]: passes at 1 page; at 2 pages `typst compile` prints
`error: assertion failed: resume must be exactly one page, got 2` and **exits 1**.
It also fires in local preview, so he finds out while editing rather than in CI.
(Belt-and-braces alternative: `pdfinfo resume.pdf | grep -q '^Pages: *1$'`.)

Extra gate worth adding — assert the *text* survives, not just the layout:

```bash
pdftotext resume.pdf - | grep -q 'EXPERIENCE'   # catches a tracking regression
pdftotext resume.pdf - | grep -q 'jass@jass.gg' # catches an icon-font regression
```

That's a two-line regression test for the exact two failure modes in §4.

### 5b. RenderCV (the safe fallback)

[RenderCV](https://docs.rendercv.com/) — YAML → Typst → PDF, ~17k stars, actively
developed (blog posts from June 2026), Pydantic-validated schema, HTML and Markdown
output alongside PDF. `pip install rendercv && rendercv render CV.yaml`.

| Concern | Answer |
|---|---|
| Build time | Python install (~20–30 s cached) + Typst compile. ~1 min |
| Fonts | Theme-level config; custom fonts go through the theme, which means writing Typst |
| Determinism | Pin `rendercv==x.y.z`; it pins its own Typst |
| One-page check | No built-in gate found — flagged as unverified. Would need `pdfinfo` post-hoc |

Real appeal: schema validation and multi-format output out of the box. Real cost: the
typography is the theme's, and customising it means writing Typst *through* a Python
templating layer instead of directly. **For someone who cares this much about
typography, that's a worse deal than writing 80 lines of Typst.**

### 5c. Not recommended: pandoc → LaTeX

TeX Live in CI is 1–5 min and multiple GB even with
[`xu-cheng/latex-action`](https://github.com/xu-cheng/latex-action). You inherit
pdfTeX's ToUnicode fragility (needs `\usepackage{cmap}` + `[T1]{fontenc}`, and even
then only for directly-encoded fonts — [TeX FAQ](https://texfaq.org/FAQ-cpy-srchpdf),
[latex2e#465](https://github.com/latex3/latex2e/issues/465)), no tagging without
`tagpdf`, and custom OTF fonts require switching to LuaLaTeX/XeLaTeX. Pandoc's AST
doesn't model resume entries anyway. Strictly worse on every axis he named.

---

## 6. Recommendation

**Typst 0.15.x, `resume.yaml` as the single source of truth, ~80 lines of hand-written
`resume.typ`, no template package, fonts vendored as TTF, compiled by
`setup-typst@v5`, with the one-page assertion inside the document.**
`/resume` on jass.gg renders from the same YAML through Astro.

Why it wins on his stated criteria:

- **"Really good font"** — his three OFL faces embed cleanly and extract cleanly; the
  three-role system carries over intact. LaTeX would need LuaLaTeX+fontspec to match this.
- **"Really good formatting"** — same Knuth–Plass line breaker as TeX, and he writes
  the layout himself rather than accepting a template's.
- **Not a template site** — the recommendation is explicitly *don't import a template*.
- **ATS** — the tagged structure tree is a strict improvement over his current
  untagged pdfTeX output, and dropping FontAwesome fixes a live extraction bug.
- **CI** — 50 ms compile, single binary, no TeX Live, one-page invariant enforced by
  the document itself.

### The strongest argument against it, stated honestly

**He would be moving a document he needs to be *correct for years* onto a pre-1.0
language whose author has publicly committed to further breaking changes.**
["Evolving Typst"](https://laurmaedje.github.io/posts/evolving-typst/) names custom
elements, math precedence, and *function parameter syntax* as still-planned breakage —
the last of which would touch every `#let` in his file. The proposed edition-style
compatibility mechanism is a proposal, not a shipped feature, and Laurenz says he'd
keep a compatibility target only "for a version or two". LaTeX documents from 1995
still compile; there is no equivalent promise here, and 0.14→0.15 already took seven
months and shipped breaking changes.

The counter is real but not free: pinning the compiler exactly (`0.15.1`, not `^0.15`)
makes the build reproducible **forever** — the release binary stays on GitHub, and
Typst has no runtime deps to rot. He then upgrades when he chooses, and the cost of an
upgrade is a compile error on a 80-line file he wrote himself, not silent wrongness.
That is a genuinely bounded risk. But it is a real, recurring maintenance tax that
LaTeX would not charge him, and pretending otherwise would be dishonest.

**Secondary argument against:** the microtype gap. If he ever wants justified prose
set to a genuinely high standard, LuaLaTeX with `microtype` still produces visibly
better grey than Typst. On a ragged-right one-page resume this is moot — but it means
"Typst instead of LaTeX" is not a decision he should generalise to every document.

**Third:** every deploy now depends on `typst-community/setup-typst`, a
community-maintained action, and `softprops/action-gh-release`. Both are avoidable
with ~5 lines of `curl` + `gh release upload` if he'd rather own the whole chain.

### Migration order

1. Convert the three `.woff2` → `.ttf` once, commit under `fonts/`. Prefer upstream
   TTFs where they exist (Ioskeley ships them).
2. Transcribe `resume.tex` content into `resume.yaml` using JSON Resume field names.
3. Write `resume.typ` by hand. Read `basic-resume`'s source first; import nothing.
   **No letter-spacing on section headings. No icon fonts. Ragged-right.**
4. Add the in-document one-page assertion + the two `pdftotext | grep` gates.
5. Wire the workflow; keep the committed `public/resume.pdf` as the build-time fallback
   that's already designed.
6. Rename the repo (`resume.tex` is now a lie) — this breaks nothing but the deploy
   hook lives on the repo, so do it before wiring CI.

---

## Appendix — reproducing the measurements

```bash
# Typst
curl -sL -o typst.tar.xz \
  https://github.com/typst/typst/releases/latest/download/typst-aarch64-apple-darwin.tar.xz
tar xf typst.tar.xz            # → typst-aarch64-apple-darwin/typst   (0.15.1)

# fonts: woff2 → ttf
python3 -c "
from fontTools.ttLib import TTFont
f=TTFont('src/fonts/IoskeleyMono-Regular.woff2'); f.flavor=None
f.save('fonts/IoskeleyMono-Regular.ttf')"

# extraction, three ways
pdftotext file.pdf -        # poppler, layout-reconstructing  (position heuristics)
pdftotext -raw file.pdf -   # poppler, content-stream order   (what PDFBox does by default)
python -c "from pdfminer.high_level import extract_text; print(extract_text('file.pdf'))"

# structure / standards
pdfinfo file.pdf | grep Tagged
pdffonts file.pdf
typst compile --pdf-standard ua-1,a-2a resume.typ /dev/null
```

Working prototype (YAML + Typst, grid / `h(1fr)` / no-tracking / justified variants)
is in `/tmp/typexp/` on this machine — **ephemeral, not committed.**

## Verified vs unverified

| Claim | Status |
|---|---|
| Typst 0.15.1 compiles YAML-driven resume w/ his fonts in ~50 ms | **verified locally** |
| Custom OFL fonts embed as CID/Identity-H with working ToUnicode | **verified locally** |
| Typst emits tagged PDF w/ `/Document /H1 /L /LI /Lbl /LBody` | **verified locally** |
| `--pdf-standard ua-1,a-2a` passes clean | **verified locally** |
| In-document one-page assert fails the build with exit 1 | **verified locally** |
| Letter-spacing breaks heading extraction (2 extractors) | **verified locally** |
| Right-aligned dates get column-grouped by position-sorting extractors | **verified locally** |
| His current PDF has broken FontAwesome text extraction + is untagged | **verified locally** |
| Justified-text space loss is a poppler `-raw` artifact only | **verified locally** (3 extractors) |
| Typst uses Knuth–Plass; weaker widows/orphans than LaTeX | LWN, secondary |
| Typst has no font expansion | typst#4693, secondary but authoritative |
| Commercial ATS vendors read PDF structure trees | **NOT VERIFIED** — could not find primary evidence either way |
| RenderCV has no built-in page-count gate | **NOT VERIFIED** — did not read the full CLI reference |
| pdfTeX resume build time ~1–2 s | **NOT MEASURED** — no TeX on this machine; from general knowledge |
