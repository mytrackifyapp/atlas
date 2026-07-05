import { NextRequest, NextResponse } from "next/server"

import { autoConfirmFundraisePayment } from "@/lib/fundraising/fulfill"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const intentId = request.nextUrl.searchParams.get("intentId")
    if (!intentId) {
      return NextResponse.json({ error: "intentId is required" }, { status: 400 })
    }

    const result = await autoConfirmFundraisePayment({
      intentId,
      payerUserId: session.user.id,
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error("Fundraise invest watch error:", e)
    return NextResponse.json({ status: "pending" as const })
  }
}
