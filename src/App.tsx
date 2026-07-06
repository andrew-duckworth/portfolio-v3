import { SmoothScroll } from './components/SmoothScroll';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { FeaturedWork } from './sections/FeaturedWork';
import { HowIBuild } from './sections/HowIBuild';
import { Stack } from './sections/Stack';
import { Path } from './sections/Path';
import { Contact } from './sections/Contact';

export default function App() {
  return (
    <SmoothScroll>
      <main>
        <Hero />
        <About />
        <FeaturedWork />
        <HowIBuild />
        <Stack />
        <Path />
        <Contact />
      </main>
    </SmoothScroll>
  );
}
