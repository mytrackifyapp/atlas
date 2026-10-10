import { NextRequest, NextResponse } from "next/server"

import { palmErrorResponse } from "@/lib/palm/client"
import { isUsStateCode, toPalmJurisdiction } from "@/lib/palm/jurisdictions"
import { checkNameEligibility, parseEntityType } from "@/lib/palm/name-eligibility"

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim() ?? ""
  const state = request.nextUrl.searchParams.get("state")?.toUpperCase() ?? ""
  const entityType = parseEntityType(request.nextUrl.searchParams.get("entity_type"))

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Enter a company name to search." }, { status: 400 })
  }
  if (!isUsStateCode(state)) {
    return NextResponse.json({ error: "Choose a U.S. state." }, { status: 400 })
  }

  try {
    const data = await checkNameEligibility({
      name,
      jurisdiction: toPalmJurisdiction(state),
      entityType,
    })
    return NextResponse.json(data)
  } catch (error) {
    const { status, body } = palmErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
