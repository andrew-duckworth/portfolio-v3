import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';
import { Section } from '../components/Section';

/**
 * TODO(M2): remove scroll test. Throwaway proof that the Lenis → ScrollTrigger
 * bridge works: a thin amber line scrubs scaleX 0→1 as the section crosses
 * the viewport. Delete this block (and .scroll-test in base.css) once real
 * animations land.
 */
function ScrollTest() {
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion() || !lineRef.current) return;
    gsap.to(lineRef.current, {
      scaleX: 1,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: lineRef.current,
        start: 'top 85%',
        end: 'top 35%',
        scrub: true,
      },
    });
  });

  return <div ref={lineRef} className="scroll-test" aria-hidden="true" />;
}

export function About() {
  return (
    <Section id="about" index="01 · About" title="About / Positioning">
      <ScrollTest />
    </Section>
  );
}
