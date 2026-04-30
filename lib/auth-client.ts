"use client"

import { createAuthClient } from "better-auth/react"

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "")
}

/**
 * Auth routes must use the same host as the page. In the browser we always use
 * `window.location.origin` so www vs apex never cross.
 * (Server-side imports of this module use env — rare for this file.)
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : normalizeOrigin(
          process.env.BETTER_AUTH_URL ||
            process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
            "http://localhost:3000"
        ),
})

export const { signIn, signUp, signOut, useSession } = authClient

