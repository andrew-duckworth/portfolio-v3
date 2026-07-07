import { useRef } from 'react';
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';

interface Project {
  num: string;
  title: string;
  angle: string;
  stack: string[];
  /** Mono meta chips — placeholders are clearly marked for Andrew to fill. */
  meta: string[];
  previewNote: string;
  open?: boolean;
}

// Real content from the brief (§6). Metrics and links are deliberate
// placeholders — do not invent numbers.
const PROJECTS: Project[] = [
  {
    num: '01',
    title: 'DocSense',
    angle:
      'A production-grade RAG pipeline — local-first, private, measurable. Evaluated against a government policy corpus with strong retrieval benchmarks.',
    stack: ['LangChain.js', 'Qdrant', 'nomic-embed-text', 'Ollama', 'React / Vite'],
    meta: ['[ retrieval metric — tbd ]', '[ repo / live link — tbd ]'],
    previewNote: '[ preview — tbd ]',
  },
  {
    num: '02',
    title: 'Agent Orchestration Pipeline',
    angle:
      'A LangGraph multi-agent system built for the enterprise concerns, not just the demo — agentic, done responsibly.',
    stack: [
      'LangGraph',
      'Human-in-the-loop gates',
      'PII scrubbing',
      'SSE streaming',
      'Audit logging',
    ],
    meta: ['[ link — tbd ]'],
    previewNote: '[ preview — tbd ]',
  },
  {
    num: '03',
    title: 'Open slot',
    angle: 'A third build lands here — an internal tool or automation that shows breadth.',
    stack: [],
    meta: ['[ reserved ]'],
    previewNote: '[ reserved ]',
    open: true,
  },
];

/**
 * Featured Work — the site's one horizontal moment. The section pins and a
 * track of project cards translates sideways as the user scrolls vertically
 * (1:1, scrubbed). Card contents reveal via containerAnimation triggers as
 * they enter from the right. Vertical stack fallback on narrow viewports
 * (entrance animations only) and under reduced motion (simple fades).
 */
export function FeaturedWork() {
  const trackRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const section = track?.closest('.section');
      if (!track || !(section instanceof HTMLElement)) return;
      const cards = gsap.utils.toArray<HTMLElement>('.work-card', track);

      // Reduced motion: CSS-default vertical stack, short fades, no pin.
      if (prefersReducedMotion()) {
        for (const card of cards) {
          gsap.fromTo(
            card,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 0.5,
              ease: 'power1.out',
              scrollTrigger: { trigger: card, start: 'top 88%', once: true },
            },
          );
        }
        return;
      }

      const revealCard = (card: HTMLElement, containerAnimation?: gsap.core.Tween) => {
        const preview = card.querySelector('.work-card__preview');
        const items = card.querySelectorAll(
          '.work-card__title, .work-card__angle, .work-card__stack, .work-card__meta li',
        );
        // Hidden states are set imperatively (not in CSS) so reduced-motion
        // and no-trigger paths never depend on an animation to show content.
        if (preview) gsap.set(preview, { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(items, { autoAlpha: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            containerAnimation,
            start: containerAnimation ? 'left 82%' : 'top 82%',
            once: true,
          },
        });
        if (preview) {
          tl.to(preview, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'expo.out' });
        }
        tl.to(
          items,
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 },
          0.15,
        );
      };

      // Narrow viewports keep the vertical stack (decided once at mount,
      // same policy as the 3D quality tiers) — entrances only, no pin.
      if (!window.matchMedia('(min-width: 769px)').matches) {
        for (const card of cards) revealCard(card);
        return;
      }

      section.classList.add('work--horizontal');

      // Translate until the last card's right edge sits one gutter from the
      // viewport edge (offsetLeft ≈ the left gutter, so the end is symmetric).
      const distance = () => track.scrollWidth - window.innerWidth + track.offsetLeft;
      const scrollTween = gsap.to(track, {
        x: () => -distance(),
        // ease none: the track maps 1:1 to scroll (end === distance), and
        // containerAnimation triggers assume a linear container. Expressive
        // easing lives in the card reveals instead.
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      for (const card of cards) revealCard(card, scrollTween);

      // Slight 3D tilt on hover — pointer-driven, so fine pointers only.
      const listeners: Array<[HTMLElement, (e: PointerEvent) => void, () => void]> = [];
      if (window.matchMedia('(pointer: fine)').matches) {
        for (const card of cards) {
          gsap.set(card, { transformPerspective: 800 });
          const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power2.out' });
          const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power2.out' });
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            rotY(((e.clientX - r.left) / r.width - 0.5) * 5);
            rotX(((e.clientY - r.top) / r.height - 0.5) * -5);
          };
          const leave = () => {
            rotX(0);
            rotY(0);
          };
          card.addEventListener('pointermove', move);
          card.addEventListener('pointerleave', leave);
          listeners.push([card, move, leave]);
        }
      }

      return () => {
        section.classList.remove('work--horizontal');
        for (const [card, move, leave] of listeners) {
          card.removeEventListener('pointermove', move);
          card.removeEventListener('pointerleave', leave);
        }
      };
    },
    { scope: trackRef },
  );

  return (
    <Section id="work" index="02" label="Work" className="work">
      <TextReveal as="h2" className="section__title">
        Featured work
      </TextReveal>
      <ul ref={trackRef} className="work__track">
        {PROJECTS.map((p) => (
          <li key={p.title} className={p.open ? 'work-card work-card--open' : 'work-card'}>
            <div className="work-card__preview" aria-hidden="true">
              <span className="work-card__num">{p.num}</span>
              <span className="work-card__preview-note mono-label">{p.previewNote}</span>
            </div>
            <div className="work-card__body">
              <h3 className="work-card__title">{p.title}</h3>
              <p className="work-card__angle">{p.angle}</p>
              {p.stack.length > 0 && (
                <p className="work-card__stack">{p.stack.join(' · ')}</p>
              )}
              <ul className="work-card__meta mono-label">
                {p.meta.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
