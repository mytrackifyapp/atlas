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
    const { name, email, phone, role, department, startDate, equity, isCoFounder, notes } = body

    if (!name || !role) {
      return NextResponse.json(
        { error: "Name and role are required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const userId = session.user.id

    const updateData = {
      name,
      email: email || null,
      phone: phone || null,
      role,
      department: department || null,
      startDate: startDate ? new Date(startDate) : null,
      equity: equity ? parseFloat(equity) : null,
      isCoFounder: isCoFounder || false,
      notes: notes || null,
      updatedAt: new Date(),
    }

    const result = await db.collection("team_members").updateOne(
      { _id: new ObjectId(params.id), userId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      teamMember: {
        id: params.id,
        ...updateData,
      },
    })
  } catch (error) {
    console.error("Error updating team member:", error)
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
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

    const result = await db.collection("team_members").deleteOne({
      _id: new ObjectId(params.id),
      userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 })
  }
}
