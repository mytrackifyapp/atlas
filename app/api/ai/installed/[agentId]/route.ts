import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { agentId } = await params
    if (!agentId) return NextResponse.json({ error: "agentId is required" }, { status: 400 })

    const db = await getDatabase()
    await db.collection("installed_agents").deleteOne({ ownerId: session.user.id, agentId })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Installed agents DELETE error:", e)
    return NextResponse.json({ error: "Failed to uninstall agent" }, { status: 500 })
  }
}

