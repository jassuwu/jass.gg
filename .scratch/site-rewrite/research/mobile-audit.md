# Mobile audit: what the phone actually gets

Date: 2026-08-22. Method: iPhone 12 Pro viewport (390×844) against the dev
server, geometry computed from the live DOM; code audit of `friend.ts` and
every demo (codex-investigate pass, cited below); build measured from `dist/`.

The instigating ruling (jass): *"middle of the scroll view initiating actions
is not it at all. it's confusing. i think for mobile it has to be on click."*
This file is the inventory of everything else that's wrong, so the redesign
fixes the disease and not one symptom.

## The mechanism findings (friend.ts)

The touch path is scroll-dwell: an `IntersectionObserver` with rootMargin
`-35% 0px -35% 0px` collects acts whose element rests in the viewport's
middle 30%, and a 400ms scroll-settle timer fires them. Four structural
faults, all measured on a 390×844 viewport where the page is 1369px tall and
the band is absolute y 295–549 at load:

1. **No arbitration — the band fires everything it holds at once.**
   `inBand.forEach(run)` (`friend.ts:107`). The band is ~254px tall; entry
   rows are ~30px. Pausing mid-list puts 4–8 acts in the band and one settle
   fires them all simultaneously. On pointer, dwell is per-element — one act
   at a time, chosen by the cursor. On touch the friend does its whole
   repertoire at once. This alone is jass's "confusing."

2. **The band has dead zones covering 43% of the page.** On a viewport of
   height H, the first and last ~0.35·H of the page can never rest in the
   band — at 844px that's the top and bottom 295px of a 1369px page. The
   wordmark (y≈70) and the footer (y≈781 at max scroll; band ends at 549)
   are both permanently outside it. Today that costs the **re-sign** (the
   signature's dwell act — the load signing is inline and survives; the
   *repeat* is what touch can never summon) — and it forecloses the future:
   no leaving-beat act (ticket 19's room) can ever ride scroll-dwell,
   because the footer is unreachable by construction.

3. **Acts fire uninvited on load.** The closer (absolute y≈358) is inside
   the band the moment the page opens; 400ms later the closer sweep performs
   with zero user input. An act that plays before the reader has done
   anything is not a friend waiting for a beat — it's an autoplaying ad.

Also mechanism-adjacent:

- **`deliberate()` exists and is nearly unused.** The tap path the grammar
  promised ("description-tap as the deliberate path") was never wired: no
  demo registers a deliberate handle. The only tap the site answers on a
  phone is a link navigation.
- **`hover: hover` is the branch condition.** Correct on real phones
  (`hover:none`), but note iPads with trackpads and desktop touchscreens
  report `hover:hover` and take the dwell path — acceptable, but record it.

## The affordance findings

- **Hover is the only "this row is alive" signal, and hover doesn't exist.**
  Link hover accent, the description's `group-has-[a:hover]` foreground
  shift — every affordance that says *something is here* is `:hover`-gated
  (`index.astro`, `global.css`). A phone reader has no way to know any row
  performs. The desktop site whispers "poke me"; the mobile site is inert
  text.
- **Tap targets are 23px tall.** Entry links measure ~23px against the
  ~44px platform guideline. Inline text links are a normal exception, but
  if the description becomes the demo's tap handle, a 23px-tall handle wants
  deliberate padding (`::after` hit-area, not visual change).

## The per-detail findings

All eleven interactive details, read in full (audit run by fable, aug 22 —
the codex pass was cancelled, sub expired). "Touch today" = what a real
phone gets under the current scroll-dwell registration.

| detail | registration | touch today | verdict material |
| --- | --- | --- | --- |
| signature signs (load) | inline script, `Wordmark.astro` — `sign()` at parse if not reduced | **works** — signs on arrival like desktop | safe; not a friend act |
| signature re-sign + scratch | `ambient` on the svg (`Wordmark.astro`) | **unreachable** — top dead zone | needs a tap summon (tap the wordmark?) |
| agents gag (ghost cursor) | `ambient`, `once`, on the runtime-wrapped word (`agents-gag.ts:244`) | fires uninvited when the intro rests in band; **any touch kills it** (`pointerdown` → `done()`, `agents-gag.ts:139`) — the reader's scroll-stopping tap is a pointerdown, so on a phone the bit dies the moment it's noticed | a ghost *cursor* on a cursorless device — port, replace, or desktop-only is a real question |
| closer sweep | `ambient` on the aside (`closer-sweep.ts:37`) | **fires uninvited ~400ms after load** (aside sits in the band at 390×844) — the prime "confusing" suspect | tap the murmur = sweep is a natural port |
| andrew-dictate song | `ambient` (`andrew-dictate-song.ts:27`) | sound-only act from a scroll pause: an unexplained hum (post-unlock) with zero visible cause | tap wants a visible handle; audio legal on tap |
| quilt graph | `ambient`, `still` same (`quilt.ts:129`); 4s hold exists *for* touch (no leave) | fires on scroll pause; graph renders at `min(100vw−2rem, 50rem)` = **358px on a phone — a year of contributions at postage-stamp scale** | tap port easy; the size needs its own answer (rotate? crop to recent months? full-bleed?) |
| onandemo cat | `ambient` (`onandemo-cat.ts:230`); has a real touch branch — synthetic cursor, timed walk, silent by geometry | **the one demo with a genuine touch form**, but it still launches from a scroll pause, and shares the all-at-once firing | port the walk to tap; the work is already done |
| ass slap | `ambient` (`ass-slap.ts:96`) | synthesized thwack from a scroll pause — unexplained sound, no visible cause | the most tap-native act on the site: a slap toy that you tap |
| liquid-glass takeover | gated out: `hover:hover` + Chromium only (`liquid-glass.ts:410-411`) | **not registered — row is inert on touch**, by explicit decision in code ("no cursor to replace") | already desktop-only; ticket 25 confirms or overturns |
| vergil cut | `ambient` (`vergil-cut.ts:295`) + its own duplicate band observer for cooldown/preload | **a full-page slice + full-tier audio from a scroll pause** — the most violent uninvited act; chain-cut guarded but the first cut needs no consent | tap the row's description = judgment cut on demand; sound finally legal |
| toys wobble | bypasses friend.ts: per-letter `pointerenter`+`pointerdown`, `touch-action: manipulation` (`toys-wobble.ts`) | **already tap-native and correct** — tap a letter, it swings and dings (post-unlock) | the existing proof that tap acts work; the grammar's reference specimen |
| 404 water | fuse + sim; `pointermove` disturbs the surface (`water-404-sim.ts:361`) | rise, tears, drain all work; finger-drag disturbance partial (pointermove ends at `pointercancel` when scroll takes the gesture) | fine; minor: surface-poke could listen to touchmove |
| 404 brainrot | muted inline video | works (verified in preview: 273×154, playing) | fine |

Cross-cutting:

- **The sound bus wakes on any `pointerdown`** (`sound.ts` — capture-phase
  listener), so the first tap anywhere unlocks audio for the visit; every
  act that fires *before* any tap is silent by the gate. On a phone under
  scroll-dwell, acts routinely fire before any tap has ever happened —
  vergil cuts in silence, the slap is mute — so **the current mobile
  experience runs acts with their sound stripped**, which is half the craft
  deleted. Tap-initiation makes the trigger and the unlock the same gesture.
- **The mute egg is not wired** (`Footer.astro:72` — cut; dev seam only), so
  there is nothing to reach on any device. If sound gets a real mobile
  presence, the mute affordance question reopens with it.
- **The 2am murmur is static** (clock-gated at load, `Footer.astro`), not a
  friend act — unaffected by the grammar change.
- **`vergil-cut.ts` duplicates the friend's band constant** (`-35%`,
  `vergil-cut.ts` register()) for its cooldown — when scroll-dwell dies,
  this private observer must die with it or the preload/cooldown logic
  silently keeps a scroll dependency.

## Layout at 390px

- **No horizontal overflow anywhere** on `/` or `/404`. The closer's aside
  wraps to its own line below the sentence (the nowrap pair fits because the
  aside breaks as a unit, not mid-phrase). Body 18px holds.
- **The quilt graph is clamped to the 342px column** — a year-wide
  contribution SVG at 342px is decoration, not proof. The desktop "spill
  past the column" move has no mobile answer yet.
- **404 is structurally fine**: brainrot video 273×154 plays muted inline,
  water canvas sizes to viewport. Touch input assumptions in the sim: see
  codex section.

## The payload findings

- Total built JS across the site: **~44KB** (index bundle ~18KB + sound
  1.9KB + demo chunks). Not the problem.
- Brainrot clips are **1–2.9MB each**; one per 404 visit, poster jpgs
  20–30KB. Acceptable, worth a `preload="none"`-style check on cell data.
- Sounds: andrew-dictate 28KB, nya 3.5KB, vergil.m4a 17KB. Trivial — the
  question is *whether they may play at all* from a given touch trigger
  (user-activation rules: see `touch-grammar.md`).

## External platform facts

See [`touch-grammar.md`](touch-grammar.md) — user-activation rules for
audio, hover-emulation quirks, tap-affordance patterns, haptics support.
