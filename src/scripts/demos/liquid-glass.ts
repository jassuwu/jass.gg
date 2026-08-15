/**
 * THE ROW PERFORMS ITS OWN PRODUCT. liquid-glass-cursor is a cursor, so the
 * demo is your cursor: dwell on the row and the arrow you point with becomes
 * the actual published glass — the real npm package, not a re-creation —
 * refracting this page behind it. Leave the row and your cursor comes back
 * whole, because a demo that outstays the row is an installation.
 *
 * Chromium only, and silent elsewhere. The effect needs `backdrop-filter:
 * url(#svg-filter)`, which Firefox and Safari parse but do not render — so
 * `CSS.supports` says yes everywhere and means it only in Chromium. The one
 * honest tell without painting pixels is `navigator.userAgentData`, which
 * only Chromium ships. Both checks run; on any other engine this module does
 * nothing, which is the correct demo of a product whose README says the same.
 *
 * Touch devices get nothing for a plainer reason: no cursor to replace.
 *
 * Reduced motion: the act does not play, and there is no `still`. The glass
 * is not purely reader-driven — it lags behind the hand on a lerp and tilts
 * with velocity, which is motion the reader didn't make — and it hides the
 * real cursor, which is exactly the kind of surprise that setting asks to be
 * spared. The honest static form of "your cursor, but glass" is your cursor,
 * which the page already has. friend.ts enforces this: no `still` means the
 * act simply never happens for those readers.
 */
import type { createLiquidGlassCursor } from "liquid-glass-cursor";

import { ambient } from "../friend";

type Destroy = ReturnType<typeof createLiquidGlassCursor>;

export function register(): void {
  const row = document.querySelector<HTMLElement>(
    '[data-entry="liquid-glass-cursor"]',
  );
  if (!row) return;
  if (!matchMedia("(hover: hover)").matches) return;
  if (!("userAgentData" in navigator)) return;
  if (!CSS.supports("backdrop-filter", "url(#f)")) return;

  /* The package's module entry auto-invokes createLiquidGlassCursor() at
     import time — built to self-demo when dropped in a <script> tag. Imported
     here, that would spawn a page-wide instance with no destroy handle: a
     cursor that never leaves. Its init has one escape hatch — if
     document.readyState is "loading" it defers to DOMContentLoaded instead —
     so for the duration of the import an own-property shadows readyState with
     "loading", then deletes itself to restore the real getter. The deferred
     listener it leaves behind waits for an event that already fired: one
     inert function, no DOM, no filters, no listeners that run. The shadow
     spans one module fetch of a same-origin asset; nothing on this page reads
     readyState in that window. */
  const load = async () => {
    Object.defineProperty(document, "readyState", {
      value: "loading",
      configurable: true,
    });
    try {
      return (await import("liquid-glass-cursor")).createLiquidGlassCursor;
    } finally {
      delete (document as { readyState?: string }).readyState;
    }
  };

  let loading: Promise<typeof createLiquidGlassCursor> | undefined;
  let destroy: Destroy | undefined;
  /* Still hovering? The import is async and the dwell already happened, so
     without this a pass-through that left during the load would get a glass
     cursor after the fact, on a row it is no longer over. */
  let wanted = false;
  /* Last pointer position over the row. The package hides the native cursor
     the instant it mounts but only draws the glass on the next mousemove — a
     hand that dwelt and then held still would have no cursor at all. One
     synthetic mousemove at the known position closes the gap. */
  let px = 0;
  let py = 0;

  row.addEventListener("pointermove", (e) => {
    px = e.clientX;
    py = e.clientY;
  });

  ambient({
    el: row,
    act: () => {
      wanted = true;
      loading ??= load();
      void loading.then((create) => {
        if (!wanted || destroy) return;
        destroy = create();
        document.dispatchEvent(
          new MouseEvent("mousemove", { clientX: px, clientY: py }),
        );
      });
    },
  });

  /* Leave is immediate — the dwell earns the entrance, nothing earns a
     lingering exit. destroy() is the package's own teardown and removes
     everything it made: the glass, the filter <svg>, the cursor-hiding
     <style>, both document listeners. Each entrance builds fresh under a new
     unique id, so enter/leave any number of times leaves no residue. */
  row.addEventListener("pointerleave", () => {
    wanted = false;
    destroy?.();
    destroy = undefined;
  });
}
