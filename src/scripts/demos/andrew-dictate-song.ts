/**
 * THE PUN COMPLETES (ticket 21). The entry is named andrew-dictate; the joke
 * only lands if you've heard the edits. So on dwell the row hums its own
 * source material: 4.6 seconds of the sped-up "tourner dans le vide" phrase —
 * THE tate edit song — at a whisper. The sound OF the meme the name is made
 * of, which is the only sound this row could honestly make.
 *
 * Whisper tier because a dwell is not consent (the ladder), and the tap
 * keeps the same whisper: jass tuned this level to his own ear, and one act
 * gets one loudness. One phrase per entry: the clip is cut to end on its
 * own, nothing loops, and `once` stays unset — re-dwelling or re-tapping
 * the description replays it, the way you'd elbow the same friend twice.
 * On touch the tap is the only way in, and it works from the very first:
 * the bus wakes on pointerup and the click lands after, so the tap that
 * asks is the gesture that opens the gate.
 *
 * Nothing visible changes, ever — except the `data-acts` cursor the
 * registration buys the description, which is the tap saying it's a handle.
 * The name still just navigates.
 *
 * The asset is 28 KB of mono mp3 (mp3 because Safari's decodeAudioData still
 * won't touch ogg/opus) and it never loads at rest — the bus fetches on
 * first play, which can only happen after the reader's first real gesture.
 * Mute, hidden tab: the bus holds those rules. Reduced motion: friend.ts
 * would hold it too, but the register below bails first — with no `still`
 * the act is unreachable there, and a row that can't act stays bare.
 */
import { entry } from "@/scripts/friend";
import { play } from "@/scripts/sound";

export function register(): void {
  const el = document.querySelector('li[data-entry="andrew-dictate"]');
  if (!el) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  entry({
    el,
    sound: true,
    // level 0.4 under the whisper tier (0.08 × 0.4 = 0.032): the clip runs
    // hot at the shared floor, and jass asked for "even less volume" —
    // audible if you're listening, deniable if you weren't. His ear owns
    // this number.
    act: () =>
      play({ tier: "whisper", level: 0.4, url: "/sounds/andrew-dictate.mp3" }),
  });
}
