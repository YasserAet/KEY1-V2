import { type NextRequest, NextResponse } from "next/server"

// AUTHENTICATION DISABLED - Return mock user for development
export async function GET(request: NextRequest) {
  return NextResponse.json({
    user: {
      id: 1,
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      telephone: "+1234567890",
    },
  })
} 