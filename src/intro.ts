/**
 * The intro paragraph, and the one-line description derived from it.
 *
 * COPY IS JASS'S, VERBATIM. It was written by him and reproduced exactly. One
 * spelling was corrected ("everyday" to "every day") and nothing else. Do not
 * "improve" it and do not restore any earlier version.
 *
 * It is doing four jobs at once and it is worth not breaking any of them: its
 * first two nouns are the two sections below it on the page, the agents line is
 * the only sentence on the site that says how jass thinks, "every day" is the
 * only claim of currency, and the last sentence is the only invitation.
 *
 * It lives here rather than inside the page because three things quote it now —
 * the page, the meta description, and `/llms.txt` — and a second copy of jass's
 * words is a second copy that can go stale. The old site had exactly that: a
 * meta description reading "fullstack web/app dev", a phrase that appeared
 * nowhere on the page, maintained by nobody.
 */
export const INTRO =
  "i build a lot of toys, occasionally useful things. im on twitter releasing & watching what's releasing every day. im excited about & scared of my agents, mostly the former. i also love video games, but i don't get to play them as much now. gimme an excuse and join me for a sesh?";

/**
 * What search results and link previews show. It is the intro's first sentence,
 * taken rather than restated, so it cannot drift from the paragraph it is a
 * sentence of. Safe on this copy specifically: it is plain lowercase prose with
 * no abbreviations, so the first ". " is the first sentence break.
 */
export const TAGLINE = `${INTRO.split(". ")[0]}.`;
