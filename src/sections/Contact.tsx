import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/scroll';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '../lib/profile';
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';
import { forgeState } from '../three/forgeState';

/** Where the flare settles while Contact stays in view — calm ember, not peak. */
const FLARE_SUSTAIN = 0.45;
/** Magnetic CTA: fraction of the cursor offset the button follows, and its cap. */
const MAGNET_STRENGTH = 0.35;
const MAGNET_MAX_PX = 28;

/**
 * Contact — the finale (§5.7). The Forge Core re-condenses and flares once as
 * the section enters: a one-shot GSAP timeline on forgeState.contactFlare,
 * not a scroll scrub. heroProgress rests at 1 down here and the flare is its
 * own field/uniform, so the two writers can never fight; a companion trigger
 * decays the flare to 0 above the section, handing the core back to the hero
 * scrub bit-identically.
 */
export function Contact() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const body = bodyRef.current;
      if (!body) return;
      // Selector strings are scoped to bodyRef by useGSAP — the section is an
      // ancestor, so it must be passed as an element, not '#contact'.
      const section = body.closest('section');
      if (!section) return;

      if (prefersReducedMotion()) {
        // No flare replay — a simple appearance instead: the (never-dispersed)
        // idle core quietly returns behind the finale, mirroring Hero's
        // reduced-motion fade of the canvas layer past the hero.
        const canvasLayer = document.querySelector('.forge-canvas');
        if (canvasLayer) {
          // Callback-style with explicit targets + overwrite, matching Hero's
          // reduced-motion fade of the same layer — two toggleActions tweens
          // sharing one element would race on their recorded start values.
          const fadeTo = (autoAlpha: number) =>
            gsap.to(canvasLayer, { autoAlpha, duration: 0.6, ease: 'power1.out', overwrite: 'auto' });
          ScrollTrigger.create({
            trigger: section,
            start: 'top 60%',
            onEnter: () => fadeTo(0.55),
            onLeaveBack: () => fadeTo(0.15),
          });
        }
        gsap.fromTo(
          ['.contact__email-mask', '.contact__links', '.contact__cta-zone'],
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'power1.out',
            stagger: 0.1,
            scrollTrigger: { trigger: body, start: 'top 88%', once: true },
          },
        );
        return;
      }

      // --- Forge Core finale: one-shot re-condense + flare -----------------
      // One owner at a time: a pending timeline child must never resurrect
      // the flare after a scroll-up decay has taken over.
      let flareAnim: gsap.core.Animation | null = null;
      const driveFlare = (make: () => gsap.core.Animation) => {
        flareAnim?.kill();
        flareAnim = make();
      };
      let hasFlared = false;

      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        once: true,
        onEnter: () => {
          hasFlared = true;
          driveFlare(() =>
            gsap
              .timeline()
              // Gather + ignite, then settle into the sustain behind the copy.
              .to(forgeState, { contactFlare: 1, duration: 0.9, ease: 'power2.in' })
              .to(forgeState, { contactFlare: FLARE_SUSTAIN, duration: 1.4, ease: 'expo.out' }),
          );
        },
      });

      // Companion (non-once): releases the core above the section and restores
      // the sustain on later re-entries — without replaying the spike.
      ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        onLeaveBack: () =>
          driveFlare(() =>
            gsap.to(forgeState, { contactFlare: 0, duration: 0.8, ease: 'power2.out' }),
          ),
        onEnter: () => {
          if (!hasFlared) return; // first entry belongs to the one-shot above
          driveFlare(() =>
            gsap.to(forgeState, {
              contactFlare: FLARE_SUSTAIN,
              duration: 1.0,
              ease: 'power2.out',
            }),
          );
        },
      });

      // --- DOM reveals: masked email wipe, then links + CTA rise -----------
      // Initial clipped/offset states live in CSS behind the motion
      // preference (house pattern) — these tween to identity.
      gsap
        .timeline({ scrollTrigger: { trigger: body, start: 'top 78%', once: true } })
        .to('.contact__email', {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.0,
          ease: 'expo.out',
        })
        .to(
          ['.contact__links', '.contact__cta-zone'],
          { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 },
          0.35,
        );

      // --- Magnetic CTA (fine pointers only) -------------------------------
      const zone = zoneRef.current;
      const cta = ctaRef.current;
      let removeMagnet: (() => void) | undefined;
      if (zone && cta && window.matchMedia('(pointer: fine)').matches) {
        const xTo = gsap.quickTo(cta, 'x', { duration: 0.45, ease: 'power3.out' });
        const yTo = gsap.quickTo(cta, 'y', { duration: 0.45, ease: 'power3.out' });
        const clamp = gsap.utils.clamp(-MAGNET_MAX_PX, MAGNET_MAX_PX);

        const onMove = (e: PointerEvent) => {
          const rect = zone.getBoundingClientRect();
          xTo(clamp((e.clientX - (rect.left + rect.width / 2)) * MAGNET_STRENGTH));
          yTo(clamp((e.clientY - (rect.top + rect.height / 2)) * MAGNET_STRENGTH));
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        zone.addEventListener('pointermove', onMove);
        zone.addEventListener('pointerleave', onLeave);
        removeMagnet = () => {
          zone.removeEventListener('pointermove', onMove);
          zone.removeEventListener('pointerleave', onLeave);
        };
      }

      return () => {
        removeMagnet?.();
        // Context revert kills the tweens; make the handoff explicit so a
        // remount never inherits a stale flare.
        forgeState.contactFlare = 0;
      };
    },
    { scope: bodyRef },
  );

  return (
    <Section id="contact" className="contact" index="06" label="Contact">
      <div ref={bodyRef} className="contact__body">
        <TextReveal as="h2" split="chars" className="contact__title">
          Let&apos;s build something.
        </TextReveal>

        <div className="contact__email-mask">
          <a className="contact__email" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>

        <ul className="contact__links mono-label">
          <li>
            <a className="contact__link" href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a className="contact__link" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
        </ul>

        <div ref={zoneRef} className="contact__cta-zone">
          <a ref={ctaRef} className="contact__cta mono-label" href={`mailto:${EMAIL}`}>
            Say hello
          </a>
        </div>
      </div>
    </Section>
  );
}
