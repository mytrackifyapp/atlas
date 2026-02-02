import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

// Admin email(s) - in production, store this in environment variables or database
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || []

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user.email) {
      return false
    }

    // Check if user email is in admin list
    if (ADMIN_EMAILS.includes(session.user.email)) {
      return true
    }

    // Also check database for admin role
    const db = await getDatabase()
    let user = null

    if (ObjectId.isValid(session.user.id)) {
      user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) })
    }

    if (!user && session.user.email) {
      user = await db.collection("user").findOne({ email: session.user.email })
    }

    // Check if user has admin role
    return user?.role === "admin" || user?.isAdmin === true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error("Unauthorized: Admin access required")
  }
  return true
}

