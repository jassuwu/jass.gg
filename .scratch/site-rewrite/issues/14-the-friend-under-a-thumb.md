# The friend under a thumb

Type: prototype (HITL)
Status: open
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
