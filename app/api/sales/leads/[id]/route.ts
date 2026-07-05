import { NextRequest, NextResponse } from "next/server"

import {
  deleteSalesLead,
  getSalesLead,
  updateSalesLead,
} from "@/lib/sales/leads-service"
import type { SalesLeadStage } from "@/lib/sales/types"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

function serializeLead(lead: NonNullable<Awaited<ReturnType<typeof getSalesLead>>>) {
  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const lead = await getSalesLead(id, session.user.id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, lead: serializeLead(lead) })
  } catch (error) {
    console.error("Error fetching sales lead:", error)
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = (await request.json()) as {
      name?: string
      company?: string
      email?: string
      phone?: string
      title?: string
      linkedinUrl?: string
      website?: string
      segment?: string
      stage?: SalesLeadStage
      score?: number
      researchSummary?: string
      notes?: string
      lastContact?: string | null
    }

    const lead = await updateSalesLead(id, session.user.id, body)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, lead: serializeLead(lead) })
  } catch (error) {
    console.error("Error updating sales lead:", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const deleted = await deleteSalesLead(id, session.user.id)
    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sales lead:", error)
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 })
  }
}
