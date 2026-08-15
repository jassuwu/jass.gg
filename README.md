# jass.gg

my personal website. astro, tailwind, as little javascript as possible.

being rewritten from the ground up — the plan lives in
[`.scratch/site-rewrite/map.md`](.scratch/site-rewrite/map.md).

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
- **tailwind by default, plain css by exception** — `:has()`/sibling selectors,
  keyframes, and long-form prose go in a scoped `<style>` block.
- **tokens live in `@theme`.** the lime accent is defined once and reserved.
