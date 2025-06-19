// components/PanoramaSphere.tsx
'use client';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, BackSide } from 'three';

export default function PanoramaSphere({ textureUrl }: { textureUrl: string }) {
  const tex = useLoader(TextureLoader, textureUrl);
  return (
    <mesh>
      <sphereGeometry args={[50, 64, 32]} />
      <meshBasicMaterial map={tex} side={BackSide} />
    </mesh>
  );
}
