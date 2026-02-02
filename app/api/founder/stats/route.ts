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

    // Get active fundraise for this founder
    const activeFundraise = await db
      .collection("fundraises")
      .findOne({
        userId,
        status: "active",
      })

    // Get all fundraises for this founder
    const allFundraises = await db
      .collection("fundraises")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    // Get investor interests
    const investorInterests = await db
      .collection("investor_interests")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Get company metrics (revenue, expenses, cash flow)
    const companyMetrics = await db
      .collection("company_metrics")
      .find({ userId })
      .sort({ month: -1 })
      .limit(6)
      .toArray()

    // Calculate KPIs from metrics
    const latestMetric = companyMetrics[0] || null
    const previousMetric = companyMetrics[1] || null

    const monthlyRevenue = latestMetric?.revenue || 0
    const monthlyExpenses = latestMetric?.expenses || 0
    const burnRate = monthlyExpenses
    const cashOnHand = latestMetric?.cash || 0
    const runway = burnRate > 0 ? Math.floor(cashOnHand / burnRate) : 0

    // Calculate revenue growth
    const revenueGrowth = previousMetric && previousMetric.revenue > 0
      ? (((monthlyRevenue - previousMetric.revenue) / previousMetric.revenue) * 100).toFixed(0)
      : "0"

    // Calculate burn rate change
    const burnRateChange = previousMetric && previousMetric.expenses > 0
      ? (((burnRate - previousMetric.expenses) / previousMetric.expenses) * 100).toFixed(0)
      : "0"

    // Get active investors count
    const activeInvestors = await db
      .collection("investor_interests")
      .countDocuments({
        userId,
        status: { $in: ["interested", "reviewing", "due_diligence"] },
      })

    // Get new investors this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const newInvestorsThisMonth = await db
      .collection("investor_interests")
      .countDocuments({
        userId,
        createdAt: { $gte: thisMonth },
      })

    // Prepare revenue and expenses data for chart (last 6 months)
    const revenueData = companyMetrics
      .slice()
      .reverse()
      .map((metric) => ({
        month: metric.month || "Unknown",
        revenue: metric.revenue || 0,
        expenses: metric.expenses || 0,
      }))

    // Fill in missing months if needed
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const now = new Date()
    const filledRevenueData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthNames[date.getMonth()]
      const existing = revenueData.find((d) => d.month === monthName)
      filledRevenueData.push(
        existing || {
          month: monthName,
          revenue: 0,
          expenses: 0,
        }
      )
    }

    // Prepare cash flow data
    const cashFlowData = companyMetrics
      .slice()
      .reverse()
      .map((metric) => ({
        month: metric.month || "Unknown",
        cash: metric.cash || 0,
      }))

    // Fill in missing months for cash flow
    const filledCashFlowData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthNames[date.getMonth()]
      const existing = cashFlowData.find((d) => d.month === monthName)
      filledCashFlowData.push(
        existing || {
          month: monthName,
          cash: 0,
        }
      )
    }

    // Transform investor interests
    const transformedInvestorInterests = investorInterests.map((interest) => {
      const createdAt = interest.createdAt ? new Date(interest.createdAt) : new Date()
      const now = new Date()
      const daysAgo = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

      let dateText = ""
      if (daysAgo === 0) {
        dateText = "Today"
      } else if (daysAgo === 1) {
        dateText = "1 day ago"
      } else if (daysAgo < 7) {
        dateText = `${daysAgo} days ago`
      } else {
        const weeksAgo = Math.floor(daysAgo / 7)
        dateText = `${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`
      }

      return {
        name: interest.investorName || "Unknown Investor",
        status: interest.status || "Interested",
        date: dateText,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          monthlyRevenue: {
            value: `$${(monthlyRevenue / 1000).toFixed(0)}K`,
            change: `+${revenueGrowth}%`,
            trend: parseFloat(revenueGrowth) >= 0 ? ("up" as const) : ("down" as const),
          },
          burnRate: {
            value: `$${(burnRate / 1000).toFixed(0)}K/mo`,
            change: `+${burnRateChange}%`,
            trend: "up" as const,
          },
          runway: {
            value: `${runway} months`,
            change: "Stable",
            trend: "up" as const,
          },
          activeInvestors: {
            value: activeInvestors.toString(),
            change: `+${newInvestorsThisMonth}`,
            trend: "up" as const,
          },
        },
        currentFundraise: activeFundraise
          ? {
              roundType: activeFundraise.roundType || "Series A",
              target: activeFundraise.targetAmount || 0,
              committed: activeFundraise.committedAmount || 0,
              percentage: activeFundraise.targetAmount
                ? Math.round(((activeFundraise.committedAmount || 0) / activeFundraise.targetAmount) * 100)
                : 0,
              status: activeFundraise.status || "active",
            }
          : null,
        revenueData: filledRevenueData,
        cashFlowData: filledCashFlowData,
        investorInterests: transformedInvestorInterests,
      },
    })
  } catch (error) {
    console.error("Error fetching founder stats:", error)
    return NextResponse.json({ error: "Failed to fetch founder stats" }, { status: 500 })
  }
}

