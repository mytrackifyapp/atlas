import { NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"
import { palmErrorResponse, palmFetch } from "@/lib/palm/client"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const db = await getDatabase()
  const owned = await db.collection("palm_filings").findOne({
    userId: session.user.id,
    filingId: id,
  })
  if (!owned) {
    return NextResponse.json({ error: "Filing not found" }, { status: 404 })
  }

  try {
    const filing = await palmFetch<Record<string, unknown>>(`/v1/filing/${encodeURIComponent(id)}`)
    await db.collection("palm_filings").updateOne(
      { filingId: id, userId: session.user.id },
      {
        $set: {
          status: filing.status,
          businessId: filing.business_id ?? owned.businessId,
          updatedAt: new Date(),
        },
      },
    )
    return NextResponse.json({ filing })
  } catch (error) {
    const { status, body } = palmErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
