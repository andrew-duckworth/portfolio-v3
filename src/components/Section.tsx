import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';

interface SectionProps {
  id: string;
  /** Mono section number, e.g. "01". Omit to hide the meta row. */
  index?: string;
  /** Short mono label shown beside the index, e.g. "About". */
  label?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Section wrapper: consistent vertical rhythm plus a scroll-triggered meta
 * row (index · hairline rule · label) that draws in when the section enters.
 * The rule stays charcoal — the amber signal motif is reserved for sections
 * that earn it. Headings and content are the children's business (TextReveal).
 */
export function Section({ id, index, label, className, children }: SectionProps) {
  const metaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const meta = metaRef.current;
      if (!meta) return;

      if (prefersReducedMotion()) {
        gsap.fromTo(
          meta,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'power1.out',
            scrollTrigger: { trigger: meta, start: 'top 88%', once: true },
          },
        );
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: meta, start: 'top 85%', once: true },
      });
      tl.fromTo(
        meta.querySelectorAll('.section__index, .section__label'),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 },
      ).fromTo(
        meta.querySelectorAll('.section__rule'),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'expo.out' },
        0.15,
      );
    },
    { scope: metaRef },
  );

  return (
    <section id={id} className={className ? `section ${className}` : 'section'}>
      {(index || label) && (
        <div ref={metaRef} className="section__meta mono-label">
          {index && <span className="section__index">{index}</span>}
          <span className="section__rule" aria-hidden="true" />
          {label && <span className="section__label">{label}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
