import { NextResponse } from "next/server"

import { getSessionWithRole } from "@/lib/auth-helpers"
import {
  getPlatformFeeSummary,
  listPendingSettlementGroups,
  listPlatformFees,
  syncMissingPlatformFeesForFundraise,
} from "@/lib/fundraising/platform-fees"
import { getActiveFundraiseForFounder } from "@/lib/fundraising/service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fundraise = await getActiveFundraiseForFounder(session.user.id)
    if (!fundraise) {
      return NextResponse.json({
        success: true,
        summary: null,
        fees: [],
        settlementGroups: [],
      })
    }

    await syncMissingPlatformFeesForFundraise(fundraise.id, session.user.id)

    const [summary, fees, settlementGroups] = await Promise.all([
      getPlatformFeeSummary(fundraise.id),
      listPlatformFees(fundraise.id),
      listPendingSettlementGroups(fundraise.id),
    ])

    return NextResponse.json({
      success: true,
      summary,
      fees,
      settlementGroups,
    })
  } catch (error) {
    console.error("Error fetching platform fees:", error)
    return NextResponse.json({ error: "Failed to fetch platform fees" }, { status: 500 })
  }
}
