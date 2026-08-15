// The layout. All content lives in resume.yaml — nothing here knows a fact
// about jass, and nothing there knows a point size.
//
// THREE RULES THIS FILE MUST KEEP. Each one is a measured ATS failure, not a
// preference; see ATS.md before you break one.
//
//   1. NO letter-spacing on section headings. Tracked-out headings extract as
//      'E X P E R I E N C E' and the parser then finds no experience section at
//      all. The small-label feel comes from face, size, weight and case.
//   2. NO icon fonts. FontAwesome glyphs are Custom-encoded with no Unicode
//      mapping and extract as garbage. The old resume.tex shipped this bug in
//      its contact line for a year. Use the words.
//   3. Ragged-right, never justified. A free hedge against a poppler
//      space-collapsing artifact, and it costs nothing here.
//
// Fonts are the site's roles (../src/styles/global.css) with one deliberate
// departure, explained where it happens:
//   display — Baskervville. The name, at 26pt, and nothing else.
//   paper   — Source Serif 4 at opsz 10.5. Prose: bullets, company names.
//   machine — Ioskeley Mono. Facts: headings, dates, skill labels.
//   hand    — Excalifont. Vendored, unused.

#let cv = yaml("resume.yaml")

// ── tokens ───────────────────────────────────────────────────────────────
// Lifted from the site's palette so the two documents are visibly the same
// object. oklch values are copied verbatim from global.css.

#let ink = oklch(14.5%, 0, 0deg) // --color-foreground
#let quiet = oklch(48%, 0, 0deg) // --color-muted-foreground, darkened for print
#let mark = oklch(93.92%, 0.1588, 124.39deg) // --color-accent-mark

// TWO SERIFS, AND THE REASON IS SIZE.
//
// jass.gg sets everything in Baskervville, and astro.config.mjs says why it can:
// `--text-body: 1.125rem; /* 18px — where Baskervville stops looking thin */`.
// A resume body is ~10.5pt, well under that. Baskervville is a display cut —
// small x-height, fine hairlines — and at body size it goes grey and washes out.
// The first draft of this file used it throughout and looked exactly that bad.
//
// So each face is used where it works. Baskervville sets the name at 26pt, which
// is where it is beautiful and where the site's voice actually lives. The body is
// Source Serif 4, a text face, cut at `opsz` 10.5 from its optical-size axis —
// literally the design the typeface offers for text at this size.
#let paper = "Source Serif Text"
#let display = "Baskervville"
#let machine = "Ioskeley Mono"

// The `hand` role (Excalifont) is vendored but deliberately unused. On the site
// it signs the wordmark; a resume has no margin to annotate and no place for a
// signature that isn't the name itself.
//
// Semibold rather than bold: Source Serif's 700 shouts on a page this dense, and
// a resume wants titles that lead the eye, not ones that stop it. The face is cut
// at wght 600 and declared 700 so `weight: "bold"` resolves to it exactly.
#let entry-title(body) = text(size: 11pt, weight: "bold")[#body]

// ── dates ────────────────────────────────────────────────────────────────
// resume.yaml stores ISO `YYYY-MM`; display formatting lives here so the data
// stays machine-readable. A bare year (projects) passes through as-is, and YAML
// hands those over as integers, hence the str().

#let MONTHS = (
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
)

#let fmt-date(d) = {
  if d == none { return "Present" }
  let s = str(d)
  if s.contains("-") {
    let parts = s.split("-")
    MONTHS.at(parts.at(1)) + " " + parts.at(0)
  } else { s }
}

// JSON Resume treats a missing `endDate` as "still going", which is right for a
// job and wrong for a project — a project dated 2024 is finished, not ongoing.
// So `ongoing` is opt-in per section rather than inferred from the data.
#let date-range(item, ongoing: true) = {
  let start = fmt-date(item.at("startDate", default: none))
  let raw-end = item.at("endDate", default: none)
  if raw-end == none and not ongoing { return start }
  let end = fmt-date(raw-end)
  if start == end { start } else { start + " – " + end }
}

// ── page ─────────────────────────────────────────────────────────────────

#set document(
  title: cv.basics.name + " — " + cv.basics.label,
  author: cv.basics.name,
  keywords: cv.skills.map(g => g.keywords).flatten(),
)

#set page(paper: "us-letter", margin: (x: 0.62in, y: 0.55in))

// justify: false is rule 3. Leading is a touch tighter than Typst's default —
// Source Serif at opsz 10.5 has a generous x-height, and default leading opens
// a page this dense into something that drifts.
#set text(font: paper, size: 10.5pt, fill: ink, lang: "en")
#set par(justify: false, leading: 0.68em, spacing: 0.68em)

// Links are not coloured. On a resume half the page would go blue, and this
// document has to survive being printed in black and white by someone's
// recruiting coordinator. The URL text is the affordance.
#show link: set text(fill: ink)

// ── components ───────────────────────────────────────────────────────────

// Rule 1 lives here. There is no `tracking` on this and there must never be.
// The label reads as a label because it is mono, bold, uppercase and small —
// four signals, none of which touch glyph positioning.
#let section(title) = block(above: 1.5em, below: 0.55em, breakable: false)[
  #text(font: machine, size: 8.5pt, weight: "bold", fill: ink)[#upper(title)]
]

// The two-column row used by every entry: prose left, facts right.
//
// This is the one place the layout knowingly accepts a degraded extraction —
// a position-sorting parser may read the two left cells, then the two right
// cells, weakening the role↔date association. It does not lose anything, the
// convention is the strongest in resume typography, and the tagged structure
// tree carries the correct reading order for anything modern. Measured; see
// ATS.md, Finding B.
//
// `above` is not decorative. At 0em the bold title and the italic line below it
// butt bounding boxes, and the italic's ascenders (C, Y, W) climb into the
// title's descenders. Keep it positive.
#let row(left-text, right-text) = block(
  above: 0.28em, below: 0em,
  grid(
    columns: (1fr, auto),
    column-gutter: 1em,
    align: (left + horizon, right + horizon),
    left-text,
    text(font: machine, size: 8pt, fill: quiet)[#right-text],
  ),
)

// Company and location on ONE left-aligned line, rather than a second two-column
// row with the location flushed right.
//
// The first draft gave every entry two right-aligned facts stacked on top of each
// other. It read as a column of drifting grey with no relationship to the text
// beside it, and it doubled the wide-gap surface that degrades position-sorting
// extraction for no benefit — a location is not something anyone scans down the
// right edge for. One right-aligned fact per entry, and it is the date.
#let subrow(body) = block(above: 0.42em, below: 0em, text(style: "italic")[#body])

// The gap above matters more than it looks: without it the first marker rides
// up into the company line and reads as punctuation on the end of it.
#let bullets(items) = {
  set list(marker: text(fill: quiet, size: 0.9em)[•], indent: 0em, body-indent: 0.45em)
  set par(leading: 0.5em)
  block(above: 0.5em, below: 0em, list(..items.map(i => [#i])))
}

#let entry(body) = block(above: 1.05em, below: 0em, breakable: false, body)

// ── header ───────────────────────────────────────────────────────────────
//
// Stacked, left-aligned, and deliberately NOT a two-column row: the contact
// line is what a parser most wants and a wide horizontal gap is exactly what
// confuses one. Nothing here is centred and nothing here is flushed right, so
// there is no gap to misread. Rule 2 also lives here — the icons are gone and
// the URLs are spelled out.

#{
  set block(spacing: 0em)
  text(font: display, size: 26pt)[#cv.basics.name]
  v(0.34em)

  let contact = (
    link(cv.basics.url)[jass.gg],
    link("mailto:" + cv.basics.email)[#cv.basics.email],
    ..cv.basics.profiles.map(p => link(p.url)[
      #p.url.replace("https://", "").replace("www.", "")
    ]),
    cv.basics.location.region,
  )

  text(font: machine, size: 8pt, fill: quiet)[
    #contact.join(text(fill: mark)[ · ])
  ]
}

// The summary replaced a seven-row skills grid. It gets no heading: a reader who
// has just read the name knows whose summary this is, and "SUMMARY" would be the
// only label on the page that labels the obvious. Set slightly wider than the
// body's measure would allow so it reads as a paragraph rather than an entry.
#block(above: 1.15em, below: 0em, width: 92%)[#cv.basics.summary]

// ── experience ───────────────────────────────────────────────────────────

#section("Experience")

#for job in cv.work {
  entry[
    #row(entry-title(job.position), date-range(job))
    #subrow[#job.name · #job.location]
    #bullets(job.highlights)
  ]
}

// ── projects ─────────────────────────────────────────────────────────────

#section("Projects")

#for proj in cv.projects {
  entry[
    #row(
      [
        #link(proj.url)[#entry-title(proj.name)]
        #h(0.4em)
        #text(font: machine, size: 8pt, fill: quiet)[
          #proj.keywords.join(" · ")
        ]
      ],
      date-range(proj, ongoing: false),
    )
    #block(above: 0.46em, below: 0em)[#proj.description]
  ]
}

// ── skills ───────────────────────────────────────────────────────────────
//
// One wrapped line, not the seven-row labelled grid this used to be. That grid
// read as a form, and its last row claimed "Code Review" as a skill.
//
// It stays on the page at all because keyword parsers want one obvious place to
// look, and the bullets alone would leave that to chance. It is last, small, and
// quiet, which is the weight it deserves.

#section("Skills")

#for group in cv.skills {
  block(above: 0em, below: 0em)[
    #text(size: 9.5pt, fill: quiet)[#group.keywords.join(" · ")]
  ]
}

// ── the one-page invariant ───────────────────────────────────────────────
//
// In the document rather than in CI on purpose: this fires during `typst watch`
// too, so a bullet that pushes to page two is caught while writing it, not
// twenty minutes later in Actions. Exits 1 with the message below.

#context {
  let n = counter(page).final().first()
  assert(
    n == 1,
    message: "resume must be exactly one page, got "
      + str(n)
      + " — cut a bullet, do not shrink the type",
  )
}
