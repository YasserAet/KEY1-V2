// components/PlaceholderBox.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXRControllerState } from '@react-three/xr';
import { Mesh } from 'three';

export default function PlaceholderBox() {
  const ref = useRef<Mesh>(null!);
  const rightController = useXRControllerState('right');

  useFrame(() => {
    if (rightController?.inputSource?.gamepad) {
      const [xAxis, yAxis] = rightController.inputSource.gamepad.axes;
      // x-stick rotates cube
      ref.current.rotation.y -= xAxis * 0.05;
      ref.current.rotation.x += yAxis * 0.05;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}
