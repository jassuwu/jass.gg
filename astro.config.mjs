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
  },
});
