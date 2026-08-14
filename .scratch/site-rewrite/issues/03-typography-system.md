# Validate the three-font typography system

Type: prototype
Status: open

## Question

Does the paper / machine / margin font system actually hold up on screen, and at what settings?

- **Baskervville** (https://fonts.google.com/specimen/Baskervville) — the paper. Body and prose.
- **IoskeleyMono** (https://ahatem.github.io/IoskeleyMono/) — the machine. Dates, periods, repo names, anything factual.
- **Excalifont** (https://plus.excalidraw.com/excalifont) — the margin. Annotation, memes, asides. Never a headline.

Build a throwaway page with real jass.gg copy — the intro paragraph, a work-experience row, a `things` list, a `toys` list — and settle:

1. **Baskervville at body size.** It's a high-contrast revival with fine hairlines. Does it hold at 16px, or does it need 18–20px? Check **dark mode specifically** — thin serifs thin out further on dark backgrounds. Find the size, weight and line-height where it reads as a well-set document rather than as a weak one.
2. **Lime against Baskervville.** The accent is `oklch(0.9392 0.1588 124.39)` — very light and very saturated. Does it survive as link colour on thin serif text in light mode, where it may fail contrast outright? Where does lime actually get used if not on links?
3. **Excalifont's Excalidraw association.** Confined to marginalia, is it charm or is it "made with Excalidraw"? Show jass both — marginalia-only, and one version where it creeps into a heading — so the boundary is a decision he's seen rather than one he's been told.
4. **Do all three earn their place?** Three families is a lot for a site whose thesis is restraint. If one of them isn't pulling weight, cut it here rather than after it's wired into the build.
5. **Hosting and licensing.** Neither IoskeleyMono nor Excalifont is on Google Fonts, so both need self-hosting — confirm the licence permits redistribution, and settle on subsetted woff2 self-hosting for all three (which also removes the third-party font request the current site makes).

Link the prototype from the answer. Record the final type scale as concrete values.
