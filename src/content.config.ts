import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * The profile README at github.com/jassuwu/jassuwu is the source of truth for
 * what exists (ticket 06). It's the list that actually gets maintained — it had
 * andrew-dictate before the site did, and dropped psgoogle before the site did.
 * When they disagree, the README wins.
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/projects" }),
  schema: z.object({
    name: z.string(),
    /** One lowercase line, in the README's voice. Not a paragraph. */
    description: z.string(),
    /** The README's own split. `thing` is work; `toy` is play. */
    kind: z.enum(["thing", "toy"]),
    github: z.url(),
    /** Live demo, where one exists. Most are subdomains of jass.gg. */
    link: z.url().optional(),
    /** Sorting only — never rendered. Newest first. */
    date: z.coerce.date(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    /**
     * Unwritten posts are stubs and must not render as if they were finished.
     * Everything previously here was AI-written and has been deleted; jass
     * writes the replacements himself.
     */
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
