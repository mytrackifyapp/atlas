import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

export const dynamic = "force-dynamic"

type RangeKey = "1m" | "3m" | "6m" | "1y" | "all"

function getMonthsBack(range: RangeKey) {
  if (range === "1m") return 1
  if (range === "3m") return 3
  if (range === "6m") return 6
  if (range === "1y") return 12
  return null
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(d: Date) {
  const m = d.toLocaleDateString("en-US", { month: "short" })
  const yy = String(d.getFullYear()).slice(-2)
  return `${m} '${yy}`
}

function monthSeries(monthsBack: number) {
  const now = new Date()
  const arr: Date[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    arr.push(new Date(now.getFullYear(), now.getMonth() - i, 1))
  }
  return arr
}

function safeDate(value: unknown) {
  if (value instanceof Date) return value
  if (typeof value === "string") {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const range = (request.nextUrl.searchParams.get("range") || "6m") as RangeKey
    const monthsBack = getMonthsBack(range) ?? 6

    const db = await getDatabase()

    const [companies, deals, transactions] = await Promise.all([
      db.collection("portfolio_companies").find({}).sort({ createdAt: 1 }).toArray(),
      db
        .collection("deal_flow_deals")
        .find({ ownerId: session.user.id })
        .sort({ createdAt: 1 })
        .toArray(),
      db
        .collection("finance_transactions")
        .find({ ownerId: session.user.id })
        .sort({ date: 1, createdAt: 1 })
        .toArray(),
    ])

    const months = monthSeries(monthsBack)
    const monthEnds = months.map((m) => new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59, 999))

    // Portfolio performance series (cumulative)
    const portfolioPerformance = months.map((m, idx) => {
      const end = monthEnds[idx]
      const upTo = companies.filter((c: any) => {
        const d = safeDate(c.createdAt) ?? new Date(0)
        return d <= end
      })
      const invested = upTo.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
      const value = upTo.reduce((sum: number, c: any) => sum + (c.amount ? c.amount * 1.5 : 0), 0)
      const roi = invested > 0 ? Math.round(((value - invested) / invested) * 100) : 0
      return { month: monthLabel(m), value, invested, roi }
    })

    // Deal flow series (monthly counts)
    const dealFlowByMonth = new Map<string, { received: number; reviewed: number; invested: number }>()
    for (const m of months) {
      dealFlowByMonth.set(monthKey(m), { received: 0, reviewed: 0, invested: 0 })
    }
    for (const d of deals as any[]) {
      const created = safeDate(d.submittedDate) ?? safeDate(d.createdAt)
      if (!created) continue
      const key = monthKey(new Date(created.getFullYear(), created.getMonth(), 1))
      const bucket = dealFlowByMonth.get(key)
      if (!bucket) continue
      bucket.received += 1
      if (d.status && d.status !== "New") bucket.reviewed += 1
      // Use “Due Diligence” as proxy for “invested/advanced”
      if (d.status === "Due Diligence") bucket.invested += 1
    }
    const dealFlowMetrics = months.map((m) => {
      const b = dealFlowByMonth.get(monthKey(m)) ?? { received: 0, reviewed: 0, invested: 0 }
      return { month: m.toLocaleDateString("en-US", { month: "short" }), ...b }
    })

    // Sector performance from portfolio companies (returns % based on estimated current value)
    const sectorMap = new Map<string, { invested: number; current: number }>()
    for (const c of companies as any[]) {
      const sector = c.industry || "Unknown"
      const invested = c.amount || 0
      const current = c.amount ? c.amount * 1.5 : 0
      const prev = sectorMap.get(sector) ?? { invested: 0, current: 0 }
      sectorMap.set(sector, { invested: prev.invested + invested, current: prev.current + current })
    }
    const sectorPerformance = Array.from(sectorMap.entries())
      .map(([sector, v]) => ({
        sector,
        invested: v.invested,
        returns: v.invested > 0 ? Math.round(((v.current - v.invested) / v.invested) * 100) : 0,
      }))
      .sort((a, b) => (b.invested || 0) - (a.invested || 0))
      .slice(0, 8)

    // Cash flow monthly from finance transactions
    const cashMap = new Map<string, { inflow: number; outflow: number }>()
    for (const m of months) cashMap.set(monthKey(m), { inflow: 0, outflow: 0 })
    for (const t of transactions as any[]) {
      const d = safeDate(t.date) ?? safeDate(t.createdAt)
      if (!d) continue
      const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1))
      const bucket = cashMap.get(key)
      if (!bucket) continue
      const amount = typeof t.amount === "number" ? t.amount : 0
      if (t.direction === "income") bucket.inflow += amount
      if (t.direction === "expense") bucket.outflow += amount
    }
    const cashFlowData = months.map((m) => {
      const b = cashMap.get(monthKey(m)) ?? { inflow: 0, outflow: 0 }
      return { month: m.toLocaleDateString("en-US", { month: "short" }), ...b }
    })

    const totalInvested = companies.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
    const totalValue = companies.reduce((sum: number, c: any) => sum + (c.amount ? c.amount * 1.5 : 0), 0)
    const totalRoi = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0

    const avgDealSize =
      companies.length > 0 ? totalInvested / companies.length : 0

    return NextResponse.json({
      success: true,
      data: {
        range,
        kpis: {
          totalRoiPercent: Number(totalRoi.toFixed(1)),
          irrPercent: Number((totalRoi / 2).toFixed(1)), // placeholder heuristic
          avgDealSize,
          deploymentRatePercent: 68, // placeholder until committed-capital model exists
        },
        portfolioPerformance,
        dealFlowMetrics,
        sectorPerformance,
        cashFlowData,
      },
    })
  } catch (error) {
    console.error("Analytics GET error:", error)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}

