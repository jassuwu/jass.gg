# Prototype the marginalia reveal

Type: prototype
Status: open
Blocked by: 03, 04

## Question

Can the meme-in-the-margin idea be built with no JavaScript, and does it feel like craft or like a gimmick?

jass's description: the site looks like a static HTML page, but hovering one specific word or phrase in a sentence brings a meme to life — a box appears, something happens to that word — creative, and related to the meme and the context around it. The reference feel is a video editor cutting to a meme at exactly the right beat.

Settle:

1. **CSS-only feasibility.** Hover, focus and `:has()` can carry a lot. Where's the wall? What does the fallback look like when JS is off — which is the default state, not the edge case?
2. **Touch and keyboard.** Hover doesn't exist on a phone, and most of jass's readers arrive from a phone. Is this a desktop-only reward (defensible — it's a reward, not content), or does it need a tap/focus path?
3. **The unit.** Is the marked word visually marked at all before interaction? Marking it is discoverable but reads as "look at my feature." Not marking it means almost nobody finds it. This is the plain-vs-considered tension in miniature — decide it deliberately.
4. **Does the reveal live in Excalifont?** The marginalia font role from ticket 03 was designed for exactly this. Confirm it works, or find what does.
5. **How many exist on the page?** One is a secret. Five is a mechanic. Ten is a theme site.
6. **Cost per instance.** If each one is a hand-authored bespoke moment, how long does one take, and does that survive a two-week appetite?

Build it with real copy from the actual intro paragraph, not lorem. Link the prototype from the answer.
