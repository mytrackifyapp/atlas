import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { listAgentEvents } from "@/lib/agents/services/events"
import type { AgentEventType } from "@/lib/agents/types"

export const dynamic = "force-dynamic"

const VALID_TYPES: AgentEventType[] = [
  "delegation.requested",
  "delegation.completed",
  "delegation.failed",
  "handoff.suggested",
]

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const typeParam = request.nextUrl.searchParams.get("type")
  const correlationId = request.nextUrl.searchParams.get("correlationId") ?? undefined
  const limitParam = request.nextUrl.searchParams.get("limit")
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 50

  const type =
    typeParam && VALID_TYPES.includes(typeParam as AgentEventType)
      ? (typeParam as AgentEventType)
      : undefined

  const events = await listAgentEvents(session.user.id, {
    type,
    correlationId,
    limit,
  })

  return NextResponse.json({ events })
}
