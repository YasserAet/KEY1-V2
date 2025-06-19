import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")
  const isAuthPage = request.nextUrl.pathname === "/auth"

  // If no token and not on auth page, redirect to auth
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // If has token and on auth page, redirect to home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}