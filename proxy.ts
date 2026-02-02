import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/portfolio", "/deal-flow", "/reports", "/analytics", "/founder", "/deal-room", "/accelerator", "/admin"]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/sign-in", "/sign-up"]

// Routes that are accessible during onboarding
const onboardingRoutes = ["/onboarding"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.includes(pathname)
  const isOnboardingRoute = onboardingRoutes.includes(pathname)

  // If accessing protected route without session, redirect to sign in
  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If accessing onboarding route without session, redirect to sign in
  if (isOnboardingRoute && !sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect", "/onboarding")
    return NextResponse.redirect(signInUrl)
  }

  // If accessing auth routes with session, let the page handle the redirect
  // Don't redirect here to avoid loops - let sign-in/sign-up pages handle it

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

