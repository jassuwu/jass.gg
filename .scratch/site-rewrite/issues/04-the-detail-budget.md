# Set the detail budget

Type: grilling
Status: resolved

## Question

Which micro-interactions make the cut, and how many are there?

jass's constraint: *not a lot of small things — a specific small number of small things, each turned up to 100.* The budget is the whole design. Spend it wrong and the site is either bare or busy.

Fix a **number first**, then fill it. Candidates raised so far:

- **The marginalia reveal** — the site looks like static HTML, but hovering one specific word or phrase brings a meme to life: a box appears, something happens to the word, contextual to the sentence. jass's strongest idea. (Prototyped in ticket 05.)
- **A live element** — jass floated a local clock, represented creatively as a component rather than as a clock. Something that shows the page is tended rather than archived.
- **Link micro-interactions** — jass flagged this himself in the routing discussion. Do internal and external links behave differently, and is that difference a detail or a distraction?
- **A live self-made artifact** — the quilt SVG on the profile README already does anti-slop work for free, no JS.
- **The 404** — an existing invariant; jass named it as a characteristic that survives.
- **The progressive blur** — the other named invariant. Does it survive rung-2 plainness, or was it decoration after all?

Decide for each: in, out, or fold into another. Then rank the survivors — the highest-ranked one is what ticket 05 prototypes.

Hold the line on two things. Every candidate must work with JS disabled or degrade to nothing visible. And every candidate must survive the question *"would this read as trying?"* — the tell is content density, not placed cleverness.

## Answer

**There is no budget, and setting one up front was the wrong method.** This ticket's own framing — *fix a number first, then fill it* — is rejected.

jass: *"Why are we deciding this? We're not going to say okay I need at least two, let's go find what needs interactions. That's not how you're gonna do it. What has to be there first — and then we see if there are any micros that will make it worth it."*

He's right. Allocating a count and then shopping for things to fill it produces one good detail and one filler detail that exists to hit the number. The count is an **output** of looking at a real page, not an input to designing one.

### The method, inverted

Content (ticket 06) and architecture (ticket 07) settle what has to be on the page. Ticket 08 builds it **plain, with no micro-interactions at all**, and it gets judged in that state. Only then — looking at a real page that feels dead in specific places — does anything get added, and only where it earns it.

This is also the stronger test of the thesis. If the page only works once it has interactions, it wasn't plain-because-considered; it was plain-and-thin with decoration bolted on.

### Consequences for the map

- **Ticket 05 (the marginalia reveal) is folded into ticket 08.** It cannot be judged apart from the page it lives on, which is the whole point above. Its questions — CSS-only feasibility, touch and keyboard, whether the marked word is visibly marked, how many exist, cost per instance — move into 08 verbatim and are answered there. 05 is deleted as a standalone ticket.
- **Ticket 08 loses its "exactly the details in ticket 04's budget" constraint** and gains the opposite instruction: build it plain first.

### What was decided here anyway

The candidate list still needed pruning, and three of the six resolve independently of any count:

- **The progressive blur is out.** A gradient fade at the edges is decoration — it does an aesthetic job, not a functional one, and it's the one named invariant that fails *plain because considered*. It comes back only if something on the page genuinely overflows and the blur is signalling "more below". On a single text-first page, probably nothing does.
- **The live element is a build-time "last touched" stamp**, not a clock. Static, zero JS. A clock says *the code runs*; a date says *someone is here* — and it quietly punishes leaving the site stale, which is the actual failure mode this rewrite exists to address.
- **Links are already answered.** Ticket 03 settled the lime underline with inherited colour; that *is* the considered treatment. No hover choreography on top — it would spend effort on the most conventional element on the page. Whether internal and external links read differently is information architecture, and belongs to ticket 07.

Standing constraints for anything added later: it works with JS disabled or degrades to nothing visible, and it survives the question *"would this read as trying?"*
