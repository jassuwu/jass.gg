# Scaffold the new project

Type: task
Status: resolved
Blocked by: 01, 09

## Question

Stand up the new codebase on the rewrite branch, so every later prototype has somewhere real to live.

This is HITL — jass explicitly asked to be grilled through the setup as it happens, not handed a finished tree.

Work to do:

- Delete nearly everything in the repo. **Preserve `.scratch/` (this map), `.git/`, and the content and assets earmarked for curation** — see ticket 06 before deleting anything under `src/data/` or `src/assets/`. Also preserve `public/resume.pdf`.
- Scaffold a fresh Astro project with the latest versions, using the CLI rather than hand-written files.
- Add Tailwind, the linter, the formatter, and the type-check setup via their own scaffolds/init commands wherever those exist.
- Apply the recommendations from ticket 01 (`../research/t3code-tooling.md` §6), grilling jass on each place where t3code's answer and the old jass.gg answer disagree.
- Decide on shadcn — jass's own read is that it probably doesn't fit a minimal-JS text-first site. If it's out, say so and don't install it.
- **Verify the `create astro` flag surface at run time.** Ticket 01 deliberately did not guess it; the flags move between releases.
- **Resolve ESLint vs oxlint here.** Ticket 01 could not verify oxlint's Astro support, which is the deciding factor. Porting the existing working `eslint.config.mts` is the zero-risk default.
- Do **not** add a `vercel.ts` — the existing git-integration deploy needs no config file. t3code has one only because a monorepo needs a filtered build command.
- Confirm the Vercel deploy still works from the branch, and that CI still runs.

Record in the answer: the exact scaffold commands used, the resulting versions, and every decision made under grilling.

## Answer

The new codebase is standing on `t3code/rewrite-website-design`, verified end to end.

### Commands actually run

```bash
bun create astro@latest . -- --template minimal --no-install --no-git --no-ai --yes
bun install
bunx astro add tailwind --yes
bun add -d @astrojs/check typescript@6.0.3 \
  prettier prettier-plugin-astro prettier-plugin-tailwindcss \
  eslint eslint-plugin-astro @typescript-eslint/parser
```

**`create astro` will not scaffold into a non-empty directory.** With `--yes` it silently ignores `.` and generates into a randomly-named subdirectory instead (we got `evolved-eclipse/`). The contents were merged up and the stray directory removed. Anyone re-running this should expect it.

### Resulting versions

`astro@7.2.2`, `tailwindcss@4.3.3` + `@tailwindcss/vite@4.3.3`, `@astrojs/check@0.9.10`, `typescript@6.0.3` (**not 7** — `@astrojs/check` and `@typescript-eslint/parser` don't support it), `eslint@10.8.1`, `eslint-plugin-astro@3.1.0`, `@typescript-eslint/parser@8.67.0`, `prettier@3.9.6`, `prettier-plugin-astro@0.14.1`, `prettier-plugin-tailwindcss@0.8.1`. Bun stays at 1.3.14.

### Decisions made under grilling

- **ESLint, not oxlint.** Ported the existing flat config, plus an `ignores` block for `dist`/`.astro`/`node_modules`. oxlint's Astro support was never verified and its t3code setup is inseparable from vite-plus.
- **None of the four Tailwind satellites installed** — no `class-variance-authority`, `clsx`, `tailwind-merge`, or `tw-animate-css`. Add on evidence of need. A ground-up rewrite that inherits four unchosen dependencies isn't ground-up.
- **shadcn: out.** Doesn't fit a minimal-JS text-first site.
- **The blur components were deleted, not preserved.** jass: *"idek if that's the best way to implement that anymore… just remember the concept for what it is."* The concept remains an invariant; the mask-gradient implementation is open for redesign.
- **`src/data/` and `src/assets/` preserved untouched** — ticket 06 hasn't ruled on content. `public/resume.pdf` preserved. Astro's default favicons deleted in favour of the existing `favicon.webp`.
- **No `vercel.ts`.** Git-integration deploy needs no config file.
- **Dropped the shadcn token bloat** — card, popover, sidebar, chart, accent, input, ring, destructive were scaffolding for components that don't exist. Kept only the zinc neutrals and the one lime.

### Findings from `/code-review`, and what changed

Five acted on:

1. **`tailwindStylesheet` was missing from the Prettier config** — Tailwind 4 is CSS-first, so without it the class sorter cannot resolve `@theme` tokens and **silently no-ops**. Reproduced (`text-muted-foreground bg-primary mt-2` left unsorted), fixed, re-verified (now sorts to `mt-2 bg-primary p-4 text-sm text-muted-foreground`). Wrong order was already baked into `index.astro` with `format:check` passing.
2. **Dark tokens were defined twice** — once in `@theme`, once in a `prefers-color-scheme` block — violating this effort's own "tokens in `@theme`, never hardcoded" rule and inviting drift. Replaced with **`light-dark()`**: one declaration per token, no media query, no `.dark` class, still zero JS. Verified opacity modifiers compose — `text-foreground/60` compiles to `light-dark(#0a0a0a99,#fafafa99)` with a `color-mix` fallback.
3. **Lime was on the placeholder `<h1>`** — ~1.2:1 contrast on white, and contradicting the "reserved accent" comment 20 lines above it. Removed. Lime now appears nowhere until something earns it.
4. **`package.json` `overrides` had been swept out** — `brace-expansion`, `flatted`, `picomatch@<4`, `sharp`, `smol-toml`, `svgo` were transitive security floors, not Tailwind satellites. All six confirmed still in the tree and restored.
5. **`engines: { node: ">=22.12.0" }` removed** — scaffold default, never requested, and the one added field Vercel reads at build time.

Deferred: with `Layout.astro` gone, `index.astro` inlines the full document shell. Fine at one page; reintroduce a layout before the second page exists (ticket 08). `public/opengraph.jpg` is preserved but currently unreferenced — identity assets are still fog.

### Verification

`bun run verify` passes clean: `prettier --check`, `eslint`, `astro check` (0 errors, 0 warnings, 0 hints), `astro build`.

**The no-JS constraint is measurably true, not aspirational:** `dist/` contains **zero `.js` files** and `index.html` has **zero `<script>` tags**. Total output is one HTML file plus a 6.4 KB stylesheet. Dark mode works with JS disabled via `color-scheme` + `light-dark()`.

**CI:** `.github/workflows/ci.yml` is unchanged and still valid — it runs `bun install --frozen-lockfile` then `bun run verify`. Both simulated locally; `--frozen-lockfile` exits 0 against the committed `bun.lock`. **Vercel:** static Astro, no adapter, no config file, `dist` output — the existing git integration is untouched. Not confirmed against a live deployment; that happens on first push.
