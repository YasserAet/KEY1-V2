"use client"

import { useState, useEffect } from "react"
import PremiumBuildingViewer from "../../components/premium-building-viewer/index"
import { UserControls } from "@/components/user-controls"
import { useRouter } from "next/navigation"

interface ApartmentUser {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  telephone?: string
}

export default function Page() {
  // AUTHENTICATION DISABLED

  const [isLoading, setIsLoading] = useState(false); // Set to false since no auth check needed
  const router = useRouter();

  // AUTHENTICATION DISABLED - Commented out auth check
  /*
  useEffect(() => {
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
    <>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <PremiumBuildingViewer />
      </main>

      {/* User Controls - Added at bottom */}
    </>
  )
}