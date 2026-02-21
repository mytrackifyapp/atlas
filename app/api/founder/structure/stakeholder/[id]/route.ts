import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, equity, email, notes } = body

    if (!name || !type || equity === undefined) {
      return NextResponse.json(
        { error: "Name, type, and equity are required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const userId = session.user.id

    const updateData = {
      name,
      type,
      equity: parseFloat(equity),
      email: email || null,
      notes: notes || null,
      updatedAt: new Date(),
    }

    const result = await db.collection("stakeholders").updateOne(
      { _id: new ObjectId(params.id), userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Stakeholder not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      stakeholder: {
        id: params.id,
        ...updateData,
      },
    })
  } catch (error) {
    console.error("Error updating stakeholder:", error)
    return NextResponse.json({ error: "Failed to update stakeholder" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = session.user.id

    const result = await db.collection("stakeholders").deleteOne({
      _id: new ObjectId(params.id),
      userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Stakeholder not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting stakeholder:", error)
    return NextResponse.json({ error: "Failed to delete stakeholder" }, { status: 500 })
  }
}
