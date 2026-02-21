import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export async function POST(request: NextRequest) {
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

    const teamMemberData = {
      userId,
      name,
      email: email || null,
      phone: phone || null,
      role,
      department: department || null,
      startDate: startDate ? new Date(startDate) : null,
      equity: equity ? parseFloat(equity) : null,
      isCoFounder: isCoFounder || false,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("team_members").insertOne(teamMemberData)

    return NextResponse.json(
      {
        success: true,
        teamMember: {
          id: result.insertedId.toString(),
          ...teamMemberData,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating team member:", error)
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 })
  }
}
