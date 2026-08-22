# Site audit: everything else that wants improving

Date: 2026-08-22. Method: four parallel review passes (interaction-code
bugs, accessibility, build/SEO/delivery, content-truth/links) over a fresh
production build, plus first-hand checks (light-mode tokens, repo
visibility, stamp mechanics, branch drift). Every finding below was
verified against the actual file or a live HTTP response — no speculation
survived. Mobile grammar findings live separately in
[mobile-audit.md](mobile-audit.md); nothing here re-litigates them.

Overall verdict first: **the code is structurally strong** — the state
machines are unusually well-guarded for hand-rolled vanilla, the sound bus
is genuinely tight, reduced-motion coverage is comprehensive and centrally
enforced, JS-off is honestly whole, copy agrees with the README
byte-for-byte, and zero of 31 external links are dead. The real damage
clusters in four places: the takeover's geometry, the 404 water's
hardware manners, one delivery-layer mismatch, and one accessibility token
choice that defeats its own purpose.

## P1 — visibly wrong for real users

1. **The focus ring is invisible in light mode.** `global.css` §focus:
   `a:focus-visible { outline: 2px solid var(--color-accent-mark) }` —
   accent-mark is *unthemed* (that's its documented identity) and sits at
   **1.16:1 on white**. The CSS's own comment says this ring is "the whole
   of that affordance": links carry no resting decoration, so the ring is
   the only way a keyboard user locates anything. Light mode keyboard users
   get functionally nothing; WCAG 1.4.11 wants 3:1. Dark mode is fine
   (17.1:1). The token whose rule is "never text on white" was given the
   one job that is exactly that rule. → ticket 27.

2. **The takeover's entrance breaks its own illusion.**
   `liquid-glass.ts` — the package mounts with `cursor: none` immediately
   but renders its glass from (−9999,−9999) on a 0.15 lerp; the synthetic
   mousemove sets the *target*, not the position. Measured: ~300ms with no
   pointer on screen at all, then a glass arrow flying in diagonally from
   off-screen (~950ms to reach the hand). The code comment claims the
   synthetic move "closes the gap"; it does not. → ticket 22.

3. **The takeover's halo swallows the savemefrom row.** `HALO_Y = 56`
   against a measured ~33px row pitch, and savemefrom renders directly
   below liquid-glass-cursor. Reading downward: glass mounts → pointer
   moves one row down, still inside the halo (no exit) → dwell fires the
   vergil cut **under a live glass takeover** — arrows at z-max float over
   the slice, and any arrow found mid-cut calls the bus and **ramps the
   judgment cut to silence mid-swing**. No act checks whether another is
   live; this is the ordinary downward mouse path. → ticket 22.

4. **Every canonical URL points away from the site.** `astro.config.mjs`
   `site: "https://jass.gg"` feeds canonical/og:url/og:image/llms.txt —
   and the apex 307s to `www.jass.gg` on every path (verified live).
   Crawlers read a canonical that redirects; `resume.json` already says
   `www`, disagreeing with the site's own config. One-line fix once the
   address is chosen. → ticket 28.

## P2 — degrades meaningfully

5. **The 404 water reads a 30Hz display as a dying machine.**
   `water-404-sim.ts` load-shedding uses wall-clock frame delta
   (`raw > 0.025`), so at 30Hz (external monitors, low-power mode) every
   frame counts as slow: within ~8s the sim sheds to minimum quality and
   visibly flat-lines twice, on hardware doing no work. → ticket 23.

6. **The water rebuilds undebounced on resize — and iOS fires resize on
   scroll.** `onResize = () => rebuild()`: full typed-array + canvas
   backing-store realloc, surface zeroed. The iOS URL-bar collapse fires
   resize during ordinary scrolling → scrolling the 404 flat-lines the
   flood repeatedly. Desktop window-drag: ~60 canvas reallocs/s. Also:
   `dpr` is captured once — zoom or a monitor move leaves the canvas
   blurry for the visit. → ticket 23.

7. **No keyboard path to any friend act.** `ambient()` arms only
   pointerenter or IntersectionObserver; `deliberate()` (click — would be
   keyboard-viable on a focusable handle) has zero call sites. Every act on
   the site is unreachable by keyboard — distinct from the touch redesign,
   same rebuild. → folded into ticket 14 (keyboard is an input class).

8. **The stamp's definition of "touched" excludes the details.**
   `last-touched.ts` TRACKED = data/pages/layouts/styles — a new friend
   act (scripts/, components/) or a new sound (public/) doesn't move the
   date. And on a shallow CI clone, an empty `git log` result silently
   falls back to **build time**, the exact lie the stamp exists to avoid
   (`new Date("")` → NaN → `new Date()`). → ticket 29.

9. **The public repo ships the spoiler sheet.** The repo is public and
   `.scratch/` (33 tracked files) holds the full map, candid quotes, and a
   documented walkthrough of every hidden detail — including the
   liquid-glass puzzle's arrow positions — for exactly the audience most
   likely to read the repo. Might be the point ("the repo is part of the
   show"); should be a decision, not an accident. → ticket 30.

10. **404 reduced-motion fallback is pointer-only.** The click-to-play
    accommodation built *for* reduced-motion users adds `cursor-pointer` +
    click on a video with no tabindex — keyboard-only reduced-motion users
    get a permanently paused poster. Decorative (aria-hidden), so P2-low.

## P3 — recorded, fix when passing

- **Hybrid-device double-fire:** `armDwell` overwrites its timer on a
  second pointerenter (mouse resting + finger tap on touchscreen laptops)
  → act runs twice; vergil/cat saved by their own flags, slap/quilt not.
- **agents-gag `done()` can wipe the reader's own selection** — the
  pointerdown that starts a drag-select in the intro collapses into the
  same text node the gag checks for, and the guard can't tell "ours" from
  "theirs, one event old."
- **toys-wobble taps flam the marimba:** pointerenter+pointerdown both
  call `ding`; the kick dedupes, the note doesn't — second `play()` cuts
  the first note 0ms into its attack.
- **A dwell during the load-signing is swallowed** (wordmark): `signing`
  guard eats the act, and dwell won't re-arm until leave+re-enter.
- **liquid-glass memoizes a rejected import** — every later dwell logs an
  unhandled rejection; no `.catch`.
- **vergil clones put seven of every id in the document for 1.6s** — safe
  today only by tree order; any lookup during a cut retargets a clone.
- **quilt's error path leaves residue** (injected style + row class stay
  after the act retires).
- **Two acts are audio-only** (ass, andrew-dictate) — deaf readers get
  nothing on those rows; every other sound rides a visible act.
- **Discord constant still on `discordapp.com`** (301s to discord.com).
- **`muted-foreground` on white is 4.73:1** — passes AA with 0.23 to
  spare; no headroom if the token ever shifts.
- **Cache headers:** unhashed `public/` assets (og.png, resume.pdf) get
  `max-age=0` — a `vercel.json` headers block is a free win. robots.txt
  404s (inert, but free). No apple-touch-icon: the comment says "nothing
  asks for one" — iOS Add-to-Home-Screen does; the lime favicon designed
  to do the recognising loses that surface.
- **Vergil chroma key on WebKit is unverified.** Safari supports
  same-document `filter: url(#id)`, but complex SVG filters on a playing
  `<video>` are documented "sometimes fail silently" territory — if the
  filter drops, the act paints raw green-screen over the page. One real
  iPhone/Safari check settles it. (Sources: caniuse #3803, Apple filter
  docs.)
- **Light-mode vergil flash is ~invisible** (accent-mark at 0.85 over
  white ≈ 1.1:1) — possibly fine because the whiteout hands over to a
  white page; jass's eye to rule.

## Verified clean (don't re-audit)

Sound bus (gate/duck/mute/staleness all correct; null-cache is documented
intent) · no listener leaks in friend.ts (same-ref dedup) · one bus + one
friend module per page (bundle-verified) · reduced-motion coverage
comprehensive incl. the onandemo package's own gate · JS-off whole on both
pages · heading/landmark/time/lang semantics · viewport meta allows zoom ·
font strategy (4 preloads, swap, subsetting) · vergil.mp4/brainrot/sounds
all lazy, no orphans in dist · llms.txt exact vs source · README ↔ site
copy byte-identical (post-merge, 12/12 entries) · 31 links: 0 dead ·
quilt hotlink 200 in 0.27s · stamp value correct for this checkout ·
sitemap/JSON-LD absence is the right call · data-astro-cid attrs are
normal Astro scoping, not artifacts.

## Branch note

Production was 5 commits ahead of this worktree during the audit
(PR #9: music-to-my-ai + takeover grammar graduation). `origin/main` is
now merged in; music-to-my-ai was audited post-merge — it runs the same
dwell grammar (whole-page stream via `ambient()`), so it inherits the
mobile findings wholesale and joins ticket 25's inventory.
