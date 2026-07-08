import { useRef, type MouseEvent } from 'react';
import { ScrollTrigger, useGSAP, getLenis } from '../lib/scroll';

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'how', label: 'Build' },
  { id: 'stack', label: 'Stack' },
  { id: 'path', label: 'Path' },
  { id: 'contact', label: 'Contact' },
] as const;

/**
 * Fixed minimal nav: logo mark, section jump links, mono scroll-progress
 * readout. Jumps go through Lenis so there stays exactly one scroll
 * authority; without Lenis (reduced motion) the native anchor jump runs
 * and html's scroll-padding-top clears the nav.
 */
export function Nav() {
  const progressRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = progressRef.current;
    if (!el) return;
    // Progress is written straight to the DOM node — never React state.
    // end must be the literal 'max': ScrollTrigger's refresh loops back and
    // corrects string-'max' ends after pinned sections (About, Featured Work)
    // re-apply their pin spacing. A function returning maxScroll() is
    // evaluated mid-refresh while pins are reverted, which under-measures the
    // page and made the ticker hit 100% several sections early.
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        el.textContent = `${String(Math.round(self.progress * 100)).padStart(3, '0')}%`;
      },
    });
  });

  const jumpTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const lenis = getLenis();
    if (!lenis) return;
    event.preventDefault();
    lenis.scrollTo(`#${id}`, { duration: 1.2 });
  };

  return (
    <header className="nav">
      <a
        href="#hero"
        className="nav__logo mono-label"
        aria-label="Andrew Duckworth — back to top"
        onClick={(event) => jumpTo(event, 'hero')}
      >
        AD
        <span className="nav__logo-dot" aria-hidden="true" />
      </a>
      <nav aria-label="Sections">
        <ul className="nav__links mono-label">
          {LINKS.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} className="nav__link" onClick={(event) => jumpTo(event, id)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span ref={progressRef} className="nav__progress mono-label" aria-hidden="true">
        000%
      </span>
    </header>
  );
}
