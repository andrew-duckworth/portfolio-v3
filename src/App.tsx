import { SmoothScroll } from './components/SmoothScroll';
import { Nav } from './components/Nav';
import { ForgeCanvas } from './three/ForgeCanvas';
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
      <a href="#about" className="skip-link mono-label">
        Skip to content
      </a>
      <ForgeCanvas />
      <Nav />
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
