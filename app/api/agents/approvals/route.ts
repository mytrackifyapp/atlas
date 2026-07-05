import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { countPendingApprovals, listApprovals } from "@/lib/agents/services/approvals"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get("status") as
    | "pending"
    | "approved"
    | "rejected"
    | null

  const [approvals, pendingCount] = await Promise.all([
    listApprovals(session.user.id, {
      status: status ?? undefined,
      limit: 50,
    }),
    countPendingApprovals(session.user.id),
  ])

  return NextResponse.json({ approvals, pendingCount })
}
