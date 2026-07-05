import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createFundraisePaymentIntent } from "@/lib/fundraising/intents"
import { getActiveFundraiseForFounder } from "@/lib/fundraising/service"
import { getSessionWithRole } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  fundraiseId: z.string().min(1),
  amountUsd: z.number().positive(),
  stablecoin: z.enum(["USDC", "USDT"]),
  chainId: z.enum(["base", "polygon", "ethereum"]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Sign in to continue" }, { status: 401 })
    }

    const body = bodySchema.parse(await request.json())
    const intent = await createFundraisePaymentIntent({
      fundraiseId: body.fundraiseId,
      payerUserId: session.user.id,
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
        explorerTxUrl: intent.chain.explorerTxUrl,
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

export async function GET() {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fundraise = await getActiveFundraiseForFounder(session.user.id)
    return NextResponse.json({ fundraise })
  } catch (e) {
    console.error("Fundraise invest GET error:", e)
    return NextResponse.json({ error: "Failed to load fundraise" }, { status: 500 })
  }
}
