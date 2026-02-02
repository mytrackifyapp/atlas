"use client"

import { createAuthClient } from "better-auth/react"

// Get base URL from environment or use current origin
function getBaseURL(): string {
  // In browser, use NEXT_PUBLIC_BETTER_AUTH_URL or current origin
  if (typeof window !== "undefined") {
    // If env var is set and not localhost, use it
    const envUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    if (envUrl && !envUrl.includes("localhost")) {
      return envUrl
    }
    // Otherwise, use current origin (works for production)
    return window.location.origin
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

export const { signIn, signUp, signOut, useSession } = authClient

