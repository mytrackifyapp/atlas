import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { palmErrorResponse } from "@/lib/palm/client"
import { checkNameEligibility, parseEntityType } from "@/lib/palm/name-eligibility"

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const name = request.nextUrl.searchParams.get("name")
  const entityType = parseEntityType(request.nextUrl.searchParams.get("entity_type"))
  const jurisdiction = request.nextUrl.searchParams.get("jurisdiction")
  if (!name || !jurisdiction) {
    return NextResponse.json({ error: "name and jurisdiction are required" }, { status: 400 })
  }

  try {
    const data = await checkNameEligibility({
      name,
      jurisdiction,
      entityType,
    })
    return NextResponse.json(data)
  } catch (error) {
    const { status, body } = palmErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
