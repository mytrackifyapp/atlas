import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getDatabase } from "@/lib/db"

function formatISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function groupCount<T>(items: T[], keyFn: (t: T) => string) {
  const m = new Map<string, number>()
  for (const it of items) {
    const k = keyFn(it)
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return Array.from(m.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
}

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const db = await getDatabase()

    const deals = await db
      .collection("deal_flow_deals")
      .find({ ownerId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    const companies = await db
      .collection("portfolio_companies")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    const now = new Date()

    let title = "Report"
    let payload: any = {}

    if (id.startsWith("dealflow-")) {
      title = "Deal Flow Summary"
      const statusBreakdown = groupCount(deals, (d: any) => d.status ?? "New")
      const sectorBreakdown = groupCount(deals, (d: any) => d.sector ?? "Unknown")
      const top = [...deals]
        .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 10)
        .map((d: any) => ({
          id: d._id.toString(),
          name: d.name,
          sector: d.sector,
          stage: d.stage,
          status: d.status ?? "New",
          score: d.score ?? 0,
          website: d.website ?? null,
          onboarded: !!d.onboarded,
        }))

      payload = {
        generatedAt: now.toISOString(),
        totals: { deals: deals.length },
        statusBreakdown,
        sectorBreakdown,
        topDealsByScore: top,
      }
    } else if (id.startsWith("portfolio-")) {
      title = "Portfolio Performance"
      const totalInvested = companies.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
      const totalValue = companies.reduce(
        (sum: number, c: any) => sum + (c.amount ? c.amount * 1.5 : 0),
        0
      )
      const unrealized = totalValue - totalInvested
      const roi = totalInvested > 0 ? (unrealized / totalInvested) * 100 : 0

      const sectorAllocation = groupCount(companies, (c: any) => c.industry || "Unknown").map(
        ({ key, count }) => ({
          sector: key,
          companies: count,
        })
      )

      payload = {
        generatedAt: now.toISOString(),
        totals: { companies: companies.length },
        summary: {
          totalInvested,
          estimatedCurrentValue: totalValue,
          unrealizedGains: unrealized,
          roiPercent: Number(roi.toFixed(1)),
        },
        sectorAllocation,
      }
    } else if (id.startsWith("sector-")) {
      title = "Sector Allocation Snapshot"
      const bySector = groupCount(companies, (c: any) => c.industry || "Unknown")
      payload = {
        generatedAt: now.toISOString(),
        totals: { companies: companies.length },
        sectors: bySector,
      }
    } else if (id.startsWith("thesis-")) {
      title = "Investment Thesis (Draft)"
      const topSectorsInPipeline = groupCount(deals, (d: any) => d.sector || "Unknown").slice(0, 5)
      const topSectorsInPortfolio = groupCount(companies, (c: any) => c.industry || "Unknown").slice(0, 5)
      payload = {
        generatedAt: now.toISOString(),
        hypothesis: "Draft: refine this into your firm’s strategy and constraints.",
        signals: {
          pipeline: topSectorsInPipeline,
          portfolio: topSectorsInPortfolio,
        },
        checklist: [
          "Define target check size range and ownership targets",
          "Define preferred stages and geographies",
          "Define sector focus and risk constraints",
          "Define diligence process and IC memo template",
        ],
      }
    } else if (id === "company-latest") {
      title = "Company Deep Dive"
      const latest = deals[0]
      payload = latest
        ? {
            generatedAt: now.toISOString(),
            deal: {
              id: latest._id.toString(),
              name: latest.name,
              tagline: latest.tagline,
              sector: latest.sector,
              stage: latest.stage,
              location: latest.location,
              asking: latest.asking ?? null,
              valuation: latest.valuation ?? null,
              score: latest.score ?? 0,
              status: latest.status ?? "New",
              website: latest.website ?? null,
              onboarded: !!latest.onboarded,
              highlights: latest.highlights ?? [],
              submittedDate: latest.submittedDate ? formatISODate(new Date(latest.submittedDate)) : null,
            },
          }
        : {
            generatedAt: now.toISOString(),
            deal: null,
            note: "No deals found yet. Add a deal in Deal Flow to generate this report.",
          }
    } else {
      return NextResponse.json({ error: "Unknown report id" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      report: {
        id,
        title,
        generatedAt: now.toISOString(),
        payload,
      },
    })
  } catch (error) {
    console.error("Report GET error:", error)
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 })
  }
}

