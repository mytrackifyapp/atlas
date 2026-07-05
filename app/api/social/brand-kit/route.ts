import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getBrandKit, updateBrandKit } from "@/lib/social/brand-kit"
import { isPexelsConfigured } from "@/lib/social/pexels"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const brand = await getBrandKit(session.user.id)

    return NextResponse.json({
      success: true,
      brand: {
        ...brand,
        updatedAt: brand.updatedAt.toISOString(),
      },
      pexelsConfigured: isPexelsConfigured(),
    })
  } catch (error) {
    console.error("Error fetching brand kit:", error)
    return NextResponse.json({ error: "Failed to fetch brand kit" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const brand = await updateBrandKit(session.user.id, body)

    return NextResponse.json({
      success: true,
      brand: {
        ...brand,
        updatedAt: brand.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating brand kit:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update brand kit" },
      { status: 500 }
    )
  }
}
