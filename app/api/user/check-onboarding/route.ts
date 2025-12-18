import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getDatabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ onboardingCompleted: false }, { status: 200 })
    }

    // Get user with role from database
    const db = await getDatabase()
    
    // Better Auth with MongoDB uses _id as primary key
    // Try _id first (this is what Better Auth uses)
    let user = null
    try {
      const { ObjectId } = await import("mongodb")
      if (ObjectId.isValid(session.user.id)) {
        user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) })
      }
    } catch (e) {
      // Ignore errors
    }
    
    // If not found by _id, try by email
    if (!user && session.user.email) {
      user = await db.collection("user").findOne({ email: session.user.email })
    }
    
    // Last resort: try id field
    if (!user) {
      user = await db.collection("user").findOne({ id: session.user.id })
    }

    return NextResponse.json({
      onboardingCompleted: user?.onboardingCompleted || false,
      role: user?.role || null,
    })
  } catch (error) {
    console.error("Error checking onboarding status:", error)
    return NextResponse.json(
      { onboardingCompleted: false, error: "Failed to check status" },
      { status: 500 }
    )
  }
}

