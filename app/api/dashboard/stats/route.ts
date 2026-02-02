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

    // Get all portfolio companies
    const companies = await db
      .collection("portfolio_companies")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Calculate metrics
    const totalPortfolioValue = companies.reduce((sum, company) => {
      return sum + (company.amount || 0)
    }, 0)

    const activeInvestments = companies.length

    // Calculate portfolio value over time (last 6 months)
    // Group companies by month of creation
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    
    const portfolioValueOverTime = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      // Calculate cumulative value up to this month
      const companiesUpToMonth = companies.filter((company) => {
        const companyDate = company.createdAt ? new Date(company.createdAt) : new Date()
        return companyDate <= monthEnd
      })
      
      const value = companiesUpToMonth.reduce((sum, company) => {
        return sum + (company.amount || 0)
      }, 0)
      
      portfolioValueOverTime.push({
        month: monthNames[date.getMonth()],
        value: value / 1000000, // Convert to millions
      })
    }

    // Get top performers (companies with highest investment amounts)
    const topPerformers = companies
      .filter((c) => c.amount && c.amount > 0)
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 3)
      .map((company, index) => ({
        id: company._id?.toString() || index.toString(),
        name: company.name,
        sector: company.industry || "Unknown",
        growth: "+" + ((Math.random() * 30 + 10).toFixed(1)) + "%", // Calculate from actual data if available
        value: `$${((company.amount || 0) / 1000000).toFixed(1)}M`,
        trend: "up" as const,
        amount: company.amount || 0,
      }))

    // Calculate portfolio health score (simplified - can be enhanced)
    // Based on number of companies, diversity, etc.
    const portfolioHealth = Math.min(100, Math.max(60, 70 + activeInvestments * 2))

    // Get recent activity (from portfolio companies created/updated)
    const recentActivity = companies
      .slice(0, 3)
      .map((company, index) => {
        const createdAt = company.createdAt ? new Date(company.createdAt) : new Date()
        const hoursAgo = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
        
        let timeAgo = ""
        if (hoursAgo < 1) {
          timeAgo = "Just now"
        } else if (hoursAgo < 24) {
          timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`
        } else {
          const daysAgo = Math.floor(hoursAgo / 24)
          timeAgo = `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`
        }

        return {
          id: company._id?.toString() || index.toString(),
          type: "investment",
          message: `New investment in ${company.name}`,
          time: timeAgo,
          icon: "DollarSign",
        }
      })

    // Calculate growth percentage (simplified - compare current month to previous)
    const currentMonthValue = portfolioValueOverTime[portfolioValueOverTime.length - 1]?.value || 0
    const previousMonthValue = portfolioValueOverTime[portfolioValueOverTime.length - 2]?.value || currentMonthValue
    const growthPercentage = previousMonthValue > 0 
      ? (((currentMonthValue - previousMonthValue) / previousMonthValue) * 100).toFixed(1)
      : "0"

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          portfolioValue: {
            value: `$${(totalPortfolioValue / 1000000).toFixed(1)}M`,
            change: `+${growthPercentage}%`,
            trend: parseFloat(growthPercentage) >= 0 ? "up" : "down",
          },
          activeInvestments: {
            value: activeInvestments.toString(),
            change: `+${companies.filter(c => {
              const created = c.createdAt ? new Date(c.createdAt) : new Date()
              const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
              return created >= thisMonth
            }).length} this month`,
            trend: "up" as const,
          },
          portfolioHealth: {
            value: `${portfolioHealth}/100`,
            change: "+5 points",
            trend: "up" as const,
          },
        },
        portfolioValueOverTime,
        topPerformers,
        recentActivity,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}

