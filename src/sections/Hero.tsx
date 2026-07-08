import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/scroll';
import { TextReveal } from '../components/TextReveal';
import { forgeState } from '../three/forgeState';

/** Hero — DOM overlay for the Forge Core, plus the scroll → 3D bridge. */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cue = cueRef.current;
      if (!sectionRef.current || !cue) return;

      // Reduced motion: no scrub — heroProgress stays 0 and the core idles.
      // But an undispersed core would then sit at full brightness behind
      // every section, so a short (non-scrubbed) fade recedes the canvas to
      // a whisper once the reader moves past the hero.
      if (prefersReducedMotion()) {
        const canvasLayer = document.querySelector('.forge-canvas');
        if (canvasLayer) {
          // Contact fades the same layer back up for its finale, so this must
          // be callback-style with explicit targets + overwrite — a reversing
          // toggleActions tween would restore whatever pre-tween value it
          // happened to record while the other section's fade was mid-flight.
          const fadeTo = (autoAlpha: number) =>
            gsap.to(canvasLayer, { autoAlpha, duration: 0.6, ease: 'power1.out', overwrite: 'auto' });
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'bottom 65%',
            onEnter: () => fadeTo(0.15),
            onLeaveBack: () => fadeTo(1),
          });
        }
        return;
      }

      gsap.from(cue, { autoAlpha: 0, duration: 1, ease: 'power1.out', delay: 1.6 });

      // The scroll → 3D bridge: write raw progress into the shared ref;
      // the scene lerps it inside useFrame. Never React state.
      let cueHidden = false;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          forgeState.heroProgress = self.progress;
          const hide = self.progress > 0.04;
          if (hide !== cueHidden) {
            cueHidden = hide;
            gsap.to(cue, {
              autoAlpha: hide ? 0 : 1,
              duration: 0.4,
              ease: 'power1.out',
              overwrite: 'auto',
            });
          }
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="hero" className="section hero" aria-label="Introduction">
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
