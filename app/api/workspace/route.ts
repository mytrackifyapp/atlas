import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const collection = db.collection("workspaces")

    const workspaces = await collection
      .find({ ownerId: session.user.id })
      .sort({ updatedAt: -1 })
      .toArray()

    // If no workspaces yet, return empty; client uses default seed
    return NextResponse.json({
      workspaces: workspaces.map((w) => ({
        id: w._id.toString(),
        name: w.name,
        type: w.type,
        icon: w.icon,
        pages: w.pages || [],
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
    })
  } catch (error) {
    console.error("Workspace GET error:", error)
    return NextResponse.json({ error: "Failed to load workspaces" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type = "memo", icon = "📋" } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection("workspaces")

    const doc = {
      ownerId: session.user.id,
      name: name.trim(),
      type: type as string,
      icon: icon as string,
      pages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(doc)
    const id = result.insertedId.toString()

    return NextResponse.json({
      id,
      name: doc.name,
      type: doc.type,
      icon: doc.icon,
      pages: doc.pages,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  } catch (error) {
    console.error("Workspace POST error:", error)
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 })
  }
}
