import { NextRequest, NextResponse } from "next/server"

import { createCorrelationId } from "@/lib/agents/correlation"
import { delegateToAgent } from "@/lib/agents/orchestration/delegation"
import { isDelegatableAgent } from "@/lib/agents/orchestration/routing"
import {
  checkAuthenticatedAgentRateLimit,
  rateLimitHeaders,
} from "@/lib/agents/rate-limit"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { inngest } from "@/inngest/client"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    targetAgentId?: string
    task?: string
    workspaceId?: string
    async?: boolean
  }

  const targetAgentId = body.targetAgentId?.trim()
  const task = body.task?.trim()

  if (!targetAgentId || !task) {
    return NextResponse.json(
      { error: "targetAgentId and task are required" },
      { status: 400 }
    )
  }

  if (!isDelegatableAgent(targetAgentId)) {
    return NextResponse.json({ error: "Unknown specialist agent" }, { status: 400 })
  }

  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rateLimit = await checkAuthenticatedAgentRateLimit(session.user.id)
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    )
  }

  const correlationId = createCorrelationId()
  const fromAgentId = "finna"

  if (body.async && process.env.INNGEST_EVENT_KEY) {
    await inngest.send({
      name: "agent/delegation.requested",
      data: {
        ownerId: session.user.id,
        fromAgentId,
        targetAgentId,
        task,
        workspaceId: body.workspaceId,
        correlationId,
      },
    })

    return NextResponse.json(
      {
        status: "queued",
        correlationId,
        targetAgentId,
      },
      { headers: rateLimitHeaders(rateLimit) }
    )
  }

  try {
    const result = await delegateToAgent({
      ownerId: session.user.id,
      fromAgentId,
      targetAgentId,
      task,
      workspaceId: body.workspaceId,
      correlationId,
    })

    return NextResponse.json(
      {
        status: "completed",
        correlationId,
        result,
      },
      { headers: rateLimitHeaders(rateLimit) }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delegation failed"
    return NextResponse.json(
      { error: message, correlationId },
      { status: 422, headers: rateLimitHeaders(rateLimit) }
    )
  }
}
