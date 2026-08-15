# jass.gg

my personal website. astro, tailwind, one accent colour, and more javascript
than originally planned — every byte of it optional.

the rule the whole site is built on: **everything static is the document,
everything javascript is the friend.** the page is whole with js disabled —
every word, link and route. scripts only ever add: the wordmark signing
itself, the entry rows demoing their own products, the sounds behind them,
the water slowly flooding the 404. leave, and the page is plain again.

## how it fits together

- [`CONTEXT.md`](CONTEXT.md) — the design language: the two colour families,
  the three type roles (paper / machine / hand), and what the words here mean.
  read it before touching a token.
- [`src/scripts/friend.ts`](src/scripts/friend.ts) — the interaction grammar
  every act rides: dwell on pointer, scroll-dwell on touch, one-shot gags
  once per visit, reduced motion respected.
- [`src/scripts/sound.ts`](src/scripts/sound.ts) — the audio bus: silent
  until the first real gesture, one mouth, a whisper tier and a full tier.
- [`src/scripts/demos/`](src/scripts/demos/) — one module per bit, each
  self-contained.
- [`.scratch/site-rewrite/`](.scratch/site-rewrite/map.md) — the working map
  and tickets the rewrite was navigated by. kept as the record of why.

## commands

```sh
bun install
bun run dev      # dev server
bun run build    # static build to dist/
bun run verify   # format:check + lint + astro check + build
bun run resume   # typeset resume/resume.yaml into public/, then gate it
```

the resume is typeset from source in [`resume/`](resume/README.md) — edit
`resume/resume.yaml`, run `bun run resume`, commit the built pdf. ci rebuilds
and byte-compares, so it cannot go stale.

## constraints

- **works with javascript disabled.** every word, link and route. js may only
  add — never gate content or navigation.
- **reduced motion is honoured everywhere.** acts that are motion vanish;
  honest static forms stay.
- **tailwind by default, plain css by exception** — `:has()`/sibling
  selectors, keyframes, and long-form prose go in a scoped `<style>` block.
- **tokens live in `@theme`.** the lime accent is defined once and reserved.
- **all copy is jass's.** the few agent-drafted placeholder lines are flagged
  `AGENT DRAFT` in the source until his words replace them.
