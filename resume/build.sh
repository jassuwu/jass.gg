#!/usr/bin/env bash
#
# Typeset the resume into public/, and prove it is still readable by a machine.
#
#   ./resume/build.sh          (or: bun run resume)
#
# Run this after editing resume.yaml, look at the PDF, and commit the result.
# The built PDF and JSON are COMMITTED, not gitignored — Vercel serves them as
# ordinary static files, so a deploy has no build step for the resume at all and
# nothing new that can fail at deploy time.
#
# You cannot forget to run it. Typst output is byte-reproducible, so CI rebuilds
# from source and compares against what is committed; a stale PDF fails the
# build. Verified across platforms: the same resume.typ compiles to the identical
# sha256 on macOS/arm64 and Alpine/x86_64.
#
# Requires: typst 0.15.1 and python3. Python packages go into resume/.venv on
# first run; there is no system-level dependency beyond those two.

set -euo pipefail
cd "$(dirname "$0")"

TYPST_VERSION_EXPECTED="0.15.1"

# The pin is exact, not a range. Typst is pre-1.0 and its author has committed to
# further breaking changes; an exact pin means an upgrade surfaces as a compile
# error on a file we wrote, at a time we chose. Bump this and the version in
# .github/workflows/ci.yml together, deliberately.
actual=$(typst --version | awk '{print $2}')
if [[ "$actual" != "$TYPST_VERSION_EXPECTED" ]]; then
  echo "warning: typst $actual, expected $TYPST_VERSION_EXPECTED" >&2
fi

# On a Homebrew python `pip install` is refused outright (PEP 668,
# externally-managed), so provision a venv the first time rather than making
# every build a package-management errand. CI sets PY and skips this.
py="${PY:-}"
if [[ -z "$py" ]]; then
  py=.venv/bin/python
  if [[ ! -x "$py" ]]; then
    echo "→ provisioning resume/.venv (one-time)"
    python3 -m venv .venv
    .venv/bin/pip install --quiet -r requirements.txt
  fi
fi

# Output goes straight into public/ because that is what Vercel serves. There is
# no copy step and no second location for the built file to be stale in.
OUT="${OUT:-../public}"

# --creation-timestamp 0 is what makes the CI comparison possible: without it
# every rebuild embeds the current time and no two builds ever match.
#
# ua-1 (accessibility) and a-2a (archival, requires valid tagging) are real
# assertions about the structure tree, not decoration.
#
# The one-page invariant is asserted inside resume.typ and fires here.
echo "→ compiling"
typst compile \
  --font-path fonts \
  --pdf-standard ua-1,a-2a \
  --creation-timestamp 0 \
  resume.typ "$OUT/resume.pdf"

echo "→ resume.json"
"$py" yaml2json.py resume.yaml >"$OUT/resume.json"

"$py" check.py "$OUT/resume.pdf"
