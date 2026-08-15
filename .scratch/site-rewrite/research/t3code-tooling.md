# Research: t3code marketing site tooling

Source: `github.com/pingdotgg/t3code` @ `main`, read via `gh api` on 2026-08-14 (gh authenticated as `jassucyd`). Every claim below cites a path in that repo. Latest-version claims were checked against the npm registry (`registry.npmjs.org`) and GitHub Releases API on 2026-08-14 and are marked as such; anything not directly checked is marked "could not determine."

## Verdict

**Take:** the marketing app's *shape* — a near-empty Astro config, a one-line tsconfig, hand-written CSS with custom properties, a constants module, and two tiny inline progressive-enhancement scripts (`apps/marketing/src/layouts/Layout.astro`, `apps/marketing/src/pages/index.astro`). It is close to what a rewrite of jass.gg should look like, built by a team that could have reached for anything.

**Leave:** essentially the entire root toolchain — pnpm 11.10.0, the `vite-plus` CLI, catalog-pinned deps, oxlint with a bespoke local plugin, Effect/tsgo tsconfig plugins, Blacksmith CI runners. All of it exists to manage a five-app team monorepo (`desktop`, `marketing`, `mobile`, `server`, `web`). None of it is load-bearing for a single-author, four-page personal site, and `apps/marketing` itself proves that: it doesn't touch most of it.

**The one thing that should change a decision:** `apps/marketing` ships **no Tailwind at all** — confirmed absent from its `package.json`, its `pnpm-lock.yaml` importer block, and a repo-wide code search for "tailwind" (zero hits under `apps/marketing/`). Given jass.gg's Tailwind requirement is fixed by the owner, this is not a reason to drop Tailwind — but it is a reason not to treat t3code's marketing app as a Tailwind reference; it isn't one.

**Version guidance up front:** do not bump to `typescript@latest` (npm shows `7.0.2`, checked 2026-08-14) — it is a new major (the tsgo-based rewrite) that `@astrojs/check@0.9.10`'s peer range (`^5.0.0 || ^6.0.0`) and `@typescript-eslint/parser@8.67.0`'s peer range (`typescript: >=4.8.4 <6.1.0`) do not yet support. `6.0.3` is both the latest stable 6.x release on npm and what t3code itself pins. jass.gg's current TS 6 pin is already correct; don't "upgrade" it to 7.

## 1. Is it Astro?

Yes. `apps/marketing/package.json` declares `astro: "^7.0.3"`. `apps/marketing/pnpm-lock.yaml`'s importer block resolves this to the exact version `astro@7.0.3`, with `@astrojs/check` resolving to `0.9.9` (declared `^0.9.7`) and `typescript` resolving to `6.0.3` (declared `catalog:`).

The whole app manifest (`apps/marketing/package.json`):

```json
{
  "name": "@t3tools/marketing",
  "type": "module",
  "scripts": {
    "dev": "astro dev", "build": "astro build",
    "preview": "astro preview", "typecheck": "astro check"
  },
  "dependencies": { "@t3tools/shared": "workspace:*", "astro": "^7.0.3" },
  "devDependencies": { "@astrojs/check": "^0.9.7", "@vercel/config": "^0.3.0", "typescript": "catalog:" }
}
```

Two dependencies, three dev dependencies. No lint or format script at the app level — those are invoked from the monorepo root.

**Structure** (`apps/marketing/src/`, confirmed via `git/trees/main:apps/marketing/src`):
- `pages/` — 6 `.astro` pages (`index.astro`, `download.astro`, `legal.astro`, `privacy-policy.astro`, `security-policy.astro`, `terms-of-service.astro`) plus `pages/schema/t3.json.ts`, a build-time API route (`export const GET: APIRoute`) that serves a JSON Schema at `/schema/t3.json` for `t3.json` files' `$schema` field.
- `layouts/Layout.astro` — the single shared layout (nav, footer, global styles).
- `components/LegalPage.astro` — one shared component, used by the three legal pages.
- `lib/` — three plain TS modules: `site.ts` (URL/stat constants), `releases.ts` (GitHub Releases fetch helper), `tweets.ts` (hardcoded testimonial data).
- Routing is Astro's default file-based routing under `src/pages/`. No content collections, no MDX, no `src/content/` directory.

`apps/marketing/astro.config.mjs` is six lines and configures **nothing but a dev-server port**:

```js
import { defineConfig } from "astro/config";
export default defineConfig({
  server: { port: Number(process.env.PORT ?? 4173) },
});
```

No integrations (no React/Vue/Svelte/Solid, no MDX, no sitemap), no adapter (so Astro's default `output: "static"` applies), no Tailwind plugin.

`apps/marketing/tsconfig.json` is one line: `{ "extends": "astro/tsconfigs/strict" }`. It does **not** extend the root `tsconfig.base.json` — that root file is Effect-specific (see §7) and the marketing app deliberately doesn't inherit it.

## 2. Full tooling inventory

### App level (`apps/marketing/`)

| | |
|---|---|
| Framework | Astro, declared `^7.0.3`, lockfile-resolved `7.0.3` (`apps/marketing/package.json`, `pnpm-lock.yaml`) |
| Output mode | static (default; no adapter configured in `astro.config.mjs`) |
| Type check | `astro check` via `@astrojs/check`, declared `^0.9.7`, lockfile-resolved `0.9.9` |
| TS config | `astro/tsconfigs/strict`, unmodified, standalone from root `tsconfig.base.json` |
| CSS | **none installed** — no Tailwind, no PostCSS, no CSS framework of any kind (see §4) |
| Deploy | Vercel, configured in **`apps/marketing/vercel.ts`** (typed TS, via the `@vercel/config` package, not `vercel.json`):<br>`installCommand: "npm install -g vite-plus && vp install --filter '@t3tools/marketing...'"`<br>`buildCommand: "vp run --filter @t3tools/marketing build"`<br>`outputDirectory: "dist"` |
| Fonts | Google Fonts `<link>` + `<link rel="preconnect">` in `Layout.astro` — DM Sans + JetBrains Mono. **Not self-hosted.** |
| Tests | none found — no `*.test.ts`/`*.spec.ts` under `apps/marketing` in the full recursive tree listing |

### Root level (inherited by the whole monorepo, including marketing)

| | |
|---|---|
| Package manager | **pnpm `11.10.0`** — root `package.json` `"packageManager": "pnpm@11.10.0"` |
| Node | `"engines": { "node": "^24.13.1" }` in root `package.json` |
| Workspace layout | `pnpm-workspace.yaml`: `apps/*`, `infra/*`, `oxlint-plugin-t3code`, `packages/*`, `scripts`, plus a `catalog:` block for cross-package version pinning and a `patchedDependencies` block (multiple `pnpm patch` overrides) |
| Toolchain runner | **`vite-plus`** (invoked as `vp`), pinned via catalog to `0.2.2` (`npm:@voidzero-dev/vite-plus-core@0.2.2` is aliased as `vite` itself). Root `vite.config.ts` is a single `vite-plus` config object with `test`, `staged`, `fmt`, and `lint` blocks — this one file is the lint config, the format config, the git-hook config, *and* the vitest-equivalent test config. There is no separate `.oxlintrc.json`, `eslint.config.*`, `.prettierrc*`, or `lefthook.yml`/`.husky/` directory anywhere in t3code's own tree. |
| Linter | oxlint, driven by the `lint` block in root `vite.config.ts`: `plugins: ["eslint", "oxc", "react", "unicorn", "typescript"]` (oxlint's built-in rule categories, not the ESLint tool) plus `jsPlugins: ["./oxlint-plugin-t3code/index.ts"]` — a repo-local custom plugin (`oxlint-plugin-t3code/`, with its own `rules/`, `package.json`, `tsconfig.json`) enforcing project-specific rules like `t3code/no-global-process-runtime` and `t3code/namespace-node-imports`. Root devDependency `"@oxlint/plugins": "^1.63.0"`. Invoked as `vp lint --report-unused-disable-directives` (root `package.json` `"lint"` script). |
| Formatter | `vp fmt` / `vp fmt --check` (root `package.json` `"fmt"`/`"fmt:check"` scripts), configured via the `fmt` block in root `vite.config.ts` (ignore patterns, `sortPackageJson: {}`, per-file overrides). `prettier@3.8.3` does appear in `pnpm-lock.yaml` as a resolved dependency (e.g. a peer of `@astrojs/check`), but it is not invoked directly by any script — **could not determine** from the public repo whether `vp fmt` wraps Prettier internally, wraps `oxfmt`, or is a distinct implementation; no source for `vite-plus`/`vp` itself is in this repo (it's an external package). |
| Git hooks | Also configured via `vite-plus`'s `staged` block in root `vite.config.ts`: `"*": "vp fmt"` with the comment `// Formatter only for now — no lint or typecheck on commit.` No `.husky/` or `lefthook.yml` in t3code's own tree (a `.husky/pre-commit` and `.oxlintrc.json` do exist, but only inside the vendored third-party reference clone at `.repos/alchemy-effect/` — see §7 caveat, not part of t3code's own tooling). |
| Test runner | `vite-plus`'s built-in test runner: root `vite.config.ts` does `import "vite-plus/test/config"` and defines a `test` block (`environment: "node"`, exclude patterns, `hookTimeout`/`testTimeout: 60_000`). Root script: `"test": "vp run -r test"`. **Could not determine** the underlying engine (Vitest-compatible API is implied by the import path, but not confirmed from repo files alone). |
| TypeScript | pinned in `pnpm-workspace.yaml` catalog as `typescript: ~6.0.3`; root `package.json` devDependencies also include `@typescript/native-preview` (a `dev` prerelease build, catalog version `7.0.0-dev.20260604.1`) and `@effect/tsgo` (`0.13.2`) — an Effect-maintained fork/patch of the Go-based TypeScript compiler, used for the monorepo's type-checking pipeline generally, not by marketing specifically. |
| CI | `.github/workflows/` contains 11 files: `ci.yml`, `deploy-relay.yml`, `issue-labels.yml`, `mobile-eas-preview.yml`, `mobile-eas-production.yml`, `mobile-fingerprint-check.yml`, `mobile-showcase-screenshots.yml`, `pr-size.yml`, `pr-vouch.yml`, `release.yml`, `thread-transfer-report.yml`, `web-preview.yml`. `ci.yml` runs on `blacksmith-8vcpu-ubuntu-2404` runners, uses `voidzero-dev/setup-vp@v1` to install/cache, then runs `vp check`, `vpr typecheck`, a Rust `cargo fmt --check` (for `native/resource-monitor`), and a desktop build/preload-bundle verification. **None of `ci.yml`, `deploy-relay.yml`, `release.yml`, or `web-preview.yml` mention "marketing"** (verified by grepping the fetched file contents) — the marketing app isn't singled out anywhere in CI; it's presumably swept in only via wildcard filters like the root `"build"` script's `--filter './apps/*'`. |
| Version policy | `pnpm-workspace.yaml` `catalog:` for cross-package pinning, plus a `minimumReleaseAgeExclude` allowlist (a supply-chain "wait N days before adopting a new release" policy with named exceptions) |
| Infra | `infra/relay` only — no marketing-specific entry under `infra/` |

## 3. Client-JS posture

Astro's default static output, zero component hydration (no framework integration is registered in `astro.config.mjs`, so there are no islands and no `client:*` directives anywhere in the app). Two small inline vanilla-JS `<script>` blocks were found across the two pages fully read:

1. **`Layout.astro`** — a global nav scroll-shadow toggle:
   ```js
   const nav = document.querySelector(".nav");
   const onScroll = () => {
     if (!nav) return;
     if (window.scrollY > 12) nav.classList.add("is-scrolled");
     else nav.classList.remove("is-scrolled");
   };
   window.addEventListener("scroll", onScroll, { passive: true });
   onScroll();
   ```
   Purely cosmetic (adds/removes a border-color class on scroll). With JS disabled, the nav simply never gets the "scrolled" border — nothing breaks.

2. **`index.astro`** — OS-aware download button enhancement. The download `<a>` (`id="download-btn"`) is server-rendered with a real, working default `href="https://github.com/pingdotgg/t3code/releases"`. The inline script imports `fetchLatestRelease`/`RELEASES_URL` from `../lib/releases`, does `navigator.userAgent` sniffing (`detectPlatform()`), and — only if JS runs — rewrites the button's label/href to a platform-specific asset URL (e.g. `.dmg` for arm64 Mac). `apps/marketing/src/pages/download.astro` follows the identical pattern: every platform's download card is a real `<a data-asset="..." href={RELEASES_URL}>` up front, presumably re-pointed to the exact asset URL by a similar script further down the file (not fully read past the head, but the static-fallback-first structure is confirmed for the cards shown).

No analytics of any kind: a repo-wide grep for `analytics|posthog|plausible|umami|fathom|gtag|google-analytics` returns zero hits under `apps/marketing/`; the only "analytics" hits anywhere in the repo are `apps/server/src/telemetry/AnalyticsService.*`, which is unrelated backend/product telemetry, not marketing-site pageview tracking. No view-transitions usage — a repo-wide grep for `view-transition|ClientRouter|astro:transitions` returns zero hits anywhere in the tree (including `.repos/`). No client-side router.

**Net posture:** about as close to zero-JS as a marketing site gets — static HTML/CSS by default, two tiny opt-in enhancement scripts that both degrade gracefully to a fully-functional static fallback, and no analytics beacon. This is a good, directly-transferable pattern for jass.gg's no-JS requirement: real `href`/content server-rendered first, JS only upgrades presentation or convenience, never gates content or navigation.

## 4. The Tailwind (non-)finding

`apps/marketing` has **no Tailwind, no PostCSS, no CSS framework of any kind.** Styling is hand-written CSS in a single `<style is:global>` block in `Layout.astro`, built on CSS custom properties and `oklch()` color functions:

```css
:root {
  --bg: #09090b;  --bg-elev: #0c0c0e;  --bg-card: #111113;
  --fg: #fafafa;  --fg-muted: #a1a1aa;  --fg-dim: #71717a;  --fg-faint: #52525b;
  --border: rgba(255, 255, 255, 0.08);
  --accent-h: 250;
  --accent: oklch(0.68 0.17 var(--accent-h));
  --accent-dim: oklch(0.68 0.17 var(--accent-h) / 0.15);
  --font-sans: "DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  --radius: 12px;
}
```

Markup uses semantic class names (`.page`, `.nav`, `.nav-inner`, `.nav-brand`, `.footer-inner`, `.footer-links`) with Astro's `class:list` for conditionals, plus per-page scoped `<style>` blocks (Astro's default CSS scoping) alongside the global one.

**Important caveat — do not mistake this for "Tailwind isn't used at t3code":** a repo-wide code search for "tailwind" (`gh api search/code`) does return real hits, all outside `apps/marketing/`: `apps/web/package.json`, `apps/web/components.json` (shadcn/ui, implying `apps/web` is a full Tailwind + shadcn app), `apps/web/src/index.css`, `apps/mobile/package.json`. Also, `.repos/alchemy-effect/` — a **vendored third-party reference clone checked into the repo for the coding agent to read**, not one of t3code's own `apps/*` — contains an entirely separate Astro marketing site (`​.repos/alchemy-effect/website/`) that *does* use Tailwind and React "island" components (`.repos/alchemy-effect/website/src/components/marketing-islands/*.tsx`, e.g. `HeroCta.tsx`, `DeployTerminal.tsx`). That is not t3code's own tooling and should not be cited as if it were — it's a different, unrelated open-source project's website that happens to live in this repo's `.repos/` reference-material directory.

## 5. Diff vs jass.gg today

| | t3code `apps/marketing` | jass.gg (current) | read |
|---|---|---|---|
| Framework | Astro `^7.0.3` (resolved `7.0.3`) | Astro `7.1.3` | **same major, jass.gg slightly ahead**; npm `latest` is `7.2.1` as of 2026-08-14 |
| Package manager | pnpm `11.10.0` | Bun `1.3.14` | monorepo need on their side; no reason for jass.gg to switch (see §6) |
| CSS | vanilla CSS + custom properties, no framework | Tailwind `4.3.3` via `@tailwindcss/vite` | **the real divergence** — but Tailwind is a fixed requirement for the rewrite, so this is informational, not actionable |
| Linter | oxlint + repo-local custom plugin, run via `vp lint` | ESLint `10` flat config (`eslint.config.mts`) + `eslint-plugin-astro` + `@typescript-eslint/parser` | oxlint is materially faster but its config here is inseparable from `vite-plus`; see §6 |
| Formatter | `vp fmt` (engine undetermined) | Prettier `3.9` + `prettier-plugin-astro` + `prettier-plugin-tailwindcss` | |
| Type check | `astro check` via `@astrojs/check` (resolved `0.9.9`) + TS `6.0.3` | `@astrojs/check` + TypeScript `6` | **same tool, same TS major** |
| TS config | `astro/tsconfigs/strict`, unmodified, 1 line, standalone from root Effect-heavy `tsconfig.base.json` | custom `tsconfig.json` | jass.gg could simplify toward the 1-line `extends astro/tsconfigs/strict` pattern |
| `astro.config` | 6 lines, port only, zero integrations | includes `@tailwindcss/vite` plugin | |
| Deploy | Vercel via typed `apps/marketing/vercel.ts` (`@vercel/config`), because a monorepo needs a filtered `--filter @t3tools/marketing` build command | Vercel git integration, static, no config file needed | theirs is monorepo-driven complexity that jass.gg doesn't need |
| Fonts | Google Fonts `<link>` + `preconnect` | (per prior facts) Google `@import` | **both third-party-hosted; neither self-hosts fonts** — not a t3code advantage to copy |
| Utility CSS deps | none | `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` | all Tailwind-ecosystem, no t3code equivalent since they don't use Tailwind |
| Client JS | 2 tiny inline progressive-enhancement scripts, no analytics | (per prior facts) PostHog + giscus | jass.gg carries real client-side dependencies t3code's marketing site has none of |
| Git hooks | `vite-plus` `staged` block, format-only, no dedicated hook framework file | **could not determine from this research** whether jass.gg has husky/lefthook — not investigated in the t3code repo (out of scope); flagged for the jass.gg-side audit | |
| Content model | hardcoded arrays/constants in `src/lib/*.ts` (`tweets.ts`, `site.ts`) — no content collections, because a 6-page marketing site has no need for one | (per prior facts, not directly re-verified here) content collections — **not investigated in this pass**, since this research targets t3code only | jass.gg's collections are a genuine advantage if it has actual content to manage; t3code's site has none |

**t3code has that jass.gg lacks:** nothing tooling-wise that's actually worth adopting — its entire advantage is *absence* (no Tailwind, no analytics, minimal JS), which is a design outcome, not a tool.

**jass.gg has that t3code doesn't use at all:** Tailwind and its ecosystem (cva, clsx, tailwind-merge, tw-animate-css), ESLint + Prettier as standalone tools, PostHog/giscus client JS.

**Where both solve the same problem differently:** package manager (Bun vs pnpm+catalog), linter (ESLint flat config vs oxlint+custom plugin via vite-plus), formatter (Prettier vs `vp fmt`), Vercel config (implicit git integration vs explicit typed `vercel.ts`) — in every one of these pairs, t3code's version is more complex because it serves a 5-app team monorepo, not because it's a better default for a single site.

## 6. Recommended scaffold sequence

Constraints honoured: Astro required, Bun stays, Tailwind required, latest stable versions, JS-disabled-must-work baseline, single-author site (no monorepo tooling).

All commands below were **actually executed** in a scratch directory (`/tmp/astro-scaffold-test`, deleted afterward) on 2026-08-14 with `create-astro@5.2.3` and `astro@7.2.1` to verify real output — not guessed from memory. Versions confirmed against the npm registry on the same date: `astro@7.2.1`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `eslint@10.8.1`, `prettier@3.9.6`, `typescript@6.0.3` (latest **stable 6.x**; the npm `latest` dist-tag is `7.0.2` but that major isn't yet supported by `@astrojs/check@0.9.10`'s peer range `^5.0.0 || ^6.0.0` or `@typescript-eslint/parser@8.67.0`'s peer range `>=4.8.4 <6.1.0` — stay on 6.0.3), `@astrojs/check@0.9.10`, `eslint-plugin-astro@3.1.0` (requires `eslint >=10.0.0` and `@typescript-eslint/parser >=8.61.0` — compatible with ESLint 10), `prettier-plugin-astro@0.14.1`, `prettier-plugin-tailwindcss@0.8.1`, `@typescript-eslint/parser@8.67.0`, `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.6.0`, `tw-animate-css@1.4.0`. Bun `1.3.14` was confirmed as the latest GitHub release (`oven-sh/bun`) as of 2026-08-14 — no newer Bun release exists, so jass.gg's current pin is already current; no Bun version change needed or possible.

```bash
# 1. Scaffold. Generates package.json (astro ^7.2.1), astro.config.mjs,
#    tsconfig.json (already "extends": "astro/tsconfigs/strict" — strict
#    mode is the template default; there is no separate --typescript flag,
#    it was removed/renamed at some point and no longer exists on
#    create-astro@5.2.3), src/pages/index.astro, public/, .gitignore,
#    .vscode/{extensions,launch}.json.
#    NOTE: create-astro's own README.md and .vscode files were generated;
#    review/prune those, they're scaffold defaults, not requirements.
bun create astro@latest . -- --template minimal --no-install --no-git --no-ai --yes

# 2. Install deps with Bun (the scaffold's own installer defaults to the
#    tool that invoked it, but pin explicitly since --no-install was used above).
bun install

# 3. Tailwind. Verified live: this actually runs `bun add @tailwindcss/vite@^4.3.3
#    tailwindcss@^4.3.3`, creates src/styles/global.css containing exactly
#    `@import "tailwindcss";` (CSS-first, no tailwind.config.js/ts generated —
#    matches jass.gg's existing @tailwindcss/vite + CSS-first @theme style),
#    and edits astro.config.mjs to add `vite: { plugins: [tailwindcss()] }`.
#    You still have to hand-add the stylesheet import into your layout
#    (astro add tells you this explicitly — it does not do it for you).
bunx astro add tailwind --yes

# 4. Prettier. No scaffold/init command exists for Prettier + Astro; config
#    is hand-written (a .prettierrc with plugins: ["prettier-plugin-astro",
#    "prettier-plugin-tailwindcss"] — order matters, astro plugin first).
bun add -d prettier@^3.9 prettier-plugin-astro@^0.14 prettier-plugin-tailwindcss@^0.8

# 5. ESLint. `eslint --init` exists but its Astro support is thin (no
#    dedicated Astro flat-config template as of ESLint 10) — hand-writing
#    eslint.config.mts by porting jass.gg's existing working config is the
#    zero-risk path, not running `eslint --init` fresh. Confirmed via npm
#    peer-dependency check that this trio is mutually compatible:
#    eslint-plugin-astro@3.1.0 requires eslint>=10.0.0 and
#    @typescript-eslint/parser>=8.61.0; @typescript-eslint/parser@8.67.0
#    supports eslint ^10.0.0 and typescript <6.1.0 (i.e. NOT typescript@7,
#    confirming the TS-6-not-7 guidance above).
bun add -d eslint@^10 eslint-plugin-astro@^3.1 @typescript-eslint/parser@^8.67

# 6. Utility CSS deps jass.gg already relies on (cva/clsx/tailwind-merge
#    pattern) — no scaffold for these, hand-add if the rewrite keeps the
#    same component-variant pattern.
bun add class-variance-authority@^0.7 clsx@^2.1 tailwind-merge@^3.6 tw-animate-css@^1.4

# 7. Type checking. Already wired by step 1's tsconfig; add the checker CLI:
bun add -d @astrojs/check@^0.9 typescript@6.0.3
```

**No scaffold exists for:**
- Prettier config file (`.prettierrc`/`prettier.config.*`) — hand-write it.
- ESLint's Astro-specific flat config (`eslint.config.mts`) — hand-write/port it; `eslint --init` does not produce a usable Astro setup.
- CI workflow (`.github/workflows/*.yml`) — no `gh` or Astro scaffold generates one; hand-write, keep it to one workflow (t3code's 11-workflow, Blacksmith-runner, `pr-vouch`/`pr-size`/mobile-EAS apparatus is entirely team/monorepo overhead — see §7).
- Vercel config — do **not** hand-write a `vercel.ts`/`vercel.json` at all. That file exists in t3code purely because a monorepo build needs a `--filter @t3tools/marketing` scoped install/build command; a single-package repo's Vercel git integration needs zero config (which is exactly jass.gg's current setup — leave it as-is).
- Git hooks — `vite-plus`'s `staged` block has no standalone equivalent to scaffold; if jass.gg wants a pre-commit formatter, that's a separate decision (husky/lefthook/simple-git-hooks), not something t3code's approach transfers cleanly (it's bundled into a tool jass.gg isn't adopting).

**On Bun as package manager:** no reason found not to keep it. Astro's own scaffolder (`create-astro`) is package-manager-agnostic and was invoked here via `bun create` successfully; `astro add tailwind` also ran cleanly under `bunx`. Nothing in t3code's setup (pnpm catalogs, `vite-plus`) is Astro- or Tailwind-specific — it's monorepo tooling unrelated to the package manager choice itself. Bun 1.3.14 is confirmed current.

## 7. Transferability caveats

Do **not** carry these over from t3code. Each solves a problem a single-author, four-page personal site does not have:

- **`vite-plus` (the `vp` CLI).** A monorepo task runner (`vp run --filter @t3tools/marketing`, `vp lint`, `vp fmt`, `vp check`). `--filter` is meaningless with one package. Adopting it would also mean running `npm install -g vite-plus` as part of a Vercel build (per `apps/marketing/vercel.ts`'s `installCommand`), replacing a currently-working zero-config Vercel deploy with a global package install step, for a tool whose licensing/pricing **could not be determined** from this public repo (it's an external VoidZero package, no source in `pingdotgg/t3code`).
- **pnpm + `catalog:`.** Catalogs exist to pin one version of a dependency *across many packages*. A single-package repo has nothing to catalog. This is not a reason to drop Bun.
- **`oxlint-plugin-t3code`.** A hand-written lint plugin (`oxlint-plugin-t3code/rules/*`) enforcing t3code's own internal conventions (e.g. "no global `process` at runtime," "namespace Node built-in imports") — irrelevant to a personal Astro site.
- **`tsgo` / `@effect/tsgo` / `@effect/language-service`.** Root `tsconfig.base.json`'s `plugins` block is ~30 Effect-specific diagnostic toggles (`strictEffectProvide`, `globalFetchInEffect`, etc.) for a codebase that uses the Effect library elsewhere (`apps/server`). Notably, `apps/marketing/tsconfig.json` doesn't even extend this file — proof that even t3code itself considers it inapplicable to the marketing app.
- **CI apparatus.** Blacksmith 8-vCPU runners, sparse checkout excluding `.repos/`, `pr-vouch.yml`, `pr-size.yml`, three separate mobile EAS/fingerprint workflows, a Rust `cargo fmt --check` step for a native resource monitor — 11 workflow files in total, none of which reference "marketing" by name. A single-repo personal site's CI should be one short workflow (lint, typecheck, build), not a scaled-down copy of this.
- **`apps/marketing/vercel.ts`.** Exists only to give Vercel a monorepo-filtered `installCommand`/`buildCommand`. A single-package repo's Vercel git integration needs no such file — jass.gg's current no-config Vercel setup is already the right shape, not a gap to fill.
- **`.repos/alchemy-effect/`'s Tailwind + React-islands marketing site.** This is a vendored third-party reference project bundled into the repo for agent context, not t3code's own tooling — do not cite it as evidence of what t3code "does," and do not confuse its Tailwind/islands architecture with `apps/marketing`'s actual (Tailwind-free, island-free) approach.

The actual lesson from t3code is not its toolchain — it's that a company shipping a real desktop/mobile/web product still wrote its own marketing site as plain Astro, hand-written CSS, and two inline scripts, with all the tooling sophistication concentrated in the app tier and none of it leaking into the marketing tier. That's the discipline worth copying, not the pnpm workspace.
