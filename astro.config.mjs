// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// All three families are SIL OFL 1.1, so self-hosting and redistribution are
// fine. Astro downloads and serves every one of them from our own origin —
// including the Google-provided one — so the site makes no third-party font
// request at all.
//
// The roles are fixed (ticket 03): Baskervville is the paper, IoskeleyMono is
// the machine, Excalifont is the margin.

// https://astro.build/config
export default defineConfig({
  site: "https://jass.gg",

  fonts: [
    {
      // The paper. Body and prose.
      //
      // Baskervville ships ONE weight. Google's CSS API will happily answer a
      // request for 700, but it hands back the 400 file — verified by md5, the
      // two are byte-identical. Declaring a 700 face is therefore worse than
      // not declaring one: `font-bold` renders as regular AND the browser
      // stops synthesising bold, because a matching face exists.
      //
      // So the paper role has no bold. Emphasis is italic (a real, separate
      // face) or it moves to the machine role. See ticket 03's answer.
      name: "Baskervville",
      cssVariable: "--font-baskervville",
      provider: fontProviders.google(),
      weights: [400],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "Times New Roman", "serif"],
    },
    {
      // The ampersand, and nothing else — 676 bytes containing one glyph.
      //
      // Baskervville's italic ampersand is a different drawing from its roman
      // one: the roman sets a symbol, the italic sets the `et` ligature it came
      // from, by hand. It is the best glyph in the family and the intro uses
      // two of them.
      //
      // Shipping the whole italic face for two characters would cost ~30 KB and
      // a swap flash on the two most decorative glyphs on the page, so this is
      // that face subset to U+0026 and nothing else. It goes FIRST in the paper
      // stack (see global.css) and everything it cannot draw — which is
      // everything — falls straight through to Baskervville proper.
      //
      // No fallbacks on purpose: a fallback here would swallow the whole
      // alphabet before Baskervville ever got a turn.
      //
      // Renamed rather than kept as "Baskervville", which is what OFL asks of a
      // modified copy. See src/fonts/LICENSES.md.
      name: "BaskervvilleAmpersand",
      cssVariable: "--font-ampersand",
      provider: fontProviders.local(),
      fallbacks: [],
      options: {
        variants: [
          // `style: "normal"` is declared, and it is deliberate. The file
          // carries an italic angle, so left alone Astro reads that and emits
          // `font-style: italic` — which would mean the face never matches in
          // roman body text, which is the only place it is ever wanted. The
          // glyph is drawn italic; the face is declared normal. That mismatch
          // IS the technique.
          {
            src: ["./src/fonts/BaskervvilleAmpersand.woff2"],
            weight: 400,
            style: "normal",
          },
        ],
      },
    },
    {
      // The machine. Dates, periods, repo names — anything factual.
      // Subset from ~480 KB/weight to ~34 KB; the upstream build is an Iosevka
      // config carrying thousands of glyphs we will never render.
      name: "IoskeleyMono",
      cssVariable: "--font-ioskeley",
      provider: fontProviders.local(),
      fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      options: {
        variants: [
          { src: ["./src/fonts/IoskeleyMono-Regular.woff2"], weight: 400 },
          { src: ["./src/fonts/IoskeleyMono-Bold.woff2"], weight: 700 },
        ],
      },
    },
    {
      // The margin. Annotation, asides, the meme reveals. Never a headline.
      name: "Excalifont",
      cssVariable: "--font-excalifont",
      provider: fontProviders.local(),
      fallbacks: ["Comic Sans MS", "cursive"],
      options: {
        variants: [
          { src: ["./src/fonts/Excalifont-Regular.woff2"], weight: 400 },
        ],
      },
    },
  ],

  vite: {
    plugins: [tailwindcss()],
    // Both demo packages load lazily, on first dwell. Left alone, Vite's dev
    // optimizer discovers each one the first time someone dwells and reloads
    // the whole page mid-act — once per package per dev session. Pre-bundling
    // them costs nothing in prod (Rollup ignores this) and keeps dev honest.
    optimizeDeps: {
      include: ["onandemo", "liquid-glass-cursor"],
    },
  },
});
