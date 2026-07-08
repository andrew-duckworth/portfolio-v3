import { useRef } from 'react';
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';

/**
 * About / Positioning — the section pins briefly and the thesis un-masks
 * line by line via a scrubbed clip-path wipe (left → right). Lines are
 * hand-authored block spans rather than SplitType output so the scrubbed
 * timeline never needs re-splitting on resize or font swap; on narrow
 * viewports a span may wrap to two rows but still wipes as one unit.
 */
export function About() {
  const thesisRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const thesis = thesisRef.current;
      if (!thesis) return;

      // Reduced motion: no pin, no scrub — the CSS default leaves lines
      // unclipped and the underline drawn, so a short fade is all that runs.
      if (prefersReducedMotion()) {
        gsap.fromTo(
          thesis,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'power1.out',
            scrollTrigger: { trigger: thesis, start: 'top 88%', once: true },
          },
        );
        return;
      }

      const section = thesis.closest('.section');
      const lines = gsap.utils.toArray<HTMLElement>('.about__line', thesis);
      const keyword = thesis.querySelector<HTMLElement>('.about__keyword');
      if (!section || lines.length === 0) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          // Viewport-relative pin length: scroll distance scales with the
          // screen instead of overshooting on short/mobile viewports.
          end: '+=130%',
          pin: true,
          scrub: 0.4,
          anticipatePin: 1,
        },
      });

      lines.forEach((line, i) => {
        // Slight overlap (0.85 vs duration 1) so the wipe reads as one
        // continuous pass rather than four discrete steps.
        tl.to(line, { clipPath: 'inset(0 0% 0 0)', duration: 1 }, i * 0.85);
        if (keyword && line.contains(keyword)) {
          tl.to(
            keyword,
            { backgroundSize: '100% 2px', duration: 0.6, ease: 'power3.out' },
            i * 0.85 + 0.7,
          );
        }
      });
      // Hold at the end so the last line isn't mid-wipe as the pin releases.
      tl.to({}, { duration: 0.5 });
    },
    { scope: thesisRef },
  );

  return (
    <Section id="about" index="01" label="About" className="about">
      <TextReveal as="h2" className="section__title">
        Builder first.
      </TextReveal>
      <p ref={thesisRef} className="about__thesis">
        <span className="about__line">
          Full-stack developer specialising in AI and{' '}
          <em className="about__keyword">agentic engineering</em>.
        </span>
        <span className="about__line">
          I build retrieval and multi-agent systems end to end,
        </span>
        <span className="about__line">
          with a habit of evaluating what I build rather than just building it.
        </span>
        <span className="about__line">
          Self-taught into the frontier via Dev Academy Aotearoa.
        </span>
      </p>
    </Section>
  );
}
