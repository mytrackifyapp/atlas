import { NextRequest, NextResponse } from "next/server"

import { getPublicFundraiseProfile } from "@/lib/fundraising/service"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const profile = await getPublicFundraiseProfile(id)

    if (!profile) {
      return NextResponse.json({ error: "Fundraise not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("Public fundraise GET error:", error)
    return NextResponse.json({ error: "Failed to load fundraise" }, { status: 500 })
  }
}
