import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { COLORS } from '../theme/tokens';
import { getQualityProfile } from './quality';
import { ForgeCore } from './ForgeCore';
import { Effects } from './Effects';

/**
 * The one persistent canvas — fixed full-viewport behind the DOM, decorative
 * and continuous across all sections (never mounted per section).
 */
export function ForgeCanvas() {
  const profile = useMemo(getQualityProfile, []);

  return (
    <div className="forge-canvas" aria-hidden="true">
      <Canvas
        dpr={profile.dpr}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        frameloop="always"
        camera={{ fov: 50, near: 0.1, far: 30, position: [0, 0, 3.2] }}
        onCreated={({ gl }) => {
          gl.setClearColor(COLORS.bgVoid, 1);
          // preventDefault is required for webglcontextrestored to ever fire;
          // three.js then rebuilds its GL state itself.
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
        }}
      >
        <ForgeCore profile={profile} />
        {profile.postprocessing && <Effects />}
      </Canvas>
    </div>
  );
}
