import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { processApprovalResolved } from "@/lib/agents/services/approval-actions"
import { resolveApproval } from "@/lib/agents/services/approvals"
import { inngest } from "@/inngest/client"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as {
    action?: "approve" | "reject"
    reason?: string
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json(
      { error: "action must be approve or reject" },
      { status: 400 }
    )
  }

  const { id } = await context.params
  const approval = await resolveApproval(
    id,
    session.user.id,
    body.action === "approve" ? "approved" : "rejected",
    body.reason
  )

  if (!approval) {
    return NextResponse.json(
      { error: "Approval not found or already resolved" },
      { status: 404 }
    )
  }

  const payload = {
    ownerId: approval.ownerId,
    agentId: approval.agentId,
    approvalId: approval.id,
    status: approval.status as "approved" | "rejected",
    toolId: approval.toolId,
    correlationId: approval.correlationId,
  }

  // Local dev: run immediately when Inngest is not configured
  if (!process.env.INNGEST_EVENT_KEY) {
    const execution = await processApprovalResolved(payload)
    return NextResponse.json({ approval, execution })
  }

  try {
    await inngest.send({
      name: "agent/approval.resolved",
      data: payload,
    })
    return NextResponse.json({ approval })
  } catch (error) {
    console.warn(
      "Inngest unavailable, processing approval inline:",
      error instanceof Error ? error.message : error
    )
    const execution = await processApprovalResolved(payload)
    return NextResponse.json({ approval, execution, processedInline: true })
  }
}
