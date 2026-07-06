import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';

export function About() {
  return (
    <Section id="about" index="01" label="About">
      <TextReveal as="h2" className="section__title">
        Builder first.
      </TextReveal>
      <TextReveal as="p" className="section__lede" delay={0.15}>
        Full-stack developer specialising in AI and agentic engineering. Builds retrieval and
        multi-agent systems end to end — and, increasingly, helps the people around him build
        with AI too.
      </TextReveal>
    </Section>
  );
}
