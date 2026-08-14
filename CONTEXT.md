# Context: jass.gg

The shared language for this site. Glossary only — no implementation details,
no decisions, no spec. Decisions live in `.scratch/site-rewrite/map.md`.

## The thesis

**plain** — the surface. Low ornament, nothing decorative, no hero, no cards.

**considered** — the substrate. Every spacing value, empty state and edge case
chosen deliberately.

These are not the same word, and the difference is the whole project. AI slop
is _plain without considered_. The target is **plain _because_ considered** —
restraint that cost more than decoration would have. The two look identical in
a screenshot, which is the central risk.

## Colour

Two families. A **neutral ramp** and one **accent**. Nothing else.

There is no "primary" and no "secondary". Those names imply a matched pair, and
this palette has no pair — it has a greyscale and a single reserved colour. Any
token still called `primary` is shadcn residue and is a bug.

### Neutrals

| Term                 | Means                                                             |
| -------------------- | ----------------------------------------------------------------- |
| **background**       | The page.                                                         |
| **foreground**       | Text that carries meaning. The default.                           |
| **muted-foreground** | Text that supports it: descriptions, section headings, the stamp. |

Three, because a page with no cards, no panels and no borders needs a page
colour, a text colour and a quieter text colour. A `muted` _surface_ and a
`border` token existed and were never used; they are gone.

### The accent

One colour — hue **124.39**, the lime carried over from the old site — in three
strengths. It comes in three because of a physical fact, not a preference: at
its invariant value the lime is **1.16:1 on white**. It can sit on a line at
that value. It can never be text in light mode.

| Term             | Means                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **accent**       | The accent as text. The default one to reach for. In dark mode this _is_ the invariant value; light mode is where it compromises.     |
| **accent-quiet** | The accent as text, desaturated, so it can appear without competing with the wordmark. Quieter, not fainter.                          |
| **accent-mark**  | The invariant itself. Marks and fills only — underlines, rules, backgrounds, the selection highlight. **Never text**, in either mode. |
| **on-accent**    | Text sitting _on_ `accent-mark`. Unthemed, for the same reason: lime is light in both modes, so this must not follow the theme.       |

**Muted means desaturated, not translucent.** `accent-quiet` drops chroma and
holds lightness. Reaching for an opacity modifier instead blends the colour
toward the background and destroys the light-mode contrast this whole family
exists to protect.

**Reserved** means what it says: if a second thing takes the accent, the accent
has stopped being an accent. Today it is the wordmark, the writing line, link
hover, and the selection highlight. Two of those four appear only when the
reader asks for them.

**Each page gets one full-strength accent, and it goes to the most human thing
on it.** On `/` that is the name. On `/404` it is the joke, not the error code,
which is chrome. `accent-quiet` is for an aside that would otherwise compete
with something louder, which is why the same aside is quiet on `/` and full
strength on `/404`.

## Light and dark

Both modes are equal citizens; neither is the default. There is **no toggle**
and **no `.dark` class** — the browser picks via `color-scheme: light dark`,
and nothing about the theme is JavaScript's business.

Every themed colour is expressed as a single `light-dark()` at its one
declaration site, so a token has exactly one place it is defined. Two colours
are unthemed — `accent-mark` and `on-accent` — because a mark does not need to
flip, and text on a mark must not.

## Type

Three roles, named for the **job** rather than the typeface, so swapping a
typeface is a one-line change and no markup ever names a font.

| Role        | Typeface     | Means                                                                                                                           |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **paper**   | Baskervville | Prose, body, headings. The default. **Has no bold** — the family ships one weight, so emphasis is italic or moves to _machine_. |
| **machine** | IoskeleyMono | Anything factual: section labels, the socials row, the stamp. The only role with a real bold.                                   |
| **hand**    | Excalifont   | The wordmark, and asides. A name in a hand font is a signature; anywhere else it reads as a gimmick.                            |

None is mandatory on a page. Use what the content calls for.

Four size steps: **micro**, **meta**, **body**, **display**.

`display` is the single oversized element on a page, and every page gets at most
one. On `/` that is the wordmark. On `/404` it is the number.

## Content

| Term          | Means                                                                            |
| ------------- | -------------------------------------------------------------------------------- |
| **thing**     | Work. Built to be used by someone other than jass.                               |
| **toy**       | Play. Built because it was funny or interesting.                                 |
| **entry**     | One thing or toy: a name, one line, and a link to the built artifact.            |
| **the stamp** | The build-time "last touched" date in the footer, linked to the commit it names. |

The split between _thing_ and _toy_ is voice, not taxonomy — it says which work
is serious without having to claim anything.

The **profile README** (`github.com/jassuwu/jassuwu`) is the source of truth for
what exists. When it and the site disagree, the README wins.
