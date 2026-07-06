/** Path — scrubbed vertical timeline lands in Milestone 4. */
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';

export function Path() {
  return (
    <Section id="path" index="05" label="Path">
      <TextReveal as="h2" className="section__title">
        Path
      </TextReveal>
      <TextReveal as="p" className="section__lede" delay={0.15}>
        Contract software developer at BRANZ. Dev Academy Aotearoa, 2023. Self-taught into the
        frontier.
      </TextReveal>
      <p className="section__placeholder mono-label">[ Timeline — Milestone 4 ]</p>
    </Section>
  );
}
