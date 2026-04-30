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
      .collection("installed_apps")
      .find({ ownerId: session.user.id })
      .sort({ installedAt: -1 })
      .toArray()

    return NextResponse.json({
      installed: installed.map((d: any) => ({
        id: d._id.toString(),
        appId: d.appId,
        installedAt: d.installedAt,
        enabled: d.enabled ?? true,
      })),
    })
  } catch (e) {
    console.error("Installed apps GET error:", e)
    return NextResponse.json({ error: "Failed to load installed apps" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const appId = body?.appId
    if (!appId || typeof appId !== "string") {
      return NextResponse.json({ error: "appId is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const col = db.collection("installed_apps")

    const existing = await col.findOne({ ownerId: session.user.id, appId })
    if (existing) {
      return NextResponse.json({
        id: existing._id.toString(),
        appId: existing.appId,
        installedAt: existing.installedAt,
        enabled: existing.enabled ?? true,
      })
    }

    const doc = {
      ownerId: session.user.id,
      appId,
      enabled: true,
      installedAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await col.insertOne(doc)

    return NextResponse.json({
      id: result.insertedId.toString(),
      appId: doc.appId,
      installedAt: doc.installedAt,
      enabled: doc.enabled,
    })
  } catch (e) {
    console.error("Installed apps POST error:", e)
    return NextResponse.json({ error: "Failed to install app" }, { status: 500 })
  }
}

