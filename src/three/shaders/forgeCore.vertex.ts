/**
 * Forge Core vertex shader. Base positions are a sphere (crust + interior);
 * all motion is computed here — breathing idle, curl-noise turbulence and
 * radial dispersion — driven by uProgress (hero scroll) and uTime.
 */
export const forgeCoreVertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform vec2 uMouse;
uniform float uPixelRatio;
uniform float uSize;

attribute vec4 aSeed;

varying float vHeat;
varying float vAlpha;

// Simplex noise by Ashima Arts / Stefan Gustavson (MIT).
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
  return vec3(
    snoise(x),
    snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)),
    snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4))
  );
}

// Curl of a noise potential field via central differences — divergence-free,
// so the flow swirls instead of clumping. Normalized: amplitude is applied
// by the caller.
vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  vec3 pX0 = snoiseVec3(p - dx);
  vec3 pX1 = snoiseVec3(p + dx);
  vec3 pY0 = snoiseVec3(p - dy);
  vec3 pY1 = snoiseVec3(p + dy);
  vec3 pZ0 = snoiseVec3(p - dz);
  vec3 pZ1 = snoiseVec3(p + dz);

  float x = pY1.z - pY0.z - pZ1.y + pZ0.y;
  float y = pZ1.x - pZ0.x - pX1.z + pX0.z;
  float z = pX1.y - pX0.y - pY1.x + pY0.x;

  return normalize(vec3(x, y, z) / (2.0 * e));
}

void main() {
  float p = uProgress;
  float r = length(position);
  vec3 dir = position / max(r, 1e-5);

  // §4 table phases: turbulence builds over 0 → 0.5, dispersion over 0.35 → 1.
  float rise = smoothstep(0.0, 0.5, p);
  float scatter = smoothstep(0.35, 1.0, p);

  vec3 pos = position;

  // Gentle breathing at rest, handed over to turbulence as scroll begins.
  pos += dir * sin(uTime * 0.6 + aSeed.y * 6.2831) * 0.03 * (1.0 - rise);

  // Radial stream outward into a drifting field; per-particle reach variance
  // keeps the dispersed cloud ragged instead of a scaled sphere.
  pos *= mix(1.0, 2.8 * (0.7 + 0.6 * aSeed.z), scatter);

  // Curl turbulence sampled at the *base* position so the field stays
  // coherent while particles stream through it.
  float amp = mix(0.12, 0.65, rise);
  float freq = mix(1.2, 1.7, rise);
  pos += curlNoise(position * freq + uTime * (0.10 + aSeed.z * 0.06)) * amp;

  // Heat: a tight white-amber center with a fast amber → ember falloff —
  // most of the sphere is dim crust; only the innermost fraction runs hot.
  // aSeed.w > 0.97 marks the sparse flecks that stay hot at full dispersion.
  float coreness = 1.0 - smoothstep(0.15, 0.7, r);
  float heat = coreness * mix(1.0, 0.3, smoothstep(0.2, 0.9, p));
  heat = max(heat, step(0.97, aSeed.w) * 0.85);
  // Whisper of pointer response: the side facing the cursor runs warmer.
  heat += dot(dir.xy, uMouse) * 0.04;
  vHeat = clamp(heat, 0.0, 1.0);

  // Hero-exit dissolve: the field recedes to a faint drift behind the page
  // (~0.15) rather than staying loud under later sections.
  vAlpha = mix(1.0, 0.15, smoothstep(0.55, 1.0, p)) * mix(0.3, 1.0, vHeat);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * mix(0.6, 1.4, aSeed.x) * (0.8 + vHeat * 0.6) * uPixelRatio / -mvPosition.z;
}
`;
