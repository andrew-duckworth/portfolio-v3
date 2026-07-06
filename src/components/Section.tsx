import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  index: string;
  title: string;
  children?: ReactNode;
}

/**
 * Placeholder semantic shell for a page section. Real layouts replace the
 * innards per milestone; the landmark structure (id + labelled heading) stays.
 */
export function Section({ id, index, title, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} className="section" aria-labelledby={headingId}>
      <p className="section__index">{index}</p>
      <h2 id={headingId} className="section__title">
        {title}
      </h2>
      {children}
    </section>
  );
}
