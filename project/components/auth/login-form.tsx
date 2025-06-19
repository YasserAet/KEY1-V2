"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface LoginFormProps {
  onSuccess: (user: any) => void
  onSwitchToSignup: () => void
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.user)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 font-montserrat">Welcome Back</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="Username or Email"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] text-[#0B4D43] font-semibold py-3 rounded-xl hover:from-[#14B8A6] hover:to-[#0D9488] transition-all duration-300"
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-white/70 hover:text-white text-sm"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </form>
    </div>
  )
}
