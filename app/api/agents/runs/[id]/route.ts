import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getAgentRun } from "@/lib/agents/services/runs"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const run = await getAgentRun(id, session.user.id)
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 })
  }

  return NextResponse.json({ run })
}
