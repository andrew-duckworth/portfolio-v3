import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

/**
 * Hero postprocessing. Bloom threshold sits above the base particle
 * brightness — only the shader's >1.0 hot-core output crosses it, so the
 * glow reads as embers, not lens flares. Skipped entirely on the low tier.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.6} mipmapBlur intensity={0.7} radius={0.6} />
      <Noise premultiply opacity={0.045} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  );
}
