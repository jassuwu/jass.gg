# Research: touch-first grammar for hover-driven micro-interactions

Method: every claim below was followed to the source that owns it — the WHATWG HTML spec, W3C Web Audio / Pointer Events / Media Queries 4 / Selectors 4 / Vibration specs, WCAG 2.2 Understanding docs, WebKit blog + bug tracker, Chrome developer docs, Apple's Safari Web Content Guide and HIG, Material Design guidelines, and NN/g / jnd.org for the design writing. Fetched 2026-08-22. Claims I could only verify through secondary coverage are flagged inline as such.

---

## 1. User activation rules for media and audio

### The spec model: sticky vs transient

The HTML spec's user-activation model ([html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation](https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation)) defines two window states:

- **Sticky activation** — "W's historical activation state, indicating whether the user has ever interacted in W. It starts false, then changes to true (and never changes back to false)."
- **Transient activation** — true from an activation until "the last activation timestamp in W plus the transient activation duration"; "remains true for a limited time after every activation notification."

An **activation triggering input event** must have `isTrusted: true` and be one of exactly:

- `keydown` (not Esc, not a UA shortcut key)
- `mousedown`
- `pointerdown` — **only if `pointerType` is `"mouse"`**
- `pointerup` — **only if `pointerType` is *not* `"mouse"`**
- `touchend`

Consequences that matter for a tap-driven site:

- **On touch, activation lands on the *up* event, not the down event.** `pointerdown`/`touchstart` from a finger do *not* grant activation; `pointerup`/`touchend`/`click` do. Start audio in an up/click handler, never in a down handler. (Spec list above.)
- **Scroll events and IntersectionObserver callbacks never qualify.** They are not in the list; MDN's transient-activation glossary states activation is "not triggered by mouse move events or `wheel` events, as these aren't necessarily caused by intentional interaction" ([developer.mozilla.org/en-US/docs/Glossary/Transient_activation](https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation)). IO callbacks are async browser callbacks with no input event at all — nothing to inherit.
- **A `click` handler is sufficient** — the trusted `pointerup`/`touchend` that precedes the click already set both activation bits, and `click` itself runs well inside the transient window. Chrome's autoplay doc explicitly recommends it: "Events that trigger user activation are still to be defined consistently across browsers. I'd recommend you stick to 'click' for the time being then" ([developer.chrome.com/blog/autoplay/](https://developer.chrome.com/blog/autoplay/)).

**Expiry:** the transient activation duration is implementation-defined; the spec says it "is expected to be at most a few seconds, so that the user can possibly perceive the link between an interaction with the page and the page calling the activation-gated API." Chromium hard-codes `kActivationLifespan = base::Seconds(5)` (Chromium source, discussed at [issues.chromium.org/issues/40058598](https://issues.chromium.org/issues/40058598) and [macwright.com/2022/07/11/activation](https://macwright.com/2022/07/11/activation)). So: an async fetch/decode that takes >5 s after the tap can lose the gesture; kick off the gated call synchronously in the handler.

### Where play() and resume() are actually gated

- **`HTMLMediaElement.play()`** — the HTML spec leaves the policy to the UA: "A media element is said to be allowed to play if the user agent and the system allow media playback in the current context. For example, a user agent could allow playback only when the media element's Window object has transient activation, but an exception could be made to allow playback while muted" ([html.spec.whatwg.org/multipage/media.html#allowed-to-play](https://html.spec.whatwg.org/multipage/media.html#allowed-to-play)). When not allowed, `play()` returns a promise rejected with `NotAllowedError` — always handle the rejection.
- **`AudioContext`** — the Web Audio spec gates the suspended→running transition on **sticky** activation: "A user agent may disallow this initial transition, and to allow it only when the AudioContext's relevant global object has sticky activation" ([w3.org/TR/webaudio/#allowed-to-start](https://www.w3.org/TR/webaudio/)). A context created before any interaction is created `suspended`; Chrome's doc: "If an AudioContext is created before the document receives a user gesture, it will be created in the 'suspended' state, and you will need to call resume() after the user gesture" ([developer.chrome.com/blog/autoplay/](https://developer.chrome.com/blog/autoplay/)).

### Scope of the unlock, per engine

- **Chrome (desktop + Android):** page/domain-level. Autoplay with sound is allowed when "the user has interacted with the domain (click, tap, etc.)", when the desktop Media Engagement Index threshold is crossed, or when the site is installed/added to home screen ([developer.chrome.com/blog/autoplay/](https://developer.chrome.com/blog/autoplay/)). One tap therefore unlocks unmuted `play()` for the whole page session on Android Chrome.
- **WebKit/Safari media elements:** **per-element.** "Auto-play restrictions are granted on a per-element basis" — WebKit's own policy post, which advises: "Change the source of the media element instead of creating multiple media elements if you want to play multiple videos back to back" ([webkit.org/blog/7734/auto-play-policy-changes-for-macos/](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)). Also: "Websites should assume any use of `<video>` or `<audio>` requires a user gesture click to play."
- **WebKit/Safari iOS, gesture definition:** "the JavaScript which resulted in the call to video.play() … must have directly resulted from a handler for a touchend, click, doubleclick, or keydown event" ([webkit.org/blog/6784/new-video-policies-for-ios/](https://webkit.org/blog/6784/new-video-policies-for-ios/)). Muted / audio-track-free video may autoplay and play inline with `playsinline`; if it "becomes un-muted without a user gesture, playback will pause."
- **WebKit AudioContext:** the unlock is per-context-object — `resume()` must run inside a gesture handler, but once the context is `running` it stays running, so one tap into one shared `AudioContext` covers all subsequent Web Audio for the page session (mechanics per the Web Audio spec state model above; MDN best practices: create/resume "from inside a click event" and the state is `running` thereafter — [developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)). Caveat, secondary-sourced: iOS can move a context to a non-standard `"interrupted"` state on phone calls/backgrounding; re-check `state` before playing (widely reported, e.g. [bugs.webkit.org/show_bug.cgi?id=180522](https://bugs.webkit.org/show_bug.cgi?id=180522) area; verify at implementation time).

**Practical rule:** one `AudioContext`, resumed in the first tap handler, is the reliable cross-engine "one tap unlocks the session" primitive. `<audio>` elements are per-element on Safari — a pool of them each needs its own gesture-initiated first `play()`.

---

## 2. Hover emulation on touch

### What the Pointer Events spec mandates on tap

For non-hovering devices, Pointer Events Level 3 requires the full boundary sequence around every tap: "For input devices that do not support hover, the user agent MUST also fire a pointer event named pointerover followed by a pointer event named pointerenter prior to dispatching the pointerdown event" and "MUST also fire a pointer event named pointerout followed by a pointer event named pointerleave after dispatching the pointerup event" ([w3.org/TR/pointerevents3/](https://www.w3.org/TR/pointerevents3/)).

So a tap fires: `pointerover → pointerenter → pointerdown → (pointerup) → pointerout → pointerleave`.

Consequences:

- **Yes, a tap fires `pointerenter` even if that's the only listener** — but the matching `pointerleave` fires at finger-lift. Any "hover state" driven by enter/leave **flashes for the duration of the touch and then turns off**. Hover-dwell semantics do not survive the mapping; you must branch, not reuse the handlers.
- Only primary pointers produce compatibility mouse events, and "Authors can prevent the firing of certain compatibility mouse events by canceling the pointerdown event (if the isPrimary property is true)" ([w3.org/TR/pointerevents3/](https://www.w3.org/TR/pointerevents3/)) — the sanctioned way to suppress synthetic `mouseover`/`click` if you take over touch handling.

### Safari's mouse-event heuristic (the two-tap mechanism)

Apple's Safari Web Content Guide documents the tap→mouse-event rules ([developer.apple.com/library/archive/…/HandlingEvents.html](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html)):

- Tapping a *non-clickable* element generates **no mouse events at all**.
- Tapping a clickable element fires `mouseover → mousemove → mousedown → mouseup → click`, but: "if the contents of the page changes on the mousemove event, no subsequent events in the sequence are sent. This behavior allows the user to tap in the new content."
- "The mouseout event only occurs if the user taps on another clickable item" — this is **sticky hover**, documented by Apple: the tapped element keeps `:hover`/mouseover state until something else is tapped.

This heuristic is what produced the old "first tap opens the hover menu, second tap follows the link" behavior on desktop-oriented news sites. Chrome/Android follows the Pointer Events compatibility mapping, which has **no content-change suppression rule** — so the two-tap pattern is engine-dependent and unreliable by construction (derived from the two documents above). Media Queries 4 backs the sticky-hover reality at the spec level: "Authors should therefore be careful not to assume that the :hover pseudo-class will never match on a device where hover: none is true, but they should design layouts that do not depend on hovering to be fully usable" ([drafts.csswg.org/mediaqueries-4/#mf-interaction](https://drafts.csswg.org/mediaqueries-4/#mf-interaction)). (Selectors 4 itself only says UAs that can't detect hovering are conforming if `:hover` "simply never match[es]" — [drafts.csswg.org/selectors-4/#hover-pseudo](https://drafts.csswg.org/selectors-4/#hover-pseudo) — the sticky behavior is UA policy, not spec.)

### Double-tap-to-zoom and tap delay

- The 300–350 ms click delay existed to disambiguate double-tap-to-zoom. Chrome: "As of Chrome 32 (back in 2014) this delay is gone for mobile-optimized sites" — i.e. pages with `<meta name="viewport" content="width=device-width">`; `touch-action: manipulation` achieves the same per-element ([developer.chrome.com/blog/300ms-tap-delay-gone-away/](https://developer.chrome.com/blog/300ms-tap-delay-gone-away/)).
- Safari 9.1 removed its 350 ms delay "for pages that declare a viewport with either width=device-width or user-scalable=no", and authors "can also opt in to fast-tap behavior on specific elements by using the CSS touch-action property, using the manipulation value" ([webkit.org/blog/5610/more-responsive-tapping-on-ios/](https://webkit.org/blog/5610/more-responsive-tapping-on-ios/), [Safari 9.1 release notes](https://developer.apple.com/library/archive/releasenotes/General/WhatsNewInSafari/Articles/Safari_9_1.html)).
- With a `width=device-width` viewport (which jass.gg has, like any responsive site), taps dispatch immediately in both engines; add `touch-action: manipulation` on interactive elements as belt-and-braces against double-tap zoom stealing quick repeated taps.

### The capability queries and how devices actually report

Media Queries 4 interaction features ([drafts.csswg.org/mediaqueries-4/#mf-interaction](https://drafts.csswg.org/mediaqueries-4/#mf-interaction)):

| Device | `pointer` | `hover` |
|---|---|---|
| Smartphone / touchscreen | coarse | none |
| Basic stylus digitizer | coarse | none |
| Mouse / touchpad / advanced stylus | fine | hover |

`any-pointer`/`any-hover` are "the union of capabilities of all the pointing devices available to the user," and "must only match none if *all* of the pointing devices would match none." The primary-device determination is UA judgment: "user agents should make this determination by combining knowledge about the device/environment … and a notion of which of these is generally and/or currently being used," and "may also decide to dynamically change what type of pointing device is deemed to be primary."

Real-world reporting:

- **Phones (iOS + Android):** `pointer: coarse`, `hover: none`. (Spec table above; confirmed everywhere.)
- **iPad, including with Magic Keyboard trackpad / mouse / Apple Pencil:** Safari **always reports the touchscreen as primary** (`coarse` / `none`) and — bug, not policy — does not flip `any-hover: hover` / `any-pointer: fine` when a trackpad is attached, and Pencil never triggers `any-hover: hover` ([bugs.webkit.org/show_bug.cgi?id=209292](https://bugs.webkit.org/show_bug.cgi?id=209292), [mdn/browser-compat-data#24451](https://github.com/mdn/browser-compat-data/issues/24451)). So on iPadOS you cannot detect the trackpad via media queries; you must treat iPads as touch.
- **Android with mouse attached:** Chrome updates the features dynamically; adding/removing a Bluetooth mouse changes `any-pointer`/`any-hover` (per the MQ4 dynamic-primary text and BCD issue discussion above).
- **Accessibility escape hatch in the spec:** "even on devices that do support hovering, the UA may give a value of hover: none to this media query, to opt into layouts that work well without hovering."

**The right query per the spec's own guidance:** branch the *layout contract* on the primary device — `@media (hover: hover) and (pointer: fine)` = desktop-grade hover grammar; everything else gets the touch grammar. The spec's worked example gates hover menus on `@media (hover)`, and its `pointer: coarse` example enlarges targets. Google's design guidance adds the blunt rule: "Don't use hover to hide important information or an important interface element" — even on hover-capable devices ([web.dev/learn/design/interaction](https://web.dev/learn/design/interaction)). Use `any-hover`/`any-pointer` only for *additive* enhancements (spec: "authors should strongly consider using any-pointer and any-hover to take into account all possible types of pointing devices"), never to withhold the touch affordance — iPadOS misreports it anyway.

---

## 3. Discoverability patterns for tap-triggered details

What the design literature actually says:

- **Norman & Nielsen (jnd.org, "Gestural Interfaces: A Step Backward in Usability"):** invisible gestures violate the fundamentals — "The lack of consistency, inability to discover operations, coupled with the ease of accidentally triggering actions from which there is no recovery, threatens the viability of these systems." Guidelines "should be based upon solid principles of interaction design, not on the whims of company human interface guidelines" ([jnd.org/gestural-interfaces-a-step-backwards-in-usability/](https://jnd.org/gestural-interfaces-a-step-backwards-in-usability/); site returned 403 on fetch, quote per contemporaneous coverage of the essay).
- **Apple HIG (Gestures):** "people expect tap to activate or select an object"; "Avoid using a familiar gesture like tap or swipe to perform an action that's unique to your app"; a custom gesture must be "Discoverable, Straightforward to perform, Distinct from other gestures, **Not the only way to perform an important action**"; and "Indicate when a gesture isn't available … provide feedback that helps them predict its results" ([developer.apple.com/design/human-interface-guidelines/gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)).
- **Material Design (Gestures, M2 archive):** taxonomy of touch mechanics; notably for M2, "Long press is not used to display a contextual menu," and long press is reserved for selection — i.e. Android users' muscle memory for long-press is select/act, not preview ([material.io/archive/guidelines/patterns/gestures.html](https://material.io/archive/guidelines/patterns/gestures.html)). Material also maintains a whole "Gesture education" pattern section — gestures are assumed to need teaching.
- **NN/g (Tooltip Guidelines):** "Because tooltips are initiated by a hover gesture, they can be used only on devices with a mouse or keyboard. They are not normally available on touchscreens"; the alternative is a tap-initiated popup tip; and the governing rule: "Important information should always be on the page; therefore, tooltips shouldn't be essential" ([nngroup.com/articles/tooltip-guidelines/](https://www.nngroup.com/articles/tooltip-guidelines/)).

Synthesis for a minimal text-first site: the literature converges on **one consistent, visible, always-present affordance** rather than per-element decoration or an invisible gesture. Tap is the only gesture users will find unaided (Apple: tap = activate; Norman/Nielsen: everything else is undiscoverable). If some text performs when tapped, mark every such element with the *same* minimal signal (the site's existing link grammar — underline/color — or a fixed typographic marker), keep the signal in the element itself (not a legend users must have read), and never make the tapped reveal the only path to the information (NN/g, Apple "not the only way").

---

## 4. Haptics

- **Spec:** `navigator.vibrate()` is gated on **sticky activation** in the Vibration API itself: "If global does not have sticky activation, return false and terminate these steps," and "An implementation MAY return false and terminate these steps" — a silent no-op is always conforming ([w3.org/TR/vibration/](https://www.w3.org/TR/vibration/)).
- **Support:** Chrome/Android and Firefox/Android implement it; **Safari has never shipped it on any platform** — MDN marks the feature "Limited availability … not Baseline because it does not work in some of the most widely-used browsers" ([developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)).
- **iOS workaround status:** Safari 17.4's `<input type="checkbox" switch>` fires the Taptic Engine when toggled; libraries exploited this by programmatically `click()`ing a hidden switch's **label** (direct `.click()` on the input doesn't fire it). **Apple patched the programmatic path in iOS 26.5** — script-triggered haptics no longer work on current iOS; only a real user toggle of a real switch still produces the haptic ([tijnjh/ios-haptics](https://github.com/tijnjh/ios-haptics), [doublej/web-haptics-polyfill](https://github.com/doublej/web-haptics-polyfill) — secondary sources; no WebKit release note owns the patch).
- **Net:** haptics on the web are Android-only progressive enhancement (`navigator.vibrate?.(10)` inside a tap handler, which satisfies sticky activation by definition). There is no reliable iOS web haptic in August 2026. Do not build feedback that depends on it.

---

## 5. Navigate-vs-preview tap disambiguation

- **No web API distinguishes intent.** A trusted tap is one event stream; the platform's only intent channels are *which element* was hit and *how long* the contact lasted. Apple HIG: "people expect tap to activate or select an object" — a tap on a link means go.
- **Long-press is owned by the system on iOS.** On links, touch-and-hold triggers Safari's callout/link preview; the DOM `contextmenu` event is **not fired on iOS Safari at all** (since iOS 13) — MDN BCD marks it unsupported ([mdn/browser-compat-data#6376](https://github.com/mdn/browser-compat-data/issues/6376)). The system callout can be suppressed with non-standard `-webkit-touch-callout: none` (plus `user-select: none`) ([developer.mozilla.org/en-US/docs/Web/CSS/-webkit-touch-callout](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-touch-callout)), but then you're hand-rolling long-press with timers against an undiscoverable gesture (Norman/Nielsen §3) and fighting Android muscle memory where long-press means select (Material §3). Long-press-as-preview is a system affordance to *leave alone*, not an app-level channel to build on.
- **First-tap-reveal, second-tap-navigate** exists only as a side effect of Safari's content-change heuristic (§2: "if the contents of the page changes on the mousemove event, no subsequent events in the sequence are sent"). It is disliked and unreliable because (a) Chrome has no such rule, so the same markup navigates on first tap there; (b) it doubles the cost of every navigation; (c) it violates WCAG 1.4.13's premise — content appearing on hover/reveal "often leads to accessibility issues": "the user may not have intended to trigger the interaction … may not know new content has appeared" ([w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)). If content is revealed, 1.4.13 requires it be **dismissible, hoverable, persistent**.
- **The accessible resolution is structural, not gestural:** make preview and navigate two *targets*, or two *explicit states*, never two timings of one target. WCAG 2.5.1: everything must work "with a single pointer without a path-based gesture … such as a tap, click, double tap, double click, long press" ([Understanding 2.5.1](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html)) — and per NN/g/Apple, of those only plain tap is discoverable. WCAG 2.5.2 adds: complete actions on the **up-event** ("The down-event of the pointer is not used to execute any part of the function") so users can cancel by sliding off ([Understanding 2.5.2](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)) — which conveniently is also where user activation lives (§1).

---

## What this means for jass.gg

**Audio, hard constraints:**
- Sound can only ever start from a trusted `pointerup` (non-mouse), `touchend`, `click`, `mousedown`, `pointerdown` (mouse), or `keydown`. Never from scroll, never from IntersectionObserver, never from a timer. On touch that means the *up* event.
- One shared `AudioContext`, `resume()`d synchronously in the first tap handler, unlocks Web Audio for the whole page session on both engines. `<audio>`/`<video>` elements on Safari unlock **per element** — reuse one element and swap `src`, don't spawn elements. Always handle `play()`'s `NotAllowedError` rejection.
- Transient activation is ~5 s in Chromium; don't put slow async work between the tap and the gated call.
- Muted, `playsinline` video may autoplay/IO-trigger freely on both engines — motion previews on scroll are fine; audio is not.

**Media queries, hard constraints:**
- Branch the interaction grammar on `@media (hover: hover) and (pointer: fine)` → hover-dwell system; everything else → tap grammar. Do not branch on screen width.
- iPads always report `coarse`/`none` (and don't even flip `any-hover` with a trackpad — WebKit bug): iPad *is* the touch grammar. Use `any-*` only to layer hover styling on top of a tap-complete UI, never to gate function.
- `:hover` is sticky on touch in both engines — every `:hover` style must be harmless when frozen on after a tap, or be scoped inside the `(hover: hover)` block. Tap-driven `pointerenter` flashes and reverses at finger-lift; don't reuse the hover handlers, write a tap path.
- Keep `touch-action: manipulation` on interactive elements; the responsive viewport already kills the tap delay.

**Viable tap-affordance patterns (pick one, apply everywhere):**
1. **Tap-to-toggle with the site's one link-grammar marker** — performing elements carry the same minimal always-visible signal (underline/color/fixed glyph); first tap toggles the performance/detail open *in place* (persistent + dismissible per WCAG 1.4.13), tapping again or elsewhere closes it. Activation on up-event.
2. **Split targets** — the text is a plain link that navigates on tap; the *performance* lives on an adjacent, consistently-styled tap target (marker/stamp). Never two timings on one target; never first-tap-reveal-second-tap-navigate.
3. **Ambient-by-scroll, sound-by-tap** — muted motion runs freely (allowed everywhere), with a single global, visible "sound" toggle whose first tap resumes the shared AudioContext and unlocks the session.
- Haptics: `navigator.vibrate` as Android-only garnish inside tap handlers; nothing on iOS (switch-hack patched in iOS 26.5). Long-press stays with the system (iOS link preview; no `contextmenu` event on iOS Safari).
