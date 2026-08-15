/**
 * THE PUN COMPLETES (ticket 21). The entry is named andrew-dictate; the joke
 * only lands if you've heard the edits. So on dwell the row hums its own
 * source material: 4.6 seconds of the sped-up "tourner dans le vide" phrase —
 * THE tate edit song — at a whisper. The sound OF the meme the name is made
 * of, which is the only sound this row could honestly make.
 *
 * Whisper tier because a dwell is not consent (the ladder). One phrase per
 * dwell: the clip is cut to end on its own, nothing loops, and `once` stays
 * unset — re-dwelling replays it, the way you'd elbow the same friend twice.
 *
 * Nothing visible changes, ever. The row already navigates; this act adds no
 * pixels to it.
 *
 * The asset is 28 KB of mono mp3 (mp3 because Safari's decodeAudioData still
 * won't touch ogg/opus) and it never loads at rest — the bus fetches on
 * first play, which can only happen after the reader's first real gesture.
 * Reduced motion, mute, hidden tab: friend.ts and the bus already hold those
 * rules; nothing to re-gate here.
 */
import { ambient } from "@/scripts/friend";
import { play } from "@/scripts/sound";

export function register(): void {
  const el = document.querySelector('li[data-entry="andrew-dictate"]');
  if (!el) return;
  ambient({
    el,
    act: () => play({ tier: "whisper", url: "/sounds/andrew-dictate.mp3" }),
  });
}
