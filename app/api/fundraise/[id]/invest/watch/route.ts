import { NextRequest, NextResponse } from "next/server"

import { autoConfirmFundraisePayment } from "@/lib/fundraising/fulfill"

export const dynamic = "force-dynamic"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, _context: RouteContext) {
  try {
    const intentId = request.nextUrl.searchParams.get("intentId")
    const payerUserId = request.nextUrl.searchParams.get("payerUserId")

    if (!intentId || !payerUserId) {
      return NextResponse.json(
        { error: "intentId and payerUserId are required" },
        { status: 400 },
      )
    }

    const result = await autoConfirmFundraisePayment({ intentId, payerUserId })
    return NextResponse.json(result)
  } catch (e) {
    console.error("Public fundraise invest watch error:", e)
    return NextResponse.json({ status: "pending" as const })
  }
}
