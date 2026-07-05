import { NextRequest, NextResponse } from "next/server"

import {
  createSalesLead,
  getSalesPipelineStats,
  listSalesLeads,
} from "@/lib/sales/leads-service"
import type { CreateSalesLeadInput, SalesLeadSource, SalesLeadStage } from "@/lib/sales/types"
import { SALES_LEAD_STAGES } from "@/lib/sales/types"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

function serializeLead(lead: Awaited<ReturnType<typeof listSalesLeads>>[number]) {
  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const stageParam = params.get("stage")
    const stage =
      stageParam && SALES_LEAD_STAGES.includes(stageParam as SalesLeadStage)
        ? (stageParam as SalesLeadStage)
        : undefined

    const [leads, stats] = await Promise.all([
      listSalesLeads(session.user.id, {
        stage,
        segment: params.get("segment") ?? undefined,
        search: params.get("search") ?? undefined,
        limit: params.get("limit") ? Number(params.get("limit")) : undefined,
      }),
      getSalesPipelineStats(session.user.id),
    ])

    return NextResponse.json({
      success: true,
      leads: leads.map(serializeLead),
      stats,
    })
  } catch (error) {
    console.error("Error listing sales leads:", error)
    return NextResponse.json({ error: "Failed to list leads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      name?: string
      company?: string
      email?: string
      phone?: string
      title?: string
      linkedinUrl?: string
      website?: string
      segment?: string
      source?: string
      stage?: SalesLeadStage
      score?: number
      researchSummary?: string
      notes?: string
    }

    if (!body.name?.trim() || !body.company?.trim()) {
      return NextResponse.json(
        { error: "name and company are required" },
        { status: 400 }
      )
    }

    const result = await createSalesLead(session.user.id, {
      name: body.name,
      company: body.company,
      email: body.email,
      phone: body.phone,
      title: body.title,
      linkedinUrl: body.linkedinUrl,
      website: body.website,
      segment: body.segment,
      source: (body.source as SalesLeadSource | undefined) ?? "Manual",
      stage: body.stage,
      score: body.score,
      researchSummary: body.researchSummary,
      notes: body.notes,
    })

    return NextResponse.json({
      success: true,
      lead: serializeLead(result.lead),
      created: result.created,
      matchedOn: result.matchedOn,
    })
  } catch (error) {
    console.error("Error creating sales lead:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create lead" },
      { status: 500 }
    )
  }
}
