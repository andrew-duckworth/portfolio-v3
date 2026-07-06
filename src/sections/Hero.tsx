import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';
import { TextReveal } from '../components/TextReveal';

/** Hero — the Forge Core lands here in Milestone 3. Typography shell for now. */
export function Hero() {
  const cueRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !cueRef.current) return;
      gsap.from(cueRef.current, { autoAlpha: 0, duration: 1, ease: 'power1.out', delay: 1.6 });
    },
    { scope: cueRef },
  );

  return (
    <section id="hero" className="section hero" aria-label="Introduction">
      <TextReveal as="p" className="hero__kicker mono-label" delay={0.1}>
        AI &amp; Agentic Engineer · Wellington, NZ
      </TextReveal>
      <TextReveal as="h1" split="chars" className="hero__title" delay={0.3}>
        I build AI systems that ship.
      </TextReveal>
      <div ref={cueRef} className="hero__cue" aria-hidden="true">
        <span className="mono-label">Scroll</span>
        <span className="hero__cue-line" />
      </div>
    </section>
  );
}
