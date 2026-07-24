import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    tags: z.array(z.string()),
    bannerImage: z.string().optional(),
    bannerImageAlt: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/projects" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    github: z.url(),
    link: z.url().optional(),
    thumbnail: z.string().optional(),
    thumbnailAlt: z.string().optional(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };
