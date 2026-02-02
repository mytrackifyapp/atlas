import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { getDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const db = await getDatabase()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ]
    }
    if (role) {
      query.role = role
    }

    // Get users with pagination
    const users = await db
      .collection("user")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const total = await db.collection("user").countDocuments(query)

    // Transform users
    const transformedUsers = users.map((user) => {
      let createdAt = user.createdAt
      if (!createdAt && user._id) {
        // MongoDB ObjectId contains timestamp
        if (typeof user._id.getTimestamp === "function") {
          createdAt = user._id.getTimestamp()
        } else if (user._id instanceof ObjectId) {
          createdAt = user._id.getTimestamp()
        }
      }
      
      return {
        id: user._id?.toString() || user.id,
        email: user.email,
        name: user.name || null,
        image: user.image || null,
        role: user.role || null,
        onboardingCompleted: user.onboardingCompleted || false,
        createdAt: createdAt ? createdAt.toISOString() : null,
        updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
        lastSignIn: user.lastSignIn ? user.lastSignIn.toISOString() : null,
      }
    })

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

