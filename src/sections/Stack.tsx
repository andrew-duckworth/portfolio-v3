import { Fragment, useRef } from 'react';
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';

// Marquee rows are flavour; the grouped chips below are the semantic list.
const ROW_A = ['TypeScript', 'React', 'Node.js', 'Python', 'Azure', 'SSE'];
const ROW_B = ['LangChain.js', 'LangGraph', 'Qdrant', 'Ollama', 'Microsoft Entra'];
// Four copies per track: the loop tween travels half the track (two copies),
// so the wrap is seamless and two copies always out-span an ultrawide viewport.
const REPEATS = 4;

const GROUPS = [
  { label: 'Languages', items: ['TypeScript', 'Python', 'React'] },
  { label: 'AI / Agents', items: ['LangChain.js', 'LangGraph', 'Ollama'] },
  { label: 'Data / Infra', items: ['Node.js', 'Qdrant', 'SSE'] },
  { label: 'Cloud', items: ['Azure', 'Microsoft Entra'] },
] as const;

const MARQUEE_SPEED = 70; // px/s — duration derives from track width so both rows drift alike

/**
 * Stack — an infinite two-row marquee (opposite directions, slowed on hover)
 * over grouped skill chips that settle in with a spring-ish overshoot. The
 * marquee is aria-hidden and duplicated for the loop; screen readers get the
 * chip groups only. Under reduced motion the marquee simply stands still —
 * a masked band of type — and the chips get the house short fade.
 */
export function Stack() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const groupsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const marquee = marqueeRef.current;
    const groups = groupsRef.current;
    if (!marquee || !groups) return;

    if (prefersReducedMotion()) {
      gsap.fromTo(
        [marquee, groups],
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.5,
          ease: 'power1.out',
          stagger: 0.1,
          scrollTrigger: { trigger: marquee, start: 'top 88%', once: true },
        },
      );
      return;
    }

    // Marquee: endless drift, opposite directions. ease:'none' is required —
    // any curve would make the wrap point visible as a speed hitch.
    const tracks = gsap.utils.toArray<HTMLElement>('.stack__track', marquee);
    const loops = tracks.map((track, i) => {
      const duration = track.scrollWidth / 2 / MARQUEE_SPEED;
      return gsap.fromTo(
        track,
        { xPercent: i === 0 ? 0 : -50 },
        { xPercent: i === 0 ? -50 : 0, duration, ease: 'none', repeat: -1 },
      );
    });

    // Hover slows the drift rather than freezing it — still alive, readable.
    const slow = () =>
      loops.forEach((loop) => gsap.to(loop, { timeScale: 0.15, duration: 0.5, ease: 'power2.out' }));
    const resume = () =>
      loops.forEach((loop) => gsap.to(loop, { timeScale: 1, duration: 0.5, ease: 'power2.out' }));
    marquee.addEventListener('mouseenter', slow);
    marquee.addEventListener('mouseleave', resume);

    // Chips settle with a spring-ish overshoot; labels lead their columns.
    const tl = gsap.timeline({
      scrollTrigger: { trigger: groups, start: 'top 82%', once: true },
    });
    tl.fromTo(
      groups.querySelectorAll('.stack-group__label'),
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 },
    ).fromTo(
      groups.querySelectorAll('.stack-chip'),
      { autoAlpha: 0, y: 26, scale: 0.85 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)', stagger: 0.05 },
      0.15,
    );

    return () => {
      marquee.removeEventListener('mouseenter', slow);
      marquee.removeEventListener('mouseleave', resume);
    };
  });

  return (
    <Section id="stack" index="04" label="Stack">
      <TextReveal as="h2" className="section__title">
        Stack
      </TextReveal>
      <div ref={marqueeRef} className="stack__marquee" aria-hidden="true">
        {[ROW_A, ROW_B].map((row, r) => (
          <div key={r} className={r === 0 ? 'stack__track' : 'stack__track stack__track--outline'}>
            {Array.from({ length: REPEATS }, (_, copy) => (
              <Fragment key={copy}>
                {row.map((name) => (
                  <Fragment key={`${copy}-${name}`}>
                    <span className="stack__item">{name}</span>
                    <span className="stack__dot" />
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </div>
        ))}
      </div>
      <div ref={groupsRef} className="stack__groups">
        {GROUPS.map((group) => (
          <div key={group.label} className="stack-group">
            <h3 className="stack-group__label mono-label">{group.label}</h3>
            <ul className="stack-group__chips">
              {group.items.map((item) => (
                <li key={item} className="stack-chip">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
