import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getDatabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (!role || (role !== "investor" && role !== "founder")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Get database connection
    const db = await getDatabase()
    const dbName = db.databaseName
    console.log("Update role - Database:", dbName, "User ID:", session.user.id, "Email:", session.user.email)

    // Better Auth with MongoDB uses _id as primary key
    // Try _id first (this is what Better Auth uses)
    let userBefore = null
    try {
      const { ObjectId } = await import("mongodb")
      if (ObjectId.isValid(session.user.id)) {
        userBefore = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) })
        if (userBefore) {
          console.log("Found user by _id")
        }
      }
    } catch (e) {
      console.error("Error trying ObjectId query:", e)
    }
    
    // If not found by _id, try by email
    if (!userBefore && session.user.email) {
      console.log("User not found by _id, trying email")
      userBefore = await db.collection("user").findOne({ email: session.user.email })
      if (userBefore) {
        console.log("Found user by email")
      }
    }
    
    // Last resort: try id field
    if (!userBefore) {
      userBefore = await db.collection("user").findOne({ id: session.user.id })
    }
    
    if (!userBefore) {
      // List sample users for debugging
      const sampleUsers = await db.collection("user").find({}).limit(3).toArray()
      console.error("User not found. Database:", dbName)
      console.error("Session user ID:", session.user.id)
      console.error("Session user email:", session.user.email)
      console.error("Sample users in database:", sampleUsers.map(u => ({ 
        id: u.id, 
        _id: u._id?.toString(), 
        email: u.email 
      })))
      
      return NextResponse.json(
        { error: "User not found in database", database: dbName },
        { status: 404 }
      )
    }
    
    console.log("Found user:", { id: userBefore.id, _id: userBefore._id?.toString(), email: userBefore.email })

    // Use _id for the update (MongoDB primary key)
    const { ObjectId } = await import("mongodb")
    const queryFilter = { _id: userBefore._id }
    
    console.log("Updating user with filter:", queryFilter)
    
    // Update user role and mark onboarding as completed
    const result = await db.collection("user").updateOne(
      queryFilter,
      {
        $set: {
          role,
          onboardingCompleted: true,
          updatedAt: new Date(),
        },
      }
    )

    // Verify the update was successful
    if (result.matchedCount === 0) {
      console.error("User not found in database:", session.user.id)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify the update was actually saved by reading it back
    const updatedUser = await db.collection("user").findOne({ id: session.user.id })
    
    if (!updatedUser || updatedUser.role !== role || !updatedUser.onboardingCompleted) {
      console.error("Update verification failed:", {
        userId: session.user.id,
        expectedRole: role,
        actualRole: updatedUser?.role,
        expectedOnboarding: true,
        actualOnboarding: updatedUser?.onboardingCompleted
      })
      return NextResponse.json(
        { error: "Update verification failed" },
        { status: 500 }
      )
    }

    console.log("User update result:", {
      userId: session.user.id,
      role,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      verified: true
    })

    return NextResponse.json({ 
      success: true, 
      role,
      onboardingCompleted: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    )
  }
}

