/** Stack — marquee + chip settle lands in Milestone 4. */
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';

export function Stack() {
  return (
    <Section id="stack" index="04" label="Stack">
      <TextReveal as="h2" className="section__title">
        Stack
      </TextReveal>
      <TextReveal as="p" className="section__placeholder mono-label" delay={0.15}>
        TypeScript · Node.js · React · Python · LangChain.js · LangGraph · Qdrant · Ollama ·
        Azure
      </TextReveal>
    </Section>
  );
}
