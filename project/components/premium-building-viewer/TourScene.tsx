// components/TourScene.tsx
import { Suspense } from 'react';
import { BuildingModelLoader } from './building-model-loader';   // <-- your file
import PanoramaSphere from './PanoramaSphere';                 // see §3

export default function TourScene() {
  return (
    <>
      {/* 360 panorama (skybox) */}
      <Suspense fallback={null}>
        {/* <PanoramaSphere textureUrl="/assets/Panorama.jpg" /> */}
      </Suspense>

      {/* Whole building + all its interaction code */}
      <Suspense fallback={null}>
        <BuildingModelLoader quality="high" />
      </Suspense>

      {/* add lights / helpers if you need */}
    </>
  );
}
