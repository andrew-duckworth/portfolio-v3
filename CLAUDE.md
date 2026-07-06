# CLAUDE.md

Persistent conventions for this repo. Read this every session before making changes. Full section-by-section specs live in `portfolio-v3-claude-code-brief.md` — this file is the standing rules of the house.

## What this is

Andrew Duckworth's personal portfolio. A single-scroll, dark charcoal + amber, motion-heavy showcase site. The craft of the site is part of the pitch: it targets an **AI Developer & Enablement Specialist** role and must read as *builder* (ships real AI systems) with a subtle *enabler* thread (works AI-led, brings others along). Quiet-luxury, engineered, confident — never loud or gimmicky.

## Commands

```bash
npm run dev        # local dev server
npm run build      # production build
npm run preview    # preview the build
npm run typecheck  # tsc --noEmit — must pass with zero errors
npm run lint       # must pass before any change is "done"
```

Run `typecheck` and `lint` before considering any task complete. Don't leave the tree red.

## Stack (don't add heavy deps without reason)

Vite · React 18 · TypeScript (**strict**) · @react-three/fiber · @react-three/drei · @react-three/postprocessing · three · gsap + ScrollTrigger + @gsap/react · lenis · SplitType.

Before adding any new dependency, check it isn't already solvable with what's installed. Prefer drei helpers over hand-rolling; prefer standard gsap plugins over bespoke scroll math.

## Architecture (hold these invariants)

- **One persistent `<Canvas>`** fixed full-viewport, behind the DOM, `pointer-events: none`, `aria-hidden`. The 3D scene is decorative and continuous — do not mount/unmount it per section.
- **One scroll authority: Lenis.** ScrollTrigger is driven from Lenis; nothing else touches scroll. Sync via `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(...)` with `lagSmoothing(0)`.
- **Scroll → 3D goes through a shared ref, never React state.** A `progressRef` is updated by ScrollTrigger `onUpdate`; the scene reads and lerps it inside `useFrame`. Setting React state per frame is a bug.
- One component per section. Shaders live in their own files, not inline template strings, wherever practical.
- Design tokens are shared between DOM (CSS custom properties) and 3D (a TS constants file). They must not drift.

## Design tokens (source of truth)

```
--bg-void: #0A0A0B   --bg-surface: #141417   --bg-elevated: #1B1B1F   --line: #26262B
--text-hi: #EDEDE6   --text-mid: #A5A59C     --text-low: #6E6E67
--amber: #FF8C1A     --amber-hot: #FFB84D    --amber-white: #FFE7C2   --ember: #C2410C
--amber-glow: rgba(255,140,26,0.14)
```

The site is ~90% charcoal, ~10% amber. **Amber is a signal colour** — hero core, active states, the "How I Build" pipeline line, single-word emphasis. If a change makes the page more amber, it's probably wrong. Type: Clash Display (headings) · Inter (body) · JetBrains Mono (labels/meta/metrics). Fluid `clamp()` scale, strict baseline rhythm.

## Motion rules

- Reveal from a **masked/clipped** state (clip-path, overflow mask, char/line stagger) — not bare opacity.
- Easing: `power3.out` / `expo.out` for entrances, `power2.inOut` for scrubbed timelines. Never linear.
- Entrances ~0.8–1.2s; staggers ~0.04–0.08s.
- Every section has a **distinct** treatment — never reuse another section's animation. (Featured Work scrolls horizontally; How I Build draws a sequential amber pipeline; etc.)
- The recurring "amber signal" motif — a thin line/spark that draws to connect ideas — appears deliberately, not everywhere.
- Wrap all animation in `useGSAP` (@gsap/react) so contexts clean up on unmount. Register plugins once.

## R3F + GSAP guardrails

- Canvas: `dpr={[1, 2]}` capped, `gl={{ antialias: true, powerPreference: 'high-performance' }}`, `frameloop="always"`.
- Forge Core particles: custom vertex (curl-noise) + fragment (soft round points, `discard` outside radius) shaders, additive blending, `depthWrite={false}`. Uniforms: `uProgress`, `uTime`, `uMouse`, colour set.
- Bloom is tuned so **only the hot core blooms** (`luminanceThreshold` ~0.6). Do not over-bloom — embers, not lens flares.
- Dispose geometries/materials on unmount; guard against WebGL context loss.
- Never block the main thread; lazy-load below-the-fold section logic; tree-shake drei imports.

## Performance budget

60fps for the hero on a modern laptop. On mobile/low-power (detect via `matchMedia` + heuristics): drop particle count (~10–20k), lower DPR, soften/disable postprocessing, convert the horizontal Featured Work gallery to a vertical stack, consider a static hero fallback. Keep the bundle lean.

## Accessibility (must, not nice-to-have)

- `prefers-reduced-motion`: freeze the particles to a gentle idle or static frame, disable scrubbed/horizontal motion, replace reveals with short fades. The site must be fully usable and still handsome with motion off — this is treated as a feature, not a fallback.
- Semantic landmarks, visible focus states, keyboard-navigable nav + CTA, alt text, AA contrast for all body text, `aria-hidden` on the canvas.

## Content rules

- Use the real content in the brief (§6). **Do not invent** metrics, employers, credentials, or project claims. Where a real link/number is missing, use a clearly-marked placeholder for Andrew to fill.
- The enablement thread stays **subtle and specific** — one section plus light touches. Do not turn the site into an AI manifesto.

## Code conventions

- TypeScript strict; no `any` without a written reason. No unused exports.
- Components PascalCase; hooks `useX`; files match export names. Section components under `src/sections/`, 3D under `src/three/`, shaders under `src/three/shaders/`.
- Small, readable components. Extract reusable primitives (masked-reveal text, section wrapper) rather than repeating.
- Comment the *why* for non-obvious shader math and scroll wiring; skip narrating the obvious.

## Never do

- Set React state inside `useFrame` / per animation frame.
- Add a second scroll library or a second particle system (Contact reuses the Forge Core).
- Drift from the palette/type tokens above, or push the site toward more amber.
- Ship with `typecheck`/`lint` failing, or with `prefers-reduced-motion` unhandled.
- Reveal anything about Andrew beyond the portfolio content in the brief.

## Definition of done (any task)

Typecheck + lint clean · the change respects the tokens and motion rules · works with `prefers-reduced-motion` on and off · degrades sensibly on a narrow viewport · no per-frame state · no console errors or WebGL warnings.
