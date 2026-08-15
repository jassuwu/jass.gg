# Font licences

Every font in this directory is licensed under the SIL Open Font License,
Version 1.1. The full text is in [`OFL.txt`](OFL.txt).

OFL requires that the licence and copyright notice travel with the font.
Every binary here carries the grant in its own name table (IDs 13 and 14), so
the notice survives being copied out of this repo; this file and `OFL.txt` are
the accompanying notice.

Embedding an OFL font in a PDF is explicitly permitted and does not place any
licence requirement on the document itself
([OFL FAQ](https://openfontlicense.org/ofl-faq/)).

## Provenance

Typst reads TTF/OTF/TTC only — not WOFF2 — so these were converted once, by
hand, and committed. Do not convert in CI.

| File                       | Source                                                 |
| -------------------------- | ------------------------------------------------------ |
| `SourceSerifText-*.ttf`    | `SourceSerif4[opsz,wght].ttf`, instanced at opsz 10.5  |
| `Baskervville-Regular.ttf` | `Baskervville[wght].ttf`, instanced at wght 400        |
| `Baskervville-Italic.ttf`  | `Baskervville-Italic[wght].ttf`, instanced at wght 400 |
| `Baskervville-Bold.ttf`    | `Baskervville[wght].ttf`, instanced at wght 700        |
| `IoskeleyMono-Regular.ttf` | jass.gg `src/fonts/*.woff2`, flavor stripped           |
| `IoskeleyMono-Bold.ttf`    | jass.gg `src/fonts/*.woff2`, flavor stripped           |
| `Excalifont-Regular.ttf`   | jass.gg `src/fonts/*.woff2`, flavor stripped           |

The Ioskeley and Excalifont files came from jass.gg rather than from upstream on
purpose: upstream shipped them with name IDs 13/14 empty (and Excalifont's
copyright string reading "All rights reserved", pre-OFL boilerplate from the
source Glyphs file rather than the actual grant). The site's copies have the
real grant written in. Taking them from there keeps that work.

## Source Serif 4

Copyright 2014-2023 Adobe (http://www.adobe.com/), with Reserved Font Name
'Source'. Via [google/fonts](https://github.com/google/fonts/tree/main/ofl/sourceserif4).

The body face. Upstream is variable on `wght` 200–900 and `opsz` 8–60; the three
static cuts here are taken at **opsz 10.5**, matching the size the resume sets
body text at — the optical size the typeface itself offers for text this small.
The bold is cut at wght 600 and its metadata declares 700, so `weight: "bold"`
resolves to the semibold design exactly; 700 shouts on a page this dense.

Instancing is a Modified Version under OFL §2. The name is changed to
"Source Serif Text" rather than kept as "Source Serif 4", both because OFL asks
that of a modified copy and because the Reserved Font Name applies to 'Source'
alone, which is not used here as a standalone name.

## Baskervville

Copyright the Baskervville Project Authors
(https://github.com/ANRT-TypeDesign/Baskervville), via
[google/fonts](https://github.com/google/fonts/tree/main/ofl/baskervville).

Upstream ships a variable font with a `wght` 400–700 axis; the three static
instances above were cut from it with `fontTools.varLib.instancer`. Instancing
is a Modified Version under OFL §2 and the name is unchanged because the design
is unchanged.

Used for the name only, at 26pt. Baskervville is a display cut with a small
x-height and fine hairlines; the site's own config marks 18px as "where
Baskervville stops looking thin", and resume body text sits well under that. The
bold instance is kept because the name may want it later, but nothing currently
uses it.

Note that jass.gg declares Baskervville with **no bold**, because Google's CSS
API answers a 700 request with the 400 file. That is a constraint of the delivery
API, not of the family — this repo cuts the bold from the variable source.

## IoskeleyMono

Copyright 2015-2026, Renzhi Li (aka. Belleve Invis, belleve@typeof.net) — the
Iosevka typeface itself, per the font's own copyright record.
Configuration copyright (c) 2025, Ahmed Hatem (https://github.com/ahatem/IoskeleyMono).

An Iosevka build, subset to Latin from the upstream Web release with fontTools.
Subsetting is a Modified Version under OFL §2; the name is unchanged because the
design is unchanged.

## Excalifont

Copyright (c) 2024 Excalidraw. Excalifont is a trademark of Excalidraw.
Designed by Your Own Font Foundry (Virgil) and Ján Filípek / DizajnDesign
(Excalifont, modifications), https://dizajndesign.sk.

The OFL grant is recorded in the font's own metadata. Taken from the Latin
subset shipped in excalidraw/excalidraw.
