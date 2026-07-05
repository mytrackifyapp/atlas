import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { buildLinkedInAuthUrl, isLinkedInConfigured } from "@/lib/social/linkedin/oauth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (!isLinkedInConfigured()) {
    return NextResponse.redirect(
      new URL("/founder/social?error=linkedin_not_configured", request.url)
    )
  }

  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set("social_linkedin_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  const origin = request.nextUrl.origin
  const authUrl = buildLinkedInAuthUrl(state, origin)
  return NextResponse.redirect(authUrl)
}
