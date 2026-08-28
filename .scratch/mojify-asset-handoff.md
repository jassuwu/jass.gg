# mojify asset handoff

The mojify row's takeover is wired. astro.config.mjs checks for
`public/demos/mojify.frames.json` at build (a Vite define the player reads),
and without it the player registers nothing — the row is bare, no request,
no 404. With it, the row arms. Rebuild (or restart `bun run dev`) after the
file changes; that is the whole probe. Only you can make
it exist, because the asset is the product's own output: real colored-text
frames from `mojify export`, not a re-creation. This doc is the whole
recipe.

## 1. export the frames

mojify's text export is single-frame by design (`--duration` is rejected
for `.ansi` — docs/qa/export.md), so a text *video* is a loop over `--at`.
Pick ~3–4 seconds of a clip with motion and color — the header GIF's own
source animation would be the most on-brand choice, but any local video or
yt-dlp URL works:

```bash
CLIP=/path/to/source.mp4   # a REAL file — or a yt-dlp URL, quoted
START=0           # seconds into the source
SECS=8
FPS=15
WIDTH=120         # character columns
OUT=/tmp/mojify-frames
mkdir -p "$OUT"
for i in $(seq 0 $((FPS * SECS - 1))); do
  t=$(awk -v s="$START" -v i="$i" -v f="$FPS" 'BEGIN { printf "%.3f", s + i / f }')
  mojify export --overwrite --width "$WIDTH" --at "${t}s" "$CLIP" \
    "$OUT/$(printf '%04d' "$i").ansi"
done
```

`--width` is character columns for text output. 120 columns, 15fps, 8s is
the current shape (jass, aug 28: the 60-column version was too coarse —
"a lot more detail", "a little bit longer"); the player scales any grid and
lets the box grow past the row (up to 960px) so a hundred-odd columns stay
glyphs. The budget is 300 KB gzipped, which 120×8×15 just fits for a sparse
clip; a dense one may need 12fps or a coarser step, and the converter says
which. Default recipe, on purpose: it's the truecolor one, and truecolor is
the point.

## 2. convert to the player's format

```bash
bun .scratch/mojify-asset/convert.ts /tmp/mojify-frames "$FPS" public/demos/mojify.frames.json
```

The fps argument must match the export loop's `FPS`. The converter parses
the ANSI escapes, RLE-encodes same-color runs, and enforces the 300 KB
budget itself — it quantizes colors progressively harder until the film
fits, and if it can't fit even then it fails loudly and tells you which
knob to turn (columns, fps, seconds). It never writes a heavy asset
quietly.

## 3. how to check it worked

- the converter printed a summary ending in `→ public/demos/mojify.frames.json` and exited 0
- `bun run dev`, hover the mojify row for half a second (or tap its description): the clip plays once over the row, in real selectable-looking text, then the page is back
- with the file deleted again and dev restarted, the row's description has no pointer cursor and dwelling does nothing — that's the dormant state, and it must survive

## what's in there now (aug 28)

The eye — jass's source: https://www.youtube.com/watch?v=B6ZrAaGpsNI
(11.3s, 1280×720; pulled once with yt-dlp at ≤720p, then exported from the
local file so 120 runs don't re-resolve the URL). Seconds 1.5–9.5, 160
columns (160×90 cells), 15fps, 120 frames: 2.8 MB raw, 229 KB gzipped,
~1k runs a frame. The converter coarsened the colour step to 16 to fit —
invisible at that cell size. `START=1.5 SECS=8 FPS=15 WIDTH=160` on the
downloaded file reproduces it; 120 columns lands at 184 KB gzipped (step
8, ~700 runs a frame) if the 160 ever reads as pixels rather than glyphs.
