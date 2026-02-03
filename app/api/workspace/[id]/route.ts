import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 })
    }

    const db = await getDatabase()
    const workspace = await db.collection("workspaces").findOne({
      _id: new ObjectId(id),
      ownerId: session.user.id,
    })

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: workspace._id.toString(),
      name: workspace.name,
      type: workspace.type,
      icon: workspace.icon,
      pages: workspace.pages || [],
      updatedAt: workspace.updatedAt,
    })
  } catch (error) {
    console.error("Workspace [id] GET error:", error)
    return NextResponse.json({ error: "Failed to load workspace" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 })
    }

    const body = await request.json()
    const db = await getDatabase()
    const update: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name != null) update.name = body.name
    if (body.type != null) update.type = body.type
    if (body.icon != null) update.icon = body.icon
    if (body.pages != null) update.pages = body.pages

    const result = await db.collection("workspaces").findOneAndUpdate(
      { _id: new ObjectId(id), ownerId: session.user.id },
      { $set: update },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const w = result as any
    return NextResponse.json({
      id: w._id.toString(),
      name: w.name,
      type: w.type,
      icon: w.icon,
      pages: w.pages || [],
      updatedAt: w.updatedAt,
    })
  } catch (error) {
    console.error("Workspace [id] PATCH error:", error)
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 })
  }
}
