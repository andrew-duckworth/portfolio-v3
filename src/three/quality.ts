/**
 * Device-tier heuristics for the 3D scene (brief §8). Decided once at mount —
 * particle buffers are never re-allocated live.
 */
export interface QualityProfile {
  particleCount: number;
  dpr: [number, number];
  /** Bloom/Vignette/Noise chain. Off on low tier — additive blending still glows. */
  postprocessing: boolean;
  /** Damped pointer parallax. Pointless on touch devices. */
  mouseParallax: boolean;
}

function isLowPowerDevice(): boolean {
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const fewCores = navigator.hardwareConcurrency <= 4;
  return coarsePointer || narrow || fewCores;
}

export function getQualityProfile(): QualityProfile {
  if (isLowPowerDevice()) {
    return {
      particleCount: 15_000,
      dpr: [1, 1.5],
      postprocessing: false,
      mouseParallax: false,
    };
  }
  return {
    particleCount: 60_000,
    dpr: [1, 2],
    postprocessing: true,
    mouseParallax: true,
  };
}
