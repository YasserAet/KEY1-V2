"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserControls } from "@/components/user-controls"

interface ApartmentUser {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  telephone?: string
}

interface LayoutWithUserControlsProps {
  children: React.ReactNode
  showVRButton?: boolean
  onEnterVR?: () => void
  vrSupported?: boolean
  aframeLoaded?: boolean
}

export function LayoutWithUserControls({ 
  children, 
  showVRButton = false,
  onEnterVR,
  vrSupported,
  aframeLoaded 
}: LayoutWithUserControlsProps) {
  // AUTHENTICATION DISABLED - Set default user state
  const [user, setUser] = useState<ApartmentUser | null>({
    id: 1,
    username: "demo_user",
    firstName: "Demo",
    lastName: "User",
    email: "demo@example.com",
    telephone: "+1234567890"
  })
  const [isLoading, setIsLoading] = useState(false) // Set to false since no auth check needed
  const router = useRouter()

  // AUTHENTICATION DISABLED - Commented out auth check
  /*
  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push("/auth")
          return
        }
      } catch (error) {
        router.push("/auth")
        return
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])
  */

  // AUTHENTICATION DISABLED - Skip loading screen
  /*
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0B4D43] to-[#134E44]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#2DD4BF]/30 border-t-[#2DD4BF] rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#2DD4BF]/50 rounded-full animate-ping mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-montserrat">Loading...</h2>
          <p className="text-[#2DD4BF]/80 font-montserrat">Authenticating user...</p>
        </div>
      </div>
    )
  }
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B4D43] via-[#0F5D52] to-[#134E44] relative overflow-hidden">
      {/* Load Montserrat font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Page Content */}
      {children}

      {/* User Controls - Always at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#0B4D43]/90 via-[#0B4D43]/60 to-transparent p-8">
        <div className="flex justify-between items-start">
          {/* Left side content */}
          <div className="flex-1">
            {/* Your page content will be rendered here */}
          </div>

          {/* User Controls */}
          <UserControls 
            user={user}
            onEnterVR={showVRButton ? onEnterVR : undefined}
            vrSupported={vrSupported}
            aframeLoaded={aframeLoaded}
          />
        </div>
      </div>
    </div>
  )
} 