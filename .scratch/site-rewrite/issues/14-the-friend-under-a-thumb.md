# The friend under a thumb

Type: prototype (HITL)
Status: built (aug 22) — the tap grammar is in friend.ts and live on the
page; keyboard is the open remainder
Blocks: 15 (entries demo themselves), 16 (the intro comes alive)

## Question

What is the friend's grammar on every input? This is the mechanism ticket —
the site's first real JavaScript — and it blocks every interactive detail
behind it, because a bit that only works under a mouse repeats the mistake
ticket 11 diagnosed: the audience arrives from twitter on phones, and until
now the site's entire interaction budget was hover-gated.

## To settle, on a real phone width

1. **The dwell threshold on pointer.** The friend waits for the beat — a
   reveal that fires on instant hover is a soundboard. How long is the beat?
   Measure candidate thresholds on the real page.
2. **The touch translation.** What is dwell under a thumb? Candidates:
   long-press (discoverable? fights the OS context menu?); the row resting in
   the viewport's middle band while scrolling pauses (scroll-dwell); first
   tap performs, second tap navigates (dangerous: breaks the link contract).
   This must be settled against the hard fact that **entry names are links**
   — on touch, a tap navigates, and nothing may break that.
3. **Where a demo lives on a phone** if not under the cursor — the row
   itself? the margin doesn't exist at 390px.
4. **The no-repeats memory.** A friend never does the same bit twice. Per
   page-load, or per visit (sessionStorage)? What does "twice" mean for an
   ambient demo vs a one-shot gag?
5. **Reduced-motion policy for friend acts.** The standing pattern: the
   affordance survives, the travel goes. But most friend acts ARE travel.
   Decide the rule once, here, so tickets 15/16/18 inherit it.
6. **The budget.** One small module, no framework, no dependency. Measure the
   bytes; the beacon is 2.8 KB and it should stay the second-largest script.

## Settled (grilling, aug 15) — build to this, don't re-decide

- **Touch grammar: scroll-dwell for ambient acts** (a row performs when it
  rests in the viewport's middle band while scrolling pauses) **plus
  description-tap as the deliberate path** (the name always navigates; the
  description is the demo's handle). No long-press anywhere.
- **Pointer dwell starts at 500ms** and gets tuned on screen — a feel call,
  not a spec call.
- **Repeats:** one-shot gags play once per **visit** (sessionStorage);
  ambient demos repeat freely on re-dwell.
- **Reduced motion:** acts that are motion vanish; acts with an honest static
  form show the static form.

## Deliverable

The dwell/act mechanism working on the real page with one throwaway demo
wired to it, judged by jass on his actual phone. The throwaway gets deleted;
the grammar and the module stay.

## Reversed (jass, aug 22) — scroll-dwell is dead

jass, from his phone: *"middle of the scroll view initiating actions is not
it at all. it's confusing. i think for mobile it has to be on click."*

Scroll-dwell was the settled touch grammar and it did not survive contact.
The audit ([research/mobile-audit.md](../research/mobile-audit.md)) found the
failure is structural, not a tuning problem:

- No arbitration: one scroll settle fires **every** act resting in the band
  at once (`friend.ts:107`) — 4–8 rows fit the band on a phone.
- The band's geometry makes the top and bottom ~35% of the page dead
  zones (43% of the page at 390×844): the signature's **re-sign** can never
  fire on a phone (the load signing is inline and survives), and any future
  footer act could never fire — the footer is unreachable by construction.
- Acts that fire before the reader's first tap play **with their sound
  stripped** (the bus's gate needs a real gesture), so mobile has been
  running half-mute performances. Tap-initiation makes the trigger and the
  audio unlock the same gesture.
- The closer sits in the band at load, so its sweep plays uninvited 400ms
  after the page opens.

**The touch grammar is now TAP.** The open question this ticket returns to:
what does tap-as-grammar concretely mean —

1. **The handle.** Description-tap was already settled as the deliberate
   path and never wired (`deliberate()` has zero call sites). Is the
   description the one handle everywhere? What's the hit area (23px text
   wants padded hit targets, not visual change)?
2. **The affordance.** Every "this row is alive" signal today is
   `:hover`-gated — a phone reader can't tell any row performs. What marks
   a performing row on touch, within the no-decoration thesis? One
   consistent mark, or discovered-by-accident?
3. **Arrival and leaving on touch.** Dwell-beats that made sense positionally
   (wordmark at top, footer at bottom) need touch translations that aren't
   scroll-position — first touch anywhere? load? tap on the wordmark itself?
4. **Audio legality.** A tap is a user gesture, so tap-initiated acts may
   legally start sound — scroll-dwell couldn't. The tap grammar un-breaks
   ticket 21 on mobile; keep the sound bus's unlock tied to the tap.
5. **Repeats and reduced-motion** carry over unchanged (once-per-visit for
   gags, still-forms for reduced motion).

~~Blocked by: 24~~ — **resolved aug 22; build to its constraints**
([resolution](24-touch-grammar-facts.md), [full facts](../research/touch-grammar.md)):
acts fire on the up-event (tap = `pointerup`/`click`, never `pointerdown`);
the bus's wake listener moves off `pointerdown` (on touch it grants no
activation and a scroll's `pointercancel` strands a suspended context);
gated calls run synchronously in the handler (transient activation ~5s);
branch on `(hover: hover) and (pointer: fine)` — iPads are touch; hover
styles stay inside `@media (hover: hover)` (sticky :hover); no
first-tap-hijack — name navigates, description performs, as separate
targets; no long-press, no haptics.

Deliverable unchanged: the mechanism working on the real page, judged by
jass on his actual phone.

## Audit additions (aug 22) — the rebuild's scope grows three ways

From [site-audit.md](../research/site-audit.md):

- **Keyboard is an input class** (§7). No act on the site is reachable by
  keyboard — `ambient()` arms only pointerenter/IO, `deliberate()` has no
  callers. The tap grammar's handle should also be focusable and fire on
  Enter/Space; `deliberate()` on a focusable handle gets this nearly free.
  (WCAG 2.5.2: activate on the up event — same rule the touch research
  already set.)
- **One act at a time is a grammar rule, not a per-act flag** (§3, the
  takeover/vergil collision). Scroll-dwell's all-at-once firing dies with
  it, but pointer overlap (halo + adjacent dwell) proves the arbiter
  belongs in friend.ts, not in each demo's `running` flag.
- **Mechanism bugs to fix in the rebuild** (§P3): `armDwell` timer
  clobbered by a second pointerenter on hybrid devices (act fires twice);
  agents-gag's `done()` can wipe a reader's own just-started selection;
  music-to-my-ai's pointerdown-ends-it meets the same "a tap kills the bit
  it summoned" problem agents-gag has — under tap grammar, the ending
  gesture needs to be distinct from the summoning one.

## Landed early (aug 22, the fix pass)

Two pieces of this rebuild shipped ahead of the grammar session, because
they were plain bugs: **the bus wakes on `pointerup`** (the event that
actually grants activation; a scroll's `pointercancel` can no longer
strand a suspended context), and **the arbiter exists** — `occupy()` in
friend.ts, one act at a time, claimed by both takeovers. The rebuild
inherits both; what remains here is the tap grammar itself: the handle,
the affordance, arrival/leaving, and keyboard as an input class.

## Settled and built (aug 22, the grammar session) — the answers

- **The handle is the description, everywhere.** `entry()` in friend.ts —
  the wired successor to the never-called `deliberate()` — gives every
  act-bearing row both doors: whole-row dwell at 500ms on hover devices,
  and a click or tap on the description that starts the act *immediately*,
  no dwell wait, because a tap already is the wait. On touch the tap is
  the only entry. The name's `<a>` is never touched; a tap on the name
  navigates, always, on every device.
- **The affordance is the cursor.** Registration marks the row `data-acts`
  and global.css gives its description `cursor: pointer` plus the hover
  lift — from CSS rather than markup, because an act may refuse its row at
  runtime and only registration knows. The bare rows (better-splitwise,
  skills, subway-cursors) get no handler, no cursor, no marker: a pointer
  over a row with nothing behind it would be the first lie on the page.
- **Scroll-dwell is deleted, not deprecated.** `armScrollDwell`, the IO
  band, and vergil's private copy of it are all out of the code; scroll
  position initiates nothing, anywhere, and nothing is left to reactivate
  by accident. The doc block in friend.ts says "do not rebuild it" so the
  next session doesn't have to relearn this on jass's phone.
- **The trigger and the audio unlock are the same gesture**, as the audit
  wanted: a tap that starts an act is a real activation, so tap-borne acts
  play whole. (What the *dwell* path does about pre-gesture silence is
  ticket 21's murmur exception, mechanically housed here.)
- **The click path ignores `once` on purpose** — consent means it may
  repeat. Dwell keeps the once-per-visit memory; reduced motion keeps the
  still-form rule; both unchanged from the aug 15 settlement.
- **The exits are one implementation** — `easyOut()` in friend.ts,
  recorded properly in ticket 22: entry gesture swallowed, Escape and a
  click anywhere always end it, natural outs stay each act's own.
- **Keyboard stays open.** Escape already ends any takeover (the shared
  out), but the handle is a span with a click listener, not a focusable
  target — Enter/Space per the audit's §7 is the remainder, not forgotten,
  just not this pass.

Ports of the nine hover-built acts onto this grammar are ticket 25's
session with jass, act by act, on his actual phone.
