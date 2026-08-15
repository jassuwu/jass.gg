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
  "i build a lot of toys, occasionally useful things. im on twitter releasing & watching what's releasing every day. i love doing work that has 0 user impact, but 100x the dev's lives. im excited about & scared of my agents, mostly the former.";

/**
 * THE CLOSER SLOT IS OPEN, AND IT IS DELIBERATELY EMPTY RATHER THAN FILLED.
 *
 * It held "i also love video games, but i don't get to play them as much now.
 * gimme an excuse and join me for a sesh?" — cut by jass. Splitting it into its
 * own paragraph fixed how it sat on the page but not what it was doing.
 *
 * What he wants there instead, in his words: something that "forms a connection
 * between me and the reader", so that "people who like things i like" end up in
 * his circle. What he does not want is asking for a follow, which he calls
 * cringe, and he is right — an ask is a transaction, and it arrives before the
 * reader has decided they care.
 *
 * Two constraints for whoever writes it, jass included:
 *
 * 1. It goes ABOVE the socials row, in the paragraph slot at `mt-5`. The row is
 *    six unlabelled words and no reason. One line above it turns a list of links
 *    into an invitation without a single word of asking — the mechanism is
 *    already on the page, it just has no reason attached.
 *
 * 2. `/404` already solves this exact problem in his voice: "just talk to me",
 *    then "(pls no one talks to me 😔)" in the hand font. It states the want and
 *    undercuts it in the same breath, and it is warm rather than needy. The
 *    self-awareness is what removes the cringe. Whatever lands here should be in
 *    that register, and it should not repeat that joke.
 *
 * Nothing renders in this slot until he writes it. An empty slot is honest; a
 * placeholder closer would be the writing section all over again.
 */

/**
 * What search results and link previews show. It is the intro's first sentence,
 * taken rather than restated, so it cannot drift from the paragraph it is a
 * sentence of. Safe on this copy specifically: it is plain lowercase prose with
 * no abbreviations, so the first ". " is the first sentence break.
 */
export const TAGLINE = `${INTRO.split(". ")[0]}.`;
