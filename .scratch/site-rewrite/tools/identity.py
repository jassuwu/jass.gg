"""Regenerate the identity assets — the link-preview card and the favicon.

    python3 .scratch/site-rewrite/tools/identity.py

Run it from the repo root. Needs fontTools (`pip install fonttools`) and the
`sharp` that Astro already installs, and nothing else. It writes:

    public/og.png       1200x630, the card Discord and Twitter show
    public/favicon.svg  the tab mark, and what every current browser uses
    public/favicon.png  32x32, for the browsers that predate SVG favicons

WHY IT WORKS THIS WAY. These are four words and one letter, drawn maybe once a
year, so the usual answer — satori, a headless browser, a build-time
integration — would add a dependency and a build step to produce files that
never change. Instead fontTools reads the site's own woff2 files and hands back
each glyph as an outline, which gets written into the SVG as a `<path>`. The
rasteriser is then drawing shapes rather than setting type: no font installed
anywhere, output identical on any machine, and the assets cannot drift from the
faces the page uses because they are cut from the same files.

Both marks are the site in dark mode, which is forced rather than chosen. In
dark mode `accent` *is* the invariant lime, so the wordmark on the card is the
same colour as the wordmark on the page; light mode would have to compromise
(see CONTEXT.md), and neither an OG image nor a favicon can respond to a theme.
"""

import subprocess
import sys
import tempfile
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[3]
FONTS = ROOT / "src" / "fonts"
PUBLIC = ROOT / "public"

HAND = FONTS / "Excalifont-Regular.woff2"
MACHINE = FONTS / "IoskeleyMono-Regular.woff2"

BG = "#0a0a0a"  # --color-background, dark
LIME = "#d4fd80"  # --color-accent-mark
MUTED = "#a1a1a1"  # --color-muted-foreground, dark
ON_ACCENT = "#0a0a0a"  # --color-on-accent


def glyphs(font_path, text):
    """Outlines for `text` in font units, with the ink box and total advance."""
    font = TTFont(font_path)
    upm = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font["hmtx"]

    paths, pen_x, box = [], 0.0, None
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[name].draw(pen)
        if d := pen.getCommands():
            paths.append(f'<path d="{d}" transform="translate({pen_x:.2f} 0)"/>')
        bounds = BoundsPen(gs)
        gs[name].draw(bounds)
        if bounds.bounds:
            x0, y0, x1, y1 = bounds.bounds
            b = (pen_x + x0, y0, pen_x + x1, y1)
            box = b if box is None else (
                min(box[0], b[0]), min(box[1], b[1]),
                max(box[2], b[2]), max(box[3], b[3]),
            )
        pen_x += hmtx[name][0]
    return "".join(paths), box, upm


def baseline(font_path, text, size, x, y, tracking=0.0):
    """A group drawing `text` with its baseline origin at (x, y), in px."""
    font = TTFont(font_path)
    upm = font["head"].unitsPerEm
    cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]
    scale = size / upm

    paths, pen_x = [], 0.0
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[name].draw(pen)
        if d := pen.getCommands():
            paths.append(f'<path d="{d}" transform="translate({pen_x:.2f} 0)"/>')
        pen_x += hmtx[name][0] + tracking / scale

    # Font units are y-up and SVG is y-down, so the group carries one flip and
    # the glyph paths themselves are left exactly as the font drew them.
    return (
        f'<g transform="translate({x} {y}) scale({scale:.6f} {-scale:.6f})">'
        f'{"".join(paths)}</g>'
    )


# ---------------------------------------------------------------- the card

CARD_W, CARD_H = 1200, 630  # 1.91:1, what Twitter and Discord lay out against

# Found by rendering and looking, not by formula. Two constraints worth not
# breaking:
#
#   - Excalifont's `j` throws its descender tail well to the LEFT of the stem,
#     so the address needs real clearance beneath the word or the tail lands on
#     it. That is why the gap looks oversized as a number and correct on screen.
#   - The address aligns to the `j`'s STEM, not to the ink edge of the block.
#     Aligning to the ink hangs it under the tail and reads as a mistake.
#
# The pair is left-aligned to each other and the pair is centred, which is what
# the homepage does too: a left-aligned column, centred in the viewport.
#
# The card carries the wordmark and the address and nothing else. Both platforms
# render og:title and og:description as text beside it, so anything the card
# says in words, it says twice.
WORDMARK = {"size": 300, "x": 316.7, "y": 315.6}
ADDRESS = {"size": 32, "x": 343.5, "y": 482, "tracking": 2.0}


def card():
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{CARD_W}" height="{CARD_H}" viewBox="0 0 {CARD_W} {CARD_H}">
<rect width="{CARD_W}" height="{CARD_H}" fill="{BG}"/>
<g fill="{LIME}">{baseline(HAND, "jass", **WORDMARK)}</g>
<g fill="{MUTED}">{baseline(MACHINE, "jass.gg", **ADDRESS)}</g>
</svg>
"""


# ------------------------------------------------------------- the favicon

TILE = 64  # viewBox units; the SVG scales, this is just working precision

# 11% each side. A favicon is judged at 16px and nowhere else, and at 16px the
# `j` is about a pixel and a half of stroke — every point of padding is taken
# straight out of the only thing anyone can see. The tile does the recognising
# anyway: lime at this size is a signal long before the letter resolves.
TILE_PAD = 0.11


def favicon():
    """A lime tile with a dark `j` — `on-accent` on `accent-mark`.

    That token pair exists for exactly this and nothing else on the site had
    ever used it. It is also the only mark here that reads at 16px: the accent
    is the one colour that is allowed to be a fill, and a fill is the only thing
    that survives being sixteen pixels wide.

    The letter is the wordmark's own `j`, so the tab and the page are cut from
    one signature rather than two.
    """
    paths, (x0, y0, x1, y1), _ = glyphs(HAND, "j")

    inner = TILE * (1 - 2 * TILE_PAD)
    scale = inner / (y1 - y0)  # fit by HEIGHT: `j` is 2.6x taller than it is wide
    tx = (TILE - (x1 - x0) * scale) / 2 - x0 * scale
    ty = (TILE - inner) / 2 + y1 * scale

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {TILE} {TILE}">'
        f'<rect width="{TILE}" height="{TILE}" fill="{LIME}"/>'
        f'<g transform="translate({tx:.3f} {ty:.3f}) scale({scale:.6f} {-scale:.6f})"'
        f' fill="{ON_ACCENT}">{paths}</g></svg>\n'
    )


# ------------------------------------------------------------------ output

# Rasterise well above the target and scale down: librsvg's own antialiasing
# leaves hand-drawn curves visibly stepped at 1x. `palette` matters more than it
# sounds — both images are two or three flat colours, so an indexed PNG is an
# order of magnitude smaller than truecolour with nothing lost.
RASTER = """
const sharp = require("sharp");
const [src, out, w, h, bg, density] = process.argv.slice(1);
sharp(src, { density: Number(density) })
  .resize(Number(w), Number(h))
  .flatten({ background: bg })
  .png({ compressionLevel: 9, palette: true })
  .toFile(out);
"""


def rasterise(svg, out, w, h, bg, density):
    with tempfile.NamedTemporaryFile("w", suffix=".svg") as f:
        f.write(svg)
        f.flush()
        subprocess.run(
            ["node", "-e", RASTER, f.name, str(out), str(w), str(h), bg, str(density)],
            cwd=ROOT,
            check=True,
        )


def main():
    rasterise(card(), PUBLIC / "og.png", CARD_W, CARD_H, BG, 288)

    mark = favicon()
    (PUBLIC / "favicon.svg").write_text(mark)
    # The PNG is a fallback for browsers that predate SVG favicons, and 32 is
    # the only size worth shipping: 16 is what a tab shows and every browser
    # downscales cleanly to it, while anything larger is an icon nobody asks
    # this site for.
    rasterise(mark, PUBLIC / "favicon.png", 32, 32, LIME, 1200)

    for name in ("og.png", "favicon.svg", "favicon.png"):
        p = PUBLIC / name
        print(f"  {name:14} {p.stat().st_size:>7,} bytes", file=sys.stderr)


main()
