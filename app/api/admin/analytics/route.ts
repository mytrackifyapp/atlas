import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-helpers"
import { getDatabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const db = await getDatabase()

    // Get total users
    const totalUsers = await db.collection("user").countDocuments({})

    // Get users by role
    const usersByRole = await db
      .collection("user")
      .aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Get onboarding completion stats
    const onboardingStats = await db
      .collection("user")
      .aggregate([
        {
          $group: {
            _id: "$onboardingCompleted",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUsers = await db.collection("user").countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Get users created in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newUsersThisWeek = await db.collection("user").countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    })

    // Get signups over time (last 30 days, grouped by day)
    const signupsOverTime = await db
      .collection("user")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray()

    // Get active sessions (users with recent activity)
    const activeSessions = await db.collection("session").countDocuments({
      expiresAt: { $gt: new Date() },
    })

    // Get users by onboarding status
    const completedOnboarding = onboardingStats.find((stat) => stat._id === true)?.count || 0
    const pendingOnboarding = onboardingStats.find((stat) => stat._id === false || stat._id === null)?.count || 0

    // Format role stats
    const roleStats = usersByRole.reduce(
      (acc, stat) => {
        acc[stat._id || "none"] = stat.count
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      success: true,
      analytics: {
        totalUsers,
        newUsersThisWeek,
        recentUsers,
        activeSessions,
        usersByRole: {
          investor: roleStats.investor || 0,
          founder: roleStats.founder || 0,
          none: roleStats.none || 0,
        },
        onboarding: {
          completed: completedOnboarding,
          pending: pendingOnboarding,
          completionRate: totalUsers > 0 ? ((completedOnboarding / totalUsers) * 100).toFixed(1) : "0",
        },
        signupsOverTime: signupsOverTime.map((item) => ({
          date: item._id,
          count: item.count,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

