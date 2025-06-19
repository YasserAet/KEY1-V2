// components/premium-building-viewer/vr-button.tsx
"use client"

import { useEffect, useState } from 'react'
import { Headset } from 'lucide-react'

export function VRButton() {
  const [supported, setSupported] = useState(false)
  
  useEffect(() => {
    // Check if browser supports WebXR
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          setSupported(supported)
        })
        .catch((err: unknown) => {
          console.log('VR support check failed:', err)
          setSupported(false)
        })
    }
  }, [])
  
  if (!supported) return null
  
  return (
    <button
      onClick={() => document.querySelector('canvas')?.requestFullscreen()}
      className="fixed bottom-4 right-4 z-50 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
      title="View in VR headset"
    >
      <Headset className="h-5 w-5 text-[#0b4d43]" />
    </button>
  )
}