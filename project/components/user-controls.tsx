"use client"

import { Button } from "@/components/ui/button"
import { User, LogOut, Headphones } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserControlsProps {
  user: {
    firstName: string
    lastName: string
    username: string
  } | null
  onEnterVR?: () => void
  vrSupported?: boolean
  aframeLoaded?: boolean
}

export function UserControls({ user, onEnterVR, vrSupported, aframeLoaded }: UserControlsProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="flex items-center gap-4 pointer-events-auto">
      {/* User Info */}
      <div className="bg-[#0B4D43]/20 backdrop-blur-xl border border-[#2DD4BF]/30 rounded-2xl p-3 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 bg-[#2DD4BF] rounded-full flex items-center justify-center pointer-events-auto">
            <User className="w-4 h-4 text-[#0B4D43]" />
          </div>
          <div className="pointer-events-auto">
            <p className="text-white text-sm font-montserrat font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[#2DD4BF]/80 text-xs font-montserrat">@{user?.username}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#2DD4BF]/20 rounded-xl transition-all duration-200 hover:scale-105 pointer-events-auto"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* VR Button - Only show if onEnterVR is provided */}
      {onEnterVR && (
        <Button
          onClick={onEnterVR}
          disabled={!aframeLoaded || !vrSupported}
          className="bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-[#0B4D43] border-0 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 font-montserrat font-semibold pointer-events-auto"
        >
          <Headphones className="w-5 h-5 mr-2" />
          {vrSupported ? "Enter VR" : "VR Unavailable"}
        </Button>
      )}
    </div>
  )
} 