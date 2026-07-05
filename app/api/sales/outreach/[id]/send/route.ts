import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getOutreach } from "@/lib/sales/outreach-service"
import { executeSendOutreach } from "@/lib/sales/send-outreach"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, context: RouteContext) {
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

    if (outreach.status === "pending_approval") {
      return NextResponse.json(
        { error: "Outreach is awaiting approval in AI Agents → Approvals" },
        { status: 409 }
      )
    }

    const result = await executeSendOutreach({
      ownerId: session.user.id,
      outreachId: id,
      agentId: "user",
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending outreach:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send" },
      { status: 500 }
    )
  }
}
