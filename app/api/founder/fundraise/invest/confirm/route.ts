import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { confirmFundraisePayment } from "@/lib/fundraising/fulfill"
import { formatCheckoutWalletError } from "@/lib/checkout/wallet-errors"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  intentId: z.string().uuid(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  payerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = bodySchema.parse(await request.json())
    const result = await confirmFundraisePayment({
      intentId: body.intentId,
      payerUserId: session.user.id,
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
    console.error("Fundraise invest confirm error:", e)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
