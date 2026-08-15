/**
 * The "live signal" settled in ticket 04: a build-time stamp, not a clock.
 *
 * Derived from the last commit that touched content rather than from build
 * time, because build time lies — a redeploy with no changes would claim the
 * site was touched when it wasn't, which is the exact dishonesty a stamp like
 * this exists to avoid. If git isn't available (it always is on Vercel, but
 * still), it degrades to build time rather than failing the build.
 *
 * It also carries the commit URL, so the stamp can link to the thing it is
 * claiming. A date on its own is an assertion; a date that hands you the diff
 * is evidence.
 *
 * Runs once, at build, in Astro's frontmatter. Nothing ships to the browser.
 */
import { execSync } from "node:child_process";

const TRACKED = ["src/data", "src/pages", "src/layouts", "src/styles"];

const REPO = "https://github.com/jassuwu/jass.gg";

export interface LastTouched {
  date: Date;
  /** Absent when git isn't available, which is the only case with no commit. */
  commitUrl?: string;
}

/* The commit's subject line used to ride along here, revealed under the stamp
   on hover. jass killed it in ticket 19: nobody cares what commit he made on
   a portfolio site. The date and its link were always the whole claim. */
function lastContentCommit(): LastTouched {
  try {
    const [iso, sha] = execSync(
      `git log -1 --format=%cI%n%H -- ${TRACKED.join(" ")}`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    )
      .trim()
      .split("\n");
    const date = new Date(iso ?? "");
    if (Number.isNaN(date.getTime()) || !sha) return { date: new Date() };
    return { date, commitUrl: `${REPO}/commit/${sha}` };
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
