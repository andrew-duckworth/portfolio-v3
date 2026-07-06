import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion, setLenis } from '../lib/scroll';

/**
 * Single scroll authority. Lenis drives the page; ScrollTrigger is updated
 * from Lenis and Lenis is ticked from gsap's ticker, so there is exactly one
 * rAF loop and one source of scroll truth. Nothing else may touch scroll.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Reduced motion: native scroll, no smoothing. ScrollTrigger still works
    // for the short-fade fallbacks used in later milestones.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    setLenis(lenis);

    const tick = (time: number) => {
      lenis.raf(time * 1000); // gsap ticker time is seconds; Lenis wants ms
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      setLenis(null);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
