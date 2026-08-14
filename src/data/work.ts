/**
 * Work history. In code rather than a collection: three entries that change
 * about once a year don't need a loader and a schema.
 *
 * Recruiters are the fallback audience and the résumé PDF already serves them,
 * so this is not a CV — it's context for a peer skimming the page. Ticket 08
 * renders it "cleverly, in less space, in tone with the rest of the site"
 * (jass's words), which is why there are no bullet points here to render.
 *
 * The shape is the interesting part: cypher → stealth → cypher. He left and
 * came back. That's a story a peer reads instantly and a bulleted list hides —
 * worth leaning on rather than flattening into three equal rows.
 */
export interface Job {
  company: string;
  role: string;
  /** Display string, not a date — the range is the unit, and "now" is honest. */
  period: string;
  location: string;
  homepage?: string;
}

export const WORK: readonly Job[] = [
  {
    company: "cypher",
    role: "software developer",
    period: "oct 2025 — now",
    location: "chennai",
    homepage: "https://cypherhq.io",
  },
  {
    company: "stealth defi protocol",
    role: "software developer",
    period: "jan 2024 — sep 2025",
    location: "remote",
  },
  {
    company: "cypher",
    role: "frontend intern",
    period: "may 2023 — dec 2023",
    location: "chennai",
    homepage: "https://cypherhq.io",
  },
] as const;
