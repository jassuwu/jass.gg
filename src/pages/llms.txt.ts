import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { SOCIALS, URLS } from "@/constants";
import { INTRO, TAGLINE } from "@/intro";

/**
 * `/llms.txt` — the site, in the format an agent reads (Jeremy Howard's
 * convention; it came out of jass's own research directory).
 *
 * The intro says he shepherds agents and is scared of them. A site that then
 * hands a clean machine-readable copy of itself to agents is that sentence
 * landing a second time, and no human ever has to see it happen.
 *
 * It is generated from the same content collection the page renders, so it
 * cannot describe a site that doesn't exist — the failure mode of every
 * hand-maintained index. Nothing here is written for machines: every word is
 * jass's, in the same order the page puts it.
 *
 * One link per entry, pointing at the built thing, which is the page's rule
 * (ticket 06). Adding `github` as a second link would help an agent looking for
 * source and is a one-line change; it just hasn't been asked for.
 */
export const GET: APIRoute = async ({ site }) => {
  const projects = (await getCollection("projects")).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const absolute = (href: string) =>
    href.startsWith("/") && site ? new URL(href, site).href : href;

  const section = (id: string, lines: string[]) =>
    `## ${id}\n\n${lines.join("\n")}`;

  const entries = (kind: "thing" | "toy") =>
    projects
      .filter((p) => p.data.kind === kind)
      .map(
        (p) =>
          `- [${p.data.name}](${p.data.link ?? p.data.github}): ${p.data.description}`,
      );

  const body = [
    "# jass.gg",
    `> ${TAGLINE}`,
    INTRO,
    section("things", entries("thing")),
    section("toys", entries("toy")),
    // The page's writing section is one command and nothing explains the joke.
    // Explaining it here would be the only new sentence on the whole file.
    section("writing", [`- [git push -f origin twitter](${URLS.TWITTER})`]),
    section(
      "elsewhere",
      SOCIALS.map((s) => `- [${s.label}](${absolute(s.href)})`),
    ),
  ].join("\n\n");

  return new Response(`${body}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
