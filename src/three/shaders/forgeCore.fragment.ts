/**
 * Forge Core fragment shader. Soft circular sprites — discard outside the
 * radius, smooth alpha falloff — coloured ember → amber → white-amber by the
 * per-particle heat from the vertex stage.
 */
export const forgeCoreFragment = /* glsl */ `
uniform vec3 uColorInner;
uniform vec3 uColorMid;
uniform vec3 uColorOuter;

varying float vHeat;
varying float vAlpha;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.05, d);

  vec3 color = mix(uColorOuter, uColorMid, smoothstep(0.0, 0.55, vHeat));
  color = mix(color, uColorInner, smoothstep(0.55, 1.0, vHeat));
  // Only the hottest particles are pushed past 1.0, so bloom
  // (luminanceThreshold 0.6) catches the core and nothing else. Cubed so
  // the boost stays confined to the innermost fraction.
  color *= 1.0 + vHeat * vHeat * vHeat * 1.2;

  gl_FragColor = vec4(color, alpha * vAlpha);

#ifdef MANUAL_OUTPUT_TRANSFORM
  // Low tier renders without the EffectComposer, so the renderer's tone
  // mapping + sRGB encoding must be applied here (built-in materials get
  // these chunks injected automatically; ShaderMaterial does not).
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
#endif
}
`;
