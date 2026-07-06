/** Featured Work — horizontal pinned gallery lands in Milestone 4. */
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';

export function FeaturedWork() {
  return (
    <Section id="work" index="02" label="Work">
      <TextReveal as="h2" className="section__title">
        Featured work
      </TextReveal>
      <TextReveal as="p" className="section__lede" delay={0.15}>
        DocSense — a production-grade RAG pipeline. Agent Orchestration — a LangGraph
        multi-agent system with human-in-the-loop gates.
      </TextReveal>
      <p className="section__placeholder mono-label">[ Horizontal gallery — Milestone 4 ]</p>
    </Section>
  );
}
