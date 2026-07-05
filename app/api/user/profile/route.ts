import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import {
  getFounderPublicProfile,
  updateFounderProfile,
} from "@/lib/founder/profile"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getFounderPublicProfile(session.user.id)
    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        email: session.user.email,
      },
    })
  } catch (error) {
    console.error("User profile GET error:", error)
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, image, founderTitle, founderBio } = body

    const profile = await updateFounderProfile(session.user.id, {
      name: typeof name === "string" ? name : undefined,
      image: image === null || typeof image === "string" ? image : undefined,
      founderTitle: typeof founderTitle === "string" ? founderTitle : undefined,
      founderBio: typeof founderBio === "string" ? founderBio : undefined,
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("User profile PATCH error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
