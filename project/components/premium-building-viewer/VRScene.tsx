'use client';

import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Suspense } from 'react';
import PlaceholderModel from './PlaceholderBox';   // or './PlaceholderBox'

export default function VRScene() {
  // Create the XR store instance
  const store = createXRStore();
  

  return (
    <Canvas shadows>
      <XR store={store}>
        <Suspense fallback={null}>
          {/* Center the placeholder so you see it right away */}
          <group position={[0, 1.4, -1.5]} /* y=eye-level */>
            <PlaceholderModel/>
          </group>
        </Suspense>

        {/* XR helpers */}
        {/* <Hands /> */}

        {/* A little light so you can see the model */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      </XR>
    </Canvas>
  );
}
