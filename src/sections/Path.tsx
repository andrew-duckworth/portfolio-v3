import { useRef } from 'react';
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';
import { COLORS } from '../theme/tokens';

interface TimelineEntry {
  title: string;
  desc: string;
  meta: string;
}

const ENTRIES: TimelineEntry[] = [
  {
    title: 'Building Production Systems',
    desc: 'Cloud-hosted Azure backend (Python/FastAPI/PostgreSQL) with distributed Raspberry Pi clients; database-backed runtime configuration.',
    meta: 'BRANZ · Developer & IT Technician · 2023–Present',
  },
  {
    title: 'Full-Stack Foundations',
    desc: 'NZ Certificate in Applied Software Development, Level 6.',
    meta: 'Dev Academy Aotearoa · 2023',
  },
  {
    title: 'Now: AI & Agentic Engineering',
    desc: 'Building RAG pipelines and multi-agent orchestration systems.',
    meta: 'Ongoing',
  },
];

/**
 * The scrub maps timeline-top-at-70% → timeline-bottom-at-70%, which pins the
 * fill's leading edge to this viewport line (edge = top + progress × height).
 * Entry triggers fire on the same line, so each slide-in lands exactly as the
 * fill reaches it. Changing one without the other breaks that sync.
 */
const FILL_LINE = 70;

/**
 * Path — a vertical timeline with a continuous scrubbed amber fill down the
 * central spine; entries slide in from alternating sides as the fill reaches
 * them. Deliberately unlike How I Build: one unbroken scaleY fill and lateral
 * entrances, not segmented SVG draws with sequential light-ups.
 */
export function Path() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const timeline = timelineRef.current;
      if (!timeline) return;

      // Reduced motion: the CSS default is the finished state (fill drawn,
      // entries in place, nodes lit) — a short fade is all that runs.
      if (prefersReducedMotion()) {
        gsap.fromTo(
          timeline,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'power1.out',
            scrollTrigger: { trigger: timeline, start: 'top 88%', once: true },
          },
        );
        return;
      }

      // ease:'none' + scrub:true keep the fill edge locked to FILL_LINE —
      // easing or scrub smoothing would let entries reveal ahead of the edge.
      gsap.to('.timeline__fill', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: timeline,
          start: `top ${FILL_LINE}%`,
          end: `bottom ${FILL_LINE}%`,
          scrub: true,
        },
      });

      // Initial offsets (alternating ±x on desktop, small y on mobile) live in
      // CSS, so tweening to identity works for every viewport without JS
      // branching on width.
      gsap.utils.toArray<HTMLElement>('.timeline-entry', timeline).forEach((entry) => {
        gsap
          .timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: { trigger: entry, start: `top ${FILL_LINE}%`, once: true },
          })
          .to(entry, { x: 0, y: 0, autoAlpha: 1, duration: 0.9 })
          .to(
            entry.querySelector('.timeline-entry__node'),
            { backgroundColor: COLORS.amber, borderColor: COLORS.amberHot, duration: 0.4 },
            0.15,
          );
      });
    },
    { scope: timelineRef },
  );

  return (
    <Section id="path" index="05" label="Path">
      <TextReveal as="h2" className="section__title">
        Path
      </TextReveal>
      <TextReveal as="p" className="section__lede" delay={0.15}>
        Developer &amp; IT technician at BRANZ. Dev Academy Aotearoa, 2023. Self-taught into the
        frontier.
      </TextReveal>
      <div ref={timelineRef} className="timeline">
        <div className="timeline__rail" aria-hidden="true">
          <div className="timeline__fill" />
        </div>
        <ol className="timeline__list">
          {ENTRIES.map((entry, i) => (
            <li
              key={entry.meta}
              className={`timeline-entry timeline-entry--${i % 2 === 0 ? 'left' : 'right'}`}
            >
              <span className="timeline-entry__node" aria-hidden="true" />
              <div className="timeline-entry__body">
                <h3 className="timeline-entry__title">{entry.title}</h3>
                <p className="timeline-entry__desc">{entry.desc}</p>
                <p className="timeline-entry__meta">{entry.meta}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
