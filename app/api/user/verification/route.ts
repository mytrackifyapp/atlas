import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import {
  getFounderVerification,
  submitFounderVerification,
} from "@/lib/founder/verification"

export const dynamic = "force-dynamic"

const ALLOWED_ROLES = new Set(["founder", "admin"])

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!session.user.role || !ALLOWED_ROLES.has(session.user.role)) {
      return NextResponse.json({ error: "Founder verification is not available for this account" }, { status: 403 })
    }

    const verification = await getFounderVerification(session.user.id)
    return NextResponse.json({ success: true, verification })
  } catch (error) {
    console.error("Founder verification GET error:", error)
    return NextResponse.json({ error: "Failed to load verification" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!session.user.role || !ALLOWED_ROLES.has(session.user.role)) {
      return NextResponse.json({ error: "Founder verification is not available for this account" }, { status: 403 })
    }

    const body = await request.json()
    const verification = await submitFounderVerification(session.user.id, {
      fullName: typeof body.fullName === "string" ? body.fullName : undefined,
      location: typeof body.location === "string" ? body.location : undefined,
      phoneNumber: typeof body.phoneNumber === "string" ? body.phoneNumber : undefined,
      socialLinks: Array.isArray(body.socialLinks) ? body.socialLinks : undefined,
    })

    return NextResponse.json({ success: true, verification })
  } catch (error) {
    console.error("Founder verification POST error:", error)
    const message = error instanceof Error ? error.message : "Failed to submit verification"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
