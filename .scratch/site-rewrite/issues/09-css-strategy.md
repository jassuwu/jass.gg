# CSS strategy: Tailwind or vanilla CSS?

Type: grilling
Status: resolved

## Question

Does the rewrite use Tailwind, or hand-written CSS with custom properties?

Tailwind was settled early as a given. Ticket 01 complicated that: `pingdotgg/t3code`'s marketing site — Astro 7, production — uses **no CSS framework at all**. One `<style is:global>` block, CSS custom properties, semantic class names, per-page scoped styles. See `../research/t3code-tooling.md` §4.

**State the evidence honestly when putting this to jass.** t3code has not rejected Tailwind: `apps/web` runs Tailwind + shadcn and `apps/mobile` uses it too. What they did is *split* — a framework for the app tier, hand-written CSS for the marketing tier. That's a weaker claim than "a team that could use anything chose plain CSS," and it's the accurate one. It's still the relevant precedent, because jass.gg is entirely marketing tier: a content site with no application UI.

This is worth reopening because the choice is nearly irreversible once the reference homepage exists, and because it lands squarely on the thesis.

Arguments for **vanilla CSS**:

- The site is one page plus two routes. Tailwind's payoff is consistency across a large surface with many hands; there is one page and one author.
- Four dependencies disappear (`tailwindcss`, `@tailwindcss/vite`, plus `clsx` / `tailwind-merge` / `cva` / `tw-animate-css`, which exist only to manage Tailwind classes).
- The typography system from ticket 03 — a serif body at a hand-tuned size, mono for data, a marginalia font — is a *typographic* design, not a utility-scale design. Tuning Baskervville's size, weight and line-height per context is more natural in CSS than in arbitrary-value brackets.
- The marginalia reveal (ticket 05) is CSS-only by requirement and likely needs `:has()`, sibling selectors and custom properties — utility classes fight this.
- It matches the thesis: a hand-written stylesheet *is* considered. Utility soup in the markup is the visual signature of the generated-portfolio look jass is subtracting.

Arguments for **Tailwind**:

- jass already knows it and is fast in it; the appetite is a few evenings.
- Dark mode, responsive breakpoints and the existing lime/zinc token setup are already expressed in Tailwind 4's `@theme` and would need re-expressing.
- Tailwind 4 is CSS-first — `@theme` with custom properties is much closer to vanilla than v3 was, so the gap is smaller than it used to be.
- Hand-written CSS on a text-first site is small; hand-written CSS that grows untended is how stylesheets rot.

Decide, and if the answer is vanilla, decide the accompanying conventions: where the stylesheet lives, whether styles are global or per-component (`<style>` in `.astro` files is scoped by default), and the class-naming convention.

A third option exists and should be put to jass explicitly: **Tailwind 4 with `@theme` for tokens, but written mostly as semantic classes with `@apply`** — which gets the token system without the utility-soup markup. It is also the option most likely to be the worst of both, so name it and let jass reject it.

## Answer

**Tailwind, with a defined escape hatch to plain CSS.**

The thing that makes this a real answer rather than a fudge: Tailwind 4 is CSS-first, so the design tokens live in `@theme` as **CSS custom properties**. Lime, the zinc ramp, and the three font families are therefore available to *both* worlds — a hand-written `<style>` block gets the same `var(--color-primary)` and `var(--font-*)` that a utility class does. Escaping to plain CSS costs no design-system coherence. That is what stops the hybrid from being worst-of-both.

### The rule

**Tailwind is the default.** Layout, spacing, sizing, color, type scale, responsive breakpoints, dark mode — anything utility-shaped, and anything you'd otherwise name a class for just to set three properties.

**Reach for a scoped `<style>` block in the `.astro` file when the thing is not utility-shaped:**

1. **Selectors Tailwind can't express cleanly** — `:has()`, sibling and descendant combinations, `::before`/`::after` content choreography. The marginalia reveal (ticket 05) is almost certainly here.
2. **Multi-step animation** — anything past a single transition. Keyframes belong in CSS.
3. **Long-form prose.** Setting a whole document — Baskervville at a hand-tuned size, line-height, and heading rhythm — is typographic design, not utility composition. The existing `.prose` block is the right shape; keep that pattern.
4. **Anything where the utility string is longer than the CSS would be.** If a `class` attribute needs a line break to stay readable, it has stopped paying for itself.

### Conventions

- **Astro's `<style>` is scoped by default** — prefer scoped blocks in the component. Global CSS is for tokens, resets, and prose only.
- **Don't rebuild semantic classes with `@apply`.** That's the third option jass rejected by choosing Tailwind. Use `@apply` rarely, if at all.
- **One owner per property.** Never set the same concern in both a utility and a `<style>` rule on the same element — that's where hybrids rot.
- **Tokens in `@theme`, never hardcoded.** Lime is defined once. If a plain-CSS block hardcodes an `oklch()` literal, that's a bug.

### Consequence for ticket 02

Tailwind stays, so `@tailwindcss/vite` and `tailwindcss` are in. The four satellite packages are **not** automatic: `class-variance-authority` and `tailwind-merge` exist to manage component variants and class conflicts, and a text-first site with almost no variants may need neither. `tw-animate-css` overlaps with rule 2 above. Decide each one in ticket 02 on evidence of need, not by porting the old `package.json`.
