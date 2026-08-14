/**
 * The "live signal" settled in ticket 04: a build-time stamp, not a clock.
 *
 * Derived from the last commit that touched content rather than from build
 * time, because build time lies — a redeploy with no changes would claim the
 * site was touched when it wasn't, which is the exact dishonesty a stamp like
 * this exists to avoid. If git isn't available (it always is on Vercel, but
 * still), it degrades to build time rather than failing the build.
 *
 * Runs once, at build, in Astro's frontmatter. Nothing ships to the browser.
 */
import { execSync } from "node:child_process";

const TRACKED = ["src/data", "src/pages", "src/layouts", "src/styles"];

function lastContentCommit(): Date {
  try {
    const iso = execSync(`git log -1 --format=%cI -- ${TRACKED.join(" ")}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
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
