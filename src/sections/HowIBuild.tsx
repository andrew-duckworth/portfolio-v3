/** How I Build — the amber pipeline draw lands in Milestone 4. */
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';

export function HowIBuild() {
  return (
    <Section id="how" index="03" label="Process">
      <TextReveal as="h2" className="section__title">
        How I build
      </TextReveal>
      <TextReveal as="p" className="section__lede" delay={0.15}>
        Spec-driven, AI-led. Scope tightly, build alongside agents, keep a human in the loop
        where it matters, ship — then help teammates do the same.
      </TextReveal>
      <p className="section__placeholder mono-label">[ Pipeline visual — Milestone 4 ]</p>
    </Section>
  );
}
