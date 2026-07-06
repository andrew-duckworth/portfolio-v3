/** Contact — finale with the Forge Core callback lands in Milestone 4. */
import { Section } from '../components/Section';
import { TextReveal } from '../components/TextReveal';

export function Contact() {
  return (
    <Section id="contact" index="06" label="Contact">
      <TextReveal as="h2" split="chars" className="section__title">
        Let&apos;s build something.
      </TextReveal>
      <p className="section__placeholder mono-label">
        [ Email · GitHub · LinkedIn — finale lands in Milestone 4 ]
      </p>
    </Section>
  );
}
