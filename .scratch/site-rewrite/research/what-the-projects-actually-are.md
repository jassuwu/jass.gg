# Research: what the eleven projects actually are

Method: for each project, fetched the live `link` (WebFetch, cross-checked against raw `curl` HTML/JS since several sites are canvas- or SPA-rendered and WebFetch's markdown pass under-reports them), read the GitHub README (`gh api repos/jassuwu/<repo>/readme`), pulled repo stats (`gh api repos/jassuwu/<repo>`), and checked npm where a package is plausibly published (`api.npmjs.org/downloads/point/last-week/<pkg>`, `registry.npmjs.org/<pkg>`). All checks run 2026-08-15. Every claim below is cited to the URL/command it came from. Nothing here is extrapolated from the one-line descriptions in `src/data/projects/`.

---

## andrew-dictate

**What it does.** A macOS menu-bar app: hold `fn`, speak, release, and the transcript pastes at the cursor roughly 250ms after key-up, fully on-device (Parakeet model via FluidAudio). Deterministic cleanup runs on every transcript — spoken punctuation, emails, numbers, self-corrections, stumble removal — plus an optional, off-by-default Apple on-device "AI polish" pass with three modes (off/on/always) and a local "cleanup lab" screen that shows raw-vs-cleaned pairs side by side. [github.com/jassuwu/andrew-dictate README](https://github.com/jassuwu/andrew-dictate)

**Signature visual/interaction.** There isn't one on the live site — `dictate.jass.gg` is pure marketing copy (headline, subheadline, an install command, three links), no screenshot, GIF, or video anywhere on the page. [WebFetch of dictate.jass.gg, 2026-08-15] The actual product surface (the "cleanup lab" raw-vs-cleaned view) exists only inside the installed macOS app, unobserved from the web.

**Honest 5-second demo.** No visual asset exists to demo from — the marketing site ships zero screenshots/GIFs of the app itself, so any demo would have to be newly recorded from the live macOS app, not lifted from an existing asset. [WebFetch of dictate.jass.gg]

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topics: none. [`gh api repos/jassuwu/andrew-dictate`]
- 11 GitHub releases, latest `v0.6.0` shipping one asset, `AndrewDictate-0.6.0.dmg`. [`gh api repos/jassuwu/andrew-dictate/releases`]
- npm: not applicable (native Swift app, not a JS package).
- Site displays no numbers at all — no download count, no version badge, no star count. [WebFetch of dictate.jass.gg]

**Reusable assets.** The app icon (`apps/mac/art/icon_1024.png` in the repo, used twice in the README) is the only visual asset found; no SVGs, sprites, or shaders ship with this one.

---

## better-splitwise

**What it does.** An Expo/React Native client that reads your own Splitwise account: scan a receipt (photo → your own Gemini key extracts items/tax/tip/fees on-device), review the extraction, pick who's in, tap each item to assign who shared it (with "everyone"/"just me" shortcuts), then push one real Splitwise expense with itemized shares and an itemized comment. No second ledger — it's a front end over the real Splitwise API, with your Splitwise and Gemini keys staying on-device and no backend of its own. [github.com/jassuwu/better-splitwise README](https://github.com/jassuwu/better-splitwise)

**Signature visual/interaction.** The site's hero is a demo video captioned "a demo of splitting a ₹7,400 dinner, sound on" — the scan → tap-item → tap-person assignment flow. [WebFetch of bettersplitwise.jass.gg, 2026-08-15] The brand mark is a faithful parody of Splitwise's own icon: same faceted "gem" house shape, recolored lime, with the single Splitwise "S" turned into "BS" (both readings intended), set in Montserrat — Splitwise's own typeface. [github.com/jassuwu/better-splitwise README, "brand" section]

**Honest 5-second demo.** Yes — the item-assignment tap flow (tap an item, tap who shared it) is fast, visual, and is the site's own existing demo video content (₹7,400 dinner clip), not something to reimplement from scratch. [WebFetch of bettersplitwise.jass.gg]

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topics: none. [`gh api repos/jassuwu/better-splitwise`]
- 1 GitHub release, `v0.1.0`, shipping a single asset: `better-splitwise-v0.1.0.apk`. [`gh api repos/jassuwu/better-splitwise/releases`] Not on the Play Store or App Store — the site's "get it on android" button links to this GitHub release APK, and the README states iOS requires building from source. [WebFetch of bettersplitwise.jass.gg; README]
- npm: not applicable (mobile app monorepo, no published package).

**Reusable assets.** One source SVG builds the entire "BS" gem icon set via `apps/mobile/scripts/build-icons.ts` — a directly-reusable brand asset already built for exactly this kind of reuse. [github.com/jassuwu/better-splitwise README, "brand" section]

---

## mojify

**What it does.** A Go CLI (`mojify`) that plays local videos, local still images, or any yt-dlp-compatible URL as truecolor, edge-aware ASCII/character art — live in the terminal with audio, or exported to MP4/WebM/MOV/GIF/APNG/PNG/JPEG/plain-text/ANSI-text. It shells out to `ffmpeg`/`ffprobe`/`ffplay`/`yt-dlp` rather than reimplementing media handling; four built-in recipe presets (`default`, `mono`, `ascii`, `blocks`) change the character/color strategy. Distributed via Homebrew tap and GitHub Releases (tarballs) — not npm. [github.com/jassuwu/mojify README](https://github.com/jassuwu/mojify)

**Signature visual/interaction.** The rendered colored-character video output itself — the README's own framing is "turn media into text," and the site's hero is a GIF of exactly that transform, "mojify transforms a polished mojify source animation into colored text video output." [github.com/jassuwu/mojify README; WebFetch of mojify.jass.gg, 2026-08-15]

**Honest 5-second demo.** Yes, and it's the product's actual output at actual quality: a short clip run through `mojify export` produces the real ANSI/colored-character render — no simulation needed, this is the literal renderer. [github.com/jassuwu/mojify README, "Usage" examples]

**Numbers.**
- GitHub: **10 stars**, 0 forks, **10 watchers**, 1 open issue, topics: `ascii`, `ascii-art`, `ffmpeg-wrapper`, `yt-dlp-wrapper`. [`gh api repos/jassuwu/mojify`] — the highest star count of any of the eleven repos checked.
- 13 GitHub releases, latest `v2026.06.06.0` (calendar+build tag scheme). [`gh api repos/jassuwu/mojify/releases`]
- npm registry has a package literally named `mojify` with 4 weekly downloads, latest `1.0.4` — **this is not jassuwu's project**: its maintainer is `michaelscofield`, description "Transform emojis into text" (the reverse operation, text-to-emoji, unrelated tool). [`registry.npmjs.org/mojify`, `api.npmjs.org/downloads/point/last-week/mojify`] jassuwu's mojify has zero npm presence.

**Reusable assets.** `docs/assets/readme/mojify-header.gif` (1.17 MB) and its reduced-motion poster PNG (247 KB) are pre-rendered, production-quality demo output already committed to the repo. [`gh api repos/jassuwu/mojify/contents/docs/assets/readme`]

---

## quilt

**What it does.** Paste one or more GitHub usernames; quilt fetches each account's public contribution calendar (via the third-party `github-contributions-api`, which can read privatized-but-visible green), sums every day's count across all accounts, recomputes green levels from the merged distribution, and renders one merged "quilt." Entirely client-side, no login, state lives in the URL (shareable link), and it exposes an embeddable SVG endpoint. [github.com/jassuwu/quilt README](https://github.com/jassuwu/quilt)

**Signature visual/interaction.** The merged green contribution grid itself ("quilt of green"), plus the theme picker (dracula/nord/tokyonight/gruvbox/catppuccin/solarized/mono/stitch) and live restyling on the site. [WebFetch of quilt.jass.gg, 2026-08-15]

**Honest 5-second demo.** Yes — the SVG endpoint is live and real: `curl https://quilt.jass.gg/u/jassuwu,torvalds.svg` returns HTTP 200, a 48,378-byte real SVG with actual merged contribution data, confirmed by direct request. [`curl -o /tmp/quilt.svg https://quilt.jass.gg/u/jassuwu,torvalds.svg`, 2026-08-15] Any in-row demo can literally embed this working endpoint rather than fake it.

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topics: none. [`gh api repos/jassuwu/quilt`]
- 0 GitHub releases. [`gh api repos/jassuwu/quilt/releases`]
- npm: not applicable — it's an Astro app (`astro: "^6.4.4"`), not a published package. [`gh api repos/jassuwu/quilt/contents/package.json`]
- Ships `@vercel/analytics` as a dependency, meaning the live site does track visits — no visitor-count figure is surfaced publicly anywhere checked. [`gh api repos/jassuwu/quilt/contents/package.json`]

**Reusable assets.** The SVG-generation endpoint itself (`quilt.jass.gg/u/<names>.svg`) is a live, working, directly-embeddable asset generator — confirmed working, not aspirational. Also `docs/assets/readme/quilt-header.gif` (1.85 MB) and `quilt-poster.png` (87 KB) are pre-rendered demo assets already in the repo. [`gh api repos/jassuwu/quilt/contents/docs/assets/readme`]

---

## skills

**What it does.** Not a web app — a distributable package of instructions for coding agents (Claude Code, Cursor, Codex), installed like a package via `bunx --bun skills add jassuwu/skills` (whole set) or with `-s <name>` for one skill. Currently ships exactly two skills: `htmlize` (renders long agent replies as live, self-updating HTML instead of terminal walls of markdown; needs `python3` + a browser) and `reelize` (composes a short video whose music, made with Strudel, is locked to Remotion-rendered motion, muxed to one MP4; needs Node 18+, first render fetches headless Chromium). [github.com/jassuwu/skills README](https://github.com/jassuwu/skills)

**Signature visual/interaction.** None — there is no `link` for this entry in `src/data/projects/skills.md` (confirmed: no `link` field present, only `github`), and the project itself has no UI; it's markdown lesson files plus small scripts. [`src/data/projects/skills.md`; github.com/jassuwu/skills README]

**Honest 5-second demo.** No honest demo exists. This is agent tooling consumed by an LLM through a CLI install command and markdown instructions — there is no on-screen mechanic to show in a five-second loop that would represent the product honestly; showing "text scrolls by" would misrepresent it as a visual toy.

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topics: none. [`gh api repos/jassuwu/skills`]
- skills.sh listing page (`skills.sh/jassuwu/skills`) reports **5 total installs**: `htmlize` 4, `reelize` 1. [WebFetch of skills.sh/jassuwu/skills, 2026-08-15] Note: the static HTML at that URL is a client-rendered SPA shell with no numbers in the raw markup (`curl` returns none); this figure comes from WebFetch's rendered read and should be treated as current-as-of-fetch, not independently re-verified via a second method.
- npm: not applicable, distributed via the `skills.sh` registry / `skills` CLI, not npm.

**Reusable assets.** None visual — it ships markdown (`SKILL.md`, `ARTIFACT.md`, `README.md`) and a Python stdlib live-reload server script (`skills/htmlize/scripts/serve.py`), no graphical assets.

---

## ass

**What it does.** A full 3D WebGL toy built on Three.js (`three@^0.185.1`) with `lil-gui` (debug control panel) and `stats-gl` (perf overlay) as direct dependencies. The repo's own source layout makes the mechanic explicit: a soft-body physics solver (`src/physics/{lattice,ripples,skin,solver}.ts`) drives a rendered "specimen" (`src/scene/specimen.ts`) built via surface-nets isosurface meshing (`src/scene/surface-nets.ts`), which the user "slaps" via pointer input (`src/interaction/slap.ts`, `src/input/pointer.ts`) — the impact ripples through the soft-body mesh and triggers procedural "foley" sound effects (`src/audio/{director,engine,foley}.ts`). There's also an orbit camera (`src/interaction/orbit.ts`), a "kill-cam" and a "flush" scene transition (`src/scene/{kill-cam,flush}.ts`). [`gh api repos/jassuwu/ass/contents/src/*`, 2026-08-15] This is categorically different from what the one-line description ("(‿ˠ‿)") or the repo topic (`ass`) implies on their own — it's a real-time soft-body physics/rendering demo, not a static joke page.

**Signature visual/interaction.** The live page itself renders nothing server-side — `curl`ing `ass.jass.gg` returns an empty `<body>`; everything is drawn to a full-viewport `<canvas>` (`touch-action: none`, `overflow: hidden`) injected by the bundled JS. [`curl -s -L https://ass.jass.gg`, 2026-08-15] Per the source-file names, the recognizable moment is a mouse/touch "slap" landing on the 3D specimen and rippling across its soft-body surface with a synced foley sound.

**Honest 5-second demo.** Plausibly yes, muted — a single slap-and-jiggle-ripple loop is the product's own physics solver at its own render quality, and is short and self-contained by nature (one impulse, one ripple decay). Not independently confirmed by driving the live canvas (no browser automation run in this pass) — the mechanic is inferred from source file names and the page's canvas/touch-action:none setup, not from watching it play.

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topic: `ass`. [`gh api repos/jassuwu/ass`]
- 0 GitHub releases (not checked directly but no release-related links found anywhere in README or site).
- npm: not applicable — `"private": true` in `package.json`, a Vite/Three.js app, not a published library. [`gh api repos/jassuwu/ass/contents/package.json`]
- The page's own `schema.org` metadata self-describes as: type `VisualArtwork`, artform `Sculpture`, artMedium `Simulated flesh`, artworkSurface `Void`, abstract "Gluteus maximus." [`curl -s -L https://ass.jass.gg`, head section]

**Reusable assets.** None packaged for external reuse — it's an application, not a library; no exported SVG/shader/sprite artifact found outside the Vite build.

---

## onandemo.js

**What it does.** A generalized `oneko.js` (the classic cursor-chasing cat): bring any sprite sheet + a JSON frame map, and the engine makes it chase the mouse, rest within a configurable radius, and occasionally perform an idle "antic" after lingering (~every 20s, oneko-style). The engine bundles a default cat plus two additional presets (`soldier`, `slime`) selectable via `data-preset`. It's a genuine drop-in: a `<script>` tag with zero config gives the classic cat; `data-sheet`/`data-frame-map` attributes (or the `onandemo({ sheet, frameMap })` JS API) bring your own art. Direction-fallback logic ("mirror, snap, fall back") means an `idle` state plus one run direction is already a complete companion. [github.com/jassuwu/onandemo.js README](https://github.com/jassuwu/onandemo.js)

**Signature visual/interaction.** Sprite companion(s) actively chasing the live cursor on the demo site, with a running "px chased" counter and a hoverable grid of the cat's 32 animation cells. [WebFetch of onandemo.jass.gg, 2026-08-15]

**Honest 5-second demo.** Yes, cheaply and exactly — the whole engine is **11,975 bytes minified** (verified directly: `curl -L https://unpkg.com/onandemo/dist/onandemo.js` → 11,975 bytes, matching the README's claimed "11.6 KB minified"), zero dependencies, and it's `background-position` animation over a sprite sheet, nothing else. [`curl -s -L -o /dev/null -w '%{size_download}' https://unpkg.com/onandemo/dist/onandemo.js`, 2026-08-15; README "how it works"] A real in-row demo is just this actual script chasing a synthetic cursor path — the product's own trick, at its own (trivial) cost.

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topics: `bun`, `cursor`, `desktop-pet`, `oneko`, `pixel-art`, `sprite-animation`, `typescript`. [`gh api repos/jassuwu/onandemo.js`]
- **Correction to the README:** the README's roadmap says "npm `0.1.0` — the engine above is built and tested; the publish is imminent" — but it is **already published**, as `onandemo` (not `onandemo.js`), currently at version **`0.0.2`** (published `0.0.1`→`0.0.2` same day, 2026-06-12, and untouched since — over two months stale relative to the README's "imminent" framing). [`registry.npmjs.org/onandemo`]
- npm weekly downloads: **4**. [`api.npmjs.org/downloads/point/last-week/onandemo`]

**Reusable assets.** The published npm package (`onandemo`, unpkg-servable) is itself the directly-reusable asset — a working, tiny, dependency-free cursor-companion engine plus bundled cat/soldier/slime sprite sheets and frame maps, exactly the kind of thing a portfolio entry could import rather than reimplement.

---

## savemefrom

**What it does.** Paste a URL or drop an image anywhere on the page (no visible input field by design — paste/drop/`?u=`/`?i=` query params are the only inputs). ~3.5 seconds later the screen flashes green and Devil May Cry's Vergil's "judgement cut" scene plays over a screenshot of the pasted content (fetched via a Microlink screenshot call), landing with slash marks that appear to slice the underlying page. The mechanism is an SVG `feColorMatrix` chroma-key filter over a baked video clip (`vergil.mp4`) — the green channel is remapped to alpha, so Vergil's pre-baked slash animation composites transparently over whatever content was pasted in. `history.replaceState` afterward makes the resulting URL directly shareable (paste → share → repeat). [github.com/jassuwu/savemefrom README](https://github.com/jassuwu/savemefrom)

**Signature visual/interaction.** The green-flash chroma-key slash reveal over the pasted content — a copyrighted Devil May Cry clip driving the effect.

**Honest 5-second demo.** Plausibly, but with a caveat: the slash-reveal itself, at real quality, is the product's own asset (`public/vergil.mp4`, 15.2 MB, confirmed present in the repo). [`gh api repos/jassuwu/savemefrom/contents/public`] However this clip is almost certainly a licensed/copyrighted asset (Capcom's Devil May Cry character), which is an IP-risk flag independent of demo honesty — worth surfacing to whoever designs the row (ticket 15), not resolved here.

**Numbers.**
- GitHub: **1 star**, 0 forks, **1 watcher**, 0 open issues, topics: none. [`gh api repos/jassuwu/savemefrom`]
- 0 GitHub releases.
- npm: not applicable (Vite/React SPA, not a package).
- The site's own `og:url` meta tag resolves to `https://savefrom.jass.gg/` (no "me") while the project's actual `link` in `src/data/projects/savemefrom.md` and its working hostname are both `savemefrom.jass.gg` — this is a real, live discrepancy in the site's own canonical/OG URL metadata, not a redirect (no `Location` header was sent; both hostnames independently 200). [`curl -s -I -L https://savemefrom.jass.gg`; `curl -s -L https://savemefrom.jass.gg` meta tags, 2026-08-15]

**Reusable assets.** `public/vergil.mp4` (15.2 MB, chroma-keyed) and the SVG `feColorMatrix` chroma-key filter definition (inlined in `index.html`) are both directly reusable technique/asset pairs — but see the IP caveat above before reusing the video itself.

---

## incomerank

**What it does.** Enter income (any currency/period) + country; the value converts to USD (`income ÷ 365 ÷ FX`) and is looked up against a population-weighted global income distribution (built from World Bank PIP data, Pareto-tailed above the 99th percentile using WID.world) and against the user's own country's distribution. The user first **guesses** their own rank (drag a puck up a shaft), then rides a glass elevator car up a log-scale "ASCENT" shaft past labelled floors (poverty line, median person, global top 1%, named public figures — Shah Rukh Khan, BTS, Ronaldo, Mukesh Ambani — all the way to Elon Musk), with a procedural Web Audio ratchet sound per notch of travel. Everything runs client-side against pre-baked static JSON; nothing touches a server. [github.com/jassuwu/incomerank README](https://github.com/jassuwu/incomerank)

**Signature visual/interaction.** The log-scale "ASCENT" elevator ride itself — guess-then-reveal, climbing past named income landmarks, guess-marker left behind to show the gap. [github.com/jassuwu/incomerank README, "The Reveal"; WebFetch of incomerank.jass.gg, 2026-08-15 confirms the drag-to-guess puck, "open the doors →" button, and post-reveal share/save controls are live on-site]

**Honest 5-second demo.** Yes, and it already exists pre-rendered: the project ships a Remotion composition (`remotion/`) that reuses the *actual production* geometry module (`src/lib/tower.ts`) and re-synthesizes the *actual production* sound module (`sound.ts`), rendering a real "₹50,000/mo" run that sounds and looks exactly like the live site — outputting both a silent CTA-free GIF (`incomerank-header.gif`) and a social MP4 with sound + CTA. This is not a mockup; it's the same math and audio as production. [github.com/jassuwu/incomerank README, "The Demo"]

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topics: none. [`gh api repos/jassuwu/incomerank`]
- 0 GitHub releases.
- npm: not applicable (Astro static site).
- Numbers the product itself displays/claims: covers **165 countries / ~7.9 billion people**; the README's own worked example: "₹50,000/month is the global top 18%" and "Elon Musk earns 69 million× that every day." [github.com/jassuwu/incomerank README]
- Existing demo asset sizes: `incomerank-header.gif` 6.97 MB, `incomerank-demo.mp4` 6.66 MB, poster PNG 452 KB. [`gh api repos/jassuwu/incomerank/contents/docs/assets/readme`]

**Reusable assets.** The pre-rendered header GIF/MP4 (production-quality, already matching the real site's geometry and audio) can be embedded directly rather than re-produced. The underlying `src/lib/tower.ts` (geometry) and `sound.ts` (procedural audio) modules are also directly reusable code, per the README's own description of them driving "the live reveal, the static `/r/N` share pages, the OG cards and this README's header alike."

---

## liquid-glass-cursor

**What it does.** A zero-dependency script (`liquid-glass-cursor`, published to npm) that replaces the native cursor with a small `<div>` clipped to the macOS arrow-cursor path, using `backdrop-filter: url(#svg-filter)` to refract whatever is behind it. The refraction map is generated at init from real per-pixel physics: distance-to-nearest-edge-segment on the seven-segment macOS arrow path, an outward normal, and an inverted-smoothstep bevel profile (`1 − (3t² − 2t³)`), encoded into a displacement-map PNG loaded via `feImage`. Chromatic aberration comes from three `feDisplacementMap` passes at slightly different per-channel scales, screen-blended. Chromium-only (Firefox/Safari don't support `backdrop-filter: url()`). [github.com/jassuwu/liquid-glass-cursor README](https://github.com/jassuwu/liquid-glass-cursor)

**Signature visual/interaction.** The refracting/warping "glass" bubble trailing the real mouse cursor, distorting page content behind it with a colored chromatic fringe at its rim.

**Honest 5-second demo.** Yes, trivially and confirmed working: the landing page (`liquid-glass-cursor.jass.gg`) **self-demos by running the real effect on the visitor's actual mouse** — its bundled JS ends with `createLiquidGlassCursor()` auto-invoked on load, confirmed by fetching and reading the deployed bundle directly. [`curl -s -L https://liquid-glass-cursor.jass.gg/index-b050v82t.js` tail, 2026-08-15, shows `// demo/demo.ts` followed by an unconditional `createLiquidGlassCursor();` call] A portfolio row can use the exact same auto-init script tag rather than reimplementing anything.

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topics: none. [`gh api repos/jassuwu/liquid-glass-cursor`]
- npm: latest published version **`0.2.0`** (versions on registry: `0.1.0`, `0.1.1`, `0.2.0`), package created 2026-03-09, last modified 2026-04-24. Weekly downloads: **8**. [`registry.npmjs.org/liquid-glass-cursor`; `api.npmjs.org/downloads/point/last-week/liquid-glass-cursor`]
- The README also links a separate hosted demo, `liquid-glass-cursor-demo.vercel.app`, distinct from the project's own `link` (`liquid-glass-cursor.jass.gg`) in the site data — not independently checked in this pass since the primary `link` already self-demos.

**Reusable assets.** The npm package itself (`liquid-glass-cursor`, unpkg-servable, auto-initializing, zero dependencies) is a directly importable, working asset — no reimplementation needed for a portfolio entry to show the real effect.

---

## subway-cursors

**What it does.** A VS Code/Cursor extension: Cursor's `beforeSubmitPrompt`/`afterAgentResponse` hooks (`~/.cursor/hooks.json`) fire small shell scripts that `curl` a localhost HTTP server the extension runs; the extension reveals a `WebviewPanel` containing an iframed HTML5 game and `postMessage`s `pause`/`resume` to it. The actual game is **not shipped in the repo** — `game/` is explicitly gitignored because Subway Surfers is DMCA-able, and the README instructs users to "bring your own HTML5 build" and patch in a provided pause-shim script. The interesting engineering: faking `document.hidden`/`visibilitychange` does nothing to this particular game build, so the shim instead synthesizes a single `Escape` keydown (the game's actual internal pause hotkey, reverse-engineered from its minified bundle) dispatched to exactly one target (multiple targets double-toggle pause/resume). [github.com/jassuwu/subway-cursors README](https://github.com/jassuwu/subway-cursors)

**Signature visual/interaction.** The game panel auto-pausing/resuming in sync with agent think-time, shown in the repo's own `demo/sc-demo.gif`. [github.com/jassuwu/subway-cursors README]

**Honest 5-second demo.** No honest demo exists for the portfolio. There is no `link`/live site for this entry (confirmed: `homepage: null` on GitHub, and `src/data/projects/subway-cursors.md` has no `link` field, only `github`). [`gh api repos/jassuwu/subway-cursors` → `"homepage":null`; `src/data/projects/subway-cursors.md`] The only visual artifact is `demo/sc-demo.gif`, which shows the actual copyrighted Subway Surfers game running — the same DMCA concern the author explicitly avoided by gitignoring `game/` applies just as much to reusing this GIF in a public portfolio.

**Numbers.**
- GitHub: 0 stars, 0 forks, 0 watchers, 0 open issues, topics: none, `homepage: null`. [`gh api repos/jassuwu/subway-cursors`]
- 0 GitHub releases (not published to the VS Code/Cursor marketplace — installed manually via a locally-built `.vsix`). [`gh api repos/jassuwu/subway-cursors/releases`]
- `demo/sc-demo.gif` is **32,926,834 bytes (~31.4 MB)** — by far the largest single asset found across all eleven repos. [`gh api repos/jassuwu/subway-cursors/contents/demo`]
- npm: not applicable (VS Code extension, not published anywhere).

**Reusable assets.** None safe to reuse directly — the one demo asset that exists depicts the same copyrighted game the author deliberately excluded from version control elsewhere in the same project, for the same legal reason.

---

## Cross-cutting corrections worth flagging up front

- **`ass`** is not a joke/static page — its own `package.json` and `src/` tree describe a real Three.js soft-body-physics + foley-audio interactive toy ("slap the specimen"), confirmed by direct inspection of the repo's file structure, not by the one-line description or the empty-looking static HTML.
- **`onandemo.js`**'s README claims the npm publish is "imminent" — it has actually been live on npm since 2026-06-12 (`onandemo@0.0.2`), just under-promoted in the README.
- **`mojify`** has zero npm presence under its own name; the npm package literally called `mojify` belongs to an unrelated third party (`michaelscofield`, "Transform emojis into text") — do not cite its 4 weekly downloads as jassuwu's.
- **`subway-cursors`** and **`skills`** have no live `link` at all (checked against `src/data/projects/*.md` directly) — any demo design for those two categorically cannot be "visit the live site."
- Two projects (`savemefrom`'s Vergil clip, `subway-cursors`' Subway Surfers GIF) carry real, unresolved IP exposure in their most visually distinctive asset — both already flagged by the projects' own authors (gitignoring `game/`, at minimum) — worth surfacing to whoever designs demos next, not something to route around silently.
