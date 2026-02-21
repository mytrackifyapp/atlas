import { NextRequest, NextResponse } from "next/server"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = session.user.id

    // Get all team members
    const teamMembers = await db
      .collection("team_members")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    // Get all stakeholders
    const stakeholders = await db
      .collection("stakeholders")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    const transformedTeamMembers = teamMembers.map((member) => ({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      startDate: member.startDate,
      equity: member.equity,
      isCoFounder: member.isCoFounder || false,
      notes: member.notes,
    }))

    const transformedStakeholders = stakeholders.map((stakeholder) => ({
      id: stakeholder._id.toString(),
      name: stakeholder.name,
      type: stakeholder.type,
      equity: stakeholder.equity,
      email: stakeholder.email,
      notes: stakeholder.notes,
    }))

    return NextResponse.json({
      success: true,
      teamMembers: transformedTeamMembers,
      stakeholders: transformedStakeholders,
    })
  } catch (error) {
    console.error("Error fetching company structure:", error)
    return NextResponse.json({ error: "Failed to fetch company structure" }, { status: 500 })
  }
}
