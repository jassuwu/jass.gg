/** All six stay (ticket 06). */
export const URLS = {
  RESUME: "/resume.pdf",
  TWITTER: "https://x.com/jassdotgg",
  GITHUB: "https://github.com/jassuwu",
  DISCORD: "https://discord.com/users/421489076978450445",
  LINKEDIN: "https://www.linkedin.com/in/kprnv",
  EMAIL: "mailto:jass@jass.gg",
} as const;

export const USERNAMES = {
  TWITTER: "jassdotgg",
  GITHUB: "jassuwu",
  DISCORD: "jassdotgg",
  LINKEDIN: "kprnv",
} as const;

/**
 * The socials row, in jass's order and with his labels. Shared because
 * `/llms.txt` lists the same six and a second hand-kept copy of the same six is
 * how a list starts disagreeing with itself.
 */
export const SOCIALS = [
  { label: "résumé", href: URLS.RESUME },
  { label: "twitter", href: URLS.TWITTER },
  { label: "github", href: URLS.GITHUB },
  { label: "discord", href: URLS.DISCORD },
  { label: "linkedin", href: URLS.LINKEDIN },
  { label: "email", href: URLS.EMAIL },
] as const;
