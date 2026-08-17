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

const TRACKED = ["src/data", "src/pages", "src/layouts", "src/styles"];

export interface LastTouched {
  date: Date;
}

/* The stamp used to link to the commit and reveal its subject on hover.
   jass killed both: nobody cares what commit he made on a portfolio site.
   The date is the whole claim. */
function lastContentCommit(): LastTouched {
  try {
    const iso = execSync(`git log -1 --format=%cI -- ${TRACKED.join(" ")}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return { date: new Date() };
    return { date };
  } catch {
    return { date: new Date() };
  }
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
