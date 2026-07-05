import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import {
  CHECKOUT_STABLECOINS,
  getCheckoutPlanSummary,
  getCreditPackSummary,
  isCheckoutPlanId,
  isCreditPackId,
} from "@/lib/checkout/catalog"
import { CHECKOUT_CHAINS, isCheckoutConfigured } from "@/lib/checkout/chains"
import {
  createCheckoutIntent,
  createCreditPackIntent,
  expireStaleIntents,
} from "@/lib/checkout/intents"
import { getSessionWithRole } from "@/lib/auth-helpers"
import { getUserWallet } from "@/lib/wallets/service"

export const dynamic = "force-dynamic"

const sharedFields = {
  stablecoin: z.enum(["USDC", "USDT"]),
  chainId: z.enum(["base", "polygon", "ethereum"]),
}

const subscriptionSchema = z.object({
  kind: z.literal("subscription").optional().default("subscription"),
  planId: z.enum(["pro", "team"]),
  billingInterval: z.enum(["monthly", "annual"]),
  ...sharedFields,
})

const creditsSchema = z.object({
  kind: z.literal("credits"),
  creditPackId: z.enum(["pack_250", "pack_500", "pack_1000"]),
  ...sharedFields,
})

const bodySchema = z.union([creditsSchema, subscriptionSchema])

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole()
    if (!session) {
      return NextResponse.json({ error: "Sign in to continue checkout" }, { status: 401 })
    }

    if (!isCheckoutConfigured()) {
      return NextResponse.json(
        { error: "Stablecoin checkout is not configured yet. Contact support." },
        { status: 503 },
      )
    }

    const body = bodySchema.parse(await request.json())
    await expireStaleIntents()

    const savedWallet = await getUserWallet(session.user.id)
    const payerAddress = savedWallet?.address.toLowerCase()

    if (body.kind === "credits") {
      if (!isCreditPackId(body.creditPackId)) {
        return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 })
      }

      const intent = await createCreditPackIntent({
        ownerId: session.user.id,
        creditPackId: body.creditPackId,
        stablecoin: body.stablecoin,
        chainId: body.chainId,
        payerAddress,
      })

      const summary = getCreditPackSummary(body.creditPackId)

      return NextResponse.json({
        intent: {
          id: intent.id,
          kind: intent.kind,
          creditPackId: intent.creditPackId,
          creditsAmount: intent.creditsAmount,
          stablecoin: intent.stablecoin,
          chainId: intent.chainId,
          amountUsd: intent.amountUsd,
          amountDisplay: intent.amountDisplay,
          amountAtomic: intent.amountAtomic,
          treasuryAddress: intent.treasuryAddress,
          tokenAddress: intent.tokenAddress,
          payerAddress: intent.payerAddress,
          status: intent.status,
          expiresAt: intent.expiresAt,
          explorerTxUrl: intent.chain.explorerTxUrl,
          chainLabel: intent.chain.label,
        },
        summary,
        stablecoins: CHECKOUT_STABLECOINS,
      })
    }

    if (!isCheckoutPlanId(body.planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const intent = await createCheckoutIntent({
      ownerId: session.user.id,
      planId: body.planId,
      billingInterval: body.billingInterval,
      stablecoin: body.stablecoin,
      chainId: body.chainId,
      payerAddress,
    })

    const summary = getCheckoutPlanSummary(body.planId, body.billingInterval)

    return NextResponse.json({
      intent: {
        id: intent.id,
        kind: intent.kind,
        planId: intent.planId,
        billingInterval: intent.billingInterval,
        stablecoin: intent.stablecoin,
        chainId: intent.chainId,
        amountUsd: intent.amountUsd,
        amountDisplay: intent.amountDisplay,
        amountAtomic: intent.amountAtomic,
        treasuryAddress: intent.treasuryAddress,
        tokenAddress: intent.tokenAddress,
        payerAddress: intent.payerAddress,
        status: intent.status,
        expiresAt: intent.expiresAt,
        explorerTxUrl: intent.chain.explorerTxUrl,
        chainLabel: intent.chain.label,
      },
      summary,
      stablecoins: CHECKOUT_STABLECOINS,
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 })
    }
    console.error("Checkout intent error:", e)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

export async function GET() {
  const chains = Object.values(CHECKOUT_CHAINS).map((chain) => ({
    id: chain.id,
    label: chain.label,
    stablecoins: Object.keys(chain.tokens),
    configured: chain.treasuryAddress !== "0x0000000000000000000000000000000000000001",
  }))

  return NextResponse.json({
    configured: isCheckoutConfigured(),
    stablecoins: CHECKOUT_STABLECOINS,
    chains,
  })
}
