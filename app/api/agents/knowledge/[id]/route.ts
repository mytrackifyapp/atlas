import { NextRequest, NextResponse } from "next/server"

import { deleteKnowledgeSource } from "@/lib/agents/memory/sources"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const deleted = await deleteKnowledgeSource(id, session.user.id)

  if (!deleted) {
    return NextResponse.json({ error: "Source not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
