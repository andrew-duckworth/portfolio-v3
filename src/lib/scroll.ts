import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type Lenis from 'lenis';

// Single registration point — import from this module instead of registering
// plugins ad hoc in components.
gsap.registerPlugin(ScrollTrigger, useGSAP);

/** True when the user has requested reduced motion. Read at call time, not cached. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// The live Lenis instance, registered by SmoothScroll. Null under reduced
// motion (native scroll) — callers must fall back to native behaviour.
let lenisInstance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  lenisInstance = lenis;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export { gsap, ScrollTrigger, useGSAP };
