import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Single registration point — import from this module instead of registering
// plugins ad hoc in components.
gsap.registerPlugin(ScrollTrigger, useGSAP);

/** True when the user has requested reduced motion. Read at call time, not cached. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger, useGSAP };
