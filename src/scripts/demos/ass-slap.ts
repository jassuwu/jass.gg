/**
 * THE TOY SLAPS BACK (ticket 21, the ass row). ass is a soft-body slap toy
 * whose foley engine synthesizes every thwack on the spot — nothing sampled,
 * nothing shipped. So the row's sound is made the way the product makes it:
 * no asset, no fetch, a slap built from three physical layers —
 *
 *   the hand — a pinch of noise through a bandpass whose center falls fast,
 *              because the crack of a slap is broadband for only an instant
 *              before the surface swallows the highs;
 *   the body — a sine that drops pitch hard and dies, the hollow thump of
 *              something soft taking the hit;
 *   the jiggle — a faint low wobble trailing after, because a soft body
 *                keeps moving for a beat once the hand has left.
 *
 * Whisper tier, non-negotiable: dwell is the reader leaning in, not asking,
 * and the ladder says leaning gets a whisper. The bus owns the gate, the
 * mute and the mouth — before the first real gesture, muted, or in a hidden
 * tab, play() is a no-op and this module does not ask twice. Re-dwell
 * replays: ambient() with no `once` is exactly that, and a slap toy that
 * only slapped once would be a defective unit.
 *
 * Reduced motion: friend.ts never runs the act, so the audio dies with it.
 * No `still` — the honest static form of a slap is a toy at rest, which is
 * silence, which the page already has.
 */
import { ambient } from "@/scripts/friend";
import { play } from "@/scripts/sound";

/* Internal levels are staged so the mix peaks near 1.0 into the bus's gain
   node — the tier is the only volume knob, and it isn't ours. */
function slap(ctx: AudioContext, out: GainNode): void {
  const t = ctx.currentTime;

  /* the hand: 90ms of noise, bandpass sweeping 1800 → 500 Hz in 60ms. */
  const noise = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * 0.09),
    ctx.sampleRate,
  );
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const crack = ctx.createBufferSource();
  crack.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(1800, t);
  band.frequency.exponentialRampToValueAtTime(500, t + 0.06);
  const crackGain = ctx.createGain();
  crackGain.gain.setValueAtTime(0.7, t);
  crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  crack.connect(band).connect(crackGain).connect(out);
  crack.start(t);

  /* the body: 190 → 52 Hz in 70ms, gone by 130. The thump IS the slap; the
     noise above only sells the attack. */
  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(190, t);
  thump.frequency.exponentialRampToValueAtTime(52, t + 0.07);
  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(1, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
  thump.connect(thumpGain).connect(out);
  thump.start(t);
  thump.stop(t + 0.14);

  /* the jiggle: a 68 Hz sine, pitch-wobbled at 9 Hz with the wobble depth
     itself settling — the oscillation damping out. Swells in under the
     thump's tail, fades by 420ms. A tenth the level of the hit: a hint,
     not a second sound. */
  const wobble = ctx.createOscillator();
  wobble.type = "sine";
  wobble.frequency.value = 68;
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 9;
  const depth = ctx.createGain();
  depth.gain.setValueAtTime(14, t);
  depth.gain.linearRampToValueAtTime(2, t + 0.4);
  lfo.connect(depth).connect(wobble.frequency);
  const wobbleGain = ctx.createGain();
  wobbleGain.gain.setValueAtTime(0.0001, t);
  wobbleGain.gain.exponentialRampToValueAtTime(0.1, t + 0.09);
  wobbleGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  wobble.connect(wobbleGain).connect(out);
  wobble.start(t);
  wobble.stop(t + 0.45);
  lfo.start(t);
  lfo.stop(t + 0.45);
}

export function register(): void {
  const row = document.querySelector('[data-entry="ass"]');
  if (!row) return;
  ambient({
    el: row,
    act: () => play({ tier: "whisper", synth: slap }),
  });
}
