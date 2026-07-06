---
name: verify
description: Build/launch/drive recipe for verifying changes to this portfolio site at its real surface (browser).
---

# Verifying this site

## Launch

```bash
npm run dev            # Vite on http://localhost:5173 (run in background)
```

Gates (CI-equivalent, not evidence of behavior): `npm run typecheck && npm run lint && npm run build`.

## Drive (headless Chrome via Playwright)

No Playwright in this repo's deps (keep it that way — bundle lean). Install it in the session scratchpad and use the system Chrome channel so no browser download is needed:

```bash
cd <scratchpad> && npm init -y && npm i playwright
# script: chromium.launch({ channel: 'chrome', headless: true })
```

Patterns that work here:

- **Scroll through Lenis**: use `page.mouse.wheel(0, dy)` in small steps with ~50ms waits — Lenis intercepts wheel; `window.scrollTo` bypasses the smoothing (fine for reduced-motion checks only).
- **Scrub evidence**: sample `getComputedStyle(el).transform` per wheel step; the matrix `a` component is scaleX. Expect continuous intermediate values, and reversal when wheeling back up.
- **Keyboard scrolling**: click the page once first (`page.mouse.click(...)`) — headless Chrome won't route End/PageDown/Space without document focus. This bit us once; it looks like a Lenis bug but isn't.
- **Reduced motion**: `browser.newContext({ reducedMotion: 'reduce' })`; assert `document.documentElement` has NO `lenis` class (native scroll path) and scroll-driven tweens stay at their initial state.
- **Console**: collect `console` (error/warning) + `pageerror` on every run; the definition of done is zero.

## Flows worth driving per milestone

- Scroll top→bottom and back: scrubbed animations track scroll continuously and reverse.
- Same flow with `reducedMotion: 'reduce'`: page fully usable, no scrub/horizontal motion.
- Narrow viewport (`viewport: { width: 390, height: 844 }`): layout degrades sensibly.
- Once the Canvas exists (M3+): watch for WebGL warnings in console, and confirm `aria-hidden` + `pointer-events: none` on the canvas layer.
