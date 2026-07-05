import { randomUUID } from "crypto"

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSessionWithRole } from "@/lib/auth-helpers"
import { createFundraisePaymentIntent } from "@/lib/fundraising/intents"
import { getFundraiseById } from "@/lib/fundraising/service"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  amountUsd: z.number().positive(),
  stablecoin: z.enum(["USDC", "USDT"]),
  chainId: z.enum(["base", "polygon", "ethereum"]),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: fundraiseId } = await context.params
    const fundraise = await getFundraiseById(fundraiseId)
    if (!fundraise) {
      return NextResponse.json({ error: "Fundraise not found" }, { status: 404 })
    }

    const body = bodySchema.parse(await request.json())
    const session = await getSessionWithRole()
    const payerUserId = session?.user.id ?? `guest:${randomUUID()}`

    const intent = await createFundraisePaymentIntent({
      fundraiseId,
      payerUserId,
      amountUsd: body.amountUsd,
      stablecoin: body.stablecoin,
      chainId: body.chainId,
    })

    return NextResponse.json({
      intent: {
        id: intent.id,
        payerUserId: intent.payerUserId,
        fundraiseId: intent.fundraiseId,
        amountUsd: intent.amountUsd,
        amountDisplay: intent.amountDisplay,
        amountAtomic: intent.amountAtomic,
        stablecoin: intent.stablecoin,
        chainId: intent.chainId,
        treasuryAddress: intent.treasuryAddress,
        tokenAddress: intent.tokenAddress,
        status: intent.status,
        expiresAt: intent.expiresAt,
        chainLabel: intent.chain.label,
        roundType: intent.fundraise.roundType,
      },
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid investment request" }, { status: 400 })
    }
    const message = e instanceof Error ? e.message : "Failed to start investment"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
