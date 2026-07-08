import { useRef } from 'react';
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';
import { COLORS } from '../theme/tokens';

interface PipelineStep {
  num: string;
  title: string;
  caption: string;
}

const STEPS: PipelineStep[] = [
  {
    num: '01',
    title: 'Spec & scope',
    caption: 'Tight scope, clear acceptance criteria, written before any code. The brief does the steering.',
  },
  {
    num: '02',
    title: 'Milestone by milestone',
    caption: 'Each piece built, reviewed, and committed before the next begins. No one-shot builds.',
  },
  {
    num: '03',
    title: 'Plan mode where it matters',
    caption: 'Full plan-and-approve for architecture-level decisions; lighter checks for the rest.',
  },
  {
    num: '04',
    title: 'Verify it myself',
    caption: "Scroll it, break it, check it with motion off. A green test isn't the finish line.",
  },
  {
    num: '05',
    title: 'Commit and move on',
    caption: 'Clean checkpoints mean a bad turn costs one revert, not an afternoon.',
  },
];

/**
 * How I Build — the workflow rendered as a vertical agentic pipeline. A
 * scrubbed timeline draws an amber stroke down the connecting rail and each
 * node lights in sequence as the stroke reaches it (form mirroring the
 * LangGraph human-in-the-loop work it describes). No pin — unlike About and
 * Featured Work, this section flows; the scrub tracks it through the viewport.
 *
 * The rail is one SVG segment per step (this node → the next), sized purely
 * in CSS from the constant dot offset and list gap, so the draw needs no
 * measurement and survives resize/font-swap. Each segment's line is exactly
 * 100 user units long, so `stroke-dasharray: 100` covers it without
 * `pathLength` (patchy on SVG <line> in older Safari) — which also lets the
 * undrawn state live in CSS behind the motion preference, like About.
 */
export function HowIBuild() {
  const listRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;

      // Reduced motion: the CSS default is the finished state (rail drawn,
      // nodes lit, captions visible) — a short fade is all that runs.
      if (prefersReducedMotion()) {
        gsap.fromTo(
          list,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'power1.out',
            scrollTrigger: { trigger: list, start: 'top 88%', once: true },
          },
        );
        return;
      }

      const steps = gsap.utils.toArray<HTMLElement>('.pipeline__step', list);
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: list,
          start: 'top 75%',
          end: 'bottom 45%',
          scrub: 0.4,
        },
      });

      steps.forEach((step, i) => {
        const node = step.querySelector('.pipeline__node');
        const title = step.querySelector('.pipeline__title');
        const caption = step.querySelector('.pipeline__caption');
        const draw = step.querySelector('.pipeline__draw');
        // Each step owns a 1.2 slot: light-up (0.3) overlapping the segment
        // draw (1.0 from +0.2), which lands exactly as the next step starts.
        const at = i * 1.2;

        tl.to(
          node,
          {
            backgroundColor: COLORS.amber,
            borderColor: COLORS.amberHot,
            boxShadow: `0 0 16px 3px ${COLORS.amberGlow}`,
            duration: 0.3,
          },
          at,
        )
          // A brief pop as the stroke arrives — the spark handing over.
          .to(
            node,
            {
              keyframes: [
                { scale: 1.4, duration: 0.12, ease: 'power2.out' },
                { scale: 1, duration: 0.22, ease: 'power2.in' },
              ],
            },
            at,
          )
          .to(title, { color: COLORS.textHi, duration: 0.3 }, at)
          .to(caption, { opacity: 1, y: 0, duration: 0.5 }, at + 0.1);

        if (draw) {
          tl.to(draw, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, at + 0.2);
        }
      });
      // Hold so the last light-up isn't mid-flight as the trigger releases.
      tl.to({}, { duration: 0.4 });
    },
    { scope: listRef },
  );

  return (
    <Section id="how" index="03" label="Process">
      <TextReveal as="h2" className="section__title">
        How I build
      </TextReveal>
      <TextReveal as="p" className="section__lede" delay={0.15}>
        Spec-driven, AI-led — the workflow is itself an agentic pipeline.
      </TextReveal>
      <ol ref={listRef} className="pipeline">
        {STEPS.map((step, i) => (
          <li key={step.num} className="pipeline__step">
            <span className="pipeline__node" aria-hidden="true" />
            {i < STEPS.length - 1 && (
              <svg
                className="pipeline__seg"
                viewBox="0 0 2 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <line className="pipeline__rail" x1="1" y1="0" x2="1" y2="100" />
                <line className="pipeline__draw" x1="1" y1="0" x2="1" y2="100" />
              </svg>
            )}
            <div className="pipeline__body">
              <h3 className="pipeline__title">
                <span className="pipeline__num mono-label">{step.num}</span>
                {step.title}
              </h3>
              <p className="pipeline__caption">{step.caption}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
