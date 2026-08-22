# One address

Type: task (mostly AFK after one HITL decision)
Status: open
Blocked by: nothing

## Question

Every canonical URL the site declares points at a URL that redirects away
from itself: `astro.config.mjs` says `site: "https://jass.gg"` (apex), the
live apex 307s every path to `www.jass.gg`, and `resume.json` already
says `www`. Crawlers read a canonical that isn't where the page lives.
Finding: [site-audit.md](../research/site-audit.md) §4.

**The one decision (jass):** apex or www? Then, mechanically:

1. Align `site:` in `astro.config.mjs` and the Vercel redirect direction
   (whichever way the decision goes — one of the two flips).
2. `resume.json` `basics.url` agrees.
3. `URLS.DISCORD` → `discord.com` (domain migrated; currently a 301 hop).
4. `vercel.json` headers block: real `max-age`/`stale-while-revalidate`
   for unhashed `public/` assets (og.png, resume.pdf — currently
   `max-age=0`, revalidated every hit).
5. Free while in there: `robots.txt` (currently 404s; inert but standard),
   `noindex` meta on the 404 (defense-in-depth; the real 404 status
   already does the work), `og:site_name`.
6. Decide-and-record: apple-touch-icon. The layout comment says "nothing
   asks this site for one" — iOS Add-to-Home-Screen does, and its absence
   means the home-screen tile is a page screenshot instead of the lime
   favicon built to do exactly that job at small sizes.
