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

    // Calculate summary metrics
    const totalInvested = companies.reduce((sum, company) => {
      return sum + (company.amount || 0)
    }, 0)

    const totalPortfolioValue = companies.reduce((sum, company) => {
      // Calculate current value (simplified: assume 1.5x multiplier, or use actual valuation if available)
      const currentValue = company.amount ? company.amount * 1.5 : 0
      return sum + currentValue
    }, 0)

    const unrealizedGains = totalPortfolioValue - totalInvested
    const roi = totalInvested > 0 ? ((unrealizedGains / totalInvested) * 100).toFixed(1) : "0"

    // Count companies by sector/industry
    const sectorCounts: Record<string, number> = {}
    companies.forEach((company) => {
      const sector = company.industry || "Unknown"
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1
    })

    // Calculate sector allocation
    const sectorAllocation = Object.entries(sectorCounts)
      .map(([name, count]) => {
        const sectorCompanies = companies.filter((c) => (c.industry || "Unknown") === name)
        const sectorValue = sectorCompanies.reduce((sum, c) => {
          const currentValue = c.amount ? c.amount * 1.5 : 0
          return sum + currentValue
        }, 0)
        const percentage = totalPortfolioValue > 0 ? Math.round((sectorValue / totalPortfolioValue) * 100) : 0

        return {
          name,
          value: sectorValue,
          percentage,
          count,
        }
      })
      .sort((a, b) => b.value - a.value)

    // Calculate portfolio value over time (last 6 months)
    const now = new Date()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const performanceData = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      // Calculate cumulative value up to this month
      const companiesUpToMonth = companies.filter((company) => {
        const companyDate = company.createdAt ? new Date(company.createdAt) : new Date()
        return companyDate <= monthEnd
      })

      const value = companiesUpToMonth.reduce((sum, company) => {
        const currentValue = company.amount ? company.amount * 1.5 : 0
        return sum + currentValue
      }, 0)

      performanceData.push({
        month: monthNames[date.getMonth()],
        value: value,
      })
    }

    // Calculate growth percentage (month-over-month)
    const currentMonthValue = performanceData[performanceData.length - 1]?.value || 0
    const previousMonthValue = performanceData[performanceData.length - 2]?.value || currentMonthValue
    const growthPercentage =
      previousMonthValue > 0 ? (((currentMonthValue - previousMonthValue) / previousMonthValue) * 100).toFixed(1) : "0"

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalPortfolioValue,
          activeCompanies: companies.length,
          totalInvested,
          unrealizedGains,
          roi,
          growthPercentage,
          uniqueSectors: Object.keys(sectorCounts).length,
          averageInvestment: companies.length > 0 ? totalInvested / companies.length : 0,
        },
        performanceData,
        sectorAllocation,
      },
    })
  } catch (error) {
    console.error("Error fetching portfolio analytics:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio analytics" }, { status: 500 })
  }
}

