# The invisible ring

Type: grilling + prototype (HITL, small)
Status: closed — resolved aug 22, fixed on this branch
Blocked by: nothing

## Question

The focus ring is the site's *entire* keyboard affordance (links carry no
resting decoration, by recorded decision) — and it's drawn in
`accent-mark`, the unthemed token whose defining property is **1.16:1 on
white**. Light-mode keyboard users get an invisible ring; WCAG 1.4.11
wants 3:1. Dark mode is fine (17.1:1). Full finding:
[site-audit.md](../research/site-audit.md) §1.

What does the ring become in light mode? Candidates, each with a cost:

- **`accent` (the themed text value, L=0.5 lime in light)** — stays lime,
  ~5:1 on white; but the accent budget is "exactly four things" and a
  focus ring would be a fifth. Is focus one of the four (it *is* "link
  hover" for the keyboard)?
- **`foreground`** — maximal contrast, zero accent spend; but a black ring
  reads as browser-default, not considered.
- **Keep accent-mark, add a contrasting inner/outer line** (two-tone ring)
  — survives both modes by construction; more visual weight.

Related, recorded here so it's judged in the same sitting:
`muted-foreground` on white is 4.73:1 — AA with 0.23 of headroom. Not a
failure; a tripwire if the token ever shifts.

## Resolution

**The ring takes `accent` — the themed strength.** In dark mode that is the
same value as accent-mark, so nothing changes; in light mode it is the
L=0.5 lime at ~5:1 on white. The accent-budget question resolved itself:
the focus ring is the keyboard's link hover, and link hover is already one
of the accent's four things — this is not a fifth. `global.css` updated
with the reasoning in place. The muted-foreground tripwire stays recorded
in [site-audit.md](../research/site-audit.md).
