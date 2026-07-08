import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/scroll';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '../lib/profile';

/**
 * Page footer — quiet mono meta below the finale, outside <main> so it is a
 * proper contentinfo landmark. Reduced motion never depends on JS: the hidden
 * initial state is gated in CSS and this only runs the motion-mode fade.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.to(el, {
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power1.out',
        scrollTrigger: { trigger: el, start: 'top 96%', once: true },
      });
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} className="footer mono-label">
      <p className="footer__id">© 2026 Andrew Duckworth · Wellington, NZ</p>
      <ul className="footer__links">
        <li>
          <a className="footer__link" href={`mailto:${EMAIL}`}>
            Email
          </a>
        </li>
        <li>
          <a className="footer__link" href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a className="footer__link" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </li>
      </ul>
      {/* One micro-touch of the enablement thread — stated, not preached. */}
      <p className="footer__note">Designed &amp; built AI-led</p>
    </footer>
  );
}
