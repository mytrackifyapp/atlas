import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { upsertSocialConnection } from "@/lib/social/connections-service"
import { exchangeLinkedInCode } from "@/lib/social/linkedin/oauth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  const params = request.nextUrl.searchParams
  const code = params.get("code")
  const state = params.get("state")
  const error = params.get("error")

  const cookieStore = await cookies()
  const nextCookie = cookieStore.get("social_linkedin_oauth_next")?.value
  const nextPath =
    nextCookie?.startsWith("/") && !nextCookie.startsWith("//") ? nextCookie : "/founder/social"
  cookieStore.delete("social_linkedin_oauth_next")

  if (error) {
    return NextResponse.redirect(
      new URL(`${nextPath}?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  const expectedState = cookieStore.get("social_linkedin_oauth_state")?.value
  cookieStore.delete("social_linkedin_oauth_state")

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(
      new URL(`${nextPath}?error=invalid_oauth_state`, request.url)
    )
  }

  try {
    const origin = request.nextUrl.origin
    const profile = await exchangeLinkedInCode(code, origin)

    await upsertSocialConnection(session.user.id, {
      platform: "linkedin",
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      expiresAt: profile.expiresAt,
      profileId: profile.profileId,
      profileUrn: profile.profileUrn,
      displayName: profile.displayName,
    })

    return NextResponse.redirect(new URL(`${nextPath}?connected=linkedin`, request.url))
  } catch (err) {
    const message = err instanceof Error ? err.message : "oauth_failed"
    return NextResponse.redirect(
      new URL(`${nextPath}?error=${encodeURIComponent(message)}`, request.url)
    )
  }
}
