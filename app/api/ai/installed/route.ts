import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDatabase()
    const installed = await db
      .collection("installed_agents")
      .find({ ownerId: session.user.id })
      .sort({ installedAt: -1 })
      .toArray()

    return NextResponse.json({
      installed: installed.map((d: any) => ({
        id: d._id.toString(),
        agentId: d.agentId,
        installedAt: d.installedAt,
        enabled: d.enabled ?? true,
      })),
    })
  } catch (e) {
    console.error("Installed agents GET error:", e)
    return NextResponse.json({ error: "Failed to load installed agents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const agentId = body?.agentId
    if (!agentId || typeof agentId !== "string") {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const col = db.collection("installed_agents")

    const existing = await col.findOne({ ownerId: session.user.id, agentId })
    if (existing) {
      return NextResponse.json({
        id: existing._id.toString(),
        agentId: existing.agentId,
        installedAt: existing.installedAt,
        enabled: existing.enabled ?? true,
      })
    }

    const doc = {
      ownerId: session.user.id,
      agentId,
      enabled: true,
      installedAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await col.insertOne(doc)

    return NextResponse.json({
      id: result.insertedId.toString(),
      agentId: doc.agentId,
      installedAt: doc.installedAt,
      enabled: doc.enabled,
    })
  } catch (e) {
    console.error("Installed agents POST error:", e)
    return NextResponse.json({ error: "Failed to install agent" }, { status: 500 })
  }
}

