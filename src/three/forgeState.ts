/**
 * Shared mutable bridge between the DOM scroll world (GSAP/ScrollTrigger)
 * and the 3D scene. Written imperatively by ScrollTrigger onUpdate and
 * pointer handlers; read + lerped inside useFrame. Never mirrored into
 * React state — that would re-render per frame.
 */
export const forgeState = {
  /** Raw hero scroll progress, 0 at top of hero → 1 at hero exit. */
  heroProgress: 0,
  /**
   * Contact finale envelope, 0 = inert (hero scrub has full authority).
   * Tweened by Contact's one-shot timeline: → 1 (re-condense + flare) then
   * settles at a sustain while the section is in view, back to 0 above it.
   */
  contactFlare: 0,
  /** Pointer position normalized to [-1, 1] from viewport center. */
  mouse: { x: 0, y: 0 },
};
