import { NextResponse } from "next/server"

import { getActiveFundraiseForFounder, listFundraisePayments } from "@/lib/fundraising/service"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fundraise = await getActiveFundraiseForFounder(session.user.id)
    if (!fundraise) {
      return NextResponse.json({ payments: [] })
    }

    const payments = await listFundraisePayments(fundraise.id)
    return NextResponse.json({ payments })
  } catch (e) {
    console.error("Fundraise payments GET error:", e)
    return NextResponse.json({ error: "Failed to load payments" }, { status: 500 })
  }
}
