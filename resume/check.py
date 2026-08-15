#!/usr/bin/env python3
"""Prove resume.pdf is still readable by a machine. Exits 1 if it is not.

WHY pdfminer.six AND NOT pdftotext
----------------------------------
This was measured, and it inverts the obvious choice. With `tracking: 0.12em`
deliberately added to the section headings:

    poppler (pdftotext, -raw, -layout)  -> "EXPERIENCE"          bug invisible
    pdfminer.six                        -> "E X P E R I E N C E" bug visible

Poppler runs a word-reassembly heuristic that silently repairs tracked-out text,
so a `pdftotext | grep -q EXPERIENCE` gate passes on a document that is broken
for every parser that does not do that reassembly. It is a gate that cannot
fail. pdfminer.six is also the closer analogue of the Python-based extraction in
real ATS pipelines.

The gates here are regression tests for two failure modes that were measured in
the resume this replaces, not hypotheticals. See ATS.md.
"""

import sys

from pdfminer.high_level import extract_text
from pypdf import PdfReader

PDF = sys.argv[1] if len(sys.argv) > 1 else "../public/resume.pdf"

# Gate 1 — the contact line must survive extraction.
#
# The old resume.tex set these with FontAwesome. Those glyphs are Custom-encoded
# with no Unicode mapping, so the row a parser most wants extracted as
# "§ /jassuwu | \x8a /jassdotgg | ï /in/kprnv | * India". It shipped that way for
# a year. Any icon font reintroduces this instantly.
CONTACT = ("jass@jass.gg", "jass.gg", "github.com/jassuwu", "linkedin.com/in/kprnv")

# Gate 2 — section headings must extract as words.
#
# Letter-spacing is per-glyph positioning in every typesetting system, so this is
# engine-agnostic and would happen in LaTeX too. Headings are how an ATS segments
# a resume; tracked-out ones mean it finds no experience section at all.
# Every section resume.typ renders. Add to this when you add a section, and the
# build tells you when you forget. There is no EDUCATION: it was dropped, and
# this list going red is how that was confirmed rather than assumed.
HEADINGS = ("EXPERIENCE", "PROJECTS", "SKILLS")


def main():
    failures = []

    def check(ok, label, detail=""):
        print(f"  {'ok  ' if ok else 'FAIL'} {label}{detail}")
        if not ok:
            failures.append(label)

    text = extract_text(PDF)
    reader = PdfReader(PDF)

    print("→ contact line extracts as text (no icon fonts)")
    for needle in CONTACT:
        check(needle in text, needle)

    print("→ section headings extract unspaced (no tracking)")
    for heading in HEADINGS:
        spaced = " ".join(heading)
        if spaced in text:
            check(False, heading, f" — extracted as '{spaced}'")
        else:
            check(heading in text, heading)

    # Gate 3 — belt and braces. resume.typ asserts this itself and would already
    # have exited 1, so this only catches someone deleting that assertion.
    print("→ exactly one page")
    n = len(reader.pages)
    check(n == 1, f"{n} page{'s' if n != 1 else ''}")

    # Gate 4 — tagging. Not proven to change any specific ATS's behaviour, but it
    # is the only thing in the document carrying an explicit, unambiguous reading
    # order, and --pdf-standard would have to regress for this to break.
    print("→ tagged with a structure tree")
    root = reader.trailer["/Root"]
    marked = root.get("/MarkInfo", {}).get("/Marked", False)
    check(bool(marked) and "/StructTreeRoot" in root, "StructTreeRoot + /Marked")

    if failures:
        print(
            f"\nresume.pdf built but is not machine-readable: {', '.join(failures)}"
            "\nsee ATS.md — do not 'fix' this by changing the gate.",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"\nresume.pdf · {n} page · tagged · all gates pass")


if __name__ == "__main__":
    main()
