# Font licences

All fonts in this directory, and Baskervville which Astro fetches at build time
and self-hosts alongside them, are licensed under the SIL Open Font License,
Version 1.1. The full licence text is in `OFL.txt`.

OFL requires that the licence and copyright notice travel with the font. As
shipped upstream, none of these woff2 binaries carried a licence record — name
IDs 13 and 14 were empty, and Excalifont's copyright string reads "All rights
reserved", which is pre-OFL boilerplate from the source Glyphs file rather than
the actual grant. The OFL grant has been written into name IDs 13/14 of every
binary in this directory so it now travels with the file itself; this file and
`OFL.txt` are the accompanying notice.

## Baskervville

Copyright the Baskervville Project Authors (https://github.com/ANRT-TypeDesign/Baskervville).
Fetched from Google Fonts at build time by Astro's font API and served from
this origin. Not committed here.

## IoskeleyMono

Copyright 2015-2026, Renzhi Li (aka. Belleve Invis, belleve@typeof.net) — the
Iosevka typeface itself, per the font's own copyright record.
Configuration copyright (c) 2025, Ahmed Hatem (https://github.com/ahatem/IoskeleyMono).
An Iosevka build. Subset to Latin from the upstream Web release
(~480 KB/weight to ~34 KB) with fontTools; subsetting is a Modified Version
under OFL §2, and the name is unchanged because the design is unchanged.

## Excalifont

Copyright (c) 2024 Excalidraw. Excalifont is a trademark of Excalidraw.
Designed by Your Own Font Foundry (Virgil) and Ján Filípek / DizajnDesign
(Excalifont, modifications), https://dizajndesign.sk.
The OFL grant is recorded in the font's own metadata:
"This Font Software is licensed under the SIL Open Font License, Version 1.1."
Taken from the Latin subset shipped in excalidraw/excalidraw.
