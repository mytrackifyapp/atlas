"use client"

import { createAuthClient } from "better-auth/react"

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "")
}

/**
 * Better Auth API lives on the same Next.js host. Using `NEXT_PUBLIC_BETTER_AUTH_URL`
 * when it points at a different host than the page (e.g. apex vs www) causes
 * cross-origin requests and CORS/preflight failures in the browser.
 */
function getBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return (
    normalizeOrigin(
      process.env.BETTER_AUTH_URL ||
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
        "http://localhost:3000"
    )
  )
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

export const { signIn, signUp, signOut, useSession } = authClient

