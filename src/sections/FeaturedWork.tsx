import { useEffect, useRef } from 'react';
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';

interface ProjectVideo {
  webm: string;
  mp4: string;
  poster: string;
}

interface ProjectMeta {
  /** Visible methodology label rendered before the value (e.g. the eval
      method), so reviewers see how a metric was produced, not just numbers. */
  label?: string;
  text: string;
  href?: string;
}

interface Project {
  num: string;
  title: string;
  angle: string;
  stack: string[];
  /** Mono meta chips — remaining placeholders are clearly marked for Andrew to fill. */
  meta: ProjectMeta[];
  /** Looping demo clip; under reduced motion only the poster frame shows. */
  video?: ProjectVideo;
  previewNote?: string;
  open?: boolean;
}

// Real content from the brief (§6). DocSense metric + repo link confirmed by
// Andrew (2026-07-08); the remaining bracketed chips are deliberate
// placeholders — do not invent numbers.
const PROJECTS: Project[] = [
  {
    num: '01',
    title: 'DocSense',
    angle:
      'A production-grade RAG pipeline — local-first, private, measurable. Evaluated against a government policy corpus with strong retrieval benchmarks.',
    stack: ['LangChain.js', 'Qdrant', 'nomic-embed-text', 'Ollama', 'React / Vite'],
    meta: [
      { label: 'LLM-as-judge', text: '14/15 pass · 4.80/5 avg' },
      { text: 'GitHub repo', href: 'https://github.com/andrew-duckworth/docsense' },
    ],
    video: {
      webm: '/media/docsense-demo.webm',
      mp4: '/media/docsense-demo.mp4',
      poster: '/media/docsense-poster.jpg',
    },
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
    meta: [{ text: '[ link — tbd ]' }],
    previewNote: '[ preview — tbd ]',
  },
  {
    num: '03',
    title: 'Open slot',
    angle: 'A third build lands here — an internal tool or automation that shows breadth.',
    stack: [],
    meta: [{ text: '[ reserved ]' }],
    previewNote: '[ reserved ]',
    open: true,
  },
];

/**
 * Decorative looping demo clip inside a card preview. `preload="none"` means
 * only the poster fetches up front; an IntersectionObserver starts playback
 * (and with it the video fetch) as the card nears the viewport, and pauses it
 * again off-screen. The observer sees through the horizontal track's
 * transform, and the video sits inside the preview box, so the reveal-wipe
 * clip-path and hover tilt apply to it like any other preview content.
 */
function PreviewVideo({ webm, mp4, poster }: ProjectVideo) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return; // reduced motion — static poster <img> instead
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Rejection (autoplay policy, low-power mode) just leaves the
            // poster up — don't let it surface as a console warning.
            video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  if (prefersReducedMotion()) {
    return <img className="work-card__preview-media" src={poster} alt="" loading="lazy" />;
  }
  return (
    <video
      ref={videoRef}
      className="work-card__preview-media"
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      disablePictureInPicture
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}

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
              {p.video ? (
                <>
                  <PreviewVideo {...p.video} />
                  <span className="work-card__num work-card__num--overlay mono-label">
                    {p.num}
                  </span>
                </>
              ) : (
                <>
                  <span className="work-card__num">{p.num}</span>
                  <span className="work-card__preview-note mono-label">{p.previewNote}</span>
                </>
              )}
            </div>
            <div className="work-card__body">
              <h3 className="work-card__title">{p.title}</h3>
              <p className="work-card__angle">{p.angle}</p>
              {p.stack.length > 0 && (
                <p className="work-card__stack">{p.stack.join(' · ')}</p>
              )}
              <ul className="work-card__meta mono-label">
                {p.meta.map((m) => (
                  <li key={m.text}>
                    {m.label && <span className="work-card__meta-label">{m.label}</span>}
                    {m.href ? (
                      <a
                        className="work-card__meta-link"
                        href={m.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {m.text}
                      </a>
                    ) : (
                      <span>{m.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
