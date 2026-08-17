/**
 * The intro paragraph, and the one-line description derived from it.
 *
 * COPY IS JASS'S, VERBATIM. It was written by him and reproduced exactly. One
 * spelling was corrected ("everyday" to "every day") and nothing else. Do not
 * "improve" it and do not restore any earlier version.
 *
 * It is doing four jobs at once and it is worth not breaking any of them: its
 * first two nouns are the two sections below it on the page, the third sentence
 * is the only one about paid work, the agents line is the only sentence on the
 * site that says how jass thinks, and "every day" is the only claim of currency.
 *
 * There used to be a fifth job — an invitation — and it is gone for now. The
 * closer that replaces it is an open question; see the block below INTRO.
 *
 * The work sentence was added later, in jass's words, and it is the only thing
 * here about his job. The site had nothing at all on that, which left a visitor
 * who liked the toys with no idea what he does for a living. It says taste
 * rather than credentials on purpose: no years, no titles, no employers. Those
 * live on the resume, which is a different document for a different reader.
 *
 * ORDER. The paragraph runs: what he ships in public, then where he ships it,
 * then what he values in the work he is paid for, then how he thinks about the
 * tools. Public, then private — the personal turn that used to end it was cut,
 * and the closer that takes its place belongs after this paragraph, not inside
 * it. That was the lesson of the version that got cut.
 *
 * The work sentence sits third and not second because it belongs next to the
 * agents line. Agents are the clearest current case of a tool that costs a user
 * nothing and changes a developer's day, so the two sentences argue the same
 * thing and the second one lands harder for following the first. Second place
 * also split "toys" from "twitter", which are one thought.
 *
 * The work sentence cannot go first: the first sentence feeds TAGLINE below, so
 * moving it would silently rewrite the meta description and the /llms.txt
 * summary. It should not go last either; the end of the header belongs to a
 * closer aimed at the reader, not to another claim about jass.
 *
 * The resume's summary states the same belief in its own register. That is two
 * copies of an idea, which is a real cost, and it is accepted because they are
 * deliberately different sentences for different audiences rather than one
 * sentence maintained in two places. If the belief ever changes, both change.
 * The failure this file exists to prevent is the old meta description reading
 * "fullstack web/app dev", a restatement nobody owned; a resume line and a
 * homepage line that disagree would be that failure returning.
 *
 * It lives here rather than inside the page because three things quote it now —
 * the page, the meta description, and `/llms.txt` — and a second copy of jass's
 * words is a second copy that can go stale. The old site had exactly that: a
 * meta description reading "fullstack web/app dev", a phrase that appeared
 * nowhere on the page, maintained by nobody.
 */
export const INTRO =
  "i build a lot of toys, occasionally useful things. im on twitter shipping & watching what's shipping every day. i love work that has 0 user impact, but 100x the dx. im excited & scared of my agents, mostly the former.";

/**
 * THE CLOSER. Two lines, and they are one move — do not ship either alone.
 *
 * It replaces "i also love video games, but i don't get to play them as much
 * now. gimme an excuse and join me for a sesh?", which jass cut. What he wanted
 * instead, in his words: something that forms a connection with the reader so
 * that people who like what he likes end up around him — without asking for a
 * follow, which he called cringe and which he was right about. An ask is a
 * transaction, and it arrives before the reader has decided they care.
 *
 * CLOSER IS AN OFFER, NOT A REQUEST, and that is why it works. It gives the
 * reader attention rather than asking for theirs, and it is already true of him
 * — INTRO says he watches what's shipping every day. It also filters by
 * activity: someone who builds reads it and feels seen, someone who doesn't
 * quietly isn't the audience. That is the filter jass wanted. An earlier draft
 * said "exclusive circle", which filters by permission instead, and that is the
 * version that would have repelled exactly the people he was hoping for.
 *
 * IT NEEDS NO CALL TO ACTION because the socials row sits directly beneath it.
 * Six links, previously unlabelled — a list with no reason attached. This line
 * gives them the reason, and the row finishes the sentence: so show me, here is
 * where i am. An earlier draft ended "so reach out pls", which asked for the
 * thing the six links were already offering.
 *
 * CLOSER_ASIDE is the `/404` move on a different axis. There, "just talk to me"
 * is punctured by "(pls no one talks to me 😔)" — the offer, then the admission
 * that it does not work, in a quieter voice. You cannot feel sold to by someone
 * who just told you nobody is buying. Repeating that joke here would turn a
 * voice into a tic, so this one deflates by admitting the MOTIVE instead: the
 * quiet true reason under a line that would otherwise be pure generosity.
 *
 * "just" is the whole tone and must survive any edit. "im tryna to find ma
 * ppl" is a plan. "im JUST tryna to find ma ppl" is a confession, and only
 * the second one is warm.
 *
 * The aside deliberately does NOT restate who — CLOSER already filtered. Two
 * lines doing the same filtering would be one line's work done twice.
 *
 * LENGTH IS A HARD CONSTRAINT, measured not guessed. The two run on ONE LINE
 * now, at 11px against the closer's 18px, and the pair is 406px against a 624px
 * desktop column — comfortable. It cannot fit 390px mobile at any size (the
 * closer alone is 221px of the 342px available), so the aside is `nowrap` and
 * drops whole to a second line there. That is the wrap being chosen rather than
 * suffered.
 *
 * jass's first version — "i just want people who like things i like to be in my
 * circle" — was 511px at 18px, and even trimmed to "...things i like" it was
 * 356px. Shrinking to 11px bought room, but not licence: anything written into
 * this slot must be measured, not eyeballed, and a two-line murmur is not a
 * murmur.
 */
export const CLOSER = "i'd like to see what you ship.";

/**
 * See CLOSER. Rendered inline after it in the hand font at `text-micro` and
 * `accent-quiet`. The 11px-against-18px size gap is what makes it an aside —
 * it used to be a separate paragraph, which made it a second statement instead.
 */
export const CLOSER_ASIDE = "(im just tryna to find ma ppl)";

/**
 * THE VIEW SOURCE COMMENT. Empty until jass writes it, and it must be his —
 * the copy rule has no exception for copy nobody renders.
 *
 * The slot: this audience opens devtools on a site this deliberately plain,
 * because the plainness is the puzzle. The comment is wit placed where nobody
 * puts wit — zero JS, zero rendered bytes, found only by someone who went
 * looking, which makes it the purest easter egg the site can hold.
 *
 * It ships as the first thing inside <body> (see Layout.astro), so the reader
 * meets it right after scrolling past the machine tags in the head. Deadpan,
 * nothing explaining it — same register as the rest of the site.
 *
 * Hard constraint: it cannot contain `--`, which terminates an HTML comment
 * early and would spill the rest onto the page. Em dashes are fine; double
 * hyphens are not.
 *
 * While this is `""`, nothing is emitted at all — the mechanism costs zero
 * bytes until the words exist.
 *
 * AGENT DRAFT — jass rewrites. He asked for a take to react to (grilling,
 * aug 15); this is it, and it ships until his words replace it. The first
 * draft listed the site's tricks and he killed it for explaining the jokes.
 * This one states nothing, which is the register.
 */
export const SOURCE_NOTE: string = "hi. it's mostly just html.";

/**
 * What search results and link previews show. It is the intro's first sentence,
 * taken rather than restated, so it cannot drift from the paragraph it is a
 * sentence of. Safe on this copy specifically: it is plain lowercase prose with
 * no abbreviations, so the first ". " is the first sentence break.
 */
export const TAGLINE = `${INTRO.split(". ")[0]}.`;
