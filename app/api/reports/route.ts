import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

type ReportListItem = {
  id: string
  title: string
  type: "Quarterly" | "Monthly" | "Annual" | "Company" | "Sector"
  date: string
  status: "Published" | "Draft" | "Archived"
  description: string
}

function formatISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function getQuarterLabel(d: Date) {
  const q = Math.floor(d.getMonth() / 3) + 1
  return `Q${q} ${d.getFullYear()}`
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDatabase()

    // Deal flow deals are scoped by ownerId
    const deals = await db
      .collection("deal_flow_deals")
      .find({ ownerId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    // Portfolio companies are currently global in this app’s schema
    const companies = await db
      .collection("portfolio_companies")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    const now = new Date()
    const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    const quarterLabel = getQuarterLabel(now)

    const uniqueSectors = new Set<string>()
    for (const c of companies) uniqueSectors.add(c.industry || "Unknown")

    const reports: ReportListItem[] = [
      {
        id: `portfolio-${now.getFullYear()}-${quarterLabel.replace(" ", "-").toLowerCase()}`,
        title: `${quarterLabel} Portfolio Performance Report`,
        type: "Quarterly",
        date: formatISODate(now),
        status: "Published",
        description: "Performance summary, sector allocation, and growth trend from your portfolio.",
      },
      {
        id: `dealflow-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
        title: `${monthLabel} Deal Flow Summary`,
        type: "Monthly",
        date: formatISODate(now),
        status: "Published",
        description: "Monthly pipeline volume, status breakdown, and top opportunities by score.",
      },
      {
        id: `sector-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
        title: `Sector Allocation Snapshot (${monthLabel})`,
        type: "Sector",
        date: formatISODate(now),
        status: "Published",
        description: "Allocation by sector based on current portfolio companies.",
      },
      {
        id: `thesis-${now.getFullYear()}`,
        title: `${now.getFullYear()} Investment Thesis (Draft)`,
        type: "Annual",
        date: formatISODate(now),
        status: "Draft",
        description: "A draft thesis template based on your current portfolio + pipeline signals.",
      },
      {
        id: `company-latest`,
        title: `Company Deep Dive: Latest Deal`,
        type: "Company",
        date: formatISODate(now),
        status: "Published",
        description: "A quick profile of your most recently added deal in the pipeline.",
      },
    ]

    const categoryCounts = {
      Quarterly: 1,
      Monthly: 1,
      Company: companies.length,
      Sector: uniqueSectors.size,
      Annual: 1,
    }

    return NextResponse.json({
      success: true,
      data: {
        categoryCounts,
        reports,
        totals: {
          deals: deals.length,
          companies: companies.length,
        },
      },
    })
  } catch (error) {
    console.error("Reports GET error:", error)
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 })
  }
}

