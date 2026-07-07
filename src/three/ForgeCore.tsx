import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../theme/tokens';
import { prefersReducedMotion } from '../lib/scroll';
import { forgeState } from './forgeState';
import type { QualityProfile } from './quality';
import { forgeCoreVertex } from './shaders/forgeCore.vertex';
import { forgeCoreFragment } from './shaders/forgeCore.fragment';

const { lerp } = THREE.MathUtils;

/** Sphere sampling: ~65% in a thin crust, the rest uniform through the core. */
function buildGeometry(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);

  for (let i = 0; i < count; i++) {
    // Uniform direction on the sphere.
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const radius =
      Math.random() < 0.65
        ? 0.85 + Math.random() * 0.15 // ember crust
        : Math.cbrt(Math.random()) * 0.85; // interior, uniform by volume

    positions[i * 3] = s * Math.cos(phi) * radius;
    positions[i * 3 + 1] = s * Math.sin(phi) * radius;
    positions[i * 3 + 2] = u * radius;

    seeds[i * 4] = Math.random(); // size variance
    seeds[i * 4 + 1] = Math.random(); // breathing phase
    seeds[i * 4 + 2] = Math.random(); // drift speed / dispersion reach
    seeds[i * 4 + 3] = Math.random(); // > 0.97 → persistent hot fleck
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  return geometry;
}

export function ForgeCore({ profile }: { profile: QualityProfile }) {
  // Read once at mount — the scene is built for one motion mode.
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const geometry = useMemo(() => buildGeometry(profile.particleCount), [profile.particleCount]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: forgeCoreVertex,
        fragmentShader: forgeCoreFragment,
        // Without the composer the material must encode its own output.
        defines: profile.postprocessing ? {} : { MANUAL_OUTPUT_TRANSFORM: '' },
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uPixelRatio: { value: 1 },
          uSize: { value: 14 },
          uColorInner: { value: new THREE.Color(COLORS.amberWhite) },
          uColorMid: { value: new THREE.Color(COLORS.amber) },
          uColorOuter: { value: new THREE.Color(COLORS.ember) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      }),
    [profile.postprocessing],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    if (!profile.mouseParallax || reducedMotion) return;
    // The canvas is pointer-events: none, so listen on the window.
    const onPointerMove = (e: PointerEvent) => {
      forgeState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      forgeState.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [profile.mouseParallax, reducedMotion]);

  // Smoothed copies of the shared state, lerped per frame — never React state.
  const smoothed = useRef({ progress: 0, mouseX: 0, mouseY: 0 });

  useFrame((state, delta) => {
    // Clamp dt so a backgrounded tab doesn't snap the lerps on return.
    const dt = Math.min(delta, 1 / 30);
    const s = smoothed.current;
    // Frame-rate-independent exponential damping.
    const kScroll = 1 - Math.exp(-dt * 6);
    const kMouse = 1 - Math.exp(-dt * 3);
    s.progress += (forgeState.heroProgress - s.progress) * kScroll;
    s.mouseX += (forgeState.mouse.x - s.mouseX) * kMouse;
    s.mouseY += (forgeState.mouse.y - s.mouseY) * kMouse;

    const u = material.uniforms;
    // Reduced motion: no scroll scrub reaches here (progress stays 0), and
    // time runs slow — the "gentle idle" the brief asks for.
    u.uTime.value += dt * (reducedMotion ? 0.25 : 1);
    u.uProgress.value = s.progress;
    (u.uMouse.value as THREE.Vector2).set(s.mouseX, s.mouseY);
    u.uPixelRatio.value = state.gl.getPixelRatio();

    // Camera per the §4 table: slow dolly-back with an orbit that tilts in
    // the second half. Mouse adds damped parallax on top.
    const p = s.progress;
    const dist = p < 0.5 ? lerp(3.2, 4.6, p / 0.5) : lerp(4.6, 6.5, (p - 0.5) / 0.5);
    const yaw = p * 0.7 + s.mouseX * 0.06;
    const pitch = p * 0.12 - s.mouseY * 0.04;
    state.camera.position.set(
      Math.sin(yaw) * Math.cos(pitch) * dist,
      Math.sin(pitch) * dist,
      Math.cos(yaw) * Math.cos(pitch) * dist,
    );
    state.camera.lookAt(0, 0, 0);
  });

  // Displacement happens in the vertex shader, so the CPU-side bounding
  // sphere is meaningless — never let it cull the points.
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
