/**
 * The "live signal" settled in ticket 04: a build-time stamp, not a clock.
 *
 * Derived from the last commit that touched content rather than from build
 * time, because build time lies — a redeploy with no changes would claim the
 * site was touched when it wasn't, which is the exact dishonesty a stamp like
 * this exists to avoid. If git isn't available (it always is on Vercel, but
 * still), it degrades to build time rather than failing the build.
 *
 * The sha stays off the page. The date is the claim; the commit is only how
 * we found it.
 *
 * Runs once, at build, in Astro's frontmatter. Nothing ships to the browser.
 */
import { execSync } from "node:child_process";

/* Everything that ships is content. The old list (data/pages/layouts/styles)
 * predated the friend: a new act in src/scripts, a reworked component, a new
 * sound in public/ — each is exactly the kind of touch the stamp exists to
 * claim, and none of them moved it. The repo's non-site surfaces (.scratch,
 * README, resume sources, configs) stay excluded by not being listed. */
const TRACKED = ["src", "public"];

export interface LastTouched {
  date: Date;
}

/* The stamp used to link to the commit and reveal its subject on hover.
   jass killed both: nobody cares what commit he made on a portfolio site.
   The date is the whole claim. */
function lastContentCommit(): LastTouched {
  const log = (args: string): string => {
    try {
      return execSync(`git log -1 --format=%cI ${args}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      return "";
    }
  };
  /* A shallow CI clone can have no in-window commit touching TRACKED, and an
   * empty result used to flow through new Date("") into the build-time
   * fallback — the stamp asserting the site was touched today because the
   * clone was too shallow to know better. HEAD's own date is the honest
   * degrade: a real commit's real date, at worst slightly newer than the
   * true last touch, never the deploy clock. Build time remains only for
   * the no-git-at-all case the original comment already accepted. */
  const iso = log(`-- ${TRACKED.join(" ")}`) || log("");
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return { date: new Date() };
  return { date };
}

export const LAST_TOUCHED = lastContentCommit();

/** "14 aug 2026" — lowercase, to match everything else on the page. */
export function formatStamp(date: Date): string {
  return date
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toLowerCase();
}
