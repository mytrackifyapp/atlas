import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { appId } = await params
    if (!appId) return NextResponse.json({ error: "appId is required" }, { status: 400 })

    const db = await getDatabase()
    await db.collection("installed_apps").deleteOne({ ownerId: session.user.id, appId })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Installed apps DELETE error:", e)
    return NextResponse.json({ error: "Failed to uninstall app" }, { status: 500 })
  }
}

