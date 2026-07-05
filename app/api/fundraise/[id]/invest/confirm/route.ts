import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { confirmFundraisePayment } from "@/lib/fundraising/fulfill"
import { formatCheckoutWalletError } from "@/lib/checkout/wallet-errors"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  intentId: z.string().uuid(),
  payerUserId: z.string().min(1),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  payerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, _context: RouteContext) {
  try {
    const body = bodySchema.parse(await request.json())
    const result = await confirmFundraisePayment({
      intentId: body.intentId,
      payerUserId: body.payerUserId,
      txHash: body.txHash,
      payerAddress: body.payerAddress,
    })

    return NextResponse.json({
      success: true,
      alreadyConfirmed: result.alreadyConfirmed,
      intent: result.intent,
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid confirmation payload" }, { status: 400 })
    }
    const message = formatCheckoutWalletError(e)
    console.error("Public fundraise invest confirm error:", e)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
