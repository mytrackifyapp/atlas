import { NextRequest, NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { getSalesLead } from "@/lib/sales/leads-service"
import {
  createOutreach,
  listOutreach,
} from "@/lib/sales/outreach-service"
import type { OutreachStatus } from "@/lib/sales/types"
import { OUTREACH_STATUSES } from "@/lib/sales/types"

export const dynamic = "force-dynamic"

function serializeOutreach(
  outreach: Awaited<ReturnType<typeof listOutreach>>[number]
) {
  return {
    ...outreach,
    createdAt: outreach.createdAt.toISOString(),
    updatedAt: outreach.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const statusParam = params.get("status")
    const status =
      statusParam && OUTREACH_STATUSES.includes(statusParam as OutreachStatus)
        ? (statusParam as OutreachStatus)
        : undefined

    const items = await listOutreach(session.user.id, {
      leadId: params.get("leadId") ?? undefined,
      status,
      limit: params.get("limit") ? Number(params.get("limit")) : undefined,
    })

    const leadIds = [...new Set(items.map((o) => o.leadId))]
    const leadMap = new Map<string, { name: string; company: string }>()
    await Promise.all(
      leadIds.map(async (leadId) => {
        const lead = await getSalesLead(leadId, session.user.id)
        if (lead) leadMap.set(leadId, { name: lead.name, company: lead.company })
      })
    )

    return NextResponse.json({
      success: true,
      outreach: items.map((o) => ({
        ...serializeOutreach(o),
        leadName: leadMap.get(o.leadId)?.name,
        leadCompany: leadMap.get(o.leadId)?.company,
      })),
    })
  } catch (error) {
    console.error("Error listing outreach:", error)
    return NextResponse.json({ error: "Failed to list outreach" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      leadId?: string
      toEmail?: string
      subject?: string
      body?: string
    }

    if (!body.leadId?.trim() || !body.subject?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "leadId, subject, and body are required" },
        { status: 400 }
      )
    }

    const lead = await getSalesLead(body.leadId, session.user.id)
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const toEmail = body.toEmail?.trim() || lead.email?.trim()
    if (!toEmail) {
      return NextResponse.json(
        { error: "Lead has no email — provide toEmail" },
        { status: 400 }
      )
    }

    const outreach = await createOutreach(session.user.id, {
      leadId: body.leadId,
      toEmail,
      subject: body.subject,
      body: body.body,
      status: "draft",
    })

    return NextResponse.json({
      success: true,
      outreach: {
        ...serializeOutreach(outreach),
        leadName: lead.name,
        leadCompany: lead.company,
      },
    })
  } catch (error) {
    console.error("Error creating outreach:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create outreach" },
      { status: 500 }
    )
  }
}
