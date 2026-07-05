import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { listAuditLogs } from "@/lib/agents/services/audit"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agentId = request.nextUrl.searchParams.get("agentId") ?? undefined
  const limitParam = request.nextUrl.searchParams.get("limit")
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 50

  const logs = await listAuditLogs(session.user.id, { agentId, limit })
  return NextResponse.json({ logs })
}
