<!--
HOW TO RUN THIS (for Andrew):
1. Open a terminal in an EMPTY directory (this is a fresh project — do not reuse portfoliov2).
2. Start Claude Code and select the Fable 5 model (`/model` → claude-fable-5).
3. Paste this entire file as your opening prompt. It's written as a spec directed at the coding agent.
4. Let it scaffold + build the design system + hero FIRST, review, then approve each section.
   Don't let it one-shot the whole site — the milestone order at the bottom produces far better results.
5. Content in §6 is real but rough — sanity-check links/metrics before you ship.
-->

# Build Brief — Andrew Duckworth Portfolio (v3)

You are building a fresh, production-quality personal portfolio site from scratch. This is a showcase piece: the craft of the site itself is part of the argument. Treat motion, performance, and polish as first-class deliverables, not afterthoughts. Build incrementally in the milestone order at the end — scaffold and get one thing beautiful before moving on.

## 0. Who this is for & what it must prove

Andrew is an AI / agentic-engineering-focused full-stack developer in Wellington, NZ. This portfolio targets an **AI Developer & Enablement Specialist** role at an AI-forward e-commerce group that builds almost everything with tools like Claude Code. The site must land two signals at once:

- **Builder** — he ships real, non-trivial AI systems (RAG, multi-agent orchestration) with production concerns (PII scrubbing, audit logging, human-in-the-loop). The 3D/motion craft reinforces "this person sweats the details and ships."
- **Enabler (subtle thread)** — he works AI-led and can bring others along. Weave a light, tasteful "how I build with AI" thread through the site. Keep it confident and understated — one dedicated section plus a few micro-touches. Do **not** make it preachy or turn the whole site into a manifesto.

Tone: dark, warm, editorial, engineered. Confident, not loud. Think "quiet luxury" meets "developer who obsesses over motion."

## 1. Tech stack (use exactly this)

- **Vite + React 18 + TypeScript** (strict mode on)
- **@react-three/fiber** + **@react-three/drei** for the 3D scene
- **@react-three/postprocessing** (EffectComposer, Bloom, Vignette, Noise, optional ChromaticAberration)
- **three** (pin a recent stable version)
- **gsap** + **ScrollTrigger** + **@gsap/react** (`useGSAP` hook for React-safe animation + cleanup)
- **lenis** (`@studio-freight/lenis` / `lenis`) for smooth scroll, synced to ScrollTrigger
- **SplitType** (or drei `<Text>` for 3D) for headline character/line splitting
- No CSS framework required — hand-write CSS with custom properties (below). If you prefer utility CSS, Tailwind is acceptable but the design tokens in §2 are the source of truth.

Structure the app cleanly: a single persistent `<Canvas>` layer behind the DOM content (fixed, pointer-events-none), a scroll-progress bridge shared between DOM and 3D, and one component per section. Keep shaders in `.glsl`/`.ts` files, not inline strings where avoidable.

## 2. Design system

**Palette (define as CSS custom properties + a shared TS constants file so 3D and DOM agree):**

```
--bg-void:      #0A0A0B   /* page base, the charcoal void */
--bg-surface:   #141417   /* raised surfaces / cards */
--bg-elevated:  #1B1B1F   /* hover / elevated cards */
--line:         #26262B   /* hairline borders */
--text-hi:      #EDEDE6   /* primary text, warm off-white */
--text-mid:     #A5A59C   /* secondary text */
--text-low:     #6E6E67   /* captions, meta */
--amber:        #FF8C1A   /* primary accent */
--amber-hot:    #FFB84D   /* highlights, hot core */
--amber-white:  #FFE7C2   /* hottest core center */
--ember:        #C2410C   /* deep ember, cooled edges */
--amber-glow:   rgba(255,140,26,0.14) /* ambient glows */
```

The amber is a *signal* colour — used sparingly for emphasis, active states, the hero core, and the connecting "signal line" motif in the How-I-Build section. The site is 90% charcoal, 10% amber. Restraint is the point.

**Typography:**
- Display / headings: `Clash Display` or `Space Grotesk` (pick the more distinctive one; Clash Display preferred). Tight tracking, large scale.
- Body: `Inter` (or `Geist`), comfortable line-height.
- Mono accents: `JetBrains Mono` or `Geist Mono` for labels, section numbers, code-flavoured details, metrics. The mono touches sell the engineered feel.
- Use a fluid type scale (`clamp()`), generous section spacing, and a strict baseline rhythm.

**Motion principles (apply consistently):**
- Everything reveals **from a masked/clipped state**, not just opacity. Use `clip-path` / overflow-mask reveals and character/line staggers.
- Easing: `power3.out` / `expo.out` for entrances; `power2.inOut` for scrubbed timelines. No default linear.
- Entrance durations ~0.8–1.2s, staggers ~0.04–0.08s.
- One consistent "amber signal" idea recurs: a thin amber line or spark that draws/travels to connect ideas.
- Respect `prefers-reduced-motion` everywhere (see §8) — this is non-negotiable, not optional polish.

## 3. Information architecture

Single long scroll. Each section gets its **own distinct GSAP treatment** (spec'd in §5) — no two sections should animate the same way.

1. **Hero** — the Forge Core (§4)
2. **About / Positioning** — who he is, the one-paragraph thesis
3. **Featured Work** — DocSense + Agent Orchestration Pipeline (+ one open slot)
4. **How I Build** — the subtle AI-led-workflow thread, as an agentic pipeline visual
5. **Stack** — the toolset
6. **Path** — short experience/timeline
7. **Contact** — finale + CTA

A fixed minimal nav (logo mark + section jump + a mono scroll-progress indicator). A custom cursor is welcome but optional; if added, keep it subtle and disable on touch.

## 4. The Hero — "The Forge Core"

A single 3D asset that **moves to match scroll**. The concept: a molten core of amber particles suspended in a charcoal void — living, breathing, and reactive.

**The asset:** a GPU particle system of ~40k–80k points (desktop) rendered as `THREE.Points` with a **custom vertex + fragment shader** (additive blending, soft round sprites). Particle base positions sampled from a sphere/icosphere surface + interior. Motion comes from **curl noise** displacement in the vertex shader so it feels organic and alive, never static.

**Scroll-driven behaviour** — drive the scene from a single normalized progress value `p` (0 at top of hero → 1 at hero exit), smoothed with a lerp in `useFrame` (do **not** set React state every frame). Map `p` to uniforms:

| `p` range | Camera | Particles | Colour |
|-----------|--------|-----------|--------|
| 0.0 | Close, centered on a tight glowing core | Dense, coalesced ember sphere, gentle breathing | Hot white-amber center (`--amber-white`) → amber falloff |
| 0.0 → 0.5 | Slow dolly-back + gentle orbit | Core expands, curl turbulence rises, particles begin to stream outward | Center cools slightly, edges deepen toward `--ember` |
| 0.5 → 1.0 | Continue orbit, slight tilt | Dispersion into an expansive drifting field; optional morph toward a second silhouette | Cooler, embers scattered, sparse hot flecks remain |

Mouse position adds subtle parallax/rotation (damped). On hero exit the core should feel like it dissolves *into* the rest of the page rather than hard-cutting.

**Postprocessing:** `Bloom` (threshold tuned so only the hot core blooms, luminanceThreshold ~0.6), `Vignette` (subtle), `Noise`/film grain (very low opacity), optional faint `ChromaticAberration` at frame edges. Do not over-bloom — it should look like glowing embers, not a lens flare.

**Hero DOM overlay:** large display headline with a masked line-by-line reveal on load, a mono kicker label, and a scroll cue. Headline copy in §6. The 3D lives on the fixed canvas behind the DOM; the headline sits crisply on top.

**Finale callback:** in the Contact section (§5.7), the same core briefly re-condenses / flares as a bookend. Reuse the system; don't build a second one.

## 5. Per-section GSAP specs (each unique)

**5.1 Hero** — Load: masked line reveal on headline (staggered), mono label fades up, scroll cue pulses. Scroll: drives the Forge Core (§4). ScrollTrigger `scrub` bridges scroll → the shared progress ref.

**5.2 About / Positioning** — Pin the section briefly. A short thesis paragraph reveals **line by line via a clip-path wipe** as you scroll through the pin, each line un-masking from left. A single amber keyword in the paragraph gets a highlight-underline draw. Keep it to ~3–4 lines of genuinely good copy.

**5.3 Featured Work** — **Horizontal pinned scroll gallery.** Pin the section and translate a horizontal track of project cards as the user scrolls vertically (scrub). Each card: image/preview with a reveal-wipe on enter, title/stack/metrics staggering in, and a slight 3D tilt-on-hover (drei/`gsap` quickTo for the tilt). This horizontal moment is the section's signature — no other section scrolls sideways. Provide a reduced-motion fallback that stacks the cards vertically with simple fades.

**5.4 How I Build** (the AI thread) — Render the workflow as a **vertical agentic pipeline**: labelled nodes connected by a line. As you scroll, an **SVG stroke draws down the connecting line** (`DrawSVGPlugin` if available, else animate `stroke-dashoffset`), and each node **lights amber in sequence** as the line reaches it, with its caption fading in beside it. This visually echoes his LangGraph multi-agent / human-in-the-loop work — form mirroring content. Nodes e.g.: *Spec & scope → Build with Claude Code / agents → Human-in-the-loop review → Ship → Teach the team*. Keep captions short and confident.

**5.5 Stack** — An **infinite marquee** of tech (two rows, opposite directions, gsap loop), paused/slowed on hover. Below it, skill "chips" that **settle into place with a staggered spring-ish overshoot** (`back.out(1.4)`) as the section enters. Group by: Languages · AI/Agents · Data/Infra · Cloud.

**5.6 Path** — A **vertical timeline** with a scrubbed amber progress line that fills as you scroll past it; entries slide/fade in from alternating sides, meta in mono. Short — 3–4 entries.

**5.7 Contact** — Finale. The **Forge Core re-condenses and flares** (reuse §4 system, drive a short intense timeline). Big kinetic display type ("Let's build something") reveals with a character stagger, email with a masked reveal, and a **magnetic CTA button** (button follows cursor within a small radius via `gsap.quickTo`). Footer with subtle links in mono.

## 6. Content (real — Andrew to verify links/metrics before shipping)

**Hero headline (pick/tune):** "I build AI systems that ship." with a mono kicker like `AI & AGENTIC ENGINEER · WELLINGTON, NZ`. Alt: "Forging intelligent software." Keep it short and declarative.

**About thesis (draft):** Full-stack developer specialising in AI and agentic engineering. Builds retrieval and multi-agent systems end to end — and, increasingly, helps the people around him build with AI too. Self-taught into the frontier via Dev Academy Aotearoa; ships fast, learns faster.

**Featured Work:**
- **DocSense** — a production-grade RAG pipeline. LangChain.js · Qdrant · nomic-embed-text · Ollama, React/Vite frontend. Evaluated against a government policy corpus with strong retrieval benchmarks. Angle: local-first, private, measurable. *(Add: 1–2 real metrics, repo/live link.)*
- **Agent Orchestration Pipeline** — a LangGraph multi-agent system with human-in-the-loop approval gates, PII scrubbing, SSE streaming, and full audit logging. Angle: agentic done *responsibly* — the enterprise concerns, not just a demo. *(Add: link.)*
- **[Open slot]** — a third piece Andrew chooses (e.g., an internal tool or automation that shows breadth). Leave a clean placeholder card if not ready.

**How I Build (pipeline captions, draft):** Spec-driven, AI-led. I scope tightly, build alongside agents (Claude Code, LangGraph), keep a human in the loop where it matters, ship, then help teammates do the same. *(This is the subtle enablement thread — keep it grounded and specific, not hype.)*

**Stack:** TypeScript · Node.js · React · Python · LangChain.js · LangGraph · Qdrant · Ollama · Azure · Microsoft Entra · SSE. Group sensibly.

**Path:**
- *Contract Software Developer — BRANZ* — Azure-hosted backend systems; led a Microsoft Entra identity migration.
- *Dev Academy Aotearoa (2023)* — NZ Certificate in Applied Software Development, Level 6.
- *(Optional earlier entry / "now" entry.)*

**Contact:** email + GitHub + LinkedIn. CTA copy: "Let's build something." Wellington-based.

> Do not invent metrics, employers, or credentials beyond what's given here. Where a real link or number is missing, use a clearly-marked placeholder Andrew can fill.

## 7. Implementation notes (avoid the common R3F + GSAP traps)

- **One scroll authority.** Initialize Lenis and drive both the page and ScrollTrigger from it. Sync via `lenis.on('scroll', ScrollTrigger.update)` and drive Lenis from gsap's ticker (`gsap.ticker.add`), with `lagSmoothing(0)`.
- **Bridge scroll → 3D through a ref, not state.** Keep a shared `progressRef` updated by a ScrollTrigger `onUpdate`; read and lerp it inside `useFrame`. Never `setState` per frame.
- **Use `useGSAP` (@gsap/react)** for every animation so contexts clean up on unmount. Register plugins once.
- **Canvas setup:** `dpr={[1, 2]}` capped, `gl={{ antialias: true, powerPreference: 'high-performance' }}`, `frameloop="always"` (needed for continuous particle motion). Fixed full-viewport, `pointer-events: none`, behind DOM.
- **Shaders:** curl-noise in the vertex shader; pass `uProgress`, `uTime`, `uMouse`, colour uniforms. Soft circular points in the fragment shader (discard outside radius, smooth alpha), additive blending, `depthWrite={false}`.
- Dispose geometries/materials on unmount; guard against context loss.

## 8. Performance & accessibility (non-negotiable)

- **`prefers-reduced-motion`:** freeze the particle system to a gentle idle (or a static tasteful frame), disable all scrubbed/scroll-driven motion and horizontal scroll, and replace reveals with simple short fades. The site must be fully usable and still handsome with motion off.
- **Mobile / low-power:** detect via `matchMedia` + device heuristics. Drop particle count (~10–20k), lower DPR, disable/soften postprocessing, and convert the horizontal Featured Work gallery to a vertical stack. Consider a static hero fallback on very low-end devices.
- **Perf targets:** 60fps on a modern laptop for the hero; no long main-thread blocks; lazy-load below-the-fold section logic; keep bundle lean (tree-shake drei imports).
- **A11y basics:** semantic landmarks, focus states, keyboard-navigable nav and CTA, alt text, sufficient contrast for all text (the charcoal/amber must pass AA for body text), `aria-hidden` on the decorative canvas.
- **SEO/meta:** title, description, Open Graph image, favicon/mark.

## 9. Build sequence (do these as ordered milestones — stop for review at each)

1. **Scaffold** — Vite + React + TS strict, install deps, folder structure, base CSS reset + design tokens from §2, empty section shells, Lenis + ScrollTrigger wired and verified with a throwaway test animation.
2. **Design system pass** — typography loaded, tokens applied, nav, spacing rhythm, a couple of reusable primitives (masked-reveal text, section wrapper). Make an empty page already feel considered.
3. **Hero / Forge Core** — the persistent `<Canvas>`, particle system + shaders, scroll-progress bridge, postprocessing, hero DOM overlay. Get this *beautiful* before anything else. This is the make-or-break.
4. **Sections one at a time** — About → Featured Work → How I Build → Stack → Path → Contact, each with its §5 animation. Review after each.
5. **Reduced-motion + mobile passes** — §8. Test with motion off and on a narrow viewport.
6. **Polish** — micro-interactions, custom cursor (optional), loading sequence, meta/OG, Lighthouse pass, final perf tuning.

## 10. Acceptance criteria

- Hero: a single 3D asset that visibly, smoothly reacts to scroll (camera + dispersion + colour), with tasteful bloom. No jank, no per-frame React state.
- Every section has a **distinct** GSAP treatment; Featured Work scrolls horizontally; How I Build draws a sequential amber pipeline.
- Strictly the charcoal + amber system from §2; amber used as a restrained signal colour.
- The "how I build with AI" thread is present but subtle and confident.
- `prefers-reduced-motion` and mobile fallbacks both fully implemented and genuinely usable.
- TypeScript strict with no errors; clean, componentized, readable code with shaders in their own files.
- Real content from §6 in place; placeholders clearly marked where Andrew must fill links/metrics.

Start with Milestone 1. Confirm the scaffold and the scroll wiring work before building the Forge Core.
