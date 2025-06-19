import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username, password, firstName, lastName, email, telephone } = await request.json()

    // Validate required fields
    if (!username || !password || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const connection = await connectDB()

    // Check if username or email already exists
    const [existingUsers] = await connection.execute("SELECT id FROM users WHERE username = ? OR email = ?", [
      username,
      email,
    ])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      await connection.end()
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert new user
    const [result] = await connection.execute(
      "INSERT INTO users (username, password, first_name, last_name, email, telephone) VALUES (?, ?, ?, ?, ?, ?)",
      [username, hashedPassword, firstName, lastName, email, telephone || null],
    )

    await connection.end()

    return NextResponse.json(
      { message: "User created successfully", userId: (result as any).insertId },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
