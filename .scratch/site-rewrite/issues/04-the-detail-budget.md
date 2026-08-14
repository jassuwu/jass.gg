# Set the detail budget

Type: grilling
Status: open

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
