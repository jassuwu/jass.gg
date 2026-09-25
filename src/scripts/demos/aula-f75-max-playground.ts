/**
 * THE ROW SHOWS THE BOARD (the aula-f75-max-playground row). The product is
 * a keyboard: a python player drives the 80 leds of jass's aula f75 max over
 * usb, thirty frames a second, so the board becomes a screen you can also
 * play on. None of that can run on a web page. WebHID could light a reader's
 * own f75 max from here, and was declined: an act that works for the few
 * people who own the board and are on chromium is a promise the page mostly
 * can't keep. So this row does the one honest thing left for hardware: it
 * shows the footage. jass's own phone clip, cut to fourteen seconds, six of
 * snake and eight of bad apple, stabilised on the board's screen and its f3
 * indicator so the keyboard holds still. Muted, 308 KB, at
 * /demos/aula-f75-max-playground.mp4.
 *
 * It borrows the mojify takeover's whole body, because the act is the same
 * shape: a projection over the row on its own dark ground, no border,
 * `aria-hidden`, `pointer-events: none`; the region is the box plus a halo;
 * it plays once, holds the last frame a beat, and the page is back exactly
 * as it was. Re-dwell or re-tap replays, because consent repeats. The easy
 * out is the shared one. On hover devices the region is checked live on
 * pointermove and re-checked on scroll; on touch any scroll is walking away;
 * a hidden tab ends it; a resize only re-places the box.
 *
 * Nothing at rest: no element, no request. The clip is fetched on intent,
 * the pointer entering the row's section, or the first completed gesture
 * anywhere for a touch reader, never at rest and never twice. A clip that
 * fails to load retires the act for the visit, silently.
 *
 * Silent. The bad apple half has its song and the snake half has its blips,
 * and both stay on the x posts the readme links to. A dwell is not consent
 * to sound, and a clip playing mute is exactly what it looks like.
 *
 * Reduced motion: nothing registers, the vergil cut's precedent. Footage
 * with the motion removed is one frame pretending, and a bare row must not
 * grow a cursor that promises it.
 */
import { easyOut, entry, occupy } from "@/scripts/friend";

const SRC = "/demos/aula-f75-max-playground.mp4";
/* The clip's own shape, so the box is sized before any metadata lands. */
const ASPECT = 16 / 9;
/* The region's forgiveness: how far past the box a hand may drift. */
const HALO = 24;
/* Wider than the column on purpose, like the quilt; the clip is 640 wide
   and a keyboard needs the room to read as keys. */
const MAX_W = 720;
const EDGE = 12;
/* The last frame holds this long, so the ending reads as an ending. */
const HOLD_MS = 500;

export function register(): void {
  const row = document.querySelector<HTMLElement>(
    'li[data-entry="aula-f75-max-playground"]',
  );
  if (!row) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const pointerish = matchMedia("(hover: hover)");

  let lastX = 0;
  let lastY = 0;
  let live = false;
  let wanted = false;
  let dead = false;
  let timer: number | undefined;
  let box: HTMLElement | undefined;
  let video: HTMLVideoElement | undefined;
  let release: (() => void) | undefined;
  let offOut: (() => void) | undefined;
  let place = (): void => {};

  const inRegion = (x: number, y: number): boolean => {
    if (!box) return false;
    const r = box.getBoundingClientRect();
    return (
      x >= r.left - HALO &&
      x <= r.right + HALO &&
      y >= r.top - HALO &&
      y <= r.bottom + HALO
    );
  };

  const end = (): void => {
    if (!live) return;
    live = false;
    wanted = false;
    window.clearTimeout(timer);
    offOut?.();
    offOut = undefined;
    release?.();
    release = undefined;
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", onHide);
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", place);
    video?.pause();
    /* The box goes; the video element survives it, off the document, so a
       replay costs no second fetch. */
    box?.remove();
    box = undefined;
  };

  const onMove = (e: PointerEvent): void => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!inRegion(lastX, lastY)) end();
  };
  const onScroll = (): void => {
    if (!pointerish.matches || !inRegion(lastX, lastY)) end();
  };
  const onHide = (): void => {
    if (document.hidden) end();
  };

  /* One element per visit, made on intent, never at rest. */
  const load = (): HTMLVideoElement => {
    if (video) return video;
    video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("aria-hidden", "true");
    video.style.cssText =
      "display:block;width:100%;height:100%;object-fit:contain;";
    video.addEventListener("error", () => {
      dead = true;
      end();
    });
    video.addEventListener("ended", () => {
      timer = window.setTimeout(end, HOLD_MS);
    });
    video.src = SRC;
    video.load();
    return video;
  };

  const mount = (): void => {
    const v = load();
    /* A slow fetch can outlive the reader's interest: if the row has been
       scrolled away by the time the clip is ready, no row, no clip. */
    const r0 = row.getBoundingClientRect();
    if (r0.bottom < 0 || r0.top > innerHeight) {
      wanted = false;
      return;
    }
    live = true;
    release = occupy();

    box = document.createElement("div");
    box.setAttribute("aria-hidden", "true");
    box.style.cssText =
      "position:absolute;z-index:10;background:oklch(0.145 0 0);" +
      "pointer-events:none;overflow:hidden;";
    box.append(v);
    document.body.append(box);

    place = (): void => {
      if (!box) return;
      const r = row.getBoundingClientRect();
      const bw = Math.max(r.width, Math.min(innerWidth - 2 * EDGE, MAX_W));
      const bh = Math.min(bw / ASPECT, innerHeight * 0.8);
      const top = Math.max(
        EDGE,
        Math.min(r.top + r.height / 2 - bh / 2, innerHeight - bh - EDGE),
      );
      const left = Math.max(
        EDGE,
        Math.min(r.left + (r.width - bw) / 2, innerWidth - bw - EDGE),
      );
      box.style.left = `${scrollX + left}px`;
      box.style.top = `${scrollY + top}px`;
      box.style.width = `${bw}px`;
      box.style.height = `${bh}px`;
    };
    place();
    box.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 140,
      easing: "ease-out",
    });

    offOut = easyOut(end);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("visibilitychange", onHide);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", place);

    v.currentTime = 0;
    void v.play().catch(end);
  };

  row.addEventListener("pointermove", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
  });
  row.addEventListener("pointerleave", () => {
    if (!live) wanted = false;
  });

  /* The clip arrives on intent: entering the section is the hover reader's
     promise made early; the first completed gesture anywhere is the touch
     reader's. */
  (row.closest("section") ?? row).addEventListener(
    "pointerenter",
    () => void load(),
    { once: true },
  );
  const warmUp = (): void => {
    void load();
    removeEventListener("pointerup", warmUp, true);
  };
  if (!pointerish.matches) addEventListener("pointerup", warmUp, true);

  entry({
    el: row,
    act: () => {
      if (live || dead) return;
      wanted = true;
      const v = load();
      /* Mount when there is something to show, never a black box waiting
         on the network. HAVE_FUTURE_DATA is enough to start. */
      if (v.readyState >= 3) {
        mount();
        return;
      }
      v.addEventListener(
        "canplay",
        () => {
          if (wanted && !live) mount();
        },
        { once: true },
      );
    },
  });
}
