import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { confirmCheckoutPayment } from "@/lib/checkout/fulfill"
import { formatCheckoutWalletError } from "@/lib/checkout/wallet-errors"
import { getCheckoutIntent } from "@/lib/checkout/intents"
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
    const result = await confirmCheckoutPayment({
      intentId: body.intentId,
      ownerId: session.user.id,
      txHash: body.txHash,
      payerAddress: body.payerAddress,
    })

    return NextResponse.json({
      success: true,
      alreadyConfirmed: result.alreadyConfirmed,
      intent: result.intent,
      planId: result.intent.planId,
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid confirmation payload" }, { status: 400 })
    }
    const message = formatCheckoutWalletError(e)
    console.error("Checkout confirm error:", e)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

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

    const intent = await getCheckoutIntent(intentId, session.user.id)
    if (!intent) {
      return NextResponse.json({ error: "Checkout session not found" }, { status: 404 })
    }

    return NextResponse.json({ intent })
  } catch (e) {
    console.error("Checkout intent GET error:", e)
    return NextResponse.json({ error: "Failed to load checkout session" }, { status: 500 })
  }
}
