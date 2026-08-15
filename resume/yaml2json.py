#!/usr/bin/env python3
"""resume.yaml -> JSON Resume, on stdout.

Published as a release asset next to the PDF so the resume is readable by
something other than a human with a PDF viewer. jass.gg serves itself to agents
already (/llms.txt); this is the same idea for the resume.

It also validates, which is the reason it runs before the release rather than
after: a typo in a field name should fail the build, not ship a JSON with a
silently missing section.

Usage:  python3 tools/yaml2json.py resume.yaml > resume.json
"""

import json
import sys

import yaml

SCHEMA = "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json"

# (section, required keys on every entry). Anything not listed here is passed
# through untouched — this validates the fields resume.typ actually indexes
# into, so a rename that would crash the render fails here first with a message
# that names the field.
REQUIRED = {
    "work": ("name", "position", "location", "startDate", "highlights"),
    "projects": ("name", "url", "startDate", "keywords", "description"),
    "skills": ("name", "keywords"),
}


def validate(cv):
    errors = []

    for key in ("name", "label", "email", "url", "summary", "profiles"):
        if not cv.get("basics", {}).get(key):
            errors.append(f"basics.{key} is missing or empty")

    for section, required in REQUIRED.items():
        for i, entry in enumerate(cv.get(section) or []):
            for key in required:
                if key not in entry:
                    label = entry.get("name") or entry.get("institution") or f"#{i}"
                    errors.append(f"{section}[{label}].{key} is missing")

    return errors


def main():
    if len(sys.argv) != 2:
        sys.exit(f"usage: {sys.argv[0]} resume.yaml")

    with open(sys.argv[1], encoding="utf-8") as f:
        cv = yaml.safe_load(f)

    errors = validate(cv)
    if errors:
        for e in errors:
            print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

    # PyYAML resolves an unquoted `2024` to int and `2025-10` to str. JSON
    # Resume wants ISO strings throughout, so normalise on the way out rather
    # than quoting every date in the YAML and making it uglier to edit.
    for section in ("work", "projects"):
        for entry in cv.get(section) or []:
            for key in ("startDate", "endDate"):
                if key in entry:
                    entry[key] = str(entry[key])

    print(json.dumps({"$schema": SCHEMA, **cv}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
