import { NextRequest, NextResponse } from "next/server"

import { executeLogReplyFromApi } from "@/lib/agents/services/approval-actions"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getOutreach } from "@/lib/sales/outreach-service"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const outreach = await getOutreach(id, session.user.id)
    if (!outreach) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (outreach.status !== "sent") {
      return NextResponse.json(
        { error: "Only sent outreach can be marked as replied" },
        { status: 400 }
      )
    }

    const body = (await request.json().catch(() => ({}))) as { notes?: string }

    await executeLogReplyFromApi({
      ownerId: session.user.id,
      outreachId: id,
      notes: body.notes,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging reply:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to log reply" },
      { status: 500 }
    )
  }
}
