import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getDatabase } from "@/lib/db"

export async function getSessionWithRole() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return null
    }

    // Get user with role from database
    const db = await getDatabase()
    
    // Log database info for debugging
    const dbName = db.databaseName
    console.log("Querying database:", dbName, "for user ID:", session.user.id, "Email:", session.user.email)
    
    // Better Auth with MongoDB uses _id as primary key, not id
    // The session.user.id is the string representation of _id
    let user = null
    let queryMethod = "unknown"
    
    // Try _id first (MongoDB's primary key) - this is what Better Auth uses
    try {
      const { ObjectId } = await import("mongodb")
      if (ObjectId.isValid(session.user.id)) {
        user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) })
        if (user) {
          queryMethod = "_id"
          console.log("Found user by _id!")
        }
      }
    } catch (e) {
      console.log("ObjectId query failed:", e)
    }
    
    // If not found by _id, try by email as fallback
    if (!user && session.user.email) {
      console.log("User not found by _id, trying email:", session.user.email)
      user = await db.collection("user").findOne({ email: session.user.email })
      if (user) {
        queryMethod = "email"
        console.log("Found user by email!")
      } else {
        console.log("User not found by email either")
      }
    }
    
    // Last resort: try id field (though Better Auth doesn't use this)
    if (!user) {
      user = await db.collection("user").findOne({ id: session.user.id })
      if (user) {
        queryMethod = "id"
        console.log("Found user by id field")
      }
    }
    
    // List all users for debugging (remove in production)
    if (!user) {
      const allUsers = await db.collection("user").find({}).limit(5).toArray()
      console.log("Sample users in database:", allUsers.map(u => ({ 
        id: u.id, 
        _id: u._id?.toString(), 
        email: u.email,
        role: u.role,
        onboardingCompleted: u.onboardingCompleted
      })))
    }

    if (!user) {
      console.warn("User not found in database for session:", {
        userId: session.user.id,
        email: session.user.email,
        database: dbName
      })
      // Return session without role if user not found in database yet
      // This can happen during signup before user is fully created
      return {
        ...session,
        user: {
          ...session.user,
          role: null,
          onboardingCompleted: false,
        },
      }
    }
    
    console.log("User found via", queryMethod, ":", {
      id: user.id,
      _id: user._id?.toString(),
      email: user.email,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted
    })

    const result = {
      ...session,
      user: {
        ...session.user,
        role: user.role || null,
        onboardingCompleted: user.onboardingCompleted || false,
      },
    }
    
    console.log("Returning session with role:", {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      onboardingCompleted: result.user.onboardingCompleted
    })
    
    return result
  } catch (error) {
    console.error("Error in getSessionWithRole:", error)
    // Return null on error to trigger redirect to sign-in
    return null
  }
}

export async function requireAuth() {
  const session = await getSessionWithRole()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireOnboarding() {
  const session = await requireAuth()
  if (!session.user.onboardingCompleted) {
    throw new Error("Onboarding not completed")
  }
  return session
}

