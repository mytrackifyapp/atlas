import { NextRequest, NextResponse } from "next/server"

import { createSalesLeadsBulk } from "@/lib/sales/leads-service"
import type { CreateSalesLeadInput } from "@/lib/sales/types"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as { leads?: CreateSalesLeadInput[] }
    const leads = body.leads ?? []

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: "leads array is required" },
        { status: 400 }
      )
    }

    if (leads.length > 200) {
      return NextResponse.json(
        { error: "Maximum 200 leads per import" },
        { status: 400 }
      )
    }

    const result = await createSalesLeadsBulk(session.user.id, leads)

    return NextResponse.json({
      success: true,
      created: result.created,
      leads: result.leads.map((lead) => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error importing sales leads:", error)
    return NextResponse.json({ error: "Failed to import leads" }, { status: 500 })
  }
}
