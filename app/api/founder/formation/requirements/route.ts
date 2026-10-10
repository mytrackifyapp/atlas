import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { palmErrorResponse, palmFetch } from "@/lib/palm/client"

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entityType = request.nextUrl.searchParams.get("entity_type") || "llc"
  const jurisdiction = request.nextUrl.searchParams.get("jurisdiction")
  if (!jurisdiction) {
    return NextResponse.json({ error: "jurisdiction is required" }, { status: 400 })
  }

  try {
    const data = await palmFetch(
      `/v1/filing/formation/requirement?entity_type=${encodeURIComponent(entityType)}&jurisdiction=${encodeURIComponent(jurisdiction)}`,
    )
    return NextResponse.json(data)
  } catch (error) {
    const { status, body } = palmErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
