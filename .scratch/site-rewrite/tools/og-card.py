"""Regenerate public/og.png — the link-preview card (ticket 10).

    python3 .scratch/site-rewrite/tools/og-card.py

Run it from the repo root. Needs fontTools (`pip install fonttools`) and the
`sharp` that Astro already installs, and nothing else.

WHY IT WORKS THIS WAY. A card is one image of four words, so the usual answer —
satori, a headless browser, a build-time integration — would add a dependency
and a build step to produce a file that changes maybe once a year. Instead
fontTools reads the site's own woff2 files and hands back each glyph as an
outline, which gets written into the SVG as a `<path>`. The rasteriser is then
drawing shapes, not setting type: no font has to be installed anywhere, the
output is byte-identical on any machine, and the card cannot drift from the
faces the page actually uses because it is cut from the same files.

The card is the site in dark mode, which is not an arbitrary pick: `accent` in
dark mode *is* the invariant lime, so the wordmark on the card is the same
colour as the wordmark on the page. In light mode it would have to compromise
(see CONTEXT.md), and a card cannot respond to a theme anyway.

It carries the wordmark and the address and nothing else. Both platforms render
og:title and og:description as text beside the card, so anything the card says
in words, it says twice.
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "public" / "og.png"

BG = "#0a0a0a"  # --color-background, dark
LIME = "#d4fd80"  # --color-accent-mark
MUTED = "#a1a1a1"  # --color-muted-foreground, dark

# 1.91:1, the ratio Twitter and Discord both lay out against.
W, H = 1200, 630

# Positions are in final pixels, and they were arrived at by rendering and
# looking rather than by formula. Two constraints worth not breaking:
#
#   - Excalifont's `j` throws its descender tail well to the LEFT of the stem,
#     so the address needs real clearance beneath it or the tail lands on the
#     word. That is why the gap looks oversized as a number and correct on the
#     page.
#   - The address aligns to the `j`'s STEM, not to the ink edge of the block.
#     Aligning to the ink would hang it under the tail and read as a mistake.
#
# The pair is left-aligned to each other and the pair is centred, which is what
# the homepage does too: a left-aligned column, centred in the viewport.
WORDMARK = {"size": 300, "x": 316.7, "y": 315.6}
ADDRESS = {"size": 32, "x": 343.5, "y": 482, "tracking": 2.0}


def layout(font_path, text, size, x, y, tracking=0.0):
    """An SVG group drawing `text` in outlines, baseline origin at (x, y)."""
    font = TTFont(font_path)
    scale = size / font["head"].unitsPerEm
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()
    hmtx = font["hmtx"]

    parts = []
    pen_x = 0.0
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        if d := pen.getCommands():
            parts.append(f'<path d="{d}" transform="translate({pen_x:.2f} 0)"/>')
        pen_x += hmtx[name][0] + tracking / scale

    # Font units are y-up and SVG is y-down, so the group carries one flip and
    # the glyph paths themselves are left exactly as the font drew them.
    return (
        f'<g transform="translate({x} {y}) scale({scale:.6f} {-scale:.6f})">'
        f'{"".join(parts)}</g>'
    )


def main():
    fonts = ROOT / "src" / "fonts"
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<rect width="{W}" height="{H}" fill="{BG}"/>
<g fill="{LIME}">{layout(fonts / "Excalifont-Regular.woff2", "jass", **WORDMARK)}</g>
<g fill="{MUTED}">{layout(fonts / "IoskeleyMono-Regular.woff2", "jass.gg", **ADDRESS)}</g>
</svg>
"""

    with tempfile.NamedTemporaryFile("w", suffix=".svg") as f:
        f.write(svg)
        f.flush()
        # Rasterise at 4x and scale down: librsvg's own antialiasing leaves the
        # hand-drawn curves visibly stepped at 1x. `palette` matters more than
        # it sounds — the card is three flat colours, so an indexed PNG is an
        # order of magnitude smaller than truecolour with no visible loss.
        subprocess.run(
            [
                "node",
                "-e",
                """
                const sharp = require("sharp");
                const [src, out, w, h, bg] = process.argv.slice(1);
                sharp(src, { density: 288 })
                  .resize(Number(w), Number(h))
                  .flatten({ background: bg })
                  .png({ compressionLevel: 9, palette: true })
                  .toFile(out)
                  .then((i) => console.log(JSON.stringify(i)));
                """,
                f.name,
                str(OUT),
                str(W),
                str(H),
                BG,
            ],
            cwd=ROOT,
            check=True,
        )

    print(f"wrote {OUT.relative_to(ROOT)}", file=sys.stderr)


main()
