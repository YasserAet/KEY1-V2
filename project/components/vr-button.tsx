"use client"

import { useEffect, useState } from 'react'
import { Headset } from 'lucide-react'

interface VRButtonProps {
  onEnterVR: () => void
  className?: string
}

export function VRButton({ onEnterVR, className = '' }: VRButtonProps) {
  const [isVRSupported, setIsVRSupported] = useState(false)

  useEffect(() => {
    // Check if WebXR is supported
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          setIsVRSupported(supported)
        })
        .catch((err: Error) => {
          console.error('Error checking VR support:', err)
          setIsVRSupported(false)
        })
    }
  }, [])

  if (!isVRSupported) return null

  return (
    <button
      onClick={onEnterVR}
      className={`bg-[#0b4d43] hover:bg-[#0b4d43]/90 text-white rounded-full p-2 flex items-center justify-center transition-colors ${className}`}
      title="View in VR headset"
    >
      <Headset className="h-5 w-5" />
    </button>
  )
}