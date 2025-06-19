"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface LoginFormProps {
  onSuccess: (user: any) => void
  onSwitchToSignup: () => void
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.user)
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-[#2DD4BF]/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#0B4D43] font-montserrat">Welcome Back</CardTitle>
        <CardDescription className="text-gray-600 font-montserrat">
          Sign in to access your virtual tours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#0B4D43] font-montserrat font-medium">
              Username or Email
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20"
              placeholder="Enter your username or email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0B4D43] font-montserrat font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="border-[#2DD4BF]/30 focus:border-[#2DD4BF] focus:ring-[#2DD4BF]/20 pr-10"
                placeholder="Enter your password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center font-montserrat">{error}</div>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#14B8A6] hover:to-[#0D9488] text-[#0B4D43] font-montserrat font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToSignup}
              className="text-[#0B4D43] hover:text-[#2DD4BF] font-montserrat"
            >
              Don't have an account? Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
