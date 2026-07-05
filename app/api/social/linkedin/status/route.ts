import { NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getSocialConnection, deleteSocialConnection } from "@/lib/social/connections-service"
import { isLinkedInConfigured } from "@/lib/social/linkedin/oauth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const linkedin = await getSocialConnection(session.user.id, "linkedin")

  return NextResponse.json({
    success: true,
    linkedInConfigured: isLinkedInConfigured(),
    linkedin: linkedin
      ? {
          connected: true,
          displayName: linkedin.displayName,
          expiresAt: linkedin.expiresAt.toISOString(),
        }
      : { connected: false },
  })
}

export async function DELETE() {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await deleteSocialConnection(session.user.id, "linkedin")
  return NextResponse.json({ success: true })
}
