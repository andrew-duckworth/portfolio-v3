import { createElement, useRef } from 'react';
import SplitType from 'split-type';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';

type RevealTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';

interface TextRevealProps {
  /** Plain text only — SplitType rebuilds the node's contents. */
  children: string;
  as?: RevealTag;
  /** 'lines' slides whole lines out of a mask; 'chars' staggers characters. */
  split?: 'lines' | 'chars';
  className?: string;
  /** Seconds added before the reveal once its trigger fires. */
  delay?: number;
}

/**
 * Masked text reveal: SplitType splits the text, every line gets an
 * overflow-hidden mask, and lines (or chars) slide up from beneath it when
 * the element scrolls into view. Under reduced motion it's a short fade.
 * After the reveal completes the split is reverted so the DOM is clean and
 * later resizes can't strand stale line breaks.
 */
export function TextReveal({
  children,
  as = 'p',
  split = 'lines',
  className,
  delay = 0,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;

      if (prefersReducedMotion()) {
        gsap.fromTo(
          el,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'power1.out',
            delay,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        );
        return;
      }

      let instance: SplitType | null = null;
      let masks: HTMLElement[] = [];
      // contextSafe still executes after its context reverts, so a StrictMode
      // remount would otherwise split the same element twice via the stale
      // fonts.ready callback. The flag makes the stale run a no-op.
      let cancelled = false;

      const teardown = () => {
        for (const mask of masks) {
          const parent = mask.parentNode;
          if (parent) {
            while (mask.firstChild) parent.insertBefore(mask.firstChild, mask);
          }
          mask.remove();
        }
        masks = [];
        instance?.revert();
        instance = null;
      };

      const play = contextSafe(() => {
        if (cancelled || !ref.current) return;
        // 'chars' keeps words so wrapping survives the char-level spans.
        instance = new SplitType(el, {
          types: split === 'chars' ? 'lines,words,chars' : 'lines',
        });
        const lines = instance.lines ?? [];
        for (const line of lines) {
          const mask = document.createElement('div');
          mask.className = 'text-reveal__mask';
          line.parentNode?.insertBefore(mask, line);
          mask.appendChild(line);
          masks.push(mask);
        }

        const targets = split === 'chars' ? (instance.chars ?? []) : lines;
        if (targets.length === 0) {
          gsap.set(el, { autoAlpha: 1 });
          return;
        }

        gsap.fromTo(
          targets,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: split === 'chars' ? 0.9 : 1.0,
            ease: 'power3.out',
            stagger: split === 'chars' ? 0.04 : 0.08,
            delay,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            onComplete: teardown,
          },
        );
        // fromTo has already parked targets below the mask; safe to show.
        gsap.set(el, { autoAlpha: 1 });
      });

      // Split only after fonts load — line breaks measured against the
      // fallback font would be baked in wrong.
      document.fonts.ready.then(play);

      return () => {
        cancelled = true;
        teardown();
      };
    },
    { scope: ref },
  );

  const classes = className ? `text-reveal ${className}` : 'text-reveal';
  return createElement(
    as,
    // Starts hidden so unsplit text never flashes before the reveal.
    // aria-label keeps the accessible name whole while spans fragment it.
    { ref, className: classes, 'aria-label': children, style: { visibility: 'hidden' } },
    children,
  );
}
