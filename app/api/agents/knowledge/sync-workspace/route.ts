import { NextResponse } from "next/server"

import { syncWorkspaceKnowledge } from "@/lib/agents/memory/ingest"
import { knowledgeStatusMessage } from "@/lib/agents/tools/knowledge"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await syncWorkspaceKnowledge(session.user.id)
    return NextResponse.json({
      ...result,
      status: knowledgeStatusMessage(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
