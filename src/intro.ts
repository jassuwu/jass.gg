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
 * The fifth job — the invitation — moved out to ASIDE below. See the comment
 * there for why; the short version is that four sentences of work claims set an
 * expectation, and the two sentences that broke it were breaking it inside the
 * same block.
 *
 * The work sentence was added later, in jass's words, and it is the only thing
 * here about his job. The site had nothing at all on that, which left a visitor
 * who liked the toys with no idea what he does for a living. It says taste
 * rather than credentials on purpose: no years, no titles, no employers. Those
 * live on the resume, which is a different document for a different reader.
 *
 * ORDER. The paragraph runs: what he ships in public, then where he ships it,
 * then what he values in the work he is paid for, then how he thinks about the
 * tools. ASIDE then carries the human bit and the invitation. Public, then
 * private, then personal — the paragraph break falls exactly on that last turn,
 * which is why it works.
 *
 * The work sentence sits third and not second because it belongs next to the
 * agents line. Agents are the clearest current case of a tool that costs a user
 * nothing and changes a developer's day, so the two sentences argue the same
 * thing and the second one lands harder for following the first. Second place
 * also split "toys" from "twitter", which are one thought.
 *
 * The work sentence cannot go first: the first sentence feeds TAGLINE below, so
 * moving it would silently rewrite the meta description and the /llms.txt
 * summary. It cannot go last either; ASIDE holds that end now.
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
 * The human bit, and the invitation. Jass's words, unchanged — this used to be
 * the last two sentences of INTRO and not one character of it is different.
 *
 * IT IS A SEPARATE PARAGRAPH NOW, and that is the whole fix. It read as sticking
 * out, and the reason was structural rather than a fault in the writing. INTRO
 * is four sentences of the same kind of thing: assertive present-tense claims
 * about work, each adding information. These two break that twice over — the
 * only change of subject, the only concession ("i don't get to play them as much
 * now" is the one place the copy takes something back), and the only sentence
 * that addresses the reader at all.
 *
 * Four sentences is enough to establish a contract about what the paragraph is
 * for. Breaking it inside the same block reads as a stumble; breaking it across
 * a paragraph reads as a turn. Same words, and the pivot is now announced by the
 * white space instead of ambushing the reader mid-block.
 *
 * The concession is load-bearing, so do not "tighten" it away: not getting to
 * play is precisely why an excuse is needed, and without it the last sentence
 * has no setup. It is also the most relatable line on the site, which is what it
 * is here to be.
 *
 * It is NOT in TAGLINE and must not be — the meta description and the /llms.txt
 * summary are what someone reads before deciding to visit, and "join me for a
 * sesh?" out of context is not what that moment is for.
 */
export const ASIDE =
  "i also love video games, but i don't get to play them as much now. gimme an excuse and join me for a sesh?";

/**
 * What search results and link previews show. It is the intro's first sentence,
 * taken rather than restated, so it cannot drift from the paragraph it is a
 * sentence of. Safe on this copy specifically: it is plain lowercase prose with
 * no abbreviations, so the first ". " is the first sentence break.
 */
export const TAGLINE = `${INTRO.split(". ")[0]}.`;
