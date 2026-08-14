# t3code marketing site: stack and tooling diff

Type: research
Status: resolved

## Question

What does `github.com/pingdotgg/t3code`'s marketing site use, and what should jass.gg's fresh scaffold take from it?

Answer concretely:

1. **Is the marketing site Astro?** If not, what — Vite + something, Next, TanStack Start? Where does it live in the repo, and is it a separate package/workspace?
2. **Full tooling inventory**: package manager and version, framework version, CSS approach (Tailwind? version? config style?), TypeScript config, linter and formatter (ESLint flat config? Biome? oxlint? Prettier?), git hooks, CI, deploy target.
3. **Diff against jass.gg as it stands today**: Bun 1.3.14, Astro 7.1.3, Tailwind 4.3.3 via `@tailwindcss/vite`, ESLint 10 flat config with `eslint-plugin-astro`, Prettier 3.9 with astro + tailwind plugins, `@astrojs/check`, TypeScript 6, Vercel git-integration deploy, GitHub Actions CI at `.github/workflows/ci.yml`. Name what t3code has that jass.gg lacks, what jass.gg has that t3code dropped, and where t3code made a different call on the same problem.
4. **Recommended scaffold command sequence** for the new project — the actual CLI invocations, in order, that produce as much of the setup as possible without hand-written config files. jass wants scaffolds doing the work.
5. **Anything relevant to the no-JS constraint** — how t3code ships (or avoids) client JS, island usage, view transitions, analytics loading.

Note where t3code's choices are driven by it being a product marketing site with a team, and therefore *not* transferable to a single-author personal site.

Capture findings on a throwaway `research/t3code-tooling` branch and link them here.

## Answer

Full findings: [`../research/t3code-tooling.md`](../research/t3code-tooling.md)

**Yes, it's Astro** — `apps/marketing` runs Astro `^7.0.3`, the same major as jass.gg. It is far more minimal than expected: 2 dependencies, a 6-line `astro.config.mjs` that configures only a port, a one-line `tsconfig.json` extending `astro/tsconfigs/strict`, 7 pages, 1 layout, 1 component.

**The headline finding: `apps/marketing` ships no Tailwind.** Styling is hand-written vanilla CSS in one `<style is:global>` block, built on CSS custom properties, with semantic class names and per-page scoped `<style>` blocks. **Scope this claim carefully:** t3code *does* use Tailwind elsewhere — `apps/web` runs Tailwind + shadcn, `apps/mobile` uses it too. So this is not a company-wide rejection of Tailwind; it's a deliberate split, framework for the app tier and plain CSS for the marketing tier. That distinction is what makes it relevant here, and it's the evidence ticket 09 rests on.

(Also: `.repos/alchemy-effect/` contains a *different* Astro marketing site that does use Tailwind and React islands. It's a vendored third-party clone kept for agents to read, not t3code's own code. Don't cite it as theirs.)

**Client JS is two tiny inline scripts**, both textbook progressive enhancement. One toggles a cosmetic class on scroll. The better one is on the download button: the `<a>` is server-rendered with a real working `href` to the releases page, and JS only *upgrades* it to a platform-specific asset URL after user-agent sniffing. No analytics of any kind, no view transitions, no islands, no `client:*` directives anywhere. Content and navigation are never gated on JS — that's the pattern to copy.

**Take:** the shape — near-empty config, one-line tsconfig, vanilla CSS with custom properties, a `lib/site.ts` constants module (jass.gg already has this as `src/constants.ts`), and the class-toggle script pattern.

**Leave:** the entire root toolchain — vite-plus (`vp`), pnpm 11 + catalogs, oxlint with a bespoke plugin, tsgo, `@effect/*` tooling, Blacksmith CI, and the typed `vercel.ts`. Every one exists to run a five-app team monorepo. Adopting `vp` would also replace jass.gg's working zero-config Vercel deploy with an `npm install -g vite-plus` build step, and its licensing terms could not be determined from the repo.

**Bun stays.** pnpm is there for workspace catalogs; with one package it buys nothing.

**Scaffold commands are verified, not guessed** — §6 was executed for real in a scratch dir with `create-astro@5.2.3` / `astro@7.2.1`. Two results worth carrying into ticket 02:

- **`--typescript strict` does not exist** on current `create-astro`. Strict is the template default and the generated `tsconfig.json` already reads `{"extends": "astro/tsconfigs/strict"}`. The working invocation is `bun create astro@latest . -- --template minimal --no-install --no-git --no-ai --yes`.
- **Do not bump TypeScript to `latest`.** npm's `latest` is `7.0.2`, which `@astrojs/check@0.9.10` (peer `^5 || ^6`) and `@typescript-eslint/parser@8.67.0` (peer `<6.1.0`) do not support. Stay on `6.0.3` — which is what jass.gg already pins, and what t3code pins.

**ESLint vs oxlint stays open for ticket 02.** `eslint --init` has no usable Astro flat-config template as of ESLint 10, so porting the existing working `eslint.config.mts` remains the zero-risk path. Bun 1.3.14 is confirmed current; nothing about the Astro or Tailwind scaffolds requires pnpm.

**Process note:** three research subagents were dispatched. The first two returned claiming to have delegated the work onward, having written nothing — the research was then done directly. The third eventually delivered a fuller, version-verified pass that corrected the direct one (the `--typescript strict` flag, the second inline script, the location of t3code's lint/format config, and the scope of the Tailwind claim). This answer reflects the corrected version.
