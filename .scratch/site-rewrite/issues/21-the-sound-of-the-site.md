# The sound of the site

Type: prototype (HITL)
Status: built (fable workflow, aug 15) — the bus (1,181 B minified) and all
ten cues are on the branch, one commit each, verified in-browser except by
ear. Open pending jass's listening pass: the whisper gain (`GAIN.whisper`
in `src/scripts/sound.ts`) is the knob, the mute egg is the © line. The
vergil cut's ring was cut to fade with the strip drift so the snap home
lands in silence; the touch cat walk is silent by geometry (its synthetic
cursor never enters the rest radius); unmute plays no confirmation, because
a confirmation sound is a UI bleep.
Follows: the nine details of tickets 13/15/16/18/19

## The grammar (approved, do not re-derive)

1. **Silence is the resting state.** No ambience, no background loop, ever.
   Sound only ever belongs to an act.
2. **The volume ladder is the consent ladder.** Dwell/scroll-dwell acts
   whisper (gain ≈ 0.08, tuned by jass's ear later); click-armed acts speak
   at full. jass's own instinct, made a rule.
3. **Every sound is the sound OF something** — the product's own audio, the
   material's audio (paper, machine, hand), or the meme that is itself the
   reference. No generic UI bleeps. The per-detail test, in audio.
4. **One mouth.** A single audio bus; a new act ducks the previous. The
   friend never talks over itself.
5. **Dead acts make no sound.** Reduced-motion acts don't run, so their audio
   dies with them. Hidden tab: silent. And the browser's own law: **nothing
   can sound before the reader's first click/tap/keypress** (hover is not
   user activation) — the whisper layer arms silently and wakes on the first
   gesture anywhere.

## The beat map (approved)

- **savemefrom**: the centerpiece. Click: the cut with its real slash audio
  at full (the re-encode stripped audio; it comes back synced). Hover: at
  most a faint shing, or nothing — the click is the beat, not the hover.
- **andrew-dictate**: the pun completes — a few seconds of the tate meme
  song at a whisper on dwell, one phrase, no loop.
- **ass**: its own foley — a quiet slap on dwell. The product ships a foley
  engine; this is the most diegetic sound available.
- **onandemo**: silent chase, one short "nya" at the moment the cat CATCHES
  the cursor. Timing over wallpaper.
- **liquid-glass**: one soft droplet on effect-on, one on effect-off. No
  continuous watery bed.
- **signature re-sign** (dwell, post-unlock): faint pen scratch locked to
  the existing stroke timing, dot last. The load signing stays silent —
  policy and taste agree.
- **toys**: each letter a soft synthesized marimba-ish pitch; poking
  t-o-y-s in order plays a four-note lick. Zero assets.
- **agents gag**: one faint mouse-click as the ghost starts its selection,
  one on release.
- **quilt**: silence. No invented decoration.

## Named refusals (approved)

Link hovers and the underline draw: silent forever. The 404 monitor: stays
muted (funnier object; clips carry no audio stream anyway). The 2am murmur:
text only.

## Settled decisions

- **Default-on behind the first-gesture gate, no visible toggle.**
- **The mute egg is approved**: clicking the footer's copyright line mutes
  the site — "all rights reserved, none exercised" becomes literal when
  exercised. Persisted for the visit (friend: prefix), deadpan, no tooltip.
- **The whisper level is jass's kill pass** — set by ear on real speakers
  and a real phone; the build ships a starting gain, not a verdict.

## Build shape

`src/scripts/sound.ts` is the bus (unlock gate, tiers, ducking, lazy sample
loading, small synth helpers) and is built FIRST; every cue then codes
against its API in the cue's own module file, same ownership map as the
visual pass. Two new stub modules (andrew-dictate-song, ass-slap) join the
call sheet since those rows had no demo module. Meme assets fetched short,
mono, low-bitrate, lazy — a few seconds each, tens of KB, never loaded
before unlock plus first need.

## Done when

The cues are live, the bus holds the grammar, and jass has set the whisper
level with his own ears — or killed whatever fails it.
