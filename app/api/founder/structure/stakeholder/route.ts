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
    const { name, type, equity, email, notes } = body

    if (!name || !type || equity === undefined) {
      return NextResponse.json(
        { error: "Name, type, and equity are required" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const userId = session.user.id

    const stakeholderData = {
      userId,
      name,
      type,
      equity: parseFloat(equity),
      email: email || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("stakeholders").insertOne(stakeholderData)

    return NextResponse.json(
      {
        success: true,
        stakeholder: {
          id: result.insertedId.toString(),
          ...stakeholderData,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating stakeholder:", error)
    return NextResponse.json({ error: "Failed to create stakeholder" }, { status: 500 })
  }
}
