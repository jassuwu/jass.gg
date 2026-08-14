# Build the reference homepage

Type: prototype
Status: open
Blocked by: 02, 03, 04, 06, 07
Absorbs: 05 (the marginalia reveal — see "Stage two" below)

## Question

Build the real homepage, on the real scaffold, with the real content — and iterate with jass until he signs off.

**This ticket is the destination.** Everything before it exists to make this one buildable in a single sitting; everything after it is mechanical.

Constraints, all previously settled:

- Rung-2 plain: no cards, no badges, no thumbnails, no hero.
- The typography system from ticket 03, at the exact values it settled on.
- The content inventory from ticket 06, in the taxonomy it settled on.
- The routes and link behaviour from ticket 07.
- **No micro-interactions at all in the first pass** — see the two stages below.
- Works fully with JavaScript disabled. Light and dark both.
- Neutral + lime, lime reserved.
- Baskervville has no bold (ticket 03). Hierarchy comes from size and space, or it moves to the machine font. Designing around a bold that doesn't exist is the easiest way to waste an evening here.

How to run it:

- **One direction, iterated with jass in the loop.** Not a spread of options to choose between — that's what produced 20 rejected demos in July. If a fork appears, put it to jass and take one branch.
- Show it in a browser, not as a diff. It's judged on how it looks and feels, not on how it reads as code.
- Judge every iteration against the thesis: plain _because_ considered. If a change makes it look more designed, it's the wrong change. If a change makes it look careless, it's also the wrong change.

## Stage one — build it plain

No micro-interactions. None. Real content, real type, real routes, and nothing that responds to the reader beyond a link.

Then look at it with jass. This state is the honest test of the thesis: **if the page only works once details are added, it was never plain-because-considered — it was plain-and-thin with decoration bolted on.** A page that already reads as tended at this stage is the thing worth adding to.

## Stage two — add only where it's dead

From ticket 04: the number of details is an _output_ of looking at a real page, not an allocation made in advance. So find the specific places stage one feels dead, and add only there.

The leading candidate is jass's own strongest idea, absorbed from ticket 05 — **the marginalia reveal**: the site looks like static HTML, but hovering one specific word or phrase brings a meme to life, contextual to the sentence around it. The reference feel is a video editor cutting to a meme on the beat. Before it goes in, settle:

1. **CSS-only feasibility.** Hover, focus and `:has()` carry a lot. Where's the wall? What does it degrade to with JS off — which is the default state, not the edge case?
2. **Touch and keyboard.** Hover doesn't exist on a phone, and most readers arrive on one. Is this a desktop-only reward — defensible, since it _is_ a reward, not content — or does it need a tap/focus path?
3. **Is the marked word marked?** Marking it is discoverable but reads as "look at my feature". Not marking it means almost nobody finds it. This is the plain-vs-considered tension in miniature; decide it deliberately.
4. **Does it live in Excalifont?** The hand role (ticket 03) was designed for exactly this.
5. **How many?** One is a secret. Five is a mechanic. Ten is a theme site.
6. **Cost per instance.** If each is a hand-authored bespoke moment, how long is one, and does that survive a two-week appetite?

Already settled and not up for re-litigation here: the progressive blur is out, the live signal is a build-time "last touched" stamp rather than a clock, and links stay as the lime underline with no hover choreography.

Done when jass says _that's it_. The answer records what shipped, plus anything cut during iteration and why — the cuts are what the follow-on build effort needs to know.
