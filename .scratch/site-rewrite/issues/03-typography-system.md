# Validate the three-font typography system

Type: prototype
Status: resolved

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

## Answer

The system holds, with one correction forced by the typeface itself.

### Decisions

- **Body: 18px** (`--text-body: 1.125rem`, line-height 1.7). 16px is genuinely weak on dark; 18px is where Baskervville stops looking thin.
- **Lime never colours text.** It is **1.16:1 on white** and 17.12:1 on near-black — not "low contrast", invisible. It *marks* text instead: links get a lime underline (`0.16em`, offset `0.16em`) and keep `color: inherit`. The `lime-highlight` utility is the second, rarer treatment for emphasis an underline can't carry. The "darken lime for light mode" option was rejected.
- **Excalifont: marginalia and the `jass` wordmark.** The ticket proposed "never a headline"; jass amended it, and was right — a name set in a hand font is a *signature*, not a gimmick. The gimmick risk was arbitrary headings, which still get nothing.
- **All three kept, none mandatory.** "Use what makes sense, don't force all 3 in all places."

### The correction: Baskervville has no bold

The ticket's premise was that Baskervville offers 400 and 700. It does not — it ships **one weight**. Google's CSS API answers a request for `wght@700`, which is what made this look settled, but the file it returns is byte-identical to the 400 (verified by md5 across `.astro/fonts/`). Declaring the 700 face was actively worse than omitting it: `font-bold` rendered as regular *and* the browser suppressed synthetic bold, because a matching face existed.

**Consequence for the whole system: the paper role has no bold.** Emphasis is italic — a real, separate face — or it moves to the machine role, which is now the only role with a true bold. Hierarchy in prose comes from size and space, not weight. This is a constraint ticket 08 has to design within, and it is arguably more "considered" than the alternative.

### Type scale, as concrete values

Recorded in `src/styles/global.css` under `@theme`:

| token | size | line-height | role |
|---|---|---|---|
| `--text-micro` | 0.6875rem | 1.4 | machine labels, uppercase tags |
| `--text-meta` | 0.8125rem | 1.5 | machine data — dates, repo names |
| `--text-small` | 1rem | 1.6 | secondary prose |
| `--text-body` | **1.125rem** | **1.7** | body — the settled size |
| `--text-title` | 2rem | 1.15 | the wordmark |

### Hosting and licensing

All three are **SIL OFL 1.1**. Baskervville is Google-provided but Astro downloads and self-hosts it, so **the site makes zero third-party font requests** — the old jass.gg and t3code's marketing site both load from Google's CDN; this doesn't.

**IoskeleyMono was 480 KB per weight** — it's an Iosevka build carrying thousands of glyphs. Subset to Latin with fontTools: **34 KB**. Total font payload 168 KB; preloads trimmed from 133 KB (every variant, and *not* the wordmark font) to 84 KB (only faces that render).

Licence compliance needed real work: none of the binaries carried a licence record (name IDs 13/14 empty) and Excalifont's copyright string still reads "All rights reserved" — pre-OFL boilerplate, contradicted by the actual grant deeper in its metadata. The OFL grant is now written into name IDs 13/14 of every woff2 here, with `OFL.txt` and `LICENSES.md` alongside.

### Prototype

Deleted, as intended — it was a throwaway. It lived at `src/pages/proto/typography.astro`; recoverable from commit `58ece34` if the comparison is ever wanted again.
